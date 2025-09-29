const { ipcMain } = require('electron');
const Anthropic = require('@anthropic-ai/sdk');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class ClaudeSDKService {
  constructor() {
    this.client = null;
    this.conversationHistory = [];
    this.systemPrompt = `You are Halo, an AI assistant helping users with their tasks.
You have access to file operations, can execute commands, search the web, and help with various productivity tasks.
Be helpful, concise, and proactive in suggesting solutions.`;
    this.currentModel = 'claude-3-5-haiku-20241022'; // Default to Haiku 3.5 for speed and cost
    this.availableModels = [
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fast and cost-effective' },
      { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', description: 'Balanced performance' },
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'High performance' },
      { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', description: 'Very high intelligence' },
      { id: 'claude-opus-4-1-20250805', name: 'Claude Opus 4.1', description: 'Most capable model' }
    ];
    this.setupHandlers();
  }

  initialize(apiKey, savedModel) {
    if (!apiKey) {
      console.warn('No API key provided for Claude SDK');
      this.client = null;
      return false;
    }

    try {
      // Clean the API key (remove any whitespace)
      const cleanApiKey = apiKey.trim();

      this.client = new Anthropic({
        apiKey: cleanApiKey
      });

      // Load saved model preference if available
      if (savedModel && this.availableModels.find(m => m.id === savedModel)) {
        this.currentModel = savedModel;
        console.log(`Claude SDK initialized with model: ${savedModel}`);
      } else {
        console.log(`Claude SDK initialized with default model: ${this.currentModel}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize Claude SDK:', error);
      this.client = null;
      return false;
    }
  }

  // Helper function to estimate tokens (rough approximation)
  estimateTokens(text) {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  setupHandlers() {
    // Chat completion
    ipcMain.handle('claude:chat', async (event, { message, context }) => {
      try {
        if (!this.client) {
          // Return a helpful demo response when SDK is not initialized
          return {
            success: true,
            message: `I understand you're asking: "${message}"\n\nHowever, I'm currently running in demo mode. To enable full AI capabilities:\n\n1. Go to Settings (gear icon in sidebar)\n2. Enter your Anthropic API key\n3. Save and try again\n\nYou can get an API key from: https://console.anthropic.com/`,
            suggestions: [
              'Open Settings',
              'Get API key from Anthropic',
              'Try demo features',
              'Explore the interface'
            ]
          };
        }

        // Add message to history
        this.conversationHistory.push({ role: 'user', content: message });

        // Build messages array with context
        const messages = [
          ...this.conversationHistory.slice(-10) // Keep last 10 messages for context
        ];

        const model = this.currentModel || 'claude-3-5-haiku-20241022';
        const systemPrompt = this.systemPrompt + (context ? `\n\nCurrent context: ${JSON.stringify(context)}` : '');

        // Estimate input tokens
        const inputTokens = this.estimateTokens(
          systemPrompt + messages.map(m => m.content).join(' ')
        );

        const response = await this.client.messages.create({
          model: model,
          max_tokens: 4000,
          system: systemPrompt,
          messages: messages
        });

        const assistantMessage = response.content[0].text;
        this.conversationHistory.push({ role: 'assistant', content: assistantMessage });

        // Estimate output tokens
        const outputTokens = this.estimateTokens(assistantMessage);

        // Track cost via IPC to renderer
        event.sender.send('cost:track', {
          operation: 'chat',
          model: model,
          tokens: {
            input: inputTokens,
            output: outputTokens
          },
          success: true
        });

        return {
          success: true,
          message: assistantMessage,
          suggestions: this.generateSuggestions(message, assistantMessage),
          usage: {
            input: inputTokens,
            output: outputTokens,
            total: inputTokens + outputTokens
          }
        };
      } catch (error) {
        console.error('Chat error:', error);

        // Check if it's an authentication error
        if (error.message && error.message.includes('401')) {
          return {
            success: false,
            error: 'Invalid API key. Please check your API key in Settings and ensure it starts with "sk-ant-api" and is valid.'
          };
        }

        // Check for rate limit
        if (error.message && error.message.includes('429')) {
          return {
            success: false,
            error: 'Rate limit exceeded. Please wait a moment before trying again.'
          };
        }

        return {
          success: false,
          error: `API Error: ${error.message || 'Unknown error occurred'}`
        };
      }
    });

    // Execute command
    ipcMain.handle('claude:executeCommand', async (event, { command, cwd }) => {
      try {
        const options = cwd ? { cwd } : {};
        const { stdout, stderr } = await execAsync(command, options);

        return {
          success: true,
          output: stdout || stderr,
          command
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          output: error.stdout || error.stderr
        };
      }
    });

    // Web search
    ipcMain.handle('claude:webSearch', async (event, { query }) => {
      try {
        // Using DuckDuckGo HTML API for search
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const response = await axios.get(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        // Parse basic results from HTML (simplified)
        const results = this.parseSearchResults(response.data);

        return {
          success: true,
          results: results.slice(0, 5)
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    // File analysis
    ipcMain.handle('claude:analyzeFile', async (event, { filePath }) => {
      try {
        if (!this.client) {
          throw new Error('Claude SDK not initialized');
        }

        const content = await fs.readFile(filePath, 'utf-8');
        const extension = path.extname(filePath);
        const model = this.currentModel || 'claude-3-5-haiku-20241022';
        const systemPrompt = 'You are a code analyst. Analyze this file and provide a brief summary of its purpose, key functions, and any potential improvements.';
        const userContent = `Analyze this ${extension} file:\n\n${content.substring(0, 10000)}`;

        // Estimate input tokens
        const inputTokens = this.estimateTokens(systemPrompt + userContent);

        const response = await this.client.messages.create({
          model: model,
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: userContent
          }]
        });

        const analysisText = response.content[0].text;
        const outputTokens = this.estimateTokens(analysisText);

        // Track cost
        event.sender.send('cost:track', {
          operation: 'file-analysis',
          model: model,
          tokens: {
            input: inputTokens,
            output: outputTokens
          },
          success: true
        });

        return {
          success: true,
          analysis: analysisText,
          fileInfo: {
            path: filePath,
            extension,
            size: content.length
          },
          usage: {
            input: inputTokens,
            output: outputTokens,
            total: inputTokens + outputTokens
          }
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    // Generate code
    ipcMain.handle('claude:generateCode', async (event, { prompt, language }) => {
      try {
        if (!this.client) {
          throw new Error('Claude SDK not initialized');
        }

        const model = this.currentModel || 'claude-3-5-haiku-20241022';
        const systemPrompt = `You are an expert programmer. Generate clean, well-commented ${language || 'code'} based on the user's requirements. Only return the code without explanations.`;

        // Estimate input tokens
        const inputTokens = this.estimateTokens(systemPrompt + prompt);

        const response = await this.client.messages.create({
          model: model,
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: prompt
          }]
        });

        const generatedCode = response.content[0].text;
        const outputTokens = this.estimateTokens(generatedCode);

        // Track cost
        event.sender.send('cost:track', {
          operation: 'code-generation',
          model: model,
          tokens: {
            input: inputTokens,
            output: outputTokens
          },
          success: true
        });

        return {
          success: true,
          code: generatedCode,
          usage: {
            input: inputTokens,
            output: outputTokens,
            total: inputTokens + outputTokens
          }
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    // Task automation
    ipcMain.handle('claude:automateTask', async (event, { task, parameters }) => {
      try {
        if (!this.client) {
          throw new Error('Claude SDK not initialized');
        }

        const model = this.currentModel || 'claude-3-5-haiku-20241022';
        const systemPrompt = 'You are a task automation expert. Break down the task into specific steps and provide executable commands or actions.';
        const userContent = `Automate this task: ${task}\nParameters: ${JSON.stringify(parameters)}`;

        // Estimate input tokens
        const inputTokens = this.estimateTokens(systemPrompt + userContent);

        // Analyze task and generate automation steps
        const response = await this.client.messages.create({
          model: model,
          max_tokens: 2000,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: userContent
          }]
        });

        const explanation = response.content[0].text;
        const outputTokens = this.estimateTokens(explanation);

        // Track cost
        event.sender.send('cost:track', {
          operation: 'task-automation',
          model: model,
          tokens: {
            input: inputTokens,
            output: outputTokens
          },
          success: true
        });

        const steps = this.parseAutomationSteps(explanation);

        // Execute steps if they're commands
        const results = [];
        for (const step of steps) {
          if (step.type === 'command') {
            const result = await execAsync(step.command).catch(err => ({ error: err.message }));
            results.push(result);
          }
        }

        return {
          success: true,
          steps,
          results,
          explanation: explanation,
          usage: {
            input: inputTokens,
            output: outputTokens,
            total: inputTokens + outputTokens
          }
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    // Clear conversation
    ipcMain.handle('claude:clearConversation', async () => {
      this.conversationHistory = [];
      return { success: true };
    });

    // Get conversation history
    ipcMain.handle('claude:getHistory', async () => {
      return {
        success: true,
        history: this.conversationHistory
      };
    });

    // Get available models
    ipcMain.handle('claude:getModels', async () => {
      try {
        // If we have a client, try to fetch from API
        if (this.client) {
          try {
            // Note: The Anthropic SDK doesn't have a direct models.list method yet,
            // so we'll use our predefined list with attempt to validate
            return {
              success: true,
              models: this.availableModels,
              currentModel: this.currentModel
            };
          } catch (error) {
            console.log('Using cached models list');
          }
        }

        // Return cached list
        return {
          success: true,
          models: this.availableModels,
          currentModel: this.currentModel
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          models: this.availableModels,
          currentModel: this.currentModel
        };
      }
    });

    // Set current model
    ipcMain.handle('claude:setModel', async (event, { modelId }) => {
      try {
        const model = this.availableModels.find(m => m.id === modelId);
        if (!model) {
          throw new Error('Invalid model ID');
        }

        this.currentModel = modelId;
        console.log(`Switched to model: ${model.name} (${modelId})`);

        return {
          success: true,
          model: model
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });
  }

  // Method to set model programmatically
  setModel(modelId) {
    const model = this.availableModels.find(m => m.id === modelId);
    if (model) {
      this.currentModel = modelId;
      return true;
    }
    return false;
  }

  generateSuggestions(userMessage, assistantResponse) {
    const suggestions = [];
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = assistantResponse.toLowerCase();

    // Context-aware suggestions based on conversation
    if (lowerMessage.includes('file') || lowerResponse.includes('file')) {
      suggestions.push('Browse project files');
      suggestions.push('Search in files');
    }

    if (lowerMessage.includes('code') || lowerMessage.includes('function')) {
      suggestions.push('Generate unit tests');
      suggestions.push('Refactor this code');
      suggestions.push('Add documentation');
    }

    if (lowerMessage.includes('error') || lowerMessage.includes('bug')) {
      suggestions.push('Debug this issue');
      suggestions.push('Check logs');
      suggestions.push('Run diagnostics');
    }

    if (lowerMessage.includes('deploy') || lowerMessage.includes('build')) {
      suggestions.push('Run build process');
      suggestions.push('Check deployment status');
      suggestions.push('View CI/CD pipeline');
    }

    // Add general suggestions if none were added
    if (suggestions.length === 0) {
      suggestions.push('Explain in more detail');
      suggestions.push('Show an example');
      suggestions.push('What are the alternatives?');
      suggestions.push('Create a task for this');
    }

    return suggestions.slice(0, 4);
  }

  parseSearchResults(html) {
    // Simple regex-based parsing for DuckDuckGo results
    const results = [];
    const linkRegex = /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]*)"[^>]*>([^<]*)</g;
    const snippetRegex = /<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([^<]*)</g;

    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      results.push({
        title: match[2],
        url: match[1],
        snippet: '' // Would need more complex parsing for snippets
      });
    }

    return results;
  }

  parseAutomationSteps(text) {
    const steps = [];
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.trim().startsWith('$') || line.trim().startsWith('`')) {
        // Command line
        const command = line.replace(/[$`]/g, '').trim();
        steps.push({ type: 'command', command });
      } else if (line.trim().match(/^\d+\./)) {
        // Numbered step
        steps.push({ type: 'instruction', text: line.trim() });
      }
    }

    return steps;
  }
}

// Create singleton instance
const claudeSDKService = new ClaudeSDKService();

module.exports = claudeSDKService;
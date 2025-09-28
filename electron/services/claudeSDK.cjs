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
    this.setupHandlers();
  }

  initialize(apiKey) {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    this.client = new Anthropic({
      apiKey: apiKey
    });

    return true;
  }

  setupHandlers() {
    // Chat completion
    ipcMain.handle('claude:chat', async (event, { message, context }) => {
      try {
        if (!this.client) {
          throw new Error('Claude SDK not initialized. Please provide API key.');
        }

        // Add message to history
        this.conversationHistory.push({ role: 'user', content: message });

        // Build messages array with context
        const messages = [
          ...this.conversationHistory.slice(-10) // Keep last 10 messages for context
        ];

        const response = await this.client.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          system: this.systemPrompt + (context ? `\n\nCurrent context: ${JSON.stringify(context)}` : ''),
          messages: messages
        });

        const assistantMessage = response.content[0].text;
        this.conversationHistory.push({ role: 'assistant', content: assistantMessage });

        return {
          success: true,
          message: assistantMessage,
          suggestions: this.generateSuggestions(message, assistantMessage)
        };
      } catch (error) {
        console.error('Chat error:', error);
        return {
          success: false,
          error: error.message
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

        const response = await this.client.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          system: 'You are a code analyst. Analyze this file and provide a brief summary of its purpose, key functions, and any potential improvements.',
          messages: [{
            role: 'user',
            content: `Analyze this ${extension} file:\n\n${content.substring(0, 10000)}` // Limit content size
          }]
        });

        return {
          success: true,
          analysis: response.content[0].text,
          fileInfo: {
            path: filePath,
            extension,
            size: content.length
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

        const response = await this.client.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          system: `You are an expert programmer. Generate clean, well-commented ${language || 'code'} based on the user's requirements. Only return the code without explanations.`,
          messages: [{
            role: 'user',
            content: prompt
          }]
        });

        return {
          success: true,
          code: response.content[0].text
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

        // Analyze task and generate automation steps
        const response = await this.client.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          system: 'You are a task automation expert. Break down the task into specific steps and provide executable commands or actions.',
          messages: [{
            role: 'user',
            content: `Automate this task: ${task}\nParameters: ${JSON.stringify(parameters)}`
          }]
        });

        const steps = this.parseAutomationSteps(response.content[0].text);

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
          explanation: response.content[0].text
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
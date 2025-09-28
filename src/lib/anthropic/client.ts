import Anthropic from '@anthropic-ai/sdk';

export interface SDKConfig {
  provider: 'anthropic' | 'bedrock' | 'vertex' | 'managed';
  apiKey?: string;
  region?: string; // For Bedrock
  projectId?: string; // For Vertex
  model: string;
  maxTokens: number;
  temperature: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  provider: string;
  tier: 'free' | 'pro' | 'enterprise';
  apiKeySource: 'managed' | 'user' | 'team';
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastConnected?: Date;
  errorCount: number;
}

class AnthropicClient {
  private client: Anthropic | null = null;
  private config: SDKConfig;
  private authState: AuthState;
  private usageData = {
    operations: 0,
    tokensUsed: 0,
    estimatedCost: 0,
  };

  constructor() {
    this.config = {
      provider: 'anthropic',
      model: 'claude-3-opus-20240229',
      maxTokens: 4096,
      temperature: 0.7,
    };

    this.authState = {
      isAuthenticated: false,
      provider: 'anthropic',
      tier: 'free',
      apiKeySource: 'managed',
      connectionStatus: 'disconnected',
      errorCount: 0,
    };
  }

  async initialize(apiKey?: string): Promise<void> {
    try {
      this.authState.connectionStatus = 'connecting';

      // Use provided API key or fall back to managed (for free tier)
      const key = apiKey || this.getManagedApiKey();

      if (!key) {
        throw new Error('No API key available');
      }

      this.client = new Anthropic({
        apiKey: key,
        dangerouslyAllowBrowser: true, // For Electron app
      });

      // Test the connection
      await this.testConnection();

      this.authState = {
        ...this.authState,
        isAuthenticated: true,
        connectionStatus: 'connected',
        apiKeySource: apiKey ? 'user' : 'managed',
        lastConnected: new Date(),
        errorCount: 0,
      };
    } catch (error) {
      this.authState.connectionStatus = 'error';
      this.authState.errorCount++;
      throw error;
    }
  }

  private getManagedApiKey(): string | undefined {
    // In production, this would fetch from a secure managed pool
    // For now, this will be provided through the electron backend
    return undefined;
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) return false;

    try {
      // Make a minimal API call to test the connection
      await this.client.messages.create({
        model: this.config.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      });
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async sendMessage(
    message: string,
    context?: any
  ): Promise<Anthropic.Message> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    try {
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      });

      // Track usage
      this.usageData.operations++;
      if (response.usage) {
        this.usageData.tokensUsed += response.usage.input_tokens + response.usage.output_tokens;
        this.usageData.estimatedCost += this.calculateCost(response.usage);
      }

      return response;
    } catch (error) {
      this.authState.errorCount++;
      throw error;
    }
  }

  async streamMessage(
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }

    const stream = await this.client.messages.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      stream: true,
    });

    for await (const messageStreamEvent of stream) {
      if (messageStreamEvent.type === 'content_block_delta') {
        const delta = messageStreamEvent.delta;
        if ('text' in delta) {
          onChunk(delta.text);
        }
      }
    }
  }

  private calculateCost(usage: any): number {
    // Claude 3 Opus pricing (example)
    const inputCost = (usage.input_tokens / 1000) * 0.015;
    const outputCost = (usage.output_tokens / 1000) * 0.075;
    return inputCost + outputCost;
  }

  getAuthState(): AuthState {
    return this.authState;
  }

  getUsageData() {
    return this.usageData;
  }

  disconnect(): void {
    this.client = null;
    this.authState.isAuthenticated = false;
    this.authState.connectionStatus = 'disconnected';
  }
}

// Singleton instance
export const anthropicClient = new AnthropicClient();
export default anthropicClient;
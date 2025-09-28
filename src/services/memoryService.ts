// Memory Service for context retention across sessions
export interface MemoryEntry {
  id: string;
  type: 'conversation' | 'task' | 'project' | 'preference' | 'file' | 'command';
  content: any;
  metadata: {
    timestamp: Date;
    role?: string;
    project?: string;
    tags?: string[];
    importance?: 'low' | 'medium' | 'high';
  };
  expiresAt?: Date;
}

export interface ConversationContext {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  topics: string[];
  entities: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface UserContext {
  role: string;
  preferences: {
    operationMode: 'yolo' | 'careful';
    theme: 'light' | 'dark' | 'auto';
    autoSave: boolean;
    notifications: boolean;
  };
  recentProjects: string[];
  recentFiles: string[];
  frequentTasks: string[];
  workingHours?: { start: string; end: string };
}

class MemoryService {
  private memories: Map<string, MemoryEntry>;
  private conversationHistory: ConversationContext;
  private userContext: UserContext;
  private maxMemorySize = 1000; // Maximum number of memories to store
  private storageKey = 'halo-memory';

  constructor() {
    this.memories = new Map();
    this.conversationHistory = {
      messages: [],
      topics: [],
      entities: []
    };
    this.userContext = {
      role: 'other',
      preferences: {
        operationMode: 'careful',
        theme: 'auto',
        autoSave: true,
        notifications: true
      },
      recentProjects: [],
      recentFiles: [],
      frequentTasks: []
    };
    this.loadFromStorage();
  }

  // Save memory entry
  async saveMemory(entry: Omit<MemoryEntry, 'id'>): Promise<string> {
    const id = this.generateId();
    const memory: MemoryEntry = {
      ...entry,
      id,
      metadata: {
        ...entry.metadata,
        timestamp: new Date()
      }
    };

    this.memories.set(id, memory);

    // Cleanup old memories if limit exceeded
    if (this.memories.size > this.maxMemorySize) {
      this.cleanupOldMemories();
    }

    this.persistToStorage();
    return id;
  }

  // Retrieve memories by type
  getMemoriesByType(type: MemoryEntry['type'], limit = 10): MemoryEntry[] {
    const memories: MemoryEntry[] = [];

    for (const [_, memory] of this.memories) {
      if (memory.type === type) {
        memories.push(memory);
      }
      if (memories.length >= limit) break;
    }

    return memories.sort((a, b) =>
      b.metadata.timestamp.getTime() - a.metadata.timestamp.getTime()
    );
  }

  // Search memories
  searchMemories(query: string): MemoryEntry[] {
    const results: MemoryEntry[] = [];
    const queryLower = query.toLowerCase();

    for (const [_, memory] of this.memories) {
      const contentStr = JSON.stringify(memory.content).toLowerCase();
      const tagsMatch = memory.metadata.tags?.some(tag =>
        tag.toLowerCase().includes(queryLower)
      );

      if (contentStr.includes(queryLower) || tagsMatch) {
        results.push(memory);
      }
    }

    return results.sort((a, b) =>
      b.metadata.timestamp.getTime() - a.metadata.timestamp.getTime()
    );
  }

  // Update conversation context
  updateConversation(message: { role: 'user' | 'assistant'; content: string }) {
    this.conversationHistory.messages.push({
      ...message,
      timestamp: new Date()
    });

    // Keep only last 50 messages
    if (this.conversationHistory.messages.length > 50) {
      this.conversationHistory.messages =
        this.conversationHistory.messages.slice(-50);
    }

    // Extract topics and entities (simplified)
    this.extractTopicsAndEntities(message.content);
    this.persistToStorage();
  }

  // Get conversation summary
  getConversationSummary(lastN = 10): string {
    const recentMessages = this.conversationHistory.messages.slice(-lastN);
    return recentMessages
      .map(m => `${m.role}: ${m.content.substring(0, 100)}...`)
      .join('\n');
  }

  // Update user context
  updateUserContext(updates: Partial<UserContext>) {
    this.userContext = {
      ...this.userContext,
      ...updates
    };
    this.persistToStorage();
  }

  // Get user context
  getUserContext(): UserContext {
    return this.userContext;
  }

  // Add recent project
  addRecentProject(projectName: string) {
    if (!this.userContext.recentProjects.includes(projectName)) {
      this.userContext.recentProjects.unshift(projectName);
      this.userContext.recentProjects = this.userContext.recentProjects.slice(0, 10);
      this.persistToStorage();
    }
  }

  // Add recent file
  addRecentFile(filePath: string) {
    if (!this.userContext.recentFiles.includes(filePath)) {
      this.userContext.recentFiles.unshift(filePath);
      this.userContext.recentFiles = this.userContext.recentFiles.slice(0, 20);
      this.persistToStorage();
    }
  }

  // Track frequent task
  trackFrequentTask(taskType: string) {
    const index = this.userContext.frequentTasks.indexOf(taskType);
    if (index > -1) {
      this.userContext.frequentTasks.splice(index, 1);
    }
    this.userContext.frequentTasks.unshift(taskType);
    this.userContext.frequentTasks = this.userContext.frequentTasks.slice(0, 10);
    this.persistToStorage();
  }

  // Get contextual suggestions based on memory
  getContextualSuggestions(): string[] {
    const suggestions: string[] = [];
    const now = new Date();
    const hour = now.getHours();

    // Time-based suggestions
    if (hour < 10) {
      suggestions.push('Review yesterday\'s progress');
      suggestions.push('Plan today\'s tasks');
    } else if (hour < 14) {
      suggestions.push('Check task progress');
      suggestions.push('Update project status');
    } else if (hour < 18) {
      suggestions.push('Complete pending tasks');
      suggestions.push('Prepare tomorrow\'s agenda');
    } else {
      suggestions.push('Create daily summary');
      suggestions.push('Archive completed work');
    }

    // Recent project suggestions
    if (this.userContext.recentProjects.length > 0) {
      suggestions.push(`Continue working on ${this.userContext.recentProjects[0]}`);
    }

    // Frequent task suggestions
    if (this.userContext.frequentTasks.length > 0) {
      suggestions.push(`${this.userContext.frequentTasks[0]} (frequently used)`);
    }

    // Recent conversation topics
    if (this.conversationHistory.topics.length > 0) {
      suggestions.push(`Continue discussing ${this.conversationHistory.topics[0]}`);
    }

    return suggestions.slice(0, 6);
  }

  // Extract topics and entities from text (simplified implementation)
  private extractTopicsAndEntities(text: string) {
    // Extract potential topics (words longer than 5 characters)
    const words = text.split(/\s+/).filter(w => w.length > 5);
    const newTopics = words.filter(w =>
      !this.conversationHistory.topics.includes(w.toLowerCase())
    );

    this.conversationHistory.topics = [
      ...newTopics.slice(0, 3).map(t => t.toLowerCase()),
      ...this.conversationHistory.topics
    ].slice(0, 20);

    // Extract entities (capitalized words)
    const entities = text.match(/[A-Z][a-z]+/g) || [];
    const newEntities = entities.filter(e =>
      !this.conversationHistory.entities.includes(e)
    );

    this.conversationHistory.entities = [
      ...newEntities.slice(0, 3),
      ...this.conversationHistory.entities
    ].slice(0, 20);
  }

  // Clean up old memories
  private cleanupOldMemories() {
    const entries = Array.from(this.memories.values());
    entries.sort((a, b) =>
      a.metadata.timestamp.getTime() - b.metadata.timestamp.getTime()
    );

    // Remove oldest 20% of memories
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.memories.delete(entries[i].id);
    }

    // Also remove expired memories
    const now = new Date();
    for (const [id, memory] of this.memories) {
      if (memory.expiresAt && memory.expiresAt < now) {
        this.memories.delete(id);
      }
    }
  }

  // Generate unique ID
  private generateId(): string {
    return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Persist to storage
  private persistToStorage() {
    try {
      const data = {
        memories: Array.from(this.memories.entries()),
        conversationHistory: this.conversationHistory,
        userContext: this.userContext
      };

      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      } else if (window.electronAPI) {
        // Use Electron storage for better persistence
        window.electronAPI.savePreferences(data);
      }
    } catch (error) {
      console.error('Failed to persist memory:', error);
    }
  }

  // Load from storage
  private loadFromStorage() {
    try {
      let data = null;

      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          data = JSON.parse(stored);
        }
      }

      if (data) {
        this.memories = new Map(data.memories || []);
        this.conversationHistory = data.conversationHistory || this.conversationHistory;
        this.userContext = data.userContext || this.userContext;

        // Convert date strings back to Date objects
        for (const [_, memory] of this.memories) {
          memory.metadata.timestamp = new Date(memory.metadata.timestamp);
          if (memory.expiresAt) {
            memory.expiresAt = new Date(memory.expiresAt);
          }
        }

        this.conversationHistory.messages.forEach(msg => {
          msg.timestamp = new Date(msg.timestamp);
        });
      }
    } catch (error) {
      console.error('Failed to load memory:', error);
    }
  }

  // Clear all memories
  clearMemories() {
    this.memories.clear();
    this.conversationHistory = {
      messages: [],
      topics: [],
      entities: []
    };
    this.persistToStorage();
  }

  // Export memories
  exportMemories(): string {
    const data = {
      memories: Array.from(this.memories.entries()),
      conversationHistory: this.conversationHistory,
      userContext: this.userContext,
      exportedAt: new Date()
    };
    return JSON.stringify(data, null, 2);
  }

  // Import memories
  importMemories(jsonData: string) {
    try {
      const data = JSON.parse(jsonData);
      this.memories = new Map(data.memories || []);
      this.conversationHistory = data.conversationHistory || this.conversationHistory;
      this.userContext = data.userContext || this.userContext;
      this.persistToStorage();
    } catch (error) {
      console.error('Failed to import memories:', error);
      throw new Error('Invalid memory data format');
    }
  }
}

// Singleton instance
export const memoryService = new MemoryService();
export default memoryService;
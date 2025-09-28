export type UserRole = 'pm' | 'designer' | 'marketing' | 'developer' | 'business' | 'other';

export interface User {
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  progress: number;
  dueDate?: Date;
  status: 'active' | 'completed' | 'blocked';
  tasks: Task[];
  type: 'development' | 'design' | 'marketing' | 'research';
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  action: () => void;
}
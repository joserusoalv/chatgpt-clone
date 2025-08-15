export type Role = 'user' | 'assistant' | 'system' | 'tool';
export interface Message { id: string; role: Role; content: string; createdAt: number; meta?: Record<string, unknown>; }

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  threadId: string;
  isMemoryContext?: boolean;
}

export interface Thread {
  id: string;
  summary: string;
  title: string;
  createdAt: number;
  lastMessageAt: number;
} 
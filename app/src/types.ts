export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  threadId: string;
  isMemoryContext?: boolean;
} 
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  threadId: string;
  isMemoryContext?: boolean;
  imageUri?: string; // local or remote URI for display
  imageBase64?: string; // base64 for sending to server/OpenAI
  imageWidth?: number;
  imageHeight?: number;
}

export interface Thread {
  id: string;
  summary: string;
  title: string;
  createdAt: number;
  lastMessageAt: number;
} 
import { getDatabase } from './database';
import { generateMemorySummary, Message as OpenAIMessage } from './openai';
import { Message as DatabaseMessage } from './database';
import { v4 as uuidv4 } from 'uuid';

type MemoryUpdateCallback = (message: string) => void;
type ProcessingStateCallback = (isProcessing: boolean) => void;

class MemoryService {
  private static instance: MemoryService;
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private isProcessing: boolean = false;
  private updateCallback: MemoryUpdateCallback | null = null;
  private processingStateCallbacks: Set<ProcessingStateCallback> = new Set();
  private updateQueue: DatabaseMessage[] = [];

  private constructor() {}

  public static getInstance(): MemoryService {
    if (!MemoryService.instance) {
      MemoryService.instance = new MemoryService();
    }
    return MemoryService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    
    if (!this.initPromise) {
      this.initPromise = this.initializeInternal();
    }
    
    return this.initPromise;
  }

  private async initializeInternal(): Promise<void> {
    try {
      // Initialize the database
      await getDatabase();
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing memory service:', error);
      this.initPromise = null;
      throw error;
    }
  }

  public async getMemory(): Promise<string | null> {
    await this.initialize();
    const db = await getDatabase();
    const memory = await db.getMemory();
    return memory?.content || null;
  }

  public async updateMemory(content: string): Promise<void> {
    await this.initialize();
    const db = await getDatabase();
    await db.updateMemory(content);
  }

  public async addToMemoryBuffer(message: DatabaseMessage): Promise<void> {
    await this.initialize();
    const db = await getDatabase();
    await db.addToMemoryBuffer(message);
  }

  public async getMemoryBuffer(): Promise<DatabaseMessage[]> {
    await this.initialize();
    const db = await getDatabase();
    return db.getMemoryBuffer();
  }

  public async clearMemoryBuffer(): Promise<void> {
    await this.initialize();
    const db = await getDatabase();
    await db.clearMemoryBuffer();
  }

  public setUpdateCallback(callback: MemoryUpdateCallback) {
    this.updateCallback = callback;
  }

  public addProcessingStateCallback(callback: ProcessingStateCallback) {
    this.processingStateCallbacks.add(callback);
    // Immediately call with current state
    callback(this.isProcessing);
  }

  public removeProcessingStateCallback(callback: ProcessingStateCallback) {
    this.processingStateCallbacks.delete(callback);
  }

  private notifyProcessingState(isProcessing: boolean) {
    this.processingStateCallbacks.forEach(callback => callback(isProcessing));
  }

  public async addMessageToBuffer(message: DatabaseMessage): Promise<void> {
    try {
      await this.addToMemoryBuffer(message);
      await this.checkAndProcessBuffer();
    } catch (error) {
      console.error('Error adding message to buffer:', error);
      throw error;
    }
  }

  private async checkAndProcessBuffer(): Promise<void> {
    if (this.isProcessing) {
      // If we're already processing, just return
      return;
    }

    try {
      const buffer = await this.getMemoryBuffer();
      if (buffer.length >= 6) {
        await this.processBuffer();
      }
    } catch (error) {
      console.error('Error checking buffer:', error);
      throw error;
    }
  }

  private async processBuffer(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.notifyProcessingState(true);

    try {
      // Get current memory
      const currentMemory = await this.getMemory();
      
      // Get buffer messages
      const bufferMessages = await this.getMemoryBuffer();
      
      // Convert database messages to OpenAI messages
      const openAIMessages: OpenAIMessage[] = bufferMessages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text,
        isUser: msg.isUser,
        text: msg.text
      }));

      // Generate new memory summary
      const newMemory = await generateMemorySummary(
        currentMemory || null,
        openAIMessages
      );

      // Update memory
      await this.updateMemory(newMemory);

      // Clear buffer
      await this.clearMemoryBuffer();

      // Process any queued messages
      if (this.updateQueue.length > 0) {
        const queuedMessages = [...this.updateQueue];
        this.updateQueue = [];
        for (const message of queuedMessages) {
          await this.addMessageToBuffer(message);
        }
      }

      // Notify about memory update
      if (this.updateCallback) {
        this.updateCallback('Memory updated with new information from our conversation.');
      }
    } catch (error) {
      console.error('Error processing memory buffer:', error);
      throw error;
    } finally {
      this.isProcessing = false;
      this.notifyProcessingState(false);
    }
  }

  public isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }
}

export const memoryService = MemoryService.getInstance(); 
import { openDatabaseSync, SQLiteDatabase } from 'expo-sqlite';
import { Platform } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChatMessage } from '@/src/types';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  threadId: string;
  isMemoryContext?: boolean;
}

export interface Thread {
  id: string;
  title: string;
  createdAt: number;
  lastMessageAt: number;
}

export interface Memory {
  id: string;
  content: string;
  lastUpdated: number;
}

// Database row type with isUser as number for SQLite storage
type DatabaseMessageRow = Omit<ChatMessage, 'isUser'> & {
  isUser: number;
};

class DatabaseService {
  private static instance: DatabaseService;
  private db: SQLiteDatabase | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private initializationAttempts = 0;
  private readonly MAX_INITIALIZATION_ATTEMPTS = 3;

  protected constructor() {
    if (Platform.OS === "web") {
      throw new Error("SQLite is not supported on web platform");
    }
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
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
      // Check if we've exceeded max initialization attempts
      if (this.initializationAttempts >= this.MAX_INITIALIZATION_ATTEMPTS) {
        console.error('Maximum database initialization attempts reached');
        throw new Error('Failed to initialize database after multiple attempts');
      }
      
      this.initializationAttempts++;
      
      // Check if AsyncStorage is available
      try {
        await AsyncStorage.getItem('test_key');
      } catch (error) {
        console.error('AsyncStorage is not available:', error);
        // Continue anyway, as this might be a temporary issue
      }
      
      // Check if database is already initialized in AsyncStorage
      const isInitialized = await AsyncStorage.getItem('database_initialized');
      
      // Open the database
      this.db = openDatabaseSync('dad.db');
      
      // Initialize the database schema
      await this.initDatabase();
      
      // Mark database as initialized in AsyncStorage
      try {
        await AsyncStorage.setItem('database_initialized', 'true');
      } catch (error) {
        console.warn('Failed to update AsyncStorage initialization flag:', error);
        // Continue anyway, as the database is initialized
      }
      
      this.initialized = true;
      this.initializationAttempts = 0; // Reset attempts on success
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      this.initPromise = null;
      this.initialized = false;
      
      // If this is a critical error, we might need to reset
      if (error instanceof Error && 
          (error.message.includes('no such table') || 
           error.message.includes('database is locked'))) {
        console.warn('Critical database error detected, attempting recovery...');
        await this.attemptRecovery();
      } else {
        throw error;
      }
    }
  }

  private async attemptRecovery(): Promise<void> {
    try {
      // Try to clear AsyncStorage flag
      try {
        await AsyncStorage.removeItem('database_initialized');
      } catch (error) {
        console.warn('Failed to clear AsyncStorage flag during recovery:', error);
      }
      
      // Close the database if it exists
      if (this.db) {
        try {
          // @ts-ignore - closeAsync might not be in the type definition
          await this.db.closeAsync();
        } catch (error) {
          console.warn('Failed to close database during recovery:', error);
        }
        this.db = null;
      }
      
      // Reset state
      this.initialized = false;
      this.initPromise = null;
      
      // Try to initialize again
      await this.initialize();
    } catch (error) {
      console.error('Database recovery failed:', error);
      throw new Error('Database recovery failed: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  private async initDatabase() {
    if (!this.db) throw new Error('Database not initialized');

    try {
      // Create threads table
      await this.db.runAsync(
        `CREATE TABLE IF NOT EXISTS threads (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          createdAt INTEGER NOT NULL,
          lastMessageAt INTEGER NOT NULL
        );`
      );

      // Create messages table with thread reference
      await this.db.runAsync(
        `CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY NOT NULL,
          text TEXT NOT NULL,
          isUser INTEGER NOT NULL,
          timestamp INTEGER NOT NULL,
          threadId TEXT NOT NULL,
          isMemoryContext INTEGER DEFAULT 0,
          FOREIGN KEY (threadId) REFERENCES threads (id)
        );`
      );

      // Create memory table
      await this.db.runAsync(
        `CREATE TABLE IF NOT EXISTS memory (
          id TEXT PRIMARY KEY NOT NULL,
          content TEXT NOT NULL,
          lastUpdated INTEGER NOT NULL
        );`
      );

      // Create memory buffer table
      await this.db.runAsync(
        `CREATE TABLE IF NOT EXISTS memory_buffer (
          id TEXT PRIMARY KEY NOT NULL,
          text TEXT NOT NULL,
          isUser INTEGER NOT NULL,
          timestamp INTEGER NOT NULL,
          threadId TEXT NOT NULL,
          FOREIGN KEY (threadId) REFERENCES threads (id)
        );`
      );

      console.log('Database schema initialized successfully');
    } catch (error) {
      console.error('Error initializing database schema:', error);
      throw error;
    }
  }

  private getDb(): SQLiteDatabase {
    if (!this.db || !this.initialized) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  // Public methods that ensure initialization
  public async createThread(thread: Thread): Promise<void> {
    await this.initialize();
    const db = this.getDb();
    
    // Add retry mechanism for database locking issues
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: Error | null = null;
    
    while (retryCount < maxRetries) {
      try {
        await db.runAsync(
          'INSERT INTO threads (id, title, createdAt, lastMessageAt) VALUES (?, ?, ?, ?)',
          [thread.id, thread.title, thread.createdAt, thread.lastMessageAt]
        );
        return; // Success, exit the function
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if this is a database locking error
        if (lastError.message.includes('database is locked')) {
          retryCount++;
          console.warn(`Database locked, retry ${retryCount}/${maxRetries}`);
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount - 1)));
        } else {
          // If it's not a locking error, throw immediately
          throw error;
        }
      }
    }
    
    // If we've exhausted all retries, throw the last error
    throw new Error(`Failed to create thread after ${maxRetries} retries: ${lastError?.message}`);
  }

  public async getThreads(limit: number = 20): Promise<Thread[]> {
    await this.initialize();
    const db = this.getDb();
    return db.getAllAsync<Thread>(
      'SELECT * FROM threads ORDER BY lastMessageAt DESC LIMIT ?',
      [limit]
    );
  }

  public async saveMessage(message: Message): Promise<void> {
    await this.initialize();
    const db = this.getDb();
    
    // Add retry mechanism for database locking issues
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: Error | null = null;
    
    while (retryCount < maxRetries) {
      try {
        // Update the thread's lastMessageAt timestamp
        await db.runAsync(
          'UPDATE threads SET lastMessageAt = ? WHERE id = ?',
          [message.timestamp, message.threadId]
        );

        // Save the message
        await db.runAsync(
          'INSERT INTO messages (id, text, isUser, timestamp, threadId, isMemoryContext) VALUES (?, ?, ?, ?, ?, ?)',
          [
            message.id, 
            message.text, 
            message.isUser ? 1 : 0, 
            message.timestamp, 
            message.threadId,
            message.isMemoryContext ? 1 : 0
          ]
        );
        
        return; // Success, exit the function
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if this is a database locking error
        if (lastError.message.includes('database is locked')) {
          retryCount++;
          console.warn(`Database locked, retry ${retryCount}/${maxRetries}`);
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount - 1)));
        } else {
          // If it's not a locking error, throw immediately
          console.error('Error saving message:', error);
          throw error;
        }
      }
    }
    
    // If we've exhausted all retries, throw the last error
    throw new Error(`Failed to save message after ${maxRetries} retries: ${lastError?.message}`);
  }

  public async getMessagesForThread(threadId: string, limit: number = 50): Promise<Message[]> {
    await this.initialize();
    const db = this.getDb();
    
    // Add retry mechanism for database locking issues
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: Error | null = null;
    
    while (retryCount < maxRetries) {
      try {
        const rows = await db.getAllAsync<DatabaseMessageRow>(
          'SELECT * FROM messages WHERE threadId = ? ORDER BY timestamp ASC LIMIT ?',
          [threadId, limit]
        );
        
        return rows.map(row => ({
          ...row,
          isUser: row.isUser === 1,
          isMemoryContext: Boolean(row.isMemoryContext)
        }));
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if this is a database locking error
        if (lastError.message.includes('database is locked')) {
          retryCount++;
          console.warn(`Database locked, retry ${retryCount}/${maxRetries}`);
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount - 1)));
        } else {
          // If it's not a locking error, throw immediately
          console.error(`Error getting messages for thread ${threadId}:`, error);
          throw error;
        }
      }
    }
    
    // If we've exhausted all retries, throw the last error
    throw new Error(`Failed to get messages for thread after ${maxRetries} retries: ${lastError?.message}`);
  }

  public async deleteThread(threadId: string): Promise<void> {
    await this.initialize();
    const db = this.getDb();
    try {
      await db.runAsync('DELETE FROM messages WHERE threadId = ?', [threadId]);
      await db.runAsync('DELETE FROM threads WHERE id = ?', [threadId]);
    } catch (error) {
      console.error('Error deleting thread:', error);
      throw error;
    }
  }

  public async deleteAllThreads(): Promise<void> {
    await this.initialize();
    const db = this.getDb();
    // Delete all messages first due to foreign key constraint
    await db.runAsync('DELETE FROM messages', []);
    // Then delete all threads
    await db.runAsync('DELETE FROM threads', []);
  }

  public async getThread(threadId: string): Promise<Thread> {
    await this.initialize();
    const db = this.getDb();
    
    // Add retry mechanism for database locking issues
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: Error | null = null;
    
    while (retryCount < maxRetries) {
      try {
        const thread = await db.getFirstAsync<Thread>(
          'SELECT * FROM threads WHERE id = ?',
          [threadId]
        );
        if (!thread) {
          throw new Error(`Thread with ID ${threadId} not found`);
        }
        return thread;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Check if this is a database locking error
        if (lastError.message.includes('database is locked')) {
          retryCount++;
          console.warn(`Database locked, retry ${retryCount}/${maxRetries}`);
          
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount - 1)));
        } else {
          // If it's not a locking error, throw immediately
          console.error(`Error getting thread ${threadId}:`, error);
          throw error;
        }
      }
    }
    
    // If we've exhausted all retries, throw the last error
    throw new Error(`Failed to get thread after ${maxRetries} retries: ${lastError?.message}`);
  }

  public async updateThreadTitle(threadId: string, title: string): Promise<void> {
    await this.initialize();
    const db = this.getDb();
    await db.runAsync(
      'UPDATE threads SET title = ? WHERE id = ?',
      [title, threadId]
    );
  }

  public async getAllThreads(): Promise<Thread[]> {
    await this.initialize();
    const db = this.getDb();
    return db.getAllAsync<Thread>(
      'SELECT * FROM threads ORDER BY lastMessageAt DESC'
    );
  }

  public async getMemory(): Promise<Memory | null> {
    await this.initialize();
    const db = this.getDb();
    try {
      const memory = await db.getFirstAsync<Memory>(
        'SELECT * FROM memory ORDER BY lastUpdated DESC LIMIT 1'
      );
      return memory || null;
    } catch (error) {
      console.error('Error getting memory:', error);
      throw error;
    }
  }

  public async updateMemory(content: string): Promise<void> {
    await this.initialize();
    const db = this.getDb();
    try {
      const now = Date.now();
      const memory = await this.getMemory();
      
      if (memory) {
        await db.runAsync(
          'UPDATE memory SET content = ?, lastUpdated = ? WHERE id = ?',
          [content, now, memory.id]
        );
      } else {
        await db.runAsync(
          'INSERT INTO memory (id, content, lastUpdated) VALUES (?, ?, ?)',
          [uuidv4(), content, now]
        );
      }
    } catch (error) {
      console.error('Error updating memory:', error);
      throw error;
    }
  }

  public async addToMemoryBuffer(message: Message): Promise<void> {
    await this.initialize();
    const db = this.getDb();
    try {
      await db.runAsync(
        'INSERT INTO memory_buffer (id, text, isUser, timestamp, threadId) VALUES (?, ?, ?, ?, ?)',
        [message.id, message.text, message.isUser ? 1 : 0, message.timestamp, message.threadId]
      );
    } catch (error) {
      console.error('Error adding to memory buffer:', error);
      throw error;
    }
  }

  public async getMemoryBuffer(): Promise<Message[]> {
    await this.initialize();
    const db = this.getDb();
    try {
      const rows = await db.getAllAsync<DatabaseMessageRow>(
        'SELECT * FROM memory_buffer ORDER BY timestamp ASC'
      );
      return rows.map(row => ({
        ...row,
        isUser: Boolean(row.isUser),
      }));
    } catch (error) {
      console.error('Error getting memory buffer:', error);
      throw error;
    }
  }

  public async clearMemoryBuffer(): Promise<void> {
    await this.initialize();
    const db = this.getDb();
    try {
      await db.runAsync('DELETE FROM memory_buffer');
    } catch (error) {
      console.error('Error clearing memory buffer:', error);
      throw error;
    }
  }

  public async deleteMemory(): Promise<void> {
    await this.initialize();
    const db = this.getDb();
    try {
      await db.runAsync('DELETE FROM memory');
    } catch (error) {
      console.error('Error deleting memory:', error);
      throw error;
    }
  }

  public async resetDatabase(): Promise<void> {
    try {
      // Close the database if it exists
      if (this.db) {
        try {
          // @ts-ignore - closeAsync might not be in the type definition
          await this.db.closeAsync();
        } catch (error) {
          console.warn('Failed to close database during reset:', error);
        }
        this.db = null;
      }
      
      // Reset AsyncStorage flag
      try {
        await AsyncStorage.removeItem('database_initialized');
      } catch (error) {
        console.warn('Failed to clear AsyncStorage flag during reset:', error);
      }
      
      // Reset state
      this.initialized = false;
      this.initPromise = null;
      this.initializationAttempts = 0;
      
      // Reinitialize the database
      await this.initialize();
      
      // Now delete all data
      const db = this.getDb();
      await db.runAsync('DELETE FROM memory_buffer');
      await db.runAsync('DELETE FROM memory');
      await db.runAsync('DELETE FROM messages');
      await db.runAsync('DELETE FROM threads');
      
      console.log('Database reset successfully');
    } catch (error) {
      console.error('Error resetting database:', error);
      throw error;
    }
  }
}

// Export the initialized instance getter
export async function getDatabase(): Promise<DatabaseService> {
  try {
    const instance = DatabaseService.getInstance();
    await instance.initialize();
    return instance;
  } catch (error) {
    console.error('Error getting database instance:', error);
    throw error;
  }
}

// Export a singleton instance for backward compatibility
// This will be deprecated in favor of getDatabase()
export const database = DatabaseService.getInstance();

// Helper functions that use the database instance
export async function getAllThreads(): Promise<Thread[]> {
  const db = await getDatabase();
  return db.getAllThreads();
}

export async function createThread(title: string = 'New Chat'): Promise<Thread> {
  const db = await getDatabase();
  const newThread: Thread = {
    id: uuidv4(),
    title,
    createdAt: Date.now(),
    lastMessageAt: Date.now(),
  };

  await db.createThread(newThread);
  return newThread;
}

export async function updateThread(threadId: string, updates: Partial<Thread>): Promise<Thread> {
  const db = await getDatabase();
  const thread = await db.getThread(threadId);
  
  // If we're updating anything that would affect the thread's content,
  // update the lastMessageAt timestamp
  if ('title' in updates) {
    updates.lastMessageAt = Date.now();
  }

  const updatedThread = {
    ...thread,
    ...updates,
  };

  await db.updateThreadTitle(threadId, updatedThread.title);
  
  return updatedThread;
} 
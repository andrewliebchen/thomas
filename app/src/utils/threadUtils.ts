import { v4 as uuidv4 } from 'uuid';
import { getDatabase, Thread } from '@/src/services/database';

/**
 * Creates a new thread and returns its ID
 */
export const createNewThread = async (): Promise<string> => {
  const threadId = uuidv4();
  const now = Date.now();
  
  // Create the thread
  const db = await getDatabase();
  await db.createThread({
    id: threadId,
    title: 'New Chat',
    createdAt: now,
    lastMessageAt: now,
  });
  
  return threadId;
};

/**
 * Loads a thread by ID
 */
export const loadThread = async (threadId: string): Promise<Thread | null> => {
  try {
    const db = await getDatabase();
    const thread = await db.getThread(threadId);
    return thread;
  } catch (error) {
    console.error('Error loading thread:', error);
    return null;
  }
};

/**
 * Updates thread title with the first message
 */
export const updateThreadTitleWithFirstMessage = async (threadId: string, messageText: string): Promise<void> => {
  const db = await getDatabase();
  await db.updateThreadTitle(threadId, messageText);
}; 
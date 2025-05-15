import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '@/src/services/database';
import { Message as OpenAIMessage } from '@/src/services/openai';
import { generateDadResponse } from '@/src/services/openai';
import { ChatMessage } from '@/src/types';
import { ANDREW_CONTEXT } from '@/src/services/prompts/dad';

/**
 * Creates a user message object
 */
export const createUserMessage = (text: string, threadId: string): ChatMessage => {
  return {
    id: uuidv4(),
    text: text.trim(),
    isUser: true,
    timestamp: Date.now(),
    threadId,
  };
};

/**
 * Creates a dad message object
 */
export const createDadMessage = (text: string, threadId: string): ChatMessage => {
  return {
    id: uuidv4(),
    text: text || 'I apologize, but I seem to be having trouble responding right now.',
    isUser: false,
    timestamp: Date.now(),
    threadId,
  };
};

/**
 * Creates an error message object
 */
export const createErrorMessage = (threadId: string): ChatMessage => {
  return {
    id: uuidv4(),
    text: 'I apologize, but I seem to be having trouble connecting right now. Please try again later.',
    isUser: false,
    timestamp: Date.now(),
    threadId,
  };
};

/**
 * Prepares conversation history
 */
export const prepareConversationHistory = async (
  messages: ChatMessage[], 
  currentThreadId: string
): Promise<OpenAIMessage[]> => {
  console.log('🔍 Preparing conversation history...');
  
  // Create a system message with Andrew's current context
  const andrewContextMessage: OpenAIMessage = {
    role: 'system',
    content: `Current information about Andrew:
- Lives in ${ANDREW_CONTEXT.personalInfo.location} with partner ${ANDREW_CONTEXT.personalInfo.currentLife[0].split('with partner ')[1]}
- Has three cats: ${ANDREW_CONTEXT.personalInfo.currentLife[1].split(': ')[1]}
- ${ANDREW_CONTEXT.personalInfo.currentLife[2]}
- ${ANDREW_CONTEXT.personalInfo.currentLife[3]}
- Mental health: ${ANDREW_CONTEXT.mentalHealth.join(', ')}`
  };
  
  // Get conversation history
  const conversationHistory: OpenAIMessage[] = messages.map(msg => ({
    role: msg.isUser ? 'user' : 'assistant',
    content: msg.text,
  }));

  // Add the context message at the start
  return [andrewContextMessage, ...conversationHistory];
};

/**
 * Sends a message and get a response
 */
export const sendMessageAndGetResponse = async (
  userMessage: ChatMessage,
  conversationHistory: OpenAIMessage[]
): Promise<string> => {
  const response = await generateDadResponse(userMessage.text, conversationHistory);
  return response || 'I apologize, but I seem to be having trouble responding right now.';
}; 
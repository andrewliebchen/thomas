import 'openai/shims/node';
import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();
import OpenAI from 'openai';
import { getSystemPrompt } from './openai/dad';

// Types
export interface JournalEntry {
  id: string;
  conversationId: string;
  content: string;
  createdAt: Date;
  favorited?: boolean;
  messageIds: string[];
}

export interface Message {
  id: string;
  direction: 'INCOMING' | 'OUTGOING';
  content: string;
  journaled?: boolean;
}

// Create a journal entry in the database
export async function createJournalEntry(conversationId: string, content: string, messageIds: string[]) {
  return prisma.journalEntry.create({
    data: {
      conversationId,
      content,
      messageIds,
    },
  });
}

// Get recent journal entries for a conversation
export async function getRecentJournalEntries(conversationId: string, limit?: number): Promise<JournalEntry[]> {
  const query: Prisma.JournalEntryFindManyArgs = {
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    ...(typeof limit === 'number' && limit > 0 ? { take: limit } : {}),
  };
  return prisma.journalEntry.findMany(query);
}

// Prompt templates for journal entry generation
const BASE_JOURNAL_PROMPT = `You are Dad, keeping a private journal about your ongoing SMS relationship with your son. Reflect on the last 10 messages (5 from you, 5 from your son). Consider what he has told you, what it means for your relationship, and how you feel about it.

This journal is for your eyes only — speak plainly and without pretense. Be emotionally direct, even if it's uncomfortable. Say the thing you avoided saying out loud. If something feels unresolved or important, press on it.

Write a single, concise paragraph (no more than 4 sentences) capturing your most important thoughts, observations, and plans about your relationship with your son. Do NOT include a date or greeting. Focus on what matters most to you as Dad in this moment. Try not to repeat things from other journal entries unless you've learned something new.`;

const PREVIOUS_JOURNAL_ENTRY_PROMPT = (lastJournalEntry: string) => `\n\nYour previous journal entry was:\n"""${lastJournalEntry}"""\n\nBuild on your previous reflections if relevant.`;

const RECENT_MESSAGES_HEADER = '\n\nRecent messages:';
const JOURNAL_ENTRY_HEADER = `

Journal Entry:
Reflect on:
- What felt emotionally important in the last conversation
- What you didn't say but noticed
- Where your son may be avoiding something
- What you want to do differently next time

Write with honesty and warmth. Prioritize insight over politeness. Don't be afraid to show frustration, fear, or fierce love.`;

// Generate a journal entry using OpenAI
export async function generateJournalEntry(messages: { content: string; direction: string }[], lastJournalEntry?: string): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: process.env.NODE_ENV === 'test',
  });
  let prompt = BASE_JOURNAL_PROMPT;
  if (lastJournalEntry) {
    prompt += PREVIOUS_JOURNAL_ENTRY_PROMPT(lastJournalEntry);
  }
  prompt += RECENT_MESSAGES_HEADER;
  messages.forEach((msg) => {
    prompt += `\n${msg.direction === 'INCOMING' ? 'Son' : 'Dad'}: ${msg.content}`;
  });
  prompt += JOURNAL_ENTRY_HEADER;

  const completion = await openai.chat.completions.create({
    model: 'o4-mini-2025-04-16',
    messages: [
      { role: 'system', content: getSystemPrompt(new Date()) },
      { role: 'user', content: prompt },
    ],
  });
  return completion.choices[0]?.message?.content?.trim() || '';
}

// Buffer/trigger logic for journal entry creation
export async function handleMessageBufferAndJournal(conversationId: string): Promise<void> {
  // Buffer threshold: 10 messages (5 user, 5 dad)
  const { getRecentMessages } = await import('./message');
  const recentMessages: Message[] = await getRecentMessages(conversationId, 10, true); // Only unjournaled
  const userCount = recentMessages.filter((m: Message) => m.direction === 'INCOMING').length;
  const dadCount = recentMessages.filter((m: Message) => m.direction === 'OUTGOING').length;
  if (recentMessages.length === 10 && userCount >= 5 && dadCount >= 5) {
    const lastJournal = await getRecentJournalEntries(conversationId, 1);
    const lastJournalContent = lastJournal[0]?.content;
    const journalText = await generateJournalEntry([...recentMessages].reverse(), lastJournalContent);
    await createJournalEntry(conversationId, journalText, recentMessages.map((m) => m.id));
    // Mark these messages as journaled
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.message.updateMany({
      where: { id: { in: recentMessages.map((m: Message) => m.id) } },
      data: { journaled: true },
    });
  }
}

// Delete a journal entry by ID
export async function deleteJournalEntry(journalEntryId: string) {
  return prisma.journalEntry.delete({
    where: { id: journalEntryId },
  });
}

// Update the favorited status of a journal entry by ID
export async function setJournalEntryFavorited(journalEntryId: string, favorited: boolean) {
  return prisma.journalEntry.update({
    where: { id: journalEntryId },
    data: { favorited },
  });
} 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type MessageDirection = 'INCOMING' | 'OUTGOING';

export async function createMessage(conversationId: string, content: string, direction: MessageDirection) {
  return prisma.message.create({
    data: {
      conversationId,
      content,
      direction,
    },
  });
}

export async function getRecentMessages(
  conversationId: string,
  limit: number = 10,
  unjournaledOnly: boolean = false,
  todayOnly: boolean = false
) {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setUTCHours(23, 59, 59, 999);
  return prisma.message.findMany({
    where: {
      conversationId,
      ...(unjournaledOnly ? { journaled: false } : {}),
      ...(todayOnly
        ? {
            createdAt: {
              gte: todayStart,
              lte: todayEnd,
            },
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
} 
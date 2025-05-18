import { NextRequest, NextResponse } from 'next/server';
import { generateResponse } from '@/services/openai/generateResponse';
import { getOrCreateConversationByUserId } from '@/services/conversation';
import { createMessage } from '@/services/message';
import { PrismaClient } from '@prisma/client';

// Replace hardcoded token with environment variable
const HARDCODED_TOKEN = process.env.CHAT_API_AUTH_TOKEN;
if (!HARDCODED_TOKEN) {
  throw new Error('CHAT_API_AUTH_TOKEN environment variable is not set');
}
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    console.log('[POST /chat] Request received');
    const body = await req.json();
    const { auth_token, message } = body;
    console.log('[POST /chat] Incoming body:', body);

    if (auth_token !== HARDCODED_TOKEN) {
      console.warn('[POST /chat] Invalid auth token:', auth_token, 'Expected:', HARDCODED_TOKEN);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use a fixed user identifier for now
    const userId = 'web-client';
    console.log('[POST /chat] Upserting user:', userId);
    // Ensure user and conversation exist
    const user = await prisma.user.upsert({
      where: { phoneNumber: userId },
      update: {},
      create: { phoneNumber: userId },
    });
    console.log('[POST /chat] User upserted:', user.id);
    const conversation = await getOrCreateConversationByUserId(user.id);
    console.log('[POST /chat] Conversation:', conversation.id);
    // Store the incoming message
    await createMessage(conversation.id, message, 'INCOMING');
    console.log('[POST /chat] Incoming message stored');
    // Generate AI response
    const aiResponse = await generateResponse(message, { from: userId, conversationId: conversation.id });
    console.log('[POST /chat] AI response generated:', aiResponse);
    // Store the AI response as a message
    await createMessage(conversation.id, aiResponse, 'OUTGOING');
    console.log('[POST /chat] AI response stored');
    // Handle buffer/journal logic
    const { handleMessageBufferAndJournal } = await import('@/services/journal');
    await handleMessageBufferAndJournal(conversation.id);
    console.log('[POST /chat] Journal logic handled');
    console.log('[POST /chat] Reply:', aiResponse);
    return NextResponse.json({ reply: aiResponse });
  } catch (error) {
    console.error('[POST /chat] Error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Use a fixed user identifier for now
    const userId = 'web-client';
    // Ensure user and conversation exist
    const user = await prisma.user.upsert({
      where: { phoneNumber: userId },
      update: {},
      create: { phoneNumber: userId },
    });
    const conversation = await getOrCreateConversationByUserId(user.id);

    // Get start and end of today in UTC
    const now = new Date();
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    // Fetch all messages for today
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversation.id,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        direction: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error('[GET /chat] Error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
} 
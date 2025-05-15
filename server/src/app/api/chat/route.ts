import { NextRequest, NextResponse } from 'next/server';
import { generateResponse } from '@/services/openai/generateResponse';
import { getOrCreateConversationByUserId } from '@/services/conversation';
import { createMessage } from '@/services/message';
import { PrismaClient } from '@prisma/client';

const HARDCODED_TOKEN = 'my_hardcoded_token'; // TODO: Replace with env var or config in future
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { auth_token, message } = body;
    console.log('[POST /chat] Incoming:', { auth_token, message });

    if (auth_token !== HARDCODED_TOKEN) {
      console.warn('[POST /chat] Invalid auth token:', auth_token);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use a fixed user identifier for now
    const userId = 'web-client';
    // Ensure user and conversation exist
    const user = await prisma.user.upsert({
      where: { phoneNumber: userId },
      update: {},
      create: { phoneNumber: userId },
    });
    const conversation = await getOrCreateConversationByUserId(user.id);
    // Store the incoming message
    await createMessage(conversation.id, message, 'INCOMING');
    // Generate AI response
    const aiResponse = await generateResponse(message, { from: userId, conversationId: conversation.id });
    // Store the AI response as a message
    await createMessage(conversation.id, aiResponse, 'OUTGOING');
    // Handle buffer/journal logic
    const { handleMessageBufferAndJournal } = await import('@/services/journal');
    await handleMessageBufferAndJournal(conversation.id);
    console.log('[POST /chat] Reply:', aiResponse);
    return NextResponse.json({ reply: aiResponse });
  } catch (error) {
    console.error('[POST /chat] Error:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
} 
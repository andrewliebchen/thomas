import { NextRequest, NextResponse } from 'next/server';
import { deleteJournalEntry, setJournalEntryFavorited } from '@/services/journal';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid journal entry ID' }, { status: 400 });
    }
    await deleteJournalEntry(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Failed to delete journal entry' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const [journalEntries, totalJournalEntries] = await Promise.all([
      prisma.journalEntry.findMany({
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.journalEntry.count(),
    ]);
    return NextResponse.json({ journalEntries, totalJournalEntries });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Failed to fetch journal entries' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, favorited } = await req.json();
    if (!id || typeof id !== 'string' || typeof favorited !== 'boolean') {
      return NextResponse.json({ error: 'Missing or invalid journal entry ID or favorited status' }, { status: 400 });
    }
    const updated = await setJournalEntryFavorited(id, favorited);
    return NextResponse.json({ success: true, journalEntry: updated });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Failed to update journal entry' }, { status: 500 });
  }
} 
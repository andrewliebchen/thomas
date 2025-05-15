import OpenAI from 'openai';
import { getSystemPrompt } from '@/src/services/prompts/dad';

const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

if (!API_KEY) {
  throw new Error('OpenAI API key is not configured. Please check your .env file.');
}

const openai = new OpenAI({
  apiKey: API_KEY,
});

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  isUser?: boolean;
  text?: string;
}

export const generateDadResponse = async (userMessage: string, conversationHistory: Message[] = []) => {
  try {
    // Extract all system messages
    const systemMessages = conversationHistory.filter(m => m.role === 'system');
    const otherMessages = conversationHistory.filter(m => m.role !== 'system');

    const messages: Message[] = [
      { role: 'system', content: getSystemPrompt() },
      ...systemMessages,
      ...otherMessages,
      { role: 'user', content: userMessage },
    ];

    // Log the messages being sent to OpenAI
    console.log('🔍 SENDING TO OPENAI:');
    console.log(`📚 Found ${systemMessages.length} memory context messages`);
    console.log(`💬 Conversation history: ${otherMessages.length} messages`);
    console.log(`📝 User message: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"`);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating Dad response:', error);
    throw error;
  }
};

export const generateSummary = async (text: string): Promise<string> => {
  try {
    const messages: Message[] = [
      { 
        role: 'system', 
        content: `You are creating a list of factoids from conversations between Andrew and his father. Your job is to extract specific, memorable facts and details that help maintain a strong father-son relationship.

FOCUS ON EXTRACTING:
1. Personal Facts:
   - Names of important people, pets, places
   - Specific events or milestones
   - Concrete details about Andrew's life
   - Preferences and dislikes
   - Hobbies and interests

2. Important Updates:
   - Changes in work or living situation
   - New relationships or friendships
   - Health updates
   - Significant life events
   - Future plans or goals

3. Emotional Context:
   - Specific concerns or worries
   - Achievements and proud moments
   - Things that make Andrew happy
   - Areas where he needs support

FORMAT AS FACTOIDS:
• Each fact should be a single, clear statement
• Start each fact with a bullet point (•)
• Group related facts together
• For updates, use format: "UPDATE: [Previous] → [New]"
• Include timestamp for important events
• Keep each factoid concise and specific

Example format:
• Has a cat named Olive who likes to sleep on his desk
• UPDATE (Oct 2023): Moved from Brooklyn to Manhattan
• Enjoys rock climbing at Brooklyn Boulders on weekends
• Currently working on a new app project called "Dad"
• Prefers oat milk in coffee

CRITICAL INSTRUCTIONS:
1. Only include specific, verifiable facts
2. Prioritize new or changed information
3. Remove outdated or superseded information
4. Keep emotional context tied to specific events/situations
5. Format should be easy to scan and reference`
      },
      { role: 'user', content: text },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.3,
      max_tokens: 500,  // Increased for detailed factoids
    });

    return completion.choices[0].message.content || 'Unable to generate summary.';
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
};

export const generateMemorySummary = async (currentMemory: string | null, bufferMessages: Message[]): Promise<string> => {
  try {
    const messages: Message[] = [
      { 
        role: 'system', 
        content: `Your purpose is to maintain a clear understanding of Andrew's life to have better, more meaningful conversations with him. You need to remember important details about his life, feelings, and experiences that he shares, so you can be a more supportive and engaged father.

TASK:
1. Review both the current memory AND Andrew's new messages
2. Create a COMPLETELY NEW memory document that incorporates:
   - Important information from the existing memory
   - New details learned from Andrew's recent messages
3. Focus on extracting information that helps you:
   - Ask meaningful follow-up questions
   - Remember ongoing projects or challenges
   - Show you're listening and engaged
   - Track changes and growth in his life
   - Understand his current circumstances
4. Only include what Andrew has explicitly shared
5. DO NOT add your own interpretations or assumptions

FORMAT:
- Write in first person from Dad's perspective
- Organize information by aspects of Andrew's life
- Use clear, factual statements
- Note when you learned information
- Focus on details that matter for future conversations

Example format:
"From our recent conversations, I've learned more about Andrew's creative work. He told me he's been working on a new sculpture series, spending early mornings in his studio before his design work. This seems to be a significant shift from last month when he was mainly focused on digital projects.

He's been open about his mental health journey. In our last few talks, he shared that his therapy sessions are helping, particularly with managing work stress. He mentioned finding a new meditation technique that works better for him than the previous approach we discussed last summer.

His daily life in San Francisco continues to evolve. Last week, he told me about finding a new coffee shop near his apartment where he likes to work sometimes. He mentioned it helps him separate his design work from his sculpture practice, which was something he was struggling with earlier."

CRITICAL INSTRUCTIONS:
1. This is a COMPLETE REWRITE each time - don't just append new information
2. Incorporate relevant information from the current memory
3. Add new information from recent conversations
4. Only include what Andrew has explicitly shared
5. Organize information to be useful for future conversations
6. Focus on details you might want to ask about later
7. Note significant changes or developments
8. Keep emotional context that helps you be more supportive
9. Maintain a clear timeline of when things were shared`
      },
      { 
        role: 'user', 
        content: `Current Memory:
${currentMemory || 'No existing memory.'}

New Conversation Buffer:
${bufferMessages.map(m => `${m.isUser ? 'Andrew' : 'Dad'}: ${m.text}`).join('\n')}`
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content || 'Unable to generate memory summary.';
  } catch (error) {
    console.error('Error generating memory summary:', error);
    throw error;
  }
};

export const transcribeAudio = async (audioFile: File): Promise<string> => {
  try {
    console.log('Starting audio transcription...');
    console.log('Audio file details:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });
    
    // Create a FormData object to send the audio file
    const formData = new FormData();
    
    // Append the file directly - make sure the file extension matches the MIME type
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append('response_format', 'text');

    console.log('Making direct API request to OpenAI transcription endpoint...');
    // Make a direct API request to OpenAI's transcription endpoint
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: formData,
    });

    console.log('Transcription API response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Transcription API error details:', errorData);
      throw new Error(`Transcription failed: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    console.log('Transcription successful, received text:', data.text);
    return data.text;
  } catch (error) {
    console.error('Error in transcribeAudio:', error);
    throw error;
  }
};

// Helper function to convert AudioBuffer to WAV format
function convertToWav(audioBuffer: AudioBuffer): Promise<Blob> {
  return new Promise((resolve) => {
    const numOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    
    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, audioBuffer.sampleRate, true);
    view.setUint32(28, audioBuffer.sampleRate * 2 * numOfChannels, true);
    view.setUint16(32, numOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);
    
    // Write audio data
    const data = new Float32Array(audioBuffer.length * numOfChannels);
    let offset = 0;
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      data.set(audioBuffer.getChannelData(i), offset);
      offset += audioBuffer.length;
    }
    
    const volume = 1;
    let index = 44;
    for (let i = 0; i < data.length; i++) {
      view.setInt16(index, data[i] * (0x7FFF * volume), true);
      index += 2;
    }
    
    resolve(new Blob([buffer], { type: 'audio/wav' }));
  });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
} 
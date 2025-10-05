import { NextRequest, NextResponse } from 'next/server';

const WORKER_URL = process.env.WORKER_URL || 'https://eco-spirit-worker.phegde9.workers.dev';

interface Recommendation {
  buildingId: number;
  score: number;
  reason: string;
  address: string;
  district: string;
}

interface WorkerResponse {
  sessionId: string;
  response: string;
  recommendations?: Recommendation[];
}

interface ChatRequestBody {
  message: string;
}

function getSessionId(request: NextRequest): string {
  const sessionCookie = request.cookies.get('eco-spirit-session');
  if (sessionCookie?.value) {
    return sessionCookie.value;
  }
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ChatRequestBody;
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const sessionId = getSessionId(request);

    const response = await fetch(`${WORKER_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error('Worker request failed');
    }

    const data = await response.json() as WorkerResponse;

    const nextResponse = NextResponse.json({
      response: data.response,
      recommendations: data.recommendations,
      sessionId: data.sessionId,
    });

    nextResponse.cookies.set('eco-spirit-session', sessionId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return nextResponse;
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', details: error.message },
      { status: 500 }
    );
  }
}
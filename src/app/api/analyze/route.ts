import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SYSTEM_PROMPT, buildUserPrompt, tryParseJSON } from '@/lib/analyzer';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, rateLimitHeaders, getClientIp } from '@/lib/rateLimit';

// Route handler is request-only; never prerender/evaluate at build time.
export const dynamic = 'force-dynamic';

// Lazy singleton — avoid throwing at module import when GROQ_API_KEY is absent (e.g. build time).
let groqClient: Groq | null = null;
function getGroq(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

// Public — guests can analyze too, but the result is only saved to history when logged in.
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Rate limit: 10 LLM analysis requests per minute per IP
  const ip = getClientIp(request);
  const rateLimitResult = checkRateLimit(`analyze:${ip}`, 10, 60_000);
  const rlHeaders = rateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429, headers: rlHeaders },
    );
  }

  try {
    const body = await request.json();
    const { transcript, audioName = 'recording.mp3' } = body as {
      transcript: string;
      audioName?: string;
    };

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return NextResponse.json({ error: 'transcript is required' }, { status: 400, headers: rlHeaders });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const groqStream = await getGroq().chat.completions.create({
            model: 'openai/gpt-oss-120b',
            max_tokens: 4096,
            temperature: 0.1,
            stream: true,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: buildUserPrompt(transcript) },
            ],
          });

          let accumulated = '';
          for await (const chunk of groqStream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) {
              accumulated += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          // Save to DB after full stream — guests get a result but nothing is persisted
          const parsed = tryParseJSON(accumulated);
          if (parsed && userId) {
            await prisma.estimation.create({
              data: {
                audioName,
                transcript,
                userId,
                /* eslint-disable @typescript-eslint/no-explicit-any */
                sow: parsed.sow as any,
                mandayMin: parsed.manday_estimate.min,
                mandayMax: parsed.manday_estimate.max,
                modules: parsed.modules as any,
                assumptions: parsed.assumptions as any,
                /* eslint-enable @typescript-eslint/no-explicit-any */
              },
            }).catch(err => console.error('[analyze/stream] DB save error:', err));
          }
        } catch (err) {
          console.error('[analyze/stream] Error:', err);
          controller.enqueue(encoder.encode('\n__STREAM_ERROR__'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...rlHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[analyze] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500, headers: rlHeaders },
    );
  }
}

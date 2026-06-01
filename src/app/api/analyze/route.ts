import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { SYSTEM_PROMPT, buildUserPrompt, tryParseJSON } from '@/lib/analyzer';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, rateLimitHeaders, getClientIp } from '@/lib/rateLimit';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  // Rate limit: 10 LLM analysis requests per minute per IP
  const ip = getClientIp(request);
  const rl = checkRateLimit(`analyze:${ip}`, 10, 60_000);
  const rlHeaders = rateLimitHeaders(rl);

  if (!rl.allowed) {
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
          const groqStream = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
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

          // Save to DB after full stream
          const parsed = tryParseJSON(accumulated);
          if (parsed) {
            await prisma.estimation.create({
              data: {
                audioName,
                transcript,
                sow: parsed.sow,
                mandayMin: parsed.manday_estimate.min,
                mandayMax: parsed.manday_estimate.max,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                modules: parsed.modules as any,
                assumptions: parsed.assumptions,
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

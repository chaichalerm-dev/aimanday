import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/whisper';
import { checkRateLimit, rateLimitHeaders, getClientIp } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const ALLOWED_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a']);
const MAX_FILE_SIZE_MB = 25;

export async function POST(request: NextRequest) {
  // Rate limit: 10 STT requests per minute per IP
  const ip = getClientIp(request);
  const rateLimitResult = checkRateLimit(`upload:${ip}`, 10, 60_000);
  const headers = rateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      { status: 429, headers },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('audio');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400, headers });
    }

    const ext = '.' + (file.name.split('.').pop() ?? '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: `Invalid file type "${ext}". Allowed: .mp3, .wav, .m4a` },
        { status: 400, headers },
      );
    }

    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > MAX_FILE_SIZE_MB) {
      return NextResponse.json(
        { error: `File too large (${sizeMB.toFixed(1)} MB). Maximum is ${MAX_FILE_SIZE_MB} MB.` },
        { status: 400, headers },
      );
    }

    const transcript = await transcribeAudio(file);
    return NextResponse.json({ transcript }, { headers });
  } catch (error) {
    console.error('[upload] Error:', error);
    return NextResponse.json({ error: 'Speech-to-text processing failed' }, { status: 500, headers });
  }
}

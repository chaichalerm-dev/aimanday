import Groq from 'groq-sdk';

// Lazy singleton — created on first use, not at module import.
// Prevents the SDK from throwing at build time when GROQ_API_KEY is absent.
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

export async function transcribeAudio(audioFile: File): Promise<string> {
  const arrayBuffer = await audioFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Wrap the buffer in a File so the Groq SDK multipart upload works correctly
  const uploadable = new File([buffer], audioFile.name, {
    type: audioFile.type || 'audio/mpeg',
  });

  const transcription = await getGroq().audio.transcriptions.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    file: uploadable as any,
    model: 'whisper-large-v3',
  });

  return transcription.text;
}

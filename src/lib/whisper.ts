import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function transcribeAudio(audioFile: File): Promise<string> {
  const arrayBuffer = await audioFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Wrap the buffer in a File so the Groq SDK multipart upload works correctly
  const uploadable = new File([buffer], audioFile.name, {
    type: audioFile.type || 'audio/mpeg',
  });

  const transcription = await groq.audio.transcriptions.create({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    file: uploadable as any,
    model: 'whisper-large-v3',
  });

  return transcription.text;
}

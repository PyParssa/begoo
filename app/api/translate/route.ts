/**
 * Next.js App Router Route Handler (/api/translate)
 * Ready for deployment to Vercel.
 *
 * Accepts POST requests with:
 * - multipart/form-data (audio Blob/File, sourceLang, targetLang, tone)
 * - or application/json (audioBase64, sourceLang, targetLang, tone)
 */

import { executeTranslation } from '../../../src/services/translatorService';
import { LanguageCode, TranslationTone } from '../../../src/types/translation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let sourceLang: LanguageCode = 'fa';
    let targetLang: LanguageCode = 'en';
    let tone: TranslationTone = 'casual';
    let spokenText: string = '';
    let audioBuffer: Buffer | undefined;
    let audioBase64: string | undefined;
    let mimeType = 'audio/webm';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('audio') as File | null;
      sourceLang = (formData.get('sourceLang') as LanguageCode) || 'fa';
      targetLang = (formData.get('targetLang') as LanguageCode) || 'en';
      tone = (formData.get('tone') as TranslationTone) || 'casual';
      spokenText = (formData.get('spokenText') as string) || (formData.get('transcribedText') as string) || '';

      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        audioBuffer = Buffer.from(arrayBuffer);
        audioBase64 = audioBuffer.toString('base64');
        mimeType = file.type || 'audio/webm';
      }
    } else {
      const body = await req.json().catch(() => ({}));
      sourceLang = (body.sourceLang as LanguageCode) || 'fa';
      targetLang = (body.targetLang as LanguageCode) || 'en';
      tone = (body.tone as TranslationTone) || 'casual';
      spokenText = body.spokenText || body.transcribedText || '';
      audioBase64 = body.audioBase64;
      mimeType = body.mimeType || 'audio/webm';
    }

    // Call the unified backend translation service
    const result = await executeTranslation({
      audioBuffer,
      audioBase64,
      mimeType,
      sourceLang,
      targetLang,
      tone,
      spokenText,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Translation route error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Failed to process translation request',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

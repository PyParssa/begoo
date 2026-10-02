import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { LanguageCode, TranslationTone } from '../types/translation';

export interface TranslateRequestOptions {
  audioBuffer?: Buffer;
  audioBase64?: string;
  mimeType?: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  tone?: TranslationTone;
  transcriptionHint?: string;
  spokenText?: string;
}

export interface TranslateResponsePayload {
  success: boolean;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  originalText: string;
  translatedText: string;
  transliteration?: string;
  tone: TranslationTone;
  audioSuccess: boolean;
  audioBase64?: string;
  latencyMs: number;
  engine: 'gemini-ai' | 'mock-simulation';
  error?: string;
}

function parseSafeJson(rawText: string) {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

function isSilentOrEmpty(text: string) {
  if (!text) return true;
  const t = text.trim().toUpperCase();
  return (
    t === 'EMPTY' ||
    t === 'NO_SPEECH' ||
    t === 'NO SPEECH' ||
    t === '00:00' ||
    t === '...' ||
    t === '.'
  );
}

function getCleanMimeType(rawMime?: string): string {
  if (!rawMime) return 'audio/webm';
  const clean = rawMime.split(';')[0].trim().toLowerCase();
  const valid = [
    'audio/webm',
    'audio/wav',
    'audio/x-wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/ogg',
    'audio/mp4',
    'audio/aac',
  ];
  return valid.includes(clean) ? clean : 'audio/webm';
}

/**
 * Universal multimodal translation handler.
 * Faithfully transcribes and translates the user's actual speech.
 * NO boilerplate scenarios or fake phrases.
 */
export async function executeTranslation(
  options: TranslateRequestOptions
): Promise<TranslateResponsePayload> {
  const startTime = Date.now();
  const { sourceLang, targetLang, tone = 'casual' } = options;

  const apiKey = process.env.GEMINI_API_KEY;
  const hasValidKey = apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 10;

  const srcMeta = SUPPORTED_LANGUAGES[sourceLang] || { name: sourceLang, nativeName: sourceLang };
  const tgtMeta = SUPPORTED_LANGUAGES[targetLang] || { name: targetLang, nativeName: targetLang };

  const isAmiyaneh = tone === 'casual' && (sourceLang === 'fa' || targetLang === 'fa');
  const safeMimeType = getCleanMimeType(options.mimeType);

  let textToTranslate = options.spokenText?.trim() || options.transcriptionHint?.trim() || '';

  // 1. Direct Multimodal Audio Ingestion with Gemini
  if (hasValidKey && !textToTranslate && options.audioBase64 && options.audioBase64.length > 300) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
      });

      const prompt = `Listen to the spoken audio in ${srcMeta.name}.
1. Transcribe the exact words spoken into "originalText". If there is silence, background noise only, or no recognizable human speech, return "EMPTY".
2. Translate what was said into natural, authentic ${tgtMeta.name} in "translatedText".
Tone: ${
        tone === 'casual'
          ? isAmiyaneh
            ? 'Colloquial everyday Iranian Persian (زبان محاوره‌ای / عامیانه) or natural conversational English/target vernacular'
            : 'Casual, warm and conversational'
          : 'Polite, respectful and formal'
      }
3. If helpful, provide phonetic pronunciation in "transliteration" (e.g. Fingilish for Persian, Romaji for Japanese).`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: safeMimeType,
                  data: options.audioBase64,
                },
              },
              { text: prompt },
            ],
          },
        ],
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              originalText: {
                type: Type.STRING,
                description: 'The exact speech transcribed from the audio',
              },
              translatedText: {
                type: Type.STRING,
                description: 'The faithful translated text in the target language',
              },
              transliteration: {
                type: Type.STRING,
                description: 'Phonetic transliteration if applicable',
              },
            },
            required: ['originalText', 'translatedText'],
          },
        },
      });

      const parsed = parseSafeJson(response.text || '{}');
      if (parsed?.originalText && !isSilentOrEmpty(parsed.originalText)) {
        return {
          success: true,
          sourceLang,
          targetLang,
          originalText: parsed.originalText,
          translatedText: parsed.translatedText,
          transliteration: parsed.transliteration || undefined,
          tone,
          audioSuccess: true,
          latencyMs: Date.now() - startTime,
          engine: 'gemini-ai',
        };
      }
    } catch (err: any) {
      console.error('[Gemini API Audio Error]:', err?.message || err);
      // Fall through to dedicated audio transcriber if single-pass failed
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });

        const transcribeRes = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: safeMimeType,
                  data: options.audioBase64,
                },
              },
              {
                text: `Transcribe the speech spoken in ${srcMeta.name}. Return only the exact transcribed words.`,
              },
            ],
          },
        });

        let transcribed = '';
        const parts = transcribeRes.candidates?.[0]?.content?.parts || [];
        for (const p of parts) {
          if ((p as any).audioTranscription?.text) {
            transcribed += (p as any).audioTranscription.text + ' ';
          } else if (p.text) {
            transcribed += p.text + ' ';
          }
        }
        transcribed = transcribed.trim();

        if (transcribed && !isSilentOrEmpty(transcribed)) {
          textToTranslate = transcribed;
        }
      } catch (err: any) {
        console.error('[Gemini API Transcribe Error]:', err?.message || err);
      }
    }
  }

  // 2. Translate Transcribed or Spoken Text
  if (hasValidKey && textToTranslate && !isSilentOrEmpty(textToTranslate)) {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const prompt = `You are an expert bidirectional spoken language interpreter.
Translate the following exact spoken text from ${srcMeta.name} into natural, accurate ${tgtMeta.name}.
Spoken text: "${textToTranslate}"
Tone requirement: ${
      tone === 'casual'
        ? isAmiyaneh
          ? 'Colloquial everyday Iranian Persian (زبان محاوره‌ای / عامیانه) or natural conversational English/target vernacular'
          : 'Casual, warm and conversational'
        : 'Polite, respectful and formal'
    }
Provide a phonetic transliteration if helpful (e.g. Fingilish for Persian, Romaji for Japanese).`;

    const modelsToTry = [
      { name: 'gemini-2.0-flash', thinkingLevel: ThinkingLevel.MINIMAL },
      { name: 'gemini-2.0-flash', thinkingLevel: ThinkingLevel.LOW },
    ];

    for (const m of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: m.name,
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: m.thinkingLevel },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                originalText: {
                  type: Type.STRING,
                  description: 'The exact spoken phrase in the source language',
                },
                translatedText: {
                  type: Type.STRING,
                  description: 'The faithful translated phrase in the target language',
                },
                transliteration: {
                  type: Type.STRING,
                  description: 'Optional phonetic transliteration',
                },
              },
              required: ['originalText', 'translatedText'],
            },
          },
        });

        const raw = response.text || '';
        const parsed = parseSafeJson(raw);

        if (parsed?.translatedText) {
          return {
            success: true,
            sourceLang,
            targetLang,
            originalText: textToTranslate,
            translatedText: parsed.translatedText,
            transliteration: parsed.transliteration || undefined,
            tone,
            audioSuccess: true,
            latencyMs: Date.now() - startTime,
            engine: 'gemini-ai',
          };
        }
      } catch (err: any) {
        console.error(`[Gemini API Text Translation Error with ${m.name}]:`, err?.message || err);
      }
    }
  }

  // 3. If no speech was captured or words could not be recognized
  // DO NOT FABRICATE A RANDOM BOILERPLATE PHRASE
  const isSourceFa = sourceLang === 'fa';
  const isTargetFa = targetLang === 'fa';

  return {
    success: true,
    sourceLang,
    targetLang,
    originalText: isSourceFa
      ? 'صدایی تشخیص داده نشد (لطفاً دوباره صحبت کنید یا تایپ کنید)'
      : '(No speech detected - please speak closer to mic or type)',
    translatedText: isTargetFa
      ? 'صدایی تشخیص داده نشد (لطفاً دوباره صحبت کنید یا تایپ کنید)'
      : '(No speech detected - please speak closer to mic or type)',
    transliteration: undefined,
    tone,
    audioSuccess: false,
    latencyMs: Date.now() - startTime,
    engine: 'gemini-ai',
  };
}

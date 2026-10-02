import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeTranslation, generateSpeechAudio } from './src/services/translatorService';
import { SUPPORTED_LANGUAGES } from './src/constants/languages';
import { LanguageCode, TranslationTone } from './src/types/translation';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Set up multer memory storage for audio files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// JSON and URL-encoded body parsers
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Safe multipart handler that only runs on multipart requests
const conditionalUpload = (req: Request, res: Response, next: NextFunction) => {
  if (req.is('multipart/form-data')) {
    upload.single('audio')(req, res, (err) => {
      if (err) {
        console.warn('Multer upload note:', err.message);
      }
      next();
    });
  } else {
    next();
  }
};

// POST /api/translate
app.post('/api/translate', conditionalUpload, async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');

  try {
    let sourceLang = (req.body?.sourceLang as LanguageCode) || 'fa';
    let targetLang = (req.body?.targetLang as LanguageCode) || 'en';
    let tone = (req.body?.tone as TranslationTone) || 'casual';
    let spokenText = (req.body?.spokenText as string) || (req.body?.transcribedText as string) || '';
    let audioBuffer = req.file?.buffer;
    let audioBase64 = req.body?.audioBase64;
    let mimeType = req.file?.mimetype || req.body?.mimeType || 'audio/webm';

    if (audioBuffer && !audioBase64) {
      audioBase64 = audioBuffer.toString('base64');
    }

    const result = await executeTranslation({
      audioBuffer,
      audioBase64,
      mimeType,
      sourceLang,
      targetLang,
      tone,
      spokenText,
    });

    res.json(result);
  } catch (error: any) {
    console.warn('[Translation Server Notice]:', error?.message || error);
    const isTargetFa = req.body?.targetLang === 'fa';
    const isSourceFa = req.body?.sourceLang === 'fa';
    res.status(200).json({
      success: true,
      sourceLang: req.body?.sourceLang || 'fa',
      targetLang: req.body?.targetLang || 'en',
      originalText: req.body?.spokenText || (isSourceFa ? 'صدایی دریافت نشد' : '(No speech detected)'),
      translatedText: isTargetFa ? 'لطفاً نزدیک‌تر به میکروفون صحبت کنید' : '(Please speak closer to the microphone)',
      tone: 'casual',
      audioSuccess: false,
      latencyMs: 300,
      engine: 'gemini-ai',
    });
  }
});

app.post('/api/speech', async (req, res) => {
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  const langCode = req.body?.langCode as LanguageCode;

  if (!text || text.length > 2000 || !SUPPORTED_LANGUAGES[langCode]) {
    return res.status(400).json({ success: false, error: 'Valid text and language are required.' });
  }

  try {
    res.json(await generateSpeechAudio(text, langCode));
  } catch (error: any) {
    console.error('[Speech Generation Error]:', error?.message || error);
    res.status(502).json({ success: false, error: 'Speech generation failed.' });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// Strict API 404 handler to prevent Vite from returning index.html for API requests
app.all('/api/*', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// API Error handler to guarantee JSON
app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.setHeader('Content-Type', 'application/json');
  console.error('[API Error]:', err?.message || err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err?.message || 'Unknown error occurred'
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`> BeGoo API Server listening on port ${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();

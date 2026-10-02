export type LanguageCode = 
  | 'fa' // Persian / Farsi
  | 'en' // English
  | 'es' // Spanish
  | 'fr' // French
  | 'de' // German
  | 'ar' // Arabic
  | 'tr' // Turkish
  | 'it' // Italian
  | 'ja' // Japanese
  | 'ko' // Korean
  | 'zh'; // Chinese

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  voiceCode?: string;
}

export type TranslationTone = 'formal' | 'casual';

export type TranslationDirection = 'origin-to-target' | 'target-to-origin';

export interface TranslationRecord {
  id: string;
  timestamp: number;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  originalText: string;
  translatedText: string;
  transliteration?: string;
  direction: TranslationDirection;
  tone: TranslationTone;
  audioSuccess: boolean;
  audioBase64?: string;
}

export interface UserPreferences {
  originLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  autoPlayAudio: boolean;
  casualTone: boolean; // Casual/Amiyaneh tone
  hapticFeedback: boolean;
}

export type ActiveTab = 'translate' | 'settings' | 'account';

export type AppState = 'idle' | 'recording' | 'translating' | 'playing' | 'error';

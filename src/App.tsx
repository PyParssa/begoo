import React, { useState, useCallback, useRef } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { TranslateTab } from './components/translate/TranslateTab';
import { SettingsTab } from './components/settings/SettingsTab';
import { AccountTab } from './components/account/AccountTab';
import { LoginPage, AuthUser } from './components/auth/LoginPage';
import { DEFAULT_PREFERENCES, MULTILINGUAL_SCENARIOS, SUPPORTED_LANGUAGES } from './constants/languages';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import { useSpeechPlayer } from './hooks/useSpeechPlayer';
import {
  ActiveTab,
  LanguageCode,
  TranslationDirection,
  TranslationRecord,
  UserPreferences,
} from './types/translation';

const STORAGE_PREFS_KEY = 'begoo_user_preferences_v1';
const STORAGE_LAST_RECORD_KEY = 'begoo_last_record_v1';
const STORAGE_AUTH_USER_KEY = 'begoo_auth_user_v1';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_AUTH_USER_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('translate');

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_PREFS_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return DEFAULT_PREFERENCES;
  });

  const [lastRecord, setLastRecord] = useState<TranslationRecord | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_LAST_RECORD_KEY);
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return null;
  });

  const [translationCount, setTranslationCount] = useState<number>(0);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const activeDirectionRef = useRef<TranslationDirection>('origin-to-target');

  const {
    isRecording,
    audioLevel,
    transcript: liveTranscript,
    permissionState,
    startRecording,
    stopRecording,
  } = useVoiceRecorder();

  const {
    isPlaying: isPlayingAudio,
    currentPlayingId,
    speak,
    stop: stopSpeech,
  } = useSpeechPlayer();

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const swapLanguages = useCallback(() => {
    setPreferences((prev) => {
      const next = {
        ...prev,
        originLanguage: prev.targetLanguage,
        targetLanguage: prev.originLanguage,
      };
      try {
        localStorage.setItem(STORAGE_PREFS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    setLastRecord((prev) => {
      if (!prev) return null;
      const inverted: TranslationRecord = {
        ...prev,
        sourceLang: prev.targetLang,
        targetLang: prev.sourceLang,
        originalText: prev.translatedText,
        translatedText: prev.originalText,
        direction: prev.direction === 'origin-to-target' ? 'target-to-origin' : 'origin-to-target',
      };
      try {
        localStorage.setItem(STORAGE_LAST_RECORD_KEY, JSON.stringify(inverted));
      } catch {
        // ignore
      }
      return inverted;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setLastRecord(null);
    setTranslationCount(0);
    try {
      localStorage.removeItem(STORAGE_LAST_RECORD_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Safe translation request dispatcher with guaranteed JSON parsing
  const sendTranslationRequest = useCallback(
    async (
      audioBlob: Blob | null,
      spokenText: string,
      direction: TranslationDirection
    ) => {
      const sourceLang: LanguageCode =
        direction === 'origin-to-target'
          ? preferences.originLanguage
          : preferences.targetLanguage;

      const targetLang: LanguageCode =
        direction === 'origin-to-target'
          ? preferences.targetLanguage
          : preferences.originLanguage;

      setIsTranslating(true);

      try {
        const formData = new FormData();
        if (audioBlob) {
          formData.append('audio', audioBlob, 'speech.wav');
        }
        if (spokenText) {
          formData.append('spokenText', spokenText);
        }
        formData.append('sourceLang', sourceLang);
        formData.append('targetLang', targetLang);
        formData.append('tone', preferences.casualTone ? 'casual' : 'formal');

        const response = await fetch('/api/translate', {
          method: 'POST',
          body: formData,
        });

        let result: any = null;
        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
          result = await response.json().catch(() => null);
        } else {
          // If non-JSON returned, consume safely as text without throwing JSON syntax error
          await response.text().catch(() => '');
        }

        // If valid translation result obtained from API
        if (result && result.translatedText) {
          const newRecord: TranslationRecord = {
            id: `rec-${Date.now()}`,
            timestamp: Date.now(),
            sourceLang,
            targetLang,
            originalText: result.originalText || spokenText || 'Spoken speech',
            translatedText: result.translatedText,
            transliteration: result.transliteration,
            direction,
            tone: preferences.casualTone ? 'casual' : 'formal',
            audioSuccess: result.audioSuccess ?? true,
            audioBase64: result.audioBase64,
          };

          setLastRecord(newRecord);
          setTranslationCount((c) => c + 1);

          try {
            localStorage.setItem(STORAGE_LAST_RECORD_KEY, JSON.stringify(newRecord));
          } catch {
            // ignore
          }

          if (preferences.autoPlayAudio && newRecord.translatedText) {
            const destinationZoneId =
              direction === 'origin-to-target' ? 'target-zone' : 'origin-zone';

            setTimeout(() => {
              speak(
                newRecord.translatedText,
                targetLang,
                destinationZoneId,
                newRecord.audioBase64,
                newRecord.transliteration
              );
            }, 150);
          }
          return;
        }

        // Friendly fallback without technical server error messages
        const isSrcFa = sourceLang === 'fa';
        const isTgtFa = targetLang === 'fa';
        const fallbackText = spokenText || (isSrcFa ? 'صدایی شنیده نشد' : '(No speech detected - please speak closer to mic)');
        const fallbackTranslation = isTgtFa ? 'لطفاً نزدیک‌تر به میکروفون صحبت کنید' : '(Please speak closer to the microphone)';

        const fallbackRecord: TranslationRecord = {
          id: `rec-${Date.now()}`,
          timestamp: Date.now(),
          sourceLang,
          targetLang,
          originalText: fallbackText,
          translatedText: fallbackTranslation,
          direction,
          tone: preferences.casualTone ? 'casual' : 'formal',
          audioSuccess: false,
        };

        setLastRecord(fallbackRecord);
        setTranslationCount((c) => c + 1);
      } catch {
        const isSrcFa = sourceLang === 'fa';
        const isTgtFa = targetLang === 'fa';
        const fallbackRecord: TranslationRecord = {
          id: `rec-${Date.now()}`,
          timestamp: Date.now(),
          sourceLang,
          targetLang,
          originalText: spokenText || (isSrcFa ? 'صدایی شنیده نشد' : '(No speech detected)'),
          translatedText: isTgtFa ? 'لطفاً دوباره صحبت کنید' : '(Please speak closer to the microphone)',
          direction,
          tone: preferences.casualTone ? 'casual' : 'formal',
          audioSuccess: false,
        };
        setLastRecord(fallbackRecord);
      } finally {
        setIsTranslating(false);
      }
    },
    [preferences, speak]
  );

  const handleStartRecord = useCallback(
    async (direction: TranslationDirection) => {
      activeDirectionRef.current = direction;
      stopSpeech();
      const speakerLangCode =
        direction === 'origin-to-target'
          ? preferences.originLanguage
          : preferences.targetLanguage;
      const voiceCode = SUPPORTED_LANGUAGES[speakerLangCode]?.voiceCode;
      await startRecording(voiceCode);
    },
    [preferences, startRecording, stopSpeech]
  );

  const handleStopRecord = useCallback(
    async (finalDirection?: TranslationDirection) => {
      const direction = finalDirection || activeDirectionRef.current;
      const { audioBlob, transcript } = await stopRecording();
      await sendTranslationRequest(audioBlob, transcript, direction);
    },
    [stopRecording, sendTranslationRequest]
  );

  const handleCustomTextSubmit = useCallback(
    async (text: string, direction: TranslationDirection) => {
      await sendTranslationRequest(null, text, direction);
    },
    [sendTranslationRequest]
  );

  const handleLogin = useCallback((user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  }, []);

  const handleSignOut = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_AUTH_USER_KEY);
    } catch {
      // ignore
    }
  }, []);

  const originLanguage = SUPPORTED_LANGUAGES[preferences.originLanguage] || SUPPORTED_LANGUAGES['fa'];
  const targetLanguage = SUPPORTED_LANGUAGES[preferences.targetLanguage] || SUPPORTED_LANGUAGES['en'];

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <AppLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      originLanguage={originLanguage}
      targetLanguage={targetLanguage}
      onSwapLanguages={swapLanguages}
    >
      {activeTab === 'translate' && (
        <TranslateTab
          originLanguage={originLanguage}
          targetLanguage={targetLanguage}
          lastRecord={lastRecord}
          isRecording={isRecording}
          audioLevel={audioLevel}
          isTranslating={isTranslating}
          isPlayingAudio={isPlayingAudio}
          currentPlayingId={currentPlayingId}
          liveTranscript={liveTranscript}
          permissionState={permissionState}
          onStartRecord={handleStartRecord}
          onStopRecord={handleStopRecord}
          onPlaySpeech={speak}
          onStopSpeech={stopSpeech}
          onSwapLanguages={swapLanguages}
          onCustomTextSubmit={handleCustomTextSubmit}
          casualTone={preferences.casualTone}
        />
      )}

      {activeTab === 'settings' && (
        <SettingsTab
          preferences={preferences}
          onUpdatePreferences={updatePreferences}
          onSwapLanguages={swapLanguages}
        />
      )}

      {activeTab === 'account' && (
        <AccountTab
          user={currentUser}
          onSignOut={handleSignOut}
          translationCount={translationCount}
          onClearHistory={clearHistory}
        />
      )}
    </AppLayout>
  );
}

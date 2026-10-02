import React, { useState, useCallback, useRef, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { AppLayout } from './components/layout/AppLayout';
import { TranslateTab } from './components/translate/TranslateTab';
import { SettingsTab } from './components/settings/SettingsTab';
import { AccountTab } from './components/account/AccountTab';
import { LoginPage } from './components/auth/LoginPage';
import { CryptoPayment } from './components/auth/CryptoPayment';
import { DEFAULT_PREFERENCES, MULTILINGUAL_SCENARIOS, SUPPORTED_LANGUAGES } from './constants/languages';
import { useVoiceRecorder } from './hooks/useVoiceRecorder';
import { useSpeechPlayer } from './hooks/useSpeechPlayer';
import { supabase } from './services/supabaseClient';
import {
  ActiveTab,
  LanguageCode,
  TranslationDirection,
  TranslationRecord,
  UserPreferences,
} from './types/translation';

const STORAGE_PREFS_KEY = 'begoo_user_preferences_v1';
const STORAGE_LAST_RECORD_KEY = 'begoo_last_record_v1';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const checkActiveStatus = async (user: any) => {
      // ADMIN BYPASS
      if (user.email === 'parssamohammadi@gmail.com') {
        setIsActive(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_active')
          .eq('email', user.email)
          .single();
          
        if (data) {
          setIsActive(data.is_active);
        } else {
          // If no profile exists, they aren't active.
          setIsActive(false);
        }
      } catch (err) {
        setIsActive(false);
      }
    };

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        checkActiveStatus(session.user).then(() => setIsLoadingAuth(false));
      } else {
        setIsLoadingAuth(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        setIsLoadingAuth(true);
        checkActiveStatus(session.user).then(() => setIsLoadingAuth(false));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
          await response.text().catch(() => '');
        }

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
          } catch {}

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
      } catch {
        // Handle error gracefully
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

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  const originLanguage = SUPPORTED_LANGUAGES[preferences.originLanguage] || SUPPORTED_LANGUAGES['fa'];
  const targetLanguage = SUPPORTED_LANGUAGES[preferences.targetLanguage] || SUPPORTED_LANGUAGES['en'];

  // Map Supabase user to AccountTab expected prop structure
  const formattedUser = {
    id: currentUser.id,
    name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User',
    email: currentUser.email,
    avatarInitials: (currentUser.email?.[0] || 'U').toUpperCase(),
    role: isActive ? 'pro' : 'standard',
    memberSince: new Date(currentUser.created_at).toLocaleDateString(),
  };

  return (
    <AppLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      originLanguage={originLanguage}
      targetLanguage={targetLanguage}
      onSwapLanguages={swapLanguages}
    >
      {!isActive ? (
        <div className="flex-1 w-full h-full overflow-y-auto bg-slate-50">
          <div className="flex items-center justify-center min-h-full p-4 sm:p-8">
            <div className="max-w-md w-full">
              <div className="flex justify-end mb-3">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
              <CryptoPayment 
                userEmail={currentUser.email} 
                onActivated={() => setIsActive(true)} 
              />
            </div>
          </div>
        </div>
      ) : activeTab === 'translate' ? (
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
      ) : activeTab === 'settings' ? (
        <SettingsTab
          preferences={preferences}
          onUpdatePreferences={updatePreferences}
          onSwapLanguages={swapLanguages}
        />
      ) : (
        <AccountTab
          user={formattedUser}
          onSignOut={handleSignOut}
          translationCount={translationCount}
          onClearHistory={clearHistory}
        />
      )}
    </AppLayout>
  );
}

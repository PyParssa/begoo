import { useCallback, useEffect, useRef, useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { LanguageCode } from '../types/translation';

export function useSpeechPlayer() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const speechCacheRef = useRef(new Map<string, { audioBase64: string; mimeType: string }>());
  const playbackRequestRef = useRef(0);

  // Preload browser voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Stop active speech or audio
  const stop = useCallback(() => {
    playbackRequestRef.current += 1;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentPlayingId(null);
  }, []);

  const speak = useCallback(
    async (
      text: string,
      langCode: LanguageCode,
      identifier: string = 'active',
      audioBase64?: string,
      transliteration?: string
    ) => {
      stop();
      const requestId = playbackRequestRef.current;

      const playBase64Audio = async (base64: string, mimeType: string) => {
        const audio = new Audio(`data:${mimeType};base64,${base64}`);
        audioRef.current = audio;
        setIsPlaying(true);
        setCurrentPlayingId(identifier);

        audio.onended = () => {
          setIsPlaying(false);
          setCurrentPlayingId(null);
        };
        audio.onerror = () => {
          setIsPlaying(false);
          setCurrentPlayingId(null);
        };

        try {
          await audio.play();
          return true;
        } catch {
          setIsPlaying(false);
          setCurrentPlayingId(null);
          return false;
        }
      };

      // If backend provided direct audio stream
      if (audioBase64) {
        if (await playBase64Audio(audioBase64, 'audio/mpeg')) return;
      }

      const cacheKey = `gemini-tts-v2:${langCode}:${text}`;
      try {
        let generatedAudio = speechCacheRef.current.get(cacheKey);
        if (!generatedAudio) {
          const response = await fetch('/api/speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, langCode }),
          });
          if (!response.ok) throw new Error('Speech generation request failed.');

          const result = (await response.json()) as {
            audioBase64?: unknown;
            mimeType?: unknown;
          };
          if (typeof result.audioBase64 !== 'string' || typeof result.mimeType !== 'string') {
            throw new Error('Speech generation returned invalid audio.');
          }

          generatedAudio = { audioBase64: result.audioBase64, mimeType: result.mimeType };
          speechCacheRef.current.set(cacheKey, generatedAudio);
          if (speechCacheRef.current.size > 8) {
            const oldestKey = speechCacheRef.current.keys().next().value;
            if (oldestKey) speechCacheRef.current.delete(oldestKey);
          }
        }

        if (requestId !== playbackRequestRef.current) return;
        if (await playBase64Audio(generatedAudio.audioBase64, generatedAudio.mimeType)) return;
      } catch {
        if (requestId !== playbackRequestRef.current) return;
      }

      // Browser Web Speech API
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          let voices = voicesRef.current;
          if (!voices.length) {
            voices = window.speechSynthesis.getVoices();
            voicesRef.current = voices;
          }

          let textToSpeak = text;
          let voiceLang = SUPPORTED_LANGUAGES[langCode]?.voiceCode || 'en-US';

          // Check if system has a native voice for this language
          const matchingVoice = voices.find(
            (v) =>
              v.lang.toLowerCase().startsWith(langCode) ||
              v.lang.toLowerCase().replace('_', '-').includes(langCode)
          );

          // If language is Persian and system lacks Persian voice, pronounce transliteration so it is intelligible
          if (langCode === 'fa' && !matchingVoice && transliteration) {
            textToSpeak = transliteration;
            voiceLang = 'en-US';
          }

          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.lang = voiceLang;
          utterance.rate = 0.95;
          utterance.pitch = 1.0;

          if (matchingVoice) {
            utterance.voice = matchingVoice;
          }

          utterance.onstart = () => {
            setIsPlaying(true);
            setCurrentPlayingId(identifier);
          };
          utterance.onend = () => {
            setIsPlaying(false);
            setCurrentPlayingId(null);
          };
          utterance.onerror = () => {
            setIsPlaying(false);
            setCurrentPlayingId(null);
          };

          window.speechSynthesis.speak(utterance);
        } catch {
          setIsPlaying(false);
          setCurrentPlayingId(null);
        }
      }
    },
    [stop]
  );

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isPlaying,
    currentPlayingId,
    speak,
    stop,
  };
}

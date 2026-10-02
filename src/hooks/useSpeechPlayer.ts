import { useCallback, useEffect, useRef, useState } from 'react';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { LanguageCode } from '../types/translation';

export function useSpeechPlayer() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

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

      // If backend provided direct audio stream
      if (audioBase64) {
        try {
          const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
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

          await audio.play();
          return;
        } catch {
          // Fallback to SpeechSynthesis
        }
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

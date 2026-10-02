import { useCallback, useRef, useState, useEffect } from 'react';
import { encodeWAV, resampleTo16kHz } from '../utils/wavEncoder';

export interface VoiceRecorderState {
  isRecording: boolean;
  audioLevel: number;
  duration: number;
  error: string | null;
  permissionState: 'idle' | 'prompt' | 'granted' | 'denied';
  transcript: string;
}

export function useVoiceRecorder() {
  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    audioLevel: 0,
    duration: 0,
    error: null,
    permissionState: 'idle',
    transcript: '',
  });

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  const liveTranscriptRef = useRef<string>('');
  const pcmChunksRef = useRef<Float32Array[]>([]);
  const isRecordingRef = useRef<boolean>(false);
  const isInitializingRef = useRef<boolean>(false);
  const initResolverRef = useRef<(() => void) | null>(null);

  const getOrCreateStream = useCallback(async (): Promise<MediaStream | null> => {
    if (streamRef.current && streamRef.current.active) {
      return streamRef.current;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setState((s) => ({
        ...s,
        permissionState: 'denied',
        error: 'Microphone not supported on this browser',
      }));
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      setState((s) => ({ ...s, permissionState: 'granted', error: null }));
      return stream;
    } catch (err: any) {
      const isDenied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
      setState((s) => ({
        ...s,
        permissionState: isDenied ? 'denied' : 'prompt',
        error: isDenied ? 'Microphone permission blocked. Please allow mic access.' : err.message,
      }));
      return null;
    }
  }, []);

  const updateAudioMeter = useCallback(() => {
    if (!analyserRef.current) return;
    const array = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(array);

    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i];
    }
    const average = sum / array.length;
    const normalized = Math.min(1, Math.max(0, average / 90));

    setState((prev) => ({
      ...prev,
      audioLevel: normalized,
      duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
    }));

    animFrameRef.current = requestAnimationFrame(updateAudioMeter);
  }, []);

  const startRecording = useCallback(
    async (langVoiceCode?: string) => {
      pcmChunksRef.current = [];
      liveTranscriptRef.current = '';
      startTimeRef.current = Date.now();
      isRecordingRef.current = true;
      isInitializingRef.current = true;

      setState((s) => ({
        ...s,
        isRecording: true,
        audioLevel: 0.1,
        duration: 0,
        error: null,
        transcript: '',
      }));

      // Start Browser Speech Recognition in parallel
      if (typeof window !== 'undefined') {
        const SpeechRecognition =
          (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          try {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch {
                // ignore
              }
            }
            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = true;
            if (langVoiceCode) {
              rec.lang = langVoiceCode;
            }
            rec.onresult = (event: any) => {
              let finalStr = '';
              for (let i = 0; i < event.results.length; i++) {
                finalStr += event.results[i][0].transcript + ' ';
              }
              const clean = finalStr.trim();
              if (clean) {
                liveTranscriptRef.current = clean;
                setState((s) => ({ ...s, transcript: clean }));
              }
            };
            rec.onerror = () => {
              // ignore recognition errors silently
            };
            rec.start();
            recognitionRef.current = rec;
          } catch {
            // speech recognition fallback
          }
        }
      }

      try {
        const stream = await getOrCreateStream();

        if (!stream) {
          isInitializingRef.current = false;
          if (initResolverRef.current) {
            initResolverRef.current();
            initResolverRef.current = null;
          }
          return;
        }

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) {
          throw new Error('Web Audio not supported');
        }

        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new AudioCtx();
        }
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        const ctx = audioContextRef.current;
        const source = ctx.createMediaStreamSource(stream);

        // Analyser node for live visual meter
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        // ScriptProcessorNode for pristine 16-bit PCM WAV recording
        const scriptNode = ctx.createScriptProcessor(4096, 1, 1);
        scriptNodeRef.current = scriptNode;

        scriptNode.onaudioprocess = (e) => {
          if (!isRecordingRef.current) return;
          const channelData = e.inputBuffer.getChannelData(0);
          // Clone channel samples
          pcmChunksRef.current.push(new Float32Array(channelData));
        };

        source.connect(analyser);
        analyser.connect(scriptNode);
        scriptNode.connect(ctx.destination);

        updateAudioMeter();

        isInitializingRef.current = false;
        if (initResolverRef.current) {
          initResolverRef.current();
          initResolverRef.current = null;
        }
      } catch (err: any) {
        isInitializingRef.current = false;
        if (initResolverRef.current) {
          initResolverRef.current();
          initResolverRef.current = null;
        }
        setState((s) => ({ ...s, error: err.message || 'Microphone capture error' }));
      }
    },
    [getOrCreateStream, updateAudioMeter]
  );

  const stopRecording = useCallback((): Promise<{ audioBlob: Blob; transcript: string }> => {
    return new Promise(async (resolve) => {
      // If startRecording was still awaiting stream, wait for completion
      if (isInitializingRef.current) {
        await new Promise<void>((r) => {
          initResolverRef.current = r;
        });
      }

      isRecordingRef.current = false;

      // Ensure at least 400ms duration has elapsed so audio buffers are recorded
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed < 400) {
        await new Promise((r) => setTimeout(r, 400 - elapsed));
      }

      // Stop speech recognition and allow brief flush
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }

      await new Promise((r) => setTimeout(r, 120));

      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }

      // Disconnect script processor
      if (scriptNodeRef.current) {
        try {
          scriptNodeRef.current.disconnect();
        } catch {
          // ignore
        }
        scriptNodeRef.current = null;
      }

      const capturedTranscript = liveTranscriptRef.current.trim();
      const chunks = pcmChunksRef.current;

      // Total audio sample count
      let totalLength = 0;
      for (const chunk of chunks) {
        totalLength += chunk.length;
      }

      // Merge PCM buffers
      const mergedSamples = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        mergedSamples.set(chunk, offset);
        offset += chunk.length;
      }

      const ctxSampleRate = audioContextRef.current?.sampleRate || 44100;
      const resampled = resampleTo16kHz(mergedSamples, ctxSampleRate);

      // Encode pristine 16kHz mono WAV Blob
      const wavBlob = encodeWAV(resampled, 16000);

      setState((prev) => ({ ...prev, isRecording: false, audioLevel: 0 }));
      resolve({ audioBlob: wavBlob, transcript: capturedTranscript });
    });
  }, []);

  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
  };
}

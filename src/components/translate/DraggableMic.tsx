import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { Mic, ArrowUp, ArrowDown, Loader2, Volume2, Square } from 'lucide-react';
import { Language, TranslationDirection } from '../../types/translation';

interface DraggableMicProps {
  originLanguage: Language;
  targetLanguage: Language;
  isRecording: boolean;
  audioLevel: number;
  isTranslating: boolean;
  isPlayingAudio: boolean;
  onStartRecord: (direction: TranslationDirection) => void;
  onStopRecord: (finalDirection: TranslationDirection) => void;
  activeDragZone: 'origin' | 'target' | null;
  setActiveDragZone: (zone: 'origin' | 'target' | null) => void;
  disabled?: boolean;
}

const DRAG_THRESHOLD = 24;

export const DraggableMic: React.FC<DraggableMicProps> = ({
  originLanguage,
  targetLanguage,
  isRecording,
  audioLevel,
  isTranslating,
  isPlayingAudio,
  onStartRecord,
  onStopRecord,
  activeDragZone,
  setActiveDragZone,
  disabled = false,
}) => {
  const isPointerDownRef = useRef<boolean>(false);
  const startYRef = useRef<number>(0);
  const pointerDownTimeRef = useRef<number>(0);
  const currentDirectionRef = useRef<TranslationDirection>('origin-to-target');
  const [isTapModeRecording, setIsTapModeRecording] = useState<boolean>(false);

  const rawY = useMotionValue(0);
  const smoothY = useSpring(rawY, { damping: 28, stiffness: 360 });
  const buttonScale = useTransform(smoothY, [-70, 0, 70], [1.08, 1, 1.08]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || isTranslating) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    // If already recording in Tap-Mode, clicking again stops it
    if (isTapModeRecording) {
      isPointerDownRef.current = false;
      setIsTapModeRecording(false);
      const dir = currentDirectionRef.current;
      setActiveDragZone(null);
      rawY.set(0);
      onStopRecord(dir);
      return;
    }

    isPointerDownRef.current = true;
    pointerDownTimeRef.current = Date.now();
    startYRef.current = e.clientY;
    rawY.set(0);

    // Default direction is origin speaking (bottom zone)
    currentDirectionRef.current = 'origin-to-target';
    setActiveDragZone('origin');
    onStartRecord('origin-to-target');

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.(25);
      } catch {
        // ignore
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;

    const deltaY = e.clientY - startYRef.current;
    const boundedY = Math.max(-85, Math.min(85, deltaY));
    rawY.set(boundedY);

    if (boundedY < -DRAG_THRESHOLD) {
      if (activeDragZone !== 'target') {
        setActiveDragZone('target');
        currentDirectionRef.current = 'target-to-origin';
      }
    } else if (boundedY > DRAG_THRESHOLD) {
      if (activeDragZone !== 'origin') {
        setActiveDragZone('origin');
        currentDirectionRef.current = 'origin-to-target';
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }

    const pressDuration = Date.now() - pointerDownTimeRef.current;

    // If press was very quick (< 320ms), the user tapped to talk!
    // Keep recording until they tap again so speech is not prematurely cut off!
    if (pressDuration < 320 && !isTapModeRecording) {
      setIsTapModeRecording(true);
      return;
    }

    // Long press release -> finish recording
    setIsTapModeRecording(false);
    rawY.set(0);
    const finalDir = currentDirectionRef.current;
    setActiveDragZone(null);
    onStopRecord(finalDir);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerUp(e);
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none w-full h-full">
      {/* Floating Active Drag Guide Pill */}
      <AnimatePresence>
        {isRecording && activeDragZone === 'target' && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: -48, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            className="absolute z-40 flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-medium shadow-md shadow-blue-500/20 whitespace-nowrap pointer-events-none"
          >
            <ArrowUp className="w-3 h-3" />
            <span>Speaking {targetLanguage.name} → Translating to {originLanguage.name}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRecording && activeDragZone === 'origin' && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 48, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="absolute z-40 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600 text-white text-[11px] font-medium shadow-md shadow-amber-500/20 whitespace-nowrap pointer-events-none"
          >
            <ArrowDown className="w-3 h-3" />
            <span>Speaking {originLanguage.name} → Translating to {targetLanguage.name}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap Mode indicator */}
      <AnimatePresence>
        {isTapModeRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -top-7 z-40 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-medium flex items-center gap-1 shadow animate-pulse"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>Recording · Tap to translate</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sonar Pulse Circles while recording */}
      {isRecording && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.35 + audioLevel * 0.35, 1.55 + audioLevel * 0.45],
              opacity: [0.5, 0.25, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            className={`w-20 h-20 rounded-full border-2 ${
              activeDragZone === 'target'
                ? 'border-blue-400 bg-blue-100/50'
                : 'border-amber-400 bg-amber-100/50'
            }`}
          />
        </div>
      )}

      {/* Main Push/Tap-to-Talk Button */}
      <motion.div
        style={{
          y: smoothY,
          scale: buttonScale,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        className={`relative z-30 w-16 h-16 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none transition-all ${
          isTranslating
            ? 'bg-slate-100 text-slate-400 border border-slate-300 shadow-sm'
            : isTapModeRecording
            ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 ring-4 ring-red-100 animate-pulse'
            : isRecording
            ? activeDragZone === 'target'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-100'
              : 'bg-amber-600 text-white shadow-lg shadow-amber-500/30 ring-4 ring-amber-100'
            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/15 active:scale-95 border border-slate-800'
        }`}
      >
        {isTranslating ? (
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        ) : isPlayingAudio ? (
          <Volume2 className="w-6 h-6 text-white animate-pulse" />
        ) : isTapModeRecording ? (
          <Square className="w-5 h-5 fill-white text-white" />
        ) : (
          /* Symmetrical 3 Horizontal Lines (100% identical from 0° and 180° views) */
          <div className="flex flex-col items-center justify-center gap-1 w-6 h-6 pointer-events-none">
            <span
              className={`h-[2.5px] bg-white rounded-full transition-all duration-150 ${
                isRecording ? 'w-6 bg-white' : 'w-5 bg-white/95'
              }`}
            />
            <span
              className={`h-[2.5px] bg-white rounded-full transition-all duration-150 ${
                isRecording ? 'w-4 bg-white' : 'w-5 bg-white/95'
              }`}
            />
            <span
              className={`h-[2.5px] bg-white rounded-full transition-all duration-150 ${
                isRecording ? 'w-6 bg-white' : 'w-5 bg-white/95'
              }`}
            />
          </div>
        )}

        {/* Dynamic Voice Amplitude Dots inside button */}
        {isRecording && (
          <div className="absolute bottom-2 flex items-center justify-center gap-0.5 pointer-events-none">
            {[0, 1, 2].map((idx) => {
              const h = Math.max(2, Math.min(8, audioLevel * 12 * (idx === 1 ? 1.4 : 0.8)));
              return (
                <span
                  key={idx}
                  style={{ height: `${h}px` }}
                  className="w-1 bg-white/90 rounded-full transition-all duration-75"
                />
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

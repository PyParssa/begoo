import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  Edit3,
  Send,
  FlipVertical2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { DraggableMic } from './DraggableMic';
import { Language, TranslationDirection, TranslationRecord } from '../../types/translation';

const MIRROR_MODE_STORAGE_KEY = 'begoo_mirror_mode_v1';

interface TranslateTabProps {
  originLanguage: Language;
  targetLanguage: Language;
  lastRecord: TranslationRecord | null;
  isRecording: boolean;
  audioLevel: number;
  isTranslating: boolean;
  isPlayingAudio: boolean;
  currentPlayingId: string | null;
  liveTranscript?: string;
  permissionState?: 'idle' | 'prompt' | 'granted' | 'denied';
  onStartRecord: (direction: TranslationDirection) => void;
  onStopRecord: (finalDirection?: TranslationDirection) => void;
  onPlaySpeech: (text: string, langCode: Language['code'], id: string, transliteration?: string) => void;
  onStopSpeech: () => void;
  onSwapLanguages?: () => void;
  onCustomTextSubmit?: (text: string, direction: TranslationDirection) => void;
  casualTone: boolean;
}

export const TranslateTab: React.FC<TranslateTabProps> = ({
  originLanguage,
  targetLanguage,
  lastRecord,
  isRecording,
  audioLevel,
  isTranslating,
  isPlayingAudio,
  currentPlayingId,
  liveTranscript,
  permissionState = 'idle',
  onStartRecord,
  onStopRecord,
  onPlaySpeech,
  onStopSpeech,
  onSwapLanguages,
  onCustomTextSubmit,
  casualTone,
}) => {
  // Mirror Mode is ON by default for tabletop face-to-face conversations
  const [isMirrorMode, setIsMirrorMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(MIRROR_MODE_STORAGE_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });
  const [activeDragZone, setActiveDragZone] = useState<'origin' | 'target' | null>(null);
  const [copiedZone, setCopiedZone] = useState<'target' | 'origin' | null>(null);
  const [editingZone, setEditingZone] = useState<'target' | 'origin' | null>(null);
  const [inputText, setInputText] = useState('');

  // Top Section is ALWAYS Target Language (e.g. English)
  // Bottom Section is ALWAYS Origin Language (e.g. Persian)
  let targetZoneText = '';
  let originZoneText = '';
  let isTargetOutput = false;
  let isOriginOutput = false;

  if (lastRecord) {
    if (lastRecord.direction === 'origin-to-target') {
      originZoneText = lastRecord.originalText;
      targetZoneText = lastRecord.translatedText;
      isTargetOutput = true;
    } else {
      targetZoneText = lastRecord.originalText;
      originZoneText = lastRecord.translatedText;
      isOriginOutput = true;
    }
  }

  // Live transcript display in active speaker zone
  if (isRecording && liveTranscript) {
    if (activeDragZone === 'target') {
      targetZoneText = liveTranscript;
      isTargetOutput = false;
    } else {
      originZoneText = liveTranscript;
      isOriginOutput = false;
    }
  }

  const targetZoneIsRTL = targetLanguage.dir === 'rtl';
  const originZoneIsRTL = originLanguage.dir === 'rtl';

  const handleCopy = (text: string, zone: 'target' | 'origin') => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedZone(zone);
    setTimeout(() => setCopiedZone(null), 1800);
  };

  const handleStartEdit = (zone: 'target' | 'origin') => {
    setEditingZone(zone);
    setInputText(zone === 'target' ? targetZoneText : originZoneText);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      setEditingZone(null);
      return;
    }
    const direction: TranslationDirection =
      editingZone === 'target' ? 'target-to-origin' : 'origin-to-target';
    onCustomTextSubmit?.(inputText.trim(), direction);
    setEditingZone(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden select-none bg-[#FAFAFA]">
      {/* Permission alert banner if microphone access is blocked */}
      {permissionState === 'denied' && (
        <div className="shrink-0 bg-amber-50 border-b border-amber-200 px-3 py-1.5 flex items-center justify-between text-xs text-amber-900 z-50">
          <span>Microphone access blocked. Click ✎ to type custom sentences.</span>
          <button
            onClick={() => handleStartEdit('origin')}
            className="font-semibold underline ml-2 hover:text-amber-950"
          >
            Type
          </button>
        </div>
      )}

      {/* ========================================================
          TOP SECTION (PERSON A / TARGET LANGUAGE)
          When isMirrorMode is true, this section is rotated 180 degrees
          so the person across the table can read right-side up!
          ======================================================== */}
      <section
        className={`flex-1 min-h-0 flex flex-col justify-between p-4 transition-all duration-300 ${
          isMirrorMode ? 'rotate-180' : ''
        } ${
          activeDragZone === 'target'
            ? 'bg-blue-50/70'
            : 'bg-white'
        }`}
      >
        {/* Header Bar inside Top Zone */}
        <div className="shrink-0 flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">{targetLanguage.flag}</span>
            <span className="font-bold text-slate-900 tracking-tight text-sm">
              {targetLanguage.name}
            </span>
            <span className="text-slate-400 text-[11px]">({targetLanguage.nativeName})</span>
            {isTargetOutput && (
              <span className="ml-1 text-[10px] text-blue-700 font-semibold px-1.5 py-0.5 rounded bg-blue-100/70">
                Translated
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleStartEdit('target')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Type sentence"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            {targetZoneText && (
              <button
                onClick={() => handleCopy(targetZoneText, 'target')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Copy text"
              >
                {copiedZone === 'target' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {targetZoneText && (
              <button
                onClick={() => {
                  if (isPlayingAudio && currentPlayingId === 'target-zone') {
                    onStopSpeech();
                  } else {
                    onPlaySpeech(
                      targetZoneText,
                      targetLanguage.code,
                      'target-zone',
                      isTargetOutput ? lastRecord?.transliteration : undefined
                    );
                  }
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isPlayingAudio && currentPlayingId === 'target-zone'
                    ? 'bg-blue-100 text-blue-700 animate-pulse'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title="Listen to pronunciation"
              >
                {isPlayingAudio && currentPlayingId === 'target-zone' ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Text Display Area in Top Zone */}
        <div className="flex-1 min-h-0 flex flex-col justify-center py-2 overflow-y-auto">
          {editingZone === 'target' ? (
            <form onSubmit={handleSubmitEdit} className="space-y-2">
              <input
                type="text"
                autoFocus
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Type in ${targetLanguage.name}...`}
                className="w-full text-base p-2.5 rounded-lg border border-blue-400 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                dir={targetZoneIsRTL ? 'rtl' : 'ltr'}
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingZone(null)}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md flex items-center gap-1 shadow-sm"
                >
                  <span>Translate</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>
          ) : targetZoneText ? (
            <div className={`space-y-1 ${targetZoneIsRTL ? 'font-farsi text-right' : 'text-left'}`}>
              <p
                className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug break-words"
                dir={targetZoneIsRTL ? 'rtl' : 'ltr'}
              >
                {targetZoneText}
              </p>
              {isTargetOutput && casualTone && (
                <p className="text-[10px] text-slate-400 font-medium">Casual Tone Applied</p>
              )}
            </div>
          ) : (
            <div className="py-2 text-center">
              <p className="text-slate-400 text-sm font-medium">
                Drag middle mic UP to speak in {targetLanguage.name}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                Translations into {targetLanguage.name} will appear here.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================
          CENTER DIVIDER BRIDGE WITH THE ROUND DRAGGABLE MIC BUTTON
          ======================================================== */}
      <div className="relative shrink-0 h-20 bg-slate-100/90 border-y border-slate-200/90 flex items-center justify-between px-3 z-30 shadow-2xs">
        {/* Left: Mirror Mode Toggle */}
        <button
          onClick={() =>
            setIsMirrorMode((current) => {
              const next = !current;
              try {
                localStorage.setItem(MIRROR_MODE_STORAGE_KEY, String(next));
              } catch {
                // ignore unavailable storage
              }
              return next;
            })
          }
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
            isMirrorMode
              ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
              : 'bg-slate-200/80 text-slate-600 hover:bg-slate-200'
          }`}
          title="Toggle face-to-face tabletop mirror view"
        >
          <FlipVertical2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isMirrorMode ? 'Tabletop 180°' : 'Upright'}</span>
        </button>

        {/* Center: The Round Draggable Mic Button */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-28 h-28 flex items-center justify-center pointer-events-auto">
          <DraggableMic
            originLanguage={originLanguage}
            targetLanguage={targetLanguage}
            isRecording={isRecording}
            audioLevel={audioLevel}
            isTranslating={isTranslating}
            isPlayingAudio={isPlayingAudio}
            onStartRecord={onStartRecord}
            onStopRecord={(finalDir) => onStopRecord(finalDir)}
            activeDragZone={activeDragZone}
            setActiveDragZone={setActiveDragZone}
          />
        </div>

        {/* Right: Swap Languages Button */}
        <button
          onClick={onSwapLanguages}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition-colors"
          title="Swap languages"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Swap</span>
        </button>
      </div>

      {/* ========================================================
          BOTTOM SECTION (PERSON B / ORIGIN LANGUAGE)
          Always in normal orientation (0 degrees) facing Person B
          ======================================================== */}
      <section
        className={`flex-1 min-h-0 flex flex-col justify-between p-4 transition-colors duration-200 ${
          activeDragZone === 'origin'
            ? 'bg-amber-50/70'
            : 'bg-white'
        }`}
      >
        {/* Text Display Area in Bottom Zone */}
        <div className="flex-1 min-h-0 flex flex-col justify-center py-2 overflow-y-auto">
          {editingZone === 'origin' ? (
            <form onSubmit={handleSubmitEdit} className="space-y-2">
              <input
                type="text"
                autoFocus
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Type in ${originLanguage.name}...`}
                className="w-full text-base p-2.5 rounded-lg border border-amber-400 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                dir={originZoneIsRTL ? 'rtl' : 'ltr'}
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingZone(null)}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-md flex items-center gap-1 shadow-sm"
                >
                  <span>Translate</span>
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </form>
          ) : originZoneText ? (
            <div className={`space-y-1 ${originZoneIsRTL ? 'font-farsi text-right' : 'text-left'}`}>
              <p
                className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug break-words"
                dir={originZoneIsRTL ? 'rtl' : 'ltr'}
              >
                {originZoneText}
              </p>

              {lastRecord?.transliteration && isOriginOutput && (
                <p className="text-xs text-slate-500 font-mono italic">
                  "{lastRecord.transliteration}"
                </p>
              )}

              {isOriginOutput && casualTone && (
                <p className="text-[10px] text-slate-400 font-medium">
                  {originZoneIsRTL ? 'لحن عامیانه و محاوره‌ای' : 'Casual Tone Applied'}
                </p>
              )}
            </div>
          ) : (
            <div className={`py-2 ${originZoneIsRTL ? 'text-right font-farsi' : 'text-left'}`}>
              <p
                className="text-slate-400 text-sm font-medium"
                dir={originZoneIsRTL ? 'rtl' : 'ltr'}
              >
                میکروفون وسط را به سمت پایین بکشید تا به زبان {originLanguage.nativeName} صحبت کنید
              </p>
              <p className="text-slate-400 text-xs mt-0.5" dir={originZoneIsRTL ? 'rtl' : 'ltr'}>
                ترجمه به زبان {originLanguage.nativeName} در این قسمت ظاهر می‌شود.
              </p>
            </div>
          )}
        </div>

        {/* Header Bar inside Bottom Zone */}
        <div className="shrink-0 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-base leading-none">{originLanguage.flag}</span>
            <span className="font-bold text-slate-900 tracking-tight text-sm">
              {originLanguage.name}
            </span>
            <span className="text-slate-400 text-[11px]">({originLanguage.nativeName})</span>
            {isOriginOutput && (
              <span className="ml-1 text-[10px] text-amber-800 font-semibold px-1.5 py-0.5 rounded bg-amber-100/70">
                Translated
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleStartEdit('origin')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Type sentence"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            {originZoneText && (
              <button
                onClick={() => handleCopy(originZoneText, 'origin')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Copy text"
              >
                {copiedZone === 'origin' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {originZoneText && (
              <button
                onClick={() => {
                  if (isPlayingAudio && currentPlayingId === 'origin-zone') {
                    onStopSpeech();
                  } else {
                    onPlaySpeech(
                      originZoneText,
                      originLanguage.code,
                      'origin-zone',
                      isOriginOutput ? lastRecord?.transliteration : undefined
                    );
                  }
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isPlayingAudio && currentPlayingId === 'origin-zone'
                    ? 'bg-amber-100 text-amber-700 animate-pulse'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                }`}
                title="Listen to pronunciation"
              >
                {isPlayingAudio && currentPlayingId === 'origin-zone' ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

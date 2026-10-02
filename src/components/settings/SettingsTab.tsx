import React, { useState } from 'react';
import { ArrowLeftRight, Check, ChevronRight, ShieldCheck } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../constants/languages';
import { LanguageCode, UserPreferences } from '../../types/translation';

interface SettingsTabProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onSwapLanguages: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  preferences,
  onUpdatePreferences,
  onSwapLanguages,
}) => {
  const [selectingRole, setSelectingRole] = useState<'origin' | 'target' | null>(null);

  const originLang = SUPPORTED_LANGUAGES[preferences.originLanguage];
  const targetLang = SUPPORTED_LANGUAGES[preferences.targetLanguage];

  const handleSelectLanguage = (code: LanguageCode) => {
    if (selectingRole === 'origin') {
      if (code === preferences.targetLanguage) {
        onSwapLanguages();
      } else {
        onUpdatePreferences({ originLanguage: code });
      }
    } else if (selectingRole === 'target') {
      if (code === preferences.originLanguage) {
        onSwapLanguages();
      } else {
        onUpdatePreferences({ targetLanguage: code });
      }
    }
    setSelectingRole(null);
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-y-auto bg-[#FAFAFA] text-slate-900 p-5 pb-24">
      {/* Top Section Header */}
      <div className="mb-5 pt-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Configure language pairings and voice options.</p>
      </div>

      {/* Language Pairing Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 mb-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Active Pairing
          </span>
          <button
            onClick={onSwapLanguages}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Swap</span>
          </button>
        </div>

        {/* Origin Language Row */}
        <button
          onClick={() => setSelectingRole('origin')}
          className="w-full flex items-center justify-between py-3.5 px-1 hover:bg-slate-50 rounded-xl transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{originLang?.flag}</span>
            <div>
              <p className="text-xs text-amber-600 font-medium">Origin Language (Bottom Zone)</p>
              <p className="text-sm font-semibold text-slate-900">
                {originLang?.name} <span className="text-slate-400 font-normal">({originLang?.nativeName})</span>
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <div className="h-px bg-slate-100 my-1" />

        {/* Target Language Row */}
        <button
          onClick={() => setSelectingRole('target')}
          className="w-full flex items-center justify-between py-3.5 px-1 hover:bg-slate-50 rounded-xl transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{targetLang?.flag}</span>
            <div>
              <p className="text-xs text-blue-600 font-medium">Target Language (Top Zone)</p>
              <p className="text-sm font-semibold text-slate-900">
                {targetLang?.name} <span className="text-slate-400 font-normal">({targetLang?.nativeName})</span>
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Translation & Audio Behavior */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          Behavior & Tone
        </h2>

        <div className="bg-white rounded-2xl divide-y divide-slate-100 border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Auto-Play Audio Toggle */}
          <div className="flex items-center justify-between p-4">
            <div className="pr-4">
              <p className="text-sm font-medium text-slate-900">Auto-play translated audio</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically speak translations aloud upon arrival.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={preferences.autoPlayAudio}
              onClick={() => onUpdatePreferences({ autoPlayAudio: !preferences.autoPlayAudio })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.autoPlayAudio ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  preferences.autoPlayAudio ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Casual / Amiyaneh Tone Toggle */}
          <div className="flex items-center justify-between p-4">
            <div className="pr-4">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-slate-900">Casual / Amiyaneh tone</p>
                <span className="text-[10px] text-amber-700 font-farsi px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200">
                  محاوره‌ای
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Translates into everyday conversational phrasing and colloquial street vernacular.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={preferences.casualTone}
              onClick={() => onUpdatePreferences({ casualTone: !preferences.casualTone })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.casualTone ? 'bg-amber-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  preferences.casualTone ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Haptic Feedback Toggle */}
          <div className="flex items-center justify-between p-4">
            <div className="pr-4">
              <p className="text-sm font-medium text-slate-900">Haptic touch feedback</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Tactile vibrations when dragging mic into zones.
              </p>
            </div>
            <button
              role="switch"
              aria-checked={preferences.hapticFeedback}
              onClick={() => onUpdatePreferences({ hapticFeedback: !preferences.hapticFeedback })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.hapticFeedback ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  preferences.hapticFeedback ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Vercel Route Notice */}
      <div className="mt-5 p-4 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-600 shadow-sm">
        <div className="flex items-center gap-1.5 text-slate-800 font-medium mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Vercel & Next.js App Router Architecture</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500">
          The <code className="text-slate-800 font-mono">/api/translate</code> endpoint accepts audio blobs with multilingual routing ready for Gemini Multimodal API and TTS providers.
        </p>
      </div>

      {/* Language Selection Sheet */}
      {selectingRole && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 p-5 max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                Select {selectingRole === 'origin' ? 'Origin Language' : 'Target Language'}
              </h3>
              <button
                onClick={() => setSelectingRole(null)}
                className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto divide-y divide-slate-100 py-2">
              {Object.values(SUPPORTED_LANGUAGES).map((lang) => {
                const isSelected =
                  selectingRole === 'origin'
                    ? preferences.originLanguage === lang.code
                    : preferences.targetLanguage === lang.code;

                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang.code)}
                    className="w-full flex items-center justify-between py-3 px-2 hover:bg-slate-50 rounded-xl transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl leading-none">{lang.flag}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{lang.name}</p>
                        <p className="text-xs text-slate-400">{lang.nativeName}</p>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

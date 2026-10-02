import React from 'react';
import { Languages, Sliders, User, ArrowLeftRight } from 'lucide-react';
import { ActiveTab, Language } from '../../types/translation';

interface AppLayoutProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  originLanguage: Language;
  targetLanguage: Language;
  onSwapLanguages?: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onTabChange,
  originLanguage,
  targetLanguage,
  onSwapLanguages,
  children,
}) => {
  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-[#FAFAFA] text-slate-900 overflow-hidden relative shadow-xl border-x border-slate-200/60">
      {/* ========================================================
          TOP APP BAR (Light Minimalist)
          ======================================================== */}
      <header className="h-12 shrink-0 flex items-center justify-between px-3.5 border-b border-slate-200/80 bg-white/95 backdrop-blur-md z-40">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-1.5">
          <span className="text-base font-black tracking-tight text-slate-900">
            BeGoo
          </span>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 rounded-full">
            PTT
          </span>
        </div>

        {/* Zone 2: Language Pair Swap Indicator */}
        <button
          onClick={onSwapLanguages}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors shadow-2xs"
          title="Swap origin and target languages"
        >
          <span>{targetLanguage.name}</span>
          <ArrowLeftRight className="w-3 h-3 text-blue-600" />
          <span>{originLanguage.name}</span>
        </button>

        {/* Zone 3: Live Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Face-to-Face</span>
        </div>
      </header>

      {/* ========================================================
          MAIN CONTENT AREA
          ======================================================== */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        {children}
      </main>

      {/* ========================================================
          FIXED BOTTOM TAB BAR (Translate in Middle)
          ======================================================== */}
      <nav className="shrink-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/80 grid grid-cols-3 items-center z-40 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        {/* Tab 1: Settings */}
        <button
          onClick={() => onTabChange('settings')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
            activeTab === 'settings'
              ? 'text-blue-600 font-semibold'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <Sliders className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Settings</span>
          {activeTab === 'settings' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-600" />
          )}
        </button>

        {/* Tab 2: Translate (PRIMARY CENTER TAB) */}
        <button
          onClick={() => onTabChange('translate')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all relative ${
            activeTab === 'translate'
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
              activeTab === 'translate'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-100'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Languages className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5 font-medium">Translate</span>
        </button>

        {/* Tab 3: Account */}
        <button
          onClick={() => onTabChange('account')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors relative ${
            activeTab === 'account'
              ? 'text-blue-600 font-semibold'
              : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Account</span>
          {activeTab === 'account' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-600" />
          )}
        </button>
      </nav>
    </div>
  );
};

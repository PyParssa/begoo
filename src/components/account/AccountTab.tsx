import React, { useState } from 'react';
import { LogOut, CheckCircle2, Shield, Mic, Clock, ChevronRight, UserCheck } from 'lucide-react';

export interface AccountUser {
  id: string;
  name: string;
  email?: string;
  avatarInitials?: string;
  role?: string;
  memberSince?: string;
  isGuest?: boolean;
}

interface AccountTabProps {
  user: AccountUser | null;
  onSignOut: () => void;
  translationCount: number;
  onClearHistory?: () => void;
}

export const AccountTab: React.FC<AccountTabProps> = ({
  user,
  onSignOut,
  translationCount,
  onClearHistory,
}) => {
  const [showSignOutPrompt, setShowSignOutPrompt] = useState(false);

  const handleConfirmSignOut = () => {
    setShowSignOutPrompt(false);
    onSignOut();
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-y-auto bg-[#FAFAFA] text-slate-900 p-5 pb-24">
      {/* Tab Header */}
      <div className="mb-5 pt-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">BeGoo Account</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage user profile and speech session settings.</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 mb-5 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Avatar Container */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-slate-900 p-0.5 flex items-center justify-center shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-slate-900 font-bold text-lg tracking-tight">
                {user?.avatarInitials || 'PM'}
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900 tracking-tight truncate">
                {user?.name || 'Parssa Mohammadi'}
              </h2>
              <span className="text-[10px] text-blue-700 font-semibold px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 uppercase">
                {user?.role || 'Pro'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate font-mono">
              {user?.email || 'parssamohammadi@gmail.com'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Member since {user?.memberSince || 'October 2026'}
            </p>
          </div>
        </div>

        {/* User Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Mic className="w-3.5 h-3.5 text-blue-600" />
              <span>Translations Today</span>
            </div>
            <p className="text-lg font-bold text-slate-900 tabular-nums">{translationCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Engine Status</span>
            </div>
            <p className="text-lg font-bold text-slate-900 tabular-nums flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Live AI</span>
            </p>
          </div>
        </div>
      </div>

      {/* Account Settings List */}
      <div className="space-y-3 mb-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
          Privacy & Storage
        </h3>

        <div className="bg-white rounded-2xl divide-y divide-slate-100 border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">Audio Privacy</p>
                <p className="text-xs text-slate-500">Audio samples are purged immediately after translation</p>
              </div>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">Account Type</p>
                <p className="text-xs text-slate-500">
                  {user?.isGuest ? 'Guest Session' : 'Verified BeGoo Pro Account'}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-600">Active</span>
          </div>

          <button
            onClick={() => onClearHistory?.()}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
          >
            <div>
              <p className="text-sm font-medium text-slate-900">Reset Session History</p>
              <p className="text-xs text-slate-500">Clear cached text and reset counters</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Sign Out Action */}
      <div className="mt-auto pt-2">
        <button
          onClick={() => setShowSignOutPrompt(true)}
          className="w-full h-11 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-medium text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of BeGoo</span>
        </button>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showSignOutPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900">Sign Out?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to sign out from {user?.name || 'your account'}? You will be returned to the BeGoo Push to Talk login page.
            </p>

            <div className="flex items-center gap-3 mt-5">
              <button
                onClick={() => setShowSignOutPrompt(false)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSignOut}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

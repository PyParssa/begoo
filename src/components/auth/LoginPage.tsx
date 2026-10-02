import React, { useState } from 'react';
import { Mic, ArrowRight, Lock, Mail, User as UserIcon, Eye, EyeOff, Sparkles, ShieldCheck } from 'lucide-react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  isGuest?: boolean;
  role: 'pro' | 'standard' | 'guest';
  memberSince: string;
}

interface LoginPageProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('parssamohammadi@gmail.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Parssa Mohammadi');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const displayName = mode === 'signup' ? name.trim() : (email.includes('parssa') ? 'Parssa Mohammadi' : email.split('@')[0]);
      const initials = displayName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'BG';

      const user: AuthUser = {
        id: `usr-${Date.now()}`,
        name: displayName,
        email: email.trim(),
        avatarInitials: initials,
        isGuest: false,
        role: 'pro',
        memberSince: 'October 2026',
      };

      onLogin(user);
    }, 600);
  };

  const handleQuickLoginParssa = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        id: 'usr-parssa-1',
        name: 'Parssa Mohammadi',
        email: 'parssamohammadi@gmail.com',
        avatarInitials: 'PM',
        isGuest: false,
        role: 'pro',
        memberSince: 'October 2026',
      });
    }, 350);
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        id: `guest-${Date.now()}`,
        name: 'Guest User',
        email: 'guest@begoo.app',
        avatarInitials: 'GU',
        isGuest: true,
        role: 'guest',
        memberSince: 'Today',
      });
    }, 300);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] w-full max-w-md mx-auto bg-[#FAFAFA] text-slate-900 overflow-y-auto px-5 py-8 border-x border-slate-200/60 shadow-xl">
      {/* Brand Hero */}
      <div className="flex flex-col items-center text-center mt-2 mb-6">
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/25 ring-4 ring-blue-100">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold text-white shadow-xs">
            Live
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">BeGoo</h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            Push to Talk
          </span>
        </div>

        <p className="text-xs text-slate-500 font-farsi mt-1" dir="rtl">
          بگو • ترجمه صوتی رو در رو و بی‌درنگ
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
          Bidirectional tabletop speech translation with split-screen mirror mode.
        </p>
      </div>

      {/* Auth Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm mb-5">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Parssa Mohammadi"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-700">Password</label>
              {mode === 'signin' && (
                <span className="text-[11px] text-blue-600 hover:underline cursor-pointer">
                  Forgot?
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In to BeGoo' : 'Create BeGoo Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-slate-400">
            <span className="bg-white px-2">Fast Access</span>
          </div>
        </div>

        {/* Quick One-Tap Options */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleQuickLoginParssa}
            disabled={isLoading}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                PM
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900 leading-tight">Continue as Parssa</p>
                <p className="text-[10px] text-slate-400 font-mono">parssamohammadi@gmail.com</p>
              </div>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          </button>

          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="w-full py-2 px-3 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 text-xs font-medium text-center transition-colors"
          >
            Skip for now & use as Guest
          </button>
        </div>
      </div>

      {/* Feature Bullet Badges */}
      <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Instant PTT</span>
        </span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span>Face-to-Face Split Screen</span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span>Persian & English</span>
      </div>
    </div>
  );
};

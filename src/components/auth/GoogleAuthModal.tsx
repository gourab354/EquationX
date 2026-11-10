import React, { useState } from 'react';
import { GoogleUser } from '../../types/auth';
import { X, Key, ExternalLink, ShieldCheck, CheckCircle2, User, LogOut, Sparkles } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: GoogleUser | null;
  onLogin: (user: GoogleUser) => void;
  onLogout: () => void;
}

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.43 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.57 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [email, setEmail] = useState(currentUser?.email || 'gourabd911@gmail.com');
  const [name, setName] = useState(currentUser?.name || 'Gourab Dutta');
  const [apiKey, setApiKey] = useState(currentUser?.apiKey || localStorage.getItem('equationx_gemini_key') || '');
  const [step, setStep] = useState<'prompt' | 'form'>(currentUser ? 'prompt' : 'prompt');

  if (!isOpen) return null;

  const handleQuickGoogleSignIn = () => {
    const newUser: GoogleUser = {
      id: `google-user-${Date.now()}`,
      name: name.trim() || 'Google User',
      email: email.trim() || 'user@gmail.com',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'MathRobo')}`,
      apiKey: apiKey.trim(),
      isLoggedIn: true,
    };

    onLogin(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-[4px_6px_0px_#0f172a] space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-xs">
              <GoogleIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Google Account Authentication</h3>
              <p className="text-xs text-slate-500 font-medium">EquationX & MathRobo AI Access</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User State if logged in */}
        {currentUser && currentUser.isLoggedIn ? (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center gap-3.5">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full border-2 border-emerald-500 bg-white"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 text-sm truncate">{currentUser.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900">
                    Connected
                  </span>
                </div>
                <div className="text-xs text-slate-600 truncate font-medium">{currentUser.email}</div>
                <div className="text-[11px] text-emerald-700 font-mono mt-0.5">
                  {currentUser.apiKey ? '✓ Gemini API Key Linked' : '⚠ No API Key attached yet'}
                </div>
              </div>
            </div>

            {/* API Key management */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Linked Google Gemini API Key:</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-600 hover:text-amber-700 text-[11px] font-bold flex items-center gap-1 underline"
                >
                  <span>Get Key from Google AI Studio</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-yellow-400 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  onLogout();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <button
                onClick={handleQuickGoogleSignIn}
                className="px-5 py-2.5 rounded-xl bg-[#FFE500] hover:bg-[#FFD600] text-slate-950 font-black text-xs border border-slate-900 shadow-[1px_2px_0px_#0f172a] active:scale-95 transition-all"
              >
                Update & Close
              </button>
            </div>
          </div>
        ) : (
          /* Sign In Flow */
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 text-xs text-slate-700 leading-relaxed font-medium space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span>Sign in with your Google Account</span>
              </div>
              <p>
                Logging in with Google automatically connects your profile to EquationX and authorizes MathRobo to use the Google Gemini API for mathematical simulations.
              </p>
            </div>

            {/* Quick 1-Click Google Sign In Button */}
            <button
              onClick={handleQuickGoogleSignIn}
              className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-900 shadow-[2px_3px_0px_#0f172a] font-bold text-sm text-slate-800 flex items-center justify-center gap-3 transition-all active:scale-95 cursor-pointer"
            >
              <GoogleIcon className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="flex-1 h-px bg-slate-200" />
              <span>Account Credentials & Gemini API</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Google Account Name:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Gourab Dutta"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-yellow-400 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Google Email Address:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gourabd911@gmail.com"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-yellow-400 focus:bg-white font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Google Gemini API Key (from this Google Account):
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-600 hover:text-amber-700 text-[10px] font-bold flex items-center gap-0.5 underline"
                  >
                    <span>Free Key at Google AI Studio</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste AIzaSy... (or leave blank to use local math engine)"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-yellow-400 focus:bg-white"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Obtained free directly with your Google account on Google AI Studio.
                </p>
              </div>
            </div>

            <button
              onClick={handleQuickGoogleSignIn}
              className="w-full py-3 rounded-2xl bg-[#FFE500] hover:bg-[#FFD600] text-slate-950 font-black text-xs border border-slate-900 shadow-[1px_2px_0px_#0f172a] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sign In & Activate MathRobo AI</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


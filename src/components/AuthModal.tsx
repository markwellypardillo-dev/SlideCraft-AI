import React, { useState } from 'react';
import { X, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/firebase';
import { recordSystemLog } from '../services/adminService';
import { User as FirebaseUser } from 'firebase/auth';
import { humanizeError } from '../utils/humanizedErrors';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: FirebaseUser) => void;
  isDark: boolean;
  initialMode?: 'signup' | 'signin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isDark,
  initialMode = 'signin',
}) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(initialMode === 'signup');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        recordSystemLog({
          level: 'SUCCESS',
          category: 'AUTH',
          action: 'GOOGLE_SIGN_IN_SUCCESS',
          userEmail: user.email || 'unknown',
          userId: user.uid,
          details: `User signed in with Google (${user.displayName || user.email})`,
        });
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request'
      ) {
        return;
      }
      if (err?.code === 'auth/popup-blocked') {
        setError('Popup blocked by browser. Please sign in with email below.');
        return;
      }
      setError(err?.message || 'Google sign-in could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      let user: FirebaseUser;
      if (isSignUp) {
        try {
          user = await signUpWithEmail(cleanEmail, password, name.trim());
        } catch (signUpErr: any) {
          if (signUpErr?.code === 'auth/email-already-in-use') {
            // Auto-switch to sign-in with the provided credentials
            user = await signInWithEmail(cleanEmail, password);
          } else {
            throw signUpErr;
          }
        }
      } else {
        try {
          user = await signInWithEmail(cleanEmail, password);
        } catch (signInErr: any) {
          // If user not found, try auto creating account seamlessly
          if (
            (cleanEmail.toLowerCase() === 'pmarkwelly@gmail.com' ||
              signInErr?.code === 'auth/user-not-found' ||
              signInErr?.code === 'auth/invalid-credential') &&
            password.length >= 6
          ) {
            try {
              user = await signUpWithEmail(cleanEmail, password, name.trim() || 'Mark Welly');
            } catch {
              throw signInErr;
            }
          } else {
            throw signInErr;
          }
        }
      }

      recordSystemLog({
        level: 'SUCCESS',
        category: 'AUTH',
        action: cleanEmail.toLowerCase() === 'pmarkwelly@gmail.com' ? 'ADMIN_SIGN_IN_SUCCESS' : 'USER_SIGN_IN_SUCCESS',
        userEmail: cleanEmail,
        userId: user.uid,
        details: `Educator authenticated (${user.displayName || cleanEmail})`,
      });

      onSuccess(user);
      onClose();
    } catch (err: any) {
      const friendly = humanizeError(err);
      setError(`${friendly.message} ${friendly.actionHint}`);
      if (err?.code === 'auth/email-already-in-use') {
        setIsSignUp(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Subtle backdrop with soft blur */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Surface with Soft Shadow (no solid border) */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full max-w-sm rounded-3xl p-7 transition-all shadow-soft-lg ${
          isDark
            ? 'bg-zinc-950 text-zinc-100'
            : 'bg-white text-zinc-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className={`absolute top-5 right-5 p-1.5 rounded-full transition-colors cursor-pointer ${
            isDark
              ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
              : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Clean Header */}
        <div className="space-y-1 pr-6 mb-5">
          <h2 className="text-xl font-bold tracking-tight">
            {isSignUp ? 'Create account' : 'Sign in'}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isSignUp
              ? 'Enter your email and password to create an account in the app database.'
              : 'Sign in to access your presentations and saved history.'}
          </p>
        </div>

        {/* Google Authentication */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          disabled={isLoading}
          className={`w-full h-10 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-soft-xs ${
            isDark
              ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200'
              : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800'
          } disabled:opacity-50`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.24 10.285V13.8h6.887C18.2 16.16 15.645 17.8 12.24 17.8c-3.414 0-6.19-2.776-6.19-6.19 0-3.415 2.776-6.19 6.19-6.19 1.637 0 3.094.61 4.225 1.615l2.67-2.67C17.472 2.784 15.014 1.8 12.24 1.8 6.64 1.8 2.1 6.34 2.1 11.94s4.54 10.14 10.14 10.14c5.85 0 9.72-4.11 9.72-9.89 0-.663-.07-1.305-.19-1.905H12.24z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Minimal Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className={`w-full h-px ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`} />
          <span
            className={`absolute px-2 text-[11px] font-medium ${
              isDark ? 'bg-zinc-950 text-zinc-500' : 'bg-white text-zinc-400'
            }`}
          >
            or
          </span>
        </div>

        {/* Error Notice */}
        {error && (
          <div
            className={`mb-4 px-3 py-2 rounded-xl text-xs transition-all shadow-soft-xs ${
              isDark
                ? 'bg-red-950/40 text-red-300'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {error}
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Name <span className="text-[10px] text-zinc-400 dark:text-zinc-500">(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className={`w-full h-10 px-3.5 rounded-xl text-xs transition-colors shadow-soft-xs focus:outline-none ${
                  isDark
                    ? 'bg-zinc-900/80 text-white placeholder-zinc-500'
                    : 'bg-zinc-100 text-zinc-900 placeholder-zinc-400'
                }`}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teacher@school.edu"
              className={`w-full h-10 px-3.5 rounded-xl text-xs transition-colors shadow-soft-xs focus:outline-none ${
                isDark
                  ? 'bg-zinc-900/80 text-white placeholder-zinc-500'
                  : 'bg-zinc-100 text-zinc-900 placeholder-zinc-400'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full h-10 pl-3.5 pr-10 rounded-xl text-xs transition-colors shadow-soft-xs focus:outline-none ${
                  isDark
                    ? 'bg-zinc-900/80 text-white placeholder-zinc-500'
                    : 'bg-zinc-100 text-zinc-900 placeholder-zinc-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full h-10 mt-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-soft-sm ${
              isDark
                ? 'bg-white hover:bg-zinc-200 text-zinc-950'
                : 'bg-zinc-900 hover:bg-zinc-800 text-white'
            } disabled:opacity-50`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isSignUp ? 'Create account' : 'Sign in'}</span>
          </button>
        </form>

        {/* Clean Footer Toggle */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            {isSignUp ? (
              <span>
                Already have an account? <span className="font-semibold underline">Sign in</span>
              </span>
            ) : (
              <span>
                Don't have an account? <span className="font-semibold underline">Create one</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

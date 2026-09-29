import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Download, Laptop, CheckCircle2, Loader2, Smartphone, Share, PlusSquare, X, MoreVertical } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'prominent' | 'sidebar';
  isDark?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  isDark = true,
}) => {
  const { isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  // Hide button if app is already running as installed standalone PWA
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      const res = await install();
      if (res.success) {
        setInstalledSuccess(true);
        setTimeout(() => setInstalledSuccess(false), 5000);
      } else {
        // Show clean native mobile / desktop guide modal (NO tab duplication)
        setShowInstallModal(true);
      }
    } catch (e) {
      console.error('PWA installation error:', e);
      setShowInstallModal(true);
    } finally {
      setIsInstalling(false);
    }
  };

  if (installedSuccess) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold shadow-soft-xs animate-in fade-in">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>App Installed!</span>
      </div>
    );
  }

  return (
    <>
      {/* SIDEBAR VARIANT */}
      {variant === 'sidebar' && (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`w-full p-2.5 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer shadow-soft-xs ${
            isDark
              ? 'bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-zinc-900 text-indigo-200 hover:from-indigo-950/80'
              : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-white text-indigo-900 hover:shadow-soft-sm'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              {isInstalling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="text-left">
              <span className="block font-bold text-xs">Install App</span>
              <span className="text-[10px] opacity-75 font-normal">Mobile & Laptop</span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">
            Install
          </span>
        </button>
      )}

      {/* PROMINENT BANNER VARIANT */}
      {variant === 'prominent' && (
        <div className={`p-4 sm:p-5 rounded-3xl shadow-soft-lg transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDark
            ? 'bg-zinc-900/90 text-zinc-100'
            : 'bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-white text-zinc-900'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 shadow-soft-xs">
              {isAndroid || isIOS ? <Smartphone className="w-5 h-5 text-indigo-400" /> : <Laptop className="w-5 h-5 text-indigo-400" />}
            </div>
            <div className="space-y-0.5 text-center sm:text-left">
              <h4 className="text-sm font-bold tracking-tight">
                Install SlideCraft AI Mobile & Desktop App
              </h4>
              <p className="text-xs text-zinc-400 dark:text-zinc-400">
                Launch directly from your phone home screen or desktop launcher without a browser tab.
              </p>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="w-full sm:w-auto h-10 px-5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-soft-sm hover:shadow-indigo-500/25 transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            {isInstalling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Install App</span>
          </button>
        </div>
      )}

      {/* COMPACT VARIANT (For Header) */}
      {variant === 'compact' && (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`h-8 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-soft-xs ${
            isDark
              ? 'bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
          }`}
          title="Install SlideCraft AI App"
        >
          {isInstalling ? (
            <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span className="hidden sm:inline">Install App</span>
        </button>
      )}

      {/* NATIVE PWA INSTALL GUIDE MODAL (No duplicate tabs) */}
      {showInstallModal && createPortal(
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={() => setShowInstallModal(false)} />
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className={`relative w-full max-w-md rounded-3xl p-6 shadow-soft-2xl text-left z-10 transition-all ${
              isDark ? 'bg-zinc-950 text-zinc-100 ring-1 ring-indigo-500/30' : 'bg-white text-zinc-900'
            }`}>
              <button
                onClick={() => setShowInstallModal(false)}
                className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors cursor-pointer ${
                  isDark ? 'text-zinc-400 hover:text-white bg-zinc-900' : 'text-zinc-500 hover:text-zinc-900 bg-zinc-100'
                }`}
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                {isAndroid || isIOS ? <Smartphone className="w-6 h-6" /> : <Laptop className="w-6 h-6" />}
              </div>

              <h3 className="text-lg font-bold tracking-tight mb-1">
                Install SlideCraft AI App
              </h3>
              <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                Save SlideCraft AI to your phone home screen or desktop application menu for instant 1-tap access.
              </p>

              {/* In-Iframe Notice & Open Direct Tab Action */}
              {typeof window !== 'undefined' && window.self !== window.top && (
                <div className="mb-4 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-2">
                  <p className="text-indigo-300 font-bold">
                    📌 Tip: You are currently viewing in Preview Mode
                  </p>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Browsers only allow 1-click PWA app installation in a direct browser tab or standalone window.
                  </p>
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-soft-xs"
                  >
                    <span>Open in Direct Tab to Install</span>
                  </a>
                </div>
              )}

              {/* iOS Safari Steps */}
              {isIOS && (
                <div className="space-y-2 mb-5 text-xs">
                  <div className={`p-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                    <Share className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>1. Tap <strong>Share</strong> icon in Safari toolbar</span>
                  </div>
                  <div className={`p-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                    <PlusSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>2. Tap <strong>Add to Home Screen</strong></span>
                  </div>
                </div>
              )}

              {/* Android Chrome Steps */}
              {isAndroid && (
                <div className="space-y-2 mb-5 text-xs">
                  <div className={`p-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                    <MoreVertical className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>1. Tap the <strong>3-dots menu (⫶)</strong> in Chrome / Edge top right</span>
                  </div>
                  <div className={`p-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                    <Download className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>2. Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></span>
                  </div>
                </div>
              )}

              {/* Desktop Steps */}
              {!isIOS && !isAndroid && (
                <div className="space-y-2 mb-5 text-xs">
                  <div className={`p-3 rounded-xl flex items-center gap-3 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                    <Download className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Look for the <strong>Install Icon (⊕)</strong> in your browser address bar</span>
                  </div>
                </div>
              )}

              <button
                onClick={async () => {
                  setShowInstallModal(false);
                  await install();
                }}
                className="w-full h-11 mb-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-soft-md"
              >
                <Download className="w-4 h-4" />
                <span>Try Direct Install Again</span>
              </button>

              <button
                onClick={() => setShowInstallModal(false)}
                className={`w-full h-9 rounded-xl font-semibold text-xs cursor-pointer ${
                  isDark ? 'bg-zinc-900 text-zinc-400 hover:text-white' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

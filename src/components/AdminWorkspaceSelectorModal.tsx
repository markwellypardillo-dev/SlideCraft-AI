import React from 'react';
import { ShieldCheck, X, Activity, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AdminWorkspaceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAdminDashboard: () => void;
  onSelectNormalDashboard: () => void;
  currentMode: 'studio' | 'admin';
  userEmail?: string | null;
  isDark: boolean;
}

export const AdminWorkspaceSelectorModal: React.FC<AdminWorkspaceSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectAdminDashboard,
  onSelectNormalDashboard,
  currentMode,
  userEmail,
  isDark,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Soft blurred backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card with Soft Shadows - NO solid borders */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full max-w-xl rounded-3xl p-7 transition-all shadow-soft-xl animate-in zoom-in-95 duration-200 ${
          isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className={`absolute top-5 right-5 p-2 rounded-full transition-colors cursor-pointer ${
            isDark
              ? 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
              : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Admin Badge */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-soft-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold tracking-tight">Admin Authorization Verified</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-400">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Logged in as <span className="font-semibold text-indigo-400">{userEmail || 'pmarkwelly@gmail.com'}</span>
            </p>
          </div>
        </div>

        <p className={`text-xs mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          Select which environment you would like to open. You can switch seamlessly between the administrative management suite and standard studio workspace at any time.
        </p>

        {/* Two Options Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* OPTION 1: ADMIN DASHBOARD */}
          <button
            onClick={() => {
              onSelectAdminDashboard();
              onClose();
            }}
            className={`text-left p-5 rounded-2xl transition-all duration-200 cursor-pointer group flex flex-col justify-between relative shadow-soft-md hover:shadow-soft-lg hover:scale-[1.02] ${
              currentMode === 'admin'
                ? isDark
                  ? 'bg-gradient-to-b from-purple-950/60 to-zinc-900 ring-2 ring-purple-500/50 text-white'
                  : 'bg-gradient-to-b from-purple-50 to-white ring-2 ring-purple-400 text-zinc-900'
                : isDark
                ? 'bg-zinc-900/90 hover:bg-zinc-850 text-zinc-200'
                : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800'
            }`}
          >
            {currentMode === 'admin' && (
              <span className="absolute top-3 right-3 text-purple-400">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            )}
            <div>
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold mb-1">Admin Operations Console</h3>
              <p className="text-[11px] leading-relaxed text-zinc-400 mb-4">
                Master Slide Template Architect (Canva &amp; PPT Studio), live telemetry logs, active users, Gemini API token consumption, and analytics.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Open Admin Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* OPTION 2: NORMAL STUDIO DASHBOARD */}
          <button
            onClick={() => {
              onSelectNormalDashboard();
              onClose();
            }}
            className={`text-left p-5 rounded-2xl transition-all duration-200 cursor-pointer group flex flex-col justify-between relative shadow-soft-md hover:shadow-soft-lg hover:scale-[1.02] ${
              currentMode === 'studio'
                ? isDark
                  ? 'bg-gradient-to-b from-indigo-950/60 to-zinc-900 ring-2 ring-indigo-500/50 text-white'
                  : 'bg-gradient-to-b from-indigo-50 to-white ring-2 ring-indigo-400 text-zinc-900'
                : isDark
                ? 'bg-zinc-900/90 hover:bg-zinc-850 text-zinc-200'
                : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800'
            }`}
          >
            {currentMode === 'studio' && (
              <span className="absolute top-3 right-3 text-indigo-400">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            )}
            <div>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold mb-1">Normal Studio Workspace</h3>
              <p className="text-[11px] leading-relaxed text-zinc-400 mb-4">
                Upload curriculum documents, architect custom slide decks, view DALL-E visual prompts, run teleprompter practice, and export PPTX.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
              <span>Open Studio Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        {/* Footer Note */}
        <div className={`text-[11px] flex items-center justify-between pt-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
            Quick shortcut: Switch anytime from the top navigation bar.
          </span>
          <button
            onClick={onClose}
            className="font-semibold underline hover:text-zinc-300 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

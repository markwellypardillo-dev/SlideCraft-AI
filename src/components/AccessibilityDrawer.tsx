import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { SlideDeck } from '../types/deck';
import { runAccessibilityCheckAPI, AccessibilityAuditResult } from '../services/deckService';

interface AccessibilityDrawerProps {
  deck: SlideDeck;
  onClose: () => void;
  isDark: boolean;
}

export const AccessibilityDrawer: React.FC<AccessibilityDrawerProps> = ({
  deck,
  onClose,
  isDark,
}) => {
  const [audit, setAudit] = useState<AccessibilityAuditResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAudit = async () => {
    setIsLoading(true);
    try {
      const res = await runAccessibilityCheckAPI(deck);
      setAudit(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [deck]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-xl rounded-3xl shadow-soft-lg flex flex-col overflow-hidden transition-all ${
        isDark ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-900'
      }`}>
        {/* Header with soft shadow */}
        <div className={`p-5 flex items-center justify-between shadow-soft-xs ${
          isDark ? 'bg-zinc-900/60' : 'bg-zinc-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-soft-xs ${
              isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-800'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-zinc-900'}`}>Accessibility & UDL Audit</h3>
              <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Cognitive load and screen-reader analysis</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-all shadow-soft-xs cursor-pointer ${
              isDark ? 'bg-zinc-900 text-zinc-400 hover:text-white' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2 text-zinc-400">
              <RefreshCw className="w-5 h-5 animate-spin text-zinc-500" />
              <p className="text-xs">Analyzing deck accessibility...</p>
            </div>
          ) : audit ? (
            <>
              {/* Score Card */}
              <div className={`p-5 rounded-3xl shadow-soft flex items-center justify-between gap-4 transition-all ${
                isDark
                  ? 'bg-zinc-900/80 text-white'
                  : 'bg-zinc-50 text-zinc-900'
              }`}>
                <div className="space-y-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Inclusivity Score</span>
                  <div className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    {audit.overallScore} / 100
                  </div>
                  <p className={`text-xs font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{audit.rating}</p>
                </div>

                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-sm font-extrabold shadow-soft-md ${
                  isDark ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-900'
                }`}>
                  {audit.overallScore}%
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className={`p-3 rounded-2xl shadow-soft-xs ${
                  isDark ? 'bg-zinc-900/60' : 'bg-zinc-50'
                }`}>
                  <span className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Avg Words / Slide</span>
                  <p className={`font-bold mt-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{audit.metrics.avgWordsPerSlide}</p>
                </div>
                <div className={`p-3 rounded-2xl shadow-soft-xs ${
                  isDark ? 'bg-zinc-900/60' : 'bg-zinc-50'
                }`}>
                  <span className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Anti-Clutter</span>
                  <p className={`font-bold mt-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{audit.metrics.antiClutterCompliance}</p>
                </div>
                <div className={`p-3 rounded-2xl shadow-soft-xs ${
                  isDark ? 'bg-zinc-900/60' : 'bg-zinc-50'
                }`}>
                  <span className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Alt-Text Coverage</span>
                  <p className={`font-bold mt-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{audit.metrics.altTextCoverage}</p>
                </div>
                <div className={`p-3 rounded-2xl shadow-soft-xs ${
                  isDark ? 'bg-zinc-900/60' : 'bg-zinc-50'
                }`}>
                  <span className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Speaker Notes</span>
                  <p className={`font-bold mt-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{audit.metrics.speakerNotesCoverage}</p>
                </div>
              </div>

              {/* Standards Checklist */}
              <div className="space-y-2">
                <h4 className={`font-bold text-[11px] uppercase tracking-wider ${
                  isDark ? 'text-zinc-400' : 'text-zinc-600'
                }`}>
                  Standards Checklist
                </h4>
                <div className="space-y-1.5">
                  {audit.wcagStandards.map((std, idx) => (
                    <div key={idx} className={`p-3 rounded-2xl shadow-soft-xs flex items-start gap-2.5 text-xs ${
                      isDark ? 'bg-zinc-900/40' : 'bg-zinc-50'
                    }`}>
                      <CheckCircle2 className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                      <div>
                        <div className={`font-bold flex items-center gap-2 ${
                          isDark ? 'text-white' : 'text-zinc-900'
                        }`}>
                          <span>{std.standard}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-lg shadow-soft-xs ${
                            isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-800'
                          }`}>
                            {std.status}
                          </span>
                        </div>
                        <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{std.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

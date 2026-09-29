import React, { useState } from 'react';
import {
  X,
  FileDown,
  FileCode,
  FileText,
  Printer,
  Copy,
  Check,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { SlideDeck } from '../types/deck';
import {
  exportToPPTX,
  exportToWordHandout,
  exportToGammaMarkdown,
  exportQuizzesToCSV,
  triggerPrintPDF,
} from '../services/exportService';

interface ExportModalProps {
  deck: SlideDeck;
  onClose: () => void;
  isDark: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({ deck, onClose, isDark }) => {
  const [isExportingPPTX, setIsExportingPPTX] = useState<boolean>(false);
  const [copiedGamma, setCopiedGamma] = useState<boolean>(false);

  const handleExportPPTX = async () => {
    setIsExportingPPTX(true);
    try {
      await exportToPPTX(deck);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingPPTX(false);
    }
  };

  const handleCopyGamma = () => {
    const md = exportToGammaMarkdown(deck);
    navigator.clipboard.writeText(md);
    setCopiedGamma(true);
    setTimeout(() => setCopiedGamma(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-2xl rounded-3xl shadow-soft-lg flex flex-col overflow-hidden transition-all ${
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
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-zinc-900'}`}>Export Presentation</h3>
              <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Download formatted files or copy AI markdown</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              isDark ? 'bg-zinc-900 text-zinc-400 hover:text-white' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options List */}
        <div className="p-5 space-y-3 max-h-[75vh] overflow-y-auto scrollbar-none">
          {/* 1. PPTX */}
          <div className={`p-4 rounded-2xl shadow-soft-sm flex items-center justify-between gap-4 transition-all ${
            isDark ? 'bg-zinc-900/60' : 'bg-zinc-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-soft-xs ${
                isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-800'
              }`}>
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-zinc-900'}`}>PowerPoint (.pptx)</h4>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400">
                    Native Artwork Embedded
                  </span>
                </div>
                <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>With embedded custom illustrations, full layouts & presenter speaker notes</p>
              </div>
            </div>

            <button
              onClick={handleExportPPTX}
              disabled={isExportingPPTX}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-soft-xs cursor-pointer disabled:opacity-50 ${
                isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPPTX ? 'Building...' : '.pptx'}</span>
            </button>
          </div>

          {/* 2. Word Handout */}
          <div className={`p-4 rounded-2xl shadow-soft-sm flex items-center justify-between gap-4 transition-all ${
            isDark ? 'bg-zinc-900/60' : 'bg-zinc-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-soft-xs ${
                isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-800'
              }`}>
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-zinc-900'}`}>Teacher Lesson Plan & Handout (.doc)</h4>
                <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Structured lesson guide with student fill-in blanks</p>
              </div>
            </div>

            <button
              onClick={() => exportToWordHandout(deck)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-soft-xs cursor-pointer ${
                isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>.doc</span>
            </button>
          </div>

          {/* 3. PDF Print */}
          <div className={`p-4 rounded-2xl shadow-soft-sm flex items-center justify-between gap-4 transition-all ${
            isDark ? 'bg-zinc-900/60' : 'bg-zinc-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-soft-xs ${
                isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-800'
              }`}>
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-zinc-900'}`}>Printable Lecture Guide (.pdf)</h4>
                <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Clean print-ready slides for handouts or binders</p>
              </div>
            </div>

            <button
              onClick={() => triggerPrintPDF()}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-soft-xs cursor-pointer ${
                isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>

          {/* 4. Gamma Markdown */}
          <div className={`p-4 rounded-2xl shadow-soft-sm flex items-center justify-between gap-4 transition-all ${
            isDark ? 'bg-zinc-900/60' : 'bg-zinc-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-soft-xs ${
                isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-800'
              }`}>
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-zinc-900'}`}>Copy for Presentation Tools (Gamma, Tome, Canva, AI)</h4>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500/15 text-indigo-400">
                    Strict {deck.slides.length}-Slide Prompt
                  </span>
                </div>
                <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Clean slide content &amp; visual prompts with AI slide-count enforcement (teleprompter excluded for clean presentation creation)</p>
              </div>
            </div>

            <button
              onClick={handleCopyGamma}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-soft-xs cursor-pointer ${
                isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              {copiedGamma ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* 5. Kahoot CSV */}
          <div className={`p-4 rounded-2xl shadow-soft-sm flex items-center justify-between gap-4 transition-all ${
            isDark ? 'bg-zinc-900/60' : 'bg-zinc-50'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-soft-xs ${
                isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-800'
              }`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-zinc-900'}`}>Kahoot! / Quiz CSV</h4>
                <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Spreadsheet ready for bulk classroom quiz import</p>
              </div>
            </div>

            <button
              onClick={() => exportQuizzesToCSV(deck)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-soft-xs cursor-pointer ${
                isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

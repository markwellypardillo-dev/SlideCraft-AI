import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Clock,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  Flame,
  Volume2,
  Copy,
  Check,
  Eye,
  FileText,
} from 'lucide-react';
import { SlideDeck, TypographyPreset } from '../types/deck';
import { SlideVisualCanvas } from './SlideVisualCanvas';

interface PresenterPracticeModeProps {
  deck: SlideDeck;
  onClose: () => void;
  isDark: boolean;
}

export const PresenterPracticeMode: React.FC<PresenterPracticeModeProps> = ({
  deck,
  onClose,
  isDark,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [typography] = useState<TypographyPreset>('modern');
  const [teleprompterSize, setTeleprompterSize] = useState<'md' | 'lg' | 'xl'>('lg');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'slide' | 'teleprompter'>('slide');

  const currentSlide = deck.slides[currentSlideIndex] || deck.slides[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(deck.slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck.slides.length, onClose]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col overflow-hidden select-none transition-colors duration-200 ${
      isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'
    }`}>
      {/* Top Bar */}
      <header className={`h-14 sm:h-16 px-3 sm:px-6 backdrop-blur-xl flex items-center justify-between gap-2 transition-colors shadow-soft-sm z-10 ${
        isDark ? 'bg-zinc-900/90 text-white' : 'bg-white/95 text-zinc-900'
      }`}>
        <div className="flex items-center gap-2 min-w-0 shrink">
          <button
            onClick={onClose}
            className={`p-2 rounded-xl shadow-soft-xs transition-all cursor-pointer shrink-0 ${
              isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
            }`}
            title="Exit Rehearsal (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="min-w-0 shrink">
            <div className="flex items-center gap-1.5 min-w-0">
              {deck.session && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-purple-500/20 text-purple-400 shrink-0">
                  {deck.session}
                </span>
              )}
              <h3 className={`font-bold text-xs sm:text-sm truncate hidden xs:block ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {deck.title}
              </h3>
            </div>
            <span className={`text-[10px] hidden md:block ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Presenter Teleprompter & Real-Time Teaching Cues</span>
          </div>
        </div>

        {/* Pacing Timer & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Tab Switcher (Visible on small screens) */}
          <div className={`lg:hidden flex rounded-xl p-0.5 shadow-soft-xs ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
            <button
              onClick={() => setMobileTab('slide')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                mobileTab === 'slide'
                  ? 'bg-indigo-600 text-white shadow-soft-xs'
                  : isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Slide</span>
            </button>
            <button
              onClick={() => setMobileTab('teleprompter')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                mobileTab === 'teleprompter'
                  ? 'bg-indigo-600 text-white shadow-soft-xs'
                  : isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Script</span>
            </button>
          </div>

          {/* Teleprompter Size Selector */}
          <div className={`hidden sm:flex items-center rounded-xl p-0.5 shadow-soft-xs text-[11px] font-bold ${
            isDark ? 'bg-zinc-950 text-zinc-400' : 'bg-zinc-100 text-zinc-600'
          }`}>
            <button
              onClick={() => setTeleprompterSize('md')}
              className={`px-2 py-0.5 rounded-lg transition-all ${teleprompterSize === 'md' ? isDark ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-900 shadow-soft-xs' : ''}`}
            >
              A
            </button>
            <button
              onClick={() => setTeleprompterSize('lg')}
              className={`px-2 py-0.5 rounded-lg text-xs transition-all ${teleprompterSize === 'lg' ? isDark ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-900 shadow-soft-xs' : ''}`}
            >
              A+
            </button>
            <button
              onClick={() => setTeleprompterSize('xl')}
              className={`px-2 py-0.5 rounded-lg text-sm transition-all ${teleprompterSize === 'xl' ? isDark ? 'bg-zinc-800 text-white' : 'bg-white text-zinc-900 shadow-soft-xs' : ''}`}
            >
              A++
            </button>
          </div>

          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-mono font-bold shadow-soft-xs ${
            isDark ? 'bg-zinc-950 text-zinc-200' : 'bg-zinc-100 text-zinc-800'
          }`}>
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className={`p-1.5 rounded-xl shadow-soft-xs cursor-pointer ${
              isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-zinc-100 text-zinc-700 hover:text-zinc-900'
            }`}
            title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
          >
            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          <button
            onClick={() => setSecondsElapsed(0)}
            className={`p-1.5 rounded-xl shadow-soft-xs cursor-pointer ${
              isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-zinc-100 text-zinc-700 hover:text-zinc-900'
            }`}
            title="Reset timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className={`hidden sm:block p-1.5 rounded-xl shadow-soft-xs cursor-pointer ${
              isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white' : 'bg-zinc-100 text-zinc-700 hover:text-zinc-900'
            }`}
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* Main Dual Stage */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden">
        {/* LEFT: SLIDE PREVIEW */}
        <div className={`lg:col-span-6 p-3 sm:p-6 flex flex-col justify-between overflow-y-auto ${
          mobileTab === 'slide' ? 'block' : 'hidden lg:flex'
        } ${isDark ? 'bg-zinc-950' : 'bg-zinc-100/50'}`}>
          <div className="w-full max-w-2xl mx-auto py-1 sm:py-2">
            <SlideVisualCanvas
              slide={currentSlide}
              deck={deck}
              isDark={isDark}
              typography={typography}
            />
          </div>

          {/* Touch-Friendly Navigation Bar */}
          <div className="pt-4 flex items-center justify-between max-w-2xl mx-auto w-full gap-2">
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className={`h-11 px-5 rounded-2xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-30 shadow-soft-sm transition-all cursor-pointer ${
                isDark ? 'bg-zinc-900 text-zinc-200 hover:bg-zinc-800' : 'bg-white text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <span className={`text-xs font-mono font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {currentSlideIndex + 1} / {deck.slides.length}
            </span>

            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.min(deck.slides.length - 1, prev + 1))}
              disabled={currentSlideIndex === deck.slides.length - 1}
              className={`h-11 px-5 rounded-2xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-30 transition-all cursor-pointer shadow-soft-sm ${
                isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
              }`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT: TURNKEY TEACHER TELEPROMPTER & EXPLANATION GUIDE */}
        <div className={`lg:col-span-6 p-4 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-4 shadow-soft-xl ${
          mobileTab === 'teleprompter' ? 'block' : 'hidden lg:flex'
        } ${isDark ? 'bg-zinc-900/95 border-0' : 'bg-white border-0'}`}>
          <div className="space-y-4">
            {/* Header / Pacing Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  Teacher Teleprompter ({currentSlide.estimatedTime})
                </span>
              </div>
              <button
                onClick={() => handleCopy(currentSlide.speakerNotes, `teleprompter-${currentSlide.id}`)}
                className={`text-[11px] font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer transition-all shadow-soft-xs ${
                  isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                }`}
              >
                {copiedKey === `teleprompter-${currentSlide.id}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Script</span>
                  </>
                )}
              </button>
            </div>

            {/* Main Script Teleprompter Card */}
            <div className={`p-5 sm:p-6 rounded-3xl shadow-soft-lg transition-all border-0 ${
              teleprompterSize === 'xl' ? 'text-lg leading-relaxed' : teleprompterSize === 'lg' ? 'text-base leading-relaxed' : 'text-sm leading-relaxed'
            } ${
              isDark ? 'bg-zinc-950/90 text-zinc-100' : 'bg-zinc-50 text-zinc-900 font-normal'
            }`}>
              <div className="whitespace-pre-line font-sans space-y-3">
                {currentSlide.speakerNotes}
              </div>
            </div>

            {/* Check for Understanding Card */}
            {currentSlide.assessment && (
              <div className={`p-4 rounded-2xl shadow-soft-md space-y-2 border-0 ${
                isDark ? 'bg-zinc-950/90' : 'bg-emerald-50/70'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Interactive Comprehension Check
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {currentSlide.assessment.type === 'multiple_choice' ? 'Multiple Choice' : 'Discussion Inquiry'}
                  </span>
                </div>
                <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {currentSlide.assessment.question}
                </p>
                {currentSlide.assessment.correctAnswer && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                    ✓ Correct Answer: {currentSlide.assessment.correctAnswer}
                  </div>
                )}
                {currentSlide.assessment.explanation && (
                  <p className="text-[11px] text-zinc-500 italic leading-relaxed">
                    Why: {currentSlide.assessment.explanation}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className={`text-[11px] text-center pt-3 border-t ${isDark ? 'border-zinc-800/60 text-zinc-500' : 'border-zinc-100 text-zinc-400'}`}>
            Advance with <kbd className={`px-1.5 py-0.5 rounded font-bold shadow-soft-xs ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'}`}>Space</kbd> or <kbd className={`px-1.5 py-0.5 rounded font-bold shadow-soft-xs ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'}`}>→</kbd>. Press <kbd className={`px-1.5 py-0.5 rounded font-bold shadow-soft-xs ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'}`}>Esc</kbd> to exit.
          </div>
        </div>
      </div>
    </div>
  );
};

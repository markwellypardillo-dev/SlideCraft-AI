import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Wand2,
  Type,
  Layout,
  Play,
  Copy,
  Check,
  LayoutTemplate,
  Palette,
  MessageSquare,
  HelpCircle,
  Eye,
  FileText,
  LayoutGrid,
  FileDown,
  BookOpen,
  Cloud,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Split,
  TrendingUp,
  GitCommit,
  Quote,
  Sliders,
  Maximize2,
} from 'lucide-react';
import { SlideItem, LayoutType, TypographyPreset } from '../types/deck';

interface FloatingCanvasDockProps {
  currentSlide: SlideItem;
  typography: TypographyPreset;
  onChangeTypography: (preset: TypographyPreset) => void;
  onChangeLayout: (layout: LayoutType) => void;
  onApplyMagic: (action: 'simplify' | 'expand' | 'translate' | 'reprompt') => void;
  isApplyingMagic: boolean;
  onOpenPresenter: () => void;
  onCopySlide: () => void;
  isCopiedSlide: boolean;
  activeInspectorPanel: 'visual' | 'notes' | 'assessment' | 'none';
  onToggleInspectorPanel: (panel: 'visual' | 'notes' | 'assessment') => void;
  isDark: boolean;
  // Consolidated Workspace Controls
  viewMode: 'canvas' | 'outline' | 'grid';
  onViewModeChange: (mode: 'canvas' | 'outline' | 'grid') => void;
  onOpenCompanion?: () => void;
  onOpenExport?: () => void;
  onSaveDeckToCloud?: () => void;
  isSavingToCloud?: boolean;
}

export const FloatingCanvasDock: React.FC<FloatingCanvasDockProps> = ({
  currentSlide,
  typography,
  onChangeTypography,
  onChangeLayout,
  onApplyMagic,
  isApplyingMagic,
  onOpenPresenter,
  onCopySlide,
  isCopiedSlide,
  activeInspectorPanel,
  onToggleInspectorPanel,
  isDark,
  viewMode,
  onViewModeChange,
  onOpenCompanion,
  onOpenExport,
  onSaveDeckToCloud,
  isSavingToCloud = false,
}) => {
  const [openDropdown, setOpenDropdown] = useState<'magic' | 'typography' | 'layout' | 'tools' | null>(null);

  // Horizontal Scroll & Drag-to-Pan State
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Check scroll boundary state
  const checkScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // Allow 4px margin of error for subpixel scaling
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScrollState();
    const timeout = setTimeout(checkScrollState, 250);

    const onScroll = () => checkScrollState();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', checkScrollState);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => checkScrollState());
      resizeObserver.observe(el);
    }

    return () => {
      clearTimeout(timeout);
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', checkScrollState);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [checkScrollState]);

  // Convert mouse wheel vertically into horizontal pan when over dock
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const { scrollLeft, scrollWidth, clientWidth } = el;
        const canLeft = scrollLeft > 4;
        const canRight = scrollLeft + clientWidth < scrollWidth - 4;
        if ((e.deltaY > 0 && canRight) || (e.deltaY < 0 && canLeft)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
          checkScrollState();
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, [checkScrollState]);

  // Mouse Drag to Pan
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    isMouseDownRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
    hasMovedRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.4;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
      setIsDragging(true);
      el.scrollLeft = scrollLeftRef.current - walk;
      checkScrollState();
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    if (isDragging) {
      setTimeout(() => {
        setIsDragging(false);
        hasMovedRef.current = false;
      }, 60);
    }
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasMovedRef.current = false;
    }
  };

  const handleScrollBy = (amount: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkScrollState, 300);
  };

  const toggleDropdown = (key: 'magic' | 'typography' | 'layout' | 'tools') => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  const layoutTypes: { id: LayoutType; label: string; icon: any }[] = [
    { id: 'Title Hero', label: 'Title Hero', icon: LayoutTemplate },
    { id: 'Split Comparison 50/50', label: 'Split Comparison', icon: Split },
    { id: 'Big Stat / Callout', label: 'Big Stat / Metric', icon: TrendingUp },
    { id: '3-Column Grid', label: '3-Column Grid', icon: LayoutGrid },
    { id: 'Timeline Flow', label: 'Timeline Flow', icon: GitCommit },
    { id: 'Teacher-Led Discussion Prompt', label: 'Discussion Socratic', icon: Quote },
  ];

  const typographyPresets: { id: TypographyPreset; label: string; description: string; sample: string }[] = [
    { id: 'modern', label: 'Modern Minimal', description: 'Clean geometric sans-serif for tech & science', sample: 'Aa Bb' },
    { id: 'academic', label: 'Editorial Academic', description: 'Refined serif titles + crisp academic body', sample: 'Aa Bb' },
    { id: 'technical', label: 'Technical STEM', description: 'High-contrast monospace & structured grid', sample: '01 02' },
    { id: 'creative', label: 'Warm Creative', description: 'Expressive editorial display for workshops', sample: 'Aa Bb' },
  ];

  return (
    <div className="relative flex flex-col items-center z-30">
      {/* Click-outside backdrop to dismiss dropdowns smoothly */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      {/* DROPDOWN POPUPS */}
      {/* 1. Magic Wand Popover */}
      {openDropdown === 'magic' && (
        <div
          className={`absolute bottom-full mb-3 w-[calc(100vw-2rem)] max-w-sm sm:w-80 p-3.5 rounded-3xl shadow-soft-2xl z-40 backdrop-blur-xl border animate-in fade-in slide-in-from-bottom-2 ${
            isDark ? 'bg-zinc-900/95 border-zinc-800 text-white' : 'bg-white/95 border-zinc-200 text-zinc-900'
          }`}
        >
          <div className="flex items-center justify-between pb-2 mb-2 text-xs border-b border-zinc-800/40">
            <span className="font-bold flex items-center gap-1.5 text-indigo-400">
              <Wand2 className="w-3.5 h-3.5" />
              Slide AI Magic Wand
            </span>
            <span className="text-[10px] text-zinc-500">Gemini Engine</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => {
                onApplyMagic('simplify');
                setOpenDropdown(null);
              }}
              disabled={isApplyingMagic}
              className={`p-3 rounded-2xl text-left shadow-soft-xs transition-all cursor-pointer ${
                isDark
                  ? 'bg-zinc-950 hover:bg-zinc-850 text-zinc-200'
                  : 'bg-zinc-100 hover:bg-zinc-200/70 text-zinc-800'
              }`}
            >
              <div className="font-bold text-indigo-400">Simplify</div>
              <div className="text-[10px] text-zinc-400">Lower cognitive load</div>
            </button>

            <button
              onClick={() => {
                onApplyMagic('expand');
                setOpenDropdown(null);
              }}
              disabled={isApplyingMagic}
              className={`p-3 rounded-2xl text-left shadow-soft-xs transition-all cursor-pointer ${
                isDark
                  ? 'bg-zinc-950 hover:bg-zinc-850 text-zinc-200'
                  : 'bg-zinc-100 hover:bg-zinc-200/70 text-zinc-800'
              }`}
            >
              <div className="font-bold text-purple-400">Deepen</div>
              <div className="text-[10px] text-zinc-400">Academic rigor & proof</div>
            </button>

            <button
              onClick={() => {
                onApplyMagic('reprompt');
                setOpenDropdown(null);
              }}
              disabled={isApplyingMagic}
              className={`p-3 rounded-2xl text-left shadow-soft-xs transition-all cursor-pointer ${
                isDark
                  ? 'bg-zinc-950 hover:bg-zinc-850 text-zinc-200'
                  : 'bg-zinc-100 hover:bg-zinc-200/70 text-zinc-800'
              }`}
            >
              <div className="font-bold text-pink-400">New Visual Prompt</div>
              <div className="text-[10px] text-zinc-400">Fresh DALL-E direction</div>
            </button>

            <button
              onClick={() => {
                onApplyMagic('translate');
                setOpenDropdown(null);
              }}
              disabled={isApplyingMagic}
              className={`p-3 rounded-2xl text-left shadow-soft-xs transition-all cursor-pointer ${
                isDark
                  ? 'bg-zinc-950 hover:bg-zinc-850 text-zinc-200'
                  : 'bg-zinc-100 hover:bg-zinc-200/70 text-zinc-800'
              }`}
            >
              <div className="font-bold text-emerald-400">Translate (ES)</div>
              <div className="text-[10px] text-zinc-400">Multilingual version</div>
            </button>
          </div>
        </div>
      )}

      {/* 2. Typography Preset Switcher Popover */}
      {openDropdown === 'typography' && (
        <div
          className={`absolute bottom-full mb-3 w-[calc(100vw-2rem)] max-w-sm sm:w-80 p-3.5 rounded-3xl shadow-soft-2xl z-40 backdrop-blur-xl border animate-in fade-in slide-in-from-bottom-2 ${
            isDark ? 'bg-zinc-900/95 border-zinc-800 text-white' : 'bg-white/95 border-zinc-200 text-zinc-900'
          }`}
        >
          <div className="flex items-center justify-between pb-2 mb-2 text-xs border-b border-zinc-800/40">
            <span className="font-bold flex items-center gap-1.5 text-indigo-400">
              <Type className="w-3.5 h-3.5" />
              Curated Slide Typography
            </span>
            <span className="text-[10px] text-zinc-500">Lecture-Hall Font Pairings</span>
          </div>

          <div className="space-y-1.5">
            {typographyPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  onChangeTypography(preset.id);
                  setOpenDropdown(null);
                }}
                className={`w-full p-2.5 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer ${
                  typography === preset.id
                    ? isDark
                      ? 'bg-zinc-850 text-white shadow-soft-sm'
                      : 'bg-zinc-200/80 text-zinc-950 shadow-soft-sm'
                    : isDark
                    ? 'bg-zinc-950/70 hover:bg-zinc-850 text-zinc-300 shadow-soft-xs'
                    : 'bg-zinc-100 hover:bg-zinc-200/70 text-zinc-800 shadow-soft-xs'
                }`}
              >
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span>{preset.label}</span>
                    {typography === preset.id && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">{preset.description}</div>
                </div>

                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  preset.id === 'academic' ? 'font-serif italic' : preset.id === 'technical' ? 'font-mono' : 'font-sans'
                }`}>
                  {preset.sample}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Layout Archetype Switcher Popover */}
      {openDropdown === 'layout' && (
        <div
          className={`absolute bottom-full mb-3 w-[calc(100vw-2rem)] max-w-sm sm:w-80 p-3.5 rounded-3xl shadow-soft-2xl z-40 backdrop-blur-xl border animate-in fade-in slide-in-from-bottom-2 ${
            isDark ? 'bg-zinc-900/95 border-zinc-800 text-white' : 'bg-white/95 border-zinc-200 text-zinc-900'
          }`}
        >
          <div className="flex items-center justify-between pb-2 mb-2 text-xs border-b border-zinc-800/40">
            <span className="font-bold flex items-center gap-1.5 text-indigo-400">
              <Layout className="w-3.5 h-3.5" />
              Slide Layout Archetypes
            </span>
            <span className="text-[10px] text-zinc-500">Pedagogical Compositions</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {layoutTypes.map((item) => {
              const Icon = item.icon;
              const isCurrent = currentSlide.layoutType === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onChangeLayout(item.id);
                    setOpenDropdown(null);
                  }}
                  className={`p-2.5 rounded-2xl text-left transition-all flex items-center gap-2 cursor-pointer ${
                    isCurrent
                      ? isDark
                        ? 'bg-zinc-850 text-white font-bold shadow-soft-sm'
                        : 'bg-zinc-200/90 text-zinc-950 font-bold shadow-soft-sm'
                      : isDark
                      ? 'bg-zinc-950/70 hover:bg-zinc-850 text-zinc-300 shadow-soft-xs'
                      : 'bg-zinc-100 hover:bg-zinc-200/70 text-zinc-800 shadow-soft-xs'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-indigo-400' : 'text-zinc-400'}`} />
                  <span className="text-[11px] font-semibold truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. More Tools & Export Popover */}
      {openDropdown === 'tools' && (
        <div
          className={`absolute bottom-full mb-3 w-[calc(100vw-2rem)] max-w-sm sm:w-72 p-3.5 rounded-3xl shadow-soft-2xl z-40 backdrop-blur-xl border animate-in fade-in slide-in-from-bottom-2 space-y-1.5 ${
            isDark ? 'bg-zinc-900/95 border-zinc-800 text-white' : 'bg-white/95 border-zinc-200 text-zinc-900'
          }`}
        >
          <div className="flex items-center justify-between pb-2 mb-1 text-xs border-b border-zinc-800/40">
            <span className="font-bold flex items-center gap-1.5 text-indigo-400">
              <Sliders className="w-3.5 h-3.5" />
              Workspace Tools
            </span>
            <span className="text-[10px] text-zinc-500">Quick Actions</span>
          </div>

          {onOpenCompanion && (
            <button
              onClick={() => {
                onOpenCompanion();
                setOpenDropdown(null);
              }}
              className={`w-full p-2.5 rounded-2xl text-left text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isDark ? 'hover:bg-zinc-800 text-zinc-200' : 'hover:bg-zinc-100 text-zinc-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Cornell Notes Companion</span>
            </button>
          )}

          {onSaveDeckToCloud && (
            <button
              onClick={() => {
                onSaveDeckToCloud();
                setOpenDropdown(null);
              }}
              disabled={isSavingToCloud}
              className={`w-full p-2.5 rounded-2xl text-left text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isDark ? 'hover:bg-zinc-800 text-zinc-200' : 'hover:bg-zinc-100 text-zinc-800'
              }`}
            >
              <Cloud className={`w-4 h-4 ${isSavingToCloud ? 'animate-pulse text-zinc-400' : 'text-emerald-400'}`} />
              <span>{isSavingToCloud ? 'Saving to Cloud...' : 'Save Deck to Firestore Cloud'}</span>
            </button>
          )}

          {onOpenExport && (
            <button
              onClick={() => {
                onOpenExport();
                setOpenDropdown(null);
              }}
              className={`w-full p-2.5 rounded-2xl text-left text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isDark ? 'hover:bg-zinc-800 text-zinc-200' : 'hover:bg-zinc-100 text-zinc-800'
              }`}
            >
              <FileDown className="w-4 h-4 text-purple-400" />
              <span>Export Slide Deck (HTML / PDF / MD)</span>
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FIGMA-STYLE CONSOLIDATED FLOATING CANVAS DOCK WITH PAN & OVERFLOW AFFORDANCES */}
      {/* ========================================================================= */}
      <div className="relative max-w-full flex items-center justify-center">
        {/* Left Scroll Gradient Fade & Action Button */}
        {canScrollLeft && (
          <>
            <div
              className={`pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-16 rounded-l-2xl sm:rounded-l-full z-20 transition-opacity duration-300 ${
                isDark
                  ? 'bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent'
                  : 'bg-gradient-to-r from-white via-white/80 to-transparent'
              }`}
            />
            <button
              type="button"
              onClick={() => handleScrollBy(-220)}
              aria-label="Scroll left to view previous controls"
              className={`absolute left-1 sm:left-1.5 top-1/2 -translate-y-1/2 z-30 p-1.5 sm:p-2 rounded-full shadow-lg border backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center ${
                isDark
                  ? 'bg-zinc-900/95 hover:bg-indigo-600 text-zinc-200 hover:text-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.6)]'
                  : 'bg-white/95 hover:bg-indigo-600 text-zinc-700 hover:text-white border-zinc-200 shadow-md'
              }`}
              title="Scroll left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Scrollable & Draggable Dock Container */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClickCapture={handleClickCapture}
          className={`px-3.5 py-2.5 rounded-2xl sm:rounded-full shadow-2xl flex items-center gap-1.5 sm:gap-2.5 backdrop-blur-2xl border transition-all duration-300 max-w-[calc(100vw-1.5rem)] overflow-x-auto scrollbar-none shrink-0 touch-pan-x select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          } ${
            isDark
              ? 'bg-zinc-950/85 border-white/10 text-white shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
              : 'bg-white/90 border-zinc-200/90 text-zinc-900 shadow-[0_15px_35px_rgba(0,0,0,0.08)]'
          }`}
          style={{ scrollBehavior: 'smooth' }}
        >
          {/* SEGMENT 1: VIEW MODE SWITCHER (Figma Tool Switcher) */}
          <div className={`p-0.5 rounded-xl sm:rounded-full flex items-center shrink-0 ${
            isDark ? 'bg-zinc-950/80' : 'bg-zinc-100'
          }`}>
            <button
              onClick={() => onViewModeChange('canvas')}
              className={`px-2.5 py-1.5 rounded-lg sm:rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'canvas'
                  ? isDark ? 'bg-indigo-600 text-white shadow-soft-xs' : 'bg-white text-zinc-900 shadow-soft-xs'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Interactive Visual Canvas"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Canvas</span>
            </button>
            <button
              onClick={() => onViewModeChange('outline')}
              className={`px-2.5 py-1.5 rounded-lg sm:rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'outline'
                  ? isDark ? 'bg-indigo-600 text-white shadow-soft-xs' : 'bg-white text-zinc-900 shadow-soft-xs'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Markdown Curriculum Outline"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Outline</span>
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-2.5 py-1.5 rounded-lg sm:rounded-full text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? isDark ? 'bg-indigo-600 text-white shadow-soft-xs' : 'bg-white text-zinc-900 shadow-soft-xs'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="All Slides Grid Overview"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Grid</span>
            </button>
          </div>

          <div className="w-[1px] h-5 bg-zinc-700/30 mx-0.5 shrink-0" />

          {/* SEGMENT 2: SLIDE FORMATTING CONTROLS */}
          {/* Magic Wand */}
          <button
            onClick={() => toggleDropdown('magic')}
            disabled={isApplyingMagic}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              openDropdown === 'magic'
                ? 'bg-indigo-600 text-white shadow-soft-xs'
                : isDark
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
            }`}
            title="Transform slide with Gemini AI"
          >
            <Wand2 className={`w-3.5 h-3.5 text-indigo-400 ${isApplyingMagic ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isApplyingMagic ? 'Refining...' : 'AI Magic'}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {/* Typography */}
          <button
            onClick={() => toggleDropdown('typography')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              openDropdown === 'typography'
                ? 'bg-indigo-600 text-white shadow-soft-xs'
                : isDark
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
            }`}
            title="Select curated typography pairing"
          >
            <Type className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline capitalize">{typography}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {/* Layout */}
          <button
            onClick={() => toggleDropdown('layout')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              openDropdown === 'layout'
                ? 'bg-indigo-600 text-white shadow-soft-xs'
                : isDark
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
            }`}
            title="Change slide layout archetype"
          >
            <Layout className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">{currentSlide.layoutType}</span>
            <span className="md:hidden">Layout</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          <div className="w-[1px] h-5 bg-zinc-700/30 mx-0.5 shrink-0" />

          {/* SEGMENT 3: INSPECTOR PANELS */}
          <button
            onClick={() => onToggleInspectorPanel('visual')}
            className={`p-2 rounded-xl sm:rounded-full text-xs transition-all cursor-pointer shrink-0 ${
              activeInspectorPanel === 'visual'
                ? 'bg-indigo-500/20 text-indigo-400 font-bold ring-1 ring-indigo-500/40'
                : isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'hover:bg-zinc-100 text-zinc-600'
            }`}
            title="Visual Blueprint & Art Studio"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onToggleInspectorPanel('notes')}
            className={`p-2 rounded-xl sm:rounded-full text-xs transition-all cursor-pointer shrink-0 ${
              activeInspectorPanel === 'notes'
                ? 'bg-indigo-500/20 text-indigo-400 font-bold ring-1 ring-indigo-500/40'
                : isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'hover:bg-zinc-100 text-zinc-600'
            }`}
            title="Teacher Script & Talking Points"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          {currentSlide.assessment && (
            <button
              onClick={() => onToggleInspectorPanel('assessment')}
              className={`p-2 rounded-xl sm:rounded-full text-xs transition-all cursor-pointer shrink-0 ${
                activeInspectorPanel === 'assessment'
                  ? 'bg-emerald-500/20 text-emerald-400 font-bold ring-1 ring-emerald-500/40'
                  : isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'hover:bg-zinc-100 text-zinc-600'
              }`}
              title="Formative Check-for-Understanding"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="w-[1px] h-5 bg-zinc-700/30 mx-0.5 shrink-0" />

          {/* SEGMENT 4: MORE TOOLS DROPDOWN */}
          <button
            onClick={() => toggleDropdown('tools')}
            className={`p-2 rounded-xl sm:rounded-full text-xs transition-all cursor-pointer shrink-0 ${
              openDropdown === 'tools'
                ? 'bg-indigo-600 text-white shadow-soft-xs'
                : isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'hover:bg-zinc-100 text-zinc-600'
            }`}
            title="Workspace Tools & Export"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Copy Slide Markdown */}
          <button
            onClick={onCopySlide}
            className={`p-2 rounded-xl sm:rounded-full text-xs transition-all cursor-pointer shrink-0 ${
              isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-600'
            }`}
            title="Copy slide markdown"
          >
            {isCopiedSlide ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* SEGMENT 5: PRIMARY PRESENT ACTION */}
          <button
            onClick={onOpenPresenter}
            className="px-3.5 sm:px-4 py-1.5 rounded-xl sm:rounded-full font-bold text-xs flex items-center gap-1.5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-glow-accent cursor-pointer shrink-0 mr-1"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Present</span>
          </button>
        </div>

        {/* Right Scroll Gradient Fade & Floating "More ▶" Action Button */}
        {canScrollRight && (
          <>
            <div
              className={`pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-24 rounded-r-2xl sm:rounded-r-full z-20 transition-opacity duration-300 ${
                isDark
                  ? 'bg-gradient-to-l from-zinc-950 via-zinc-950/80 to-transparent'
                  : 'bg-gradient-to-l from-white via-white/80 to-transparent'
              }`}
            />
            <button
              type="button"
              onClick={() => handleScrollBy(220)}
              aria-label="Scroll right to view more controls and Present"
              className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-30 px-2.5 py-1.5 rounded-full shadow-soft-md border backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-white/20 group/btn"
              title="More controls (Present & actions) — click or drag to reveal"
            >
              <span className="text-[10px] font-bold tracking-tight pl-0.5">More</span>
              <ChevronRight className="w-3.5 h-3.5 animate-pulse group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

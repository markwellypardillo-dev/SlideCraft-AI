import React, { useState } from 'react';
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
  Split,
  TrendingUp,
  GitCommit,
  Quote,
  Sparkles,
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
      {/* FIGMA-STYLE CONSOLIDATED FLOATING CANVAS DOCK */}
      {/* ========================================================================= */}
      <div
        className={`px-3 py-2 rounded-2xl sm:rounded-full shadow-soft-2xl flex items-center gap-1.5 sm:gap-2 backdrop-blur-xl border transition-all max-w-[calc(100vw-1.5rem)] overflow-x-auto scrollbar-none shrink-0 ${
          isDark
            ? 'bg-zinc-900/90 border-zinc-800/80 text-white'
            : 'bg-white/90 border-zinc-200/80 text-zinc-900'
        }`}
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
          className="px-3 sm:px-3.5 py-1.5 rounded-xl sm:rounded-full font-bold text-xs flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 shadow-soft cursor-pointer transition-all shrink-0"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Present</span>
        </button>
      </div>
    </div>
  );
};

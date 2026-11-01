import React, { useState } from 'react';
import {
  Layers,
  LayoutGrid,
  Copy,
  Check,
  Plus,
  Play,
  FileDown,
  Clock,
  CheckCircle2,
  MessageSquare,
  BookOpen,
  Cloud,
  Eye,
  FileText,
  Type,
  Layout,
  Quote,
  Paintbrush,
  Palette,
  Wand2,
  Search,
} from 'lucide-react';
import { SlideDeck, SlideItem, LayoutType, TypographyPreset, IllustrationStyle } from '../types/deck';
import { applySlideMagicAPI, generateSlideVisualAPI } from '../services/deckService';
import { User as FirebaseUser } from 'firebase/auth';
import { SlideVisualCanvas } from './SlideVisualCanvas';
import { SlideThumbnailCard } from './SlideThumbnailCard';
import { FloatingCanvasDock } from './FloatingCanvasDock';

interface SlideDeckWorkspaceProps {
  deck: SlideDeck;
  onUpdateDeck: (updated: SlideDeck) => void;
  onOpenPresenter: () => void;
  onOpenExport: () => void;
  onOpenCompanion: () => void;
  onOpenAccessibility: () => void;
  isDark: boolean;
  currentUser?: FirebaseUser | null;
  onSaveDeckToCloud?: (deck: SlideDeck) => void;
  isSavingToCloud?: boolean;
}

export const SlideDeckWorkspace: React.FC<SlideDeckWorkspaceProps> = ({
  deck,
  onUpdateDeck,
  onOpenPresenter,
  onOpenExport,
  onOpenCompanion,
  isDark,
  currentUser,
  onSaveDeckToCloud,
  isSavingToCloud = false,
}) => {
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'canvas' | 'outline' | 'grid'>('canvas');
  const [typography, setTypography] = useState<TypographyPreset>('modern');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isApplyingMagic, setIsApplyingMagic] = useState<boolean>(false);
  const [activeInspectorPanel, setActiveInspectorPanel] = useState<'visual' | 'notes' | 'assessment' | 'none'>('visual');

  const [isSynthesizingArt, setIsSynthesizingArt] = useState<boolean>(false);
  const [navigatorSearch, setNavigatorSearch] = useState<string>('');

  const handleSynthesizeArtwork = async (style: IllustrationStyle) => {
    if (!currentSlide) return;
    setIsSynthesizingArt(true);
    try {
      const visualResult = await generateSlideVisualAPI({
        slide: currentSlide,
        illustrationStyle: style,
      });

      const updatedSlide: SlideItem = {
        ...currentSlide,
        visualPrompt: {
          ...currentSlide.visualPrompt,
          imagePrompt: visualResult.imagePrompt,
          customSvgArt: visualResult.customSvgArt,
          suggestedIcon: visualResult.suggestedIcon || currentSlide.visualPrompt.suggestedIcon,
          altText: visualResult.altText || currentSlide.visualPrompt.altText,
          illustrationStyle: style,
        },
      };

      const updatedSlides = deck.slides.map((s, idx) =>
        idx === selectedSlideIndex ? updatedSlide : s
      );

      onUpdateDeck({
        ...deck,
        slides: updatedSlides,
        illustrationStyle: style,
      });
    } catch (err: any) {
      console.error('Failed to synthesize artwork:', err);
    } finally {
      setIsSynthesizingArt(false);
    }
  };

  const currentSlide = deck.slides[selectedSlideIndex] || deck.slides[0];

  const triggerCopyToast = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= deck.slides.length) return;

    const newSlides = [...deck.slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[newIndex];
    newSlides[newIndex] = temp;

    const updated = newSlides.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    onUpdateDeck({ ...deck, slides: updated });
    setSelectedSlideIndex(newIndex);
  };

  const handleDuplicateSlide = (index: number) => {
    const target = deck.slides[index];
    const newSlide: SlideItem = {
      ...target,
      id: `slide-${Date.now().toString(36)}`,
      slideNumber: index + 2,
      title: `${target.title} (Copy)`,
    };

    const newSlides = [...deck.slides];
    newSlides.splice(index + 1, 0, newSlide);
    const updated = newSlides.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    onUpdateDeck({ ...deck, slides: updated });
    setSelectedSlideIndex(index + 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (deck.slides.length <= 1) return;
    const newSlides = deck.slides.filter((_, idx) => idx !== index);
    const updated = newSlides.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    onUpdateDeck({ ...deck, slides: updated });
    setSelectedSlideIndex(Math.max(0, index - 1));
  };

  const handleAddSlide = () => {
    const newSlide: SlideItem = {
      id: `slide-${Date.now().toString(36)}`,
      slideNumber: deck.slides.length + 1,
      title: 'New Instructional Concept',
      estimatedTime: '3 min',
      layoutType: 'Split Comparison 50/50',
      headline: 'Core pedagogical takeaway and student learning objective',
      bullets: [
        '**Foundational Principle:** High-clarity conceptual premise.',
        '**Mechanistic Evidence:** Applied phenomenon or empirical proof.',
        '**Inquiry Prompt:** Formative check question for guided student reflection.',
      ],
      speakerNotes: 'Introduce the core premise to students and anchor their focus with a guiding question.',
      visualPrompt: {
        imagePrompt: 'Clean minimalist 3D conceptual diagram with studio lighting, isometric view, high clarity, 8k octane render.',
        recommendedPlacement: 'Right 50% split',
        designInstructions: 'Maintain generous negative space for readability; split layout with text on left.',
        suggestedIcon: 'Presentation',
        altText: 'Conceptual diagram illustrating core instructional principles.',
      },
    };

    const updated = [...deck.slides, newSlide];
    onUpdateDeck({ ...deck, slides: updated });
    setSelectedSlideIndex(updated.length - 1);
  };

  const handleInsertSlideBelow = (index: number) => {
    const newSlide: SlideItem = {
      id: `slide-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      slideNumber: index + 2,
      title: 'New Instructional Concept',
      estimatedTime: '3 min',
      layoutType: 'Split Comparison 50/50',
      headline: 'Core pedagogical takeaway and student learning objective',
      bullets: [
        '**Foundational Principle:** High-clarity conceptual premise.',
        '**Mechanistic Evidence:** Applied phenomenon or empirical proof.',
        '**Inquiry Prompt:** Formative check question for guided student reflection.',
      ],
      speakerNotes: 'Introduce the core premise to students and anchor their focus with a guiding question.',
      visualPrompt: {
        imagePrompt: 'Clean minimalist 3D conceptual diagram with studio lighting, isometric view, high clarity, 8k octane render.',
        recommendedPlacement: 'Right 50% split',
        designInstructions: 'Maintain generous negative space for readability; split layout with text on left.',
        suggestedIcon: 'Presentation',
        altText: 'Conceptual diagram illustrating core instructional principles.',
      },
    };

    const newSlides = [...deck.slides];
    newSlides.splice(index + 1, 0, newSlide);
    const updated = newSlides.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
    onUpdateDeck({ ...deck, slides: updated });
    setSelectedSlideIndex(index + 1);
  };

  const handleUpdateSlideTitleAt = (index: number, newTitle: string) => {
    const updated = deck.slides.map((s, idx) =>
      idx === index ? { ...s, title: newTitle } : s
    );
    onUpdateDeck({ ...deck, slides: updated });
  };

  const handleUpdateSlideLayoutAt = (index: number, newLayout: LayoutType) => {
    const updated = deck.slides.map((s, idx) =>
      idx === index ? { ...s, layoutType: newLayout } : s
    );
    onUpdateDeck({ ...deck, slides: updated });
  };

  const handleUpdateSlideEstimatedTimeAt = (index: number, newTime: string) => {
    const updated = deck.slides.map((s, idx) =>
      idx === index ? { ...s, estimatedTime: newTime } : s
    );
    onUpdateDeck({ ...deck, slides: updated });
  };

  const handleUpdateLayoutType = (newLayout: LayoutType) => {
    const updatedSlides = deck.slides.map((s, idx) =>
      idx === selectedSlideIndex ? { ...s, layoutType: newLayout } : s
    );
    onUpdateDeck({ ...deck, slides: updatedSlides });
  };

  const handleApplyMagic = async (action: 'simplify' | 'expand' | 'translate' | 'reprompt') => {
    if (!currentSlide) return;
    setIsApplyingMagic(true);
    try {
      const transformed = await applySlideMagicAPI({
        action,
        slide: currentSlide,
        targetAudience: deck.targetAudience,
        targetLanguage: 'Spanish',
        stylePrompt: 'Ultra clean 3D isometric laboratory render with soft volumetric studio lighting',
      });

      const updatedSlides = deck.slides.map((s, idx) =>
        idx === selectedSlideIndex ? transformed : s
      );
      onUpdateDeck({ ...deck, slides: updatedSlides });
    } catch (err: any) {
      console.error('Failed to apply slide magic:', err);
    } finally {
      setIsApplyingMagic(false);
    }
  };

  const getFullSlideMarkdown = (slide: SlideItem) => {
    const style = slide.visualPrompt.illustrationStyle || deck.illustrationStyle || 'Cartoon & Playful Illustration';
    return `## Slide ${slide.slideNumber}: ${slide.title}
### Main Takeaway: ${slide.headline}
*Layout Archetype: ${slide.layoutType} | Duration: ${slide.estimatedTime}*

**Key Points:**
${slide.bullets.map((b) => `- ${b}`).join('\n')}

**Visual Direction & AI Image Generation Prompt:**
> **Style:** ${style}
> **Prompt:** \`${slide.visualPrompt.imagePrompt}\`
*Placement:* ${slide.visualPrompt.recommendedPlacement} | *Alt Text:* ${slide.visualPrompt.altText}`;
  };

  return (
    <div className="space-y-8 pb-24 animate-fade-in-up">
      {/* 1. WORKSPACE TITLEBAR */}
      <div className={`p-6 sm:p-7 rounded-[26px] glass-card border border-slate-200/80 dark:border-white/10 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft-xl ${
        isDark ? 'bg-zinc-900/80' : 'bg-white/85'
      }`}>
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap font-medium">
            {deck.session && (
              <>
                <span className="font-bold text-indigo-500 dark:text-indigo-400">
                  {deck.session}
                </span>
                <span className="text-slate-400 dark:text-zinc-600" aria-hidden="true">·</span>
              </>
            )}
            <span className="font-bold text-slate-800 dark:text-zinc-200">{deck.subject}</span>
            <span className="text-slate-400 dark:text-zinc-600" aria-hidden="true">·</span>
            <span className={isDark ? 'text-zinc-400' : 'text-slate-600'}>{deck.targetAudience}</span>
            <span className="text-slate-400 dark:text-zinc-600" aria-hidden="true">·</span>
            <span className="tabular-nums flex items-center gap-1.5 font-mono text-slate-600 dark:text-zinc-400 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              ~{deck.totalEstimatedMinutes} min ({deck.slides.length} slides)
            </span>
          </div>

          <h2 className={`text-xl sm:text-2xl lg:text-3xl font-display font-extrabold tracking-tight truncate ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {deck.title}
          </h2>
        </div>

        {/* Minimal Right Header Actions */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {currentUser && onSaveDeckToCloud && (
            <button
              onClick={() => onSaveDeckToCloud(deck)}
              disabled={isSavingToCloud}
              className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-slate-200/80 dark:border-white/10 transition-all duration-200 cursor-pointer ${
                isDark ? 'hover:bg-white/10 text-zinc-300 hover:text-white bg-zinc-900/50' : 'hover:bg-slate-100 text-slate-700 bg-white'
              }`}
              title="Save Deck to Firestore Cloud"
            >
              <Cloud className={`w-4 h-4 ${isSavingToCloud ? 'animate-pulse text-indigo-400' : 'text-emerald-500'}`} />
              <span className="hidden sm:inline">{isSavingToCloud ? 'Saving...' : 'Cloud Synced'}</span>
            </button>
          )}

          <button
            onClick={onOpenExport}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border border-slate-200/80 dark:border-white/10 transition-all duration-200 cursor-pointer ${
              isDark ? 'hover:bg-white/10 text-zinc-200 bg-zinc-900/50' : 'hover:bg-slate-100 text-slate-700 bg-white'
            }`}
          >
            <FileDown className="w-4 h-4 text-indigo-400" />
            <span>Export</span>
          </button>

          {/* High-Contrast Radiant Orange Present CTA */}
          <button
            onClick={onOpenPresenter}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-glow-accent cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Present Deck</span>
          </button>
        </div>
      </div>

      {/* 2. WORKSPACE BODY: CANVAS / OUTLINE / GRID */}
      {viewMode !== 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: SLIDE RAIL (3 cols on lg for maximum canvas breathing room) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-slate-600'
              }`}>
                Slide Navigator ({deck.slides.length})
              </span>
              <button
                onClick={handleAddSlide}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  isDark
                    ? 'hover:bg-indigo-500 bg-indigo-600 text-white'
                    : 'hover:bg-indigo-700 bg-indigo-600 text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Add Slide
              </button>
            </div>

            {/* Quick Slide Search in Navigator */}
            {deck.slides.length > 3 && (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400" />
                <input
                  type="text"
                  value={navigatorSearch}
                  onChange={(e) => setNavigatorSearch(e.target.value)}
                  placeholder="Quick find slide..."
                  className={`w-full pl-9 pr-3.5 py-2 rounded-xl text-sm border border-slate-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${
                    isDark ? 'bg-zinc-900 text-zinc-100 placeholder-zinc-500' : 'bg-white text-slate-900 placeholder-slate-400 shadow-xs'
                  }`}
                />
              </div>
            )}

            <div className="space-y-3.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 scrollbar-none">
              {deck.slides
                .map((slide, originalIndex) => ({ slide, originalIndex }))
                .filter(({ slide }) => {
                  if (!navigatorSearch.trim()) return true;
                  const q = navigatorSearch.toLowerCase();
                  return (
                    slide.title.toLowerCase().includes(q) ||
                    slide.headline.toLowerCase().includes(q) ||
                    slide.layoutType.toLowerCase().includes(q)
                  );
                })
                .map(({ slide, originalIndex }) => (
                  <SlideThumbnailCard
                    key={slide.id || originalIndex}
                    slide={slide}
                    index={originalIndex}
                    totalSlides={deck.slides.length}
                    isSelected={originalIndex === selectedSlideIndex}
                    isDark={isDark}
                    onSelect={() => setSelectedSlideIndex(originalIndex)}
                    onMoveUp={() => handleMoveSlide(originalIndex, 'up')}
                    onMoveDown={() => handleMoveSlide(originalIndex, 'down')}
                    onDuplicate={() => handleDuplicateSlide(originalIndex)}
                    onDelete={() => handleDeleteSlide(originalIndex)}
                    onInsertBelow={() => handleInsertSlideBelow(originalIndex)}
                    onUpdateTitle={(newTitle) => handleUpdateSlideTitleAt(originalIndex, newTitle)}
                    onUpdateLayout={(newLayout) => handleUpdateSlideLayoutAt(originalIndex, newLayout)}
                    onUpdateEstimatedTime={(newTime) => handleUpdateSlideEstimatedTimeAt(originalIndex, newTime)}
                  />
                ))}
            </div>
          </div>

          {/* RIGHT: MAIN 16:9 SLIDE CANVAS & FLOATING DOCK (9 cols on lg) */}
          <div className="lg:col-span-9 space-y-6">
            {currentSlide && (
              <>
                {viewMode === 'canvas' ? (
                  <div className="space-y-6">
                    {/* Visual Slide Canvas Engine */}
                    <SlideVisualCanvas
                      slide={currentSlide}
                      deck={deck}
                      isDark={isDark}
                      typography={typography}
                      onCopyPrompt={(prompt) => triggerCopyToast(prompt, `prompt-${currentSlide.id}`)}
                      isCopiedPrompt={copiedField === `prompt-${currentSlide.id}`}
                    />

                    {/* Figma-Style Consolidated Floating Canvas Dock */}
                    <FloatingCanvasDock
                      currentSlide={currentSlide}
                      typography={typography}
                      onChangeTypography={(p) => setTypography(p)}
                      onChangeLayout={handleUpdateLayoutType}
                      onApplyMagic={handleApplyMagic}
                      isApplyingMagic={isApplyingMagic}
                      onOpenPresenter={onOpenPresenter}
                      onCopySlide={() => triggerCopyToast(getFullSlideMarkdown(currentSlide), `slide-${currentSlide.id}`)}
                      isCopiedSlide={copiedField === `slide-${currentSlide.id}`}
                      activeInspectorPanel={activeInspectorPanel}
                      onToggleInspectorPanel={(panel) =>
                        setActiveInspectorPanel(activeInspectorPanel === panel ? 'none' : panel)
                      }
                      isDark={isDark}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      onOpenCompanion={onOpenCompanion}
                      onOpenExport={onOpenExport}
                      onSaveDeckToCloud={currentUser && onSaveDeckToCloud ? () => onSaveDeckToCloud(deck) : undefined}
                      isSavingToCloud={isSavingToCloud}
                    />

                    {/* Expandable Inspector Drawers */}
                    {activeInspectorPanel === 'visual' && (
                      <div className={`p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-all space-y-5 animate-in fade-in slide-in-from-top-2 ${
                        isDark ? 'bg-zinc-900/95' : 'bg-white'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold tracking-tight text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                              <Palette className="w-4 h-4" />
                              Visual Illustration & Prompt Studio
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-zinc-300">
                              Midjourney v6 & DALL-E 3 visual prompt blueprint and vector art
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => triggerCopyToast(currentSlide.visualPrompt.imagePrompt, `prompt-${currentSlide.id}`)}
                              className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer border border-slate-200 dark:border-zinc-700 ${
                                isDark ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700' : 'bg-slate-900 text-white hover:bg-slate-800'
                              }`}
                            >
                              {copiedField === `prompt-${currentSlide.id}` ? (
                                <>
                                  <Check className="w-4 h-4 text-emerald-400" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span>Copy Prompt</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Quick Style Switcher & Re-synthesize buttons */}
                        <div className="space-y-2 pt-1">
                          <span className="text-xs font-semibold text-slate-700 dark:text-zinc-200 uppercase tracking-wider">
                            Switch Illustration Style
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                              { id: 'Cartoon & Playful Illustration', icon: '🎨', label: 'Cartoon' },
                              { id: '3D Pixar & Clay Animation', icon: '🧸', label: '3D Pixar' },
                              { id: 'Vector Flat Graphic', icon: '📐', label: 'Vector Flat' },
                              { id: 'Photorealistic Cinematic', icon: '🔬', label: 'Photorealistic' },
                              { id: 'Vintage Botanical & Engraving', icon: '🏛️', label: 'Vintage' },
                              { id: 'Cyberpunk & Neon Tech', icon: '⚡', label: 'Cyberpunk' },
                              { id: 'Chalkboard & Socratic Sketch', icon: '✏️', label: 'Chalkboard' },
                              { id: 'Anime & Manga Infographic', icon: '🗾', label: 'Anime / Manga' },
                            ].map((st) => (
                              <button
                                key={st.id}
                                onClick={() => handleSynthesizeArtwork(st.id as IllustrationStyle)}
                                disabled={isSynthesizingArt}
                                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
                                  (currentSlide.visualPrompt.illustrationStyle || deck.illustrationStyle) === st.id
                                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                                    : isDark
                                    ? 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                                    : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100 hover:shadow-xs'
                                }`}
                              >
                                <span>{st.icon}</span>
                                <span className="truncate">{st.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {isSynthesizingArt && (
                          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-sm flex items-center gap-3 animate-pulse font-medium">
                            <Wand2 className="w-5 h-5 animate-spin shrink-0" />
                            <span>Synthesizing custom vector illustration with Gemini...</span>
                          </div>
                        )}

                        <p className={`text-sm font-mono leading-relaxed p-4 rounded-xl border border-slate-200 dark:border-zinc-800 ${
                          isDark ? 'bg-zinc-950 text-zinc-200' : 'bg-slate-50 text-slate-800'
                        }`}>
                          "{currentSlide.visualPrompt.imagePrompt}"
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-zinc-300 pt-1">
                          <span><strong>Placement:</strong> {currentSlide.visualPrompt.recommendedPlacement}</span>
                          <span aria-hidden="true">·</span>
                          <span><strong>Suggested Icon:</strong> {currentSlide.visualPrompt.suggestedIcon}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-sm"><strong>Alt Text:</strong> {currentSlide.visualPrompt.altText}</span>
                        </div>
                      </div>
                    )}

                    {activeInspectorPanel === 'notes' && (
                      <div className={`p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-all space-y-4 animate-in fade-in slide-in-from-top-2 ${
                        isDark ? 'bg-zinc-900/95' : 'bg-white'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-semibold text-sm text-indigo-600 dark:text-indigo-400">
                            <MessageSquare className="w-4 h-4" />
                            <span>Educator Verbal Script ({currentSlide.estimatedTime})</span>
                          </div>

                          <button
                            onClick={() => triggerCopyToast(currentSlide.speakerNotes, `notes-${currentSlide.id}`)}
                            className={`text-xs font-semibold flex items-center gap-1.5 px-3.5 py-2 rounded-xl cursor-pointer border border-slate-200 dark:border-zinc-700 transition-all ${
                              isDark ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700' : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            {copiedField === `notes-${currentSlide.id}` ? '✓ Copied' : 'Copy Script'}
                          </button>
                        </div>

                        <div className={`p-5 rounded-xl text-sm leading-relaxed whitespace-pre-line border border-slate-200 dark:border-zinc-800 ${
                          isDark ? 'bg-zinc-950 text-zinc-200' : 'bg-slate-50 text-slate-800'
                        }`}>
                          {currentSlide.speakerNotes}
                        </div>
                      </div>
                    )}

                    {activeInspectorPanel === 'assessment' && currentSlide.assessment && (
                      <div className={`p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm transition-all space-y-4 animate-in fade-in slide-in-from-top-2 ${
                        isDark ? 'bg-zinc-900/95' : 'bg-white'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            Formative Check-for-Understanding
                          </span>
                          <span className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                            {currentSlide.assessment.type === 'multiple_choice' ? 'Multiple Choice' : 'Socratic Discussion'}
                          </span>
                        </div>

                        <p className={`text-base font-semibold ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                          {currentSlide.assessment.question}
                        </p>

                        {currentSlide.assessment.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-sm">
                            {currentSlide.assessment.options.map((opt, oIdx) => {
                              const isCorrect = opt === currentSlide.assessment?.correctAnswer;
                              return (
                                <div
                                  key={oIdx}
                                  className={`p-3.5 rounded-xl border flex items-center gap-2.5 ${
                                    isCorrect
                                      ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                                      : isDark ? 'border-zinc-800 bg-zinc-950 text-zinc-300' : 'border-slate-200 bg-slate-50 text-slate-700'
                                  }`}
                                >
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                                    isCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-slate-200 text-slate-700'
                                  }`}>
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span className="truncate">{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {currentSlide.assessment.explanation && (
                          <div className={`p-4 rounded-xl text-sm border border-slate-200 dark:border-zinc-800 ${
                            isDark ? 'bg-zinc-950 text-zinc-300' : 'bg-slate-50 text-slate-700'
                          }`}>
                            <strong className={isDark ? 'text-zinc-100' : 'text-slate-900'}>Pedagogy Rationale:</strong> {currentSlide.assessment.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* OUTLINE EDITOR MODE (BORDERLESS, SOFT SHADOW) */
                  <div className={`p-6 rounded-3xl transition-all space-y-4 shadow-soft-md ${
                    isDark ? 'bg-zinc-900/60' : 'bg-white'
                  }`}>
                    <div className="space-y-1">
                      <label className={`text-xs font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        Slide Title
                      </label>
                      <input
                        type="text"
                        value={currentSlide.title}
                        onChange={(e) => {
                          const updated = deck.slides.map((s, i) =>
                            i === selectedSlideIndex ? { ...s, title: e.target.value } : s
                          );
                          onUpdateDeck({ ...deck, slides: updated });
                        }}
                        className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold shadow-soft-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                          isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className={`text-xs font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        Core Headline / Learning Target
                      </label>
                      <input
                        type="text"
                        value={currentSlide.headline}
                        onChange={(e) => {
                          const updated = deck.slides.map((s, i) =>
                            i === selectedSlideIndex ? { ...s, headline: e.target.value } : s
                          );
                          onUpdateDeck({ ...deck, slides: updated });
                        }}
                        className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium shadow-soft-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                          isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className={`text-xs font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        Bullet Points (one per line with **bold keywords**)
                      </label>
                      <textarea
                        rows={5}
                        value={currentSlide.bullets.join('\n')}
                        onChange={(e) => {
                          const lines = e.target.value.split('\n');
                          const updated = deck.slides.map((s, i) =>
                            i === selectedSlideIndex ? { ...s, bullets: lines } : s
                          );
                          onUpdateDeck({ ...deck, slides: updated });
                        }}
                        className={`w-full p-4 rounded-xl text-xs font-mono shadow-soft-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 leading-relaxed ${
                          isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'
                        }`}
                      />
                    </div>

                    {/* Figma-Style Consolidated Floating Canvas Dock */}
                    <FloatingCanvasDock
                      currentSlide={currentSlide}
                      typography={typography}
                      onChangeTypography={(p) => setTypography(p)}
                      onChangeLayout={handleUpdateLayoutType}
                      onApplyMagic={handleApplyMagic}
                      isApplyingMagic={isApplyingMagic}
                      onOpenPresenter={onOpenPresenter}
                      onCopySlide={() => triggerCopyToast(getFullSlideMarkdown(currentSlide), `slide-${currentSlide.id}`)}
                      isCopiedSlide={copiedField === `slide-${currentSlide.id}`}
                      activeInspectorPanel={activeInspectorPanel}
                      onToggleInspectorPanel={(panel) =>
                        setActiveInspectorPanel(activeInspectorPanel === panel ? 'none' : panel)
                      }
                      isDark={isDark}
                      viewMode={viewMode}
                      onViewModeChange={setViewMode}
                      onOpenCompanion={onOpenCompanion}
                      onOpenExport={onOpenExport}
                      onSaveDeckToCloud={currentUser && onSaveDeckToCloud ? () => onSaveDeckToCloud(deck) : undefined}
                      isSavingToCloud={isSavingToCloud}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        /* GRID DECK OVERVIEW (BORDERLESS, ELEVATED CARDS) */
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Deck Grid Overview ({deck.slides.length} Slides)
            </span>
            <button
              onClick={() => setViewMode('canvas')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white flex items-center gap-1.5 shadow-soft cursor-pointer hover:opacity-95 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Back to Canvas</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {deck.slides.map((slide, index) => (
              <div
                key={slide.id || index}
                onClick={() => {
                  setSelectedSlideIndex(index);
                  setViewMode('canvas');
                }}
                className={`p-6 rounded-3xl text-left cursor-pointer transition-all duration-200 hover:scale-[1.01] space-y-3 ${
                  selectedSlideIndex === index
                    ? isDark
                      ? 'bg-zinc-850 ring-2 ring-indigo-500/70 shadow-soft-lg text-white'
                      : 'bg-white ring-2 ring-indigo-500/60 shadow-soft-lg text-zinc-950 font-semibold'
                    : isDark
                    ? 'bg-zinc-900/60 hover:bg-zinc-900/80 shadow-soft-sm text-zinc-300'
                    : 'bg-white hover:bg-zinc-50 shadow-soft-sm text-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold tabular-nums ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    Slide {slide.slideNumber}
                  </span>
                  <span className="text-zinc-500 text-[11px] font-medium">{slide.layoutType}</span>
                </div>

                <h4 className={`font-display text-base font-bold line-clamp-1 ${
                  isDark ? 'text-white' : 'text-zinc-900'
                }`}>
                  {slide.title}
                </h4>
                <p className={`text-xs line-clamp-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {slide.headline}
                </p>

                <div className={`p-3 rounded-xl text-[11px] font-mono line-clamp-2 shadow-soft-xs ${
                  isDark ? 'bg-zinc-950/80 text-zinc-400' : 'bg-zinc-50 text-zinc-600'
                }`}>
                  "{slide.visualPrompt.imagePrompt}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

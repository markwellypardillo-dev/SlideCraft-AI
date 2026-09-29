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
    <div className="space-y-6 pb-20">
      {/* 1. FIGMA-STYLE MINIMAL WORKSPACE TITLEBAR */}
      <div className={`px-5 py-3.5 rounded-2xl sm:rounded-3xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDark ? 'bg-zinc-900/60 border border-zinc-800/60 shadow-soft-sm' : 'bg-white border border-zinc-200/70 shadow-soft-xs'
      }`}>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {deck.session && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-purple-500/15 text-purple-400">
                {deck.session}
              </span>
            )}
            <span className="font-bold text-indigo-400">{deck.subject}</span>
            <span className="text-zinc-500" aria-hidden="true">·</span>
            <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>{deck.targetAudience}</span>
            <span className="text-zinc-500" aria-hidden="true">·</span>
            <span className="tabular-nums flex items-center gap-1 font-mono text-zinc-400 text-[11px]">
              <Clock className="w-3 h-3 text-zinc-400" />
              ~{deck.totalEstimatedMinutes} min ({deck.slides.length} slides)
            </span>
          </div>

          <h2 className={`font-display text-lg sm:text-xl font-bold tracking-tight truncate ${
            isDark ? 'text-white' : 'text-zinc-900'
          }`}>
            {deck.title}
          </h2>
        </div>

        {/* Minimal Right Header Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser && onSaveDeckToCloud && (
            <button
              onClick={() => onSaveDeckToCloud(deck)}
              disabled={isSavingToCloud}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isDark ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-zinc-100 text-zinc-600'
              }`}
              title="Save Deck to Firestore Cloud"
            >
              <Cloud className={`w-3.5 h-3.5 ${isSavingToCloud ? 'animate-pulse text-indigo-400' : 'text-emerald-500'}`} />
              <span className="hidden sm:inline">{isSavingToCloud ? 'Saving...' : 'Cloud Synced'}</span>
            </button>
          )}

          <button
            onClick={onOpenExport}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isDark ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-300' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-700'
            }`}
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={onOpenPresenter}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-soft hover:opacity-95 cursor-pointer transition-all"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Present</span>
          </button>
        </div>
      </div>

      {/* 2. WORKSPACE BODY: CANVAS / OUTLINE / GRID */}
      {viewMode !== 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: SLIDE RAIL WITH 16:9 MINIATURE THUMBNAILS (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                Slide Navigator ({deck.slides.length})
              </span>
              <button
                onClick={handleAddSlide}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-soft-xs flex items-center gap-1.5 transition-all cursor-pointer ${
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
              <div className="relative px-0.5">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={navigatorSearch}
                  onChange={(e) => setNavigatorSearch(e.target.value)}
                  placeholder="Quick find slide..."
                  className={`w-full pl-8 pr-3 py-1.5 rounded-xl text-xs font-medium shadow-soft-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${
                    isDark ? 'bg-zinc-900 text-zinc-200 placeholder-zinc-500' : 'bg-zinc-100 text-zinc-800 placeholder-zinc-400'
                  }`}
                />
              </div>
            )}

            <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1.5 scrollbar-none">
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

          {/* RIGHT: MAIN 16:9 SLIDE CANVAS & FLOATING DOCK (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-5">
            {currentSlide && (
              <>
                {viewMode === 'canvas' ? (
                  <div className="space-y-4">
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
                      <div className={`p-6 rounded-3xl shadow-soft-md transition-all space-y-4 animate-in fade-in slide-in-from-top-2 ${
                        isDark ? 'bg-zinc-900/90' : 'bg-white'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <h4 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${
                              isDark ? 'text-indigo-400' : 'text-indigo-600'
                            }`}>
                              <Palette className="w-3.5 h-3.5" />
                              AI Visual Illustration & Art Style Studio
                            </h4>
                            <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                              Instant vector synthesis & prompts calibrated for Midjourney v6 and DALL-E 3
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => triggerCopyToast(currentSlide.visualPrompt.imagePrompt, `prompt-${currentSlide.id}`)}
                              className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-soft-xs transition-all cursor-pointer ${
                                isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                              }`}
                            >
                              {copiedField === `prompt-${currentSlide.id}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Prompt</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Quick Style Switcher & Re-synthesize buttons */}
                        <div className="space-y-1.5 pt-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            Switch Illustration Style & Synthesize Live
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                            {[
                              { id: 'Cartoon & Playful Illustration', icon: '🎨', label: 'Cartoon' },
                              { id: '3D Pixar & Clay Animation', icon: '🧸', label: '3D Pixar' },
                              { id: 'Vector Flat Graphic', icon: '📐', label: 'Vector Flat' },
                              { id: 'Photorealistic Cinematic', icon: '🔬', label: 'Photo' },
                              { id: 'Vintage Botanical & Engraving', icon: '🏛️', label: 'Vintage' },
                              { id: 'Cyberpunk & Neon Tech', icon: '⚡', label: 'Cyberpunk' },
                              { id: 'Chalkboard & Socratic Sketch', icon: '✏️', label: 'Chalkboard' },
                              { id: 'Anime & Manga Infographic', icon: '🗾', label: 'Anime' },
                            ].map((st) => (
                              <button
                                key={st.id}
                                onClick={() => handleSynthesizeArtwork(st.id as IllustrationStyle)}
                                disabled={isSynthesizingArt}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-soft-xs ${
                                  (currentSlide.visualPrompt.illustrationStyle || deck.illustrationStyle) === st.id
                                    ? isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-600 text-white'
                                    : isDark ? 'bg-zinc-950 text-zinc-300 hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                                }`}
                              >
                                <span>{st.icon}</span>
                                <span className="truncate">{st.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {isSynthesizingArt && (
                          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs flex items-center gap-2 animate-pulse font-medium">
                            <Wand2 className="w-4 h-4 animate-spin shrink-0" />
                            <span>Synthesizing custom visual illustration with Gemini vector engine...</span>
                          </div>
                        )}

                        <p className={`text-xs font-mono leading-relaxed p-4 rounded-2xl shadow-soft-xs ${
                          isDark ? 'bg-zinc-950 text-zinc-300' : 'bg-zinc-50 text-zinc-800'
                        }`}>
                          "{currentSlide.visualPrompt.imagePrompt}"
                        </p>

                        <div className={`flex flex-wrap items-center gap-4 text-xs pt-1 ${
                          isDark ? 'text-zinc-400' : 'text-zinc-600'
                        }`}>
                          <span><strong>Placement:</strong> {currentSlide.visualPrompt.recommendedPlacement}</span>
                          <span aria-hidden="true">·</span>
                          <span><strong>Suggested Icon:</strong> {currentSlide.visualPrompt.suggestedIcon}</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-sm"><strong>Alt Text:</strong> {currentSlide.visualPrompt.altText}</span>
                        </div>
                      </div>
                    )}

                    {activeInspectorPanel === 'notes' && (
                      <div className={`p-6 rounded-3xl shadow-soft-md transition-all space-y-3.5 animate-in fade-in slide-in-from-top-2 ${
                        isDark ? 'bg-zinc-900/90' : 'bg-white'
                      }`}>
                        <div className="flex items-center justify-between text-xs">
                          <div className={`flex items-center gap-2 font-bold uppercase tracking-wider ${
                            isDark ? 'text-indigo-400' : 'text-indigo-600'
                          }`}>
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Teacher Turnkey Teleprompter & Explanation Guide ({currentSlide.estimatedTime})</span>
                          </div>

                          <button
                            onClick={() => triggerCopyToast(currentSlide.speakerNotes, `notes-${currentSlide.id}`)}
                            className={`text-[11px] font-semibold flex items-center gap-1 px-3 py-1.5 rounded-xl cursor-pointer shadow-soft-xs transition-all ${
                              isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                            }`}
                          >
                            {copiedField === `notes-${currentSlide.id}` ? '✓ Copied Script' : 'Copy Full Script'}
                          </button>
                        </div>

                        <div className={`p-5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-soft-sm whitespace-pre-line ${
                          isDark ? 'bg-zinc-950 text-zinc-200' : 'bg-zinc-50 text-zinc-800 font-normal'
                        }`}>
                          {currentSlide.speakerNotes}
                        </div>
                      </div>
                    )}

                    {activeInspectorPanel === 'assessment' && currentSlide.assessment && (
                      <div className={`p-6 rounded-3xl shadow-soft-md transition-all space-y-3 animate-in fade-in slide-in-from-top-2 ${
                        isDark ? 'bg-zinc-900/90' : 'bg-white'
                      }`}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            Active Learning Check-for-Understanding
                          </span>
                          <span className="text-[11px] text-zinc-500 font-medium">
                            {currentSlide.assessment.type === 'multiple_choice' ? 'Multiple Choice' : 'Open Socratic Inquiry'}
                          </span>
                        </div>

                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                          {currentSlide.assessment.question}
                        </p>

                        {currentSlide.assessment.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                            {currentSlide.assessment.options.map((opt, oIdx) => {
                              const isCorrect = opt === currentSlide.assessment?.correctAnswer;
                              return (
                                <div
                                  key={oIdx}
                                  className={`p-3 rounded-xl shadow-soft-xs flex items-center gap-2 ${
                                    isCorrect
                                      ? isDark ? 'bg-emerald-950/60 text-white font-semibold' : 'bg-emerald-50 text-zinc-900 font-semibold'
                                      : isDark ? 'bg-zinc-950 text-zinc-400' : 'bg-zinc-50 text-zinc-600'
                                  }`}
                                >
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                    isCorrect
                                      ? 'bg-emerald-500 text-white'
                                      : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-700'
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
                          <div className={`p-3 rounded-xl text-xs shadow-soft-xs ${
                            isDark ? 'bg-zinc-950 text-zinc-400' : 'bg-zinc-50 text-zinc-600'
                          }`}>
                            <strong className={isDark ? 'text-zinc-200' : 'text-zinc-800'}>Pedagogy Rationale:</strong> {currentSlide.assessment.explanation}
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

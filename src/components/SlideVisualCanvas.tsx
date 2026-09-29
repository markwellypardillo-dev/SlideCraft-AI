import React from 'react';
import {
  Palette,
  Layers,
  Clock,
  CheckCircle2,
  Quote,
  TrendingUp,
  ArrowRight,
  Split,
  LayoutGrid,
  GitCommit,
  MessageSquare,
  HelpCircle,
  Copy,
  Check,
  Zap,
  Atom,
  Brain,
  Globe,
  Activity,
  BookOpen,
} from 'lucide-react';
import { SlideDeck, SlideItem, LayoutType, TypographyPreset } from '../types/deck';

interface SlideVisualCanvasProps {
  slide: SlideItem;
  deck: SlideDeck;
  isDark: boolean;
  typography: TypographyPreset;
  onUpdateSlide?: (updated: SlideItem) => void;
  onCopyPrompt?: (promptText: string) => void;
  isCopiedPrompt?: boolean;
}

// Map suggested icons to Lucide components
const getLucideIcon = (name: string) => {
  const lower = (name || '').toLowerCase();
  if (lower.includes('atom') || lower.includes('physics') || lower.includes('chem')) return <Atom className="w-5 h-5" />;
  if (lower.includes('brain') || lower.includes('mind') || lower.includes('thought')) return <Brain className="w-5 h-5" />;
  if (lower.includes('globe') || lower.includes('world') || lower.includes('geo')) return <Globe className="w-5 h-5" />;
  if (lower.includes('activity') || lower.includes('chart') || lower.includes('trend')) return <Activity className="w-5 h-5" />;
  if (lower.includes('book') || lower.includes('read') || lower.includes('history')) return <BookOpen className="w-5 h-5" />;
  if (lower.includes('sparkle') || lower.includes('star') || lower.includes('art') || lower.includes('ai')) return <Palette className="w-5 h-5" />;
  if (lower.includes('split') || lower.includes('contrast')) return <Split className="w-5 h-5" />;
  if (lower.includes('grid') || lower.includes('box')) return <LayoutGrid className="w-5 h-5" />;
  return <Palette className="w-5 h-5" />;
};

export const SlideVisualCanvas: React.FC<SlideVisualCanvasProps> = ({
  slide,
  deck,
  isDark,
  typography,
  onCopyPrompt,
  isCopiedPrompt = false,
}) => {
  // Typography classes based on preset
  const getHeadingFontClass = () => {
    switch (typography) {
      case 'academic':
        return 'font-serif font-bold italic tracking-normal';
      case 'technical':
        return 'font-sans font-black tracking-tight uppercase text-indigo-400';
      case 'creative':
        return 'font-display font-extrabold tracking-tight';
      case 'modern':
      default:
        return 'font-sans font-extrabold tracking-tight';
    }
  };

  const getBodyFontClass = () => {
    switch (typography) {
      case 'academic':
        return 'font-serif leading-relaxed';
      case 'technical':
        return 'font-mono text-[13px] leading-relaxed';
      case 'creative':
        return 'font-sans leading-relaxed';
      case 'modern':
      default:
        return 'font-sans leading-relaxed';
    }
  };

  const renderBulletText = (text: string) => {
    const boldFormatted = text.replace(
      /\*\*(.*?)\*\*/g,
      `<strong class="${isDark ? 'text-white font-bold' : 'text-zinc-950 font-bold'}">$1</strong>`
    );
    return (
      <span
        className={`text-xs sm:text-sm font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}
        dangerouslySetInnerHTML={{ __html: boldFormatted }}
      />
    );
  };

  // Helper to extract a big metric / statistic from bullets or title for the Callout layout
  const extractMetric = () => {
    const combined = `${slide.title} ${slide.headline} ${slide.bullets.join(' ')}`;
    const statMatch = combined.match(/(\d+[\d.,]*%|\d+x|\d+\/\d+|Δ[A-Z]|E\s*=\s*mc²|[A-Z₀-₉]+\s*[+→]\s*[A-Z₀-₉]+|pH\s*\d+|[0-9]+[A-Za-z]+|\b(?:#1|1st|2nd|3rd|100%|50%|0%)\b)/i);
    if (statMatch) return statMatch[0];
    return '0' + slide.slideNumber;
  };

  return (
    <div
      className={`relative w-full aspect-[16/9] min-h-[300px] xs:min-h-[360px] sm:min-h-[420px] rounded-3xl overflow-hidden shadow-soft-xl transition-all duration-300 flex flex-col justify-between select-none ${
        isDark ? 'bg-zinc-950 text-white shadow-soft-lg border-0' : 'bg-white text-zinc-900 shadow-soft-lg border-0'
      }`}
      style={{
        backgroundImage: isDark
          ? 'radial-gradient(ellipse at 80% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 10% 100%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)'
          : 'radial-gradient(ellipse at 80% 0%, rgba(99, 102, 241, 0.04) 0%, transparent 60%), radial-gradient(ellipse at 10% 100%, rgba(139, 92, 246, 0.03) 0%, transparent 50%)',
      }}
    >
      {/* Slide Top Navigation Strip / Header */}
      <div className={`px-4 sm:px-6 md:px-8 py-2.5 flex items-center justify-between shadow-soft-xs ${
        isDark ? 'bg-zinc-900/40 text-zinc-400' : 'bg-zinc-50/60 text-zinc-500'
      }`}>
        <div className="flex items-center gap-2 text-xs overflow-hidden shrink min-w-0">
          {deck.session && (
            <span className={`font-semibold shrink-0 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {deck.session}
            </span>
          )}
          {deck.session && <span aria-hidden="true" className="opacity-30">·</span>}
          <span className={`font-bold truncate shrink-0 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {deck.subject}
          </span>
          <span aria-hidden="true" className="opacity-30 hidden xs:inline">·</span>
          <span className={`text-xs font-medium shrink-0 hidden xs:inline ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {slide.layoutType}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <span className="font-semibold text-zinc-400 hidden xs:inline">
            {slide.estimatedTime}
          </span>
          <span className={`px-2 py-0.5 rounded-lg font-bold tabular-nums shadow-soft-xs ${
            isDark ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-900'
          }`}>
            {slide.slideNumber} / {deck.slides.length}
          </span>
        </div>
      </div>

      {/* Main Slide Content Canvas - Switched by Layout Archetype */}
      <div className="flex-1 px-4 sm:px-8 md:px-10 py-3 sm:py-4 overflow-y-auto scrollbar-thin flex flex-col justify-start">
        {/* ========================================================= */}
        {/* ARCHETYPE 1: TITLE HERO */}
        {/* ========================================================= */}
        {slide.layoutType === 'Title Hero' && (
          <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto text-center py-1">
            <div className="text-xs font-bold text-indigo-400 tracking-normal mb-1">
              Key Instructional Focus
            </div>

            <h1 className={`text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight ${getHeadingFontClass()} ${
              isDark ? 'text-white' : 'text-zinc-950'
            }`}>
              {slide.title}
            </h1>

            <p className={`text-xs sm:text-base font-medium max-w-2xl mx-auto leading-relaxed ${getBodyFontClass()} ${
              isDark ? 'text-zinc-300' : 'text-zinc-600'
            }`}>
              {slide.headline}
            </p>

            {/* 3 Horizontal Roadmap Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3.5 pt-2 text-left">
              {slide.bullets.slice(0, 3).map((bullet, idx) => (
                <div
                  key={idx}
                  className={`p-3 sm:p-4 rounded-2xl transition-all shadow-soft-sm flex flex-col justify-between ${
                    isDark
                      ? 'bg-zinc-900/80 text-zinc-100 hover:bg-zinc-900'
                      : 'bg-zinc-50 text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold font-mono text-indigo-400">0{idx + 1}.</span>
                    <span className="text-xs font-semibold text-zinc-400">Pillar {idx + 1}</span>
                  </div>
                  {renderBulletText(bullet)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ARCHETYPE 2: SPLIT COMPARISON 50/50 */}
        {/* ========================================================= */}
        {slide.layoutType === 'Split Comparison 50/50' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center py-1">
            {/* Left Column: Title + Bullets (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="space-y-1">
                <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight leading-snug ${getHeadingFontClass()} ${
                  isDark ? 'text-white' : 'text-zinc-950'
                }`}>
                  {slide.title}
                </h2>
                <p className={`text-xs sm:text-sm font-medium ${getBodyFontClass()} ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {slide.headline}
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {slide.bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl flex items-start gap-2.5 shadow-soft-sm transition-all ${
                      isDark ? 'bg-zinc-900/80 text-zinc-100' : 'bg-zinc-50 text-zinc-900'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 text-xs">{renderBulletText(bullet)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Visual Asset Frame Preview (5 cols) */}
            <div className="lg:col-span-5">
              <div className={`p-4 rounded-3xl shadow-soft-md transition-all space-y-3 ${
                isDark ? 'bg-zinc-900/90' : 'bg-zinc-100/90'
              }`}>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-[11px] uppercase tracking-wider">
                    {getLucideIcon(slide.visualPrompt.suggestedIcon)}
                    <span>{slide.visualPrompt.illustrationStyle || 'AI Illustration'}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold">
                    Custom Artwork
                  </span>
                </div>

                {/* If custom SVG art is available, display the vector illustration */}
                {slide.visualPrompt.customSvgArt ? (
                  <div
                    className={`aspect-[16/10] rounded-2xl overflow-hidden shadow-soft-sm flex items-center justify-center p-2 ${
                      isDark ? 'bg-zinc-950 text-zinc-200' : 'bg-white text-zinc-800'
                    }`}
                    dangerouslySetInnerHTML={{ __html: slide.visualPrompt.customSvgArt }}
                  />
                ) : (
                  <div className={`aspect-[16/10] rounded-2xl p-4 flex flex-col justify-between shadow-soft-sm ${
                    isDark ? 'bg-zinc-950 text-zinc-200' : 'bg-white text-zinc-800'
                  }`}>
                    <p className="text-xs font-mono leading-relaxed line-clamp-4">
                      "{slide.visualPrompt.imagePrompt}"
                    </p>

                    <div className="pt-3 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 truncate max-w-[150px]">{slide.visualPrompt.recommendedPlacement}</span>
                      {onCopyPrompt && (
                        <button
                          onClick={() => onCopyPrompt(slide.visualPrompt.imagePrompt)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                            isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900'
                          }`}
                        >
                          {isCopiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopiedPrompt ? 'Copied' : 'Prompt'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1 truncate">
                  <span className="truncate"><strong>Alt Text:</strong> {slide.visualPrompt.altText}</span>
                  {onCopyPrompt && (
                    <button
                      onClick={() => onCopyPrompt(slide.visualPrompt.imagePrompt)}
                      className="text-indigo-400 font-semibold hover:underline shrink-0 ml-2 cursor-pointer"
                    >
                      Copy Prompt
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ARCHETYPE 3: BIG STAT / CALLOUT */}
        {/* ========================================================= */}
        {slide.layoutType === 'Big Stat / Callout' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center py-1">
            {/* Left Big Callout Banner (5 cols) */}
            <div className="lg:col-span-5">
              <div className={`p-5 sm:p-6 rounded-3xl shadow-soft-lg flex flex-col justify-between min-h-[180px] text-center ${
                isDark
                  ? 'bg-gradient-to-br from-indigo-950/40 via-zinc-900 to-zinc-950'
                  : 'bg-gradient-to-br from-indigo-50/80 via-white to-zinc-50'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  Critical Metric & Formula
                </span>

                <div className="py-2">
                  <div className="font-display font-black text-3xl sm:text-4xl text-indigo-400 tracking-tight">
                    {extractMetric()}
                  </div>
                  <div className={`text-xs font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Primary Mechanism Threshold
                  </div>
                </div>

                <div className={`text-[11px] font-medium px-3 py-1 rounded-xl mx-auto shadow-soft-xs ${
                  isDark ? 'bg-zinc-900 text-zinc-400' : 'bg-white text-zinc-600'
                }`}>
                  High-Impact Pedagogical Anchor
                </div>
              </div>
            </div>

            {/* Right Content Points (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="space-y-1">
                <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${getHeadingFontClass()} ${
                  isDark ? 'text-white' : 'text-zinc-950'
                }`}>
                  {slide.title}
                </h2>
                <p className={`text-xs sm:text-sm font-medium ${getBodyFontClass()} ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {slide.headline}
                </p>
              </div>

              <div className="space-y-2">
                {slide.bullets.map((bullet, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl flex items-start gap-2.5 shadow-soft-sm ${
                      isDark ? 'bg-zinc-900/80 text-zinc-100' : 'bg-zinc-50 text-zinc-900'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">{renderBulletText(bullet)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ARCHETYPE 4: 3-COLUMN GRID */}
        {/* ========================================================= */}
        {slide.layoutType === '3-Column Grid' && (
          <div className="space-y-3 py-1">
            <div className="space-y-1 text-center max-w-2xl mx-auto">
              <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${getHeadingFontClass()} ${
                isDark ? 'text-white' : 'text-zinc-950'
              }`}>
                {slide.title}
              </h2>
              <p className={`text-xs sm:text-sm font-medium ${getBodyFontClass()} ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {slide.headline}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {slide.bullets.slice(0, 3).map((bullet, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-3xl shadow-soft-sm flex flex-col justify-between min-h-[140px] ${
                    isDark ? 'bg-zinc-900/80 text-zinc-100' : 'bg-zinc-50 text-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5">
                    <span className="w-5 h-5 rounded-xl bg-indigo-500/20 text-indigo-400 font-mono font-bold text-[11px] flex items-center justify-center">
                      0{idx + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Concept Tier {idx + 1}
                    </span>
                  </div>

                  <div className="py-1 text-xs">{renderBulletText(bullet)}</div>

                  <div className="text-[10px] font-medium text-indigo-400 flex items-center gap-1 pt-1">
                    <span>Active Component</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ARCHETYPE 5: TIMELINE FLOW */}
        {/* ========================================================= */}
        {slide.layoutType === 'Timeline Flow' && (
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                <GitCommit className="w-4 h-4" />
                <span>Sequential Process Roadmap</span>
              </div>
              <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${getHeadingFontClass()} ${
                isDark ? 'text-white' : 'text-zinc-950'
              }`}>
                {slide.title}
              </h2>
              <p className={`text-xs sm:text-sm font-medium ${getBodyFontClass()} ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {slide.headline}
              </p>
            </div>

            {/* Horizontal Step Sequence */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 relative">
              {slide.bullets.slice(0, 3).map((bullet, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl relative z-10 flex flex-col justify-between shadow-soft-sm ${
                    isDark ? 'bg-zinc-900/80 text-zinc-100' : 'bg-zinc-50 text-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-500 text-white font-mono font-bold text-[11px]">
                      Step {idx + 1}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      Phase
                    </span>
                  </div>
                  <div className="py-1 text-xs">{renderBulletText(bullet)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ARCHETYPE 6: TEACHER-LED DISCUSSION / SOCRATIC PROMPT */}
        {/* ========================================================= */}
        {slide.layoutType === 'Teacher-Led Discussion Prompt' && (
          <div className="space-y-3 py-1 max-w-3xl mx-auto text-center">
            <div className="w-9 h-9 rounded-2xl mx-auto bg-indigo-500/15 text-indigo-400 flex items-center justify-center shadow-soft-xs">
              <Quote className="w-4 h-4" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                Socratic Active Learning Check
              </span>
              <h2 className={`text-lg sm:text-2xl font-black tracking-tight leading-snug ${getHeadingFontClass()} ${
                isDark ? 'text-white' : 'text-zinc-950'
              }`}>
                {slide.title}
              </h2>
              <p className={`text-xs sm:text-sm font-medium max-w-xl mx-auto ${getBodyFontClass()} ${
                isDark ? 'text-zinc-300' : 'text-zinc-700'
              }`}>
                "{slide.headline}"
              </p>
            </div>

            {/* Discussion Points / Takeaways */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-1">
              {slide.bullets.map((bullet, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl flex items-start gap-2 shadow-soft-sm ${
                    isDark ? 'bg-zinc-900/80 text-zinc-100' : 'bg-zinc-50 text-zinc-900'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">{renderBulletText(bullet)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Slide Bottom Footer Bar */}
      <div className={`px-4 sm:px-6 py-2 flex items-center justify-between shadow-soft-xs text-[10px] sm:text-[11px] ${
        isDark ? 'bg-zinc-900/40 text-zinc-500' : 'bg-zinc-50/60 text-zinc-400'
      }`}>
        <div className="flex items-center gap-2 truncate shrink min-w-0">
          <span className="truncate max-w-[200px] sm:max-w-xs">{deck.title}</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">Pedagogy Dual-Coding</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-[9px] sm:text-[10px] uppercase">SlideCraft AI Studio</span>
        </div>
      </div>
    </div>
  );
};

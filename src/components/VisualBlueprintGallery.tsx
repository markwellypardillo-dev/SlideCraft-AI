import React, { useState } from 'react';
import {
  Copy,
  Check,
  Filter,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';
import { SlideDeck } from '../types/deck';

interface VisualBlueprintGalleryProps {
  deck: SlideDeck;
  isDark: boolean;
}

export const VisualBlueprintGallery: React.FC<VisualBlueprintGalleryProps> = ({
  deck,
  isDark,
}) => {
  const [selectedPlacement, setSelectedPlacement] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAllPrompts = () => {
    const allPromptsText = deck.slides
      .map(
        (s) =>
          `// Slide ${s.slideNumber}: ${s.title}\n/imagine prompt: ${s.visualPrompt.imagePrompt} --ar 16:9 --v 6.0`
      )
      .join('\n\n');

    handleCopy(allPromptsText, 'all-prompts');
  };

  const filteredSlides = deck.slides.filter((slide) => {
    const matchesPlacement =
      selectedPlacement === 'all' || slide.visualPrompt.recommendedPlacement === selectedPlacement;
    const matchesSearch =
      searchQuery === '' ||
      slide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slide.visualPrompt.imagePrompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlacement && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Action Toolbar */}
      <div className={`p-4 rounded-3xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
        isDark ? 'bg-zinc-900/80 shadow-soft-sm' : 'bg-white shadow-soft'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl flex items-center justify-center ${
            isDark ? 'bg-indigo-950/60 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
          }`}>
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`font-display text-lg sm:text-xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}>
              Visual Prompts ({deck.slides.length})
            </h2>
            <p className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Midjourney v6, DALL-E 3 & Imagen 3 prompts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts..."
            className={`w-44 sm:w-56 px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-soft-xs ${
              isDark
                ? 'bg-zinc-950 text-white placeholder-zinc-500'
                : 'bg-zinc-100/80 text-zinc-900 placeholder-zinc-400'
            }`}
          />

          <button
            onClick={handleCopyAllPrompts}
            className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-soft transition-all cursor-pointer shrink-0 ${
              isDark
                ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                : 'bg-zinc-900 text-white hover:bg-zinc-800'
            }`}
          >
            {copiedKey === 'all-prompts' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Copied All!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All Prompts</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={`p-2.5 rounded-2xl transition-all flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-soft-xs ${
        isDark ? 'bg-zinc-950/70' : 'bg-white'
      }`}>
        <Filter className={`w-3.5 h-3.5 shrink-0 ml-1.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`} />
        {[
          { id: 'all', label: 'All Placements' },
          { id: 'Right 50% split', label: 'Right 50% Split' },
          { id: 'Full bleed background with 70% dark overlay', label: 'Full Bleed' },
          { id: 'Center floating icon', label: 'Center Icon' },
          { id: 'Top banner', label: 'Top Banner' },
        ].map((placement) => (
          <button
            key={placement.id}
            onClick={() => setSelectedPlacement(placement.id)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedPlacement === placement.id
                ? isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-200 text-zinc-900'
                : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            {placement.label}
          </button>
        ))}
      </div>

      {/* Blueprint Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSlides.map((slide) => {
          const prompt = slide.visualPrompt;
          return (
            <div
              key={slide.id}
              className={`p-6 rounded-3xl space-y-4 transition-all flex flex-col justify-between ${
                isDark ? 'bg-zinc-900/60 shadow-soft-md' : 'bg-white shadow-soft'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold tabular-nums shadow-soft-xs ${
                      isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-800'
                    }`}>
                      {slide.slideNumber}
                    </span>
                    <h4 className={`font-display text-sm font-bold line-clamp-1 ${
                      isDark ? 'text-white' : 'text-zinc-900'
                    }`}>
                      {slide.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(`PowerPoint Designer Prompt for Slide ${slide.slideNumber}: ${prompt.imagePrompt}. Layout placement: ${prompt.recommendedPlacement}. Aspect Ratio 16:9 widescreen.`, `ppt-${slide.id}`)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1 shadow-soft-xs transition-all cursor-pointer ${
                        isDark ? 'bg-indigo-950/80 text-indigo-300 hover:bg-indigo-900' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      }`}
                      title="Copy formatted prompt for PowerPoint Copilot / Designer"
                    >
                      {copiedKey === `ppt-${slide.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied PPT</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>PowerPoint</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(`/imagine prompt: ${prompt.imagePrompt} --ar 16:9 --v 6.0`, `midjourney-${slide.id}`)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1 shadow-soft-xs transition-all cursor-pointer ${
                        isDark
                          ? 'bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-850'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                      title="Copy Midjourney v6 prompt"
                    >
                      {copiedKey === `midjourney-${slide.id}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Midjourney</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* SVG Visual Blueprint Preview Container */}
                {prompt.customSvgArt && (
                  <div className={`p-3 rounded-2xl shadow-soft-sm overflow-hidden flex items-center justify-center max-h-48 ${
                    isDark ? 'bg-zinc-950/90' : 'bg-zinc-50'
                  }`}>
                    <div
                      className="w-full h-full max-h-44 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: prompt.customSvgArt }}
                    />
                  </div>
                )}

                {/* Prompt Box with Soft Shadow */}
                <div className={`p-3.5 rounded-2xl shadow-soft-xs space-y-1.5 ${
                  isDark ? 'bg-zinc-950 text-zinc-300' : 'bg-zinc-50 text-zinc-800'
                }`}>
                  <div className="flex items-center justify-between text-[10px] font-mono text-indigo-400 font-bold">
                    <span>16:9 Widescreen Visual Specification</span>
                    <span>{prompt.illustrationStyle || deck.illustrationStyle}</span>
                  </div>
                  <p className="text-xs font-mono leading-relaxed">
                    "{prompt.imagePrompt}"
                  </p>
                </div>

                {/* Design Instructions */}
                {prompt.designInstructions && (
                  <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    <strong className={isDark ? 'text-zinc-300' : 'text-zinc-800'}>PowerPoint Layout Rule:</strong> {prompt.designInstructions}
                  </p>
                )}
              </div>

              {/* Specs & Accessibility Alt Text */}
              <div className={`flex flex-wrap items-center justify-between text-xs pt-3 ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                <div className="flex items-center gap-2">
                  <span>{prompt.recommendedPlacement}</span>
                  <span aria-hidden="true">·</span>
                  <span>Icon: {prompt.suggestedIcon}</span>
                </div>

                <button
                  onClick={() => handleCopy(prompt.altText, `alt-${slide.id}`)}
                  className={`text-[11px] font-semibold cursor-pointer transition-colors ${
                    isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {copiedKey === `alt-${slide.id}` ? 'Copied Alt Text' : 'Copy Alt Text'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutTemplate,
  ChevronUp,
  ChevronDown,
  Copy,
  Trash2,
  Split,
  TrendingUp,
  LayoutGrid,
  GitCommit,
  Quote,
  Layers,
  Plus,
  Edit2,
  Check,
  X,
  Clock,
  Image as ImageIcon,
} from 'lucide-react';
import { SlideItem, LayoutType } from '../types/deck';

interface SlideThumbnailCardProps {
  slide: SlideItem;
  index: number;
  totalSlides: number;
  isSelected: boolean;
  isDark: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onInsertBelow?: () => void;
  onUpdateTitle?: (newTitle: string) => void;
  onUpdateLayout?: (newLayout: LayoutType) => void;
  onUpdateEstimatedTime?: (newTime: string) => void;
}

const ALL_LAYOUTS: { type: LayoutType; label: string; icon: React.ReactNode }[] = [
  { type: 'Title Hero', label: 'Title Hero', icon: <LayoutTemplate className="w-3.5 h-3.5 text-amber-400" /> },
  { type: 'Split Comparison 50/50', label: 'Split 50/50', icon: <Split className="w-3.5 h-3.5 text-indigo-400" /> },
  { type: 'Big Stat / Callout', label: 'Big Stat', icon: <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> },
  { type: '3-Column Grid', label: '3-Column Grid', icon: <LayoutGrid className="w-3.5 h-3.5 text-sky-400" /> },
  { type: 'Timeline Flow', label: 'Timeline', icon: <GitCommit className="w-3.5 h-3.5 text-purple-400" /> },
  { type: 'Teacher-Led Discussion Prompt', label: 'Discussion', icon: <Quote className="w-3.5 h-3.5 text-pink-400" /> },
];

export const SlideThumbnailCard: React.FC<SlideThumbnailCardProps> = ({
  slide,
  index,
  totalSlides,
  isSelected,
  isDark,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onInsertBelow,
  onUpdateTitle,
  onUpdateLayout,
  onUpdateEstimatedTime,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(slide.title);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const layoutMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditedTitle(slide.title);
  }, [slide.title]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Click-outside listener for layout popup menu
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (layoutMenuRef.current && !layoutMenuRef.current.contains(e.target as Node)) {
        setShowLayoutMenu(false);
      }
    };
    if (showLayoutMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showLayoutMenu]);

  const handleSaveTitle = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editedTitle.trim() && onUpdateTitle) {
      onUpdateTitle(editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedTitle(slide.title);
    setIsEditingTitle(false);
  };

  const handleCycleTime = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateEstimatedTime) return;
    const times = ['1 min', '2 min', '3 min', '4 min', '5 min', '8 min'];
    const currentIdx = times.indexOf(slide.estimatedTime);
    const nextTime = times[(currentIdx + 1) % times.length];
    onUpdateEstimatedTime(nextTime);
  };

  // Mini layout archetype icon
  const getLayoutIcon = (type: LayoutType) => {
    switch (type) {
      case 'Title Hero':
        return <LayoutTemplate className="w-3 h-3 text-amber-400" />;
      case 'Split Comparison 50/50':
        return <Split className="w-3 h-3 text-indigo-400" />;
      case 'Big Stat / Callout':
        return <TrendingUp className="w-3 h-3 text-emerald-400" />;
      case '3-Column Grid':
        return <LayoutGrid className="w-3 h-3 text-sky-400" />;
      case 'Timeline Flow':
        return <GitCommit className="w-3 h-3 text-purple-400" />;
      case 'Teacher-Led Discussion Prompt':
        return <Quote className="w-3 h-3 text-pink-400" />;
      default:
        return <Layers className="w-3 h-3 text-zinc-400" />;
    }
  };

  // Mini wireframe visual sketch based on archetype (zero solid borders, soft smooth tints)
  const renderMiniWireframe = () => {
    switch (slide.layoutType) {
      case 'Title Hero':
        return (
          <div className="w-full h-full p-2 flex flex-col justify-center items-center text-center space-y-1">
            <div className="w-3/4 h-2 rounded bg-indigo-500/80" />
            <div className="w-1/2 h-1 rounded bg-zinc-400/50" />
            <div className="flex gap-1 pt-1 w-full justify-center">
              <div className="w-1/4 h-2.5 rounded bg-zinc-500/30" />
              <div className="w-1/4 h-2.5 rounded bg-zinc-500/30" />
              <div className="w-1/4 h-2.5 rounded bg-zinc-500/30" />
            </div>
          </div>
        );
      case 'Split Comparison 50/50':
        return (
          <div className="w-full h-full p-2 grid grid-cols-2 gap-1.5 items-center">
            <div className="space-y-1">
              <div className="w-full h-1.5 rounded bg-indigo-400/80" />
              <div className="w-4/5 h-1 rounded bg-zinc-400/50" />
              <div className="w-3/4 h-1 rounded bg-zinc-400/40" />
            </div>
            <div className="w-full h-full rounded bg-indigo-500/15 flex items-center justify-center">
              <ImageIcon className="w-2.5 h-2.5 text-indigo-400/80" />
            </div>
          </div>
        );
      case 'Big Stat / Callout':
        return (
          <div className="w-full h-full p-2 grid grid-cols-5 gap-1.5 items-center">
            <div className="col-span-2 h-full rounded bg-indigo-500/20 flex flex-col items-center justify-center">
              <span className="font-mono text-[9px] font-black text-indigo-400">98%</span>
            </div>
            <div className="col-span-3 space-y-1">
              <div className="w-full h-1.5 rounded bg-zinc-300/80" />
              <div className="w-4/5 h-1 rounded bg-zinc-400/50" />
              <div className="w-2/3 h-1 rounded bg-zinc-400/40" />
            </div>
          </div>
        );
      case '3-Column Grid':
        return (
          <div className="w-full h-full p-2 flex flex-col justify-between">
            <div className="w-1/2 h-1.5 rounded bg-zinc-300/80 mx-auto" />
            <div className="grid grid-cols-3 gap-1">
              <div className="h-4 rounded bg-zinc-500/25 flex items-center justify-center text-[7px] text-zinc-400 font-bold">1</div>
              <div className="h-4 rounded bg-zinc-500/25 flex items-center justify-center text-[7px] text-zinc-400 font-bold">2</div>
              <div className="h-4 rounded bg-zinc-500/25 flex items-center justify-center text-[7px] text-zinc-400 font-bold">3</div>
            </div>
          </div>
        );
      case 'Timeline Flow':
        return (
          <div className="w-full h-full p-2 flex flex-col justify-between">
            <div className="w-2/3 h-1.5 rounded bg-zinc-300/80" />
            <div className="flex items-center justify-between relative px-1">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <div className="w-full h-0.5 bg-zinc-500/40 mx-0.5" />
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <div className="w-full h-0.5 bg-zinc-500/40 mx-0.5" />
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            </div>
          </div>
        );
      case 'Teacher-Led Discussion Prompt':
        return (
          <div className="w-full h-full p-2 flex flex-col justify-center items-center text-center space-y-1">
            <Quote className="w-2.5 h-2.5 text-pink-400" />
            <div className="w-4/5 h-1.5 rounded bg-pink-400/80" />
            <div className="w-3/5 h-1 rounded bg-zinc-400/50" />
          </div>
        );
      default:
        return (
          <div className="w-full h-full p-2 space-y-1">
            <div className="w-3/4 h-1.5 rounded bg-zinc-300/80" />
            <div className="w-full h-1 rounded bg-zinc-400/50" />
            <div className="w-4/5 h-1 rounded bg-zinc-400/40" />
          </div>
        );
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl p-2.5 transition-all duration-200 cursor-pointer text-left ${
        isSelected
          ? isDark
            ? 'bg-zinc-850 shadow-soft-lg ring-2 ring-indigo-500/70'
            : 'bg-white shadow-soft-lg ring-2 ring-indigo-500/60'
          : isDark
          ? 'bg-zinc-900/60 hover:bg-zinc-850/90 shadow-soft-xs hover:shadow-soft-sm'
          : 'bg-white/80 hover:bg-white shadow-soft-xs hover:shadow-soft-sm'
      }`}
    >
      {/* Top Header: Slide Number + Layout Picker + Duration Badge */}
      <div className="flex items-center justify-between mb-1.5 px-0.5 relative">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px] tabular-nums transition-colors ${
              isSelected
                ? 'bg-indigo-500 text-white shadow-soft-xs'
                : isDark
                ? 'bg-zinc-800 text-zinc-300'
                : 'bg-zinc-200 text-zinc-700'
            }`}
          >
            {slide.slideNumber}
          </span>

          {/* Interactive Layout Dropdown trigger */}
          <div className="relative" ref={layoutMenuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowLayoutMenu(!showLayoutMenu);
              }}
              title="Click to change slide layout archetype"
              className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                isDark
                  ? 'hover:bg-zinc-750 text-zinc-300 hover:text-white'
                  : 'hover:bg-zinc-200/80 text-zinc-700 hover:text-zinc-900'
              }`}
            >
              {getLayoutIcon(slide.layoutType)}
              <span className="truncate max-w-[105px]">{slide.layoutType}</span>
            </button>

            {/* Layout Archetype Menu Popover */}
            {showLayoutMenu && (
              <div
                className={`absolute top-full left-0 mt-1 w-48 p-1.5 rounded-2xl shadow-soft-xl z-30 backdrop-blur-xl animate-in fade-in slide-in-from-top-1 ${
                  isDark ? 'bg-zinc-900/95 text-white' : 'bg-white/95 text-zinc-900'
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1">
                  Change Layout
                </div>
                <div className="space-y-0.5">
                  {ALL_LAYOUTS.map((lay) => (
                    <button
                      key={lay.type}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onUpdateLayout) onUpdateLayout(lay.type);
                        setShowLayoutMenu(false);
                      }}
                      className={`w-full px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        slide.layoutType === lay.type
                          ? 'bg-indigo-600 text-white font-bold'
                          : isDark
                          ? 'hover:bg-zinc-800 text-zinc-300'
                          : 'hover:bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      {lay.icon}
                      <span className="truncate">{lay.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clickable Duration badge to cycle slide timing */}
        <button
          type="button"
          onClick={handleCycleTime}
          title="Click to adjust estimated presentation time"
          className="text-[10px] font-mono text-zinc-400 hover:text-indigo-400 flex items-center gap-0.5 cursor-pointer px-1 py-0.5 rounded transition-colors"
        >
          <Clock className="w-2.5 h-2.5 opacity-60" />
          <span>{slide.estimatedTime}</span>
        </button>
      </div>

      {/* 16:9 Miniature Slide Snapshot Preview */}
      <div
        className={`w-full aspect-[16/9] rounded-xl overflow-hidden mb-2 transition-all relative ${
          isSelected
            ? isDark
              ? 'bg-zinc-950 shadow-soft-xs'
              : 'bg-zinc-100 shadow-soft-xs'
            : isDark
            ? 'bg-zinc-900/90'
            : 'bg-zinc-50'
        }`}
      >
        {renderMiniWireframe()}
      </div>

      {/* Title & Headline with Quick In-Place Edit */}
      <div className="px-0.5">
        {isEditingTitle ? (
          <form
            onSubmit={handleSaveTitle}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 mt-0.5"
          >
            <input
              ref={titleInputRef}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className={`w-full px-2 py-1 text-xs font-bold rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-soft-xs ${
                isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-900'
              }`}
            />
            <button
              type="submit"
              title="Save Title"
              className="p-1 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 cursor-pointer shrink-0"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleCancelTitle}
              title="Cancel"
              className="p-1 rounded-md bg-zinc-700 text-zinc-300 hover:bg-zinc-600 cursor-pointer shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </form>
        ) : (
          <div className="group/title flex items-center justify-between gap-1">
            <h4
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              title="Double-click to rename"
              className={`text-xs font-bold line-clamp-1 flex-1 ${
                isSelected
                  ? isDark
                    ? 'text-white'
                    : 'text-zinc-950'
                  : isDark
                  ? 'text-zinc-300'
                  : 'text-zinc-800'
              }`}
            >
              {slide.title}
            </h4>

            {/* Quick Rename pen icon */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              title="Rename slide"
              className="opacity-0 group-hover:opacity-100 group-hover/title:opacity-100 p-0.5 rounded text-zinc-400 hover:text-indigo-400 cursor-pointer transition-opacity"
            >
              <Edit2 className="w-2.5 h-2.5" />
            </button>
          </div>
        )}

        <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">
          {slide.headline}
        </p>
      </div>

      {/* Floating Action Menu on Selection or Hover (Zero solid border, clean elevation) */}
      <div
        className={`absolute top-2 right-2 flex items-center gap-0.5 transition-opacity p-1 rounded-xl shadow-soft-lg backdrop-blur-xl z-10 ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        } ${isDark ? 'bg-zinc-900/95 text-zinc-300' : 'bg-white/95 text-zinc-700'}`}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={index === 0}
          title="Move Slide Up"
          className="p-1 hover:text-indigo-400 disabled:opacity-20 cursor-pointer transition-colors"
        >
          <ChevronUp className="w-3 h-3" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={index === totalSlides - 1}
          title="Move Slide Down"
          className="p-1 hover:text-indigo-400 disabled:opacity-20 cursor-pointer transition-colors"
        >
          <ChevronDown className="w-3 h-3" />
        </button>

        {onInsertBelow && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInsertBelow();
            }}
            title="Insert New Slide Below"
            className="p-1 hover:text-emerald-400 cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          title="Duplicate Slide"
          className="p-1 hover:text-indigo-400 cursor-pointer transition-colors"
        >
          <Copy className="w-3 h-3" />
        </button>

        {totalSlides > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete Slide"
            className="p-1 hover:text-red-400 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

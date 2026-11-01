import React, { useState } from 'react';
import {
  FolderGit2,
  Image as ImageIcon,
  BarChart3,
  GraduationCap,
  Settings,
  History,
  Sun,
  Moon,
  Monitor,
  LogIn,
  LogOut,
  LayoutTemplate,
  Activity,
  X,
  Layers,
  ChevronRight,
  ShieldCheck,
  BookOpenCheck,
} from 'lucide-react';
import { ActiveNavTab, SlideDeck, ThemeMode } from '../types/deck';
import { User as FirebaseUser } from 'firebase/auth';

interface SidebarProps {
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  isDark: boolean;
  themeMode?: ThemeMode;
  setThemeMode?: (mode: ThemeMode) => void;
  toggleTheme?: () => void;
  totalSlides: number;
  wordCount: number;
  hasDeck: boolean;
  onOpenAccessibility: () => void;
  onOpenCompanion: () => void;
  currentUser: FirebaseUser | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  savedDecks?: SlideDeck[];
  onSelectDeck?: (deck: SlideDeck) => void;
  currentDeck?: SlideDeck | null;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  workspaceMode?: 'studio' | 'admin';
  onToggleWorkspaceMode?: (mode: 'studio' | 'admin') => void;
  isAdmin?: boolean;
  onOpenWorkspaceSelector?: () => void;
  onOpenTemplateArchitect?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  themeMode = 'system',
  setThemeMode,
  toggleTheme,
  totalSlides,
  wordCount: _wordCount,
  hasDeck,
  currentUser,
  onOpenAuth,
  onSignOut,
  savedDecks = [],
  onSelectDeck: _onSelectDeck,
  currentDeck: _currentDeck,
  isMobileOpen = false,
  onCloseMobile,
  workspaceMode = 'studio',
  onToggleWorkspaceMode,
  isAdmin = false,
  onOpenWorkspaceSelector,
  onOpenTemplateArchitect,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Expanded on desktop when hovered, or on mobile when drawer is triggered
  const isExpanded = isHovered || isMobileOpen;

  interface NavItem {
    id: ActiveNavTab | 'template_architect';
    label: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  interface NavGroup {
    category: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      category: 'Create & Design',
      items: [
        {
          id: 'generator',
          label: 'Deck Generator',
          subtitle: 'Upload & Architect',
          icon: FolderGit2,
          badge: hasDeck ? `${totalSlides}s` : undefined,
        },
        {
          id: 'educator_toolkit',
          label: 'Educator Toolkit',
          subtitle: 'Lesson Plans & Rubrics',
          icon: BookOpenCheck,
          badge: '4 Tools',
        },
        ...(isAdmin
          ? [
              {
                id: 'template_architect' as const,
                label: 'Master Templates',
                subtitle: 'Canva & PPT Studio',
                icon: LayoutTemplate,
                badge: 'Admin',
              },
            ]
          : []),
        {
          id: 'visual_blueprint',
          label: 'Visual Prompts',
          subtitle: 'DALL-E & Midjourney',
          icon: ImageIcon,
          badge: hasDeck ? `${totalSlides}` : undefined,
        },
        {
          id: 'assessments',
          label: 'Assessments',
          subtitle: 'Quizzes & Checks',
          icon: BarChart3,
          badge: hasDeck ? 'CSV' : undefined,
        },
      ],
    },
    {
      category: 'Present & Deliver',
      items: [
        {
          id: 'presenter_view',
          label: 'Practice Mode',
          subtitle: 'Teleprompter & Timer',
          icon: GraduationCap,
        },
        {
          id: 'export_settings',
          label: 'Export Studio',
          subtitle: 'PPTX, Word & PDF',
          icon: Settings,
        },
      ],
    },
    {
      category: 'Library',
      items: [
        {
          id: 'curriculum_library',
          label: 'Executed History',
          subtitle: 'Past Decks & Docs',
          icon: History,
          badge: savedDecks.length > 0 ? `${savedDecks.length}` : undefined,
        },
      ],
    },
  ];

  const handleNavClick = (tab: ActiveNavTab | 'template_architect') => {
    if (tab === 'template_architect') {
      if (onOpenTemplateArchitect) {
        onOpenTemplateArchitect();
      } else if (onToggleWorkspaceMode) {
        onToggleWorkspaceMode('admin');
      }
      if (onCloseMobile) onCloseMobile();
      return;
    }

    if (workspaceMode === 'admin' && onToggleWorkspaceMode) {
      onToggleWorkspaceMode('studio');
    }
    setActiveTab(tab as ActiveNavTab);
    if (onCloseMobile) onCloseMobile();
  };

  const cycleTheme = () => {
    if (setThemeMode) {
      const nextMode: ThemeMode =
        themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
      setThemeMode(nextMode);
    } else {
      toggleTheme?.();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Spatial Computing Glass Floating Container */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed left-3 md:left-5 top-1/2 -translate-y-1/2 z-50 flex flex-col transition-all duration-300 ease-out select-none backdrop-blur-2xl ${
          isDark
            ? 'bg-zinc-950/80 border border-white/10 text-white'
            : 'bg-white/85 border border-slate-200/90 text-slate-900'
        } ${
          isExpanded
            ? isDark
              ? 'w-64 px-3.5 py-4 rounded-[28px] h-[80vh] max-h-[740px] justify-between shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_35px_rgba(99,102,241,0.2)]'
              : 'w-64 px-3.5 py-4 rounded-[28px] h-[80vh] max-h-[740px] justify-between shadow-[0_20px_50px_rgba(0,0,0,0.12),0_0_25px_rgba(99,102,241,0.08)]'
            : isDark
              ? 'w-[60px] px-2 py-3.5 items-center rounded-full h-fit max-h-[85vh] justify-center gap-1.5 shadow-[0_20px_45px_rgba(0,0,0,0.7),0_0_20px_rgba(99,102,241,0.12)]'
              : 'w-[60px] px-2 py-3.5 items-center rounded-full h-fit max-h-[85vh] justify-center gap-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]'
        } ${
          isMobileOpen
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : 'max-md:-translate-x-28 max-md:opacity-0 max-md:pointer-events-none'
        }`}
      >
        {/* Top Header & Navigation Group */}
        <div className="flex flex-col w-full overflow-hidden">
          {/* Header Bar only when expanded */}
          {isExpanded && (
            <div
              className={`flex items-center justify-between px-2 pt-1 pb-3 mb-1 border-b ${
                isDark ? 'border-white/10' : 'border-slate-200/80'
              } animate-in fade-in duration-200`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-soft-xs shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="flex flex-col leading-tight truncate">
                  <span
                    className={`font-display font-extrabold text-xs tracking-tight truncate ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    SlideCraft AI
                  </span>
                  <span
                    className={`text-[10px] font-medium truncate ${
                      isDark ? 'text-indigo-300/80' : 'text-slate-500'
                    }`}
                  >
                    {workspaceMode === 'admin' ? 'Admin Center' : 'Presentation Studio'}
                  </span>
                </div>
              </div>

              {isMobileOpen && onCloseMobile && (
                <button
                  onClick={onCloseMobile}
                  className={`p-1 rounded-lg ${
                    isDark
                      ? 'text-white/50 hover:text-white hover:bg-white/10'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  } md:hidden`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Nav Categories */}
          <div className="flex flex-col space-y-1 overflow-y-auto max-h-[calc(80vh-220px)] scrollbar-none py-1">
            {navGroups.map((group, groupIdx) => (
              <div key={group.category} className="space-y-1">
                {/* Category Header or Divider */}
                {groupIdx > 0 && (
                  <div className="py-0.5">
                    <div
                      className={`h-px rounded-full mx-auto transition-all duration-300 ${
                        isDark ? 'bg-white/10' : 'bg-slate-200/80'
                      } ${isExpanded ? 'w-full' : 'w-6'}`}
                    />
                  </div>
                )}

                {isExpanded && (
                  <div className="px-2 pt-1 pb-0.5">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider block ${
                        isDark ? 'text-indigo-300/60' : 'text-slate-400'
                      }`}
                    >
                      {group.category}
                    </span>
                  </div>
                )}

                {/* Items */}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.id === 'template_architect'
                      ? workspaceMode === 'admin'
                      : workspaceMode === 'studio' && activeTab === item.id;

                  return (
                    <div key={item.id} className="relative group/btn w-full">
                      <button
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center transition-all duration-300 cursor-pointer ${
                          isExpanded
                            ? 'gap-3 px-2.5 py-2 rounded-2xl text-left'
                            : 'justify-center p-2 rounded-full'
                        } ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-soft-sm'
                            : isDark
                              ? 'text-indigo-300/80 hover:text-white hover:bg-white/5'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                        }`}
                        aria-label={item.label}
                      >
                        {/* Primary Website Brand Color Icon */}
                        <div
                          className={`flex items-center justify-center shrink-0 transition-transform group-hover/btn:scale-110 w-5 h-5 ${
                            isActive
                              ? 'text-white drop-shadow'
                              : isDark
                                ? 'text-indigo-400 group-hover/btn:text-indigo-200'
                                : 'text-indigo-600 group-hover/btn:text-indigo-700'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Title, Subtitle & Badge when expanded */}
                        {isExpanded && (
                          <div className="flex-1 min-w-0 flex items-center justify-between">
                            <div className="truncate pr-1">
                              <span
                                className={`text-xs font-semibold block truncate leading-tight ${
                                  isActive
                                    ? 'text-white'
                                    : isDark
                                      ? 'text-zinc-200'
                                      : 'text-slate-800'
                                }`}
                              >
                                {item.label}
                              </span>
                              <span
                                className={`text-[10px] block truncate ${
                                  isActive
                                    ? 'text-indigo-100/90'
                                    : isDark
                                      ? 'text-indigo-300/60'
                                      : 'text-slate-400'
                                }`}
                              >
                                {item.subtitle}
                              </span>
                            </div>
                            {item.badge && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 shadow-soft-xs ${
                                  isActive
                                    ? 'bg-white/25 text-white'
                                    : isDark
                                      ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </button>

                      {/* Tooltip on collapsed state */}
                      {!isExpanded && (
                        <div
                          className={`absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 backdrop-blur-md text-xs rounded-xl opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity whitespace-nowrap shadow-2xl z-50 flex items-center gap-2 ${
                            isDark
                              ? 'bg-zinc-950/95 border border-white/10 text-white'
                              : 'bg-white/95 border border-slate-200 text-slate-800 shadow-xl'
                          }`}
                        >
                          <span className="font-medium">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                                isDark
                                  ? 'bg-indigo-500/30 text-indigo-300'
                                  : 'bg-indigo-100 text-indigo-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section: Admin, User / Auth, Theme Toggle */}
        <div className="flex flex-col w-full space-y-1 pt-1 overflow-hidden">
          {/* Subtle separator */}
          <div className="py-0.5">
            <div
              className={`h-px rounded-full mx-auto transition-all duration-300 ${
                isDark ? 'bg-white/10' : 'bg-slate-200/80'
              } ${isExpanded ? 'w-full' : 'w-6'}`}
            />
          </div>

          {/* Admin Switcher Tile (if user is admin) */}
          {isAdmin && (
            <div className="w-full relative group/btn">
              <button
                onClick={() => {
                  if (onToggleWorkspaceMode) {
                    onToggleWorkspaceMode(workspaceMode === 'admin' ? 'studio' : 'admin');
                  }
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center transition-all duration-300 cursor-pointer ${
                  isExpanded
                    ? 'gap-3 px-2.5 py-2 rounded-2xl text-left'
                    : 'justify-center p-2 rounded-full'
                } ${
                  workspaceMode === 'admin'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]'
                    : isDark
                      ? 'text-purple-300/80 hover:text-white hover:bg-white/5'
                      : 'text-purple-700 hover:text-purple-900 hover:bg-purple-50'
                }`}
                aria-label="Admin Center"
              >
                <div
                  className={`flex items-center justify-center shrink-0 ${
                    workspaceMode === 'admin'
                      ? 'text-white'
                      : isDark
                        ? 'text-purple-400'
                        : 'text-purple-600'
                  }`}
                >
                  <Activity className="w-5 h-5" />
                </div>
                {isExpanded && (
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-xs font-semibold block truncate ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {workspaceMode === 'admin' ? 'Admin Active' : 'Admin Center'}
                    </span>
                    <span
                      className={`text-[10px] block truncate ${
                        isDark ? 'text-purple-300/70' : 'text-purple-600/70'
                      }`}
                    >
                      Telemetry & DB
                    </span>
                  </div>
                )}
              </button>

              {!isExpanded && (
                <div
                  className={`absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 backdrop-blur-md text-xs rounded-xl opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity whitespace-nowrap shadow-2xl z-50 ${
                    isDark
                      ? 'bg-zinc-950/95 border border-purple-500/30 text-white'
                      : 'bg-white/95 border border-purple-200 text-purple-900 shadow-xl'
                  }`}
                >
                  {workspaceMode === 'admin' ? 'Admin Active' : 'Switch to Admin'}
                </div>
              )}
            </div>
          )}

          {/* User Account / Auth Button */}
          {currentUser ? (
            <div className="w-full relative group/user">
              {isExpanded ? (
                <div
                  className={`flex items-center justify-between p-2 rounded-2xl border ${
                    isDark
                      ? 'bg-zinc-900/60 border-white/10'
                      : 'bg-slate-100/80 border-slate-200/80'
                  }`}
                >
                  <div
                    onClick={isAdmin && onOpenWorkspaceSelector ? onOpenWorkspaceSelector : undefined}
                    className={`flex items-center gap-2.5 overflow-hidden flex-1 ${
                      isAdmin ? 'cursor-pointer' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.4)]">
                      {currentUser.displayName
                        ? currentUser.displayName[0].toUpperCase()
                        : currentUser.email?.[0].toUpperCase() || 'U'}
                    </div>
                    <div className="overflow-hidden min-w-0">
                      <span
                        className={`text-xs font-semibold truncate block ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {currentUser.displayName || currentUser.email?.split('@')[0]}
                      </span>
                      <span
                        className={`text-[10px] truncate block ${
                          isDark ? 'text-indigo-300/70' : 'text-slate-500'
                        }`}
                      >
                        {isAdmin ? 'Admin Scope' : 'Cloud Synced'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onSignOut}
                    title="Sign Out"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isDark
                        ? 'text-white/50 hover:text-red-400 hover:bg-white/10'
                        : 'text-slate-400 hover:text-red-600 hover:bg-slate-200/60'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={isAdmin && onOpenWorkspaceSelector ? onOpenWorkspaceSelector : onSignOut}
                  className="w-9 h-9 rounded-full mx-auto flex items-center justify-center font-bold text-xs text-white bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-[0_0_15px_rgba(99,102,241,0.4)] cursor-pointer hover:scale-105 transition-transform"
                >
                  {currentUser.displayName
                    ? currentUser.displayName[0].toUpperCase()
                    : currentUser.email?.[0].toUpperCase() || 'U'}
                </button>
              )}

              {!isExpanded && (
                <div
                  className={`absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 backdrop-blur-md text-xs rounded-xl opacity-0 pointer-events-none group-hover/user:opacity-100 transition-opacity whitespace-nowrap shadow-2xl z-50 flex items-center gap-3 ${
                    isDark
                      ? 'bg-zinc-950/95 border border-white/10 text-white'
                      : 'bg-white/95 border border-slate-200 text-slate-800 shadow-xl'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs">
                      {currentUser.displayName || currentUser.email?.split('@')[0]}
                    </span>
                    <span className={`text-[10px] ${isDark ? 'text-indigo-300/70' : 'text-slate-500'}`}>
                      {isAdmin ? 'Admin' : 'Signed In'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSignOut();
                    }}
                    className={`pointer-events-auto p-1 rounded-md text-red-500 ${
                      isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                    }`}
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full relative group/btn">
              <button
                onClick={() => {
                  onOpenAuth();
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center transition-all duration-300 cursor-pointer ${
                  isExpanded
                    ? 'gap-3 px-2.5 py-2 rounded-2xl text-left'
                    : 'justify-center p-2 rounded-full'
                } ${
                  isDark
                    ? 'text-indigo-300/80 hover:text-white hover:bg-white/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
                aria-label="Sign In"
              >
                <LogIn
                  className={`w-5 h-5 ${
                    isDark
                      ? 'text-indigo-400 group-hover/btn:text-indigo-200'
                      : 'text-indigo-600 group-hover/btn:text-indigo-700'
                  }`}
                />
                {isExpanded && (
                  <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Sign In
                  </span>
                )}
              </button>

              {!isExpanded && (
                <div
                  className={`absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 backdrop-blur-md text-xs rounded-xl opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity whitespace-nowrap shadow-2xl z-50 ${
                    isDark
                      ? 'bg-zinc-950/95 border border-white/10 text-white'
                      : 'bg-white/95 border border-slate-200 text-slate-800 shadow-xl'
                  }`}
                >
                  Sign In
                </div>
              )}
            </div>
          )}

          {/* Theme Mode Toggle */}
          <div className="w-full relative group/theme">
            {isExpanded ? (
              <div
                className={`flex items-center justify-between p-1 rounded-2xl border ${
                  isDark
                    ? 'bg-zinc-900/80 border-white/10'
                    : 'bg-slate-100/90 border-slate-200/80'
                }`}
              >
                <button
                  onClick={() => (setThemeMode ? setThemeMode('light') : toggleTheme?.())}
                  className={`flex-1 py-1 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                    themeMode === 'light'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : isDark
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Light mode"
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => (setThemeMode ? setThemeMode('system') : toggleTheme?.())}
                  className={`flex-1 py-1 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                    themeMode === 'system'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isDark
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="System auto"
                >
                  <Monitor className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Auto</span>
                </button>
                <button
                  onClick={() => (setThemeMode ? setThemeMode('dark') : toggleTheme?.())}
                  className={`flex-1 py-1 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                    themeMode === 'dark'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isDark
                        ? 'text-zinc-400 hover:text-white'
                        : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Dark mode"
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Dark</span>
                </button>
              </div>
            ) : (
              <button
                onClick={cycleTheme}
                className={`w-full flex items-center justify-center p-2 rounded-full transition-all cursor-pointer ${
                  isDark
                    ? 'text-zinc-400 hover:text-white hover:bg-white/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                aria-label="Toggle Theme"
              >
                {themeMode === 'light' ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : themeMode === 'dark' ? (
                  <Moon className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Monitor className="w-5 h-5 text-indigo-500 dark:text-indigo-300" />
                )}
              </button>
            )}

            {!isExpanded && (
              <div
                className={`absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 backdrop-blur-md text-xs rounded-xl opacity-0 pointer-events-none group-hover/theme:opacity-100 transition-opacity whitespace-nowrap shadow-2xl z-50 capitalize ${
                  isDark
                    ? 'bg-zinc-950/95 border border-white/10 text-white'
                    : 'bg-white/95 border border-slate-200 text-slate-800 shadow-xl'
                }`}
              >
                Theme: {themeMode}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

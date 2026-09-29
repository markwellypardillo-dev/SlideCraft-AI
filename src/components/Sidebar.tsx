import React, { useState } from 'react';
import {
  FolderGit2,
  Image as ImageIcon,
  BarChart3,
  BookOpen,
  GraduationCap,
  Settings,
  Sun,
  Moon,
  Monitor,
  LogIn,
  LogOut,
  History,
  Cloud,
  X,
  ShieldCheck,
  Activity,
  Layers,
  LayoutTemplate,
} from 'lucide-react';
import { ActiveNavTab, SlideDeck, ThemeMode } from '../types/deck';
import { User as FirebaseUser } from 'firebase/auth';
import { PWAInstallButton } from './PWAInstallButton';

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
  wordCount,
  hasDeck,
  onOpenAccessibility,
  onOpenCompanion,
  currentUser,
  onOpenAuth,
  onSignOut,
  savedDecks = [],
  onSelectDeck,
  currentDeck,
  isMobileOpen = false,
  onCloseMobile,
  workspaceMode = 'studio',
  onToggleWorkspaceMode,
  isAdmin = false,
  onOpenWorkspaceSelector,
  onOpenTemplateArchitect,
}) => {

  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Expanded on desktop when hovered, or on mobile when drawer is open
  const isExpanded = isHovered || isMobileOpen;

  interface NavItem {
    id: ActiveNavTab;
    label: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  interface NavCategory {
    category: string;
    items: NavItem[];
  }

  const navCategories: NavCategory[] = [
    {
      category: 'Create & Design',
      items: [
        {
          id: 'generator' as ActiveNavTab,
          label: 'Deck Generator',
          subtitle: 'Upload & Architect',
          icon: FolderGit2,
          badge: hasDeck ? `${totalSlides} slides` : undefined,
        },
        ...(isAdmin
          ? [
              {
                id: 'template_architect' as any,
                label: 'Master Templates',
                subtitle: 'Canva & PPT Studio',
                icon: LayoutTemplate,
                badge: 'Admin',
              },
            ]
          : []),
        {
          id: 'visual_blueprint' as ActiveNavTab,
          label: 'Visual Prompts',
          subtitle: 'DALL-E & Midjourney',
          icon: ImageIcon,
          badge: hasDeck ? `${totalSlides}` : undefined,
        },
        {
          id: 'assessments' as ActiveNavTab,
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
          id: 'presenter_view' as ActiveNavTab,
          label: 'Practice Mode',
          subtitle: 'Teleprompter & Timer',
          icon: GraduationCap,
        },
        {
          id: 'export_settings' as ActiveNavTab,
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
          id: 'curriculum_library' as ActiveNavTab,
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
      if (onCloseMobile) {
        onCloseMobile();
      }
      return;
    }

    if (workspaceMode === 'admin' && onToggleWorkspaceMode) {
      onToggleWorkspaceMode('studio');
    }
    setActiveTab(tab as ActiveNavTab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (only on small screens when drawer is open) */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar (Desktop: hover rail / Mobile: slide-in drawer) */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 left-0 h-screen z-50 transition-all duration-300 ease-in-out flex flex-col justify-between ${
          isDark
            ? 'bg-zinc-950/95 text-zinc-100 backdrop-blur-xl shadow-soft-xl'
            : 'bg-white/95 text-zinc-900 backdrop-blur-xl shadow-soft-lg'
        } ${
          // Mobile visibility
          isMobileOpen
            ? 'translate-x-0 w-72 md:w-64'
            : '-translate-x-full md:translate-x-0'
        } ${
          // Desktop width (expands on hover)
          isHovered ? 'md:w-64 md:shadow-soft-2xl' : 'md:w-20'
        }`}
      >
        {/* Top: App Logo & Header */}
        <div className="flex flex-col">
          <div className="h-16 flex items-center justify-between px-4">
            <div className="flex items-center gap-3 w-full text-left">
              <div className={`relative w-10 h-10 rounded-2xl flex items-center justify-center shadow-soft-sm transition-transform duration-200 shrink-0 ${
                isAdmin
                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                  : isDark ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'
              }`}>
                {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <FolderGit2 className="w-5 h-5" />}
              </div>

              {isExpanded && (
                <div className="overflow-hidden whitespace-nowrap flex-1">
                  <span className={`font-display font-bold text-sm tracking-tight block ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    SlideCraft AI
                  </span>
                  <span className={`text-[11px] font-medium flex items-center gap-1 ${
                    isAdmin ? 'text-purple-400 font-bold' : isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    {isAdmin ? 'Admin Console' : 'Presentation Studio'}
                  </span>
                </div>
              )}

              {/* Close button on mobile */}
              {isMobileOpen && onCloseMobile && (
                <button
                  onClick={onCloseMobile}
                  className={`p-2 rounded-xl md:hidden cursor-pointer ${
                    isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Admin Workspace Mode Switcher Tile (if Admin user) */}
          {isAdmin && (
            <div className="px-2.5 pt-1 pb-2">
              <button
                onClick={() => {
                  if (onToggleWorkspaceMode) {
                    onToggleWorkspaceMode(workspaceMode === 'admin' ? 'studio' : 'admin');
                  }
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full p-2.5 rounded-2xl text-left transition-all duration-200 cursor-pointer shadow-soft-xs flex items-center gap-3 ${
                  workspaceMode === 'admin'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-soft-sm'
                    : isDark
                    ? 'bg-zinc-900 hover:bg-zinc-850 text-purple-300'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-900'
                }`}
                title="Switch Workspace Mode"
              >
                <Activity className="w-4 h-4 shrink-0" />
                {isExpanded && (
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-extrabold truncate">
                      {workspaceMode === 'admin' ? '🛡️ Admin Console Active' : '⚡ Open Admin Center'}
                    </div>
                    <div className="text-[10px] opacity-80 truncate">
                      {workspaceMode === 'admin' ? 'Telemetry & Logs' : 'Manage App & Users'}
                    </div>
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Categorized Navigation Items */}
          <div className="py-2 px-2.5 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] scrollbar-none">
            {navCategories.map((group, groupIdx) => (
              <div key={group.category} className="space-y-1">
                {/* Category Header (when expanded) or subtle separator (when collapsed) */}
                {isExpanded ? (
                  <div className="px-3 pt-1 pb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                      {group.category}
                    </span>
                  </div>
                ) : (
                  groupIdx > 0 && <div className="w-8 h-px bg-zinc-800/40 my-2 mx-auto" />
                )}

                {/* Items inside category */}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = workspaceMode === 'studio' && activeTab === item.id;

                  return (
                    <div key={item.id} className="relative group">
                      <button
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 text-left cursor-pointer ${
                          isActive
                            ? isDark
                              ? 'bg-zinc-900 text-white shadow-soft font-semibold'
                              : 'bg-zinc-100 text-zinc-950 shadow-soft font-semibold'
                            : isDark
                            ? 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                            : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />

                        {isExpanded && (
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold truncate">{item.label}</span>
                              {item.badge && (
                                <span className={`text-[11px] tabular-nums font-bold px-1.5 py-0.5 rounded-md ${
                                  isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </button>

                      {/* Tooltip for rail mode on desktop */}
                      {!isExpanded && (
                        <div className={`hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 text-xs font-medium rounded-xl shadow-soft-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 ${
                          isDark ? 'bg-zinc-900 text-white' : 'bg-zinc-900 text-white'
                        }`}>
                          {item.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Quick Recent History Strip (when expanded) */}
            {isExpanded && savedDecks.length > 1 && onSelectDeck && (
              <div className="pt-3 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 block">
                  Recent Executions
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-none">
                  {savedDecks.slice(0, 4).map((d, i) => {
                    const isCurrent = currentDeck?.title === d.title;
                    return (
                      <button
                        key={d.id || i}
                        onClick={() => {
                          if (workspaceMode === 'admin' && onToggleWorkspaceMode) {
                            onToggleWorkspaceMode('studio');
                          }
                          onSelectDeck(d);
                          setActiveTab('generator');
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs truncate transition-all cursor-pointer flex items-center justify-between ${
                          isCurrent
                            ? isDark ? 'bg-indigo-950/40 text-indigo-400 font-bold shadow-soft-xs' : 'bg-indigo-50 text-indigo-700 font-bold shadow-soft-xs'
                            : isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-900/60' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                        }`}
                        title={d.title}
                      >
                        <span className="truncate">{d.title}</span>
                        <span className="text-[10px] font-mono text-zinc-500 shrink-0 ml-1">
                          {d.slides?.length}s
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* In-App PWA Installation Tile */}
            {isExpanded && (
              <div className="pt-2">
                <PWAInstallButton variant="sidebar" isDark={isDark} />
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Teacher / Admin Account & Preferences */}
        <div className="p-3 space-y-2">
          {/* User Account Tile */}
          {currentUser ? (
            <div className="flex items-center justify-between">
              <div
                onClick={isAdmin && onOpenWorkspaceSelector ? onOpenWorkspaceSelector : undefined}
                className={`flex items-center gap-2 overflow-hidden ${isAdmin ? 'cursor-pointer group' : ''}`}
                title={isAdmin ? 'Click to open workspace selector' : ''}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-soft-xs text-white ${
                  isAdmin ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 ring-2 ring-purple-400/50' : 'bg-gradient-to-tr from-indigo-500 to-purple-500'
                }`}>
                  {currentUser.displayName ? currentUser.displayName[0].toUpperCase() : currentUser.email?.[0].toUpperCase() || 'T'}
                </div>

                {isExpanded && (
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold truncate flex items-center gap-1">
                      <span>{currentUser.displayName || currentUser.email?.split('@')[0]}</span>
                      {isAdmin && (
                        <span className="px-1 py-0.2 rounded text-[8px] font-extrabold uppercase bg-purple-500/20 text-purple-400">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                      <Cloud className="w-3 h-3" />
                      {isAdmin ? 'Admin Scope Active' : 'Cloud Synced'}
                    </div>
                  </div>
                )}
              </div>

              {isExpanded && (
                <button
                  onClick={onSignOut}
                  title="Sign out of account"
                  className={`p-1.5 rounded-lg text-zinc-400 hover:text-red-400 cursor-pointer transition-colors ${
                    isDark ? 'hover:bg-zinc-900' : 'hover:bg-zinc-100'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                if (onCloseMobile) onCloseMobile();
              }}
              title="Sign in to your account"
              className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold shadow-soft-xs transition-all cursor-pointer ${
                isDark
                  ? 'bg-zinc-900 hover:bg-zinc-850 text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900'
              }`}
            >
              <LogIn className="w-4 h-4 text-indigo-400 shrink-0" />
              {isExpanded && <span>Sign In</span>}
            </button>
          )}

          {/* Theme Selector: Light / System / Dark */}
          <div className="pt-1">
            {isExpanded ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Appearance
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-400 capitalize">
                    {themeMode}
                  </span>
                </div>
                <div className={`grid grid-cols-3 gap-1 p-1 rounded-2xl shadow-soft-xs ${
                  isDark ? 'bg-zinc-900/90' : 'bg-zinc-100'
                }`}>
                  <button
                    onClick={() => setThemeMode ? setThemeMode('light') : toggleTheme?.()}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      themeMode === 'light'
                        ? 'bg-white text-zinc-900 shadow-soft-xs'
                        : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                    title="Light Mode"
                  >
                    <Sun className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[11px]">Light</span>
                  </button>

                  <button
                    onClick={() => setThemeMode ? setThemeMode('system') : toggleTheme?.()}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      themeMode === 'system'
                        ? isDark ? 'bg-zinc-800 text-white shadow-soft-xs' : 'bg-white text-zinc-900 shadow-soft-xs'
                        : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                    title="System Default Mode"
                  >
                    <Monitor className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[11px]">Auto</span>
                  </button>

                  <button
                    onClick={() => setThemeMode ? setThemeMode('dark') : toggleTheme?.()}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      themeMode === 'dark'
                        ? isDark ? 'bg-zinc-800 text-white shadow-soft-xs' : 'bg-zinc-900 text-white shadow-soft-xs'
                        : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                    title="Dark Mode"
                  >
                    <Moon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[11px]">Dark</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (setThemeMode) {
                    const nextMode: ThemeMode = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
                    setThemeMode(nextMode);
                  } else {
                    toggleTheme?.();
                  }
                }}
                className={`w-full p-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center ${
                  isDark ? 'text-zinc-400 hover:text-white hover:bg-zinc-900' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                title={`Theme: ${themeMode.toUpperCase()} (Click to toggle)`}
              >
                {themeMode === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : themeMode === 'dark' ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Monitor className="w-4 h-4 text-purple-400" />
                )}
              </button>
            )}
          </div>

        </div>
      </aside>
    </>
  );
};

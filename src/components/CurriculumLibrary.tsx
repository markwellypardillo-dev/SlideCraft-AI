import React, { useState } from 'react';
import {
  ArrowRight,
  Trash2,
  FolderGit2,
  Cloud,
  RefreshCw,
  LogIn,
  Layers,
  BookOpen,
  Calendar,
  Clock,
  Search,
  Play,
  FileDown,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { SlideDeck } from '../types/deck';
import { SAMPLE_CURRICULA, SampleCurriculum } from '../data/sampleCurricula';
import { User as FirebaseUser } from 'firebase/auth';

interface CurriculumLibraryProps {
  currentDeck: SlideDeck | null;
  savedDecks: SlideDeck[];
  onSelectDeck: (deck: SlideDeck) => void;
  onDeleteDeck: (index: number) => void;
  onLoadSample: (sample: SampleCurriculum) => void;
  isDark: boolean;
  currentUser: FirebaseUser | null;
  onOpenAuth: () => void;
  onSyncCloudDecks?: () => void;
  isSyncing?: boolean;
}

export const CurriculumLibrary: React.FC<CurriculumLibraryProps> = ({
  currentDeck,
  savedDecks,
  onSelectDeck,
  onDeleteDeck,
  onLoadSample,
  isDark,
  currentUser,
  onOpenAuth,
  onSyncCloudDecks,
  isSyncing = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'saved' | 'templates'>('saved');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('all');

  // Format date nicely
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(date);
    } catch {
      return 'Recently';
    }
  };

  // Get unique subjects
  const subjects = Array.from(new Set(savedDecks.map((d) => d.subject).filter(Boolean)));

  // Filtered saved decks
  const filteredSavedDecks = savedDecks.filter((deck) => {
    const matchesSearch =
      searchQuery === '' ||
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deck.targetAudience && deck.targetAudience.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject = filterSubject === 'all' || deck.subject === filterSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Action Toolbar */}
      <div className={`p-4 rounded-3xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDark ? 'bg-zinc-900/80 shadow-soft-sm' : 'bg-white shadow-soft-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl flex items-center justify-center ${
            isDark ? 'bg-indigo-950/60 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
          }`}>
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-display text-lg sm:text-xl font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-zinc-900'
              }`}>
                Executed History & Presets
              </h2>
              {currentUser ? (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isDark ? 'bg-emerald-950/60 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    <Cloud className="w-3 h-3" />
                    Cloud Synced
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isDark ? 'bg-purple-950/60 text-purple-300' : 'bg-purple-50 text-purple-700'
                  }`}>
                    🔒 Private Account History
                  </span>
                </div>
              ) : (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-600'
                }`}>
                  Guest Session
                </span>
              )}
            </div>
            <p className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {currentUser ? `Isolated to: ${currentUser.displayName || currentUser.email} (other users cannot view this)` : 'Browse your past lesson executions or load starter decks'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {currentUser && onSyncCloudDecks && (
            <button
              onClick={onSyncCloudDecks}
              disabled={isSyncing}
              title="Refresh and sync cloud decks"
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-soft-xs transition-all cursor-pointer ${
                isDark
                  ? 'bg-zinc-850 text-zinc-300 hover:text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:text-zinc-900'
              } disabled:opacity-50`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          )}

          <div className={`p-1 rounded-2xl shadow-soft-xs flex items-center shrink-0 ${
            isDark ? 'bg-zinc-950' : 'bg-zinc-100'
          }`}>
            <button
              onClick={() => setActiveSubTab('saved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'saved'
                  ? isDark ? 'bg-zinc-850 text-white shadow-soft-xs' : 'bg-white text-zinc-900 shadow-soft-xs'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              History ({savedDecks.length})
            </button>
            <button
              onClick={() => setActiveSubTab('templates')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === 'templates'
                  ? isDark ? 'bg-zinc-850 text-white shadow-soft-xs' : 'bg-white text-zinc-900 shadow-soft-xs'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Presets ({SAMPLE_CURRICULA.length})
            </button>
          </div>
        </div>
      </div>

      {/* Teacher Authentication Callout (when logged out) */}
      {!currentUser && (
        <div className={`p-6 rounded-3xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft-md ${
          isDark ? 'bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-zinc-950 text-zinc-200' : 'bg-gradient-to-r from-indigo-50 via-white to-zinc-50 text-zinc-800'
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-indigo-400" />
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Sign In to Save & Restore All Executed Documents
              </h4>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Every time you log in, your full past document execution history, slides, speaker notes, and AI visual prompts will automatically restore.
            </p>
          </div>

          <button
            onClick={onOpenAuth}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-soft transition-all ${
              isDark
                ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                : 'bg-zinc-900 text-white hover:bg-zinc-800'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Create Account</span>
          </button>
        </div>
      )}

      {/* EXECUTED DOCUMENTS & HISTORY VIEW */}
      {activeSubTab === 'saved' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          {savedDecks.length > 0 && (
            <div className={`p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 ${
              isDark ? 'bg-zinc-950/70 shadow-soft-xs' : 'bg-white shadow-soft-xs'
            }`}>
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search past executed decks..."
                  className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs shadow-soft-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                    isDark ? 'bg-zinc-900 text-white placeholder-zinc-500' : 'bg-zinc-50 text-zinc-900 placeholder-zinc-400'
                  }`}
                />
              </div>

              {subjects.length > 1 && (
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto scrollbar-none">
                  <span className="text-[11px] text-zinc-400 font-semibold ml-1">Subject:</span>
                  <button
                    onClick={() => setFilterSubject('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      filterSubject === 'all'
                        ? isDark ? 'bg-zinc-800 text-white shadow-soft-xs' : 'bg-zinc-200 text-zinc-900 shadow-soft-xs'
                        : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    All
                  </button>
                  {subjects.map((subj) => (
                    <button
                      key={subj}
                      onClick={() => setFilterSubject(subj)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                        filterSubject === subj
                          ? isDark ? 'bg-zinc-800 text-white shadow-soft-xs' : 'bg-zinc-200 text-zinc-900 shadow-soft-xs'
                          : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {savedDecks.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl space-y-3 ${
              isDark ? 'bg-zinc-950/40 shadow-soft-sm' : 'bg-zinc-50 shadow-soft-sm'
            }`}>
              <FolderGit2 className={`w-8 h-8 mx-auto ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`} />
              <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {currentUser ? `No Past Decks for ${currentUser.displayName || currentUser.email}` : 'No Executed Documents in History Yet'}
              </h4>
              <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {currentUser
                  ? 'Your personal workspace is empty and isolated. Any presentation you generate will only be saved to your account and cannot be viewed by other users.'
                  : 'Upload lesson notes, syllabi, or audio lectures in the Deck Generator tab to execute your first presentation.'}
              </p>
            </div>
          ) : filteredSavedDecks.length === 0 ? (
            <div className={`p-8 text-center rounded-2xl ${
              isDark ? 'bg-zinc-900/40 shadow-soft-xs text-zinc-400' : 'bg-zinc-50 shadow-soft-xs text-zinc-600'
            }`}>
              No executed presentations match "{searchQuery}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredSavedDecks.map((deckItem) => {
                const originalIndex = savedDecks.findIndex((d) => d.id === deckItem.id || d.title === deckItem.title);
                const isCurrent = currentDeck?.title === deckItem.title;
                const isCloudSaved = Boolean(deckItem.userId || deckItem.id?.startsWith('deck_'));
                const dateLabel = formatDate(deckItem.updatedAt || deckItem.createdAt);

                return (
                  <div
                    key={deckItem.id || originalIndex}
                    className={`p-6 rounded-3xl flex flex-col justify-between space-y-4 transition-all ${
                      isCurrent
                        ? isDark
                          ? 'bg-zinc-850 shadow-soft-lg'
                          : 'bg-white shadow-soft-lg'
                        : isDark
                        ? 'bg-zinc-900/80 hover:bg-zinc-850 shadow-soft-sm'
                        : 'bg-white hover:bg-zinc-50/90 shadow-soft-sm'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Top Meta */}
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-500 text-[11px]">
                            {deckItem.subject}
                          </span>
                          {isCloudSaved && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold">
                                <Cloud className="w-3 h-3" />
                                Cloud Saved
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <Calendar className="w-3 h-3 text-zinc-400" />
                          <span>{dateLabel}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className={`font-display text-base sm:text-lg font-bold line-clamp-1 ${
                        isDark ? 'text-white' : 'text-zinc-900'
                      }`}>
                        {deckItem.title}
                      </h3>

                      {/* Pedagogy / Source Overview */}
                      <p className={`text-xs line-clamp-2 leading-relaxed ${
                        isDark ? 'text-zinc-400' : 'text-zinc-600'
                      }`}>
                        {deckItem.pedagogyNotes || deckItem.slides[0]?.headline || 'Structured instructional presentation with dual-coding visual prompts.'}
                      </p>

                      {/* Slide Mini Badge Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-soft-xs ${
                          isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'
                        }`}>
                          {deckItem.slides.length} Slides
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-soft-xs ${
                          isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'
                        }`}>
                          ~{deckItem.totalEstimatedMinutes} min
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-soft-xs ${
                          isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'
                        }`}>
                          {deckItem.targetAudience}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="flex items-center justify-between pt-3 text-xs">
                      {isCurrent ? (
                        <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active Deck
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-500 font-medium">Ready to review</span>
                      )}

                      <div className="flex items-center gap-2">
                        {savedDecks.length > 1 && (
                          <button
                            onClick={() => onDeleteDeck(originalIndex)}
                            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                              isDark ? 'text-zinc-500 hover:text-red-400' : 'text-zinc-400 hover:text-red-600'
                            }`}
                            title="Delete presentation from history"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onSelectDeck(deckItem)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-soft-xs cursor-pointer transition-all ${
                            isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                          }`}
                        >
                          <span>{isCurrent ? 'Continue' : 'Open Deck'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SAMPLE CURRICULUM BLUEPRINTS */}
      {activeSubTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SAMPLE_CURRICULA.map((sample) => (
            <div
              key={sample.id}
              className={`p-6 rounded-3xl flex flex-col justify-between space-y-4 transition-all hover:scale-[1.005] ${
                isDark ? 'bg-zinc-900/80 hover:bg-zinc-850 shadow-soft-sm' : 'bg-white hover:bg-zinc-50/90 shadow-soft-sm'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="font-semibold text-indigo-500 text-[11px]">
                    {sample.subject}
                  </span>
                  <span className="text-[11px]">
                    {sample.audience}
                  </span>
                </div>

                <h3 className={`font-display text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                  {sample.title}
                </h3>
                <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {sample.summary}
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => onLoadSample(sample)}
                  className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-soft-xs cursor-pointer ${
                    isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }`}
                >
                  <span>Load Preset Deck</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

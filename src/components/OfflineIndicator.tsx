import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2, HardDrive, ChevronUp, ChevronDown } from 'lucide-react';
import { getOfflineCacheStats } from '../utils/offlineCacheStorage';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [cacheStats, setCacheStats] = useState<{ isCached: boolean; deckCount: number; estimatedStorageKb: number }>({
    isCached: true,
    deckCount: 0,
    estimatedStorageKb: 0,
  });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    getOfflineCacheStats().then(setCacheStats);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm w-auto z-[9999] transition-all duration-300">
      <div className="p-3.5 sm:p-4 rounded-3xl bg-zinc-950/95 text-white shadow-soft-2xl ring-1 ring-amber-500/30 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <WifiOff className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 truncate">
                <span>Offline Mode Active</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 shrink-0">
                  Cached
                </span>
              </h4>
              <p className="text-[11px] text-zinc-400 truncate">
                Internet lost, but app remains active offline!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer shrink-0"
            title="Toggle offline details"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-2 text-[11px] text-zinc-300">
            <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/80">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                <span>Offline Decks:</span>
              </span>
              <span className="font-bold font-mono text-emerald-400">{cacheStats.deckCount} saved</span>
            </div>

            <div className="space-y-1 pl-1 text-[10px] text-zinc-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Full Presentation & Practice Mode available offline</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Edit slide text, headlines & notes offline</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

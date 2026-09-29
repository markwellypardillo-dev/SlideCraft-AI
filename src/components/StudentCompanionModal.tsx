import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Volume2,
  Play,
  Pause,
  Printer,
  Copy,
  Check,
} from 'lucide-react';
import { SlideDeck } from '../types/deck';
import { fetchAudioSnapshotAPI } from '../services/deckService';

interface StudentCompanionModalProps {
  deck: SlideDeck;
  onClose: () => void;
  isDark: boolean;
}

export const StudentCompanionModal: React.FC<StudentCompanionModalProps> = ({
  deck,
  onClose,
  isDark,
}) => {
  const [activeTab, setActiveTab] = useState<'cornell' | 'flashcards' | 'audio'>('cornell');
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [audioScript, setAudioScript] = useState<string>('');
  const [isLoadingAudioScript, setIsLoadingAudioScript] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const flashcards = deck.slides.map((s, idx) => {
    if (s.assessment) {
      return {
        id: idx,
        question: s.assessment.question,
        answer: s.assessment.correctAnswer || s.headline,
        source: `Slide ${s.slideNumber}`,
        explanation: s.assessment.explanation,
      };
    }
    return {
      id: idx,
      question: `Core takeaway for ${s.title}?`,
      answer: s.headline,
      source: `Slide ${s.slideNumber}`,
      explanation: s.bullets[0] ? s.bullets[0].replace(/\*\*/g, '') : '',
    };
  });

  const loadAudioScript = async () => {
    if (audioScript) return;
    setIsLoadingAudioScript(true);
    try {
      const script = await fetchAudioSnapshotAPI(deck);
      setAudioScript(script);
    } catch (err) {
      console.error(err);
      setAudioScript(`Audio study review for "${deck.title}". Primary takeaway: ${deck.slides[0]?.headline || 'core concepts guide our learning'}. Review key terms and practice active recall!`);
    } finally {
      setIsLoadingAudioScript(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audio' && !audioScript) {
      loadAudioScript();
    }
  }, [activeTab]);

  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToSpeak = audioScript || `Review for ${deck.title}. ${deck.pedagogyNotes}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = speechRate;
      utterance.pitch = 1.0;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentCard = flashcards[activeCardIndex] || flashcards[0];

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-3xl max-h-[88vh] rounded-3xl shadow-soft-lg flex flex-col overflow-hidden transition-all ${
        isDark ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-900'
      }`}>
        {/* Header with soft shadow */}
        <div className={`p-5 flex items-center justify-between shadow-soft-xs ${
          isDark ? 'bg-zinc-900/60' : 'bg-zinc-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-soft-xs ${
              isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-800'
            }`}>
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Student Study Companion
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Cornell Notes, flashcards, and audio review
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              isDark ? 'bg-zinc-900 text-zinc-400 hover:text-white' : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher Segmented Bar */}
        <div className="px-6 pt-3 pb-1">
          <div className={`inline-flex p-1 rounded-2xl shadow-soft-xs ${
            isDark ? 'bg-zinc-900/80' : 'bg-zinc-100/80'
          }`}>
            <button
              onClick={() => setActiveTab('cornell')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'cornell'
                  ? isDark ? 'bg-zinc-800 text-white shadow-soft-sm' : 'bg-white text-zinc-900 shadow-soft-sm'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Cornell Notes
            </button>

            <button
              onClick={() => setActiveTab('flashcards')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'flashcards'
                  ? isDark ? 'bg-zinc-800 text-white shadow-soft-sm' : 'bg-white text-zinc-900 shadow-soft-sm'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Flashcards ({flashcards.length})
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'audio'
                  ? isDark ? 'bg-zinc-800 text-white shadow-soft-sm' : 'bg-white text-zinc-900 shadow-soft-sm'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Audio Snapshot
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
          {/* 1. CORNELL NOTES */}
          {activeTab === 'cornell' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => window.print()}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-soft-xs transition-all cursor-pointer ${
                    isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                {deck.slides.map((s) => (
                  <div key={s.id} className={`rounded-2xl overflow-hidden shadow-soft-xs grid grid-cols-1 md:grid-cols-12 ${
                    isDark ? 'bg-zinc-900/60' : 'bg-white'
                  }`}>
                    <div className={`md:col-span-4 p-3.5 ${
                      isDark ? 'bg-zinc-950/70' : 'bg-zinc-50'
                    }`}>
                      <span className={`font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>Slide {s.slideNumber}</span>
                      <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>{s.title}</p>
                    </div>

                    <div className="md:col-span-8 p-3.5 space-y-1">
                      <div className={`font-bold text-xs ${isDark ? 'text-white' : 'text-zinc-900'}`}>{s.headline}</div>
                      <ul className={`space-y-0.5 text-[11px] ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        {s.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="list-disc list-inside">
                            <span dangerouslySetInnerHTML={{ __html: b.replace(/\*\*(.*?)\*\*/g, `<strong class="${isDark ? 'text-white font-medium' : 'text-zinc-900 font-medium'}">$1</strong>`) }} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. FLASHCARDS */}
          {activeTab === 'flashcards' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-4 max-w-lg mx-auto">
              <span className={`text-[11px] font-semibold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                Card {activeCardIndex + 1} of {flashcards.length}
              </span>

              <div
                onClick={() => setIsCardFlipped(!isCardFlipped)}
                className={`w-full h-56 rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 shadow-soft-md select-none ${
                  isDark ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-900'
                }`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {isCardFlipped ? 'Answer' : 'Question'}
                </div>

                <div className="text-center space-y-1.5">
                  <p className={`text-base font-bold leading-relaxed ${
                    isDark ? 'text-white' : 'text-zinc-900'
                  }`}>
                    {isCardFlipped ? currentCard.answer : currentCard.question}
                  </p>
                  {isCardFlipped && currentCard.explanation && (
                    <p className={`text-xs pt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {currentCard.explanation}
                    </p>
                  )}
                </div>

                <div className={`text-center text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {isCardFlipped ? 'Tap to flip back' : 'Tap to reveal answer'}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsCardFlipped(false);
                    setActiveCardIndex((prev) => Math.max(0, prev - 1));
                  }}
                  disabled={activeCardIndex === 0}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold disabled:opacity-30 shadow-soft-xs transition-all cursor-pointer ${
                    isDark ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  Prev
                </button>

                <button
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs shadow-soft-xs cursor-pointer ${
                    isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }`}
                >
                  Flip
                </button>

                <button
                  onClick={() => {
                    setIsCardFlipped(false);
                    setActiveCardIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
                  }}
                  disabled={activeCardIndex === flashcards.length - 1}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold disabled:opacity-30 shadow-soft-xs transition-all cursor-pointer ${
                    isDark ? 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* 3. AUDIO */}
          {activeTab === 'audio' && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className={`p-5 rounded-3xl shadow-soft-sm space-y-3 transition-all ${
                isDark ? 'bg-zinc-900/70' : 'bg-zinc-100/70'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    <Volume2 className="w-4 h-4 text-zinc-500" /> Auditory Summary
                  </span>

                  <button
                    onClick={handleToggleSpeak}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-soft-xs cursor-pointer ${
                      isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                    }`}
                  >
                    {isSpeaking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isSpeaking ? 'Pause' : 'Play Audio'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className={`text-[11px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Speed:</span>
                  {[1.0, 1.2, 1.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setSpeechRate(rate)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        speechRate === rate
                          ? isDark ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'
                          : isDark ? 'bg-zinc-950 text-zinc-400' : 'bg-white text-zinc-600 shadow-soft-xs'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-5 rounded-3xl shadow-soft-xs space-y-2 transition-all ${
                isDark ? 'bg-zinc-950' : 'bg-zinc-50'
              }`}>
                <div className={`flex items-center justify-between text-xs font-bold ${
                  isDark ? 'text-zinc-400' : 'text-zinc-600'
                }`}>
                  <span>Script:</span>
                  <button
                    onClick={() => handleCopy(audioScript, 'audio-script')}
                    className={`hover:underline text-[11px] cursor-pointer font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
                  >
                    {copiedKey === 'audio-script' ? 'Copied' : 'Copy Script'}
                  </button>
                </div>

                {isLoadingAudioScript ? (
                  <div className={`py-6 text-center text-xs animate-pulse ${
                    isDark ? 'text-zinc-500' : 'text-zinc-400'
                  }`}>
                    Synthesizing audio script...
                  </div>
                ) : (
                  <p className={`text-xs leading-relaxed whitespace-pre-line font-sans ${
                    isDark ? 'text-zinc-300' : 'text-zinc-800'
                  }`}>
                    {audioScript}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

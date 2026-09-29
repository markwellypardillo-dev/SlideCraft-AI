import React, { useState } from 'react';
import {
  BarChart3,
  FileDown,
  CheckCircle2,
  HelpCircle,
  Check,
  Award,
} from 'lucide-react';
import { SlideDeck } from '../types/deck';
import { exportQuizzesToCSV } from '../services/exportService';

interface AssessmentsHubProps {
  deck: SlideDeck;
  isDark: boolean;
}

export const AssessmentsHub: React.FC<AssessmentsHubProps> = ({ deck, isDark }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showAnswerFor, setShowAnswerFor] = useState<Record<number, boolean>>({});

  const assessmentsWithSlides = deck.slides
    .map((slide, index) => ({ slide, assessment: slide.assessment, index }))
    .filter((item) => item.assessment && item.assessment.question);

  const handleSelectOption = (slideIndex: number, option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [slideIndex]: option }));
  };

  const toggleShowAnswer = (slideIndex: number) => {
    setShowAnswerFor((prev) => ({ ...prev, [slideIndex]: !prev[slideIndex] }));
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = assessmentsWithSlides.filter(
    ({ assessment, index }) => assessment && selectedAnswers[index] === assessment.correctAnswer
  ).length;

  return (
    <div className="space-y-4 pb-20">
      {/* Action Toolbar */}
      <div className={`p-4 rounded-3xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDark ? 'bg-zinc-900/80 shadow-soft-sm' : 'bg-white shadow-soft'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl flex items-center justify-center ${
            isDark ? 'bg-indigo-950/60 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
          }`}>
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`font-display text-lg sm:text-xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-zinc-900'
            }`}>
              Formative Assessments ({assessmentsWithSlides.length})
            </h2>
            <p className={`text-[11px] font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Quizzes, checks-for-understanding & exit tickets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {answeredCount > 0 && (
            <div className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold shadow-soft-xs ${
              isDark ? 'bg-zinc-950 text-zinc-300' : 'bg-zinc-100 text-zinc-800'
            }`}>
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>{correctCount} / {assessmentsWithSlides.length} Correct</span>
            </div>
          )}

          <button
            onClick={() => exportQuizzesToCSV(deck)}
            className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 shadow-soft transition-all cursor-pointer ${
              isDark
                ? 'bg-white text-zinc-950 hover:bg-zinc-200'
                : 'bg-zinc-900 text-white hover:bg-zinc-800'
            }`}
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Kahoot CSV</span>
          </button>
        </div>
      </div>

      {/* Assessment Question Cards */}
      <div className="space-y-5">
        {assessmentsWithSlides.map(({ slide, assessment, index }) => {
          if (!assessment) return null;
          const userSelected = selectedAnswers[index];
          const isAnswerRevealed = showAnswerFor[index];
          const isCorrect = userSelected && userSelected === assessment.correctAnswer;

          return (
            <div
              key={slide.id}
              className={`p-6 sm:p-7 rounded-3xl space-y-4 transition-all ${
                isDark ? 'bg-zinc-900/60 shadow-soft-md' : 'bg-white shadow-soft'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-indigo-500">Slide {slide.slideNumber}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-zinc-400">{slide.title}</span>
                </div>

                <span className="font-medium">
                  {assessment.type === 'multiple_choice' ? 'Formative Quiz' : 'Discussion Question'}
                </span>
              </div>

              <h3 className={`font-display text-base sm:text-lg font-bold leading-relaxed ${
                isDark ? 'text-white' : 'text-zinc-900'
              }`}>
                {assessment.question}
              </h3>

              {/* Options */}
              {assessment.options && assessment.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {assessment.options.map((option, optIdx) => {
                    const isThisOptionSelected = userSelected === option;
                    const isThisCorrectAnswer = option === assessment.correctAnswer;

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(index, option)}
                        className={`p-3.5 rounded-2xl text-left text-xs font-medium flex items-center gap-3 transition-all cursor-pointer ${
                          isAnswerRevealed
                            ? isThisCorrectAnswer
                              ? isDark ? 'bg-zinc-850 text-white font-semibold shadow-soft-sm' : 'bg-zinc-100 text-zinc-950 font-semibold shadow-soft-sm'
                              : isThisOptionSelected
                              ? isDark ? 'bg-zinc-950/40 text-zinc-500 line-through' : 'bg-zinc-50 text-zinc-400 line-through'
                              : isDark ? 'bg-zinc-950/40 text-zinc-500' : 'bg-zinc-50 text-zinc-400'
                            : isThisOptionSelected
                            ? isDark ? 'bg-zinc-850 text-white font-semibold shadow-soft-sm' : 'bg-zinc-200 text-zinc-950 font-semibold shadow-soft-sm'
                            : isDark ? 'bg-zinc-950/80 hover:bg-zinc-950 text-zinc-300 shadow-soft-xs' : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-800 shadow-soft-xs'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isAnswerRevealed && isThisCorrectAnswer
                            ? isDark ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'
                            : isThisOptionSelected
                            ? isDark ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'
                            : isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-700'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 leading-relaxed">{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Reveal Controls */}
              <div className="pt-1 flex items-center justify-between text-xs">
                <button
                  onClick={() => toggleShowAnswer(index)}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{isAnswerRevealed ? 'Hide Explanation' : 'Reveal Answer & Pedagogical Rationale'}</span>
                </button>
              </div>

              {/* Answer Key & Explanation */}
              {isAnswerRevealed && (
                <div className={`p-4 rounded-2xl shadow-soft-xs text-xs space-y-1.5 ${
                  isDark ? 'bg-zinc-950 text-zinc-300' : 'bg-zinc-50 text-zinc-800'
                }`}>
                  {assessment.correctAnswer && (
                    <div className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Answer: {assessment.correctAnswer}</span>
                    </div>
                  )}
                  <p className={`text-[11px] leading-relaxed ${
                    isDark ? 'text-zinc-400' : 'text-zinc-600'
                  }`}>
                    {assessment.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  FileText,
  CheckCircle2,
  Sliders,
  Download,
  Printer,
  Copy,
  Check,
  Users,
  Languages,
  Calendar,
  Clock,
  Briefcase,
  Layers,
  ChevronRight,
  RefreshCw,
  Award,
  HelpCircle,
  FileSpreadsheet,
  AlertCircle,
  Send,
  Plus,
} from 'lucide-react';
import {
  SlideDeck,
  LessonPlanData,
  LessonPlanFramework,
  RubricData,
  DifferentiationData,
  SubPlanData,
} from '../types/deck';
import {
  createDefaultLessonPlan,
  createDefaultRubric,
  createDefaultDifferentiation,
  createDefaultSubPlan,
  generateAILessonPlan,
  generateAIRubric,
  generateAIDifferentiation,
  generateAISubPlan,
  downloadTextFile,
  exportRubricToCSV,
} from '../services/educatorToolkitService';

interface EducatorToolkitHubProps {
  deck: SlideDeck | null;
  isDark: boolean;
  onOpenDeckGenerator?: () => void;
}

type ToolkitTab = 'lesson_plan' | 'rubric' | 'differentiation' | 'sub_plan';

export const EducatorToolkitHub: React.FC<EducatorToolkitHubProps> = ({
  deck,
  isDark,
  onOpenDeckGenerator,
}) => {
  const [activeTab, setActiveTab] = useState<ToolkitTab>('lesson_plan');

  // Input states
  const [topic, setTopic] = useState<string>(deck?.title || 'Cellular Respiration & Energy Transformation');
  const [subject, setSubject] = useState<string>(deck?.subject || 'Biology & Life Sciences');
  const [gradeLevel, setGradeLevel] = useState<string>(deck?.gradeLevel || 'Senior High School (Grades 11-12)');
  const [framework, setFramework] = useState<LessonPlanFramework>('5E Model');
  const [rubricType, setRubricType] = useState<RubricData['assessmentType']>('Oral Presentation');
  const [teacherName, setTeacherName] = useState<string>('Mr. Mark Welly');
  const [roomNumber, setRoomNumber] = useState<string>('Room 204 (Science Wing)');

  // Tool data states
  const [lessonPlan, setLessonPlan] = useState<LessonPlanData>(() =>
    createDefaultLessonPlan(topic, subject, gradeLevel, framework, deck)
  );
  const [rubric, setRubric] = useState<RubricData>(() =>
    createDefaultRubric(topic, rubricType, gradeLevel, deck)
  );
  const [differentiation, setDifferentiation] = useState<DifferentiationData>(() =>
    createDefaultDifferentiation(topic, gradeLevel, deck)
  );
  const [subPlan, setSubPlan] = useState<SubPlanData>(() =>
    createDefaultSubPlan(topic, teacherName, undefined, roomNumber, deck)
  );

  // Live Rubric Scoring Mode State (Student Grading)
  const [selectedScores, setSelectedScores] = useState<Record<string, number>>({
    'crit-1': 4,
    'crit-2': 3,
    'crit-3': 4,
    'crit-4': 3,
  });
  const [studentNameInput, setStudentNameInput] = useState<string>('Student Presentation Team A');

  // UI status states
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync with active deck if available
  useEffect(() => {
    if (deck) {
      if (deck.title) setTopic(deck.title);
      if (deck.subject) setSubject(deck.subject);
      if (deck.gradeLevel) setGradeLevel(deck.gradeLevel);
    }
  }, [deck]);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Generation Handlers
  const handleGenerateCurrentTool = async () => {
    setIsGenerating(true);
    try {
      if (activeTab === 'lesson_plan') {
        const result = await generateAILessonPlan(topic, subject, gradeLevel, framework, deck);
        setLessonPlan(result);
      } else if (activeTab === 'rubric') {
        const result = await generateAIRubric(topic, rubricType, gradeLevel, deck);
        setRubric(result);
        const initScores: Record<string, number> = {};
        result.criteria.forEach((c) => {
          initScores[c.id] = 3;
        });
        setSelectedScores(initScores);
      } else if (activeTab === 'differentiation') {
        const result = await generateAIDifferentiation(topic, gradeLevel, deck);
        setDifferentiation(result);
      } else if (activeTab === 'sub_plan') {
        const result = await generateAISubPlan(topic, teacherName, roomNumber, deck);
        setSubPlan(result);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Live Rubric Scoring Calculations
  const calculateTotalScore = () => {
    let earned = 0;
    rubric.criteria.forEach((c) => {
      earned += selectedScores[c.id] || 0;
    });
    const max = rubric.criteria.length * 4;
    const percentage = Math.round((earned / max) * 100);
    const letterGrade =
      percentage >= 93 ? 'A' : percentage >= 90 ? 'A-' : percentage >= 87 ? 'B+' : percentage >= 83 ? 'B' : percentage >= 75 ? 'C' : 'Needs Revision';
    return { earned, max, percentage, letterGrade };
  };

  const constructLiveStudentFeedback = () => {
    const { earned, max, percentage, letterGrade } = calculateTotalScore();
    const comments: string[] = [];

    rubric.criteria.forEach((c) => {
      const score = selectedScores[c.id];
      const level = c.levels.find((l) => l.score === score);
      if (level) {
        if (score === 4) {
          comments.push(`Mastery in ${c.category}: ${level.descriptor}`);
        } else if (score === 3) {
          comments.push(`Solid work in ${c.category}: Meets grade-level expectations.`);
        } else {
          comments.push(`Growth focus in ${c.category}: ${level.descriptor}`);
        }
      }
    });

    return `Feedback for ${studentNameInput}:\nScore: ${earned} / ${max} (${percentage}% - Grade ${letterGrade})\n\nHighlights & Observations:\n• ${comments.join('\n• ')}\n\nNext Steps: Continue backing claims with verified experimental data and strengthen vocal delivery projection.`;
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in-up">
      {/* Top Header Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-soft-md backdrop-blur-2xl transition-all ${
          isDark
            ? 'bg-zinc-900/70 border-white/10 text-white'
            : 'bg-white/95 border-slate-200/90 text-slate-900'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-soft-sm shrink-0">
              <BookOpenCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight">
                  Educator Toolkit
                </h1>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-soft-xs ${
                  isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  4 Teacher Tools
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                Classroom-ready Lesson Plans, Analytic Rubrics with Live Scoring, IEP/ELL Accommodations &amp; Emergency Sub Plans.
              </p>
            </div>
          </div>

          {/* Active Presentation Deck Sync Pill */}
          {deck ? (
            <div
              className={`px-3.5 py-2 rounded-2xl border flex items-center gap-2.5 text-xs shadow-soft-xs ${
                isDark
                  ? 'bg-zinc-950/80 border-white/10 text-zinc-200'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-500 shrink-0" />
              <div className="truncate max-w-[220px]">
                <span className="font-bold block truncate">{deck.title}</span>
                <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {deck.slides.length} Slides • Synced with Active Deck
                </span>
              </div>
            </div>
          ) : (
            onOpenDeckGenerator && (
              <button
                onClick={onOpenDeckGenerator}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-soft-xs ${
                  isDark
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-white/10'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                <span>Link Presentation Deck</span>
              </button>
            )
          )}
        </div>

        {/* Global Topic & Grade Level Config Bar */}
        <div
          className={`mt-6 pt-5 border-t grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs ${
            isDark ? 'border-zinc-800/80' : 'border-slate-200/80'
          }`}
        >
          <div>
            <label className={`block font-bold text-[11px] mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              Curricular Topic &amp; Unit
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Cellular Respiration, Civil Rights, Calculus Limits"
              className={`w-full px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600'
              }`}
            />
          </div>

          <div>
            <label className={`block font-bold text-[11px] mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              Academic Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Biology, US History, Algebra II"
              className={`w-full px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600'
              }`}
            />
          </div>

          <div>
            <label className={`block font-bold text-[11px] mb-1.5 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              Target Grade Level
            </label>
            <input
              type="text"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              placeholder="e.g. Senior High School (Grades 11-12)"
              className={`w-full px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-zinc-950 border-zinc-800 text-white focus:border-indigo-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600'
              }`}
            />
          </div>
        </div>

        {/* 4 Tool Segmented Navigation Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('lesson_plan')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-soft-xs ${
              activeTab === 'lesson_plan'
                ? 'bg-indigo-600 text-white'
                : isDark
                ? 'bg-zinc-800/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>AI Lesson Plan Architect</span>
          </button>

          <button
            onClick={() => setActiveTab('rubric')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-soft-xs ${
              activeTab === 'rubric'
                ? 'bg-indigo-600 text-white'
                : isDark
                ? 'bg-zinc-800/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Smart Rubric Matrix &amp; Live Grading</span>
          </button>

          <button
            onClick={() => setActiveTab('differentiation')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-soft-xs ${
              activeTab === 'differentiation'
                ? 'bg-indigo-600 text-white'
                : isDark
                ? 'bg-zinc-800/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Differentiated Learning &amp; IEP/ELL</span>
          </button>

          <button
            onClick={() => setActiveTab('sub_plan')}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-soft-xs ${
              activeTab === 'sub_plan'
                ? 'bg-indigo-600 text-white'
                : isDark
                ? 'bg-zinc-800/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>1-Click Emergency Sub Pack</span>
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleGenerateCurrentTool}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-soft-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing...' : 'Regenerate with Gemini'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TOOL 1: AI LESSON PLAN ARCHITECT */}
      {/* ========================================================================= */}
      {activeTab === 'lesson_plan' && (
        <div className="space-y-4">
          {/* Framework Switcher & Actions */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-soft-xs ${
              isDark ? 'bg-zinc-900/60 border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Pedagogical Model:</span>
              <div className="flex items-center gap-1.5">
                {(['5E Model', 'UbD (Backward Design)', 'Direct Instruction (Hunter)'] as LessonPlanFramework[]).map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => setFramework(f)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer shadow-soft-xs ${
                        framework === f
                          ? 'bg-indigo-600 text-white'
                          : isDark
                          ? 'bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/60'
                          : 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer shadow-soft-xs ${
                  isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
                title="Print Lesson Plan"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                onClick={() => {
                  const content = `# ${lessonPlan.title}\nSubject: ${lessonPlan.subject} | Grade: ${lessonPlan.gradeLevel}\nFramework: ${lessonPlan.framework} | Duration: ${lessonPlan.durationMinutes} mins\n\nStandards: ${lessonPlan.standards}\nEssential Question: ${lessonPlan.essentialQuestion}\n\nObjectives (SWBAT):\n${lessonPlan.objectives.map((o) => `• ${o}`).join('\n')}\n\nMaterials:\n${lessonPlan.materials.map((m) => `• ${m}`).join('\n')}\n\nTIMED LESSON AGENDA:\n${lessonPlan.agenda.map((a) => `### ${a.phase} (${a.time})\nTeacher Action: ${a.teacherAction}\nStudent Action: ${a.studentAction}\nTip: ${a.pedagogicalTip || 'N/A'}`).join('\n\n')}\n\nExit Ticket:\n${lessonPlan.exitTicket}\n\nDifferentiation:\n${lessonPlan.differentiationNote}`;
                  downloadTextFile(`Lesson_Plan_${lessonPlan.title.replace(/\s+/g, '_')}.doc`, content);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer shadow-soft-xs ${
                  isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
                title="Export as .doc"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .doc</span>
              </button>

              <button
                onClick={() => {
                  const content = `# ${lessonPlan.title}\n${lessonPlan.standards}\n\nObjectives:\n${lessonPlan.objectives.join('\n')}`;
                  handleCopy('plan', content);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer shadow-soft-xs ${
                  isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {copiedKey === 'plan' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'plan' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Formatted Lesson Plan Document View */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border shadow-soft space-y-6 ${
              isDark ? 'bg-zinc-950/80 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header info */}
            <div className={`pb-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
              isDark ? 'border-zinc-800' : 'border-slate-200'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Instructional Lesson Plan • {lessonPlan.framework}
                </span>
                <h2 className="text-xl font-extrabold tracking-tight mt-0.5">{lessonPlan.title}</h2>
                <div className={`flex flex-wrap items-center gap-3 text-xs mt-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  <span>📚 {lessonPlan.subject}</span>
                  <span>🎓 {lessonPlan.gradeLevel}</span>
                  <span>⏱️ {lessonPlan.durationMinutes} Minutes</span>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border text-xs max-w-sm shadow-soft-xs ${
                isDark ? 'bg-zinc-900/80 border-zinc-800 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <span className="font-bold block text-[10px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Standards Alignment</span>
                <p className="mt-0.5 font-mono text-[11px] font-semibold">{lessonPlan.standards}</p>
              </div>
            </div>

            {/* Essential Question Callout */}
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-soft-xs ${
              isDark ? 'bg-zinc-900/60 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">Essential Question</span>
              <p className={`font-semibold text-sm ${isDark ? 'text-zinc-100' : 'text-slate-900'}`}>
                "{lessonPlan.essentialQuestion}"
              </p>
            </div>

            {/* Objectives & Materials Two-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border shadow-soft-xs ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-xs font-bold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Measurable Learning Objectives (SWBAT)
                </span>
                <ul className="space-y-1.5 text-xs">
                  {lessonPlan.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span className={isDark ? 'text-zinc-200' : 'text-slate-800 font-medium'}>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`p-4 rounded-2xl border shadow-soft-xs ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-xs font-bold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 mb-2">
                  <Sliders className="w-4 h-4" />
                  Required Materials &amp; Media
                </span>
                <ul className="space-y-1.5 text-xs">
                  {lessonPlan.materials.map((mat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span className={isDark ? 'text-zinc-200' : 'text-slate-800 font-medium'}>{mat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Timed Step-by-Step Agenda Table */}
            <div>
              <h3 className="font-extrabold text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Timed Instructional Sequence &amp; Classroom Delivery
              </h3>

              <div className="space-y-3">
                {lessonPlan.agenda.map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all shadow-soft-xs ${
                      isDark
                        ? 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400">{step.phase}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}>
                        {step.time}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider block mb-0.5 ${
                          isDark ? 'text-zinc-400' : 'text-slate-500'
                        }`}>
                          Teacher Action &amp; Modeling:
                        </span>
                        <p className={isDark ? 'text-zinc-200' : 'text-slate-800 font-medium'}>{step.teacherAction}</p>
                      </div>

                      <div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider block mb-0.5 ${
                          isDark ? 'text-zinc-400' : 'text-slate-500'
                        }`}>
                          Student Action &amp; Discussion:
                        </span>
                        <p className={isDark ? 'text-zinc-200' : 'text-slate-800 font-medium'}>{step.studentAction}</p>
                      </div>
                    </div>

                    {step.pedagogicalTip && (
                      <div className={`mt-2.5 pt-2 border-t flex items-center gap-1.5 text-[11px] ${
                        isDark ? 'border-zinc-800/60 text-zinc-300' : 'border-slate-100 text-slate-700'
                      }`}>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Pedagogical Cue:</span>
                        <span>{step.pedagogicalTip}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Exit Ticket & Differentiation Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className={`p-4 rounded-2xl border shadow-soft-xs ${
                isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="font-bold text-xs text-slate-900 dark:text-white block mb-1">
                  🎟️ Formative Exit Ticket Check
                </span>
                <p className={`text-xs ${isDark ? 'text-zinc-300' : 'text-slate-700 font-medium'}`}>{lessonPlan.exitTicket}</p>
              </div>

              <div className={`p-4 rounded-2xl border shadow-soft-xs ${
                isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="font-bold text-xs text-slate-900 dark:text-white block mb-1">
                  🎯 Differentiation &amp; Accommodations Summary
                </span>
                <p className={`text-xs ${isDark ? 'text-zinc-300' : 'text-slate-700 font-medium'}`}>{lessonPlan.differentiationNote}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOOL 2: SMART RUBRIC & CRITERIA MATRIX WITH LIVE SCORING */}
      {/* ========================================================================= */}
      {activeTab === 'rubric' && (
        <div className="space-y-4">
          {/* Rubric Config Bar */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-soft-xs ${
              isDark ? 'bg-zinc-900/60 border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Assessment Type:</span>
              <select
                value={rubricType}
                onChange={(e) => setRubricType(e.target.value as any)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs border cursor-pointer ${
                  isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
                }`}
              >
                <option value="Oral Presentation">Oral Presentation / Defense</option>
                <option value="Research Project">Research Paper / Inquiry Report</option>
                <option value="Science Lab Report">Science Lab &amp; Experimental Data</option>
                <option value="STEM & Coding">STEM / Engineering Design</option>
                <option value="Creative Slide Deck">Visual Slide Deck &amp; Storytelling</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer shadow-soft-xs ${
                  isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Rubric</span>
              </button>

              <button
                onClick={() => {
                  const csv = exportRubricToCSV(rubric);
                  downloadTextFile(`Rubric_${rubric.title.replace(/\s+/g, '_')}.csv`, csv);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer shadow-soft-xs ${
                  isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
                title="Export for Google Classroom / Canvas"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Interactive Live Scoring Station Bar */}
          <div
            className={`p-4 sm:p-5 rounded-3xl border shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              isDark
                ? 'bg-zinc-900/80 border-white/10 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                ⚡ Interactive Live Scoring Mode
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={studentNameInput}
                  onChange={(e) => setStudentNameInput(e.target.value)}
                  placeholder="Enter Student or Presentation Team Name..."
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold w-64 ${
                    isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
                <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  (Tap cells on matrix below to grade in real time)
                </span>
              </div>
            </div>

            {/* Score Tally Pill */}
            {(() => {
              const { earned, max, percentage, letterGrade } = calculateTotalScore();
              return (
                <div className="flex items-center gap-3 shrink-0">
                  <div className={`p-2.5 px-4 rounded-2xl border text-center shadow-soft-xs ${
                    isDark ? 'bg-zinc-950/80 border-zinc-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Live Score</div>
                    <div className="text-lg font-extrabold tracking-tight">
                      {earned} / {max} <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">({percentage}%)</span>
                    </div>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-soft-xs">
                    {letterGrade}
                  </div>

                  <button
                    onClick={() => {
                      const text = constructLiveStudentFeedback();
                      handleCopy('rubric_feedback', text);
                    }}
                    className="px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 cursor-pointer shadow-soft-xs"
                    title="Copy student feedback comment"
                  >
                    {copiedKey === 'rubric_feedback' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'rubric_feedback' ? 'Copied Feedback' : 'Copy Feedback'}</span>
                  </button>
                </div>
              );
            })()}
          </div>

          {/* 4-Tier Analytic Matrix Table */}
          <div
            className={`p-6 rounded-3xl border shadow-soft-sm overflow-x-auto ${
              isDark ? 'bg-zinc-950/80 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold tracking-tight">{rubric.title}</h3>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  4-Level Performance Matrix ({rubric.criteria.length} Evaluated Dimensions • Maximum {rubric.maxScore} pts)
                </p>
              </div>
            </div>

            <div className="min-w-[750px] border rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-zinc-800">
              {/* Column Headers */}
              <div
                className={`grid grid-cols-12 text-xs font-bold p-3 border-b ${
                  isDark ? 'bg-zinc-900/80 text-zinc-300 border-zinc-800' : 'bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                <div className="col-span-3">Dimension &amp; Criteria</div>
                <div className="col-span-2 text-center text-red-700 dark:text-red-400">1: Beginning</div>
                <div className="col-span-2 text-center text-amber-800 dark:text-amber-300">2: Developing</div>
                <div className="col-span-2 text-center text-blue-700 dark:text-blue-400">3: Proficient</div>
                <div className="col-span-3 text-center text-emerald-800 dark:text-emerald-300">4: Exemplary (Mastery)</div>
              </div>

              {/* Rows */}
              {rubric.criteria.map((c) => {
                const currentScore = selectedScores[c.id] || 0;
                return (
                  <div
                    key={c.id}
                    className={`grid grid-cols-12 text-xs p-3 items-stretch gap-2 transition-colors ${
                      isDark ? 'hover:bg-zinc-900/30' : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Dimension Name */}
                    <div className="col-span-3 pr-2 flex flex-col justify-center">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{c.category}</span>
                      <span className={`text-[10px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                        Weight: {c.weightPercentage}%
                      </span>
                    </div>

                    {/* Level 1: Beginning */}
                    <button
                      type="button"
                      onClick={() => setSelectedScores((prev) => ({ ...prev, [c.id]: 1 }))}
                      className={`col-span-2 p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        currentScore === 1
                          ? isDark
                            ? 'bg-zinc-900 border-zinc-600 text-white shadow-soft-md ring-1 ring-zinc-500/30'
                            : 'bg-white border-slate-300 text-slate-900 shadow-soft-md ring-1 ring-slate-400/30'
                          : isDark
                          ? 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/70 shadow-soft-xs'
                          : 'bg-slate-50/90 border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 shadow-soft-xs'
                      }`}
                    >
                      <p className={`text-[11px] leading-relaxed ${currentScore === 1 ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-700 dark:text-zinc-300'}`}>
                        {c.levels.find((l) => l.score === 1)?.descriptor}
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px] font-bold">
                        <span className={currentScore === 1 ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-500 dark:text-zinc-400'}>1 pt</span>
                        {currentScore === 1 && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center gap-1 shadow-soft-xs">
                            Selected
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Level 2: Developing */}
                    <button
                      type="button"
                      onClick={() => setSelectedScores((prev) => ({ ...prev, [c.id]: 2 }))}
                      className={`col-span-2 p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        currentScore === 2
                          ? isDark
                            ? 'bg-zinc-900 border-zinc-600 text-white shadow-soft-md ring-1 ring-zinc-500/30'
                            : 'bg-white border-slate-300 text-slate-900 shadow-soft-md ring-1 ring-slate-400/30'
                          : isDark
                          ? 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/70 shadow-soft-xs'
                          : 'bg-slate-50/90 border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 shadow-soft-xs'
                      }`}
                    >
                      <p className={`text-[11px] leading-relaxed ${currentScore === 2 ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-700 dark:text-zinc-300'}`}>
                        {c.levels.find((l) => l.score === 2)?.descriptor}
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px] font-bold">
                        <span className={currentScore === 2 ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-500 dark:text-zinc-400'}>2 pts</span>
                        {currentScore === 2 && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 flex items-center gap-1 shadow-soft-xs">
                            Selected
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Level 3: Proficient */}
                    <button
                      type="button"
                      onClick={() => setSelectedScores((prev) => ({ ...prev, [c.id]: 3 }))}
                      className={`col-span-2 p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        currentScore === 3
                          ? isDark
                            ? 'bg-zinc-900 border-zinc-600 text-white shadow-soft-md ring-1 ring-zinc-500/30'
                            : 'bg-white border-slate-300 text-slate-900 shadow-soft-md ring-1 ring-slate-400/30'
                          : isDark
                          ? 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/70 shadow-soft-xs'
                          : 'bg-slate-50/90 border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 shadow-soft-xs'
                      }`}
                    >
                      <p className={`text-[11px] leading-relaxed ${currentScore === 3 ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-700 dark:text-zinc-300'}`}>
                        {c.levels.find((l) => l.score === 3)?.descriptor}
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px] font-bold">
                        <span className={currentScore === 3 ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-500 dark:text-zinc-400'}>3 pts</span>
                        {currentScore === 3 && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-indigo-600 text-white flex items-center gap-1 shadow-soft-xs">
                            Proficient <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Level 4: Exemplary */}
                    <button
                      type="button"
                      onClick={() => setSelectedScores((prev) => ({ ...prev, [c.id]: 4 }))}
                      className={`col-span-3 p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        currentScore === 4
                          ? isDark
                            ? 'bg-zinc-900 border-zinc-600 text-white shadow-soft-md ring-1 ring-zinc-500/30'
                            : 'bg-white border-slate-300 text-slate-900 shadow-soft-md ring-1 ring-slate-400/30'
                          : isDark
                          ? 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/70 shadow-soft-xs'
                          : 'bg-slate-50/90 border-slate-200/90 text-slate-600 hover:text-slate-900 hover:bg-slate-100/90 shadow-soft-xs'
                      }`}
                    >
                      <p className={`text-[11px] leading-relaxed ${currentScore === 4 ? 'font-medium text-slate-900 dark:text-white' : 'text-slate-700 dark:text-zinc-300'}`}>
                        {c.levels.find((l) => l.score === 4)?.descriptor}
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px] font-bold">
                        <span className={currentScore === 4 ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-500 dark:text-zinc-400'}>4 pts (Mastery)</span>
                        {currentScore === 4 && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-indigo-600 text-white flex items-center gap-1 shadow-soft-xs">
                            Mastery <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOOL 3: DIFFERENTIATED INSTRUCTION & IEP / ELL ACCOMMODATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'differentiation' && (
        <div className="space-y-4">
          {/* Header Action Bar */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs shadow-soft-xs ${
              isDark ? 'bg-zinc-900/60 border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Differentiated Learning Profiles:</span>
              <span className={`ml-2 text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                3-Tier Task Scaffolding + Multilingual Vocabulary Anchors
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer shadow-soft-xs ${
                  isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Guide</span>
              </button>

              <button
                onClick={() => {
                  const text = `# Differentiated Instruction Guide: ${differentiation.topic}\n\n${differentiation.tiers.map((t) => `## ${t.tierName}\nTarget: ${t.targetLearners}\nTask: ${t.activityPrompt}\nScaffolds:\n${t.scaffolds.map((s) => `• ${s}`).join('\n')}`).join('\n\n')}\n\n## Multilingual Vocabulary:\n${differentiation.vocabularyBridge.map((v) => `• ${v.term}: ${v.simpleDefinition} | Spanish: ${v.spanish} | Tagalog: ${v.tagalog}`).join('\n')}\n\n## IEP Accommodations:\n${differentiation.iepAccommodations.map((a) => `• ${a}`).join('\n')}`;
                  handleCopy('diff', text);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer shadow-soft-xs ${
                  isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {copiedKey === 'diff' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'diff' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* 3 Tier Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {differentiation.tiers.map((tier, idx) => (
              <div
                key={tier.tierName}
                className={`p-5 rounded-3xl border shadow-soft-sm flex flex-col justify-between space-y-4 ${
                  isDark ? 'bg-zinc-950/80 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="space-y-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-soft-xs inline-flex items-center gap-1.5 ${
                    isDark
                      ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-slate-500' : idx === 1 ? 'bg-indigo-500' : 'bg-indigo-600'}`} />
                    {tier.tierName}
                  </span>
                  <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{tier.targetLearners}</h3>
                  <div className={`p-3 rounded-2xl text-xs border shadow-soft-xs ${
                    isDark ? 'bg-zinc-900/60 border-zinc-800 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <span className={`font-bold block text-[10px] uppercase mb-1 ${isDark ? 'text-indigo-400' : 'text-indigo-700'}`}>Assigned Student Task:</span>
                    <p className="leading-relaxed">{tier.activityPrompt}</p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200/80 dark:border-zinc-800/60">
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    isDark ? 'text-zinc-400' : 'text-slate-500'
                  }`}>
                    Built-in Scaffolds:
                  </span>
                  <ul className="space-y-1 text-xs">
                    {tier.scaffolds.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <span className={isDark ? 'text-zinc-200' : 'text-slate-700'}>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Multilingual ELL Vocabulary Bridge Station */}
          <div
            className={`p-6 rounded-3xl border shadow-soft-sm space-y-4 ${
              isDark ? 'bg-zinc-950/80 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                ELL / Multilingual Academic Vocabulary Bridge
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {differentiation.vocabularyBridge.map((v, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border shadow-soft-xs ${
                    isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">{v.term}</span>
                    <button
                      onClick={() => handleCopy(`word-${idx}`, `${v.term}: ${v.simpleDefinition}`)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                      title="Copy word"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <p className={`text-xs mt-1 font-medium ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                    {v.simpleDefinition}
                  </p>
                  <p className={`text-[11px] italic mt-1 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                    Context: "{v.contextClue}"
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-zinc-800/60 flex items-center gap-4 text-[11px]">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-zinc-400 block">Spanish:</span>
                      <span className="font-semibold text-slate-900 dark:text-emerald-400">{v.spanish}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-500 dark:text-zinc-400 block">Tagalog:</span>
                      <span className="font-semibold text-slate-900 dark:text-amber-400">{v.tagalog}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick IEP Accommodations Checklist */}
          <div
            className={`p-6 rounded-3xl border shadow-soft-sm ${
              isDark ? 'bg-zinc-950/80 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <h3 className="font-extrabold text-sm mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-emerald-400" />
              Standard Classroom IEP &amp; 504 Modification Checkpoints
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {differentiation.iepAccommodations.map((acc, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 shadow-soft-xs ${
                    isDark ? 'bg-zinc-900/30 border-zinc-800/60' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                  <span className={isDark ? 'text-zinc-200' : 'text-slate-800 font-medium'}>{acc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOOL 4: 1-CLICK EMERGENCY SUBSTITUTE TEACHER PACK */}
      {/* ========================================================================= */}
      {activeTab === 'sub_plan' && (
        <div className="space-y-4">
          {/* Sub Plan Config Bar */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-soft-xs ${
              isDark ? 'bg-zinc-900/60 border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className={`block text-[10px] font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Teacher Name:</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${
                    isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[10px] font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>Room Number:</label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${
                    isDark ? 'bg-zinc-950 border-zinc-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer shadow-soft-xs ${
                  isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sub Folder</span>
              </button>

              <button
                onClick={() => {
                  const text = `# EMERGENCY SUBSTITUTE TEACHER PACK\nTeacher: ${subPlan.teacherName} | Date: ${subPlan.date} | Room: ${subPlan.roomNumber}\nEmergency Contact: ${subPlan.emergencyPhone}\n\n${subPlan.subTeacherWelcome}\n\n## SCHEDULE & INSTRUCTIONS:\n${subPlan.periods.map((p) => `### ${p.period}\nCourse: ${p.courseName} | Topic: ${p.slideDeckTopic}\nInstructions:\n${p.subInstructions.map((i) => `• ${i}`).join('\n')}\nStudent Task: ${p.studentHandoutTask}`).join('\n\n')}\n\n## RELIABLE STUDENT HELPERS:\n${subPlan.studentHelpers.map((h) => `• ${h}`).join('\n')}\n\n## CLASSROOM RULES:\n${subPlan.classroomManagementRules.map((r) => `• ${r}`).join('\n')}\n\n## NOTES FOR TEACHER:\n${subPlan.feedbackForTeacherNote}`;
                  downloadTextFile(`Emergency_Sub_Plan_${subPlan.date.replace(/\s+/g, '_')}.doc`, text);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all cursor-pointer shadow-soft-xs ${
                  isDark
                    ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .doc</span>
              </button>
            </div>
          </div>

          {/* Sub Folder Printable Document View */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border shadow-soft space-y-6 ${
              isDark ? 'bg-zinc-950/80 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Folder Header */}
            <div className={`pb-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isDark ? 'border-zinc-800' : 'border-slate-200'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                  Official School Document • Guest Teacher Folder
                </span>
                <h2 className="text-xl font-extrabold tracking-tight mt-0.5">{subPlan.teacherName}'s Sub Plan</h2>
                <div className={`flex flex-wrap items-center gap-4 text-xs mt-1.5 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  <span>👤 Teacher: {subPlan.teacherName}</span>
                  <span>📍 Room: {subPlan.roomNumber}</span>
                  <span>📅 Date: {subPlan.date}</span>
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border text-xs max-w-sm shadow-soft-xs ${
                isDark ? 'bg-zinc-900/80 border-zinc-800 text-zinc-200' : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 block">Emergency Contacts:</span>
                <p className="mt-0.5 font-bold text-xs text-slate-900 dark:text-white">{subPlan.emergencyPhone}</p>
              </div>
            </div>

            {/* Welcome Note */}
            <div className={`p-4 rounded-2xl border text-xs leading-relaxed shadow-soft-xs ${
              isDark ? 'bg-zinc-900/40 border-zinc-800 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-800 font-medium'
            }`}>
              {subPlan.subTeacherWelcome}
            </div>

            {/* Class Periods Breakdown */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm flex items-center gap-2 text-slate-900 dark:text-white">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Period-by-Period Instruction Schedule
              </h3>

              {subPlan.periods.map((p, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border space-y-3 shadow-soft-xs ${
                    isDark ? 'bg-zinc-900/30 border-zinc-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="font-extrabold text-xs text-indigo-600 dark:text-indigo-400">{p.period}</span>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.courseName} — <span className="font-medium text-xs opacity-80">{p.slideDeckTopic}</span></h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border w-fit ${
                      isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      {p.timeRange}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                      isDark ? 'text-zinc-400' : 'text-slate-500'
                    }`}>
                      Guest Teacher Routine:
                    </span>
                    <ul className="space-y-1">
                      {p.subInstructions.map((ins, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          <span className={isDark ? 'text-zinc-200' : 'text-slate-800 font-medium'}>{ins}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`p-3 rounded-xl border text-xs shadow-soft-xs ${
                    isDark ? 'bg-zinc-950/60 border-zinc-800/80 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <span className="font-bold text-[10px] uppercase text-indigo-700 dark:text-indigo-400 block mb-0.5">
                      Student Independent Assignment:
                    </span>
                    <p className="leading-relaxed font-medium">{p.studentHandoutTask}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Helpers & Management Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border shadow-soft-xs ${
                isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="font-bold text-xs flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 mb-2">
                  <Users className="w-3.5 h-3.5" />
                  Reliable Student Helpers
                </span>
                <ul className="space-y-1 text-xs">
                  {subPlan.studentHelpers.map((h, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span className={isDark ? 'text-zinc-200' : 'text-slate-800 font-medium'}>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`p-4 rounded-2xl border shadow-soft-xs ${
                isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className="font-bold text-xs flex items-center gap-1.5 text-slate-900 dark:text-white mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  Classroom Policies &amp; Procedures
                </span>
                <ul className="space-y-1 text-xs">
                  {subPlan.classroomManagementRules.map((r, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                      <span className={isDark ? 'text-zinc-200' : 'text-slate-800 font-medium'}>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Substitute End-of-Day Notes Section */}
            <div className={`p-4 rounded-2xl border shadow-soft-xs ${
              isDark ? 'bg-zinc-900/20 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 block mb-1">
                ✍️ Guest Teacher End-of-Day Notes to Returning Teacher:
              </span>
              <p className={`text-xs mb-2 ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                {subPlan.feedbackForTeacherNote}
              </p>
              <textarea
                rows={3}
                placeholder="Write your notes here for when the teacher returns (e.g. absent students, great participation, any questions)..."
                className={`w-full p-2.5 rounded-xl border text-xs ${
                  isDark ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

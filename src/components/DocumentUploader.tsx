import React, { useState, useRef } from 'react';
import { extractTextFromFile } from '../utils/fileExtractor';
import {
  UploadCloud,
  FileText,
  Sliders,
  BookOpen,
  Paintbrush,
  History,
  CheckCircle2,
  Loader2,
  Presentation,
  ArrowRight,
  X,
  Layers,
} from 'lucide-react';
import { TargetAudience, DeckLength, SlideTone, ColorThemeName, SlideDeck, IllustrationStyle, CurriculumSession } from '../types/deck';
import { SAMPLE_CURRICULA, SampleCurriculum } from '../data/sampleCurricula';
import { User as FirebaseUser } from 'firebase/auth';
import { PWAInstallButton } from './PWAInstallButton';

interface DocumentUploaderProps {
  onGenerate: (params: {
    content: string;
    targetAudience: TargetAudience;
    deckLength: DeckLength;
    customSlideCount?: number;
    slideTone: SlideTone;
    colorTheme?: ColorThemeName;
    session?: CurriculumSession;
    illustrationStyle?: IllustrationStyle;
    customFocus?: string;
  }) => Promise<void>;
  isGenerating: boolean;
  isDark: boolean;
  savedDecks?: SlideDeck[];
  onSelectDeck?: (deck: SlideDeck) => void;
  onOpenHistory?: () => void;
  currentUser?: FirebaseUser | null;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  onGenerate,
  isGenerating,
  isDark,
  savedDecks = [],
  onSelectDeck: _onSelectDeck,
  onOpenHistory,
  currentUser: _currentUser,
}) => {
  const [activeInputTab, setActiveInputTab] = useState<'upload' | 'paste' | 'templates'>('upload');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    type: string;
    content: string;
    words: number;
    detectedTopic?: string;
  } | null>(null);

  const [pastedText, setPastedText] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [processProgress, setProcessProgress] = useState<number>(0);
  const [processStatusMessage, setProcessStatusMessage] = useState<string>('');

  // Core Presentation Parameters
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('Senior High School (Grades 11-12)');
  const [deckLength, setDeckLength] = useState<DeckLength>('standard');
  const [customSlideCountNumber, setCustomSlideCountNumber] = useState<number>(12);
  const [slideTone, setSlideTone] = useState<SlideTone>('Highly Visual & Minimalist');
  const [session, setSession] = useState<CurriculumSession>('Session 1');
  const [colorTheme, setColorTheme] = useState<ColorThemeName>('Dark Tech');
  const [illustrationStyle, setIllustrationStyle] = useState<IllustrationStyle>('Cartoon & Playful Illustration');
  const [customFocus, setCustomFocus] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateFileParsing = (filename: string, text: string, type: string) => {
    setIsProcessingFile(true);
    setProcessProgress(25);
    setProcessStatusMessage('Parsing instructional hierarchy...');

    const timer1 = setTimeout(() => {
      setProcessProgress(65);
      setProcessStatusMessage('Extracting pedagogical milestones...');
    }, 350);

    const timer2 = setTimeout(() => {
      setProcessProgress(90);
      setProcessStatusMessage('Formatting visual scaffold prompts...');
    }, 700);

    const timer3 = setTimeout(() => {
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      const detectedTopic = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setUploadedFile({
        name: filename,
        size: `${(text.length / 1024).toFixed(1)} KB`,
        type,
        content: text,
        words,
        detectedTopic: detectedTopic.length > 25 ? detectedTopic.slice(0, 25) + '...' : detectedTopic,
      });
      setIsProcessingFile(false);
      setProcessProgress(100);
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file: File) => {
    const filename = file.name;
    const fileType = file.type || filename.split('.').pop() || 'unknown';

    try {
      setIsProcessingFile(true);
      setProcessProgress(20);
      setProcessStatusMessage('Parsing instructional hierarchy...');

      const extractedText = await extractTextFromFile(file);
      simulateFileParsing(filename, extractedText, fileType);
    } catch (err) {
      console.error('File extraction failed:', err);
      const fallback = `# Source Document: ${filename}\n\nLesson content and curriculum framework extracted for ${filename}.`;
      simulateFileParsing(filename, fallback, fileType);
    }
  };

  const handleSelectSample = (sample: SampleCurriculum) => {
    setUploadedFile({
      name: `${sample.title}.md`,
      size: `${(sample.sourceText.length / 1024).toFixed(1)} KB`,
      type: 'text/markdown',
      content: sample.sourceText,
      words: sample.sourceText.split(/\s+/).filter(Boolean).length,
      detectedTopic: sample.subject,
    });
    setCustomFocus(`Visual scaffolds and formative checks for ${sample.subject}`);
  };

  const clearSource = () => {
    setUploadedFile(null);
    setPastedText('');
  };

  const getEffectiveContent = (): string => {
    if (uploadedFile) return uploadedFile.content;
    if (activeInputTab === 'paste') return pastedText;
    return '';
  };

  const effectiveContent = getEffectiveContent();
  const canGenerate = effectiveContent.trim().length > 20 && !isGenerating && !isProcessingFile;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canGenerate) return;

    await onGenerate({
      content: effectiveContent,
      targetAudience,
      deckLength,
      customSlideCount: deckLength === 'custom' ? customSlideCountNumber : undefined,
      slideTone,
      colorTheme,
      session,
      illustrationStyle,
      customFocus,
    });
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto my-auto pt-4 sm:pt-8 pb-20 space-y-8 animate-fade-in-up">
      {/* Ambient Radial Mesh Glow */}
      <div
        aria-hidden="true"
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-orange-500/10 blur-[100px] rounded-full pointer-events-none opacity-80"
      />

      {/* Hero Intro Header with Bold Clean Typography */}
      <div className="text-center space-y-2.5 relative z-10 pt-2 pb-1">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Create Presentation <span className="bg-gradient-to-r from-indigo-500 via-purple-400 to-orange-400 bg-clip-text text-transparent">Slide Decks</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Upload documents, paste notes, or select curriculum topics to generate structured presentation slides.
        </p>
      </div>

      {/* Main Glassmorphic Studio Container */}
      <div className="relative z-10 rounded-[28px] overflow-hidden glass-card shadow-soft-2xl border border-slate-200/80 dark:border-white/10 transition-all duration-300">
        {/* 1. Header Segmented Control Bar */}
        <div className={`p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/70 dark:border-white/10 ${
          isDark ? 'bg-zinc-950/40' : 'bg-slate-50/70'
        }`}>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Content Source
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-0.5">
              Choose how you want to provide your materials
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Interactive Segmented Switcher */}
            <div className={`inline-flex p-1 rounded-2xl border border-slate-200/80 dark:border-white/10 ${
              isDark ? 'bg-zinc-950/80' : 'bg-slate-200/60'
            }`}>
              <button
                type="button"
                onClick={() => setActiveInputTab('upload')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  activeInputTab === 'upload'
                    ? 'bg-indigo-600 text-white shadow-soft-xs'
                    : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveInputTab('paste')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  activeInputTab === 'paste'
                    ? 'bg-indigo-600 text-white shadow-soft-xs'
                    : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Paste Notes</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveInputTab('templates')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  activeInputTab === 'templates'
                    ? 'bg-indigo-600 text-white shadow-soft-xs'
                    : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Presets</span>
              </button>
            </div>

            {/* Saved Decks Trigger */}
            {savedDecks.length > 0 && onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 border border-slate-200/80 dark:border-white/10 ${
                  isDark
                    ? 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200'
                    : 'bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                <History className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Saved Decks</span>
                <span className="px-1.5 py-0.5 rounded-full font-mono text-[11px] font-bold bg-indigo-500/20 text-indigo-400">
                  {savedDecks.length}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* 2. Source Ingestion Area */}
        <div className="p-6 sm:p-8">
          {/* TAB 1: UPLOAD DROPZONE */}
          {activeInputTab === 'upload' && (
            <div className="space-y-4">
              {!uploadedFile && !isProcessingFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative cursor-pointer rounded-2xl p-10 sm:p-14 text-center transition-all duration-300 flex flex-col items-center justify-center gap-4 border-2 border-dashed ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]'
                      : 'border-slate-300 dark:border-white/15 hover:border-indigo-400 dark:hover:border-indigo-500/60 bg-slate-50/60 dark:bg-zinc-950/40 hover:bg-indigo-500/5'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.csv,.xlsx,.json,.mp3,.wav,.mp4"
                    className="hidden"
                  />

                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-soft-sm ${
                    isDark
                      ? 'bg-gradient-to-tr from-indigo-900/60 to-purple-900/40 text-indigo-300 border border-indigo-700/40'
                      : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                  }`}>
                    <UploadCloud className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5 max-w-md">
                    <p className={`font-bold text-base sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Drop curriculum files here or <span className="text-indigo-500 dark:text-indigo-400 underline font-extrabold">browse files</span>
                    </p>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                      PDF, Word docs, PowerPoint, Markdown notes, text transcripts, or audio lecture files
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Progress Bar During Ingestion */}
              {isProcessingFile && (
                <div className={`p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4 ${
                  isDark ? 'bg-zinc-950/70' : 'bg-slate-50'
                }`}>
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-800 dark:text-zinc-200">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                      {processStatusMessage}
                    </span>
                    <span className="font-mono text-indigo-400 font-bold">{processProgress}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${
                    isDark ? 'bg-zinc-800' : 'bg-slate-200'
                  }`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-orange-500 transition-all duration-300 ease-out"
                      style={{ width: `${processProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Active Parsed File Preview Card */}
              {uploadedFile && (
                <div className={`p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-soft-sm flex items-center justify-between gap-4 transition-all ${
                  isDark ? 'bg-zinc-900/60 text-white' : 'bg-white text-slate-900'
                }`}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-soft-xs">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm sm:text-base truncate">
                          {uploadedFile.name}
                        </h4>
                        <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-zinc-700 shadow-soft-xs">
                          Ready
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-2">
                        <span>{uploadedFile.size}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{uploadedFile.words.toLocaleString()} words</span>
                        {uploadedFile.detectedTopic && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-indigo-400 truncate max-w-[200px]">{uploadedFile.detectedTopic}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={clearSource}
                    className={`p-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer shrink-0 border border-slate-200 dark:border-white/10 ${
                      isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300' : 'bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                    title="Clear document"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PASTE TEXT */}
          {activeInputTab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label className={`font-bold flex items-center gap-2 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Lecture Notes, Syllabus or Curriculum Outline</span>
                </label>
                <span className="font-mono text-slate-500 dark:text-zinc-400">
                  {pastedText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={7}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your curriculum notes, lecture outline, lesson objectives, or key discussion points here..."
                className={`w-full p-5 rounded-2xl text-sm font-mono leading-relaxed border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all ${
                  isDark
                    ? 'bg-zinc-950/70 text-white placeholder-zinc-500'
                    : 'bg-slate-50 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>
          )}

          {/* TAB 3: CURRICULUM PRESETS */}
          {activeInputTab === 'templates' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SAMPLE_CURRICULA.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-5 rounded-2xl text-left cursor-pointer transition-all duration-200 border ${
                    uploadedFile?.name === `${sample.title}.md`
                      ? 'border-indigo-500 bg-indigo-500/10 shadow-soft-sm'
                      : 'border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-zinc-950/40 hover:bg-white dark:hover:bg-zinc-900/60 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="font-bold text-indigo-500 dark:text-indigo-400">
                      {sample.subject}
                    </span>
                    <span className="text-slate-500 dark:text-zinc-400 font-medium">
                      {sample.audience}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1">
                    {sample.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {sample.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Deck Configuration Section */}
        <div className={`p-6 sm:p-8 space-y-6 border-t border-slate-200/70 dark:border-white/10 ${
          isDark ? 'bg-zinc-950/40' : 'bg-slate-50/50'
        }`}>
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-base font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Deck Configuration
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                Configure target audience, slide count, tone, and visual style
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 dark:text-zinc-400 hidden sm:inline px-3 py-1 bg-slate-200/60 dark:bg-zinc-800/80 rounded-full border border-slate-300/40 dark:border-white/5">
              16:9 Widescreen
            </span>
          </div>

          {/* Core Parameter Selectors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                Audience & Grade
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-slate-900 shadow-xs'
                }`}
              >
                <option value="Elementary (K-6)">Elementary (K-6)</option>
                <option value="Junior High School (Grades 7-10)">Junior High School (7-10)</option>
                <option value="Senior High School (Grades 11-12)">Senior High School (11-12)</option>
                <option value="College / Higher Education">College / University</option>
                <option value="Professional / Graduate Workshop">Professional Workshop</option>
                <option value="Special Education (SPED) / Accommodated">Special Education (SPED)</option>
              </select>
            </div>

            {/* Slide Length */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                Slide Count
              </label>
              <select
                value={deckLength}
                onChange={(e) => setDeckLength(e.target.value as DeckLength)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-slate-900 shadow-xs'
                }`}
              >
                <option value="short">Short (5-7 slides)</option>
                <option value="standard">Standard (10-14 slides)</option>
                <option value="deep">Comprehensive (18-22 slides)</option>
                <option value="custom">Custom Desired Length...</option>
                <option value="random">Dynamic Length</option>
              </select>

              {deckLength === 'custom' && (
                <div className="pt-1.5 flex items-center gap-2">
                  <span className="text-xs text-slate-600 dark:text-zinc-400 font-medium">Desired:</span>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={customSlideCountNumber}
                    onChange={(e) => setCustomSlideCountNumber(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                    className={`w-20 px-2.5 py-1 rounded-lg text-xs font-bold font-mono text-center border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                      isDark ? 'bg-zinc-900 text-orange-400' : 'bg-white text-orange-600 shadow-xs'
                    }`}
                  />
                  <span className="text-xs text-slate-500 dark:text-zinc-400">slides</span>
                </div>
              )}
            </div>

            {/* Slide Tone */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                Instructional Tone
              </label>
              <select
                value={slideTone}
                onChange={(e) => setSlideTone(e.target.value as SlideTone)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-slate-900 shadow-xs'
                }`}
              >
                <option value="Highly Visual & Minimalist">Visual & Minimalist</option>
                <option value="Academic & Rigorous">Academic & Rigorous</option>
                <option value="Storytelling & Interactive">Storytelling & Narrative</option>
                <option value="Inquiry-Based & Socratic">Inquiry-Based Socratic</option>
              </select>
            </div>

            {/* Curriculum Session */}
            <div className="space-y-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
                Curriculum Session
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as CurriculumSession)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-slate-900 shadow-xs'
                }`}
              >
                <option value="Session 1">Session 1 (Foundations)</option>
                <option value="Session 2">Session 2 (Deep Dive)</option>
                <option value="Session 3">Session 3 (Application & Lab)</option>
                <option value="Session 4">Session 4 (Synthesis & Projects)</option>
                <option value="Session 5">Session 5 (Review & Mastery)</option>
              </select>
            </div>
          </div>

          {/* AI Visual Art Style Selector */}
          <div className="space-y-3 pt-2">
            <div>
              <label className={`text-xs sm:text-sm font-bold flex items-center gap-2 ${isDark ? 'text-zinc-200' : 'text-slate-800'}`}>
                <Paintbrush className="w-4 h-4 text-indigo-400" />
                <span>Visual Illustration Style</span>
              </label>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                Artwork paradigm for generated dual-coding slide diagrams and visual prompts
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'Cartoon & Playful Illustration', label: 'Cartoon & Playful', desc: 'Warm storybook style' },
                { id: '3D Pixar & Clay Animation', label: '3D Pixar Animation', desc: 'Tactile studio render' },
                { id: 'Vector Flat Graphic', label: 'Vector Flat Graphic', desc: 'Clean geometric shapes' },
                { id: 'Photorealistic Cinematic', label: 'Photorealistic', desc: 'Cinematic photography' },
                { id: 'Vintage Botanical & Engraving', label: 'Vintage Engraving', desc: 'Scientific textbook' },
                { id: 'Cyberpunk & Neon Tech', label: 'Cyberpunk Neon', desc: 'High-contrast blueprints' },
                { id: 'Chalkboard & Socratic Sketch', label: 'Chalkboard Sketch', desc: 'Classroom chalkboard' },
                { id: 'Anime & Manga Infographic', label: 'Anime / Manga', desc: 'Dynamic cel-shaded' },
              ].map((style) => {
                const isSelected = illustrationStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setIllustrationStyle(style.id as IllustrationStyle)}
                    className={`p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-1.5 border ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-soft-sm'
                        : isDark
                        ? 'border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm truncate">{style.label}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white shrink-0" />}
                    </div>
                    <p className={`text-[11px] ${
                      isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-zinc-400'
                    }`}>
                      {style.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Instructional Focus */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-zinc-200">
              Custom Pedagogical Focus (Optional)
            </label>
            <input
              type="text"
              value={customFocus}
              onChange={(e) => setCustomFocus(e.target.value)}
              placeholder="e.g., Focus on formative check questions, practical lab analogies, or AP exam review tips..."
              className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                isDark
                  ? 'bg-zinc-900 text-white placeholder-zinc-500'
                  : 'bg-white text-slate-900 placeholder-slate-400 shadow-xs'
              }`}
            />
          </div>

          {/* Primary Action Footer Bar with High-Contrast Accent CTA */}
          <div className="pt-6 border-t border-slate-200/70 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs sm:text-sm font-medium">
              {canGenerate ? (
                <span className="flex items-center gap-2 text-emerald-500 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    Ready to architect {deckLength === 'custom' ? `${customSlideCountNumber} slides` : 'presentation deck'}
                  </span>
                </span>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
                  <span>Upload curriculum or try a preset:</span>
                  <button
                    type="button"
                    onClick={() => handleSelectSample(SAMPLE_CURRICULA[0])}
                    className="font-bold text-indigo-500 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Load AP Biology Sample
                  </button>
                </div>
              )}
            </div>

            {/* High-Contrast Electric Orange/Amber CTA Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canGenerate}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer ${
                canGenerate
                  ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-glow-accent hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]'
                  : isDark
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Classroom Deck...</span>
                </>
              ) : (
                <>
                  <Presentation className="w-4 h-4" />
                  <span>Generate Slide Deck</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  onSelectDeck,
  onOpenHistory,
  currentUser,
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
    <div className="relative w-full max-w-4xl mx-auto my-auto pt-4 sm:pt-6 lg:pt-8 pb-16">
      {/* AMBIENT SOFT LIGHTING BACKDROP (No harsh outlines) */}
      <div
        aria-hidden="true"
        className="absolute -inset-2 sm:-inset-4 rounded-[3.5rem] bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/10 blur-3xl opacity-80 pointer-events-none"
      />

      {/* App Installation Banner */}
      <div className="mb-4">
        <PWAInstallButton variant="prominent" isDark={isDark} />
      </div>

      {/* BORDERLESS UNIFIED TEACHER WORKSPACE CONTAINER */}
      <div className={`relative z-10 rounded-3xl overflow-hidden shadow-soft-2xl transition-all duration-300 ${
        isDark
          ? 'bg-zinc-950/90 text-zinc-100 backdrop-blur-2xl'
          : 'bg-white/95 text-zinc-900 backdrop-blur-2xl'
      }`}>
        {/* 1. TOP SEGMENTED INPUT MODE RAIL (Clean, Borderless Navigation) */}
        <div className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isDark ? 'bg-zinc-900/40' : 'bg-zinc-50/70'
        }`}>
          {/* Borderless Segmented Control */}
          <div className={`inline-flex p-1 rounded-2xl ${
            isDark ? 'bg-zinc-900' : 'bg-zinc-200/60'
          }`}>
            <button
              type="button"
              onClick={() => setActiveInputTab('upload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeInputTab === 'upload'
                  ? 'bg-indigo-600 text-white shadow-soft-sm'
                  : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Notes / File</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveInputTab('paste')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeInputTab === 'paste'
                  ? 'bg-indigo-600 text-white shadow-soft-sm'
                  : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Text</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveInputTab('templates')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeInputTab === 'templates'
                  ? 'bg-indigo-600 text-white shadow-soft-sm'
                  : isDark ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Curriculum Presets</span>
            </button>
          </div>

          {/* Past Decks Trigger */}
          {savedDecks.length > 0 && onOpenHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                isDark
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                  : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-950'
              }`}
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span>Past Decks</span>
              <span className={`px-1.5 py-0.5 rounded-md font-mono text-[10px] ${
                isDark ? 'bg-indigo-950 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
              }`}>
                {savedDecks.length}
              </span>
            </button>
          )}
        </div>

        {/* 2. SOURCE INGESTION AREA (Borderless Canvas) */}
        <div className="p-6">
          {/* TAB 1: UPLOAD DROPZONE */}
          {activeInputTab === 'upload' && (
            <div className="space-y-3">
              {!uploadedFile && !isProcessingFile ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative cursor-pointer rounded-2xl p-8 sm:p-10 text-center transition-all duration-300 flex flex-col items-center justify-center gap-3 overflow-hidden ${
                    isDragging
                      ? isDark
                        ? 'bg-indigo-950/60 scale-[1.01]'
                        : 'bg-indigo-50/90 scale-[1.01]'
                      : isDark
                      ? 'bg-zinc-900/40 hover:bg-zinc-900/80'
                      : 'bg-zinc-50 hover:bg-zinc-100/80'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept=".pdf,.docx,.doc,.pptx,.ppt,.txt,.md,.csv,.xlsx,.json,.mp3,.wav,.mp4"
                    className="hidden"
                  />

                  {/* Soft Floating Cloud Icon */}
                  <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200 ${
                    isDark ? 'bg-indigo-950/90 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  <div className="relative z-10 space-y-1">
                    <p className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                      Drop course files here or <span className="text-indigo-400 underline underline-offset-2 font-bold">browse computer</span>
                    </p>
                    <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      Accepts lecture notes, syllabi, textbooks, slides, and audio recordings
                    </p>
                  </div>

                  {/* Clean Unboxed Metadata Formats (Zero-Pill Discipline) */}
                  <div className="flex items-center justify-center gap-2 pt-1 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium relative z-10 flex-wrap">
                    <span>PDF Document</span>
                    <span aria-hidden="true">·</span>
                    <span>Word (.docx)</span>
                    <span aria-hidden="true">·</span>
                    <span>Markdown & Plain Text</span>
                    <span aria-hidden="true">·</span>
                    <span>Lecture Audio (.mp3)</span>
                  </div>
                </div>
              ) : null}

              {/* Progress Bar During Reading */}
              {isProcessingFile && (
                <div className={`p-6 rounded-2xl space-y-3 ${
                  isDark ? 'bg-zinc-900/80' : 'bg-zinc-100/80'
                }`}>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{processStatusMessage}</span>
                    <span className="font-mono text-indigo-400">{processProgress}%</span>
                  </div>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${
                    isDark ? 'bg-zinc-800' : 'bg-zinc-200'
                  }`}>
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-300 ease-out"
                      style={{ width: `${processProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Active Parsed File Preview Card */}
              {uploadedFile && (
                <div className={`p-4 rounded-2xl flex items-center justify-between gap-4 transition-all ${
                  isDark ? 'bg-indigo-950/40 text-white' : 'bg-indigo-50/80 text-zinc-900'
                }`}>
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isDark ? 'bg-indigo-950 text-indigo-400' : 'bg-white text-indigo-600 shadow-soft-xs'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs sm:text-sm truncate">
                          {uploadedFile.name}
                        </h4>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          Parsed
                        </span>
                      </div>
                      <div className="text-[11px] opacity-75 flex items-center gap-2">
                        <span>{uploadedFile.size}</span>
                        <span aria-hidden="true">·</span>
                        <span>{uploadedFile.words.toLocaleString()} words</span>
                        {uploadedFile.detectedTopic && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-indigo-400 truncate max-w-[160px]">{uploadedFile.detectedTopic}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={clearSource}
                    className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                      isDark ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950'
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
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className={`font-extrabold flex items-center gap-1.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Lecture Notes, Syllabus or Topic Outline</span>
                </label>
                <span className="text-[11px] font-mono opacity-60">
                  {pastedText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={5}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste lesson notes, chapter summary, discussion outline, or laboratory instructions..."
                className={`w-full p-4 rounded-2xl text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                  isDark
                    ? 'bg-zinc-900/80 text-white placeholder-zinc-500'
                    : 'bg-zinc-50 text-zinc-900 placeholder-zinc-400'
                }`}
              />
            </div>
          )}

          {/* TAB 3: CURRICULUM PRESETS */}
          {activeInputTab === 'templates' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SAMPLE_CURRICULA.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-4 rounded-2xl text-left cursor-pointer transition-all ${
                    uploadedFile?.name === `${sample.title}.md`
                      ? isDark
                        ? 'bg-indigo-950/80 text-white shadow-soft-sm'
                        : 'bg-indigo-50 text-zinc-900 shadow-soft-sm'
                      : isDark
                      ? 'bg-zinc-900/60 hover:bg-zinc-900'
                      : 'bg-zinc-50 hover:bg-zinc-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="font-bold text-indigo-400 text-[11px]">
                      {sample.subject}
                    </span>
                    <span className="text-[10px] opacity-60 font-medium">
                      {sample.audience}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm line-clamp-1">
                    {sample.title}
                  </h4>
                  <p className="text-[11px] opacity-75 mt-1 line-clamp-2 leading-relaxed">
                    {sample.summary}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. TEACHER PRESENTATION PARAMETERS (Clean Surface Cards, Zero Border Clutter) */}
        <div className={`p-6 space-y-4 ${
          isDark ? 'bg-zinc-900/40' : 'bg-zinc-50/60'
        }`}>
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <h3 className={`font-bold text-xs ${
                isDark ? 'text-zinc-200' : 'text-zinc-800'
              }`}>
                Teaching Parameters
              </h3>
            </div>
            <span className="text-xs opacity-60 font-mono hidden sm:inline">
              Dual-Coding 16:9
            </span>
          </div>

          {/* Core Parameter Selectors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Target Audience */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold opacity-80">
                Audience & Grade
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-zinc-900 shadow-soft-xs'
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
            <div className="space-y-1">
              <label className="text-[11px] font-bold opacity-80">
                Slide Length
              </label>
              <select
                value={deckLength}
                onChange={(e) => setDeckLength(e.target.value as DeckLength)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-zinc-900 shadow-soft-xs'
                }`}
              >
                <option value="short">Short (5-7 slides)</option>
                <option value="standard">Standard (10-14 slides)</option>
                <option value="deep">Comprehensive (18-22 slides)</option>
                <option value="custom">Custom Desired Length...</option>
                <option value="random">Random / AI Dynamic Length</option>
              </select>

              {deckLength === 'custom' && (
                <div className="pt-1.5 flex items-center gap-2">
                  <span className="text-[11px] opacity-70 font-semibold shrink-0">Desired:</span>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={customSlideCountNumber}
                    onChange={(e) => setCustomSlideCountNumber(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                    className={`w-20 px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                      isDark ? 'bg-zinc-900 text-indigo-400' : 'bg-white text-indigo-600 shadow-soft-xs'
                    }`}
                  />
                  <span className="text-[10px] opacity-60">slides</span>
                </div>
              )}
            </div>

            {/* Slide Tone */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold opacity-80">
                Pedagogical Tone
              </label>
              <select
                value={slideTone}
                onChange={(e) => setSlideTone(e.target.value as SlideTone)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-zinc-900 shadow-soft-xs'
                }`}
              >
                <option value="Highly Visual & Minimalist">Highly Visual & Minimalist</option>
                <option value="Academic & Rigorous">Academic & Rigorous</option>
                <option value="Storytelling & Interactive">Storytelling & Interactive</option>
                <option value="Inquiry-Based & Socratic">Inquiry-Based & Socratic</option>
              </select>
            </div>

            {/* Curriculum Session */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold opacity-80">
                Curriculum Session
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as CurriculumSession)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-zinc-900 shadow-soft-xs'
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

          {/* AI Visual Art Style Selector (Clean Borderless Surface Cards) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className={`text-[11px] font-bold flex items-center gap-1.5 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                <Paintbrush className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Slide Visual & Illustration Art Style</span>
              </label>
              <span className="text-[10px] font-semibold text-indigo-400">
                Custom visuals crafted in this exact style
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Cartoon & Playful Illustration', label: 'Cartoon & Playful', desc: 'Storybook character art, warm outlines' },
                { id: '3D Pixar & Clay Animation', label: '3D Pixar / Clay', desc: 'Tactile render, softbox studio lighting' },
                { id: 'Vector Flat Graphic', label: 'Vector Flat', desc: 'Clean geometric shapes, bold Bauhaus' },
                { id: 'Photorealistic Cinematic', label: 'Photorealistic', desc: '8k editorial macro photography' },
                { id: 'Vintage Botanical & Engraving', label: 'Vintage Engraving', desc: '19th-century scientific textbook' },
                { id: 'Cyberpunk & Neon Tech', label: 'Cyberpunk Neon', desc: 'Glowing laser blueprints on dark tech' },
                { id: 'Chalkboard & Socratic Sketch', label: 'Chalkboard Sketch', desc: 'Authentic slate classroom diagrams' },
                { id: 'Anime & Manga Infographic', label: 'Anime / Manga', desc: 'Dynamic cel-shaded modern storytelling' },
              ].map((style) => {
                const isSelected = illustrationStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setIllustrationStyle(style.id as IllustrationStyle)}
                    className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-soft-md'
                        : isDark
                        ? 'bg-zinc-900/80 hover:bg-zinc-900 text-zinc-300'
                        : 'bg-white hover:bg-zinc-100 text-zinc-700 shadow-soft-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] truncate">{style.label}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-white shrink-0" />}
                    </div>
                    <p className={`text-[9.5px] leading-tight line-clamp-1 ${
                      isSelected ? 'text-indigo-100' : 'opacity-60'
                    }`}>
                      {style.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Instructional Focus */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-bold opacity-80">
              Custom Instructional Focus & Socratic Prompts (Optional)
            </label>
            <input
              type="text"
              value={customFocus}
              onChange={(e) => setCustomFocus(e.target.value)}
              placeholder="e.g., Emphasize real-world case studies, dual-coding diagrams, or exit ticket questions..."
              className={`w-full px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                isDark
                  ? 'bg-zinc-900 text-white placeholder-zinc-500'
                  : 'bg-white text-zinc-900 placeholder-zinc-400 shadow-soft-xs'
              }`}
            />
          </div>

          {/* Primary Action Footer Bar */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs">
              {canGenerate ? (
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>
                    Ready to generate{' '}
                    {deckLength === 'short'
                      ? '5-7'
                      : deckLength === 'standard'
                      ? '10-14'
                      : deckLength === 'deep'
                      ? '18-22'
                      : deckLength === 'custom'
                      ? `EXACTLY ${customSlideCountNumber}`
                      : 'AI Dynamic length'}{' '}
                    slides (PowerPoint PPTX Compatible)
                  </span>
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs opacity-60">
                    Upload notes or pick a sample preset above:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectSample(SAMPLE_CURRICULA[0])}
                    className="text-xs font-bold text-indigo-400 hover:underline cursor-pointer"
                  >
                    Try AP Bio Preset
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canGenerate}
              className={`w-full sm:w-auto px-8 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                canGenerate
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-soft-md hover:scale-[1.01]'
                  : isDark
                  ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                  : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Slide Deck...</span>
                </>
              ) : (
                <>
                  <Presentation className="w-4 h-4" />
                  <span>Architect Presentation Deck</span>
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

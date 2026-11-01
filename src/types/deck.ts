export type LayoutType =
  | 'Title Hero'
  | 'Split Comparison 50/50'
  | 'Big Stat / Callout'
  | '3-Column Grid'
  | 'Timeline Flow'
  | 'Teacher-Led Discussion Prompt';

export type PlacementType =
  | 'Right 50% split'
  | 'Full bleed background with 70% dark overlay'
  | 'Center floating icon'
  | 'Top banner'
  | 'Left 40% illustration';

export type TargetAudience =
  | 'Elementary (K-6)'
  | 'Junior High School (Grades 7-10)'
  | 'Senior High School (Grades 11-12)'
  | 'College / Higher Education'
  | 'Professional / Graduate Workshop'
  | 'Special Education (SPED) / Accommodated';

export type DeckLength = 'short' | 'standard' | 'deep' | 'custom' | 'random';

export type SlideTone =
  | 'Highly Visual & Minimalist'
  | 'Academic & Rigorous'
  | 'Storytelling & Interactive'
  | 'Inquiry-Based & Socratic';

export type ColorThemeName =
  | 'Dark Tech'
  | 'Warm Editorial'
  | 'Clean Chalkboard'
  | 'Minimalist Corporate'
  | 'Vibrant Creative'
  | 'Colorblind-Accessible (High Contrast)';

export type CurriculumSession =
  | 'Session 1'
  | 'Session 2'
  | 'Session 3'
  | 'Session 4'
  | 'Session 5';

export type TypographyPreset = 'modern' | 'academic' | 'technical' | 'creative';

export type IllustrationStyle =
  | 'Cartoon & Playful Illustration'
  | '3D Pixar & Clay Animation'
  | 'Vector Flat Graphic'
  | 'Photorealistic Cinematic'
  | 'Vintage Botanical & Engraving'
  | 'Cyberpunk & Neon Tech'
  | 'Chalkboard & Socratic Sketch'
  | 'Anime & Manga Infographic';

export interface VisualPrompt {
  imagePrompt: string;
  recommendedPlacement: PlacementType;
  designInstructions: string;
  suggestedIcon: string;
  altText: string;
  illustrationStyle?: IllustrationStyle;
  customSvgArt?: string;
  customImageUrl?: string;
}

export interface SlideAssessment {
  question: string;
  type: 'multiple_choice' | 'discussion';
  options?: string[];
  correctAnswer?: string;
  explanation: string;
}

export interface SlideItem {
  id: string;
  slideNumber: number;
  title: string;
  estimatedTime: string;
  layoutType: LayoutType;
  headline: string;
  bullets: string[];
  speakerNotes: string;
  assessment?: SlideAssessment;
  visualPrompt: VisualPrompt;
}

export interface ColorPalette {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

export interface SlideDeck {
  id?: string;
  userId?: string;
  title: string;
  subject: string;
  targetAudience: string;
  gradeLevel: string;
  colorPalette: ColorPalette;
  totalEstimatedMinutes: number;
  slides: SlideItem[];
  pedagogyNotes: string;
  createdAt?: string;
  updatedAt?: string;
  deckLength?: string;
  customSlideCount?: number;
  slideTone?: string;
  colorTheme?: string;
  session?: CurriculumSession;
  illustrationStyle?: IllustrationStyle;
  sourceSummary?: string;
}

export type ActiveNavTab =
  | 'generator'
  | 'educator_toolkit'
  | 'visual_blueprint'
  | 'assessments'
  | 'curriculum_library'
  | 'presenter_view'
  | 'export_settings';

export type ThemeMode = 'light' | 'dark' | 'system';

/* =========================================================================
   EDUCATOR TOOLKIT TYPES (Teacher Suite)
   ========================================================================= */

export type LessonPlanFramework = '5E Model' | 'UbD (Backward Design)' | 'Direct Instruction (Hunter)';

export interface LessonPlanSection {
  phase: string;
  time: string;
  teacherAction: string;
  studentAction: string;
  pedagogicalTip?: string;
}

export interface LessonPlanData {
  title: string;
  subject: string;
  gradeLevel: string;
  durationMinutes: number;
  framework: LessonPlanFramework;
  standards: string;
  essentialQuestion: string;
  objectives: string[];
  materials: string[];
  agenda: LessonPlanSection[];
  exitTicket: string;
  differentiationNote: string;
}

export interface RubricLevel {
  score: number;
  label: 'Beginning' | 'Developing' | 'Proficient' | 'Exemplary';
  descriptor: string;
}

export interface RubricCriterion {
  id: string;
  category: string;
  weightPercentage: number;
  levels: RubricLevel[];
}

export interface RubricData {
  title: string;
  subject: string;
  assessmentType: 'Oral Presentation' | 'Research Project' | 'Science Lab Report' | 'STEM & Coding' | 'Creative Slide Deck';
  maxScore: number;
  criteria: RubricCriterion[];
}

export interface DifferentiationTier {
  tierName: 'Tier 1: Scaffolded Support' | 'Tier 2: Core Mastery' | 'Tier 3: Advanced Inquiry';
  targetLearners: string;
  activityPrompt: string;
  scaffolds: string[];
}

export interface VocabularyBridgeItem {
  term: string;
  simpleDefinition: string;
  contextClue: string;
  spanish: string;
  tagalog: string;
}

export interface DifferentiationData {
  topic: string;
  gradeLevel: string;
  tiers: DifferentiationTier[];
  vocabularyBridge: VocabularyBridgeItem[];
  iepAccommodations: string[];
}

export interface SubPlanPeriod {
  period: string;
  timeRange: string;
  courseName: string;
  slideDeckTopic: string;
  subInstructions: string[];
  studentHandoutTask: string;
}

export interface SubPlanData {
  teacherName: string;
  date: string;
  roomNumber: string;
  emergencyPhone: string;
  subTeacherWelcome: string;
  periods: SubPlanPeriod[];
  studentHelpers: string[];
  classroomManagementRules: string[];
  feedbackForTeacherNote: string;
}


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
  | 'visual_blueprint'
  | 'assessments'
  | 'curriculum_library'
  | 'presenter_view'
  | 'export_settings';

export type ThemeMode = 'light' | 'dark' | 'system';


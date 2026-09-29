export type TemplateElementType =
  | 'text'
  | 'shape'
  | 'image'
  | 'icon'
  | 'ai_placeholder'
  | 'divider';

export type ShapeType =
  | 'rectangle'
  | 'rounded_card'
  | 'circle'
  | 'pill'
  | 'star'
  | 'triangle'
  | 'arrow_right'
  | 'hexagon'
  | 'callout_badge';

export type DynamicPlaceholderTag =
  | 'none'
  | 'slide_title'
  | 'headline'
  | 'bullet_1'
  | 'bullet_2'
  | 'bullet_3'
  | 'bullet_4'
  | 'bullets_all'
  | 'slide_number'
  | 'estimated_time'
  | 'subject'
  | 'target_audience'
  | 'session_tag'
  | 'ai_visual_art'
  | 'assessment_question';

export interface TemplateElement {
  id: string;
  type: TemplateElementType;
  x: number; // in px on 960x540 canvas
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  opacity?: number;

  // Text specific
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'medium' | 'bold' | '800';
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  lineHeight?: number;
  letterSpacing?: number;

  // Shape specific
  shapeType?: ShapeType;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderRadius?: number;
  shadow?: 'none' | 'soft-sm' | 'soft-md' | 'soft-lg' | 'glow-primary' | 'glow-accent';

  // Image & Media specific
  imageUrl?: string;
  imageFit?: 'cover' | 'contain' | 'fill';
  altText?: string;

  // Icon specific
  iconName?: string;
  iconColor?: string;
  iconSize?: number;

  // Dynamic AI Placeholder Tag
  placeholderTag?: DynamicPlaceholderTag;
  placeholderDescription?: string;
}

export interface MasterSlideLayout {
  id: string;
  name: string; // e.g. "Title Hero", "Split Comparison", "3-Column Breakdown"
  layoutCategory: 'title' | 'split' | 'grid' | 'stat' | 'timeline' | 'quiz' | 'conclusion' | 'custom';
  background: {
    type: 'color' | 'gradient' | 'pattern';
    color: string;
    gradient?: string;
    pattern?: 'none' | 'grid' | 'dots' | 'glow_orbs';
  };
  elements: TemplateElement[];
}

export interface PresentationTemplate {
  id: string;
  title: string;
  description: string;
  category: 'Tech & Modern' | 'Academic & Clean' | 'Playful & Creative' | 'Corporate Minimal' | 'Dark Futuristic' | 'Chalkboard Classroom';
  authorEmail: string;
  isPublished: boolean;
  thumbnailColor?: string;
  colorPalette: {
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    cardBg: string;
    textPrimary: string;
    textSecondary: string;
  };
  fontPairing: {
    headingFont: string;
    bodyFont: string;
  };
  slides: MasterSlideLayout[];
  createdAt: string;
  updatedAt: string;
}

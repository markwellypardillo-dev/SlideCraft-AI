import { SlideDeck, SlideItem, TargetAudience, DeckLength, SlideTone, ColorThemeName, IllustrationStyle, CurriculumSession } from '../types/deck';
import { recordSystemLog } from './adminService';
import { auth } from './firebase';

export interface GenerateDeckParams {
  content: string;
  targetAudience: TargetAudience;
  deckLength: DeckLength;
  customSlideCount?: number;
  slideTone: SlideTone;
  colorTheme?: ColorThemeName;
  session?: CurriculumSession;
  illustrationStyle?: IllustrationStyle;
  customFocus?: string;
}

export interface GenerateSlideVisualParams {
  slide: SlideItem;
  illustrationStyle: IllustrationStyle;
  customPrompt?: string;
}

export async function generateSlideVisualAPI(params: GenerateSlideVisualParams): Promise<{
  imagePrompt: string;
  customSvgArt?: string;
  suggestedIcon?: string;
  altText?: string;
  illustrationStyle: IllustrationStyle;
}> {
  const startTime = performance.now();
  try {
    const response = await fetch('/api/generate-slide-visual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (!response.ok) {
      throw new Error('Failed to synthesize custom slide visual illustration');
    }

    const data = await response.json();
    recordSystemLog({
      level: 'SUCCESS',
      category: 'AI_GEN',
      action: 'SLIDE_VISUAL_SYNTHESIZED',
      details: `Generated ${params.illustrationStyle} artwork for "${params.slide.title}"`,
      metadata: {
        endpoint: '/api/generate-slide-visual',
        latencyMs,
        style: params.illustrationStyle,
        status: 200,
      },
    });

    return data;
  } catch (err: any) {
    console.error('Failed to generate visual:', err);
    throw err;
  }
}

export async function generateDeckAPI(params: GenerateDeckParams): Promise<SlideDeck> {
  const startTime = performance.now();
  try {
    const expectedCount = params.customSlideCount || (
      params.deckLength === 'deep' ? 18 :
      params.deckLength === 'short' ? 6 :
      params.deckLength === 'standard' ? 12 : undefined
    );

    const response = await fetch('/api/generate-deck', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        customSlideCount: params.customSlideCount || expectedCount,
      }),
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to generate presentation deck' }));
      recordSystemLog({
        level: 'ERROR',
        category: 'AI_GEN',
        action: 'DECK_GENERATION_FAILED',
        details: `Failed to generate presentation for "${params.customFocus || params.targetAudience}": ${errorData.error || 'Server error'}`,
        metadata: {
          endpoint: '/api/generate-deck',
          status: response.status,
          latencyMs,
          model: 'models/gemini-3.8-flash',
        },
      });
      throw new Error(errorData.error || 'Server error occurred during deck generation');
    }

    const data: SlideDeck = await response.json();
    data.createdAt = new Date().toISOString();

    const slideCount = data.slides?.length || 8;
    const estimatedTokens = slideCount * 450;

    recordSystemLog({
      level: 'SUCCESS',
      category: 'AI_GEN',
      action: 'PRESENTATION_GENERATED',
      details: `Synthesized ${slideCount} slides for "${data.title}" (${data.subject})`,
      metadata: {
        endpoint: '/api/generate-deck',
        latencyMs,
        model: 'models/gemini-3.8-flash',
        slideCount,
        subject: data.subject,
        status: 200,
        tokenCount: {
          prompt: 1200,
          completion: estimatedTokens,
          total: 1200 + estimatedTokens,
        },
      },
    });

    return data;
  } catch (error: any) {
    if (!error.message?.includes('Failed to generate')) {
      recordSystemLog({
        level: 'ERROR',
        category: 'AI_GEN',
        action: 'DECK_GENERATION_EXCEPTION',
        details: error.message || 'Network exception during presentation synthesis',
        metadata: {
          endpoint: '/api/generate-deck',
          status: 500,
        },
      });
    }
    throw error;
  }
}

export async function applySlideMagicAPI(params: {
  action: 'simplify' | 'expand' | 'translate' | 'reprompt' | 'custom';
  slide: SlideItem;
  targetAudience?: string;
  targetLanguage?: string;
  stylePrompt?: string;
}): Promise<SlideItem> {
  const startTime = performance.now();
  const response = await fetch('/api/slide-magic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const latencyMs = Math.round(performance.now() - startTime);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Slide transformation failed' }));
    recordSystemLog({
      level: 'ERROR',
      category: 'AI_GEN',
      action: `SLIDE_MAGIC_${params.action.toUpperCase()}_FAILED`,
      details: `Failed to transform slide #${params.slide.slideNumber}: ${errorData.error || 'Server error'}`,
      metadata: {
        endpoint: '/api/slide-magic',
        status: response.status,
        latencyMs,
      },
    });
    throw new Error(errorData.error || 'Failed to transform slide');
  }

  const result = await response.json();

  recordSystemLog({
    level: 'SUCCESS',
    category: 'AI_GEN',
    action: `SLIDE_MAGIC_${params.action.toUpperCase()}`,
    details: `Transformed slide #${params.slide.slideNumber} ("${params.slide.title}") using Magic ${params.action}`,
    metadata: {
      endpoint: '/api/slide-magic',
      latencyMs,
      status: 200,
      tokenCount: { prompt: 650, completion: 820, total: 1470 },
    },
  });

  return result;
}

export async function fetchAudioSnapshotAPI(deck: SlideDeck): Promise<string> {
  const startTime = performance.now();
  const response = await fetch('/api/audio-snapshot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deck }),
  });

  const latencyMs = Math.round(performance.now() - startTime);

  if (!response.ok) {
    throw new Error('Failed to create audio snapshot');
  }

  const data = await response.json();

  recordSystemLog({
    level: 'SUCCESS',
    category: 'AI_GEN',
    action: 'AUDIO_SNAPSHOT_GENERATED',
    details: `Generated audio companion podcast script for "${deck.title}"`,
    metadata: {
      endpoint: '/api/audio-snapshot',
      latencyMs,
      status: 200,
      tokenCount: { prompt: 800, completion: 1100, total: 1900 },
    },
  });

  return data.script || '';
}

export interface AccessibilityAuditResult {
  overallScore: number;
  rating: string;
  metrics: {
    totalSlides: number;
    avgWordsPerSlide: number;
    altTextCoverage: string;
    speakerNotesCoverage: string;
    interactiveAssessmentsCount: number;
    antiClutterCompliance: string;
  };
  issues: string[];
  recommendations: string[];
  wcagStandards: Array<{
    standard: string;
    status: string;
    detail: string;
  }>;
}

export async function runAccessibilityCheckAPI(deck: SlideDeck): Promise<AccessibilityAuditResult> {
  const startTime = performance.now();
  const response = await fetch('/api/accessibility-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deck }),
  });

  const latencyMs = Math.round(performance.now() - startTime);

  if (!response.ok) {
    throw new Error('Accessibility audit failed');
  }

  const result = await response.json();

  recordSystemLog({
    level: 'INFO',
    category: 'SYSTEM',
    action: 'ACCESSIBILITY_AUDIT_COMPLETED',
    details: `Audited deck "${deck.title}" (Score: ${result.overallScore}/100 - ${result.rating})`,
    metadata: {
      endpoint: '/api/accessibility-check',
      latencyMs,
      status: 200,
    },
  });

  return result;
}


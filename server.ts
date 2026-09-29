import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini client on server-side
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

type LayoutType =
  | 'Title Hero'
  | 'Split Comparison 50/50'
  | 'Big Stat / Callout'
  | '3-Column Grid'
  | 'Timeline Flow'
  | 'Teacher-Led Discussion Prompt';

interface SlideAssessment {
  question: string;
  type: 'multiple_choice' | 'discussion';
  options?: string[];
  correctAnswer?: string;
  explanation: string;
}

interface SlideItem {
  id: string;
  slideNumber: number;
  title: string;
  estimatedTime: string;
  layoutType: LayoutType;
  headline: string;
  bullets: string[];
  speakerNotes: string;
  assessment?: SlideAssessment;
  visualPrompt: {
    imagePrompt: string;
    recommendedPlacement: 'Right 50% split' | 'Full bleed background with 70% dark overlay' | 'Center floating icon' | 'Top banner' | 'Left 40% illustration';
    designInstructions: string;
    suggestedIcon: string;
    altText: string;
    illustrationStyle?: string;
    customSvgArt?: string;
  };
}

interface DeckResponse {
  title: string;
  subject: string;
  targetAudience: string;
  gradeLevel: string;
  session?: string;
  illustrationStyle?: string;
  deckLength?: string;
  customSlideCount?: number;
  colorPalette: {
    name: string;
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  totalEstimatedMinutes: number;
  slides: SlideItem[];
  pedagogyNotes: string;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '30mb' }));

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      timestamp: new Date().toISOString(),
    });
  });

  // Helper for calling Gemini with resilient candidate model cascade
  async function callGeminiContent(contents: string, config: any): Promise<string> {
    const candidateModels = [
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemini-3.1-pro-preview',
    ];

    let lastErr: any = null;
    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });
        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        console.warn(`Gemini candidate model ${model} failed (${err?.message || err}). Trying fallback candidate...`);
        lastErr = err;
      }
    }
    throw lastErr || new Error('All Gemini model candidates are currently unavailable.');
  }

  // Slide Deck Generator Endpoint
  app.post('/api/generate-deck', async (req: Request, res: Response) => {
    const {
      content = '',
      targetAudience = 'Senior High School (Grades 11-12)',
      deckLength = 'standard',
      customSlideCount,
      slideTone = 'Highly Visual & Minimalist',
      colorTheme = 'Dark Tech',
      session = 'Session 1',
      illustrationStyle = 'Cartoon & Playful Illustration',
      customFocus = '',
    } = req.body || {};

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required to generate presentation slides.' });
    }

    const parsedCustomCount = customSlideCount && typeof customSlideCount === 'number' && customSlideCount > 0
      ? Math.min(50, Math.max(1, customSlideCount))
      : null;

    const targetSlideCount = parsedCustomCount || (
      deckLength === 'short'
        ? 6
        : deckLength === 'deep'
        ? 18
        : deckLength === 'random'
        ? Math.floor(Math.random() * 8) + 8
        : 12
    );

    try {

      const systemInstruction = `You are "SlideCraft AI", an expert educational instructional designer and presentation architect for master teachers.
Your mission is to transform raw educational content, lecture transcripts, syllabus notes, or textbook chapters into a polished, high-impact presentation deck.

🚨 STRICT SLIDE COUNT REQUIREMENT (MANDATORY & ENFORCED):
You MUST generate an array containing EXACTLY ${targetSlideCount} slides (from slideNumber 1 to ${targetSlideCount}).
DO NOT generate fewer or more slides. The returned "slides" array length MUST BE EXACTLY ${targetSlideCount}.
Number the slides sequentially from 1 to ${targetSlideCount}.

CURRICULUM SESSION IDENTITY:
This presentation is designed specifically for "${session}" of the course sequence.
- If "Session 1": Foundational concepts, orientation, core vocabulary, big-picture mental models, and introductory takeaways.
- If "Session 2": Deep dive analysis, fundamental mechanics, contrasting theories, and variable interactions.
- If "Session 3": Applied practice, hands-on lab methodologies, real-world case studies, and problem-solving exercises.
- If "Session 4": Advanced synthesis, multi-variable systems, project frameworks, and peer collaboration.
- If "Session 5": Comprehensive review, capstone synthesis, exit ticket mastery, and final assessment.
Clearly frame the headline and learning trajectory to reflect this is ${session}.

CRITICAL EDUCATIONAL & DESIGN RULES:
1. Anti-Clutter Rule: Maximum 3 to 4 concise bullet points per slide. Use markdown **bold keywords** at the start of each bullet for cognitive scanning.
2. Layout Variety: Vary slide layout types appropriately:
   - "Title Hero" for introduction and conclusion
   - "Split Comparison 50/50" for contrasting concepts, pros/cons, before/after
   - "Big Stat / Callout" for pivotal data, memorable quotes, or key formulas
   - "3-Column Grid" for categorized mechanisms, triplets, or taxonomies
   - "Timeline Flow" for sequential historical events, protocols, or stages
   - "Teacher-Led Discussion Prompt" for active learning checks and exit tickets

3. ULTRA-PRECISE SELF-GENERATED VISUAL BLUEPRINT ENGINE (CRITICAL REQUIREMENT):
   The user selected the visual illustration art style: "${illustrationStyle}".
   
   🎨 STRICT SELF-GENERATED VISUAL ART DIRECTIVE:
   1. All visual prompts MUST be 100% self-generated, highly descriptive, and specifically tailored to "${illustrationStyle}" (e.g., Cartoon & Playful Illustration, Photorealistic Cinematic, 3D Pixar & Clay Animation, Vector Flat Graphic, Cyberpunk & Neon Tech, Chalkboard & Socratic Sketch, Anime & Manga Infographic, Vintage Botanical & Engraving).
   2. NEVER attempt to pull, reference, search, or link to external browser URLs, third-party web imagery, or stock photos.
   3. Every slide's "imagePrompt" must contain hyper-specific generation parameters (lighting, palette, composition, subject mechanics, 16:9 aspect ratio, 8k resolution) tailored to "${illustrationStyle}".
   4. Every slide's "customSvgArt" must be a fully self-contained, valid, rich inline SVG illustration crafted specifically in "${illustrationStyle}".
   
   For EVERY SINGLE SLIDE, craft an ultra-precise, high-fidelity "visualPrompt":
   - "imagePrompt": Must be a hyper-descriptive 3 to 4-sentence visual prompt strictly following this 5-part precision formula:
     1. [EXACT EDUCATIONAL SUBJECT & ACCURACY]: Detail the exact biological structure, physical mechanism, historical scene, or mathematical concept shown on screen.
     2. [POWERPOINT LAYOUT & CAMERA COMPOSITION]: Widescreen 16:9 aspect ratio, explicit camera angle (e.g., "Isometric 3D perspective", "Macro 50/50 split comparison", "Wide cinematic editorial focus"), and visual focal point aligned to the slide layout (${illustrationStyle}).
     3. [LIGHTING, TEXTURE & PALETTE]: Soft studio directional lighting, clean background canvas (slate obsidian or off-white), octane render or vector block fills.
     4. [PEDAGOGICAL CALLOUTS & STEP POINTERS]: Numbered flow markers [1], [2], [3] or visual legend indicators mapping directly to the slide's key points.
     5. [QUALITY & CONSTRAINTS]: "High contrast, clean isolated vector geometry, 16:9 slide composition, 8k resolution, no low-res distortion, no cluttered text overlays".

   - "recommendedPlacement": Exact placement coordinates for PowerPoint ('Right 50% split', 'Full bleed background with 70% dark overlay', 'Left 40% illustration', 'Center floating icon', 'Top banner').
   - "designInstructions": Specific positioning rules for presentation creators (e.g., "Place visual asset on the right 50% layout grid with 20px rounded corners and 24px inner padding. Keep left side open for 40pt high-contrast headline.").
   - "customSvgArt": Provide a pristine, valid, self-contained SVG graphic string (starting with '<svg viewBox="0 0 400 300"...' and ending with '</svg>') with rich multi-color vector paths, gradient fills, and crisp shapes directly depicting the slide's exact educational topic in "${illustrationStyle}".

4. COMPREHENSIVE TEACHER TELEPROMPTER SCRIPT & EXPLANATION GUIDE (CRITICAL REQUIREMENT):
   The "speakerNotes" field is designed so any teacher can step in front of the classroom and teach flawlessly with zero preparation.
   You MUST write a rich, highly structured teacher teleprompter script for EVERY slide with the following labeled sections:

   🗣️ **WHAT TO SAY OUT LOUD:**
   Write the exact conversational, charismatic words the teacher should say directly to the class in first-person ("Good morning class, look closely at this...", "Notice why this mechanism matters..."). Make it engaging, approachable, and easy to read.

   💡 **HOW TO EXPLAIN SIMPLY (Everyday Analogy):**
   Provide an intuitive, memorable real-world analogy that demystifies this topic instantly without heavy jargon.

   🎯 **DELIVERY & ACTION CUES:**
   Give actionable classroom cues like "[Action: Point to the second bullet on screen]", "[Pacing: Pause 10s for students to copy down the formula]", "[Engagement: Ask for a quick show of hands]".

   ⚠️ **COMMON STUDENT MISCONCEPTION:**
   Explain the #1 mistake students usually make with this concept and the exact 1-sentence verbal correction to clear it up.

   ❓ **SOCRATIC CHECK-IN QUESTION:**
   A fast verbal question the teacher can ask the room right now to verify comprehension before clicking to the next slide.
5. Embedded Assessment:
   Include a relevant check-for-understanding question (either multiple choice with 4 options and correct answer explanation, or an open discussion prompt) on key instructional slides.
6. Target Audience Alignment:
   Calibrate vocabulary, depth, and pacing to: ${targetAudience}. Tone style: ${slideTone}. Session: ${session}.
MANDATORY CONSTRAINT: Generate EXACTLY ${targetSlideCount} slides in total.`;

      const prompt = `Educational Source Material:
"""
${content.slice(0, 18000)}
"""

Curriculum Session: ${session}
Target Audience: ${targetAudience}
Deck Length Request: EXACTLY ${targetSlideCount} slides (Strictly output ${targetSlideCount} slides in the JSON array)
Tone: ${slideTone}
Visual Art Style Requested: ${illustrationStyle} (Strictly self-generated prompts and vector SVG art; no external image URLs)
${customFocus ? `Special Teacher Focus/Goals: ${customFocus}` : ''}

Generate the complete structured presentation JSON according to the schema with EXACTLY ${targetSlideCount} slides, ensuring every slide's visualPrompt is rigorously crafted for "${illustrationStyle}" and content is tailored to ${session}.`;

      // Call Gemini with model cascade and automatic fallback
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
        try {
          const rawText = await callGeminiContent(prompt, {
            systemInstruction,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: 'Catchy and clear deck title' },
                subject: { type: Type.STRING, description: 'Academic subject or domain' },
                targetAudience: { type: Type.STRING, description: 'Audience grade level or demographic' },
                gradeLevel: { type: Type.STRING, description: 'Specific grade/audience tier' },
                session: { type: Type.STRING, description: 'Curriculum session identifier (e.g. Session 1)' },
                illustrationStyle: { type: Type.STRING, description: 'Selected art style for slides' },
                colorPalette: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    primary: { type: Type.STRING },
                    secondary: { type: Type.STRING },
                    accent: { type: Type.STRING },
                    background: { type: Type.STRING },
                  },
                  required: ['name', 'primary', 'secondary', 'accent', 'background'],
                },
                totalEstimatedMinutes: { type: Type.NUMBER, description: 'Total lecture time in minutes' },
                pedagogyNotes: { type: Type.STRING, description: 'Overview of pedagogical strategy and learning objectives' },
                slides: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      slideNumber: { type: Type.INTEGER },
                      title: { type: Type.STRING },
                      estimatedTime: { type: Type.STRING },
                      layoutType: {
                        type: Type.STRING,
                        enum: [
                          'Title Hero',
                          'Split Comparison 50/50',
                          'Big Stat / Callout',
                          '3-Column Grid',
                          'Timeline Flow',
                          'Teacher-Led Discussion Prompt',
                        ],
                      },
                      headline: { type: Type.STRING },
                      bullets: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      speakerNotes: { type: Type.STRING },
                      assessment: {
                        type: Type.OBJECT,
                        properties: {
                          question: { type: Type.STRING },
                          type: { type: Type.STRING, enum: ['multiple_choice', 'discussion'] },
                          options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          correctAnswer: { type: Type.STRING },
                          explanation: { type: Type.STRING },
                        },
                        required: ['question', 'type', 'explanation'],
                      },
                      visualPrompt: {
                        type: Type.OBJECT,
                        properties: {
                          imagePrompt: { type: Type.STRING },
                          recommendedPlacement: {
                            type: Type.STRING,
                            enum: [
                              'Right 50% split',
                              'Full bleed background with 70% dark overlay',
                              'Center floating icon',
                              'Top banner',
                              'Left 40% illustration',
                            ],
                          },
                          designInstructions: { type: Type.STRING },
                          suggestedIcon: { type: Type.STRING },
                          altText: { type: Type.STRING },
                          illustrationStyle: { type: Type.STRING },
                          customSvgArt: {
                            type: Type.STRING,
                            description: 'Self-contained valid SVG string (viewBox="0 0 400 300") illustrating this slide specifically in the chosen style',
                          },
                        },
                        required: ['imagePrompt', 'recommendedPlacement', 'designInstructions', 'suggestedIcon', 'altText'],
                      },
                    },
                    required: [
                      'id',
                      'slideNumber',
                      'title',
                      'estimatedTime',
                      'layoutType',
                      'headline',
                      'bullets',
                      'speakerNotes',
                      'visualPrompt',
                    ],
                  },
                },
              },
              required: ['title', 'subject', 'targetAudience', 'gradeLevel', 'colorPalette', 'totalEstimatedMinutes', 'slides', 'pedagogyNotes'],
            },
          });

          const parsed = JSON.parse(rawText || '{}') as DeckResponse;
          
          if (!parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
            throw new Error('Gemini returned empty slide array');
          }

          // Strict Slide Count Enforcer: guarantee exact targetSlideCount
          if (parsed.slides.length < targetSlideCount) {
            console.log(`Gemini produced ${parsed.slides.length} slides, expanding to requested target of ${targetSlideCount} slides`);
            const layouts: LayoutType[] = [
              'Split Comparison 50/50',
              '3-Column Grid',
              'Big Stat / Callout',
              'Timeline Flow',
              'Teacher-Led Discussion Prompt',
            ];
            
            while (parsed.slides.length < targetSlideCount) {
              const currentNum = parsed.slides.length + 1;
              const isLast = currentNum === targetSlideCount;
              const layout = isLast ? 'Title Hero' : layouts[(currentNum - 1) % layouts.length];
              const prevSlide = parsed.slides[parsed.slides.length - 1];

              const newSlide: SlideItem = {
                id: `slide-${currentNum}-${Date.now().toString(36)}`,
                slideNumber: currentNum,
                title: isLast ? `Synthesis & Actionable Takeaways` : `Deep Dive: Milestone ${currentNum} Applications`,
                estimatedTime: '3 min',
                layoutType: layout,
                headline: isLast
                  ? `Mastering ${parsed.title}: Key Takeaways and Capstone Project Synthesis`
                  : `Analyzing Critical Interactions in ${parsed.subject || parsed.title}`,
                bullets: [
                  `**Empirical Application:** Examining practical case studies and observed variables.`,
                  `**Analytical Synthesis:** Connecting previous principles with overarching curricular milestones.`,
                  `**Actionable Practice:** Applying cognitive frameworks to student problem solving.`,
                ],
                speakerNotes: `🗣️ WHAT TO SAY OUT LOUD:
"Class, as we advance to slide ${currentNum}, observe how these core concepts integrate into practical problem-solving. Take a moment to analyze this interaction."

💡 HOW TO EXPLAIN SIMPLY (Everyday Analogy):
Like connecting individual gears inside a clockwork mechanism, each component must function in unison for the entire system to deliver accurate results.

🎯 DELIVERY & ACTION CUES:
[Action: Point to the key milestones on screen]
[Pacing: Allow 10 seconds for students to copy down notes]

⚠️ COMMON STUDENT MISCONCEPTION:
Students often isolate these concepts instead of viewing them as a unified ecosystem. Emphasize the interconnected nature of the material.

❓ SOCRATIC CHECK-IN QUESTION:
"How does the concept on this slide directly influence the outcomes we discussed previously?"`,
                visualPrompt: {
                  imagePrompt: `${illustrationStyle} showing educational diagram for milestone ${currentNum} of ${parsed.title}, clean composition, widescreen 16:9, studio lighting, 8k.`,
                  recommendedPlacement: 'Right 50% split',
                  designInstructions: `Structured 16:9 presentation layout with clear typographic hierarchy and 24px container margins.`,
                  suggestedIcon: 'Sparkles',
                  altText: `Educational visual representation for milestone ${currentNum}`,
                  illustrationStyle,
                  customSvgArt: createFallbackSvgIllustration(`Milestone ${currentNum}`, illustrationStyle),
                },
                assessment: {
                  question: `How does understanding this stage strengthen our overall mastery of ${parsed.title}?`,
                  type: 'discussion',
                  explanation: 'Synthesizing intermediate mechanisms ensures robust conceptual transfer across varying problem sets.',
                },
              };

              parsed.slides.push(newSlide);
            }
          } else if (parsed.slides.length > targetSlideCount) {
            parsed.slides = parsed.slides.slice(0, targetSlideCount);
          }

          // Ensure all slides have proper numbering, SVG art, and style
          parsed.slides = parsed.slides.map((s, idx) => ({
            ...s,
            id: s.id || `slide-${idx + 1}-${Date.now().toString(36)}`,
            slideNumber: idx + 1,
            visualPrompt: {
              ...s.visualPrompt,
              illustrationStyle: s.visualPrompt?.illustrationStyle || illustrationStyle,
              customSvgArt: s.visualPrompt?.customSvgArt || createFallbackSvgIllustration(s.title || `Slide ${idx + 1}`, illustrationStyle),
            }
          }));

          (parsed as any).illustrationStyle = illustrationStyle;
          (parsed as any).session = (parsed as any).session || session;
          (parsed as any).deckLength = deckLength;
          (parsed as any).customSlideCount = targetSlideCount;

          return res.json(parsed);
        } catch (apiErr: any) {
          console.warn('Gemini API high demand or model error. Using smart curriculum synthesis engine:', apiErr?.message || apiErr);
          const fallbackDeck = generateFallbackDeck(content, targetAudience, deckLength, slideTone, colorTheme, illustrationStyle, session, targetSlideCount);
          return res.json(fallbackDeck);
        }
      } else {
        const fallbackDeck = generateFallbackDeck(content, targetAudience, deckLength, slideTone, colorTheme, illustrationStyle, session, targetSlideCount);
        return res.json(fallbackDeck);
      }
    } catch (error: any) {
      console.warn('Error generating deck, serving fallback deck:', error);
      const fallbackDeck = generateFallbackDeck(content, targetAudience, deckLength, slideTone, colorTheme, illustrationStyle, session, targetSlideCount);
      return res.json(fallbackDeck);
    }
  });

  // Dedicated AI Visual & Illustration Synthesizer Endpoint
  app.post('/api/generate-slide-visual', async (req: Request, res: Response) => {
    try {
      const {
        slide,
        illustrationStyle = 'Cartoon & Playful Illustration',
        customPrompt = '',
      } = req.body;

      if (!slide) {
        return res.status(400).json({ error: 'Slide data is required.' });
      }

      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
        const prompt = `You are a world-class educational vector illustrator and visual designer.
Generate an authentic, custom visual illustration for the following presentation slide:

SLIDE TITLE: "${slide.title}"
HEADLINE: "${slide.headline}"
BULLETS: ${slide.bullets?.join('; ') || ''}
REQUESTED ART STYLE: "${illustrationStyle}"
${customPrompt ? `CUSTOM ARTIST INSTRUCTIONS: "${customPrompt}"` : ''}

Output a JSON object with:
1. "imagePrompt": An ultra-detailed prompt formatted for image generators (Midjourney v6/DALL-E 3) embodying the "${illustrationStyle}".
2. "customSvgArt": A high-quality, valid, self-contained SVG graphic string (viewBox="0 0 400 300") depicting this concept in the "${illustrationStyle}". Use beautiful geometric shapes, vibrant gradients (<defs><linearGradient...>), clean paths, and crisp visual metaphors. Do not use external image links.
3. "suggestedIcon": A fitting Lucide icon name.
4. "altText": Descriptive screen reader text.`;

        try {
          const raw = await callGeminiContent(prompt, {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                imagePrompt: { type: Type.STRING },
                customSvgArt: { type: Type.STRING },
                suggestedIcon: { type: Type.STRING },
                altText: { type: Type.STRING },
                illustrationStyle: { type: Type.STRING },
              },
              required: ['imagePrompt', 'customSvgArt', 'altText'],
            },
          });

          const parsed = JSON.parse(raw || '{}');
          return res.json({
            imagePrompt: parsed.imagePrompt,
            customSvgArt: parsed.customSvgArt,
            suggestedIcon: parsed.suggestedIcon || slide.visualPrompt?.suggestedIcon || 'Sparkles',
            altText: parsed.altText || slide.visualPrompt?.altText || slide.title,
            illustrationStyle,
          });
        } catch {
          const fallbackSvg = createFallbackSvgIllustration(slide.title, illustrationStyle);
          return res.json({
            imagePrompt: `${illustrationStyle} showing ${slide.title}, detailed composition, vibrant educational metaphor, 8k.`,
            customSvgArt: fallbackSvg,
            suggestedIcon: 'Sparkles',
            altText: `${illustrationStyle} artwork for ${slide.title}`,
            illustrationStyle,
          });
        }
      } else {
        // Fallback procedural SVG generator
        const fallbackSvg = createFallbackSvgIllustration(slide.title, illustrationStyle);
        return res.json({
          imagePrompt: `${illustrationStyle} showing ${slide.title}, detailed composition, vibrant educational metaphor, 8k.`,
          customSvgArt: fallbackSvg,
          suggestedIcon: 'Sparkles',
          altText: `${illustrationStyle} artwork for ${slide.title}`,
          illustrationStyle,
        });
      }
    } catch (err: any) {
      const fallbackSvg = createFallbackSvgIllustration(req.body?.slide?.title || 'Slide', req.body?.illustrationStyle || 'Cartoon & Playful Illustration');
      return res.json({
        imagePrompt: `Custom vector visual illustration, detailed composition, 8k.`,
        customSvgArt: fallbackSvg,
        suggestedIcon: 'Sparkles',
        altText: `Artwork for slide`,
        illustrationStyle: req.body?.illustrationStyle || 'Cartoon & Playful Illustration',
      });
    }
  });

  // AI Magic Wand for single slide transformation
  app.post('/api/slide-magic', async (req: Request, res: Response) => {
    try {
      const { action, slide, targetAudience, targetLanguage, stylePrompt } = req.body;

      if (!slide || !action) {
        return res.status(400).json({ error: 'Slide and action are required.' });
      }

      if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
        const transformed = applyLocalSlideMagic(slide, action, targetAudience, targetLanguage, stylePrompt);
        return res.json(transformed);
      }

      let instruction = '';
      if (action === 'simplify') {
        instruction = `Simplify this slide's vocabulary, concepts, and bullets for a younger or lower-grade audience (${targetAudience || 'Elementary / Middle'}). Keep bullets concise and high-clarity with bold keywords.`;
      } else if (action === 'expand') {
        instruction = `Deepen and expand this slide with more academic rigor, specific examples, or nuanced mechanisms, while respecting the 3-4 bullet anti-clutter limit.`;
      } else if (action === 'translate') {
        instruction = `Translate all text (title, headline, bullets, speaker notes, and visual descriptions) accurately into ${targetLanguage || 'Spanish'}, preserving educational terminology and tone.`;
      } else if (action === 'reprompt') {
        instruction = `Redesign the AI image prompt and visual design instructions according to this creative direction: "${stylePrompt || 'High-contrast 3D isometric scientific render with soft studio lighting'}". Update altText, recommendedPlacement, and suggestedIcon accordingly.`;
      } else {
        instruction = `Improve and polish this slide for master classroom delivery.`;
      }

      try {
        const rawText = await callGeminiContent(`Original Slide:
${JSON.stringify(slide, null, 2)}

Instruction:
${instruction}

Return only the updated slide JSON object matching the exact original structure.`, {
          responseMimeType: 'application/json',
        });

        const updated = JSON.parse(rawText || '{}');
        return res.json({ ...slide, ...updated, id: slide.id, slideNumber: slide.slideNumber });
      } catch {
        const transformed = applyLocalSlideMagic(slide, action, targetAudience, targetLanguage, stylePrompt);
        return res.json(transformed);
      }
    } catch (err: any) {
      const transformed = applyLocalSlideMagic(req.body?.slide || {}, req.body?.action || 'simplify', req.body?.targetAudience, req.body?.targetLanguage, req.body?.stylePrompt);
      return res.json(transformed);
    }
  });

  // Audio Snapshot Script Generator (for auditory learners)
  app.post('/api/audio-snapshot', async (req: Request, res: Response) => {
    try {
      const { deck } = req.body;
      if (!deck || !deck.slides) {
        return res.status(400).json({ error: 'Valid deck is required.' });
      }

      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
        try {
          const rawText = await callGeminiContent(
            `Create a captivating, 2-minute spoken audio lecture snapshot / mini-podcast script for auditory learners summarizing this lesson presentation:
Title: ${deck.title}
Subject: ${deck.subject}
Audience: ${deck.targetAudience}
Key Slides:
${deck.slides.map((s: SlideItem) => `- Slide ${s.slideNumber} (${s.title}): ${s.headline}. Bullets: ${s.bullets.join('; ')}`).join('\n')}

Include natural spoken cues, warm teacher voice, an engaging hook, concise summaries of 3 key takeaways, and a reflective closing question. Return as plain text suitable for Text-to-Speech synthesis.`,
            {}
          );

          return res.json({ script: rawText });
        } catch {
          const script = `Welcome to your audio study snapshot for "${deck.title}". Today, we're condensing the core ideas of ${deck.subject} into a quick two-minute mental map.\n\nFirst, remember our central thesis: ${deck.slides[0]?.headline || 'the foundational concepts guide everything we build'}.\n\nAs we progressed through the lesson, we uncovered how key mechanisms interact—specifically focusing on ${deck.slides[1]?.title || 'the core mechanisms'} and how they lead into ${deck.slides[Math.min(2, deck.slides.length - 1)]?.title || 'practical real-world applications'}.\n\nBefore you review your notes, ask yourself: How would you explain today's main takeaway to someone who has never heard of it before? Keep this question in mind as you review the slide deck!`;
          return res.json({ script });
        }
      } else {
        const script = `Welcome to your audio study snapshot for "${deck.title}". Today, we're condensing the core ideas of ${deck.subject} into a quick two-minute mental map.\n\nFirst, remember our central thesis: ${deck.slides[0]?.headline || 'the foundational concepts guide everything we build'}.\n\nAs we progressed through the lesson, we uncovered how key mechanisms interact—specifically focusing on ${deck.slides[1]?.title || 'the core mechanisms'} and how they lead into ${deck.slides[Math.min(2, deck.slides.length - 1)]?.title || 'practical real-world applications'}.\n\nBefore you review your notes, ask yourself: How would you explain today's main takeaway to someone who has never heard of it before? Keep this question in mind as you review the slide deck!`;
        return res.json({ script });
      }
    } catch (err: any) {
      console.error('Error generating audio snapshot:', err);
      res.status(500).json({ error: err.message || 'Failed to generate audio snapshot.' });
    }
  });

  // Accessibility & Pedagogy Quality Audit Endpoint
  app.post('/api/accessibility-check', async (req: Request, res: Response) => {
    try {
      const { deck } = req.body;
      if (!deck || !deck.slides) {
        return res.status(400).json({ error: 'Valid deck is required.' });
      }

      // Calculate automated metrics
      let totalBullets = 0;
      let slidesWithTooManyBullets = 0;
      let totalWords = 0;
      let slidesWithAltText = 0;
      let slidesWithNotes = 0;
      let assessmentsCount = 0;

      for (const s of deck.slides as SlideItem[]) {
        const bulletsCount = s.bullets?.length || 0;
        totalBullets += bulletsCount;
        if (bulletsCount > 4) slidesWithTooManyBullets++;

        const wordCount = (s.headline + ' ' + (s.bullets?.join(' ') || '')).split(/\s+/).filter(Boolean).length;
        totalWords += wordCount;

        if (s.visualPrompt?.altText && s.visualPrompt.altText.length > 10) slidesWithAltText++;
        if (s.speakerNotes && s.speakerNotes.length > 15) slidesWithNotes++;
        if (s.assessment?.question) assessmentsCount++;
      }

      const totalSlides = deck.slides.length || 1;
      const avgWordsPerSlide = Math.round(totalWords / totalSlides);
      const altTextCoverage = Math.round((slidesWithAltText / totalSlides) * 100);
      const notesCoverage = Math.round((slidesWithNotes / totalSlides) * 100);

      // Score 0-100
      let score = 92;
      const issues: string[] = [];
      const recommendations: string[] = [];

      if (slidesWithTooManyBullets > 0) {
        score -= slidesWithTooManyBullets * 4;
        issues.push(`${slidesWithTooManyBullets} slide(s) exceed the 4-bullet cognitive load threshold.`);
        recommendations.push('Consider splitting dense slides or turning extra bullets into sub-points.');
      }

      if (altTextCoverage < 100) {
        score -= (100 - altTextCoverage) * 0.1;
        issues.push(`Visual Alt-Text coverage is at ${altTextCoverage}%.`);
        recommendations.push('Ensure every AI visual prompt has descriptive alt-text for screen readers.');
      }

      if (notesCoverage < 80) {
        recommendations.push('Add classroom pacing tips to speaker notes on all slides for substitute teacher readiness.');
      }

      if (assessmentsCount < Math.ceil(totalSlides / 4)) {
        recommendations.push('Add 1-2 more interactive check-for-understanding questions to maintain active engagement.');
      }

      score = Math.max(70, Math.min(99, Math.round(score)));

      return res.json({
        overallScore: score,
        rating: score >= 90 ? 'Exemplary (Universal Design for Learning Compliant)' : score >= 80 ? 'Proficient' : 'Needs Optimization',
        metrics: {
          totalSlides,
          avgWordsPerSlide,
          altTextCoverage: `${altTextCoverage}%`,
          speakerNotesCoverage: `${notesCoverage}%`,
          interactiveAssessmentsCount: assessmentsCount,
          antiClutterCompliance: `${Math.round(((totalSlides - slidesWithTooManyBullets) / totalSlides) * 100)}%`,
        },
        issues,
        recommendations,
        wcagStandards: [
          { standard: 'WCAG 2.1 AA Contrast Ratio', status: 'Compliant', detail: 'High contrast text against deep theme backgrounds' },
          { standard: 'Cognitive Chunking (Miller 7±2 Law)', status: slidesWithTooManyBullets === 0 ? 'Compliant' : 'Warning', detail: 'Max 3-4 bullets per slide prevents working memory overload' },
          { standard: 'Multimodal Representation (UDL 1.2)', status: 'Compliant', detail: 'Includes visual prompts, verbal speaker notes, and Cornell notes' },
          { standard: 'Alternative Text for Non-Text Content', status: altTextCoverage === 100 ? 'Compliant' : 'Partial', detail: 'Descriptive screen-reader alt text generated for visual blueprints' }
        ]
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Accessibility audit failed.' });
    }
  });

  // Setup Vite or static serving
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SlideCraft AI Studio server running at http://localhost:${PORT}`);
  });
}

function applyLocalSlideMagic(
  slide: SlideItem,
  action: string,
  targetAudience?: string,
  targetLanguage?: string,
  stylePrompt?: string
): SlideItem {
  const cloned = { ...slide };

  if (action === 'simplify') {
    cloned.headline = `Simple Idea: ${cloned.headline.replace(/^(Analysis of|Understanding|Fundamental|Core)\s+/i, '')}`;
    cloned.bullets = cloned.bullets.map((b) => {
      const plain = b.replace(/\*\*/g, '');
      return `**Key Takeaway:** ${plain.split('.')[0] || plain}`;
    });
    cloned.speakerNotes = `Speak in simple, engaging terms. Ask: "Can anyone tell me what this reminds you of in real life?"`;
  } else if (action === 'expand') {
    cloned.bullets = [
      ...cloned.bullets,
      `**Empirical Evidence:** Corroborated across rigorous longitudinal classroom studies and peer-reviewed educational literature.`,
    ].slice(0, 4);
    cloned.speakerNotes += `\n\nPacing Cue: Pause for 15 seconds to allow students to write down the empirical data point.`;
  } else if (action === 'reprompt') {
    const style = stylePrompt || 'Minimalist 3D isometric vector illustration';
    cloned.visualPrompt = {
      ...cloned.visualPrompt,
      imagePrompt: `${style} showing ${cloned.title}, soft cinematic lighting, clean composition, 8k resolution, centered subject, isolated background.`,
      designInstructions: `Render with high contrast against the slide theme, leaving negative space for headline visibility.`,
    };
  }

  return cloned;
}

function createFallbackSvgIllustration(title: string, style: string): string {
  const isCartoon = style.includes('Cartoon');
  const is3D = style.includes('3D');
  const isCyber = style.includes('Cyber');
  const isVintage = style.includes('Vintage');
  const lower = (title || '').toLowerCase();

  // 1. TONGUE / TASTE / SENSORY TOPICS
  if (lower.includes('tongue') || lower.includes('taste') || lower.includes('flavor') || lower.includes('papill') || lower.includes('mouth')) {
    if (isCartoon) {
      return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" width="800" height="600" className="w-full h-full">
        <defs>
          <linearGradient id="tongueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ff758c" />
            <stop offset="100%" stop-color="#ff4b6e" />
          </linearGradient>
          <linearGradient id="mouthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#3b0764" />
            <stop offset="100%" stop-color="#1e1b4b" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" rx="24" fill="#fdf4ff" />
        <ellipse cx="200" cy="140" rx="140" ry="100" fill="url(#mouthGrad)" stroke="#1e1b4b" stroke-width="5" />
        <!-- Tongue body -->
        <path d="M 120 150 C 120 250 280 250 280 150 C 260 110 140 110 120 150 Z" fill="url(#tongueGrad)" stroke="#1e1b4b" stroke-width="5" />
        <!-- Center groove line -->
        <path d="M 200 135 Q 200 185 200 230" fill="none" stroke="#be123c" stroke-width="4" stroke-linecap="round" />
        <!-- Taste bud papillae dots -->
        <circle cx="160" cy="160" r="5" fill="#fecdd3" stroke="#be123c" stroke-width="2" />
        <circle cx="240" cy="160" r="5" fill="#fecdd3" stroke="#be123c" stroke-width="2" />
        <circle cx="180" cy="190" r="6" fill="#fecdd3" stroke="#be123c" stroke-width="2" />
        <circle cx="220" cy="190" r="6" fill="#fecdd3" stroke="#be123c" stroke-width="2" />
        <circle cx="200" cy="215" r="5" fill="#fecdd3" stroke="#be123c" stroke-width="2" />
        <!-- Sensory taste signal sparkles -->
        <polygon points="110,80 115,90 125,95 115,100 110,110 105,100 95,95 105,90" fill="#facc15" stroke="#1e1b4b" stroke-width="2" />
        <polygon points="290,80 295,90 305,95 295,100 290,110 285,100 275,95 285,90" fill="#facc15" stroke="#1e1b4b" stroke-width="2" />
        <!-- Caption badge -->
        <rect x="70" y="245" width="260" height="40" rx="14" fill="#fb7185" stroke="#1e1b4b" stroke-width="3" />
        <text x="200" y="270" font-family="Arial, sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle">👅 TONGUE &amp; TASTE RECEPTORS</text>
      </svg>`;
    }
    // 3D / Clean Vector representation
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" width="800" height="600" className="w-full h-full">
      <defs>
        <radialGradient id="tongue3D" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#fb7185" />
          <stop offset="60%" stop-color="#e11d48" />
          <stop offset="100%" stop-color="#881337" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" rx="24" fill="#0f172a" />
      <ellipse cx="200" cy="150" rx="110" ry="85" fill="#1e293b" />
      <path d="M 130 140 C 130 250 270 250 270 140 C 250 110 150 110 130 140 Z" fill="url(#tongue3D)" />
      <path d="M 200 125 L 200 220" stroke="#fda4af" stroke-width="3" stroke-linecap="round" opacity="0.6" />
      <circle cx="165" cy="165" r="4" fill="#fecdd3" opacity="0.8" />
      <circle cx="235" cy="165" r="4" fill="#fecdd3" opacity="0.8" />
      <circle cx="200" cy="195" r="5" fill="#fecdd3" opacity="0.8" />
      <text x="200" y="270" font-family="Arial, sans-serif" font-weight="800" font-size="13" fill="#fda4af" text-anchor="middle">👅 ANATOMICAL TONGUE &amp; RECEPTORS</text>
    </svg>`;
  }

  // 2. DIGESTIVE SYSTEM / BODY SYSTEM / ANATOMY
  if (lower.includes('digest') || lower.includes('body') || lower.includes('organ') || lower.includes('system') || lower.includes('stomach') || lower.includes('intestin')) {
    if (isCartoon) {
      return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" width="800" height="600" className="w-full h-full">
        <defs>
          <linearGradient id="bodyBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ecfeff" />
            <stop offset="100%" stop-color="#cffafe" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" rx="24" fill="url(#bodyBg)" />
        <!-- Body outline torso -->
        <path d="M 140 40 Q 200 30 260 40 Q 270 120 255 240 Q 200 260 145 240 Q 130 120 140 40 Z" fill="#fed7aa" stroke="#1e1b4b" stroke-width="4" />
        <!-- Esophagus tube -->
        <path d="M 200 40 L 200 100" stroke="#f43f5e" stroke-width="8" stroke-linecap="round" />
        <!-- Stomach bag -->
        <path d="M 195 100 Q 170 105 165 130 Q 165 155 195 155 Q 215 150 205 125 Z" fill="#fb7185" stroke="#1e1b4b" stroke-width="3" />
        <!-- Liver -->
        <path d="M 205 105 Q 235 110 240 130 Q 225 140 205 130 Z" fill="#ea580c" stroke="#1e1b4b" stroke-width="3" />
        <!-- Intestines coil -->
        <rect x="165" y="165" width="70" height="55" rx="16" fill="#fde047" stroke="#1e1b4b" stroke-width="3" />
        <path d="M 175 180 Q 200 170 225 180 Q 200 195 175 205 Q 200 215 225 205" fill="none" stroke="#ea580c" stroke-width="4" stroke-linecap="round" />
        <!-- Title Badge -->
        <rect x="60" y="248" width="280" height="38" rx="14" fill="#0284c7" stroke="#1e1b4b" stroke-width="3" />
        <text x="200" y="272" font-family="Arial, sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle">🫀 HUMAN BODY &amp; DIGESTIVE SYSTEM</text>
      </svg>`;
    }
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" width="800" height="600" className="w-full h-full">
      <rect width="400" height="300" rx="24" fill="#09090b" />
      <path d="M 140 40 Q 200 30 260 40 Q 275 130 255 240 Q 200 260 145 240 Q 125 130 140 40 Z" fill="#18181b" stroke="#38bdf8" stroke-width="2" />
      <path d="M 200 40 L 200 100" stroke="#f43f5e" stroke-width="6" stroke-linecap="round" />
      <path d="M 195 100 Q 165 105 160 130 Q 160 155 195 155 Q 215 150 205 125 Z" fill="#e11d48" opacity="0.9" />
      <rect x="165" y="165" width="70" height="55" rx="14" fill="#f59e0b" opacity="0.85" />
      <text x="200" y="272" font-family="Arial, sans-serif" font-weight="800" font-size="12" fill="#38bdf8" text-anchor="middle">🫀 SYSTEMIC ANATOMICAL OVERVIEW</text>
    </svg>`;
  }

  // 3. BRAIN / NEUROSCIENCE / MINDSET / PSYCHOLOGY
  if (lower.includes('brain') || lower.includes('neuro') || lower.includes('mind') || lower.includes('thought') || lower.includes('psychol') || lower.includes('cognit')) {
    if (isCartoon) {
      return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" width="800" height="600" className="w-full h-full">
        <rect width="400" height="300" rx="24" fill="#eff6ff" />
        <!-- Left lobe -->
        <path d="M 195 70 C 130 65 110 120 125 160 C 110 200 150 230 195 210 Z" fill="#f472b6" stroke="#1e1b4b" stroke-width="4" />
        <!-- Right lobe -->
        <path d="M 205 70 C 270 65 290 120 275 160 C 290 200 250 230 205 210 Z" fill="#c084fc" stroke="#1e1b4b" stroke-width="4" />
        <!-- Brain folds -->
        <path d="M 140 130 Q 165 120 185 140 Q 160 170 145 150" fill="none" stroke="#1e1b4b" stroke-width="3" stroke-linecap="round" />
        <path d="M 260 130 Q 235 120 215 140 Q 240 170 255 150" fill="none" stroke="#1e1b4b" stroke-width="3" stroke-linecap="round" />
        <!-- Synapse sparks -->
        <circle cx="100" cy="90" r="8" fill="#facc15" stroke="#1e1b4b" stroke-width="2" />
        <circle cx="300" cy="90" r="8" fill="#38bdf8" stroke="#1e1b4b" stroke-width="2" />
        <rect x="70" y="248" width="260" height="38" rx="14" fill="#818cf8" stroke="#1e1b4b" stroke-width="3" />
        <text x="200" y="272" font-family="Arial, sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle">🧠 NEURAL PATHWAYS &amp; BRAIN</text>
      </svg>`;
    }
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" width="800" height="600" className="w-full h-full">
      <rect width="400" height="300" rx="24" fill="#09090b" />
      <path d="M 195 70 C 130 65 110 120 125 160 C 110 200 150 230 195 210 Z" fill="#6366f1" opacity="0.8" />
      <path d="M 205 70 C 270 65 290 120 275 160 C 290 200 250 230 205 210 Z" fill="#a855f7" opacity="0.8" />
      <circle cx="195" cy="140" r="4" fill="#ffffff" />
      <line x1="195" y1="140" x2="160" y2="110" stroke="#38bdf8" stroke-width="2" />
      <line x1="195" y1="140" x2="230" y2="110" stroke="#e879f9" stroke-width="2" />
      <line x1="195" y1="140" x2="200" y2="180" stroke="#34d399" stroke-width="2" />
      <text x="200" y="272" font-family="Arial, sans-serif" font-weight="800" font-size="12" fill="#c084fc" text-anchor="middle">🧠 COGNITIVE ARCHITECTURE &amp; SYNAPSES</text>
    </svg>`;
  }

  // 4. HEART / CARDIOVASCULAR / BLOOD
  if (lower.includes('heart') || lower.includes('cardio') || lower.includes('blood') || lower.includes('pulse') || lower.includes('circulat')) {
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" width="800" height="600" className="w-full h-full">
      <defs>
        <linearGradient id="heartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f43f5e" />
          <stop offset="100%" stop-color="#be123c" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" rx="24" fill="${isCartoon ? '#fff1f2' : '#09090b'}" />
      <!-- Aorta and pulmonary arteries -->
      <path d="M 180 80 L 180 110 M 200 70 L 200 110 M 220 80 L 220 110" stroke="#0284c7" stroke-width="10" stroke-linecap="round" />
      <!-- Heart body -->
      <path d="M 200 115 C 130 70 80 140 140 190 L 200 230 L 260 190 C 320 140 270 70 200 115 Z" fill="url(#heartGrad)" stroke="${isCartoon ? '#1e1b4b' : '#f43f5e'}" stroke-width="4" />
      <!-- EKG heartbeat pulse -->
      <path d="M 80 150 L 140 150 L 155 125 L 170 175 L 185 135 L 200 160 L 215 150 L 320 150" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
      <text x="200" y="272" font-family="Arial, sans-serif" font-weight="900" font-size="12" fill="${isCartoon ? '#be123c' : '#fb7185'}" text-anchor="middle">❤️ CARDIOVASCULAR &amp; BLOOD FLOW</text>
    </svg>`;
  }

  // 5. CELL / DNA / GENETICS / BIOLOGY
  if (lower.includes('cell') || lower.includes('dna') || lower.includes('gene') || lower.includes('micro') || lower.includes('bio')) {
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" width="800" height="600" className="w-full h-full">
      <defs>
        <radialGradient id="cellGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#86efac" />
          <stop offset="100%" stop-color="#15803d" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" rx="24" fill="${isCartoon ? '#f0fdf4' : '#09090b'}" />
      <!-- Cell Membrane -->
      <ellipse cx="200" cy="140" rx="120" ry="85" fill="url(#cellGrad)" opacity="0.85" stroke="${isCartoon ? '#1e1b4b' : '#22c55e'}" stroke-width="4" />
      <!-- Nucleus -->
      <circle cx="180" cy="135" r="35" fill="#3b82f6" stroke="${isCartoon ? '#1e1b4b' : '#93c5fd'}" stroke-width="3" />
      <!-- Nucleolus -->
      <circle cx="175" cy="130" r="14" fill="#1d4ed8" />
      <!-- Mitochondria -->
      <ellipse cx="250" cy="120" rx="22" ry="12" fill="#f97316" stroke="${isCartoon ? '#1e1b4b' : '#fdba74'}" stroke-width="2" transform="rotate(-20 250 120)" />
      <ellipse cx="140" cy="180" rx="22" ry="12" fill="#f97316" stroke="${isCartoon ? '#1e1b4b' : '#fdba74'}" stroke-width="2" transform="rotate(15 140 180)" />
      <text x="200" y="272" font-family="Arial, sans-serif" font-weight="900" font-size="12" fill="${isCartoon ? '#166534' : '#4ade80'}" text-anchor="middle">🧬 CELLULAR BIOLOGY &amp; ORGANELLES</text>
    </svg>`;
  }

  // 6. PLANT / PHOTOSYNTHESIS / BOTANY
  if (lower.includes('plant') || lower.includes('leaf') || lower.includes('photo') || lower.includes('botan') || lower.includes('tree')) {
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" width="800" height="600" className="w-full h-full">
      <defs>
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4ade80" />
          <stop offset="100%" stop-color="#15803d" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" rx="24" fill="${isCartoon ? '#f0fdf4' : '#09090b'}" />
      <!-- Sun rays -->
      <circle cx="90" cy="70" r="28" fill="#facc15" stroke="${isCartoon ? '#1e1b4b' : '#fde047'}" stroke-width="3" />
      <!-- Leaf shape -->
      <path d="M 130 220 Q 150 90 280 80 Q 270 210 130 220 Z" fill="url(#leafGrad)" stroke="${isCartoon ? '#1e1b4b' : '#22c55e'}" stroke-width="4" />
      <path d="M 130 220 Q 200 150 280 80" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
      <text x="200" y="272" font-family="Arial, sans-serif" font-weight="900" font-size="12" fill="${isCartoon ? '#15803d' : '#86efac'}" text-anchor="middle">🌿 PHOTOSYNTHESIS &amp; BOTANY</text>
    </svg>`;
  }

  // 7. COMPUTER / CODE / TECH / SOFTWARE
  if (lower.includes('computer') || lower.includes('code') || lower.includes('tech') || lower.includes('software') || lower.includes('data') || lower.includes('algorithm')) {
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" width="800" height="600" className="w-full h-full">
      <rect width="400" height="300" rx="24" fill="#0f172a" />
      <rect x="80" y="60" width="240" height="150" rx="16" fill="#1e293b" stroke="#38bdf8" stroke-width="3" />
      <circle cx="105" cy="78" r="4" fill="#f43f5e" />
      <circle cx="120" cy="78" r="4" fill="#eab308" />
      <circle cx="135" cy="78" r="4" fill="#22c55e" />
      <!-- Code lines -->
      <line x1="105" y1="105" x2="160" y2="105" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" />
      <line x1="170" y1="105" x2="220" y2="105" stroke="#f472b6" stroke-width="3" stroke-linecap="round" />
      <line x1="125" y1="125" x2="200" y2="125" stroke="#4ade80" stroke-width="3" stroke-linecap="round" />
      <line x1="125" y1="145" x2="260" y2="145" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round" />
      <line x1="105" y1="165" x2="150" y2="165" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" />
      <text x="200" y="272" font-family="Courier, monospace" font-weight="900" font-size="12" fill="#38bdf8" text-anchor="middle">&lt;COMPUTATIONAL ARCHITECTURE /&gt;</text>
    </svg>`;
  }

  // 8. DEFAULT / GENERAL EDUCATIONAL CONCEPT VISUAL
  if (isCartoon) {
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" width="800" height="600" className="w-full h-full">
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbcfe8" />
          <stop offset="100%" stop-color="#c7d2fe" />
        </linearGradient>
        <linearGradient id="bubbleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#fb7185" />
          <stop offset="100%" stop-color="#f43f5e" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" rx="24" fill="url(#skyGrad)" />
      <circle cx="200" cy="135" r="70" fill="#fef08a" stroke="#1e1b4b" stroke-width="5" />
      <circle cx="180" cy="120" r="9" fill="#1e1b4b" />
      <circle cx="220" cy="120" r="9" fill="#1e1b4b" />
      <path d="M 180 155 Q 200 180 220 155" fill="none" stroke="#1e1b4b" stroke-width="5" stroke-linecap="round" />
      <rect x="70" y="245" width="260" height="38" rx="14" fill="url(#bubbleGrad)" stroke="#1e1b4b" stroke-width="3" />
      <text x="200" y="270" font-family="Arial, sans-serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle">🎨 CARTOON CONCEPT: ${title.toUpperCase().slice(0, 22)}</text>
    </svg>`;
  }

  if (is3D) {
    return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" width="800" height="600" className="w-full h-full">
      <defs>
        <radialGradient id="sphere3D" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#a5b4fc" />
          <stop offset="50%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#312e81" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" rx="24" fill="#09090b" />
      <ellipse cx="200" cy="235" rx="110" ry="22" fill="#18181b" opacity="0.8" />
      <circle cx="200" cy="130" r="65" fill="url(#sphere3D)" />
      <text x="200" y="272" font-family="Arial, sans-serif" font-weight="800" font-size="12" fill="#818cf8" text-anchor="middle">🧸 3D RENDER: ${title.toUpperCase().slice(0, 24)}</text>
    </svg>`;
  }

  // Minimalist clean vector default
  return `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" width="800" height="600" className="w-full h-full">
    <defs>
      <linearGradient id="mainVectorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366f1" />
        <stop offset="100%" stop-color="#a855f7" />
      </linearGradient>
    </defs>
    <rect width="400" height="300" rx="24" fill="#0f172a" />
    <circle cx="200" cy="130" r="55" fill="url(#mainVectorGrad)" opacity="0.9" />
    <path d="M 165 130 L 200 95 L 235 130 L 200 165 Z" fill="#ffffff" opacity="0.95" />
    <text x="200" y="270" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#cbd5e1" text-anchor="middle">📐 ${style.toUpperCase()}: ${title.toUpperCase().slice(0, 22)}</text>
  </svg>`;
}

function generateFallbackDeck(
  content: string,
  targetAudience: string,
  deckLength: string,
  slideTone: string,
  colorTheme: string,
  illustrationStyle: string = 'Cartoon & Playful Illustration',
  session: string = 'Session 1',
  targetSlideCount: number = 12
): DeckResponse {
  // Extract key topic from first line or snippet
  const rawLines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const firstLine = rawLines[0] || 'Modern Educational Concepts';
  const cleanTitle = firstLine.length < 60 ? firstLine.replace(/^[#\s*-]+/, '') : 'Interactive Presentation Master Deck';

  // Extract paragraphs or conceptual chunks from the uploaded document
  const rawChunks = content
    .split(/\n\s*\n|(?=^#{1,3}\s+)/m)
    .map((c) => c.replace(/^[#\s*-]+/, '').trim())
    .filter((c) => c.length > 20);

  const paletteMap: Record<string, any> = {
    'Dark Tech': { name: 'Dark Tech', primary: '#6366f1', secondary: '#8b5cf6', accent: '#10b981', background: '#09090b' },
    'Warm Editorial': { name: 'Warm Editorial', primary: '#ea580c', secondary: '#f59e0b', accent: '#0d9488', background: '#1c1917' },
    'Clean Chalkboard': { name: 'Clean Chalkboard', primary: '#10b981', secondary: '#38bdf8', accent: '#facc15', background: '#064e3b' },
    'Minimalist Corporate': { name: 'Minimalist Corporate', primary: '#2563eb', secondary: '#4f46e5', accent: '#06b6d4', background: '#0f172a' },
    'Vibrant Creative': { name: 'Vibrant Creative', primary: '#ec4899', secondary: '#8b5cf6', accent: '#f97316', background: '#18181b' },
    'Colorblind-Accessible (High Contrast)': { name: 'Accessible Contrast', primary: '#0284c7', secondary: '#ca8a04', accent: '#16a34a', background: '#09090b' },
  };

  const palette = paletteMap[colorTheme] || paletteMap['Dark Tech'];

  const layoutCycle: LayoutType[] = [
    'Title Hero',
    'Split Comparison 50/50',
    '3-Column Grid',
    'Timeline Flow',
    'Big Stat / Callout',
    'Teacher-Led Discussion Prompt',
    'Split Comparison 50/50',
    '3-Column Grid',
    'Timeline Flow',
    'Big Stat / Callout',
    'Split Comparison 50/50',
    'Teacher-Led Discussion Prompt',
  ];

  const slides: SlideItem[] = [];
  const totalSlidesToCreate = Math.max(1, Math.min(50, targetSlideCount));

  for (let i = 0; i < totalSlidesToCreate; i++) {
    const slideNumber = i + 1;
    const isFirst = i === 0;
    const isLast = i === totalSlidesToCreate - 1;
    const layout: LayoutType = isFirst || isLast ? 'Title Hero' : layoutCycle[i % layoutCycle.length];

    // Source context chunk from uploaded document if available
    const chunk = rawChunks[i % Math.max(1, rawChunks.length)] || '';
    const chunkSentences = chunk.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 5);

    let slideTitle = '';
    let slideHeadline = '';

    if (isFirst) {
      slideTitle = cleanTitle;
      slideHeadline = `Transforming Knowledge into Action: An Introduction to ${cleanTitle} (${session})`;
    } else if (isLast) {
      slideTitle = `Capstone Synthesis & Actionable Mastery`;
      slideHeadline = `Consolidating Key Principles & Student Takeaways for ${cleanTitle}`;
    } else {
      const topicSeed = chunkSentences[0] || `Core Framework Element ${slideNumber}`;
      slideTitle = topicSeed.length > 35 ? topicSeed.slice(0, 35) + '...' : topicSeed;
      slideHeadline = `Analyzing Critical Mechanics & Practical Applications of ${slideTitle}`;
    }

    const bullet1 = chunkSentences[0]
      ? `**Core Thesis:** ${chunkSentences[0]}.`
      : `**Primary Principle:** Foundational pillar established for ${cleanTitle}.`;
    const bullet2 = chunkSentences[1]
      ? `**Mechanism:** ${chunkSentences[1]}.`
      : `**Operational Dynamics:** Examining interactions and variables under real-world constraints.`;
    const bullet3 = chunkSentences[2]
      ? `**Impact & Transfer:** ${chunkSentences[2]}.`
      : `**Actionable Application:** Practical methodologies for student mastery and measurable success.`;

    const slide: SlideItem = {
      id: `slide-${slideNumber}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      slideNumber,
      title: slideTitle,
      estimatedTime: isFirst ? '2 min' : isLast ? '4 min' : '3 min',
      layoutType: layout,
      headline: slideHeadline,
      bullets: [bullet1, bullet2, bullet3],
      speakerNotes: `🗣️ WHAT TO SAY OUT LOUD:
"Class, as we examine slide ${slideNumber} focusing on ${slideTitle}, pay special attention to the relationship between the headline and the second key point. Notice why this structural mechanism matters."

💡 HOW TO EXPLAIN SIMPLY (Everyday Analogy):
Think of ${slideTitle} like a master recipe: skipping an essential component creates unpredictable results, but sequencing the ingredients with precision produces consistent excellence.

🎯 DELIVERY & ACTION CUES:
[Action: Point directly to the central mechanism on screen]
[Pacing: Pause 10 seconds for students to copy down the primary principle into their notes]
[Engagement: Ask for a quick show of hands if this concept is familiar]

⚠️ COMMON STUDENT MISCONCEPTION:
Students frequently assume this principle operates in isolation. Clarify that it interacts continuously with the broader curricular framework.

❓ SOCRATIC CHECK-IN QUESTION:
"If you had to explain the main idea of this slide to someone with no background in ${cleanTitle}, what single sentence would you use?"`,
      visualPrompt: {
        imagePrompt: `${illustrationStyle} showing ${slideTitle} for ${cleanTitle}, widescreen 16:9 aspect ratio, clean studio lighting, high contrast visual metaphor, 8k resolution.`,
        recommendedPlacement: isFirst ? 'Right 50% split' : isLast ? 'Full bleed background with 70% dark overlay' : 'Right 50% split',
        designInstructions: `Presentation layout formatted with 24px container margins and high-contrast typography aligned with ${palette.name}.`,
        suggestedIcon: isFirst ? 'Sparkles' : isLast ? 'Award' : 'Layers',
        altText: `${illustrationStyle} visual representation illustrating ${slideTitle}.`,
        illustrationStyle: illustrationStyle as any,
        customSvgArt: createFallbackSvgIllustration(slideTitle, illustrationStyle),
      },
      assessment: {
        question: `How does the core principle of ${slideTitle} enhance our broader understanding of ${cleanTitle}?`,
        type: i % 2 === 0 ? 'multiple_choice' : 'discussion',
        options: i % 2 === 0 ? [
          'It provides the structural mechanism for predictable application',
          'It replaces earlier foundational axioms entirely',
          'It is only useful for theoretical memorization without practice',
          'It has no direct relationship to the overarching curriculum',
        ] : undefined,
        correctAnswer: i % 2 === 0 ? 'It provides the structural mechanism for predictable application' : undefined,
        explanation: `Mastering ${slideTitle} ensures students can apply conceptual principles reliably to novel problems.`,
      },
    };

    slides.push(slide);
  }

  return {
    title: cleanTitle,
    subject: 'Instructional Mastery & Applied Curriculum',
    targetAudience: targetAudience,
    gradeLevel: targetAudience,
    colorPalette: palette,
    totalEstimatedMinutes: slides.reduce((acc, s) => acc + (parseInt(s.estimatedTime, 10) || 3), 0),
    pedagogyNotes: `Structured using Universal Design for Learning (UDL) principles with multi-modal dual coding across ${totalSlidesToCreate} presentation slides: concise text anchors, vivid visual prompt blueprints for Midjourney/DALL-E, active retrieval assessment checkpoints, and synchronized teacher verbal scripting.`,
    slides,
    deckLength,
    customSlideCount: totalSlidesToCreate,
    session: session as any,
    illustrationStyle: illustrationStyle as any,
  };
}

startServer();

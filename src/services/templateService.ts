import { PresentationTemplate, MasterSlideLayout } from '../types/template';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { ADMIN_PRIMARY_EMAIL } from './adminService';

const TEMPLATE_STORAGE_KEY = 'slidecraft_master_templates_v1';

export const DEFAULT_MASTER_TEMPLATES: PresentationTemplate[] = [
  {
    id: 'tmpl_tech_dark_glass',
    title: 'Obsidian Cyber Glass Master',
    description: 'High-contrast dark mode master template with glowing indigo gradients, floating glassmorphic cards, and dedicated AI illustration viewports.',
    category: 'Dark Futuristic',
    authorEmail: ADMIN_PRIMARY_EMAIL,
    isPublished: true,
    thumbnailColor: '#6366f1',
    colorPalette: {
      name: 'Dark Obsidian',
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#10b981',
      background: '#09090b',
      cardBg: '#18181b',
      textPrimary: '#ffffff',
      textSecondary: '#a1a1aa',
    },
    fontPairing: {
      headingFont: 'Space Grotesk, sans-serif',
      bodyFont: 'Plus Jakarta Sans, sans-serif',
    },
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-26T22:00:00.000Z',
    slides: [
      {
        id: 'layout_title_hero',
        name: 'Title Hero Master',
        layoutCategory: 'title',
        background: {
          type: 'gradient',
          color: '#09090b',
          gradient: 'linear-gradient(135deg, #09090b 0%, #180828 50%, #09090b 100%)',
          pattern: 'grid',
        },
        elements: [
          {
            id: 'el_badge_pill',
            type: 'shape',
            shapeType: 'pill',
            x: 60,
            y: 70,
            width: 170,
            height: 36,
            fillColor: 'rgba(99, 102, 241, 0.18)',
            strokeColor: '#6366f1',
            strokeWidth: 1.5,
            zIndex: 1,
            shadow: 'glow-primary',
          },
          {
            id: 'el_session_tag',
            type: 'text',
            x: 75,
            y: 78,
            width: 140,
            height: 20,
            text: 'CURRICULUM SESSION 1',
            textColor: '#a5b4fc',
            fontSize: 12,
            fontWeight: 'bold',
            letterSpacing: 1.5,
            zIndex: 2,
            placeholderTag: 'session_tag',
          },
          {
            id: 'el_main_title',
            type: 'text',
            x: 60,
            y: 130,
            width: 840,
            height: 120,
            text: 'Mastering Advanced Biological Systems & Energy Cycles',
            textColor: '#ffffff',
            fontSize: 42,
            fontWeight: '800',
            lineHeight: 1.2,
            zIndex: 2,
            placeholderTag: 'slide_title',
          },
          {
            id: 'el_hero_card',
            type: 'shape',
            shapeType: 'rounded_card',
            x: 60,
            y: 280,
            width: 840,
            height: 180,
            fillColor: 'rgba(24, 24, 27, 0.75)',
            strokeColor: 'rgba(255, 255, 255, 0.1)',
            strokeWidth: 1,
            borderRadius: 20,
            zIndex: 1,
            shadow: 'soft-lg',
          },
          {
            id: 'el_headline_text',
            type: 'text',
            x: 90,
            y: 310,
            width: 780,
            height: 80,
            text: 'An interactive dual-coded exploration of cellular phosphorylation and high-yield ATP synthesis pathways.',
            textColor: '#d4d4d8',
            fontSize: 20,
            fontWeight: 'normal',
            lineHeight: 1.5,
            zIndex: 2,
            placeholderTag: 'headline',
          },
          {
            id: 'el_meta_badge',
            type: 'text',
            x: 90,
            y: 415,
            width: 400,
            height: 25,
            text: 'Target Audience: AP High School | Pacing: 28 min',
            textColor: '#818cf8',
            fontSize: 13,
            fontWeight: 'bold',
            zIndex: 2,
            placeholderTag: 'target_audience',
          },
        ],
      },
      {
        id: 'layout_split_visual',
        name: 'Split 50/50 Concept & AI Art',
        layoutCategory: 'split',
        background: {
          type: 'gradient',
          color: '#09090b',
          gradient: 'linear-gradient(180deg, #09090b 0%, #121217 100%)',
          pattern: 'none',
        },
        elements: [
          {
            id: 'el_slide_num_badge',
            type: 'text',
            x: 50,
            y: 40,
            width: 200,
            height: 24,
            text: 'SLIDE 02 • CORE MECHANISM',
            textColor: '#a1a1aa',
            fontSize: 12,
            fontWeight: 'bold',
            letterSpacing: 1.2,
            zIndex: 2,
            placeholderTag: 'slide_number',
          },
          {
            id: 'el_split_title',
            type: 'text',
            x: 50,
            y: 75,
            width: 450,
            height: 70,
            text: 'Thylakoid Proton Gradients',
            textColor: '#ffffff',
            fontSize: 32,
            fontWeight: 'bold',
            zIndex: 2,
            placeholderTag: 'slide_title',
          },
          {
            id: 'el_split_bullets_card',
            type: 'shape',
            shapeType: 'rounded_card',
            x: 50,
            y: 160,
            width: 450,
            height: 330,
            fillColor: 'rgba(24, 24, 27, 0.85)',
            strokeColor: 'rgba(255, 255, 255, 0.08)',
            strokeWidth: 1,
            borderRadius: 18,
            zIndex: 1,
            shadow: 'soft-md',
          },
          {
            id: 'el_bullet_1',
            type: 'text',
            x: 80,
            y: 190,
            width: 390,
            height: 80,
            text: '• **Electrochemical Potential:** Hydrogen ions accumulate inside the lumen via photolysis.',
            textColor: '#e4e4e7',
            fontSize: 16,
            lineHeight: 1.5,
            zIndex: 2,
            placeholderTag: 'bullet_1',
          },
          {
            id: 'el_bullet_2',
            type: 'text',
            x: 80,
            y: 285,
            width: 390,
            height: 80,
            text: '• **Chemiosmotic Drive:** Proton motive force powers rotational catalytic units of ATP synthase.',
            textColor: '#e4e4e7',
            fontSize: 16,
            lineHeight: 1.5,
            zIndex: 2,
            placeholderTag: 'bullet_2',
          },
          {
            id: 'el_bullet_3',
            type: 'text',
            x: 80,
            y: 380,
            width: 390,
            height: 80,
            text: '• **Net Yield:** Continuous flux of NADPH and ATP to supply stromal Calvin cycles.',
            textColor: '#e4e4e7',
            fontSize: 16,
            lineHeight: 1.5,
            zIndex: 2,
            placeholderTag: 'bullet_3',
          },
          {
            id: 'el_ai_art_frame',
            type: 'ai_placeholder',
            x: 530,
            y: 75,
            width: 380,
            height: 415,
            fillColor: '#18181b',
            strokeColor: 'rgba(99, 102, 241, 0.4)',
            strokeWidth: 2,
            borderRadius: 20,
            shadow: 'glow-primary',
            zIndex: 2,
            placeholderTag: 'ai_visual_art',
            placeholderDescription: 'Custom AI Vector Illustration Frame (Widescreen 16:9)',
          },
        ],
      },
      {
        id: 'layout_3col_grid',
        name: '3-Column Mechanism Grid',
        layoutCategory: 'grid',
        background: {
          type: 'gradient',
          color: '#09090b',
          gradient: 'linear-gradient(135deg, #09090b 0%, #141120 100%)',
          pattern: 'grid',
        },
        elements: [
          {
            id: 'el_grid_title',
            type: 'text',
            x: 50,
            y: 40,
            width: 860,
            height: 50,
            text: 'The Three Catalytic Phases of Cellular Respiration',
            textColor: '#ffffff',
            fontSize: 28,
            fontWeight: '800',
            textAlign: 'center',
            zIndex: 2,
            placeholderTag: 'slide_title',
          },
          {
            id: 'el_col1_card',
            type: 'shape',
            shapeType: 'rounded_card',
            x: 50,
            y: 115,
            width: 270,
            height: 380,
            fillColor: 'rgba(24, 24, 27, 0.8)',
            strokeColor: 'rgba(99, 102, 241, 0.3)',
            strokeWidth: 1.5,
            borderRadius: 18,
            zIndex: 1,
          },
          {
            id: 'el_col1_title',
            type: 'text',
            x: 70,
            y: 140,
            width: 230,
            height: 30,
            text: 'Phase 1: Glycolysis',
            textColor: '#818cf8',
            fontSize: 18,
            fontWeight: 'bold',
            zIndex: 2,
          },
          {
            id: 'el_col1_text',
            type: 'text',
            x: 70,
            y: 185,
            width: 230,
            height: 280,
            text: 'Cytoplasmic anaerobic cleavage of glucose (6C) into two pyruvate (3C) molecules with net 2 ATP yield.',
            textColor: '#d4d4d8',
            fontSize: 14,
            lineHeight: 1.5,
            zIndex: 2,
            placeholderTag: 'bullet_1',
          },
          {
            id: 'el_col2_card',
            type: 'shape',
            shapeType: 'rounded_card',
            x: 345,
            y: 115,
            width: 270,
            height: 380,
            fillColor: 'rgba(24, 24, 27, 0.8)',
            strokeColor: 'rgba(168, 85, 247, 0.3)',
            strokeWidth: 1.5,
            borderRadius: 18,
            zIndex: 1,
          },
          {
            id: 'el_col2_title',
            type: 'text',
            x: 365,
            y: 140,
            width: 230,
            height: 30,
            text: 'Phase 2: Krebs Cycle',
            textColor: '#c084fc',
            fontSize: 18,
            fontWeight: 'bold',
            zIndex: 2,
          },
          {
            id: 'el_col2_text',
            type: 'text',
            x: 365,
            y: 185,
            width: 230,
            height: 280,
            text: 'Mitochondrial matrix oxidation of Acetyl-CoA producing NADH, FADH2 coenzymes and metabolic CO2 release.',
            textColor: '#d4d4d8',
            fontSize: 14,
            lineHeight: 1.5,
            zIndex: 2,
            placeholderTag: 'bullet_2',
          },
          {
            id: 'el_col3_card',
            type: 'shape',
            shapeType: 'rounded_card',
            x: 640,
            y: 115,
            width: 270,
            height: 380,
            fillColor: 'rgba(24, 24, 27, 0.8)',
            strokeColor: 'rgba(16, 185, 129, 0.3)',
            strokeWidth: 1.5,
            borderRadius: 18,
            zIndex: 1,
          },
          {
            id: 'el_col3_title',
            type: 'text',
            x: 660,
            y: 140,
            width: 230,
            height: 30,
            text: 'Phase 3: Oxidative Phos.',
            textColor: '#34d399',
            fontSize: 18,
            fontWeight: 'bold',
            zIndex: 2,
          },
          {
            id: 'el_col3_text',
            type: 'text',
            x: 660,
            y: 185,
            width: 230,
            height: 280,
            text: 'Inner membrane electron cascade utilizing O2 as terminal acceptor to synthesize 26-28 ATP via chemiosmosis.',
            textColor: '#d4d4d8',
            fontSize: 14,
            lineHeight: 1.5,
            zIndex: 2,
            placeholderTag: 'bullet_3',
          },
        ],
      },
    ],
  },
  {
    id: 'tmpl_academic_scandi_clean',
    title: 'Minimalist Academic Scandinavian',
    description: 'Clean, airy layout with generous negative space, crisp typography hierarchy, soft neutral tones, and structured pedagogy callouts.',
    category: 'Academic & Clean',
    authorEmail: ADMIN_PRIMARY_EMAIL,
    isPublished: true,
    thumbnailColor: '#0ea5e9',
    colorPalette: {
      name: 'Nordic Clean',
      primary: '#0284c7',
      secondary: '#64748b',
      accent: '#0d9488',
      background: '#f8fafc',
      cardBg: '#ffffff',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
    },
    fontPairing: {
      headingFont: 'Playfair Display, serif',
      bodyFont: 'Inter, sans-serif',
    },
    createdAt: '2026-09-22T10:00:00.000Z',
    updatedAt: '2026-09-26T22:00:00.000Z',
    slides: [
      {
        id: 'layout_scandi_hero',
        name: 'Editorial Title Hero',
        layoutCategory: 'title',
        background: {
          type: 'color',
          color: '#f8fafc',
          pattern: 'none',
        },
        elements: [
          {
            id: 'el_scandi_divider',
            type: 'shape',
            shapeType: 'rectangle',
            x: 70,
            y: 90,
            width: 60,
            height: 4,
            fillColor: '#0284c7',
            zIndex: 1,
          },
          {
            id: 'el_scandi_title',
            type: 'text',
            x: 70,
            y: 120,
            width: 820,
            height: 140,
            text: 'Foundations of Modern Organic Chemistry & Synthesis',
            textColor: '#0f172a',
            fontSize: 40,
            fontWeight: '800',
            fontFamily: 'Playfair Display, serif',
            zIndex: 2,
            placeholderTag: 'slide_title',
          },
          {
            id: 'el_scandi_sub',
            type: 'text',
            x: 70,
            y: 280,
            width: 800,
            height: 90,
            text: 'A structured inquiry into nucleophilic substitution mechanisms, stereochemical inversions, and reaction kinematics.',
            textColor: '#475569',
            fontSize: 20,
            lineHeight: 1.6,
            zIndex: 2,
            placeholderTag: 'headline',
          },
          {
            id: 'el_scandi_card',
            type: 'shape',
            shapeType: 'rounded_card',
            x: 70,
            y: 400,
            width: 820,
            height: 80,
            fillColor: '#ffffff',
            strokeColor: '#e2e8f0',
            strokeWidth: 1,
            borderRadius: 16,
            shadow: 'soft-sm',
            zIndex: 1,
          },
          {
            id: 'el_scandi_instructor',
            type: 'text',
            x: 100,
            y: 428,
            width: 760,
            height: 30,
            text: 'Prepared by Department of Chemical Sciences • Grade Level: Higher Education • Pacing: 35 min',
            textColor: '#0284c7',
            fontSize: 14,
            fontWeight: 'bold',
            zIndex: 2,
            placeholderTag: 'target_audience',
          },
        ],
      },
    ],
  },
  {
    id: 'tmpl_playful_stem_clay',
    title: 'Playful STEM & Illustrated 3D',
    description: 'Vibrant energetic layout designed for K-12 with rounded bubble pills, colorful callout badges, and cartoon illustration frames.',
    category: 'Playful & Creative',
    authorEmail: ADMIN_PRIMARY_EMAIL,
    isPublished: true,
    thumbnailColor: '#ec4899',
    colorPalette: {
      name: 'Playful Sunset',
      primary: '#ec4899',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#0f172a',
      cardBg: '#1e293b',
      textPrimary: '#ffffff',
      textSecondary: '#cbd5e1',
    },
    fontPairing: {
      headingFont: 'Outfit, sans-serif',
      bodyFont: 'Plus Jakarta Sans, sans-serif',
    },
    createdAt: '2026-09-24T10:00:00.000Z',
    updatedAt: '2026-09-26T22:00:00.000Z',
    slides: [
      {
        id: 'layout_playful_hero',
        name: 'Vibrant Title Stage',
        layoutCategory: 'title',
        background: {
          type: 'gradient',
          color: '#0f172a',
          gradient: 'linear-gradient(135deg, #0f172a 0%, #31133f 50%, #0f172a 100%)',
          pattern: 'glow_orbs',
        },
        elements: [
          {
            id: 'el_play_star',
            type: 'shape',
            shapeType: 'star',
            x: 60,
            y: 50,
            width: 50,
            height: 50,
            fillColor: '#f59e0b',
            zIndex: 2,
          },
          {
            id: 'el_play_title',
            type: 'text',
            x: 130,
            y: 55,
            width: 770,
            height: 100,
            text: 'Discovering the Solar System & Planetary Orbits!',
            textColor: '#ffffff',
            fontSize: 36,
            fontWeight: '800',
            zIndex: 2,
            placeholderTag: 'slide_title',
          },
          {
            id: 'el_play_art_frame',
            type: 'ai_placeholder',
            x: 480,
            y: 170,
            width: 420,
            height: 320,
            fillColor: '#1e293b',
            strokeColor: '#ec4899',
            strokeWidth: 3,
            borderRadius: 24,
            shadow: 'glow-primary',
            zIndex: 2,
            placeholderTag: 'ai_visual_art',
          },
          {
            id: 'el_play_notes_card',
            type: 'shape',
            shapeType: 'rounded_card',
            x: 60,
            y: 170,
            width: 390,
            height: 320,
            fillColor: 'rgba(30, 41, 59, 0.85)',
            strokeColor: 'rgba(236, 72, 153, 0.4)',
            strokeWidth: 2,
            borderRadius: 24,
            zIndex: 1,
            shadow: 'soft-md',
          },
          {
            id: 'el_play_bullet_1',
            type: 'text',
            x: 90,
            y: 200,
            width: 330,
            height: 80,
            text: '🚀 **Sun as the Engine:** Gravitational anchor keeping eight celestial bodies locked in orbit.',
            textColor: '#f1f5f9',
            fontSize: 16,
            lineHeight: 1.5,
            zIndex: 2,
            placeholderTag: 'bullet_1',
          },
          {
            id: 'el_play_bullet_2',
            type: 'text',
            x: 90,
            y: 295,
            width: 330,
            height: 80,
            text: '🪐 **Inner vs. Outer:** Rocky terrestrial planets close in; gas giants with icy ring systems far out.',
            textColor: '#f1f5f9',
            fontSize: 16,
            lineHeight: 1.5,
            zIndex: 2,
            placeholderTag: 'bullet_2',
          },
        ],
      },
    ],
  },
];

/**
 * Fetch all master templates from Firestore or fallback to local defaults.
 */
export async function fetchAdminTemplatesFromFirestore(): Promise<PresentationTemplate[]> {
  const templates: PresentationTemplate[] = [];

  try {
    const templatesRef = collection(db, 'presentation_templates');
    const snapshot = await getDocs(templatesRef);

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as PresentationTemplate;
      templates.push({
        ...data,
        id: docSnap.id || data.id,
      });
    });
  } catch (err) {
    console.warn('Firestore read for master templates note:', err);
  }

  // Load from local storage backup
  let localTemplates: PresentationTemplate[] = [];
  try {
    const raw = localStorage.getItem(TEMPLATE_STORAGE_KEY);
    if (raw) {
      localTemplates = JSON.parse(raw);
    }
  } catch {}

  // Merge default presets + local + firestore
  const combined = [...templates];

  localTemplates.forEach((loc) => {
    if (!combined.some((t) => t.id === loc.id)) {
      combined.push(loc);
    }
  });

  DEFAULT_MASTER_TEMPLATES.forEach((def) => {
    if (!combined.some((t) => t.id === def.id)) {
      combined.push(def);
    }
  });

  return combined;
}

/**
 * Save / Update a master template in Firestore & Local storage
 */
export async function saveAdminTemplateToFirestore(
  template: PresentationTemplate
): Promise<PresentationTemplate> {
  const templateId = template.id || `tmpl_${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  const payload: PresentationTemplate = {
    ...template,
    id: templateId,
    updatedAt: now,
    createdAt: template.createdAt || now,
  };

  // Save to local cache
  try {
    const local = await fetchAdminTemplatesFromFirestore();
    const filtered = local.filter((t) => t.id !== templateId);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify([payload, ...filtered]));
  } catch {}

  // Save to Firestore
  try {
    const templateDocRef = doc(db, 'presentation_templates', templateId);
    await setDoc(templateDocRef, payload, { merge: true });
  } catch (err) {
    console.warn('Firestore write for template operate note:', err);
  }

  return payload;
}

/**
 * Delete a master template
 */
export async function deleteAdminTemplateFromFirestore(templateId: string): Promise<void> {
  try {
    const local = await fetchAdminTemplatesFromFirestore();
    const filtered = local.filter((t) => t.id !== templateId);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(filtered));
  } catch {}

  try {
    const templateDocRef = doc(db, 'presentation_templates', templateId);
    await deleteDoc(templateDocRef);
  } catch (err) {
    console.warn('Firestore delete for template note:', err);
  }
}

/**
 * Create a new blank master template
 */
export function createBlankMasterTemplate(
  title = 'Untitled Master Template',
  category: PresentationTemplate['category'] = 'Tech & Modern'
): PresentationTemplate {
  const id = `tmpl_${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  const titleSlide: MasterSlideLayout = {
    id: `layout_title_${Date.now()}`,
    name: '1. Title Hero Slide',
    layoutCategory: 'title',
    background: {
      type: 'gradient',
      color: '#09090b',
      gradient: 'linear-gradient(135deg, #09090b 0%, #1a162b 100%)',
      pattern: 'grid',
    },
    elements: [
      {
        id: `el_badge_${Date.now()}`,
        type: 'shape',
        shapeType: 'pill',
        x: 60,
        y: 60,
        width: 160,
        height: 32,
        fillColor: 'rgba(99, 102, 241, 0.2)',
        strokeColor: '#6366f1',
        strokeWidth: 1.5,
        zIndex: 1,
      },
      {
        id: `el_tag_${Date.now()}`,
        type: 'text',
        x: 75,
        y: 68,
        width: 130,
        height: 18,
        text: 'SESSION 1',
        textColor: '#a5b4fc',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        zIndex: 2,
        placeholderTag: 'session_tag',
      },
      {
        id: `el_title_${Date.now()}`,
        type: 'text',
        x: 60,
        y: 115,
        width: 840,
        height: 110,
        text: 'Click to Edit Presentation Master Title',
        textColor: '#ffffff',
        fontSize: 38,
        fontWeight: '800',
        lineHeight: 1.2,
        zIndex: 2,
        placeholderTag: 'slide_title',
      },
      {
        id: `el_card_${Date.now()}`,
        type: 'shape',
        shapeType: 'rounded_card',
        x: 60,
        y: 250,
        width: 840,
        height: 220,
        fillColor: 'rgba(24, 24, 27, 0.8)',
        strokeColor: 'rgba(255, 255, 255, 0.1)',
        strokeWidth: 1,
        borderRadius: 20,
        zIndex: 1,
      },
      {
        id: `el_headline_${Date.now()}`,
        type: 'text',
        x: 90,
        y: 280,
        width: 780,
        height: 80,
        text: 'Master headline and core conceptual learning objective summary.',
        textColor: '#d4d4d8',
        fontSize: 18,
        lineHeight: 1.5,
        zIndex: 2,
        placeholderTag: 'headline',
      },
    ],
  };

  const contentSlide: MasterSlideLayout = {
    id: `layout_content_${Date.now() + 1}`,
    name: '2. Split Content & Visual',
    layoutCategory: 'split',
    background: {
      type: 'gradient',
      color: '#09090b',
      gradient: 'linear-gradient(180deg, #09090b 0%, #12111a 100%)',
      pattern: 'none',
    },
    elements: [
      {
        id: `el_c_title_${Date.now()}`,
        type: 'text',
        x: 50,
        y: 45,
        width: 460,
        height: 60,
        text: 'Core Instructional Concept',
        textColor: '#ffffff',
        fontSize: 28,
        fontWeight: 'bold',
        zIndex: 2,
        placeholderTag: 'slide_title',
      },
      {
        id: `el_c_card_${Date.now()}`,
        type: 'shape',
        shapeType: 'rounded_card',
        x: 50,
        y: 120,
        width: 460,
        height: 370,
        fillColor: 'rgba(24, 24, 27, 0.85)',
        strokeColor: 'rgba(255, 255, 255, 0.08)',
        strokeWidth: 1,
        borderRadius: 18,
        zIndex: 1,
      },
      {
        id: `el_c_b1_${Date.now()}`,
        type: 'text',
        x: 75,
        y: 150,
        width: 410,
        height: 90,
        text: '• **Foundational Principle:** Key mechanism or theoretical postulate.',
        textColor: '#e4e4e7',
        fontSize: 15,
        lineHeight: 1.5,
        zIndex: 2,
        placeholderTag: 'bullet_1',
      },
      {
        id: `el_c_b2_${Date.now()}`,
        type: 'text',
        x: 75,
        y: 250,
        width: 410,
        height: 90,
        text: '• **Mechanistic Application:** Empirical evidence and experimental application.',
        textColor: '#e4e4e7',
        fontSize: 15,
        lineHeight: 1.5,
        zIndex: 2,
        placeholderTag: 'bullet_2',
      },
      {
        id: `el_c_b3_${Date.now()}`,
        type: 'text',
        x: 75,
        y: 350,
        width: 410,
        height: 90,
        text: '• **Active Synthesis:** Formative takeaway for student guided discussion.',
        textColor: '#e4e4e7',
        fontSize: 15,
        lineHeight: 1.5,
        zIndex: 2,
        placeholderTag: 'bullet_3',
      },
      {
        id: `el_c_ai_${Date.now()}`,
        type: 'ai_placeholder',
        x: 540,
        y: 45,
        width: 370,
        height: 445,
        fillColor: '#18181b',
        strokeColor: 'rgba(99, 102, 241, 0.4)',
        strokeWidth: 2,
        borderRadius: 20,
        zIndex: 2,
        placeholderTag: 'ai_visual_art',
        placeholderDescription: 'Custom AI Vector Illustration Frame',
      },
    ],
  };

  return {
    id,
    title,
    description: 'Custom teacher master slide template architected for automated AI presentation population.',
    category,
    authorEmail: ADMIN_PRIMARY_EMAIL,
    isPublished: false,
    thumbnailColor: '#6366f1',
    colorPalette: {
      name: 'Modern Indigo',
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#10b981',
      background: '#09090b',
      cardBg: '#18181b',
      textPrimary: '#ffffff',
      textSecondary: '#a1a1aa',
    },
    fontPairing: {
      headingFont: 'Plus Jakarta Sans, sans-serif',
      bodyFont: 'Inter, sans-serif',
    },
    slides: [titleSlide, contentSlide],
    createdAt: now,
    updatedAt: now,
  };
}

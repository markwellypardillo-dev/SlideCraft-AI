import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Layers,
  FolderGit2,
  ShieldCheck,
  Activity,
  ArrowRightLeft,
  Sun,
  Moon,
  Monitor,
  Image as ImageIcon,
  BarChart3,
  Palette,
} from 'lucide-react';
import { SlideDeck, ActiveNavTab, TargetAudience, DeckLength, SlideTone, ColorThemeName, ThemeMode, IllustrationStyle, CurriculumSession } from './types/deck';
import { generateDeckAPI } from './services/deckService';
import { SampleCurriculum } from './data/sampleCurricula';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  auth,
  signOutUser,
  saveDeckToFirestore,
  fetchUserDecksFromFirestore,
  deleteDeckFromFirestore,
} from './services/firebase';
import { isUserAdmin, recordSystemLog } from './services/adminService';
import { AdminSubTab } from './types/admin';
import { humanizeError } from './utils/humanizedErrors';
import {
  saveDecksToOfflineCache,
  getDecksFromOfflineCache,
  saveActiveDeckToOfflineCache,
  getActiveDeckFromOfflineCache,
  clearLegacySharedCaches,
} from './utils/offlineCacheStorage';

import { Sidebar } from './components/Sidebar';
import { DocumentUploader } from './components/DocumentUploader';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SlideDeckWorkspace } from './components/SlideDeckWorkspace';
import { VisualBlueprintGallery } from './components/VisualBlueprintGallery';
import { AssessmentsHub } from './components/AssessmentsHub';
import { CurriculumLibrary } from './components/CurriculumLibrary';
import { PresenterPracticeMode } from './components/PresenterPracticeMode';
import { StudentCompanionModal } from './components/StudentCompanionModal';
import { ExportModal } from './components/ExportModal';
import { AccessibilityDrawer } from './components/AccessibilityDrawer';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminWorkspaceSelectorModal } from './components/AdminWorkspaceSelectorModal';

export default function App() {
  // Theme Mode: 'light' | 'dark' | 'system'
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('slidecraft_theme_mode');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch {}
    return 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  // Listen to OS-level dark/light mode preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDark = themeMode === 'system' ? systemPrefersDark : themeMode === 'dark';

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem('slidecraft_theme_mode', mode);
    } catch {}
  };

  const [activeTab, setActiveTab] = useState<ActiveNavTab>('generator');
  const [currentDeck, setCurrentDeck] = useState<SlideDeck | null>(null);
  const [savedDecks, setSavedDecks] = useState<SlideDeck[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);


  // Authentication & Workspace Modes
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const lastUserRef = useRef<string | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<'studio' | 'admin'>('studio');
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>('overview');
  const [isWorkspaceSelectorOpen, setIsWorkspaceSelectorOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isSyncingCloudDecks, setIsSyncingCloudDecks] = useState<boolean>(false);
  const [isSavingToCloud, setIsSavingToCloud] = useState<boolean>(false);

  // Modal Dialog States
  const [isPresenterOpen, setIsPresenterOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isCompanionOpen, setIsCompanionOpen] = useState<boolean>(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const isAdmin = isUserAdmin(currentUser?.email);

  // Tab Switch Handler with HTML5 History PushState for Hardware Back Button
  const handleSelectTabWithHistory = (tab: ActiveNavTab) => {
    if (tab !== activeTab) {
      if (typeof window !== 'undefined') {
        window.history.pushState({ tab, workspaceMode }, '', `#tab=${tab}`);
      }
      setActiveTab(tab);
    }
  };

  // Helper to open modal and push state so phone hardware Back button closes modal
  const openModalWithHistory = (openFn: (v: boolean) => void) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({ modal: true, tab: activeTab }, '');
    }
    openFn(true);
  };

  // Synchronize Browser History & Mobile Hardware Back Gesture
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial entry
    window.history.replaceState({ tab: activeTab, workspaceMode }, '');

    const handlePopState = (e: PopStateEvent) => {
      // 1. Close open mobile drawer or active modals first when tapping phone Back button
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
        return;
      }
      if (isPresenterOpen) {
        setIsPresenterOpen(false);
        setActiveTab('generator');
        return;
      }
      if (isExportOpen) {
        setIsExportOpen(false);
        setActiveTab('generator');
        return;
      }
      if (isCompanionOpen) {
        setIsCompanionOpen(false);
        setActiveTab('generator');
        return;
      }
      if (isAccessibilityOpen) {
        setIsAccessibilityOpen(false);
        setActiveTab('generator');
        return;
      }
      if (isWorkspaceSelectorOpen) {
        setIsWorkspaceSelectorOpen(false);
        return;
      }
      if (isAuthOpen) {
        setIsAuthOpen(false);
        return;
      }

      // 2. Restore previous tab and workspace mode from history state
      if (e.state) {
        if (e.state.tab) {
          const targetTab = (e.state.tab === 'presenter_view' || e.state.tab === 'export_settings')
            ? 'generator'
            : e.state.tab;
          setActiveTab(targetTab);
        }
        if (e.state.workspaceMode) {
          setWorkspaceMode(e.state.workspaceMode);
        }
      } else {
        // Fallback to generator
        setActiveTab('generator');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    mobileMenuOpen,
    isPresenterOpen,
    isExportOpen,
    isCompanionOpen,
    isAccessibilityOpen,
    isWorkspaceSelectorOpen,
    isAuthOpen,
    activeTab,
    workspaceMode,
  ]);

  // Sync dark class with document element for unified styling
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Initialize with the AP Biology master curriculum deck on initial load
  useEffect(() => {
    const defaultDeck: SlideDeck = {
      title: 'Photosynthesis & Cellular Energy Transfer',
      subject: 'AP Biology & Life Sciences',
      targetAudience: 'High School (9-12)',
      gradeLevel: 'Advanced Placement (AP)',
      session: 'Session 1',
      illustrationStyle: 'Cartoon & Playful Illustration',
      colorTheme: 'Dark Tech',
      colorPalette: {
        name: 'Dark Tech',
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#10b981',
        background: '#09090b',
      },
      totalEstimatedMinutes: 28,
      pedagogyNotes: 'Dual-coding presentation calibrated for AP Biology Unit 3 (Session 1: Foundations & Orientation). Balances chemical electron flow mechanisms with high-resolution visual scaffolds, turnkey teacher teleprompter scripts, and embedded formative check-for-understanding questions.',
      createdAt: new Date().toISOString(),
      slides: [
        {
          id: 'slide-bio-1',
          slideNumber: 1,
          title: 'Photosynthesis & Cellular Energy Transfer',
          estimatedTime: '2 min',
          layoutType: 'Title Hero',
          headline: 'Harnessing Solar Energy to Drive Terrestrial and Marine Ecosystems',
          bullets: [
            '**The Core Paradigm:** Conversion of solar radiant photon energy into stable covalent chemical bonds.',
            '**Thermodynamic Flow:** Endergonic reduction of carbon dioxide driven by sunlight photolysis.',
            '**Session Roadmap:** Thylakoid light-dependent cascades transitioning into stromal Calvin cycle synthesis.',
          ],
          speakerNotes: `🗣️ WHAT TO SAY OUT LOUD:
"Welcome AP Biology scholars! Today we are unlocking the biological engine that powers almost all life on Earth: Photosynthesis and Cellular Energy Transfer. Notice our headline—every calorie that fuels animal and human metabolism traces its lineage back to the photon reactions we dissect today."

💡 HOW TO EXPLAIN SIMPLY (Everyday Analogy):
Think of a chloroplast like a miniature solar-powered factory: the thylakoid membranes are the solar panels charging temporary powerbanks (ATP & NADPH), while the stroma is the assembly line using that stored power to manufacture long-term glucose boxes.

🎯 DELIVERY & ACTION CUES:
[Action: Point to the chloroplast organelle illustration on the right half of the screen]
[Pacing: Pause 8 seconds after introducing the core objective for students to record key terms in their notes]

⚠️ COMMON STUDENT MISCONCEPTION:
Students often assume plants perform photosynthesis *instead* of cellular respiration. Emphasize that plants do BOTH: photosynthesis creates glucose, and mitochondria break it down for cellular work.

❓ SOCRATIC CHECK-IN QUESTION:
"Who can tell me where the oxygen gas in this room originally came from?"`,
          visualPrompt: {
            imagePrompt: 'Cartoon & Playful Illustration representing Photosynthesis & Cellular Energy Transfer, featuring vibrant storybook cartoon illustrations, bold expressive outlines, warm pastel gouache fills, animated friendly character metaphors, colorful hand-drawn details, joyful classroom appeal, 8k.',
            recommendedPlacement: 'Right 50% split',
            designInstructions: 'Bold 44pt title header on left side; right half displays the friendly cartoon chloroplast organelle character with rounded border and subtle inner glow.',
            suggestedIcon: 'Leaf',
            altText: 'Playful cartoon illustration of a leaf mesophyll cell showing chloroplast organelles with glowing thylakoid grana.',
            illustrationStyle: 'Cartoon & Playful Illustration',
            customSvgArt: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#09090b" rx="20"/><circle cx="200" cy="150" r="110" fill="#10b981" opacity="0.15"/><path d="M120,150 Q160,80 240,110 T280,180 T180,220 Z" fill="#059669" stroke="#34d399" stroke-width="4"/><circle cx="170" cy="130" r="18" fill="#38bdf8" opacity="0.8"/><circle cx="210" cy="150" r="18" fill="#facc15" opacity="0.8"/><circle cx="190" cy="180" r="18" fill="#a855f7" opacity="0.8"/><circle cx="240" cy="140" r="14" fill="#38bdf8" opacity="0.8"/><path d="M80,80 L120,110 M320,80 L280,110" stroke="#facc15" stroke-width="3" stroke-dasharray="4,4"/><text x="200" y="260" text-anchor="middle" fill="#34d399" font-size="14" font-weight="bold" font-family="sans-serif">Chloroplast Bio-Engine</text></svg>`,
          },
          assessment: {
            question: 'What is the primary thermodynamic classification of photosynthetic carbohydrate synthesis?',
            type: 'multiple_choice',
            options: [
              'Exergonic catabolism releasing free energy',
              'Endergonic anabolism requiring external solar energy input',
              'Spontaneous equilibrium without net Gibbs free energy change',
              'Purely mechanical physical phase transition',
            ],
            correctAnswer: 'Endergonic anabolism requiring external solar energy input',
            explanation: 'Photosynthesis builds complex glucose polymers from simple CO2 and H2O, which requires continuous solar thermodynamic input (positive ΔG).',
          },
        },
        {
          id: 'slide-bio-2',
          slideNumber: 2,
          title: 'Chloroplast Structural Architecture',
          estimatedTime: '3 min',
          layoutType: 'Split Comparison 50/50',
          headline: 'Spatial Compartmentalization Enables Proton Electrochemical Gradients',
          bullets: [
            '**Thylakoid Membrane:** Lipid bilayer housing Photosystems II and I alongside ATP Synthase complexes.',
            '**Thylakoid Lumen:** Microscopic reservoir where accumulated H⁺ protons generate a steep pH gradient.',
            '**Fluid Stroma:** Alkaline enzymatic matrix where carbon-fixation enzymes (RuBisCO) reside.',
          ],
          speakerNotes: `🗣️ WHAT TO SAY OUT LOUD:
"Notice the physical compartments on this diagram. Form strictly follows function here. If the thylakoid lumen were not a tightly sealed membrane container, protons would diffuse away freely into the stroma and ATP synthase would completely fail to spin."

💡 HOW TO EXPLAIN SIMPLY (Everyday Analogy):
Think of the thylakoid lumen like the water reservoir behind a hydroelectric dam. As protons pile up inside, pressure builds up—and the only outlet is through the turbine wheel (ATP Synthase) to generate electricity (ATP)!

🎯 DELIVERY & ACTION CUES:
[Action: Point to the comparison split between Lumen and Stroma on screen]
[Engagement: Ask students: 'What organelle does this spatial proton gradient remind you of?']

⚠️ COMMON STUDENT MISCONCEPTION:
Students often confuse the Stroma (chloroplast fluid) with the Stomata (microscopic pores on the leaf surface). Remind them that Stroma = Space inside chloroplast; Stomata = Slots on leaf surface.

❓ SOCRATIC CHECK-IN QUESTION:
"If the thylakoid membrane developed microscopic leaks, what would happen to ATP production?"`,
          visualPrompt: {
            imagePrompt: 'Cartoon & Playful Illustration of chloroplast compartments including the thylakoid membrane, lumen, and stroma, featuring stacked coin-like grana, friendly glowing H+ character icons, vibrant emerald and teal palette.',
            recommendedPlacement: 'Right 50% split',
            designInstructions: 'Two-column comparison layout with labeled anatomical callout badges for Stroma versus Lumen.',
            suggestedIcon: 'Layers',
            altText: 'Cartoon diagram illustrating chloroplast compartments including the thylakoid membrane, lumen, and stroma.',
            illustrationStyle: 'Cartoon & Playful Illustration',
            customSvgArt: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#09090b" rx="20"/><rect x="50" y="50" width="140" height="180" rx="16" fill="#064e3b" stroke="#10b981" stroke-width="3"/><rect x="210" y="50" width="140" height="180" rx="16" fill="#1e1b4b" stroke="#8b5cf6" stroke-width="3"/><text x="120" y="80" text-anchor="middle" fill="#34d399" font-size="14" font-weight="bold">LUMEN (H+ High)</text><text x="280" y="80" text-anchor="middle" fill="#a78bfa" font-size="14" font-weight="bold">STROMA (Calvin)</text><circle cx="90" cy="120" r="10" fill="#facc15"/><circle cx="120" cy="150" r="10" fill="#facc15"/><circle cx="150" cy="120" r="10" fill="#facc15"/><circle cx="100" cy="180" r="10" fill="#facc15"/><circle cx="140" cy="180" r="10" fill="#facc15"/><text x="280" y="140" font-size="28" text-anchor="middle">🧪</text><text x="280" y="170" fill="#e2e8f0" font-size="11" text-anchor="middle">RuBisCO Matrix</text></svg>`,
          },
          assessment: {
            question: 'Why is the physical compartmentalization of the thylakoid lumen essential for photophosphorylation?',
            type: 'discussion',
            explanation: 'Compartmentalization confines protons (H+), generating the proton motive force needed to drive chemiosmotic ATP synthesis.',
          },
        },
        {
          id: 'slide-bio-3',
          slideNumber: 3,
          title: 'Stage 1: The Light-Dependent Cascade',
          estimatedTime: '4 min',
          layoutType: 'Timeline Flow',
          headline: 'Photolysis, Electron Transport, and Chemiosmotic ATP Generation',
          bullets: [
            '**Photosystem II (P680):** Absorbs 680nm photons; photolysis splits 2H₂O → 4H⁺ + 4e⁻ + O₂ as vital byproduct.',
            '**Electron Transport Chain:** Cytochrome b6f complex pumps protons into lumen across the membrane.',
            '**Photosystem I (P700) & FNR:** Electrons are re-energized to reduce NADP⁺ into high-energy NADPH.',
          ],
          speakerNotes: `🗣️ WHAT TO SAY OUT LOUD:
"Let's trace the chronological journey of an excited electron! Photons strike Photosystem II, which causes water molecules to literally split open—releasing the breathable oxygen gas that we are inhaling right now."

💡 HOW TO EXPLAIN SIMPLY (Everyday Analogy):
Think of the Electron Transport Chain like a microscopic relay race: sunlight gives the first runner (the electron) a massive boost of caffeine, and as they run down the track, their energy is used to pump water up into a high tower!

🎯 DELIVERY & ACTION CUES:
[Action: Trace your hand across the four timeline stages from left to right]
[Pacing: Pause for 10 seconds while students write down the water photolysis chemical equation]

⚠️ COMMON STUDENT MISCONCEPTION:
Students often think Photosystem I happens first because of its number. Emphasize that Photosystem II actually acts FIRST in the linear pathway! (It was discovered second, hence the name).

❓ SOCRATIC CHECK-IN QUESTION:
"If a plant is kept in total darkness, which specific molecule will stop being produced first: ATP or NADPH?"`,
          visualPrompt: {
            imagePrompt: 'Cartoon & Playful Illustration showing chronological timeline flow of Photosystem II, Cytochrome, Photosystem I, and ATP Synthase with friendly electron characters, glowing golden pathways, dynamic storybook vector aesthetics.',
            recommendedPlacement: 'Full bleed background with 70% dark overlay',
            designInstructions: 'Horizontal timeline flow connecting four sequential molecular complexes with glowing direction arrows.',
            suggestedIcon: 'Activity',
            altText: 'Cartoon timeline flow diagram showing Photosystem II, ETC, Photosystem I, and ATP Synthase.',
            illustrationStyle: 'Cartoon & Playful Illustration',
            customSvgArt: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#09090b" rx="20"/><path d="M40,150 L360,150" stroke="#4f46e5" stroke-width="6" stroke-linecap="round"/><circle cx="80" cy="150" r="28" fill="#3b82f6"/><circle cx="160" cy="150" r="24" fill="#a855f7"/><circle cx="240" cy="150" r="28" fill="#06b6d4"/><circle cx="320" cy="150" r="32" fill="#10b981"/><text x="80" y="155" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">PS II</text><text x="160" y="155" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">ETC</text><text x="240" y="155" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">PS I</text><text x="320" y="155" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">ATP Syn</text><path d="M80,100 L80,122" stroke="#facc15" stroke-width="3" marker-end="url(#arrow)"/><text x="80" y="90" text-anchor="middle" fill="#facc15" font-size="11" font-weight="bold">☀️ Photon</text></svg>`,
          },
        },
        {
          id: 'slide-bio-4',
          slideNumber: 4,
          title: 'Stage 2: The Calvin Cycle (Light-Independent)',
          estimatedTime: '4 min',
          layoutType: '3-Column Grid',
          headline: 'Carbon Fixation, Reduction, and RuBP Regeneration in the Stroma',
          bullets: [
            '**Phase 1 (Carbon Fixation):** The enzyme RuBisCO attaches atmospheric CO₂ onto 5-carbon RuBP.',
            '**Phase 2 (Chemical Reduction):** ATP and NADPH donate energy and electrons to convert 3-PGA into G3P.',
            '**Phase 3 (RuBP Regeneration):** Five G3P molecules rearrange with ATP consumption to sustain cycle turnover.',
          ],
          speakerNotes: `🗣️ WHAT TO SAY OUT LOUD:
"Now let's step into the chloroplast stroma for Stage 2: The Calvin Cycle. Even though this stage is called 'light-independent', it doesn't happen in pitch darkness—it depends directly on the fresh ATP and NADPH produced by the light reactions moments ago."

💡 HOW TO EXPLAIN SIMPLY (Everyday Analogy):
Think of the Calvin Cycle like a 3-step recycling carousel: 1) Catching carbon gas out of the air, 2) Charging it up with energetic batteries to make sugar, and 3) Rebuilding the empty catchers so the carousel can turn again!

🎯 DELIVERY & ACTION CUES:
[Action: Point to Phase 1, Phase 2, and Phase 3 on the 3-column grid]
[Engagement: Ask: 'What happens to Calvin cycle turnover if the lights suddenly shut off?']

⚠️ COMMON STUDENT MISCONCEPTION:
Students often write that glucose is the immediate direct output of the Calvin Cycle. Remind them that the actual direct product is G3P (a 3-carbon sugar), which two of combine later to form glucose.

❓ SOCRATIC CHECK-IN QUESTION:
"Out of 6 G3P sugar molecules produced in the cycle, how many actually leave the cycle to build carbohydrates?"`,
          visualPrompt: {
            imagePrompt: 'Cartoon & Playful Illustration of the 3 circular molecular stages representing Carbon Fixation, Reduction, and Regeneration, each glowing with distinct pastel colors (amber, cyan, emerald) on a dark slate background.',
            recommendedPlacement: 'Top banner',
            designInstructions: 'Three-column horizontal layout with equal card widths; highlight RuBisCO enzyme in Phase 1 with a golden badge.',
            suggestedIcon: 'RefreshCw',
            altText: 'Cartoon three-stage schematic of the Calvin Cycle: Carbon Fixation, Reduction, and Regeneration.',
            illustrationStyle: 'Cartoon & Playful Illustration',
            customSvgArt: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#09090b" rx="20"/><circle cx="200" cy="150" r="80" fill="none" stroke="#6366f1" stroke-width="6" stroke-dasharray="12,6"/><circle cx="200" cy="70" r="24" fill="#f59e0b"/><circle cx="270" cy="190" r="24" fill="#06b6d4"/><circle cx="130" cy="190" r="24" fill="#10b981"/><text x="200" y="74" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">1. Fixation</text><text x="270" y="194" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">2. Reduce</text><text x="130" y="194" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">3. Regen</text><text x="200" y="145" text-anchor="middle" fill="#34d399" font-size="14" font-weight="bold">Calvin Cycle</text><text x="200" y="165" text-anchor="middle" fill="#94a3b8" font-size="11">G3P Output 🍬</text></svg>`,
          },
          assessment: {
            question: 'For every six G3P molecules synthesized during the Calvin cycle, how many net G3P exit to form glucose?',
            type: 'multiple_choice',
            options: [
              'All 6 G3P molecules exit',
              'Only 1 net G3P exits (5 must regenerate RuBP)',
              '3 G3P molecules exit',
              '0 G3P molecules exit; all are discarded',
            ],
            correctAnswer: 'Only 1 net G3P exits (5 must regenerate RuBP)',
            explanation: 'To maintain the continuous catalytic cycle, 5 out of every 6 G3P molecules must be recycled with ATP to regenerate RuBP acceptors.',
          },
        },
        {
          id: 'slide-bio-5',
          slideNumber: 5,
          title: 'Environmental Rate Limiting Factors',
          estimatedTime: '3 min',
          layoutType: 'Big Stat / Callout',
          headline: 'Kinetics of Light Intensity, CO₂ Saturation, and Temperature',
          bullets: [
            '**Light Saturation Point:** Above critical photon flux, electron transport reaches maximum catalytic velocity.',
            '**CO₂ Enrichment:** Low atmospheric CO₂ limits RuBisCO efficiency and induces wasteful photorespiration.',
            '**Thermal Denaturation:** Temperatures above 40°C denature photosynthetic enzymes and close leaf stomata.',
          ],
          speakerNotes: `🗣️ WHAT TO SAY OUT LOUD:
"Look at these rate-limiting curves. Photosynthesis doesn't just increase forever linearly—it reaches saturation plateaus determined by whichever reactant or environmental factor is in shortest supply."

💡 HOW TO EXPLAIN SIMPLY (Everyday Analogy):
Think of a factory with 10 workers and 2 sewing machines: hiring 50 more workers won't produce more shirts because the sewing machines (enzymes) are already running at 100% capacity!

🎯 DELIVERY & ACTION CUES:
[Action: Point to the three saturation curve cards on screen]
[Pacing: Have students sketch the classic saturation plateau curves in their Cornell notes cues column]

⚠️ COMMON STUDENT MISCONCEPTION:
Students often think higher temperature always speeds up photosynthesis. Remind them that above ~40°C, enzymes denature and stomata close to prevent water loss, causing rate to plummet!

❓ SOCRATIC CHECK-IN QUESTION:
"Why does increasing CO2 concentration eventually stop increasing the rate of photosynthesis?"`,
          visualPrompt: {
            imagePrompt: 'Cartoon & Playful Illustration of 3 glowing saturation curve charts for light, CO2, and temperature, animated science lab theme, colorful vector badges.',
            recommendedPlacement: 'Center floating icon',
            designInstructions: 'High-contrast stat callouts with 64pt numeric badges and stylized micro-charts.',
            suggestedIcon: 'TrendingUp',
            altText: 'Cartoon graphs illustrating the saturation curves for light, CO2, and temperature.',
            illustrationStyle: 'Cartoon & Playful Illustration',
            customSvgArt: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#09090b" rx="20"/><path d="M60,220 Q120,100 200,100 L340,100" fill="none" stroke="#10b981" stroke-width="5"/><path d="M60,220 L340,220" stroke="#334155" stroke-width="3"/><path d="M60,60 L60,220" stroke="#334155" stroke-width="3"/><text x="200" y="80" text-anchor="middle" fill="#34d399" font-size="13" font-weight="bold">Saturation Plateau (Vmax)</text><text x="200" y="250" text-anchor="middle" fill="#94a3b8" font-size="12">Light Intensity / CO2 Concentration →</text></svg>`,
          },
        },
        {
          id: 'slide-bio-6',
          slideNumber: 6,
          title: 'Synthesis Check & Classroom Exit Ticket',
          estimatedTime: '3 min',
          layoutType: 'Teacher-Led Discussion Prompt',
          headline: 'Connecting Cellular Mechanics to Global Ecological Carbon Sinks',
          bullets: [
            '**Core Synthesis Question:** How does the evolutionary origin of chloroplasts support the Endosymbiotic Theory?',
            '**Peer Calibration:** Explain the role of water photolysis to your shoulder partner in under 30 seconds.',
            '**Exit Ticket Prompt:** Record your answer in the Cornell Notes summary section before leaving class.',
          ],
          speakerNotes: `🗣️ WHAT TO SAY OUT LOUD:
"Let's bring our lesson together for our final synthesis reflection. Give yourselves 60 seconds of quiet thinking time to review how chloroplast endosymbiosis connects to Earth's carbon cycle before discussing with your peer partner."

💡 HOW TO EXPLAIN SIMPLY (Everyday Analogy):
Think of endosymbiosis like a primitive single cell adopting a photosynthetic solar panel microbe millions of years ago, giving birth to the ancestor of every green plant on Earth today!

🎯 DELIVERY & ACTION CUES:
[Action: Start 60-second silent reflection timer]
[Engagement: Celebrate creative student analogies during peer sharing time!]

⚠️ COMMON STUDENT MISCONCEPTION:
Students often forget that chloroplasts have their OWN circular DNA and double membrane. Highlight this as direct evolutionary evidence of cyanobacterial endosymbiosis!

❓ SOCRATIC CHECK-IN QUESTION:
"Who can summarize in one sentence why water photolysis was a turning point in Earth's evolutionary history?"`,
          visualPrompt: {
            imagePrompt: 'Cartoon & Playful Illustration of a majestic ancient tree glowing with visible green veins of nutrient transport at twilight, illuminated by golden sunset rays, serene storybook nature illustration.',
            recommendedPlacement: 'Right 50% split',
            designInstructions: 'Exit ticket prompt card highlighted in vibrant emerald with countdown timer indicator.',
            suggestedIcon: 'BookOpen',
            altText: 'Cartoon illustration of a majestic ancient tree symbolizing the global ecological impact of photosynthesis.',
            illustrationStyle: 'Cartoon & Playful Illustration',
            customSvgArt: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#09090b" rx="20"/><path d="M200,240 C170,240 180,180 180,150 C150,140 130,100 160,70 C180,40 220,40 240,70 C270,100 250,140 220,150 C220,180 230,240 200,240 Z" fill="#059669" stroke="#34d399" stroke-width="4"/><circle cx="200" cy="100" r="50" fill="#10b981" opacity="0.6"/><text x="200" y="270" text-anchor="middle" fill="#34d399" font-size="14" font-weight="bold">Mastery Synthesis & Exit Ticket</text></svg>`,
          },
          assessment: {
            question: 'Which of the following provides primary evidence that chloroplasts evolved through ancient endosymbiosis?',
            type: 'multiple_choice',
            options: [
              'Chloroplasts possess their own circular DNA and 70S ribosomes',
              'Chloroplasts are identical in structure to modern animal mitochondria',
              'Chloroplasts can survive independently in soil without host plant cells',
              'Chloroplasts do not require proteins encoded in the host nuclear genome',
            ],
            correctAnswer: 'Chloroplasts possess their own circular DNA and 70S ribosomes',
            explanation: 'Chloroplasts retain their own circular chromosome and bacterial-like 70S ribosomes, reflecting their evolutionary origin as engulfed cyanobacteria.',
          },
        },
      ],
    };

    clearLegacySharedCaches();

    // Check if there is an active logged-in user in localStorage
    let storedUser: any = null;
    try {
      const stored = localStorage.getItem('slidecraft_active_app_user');
      if (stored) storedUser = JSON.parse(stored);
    } catch {}

    const uid = storedUser?.uid || null;
    lastUserRef.current = uid;
    if (storedUser) {
      setCurrentUser(storedUser);
    }

    const offlineDecks = getDecksFromOfflineCache(uid);
    const offlineActive = getActiveDeckFromOfflineCache(uid);

    if (offlineActive) {
      setCurrentDeck(offlineActive);
    } else {
      setCurrentDeck(defaultDeck);
    }

    if (offlineDecks && offlineDecks.length > 0) {
      setSavedDecks(offlineDecks);
    } else {
      setSavedDecks(uid ? [] : [defaultDeck]);
    }
  }, []);

  // Sync savedDecks and currentDeck to offline cache storage strictly scoped to currentUser
  useEffect(() => {
    if (savedDecks) {
      saveDecksToOfflineCache(savedDecks, currentUser?.uid || null);
    }
  }, [savedDecks, currentUser?.uid]);

  useEffect(() => {
    if (currentDeck) {
      saveActiveDeckToOfflineCache(currentDeck, currentUser?.uid || null);
    }
  }, [currentDeck, currentUser?.uid]);

  // Listen for Firebase Auth or Custom App Database session changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      let activeUser = user;
      if (!activeUser) {
        try {
          const stored = localStorage.getItem('slidecraft_active_app_user');
          if (stored) {
            activeUser = JSON.parse(stored);
          }
        } catch {}
      }

      const prevUid = lastUserRef.current;
      const newUid = activeUser ? activeUser.uid : null;

      if (prevUid !== newUid) {
        lastUserRef.current = newUid;
        setCurrentUser(activeUser);

        if (activeUser) {
          // 1. Immediately isolate user history: load only this user's private offline cache
          const userCache = getDecksFromOfflineCache(activeUser.uid);
          if (userCache && userCache.length > 0) {
            setSavedDecks(userCache);
            setCurrentDeck(userCache[0]);
          } else {
            setSavedDecks([]);
          }

          // 2. Fetch User's private decks from Firestore
          try {
            setIsSyncingCloudDecks(true);
            const cloudDecks = await fetchUserDecksFromFirestore(activeUser.uid);
            if (cloudDecks && cloudDecks.length > 0) {
              setSavedDecks(cloudDecks);
              setCurrentDeck(cloudDecks[0]);
              saveDecksToOfflineCache(cloudDecks, activeUser.uid);
            } else {
              setSavedDecks([]);
              saveDecksToOfflineCache([], activeUser.uid);
            }
          } catch (err) {
            console.error('Failed to load past decks from cloud:', err);
          } finally {
            setIsSyncingCloudDecks(false);
          }

          // If user is admin, prompt workspace choice
          if (isUserAdmin(activeUser.email)) {
            setIsWorkspaceSelectorOpen(true);
          }
        } else {
          // User logged out: clear state to guest session
          const guestDecks = getDecksFromOfflineCache(null);
          setSavedDecks(guestDecks);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSignOut = async () => {
    try {
      if (currentUser) {
        recordSystemLog({
          level: 'INFO',
          category: 'AUTH',
          action: 'USER_SIGN_OUT',
          userEmail: currentUser.email || 'user',
          userId: currentUser.uid,
          details: 'User logged out of SlideCraft session',
        });
      }
      await signOutUser();
      lastUserRef.current = null;
      setCurrentUser(null);
      setWorkspaceMode('studio');

      // Reset personal history to guest defaults so next user cannot see previous user's history
      const guestDecks = getDecksFromOfflineCache(null);
      setSavedDecks(guestDecks);
      triggerToast('Signed out. Personal history secured.');
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  const handleSyncCloudDecks = async () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setIsSyncingCloudDecks(true);
    try {
      const cloudDecks = await fetchUserDecksFromFirestore(currentUser.uid);
      if (cloudDecks && cloudDecks.length > 0) {
        setSavedDecks(cloudDecks);
        saveDecksToOfflineCache(cloudDecks, currentUser.uid);
        triggerToast(`Synchronized ${cloudDecks.length} presentations from personal cloud history.`);
      } else {
        setSavedDecks([]);
        saveDecksToOfflineCache([], currentUser.uid);
        triggerToast('Personal cloud history is up to date.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to sync personal cloud history.');
    } finally {
      setIsSyncingCloudDecks(false);
    }
  };

  const handleSaveDeckToCloud = async (deckToSave: SlideDeck) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setIsSavingToCloud(true);
    try {
      const saved = await saveDeckToFirestore(currentUser.uid, deckToSave);
      setCurrentDeck(saved);
      setSavedDecks((prev) => {
        const existingIndex = prev.findIndex((d) => (d.id && d.id === saved.id) || d.title === saved.title);
        if (existingIndex >= 0) {
          const next = [...prev];
          next[existingIndex] = saved;
          return next;
        }
        return [saved, ...prev];
      });

      recordSystemLog({
        level: 'SUCCESS',
        category: 'FIRESTORE',
        action: 'DECK_SAVED_TO_CLOUD',
        userEmail: currentUser.email || 'educator',
        userId: currentUser.uid,
        details: `Saved presentation "${saved.title}" (${saved.slides.length} slides)`,
        metadata: {
          slideCount: saved.slides.length,
          subject: saved.subject,
        },
      });

      triggerToast(`"${saved.title}" saved to your cloud library!`);
    } catch (err) {
      console.error('Failed to save deck to cloud:', err);
      triggerToast('Could not save to cloud. Please try again.');
    } finally {
      setIsSavingToCloud(false);
    }
  };

  const handleGenerateDeck = async (params: {
    content: string;
    targetAudience: TargetAudience;
    deckLength: DeckLength;
    customSlideCount?: number;
    slideTone: SlideTone;
    colorTheme?: ColorThemeName;
    session?: CurriculumSession;
    illustrationStyle?: IllustrationStyle;
    customFocus?: string;
  }) => {
    setIsGenerating(true);
    const startTime = Date.now();
    try {
      const expectedCount = params.customSlideCount || (
        params.deckLength === 'deep' ? 18 :
        params.deckLength === 'short' ? 6 :
        params.deckLength === 'standard' ? 12 : undefined
      );

      let generated = await generateDeckAPI(params);

      // Validation Step: re-trigger generation if the returned slide array length does not match requested count
      if (expectedCount && generated.slides.length !== expectedCount) {
        console.warn(`Slide count validation: received ${generated.slides.length} slides, expected ${expectedCount}. Re-triggering generation...`);
        try {
          const retriggered = await generateDeckAPI({
            ...params,
            customSlideCount: expectedCount,
          });
          if (retriggered.slides && retriggered.slides.length === expectedCount) {
            generated = retriggered;
          }
        } catch (retryErr) {
          console.warn('Re-trigger verification note:', retryErr);
        }
      }

      const elapsed = Date.now() - startTime;

      recordSystemLog({
        level: 'SUCCESS',
        category: 'AI_GEN',
        action: 'DECK_GENERATION_SUCCESS',
        userEmail: currentUser?.email || 'guest_educator',
        userId: currentUser?.uid || 'guest_session',
        details: `Architected "${generated.title}" (${generated.slides.length} slides) in ${(elapsed / 1000).toFixed(1)}s`,
        metadata: {
          latencyMs: elapsed,
          slideCount: generated.slides.length,
          subject: generated.subject,
          audience: generated.targetAudience,
          model: 'models/gemini-3.8-flash',
        },
      });

      if (currentUser) {
        try {
          const cloudSaved = await saveDeckToFirestore(currentUser.uid, generated);
          setCurrentDeck(cloudSaved);
          setSavedDecks((prev) => [cloudSaved, ...prev]);
        } catch (saveErr) {
          console.error('Auto-save to cloud failed:', saveErr);
          setCurrentDeck(generated);
          setSavedDecks((prev) => [generated, ...prev]);
        }
      } else {
        setCurrentDeck(generated);
        setSavedDecks((prev) => [generated, ...prev]);
      }
      setActiveTab('generator');

      // Celebrate with confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#8b5cf6', '#10b981', '#38bdf8'],
      });

      triggerToast(`Presentation "${generated.title}" architected with ${generated.slides.length} slides!`);
    } catch (err: any) {
      console.error(err);
      const friendly = humanizeError(err);
      recordSystemLog({
        level: 'ERROR',
        category: 'AI_GEN',
        action: 'DECK_GENERATION_FAILED',
        userEmail: currentUser?.email || 'guest_educator',
        details: err.message || 'Generation failed',
        metadata: { errorMessage: err.message },
      });
      triggerToast(`${friendly.title}: ${friendly.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadSample = (sample: SampleCurriculum) => {
    handleGenerateDeck({
      content: sample.sourceText,
      targetAudience: sample.audience as TargetAudience,
      deckLength: 'standard',
      slideTone: 'Highly Visual & Minimalist',
      colorTheme: 'Dark Tech',
      customFocus: `Focus on visual clarity, student active learning, and ${sample.subject}`,
    });
  };

  const handleDeleteSavedDeck = async (index: number) => {
    const deckToDelete = savedDecks[index];
    if (deckToDelete && deckToDelete.id && currentUser) {
      try {
        await deleteDeckFromFirestore(currentUser.uid, deckToDelete.id);
        recordSystemLog({
          level: 'INFO',
          category: 'FIRESTORE',
          action: 'DECK_DELETED',
          userEmail: currentUser.email || 'educator',
          userId: currentUser.uid,
          details: `Deleted presentation "${deckToDelete.title}"`,
        });
      } catch (err) {
        console.error('Failed to delete from Firestore:', err);
      }
    }
    setSavedDecks((prev) => prev.filter((_, idx) => idx !== index));
    triggerToast('Deck removed from your curriculum library.');
  };

  return (
    <div className={`min-h-screen w-full relative font-sans transition-colors duration-200 ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-2.5 rounded-2xl shadow-soft-lg text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-3 duration-200 ${
          isDark ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'
        }`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation (Desktop: Hover-Expand Rail / Mobile: Tap-Logo Slide Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'presenter_view') {
            if (!currentDeck) {
              triggerToast('Create or generate a presentation deck first to enter Practice Mode');
              handleSelectTabWithHistory('generator');
            } else {
              openModalWithHistory(setIsPresenterOpen);
            }
            return;
          }
          if (tab === 'export_settings') {
            if (!currentDeck) {
              triggerToast('Create or generate a presentation deck first to export');
              handleSelectTabWithHistory('generator');
            } else {
              openModalWithHistory(setIsExportOpen);
            }
            return;
          }
          handleSelectTabWithHistory(tab);
        }}
        isDark={isDark}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        toggleTheme={() => setThemeMode(themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light')}
        totalSlides={currentDeck?.slides.length || 0}
        wordCount={0}
        hasDeck={Boolean(currentDeck)}
        onOpenAccessibility={() => openModalWithHistory(setIsAccessibilityOpen)}
        onOpenCompanion={() => openModalWithHistory(setIsCompanionOpen)}
        currentUser={currentUser}
        onOpenAuth={() => openModalWithHistory(setIsAuthOpen)}
        onSignOut={handleSignOut}
        savedDecks={savedDecks}
        onSelectDeck={(d) => {
          setCurrentDeck(d);
          handleSelectTabWithHistory('generator');
          triggerToast(`Loaded: "${d.title}"`);
        }}
        currentDeck={currentDeck}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        workspaceMode={workspaceMode}
        onToggleWorkspaceMode={(mode) => {
          setWorkspaceMode(mode);
          if (mode === 'admin') setAdminSubTab('overview');
        }}
        isAdmin={isAdmin}
        onOpenWorkspaceSelector={() => openModalWithHistory(setIsWorkspaceSelectorOpen)}
        onOpenTemplateArchitect={() => {
          setWorkspaceMode('admin');
          setAdminSubTab('template_architect');
          triggerToast('Opening Master Template Architect Studio');
        }}
      />

      {/* Mobile Top Bar: Permanently Fixed Header at Top of Screen */}
      <div className={`md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-3 px-4 backdrop-blur-xl transition-all shadow-soft-sm border-b ${
        isDark ? 'bg-zinc-950/90 text-white border-zinc-800/60' : 'bg-white/95 text-zinc-900 border-zinc-200'
      }`}>
        <button
          onClick={() => openModalWithHistory(setMobileMenuOpen)}
          className="flex items-center gap-2.5 focus:outline-none cursor-pointer group active:scale-95 transition-transform"
          title="Tap to open navigation"
        >
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-soft-sm group-hover:scale-105 transition-transform ${
            isAdmin
              ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
              : isDark ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-white'
          }`}>
            {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <FolderGit2 className="w-4 h-4" />}
          </div>
          <div className="text-left">
            <span className={`font-display font-extrabold text-sm tracking-tight block ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              SlideCraft AI
            </span>
            <span className={`text-[10px] font-semibold ${isAdmin ? 'text-purple-400' : 'text-indigo-400'} block -mt-0.5`}>
              {isAdmin ? 'Admin Console ▾' : 'Tap for Menu & Decks ▾'}
            </span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton variant="compact" isDark={isDark} />

          {/* Mobile Quick Theme Switcher */}
          <button
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light')}
            className={`p-2 rounded-xl text-xs transition-colors cursor-pointer shadow-soft-xs ${
              isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-zinc-100 text-zinc-700'
            }`}
            title={`Theme: ${themeMode.toUpperCase()} (Click to toggle)`}
          >
            {themeMode === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : themeMode === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Monitor className="w-4 h-4 text-purple-400" />
            )}
          </button>

          {isAdmin && (
            <button
              onClick={() => setWorkspaceMode(workspaceMode === 'admin' ? 'studio' : 'admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-soft-xs ${
                workspaceMode === 'admin'
                  ? 'bg-purple-600 text-white'
                  : isDark ? 'bg-zinc-800 text-purple-300' : 'bg-purple-100 text-purple-900'
              }`}
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>{workspaceMode === 'admin' ? 'Studio' : 'Admin'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Workspace Viewport: Offset by 80px left rail on md+, pt-16 on mobile for fixed header */}
      <main className="md:pl-20 pt-16 md:pt-0 min-h-screen transition-all duration-300">
        {/* Top Floating Admin Quick Switcher Bar (Desktop) */}
        {isAdmin && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className={`p-2.5 px-4 rounded-2xl shadow-soft-sm flex flex-wrap items-center justify-between gap-3 transition-all ${
              isDark ? 'bg-zinc-900/90 text-white' : 'bg-white text-zinc-900'
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shrink-0" />
                <span className="text-xs font-extrabold flex items-center gap-1.5 truncate">
                  <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="hidden sm:inline">Administrator Privileges:</span>
                  <span className="font-mono text-purple-400 font-semibold truncate">{currentUser?.email}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* 3-way Theme Selector in Desktop Header */}
                <div className={`hidden sm:flex rounded-xl p-0.5 shadow-soft-xs ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
                  <button
                    onClick={() => setThemeMode('light')}
                    className={`p-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      themeMode === 'light'
                        ? 'bg-white text-zinc-900 shadow-soft-xs'
                        : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                    title="Light Theme"
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Light</span>
                  </button>
                  <button
                    onClick={() => setThemeMode('system')}
                    className={`p-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      themeMode === 'system'
                        ? isDark ? 'bg-zinc-800 text-white shadow-soft-xs' : 'bg-white text-zinc-900 shadow-soft-xs'
                        : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                    title="System Auto Theme"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Auto</span>
                  </button>
                  <button
                    onClick={() => setThemeMode('dark')}
                    className={`p-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      themeMode === 'dark'
                        ? isDark ? 'bg-zinc-800 text-white shadow-soft-xs' : 'bg-zinc-900 text-white shadow-soft-xs'
                        : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                    }`}
                    title="Dark Theme"
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Dark</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsWorkspaceSelectorOpen(true)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isDark ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  Switch Workspace
                </button>

                <div className={`flex rounded-xl p-0.5 shadow-soft-xs ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}>
                  <button
                    onClick={() => setWorkspaceMode('admin')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      workspaceMode === 'admin'
                        ? 'bg-purple-600 text-white shadow-soft-xs'
                        : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Admin Console</span>
                  </button>

                  <button
                    onClick={() => setWorkspaceMode('studio')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      workspaceMode === 'studio'
                        ? 'bg-indigo-600 text-white shadow-soft-xs'
                        : isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Studio Dashboard</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE VIEW: ADMIN vs NORMAL STUDIO */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {workspaceMode === 'admin' && isAdmin ? (
            <AdminDashboard
              isDark={isDark}
              onSwitchToStudio={() => setWorkspaceMode('studio')}
              savedDecks={savedDecks}
              initialSubTab={adminSubTab}
              onOpenDeckInStudio={(deck) => {
                setCurrentDeck(deck);
                setWorkspaceMode('studio');
                setActiveTab('generator');
                triggerToast(`Loaded: "${deck.title}" into Studio`);
              }}
            />
          ) : (
            <>
              {/* TAB 1: DECK GENERATOR & ARCHITECT */}
              {(activeTab === 'generator' || activeTab === 'presenter_view' || activeTab === 'export_settings') && (
                <div className={`space-y-6 ${!currentDeck ? 'min-h-[calc(100vh-140px)] flex flex-col justify-center' : ''}`}>
                  {/* Uploader Section */}
                  <DocumentUploader
                    onGenerate={handleGenerateDeck}
                    isGenerating={isGenerating}
                    isDark={isDark}
                    savedDecks={savedDecks}
                    onSelectDeck={(d) => {
                      setCurrentDeck(d);
                      triggerToast(`Loaded: "${d.title}"`);
                    }}
                    onOpenHistory={() => handleSelectTabWithHistory('curriculum_library')}
                    currentUser={currentUser}
                  />

                  {/* Generated Deck Workspace */}
                  {currentDeck && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-4 px-1">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-zinc-500" />
                          <h3 className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            Active Presentation Deck
                          </h3>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-xl shadow-soft-xs ${
                          isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-800'
                        }`}>
                          {currentDeck.slides.length} Slides
                        </span>
                      </div>

                      <SlideDeckWorkspace
                        deck={currentDeck}
                        onUpdateDeck={setCurrentDeck}
                        onOpenPresenter={() => openModalWithHistory(setIsPresenterOpen)}
                        onOpenExport={() => openModalWithHistory(setIsExportOpen)}
                        onOpenCompanion={() => openModalWithHistory(setIsCompanionOpen)}
                        onOpenAccessibility={() => openModalWithHistory(setIsAccessibilityOpen)}
                        isDark={isDark}
                        currentUser={currentUser}
                        onSaveDeckToCloud={handleSaveDeckToCloud}
                        isSavingToCloud={isSavingToCloud}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: VISUAL BLUEPRINT & IMAGE PROMPTER GALLERY */}
              {activeTab === 'visual_blueprint' && (
                currentDeck ? (
                  <VisualBlueprintGallery deck={currentDeck} isDark={isDark} />
                ) : (
                  <div className={`p-8 md:p-12 rounded-3xl text-center space-y-4 shadow-soft-sm ${
                    isDark ? 'bg-zinc-900/50 border border-zinc-800/80 text-zinc-300' : 'bg-white border border-zinc-200/80 text-zinc-700'
                  }`}>
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Palette className="w-7 h-7" />
                    </div>
                    <div className="space-y-1 max-w-md mx-auto">
                      <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        No Active Presentation Deck
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Generate a presentation deck or upload curriculum material to view and edit custom AI visual blueprints and illustrations.
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectTabWithHistory('generator')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-soft-xs cursor-pointer ${
                        isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                      }`}
                    >
                      Go to Deck Generator
                    </button>
                  </div>
                )
              )}

              {/* TAB 3: INTERACTIVE ASSESSMENTS & EXIT TICKETS */}
              {activeTab === 'assessments' && (
                currentDeck ? (
                  <AssessmentsHub deck={currentDeck} isDark={isDark} />
                ) : (
                  <div className={`p-8 md:p-12 rounded-3xl text-center space-y-4 shadow-soft-sm ${
                    isDark ? 'bg-zinc-900/50 border border-zinc-800/80 text-zinc-300' : 'bg-white border border-zinc-200/80 text-zinc-700'
                  }`}>
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <BarChart3 className="w-7 h-7" />
                    </div>
                    <div className="space-y-1 max-w-md mx-auto">
                      <h3 className={`text-base font-extrabold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                        No Active Assessments Available
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Upload lesson content or architect a deck to automatically generate interactive exit tickets, quizzes, and Kahoot exports.
                      </p>
                    </div>
                    <button
                      onClick={() => handleSelectTabWithHistory('generator')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-soft-xs cursor-pointer ${
                        isDark ? 'bg-white text-zinc-950 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'
                      }`}
                    >
                      Go to Deck Generator
                    </button>
                  </div>
                )
              )}

              {/* TAB 4: CURRICULUM LIBRARY & PRESETS */}
              {activeTab === 'curriculum_library' && (
                <CurriculumLibrary
                  currentDeck={currentDeck}
                  savedDecks={savedDecks}
                  onSelectDeck={(d) => {
                    setCurrentDeck(d);
                    setActiveTab('generator');
                    triggerToast(`Opened deck: "${d.title}"`);
                  }}
                  onDeleteDeck={handleDeleteSavedDeck}
                  onLoadSample={handleLoadSample}
                  isDark={isDark}
                  currentUser={currentUser}
                  onOpenAuth={() => setIsAuthOpen(true)}
                  onSyncCloudDecks={handleSyncCloudDecks}
                  isSyncing={isSyncingCloudDecks}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* FULLSCREEN PRESENTER PRACTICE MODE */}
      {isPresenterOpen && currentDeck && (
        <PresenterPracticeMode
          deck={currentDeck}
          onClose={() => {
            setIsPresenterOpen(false);
            handleSelectTabWithHistory('generator');
          }}
          isDark={isDark}
        />
      )}

      {/* MULTI-FORMAT EXPORT STUDIO MODAL */}
      {isExportOpen && currentDeck && (
        <ExportModal
          deck={currentDeck}
          onClose={() => {
            setIsExportOpen(false);
            handleSelectTabWithHistory('generator');
          }}
          isDark={isDark}
        />
      )}

      {/* STUDENT STUDY COMPANION MODAL (Cornell notes & Audio Snapshot) */}
      {isCompanionOpen && currentDeck && (
        <StudentCompanionModal
          deck={currentDeck}
          onClose={() => setIsCompanionOpen(false)}
          isDark={isDark}
        />
      )}

      {/* ACCESSIBILITY & UDL AUDIT MODAL */}
      {isAccessibilityOpen && currentDeck && (
        <AccessibilityDrawer
          deck={currentDeck}
          onClose={() => setIsAccessibilityOpen(false)}
          isDark={isDark}
        />
      )}

      {/* TEACHER AUTHENTICATION & HISTORY RESTORATION MODAL */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={async (user) => {
          lastUserRef.current = user.uid;
          setCurrentUser(user);
          triggerToast(`Welcome back, ${user.displayName || user.email}!`);
          try {
            setIsSyncingCloudDecks(true);
            const cloudDecks = await fetchUserDecksFromFirestore(user.uid);
            if (cloudDecks && cloudDecks.length > 0) {
              setSavedDecks(cloudDecks);
              setCurrentDeck(cloudDecks[0]);
              saveDecksToOfflineCache(cloudDecks, user.uid);
              triggerToast(`Restored ${cloudDecks.length} presentation decks from your personal history!`);
            } else {
              setSavedDecks([]);
              saveDecksToOfflineCache([], user.uid);
              triggerToast('Personal history is ready.');
            }
          } catch (err) {
            console.error('Error fetching past decks on login:', err);
          } finally {
            setIsSyncingCloudDecks(false);
          }

          if (isUserAdmin(user.email)) {
            setIsWorkspaceSelectorOpen(true);
          }
        }}
        isDark={isDark}
      />

      {/* ADMIN WORKSPACE SELECTION MODAL */}
      <AdminWorkspaceSelectorModal
        isOpen={isWorkspaceSelectorOpen}
        onClose={() => setIsWorkspaceSelectorOpen(false)}
        onSelectAdminDashboard={() => {
          setWorkspaceMode('admin');
          triggerToast('Switched to Administrator Console');
        }}
        onSelectNormalDashboard={() => {
          setWorkspaceMode('studio');
          triggerToast('Switched to Presentation Studio');
        }}
        currentMode={workspaceMode}
        userEmail={currentUser?.email}
        isDark={isDark}
      />

      {/* OFFLINE CONNECTIVITY INDICATOR */}
      <OfflineIndicator />
    </div>
  );
}

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Type,
  Square,
  Image as ImageIcon,
  LayoutTemplate,
  Presentation,
  Brush,
  Layers,
  Palette,
  Eye,
  Save,
  Trash2,
  Copy,
  Plus,
  ArrowLeft,
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Lock,
  Globe,
  Sliders,
  Check,
  Download,
  FileCode,
  Tag,
  Circle,
  Star,
  Triangle,
  ArrowRight,
  Hexagon,
  Minus,
  Maximize2,
  Atom,
  Brain,
  Lightbulb,
  Rocket,
  FlaskConical,
  Target,
  Trophy,
  BookOpen,
  Award,
  Compass,
  Zap,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Smartphone,
  Monitor,
  MoreVertical,
  X,
} from 'lucide-react';
import {
  PresentationTemplate,
  MasterSlideLayout,
  TemplateElement,
  TemplateElementType,
  ShapeType,
  DynamicPlaceholderTag,
} from '../../types/template';
import { saveAdminTemplateToFirestore } from '../../services/templateService';

interface TemplateArchitectStudioProps {
  template: PresentationTemplate;
  onSave: (savedTemplate: PresentationTemplate) => void;
  onClose: () => void;
  isDark: boolean;
}

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

const DYNAMIC_TAGS: { tag: DynamicPlaceholderTag; label: string; icon: string; desc: string }[] = [
  { tag: 'slide_title', label: 'Slide Title', icon: '🏷️', desc: 'Main slide headline/topic' },
  { tag: 'headline', label: 'Takeaway / Headline', icon: '💡', desc: 'Pedagogical takeaway summary' },
  { tag: 'bullet_1', label: 'Key Point 1', icon: '1️⃣', desc: 'First core concept bullet' },
  { tag: 'bullet_2', label: 'Key Point 2', icon: '2️⃣', desc: 'Second core concept bullet' },
  { tag: 'bullet_3', label: 'Key Point 3', icon: '3️⃣', desc: 'Third core concept bullet' },
  { tag: 'bullet_4', label: 'Key Point 4', icon: '4️⃣', desc: 'Fourth concept bullet' },
  { tag: 'session_tag', label: 'Session Tag', icon: '🔖', desc: 'E.g. "Session 1: Foundations"' },
  { tag: 'target_audience', label: 'Audience / Grade', icon: '👥', desc: 'Audience and grade level' },
  { tag: 'slide_number', label: 'Slide Number', icon: '🔢', desc: 'Automatic slide counter' },
  { tag: 'ai_visual_art', label: 'AI Visual Art Frame', icon: '🎨', desc: 'Dedicated AI vector illustration viewport' },
  { tag: 'assessment_question', label: 'Check Question', icon: '❓', desc: 'Interactive check-for-understanding' },
];

const SAMPLE_AI_DATA = {
  slide_title: 'Mitochondrial ATP Synthesis & Chemiosmosis',
  headline: 'Proton electrochemical gradient powers rotational F1-F0 ATP synthase motor complexes.',
  bullet_1: '• **Inner Membrane Potential:** Complexes I, III, and IV pump protons into the intermembrane space.',
  bullet_2: '• **Electrochemical Driving Force:** Matrix pH rises as high-energy protons accumulate in the lumen.',
  bullet_3: '• **Chemiosmotic Phosphorylation:** Proton flux through rotor drives catalytic synthesis of ATP.',
  bullet_4: '• **Metabolic Efficiency:** Delivers 28-32 net ATP molecules per fully oxidized glucose unit.',
  session_tag: 'SESSION 2 • DEEP DIVE',
  target_audience: 'Target: AP Biology (Grades 11-12)',
  slide_number: 'SLIDE 04 / 18',
  assessment_question: 'What is the immediate source of thermodynamic energy driving ATP synthase rotation?',
};

const FONT_OPTIONS = [
  { label: 'Space Grotesk (Modern Tech)', value: 'Space Grotesk, sans-serif' },
  { label: 'Plus Jakarta Sans (SaaS Clean)', value: 'Plus Jakarta Sans, sans-serif' },
  { label: 'Inter (Neutral Clean)', value: 'Inter, sans-serif' },
  { label: 'Playfair Display (Academic Serif)', value: 'Playfair Display, serif' },
  { label: 'Outfit (Vibrant Playful)', value: 'Outfit, sans-serif' },
  { label: 'JetBrains Mono (Technical Code)', value: 'JetBrains Mono, monospace' },
];

const PRESET_ICONS = [
  { name: 'Atom', icon: Atom },
  { name: 'Brain', icon: Brain },
  { name: 'Lightbulb', icon: Lightbulb },
  { name: 'Rocket', icon: Rocket },
  { name: 'Flask', icon: FlaskConical },
  { name: 'Target', icon: Target },
  { name: 'Trophy', icon: Trophy },
  { name: 'Book', icon: BookOpen },
  { name: 'Award', icon: Award },
  { name: 'Compass', icon: Compass },
  { name: 'Zap', icon: Zap },
];

export const TemplateArchitectStudio: React.FC<TemplateArchitectStudioProps> = ({
  template: initialTemplate,
  onSave,
  onClose,
  isDark,
}) => {
  const [template, setTemplate] = useState<PresentationTemplate>(initialTemplate);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'elements' | 'text' | 'shapes' | 'media' | 'background'>('elements');
  const [mobileTab, setMobileTab] = useState<'canvas' | 'tools' | 'inspector' | 'slides'>('canvas');
  const [isTestFillActive, setIsTestFillActive] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessToast, setSaveSuccessToast] = useState<string | null>(null);
  const [showMobileMoreMenu, setShowMobileMoreMenu] = useState<boolean>(false);
  const [showNudgeModal, setShowNudgeModal] = useState<boolean>(false);
  const [nudgeStep, setNudgeStep] = useState<number>(5);

  // Dragging & Resizing Canvas State (Mouse & Touch)
  const canvasRef = useRef<HTMLDivElement>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; elX: number; elY: number } | null>(null);
  const [isResizing, setIsResizing] = useState<string | null>(null); // 'se', 'sw', 'ne', 'nw'
  const [resizeStart, setResizeStart] = useState<{ x: number; y: number; w: number; h: number; elX: number; elY: number } | null>(null);

  const currentSlide = template.slides[activeSlideIndex] || template.slides[0];
  const selectedElement = currentSlide?.elements.find((el) => el.id === selectedElementId) || null;

  // Auto-fit scale on mount and window resize
  const calculateAutoFitScale = useCallback(() => {
    if (stageContainerRef.current) {
      const containerWidth = stageContainerRef.current.clientWidth;
      const containerHeight = stageContainerRef.current.clientHeight;
      const availableWidth = Math.max(260, containerWidth - 32);
      const availableHeight = Math.max(160, containerHeight - 64);
      const scaleW = availableWidth / CANVAS_WIDTH;
      const scaleH = availableHeight / CANVAS_HEIGHT;
      const fitScale = Math.min(1.1, Math.min(scaleW, scaleH));
      setZoomScale(Number(Math.max(0.28, fitScale).toFixed(2)));
    }
  }, []);

  useEffect(() => {
    calculateAutoFitScale();
    const handleResize = () => calculateAutoFitScale();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateAutoFitScale, mobileTab]);

  const triggerToast = (msg: string) => {
    setSaveSuccessToast(msg);
    setTimeout(() => setSaveSuccessToast(null), 3000);
  };

  // Update elements in active slide
  const updateActiveSlideElements = useCallback(
    (newElements: TemplateElement[]) => {
      setTemplate((prev) => {
        const nextSlides = [...prev.slides];
        nextSlides[activeSlideIndex] = {
          ...nextSlides[activeSlideIndex],
          elements: newElements,
        };
        return { ...prev, slides: nextSlides };
      });
    },
    [activeSlideIndex]
  );

  // Update single element property
  const updateSelectedElement = useCallback(
    (updates: Partial<TemplateElement>) => {
      if (!selectedElementId || !currentSlide) return;
      const updatedElements = currentSlide.elements.map((el) =>
        el.id === selectedElementId ? { ...el, ...updates } : el
      );
      updateActiveSlideElements(updatedElements);
    },
    [selectedElementId, currentSlide, updateActiveSlideElements]
  );

  // Add new element to slide
  const addElement = (newEl: Omit<TemplateElement, 'id' | 'zIndex'>) => {
    const nextZ = (currentSlide.elements.reduce((max, e) => Math.max(max, e.zIndex), 0) || 0) + 1;
    const el: TemplateElement = {
      ...newEl,
      id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      zIndex: nextZ,
    };
    updateActiveSlideElements([...currentSlide.elements, el]);
    setSelectedElementId(el.id);
    // On mobile, return to canvas so user immediately sees the added element
    setMobileTab('canvas');
  };

  // Delete element
  const deleteSelectedElement = () => {
    if (!selectedElementId) return;
    updateActiveSlideElements(currentSlide.elements.filter((el) => el.id !== selectedElementId));
    setSelectedElementId(null);
  };

  // Duplicate element
  const duplicateSelectedElement = () => {
    if (!selectedElement) return;
    const nextZ = (currentSlide.elements.reduce((max, e) => Math.max(max, e.zIndex), 0) || 0) + 1;
    const duplicated: TemplateElement = {
      ...selectedElement,
      id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      x: Math.min(CANVAS_WIDTH - selectedElement.width, selectedElement.x + 24),
      y: Math.min(CANVAS_HEIGHT - selectedElement.height, selectedElement.y + 24),
      zIndex: nextZ,
    };
    updateActiveSlideElements([...currentSlide.elements, duplicated]);
    setSelectedElementId(duplicated.id);
    triggerToast('Element duplicated');
  };

  // Nudge selected element by delta
  const handleNudge = (dx: number, dy: number) => {
    if (!selectedElement) return;
    const newX = Math.max(0, Math.min(CANVAS_WIDTH - selectedElement.width, selectedElement.x + dx));
    const newY = Math.max(0, Math.min(CANVAS_HEIGHT - selectedElement.height, selectedElement.y + dy));
    updateSelectedElement({ x: newX, y: newY });
  };

  // Center selected element
  const handleCenterElement = (axis: 'h' | 'v' | 'both') => {
    if (!selectedElement) return;
    const updates: Partial<TemplateElement> = {};
    if (axis === 'h' || axis === 'both') {
      updates.x = Math.round((CANVAS_WIDTH - selectedElement.width) / 2);
    }
    if (axis === 'v' || axis === 'both') {
      updates.y = Math.round((CANVAS_HEIGHT - selectedElement.height) / 2);
    }
    updateSelectedElement(updates);
    triggerToast('Element centered');
  };

  // Bring Forward / Send Backward
  const reorderElement = (direction: 'front' | 'back' | 'forward' | 'backward') => {
    if (!selectedElement) return;
    let elements = [...currentSlide.elements];
    const currentIndex = elements.findIndex((e) => e.id === selectedElement.id);
    if (currentIndex === -1) return;

    if (direction === 'front') {
      const el = elements.splice(currentIndex, 1)[0];
      elements.push(el);
    } else if (direction === 'back') {
      const el = elements.splice(currentIndex, 1)[0];
      elements.unshift(el);
    } else if (direction === 'forward' && currentIndex < elements.length - 1) {
      const temp = elements[currentIndex];
      elements[currentIndex] = elements[currentIndex + 1];
      elements[currentIndex + 1] = temp;
    } else if (direction === 'backward' && currentIndex > 0) {
      const temp = elements[currentIndex];
      elements[currentIndex] = elements[currentIndex - 1];
      elements[currentIndex - 1] = temp;
    }

    elements = elements.map((e, idx) => ({ ...e, zIndex: idx + 1 }));
    updateActiveSlideElements(elements);
  };

  // Save template to Firestore
  const handleSaveTemplate = async () => {
    setIsSaving(true);
    try {
      const saved = await saveAdminTemplateToFirestore(template);
      setTemplate(saved);
      onSave(saved);
      triggerToast('Master template saved successfully!');
    } catch (err) {
      console.error(err);
      triggerToast('Saved locally.');
    } finally {
      setIsSaving(false);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(template, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${template.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_master_template.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('Template exported as JSON file');
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported && imported.slides && Array.isArray(imported.slides)) {
          setTemplate(imported);
          setActiveSlideIndex(0);
          setSelectedElementId(null);
          triggerToast('Master template loaded successfully!');
        }
      } catch {
        triggerToast('Invalid JSON template file.');
      }
    };
    reader.readAsText(file);
  };

  // Image Upload handler for canvas
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      addElement({
        type: 'image',
        x: 100,
        y: 100,
        width: 320,
        height: 220,
        imageUrl: dataUrl,
        imageFit: 'cover',
        borderRadius: 16,
        shadow: 'soft-md',
      });
      triggerToast('Custom image asset placed on slide');
    };
    reader.readAsDataURL(file);
  };

  // Mouse & Touch Dragging Handlers
  const handlePointerStart = (clientX: number, clientY: number, el: TemplateElement) => {
    setSelectedElementId(el.id);
    setIsDragging(true);
    setDragStart({
      x: clientX,
      y: clientY,
      elX: el.x,
      elY: el.y,
    });
  };

  const handlePointerResizeStart = (clientX: number, clientY: number, handle: string) => {
    if (!selectedElement) return;
    setIsResizing(handle);
    setResizeStart({
      x: clientX,
      y: clientY,
      w: selectedElement.width,
      h: selectedElement.height,
      elX: selectedElement.x,
      elY: selectedElement.y,
    });
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (isDragging && dragStart && selectedElement) {
      const dx = (clientX - dragStart.x) / zoomScale;
      const dy = (clientY - dragStart.y) / zoomScale;
      const newX = Math.max(0, Math.min(CANVAS_WIDTH - selectedElement.width, Math.round(dragStart.elX + dx)));
      const newY = Math.max(0, Math.min(CANVAS_HEIGHT - selectedElement.height, Math.round(dragStart.elY + dy)));
      updateSelectedElement({ x: newX, y: newY });
    } else if (isResizing && resizeStart && selectedElement) {
      const dx = (clientX - resizeStart.x) / zoomScale;
      const dy = (clientY - resizeStart.y) / zoomScale;

      if (isResizing === 'se') {
        const newW = Math.max(30, Math.round(resizeStart.w + dx));
        const newH = Math.max(20, Math.round(resizeStart.h + dy));
        updateSelectedElement({ width: newW, height: newH });
      } else if (isResizing === 'sw') {
        const newW = Math.max(30, Math.round(resizeStart.w - dx));
        const newH = Math.max(20, Math.round(resizeStart.h + dy));
        const newX = Math.round(resizeStart.elX + (resizeStart.w - newW));
        updateSelectedElement({ width: newW, height: newH, x: newX });
      } else if (isResizing === 'ne') {
        const newW = Math.max(30, Math.round(resizeStart.w + dx));
        const newH = Math.max(20, Math.round(resizeStart.h - dy));
        const newY = Math.round(resizeStart.elY + (resizeStart.h - newH));
        updateSelectedElement({ width: newW, height: newH, y: newY });
      } else if (isResizing === 'nw') {
        const newW = Math.max(30, Math.round(resizeStart.w - dx));
        const newH = Math.max(20, Math.round(resizeStart.h - dy));
        const newX = Math.round(resizeStart.elX + (resizeStart.w - newW));
        const newY = Math.round(resizeStart.elY + (resizeStart.h - newH));
        updateSelectedElement({ width: newW, height: newH, x: newX, y: newY });
      }
    }
  };

  const handlePointerEnd = () => {
    setIsDragging(false);
    setDragStart(null);
    setIsResizing(null);
    setResizeStart(null);
  };

  // Add Master Slide Layout to template
  const handleAddNewSlideLayout = () => {
    const newLayout: MasterSlideLayout = {
      id: `layout_${Date.now()}`,
      name: `${template.slides.length + 1}. Custom Master Slide`,
      layoutCategory: 'custom',
      background: {
        type: 'gradient',
        color: '#09090b',
        gradient: 'linear-gradient(135deg, #09090b 0%, #151221 100%)',
        pattern: 'none',
      },
      elements: [
        {
          id: `el_t_${Date.now()}`,
          type: 'text',
          x: 60,
          y: 60,
          width: 840,
          height: 70,
          text: 'New Master Slide Header',
          textColor: '#ffffff',
          fontSize: 32,
          fontWeight: 'bold',
          zIndex: 1,
          placeholderTag: 'slide_title',
        },
      ],
    };
    setTemplate((prev) => ({
      ...prev,
      slides: [...prev.slides, newLayout],
    }));
    setActiveSlideIndex(template.slides.length);
    setSelectedElementId(null);
    setMobileTab('canvas');
    triggerToast('Added new master slide');
  };

  const handleDuplicateSlideLayout = (index: number) => {
    const target = template.slides[index];
    const duplicated: MasterSlideLayout = {
      ...target,
      id: `layout_${Date.now()}`,
      name: `${target.name} (Copy)`,
      elements: target.elements.map((el) => ({
        ...el,
        id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      })),
    };
    const nextSlides = [...template.slides];
    nextSlides.splice(index + 1, 0, duplicated);
    setTemplate((prev) => ({ ...prev, slides: nextSlides }));
    setActiveSlideIndex(index + 1);
    triggerToast('Slide duplicated');
  };

  const handleDeleteSlideLayout = (index: number) => {
    if (template.slides.length <= 1) return;
    const nextSlides = template.slides.filter((_, idx) => idx !== index);
    setTemplate((prev) => ({ ...prev, slides: nextSlides }));
    setActiveSlideIndex(Math.max(0, index - 1));
    triggerToast('Slide removed');
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col font-sans select-none overflow-hidden ${
        isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-100 text-zinc-900'
      }`}
      onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
      onMouseUp={handlePointerEnd}
      onTouchMove={(e) => {
        if (e.touches[0]) {
          handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
      onTouchEnd={handlePointerEnd}
    >
      {/* 1. COMPACT RESPONSIVE TOP APP BAR */}
      <header
        className={`h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between gap-2 border-b shrink-0 z-20 ${
          isDark ? 'bg-zinc-900/95 border-zinc-800' : 'bg-white/95 border-zinc-200 shadow-sm'
        }`}
      >
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onClose}
            className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              isDark ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-zinc-100 text-zinc-700'
            }`}
            title="Back to Admin Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-soft-xs shrink-0">
              <LayoutTemplate className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={template.title}
                  onChange={(e) => setTemplate((prev) => ({ ...prev, title: e.target.value }))}
                  className={`font-display text-xs sm:text-base font-bold bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 max-w-[140px] sm:max-w-[260px] truncate ${
                    isDark ? 'text-white' : 'text-zinc-900'
                  }`}
                />
                <span className="hidden xs:inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
                  Admin Beta
                </span>
              </div>
              <p className={`text-[10px] hidden sm:block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Canva &amp; PPT Visual Master Slide Designer
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live AI Test Fill & Zoom Controls (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setIsTestFillActive(!isTestFillActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-soft-xs ${
              isTestFillActive
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
                : isDark
                ? 'bg-zinc-800 text-zinc-300 hover:text-white'
                : 'bg-zinc-100 text-zinc-700 hover:text-zinc-900'
            }`}
            title="Test how AI lesson content automatically populates into your master slots"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isTestFillActive ? 'AI Fill (ON)' : 'Preview AI Fill'}</span>
          </button>

          {/* Zoom Controls */}
          <div className={`p-1 rounded-xl flex items-center gap-1 ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
            <button
              onClick={() => setZoomScale((prev) => Math.max(0.3, Number((prev - 0.1).toFixed(2))))}
              className="p-1 hover:opacity-80 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={calculateAutoFitScale}
              className="text-[11px] font-mono px-1 font-semibold hover:text-indigo-400 cursor-pointer"
              title="Click to Auto-Fit"
            >
              {Math.round(zoomScale * 100)}%
            </button>
            <button
              onClick={() => setZoomScale((prev) => Math.min(1.5, Number((prev + 0.1).toFixed(2))))}
              className="p-1 hover:opacity-80 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile AI Fill Toggle Icon */}
          <button
            onClick={() => setIsTestFillActive(!isTestFillActive)}
            className={`md:hidden p-2 rounded-xl transition-all cursor-pointer ${
              isTestFillActive ? 'bg-emerald-600 text-white' : isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'
            }`}
            title="Toggle AI Fill Preview"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Published toggle (Desktop) */}
          <button
            onClick={() => setTemplate((prev) => ({ ...prev, isPublished: !prev.isPublished }))}
            className={`hidden sm:flex px-2.5 py-1.5 rounded-xl text-xs font-semibold items-center gap-1.5 transition-all cursor-pointer ${
              template.isPublished
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                : isDark
                ? 'bg-zinc-800 text-zinc-400'
                : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            {template.isPublished ? <Globe className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{template.isPublished ? 'Live' : 'Draft'}</span>
          </button>

          {/* More Menu Toggle (Mobile) */}
          <div className="relative sm:hidden">
            <button
              onClick={() => setShowMobileMoreMenu(!showMobileMoreMenu)}
              className={`p-2 rounded-xl ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMobileMoreMenu && (
              <div className={`absolute right-0 top-12 w-48 p-2 rounded-2xl shadow-soft-2xl border z-50 space-y-1 animate-in fade-in slide-in-from-top-2 ${
                isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
              }`}>
                <button
                  onClick={() => {
                    setTemplate((prev) => ({ ...prev, isPublished: !prev.isPublished }));
                    setShowMobileMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2 hover:bg-indigo-500/10"
                >
                  {template.isPublished ? <Globe className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4" />}
                  <span>Status: {template.isPublished ? 'Published' : 'Draft'}</span>
                </button>
                <button
                  onClick={() => {
                    calculateAutoFitScale();
                    setShowMobileMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2 hover:bg-indigo-500/10"
                >
                  <Maximize2 className="w-4 h-4 text-indigo-400" />
                  <span>Auto-Fit Screen</span>
                </button>
                <button
                  onClick={() => {
                    handleExportJSON();
                    setShowMobileMoreMenu(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center gap-2 hover:bg-indigo-500/10"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span>Export Template JSON</span>
                </button>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 cursor-pointer shadow-soft-sm transition-all disabled:opacity-50 shrink-0"
          >
            <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </header>

      {/* Save Toast Notification */}
      {saveSuccessToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-soft-lg animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{saveSuccessToast}</span>
        </div>
      )}

      {/* 2. RESPONSIVE WORKSPACE CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* ========================================================================= */}
        {/* LEFT TOOL RAIL (Desktop: Side Column | Mobile: Full Tab View) */}
        {/* ========================================================================= */}
        <aside
          className={`w-full lg:w-72 xl:w-80 border-r flex-col shrink-0 z-10 ${
            mobileTab === 'tools' ? 'flex' : 'hidden lg:flex'
          } ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
        >
          {/* Mobile Back-to-Canvas Button */}
          <div className="lg:hidden p-3 border-b flex items-center justify-between border-zinc-800 bg-indigo-950/20">
            <span className="text-xs font-extrabold uppercase text-indigo-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Add Elements &amp; AI Slots
            </span>
            <button
              onClick={() => setMobileTab('canvas')}
              className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-600 text-white flex items-center gap-1"
            >
              <span>Done</span>
            </button>
          </div>

          {/* Top Tool Tabs */}
          <div className={`p-2 grid grid-cols-5 gap-1 border-b shrink-0 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <button
              onClick={() => setActiveTab('elements')}
              className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'elements'
                  ? isDark ? 'bg-indigo-950 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                  : isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>AI Slots</span>
            </button>

            <button
              onClick={() => setActiveTab('text')}
              className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'text'
                  ? isDark ? 'bg-indigo-950 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                  : isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Text</span>
            </button>

            <button
              onClick={() => setActiveTab('shapes')}
              className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'shapes'
                  ? isDark ? 'bg-indigo-950 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                  : isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Square className="w-4 h-4" />
              <span>Shapes</span>
            </button>

            <button
              onClick={() => setActiveTab('media')}
              className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'media'
                  ? isDark ? 'bg-indigo-950 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                  : isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Media</span>
            </button>

            <button
              onClick={() => setActiveTab('background')}
              className={`p-2 rounded-xl flex flex-col items-center gap-1 text-[10px] font-bold transition-all cursor-pointer ${
                activeTab === 'background'
                  ? isDark ? 'bg-indigo-950 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                  : isDark ? 'text-zinc-400 hover:bg-zinc-800' : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Theme</span>
            </button>
          </div>

          {/* Left Drawer Content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* TAB 1: DYNAMIC AI SLOTS */}
            {activeTab === 'elements' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold flex items-center gap-1.5 text-indigo-400">
                    <Tag className="w-3.5 h-3.5" />
                    Dynamic AI Slide Slots
                  </h4>
                  <p className={`text-[11px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Tap any slot to insert it. The AI will auto-inject the teacher's curriculum data into these slots!
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  {DYNAMIC_TAGS.map((tag) => (
                    <button
                      key={tag.tag}
                      onClick={() => {
                        if (tag.tag === 'ai_visual_art') {
                          addElement({
                            type: 'ai_placeholder',
                            x: 520,
                            y: 80,
                            width: 380,
                            height: 380,
                            fillColor: '#18181b',
                            strokeColor: '#6366f1',
                            strokeWidth: 2,
                            borderRadius: 20,
                            placeholderTag: 'ai_visual_art',
                            placeholderDescription: 'AI Vector Art Frame',
                          });
                        } else {
                          addElement({
                            type: 'text',
                            x: 80,
                            y: 120,
                            width: tag.tag.includes('bullet') ? 400 : 500,
                            height: tag.tag === 'slide_title' ? 80 : 50,
                            text: `{{${tag.tag}}}`,
                            textColor: tag.tag === 'slide_title' ? '#ffffff' : '#e4e4e7',
                            fontSize: tag.tag === 'slide_title' ? 32 : tag.tag === 'headline' ? 20 : 16,
                            fontWeight: tag.tag === 'slide_title' ? 'bold' : 'normal',
                            placeholderTag: tag.tag,
                          });
                        }
                        triggerToast(`Added slot: {{${tag.tag}}}`);
                      }}
                      className={`w-full p-3 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer ${
                        isDark ? 'bg-zinc-850 hover:bg-zinc-800' : 'bg-zinc-50 hover:bg-zinc-100 shadow-soft-xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{tag.icon}</span>
                        <div>
                          <p className="text-xs font-bold">{tag.label}</p>
                          <p className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{tag.desc}</p>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-indigo-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: TEXT ELEMENTS */}
            {activeTab === 'text' && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-indigo-400">Add Text Blocks</h4>

                <button
                  onClick={() =>
                    addElement({
                      type: 'text',
                      x: 80,
                      y: 80,
                      width: 800,
                      height: 90,
                      text: 'Click to Edit Presentation Title',
                      textColor: '#ffffff',
                      fontSize: 40,
                      fontWeight: '800',
                    })
                  }
                  className={`w-full p-3.5 rounded-2xl text-left cursor-pointer transition-all ${
                    isDark ? 'bg-zinc-850 hover:bg-zinc-800' : 'bg-zinc-50 hover:bg-zinc-100'
                  }`}
                >
                  <p className="text-lg sm:text-xl font-extrabold font-display">Add a Heading (40pt)</p>
                </button>

                <button
                  onClick={() =>
                    addElement({
                      type: 'text',
                      x: 80,
                      y: 180,
                      width: 700,
                      height: 60,
                      text: 'Add a clear subheading or concept takeaway summary.',
                      textColor: '#a1a1aa',
                      fontSize: 22,
                      fontWeight: 'normal',
                    })
                  }
                  className={`w-full p-3 rounded-2xl text-left cursor-pointer transition-all ${
                    isDark ? 'bg-zinc-850 hover:bg-zinc-800' : 'bg-zinc-50 hover:bg-zinc-100'
                  }`}
                >
                  <p className="text-sm sm:text-base font-semibold">Add a Subheading (22pt)</p>
                </button>

                <button
                  onClick={() =>
                    addElement({
                      type: 'text',
                      x: 80,
                      y: 250,
                      width: 500,
                      height: 120,
                      text: '• Core mechanistic principle and empirical takeaway.\n• Supporting laboratory evidence and data.\n• Active classroom discussion check.',
                      textColor: '#e4e4e7',
                      fontSize: 16,
                      lineHeight: 1.6,
                    })
                  }
                  className={`w-full p-3 rounded-2xl text-left cursor-pointer transition-all ${
                    isDark ? 'bg-zinc-850 hover:bg-zinc-800' : 'bg-zinc-50 hover:bg-zinc-100'
                  }`}
                >
                  <p className="text-xs">Add Bullet List (16pt)</p>
                </button>
              </div>
            )}

            {/* TAB 3: SHAPES & CARDS */}
            {activeTab === 'shapes' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-indigo-400">Cards &amp; Geometric Shapes</h4>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() =>
                      addElement({
                        type: 'shape',
                        shapeType: 'rounded_card',
                        x: 80,
                        y: 80,
                        width: 400,
                        height: 300,
                        fillColor: 'rgba(24, 24, 27, 0.85)',
                        strokeColor: 'rgba(255, 255, 255, 0.1)',
                        strokeWidth: 1,
                        borderRadius: 20,
                        shadow: 'soft-md',
                      })
                    }
                    className={`p-3 rounded-2xl flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      isDark ? 'bg-zinc-850 hover:bg-zinc-800' : 'bg-zinc-50 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="w-12 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40" />
                    <span className="text-[11px] font-semibold">Rounded Card</span>
                  </button>

                  <button
                    onClick={() =>
                      addElement({
                        type: 'shape',
                        shapeType: 'pill',
                        x: 80,
                        y: 80,
                        width: 180,
                        height: 36,
                        fillColor: 'rgba(99, 102, 241, 0.2)',
                        strokeColor: '#6366f1',
                        strokeWidth: 1.5,
                      })
                    }
                    className={`p-3 rounded-2xl flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      isDark ? 'bg-zinc-850 hover:bg-zinc-800' : 'bg-zinc-50 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="w-14 h-6 rounded-full bg-purple-500/20 border border-purple-500/40" />
                    <span className="text-[11px] font-semibold">Pill Badge</span>
                  </button>

                  <button
                    onClick={() =>
                      addElement({
                        type: 'shape',
                        shapeType: 'circle',
                        x: 80,
                        y: 80,
                        width: 100,
                        height: 100,
                        fillColor: 'rgba(16, 185, 129, 0.2)',
                        strokeColor: '#10b981',
                        strokeWidth: 2,
                      })
                    }
                    className={`p-3 rounded-2xl flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      isDark ? 'bg-zinc-850 hover:bg-zinc-800' : 'bg-zinc-50 hover:bg-zinc-100'
                    }`}
                  >
                    <Circle className="w-8 h-8 text-emerald-400" />
                    <span className="text-[11px] font-semibold">Circle</span>
                  </button>

                  <button
                    onClick={() =>
                      addElement({
                        type: 'shape',
                        shapeType: 'star',
                        x: 80,
                        y: 80,
                        width: 60,
                        height: 60,
                        fillColor: '#f59e0b',
                      })
                    }
                    className={`p-3 rounded-2xl flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      isDark ? 'bg-zinc-850 hover:bg-zinc-800' : 'bg-zinc-50 hover:bg-zinc-100'
                    }`}
                  >
                    <Star className="w-8 h-8 text-amber-400 fill-current" />
                    <span className="text-[11px] font-semibold">Star</span>
                  </button>

                  <button
                    onClick={() =>
                      addElement({
                        type: 'shape',
                        shapeType: 'arrow_right',
                        x: 80,
                        y: 80,
                        width: 120,
                        height: 40,
                        fillColor: '#6366f1',
                      })
                    }
                    className={`p-3 rounded-2xl flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      isDark ? 'bg-zinc-850 hover:bg-zinc-800' : 'bg-zinc-50 hover:bg-zinc-100'
                    }`}
                  >
                    <ArrowRight className="w-8 h-8 text-indigo-400" />
                    <span className="text-[11px] font-semibold">Flow Arrow</span>
                  </button>

                  <button
                    onClick={() =>
                      addElement({
                        type: 'shape',
                        shapeType: 'hexagon',
                        x: 80,
                        y: 80,
                        width: 80,
                        height: 80,
                        fillColor: 'rgba(236, 72, 153, 0.2)',
                        strokeColor: '#ec4899',
                        strokeWidth: 2,
                      })
                    }
                    className={`p-3 rounded-2xl flex flex-col items-center gap-2 cursor-pointer transition-all ${
                      isDark ? 'bg-zinc-850 hover:bg-zinc-800' : 'bg-zinc-50 hover:bg-zinc-100'
                    }`}
                  >
                    <Hexagon className="w-8 h-8 text-pink-400" />
                    <span className="text-[11px] font-semibold">Hexagon</span>
                  </button>
                </div>

                {/* Educational Vector Icons */}
                <div className="pt-2 space-y-2">
                  <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Educational Icons</h5>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_ICONS.map((item) => {
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.name}
                          onClick={() =>
                            addElement({
                              type: 'icon',
                              iconName: item.name,
                              iconColor: '#a5b4fc',
                              iconSize: 32,
                              x: 100,
                              y: 100,
                              width: 48,
                              height: 48,
                            })
                          }
                          className={`p-2.5 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                            isDark ? 'bg-zinc-850 hover:bg-zinc-800 text-indigo-400' : 'bg-zinc-50 hover:bg-zinc-100 text-indigo-600'
                          }`}
                          title={`Insert ${item.name} icon`}
                        >
                          <IconComp className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: MEDIA & IMAGES */}
            {activeTab === 'media' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-indigo-400">Media &amp; Visual Assets</h4>

                {/* Upload Image Button */}
                <label className="w-full p-4 rounded-2xl border-2 border-dashed border-indigo-500/40 flex flex-col items-center gap-2 cursor-pointer hover:border-indigo-500 transition-all text-center">
                  <Upload className="w-6 h-6 text-indigo-400" />
                  <span className="text-xs font-bold">Upload Custom Image / Asset</span>
                  <span className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>PNG, JPG, SVG supported</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>

                {/* Place AI Illustration Viewport */}
                <button
                  onClick={() =>
                    addElement({
                      type: 'ai_placeholder',
                      x: 500,
                      y: 80,
                      width: 400,
                      height: 400,
                      fillColor: '#18181b',
                      strokeColor: '#8b5cf6',
                      strokeWidth: 2,
                      borderRadius: 24,
                      shadow: 'glow-primary',
                      placeholderTag: 'ai_visual_art',
                      placeholderDescription: 'Auto-rendered AI Visual Vector Asset',
                    })
                  }
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 text-left flex items-center justify-between cursor-pointer hover:opacity-90 transition-all"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-purple-300">Insert AI Art Frame</p>
                    <p className="text-[10px] text-zinc-400">Where AI vector art appears</p>
                  </div>
                  <Palette className="w-4 h-4 text-purple-400" />
                </button>
              </div>
            )}

            {/* TAB 5: CANVAS & BACKGROUND */}
            {activeTab === 'background' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-indigo-400">Slide Canvas Theme &amp; Backdrop</h4>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-zinc-400">Solid Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentSlide.background.color}
                      onChange={(e) => {
                        const nextSlides = [...template.slides];
                        nextSlides[activeSlideIndex].background.color = e.target.value;
                        setTemplate((prev) => ({ ...prev, slides: nextSlides }));
                      }}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={currentSlide.background.color}
                      onChange={(e) => {
                        const nextSlides = [...template.slides];
                        nextSlides[activeSlideIndex].background.color = e.target.value;
                        setTemplate((prev) => ({ ...prev, slides: nextSlides }));
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-zinc-400">Backdrop Pattern</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['none', 'grid', 'dots', 'glow_orbs'] as const).map((pat) => (
                      <button
                        key={pat}
                        onClick={() => {
                          const nextSlides = [...template.slides];
                          nextSlides[activeSlideIndex].background.pattern = pat;
                          setTemplate((prev) => ({ ...prev, slides: nextSlides }));
                        }}
                        className={`p-2 rounded-xl text-xs font-semibold capitalize cursor-pointer transition-all ${
                          currentSlide.background.pattern === pat
                            ? 'bg-indigo-600 text-white shadow-soft-xs'
                            : isDark
                            ? 'bg-zinc-850 text-zinc-400'
                            : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {pat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* CENTER INTERACTIVE 16:9 CANVAS STAGE */}
        {/* ========================================================================= */}
        <main
          ref={stageContainerRef}
          className={`flex-1 flex flex-col items-center justify-between p-2 sm:p-4 lg:p-6 overflow-hidden relative ${
            mobileTab === 'canvas' ? 'flex' : 'hidden lg:flex'
          } ${isDark ? 'bg-zinc-950' : 'bg-zinc-100'}`}
          onClick={() => setSelectedElementId(null)}
        >
          {/* Top Canvas Status & Quick Actions Bar */}
          <div className="w-full flex items-center justify-between max-w-4xl text-[11px] text-zinc-400 pb-1 sm:pb-2 shrink-0">
            <span className="font-semibold truncate max-w-[200px] sm:max-w-none">
              Editing: <span className="text-indigo-400 font-bold">{currentSlide?.name}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={calculateAutoFitScale}
                className="p-1 px-2 rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 font-semibold text-[10px] cursor-pointer"
              >
                Fit Screen ({Math.round(zoomScale * 100)}%)
              </button>
              <span className="hidden sm:inline">16:9 Widescreen (960×540)</span>
            </div>
          </div>

          {/* Scaled Canvas Container (Touch enabled) */}
          <div className="flex-1 flex items-center justify-center w-full overflow-hidden relative touch-none py-1">
            <div
              style={{
                width: `${CANVAS_WIDTH * zoomScale}px`,
                height: `${CANVAS_HEIGHT * zoomScale}px`,
              }}
              className="relative transition-all duration-75 shrink-0 shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden"
            >
              <div
                ref={canvasRef}
                style={{
                  width: `${CANVAS_WIDTH}px`,
                  height: `${CANVAS_HEIGHT}px`,
                  transform: `scale(${zoomScale})`,
                  transformOrigin: 'top left',
                  background:
                    currentSlide.background.type === 'gradient' && currentSlide.background.gradient
                      ? currentSlide.background.gradient
                      : currentSlide.background.color,
                }}
                className={`relative rounded-2xl sm:rounded-3xl overflow-hidden border ${
                  isDark ? 'border-zinc-800' : 'border-zinc-300'
                }`}
              >
                {/* Background Pattern Overlay */}
                {currentSlide.background.pattern === 'grid' && (
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }}
                  />
                )}
                {currentSlide.background.pattern === 'dots' && (
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(#6366f1 1.5px, transparent 1.5px)',
                      backgroundSize: '24px 24px',
                    }}
                  />
                )}

                {/* Render All Slide Elements */}
                {currentSlide.elements.map((el) => {
                  const isSelected = el.id === selectedElementId;

                  // Text interpolation when AI Fill Preview is active
                  let displayText = el.text || '';
                  if (isTestFillActive && el.placeholderTag && el.placeholderTag !== 'none') {
                    displayText = (SAMPLE_AI_DATA as any)[el.placeholderTag] || displayText;
                  }

                  return (
                    <div
                      key={el.id}
                      style={{
                        position: 'absolute',
                        left: `${el.x}px`,
                        top: `${el.y}px`,
                        width: `${el.width}px`,
                        height: `${el.height}px`,
                        zIndex: el.zIndex,
                        opacity: el.opacity !== undefined ? el.opacity : 1,
                        cursor: isDragging && isSelected ? 'grabbing' : 'grab',
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handlePointerStart(e.clientX, e.clientY, el);
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        if (e.touches[0]) {
                          handlePointerStart(e.touches[0].clientX, e.touches[0].clientY, el);
                        }
                      }}
                      className={`group transition-shadow ${
                        isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-950' : 'hover:ring-1 hover:ring-indigo-400/50'
                      }`}
                    >
                      {/* 1. TEXT ELEMENT */}
                      {el.type === 'text' && (
                        <div
                          style={{
                            color: el.textColor || '#ffffff',
                            fontSize: `${el.fontSize || 16}px`,
                            fontWeight: el.fontWeight || 'normal',
                            fontFamily: el.fontFamily || template.fontPairing.bodyFont,
                            textAlign: el.textAlign || 'left',
                            lineHeight: el.lineHeight || 1.3,
                            letterSpacing: el.letterSpacing ? `${el.letterSpacing}px` : undefined,
                          }}
                          className="w-full h-full whitespace-pre-wrap select-none overflow-hidden"
                        >
                          {displayText}
                        </div>
                      )}

                      {/* 2. SHAPE ELEMENT */}
                      {el.type === 'shape' && (
                        <div
                          style={{
                            backgroundColor: el.fillColor || '#6366f1',
                            borderColor: el.strokeColor || 'transparent',
                            borderWidth: el.strokeWidth ? `${el.strokeWidth}px` : undefined,
                            borderRadius:
                              el.shapeType === 'pill'
                                ? '9999px'
                                : el.shapeType === 'circle'
                                ? '50%'
                                : el.shapeType === 'rounded_card'
                                ? `${el.borderRadius || 18}px`
                                : undefined,
                          }}
                          className={`w-full h-full flex items-center justify-center ${
                            el.shadow === 'glow-primary'
                              ? 'shadow-[0_0_25px_rgba(99,102,241,0.4)]'
                              : el.shadow === 'soft-md'
                              ? 'shadow-lg'
                              : ''
                          }`}
                        >
                          {el.shapeType === 'star' && <Star className="w-full h-full fill-current text-amber-400" />}
                          {el.shapeType === 'hexagon' && <Hexagon className="w-full h-full fill-current" />}
                          {el.shapeType === 'arrow_right' && <ArrowRight className="w-full h-full" />}
                        </div>
                      )}

                      {/* 3. ICON ELEMENT */}
                      {el.type === 'icon' && (() => {
                        const FoundIcon = PRESET_ICONS.find((p) => p.name === el.iconName)?.icon || Atom;
                        return (
                          <div className="w-full h-full flex items-center justify-center pointer-events-none">
                            <FoundIcon className="w-full h-full text-indigo-400" />
                          </div>
                        );
                      })()}

                      {/* 4. IMAGE ELEMENT */}
                      {el.type === 'image' && el.imageUrl && (
                        <img
                          src={el.imageUrl}
                          alt={el.altText || 'Slide Asset'}
                          style={{
                            borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
                            objectFit: el.imageFit || 'cover',
                          }}
                          className="w-full h-full select-none pointer-events-none"
                        />
                      )}

                      {/* 5. AI PLACEHOLDER ELEMENT */}
                      {el.type === 'ai_placeholder' && (
                        <div
                          style={{
                            backgroundColor: el.fillColor || '#18181b',
                            borderColor: el.strokeColor || '#6366f1',
                            borderWidth: `${el.strokeWidth || 2}px`,
                            borderRadius: `${el.borderRadius || 20}px`,
                          }}
                          className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-4 text-center space-y-1.5 border-dashed select-none"
                        >
                          <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400 opacity-90" />
                          <p className="text-[11px] sm:text-xs font-bold text-indigo-300">
                            {isTestFillActive ? 'AI Vector Graphic Rendered' : 'AI Illustration Frame'}
                          </p>
                          <span className="text-[9px] sm:text-[10px] text-zinc-400 max-w-[200px] line-clamp-2">
                            {el.placeholderDescription || 'Automatically filled by AI engine'}
                          </span>
                        </div>
                      )}

                      {/* Dynamic Tag Identifier Badge (When not testing fill) */}
                      {!isTestFillActive && el.placeholderTag && el.placeholderTag !== 'none' && (
                        <div className="absolute -top-3 -right-2 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-extrabold bg-indigo-600 text-white shadow-soft-xs z-30">
                          {`{{${el.placeholderTag}}}`}
                        </div>
                      )}

                      {/* RESIZE HANDLES (Corner Handles when Selected - Mouse & Touch) */}
                      {isSelected && (
                        <>
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handlePointerResizeStart(e.clientX, e.clientY, 'nw');
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              if (e.touches[0]) handlePointerResizeStart(e.touches[0].clientX, e.touches[0].clientY, 'nw');
                            }}
                            className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 cursor-nwse-resize z-40 shadow-soft-sm"
                          />
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handlePointerResizeStart(e.clientX, e.clientY, 'ne');
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              if (e.touches[0]) handlePointerResizeStart(e.touches[0].clientX, e.touches[0].clientY, 'ne');
                            }}
                            className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 cursor-nesw-resize z-40 shadow-soft-sm"
                          />
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handlePointerResizeStart(e.clientX, e.clientY, 'sw');
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              if (e.touches[0]) handlePointerResizeStart(e.touches[0].clientX, e.touches[0].clientY, 'sw');
                            }}
                            className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 cursor-nesw-resize z-40 shadow-soft-sm"
                          />
                          <div
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handlePointerResizeStart(e.clientX, e.clientY, 'se');
                            }}
                            onTouchStart={(e) => {
                              e.stopPropagation();
                              if (e.touches[0]) handlePointerResizeStart(e.touches[0].clientX, e.touches[0].clientY, 'se');
                            }}
                            className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-white border-2 border-indigo-600 cursor-nwse-resize z-40 shadow-soft-sm"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Floating Mobile Quick Action Pill (When element is selected on mobile) */}
          {selectedElement && (
            <div className="lg:hidden w-full max-w-sm px-2 py-1.5 rounded-2xl bg-zinc-900/90 backdrop-blur-md border border-indigo-500/30 flex items-center justify-between gap-1 shadow-soft-lg z-30 shrink-0 mb-1">
              <button
                onClick={() => setMobileTab('inspector')}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-indigo-600 text-white flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                <span>Style</span>
              </button>

              <button
                onClick={() => setShowNudgeModal(true)}
                className="px-2 py-1 rounded-xl text-[11px] font-semibold bg-zinc-800 text-zinc-200 flex items-center gap-1"
              >
                <Move className="w-3 h-3 text-indigo-400" />
                <span>Nudge</span>
              </button>

              <button
                onClick={duplicateSelectedElement}
                className="p-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white"
                title="Duplicate"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => reorderElement('forward')}
                className="p-1.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-[10px] font-bold"
                title="Bring Forward"
              >
                ▲
              </button>

              <button
                onClick={deleteSelectedElement}
                className="p-1.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Desktop Bottom Filmstrip Rail (All Master Slides) */}
          <div className="hidden lg:flex w-full max-w-4xl pt-2 items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {template.slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => {
                    setActiveSlideIndex(idx);
                    setSelectedElementId(null);
                  }}
                  className={`px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    activeSlideIndex === idx
                      ? 'bg-indigo-600 text-white shadow-soft-sm'
                      : isDark
                      ? 'bg-zinc-900 text-zinc-400 hover:text-white'
                      : 'bg-white text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  <span>{slide.name}</span>
                  {template.slides.length > 1 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSlideLayout(idx);
                      }}
                      className="hover:text-red-300 ml-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={handleAddNewSlideLayout}
                className={`px-3 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-dashed ${
                  isDark ? 'border-zinc-700 hover:border-zinc-500 text-zinc-400' : 'border-zinc-300 hover:border-zinc-400 text-zinc-600'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Master Slide</span>
              </button>
            </div>
          </div>
        </main>

        {/* ========================================================================= */}
        {/* RIGHT INSPECTOR PANEL (Desktop: Side Column | Mobile: Full Tab View) */}
        {/* ========================================================================= */}
        <aside
          className={`w-full lg:w-72 xl:w-80 border-l flex-col shrink-0 z-10 ${
            mobileTab === 'inspector' ? 'flex' : 'hidden lg:flex'
          } ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
        >
          {/* Header */}
          <div className={`p-3.5 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}>
            <h3 className="font-display text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-indigo-400">
              <Sliders className="w-3.5 h-3.5" />
              Element Inspector
            </h3>
            {/* Mobile Done Button */}
            <button
              onClick={() => setMobileTab('canvas')}
              className="lg:hidden px-3 py-1 rounded-xl text-xs font-bold bg-indigo-600 text-white"
            >
              Done
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {selectedElement ? (
              <div className="space-y-4">
                {/* 1. DYNAMIC AI SLOT BINDING (THE CORE FEATURE) */}
                <div className={`p-3.5 rounded-2xl space-y-2 border ${
                  isDark ? 'bg-indigo-950/40 border-indigo-500/30' : 'bg-indigo-50/70 border-indigo-200'
                }`}>
                  <label className="text-[11px] font-bold flex items-center gap-1.5 text-indigo-400">
                    <Tag className="w-3.5 h-3.5" />
                    AI Template Variable Binding
                  </label>
                  <p className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    Select which AI curriculum field will auto-fill into this slot:
                  </p>
                  <select
                    value={selectedElement.placeholderTag || 'none'}
                    onChange={(e) => updateSelectedElement({ placeholderTag: e.target.value as DynamicPlaceholderTag })}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                      isDark ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900 shadow-soft-xs'
                    }`}
                  >
                    <option value="none">Static Element (No AI Binding)</option>
                    {DYNAMIC_TAGS.map((t) => (
                      <option key={t.tag} value={t.tag}>
                        {t.icon} {t.label} ({`{{${t.tag}}}`})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. TEXT CONTENT & TYPOGRAPHY (IF TEXT) */}
                {selectedElement.type === 'text' && (
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Text Content</label>
                    <textarea
                      rows={3}
                      value={selectedElement.text || ''}
                      onChange={(e) => updateSelectedElement({ text: e.target.value })}
                      className={`w-full p-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDark ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'
                      }`}
                    />

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-400">Font Family</label>
                      <select
                        value={selectedElement.fontFamily || FONT_OPTIONS[0].value}
                        onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                        className={`w-full p-2 rounded-xl text-xs ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                      >
                        {FONT_OPTIONS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-400">Size (px)</label>
                        <input
                          type="number"
                          min={8}
                          max={96}
                          value={selectedElement.fontSize || 16}
                          onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) || 16 })}
                          className={`w-full p-2 rounded-xl text-xs font-mono ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-400">Color</label>
                        <input
                          type="color"
                          value={selectedElement.textColor || '#ffffff'}
                          onChange={(e) => updateSelectedElement({ textColor: e.target.value })}
                          className="w-full h-8 rounded-xl bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. SHAPE & APPEARANCE */}
                {(selectedElement.type === 'shape' || selectedElement.type === 'ai_placeholder') && (
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Appearance</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-400">Fill Color</label>
                        <input
                          type="color"
                          value={selectedElement.fillColor?.startsWith('#') ? selectedElement.fillColor : '#18181b'}
                          onChange={(e) => updateSelectedElement({ fillColor: e.target.value })}
                          className="w-full h-8 rounded-xl bg-transparent cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-zinc-400">Border Color</label>
                        <input
                          type="color"
                          value={selectedElement.strokeColor?.startsWith('#') ? selectedElement.strokeColor : '#6366f1'}
                          onChange={(e) => updateSelectedElement({ strokeColor: e.target.value })}
                          className="w-full h-8 rounded-xl bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-zinc-400">Border Radius (px)</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={selectedElement.borderRadius || 0}
                        onChange={(e) => updateSelectedElement({ borderRadius: parseInt(e.target.value) || 0 })}
                        className={`w-full p-2 rounded-xl text-xs font-mono ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}
                      />
                    </div>
                  </div>
                )}

                {/* 4. TOUCH-FRIENDLY POSITION NUDGE & D-PAD */}
                <div className="space-y-3 p-3 rounded-2xl bg-zinc-800/40 border border-zinc-700/40">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                      <Move className="w-3.5 h-3.5 text-indigo-400" />
                      Precision Touch D-Pad
                    </label>
                    <div className="flex items-center gap-1 text-[10px]">
                      {[1, 5, 20].map((step) => (
                        <button
                          key={step}
                          onClick={() => setNudgeStep(step)}
                          className={`px-1.5 py-0.5 rounded font-mono ${
                            nudgeStep === step ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {step}px
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* D-Pad Arrows */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleNudge(0, -nudgeStep)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white shadow-soft-xs"
                      title="Nudge Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleNudge(-nudgeStep, 0)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white shadow-soft-xs"
                        title="Nudge Left"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCenterElement('both')}
                        className="px-2 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 text-[10px] font-bold"
                        title="Center on Slide"
                      >
                        Center
                      </button>
                      <button
                        onClick={() => handleNudge(nudgeStep, 0)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white shadow-soft-xs"
                        title="Nudge Right"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => handleNudge(0, nudgeStep)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white shadow-soft-xs"
                      title="Nudge Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                    <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-zinc-900">
                      <span className="text-zinc-500">X:</span>
                      <span className="text-white font-bold">{selectedElement.x}px</span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-zinc-900">
                      <span className="text-zinc-500">Y:</span>
                      <span className="text-white font-bold">{selectedElement.y}px</span>
                    </div>
                  </div>
                </div>

                {/* 5. ACTIONS: DUPLICATE / REORDER / DELETE */}
                <div className="pt-2 flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={duplicateSelectedElement}
                      className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                        isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-100 hover:bg-zinc-200'
                      }`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Duplicate</span>
                    </button>
                    <button
                      onClick={deleteSelectedElement}
                      className="p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 bg-red-500/15 text-red-400 hover:bg-red-500/25 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <button
                      onClick={() => reorderElement('forward')}
                      className={`p-2 rounded-xl cursor-pointer ${isDark ? 'bg-zinc-850' : 'bg-zinc-100'}`}
                    >
                      Bring Forward
                    </button>
                    <button
                      onClick={() => reorderElement('backward')}
                      className={`p-2 rounded-xl cursor-pointer ${isDark ? 'bg-zinc-850' : 'bg-zinc-100'}`}
                    >
                      Send Backward
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-2 text-zinc-500">
                <Move className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-xs font-semibold">No Element Selected</p>
                <p className="text-[11px]">Tap any text, shape, or slot on the canvas to inspect and customize its properties.</p>
              </div>
            )}
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* MOBILE SLIDES FILMSTRIP TAB (When on mobileTab === 'slides') */}
        {/* ========================================================================= */}
        {mobileTab === 'slides' && (
          <div className={`lg:hidden w-full flex-1 p-4 overflow-y-auto space-y-4 ${
            isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-100 text-zinc-900'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase text-indigo-400 tracking-wider">
                Master Slide Layouts ({template.slides.length})
              </h3>
              <button
                onClick={handleAddNewSlideLayout}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slide</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {template.slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  onClick={() => {
                    setActiveSlideIndex(idx);
                    setSelectedElementId(null);
                    setMobileTab('canvas');
                  }}
                  className={`p-4 rounded-2xl flex flex-col justify-between gap-3 border transition-all cursor-pointer ${
                    activeSlideIndex === idx
                      ? 'border-indigo-500 bg-indigo-950/40 shadow-soft-sm'
                      : isDark ? 'border-zinc-800 bg-zinc-900/80' : 'border-zinc-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{slide.name}</span>
                    <span className="text-[10px] text-zinc-400">{slide.elements.length} elements</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateSlideLayout(idx);
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-zinc-800 text-zinc-300"
                    >
                      Duplicate
                    </button>
                    {template.slides.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSlideLayout(idx);
                        }}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-red-500/15 text-red-400"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE BOTTOM NAVIGATION DOCK (Persistent on Small Screens) */}
      {/* ========================================================================= */}
      <nav
        className={`lg:hidden h-14 border-t px-3 flex items-center justify-around shrink-0 z-30 ${
          isDark ? 'bg-zinc-900/95 border-zinc-800' : 'bg-white/95 border-zinc-200 shadow-soft-lg'
        }`}
      >
        <button
          onClick={() => setMobileTab('canvas')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
            mobileTab === 'canvas' ? 'text-indigo-400' : isDark ? 'text-zinc-500' : 'text-zinc-600'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>Canvas</span>
        </button>

        <button
          onClick={() => setMobileTab('tools')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
            mobileTab === 'tools' ? 'text-indigo-400' : isDark ? 'text-zinc-500' : 'text-zinc-600'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add Tool</span>
        </button>

        <button
          onClick={() => setMobileTab('inspector')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all relative ${
            mobileTab === 'inspector' ? 'text-indigo-400' : isDark ? 'text-zinc-500' : 'text-zinc-600'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Format</span>
          {selectedElement && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setMobileTab('slides')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all ${
            mobileTab === 'slides' ? 'text-indigo-400' : isDark ? 'text-zinc-500' : 'text-zinc-600'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Slides ({template.slides.length})</span>
        </button>
      </nav>

      {/* Standalone Precision Nudge Modal on Mobile */}
      {showNudgeModal && selectedElement && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className={`w-full max-w-xs p-5 rounded-3xl space-y-4 shadow-soft-2xl border ${
            isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase text-indigo-400 flex items-center gap-1.5">
                <Move className="w-4 h-4" />
                Precision Position Nudge
              </h4>
              <button onClick={() => setShowNudgeModal(false)} className="p-1 rounded-lg text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-zinc-400">Step:</span>
              {[1, 5, 10, 25].map((s) => (
                <button
                  key={s}
                  onClick={() => setNudgeStep(s)}
                  className={`px-2 py-1 rounded-lg font-mono font-bold ${
                    nudgeStep === s ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {s}px
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center gap-1 pt-2">
              <button
                onClick={() => handleNudge(0, -nudgeStep)}
                className="p-3 rounded-2xl bg-indigo-600 text-white shadow-soft-sm active:scale-95"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleNudge(-nudgeStep, 0)}
                  className="p-3 rounded-2xl bg-indigo-600 text-white shadow-soft-sm active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleCenterElement('both')}
                  className="px-3 py-2 rounded-xl bg-zinc-800 text-xs font-bold text-indigo-300 active:scale-95"
                >
                  Center
                </button>
                <button
                  onClick={() => handleNudge(nudgeStep, 0)}
                  className="p-3 rounded-2xl bg-indigo-600 text-white shadow-soft-sm active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => handleNudge(0, nudgeStep)}
                className="p-3 rounded-2xl bg-indigo-600 text-white shadow-soft-sm active:scale-95"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowNudgeModal(false)}
                className="w-full py-2.5 rounded-xl bg-zinc-800 font-bold text-xs text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

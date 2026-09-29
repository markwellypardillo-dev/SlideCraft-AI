import pptxgen from 'pptxgenjs';
import { SlideDeck, SlideItem } from '../types/deck';
import { recordSystemLog } from './adminService';

/**
 * Converts a self-contained SVG string into a high-resolution PNG data URL
 * so it can be natively embedded as a real image inside PowerPoint (.pptx) slides.
 */
async function svgToPngDataUrl(svgString: string, width = 800, height = 600): Promise<string> {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined') {
        resolve('');
        return;
      }
      let preparedSvg = svgString.trim();
      if (!preparedSvg.includes('xmlns=')) {
        preparedSvg = preparedSvg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if (!preparedSvg.includes('width=')) {
        preparedSvg = preparedSvg.replace('<svg', `<svg width="${width}" height="${height}"`);
      }
      const svgBlob = new Blob([preparedSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            const pngData = canvas.toDataURL('image/png');
            URL.revokeObjectURL(url);
            resolve(pngData);
          } else {
            URL.revokeObjectURL(url);
            resolve('');
          }
        } catch {
          URL.revokeObjectURL(url);
          resolve('');
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve('');
      };
      img.src = url;
    } catch {
      resolve('');
    }
  });
}

/**
 * Builds an authentic, editable .pptx PowerPoint file using pptxgenjs
 * with titles, bullet points, speaker notes in the presenter notes section,
 * and REAL native embedded illustrations/images on every slide.
 */
export async function exportToPPTX(deck: SlideDeck): Promise<void> {
  const startTime = performance.now();
  const ppt = new pptxgen();

  // Set presentation properties
  ppt.title = deck.title;
  ppt.subject = deck.subject;
  ppt.author = 'SlideCraft AI Studio';
  ppt.company = 'SlideCraft AI';
  ppt.layout = 'LAYOUT_16x9';

  // Palette colors (clean hex without #)
  const primaryColor = (deck.colorPalette?.primary || '#6366f1').replace('#', '');
  const secondaryColor = (deck.colorPalette?.secondary || '#8b5cf6').replace('#', '');
  const bgColor = (deck.colorPalette?.background || '#09090b').replace('#', '');
  const isDark = true;

  for (let i = 0; i < deck.slides.length; i++) {
    const slide = deck.slides[i];
    const pSlide = ppt.addSlide();

    // Background color
    pSlide.background = { color: bgColor };

    // Slide category badge / counter
    const sessionPrefix = deck.session ? `${deck.session.toUpperCase()} • ` : '';
    pSlide.addText(`${sessionPrefix}SLIDE ${slide.slideNumber} OF ${deck.slides.length} • ${slide.layoutType.toUpperCase()}`, {
      x: 0.8,
      y: 0.5,
      w: 8.0,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: primaryColor,
      fontFace: 'Arial',
    });

    // Slide Title
    pSlide.addText(slide.title, {
      x: 0.8,
      y: 0.8,
      w: 8.5,
      h: 0.8,
      fontSize: 24,
      bold: true,
      color: isDark ? 'FFFFFF' : '111827',
      fontFace: 'Arial',
    });

    // Headline / Takeaway banner
    pSlide.addText(slide.headline, {
      x: 0.8,
      y: 1.6,
      w: 8.5,
      h: 0.6,
      fontSize: 14,
      italic: true,
      color: secondaryColor,
      fontFace: 'Arial',
    });

    // Content Bullets (Formatted left column)
    const bulletItems = slide.bullets.map((b) => {
      // Strip markdown asterisks for pptx
      const clean = b.replace(/\*\*/g, '');
      return {
        text: clean,
        options: {
          bullet: true,
          fontSize: 13,
          color: isDark ? 'E4E4E7' : '27272A',
          spaceAfter: 12,
        },
      };
    });

    pSlide.addText(bulletItems, {
      x: 0.8,
      y: 2.3,
      w: 5.2,
      h: 3.5,
      fontFace: 'Arial',
    });

    // =========================================================================
    // NATIVE EMBEDDED AI ILLUSTRATION / VISUAL IN POWERPOINT SLIDE
    // =========================================================================
    let illustrationPng = '';
    if (slide.visualPrompt?.customSvgArt) {
      illustrationPng = await svgToPngDataUrl(slide.visualPrompt.customSvgArt);
    }

    const styleTitle = slide.visualPrompt.illustrationStyle || deck.illustrationStyle || 'CUSTOM AI ARTWORK';

    if (illustrationPng) {
      // 1. EMBED THE REAL IMAGE DIRECTLY INTO POWERPOINT
      pSlide.addImage({
        data: illustrationPng,
        x: 6.2,
        y: 2.0,
        w: 3.3,
        h: 2.6,
      });

      // 2. Add subtle caption container below the image
      pSlide.addShape(ppt.ShapeType.roundRect, {
        x: 6.2,
        y: 4.7,
        w: 3.3,
        h: 1.1,
        fill: { color: '18181B' },
        line: { color: primaryColor, width: 1 },
        rectRadius: 0.08,
      });

      pSlide.addText(`🎨 NATIVE ${styleTitle.toUpperCase()}`, {
        x: 6.3,
        y: 4.8,
        w: 3.1,
        h: 0.25,
        fontSize: 8,
        bold: true,
        color: primaryColor,
        fontFace: 'Arial',
      });

      pSlide.addText(slide.visualPrompt.imagePrompt || slide.visualPrompt.altText || slide.title, {
        x: 6.3,
        y: 5.05,
        w: 3.1,
        h: 0.65,
        fontSize: 7.5,
        color: 'A1A1AA',
        fontFace: 'Arial',
        italic: true,
      });
    } else {
      // Fallback placeholder card if rasterization was unavailable
      pSlide.addShape(ppt.ShapeType.roundRect, {
        x: 6.4,
        y: 2.3,
        w: 3.0,
        h: 3.5,
        fill: { color: '18181B' },
        line: { color: primaryColor, width: 1.5, dashType: 'dash' },
        rectRadius: 0.1,
      });

      pSlide.addText(`🎨 ${styleTitle.toUpperCase()}`, {
        x: 6.5,
        y: 2.45,
        w: 2.8,
        h: 0.35,
        fontSize: 8.5,
        bold: true,
        color: primaryColor,
        fontFace: 'Arial',
      });

      pSlide.addText(`Visual Blueprint Prompt:\n"${slide.visualPrompt.imagePrompt}"`, {
        x: 6.5,
        y: 2.8,
        w: 2.8,
        h: 2.0,
        fontSize: 8.5,
        color: 'A1A1AA',
        fontFace: 'Arial',
        italic: true,
      });

      pSlide.addText(`Placement: ${slide.visualPrompt.recommendedPlacement}\nAlt: ${slide.visualPrompt.altText}`, {
        x: 6.5,
        y: 4.85,
        w: 2.8,
        h: 0.8,
        fontSize: 8,
        color: '71717A',
        fontFace: 'Arial',
      });
    }

    // Embed authentic Speaker Notes into PowerPoint Presenter Notes!
    let speakerNoteText = `SPEAKER SCRIPT / TEACHER PACING NOTES:\n${slide.speakerNotes}\n\nESTIMATED DURATION: ${slide.estimatedTime}`;
    if (slide.assessment) {
      speakerNoteText += `\n\nEMBEDDED ASSESSMENT CHECK:\nQuestion: ${slide.assessment.question}`;
      if (slide.assessment.correctAnswer) {
        speakerNoteText += `\nCorrect Answer: ${slide.assessment.correctAnswer}`;
      }
      speakerNoteText += `\nExplanation: ${slide.assessment.explanation}`;
    }
    pSlide.addNotes(speakerNoteText);
  }

  // Save PPTX file to browser download
  const filename = `${deck.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_SlideCraft.pptx`;
  await ppt.writeFile({ fileName: filename });

  const latencyMs = Math.round(performance.now() - startTime);
  recordSystemLog({
    level: 'SUCCESS',
    category: 'EXPORT',
    action: 'PPTX_EXPORT_DOWNLOADED',
    details: `Compiled and exported ${deck.slides.length} slides to native editable .pptx file`,
    metadata: {
      endpoint: '/api/export-pptx',
      latencyMs,
      format: 'pptx',
      slideCount: deck.slides.length,
      status: 200,
    },
  });
}

/**
 * Exports a structured Word (.docx compatible) Teacher Lesson Plan & Student Handout
 * with fill-in blanks for classroom quizzes and guided notes.
 */
export function exportToWordHandout(deck: SlideDeck): void {
  const content = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset="utf-8">
<title>${deck.title} - Teacher Lesson Plan & Student Handout</title>
<style>
  body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; line-height: 1.5; color: #111827; padding: 30px; }
  h1 { color: #4338ca; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 4px; }
  .subtitle { font-size: 14pt; color: #6b7280; margin-bottom: 24px; }
  .badge { background: #e0e7ff; color: #3730a3; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 9pt; }
  .slide-card { border: 1px solid #d1d5db; border-radius: 8px; padding: 16px; margin-bottom: 24px; page-break-inside: avoid; }
  .slide-header { font-size: 14pt; font-weight: bold; color: #1f2937; margin-bottom: 8px; }
  .headline { font-style: italic; color: #4b5563; margin-bottom: 12px; }
  .notes-box { background: #f9fafb; border-left: 4px solid #6366f1; padding: 10px 14px; margin: 12px 0; font-size: 10pt; }
  .quiz-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 12px; margin-top: 12px; }
  .student-fillin { border-bottom: 1px dotted #9ca3af; height: 24px; margin: 8px 0; }
  .visual-prompt-box { background: #faf5ff; border: 1px dashed #c084fc; padding: 8px 12px; font-size: 9pt; color: #6b21a8; margin-top: 10px; }
</style>
</head>
<body>
  <h1>${deck.title}</h1>
  <div class="subtitle">
    <strong>Subject:</strong> ${deck.subject} &nbsp;|&nbsp;
    <strong>Audience:</strong> ${deck.targetAudience} &nbsp;|&nbsp;
    <strong>Duration:</strong> ~${deck.totalEstimatedMinutes} minutes
  </div>

  <div style="background: #f3f4f6; padding: 14px; border-radius: 6px; margin-bottom: 30px;">
    <h3 style="margin-top: 0;">Instructional Objectives & Pedagogy Strategy</h3>
    <p>${deck.pedagogyNotes}</p>
  </div>

  <h2>Classroom Lecture Presentation & Student Guided Notes</h2>

  ${deck.slides
    .map(
      (s) => `
    <div class="slide-card">
      <div class="slide-header">
        Slide ${s.slideNumber}: ${s.title}
        <span class="badge" style="float: right;">${s.estimatedTime} • ${s.layoutType}</span>
      </div>
      <div class="headline"><strong>Takeaway:</strong> ${s.headline}</div>
      
      <h4>Key Concepts / Teacher Presentation Points:</h4>
      <ul>
        ${s.bullets.map((b) => `<li>${b.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('')}
      </ul>

      <div class="notes-box">
        <strong>🗣️ Teacher Verbal Script & Pacing Cues:</strong><br>
        ${s.speakerNotes}
      </div>

      <div class="visual-prompt-box">
        <strong>🎨 AI Visual & Design Blueprint:</strong><br>
        <em>Prompt:</em> "${s.visualPrompt.imagePrompt}"<br>
        <em>Placement:</em> ${s.visualPrompt.recommendedPlacement} &nbsp;|&nbsp; <em>Alt Text:</em> ${s.visualPrompt.altText}
      </div>

      ${
        s.assessment
          ? `
        <div class="quiz-box">
          <strong>✏️ Classroom Check-for-Understanding:</strong><br>
          ${s.assessment.question}<br>
          ${
            s.assessment.options
              ? s.assessment.options
                  .map(
                    (opt) =>
                      `<div style="margin: 4px 0;"><span style="display:inline-block; width:18px; height:18px; border:1px solid #6b7280; border-radius:3px; vertical-align:middle; margin-right:8px;"></span> ${opt}</div>`
                  )
                  .join('')
              : '<div class="student-fillin">Student Response: ________________________________________________________________</div>'
          }
          <div style="font-size: 9pt; color: #047857; margin-top: 6px;">
            <em>Teacher Key:</em> ${s.assessment.correctAnswer || 'Open discussion'} (${s.assessment.explanation})
          </div>
        </div>
      `
          : ''
      }
    </div>
  `
    )
    .join('')}

</body>
</html>
`;

  const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${deck.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_LessonPlan_Handout.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports streamlined presentation markdown engineered specifically for AI presentation engines
 * (Gamma.app, Tome, Canva Magic Presentations, Beautiful.ai, ChatGPT, Copilot, SlidesAI).
 * 
 * Includes an explicit unyielding prompt directive at the very top that FORCES the external AI
 * to generate the EXACT slide count (e.g., all 18 slides) without merging or skipping slides,
 * and provides clean slide content (title, takeaway headline, bullet points, and AI image prompts)
 * without teacher teleprompter clutter.
 */
export function exportToGammaMarkdown(deck: SlideDeck): string {
  const totalCount = deck.slides.length;
  const artStyle = deck.illustrationStyle || 'Cartoon & Playful Illustration';

  let md = `<!-- =======================================================================
🚨 CRITICAL AI PRESENTATION INSTRUCTION (STRICT SLIDE COUNT ENFORCEMENT):
- GENERATE EXACTLY ${totalCount} DISTINCT SLIDES (Slide 1 through Slide ${totalCount}).
- DO NOT MERGE, CONDENSE, SUMMARIZE, OR SKIP ANY SLIDES UNDER ANY CIRCUMSTANCES.
- EVERY "## Slide [X]" SECTION BELOW MUST BE CREATED AS ITS OWN INDIVIDUAL POWERPOINT SLIDE.
- FOR EACH SLIDE, GENERATE ITS CUSTOM VISUAL ARTWORK USING THE SPECIFIED "Image Generation Prompt" IN "${artStyle}" ART STYLE.
======================================================================= -->

# ${deck.title}
**Subject:** ${deck.subject} | **Target Audience:** ${deck.targetAudience} | **Slide Count:** EXACTLY ${totalCount} Slides | **Duration:** ~${deck.totalEstimatedMinutes} min

> **Instructional Objective:** ${deck.pedagogyNotes}

---

`;

  deck.slides.forEach((s) => {
    const slideStyle = s.visualPrompt?.illustrationStyle || artStyle;

    md += `## Slide ${s.slideNumber}: ${s.title}\n`;
    md += `### ${s.headline}\n\n`;
    md += `*Layout Archetype: ${s.layoutType} | Duration: ${s.estimatedTime}*\n\n`;

    md += `**Key Points / Content:**\n`;
    s.bullets.forEach((b) => {
      md += `- ${b}\n`;
    });
    md += `\n`;

    md += `**Visual Direction & AI Image Generation Prompt:**\n`;
    md += `> **Style:** ${slideStyle}\n`;
    md += `> **Prompt:** \`${s.visualPrompt.imagePrompt}\`\n`;
    md += `*Placement:* ${s.visualPrompt.recommendedPlacement} | *Alt Text:* ${s.visualPrompt.altText}\n\n`;

    if (s.assessment && s.assessment.question) {
      md += `**Interactive Check-for-Understanding:**\n`;
      md += `* **Question:** ${s.assessment.question}\n`;
      if (s.assessment.options && s.assessment.options.length > 0) {
        s.assessment.options.forEach((opt) => {
          const isCorrect = opt === s.assessment?.correctAnswer;
          md += `  - [${isCorrect ? 'x' : ' '}] ${opt}\n`;
        });
      }
      if (s.assessment.explanation) {
        md += `  *Explanation: ${s.assessment.explanation}*\n`;
      }
      md += `\n`;
    }

    md += `---\n\n`;
  });

  return md;
}

/**
 * Compiles all embedded slide assessments into CSV format
 * formatted for bulk importing into Kahoot, Blooket, or Quizlet.
 */
export function exportQuizzesToCSV(deck: SlideDeck): void {
  const rows: string[][] = [
    ['Question', 'Answer 1', 'Answer 2', 'Answer 3', 'Answer 4', 'Time Limit (sec)', 'Correct Answer', 'Explanation'],
  ];

  deck.slides.forEach((s) => {
    if (s.assessment && s.assessment.question) {
      const q = s.assessment.question.replace(/"/g, '""');
      const explanation = (s.assessment.explanation || '').replace(/"/g, '""');

      if (s.assessment.options && s.assessment.options.length >= 2) {
        const opts = s.assessment.options.map((o) => o.replace(/"/g, '""'));
        const opt1 = opts[0] || '';
        const opt2 = opts[1] || '';
        const opt3 = opts[2] || '';
        const opt4 = opts[3] || '';

        // Find index of correct answer (1-indexed for Kahoot)
        let correctIndex = 1;
        if (s.assessment.correctAnswer) {
          const found = opts.findIndex((o) => o.trim() === s.assessment?.correctAnswer?.trim());
          if (found !== -1) correctIndex = found + 1;
        }

        rows.push([`"${q}"`, `"${opt1}"`, `"${opt2}"`, `"${opt3}"`, `"${opt4}"`, '30', correctIndex.toString(), `"${explanation}"`]);
      } else {
        // True/false or open discussion
        rows.push([`"${q}"`, '"True"', '"False"', '""', '""', '45', '1', `"${explanation}"`]);
      }
    }
  });

  const csvContent = rows.map((e) => e.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${deck.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Kahoot_Blooket_Quizzes.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers clean browser print mode with specialized slide handout styles
 */
export function triggerPrintPDF(): void {
  window.print();
}

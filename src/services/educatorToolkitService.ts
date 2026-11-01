import {
  LessonPlanData,
  LessonPlanFramework,
  RubricData,
  DifferentiationData,
  SubPlanData,
  SlideDeck,
} from '../types/deck';

// =========================================================================
// FALLBACK DEFAULT GENERATORS (Offline & High-Reliability Safeguard)
// =========================================================================

export function createDefaultLessonPlan(
  topic: string = 'Cellular Respiration & Energy Transformation',
  subject: string = 'Biology & Life Sciences',
  gradeLevel: string = 'Senior High School (Grades 11-12)',
  framework: LessonPlanFramework = '5E Model',
  deck?: SlideDeck | null
): LessonPlanData {
  const cleanTitle = deck?.title || topic;
  const cleanSubject = deck?.subject || subject;
  const cleanGrade = deck?.gradeLevel || gradeLevel;

  return {
    title: `Lesson Plan: ${cleanTitle}`,
    subject: cleanSubject,
    gradeLevel: cleanGrade,
    durationMinutes: deck?.totalEstimatedMinutes || 50,
    framework,
    standards: 'NGSS HS-LS1-7: Construct and revise an explanation based on evidence for how cellular respiration transforms energy.',
    essentialQuestion: `How do living organisms convert microscopic chemical bonds into usable cellular kinetic energy?`,
    objectives: [
      `SWBAT contrast aerobic glycolysis and the citric acid cycle with 85% analytical accuracy.`,
      `SWBAT construct an energy balance model tracking ATP synthesis per glucose molecule.`,
      `SWBAT evaluate common student misconceptions regarding respiratory vs. cellular metabolism.`,
    ],
    materials: [
      `SlideCraft Presentation Deck (${deck?.slides?.length || 10} slides loaded)`,
      `Student interactive guided graphic organizers`,
      `Molecular modeling kits or digital simulation tablets`,
      `Formative Exit Ticket slips (2-minute check)`,
    ],
    agenda: [
      {
        phase: framework === '5E Model' ? '1. Engage (Hook)' : 'Anticipatory Set',
        time: '7 mins',
        teacherAction: `Project Slide 1-2. Ask: "Why does muscle fatigue happen during a 400m sprint?" Facilitate 90-second Think-Pair-Share.`,
        studentAction: `Discuss physical sensation of lactic acid with lab partners and write down 1 initial hypothesis in journal.`,
        pedagogicalTip: `Do not reveal the answer yet; let students wrestle with the biological paradox.`,
      },
      {
        phase: framework === '5E Model' ? '2. Explore (Inquiry)' : 'Direct Modeling',
        time: '12 mins',
        teacherAction: `Guide students through molecular stages. Model ATP synthase rotation using everyday turbine analogy.`,
        studentAction: `Label mitochondrion membrane diagrams in their notes and trace hydrogen ion gradients.`,
        pedagogicalTip: `Point explicitly to visual anchors and ask for finger-sign checks (1 to 5 comprehension).`,
      },
      {
        phase: framework === '5E Model' ? '3. Explain (Deep Dive)' : 'Guided Practice',
        time: '13 mins',
        teacherAction: `Deconstruct the net equation (C6H12O6 + 6O2 -> 6CO2 + 6H2O + 36-38 ATP). Highlight energy conservation law.`,
        studentAction: `Work in table triads to balance input vs output moles using molecular tokens.`,
        pedagogicalTip: `Target Table 3 and Table 5 for quick check-ins to catch stoichiometry misunderstandings.`,
      },
      {
        phase: framework === '5E Model' ? '4. Elaborate (Extension)' : 'Independent Application',
        time: '12 mins',
        teacherAction: `Present clinical scenario: "What happens if mitochondrial cyanide blocks Complex IV electron transfer?"`,
        studentAction: `Write 3-sentence diagnostic rationale on how cellular shutdown causes rapid organ failure.`,
        pedagogicalTip: `Tier 3 students should diagram alternate anaerobic fermentation pathways.`,
      },
      {
        phase: framework === '5E Model' ? '5. Evaluate (Closure)' : 'Exit Ticket & Synthesis',
        time: '6 mins',
        teacherAction: `Collect Exit Ticket slips. Review common misconception before final dismissal bell.`,
        studentAction: `Complete 2 formative questions independently without notes and hand in at classroom door.`,
        pedagogicalTip: `Sort tickets into 3 piles (Mastered, Minor Gap, Needs Re-teaching) for tomorrow's bell ringer.`,
      },
    ],
    exitTicket: `In your own words: Why do human cells starve for energy without oxygen even when glucose is abundant? (Explain using ATP yield)`,
    differentiationNote: `Tier 1 receives pre-filled skeleton notes; ELL receives visual bilingual glossary; Tier 3 evaluates uncoupling protein thermogenesis.`,
  };
}

export function createDefaultRubric(
  topic: string = 'Mastery Presentation & Research Defense',
  assessmentType: RubricData['assessmentType'] = 'Oral Presentation',
  gradeLevel: string = 'Senior High School (Grades 11-12)',
  deck?: SlideDeck | null
): RubricData {
  const cleanTitle = deck?.title || topic;

  return {
    title: `Analytical Assessment Rubric: ${cleanTitle}`,
    subject: deck?.subject || 'Interdisciplinary Curriculum',
    assessmentType,
    maxScore: 16,
    criteria: [
      {
        id: 'crit-1',
        category: 'Conceptual Depth & Accuracy',
        weightPercentage: 30,
        levels: [
          {
            score: 1,
            label: 'Beginning',
            descriptor: 'Contains factual errors or surface-level definitions without understanding of underlying principles.',
          },
          {
            score: 2,
            label: 'Developing',
            descriptor: 'Explains foundational facts correctly but struggles to articulate cause-and-effect relationships or exceptions.',
          },
          {
            score: 3,
            label: 'Proficient',
            descriptor: 'Accurately explains core mechanisms, connects key concepts, and supports claims with verifiable curricular evidence.',
          },
          {
            score: 4,
            label: 'Exemplary',
            descriptor: 'Demonstrates master-level synthesis, anticipates counterarguments, and provides novel real-world synthesis with zero flaws.',
          },
        ],
      },
      {
        id: 'crit-2',
        category: 'Evidence, Modeling & Data Synthesis',
        weightPercentage: 25,
        levels: [
          {
            score: 1,
            label: 'Beginning',
            descriptor: 'Omits quantitative data, diagrams, or scientific evidence; relies purely on unsupported assertions.',
          },
          {
            score: 2,
            label: 'Developing',
            descriptor: 'Includes basic charts or quotes but lacks interpretation or fails to explain their analytical significance.',
          },
          {
            score: 3,
            label: 'Proficient',
            descriptor: 'Integrates relevant diagrams, charts, and citations effectively to corroborate instructional arguments.',
          },
          {
            score: 4,
            label: 'Exemplary',
            descriptor: 'Flawlessly contextualizes complex multi-variable models, explains data anomalies, and cites primary literature.',
          },
        ],
      },
      {
        id: 'crit-3',
        category: 'Organization & Visual Clarity',
        weightPercentage: 25,
        levels: [
          {
            score: 1,
            label: 'Beginning',
            descriptor: 'Disorganized trajectory; slides or materials are cluttered, difficult to read, or jump erratically between topics.',
          },
          {
            score: 2,
            label: 'Developing',
            descriptor: 'Follows an outline, but transitions feel abrupt or cognitive density is unevenly distributed across sections.',
          },
          {
            score: 3,
            label: 'Proficient',
            descriptor: 'Logical narrative trajectory; clean visual hierarchy with readable typography, concise anchors, and smooth transitions.',
          },
          {
            score: 4,
            label: 'Exemplary',
            descriptor: 'Masterfully orchestrated flow; visual dual-coding elevates cognitive retention; pacing feels natural and effortless.',
          },
        ],
      },
      {
        id: 'crit-4',
        category: 'Delivery, Defense & Socratic Q&A',
        weightPercentage: 20,
        levels: [
          {
            score: 1,
            label: 'Beginning',
            descriptor: 'Reads directly from slides or notes with monotone delivery; unable to answer clarifying questions from peers.',
          },
          {
            score: 2,
            label: 'Developing',
            descriptor: 'Maintains occasional eye contact; answers predictable questions but hesitates when challenged with novel scenarios.',
          },
          {
            score: 3,
            label: 'Proficient',
            descriptor: 'Engaging delivery with clear vocal projection; addresses teacher and student questions confidently with evidence.',
          },
          {
            score: 4,
            label: 'Exemplary',
            descriptor: 'Charismatic authority; commands audience engagement; deftly handles rigorous inquiry and invites classroom debate.',
          },
        ],
      },
    ],
  };
}

export function createDefaultDifferentiation(
  topic: string = 'Cellular Respiration & Energy Transformation',
  gradeLevel: string = 'Senior High School (Grades 11-12)',
  deck?: SlideDeck | null
): DifferentiationData {
  const cleanTitle = deck?.title || topic;
  const cleanGrade = deck?.gradeLevel || gradeLevel;

  return {
    topic: cleanTitle,
    gradeLevel: cleanGrade,
    tiers: [
      {
        tierName: 'Tier 1: Scaffolded Support',
        targetLearners: 'Students requiring reading scaffolding, emerging English learners, or IEP visual accommodations',
        activityPrompt: `Complete the fill-in-the-blank energy flow diagram using the provided word bank. Identify where oxygen enters and where carbon dioxide leaves.`,
        scaffolds: [
          `Sentence Stems: "During this reaction, glucose is broken down into _______ which releases _______."`,
          `Color-coded molecular diagram cards (Blue = Inputs, Orange = Outputs)`,
          `Reduced choice sets (2 options instead of 4 for multiple-choice checkpoints)`,
          `Peer buddy pairing during the guided practice modeling phase`,
        ],
      },
      {
        tierName: 'Tier 2: Core Mastery',
        targetLearners: 'On-grade level students demonstrating foundational prerequisite knowledge',
        activityPrompt: `Calculate the net yield of ATP synthesized between glycolysis and the electron transport chain. Write a 1-paragraph summary explaining why the inner mitochondrial membrane surface area matters.`,
        scaffolds: [
          `Standard formula balance sheet with intermediate checkpoints`,
          `Guiding analytical questions: "What happens to the proton concentration gradient?"`,
          `Collaborative table discussion protocol (Numbered Heads Together)`,
        ],
      },
      {
        tierName: 'Tier 3: Advanced Inquiry',
        targetLearners: 'Gifted, advanced placement (AP/IB), or high-curiosity students seeking deeper conceptual challenge',
        activityPrompt: `Investigate brown adipose tissue (BAT) and how thermogenin protein acts as an uncoupler to produce non-shivering heat in hibernating mammals instead of ATP. Propose a medical bio-engineering application.`,
        scaffolds: [
          `Open-ended Socratic challenge without formula constraints`,
          `Access to primary research abstract on metabolic uncouplers`,
          `Student-led mini-defense: Explain your bio-energetic model to table peers`,
        ],
      },
    ],
    vocabularyBridge: [
      {
        term: 'Glycolysis',
        simpleDefinition: 'The breakdown of sugar molecules into smaller energy pieces inside the cell cytoplasm.',
        contextClue: 'Before entering the mitochondrion, glucose undergoes glycolysis in the cellular fluid.',
        spanish: 'Glucólisis (descomposición de azúcar)',
        tagalog: 'Glukolisis (paghahati ng asukal)',
      },
      {
        term: 'ATP Synthase',
        simpleDefinition: 'A microscopic biological motor that generates cellular battery packs (ATP).',
        contextClue: 'Like water spinning a hydroelectric turbine, rushing protons rotate ATP synthase.',
        spanish: 'ATP Sintasa (motor de energía celular)',
        tagalog: 'ATP Sintase (motor ng enerhiya)',
      },
      {
        term: 'Aerobic',
        simpleDefinition: 'A process that strictly requires oxygen gas to proceed.',
        contextClue: 'Mitochondrial respiration is aerobic because oxygen acts as the final electron sponge.',
        spanish: 'Aeróbico (requiere oxígeno)',
        tagalog: 'Aerobic (nangangailangan ng oxygen)',
      },
      {
        term: 'Metabolism',
        simpleDefinition: 'All the chemical reactions inside your body that turn food into energy and building blocks.',
        contextClue: 'Fast running temporarily speeds up your body\'s cellular metabolism.',
        spanish: 'Metabolismo (reacciones de energía)',
        tagalog: 'Metabolismo (proseso ng enerhiya)',
      },
    ],
    iepAccommodations: [
      `Allow extra response time (1.5x) on formative assessment checkpoints.`,
      `Provide pre-printed guided notes with bold keyword anchors to reduce copying fatigue.`,
      `Seat student near the front interactive display with clear sightline to teacher gestures.`,
      `Permit verbal explanation or audio recording as an alternative to written essays.`,
      `Check for comprehension after directions are given by asking student to summarize in own words.`,
    ],
  };
}

export function createDefaultSubPlan(
  topic: string = 'Cellular Respiration & Energy Transformation',
  teacherName: string = 'Mr. Mark Welly',
  date: string = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
  roomNumber: string = 'Room 204 (Science Wing)',
  deck?: SlideDeck | null
): SubPlanData {
  const cleanTopic = deck?.title || topic;

  return {
    teacherName,
    date,
    roomNumber,
    emergencyPhone: 'Front Office Ext. 101 | Department Head: Ext. 215',
    subTeacherWelcome: `Thank you so much for stepping in today! Everything needed for a smooth, productive class period is laid out below. All presentation slides are queued up on the main computer, and student handouts are organized on the front desk.`,
    periods: [
      {
        period: 'Period 1 (8:30 AM - 9:25 AM)',
        timeRange: '8:30 AM - 9:25 AM',
        courseName: 'Honors Biology',
        slideDeckTopic: cleanTopic,
        subInstructions: [
          `Take attendance within the first 5 minutes on the teacher tablet.`,
          `Wake up the main screen: Presentation slides are already open in SlideCraft AI.`,
          `Click 'Present' on Slide 1. Have student helper Maya advance slides using the wireless remote.`,
          `Play the 4-minute lesson recap on Slide 3. Have students open their blue notebooks.`,
          `At 9:05 AM, distribute the 1-page independent synthesis worksheet from the green tray.`,
        ],
        studentHandoutTask: `Complete Section A (ATP diagram labeling) and answer Questions 1-4 independently. Quiet individual work until the bell.`,
      },
      {
        period: 'Period 3 (10:15 AM - 11:10 AM)',
        timeRange: '10:15 AM - 11:10 AM',
        courseName: 'General Science 10',
        slideDeckTopic: cleanTopic,
        subInstructions: [
          `Remind class that cellphone policy is strictly 'In backpacks at all times'.`,
          `Review Slide 4-7 together. Call on student volunteers to read the bold key terms.`,
          `Students work in their assigned pairs for 15 minutes to complete the guided organizer.`,
          `Collect all student organizers 5 minutes before the bell; leave them in the orange folder.`,
        ],
        studentHandoutTask: `Paired concept map: Trace 1 glucose molecule from digestion to cellular energy.`,
      },
      {
        period: 'Period 5 (1:00 PM - 1:55 PM)',
        timeRange: '1:00 PM - 1:55 PM',
        courseName: 'AP Biology Laboratory',
        slideDeckTopic: `${cleanTopic} - Inquiry Lab Prep`,
        subInstructions: [
          `No wet lab chemicals today for safety. Students will conduct the digital simulation on Chromebooks.`,
          `Project Slide 8 with the interactive check-in question.`,
          `Circulate the classroom to ensure students are logging data into their simulation spreadsheets.`,
        ],
        studentHandoutTask: `Complete the digital simulation report and submit to Google Classroom before 2:00 PM.`,
      },
    ],
    studentHelpers: [
      `Maya Chen (Period 1): Knows how to run the projector audio and lights.`,
      `Lucas Ramos (Period 3): Class materials distributor and reliable timekeeper.`,
      `Sophia Patel (Period 5): Lab equipment monitor and attendance escort.`,
    ],
    classroomManagementRules: [
      `Bathroom Passes: One student out at a time using the wooden hall pass by the door.`,
      `Technology: Chromebooks should remain closed unless instructed during Period 5.`,
      `Noise Level: Level 1 (quiet partner whispers) during work sessions.`,
      `Emergencies: Call Ext. 101 for administration or campus security if assistance is needed.`,
    ],
    feedbackForTeacherNote: `Please leave a quick note below about how the classes did, who was especially helpful, and anyone who required extra behavioral redirection. Thank you!`,
  };
}

// =========================================================================
// API GENERATION CALLERS
// =========================================================================

export async function generateAILessonPlan(
  topic: string,
  subject: string,
  gradeLevel: string,
  framework: LessonPlanFramework,
  deck?: SlideDeck | null
): Promise<LessonPlanData> {
  try {
    const res = await fetch('/api/generate-educator-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolType: 'lesson_plan',
        topic,
        subject,
        gradeLevel,
        framework,
        deckSummary: deck ? `Title: ${deck.title}, Subject: ${deck.subject}, Slides: ${deck.slides.length}, Key Concepts: ${deck.slides.slice(0, 5).map(s => s.title).join(', ')}` : '',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.title && data.agenda) {
        return data as LessonPlanData;
      }
    }
  } catch (err) {
    console.warn('[Educator Toolkit] API offline or throttled. Using built-in master curriculum engine.');
  }

  return createDefaultLessonPlan(topic, subject, gradeLevel, framework, deck);
}

export async function generateAIRubric(
  topic: string,
  assessmentType: RubricData['assessmentType'],
  gradeLevel: string,
  deck?: SlideDeck | null
): Promise<RubricData> {
  try {
    const res = await fetch('/api/generate-educator-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolType: 'rubric',
        topic,
        assessmentType,
        gradeLevel,
        deckSummary: deck ? `Title: ${deck.title}, Slides: ${deck.slides.length}, Outline: ${deck.slides.map(s => s.title).join('; ')}` : '',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.title && data.criteria) {
        return data as RubricData;
      }
    }
  } catch (err) {
    console.warn('[Educator Toolkit] API offline or throttled. Using built-in master curriculum engine.');
  }

  return createDefaultRubric(topic, assessmentType, gradeLevel, deck);
}

export async function generateAIDifferentiation(
  topic: string,
  gradeLevel: string,
  deck?: SlideDeck | null
): Promise<DifferentiationData> {
  try {
    const res = await fetch('/api/generate-educator-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolType: 'differentiation',
        topic,
        gradeLevel,
        deckSummary: deck ? `Title: ${deck.title}, Slides: ${deck.slides.length}, Vocabulary: ${deck.slides.slice(0, 6).map(s => s.title).join(', ')}` : '',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.topic && data.tiers) {
        return data as DifferentiationData;
      }
    }
  } catch (err) {
    console.warn('[Educator Toolkit] API offline or throttled. Using built-in master curriculum engine.');
  }

  return createDefaultDifferentiation(topic, gradeLevel, deck);
}

export async function generateAISubPlan(
  topic: string,
  teacherName: string,
  roomNumber: string,
  deck?: SlideDeck | null
): Promise<SubPlanData> {
  try {
    const res = await fetch('/api/generate-educator-tool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        toolType: 'sub_plan',
        topic,
        teacherName,
        roomNumber,
        deckSummary: deck ? `Title: ${deck.title}, Slides: ${deck.slides.length}` : '',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.periods) {
        return data as SubPlanData;
      }
    }
  } catch (err) {
    console.warn('[Educator Toolkit] API offline or throttled. Using built-in master curriculum engine.');
  }

  return createDefaultSubPlan(topic, teacherName, undefined, roomNumber, deck);
}

// =========================================================================
// EXPORT & PRINT HELPERS
// =========================================================================

export function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportRubricToCSV(rubric: RubricData): string {
  const headers = ['Category', 'Weight', 'Exemplary (4)', 'Proficient (3)', 'Developing (2)', 'Beginning (1)'];
  const rows = rubric.criteria.map((c) => {
    const getLevel = (score: number) => c.levels.find((l) => l.score === score)?.descriptor || '';
    return [
      `"${c.category.replace(/"/g, '""')}"`,
      `"${c.weightPercentage}%"`,
      `"${getLevel(4).replace(/"/g, '""')}"`,
      `"${getLevel(3).replace(/"/g, '""')}"`,
      `"${getLevel(2).replace(/"/g, '""')}"`,
      `"${getLevel(1).replace(/"/g, '""')}"`,
    ];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

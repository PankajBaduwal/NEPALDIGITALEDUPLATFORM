/**
 * PIYUSHDHARA EDUVERSE — FOUNDATIONAL STAGE (CLASS 1) SIMULATION 7
 *
 * Title: A Day in the Life of Chintu! (Time, Sequences & Daily Routines)
 * Alignment: NCERT Class 1 Joyful Mathematics Chapter 6 (Time / समय)
 * Archetype: TIMELINE_SEQUENCER & CHRONOLOGICAL_STORY_BOARD
 *
 * Concepts Taught:
 * 1. Parts of the Day: Morning (सुबह), Afternoon (दोपहर), Evening (शाम), Night (रात).
 * 2. Chronological Ordering: Earlier vs Later, What happens before and after.
 * 3. Daily Routine Sequencing:
 *    - Morning: Waking up at sunrise, brushing teeth, getting ready for school.
 *    - Afternoon: Studying in class, eating lunch with classmates.
 *    - Evening: Playing in the park, cycling, returning home at sunset.
 *    - Night: Having dinner with family, sleeping under the starry moonlit sky.
 * 4. Multi-sensory Day/Night Sky Simulation:
 *    - Interactive sun & moon arc transitioning from golden dawn to starry night.
 *    - Large tactile activity cards (>= 64px) with bilingual speech scaffolding.
 */

import {
  defineSchool,
  metric,
  P,
  type SchoolSimulationDefinition,
} from './kit';
import {
  FoundationalAudio,
  FoundationalNarrator,
  FoundationalTouchHelper,
  createConfettiBurst,
  drawInstructionBanner,
  drawCelebrationOverlay,
  type IParticle,
  type IBoundingBox,
} from './foundational-kit';

/* ── Types & Activity Definitions ── */

export type TimeActivityId = 'morning-wake' | 'afternoon-school' | 'evening-play' | 'night-sleep';

export interface DailyActivityDef {
  id: TimeActivityId;
  order: number; // 1 to 4
  partOfDayEn: string;
  partOfDayHi: string;
  titleEn: string;
  titleHi: string;
  icon: string;
  color: string;
  skyTheme: 'dawn' | 'noon' | 'dusk' | 'night';
}

export const CHINTU_ACTIVITIES: Record<TimeActivityId, DailyActivityDef> = {
  'morning-wake': {
    id: 'morning-wake',
    order: 1,
    partOfDayEn: 'Morning',
    partOfDayHi: 'सुबह',
    titleEn: 'Wake up & Brush',
    titleHi: 'जागना और ब्रश करना',
    icon: '🌅',
    color: '#F59E0B',
    skyTheme: 'dawn',
  },
  'afternoon-school': {
    id: 'afternoon-school',
    order: 2,
    partOfDayEn: 'Afternoon',
    partOfDayHi: 'दोपहर',
    titleEn: 'School & Lunch',
    titleHi: 'स्कूल और दोपहर का खाना',
    icon: '🏫',
    color: '#0284C7',
    skyTheme: 'noon',
  },
  'evening-play': {
    id: 'evening-play',
    order: 3,
    partOfDayEn: 'Evening',
    partOfDayHi: 'शाम',
    titleEn: 'Play in Park',
    titleHi: 'पार्क में खेलना',
    icon: '⚽',
    color: '#EA580C',
    skyTheme: 'dusk',
  },
  'night-sleep': {
    id: 'night-sleep',
    order: 4,
    partOfDayEn: 'Night',
    partOfDayHi: 'रात',
    titleEn: 'Dinner & Sleep',
    titleHi: 'रात का खाना और सोना',
    icon: '🌙',
    color: '#6366F1',
    skyTheme: 'night',
  },
};

export interface TimelineSlot {
  slotOrder: number; // 1 to 4
  partOfDayEn: string;
  partOfDayHi: string;
  x: number;
  y: number;
  width: number;
  height: number;
  placedActivityId: TimeActivityId | null;
}

export interface ActivityCardToken {
  id: TimeActivityId;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  width: number;
  height: number;
  isDragging: boolean;
  isPlaced: boolean;
}

export interface TimeChintuState {
  mode: 'timeline-sequence' | 'earlier-later-quiz';
  slots: TimelineSlot[];
  cards: ActivityCardToken[];
  activeDragId: TimeActivityId | null;
  dragOffsetX: number;
  dragOffsetY: number;

  currentSkyPhase: 'dawn' | 'noon' | 'dusk' | 'night';
  sunMoonAngle: number;

  // Earlier vs Later Challenge State
  quizQuestionIdx: number;
  selectedQuizAnswer: TimeActivityId | null;
  isQuizCorrect: boolean | null;

  isCelebrating: boolean;
  celebrationMessage: string;
  starsEarned: number;
  particles: IParticle[];

  promptText: string;
  promptHindiText: string;
  speakerBounds: IBoundingBox | null;
  isSpeakerActive: boolean;

  time: number;
  tickCount: number;
}

/* ── Earlier vs Later Quiz Challenges ── */

export interface TimeQuizCard {
  questionEn: string;
  questionHi: string;
  optionA: TimeActivityId;
  optionB: TimeActivityId;
  correctOption: TimeActivityId;
  explanationEn: string;
  explanationHi: string;
}

const TIME_QUIZZES: TimeQuizCard[] = [
  {
    questionEn: 'Which activity happens EARLIER in the day?',
    questionHi: 'दिन में कौन सा काम पहले होता है?',
    optionA: 'morning-wake',
    optionB: 'evening-play',
    correctOption: 'morning-wake',
    explanationEn: 'Morning comes earlier than Evening!',
    explanationHi: 'सुबह शाम से पहले आती है!',
  },
  {
    questionEn: 'Which activity happens LATER in the day?',
    questionHi: 'दिन में कौन सा काम बाद में होता है?',
    optionA: 'afternoon-school',
    optionB: 'night-sleep',
    correctOption: 'night-sleep',
    explanationEn: 'Night comes later than Afternoon!',
    explanationHi: 'रात दोपहर के बाद आती है!',
  },
  {
    questionEn: 'What do we do BEFORE playing in the evening?',
    questionHi: 'शाम को खेलने से पहले हम क्या करते हैं?',
    optionA: 'afternoon-school',
    optionB: 'night-sleep',
    correctOption: 'afternoon-school',
    explanationEn: 'We go to school in the afternoon before playing in the evening!',
    explanationHi: 'शाम को खेलने से पहले हम दोपहर में स्कूल जाते हैं!',
  },
];

/* ── Helper Factories ── */

function createTimelineSlots(w: number, h: number): TimelineSlot[] {
  const slots: TimelineSlot[] = [];
  const slotW = 145;
  const slotH = 110;
  const startX = w * 0.08;
  const spacing = (w * 0.84) / 4;
  const slotY = h * 0.42;

  const parts = [
    { order: 1, en: '1. Morning', hi: '1. सुबह' },
    { order: 2, en: '2. Afternoon', hi: '2. दोपहर' },
    { order: 3, en: '3. Evening', hi: '3. शाम' },
    { order: 4, en: '4. Night', hi: '4. रात' },
  ];

  parts.forEach((p, i) => {
    const sx = startX + i * spacing;
    slots.push({
      slotOrder: p.order,
      partOfDayEn: p.en,
      partOfDayHi: p.hi,
      x: sx,
      y: slotY,
      width: slotW,
      height: slotH,
      placedActivityId: null,
    });
  });

  return slots;
}

function createActivityCards(w: number, h: number): ActivityCardToken[] {
  // Scrambled initial order for child puzzle
  const activityIds: TimeActivityId[] = [
    'evening-play',
    'morning-wake',
    'night-sleep',
    'afternoon-school',
  ];

  const cardW = 140;
  const cardH = 80;
  const startX = w * 0.08;
  const spacing = (w * 0.84) / 4;
  const trayY = h * 0.8;

  return activityIds.map((id, idx) => {
    const cx = startX + idx * spacing;
    return {
      id,
      x: cx,
      y: trayY,
      baseX: cx,
      baseY: trayY,
      width: cardW,
      height: cardH,
      isDragging: false,
      isPlaced: false,
    };
  });
}

/* ── Canvas Drawing Procedures ── */

function drawSkyAndHorizon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  phase: 'dawn' | 'noon' | 'dusk' | 'night',
  sunAngle: number
): void {
  // Dynamic Sky Gradient based on current time phase
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
  if (phase === 'dawn') {
    skyGrad.addColorStop(0, '#FED7AA'); // Morning apricot
    skyGrad.addColorStop(0.5, '#FEF08A'); // Warm morning yellow
    skyGrad.addColorStop(1, '#BAE6FD'); // Soft blue
  } else if (phase === 'noon') {
    skyGrad.addColorStop(0, '#38BDF8'); // Bright blue
    skyGrad.addColorStop(0.7, '#BAE6FD');
    skyGrad.addColorStop(1, '#E0F2FE');
  } else if (phase === 'dusk') {
    skyGrad.addColorStop(0, '#7C3AED'); // Twilight violet
    skyGrad.addColorStop(0.5, '#F97316'); // Sunset orange
    skyGrad.addColorStop(1, '#FDE047'); // Horizon gold
  } else {
    // Night
    skyGrad.addColorStop(0, '#0F172A'); // Deep midnight navy
    skyGrad.addColorStop(0.6, '#1E1B4B');
    skyGrad.addColorStop(1, '#312E81');
  }

  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h * 0.4);

  // Twinkling stars if night
  if (phase === 'night') {
    ctx.fillStyle = '#FFFFFF';
    const stars = [
      { x: w * 0.15, y: 35, r: 2 },
      { x: w * 0.35, y: 50, r: 1.5 },
      { x: w * 0.55, y: 25, r: 2.2 },
      { x: w * 0.75, y: 45, r: 1.8 },
      { x: w * 0.88, y: 30, r: 2.5 },
      { x: w * 0.25, y: 65, r: 1.2 },
    ];
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Sun or Moon Arc
  const arcCenterX = w * 0.5;
  const arcCenterY = h * 0.35;
  const arcRadius = w * 0.38;

  const celestialX = arcCenterX + Math.cos(sunAngle) * arcRadius;
  const celestialY = arcCenterY - Math.sin(sunAngle) * (h * 0.22);

  if (phase === 'night') {
    // Crescent Moon
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(celestialX, celestialY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1E1B4B';
    ctx.beginPath();
    ctx.arc(celestialX + 6, celestialY - 4, 15, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Radiant Sun with gentle pulse
    ctx.fillStyle = phase === 'dusk' ? '#F97316' : '#FBBF24';
    ctx.beginPath();
    ctx.arc(celestialX, celestialY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
    ctx.beginPath();
    ctx.arc(celestialX, celestialY, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  // Gentle rolling green hills
  ctx.fillStyle = phase === 'night' ? '#1E293B' : '#15803D';
  ctx.beginPath();
  ctx.arc(w * 0.2, h * 0.46, 200, Math.PI, 0, false);
  ctx.fill();

  ctx.fillStyle = phase === 'night' ? '#0F172A' : '#16A34A';
  ctx.beginPath();
  ctx.arc(w * 0.78, h * 0.48, 240, Math.PI, 0, false);
  ctx.fill();

  // Cozy Little Home with Chimney on hill
  const houseX = w * 0.16;
  const houseY = h * 0.33;
  ctx.fillStyle = '#B45309';
  ctx.fillRect(houseX, houseY, 36, 26);
  // Roof
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.moveTo(houseX - 4, houseY);
  ctx.lineTo(houseX + 18, houseY - 14);
  ctx.lineTo(houseX + 40, houseY);
  ctx.closePath();
  ctx.fill();
  // Warm window glow
  ctx.fillStyle = phase === 'night' ? '#FBBF24' : '#BAE6FD';
  ctx.fillRect(houseX + 10, houseY + 6, 12, 12);
}

function drawTimelineSlot(
  ctx: CanvasRenderingContext2D,
  slot: TimelineSlot,
  isLangHindi: boolean,
  isHovered: boolean
): void {
  ctx.save();
  ctx.translate(slot.x, slot.y);

  const isFilled = slot.placedActivityId !== null;

  // Background slot card
  ctx.fillStyle = isFilled
    ? '#FFFFFF'
    : isHovered
    ? '#ECFDF5'
    : 'rgba(255, 255, 255, 0.85)';
  ctx.strokeStyle = isFilled
    ? '#10B981'
    : isHovered
    ? '#059669'
    : '#94A3B8';
  ctx.lineWidth = isFilled ? 3 : 2;

  if (!isFilled) {
    ctx.setLineDash([6, 5]);
  }
  ctx.beginPath();
  ctx.roundRect(0, 0, slot.width, slot.height, 16);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);

  // Slot Header Label: Part of Day
  ctx.fillStyle = isFilled ? '#065F46' : '#475569';
  ctx.font = 'bold 13px "Quicksand", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(isLangHindi ? slot.partOfDayHi : slot.partOfDayEn, slot.width / 2, 8);

  // Content inside slot
  if (isFilled && slot.placedActivityId) {
    const actDef = CHINTU_ACTIVITIES[slot.placedActivityId];
    if (actDef) {
      // Big Icon
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(actDef.icon, slot.width / 2, slot.height * 0.52);

      // Title
      ctx.font = 'bold 11px "Quicksand", system-ui, sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(
        isLangHindi ? actDef.titleHi : actDef.titleEn,
        slot.width / 2,
        slot.height * 0.82
      );
    }
  } else {
    // Empty Slot Prompt
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📥', slot.width / 2, slot.height * 0.52);

    ctx.font = 'bold 11px "Quicksand", system-ui, sans-serif';
    ctx.fillText(isLangHindi ? 'यहाँ रखें' : 'Place Here', slot.width / 2, slot.height * 0.82);
  }

  ctx.restore();
}

function drawActivityCard(
  ctx: CanvasRenderingContext2D,
  token: ActivityCardToken,
  isLangHindi: boolean
): void {
  const actDef = CHINTU_ACTIVITIES[token.id];
  if (!actDef) return;

  ctx.save();
  ctx.translate(token.x, token.y);

  // Shadow
  ctx.shadowColor = token.isDragging ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = token.isDragging ? 18 : 6;
  ctx.shadowOffsetY = token.isDragging ? 8 : 3;

  // Card Body
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = token.isDragging ? '#6366F1' : actDef.color;
  ctx.lineWidth = token.isDragging ? 3.5 : 2.5;
  ctx.beginPath();
  ctx.roundRect(0, 0, token.width, token.height, 16);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';

  // Left Icon Badge
  ctx.font = '30px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(actDef.icon, 30, token.height / 2);

  // Text details on right
  ctx.textAlign = 'left';
  ctx.fillStyle = actDef.color;
  ctx.font = 'bold 12px "Quicksand", system-ui, sans-serif';
  ctx.fillText(
    isLangHindi ? actDef.partOfDayHi : actDef.partOfDayEn,
    58,
    token.height * 0.35
  );

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 11px "Quicksand", system-ui, sans-serif';
  ctx.fillText(
    isLangHindi ? actDef.titleHi : actDef.titleEn,
    58,
    token.height * 0.68
  );

  ctx.restore();
}

/* ═══════════════════════════════════════════════════════════════
   SIMULATION ENGINE DEFINITION
   ═══════════════════════════════════════════════════════════════ */

export const chintuDayTimeSimulation: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class1-time-chintu-day',
  title: 'A Day in the Life of Chintu! (Time, Sequences & Daily Routines)',
  band: 'GRADES_1_8',
  level: 'class-1',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '⏰',
  topic: 'Time: Daily Routine & Chronological Sequencing',
  shortDescription:
    'Join Chintu through morning, afternoon, evening, and night! Arrange his daily routine in chronological order and discover what happens earlier and later!',
  detailedDescription:
    'Aligned with NCERT Class 1 Mathematics Chapter 6 ("Time"). Children build chronological temporal reasoning by ordering routine activities into a timeline and answering earlier/later and before/after story challenges. Features animated sky transitions and bilingual speech synthesis.',
  learningObjectives: [
    'Recognize and name the four major parts of the day: Morning, Afternoon, Evening, and Night',
    'Sequence routine daily activities in correct chronological order from sunrise to bedtime',
    'Develop foundational comparative temporal concepts: Earlier vs Later, Before vs After',
    'Associate visual environmental cues (sun rising, midday sun, sunset, starry moon) with time of day',
  ],
  parameters: [
    P.select('mode', 'Activity Mode', [
      ['timeline-sequence', '1. Arrange Chintu’s Day (दिन की दिनचर्या सजाएं)'],
      ['earlier-later-quiz', '2. Earlier vs Later Challenge (पहले और बाद के सवाल)'],
    ]),
    P.select('lang', 'Audio Language', [
      ['en-IN', 'English (Indian accent)'],
      ['hi-IN', 'Hindi (हिंदी)'],
    ]),
    P.toggle('voicePrompt', 'Auto Voiceover', true),
  ],
  metrics: [
    metric('timeOfDay', 'Part of Day', (s) => (s as any).activePhaseText ?? 'Morning 🌅'),
    metric('timelineProgress', 'Timeline Status', (s) => `${(s as any).placedCount ?? 0} / 4 Activities placed`),
    metric('chronology', 'Ordering', (s) => ((s as any).isComplete ? 'Correct Sequence! ✅' : 'In Progress...')),
    metric('stars', 'Stars Earned', (s) => '⭐'.repeat(Math.max(1, (s as any).starsEarned ?? 1))),
  ],
  tags: [
    'time',
    'morning afternoon evening night',
    'chronological sequencing',
    'earlier later',
    'before after',
    'daily routine',
    'chintu',
    'class 1',
    'ncert',
  ],

  engine: {
    createInitialState: (params, width, height): TimeChintuState => {
      const mode = (params.mode as any) || 'timeline-sequence';
      const w = width || 800;
      const h = height || 500;

      const slots = createTimelineSlots(w, h);
      const cards = createActivityCards(w, h);

      const state: TimeChintuState = {
        mode,
        slots,
        cards,
        activeDragId: null,
        dragOffsetX: 0,
        dragOffsetY: 0,

        currentSkyPhase: 'dawn',
        sunMoonAngle: Math.PI * 0.15,

        quizQuestionIdx: 0,
        selectedQuizAnswer: null,
        isQuizCorrect: null,

        isCelebrating: false,
        celebrationMessage: 'Shabash! Great Daily Routine! ⏰ ⭐',
        starsEarned: 1,
        particles: [],

        promptText: 'Help Chintu arrange his day! Place Morning, Afternoon, Evening, and Night in order!',
        promptHindiText: 'चिंटू की दिनचर्या सजाने में मदद करें! सुबह, दोपहर, शाम और रात को क्रम से लगाएं!',
        speakerBounds: null,
        isSpeakerActive: false,

        time: 0,
        tickCount: 0,
      };

      if (mode === 'earlier-later-quiz') {
        state.promptText = 'Which activity happens earlier or later? Tap the correct card!';
        state.promptHindiText = 'दिन में कौन सा काम पहले या बाद में होता है? सही कार्ड चुनें!';
      }

      if (params.voicePrompt) {
        setTimeout(() => {
          const speakText = params.lang === 'hi-IN' ? state.promptHindiText : state.promptText;
          FoundationalNarrator.speak(speakText, { lang: params.lang || 'en-IN' });
        }, 400);
      }

      return state;
    },

    reset: (params, width, height) => {
      FoundationalAudio.playDrop();
      return (chintuDayTimeSimulation.engine as any).createInitialState(params, width, height);
    },

    update: (state: TimeChintuState, _params, dt, _width, _height) => {
      state.time += dt;
      state.tickCount++;

      // Count placed activities
      const placedCount = state.slots.filter((s) => s.placedActivityId !== null).length;

      // Update Sky phase based on progress or time
      if (placedCount === 1) {
        state.currentSkyPhase = 'dawn';
        state.sunMoonAngle = Math.PI * 0.2;
      } else if (placedCount === 2) {
        state.currentSkyPhase = 'noon';
        state.sunMoonAngle = Math.PI * 0.5;
      } else if (placedCount === 3) {
        state.currentSkyPhase = 'dusk';
        state.sunMoonAngle = Math.PI * 0.8;
      } else if (placedCount === 4) {
        state.currentSkyPhase = 'night';
        state.sunMoonAngle = Math.PI * 0.95;
      }

      // Update particles
      if (state.particles.length > 0) {
        for (const p of state.particles) {
          p.x += p.vx * dt * 60;
          p.y += p.vy * dt * 60;
          p.vy += 220 * dt;
          p.rotation += 4 * dt;
          p.alpha -= dt * 0.6;
        }
        state.particles = state.particles.filter((p) => p.alpha > 0);
      }

      // Metrics
      (state as any).activePhaseText =
        state.currentSkyPhase === 'dawn'
          ? 'Morning 🌅'
          : state.currentSkyPhase === 'noon'
          ? 'Afternoon ☀️'
          : state.currentSkyPhase === 'dusk'
          ? 'Evening 🌇'
          : 'Night 🌙';
      (state as any).placedCount = placedCount;
      (state as any).isComplete = placedCount === 4;

      return state;
    },

    render: (ctx, width, height, state: TimeChintuState, params) => {
      const w = width;
      const h = height;
      const isHindi = params.lang === 'hi-IN';

      // 1. Dynamic Sun/Moon Sky & Landscape
      drawSkyAndHorizon(ctx, w, h, state.currentSkyPhase, state.sunMoonAngle);

      // 2. Timeline Sequence Mode
      if (state.mode === 'timeline-sequence') {
        // Timeline Horizontal connecting arrow
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(w * 0.08, h * 0.48);
        ctx.lineTo(w * 0.92, h * 0.48);
        ctx.stroke();
        ctx.setLineDash([]);

        // Timeline Slots (1..4)
        for (const slot of state.slots) {
          const isSlotHovered = state.activeDragId !== null;
          drawTimelineSlot(ctx, slot, isHindi, isSlotHovered);
        }

        // Tactile Tray for available activity cards
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(w * 0.05, h * 0.72, w * 0.9, h * 0.24, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 12px "Quicksand", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          isHindi ? '— चिंटू के कार्ड्स छुएं या खींचकर ऊपर स्लॉट में लगाएं —' : '— Tap or drag Chintu’s cards into the matching slot above —',
          w * 0.5,
          h * 0.75
        );

        // Activity Cards (that are not yet placed)
        for (const card of state.cards) {
          if (!card.isPlaced) {
            drawActivityCard(ctx, card, isHindi);
          }
        }
      } else {
        // Earlier vs Later Quiz Challenge Mode
        const curQuiz = TIME_QUIZZES[state.quizQuestionIdx] ?? TIME_QUIZZES[0]!;

        // Question Banner Card
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#0284C7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(w * 0.1, h * 0.44, w * 0.8, 90, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 18px "Quicksand", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isHindi ? curQuiz.questionHi : curQuiz.questionEn, w * 0.5, h * 0.49);

        // Choice Cards: Option A & Option B
        const actA = CHINTU_ACTIVITIES[curQuiz.optionA];
        const actB = CHINTU_ACTIVITIES[curQuiz.optionB];

        const drawQuizOption = (act: DailyActivityDef, btnX: number, btnY: number, optKey: TimeActivityId) => {
          const isSelected = state.selectedQuizAnswer === optKey;
          const isCorrect = optKey === curQuiz.correctOption;

          ctx.fillStyle = isSelected ? (isCorrect ? '#10B981' : '#EF4444') : '#FFFFFF';
          ctx.strokeStyle = isSelected ? '#0F172A' : act.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(btnX - 100, btnY - 45, 200, 90, 18);
          ctx.fill();
          ctx.stroke();

          ctx.font = '36px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(act.icon, btnX - 55, btnY);

          ctx.textAlign = 'left';
          ctx.fillStyle = isSelected ? '#FFFFFF' : act.color;
          ctx.font = 'bold 14px "Quicksand", system-ui, sans-serif';
          ctx.fillText(isHindi ? act.partOfDayHi : act.partOfDayEn, btnX - 20, btnY - 12);

          ctx.fillStyle = isSelected ? '#FFFFFF' : '#0F172A';
          ctx.font = 'bold 12px "Quicksand", system-ui, sans-serif';
          ctx.fillText(isHindi ? act.titleHi : act.titleEn, btnX - 20, btnY + 12);
        };

        drawQuizOption(actA, w * 0.32, h * 0.76, curQuiz.optionA);
        drawQuizOption(actB, w * 0.68, h * 0.76, curQuiz.optionB);

        // Next Question Button
        if (state.selectedQuizAnswer === curQuiz.correctOption) {
          ctx.fillStyle = '#8B5CF6';
          ctx.beginPath();
          ctx.roundRect(w * 0.42, h * 0.6, 130, 42, 14);
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 13px "Quicksand", system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(isHindi ? 'अगला सवाल ➔' : 'Next Question ➔', w * 0.42 + 65, h * 0.6 + 21);
        }
      }

      // 3. Instruction Header Banner
      const promptToDisplay = isHindi ? state.promptHindiText : state.promptText;
      const subPrompt = isHindi ? state.promptText : state.promptHindiText;

      const { speakerBounds } = drawInstructionBanner(ctx, w, promptToDisplay, {
        y: 44,
        speakerActive: state.isSpeakerActive,
        step: `Time: ${state.currentSkyPhase.toUpperCase()}`,
        subPrompt,
      });
      state.speakerBounds = speakerBounds;

      // 4. Celebration Overlay
      if (state.particles.length > 0) {
        for (const p of state.particles) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      }

      if (state.isCelebrating) {
        drawCelebrationOverlay(
          ctx,
          w,
          h,
          state.celebrationMessage,
          state.starsEarned,
          state.particles
        );
      }
    },

    /* ── Touch & Pointer Handlers ── */

    onPointerDown: (x, y, state: TimeChintuState, params) => {
      if (!state) return;

      // 1. Speaker tap
      if (
        state.speakerBounds &&
        FoundationalTouchHelper.hitTestRect(x, y, state.speakerBounds, 12)
      ) {
        FoundationalAudio.playPop();
        state.isSpeakerActive = true;
        const textToSpeak = params.lang === 'hi-IN' ? state.promptHindiText : state.promptText;
        FoundationalNarrator.speak(textToSpeak, { lang: params.lang || 'en-IN' });
        setTimeout(() => {
          state.isSpeakerActive = false;
        }, 2500);
        return;
      }

      // 2. Dismiss celebration
      if (state.isCelebrating) {
        state.isCelebrating = false;
        state.particles = [];
        FoundationalAudio.playPop();
        return;
      }

      // 3. Timeline Sequence Mode Handlers
      if (state.mode === 'timeline-sequence') {
        // Check activity card pickup or tap
        for (const card of state.cards) {
          if (
            !card.isPlaced &&
            FoundationalTouchHelper.hitTestRect(
              x,
              y,
              { x: card.x, y: card.y, width: card.width, height: card.height },
              14
            )
          ) {
            card.isDragging = true;
            state.activeDragId = card.id;
            state.dragOffsetX = card.x - x;
            state.dragOffsetY = card.y - y;
            FoundationalAudio.playPop();

            // Direct tap-to-place support: Find first empty slot
            const emptySlot = state.slots.find((s) => s.placedActivityId === null);
            if (emptySlot) {
              const actDef = CHINTU_ACTIVITIES[card.id];
              // Check if card matches slot order (Morning = 1, Afternoon = 2, Evening = 3, Night = 4)
              if (actDef.order === emptySlot.slotOrder) {
                // Correct sequential placement!
                emptySlot.placedActivityId = card.id;
                card.isPlaced = true;
                card.isDragging = false;
                state.activeDragId = null;

                FoundationalAudio.playSuccessChime();
                const partSay =
                  params.lang === 'hi-IN'
                    ? `शाबाश! ${actDef.partOfDayHi} का समय: ${actDef.titleHi}!`
                    : `Great! ${actDef.partOfDayEn} time: ${actDef.titleEn}!`;
                FoundationalNarrator.speak(partSay, { lang: params.lang || 'en-IN' });

                // Check if full day timeline complete!
                const placedAll = state.slots.every((s) => s.placedActivityId !== null);
                if (placedAll) {
                  FoundationalAudio.playCelebrationFanfare();
                  state.particles = createConfettiBurst(800, 500, 50);
                  state.isCelebrating = true;
                  state.celebrationMessage = 'A Full Day Completed! Morning to Night! 🌅 🌙 ⭐';
                  state.starsEarned = 3;
                }
              } else {
                // Out of order attempt
                card.isDragging = false;
                state.activeDragId = null;
                FoundationalAudio.playGentleRetry();

                const wrongSay =
                  params.lang === 'hi-IN'
                    ? `पहले ${emptySlot.partOfDayHi} में क्या होता है, उसे चुनें!`
                    : `Look for what Chintu does in the ${emptySlot.partOfDayEn} first!`;
                FoundationalNarrator.speak(wrongSay, { lang: params.lang || 'en-IN' });
              }
            }
            break;
          }
        }
      } else {
        // Earlier vs Later Quiz Challenge
        const curQuiz = TIME_QUIZZES[state.quizQuestionIdx] ?? TIME_QUIZZES[0]!;

        // Check Next Button (x: w*0.42..w*0.42+130, y: h*0.6..h*0.6+42)
        if (
          state.selectedQuizAnswer === curQuiz.correctOption &&
          x >= 800 * 0.42 &&
          x <= 800 * 0.42 + 130 &&
          y >= 500 * 0.6 &&
          y <= 500 * 0.6 + 42
        ) {
          FoundationalAudio.playPop();
          state.quizQuestionIdx = (state.quizQuestionIdx + 1) % TIME_QUIZZES.length;
          state.selectedQuizAnswer = null;
          state.isQuizCorrect = null;
          const nextQuiz = TIME_QUIZZES[state.quizQuestionIdx] ?? TIME_QUIZZES[0]!;
          FoundationalNarrator.speak(
            params.lang === 'hi-IN' ? nextQuiz.questionHi : nextQuiz.questionEn,
            { lang: params.lang || 'en-IN' }
          );
          return;
        }

        // Choice Option A
        const btnAX = 800 * 0.32;
        const btnY = 500 * 0.76;
        if (Math.abs(x - btnAX) < 100 && Math.abs(y - btnY) < 45) {
          state.selectedQuizAnswer = curQuiz.optionA;
          if (curQuiz.optionA === curQuiz.correctOption) {
            state.isQuizCorrect = true;
            FoundationalAudio.playCelebrationFanfare();
            state.particles = createConfettiBurst(800, 500, 45);
            FoundationalNarrator.speak(
              params.lang === 'hi-IN' ? curQuiz.explanationHi : curQuiz.explanationEn,
              { lang: params.lang || 'en-IN' }
            );
          } else {
            state.isQuizCorrect = false;
            FoundationalAudio.playGentleRetry();
            const retrySay =
              params.lang === 'hi-IN'
                ? 'सोचिए, दिन में कौन सा काम पहले होता है?'
                : 'Think carefully about what happens earlier in the day!';
            FoundationalNarrator.speak(retrySay, { lang: params.lang || 'en-IN' });
          }
        }

        // Choice Option B
        const btnBX = 800 * 0.68;
        if (Math.abs(x - btnBX) < 100 && Math.abs(y - btnY) < 45) {
          state.selectedQuizAnswer = curQuiz.optionB;
          if (curQuiz.optionB === curQuiz.correctOption) {
            state.isQuizCorrect = true;
            FoundationalAudio.playCelebrationFanfare();
            state.particles = createConfettiBurst(800, 500, 45);
            FoundationalNarrator.speak(
              params.lang === 'hi-IN' ? curQuiz.explanationHi : curQuiz.explanationEn,
              { lang: params.lang || 'en-IN' }
            );
          } else {
            state.isQuizCorrect = false;
            FoundationalAudio.playGentleRetry();
            const retrySay =
              params.lang === 'hi-IN'
                ? 'सोचिए, दिन में कौन सा काम पहले होता है?'
                : 'Think carefully about what happens earlier in the day!';
            FoundationalNarrator.speak(retrySay, { lang: params.lang || 'en-IN' });
          }
        }
      }
    },

    onPointerMove: (x, y, state: TimeChintuState, _params) => {
      if (!state || !state.activeDragId) return;

      const card = state.cards.find((c) => c.id === state.activeDragId);
      if (!card) return;

      card.x = x + state.dragOffsetX;
      card.y = y + state.dragOffsetY;
    },

    onPointerUp: (state: TimeChintuState, params) => {
      if (!state || !state.activeDragId) return;

      const card = state.cards.find((c) => c.id === state.activeDragId);
      if (!card) return;

      card.isDragging = false;
      state.activeDragId = null;

      // Drop check onto timeline slots
      const cardCenterX = card.x + card.width / 2;
      const cardCenterY = card.y + card.height / 2;

      for (const slot of state.slots) {
        const slotCenterX = slot.x + slot.width / 2;
        const slotCenterY = slot.y + slot.height / 2;

        if (
          FoundationalTouchHelper.distance(cardCenterX, cardCenterY, slotCenterX, slotCenterY) < 70
        ) {
          const actDef = CHINTU_ACTIVITIES[card.id];
          if (actDef.order === slot.slotOrder) {
            slot.placedActivityId = card.id;
            card.isPlaced = true;
            FoundationalAudio.playSuccessChime();

            const placedAll = state.slots.every((s) => s.placedActivityId !== null);
            if (placedAll) {
              FoundationalAudio.playCelebrationFanfare();
              state.particles = createConfettiBurst(800, 500, 50);
              state.isCelebrating = true;
              state.celebrationMessage = 'A Full Day Completed! Morning to Night! 🌅 🌙 ⭐';
              state.starsEarned = 3;
            }
            return;
          } else {
            FoundationalAudio.playGentleRetry();
            card.x = card.baseX;
            card.y = card.baseY;
            const retrySay =
              params.lang === 'hi-IN'
                ? `यह कार्ड ${slot.partOfDayHi} का नहीं है!`
                : `This card doesn't belong to ${slot.partOfDayEn}!`;
            FoundationalNarrator.speak(retrySay, { lang: params.lang || 'en-IN' });
            return;
          }
        }
      }

      // Return to tray
      card.x = card.baseX;
      card.y = card.baseY;
      FoundationalAudio.playPop();
    },
  },
});

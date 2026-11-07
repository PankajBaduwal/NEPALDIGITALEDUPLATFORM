/**
 * PIYUSHDHARA EDUVERSE — FOUNDATIONAL STAGE (CLASS 1) SIMULATION 6
 *
 * Title: The Rhythmic Pattern Train! (Repeating Sequences & Shapes)
 * Alignment: NCERT Class 1 Joyful Mathematics Chapter 10 (Patterns / पैटर्न)
 * Archetype: PATTERN_TRAIN & RHYTHMIC_SEQUENCE_BUILDER
 *
 * Concrete-Pictorial-Abstract (CPA) Pipeline:
 * 1. Concrete & Rhythmic:
 *    - A colorful steam locomotive chugging along wooden tracks with connected carriages.
 *    - Multi-sensory auditory patterns: each pattern symbol corresponds to a distinct musical chime.
 * 2. Visual & Structural:
 *    - Standard Class 1 repeating structures: AB-AB, AABB-AABB, ABC-ABC, and Geometric Shape Sequences.
 * 3. Interactive Mechanics:
 *    - Empty carriage slot with a magnetic snap target and glowing question card.
 *    - Candidate token tray with large touch targets (>= 64px) and forgiving hit slop.
 *    - Chugging train celebration with animated steam puffs, spinning wheels, and celebratory fanfare.
 * 4. Linguistic Scaffolding:
 *    - Bilingual narration in Indian English (en-IN) and Hindi (hi-IN).
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

/* ── Pattern Item Definitions & Interfaces ── */

export type PatternRuleType = 'abab' | 'aabb' | 'abc' | 'fruits';

export interface PatternItemDef {
  id: string;
  nameEn: string;
  nameHi: string;
  symbol: string;
  color: string;
  pitch: number; // Hz for auditory rhythm
}

export const PATTERN_ITEMS: Record<string, PatternItemDef> = {
  redCircle: { id: 'redCircle', nameEn: 'Red Circle', nameHi: 'लाल वृत्त', symbol: '🔴', color: '#EF4444', pitch: 523.25 }, // C5
  yellowTriangle: { id: 'yellowTriangle', nameEn: 'Yellow Triangle', nameHi: 'पीला त्रिभुज', symbol: '🔺', color: '#F59E0B', pitch: 659.25 }, // E5
  blueSquare: { id: 'blueSquare', nameEn: 'Blue Square', nameHi: 'नीला वर्ग', symbol: '🟦', color: '#3B82F6', pitch: 783.99 }, // G5
  greenStar: { id: 'greenStar', nameEn: 'Green Star', nameHi: 'हरा तारा', symbol: '⭐', color: '#10B981', pitch: 1046.5 }, // C6
  apple: { id: 'apple', nameEn: 'Apple', nameHi: 'सेब', symbol: '🍎', color: '#E11D48', pitch: 523.25 },
  banana: { id: 'banana', nameEn: 'Banana', nameHi: 'केला', symbol: '🍌', color: '#FBBF24', pitch: 659.25 },
  mango: { id: 'mango', nameEn: 'Mango', nameHi: 'आम', symbol: '🥭', color: '#F97316', pitch: 783.99 },
  grapes: { id: 'grapes', nameEn: 'Grapes', nameHi: 'अंगूर', symbol: '🍇', color: '#8B5CF6', pitch: 1046.5 },
};

export interface TrainCarriage {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  itemKey: string | null; // null if this is the missing target slot
  isMissingSlot: boolean;
  isFilled: boolean;
  placedItemKey: string | null;
}

export interface CandidateToken {
  id: string;
  itemKey: string;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  isDragging: boolean;
}

export interface SmokePuff {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  vx: number;
  vy: number;
}

export interface PatternTrainState {
  rule: PatternRuleType;
  sequenceKeys: string[];
  missingSlotIndex: number; // Carriage index where the user must place the item
  correctItemKey: string;

  carriages: TrainCarriage[];
  candidates: CandidateToken[];
  activeDragId: string | null;
  dragOffsetX: number;
  dragOffsetY: number;

  trainOffsetX: number;
  trainSpeed: number;
  wheelAngle: number;
  smokePuffs: SmokePuff[];

  isPlayingRhythm: boolean;
  rhythmStep: number;
  rhythmTimer: number;

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

/* ── Rule Sequence Factory ── */

function buildPatternSequence(rule: PatternRuleType): { sequence: string[]; missingIdx: number; correctKey: string } {
  if (rule === 'abab') {
    // AB AB AB -> missing carriage is at index 5 (6th carriage)
    const seq = ['redCircle', 'yellowTriangle', 'redCircle', 'yellowTriangle', 'redCircle'];
    return { sequence: [...seq, ''], missingIdx: 5, correctKey: 'yellowTriangle' };
  } else if (rule === 'aabb') {
    // AABB AABB -> 🔺 🔺 🟦 🟦 🔺 [ ? ]
    const seq = ['yellowTriangle', 'yellowTriangle', 'blueSquare', 'blueSquare', 'yellowTriangle'];
    return { sequence: [...seq, ''], missingIdx: 5, correctKey: 'yellowTriangle' };
  } else if (rule === 'abc') {
    // ABC ABC -> 🔴 🔺 🟦 🔴 🔺 [ ? ]
    const seq = ['redCircle', 'yellowTriangle', 'blueSquare', 'redCircle', 'yellowTriangle'];
    return { sequence: [...seq, ''], missingIdx: 5, correctKey: 'blueSquare' };
  } else {
    // Fruits: Apple, Banana, Mango, Apple, Banana, [ ? ]
    const seq = ['apple', 'banana', 'mango', 'apple', 'banana'];
    return { sequence: [...seq, ''], missingIdx: 5, correctKey: 'mango' };
  }
}

function createTrainCarriages(sequence: string[], missingIdx: number, w: number, h: number): TrainCarriage[] {
  const carriages: TrainCarriage[] = [];
  const startX = w * 0.22;
  const carriageW = 82;
  const carriageH = 70;
  const spacing = carriageW + 16;
  const trackY = h * 0.44;

  for (let i = 0; i < sequence.length; i++) {
    const isMissing = i === missingIdx;
    const cx = startX + i * spacing;
    carriages.push({
      index: i,
      x: cx,
      y: trackY,
      width: carriageW,
      height: carriageH,
      itemKey: isMissing ? null : (sequence[i] ?? null),
      isMissingSlot: isMissing,
      isFilled: false,
      placedItemKey: null,
    });
  }

  return carriages;
}

function createCandidates(rule: PatternRuleType, w: number, h: number): CandidateToken[] {
  let keys: string[] = [];
  if (rule === 'abab') {
    keys = ['redCircle', 'yellowTriangle', 'blueSquare', 'greenStar'];
  } else if (rule === 'aabb') {
    keys = ['yellowTriangle', 'blueSquare', 'greenStar', 'redCircle'];
  } else if (rule === 'abc') {
    keys = ['redCircle', 'yellowTriangle', 'blueSquare', 'greenStar'];
  } else {
    keys = ['apple', 'banana', 'mango', 'grapes'];
  }

  const trayY = h * 0.82;
  const spacing = w / (keys.length + 1);

  return keys.map((key, idx) => {
    const posX = spacing * (idx + 1);
    return {
      id: `token-${key}-${idx}`,
      itemKey: key,
      x: posX,
      y: trayY,
      baseX: posX,
      baseY: trayY,
      size: 68,
      isDragging: false,
    };
  });
}

/* ── Canvas Rendering Procedures ── */

function drawRailwayScene(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // Vibrant morning sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#E0F2FE');
  skyGrad.addColorStop(0.4, '#BAE6FD');
  skyGrad.addColorStop(1, '#DCFCE7');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Soft distant mountains
  ctx.fillStyle = '#A7F3D0';
  ctx.beginPath();
  ctx.arc(w * 0.18, h * 0.6, 220, Math.PI, 0, false);
  ctx.fill();

  ctx.fillStyle = '#6EE7B7';
  ctx.beginPath();
  ctx.arc(w * 0.68, h * 0.65, 250, Math.PI, 0, false);
  ctx.fill();

  // Grassy plain
  ctx.fillStyle = '#22C55E';
  ctx.fillRect(0, h * 0.52, w, h * 0.48);

  // Railway Gravel Bed (Ballast)
  const trackY = h * 0.54;
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(0, trackY - 6, w, 28);

  // Wooden Sleepers
  ctx.fillStyle = '#78350F';
  for (let sx = 0; sx < w; sx += 32) {
    ctx.fillRect(sx, trackY - 8, 14, 32);
  }

  // Steel Rails
  ctx.fillStyle = '#E2E8F0';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.fillRect(0, trackY - 2, w, 6);
  ctx.strokeRect(0, trackY - 2, w, 6);
  ctx.fillRect(0, trackY + 14, w, 6);
  ctx.strokeRect(0, trackY + 14, w, 6);
}

function drawSteamLocomotive(
  ctx: CanvasRenderingContext2D,
  lx: number,
  ly: number,
  wheelAngle: number,
  _tick: number
): void {
  ctx.save();
  ctx.translate(lx, ly);

  // Locomotive Main Cab (Cherry Red with brass rim)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = '#7F1D1D';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(0, -60, 95, 60, 12);
  ctx.fill();
  ctx.stroke();

  // Boiler cylinder
  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.roundRect(-60, -45, 65, 45, [12, 0, 0, 12]);
  ctx.fill();
  ctx.stroke();

  // Chimney (Smokestack)
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.moveTo(-45, -45);
  ctx.lineTo(-52, -75);
  ctx.lineTo(-30, -75);
  ctx.lineTo(-37, -45);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Brass Bell
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(-15, -55, 7, 0, Math.PI * 2);
  ctx.fill();

  // Cab Window
  ctx.fillStyle = '#BAE6FD';
  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(25, -50, 45, 30, 8);
  ctx.fill();
  ctx.stroke();

  // Cheerful Driver Kitty/Bear icon in window
  ctx.font = '22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🐱', 48, -35);

  // Big Locomotive Headlight
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(-62, -22, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.arc(-62, -22, 6, 0, Math.PI * 2);
  ctx.fill();

  // Wheels (Front small, Rear big)
  const drawWheel = (wx: number, wy: number, r: number) => {
    ctx.save();
    ctx.translate(wx, wy);
    ctx.rotate(wheelAngle);

    // Rim
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Inner hub
    ctx.fillStyle = '#94A3B8';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Spokes
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    for (let sp = 0; sp < 4; sp++) {
      ctx.beginPath();
      ctx.moveTo(-r, 0);
      ctx.lineTo(r, 0);
      ctx.stroke();
      ctx.rotate(Math.PI / 4);
    }

    ctx.restore();
  };

  drawWheel(-40, 6, 16);
  drawWheel(-8, 6, 16);
  drawWheel(30, 10, 20);
  drawWheel(72, 10, 20);

  ctx.restore();
}

function drawCarriage(
  ctx: CanvasRenderingContext2D,
  car: TrainCarriage,
  wheelAngle: number,
  tick: number,
  isHighlighted: boolean
): void {
  ctx.save();
  ctx.translate(car.x, car.y);

  // Carriage Box
  const isMissingAndEmpty = car.isMissingSlot && !car.isFilled;
  const boxBg = isMissingAndEmpty ? '#FEF3C7' : '#FFFFFF';
  const boxBorder = isMissingAndEmpty
    ? isHighlighted
      ? '#10B981'
      : '#F59E0B'
    : '#0284C7';

  // Connecting Coupler to left
  ctx.fillStyle = '#475569';
  ctx.fillRect(-18, car.height * 0.65, 18, 8);

  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.beginPath();
  ctx.roundRect(2, 4, car.width, car.height, 14);
  ctx.fill();

  // Carriage Body
  ctx.fillStyle = boxBg;
  ctx.strokeStyle = boxBorder;
  ctx.lineWidth = isMissingAndEmpty ? 3.5 : 3;

  if (isMissingAndEmpty) {
    ctx.setLineDash([6, 5]);
  }
  ctx.beginPath();
  ctx.roundRect(0, 0, car.width, car.height, 14);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);

  // Carriage Roof Cap
  ctx.fillStyle = isMissingAndEmpty ? '#FDE68A' : '#0369A1';
  ctx.beginPath();
  ctx.roundRect(-2, -6, car.width + 4, 10, 6);
  ctx.fill();

  // Pattern item or Question slot inside carriage
  const activeKey = car.isMissingSlot
    ? car.placedItemKey
    : car.itemKey;

  if (activeKey) {
    const itemDef = PATTERN_ITEMS[activeKey];
    if (itemDef) {
      ctx.font = '36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(itemDef.symbol, car.width / 2, car.height * 0.46);

      // Name label
      ctx.font = 'bold 11px "Quicksand", system-ui, sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(itemDef.nameEn, car.width / 2, car.height * 0.82);
    }
  } else {
    // Missing question mark slot with gentle pulsing animation
    const pulseScale = 1 + Math.sin(tick * 0.1) * 0.08;
    ctx.save();
    ctx.translate(car.width / 2, car.height * 0.44);
    ctx.scale(pulseScale, pulseScale);

    ctx.fillStyle = '#D97706';
    ctx.font = 'bold 36px "Quicksand", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, 0);
    ctx.restore();

    ctx.font = 'bold 11px "Quicksand", system-ui, sans-serif';
    ctx.fillStyle = '#B45309';
    ctx.textAlign = 'center';
    ctx.fillText('Place Here!', car.width / 2, car.height * 0.82);
  }

  // Wheels
  const drawSmallWheel = (wx: number) => {
    ctx.save();
    ctx.translate(wx, car.height + 6);
    ctx.rotate(wheelAngle);

    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#CBD5E1';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  drawSmallWheel(18);
  drawSmallWheel(car.width - 18);

  ctx.restore();
}

function drawCandidateToken(ctx: CanvasRenderingContext2D, token: CandidateToken): void {
  const itemDef = PATTERN_ITEMS[token.itemKey];
  if (!itemDef) return;

  ctx.save();
  ctx.translate(token.x, token.y);

  const half = token.size / 2;

  // Drop shadow
  ctx.shadowColor = token.isDragging ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = token.isDragging ? 16 : 8;
  ctx.shadowOffsetY = token.isDragging ? 8 : 4;

  // Tactile button card
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = token.isDragging ? '#6366F1' : '#CBD5E1';
  ctx.lineWidth = token.isDragging ? 3.5 : 2.5;
  ctx.beginPath();
  ctx.roundRect(-half, -half, token.size, token.size, 18);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';

  // Emoji Symbol
  ctx.font = '32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(itemDef.symbol, 0, -6);

  // Label
  ctx.font = 'bold 10px "Quicksand", system-ui, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText(itemDef.nameEn, 0, half - 12);

  ctx.restore();
}

/* ═══════════════════════════════════════════════════════════════
   SIMULATION ENGINE DEFINITION
   ═══════════════════════════════════════════════════════════════ */

export const patternTrainSimulation: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class1-pattern-train',
  title: 'The Rhythmic Pattern Train! (Repeating Sequences & Shapes)',
  band: 'GRADES_1_8',
  level: 'class-1',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '🚂',
  topic: 'Patterns: Repeating Sequences & Shapes',
  shortDescription:
    'Complete the missing pattern carriages on the steam train! Hear the rhythmic chimes, discover ABAB, AABB, and ABC sequences, and watch the train chug happily!',
  detailedDescription:
    'Aligned with NCERT Class 1 Mathematics Chapter 10 ("Patterns"). Children identify the core repeating units of patterns through colors, shapes, fruits, and musical tones. Touch-friendly tokens can be dragged or tapped to complete the sequence.',
  learningObjectives: [
    'Identify and extend repeating patterns in colors, shapes, and familiar objects (ABAB, AABB, ABC)',
    'Develop auditory pattern recognition by matching visual sequences to musical chime rhythms',
    'Understand the concept of the core repeating unit in foundational mathematics',
    'Strengthen spatial reasoning and logical sequencing through hands-on train carriages',
  ],
  parameters: [
    P.select('rule', 'Pattern Rule', [
      ['abab', '1. AB-AB Sequence (लाल और पीला)'],
      ['aabb', '2. AABB-AABB Paired Sequence (दोहरा पैटर्न)'],
      ['abc', '3. ABC-ABC Trio Sequence (तीन आकृतियाँ)'],
      ['fruits', '4. Delicious Fruit Pattern (फलों का पैटर्न)'],
    ]),
    P.select('lang', 'Audio Language', [
      ['en-IN', 'English (Indian accent)'],
      ['hi-IN', 'Hindi (हिंदी)'],
    ]),
    P.toggle('voicePrompt', 'Auto Voiceover', true),
  ],
  metrics: [
    metric('pattern', 'Pattern Rule', (s) => (s as any).ruleLabel ?? 'AB-AB'),
    metric('progress', 'Train Status', (s) => ((s as any).isCompleted ? 'All Carriages Full! 🚂' : 'Carriage Missing ❓')),
    metric('core', 'Repeating Unit', (s) => (s as any).coreLabel ?? 'Core Unit'),
    metric('stars', 'Stars Earned', (s) => '⭐'.repeat(Math.max(1, (s as any).starsEarned ?? 1))),
  ],
  tags: [
    'patterns',
    'repeating sequences',
    'abab',
    'aabb',
    'abc',
    'shapes',
    'train',
    'musical chimes',
    'class 1',
    'ncert',
  ],

  engine: {
    createInitialState: (params, width, height): PatternTrainState => {
      const rule = (params.rule as PatternRuleType) || 'abab';
      const w = width || 800;
      const h = height || 500;

      const { sequence, missingIdx, correctKey } = buildPatternSequence(rule);
      const carriages = createTrainCarriages(sequence, missingIdx, w, h);
      const candidates = createCandidates(rule, w, h);

      const state: PatternTrainState = {
        rule,
        sequenceKeys: sequence,
        missingSlotIndex: missingIdx,
        correctItemKey: correctKey,

        carriages,
        candidates,
        activeDragId: null,
        dragOffsetX: 0,
        dragOffsetY: 0,

        trainOffsetX: 0,
        trainSpeed: 0,
        wheelAngle: 0,
        smokePuffs: [],

        isPlayingRhythm: false,
        rhythmStep: 0,
        rhythmTimer: 0,

        isCelebrating: false,
        celebrationMessage: 'Chugga Chugga Choo Choo! Pattern Solved! ⭐',
        starsEarned: 1,
        particles: [],

        promptText: 'Look at the pattern on the train carriages! What comes next in the missing carriage?',
        promptHindiText: 'रेलगाड़ी के डिब्बों का पैटर्न देखिए! खाली डिब्बे में क्या आएगा?',
        speakerBounds: null,
        isSpeakerActive: false,

        time: 0,
        tickCount: 0,
      };

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
      return (patternTrainSimulation.engine as any).createInitialState(params, width, height);
    },

    update: (state: PatternTrainState, _params, dt, _width, _height) => {
      state.time += dt;
      state.tickCount++;

      // Train motion if celebrating
      if (state.trainSpeed > 0) {
        state.trainOffsetX += state.trainSpeed * dt * 60;
        state.wheelAngle += state.trainSpeed * dt * 0.15;

        // Periodic smoke puffs
        if (state.tickCount % 12 === 0) {
          state.smokePuffs.push({
            x: 800 * 0.12 + state.trainOffsetX - 42,
            y: 500 * 0.44 - 75,
            radius: 8 + Math.random() * 4,
            alpha: 0.8,
            vx: -1.2 + Math.random() * 0.4,
            vy: -1.5 - Math.random() * 0.8,
          });
        }
      }

      // Update smoke puffs
      for (const puff of state.smokePuffs) {
        puff.x += puff.vx * dt * 60;
        puff.y += puff.vy * dt * 60;
        puff.radius += dt * 14;
        puff.alpha -= dt * 0.5;
      }
      state.smokePuffs = state.smokePuffs.filter((p) => p.alpha > 0);

      // Particles
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

      // Update metrics
      (state as any).ruleLabel =
        state.rule === 'abab'
          ? 'AB-AB (Alternating)'
          : state.rule === 'aabb'
          ? 'AABB (Paired)'
          : state.rule === 'abc'
          ? 'ABC-ABC (Trio)'
          : 'Fruit Repeat';
      (state as any).isCompleted = state.carriages[state.missingSlotIndex]?.isFilled ?? false;
      (state as any).coreLabel =
        state.rule === 'abab'
          ? '🔴 🔺'
          : state.rule === 'aabb'
          ? '🔺 🔺 🟦 🟦'
          : state.rule === 'abc'
          ? '🔴 🔺 🟦'
          : '🍎 🍌 🥭';

      return state;
    },

    render: (ctx, width, height, state: PatternTrainState, params) => {
      const w = width;
      const h = height;

      // 1. Scene Background & Railway
      drawRailwayScene(ctx, w, h);

      // Smoke puffs from locomotive
      for (const puff of state.smokePuffs) {
        ctx.fillStyle = `rgba(226, 232, 240, ${Math.max(0, puff.alpha)})`;
        ctx.beginPath();
        ctx.arc(puff.x, puff.y, puff.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Locomotive Engine at front (shifted with trainOffsetX)
      const locoX = w * 0.12 + state.trainOffsetX;
      const locoY = h * 0.44;
      drawSteamLocomotive(ctx, locoX, locoY, state.wheelAngle, state.tickCount);

      // 3. Train Carriages behind engine
      const isMissingHovered = state.activeDragId !== null;

      for (const car of state.carriages) {
        const shiftedCar = {
          ...car,
          x: car.x + state.trainOffsetX,
        };
        drawCarriage(
          ctx,
          shiftedCar,
          state.wheelAngle,
          state.tickCount,
          car.isMissingSlot && isMissingHovered
        );
      }

      // 4. Play Rhythm Button & Hint Banner
      ctx.fillStyle = '#FEF3C7';
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(w * 0.05, h * 0.64, 210, 44, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 13px "Quicksand", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎵 Hear Pattern Rhythm', w * 0.05 + 105, h * 0.64 + 22);

      // Candidate Dock Tray at bottom
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(w * 0.08, h * 0.74, w * 0.84, h * 0.22, 20);
      ctx.fill();
      ctx.stroke();

      // Candidate Tokens
      for (const tok of state.candidates) {
        drawCandidateToken(ctx, tok);
      }

      // 5. Instruction Banner at top
      const isHindi = params.lang === 'hi-IN';
      const promptToDisplay = isHindi ? state.promptHindiText : state.promptText;
      const subPrompt = isHindi ? state.promptText : state.promptHindiText;

      const { speakerBounds } = drawInstructionBanner(ctx, w, promptToDisplay, {
        y: 44,
        speakerActive: state.isSpeakerActive,
        step: `Pattern: ${state.rule.toUpperCase()}`,
        subPrompt,
      });
      state.speakerBounds = speakerBounds;

      // 6. Celebration Particles & Overlay
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

    onPointerDown: (x, y, state: PatternTrainState, params) => {
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

      // 3. Play Rhythm Button tap (x: 40..250, y: 320..364)
      if (x >= 40 && x <= 250 && y >= 500 * 0.64 && y <= 500 * 0.64 + 44) {
        FoundationalAudio.playPop();

        // Play sequence notes in timed rhythm
        state.carriages.forEach((car, idx) => {
          const key = car.isMissingSlot ? car.placedItemKey || state.correctItemKey : car.itemKey;
          if (key) {
            const def = PATTERN_ITEMS[key];
            if (def) {
              setTimeout(() => {
                FoundationalAudio.playCountTick(idx + 1);
              }, idx * 350);
            }
          }
        });

        const rhythmSay =
          params.lang === 'hi-IN'
            ? 'पैटर्न की धुन सुनिए! हर डिब्बे की अपनी आवाज़ है!'
            : 'Listen to the train rhythm! Hear the repeating beat!';
        FoundationalNarrator.speak(rhythmSay, { lang: params.lang || 'en-IN' });
        return;
      }

      // 4. Candidate Token pickup or tap
      for (const tok of state.candidates) {
        if (FoundationalTouchHelper.hitTestCircle(x, y, tok.x, tok.y, tok.size / 2, 14)) {
          tok.isDragging = true;
          state.activeDragId = tok.id;
          state.dragOffsetX = tok.x - x;
          state.dragOffsetY = tok.y - y;
          FoundationalAudio.playPop();

          // Direct tap-to-place support (zero fine-motor penalty for young learners)
          const targetCar = state.carriages[state.missingSlotIndex];
          if (targetCar && !targetCar.isFilled) {
            // Check if this tapped token is correct
            if (tok.itemKey === state.correctItemKey) {
              targetCar.isFilled = true;
              targetCar.placedItemKey = tok.itemKey;
              tok.isDragging = false;
              state.activeDragId = null;

              // Correct match!
              FoundationalAudio.playSuccessChime();
              FoundationalAudio.playCelebrationFanfare();
              state.starsEarned = 3;
              state.isCelebrating = true;
              state.celebrationMessage = 'Choo Choo! Pattern Solved! 🚂 ⭐';
              state.particles = createConfettiBurst(800, 500, 50);
              state.trainSpeed = 2.5; // Train starts chugging!

              const yay =
                params.lang === 'hi-IN'
                  ? 'शाबाश! आपने पैटर्न पूरा कर दिया! रेलगाड़ी चल पड़ी!'
                  : 'Fantastic! You completed the pattern! The train is on its way!';
              FoundationalNarrator.speak(yay, { lang: params.lang || 'en-IN' });
            } else {
              // Incorrect token
              tok.isDragging = false;
              state.activeDragId = null;
              FoundationalAudio.playGentleRetry();

              const retrySay =
                params.lang === 'hi-IN'
                  ? 'आइए पैटर्न फिर से देखें! इसके बाद क्या आएगा?'
                  : 'Look closely at the pattern! What piece comes next?';
              FoundationalNarrator.speak(retrySay, { lang: params.lang || 'en-IN' });
            }
          }
          break;
        }
      }
    },

    onPointerMove: (x, y, state: PatternTrainState, _params) => {
      if (!state || !state.activeDragId) return;

      const tok = state.candidates.find((t) => t.id === state.activeDragId);
      if (!tok) return;

      tok.x = x + state.dragOffsetX;
      tok.y = y + state.dragOffsetY;
    },

    onPointerUp: (state: PatternTrainState, params) => {
      if (!state || !state.activeDragId) return;

      const tok = state.candidates.find((t) => t.id === state.activeDragId);
      if (!tok) return;

      tok.isDragging = false;
      state.activeDragId = null;

      const targetCar = state.carriages[state.missingSlotIndex];
      if (targetCar) {
        const carCenterX = targetCar.x + targetCar.width / 2;
        const carCenterY = targetCar.y + targetCar.height / 2;

        // Check if dropped near missing carriage slot (snap distance 70px)
        if (FoundationalTouchHelper.distance(tok.x, tok.y, carCenterX, carCenterY) < 70) {
          if (tok.itemKey === state.correctItemKey) {
            targetCar.isFilled = true;
            targetCar.placedItemKey = tok.itemKey;
            tok.x = tok.baseX;
            tok.y = tok.baseY;

            FoundationalAudio.playSuccessChime();
            FoundationalAudio.playCelebrationFanfare();
            state.starsEarned = 3;
            state.isCelebrating = true;
            state.celebrationMessage = 'Choo Choo! Pattern Solved! 🚂 ⭐';
            state.particles = createConfettiBurst(800, 500, 50);
            state.trainSpeed = 2.5;

            const yay =
              params.lang === 'hi-IN'
                ? 'शाबाश! आपने सही डिब्बा जोड़ दिया!'
                : 'Great job! You snapped the right piece into place!';
            FoundationalNarrator.speak(yay, { lang: params.lang || 'en-IN' });
            return;
          } else {
            FoundationalAudio.playGentleRetry();
            tok.x = tok.baseX;
            tok.y = tok.baseY;

            const retrySay =
              params.lang === 'hi-IN'
                ? 'यह सही नहीं है, दूसरा प्रयास करें!'
                : 'Not quite! Try another pattern piece!';
            FoundationalNarrator.speak(retrySay, { lang: params.lang || 'en-IN' });
            return;
          }
        }
      }

      // Return to tray
      tok.x = tok.baseX;
      tok.y = tok.baseY;
      FoundationalAudio.playPop();
    },
  },
});

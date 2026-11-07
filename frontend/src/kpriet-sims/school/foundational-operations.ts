/**
 * PIYUSHDHARA EDUVERSE — FOUNDATIONAL STAGE (CLASS 1) SIMULATION 5
 *
 * Title: Addition and Subtraction Stories (Adding/Taking Away up to 9)
 * Alignment: NCERT Class 1 Joyful Mathematics Chapter 4 (Addition) & Chapter 5 (Subtraction)
 * Archetype: ADDITION_COMBINER & SUBTRACTION_HARVESTER & STORY_WORD_PROBLEM_EXPLORER
 *
 * Concrete-to-Abstract (CPA) Progression:
 * 1. Concrete / Pictorial:
 *    - Frogs hopping onto lily pads (Combining sets: 3 + 2 = 5).
 *    - Cheerful songbirds flying away from a tree branch (Taking away: 6 - 2 = 4).
 * 2. Visual Scaffolding:
 *    - Dual-color Ten-Frame showing addends or remaining quantities.
 * 3. Abstract Equation:
 *    - Live mathematical statement: [ A ] + [ B ] = [ C ] or [ A ] - [ B ] = [ C ].
 * 4. Linguistic Scaffolding:
 *    - Bilingual story narration in Indian English (en-IN) and Hindi (hi-IN).
 *    - High-contrast AAA child-friendly tokens, large touch targets (>= 48px).
 *    - Procedural Web Audio FX (whoosh, pop, count tick, chime, fanfare).
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
  drawTenFrame,
  type IParticle,
  type IBoundingBox,
} from './foundational-kit';

/* ── Modes and Interfaces ── */

export type OperationMode = 'addition-frogs' | 'subtraction-birds' | 'story-challenge';

export interface FrogItem {
  id: number;
  group: 'lilypad' | 'bank';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  isHopping: boolean;
  hopProgress: number; // 0 to 1
  hopStartX: number;
  hopStartY: number;
  blinkTimer: number;
}

export interface BirdItem {
  id: number;
  x: number;
  y: number;
  radius: number;
  isFlown: boolean;
  flySpeedX: number;
  flySpeedY: number;
  wingAngle: number;
  wingDir: number;
  perchX: number;
  perchY: number;
}

export interface StoryCard {
  id: string;
  type: 'addition' | 'subtraction';
  a: number;
  b: number;
  ans: number;
  itemName: string;
  itemEmoji: string;
  storyEn: string;
  storyHi: string;
  options: number[];
}

export interface FoundationalOperationsState {
  mode: OperationMode;

  // Addition Mode (Frogs on Pond)
  addendA: number; // Initially sitting on lily pad
  addendB: number; // Waiting on shore to hop
  frogs: FrogItem[];
  frogsHoppedCount: number;

  // Subtraction Mode (Birds on Branch)
  initialBirds: number;
  birds: BirdItem[];
  birdsFlownCount: number;

  // Story Challenge Mode
  currentStoryIdx: number;
  selectedOption: number | null;
  isChallengeCorrect: boolean | null;

  // Shared Animation & Audio State
  celebrationParticles: IParticle[];
  celebrationTimer: number;
  isCelebrating: boolean;
  celebrationMessage: string;
  starsEarned: number;

  promptText: string;
  promptHindiText: string;
  speakerBounds: IBoundingBox | null;
  isSpeakerActive: boolean;

  time: number;
  tickCount: number;
}

/* ── Curated Word Problem Stories ── */

const STORY_PROBLEMS: StoryCard[] = [
  {
    id: 's1',
    type: 'addition',
    a: 3,
    b: 2,
    ans: 5,
    itemName: 'apples',
    itemEmoji: '🍎',
    storyEn: 'Aarav has 3 red apples. Meera gives him 2 more apples. How many apples does Aarav have now?',
    storyHi: 'आरव के पास 3 लाल सेब हैं। मीरा ने उसे 2 और सेब दिए। अब आरव के पास कुल कितने सेब हैं?',
    options: [4, 5, 6],
  },
  {
    id: 's2',
    type: 'subtraction',
    a: 6,
    b: 2,
    ans: 4,
    itemName: 'balloons',
    itemEmoji: '🎈',
    storyEn: 'Riya was holding 6 colourful balloons. 2 balloons flew into the sky! How many balloons are left?',
    storyHi: 'रिया के पास 6 रंग-बिरंगे गुब्बारे थे। 2 गुब्बारे आसमान में उड़ गए! अब कितने गुब्बारे बचे?',
    options: [3, 4, 5],
  },
  {
    id: 's3',
    type: 'addition',
    a: 4,
    b: 3,
    ans: 7,
    itemName: 'flowers',
    itemEmoji: '🌸',
    storyEn: '4 pink flowers bloomed in the garden. In the morning, 3 more flowers opened! How many flowers are in bloom?',
    storyHi: 'बगीचे में 4 गुलाबी फूल खिले थे। सुबह 3 और फूल खिल गए! अब कुल कितने फूल हैं?',
    options: [6, 7, 8],
  },
  {
    id: 's4',
    type: 'subtraction',
    a: 8,
    b: 3,
    ans: 5,
    itemName: 'mangoes',
    itemEmoji: '🥭',
    storyEn: 'There were 8 ripe mangoes in a basket. Grandma took 3 mangoes to make aamras. How many mangoes are left?',
    storyHi: 'टोकरी में 8 पके आम थे। दादी ने आमरस बनाने के लिए 3 आम ले लिए। टोकरी में कितने आम बचे?',
    options: [4, 5, 6],
  },
];

/* ── Interactive Navigation Targets ── */

const TABS: { id: OperationMode; labelEn: string; labelHi: string; icon: string }[] = [
  { id: 'addition-frogs', labelEn: 'Frog Addition (जोड़)', labelHi: 'मेंढक का जोड़', icon: '🐸' },
  { id: 'subtraction-birds', labelEn: 'Bird Subtraction (घटाव)', labelHi: 'चिड़ियों का घटाव', icon: '🐦' },
  { id: 'story-challenge', labelEn: 'Math Stories (कहानियाँ)', labelHi: 'गणित की कहानियाँ', icon: '📖' },
];

/* ── Helper Factories ── */

function createFrogs(addendA: number, addendB: number, w: number, h: number): FrogItem[] {
  const frogs: FrogItem[] = [];
  const lilyPadCenterX = w * 0.48;
  const lilyPadCenterY = h * 0.62;

  // Addend A: Initially sitting on the large lily pad
  for (let i = 0; i < addendA; i++) {
    const angle = (i / Math.max(1, addendA)) * Math.PI * 2 + 0.3;
    const dist = 52 + (i % 2) * 18;
    const fx = lilyPadCenterX + Math.cos(angle) * dist;
    const fy = lilyPadCenterY + Math.sin(angle) * (dist * 0.7);
    frogs.push({
      id: i,
      group: 'lilypad',
      x: fx,
      y: fy,
      targetX: fx,
      targetY: fy,
      radius: 28,
      isHopping: false,
      hopProgress: 1,
      hopStartX: fx,
      hopStartY: fy,
      blinkTimer: Math.random() * 100,
    });
  }

  // Addend B: Waiting on the grassy bank at the right
  const bankStartX = w * 0.82;
  const bankStartY = h * 0.45;
  for (let j = 0; j < addendB; j++) {
    const bx = bankStartX + (j % 2) * 55;
    const by = bankStartY + Math.floor(j / 2) * 60;
    frogs.push({
      id: addendA + j,
      group: 'bank',
      x: bx,
      y: by,
      targetX: bx,
      targetY: by,
      radius: 28,
      isHopping: false,
      hopProgress: 0,
      hopStartX: bx,
      hopStartY: by,
      blinkTimer: Math.random() * 100,
    });
  }

  return frogs;
}

function createBirds(count: number, w: number, h: number): BirdItem[] {
  const birds: BirdItem[] = [];
  const branchStartX = w * 0.18;
  const branchEndX = w * 0.88;
  const branchY = h * 0.52;
  const spacing = (branchEndX - branchStartX) / Math.max(1, count);

  for (let i = 0; i < count; i++) {
    const px = branchStartX + spacing * (i + 0.5);
    const py = branchY - 22 + Math.sin(i * 0.8) * 8;
    birds.push({
      id: i,
      x: px,
      y: py,
      radius: 26,
      isFlown: false,
      flySpeedX: 3.5 + Math.random() * 3,
      flySpeedY: -(3.2 + Math.random() * 2),
      wingAngle: 0,
      wingDir: 1,
      perchX: px,
      perchY: py,
    });
  }

  return birds;
}

/* ── Canvas Drawing Procedures ── */

function drawPondScene(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Morning sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#E0F2FE');
  skyGrad.addColorStop(0.4, '#BAE6FD');
  skyGrad.addColorStop(1, '#DCFCE7');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Rolling green hills
  ctx.fillStyle = '#86EFAC';
  ctx.beginPath();
  ctx.arc(width * 0.22, height * 0.72, 240, Math.PI, 0, false);
  ctx.fill();

  ctx.fillStyle = '#4ADE80';
  ctx.beginPath();
  ctx.arc(width * 0.78, height * 0.76, 260, Math.PI, 0, false);
  ctx.fill();

  // Gentle pond water
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.ellipse(width * 0.46, height * 0.65, width * 0.32, height * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0284C7';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(width * 0.46, height * 0.65, width * 0.32, height * 0.26, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Water ripples
  ctx.strokeStyle = '#BAE6FD';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(width * 0.38, height * 0.62, 80, 26, -0.1, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(width * 0.54, height * 0.69, 70, 20, 0.1, 0, Math.PI);
  ctx.stroke();

  // Grassy shore on right for waiting frogs
  ctx.fillStyle = '#16A34A';
  ctx.beginPath();
  ctx.moveTo(width * 0.72, height * 0.32);
  ctx.bezierCurveTo(width * 0.78, height * 0.48, width * 0.8, height * 0.68, width, height * 0.8);
  ctx.lineTo(width, height * 0.32);
  ctx.closePath();
  ctx.fill();

  // Grassy shore badge
  ctx.fillStyle = '#FEF08A';
  ctx.font = 'bold 13px "Quicksand", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Grassy Shore (किनारा)', width * 0.87, height * 0.38);

  // Large Mother Lily Pad
  const lilyX = width * 0.48;
  const lilyY = height * 0.64;
  ctx.fillStyle = '#15803D';
  ctx.beginPath();
  ctx.ellipse(lilyX, lilyY, 150, 85, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#166534';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Lily Pad slit notch
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.moveTo(lilyX, lilyY);
  ctx.lineTo(lilyX + 140, lilyY);
  ctx.lineTo(lilyX + 130, lilyY + 22);
  ctx.closePath();
  ctx.fill();

  // Pink water lily blossom
  ctx.fillStyle = '#F472B6';
  ctx.beginPath();
  ctx.ellipse(lilyX - 110, lilyY - 35, 16, 10, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.arc(lilyX - 108, lilyY - 37, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawTreeBranchScene(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  // Sunny morning sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#BAE6FD');
  skyGrad.addColorStop(0.6, '#E0F2FE');
  skyGrad.addColorStop(1, '#FEF9C3');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Warm sun
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(width * 0.88, height * 0.16, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FDE68A';
  ctx.beginPath();
  ctx.arc(width * 0.88, height * 0.16, 50, 0, Math.PI * 2);
  ctx.globalAlpha = 0.35;
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Tree trunk on the left
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.22);
  ctx.quadraticCurveTo(width * 0.09, height * 0.48, 0, height * 0.95);
  ctx.lineTo(0, height * 0.95);
  ctx.closePath();
  ctx.fill();

  // Big sturdy tree branch extending right
  ctx.fillStyle = '#92400E';
  ctx.strokeStyle = '#451A03';
  ctx.lineWidth = 4;
  const branchY = height * 0.52;
  ctx.beginPath();
  ctx.moveTo(40, branchY - 15);
  ctx.bezierCurveTo(width * 0.3, branchY + 15, width * 0.65, branchY - 20, width * 0.92, branchY + 10);
  ctx.lineTo(width * 0.92, branchY + 28);
  ctx.bezierCurveTo(width * 0.64, branchY + 4, width * 0.3, branchY + 38, 40, branchY + 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Fresh green leaves clustering around branch
  const leafClusters = [
    { x: width * 0.16, y: branchY - 30, r: 32 },
    { x: width * 0.34, y: branchY + 42, r: 26 },
    { x: width * 0.56, y: branchY - 32, r: 30 },
    { x: width * 0.76, y: branchY + 35, r: 24 },
    { x: width * 0.92, y: branchY - 15, r: 34 },
  ];
  ctx.fillStyle = '#16A34A';
  leafClusters.forEach((cl) => {
    ctx.beginPath();
    ctx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.arc(cl.x - 5, cl.y - 5, cl.r * 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#16A34A';
  });
}

function drawFrog(ctx: CanvasRenderingContext2D, frog: FrogItem, tick: number): void {
  ctx.save();
  ctx.translate(frog.x, frog.y);

  const bounce = Math.sin((tick + frog.id * 30) * 0.08) * 2;
  const isBlinking = (tick + frog.blinkTimer) % 120 < 8;

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.beginPath();
  ctx.ellipse(0, 18 - bounce * 0.5, 22, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hind legs
  ctx.fillStyle = '#15803D';
  ctx.beginPath();
  ctx.ellipse(-16, 10, 11, 7, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(16, 10, 11, 7, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Frog body
  ctx.fillStyle = frog.group === 'lilypad' ? '#22C55E' : '#4ADE80';
  ctx.strokeStyle = '#166534';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(0, -bounce, 20, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Yellow tummy
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.ellipse(0, 3 - bounce, 12, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyeballs
  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.arc(-10, -13 - bounce, 7, 0, Math.PI * 2);
  ctx.arc(10, -13 - bounce, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-10, -13 - bounce, 5.5, 0, Math.PI * 2);
  ctx.arc(10, -13 - bounce, 5.5, 0, Math.PI * 2);
  ctx.fill();

  if (isBlinking) {
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-14, -13 - bounce);
    ctx.lineTo(-6, -13 - bounce);
    ctx.moveTo(6, -13 - bounce);
    ctx.lineTo(14, -13 - bounce);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.arc(-9, -13 - bounce, 2.5, 0, Math.PI * 2);
    ctx.arc(9, -13 - bounce, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cheeks & smile
  ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
  ctx.beginPath();
  ctx.arc(-11, -2 - bounce, 3.5, 0, Math.PI * 2);
  ctx.arc(11, -2 - bounce, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#14532D';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -bounce, 6, 0.2, Math.PI - 0.2);
  ctx.stroke();

  // If frog is on bank waiting, draw pulsating tap prompt
  if (frog.group === 'bank') {
    const pulseR = 26 + Math.sin(tick * 0.1) * 3;
    ctx.strokeStyle = '#EA580C';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#EA580C';
    ctx.font = 'bold 12px "Quicksand", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOP! 🐸', 0, -25 - bounce);
  }

  ctx.restore();
}

function drawBird(ctx: CanvasRenderingContext2D, bird: BirdItem): void {
  ctx.save();
  ctx.translate(bird.x, bird.y);

  if (bird.isFlown) {
    const flightAngle = Math.atan2(bird.flySpeedY, bird.flySpeedX);
    ctx.rotate(flightAngle * 0.4);
  }

  // Bird body (Bluebird)
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly
  ctx.fillStyle = '#F8FAFC';
  ctx.beginPath();
  ctx.ellipse(2, 3, 9, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing
  ctx.fillStyle = '#0369A1';
  ctx.save();
  ctx.translate(-2, -2);
  ctx.rotate(bird.wingAngle);
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 7, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Head
  ctx.fillStyle = '#0EA5E9';
  ctx.beginPath();
  ctx.arc(10, -5, 10, 0, Math.PI * 2);
  ctx.fill();

  // Orange Beak
  ctx.fillStyle = '#F97316';
  ctx.beginPath();
  ctx.moveTo(18, -7);
  ctx.lineTo(25, -4);
  ctx.lineTo(18, -1);
  ctx.closePath();
  ctx.fill();

  // Eye
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(13, -7, 2, 0, Math.PI * 2);
  ctx.fill();

  // Perched feet
  if (!bird.isFlown) {
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-2, 11);
    ctx.lineTo(-2, 17);
    ctx.moveTo(3, 11);
    ctx.lineTo(3, 17);
    ctx.stroke();

    ctx.fillStyle = '#B45309';
    ctx.font = 'bold 11px "Quicksand", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tap! 🕊️', 0, -20);
  }

  ctx.restore();
}

function drawMathEquationCard(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  type: 'addition' | 'subtraction',
  num1: number,
  num2: number,
  res: number,
  showResult: boolean
): void {
  const cardW = 320;
  const cardH = 68;
  const rx = cx - cardW / 2;
  const ry = cy - cardH / 2;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.beginPath();
  ctx.roundRect(rx + 2, ry + 4, cardW, cardH, 18);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = type === 'addition' ? '#16A34A' : '#0284C7';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(rx, ry, cardW, cardH, 18);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 32px "Quicksand", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Num 1
  ctx.fillStyle = type === 'addition' ? '#15803D' : '#0369A1';
  ctx.fillText(String(num1), cx - 100, cy);

  // Symbol (+ / -)
  ctx.fillStyle = type === 'addition' ? '#EA580C' : '#E11D48';
  ctx.fillText(type === 'addition' ? '+' : '−', cx - 50, cy);

  // Num 2
  ctx.fillStyle = type === 'addition' ? '#16A34A' : '#0284C7';
  ctx.fillText(String(num2), cx, cy);

  // Equals
  ctx.fillStyle = '#475569';
  ctx.fillText('=', cx + 50, cy);

  // Result
  if (showResult) {
    ctx.fillStyle = '#7C3AED';
    ctx.fillText(String(res), cx + 100, cy);
  } else {
    ctx.fillStyle = '#94A3B8';
    ctx.fillText('?', cx + 100, cy);
  }
}

/* ═══════════════════════════════════════════════════════════════
   SIMULATION ENGINE DEFINITION
   ═══════════════════════════════════════════════════════════════ */

export const additionSubtractionStories: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class1-addition-subtraction-stories',
  title: 'Addition & Subtraction Stories (Adding and Taking Away up to 9)',
  band: 'GRADES_1_8',
  level: 'class-1',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '🐸',
  topic: 'Addition & Subtraction (Numbers up to 9)',
  shortDescription:
    'Interactive addition and subtraction story adventures: make frogs hop together on lily pads, watch birds fly away from tree branches, and solve concrete word problem challenges!',
  detailedDescription:
    'Aligned with NCERT Class 1 Mathematics Chapter 4 ("Addition") & Chapter 5 ("Subtraction"). Children learn addition as combining sets and counting on, and subtraction as taking away. Includes dual-color Ten-Frames, dynamic mathematical equations, bilingual speech narration, and child-friendly touch targets.',
  learningObjectives: [
    'Understand addition as combining two collections and counting on up to 9',
    'Understand subtraction as taking away objects from a collection (how many are left?)',
    'Connect real-world pictorial stories to symbolic math equations (A + B = C, A - B = C)',
    'Reinforce number sense using dual-color Ten-Frame visual organizers',
  ],
  parameters: [
    P.select('mode', 'Activity Mode', [
      ['addition-frogs', '1. Frog Addition (तालाब में मेंढकों का जोड़)'],
      ['subtraction-birds', '2. Bird Subtraction (शाखा से चिड़ियों का घटाव)'],
      ['story-challenge', '3. Math Story Cards (कहानियों के सवाल)'],
    ]),
    P.select('lang', 'Audio Language', [
      ['en-IN', 'English (Indian accent)'],
      ['hi-IN', 'Hindi (हिंदी)'],
    ]),
    P.toggle('voicePrompt', 'Auto Voiceover', true),
  ],
  metrics: [
    metric('equation', 'Math Statement', (s) => (s as any).equationText ?? 'Ready to solve'),
    metric('items', 'Active Items', (s) => `${(s as any).activeCount ?? 0} items`),
    metric('mode', 'Activity', (s) => (s as any).modeLabel ?? 'Addition'),
    metric('stars', 'Stars Earned', (s) => '⭐'.repeat(Math.max(1, (s as any).starsEarned ?? 1))),
  ],
  tags: [
    'addition',
    'subtraction',
    'combining sets',
    'taking away',
    'ten frame',
    'frogs on lily pad',
    'birds on branch',
    'math stories',
    'class 1',
    'ncert',
  ],

  engine: {
    createInitialState: (params, width, height): FoundationalOperationsState => {
      const mode = (params.mode as OperationMode) || 'addition-frogs';
      const w = width || 800;
      const h = height || 500;

      const addendA = 3;
      const addendB = 2;
      const initialBirds = 6;

      const state: FoundationalOperationsState = {
        mode,
        addendA,
        addendB,
        frogs: createFrogs(addendA, addendB, w, h),
        frogsHoppedCount: 0,

        initialBirds,
        birds: createBirds(initialBirds, w, h),
        birdsFlownCount: 0,

        currentStoryIdx: 0,
        selectedOption: null,
        isChallengeCorrect: null,

        celebrationParticles: [],
        celebrationTimer: 0,
        isCelebrating: false,
        celebrationMessage: 'Shabash! Great Math Explorer! ⭐',
        starsEarned: 1,

        promptText: 'Tap the waiting frogs on the shore to make them hop onto the lily pad!',
        promptHindiText: 'किनारे पर बैठे मेंढकों को छुएं और उन्हें तालाब में कूदने दें!',
        speakerBounds: null,
        isSpeakerActive: false,

        time: 0,
        tickCount: 0,
      };

      if (mode === 'subtraction-birds') {
        state.promptText = 'Tap songbirds perched on the branch to make them fly away! How many are left?';
        state.promptHindiText = 'शाखा पर बैठी चिड़ियों को छुएं और उड़ाएं! अब कितनी बची हैं?';
      } else if (mode === 'story-challenge') {
        state.promptText = 'Read the story problem and tap the correct answer card!';
        state.promptHindiText = 'कहानी पढ़ें और सही उत्तर कार्ड को चुनें!';
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
      return (additionSubtractionStories.engine as any).createInitialState(params, width, height);
    },

    update: (state: FoundationalOperationsState, _params, dt, _width, _height) => {
      state.time += dt;
      state.tickCount++;

      // Frogs hop progress
      if (state.mode === 'addition-frogs') {
        for (const frog of state.frogs) {
          if (frog.isHopping) {
            frog.hopProgress += dt * 1.8;
            if (frog.hopProgress >= 1) {
              frog.hopProgress = 1;
              frog.isHopping = false;
              frog.x = frog.targetX;
              frog.y = frog.targetY;
              FoundationalAudio.playDrop();
            } else {
              const p = frog.hopProgress;
              const peakY = Math.min(frog.hopStartY, frog.targetY) - 90;
              frog.x = frog.hopStartX + (frog.targetX - frog.hopStartX) * p;
              frog.y =
                (1 - p) * (1 - p) * frog.hopStartY +
                2 * (1 - p) * p * peakY +
                p * p * frog.targetY;
            }
          }
        }
      }

      // Birds fly progress
      if (state.mode === 'subtraction-birds') {
        for (const bird of state.birds) {
          if (bird.isFlown) {
            bird.x += bird.flySpeedX * dt * 60;
            bird.y += bird.flySpeedY * dt * 60;
            bird.wingAngle += 0.3 * bird.wingDir;
            if (Math.abs(bird.wingAngle) > 0.6) bird.wingDir *= -1;
          }
        }
      }

      // Particles
      if (state.celebrationParticles.length > 0) {
        for (const p of state.celebrationParticles) {
          p.x += p.vx * dt * 60;
          p.y += p.vy * dt * 60;
          p.vy += 220 * dt;
          p.rotation += 4 * dt;
          p.alpha -= dt * 0.6;
        }
        state.celebrationParticles = state.celebrationParticles.filter((p) => p.alpha > 0);
      }

      // Populate metric properties for UI inspect
      const totalFrogs = state.addendA + state.frogsHoppedCount;
      const leftBirds = state.initialBirds - state.birdsFlownCount;
      const activeStory = STORY_PROBLEMS[state.currentStoryIdx] ?? STORY_PROBLEMS[0]!;
      (state as any).equationText =
        state.mode === 'addition-frogs'
          ? `${state.addendA} + ${state.frogsHoppedCount} = ${totalFrogs}`
          : state.mode === 'subtraction-birds'
          ? `${state.initialBirds} − ${state.birdsFlownCount} = ${leftBirds}`
          : `${activeStory.a} ${activeStory.type === 'addition' ? '+' : '−'} ${activeStory.b} = ${state.selectedOption ?? '?'}`;
      (state as any).activeCount = state.mode === 'addition-frogs' ? totalFrogs : leftBirds;
      (state as any).modeLabel =
        state.mode === 'addition-frogs' ? 'Frog Addition' : state.mode === 'subtraction-birds' ? 'Bird Subtraction' : 'Story Problem';

      return state;
    },

    render: (ctx, width, height, state: FoundationalOperationsState, params) => {
      const w = width;
      const h = height;

      // 1. Draw Scene Background based on Mode
      if (state.mode === 'addition-frogs') {
        drawPondScene(ctx, w, h);

        state.frogs.forEach((frog) => {
          drawFrog(ctx, frog, state.tickCount);
        });

        // Math Equation Card
        const totalFrogs = state.addendA + state.frogsHoppedCount;
        drawMathEquationCard(
          ctx,
          w * 0.5,
          108,
          'addition',
          state.addendA,
          state.frogsHoppedCount,
          totalFrogs,
          true
        );

        // Ten-Frame representation
        drawTenFrame(
          ctx,
          150,
          h * 0.84,
          180,
          totalFrogs,
          10,
          '#15803D'
        );

        // Tap hint banner
        ctx.fillStyle = '#FEF3C7';
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(w * 0.72, 78, 190, 56, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#92400E';
        ctx.font = 'bold 13px "Quicksand", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Tap frogs to add them! 🐸', w * 0.72 + 95, 100);
        ctx.font = '12px "Quicksand", system-ui, sans-serif';
        ctx.fillText(`${state.frogsHoppedCount} of ${state.addendB} hopped in`, w * 0.72 + 95, 120);
      } else if (state.mode === 'subtraction-birds') {
        drawTreeBranchScene(ctx, w, h);

        state.birds.forEach((bird) => {
          drawBird(ctx, bird);
        });

        const remainingBirds = state.initialBirds - state.birdsFlownCount;
        drawMathEquationCard(
          ctx,
          w * 0.5,
          108,
          'subtraction',
          state.initialBirds,
          state.birdsFlownCount,
          remainingBirds,
          true
        );

        // Ten-Frame representation
        drawTenFrame(
          ctx,
          150,
          h * 0.84,
          180,
          remainingBirds,
          10,
          '#0284C7'
        );

        // Instruction box
        ctx.fillStyle = '#EFF6FF';
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(w * 0.72, 78, 190, 56, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1E40AF';
        ctx.font = 'bold 13px "Quicksand", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Tap a bird to fly away! 🐦', w * 0.72 + 95, 100);
        ctx.font = '12px "Quicksand", system-ui, sans-serif';
        ctx.fillText(`${remainingBirds} left on branch`, w * 0.72 + 95, 120);
      } else if (state.mode === 'story-challenge') {
        ctx.fillStyle = '#FEFCE8';
        ctx.fillRect(0, 0, w, h);

        const curStory = STORY_PROBLEMS[state.currentStoryIdx] ?? STORY_PROBLEMS[0]!;

        // Story Banner Box
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(w * 0.1, 76, w * 0.8, 130, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 17px "Quicksand", system-ui, sans-serif';
        ctx.textAlign = 'center';
        const isHindi = params.lang === 'hi-IN';
        const storyText = isHindi ? curStory.storyHi : curStory.storyEn;

        // Wrap lines
        const words = storyText.split(' ');
        let line = '';
        let lineY = 110;
        for (let idx = 0; idx < words.length; idx++) {
          const testLine = line + words[idx] + ' ';
          const testW = ctx.measureText(testLine).width;
          if (testW > w * 0.74 && idx > 0) {
            ctx.fillText(line, w * 0.5, lineY);
            line = words[idx] + ' ';
            lineY += 26;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, w * 0.5, lineY);

        // Visual counter emojis
        ctx.font = '32px sans-serif';
        const emojiRowY = 240;
        for (let k = 0; k < curStory.a; k++) {
          ctx.fillText(curStory.itemEmoji, w * 0.32 + k * 42, emojiRowY);
        }
        ctx.font = 'bold 26px sans-serif';
        ctx.fillStyle = '#EA580C';
        ctx.fillText(
          curStory.type === 'addition' ? '+' : '−',
          w * 0.32 + curStory.a * 42 + 15,
          emojiRowY - 6
        );
        ctx.font = '32px sans-serif';
        for (let m = 0; m < curStory.b; m++) {
          ctx.fillText(curStory.itemEmoji, w * 0.32 + (curStory.a + 1) * 42 + m * 42, emojiRowY);
        }

        // Equation Card
        const isSolved = state.selectedOption === curStory.ans;
        drawMathEquationCard(
          ctx,
          w * 0.5,
          305,
          curStory.type,
          curStory.a,
          curStory.b,
          curStory.ans,
          isSolved
        );

        // Answer Choice Buttons
        const choiceStartX = w * 0.35;
        const choiceSpacing = 120;
        curStory.options.forEach((opt, idx) => {
          const btnX = choiceStartX + idx * choiceSpacing;
          const btnY = 385;
          const isSelected = state.selectedOption === opt;
          const isOptCorrect = opt === curStory.ans;

          ctx.fillStyle = isSelected
            ? isOptCorrect
              ? '#16A34A'
              : '#EF4444'
            : '#FFFFFF';
          ctx.strokeStyle = isSelected ? '#0F172A' : '#0284C7';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(btnX - 44, btnY - 26, 88, 52, 14);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = isSelected ? '#FFFFFF' : '#0369A1';
          ctx.font = 'bold 26px "Quicksand", system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(opt), btnX, btnY);
        });

        // Next Story Button
        if (isSolved) {
          ctx.fillStyle = '#8B5CF6';
          ctx.beginPath();
          ctx.roundRect(w * 0.74, 360, 130, 48, 14);
          ctx.fill();
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 14px "Quicksand", system-ui, sans-serif';
          ctx.fillText('Next Story ➔', w * 0.74 + 65, 384);
        }
      }

      // 2. Instruction Banner
      const isHindi = params.lang === 'hi-IN';
      const promptToDisplay = isHindi ? state.promptHindiText : state.promptText;
      const subPrompt = isHindi ? state.promptText : state.promptHindiText;

      const { speakerBounds } = drawInstructionBanner(ctx, w, promptToDisplay, {
        y: 44,
        speakerActive: state.isSpeakerActive,
        step: `Mode: ${state.mode}`,
        subPrompt,
      });
      state.speakerBounds = speakerBounds;

      // 3. Mode Switch Tabs at bottom
      const tabStartX = w * 0.25;
      const tabSpacing = w * 0.25;
      TABS.forEach((tab, idx) => {
        const tx = tabStartX + idx * tabSpacing;
        const ty = h * 0.93;
        const isActive = state.mode === tab.id;

        ctx.fillStyle = isActive ? '#0284C7' : '#FFFFFF';
        ctx.strokeStyle = '#0369A1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(tx - 85, ty - 16, 170, 32, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isActive ? '#FFFFFF' : '#0F172A';
        ctx.font = 'bold 12px "Quicksand", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const label = isHindi ? tab.labelHi : tab.labelEn;
        ctx.fillText(`${tab.icon} ${label}`, tx, ty);
      });

      // 4. Celebration Particles & Overlay
      if (state.celebrationParticles.length > 0) {
        state.celebrationParticles.forEach((p) => {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        });
      }

      if (state.isCelebrating) {
        drawCelebrationOverlay(
          ctx,
          w,
          h,
          state.celebrationMessage,
          state.starsEarned,
          state.celebrationParticles
        );
      }
    },

    /* ── Touch & Pointer Handlers ── */

    onPointerDown: (x, y, state: FoundationalOperationsState, params) => {
      if (!state) return;

      // 1. Speaker tap
      if (
        state.speakerBounds &&
        FoundationalTouchHelper.hitTestRect(x, y, state.speakerBounds, 12)
      ) {
        FoundationalAudio.playPop();
        state.isSpeakerActive = true;
        let speakText = '';
        if (state.mode === 'addition-frogs') {
          const total = state.addendA + state.frogsHoppedCount;
          speakText =
            params.lang === 'hi-IN'
              ? `तालाब में ${state.addendA} मेंढक थे। ${state.frogsHoppedCount} और आ गए! अब कुल ${total} मेंढक हो गए!`
              : `${state.addendA} frogs were on the lily pad. ${state.frogsHoppedCount} frogs jumped in! Now there are ${total} frogs in all!`;
        } else if (state.mode === 'subtraction-birds') {
          const left = state.initialBirds - state.birdsFlownCount;
          speakText =
            params.lang === 'hi-IN'
              ? `शाखा पर ${state.initialBirds} चिड़ियाँ थीं। ${state.birdsFlownCount} उड़ गईं! अब ${left} बची हैं!`
              : `There were ${state.initialBirds} birds on the branch. ${state.birdsFlownCount} birds flew away! ${left} birds are left!`;
        } else {
          const s = STORY_PROBLEMS[state.currentStoryIdx] ?? STORY_PROBLEMS[0]!;
          speakText = params.lang === 'hi-IN' ? s.storyHi : s.storyEn;
        }

        FoundationalNarrator.speak(speakText, { lang: params.lang || 'en-IN' });
        setTimeout(() => {
          state.isSpeakerActive = false;
        }, 2500);
        return;
      }

      // 2. Dismiss celebration
      if (state.isCelebrating) {
        state.isCelebrating = false;
        state.celebrationParticles = [];
        FoundationalAudio.playPop();
        return;
      }

      // 3. Tab switching at bottom (y: 440..490)
      if (y >= 440 && y <= 490) {
        const tabStartX = 800 * 0.25;
        const tabSpacing = 800 * 0.25;
        TABS.forEach((tab, idx) => {
          const tx = tabStartX + idx * tabSpacing;
          if (Math.abs(x - tx) < 85) {
            FoundationalAudio.playPop();
            state.mode = tab.id;
            state.celebrationParticles = [];
            state.isCelebrating = false;

            const modePrompt =
              tab.id === 'addition-frogs'
                ? params.lang === 'hi-IN'
                  ? 'जोड़ की कहानी! मेंढकों को तालाब में लाने के लिए छुएं!'
                  : 'Addition story! Tap the waiting frogs to join the lily pad!'
                : tab.id === 'subtraction-birds'
                ? params.lang === 'hi-IN'
                  ? 'घटाव की कहानी! चिड़ियों को उड़ाने के लिए छुएं!'
                  : 'Subtraction story! Tap the birds to watch them fly away!'
                : params.lang === 'hi-IN'
                ? 'कहानी पढ़ें और सही उत्तर चुनें!'
                : 'Read the story and choose the correct answer!';

            FoundationalNarrator.speak(modePrompt, { lang: params.lang || 'en-IN' });
          }
        });
        return;
      }

      // 4. Mode-specific interactions
      if (state.mode === 'addition-frogs') {
        const waitingFrogs = state.frogs.filter((f) => f.group === 'bank' && !f.isHopping);
        for (const frog of waitingFrogs) {
          if (FoundationalTouchHelper.hitTestCircle(x, y, frog.x, frog.y, frog.radius, 14)) {
            frog.isHopping = true;
            frog.hopProgress = 0;
            frog.hopStartX = frog.x;
            frog.hopStartY = frog.y;
            frog.group = 'lilypad';

            const landingIdx = state.addendA + state.frogsHoppedCount;
            const angle = (landingIdx / (state.addendA + state.addendB)) * Math.PI * 2;
            frog.targetX = 400 + Math.cos(angle) * 75;
            frog.targetY = 320 + Math.sin(angle) * 50;

            state.frogsHoppedCount++;
            FoundationalAudio.playCountTick(state.addendA + state.frogsHoppedCount);

            const total = state.addendA + state.frogsHoppedCount;
            const hopSay =
              params.lang === 'hi-IN'
                ? `कूद गया! अब ${total} मेंढक हो गए!`
                : `Hop! Now there are ${total} frogs!`;
            FoundationalNarrator.speak(hopSay, { lang: params.lang || 'en-IN' });

            if (state.frogsHoppedCount === state.addendB) {
              FoundationalAudio.playCelebrationFanfare();
              state.celebrationParticles = createConfettiBurst(800, 500, 50);
              state.isCelebrating = true;
              state.celebrationMessage = `${state.addendA} + ${state.addendB} = ${total}! All Frogs Joined! 🐸 ⭐`;
              state.starsEarned = 3;
            }
            break;
          }
        }
      } else if (state.mode === 'subtraction-birds') {
        const perchedBirds = state.birds.filter((b) => !b.isFlown);
        for (const bird of perchedBirds) {
          if (FoundationalTouchHelper.hitTestCircle(x, y, bird.x, bird.y, bird.radius, 14)) {
            bird.isFlown = true;
            bird.flySpeedX = 4 + Math.random() * 3;
            bird.flySpeedY = -(3 + Math.random() * 2);
            FoundationalAudio.playPop();

            state.birdsFlownCount++;
            const left = state.initialBirds - state.birdsFlownCount;

            const flySay =
              params.lang === 'hi-IN'
                ? `फुर्र! एक चिड़िया उड़ गई! बचे ${left}!`
                : `Whoosh! One bird flew away! ${left} left!`;
            FoundationalNarrator.speak(flySay, { lang: params.lang || 'en-IN' });

            if (left === 0) {
              FoundationalAudio.playCelebrationFanfare();
              state.celebrationParticles = createConfettiBurst(800, 500, 50);
              state.isCelebrating = true;
              state.celebrationMessage = `All birds flew away! 0 Left! 🕊️ ⭐`;
              state.starsEarned = 3;
            }
            break;
          }
        }
      } else if (state.mode === 'story-challenge') {
        const curStory = STORY_PROBLEMS[state.currentStoryIdx] ?? STORY_PROBLEMS[0]!;

        // Check Next button (x: 590..730, y: 350..410)
        if (
          state.selectedOption === curStory.ans &&
          x >= 590 &&
          x <= 730 &&
          y >= 350 &&
          y <= 410
        ) {
          FoundationalAudio.playPop();
          state.currentStoryIdx = (state.currentStoryIdx + 1) % STORY_PROBLEMS.length;
          state.selectedOption = null;
          state.isChallengeCorrect = null;
          const nextStory = STORY_PROBLEMS[state.currentStoryIdx] ?? STORY_PROBLEMS[0]!;
          FoundationalNarrator.speak(
            params.lang === 'hi-IN' ? nextStory.storyHi : nextStory.storyEn,
            { lang: params.lang || 'en-IN' }
          );
          return;
        }

        // Choice buttons
        const choiceStartX = 800 * 0.35;
        const choiceSpacing = 120;
        curStory.options.forEach((opt, idx) => {
          const btnX = choiceStartX + idx * choiceSpacing;
          const btnY = 385;
          if (Math.abs(x - btnX) < 44 && Math.abs(y - btnY) < 26) {
            state.selectedOption = opt;
            if (opt === curStory.ans) {
              state.isChallengeCorrect = true;
              FoundationalAudio.playCelebrationFanfare();
              state.celebrationParticles = createConfettiBurst(800, 500, 45);
              const yay =
                params.lang === 'hi-IN'
                  ? `बिल्कुल सही! सही उत्तर ${opt} है!`
                  : `Correct! The answer is ${opt}!`;
              FoundationalNarrator.speak(yay, { lang: params.lang || 'en-IN' });
            } else {
              state.isChallengeCorrect = false;
              FoundationalAudio.playGentleRetry();
              const retrySay =
                params.lang === 'hi-IN'
                  ? 'आइए फिर से गिनते हैं! एक बार फिर कोशिश करें!'
                  : 'Let us count again! Try once more!';
              FoundationalNarrator.speak(retrySay, { lang: params.lang || 'en-IN' });
            }
          }
        });
      }
    },
  },
});

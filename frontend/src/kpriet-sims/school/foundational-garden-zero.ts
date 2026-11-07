/**
 * PIYUSHDHARA EDUVERSE — FOUNDATIONAL STAGE (CLASS 1) SIMULATION 3
 *
 * Title: Counting in the Enchanted Garden (Numbers 1 to 9 & The Zero Concept)
 * Alignment: NCERT Class 1 Mathematics Chapter 2 & 3: Numbers 1 to 9 / The Zero Concept
 * Archetype: VIRTUAL_MANIPULATIVE_TEN_FRAME & TAP_TO_COUNT_ACCUMULATOR
 *
 * Concepts Taught:
 * 1. One-to-One Correspondence: Touching or gathering an object increments the tally with pitch-matched audio ticks.
 * 2. Cardinality & Subitizing: Recognizing quantities 1 to 9 instantly using a structured 2x5 Ten-Frame Basket.
 * 3. Numeral & Word Association: Connecting concrete items with digits (1-9) and words in English & Hindi.
 * 4. The Zero Concept (शून्य): The story of the bird nest — 3 baby birds fly away one-by-one until 0 remain (Zero means None / Khali).
 *
 * Foundational Stage Standards:
 * - Minimum 64px touch targets with 16px touch-slop.
 * - Procedural Web Audio: ascending pitch tick (playCountTick), harmonic success chime, celebratory fanfare.
 * - Bilingual Speech Synthesis in Indian English (en-IN) and Hindi (hi-IN).
 * - Zero reading penalty: animated visual cues and voice narration.
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

/* ── Types & Interfaces ── */

export type GardenMode = 'count-basket' | 'zero-concept' | 'tap-to-count' | 'number-match';
export type GardenItemKind = 'mangoes' | 'butterflies' | 'flowers';

export interface GardenCollectible {
  id: number;
  x: number;
  y: number;
  radius: number;
  isCollected: boolean;
  isDragging: boolean;
  countedIndex: number; // 1 to 9
  baseX: number;
  baseY: number;
  flutterOffset: number;
}

export interface BabyBird {
  id: number;
  x: number;
  y: number;
  inNest: boolean;
  flyAway: boolean;
  flyT: number;
}

export interface GardenSimState {
  mode: GardenMode;
  itemKind: GardenItemKind;
  targetCount: number;
  currentCount: number;
  starsEarned: number;
  completedTasks: number;
  isCelebrating: boolean;
  celebrationMessage: string;
  particles: IParticle[];
  time: number;

  // Collectibles on screen
  collectibles: GardenCollectible[];
  activeDragId: number | null;
  dragOffsetX: number;
  dragOffsetY: number;

  // Zero Concept Bird Nest State
  birds: BabyBird[];
  birdsRemainingInNest: number;

  // Basket bounds
  basketX: number;
  basketY: number;
  basketW: number;
  basketH: number;

  // Nest bounds
  nestX: number;
  nestY: number;

  // UI
  promptText: string;
  promptHindiText: string;
  speakerBounds: IBoundingBox | null;
  isSpeakerActive: boolean;
}

/* ── English & Hindi Number Words ── */

const NUM_WORDS_EN = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const NUM_WORDS_HI = ['शून्य (Zero)', 'एक (1)', 'दो (2)', 'तीन (3)', 'चार (4)', 'पांच (5)', 'छह (6)', 'सात (7)', 'आठ (8)', 'नौ (9)', 'दस (10)'];

/* ── Vector Graphics Rendering Helpers ── */

/** Draws juicy golden ripe mango hanging on a branch. */
function drawMango(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, isCollected: boolean, isDragging: boolean) {
  if (isCollected && !isDragging) return;

  ctx.save();
  ctx.translate(x, y);

  // Shadow
  ctx.fillStyle = isDragging ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(0, r + 4, r * 0.7, r * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mango stem
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.7);
  ctx.quadraticCurveTo(-4, -r * 1.1, -2, -r * 1.25);
  ctx.stroke();

  // Mango green leaf
  ctx.fillStyle = '#16A34A';
  ctx.beginPath();
  ctx.ellipse(8, -r * 0.95, 10, 4, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Golden mango body with red blush gradient
  const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 4, 0, 0, r);
  grad.addColorStop(0, '#FEF08A');
  grad.addColorStop(0.6, '#F59E0B');
  grad.addColorStop(1, '#EA580C');

  ctx.fillStyle = grad;
  ctx.beginPath();
  // Classic kidney mango curve
  ctx.moveTo(0, -r * 0.7);
  ctx.bezierCurveTo(r * 0.9, -r * 0.6, r * 1.1, r * 0.3, r * 0.4, r * 0.9);
  ctx.bezierCurveTo(0, r * 1.1, -r * 0.8, r * 0.7, -r * 0.8, -r * 0.2);
  ctx.bezierCurveTo(-r * 0.7, -r * 0.7, -r * 0.3, -r * 0.8, 0, -r * 0.7);
  ctx.closePath();
  ctx.fill();

  // Subtle specular shine
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.25, -r * 0.25, r * 0.35, r * 0.18, -0.4, 0, Math.PI * 2);
  ctx.fill();

  if (isDragging) {
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r + 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

/** Draws fluttering colorful butterfly. */
function drawButterfly(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, time: number, isCollected: boolean, isDragging: boolean) {
  if (isCollected && !isDragging) return;

  ctx.save();
  ctx.translate(x, y);

  // Wing flapping oscillation
  const flap = Math.sin(time * 8 + x * 0.05);
  const wingScaleX = Math.abs(flap) * 0.7 + 0.3;

  // Wings (vibrant magenta/purple and cyan)
  ctx.save();
  ctx.scale(wingScaleX, 1);

  // Top Wings
  ctx.fillStyle = '#EC4899';
  ctx.beginPath();
  ctx.ellipse(-r * 0.6, -r * 0.3, r * 0.7, r * 0.5, -0.3, 0, Math.PI * 2);
  ctx.ellipse(r * 0.6, -r * 0.3, r * 0.7, r * 0.5, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Wing pattern spots
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.arc(-r * 0.6, -r * 0.3, r * 0.25, 0, Math.PI * 2);
  ctx.arc(r * 0.6, -r * 0.3, r * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Bottom Wings
  ctx.fillStyle = '#8B5CF6';
  ctx.beginPath();
  ctx.ellipse(-r * 0.45, r * 0.35, r * 0.5, r * 0.35, 0.3, 0, Math.PI * 2);
  ctx.ellipse(r * 0.45, r * 0.35, r * 0.5, r * 0.35, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Butterfly Slender Body
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.ellipse(0, 0, 4, r * 0.65, 0, 0, Math.PI * 2);
  ctx.fill();

  // Antennae
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.5);
  ctx.quadraticCurveTo(-6, -r * 0.9, -10, -r * 0.85);
  ctx.moveTo(0, -r * 0.5);
  ctx.quadraticCurveTo(6, -r * 0.9, 10, -r * 0.85);
  ctx.stroke();

  ctx.restore();
}

/** Draws garden flower blossom. */
function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, isCollected: boolean, isDragging: boolean) {
  if (isCollected && !isDragging) return;

  ctx.save();
  ctx.translate(x, y);

  // 5 Petals
  ctx.fillStyle = '#F43F5E';
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    const px = Math.cos(a) * (r * 0.55);
    const py = Math.sin(a) * (r * 0.55);
    ctx.beginPath();
    ctx.arc(px, py, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  // Golden Center Pollen
  ctx.fillStyle = '#FDE047';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Draws chirping baby bird in the nest. */
function drawBabyBird(ctx: CanvasRenderingContext2D, bird: BabyBird, time: number) {
  ctx.save();

  // If flying away, animate upward and outward
  let bx = bird.x;
  let by = bird.y;
  if (bird.flyAway) {
    bx += bird.flyT * 220;
    by -= bird.flyT * 260 + Math.sin(bird.flyT * 10) * 20;
  }

  ctx.translate(bx, by);

  // Body (fluffy baby blue)
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();

  // Belly
  ctx.fillStyle = '#FEF08A';
  ctx.beginPath();
  ctx.arc(-2, 4, 10, 0, Math.PI * 2);
  ctx.fill();

  // Wing flap
  const flap = Math.sin(time * 12 + bird.id) * 4;
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.ellipse(6, flap, 8, 5, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Cute open beak (asking for worms)
  ctx.fillStyle = '#EA580C';
  ctx.beginPath();
  ctx.moveTo(-12, -2);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-12, 4);
  ctx.closePath();
  ctx.fill();

  // Big sparkling baby eye
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-6, -4, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(-7, -4, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Draws rustic twig bird's nest on a sturdy bough. */
function drawNest(ctx: CanvasRenderingContext2D, nx: number, ny: number, birdsCount: number) {
  ctx.save();

  // Branch support
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.moveTo(nx - 80, ny + 40);
  ctx.lineTo(nx + 80, ny + 40);
  ctx.lineTo(nx + 70, ny + 60);
  ctx.lineTo(nx - 90, ny + 60);
  ctx.closePath();
  ctx.fill();

  // Nest bowl
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.ellipse(nx, ny + 20, 55, 30, 0, 0, Math.PI);
  ctx.closePath();
  ctx.fill();

  // Twigs texture
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 2.5;
  for (let i = -40; i <= 40; i += 12) {
    ctx.beginPath();
    ctx.moveTo(nx + i, ny + 10);
    ctx.lineTo(nx + i + 8, ny + 32);
    ctx.stroke();
  }

  // Nest status label
  ctx.fillStyle = birdsCount === 0 ? '#DC2626' : '#0F172A';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  const labelText = birdsCount === 0 ? 'ZERO BIRDS! (शून्य चिड़िया - खाली घोंसला)' : `${birdsCount} Baby Birds in Nest`;
  ctx.fillText(labelText, nx, ny + 65);

  ctx.restore();
}

/** Draws Woven Harvesting Basket (Ten-Frame Receptacle). */
function drawWovenBasket(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  bw: number,
  bh: number,
  currentCount: number,
  targetCount: number,
  isHovered: boolean
) {
  ctx.save();

  // Basket shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.beginPath();
  ctx.ellipse(bx + bw / 2, by + bh + 8, bw * 0.52, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Basket container card
  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0,0,0,0.08)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 20);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Highlight border
  ctx.strokeStyle = isHovered ? '#10B981' : '#F59E0B';
  ctx.lineWidth = isHovered ? 4 : 2.5;
  ctx.stroke();

  // Basket header
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(bx, by, bw, 42);
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('TEN-FRAME BASKET 🧺', bx + 16, by + 26);

  // Big digital counter badge
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${currentCount} / ${targetCount}`, bx + bw - 16, by + 28);

  // Draw 2x5 Ten-Frame inside basket
  const tfW = bw - 32;
  const tfX = bx + 16;
  const tfY = by + 56;
  drawTenFrame(ctx, tfX, tfY, tfW, currentCount, 10, '#EA580C');

  // Spoken numeral and word readout strip at bottom of basket
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  const wordEn = NUM_WORDS_EN[currentCount] ?? String(currentCount);
  const wordHi = NUM_WORDS_HI[currentCount] ?? String(currentCount);
  ctx.fillText(`${currentCount} = ${wordEn} · ${wordHi}`, bx + bw / 2, by + bh - 16);

  ctx.restore();
}

/* ═══════════════════════════════════════════════════════════════
   SIMULATION ENGINE DEFINITION
   ═══════════════════════════════════════════════════════════════ */

export const countingGardenZero: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class1-counting-garden-zero',
  title: 'Counting in the Enchanted Garden (Numbers 1 to 9 & The Zero Concept)',
  band: 'GRADES_1_8',
  level: 'class-1',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '🥭',
  topic: 'Numbers 1 to 9 and Zero',
  shortDescription:
    'Gather mangoes, butterflies, and flowers into a 2x5 Ten-Frame basket with auditory tally, and explore the concept of Zero in the baby bird nest.',
  detailedDescription:
    'Aligned with NCERT Class 1 Mathematics Chapter 2 and 3 ("Numbers from One to Nine" & "Zero Concept"). Pre-readers touch and gather items to hear pitch-matched ascending counting tones (1 to 9), observe instant subitizing in a ten-frame, and discover that Zero represents "none" when all baby birds leave their nest.',
  learningObjectives: [
    'Develop 1-to-1 correspondence by counting objects up to 9 with pitch-matched audio',
    'Recognize numerals 1–9 and connect quantities with number names in English & Hindi',
    'Understand structured base-10 counting using a visual 2x5 Ten-Frame',
    'Internalize the concept of Zero (शून्य) as an empty set or absence of items',
  ],
  parameters: [
    P.select('mode', 'Play Mode', [
      ['count-basket', '1. Gather in Basket (टोकरी में गिनें)'],
      ['zero-concept', '2. The Zero Bird Nest (शून्य की समझ)'],
      ['number-match', '3. Target Challenge: Match the Number (संख्या मिलाओ)'],
      ['tap-to-count', '4. Tap to Tally (छूकर गिनें)'],
    ]),
    P.select('kind', 'Garden Items', [
      ['mangoes', 'Golden Mangoes (मीठे आम)'],
      ['butterflies', 'Fluttering Butterflies (तितलियाँ)'],
      ['flowers', 'Garden Blossoms (फूल)'],
    ]),
    P.range('target', 'Target Count', 1, 9, 5),
    P.select('lang', 'Audio Language', [
      ['en-IN', 'English (Indian accent)'],
      ['hi-IN', 'Hindi (हिंदी)'],
    ]),
    P.toggle('voicePrompt', 'Auto Voiceover', true),
  ],
  metrics: [
    metric('count', 'Current Count', (s) => `${s.currentCount || 0} collected`),
    metric('word', 'Number Name', (s) => `${NUM_WORDS_EN[s.currentCount || 0]} (${NUM_WORDS_HI[s.currentCount || 0]})`),
    metric('zero', 'Zero Concept', (s) => (s.birdsRemainingInNest === 0 ? 'Empty Nest = Zero (0)' : `${s.birdsRemainingInNest} Birds in Nest`)),
    metric('stars', 'Stars Earned', (s) => '⭐'.repeat(Math.max(1, s.starsEarned || 1))),
  ],
  tags: ['counting', 'numbers 1 to 9', 'zero concept', 'ten frame', 'one to one correspondence', 'class 1', 'ncert'],

  engine: {
    createInitialState: (params, width, height): GardenSimState => {
      const mode = (params.mode as GardenMode) || 'count-basket';
      const kind = (params.kind as GardenItemKind) || 'mangoes';
      const targetCount = Number(params.target) || 5;

      const w = width || 800;
      const h = height || 500;

      // Basket position (right side)
      const basketW = Math.min(320, w * 0.42);
      const basketH = 220;
      const basketX = w - basketW - 24;
      const basketY = h * 0.38;

      // Spawn 9 collectible items in the garden meadow (left side)
      const collectibles: GardenCollectible[] = [];
      const cols = 3;
      const rows = 3;
      const startX = w * 0.08;
      const startY = h * 0.35;
      const spacingX = (w * 0.45) / cols;
      const spacingY = (h * 0.5) / rows;

      let id = 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = startX + c * spacingX + (r % 2 ? 14 : 0);
          const y = startY + r * spacingY;
          collectibles.push({
            id: id++,
            x,
            y,
            radius: 32, // 64px touch target
            isCollected: false,
            isDragging: false,
            countedIndex: 0,
            baseX: x,
            baseY: y,
            flutterOffset: Math.random() * Math.PI * 2,
          });
        }
      }

      // Zero Concept: 3 Baby Birds in the Nest
      const nestX = w * 0.32;
      const nestY = h * 0.42;
      const birds: BabyBird[] = [
        { id: 1, x: nestX - 22, y: nestY + 12, inNest: true, flyAway: false, flyT: 0 },
        { id: 2, x: nestX, y: nestY + 6, inNest: true, flyAway: false, flyT: 0 },
        { id: 3, x: nestX + 22, y: nestY + 12, inNest: true, flyAway: false, flyT: 0 },
      ];

      const state: GardenSimState = {
        mode,
        itemKind: kind,
        targetCount,
        currentCount: 0,
        starsEarned: 1,
        completedTasks: 0,
        isCelebrating: false,
        celebrationMessage: 'Shabash! Great Counting! ⭐',
        particles: [],
        time: 0,

        collectibles,
        activeDragId: null,
        dragOffsetX: 0,
        dragOffsetY: 0,

        birds,
        birdsRemainingInNest: 3,

        basketX,
        basketY,
        basketW,
        basketH,
        nestX,
        nestY,

        promptText: `Gather ${targetCount} ${kind} into the basket!`,
        promptHindiText: `टोकरी में ${targetCount} ${kind === 'mangoes' ? 'आम' : kind === 'butterflies' ? 'तितलियाँ' : 'फूल'} इकट्ठा कीजिए!`,
        speakerBounds: null,
        isSpeakerActive: false,
      };

      if (mode === 'zero-concept') {
        state.promptText = 'Tap the baby birds to let them fly away! How many will be left?';
        state.promptHindiText = 'चिड़ियों को उड़ाइए! घोंसले में कितनी चिड़िया बचेंगी?';
      } else if (mode === 'tap-to-count') {
        state.promptText = 'Tap each item in the garden to hear the numbers aloud!';
        state.promptHindiText = 'हर चीज को छूकर गिनिए और सुनिए!';
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
      return (countingGardenZero.engine as any).createInitialState(params, width, height);
    },

    update: (state: GardenSimState, _params, dt, _width, _height) => {
      state.time += dt;

      // Update fluttering animations for butterflies
      if (state.itemKind === 'butterflies') {
        for (const item of state.collectibles) {
          if (!item.isCollected && !item.isDragging) {
            item.y = item.baseY + Math.sin(state.time * 3 + item.flutterOffset) * 6;
            item.x = item.baseX + Math.cos(state.time * 2 + item.flutterOffset) * 4;
          }
        }
      }

      // Update flying baby birds in zero mode
      for (const bird of state.birds) {
        if (bird.flyAway && bird.flyT < 3) {
          bird.flyT += dt;
        }
      }

      // Update particles
      if (state.particles.length > 0) {
        for (const p of state.particles) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 380 * dt;
          p.alpha = Math.max(0, p.alpha - dt * 0.4);
          p.rotation += dt * 4;
        }
        state.particles = state.particles.filter((p) => p.alpha > 0);
      }

      return state;
    },

    render: (ctx, width, height, state: GardenSimState, params) => {
      const w = width;
      const h = height;

      // 1. Garden Sky & Meadow Background
      ctx.fillStyle = '#E0F2FE';
      ctx.fillRect(0, 0, w, h * 0.55);

      // Smiling sun
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(w * 0.88, h * 0.16, 32, 0, Math.PI * 2);
      ctx.fill();

      // Gentle green hills
      ctx.fillStyle = '#86EFAC';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.55);
      ctx.quadraticCurveTo(w * 0.3, h * 0.48, w * 0.6, h * 0.55);
      ctx.quadraticCurveTo(w * 0.8, h * 0.58, w, h * 0.52);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Lush Meadow Grass
      ctx.fillStyle = '#4ADE80';
      ctx.fillRect(0, h * 0.58, w, h * 0.42);

      // 2. Render Mode-Specific Scenes
      if (state.mode === 'zero-concept') {
        // Zero Bird Nest Tree
        drawNest(ctx, state.nestX, state.nestY, state.birdsRemainingInNest);

        // Baby Birds
        for (const bird of state.birds) {
          drawBabyBird(ctx, bird, state.time);
        }
      } else {
        // Collectibles Garden + Ten-Frame Basket
        drawWovenBasket(
          ctx,
          state.basketX,
          state.basketY,
          state.basketW,
          state.basketH,
          state.currentCount,
          state.targetCount,
          false
        );

        // Render Collectibles (Mangoes / Butterflies / Flowers)
        for (const item of state.collectibles) {
          if (state.itemKind === 'mangoes') {
            drawMango(ctx, item.x, item.y, item.radius, item.isCollected, item.isDragging);
          } else if (state.itemKind === 'butterflies') {
            drawButterfly(ctx, item.x, item.y, item.radius, state.time, item.isCollected, item.isDragging);
          } else {
            drawFlower(ctx, item.x, item.y, item.radius, item.isCollected, item.isDragging);
          }
        }
      }

      // 3. Instruction Header Banner
      const isHindi = params.lang === 'hi-IN';
      const promptToDisplay = isHindi ? state.promptHindiText : state.promptText;
      const subPrompt = isHindi ? state.promptText : state.promptHindiText;

      const { speakerBounds } = drawInstructionBanner(ctx, w, promptToDisplay, {
        y: 48,
        speakerActive: state.isSpeakerActive,
        step: `Count: ${state.currentCount}`,
        subPrompt,
      });
      state.speakerBounds = speakerBounds;

      // 4. Celebration Overlay
      if (state.isCelebrating) {
        drawCelebrationOverlay(ctx, w, h, state.celebrationMessage, state.starsEarned, state.particles);
      }
    },

    /* ── Touch & Pointer Interaction Handlers ── */

    onPointerDown: (x, y, state: GardenSimState, params) => {
      if (!state) return;

      // Speaker tap
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

      // Dismiss celebration modal
      if (state.isCelebrating) {
        state.isCelebrating = false;
        state.particles = [];
        FoundationalAudio.playPop();
        return;
      }

      // Zero Concept Mode: Tapping baby bird flies it away!
      if (state.mode === 'zero-concept') {
        for (const bird of state.birds) {
          if (bird.inNest && !bird.flyAway) {
            if (FoundationalTouchHelper.hitTestCircle(x, y, bird.x, bird.y, 22, 16)) {
              bird.flyAway = true;
              bird.inNest = false;
              state.birdsRemainingInNest = Math.max(0, state.birdsRemainingInNest - 1);

              FoundationalAudio.playPop();

              const remaining = state.birdsRemainingInNest;
              if (remaining > 0) {
                const msg =
                  params.lang === 'hi-IN'
                    ? `एक चिड़िया उड़ गई! अब घोंसले में ${remaining} चिड़िया बचीं!`
                    : `One flew away! Now ${remaining} baby birds in the nest!`;
                FoundationalNarrator.speak(msg, { lang: params.lang || 'en-IN' });
              } else {
                // ZERO CONCEPT REACHED!
                FoundationalAudio.playSuccessChime();
                FoundationalAudio.playCelebrationFanfare();
                state.isCelebrating = true;
                state.starsEarned = 3;
                state.celebrationMessage = 'Empty Nest = ZERO! शून्य! ⭐';
                state.particles = createConfettiBurst(800, 500, 48);

                const zeroMsg =
                  params.lang === 'hi-IN'
                    ? 'सभी चिड़िया उड़ गईं! घोंसला खाली है! इसे शून्य (Zero) कहते हैं!'
                    : 'All birds flew away! The nest is empty! That is ZERO! None left!';
                FoundationalNarrator.speak(zeroMsg, { lang: params.lang || 'en-IN' });
              }
              break;
            }
          }
        }
        return;
      }

      // Tap to Count Mode: simply tap item to tally!
      if (state.mode === 'tap-to-count') {
        for (const item of state.collectibles) {
          if (!item.isCollected && FoundationalTouchHelper.hitTestCircle(x, y, item.x, item.y, item.radius, 16)) {
            item.isCollected = true;
            state.currentCount += 1;
            item.countedIndex = state.currentCount;

            FoundationalAudio.playCountTick(state.currentCount);

            const countWord =
              (params.lang === 'hi-IN'
                ? NUM_WORDS_HI[state.currentCount]
                : NUM_WORDS_EN[state.currentCount]) ?? String(state.currentCount);
            FoundationalNarrator.speak(countWord, { lang: params.lang || 'en-IN' });
            break;
          }
        }
        return;
      }

      // Drag and Gather into Basket Mode
      for (const item of state.collectibles) {
        if (!item.isCollected && FoundationalTouchHelper.hitTestCircle(x, y, item.x, item.y, item.radius, 16)) {
          item.isDragging = true;
          state.activeDragId = item.id;
          state.dragOffsetX = item.x - x;
          state.dragOffsetY = item.y - y;
          FoundationalAudio.playPop();
          break;
        }
      }
    },

    onPointerMove: (x, y, state: GardenSimState, _params) => {
      if (!state || state.activeDragId == null) return;

      const item = state.collectibles.find((it) => it.id === state.activeDragId);
      if (!item) return;

      item.x = x + state.dragOffsetX;
      item.y = y + state.dragOffsetY;
    },

    onPointerUp: (state: GardenSimState, params) => {
      if (!state || state.activeDragId == null) return;

      const item = state.collectibles.find((it) => it.id === state.activeDragId);
      if (!item) return;

      item.isDragging = false;
      state.activeDragId = null;

      // Check if dropped inside the Ten-Frame Basket
      const inBasket =
        item.x >= state.basketX - 20 &&
        item.x <= state.basketX + state.basketW + 20 &&
        item.y >= state.basketY - 20 &&
        item.y <= state.basketY + state.basketH + 20;

      if (inBasket && !item.isCollected) {
        item.isCollected = true;
        state.currentCount += 1;
        item.countedIndex = state.currentCount;

        // Ascending musical count tick!
        FoundationalAudio.playCountTick(state.currentCount);

        const word =
          (params.lang === 'hi-IN'
            ? NUM_WORDS_HI[state.currentCount]
            : NUM_WORDS_EN[state.currentCount]) ?? String(state.currentCount);
        FoundationalNarrator.speak(word, { lang: params.lang || 'en-IN' });

        // Target count reached!
        if (state.currentCount >= state.targetCount) {
          FoundationalAudio.playSuccessChime();
          FoundationalAudio.playCelebrationFanfare();
          state.starsEarned = 3;
          state.isCelebrating = true;
          state.celebrationMessage = `Hooray! ${state.targetCount} Gathered! ⭐`;
          state.particles = createConfettiBurst(800, 500, 48);

          const finishMsg =
            params.lang === 'hi-IN'
              ? `शाबाश! आपने ${state.targetCount} वस्तुएं टोकरी में भर लीं!`
              : `Awesome job! You gathered exactly ${state.targetCount}!`;
          FoundationalNarrator.speak(finishMsg, { lang: params.lang || 'en-IN' });
        }
      } else {
        // Return item to meadow with gentle pop
        item.x = item.baseX;
        item.y = item.baseY;
        FoundationalAudio.playPop();
      }
    },
  },
});

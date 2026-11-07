/**
 * PIYUSHDHARA EDUVERSE — FOUNDATIONAL STAGE (CLASS 1) SIMULATION 2
 *
 * Title: Rolling or Sliding? The Ramp Adventure!
 * Alignment: NCERT Class 1 Mathematics Chapter 1 & 2: Shapes & Space / 3D Solids
 * Archetype: PHYSICS_RAMP & Hands-on Inquiry Lab
 *
 * Concepts Taught:
 * 1. Rolling: Objects with round/curved surfaces roll smoothly (Ball, Orange, Marble).
 * 2. Sliding: Objects with flat faces slide along the surface (Wooden Box, Book, Eraser).
 * 3. Both Rolling and Sliding: Objects with both flat and curved faces (Coin, Battery, Pencil, Tin Can).
 * 4. Stacking Towers: Flat surfaces create stable towers; curved surfaces roll away and tumble!
 *
 * Foundational Stage Scaffolding:
 * - Real-time continuous ramp physics (gravity component, rolling friction, sliding friction).
 * - Multi-sensory Web Audio sound FX: roll rumble, slide friction whoosh, finish bell, tower tumble thud.
 * - Bilingual Speech Synthesis prompts in English (en-IN) and Hindi (hi-IN).
 * - Minimum 64px touch targets with 16px forgiving touch-slop.
 * - Side-by-side race mode & interactive stacking pedestal.
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

/* ── Types & Interfaces ── */

export type RampMode = 'ramp-test' | 'race-challenge' | 'stacking-tower' | 'free-explore';
export type ItemType = 'ball' | 'box' | 'coin' | 'battery' | 'orange' | 'pencil';
export type CoinOrientation = 'edge' | 'flat';

export interface RampItem {
  id: ItemType;
  name: string;
  hindiName: string;
  icon: string;
  surface: 'curved' | 'flat' | 'both';
  motionBehavior: 'ROLL' | 'SLIDE' | 'BOTH';
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  radius: number;
  isDragging: boolean;
  isOnRamp: boolean;
  isFinished: boolean;
  orientation?: CoinOrientation; // for coin/battery: edge rolls, flat slides
  dragStartX: number;
  dragStartY: number;
}

export interface StackedItem {
  id: ItemType;
  name: string;
  icon: string;
  surface: 'curved' | 'flat' | 'both';
  x: number;
  y: number;
  width: number;
  height: number;
  tumbled: boolean;
}

export interface RampSimState {
  mode: RampMode;
  inclineAngleDeg: number;
  stepIndex: number;
  starsEarned: number;
  completedTests: number;
  isCelebrating: boolean;
  celebrationMessage: string;
  particles: IParticle[];
  time: number;

  // Active items in the test tray
  items: RampItem[];
  activeDragId: ItemType | null;
  dragOffsetX: number;
  dragOffsetY: number;

  // Race mode contenders
  raceRacerA: RampItem | null;
  raceRacerB: RampItem | null;
  isRacing: boolean;
  raceWinner: string | null;

  // Stacking tower items on pedestal
  tower: StackedItem[];
  towerToppled: boolean;

  // UI & Prompts
  promptText: string;
  promptHindiText: string;
  speakerBounds: IBoundingBox | null;
  isSpeakerActive: boolean;
  lastMotionResult: string;
}

/* ── Item Physics Profiles ── */

const ITEM_DEFS: Record<ItemType, {
  name: string;
  hindiName: string;
  icon: string;
  surface: 'curved' | 'flat' | 'both';
  behavior: 'ROLL' | 'SLIDE' | 'BOTH';
  radius: number;
  color: string;
}> = {
  ball: {
    name: 'Soccer Ball',
    hindiName: 'गेंद',
    icon: '⚽',
    surface: 'curved',
    behavior: 'ROLL',
    radius: 34,
    color: '#FFFFFF',
  },
  box: {
    name: 'Wooden Box',
    hindiName: 'डिब्बा',
    icon: '📦',
    surface: 'flat',
    behavior: 'SLIDE',
    radius: 32,
    color: '#D97706',
  },
  coin: {
    name: '₹5 Coin',
    hindiName: 'सिक्का',
    icon: '🪙',
    surface: 'both',
    behavior: 'BOTH',
    radius: 30,
    color: '#F59E0B',
  },
  battery: {
    name: 'Battery Cell',
    hindiName: 'बैटरी / सेल',
    icon: '🔋',
    surface: 'both',
    behavior: 'BOTH',
    radius: 32,
    color: '#10B981',
  },
  orange: {
    name: 'Fresh Orange',
    hindiName: 'संतरा',
    icon: '🍊',
    surface: 'curved',
    behavior: 'ROLL',
    radius: 32,
    color: '#EA580C',
  },
  pencil: {
    name: 'Wooden Pencil',
    hindiName: 'पेंसिल',
    icon: '✏️',
    surface: 'both',
    behavior: 'BOTH',
    radius: 30,
    color: '#EAB308',
  },
};

/* ── Vector Graphics Drawing Helpers ── */

/** Draws realistic 3D inclined ramp in playground scene. */
function drawRamp(
  ctx: CanvasRenderingContext2D,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
  angleDeg: number,
  isHoveredTop: boolean
) {
  ctx.save();

  // Ramp triangle points:
  // Top-left platform: (rx, ry)
  // Bottom-right landing: (rx + rw, ry + rh)
  // Ground support: (rx, ry + rh)

  // 1. Ramp Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.beginPath();
  ctx.moveTo(rx, ry + rh + 8);
  ctx.lineTo(rx + rw + 20, ry + rh + 8);
  ctx.lineTo(rx + rw, ry + rh - 4);
  ctx.lineTo(rx, ry + rh - 4);
  ctx.closePath();
  ctx.fill();

  // 2. Ramp wooden/plastic side face
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.moveTo(rx, ry);
  ctx.lineTo(rx + rw, ry + rh);
  ctx.lineTo(rx, ry + rh);
  ctx.closePath();
  ctx.fill();

  // 3. Ramp smooth inclined surface track (bright cyan/sky)
  ctx.fillStyle = isHoveredTop ? '#38BDF8' : '#7DD3FC';
  ctx.beginPath();
  ctx.moveTo(rx - 8, ry - 6);
  ctx.lineTo(rx + rw, ry + rh - 6);
  ctx.lineTo(rx + rw, ry + rh);
  ctx.lineTo(rx - 8, ry);
  ctx.closePath();
  ctx.fill();

  // Surface guide rail
  ctx.strokeStyle = '#0369A1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(rx - 8, ry - 6);
  ctx.lineTo(rx + rw, ry + rh - 6);
  ctx.stroke();

  // 4. Top Drop Target Highlight Slot
  ctx.save();
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = isHoveredTop ? '#10B981' : '#F59E0B';
  ctx.lineWidth = isHoveredTop ? 3.5 : 2.5;
  ctx.beginPath();
  ctx.arc(rx + 24, ry + 12, 38, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Top slot label
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DROP HERE 🎯', rx + 24, ry - 32);
  ctx.font = '600 11px sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('यहाँ रखें', rx + 24, ry - 18);

  // 5. Incline Angle Badge
  ctx.fillStyle = '#FEF3C7';
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(rx + 24, ry + rh - 38, 72, 26, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#B45309';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${angleDeg}° Ramp`, rx + 60, ry + rh - 21);

  // 6. Finish Bell at landing
  const bellX = rx + rw + 28;
  const bellY = ry + rh - 18;
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(bellX, bellY, 14, Math.PI, 0, false);
  ctx.lineTo(bellX + 16, bellY + 12);
  ctx.lineTo(bellX - 16, bellY + 12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#78350F';
  ctx.fillRect(bellX - 2, bellY + 12, 4, 8);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FINISH 🔔', bellX, bellY + 32);

  ctx.restore();
}

/** Draws custom vector graphics for each solid object. */
function drawRampItem(
  ctx: CanvasRenderingContext2D,
  item: RampItem,
  isDragging: boolean
) {
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(item.rotation);

  const r = item.radius;

  // Lift shadow
  ctx.fillStyle = isDragging ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(0, r + 4, r * 0.8, r * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  switch (item.id) {
    case 'ball': {
      // Soccer ball with pentagon pattern
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Center black pentagon
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const px = Math.cos(a) * (r * 0.45);
        const py = Math.sin(a) * (r * 0.45);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'box': {
      // Isometric/flat wooden block
      const s = r * 1.6;
      ctx.fillStyle = '#D97706';
      ctx.fillRect(-s / 2, -s / 2, s, s);
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 3;
      ctx.strokeRect(-s / 2, -s / 2, s, s);

      // Wood grain lines
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-s / 2 + 6, -s / 4);
      ctx.lineTo(s / 2 - 6, -s / 4);
      ctx.moveTo(-s / 2 + 6, s / 4);
      ctx.lineTo(s / 2 - 6, s / 4);
      ctx.stroke();

      // Flat surface symbol
      ctx.fillStyle = '#FEF3C7';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('FLAT ⬛', 0, 0);
      break;
    }

    case 'coin': {
      // Golden Indian Coin
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Coin border rim
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, r - 3, 0, Math.PI * 2);
      ctx.stroke();

      // Rupee symbol
      ctx.fillStyle = '#78350F';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('₹5', 0, 0);
      break;
    }

    case 'battery': {
      // Cylinder battery (green and silver)
      const bw = r * 1.1;
      const bh = r * 1.8;
      ctx.fillStyle = '#10B981';
      ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
      ctx.strokeStyle = '#065F46';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);

      // Positive terminal nib
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(-bw * 0.25, -bh / 2 - 6, bw * 0.5, 6);

      // + symbol
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', 0, -bh * 0.2);
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('CELL', 0, bh * 0.2);
      break;
    }

    case 'orange': {
      // Juicy orange with little leaf
      ctx.fillStyle = '#EA580C';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Orange texture dots
      ctx.fillStyle = '#C2410C';
      ctx.beginPath();
      ctx.arc(-8, -6, 2, 0, Math.PI * 2);
      ctx.arc(8, 6, 2, 0, Math.PI * 2);
      ctx.arc(-4, 10, 2, 0, Math.PI * 2);
      ctx.fill();

      // Green stem leaf
      ctx.fillStyle = '#16A34A';
      ctx.beginPath();
      ctx.ellipse(r * 0.4, -r * 0.8, 8, 4, -0.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'pencil': {
      // Hexagonal wooden pencil
      const pw = r * 0.7;
      const ph = r * 2.2;
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-pw / 2, -ph / 2, pw, ph);

      // Pencil tip
      ctx.fillStyle = '#FED7AA';
      ctx.beginPath();
      ctx.moveTo(-pw / 2, ph / 2);
      ctx.lineTo(pw / 2, ph / 2);
      ctx.lineTo(0, ph / 2 + 16);
      ctx.closePath();
      ctx.fill();

      // Lead point
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.moveTo(-pw * 0.25, ph / 2 + 8);
      ctx.lineTo(pw * 0.25, ph / 2 + 8);
      ctx.lineTo(0, ph / 2 + 16);
      ctx.closePath();
      ctx.fill();

      // Eraser top
      ctx.fillStyle = '#F43F5E';
      ctx.fillRect(-pw / 2, -ph / 2 - 8, pw, 8);
      break;
    }
  }

  // Focus ring if currently dragging
  if (isDragging) {
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, r + 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();

  // Name tag under item (when resting in tray)
  if (!item.isOnRamp) {
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.name, item.x, item.y + r + 18);

    ctx.fillStyle = item.surface === 'curved' ? '#047857' : item.surface === 'flat' ? '#B45309' : '#0369A1';
    ctx.font = '600 10px sans-serif';
    const surfLabel =
      item.surface === 'curved'
        ? '⚪ Rolls (घूमता है)'
        : item.surface === 'flat'
        ? '⬜ Slides (सरकता है)'
        : '🔄/⏩ Both (दोनों)';
    ctx.fillText(surfLabel, item.x, item.y + r + 30);
  }
}

/** Draws Stacking Tower Pedestal and stacked blocks. */
function drawStackingPedestal(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  pw: number,
  ph: number,
  tower: StackedItem[],
  toppled: boolean
) {
  ctx.save();

  // Stone pedestal base
  ctx.fillStyle = '#64748B';
  ctx.fillRect(px, py, pw, ph);
  ctx.fillStyle = '#475569';
  ctx.fillRect(px - 10, py + ph - 8, pw + 20, 12);

  // Label
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('STACKING TABLE 🏗️', px + pw / 2, py + ph / 2 + 4);

  // Draw stacked objects
  let currentY = py;
  tower.forEach((item, index) => {
    const s = 48;
    const itemX = px + pw / 2;
    currentY -= s;

    ctx.save();
    if (toppled && index > 0) {
      // Toppled tumble rotation
      ctx.translate(itemX + index * 24, currentY + index * 18);
      ctx.rotate((index * Math.PI) / 4);
    } else {
      ctx.translate(itemX, currentY + s / 2);
    }

    if (item.surface === 'flat') {
      ctx.fillStyle = '#D97706';
      ctx.fillRect(-s / 2, -s / 2, s, s);
      ctx.strokeStyle = '#78350F';
      ctx.lineWidth = 2;
      ctx.strokeRect(-s / 2, -s / 2, s, s);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.icon, 0, 0);
    } else {
      // Round item tumbled
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.icon, 0, 0);
    }

    ctx.restore();
  });

  if (toppled) {
    ctx.fillStyle = '#DC2626';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tumbled! Round surfaces cannot stack! 💥', px + pw / 2, py - 120);
  }

  ctx.restore();
}

/* ═══════════════════════════════════════════════════════════════
   SIMULATION ENGINE DEFINITION
   ═══════════════════════════════════════════════════════════════ */

export const spatialRampAdventure: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class1-spatial-ramp-adventure',
  title: 'Rolling or Sliding? The Ramp Adventure!',
  band: 'GRADES_1_8',
  level: 'class-1',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '🛝',
  topic: 'Shapes and Rolling vs Sliding',
  shortDescription:
    'Hands-on physics ramp adventure: test balls, boxes, coins, and batteries to discover which objects roll, slide, or do both!',
  detailedDescription:
    'Aligned with NCERT Class 1 Mathematics Chapter 1 and 2 ("Shapes and Space" & "Shapes Around Us"). Children manipulate 3D everyday items onto an interactive inclined ramp. Incorporates dynamic friction, rolling simulation, coin orientation testing, side-by-side race mode, and tower stacking challenges.',
  learningObjectives: [
    'Distinguish between objects with round/curved surfaces and flat surfaces',
    'Understand why round objects roll and flat objects slide on an incline',
    'Discover objects like coins and batteries that can both roll and slide depending on how they are placed',
    'Predict which shapes can be stacked into tall towers without toppling',
  ],
  parameters: [
    P.select('mode', 'Play Mode', [
      ['ramp-test', '1. Ramp Physics Lab (ढलान प्रयोग)'],
      ['race-challenge', '2. Ball vs Box Race! (दौड़ प्रतियोगिता)'],
      ['stacking-tower', '3. Tower Stacking Challenge (मीनार बनाना)'],
      ['free-explore', '4. Free Exploration (खुला प्रयोग)'],
    ]),
    P.select('incline', 'Ramp Incline Angle', [
      ['gentle', 'Gentle Slope (18°)'],
      ['medium', 'Medium Slope (28°)'],
      ['steep', 'Steep Slope (42°)'],
    ]),
    P.select('lang', 'Audio Language', [
      ['en-IN', 'English (Indian accent)'],
      ['hi-IN', 'Hindi (हिंदी)'],
    ]),
    P.toggle('voicePrompt', 'Auto Voiceover', true),
  ],
  metrics: [
    metric('motion', 'Current Motion', (s) => s.lastMotionResult || 'Ready to Drop'),
    metric('stars', 'Stars Earned', (s) => '⭐'.repeat(Math.max(1, s.starsEarned || 1))),
    metric('tested', 'Items Tested', (s) => `${s.completedTests || 0} / 6 items`),
  ],
  tags: ['shapes', 'rolling and sliding', 'ramp', 'physics', 'solids', 'class 1', 'ncert'],

  engine: {
    createInitialState: (params, width, height): RampSimState => {
      const mode = (params.mode as RampMode) || 'ramp-test';
      const w = width || 800;
      const h = height || 500;

      const angleDeg = params.incline === 'steep' ? 42 : params.incline === 'gentle' ? 18 : 28;

      // Spawn items neatly inside tray at bottom
      const trayY = h * 0.82;
      const keys: ItemType[] = ['ball', 'box', 'coin', 'battery', 'orange', 'pencil'];
      const spacing = w / (keys.length + 1);

      const items: RampItem[] = keys.map((key, i) => {
        const def = ITEM_DEFS[key];
        return {
          id: key,
          name: def.name,
          hindiName: def.hindiName,
          icon: def.icon,
          surface: def.surface,
          motionBehavior: def.behavior,
          x: spacing * (i + 1),
          y: trayY,
          vx: 0,
          vy: 0,
          rotation: 0,
          vRot: 0,
          radius: def.radius,
          isDragging: false,
          isOnRamp: false,
          isFinished: false,
          dragStartX: spacing * (i + 1),
          dragStartY: trayY,
        };
      });

      const state: RampSimState = {
        mode,
        inclineAngleDeg: angleDeg,
        stepIndex: 1,
        starsEarned: 1,
        completedTests: 0,
        isCelebrating: false,
        celebrationMessage: 'Shabash! Ramp Explorer! ⭐',
        particles: [],
        time: 0,

        items,
        activeDragId: null,
        dragOffsetX: 0,
        dragOffsetY: 0,

        raceRacerA: null,
        raceRacerB: null,
        isRacing: false,
        raceWinner: null,

        tower: [],
        towerToppled: false,

        promptText: 'Drag the Soccer Ball onto the top of the ramp to see if it rolls!',
        promptHindiText: 'गेंद को ढलान के ऊपर रखिए और देखिए वो कैसे घूमती है!',
        speakerBounds: null,
        isSpeakerActive: false,
        lastMotionResult: 'Ready to Roll or Slide',
      };

      if (mode === 'race-challenge') {
        state.promptText = 'Race Time! Ball vs Box — who reaches the bell first?';
        state.promptHindiText = 'दौड़ शुरू! गेंद और डिब्बे में से कौन पहले पहुंचेगा?';
      } else if (mode === 'stacking-tower') {
        state.promptText = 'Drag boxes and balls onto the table. Can you build a tall tower?';
        state.promptHindiText = 'मीनार बनाइए! क्या गोल चीजें एक के ऊपर एक टिकती हैं?';
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
      return (spatialRampAdventure.engine as any).createInitialState(params, width, height);
    },

    update: (state: RampSimState, _params, dt, width, height) => {
      state.time += dt;

      const w = width || 800;
      const h = height || 500;

      // Ramp bounds
      const rx = w * 0.12;
      const rw = w * 0.52;
      const rh = h * 0.42;

      const rampAngleRad = (state.inclineAngleDeg * Math.PI) / 180;
      const sinA = Math.sin(rampAngleRad);
      const cosA = Math.cos(rampAngleRad);

      // Ramp incline slope unit vectors
      const dx = rw;
      const dy = rh;
      const rampLen = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / rampLen;
      const uy = dy / rampLen;

      // Update physics for items moving down the ramp
      for (const item of state.items) {
        if (item.isOnRamp && !item.isDragging) {
          // Physics acceleration down the slope
          const g = 620; // virtual gravity
          let accel = 0;

          if (item.motionBehavior === 'ROLL') {
            // Rolling: high acceleration, minimal rolling resistance
            accel = g * sinA * 0.85;
            item.vRot = item.vx * 0.08;
          } else if (item.motionBehavior === 'SLIDE') {
            // Sliding: friction opposes motion
            const friction = 0.45;
            accel = Math.max(0, g * (sinA - friction * cosA));
            item.vRot = 0; // does not spin!
          } else {
            // BOTH (coin / battery / pencil)
            accel = g * sinA * 0.72;
            item.vRot = item.vx * 0.06;
          }

          item.vx += accel * ux * dt;
          item.vy += accel * uy * dt;

          item.x += item.vx * dt;
          item.y += item.vy * dt;
          item.rotation += item.vRot * dt;

          // Check if item reached the landing base
          if (item.x >= rx + rw && !item.isFinished) {
            item.isFinished = true;
            item.vx *= 0.3; // decelerate on flat grass
            item.vy = 0;

            FoundationalAudio.playSuccessChime();

            // Announce observation
            if (item.motionBehavior === 'ROLL') {
              state.lastMotionResult = `${item.name} ROLLED smoothly! 🔄`;
              state.promptText = `Super! The round ${item.name} ROLLS down the ramp!`;
              state.promptHindiText = `शाबाश! गोल सतह वाली ${item.hindiName} घूमते हुए नीचे आई!`;
            } else if (item.motionBehavior === 'SLIDE') {
              state.lastMotionResult = `${item.name} SLID down with friction! ⏩`;
              state.promptText = `Great! The flat ${item.name} SLIDES down the ramp!`;
              state.promptHindiText = `बहुत अच्छे! चपटी सतह वाला ${item.hindiName} सरकते हुए नीचे आया!`;
            } else {
              state.lastMotionResult = `${item.name} can BOTH Roll and Slide! 🔄/⏩`;
              state.promptText = `Brilliant! The ${item.name} has both flat and round faces!`;
              state.promptHindiText = `कमाल! ${item.hindiName} घूम भी सकती है और सरक भी सकती है!`;
            }

            state.completedTests += 1;
            if (state.completedTests >= 3 && !state.isCelebrating) {
              state.starsEarned = 3;
              state.isCelebrating = true;
              state.celebrationMessage = 'Shabash! Ramp Master Scientist! ⭐';
              FoundationalAudio.playCelebrationFanfare();
              state.particles = createConfettiBurst(w, h, 48);
            }
          }
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

    render: (ctx, width, height, state: RampSimState, params) => {
      const w = width;
      const h = height;

      // 1. Sky & Playground Background
      ctx.fillStyle = '#E0F2FE';
      ctx.fillRect(0, 0, w, h * 0.65);

      // Smiling sun
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(w * 0.88, h * 0.16, 32, 0, Math.PI * 2);
      ctx.fill();

      // Playground Lawn
      ctx.fillStyle = '#4ADE80';
      ctx.fillRect(0, h * 0.65, w, h * 0.35);

      // Bottom Item Tray Shelf
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = -3;
      ctx.fillRect(0, h * 0.74, w, h * 0.26);
      ctx.shadowColor = 'transparent';

      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.74);
      ctx.lineTo(w, h * 0.74);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('TOY TRAY — TAP & DRAG TO TEST (प्रयोग के लिए वस्तुएं चुनें)', 24, h * 0.77);

      // 2. Render Ramp
      const rx = w * 0.12;
      const ry = h * 0.28;
      const rw = w * 0.52;
      const rh = h * 0.42;

      drawRamp(ctx, rx, ry, rw, rh, state.inclineAngleDeg, false);

      // 3. Stacking Pedestal (if in stacking mode)
      if (state.mode === 'stacking-tower') {
        drawStackingPedestal(ctx, w * 0.74, h * 0.45, 130, 48, state.tower, state.towerToppled);
      }

      // 4. Render All Items
      for (const item of state.items) {
        drawRampItem(ctx, item, item.isDragging);
      }

      // 5. Instruction Header Banner (Speech synthesis interactive pill)
      const isHindi = params.lang === 'hi-IN';
      const promptToDisplay = isHindi ? state.promptHindiText : state.promptText;
      const subPrompt = isHindi ? state.promptText : state.promptHindiText;

      const { speakerBounds } = drawInstructionBanner(ctx, w, promptToDisplay, {
        y: 48,
        speakerActive: state.isSpeakerActive,
        step: `Tested: ${state.completedTests}/6`,
        subPrompt,
      });
      state.speakerBounds = speakerBounds;

      // 6. Celebration Overlay
      if (state.isCelebrating) {
        drawCelebrationOverlay(ctx, w, h, state.celebrationMessage, state.starsEarned, state.particles);
      }
    },

    /* ── Pointer & Touch Interaction Handlers ── */

    onPointerDown: (x, y, state: RampSimState, params) => {
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

      // Dismiss celebration modal on tap
      if (state.isCelebrating) {
        state.isCelebrating = false;
        state.particles = [];
        FoundationalAudio.playPop();
        return;
      }

      // Check item pickup with generous touch-slop (16px)
      for (const item of state.items) {
        if (FoundationalTouchHelper.hitTestCircle(x, y, item.x, item.y, item.radius, 16)) {
          item.isDragging = true;
          state.activeDragId = item.id;
          state.dragOffsetX = item.x - x;
          state.dragOffsetY = item.y - y;
          FoundationalAudio.playPop();
          break;
        }
      }
    },

    onPointerMove: (x, y, state: RampSimState, _params) => {
      if (!state || !state.activeDragId) return;

      const item = state.items.find((it) => it.id === state.activeDragId);
      if (!item) return;

      item.x = x + state.dragOffsetX;
      item.y = y + state.dragOffsetY;
    },

    onPointerUp: (state: RampSimState, params) => {
      if (!state || !state.activeDragId) return;

      const item = state.items.find((it) => it.id === state.activeDragId);
      if (!item) return;

      item.isDragging = false;
      state.activeDragId = null;

      // Check if dropped near the top of the ramp (target slot)
      const topRampX = 140;
      const topRampY = 160;

      if (FoundationalTouchHelper.isWithinSnap(item.x, item.y, topRampX, topRampY, 80)) {
        // Snap item to top of the ramp!
        item.x = topRampX;
        item.y = topRampY;
        item.vx = 20;
        item.vy = 12;
        item.isOnRamp = true;
        item.isFinished = false;

        FoundationalAudio.playDrop();

        const msg =
          params.lang === 'hi-IN'
            ? `${item.hindiName} ढलान से नीचे जा रही है!`
            : `Testing ${item.name} on the ramp!`;
        FoundationalNarrator.speak(msg, { lang: params.lang || 'en-IN' });
      } else if (state.mode === 'stacking-tower' && item.x > 560 && item.y < 350) {
        // Drop on stacking tower pedestal
        const willTopple = item.surface === 'curved';
        state.tower.push({
          id: item.id,
          name: item.name,
          icon: item.icon,
          surface: item.surface,
          x: item.x,
          y: item.y,
          width: 48,
          height: 48,
          tumbled: willTopple,
        });

        if (willTopple) {
          state.towerToppled = true;
          FoundationalAudio.playGentleRetry();
          const tumbleMsg =
            params.lang === 'hi-IN'
              ? 'अरे! गोल चीजें लुढ़क जाती हैं, टिकती नहीं!'
              : 'Oops! Round objects roll away and cannot stack into a tower!';
          FoundationalNarrator.speak(tumbleMsg, { lang: params.lang || 'en-IN' });
        } else {
          FoundationalAudio.playSuccessChime();
          const stackMsg =
            params.lang === 'hi-IN'
              ? 'शाबाश! चपटी सतह मीनार पर टिक गई!'
              : 'Great job! Flat surfaces stack securely!';
          FoundationalNarrator.speak(stackMsg, { lang: params.lang || 'en-IN' });
        }
      } else {
        // Return item to tray with gentle bounce
        item.x = item.dragStartX;
        item.y = item.dragStartY;
        item.isOnRamp = false;
        item.vx = 0;
        item.vy = 0;
        FoundationalAudio.playPop();
      }
    },
  },
});

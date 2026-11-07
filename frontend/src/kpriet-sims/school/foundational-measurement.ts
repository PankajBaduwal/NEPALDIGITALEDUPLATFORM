/**
 * PIYUSHDHARA EDUVERSE — FOUNDATIONAL STAGE (CLASS 1) SIMULATION 4
 *
 * Title: The Great Animal Balancing Act! (Longer/Shorter, Heavier/Lighter, Taller/Shorter)
 * Alignment: NCERT Class 1 Mathematics Chapter 7: Measurement (How Long? How Heavy? How Tall?)
 * Archetype: MEASUREMENT_TOOL & BALANCE_SCALE_LEVER
 *
 * Concepts Taught:
 * 1. Heavier vs Lighter: Interactive physical Pan Balance (Tarazu). Left/Right pans dynamically tilt based on weight.
 * 2. Taller vs Shorter: Vertical height comparisons from a common baseline (Giraffe vs Duck vs Bunny).
 * 3. Longer vs Shorter: Horizontal length comparison and side-by-side baseline alignment (Snakes, Pencils, Ladders).
 * 4. Non-Standard Units: Measuring length by tiling eraser blocks or paperclips end-to-end.
 *
 * Foundational Stage Standards:
 * - Minimum 64px touch targets with 16px touch-slop.
 * - Procedural Web Audio: pickup pop, drop clunk, pan balance tilt creak, harmonic success chime, celebration fanfare.
 * - Bilingual Speech Synthesis in Indian English (en-IN) and Hindi (hi-IN).
 * - Zero reading penalty: animated balance scale, visual baseline guides, and spoken audio prompts.
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

export type MeasurementMode = 'pan-balance' | 'taller-shorter' | 'longer-shorter' | 'non-standard-ruler';
export type ComparisonPair = 'watermelon-lemon' | 'pumpkin-apple' | 'animals' | 'pencils';

export interface MeasurableItem {
  id: string;
  name: string;
  hindiName: string;
  icon: string;
  weightVal: number; // relative weight for balance
  heightVal: number; // relative height px
  lengthVal: number; // relative length px
  x: number;
  y: number;
  radius: number;
  isDragging: boolean;
  panSlot: 'left' | 'right' | 'tray';
  baseX: number;
  baseY: number;
}

export interface MeasurementSimState {
  mode: MeasurementMode;
  pair: ComparisonPair;
  stepIndex: number;
  starsEarned: number;
  completedTasks: number;
  isCelebrating: boolean;
  celebrationMessage: string;
  particles: IParticle[];
  time: number;

  // Active items
  items: MeasurableItem[];
  activeDragId: string | null;
  dragOffsetX: number;
  dragOffsetY: number;

  // Balance scale physics
  balanceAngle: number; // radians (-0.35 to +0.35)
  balanceTargetAngle: number;
  leftPanWeight: number;
  rightPanWeight: number;

  // Measurement ruler tiling units (paperclips)
  tiledUnitsCount: number;

  // UI
  promptText: string;
  promptHindiText: string;
  speakerBounds: IBoundingBox | null;
  isSpeakerActive: boolean;
  lastComparisonResult: string;
}

/* ── Item Library ── */

const MEASUREMENT_ITEMS: Record<string, Omit<MeasurableItem, 'x' | 'y' | 'isDragging' | 'panSlot' | 'baseX' | 'baseY'>> = {
  watermelon: {
    id: 'watermelon',
    name: 'Big Watermelon',
    hindiName: 'भारी तरबूज',
    icon: '🍉',
    weightVal: 10,
    heightVal: 90,
    lengthVal: 160,
    radius: 36,
  },
  lemon: {
    id: 'lemon',
    name: 'Small Lemon',
    hindiName: 'हल्का नींबू',
    icon: '🍋',
    weightVal: 1,
    heightVal: 35,
    lengthVal: 45,
    radius: 26,
  },
  pumpkin: {
    id: 'pumpkin',
    name: 'Heavy Pumpkin',
    hindiName: 'भारी कद्दू',
    icon: '🎃',
    weightVal: 8,
    heightVal: 80,
    lengthVal: 130,
    radius: 35,
  },
  apple: {
    id: 'apple',
    name: 'Sweet Apple',
    hindiName: 'हल्का सेब',
    icon: '🍎',
    weightVal: 2,
    heightVal: 45,
    lengthVal: 50,
    radius: 28,
  },
  giraffe: {
    id: 'giraffe',
    name: 'Tall Giraffe',
    hindiName: 'लंबा जिराफ़',
    icon: '🦒',
    weightVal: 9,
    heightVal: 180,
    lengthVal: 110,
    radius: 38,
  },
  duck: {
    id: 'duck',
    name: 'Short Duck',
    hindiName: 'छोटा बत्तख',
    icon: '🦆',
    weightVal: 2,
    heightVal: 50,
    lengthVal: 60,
    radius: 28,
  },
  rabbit: {
    id: 'rabbit',
    name: 'Playful Bunny',
    hindiName: 'छोटा खरगोश',
    icon: '🐰',
    weightVal: 3,
    heightVal: 65,
    lengthVal: 70,
    radius: 30,
  },
  longPencil: {
    id: 'longPencil',
    name: 'Long Pencil',
    hindiName: 'लंबी पेंसिल',
    icon: '✏️',
    weightVal: 1,
    heightVal: 25,
    lengthVal: 180,
    radius: 30,
  },
  shortCrayon: {
    id: 'shortCrayon',
    name: 'Short Crayon',
    hindiName: 'छोटी मोमबत्ती/क्रेयॉन',
    icon: '🖍️',
    weightVal: 1,
    heightVal: 25,
    lengthVal: 75,
    radius: 26,
  },
};

/* ── Vector Graphics Rendering Helpers ── */

/** Draws the traditional Indian Pan Balance Scale (Tarazu). */
function drawPanBalance(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  beamWidth: number,
  angleRad: number,
  leftOccupied: boolean,
  rightOccupied: boolean
) {
  ctx.save();

  // 1. Heavy Base Stand
  ctx.fillStyle = '#64748B';
  ctx.beginPath();
  ctx.roundRect(cx - 70, cy + 150, 140, 24, 12);
  ctx.fill();

  // Vertical Pillar
  ctx.fillStyle = '#475569';
  ctx.fillRect(cx - 8, cy, 16, 150);

  // Fulcrum Pivot Ring & Pointer Needle
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fill();

  // Center alignment pointer needle (shows tilt)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angleRad);
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -38);
  ctx.stroke();

  // Brass Balance Beam
  ctx.fillStyle = '#D97706';
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 3;
  ctx.fillRect(-beamWidth / 2, -6, beamWidth, 12);
  ctx.strokeRect(-beamWidth / 2, -6, beamWidth, 12);

  ctx.restore(); // restore beam rotation

  // Pan World Positions
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);
  const armLen = beamWidth / 2;

  const leftAnchorX = cx - armLen * cosA;
  const leftAnchorY = cy - armLen * sinA;
  const rightAnchorX = cx + armLen * cosA;
  const rightAnchorY = cy + armLen * sinA;

  const ropeLen = 80;

  // 2. Left Pan Chains & Pan Plate
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  // V-shape suspension strings
  ctx.moveTo(leftAnchorX, leftAnchorY);
  ctx.lineTo(leftAnchorX - 35, leftAnchorY + ropeLen);
  ctx.moveTo(leftAnchorX, leftAnchorY);
  ctx.lineTo(leftAnchorX + 35, leftAnchorY + ropeLen);
  ctx.stroke();

  // Left Pan Plate
  ctx.fillStyle = leftOccupied ? '#FDE68A' : '#FEF3C7';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(leftAnchorX, leftAnchorY + ropeLen, 48, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Left Pan Label
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LEFT PAN (बायां)', leftAnchorX, leftAnchorY + ropeLen + 28);

  // 3. Right Pan Chains & Pan Plate
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(rightAnchorX, rightAnchorY);
  ctx.lineTo(rightAnchorX - 35, rightAnchorY + ropeLen);
  ctx.moveTo(rightAnchorX, rightAnchorY);
  ctx.lineTo(rightAnchorX + 35, rightAnchorY + ropeLen);
  ctx.stroke();

  // Right Pan Plate
  ctx.fillStyle = rightOccupied ? '#FDE68A' : '#FEF3C7';
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(rightAnchorX, rightAnchorY + ropeLen, 48, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right Pan Label
  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RIGHT PAN (दायां)', rightAnchorX, rightAnchorY + ropeLen + 28);

  ctx.restore();
}

/** Draws custom vector graphics for each measurable item. */
function drawMeasurableItem(
  ctx: CanvasRenderingContext2D,
  item: MeasurableItem,
  mode: MeasurementMode
) {
  ctx.save();
  ctx.translate(item.x, item.y);

  const r = item.radius;

  // Shadow
  ctx.fillStyle = item.isDragging ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(0, r + 4, r * 0.8, r * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  switch (item.id) {
    case 'watermelon': {
      // Big green striped watermelon
      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.25, r * 0.95, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dark green stripes
      ctx.strokeStyle = '#052E16';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.1, -1.2, 1.2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.7, -1.4, 1.4);
      ctx.stroke();

      // Weight tag
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('10 kg', 0, 0);
      break;
    }

    case 'lemon': {
      // Small yellow lemon
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#CA8A04';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#78350F';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('1 kg', 0, 0);
      break;
    }

    case 'pumpkin': {
      // Big orange ribbed pumpkin
      ctx.fillStyle = '#EA580C';
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.2, r * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#9A3412';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Stem
      ctx.fillStyle = '#15803D';
      ctx.fillRect(-4, -r * 0.9 - 8, 8, 8);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('8 kg', 0, 0);
      break;
    }

    case 'apple': {
      // Small red apple
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('2 kg', 0, 0);
      break;
    }

    case 'giraffe': {
      // Tall friendly cartoon giraffe
      const gh = item.heightVal;
      // Long neck
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-14, -gh + 30, 28, gh - 30);

      // Spots
      ctx.fillStyle = '#92400E';
      ctx.fillRect(-10, -gh + 60, 10, 16);
      ctx.fillRect(0, -gh + 100, 12, 18);
      ctx.fillRect(-8, -gh + 130, 14, 16);

      // Head
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.ellipse(0, -gh + 24, 20, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ears & Horns
      ctx.fillStyle = '#92400E';
      ctx.fillRect(-10, -gh + 6, 4, 12);
      ctx.fillRect(6, -gh + 6, 4, 12);

      // Eye
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(-6, -gh + 22, 3, 0, Math.PI * 2);
      ctx.fill();

      // Legs / Body base
      ctx.fillStyle = '#D97706';
      ctx.fillRect(-22, -20, 44, 24);
      break;
    }

    case 'duck': {
      // Short friendly duck
      ctx.fillStyle = '#FACC15';
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.1, r * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Orange beak
      ctx.fillStyle = '#EA580C';
      ctx.beginPath();
      ctx.moveTo(-r * 0.9, -4);
      ctx.lineTo(-r * 1.5, 0);
      ctx.lineTo(-r * 0.9, 4);
      ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(-r * 0.4, -6, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'longPencil': {
      // Long pencil
      const pl = item.lengthVal;
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-pl / 2, -10, pl, 20);

      // Tip
      ctx.fillStyle = '#FED7AA';
      ctx.beginPath();
      ctx.moveTo(pl / 2, -10);
      ctx.lineTo(pl / 2, 10);
      ctx.lineTo(pl / 2 + 18, 0);
      ctx.closePath();
      ctx.fill();

      // Graphite
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.moveTo(pl / 2 + 10, -5);
      ctx.lineTo(pl / 2 + 10, 5);
      ctx.lineTo(pl / 2 + 18, 0);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'shortCrayon': {
      // Short crayon
      const cl = item.lengthVal;
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(-cl / 2, -10, cl, 20);

      ctx.fillStyle = '#1D4ED8';
      ctx.beginPath();
      ctx.moveTo(cl / 2, -10);
      ctx.lineTo(cl / 2, 10);
      ctx.lineTo(cl / 2 + 14, 0);
      ctx.closePath();
      ctx.fill();
      break;
    }

    default: {
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Lift glow when dragging
  if (item.isDragging) {
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(0, 0, r + 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();

  // Label tag below item when in bottom selection tray
  if (item.panSlot === 'tray' && mode === 'pan-balance') {
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(item.name, item.x, item.y + r + 18);
  }
}

/** Draws common ground baseline for height/length comparison. */
function drawComparisonBaseline(ctx: CanvasRenderingContext2D, y: number, w: number, label: string) {
  ctx.save();
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(40, y);
  ctx.lineTo(w - 40, y);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#DC2626';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`BASELINE (समान आधार रेखा) 📏`, 48, y - 8);
  ctx.textAlign = 'right';
  ctx.fillText(label, w - 48, y - 8);

  ctx.restore();
}

/** Draws non-standard unit paperclips tiled along length. */
function drawTiledPaperclips(ctx: CanvasRenderingContext2D, sx: number, sy: number, count: number) {
  const clipW = 28;
  const clipH = 14;

  ctx.save();
  for (let i = 0; i < count; i++) {
    const cx = sx + i * (clipW + 4);
    ctx.strokeStyle = '#8B5CF6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cx, sy - clipH / 2, clipW, clipH, 6);
    ctx.stroke();

    ctx.fillStyle = '#6D28D9';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), cx + clipW / 2, sy);
  }
  ctx.restore();
}

/* ═══════════════════════════════════════════════════════════════
   SIMULATION ENGINE DEFINITION
   ═══════════════════════════════════════════════════════════════ */

export const measurementBalance: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class1-measurement-balance',
  title: 'The Great Animal Balancing Act! (Longer/Shorter, Heavier/Lighter, Taller/Shorter)',
  band: 'GRADES_1_8',
  level: 'class-1',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '⚖️',
  topic: 'Measurement: Length, Weight, Height',
  shortDescription:
    'Hands-on pan balance and measurement lab: compare heavy vs light with tilting scales, tall vs short from a common baseline, and measure with tiled units!',
  detailedDescription:
    'Aligned with NCERT Class 1 Mathematics Chapter 7 ("Measurement"). Children drag watermelons, pumpkins, lemons, and animals onto an interactive tilting pan balance scale (Tarazu), align objects against a common baseline to determine longer/shorter and taller/shorter, and tile non-standard paperclip units.',
  learningObjectives: [
    'Compare weights using an interactive physical pan balance (Tarazu) to identify Heavier and Lighter',
    'Compare heights and lengths from a strict common baseline to determine Taller/Shorter and Longer/Shorter',
    'Measure lengths using concrete non-standard unit tiling (paperclips / blocks)',
    'Develop foundational spatial and measurement vocabulary in English and Hindi',
  ],
  parameters: [
    P.select('mode', 'Measurement Activity', [
      ['pan-balance', '1. Pan Balance Scale (भारी / हल्का तराजू)'],
      ['taller-shorter', '2. Taller vs Shorter (लंबा और छोटा - जीव)'],
      ['longer-shorter', '3. Longer vs Shorter (लंबा और छोटा - वस्तुएं)'],
      ['non-standard-ruler', '4. Measure with Paperclips (इकाई से मापें)'],
    ]),
    P.select('pair', 'Object Pair', [
      ['watermelon-lemon', 'Watermelon vs Lemon (तरबूज और नींबू)'],
      ['pumpkin-apple', 'Pumpkin vs Apple (कद्दू और सेब)'],
      ['animals', 'Giraffe vs Duck (जिराफ़ और बत्तख)'],
      ['pencils', 'Long Pencil vs Short Crayon (पेंसिल और क्रेयॉन)'],
    ]),
    P.select('lang', 'Audio Language', [
      ['en-IN', 'English (Indian accent)'],
      ['hi-IN', 'Hindi (हिंदी)'],
    ]),
    P.toggle('voicePrompt', 'Auto Voiceover', true),
  ],
  metrics: [
    metric('scale', 'Balance Scale', (s) => (s.balanceAngle < -0.05 ? 'Left Pan Down 🔻 (Heavier)' : s.balanceAngle > 0.05 ? 'Right Pan Down 🔻 (Heavier)' : 'Balanced ⚖️')),
    metric('comparison', 'Comparison Result', (s) => s.lastComparisonResult || 'Place items to compare'),
    metric('units', 'Measured Length', (s) => `${s.tiledUnitsCount || 0} units long`),
    metric('stars', 'Stars Earned', (s) => '⭐'.repeat(Math.max(1, s.starsEarned || 1))),
  ],
  tags: ['measurement', 'heavier lighter', 'taller shorter', 'longer shorter', 'pan balance', 'tarazu', 'class 1', 'ncert'],

  engine: {
    createInitialState: (params, width, height): MeasurementSimState => {
      const mode = (params.mode as MeasurementMode) || 'pan-balance';
      const pair = (params.pair as ComparisonPair) || 'watermelon-lemon';
      const w = width || 800;
      const h = height || 500;

      // Select items based on pair and mode
      let activeItemKeys: string[] = ['watermelon', 'lemon'];
      if (mode === 'taller-shorter' || pair === 'animals') {
        activeItemKeys = ['giraffe', 'duck'];
      } else if (mode === 'longer-shorter' || mode === 'non-standard-ruler' || pair === 'pencils') {
        activeItemKeys = ['longPencil', 'shortCrayon'];
      } else if (pair === 'pumpkin-apple') {
        activeItemKeys = ['pumpkin', 'apple'];
      }

      // Tray positioning
      const trayY = h * 0.82;
      const spacing = w / (activeItemKeys.length + 1);

      const items: MeasurableItem[] = activeItemKeys.map((key, i) => {
        const def = MEASUREMENT_ITEMS[key] ?? MEASUREMENT_ITEMS.watermelon!;
        const posX = mode === 'taller-shorter' || mode === 'longer-shorter' ? w * 0.3 + i * w * 0.35 : spacing * (i + 1);
        const posY = mode === 'taller-shorter' ? h * 0.62 : mode === 'longer-shorter' ? h * 0.45 + i * 70 : trayY;

        return {
          id: def.id,
          name: def.name,
          hindiName: def.hindiName,
          icon: def.icon,
          weightVal: def.weightVal,
          heightVal: def.heightVal,
          lengthVal: def.lengthVal,
          radius: def.radius,
          x: posX,
          y: posY,
          isDragging: false,
          panSlot: 'tray',
          baseX: posX,
          baseY: posY,
        };
      });

      const state: MeasurementSimState = {
        mode,
        pair,
        stepIndex: 1,
        starsEarned: 1,
        completedTasks: 0,
        isCelebrating: false,
        celebrationMessage: 'Shabash! Great Measurement! ⭐',
        particles: [],
        time: 0,

        items,
        activeDragId: null,
        dragOffsetX: 0,
        dragOffsetY: 0,

        balanceAngle: 0,
        balanceTargetAngle: 0,
        leftPanWeight: 0,
        rightPanWeight: 0,

        tiledUnitsCount: mode === 'non-standard-ruler' ? 5 : 0,

        promptText: 'Place the Watermelon on one pan and the Lemon on the other to see which is Heavier!',
        promptHindiText: 'तरबूज और नींबू को तराजू के दोनों पलड़ों में रखिए और देखिए कौन भारी है!',
        speakerBounds: null,
        isSpeakerActive: false,
        lastComparisonResult: 'Ready to compare',
      };

      if (mode === 'taller-shorter') {
        state.promptText = 'Look at the baseline! Who is TALLER: Giraffe or Duck? Tap the taller animal!';
        state.promptHindiText = 'आधार रेखा देखिए! कौन लंबा है: जिराफ़ या बत्तख? लंबे पर टैप कीजिए!';
      } else if (mode === 'longer-shorter') {
        state.promptText = 'Compare the two pencils from the baseline! Which one is LONGER?';
        state.promptHindiText = 'दोनों पेंसिलों को देखिए! कौन सी पेंसिल ज्यादा लंबी है?';
      } else if (mode === 'non-standard-ruler') {
        state.promptText = 'Tap to tile paperclips end-to-end to measure the length of the pencil!';
        state.promptHindiText = 'पेंसिल की लंबाई नापने के लिए पेपरक्लिप्स लगाइए!';
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
      return (measurementBalance.engine as any).createInitialState(params, width, height);
    },

    update: (state: MeasurementSimState, _params, dt, _width, _height) => {
      state.time += dt;

      // Smooth pan balance lever physics
      const diff = state.leftPanWeight - state.rightPanWeight;
      if (diff > 0) {
        state.balanceTargetAngle = -0.32; // Left side tilts DOWN
      } else if (diff < 0) {
        state.balanceTargetAngle = 0.32; // Right side tilts DOWN
      } else {
        state.balanceTargetAngle = 0; // Balanced
      }

      // Spring damper interpolation towards target angle
      state.balanceAngle += (state.balanceTargetAngle - state.balanceAngle) * Math.min(1, dt * 6);

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

    render: (ctx, width, height, state: MeasurementSimState, params) => {
      const w = width;
      const h = height;

      // 1. Warm eye-friendly background
      ctx.fillStyle = '#FFFDF7';
      ctx.fillRect(0, 0, w, h);

      // Decorative subtle grid
      ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
      for (let x = 20; x < w; x += 28) {
        for (let y = 20; y < h; y += 28) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Render Mode Scene
      if (state.mode === 'pan-balance') {
        // Render Pan Balance Scale at center
        const scaleX = w * 0.5;
        const scaleY = h * 0.38;
        const beamW = Math.min(320, w * 0.48);

        const leftOcc = state.items.some((it) => it.panSlot === 'left');
        const rightOcc = state.items.some((it) => it.panSlot === 'right');

        drawPanBalance(ctx, scaleX, scaleY, beamW, state.balanceAngle, leftOcc, rightOcc);

        // Bottom Selection Tray Card
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.06)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = -2;
        ctx.fillRect(0, h * 0.74, w, h * 0.26);
        ctx.shadowColor = 'transparent';

        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.74);
        ctx.lineTo(w, h * 0.74);
        ctx.stroke();

        ctx.fillStyle = '#64748B';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('ITEM TRAY — DRAG ONTO LEFT OR RIGHT PAN TO WEIGH (वस्तुएं तराजू में रखें)', 24, h * 0.77);
      } else if (state.mode === 'taller-shorter') {
        // Common ground baseline for vertical height comparison
        const groundY = h * 0.65;
        drawComparisonBaseline(ctx, groundY, w, 'Common Ground Line');

        // Height comparison guide markers
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        const giraffe = state.items.find((it) => it.id === 'giraffe');
        const duck = state.items.find((it) => it.id === 'duck');

        if (giraffe && duck) {
          // Top height line for Giraffe
          ctx.beginPath();
          ctx.moveTo(giraffe.x - 40, giraffe.y - giraffe.heightVal + 20);
          ctx.lineTo(giraffe.x + 80, giraffe.y - giraffe.heightVal + 20);
          ctx.stroke();

          ctx.fillStyle = '#1D4ED8';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('TALLER (लंबा) 🦒', giraffe.x + 85, giraffe.y - giraffe.heightVal + 24);

          // Top height line for Duck
          ctx.beginPath();
          ctx.moveTo(duck.x - 40, duck.y - duck.heightVal + 20);
          ctx.lineTo(duck.x + 80, duck.y - duck.heightVal + 20);
          ctx.stroke();

          ctx.fillStyle = '#D97706';
          ctx.fillText('SHORTER (छोटा) 🦆', duck.x + 85, duck.y - duck.heightVal + 24);
        }
        ctx.setLineDash([]);
      } else if (state.mode === 'longer-shorter' || state.mode === 'non-standard-ruler') {
        // Vertical baseline for horizontal length alignment
        const baseLineX = w * 0.22;
        ctx.strokeStyle = '#DC2626';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(baseLineX, h * 0.3);
        ctx.lineTo(baseLineX, h * 0.7);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#DC2626';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BASELINE (समान आरंभ बिंदु) 📏', baseLineX, h * 0.26);

        // If in ruler mode: draw tiled paperclips along the pencil
        if (state.mode === 'non-standard-ruler') {
          drawTiledPaperclips(ctx, baseLineX + 8, h * 0.58, state.tiledUnitsCount);

          ctx.fillStyle = '#6D28D9';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(`Pencil Length = ${state.tiledUnitsCount} Paperclips (पेंसिल की लंबाई = ${state.tiledUnitsCount} क्लिप्स)`, baseLineX, h * 0.68);
        }
      }

      // 3. Render Measurable Items
      for (const item of state.items) {
        drawMeasurableItem(ctx, item, state.mode);
      }

      // 4. Instruction Header Banner
      const isHindi = params.lang === 'hi-IN';
      const promptToDisplay = isHindi ? state.promptHindiText : state.promptText;
      const subPrompt = isHindi ? state.promptText : state.promptHindiText;

      const { speakerBounds } = drawInstructionBanner(ctx, w, promptToDisplay, {
        y: 48,
        speakerActive: state.isSpeakerActive,
        step: `Mode: ${state.mode}`,
        subPrompt,
      });
      state.speakerBounds = speakerBounds;

      // 5. Celebration Overlay
      if (state.isCelebrating) {
        drawCelebrationOverlay(ctx, w, h, state.celebrationMessage, state.starsEarned, state.particles);
      }
    },

    /* ── Touch & Pointer Interaction Handlers ── */

    onPointerDown: (x, y, state: MeasurementSimState, params) => {
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

      // Mode: Taller vs Shorter direct tap
      if (state.mode === 'taller-shorter') {
        const giraffe = state.items.find((it) => it.id === 'giraffe');
        if (giraffe && FoundationalTouchHelper.hitTestCircle(x, y, giraffe.x, giraffe.y - 60, 60, 16)) {
          // Tapped Giraffe -> Correct! Giraffe is taller
          FoundationalAudio.playSuccessChime();
          FoundationalAudio.playCelebrationFanfare();
          state.starsEarned = 3;
          state.isCelebrating = true;
          state.celebrationMessage = 'Correct! Giraffe is TALLER! 🦒 ⭐';
          state.particles = createConfettiBurst(800, 500, 48);

          const winMsg =
            params.lang === 'hi-IN'
              ? 'बिल्कुल सही! जिराफ़ बत्तख से बहुत लंबा है!'
              : 'Correct! The Giraffe is much TALLER than the duck!';
          FoundationalNarrator.speak(winMsg, { lang: params.lang || 'en-IN' });
          return;
        }

        const duck = state.items.find((it) => it.id === 'duck');
        if (duck && FoundationalTouchHelper.hitTestCircle(x, y, duck.x, duck.y, duck.radius, 16)) {
          FoundationalAudio.playPop();
          const duckMsg =
            params.lang === 'hi-IN'
              ? 'बत्तख छोटी है! क्या आप लंबे जिराफ़ को ढूंढ सकते हैं?'
              : 'The duck is SHORTER! Can you find who is TALLER?';
          FoundationalNarrator.speak(duckMsg, { lang: params.lang || 'en-IN' });
          return;
        }
      }

      // Mode: Measure with Paperclips -> tap to tile more paperclips!
      if (state.mode === 'non-standard-ruler') {
        if (x > 200 && x < 550 && y > 240 && y < 380) {
          state.tiledUnitsCount = Math.min(8, state.tiledUnitsCount + 1);
          FoundationalAudio.playCountTick(state.tiledUnitsCount);

          if (state.tiledUnitsCount === 6) {
            FoundationalAudio.playSuccessChime();
            state.starsEarned = 3;
            state.isCelebrating = true;
            state.celebrationMessage = 'Exact Match! 6 Paperclips! 📎 ⭐';
            state.particles = createConfettiBurst(800, 500, 48);

            const matchMsg =
              params.lang === 'hi-IN'
                ? 'शाबाश! पेंसिल की लंबाई ठीक 6 पेपरक्लिप्स के बराबर है!'
                : 'Super! The pencil is exactly 6 paperclips long!';
            FoundationalNarrator.speak(matchMsg, { lang: params.lang || 'en-IN' });
          }
          return;
        }
      }

      // Mode: Pan Balance -> pick up item to drag into left or right pan
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

    onPointerMove: (x, y, state: MeasurementSimState, _params) => {
      if (!state || !state.activeDragId) return;

      const item = state.items.find((it) => it.id === state.activeDragId);
      if (!item) return;

      item.x = x + state.dragOffsetX;
      item.y = y + state.dragOffsetY;
    },

    onPointerUp: (state: MeasurementSimState, params) => {
      if (!state || !state.activeDragId) return;

      const item = state.items.find((it) => it.id === state.activeDragId);
      if (!item) return;

      item.isDragging = false;
      state.activeDragId = null;

      // Pan coordinates on screen
      const scaleX = 400;
      const beamW = 320;
      const armLen = beamW / 2;
      const cosA = Math.cos(state.balanceAngle);
      const sinA = Math.sin(state.balanceAngle);

      const leftPanX = scaleX - armLen * cosA;
      const leftPanY = 190 - armLen * sinA + 80;

      const rightPanX = scaleX + armLen * cosA;
      const rightPanY = 190 + armLen * sinA + 80;

      // Hit-test Left Pan
      if (FoundationalTouchHelper.distance(item.x, item.y, leftPanX, leftPanY) < 70) {
        // Place on Left Pan
        item.panSlot = 'left';
        item.x = leftPanX;
        item.y = leftPanY - item.radius * 0.6;
        state.leftPanWeight = item.weightVal;
        FoundationalAudio.playDrop();
      } else if (FoundationalTouchHelper.distance(item.x, item.y, rightPanX, rightPanY) < 70) {
        // Place on Right Pan
        item.panSlot = 'right';
        item.x = rightPanX;
        item.y = rightPanY - item.radius * 0.6;
        state.rightPanWeight = item.weightVal;
        FoundationalAudio.playDrop();
      } else {
        // Return item to tray
        item.panSlot = 'tray';
        item.x = item.baseX;
        item.y = item.baseY;
        state.leftPanWeight = state.items.find((it) => it.panSlot === 'left')?.weightVal ?? 0;
        state.rightPanWeight = state.items.find((it) => it.panSlot === 'right')?.weightVal ?? 0;
        FoundationalAudio.playPop();
      }

      // Check if both pans have items -> Announce Heaviest vs Lightest!
      const leftItem = state.items.find((it) => it.panSlot === 'left');
      const rightItem = state.items.find((it) => it.panSlot === 'right');

      if (leftItem && rightItem) {
        FoundationalAudio.playSuccessChime();

        let heavierName = '';
        let lighterName = '';
        let hindiHeavier = '';
        let hindiLighter = '';

        if (leftItem.weightVal > rightItem.weightVal) {
          heavierName = leftItem.name;
          lighterName = rightItem.name;
          hindiHeavier = leftItem.hindiName;
          hindiLighter = rightItem.hindiName;
        } else {
          heavierName = rightItem.name;
          lighterName = leftItem.name;
          hindiHeavier = rightItem.hindiName;
          hindiLighter = leftItem.hindiName;
        }

        state.lastComparisonResult = `${heavierName} is Heavier than ${lighterName}`;
        state.starsEarned = 3;
        state.isCelebrating = true;
        state.celebrationMessage = `${heavierName} is Heavier! 🔻 ⭐`;
        state.particles = createConfettiBurst(800, 500, 48);

        const weighResultMsg =
          params.lang === 'hi-IN'
            ? `${hindiHeavier} भारी है और नीचे झुक गया! ${hindiLighter} हल्का है!`
            : `${heavierName} is HEAVIER and tilts down! ${lighterName} is LIGHTER!`;
        FoundationalNarrator.speak(weighResultMsg, { lang: params.lang || 'en-IN' });
      }
    },
  },
});

/**
 * PIYUSHDHARA EDUVERSE — FOUNDATIONAL STAGE (CLASS 1) SIMULATION 1
 *
 * Title: Finding the Furry Cat! (Inside / Outside, Top / Bottom, Near / Far)
 * Alignment: NCERT Class 1 Mathematics Chapter 1: Shapes and Space
 * Archetype: DRAG_AND_DROP_SORTER & Spatial Exploration
 *
 * Core Features:
 * - High-contrast pediatric touch targets (>= 64px, hit slop 16px).
 * - Multi-sensory Web Audio procedural sound FX (pops, drops, chimes, celebration).
 * - Zero-reading penalty: bilingual audio read-aloud scaffolding (English & Hindi).
 * - Tactile magnetic snapping drop-zones with visual glow affordances.
 * - Non-punitive playful retry mechanics and celebration fanfare with confetti particles.
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

export type SpatialChallengeMode = 'inside-outside' | 'top-bottom' | 'near-far' | 'free-play';

interface CharacterToken {
  id: 'cat' | 'bird' | 'puppy' | 'pot';
  name: string;
  hindiName: string;
  x: number;
  y: number;
  radius: number;
  isDragging: boolean;
  currentZone: string | null;
  dragStartX: number;
  dragStartY: number;
}

interface SpatialSimState {
  mode: SpatialChallengeMode;
  stepIndex: number;
  starsEarned: number;
  completedTasks: number;
  isCelebrating: boolean;
  celebrationMessage: string;
  particles: IParticle[];
  time: number;

  // Characters
  cat: CharacterToken;
  bird: CharacterToken;
  puppy: CharacterToken;
  pot: CharacterToken;

  activeDragId: 'cat' | 'bird' | 'puppy' | 'pot' | null;
  dragOffsetX: number;
  dragOffsetY: number;

  hoveredZoneId: string | null;
  promptText: string;
  promptHindiText: string;
  speakerBounds: IBoundingBox | null;
  repeatBounds: IBoundingBox | null;
  isSpeakerActive: boolean;
}

/* ── Character Vector Drawing Primitives ── */

/** Draws Mitthu the adorable orange tabby kitten. */
function drawKitten(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, isDragging: boolean, time: number) {
  ctx.save();

  // Shadow
  ctx.fillStyle = isDragging ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  const shadowY = isDragging ? y + r + 14 : y + r + 4;
  const shadowR = isDragging ? r * 0.9 : r * 0.8;
  ctx.ellipse(x, shadowY, shadowR, r * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  const lift = isDragging ? -10 : 0;
  const cy = y + lift;

  // Tail with playful wave
  const tailWave = Math.sin(time * 4) * 6;
  ctx.strokeStyle = '#EA580C';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + r * 0.5, cy + r * 0.3);
  ctx.quadraticCurveTo(x + r * 0.9 + tailWave, cy - r * 0.2, x + r * 0.8 + tailWave, cy - r * 0.6);
  ctx.stroke();

  // Kitten Body / Head (fluffy orange tabby)
  ctx.fillStyle = '#FB923C';
  ctx.beginPath();
  ctx.arc(x, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Tabby ears
  ctx.fillStyle = '#EA580C';
  // Left ear
  ctx.beginPath();
  ctx.moveTo(x - r * 0.75, cy - r * 0.3);
  ctx.lineTo(x - r * 0.65, cy - r * 1.15);
  ctx.lineTo(x - r * 0.15, cy - r * 0.75);
  ctx.closePath();
  ctx.fill();

  // Right ear
  ctx.beginPath();
  ctx.moveTo(x + r * 0.75, cy - r * 0.3);
  ctx.lineTo(x + r * 0.65, cy - r * 1.15);
  ctx.lineTo(x + r * 0.15, cy - r * 0.75);
  ctx.closePath();
  ctx.fill();

  // Pink inner ears
  ctx.fillStyle = '#FDA4AF';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.65, cy - r * 0.35);
  ctx.lineTo(x - r * 0.58, cy - r * 0.95);
  ctx.lineTo(x - r * 0.25, cy - r * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + r * 0.65, cy - r * 0.35);
  ctx.lineTo(x + r * 0.58, cy - r * 0.95);
  ctx.lineTo(x + r * 0.25, cy - r * 0.7);
  ctx.closePath();
  ctx.fill();

  // White muzzle
  ctx.fillStyle = '#FFF7ED';
  ctx.beginPath();
  ctx.ellipse(x, cy + r * 0.2, r * 0.45, r * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Big sparkling cat eyes
  const eyeOffset = r * 0.34;
  const eyeY = cy - r * 0.1;
  const eyeR = r * 0.2;

  // Eye whites
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x - eyeOffset, eyeY, eyeR, 0, Math.PI * 2);
  ctx.arc(x + eyeOffset, eyeY, eyeR, 0, Math.PI * 2);
  ctx.fill();

  // Green / Hazel Iris
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.arc(x - eyeOffset, eyeY, eyeR * 0.75, 0, Math.PI * 2);
  ctx.arc(x + eyeOffset, eyeY, eyeR * 0.75, 0, Math.PI * 2);
  ctx.fill();

  // Black pupils
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(x - eyeOffset, eyeY, eyeR * 0.45, 0, Math.PI * 2);
  ctx.arc(x + eyeOffset, eyeY, eyeR * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Pupil gleam / highlights
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x - eyeOffset - 2, eyeY - 2, eyeR * 0.22, 0, Math.PI * 2);
  ctx.arc(x + eyeOffset - 2, eyeY - 2, eyeR * 0.22, 0, Math.PI * 2);
  ctx.fill();

  // Cute pink nose
  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.moveTo(x, cy + r * 0.08);
  ctx.lineTo(x - 4, cy + r * 0.02);
  ctx.lineTo(x + 4, cy + r * 0.02);
  ctx.closePath();
  ctx.fill();

  // Mouth
  ctx.strokeStyle = '#7C2D12';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(x - 4, cy + r * 0.16, 4, 0, Math.PI);
  ctx.arc(x + 4, cy + r * 0.16, 4, 0, Math.PI);
  ctx.stroke();

  // Whiskers
  ctx.strokeStyle = '#7C2D12';
  ctx.lineWidth = 1.2;
  // Left whiskers
  ctx.beginPath();
  ctx.moveTo(x - r * 0.35, cy + r * 0.1);
  ctx.lineTo(x - r * 0.9, cy + r * 0.05);
  ctx.moveTo(x - r * 0.35, cy + r * 0.18);
  ctx.lineTo(x - r * 0.85, cy + r * 0.25);
  // Right whiskers
  ctx.moveTo(x + r * 0.35, cy + r * 0.1);
  ctx.lineTo(x + r * 0.9, cy + r * 0.05);
  ctx.moveTo(x + r * 0.35, cy + r * 0.18);
  ctx.lineTo(x + r * 0.85, cy + r * 0.25);
  ctx.stroke();

  // Little collar bell
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(x, cy + r * 0.75, 5, 0, Math.PI * 2);
  ctx.fill();

  // Touch focus ring if dragging
  if (isDragging) {
    ctx.strokeStyle = '#6366F1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, cy, r + 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

/** Draws Chirpy the little songbird. */
function drawBird(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, isDragging: boolean, time: number) {
  ctx.save();
  const lift = isDragging ? -8 : 0;
  const cy = y + lift;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(x, y + r + 4, r * 0.6, r * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing flap
  const wingOffset = Math.sin(time * 8) * 4;

  // Body (bright sky blue)
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.arc(x, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Chest / Belly (sunny yellow)
  ctx.fillStyle = '#FCD34D';
  ctx.beginPath();
  ctx.arc(x - r * 0.2, cy + r * 0.2, r * 0.6, 0, Math.PI * 2);
  ctx.fill();

  // Wing
  ctx.fillStyle = '#0369A1';
  ctx.beginPath();
  ctx.ellipse(x + r * 0.2, cy + wingOffset, r * 0.55, r * 0.35, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Beak (golden orange)
  ctx.fillStyle = '#EA580C';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.7, cy - r * 0.1);
  ctx.lineTo(x - r * 1.25, cy);
  ctx.lineTo(x - r * 0.7, cy + r * 0.15);
  ctx.closePath();
  ctx.fill();

  // Eye
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x - r * 0.35, cy - r * 0.2, r * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(x - r * 0.4, cy - r * 0.2, r * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Draws Sheru the playful golden puppy. */
function drawPuppy(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, isDragging: boolean, time: number) {
  ctx.save();
  const lift = isDragging ? -8 : 0;
  const cy = y + lift;

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(x, y + r + 4, r * 0.7, r * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail wag
  const tailAngle = Math.sin(time * 6) * 0.4;
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + r * 0.5, cy + r * 0.2);
  ctx.lineTo(x + r * 0.9 + tailAngle * 10, cy - r * 0.4);
  ctx.stroke();

  // Puppy head / body (warm golden)
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.arc(x, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Floppy chocolate ears
  ctx.fillStyle = '#92400E';
  // Left ear
  ctx.beginPath();
  ctx.ellipse(x - r * 0.7, cy - r * 0.1, r * 0.3, r * 0.65, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Right ear
  ctx.beginPath();
  ctx.ellipse(x + r * 0.7, cy - r * 0.1, r * 0.3, r * 0.65, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // White muzzle
  ctx.fillStyle = '#FEF3C7';
  ctx.beginPath();
  ctx.ellipse(x, cy + r * 0.25, r * 0.45, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Big black puppy nose
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.ellipse(x, cy + r * 0.12, r * 0.16, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Friendly tongue
  ctx.fillStyle = '#F43F5E';
  ctx.beginPath();
  ctx.ellipse(x, cy + r * 0.45, 6, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  const eyeR = r * 0.18;
  ctx.fillStyle = '#1E293B';
  ctx.beginPath();
  ctx.arc(x - r * 0.3, cy - r * 0.15, eyeR, 0, Math.PI * 2);
  ctx.arc(x + r * 0.3, cy - r * 0.15, eyeR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x - r * 0.33, cy - r * 0.18, eyeR * 0.35, 0, Math.PI * 2);
  ctx.arc(x + r * 0.27, cy - r * 0.18, eyeR * 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Draws traditional Indian terracotta clay pot (Matka). */
function drawClayPot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.save();
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(x, y + r + 2, r * 0.6, r * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Terracotta bulb body
  ctx.fillStyle = '#C2410C';
  ctx.beginPath();
  ctx.arc(x, y + r * 0.1, r * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Neck and rim
  ctx.fillStyle = '#9A3412';
  ctx.fillRect(x - r * 0.35, y - r * 0.85, r * 0.7, r * 0.3);

  // Top lip
  ctx.fillStyle = '#C2410C';
  ctx.beginPath();
  ctx.ellipse(x, y - r * 0.85, r * 0.45, r * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Traditional decorative band
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y + r * 0.1, r * 0.85, -0.4, 0.4);
  ctx.stroke();

  ctx.restore();
}

/* ── Scene Landmark Rendering ── */

/** Draws the cozy desert / village tent with open door and rug. */
function drawTent(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, isHoveredInside: boolean) {
  ctx.save();

  // Shadow under tent
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 4, w * 0.52, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outer tent canvas (warm terracotta stripes)
  ctx.fillStyle = '#EA580C';
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
  ctx.fill();

  // Cream stripes on tent
  ctx.fillStyle = '#FEF3C7';
  for (let i = 1; i <= 3; i++) {
    const fraction = i / 4;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y);
    ctx.lineTo(x + w * fraction - 12, y + h);
    ctx.lineTo(x + w * fraction + 12, y + h);
    ctx.closePath();
    ctx.fill();
  }

  // Open doorway flap (darker cozy interior)
  const doorW = w * 0.48;
  const doorH = h * 0.65;
  const doorX = x + (w - doorW) / 2;
  const doorY = y + h - doorH;

  ctx.fillStyle = isHoveredInside ? '#451A03' : '#292524';
  ctx.beginPath();
  ctx.moveTo(x + w / 2, doorY);
  ctx.lineTo(doorX, y + h);
  ctx.lineTo(doorX + doorW, y + h);
  ctx.closePath();
  ctx.fill();

  // Patterned warm rug inside the tent doorway
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 14, doorW * 0.42, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Rug fringe / pattern
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h - 14, doorW * 0.32, 9, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Wooden center pole tip
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - 10);
  ctx.lineTo(x + w / 2, y + 10);
  ctx.stroke();

  // Small flag on top
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y - 10);
  ctx.lineTo(x + w / 2 + 18, y - 4);
  ctx.lineTo(x + w / 2, y + 2);
  ctx.closePath();
  ctx.fill();

  // Inside label badge
  ctx.fillStyle = isHoveredInside ? '#10B981' : 'rgba(255,255,255,0.85)';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('INSIDE (अंदर)', x + w / 2, doorY + doorH * 0.35);

  ctx.restore();
}

/** Draws the big banyan / mango tree with top nest and bottom roots. */
function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, isHoveredTop: boolean, isHoveredBottom: boolean) {
  ctx.save();

  // Tree trunk
  ctx.fillStyle = '#78350F';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.38, y + h);
  ctx.lineTo(x + w * 0.42, y + h * 0.45);
  ctx.lineTo(x + w * 0.58, y + h * 0.45);
  ctx.lineTo(x + w * 0.62, y + h);
  ctx.closePath();
  ctx.fill();

  // Sturdy roots at bottom
  ctx.fillStyle = isHoveredBottom ? '#10B981' : '#78350F';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.3, y + h);
  ctx.quadraticCurveTo(x + w * 0.4, y + h - 16, x + w * 0.5, y + h);
  ctx.quadraticCurveTo(x + w * 0.6, y + h - 16, x + w * 0.7, y + h);
  ctx.closePath();
  ctx.fill();

  // Bottom tree zone badge
  ctx.fillStyle = isHoveredBottom ? '#047857' : '#475569';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BOTTOM (नीचे)', x + w / 2, y + h + 16);

  // Big lush foliage cloud canopy
  ctx.fillStyle = isHoveredTop ? '#15803D' : '#16A34A';
  ctx.beginPath();
  // Multi-arc cloud tree
  ctx.arc(x + w * 0.5, y + h * 0.3, w * 0.36, 0, Math.PI * 2);
  ctx.arc(x + w * 0.3, y + h * 0.35, w * 0.26, 0, Math.PI * 2);
  ctx.arc(x + w * 0.7, y + h * 0.35, w * 0.26, 0, Math.PI * 2);
  ctx.arc(x + w * 0.5, y + h * 0.16, w * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // Top Bird Nest
  const nestX = x + w * 0.5;
  const nestY = y + h * 0.14;
  ctx.fillStyle = '#92400E';
  ctx.beginPath();
  ctx.arc(nestX, nestY, 22, 0, Math.PI);
  ctx.closePath();
  ctx.fill();

  // Twigs texture
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(nestX - 18, nestY);
  ctx.lineTo(nestX + 18, nestY);
  ctx.stroke();

  // Top zone badge
  ctx.fillStyle = isHoveredTop ? '#FEF08A' : '#FFFFFF';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TOP (ऊपर)', nestX, nestY - 14);

  ctx.restore();
}

/** Draws village cottage house and lilypad pond. */
function drawHouseAndPond(ctx: CanvasRenderingContext2D, hx: number, hy: number, px: number, py: number) {
  ctx.save();

  // 1. Village House
  const hw = 100;
  const hh = 80;

  // Roof
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.moveTo(hx + hw / 2, hy);
  ctx.lineTo(hx - 10, hy + 38);
  ctx.lineTo(hx + hw + 10, hy + 38);
  ctx.closePath();
  ctx.fill();

  // Chimney
  ctx.fillStyle = '#991B1B';
  ctx.fillRect(hx + hw * 0.7, hy + 8, 14, 24);

  // House walls
  ctx.fillStyle = '#FEF3C7';
  ctx.fillRect(hx, hy + 38, hw, hh - 38);

  // Door
  ctx.fillStyle = '#78350F';
  ctx.fillRect(hx + 38, hy + 50, 24, 30);

  // Window
  ctx.fillStyle = '#60A5FA';
  ctx.fillRect(hx + 10, hy + 48, 18, 18);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(hx + 10, hy + 48, 18, 18);

  // Label: Near House
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NEAR (घर के पास)', hx + hw / 2, hy + hh + 16);

  // 2. Lilypad Pond (Far away)
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.ellipse(px, py, 60, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#0284C7';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Lilypad
  ctx.fillStyle = '#16A34A';
  ctx.beginPath();
  ctx.arc(px - 14, py - 4, 10, 0, Math.PI * 1.8);
  ctx.lineTo(px - 14, py - 4);
  ctx.fill();

  // Pond label: Far
  ctx.fillStyle = '#0369A1';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FAR (दूर - तालाब)', px, py + 38);

  ctx.restore();
}

/** Draws 3-tier rustic clay pot shelf. */
function drawShelf(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = '#78350F';

  // Vertical posts
  ctx.fillRect(x, y, 8, h);
  ctx.fillRect(x + w - 8, y, 8, h);

  // Top Shelf
  ctx.fillRect(x - 6, y + 14, w + 12, 8);
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('TOP SHELF', x + w / 2, y + 8);

  // Middle Shelf
  ctx.fillStyle = '#78350F';
  ctx.fillRect(x - 6, y + h * 0.5, w + 12, 8);

  // Bottom Shelf
  ctx.fillRect(x - 6, y + h - 14, w + 12, 8);
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('BOTTOM SHELF', x + w / 2, y + h + 14);

  ctx.restore();
}

/* ═══════════════════════════════════════════════════════════════
   SIMULATION ENGINE DEFINITION
   ═══════════════════════════════════════════════════════════════ */

export const spatialFurryCat: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class1-spatial-furry-cat',
  title: 'Finding the Furry Cat! (Inside / Outside, Top / Bottom, Near / Far)',
  band: 'GRADES_1_8',
  level: 'class-1',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '🐱',
  topic: 'Spatial Relationships',
  shortDescription:
    'Playful interactive kitten, tent, tree, and pond simulation to master Inside/Outside, Top/Bottom, and Near/Far concepts.',
  detailedDescription:
    'Aligined with NCERT Class 1 Mathematics Chapter 1 ("Shapes and Space"). Children help Mitthu the furry kitten, Chirpy the bird, and Sheru the puppy navigate warm tents, tall trees, and village meadows. Employs large 64px touch targets, cheerful sound effects, speech synthesis, and zero reading penalty.',
  learningObjectives: [
    'Distinguish and apply the concepts of Inside and Outside',
    'Identify Top and Bottom spatial positions on trees and shelves',
    'Evaluate relative distance: Near and Far from reference landmarks',
    'Develop spatial vocabulary through tactile manipulation and audio read-aloud prompts',
  ],
  parameters: [
    P.select('challenge', 'Challenge Mode', [
      ['inside-outside', '1. Inside or Outside? (तंबू के अंदर/बाहर)'],
      ['top-bottom', '2. Top or Bottom? (पेड़ के ऊपर/नीचे)'],
      ['near-far', '3. Near or Far? (घर के पास/दूर)'],
      ['free-play', '4. Free Exploration (खुला खेल)'],
    ]),
    P.select('lang', 'Audio Language', [
      ['en-IN', 'English (Indian accent)'],
      ['hi-IN', 'Hindi (हिंदी)'],
    ]),
    P.toggle('voicePrompt', 'Auto Voiceover', true),
  ],
  metrics: [
    metric('stars', 'Stars Earned', (s) => '⭐'.repeat(Math.max(1, s.starsEarned || 1))),
    metric('status', 'Current Location', (s) => s.statusBadge || 'Exploring Meadow'),
    metric('tasks', 'Challenges Completed', (s) => `${s.completedTasks || 0} / 6`),
  ],
  tags: ['shapes and space', 'spatial relationships', 'inside outside', 'top bottom', 'near far', 'class 1', 'ncert'],

  engine: {
    createInitialState: (params, width, height): SpatialSimState => {
      const mode = (params.challenge as SpatialChallengeMode) || 'inside-outside';
      const w = width || 800;
      const h = height || 500;

      const state: SpatialSimState = {
        mode,
        stepIndex: 1,
        starsEarned: 1,
        completedTasks: 0,
        isCelebrating: false,
        celebrationMessage: 'Shabash! Well Done! ⭐',
        particles: [],
        time: 0,

        // Characters initial spawn points
        cat: {
          id: 'cat',
          name: 'Mitthu the Cat',
          hindiName: 'मिट्ठू बिल्ली',
          x: w * 0.18,
          y: h * 0.65,
          radius: 36, // 72px touch target
          isDragging: false,
          currentZone: 'outside_tent',
          dragStartX: w * 0.18,
          dragStartY: h * 0.65,
        },
        bird: {
          id: 'bird',
          name: 'Chirpy the Bird',
          hindiName: 'चीकू चिड़िया',
          x: w * 0.52,
          y: h * 0.68,
          radius: 30, // 60px touch target
          isDragging: false,
          currentZone: null,
          dragStartX: w * 0.52,
          dragStartY: h * 0.68,
        },
        puppy: {
          id: 'puppy',
          name: 'Sheru the Puppy',
          hindiName: 'शेरू कुत्ता',
          x: w * 0.82,
          y: h * 0.65,
          radius: 34, // 68px touch target
          isDragging: false,
          currentZone: null,
          dragStartX: w * 0.82,
          dragStartY: h * 0.65,
        },
        pot: {
          id: 'pot',
          name: 'Clay Pot',
          hindiName: 'मिट्टी का घड़ा',
          x: w * 0.68,
          y: h * 0.72,
          radius: 28,
          isDragging: false,
          currentZone: 'bottom_shelf',
          dragStartX: w * 0.68,
          dragStartY: h * 0.72,
        },

        activeDragId: null,
        dragOffsetX: 0,
        dragOffsetY: 0,
        hoveredZoneId: null,
        promptText: 'Put the furry cat INSIDE the cozy tent!',
        promptHindiText: 'बिल्ली को तंबू के अंदर रखिए!',
        speakerBounds: null,
        repeatBounds: null,
        isSpeakerActive: false,
      };

      // Set initial prompts based on selected challenge
      if (mode === 'top-bottom') {
        state.promptText = 'Place Chirpy the bird at the TOP of the tree!';
        state.promptHindiText = 'चिड़िया को पेड़ के सबसे ऊपर रखिए!';
      } else if (mode === 'near-far') {
        state.promptText = 'Guide Sheru the puppy NEAR the cozy house!';
        state.promptHindiText = 'कुत्ते को घर के पास ले जाइए!';
      } else if (mode === 'free-play') {
        state.promptText = 'Move any friend anywhere to hear where they are!';
        state.promptHindiText = 'किसी भी दोस्त को घुमाइए और सुनिए वो कहाँ हैं!';
      }

      // Auto speak initial prompt if voice assistance is on
      if (params.voicePrompt) {
        setTimeout(() => {
          const textToSpeak = params.lang === 'hi-IN' ? state.promptHindiText : state.promptText;
          FoundationalNarrator.speak(textToSpeak, { lang: params.lang || 'en-IN' });
        }, 400);
      }

      return state;
    },

    reset: (params, width, height) => {
      FoundationalAudio.playDrop();
      return (spatialFurryCat.engine as any).createInitialState(params, width, height);
    },

    update: (state: SpatialSimState, _params, dt, _width, _height) => {
      state.time += dt;

      // Update particle physics if celebrating
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

    render: (ctx, width, height, state: SpatialSimState, params) => {
      const w = width;
      const h = height;

      // 1. Sky & Sun
      ctx.fillStyle = '#E0F2FE';
      ctx.fillRect(0, 0, w, h * 0.58);

      // Warm smiling sun
      const sunX = w * 0.88;
      const sunY = h * 0.18;
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 34, 0, Math.PI * 2);
      ctx.fill();

      // Sun rays
      ctx.strokeStyle = '#FDE68A';
      ctx.lineWidth = 3;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + state.time * 0.2;
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(a) * 40, sunY + Math.sin(a) * 40);
        ctx.lineTo(sunX + Math.cos(a) * 52, sunY + Math.sin(a) * 52);
        ctx.stroke();
      }

      // Soft clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(w * 0.18 + Math.sin(state.time * 0.2) * 10, h * 0.16, 26, 0, Math.PI * 2);
      ctx.arc(w * 0.22 + Math.sin(state.time * 0.2) * 10, h * 0.14, 34, 0, Math.PI * 2);
      ctx.arc(w * 0.26 + Math.sin(state.time * 0.2) * 10, h * 0.16, 26, 0, Math.PI * 2);
      ctx.fill();

      // 2. Rolling Green Hills Meadow
      ctx.fillStyle = '#86EFAC';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.58);
      ctx.quadraticCurveTo(w * 0.25, h * 0.52, w * 0.5, h * 0.58);
      ctx.quadraticCurveTo(w * 0.75, h * 0.64, w, h * 0.56);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Foreground Grass Lawn
      ctx.fillStyle = '#4ADE80';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.62);
      ctx.quadraticCurveTo(w * 0.5, h * 0.58, w, h * 0.64);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // 3. Landmarks
      // Tent (Inside / Outside Landmark)
      const tentW = 150;
      const tentH = 135;
      const tentX = w * 0.08;
      const tentY = h * 0.58 - tentH * 0.75;
      drawTent(ctx, tentX, tentY, tentW, tentH, state.hoveredZoneId === 'inside_tent');

      // Tree (Top / Bottom Landmark)
      const treeW = 170;
      const treeH = 210;
      const treeX = w * 0.36;
      const treeY = h * 0.6 - treeH * 0.85;
      drawTree(
        ctx,
        treeX,
        treeY,
        treeW,
        treeH,
        state.hoveredZoneId === 'top_tree',
        state.hoveredZoneId === 'bottom_tree'
      );

      // Cottage House & Far Pond
      const houseX = w * 0.68;
      const houseY = h * 0.42;
      const pondX = w * 0.9;
      const pondY = h * 0.62;
      drawHouseAndPond(ctx, houseX, houseY, pondX, pondY);

      // Shelf (Mode 2 Pot Stacking)
      if (state.mode === 'top-bottom') {
        drawShelf(ctx, w * 0.62, h * 0.48, 64, 88);
      }

      // 4. Characters
      // Draw Clay pot if in top-bottom mode
      if (state.mode === 'top-bottom') {
        drawClayPot(ctx, state.pot.x, state.pot.y, state.pot.radius);
      }

      // Draw Bird
      drawBird(ctx, state.bird.x, state.bird.y, state.bird.radius, state.bird.isDragging, state.time);

      // Draw Puppy
      drawPuppy(ctx, state.puppy.x, state.puppy.y, state.puppy.radius, state.puppy.isDragging, state.time);

      // Draw Mitthu the Cat (Primary Hero)
      drawKitten(ctx, state.cat.x, state.cat.y, state.cat.radius, state.cat.isDragging, state.time);

      // 5. Instruction Header Banner (Speech synthesis interactive pill)
      const isHindi = params.lang === 'hi-IN';
      const promptToDisplay = isHindi ? state.promptHindiText : state.promptText;
      const subPrompt = isHindi ? state.promptText : state.promptHindiText;

      const { speakerBounds } = drawInstructionBanner(ctx, w, promptToDisplay, {
        y: 48,
        speakerActive: state.isSpeakerActive,
        step: `Step ${state.stepIndex}/2`,
        subPrompt,
      });
      state.speakerBounds = speakerBounds;

      // 6. Confetti & Celebration Overlay
      if (state.isCelebrating) {
        drawCelebrationOverlay(ctx, w, h, state.celebrationMessage, state.starsEarned, state.particles);
      }
    },

    /* ── Touch & Pointer Handlers ── */

    onPointerDown: (x, y, state: SpatialSimState, params) => {
      if (!state) return;

      // Check speaker button tap (reads prompt aloud)
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

      // If celebration modal is active, tap resets/advances challenge
      if (state.isCelebrating) {
        state.isCelebrating = false;
        state.particles = [];
        FoundationalAudio.playPop();
        return;
      }

      // Hit-test characters with generous hit slop (16px)
      const chars: CharacterToken[] = [state.cat, state.bird, state.puppy];
      if (state.mode === 'top-bottom') {
        chars.push(state.pot);
      }

      for (const char of chars) {
        if (FoundationalTouchHelper.hitTestCircle(x, y, char.x, char.y, char.radius, 16)) {
          char.isDragging = true;
          state.activeDragId = char.id;
          state.dragOffsetX = char.x - x;
          state.dragOffsetY = char.y - y;
          FoundationalAudio.playPop();
          break;
        }
      }
    },

    onPointerMove: (x, y, state: SpatialSimState, _params) => {
      if (!state || !state.activeDragId) return;

      const char =
        state.activeDragId === 'cat'
          ? state.cat
          : state.activeDragId === 'bird'
          ? state.bird
          : state.activeDragId === 'puppy'
          ? state.puppy
          : state.pot;

      if (!char) return;

      char.x = x + state.dragOffsetX;
      char.y = y + state.dragOffsetY;

      // Dynamic zone hover detection for visual feedback
      // Tent inside zone
      if (char.x > 80 && char.x < 220 && char.y > 240 && char.y < 350) {
        state.hoveredZoneId = 'inside_tent';
      } else if (char.x > 320 && char.x < 480 && char.y < 210) {
        state.hoveredZoneId = 'top_tree';
      } else if (char.x > 320 && char.x < 480 && char.y > 300) {
        state.hoveredZoneId = 'bottom_tree';
      } else {
        state.hoveredZoneId = null;
      }
    },

    onPointerUp: (state: SpatialSimState, params) => {
      if (!state || !state.activeDragId) return;

      const char =
        state.activeDragId === 'cat'
          ? state.cat
          : state.activeDragId === 'bird'
          ? state.bird
          : state.activeDragId === 'puppy'
          ? state.puppy
          : state.pot;

      if (!char) return;

      char.isDragging = false;
      const dragId = state.activeDragId;
      state.activeDragId = null;
      state.hoveredZoneId = null;

      // Evaluate spatial target completion
      const cx = char.x;
      const cy = char.y;

      let success = false;
      let announcedFeedback = '';
      let announcedHindi = '';

      if (state.mode === 'inside-outside') {
        if (state.stepIndex === 1) {
          // Task 1: Cat inside the tent
          if (dragId === 'cat' && cx > 70 && cx < 230 && cy > 220 && cy < 360) {
            success = true;
            char.x = 150; // Snap to rug
            char.y = 295;
            announcedFeedback = 'Super! Mitthu the cat is INSIDE the cozy tent!';
            announcedHindi = 'शाबाश! बिल्ली तंबू के अंदर आराम कर रही है!';
            state.stepIndex = 2;
            state.promptText = 'Now, let the cat play OUTSIDE on the green grass!';
            state.promptHindiText = 'अब बिल्ली को तंबू के बाहर घास पर खेलने दीजिए!';
          }
        } else if (state.stepIndex === 2) {
          // Task 2: Cat outside the tent
          if (dragId === 'cat' && (cx > 240 || cx < 50 || cy > 370)) {
            success = true;
            announcedFeedback = 'Hooray! The cat is playing OUTSIDE in the sun!';
            announcedHindi = 'बहुत बढ़िया! बिल्ली तंबू के बाहर मजे से खेल रही है!';
            state.completedTasks += 1;
            state.starsEarned = 3;
            state.isCelebrating = true;
            state.celebrationMessage = 'Shabash! Inside & Outside Master! ⭐';
          }
        }
      } else if (state.mode === 'top-bottom') {
        if (state.stepIndex === 1) {
          // Bird to top of tree
          if (dragId === 'bird' && cx > 300 && cx < 500 && cy < 220) {
            success = true;
            char.x = 405; // Snap to nest
            char.y = 145;
            announcedFeedback = 'Wonderful! Chirpy is at the TOP of the tree!';
            announcedHindi = 'शाबाश! चिड़िया पेड़ के सबसे ऊपर घोंसले में है!';
            state.stepIndex = 2;
            state.promptText = 'Now help Mitthu the cat sit at the BOTTOM of the tree!';
            state.promptHindiText = 'अब बिल्ली को पेड़ के नीचे बैठाइए!';
          }
        } else if (state.stepIndex === 2) {
          // Cat at bottom of tree
          if (dragId === 'cat' && cx > 300 && cx < 500 && cy > 290) {
            success = true;
            char.x = 400; // Snap under tree
            char.y = 350;
            announcedFeedback = 'Awesome! The cat is at the BOTTOM of the tree!';
            announcedHindi = 'शानदार! बिल्ली पेड़ के नीचे छाँव में है!';
            state.completedTasks += 1;
            state.starsEarned = 3;
            state.isCelebrating = true;
            state.celebrationMessage = 'Super! Top & Bottom Champion! ⭐';
          }
        }
      } else if (state.mode === 'near-far') {
        if (state.stepIndex === 1) {
          // Puppy near house
          if (dragId === 'puppy' && cx > 580 && cx < 760 && cy > 260 && cy < 420) {
            success = true;
            char.x = 650;
            char.y = 350;
            announcedFeedback = 'Great! Sheru the puppy is NEAR the cottage house!';
            announcedHindi = 'बहुत अच्छे! शेरू कुत्ता घर के बिल्कुल पास है!';
            state.stepIndex = 2;
            state.promptText = 'Now let the puppy run FAR away near the pond!';
            state.promptHindiText = 'अब कुत्ते को घर से दूर तालाब के पास ले जाइए!';
          }
        } else if (state.stepIndex === 2) {
          // Puppy far (near pond)
          if (dragId === 'puppy' && cx > 740 && cy > 280) {
            success = true;
            char.x = 810;
            char.y = 360;
            announcedFeedback = 'Splendid! The puppy is FAR from the house near the pond!';
            announcedHindi = 'कमाल कर दिया! कुत्ता घर से दूर तालाब के पास है!';
            state.completedTasks += 1;
            state.starsEarned = 3;
            state.isCelebrating = true;
            state.celebrationMessage = 'Fantastic! Near & Far Explorer! ⭐';
          }
        }
      } else {
        // Free Play mode: describe current spatial position
        if (cx > 70 && cx < 230 && cy > 220 && cy < 360) {
          announcedFeedback = `${char.name} is INSIDE the tent!`;
          announcedHindi = `${char.hindiName} तंबू के अंदर है!`;
        } else if (cx > 300 && cx < 500 && cy < 220) {
          announcedFeedback = `${char.name} is at the TOP of the tree!`;
          announcedHindi = `${char.hindiName} पेड़ के सबसे ऊपर है!`;
        } else if (cx > 300 && cx < 500 && cy > 290) {
          announcedFeedback = `${char.name} is at the BOTTOM of the tree!`;
          announcedHindi = `${char.hindiName} पेड़ के नीचे है!`;
        } else if (cx > 580 && cx < 760) {
          announcedFeedback = `${char.name} is NEAR the house!`;
          announcedHindi = `${char.hindiName} घर के पास है!`;
        } else if (cx > 760) {
          announcedFeedback = `${char.name} is FAR from the house, near the pond!`;
          announcedHindi = `${char.hindiName} घर से दूर तालाब के पास है!`;
        } else {
          announcedFeedback = `${char.name} is playing in the meadow!`;
          announcedHindi = `${char.hindiName} हरी घास पर खेल रहे हैं!`;
        }
        success = true;
      }

      if (success) {
        FoundationalAudio.playDrop();
        FoundationalAudio.playSuccessChime();

        if (state.isCelebrating) {
          FoundationalAudio.playCelebrationFanfare();
          state.particles = createConfettiBurst(800, 500, 48);
        }

        if (announcedFeedback) {
          const speakText = params.lang === 'hi-IN' ? announcedHindi : announcedFeedback;
          FoundationalNarrator.speak(speakText, { lang: params.lang || 'en-IN' });
        }
      } else {
        // Gentle non-punitive wobble retry tone
        FoundationalAudio.playGentleRetry();
      }
    },
  },
});

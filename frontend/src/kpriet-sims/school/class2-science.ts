/**
 * PIYUSHDHARA EDUVERSE — CLASS 2 SCIENCE & ENVIRONMENTAL DISCOVERY (FOUNDATIONAL STAGE)
 *
 * Mapped to NCERT Foundational Stage Learning Outcomes (NCF-FS 2022 / NCF-SE 2023)
 * Curricular Goals CG-8, CG-9, CG-10 (Surroundings, Observation, Classification, Care for Nature).
 *
 * SYLLABUS HONESTY NOTE:
 * NCERT Classes 1 & 2 do NOT have a standalone Science textbook. Environmental and
 * natural discovery is integrated experiential learning through observation, senses,
 * and everyday environment. This collection is clearly labeled as Integrated Discovery.
 *
 * Built with:
 * - Large touch targets (>= 64px)
 * - Multi-sensory Web Audio synthesis
 * - Bilingual audio narration
 * - Cause-and-effect physical manipulation
 * - 100% inside School Catalogue (isolated from college academic dashboards)
 */

import {
  defineSchool,
  metric,
  P,
  type SchoolSimulationDefinition,
  roundRect,
  circle,
  line,
  text,
  clear,
} from './kit';
import {
  FoundationalAudio,
  FoundationalNarrator,
  createConfettiBurst,
  drawInstructionBanner,
  drawCelebrationOverlay,
  type IParticle,
} from './foundational-kit';

/* ══════════════════════════════════════════════════════════════════════════
   S01 — LIVING, NON-LIVING, AND ONCE-LIVING SORTER
   Alignment: NCF-FS Curricular Goal CG-8 · Observation & Classification
   ══════════════════════════════════════════════════════════════════════════ */

interface SorterItem {
  id: string;
  name: string;
  emoji: string;
  category: 'living' | 'non-living' | 'once-living';
  hint: string;
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  isPlaced: boolean;
  placedCategory?: string;
}

interface LivingSorterState {
  items: SorterItem[];
  selectedItem: SorterItem | null;
  dragOffset: { x: number; y: number };
  score: number;
  totalPlaced: number;
  feedbackText: string;
  isCelebrating: boolean;
  particles: IParticle[];
  time: number;
}

const INITIAL_SORTER_ITEMS: Omit<SorterItem, 'x' | 'y' | 'homeX' | 'homeY' | 'isPlaced'>[] = [
  { id: 'cat', name: 'Kitten (बिल्ली)', emoji: '🐱', category: 'living', hint: 'Grows, breathes, and needs food!' },
  { id: 'tree', name: 'Neem Tree (पेड़)', emoji: '🌳', category: 'living', hint: 'Makes food with sunlight and grows!' },
  { id: 'stone', name: 'Stone (पत्थर)', emoji: '🪨', category: 'non-living', hint: 'Does not grow, breathe, or need food.' },
  { id: 'car', name: 'Toy Car (खिलौना)', emoji: '🚗', category: 'non-living', hint: 'It moves when pushed, but is NOT alive!' },
  { id: 'leaf', name: 'Fallen Leaf (सूखा पत्ता)', emoji: '🍂', category: 'once-living', hint: 'Was part of a living tree, but has dried!' },
  { id: 'pencil', name: 'Wooden Pencil (पेंसिल)', emoji: '✏️', category: 'once-living', hint: 'Made from wood that once came from a tree!' },
];

export const class2LivingSorter: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class2-living-sorter',
  title: 'Living, Non-Living & Once-Living Sorter',
  band: 'GRADES_1_8',
  level: 'class-2',
  subject: 'Science',
  category: 'school science',
  icon: '🌱',
  topic: 'Observation & Natural World Classification',
  shortDescription: 'Hands-on classification of living things, non-living objects, and things made from once-living nature (NCF-FS CG-8).',
  detailedDescription: 'Children sort everyday items into Living, Non-living, and Once-living categories. Teaches that moving toys are not alive, and wooden items came from once-living trees.',
  learningObjectives: [
    'Distinguish living things from non-living objects using observable features (NCF-FS CG-8)',
    'Understand that objects made of wood or dried leaves are once-living materials',
    'Recognize that autonomous movement alone does not define living things (e.g. toy cars)',
  ],
  parameters: [
    P.select('lang', 'Audio Language', [
      ['en-IN', 'English (Indian accent)'],
      ['hi-IN', 'Hindi (हिंदी)'],
    ]),
  ],
  metrics: [
    metric('placed', 'Items Placed', (s) => `${s.totalPlaced || 0} / 6`),
    metric('score', 'Correct Items', (s) => `${s.score || 0}`),
  ],
  tags: ['class 2', 'science', 'integrated discovery', 'living non-living', 'classification', 'ncf-fs'],

  engine: {
    createInitialState: (_params, width, height): LivingSorterState => {
      const w = width || 800;
      const h = height || 500;
      const items: SorterItem[] = INITIAL_SORTER_ITEMS.map((item, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        const hx = w * 0.08 + col * 95;
        const hy = h * 0.58 + row * 85;
        return {
          ...item,
          x: hx,
          y: hy,
          homeX: hx,
          homeY: hy,
          isPlaced: false,
        };
      });

      FoundationalNarrator.speak('Sort the items into Living, Non-living, or Once-living bins!');

      return {
        items,
        selectedItem: null,
        dragOffset: { x: 0, y: 0 },
        score: 0,
        totalPlaced: 0,
        feedbackText: 'Drag an object or card into the matching basket!',
        isCelebrating: false,
        particles: [],
        time: 0,
      };
    },

    reset: (s) => {
      s.items.forEach((it: SorterItem) => {
        it.x = it.homeX;
        it.y = it.homeY;
        it.isPlaced = false;
        delete it.placedCategory;
      });
      s.totalPlaced = 0;
      s.score = 0;
      s.isCelebrating = false;
      return s;
    },

    update: (s, _params, dt) => {
      s.time += dt;
      if (s.isCelebrating) {
        s.particles.forEach((p: IParticle) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.alpha = Math.max(0, p.alpha - dt * 0.4);
        });
        s.particles = s.particles.filter((p: IParticle) => p.alpha > 0);
      }
      return s;
    },

    render: (ctx, width, height, s) => {
      const w = width;
      const h = height;
      clear(ctx, w, h);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, w, h);

      drawInstructionBanner(
        ctx,
        w,
        'Living, Non-Living & Once-Living Sorter (सजीव और निर्जीव)',
        { subPrompt: s.feedbackText, y: 16 }
      );

      const bins = [
        { id: 'living', title: '🌱 Living (सजीव)', sub: 'Breathes, grows, feeds', color: '#10B981', x: w * 0.38, y: 90, w: w * 0.19, h: 220 },
        { id: 'non-living', title: '🪨 Non-Living (निर्जीव)', sub: 'Never alive, rock/metal', color: '#64748B', x: w * 0.58, y: 90, w: w * 0.19, h: 220 },
        { id: 'once-living', title: '🍂 Once-Living (भूतपूर्व)', sub: 'From plants/wood', color: '#F59E0B', x: w * 0.78, y: 90, w: w * 0.19, h: 220 },
      ];

      bins.forEach((b) => {
        roundRect(ctx, b.x, b.y, b.w, b.h, 16, `${b.color}22`, b.color, 2);
        roundRect(ctx, b.x, b.y, b.w, 38, 16, `${b.color}44`);
        text(ctx, b.title, b.x + b.w / 2, b.y + 20, { color: '#F8FAFC', size: 12, weight: 700 });
        text(ctx, b.sub, b.x + b.w / 2, b.y + 50, { color: '#94A3B8', size: 10, weight: 500 });

        const placedInThis = s.items.filter((i: SorterItem) => i.isPlaced && i.placedCategory === b.id);
        text(ctx, `Placed: ${placedInThis.length}`, b.x + b.w / 2, b.y + b.h - 14, {
          color: b.color,
          size: 12,
          weight: 700,
        });
      });

      // Tray area for unplaced items
      roundRect(ctx, w * 0.05, 90, w * 0.30, h * 0.78, 16, '#1E293B', '#334155', 2);
      text(ctx, '📦 Object Tray (वस्तुएं)', w * 0.20, 118, { color: '#38BDF8', size: 14, weight: 700 });

      s.items.forEach((item: SorterItem) => {
        if (item === s.selectedItem) return;
        roundRect(ctx, item.x, item.y, 82, 70, 12, item.isPlaced ? '#065F46' : '#334155', item.isPlaced ? '#10B981' : '#64748B', 2);
        text(ctx, item.emoji, item.x + 41, item.y + 30, { size: 26 });
        text(ctx, item.name.split(' ')[0] ?? item.name, item.x + 41, item.y + 56, { color: '#F8FAFC', size: 10, weight: 700 });
      });

      if (s.selectedItem) {
        const it = s.selectedItem;
        roundRect(ctx, it.x - 4, it.y - 4, 90, 78, 14, '#38BDF844', '#38BDF8', 3);
        roundRect(ctx, it.x, it.y, 82, 70, 12, '#1E293B', '#38BDF8', 2);
        text(ctx, it.emoji, it.x + 41, it.y + 30, { size: 28 });
        text(ctx, it.name.split(' ')[0] ?? it.name, it.x + 41, it.y + 56, { color: '#38BDF8', size: 11, weight: 700 });
      }

      // Reset button
      roundRect(ctx, w * 0.82, h * 0.88, 100, 42, 10, '#334155', '#475569', 1);
      text(ctx, '🔄 Reset All', w * 0.82 + 50, h * 0.88 + 21, { color: '#F8FAFC', size: 12, weight: 700 });

      if (s.isCelebrating) {
        drawCelebrationOverlay(ctx, w, h, 'Outstanding Naturalist! 🌟', 3, s.particles);
      }
    },

    onPointerDown: (x, y, s) => {
      if (s.isCelebrating) {
        s.isCelebrating = false;
        return;
      }
      const w = 800;
      const h = 500;

      // Check reset
      if (x >= w * 0.82 && x <= w * 0.82 + 100 && y >= h * 0.88 && y <= h * 0.88 + 42) {
        s.items.forEach((it: SorterItem) => {
          it.x = it.homeX;
          it.y = it.homeY;
          it.isPlaced = false;
          delete it.placedCategory;
        });
        s.totalPlaced = 0;
        s.score = 0;
        s.feedbackText = 'Tray reset! Sort each item into its correct bin.';
        FoundationalAudio.playPop();
        return;
      }

      for (let i = s.items.length - 1; i >= 0; i--) {
        const item = s.items[i];
        if (x >= item.x && x <= item.x + 82 && y >= item.y && y <= item.y + 70) {
          s.selectedItem = item;
          s.dragOffset = { x: x - item.x, y: y - item.y };
          FoundationalAudio.playPop();
          FoundationalNarrator.speak(`${item.name}. ${item.hint}`);
          s.feedbackText = `${item.name}: ${item.hint}`;
          break;
        }
      }
    },

    onPointerMove: (x, y, s) => {
      if (s.selectedItem) {
        s.selectedItem.x = x - s.dragOffset.x;
        s.selectedItem.y = y - s.dragOffset.y;
      }
    },

    onPointerUp: (s) => {
      if (!s.selectedItem) return;
      const item = s.selectedItem;
      const w = 800;

      const bins = [
        { id: 'living', x: w * 0.38, y: 90, w: w * 0.19, h: 220 },
        { id: 'non-living', x: w * 0.58, y: 90, w: w * 0.19, h: 220 },
        { id: 'once-living', x: w * 0.78, y: 90, w: w * 0.19, h: 220 },
      ];

      const droppedInBin = bins.find(
        (b) => item.x + 40 >= b.x && item.x + 40 <= b.x + b.w && item.y + 35 >= b.y && item.y + 35 <= b.y + b.h
      );

      if (droppedInBin) {
        if (droppedInBin.id === item.category) {
          item.isPlaced = true;
          item.placedCategory = droppedInBin.id;
          const placedInBin = s.items.filter((i: SorterItem) => i.isPlaced && i.placedCategory === droppedInBin.id);
          item.x = droppedInBin.x + 15 + ((placedInBin.length - 1) % 2) * 60;
          item.y = droppedInBin.y + 70 + Math.floor((placedInBin.length - 1) / 2) * 65;

          FoundationalAudio.playSuccessChime();
          s.score++;
          s.totalPlaced++;
          s.feedbackText = `Correct! ${item.name} belongs to ${droppedInBin.id}! 🎉`;

          const allPlaced = s.items.every((i: SorterItem) => i.isPlaced);
          if (allPlaced) {
            s.isCelebrating = true;
            s.particles = createConfettiBurst(w, 500, 60);
            FoundationalAudio.playCelebrationFanfare();
          }
        } else {
          item.x = item.homeX;
          item.y = item.homeY;
          item.isPlaced = false;
          delete item.placedCategory;
          FoundationalAudio.playGentleRetry();
          s.feedbackText = `Not quite. ${item.hint} Try another bin!`;
        }
      } else {
        item.x = item.homeX;
        item.y = item.homeY;
      }

      s.selectedItem = null;
    },
  },
});

/* ══════════════════════════════════════════════════════════════════════════
   S02 — PLANT PARTS AND PLANT NEEDS GARDEN
   Alignment: NCF-FS Curricular Goal CG-8 · Living Things in Surroundings
   ══════════════════════════════════════════════════════════════════════════ */

interface PlantGardenState {
  hasRoots: boolean;
  hasStem: boolean;
  hasLeaves: boolean;
  hasFlower: boolean;
  waterLevel: number;
  sunlightLevel: number;
  plantGrowth: number;
  feedbackText: string;
  isCelebrating: boolean;
  particles: IParticle[];
  time: number;
}

export const class2PlantGarden: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class2-plant-garden',
  title: 'Plant Parts & Plant Needs Garden',
  band: 'GRADES_1_8',
  level: 'class-2',
  subject: 'Science',
  category: 'school science',
  icon: '🌸',
  topic: 'Plant Parts & Growth Requirements',
  shortDescription: 'Assemble roots, stem, leaves, and flowers, then balance sunlight, water, and soil to nurture the plant to bloom.',
  detailedDescription: 'Grounded in NCF-FS foundational discovery. Children assemble roots, stem, and leaves sequentially, then control sunlight and water levels to observe realistic growth cause-and-effect.',
  learningObjectives: [
    'Identify basic plant parts: roots, stem, leaves, flowers (NCF-FS CG-8)',
    'Understand why roots absorb water and hold the plant in soil',
    'Demonstrate that plants need balanced sunlight and water to produce flowers',
  ],
  parameters: [
    P.range('water', 'Water Pour (mL)', 0, 100, 30, 5, '%'),
    P.range('sun', 'Sunlight Exposure', 0, 100, 40, 5, '%'),
  ],
  metrics: [
    metric('growth', 'Plant Growth', (s) => `${Math.round(s.plantGrowth || 0)}%`),
    metric('flower', 'Flower Bloomed', (s) => (s.hasFlower ? 'YES 🌸' : 'GROWING... 🌱')),
  ],
  tags: ['class 2', 'science', 'plants', 'roots', 'leaves', 'sunlight', 'water', 'ncf-fs'],

  engine: {
    createInitialState: (params): PlantGardenState => {
      FoundationalNarrator.speak('Build the plant from soil to flower, then give it water and sunlight!');
      return {
        hasRoots: false,
        hasStem: false,
        hasLeaves: false,
        hasFlower: false,
        waterLevel: (params.water as number) || 30,
        sunlightLevel: (params.sun as number) || 40,
        plantGrowth: 15,
        feedbackText: 'Step 1: Add Roots first to anchor the plant in soil!',
        isCelebrating: false,
        particles: [],
        time: 0,
      };
    },

    reset: (s) => {
      s.hasRoots = false;
      s.hasStem = false;
      s.hasLeaves = false;
      s.hasFlower = false;
      s.plantGrowth = 15;
      s.isCelebrating = false;
      return s;
    },

    update: (s, params, dt) => {
      s.time += dt;
      if (params.water !== undefined) s.waterLevel = params.water as number;
      if (params.sun !== undefined) s.sunlightLevel = params.sun as number;

      if (s.hasRoots && s.hasStem && s.hasLeaves) {
        const optimalWater = s.waterLevel >= 40 && s.waterLevel <= 80;
        const optimalSun = s.sunlightLevel >= 40 && s.sunlightLevel <= 85;

        if (optimalWater && optimalSun) {
          if (s.plantGrowth < 100) {
            s.plantGrowth = Math.min(100, s.plantGrowth + dt * 15);
          }
          if (s.plantGrowth >= 100 && !s.hasFlower) {
            s.hasFlower = true;
            s.feedbackText = 'Wonderful! With balanced water and sunshine, your flower bloomed! 🌸';
            s.isCelebrating = true;
            s.particles = createConfettiBurst(800, 500, 50);
            FoundationalAudio.playCelebrationFanfare();
          }
        }
      }

      if (s.isCelebrating) {
        s.particles.forEach((p: IParticle) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.alpha = Math.max(0, p.alpha - dt * 0.4);
        });
        s.particles = s.particles.filter((p: IParticle) => p.alpha > 0);
      }
      return s;
    },

    render: (ctx, width, height, s) => {
      const w = width;
      const h = height;
      clear(ctx, w, h);
      ctx.fillStyle = '#0C1322';
      ctx.fillRect(0, 0, w, h);

      drawInstructionBanner(
        ctx,
        w,
        'Plant Parts & Plant Needs Garden (पौधे के भाग और आवश्यकताएं)',
        { subPrompt: s.feedbackText, y: 16 }
      );

      // Sun
      const sunBrightness = s.sunlightLevel / 100;
      const sunX = w * 0.72;
      const sunY = 120;
      circle(ctx, sunX, sunY, 32 + sunBrightness * 12, `rgba(251, 191, 36, ${0.4 + sunBrightness * 0.6})`);
      circle(ctx, sunX, sunY, 26, '#F59E0B');
      text(ctx, '☀️', sunX, sunY + 8, { size: 26 });

      // Soil Pot
      const groundY = h * 0.75;
      roundRect(ctx, w * 0.25, groundY, w * 0.50, h * 0.20, 16, '#78350F', '#92400E', 3);
      text(ctx, '🌱 Rich Soil (मिट्टी)', w * 0.50, groundY + 30, { color: '#FDE68A', size: 14, weight: 700 });

      // Plant Assembly
      const plantBaseX = w * 0.50;
      const stemTopY = groundY - 140 * (s.plantGrowth / 100);

      if (s.hasRoots) {
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(plantBaseX, groundY);
        ctx.lineTo(plantBaseX - 25, groundY + 45);
        ctx.moveTo(plantBaseX, groundY);
        ctx.lineTo(plantBaseX + 25, groundY + 45);
        ctx.moveTo(plantBaseX, groundY);
        ctx.lineTo(plantBaseX, groundY + 55);
        ctx.stroke();
        text(ctx, 'Roots (जड़ें)', plantBaseX + 45, groundY + 35, { color: '#FBBF24', size: 11, weight: 700 });
      }

      if (s.hasStem) {
        line(ctx, plantBaseX, groundY, plantBaseX, stemTopY, '#10B981', 8);
        text(ctx, 'Stem (तना)', plantBaseX - 45, (groundY + stemTopY) / 2, { color: '#34D399', size: 11, weight: 700 });
      }

      if (s.hasLeaves && s.hasStem) {
        const leafMidY = groundY - 60 * (s.plantGrowth / 100);
        circle(ctx, plantBaseX - 26, leafMidY, 18, '#059669');
        circle(ctx, plantBaseX + 26, leafMidY - 15, 18, '#059669');
        text(ctx, '🍃', plantBaseX - 26, leafMidY + 6, { size: 18 });
        text(ctx, '🍃', plantBaseX + 26, leafMidY - 9, { size: 18 });
      }

      if (s.hasFlower && s.hasStem) {
        circle(ctx, plantBaseX, stemTopY - 20, 24, '#EC4899');
        circle(ctx, plantBaseX, stemTopY - 20, 10, '#F59E0B');
        text(ctx, '🌸 Flower (फूल)', plantBaseX, stemTopY - 50, { color: '#F472B6', size: 12, weight: 700 });
      }

      // Left Panel: Plant Assembly Buttons
      roundRect(ctx, w * 0.04, 85, w * 0.18, h * 0.78, 14, '#1E293B', '#334155', 2);
      text(ctx, '🧩 Add Parts', w * 0.13, 110, { color: '#38BDF8', size: 13, weight: 700 });

      const parts = [
        { id: 'roots', label: '1. Add Roots', active: s.hasRoots, emoji: '🥕' },
        { id: 'stem', label: '2. Add Stem', active: s.hasStem, emoji: '🎋' },
        { id: 'leaves', label: '3. Add Leaves', active: s.hasLeaves, emoji: '🍃' },
      ];

      parts.forEach((p, idx) => {
        const btnY = 135 + idx * 60;
        roundRect(ctx, w * 0.05, btnY, w * 0.16, 48, 10, p.active ? '#065F46' : '#334155', p.active ? '#10B981' : '#64748B', 2);
        text(ctx, `${p.emoji} ${p.label}`, w * 0.13, btnY + 24, { color: '#F8FAFC', size: 11, weight: 700 });
      });

      // Right Panel: Sliders & Controls
      roundRect(ctx, w * 0.78, 85, w * 0.18, h * 0.78, 14, '#1E293B', '#334155', 2);
      text(ctx, '💧 Needs Lab', w * 0.87, 110, { color: '#38BDF8', size: 13, weight: 700 });
      text(ctx, `💧 Water: ${Math.round(s.waterLevel)}%`, w * 0.87, 145, { color: '#60A5FA', size: 12, weight: 700 });
      text(ctx, `☀️ Sunlight: ${Math.round(s.sunlightLevel)}%`, w * 0.87, 215, { color: '#FBBF24', size: 12, weight: 700 });
      text(ctx, `🌱 Growth: ${Math.round(s.plantGrowth)}%`, w * 0.87, 285, { color: '#34D399', size: 12, weight: 700 });

      if (s.isCelebrating) {
        drawCelebrationOverlay(ctx, w, h, 'Master Gardener! 🌸', 3, s.particles);
      }
    },

    onPointerDown: (x, y, s) => {
      if (s.isCelebrating) {
        s.isCelebrating = false;
        return;
      }
      const w = 800;

      // Add Roots
      if (x >= w * 0.05 && x <= w * 0.21 && y >= 135 && y <= 135 + 48) {
        s.hasRoots = true;
        FoundationalAudio.playPop();
        FoundationalNarrator.speak('Roots added! Roots hold the plant in soil and drink water.');
        s.feedbackText = 'Great! Now add the Stem so water can travel upward!';
      }

      // Add Stem
      if (x >= w * 0.05 && x <= w * 0.21 && y >= 195 && y <= 195 + 48) {
        if (!s.hasRoots) {
          FoundationalAudio.playGentleRetry();
          s.feedbackText = 'Roots must come first to anchor the stem in the soil!';
          return;
        }
        s.hasStem = true;
        FoundationalAudio.playPop();
        FoundationalNarrator.speak('Stem added! The stem carries water and supports leaves.');
        s.feedbackText = 'Awesome! Now add Leaves to catch sunlight!';
      }

      // Add Leaves
      if (x >= w * 0.05 && x <= w * 0.21 && y >= 255 && y <= 255 + 48) {
        if (!s.hasStem) {
          FoundationalAudio.playGentleRetry();
          s.feedbackText = 'Leaves grow on the stem! Add the stem first.';
          return;
        }
        s.hasLeaves = true;
        FoundationalAudio.playPop();
        FoundationalNarrator.speak('Leaves added! Leaves use green chlorophyll to make food using sunlight.');
        s.feedbackText = 'All parts ready! Use water (40-80%) and sunlight (40-85%) sliders to make it bloom!';
      }
    },
  },
});

/* ══════════════════════════════════════════════════════════════════════════
   S04 — HUMAN BODY AND FIVE SENSES EXPLORER
   Alignment: NCF-FS Curricular Goal CG-8 · Senses & Exploration
   ══════════════════════════════════════════════════════════════════════════ */

interface SenseItem {
  id: string;
  name: string;
  emoji: string;
  correctSense: 'sight' | 'hearing' | 'smell' | 'taste' | 'touch';
  prompt: string;
}

interface SensesState {
  currentItemIdx: number;
  items: SenseItem[];
  selectedSense: string | null;
  score: number;
  feedbackText: string;
  isCelebrating: boolean;
  particles: IParticle[];
  time: number;
}

const SENSE_TASKS: SenseItem[] = [
  { id: 'rainbow', name: 'Rainbow Colors (इंद्रधनुष)', emoji: '🌈', correctSense: 'sight', prompt: 'Which sense helps you see the seven beautiful colors?' },
  { id: 'bell', name: 'Temple Bell Ringing (घंटी की आवाज़)', emoji: '🔔', correctSense: 'hearing', prompt: 'Which sense tells you the chime of the ringing bell?' },
  { id: 'rose', name: 'Rose Flower Scent (गुलाब की खुशबू)', emoji: '🌹', correctSense: 'smell', prompt: 'Which sense identifies sweet fragrance from a flower?' },
  { id: 'lemon', name: 'Sour Lemon Juice (नींबू का रस)', emoji: '🍋', correctSense: 'taste', prompt: 'Which sense discovers that lemon juice is sour?' },
  { id: 'feather', name: 'Soft Silk & Feather (मुलायम पंख)', emoji: '🪶', correctSense: 'touch', prompt: 'Which sense feels whether something is soft, warm, or cold?' },
];

export const class2SensesExplorer: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class2-senses-explorer',
  title: 'Human Body & Five Senses Explorer',
  band: 'GRADES_1_8',
  level: 'class-2',
  subject: 'Science',
  category: 'school science',
  icon: '👁️',
  topic: 'The Five Senses & Safe Exploration',
  shortDescription: 'Discover how our eyes, ears, nose, tongue, and skin safely help us observe and learn about the world (NCF-FS CG-8).',
  detailedDescription: 'Safe multi-sensory matching lab. Children match everyday sights, sounds, scents, tastes, and textures to the correct sense organ without exposure to unsafe substances.',
  learningObjectives: [
    'Identify the five senses and their organs: eyes, ears, nose, tongue, skin (NCF-FS CG-8)',
    'Match sensory observations with the corresponding sense organ',
    'Follow personal safety rules: never smell unknown chemicals or touch hot surfaces',
  ],
  parameters: [],
  metrics: [
    metric('task', 'Task', (s) => `${(s.currentItemIdx || 0) + 1} / 5`),
    metric('score', 'Score', (s) => `${s.score || 0} ⭐`),
  ],
  tags: ['class 2', 'science', 'senses', 'eyes', 'ears', 'nose', 'tongue', 'skin', 'ncf-fs'],

  engine: {
    createInitialState: (): SensesState => {
      const firstTask = SENSE_TASKS[0]!;
      FoundationalNarrator.speak(firstTask.prompt);
      return {
        currentItemIdx: 0,
        items: SENSE_TASKS,
        selectedSense: null,
        score: 0,
        feedbackText: firstTask.prompt,
        isCelebrating: false,
        particles: [],
        time: 0,
      };
    },

    reset: (s) => {
      s.currentItemIdx = 0;
      s.score = 0;
      s.selectedSense = null;
      s.isCelebrating = false;
      return s;
    },

    update: (s, _params, dt) => {
      s.time += dt;
      if (s.isCelebrating) {
        s.particles.forEach((p: IParticle) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.alpha = Math.max(0, p.alpha - dt * 0.4);
        });
        s.particles = s.particles.filter((p: IParticle) => p.alpha > 0);
      }
      return s;
    },

    render: (ctx, width, height, s) => {
      const w = width;
      const h = height;
      clear(ctx, w, h);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, w, h);

      drawInstructionBanner(
        ctx,
        w,
        'Five Senses Explorer (हमारी पांच इंद्रियां)',
        { subPrompt: s.feedbackText, y: 16 }
      );

      const cur = s.items[s.currentItemIdx];

      // Exhibit Card
      roundRect(ctx, w * 0.32, 95, w * 0.36, 170, 16, '#1E293B', '#38BDF8', 2);
      text(ctx, cur.emoji, w * 0.50, 165, { size: 48 });
      text(ctx, cur.name, w * 0.50, 220, { color: '#F8FAFC', size: 15, weight: 700 });
      text(ctx, `Question ${s.currentItemIdx + 1} of ${s.items.length}`, w * 0.50, 245, { color: '#94A3B8', size: 11, weight: 500 });

      // 5 Senses Button Row at Bottom
      const senses = [
        { id: 'sight', label: 'Eyes (आंखें)', emoji: '👁️', sense: 'Sight' },
        { id: 'hearing', label: 'Ears (कान)', emoji: '👂', sense: 'Hearing' },
        { id: 'smell', label: 'Nose (नाक)', emoji: '👃', sense: 'Smell' },
        { id: 'taste', label: 'Tongue (जीभ)', emoji: '👅', sense: 'Taste' },
        { id: 'touch', label: 'Skin (त्वचा)', emoji: '✋', sense: 'Touch' },
      ];

      const btnW = 95;
      const btnH = 95;
      const startX = (w - (senses.length * 105 - 10)) / 2;
      const btnY = h * 0.64;

      senses.forEach((sn, idx) => {
        const bx = startX + idx * 105;
        const isSel = s.selectedSense === sn.id;
        roundRect(ctx, bx, btnY, btnW, btnH, 14, isSel ? '#0284C7' : '#1E293B', isSel ? '#38BDF8' : '#475569', 2);
        text(ctx, sn.emoji, bx + btnW / 2, btnY + 40, { size: 32 });
        text(ctx, sn.label.split(' ')[0] ?? sn.label, bx + btnW / 2, btnY + 70, { color: '#F8FAFC', size: 11, weight: 700 });
        text(ctx, sn.sense, bx + btnW / 2, btnY + 86, { color: '#94A3B8', size: 10, weight: 500 });
      });

      if (s.isCelebrating) {
        drawCelebrationOverlay(ctx, w, h, 'Super Sensory Scientist! 🌟', 3, s.particles);
      }
    },

    onPointerDown: (x, y, s) => {
      if (s.isCelebrating) {
        s.isCelebrating = false;
        return;
      }
      const w = 800;
      const h = 500;
      const senses = ['sight', 'hearing', 'smell', 'taste', 'touch'];
      const btnW = 95;
      const startX = (w - (senses.length * 105 - 10)) / 2;
      const btnY = h * 0.64;

      senses.forEach((snId, idx) => {
        const bx = startX + idx * 105;
        if (x >= bx && x <= bx + btnW && y >= btnY && y <= btnY + 95) {
          s.selectedSense = snId;
          const cur = s.items[s.currentItemIdx];

          if (snId === cur.correctSense) {
            FoundationalAudio.playSuccessChime();
            s.score++;
            s.feedbackText = `Correct! ${cur.correctSense.toUpperCase()} is the sense used for ${cur.name}! 🎉`;

            if (s.currentItemIdx < s.items.length - 1) {
              setTimeout(() => {
                s.currentItemIdx++;
                s.selectedSense = null;
                const nextTask = s.items[s.currentItemIdx];
                if (nextTask) {
                  s.feedbackText = nextTask.prompt;
                  FoundationalNarrator.speak(nextTask.prompt);
                }
              }, 1200);
            } else {
              s.isCelebrating = true;
              s.particles = createConfettiBurst(w, h, 60);
              FoundationalAudio.playCelebrationFanfare();
            }
          } else {
            FoundationalAudio.playGentleRetry();
            s.feedbackText = `Think carefully: does our ${snId} sense help here? Try again!`;
          }
        }
      });
    },
  },
});

/* ══════════════════════════════════════════════════════════════════════════
   S07 — WATER AROUND US: USES, SOURCES, AND SAVING WATER
   Alignment: NCF-FS Curricular Goal CG-9 · Care for Natural Environment
   ══════════════════════════════════════════════════════════════════════════ */

interface WaterStation {
  id: string;
  name: string;
  emoji: string;
  isLeaking: boolean;
  waterSaved: number;
}

interface WaterSaverState {
  stations: WaterStation[];
  totalSavedLitres: number;
  tankLevel: number;
  feedbackText: string;
  isCelebrating: boolean;
  particles: IParticle[];
  time: number;
}

export const class2WaterSaver: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class2-water-saver',
  title: 'Water Around Us & Water Conservation Lab',
  band: 'GRADES_1_8',
  level: 'class-2',
  subject: 'Science',
  category: 'school science',
  icon: '💧',
  topic: 'Water Uses, Conservation & Responsible Habits',
  shortDescription: 'Find leaking taps, turn off taps while brushing, and harvest rainwater to protect our precious water supply (NCF-FS CG-9).',
  detailedDescription: 'Teaches environmental stewardship. Children inspect simulated home and school scenes to fix dripping taps and route rainwater to fill the village water reservoir.',
  learningObjectives: [
    'Identify everyday uses and vital importance of clean water (NCF-FS CG-9)',
    'Practice water-saving habits: closing taps during brushing, repairing leaks',
    'Understand rainwater harvesting as a way to replenish water reserves',
  ],
  parameters: [],
  metrics: [
    metric('saved', 'Water Saved', (s) => `${s.totalSavedLitres || 0} L`),
    metric('tank', 'Tank Level', (s) => `${Math.round(s.tankLevel || 0)}%`),
  ],
  tags: ['class 2', 'science', 'water', 'conservation', 'environment', 'ncf-fs'],

  engine: {
    createInitialState: (): WaterSaverState => {
      FoundationalNarrator.speak('Tap on leaking taps and open valves to save precious water in our village water tank!');
      return {
        stations: [
          { id: 'kitchen', name: 'Kitchen Sink Tap', emoji: '🚰', isLeaking: true, waterSaved: 15 },
          { id: 'brush', name: 'Bathroom Basin', emoji: '🪥', isLeaking: true, waterSaved: 10 },
          { id: 'garden', name: 'Garden Hose Leak', emoji: '🪴', isLeaking: true, waterSaved: 25 },
          { id: 'roof', name: 'Rainwater Filter', emoji: '🌧️', isLeaking: true, waterSaved: 30 },
        ],
        totalSavedLitres: 0,
        tankLevel: 20,
        feedbackText: 'Touch leaking taps to repair them and save water!',
        isCelebrating: false,
        particles: [],
        time: 0,
      };
    },

    reset: (s) => {
      s.stations.forEach((st: WaterStation) => (st.isLeaking = true));
      s.totalSavedLitres = 0;
      s.tankLevel = 20;
      s.isCelebrating = false;
      return s;
    },

    update: (s, _params, dt) => {
      s.time += dt;
      if (s.isCelebrating) {
        s.particles.forEach((p: IParticle) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.alpha = Math.max(0, p.alpha - dt * 0.4);
        });
        s.particles = s.particles.filter((p: IParticle) => p.alpha > 0);
      }
      return s;
    },

    render: (ctx, width, height, s) => {
      const w = width;
      const h = height;
      clear(ctx, w, h);
      ctx.fillStyle = '#0C1A2E';
      ctx.fillRect(0, 0, w, h);

      drawInstructionBanner(
        ctx,
        w,
        'Water Around Us: Save Every Drop! (पानी की बचत)',
        { subPrompt: s.feedbackText, y: 16 }
      );

      // Tank on Right
      const tankX = w * 0.75;
      const tankY = 110;
      const tankW = w * 0.18;
      const tankH = h * 0.65;

      roundRect(ctx, tankX, tankY, tankW, tankH, 16, '#1E293B', '#38BDF8', 2);
      text(ctx, '🛢️ Village Water Tank', tankX + tankW / 2, tankY + 28, { color: '#38BDF8', size: 12, weight: 700 });

      const waterFillH = (tankH - 70) * (s.tankLevel / 100);
      const waterFillY = tankY + tankH - 20 - waterFillH;
      roundRect(ctx, tankX + 15, waterFillY, tankW - 30, waterFillH, 8, '#0284C7');

      text(ctx, `${Math.round(s.tankLevel)}% Full`, tankX + tankW / 2, waterFillY - 10, { color: '#67E8F9', size: 13, weight: 700 });
      text(ctx, `Saved: ${s.totalSavedLitres} Litres!`, tankX + tankW / 2, tankY + tankH - 12, { color: '#F8FAFC', size: 11, weight: 700 });

      // Stations Grid
      s.stations.forEach((st: WaterStation, idx: number) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const sx = w * 0.08 + col * (w * 0.31);
        const sy = 110 + row * 140;
        const sw = w * 0.28;
        const sh = 120;

        roundRect(ctx, sx, sy, sw, sh, 14, st.isLeaking ? '#450A0A' : '#064E3B', st.isLeaking ? '#EF4444' : '#10B981', 2);
        text(ctx, st.emoji, sx + 45, sy + 55, { size: 36 });
        text(ctx, st.name, sx + 80, sy + 35, { color: '#F8FAFC', size: 13, weight: 700 });

        if (st.isLeaking) {
          text(ctx, '⚠️ Dripping! Tap to fix', sx + 80, sy + 62, { color: '#FCA5A5', size: 11, weight: 500 });
          roundRect(ctx, sx + sw - 85, sy + sh - 38, 75, 28, 6, '#DC2626');
          text(ctx, 'Fix Tap 🔧', sx + sw - 48, sy + sh - 24, { color: '#FFF', size: 10, weight: 700 });
        } else {
          text(ctx, `✅ Saved +${st.waterSaved}L!`, sx + 80, sy + 62, { color: '#6EE7B7', size: 11, weight: 500 });
          roundRect(ctx, sx + sw - 85, sy + sh - 38, 75, 28, 6, '#059669');
          text(ctx, 'Secure ✅', sx + sw - 48, sy + sh - 24, { color: '#FFF', size: 10, weight: 700 });
        }
      });

      if (s.isCelebrating) {
        drawCelebrationOverlay(ctx, w, h, 'Water Guardian Hero! 🌊', 3, s.particles);
      }
    },

    onPointerDown: (x, y, s) => {
      if (s.isCelebrating) {
        s.isCelebrating = false;
        return;
      }
      const w = 800;

      s.stations.forEach((st: WaterStation, idx: number) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const sx = w * 0.08 + col * (w * 0.31);
        const sy = 110 + row * 140;
        const sw = w * 0.28;
        const sh = 120;

        if (x >= sx && x <= sx + sw && y >= sy && y <= sy + sh) {
          if (st.isLeaking) {
            st.isLeaking = false;
            s.totalSavedLitres += st.waterSaved;
            s.tankLevel = Math.min(100, s.tankLevel + 20);
            FoundationalAudio.playSuccessChime();
            FoundationalNarrator.speak(`Great job! You fixed the ${st.name} and saved ${st.waterSaved} litres!`);
            s.feedbackText = `Fixed! You saved +${st.waterSaved}L from ${st.name}! 💧`;

            const allFixed = s.stations.every((stn: WaterStation) => !stn.isLeaking);
            if (allFixed) {
              s.isCelebrating = true;
              s.particles = createConfettiBurst(w, 500, 60);
              FoundationalAudio.playCelebrationFanfare();
            }
          }
        }
      });
    },
  },
});

/* ══════════════════════════════════════════════════════════════════════════
   S11 — SINK OR FLOAT DISCOVERY LAB
   Alignment: NCF-FS Curricular Goal CG-8 · Matter & Physical Properties
   ══════════════════════════════════════════════════════════════════════════ */

interface SinkFloatItem {
  id: string;
  name: string;
  emoji: string;
  behavior: 'float' | 'sink';
  reason: string;
  tested: boolean;
  prediction?: 'float' | 'sink';
  currentY: number;
}

interface SinkFloatState {
  items: SinkFloatItem[];
  selectedItemIdx: number;
  predictionMade: boolean;
  feedbackText: string;
  isCelebrating: boolean;
  particles: IParticle[];
  time: number;
}

const WATER_OBJECTS: SinkFloatItem[] = [
  { id: 'leaf', name: 'Dry Leaf (पत्ता)', emoji: '🍃', behavior: 'float', reason: 'Light and spreads on water surface!', tested: false, currentY: 160 },
  { id: 'pebble', name: 'Heavy Pebble (कंकड़)', emoji: '🪨', behavior: 'sink', reason: 'Dense stone sinks straight to the bottom!', tested: false, currentY: 160 },
  { id: 'cork', name: 'Wooden Cork (लकड़ी)', emoji: '🪵', behavior: 'float', reason: 'Wood has air pockets and floats buoyantly!', tested: false, currentY: 160 },
  { id: 'coin', name: 'Metal Coin (सिक्का)', emoji: '🪙', behavior: 'sink', reason: 'Dense metal overcomes buoyancy and sinks!', tested: false, currentY: 160 },
  { id: 'plastic-boat', name: 'Toy Boat (नाव)', emoji: '⛵', behavior: 'float', reason: 'Hollow boat shape traps air and stays afloat!', tested: false, currentY: 160 },
];

export const class2SinkOrFloat: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class2-sink-float',
  title: 'Sink or Float Discovery Lab',
  band: 'GRADES_1_8',
  level: 'class-2',
  subject: 'Science',
  category: 'school science',
  icon: '⛵',
  topic: 'Buoyancy, Density & Water Properties',
  shortDescription: 'Predict whether everyday objects will sink or float in a water tub, then test and observe buoyancy (NCF-FS CG-8).',
  detailedDescription: 'Inquiry-based buoyancy lab. Children predict whether a leaf, stone, cork, coin, or toy boat will sink or float, test by dropping into water, and discover why trapped air creates buoyancy.',
  learningObjectives: [
    'Predict and observe whether common objects sink or float in water (NCF-FS CG-8)',
    'Understand that hollow shapes with trapped air (like boats) float easily',
    'Follow the scientific inquiry cycle: Predict -> Test -> Observe -> Explain',
  ],
  parameters: [],
  metrics: [
    metric('tested', 'Tested Items', (s) => `${(s.items || []).filter((i: any) => i.tested).length} / 5`),
    metric('current', 'Current Object', (s) => (s.items?.[s.selectedItemIdx]?.name.split(' ')[0] || 'Ready')),
  ],
  tags: ['class 2', 'science', 'sink or float', 'buoyancy', 'water', 'ncf-fs'],

  engine: {
    createInitialState: (): SinkFloatState => {
      FoundationalNarrator.speak('Predict first: will this object sink to the bottom or float on top of water?');
      return {
        items: WATER_OBJECTS.map((o) => ({ ...o })),
        selectedItemIdx: 0,
        predictionMade: false,
        feedbackText: 'Step 1: Predict whether the object will Float or Sink!',
        isCelebrating: false,
        particles: [],
        time: 0,
      };
    },

    reset: (s) => {
      s.items = WATER_OBJECTS.map((o) => ({ ...o }));
      s.selectedItemIdx = 0;
      s.predictionMade = false;
      s.isCelebrating = false;
      return s;
    },

    update: (s, _params, dt) => {
      s.time += dt;
      const cur = s.items[s.selectedItemIdx];
      if (cur && cur.tested) {
        const targetY = cur.behavior === 'float' ? 220 : 340;
        if (cur.currentY < targetY) {
          cur.currentY = Math.min(targetY, cur.currentY + dt * 140);
        }
      }

      if (s.isCelebrating) {
        s.particles.forEach((p: IParticle) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.alpha = Math.max(0, p.alpha - dt * 0.4);
        });
        s.particles = s.particles.filter((p: IParticle) => p.alpha > 0);
      }
      return s;
    },

    render: (ctx, width, height, s) => {
      const w = width;
      const h = height;
      clear(ctx, w, h);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, w, h);

      drawInstructionBanner(
        ctx,
        w,
        'Sink or Float Discovery (तैरना या डूबना)',
        { subPrompt: s.feedbackText, y: 16 }
      );

      const cur = s.items[s.selectedItemIdx];
      if (!cur) return;

      // Left Panel: Current Test Object
      roundRect(ctx, w * 0.06, 95, w * 0.25, h * 0.72, 14, '#1E293B', '#38BDF8', 2);
      text(ctx, '🔬 Test Object', w * 0.185, 125, { color: '#38BDF8', size: 14, weight: 700 });
      text(ctx, cur.emoji, w * 0.185, 185, { size: 48 });
      text(ctx, cur.name, w * 0.185, 235, { color: '#F8FAFC', size: 14, weight: 700 });

      // Prediction Buttons
      text(ctx, 'Make your prediction:', w * 0.185, 275, { color: '#94A3B8', size: 11, weight: 500 });
      roundRect(ctx, w * 0.08, 295, 80, 42, 8, cur.prediction === 'float' ? '#059669' : '#334155', '#10B981', 1);
      text(ctx, '🌊 Float', w * 0.08 + 40, 316, { color: '#FFF', size: 11, weight: 700 });

      roundRect(ctx, w * 0.19, 295, 80, 42, 8, cur.prediction === 'sink' ? '#DC2626' : '#334155', '#EF4444', 1);
      text(ctx, '⚓ Sink', w * 0.19 + 40, 316, { color: '#FFF', size: 11, weight: 700 });

      // Drop Button
      if (s.predictionMade && !cur.tested) {
        roundRect(ctx, w * 0.08, 355, 165, 42, 10, '#0284C7', '#38BDF8', 2);
        text(ctx, '💧 Drop in Water!', w * 0.08 + 82, 376, { color: '#FFF', size: 12, weight: 700 });
      }

      // Water Tub
      const tubX = w * 0.36;
      const tubY = 120;
      const tubW = w * 0.58;
      const tubH = 260;

      roundRect(ctx, tubX, tubY, tubW, tubH, 16, '#0F172A', '#64748B', 3);

      const waterLevelY = tubY + 80;
      roundRect(ctx, tubX + 4, waterLevelY, tubW - 8, tubH - 84, 14, 'rgba(14, 165, 233, 0.35)');
      line(ctx, tubX + 4, waterLevelY, tubX + tubW - 4, waterLevelY, '#38BDF8', 3);
      text(ctx, 'Water Surface (सतह)', tubX + 80, waterLevelY - 10, { color: '#38BDF8', size: 11, weight: 700 });
      text(ctx, 'Tub Bottom (तल)', tubX + 70, tubY + tubH - 12, { color: '#64748B', size: 11, weight: 700 });

      if (cur.tested) {
        const objX = tubX + tubW / 2;
        text(ctx, cur.emoji, objX, cur.currentY, { size: 42 });
        text(ctx, cur.behavior === 'float' ? 'FLOAT! 🌊' : 'SINK! ⚓', objX, cur.currentY + 35, {
          color: cur.behavior === 'float' ? '#34D399' : '#F87171',
          size: 13,
          weight: 700,
        });
      }

      if (cur.tested) {
        roundRect(ctx, w * 0.78, h * 0.88, 120, 40, 10, '#0284C7', '#38BDF8', 1);
        text(ctx, 'Next Item ➡️', w * 0.78 + 60, h * 0.88 + 20, { color: '#FFF', size: 12, weight: 700 });
      }

      if (s.isCelebrating) {
        drawCelebrationOverlay(ctx, w, h, 'Brilliant Physicist! 🌟', 3, s.particles);
      }
    },

    onPointerDown: (x, y, s) => {
      if (s.isCelebrating) {
        s.isCelebrating = false;
        return;
      }
      const cur = s.items[s.selectedItemIdx];
      if (!cur) return;
      const w = 800;
      const h = 500;

      // Predict Float
      if (x >= w * 0.08 && x <= w * 0.08 + 80 && y >= 295 && y <= 295 + 42) {
        cur.prediction = 'float';
        s.predictionMade = true;
        FoundationalAudio.playPop();
        s.feedbackText = 'You predicted: FLOAT! Now drop it in the tub to test!';
      }

      // Predict Sink
      if (x >= w * 0.19 && x <= w * 0.19 + 80 && y >= 295 && y <= 295 + 42) {
        cur.prediction = 'sink';
        s.predictionMade = true;
        FoundationalAudio.playPop();
        s.feedbackText = 'You predicted: SINK! Now drop it in the tub to test!';
      }

      // Drop in water
      if (s.predictionMade && !cur.tested) {
        if (x >= w * 0.08 && x <= w * 0.08 + 165 && y >= 355 && y <= 355 + 42) {
          cur.tested = true;
          FoundationalAudio.playDrop();

          if (cur.prediction === cur.behavior) {
            FoundationalAudio.playSuccessChime();
            s.feedbackText = `Your prediction was spot on! ${cur.name} will ${cur.behavior}! ${cur.reason}`;
            FoundationalNarrator.speak(`Superb prediction! ${cur.name} ${cur.behavior}s because ${cur.reason}`);
          } else {
            FoundationalAudio.playPop();
            s.feedbackText = `Surprise discovery! ${cur.name} actually ${cur.behavior}s! ${cur.reason}`;
            FoundationalNarrator.speak(`Notice that ${cur.name} ${cur.behavior}s because ${cur.reason}`);
          }
        }
      }

      // Next item
      if (cur.tested) {
        if (x >= w * 0.78 && x <= w * 0.78 + 120 && y >= h * 0.88 && y <= h * 0.88 + 40) {
          if (s.selectedItemIdx < s.items.length - 1) {
            s.selectedItemIdx++;
            s.predictionMade = false;
            s.feedbackText = `Next object: ${s.items[s.selectedItemIdx].name}. Predict Float or Sink!`;
          } else {
            s.isCelebrating = true;
            s.particles = createConfettiBurst(w, h, 60);
            FoundationalAudio.playCelebrationFanfare();
          }
        }
      }
    },
  },
});

/* ══════════════════════════════════════════════════════════════════════════
   S12 — PUSH, PULL, AND MOVEMENT PLAYGROUND
   Alignment: NCF-FS Curricular Goal CG-8 · Forces, Motion & Friction
   ══════════════════════════════════════════════════════════════════════════ */

interface PushPullState {
  cartPositionX: number;
  cartSpeed: number;
  forceType: 'push' | 'pull' | 'none';
  surfaceType: 'smooth-ice' | 'wooden-floor' | 'rough-carpet';
  frictionCoeff: number;
  feedbackText: string;
  isCelebrating: boolean;
  particles: IParticle[];
  time: number;
}

export const class2PushPullPlayground: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class2-push-pull',
  title: 'Push, Pull, and Movement Playground',
  band: 'GRADES_1_8',
  level: 'class-2',
  subject: 'Science',
  category: 'school science',
  icon: '🛒',
  topic: 'Forces, Motion & Surface Friction',
  shortDescription: 'Push and pull a toy cart across ice, wood, and rough carpet to observe how forces start motion and surfaces slow it down (NCF-FS CG-8).',
  detailedDescription: 'Grounded in physical force intuition. Children apply Push and Pull forces to a toy cart and observe motion changes across surfaces with different friction levels.',
  learningObjectives: [
    'Explore pushes (moving away) and pulls (drawing closer) as causes of motion (NCF-FS CG-8)',
    'Observe qualitatively how rough surfaces like carpet stop moving objects faster than smooth ice',
    'Demonstrate how changing force direction reverses the movement direction',
  ],
  parameters: [
    P.select('surface', 'Track Surface', [
      ['wooden-floor', 'Polished Wood (सामान्य घर्षण)'],
      ['smooth-ice', 'Smooth Ice (कम घर्षण - दूर तक जाए)'],
      ['rough-carpet', 'Rough Carpet (अधिक घर्षण - जल्दी रुके)'],
    ]),
  ],
  metrics: [
    metric('surface', 'Surface', (s) => (s.surfaceType || '').toUpperCase()),
    metric('speed', 'Speed', (s) => `${Math.round(Math.abs(s.cartSpeed || 0) * 10)} km/h`),
  ],
  tags: ['class 2', 'science', 'push and pull', 'forces', 'friction', 'motion', 'ncf-fs'],

  engine: {
    createInitialState: (params, width): PushPullState => {
      const w = width || 800;
      FoundationalNarrator.speak('Push or pull the cart! Notice how smooth ice lets it roll far while rough carpet slows it down!');
      const surf = (params.surface as any) || 'wooden-floor';
      const coeff = surf === 'smooth-ice' ? 0.99 : surf === 'rough-carpet' ? 0.88 : 0.96;

      return {
        cartPositionX: w * 0.15,
        cartSpeed: 0,
        forceType: 'none',
        surfaceType: surf,
        frictionCoeff: coeff,
        feedbackText: 'Apply a Push or Pull force to set the toy cart into motion!',
        isCelebrating: false,
        particles: [],
        time: 0,
      };
    },

    reset: (s, _params, width) => {
      const w = width || 800;
      s.cartPositionX = w * 0.15;
      s.cartSpeed = 0;
      s.isCelebrating = false;
      return s;
    },

    update: (s, params, dt) => {
      s.time += dt;
      if (params.surface && params.surface !== s.surfaceType) {
        s.surfaceType = params.surface as any;
        s.frictionCoeff = s.surfaceType === 'smooth-ice' ? 0.99 : s.surfaceType === 'rough-carpet' ? 0.88 : 0.96;
      }

      if (Math.abs(s.cartSpeed) > 0.05) {
        s.cartPositionX += s.cartSpeed * dt * 60;
        s.cartSpeed *= s.frictionCoeff;

        if (s.cartPositionX > 680) {
          s.cartPositionX = 680;
          s.cartSpeed = -s.cartSpeed * 0.5;
        }
        if (s.cartPositionX < 100) {
          s.cartPositionX = 100;
          s.cartSpeed = -s.cartSpeed * 0.5;
        }
      } else {
        s.cartSpeed = 0;
      }

      if (s.isCelebrating) {
        s.particles.forEach((p: IParticle) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.alpha = Math.max(0, p.alpha - dt * 0.4);
        });
        s.particles = s.particles.filter((p: IParticle) => p.alpha > 0);
      }
      return s;
    },

    render: (ctx, width, height, s) => {
      const w = width;
      const h = height;
      clear(ctx, w, h);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, w, h);

      drawInstructionBanner(
        ctx,
        w,
        'Push, Pull, and Movement (धक्का और खिंचाव)',
        { subPrompt: s.feedbackText, y: 16 }
      );

      const trackY = h * 0.56;
      let surfaceColor = '#78350F';
      let surfaceName = '🪵 Polished Wood (Medium Friction)';

      if (s.surfaceType === 'smooth-ice') {
        surfaceColor = '#38BDF8';
        surfaceName = '🧊 Smooth Ice (Very Low Friction - Rolls Far!)';
      } else if (s.surfaceType === 'rough-carpet') {
        surfaceColor = '#B45309';
        surfaceName = '🧶 Rough Carpet (High Friction - Stops Fast!)';
      }

      roundRect(ctx, w * 0.08, trackY, w * 0.84, 30, 8, surfaceColor);
      text(ctx, surfaceName, w * 0.50, trackY + 50, { color: '#F8FAFC', size: 12, weight: 700 });

      // Toy Cart
      const cx = s.cartPositionX;
      const cy = trackY - 45;
      roundRect(ctx, cx, cy, 75, 42, 8, '#DC2626', '#EF4444', 2);
      text(ctx, '🛒 Toy Cart', cx + 37, cy + 21, { color: '#FFF', size: 10, weight: 700 });
      circle(ctx, cx + 18, cy + 44, 9, '#1E293B');
      circle(ctx, cx + 57, cy + 44, 9, '#1E293B');

      // Force Action Buttons
      text(ctx, 'Apply Force:', w * 0.65, h * 0.78, { color: '#94A3B8', size: 11, weight: 500 });
      roundRect(ctx, w * 0.55, h * 0.82, 110, 42, 10, '#16A34A', '#22C55E', 2);
      text(ctx, '👉 PUSH Forward', w * 0.55 + 55, h * 0.82 + 21, { color: '#FFF', size: 11, weight: 700 });

      roundRect(ctx, w * 0.72, h * 0.82, 110, 42, 10, '#D97706', '#F59E0B', 2);
      text(ctx, '👈 PULL Backward', w * 0.72 + 55, h * 0.82 + 21, { color: '#FFF', size: 11, weight: 700 });

      if (s.isCelebrating) {
        drawCelebrationOverlay(ctx, w, h, 'Motion Master! 🚀', 3, s.particles);
      }
    },

    onPointerDown: (x, y, s) => {
      const w = 800;
      const h = 500;

      // Push Forward
      if (x >= w * 0.55 && x <= w * 0.55 + 110 && y >= h * 0.82 && y <= h * 0.82 + 42) {
        s.cartSpeed = 7.5;
        s.forceType = 'push';
        FoundationalAudio.playDrop();
        FoundationalNarrator.speak('Push force applied forward! A push moves an object away from you.');
        s.feedbackText = 'Push force sent the cart rolling forward! Notice how friction slows it down.';
      }

      // Pull Backward
      if (x >= w * 0.72 && x <= w * 0.72 + 110 && y >= h * 0.82 && y <= h * 0.82 + 42) {
        s.cartSpeed = -7.5;
        s.forceType = 'pull';
        FoundationalAudio.playDrop();
        FoundationalNarrator.speak('Pull force applied backward! A pull brings an object closer to you.');
        s.feedbackText = 'Pull force drew the cart backward toward you!';
      }
    },
  },
});

/* Export All Class 2 Science Simulations */
export const CLASS2_SCIENCE_SIMULATIONS: SchoolSimulationDefinition[] = [
  class2LivingSorter,
  class2PlantGarden,
  class2SensesExplorer,
  class2WaterSaver,
  class2SinkOrFloat,
  class2PushPullPlayground,
];

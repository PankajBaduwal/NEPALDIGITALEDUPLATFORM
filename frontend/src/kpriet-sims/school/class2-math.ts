/**
 * PIYUSHDHARA EDUVERSE — CLASS 2 MATHEMATICS SIMULATIONS (NCERT ALIGNED)
 *
 * Mapped to NCERT Joyful Mathematics (Class 2, 2023 Edition) and
 * NCERT Learning Outcomes at the Elementary Stage (LO M201 – M214).
 *
 * Designed with pediatric ergonomics:
 * - Large touch targets (>= 64px)
 * - Multi-sensory procedural sound feedback
 * - Bilingual Speech scaffolding (en-IN)
 * - Purely in public school catalogue (never in college admin dashboard)
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
   M01 — NUMBER VILLAGE: READ, BUILD, AND COMPARE NUMBERS (1 TO 99)
   NCERT Joyful Mathematics Ch 1 & Ch 3 · LO M201, M202
   ══════════════════════════════════════════════════════════════════════════ */

interface NumberVillageState {
  targetNumber: number;
  currentTens: number;
  currentOnes: number;
  mode: 'build' | 'compare' | 'sequence';
  starsEarned: number;
  isCelebrating: boolean;
  celebrationMessage: string;
  particles: IParticle[];
  time: number;
  compNumA: number;
  compNumB: number;
  compChoice: '<' | '>' | '=' | null;
  seqNumbers: number[];
  seqMissingIdx: number;
  feedbackText: string;
}

export const class2NumberVillage: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class2-number-village',
  title: 'Number Village: Read, Build & Compare (1 to 99)',
  band: 'GRADES_1_8',
  level: 'class-2',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '🏡',
  topic: 'Numbers 1 to 99 & Place Value',
  shortDescription: 'Explore the village to count items, build numbers with tens and ones, compare quantities, and find missing sequence cards.',
  detailedDescription: 'Grounded in NCERT Joyful Mathematics Class 2. Children collect mangoes and clay pots, group tens and ones, order numbers on village paths, and visually compare quantities up to 99.',
  learningObjectives: [
    'Read and write 2-digit numerals up to 99 with place value insight (LO M201)',
    'Count objects in groups of tens and loose ones (LO M202)',
    'Compare two 2-digit numbers using <, >, and = (LO M202)',
    'Identify missing numbers in a sequential number path (LO M201)',
  ],
  parameters: [
    P.select('activity', 'Village Activity', [
      ['build', '1. Build the Target Number (संख्या बनाओ)'],
      ['compare', '2. Compare Two Amounts (बड़ा या छोटा?)'],
      ['sequence', '3. Number Path Sequence (संख्या क्रम)'],
    ]),
    P.select('lang', 'Voiceover Language', [
      ['en-IN', 'English (Indian accent)'],
      ['hi-IN', 'Hindi (हिंदी)'],
    ]),
  ],
  metrics: [
    metric('mode', 'Mode', (s) => (s.mode ? s.mode.toUpperCase() : 'BUILD')),
    metric('target', 'Target / Task', (s) => `${s.targetNumber || 47}`),
    metric('stars', 'Stars Earned', (s) => '⭐'.repeat(Math.max(1, s.starsEarned || 1))),
  ],
  tags: ['class 2', 'math', 'ncert', 'numbers', 'tens and ones', 'place value', 'compare'],

  engine: {
    createInitialState: (params): NumberVillageState => {
      const mode = (params.activity as 'build' | 'compare' | 'sequence') || 'build';
      const initialTarget = 47;
      FoundationalNarrator.speak(`Welcome to Number Village! Let us build number ${initialTarget}!`);

      return {
        targetNumber: initialTarget,
        currentTens: 0,
        currentOnes: 0,
        mode,
        starsEarned: 1,
        isCelebrating: false,
        celebrationMessage: '',
        particles: [],
        time: 0,
        compNumA: 36,
        compNumB: 52,
        compChoice: null,
        seqNumbers: [42, 43, 44, 45, 46],
        seqMissingIdx: 2,
        feedbackText: `Tap Tens and Ones bundles to build ${initialTarget}!`,
      };
    },

    reset: (s) => {
      s.currentTens = 0;
      s.currentOnes = 0;
      s.isCelebrating = false;
      s.particles = [];
      return s;
    },

    update: (s, params, dt) => {
      s.time += dt;
      if (params.activity && params.activity !== s.mode) {
        s.mode = params.activity as any;
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
        `Number Village (संख्या गाँव) — ${s.mode.toUpperCase()}`,
        { subPrompt: s.feedbackText, y: 16 }
      );

      const curVal = s.currentTens * 10 + s.currentOnes;

      if (s.mode === 'build') {
        // Target Box
        roundRect(ctx, w * 0.08, 90, 160, 100, 14, '#1E293B', '#38BDF8', 2);
        text(ctx, 'TARGET NUMBER', w * 0.08 + 80, 115, { color: '#94A3B8', size: 11, weight: 700 });
        text(ctx, `${s.targetNumber}`, w * 0.08 + 80, 160, { color: '#38BDF8', size: 36, weight: 700 });

        // Current Box
        roundRect(ctx, w * 0.08, 205, 160, 100, 14, '#1E293B', curVal === s.targetNumber ? '#10B981' : '#F59E0B', 2);
        text(ctx, 'YOUR NUMBER', w * 0.08 + 80, 230, { color: '#94A3B8', size: 11, weight: 700 });
        text(ctx, `${curVal}`, w * 0.08 + 80, 275, { color: curVal === s.targetNumber ? '#10B981' : '#F59E0B', size: 36, weight: 700 });

        // Manipulatives Board
        roundRect(ctx, w * 0.32, 90, w * 0.62, h * 0.60, 16, '#1E293B', '#334155', 2);
        text(ctx, `Tens Bundles: ${s.currentTens} (= ${s.currentTens * 10})`, w * 0.48, 120, { color: '#38BDF8', size: 14, weight: 700 });
        text(ctx, `Loose Ones: ${s.currentOnes}`, w * 0.78, 120, { color: '#F59E0B', size: 14, weight: 700 });

        // Draw Tens Bundles
        for (let i = 0; i < s.currentTens; i++) {
          const bx = w * 0.35 + (i % 5) * 38;
          const by = 145 + Math.floor(i / 5) * 110;
          roundRect(ctx, bx, by, 28, 95, 6, '#0284C7', '#38BDF8', 2);
          text(ctx, '10', bx + 14, by + 50, { color: '#FFF', size: 11, weight: 700 });
        }

        // Draw Ones Counters
        for (let j = 0; j < s.currentOnes; j++) {
          const ox = w * 0.68 + (j % 5) * 36;
          const oy = 150 + Math.floor(j / 5) * 40;
          circle(ctx, ox, oy, 14, '#F59E0B', '#FBBF24', 2);
          text(ctx, '1', ox, oy + 4, { color: '#FFF', size: 10, weight: 700 });
        }

        // Action Buttons Row
        roundRect(ctx, w * 0.32, h * 0.78, 110, 48, 10, '#0284C7', '#38BDF8', 2);
        text(ctx, '+ 10 Rod', w * 0.32 + 55, h * 0.78 + 30, { color: '#FFF', size: 12, weight: 700 });

        roundRect(ctx, w * 0.46, h * 0.78, 110, 48, 10, '#475569', '#64748B', 1);
        text(ctx, '- 10 Rod', w * 0.46 + 55, h * 0.78 + 30, { color: '#FFF', size: 12, weight: 700 });

        roundRect(ctx, w * 0.60, h * 0.78, 110, 48, 10, '#D97706', '#F59E0B', 2);
        text(ctx, '+ 1 Loose', w * 0.60 + 55, h * 0.78 + 30, { color: '#FFF', size: 12, weight: 700 });

        roundRect(ctx, w * 0.74, h * 0.78, 110, 48, 10, '#475569', '#64748B', 1);
        text(ctx, '- 1 Loose', w * 0.74 + 55, h * 0.78 + 30, { color: '#FFF', size: 12, weight: 700 });

        roundRect(ctx, w * 0.88, h * 0.78, 70, 48, 10, '#DC2626', '#EF4444', 1);
        text(ctx, 'Reset', w * 0.88 + 35, h * 0.78 + 30, { color: '#FFF', size: 12, weight: 700 });
      } else if (s.mode === 'compare') {
        // Compare Mode
        roundRect(ctx, w * 0.20, 130, 160, 140, 16, '#1E293B', '#38BDF8', 2);
        text(ctx, `${s.compNumA}`, w * 0.20 + 80, 215, { color: '#38BDF8', size: 48, weight: 700 });

        roundRect(ctx, w * 0.60, 130, 160, 140, 16, '#1E293B', '#F59E0B', 2);
        text(ctx, `${s.compNumB}`, w * 0.60 + 80, 215, { color: '#F59E0B', size: 48, weight: 700 });

        // Sign options
        const signs: Array<'<' | '=' | '>'> = ['<', '=', '>'];
        signs.forEach((sgn, idx) => {
          const sx = w * 0.36 + idx * 75;
          const sy = 165;
          const isSel = s.compChoice === sgn;
          roundRect(ctx, sx, sy, 60, 60, 12, isSel ? '#10B981' : '#334155', isSel ? '#34D399' : '#64748B', 2);
          text(ctx, sgn, sx + 30, sy + 30, { color: '#FFF', size: 28, weight: 700 });
        });
      } else {
        // Sequence Mode
        text(ctx, 'Find the missing number in the sequence:', w * 0.50, 120, { color: '#38BDF8', size: 15, weight: 700 });
        s.seqNumbers.forEach((num: number, idx: number) => {
          const bx = w * 0.15 + idx * 105;
          const by = 160;
          const isMissing = idx === s.seqMissingIdx;
          roundRect(ctx, bx, by, 85, 85, 14, isMissing ? '#3B82F633' : '#1E293B', isMissing ? '#38BDF8' : '#475569', 2);
          text(ctx, isMissing ? '?' : `${num}`, bx + 42, by + 42, {
            color: isMissing ? '#38BDF8' : '#F8FAFC',
            size: 28,
            weight: 700,
          });
        });

        // 3 Candidate Choice buttons
        const choices = [s.seqNumbers[s.seqMissingIdx] - 1, s.seqNumbers[s.seqMissingIdx], s.seqNumbers[s.seqMissingIdx] + 2];
        choices.forEach((c, idx) => {
          const cx = w * 0.30 + idx * 120;
          const cy = 290;
          roundRect(ctx, cx, cy, 95, 52, 10, '#0284C7', '#38BDF8', 2);
          text(ctx, `${c}`, cx + 47, cy + 26, { color: '#FFF', size: 22, weight: 700 });
        });
      }

      if (s.isCelebrating) {
        drawCelebrationOverlay(ctx, w, h, s.celebrationMessage, 3, s.particles);
      }
    },

    onPointerDown: (x, y, s) => {
      if (s.isCelebrating) {
        s.isCelebrating = false;
        return;
      }

      const w = 800;
      const h = 500;

      if (s.mode === 'build') {
        // +10 Rod
        if (x >= w * 0.32 && x <= w * 0.32 + 110 && y >= h * 0.78 && y <= h * 0.78 + 48) {
          if (s.currentTens < 9) {
            s.currentTens++;
            FoundationalAudio.playCountTick(s.currentTens);
          }
        }
        // -10 Rod
        if (x >= w * 0.46 && x <= w * 0.46 + 110 && y >= h * 0.78 && y <= h * 0.78 + 48) {
          if (s.currentTens > 0) {
            s.currentTens--;
            FoundationalAudio.playPop();
          }
        }
        // +1 Loose
        if (x >= w * 0.60 && x <= w * 0.60 + 110 && y >= h * 0.78 && y <= h * 0.78 + 48) {
          if (s.currentOnes < 9) {
            s.currentOnes++;
            FoundationalAudio.playCountTick(s.currentOnes);
          }
        }
        // -1 Loose
        if (x >= w * 0.74 && x <= w * 0.74 + 110 && y >= h * 0.78 && y <= h * 0.78 + 48) {
          if (s.currentOnes > 0) {
            s.currentOnes--;
            FoundationalAudio.playPop();
          }
        }
        // Reset
        if (x >= w * 0.88 && x <= w * 0.88 + 70 && y >= h * 0.78 && y <= h * 0.78 + 48) {
          s.currentTens = 0;
          s.currentOnes = 0;
          FoundationalAudio.playPop();
        }

        // Check match
        const cur = s.currentTens * 10 + s.currentOnes;
        if (cur === s.targetNumber) {
          s.isCelebrating = true;
          s.celebrationMessage = `You built ${s.targetNumber} using ${s.currentTens} tens and ${s.currentOnes} ones!`;
          s.particles = createConfettiBurst(w, h, 50);
          FoundationalAudio.playCelebrationFanfare();
          FoundationalNarrator.speak(`Splendid! ${s.targetNumber} is ${s.currentTens} tens and ${s.currentOnes} ones!`);
        }
      } else if (s.mode === 'compare') {
        const signs: Array<'<' | '=' | '>'> = ['<', '=', '>'];
        signs.forEach((sgn, idx) => {
          const sx = w * 0.36 + idx * 75;
          const sy = 165;
          if (x >= sx && x <= sx + 60 && y >= sy && y <= sy + 60) {
            s.compChoice = sgn;
            const correctSign = s.compNumA < s.compNumB ? '<' : s.compNumA > s.compNumB ? '>' : '=';
            if (sgn === correctSign) {
              s.isCelebrating = true;
              s.celebrationMessage = `${s.compNumA} is smaller than ${s.compNumB}! Correct comparison!`;
              s.particles = createConfettiBurst(w, h, 50);
              FoundationalAudio.playCelebrationFanfare();
            } else {
              FoundationalAudio.playGentleRetry();
              s.feedbackText = `Compare tens digits first: ${Math.floor(s.compNumA / 10)} tens vs ${Math.floor(s.compNumB / 10)} tens.`;
            }
          }
        });
      } else if (s.mode === 'sequence') {
        const choices = [s.seqNumbers[s.seqMissingIdx] - 1, s.seqNumbers[s.seqMissingIdx], s.seqNumbers[s.seqMissingIdx] + 2];
        choices.forEach((c, idx) => {
          const cx = w * 0.30 + idx * 120;
          const cy = 290;
          if (x >= cx && x <= cx + 95 && y >= cy && y <= cy + 52) {
            if (c === s.seqNumbers[s.seqMissingIdx]) {
              s.isCelebrating = true;
              s.celebrationMessage = `The missing number is indeed ${c}! Great counting!`;
              s.particles = createConfettiBurst(w, h, 50);
              FoundationalAudio.playCelebrationFanfare();
            } else {
              FoundationalAudio.playGentleRetry();
              s.feedbackText = `Count forward step by step: ${s.seqNumbers[0]}, ${s.seqNumbers[1]}...`;
            }
          }
        });
      }
    },
  },
});

/* ══════════════════════════════════════════════════════════════════════════
   M02 — TENS AND ONES WORKSHOP
   NCERT Joyful Mathematics Ch 4 & LO M202
   ══════════════════════════════════════════════════════════════════════════ */

interface TensOnesState {
  looseOnes: number;
  tenRods: number;
  targetNumber: number;
  feedbackText: string;
  isCelebrating: boolean;
  particles: IParticle[];
  time: number;
}

export const class2TensAndOnes: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class2-tens-and-ones',
  title: 'Tens and Ones Workshop: Bundling Lab',
  band: 'GRADES_1_8',
  level: 'class-2',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '🪵',
  topic: 'Place Value & Bundling 10 Ones into 1 Ten',
  shortDescription: 'Drag loose sticks into bundles of ten! Discover that 10 ones make exactly 1 ten bundle without changing the total count.',
  detailedDescription: 'Directly aligned with NCERT Class 2 bundling pedagogy. Children group loose sticks into bundles of 10 and unbundle ten-rods into 10 loose sticks to internalize place value conservation.',
  learningObjectives: [
    'Group 10 loose ones into 1 ten-rod (bundling conservation) (LO M202)',
    'Unbundle 1 ten into 10 loose ones (LO M202)',
    'Express numbers in standard and expanded form (e.g., 34 = 3 tens + 4 ones)',
  ],
  parameters: [
    P.select('target', 'Target Challenge', [
      ['25', 'Build 25 (2 Tens, 5 Ones)'],
      ['43', 'Build 43 (4 Tens, 3 Ones)'],
      ['60', 'Build 60 (6 Tens, 0 Ones)'],
    ]),
  ],
  metrics: [
    metric('total', 'Total Sticks', (s) => `${(s.tenRods || 0) * 10 + (s.looseOnes || 0)}`),
    metric('rods', 'Tens Rods', (s) => `${s.tenRods || 0}`),
    metric('loose', 'Loose Ones', (s) => `${s.looseOnes || 0}`),
  ],
  tags: ['class 2', 'math', 'ncert', 'place value', 'bundling', 'tens and ones'],

  engine: {
    createInitialState: (params): TensOnesState => {
      const tgt = parseInt(params.target as string, 10) || 25;
      FoundationalNarrator.speak(`Welcome to Tens and Ones Workshop! Try bundling 10 loose sticks into 1 ten bundle!`);
      return {
        looseOnes: 12,
        tenRods: 1,
        targetNumber: tgt,
        feedbackText: 'When you have 10 loose sticks, bundle them into a 10-rod!',
        isCelebrating: false,
        particles: [],
        time: 0,
      };
    },

    reset: (s) => {
      s.looseOnes = 0;
      s.tenRods = 0;
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
        'Tens & Ones Workshop (दहाई और इकाई प्रयोगशाला)',
        { subPrompt: s.feedbackText, y: 16 }
      );

      const total = s.tenRods * 10 + s.looseOnes;

      // Status Bar
      roundRect(ctx, w * 0.08, 90, w * 0.84, 60, 12, '#1E293B', '#38BDF8', 2);
      text(ctx, `Current Total: ${total} sticks`, w * 0.25, 120, { color: '#38BDF8', size: 16, weight: 700 });
      text(ctx, `Expanded Form: ${s.tenRods * 10} + ${s.looseOnes} = ${total}`, w * 0.65, 120, { color: '#F59E0B', size: 16, weight: 700 });

      // Tens Area (Left)
      roundRect(ctx, w * 0.08, 165, w * 0.40, h * 0.58, 16, '#1E293B', '#0284C7', 2);
      text(ctx, `TENS BUNDLES (${s.tenRods})`, w * 0.28, 195, { color: '#38BDF8', size: 14, weight: 700 });
      for (let i = 0; i < s.tenRods; i++) {
        const rx = w * 0.11 + (i % 6) * 45;
        const ry = 220 + Math.floor(i / 6) * 110;
        roundRect(ctx, rx, ry, 34, 95, 6, '#0369A1', '#38BDF8', 2);
        text(ctx, '10', rx + 17, ry + 50, { color: '#FFF', size: 12, weight: 700 });
      }

      // Ones Area (Right)
      roundRect(ctx, w * 0.52, 165, w * 0.40, h * 0.58, 16, '#1E293B', '#D97706', 2);
      text(ctx, `LOOSE ONES (${s.looseOnes})`, w * 0.72, 195, { color: '#F59E0B', size: 14, weight: 700 });
      for (let j = 0; j < s.looseOnes; j++) {
        const ox = w * 0.55 + (j % 5) * 45;
        const oy = 225 + Math.floor(j / 5) * 38;
        circle(ctx, ox, oy, 14, '#F59E0B', '#FDE68A', 2);
        text(ctx, '1', ox, oy + 4, { color: '#FFF', size: 10, weight: 700 });
      }

      // Actions at Bottom
      roundRect(ctx, w * 0.10, h * 0.86, 170, 48, 10, '#0284C7', '#38BDF8', 2);
      text(ctx, '➕ Add 1 Loose Stick', w * 0.10 + 85, h * 0.86 + 24, { color: '#FFF', size: 11, weight: 700 });

      // Bundle button
      const canBundle = s.looseOnes >= 10;
      roundRect(ctx, w * 0.35, h * 0.86, 190, 48, 10, canBundle ? '#059669' : '#334155', canBundle ? '#10B981' : '#64748B', 2);
      text(ctx, '✨ BUNDLE 10 ONES ➡️ 1 TEN', w * 0.35 + 95, h * 0.86 + 24, { color: '#FFF', size: 11, weight: 700 });

      // Unbundle button
      const canUnbundle = s.tenRods >= 1;
      roundRect(ctx, w * 0.62, h * 0.86, 190, 48, 10, canUnbundle ? '#B45309' : '#334155', canUnbundle ? '#F59E0B' : '#64748B', 2);
      text(ctx, '⬅️ UNBUNDLE 1 TEN ➡️ 10 ONES', w * 0.62 + 95, h * 0.86 + 24, { color: '#FFF', size: 11, weight: 700 });

      if (s.isCelebrating) {
        drawCelebrationOverlay(ctx, w, h, 'Bundle Master! 🪵', 3, s.particles);
      }
    },

    onPointerDown: (x, y, s) => {
      if (s.isCelebrating) {
        s.isCelebrating = false;
        return;
      }
      const w = 800;
      const h = 500;

      // Add 1 loose
      if (x >= w * 0.10 && x <= w * 0.10 + 170 && y >= h * 0.86 && y <= h * 0.86 + 48) {
        s.looseOnes++;
        FoundationalAudio.playCountTick(s.looseOnes);
        if (s.looseOnes >= 10) {
          s.feedbackText = 'You have 10 or more loose sticks! Tap the green BUNDLE button to make a Ten-rod!';
          FoundationalNarrator.speak('You have 10 loose ones! Tap BUNDLE to make a ten!');
        }
      }

      // Bundle 10 ones into 1 ten
      if (x >= w * 0.35 && x <= w * 0.35 + 190 && y >= h * 0.86 && y <= h * 0.86 + 48) {
        if (s.looseOnes >= 10) {
          s.looseOnes -= 10;
          s.tenRods += 1;
          s.isCelebrating = true;
          s.particles = createConfettiBurst(w, h, 40);
          FoundationalAudio.playSuccessChime();
          FoundationalNarrator.speak('Success! 10 loose ones combined into 1 ten rod! Notice the total count stayed the same!');
        } else {
          FoundationalAudio.playGentleRetry();
          s.feedbackText = `You need 10 loose ones to bundle. Currently you have ${s.looseOnes}.`;
        }
      }

      // Unbundle 1 ten into 10 ones
      if (x >= w * 0.62 && x <= w * 0.62 + 190 && y >= h * 0.86 && y <= h * 0.86 + 48) {
        if (s.tenRods >= 1) {
          s.tenRods -= 1;
          s.looseOnes += 10;
          FoundationalAudio.playPop();
          FoundationalNarrator.speak('Unbundled! 1 ten rod split into 10 loose ones! Total count is still the same!');
          s.feedbackText = 'Unbundled 1 ten rod into 10 loose ones!';
        } else {
          FoundationalAudio.playGentleRetry();
          s.feedbackText = 'No tens rods left to unbundle!';
        }
      }
    },
  },
});

/* ══════════════════════════════════════════════════════════════════════════
   M06 — RUPEE AND PAISE PLAY MARKET (UP TO ₹100)
   NCERT Joyful Mathematics & LO M208
   ══════════════════════════════════════════════════════════════════════════ */

interface RupeeMarketState {
  targetPrice: number;
  currentPaid: number;
  itemName: string;
  itemEmoji: string;
  notesSelected: { '10': number; '20': number; '50': number; '5': number; '2': number; '1': number };
  feedbackText: string;
  isCelebrating: boolean;
  particles: IParticle[];
  time: number;
}

export const class2RupeeMarket: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class2-rupee-market',
  title: 'Rupee and Paise Play Market (₹1 to ₹100)',
  band: 'GRADES_1_8',
  level: 'class-2',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '🪙',
  topic: 'Indian Currency Notes & Coins (LO M208)',
  shortDescription: 'Pay for classroom market items using authentic Indian play currency coins (₹1, ₹2, ₹5) and notes (₹10, ₹20, ₹50).',
  detailedDescription: 'Strictly aligned with NCERT Class 2 learning outcome M208. Children combine Indian currency notes and coins to make amounts up to ₹100 without abstract debt or complex change calculations.',
  learningObjectives: [
    'Recognize and combine Indian currency denominations: ₹1, ₹2, ₹5, ₹10, ₹20, ₹50 (LO M208)',
    'Pay exact amounts up to ₹100 using combinations of notes and coins',
    'Realize that the same monetary amount can be paid in multiple coin/note combinations',
  ],
  parameters: [
    P.select('item', 'Market Item', [
      ['kite', 'Colorful Kite — ₹25 (पतंग)'],
      ['crayons', 'Box of Crayons — ₹45 (रंग)'],
      ['cricket-ball', 'Cricket Ball — ₹60 (गेंद)'],
      ['storybook', 'Panchatantra Book — ₹75 (कहानी की किताब)'],
    ]),
  ],
  metrics: [
    metric('target', 'Item Price', (s) => `₹${s.targetPrice || 25}`),
    metric('paid', 'Paid So Far', (s) => `₹${s.currentPaid || 0}`),
  ],
  tags: ['class 2', 'math', 'ncert', 'money', 'rupee', 'currency', 'market'],

  engine: {
    createInitialState: (params): RupeeMarketState => {
      const items: Record<string, { price: number; name: string; emoji: string }> = {
        kite: { price: 25, name: 'Colorful Kite', emoji: '🪁' },
        crayons: { price: 45, name: 'Box of Crayons', emoji: '🖍️' },
        'cricket-ball': { price: 60, name: 'Cricket Ball', emoji: '🏏' },
        storybook: { price: 75, name: 'Panchatantra Book', emoji: '📖' },
      };
      const sel = (params.item ? items[params.item as string] : undefined) ?? items.kite!;
      FoundationalNarrator.speak(`Welcome to the Village Toy Shop! Pay ₹${sel.price} for the ${sel.name}!`);

      return {
        targetPrice: sel.price,
        currentPaid: 0,
        itemName: sel.name,
        itemEmoji: sel.emoji,
        notesSelected: { '10': 0, '20': 0, '50': 0, '5': 0, '2': 0, '1': 0 },
        feedbackText: `Pay ₹${sel.price} for the ${sel.name} using play coins and notes!`,
        isCelebrating: false,
        particles: [],
        time: 0,
      };
    },

    reset: (s) => {
      s.currentPaid = 0;
      s.notesSelected = { '10': 0, '20': 0, '50': 0, '5': 0, '2': 0, '1': 0 };
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
        'Rupee Market (रुपये और पैसे का बाज़ार)',
        { subPrompt: s.feedbackText, y: 16 }
      );

      // Shop Counter (Left)
      roundRect(ctx, w * 0.08, 90, w * 0.28, h * 0.76, 16, '#1E293B', '#38BDF8', 2);
      text(ctx, '🛍️ TOY SHOP', w * 0.22, 120, { color: '#38BDF8', size: 14, weight: 700 });
      text(ctx, s.itemEmoji, w * 0.22, 185, { size: 48 });
      text(ctx, s.itemName, w * 0.22, 235, { color: '#F8FAFC', size: 15, weight: 700 });
      text(ctx, `Price: ₹${s.targetPrice}`, w * 0.22, 275, { color: '#F59E0B', size: 22, weight: 700 });

      // Amount paid indicator
      roundRect(ctx, w * 0.10, 310, w * 0.24, 60, 10, '#0F172A');
      text(ctx, 'You Paid:', w * 0.22, 332, { color: '#94A3B8', size: 11, weight: 700 });
      text(ctx, `₹${s.currentPaid}`, w * 0.22, 358, {
        color: s.currentPaid === s.targetPrice ? '#10B981' : s.currentPaid > s.targetPrice ? '#EF4444' : '#38BDF8',
        size: 22,
        weight: 700,
      });

      // Currency Drawer (Right)
      roundRect(ctx, w * 0.40, 90, w * 0.52, h * 0.76, 16, '#1E293B', '#334155', 2);
      text(ctx, '🪙 Play Currency Drawer (Tap to Add)', w * 0.66, 120, { color: '#38BDF8', size: 14, weight: 700 });

      // Row 1: Notes (₹50, ₹20, ₹10)
      const notes = [
        { val: 50, color: '#065F46', border: '#10B981', label: '₹50 Note' },
        { val: 20, color: '#854D0E', border: '#EAB308', label: '₹20 Note' },
        { val: 10, color: '#7C2D12', border: '#F97316', label: '₹10 Note' },
      ];

      notes.forEach((n, idx) => {
        const nx = w * 0.43 + idx * 115;
        const ny = 145;
        roundRect(ctx, nx, ny, 100, 60, 8, n.color, n.border, 2);
        text(ctx, `₹${n.val}`, nx + 50, ny + 25, { color: '#FFF', size: 18, weight: 700 });
        text(ctx, n.label, nx + 50, ny + 45, { color: '#E2E8F0', size: 9, weight: 500 });
      });

      // Row 2: Coins (₹5, ₹2, ₹1)
      const coins = [
        { val: 5, color: '#CA8A04', border: '#FACC15' },
        { val: 2, color: '#475569', border: '#94A3B8' },
        { val: 1, color: '#64748B', border: '#CBD5E1' },
      ];

      coins.forEach((c, idx) => {
        const cx = w * 0.46 + idx * 115;
        const cy = 235;
        circle(ctx, cx, cy, 26, c.color, c.border, 2);
        text(ctx, `₹${c.val}`, cx, cy, { color: '#FFF', size: 15, weight: 700 });
      });

      // Reset Button
      roundRect(ctx, w * 0.58, 305, 120, 42, 10, '#DC2626', '#EF4444', 1);
      text(ctx, '🔄 Reset Drawer', w * 0.58 + 60, 326, { color: '#FFF', size: 11, weight: 700 });

      if (s.isCelebrating) {
        drawCelebrationOverlay(ctx, w, h, `You paid exact ₹${s.targetPrice}!`, 3, s.particles);
      }
    },

    onPointerDown: (x, y, s) => {
      if (s.isCelebrating) {
        s.isCelebrating = false;
        return;
      }
      const w = 800;

      // Note taps
      const noteVals = [50, 20, 10];
      noteVals.forEach((val, idx) => {
        const nx = w * 0.43 + idx * 115;
        const ny = 145;
        if (x >= nx && x <= nx + 100 && y >= ny && y <= ny + 60) {
          s.currentPaid += val;
          FoundationalAudio.playCountTick(val);
        }
      });

      // Coin taps
      const coinVals = [5, 2, 1];
      coinVals.forEach((val, idx) => {
        const cx = w * 0.46 + idx * 115;
        const cy = 235;
        if (Math.hypot(x - cx, y - cy) <= 26) {
          s.currentPaid += val;
          FoundationalAudio.playPop();
        }
      });

      // Reset
      if (x >= w * 0.58 && x <= w * 0.58 + 120 && y >= 305 && y <= 305 + 42) {
        s.currentPaid = 0;
        FoundationalAudio.playPop();
      }

      // Check payment
      if (s.currentPaid === s.targetPrice) {
        s.isCelebrating = true;
        s.particles = createConfettiBurst(w, 500, 50);
        FoundationalAudio.playCelebrationFanfare();
        FoundationalNarrator.speak(`Splendid! Exact payment of ₹${s.targetPrice} completed!`);
      } else if (s.currentPaid > s.targetPrice) {
        s.feedbackText = `You paid ₹${s.currentPaid}, which is ₹${s.currentPaid - s.targetPrice} more than ₹${s.targetPrice}. Reset and try exact amount!`;
      } else {
        s.feedbackText = `Paid: ₹${s.currentPaid}. Need ₹${s.targetPrice - s.currentPaid} more.`;
      }
    },
  },
});

/* ══════════════════════════════════════════════════════════════════════════
   M07 — SHAPE EXPLORER: FLAT SHAPES & SOLID OBJECTS
   NCERT Joyful Mathematics & LO M209
   ══════════════════════════════════════════════════════════════════════════ */

interface ShapeExplorerState {
  currentShape: 'sphere' | 'cube' | 'cylinder' | 'cone';
  testSurface: 'ramp' | 'table';
  rampAngle: number;
  motionResult: 'rolls' | 'slides' | 'both' | 'idle';
  feedbackText: string;
  isCelebrating: boolean;
  particles: IParticle[];
  time: number;
}

export const class2ShapeExplorer: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class2-shape-explorer',
  title: 'Shape Explorer: Flat Shapes and Solid Objects',
  band: 'GRADES_1_8',
  level: 'class-2',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '🎲',
  topic: '2D Flat Shapes & 3D Solids (LO M209)',
  shortDescription: 'Explore 3D solids (cube, sphere, cylinder, cone) and test whether they roll, slide, or do both on an inclined ramp.',
  detailedDescription: 'Directly aligned with NCERT Class 2 shapes outcome LO M209. Children inspect faces and edges of cubes, spheres, cones, and cylinders, testing rolling vs sliding properties.',
  learningObjectives: [
    'Observe and identify 3D solids: cube, cuboid, cylinder, cone, sphere (LO M209)',
    'Distinguish curved surfaces from flat surfaces',
    'Demonstrate why curved surfaces roll while flat surfaces slide',
  ],
  parameters: [
    P.select('shape', 'Select 3D Shape', [
      ['sphere', 'Sphere (गेंद / गोला)'],
      ['cube', 'Cube (घन / पासा)'],
      ['cylinder', 'Cylinder (बेलन / डिब्बा)'],
      ['cone', 'Cone (शंकु / जोकर की टोपी)'],
    ]),
  ],
  metrics: [
    metric('shape', 'Shape', (s) => (s.currentShape ? s.currentShape.toUpperCase() : 'SPHERE')),
    metric('behavior', 'Motion Test', (s) => (s.motionResult ? s.motionResult.toUpperCase() : 'IDLE')),
  ],
  tags: ['class 2', 'math', 'ncert', 'geometry', 'shapes', 'solids', 'rolling and sliding'],

  engine: {
    createInitialState: (params): ShapeExplorerState => {
      const sh = (params.shape as any) || 'sphere';
      FoundationalNarrator.speak(`Explore the ${sh}! Tap Test on Ramp to see if it rolls or slides!`);
      return {
        currentShape: sh,
        testSurface: 'ramp',
        rampAngle: 25,
        motionResult: 'idle',
        feedbackText: `Select ${sh} and test rolling vs sliding on the ramp!`,
        isCelebrating: false,
        particles: [],
        time: 0,
      };
    },

    reset: (s) => {
      s.motionResult = 'idle';
      s.isCelebrating = false;
      return s;
    },

    update: (s, params, dt) => {
      s.time += dt;
      if (params.shape && params.shape !== s.currentShape) {
        s.currentShape = params.shape as any;
        s.motionResult = 'idle';
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
        'Shape Explorer (आकृतियों की खोज)',
        { subPrompt: s.feedbackText, y: 16 }
      );

      // Ramp Visual (Left Center)
      const rx = w * 0.12;
      const ry = 140;
      const rw = w * 0.45;
      const rh = 180;

      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.moveTo(rx, ry + rh);
      ctx.lineTo(rx + rw, ry);
      ctx.lineTo(rx + rw, ry + rh);
      ctx.closePath();
      ctx.fill();

      const sx = rx + rw * 0.60;
      const sy = ry + rh * 0.35;

      if (s.currentShape === 'sphere') {
        circle(ctx, sx, sy, 28, '#EF4444', '#F87171', 2);
        text(ctx, 'Sphere (गोला)', sx, sy + 45, { color: '#FCA5A5', size: 11, weight: 700 });
      } else if (s.currentShape === 'cube') {
        roundRect(ctx, sx - 24, sy - 24, 48, 48, 4, '#3B82F6', '#60A5FA', 2);
        text(ctx, 'Cube (घन)', sx, sy + 45, { color: '#93C5FD', size: 11, weight: 700 });
      } else if (s.currentShape === 'cylinder') {
        roundRect(ctx, sx - 20, sy - 28, 40, 56, 12, '#10B981', '#34D399', 2);
        text(ctx, 'Cylinder (बेलन)', sx, sy + 45, { color: '#6EE7B7', size: 11, weight: 700 });
      } else {
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.moveTo(sx, sy - 30);
        ctx.lineTo(sx - 24, sy + 20);
        ctx.lineTo(sx + 24, sy + 20);
        ctx.closePath();
        ctx.fill();
        text(ctx, 'Cone (शंकु)', sx, sy + 45, { color: '#FCD34D', size: 11, weight: 700 });
      }

      // Properties Card (Right)
      roundRect(ctx, w * 0.64, 110, w * 0.28, h * 0.65, 16, '#1E293B', '#38BDF8', 2);
      text(ctx, '🔍 Observable Properties', w * 0.78, 140, { color: '#38BDF8', size: 13, weight: 700 });

      const props: Record<string, { curved: boolean; flat: boolean; behavior: string }> = {
        sphere: { curved: true, flat: false, behavior: 'ROLLS ONLY ⚽' },
        cube: { curved: false, flat: true, behavior: 'SLIDES ONLY 📦' },
        cylinder: { curved: true, flat: true, behavior: 'BOTH ROLLS & SLIDES 🛢️' },
        cone: { curved: true, flat: true, behavior: 'BOTH ROLLS & SLIDES 🍦' },
      };

      const curProp = props[s.currentShape] ?? { curved: true, flat: false, behavior: 'ROLLS ONLY ⚽' };
      text(ctx, `Curved Surface: ${curProp.curved ? 'YES ✅' : 'NO ❌'}`, w * 0.78, 185, { color: '#F8FAFC', size: 12, weight: 700 });
      text(ctx, `Flat Face: ${curProp.flat ? 'YES ✅' : 'NO ❌'}`, w * 0.78, 215, { color: '#F8FAFC', size: 12, weight: 700 });
      text(ctx, `Result: ${curProp.behavior}`, w * 0.78, 255, { color: '#F59E0B', size: 12, weight: 700 });

      // Action Button
      roundRect(ctx, w * 0.22, h * 0.82, 160, 48, 12, '#0284C7', '#38BDF8', 2);
      text(ctx, '🚀 Test on Ramp!', w * 0.22 + 80, h * 0.82 + 24, { color: '#FFF', size: 12, weight: 700 });
    },

    onPointerDown: (x, y, s) => {
      const w = 800;
      const h = 500;

      if (x >= w * 0.22 && x <= w * 0.22 + 160 && y >= h * 0.82 && y <= h * 0.82 + 48) {
        if (s.currentShape === 'sphere') {
          s.motionResult = 'rolls';
          FoundationalAudio.playDrop();
          FoundationalNarrator.speak('The sphere rolls smoothly down because its surface is round and curved!');
          s.feedbackText = 'The sphere ROLLS because of its smooth curved surface!';
        } else if (s.currentShape === 'cube') {
          s.motionResult = 'slides';
          FoundationalAudio.playPop();
          FoundationalNarrator.speak('The cube slides along its flat face without rolling!');
          s.feedbackText = 'The cube SLIDES because all its faces are flat!';
        } else {
          s.motionResult = 'both';
          FoundationalAudio.playSuccessChime();
          FoundationalNarrator.speak(`The ${s.currentShape} can both roll on its curved side and slide on its flat face!`);
          s.feedbackText = `The ${s.currentShape} can BOTH ROLL and SLIDE!`;
        }
      }
    },
  },
});

/* ══════════════════════════════════════════════════════════════════════════
   M09 — LENGTH DETECTIVE: NON-STANDARD UNIFORM UNITS
   NCERT Joyful Mathematics & LO M211
   ══════════════════════════════════════════════════════════════════════════ */

interface LengthDetectiveState {
  chosenUnit: 'paperclip' | 'pencil' | 'eraser';
  targetObject: 'desk' | 'notebook' | 'ribbon';
  placedUnitsCount: number;
  exactUnitLength: number;
  feedbackText: string;
  isCelebrating: boolean;
  particles: IParticle[];
  time: number;
}

export const class2LengthDetective: SchoolSimulationDefinition = defineSchool({
  id: 'g18-class2-length-detective',
  title: 'Length Detective: Measure with Uniform Units',
  band: 'GRADES_1_8',
  level: 'class-2',
  subject: 'Mathematics',
  category: 'school mathematics',
  icon: '📏',
  topic: 'Non-Standard Measurement of Length (LO M211)',
  shortDescription: 'Measure virtual classroom objects using equal paper clips, pencils, and erasers placed end-to-end without gaps or overlaps.',
  detailedDescription: 'Aligned with NCERT Class 2 learning outcome M211. Children learn that measuring length requires uniform units laid continuously end-to-end, and that smaller units give higher count values.',
  learningObjectives: [
    'Estimate and measure lengths using uniform non-standard units (paper clips, erasers) (LO M211)',
    'Understand why measuring units must be placed end-to-end without gaps or overlap',
    'Compare lengths of two classroom objects measured with the same unit',
  ],
  parameters: [
    P.select('unit', 'Measuring Unit', [
      ['paperclip', 'Paper Clip (छोटी क्लिप)'],
      ['eraser', 'Rubber Eraser (रबड़)'],
      ['pencil', 'Short Pencil (पेंसिल)'],
    ]),
    P.select('object', 'Object to Measure', [
      ['notebook', 'Class Notebook (कापी)'],
      ['desk', 'Wooden Study Desk (मेज़)'],
      ['ribbon', 'Red Silk Ribbon (फीता)'],
    ]),
  ],
  metrics: [
    metric('unit', 'Unit Used', (s) => (s.chosenUnit ? s.chosenUnit.toUpperCase() : 'PAPERCLIP')),
    metric('count', 'Units Placed', (s) => `${s.placedUnitsCount || 0}`),
  ],
  tags: ['class 2', 'math', 'ncert', 'measurement', 'length', 'non-standard units'],

  engine: {
    createInitialState: (params): LengthDetectiveState => {
      const u = (params.unit as any) || 'paperclip';
      const o = (params.object as any) || 'notebook';
      FoundationalNarrator.speak(`Measure the ${o} using ${u}s! Lay them end-to-end without any gaps!`);
      return {
        chosenUnit: u,
        targetObject: o,
        placedUnitsCount: 0,
        exactUnitLength: u === 'paperclip' ? 40 : u === 'eraser' ? 60 : 100,
        feedbackText: `Place ${u}s end-to-end to measure the length of the ${o}!`,
        isCelebrating: false,
        particles: [],
        time: 0,
      };
    },

    reset: (s) => {
      s.placedUnitsCount = 0;
      s.isCelebrating = false;
      return s;
    },

    update: (s, params, dt) => {
      s.time += dt;
      if (params.unit && params.unit !== s.chosenUnit) {
        s.chosenUnit = params.unit as any;
        s.exactUnitLength = s.chosenUnit === 'paperclip' ? 40 : s.chosenUnit === 'eraser' ? 60 : 100;
        s.placedUnitsCount = 0;
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
        'Length Detective (लंबाई जासूस)',
        { subPrompt: s.feedbackText, y: 16 }
      );

      // Object to measure in Center
      const objX = w * 0.15;
      const objY = 160;
      const objW = 420;
      const objH = 60;

      roundRect(ctx, objX, objY, objW, objH, 10, '#334155', '#94A3B8', 2);
      text(ctx, `Object to Measure: ${s.targetObject.toUpperCase()}`, objX + objW / 2, objY + 30, {
        color: '#F8FAFC',
        size: 14,
        weight: 700,
      });

      // Measuring Baseline below object
      line(ctx, objX, objY + objH + 15, objX + objW, objY + objH + 15, '#38BDF8', 2);
      circle(ctx, objX, objY + objH + 15, 4, '#38BDF8');
      circle(ctx, objX + objW, objY + objH + 15, 4, '#38BDF8');

      // Draw placed measuring units
      const unitW = s.exactUnitLength;
      for (let i = 0; i < s.placedUnitsCount; i++) {
        const ux = objX + i * unitW;
        const uy = objY + objH + 25;
        roundRect(ctx, ux, uy, unitW - 4, 30, 6, '#0284C7', '#38BDF8', 2);
        text(ctx, `${s.chosenUnit.slice(0, 4)} ${i + 1}`, ux + unitW / 2 - 2, uy + 15, {
          color: '#FFF',
          size: 10,
          weight: 700,
        });
      }

      // Count Display
      roundRect(ctx, w * 0.72, 130, 160, 90, 12, '#1E293B', '#F59E0B', 2);
      text(ctx, 'TOTAL UNITS', w * 0.72 + 80, 155, { color: '#94A3B8', size: 10, weight: 700 });
      text(ctx, `${s.placedUnitsCount}`, w * 0.72 + 80, 195, { color: '#F59E0B', size: 32, weight: 700 });

      // Action Buttons
      roundRect(ctx, w * 0.25, h * 0.78, 140, 48, 10, '#0284C7', '#38BDF8', 2);
      text(ctx, `+ Lay 1 ${s.chosenUnit}`, w * 0.25 + 70, h * 0.78 + 24, { color: '#FFF', size: 11, weight: 700 });

      roundRect(ctx, w * 0.46, h * 0.78, 120, 48, 10, '#475569', '#64748B', 1);
      text(ctx, 'Remove 1', w * 0.46 + 60, h * 0.78 + 24, { color: '#FFF', size: 11, weight: 700 });

      roundRect(ctx, w * 0.64, h * 0.78, 100, 48, 10, '#DC2626', '#EF4444', 1);
      text(ctx, 'Reset', w * 0.64 + 50, h * 0.78 + 24, { color: '#FFF', size: 11, weight: 700 });

      if (s.isCelebrating) {
        drawCelebrationOverlay(ctx, w, h, `Measured ${s.placedUnitsCount} units!`, 3, s.particles);
      }
    },

    onPointerDown: (x, y, s) => {
      if (s.isCelebrating) {
        s.isCelebrating = false;
        return;
      }
      const w = 800;
      const h = 500;

      // Add unit
      if (x >= w * 0.25 && x <= w * 0.25 + 140 && y >= h * 0.78 && y <= h * 0.78 + 48) {
        s.placedUnitsCount++;
        FoundationalAudio.playCountTick(s.placedUnitsCount);

        const targetUnitsNeeded = Math.round(420 / s.exactUnitLength);
        if (s.placedUnitsCount === targetUnitsNeeded) {
          s.isCelebrating = true;
          s.particles = createConfettiBurst(w, h, 45);
          FoundationalAudio.playCelebrationFanfare();
          FoundationalNarrator.speak(`Perfect! The ${s.targetObject} is exactly ${s.placedUnitsCount} ${s.chosenUnit}s long!`);
        }
      }

      // Remove unit
      if (x >= w * 0.46 && x <= w * 0.46 + 120 && y >= h * 0.78 && y <= h * 0.78 + 48) {
        if (s.placedUnitsCount > 0) {
          s.placedUnitsCount--;
          FoundationalAudio.playPop();
        }
      }

      // Reset
      if (x >= w * 0.64 && x <= w * 0.64 + 100 && y >= h * 0.78 && y <= h * 0.78 + 48) {
        s.placedUnitsCount = 0;
        FoundationalAudio.playPop();
      }
    },
  },
});

/* Export All Class 2 Math Simulations */
export const CLASS2_MATH_SIMULATIONS: SchoolSimulationDefinition[] = [
  class2NumberVillage,
  class2TensAndOnes,
  class2RupeeMarket,
  class2ShapeExplorer,
  class2LengthDetective,
];

/**
 * Class 9–12 Physics Simulations Suite
 * Real-time, interactive, parameter-driven physics laboratories aligned with CBSE / NCERT / NEB Classes 9–12:
 * 1. Projectile Motion Laboratory (Kinematics & Multi-Planet Gravity)
 * 2. Simple & Damped Harmonic Pendulum (SHM & Energy Conservation)
 * 3. 1D & 2D Elastic and Inelastic Collisions (Linear Momentum & Restitution)
 * 4. Inclined Plane & Free Body Diagram (FBD, Friction & Resolving Forces)
 * 5. Geometrical Optics: Refraction, Snell's Law & Thin Lenses (Ray Optics)
 * 6. Waves & Harmonic Superposition (Standing & Traveling Waves)
 * 7. DC Circuits & Lorentz Magnetic Force (Ohm's Law & Electromagnetism)
 * 8. Thermodynamics & Kinetic Gas Chamber (Ideal Gas Law PV=nRT & Kinetic Theory)
 */

import { C, P, arrow, circle, clear, defineSchool, fmt, line, metric, roundRect, text, timeEngine, type TimeState } from './kit';

// ─────────────────────────────────────────────────────────────
// 1. PROJECTILE MOTION LABORATORY (Class 11 Physics)
// ─────────────────────────────────────────────────────────────
interface ProjectileState extends TimeState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: Array<[number, number]>;
  maxH: number;
  landed: boolean;
  flightT: number;
}

const CELESTIAL_GRAVITY: Record<string, { name: string; g: number; col: string }> = {
  earth:   { name: 'Earth (9.81 m/s²)',   g: 9.81,  col: '#38bdf8' },
  moon:    { name: 'Moon (1.62 m/s²)',    g: 1.62,  col: '#facc15' },
  mars:    { name: 'Mars (3.71 m/s²)',    g: 3.71,  col: '#fb923c' },
  jupiter: { name: 'Jupiter (24.79 m/s²)', g: 24.79, col: '#f43f5e' },
};

export const class912Projectile = defineSchool({
  id: 'g912-physics-projectile',
  title: 'Projectile Motion Laboratory',
  band: 'GRADES_9_12',
  level: 'grade-11',
  levelLabel: 'Class 11',
  subject: 'Physics',
  category: 'Mechanics & Kinematics',
  icon: '🚀',
  topic: '2D Motion under Gravity, Trajectory & Air Resistance',
  shortDescription: 'Launch projectiles at variable angles and speeds; analyze parabolic trajectories, maximum height, range, and planetary gravity.',
  detailedDescription: 'Simulates classical 2D projectile motion under constant gravitational acceleration. Calculate horizontal and vertical components of initial velocity (vx = v0·cosθ, vy = v0·sinθ), instantaneous coordinates (x = vx·t, y = h0 + vy·t − ½g·t²), time of flight, peak height, and impact range. Compare trajectories across Earth (9.81 m/s²), Moon (1.62 m/s²), and Mars (3.71 m/s²).',
  learningObjectives: [
    'Decompose initial velocity into horizontal and vertical components (vx, vy)',
    'Calculate maximum height H = (v0²·sin²θ)/(2g) and total time of flight',
    'Determine horizontal range R = (v0²·sin 2θ)/g and verify that 45° yields maximum range',
    'Observe the effect of air resistance and different planetary gravitational fields'
  ],
  formulaOverview: 'x(t) = v₀·cos(θ)·t;  y(t) = h₀ + v₀·sin(θ)·t − ½·g·t²;  R = (v₀²·sin 2θ)/g;  H_max = (v₀·sin θ)²/(2g)',
  parameters: [
    P.range('angle', 'Launch angle θ', 10, 85, 45, 1, '°'),
    P.range('v0', 'Initial velocity v₀', 10, 60, 30, 1, 'm/s'),
    P.range('h0', 'Initial height h₀', 0, 30, 0, 1, 'm'),
    P.select('planet', 'Celestial body', Object.entries(CELESTIAL_GRAVITY).map(([k, v]) => [k, v.name]), 'earth'),
    P.toggle('airDrag', 'Air resistance (drag)', false),
    P.toggle('vectors', 'Show velocity vectors', true),
  ],
  metrics: [
    metric('range', 'Range R', (_s, p) => {
      const g = CELESTIAL_GRAVITY[p.planet]?.g ?? 9.81;
      const rad = (p.angle * Math.PI) / 180;
      const vx = p.v0 * Math.cos(rad);
      const vy = p.v0 * Math.sin(rad);
      const tFlight = (vy + Math.sqrt(vy * vy + 2 * g * p.h0)) / g;
      return `${fmt(vx * tFlight, 1)} m`;
    }),
    metric('maxH', 'Max Height H', (_s, p) => {
      const g = CELESTIAL_GRAVITY[p.planet]?.g ?? 9.81;
      const rad = (p.angle * Math.PI) / 180;
      const vy = p.v0 * Math.sin(rad);
      return `${fmt(p.h0 + (vy * vy) / (2 * g), 1)} m`;
    }),
    metric('flightT', 'Flight Time', (_s, p) => {
      const g = CELESTIAL_GRAVITY[p.planet]?.g ?? 9.81;
      const rad = (p.angle * Math.PI) / 180;
      const vy = p.v0 * Math.sin(rad);
      const tFlight = (vy + Math.sqrt(vy * vy + 2 * g * p.h0)) / g;
      return `${fmt(tFlight, 2)} s`;
    }),
    metric('vxvy', 'Initial (vx, vy)', (_s, p) => {
      const rad = (p.angle * Math.PI) / 180;
      return `(${fmt(p.v0 * Math.cos(rad), 1)}, ${fmt(p.v0 * Math.sin(rad), 1)}) m/s`;
    }),
  ],
  tags: ['projectile', 'kinematics', 'mechanics', 'gravity', 'trajectory', 'class 11', 'cbse physics', 'ncert physics'],
  engine: timeEngine(
    (ctx, w, h, s: TimeState, p) => {
      clear(ctx, w, h, 'Class 11 Physics · Projectile Motion Laboratory');
      const st = s as ProjectileState;
      const _g = CELESTIAL_GRAVITY[p.planet]?.g ?? 9.81;
      const planetColor = CELESTIAL_GRAVITY[p.planet]?.col ?? '#38bdf8';

      // Ground baseline and coordinate mapping
      const groundY = h * 0.82;
      const originX = w * 0.12;
      const scale = Math.min((w * 0.76) / 120, (groundY - 60) / 60);

      // Draw ground and grid
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, groundY, w, h - groundY);
      line(ctx, 0, groundY, w, groundY, '#38BDF8', 2);

      // Distance tick marks along the ground
      ctx.fillStyle = C.muted;
      ctx.font = '500 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      for (let m = 0; m <= 150; m += 20) {
        const tx = originX + m * scale;
        if (tx > w - 20) break;
        line(ctx, tx, groundY, tx, groundY + 6, '#64748B', 1.5);
        ctx.fillText(`${m}m`, tx, groundY + 18);
      }

      // Height ticks
      ctx.textAlign = 'right';
      for (let ym = 10; ym <= 60; ym += 10) {
        const ty = groundY - ym * scale;
        if (ty < 40) break;
        line(ctx, originX - 6, ty, originX, ty, '#64748B', 1.5);
        ctx.fillText(`${ym}m`, originX - 10, ty + 3);
      }

      // Launch platform if h0 > 0
      const launchY = groundY - p.h0 * scale;
      if (p.h0 > 0) {
        roundRect(ctx, originX - 18, launchY, 24, p.h0 * scale, 3, '#1E293B', '#475569', 1.5);
      }

      // Trajectory trail
      if (st.trail && st.trail.length > 1) {
        ctx.strokeStyle = planetColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        st.trail.forEach(([tx, ty], i) => {
          const sx = originX + tx * scale;
          const sy = groundY - ty * scale;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        });
        ctx.stroke();

        // Trail dots
        st.trail.forEach(([tx, ty], i) => {
          if (i % 4 === 0) {
            circle(ctx, originX + tx * scale, groundY - ty * scale, 2.5, planetColor);
          }
        });
      }

      // Projectile ball
      const currentX = originX + st.x * scale;
      const currentY = groundY - st.y * scale;

      // Cannon barrel at launch
      const rad = (p.angle * Math.PI) / 180;
      const barrelLen = 28;
      ctx.save();
      ctx.translate(originX, launchY);
      ctx.rotate(-rad);
      roundRect(ctx, 0, -5, barrelLen, 10, 3, '#475569', '#94A3B8', 1.5);
      circle(ctx, 0, 0, 7, '#334155', '#94A3B8', 1.5);
      ctx.restore();

      // Draw ball
      circle(ctx, currentX, currentY, 8, '#F59E0B', '#FBBF24', 2);

      // Velocity vectors if toggled
      if (p.vectors && !st.landed) {
        const vScale = 1.2;
        arrow(ctx, currentX, currentY, currentX + st.vx * vScale, currentY, '#22C55E', 2);
        arrow(ctx, currentX, currentY, currentX, currentY - st.vy * vScale, '#38BDF8', 2);
        arrow(ctx, currentX, currentY, currentX + st.vx * vScale, currentY - st.vy * vScale, '#EF4444', 2.5);
        text(ctx, 'v', currentX + st.vx * vScale + 8, currentY - st.vy * vScale - 6, { size: 11, weight: 700, color: '#EF4444' });
      }

      // Info badge
      roundRect(ctx, w - 230, 24, 210, 88, 8, 'rgba(15,23,42,0.85)', '#334155', 1);
      text(ctx, `Planet: ${CELESTIAL_GRAVITY[p.planet]?.name ?? 'Earth'}`, w - 218, 42, { size: 12, weight: 600, color: planetColor, align: 'left' });
      text(ctx, `v = (${fmt(st.vx, 1)}, ${fmt(st.vy, 1)}) m/s`, w - 218, 62, { size: 12, weight: 500, color: '#E2E8F0', align: 'left' });
      text(ctx, `Position: x=${fmt(st.x, 1)}m, y=${fmt(st.y, 1)}m`, w - 218, 82, { size: 12, weight: 500, color: '#94A3B8', align: 'left' });
      text(ctx, `Status: ${st.landed ? 'Landed on ground' : 'Airborne'}`, w - 218, 100, { size: 11, weight: 700, color: st.landed ? '#10B981' : '#F59E0B', align: 'left' });
    },
    (s: TimeState, p, dt) => {
      const st = s as ProjectileState;
      const g = CELESTIAL_GRAVITY[p.planet]?.g ?? 9.81;
      const rad = (p.angle * Math.PI) / 180;
      const v0x = p.v0 * Math.cos(rad);
      const v0y = p.v0 * Math.sin(rad);

      // Reset or initialize
      const configKey = `${p.angle}|${p.v0}|${p.h0}|${p.planet}|${p.airDrag}`;
      if ((st as any).lastConfig !== configKey) {
        (st as any).lastConfig = configKey;
        st.t = 0;
        st.x = 0;
        st.y = p.h0;
        st.vx = v0x;
        st.vy = v0y;
        st.trail = [[0, p.h0]];
        st.maxH = p.h0;
        st.landed = false;
        st.flightT = 0;
      }

      if (!st.landed) {
        const dragCoeff = p.airDrag ? 0.003 : 0;
        const speed = Math.sqrt(st.vx * st.vx + st.vy * st.vy);
        const ax = -dragCoeff * speed * st.vx;
        const ay = -g - dragCoeff * speed * st.vy;

        st.x += st.vx * dt;
        st.y += st.vy * dt;
        st.vx += ax * dt;
        st.vy += ay * dt;
        st.flightT += dt;

        if (st.y > st.maxH) st.maxH = st.y;
        if (st.trail.length < 300) st.trail.push([st.x, Math.max(0, st.y)]);

        if (st.y <= 0) {
          st.y = 0;
          st.landed = true;
        }
      }
    }
  ),
});

// ─────────────────────────────────────────────────────────────
// 2. SIMPLE & DAMPED PENDULUM (Class 11 Physics)
// ─────────────────────────────────────────────────────────────
interface PendulumState extends TimeState {
  theta: number;
  omega: number;
  trail: Array<[number, number]>;
}

export const class912Pendulum = defineSchool({
  id: 'g912-physics-pendulum',
  title: 'Simple & Damped Harmonic Pendulum',
  band: 'GRADES_9_12',
  level: 'grade-11',
  levelLabel: 'Class 11',
  subject: 'Physics',
  category: 'Oscillations & Waves',
  icon: '⏱',
  topic: 'Simple Harmonic Motion (SHM), Restoring Torque & Energy Conservation',
  shortDescription: 'Investigate periodic pendulum oscillations, time period dependency on length and gravity, damping, and kinetic vs potential energy transformation.',
  detailedDescription: 'Simulates the classical nonlinear simple pendulum equation d²θ/dt² + (b/m)·dθ/dt + (g/L)·sin(θ) = 0. Shows real-time kinetic energy K = ½·m·(L·ω)², gravitational potential energy U = m·g·L·(1 − cos θ), restoring torque, and exact period T ≈ 2π√(L/g).',
  learningObjectives: [
    'Verify period formula T = 2π√(L/g) for small angle approximations',
    'Demonstrate independence of period on bob mass',
    'Analyze continuous conversion between Kinetic Energy (K) and Potential Energy (U)',
    'Observe exponential amplitude decay in damped harmonic motion'
  ],
  formulaOverview: 'T = 2π√(L/g);  K = ½·m·(L·ω)²;  U = m·g·L·(1 − cos θ);  E_total = K + U',
  parameters: [
    P.range('length', 'String length L', 0.8, 3.5, 2.0, 0.1, 'm'),
    P.range('mass', 'Bob mass m', 0.5, 5.0, 1.5, 0.5, 'kg'),
    P.range('theta0', 'Initial angle θ₀', 5, 55, 30, 1, '°'),
    P.range('damping', 'Damping factor b', 0, 0.08, 0.015, 0.005),
    P.select('planet', 'Gravity field', Object.entries(CELESTIAL_GRAVITY).map(([k, v]) => [k, v.name]), 'earth'),
  ],
  metrics: [
    metric('period', 'Period T', (_s, p) => {
      const g = CELESTIAL_GRAVITY[p.planet]?.g ?? 9.81;
      return `${fmt(2 * Math.PI * Math.sqrt(p.length / g), 2)} s`;
    }),
    metric('freq', 'Frequency f', (_s, p) => {
      const g = CELESTIAL_GRAVITY[p.planet]?.g ?? 9.81;
      return `${fmt(1 / (2 * Math.PI * Math.sqrt(p.length / g)), 2)} Hz`;
    }),
    metric('energy', 'Mechanical Energy', (s, p) => {
      const st = s as PendulumState;
      const g = CELESTIAL_GRAVITY[p.planet]?.g ?? 9.81;
      const theta = st.theta ?? (p.theta0 * Math.PI) / 180;
      const omega = st.omega ?? 0;
      const k = 0.5 * p.mass * Math.pow(p.length * omega, 2);
      const u = p.mass * g * p.length * (1 - Math.cos(theta));
      return `${fmt(k + u, 2)} J`;
    }),
  ],
  tags: ['pendulum', 'SHM', 'oscillations', 'energy conservation', 'harmonic motion', 'class 11', 'ncert physics'],
  engine: timeEngine(
    (ctx, w, h, s: TimeState, p) => {
      clear(ctx, w, h, 'Class 11 Physics · Simple & Damped Pendulum');
      const st = s as PendulumState;
      const g = CELESTIAL_GRAVITY[p.planet]?.g ?? 9.81;
      const pivotX = w * 0.42;
      const pivotY = h * 0.18;
      const scale = Math.min((h * 0.55) / 3.5, 120);
      const visualL = p.length * scale;

      // Ceiling beam
      roundRect(ctx, pivotX - 80, pivotY - 12, 160, 12, 3, '#334155', '#64748B', 1.5);
      circle(ctx, pivotX, pivotY, 6, '#F59E0B', '#B45309', 2);

      const theta = st.theta ?? (p.theta0 * Math.PI) / 180;
      const bobX = pivotX + visualL * Math.sin(theta);
      const bobY = pivotY + visualL * Math.cos(theta);

      // Arc trace
      ctx.strokeStyle = 'rgba(201,168,76,0.2)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, visualL, Math.PI / 2 - 0.9, Math.PI / 2 + 0.9);
      ctx.stroke();
      ctx.setLineDash([]);

      // Vertical equilibrium line
      line(ctx, pivotX, pivotY, pivotX, pivotY + visualL + 20, '#475569', 1, [3, 3]);

      // String
      line(ctx, pivotX, pivotY, bobX, bobY, '#E2E8F0', 2);

      // Bob with mass-dependent radius
      const bobR = 12 + p.mass * 2.5;
      circle(ctx, bobX, bobY, bobR, '#0284C7', '#38BDF8', 2.5);
      text(ctx, `${p.mass}kg`, bobX, bobY, { size: 10, weight: 700, color: '#FFFFFF' });

      // Live Angle indicator
      const deg = fmt((theta * 180) / Math.PI, 1);
      text(ctx, `θ = ${deg}°`, pivotX, pivotY + 36, { size: 12, weight: 600, color: '#FBBF24' });

      // Energy Bar Charts on right side
      const omega = st.omega ?? 0;
      const k = 0.5 * p.mass * Math.pow(p.length * omega, 2);
      const u = p.mass * g * p.length * (1 - Math.cos(theta));
      const totalE = Math.max(0.01, k + u);

      const barX = w * 0.76;
      const barY = h * 0.28;
      const barH = h * 0.42;

      roundRect(ctx, barX - 16, barY - 28, 160, barH + 54, 8, '#0F172A', '#334155', 1);
      text(ctx, 'ENERGY GAUGES', barX + 64, barY - 12, { size: 11, weight: 700, color: '#E8C96B' });

      // K bar
      const kH = (k / totalE) * barH;
      roundRect(ctx, barX, barY + barH - kH, 36, kH, 4, '#22C55E');
      text(ctx, 'K', barX + 18, barY + barH + 16, { size: 12, weight: 700, color: '#22C55E' });

      // U bar
      const uH = (u / totalE) * barH;
      roundRect(ctx, barX + 54, barY + barH - uH, 36, uH, 4, '#38BDF8');
      text(ctx, 'U', barX + 72, barY + barH + 16, { size: 12, weight: 700, color: '#38BDF8' });

      // Total bar
      roundRect(ctx, barX + 108, barY, 18, barH, 4, '#F59E0B');
      text(ctx, 'E', barX + 117, barY + barH + 16, { size: 12, weight: 700, color: '#F59E0B' });
    },
    (s: TimeState, p, dt) => {
      const st = s as PendulumState;
      const g = CELESTIAL_GRAVITY[p.planet]?.g ?? 9.81;
      const configKey = `${p.length}|${p.mass}|${p.theta0}|${p.damping}|${p.planet}`;

      if ((st as any).lastConfig !== configKey) {
        (st as any).lastConfig = configKey;
        st.theta = (p.theta0 * Math.PI) / 180;
        st.omega = 0;
      }

      // Euler-Cromer integration for stable energy behavior
      const alpha = -(g / p.length) * Math.sin(st.theta) - (p.damping / p.mass) * st.omega;
      st.omega += alpha * dt;
      st.theta += st.omega * dt;
    }
  ),
});

// ─────────────────────────────────────────────────────────────
// 3. 1D & 2D COLLISIONS (Class 11 Physics)
// ─────────────────────────────────────────────────────────────
interface CollisionState extends TimeState {
  x1: number;
  x2: number;
  v1: number;
  v2: number;
  collided: boolean;
  flash: number;
}

export const class912Collision = defineSchool({
  id: 'g912-physics-collision',
  title: '1D Elastic & Inelastic Collisions',
  band: 'GRADES_9_12',
  level: 'grade-11',
  levelLabel: 'Class 11',
  subject: 'Physics',
  category: 'Linear Momentum & Impulse',
  icon: '💥',
  topic: 'Conservation of Linear Momentum & Coefficient of Restitution',
  shortDescription: 'Colliding carts on a frictionless track; observe conservation of momentum and energy exchange for elastic (e=1) and inelastic (e=0) impacts.',
  detailedDescription: 'Applies the law of conservation of linear momentum: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂. Coefficient of restitution e = −(v₂ − v₁) / (u₂ − u₁) determines whether kinetic energy is fully conserved (e=1 elastic) or dissipated into thermal/deformation work (e=0 perfectly inelastic).',
  learningObjectives: [
    'Verify conservation of momentum regardless of collision elasticity',
    'Calculate final velocities v1, v2 analytically from m1, m2, u1, u2 and e',
    'Differentiate between elastic (zero KE loss) and inelastic collisions',
    'Analyze impulse exchanged during the impact duration'
  ],
  formulaOverview: 'm₁·u₁ + m₂·u₂ = m₁·v₁ + m₂·v₂;  e = −(v₂ − v₁)/(u₂ − u₁);  ΔK = K_initial − K_final',
  parameters: [
    P.range('m1', 'Cart 1 mass m₁', 0.5, 5.0, 2.0, 0.5, 'kg'),
    P.range('u1', 'Cart 1 speed u₁', 0.5, 6.0, 3.0, 0.5, 'm/s'),
    P.range('m2', 'Cart 2 mass m₂', 0.5, 5.0, 3.0, 0.5, 'kg'),
    P.range('u2', 'Cart 2 speed u₂', -6.0, 0.0, -2.0, 0.5, 'm/s'),
    P.range('e', 'Restitution e (1=Elastic, 0=Inelastic)', 0, 1, 1, 0.1),
  ],
  metrics: [
    metric('pInitial', 'Initial Momentum p_i', (_s, p) => `${fmt(p.m1 * p.u1 + p.m2 * p.u2, 2)} kg·m/s`),
    metric('pFinal', 'Final Momentum p_f', (_s, p) => {
      // Analytical final velocities
      const v1 = ((p.m1 - p.e * p.m2) * p.u1 + (1 + p.e) * p.m2 * p.u2) / (p.m1 + p.m2);
      const v2 = ((1 + p.e) * p.m1 * p.u1 + (p.m2 - p.e * p.m1) * p.u2) / (p.m1 + p.m2);
      return `${fmt(p.m1 * v1 + p.m2 * v2, 2)} kg·m/s`;
    }),
    metric('keLoss', 'Kinetic Energy Loss ΔK', (_s, p) => {
      const ki = 0.5 * p.m1 * p.u1 * p.u1 + 0.5 * p.m2 * p.u2 * p.u2;
      const v1 = ((p.m1 - p.e * p.m2) * p.u1 + (1 + p.e) * p.m2 * p.u2) / (p.m1 + p.m2);
      const v2 = ((1 + p.e) * p.m1 * p.u1 + (p.m2 - p.e * p.m1) * p.u2) / (p.m1 + p.m2);
      const kf = 0.5 * p.m1 * v1 * v1 + 0.5 * p.m2 * v2 * v2;
      return `${fmt(Math.max(0, ki - kf), 2)} J (${fmt(((ki - kf) / (ki || 1)) * 100, 1)}%)`;
    }),
  ],
  tags: ['collision', 'momentum', 'elastic', 'inelastic', 'impulse', 'class 11', 'cbse physics'],
  engine: timeEngine(
    (ctx, w, h, s: TimeState, p) => {
      clear(ctx, w, h, 'Class 11 Physics · 1D Collisions & Momentum');
      const st = s as CollisionState;
      const trackY = h * 0.62;

      // Air track bed
      roundRect(ctx, w * 0.08, trackY, w * 0.84, 18, 4, '#1E293B', '#475569', 2);
      // Track support legs
      line(ctx, w * 0.16, trackY + 18, w * 0.16, trackY + 45, '#64748B', 3);
      line(ctx, w * 0.84, trackY + 18, w * 0.84, trackY + 45, '#64748B', 3);

      const cart1W = 50 + p.m1 * 8;
      const cart2W = 50 + p.m2 * 8;
      const cartH = 34;

      // Impact flash
      if (st.flash > 0) {
        ctx.fillStyle = `rgba(245, 158, 11, ${st.flash})`;
        circle(ctx, (st.x1 + cart1W + st.x2) / 2, trackY - cartH / 2, 28 + (1 - st.flash) * 20);
      }

      // Cart 1 (Blue)
      roundRect(ctx, st.x1, trackY - cartH, cart1W, cartH, 6, '#0284C7', '#38BDF8', 2);
      circle(ctx, st.x1 + 12, trackY, 5, '#0F172A', '#94A3B8', 1.5);
      circle(ctx, st.x1 + cart1W - 12, trackY, 5, '#0F172A', '#94A3B8', 1.5);
      text(ctx, `m₁=${p.m1}kg`, st.x1 + cart1W / 2, trackY - cartH / 2, { size: 11, weight: 700, color: '#fff' });

      // Cart 1 Velocity Vector
      arrow(ctx, st.x1 + cart1W / 2, trackY - cartH - 14, st.x1 + cart1W / 2 + st.v1 * 14, trackY - cartH - 14, '#38BDF8', 2.5);
      text(ctx, `${fmt(st.v1, 1)} m/s`, st.x1 + cart1W / 2, trackY - cartH - 28, { size: 11, weight: 600, color: '#38BDF8' });

      // Cart 2 (Orange)
      roundRect(ctx, st.x2, trackY - cartH, cart2W, cartH, 6, '#EA580C', '#FB923C', 2);
      circle(ctx, st.x2 + 12, trackY, 5, '#0F172A', '#94A3B8', 1.5);
      circle(ctx, st.x2 + cart2W - 12, trackY, 5, '#0F172A', '#94A3B8', 1.5);
      text(ctx, `m₂=${p.m2}kg`, st.x2 + cart2W / 2, trackY - cartH / 2, { size: 11, weight: 700, color: '#fff' });

      // Cart 2 Velocity Vector
      arrow(ctx, st.x2 + cart2W / 2, trackY - cartH - 14, st.x2 + cart2W / 2 + st.v2 * 14, trackY - cartH - 14, '#FB923C', 2.5);
      text(ctx, `${fmt(st.v2, 1)} m/s`, st.x2 + cart2W / 2, trackY - cartH - 28, { size: 11, weight: 600, color: '#FB923C' });

      // Status HUD
      roundRect(ctx, w * 0.15, h * 0.18, w * 0.7, 70, 8, '#0F172A', '#334155', 1);
      text(ctx, `COLLISION TYPE: ${p.e === 1 ? 'Elastic Collision (e=1, Kinetic Energy Conserved)' : p.e === 0 ? 'Perfectly Inelastic (e=0, Carts Stick Together)' : `Inelastic Collision (e=${p.e})`}`, w * 0.5, h * 0.18 + 22, { size: 13, weight: 700, color: '#E8C96B' });
      text(ctx, `Momentum: p_initial = ${fmt(p.m1 * p.u1 + p.m2 * p.u2, 2)} kg·m/s  ==  p_current = ${fmt(p.m1 * st.v1 + p.m2 * st.v2, 2)} kg·m/s`, w * 0.5, h * 0.18 + 48, { size: 12, weight: 600, color: '#22C55E' });
    },
    (s: TimeState, p, dt) => {
      const st = s as CollisionState;
      const configKey = `${p.m1}|${p.u1}|${p.m2}|${p.u2}|${p.e}`;
      const cart1W = 50 + p.m1 * 8;
      const _cart2W = 50 + p.m2 * 8;

      if ((st as any).lastConfig !== configKey || st.x1 == null) {
        (st as any).lastConfig = configKey;
        st.x1 = 120;
        st.x2 = 520;
        st.v1 = p.u1;
        st.v2 = p.u2;
        st.collided = false;
        st.flash = 0;
      }

      st.x1 += st.v1 * dt * 40;
      st.x2 += st.v2 * dt * 40;
      if (st.flash > 0) st.flash = Math.max(0, st.flash - dt * 3);

      // Check collision
      if (!st.collided && st.x1 + cart1W >= st.x2) {
        st.collided = true;
        st.flash = 1;
        // Restitution 1D formula
        const v1 = ((p.m1 - p.e * p.m2) * p.u1 + (1 + p.e) * p.m2 * p.u2) / (p.m1 + p.m2);
        const v2 = ((1 + p.e) * p.m1 * p.u1 + (p.m2 - p.e * p.m1) * p.u2) / (p.m1 + p.m2);
        st.v1 = v1;
        st.v2 = v2;
      }

      // Loop reset
      if (st.x1 < 40 || st.x2 > 800 || st.x1 > 800) {
        st.x1 = 120;
        st.x2 = 520;
        st.v1 = p.u1;
        st.v2 = p.u2;
        st.collided = false;
      }
    }
  ),
});

// ─────────────────────────────────────────────────────────────
// 4. INCLINED PLANE & FREE BODY DIAGRAM (Class 11 Physics)
// ─────────────────────────────────────────────────────────────
interface InclineState extends TimeState {
  dist: number;
  v: number;
}

export const class912Incline = defineSchool({
  id: 'g912-physics-incline',
  title: 'Inclined Plane & Free Body Diagram (FBD)',
  band: 'GRADES_9_12',
  level: 'grade-11',
  levelLabel: 'Class 11',
  subject: 'Physics',
  category: 'Forces & Newton’s Laws',
  icon: '📐',
  topic: 'Normal Force, Static vs Kinetic Friction, and Component Resolution',
  shortDescription: 'Place a block on an adjustable incline; resolve gravity into parallel and perpendicular components and observe the threshold angle of repose.',
  detailedDescription: 'Resolves the gravitational force W = mg into components along (W_parallel = mg·sin θ) and perpendicular to (W_perp = mg·cos θ) the incline. When tan θ ≤ μ_s, static friction f_s balances the sliding force and the block rests. When tan θ > μ_s, net acceleration a = g·(sin θ − μ_k·cos θ) moves the block downward.',
  learningObjectives: [
    'Draw and interpret the Free Body Diagram on an inclined plane',
    'Calculate the Normal Force N = mg·cos θ and maximum static friction f_max = μs·N',
    'Demonstrate the angle of repose θ_repose = arctan(μs)',
    'Calculate sliding acceleration a = g·(sin θ − μk·cos θ)'
  ],
  formulaOverview: 'N = m·g·cos(θ);  f_s,max = μ_s·N;  a = g·(sin θ − μ_k·cos θ) [sliding if tan θ > μ_s]',
  parameters: [
    P.range('angle', 'Incline Angle θ', 5, 65, 30, 1, '°'),
    P.range('mass', 'Block mass m', 1, 10, 3, 1, 'kg'),
    P.range('muS', 'Static friction coeff. μₛ', 0.1, 0.9, 0.45, 0.05),
    P.range('muK', 'Kinetic friction coeff. μₖ', 0.05, 0.7, 0.25, 0.05),
  ],
  metrics: [
    metric('normal', 'Normal Force N', (_s, p) => {
      const rad = (p.angle * Math.PI) / 180;
      return `${fmt(p.mass * 9.81 * Math.cos(rad), 1)} N`;
    }),
    metric('fSlide', 'Downhill Force F_||', (_s, p) => {
      const rad = (p.angle * Math.PI) / 180;
      return `${fmt(p.mass * 9.81 * Math.sin(rad), 1)} N`;
    }),
    metric('accel', 'Acceleration a', (_s, p) => {
      const rad = (p.angle * Math.PI) / 180;
      const tan = Math.tan(rad);
      if (tan <= p.muS) return '0 m/s² (Stationary)';
      const a = 9.81 * (Math.sin(rad) - p.muK * Math.cos(rad));
      return `${fmt(Math.max(0, a), 2)} m/s²`;
    }),
    metric('repose', 'Angle of Repose', (_s, p) => `${fmt((Math.atan(p.muS) * 180) / Math.PI, 1)}°`),
  ],
  tags: ['incline', 'friction', 'free body diagram', 'forces', 'newton laws', 'class 11', 'ncert physics'],
  engine: timeEngine(
    (ctx, w, h, s: TimeState, p) => {
      clear(ctx, w, h, 'Class 11 Physics · Inclined Plane & FBD');
      const st = s as InclineState;
      const rad = (p.angle * Math.PI) / 180;

      const baseX = w * 0.12;
      const baseY = h * 0.78;
      const rampLen = w * 0.58;
      const topX = baseX + rampLen * Math.cos(rad);
      const topY = baseY - rampLen * Math.sin(rad);

      // Incline Wedge
      ctx.fillStyle = 'rgba(201,168,76,0.15)';
      ctx.strokeStyle = '#C9A84C';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(topX, baseY);
      ctx.lineTo(topX, topY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Angle arc
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(topX, baseY, 45, Math.PI, Math.PI + rad);
      ctx.stroke();
      text(ctx, `θ = ${p.angle}°`, topX - 60, baseY - 16, { size: 12, weight: 700, color: '#F59E0B' });

      // Block Position along ramp
      const blockD = Math.min(rampLen - 60, Math.max(60, st.dist ?? 80));
      const bx = topX - blockD * Math.cos(rad);
      const by = topY + blockD * Math.sin(rad);

      // Draw Block rotated along incline
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(-rad);
      roundRect(ctx, -25, -35, 50, 35, 4, '#0284C7', '#38BDF8', 2);
      text(ctx, `${p.mass}kg`, 0, -17, { size: 11, weight: 700, color: '#fff' });

      // FBD Vectors originating from center of mass (0, -17)
      // Normal Force (Perpendicular Up)
      arrow(ctx, 0, -17, 0, -85, '#22C55E', 2.5);
      text(ctx, 'N', 12, -80, { size: 11, weight: 700, color: '#22C55E' });

      // Friction Force (Along ramp uphill)
      arrow(ctx, 0, -17, 65, -17, '#EF4444', 2.5);
      text(ctx, 'f', 72, -26, { size: 11, weight: 700, color: '#EF4444' });
      ctx.restore();

      // Gravity mg (Straight Down)
      arrow(ctx, bx, by - 17, bx, by + 65, '#F59E0B', 2.5);
      text(ctx, 'mg', bx + 14, by + 60, { size: 11, weight: 700, color: '#F59E0B' });

      // Live status box
      const isSliding = Math.tan(rad) > p.muS;
      roundRect(ctx, w * 0.72, h * 0.22, 190, 110, 8, '#0F172A', '#334155', 1);
      text(ctx, 'STATE ANALYSIS', w * 0.72 + 95, h * 0.22 + 18, { size: 11, weight: 700, color: '#E8C96B' });
      text(ctx, `tan θ = ${fmt(Math.tan(rad), 2)}`, w * 0.72 + 16, h * 0.22 + 42, { size: 12, weight: 600, color: '#E2E8F0', align: 'left' });
      text(ctx, `μ_static = ${p.muS}`, w * 0.72 + 16, h * 0.22 + 62, { size: 12, weight: 600, color: '#94A3B8', align: 'left' });
      text(ctx, isSliding ? 'SLIDING DOWN ➔' : 'RESTING (STATIC) ✓', w * 0.72 + 16, h * 0.22 + 88, {
        size: 12,
        weight: 700,
        color: isSliding ? '#F59E0B' : '#10B981',
        align: 'left',
      });
    },
    (s: TimeState, p, dt) => {
      const st = s as InclineState;
      const rad = (p.angle * Math.PI) / 180;
      const isSliding = Math.tan(rad) > p.muS;

      if (st.dist == null) {
        st.dist = 60;
        st.v = 0;
      }

      if (isSliding) {
        const a = 9.81 * (Math.sin(rad) - p.muK * Math.cos(rad));
        st.v += Math.max(0, a) * dt * 30;
        st.dist += st.v * dt;
        if (st.dist > 380) {
          st.dist = 60;
          st.v = 0;
        }
      } else {
        st.v = 0;
      }
    }
  ),
});

// ─────────────────────────────────────────────────────────────
// 5. GEOMETRICAL OPTICS & SNELL'S LAW (Class 10–12 Physics)
// ─────────────────────────────────────────────────────────────
export const class912Optics = defineSchool({
  id: 'g912-physics-optics',
  title: 'Ray Optics: Refraction, Snell’s Law & Thin Lenses',
  band: 'GRADES_9_12',
  level: 'grade-10',
  levelLabel: 'Class 10–12',
  subject: 'Physics',
  category: 'Ray Optics & Optical Instruments',
  icon: '🔍',
  topic: 'Snell’s Law of Refraction, Total Internal Reflection & Thin Lens Ray Tracing',
  shortDescription: 'Interactive optical bench with laser ray tracing through media interfaces (Snell’s law, critical angle) and convex/concave thin lenses.',
  detailedDescription: 'Demonstrates wave/particle refraction at dielectric boundaries using Snell’s law n₁·sin θ₁ = n₂·sin θ₂. At incident angles greater than the critical angle θ_c = arcsin(n₂/n₁) for dense-to-rare media, 100% Total Internal Reflection occurs. Toggle to Thin Lens mode to trace principal rays through converging and diverging lenses.',
  learningObjectives: [
    'Verify Snell’s law n1·sin(θ1) = n2·sin(θ2) across different dielectric media',
    'Calculate and observe Total Internal Reflection (TIR) and critical angle',
    'Trace principal rays for convex and concave lenses',
    'Determine image location, nature (real/virtual), and magnification'
  ],
  formulaOverview: 'n₁·sin(θ₁) = n₂·sin(θ₂);  θ_critical = arcsin(n₂/n₁);  1/f = 1/v − 1/u;  m = v/u',
  parameters: [
    P.select('mode', 'Optical mode', [['refraction', 'Snell’s Law & Refraction'], ['lens', 'Thin Lens Ray Tracer']], 'refraction'),
    P.range('angle', 'Incident angle θ₁', 0, 85, 45, 1, '°'),
    P.select('n1', 'Medium 1 (Incident)', [['1.0', 'Air (n=1.0)'], ['1.33', 'Water (n=1.33)'], ['1.5', 'Glass (n=1.5)'], ['2.42', 'Diamond (n=2.42)']], '1.0'),
    P.select('n2', 'Medium 2 (Refracting)', [['1.5', 'Glass (n=1.5)'], ['1.33', 'Water (n=1.33)'], ['1.0', 'Air (n=1.0)'], ['2.42', 'Diamond (n=2.42)']], '1.5'),
    P.range('focal', 'Lens focal length f', 5, 25, 12, 1, 'cm'),
    P.range('objDist', 'Object distance u', 8, 50, 24, 1, 'cm'),
  ],
  metrics: [
    metric('theta2', 'Refracted Angle θ₂', (_s, p) => {
      if (p.mode === 'lens') return 'N/A (Lens Mode)';
      const n1 = parseFloat(p.n1);
      const n2 = parseFloat(p.n2);
      const rad1 = (p.angle * Math.PI) / 180;
      const sin2 = (n1 * Math.sin(rad1)) / n2;
      if (sin2 > 1.0) return 'TIR (Total Internal Reflection)';
      return `${fmt((Math.asin(sin2) * 180) / Math.PI, 1)}°`;
    }),
    metric('critAngle', 'Critical Angle θ_c', (_s, p) => {
      const n1 = parseFloat(p.n1);
      const n2 = parseFloat(p.n2);
      if (n1 <= n2) return 'None (n1 ≤ n2)';
      return `${fmt((Math.asin(n2 / n1) * 180) / Math.PI, 1)}°`;
    }),
    metric('imgDist', 'Image Distance v', (_s, p) => {
      if (p.mode !== 'lens') return 'N/A';
      const u = p.objDist;
      const f = p.focal;
      if (u === f) return '∞ (At Infinity)';
      const v = (f * u) / (u - f);
      return `${fmt(v, 1)} cm (${v > 0 ? 'Real' : 'Virtual'})`;
    }),
  ],
  tags: ['optics', 'snell law', 'refraction', 'lenses', 'total internal reflection', 'class 10', 'class 12', 'ncert physics'],
  engine: timeEngine((ctx, w, h, _s, p) => {
    clear(ctx, w, h, 'Class 10–12 Physics · Ray Optics & Refraction');

    if (p.mode === 'refraction') {
      const cx = w * 0.48;
      const cy = h * 0.52;
      const n1 = parseFloat(p.n1);
      const n2 = parseFloat(p.n2);

      // Top medium
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(40, 40, w - 80, cy - 40);
      text(ctx, `Medium 1 (n₁ = ${n1})`, 100, 60, { size: 12, weight: 700, color: '#38BDF8', align: 'left' });

      // Bottom medium (tinted by density)
      ctx.fillStyle = n2 > 1.4 ? 'rgba(56, 189, 248, 0.12)' : 'rgba(56, 189, 248, 0.05)';
      ctx.fillRect(40, cy, w - 80, h - cy - 40);
      text(ctx, `Medium 2 (n₂ = ${n2})`, 100, cy + 30, { size: 12, weight: 700, color: '#FBBF24', align: 'left' });

      // Interface line
      line(ctx, 40, cy, w - 40, cy, '#C9A84C', 2);
      // Normal dashed line
      line(ctx, cx, 40, cx, h - 40, '#64748B', 1.5, [4, 4]);

      // Incident ray
      const rad1 = (p.angle * Math.PI) / 180;
      const rayLen = 190;
      const ix = cx - rayLen * Math.sin(rad1);
      const iy = cy - rayLen * Math.cos(rad1);
      arrow(ctx, ix, iy, cx, cy, '#EF4444', 2.5);

      // Refracted or TIR ray
      const sin2 = (n1 * Math.sin(rad1)) / n2;
      if (sin2 > 1.0) {
        // Total internal reflection (reflected ray back into medium 1)
        const rx = cx + rayLen * Math.sin(rad1);
        const ry = cy - rayLen * Math.cos(rad1);
        arrow(ctx, cx, cy, rx, ry, '#F59E0B', 2.5);
        text(ctx, 'TOTAL INTERNAL REFLECTION', cx + 110, cy - 60, { size: 12, weight: 700, color: '#F59E0B' });
      } else {
        const rad2 = Math.asin(sin2);
        const rx = cx + rayLen * Math.sin(rad2);
        const ry = cy + rayLen * Math.cos(rad2);
        arrow(ctx, cx, cy, rx, ry, '#22C55E', 2.5);

        // Weak reflected ray
        const refX = cx + rayLen * 0.7 * Math.sin(rad1);
        const refY = cy - rayLen * 0.7 * Math.cos(rad1);
        line(ctx, cx, cy, refX, refY, 'rgba(239,68,68,0.4)', 1.5, [3, 3]);
      }
    } else {
      // Thin Lens Mode
      const cx = w * 0.5;
      const cy = h * 0.52;
      const scale = 8;
      const u = p.objDist;
      const f = p.focal;

      // Principal axis
      line(ctx, 40, cy, w - 40, cy, '#64748B', 1.5);

      // Convex Lens element
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 14, h * 0.36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Focal points F and 2F
      [-2, -1, 1, 2].forEach(k => {
        const fx = cx + k * f * scale;
        circle(ctx, fx, cy, 3.5, '#FBBF24');
        text(ctx, k === 1 || k === -1 ? 'F' : '2F', fx, cy + 18, { size: 11, weight: 700, color: '#FBBF24' });
      });

      // Object Arrow
      const ox = cx - u * scale;
      const objH = 45;
      arrow(ctx, ox, cy, ox, cy - objH, '#38BDF8', 3);
      text(ctx, 'Object', ox, cy - objH - 12, { size: 11, weight: 600, color: '#38BDF8' });

      // Image calculation: 1/f = 1/v - 1/u
      if (Math.abs(u - f) > 0.5) {
        const v = (f * u) / (u - f);
        const imgH = -objH * (v / u);
        const ix = cx + v * scale;

        // Principal rays
        // Ray 1: Parallel to axis, then through right focal point
        line(ctx, ox, cy - objH, cx, cy - objH, '#EF4444', 1.8);
        line(ctx, cx, cy - objH, ix, cy - imgH, '#EF4444', 1.8);

        // Ray 2: Directly through center
        line(ctx, ox, cy - objH, ix, cy - imgH, '#22C55E', 1.8);

        // Image Arrow
        arrow(ctx, ix, cy, ix, cy - imgH, v > 0 ? '#F59E0B' : '#C084FC', 3);
        text(ctx, v > 0 ? 'Real Image' : 'Virtual Image', ix, cy - imgH + (v > 0 ? 16 : -14), {
          size: 11,
          weight: 700,
          color: v > 0 ? '#F59E0B' : '#C084FC',
        });
      }
    }
  }),
});

// ─────────────────────────────────────────────────────────────
// 6. WAVES & HARMONIC SUPERPOSITION (Class 11 Physics)
// ─────────────────────────────────────────────────────────────
export const class912Waves = defineSchool({
  id: 'g912-physics-waves',
  title: 'Waves & Harmonic Superposition',
  band: 'GRADES_9_12',
  level: 'grade-11',
  levelLabel: 'Class 11',
  subject: 'Physics',
  category: 'Oscillations & Waves',
  icon: '🌊',
  topic: 'Traveling Waves, Standing Waves, Superposition, Nodes & Antinodes',
  shortDescription: 'Explore standing and traveling waves on a string; observe nodes, antinodes, fundamental frequency and harmonics.',
  detailedDescription: 'Simulates classical wave propagation on a string of length L. For standing waves, superposition of forward and reflected waves creates fixed nodes (zero displacement) and antinodes (maximum amplitude): y(x,t) = 2A·sin(kx)·cos(ωt). Demonstrates resonant modes from fundamental (n=1) up to the 5th harmonic.',
  learningObjectives: [
    'Observe formation of standing waves by superposition of identical traveling waves',
    'Identify nodes and antinodes for different harmonic modes n = 1, 2, 3...',
    'Verify relationship between wavelength λ = 2L/n and frequency fn = n·f1',
    'Contrast standing waves with progressive (traveling) waves'
  ],
  formulaOverview: 'y(x,t) = 2A·sin(kx)·cos(ωt);  λ_n = 2L / n;  f_n = n · (v / 2L)',
  parameters: [
    P.select('mode', 'Wave type', [['standing', 'Standing wave (fixed ends)'], ['traveling', 'Traveling wave']], 'standing'),
    P.range('harmonic', 'Harmonic mode n', 1, 5, 2, 1),
    P.range('freq', 'Frequency f', 0.5, 4.0, 1.5, 0.5, 'Hz'),
    P.range('amp', 'Amplitude A', 15, 60, 40, 5, 'mm'),
  ],
  metrics: [
    metric('nodes', 'Nodes / Antinodes', (_s, p) => p.mode === 'standing' ? `${p.harmonic + 1} Nodes, ${p.harmonic} Antinodes` : 'Continuous motion'),
    metric('wavelength', 'Wavelength λ', (_s, p) => `${fmt(2.0 / p.harmonic, 2)} m (for L=2m)`),
    metric('speed', 'Phase Speed v', (_s, p) => `${fmt(p.freq * (2.0 / p.harmonic), 2)} m/s`),
  ],
  tags: ['waves', 'superposition', 'standing waves', 'harmonics', 'acoustics', 'class 11', 'ncert physics'],
  engine: timeEngine((ctx, w, h, s: TimeState, p) => {
    clear(ctx, w, h, 'Class 11 Physics · Waves & Harmonics');
    const midY = h * 0.52;
    const startX = w * 0.12;
    const endX = w * 0.88;
    const stringL = endX - startX;

    // Fixed clamps at both ends
    roundRect(ctx, startX - 14, midY - 30, 14, 60, 3, '#334155', '#64748B', 2);
    roundRect(ctx, endX, midY - 30, 14, 60, 3, '#334155', '#64748B', 2);

    // Equilibrium dashed line
    line(ctx, startX, midY, endX, midY, '#475569', 1, [4, 4]);

    const n = p.harmonic;
    const A = p.amp;
    const omega = 2 * Math.PI * p.freq;

    // Draw Wave
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = 0; px <= stringL; px += 2) {
      const xNorm = px / stringL;
      let yDisp = 0;
      if (p.mode === 'standing') {
        yDisp = A * Math.sin(n * Math.PI * xNorm) * Math.cos(omega * s.t);
      } else {
        yDisp = A * Math.sin(n * 2 * Math.PI * xNorm - omega * s.t);
      }
      if (px === 0) ctx.moveTo(startX + px, midY - yDisp);
      else ctx.lineTo(startX + px, midY - yDisp);
    }
    ctx.stroke();

    // Standing wave nodes (red) and antinodes (green)
    if (p.mode === 'standing') {
      for (let i = 0; i <= n; i++) {
        const nx = startX + (i / n) * stringL;
        circle(ctx, nx, midY, 5, '#EF4444', '#fff', 1.5);
        if (i < n) {
          const ax = startX + ((i + 0.5) / n) * stringL;
          const aY = midY - A * Math.cos(omega * s.t);
          circle(ctx, ax, aY, 4, '#22C55E');
        }
      }
      text(ctx, '🔴 Node (Zero amplitude)    🟢 Antinode (Max amplitude)', w * 0.5, h * 0.78, { size: 12, weight: 600, color: '#E2E8F0' });
    }
  }),
});

// ─────────────────────────────────────────────────────────────
// 7. DC CIRCUITS & LORENTZ FORCE (Class 10 & 12 Physics)
// ─────────────────────────────────────────────────────────────
export const class912Circuits = defineSchool({
  id: 'g912-physics-circuits',
  title: 'DC Circuits & Lorentz Magnetic Force',
  band: 'GRADES_9_12',
  level: 'grade-12',
  levelLabel: 'Class 12',
  subject: 'Physics',
  category: 'Electromagnetism',
  icon: '⚡',
  topic: 'Ohm’s Law, Series & Parallel Resistors, and Charged Particle in Magnetic Field',
  shortDescription: 'Build DC circuits to verify V = I·R, calculate equivalent resistance for series/parallel branches, and observe helical Lorentz force deflection.',
  detailedDescription: 'Covers fundamental circuit analysis: Ohm’s law V = IR, equivalent resistance for series (R1+R2) and parallel (R1·R2/(R1+R2)) networks. In Lorentz mode, simulates the magnetic force F = q(v × B) that exerts a centripetal force causing charged particles to undergo circular cyclotron motion.',
  learningObjectives: [
    'Verify Ohm’s law and power dissipation P = V·I',
    'Calculate equivalent resistance for series and parallel circuits',
    'Demonstrate the right-hand rule for magnetic Lorentz force F = q·v·B',
    'Calculate cyclotron radius r = m·v / (q·B)'
  ],
  formulaOverview: 'V = I·R;  P = I²·R;  R_series = R₁ + R₂;  R_parallel = (R₁·R₂)/(R₁ + R₂);  F_Lorentz = q·(v × B)',
  parameters: [
    P.select('mode', 'Experiment', [['circuit', 'DC Resistor Circuit'], ['lorentz', 'Lorentz Force B-Field']], 'circuit'),
    P.select('config', 'Circuit topology', [['series', 'Series Circuit'], ['parallel', 'Parallel Circuit']], 'series'),
    P.range('volts', 'Voltage V', 2, 24, 12, 1, 'V'),
    P.range('r1', 'Resistor R₁', 2, 40, 10, 1, 'Ω'),
    P.range('r2', 'Resistor R₂', 2, 40, 20, 1, 'Ω'),
    P.range('bField', 'Magnetic Field B', 0.2, 2.0, 1.0, 0.1, 'T'),
  ],
  metrics: [
    metric('req', 'Req', (_s, p) => p.config === 'series' ? `${p.r1 + p.r2} Ω` : `${fmt((p.r1 * p.r2) / (p.r1 + p.r2), 2)} Ω`),
    metric('current', 'Current I', (_s, p) => {
      const req = p.config === 'series' ? p.r1 + p.r2 : (p.r1 * p.r2) / (p.r1 + p.r2);
      return `${fmt(p.volts / req, 2)} A`;
    }),
    metric('power', 'Power P', (_s, p) => {
      const req = p.config === 'series' ? p.r1 + p.r2 : (p.r1 * p.r2) / (p.r1 + p.r2);
      const i = p.volts / req;
      return `${fmt(p.volts * i, 1)} W`;
    }),
  ],
  tags: ['circuits', 'ohm law', 'resistors', 'lorentz force', 'magnetism', 'class 10', 'class 12', 'cbse physics'],
  engine: timeEngine((ctx, w, h, s: TimeState, p) => {
    clear(ctx, w, h, 'Class 10 & 12 Physics · Circuits & Lorentz Force');

    if (p.mode === 'circuit') {
      const cx = w * 0.45;
      const cy = h * 0.52;
      const cw = w * 0.52;
      const ch = h * 0.46;

      // Circuit boundary wires
      roundRect(ctx, cx - cw / 2, cy - ch / 2, cw, ch, 10, 'transparent', '#94A3B8', 2.5);

      // Battery on Left wire
      const batY = cy;
      line(ctx, cx - cw / 2 - 14, batY - 14, cx - cw / 2 + 14, batY - 14, '#EF4444', 3);
      line(ctx, cx - cw / 2 - 8, batY + 14, cx - cw / 2 + 8, batY + 14, '#38BDF8', 5);
      text(ctx, `${p.volts}V`, cx - cw / 2 - 38, batY, { size: 13, weight: 700, color: '#FBBF24' });

      // Resistors on Right / Top
      if (p.config === 'series') {
        // Resistor 1 on top
        roundRect(ctx, cx - 60, cy - ch / 2 - 12, 50, 24, 4, '#1E293B', '#38BDF8', 2);
        text(ctx, `R₁:${p.r1}Ω`, cx - 35, cy - ch / 2, { size: 10, weight: 700, color: '#38BDF8' });

        // Resistor 2 on top
        roundRect(ctx, cx + 20, cy - ch / 2 - 12, 50, 24, 4, '#1E293B', '#FB923C', 2);
        text(ctx, `R₂:${p.r2}Ω`, cx + 45, cy - ch / 2, { size: 10, weight: 700, color: '#FB923C' });
      } else {
        // Parallel branches
        roundRect(ctx, cx + cw / 2 - 25, cy - 45, 50, 24, 4, '#1E293B', '#38BDF8', 2);
        text(ctx, `R₁:${p.r1}Ω`, cx + cw / 2, cy - 33, { size: 10, weight: 700, color: '#38BDF8' });

        roundRect(ctx, cx + cw / 2 - 25, cy + 25, 50, 24, 4, '#1E293B', '#FB923C', 2);
        text(ctx, `R₂:${p.r2}Ω`, cx + cw / 2, cy + 37, { size: 10, weight: 700, color: '#FB923C' });
      }

      // Animated electron current dots along wire
      const req = p.config === 'series' ? p.r1 + p.r2 : (p.r1 * p.r2) / (p.r1 + p.r2);
      const speed = (p.volts / req) * 60;
      const dotPhase = (s.t * speed) % 40;
      for (let d = dotPhase; d < cw; d += 40) {
        circle(ctx, cx - cw / 2 + d, cy - ch / 2, 3, '#FACC15');
      }
    } else {
      // Lorentz force chamber
      const cx = w * 0.48;
      const cy = h * 0.52;
      const radius = 90 / (p.bField || 1);

      // Magnetic field grid (into page ✕)
      for (let x = cx - 180; x <= cx + 180; x += 45) {
        for (let y = cy - 140; y <= cy + 140; y += 45) {
          text(ctx, '✕', x, y, { size: 14, color: '#475569' });
        }
      }
      text(ctx, `Uniform B-Field (${p.bField} T into screen ⊗)`, cx, cy - 160, { size: 12, weight: 700, color: '#38BDF8' });

      // Circular cyclotron orbit
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      circle(ctx, cx, cy, radius, 'transparent', '#38BDF8');
      ctx.setLineDash([]);

      // Orbiting charge
      const ang = s.t * 3;
      const qx = cx + radius * Math.cos(ang);
      const qy = cy + radius * Math.sin(ang);
      circle(ctx, qx, qy, 9, '#EF4444', '#fff', 1.5);
      text(ctx, '+q', qx, qy, { size: 10, weight: 700, color: '#fff' });

      // Force vector pointing inward
      arrow(ctx, qx, qy, cx, cy, '#F59E0B', 2.5);
    }
  }),
});

// ─────────────────────────────────────────────────────────────
// 8. THERMODYNAMICS & KINETIC GAS (Class 11 Physics)
// ─────────────────────────────────────────────────────────────
interface ThermoState extends TimeState {
  particles: Array<{ x: number; y: number; vx: number; vy: number }>;
}

export const class912Thermo = defineSchool({
  id: 'g912-physics-thermodynamics',
  title: 'Thermodynamics & Kinetic Gas Simulator',
  band: 'GRADES_9_12',
  level: 'grade-11',
  levelLabel: 'Class 11',
  subject: 'Physics',
  category: 'Thermal Physics & Kinetic Theory',
  icon: '🔥',
  topic: 'Ideal Gas Law (PV = nRT), Maxwell-Boltzmann Distribution & P-V Work',
  shortDescription: 'Enclosed cylinder with a movable piston and bouncy gas particles; vary temperature and volume to observe pressure response and PV diagrams.',
  detailedDescription: 'Visualizes the microscopic basis of gas pressure P = ⅓·(N/V)·m·v_rms² and macroscopic ideal gas law P·V = n·R·T. Observe molecular collisions transfer momentum to the piston and chamber walls, producing macroscopic pressure measured by a live manometer.',
  learningObjectives: [
    'Relate temperature T directly to average kinetic energy E_k = 3/2·k_B·T',
    'Demonstrate Boyle’s law (P ∝ 1/V) and Charles’s law (V ∝ T)',
    'Calculate pressure from PV = nRT and compute work done W = P·ΔV',
    'Observe molecular collision frequency increases with temperature'
  ],
  formulaOverview: 'P·V = n·R·T;  v_rms = √(3·R·T / M);  E_avg = (3/2)·k_B·T',
  parameters: [
    P.range('temp', 'Temperature T', 100, 600, 300, 10, 'K'),
    P.range('volume', 'Chamber length V', 1.0, 4.0, 2.5, 0.2, 'L'),
    P.range('moles', 'Amount of gas n', 0.5, 3.0, 1.0, 0.5, 'mol'),
  ],
  metrics: [
    metric('pressure', 'Pressure P', (_s, p) => {
      // P = nRT/V in atm (R = 0.0821 L·atm/(mol·K))
      const Pval = (p.moles * 0.0821 * p.temp) / p.volume;
      return `${fmt(Pval, 2)} atm (${fmt(Pval * 101.3, 1)} kPa)`;
    }),
    metric('vrms', 'RMS Velocity v_rms', (_s, p) => `${fmt(Math.sqrt((3 * 8.314 * p.temp) / 0.028), 0)} m/s (N₂)`),
    metric('kinetic', 'Internal Energy U', (_s, p) => `${fmt((3 / 2) * p.moles * 8.314 * p.temp, 0)} J`),
  ],
  tags: ['thermodynamics', 'kinetic theory', 'ideal gas', 'gas laws', 'pressure', 'class 11', 'ncert physics'],
  engine: timeEngine(
    (ctx, w, h, s: TimeState, p) => {
      clear(ctx, w, h, 'Class 11 Physics · Thermodynamics & Kinetic Gas');
      const st = s as ThermoState;

      const chamberX = w * 0.12;
      const chamberY = h * 0.28;
      const chamberH = h * 0.44;
      const chamberMaxW = w * 0.52;
      const chamberW = (p.volume / 4.0) * chamberMaxW;

      // Cylinder body
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(chamberX, chamberY, chamberW, chamberH);
      line(ctx, chamberX, chamberY, chamberX + chamberW, chamberY, '#64748B', 3);
      line(ctx, chamberX, chamberY + chamberH, chamberX + chamberW, chamberY + chamberH, '#64748B', 3);
      line(ctx, chamberX, chamberY, chamberX, chamberY + chamberH, '#64748B', 4);

      // Movable Piston
      roundRect(ctx, chamberX + chamberW - 12, chamberY, 18, chamberH, 3, '#C9A84C', '#E8C96B', 2);
      line(ctx, chamberX + chamberW + 6, chamberY + chamberH / 2, chamberX + chamberMaxW + 40, chamberY + chamberH / 2, '#94A3B8', 6);

      // Particles
      if (st.particles) {
        st.particles.forEach(pt => {
          const px = chamberX + (pt.x % (chamberW - 16)) + 8;
          const py = chamberY + (pt.y % (chamberH - 16)) + 8;
          circle(ctx, px, py, 3.5, '#EF4444', '#FCA5A5', 1);
        });
      }

      // Pressure Gauge dial on Top
      const Pval = (p.moles * 0.0821 * p.temp) / p.volume;
      const dialX = w * 0.78;
      const dialY = h * 0.45;
      const dialR = 48;

      circle(ctx, dialX, dialY, dialR, '#0F172A', '#E8C96B', 3);
      text(ctx, 'PRESSURE', dialX, dialY - 24, { size: 9, weight: 700, color: '#C9A84C' });
      text(ctx, `${fmt(Pval, 1)} atm`, dialX, dialY + 22, { size: 11, weight: 700, color: '#FBBF24' });

      // Needle
      const maxP = 25;
      const needleAngle = -Math.PI * 0.75 + (Math.min(Pval, maxP) / maxP) * Math.PI * 1.5;
      line(ctx, dialX, dialY, dialX + (dialR - 10) * Math.cos(needleAngle), dialY + (dialR - 10) * Math.sin(needleAngle), '#EF4444', 2.5);
      circle(ctx, dialX, dialY, 4, '#fff');
    },
    (s: TimeState, p, dt) => {
      const st = s as ThermoState;
      const count = Math.round(p.moles * 30);

      if (!st.particles || st.particles.length !== count) {
        st.particles = Array.from({ length: count }, () => ({
          x: Math.random() * 200,
          y: Math.random() * 150,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
        }));
      }

      const speedFactor = Math.sqrt(p.temp / 300) * 120;
      st.particles.forEach(pt => {
        pt.x += pt.vx * dt * speedFactor;
        pt.y += pt.vy * dt * speedFactor;
      });
    }
  ),
});

// ─────────────────────────────────────────────────────────────
// EXPORT ALL CLASS 9–12 PHYSICS SIMULATIONS
// ─────────────────────────────────────────────────────────────
export const CLASS_9_12_PHYSICS_SIMULATIONS = [
  class912Projectile,
  class912Pendulum,
  class912Collision,
  class912Incline,
  class912Optics,
  class912Waves,
  class912Circuits,
  class912Thermo,
];

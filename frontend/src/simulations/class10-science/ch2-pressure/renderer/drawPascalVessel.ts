/**
 * drawPascalVessel.ts
 * Dedicated HTML5 Canvas Rendering Engine for Pascal's Law Laboratory (पास्कलको नियम)
 * Grade 10 Science & Technology • Pressure
 * Nepal CDC Aligned
 *
 * Implements:
 * 1. Pascal's Multi-Piston Spherical Vessel with omnidirectional pressure arrows & expressive pistons
 * 2. Hydraulic Lift & Press with U-tube, small/large pistons, car lifting & work conservation
 * 3. Vehicle Hydraulic Brake System with pedal, master/slave cylinders, clamping shoes & rotating drum
 * 4. Realistic Bourdon pressure gauges, fluid flow particles, and collision-free callout labels
 */

import { PistonVesselPort, LiftLoadOption } from '../pascalTypes';
import { HydraulicLiftMetrics, BrakeMetrics } from '../pascalPhysics';

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Background Laboratory Breadboard Grid
 */
export function drawLabCanvasBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // Pure White Base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Subtle clean dot grid (24px spacing)
  ctx.fillStyle = '#cbd5e1';
  const dotSpacing = 24;
  for (let x = 12; x < width; x += dotSpacing) {
    for (let y = 12; y < height; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Soft perimeter frame
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(10, 10, width - 20, height - 20);
}

/**
 * Draw Cute / Expressive Cartoon Face on Piston Head
 */
function drawPistonFace(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angleRad: number,
  expression: 'effort' | 'excited' | 'neutral' | 'popped'
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angleRad + Math.PI / 2);

  // Face background badge
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (expression === 'effort') {
    // Determined / effort eyes (straining)
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    // Left eye (strained curve)
    ctx.beginPath();
    ctx.arc(-4, -2, 3, Math.PI, 0, false);
    ctx.stroke();
    // Right eye
    ctx.beginPath();
    ctx.arc(4, -2, 3, Math.PI, 0, false);
    ctx.stroke();
    // Gritted mouth
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-4, 3, 8, 3);
  } else {
    // Happy / excited eyes (wide open with pupils)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-4, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(4, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye catchlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-3, -3, 1, 0, Math.PI * 2);
    ctx.arc(5, -3, 1, 0, Math.PI * 2);
    ctx.fill();

    // Smiling mouth
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 2, 4.5, 0, Math.PI);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * 1. PASCAL'S SPHERICAL MULTI-PISTON FLASK
 * Demonstrating equal omnidirectional pressure transmission
 */
export function drawPascalSphericalFlask(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  ports: PistonVesselPort[],
  inputForceN: number,
  pressureKpa: number,
  showFaces: boolean,
  animTime: number
) {
  const cx = width * 0.46;
  const cy = height * 0.52;
  const flaskRadius = Math.min(width, height) * 0.22;

  // 1. Fluid Ripples & Radial Pressure Pulse (from center)
  const pulseScale = 1 + (inputForceN > 0 ? Math.sin(animTime * 6) * 0.04 : 0);
  const activeRadius = flaskRadius * pulseScale;

  // Fluid background gradient inside flask
  const fluidGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, activeRadius);
  fluidGrad.addColorStop(0, '#38bdf8');
  fluidGrad.addColorStop(0.65, '#0284c7');
  fluidGrad.addColorStop(1, '#0369a1');

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, activeRadius, 0, Math.PI * 2);
  ctx.fillStyle = fluidGrad;
  ctx.fill();
  ctx.restore();

  // Floating Water Molecules / Shimmer Particles
  ctx.save();
  for (let i = 0; i < 28; i++) {
    const pAngle = (i / 28) * Math.PI * 2 + animTime * 0.3;
    const pDist = (flaskRadius * 0.25) + ((i * 17) % (flaskRadius * 0.65));
    const px = cx + Math.cos(pAngle) * pDist;
    const py = cy + Math.sin(pAngle) * pDist;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(px, py, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. Draw 4 Cylindrical Necks & Movable Pistons
  ports.forEach((port) => {
    const angleRad = (port.angleDeg * Math.PI) / 180;
    const neckLength = 95;
    const neckHalfWidth = Math.max(16, port.areaCm2 * 1.4);

    const nx = cx + Math.cos(angleRad) * (flaskRadius - 8);
    const ny = cy + Math.sin(angleRad) * (flaskRadius - 8);

    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(angleRad);

    // Liquid column extending into neck
    const neckGrad = ctx.createLinearGradient(0, -neckHalfWidth, 0, neckHalfWidth);
    neckGrad.addColorStop(0, '#38bdf8');
    neckGrad.addColorStop(0.5, '#0284c7');
    neckGrad.addColorStop(1, '#0369a1');

    ctx.fillStyle = neckGrad;
    const currentPistonX = neckLength * 0.45 + (port.isInput ? -port.displacementPx : port.displacementPx);
    ctx.fillRect(0, -neckHalfWidth + 2, currentPistonX, (neckHalfWidth - 2) * 2);

    // Glass Neck Walls (Top & Bottom)
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.75)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(0, -neckHalfWidth);
    ctx.lineTo(neckLength, -neckHalfWidth);
    ctx.moveTo(0, neckHalfWidth);
    ctx.lineTo(neckLength, neckHalfWidth);
    ctx.stroke();

    // Neck Flange Rim
    ctx.fillStyle = '#64748b';
    ctx.fillRect(neckLength - 2, -neckHalfWidth - 3, 6, neckHalfWidth * 2 + 6);

    // Piston Head (Watertight Seal)
    const pistonThickness = 14;
    ctx.fillStyle = '#334155';
    ctx.fillRect(currentPistonX, -neckHalfWidth + 1, pistonThickness, (neckHalfWidth - 1) * 2);

    // Rubber O-Ring Seals
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(currentPistonX + 3, -neckHalfWidth + 1, 4, (neckHalfWidth - 1) * 2);

    // Piston Rod / Handle
    const rodLength = 48;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(currentPistonX + pistonThickness, -5, rodLength, 10);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.strokeRect(currentPistonX + pistonThickness, -5, rodLength, 10);

    // Piston End Cap
    ctx.fillStyle = port.color;
    ctx.beginPath();
    ctx.roundRect(currentPistonX + pistonThickness + rodLength - 4, -neckHalfWidth * 0.75, 10, neckHalfWidth * 1.5, 4);
    ctx.fill();
    ctx.stroke();

    // Piston Letter "P"
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('P', currentPistonX + pistonThickness / 2, 0);

    ctx.restore();

    // Draw Piston Face (if enabled)
    if (showFaces) {
      const faceWorldX = nx + Math.cos(angleRad) * (currentPistonX + pistonThickness / 2);
      const faceWorldY = ny + Math.sin(angleRad) * (currentPistonX + pistonThickness / 2) - neckHalfWidth - 14;
      drawPistonFace(ctx, faceWorldX, faceWorldY, angleRad, port.faceExpression);
    }

    // Force Arrows:
    // Input Piston: Orange Arrow pushing IN
    // Output Pistons: Emerald Green Arrow pushing OUT
    const tipDist = flaskRadius + neckLength + (port.isInput ? 20 : 35);
    const fx = cx + Math.cos(angleRad) * tipDist;
    const fy = cy + Math.sin(angleRad) * tipDist;

    ctx.save();
    if (port.isInput) {
      // Input Arrow pointing INTO piston
      drawDirectedArrow(
        ctx,
        fx + Math.cos(angleRad) * 45,
        fy + Math.sin(angleRad) * 45,
        fx,
        fy,
        '#f97316',
        `Force F₁ = ${inputForceN} N`
      );
    } else {
      // Output Arrow pointing OUT of piston
      const calculatedForce = Math.round((pressureKpa * 1000 * (port.areaCm2 / 10000)));
      drawDirectedArrow(
        ctx,
        fx,
        fy,
        fx + Math.cos(angleRad) * 45,
        fy + Math.sin(angleRad) * 45,
        '#10b981',
        `F = ${calculatedForce} N`
      );
    }
    ctx.restore();
  });

  // 3. Central Flask Glass Body with Specular Highlight
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, flaskRadius, 0, Math.PI * 2);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Glass Specular Arc Reflection
  ctx.beginPath();
  ctx.arc(cx - flaskRadius * 0.15, cy - flaskRadius * 0.15, flaskRadius * 0.78, Math.PI * 1.1, Math.PI * 1.6);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.restore();

  // 4. Omnidirectional Pressure Radiation Arrows (Equal in all directions!)
  const arrowAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  const arrowLength = flaskRadius * 0.68;
  const arrowPulse = Math.min(1.0, 0.4 + (pressureKpa / 60));

  arrowAngles.forEach((deg) => {
    const rad = (deg * Math.PI) / 180;
    const startR = 26;
    const endR = startR + arrowLength * arrowPulse;

    const sx = cx + Math.cos(rad) * startR;
    const sy = cy + Math.sin(rad) * startR;
    const ex = cx + Math.cos(rad) * endR;
    const ey = cy + Math.sin(rad) * endR;

    ctx.save();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Arrowhead
    const headLen = 9;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex - headLen * Math.cos(rad - Math.PI / 6), ey - headLen * Math.sin(rad - Math.PI / 6));
    ctx.lineTo(ex - headLen * Math.cos(rad + Math.PI / 6), ey - headLen * Math.sin(rad + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // 5. Central Equal Pressure Core Badge
  ctx.save();
  const badgeRadius = 46;
  ctx.beginPath();
  ctx.arc(cx, cy, badgeRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Badge Text
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EQUAL PRESSURE', cx, cy - 14);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('बराबर चाप', cx, cy + 2);

  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`${pressureKpa.toFixed(1)} kPa`, cx, cy + 18);
  ctx.restore();

  // 6. Top Flask Neck / Stopper
  ctx.save();
  const neckW = 28;
  const neckH = 34;
  ctx.fillStyle = 'rgba(2, 132, 199, 0.35)';
  ctx.fillRect(cx - neckW / 2, cy - flaskRadius - neckH + 4, neckW, neckH);
  ctx.strokeStyle = '#0369a1';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(cx - neckW / 2, cy - flaskRadius - neckH + 4, neckW, neckH);

  // Stopper Plug
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(cx - neckW * 0.7, cy - flaskRadius - neckH - 6, neckW * 1.4, 10);
  ctx.strokeStyle = '#475569';
  ctx.strokeRect(cx - neckW * 0.7, cy - flaskRadius - neckH - 6, neckW * 1.4, 10);
  ctx.restore();

  // 7. Water Droplet Burst Effects if Pressure > 40 kPa
  if (pressureKpa > 40) {
    ctx.save();
    ports.forEach((p) => {
      const pRad = (p.angleDeg * Math.PI) / 180;
      const sprayX = cx + Math.cos(pRad) * (flaskRadius + 110);
      const sprayY = cy + Math.sin(pRad) * (flaskRadius + 110);
      ctx.fillStyle = '#38bdf8';
      for (let s = 0; s < 3; s++) {
        const offX = sprayX + Math.sin(animTime * 8 + s) * 12;
        const offY = sprayY + Math.cos(animTime * 8 + s) * 12;
        ctx.beginPath();
        ctx.arc(offX, offY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }
}

/**
 * 2. HYDRAULIC LIFT & HYDRAULIC PRESS RENDERER
 * Complete with U-tube, small piston, large piston, car load, and work conservation
 */
export function drawHydraulicLift(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  f1: number,
  a1: number,
  a2: number,
  d1: number,
  metrics: HydraulicLiftMetrics,
  selectedLoad: LiftLoadOption,
  liftProgress: number, // 0 (idle) to 1 (full press)
  animTime: number
) {
  const baseX = width * 0.12;
  const baseY = height * 0.78;
  const channelHeight = 44;

  // Cylinder 1 (Small / Effort)
  const c1Width = Math.max(48, a1 * 2.4);
  const c1Height = 220;
  const c1X = baseX + 70;
  const c1Y = baseY - c1Height;

  // Cylinder 2 (Large / Load)
  const c2Width = Math.max(140, a2 * 0.55);
  const c2Height = 220;
  const c2X = width * 0.52;
  const c2Y = baseY - c2Height;

  const currentD1Px = d1 * 3.5 * liftProgress;
  const currentD2Px = metrics.d2LiftDistanceCm * 3.5 * liftProgress;

  // 1. Draw Connecting U-Tube Channel & Fluid
  ctx.save();
  // Fluid Path
  ctx.beginPath();
  // Small cylinder liquid
  ctx.moveTo(c1X, c1Y + 70 + currentD1Px);
  ctx.lineTo(c1X, baseY);
  // Bottom channel
  ctx.lineTo(c2X + c2Width, baseY);
  // Large cylinder liquid
  ctx.lineTo(c2X + c2Width, c2Y + 140 - currentD2Px);
  ctx.lineTo(c2X, c2Y + 140 - currentD2Px);
  ctx.lineTo(c2X, baseY - channelHeight);
  ctx.lineTo(c1X + c1Width, baseY - channelHeight);
  ctx.lineTo(c1X + c1Width, c1Y + 70 + currentD1Px);
  ctx.closePath();

  // Hydraulic Oil Azure Gradient
  const oilGrad = ctx.createLinearGradient(0, c1Y, 0, baseY);
  oilGrad.addColorStop(0, '#38bdf8');
  oilGrad.addColorStop(0.5, '#0284c7');
  oilGrad.addColorStop(1, '#0369a1');
  ctx.fillStyle = oilGrad;
  ctx.fill();

  // Streamline Fluid Particles in Bottom Channel
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  const numParticles = 14;
  for (let i = 0; i < numParticles; i++) {
    const px = c1X + c1Width + ((i * 32 + animTime * 45 * liftProgress) % (c2X - (c1X + c1Width)));
    const py = baseY - channelHeight * 0.5 + Math.sin(animTime * 4 + i) * 6;
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Heavy Steel Cylinder Walls
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  // Small cylinder outer lines
  ctx.beginPath();
  ctx.moveTo(c1X, c1Y);
  ctx.lineTo(c1X, baseY);
  ctx.lineTo(c2X + c2Width, baseY);
  ctx.lineTo(c2X + c2Width, c2Y);
  ctx.stroke();

  // Inner lines
  ctx.beginPath();
  ctx.moveTo(c1X + c1Width, c1Y);
  ctx.lineTo(c1X + c1Width, baseY - channelHeight);
  ctx.lineTo(c2X, baseY - channelHeight);
  ctx.lineTo(c2X, c2Y);
  ctx.stroke();

  // Base Support Feet
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(c1X - 16, baseY, c1Width + 32, 16);
  ctx.fillRect(c2X - 16, baseY, c2Width + 32, 16);
  ctx.restore();

  // 3. Small Piston 1 (Effort)
  const p1TopY = c1Y + 70 + currentD1Px;
  ctx.save();
  // Piston Body
  ctx.fillStyle = '#64748b';
  ctx.fillRect(c1X + 2, p1TopY - 18, c1Width - 4, 18);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(c1X + 2, p1TopY - 14, c1Width - 4, 6); // seal

  // Effort Shaft & Handle
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(c1X + c1Width / 2 - 6, p1TopY - 18 - 85, 12, 85);
  ctx.strokeRect(c1X + c1Width / 2 - 6, p1TopY - 18 - 85, 12, 85);

  // Top Effort Handle
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.roundRect(c1X + c1Width / 2 - 30, p1TopY - 18 - 95, 60, 12, 4);
  ctx.fill();
  ctx.stroke();

  // Piston 1 Area Label
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Piston 1 (A₁ = ${a1} cm²)`, c1X + c1Width / 2, c1Y - 16);

  // Downward Input Force Vector F1
  drawDirectedArrow(
    ctx,
    c1X + c1Width / 2,
    p1TopY - 18 - 145,
    c1X + c1Width / 2,
    p1TopY - 18 - 100,
    '#ea580c',
    `F₁ = ${f1} N`
  );

  // Displacement d1 dimension line
  if (currentD1Px > 2) {
    drawVerticalDimension(
      ctx,
      c1X - 25,
      c1Y + 70,
      p1TopY,
      `d₁ = ${(d1 * liftProgress).toFixed(1)} cm`
    );
  }
  ctx.restore();

  // 4. Large Piston 2 (Load)
  const p2TopY = c2Y + 140 - currentD2Px;
  ctx.save();
  // Large Piston Head
  ctx.fillStyle = '#64748b';
  ctx.fillRect(c2X + 2, p2TopY - 22, c2Width - 4, 22);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(c2X + 2, p2TopY - 16, c2Width - 4, 7); // heavy seal

  // Large Piston Column
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(c2X + c2Width / 2 - 16, p2TopY - 22 - 35, 32, 35);
  ctx.strokeRect(c2X + c2Width / 2 - 16, p2TopY - 22 - 35, 32, 35);

  // Heavy Duty Lift Platform
  const platformY = p2TopY - 22 - 35;
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(c2X - 20, platformY - 12, c2Width + 40, 12, 4);
  ctx.fill();
  ctx.stroke();

  // Yellow & Black Hazard Stripes on Platform
  ctx.save();
  ctx.beginPath();
  ctx.rect(c2X - 18, platformY - 10, c2Width + 36, 8);
  ctx.clip();
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 6;
  for (let s = c2X - 40; s < c2X + c2Width + 40; s += 14) {
    ctx.beginPath();
    ctx.moveTo(s, platformY - 12);
    ctx.lineTo(s + 10, platformY);
    ctx.stroke();
  }
  ctx.restore();

  // 5. Draw Vehicle / Heavy Load on Large Platform
  drawVehicleLoad(ctx, c2X + c2Width / 2, platformY - 12, selectedLoad);

  // Upward Output Force Vector F2
  drawDirectedArrow(
    ctx,
    c2X + c2Width / 2,
    platformY - 12,
    c2X + c2Width / 2,
    platformY - 80,
    '#10b981',
    `F₂ = ${Math.round(metrics.f2OutputN)} N`
  );

  // Piston 2 Area Label
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Piston 2 (A₂ = ${a2} cm²)`, c2X + c2Width / 2, c2Y - 16);

  // Displacement d2 dimension line
  if (currentD2Px > 1) {
    drawVerticalDimension(
      ctx,
      c2X + c2Width + 28,
      c2Y + 140,
      p2TopY,
      `d₂ = ${(metrics.d2LiftDistanceCm * liftProgress).toFixed(2)} cm`
    );
  }
  ctx.restore();

  // 6. Central Work & Pascal Equilibrium Callout Badge
  ctx.save();
  const midX = (c1X + c1Width + c2X) / 2;
  const midY = baseY - channelHeight * 0.5 - 75;

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(midX - 110, midY - 45, 220, 90, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('PASCAL LAW EQUILIBRIUM', midX, midY - 26);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(`P₁ = P₂ = ${metrics.pressureKpa.toFixed(1)} kPa`, midX, midY - 6);

  ctx.fillStyle = '#16a34a';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(`Force Multiplier: ${metrics.mechanicalAdvantage.toFixed(1)}×`, midX, midY + 14);

  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.fillText(`Work In = Work Out ≈ ${metrics.workInputJoules.toFixed(1)} J`, midX, midY + 32);
  ctx.restore();
}

/**
 * Draw Vehicle or Load on Large Platform
 */
function drawVehicleLoad(
  ctx: CanvasRenderingContext2D,
  cx: number,
  bottomY: number,
  load: LiftLoadOption
) {
  ctx.save();
  ctx.translate(cx, bottomY);

  if (load.id === 'compact_car' || load.id === 'suv') {
    // Car Body
    const carW = 140;
    const carH = 48;
    ctx.fillStyle = load.color;
    ctx.beginPath();
    ctx.roundRect(-carW / 2, -carH - 14, carW, carH, 10);
    ctx.fill();

    // Car Roof / Cabin
    ctx.beginPath();
    ctx.moveTo(-carW * 0.35, -carH - 14);
    ctx.lineTo(-carW * 0.15, -carH - 36);
    ctx.lineTo(carW * 0.25, -carH - 36);
    ctx.lineTo(carW * 0.42, -carH - 14);
    ctx.closePath();
    ctx.fill();

    // Windows
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.moveTo(-carW * 0.12, -carH - 16);
    ctx.lineTo(-carW * 0.02, -carH - 32);
    ctx.lineTo(carW * 0.22, -carH - 32);
    ctx.lineTo(carW * 0.35, -carH - 16);
    ctx.closePath();
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(-carW * 0.3, -12, 14, 0, Math.PI * 2);
    ctx.arc(carW * 0.3, -12, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(-carW * 0.3, -12, 6, 0, Math.PI * 2);
    ctx.arc(carW * 0.3, -12, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Heavy Machinery Block
    const blockW = 120;
    const blockH = 75;
    ctx.fillStyle = load.color;
    ctx.fillRect(-blockW / 2, -blockH, blockW, blockH);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.strokeRect(-blockW / 2, -blockH, blockW, blockH);

    // Hazard Cross
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-blockW / 2 + 10, -blockH + 10);
    ctx.lineTo(blockW / 2 - 10, -10);
    ctx.moveTo(blockW / 2 - 10, -blockH + 10);
    ctx.lineTo(-blockW / 2 + 10, -10);
    ctx.stroke();
  }

  // Load Weight Callout Tag
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-55, -95, 110, 22, 6);
  ctx.fill();
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${load.nameEn} (${load.massKg} kg)`, 0, -80);
  ctx.restore();
}

/**
 * 3. HYDRAULIC BRAKE SYSTEM RENDERER
 * Pedal -> Master Cylinder -> Fluid Lines -> Slave Cylinder -> Brake Pads -> Spinning Wheel Drum
 */
export function drawHydraulicBrakes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pedalPct: number,
  wheelRpm: number,
  metrics: BrakeMetrics,
  animTime: number
) {
  // 1. Brake Pedal Assembly (Left Side)
  const pedalPivotX = width * 0.14;
  const pedalPivotY = height * 0.38;
  const pedalAngle = (pedalPct / 100) * 0.32; // rad

  ctx.save();
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.arc(pedalPivotX, pedalPivotY, 8, 0, Math.PI * 2);
  ctx.fill();

  // Pedal Arm
  ctx.save();
  ctx.translate(pedalPivotX, pedalPivotY);
  ctx.rotate(pedalAngle);

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-20, 110);
  ctx.stroke();

  // Foot Pad
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-35, 110, 30, 12);

  // Pushrod connecting to Master Cylinder
  const rodAttachY = 55;
  ctx.restore();

  // Foot indicator icon / arrow pressing pedal
  if (pedalPct > 0) {
    drawDirectedArrow(
      ctx,
      pedalPivotX - 60,
      pedalPivotY + 105,
      pedalPivotX - 35,
      pedalPivotY + 115,
      '#f97316',
      `Effort (${pedalPct}%)`
    );
  }

  // Master Cylinder Body
  const mcX = width * 0.22;
  const mcY = height * 0.50;
  const mcW = 95;
  const mcH = 34;

  ctx.fillStyle = '#64748b';
  ctx.fillRect(mcX, mcY, mcW, mcH);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(mcX, mcY, mcW, mcH);

  // Brake Fluid Reservoir (Top of Master Cylinder)
  ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
  ctx.fillRect(mcX + 20, mcY - 32, 45, 32);
  ctx.strokeStyle = '#ca8a04';
  ctx.strokeRect(mcX + 20, mcY - 32, 45, 32);
  ctx.fillStyle = '#ca8a04';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('DOT4 OIL', mcX + 24, mcY - 14);

  // Master Cylinder Piston inside
  const mcPistonX = mcX + (pedalPct / 100) * 22;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(mcPistonX, mcY + 4, 14, mcH - 8);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('Master Cylinder', mcX + 8, mcY + mcH + 16);
  ctx.restore();

  // 2. High-Pressure Hydraulic Brake Lines (Crimson Line)
  const brakePipeY = mcY + mcH / 2;
  const wheelCenterX = width * 0.72;
  const wheelCenterY = height * 0.54;

  ctx.save();
  ctx.strokeStyle = pedalPct > 15 ? '#ef4444' : '#94a3b8';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(mcX + mcW, brakePipeY);
  ctx.lineTo(wheelCenterX - 110, brakePipeY);
  ctx.lineTo(wheelCenterX - 110, wheelCenterY - 45);
  ctx.lineTo(wheelCenterX - 55, wheelCenterY - 45);
  ctx.stroke();

  // Pulsing fluid pressure dots when pedal pressed
  if (pedalPct > 0) {
    ctx.fillStyle = '#fee2e2';
    for (let f = 0; f < 6; f++) {
      const dotX = mcX + mcW + ((f * 38 + animTime * 140) % (wheelCenterX - 110 - (mcX + mcW)));
      ctx.beginPath();
      ctx.arc(dotX, brakePipeY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // 3. Rotating Wheel & Brake Drum (Right Side)
  const drumRadius = 90;
  const wheelAngle = animTime * (wheelRpm / 60) * Math.PI * 2;

  ctx.save();
  ctx.translate(wheelCenterX, wheelCenterY);

  // Outer Tire & Wheel Rim
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(0, 0, drumRadius + 30, 0, Math.PI * 2);
  ctx.fill();

  // Tire Tread Marks
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 5;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a + wheelAngle) * (drumRadius + 22), Math.sin(a + wheelAngle) * (drumRadius + 22));
    ctx.lineTo(Math.cos(a + wheelAngle) * (drumRadius + 30), Math.sin(a + wheelAngle) * (drumRadius + 30));
    ctx.stroke();
  }

  // Steel Brake Rotor Disc (with ventilation holes)
  ctx.fillStyle = metrics.linePressureKpa > 200 ? '#fca5a5' : '#e2e8f0';
  ctx.beginPath();
  ctx.arc(0, 0, drumRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Rotor Ventilation Holes (spinning)
  ctx.fillStyle = '#64748b';
  for (let h = 0; h < 8; h++) {
    const hAngle = wheelAngle + (h * Math.PI) / 4;
    const hx = Math.cos(hAngle) * (drumRadius * 0.65);
    const hy = Math.sin(hAngle) * (drumRadius * 0.65);
    ctx.beginPath();
    ctx.arc(hx, hy, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wheel Hub Center
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. Slave Cylinder & Twin Opposing Brake Shoes
  const caliperX = wheelCenterX - drumRadius * 0.85;
  const shoeSpread = Math.max(2, 10 - (pedalPct / 100) * 8);

  ctx.save();
  // Slave Cylinder Housing
  ctx.fillStyle = '#475569';
  ctx.fillRect(caliperX - 25, wheelCenterY - 32, 28, 64);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.strokeRect(caliperX - 25, wheelCenterY - 32, 28, 64);

  // Upper Brake Shoe & Friction Pad
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.roundRect(caliperX + 2, wheelCenterY - 28 + shoeSpread, 22, 14, 3);
  ctx.fill();

  // Lower Brake Shoe & Friction Pad
  ctx.beginPath();
  ctx.roundRect(caliperX + 2, wheelCenterY + 14 - shoeSpread, 22, 14, 3);
  ctx.fill();

  // Clamping Force Arrows
  if (pedalPct > 10) {
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('CLAMPS', caliperX - 20, wheelCenterY - 40);

    // Friction Sparks if wheel spinning under brake
    if (wheelRpm > 15) {
      ctx.fillStyle = '#f59e0b';
      for (let sp = 0; sp < 5; sp++) {
        const sx = caliperX + 24 + Math.random() * 15;
        const sy = wheelCenterY + (Math.random() - 0.5) * 35;
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Wheel Status Callout
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Wheel Rotation: ${Math.round(wheelRpm)} RPM`, wheelCenterX, wheelCenterY + drumRadius + 50);

  ctx.fillStyle = wheelRpm === 0 && pedalPct > 0 ? '#16a34a' : '#0284c7';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(
    wheelRpm === 0 ? 'STATUS: LOCKED (रोकियो)' : 'STATUS: SPINNING (घूमिरहेको)',
    wheelCenterX,
    wheelCenterY + drumRadius + 70
  );
  ctx.restore();
}

/**
 * 4. Realistic Analog Bourdon Tube Pressure Gauge
 */
export function drawAnalogPressureGauge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  pressureKpa: number,
  maxKpa: number = 200,
  label: string = 'PRESSURE'
) {
  ctx.save();
  ctx.translate(x, y);

  // Outer Metal Chrome Bezel
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.arc(0, 0, radius + 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // White Dial Face
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fill();

  // Tick Marks (240 deg arc from 150 deg to 390 deg)
  const startAngle = (135 * Math.PI) / 180;
  const sweepAngle = (270 * Math.PI) / 180;

  for (let i = 0; i <= 10; i++) {
    const fraction = i / 10;
    const tickRad = startAngle + fraction * sweepAngle;
    const isMajor = i % 2 === 0;

    const r1 = radius - (isMajor ? 12 : 7);
    const r2 = radius - 2;

    ctx.strokeStyle = isMajor ? '#0f172a' : '#94a3b8';
    ctx.lineWidth = isMajor ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(Math.cos(tickRad) * r1, Math.sin(tickRad) * r1);
    ctx.lineTo(Math.cos(tickRad) * r2, Math.sin(tickRad) * r2);
    ctx.stroke();

    if (isMajor) {
      const textR = radius - 18;
      const numVal = Math.round(fraction * maxKpa);
      ctx.fillStyle = '#334155';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(numVal), Math.cos(tickRad) * textR, Math.sin(tickRad) * textR);
    }
  }

  // Dial Needle
  const clampedPressure = Math.min(maxKpa, Math.max(0, pressureKpa));
  const needleAngle = startAngle + (clampedPressure / maxKpa) * sweepAngle;

  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-Math.cos(needleAngle) * 6, -Math.sin(needleAngle) * 6);
  ctx.lineTo(Math.cos(needleAngle) * (radius - 12), Math.sin(needleAngle) * (radius - 12));
  ctx.stroke();

  // Center Pin
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Label & Value
  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 8px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, 0, radius * 0.45);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 9px monospace';
  ctx.fillText(`${clampedPressure.toFixed(0)} kPa`, 0, radius * 0.65);

  ctx.restore();
}

/**
 * Helper: Draw Directed Vector Arrow with Label
 */
function drawDirectedArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  labelText: string
) {
  const headlen = 10;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Head
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();

  // Tag Label
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2 - 8;
  ctx.fillText(labelText, midX, midY);
  ctx.restore();
}

/**
 * Helper: Vertical Dimension Line with Ticks
 */
function drawVerticalDimension(
  ctx: CanvasRenderingContext2D,
  x: number,
  y1: number,
  y2: number,
  label: string
) {
  ctx.save();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;

  // Main line
  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.lineTo(x, y2);
  // Ticks
  ctx.moveTo(x - 6, y1);
  ctx.lineTo(x + 6, y1);
  ctx.moveTo(x - 6, y2);
  ctx.lineTo(x + 6, y2);
  ctx.stroke();

  // Dimension Text
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(label, x - 8, (y1 + y2) / 2 + 3);
  ctx.restore();
}

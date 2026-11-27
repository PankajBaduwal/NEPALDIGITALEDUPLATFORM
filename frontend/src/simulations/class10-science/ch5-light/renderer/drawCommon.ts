/**
 * drawCommon.ts
 * High-Definition Optical Laboratory Canvas Drawing Engine
 * Nepal CDC Class 10 Science Chapter 5: Phenomena of Light
 *
 * Provides:
 * - Laboratory Optical Breadboard with Anodized Aluminum Clamp Rails & Tapped M6 Holes
 * - Precision Rotary Turntable with Laser-Etched 360° Angle Markings
 * - Multi-Layer Gaussian Bloom Laser Beam with Core and Tyndall Atmospheric Scattering
 * - Quantum Particle Spark Flares & Interface Fresnel Reflections
 * - Realistic Analog Galvanometer / Microammeter with Inertial Needle
 * - 3D Transverse Electromagnetic (EM) Wave Packet Oscillations
 * - Museum-Grade Safe-Margin Callout Labeling Engine
 */

import { SafeLabelCallout } from '../lightTypes';
import { Language } from '../../common/types';

/**
 * Optical Laboratory Breadboard with Anodized Aluminum Rails & Calibration Ticks
 */
export function drawBreadboardGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Pure white laboratory benchtop
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Subtle optical bench millimeter alignment grid
  const gridSize = 20;
  ctx.save();
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = 0; y <= height; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  // Optical bench M6 tapped hole matrix with metallic chamfer rings
  const holeStep = gridSize * 2;
  for (let x = holeStep; x < width; x += holeStep) {
    for (let y = holeStep; y < height; y += holeStep) {
      // Outer subtle chamfer
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();

      // Inner tapped hole core
      ctx.beginPath();
      ctx.arc(x, y, 0.9, 0, Math.PI * 2);
      ctx.fillStyle = '#cbd5e1';
      ctx.fill();
    }
  }

  // Top and bottom precision metric scale rulers
  ctx.fillStyle = '#64748b';
  ctx.font = '8px ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'center';
  for (let x = 40; x < width - 40; x += 40) {
    // Tick mark
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 6);
    ctx.moveTo(x, height);
    ctx.lineTo(x, height - 6);
    ctx.stroke();
    // Millimeter numeral
    ctx.fillText(`${x / 2}mm`, x, 14);
  }
  ctx.restore();
}

/**
 * Realistic Multi-Layer Gaussian Glow Laser Beam with Core and Halo
 */
export function drawRealisticLaserBeam(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  progress: number = 1.0,
  intensity: number = 1.0
): void {
  if (progress <= 0) return;

  const curX2 = x1 + (x2 - x1) * Math.min(1.0, progress);
  const curY2 = y1 + (y2 - y1) * Math.min(1.0, progress);

  ctx.save();
  ctx.lineCap = 'round';

  // Layer 1: Atmospheric Outer Bloom (Gaussian Glow)
  ctx.strokeStyle = color;
  ctx.lineWidth = 14 * intensity;
  ctx.globalAlpha = 0.12 * intensity;
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(curX2, curY2);
  ctx.stroke();

  // Layer 2: Medium Diffuse Beam
  ctx.lineWidth = 6 * intensity;
  ctx.globalAlpha = 0.35 * intensity;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(curX2, curY2);
  ctx.stroke();

  // Layer 3: Vibrant Core Color
  ctx.lineWidth = 3 * intensity;
  ctx.globalAlpha = 0.85 * intensity;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(curX2, curY2);
  ctx.stroke();

  // Layer 4: Intense Super-White Core Center
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2;
  ctx.globalAlpha = 0.95 * intensity;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(curX2, curY2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Tyndall Atmospheric Scattering Dust Motes
 * Floating dust particles scattering light along the laser beam path
 */
export function drawTyndallDustParticles(
  ctx: CanvasRenderingContext2D,
  particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[],
  raySegments: { x1: number; y1: number; x2: number; y2: number }[],
  beamColor: string
): void {
  ctx.save();
  for (const p of particles) {
    // Check if particle is near any laser beam segment
    let illuminated = false;
    for (const seg of raySegments) {
      const dx = seg.x2 - seg.x1;
      const dy = seg.y2 - seg.y1;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) continue;

      const t = Math.max(0, Math.min(1, ((p.x - seg.x1) * dx + (p.y - seg.y1) * dy) / lenSq));
      const projX = seg.x1 + t * dx;
      const projY = seg.y1 + t * dy;
      const dist = Math.hypot(p.x - projX, p.y - projY);

      if (dist < 10) {
        illuminated = true;
        break;
      }
    }

    if (illuminated) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = beamColor;
      ctx.shadowBlur = 6;
      ctx.globalAlpha = Math.min(0.9, p.alpha * 1.6);
      ctx.fill();
    }
  }
  ctx.restore();
}

/**
 * Dynamic Spark Flare & Ripple when Laser Strikes an Interface
 */
export function drawInterfaceFlare(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  time: number
): void {
  ctx.save();
  ctx.translate(x, y);

  // Expanding ripple ring
  const rippleR = ((time * 30) % 18) + 2;
  const rippleAlpha = Math.max(0, 1 - rippleR / 20);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.25;
  ctx.globalAlpha = rippleAlpha * 0.7;
  ctx.beginPath();
  ctx.arc(0, 0, rippleR, 0, Math.PI * 2);
  ctx.stroke();

  // 4-point star specular flare
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  const flareLen = 10;

  ctx.beginPath();
  ctx.moveTo(-flareLen, 0);
  ctx.lineTo(flareLen, 0);
  ctx.moveTo(0, -flareLen);
  ctx.lineTo(0, flareLen);
  ctx.stroke();

  // Flare center core
  ctx.beginPath();
  ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.restore();
}

/**
 * Anodized Laboratory Laser Gun Emitter
 */
export function drawLaserGun(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angleRad: number,
  isOn: boolean,
  beamColor: string = '#ef4444',
  labelEn: string = 'LASER 650nm',
  labelNe: string = 'लेजर स्रोत'
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);

  const bodyLen = 58;
  const bodyH = 24;

  // Gun Drop Shadow
  ctx.shadowColor = 'rgba(15, 23, 42, 0.16)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;

  // Main Barrel Housing (Brushed Anodized Gunmetal)
  const grad = ctx.createLinearGradient(-bodyLen, -bodyH / 2, -bodyLen, bodyH / 2);
  grad.addColorStop(0, '#334155');
  grad.addColorStop(0.2, '#64748b');
  grad.addColorStop(0.5, '#475569');
  grad.addColorStop(0.8, '#334155');
  grad.addColorStop(1, '#1e293b');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(-bodyLen, -bodyH / 2, bodyLen - 8, bodyH, 4);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // Heat Dissipation Cooling Fins
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  for (let fx = -bodyLen + 10; fx <= -bodyLen + 26; fx += 4) {
    ctx.beginPath();
    ctx.moveTo(fx, -bodyH / 2 + 1);
    ctx.lineTo(fx, bodyH / 2 - 1);
    ctx.stroke();
  }

  // Brass Focusing Collar
  const brassGrad = ctx.createLinearGradient(-8, -bodyH / 2 + 2, 0, bodyH / 2 - 2);
  brassGrad.addColorStop(0, '#fde68a');
  brassGrad.addColorStop(0.5, '#d97706');
  brassGrad.addColorStop(1, '#b45309');
  ctx.fillStyle = brassGrad;
  ctx.fillRect(-8, -bodyH / 2 + 2, 8, bodyH - 4);

  // Aperture Nozzle Cap
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(0, -6, 5, 12, [0, 2, 2, 0]);
  ctx.fill();

  // Laser Safety Warning Stripe (Yellow/Black)
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(-bodyLen + 28, -bodyH / 2 + 2, 10, bodyH - 4);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-bodyLen + 32, -bodyH / 2 + 2, 2.5, bodyH - 4);

  // Power Indicator LED
  ctx.beginPath();
  ctx.arc(-bodyLen + 44, 0, 3.5, 0, Math.PI * 2);
  if (isOn) {
    ctx.fillStyle = beamColor;
    ctx.shadowColor = beamColor;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowColor = 'transparent';
  } else {
    ctx.fillStyle = '#94a3b8';
    ctx.fill();
  }

  // Laser Aperture Emitter Glow
  if (isOn) {
    ctx.beginPath();
    ctx.arc(5, 0, 6, 0, Math.PI * 2);
    ctx.fillStyle = beamColor;
    ctx.shadowColor = beamColor;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowColor = 'transparent';
  }

  ctx.restore();
}

/**
 * Realistic Analog Galvanometer / Microammeter with Inertial Needle
 */
export function drawGalvanometerDial(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  currentUa: number,
  maxUa: number = 100,
  label: string = 'GALVANOMETER'
): void {
  ctx.save();
  ctx.translate(x, y);

  // Housing Case
  ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, 8);
  ctx.fill();
  ctx.stroke();
  ctx.shadowColor = 'transparent';

  // Dial Arch Face
  const arcCx = w / 2;
  const arcCy = h - 14;
  const dialRadius = h * 0.72;

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.arc(arcCx, arcCy, dialRadius, -Math.PI * 0.8, -Math.PI * 0.2);
  ctx.stroke();

  // Calibration Scale Ticks
  const startAng = -Math.PI * 0.8;
  const endAng = -Math.PI * 0.2;
  for (let val = 0; val <= maxUa; val += 20) {
    const fraction = val / maxUa;
    const ang = startAng + fraction * (endAng - startAng);
    const tx1 = arcCx + Math.cos(ang) * dialRadius;
    const ty1 = arcCy + Math.sin(ang) * dialRadius;
    const tx2 = arcCx + Math.cos(ang) * (dialRadius - 6);
    const ty2 = arcCy + Math.sin(ang) * (dialRadius - 6);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tx1, ty1);
    ctx.lineTo(tx2, ty2);
    ctx.stroke();

    // Scale numbers
    const numX = arcCx + Math.cos(ang) * (dialRadius - 14);
    const numY = arcCy + Math.sin(ang) * (dialRadius - 14);
    ctx.font = 'bold 7px ui-sans-serif, system-ui, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${val}`, numX, numY);
  }

  // Deflected Needle
  const clampedVal = Math.max(0, Math.min(maxUa, currentUa));
  const needleAngle = startAng + (clampedVal / maxUa) * (endAng - startAng);

  ctx.save();
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.shadowColor = 'rgba(239, 68, 68, 0.4)';
  ctx.shadowBlur = 4;
  ctx.beginPath();
  ctx.moveTo(arcCx, arcCy);
  ctx.lineTo(
    arcCx + Math.cos(needleAngle) * (dialRadius - 4),
    arcCy + Math.sin(needleAngle) * (dialRadius - 4)
  );
  ctx.stroke();
  ctx.restore();

  // Pivot Cap
  ctx.beginPath();
  ctx.arc(arcCx, arcCy, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  // Meter Label & Value Display
  ctx.font = 'bold 8px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.fillText(label, w / 2, 14);

  ctx.font = 'bold 10px ui-monospace, SFMono-Regular, monospace';
  ctx.fillStyle = '#0284c7';
  ctx.fillText(`${currentUa.toFixed(1)} μA`, w / 2, h - 22);

  ctx.restore();
}

/**
 * 3D Transverse Electromagnetic (EM) Wave Packet
 * Shows oscillating Electric field (E) in red and Magnetic field (B) in blue
 */
export function drawEmWavePacket(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  lengthPx: number,
  time: number,
  color: string = '#ef4444'
): void {
  ctx.save();
  ctx.translate(startX, startY);

  const wavelength = 36;
  const amplitude = 18;

  // Wave Propagation Axis Line
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(lengthPx, 0);
  ctx.stroke();
  ctx.setLineDash([]);

  // Oscillating Electric Field Vector (E-field, vertical)
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= lengthPx; x += 2) {
    const phase = ((x - time * 80) / wavelength) * Math.PI * 2;
    const ey = Math.sin(phase) * amplitude;
    if (x === 0) ctx.moveTo(x, ey);
    else ctx.lineTo(x, ey);
  }
  ctx.stroke();

  // Subtle Magnetic Field Vector (B-field, 3D perspective oblique)
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1.25;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  for (let x = 0; x <= lengthPx; x += 4) {
    const phase = ((x - time * 80) / wavelength) * Math.PI * 2;
    const bz = Math.sin(phase) * (amplitude * 0.65);
    // Draw 3D oblique perspective vector: (x + bz * 0.5, bz * 0.3)
    ctx.moveTo(x, 0);
    ctx.lineTo(x + bz * 0.4, bz * 0.4);
  }
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  ctx.restore();
}

/**
 * Museum-Grade Safe-Margin Callout Labeling Engine
 * Routes leader lines from targets to outer margins with sleek badges.
 * Zero collision with optical objects!
 */
export function drawSafeCallouts(
  ctx: CanvasRenderingContext2D,
  callouts: SafeLabelCallout[],
  lang: Language = 'en'
): void {
  if (!callouts || callouts.length === 0) return;

  ctx.save();
  for (const c of callouts) {
    const isNe = lang === 'ne';
    const mainText = isNe ? c.textNe : c.textEn;

    // Leader Line
    ctx.save();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.25;
    ctx.setLineDash([3, 2]);

    ctx.beginPath();
    ctx.moveTo(c.targetX, c.targetY);
    ctx.lineTo(c.anchorX, c.anchorY);
    ctx.lineTo(c.badgeX, c.badgeY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Target Pin with Glowing Center
    ctx.beginPath();
    ctx.arc(c.targetX, c.targetY, 4, 0, Math.PI * 2);
    ctx.fillStyle = c.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.75;
    ctx.stroke();

    // Anchor Elbow Dot
    ctx.beginPath();
    ctx.arc(c.anchorX, c.anchorY, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();
    ctx.restore();

    // Callout Pill Badge
    ctx.save();
    ctx.font = 'bold 11px ui-sans-serif, system-ui, sans-serif';
    const textW = ctx.measureText(mainText).width;
    const valueW = c.value ? ctx.measureText(`: ${c.value}`).width : 0;
    const pillW = Math.max(90, textW + valueW + 28);
    const pillH = 26;

    let boxX = c.badgeX;
    if (c.align === 'right') {
      boxX = c.badgeX - pillW;
    } else if (c.align === 'center') {
      boxX = c.badgeX - pillW / 2;
    }
    const boxY = c.badgeY - pillH / 2;

    // Badge Shadow
    ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;

    // Badge Background
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, pillW, pillH, 6);
    ctx.fill();

    // Border
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Bullet Accent Dot
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(boxX + 11, boxY + pillH / 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Main Text
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '600 11px ui-sans-serif, system-ui, sans-serif';
    ctx.fillText(mainText, boxX + 20, boxY + pillH / 2);

    // Value text
    if (c.value) {
      ctx.fillStyle = c.color;
      ctx.font = 'bold 11px ui-sans-serif, system-ui, sans-serif';
      ctx.fillText(c.value, boxX + 22 + textW, boxY + pillH / 2);
    }

    ctx.restore();
  }
  ctx.restore();
}

/**
 * Caliper Dimension Line with Arrows (used for Lateral Shift d)
 */
export function drawDimensionLine(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label: string,
  color: string = '#d97706'
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const arrowSize = 5;
  const angle = Math.atan2(y2 - y1, x2 - x1);

  // Arrow 1
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 + arrowSize * Math.cos(angle + Math.PI / 4), y1 + arrowSize * Math.sin(angle + Math.PI / 4));
  ctx.moveTo(x1, y1);
  ctx.lineTo(x1 + arrowSize * Math.cos(angle - Math.PI / 4), y1 + arrowSize * Math.sin(angle - Math.PI / 4));
  ctx.stroke();

  // Arrow 2
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - arrowSize * Math.cos(angle + Math.PI / 4), y2 - arrowSize * Math.sin(angle + Math.PI / 4));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - arrowSize * Math.cos(angle - Math.PI / 4), y2 - arrowSize * Math.sin(angle - Math.PI / 4));
  ctx.stroke();

  // Dimension pill
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;

  ctx.font = 'bold 10px ui-sans-serif, system-ui, sans-serif';
  const textW = ctx.measureText(label).width;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(midX - textW / 2 - 5, midY - 8, textW + 10, 16, 4);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, midX, midY);

  ctx.restore();
}

/**
 * Angle Arc Protractor with Degree Marker
 */
export function drawAngleArc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  startAngleRad: number,
  endAngleRad: number,
  label: string,
  color: string = '#0284c7'
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.75;

  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngleRad, endAngleRad, false);
  ctx.stroke();

  const midAngle = (startAngleRad + endAngleRad) / 2;
  const textDist = radius + 12;
  const tx = cx + Math.cos(midAngle) * textDist;
  const ty = cy + Math.sin(midAngle) * textDist;

  ctx.font = 'bold 11px ui-sans-serif, system-ui, sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, tx, ty);

  ctx.restore();
}

/**
 * Animated Photon / Wave Packet with trailing sinusoidal crests
 */
export function drawPhotonPacket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angleRad: number,
  color: string,
  wavelengthScale: number = 10
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);

  // Photon core
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Trailing sinusoidal packet
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  const packetLen = 32;
  for (let px = 0; px >= -packetLen; px -= 2) {
    const envelope = Math.sin(((-px) / packetLen) * Math.PI);
    const py = Math.sin((px / wavelengthScale) * Math.PI * 2) * 6 * envelope;
    if (px === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.restore();
}

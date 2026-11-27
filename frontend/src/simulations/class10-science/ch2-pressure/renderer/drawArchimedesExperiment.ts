/**
 * drawArchimedesExperiment.ts
 * Dedicated Ultra-Realistic HTML5 Canvas Rendering Engine for Archimedes' Principle Laboratory
 * Grade 10 Science & Technology • Chapter 2: Pressure
 * Nepal CDC Aligned
 *
 * Implements:
 * 1. Dual Spring Balance Comparison: Weight in Air vs Apparent Weight in Liquid
 * 2. Glass Eureka Can with angled spout & fluid meniscus
 * 3. Animated liquid discharge stream flowing into collection beaker on an electronic digital scale
 * 4. Realistic textured physical objects (River stone, Iron, Aluminum, Gold, Pine wood, etc.)
 * 5. Dynamic vector force arrows (Upthrust ↑, Weight ↓)
 * 6. Law of Floatation 3-State Tank (Sinking, Suspended, Floating partially)
 */

import { SolidMaterial, LiquidMedium } from '../archimedesTypes';
import { ArchimedesCalculation } from '../archimedesPhysics';

/**
 * Clean Laboratory Canvas Background
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

  // Soft perimeter boundary
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(10, 10, width - 20, height - 20);
}

/**
 * Draw Ultra-Realistic Tubular Newton Spring Balance
 */
export function drawSpringBalance(
  ctx: CanvasRenderingContext2D,
  x: number,
  topY: number,
  readingN: number,
  maxN: number = 10,
  labelTag: string = '',
  highlightColor: string = '#0284c7'
) {
  const barrelW = 28;
  const barrelH = 140;

  ctx.save();
  // 1. Top Suspension Metal Ring
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(x, topY - 14, 10, 0, Math.PI * 2);
  ctx.stroke();

  // Top Chrome Cap
  ctx.fillStyle = '#334155';
  ctx.fillRect(x - barrelW / 2 - 2, topY - 4, barrelW + 4, 10);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x - barrelW / 2 - 2, topY - 4, barrelW + 4, 10);

  // 2. Acrylic Barrel (Cylinder Casing)
  ctx.fillStyle = 'rgba(241, 245, 249, 0.9)';
  ctx.fillRect(x - barrelW / 2, topY + 6, barrelW, barrelH);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - barrelW / 2, topY + 6, barrelW, barrelH);

  // 3. Calibrated Scale Ticks (0 to maxN)
  const scaleStartY = topY + 16;
  const scaleEndY = topY + barrelH - 16;
  const totalScaleH = scaleEndY - scaleStartY;

  ctx.strokeStyle = '#475569';
  for (let i = 0; i <= maxN; i++) {
    const fraction = i / maxN;
    const ty = scaleStartY + fraction * totalScaleH;
    const isMajor = i % 2 === 0;

    ctx.lineWidth = isMajor ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x - barrelW / 2 + 3, ty);
    ctx.lineTo(x - barrelW / 2 + (isMajor ? 10 : 6), ty);
    ctx.stroke();

    if (isMajor) {
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(i), x - barrelW / 2 + 12, ty);
    }
  }

  // 4. Internal Red Coiled Spring (Stretches proportionally with readingN)
  const clampedN = Math.max(0, Math.min(maxN, readingN));
  const extensionRatio = clampedN / maxN;
  const springEndY = scaleStartY + extensionRatio * totalScaleH;

  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const numCoils = 14;
  const coilStep = (springEndY - scaleStartY) / numCoils;
  ctx.moveTo(x + 5, scaleStartY);
  for (let c = 0; c < numCoils; c++) {
    const cy = scaleStartY + c * coilStep;
    ctx.lineTo(x + (c % 2 === 0 ? 8 : 2), cy + coilStep / 2);
  }
  ctx.lineTo(x + 5, springEndY);
  ctx.stroke();

  // 5. Red Sliding Marker Needle
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(x - barrelW / 2 + 1, springEndY);
  ctx.lineTo(x - barrelW / 2 + 10, springEndY - 4);
  ctx.lineTo(x - barrelW / 2 + 10, springEndY + 4);
  ctx.closePath();
  ctx.fill();

  // 6. Bottom Plunger Rod & Lower Chrome Cap
  ctx.fillStyle = '#334155';
  ctx.fillRect(x - barrelW / 2 - 2, topY + barrelH, barrelW + 4, 10);
  ctx.strokeRect(x - barrelW / 2 - 2, topY + barrelH, barrelW + 4, 10);

  // Plunger Extension Rod
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, topY + barrelH + 10);
  ctx.lineTo(x, springEndY + 35);
  ctx.stroke();

  // Lower Steel Hook
  const hookY = springEndY + 35;
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, hookY + 8, 8, Math.PI * 0.2, Math.PI * 1.5, false);
  ctx.stroke();

  // 7. Value Badge on Side
  if (labelTag) {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x + barrelW / 2 + 10, springEndY - 14, 120, 32, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelTag, x + barrelW / 2 + 16, springEndY - 2);

    ctx.fillStyle = highlightColor;
    ctx.font = 'bold 13px monospace';
    ctx.fillText(`${clampedN.toFixed(2)} N`, x + barrelW / 2 + 16, springEndY + 10);
  }

  ctx.restore();

  return hookY + 16; // Return attachment Y position for hanging cord
}

/**
 * Draw Physical Object (Stone, Iron block, Aluminum cylinder, Wood, etc.)
 */
export function drawPhysicalObject(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  material: SolidMaterial
) {
  ctx.save();
  ctx.translate(x, y);

  if (material.texture === 'stone') {
    // Faceted jagged rock shape
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    const pts = [
      [-radius * 0.85, -radius * 0.4],
      [-radius * 0.4, -radius * 0.9],
      [radius * 0.35, -radius * 0.85],
      [radius * 0.9, -radius * 0.25],
      [radius * 0.75, radius * 0.65],
      [radius * 0.1, radius * 0.95],
      [-radius * 0.7, radius * 0.75],
    ];
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Shading facets
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(pts[1][0], pts[1][1]);
    ctx.lineTo(pts[2][0], pts[2][1]);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
    ctx.beginPath();
    ctx.moveTo(pts[4][0], pts[4][1]);
    ctx.lineTo(pts[5][0], pts[5][1]);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
  } else if (material.texture === 'metal' || material.texture === 'gold' || material.texture === 'shiny') {
    // Metal Ingot / Cube with Chamfered Corners
    const w = radius * 1.6;
    const h = radius * 1.4;

    const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, material.color);
    grad.addColorStop(1, '#0f172a');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Specular Highlight Streak
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, 6);
  } else {
    // Wood Block with Grain Rings
    const w = radius * 1.6;
    const h = radius * 1.3;
    ctx.fillStyle = material.color;
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 4);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Woodgrain lines
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 8, -h / 4);
    ctx.quadraticCurveTo(0, -h / 3, w / 2 - 8, -h / 4);
    ctx.moveTo(-w / 2 + 8, h / 5);
    ctx.quadraticCurveTo(0, h / 3, w / 2 - 8, h / 5);
    ctx.stroke();
  }

  // Suspension Eyelet Hook on top of object
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, -radius * 0.85, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  // Object Name Badge
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(material.nameEn, 0, radius * 0.95 + 10);

  ctx.restore();
}

/**
 * Draw Glass Eureka Overflow Can
 */
export function drawEurekaCan(
  ctx: CanvasRenderingContext2D,
  canX: number,
  canY: number,
  canWidth: number,
  canHeight: number,
  liquid: LiquidMedium,
  spoutDischarging: boolean,
  animTime: number
) {
  const spoutY = canY + 45; // Height where spout begins
  const spoutLength = 65;
  const spoutDrop = 35;

  ctx.save();

  // 1. Liquid Body inside Can
  const fluidGrad = ctx.createLinearGradient(canX, canY, canX + canWidth, canY + canHeight);
  fluidGrad.addColorStop(0, liquid.fluidGradient[0]);
  fluidGrad.addColorStop(0.5, liquid.fluidGradient[1]);
  fluidGrad.addColorStop(1, liquid.fluidGradient[2]);

  ctx.fillStyle = fluidGrad;
  ctx.beginPath();
  // Fill from bottom of can up to spout level
  ctx.rect(canX + 3, spoutY, canWidth - 6, canHeight - (spoutY - canY) - 3);
  ctx.fill();

  // Shimmer Particles inside liquid
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  for (let i = 0; i < 12; i++) {
    const px = canX + 15 + ((i * 37 + animTime * 18) % (canWidth - 30));
    const py = spoutY + 15 + ((i * 29) % (canHeight - 70));
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Liquid Meniscus at Spout Level
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  ctx.ellipse(canX + canWidth / 2, spoutY, canWidth / 2 - 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Glass Cylinder Outer Walls
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.lineWidth = 3.5;
  // Left wall
  ctx.beginPath();
  ctx.moveTo(canX, canY);
  ctx.lineTo(canX, canY + canHeight);
  // Bottom wall
  ctx.lineTo(canX + canWidth, canY + canHeight);
  // Right wall up to spout
  ctx.lineTo(canX + canWidth, spoutY + 14);
  ctx.stroke();

  // Spout Lower Lip
  ctx.beginPath();
  ctx.moveTo(canX + canWidth, spoutY + 14);
  ctx.lineTo(canX + canWidth + spoutLength, spoutY + spoutDrop + 14);
  // Spout Upper Lip
  ctx.moveTo(canX + canWidth, spoutY);
  ctx.lineTo(canX + canWidth + spoutLength - 4, spoutY + spoutDrop);
  ctx.stroke();

  // Right wall above spout
  ctx.beginPath();
  ctx.moveTo(canX + canWidth, spoutY);
  ctx.lineTo(canX + canWidth, canY);
  ctx.stroke();

  // Top Glass Rim Flange
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(canX + canWidth / 2, canY, canWidth / 2 + 2, 8, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Glass Specular Reflection Highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(canX + 10, canY + 20);
  ctx.lineTo(canX + 10, canY + canHeight - 20);
  ctx.stroke();

  // Eureka Can Label Tag
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Eureka Can', canX + canWidth / 2, canY + canHeight + 20);

  // 3. Spout Water Stream & Discharge Flow
  if (spoutDischarging) {
    const streamStartX = canX + canWidth + spoutLength - 2;
    const streamStartY = spoutY + spoutDrop + 8;
    const beakerTargetX = streamStartX + 12;
    const beakerTargetY = streamStartY + 145;

    // Arcing Stream
    ctx.strokeStyle = liquid.fluidGradient[0];
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(streamStartX, streamStartY);
    ctx.bezierCurveTo(
      streamStartX + 8, streamStartY + 45,
      beakerTargetX, beakerTargetY - 45,
      beakerTargetX, beakerTargetY
    );
    ctx.stroke();

    // Stream Center Glow
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(streamStartX, streamStartY);
    ctx.bezierCurveTo(
      streamStartX + 8, streamStartY + 45,
      beakerTargetX, beakerTargetY - 45,
      beakerTargetX, beakerTargetY
    );
    ctx.stroke();

    // Splashing Droplets
    ctx.fillStyle = liquid.fluidGradient[0];
    for (let d = 0; d < 4; d++) {
      const dropY = streamStartY + 25 + ((d * 32 + animTime * 120) % (beakerTargetY - streamStartY - 30));
      const dropX = streamStartX + 6 + Math.sin(animTime * 8 + d) * 3;
      ctx.beginPath();
      ctx.arc(dropX, dropY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Draw Measuring Beaker on Electronic Digital Weighing Scale
 */
export function drawDigitalScaleWithBeaker(
  ctx: CanvasRenderingContext2D,
  scaleX: number,
  scaleY: number,
  beakerFillHeightPx: number,
  liquid: LiquidMedium,
  displacedWeightN: number,
  displacedMassGrams: number
) {
  const scaleW = 120;
  const scaleH = 34;

  ctx.save();
  // 1. Electronic Digital Scale Base
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(scaleX - scaleW / 2, scaleY, scaleW, scaleH, 6);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Stainless Steel Weighing Plate
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.roundRect(scaleX - scaleW * 0.42, scaleY - 6, scaleW * 0.84, 6, 2);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.stroke();

  // Digital LED Display Screen (Dark Navy)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(scaleX - 44, scaleY + 7, 88, 20, 4);
  ctx.fill();

  // LED Readout Text (Cyan Glow)
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${displacedMassGrams.toFixed(1)} g | ${displacedWeightN.toFixed(2)} N`, scaleX, scaleY + 17);

  // Scale Feet
  ctx.fillStyle = '#334155';
  ctx.fillRect(scaleX - scaleW / 2 + 10, scaleY + scaleH, 12, 4);
  ctx.fillRect(scaleX + scaleW / 2 - 22, scaleY + scaleH, 12, 4);

  // 2. Glass Measuring Beaker on Top of Scale
  const beakerW = 60;
  const beakerH = 90;
  const beakerX = scaleX - beakerW / 2;
  const beakerBottomY = scaleY - 6;
  const beakerTopY = beakerBottomY - beakerH;

  // Liquid inside Beaker
  if (beakerFillHeightPx > 2) {
    const liquidTopY = beakerBottomY - Math.min(beakerH - 10, beakerFillHeightPx);
    const bGrad = ctx.createLinearGradient(beakerX, liquidTopY, beakerX + beakerW, beakerBottomY);
    bGrad.addColorStop(0, liquid.fluidGradient[0]);
    bGrad.addColorStop(0.6, liquid.fluidGradient[1]);
    bGrad.addColorStop(1, liquid.fluidGradient[2]);

    ctx.fillStyle = bGrad;
    ctx.fillRect(beakerX + 2, liquidTopY, beakerW - 4, beakerBottomY - liquidTopY);

    // Liquid surface meniscus
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(scaleX, liquidTopY, beakerW / 2 - 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Beaker Glass Body
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  // Pouring Spout
  ctx.moveTo(beakerX - 4, beakerTopY);
  ctx.lineTo(beakerX, beakerTopY + 4);
  ctx.lineTo(beakerX, beakerBottomY);
  ctx.lineTo(beakerX + beakerW, beakerBottomY);
  ctx.lineTo(beakerX + beakerW, beakerTopY);
  ctx.stroke();

  // Graduated mL Lines on Beaker Wall
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  for (let m = 1; m <= 4; m++) {
    const my = beakerBottomY - m * 18;
    ctx.beginPath();
    ctx.moveTo(beakerX + 2, my);
    ctx.lineTo(beakerX + 8, my);
    ctx.stroke();
  }

  // Displaced Water Tag
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Displaced Water', scaleX, scaleY + scaleH + 20);
  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 13px monospace';
  ctx.fillText(`W = ${displacedWeightN.toFixed(2)} N`, scaleX, scaleY + scaleH + 36);

  ctx.restore();
}

/**
 * Draw Upthrust Vector Arrow on the submerged object
 */
export function drawForceVectors(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  weightAirN: number,
  upthrustN: number
) {
  ctx.save();
  // 1. Upthrust Arrow (Green, Pointing UP ↑)
  if (upthrustN > 0) {
    const arrowLen = Math.min(85, upthrustN * 16);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 35, y);
    ctx.lineTo(x + 35, y - arrowLen);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(x + 35, y - arrowLen - 8);
    ctx.lineTo(x + 29, y - arrowLen);
    ctx.lineTo(x + 41, y - arrowLen);
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.fillStyle = '#047857';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Upthrust U = ${upthrustN.toFixed(2)} N`, x + 48, y - arrowLen / 2);
  }

  // 2. Weight in Air Arrow (Orange, Pointing DOWN ↓)
  const weightLen = Math.min(85, weightAirN * 14);
  ctx.strokeStyle = '#ea580c';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(x - 35, y);
  ctx.lineTo(x - 35, y + weightLen);
  ctx.stroke();

  // Arrowhead
  ctx.fillStyle = '#ea580c';
  ctx.beginPath();
  ctx.moveTo(x - 35, y + weightLen + 8);
  ctx.lineTo(x - 41, y + weightLen);
  ctx.lineTo(x - 29, y + weightLen);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#c2410c';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`W_air = ${weightAirN.toFixed(2)} N`, x - 46, y + weightLen / 2);

  ctx.restore();
}

/**
 * Draw 3-Block Demonstration Tank for Law of Floatation
 */
export function drawFloatationTank(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  liquid: LiquidMedium,
  animTime: number
) {
  const tankX = width * 0.12;
  const tankY = height * 0.28;
  const tankW = width * 0.76;
  const tankH = height * 0.52;
  const liquidTopY = tankY + 60;

  ctx.save();
  // Tank Liquid
  const grad = ctx.createLinearGradient(tankX, liquidTopY, tankX, tankY + tankH);
  grad.addColorStop(0, liquid.fluidGradient[0]);
  grad.addColorStop(0.5, liquid.fluidGradient[1]);
  grad.addColorStop(1, liquid.fluidGradient[2]);

  ctx.fillStyle = grad;
  ctx.fillRect(tankX + 4, liquidTopY, tankW - 8, tankY + tankH - liquidTopY - 4);

  // Surface Meniscus with gentle animated wave
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(tankX + 4, liquidTopY);
  for (let x = tankX + 4; x <= tankX + tankW - 4; x += 10) {
    const wave = Math.sin((x / 30) + animTime * 3) * 2;
    ctx.lineTo(x, liquidTopY + wave);
  }
  ctx.stroke();

  // Glass Tank Walls
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 4;
  ctx.strokeRect(tankX, tankY, tankW, tankH);

  // 1. Block A: Cork/Wood (Floating Partially, rho_body < rho_liquid)
  const b1X = tankX + tankW * 0.22;
  const b1Size = 56;
  const b1Y = liquidTopY - b1Size * 0.65; // 65% above, 35% submerged

  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.roundRect(b1X - b1Size / 2, b1Y, b1Size, b1Size, 6);
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Case 1: Floating', b1X, tankY - 14);
  ctx.fillStyle = '#15803d';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('ρ_body < ρ_liquid', b1X, tankY + 12);
  ctx.fillText('W = U (Apparent W = 0)', b1X, tankY + 28);

  // 2. Block B: Custom Polymer (Suspended Neutral, rho_body = rho_liquid)
  const b2X = tankX + tankW * 0.50;
  const b2Y = liquidTopY + (tankY + tankH - liquidTopY) * 0.4;

  ctx.fillStyle = '#8b5cf6';
  ctx.beginPath();
  ctx.roundRect(b2X - b1Size / 2, b2Y, b1Size, b1Size, 6);
  ctx.fill();
  ctx.strokeStyle = '#5b21b6';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Case 2: Suspended', b2X, tankY - 14);
  ctx.fillStyle = '#0284c7';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('ρ_body = ρ_liquid', b2X, tankY + 12);
  ctx.fillText('W = U (Floats submerged)', b2X, tankY + 28);

  // 3. Block C: Iron/Stone (Sunk to bottom, rho_body > rho_liquid)
  const b3X = tankX + tankW * 0.78;
  const b3Y = tankY + tankH - b1Size - 4;

  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.roundRect(b3X - b1Size / 2, b3Y, b1Size, b1Size, 6);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Case 3: Sunk', b3X, tankY - 14);
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('ρ_body > ρ_liquid', b3X, tankY + 12);
  ctx.fillText('W > U (Sinks to bottom)', b3X, tankY + 28);

  ctx.restore();
}

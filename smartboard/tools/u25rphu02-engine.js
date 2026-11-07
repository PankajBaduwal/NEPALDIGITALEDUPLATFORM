/**
 * u25rphu02-engine.js
 * Physics for Data Storage and Computing (U25RPHU02) Interactive Simulation Engine
 * Regulation R2025 · Semester I · Common to AD, AM, BM, CB, CS, IT
 * 
 * Provides interactive HTML5 Canvas visualizers for Units I–V:
 *  - Unit I: Optical Materials & Devices (Photodiode, Solar Cell, OLED, Optical Storage, Blu-ray)
 *  - Unit II: Magnetic Materials & Data Storage (Ferromagnetism, Hysteresis B-H, GMR, Tape, Bubble, Magstripe)
 *  - Unit III: Nanodevices (Quantum Confinement, Tunnelling, Coulomb Blockade, SET, RTD, QCA)
 *  - Unit IV: Quantum Computing (Classical vs Qubit, 3D Interactive Bloch Sphere, Entanglement)
 *  - Unit V: Quantum Circuits (Quantum Gate Lab: X, Y, Z, H, S, T, CNOT Circuit, Quantum Chip)
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.U25RPHU02Engine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Math & Color utilities
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  return {
    // ══════════════════════════════════════════════════════════
    // MAIN DISPATCHER
    // ══════════════════════════════════════════════════════════
    render: function (ctx, width, height, sim, state, isDark) {
      const id = (typeof sim === 'string') ? sim : (sim && sim.id ? sim.id : '');
      const p = state.params || {};
      const t = state.animTime || 0;

      switch (id) {
        // UNIT I
        case 'u25rphu02-optical-materials':
          this.renderOpticalMaterials(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-carrier-generation':
          this.renderCarrierGenRecomb(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-absorption-emission':
          this.renderAbsorptionEmission(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-photodiode':
          this.renderPhotodiode(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-solar-cell':
          this.renderSolarCell(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-oled':
          this.renderOled(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-optical-storage':
          this.renderOpticalStorage(ctx, width, height, p, t, isDark, false);
          break;
        case 'u25rphu02-bluray':
          this.renderOpticalStorage(ctx, width, height, p, t, isDark, true);
          break;

        // UNIT II
        case 'u25rphu02-magnetic-materials':
          this.renderMagneticMaterials(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-ferromagnetism':
          this.renderFerromagnetism(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-hysteresis':
          this.renderHysteresis(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-magnetic-memory':
          this.renderMagneticMemory(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-magnetic-tape':
          this.renderMagneticTape(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-gmr':
          this.renderGmrSensor(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-magnetic-bubble':
          this.renderMagneticBubble(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-magstripe':
          this.renderMagstripe(ctx, width, height, p, t, isDark);
          break;

        // UNIT III
        case 'u25rphu02-quantum-confinement':
          this.renderQuantumConfinement(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-quantum-structures':
          this.renderQuantumStructures(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-nano-bandgap':
          this.renderNanoBandgap(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-tunnelling':
          this.renderQuantumTunnelling(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-coulomb-blockade':
          this.renderCoulombBlockade(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-set-rtd':
        case 'u25rphu02-set':
          this.renderSingleElectronTransistor(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-rtd':
          this.renderResonantTunnellingDiode(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-qca':
          this.renderQCA(ctx, width, height, p, t, isDark);
          break;

        // UNIT IV
        case 'u25rphu02-classical-vs-quantum':
          this.renderClassicalVsQuantum(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-superposition-measurement':
        case 'u25rphu02-qubit':
          this.renderQubitState(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-bloch-sphere':
          this.renderBlochSphere(ctx, width, height, p, t, isDark, state);
          break;
        case 'u25rphu02-entanglement':
        case 'u25rphu02-single-two-qubits':
          this.renderTwoQubitEntanglement(ctx, width, height, p, t, isDark);
          break;

        // UNIT V
        case 'u25rphu02-quantum-devices':
          this.renderQuantumDevices(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-pauli-gates':
        case 'u25rphu02-quantum-gates':
        case 'u25rphu02-x-gate':
        case 'u25rphu02-y-gate':
        case 'u25rphu02-z-gate':
        case 'u25rphu02-hadamard-interference':
        case 'u25rphu02-hadamard':
        case 'u25rphu02-s-gate':
        case 'u25rphu02-t-gate':
          this.renderQuantumGateLab(ctx, width, height, p, t, isDark, state);
          break;
        case 'u25rphu02-circuit-builder':
        case 'u25rphu02-cnot-circuit':
        case 'u25rphu02-multiqubit':
          this.renderMultiQubitCircuit(ctx, width, height, p, t, isDark);
          break;
        case 'u25rphu02-quantum-chip':
          this.renderQuantumChip(ctx, width, height, p, t, isDark);
          break;

        default:
          this.renderDefaultOverview(ctx, width, height, sim, isDark);
      }
    },

    // ──────────────────────────────────────────────────────────
    // UNIT I: OPTICAL MATERIALS & DEVICES
    // ──────────────────────────────────────────────────────────
    renderOpticalMaterials: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const subColor = isDark ? '#94a3b8' : '#64748b';
      const n = p.refractiveIndex || 3.4;
      const d = p.thicknessUm || 50;
      const lambda = p.wavelengthNm || 650;

      // Title & Equations
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Optical Material Transmission & Dispersion · n = ' + n.toFixed(2), 24, 32);
      ctx.font = '12px monospace';
      ctx.fillStyle = subColor;
      ctx.fillText(`λ = ${lambda} nm | d = ${d} µm | T = (1-R)² e^(-αd)`, 24, 52);

      // Material Slab
      const slabX = w * 0.35;
      const slabY = 80;
      const slabW = w * 0.3;
      const slabH = h - 140;

      // Slab background
      const grad = ctx.createLinearGradient(slabX, 0, slabX + slabW, 0);
      grad.addColorStop(0, isDark ? 'rgba(56, 189, 248, 0.25)' : 'rgba(14, 165, 233, 0.2)');
      grad.addColorStop(1, isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(14, 165, 233, 0.4)');
      ctx.fillStyle = grad;
      ctx.fillRect(slabX, slabY, slabW, slabH);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;
      ctx.strokeRect(slabX, slabY, slabW, slabH);

      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Optical Medium (n = ${n.toFixed(2)})`, slabX + slabW / 2, slabY + 30);
      ctx.font = '11px sans-serif';
      ctx.fillText(`Thickness d = ${d} µm`, slabX + slabW / 2, slabY + 50);

      // Incident Ray
      const rayY = slabY + slabH / 2;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(30, rayY);
      ctx.lineTo(slabX, rayY);
      ctx.stroke();

      // Arrows for incident ray
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(slabX - 40, rayY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Incident Ray I₀ (100%)', 40, rayY - 14);

      // Reflected Ray
      const R = Math.pow((n - 1) / (n + 1), 2);
      const reflPercent = (R * 100).toFixed(1);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(slabX, rayY);
      ctx.lineTo(slabX - 80, rayY - 70);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`Reflected R = ${reflPercent}%`, slabX - 140, rayY - 75);

      // Absorbed in slab
      const alpha = 0.02 * (300 / lambda);
      const T = Math.pow(1 - R, 2) * Math.exp(-alpha * (d / 10));
      const transPercent = (T * 100).toFixed(1);

      // Ray inside slab (attenuating)
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      ctx.moveTo(slabX, rayY);
      ctx.lineTo(slabX + slabW, rayY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Transmitted Ray
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(slabX + slabW, rayY);
      ctx.lineTo(w - 40, rayY);
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`Transmitted T = ${transPercent}%`, slabX + slabW + 20, rayY - 14);

      // Bottom Spec Readout
      ctx.fillStyle = textColor;
      ctx.font = '11px sans-serif';
      ctx.fillText(`Absorption α = ${(alpha * 100).toFixed(2)} cm⁻¹ | Destructive Edge: ${(1240 / (lambda / 1000)).toFixed(2)} eV`, 24, h - 20);
    },

    renderCarrierGenRecomb: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const photonE = p.photonEnergyEv || 2.2;
      const eg = p.bandGapEv || 1.42;
      const doesGenerate = photonE >= eg;

      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Carrier Generation & Recombination · E_photon vs E_g', 24, 30);

      // Energy Bands
      const cbY = 90;
      const vbY = 250;
      const bandW = w - 80;

      // Conduction Band
      ctx.fillStyle = isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.15)';
      ctx.fillRect(40, cbY - 40, bandW, 40);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, cbY - 40, bandW, 40);
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Conduction Band (Ec) — Free Electrons', 50, cbY - 18);

      // Valence Band
      ctx.fillStyle = isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(40, vbY, bandW, 40);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, vbY, bandW, 40);
      ctx.fillStyle = '#ef4444';
      ctx.fillText('Valence Band (Ev) — Holes', 50, vbY + 25);

      // Bandgap arrow
      ctx.strokeStyle = isDark ? '#cbd5e1' : '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w - 100, vbY);
      ctx.lineTo(w - 100, cbY);
      ctx.stroke();
      ctx.fillStyle = textColor;
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`Eg = ${eg.toFixed(2)} eV`, w - 90, (cbY + vbY) / 2);

      // Incident Photon Wave Packet
      const waveX = 140 + (t * 80) % 200;
      const waveY = (cbY + vbY) / 2;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 60; x <= 220; x += 4) {
        const y = waveY + Math.sin((x - t * 40) * 0.12) * 12;
        if (x === 60) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`Photon hν = ${photonE.toFixed(2)} eV`, 80, waveY - 20);

      // Generation Animation
      if (doesGenerate) {
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('✔ hν ≥ Eg : Photo-Excitation Active! Electron-Hole Pair Generated', 260, 48);

        // Electron in CB
        const eX = 340 + Math.sin(t * 3) * 30;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(eX, cbY - 18, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('e⁻', eX - 5, cbY - 15);

        // Hole in VB
        const hX = 340 - Math.sin(t * 3) * 30;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(hX, vbY + 20, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText('h⁺', hX - 5, vbY + 23);

        // Transition Arrow
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(340, vbY);
        ctx.lineTo(340, cbY);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('✖ hν < Eg : Insufficient photon energy. Optical transmission without absorption.', 260, 48);
      }
    },

    renderAbsorptionEmission: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Light-Solid Interaction: Absorption, Spontaneous & Stimulated Emission', 24, 30);

      const panelW = (w - 80) / 3;
      const titles = ['1. Absorption', '2. Spontaneous Emission', '3. Stimulated Emission'];
      const sub = ['hν + E₁ → E₂', 'E₂ → E₁ + hν (random)', 'hν + E₂ → E₁ + 2hν (coherent)'];

      for (let i = 0; i < 3; i++) {
        const x = 30 + i * (panelW + 10);
        ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, 60, panelW, h - 110);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(titles[i], x + 16, 85);
        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.font = '11px monospace';
        ctx.fillText(sub[i], x + 16, 105);

        // State levels E1 and E2
        const e2Y = 150;
        const e1Y = 250;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + 30, e2Y);
        ctx.lineTo(x + panelW - 30, e2Y);
        ctx.moveTo(x + 30, e1Y);
        ctx.lineTo(x + panelW - 30, e1Y);
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('E₂ (Excited)', x + panelW - 85, e2Y - 8);
        ctx.fillText('E₁ (Ground)', x + panelW - 85, e1Y + 18);

        // Photons & electron animation
        const midX = x + panelW / 2;
        if (i === 0) {
          // Absorption: Electron moves up
          const elY = e1Y - ((t * 40) % (e1Y - e2Y));
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(midX, elY, 8, 0, Math.PI * 2);
          ctx.fill();
        } else if (i === 1) {
          // Spontaneous: Electron drops, photon radiates
          const elY = e2Y + ((t * 40) % (e1Y - e2Y));
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(midX, elY, 8, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Stimulated: Twin coherent photons emitted
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(midX, e1Y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.strokeText('∿∿ hν (coherent)', x + 20, 200);
        }
      }
    },

    renderPhotodiode: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const vr = p.reverseBiasV || 5.0;
      const optMw = p.opticalPowerMw || 10.0;
      const resp = p.responsivity || 0.65;
      const iphMa = optMw * resp;

      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Photodiode Operation & Photocurrent Linear Response', 24, 30);
      ctx.font = '12px monospace';
      ctx.fillStyle = '#10b981';
      ctx.fillText(`VR = ${vr.toFixed(1)} V | P_opt = ${optMw.toFixed(1)} mW | I_ph = ${iphMa.toFixed(2)} mA`, 24, 50);

      // Left: P-N Junction Structure with Depletion Region
      const juncW = w * 0.48;
      const juncH = h - 140;
      const juncX = 30;
      const juncY = 70;

      // P region
      ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
      ctx.fillRect(juncX, juncY, juncW / 3, juncH);
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('p-type (Anode)', juncX + 16, juncY + 30);

      // Depletion Region (Wider with reverse bias)
      const depW = (juncW / 3) * (0.8 + vr * 0.05);
      const depX = juncX + juncW / 3;
      ctx.fillStyle = isDark ? 'rgba(234, 179, 8, 0.18)' : 'rgba(234, 179, 8, 0.25)';
      ctx.fillRect(depX, juncY, depW, juncH);
      ctx.strokeStyle = '#eab308';
      ctx.strokeRect(depX, juncY, depW, juncH);
      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Depletion Region (E-Field)', depX + 10, juncY + 30);

      // N region
      const nX = depX + depW;
      const nW = juncX + juncW - nX;
      ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
      ctx.fillRect(nX, juncY, nW, juncH);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('n-type (Cathode)', nX + 16, juncY + 30);

      // Incoming Photons
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 4; i++) {
        const py = juncY + 60 + i * 40;
        ctx.beginPath();
        ctx.moveTo(depX + 20, py - 30);
        ctx.lineTo(depX + 45, py);
        ctx.stroke();
      }

      // Right: Linear Photocurrent vs Optical Power Curve
      const graphX = w * 0.58;
      const graphY = 80;
      const graphW = w * 0.38;
      const graphH = h - 140;

      ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY + graphH);
      ctx.lineTo(graphX + graphW, graphY + graphH);
      ctx.moveTo(graphX, graphY + graphH);
      ctx.lineTo(graphX, graphY);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = '11px sans-serif';
      ctx.fillText('Optical Power P_opt (mW) →', graphX + graphW - 140, graphY + graphH + 20);
      ctx.fillText('↑ Photocurrent I_ph (mA)', graphX - 10, graphY - 10);

      // Linear I_ph line
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(graphX, graphY + graphH);
      ctx.lineTo(graphX + graphW * 0.85, graphY + 30);
      ctx.stroke();

      // Operating Point Dot
      const opX = graphX + (optMw / 20) * (graphW * 0.85);
      const opY = graphY + graphH - (iphMa / 13) * (graphH - 30);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(opX, opY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = textColor;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`(${optMw} mW, ${iphMa.toFixed(2)} mA)`, opX + 10, opY);
    },

    renderSolarCell: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const G = p.irradianceWm2 || 1000;
      const isc = (G / 1000) * 3.8;
      const voc = 0.62 + Math.log(G / 1000 + 0.01) * 0.025;
      const vmp = voc * 0.82;
      const imp = isc * 0.88;
      const pmax = vmp * imp;
      const ff = (pmax / (voc * isc)) * 100;

      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Solar Cell Photovoltaic I-V & Power Characteristic', 24, 30);
      ctx.font = '12px monospace';
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`G = ${G} W/m² | Voc = ${voc.toFixed(2)} V | Isc = ${isc.toFixed(2)} A | Pmax = ${pmax.toFixed(2)} W | FF = ${ff.toFixed(1)}%`, 24, 50);

      // Graph Coordinates
      const gX = 80;
      const gY = 80;
      const gW = w - 160;
      const gH = h - 140;

      // Axes
      ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gX, gY);
      ctx.lineTo(gX, gY + gH);
      ctx.lineTo(gX + gW, gY + gH);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = '12px sans-serif';
      ctx.fillText('Voltage V (Volts) →', gX + gW - 120, gY + gH + 28);
      ctx.fillText('↑ Current I (Amperes)', gX - 60, gY - 10);

      // Max Power Rectangle
      const rectW = (vmp / 0.8) * gW;
      const rectH = (imp / 4.5) * gH;
      ctx.fillStyle = isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.22)';
      ctx.fillRect(gX, gY + gH - rectH, rectW, rectH);
      ctx.strokeStyle = '#10b981';
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(gX, gY + gH - rectH, rectW, rectH);
      ctx.setLineDash([]);

      // I-V Curve
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let vx = 0; vx <= 0.75; vx += 0.01) {
        const curr = isc - 1e-9 * (Math.exp((vx * 1.6e-19) / (1.2 * 1.38e-23 * 300)) - 1);
        const plotX = gX + (vx / 0.8) * gW;
        const plotY = gY + gH - (Math.max(0, curr) / 4.5) * gH;
        if (vx === 0) ctx.moveTo(plotX, plotY);
        else ctx.lineTo(plotX, plotY);
      }
      ctx.stroke();

      // MPP Point
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(gX + rectW, gY + gH - rectH, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = textColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`MPP (${vmp.toFixed(2)} V, ${imp.toFixed(2)} A)`, gX + rectW + 10, gY + gH - rectH - 8);
    },

    renderOled: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const v = p.forwardVoltageV || 4.5;
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Organic Light Emitting Diode (OLED) Multilayer Architecture', 24, 30);

      const layers = [
        { name: 'Metallic Cathode (Al/LiF)', color: '#94a3b8' },
        { name: 'Electron Transport Layer (ETL)', color: '#38bdf8' },
        { name: 'Emissive Layer (EML - Alq₃ / Ir)', color: '#10b981' },
        { name: 'Hole Transport Layer (HTL)', color: '#f43f5e' },
        { name: 'Transparent Anode (ITO)', color: '#fbbf24' },
        { name: 'Glass Substrate', color: isDark ? '#334155' : '#cbd5e1' }
      ];

      const startY = 65;
      const layerH = (h - 130) / layers.length;
      const layerW = w - 80;

      layers.forEach((l, idx) => {
        const y = startY + idx * layerH;
        ctx.fillStyle = l.color;
        ctx.globalAlpha = isDark ? 0.35 : 0.45;
        ctx.fillRect(40, y, layerW, layerH - 6);
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = l.color;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(40, y, layerW, layerH - 6);

        ctx.fillStyle = textColor;
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(l.name, 56, y + layerH / 2);
      });

      // Photons emerging from EML through glass
      const emlY = startY + 2.5 * layerH;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 5; i++) {
        const px = 180 + i * 140;
        ctx.beginPath();
        ctx.moveTo(px, emlY);
        ctx.lineTo(px + Math.sin(t * 3 + i) * 15, h - 35);
        ctx.stroke();
      }
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`Electroluminescence at V = ${v.toFixed(1)} V (λ = 525 nm Green Photon Emission)`, 40, h - 14);
    },

    renderOpticalStorage: function (ctx, w, h, p, t, isDark, isBluray) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const lambda = isBluray ? 405 : (p.laserWavelengthNm || 650);
      const na = isBluray ? 0.85 : 0.60;
      const spotNm = (0.6 * lambda / na).toFixed(0);

      ctx.textBaseline = 'top';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText((isBluray ? 'Blu-ray Disc Optical System (405 nm)' : 'Optical Data Storage (Pits & Lands)'), 24, 20);
      ctx.font = '11.5px monospace';
      ctx.fillStyle = isBluray ? '#6366f1' : '#ef4444';
      ctx.fillText(`Laser λ = ${lambda} nm | NA = ${na} | Spot Size = ${spotNm} nm | Pit Depth = λ/(4n)`, 24, 42);
      ctx.textBaseline = 'alphabetic';

      // Disc track cross section
      const discY = 160;
      const discW = w - 80;
      ctx.fillStyle = isDark ? '#1e293b' : '#e2e8f0';
      ctx.fillRect(40, discY, discW, 80);

      // Pits etched into disc
      const pits = [
        { x: 120, w: 80 },
        { x: 300, w: 120 },
        { x: 500, w: 90 },
        { x: 680, w: 140 }
      ];

      ctx.fillStyle = isDark ? '#070c14' : '#f8faf8';
      pits.forEach(pit => {
        ctx.fillRect(pit.x, discY, pit.w, 35);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(pit.x, discY, pit.w, 35);
      });

      // Laser Head
      const laserX = 40 + ((t * 80) % discW);
      ctx.strokeStyle = isBluray ? '#6366f1' : '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(laserX, 80);
      ctx.lineTo(laserX, discY);
      ctx.stroke();

      // Laser emitter head
      ctx.fillStyle = isBluray ? '#4338ca' : '#b91c1c';
      ctx.fillRect(laserX - 25, 60, 50, 20);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(isBluray ? '405nm' : '650nm', laserX - 16, 74);

      // Binary Signal Track at Bottom
      const sigY = h - 60;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(40, sigY);
      let isPit = false;
      for (let x = 40; x < w - 40; x += 10) {
        const inAnyPit = pits.some(p => x >= p.x && x <= p.x + p.w);
        const y = inAnyPit ? sigY + 25 : sigY;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.font = '11px sans-serif';
      ctx.fillText('Photodiode Binary RF Modulation Output (Low = Pit [Destructive λ/4], High = Land)', 40, h - 14);
    },

    // ──────────────────────────────────────────────────────────
    // UNIT II: MAGNETIC MATERIALS & DATA STORAGE
    // ──────────────────────────────────────────────────────────
    renderMagneticMaterials: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const cat = p.category || 'ferromagnetic';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Origin of Magnetic Moments: Orbital (μ_l) & Spin (μ_s)', 24, 30);

      // Atomic Model with Orbital & Spin vector
      const atomX = w * 0.28;
      const atomY = h * 0.52;

      // Nucleus
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(atomX, atomY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('+Ze', atomX - 11, atomY + 4);

      // Orbit
      ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(atomX, atomY, 80, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Electron
      const eAng = t * 2.5;
      const ex = atomX + Math.cos(eAng) * 80;
      const ey = atomY + Math.sin(eAng) * 80;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(ex, ey, 9, 0, Math.PI * 2);
      ctx.fill();

      // Spin vector on electron
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex, ey - 28);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('μ_s', ex + 4, ey - 28);

      // Right: Magnetic Classification Comparison
      const cX = w * 0.58;
      ctx.fillStyle = textColor;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Classification Comparison:', cX, 70);

      const items = [
        { name: 'Diamagnetic (χ < 0)', desc: 'Opposes external field. No permanent dipole (Bi, Cu, Au).' },
        { name: 'Paramagnetic (χ > 0)', desc: 'Weakly aligns with field. Disordered by heat (Al, Pt).' },
        { name: 'Ferromagnetic (χ ≫ 0)', desc: 'Spontaneous domain alignment via quantum exchange (Fe, Co, Ni).' }
      ];

      items.forEach((item, idx) => {
        const y = 100 + idx * 65;
        ctx.fillStyle = idx === 2 ? '#10b981' : textColor;
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(item.name, cX, y);
        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.font = '11px sans-serif';
        ctx.fillText(item.desc, cX, y + 18);
      });
    },

    renderFerromagnetism: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const appliedH = p.appliedFieldOe || 120;
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Ferromagnetic Domain Theory & Wall Dynamics (Weiss Field)', 24, 30);
      ctx.font = '12px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`Applied Field H = ${appliedH} Oe | Exchange Energy J > 0 | Spontaneous Magnetization`, 24, 50);

      // Domain Grid Box
      const boxX = 60;
      const boxY = 80;
      const boxW = w - 120;
      const boxH = h - 140;

      ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // 4 Weiss Domains with shift based on H
      const shift = clamp((appliedH / 300) * 80, -80, 80);
      const d1W = boxW * 0.25 + shift;
      const d2W = boxW * 0.25 - shift / 3;
      const d3W = boxW * 0.25 - shift / 3;
      const d4W = boxW - (d1W + d2W + d3W);

      const ws = [d1W, d2W, d3W, d4W];
      const angles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];

      let curX = boxX;
      ws.forEach((dw, idx) => {
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.strokeRect(curX, boxY, dw, boxH);

        // Draw magnetic moment arrows inside domain
        const ang = angles[idx];
        const rows = 4;
        const cols = Math.max(2, Math.floor(dw / 35));
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const mx = curX + (c + 0.5) * (dw / cols);
            const my = boxY + (r + 0.5) * (boxH / rows);
            ctx.strokeStyle = idx === 0 ? '#10b981' : '#f59e0b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(mx - Math.cos(ang) * 10, my - Math.sin(ang) * 10);
            ctx.lineTo(mx + Math.cos(ang) * 10, my + Math.sin(ang) * 10);
            ctx.stroke();
          }
        }

        curX += dw;
      });

      ctx.fillStyle = textColor;
      ctx.font = '11px sans-serif';
      ctx.fillText('As applied field H increases, domain walls move and favorably oriented domains expand.', 60, h - 20);
    },

    renderHysteresis: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const maxH = p.maxFieldH || 800;
      const br = p.remanenceBr || 1.2;
      const hc = p.coercivityHc || 450;
      const isHard = p.materialType === 'hard';

      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Magnetic Hysteresis (B-H Loop) & Energy Dissipation', 24, 30);
      ctx.font = '12px monospace';
      ctx.fillStyle = isHard ? '#f43f5e' : '#38bdf8';
      ctx.fillText(`Material: ${isHard ? 'HARD (Permanent Storage)' : 'SOFT (Transformer Core)'} | Br = ${br} T | Hc = ${hc} Oe`, 24, 50);

      const oX = w / 2;
      const oY = h / 2 + 10;
      const scaleX = (w * 0.38) / maxH;
      const scaleY = (h * 0.32) / 1.8;

      // Coordinate axes
      ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(oX - w * 0.42, oY);
      ctx.lineTo(oX + w * 0.42, oY);
      ctx.moveTo(oX, oY - h * 0.38);
      ctx.lineTo(oX, oY + h * 0.38);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Magnetic Field H (Oe) →', oX + w * 0.25, oY + 22);
      ctx.fillText('↑ Induction B (Tesla)', oX + 14, oY - h * 0.34);

      // Dynamic B-H Loop Shape
      const loopHc = isHard ? hc : 80;
      const loopBr = isHard ? br : 0.8;
      const loopBs = isHard ? 1.6 : 1.2;

      ctx.strokeStyle = isHard ? '#f43f5e' : '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();

      // Ascending branch
      for (let x = -maxH; x <= maxH; x += 10) {
        const norm = (x + loopHc) / maxH;
        const bVal = Math.tanh(norm * 2.2) * loopBs;
        const px = oX + x * scaleX;
        const py = oY - bVal * scaleY;
        if (x === -maxH) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }

      // Descending branch
      for (let x = maxH; x >= -maxH; x -= 10) {
        const norm = (x - loopHc) / maxH;
        const bVal = Math.tanh(norm * 2.2) * loopBs;
        const px = oX + x * scaleX;
        const py = oY - bVal * scaleY;
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = isHard ? 'rgba(244, 63, 94, 0.15)' : 'rgba(56, 189, 248, 0.15)';
      ctx.fill();

      // Key Points (Br and Hc highlights)
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(oX, oY - loopBr * scaleY, 6, 0, Math.PI * 2);
      ctx.arc(oX - loopHc * scaleX, oY, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = textColor;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`+Br = ${loopBr} T`, oX + 10, oY - loopBr * scaleY);
      ctx.fillText(`-Hc = -${loopHc} Oe`, oX - loopHc * scaleX - 70, oY - 10);
    },

    renderMagneticMemory: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const bit = p.bitState || 0;
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Magnetic Memory Devices: Magnetic Tunnel Junction (MTJ) MRAM', 24, 30);

      const mX = w * 0.35;
      const mY = 80;
      const mW = w * 0.3;

      // Free Layer
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(mX, mY, mW, 45);
      ctx.strokeStyle = '#0284c7';
      ctx.strokeRect(mX, mY, mW, 45);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`Free Layer (Orientation: ${bit === 0 ? '↑ Parallel' : '↓ Antiparallel'})`, mX + 16, mY + 28);

      // Tunnel Barrier (MgO insulator)
      ctx.fillStyle = isDark ? '#475569' : '#cbd5e1';
      ctx.fillRect(mX, mY + 45, mW, 25);
      ctx.fillStyle = textColor;
      ctx.font = '11px monospace';
      ctx.fillText('Insulating Barrier (MgO ~ 1 nm)', mX + 24, mY + 62);

      // Pinned Layer
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(mX, mY + 70, mW, 45);
      ctx.strokeStyle = '#b91c1c';
      ctx.strokeRect(mX, mY + 70, mW, 45);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Pinned / Reference Layer (Fixed ↑)', mX + 16, mY + 98);

      // Bit Readout
      ctx.fillStyle = bit === 0 ? '#10b981' : '#f59e0b';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(`Stored Binary: BIT ${bit} (${bit === 0 ? 'Low R — Parallel State' : 'High R — Antiparallel State'})`, mX - 40, mY + 160);
    },

    renderMagneticTape: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const speed = p.tapeSpeedMps || 3.8;
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Magnetic Tape Recording & Inductive Read Head', 24, 30);

      // Moving Tape
      const tapeY = 160;
      const tapeH = 60;
      ctx.fillStyle = '#78350f';
      ctx.fillRect(40, tapeY, w - 80, tapeH);
      ctx.strokeStyle = '#b45309';
      ctx.strokeRect(40, tapeY, w - 80, tapeH);

      // Magnetic Domains on Tape
      const shift = (t * speed * 25) % 60;
      ctx.fillStyle = '#fef3c7';
      for (let x = 40 - shift; x < w - 40; x += 60) {
        ctx.fillRect(x + 10, tapeY + 10, 40, tapeH - 20);
        ctx.fillStyle = '#000';
        ctx.font = '10px monospace';
        ctx.fillText('N S', x + 20, tapeY + 36);
        ctx.fillStyle = '#fef3c7';
      }

      // Write Head Core
      const headX = w / 2 - 30;
      ctx.fillStyle = isDark ? '#334155' : '#94a3b8';
      ctx.fillRect(headX, 70, 60, 75);
      ctx.strokeStyle = '#0284c7';
      ctx.strokeRect(headX, 70, 60, 75);
      ctx.fillStyle = '#0284c7';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Read/Write Head', headX - 16, 60);

      ctx.fillStyle = textColor;
      ctx.font = '11px sans-serif';
      ctx.fillText('Fringing magnetic field at gap aligns tape domains. Reading exploits Faraday induction e = -N dΦ/dt.', 40, h - 20);
    },

    renderGmrSensor: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const hExt = p.externalFieldOe || 0;
      const isParallel = Math.abs(hExt) > 50;

      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Giant Magnetoresistance (GMR) Spin Valve Read Head', 24, 30);
      ctx.font = '12px monospace';
      ctx.fillStyle = isParallel ? '#10b981' : '#ef4444';
      ctx.fillText(`External Field H = ${hExt} Oe | State: ${isParallel ? 'Parallel (Low Resistance R_P)' : 'Antiparallel (High Resistance R_AP)'}`, 24, 50);

      // Spin Valve Layers
      const sX = 60;
      const sY = 80;
      const sW = w * 0.45;

      // Free Layer
      ctx.fillStyle = isParallel ? '#10b981' : '#f43f5e';
      ctx.fillRect(sX, sY, sW, 35);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`Free Layer (${isParallel ? 'Oriented ↑' : 'Oriented ↓'})`, sX + 16, sY + 22);

      // Spacer
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(sX, sY + 35, sW, 20);
      ctx.fillStyle = '#000';
      ctx.font = '10px monospace';
      ctx.fillText('Cu Spacer (Non-magnetic)', sX + 24, sY + 49);

      // Pinned Layer
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(sX, sY + 55, sW, 35);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Pinned Layer (Fixed ↑)', sX + 16, sY + 77);

      // Right: Resistance Curve
      const gX = w * 0.58;
      const gY = 80;
      const gW = w * 0.36;
      const gH = h - 140;

      ctx.strokeStyle = isDark ? '#64748b' : '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(gX, gY, gW, gH);

      ctx.fillStyle = textColor;
      ctx.font = '11px sans-serif';
      ctx.fillText('Resistance R vs Magnetic Angle θ', gX + 14, gY + 20);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x < gW - 20; x += 4) {
        const ang = (x / (gW - 20)) * Math.PI;
        const rVal = 10 + 5 * (1 - Math.cos(ang));
        const py = gY + gH - 30 - (rVal / 25) * (gH - 50);
        if (x === 0) ctx.moveTo(gX + 10 + x, py);
        else ctx.lineTo(gX + 10 + x, py);
      }
      ctx.stroke();
    },

    renderMagneticBubble: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Magnetic Bubble Memories: Cylindrical Domain Propagation', 24, 30);

      // Orthoferrite film
      const filmY = 100;
      const filmH = h - 180;
      ctx.fillStyle = isDark ? 'rgba(71, 85, 105, 0.25)' : 'rgba(203, 213, 225, 0.3)';
      ctx.fillRect(40, filmY, w - 80, filmH);
      ctx.strokeStyle = '#64748b';
      ctx.strokeRect(40, filmY, w - 80, filmH);

      // Moving Bubbles
      const bubbleCount = 5;
      for (let i = 0; i < bubbleCount; i++) {
        const bx = 100 + ((i * 120 + t * 60) % (w - 200));
        const by = filmY + filmH / 2;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(bx, by, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('S (↓)', bx - 14, by + 4);
      }

      ctx.fillStyle = textColor;
      ctx.font = '11px sans-serif';
      ctx.fillText('Cylindrical magnetic bubbles move along Permalloy chevrons driven by rotating in-plane field.', 40, h - 20);
    },

    renderMagstripe: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const str = p.testString || 'KPRIET2026';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Magstripe Technology: F/2F Aiken Biphase Clocked Flux Reversals', 24, 30);

      // Magnetic Stripe
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(40, 70, w - 80, 50);
      ctx.strokeStyle = '#4338ca';
      ctx.strokeRect(40, 70, w - 80, 50);

      ctx.fillStyle = '#a5b4fc';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`Encoded Track Data: "${str}"`, 60, 100);

      // Scope waveform of F/2F transitions
      const waveY = 180;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(40, waveY);
      for (let x = 40; x < w - 40; x += 15) {
        const isPulse = (Math.floor((x - 40) / 15) % 3 === 0);
        ctx.lineTo(x, isPulse ? waveY - 35 : waveY + 35);
      }
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = '11px sans-serif';
      ctx.fillText('1 Transition per cell = Bit 0 | 2 Transitions per cell = Bit 1 (Self-clocking biphase)', 40, h - 20);
    },

    // ──────────────────────────────────────────────────────────
    // UNIT III: NANODEVICES
    // ──────────────────────────────────────────────────────────
    renderQuantumConfinement: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Quantum Confinement: Density of States DOS across 3D, 2D, 1D, 0D', 24, 30);

      const boxW = (w - 80) / 4;
      const dims = [
        { label: '3D Bulk', formula: 'D ∝ √E', color: '#38bdf8' },
        { label: '2D Well', formula: 'Staircase Steps', color: '#10b981' },
        { label: '1D Wire', formula: 'D ∝ 1/√E peaks', color: '#f59e0b' },
        { label: '0D Dot', formula: 'Discrete Delta Peaks', color: '#ec4899' }
      ];

      dims.forEach((d, idx) => {
        const bx = 30 + idx * (boxW + 8);
        ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
        ctx.strokeRect(bx, 60, boxW, h - 110);

        ctx.fillStyle = d.color;
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(d.label, bx + 12, 85);
        ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
        ctx.font = '11px monospace';
        ctx.fillText(d.formula, bx + 12, 105);

        // Draw DOS curve
        ctx.strokeStyle = d.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        const bY = h - 70;
        if (idx === 0) {
          // 3D sqrt curve
          for (let x = 0; x < boxW - 24; x += 2) {
            const py = bY - Math.sqrt(x / (boxW - 24)) * 90;
            if (x === 0) ctx.moveTo(bx + 12 + x, py);
            else ctx.lineTo(bx + 12 + x, py);
          }
        } else if (idx === 1) {
          // 2D Staircase
          let cx = bx + 12;
          ctx.moveTo(cx, bY);
          for (let s = 1; s <= 3; s++) {
            ctx.lineTo(cx + 25, bY - (s - 1) * 30);
            ctx.lineTo(cx + 25, bY - s * 30);
            cx += 25;
          }
        } else if (idx === 2) {
          // 1D spikes
          for (let s = 0; s < 3; s++) {
            const sx = bx + 20 + s * 30;
            ctx.moveTo(sx, bY - 80);
            ctx.lineTo(sx + 5, bY - 15);
            ctx.lineTo(sx + 20, bY - 10);
          }
        } else {
          // 0D delta spikes
          for (let s = 0; s < 4; s++) {
            const sx = bx + 18 + s * 24;
            ctx.moveTo(sx, bY);
            ctx.lineTo(sx, bY - 85);
          }
        }
        ctx.stroke();
      });
    },

    renderQuantumStructures: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Quantum Structures: Potential Well & Wavefunction Quantization', 24, 30);

      // Potential Well
      const wellX = 80;
      const wellW = w - 160;
      const wellY = 80;
      const wellH = h - 140;

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(wellX, wellY);
      ctx.lineTo(wellX, wellY + wellH);
      ctx.lineTo(wellX + wellW, wellY + wellH);
      ctx.lineTo(wellX + wellW, wellY);
      ctx.stroke();

      // Quantized energy levels (n=1, n=2, n=3)
      const ns = [1, 2, 3];
      const colors = ['#10b981', '#f59e0b', '#ec4899'];
      ns.forEach((n, idx) => {
        const ey = wellY + wellH - Math.pow(n, 2) * 25;
        ctx.strokeStyle = colors[idx];
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(wellX, ey);
        ctx.lineTo(wellX + wellW, ey);
        ctx.stroke();
        ctx.setLineDash([]);

        // Wavefunction psi_n(x)
        ctx.strokeStyle = colors[idx];
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = 0; x <= wellW; x += 4) {
          const psi = Math.sin((n * Math.PI * x) / wellW) * 20;
          const py = ey - psi;
          if (x === 0) ctx.moveTo(wellX + x, py);
          else ctx.lineTo(wellX + x, py);
        }
        ctx.stroke();

        ctx.fillStyle = colors[idx];
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`n=${n} (E_${n} ∝ ${n * n})`, wellX + wellW + 10, ey + 4);
      });
    },

    renderNanoBandgap: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const r = p.radiusNm || 3.0;
      // Brus formula approx
      const eg = 1.42 + 1.2 / (r * r);
      const lambdaNm = (1240 / eg).toFixed(0);

      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Nanomaterial Bandgap Tunability (Brus Equation)', 24, 30);
      ctx.font = '12px monospace';
      ctx.fillStyle = '#10b981';
      ctx.fillText(`Quantum Dot Radius r = ${r.toFixed(1)} nm | E_g = ${eg.toFixed(2)} eV | Emission λ = ${lambdaNm} nm`, 24, 50);

      // Nanoparticle circle visualization
      const dotX = w * 0.3;
      const dotY = h * 0.52;
      const pixelR = r * 14;

      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(dotX, dotY, pixelR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`r = ${r.toFixed(1)} nm`, dotX, dotY + 4);

      // Right: Blueshift Spectrum
      const sX = w * 0.55;
      const sY = 80;
      const sW = w * 0.4;
      const sH = h - 140;

      ctx.textAlign = 'left';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Bandgap E_g vs Nanoparticle Size r:', sX, sY + 20);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 1; x <= 10; x += 0.2) {
        const calcEg = 1.42 + 1.2 / (x * x);
        const px = sX + ((x - 1) / 9) * sW;
        const py = sY + sH - ((calcEg - 1.42) / 1.5) * (sH - 50);
        if (x === 1) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Current point on curve
      const curX = sX + ((r - 1) / 9) * sW;
      const curY = sY + sH - ((eg - 1.42) / 1.5) * (sH - 50);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(curX, curY, 7, 0, Math.PI * 2);
      ctx.fill();
    },

    renderQuantumTunnelling: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const E = p.particleEnergyEv || 3.0;
      const V0 = p.barrierHeightEv || 5.0;
      const a = p.barrierWidthNm || 0.8;
      const alpha = 5.12 * Math.sqrt(Math.max(0.01, V0 - E));
      const T = Math.exp(-2 * alpha * a);
      const R = 1 - T;

      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Quantum Mechanical Tunnelling Through Finite Potential Barrier', 24, 30);
      ctx.font = '12px monospace';
      ctx.fillStyle = '#10b981';
      ctx.fillText(`E = ${E.toFixed(1)} eV | V₀ = ${V0.toFixed(1)} eV | a = ${a.toFixed(2)} nm | T = ${(T * 100).toFixed(2)}% | R = ${(R * 100).toFixed(2)}%`, 24, 50);

      const bW = a * 80;
      const bX = (w - bW) / 2;
      const bY = 90;
      const bH = h - 160;

      // Barrier rectangle
      ctx.fillStyle = isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.18)';
      ctx.fillRect(bX, bY, bW, bH);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(bX, bY, bW, bH);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`Potential Barrier V₀ = ${V0.toFixed(1)} eV (Width a = ${a} nm)`, bX + 8, bY + 24);

      // Particle Wavefunction Curve
      const midY = bY + bH / 2;

      // Region I: Incident + Reflected Wave
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 40; x <= bX; x += 2) {
        const y = midY + Math.sin((x - t * 60) * 0.1) * 28 + Math.sin((x + t * 60) * 0.1) * (R * 15);
        if (x === 40) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Region II: Exponential decay inside barrier
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = bX; x <= bX + bW; x += 2) {
        const decay = Math.exp(-alpha * ((x - bX) / 80));
        const y = midY + decay * 28 * Math.cos(t * 5);
        if (x === bX) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Region III: Transmitted Wave
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = bX + bW; x <= w - 40; x += 2) {
        const y = midY + Math.sin((x - t * 60) * 0.1) * (28 * Math.sqrt(T));
        if (x === bX + bW) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = '11px sans-serif';
      ctx.fillText('Wavefunction exponentially decays through classically forbidden region (E < V₀) and emerges with non-zero probability.', 40, h - 16);
    },

    renderCoulombBlockade: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Coulomb Blockade: Charging Energy Ec = e²/(2C) & Coulomb Staircase', 24, 30);

      // Coulomb staircase I-V curve
      const gX = 80;
      const gY = 80;
      const gW = w - 160;
      const gH = h - 140;

      ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gX, gY + gH / 2);
      ctx.lineTo(gX + gW, gY + gH / 2);
      ctx.moveTo(gX + gW / 2, gY);
      ctx.lineTo(gX + gW / 2, gY + gH);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = '12px sans-serif';
      ctx.fillText('Bias Voltage V_ds →', gX + gW - 120, gY + gH / 2 + 20);
      ctx.fillText('↑ Current I_ds', gX + gW / 2 + 10, gY + 15);

      // Draw Staircase
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3.5;
      ctx.beginPath();

      const oX = gX + gW / 2;
      const oY = gY + gH / 2;
      const stepW = 40;
      const stepH = 25;

      // Central blockade zero-current plateau
      ctx.moveTo(oX - stepW, oY);
      ctx.lineTo(oX + stepW, oY);

      // Positive steps
      for (let s = 1; s <= 3; s++) {
        ctx.lineTo(oX + s * stepW, oY - s * stepH);
        ctx.lineTo(oX + (s + 1) * stepW, oY - s * stepH);
      }

      // Negative steps
      ctx.moveTo(oX - stepW, oY);
      for (let s = 1; s <= 3; s++) {
        ctx.lineTo(oX - s * stepW, oY + s * stepH);
        ctx.lineTo(oX - (s + 1) * stepW, oY + s * stepH);
      }
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Blockade Window [-e/2C, +e/2C]', oX - 80, oY - 10);
    },

    renderSingleElectronTransistor: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const vg = p.gateVoltageV || 0.15;
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Single Electron Transistor (SET) & Conductance Oscillations', 24, 30);

      // Structure: Source, Island, Drain, Gate
      const sX = 80;
      const dX = w - 160;
      const iX = w / 2;
      const cy = 130;

      // Source
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(sX, cy - 25, 70, 50);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Source', sX + 14, cy + 5);

      // Tunnel junction barrier
      ctx.strokeStyle = '#f59e0b';
      ctx.strokeRect(sX + 70, cy - 20, 20, 40);

      // Quantum Island
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(iX, cy, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('QD Island', iX - 25, cy + 4);

      // Tunnel junction barrier
      ctx.strokeStyle = '#f59e0b';
      ctx.strokeRect(iX + 32, cy - 20, 20, 40);

      // Drain
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(dX, cy - 25, 70, 50);
      ctx.fillStyle = '#fff';
      ctx.fillText('Drain', dX + 16, cy + 5);

      // Gate Electrode (top capacitive coupling)
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(iX - 35, 50, 70, 25);
      ctx.fillStyle = '#fff';
      ctx.fillText('Gate (Vg)', iX - 25, 66);

      // Coulomb oscillations curve at bottom
      const bY = h - 60;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 80; x < w - 80; x += 4) {
        const peak = Math.pow(Math.cos((x - 80) * 0.08), 12);
        const y = bY - peak * 45;
        if (x === 80) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = '11px sans-serif';
      ctx.fillText(`Gate Voltage Vg = ${vg.toFixed(2)} V tunes island energy levels, adding electrons one-by-one.`, 80, h - 14);
    },

    renderResonantTunnellingDiode: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Resonant Tunnelling Diode (RTD) & Negative Differential Resistance (NDR)', 24, 30);

      // Left: Double Barrier Band Diagram
      const rX = 60;
      const rY = 80;
      const rW = w * 0.45;
      const rH = h - 140;

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rX, rY + rH * 0.7);
      ctx.lineTo(rX + rW * 0.25, rY + rH * 0.7);
      ctx.lineTo(rX + rW * 0.25, rY + rH * 0.2);
      ctx.lineTo(rX + rW * 0.4, rY + rH * 0.2);
      ctx.lineTo(rX + rW * 0.4, rY + rH * 0.55); // well
      ctx.lineTo(rX + rW * 0.6, rY + rH * 0.55);
      ctx.lineTo(rX + rW * 0.6, rY + rH * 0.2);
      ctx.lineTo(rX + rW * 0.75, rY + rH * 0.2);
      ctx.lineTo(rX + rW * 0.75, rY + rH * 0.85);
      ctx.lineTo(rX + rW, rY + rH * 0.85);
      ctx.stroke();

      // Right: I-V curve with NDR
      const gX = w * 0.58;
      const gY = 80;
      const gW = w * 0.36;
      const gH = h - 140;

      ctx.strokeStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gX, gY + gH);
      ctx.lineTo(gX + gW, gY + gH);
      ctx.moveTo(gX, gY + gH);
      ctx.lineTo(gX, gY);
      ctx.stroke();

      // NDR curve
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(gX, gY + gH);
      ctx.lineTo(gX + gW * 0.35, gY + 30); // Peak
      ctx.lineTo(gX + gW * 0.6, gY + gH - 30); // Valley (NDR)
      ctx.lineTo(gX + gW * 0.9, gY + 15);
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Peak Current', gX + gW * 0.35 - 30, gY + 20);
      ctx.fillText('Valley', gX + gW * 0.6 - 15, gY + gH - 15);
      ctx.fillText('NDR: dI/dV < 0', gX + gW * 0.42, gY + gH * 0.5);
    },

    renderQCA: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Quantum Cellular Automata (QCA) 4-Dot Cell Polarization', 24, 30);

      // Two QCA cells: Bit 0 (P = -1) and Bit 1 (P = +1)
      const cell1X = w * 0.25;
      const cell2X = w * 0.65;
      const cy = h * 0.5;

      const renderCell = (cx, pol, label) => {
        ctx.strokeStyle = isDark ? '#64748b' : '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 50, cy - 50, 100, 100);

        const dotPos = [
          { x: cx - 30, y: cy - 30 },
          { x: cx + 30, y: cy - 30 },
          { x: cx + 30, y: cy + 30 },
          { x: cx - 30, y: cy + 30 }
        ];

        dotPos.forEach((dp, idx) => {
          const isFilled = (pol === 1 && (idx === 0 || idx === 2)) || (pol === -1 && (idx === 1 || idx === 3));
          ctx.fillStyle = isFilled ? '#38bdf8' : (isDark ? '#334155' : '#e2e8f0');
          ctx.beginPath();
          ctx.arc(dp.x, dp.y, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#0284c7';
          ctx.stroke();
        });

        ctx.fillStyle = textColor;
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, cx, cy + 75);
      };

      renderCell(cell1X, -1, 'Binary 0 (Polarization P = -1)');
      renderCell(cell2X, 1, 'Binary 1 (Polarization P = +1)');
    },

    // ──────────────────────────────────────────────────────────
    // UNIT IV: QUANTUM COMPUTING
    // ──────────────────────────────────────────────────────────
    renderClassicalVsQuantum: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Classical vs Quantum Computing: Deterministic Bit vs Superposition', 24, 30);

      // Left: Classical Bit
      const cX = w * 0.28;
      const cy = h * 0.52;
      ctx.strokeStyle = isDark ? '#475569' : '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(cX - 100, cy - 80, 200, 160);
      ctx.fillStyle = '#3b82f6';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Classical Bit', cX, cy - 50);
      ctx.font = 'bold 36px monospace';
      ctx.fillText(Math.floor(t) % 2 === 0 ? '0' : '1', cX, cy + 10);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
      ctx.fillText('Strictly 0 OR 1 at any moment', cX, cy + 50);

      // Right: Quantum Qubit
      const qX = w * 0.72;
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.strokeRect(qX - 120, cy - 80, 240, 160);
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Quantum Qubit', qX, cy - 50);
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = textColor;
      ctx.fillText('|ψ⟩ = α|0⟩ + β|1⟩', qX, cy + 5);
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#10b981';
      ctx.fillText('Continuous Superposition & Born Rule', qX, cy + 50);
    },

    renderQubitState: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const aP = p.alphaProb || 0.707;
      const bP = p.betaProb || 0.707;
      const p0 = Math.pow(aP, 2);
      const p1 = Math.pow(bP, 2);

      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Qubit State Representation & Born Rule Measurement', 24, 30);
      ctx.font = '12px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`|ψ⟩ = ${aP.toFixed(3)}|0⟩ + ${bP.toFixed(3)}|1⟩ | P(0) = ${(p0 * 100).toFixed(1)}% | P(1) = ${(p1 * 100).toFixed(1)}%`, 24, 50);

      // Probability Bar Charts
      const barW = 90;
      const barH = 150;
      const b1X = w * 0.35;
      const b2X = w * 0.55;
      const bY = h * 0.65;

      // Bar 0
      ctx.fillStyle = '#3b82f6';
      const h0 = p0 * barH;
      ctx.fillRect(b1X, bY - h0, barW, h0);
      ctx.strokeStyle = '#2563eb';
      ctx.strokeRect(b1X, bY - h0, barW, h0);

      // Bar 1
      ctx.fillStyle = '#ec4899';
      const h1 = p1 * barH;
      ctx.fillRect(b2X, bY - h1, barW, h1);
      ctx.strokeStyle = '#db2777';
      ctx.strokeRect(b2X, bY - h1, barW, h1);

      ctx.fillStyle = textColor;
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`|0⟩ : ${(p0 * 100).toFixed(1)}%`, b1X + barW / 2, bY + 25);
      ctx.fillText(`|1⟩ : ${(p1 * 100).toFixed(1)}%`, b2X + barW / 2, bY + 25);
    },

    // ──────────────────────────────────────────────────────────
    // BLOCH SPHERE — 3D INTERACTIVE QUANTUM VISUALIZER
    // ──────────────────────────────────────────────────────────
    renderBlochSphere: function (ctx, w, h, p, t, isDark, state) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const theta = ((p.thetaDeg !== undefined ? p.thetaDeg : 90) * Math.PI) / 180;
      const phi = ((p.phiDeg !== undefined ? p.phiDeg : 0) * Math.PI) / 180;

      // View angles incorporating interactive mouse drag & 3D toolbar rotation
      const baseRotX = (state && state.blochRotX !== undefined) ? state.blochRotX * (180 / Math.PI) : (p.viewRotX !== undefined ? p.viewRotX : 18);
      const baseRotY = (state && state.blochRotY !== undefined) ? state.blochRotY * (180 / Math.PI) : (p.viewRotY !== undefined ? p.viewRotY : -35);
      const rotX = ((baseRotX + Math.sin(t * 0.5) * 4) * Math.PI) / 180;
      const rotY = ((baseRotY + t * 4) * Math.PI) / 180;

      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Bloch Sphere 3D Interactive Quantum Visualizer ⭐', 24, 30);

      const p0 = Math.pow(Math.cos(theta / 2), 2);
      const p1 = Math.pow(Math.sin(theta / 2), 2);
      ctx.font = '12px monospace';
      ctx.fillStyle = '#a855f7';
      ctx.fillText(`θ = ${(theta * 180 / Math.PI).toFixed(1)}° | φ = ${(phi * 180 / Math.PI).toFixed(1)}° | |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩ | P(0)=${(p0 * 100).toFixed(1)}% | P(1)=${(p1 * 100).toFixed(1)}%`, 24, 50);

      // Sphere Center & Radius
      const cX = w * 0.42;
      const cY = h * 0.54;
      const R = Math.min(130, h * 0.34);

      // 3D Projection helper
      const project = (x, y, z) => {
        // Rotate Y
        const x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
        const z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);
        // Rotate X
        const y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
        const z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
        return {
          px: cX + x1 * R,
          py: cY - y2 * R,
          pz: z2
        };
      };

      // Sphere Outline & Equator Wireframe
      ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cX, cY, R, 0, Math.PI * 2);
      ctx.stroke();

      // Equator Ellipse
      ctx.strokeStyle = isDark ? 'rgba(100, 116, 139, 0.4)' : 'rgba(148, 163, 184, 0.5)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += 0.1) {
        const pt = project(Math.cos(a), 0, Math.sin(a));
        if (a === 0) ctx.moveTo(pt.px, pt.py);
        else ctx.lineTo(pt.px, pt.py);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      // Axes (+Z, -Z, +X, -X, +Y, -Y)
      const drawAxis = (x, y, z, label) => {
        const pt = project(x, y, z);
        ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cX, cY);
        ctx.lineTo(pt.px, pt.py);
        ctx.stroke();
        ctx.fillStyle = textColor;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(label, pt.px + 4, pt.py);
      };

      drawAxis(0, 1.25, 0, '|0⟩ (+Z)');
      drawAxis(0, -1.25, 0, '|1⟩ (-Z)');
      drawAxis(1.25, 0, 0, '|+⟩ (+X)');
      drawAxis(0, 0, 1.25, '|i⟩ (+Y)');

      // State Vector (Bloch Vector)
      const vx = Math.sin(theta) * Math.cos(phi);
      const vy = Math.cos(theta); // in physics Z is up, here mapped to y
      const vz = Math.sin(theta) * Math.sin(phi);

      const vPt = project(vx, vy, vz);

      // Trajectory Arrow
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cX, cY);
      ctx.lineTo(vPt.px, vPt.py);
      ctx.stroke();

      // Tip Dot
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(vPt.px, vPt.py, 7, 0, Math.PI * 2);
      ctx.fill();

      // Right: Quick Gate Buttons & Presets
      const pX = w * 0.74;
      ctx.fillStyle = textColor;
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Qubit State Presets:', pX, 85);

      const presets = [
        { name: '|0⟩ Ground State', t: 0, p: 0 },
        { name: '|1⟩ Excited State', t: 180, p: 0 },
        { name: '|+⟩ Superposition (X)', t: 90, p: 0 },
        { name: '|−⟩ Superposition (-X)', t: 90, p: 180 },
        { name: '|i⟩ Circular (+Y)', t: 90, p: 90 }
      ];

      presets.forEach((pr, idx) => {
        const py = 110 + idx * 30;
        ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
        ctx.fillRect(pX, py - 16, 170, 24);
        ctx.strokeStyle = '#0284c7';
        ctx.strokeRect(pX, py - 16, 170, 24);
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(pr.name, pX + 12, py);
      });
    },

    renderTwoQubitEntanglement: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Two Qubit State Space & Bell Entanglement |Φ⁺⟩ = (|00⟩ + |11⟩)/√2', 24, 30);

      const q1X = w * 0.32;
      const q2X = w * 0.68;
      const cy = h * 0.52;

      // Qubit 1
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(q1X, cy, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Qubit A', q1X, cy - 8);
      ctx.font = 'bold 18px monospace';
      ctx.fillText('q₀', q1X, cy + 18);

      // Qubit 2
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(q2X, cy, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Qubit B', q2X, cy - 8);
      ctx.font = 'bold 18px monospace';
      ctx.fillText('q₁', q2X, cy + 18);

      // Entanglement Bond (oscillating glowing connection)
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 4 + Math.sin(t * 4) * 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(q1X + 45, cy);
      ctx.lineTo(q2X - 45, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Quantum Entanglement Bond', (q1X + q2X) / 2, cy - 14);

      ctx.fillStyle = textColor;
      ctx.font = '11px sans-serif';
      ctx.fillText('Simultaneous measurement on Qubit A instantaneously collapses Qubit B with 100% correlation.', w / 2, h - 20);
    },

    // ──────────────────────────────────────────────────────────
    // UNIT V: QUANTUM CIRCUITS
    // ──────────────────────────────────────────────────────────
    renderQuantumDevices: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Physical Quantum Devices: Superconducting Transmon, Ion Trap & Spin Qubit', 24, 30);

      const devW = (w - 80) / 3;
      const devices = [
        { name: '1. Superconducting Transmon', tech: 'Josephson Junction + Shunt C', t2: 'T₂ ~ 80 µs', color: '#38bdf8' },
        { name: '2. Trapped Ion Qubit', tech: 'Laser Cooled ⁴⁰Ca⁺ / ¹⁷¹Yb⁺', t2: 'T₂ ~ 10 s', color: '#10b981' },
        { name: '3. Silicon Spin Qubit', tech: 'Quantum Dot Single Electron Spin', t2: 'T₂ ~ 1 ms', color: '#f59e0b' }
      ];

      devices.forEach((d, idx) => {
        const dx = 30 + idx * (devW + 10);
        ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(dx, 65, devW, h - 110);

        ctx.fillStyle = d.color;
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(d.name, dx + 14, 95);
        ctx.fillStyle = textColor;
        ctx.font = '11px sans-serif';
        ctx.fillText(d.tech, dx + 14, 120);
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`Coherence: ${d.t2}`, dx + 14, 145);
      });
    },

    renderQuantumGateLab: function (ctx, w, h, p, t, isDark, state) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      const gate = p.activeGate || 'H';
      const inState = p.inputState || '0';

      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Universal Quantum Gate Laboratory · Active Gate: [${gate}]`, 24, 30);

      // Gate Matrix Display
      const mX = 60;
      const mY = 80;
      ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9';
      ctx.fillRect(mX, mY, 180, 110);
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.strokeRect(mX, mY, 180, 110);

      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`Unitary Matrix U (${gate}):`, mX + 16, mY + 28);

      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = textColor;
      if (gate === 'X') {
        ctx.fillText('[ 0   1 ]', mX + 45, mY + 60);
        ctx.fillText('[ 1   0 ]', mX + 45, mY + 85);
      } else if (gate === 'Z') {
        ctx.fillText('[ 1   0 ]', mX + 45, mY + 60);
        ctx.fillText('[ 0  -1 ]', mX + 45, mY + 85);
      } else if (gate === 'H') {
        ctx.fillText('1/√2 [ 1   1 ]', mX + 28, mY + 60);
        ctx.fillText('     [ 1  -1 ]', mX + 28, mY + 85);
      } else if (gate === 'Y') {
        ctx.fillText('[ 0  -i ]', mX + 45, mY + 60);
        ctx.fillText('[ i   0 ]', mX + 45, mY + 85);
      } else if (gate === 'S') {
        ctx.fillText('[ 1   0 ]', mX + 45, mY + 60);
        ctx.fillText('[ 0   i ]', mX + 45, mY + 85);
      } else {
        ctx.fillText('[ 1      0     ]', mX + 20, mY + 60);
        ctx.fillText('[ 0  e^(iπ/4)  ]', mX + 20, mY + 85);
      }

      // Circuit Pipeline Graphic
      const cX = w * 0.42;
      const cY = 135;
      ctx.strokeStyle = textColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cX, cY);
      ctx.lineTo(cX + 240, cY);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`|${inState}⟩`, cX - 25, cY + 5);

      // Gate Box
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(cX + 80, cY - 25, 50, 50);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(gate, cX + 96, cY + 8);

      // Output state
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 14px monospace';
      let outStr = '|1⟩';
      if (gate === 'H' && inState === '0') outStr = '(|0⟩+|1⟩)/√2';
      else if (gate === 'H' && inState === '1') outStr = '(|0⟩-|1⟩)/√2';
      else if (gate === 'X' && inState === '0') outStr = '|1⟩';
      else if (gate === 'Z' && inState === '0') outStr = '|0⟩';
      else if (gate === 'Z' && inState === '1') outStr = '-|1⟩';
      ctx.fillText(`Output: ${outStr}`, cX + 150, cY - 35);
    },

    renderMultiQubitCircuit: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Multi-Qubit CNOT Gate & Bell State Synthesis Circuit', 24, 30);

      const q0Y = 110;
      const q1Y = 200;
      const lX = 80;
      const rX = w - 80;

      // Qubit Lines
      ctx.strokeStyle = isDark ? '#cbd5e1' : '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(lX, q0Y);
      ctx.lineTo(rX, q0Y);
      ctx.moveTo(lX, q1Y);
      ctx.lineTo(rX, q1Y);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('q₀: |0⟩', lX - 55, q0Y + 5);
      ctx.fillText('q₁: |0⟩', lX - 55, q1Y + 5);

      // Hadamard on q0
      const hX = lX + 100;
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(hX, q0Y - 20, 40, 40);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('H', hX + 13, q0Y + 7);

      // CNOT: Control dot on q0, Target target-circle on q1
      const cnotX = lX + 240;
      // Control Dot
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(cnotX, q0Y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Connecting line
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cnotX, q0Y);
      ctx.lineTo(cnotX, q1Y);
      ctx.stroke();

      // Target circle (+)
      ctx.beginPath();
      ctx.arc(cnotX, q1Y, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cnotX - 16, q1Y);
      ctx.lineTo(cnotX + 16, q1Y);
      ctx.moveTo(cnotX, q1Y - 16);
      ctx.lineTo(cnotX, q1Y + 16);
      ctx.stroke();

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 15px monospace';
      ctx.fillText('Output: |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 (Maximally Entangled Bell State)', lX + 100, h - 30);
    },

    renderQuantumChip: function (ctx, w, h, p, t, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Quantum Processor Chip (QPU) Architecture & Dilution Refrigerator', 24, 30);

      // Silicon Die
      const dieX = 80;
      const dieY = 70;
      const dieW = w - 160;
      const dieH = h - 120;

      ctx.fillStyle = isDark ? '#090d16' : '#f8fafc';
      ctx.fillRect(dieX, dieY, dieW, dieH);
      ctx.strokeStyle = '#4338ca';
      ctx.lineWidth = 3;
      ctx.strokeRect(dieX, dieY, dieW, dieH);

      // Qubit Nodes (Heavy-hex layout simulation)
      const qCols = 4;
      const qRows = 2;
      for (let r = 0; r < qRows; r++) {
        for (let c = 0; c < qCols; c++) {
          const qx = dieX + 80 + c * ((dieW - 160) / (qCols - 1));
          const qy = dieY + 60 + r * ((dieH - 120) / (qRows - 1));

          // Resonator line
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(qx, dieY);
          ctx.lineTo(qx, qy);
          ctx.stroke();

          // Qubit Transmon Pad
          ctx.fillStyle = '#ec4899';
          ctx.beginPath();
          ctx.arc(qx, qy, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px monospace';
          ctx.fillText(`Q${r * qCols + c}`, qx - 8, qy + 4);
        }
      }

      ctx.fillStyle = '#10b981';
      ctx.font = '11px sans-serif';
      ctx.fillText('Operating at 15 mK inside dilution refrigerator; individual microwave XY drive & Z flux bias lines.', 80, h - 16);
    },

    renderDefaultOverview: function (ctx, w, h, sim, isDark) {
      const textColor = isDark ? '#e2e8f0' : '#1e293b';
      ctx.fillStyle = textColor;
      ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(sim.title || 'Physics for Data Storage Simulation', 40, 50);
      ctx.font = '13px sans-serif';
      ctx.fillText(sim.shortDescription || 'Interactive physics and quantum computing model.', 40, 80);
    }
  };
}));

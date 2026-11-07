/**
 * Module 5 — Metallurgical Optical Microscope & Microstructure Explorer
 * Circular reticle aperture, variable optical magnification (100x-1000x), grain boundary topology & phases
 */

import * as THREE from 'three';
import { BaseMetallurgySimulation } from '../BaseMetallurgySimulation';
import type { MetallographicSpecimenId } from '../../core/types';
import { METALLOGRAPHIC_SPECIMENS_DATA } from '../../core/MetallurgyMaterials';

export class MicrostructureViewerScene extends BaseMetallurgySimulation {
  private specimenId: MetallographicSpecimenId = 'low-carbon-steel-annealed';
  private magnification: number = 250; // 100x, 250x, 500x, 1000x
  private focusPercent: number = 100; // 0% (blurry) to 100% (sharp)

  private microscopeGroup: THREE.Group = new THREE.Group();
  private fieldOfViewMesh: THREE.Mesh | null = null;
  private canvasTexture: THREE.CanvasTexture | null = null;
  private offscreenCanvas: HTMLCanvasElement;
  private offscreenCtx: CanvasRenderingContext2D;

  constructor(container: HTMLElement) {
    // Create an offscreen canvas to procedurally render calibrated metallographic microstructures
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 1024;
    offCanvas.height = 1024;
    const ctx = offCanvas.getContext('2d')!;

    super(container);
    this.offscreenCanvas = offCanvas;
    this.offscreenCtx = ctx;
    this.renderMicrostructureToCanvas();
  }

  protected initScene(): void {
    this.camera.position.set(0, 0, 5.0);
    this.controls.target.set(0, 0, 0);
    this.controls.enableRotate = false; // Circular microscope view
    this.controls.update();

    this.scene.add(this.microscopeGroup);
    this.buildMicroscopeOcularField();
  }

  private buildMicroscopeOcularField(): void {
    // 1. Specimen image disk inside the circular ocular
    this.canvasTexture = new THREE.CanvasTexture(this.offscreenCanvas);
    this.canvasTexture.colorSpace = THREE.SRGBColorSpace;

    const discGeo = new THREE.CircleGeometry(2.2, 64);
    const discMat = new THREE.MeshBasicMaterial({
      map: this.canvasTexture,
      side: THREE.DoubleSide,
    });
    this.fieldOfViewMesh = new THREE.Mesh(discGeo, discMat);
    this.microscopeGroup.add(this.fieldOfViewMesh);

    // 2. Microscope Dark Ocular Ring Frame (Field aperture diaphragm)
    const ringGeo = new THREE.RingGeometry(2.18, 3.8, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.z = 0.05;
    this.microscopeGroup.add(ringMesh);

    // 3. Eyepiece Reticle Crosshair & Scale Graticule
    const reticleMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
    const reticlePoints = [
      new THREE.Vector3(-2.15, 0, 0.06),
      new THREE.Vector3(2.15, 0, 0.06),
      new THREE.Vector3(0, -2.15, 0.06),
      new THREE.Vector3(0, 2.15, 0.06),
    ];
    const reticleGeo = new THREE.BufferGeometry().setFromPoints(reticlePoints);
    this.microscopeGroup.add(new THREE.LineSegments(reticleGeo, reticleMat));
  }

  private renderMicrostructureToCanvas(): void {
    const ctx = this.offscreenCtx;
    if (!ctx) return;

    const w = this.offscreenCanvas.width;
    const h = this.offscreenCanvas.height;
    ctx.clearRect(0, 0, w, h);

    // Zoom scale based on magnification: 100x -> scale 1.0, 1000x -> scale 3.2
    const zoomScale = Math.sqrt(this.magnification / 100);

    // Apply focus blur if focus is not 100%
    const blurAmount = Math.max(0, (100 - this.focusPercent) * 0.15);
    ctx.filter = blurAmount > 0.2 ? `blur(${blurAmount}px)` : 'none';

    switch (this.specimenId) {
      case 'low-carbon-steel-annealed':
        this.drawLowCarbonSteel(ctx, w, h, zoomScale);
        break;
      case 'medium-carbon-steel-normalized':
        this.drawMediumCarbonSteel(ctx, w, h, zoomScale);
        break;
      case 'high-carbon-steel-eutectoid':
        this.drawEutectoidPearlite(ctx, w, h, zoomScale);
        break;
      case 'quenched-martensite-steel':
        this.drawMartensite(ctx, w, h, zoomScale);
        break;
      case 'tempered-martensite-steel':
        this.drawTemperedMartensite(ctx, w, h, zoomScale);
        break;
      case 'grey-cast-iron-flakes':
        this.drawGreyCastIron(ctx, w, h, zoomScale);
        break;
      case 'spheroidal-ductile-iron':
        this.drawDuctileIron(ctx, w, h, zoomScale);
        break;
      case 'white-cast-iron-cementite':
        this.drawWhiteCastIron(ctx, w, h, zoomScale);
        break;
      case 'alpha-beta-brass':
        this.drawAlphaBetaBrass(ctx, w, h, zoomScale);
        break;
    }

    ctx.filter = 'none';

    if (this.canvasTexture) {
      this.canvasTexture.needsUpdate = true;
    }
  }

  // 1. Hypoeutectoid Steel: White Ferrite matrix with dark Pearlite colonies
  private drawLowCarbonSteel(ctx: CanvasRenderingContext2D, w: number, h: number, zoom: number): void {
    ctx.fillStyle = '#f1f5f9'; // Light ferrite background
    ctx.fillRect(0, 0, w, h);

    const gridSize = Math.round(75 * zoom);
    ctx.strokeStyle = '#64748b'; // Ferrite grain boundaries
    ctx.lineWidth = 2.5;

    // Voronoi-like polygonal grains with pearlite patches
    for (let x = 0; x < w; x += gridSize) {
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.rect(x + 5, y + 5, gridSize - 10, gridSize - 10);
        ctx.stroke();

        // 25% area filled with dark pearlite
        if ((x + y * 3) % 4 === 0) {
          ctx.fillStyle = '#334155';
          ctx.fillRect(x + 8, y + 8, gridSize - 16, gridSize - 16);
          // Fingerprint lamellae lines
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.2;
          for (let l = 12; l < gridSize - 16; l += 6) {
            ctx.beginPath();
            ctx.moveTo(x + l, y + 8);
            ctx.lineTo(x + l + 10, y + gridSize - 16);
            ctx.stroke();
          }
        }
      }
    }
  }

  // 2. Medium Carbon Steel: 60% Pearlite + 40% Ferrite grain network
  private drawMediumCarbonSteel(ctx: CanvasRenderingContext2D, w: number, h: number, zoom: number): void {
    ctx.fillStyle = '#334155'; // Dark fine pearlite matrix
    ctx.fillRect(0, 0, w, h);

    const step = Math.round(60 * zoom);
    ctx.strokeStyle = '#f8fafc'; // White proeutectoid ferrite boundary network
    ctx.lineWidth = 4.0;

    for (let x = 0; x < w; x += step) {
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.arc(x + step / 2, y + step / 2, step * 0.45, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  // 3. Eutectoid Steel: 100% Lamellar Pearlite
  private drawEutectoidPearlite(ctx: CanvasRenderingContext2D, w: number, h: number, zoom: number): void {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, h);

    const colonySize = Math.round(120 * zoom);
    for (let cx = 0; cx < w; cx += colonySize) {
      for (let cy = 0; cy < h; cy += colonySize) {
        const angle = ((cx * 3 + cy * 7) % 180) * (Math.PI / 180);
        ctx.save();
        ctx.translate(cx + colonySize / 2, cy + colonySize / 2);
        ctx.rotate(angle);

        ctx.strokeStyle = '#e2e8f0'; // Alternating cementite lamellae
        ctx.lineWidth = 2.0;
        const lineSpacing = Math.max(3, 8 * (zoom / 1.5));
        for (let lx = -colonySize / 2; lx < colonySize / 2; lx += lineSpacing) {
          ctx.beginPath();
          ctx.moveTo(lx, -colonySize / 2);
          ctx.lineTo(lx, colonySize / 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  // 4. Hardened Martensite: Acicular needle-like laths
  private drawMartensite(ctx: CanvasRenderingContext2D, w: number, h: number, zoom: number): void {
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, w, h);

    const lathCount = Math.round(250 * zoom);
    ctx.lineWidth = 2.0;

    for (let i = 0; i < lathCount; i++) {
      const x = ((i * 137) % w);
      const y = ((i * 283) % h);
      const len = 35 * zoom;
      const angle = (i % 3) * (Math.PI / 3); // 60° and 120° acicular lath needles

      ctx.strokeStyle = i % 2 === 0 ? '#0f172a' : '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len * Math.cos(angle), y + len * Math.sin(angle));
      ctx.stroke();
    }
  }

  // 5. Tempered Martensite: Globular carbide spheroids in ferrite
  private drawTemperedMartensite(ctx: CanvasRenderingContext2D, w: number, h: number, zoom: number): void {
    ctx.fillStyle = '#64748b'; // Uniform grey tempered matrix
    ctx.fillRect(0, 0, w, h);

    const count = Math.round(500 * zoom);
    ctx.fillStyle = '#0f172a'; // Submicroscopic cementite spheroids
    for (let i = 0; i < count; i++) {
      const x = (i * 97) % w;
      const y = (i * 211) % h;
      const r = Math.max(1.5, 3.5 * (zoom / 2));
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 6. Grey Cast Iron: Curved black graphite flakes
  private drawGreyCastIron(ctx: CanvasRenderingContext2D, w: number, h: number, zoom: number): void {
    ctx.fillStyle = '#94a3b8'; // Pearlitic grey matrix
    ctx.fillRect(0, 0, w, h);

    const flakeCount = Math.round(60 * zoom);
    ctx.strokeStyle = '#020617'; // Jet black graphite flakes
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';

    for (let i = 0; i < flakeCount; i++) {
      const x = (i * 123) % w;
      const y = (i * 347) % h;
      const len = 50 * zoom;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x + len * 0.3, y - 20, x + len * 0.7, y + 25, x + len, y + 5);
      ctx.stroke();
    }
  }

  // 7. Ductile / SG Iron: Round graphite spheroids with white ferrite "bull's-eye" halos
  private drawDuctileIron(ctx: CanvasRenderingContext2D, w: number, h: number, zoom: number): void {
    ctx.fillStyle = '#475569'; // Pearlitic background
    ctx.fillRect(0, 0, w, h);

    const noduleCount = Math.round(35 * zoom);
    for (let i = 0; i < noduleCount; i++) {
      const x = (i * 157) % w;
      const y = (i * 281) % h;
      const r = 24 * (zoom / 1.5);

      // White Ferrite Halo ("Bull's eye")
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(x, y, r * 1.7, 0, Math.PI * 2);
      ctx.fill();

      // Black Graphite Spheroid
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 8. White Cast Iron: Massive continuous white cementite plates
  private drawWhiteCastIron(ctx: CanvasRenderingContext2D, w: number, h: number, zoom: number): void {
    ctx.fillStyle = '#0f172a'; // Transformed ledeburite colonies
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#f8fafc'; // Massive free cementite plates
    const plateCount = Math.round(25 * zoom);
    for (let i = 0; i < plateCount; i++) {
      const x = (i * 179) % w;
      const y = (i * 313) % h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 120 * zoom, y + 40);
      ctx.lineTo(x + 90 * zoom, y + 100 * zoom);
      ctx.closePath();
      ctx.fill();
    }
  }

  // 9. Muntz Metal (α+β Brass)
  private drawAlphaBetaBrass(ctx: CanvasRenderingContext2D, w: number, h: number, zoom: number): void {
    ctx.fillStyle = '#78350f'; // Dark brown β' matrix
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#fde047'; // Bright golden yellow α needles
    const needleCount = Math.round(80 * zoom);
    for (let i = 0; i < needleCount; i++) {
      const x = (i * 113) % w;
      const y = (i * 257) % h;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((i % 4) * (Math.PI / 4));
      ctx.fillRect(-25 * zoom, -4, 50 * zoom, 8);
      ctx.restore();
    }
  }

  public updateAnimation(_delta: number, _elapsed: number): void {}

  public updateParameters(params: {
    specimenId?: MetallographicSpecimenId;
    magnification?: number;
    focusPercent?: number;
  }): void {
    let needsRedraw = false;
    if (params.specimenId !== undefined && params.specimenId !== this.specimenId) {
      this.specimenId = params.specimenId;
      needsRedraw = true;
    }
    if (params.magnification !== undefined && params.magnification !== this.magnification) {
      this.magnification = params.magnification;
      needsRedraw = true;
    }
    if (params.focusPercent !== undefined && params.focusPercent !== this.focusPercent) {
      this.focusPercent = params.focusPercent;
      needsRedraw = true;
    }

    if (needsRedraw) {
      this.renderMicrostructureToCanvas();
    }
  }
}

/**
 * PhenomenaOfLightSim.tsx
 * Ultra-High-Definition Optical Laboratory Simulation: Phenomena of Light (प्रकाशका परिघटनाहरू)
 * Class 10 Science & Technology • Chapter 5: Light (प्रकाश)
 * Nepal Curriculum Development Centre (CDC) Alignment
 *
 * Implements 9 Optical Phenomena:
 * 1. Reflection (परावर्तन)
 * 2. Refraction (अपवर्तन) - Deep-Dive with Meaning, Causes, and Glass Slab Lateral Shift
 * 3. Dispersion (वर्ण विच्छेदन) - White Light through Prism to VIBGYOR with Explicit Wavelengths
 * 4. Diffraction (विवर्तन) - Single Slit Wave Bending & Fraunhofer Envelope
 * 5. Interference (व्यतिकरण) - Young's Double Slit & Fringe Spacing
 * 6. Polarization (ध्रुवीकरण) - 3D Transverse EM Waves & Malus's Law
 * 7. Total Internal Reflection - TIR (पूर्ण आन्तरिक परावर्तन) - Critical Angle θc & Grazing Ray
 * 8. Photoelectric Effect (फोटोइलेक्ट्रिक प्रभाव) - Vacuum Phototube & Analog Microammeter
 * 9. Compton Effect (कम्प्टोन प्रभाव) - Quantum Photon-Electron Scattering & Wavelength Shift
 *
 * Visual Engine:
 * - Pure White Laboratory Canvas Theme (#ffffff) without background clutter (protractor removed!)
 * - Automatic Slow Flow of Laser Light: Ray slowly propagates on tab/mode switch
 * - Precise Wavelength (nm) markers in Dispersion for all 7 VIBGYOR colors
 * - Critical Angle (θc) reference line, grazing ray at 90°, and Snap-to-Critical button in TIR
 * - Multi-layer Gaussian Bloom Laser Beam Engine with White Core & Atmospheric Halo
 * - Tyndall Effect Floating Dust Motes scattering light along laser paths
 * - Museum-Grade Safe-Margin Callouts: zero label collision with optical objects
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  OpticalPhenomenon,
  RefractionSubMode,
  MediumKey,
  OPTICAL_MEDIA,
  SafeLabelCallout,
  LIGHT_SIM_QUIZ,
} from './lightTypes';
import {
  degToRad,
  radToDeg,
  calculateGlassSlabDisplacement,
  getCauchyDispersion,
  calculateMalusIntensity,
  PHOTOELECTRIC_METALS,
  calculatePhotoelectricEffect,
  calculateComptonScattering,
} from './rayPhysics';
import {
  drawBreadboardGrid,
  drawRealisticLaserBeam,
  drawTyndallDustParticles,
  drawInterfaceFlare,
  drawLaserGun,
  drawGalvanometerDial,
  drawEmWavePacket,
  drawSafeCallouts,
  drawAngleArc,
  drawDimensionLine,
  drawPhotonPacket,
} from './renderer/drawCommon';
import {
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  Layers,
  Sliders,
  Eye,
  Info,
  Compass,
  ArrowRight,
  Sun,
  ShieldAlert,
} from 'lucide-react';

export const PhenomenaOfLightSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  // Global Simulation State
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Active Phenomenon Mode (1 of 9)
  const [activePhenomenon, setActivePhenomenon] = useState<OpticalPhenomenon>('refraction');

  // Refraction Sub-Mode
  const [refractionSubMode, setRefractionSubMode] = useState<RefractionSubMode>('glass_slab');

  // Laser Controls - Start with beamProgress = 0.0 and isAnimatingSlow = true so light begins slowly!
  const [laserOn, setLaserOn] = useState<boolean>(true);
  const [beamProgress, setBeamProgress] = useState<number>(0.0);
  const [isAnimatingSlow, setIsAnimatingSlow] = useState<boolean>(true);
  const [laserSpeed, setLaserSpeed] = useState<number>(1.0); // 0.2x to 2x
  const [laserWavelength, setLaserWavelength] = useState<number>(650); // nm (Red default)
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showAngles, setShowAngles] = useState<boolean>(true);
  const [showFresnelReflection, setShowFresnelReflection] = useState<boolean>(true);

  // 1. Reflection Parameters
  const [reflectionAngleDeg, setReflectionAngleDeg] = useState<number>(45);
  const [mirrorType, setMirrorType] = useState<'plane' | 'concave' | 'convex'>('plane');

  // 2. Refraction & Glass Slab Parameters
  const [slabAngleDeg, setSlabAngleDeg] = useState<number>(45); // angle of incidence i
  const [slabThicknessMm, setSlabThicknessMm] = useState<number>(80); // thickness t
  const [slabMediumKey, setSlabMediumKey] = useState<MediumKey>('crown_glass');

  // 3. Dispersion Parameters
  const [prismApexAngleDeg, setPrismApexAngleDeg] = useState<number>(60);
  const [showRecombinationPrism, setShowRecombinationPrism] = useState<boolean>(false);

  // 4. Diffraction Parameters
  const [slitWidthMicrons, setSlitWidthMicrons] = useState<number>(80); // 20 to 200 um
  const [screenDistanceCm, setScreenDistanceCm] = useState<number>(100); // 50 to 150 cm

  // 5. Interference Parameters
  const [doubleSlitSeparationMm, setDoubleSlitSeparationMm] = useState<number>(0.25); // 0.1 to 0.5 mm

  // 6. Polarization Parameters
  const [analyzerAngleDeg, setAnalyzerAngleDeg] = useState<number>(45); // 0 to 180 deg

  // 7. Total Internal Reflection Parameters
  const [tirIncidentAngleDeg, setTirIncidentAngleDeg] = useState<number>(45); // 0 to 80 deg
  const [tirMediumKey, setTirMediumKey] = useState<MediumKey>('crown_glass');
  const [tirDemonstrationMode, setTirDemonstrationMode] = useState<'prism' | 'optical_fiber'>('prism');

  // 8. Photoelectric Parameters
  const [peMetalKey, setPeMetalKey] = useState<string>('cesium');
  const [peWavelengthNm, setPeWavelengthNm] = useState<number>(380); // 200 to 750 nm
  const [peIntensityPct, setPeIntensityPct] = useState<number>(75); // 10 to 100%
  const [peRetardingVoltage, setPeRetardingVoltage] = useState<number>(0.0); // 0 to 3.0 V

  // 9. Compton Parameters
  const [comptonScatteringAngleDeg, setComptonScatteringAngleDeg] = useState<number>(60); // 0 to 180 deg
  const [comptonIncidentWlPm, setComptonIncidentWlPm] = useState<number>(20.0); // 5 to 50 pm

  // Challenge / Quiz State
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // Canvas & Animation Loop Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  // Tyndall Atmospheric Scattering Dust Particles (45 particles)
  const dustParticlesRef = useRef<
    { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[]
  >(
    Array.from({ length: 45 }, () => ({
      x: Math.random() * 820,
      y: Math.random() * 520,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 1.5 + 0.6,
      alpha: Math.random() * 0.6 + 0.25,
    }))
  );

  // Laser beam color helper
  const getBeamHexColor = useCallback((wl: number): string => {
    if (wl < 420) return '#8b5cf6'; // Violet
    if (wl < 490) return '#3b82f6'; // Blue
    if (wl < 570) return '#10b981'; // Green
    if (wl < 600) return '#f59e0b'; // Amber / Yellow
    return '#ef4444'; // Red
  }, []);

  // Trigger Slow Laser Emission Animation (Used on switch & manual replay)
  const triggerSlowLaserFlow = useCallback(() => {
    setLaserOn(true);
    setBeamProgress(0.0);
    setIsAnimatingSlow(true);
    ScienceAudio.playZap();
  }, []);

  // Reset parameters to curriculum defaults
  const handleReset = useCallback(() => {
    setLaserOn(true);
    setBeamProgress(0.0);
    setIsAnimatingSlow(true);
    setSlabAngleDeg(45);
    setSlabThicknessMm(80);
    setSlabMediumKey('crown_glass');
    setReflectionAngleDeg(45);
    setAnalyzerAngleDeg(45);
    setTirIncidentAngleDeg(45);
    setPeWavelengthNm(380);
    setComptonScatteringAngleDeg(60);
    ScienceAudio.playClick();
  }, []);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;
      timeRef.current += 0.016;
      const t = timeRef.current;

      // Slow Laser Beam Propagation Engine (Smooth, realistic, steady travel speed)
      if (isAnimatingSlow) {
        setBeamProgress((prev) => {
          const next = prev + 0.009 * laserSpeed;
          if (next >= 1.0) {
            setIsAnimatingSlow(false);
            return 1.0;
          }
          return next;
        });
      }

      // Update atmospheric dust motes
      const width = canvas.width;
      const height = canvas.height;
      const dust = dustParticlesRef.current;
      for (const p of dust) {
        p.x += p.vx;
        p.y += p.vy + Math.sin(t + p.x * 0.05) * 0.15;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }

      // 1. Draw Clean Breadboard Grid Bench (Pure white background, NO protractor dial!)
      drawBreadboardGrid(ctx, width, height);

      // Safe Margin Callouts Array collected for this frame
      const callouts: SafeLabelCallout[] = [];
      const raySegmentsForDust: { x1: number; y1: number; x2: number; y2: number }[] = [];

      // Active laser beam color
      const beamColor = getBeamHexColor(laserWavelength);

      // 2. Render Active Phenomenon Visuals
      switch (activePhenomenon) {
        // ====================================================================
        // 1. REFLECTION (परावर्तन)
        // ====================================================================
        case 'reflection': {
          const mirrorY = height * 0.64;
          const normalX = width * 0.5;
          const iRad = degToRad(reflectionAngleDeg);

          // Mirror block (Clean laboratory optical flat, no circular protractor!)
          ctx.save();
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(normalX - 180, mirrorY, 360, 14);

          // Specular reflective mirror top line
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(normalX - 180, mirrorY);
          ctx.lineTo(normalX + 180, mirrorY);
          ctx.stroke();

          // Hatch marks on bottom of mirror
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1.5;
          for (let hx = normalX - 170; hx <= normalX + 170; hx += 16) {
            ctx.beginPath();
            ctx.moveTo(hx, mirrorY + 14);
            ctx.lineTo(hx - 10, mirrorY + 24);
            ctx.stroke();
          }
          ctx.restore();

          // Normal line
          ctx.save();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(normalX, mirrorY - 180);
          ctx.lineTo(normalX, mirrorY + 40);
          ctx.stroke();
          ctx.restore();

          // Laser Emitter Position
          const rayLength = 220;
          const laserX = normalX - rayLength * Math.sin(iRad);
          const laserY = mirrorY - rayLength * Math.cos(iRad);
          const laserAngle = Math.atan2(mirrorY - laserY, normalX - laserX);

          drawLaserGun(ctx, laserX, laserY, laserAngle, laserOn, beamColor, 'LASER', 'लेजर स्रोत');

          if (laserOn) {
            // Segment 1: Incident Ray (Slow propagation 0 to 0.5)
            const p1 = Math.min(1.0, beamProgress / 0.5);
            const curIncX = laserX + (normalX - laserX) * p1;
            const curIncY = laserY + (mirrorY - laserY) * p1;

            drawRealisticLaserBeam(ctx, laserX, laserY, normalX, mirrorY, beamColor, p1, 1.0);
            raySegmentsForDust.push({ x1: laserX, y1: laserY, x2: curIncX, y2: curIncY });

            // Flare at interface point of reflection
            if (p1 >= 0.98) {
              drawInterfaceFlare(ctx, normalX, mirrorY, beamColor, t);
            }

            // Segment 2: Reflected Ray (Slow propagation 0.5 to 1.0)
            if (beamProgress > 0.5) {
              const p2 = (beamProgress - 0.5) / 0.5;
              const reflDestX = normalX + rayLength * Math.sin(iRad);
              const reflDestY = mirrorY - rayLength * Math.cos(iRad);
              const curReflX = normalX + (reflDestX - normalX) * p2;
              const curReflY = mirrorY + (reflDestY - mirrorY) * p2;

              drawRealisticLaserBeam(ctx, normalX, mirrorY, reflDestX, reflDestY, beamColor, p2, 0.95);
              raySegmentsForDust.push({ x1: normalX, y1: mirrorY, x2: curReflX, y2: curReflY });

              // Photon packet marking wavefront
              if (isAnimatingSlow) {
                drawPhotonPacket(
                  ctx,
                  curReflX,
                  curReflY,
                  Math.atan2(reflDestY - mirrorY, reflDestX - normalX),
                  beamColor
                );
              }
            } else if (isAnimatingSlow) {
              drawPhotonPacket(ctx, curIncX, curIncY, laserAngle, beamColor);
            }
          }

          // Angle arcs (Only clean localized arcs, NO background protractor dial!)
          if (showAngles) {
            drawAngleArc(
              ctx,
              normalX,
              mirrorY,
              50,
              -Math.PI / 2 - iRad,
              -Math.PI / 2,
              `i = ${reflectionAngleDeg}°`,
              '#0284c7'
            );
            drawAngleArc(
              ctx,
              normalX,
              mirrorY,
              50,
              -Math.PI / 2,
              -Math.PI / 2 + iRad,
              `r = ${reflectionAngleDeg}°`,
              '#16a34a'
            );
          }

          // Museum-Grade Safe Margin Callouts
          if (showLabels) {
            callouts.push({
              id: 'inc_ray',
              targetX: (laserX + normalX) / 2,
              targetY: (laserY + mirrorY) / 2,
              anchorX: 130,
              anchorY: (laserY + mirrorY) / 2 - 20,
              badgeX: 130,
              badgeY: 55,
              textEn: 'Incident Ray',
              textNe: 'आपतित किरण',
              color: beamColor,
              align: 'left',
            });
            callouts.push({
              id: 'normal_line',
              targetX: normalX,
              targetY: mirrorY - 120,
              anchorX: normalX - 40,
              anchorY: 35,
              badgeX: normalX - 40,
              badgeY: 35,
              textEn: 'Normal (N)',
              textNe: 'लम्ब (N)',
              color: '#64748b',
              align: 'center',
            });
            callouts.push({
              id: 'refl_ray',
              targetX: normalX + 70,
              targetY: mirrorY - 70,
              anchorX: width - 140,
              anchorY: mirrorY - 70,
              badgeX: width - 140,
              badgeY: 55,
              textEn: 'Reflected Ray',
              textNe: 'परावर्तित किरण',
              color: '#16a34a',
              align: 'right',
            });
          }
          break;
        }

        // ====================================================================
        // 2. REFRACTION (अपवर्तन) - DEEP DIVE WITH GLASS SLAB
        // ====================================================================
        case 'refraction': {
          if (refractionSubMode === 'meaning') {
            const boundaryX = width * 0.48;

            ctx.fillStyle = 'rgba(240, 249, 255, 0.4)';
            ctx.fillRect(0, 0, boundaryX, height);
            ctx.fillStyle = OPTICAL_MEDIA[slabMediumKey].tintColor;
            ctx.fillRect(boundaryX, 0, width - boundaryX, height);

            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(boundaryX, 0);
            ctx.lineTo(boundaryX, height);
            ctx.stroke();

            const med = OPTICAL_MEDIA[slabMediumKey];
            const v1 = 120;
            const v2 = v1 / med.refractiveIndex;

            ctx.save();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#3b82f6';
            for (let i = 0; i < 10; i++) {
              const xPos = (t * v1 + i * 44) % boundaryX;
              ctx.beginPath();
              ctx.moveTo(xPos, 80);
              ctx.lineTo(xPos, height - 80);
              ctx.stroke();
            }

            ctx.strokeStyle = '#059669';
            const lambda2 = 44 / med.refractiveIndex;
            for (let j = 0; j < 12; j++) {
              const xPos = boundaryX + ((t * v2 + j * lambda2) % (width - boundaryX - 80));
              ctx.beginPath();
              ctx.moveTo(xPos, 80);
              ctx.lineTo(xPos, height - 80);
              ctx.stroke();
            }
            ctx.restore();

            if (showLabels) {
              callouts.push({
                id: 'rarer_media',
                targetX: boundaryX * 0.4,
                targetY: 100,
                anchorX: 120,
                anchorY: 45,
                badgeX: 120,
                badgeY: 45,
                textEn: 'Rarer Medium (Air)',
                textNe: 'विरल माध्यम (हावा)',
                value: 'v = c = 3.0×10⁸ m/s',
                color: '#3b82f6',
                align: 'left',
              });
              callouts.push({
                id: 'denser_media',
                targetX: boundaryX + (width - boundaryX) * 0.5,
                targetY: 100,
                anchorX: width - 150,
                anchorY: 45,
                badgeX: width - 150,
                badgeY: 45,
                textEn: `Denser Medium (${med.nameEn})`,
                textNe: `सघन माध्यम (${med.nameNe})`,
                value: `v = c/n = ${(3.0 / med.refractiveIndex).toFixed(2)}×10⁸ m/s`,
                color: '#059669',
                align: 'right',
              });
            }
          } else if (refractionSubMode === 'causes') {
            const mediaKeys: MediumKey[] = ['vacuum', 'air', 'water', 'crown_glass', 'diamond'];
            const startY = 80;
            const barHeight = 44;
            const maxBarW = width - 280;

            mediaKeys.forEach((k, idx) => {
              const m = OPTICAL_MEDIA[k];
              const yPos = startY + idx * (barHeight + 24);
              const barW = (m.speedOfLight / 3.0) * maxBarW;

              ctx.fillStyle = '#f8fafc';
              ctx.strokeStyle = '#e2e8f0';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.roundRect(40, yPos, width - 80, barHeight, 8);
              ctx.fill();
              ctx.stroke();

              const barGrad = ctx.createLinearGradient(160, yPos, 160 + barW, yPos);
              barGrad.addColorStop(0, '#38bdf8');
              barGrad.addColorStop(1, '#0284c7');
              ctx.fillStyle = barGrad;
              ctx.beginPath();
              ctx.roundRect(160, yPos + 8, barW, barHeight - 16, 4);
              ctx.fill();

              ctx.font = 'bold 12px ui-sans-serif, system-ui, sans-serif';
              ctx.fillStyle = '#0f172a';
              ctx.textAlign = 'left';
              ctx.textBaseline = 'middle';
              ctx.fillText(lang === 'ne' ? m.nameNe : m.nameEn, 52, yPos + barHeight / 2);

              ctx.font = 'bold 11px ui-sans-serif, system-ui, sans-serif';
              ctx.fillStyle = '#0284c7';
              ctx.textAlign = 'right';
              ctx.fillText(
                `v = ${m.speedOfLight}×10⁸ m/s (n = ${m.refractiveIndex})`,
                width - 56,
                yPos + barHeight / 2
              );
            });
          } else {
            // ================================================================
            // SUB-MODE 3: REFRACTION THROUGH A GLASS SLAB (PROTRACTOR REMOVED!)
            // ================================================================
            const slabW = 340;
            const slabH = slabThicknessMm * 1.5;
            const slabX = width * 0.5 - slabW * 0.5;
            const slabY = height * 0.44;

            const curMedium = OPTICAL_MEDIA[slabMediumKey];
            const slabCalc = calculateGlassSlabDisplacement(
              slabAngleDeg,
              slabThicknessMm,
              curMedium.refractiveIndex
            );

            // 1. Draw Clean Glass Slab with Realistic Refractive Appearance & Crystal Bevels
            ctx.save();
            ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
            ctx.shadowBlur = 14;
            ctx.shadowOffsetY = 6;

            const glassGrad = ctx.createLinearGradient(slabX, slabY, slabX, slabY + slabH);
            glassGrad.addColorStop(0, 'rgba(224, 242, 254, 0.75)');
            glassGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.6)');
            glassGrad.addColorStop(1, 'rgba(224, 242, 254, 0.8)');

            ctx.fillStyle = glassGrad;
            ctx.fillRect(slabX, slabY, slabW, slabH);
            ctx.shadowColor = 'transparent';

            // Polished Edge Chamfers
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(slabX, slabY, slabW, slabH);

            // Top specular shine line
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(slabX + 2, slabY + 2);
            ctx.lineTo(slabX + slabW - 2, slabY + 2);
            ctx.stroke();

            // Glass Slab Watermark
            ctx.font = 'bold 12px ui-sans-serif, system-ui, sans-serif';
            ctx.fillStyle = 'rgba(3, 105, 161, 0.4)';
            ctx.textAlign = 'center';
            ctx.fillText(
              `${lang === 'ne' ? curMedium.nameNe : curMedium.nameEn} (n = ${curMedium.refractiveIndex})`,
              slabX + slabW / 2,
              slabY + slabH - 14
            );
            ctx.restore();

            // Incident Point O1 and Emergent Point O2
            const o1X = slabX + slabW * 0.38;
            const o1Y = slabY;

            const internalDeltaX = slabH * Math.tan(slabCalc.rRad);
            const o2X = o1X + internalDeltaX;
            const o2Y = slabY + slabH;

            // Normal Lines at O1 and O2
            ctx.save();
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 3]);

            ctx.beginPath();
            ctx.moveTo(o1X, o1Y - 80);
            ctx.lineTo(o1X, o1Y + 80);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(o2X, o2Y - 80);
            ctx.lineTo(o2X, o2Y + 80);
            ctx.stroke();
            ctx.restore();

            // Laser Gun Position
            const incRayLen = 170;
            const laserX = o1X - incRayLen * Math.sin(slabCalc.iRad);
            const laserY = o1Y - incRayLen * Math.cos(slabCalc.iRad);
            const laserAimAngle = Math.atan2(o1Y - laserY, o1X - laserX);

            drawLaserGun(ctx, laserX, laserY, laserAimAngle, laserOn, beamColor, 'LASER', 'लेजर स्रोत');

            // Ray Tracing with Multi-layer Gaussian Glow & Spark Flares
            if (laserOn) {
              // Phase 1: Incident Ray (Slow propagation 0 to 0.33)
              const p1 = Math.min(1.0, beamProgress / 0.33);
              const curIncX = laserX + (o1X - laserX) * p1;
              const curIncY = laserY + (o1Y - laserY) * p1;

              drawRealisticLaserBeam(ctx, laserX, laserY, o1X, o1Y, beamColor, p1, 1.0);
              raySegmentsForDust.push({ x1: laserX, y1: laserY, x2: curIncX, y2: curIncY });

              // Dynamic spark flare at O1 interface
              if (p1 >= 0.98) {
                drawInterfaceFlare(ctx, o1X, o1Y, beamColor, t);

                // Physical Fresnel Reflection at O1 (~4% reflection into air)
                if (showFresnelReflection) {
                  const reflLen = 140;
                  const fresnelX = o1X - reflLen * Math.sin(slabCalc.iRad);
                  const fresnelY = o1Y - reflLen * Math.cos(slabCalc.iRad);
                  drawRealisticLaserBeam(ctx, o1X, o1Y, fresnelX, fresnelY, beamColor, 1.0, 0.28);
                }
              }

              // Phase 2: Refracted Ray through Glass (Slow propagation 0.33 to 0.66)
              if (beamProgress > 0.33) {
                const p2 = Math.min(1.0, (beamProgress - 0.33) / 0.33);
                const curRefX = o1X + (o2X - o1X) * p2;
                const curRefY = o1Y + (o2Y - o1Y) * p2;

                // Internal volumetric crystal glow
                ctx.save();
                ctx.strokeStyle = beamColor;
                ctx.lineWidth = 10;
                ctx.globalAlpha = 0.18;
                ctx.beginPath();
                ctx.moveTo(o1X, o1Y);
                ctx.lineTo(curRefX, curRefY);
                ctx.stroke();
                ctx.restore();

                drawRealisticLaserBeam(ctx, o1X, o1Y, o2X, o2Y, beamColor, p2, 0.95);
                raySegmentsForDust.push({ x1: o1X, y1: o1Y, x2: curRefX, y2: curRefY });

                // Dynamic spark flare at O2 interface
                if (p2 >= 0.98) {
                  drawInterfaceFlare(ctx, o2X, o2Y, beamColor, t);

                  if (showFresnelReflection) {
                    const intReflX = o2X + internalDeltaX;
                    const intReflY = o1Y;
                    drawRealisticLaserBeam(ctx, o2X, o2Y, intReflX, intReflY, beamColor, 1.0, 0.24);
                  }
                }

                // Phase 3: Emergent Ray parallel to Incident Ray (Slow propagation 0.66 to 1.0)
                if (beamProgress > 0.66) {
                  const p3 = (beamProgress - 0.66) / 0.34;
                  const emLen = 180;
                  const emDestX = o2X + emLen * Math.sin(slabCalc.iRad);
                  const emDestY = o2Y + emLen * Math.cos(slabCalc.iRad);
                  const curEmX = o2X + (emDestX - o2X) * p3;
                  const curEmY = o2Y + (emDestY - o2Y) * p3;

                  drawRealisticLaserBeam(ctx, o2X, o2Y, emDestX, emDestY, beamColor, p3, 0.95);
                  raySegmentsForDust.push({ x1: o2X, y1: o2Y, x2: curEmX, y2: curEmY });

                  if (isAnimatingSlow) {
                    drawPhotonPacket(
                      ctx,
                      curEmX,
                      curEmY,
                      Math.atan2(emDestY - o2Y, emDestX - o2X),
                      beamColor
                    );
                  }
                } else if (isAnimatingSlow) {
                  drawPhotonPacket(ctx, curRefX, curRefY, Math.atan2(o2Y - o1Y, o2X - o1X), beamColor);
                }
              } else if (isAnimatingSlow) {
                drawPhotonPacket(ctx, curIncX, curIncY, laserAimAngle, beamColor);
              }
            }

            // Undeviated Virtual Ray Path (Dotted Gray Line)
            const undevLen = slabH + 150;
            const undevX = o1X + undevLen * Math.sin(slabCalc.iRad);
            const undevY = o1Y + undevLen * Math.cos(slabCalc.iRad);

            ctx.save();
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.moveTo(o1X, o1Y);
            ctx.lineTo(undevX, undevY);
            ctx.stroke();
            ctx.restore();

            // Lateral Shift (d) Dimension Caliper
            const perpDist = slabCalc.lateralShiftMm * 1.5;
            const caliperX = o2X - perpDist * Math.cos(slabCalc.iRad);
            const caliperY = o2Y + perpDist * Math.sin(slabCalc.iRad);

            drawDimensionLine(
              ctx,
              o2X,
              o2Y,
              caliperX,
              caliperY,
              `d = ${slabCalc.lateralShiftMm.toFixed(1)} mm`,
              '#d97706'
            );

            // Angles Arcs (Localized arcs only, protractor removed!)
            if (showAngles) {
              drawAngleArc(
                ctx,
                o1X,
                o1Y,
                42,
                -Math.PI / 2 - slabCalc.iRad,
                -Math.PI / 2,
                `i = ${slabAngleDeg}°`,
                '#0284c7'
              );
              drawAngleArc(
                ctx,
                o1X,
                o1Y,
                38,
                Math.PI / 2 - slabCalc.rRad,
                Math.PI / 2,
                `r = ${slabCalc.rDeg.toFixed(1)}°`,
                '#16a34a'
              );
              drawAngleArc(
                ctx,
                o2X,
                o2Y,
                42,
                Math.PI / 2,
                Math.PI / 2 + slabCalc.iRad,
                `e = ${slabAngleDeg}°`,
                '#d97706'
              );
            }

            // Safe Margin Callouts
            if (showLabels) {
              callouts.push({
                id: 'incident_ray',
                targetX: (laserX + o1X) / 2,
                targetY: (laserY + o1Y) / 2,
                anchorX: 130,
                anchorY: (laserY + o1Y) / 2 - 20,
                badgeX: 130,
                badgeY: 55,
                textEn: 'Incident Ray (आपतित किरण)',
                textNe: 'आपतित किरण',
                value: `i = ${slabAngleDeg}°`,
                color: beamColor,
                align: 'left',
              });

              callouts.push({
                id: 'normal_n1',
                targetX: o1X,
                targetY: o1Y - 60,
                anchorX: o1X + 40,
                anchorY: 35,
                badgeX: o1X + 40,
                badgeY: 35,
                textEn: 'Normal N₁ (लम्ब)',
                textNe: 'लम्ब N₁',
                color: '#64748b',
                align: 'center',
              });

              callouts.push({
                id: 'refracted_ray',
                targetX: (o1X + o2X) / 2,
                targetY: (o1Y + o2Y) / 2,
                anchorX: slabX + slabW + 20,
                anchorY: (o1Y + o2Y) / 2,
                badgeX: width - 140,
                badgeY: (o1Y + o2Y) / 2,
                textEn: 'Refracted Ray (अपवर्तित किरण)',
                textNe: 'अपवर्तित किरण',
                value: `r = ${slabCalc.rDeg.toFixed(1)}°`,
                color: '#16a34a',
                align: 'right',
              });

              callouts.push({
                id: 'emergent_ray',
                targetX: o2X + 60,
                targetY: o2Y + 60,
                anchorX: width - 140,
                anchorY: o2Y + 60,
                badgeX: width - 140,
                badgeY: height - 60,
                textEn: 'Emergent Ray (निर्गत किरण)',
                textNe: 'निर्गत किरण (समानान्तर)',
                value: `e = i = ${slabAngleDeg}°`,
                color: '#d97706',
                align: 'right',
              });

              callouts.push({
                id: 'lateral_shift',
                targetX: (o2X + caliperX) / 2,
                targetY: (o2Y + caliperY) / 2,
                anchorX: 130,
                anchorY: height - 55,
                badgeX: 130,
                badgeY: height - 55,
                textEn: 'Lateral Shift (पार्श्व विस्थापन d)',
                textNe: 'पार्श्व विस्थापन (d)',
                value: `${slabCalc.lateralShiftMm.toFixed(1)} mm`,
                color: '#d97706',
                align: 'left',
              });
            }
          }
          break;
        }

        // ====================================================================
        // 3. DISPERSION (वर्ण विच्छेदन) - WITH EXPLICIT WAVELENGTH LABELS
        // ====================================================================
        case 'dispersion': {
          const prismApexX = width * 0.42;
          const prismApexY = height * 0.28;
          const prismSide = 180;
          const prismH = (Math.sqrt(3) / 2) * prismSide;

          const pTop = { x: prismApexX, y: prismApexY };
          const pLeft = { x: prismApexX - prismSide / 2, y: prismApexY + prismH };
          const pRight = { x: prismApexX + prismSide / 2, y: prismApexY + prismH };

          // Triangular Glass Prism (Clean, no background protractor!)
          ctx.save();
          const pGrad = ctx.createLinearGradient(pTop.x, pTop.y, pRight.x, pRight.y);
          pGrad.addColorStop(0, 'rgba(240, 249, 255, 0.85)');
          pGrad.addColorStop(0.5, 'rgba(224, 242, 254, 0.7)');
          pGrad.addColorStop(1, 'rgba(186, 230, 253, 0.85)');

          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.moveTo(pTop.x, pTop.y);
          ctx.lineTo(pLeft.x, pLeft.y);
          ctx.lineTo(pRight.x, pRight.y);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Left bevel shine
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pTop.x, pTop.y);
          ctx.lineTo(pLeft.x, pLeft.y);
          ctx.stroke();
          ctx.restore();

          // Laser Emitter (White Light)
          const incY = prismApexY + prismH * 0.55;
          const incX = prismApexX - prismSide * 0.25;
          const laserX = 85;
          const laserY = incY + 30;

          drawLaserGun(
            ctx,
            laserX,
            laserY,
            Math.atan2(incY - laserY, incX - laserX),
            laserOn,
            '#e2e8f0',
            'WHITE LIGHT',
            'श्वेत प्रकाश'
          );

          if (laserOn) {
            // Stage 1: White beam travels slowly to prism (0 to 0.35)
            const p1 = Math.min(1.0, beamProgress / 0.35);
            const curIncX = laserX + (incX - laserX) * p1;
            const curIncY = laserY + (incY - laserY) * p1;

            drawRealisticLaserBeam(ctx, laserX, laserY, incX, incY, '#cbd5e1', p1, 1.2);
            raySegmentsForDust.push({ x1: laserX, y1: laserY, x2: curIncX, y2: curIncY });

            if (p1 >= 0.98) {
              drawInterfaceFlare(ctx, incX, incY, '#ffffff', t);
            }

            // Screen on the right capturing spectrum
            const screenX = width - 150;
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 2;
            ctx.fillRect(screenX, 80, 24, height - 160);
            ctx.strokeRect(screenX, 80, 24, height - 160);

            // Continuous Spectrum Caustic Gradient on Screen
            const screenGrad = ctx.createLinearGradient(0, height * 0.35 - 10, 0, height * 0.35 + 210);
            screenGrad.addColorStop(0, '#ef4444');
            screenGrad.addColorStop(0.16, '#f97316');
            screenGrad.addColorStop(0.33, '#eab308');
            screenGrad.addColorStop(0.5, '#22c55e');
            screenGrad.addColorStop(0.66, '#0ea5e9');
            screenGrad.addColorStop(0.83, '#6366f1');
            screenGrad.addColorStop(1.0, '#a855f7');

            ctx.fillStyle = screenGrad;
            ctx.fillRect(screenX + 3, height * 0.35 - 10, 18, 220);

            // VIBGYOR Spectral Rays with Physical Wavelengths
            const vibgyor = getCauchyDispersion(prismApexAngleDeg);

            // Stage 2: Rays disperse inside prism (0.35 to 0.65)
            const p2 = beamProgress > 0.35 ? Math.min(1.0, (beamProgress - 0.35) / 0.3) : 0;
            // Stage 3: Rays fan out from prism to screen (0.65 to 1.0)
            const p3 = beamProgress > 0.65 ? (beamProgress - 0.65) / 0.35 : 0;

            vibgyor.forEach((spec, sIdx) => {
              const spread = (sIdx - 3) * 6;
              const exitX = prismApexX + prismSide * 0.22;
              const exitY = incY + spread * 0.7;
              const screenTargetY = height * 0.35 + sIdx * 32;

              if (p2 > 0) {
                // Internal ray
                const curExX = incX + (exitX - incX) * p2;
                const curExY = incY + (exitY - incY) * p2;
                ctx.save();
                ctx.strokeStyle = spec.hex;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(incX, incY);
                ctx.lineTo(curExX, curExY);
                ctx.stroke();
                ctx.restore();
              }

              if (p3 > 0) {
                // Emergent dispersed ray with Gaussian bloom
                const curScreenX = exitX + (screenX - exitX) * p3;
                const curScreenY = exitY + (screenTargetY - exitY) * p3;
                drawRealisticLaserBeam(ctx, exitX, exitY, screenX, screenTargetY, spec.hex, p3, 0.75);
                raySegmentsForDust.push({ x1: exitX, y1: exitY, x2: curScreenX, y2: curScreenY });

                if (isAnimatingSlow) {
                  drawPhotonPacket(
                    ctx,
                    curScreenX,
                    curScreenY,
                    Math.atan2(screenTargetY - exitY, screenX - exitX),
                    spec.hex,
                    spec.wavelengthNm / 50
                  );
                }
              }

              // Explicit Wavelength Badge next to each spectral band!
              const badgeX = screenX + 32;
              const badgeY = screenTargetY;

              ctx.save();
              ctx.fillStyle = '#ffffff';
              ctx.strokeStyle = spec.hex;
              ctx.lineWidth = 1.25;
              ctx.beginPath();
              ctx.roundRect(badgeX, badgeY - 10, 105, 20, 4);
              ctx.fill();
              ctx.stroke();

              // Color indicator dot
              ctx.fillStyle = spec.hex;
              ctx.beginPath();
              ctx.arc(badgeX + 8, badgeY, 4, 0, Math.PI * 2);
              ctx.fill();

              // Name & Wavelength in nm
              ctx.font = 'bold 10px ui-sans-serif, system-ui, sans-serif';
              ctx.fillStyle = '#0f172a';
              ctx.textAlign = 'left';
              ctx.textBaseline = 'middle';
              ctx.fillText(`${lang === 'ne' ? spec.nameNe : spec.name}: ${spec.wavelengthNm} nm`, badgeX + 16, badgeY);
              ctx.restore();
            });
          }

          if (showLabels) {
            callouts.push({
              id: 'prism_label',
              targetX: prismApexX,
              targetY: prismApexY + 40,
              anchorX: prismApexX,
              anchorY: 45,
              badgeX: prismApexX,
              badgeY: 45,
              textEn: 'Glass Prism (A = 60°)',
              textNe: 'काँचको प्रिज्म (A = ६०°)',
              color: '#0284c7',
              align: 'center',
            });
            callouts.push({
              id: 'vibgyor_spectrum',
              targetX: width - 150,
              targetY: height * 0.45,
              anchorX: width - 160,
              anchorY: 45,
              badgeX: width - 160,
              badgeY: 45,
              textEn: 'VIBGYOR (400 - 700 nm)',
              textNe: 'वर्णक्रम (४०० - ७०० nm)',
              color: '#a855f7',
              align: 'right',
            });
          }
          break;
        }

        // ====================================================================
        // 4. DIFFRACTION (विवर्तन)
        // ====================================================================
        case 'diffraction': {
          const slitX = width * 0.38;
          const screenX = width - 100;
          const centerY = height * 0.5;
          const halfA = (slitWidthMicrons / 80) * 16;

          // Slit barriers with metallic precision blades (No protractor!)
          ctx.save();
          ctx.fillStyle = '#334155';
          ctx.fillRect(slitX - 6, 40, 12, centerY - halfA - 40);
          ctx.fillRect(slitX - 6, centerY + halfA, 12, height - centerY - halfA - 40);

          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(slitX - 8, centerY - halfA, 16, halfA * 2);
          ctx.restore();

          // Laser Emitter
          const laserX = 80;
          drawLaserGun(ctx, laserX, centerY, 0, laserOn, beamColor, 'LASER', 'लेजर स्रोत');

          if (laserOn) {
            const p1 = Math.min(1.0, beamProgress / 0.5);
            drawRealisticLaserBeam(ctx, laserX, centerY, slitX, centerY, beamColor, p1, 1.4);
            raySegmentsForDust.push({ x1: laserX, y1: centerY, x2: laserX + (slitX - laserX) * p1, y2: centerY });

            if (beamProgress > 0.5) {
              const p2 = (beamProgress - 0.5) / 0.5;
              for (let angleDeg = -30; angleDeg <= 30; angleDeg += 4) {
                const rad = degToRad(angleDeg);
                const targetY = centerY + (screenX - slitX) * Math.tan(rad);
                const beta = (Math.PI * (slitWidthMicrons / 60) * Math.sin(rad)) || 0.001;
                const intensity = Math.pow(Math.sin(beta) / beta, 2);

                const curY = centerY + (targetY - centerY) * p2;
                const curX = slitX + (screenX - slitX) * p2;

                ctx.strokeStyle = beamColor;
                ctx.globalAlpha = Math.max(0.04, intensity * 0.75);
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(slitX, centerY);
                ctx.lineTo(curX, curY);
                ctx.stroke();
              }
              ctx.globalAlpha = 1.0;

              // Screen & Fringe intensity profile
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(screenX, 50, 16, height - 100);

              ctx.strokeStyle = beamColor;
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              for (let py = 60; py <= height - 60; py += 3) {
                const dy = (py - centerY) * 0.05;
                const beta = dy === 0 ? 0.001 : dy;
                const iVal = Math.pow(Math.sin(beta) / beta, 2);
                const curveX = screenX + 26 + iVal * 64 * p2;
                if (py === 60) ctx.moveTo(curveX, py);
                else ctx.lineTo(curveX, py);
              }
              ctx.stroke();
            }
          }

          if (showLabels) {
            callouts.push({
              id: 'slit_label',
              targetX: slitX,
              targetY: centerY - halfA - 30,
              anchorX: slitX,
              anchorY: 45,
              badgeX: slitX,
              badgeY: 45,
              textEn: `Single Slit (a = ${slitWidthMicrons} μm)`,
              textNe: `एकल छिद्र (a = ${slitWidthMicrons} μm)`,
              color: '#0284c7',
              align: 'center',
            });
            callouts.push({
              id: 'central_max',
              targetX: screenX,
              targetY: centerY,
              anchorX: width - 140,
              anchorY: 45,
              badgeX: width - 140,
              badgeY: 45,
              textEn: 'Central Bright Fringe',
              textNe: 'केन्द्रीय चम्किलो फ्रिन्ज',
              color: beamColor,
              align: 'right',
            });
          }
          break;
        }

        // ====================================================================
        // 5. INTERFERENCE (व्यतिकरण) - YOUNG'S DOUBLE SLIT
        // ====================================================================
        case 'interference': {
          const slitX = width * 0.36;
          const screenX = width - 100;
          const centerY = height * 0.5;
          const slitSepPx = (doubleSlitSeparationMm / 0.25) * 36;
          const s1Y = centerY - slitSepPx / 2;
          const s2Y = centerY + slitSepPx / 2;

          ctx.save();
          ctx.fillStyle = '#334155';
          ctx.fillRect(slitX - 5, 40, 10, s1Y - 4 - 40);
          ctx.fillRect(slitX - 5, s1Y + 4, 10, s2Y - s1Y - 8);
          ctx.fillRect(slitX - 5, s2Y + 4, 10, height - s2Y - 44);
          ctx.restore();

          const laserX = 80;
          drawLaserGun(ctx, laserX, centerY, 0, laserOn, beamColor, 'COHERENT LASER', 'सम्बद्ध लेजर');

          if (laserOn) {
            const p1 = Math.min(1.0, beamProgress / 0.4);
            drawRealisticLaserBeam(ctx, laserX, centerY, slitX, s1Y, beamColor, p1, 0.85);
            drawRealisticLaserBeam(ctx, laserX, centerY, slitX, s2Y, beamColor, p1, 0.85);
            raySegmentsForDust.push({ x1: laserX, y1: centerY, x2: slitX, y2: centerY });

            if (beamProgress > 0.4) {
              const p2 = (beamProgress - 0.4) / 0.6;
              ctx.save();
              ctx.lineWidth = 1.25;
              const maxR = 320 * p2;
              for (let r = 20; r <= maxR; r += 24) {
                const curR = (r + t * 40) % maxR;
                ctx.strokeStyle = beamColor;
                ctx.globalAlpha = Math.max(0.04, 1 - curR / 320);

                ctx.beginPath();
                ctx.arc(slitX, s1Y, curR, -Math.PI / 2.5, Math.PI / 2.5);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(slitX, s2Y, curR, -Math.PI / 2.5, Math.PI / 2.5);
                ctx.stroke();
              }
              ctx.globalAlpha = 1.0;

              // Interference Screen
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(screenX, 50, 18, height - 100);

              const fringeSpacing = (650e-9 * 1.2) / (doubleSlitSeparationMm * 1e-3) * 35000;
              for (let fy = 60; fy <= height - 60; fy += 5) {
                const phase = Math.cos(((fy - centerY) / fringeSpacing) * Math.PI);
                const intensity = phase * phase * p2;
                ctx.fillStyle = beamColor;
                ctx.globalAlpha = intensity;
                ctx.fillRect(screenX + 2, fy - 2.5, 14, 5);
              }
              ctx.globalAlpha = 1.0;
              ctx.restore();
            }
          }

          if (showLabels) {
            callouts.push({
              id: 'ydse_slits',
              targetX: slitX,
              targetY: s1Y - 20,
              anchorX: slitX,
              anchorY: 45,
              badgeX: slitX,
              badgeY: 45,
              textEn: `Double Slit (d = ${doubleSlitSeparationMm} mm)`,
              textNe: `दोहोरो छिद्र (d = ${doubleSlitSeparationMm} mm)`,
              color: '#0284c7',
              align: 'center',
            });
            callouts.push({
              id: 'screen_fringes',
              targetX: screenX,
              targetY: centerY - 40,
              anchorX: width - 140,
              anchorY: 45,
              badgeX: width - 140,
              badgeY: 45,
              textEn: 'Interference Fringes',
              textNe: 'व्यतिकरण फ्रिन्जहरू',
              color: beamColor,
              align: 'right',
            });
          }
          break;
        }

        // ====================================================================
        // 6. POLARIZATION (ध्रुवीकरण)
        // ====================================================================
        case 'polarization': {
          const centerY = height * 0.5;
          const laserX = 80;
          const pol1X = width * 0.36;
          const pol2X = width * 0.68;
          const screenX = width - 80;

          // Polarizer 1 (Fixed Vertical Axis)
          ctx.save();
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(pol1X, centerY, 52, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.5;
          for (let lx = pol1X - 36; lx <= pol1X + 36; lx += 8) {
            const chord = Math.sqrt(Math.max(0, 50 * 50 - Math.pow(lx - pol1X, 2)));
            ctx.beginPath();
            ctx.moveTo(lx, centerY - chord);
            ctx.lineTo(lx, centerY + chord);
            ctx.stroke();
          }

          // Polarizer 2 / Analyzer (Rotatable Axis)
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(pol2X, centerY, 52, 0, Math.PI * 2);
          ctx.stroke();

          ctx.save();
          ctx.translate(pol2X, centerY);
          ctx.rotate(degToRad(analyzerAngleDeg));
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 1.5;
          for (let lx = -36; lx <= 36; lx += 8) {
            const chord = Math.sqrt(Math.max(0, 50 * 50 - lx * lx));
            ctx.beginPath();
            ctx.moveTo(lx, -chord);
            ctx.lineTo(lx, chord);
            ctx.stroke();
          }
          ctx.restore();
          ctx.restore();

          drawLaserGun(ctx, laserX, centerY, 0, laserOn, beamColor, 'UNPOLARIZED', 'अध्रुवीकृत');

          if (laserOn) {
            const p1 = Math.min(1.0, beamProgress / 0.33);
            drawRealisticLaserBeam(ctx, laserX, centerY, pol1X, centerY, beamColor, p1, 1.0);
            raySegmentsForDust.push({ x1: laserX, y1: centerY, x2: pol1X, y2: centerY });

            if (beamProgress > 0.33) {
              const p2 = Math.min(1.0, (beamProgress - 0.33) / 0.33);
              drawEmWavePacket(ctx, pol1X, centerY, (pol2X - pol1X) * p2, t, beamColor);

              if (beamProgress > 0.66) {
                const p3 = (beamProgress - 0.66) / 0.34;
                const malus = calculateMalusIntensity(100, analyzerAngleDeg);
                const transmittedAlpha = malus.percentage / 100;

                drawRealisticLaserBeam(
                  ctx,
                  pol2X,
                  centerY,
                  screenX,
                  centerY,
                  beamColor,
                  p3,
                  Math.max(0.1, transmittedAlpha)
                );

                ctx.fillStyle = '#0f172a';
                ctx.fillRect(screenX, centerY - 60, 16, 120);

                ctx.fillStyle = beamColor;
                ctx.globalAlpha = transmittedAlpha * p3;
                ctx.beginPath();
                ctx.arc(screenX + 8, centerY, 18 * transmittedAlpha, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
              }
            }
          }

          if (showLabels) {
            callouts.push({
              id: 'polarizer_1',
              targetX: pol1X,
              targetY: centerY - 55,
              anchorX: pol1X,
              anchorY: 45,
              badgeX: pol1X,
              badgeY: 45,
              textEn: 'Polarizer (Vertical 0°)',
              textNe: 'पोलराइजर (ठाडो ०°)',
              color: '#0284c7',
              align: 'center',
            });
            callouts.push({
              id: 'analyzer_2',
              targetX: pol2X,
              targetY: centerY - 55,
              anchorX: pol2X,
              anchorY: 45,
              badgeX: pol2X,
              badgeY: 45,
              textEn: `Analyzer (θ = ${analyzerAngleDeg}°)`,
              textNe: `एनालाइजर (θ = ${analyzerAngleDeg}°)`,
              value: `I = ${calculateMalusIntensity(100, analyzerAngleDeg).percentage}%`,
              color: '#d97706',
              align: 'center',
            });
          }
          break;
        }

        // ====================================================================
        // 7. TOTAL INTERNAL REFLECTION (पूर्ण आन्तरिक परावर्तन) - WITH CRITICAL ANGLE
        // ====================================================================
        case 'tir': {
          const centerX = width * 0.5;
          const centerY = height * 0.58;
          const radius = 170;
          const curMed = OPTICAL_MEDIA[tirMediumKey];
          const critAngleRad = Math.asin(1 / curMed.refractiveIndex);
          const critAngleDeg = radToDeg(critAngleRad);
          const iRad = degToRad(tirIncidentAngleDeg);
          const isTir = tirIncidentAngleDeg >= critAngleDeg;
          const isCriticalState = Math.abs(tirIncidentAngleDeg - critAngleDeg) < 1.0;

          // Semicircular glass block (Clean optical block, NO background protractor dial!)
          ctx.save();
          ctx.fillStyle = curMed.tintColor;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI, false);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Normal line
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - 130);
          ctx.lineTo(centerX, centerY + 130);
          ctx.stroke();
          ctx.restore();

          // CRITICAL ANGLE REFERENCE PATH (Dashed Gold Line showing θc)
          const critRayLen = 190;
          const critRayX = centerX - critRayLen * Math.sin(critAngleRad);
          const critRayY = centerY + critRayLen * Math.cos(critAngleRad);

          ctx.save();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(critRayX, critRayY);
          ctx.lineTo(centerX, centerY);
          // And grazing reference line at 90 degrees along boundary
          ctx.lineTo(centerX + critRayLen, centerY);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();

          // Laser Emitter in Denser Medium
          const laserDist = 200;
          const laserX = centerX - laserDist * Math.sin(iRad);
          const laserY = centerY + laserDist * Math.cos(iRad);
          const aimAngle = Math.atan2(centerY - laserY, centerX - laserX);

          drawLaserGun(ctx, laserX, laserY, aimAngle, laserOn, beamColor, 'LASER', 'लेजर स्रोत');

          if (laserOn) {
            // Stage 1: Incident Ray in denser medium (0 to 0.5)
            const p1 = Math.min(1.0, beamProgress / 0.5);
            drawRealisticLaserBeam(ctx, laserX, laserY, centerX, centerY, beamColor, p1, 1.0);
            drawInterfaceFlare(ctx, centerX, centerY, beamColor, t);
            raySegmentsForDust.push({ x1: laserX, y1: laserY, x2: centerX, y2: centerY });

            // Stage 2: Reflected / Refracted / Grazing Ray (0.5 to 1.0)
            if (beamProgress > 0.5) {
              const p2 = (beamProgress - 0.5) / 0.5;

              if (isTir) {
                // 100% Total Internal Reflection back into glass!
                const reflDestX = centerX + laserDist * Math.sin(iRad);
                const reflDestY = centerY + laserDist * Math.cos(iRad);
                drawRealisticLaserBeam(ctx, centerX, centerY, reflDestX, reflDestY, beamColor, p2, 1.0);
                raySegmentsForDust.push({ x1: centerX, y1: centerY, x2: reflDestX, y2: reflDestY });
              } else if (isCriticalState) {
                // Grazing Ray along interface (r = 90°)
                const grazeDestX = centerX + laserDist;
                const grazeDestY = centerY;
                drawRealisticLaserBeam(ctx, centerX, centerY, grazeDestX, grazeDestY, '#f59e0b', p2, 1.0);
                raySegmentsForDust.push({ x1: centerX, y1: centerY, x2: grazeDestX, y2: grazeDestY });
              } else {
                // Normal Refraction into Air bending away from normal
                const sinR = curMed.refractiveIndex * Math.sin(iRad);
                const rRad = Math.asin(Math.min(1.0, sinR));
                const refDestX = centerX + laserDist * Math.sin(rRad);
                const refDestY = centerY - laserDist * Math.cos(rRad);

                drawRealisticLaserBeam(ctx, centerX, centerY, refDestX, refDestY, beamColor, p2, 0.75);
                raySegmentsForDust.push({ x1: centerX, y1: centerY, x2: refDestX, y2: refDestY });

                // Weak partial reflection back in glass
                const weakReflX = centerX + laserDist * Math.sin(iRad);
                const weakReflY = centerY + laserDist * Math.cos(iRad);
                drawRealisticLaserBeam(ctx, centerX, centerY, weakReflX, weakReflY, beamColor, p2, 0.25);
              }
            }
          }

          // Angle Arcs: Incident Angle (i) & Critical Angle (θc)
          if (showAngles) {
            // Critical Angle Arc (Gold)
            drawAngleArc(
              ctx,
              centerX,
              centerY,
              75,
              Math.PI / 2 - critAngleRad,
              Math.PI / 2,
              `θc = ${critAngleDeg.toFixed(1)}°`,
              '#f59e0b'
            );
            // Incident Angle Arc (Blue or Green)
            drawAngleArc(
              ctx,
              centerX,
              centerY,
              48,
              Math.PI / 2 - iRad,
              Math.PI / 2,
              `i = ${tirIncidentAngleDeg}°`,
              isTir ? '#16a34a' : '#0284c7'
            );
          }

          if (showLabels) {
            callouts.push({
              id: 'crit_angle_callout',
              targetX: centerX - 75 * Math.sin(critAngleRad),
              targetY: centerY + 75 * Math.cos(critAngleRad),
              anchorX: 130,
              anchorY: 45,
              badgeX: 130,
              badgeY: 45,
              textEn: 'Critical Angle (क्रान्तिक कोण θc)',
              textNe: 'क्रान्तिक कोण (θc)',
              value: `${critAngleDeg.toFixed(1)}° (sin θc = 1/n)`,
              color: '#f59e0b',
              align: 'left',
            });

            callouts.push({
              id: 'tir_status',
              targetX: centerX,
              targetY: centerY,
              anchorX: width - 150,
              anchorY: 45,
              badgeX: width - 150,
              badgeY: 45,
              textEn: isTir
                ? 'TOTAL INTERNAL REFLECTION (i > θc)'
                : isCriticalState
                ? 'CRITICAL STATE: Grazing Ray (r = 90°)'
                : 'Normal Refraction (i < θc)',
              textNe: isTir
                ? 'पूर्ण आन्तरिक परावर्तन (i > θc)'
                : isCriticalState
                ? 'क्रान्तिक अवस्था: ९०° मा बाङ्गिने'
                : 'सामान्य अपवर्तन (i < θc)',
              value: `i = ${tirIncidentAngleDeg}°`,
              color: isTir ? '#16a34a' : isCriticalState ? '#f59e0b' : '#0284c7',
              align: 'right',
            });
          }
          break;
        }

        // ====================================================================
        // 8. PHOTOELECTRIC EFFECT (फोटोइलेक्ट्रिक प्रभाव)
        // ====================================================================
        case 'photoelectric': {
          const tubeX = width * 0.44;
          const tubeY = height * 0.5;
          const tubeW = 280;
          const tubeH = 140;

          const metal = PHOTOELECTRIC_METALS[peMetalKey];
          const peCalc = calculatePhotoelectricEffect(peWavelengthNm, metal.workFunctionEv, peRetardingVoltage);

          ctx.save();
          ctx.fillStyle = 'rgba(240, 249, 255, 0.45)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(tubeX - tubeW / 2, tubeY - tubeH / 2, tubeW, tubeH, 40);
          ctx.fill();
          ctx.stroke();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(tubeX - tubeW / 2 + 10, tubeY - tubeH / 2 + 6, tubeW - 20, 8, 4);
          ctx.stroke();

          ctx.fillStyle = metal.symbol === 'Cs' ? '#f59e0b' : '#64748b';
          ctx.fillRect(tubeX - tubeW / 2 + 25, tubeY - 45, 12, 90);

          ctx.fillStyle = '#0284c7';
          ctx.fillRect(tubeX + tubeW / 2 - 37, tubeY - 45, 12, 90);
          ctx.restore();

          const lightSourceX = tubeX - tubeW / 2 - 80;
          const lightSourceY = tubeY - 60;
          drawLaserGun(
            ctx,
            lightSourceX,
            lightSourceY,
            Math.atan2(tubeY - lightSourceY, tubeX - tubeW / 2 + 30 - lightSourceX),
            laserOn,
            getBeamHexColor(peWavelengthNm),
            `${peWavelengthNm}nm`,
            'प्रकाश स्रोत'
          );

          if (laserOn) {
            const p1 = Math.min(1.0, beamProgress / 0.5);
            drawRealisticLaserBeam(
              ctx,
              lightSourceX,
              lightSourceY,
              tubeX - tubeW / 2 + 30,
              tubeY,
              getBeamHexColor(peWavelengthNm),
              p1,
              1.2
            );

            if (p1 >= 0.98) {
              drawInterfaceFlare(ctx, tubeX - tubeW / 2 + 30, tubeY, getBeamHexColor(peWavelengthNm), t);
            }

            if (beamProgress > 0.5 && peCalc.isEmitted && peCalc.maxKineticEnergyEv > 0) {
              const p2 = (beamProgress - 0.5) / 0.5;
              const numElectrons = Math.round((peIntensityPct / 100) * 8);
              ctx.save();
              ctx.fillStyle = '#38bdf8';
              ctx.shadowColor = '#0284c7';
              ctx.shadowBlur = 8;
              for (let e = 0; e < numElectrons; e++) {
                const eProg = ((t * 1.5 + e * 0.25) % 1.0) * p2;
                const ex = tubeX - tubeW / 2 + 37 + (tubeW - 74) * eProg;
                const ey = tubeY - 30 + (e * 14) % 60;
                ctx.beginPath();
                ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.restore();
            }
          }

          // Analog Galvanometer / Microammeter
          const currentMicroAmps =
            beamProgress > 0.5 && peCalc.isEmitted ? (peIntensityPct / 100) * 84 : 0;
          drawGalvanometerDial(ctx, width - 150, height - 170, 130, 110, currentMicroAmps, 100, 'MICROAMMETER');

          if (showLabels) {
            callouts.push({
              id: 'cathode_label',
              targetX: tubeX - tubeW / 2 + 31,
              targetY: tubeY - 45,
              anchorX: 130,
              anchorY: 45,
              badgeX: 130,
              badgeY: 45,
              textEn: `Cathode (${metal.symbol})`,
              textNe: `क्याथोड (${metal.nameNe})`,
              value: `Φ = ${metal.workFunctionEv} eV`,
              color: '#64748b',
              align: 'left',
            });
            callouts.push({
              id: 'photon_energy',
              targetX: tubeX,
              targetY: tubeY - 70,
              anchorX: tubeX,
              anchorY: 45,
              badgeX: tubeX,
              badgeY: 45,
              textEn: peCalc.isEmitted ? 'Photoelectric Emission ACTIVE' : 'NO Emission (hf < Φ)',
              textNe: peCalc.isEmitted ? 'इलेक्ट्रोन उत्सर्जन सक्रिय' : 'कुनै उत्सर्जन छैन (hf < Φ)',
              value: `E = ${peCalc.photonEnergyEv} eV`,
              color: peCalc.isEmitted ? '#16a34a' : '#ef4444',
              align: 'center',
            });
          }
          break;
        }

        // ====================================================================
        // 9. COMPTON EFFECT (कम्प्टोन प्रभाव)
        // ====================================================================
        case 'compton': {
          const centerX = width * 0.48;
          const centerY = height * 0.52;
          const scat = calculateComptonScattering(comptonIncidentWlPm, comptonScatteringAngleDeg);

          // Target Electron with Quantum Heisenberg Probability Cloud & Spin
          ctx.save();
          const orbitalGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 22);
          orbitalGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
          orbitalGrad.addColorStop(0.5, 'rgba(2, 132, 199, 0.15)');
          orbitalGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');

          ctx.fillStyle = orbitalGrad;
          ctx.beginPath();
          ctx.arc(centerX, centerY, 22, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0284c7';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(centerX, centerY, 7.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = 'bold 9px ui-sans-serif, system-ui, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('e⁻', centerX, centerY);
          ctx.restore();

          // Incoming High-Energy X-Ray Photon (Slow propagation 0 to 0.5)
          const p1 = Math.min(1.0, beamProgress / 0.5);
          const incStartX = 80;
          const curIncTargetX = incStartX + (centerX - 10 - incStartX) * p1;

          ctx.save();
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          for (let px = incStartX; px <= curIncTargetX; px += 2) {
            const py = centerY + Math.sin(((px - t * 120) / 10) * Math.PI * 2) * 8;
            if (px === incStartX) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();

          if (beamProgress > 0.5) {
            const p2 = (beamProgress - 0.5) / 0.5;
            drawInterfaceFlare(ctx, centerX, centerY, '#6366f1', t);

            // Scattered Photon at angle theta (elongated wavelength)
            const thetaRad = degToRad(comptonScatteringAngleDeg);
            const scatLen = 170 * p2;
            const scatDestX = centerX + scatLen * Math.cos(thetaRad);
            const scatDestY = centerY - scatLen * Math.sin(thetaRad);

            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(scatDestX, scatDestY);
            ctx.stroke();

            // Recoil Electron at angle phi
            const phiRad = degToRad(scat.recoilAngleDeg);
            const recoilLen = 130 * p2;
            const recoilDestX = centerX + recoilLen * Math.cos(phiRad);
            const recoilDestY = centerY + recoilLen * Math.sin(phiRad);

            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(recoilDestX, recoilDestY);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#0284c7';
            ctx.beginPath();
            ctx.arc(recoilDestX, recoilDestY, 5, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          if (showLabels) {
            callouts.push({
              id: 'incident_xray',
              targetX: centerX - 80,
              targetY: centerY - 15,
              anchorX: 130,
              anchorY: 45,
              badgeX: 130,
              badgeY: 45,
              textEn: 'Incident X-Ray Photon',
              textNe: 'आपतित एक्स-रे फोटोन',
              value: `λ = ${comptonIncidentWlPm} pm`,
              color: '#6366f1',
              align: 'left',
            });
            callouts.push({
              id: 'scattered_photon',
              targetX: centerX + 110 * Math.cos(degToRad(comptonScatteringAngleDeg)),
              targetY: centerY - 110 * Math.sin(degToRad(comptonScatteringAngleDeg)),
              anchorX: width - 140,
              anchorY: 45,
              badgeX: width - 140,
              badgeY: 45,
              textEn: 'Scattered Photon (λ\' > λ)',
              textNe: 'छरिएको फोटोन (λ\' > λ)',
              value: `Δλ = ${scat.shiftDeltaPm} pm`,
              color: '#ef4444',
              align: 'right',
            });
          }
          break;
        }
      }

      // 3. Render Tyndall Atmospheric Scattering Dust Motes
      if (laserOn && raySegmentsForDust.length > 0) {
        drawTyndallDustParticles(ctx, dust, raySegmentsForDust, beamColor);
      }

      // 4. Render Museum-Grade Safe Margin Callouts
      drawSafeCallouts(ctx, callouts, lang);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isMounted = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [
    activePhenomenon,
    refractionSubMode,
    laserOn,
    beamProgress,
    isAnimatingSlow,
    laserSpeed,
    laserWavelength,
    showLabels,
    showAngles,
    showFresnelReflection,
    reflectionAngleDeg,
    mirrorType,
    slabAngleDeg,
    slabThicknessMm,
    slabMediumKey,
    prismApexAngleDeg,
    slitWidthMicrons,
    screenDistanceCm,
    doubleSlitSeparationMm,
    analyzerAngleDeg,
    tirIncidentAngleDeg,
    tirMediumKey,
    peMetalKey,
    peWavelengthNm,
    peIntensityPct,
    peRetardingVoltage,
    comptonScatteringAngleDeg,
    comptonIncidentWlPm,
    lang,
    getBeamHexColor,
  ]);

  // Quiz Handling
  const handleAnswerSubmit = (optionIdx: number) => {
    setSelectedOption(optionIdx);
    const q = LIGHT_SIM_QUIZ[quizIdx];
    if (optionIdx === q.correctIdx) {
      ScienceAudio.playDing();
      setQuizFeedback(lang === 'ne' ? 'उत्कृष्ट! सहि उत्तर।' : 'Excellent! Correct answer.');
      setQuizScore((prev) => prev + 1);
      setStars((prev) => Math.min(3, prev + 1));
    } else {
      ScienceAudio.playBuzzer();
      setQuizFeedback(
        lang === 'ne'
          ? `गलत उत्तर। सहि उत्तर: ${q.optionsNe[q.correctIdx]}`
          : `Incorrect. Correct answer: ${q.optionsEn[q.correctIdx]}`
      );
    }
  };

  const handleNextQuiz = () => {
    if (quizIdx + 1 < LIGHT_SIM_QUIZ.length) {
      setQuizIdx((prev) => prev + 1);
      setSelectedOption(null);
      setQuizFeedback(null);
    } else {
      setIsCompleted(true);
      ScienceAudio.playCelebration();
    }
  };

  // 9 Phenomena Tab Definitions
  const phenomenaTabs: {
    key: OpticalPhenomenon;
    labelEn: string;
    labelNe: string;
    icon: string;
  }[] = [
    { key: 'reflection', labelEn: '1. Reflection', labelNe: '१. परावर्तन', icon: '🪞' },
    { key: 'refraction', labelEn: '2. Refraction', labelNe: '२. अपवर्तन', icon: '🔍' },
    { key: 'dispersion', labelEn: '3. Dispersion', labelNe: '३. वर्ण विच्छेदन', icon: '🌈' },
    { key: 'diffraction', labelEn: '4. Diffraction', labelNe: '४. विवर्तन', icon: '〰️' },
    { key: 'interference', labelEn: '5. Interference', labelNe: '५. व्यतिकरण', icon: '🌊' },
    { key: 'polarization', labelEn: '6. Polarization', labelNe: '६. ध्रुवीकरण', icon: '🕶️' },
    { key: 'tir', labelEn: '7. Total Internal Refl.', labelNe: '७. पूर्ण आन्तरिक परावर्तन', icon: '💎' },
    { key: 'photoelectric', labelEn: '8. Photoelectric', labelNe: '८. फोटोइलेक्ट्रिक प्रभाव', icon: '⚡' },
    { key: 'compton', labelEn: '9. Compton Effect', labelNe: '९. कम्प्टोन प्रभाव', icon: '💥' },
  ];

  return (
    <SimulationLayout
      grade={10}
      chapterNumber={5}
      chapterTitle="Phenomena of Light"
      chapterTitleNepali="प्रकाशका परिघटनाहरू"
      titleEn="Phenomena of Light Master Laboratory"
      titleNepali="प्रकाशका परिघटनाहरूको बृहत् अनुसन्धान प्रयोगशाला"
      currentStage={stage}
      onStageChange={(newStage) => {
        setStage(newStage);
        ScienceAudio.playClick();
      }}
      lang={lang}
      onLanguageToggle={() => {
        setLang((l) => (l === 'en' ? 'ne' : 'en'));
        ScienceAudio.playClick();
      }}
      stars={stars}
      maxStars={3}
      isCompleted={isCompleted}
      onReset={handleReset}
      onBackToLibrary={onBackToLibrary}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          gap: 16,
          height: '100%',
          minHeight: '620px',
          background: '#f8fafc',
          padding: 12,
          borderRadius: 12,
        }}
      >
        {/* ============================================================== */}
        {/* LEFT COLUMN: INTERACTIVE CANVAS VIEWPORT */}
        {/* ============================================================== */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            background: '#ffffff',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          {/* Top Mode Selector Ribbon - Switching triggers slow laser light travel! */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              padding: '8px 12px',
              background: '#f1f5f9',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            {phenomenaTabs.map((tab) => {
              const active = activePhenomenon === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActivePhenomenon(tab.key);
                    triggerSlowLaserFlow(); // Laser light begins to travel at a slow speed!
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    border: active ? '1px solid #0284c7' : '1px solid #cbd5e1',
                    background: active ? '#0284c7' : '#ffffff',
                    color: active ? '#ffffff' : '#0f172a',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{lang === 'ne' ? tab.labelNe : tab.labelEn}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-bar for Refraction Deep-Dive */}
          {activePhenomenon === 'refraction' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 12px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                fontSize: 12,
              }}
            >
              <div style={{ display: 'flex', gap: 6 }}>
                {[
                  { key: 'meaning' as RefractionSubMode, en: '1. Meaning', ne: '१. अर्थ तथा सिद्धान्त' },
                  { key: 'causes' as RefractionSubMode, en: '2. Causes', ne: '२. कारण तथा गति' },
                  { key: 'glass_slab' as RefractionSubMode, en: '3. Glass Slab Experiment', ne: '३. काँचको पाता प्रयोग' },
                ].map((sub) => {
                  const isSel = refractionSubMode === sub.key;
                  return (
                    <button
                      key={sub.key}
                      onClick={() => {
                        setRefractionSubMode(sub.key);
                        triggerSlowLaserFlow(); // Begin slow travel when switching sub-modes too!
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: isSel ? 700 : 500,
                        cursor: 'pointer',
                        border: isSel ? '1px solid #0369a1' : '1px solid #e2e8f0',
                        background: isSel ? '#e0f2fe' : '#ffffff',
                        color: isSel ? '#0369a1' : '#334155',
                      }}
                    >
                      {lang === 'ne' ? sub.ne : sub.en}
                    </button>
                  );
                })}
              </div>

              {/* Replay Slow Laser Flow Button */}
              <button
                onClick={triggerSlowLaserFlow}
                disabled={isAnimatingSlow}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: isAnimatingSlow ? 'not-allowed' : 'pointer',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  opacity: isAnimatingSlow ? 0.6 : 1,
                }}
              >
                <Zap size={14} />
                <span>{lang === 'ne' ? 'सुस्त लेजर प्रवाह' : 'Slow Laser Flow'}</span>
              </button>
            </div>
          )}

          {/* HTML5 Canvas Area */}
          <div style={{ flex: 1, position: 'relative', minHeight: '440px' }}>
            <canvas
              ref={canvasRef}
              width={820}
              height={520}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                background: '#ffffff',
              }}
            />
          </div>

          {/* Canvas Bottom Quick Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 14px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              fontSize: 11,
              color: '#475569',
            }}
          >
            <div style={{ display: 'flex', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                />
                <span>{lang === 'ne' ? 'लेबलहरू देखाउनुहोस्' : 'Show Labels'}</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showAngles}
                  onChange={(e) => setShowAngles(e.target.checked)}
                />
                <span>{lang === 'ne' ? 'कोणहरू देखाउनुहोस्' : 'Show Angles'}</span>
              </label>

              {activePhenomenon === 'refraction' && refractionSubMode === 'glass_slab' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={showFresnelReflection}
                    onChange={(e) => setShowFresnelReflection(e.target.checked)}
                  />
                  <span>{lang === 'ne' ? 'आंशिक परावर्तन (Fresnel)' : 'Fresnel Reflection (~4%)'}</span>
                </label>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Universal Replay Button for all 9 phenomena */}
              <button
                onClick={triggerSlowLaserFlow}
                disabled={isAnimatingSlow}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 700,
                  border: '1px solid #ef4444',
                  background: isAnimatingSlow ? '#fee2e2' : '#ffffff',
                  color: '#ef4444',
                  cursor: isAnimatingSlow ? 'default' : 'pointer',
                }}
              >
                <Zap size={11} />
                <span>{lang === 'ne' ? 'पुन: सुस्त किरण पठाउनुहोस्' : 'Replay Flow'}</span>
              </button>

              <span>{lang === 'ne' ? 'गति:' : 'Speed:'}</span>
              {[0.5, 1.0, 2.0].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setLaserSpeed(spd)}
                  style={{
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: laserSpeed === spd ? 700 : 400,
                    border: '1px solid #cbd5e1',
                    background: laserSpeed === spd ? '#0284c7' : '#ffffff',
                    color: laserSpeed === spd ? '#ffffff' : '#0f172a',
                    cursor: 'pointer',
                  }}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: PARAMETER CONTROL PANEL (380px) */}
        {/* ============================================================== */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            background: '#ffffff',
            borderRadius: 10,
            border: '1px solid #e2e8f0',
            padding: 14,
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 180px)',
          }}
        >
          {/* Header Card */}
          <div
            style={{
              padding: '10px 12px',
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
              {lang === 'ne'
                ? phenomenaTabs.find((t) => t.key === activePhenomenon)?.labelNe
                : phenomenaTabs.find((t) => t.key === activePhenomenon)?.labelEn}
            </div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
              {lang === 'ne'
                ? 'मापदण्डहरू समायोजन गर्नुहोस् र प्रत्यक्ष परिवर्तन हेर्नुहोस्'
                : 'Adjust physical parameters and observe real-time optical response'}
            </div>
          </div>

          {/* DYNAMIC PARAMETER SLIDERS BASED ON ACTIVE PHENOMENON */}
          {activePhenomenon === 'refraction' && refractionSubMode === 'glass_slab' && (
            <>
              {/* Incident Angle i */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  padding: 10,
                  background: '#f8fafc',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
                  <span>{lang === 'ne' ? 'आपतन कोण (Angle of Incidence i)' : 'Angle of Incidence (i)'}</span>
                  <span style={{ color: '#0284c7', fontWeight: 700 }}>{slabAngleDeg}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={75}
                  value={slabAngleDeg}
                  onChange={(e) => setSlabAngleDeg(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b' }}>
                  <span>0° (Normal)</span>
                  <span>45°</span>
                  <span>75°</span>
                </div>
              </div>

              {/* Slab Thickness t */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  padding: 10,
                  background: '#f8fafc',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
                  <span>{lang === 'ne' ? 'पाताको मोटाइ (Thickness t)' : 'Slab Thickness (t)'}</span>
                  <span style={{ color: '#0284c7', fontWeight: 700 }}>{slabThicknessMm} mm</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={120}
                  value={slabThicknessMm}
                  onChange={(e) => setSlabThicknessMm(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
                />
              </div>

              {/* Optical Medium Selector */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  padding: 10,
                  background: '#f8fafc',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600 }}>
                  {lang === 'ne' ? 'काँचको माध्यम (Medium)' : 'Optical Medium'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {(['crown_glass', 'flint_glass', 'water', 'diamond'] as MediumKey[]).map((mk) => {
                    const m = OPTICAL_MEDIA[mk];
                    const sel = slabMediumKey === mk;
                    return (
                      <button
                        key={mk}
                        onClick={() => {
                          setSlabMediumKey(mk);
                          ScienceAudio.playClick();
                        }}
                        style={{
                          padding: '6px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: sel ? 700 : 500,
                          cursor: 'pointer',
                          border: sel ? '1px solid #0284c7' : '1px solid #cbd5e1',
                          background: sel ? '#e0f2fe' : '#ffffff',
                          color: sel ? '#0369a1' : '#0f172a',
                          textAlign: 'left',
                        }}
                      >
                        <div>{lang === 'ne' ? m.nameNe : m.nameEn}</div>
                        <div style={{ fontSize: 9, color: '#64748b' }}>n = {m.refractiveIndex}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Telemetry Live Data Card */}
              {(() => {
                const med = OPTICAL_MEDIA[slabMediumKey];
                const calc = calculateGlassSlabDisplacement(slabAngleDeg, slabThicknessMm, med.refractiveIndex);
                return (
                  <div
                    style={{
                      padding: 10,
                      background: '#eff6ff',
                      borderRadius: 8,
                      border: '1px solid #bfdbfe',
                      fontSize: 11,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: 2 }}>
                      {lang === 'ne' ? 'प्रयोगात्मक मापन (Live Optical Telemetry)' : 'Live Optical Telemetry'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{lang === 'ne' ? 'आपतन कोण (∠i):' : 'Angle of Incidence (∠i):'}</span>
                      <b>{slabAngleDeg}°</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{lang === 'ne' ? 'अपवर्तन कोण (∠r):' : 'Angle of Refraction (∠r):'}</span>
                      <b style={{ color: '#16a34a' }}>{calc.rDeg.toFixed(2)}°</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{lang === 'ne' ? 'निर्गत कोण (∠e):' : 'Emergent Angle (∠e):'}</span>
                      <b style={{ color: '#d97706' }}>{calc.eDeg}° (i = e)</b>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #dbeafe', paddingTop: 4 }}>
                      <span>{lang === 'ne' ? 'पार्श्व विस्थापन (Shift d):' : 'Lateral Displacement (d):'}</span>
                      <b style={{ color: '#b45309' }}>{calc.lateralShiftMm.toFixed(2)} mm</b>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* 1. REFLECTION CONTROLS */}
          {activePhenomenon === 'reflection' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                padding: 10,
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
                <span>{lang === 'ne' ? 'आपतन कोण (Angle of Incidence i)' : 'Angle of Incidence (i)'}</span>
                <span style={{ color: '#0284c7', fontWeight: 700 }}>{reflectionAngleDeg}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={80}
                value={reflectionAngleDeg}
                onChange={(e) => setReflectionAngleDeg(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
              />
              <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
                {lang === 'ne'
                  ? `परावर्तनको नियम अनुसार: ∠r = ∠i = ${reflectionAngleDeg}°`
                  : `Law of Reflection: ∠r = ∠i = ${reflectionAngleDeg}°`}
              </div>
            </div>
          )}

          {/* 3. DISPERSION CONTROLS WITH VIBGYOR WAVELENGTH SPECTRUM TABLE */}
          {activePhenomenon === 'dispersion' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: 10,
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                {lang === 'ne' ? 'VIBGYOR तरङ्ग लम्बाइ वर्णक्रम (Wavelengths)' : 'VIBGYOR Wavelength Spectrum'}
              </div>

              {/* Explicit Wavelengths Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {getCauchyDispersion(prismApexAngleDeg).map((spec) => (
                  <div
                    key={spec.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 8px',
                      background: '#ffffff',
                      borderRadius: 6,
                      border: '1px solid #e2e8f0',
                      fontSize: 11,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: spec.hex,
                          display: 'inline-block',
                        }}
                      />
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>
                        {lang === 'ne' ? spec.nameNe : spec.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 10, color: '#475569' }}>
                      <span style={{ fontWeight: 700, color: spec.hex }}>{spec.wavelengthNm} nm</span>
                      <span style={{ fontSize: 10 }}>δ = {spec.deviationDeg}°</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                {lang === 'ne'
                  ? 'कम तरङ्ग लम्बाइ (बैजनी ४०० nm) भएको प्रकाश काँचमा बढी बाङ्गिन्छ, र लामो तरङ्ग लम्बाइ (रातो ७०० nm) कम बाङ्गिन्छ।'
                  : 'Shorter wavelength (Violet 400 nm) bends most in glass, while longer wavelength (Red 700 nm) bends least.'}
              </div>
            </div>
          )}

          {/* 6. POLARIZATION CONTROLS */}
          {activePhenomenon === 'polarization' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                padding: 10,
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
                <span>{lang === 'ne' ? 'एनालाइजर कोण (Analyzer Angle θ)' : 'Analyzer Angle (θ)'}</span>
                <span style={{ color: '#d97706', fontWeight: 700 }}>{analyzerAngleDeg}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={180}
                value={analyzerAngleDeg}
                onChange={(e) => setAnalyzerAngleDeg(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#d97706', cursor: 'pointer' }}
              />
              <div style={{ fontSize: 11, color: '#0f172a', fontWeight: 600, marginTop: 4 }}>
                {lang === 'ne' ? 'मालसको नियम (Malus’s Law):' : 'Malus’s Law:'}
                <div style={{ color: '#0284c7', fontSize: 12 }}>
                  I = I₀ · cos²({analyzerAngleDeg}°) ={' '}
                  {calculateMalusIntensity(100, analyzerAngleDeg).percentage}%
                </div>
              </div>
            </div>
          )}

          {/* 7. TIR CONTROLS WITH CRITICAL ANGLE (θc) DISPLAY & SNAP BUTTON */}
          {activePhenomenon === 'tir' && (() => {
            const med = OPTICAL_MEDIA[tirMediumKey];
            const crit = radToDeg(Math.asin(1 / med.refractiveIndex));
            const isTir = tirIncidentAngleDeg >= crit;
            const isCriticalState = Math.abs(tirIncidentAngleDeg - crit) < 1.0;

            return (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: 10,
                  background: '#f8fafc',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
                  <span>{lang === 'ne' ? 'सघन माध्यममा आपतन कोण (i)' : 'Incident Angle in Denser Medium (i)'}</span>
                  <span style={{ color: '#0284c7', fontWeight: 700 }}>{tirIncidentAngleDeg}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={80}
                  value={tirIncidentAngleDeg}
                  onChange={(e) => setTirIncidentAngleDeg(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#0284c7', cursor: 'pointer' }}
                />

                {/* CRITICAL ANGLE CARD & SNAP BUTTON */}
                <div
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: '#92400e' }}>
                    <span>{lang === 'ne' ? 'क्रान्तिक कोण (Critical Angle θc):' : 'Critical Angle (θc):'}</span>
                    <span>θc = {crit.toFixed(2)}°</span>
                  </div>
                  <div style={{ fontSize: 10, color: '#b45309' }}>
                    {lang === 'ne'
                      ? `सूत्र: sin(θc) = 1/n = 1/${med.refractiveIndex} ⇒ θc = ${crit.toFixed(2)}°`
                      : `Formula: sin(θc) = 1/n = 1/${med.refractiveIndex} ⇒ θc = ${crit.toFixed(2)}°`}
                  </div>
                  {/* Snap to Critical Angle button */}
                  <button
                    onClick={() => {
                      setTirIncidentAngleDeg(Math.round(crit * 10) / 10);
                      triggerSlowLaserFlow();
                    }}
                    style={{
                      padding: '5px 8px',
                      borderRadius: 4,
                      background: '#f59e0b',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: 11,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <Compass size={12} />
                    <span>{lang === 'ne' ? `क्रान्तिक कोणमा सेट गर्नुहोस् (i = ${crit.toFixed(1)}°)` : `Snap to Critical Angle (i = ${crit.toFixed(1)}°)`}</span>
                  </button>
                </div>

                {/* State Banner */}
                <div
                  style={{
                    padding: 8,
                    borderRadius: 6,
                    background: isTir ? '#dcfce7' : isCriticalState ? '#fef3c7' : '#e0f2fe',
                    color: isTir ? '#166534' : isCriticalState ? '#92400e' : '#0369a1',
                    fontWeight: 700,
                    fontSize: 11,
                  }}
                >
                  {isTir
                    ? lang === 'ne'
                      ? `पूर्ण आन्तरिक परावर्तन (TIR) सक्रिय! (i = ${tirIncidentAngleDeg}° > θc = ${crit.toFixed(1)}°)`
                      : `Total Internal Reflection ACTIVE! (i = ${tirIncidentAngleDeg}° > θc = ${crit.toFixed(1)}°)`
                    : isCriticalState
                    ? lang === 'ne'
                      ? `क्रान्तिक अवस्था: किरण ९०° मा सतह छोएर जान्छ (Grazing Ray)!`
                      : `CRITICAL STATE: Ray grazes interface at 90°!`
                    : lang === 'ne'
                      ? `सामान्य अपवर्तन (i = ${tirIncidentAngleDeg}° < θc = ${crit.toFixed(1)}°)`
                      : `Normal Refraction (i = ${tirIncidentAngleDeg}° < θc = ${crit.toFixed(1)}°)`}
                </div>
              </div>
            );
          })()}

          {/* 8. PHOTOELECTRIC EFFECT CONTROLS */}
          {activePhenomenon === 'photoelectric' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: 10,
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
                <span>{lang === 'ne' ? 'आपतित प्रकाश तरङ्ग लम्बाइ (λ)' : 'Light Wavelength (λ)'}</span>
                <span style={{ color: getBeamHexColor(peWavelengthNm), fontWeight: 700 }}>
                  {peWavelengthNm} nm
                </span>
              </div>
              <input
                type="range"
                min={200}
                max={750}
                value={peWavelengthNm}
                onChange={(e) => setPeWavelengthNm(Number(e.target.value))}
                style={{ width: '100%', accentColor: getBeamHexColor(peWavelengthNm), cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b' }}>
                <span>200nm (UV)</span>
                <span>400nm (Violet)</span>
                <span>750nm (Red)</span>
              </div>
            </div>
          )}

          {/* 9. COMPTON EFFECT CONTROLS */}
          {activePhenomenon === 'compton' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: 10,
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
                <span>{lang === 'ne' ? 'छरिने कोण (Scattering Angle θ)' : 'Scattering Angle (θ)'}</span>
                <span style={{ color: '#ef4444', fontWeight: 700 }}>{comptonScatteringAngleDeg}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={180}
                value={comptonScatteringAngleDeg}
                onChange={(e) => setComptonScatteringAngleDeg(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ef4444', cursor: 'pointer' }}
              />
              {(() => {
                const s = calculateComptonScattering(comptonIncidentWlPm, comptonScatteringAngleDeg);
                return (
                  <div style={{ fontSize: 11, color: '#0f172a', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div>
                      {lang === 'ne' ? 'तरङ्ग लम्बाइ विस्थापन (Compton Shift Δλ):' : 'Compton Shift (Δλ):'}
                    </div>
                    <b style={{ color: '#ef4444' }}>Δλ = {s.shiftDeltaPm} pm</b>
                    <div>
                      {lang === 'ne' ? 'छरिएको तरङ्ग लम्बाइ (λ\'):' : 'Scattered Wavelength (λ\'):'}
                    </div>
                    <b style={{ color: '#6366f1' }}>λ\' = {s.scatteredWlPm} pm</b>
                  </div>
                );
              })()}
            </div>
          )}

          {/* SEE BOARD EXAMINATION CHALLENGE SECTION */}
          {stage === 'challenge' && (
            <div
              style={{
                padding: 12,
                background: '#f1f5f9',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
                <span>
                  {lang === 'ne' ? 'SEE बोर्ड परीक्षा प्रश्न' : 'SEE Board Exam Quiz'} ({quizIdx + 1}/{LIGHT_SIM_QUIZ.length})
                </span>
                <span style={{ color: '#16a34a' }}>
                  ★ {quizScore}/{LIGHT_SIM_QUIZ.length}
                </span>
              </div>

              <div style={{ fontSize: 11, fontWeight: 600, color: '#0f172a' }}>
                {lang === 'ne' ? LIGHT_SIM_QUIZ[quizIdx].questionNe : LIGHT_SIM_QUIZ[quizIdx].questionEn}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(lang === 'ne'
                  ? LIGHT_SIM_QUIZ[quizIdx].optionsNe
                  : LIGHT_SIM_QUIZ[quizIdx].optionsEn
                ).map((opt, oIdx) => {
                  const isChosen = selectedOption === oIdx;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleAnswerSubmit(oIdx)}
                      disabled={selectedOption !== null}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        fontSize: 11,
                        cursor: selectedOption !== null ? 'default' : 'pointer',
                        textAlign: 'left',
                        border: isChosen ? '1px solid #0284c7' : '1px solid #cbd5e1',
                        background: isChosen ? '#e0f2fe' : '#ffffff',
                        color: '#0f172a',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {quizFeedback && (
                <div
                  style={{
                    padding: 6,
                    borderRadius: 4,
                    fontSize: 10,
                    fontWeight: 600,
                    background: selectedOption === LIGHT_SIM_QUIZ[quizIdx].correctIdx ? '#dcfce7' : '#fee2e2',
                    color: selectedOption === LIGHT_SIM_QUIZ[quizIdx].correctIdx ? '#166534' : '#991b1b',
                  }}
                >
                  {quizFeedback}
                </div>
              )}

              {selectedOption !== null && (
                <button
                  onClick={handleNextQuiz}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {quizIdx + 1 < LIGHT_SIM_QUIZ.length
                    ? lang === 'ne'
                      ? 'अर्को प्रश्न'
                      : 'Next Question'
                    : lang === 'ne'
                      ? 'नतिजा हेर्नुहोस्'
                      : 'Complete Quiz'}
                </button>
              )}
            </div>
          )}

          {/* Curriculum Key Takeaway */}
          <div
            style={{
              padding: 10,
              background: '#f8fafc',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 11,
              color: '#334155',
            }}
          >
            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
              {lang === 'ne' ? 'पाठ्यक्रम निष्कर्ष (Curriculum Takeaway)' : 'Curriculum Takeaway'}
            </div>
            <div>
              {lang === 'ne'
                ? 'काँचको पाताबाट अपवर्तन हुँदा दुई समानान्तर सतहमा बराबर र विपरीत दिशामा कोण बाङ्गिने भएकाले आपतित किरण र निर्गत किरण समानान्तर हुन्छन्, तर पार्श्व विस्थापन (Lateral displacement) हुन्छ।'
                : 'In a rectangular glass slab, refraction at two parallel faces causes equal and opposite bending, making the emergent ray strictly parallel to the incident ray with a measurable lateral displacement.'}
            </div>
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default PhenomenaOfLightSim;

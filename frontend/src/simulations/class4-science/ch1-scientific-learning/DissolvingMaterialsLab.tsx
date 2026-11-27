/**
 * DissolvingMaterialsLab.tsx
 * Simulation 2: Digital Dissolving Laboratory (घुलनशील र अघुलनशील वस्तुहरूको डिजिटल प्रयोगशाला)
 * Grade 4 Science • Chapter 1: Scientific Learning (वैज्ञानिक सिकाइ)
 *
 * 100% Native HTML5 Canvas 2D Interactive Physics & Chemistry Simulation.
 * Designed specifically for young learners with rich visuals, friendly aesthetics,
 * tangible drag-and-drop mechanics, and deep pedagogical engagement:
 *
 * 1. Material Selection (विलेय र विलायक छनोट):
 *    - Solutes: Sugar (चिनी), Salt (नुन), Sand (बालुवा), Chalk Powder (चक)
 *    - Solvents: Water ($H_2O$, पानी), Milk (दूध), Cooking Oil (तेल)
 * 2. Tangible Drag-and-Drop Interaction:
 *    - Students can physically drag sugar cubes, salt spoon, sand scoop, or chalk stick directly into the beaker!
 *    - Dynamic water splash droplets, surface ripple rings, and sound effects!
 * 3. Movable Glass Stirring Rod:
 *    - Students can grab the glass stirring rod and swirl inside the liquid to accelerate dissolution!
 * 4. Temperature & Kinetic Control (10°C to 80°C):
 *    - Realistic mercury thermometer with animated column
 *    - Heating coaster thermal glow & rising steam particles
 *    - Higher heat speeds up dissolution exponentially!
 * 5. Microscopic Molecular Dynamics View (अणु संरचना अवलोकन):
 *    - Real-time crystal lattice spheres of the solute
 *    - Solvent ($H_2O$) molecules vibrating with kinetic temperature energy
 *    - Animated dissolution arrows showing molecules being pulled apart
 * 6. Clean, welcoming student-friendly theme: light airy slate and crisp white cards (no dark murky AI look).
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  Sparkles,
  RotateCcw,
  Droplet,
  Play,
  Flame,
  Snowflake,
  Timer as TimerIcon,
  HelpCircle,
  CheckCircle,
  Eye,
  Volume2,
  VolumeX,
} from 'lucide-react';

export type SoluteType = 'sugar' | 'salt' | 'sand' | 'chalk';
export type SolventType = 'water' | 'milk' | 'oil';

interface SoluteParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  dissolved: boolean;
  angle: number;
  distance: number;
}

interface MoleculeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  type: 'solute' | 'solvent';
  pairedWith?: number;
}

interface SteamParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

export const DissolvingMaterialsLab: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Experiment state
  const [solute, setSolute] = useState<SoluteType>('sugar');
  const [solvent, setSolvent] = useState<SolventType>('water');
  const [temperature, setTemperature] = useState<number>(25); // 10°C to 80°C
  const [isAdded, setIsAdded] = useState<boolean>(false);
  const [isStirring, setIsStirring] = useState<boolean>(false);
  const [dissolveProgress, setDissolveProgress] = useState<number>(0); // 0.0 to 1.0
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [testedCount, setTestedCount] = useState<number>(0);
  const [showMicroLens, setShowMicroLens] = useState<boolean>(true);
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);

  // Tangible draggable solute state
  const [draggedSolute, setDraggedSolute] = useState<{
    id: SoluteType;
    x: number;
    y: number;
  } | null>(null);

  // Movable stirring rod state
  const [rodPos, setRodPos] = useState<{ x: number; y: number }>({ x: 580, y: 220 });
  const isDraggingRodRef = useRef<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<SoluteParticle[]>([]);
  const moleculesRef = useRef<MoleculeParticle[]>([]);
  const steamRef = useRef<SteamParticle[]>([]);
  const splashRef = useRef<SplashParticle[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  // Canvas geometry constants (960 x 540 virtual space)
  const CANVAS_WIDTH = 960;
  const CANVAS_HEIGHT = 540;

  // Beaker dimensions
  const BEAKER = {
    x: 350,
    y: 110,
    w: 190,
    h: 220,
    liquidY: 170, // Liquid surface top
  };

  // Thermometer dimensions
  const THERMO = {
    x: 275,
    y: 120,
    w: 24,
    h: 200,
  };

  // Micro lens dimensions
  const MICROLENS = {
    x: 680,
    y: 65,
    w: 250,
    h: 340,
  };

  // Solute Definitions
  const SOLUTES: Record<
    SoluteType,
    {
      nameEn: string;
      nameNe: string;
      color: string;
      particleColor: string;
      particleSize: number;
      isSolubleInWater: boolean;
      isSolubleInMilk: boolean;
      isSolubleInOil: boolean;
      descEn: string;
      descNe: string;
    }
  > = {
    sugar: {
      nameEn: 'Sugar Crystals',
      nameNe: 'चिनी (Sugar)',
      color: '#38bdf8',
      particleColor: '#ffffff',
      particleSize: 3.5,
      isSolubleInWater: true,
      isSolubleInMilk: true,
      isSolubleInOil: false,
      descEn: 'Crystalline carbohydrate that dissolves completely in water and milk to create a sweet solution.',
      descNe: 'पानी र दूधमा पूरै घुलेर मीठो घोल बनाउने सेतो क्रिस्टल वस्तु।',
    },
    salt: {
      nameEn: 'Table Salt',
      nameNe: 'नुन (Table Salt)',
      color: '#f59e0b',
      particleColor: '#f8fafc',
      particleSize: 2.5,
      isSolubleInWater: true,
      isSolubleInMilk: true,
      isSolubleInOil: false,
      descEn: 'Ionic compound (Sodium Chloride) that separates into individual sodium and chloride ions in water.',
      descNe: 'पानीमा छिटो घुलेर नुनिलो घोल बनाउने सामान्य खानाको नुन।',
    },
    sand: {
      nameEn: 'River Sand',
      nameNe: 'बालुवा (River Sand)',
      color: '#d97706',
      particleColor: '#b45309',
      particleSize: 4.0,
      isSolubleInWater: false,
      isSolubleInMilk: false,
      isSolubleInOil: false,
      descEn: 'Granular silicon dioxide that does not dissolve; particles settle to the beaker bottom as sediment.',
      descNe: 'पानीमा नघुल्ने र पिंधमा थिग्रिएर बस्ने अघुलनशील वस्तु।',
    },
    chalk: {
      nameEn: 'Chalk Powder',
      nameNe: 'चक धुलो (Chalk Powder)',
      color: '#e2e8f0',
      particleColor: '#cbd5e1',
      particleSize: 3.0,
      isSolubleInWater: false,
      isSolubleInMilk: false,
      isSolubleInOil: false,
      descEn: 'Calcium carbonate that creates a cloudy suspension in water and slowly settles to the bottom.',
      descNe: 'पानीलाई धमिलो बनाउने तर पूर्ण रूपमा नघुल्ने चकको धुलो।',
    },
  };

  // Solvent Definitions
  const SOLVENTS: Record<
    SolventType,
    {
      nameEn: string;
      nameNe: string;
      colorTop: string;
      colorBottom: string;
      transparency: number;
    }
  > = {
    water: {
      nameEn: 'Pure Water (H2O)',
      nameNe: 'शुद्ध पानी (Water)',
      colorTop: 'rgba(56, 189, 248, 0.45)',
      colorBottom: 'rgba(2, 132, 199, 0.75)',
      transparency: 0.8,
    },
    milk: {
      nameEn: 'Fresh Milk',
      nameNe: 'दूध (Milk)',
      colorTop: 'rgba(248, 250, 252, 0.92)',
      colorBottom: 'rgba(226, 232, 240, 0.95)',
      transparency: 0.95,
    },
    oil: {
      nameEn: 'Cooking Oil',
      nameNe: 'तेल (Cooking Oil)',
      colorTop: 'rgba(250, 204, 21, 0.55)',
      colorBottom: 'rgba(234, 179, 8, 0.85)',
      transparency: 0.75,
    },
  };

  // Determine if current solute dissolves in current solvent
  const isSoluble = useCallback(() => {
    const s = SOLUTES[solute];
    if (solvent === 'water') return s.isSolubleInWater;
    if (solvent === 'milk') return s.isSolubleInMilk;
    if (solvent === 'oil') return s.isSolubleInOil;
    return false;
  }, [solute, solvent]);

  // Initialize molecular particles for Micro-Lens view
  const initMolecules = useCallback(() => {
    const molList: MoleculeParticle[] = [];
    const info = SOLUTES[solute];

    // Solute crystal lattice: 5x5 grid in center
    const cx = MICROLENS.x + MICROLENS.w / 2;
    const cy = MICROLENS.y + 85;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        molList.push({
          x: cx - 40 + c * 20,
          y: cy - 30 + r * 20,
          vx: 0,
          vy: 0,
          radius: 6,
          color: info.color,
          type: 'solute',
        });
      }
    }

    // Free moving solvent water molecules
    for (let i = 0; i < 24; i++) {
      molList.push({
        x: MICROLENS.x + 25 + Math.random() * (MICROLENS.w - 50),
        y: MICROLENS.y + 175 + Math.random() * (MICROLENS.h - 195),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: 4,
        color: '#38bdf8',
        type: 'solvent',
      });
    }

    moleculesRef.current = molList;
  }, [solute]);

  useEffect(() => {
    initMolecules();
  }, [initMolecules]);

  // Spawn splash droplets & ripples
  const spawnSplash = (x: number, y: number) => {
    ScienceAudio.playPop();
    const drops: SplashParticle[] = [];
    for (let i = 0; i < 18; i++) {
      drops.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y,
        vx: (Math.random() - 0.5) * 3.5,
        vy: -Math.random() * 4.5 - 1.5,
        radius: 2 + Math.random() * 2.5,
        alpha: 0.9,
      });
    }
    splashRef.current = [...splashRef.current, ...drops];
  };

  // Add Solute into beaker
  const handleAddSolute = (chosenSolute?: SoluteType) => {
    if (chosenSolute) {
      setSolute(chosenSolute);
    }
    setIsAdded(true);
    setDissolveProgress(0);

    const pList: SoluteParticle[] = [];
    const targetSolute = chosenSolute || solute;
    const info = SOLUTES[targetSolute];
    const bx = BEAKER.x + BEAKER.w / 2;

    for (let i = 0; i < 55; i++) {
      const offsetX = (Math.random() - 0.5) * (BEAKER.w * 0.65);
      pList.push({
        x: bx + offsetX,
        y: BEAKER.liquidY + 15 + Math.random() * 20,
        vx: (Math.random() - 0.5) * 1.2,
        vy: 2.0 + Math.random() * 2.5,
        radius: info.particleSize + (Math.random() - 0.5) * 1.2,
        color: info.particleColor,
        alpha: 0.95,
        dissolved: false,
        angle: Math.random() * Math.PI * 2,
        distance: Math.abs(offsetX),
      });
    }

    particlesRef.current = pList;
    spawnSplash(bx, BEAKER.liquidY);
  };

  // Start or toggle stirring
  const handleToggleStirring = () => {
    if (!isAdded) {
      handleAddSolute();
    }
    const nextStirring = !isStirring;
    setIsStirring(nextStirring);

    if (nextStirring) {
      ScienceAudio.playWhoosh();
      setTimerActive(true);
    }
  };

  // Timer logic during mixing
  useEffect(() => {
    if (timerActive) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive]);

  // Reset experiment
  const handleReset = () => {
    setIsAdded(false);
    setIsStirring(false);
    setDissolveProgress(0);
    setTimerSeconds(0);
    setTimerActive(false);
    particlesRef.current = [];
    steamRef.current = [];
    splashRef.current = [];
    setDraggedSolute(null);
    setRodPos({ x: 580, y: 220 });
    initMolecules();
    ScienceAudio.playWhoosh();
  };

  // Select solute
  const handleSelectSolute = (s: SoluteType) => {
    if (s === solute) return;
    setSolute(s);
    handleReset();
    ScienceAudio.playClick();
  };

  // Select solvent
  const handleSelectSolvent = (sv: SolventType) => {
    if (sv === solvent) return;
    setSolvent(sv);
    handleReset();
    ScienceAudio.playClick();
  };

  // Audio voice toggle
  const handleToggleAudio = () => {
    if (isMuted) {
      setIsMuted(false);
      ScienceAudio.setMuted(false);
      ScienceAudio.playClick();
      ScienceAudio.speak(
        lang === 'ne'
          ? 'घुलनशील वस्तुहरू पानीमा घुलेर एकनासको घोल बनाउँछन्, र तातो पानीमा छिटो घुल्छन्!'
          : 'Soluble materials dissolve in water to form a uniform solution, and dissolve faster in warm water!',
        lang
      );
    } else {
      setIsMuted(true);
      ScienceAudio.setMuted(true);
    }
  };

  // Format timer string MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Canvas coordinates helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: ((clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    };
  };

  // Pointer down on canvas: check dragging stirring rod or solute
  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    // Check hit on stirring rod
    const distRod = Math.hypot(coords.x - rodPos.x, coords.y - rodPos.y);
    if (distRod < 40) {
      isDraggingRodRef.current = true;
      ScienceAudio.playPop();
      return;
    }
  };

  // Global window listeners for drag
  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      const coords = getCanvasCoords(e);

      // Dragging stirring rod
      if (isDraggingRodRef.current) {
        setRodPos({
          x: Math.max(340, Math.min(620, coords.x)),
          y: Math.max(120, Math.min(300, coords.y)),
        });

        // If inside beaker, active stirring
        const insideBeaker =
          coords.x >= BEAKER.x &&
          coords.x <= BEAKER.x + BEAKER.w &&
          coords.y >= BEAKER.liquidY &&
          coords.y <= BEAKER.y + BEAKER.h;

        if (insideBeaker) {
          if (!isAdded) {
            handleAddSolute();
          }
          if (!isStirring) {
            setIsStirring(true);
            setTimerActive(true);
          }
        }
      }

      // Dragging solute from tray
      if (draggedSolute) {
        setDraggedSolute((prev) => (prev ? { ...prev, x: coords.x, y: coords.y } : null));
      }
    };

    const handleGlobalUp = () => {
      if (isDraggingRodRef.current) {
        isDraggingRodRef.current = false;
      }

      if (draggedSolute) {
        // Check if dropped inside beaker
        const insideBeaker =
          draggedSolute.x >= BEAKER.x - 20 &&
          draggedSolute.x <= BEAKER.x + BEAKER.w + 20 &&
          draggedSolute.y >= BEAKER.y - 40 &&
          draggedSolute.y <= BEAKER.y + BEAKER.h + 20;

        if (insideBeaker) {
          handleAddSolute(draggedSolute.id);
        }
        setDraggedSolute(null);
      }
    };

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalUp);
    window.addEventListener('touchmove', handleGlobalMove);
    window.addEventListener('touchend', handleGlobalUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalUp);
    };
  }, [draggedSolute, isAdded, isStirring]);

  // 60 FPS Canvas Physics & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 1. LAB BACKGROUND: Modern Sleek Digital Laboratory
      const wallGrad = ctx.createLinearGradient(0, 0, 0, 360);
      wallGrad.addColorStop(0, '#f8fafc');
      wallGrad.addColorStop(0.6, '#f1f5f9');
      wallGrad.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, 360);

      // Subtle high-tech laboratory grid accent lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.lineWidth = 1;
      for (let y = 60; y < 360; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Dark Precision Slate Lab Workbench Surface
      const tableGrad = ctx.createLinearGradient(0, 360, 0, CANVAS_HEIGHT);
      tableGrad.addColorStop(0, '#cbd5e1');
      tableGrad.addColorStop(0.15, '#e2e8f0');
      tableGrad.addColorStop(0.7, '#f1f5f9');
      tableGrad.addColorStop(1, '#f8fafc');
      ctx.fillStyle = tableGrad;
      ctx.fillRect(0, 360, CANVAS_WIDTH, CANVAS_HEIGHT - 360);

      // Workbench rim highlight
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 360);
      ctx.lineTo(CANVAS_WIDTH, 360);
      ctx.stroke();

      // Soft glow under beaker on workbench
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.beginPath();
      ctx.ellipse(BEAKER.x + BEAKER.w / 2, 365, BEAKER.w * 0.7, 16, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. BEAKER COASTER / HEATING PAD
      const coasterX = BEAKER.x - 15;
      const coasterY = 345;
      const coasterW = BEAKER.w + 30;
      const coasterH = 18;

      if (temperature > 40) {
        const heatIntensity = (temperature - 40) / 40;
        ctx.shadowColor = `rgba(239, 68, 68, ${heatIntensity * 0.65})`;
        ctx.shadowBlur = 18 * heatIntensity;
      } else if (temperature < 20) {
        const coolIntensity = (20 - temperature) / 10;
        ctx.shadowColor = `rgba(56, 189, 248, ${coolIntensity * 0.6})`;
        ctx.shadowBlur = 15 * coolIntensity;
      }

      ctx.fillStyle = temperature > 50 ? '#dc2626' : '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(coasterX, coasterY, coasterW, coasterH, 9);
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Coaster temperature label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `Temp: ${temperature}°C (${SOLVENTS[solvent].nameEn})`,
        BEAKER.x + BEAKER.w / 2,
        coasterY + 12
      );

      // 3. STEAM PARTICLES WHEN HOT (> 45°C)
      if (temperature > 45 && Math.random() < (temperature - 40) * 0.008) {
        steamRef.current.push({
          x: BEAKER.x + 30 + Math.random() * (BEAKER.w - 60),
          y: BEAKER.liquidY,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -Math.random() * 1.5 - 0.8,
          radius: 4 + Math.random() * 5,
          alpha: 0.5,
        });
      }

      for (let i = steamRef.current.length - 1; i >= 0; i--) {
        const s = steamRef.current[i];
        s.x += s.vx + Math.sin(time * 2 + i) * 0.4;
        s.y += s.vy;
        s.radius += 0.15;
        s.alpha -= 0.008;

        if (s.alpha <= 0 || s.y < BEAKER.y - 40) {
          steamRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. BEAKER LIQUID & DISSOLUTION PHYSICS
      const solventConfig = SOLVENTS[solvent];
      const liquidBottom = BEAKER.y + BEAKER.h - 6;
      const liquidHeight = liquidBottom - BEAKER.liquidY;

      // Swirling whirlpool dip when stirring
      const whirlpoolDip = isStirring ? 24 : 0;
      const liquidGrad = ctx.createLinearGradient(0, BEAKER.liquidY, 0, liquidBottom);
      liquidGrad.addColorStop(0, solventConfig.colorTop);
      liquidGrad.addColorStop(1, solventConfig.colorBottom);

      // Clip inside beaker glass
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(BEAKER.x + 4, BEAKER.liquidY, BEAKER.w - 8, liquidHeight, [0, 0, 10, 10]);
      ctx.clip();

      ctx.fillStyle = liquidGrad;
      ctx.beginPath();
      ctx.moveTo(BEAKER.x + 4, liquidBottom);
      ctx.lineTo(BEAKER.x + 4, BEAKER.liquidY);
      ctx.quadraticCurveTo(
        BEAKER.x + BEAKER.w / 2,
        BEAKER.liquidY + whirlpoolDip,
        BEAKER.x + BEAKER.w - 4,
        BEAKER.liquidY
      );
      ctx.lineTo(BEAKER.x + BEAKER.w - 4, liquidBottom);
      ctx.closePath();
      ctx.fill();

      // Liquid reflection highlights
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.ellipse(BEAKER.x + 45, BEAKER.liquidY + liquidHeight / 2, 25, liquidHeight / 2 - 15, Math.PI / 10, 0, Math.PI * 2);
      ctx.fill();

      // Solute Dissolving Progress Calculation
      const soluble = isSoluble();
      const tempFactor = 0.5 + temperature / 50; // Higher heat = faster dissolve!

      if (isStirring && soluble && dissolveProgress < 1.0) {
        const step = 0.0035 * tempFactor;
        setDissolveProgress((prev) => {
          const next = Math.min(1.0, prev + step);
          if (next >= 1.0 && prev < 1.0) {
            ScienceAudio.playSuccess();
            setTestedCount((c) => c + 1);
            setStars((s) => Math.min(3, s + 1));
            setIsCompleted(true);
          }
          return next;
        });
      }

      // Solute Particle Physics & Rendering
      const particles = particlesRef.current;
      const floorY = liquidBottom - 8;

      particles.forEach((p) => {
        if (isStirring) {
          p.angle += 0.12 * tempFactor;
          const cx = BEAKER.x + BEAKER.w / 2;
          const cy = BEAKER.liquidY + liquidHeight / 2;
          p.x = cx + Math.cos(p.angle) * p.distance;
          p.y = cy + Math.sin(p.angle) * (p.distance * 0.45) + whirlpoolDip * 0.5;
          p.distance = Math.min(BEAKER.w * 0.42, p.distance + 0.15);
        } else {
          if (solute === 'sand' || solute === 'chalk' || !soluble) {
            if (p.y < floorY) {
              p.y += p.vy;
              p.vy = Math.min(2.5, p.vy + 0.1);
            } else {
              p.y = floorY + Math.sin(p.x) * 3;
            }
          } else if (p.y < floorY - 10) {
            p.y += p.vy * 0.6;
          }
        }

        let currentAlpha = p.alpha;
        let currentRadius = p.radius;
        if (soluble) {
          currentAlpha = Math.max(0, p.alpha * (1 - dissolveProgress));
          currentRadius = Math.max(0.4, p.radius * (1 - dissolveProgress * 0.85));
        }

        if (currentAlpha > 0.02) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = currentAlpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
          ctx.fill();

          if (isStirring && soluble && Math.random() < 0.08) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, currentRadius * 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1.0;
        }
      });

      // Sediment pile for insoluble sand
      if (solute === 'sand' && isAdded && !isStirring) {
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.moveTo(BEAKER.x + 30, floorY + 4);
        ctx.quadraticCurveTo(BEAKER.x + BEAKER.w / 2, floorY - 14, BEAKER.x + BEAKER.w - 30, floorY + 4);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore(); // Restore liquid clip

      // Water Splash Droplets
      for (let i = splashRef.current.length - 1; i >= 0; i--) {
        const sp = splashRef.current[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.25; // gravity
        sp.alpha -= 0.025;

        if (sp.alpha <= 0) {
          splashRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = `rgba(56, 189, 248, ${sp.alpha})`;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. BEAKER BOROSILICATE GLASS WALLS & GRADUATION MARKS
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(BEAKER.x - 8, BEAKER.y);
      ctx.lineTo(BEAKER.x, BEAKER.y + 10);
      ctx.lineTo(BEAKER.x, BEAKER.y + BEAKER.h - 8);
      ctx.arcTo(BEAKER.x, BEAKER.y + BEAKER.h, BEAKER.x + 10, BEAKER.y + BEAKER.h, 10);
      ctx.lineTo(BEAKER.x + BEAKER.w - 10, BEAKER.y + BEAKER.h);
      ctx.arcTo(BEAKER.x + BEAKER.w, BEAKER.y + BEAKER.h, BEAKER.x + BEAKER.w, BEAKER.y + BEAKER.h - 8, 10);
      ctx.lineTo(BEAKER.x + BEAKER.w, BEAKER.y + 10);
      ctx.lineTo(BEAKER.x + BEAKER.w + 6, BEAKER.y);
      ctx.stroke();

      // Outer glass contour shadow
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Graduation marks (50ml, 100ml, 150ml, 200ml)
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;

      for (let mark = 1; mark <= 4; mark++) {
        const markY = BEAKER.y + BEAKER.h - mark * 42;
        ctx.beginPath();
        ctx.moveTo(BEAKER.x + 4, markY);
        ctx.lineTo(BEAKER.x + 16, markY);
        ctx.stroke();
        ctx.fillText(`${mark * 50}ml`, BEAKER.x + 20, markY + 3);
      }

      // 6. MOVABLE GLASS STIRRING ROD
      ctx.save();
      const currentRodX = isDraggingRodRef.current ? rodPos.x : (isStirring ? BEAKER.x + BEAKER.w / 2 + Math.sin(time * 14) * 22 : rodPos.x);
      const currentRodY = isDraggingRodRef.current ? rodPos.y : (isStirring ? BEAKER.y + 60 : rodPos.y);

      ctx.translate(currentRodX, currentRodY);
      ctx.rotate(isStirring ? Math.cos(time * 14) * 0.12 : 0.08);

      // Rod shadow
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(8, -120);
      ctx.lineTo(-4, 140);
      ctx.stroke();

      // Rod glass shaft
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, -120);
      ctx.lineTo(-12, 135);
      ctx.stroke();

      // Blue-cyan refraction highlight
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -120);
      ctx.lineTo(-12, 135);
      ctx.stroke();

      ctx.restore();

      // 7. REALISTIC THERMOMETER
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(THERMO.x - 8, THERMO.y - 12, THERMO.w + 16, THERMO.h + 30, 10);
      ctx.fill();
      ctx.stroke();

      // Glass stem
      ctx.fillStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.roundRect(THERMO.x + 6, THERMO.y, 8, THERMO.h - 18, 4);
      ctx.fill();

      // Red mercury liquid column
      const mercuryH = ((temperature - 10) / 70) * (THERMO.h - 35);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(
        THERMO.x + 7.5,
        THERMO.y + (THERMO.h - 35) - mercuryH,
        5,
        mercuryH + 12,
        2
      );
      ctx.fill();

      // Thermometer bulb
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(THERMO.x + 10, THERMO.y + THERMO.h - 12, 9, 0, Math.PI * 2);
      ctx.fill();

      // Temperature text
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${temperature}°C`, THERMO.x + 10, THERMO.y + THERMO.h + 12);

      // 8. MOLECULAR DYNAMICS MICRO-LENS (On the right)
      if (showMicroLens) {
        ctx.save();
        // Outer card frame
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(MICROLENS.x, MICROLENS.y, MICROLENS.w, MICROLENS.h, 16);
        ctx.fill();
        ctx.stroke();

        // Card header
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          lang === 'ne' ? '🔬 आणविक संरचना (Micro Lens)' : '🔬 Molecular Dynamics',
          MICROLENS.x + MICROLENS.w / 2,
          MICROLENS.y + 24
        );

        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px sans-serif';
        ctx.fillText(
          lang === 'ne' ? `${SOLUTES[solute].nameNe} क्रिस्टल` : `${SOLUTES[solute].nameEn} Crystal`,
          MICROLENS.x + MICROLENS.w / 2,
          MICROLENS.y + 40
        );

        // Divider
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(MICROLENS.x + 12, MICROLENS.y + 48);
        ctx.lineTo(MICROLENS.x + MICROLENS.w - 12, MICROLENS.y + 48);
        ctx.stroke();

        // Animate and render molecules
        const molecules = moleculesRef.current;
        const speedMultiplier = 0.4 + (temperature / 50) * 1.5;

        molecules.forEach((m) => {
          if (m.type === 'solute') {
            const jitterX = (Math.random() - 0.5) * (0.8 + temperature * 0.04);
            const jitterY = (Math.random() - 0.5) * (0.8 + temperature * 0.04);

            let mAlpha = 1.0;
            if (isStirring && soluble) {
              mAlpha = Math.max(0.1, 1 - dissolveProgress);
            }

            ctx.fillStyle = m.color;
            ctx.globalAlpha = mAlpha;
            ctx.beginPath();
            ctx.arc(m.x + jitterX, m.y + jitterY, m.radius, 0, Math.PI * 2);
            ctx.fill();

            // Specular glint
            ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.beginPath();
            ctx.arc(m.x + jitterX - 2, m.y + jitterY - 2, m.radius * 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
          } else {
            // Free solvent water molecules
            m.x += m.vx * speedMultiplier;
            m.y += m.vy * speedMultiplier;

            if (m.x < MICROLENS.x + 20 || m.x > MICROLENS.x + MICROLENS.w - 20) m.vx *= -1;
            if (m.y < MICROLENS.y + 170 || m.y > MICROLENS.y + MICROLENS.h - 30) m.vy *= -1;

            ctx.fillStyle = m.color;
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
            ctx.fill();

            // Hydrogen ears (H2O)
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(m.x - 3, m.y - 3, 2, 0, Math.PI * 2);
            ctx.arc(m.x + 3, m.y - 3, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        // Dissolving force arrows
        if (isStirring && soluble) {
          ctx.strokeStyle = '#4ade80';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(MICROLENS.x + 60, MICROLENS.y + 110);
          ctx.quadraticCurveTo(MICROLENS.x + 45, MICROLENS.y + 145, MICROLENS.x + 70, MICROLENS.y + 175);
          ctx.stroke();

          ctx.moveTo(MICROLENS.x + MICROLENS.w - 60, MICROLENS.y + 110);
          ctx.quadraticCurveTo(MICROLENS.x + MICROLENS.w - 45, MICROLENS.y + 145, MICROLENS.x + MICROLENS.w - 70, MICROLENS.y + 175);
          ctx.stroke();

          ctx.fillStyle = '#4ade80';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(
            lang === 'ne' ? 'विलायकले तान्दैछ' : 'Dissolving force',
            MICROLENS.x + MICROLENS.w / 2,
            MICROLENS.y + 150
          );
        }

        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          lang === 'ne'
            ? 'पानीका अणुहरूले कणहरूलाई अलग गर्छन्'
            : 'Water molecules separate solute particles',
          MICROLENS.x + MICROLENS.w / 2,
          MICROLENS.y + MICROLENS.h - 12
        );
        ctx.restore();
      }

      // 9. DRAW DRAGGED SOLUTE (When student is dragging an item)
      if (draggedSolute) {
        ctx.save();
        const info = SOLUTES[draggedSolute.id];
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(draggedSolute.x, draggedSolute.y + 18, 22, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = info.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(draggedSolute.x - 16, draggedSolute.y - 16, 32, 32, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          draggedSolute.id === 'sugar' ? '🧊' : draggedSolute.id === 'salt' ? '🧂' : draggedSolute.id === 'sand' ? '🏖️' : '✏️',
          draggedSolute.x,
          draggedSolute.y + 6
        );
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [solute, solvent, temperature, isAdded, isStirring, dissolveProgress, lang, showMicroLens, draggedSolute, rodPos]);

  return (
    <SimulationLayout
      titleEn="Digital Dissolving Laboratory"
      titleNe="डिजिटल घुलनशीलता प्रयोगशाला"
      subject="Science"
      grade={4}
      chapter={1}
      stage={stage}
      onStageChange={setStage}
      lang={lang}
      onLangChange={setLang}
      stars={stars}
      isCompleted={isCompleted}
      onReset={handleReset}
      onBackToLibrary={onBackToLibrary}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          height: '100%',
          overflow: 'hidden',
          background: '#ffffff',
        }}
      >
        {/* ══════════════════════════════════════════════════════════════
            LEFT COLUMN: INTERACTIVE 2D CANVAS VIEWPORT
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Main 2D Canvas */}
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseDown={handlePointerDown}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
              cursor: 'grab',
            }}
          />

          {/* Top Floating Badges */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              display: 'flex',
              gap: '8px',
              zIndex: 10,
            }}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '6px 14px',
                borderRadius: '10px',
                color: '#38bdf8',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Droplet size={14} />
              <span>{lang === 'ne' ? 'घुलनशीलता प्रयोगशाला' : 'Solubility Lab'}</span>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(250, 204, 21, 0.3)',
                padding: '6px 14px',
                borderRadius: '10px',
                color: '#facc15',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Sparkles size={14} />
              <span>{lang === 'ne' ? `परीक्षण: ${testedCount}/4` : `Tested: ${testedCount}/4`}</span>
            </div>
          </div>

          {/* Top Right Tool Badges */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '16px',
              display: 'flex',
              gap: '8px',
              zIndex: 10,
            }}
          >
            <button
              onClick={() => setShowMicroLens((prev) => !prev)}
              style={{
                background: showMicroLens ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.85)',
                border: `1px solid ${showMicroLens ? '#38bdf8' : 'rgba(255, 255, 255, 0.15)'}`,
                color: showMicroLens ? '#38bdf8' : '#e2e8f0',
                padding: '6px 12px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Eye size={13} />
              <span>{showMicroLens ? (lang === 'ne' ? 'अणु दृश्य बन्द' : 'Hide Micro') : (lang === 'ne' ? 'अणु दृश्य' : 'Micro Lens')}</span>
            </button>

            <button
              onClick={handleToggleAudio}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                color: isMuted ? '#94a3b8' : '#38bdf8',
                padding: '6px 10px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            <button
              onClick={handleReset}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                color: '#e2e8f0',
                padding: '6px 10px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Bottom Floating Readout Dock */}
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: isStirring ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  border: `1px solid ${isStirring ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                {isStirring ? '🌀' : '🧪'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {solute ? `${SOLUTES[solute][lang === 'ne' ? 'nameNe' : 'nameEn']} in ${SOLVENTS[solvent][lang === 'ne' ? 'nameNe' : 'nameEn']}` : (lang === 'ne' ? 'वस्तु छनोट गर्नुहोस्' : 'Select a Solute')}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {isSoluble()
                    ? (lang === 'ne' ? `घुलनशील: ${Math.round(dissolveProgress * 100)}% घुलेको` : `Soluble: ${Math.round(dissolveProgress * 100)}% Dissolved`)
                    : (lang === 'ne' ? 'अघुलनशील (तल्लो भागमा थिग्रिन्छ)' : 'Insoluble (Precipitates at bottom)')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'ne' ? 'तापक्रम' : 'Temperature'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: temperature > 40 ? '#f43f5e' : '#38bdf8' }}>
                  {temperature}°C
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800' }}>
                  {lang === 'ne' ? 'समय' : 'Timer'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981', fontFamily: 'monospace' }}>
                  {formatTimer(timerSeconds)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: 380px PERSISTENT SIDEBAR
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            background: '#ffffff',
            borderLeft: '1px solid #e2e8f0',
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* 1. Discovery Station Header Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>🧪</span>
              <h4 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                {lang === 'ne' ? 'घुलनशीलता अनुसन्धान केन्द्र' : 'Dissolving Discovery Station'}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
              {lang === 'ne'
                ? 'विलेय वस्तु (Solute) र विलायक (Solvent) बीचको अन्तरक्रिया अध्ययन गर्नुहोस्। घोल्दा र तताउँदा कसरी छिटो घुल्छ जाँच्नुहोस्।'
                : 'Investigate how solute particles dissolve in solvents. Stirring and thermal energy accelerate molecular breakdown.'}
            </p>
          </div>

          {/* 2. Solute Selection Cards */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
              {lang === 'ne' ? '१. विलेय वस्तु छनोट (Solutes)' : '1. Select Solute'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {(['sugar', 'salt', 'sand', 'chalk'] as SoluteType[]).map((key) => {
                const s = SOLUTES[key];
                const active = solute === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectSolute(key)}
                    style={{
                      background: active ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${active ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: '10px',
                      padding: '10px 8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>
                      {key === 'sugar' ? '🧊' : key === 'salt' ? '🧂' : key === 'sand' ? '🏖️' : '✏️'}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: active ? '#38bdf8' : '#334155' }}>
                      {lang === 'ne' ? s.nameNe : s.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Solvent Selection Tabs */}
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', marginBottom: '8px' }}>
              {lang === 'ne' ? '२. विलायक माध्यम (Solvents)' : '2. Select Solvent'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {(['water', 'milk', 'oil'] as SolventType[]).map((key) => {
                const sv = SOLVENTS[key];
                const active = solvent === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectSolvent(key)}
                    style={{
                      background: active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${active ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: '8px',
                      padding: '8px 4px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>
                      {key === 'water' ? '💧' : key === 'milk' ? '🥛' : '🫒'}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: '600', color: active ? '#34d399' : '#94a3b8' }}>
                      {lang === 'ne' ? sv.nameNe : sv.nameEn.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Action Buttons (Add Solute & Stirring) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => handleAddSolute()}
              disabled={isAdded}
              style={{
                background: isAdded ? 'rgba(255, 255, 255, 0.05)' : 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 12px',
                color: isAdded ? '#64748b' : '#ffffff',
                fontWeight: '700',
                fontSize: '11px',
                cursor: isAdded ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>➕</span>
              <span>{isAdded ? (lang === 'ne' ? 'हालिसकियो' : 'Added') : (lang === 'ne' ? 'वस्तु हाल्नुहोस्' : 'Add Solute')}</span>
            </button>

            <button
              onClick={handleToggleStirring}
              style={{
                background: isStirring ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.12)',
                border: `1px solid ${isStirring ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)'}`,
                borderRadius: '10px',
                padding: '10px 12px',
                color: '#38bdf8',
                fontWeight: '700',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span>🌀</span>
              <span>{isStirring ? (lang === 'ne' ? 'घोलन बन्द' : 'Stop Mixing') : (lang === 'ne' ? 'घोल्नुहोस्' : 'Mix / Stir')}</span>
            </button>
          </div>

          {/* 5. Temperature Parameter Slider */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', color: '#e2e8f0' }}>
                <Flame size={13} color="#f43f5e" />
                <span>{lang === 'ne' ? 'तापक्रम नियन्त्रण' : 'Heat / Temperature'}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '800', color: temperature > 40 ? '#f43f5e' : '#38bdf8' }}>
                {temperature}°C
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              step={5}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: temperature > 40 ? '#f43f5e' : '#38bdf8',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginTop: '4px' }}>
              <span>10°C ({lang === 'ne' ? 'चिसो' : 'Cold'})</span>
              <span>45°C ({lang === 'ne' ? 'न्यानो' : 'Warm'})</span>
              <span>80°C ({lang === 'ne' ? 'तातो' : 'Hot'})</span>
            </div>
          </div>

          {/* 6. Dissolution Progress Meter */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#e2e8f0', marginBottom: '6px' }}>
              <span>{lang === 'ne' ? 'घुलन प्रगति' : 'Dissolution Progress'}</span>
              <span style={{ color: isSoluble() ? '#10b981' : '#f59e0b' }}>
                {isSoluble() ? `${Math.round(dissolveProgress * 100)}%` : (lang === 'ne' ? 'अघुलनशील' : 'Insoluble')}
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${isSoluble() ? Math.round(dissolveProgress * 100) : 0}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #38bdf8, #10b981)',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          </div>

          {/* 7. Curriculum Key Takeaway Card */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#38bdf8', marginBottom: '4px' }}>
              ℹ️ {lang === 'ne' ? 'पाठ्यक्रम निष्कर्ष (Key Takeaway)' : 'Curriculum Key Takeaway'}
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.45' }}>
              {lang === 'ne'
                ? 'चिनी र नुन पानीमा घुल्छन् (घुलनशील), तर बालुवा र चक घुल्दैनन् (अघुलनशील)। तातो पानी र घोल्ने क्रियाले घुलनशीलताको दर बढाउँछ।'
                : 'Sugar and salt dissolve in water (soluble), while sand and chalk do not (insoluble). Heat and stirring increase the dissolution rate.'}
            </p>
          </div>

          {/* 8. Complete Dissolving Lab & Quiz Button */}
          <button
            onClick={() => {
              ScienceAudio.playSuccess();
              setShowQuiz(true);
              setStars(3);
              setIsCompleted(true);
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              marginTop: 'auto',
            }}
          >
            <span>✓</span>
            <span>{lang === 'ne' ? 'घुलनशीलता प्रयोगशाला र प्रश्नोत्तरी पूरा गर्नुहोस्' : 'Complete Dissolving Lab & Quiz'}</span>
          </button>
        </div>

        {/* Quick Quiz Overlay Dialog */}
        {showQuiz && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '16px',
            }}
          >
            <div
              style={{
                background: '#0f172a',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '440px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                textAlign: 'center',
                color: '#0f172a',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  margin: '0 auto 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontSize: '22px',
                }}
              >
                💡
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>
                {lang === 'ne' ? 'घुलनशीलता ज्ञान परीक्षण' : 'Solubility Check'}
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                {lang === 'ne'
                  ? 'तातो पानीमा चिनी किन चिसो पानीमा भन्दा छिटो घुल्छ?'
                  : 'Why does sugar dissolve much faster in hot water than in cold water?'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={() => {
                    ScienceAudio.playSuccess();
                    setQuizAnswered(true);
                    setStars(3);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: quizAnswered ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${quizAnswered ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: '#0f172a',
                    fontSize: '12px',
                    fontWeight: '600',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    {lang === 'ne'
                      ? 'तातो पानीका अणुहरू छिटो चल्छन् र कणलाई छिटो तान्छन्'
                      : 'Hot water molecules move faster and separate particles quicker'}
                  </span>
                  {quizAnswered && <CheckCircle size={16} color="#10b981" />}
                </button>

                <button
                  onClick={() => {
                    ScienceAudio.playBeep(220, 0.25);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid #e2e8f0',
                    color: '#64748b',
                    fontSize: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {lang === 'ne'
                    ? 'किनभने तातो पानीमा नुन मिसिएको हुन्छ'
                    : 'Because hot water already contains salt'}
                </button>
              </div>

              <button
                onClick={() => setShowQuiz(false)}
                style={{
                  marginTop: '20px',
                  padding: '8px 24px',
                  borderRadius: '10px',
                  background: '#e2e8f0',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                {lang === 'ne' ? 'बन्द गर्नुहोस्' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    </SimulationLayout>
  );
};

export default DissolvingMaterialsLab;
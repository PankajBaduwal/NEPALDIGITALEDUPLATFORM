/**
 * FloatingSinkingLab.tsx
 * Simulation 1: Floating and Sinking 2D Laboratory (उत्रने र डुब्ने २डी प्रयोगशाला)
 * Grade 4 Science • Chapter 1: Scientific Learning (वैज्ञानिक सिकाइ)
 *
 * 100% Native HTML5 Canvas 2D Interactive Physics Simulation.
 * Features:
 * - Direct interactive Drag-and-Drop: grab items from the top shelf and drop them into the water tank!
 * - Also grab items directly from inside the water or tank floor to reposition or return them.
 * - 11 rich, realistically rendered objects matching the reference design:
 *   1. Apple (Floats, rho = 0.84 g/cm³)
 *   2. Stone (Sinks, rho = 2.65 g/cm³)
 *   3. Tennis Ball (Floats, rho = 0.38 g/cm³)
 *   4. Paperclip (Sinks, rho = 7.85 g/cm³)
 *   5. Banana (Floats, rho = 0.92 g/cm³)
 *   6. Wooden Stick (Floats, rho = 0.58 g/cm³)
 *   7. Seashell (Sinks, rho = 2.30 g/cm³)
 *   8. Candle (Floats, rho = 0.88 g/cm³)
 *   9. Clothespin (Floats, rho = 0.54 g/cm³)
 *   10. Wrench (Sinks, rho = 7.85 g/cm³)
 *   11. Ruby Gold Ring (Sinks, rho = 14.2 g/cm³)
 * - Fluid hydrodynamics: splash droplet particles, concentric surface ripples, rising aeration bubbles.
 * - Underwater refraction / tinting: submerged portions realistically shaded by translucent water.
 * - Harmonic buoyancy oscillations for floating objects; terminal drag sinking for dense objects.
 * - Rich Web Audio sound effects via ScienceAudio (splash, bubbles, glass plink, pop, whoosh).
 * - Bilingual labels (EN/NE), free exploration + optional hypothesis prediction challenge.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Sparkles, HelpCircle, RotateCcw, Droplets, Volume2, VolumeX, Eye, ArrowUp, ArrowDown, Check } from 'lucide-react';

export interface DraggableItem {
  id: string;
  nameEn: string;
  nameNe: string;
  density: number; // g/cm³; water = 1.00 g/cm³
  mass: number;    // grams
  volume: number;  // cm³
  floats: boolean;
  shelfIndex: number;
  width: number;
  height: number;
  // Dynamic state
  state: 'shelf' | 'dragging' | 'falling' | 'in_water' | 'settled' | 'returning';
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  targetRotation: number;
  bobPhase: number;
  userPrediction?: 'float' | 'sink';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  isBubble?: boolean;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export const FloatingSinkingLab: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showDensityGuide, setShowDensityGuide] = useState<boolean>(true);
  const [predictMode, setPredictMode] = useState<boolean>(false);
  const [pendingPredictItem, setPendingPredictItem] = useState<DraggableItem | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>('apple');
  const [liquidType, setLiquidType] = useState<'water' | 'saltwater' | 'oil' | 'honey'>('water');
  const hoveredItemRef = useRef<DraggableItem | null>(null);

  const liquidDensities = {
    water: 1.00,
    saltwater: 1.15,
    oil: 0.91,
    honey: 1.42,
  };
  const liquidDensity = liquidDensities[liquidType];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);

  // Simulation geometry constants (in virtual 960 x 520 canvas space)
  const CANVAS_WIDTH = 960;
  const CANVAS_HEIGHT = 520;

  const TANK = {
    left: 70,
    right: 890,
    top: 215,
    bottom: 495,
    waterLevel: 255,
    wallThickness: 6,
    glassColor: '#0ea5e9',
  };

  const SHELF = {
    x: 68,
    y: 16,
    w: 864,
    h: 68,
    itemCount: 11,
  };

  const AUDIO_BTN = {
    x: 22,
    y: 20,
    w: 36,
    h: 60,
  };

  const RESET_BTN = {
    x: 908,
    y: 468,
    w: 34,
    h: 34,
  };

  // Helper to compute resting shelf slot coordinate
  const getShelfSlotCoord = (index: number) => {
    const slotStep = (SHELF.w - 36) / (SHELF.itemCount - 1);
    const x = SHELF.x + 18 + index * slotStep;
    const y = SHELF.y + SHELF.h / 2;
    return { x, y };
  };

  // Master definitions of all 11 items matching the reference screenshot
  const createInitialItems = (): DraggableItem[] => {
    const itemsData = [
      { id: 'apple', nameEn: 'Fresh Apple', nameNe: 'स्याउ', density: 0.84, mass: 150, volume: 178, floats: true, width: 44, height: 44 },
      { id: 'stone', nameEn: 'River Stone', nameNe: 'ढुङ्गा', density: 2.65, mass: 185, volume: 70, floats: false, width: 48, height: 36 },
      { id: 'tennis_ball', nameEn: 'Tennis Ball', nameNe: 'टेनिस बल', density: 0.38, mass: 58, volume: 152, floats: true, width: 42, height: 42 },
      { id: 'paperclip', nameEn: 'Paperclip', nameNe: 'पेपरक्लिप', density: 7.85, mass: 1.5, volume: 0.2, floats: false, width: 42, height: 18 },
      { id: 'banana', nameEn: 'Banana', nameNe: 'केरा', density: 0.92, mass: 120, volume: 130, floats: true, width: 56, height: 36 },
      { id: 'wood_stick', nameEn: 'Wood Stick', nameNe: 'काठको हाँगा', density: 0.58, mass: 75, volume: 130, floats: true, width: 66, height: 26 },
      { id: 'seashell', nameEn: 'Seashell', nameNe: 'सिपी / शंख', density: 2.30, mass: 32, volume: 14, floats: false, width: 44, height: 38 },
      { id: 'candle', nameEn: 'Purple Candle', nameNe: 'मैनबत्ती', density: 0.88, mass: 45, volume: 51, floats: true, width: 24, height: 46 },
      { id: 'clothespin', nameEn: 'Clothespin', nameNe: 'काठको चिम्टा', density: 0.54, mass: 12, volume: 22, floats: true, width: 18, height: 46 },
      { id: 'wrench', nameEn: 'Metal Wrench', nameNe: 'रेन्च', density: 7.85, mass: 160, volume: 20, floats: false, width: 52, height: 18 },
      { id: 'ring', nameEn: 'Ruby Gold Ring', nameNe: 'सुनको औंठी', density: 14.2, mass: 18, volume: 1.3, floats: false, width: 38, height: 42 },
    ];

    return itemsData.map((data, index) => {
      const slot = getShelfSlotCoord(index);
      return {
        ...data,
        shelfIndex: index,
        state: 'shelf',
        x: slot.x,
        y: slot.y,
        vx: 0,
        vy: 0,
        rotation: 0,
        vRot: 0,
        targetRotation: 0,
        bobPhase: Math.random() * Math.PI * 2,
      };
    });
  };

  const [items, setItems] = useState<DraggableItem[]>(createInitialItems);
  const itemsRef = useRef<DraggableItem[]>([]);

  // Dragging state tracking
  const draggingIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync ref with state
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Audio mute sync
  useEffect(() => {
    ScienceAudio.setMuted(isMuted);
  }, [isMuted]);

  // Sound and particle spawners
  const spawnSplash = (x: number, y: number, intensity: number) => {
    ScienceAudio.playSplash();
    ScienceAudio.playLiquidDrop();

    // Splash droplet particles shooting up & outward
    const count = Math.round(18 * intensity);
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 5 * intensity,
        vy: -Math.random() * 6 * intensity - 1.5,
        radius: Math.random() * 2.8 + 1.2,
        alpha: 0.95,
        color: Math.random() > 0.4 ? '#67e8f9' : '#ffffff',
      });
    }

    // Expanding ripple rings on water line
    ripplesRef.current.push({
      x,
      y,
      radius: 6,
      maxRadius: 40 + intensity * 25,
      alpha: 0.85,
    });
  };

  const spawnBubbles = (x: number, y: number, count = 3) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -Math.random() * 1.8 - 0.8,
        radius: Math.random() * 2.8 + 1.5,
        alpha: 0.75,
        color: 'rgba(255, 255, 255, 0.8)',
        isBubble: true,
      });
    }
  };

  // Reset all simulation objects to shelf
  const handleReset = () => {
    ScienceAudio.playWhoosh();
    setItems(createInitialItems());
    particlesRef.current = [];
    ripplesRef.current = [];
    setPendingPredictItem(null);
    hoveredItemRef.current = null;
    setSelectedItemId('apple');
    setStars(0);
    setIsCompleted(false);
  };

  // Drop or inspect item selected from the right sidebar catalog
  const handleDropItemFromCatalog = (id: string) => {
    setSelectedItemId(id);
    ScienceAudio.playPop();
    const target = itemsRef.current.find((it) => it.id === id);
    if (target) {
      if (target.state === 'shelf') {
        if (predictMode && !target.userPrediction) {
          setPendingPredictItem(target);
          return;
        }
        target.state = 'falling';
        target.x = TANK.left + 90 + Math.random() * (TANK.right - TANK.left - 180);
        target.y = TANK.waterLevel - 45;
        target.vx = (Math.random() - 0.5) * 1.5;
        target.vy = 1.2;
      }
    }
  };

  // Speak voice explanation or toggle audio
  const handleToggleAudio = () => {
    if (isMuted) {
      setIsMuted(false);
      ScienceAudio.playClick();
      ScienceAudio.speak(
        lang === 'ne'
          ? 'पानी भन्दा कम घनत्व भएका वस्तुहरू उत्रन्छन्, र बढी घनत्व भएका वस्तुहरू डुब्छन्!'
          : 'Objects less dense than water float, while denser objects sink!',
        lang
      );
    } else {
      setIsMuted(true);
    }
  };

  // Convert client viewport coordinates to canvas virtual coordinate space
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Hit test an item at coordinate (x, y)
  const findItemAt = (x: number, y: number): DraggableItem | null => {
    const list = itemsRef.current;
    // Check in reverse order so top/dragged items get picked first
    for (let i = list.length - 1; i >= 0; i--) {
      const it = list[i];
      const hitRadius = Math.max(it.width, it.height) / 2 + 10;
      const dx = x - it.x;
      const dy = y - it.y;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        return it;
      }
    }
    return null;
  };

  // Handle pointer down (grab item or click button)
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCanvasCoords(e);
    lastPointerPosRef.current = coords;

    // Check Audio Button hit
    if (
      coords.x >= AUDIO_BTN.x &&
      coords.x <= AUDIO_BTN.x + AUDIO_BTN.w &&
      coords.y >= AUDIO_BTN.y &&
      coords.y <= AUDIO_BTN.y + AUDIO_BTN.h
    ) {
      handleToggleAudio();
      return;
    }

    // Check Reset Button hit
    if (
      coords.x >= RESET_BTN.x &&
      coords.x <= RESET_BTN.x + RESET_BTN.w &&
      coords.y >= RESET_BTN.y &&
      coords.y <= RESET_BTN.y + RESET_BTN.h
    ) {
      handleReset();
      return;
    }

    // Check Item hit
    const hit = findItemAt(coords.x, coords.y);
    if (hit) {
      // If prediction mode is active and item is coming from shelf, prompt prediction first
      if (predictMode && hit.state === 'shelf' && !hit.userPrediction) {
        ScienceAudio.playPop();
        setPendingPredictItem(hit);
        return;
      }

      ScienceAudio.playPop();
      draggingIdRef.current = hit.id;
      dragOffsetRef.current = { x: coords.x - hit.x, y: coords.y - hit.y };

      // Update item state to dragging in itemsRef directly (zero React lag)
      const targetItem = itemsRef.current.find((it) => it.id === hit.id);
      if (targetItem) {
        targetItem.state = 'dragging';
        targetItem.vx = 0;
        targetItem.vy = 0;
        targetItem.targetRotation = 0;
      }
    }
  };

  // Helper for computing in-water target rotation
  const getInWaterTargetRotation = (id: string): number => {
    switch (id) {
      case 'candle':
      case 'clothespin':
        return Math.PI / 2;
      case 'ring':
        return -Math.PI / 8;
      case 'seashell':
        return -0.15;
      case 'apple':
        return 0.05;
      default:
        return 0;
    }
  };

  // Handle pointer move (drag item or hover detection - 100% GPU / direct ref update)
  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCanvasCoords(e);
    const draggingId = draggingIdRef.current;

    if (draggingId) {
      const vx = (coords.x - lastPointerPosRef.current.x) * 0.4;
      const vy = (coords.y - lastPointerPosRef.current.y) * 0.4;
      lastPointerPosRef.current = coords;

      const item = itemsRef.current.find((it) => it.id === draggingId);
      if (item) {
        item.x = Math.max(30, Math.min(CANVAS_WIDTH - 30, coords.x - dragOffsetRef.current.x));
        item.y = Math.max(30, Math.min(CANVAS_HEIGHT - 30, coords.y - dragOffsetRef.current.y));
        item.vx = vx;
        item.vy = vy;
      }
    } else {
      // Hover detection stored in ref to prevent React re-renders
      hoveredItemRef.current = findItemAt(coords.x, coords.y);
    }
  };

  // Handle pointer up (drop item)
  const handlePointerUp = () => {
    const draggingId = draggingIdRef.current;
    if (!draggingId) return;

    draggingIdRef.current = null;

    const item = itemsRef.current.find((it) => it.id === draggingId);
    if (item) {
      // Check if dropped inside water tank boundaries
      const insideTankX = item.x >= TANK.left - 20 && item.x <= TANK.right + 20;
      const insideTankY = item.y >= TANK.top - 40 && item.y <= TANK.bottom + 20;

      if (insideTankX && insideTankY) {
        const inWaterRot = getInWaterTargetRotation(item.id);
        const isAboveWater = item.y < TANK.waterLevel;
        if (isAboveWater) {
          // Free fall in air towards water
          item.state = 'falling';
          item.vy = Math.max(2.0, item.vy + 1.5);
          item.targetRotation = inWaterRot;
        } else {
          // Dropped directly into water
          spawnSplash(item.x, TANK.waterLevel, item.floats ? 0.9 : 1.4);
          item.state = 'in_water';
          item.vy = item.floats ? -1.5 : 2.0;
          item.targetRotation = inWaterRot;
        }
      } else {
        // Dropped outside tank -> return smoothly to shelf
        ScienceAudio.playWhoosh();
        item.state = 'returning';
        item.vx = 0;
        item.vy = 0;
        item.targetRotation = 0;
      }
    }

    // Sync state once on release so top badges update
    setItems([...itemsRef.current]);
  };

  // Global window listeners for drag smoothness across frame bounds
  useEffect(() => {
    const handleGlobalPointerMove = (e: MouseEvent | TouchEvent) => {
      const draggingId = draggingIdRef.current;
      if (!draggingId) return;
      const coords = getCanvasCoords(e);
      const vx = (coords.x - lastPointerPosRef.current.x) * 0.4;
      const vy = (coords.y - lastPointerPosRef.current.y) * 0.4;
      lastPointerPosRef.current = coords;

      const item = itemsRef.current.find((it) => it.id === draggingId);
      if (item) {
        item.x = Math.max(30, Math.min(CANVAS_WIDTH - 30, coords.x - dragOffsetRef.current.x));
        item.y = Math.max(30, Math.min(CANVAS_HEIGHT - 30, coords.y - dragOffsetRef.current.y));
        item.vx = vx;
        item.vy = vy;
      }
    };

    const handleGlobalPointerUp = () => {
      if (draggingIdRef.current) {
        handlePointerUp();
      }
    };

    window.addEventListener('mousemove', handleGlobalPointerMove);
    window.addEventListener('mouseup', handleGlobalPointerUp);
    window.addEventListener('touchmove', handleGlobalPointerMove);
    window.addEventListener('touchend', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalPointerMove);
      window.removeEventListener('mouseup', handleGlobalPointerUp);
      window.removeEventListener('touchmove', handleGlobalPointerMove);
      window.removeEventListener('touchend', handleGlobalPointerUp);
    };
  }, []);

  // Confirm prediction in hypothesis mode
  const handleConfirmPrediction = (prediction: 'float' | 'sink') => {
    if (!pendingPredictItem) return;

    const item = pendingPredictItem;
    const isCorrect = (item.floats && prediction === 'float') || (!item.floats && prediction === 'sink');

    if (isCorrect) {
      ScienceAudio.playSuccess();
      setStars((prev) => Math.min(3, prev + 1));
    } else {
      ScienceAudio.playBeep(220, 0.25);
    }

    // Drop item from air into tank
    const placedCount = items.filter((it) => it.state !== 'shelf' && it.state !== 'returning').length;
    const dropX = TANK.left + 70 + (placedCount % 7) * 95;
    const dropY = TANK.top - 20;

    setItems((prev) =>
      prev.map((it) =>
        it.id === item.id
          ? {
            ...it,
            state: 'falling',
            userPrediction: prediction,
            x: dropX,
            y: dropY,
            vy: 2.2,
          }
          : it
      )
    );

    setPendingPredictItem(null);

    // Check completion
    const tested = items.filter((it) => it.state !== 'shelf').length + 1;
    if (tested >= items.length) {
      setIsCompleted(true);
      setStage('understand');
    }
  };

  // Vector render functions for the 11 items - Ultra HD Cartoon Edition (Lag-Free 60 FPS)
  const renderItemArtwork = (
    ctx: CanvasRenderingContext2D,
    item: DraggableItem,
    isSubmerged: boolean = false
  ) => {
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rotation);

    // Dynamic scale boost for rich, tangible cartoon presentation (crisp & high-definition)
    ctx.scale(1.25, 1.25);

    // Fast, crisp cartoon contact shadow (zero blur, 100% GPU-accelerated)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.14)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 16, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ensure shadow and filter are completely cleared for 60 FPS performance
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    switch (item.id) {
      case 'apple': {
        // Red Apple with leaf & stem - Ultra HD Cartoon
        const grad = ctx.createRadialGradient(-6, -6, 2, 0, 4, 24);
        grad.addColorStop(0, '#fca5a5');
        grad.addColorStop(0.25, '#ef4444');
        grad.addColorStop(0.7, '#dc2626');
        grad.addColorStop(0.92, '#991b1b');
        grad.addColorStop(1, '#450a0a');
        ctx.fillStyle = grad;

        // Smooth cartoon apple body shape with top & bottom indent
        ctx.beginPath();
        ctx.moveTo(0, -11);
        ctx.bezierCurveTo(20, -14, 26, 6, 14, 19);
        ctx.bezierCurveTo(5, 23, -5, 23, -14, 19);
        ctx.bezierCurveTo(-26, 6, -20, -14, 0, -11);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Primary glossy reflection highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.beginPath();
        ctx.ellipse(-9, -5, 8, 3.5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Secondary subtle rim light
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.arc(-10, -3, 3, 0, Math.PI * 2);
        ctx.fill();

        // Curved brown stem with woody ring
        ctx.strokeStyle = '#573315';
        ctx.lineWidth = 2.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.quadraticCurveTo(3, -19, 7, -22);
        ctx.stroke();

        // Green leaf with vein
        const leafGrad = ctx.createLinearGradient(4, -20, 16, -14);
        leafGrad.addColorStop(0, '#4ade80');
        leafGrad.addColorStop(1, '#15803d');
        ctx.fillStyle = leafGrad;
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(9, -18, 7, 3.5, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // Leaf vein
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(3, -17);
        ctx.lineTo(14, -19);
        ctx.stroke();
        break;
      }

      case 'stone': {
        // Smooth river pebble - Ultra HD Cartoon
        const stoneGrad = ctx.createRadialGradient(-7, -7, 2, 0, 0, 24);
        stoneGrad.addColorStop(0, '#f1f5f9');
        stoneGrad.addColorStop(0.3, '#cbd5e1');
        stoneGrad.addColorStop(0.7, '#64748b');
        stoneGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = stoneGrad;

        ctx.beginPath();
        ctx.moveTo(-24, 2);
        ctx.bezierCurveTo(-22, -15, 12, -18, 24, -2);
        ctx.bezierCurveTo(26, 14, -9, 20, -24, 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Pebble smooth highlight contours
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(-5, -6, 13, Math.PI * 1.1, Math.PI * 1.7);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(-7, -4, 8, Math.PI * 1.05, Math.PI * 1.6);
        ctx.stroke();

        // Texture specks
        ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
        ctx.beginPath();
        ctx.arc(8, 4, 1.2, 0, Math.PI * 2);
        ctx.arc(14, -6, 1, 0, Math.PI * 2);
        ctx.arc(-10, 8, 1.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'tennis_ball': {
        // Chartreuse neon tennis ball - Ultra HD Cartoon
        const tennisGrad = ctx.createRadialGradient(-7, -7, 2, 0, 0, 22);
        tennisGrad.addColorStop(0, '#fef9c3');
        tennisGrad.addColorStop(0.3, '#d9f99d');
        tennisGrad.addColorStop(0.7, '#84cc16');
        tennisGrad.addColorStop(1, '#3f6212');
        ctx.fillStyle = tennisGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 21, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#365314';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Tennis ball curved white felt seams with depth
        ctx.strokeStyle = 'rgba(40, 70, 15, 0.35)';
        ctx.lineWidth = 3.6;
        // Left arc shadow
        ctx.beginPath();
        ctx.arc(-14, 0, 14, -Math.PI / 2.2, Math.PI / 2.2);
        ctx.stroke();
        // Right arc shadow
        ctx.beginPath();
        ctx.arc(14, 0, 14, Math.PI - Math.PI / 2.2, Math.PI + Math.PI / 2.2);
        ctx.stroke();

        // White rubber seams
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(-14, 0, 14, -Math.PI / 2.2, Math.PI / 2.2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(14, 0, 14, Math.PI - Math.PI / 2.2, Math.PI + Math.PI / 2.2);
        ctx.stroke();
        break;
      }

      case 'paperclip': {
        // Chrome steel wire paperclip - Ultra HD Cartoon
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer dark steel outline
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.moveTo(13, -5);
        ctx.lineTo(-13, -5);
        ctx.arc(-13, 1, 6, -Math.PI / 2, Math.PI / 2, true);
        ctx.lineTo(15, 7);
        ctx.arc(15, 0, 7, Math.PI / 2, -Math.PI / 2, true);
        ctx.lineTo(-9, -7);
        ctx.arc(-9, -2, 5, -Math.PI / 2, Math.PI / 2, true);
        ctx.lineTo(9, 3);
        ctx.stroke();

        // Inner chrome silver wire
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(13, -5);
        ctx.lineTo(-13, -5);
        ctx.arc(-13, 1, 6, -Math.PI / 2, Math.PI / 2, true);
        ctx.lineTo(15, 7);
        ctx.arc(15, 0, 7, Math.PI / 2, -Math.PI / 2, true);
        ctx.lineTo(-9, -7);
        ctx.arc(-9, -2, 5, -Math.PI / 2, Math.PI / 2, true);
        ctx.lineTo(9, 3);
        ctx.stroke();

        // White specular highlights
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(11, -5);
        ctx.lineTo(-11, -5);
        ctx.moveTo(-7, 7);
        ctx.lineTo(13, 7);
        ctx.stroke();
        break;
      }

      case 'banana': {
        // Curved yellow cartoon banana - Ultra HD Cartoon
        const bananaGrad = ctx.createLinearGradient(-28, -16, 28, 16);
        bananaGrad.addColorStop(0, '#fef9c3');
        bananaGrad.addColorStop(0.35, '#facc15');
        bananaGrad.addColorStop(0.75, '#eab308');
        bananaGrad.addColorStop(1, '#ca8a04');
        ctx.fillStyle = bananaGrad;

        // Banana curved crescent
        ctx.beginPath();
        ctx.moveTo(-28, 13);
        ctx.quadraticCurveTo(-15, -18, 22, -11);
        ctx.quadraticCurveTo(28, -6, 26, 0);
        ctx.quadraticCurveTo(4, -4, -22, 17);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Banana facet ridge lines
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-24, 12);
        ctx.quadraticCurveTo(-11, -11, 20, -8);
        ctx.stroke();

        // Glossy banana highlight streak
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-18, -3);
        ctx.quadraticCurveTo(-7, -13, 14, -8);
        ctx.stroke();

        // Green-tinged stalk base & dark blossom tips
        ctx.fillStyle = '#65a30d';
        ctx.beginPath();
        ctx.arc(-28, 13, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(-30, 15, 2.5, 0, Math.PI * 2);
        ctx.arc(26, -3, 2.8, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'wood_stick': {
        // Wood Branch - Ultra HD Cartoon
        const woodGrad = ctx.createLinearGradient(0, -10, 0, 10);
        woodGrad.addColorStop(0, '#b45309');
        woodGrad.addColorStop(0.35, '#78350f');
        woodGrad.addColorStop(0.8, '#451a03');
        woodGrad.addColorStop(1, '#270e01');
        ctx.fillStyle = woodGrad;

        // Horizontal branch cylinder
        ctx.beginPath();
        ctx.roundRect(-32, -9, 64, 18, 4);
        ctx.fill();
        ctx.strokeStyle = '#270e01';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Bark striation contours
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-18, -4);
        ctx.lineTo(18, -4);
        ctx.moveTo(-12, 3);
        ctx.lineTo(24, 3);
        ctx.stroke();

        // Left cut oval end with growth rings
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(-32, 0, 4.5, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(-32, 0, 2.5, 5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Cut twig stub sticking out on top
        ctx.fillStyle = woodGrad;
        ctx.beginPath();
        ctx.moveTo(6, -9);
        ctx.lineTo(13, -20);
        ctx.lineTo(20, -18);
        ctx.lineTo(14, -9);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#270e01';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Cut twig top face
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(16.5, -19, 3.5, 2, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Cute green leaf on twig
        ctx.fillStyle = '#22c55e';
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(22, -19, 5, 2.5, -Math.PI / 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'seashell': {
        // Scallop fan shell - Ultra HD Cartoon
        const shellGrad = ctx.createRadialGradient(0, 15, 2, 0, 0, 26);
        shellGrad.addColorStop(0, '#fff7ed');
        shellGrad.addColorStop(0.3, '#ffedd5');
        shellGrad.addColorStop(0.65, '#ea580c');
        shellGrad.addColorStop(1, '#7c2d12');
        ctx.fillStyle = shellGrad;

        // Fan shape
        ctx.beginPath();
        ctx.moveTo(0, 16);
        ctx.lineTo(-20, -4);
        ctx.quadraticCurveTo(-14, -20, 0, -20);
        ctx.quadraticCurveTo(14, -20, 20, -4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#7c2d12';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Scallop radial ridges with golden highlights
        for (let a = -0.75; a <= 0.75; a += 0.18) {
          ctx.strokeStyle = 'rgba(254, 215, 170, 0.85)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(0, 16);
          ctx.lineTo(Math.sin(a) * 23, -Math.cos(a) * 21);
          ctx.stroke();
        }

        // Pearlescent sheen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(0, -6, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'candle': {
        // Purple wax candle - Ultra HD Cartoon
        const candleGrad = ctx.createLinearGradient(-11, 0, 11, 0);
        candleGrad.addColorStop(0, '#d8b4fe');
        candleGrad.addColorStop(0.3, '#c084fc');
        candleGrad.addColorStop(0.7, '#9333ea');
        candleGrad.addColorStop(1, '#581c87');
        ctx.fillStyle = candleGrad;

        // Cylinder body
        ctx.beginPath();
        ctx.roundRect(-10, -19, 20, 38, 3.5);
        ctx.fill();
        ctx.strokeStyle = '#3b0764';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Translucent wax drip accents
        ctx.fillStyle = '#e9d5ff';
        ctx.beginPath();
        ctx.roundRect(-7, -19, 4, 12, 2);
        ctx.roundRect(3, -19, 3.5, 8, 2);
        ctx.fill();

        // Top melted wax ellipse
        ctx.fillStyle = '#f3e8ff';
        ctx.beginPath();
        ctx.ellipse(0, -19, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Cotton wick
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(0, -19);
        ctx.lineTo(0, -26);
        ctx.stroke();

        // Warm flickering flame if in air / shelf
        if (!isSubmerged) {
          // Flame outer halo glow
          ctx.fillStyle = 'rgba(249, 115, 22, 0.25)';
          ctx.beginPath();
          ctx.arc(0, -31, 10, 0, Math.PI * 2);
          ctx.fill();

          // Golden outer flame
          const flameGrad = ctx.createRadialGradient(0, -30, 1, 0, -30, 8);
          flameGrad.addColorStop(0, '#ffffff');
          flameGrad.addColorStop(0.25, '#fef08a');
          flameGrad.addColorStop(0.65, '#f59e0b');
          flameGrad.addColorStop(1, '#ef4444');
          ctx.fillStyle = flameGrad;
          ctx.beginPath();
          ctx.ellipse(0, -30, 4.2, 7.5, 0, 0, Math.PI * 2);
          ctx.fill();

          // Inner white-hot flame core
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(0, -28.5, 2, 4, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'clothespin': {
        // Wooden clothes peg - Ultra HD Cartoon
        const pegGrad = ctx.createLinearGradient(-9, 0, 9, 0);
        pegGrad.addColorStop(0, '#fde68a');
        pegGrad.addColorStop(0.4, '#d97706');
        pegGrad.addColorStop(0.8, '#b45309');
        pegGrad.addColorStop(1, '#78350f');
        ctx.fillStyle = pegGrad;

        // Two wooden prongs
        ctx.beginPath();
        ctx.roundRect(-8, -21, 16, 42, 2.5);
        ctx.fill();
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Clamping notch slit
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-1.8, -21, 3.6, 26);

        // Metal coil spring loop
        const metalGrad = ctx.createRadialGradient(-1, 2, 1, 0, 2, 6);
        metalGrad.addColorStop(0, '#f8fafc');
        metalGrad.addColorStop(0.5, '#94a3b8');
        metalGrad.addColorStop(1, '#475569');
        ctx.fillStyle = metalGrad;
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;
      }

      case 'wrench': {
        // Chrome steel open-ended spanner - Ultra HD Cartoon
        const wrenchGrad = ctx.createLinearGradient(-26, 0, 26, 0);
        wrenchGrad.addColorStop(0, '#cbd5e1');
        wrenchGrad.addColorStop(0.4, '#f8fafc');
        wrenchGrad.addColorStop(0.7, '#94a3b8');
        wrenchGrad.addColorStop(1, '#475569');
        ctx.fillStyle = wrenchGrad;

        // Handle beam
        ctx.beginPath();
        ctx.roundRect(-18, -4.5, 36, 9, 2.5);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Recessed center beam indent
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-12, -1.8, 24, 3.6);

        // Left open U-jaws
        ctx.fillStyle = wrenchGrad;
        ctx.beginPath();
        ctx.arc(-20, 0, 9, Math.PI / 4, -Math.PI / 4, true);
        ctx.lineTo(-15, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right box head
        ctx.beginPath();
        ctx.arc(20, 0, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(20, 0, 3.8, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'ring': {
        // Ruby gold ring - Ultra HD Cartoon
        const goldGrad = ctx.createRadialGradient(-5, 4, 3, 0, 8, 18);
        goldGrad.addColorStop(0, '#fef9c3');
        goldGrad.addColorStop(0.35, '#facc15');
        goldGrad.addColorStop(0.75, '#ca8a04');
        goldGrad.addColorStop(1, '#78350f');

        // Gold band (torus ring) with bold cartoon stroke
        ctx.strokeStyle = goldGrad;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(0, 4, 16, 13, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, 4, 19, 16, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Gem setting prongs
        ctx.fillStyle = '#ca8a04';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-7, -9, 14, 5, 2);
        ctx.fill();
        ctx.stroke();

        // Ruby gemstone (faceted cushion)
        const rubyGrad = ctx.createRadialGradient(-3, -13, 1, 0, -11, 10);
        rubyGrad.addColorStop(0, '#fda4af');
        rubyGrad.addColorStop(0.3, '#f43f5e');
        rubyGrad.addColorStop(0.7, '#e11d48');
        rubyGrad.addColorStop(1, '#4c0519');
        ctx.fillStyle = rubyGrad;
        ctx.beginPath();
        ctx.moveTo(-9, -15);
        ctx.lineTo(9, -15);
        ctx.lineTo(11, -7);
        ctx.lineTo(0, -3);
        ctx.lineTo(-11, -7);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#4c0519';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Gem facet highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.moveTo(-5, -14);
        ctx.lineTo(2, -14);
        ctx.lineTo(0, -10);
        ctx.closePath();
        ctx.fill();

        // 4-point sparkle glint
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        const gx = -4, gy = -13;
        ctx.moveTo(gx, gy - 4);
        ctx.lineTo(gx + 1, gy - 1);
        ctx.lineTo(gx + 4, gy);
        ctx.lineTo(gx + 1, gy + 1);
        ctx.lineTo(gx, gy + 4);
        ctx.lineTo(gx - 1, gy + 1);
        ctx.lineTo(gx - 4, gy);
        ctx.lineTo(gx - 1, gy - 1);
        ctx.closePath();
        ctx.fill();
        break;
      }
    }

    ctx.restore();
  };

  // 60 FPS Physics & Render Loop (Ultra HD High-DPI Retina Scaling)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina / High-DPI buffer scaling (capped at 2x for smooth, 60 FPS performance)
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(CANVAS_WIDTH * dpr) || canvas.height !== Math.round(CANVAS_HEIGHT * dpr)) {
      canvas.width = Math.round(CANVAS_WIDTH * dpr);
      canvas.height = Math.round(CANVAS_HEIGHT * dpr);
    }

    let time = 0;

    const render = () => {
      time += 0.03;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 1. Draw Clean White Laboratory Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Subtle Lab Grid Lines
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < CANVAS_WIDTH; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let gy = 0; gy < CANVAS_HEIGHT; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(CANVAS_WIDTH, gy);
        ctx.stroke();
      }

      // 2. Draw Top Item Shelf Card (Crisp White Educational Card)
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(SHELF.x, SHELF.y, SHELF.w, SHELF.h, 16);
      ctx.fill();
      ctx.stroke();

      // Reset any shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Draw Audio Button on Left
      ctx.fillStyle = isMuted ? '#f1f5f9' : '#e0f2fe';
      ctx.strokeStyle = isMuted ? '#cbd5e1' : '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(AUDIO_BTN.x, AUDIO_BTN.y, AUDIO_BTN.w, AUDIO_BTN.h, 8);
      ctx.fill();
      ctx.stroke();

      // Speaker Icon in Audio Button
      ctx.fillStyle = isMuted ? '#64748b' : '#38bdf8';
      ctx.beginPath();
      const ax = AUDIO_BTN.x + AUDIO_BTN.w / 2;
      const ay = AUDIO_BTN.y + AUDIO_BTN.h / 2;
      // Speaker horn
      ctx.moveTo(ax - 7, ay - 4);
      ctx.lineTo(ax - 3, ay - 4);
      ctx.lineTo(ax + 3, ay - 9);
      ctx.lineTo(ax + 3, ay + 9);
      ctx.lineTo(ax - 3, ay + 4);
      ctx.lineTo(ax - 7, ay + 4);
      ctx.closePath();
      ctx.fill();
      if (!isMuted) {
        // Sound waves
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ax + 3, ay, 6, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(ax + 3, ay, 10, -Math.PI / 3.5, Math.PI / 3.5);
        ctx.stroke();
      } else {
        // Mute diagonal line
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ax - 6, ay - 6);
        ctx.lineTo(ax + 8, ay + 8);
        ctx.stroke();
      }

      // Draw Right Chevron Arrow `>` Button on shelf
      const rx = SHELF.x + SHELF.w - 28;
      const ry = SHELF.y + SHELF.h / 2;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(rx - 3, ry - 6);
      ctx.lineTo(rx + 3, ry);
      ctx.lineTo(rx - 3, ry + 6);
      ctx.stroke();

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // 3. Draw Shelf Coasters and Placeholders
      for (let s = 0; s < SHELF.itemCount; s++) {
        const slot = getShelfSlotCoord(s);
        const coasterGrad = ctx.createRadialGradient(slot.x, slot.y, 8, slot.x, slot.y, 25);
        coasterGrad.addColorStop(0, '#ffffff');
        coasterGrad.addColorStop(0.8, '#f1f5f9');
        coasterGrad.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = coasterGrad;
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(slot.x, slot.y, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      itemsRef.current.forEach((item) => {
        if (item.state !== 'shelf') {
          const slot = getShelfSlotCoord(item.shelfIndex);
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(slot.x, slot.y, 18, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // 4. Update Physics for All Items
      itemsRef.current.forEach((item) => {
        const isFloats = item.density < liquidDensity;
        // Physics for items in transit
        if (item.state === 'falling') {
          item.vy += 0.45; // Gravity in air
          item.y += item.vy;
          item.x += item.vx;
          item.rotation += item.vRot;

          // Water entry detection
          if (item.y >= TANK.waterLevel) {
            spawnSplash(item.x, TANK.waterLevel, isFloats ? 0.9 : 1.3);
            item.state = 'in_water';
            item.vy = isFloats ? item.vy * 0.3 : Math.min(2.2, item.vy * 0.6);
            if (isFloats) {
              // Orient floating elongated objects horizontally (candle, clothespin)
              if (item.id === 'candle' || item.id === 'clothespin') {
                item.targetRotation = Math.PI / 2;
              }
            }
          }
        } else if (item.state === 'in_water') {
          // Smooth rotation towards horizontal orientation for floating elongated items
          if (item.targetRotation !== 0) {
            item.rotation += (item.targetRotation - item.rotation) * 0.08;
          }

          if (isFloats) {
            // Archimedes buoyant restoring force towards equilibrium water line
            // Submersion depth proportional to density ratio
            const subRatio = Math.min(0.95, item.density / liquidDensity);
            const targetEquilibriumY = TANK.waterLevel + (subRatio - 0.5) * 24;
            const dy = targetEquilibriumY - item.y;
            item.vy += dy * 0.08;   // Spring restoring force
            item.vy *= 0.86;        // Fluid damping
            item.y += item.vy;

            // Rest detection
            if (Math.abs(item.vy) < 0.15 && Math.abs(dy) < 1.0) {
              item.state = 'settled';
            }
          } else {
            // Sinking through water with terminal drag
            const sinkAcc = Math.min(0.2, (item.density - liquidDensity) * 0.04);
            item.vy += sinkAcc;
            item.vy = Math.min(item.vy, 2.2); // Terminal drag velocity
            item.y += item.vy;

            // Rising bubbles emitted periodically while descending
            if (Math.random() < 0.12) {
              spawnBubbles(item.x, item.y, 2);
            }

            // Hit glass floor of tank
            const floorLimit = TANK.bottom - item.height / 2 - 4;
            if (item.y >= floorLimit) {
              item.y = floorLimit;
              item.vy = 0;
              item.state = 'settled';
              ScienceAudio.playPlink();
              spawnBubbles(item.x, item.y, 4);
            }
          }
        } else if (item.state === 'settled') {
          if (isFloats) {
            // Gentle ambient harmonic wave bobbing
            item.bobPhase += 0.035;
            const subRatio = Math.min(0.95, item.density / liquidDensity);
            const targetEquilibriumY = TANK.waterLevel + (subRatio - 0.5) * 24;
            item.y = targetEquilibriumY + Math.sin(item.bobPhase + item.x * 0.01) * 2.2;
            item.rotation = (item.targetRotation || 0) + Math.sin(item.bobPhase * 0.7) * 0.04;
          }
        } else if (item.state === 'returning') {
          // Smooth interpolation back to shelf slot
          const slot = getShelfSlotCoord(item.shelfIndex);
          item.x += (slot.x - item.x) * 0.18;
          item.y += (slot.y - item.y) * 0.18;
          item.rotation += (0 - item.rotation) * 0.18;
          if (Math.hypot(slot.x - item.x, slot.y - item.y) < 1.5) {
            item.x = slot.x;
            item.y = slot.y;
            item.rotation = 0;
            item.targetRotation = 0;
            item.state = 'shelf';
          }
        }
      });

      // 5. Draw Objects in Air / Shelf FIRST (above water line or currently being dragged)
      itemsRef.current.forEach((item) => {
        if (item.state === 'shelf' || item.state === 'returning') {
          renderItemArtwork(ctx, item, false);
        } else if (item.state === 'falling' && item.y < TANK.waterLevel) {
          renderItemArtwork(ctx, item, false);
        }
      });

      // 6. Draw Submerged Objects (in water or settled) BEFORE drawing the water layer
      itemsRef.current.forEach((item) => {
        if (item.state === 'in_water' || item.state === 'settled') {
          renderItemArtwork(ctx, item, true);
        }
      });

      // 7. Draw Glass Water Tank & Translucent Water Body
      const tankW = TANK.right - TANK.left;
      const tankH = TANK.bottom - TANK.top;
      const waterH = TANK.bottom - TANK.waterLevel;

      // Translucent Liquid Fill with dynamic medium color
      let c1 = 'rgba(56, 189, 248, 0.42)';
      let c2 = 'rgba(14, 165, 233, 0.55)';
      let c3 = 'rgba(2, 132, 199, 0.70)';
      let surfaceStroke = '#38bdf8';
      if (liquidType === 'saltwater') {
        c1 = 'rgba(56, 189, 248, 0.55)';
        c2 = 'rgba(3, 105, 161, 0.65)';
        c3 = 'rgba(12, 74, 110, 0.80)';
        surfaceStroke = '#7dd3fc';
      } else if (liquidType === 'oil') {
        c1 = 'rgba(250, 204, 21, 0.45)';
        c2 = 'rgba(234, 179, 8, 0.60)';
        c3 = 'rgba(161, 98, 7, 0.75)';
        surfaceStroke = '#fde047';
      } else if (liquidType === 'honey') {
        c1 = 'rgba(251, 146, 60, 0.55)';
        c2 = 'rgba(234, 88, 12, 0.70)';
        c3 = 'rgba(154, 52, 18, 0.85)';
        surfaceStroke = '#fb923c';
      }

      const waterGrad = ctx.createLinearGradient(0, TANK.waterLevel, 0, TANK.bottom);
      waterGrad.addColorStop(0, c1);
      waterGrad.addColorStop(0.5, c2);
      waterGrad.addColorStop(1, c3);

      ctx.save();
      ctx.beginPath();
      ctx.rect(TANK.left + 3, TANK.waterLevel, tankW - 6, waterH - 3);
      ctx.clip();

      ctx.fillStyle = waterGrad;
      ctx.fillRect(TANK.left + 3, TANK.waterLevel, tankW - 6, waterH - 3);

      // Subtle water caustic light shimmer streaks
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let c = 0; c < 5; c++) {
        const cx = TANK.left + 70 + c * 150 + Math.sin(time + c) * 25;
        ctx.beginPath();
        ctx.ellipse(cx, TANK.waterLevel + waterH / 2, 45, waterH / 2 - 10, Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // 8. Water Surface Line & Ripple Waves
      ctx.strokeStyle = surfaceStroke;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = TANK.left; x <= TANK.right; x += 4) {
        const wave = Math.sin((x - TANK.left) * 0.03 + time * 2.5) * 1.5;
        const y = TANK.waterLevel + wave;
        if (x === TANK.left) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw Animated Surface Ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        r.radius += 1.4;
        r.alpha -= 0.016;
        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripplesRef.current.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(224, 242, 254, ${r.alpha})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(r.x, TANK.waterLevel, r.radius, r.radius * 0.22, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 9. Update & Draw Particles (Splash droplets & Bubbles)
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.isBubble) {
          p.vy -= 0.04; // float upward
          p.alpha -= 0.01;
          if (p.y <= TANK.waterLevel || p.alpha <= 0) {
            particlesRef.current.splice(i, 1);
            continue;
          }
        } else {
          p.vy += 0.28; // gravity for splash droplets
          p.alpha -= 0.022;
          if (p.alpha <= 0) {
            particlesRef.current.splice(i, 1);
            continue;
          }
        }

        ctx.fillStyle = p.isBubble ? 'rgba(255, 255, 255, 0.7)' : p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        if (p.isBubble) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // 10. Draw Deep Cyan-Blue Glass Walls of Tank
      ctx.fillStyle = TANK.glassColor;
      // Left vertical wall
      ctx.fillRect(TANK.left - 3, TANK.top, TANK.wallThickness, tankH);
      // Right vertical wall
      ctx.fillRect(TANK.right - 3, TANK.top, TANK.wallThickness, tankH);
      // Bottom horizontal floor
      ctx.fillRect(TANK.left - 3, TANK.bottom - 3, tankW + 6, TANK.wallThickness);

      // 11. Draw Currently Dragged Item ON TOP with Lift Shadow
      const draggingId = draggingIdRef.current;
      if (draggingId) {
        const draggedItem = itemsRef.current.find((it) => it.id === draggingId);
        if (draggedItem) {
          // Drop shadow beneath cursor
          ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
          ctx.beginPath();
          ctx.ellipse(draggedItem.x, draggedItem.y + 20, 20, 8, 0, 0, Math.PI * 2);
          ctx.fill();

          // Render item with slight scale boost
          ctx.save();
          ctx.translate(draggedItem.x, draggedItem.y);
          ctx.scale(1.12, 1.12);
          ctx.translate(-draggedItem.x, -draggedItem.y);
          renderItemArtwork(ctx, draggedItem, false);
          ctx.restore();
        }
      }

      // 12. Draw Bottom-Right Reset / Reload Button
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(RESET_BTN.x, RESET_BTN.y, RESET_BTN.w, RESET_BTN.h, 8);
      ctx.fill();
      ctx.stroke();

      // Circular Reload Arrow `↺` Icon
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      const rbx = RESET_BTN.x + RESET_BTN.w / 2;
      const rby = RESET_BTN.y + RESET_BTN.h / 2;
      ctx.beginPath();
      ctx.arc(rbx, rby, 8, Math.PI * 0.25, Math.PI * 1.8);
      ctx.stroke();
      // Arrowhead
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(rbx + 4, rby - 10);
      ctx.lineTo(rbx + 8, rby - 5);
      ctx.lineTo(rbx + 2, rby - 5);
      ctx.closePath();
      ctx.fill();

      // 13. Draw Item Hover Card / Tooltip
      const hoveredItem = hoveredItemRef.current;
      if (hoveredItem && !draggingId) {
        const cardW = 160;
        const cardH = 54;
        let cardX = hoveredItem.x - cardW / 2;
        let cardY = hoveredItem.y - cardH - 18;
        if (cardX < 10) cardX = 10;
        if (cardX + cardW > CANVAS_WIDTH - 10) cardX = CANVAS_WIDTH - cardW - 10;
        if (cardY < 10) cardY = hoveredItem.y + 25;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = hoveredItem.floats ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 4;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 8);
        ctx.fill();
        ctx.stroke();
        ctx.shadowColor = 'transparent';

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(lang === 'ne' ? hoveredItem.nameNe : hoveredItem.nameEn, cardX + 10, cardY + 16);

        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(
          lang === 'ne'
            ? `घनत्व: ${hoveredItem.density} g/cm³`
            : `Density: ${hoveredItem.density} g/cm³`,
          cardX + 10,
          cardY + 32
        );

        ctx.fillStyle = hoveredItem.floats ? '#4ade80' : '#f87171';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(
          hoveredItem.floats
            ? (lang === 'ne' ? '• उत्रन्छ (Floats)' : '• Floats (< 1.0)')
            : (lang === 'ne' ? '• डुब्छ (Sinks)' : '• Sinks (> 1.0)'),
          cardX + 10,
          cardY + 46
        );
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [lang, isMuted]);

  const activeItem = items.find((it) => it.id === selectedItemId) || items[0];
  const testedCount = items.filter((o) => o.state !== 'shelf').length;

  return (
    <SimulationLayout
      titleEn="Floating and Sinking 2D Laboratory"
      titleNe="उत्रने र डुब्ने २डी प्रयोगशाला"
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
          color: '#0f172a',
        }}
      >
        {/* ══════════════════════════════════════════════════════════════
            LEFT COLUMN: INTERACTIVE 2D WATER TANK VIEWPORT
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
          }}
        >
          {/* Main Canvas */}
          <canvas
            ref={canvasRef}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
            }}
          />

          {/* Top Quick Badges Floating Bar */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 10,
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                color: '#0284c7',
                fontSize: '11px',
                fontWeight: 800,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Droplets size={13} />
              {liquidType === 'water'
                ? (lang === 'ne' ? 'पानी: १.०० g/cm³' : 'Water: 1.00 g/cm³')
                : liquidType === 'saltwater'
                ? (lang === 'ne' ? 'नुन पानी: १.१५ g/cm³' : 'Saltwater: 1.15 g/cm³')
                : liquidType === 'oil'
                ? (lang === 'ne' ? 'तेल: ०.९१ g/cm³' : 'Oil: 0.91 g/cm³')
                : (lang === 'ne' ? 'मह: १.४२ g/cm³' : 'Honey: 1.42 g/cm³')}
            </span>

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                color: '#d97706',
                fontSize: '11px',
                fontWeight: 800,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Sparkles size={13} />
              {lang === 'ne'
                ? `परीक्षण: ${testedCount}/${items.length}`
                : `Tested: ${testedCount}/${items.length}`}
            </span>

            <button
              onClick={() => setPredictMode(!predictMode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '8px',
                border: predictMode ? '1px solid #a855f7' : '1px solid #e2e8f0',
                background: predictMode ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.95)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                color: predictMode ? '#9333ea' : '#475569',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              <HelpCircle size={13} />
              {lang === 'ne'
                ? predictMode ? 'अनुमान मोड: चालु' : 'अनुमान मोड बन्द'
                : predictMode ? 'Hypothesis: ON' : 'Hypothesis Mode'}
            </button>
          </div>

          {/* Bottom Floating Interactive Dock */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              backdropFilter: 'blur(12px)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10,
            }}
          >
            {/* Left active item physics detail */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: activeItem.density < liquidDensity ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: activeItem.density < liquidDensity ? '1px solid #22c55e' : '1px solid #ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                {activeItem.density < liquidDensity ? '🫧' : '⚓'}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {lang === 'ne' ? activeItem.nameNe : activeItem.nameEn}
                  <span
                    style={{
                      marginLeft: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: activeItem.density < liquidDensity ? '#16a34a' : '#dc2626',
                    }}
                  >
                    {activeItem.density < liquidDensity
                      ? (lang === 'ne' ? '• पानीमा उत्रन्छ (FLOATS)' : '• FLOATS IN FLUID')
                      : (lang === 'ne' ? '• पानीमा डुब्छ (SINKS)' : '• SINKS IN FLUID')}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {lang === 'ne'
                    ? `तौल: ${activeItem.mass}g | आयतन: ${activeItem.volume}cm³ | घनत्व: ${activeItem.density} g/cm³ ${activeItem.density < liquidDensity ? '<' : '>'} ${liquidDensity} g/cm³`
                    : `Mass: ${activeItem.mass}g | Volume: ${activeItem.volume}cm³ | Density: ${activeItem.density} g/cm³ (${activeItem.density < liquidDensity ? 'Buoyancy > Gravity' : 'Gravity > Buoyancy'})`}
                </div>
              </div>
            </div>

            {/* Right dock controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={13} />
                {lang === 'ne' ? 'ट्याङ्की रिसेट' : 'Reset Tank'}
              </button>
            </div>
          </div>

          {/* Hypothesis Prediction Modal Dialog */}
          {pendingPredictItem && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-30 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-center border border-slate-200 animate-in fade-in zoom-in-95 duration-200 text-slate-800">
                <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center bg-purple-50 border border-purple-200">
                  <HelpCircle className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-1 text-slate-900">
                  {lang === 'ne' ? pendingPredictItem.nameNe : pendingPredictItem.nameEn}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  {lang === 'ne'
                    ? `तौल: ${pendingPredictItem.mass}g | आयतन: ${pendingPredictItem.volume}cm³ | घनत्व: ${pendingPredictItem.density} g/cm³`
                    : `Mass: ${pendingPredictItem.mass}g | Volume: ${pendingPredictItem.volume}cm³ | Density: ${pendingPredictItem.density} g/cm³`}
                </p>
                <p className="text-sm font-semibold text-purple-900 mb-6">
                  {lang === 'ne'
                    ? 'तपाईंको अनुमान के छ? यो वस्तु पानीमा उत्रन्छ कि डुब्छ?'
                    : 'What is your hypothesis? Will this object float or sink in water?'}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleConfirmPrediction('float')}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold flex items-center justify-center gap-2 shadow-md transition transform active:scale-95 cursor-pointer"
                  >
                    <ArrowUp className="w-5 h-5" />
                    {lang === 'ne' ? 'उत्रन्छ (Float)' : 'Will Float'}
                  </button>
                  <button
                    onClick={() => handleConfirmPrediction('sink')}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-semibold flex items-center justify-center gap-2 shadow-md transition transform active:scale-95 cursor-pointer"
                  >
                    <ArrowDown className="w-5 h-5" />
                    {lang === 'ne' ? 'डुब्छ (Sink)' : 'Will Sink'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: ARCHIMEDES LAB WORKSPACE & OBJECT CATALOG (380px)
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            borderLeft: '1px solid #e2e8f0',
            background: '#ffffff',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            overflowY: 'auto',
          }}
        >
          {/* Header Discovery Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(3, 105, 161, 0.02) 100%)',
              border: '1px solid rgba(14, 165, 233, 0.25)',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#0284c7" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0284c7' }}>
                {lang === 'ne' ? 'आर्किमिडिजको प्लावन प्रयोगशाला' : 'Archimedes Buoyancy Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
              {lang === 'ne'
                ? 'पानीको घनत्व १.०० g/cm³ हुन्छ। तरलको घनत्व भन्दा कम घनत्व भएका वस्तु उत्रन्छन् र बढी भएका डुब्छन्।'
                : 'Pure water has a density of 1.00 g/cm³. An object floats when its density is lower than the liquid and sinks when higher.'}
            </div>
          </div>

          {/* Liquid Medium Selector Tabs */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px' }}>
              {lang === 'en' ? 'LIQUID MEDIUM' : 'तरल पदार्थ छनौट'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                onClick={() => {
                  setLiquidType('water');
                  ScienceAudio.playPop();
                }}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: liquidType === 'water' ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
                  background: liquidType === 'water' ? 'rgba(14, 165, 233, 0.12)' : '#f8fafc',
                  color: liquidType === 'water' ? '#0284c7' : '#334155',
                }}
              >
                💧 {lang === 'en' ? 'Pure Water (1.00)' : 'पानी (१.००)'}
              </button>
              <button
                onClick={() => {
                  setLiquidType('saltwater');
                  ScienceAudio.playPop();
                }}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: liquidType === 'saltwater' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  background: liquidType === 'saltwater' ? 'rgba(2, 132, 199, 0.12)' : '#f8fafc',
                  color: liquidType === 'saltwater' ? '#0369a1' : '#334155',
                }}
              >
                🧂 {lang === 'en' ? 'Saltwater (1.15)' : 'नुन पानी (१.१५)'}
              </button>
              <button
                onClick={() => {
                  setLiquidType('oil');
                  ScienceAudio.playPop();
                }}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: liquidType === 'oil' ? '2px solid #eab308' : '1px solid #e2e8f0',
                  background: liquidType === 'oil' ? 'rgba(234, 179, 8, 0.15)' : '#f8fafc',
                  color: liquidType === 'oil' ? '#a16207' : '#334155',
                }}
              >
                🌻 {lang === 'en' ? 'Cooking Oil (0.91)' : 'तेल (०.९१)'}
              </button>
              <button
                onClick={() => {
                  setLiquidType('honey');
                  ScienceAudio.playPop();
                }}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: liquidType === 'honey' ? '2px solid #ea580c' : '1px solid #e2e8f0',
                  background: liquidType === 'honey' ? 'rgba(234, 88, 12, 0.15)' : '#f8fafc',
                  color: liquidType === 'honey' ? '#c2410c' : '#334155',
                }}
              >
                🍯 {lang === 'en' ? 'Dense Honey (1.42)' : 'मह (१.४२)'}
              </button>
            </div>
          </div>

          {/* Progress Meter */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
              <span>{lang === 'en' ? 'Tested Objects' : 'परीक्षण गरिएका वस्तुहरू'}</span>
              <strong style={{ color: '#0284c7' }}>{testedCount} / {items.length}</strong>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(testedCount / items.length) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #0284c7, #16a34a)',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Interactive Object Catalog Grid */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>
              {lang === 'en' ? 'LAB OBJECT CATALOG (CLICK TO DROP)' : 'वस्तुहरूको सूची (क्लिक गरी पानीमा खसाल्नुहोस्)'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
              {items.map((it) => {
                const isTested = it.state !== 'shelf';
                const isFloats = it.density < liquidDensity;
                const isSelected = selectedItemId === it.id;
                return (
                  <button
                    key={it.id}
                    onClick={() => handleDropItemFromCatalog(it.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                      background: isSelected ? 'rgba(14, 165, 233, 0.1)' : '#f8fafc',
                      color: '#0f172a',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{lang === 'ne' ? it.nameNe : it.nameEn}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        ρ = {it.density} g/cm³ • m = {it.mass}g • V = {it.volume}cm³
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isTested && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: isFloats ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: isFloats ? '#15803d' : '#b91c1c',
                          }}
                        >
                          {isFloats ? (lang === 'ne' ? 'उत्रन्छ' : 'Floats') : (lang === 'ne' ? 'डुब्छ' : 'Sinks')}
                        </span>
                      )}
                      {isTested && <Check size={14} color="#16a34a" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Curriculum Key Takeaway */}
          <div
            style={{
              background: 'rgba(14, 165, 233, 0.08)',
              border: '1px solid rgba(14, 165, 233, 0.25)',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0284c7', marginBottom: '4px' }}>
              {lang === 'en' ? 'Curriculum Key Takeaway' : 'पाठ्यक्रम मुख्य निष्कर्ष'}
            </div>
            <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              {lang === 'en'
                ? 'An object floats when its density is lower than the surrounding liquid. When density is higher, downward gravity overcomes buoyancy, causing it to sink.'
                : 'कुनै पनि वस्तुको घनत्व पानी भन्दा कम छ भने त्यो उत्रन्छ। घनत्व बढी भएमा गुरुत्वाकर्षणले प्लावन बललाई जित्छ र वस्तु डुब्छ।'}
            </p>
          </div>

          {/* Complete Lab & Quiz Button */}
          <button
            onClick={() => {
              ScienceAudio.playSuccess();
              setStars(3);
              setIsCompleted(true);
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Check size={16} />
            {lang === 'en' ? '✓ Complete Archimedes Lab & Quiz' : '✓ प्रयोगशाला पूरा गरी तारा जित्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default FloatingSinkingLab;

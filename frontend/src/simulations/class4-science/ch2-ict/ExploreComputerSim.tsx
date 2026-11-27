/**
 * ExploreComputerSim.tsx
 * Simulation 4: 2D Computer Workstation Explorer
 * Grade 4 Science • Chapter 2: Information & Communication Technology
 *
 * Ultra-Realistic Photorealistic 2D Canvas & Vector Workstation Simulation:
 * - Ultra-realistic widescreen LCD/LED monitor with diagonal anti-glare glass sheen,
 *   brushed aluminum stand, and interactive live operating system display.
 * - Ultra-realistic PC tower / system unit in 2.5D perspective:
 *   brushed titanium front faceplate, motorized optical disc drive with eject animation,
 *   circular metallic power button with radiant blue neon LED ring, reset button,
 *   and horizontal ventilation cooling slats.
 * - Tangible Movable Hardware:
 *   * Draggable USB Flash Drive: Grab and plug directly into the CPU tower front port with chime & live mount!
 *   * Draggable Optical CD Disc: Drop into the open CD/DVD tray to load media!
 *   * Draggable Ergonomic Keyboard & Optical Mouse: Arrange workstation freely on the desk surface!
 * - Clean, welcoming student-friendly theme: light airy slate and crisp white cards (no dark murky AI look).
 * - Organized, clutter-free labelling: Sleek interactive highlight aura and dedicated Device Inspector drawer.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  Monitor,
  Cpu,
  Keyboard as KeyboardIcon,
  Mouse as MouseIcon,
  HardDrive,
  Check,
  Power,
  Disc,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Usb,
} from 'lucide-react';

export type ComponentId = 'monitor' | 'cpu' | 'keyboard' | 'mouse' | 'storage';

interface ComponentData {
  id: ComponentId;
  nameEn: string;
  nameNe: string;
  categoryEn: 'Output Device' | 'Processing Unit' | 'Input Device' | 'Storage Device';
  categoryNe: 'आउटपुट उपकरण' | 'प्रशोधन उपकरण (मस्तिष्क)' | 'इनपुट उपकरण' | 'भण्डारण उपकरण';
  categoryColor: string;
  summaryEn: string;
  summaryNe: string;
  specs: { labelEn: string; labelNe: string; value: string }[];
  funFactEn: string;
  funFactNe: string;
}

export const ExploreComputerSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Active selected component & tracking
  const [selectedId, setSelectedId] = useState<ComponentId>('monitor');
  const [hoveredId, setHoveredId] = useState<ComponentId | null>(null);
  const [exploredList, setExploredList] = useState<ComponentId[]>(['monitor']);

  // Hardware states
  const [isPowered, setIsPowered] = useState<boolean>(true);
  const [isTrayEjected, setIsTrayEjected] = useState<boolean>(false);
  const [typedText, setTypedText] = useState<string>('NEPAL');
  const [mouseClickCount, setMouseClickCount] = useState<number>(0);
  const [recentKey, setRecentKey] = useState<string>('');

  // Movable Peripherals on Desk
  const [usbState, setUsbState] = useState<{ x: number; y: number; isPlugged: boolean }>({
    x: 840,
    y: 460,
    isPlugged: false,
  });
  const [discState, setDiscState] = useState<{ x: number; y: number; isInserted: boolean }>({
    x: 95,
    y: 460,
    isInserted: false,
  });
  const [kbPos, setKbPos] = useState<{ x: number; y: number }>({ x: 355, y: 445 });
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 740, y: 450 });

  // Dragging state
  const draggingItemRef = useRef<'usb' | 'disc' | 'keyboard' | 'mouse' | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Virtual Canvas dimensions (960 x 540)
  const CANVAS_WIDTH = 960;
  const CANVAS_HEIGHT = 540;

  // Components educational metadata
  const COMPONENTS: Record<ComponentId, ComponentData> = {
    monitor: {
      id: 'monitor',
      nameEn: 'Ultra-Slim HD Monitor',
      nameNe: 'एलसीडी / एलईडी मोनिटर (Display)',
      categoryEn: 'Output Device',
      categoryNe: 'आउटपुट उपकरण',
      categoryColor: '#0284c7',
      summaryEn:
        'The visual output display that converts electronic video signals into crisp text, vibrant images, and videos.',
      summaryNe:
        'कम्प्युटरले प्रशोधन गरेका सबै सूचना, शब्द, चित्र र भिडियोहरूलाई आँखाले देख्न सकिने गरी देखाउने मुख्य दृश्य आउटपुट उपकरण।',
      specs: [
        { labelEn: 'Resolution', labelNe: 'रिजोल्युसन', value: '1920 × 1080 Full HD' },
        { labelEn: 'Panel Type', labelNe: 'प्यानल', value: 'IPS Anti-Glare Glass' },
        { labelEn: 'Refresh Rate', labelNe: 'रिफ्रेस दर', value: '75 Hz' },
        { labelEn: 'Function', labelNe: 'कार्य', value: 'Visual Output' },
      ],
      funFactEn: 'Computer screens create millions of colors by mixing only three basic colors of light: Red, Green, and Blue (RGB)!',
      funFactNe: 'कम्प्युटर स्क्रिनले केवल तीनवटा आधारभूत रङ (रातो, हरियो, नीलो - RGB) मिलाएर लाखौं रङहरू बनाउँछ!',
    },
    cpu: {
      id: 'cpu',
      nameEn: 'System Unit / CPU Tower',
      nameNe: 'सिस्टम युनिट / सीपीयू टावर (Brain)',
      categoryEn: 'Processing Unit',
      categoryNe: 'प्रशोधन उपकरण (मस्तिष्क)',
      categoryColor: '#7c3aed',
      summaryEn:
        'The main computer chassis containing the Central Processing Unit (CPU) microprocessor, motherboard, RAM, and power supply.',
      summaryNe:
        'कम्प्युटरको मुख्य युनिट जसमा माइक्रोप्रोसेसर (दिमाग), मदरबोर्ड, र्‍याम र बिजुली आपूर्ति हुन्छ, जसले सबै निर्देशनहरू गणना गर्छ।',
      specs: [
        { labelEn: 'Processor', labelNe: 'प्रोसेसर', value: 'Multi-Core 3.6 GHz' },
        { labelEn: 'Motherboard', labelNe: 'मदरबोर्ड', value: 'High-Speed System Bus' },
        { labelEn: 'Cooling', labelNe: 'कुलिङ', value: 'Silent Airflow Intake' },
        { labelEn: 'Function', labelNe: 'कार्य', value: 'Central Processing' },
      ],
      funFactEn: 'A modern CPU can perform over 3 billion mathematical calculations in just one single second!',
      funFactNe: 'आधुनिक सीपीयूले एक सेकेन्डमै 3 अर्ब भन्दा बढी गणितीय गणनाहरू गर्न सक्छ!',
    },
    keyboard: {
      id: 'keyboard',
      nameEn: 'Ergonomic Keyboard',
      nameNe: 'एर्गोनोमिक किबोर्ड (Typing Input)',
      categoryEn: 'Input Device',
      categoryNe: 'इनपुट उपकरण',
      categoryColor: '#059669',
      summaryEn:
        'Primary alphanumeric input device featuring sculpted keys, function keys, and a comfortable wrist rest for typing data.',
      summaryNe:
        'कम्प्युटरमा अक्षर, अंक र विशेष आदेशहरू प्रविष्ट (टाइप) गर्न प्रयोग गरिने मुख्य हाते इनपुट उपकरण।',
      specs: [
        { labelEn: 'Layout', labelNe: 'लेआउट', value: 'Standard QWERTY 104 Keys' },
        { labelEn: 'Key Switches', labelNe: 'स्विच', value: 'Tactile Membrane Scissor' },
        { labelEn: 'Wrist Rest', labelNe: 'रिस्ट रेस्ट', value: 'Contoured Soft-Grip' },
        { labelEn: 'Function', labelNe: 'कार्य', value: 'Text Input' },
      ],
      funFactEn: 'The QWERTY keyboard layout was originally invented in 1873 for mechanical typewriters to prevent jammed keys!',
      funFactNe: 'QWERTY किबोर्ड डिजाइन सन् 1873 मा टाइपराइटरको किहरू आपसमा नअल्झिऊन् भनेर बनाइएको थियो!',
    },
    mouse: {
      id: 'mouse',
      nameEn: 'Ergonomic Optical Mouse',
      nameNe: 'अप्टिकल माउस (Pointing Device)',
      categoryEn: 'Input Device',
      categoryNe: 'इनपुट उपकरण',
      categoryColor: '#059669',
      summaryEn:
        'Handheld pointing device utilizing an optical LED sensor underneath to track movement and control the on-screen cursor.',
      summaryNe:
        'तल रहेको रातो प्रकाश (अप्टिकल सेन्सर) को मद्दतले स्क्रिनको कर्सर चलाउने र फाइलहरू छनोट गर्ने हाते इनपुट उपकरण।',
      specs: [
        { labelEn: 'Sensor', labelNe: 'सेन्सर', value: 'Optical Red LED 1200 DPI' },
        { labelEn: 'Buttons', labelNe: 'बटनहरू', value: 'Left, Right, Scroll Wheel' },
        { labelEn: 'Ergonomics', labelNe: 'बनावट', value: 'Two-Tone Sculpted Contour' },
        { labelEn: 'Function', labelNe: 'कार्य', value: 'Pointer Input' },
      ],
      funFactEn: 'The very first computer mouse was invented in 1964 by Douglas Engelbart and was made of carved wood with two metal wheels!',
      funFactNe: 'संसारको पहिलो कम्प्युटर माउस सन् 1964 मा डग्लस एंगेलबार्टले काठबाट बनाएका थिए!',
    },
    storage: {
      id: 'storage',
      nameEn: 'Optical Drive & USB Storage',
      nameNe: 'अप्टिकल डिस्क, पेनड्राइभ र एसएसडी (Storage)',
      categoryEn: 'Storage Device',
      categoryNe: 'भण्डारण उपकरण',
      categoryColor: '#d97706',
      summaryEn:
        'Long-term digital storage units that permanently preserve operating system files, school projects, and photos.',
      summaryNe:
        'कम्प्युटर बन्द हुँदा पनि हाम्रा फाइलहरू, तस्बिरहरू र सफ्टवेयरहरू सुरक्षित राख्ने स्थायी भण्डारण उपकरण।',
      specs: [
        { labelEn: 'USB Flash', labelNe: 'पेनड्राइभ', value: '16 GB USB 3.0 Removable' },
        { labelEn: 'Optical Tray', labelNe: 'डिस्क ट्रे', value: 'DVD-RW Motorized' },
        { labelEn: 'SSD Storage', labelNe: 'एसएसडी', value: '512 GB Ultra-Fast NVMe' },
        { labelEn: 'Function', labelNe: 'कार्य', value: 'Permanent Storage' },
      ],
      funFactEn: 'Unlike RAM memory which forgets everything when power turns off, SSD and USB drives keep data safe forever!',
      funFactNe: 'बिजुली जाँदा मेटिने र्‍याम (RAM) भन्दा फरक, पेनड्राइभ र एसएसडीले वर्षौंसम्म डाटा सुरक्षित राख्छन्!',
    },
  };

  const currentComponent = COMPONENTS[selectedId];

  // Select component handler
  const handleSelectComponent = (id: ComponentId) => {
    ScienceAudio.playPop();
    setSelectedId(id);
    if (!exploredList.includes(id)) {
      const updated = [...exploredList, id];
      setExploredList(updated);
      const score = Math.min(3, Math.floor((updated.length / Object.keys(COMPONENTS).length) * 3));
      setStars(score);
      if (updated.length >= Object.keys(COMPONENTS).length) {
        setIsCompleted(true);
        ScienceAudio.playSuccess();
      }
    }
  };

  // Toggle power button
  const handleTogglePower = () => {
    ScienceAudio.playClick();
    setIsPowered((prev) => !prev);
  };

  // Eject/close CD-DVD optical tray
  const handleToggleTray = () => {
    ScienceAudio.playWhoosh();
    setIsTrayEjected((prev) => !prev);
  };

  // Type letter on virtual keyboard
  const handleTypeKey = (char: string) => {
    ScienceAudio.playClick();
    setRecentKey(char);
    setTypedText((prev) => (prev.length >= 18 ? char : prev + char));
  };

  // Mouse click test
  const handleMouseClick = (buttonName: string) => {
    ScienceAudio.playClick();
    setMouseClickCount((prev) => prev + 1);
  };

  // Reset simulation
  const handleReset = () => {
    setSelectedId('monitor');
    setExploredList(['monitor']);
    setIsPowered(true);
    setIsTrayEjected(false);
    setTypedText('NEPAL');
    setMouseClickCount(0);
    setUsbState({ x: 840, y: 460, isPlugged: false });
    setDiscState({ x: 95, y: 460, isInserted: false });
    setKbPos({ x: 355, y: 445 });
    setMousePos({ x: 740, y: 450 });
    setStars(0);
    setIsCompleted(false);
    ScienceAudio.playWhoosh();
  };

  // Voice explanation
  const handleToggleAudio = () => {
    if (isMuted) {
      setIsMuted(false);
      ScienceAudio.setMuted(false);
      ScienceAudio.playClick();
      ScienceAudio.speak(
        lang === 'ne'
          ? 'कम्प्युटरमा इनपुट, प्रशोधन, आउटपुट र भण्डारण उपकरणहरू मिलेर काम गर्दछन्।'
          : 'A computer workstation combines input, processing, output, and storage devices working together seamlessly.',
        lang
      );
    } else {
      setIsMuted(true);
      ScienceAudio.setMuted(true);
    }
  };

  // Get canvas coordinates from event
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

  // Hit test components on canvas for clicks
  const hitTestComponent = (x: number, y: number): ComponentId | null => {
    // Monitor screen & frame hit zone: (x: 50..520, y: 35..375)
    if (x >= 50 && x <= 520 && y >= 35 && y <= 375) return 'monitor';
    // Tower CPU hit zone: (x: 535..820, y: 25..400)
    if (x >= 535 && x <= 820 && y >= 25 && y <= 400) {
      if (y >= 60 && y <= 165) return 'storage'; // Drive bay & USB region
      return 'cpu';
    }
    // Keyboard hit zone:
    if (Math.abs(x - kbPos.x) < 240 && Math.abs(y - kbPos.y) < 55) return 'keyboard';
    // Mouse hit zone:
    if (Math.hypot(x - mousePos.x, y - mousePos.y) < 35) return 'mouse';
    return null;
  };

  // Pointer down: Check if dragging USB, CD, Keyboard or Mouse
  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    // 1. Check USB drive hit
    const distUsb = Math.hypot(coords.x - usbState.x, coords.y - usbState.y);
    if (distUsb < 30) {
      draggingItemRef.current = 'usb';
      dragOffsetRef.current = { x: coords.x - usbState.x, y: coords.y - usbState.y };
      ScienceAudio.playPop();
      if (usbState.isPlugged) {
        setUsbState((prev) => ({ ...prev, isPlugged: false }));
      }
      return;
    }

    // 2. Check CD disc hit
    const distDisc = Math.hypot(coords.x - discState.x, coords.y - discState.y);
    if (distDisc < 32) {
      draggingItemRef.current = 'disc';
      dragOffsetRef.current = { x: coords.x - discState.x, y: coords.y - discState.y };
      ScienceAudio.playPop();
      if (discState.isInserted) {
        setDiscState((prev) => ({ ...prev, isInserted: false }));
      }
      return;
    }

    // 3. Check Mouse hit (drag or click)
    const distMouse = Math.hypot(coords.x - mousePos.x, coords.y - mousePos.y);
    if (distMouse < 32) {
      draggingItemRef.current = 'mouse';
      dragOffsetRef.current = { x: coords.x - mousePos.x, y: coords.y - mousePos.y };
      handleMouseClick('left');
      handleSelectComponent('mouse');
      return;
    }

    // 4. Check Keyboard hit
    if (Math.abs(coords.x - kbPos.x) < 230 && Math.abs(coords.y - kbPos.y) < 50) {
      draggingItemRef.current = 'keyboard';
      dragOffsetRef.current = { x: coords.x - kbPos.x, y: coords.y - kbPos.y };
      handleSelectComponent('keyboard');
      return;
    }

    // Otherwise standard component selection
    const hit = hitTestComponent(coords.x, coords.y);
    if (hit) {
      handleSelectComponent(hit);
    }
  };

  // Global window listeners for smooth dragging
  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      const dragging = draggingItemRef.current;
      if (!dragging) return;
      const coords = getCanvasCoords(e);
      const targetX = coords.x - dragOffsetRef.current.x;
      const targetY = coords.y - dragOffsetRef.current.y;

      if (dragging === 'usb') {
        setUsbState((prev) => ({
          ...prev,
          x: Math.max(40, Math.min(CANVAS_WIDTH - 40, targetX)),
          y: Math.max(100, Math.min(CANVAS_HEIGHT - 30, targetY)),
        }));
      } else if (dragging === 'disc') {
        setDiscState((prev) => ({
          ...prev,
          x: Math.max(40, Math.min(CANVAS_WIDTH - 40, targetX)),
          y: Math.max(70, Math.min(CANVAS_HEIGHT - 30, targetY)),
        }));
      } else if (dragging === 'mouse') {
        setMousePos({
          x: Math.max(620, Math.min(CANVAS_WIDTH - 40, targetX)),
          y: Math.max(385, Math.min(CANVAS_HEIGHT - 35, targetY)),
        });
      } else if (dragging === 'keyboard') {
        setKbPos({
          x: Math.max(260, Math.min(500, targetX)),
          y: Math.max(390, Math.min(460, targetY)),
        });
      }
    };

    const handleGlobalUp = () => {
      const dragging = draggingItemRef.current;
      if (!dragging) return;
      draggingItemRef.current = null;

      // Handle drop snaps
      if (dragging === 'usb') {
        // USB port on tower is around x: 685, y: 155
        setUsbState((prev) => {
          const distToPort = Math.hypot(prev.x - 685, prev.y - 155);
          if (distToPort < 65) {
            ScienceAudio.playSuccess();
            return { x: 685, y: 155, isPlugged: true };
          }
          return prev;
        });
      } else if (dragging === 'disc') {
        // Disc tray on tower is around x: 675, y: 90
        setDiscState((prev) => {
          const distToTray = Math.hypot(prev.x - 675, prev.y - 90);
          if (distToTray < 70 && isTrayEjected) {
            ScienceAudio.playSuccess();
            setIsTrayEjected(false); // smoothly auto-close tray with disc inside
            return { x: 675, y: 90, isInserted: true };
          }
          return prev;
        });
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
  }, [isTrayEjected]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingItemRef.current) return;
    const coords = getCanvasCoords(e);
    const hit = hitTestComponent(coords.x, coords.y);
    setHoveredId(hit);
  };

  // 60 FPS Ultra-Realistic Vector Rendering Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let trayAnim = isTrayEjected ? 1.0 : 0.0;

    const render = () => {
      time += 0.035;

      // Animate optical tray smoothly
      if (isTrayEjected && trayAnim < 1.0) {
        trayAnim = Math.min(1.0, trayAnim + 0.09);
      } else if (!isTrayEjected && trayAnim > 0.0) {
        trayAnim = Math.max(0.0, trayAnim - 0.09);
      }

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 1. SLEEK HIGH-TECH DIGITAL LAB WORKBENCH
      const studioGrad = ctx.createLinearGradient(0, 0, 0, 370);
      studioGrad.addColorStop(0, '#090d16');
      studioGrad.addColorStop(0.65, '#0f172a');
      studioGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = studioGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, 370);

      // Cyan ambient illumination behind monitor
      const ambientGlow = ctx.createRadialGradient(300, 180, 20, 300, 180, 320);
      ambientGlow.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      ambientGlow.addColorStop(1, 'rgba(56, 189, 248, 0.0)');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, CANVAS_WIDTH, 370);

      // Dark Precision Slate & Titanium Desk Surface
      const deskHorizonY = 370;
      const deskGrad = ctx.createLinearGradient(0, deskHorizonY, 0, CANVAS_HEIGHT);
      deskGrad.addColorStop(0, '#1e293b');
      deskGrad.addColorStop(0.08, '#334155');
      deskGrad.addColorStop(0.5, '#1e293b');
      deskGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = deskGrad;
      ctx.fillRect(0, deskHorizonY, CANVAS_WIDTH, CANVAS_HEIGHT - deskHorizonY);

      // Specular table edge highlight line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, deskHorizonY);
      ctx.lineTo(CANVAS_WIDTH, deskHorizonY);
      ctx.stroke();

      // 2. CONTACT OCCLUSION SHADOWS
      // Monitor stand base shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.beginPath();
      ctx.ellipse(280, 375, 110, 16, -0.06, 0, Math.PI * 2);
      ctx.fill();

      // Tower base shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.beginPath();
      ctx.ellipse(680, 378, 105, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Keyboard base shadow (tracks kbPos)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      ctx.beginPath();
      ctx.ellipse(kbPos.x, kbPos.y + 35, 230, 22, -0.02, 0, Math.PI * 2);
      ctx.fill();

      // Mouse base shadow (tracks mousePos)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.beginPath();
      ctx.ellipse(mousePos.x, mousePos.y + 35, 45, 14, 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Optical Red Glow underneath Mouse
      if (isPowered) {
        const redGlow = ctx.createRadialGradient(mousePos.x, mousePos.y + 35, 2, mousePos.x, mousePos.y + 35, 30);
        redGlow.addColorStop(0, 'rgba(239, 68, 68, 0.55)');
        redGlow.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
        ctx.fillStyle = redGlow;
        ctx.beginPath();
        ctx.ellipse(mousePos.x, mousePos.y + 35, 35, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. PC TOWER / SYSTEM UNIT (2.5D PERSPECTIVE)
      ctx.save();
      const cpuLeft = 560;
      const cpuTop = 45;
      const cpuFrontW = 150;
      const cpuSideW = 60;
      const cpuH = 325;

      if (selectedId === 'cpu' || hoveredId === 'cpu' || selectedId === 'storage' || hoveredId === 'storage') {
        ctx.shadowColor = selectedId === 'storage' ? '#f59e0b' : '#38bdf8';
        ctx.shadowBlur = 24;
      }

      // 3A. Black Matte Metal Side Chassis (Receding leftwards)
      const sideGrad = ctx.createLinearGradient(cpuLeft, 0, cpuLeft + cpuSideW, 0);
      sideGrad.addColorStop(0, '#090d16');
      sideGrad.addColorStop(0.5, '#1e293b');
      sideGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = sideGrad;

      ctx.beginPath();
      ctx.moveTo(cpuLeft + cpuSideW, cpuTop);
      ctx.lineTo(cpuLeft, cpuTop + 24);
      ctx.lineTo(cpuLeft, cpuTop + cpuH);
      ctx.lineTo(cpuLeft + cpuSideW, cpuTop + cpuH);
      ctx.closePath();
      ctx.fill();

      // Side chassis ventilation holes
      ctx.fillStyle = '#050810';
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 5; c++) {
          ctx.beginPath();
          ctx.ellipse(cpuLeft + 12 + c * 8, cpuTop + 140 + r * 14, 2.5, 4, -Math.PI / 12, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3B. Silver / Titanium Front Faceplate
      const frontX = cpuLeft + cpuSideW;
      const frontGrad = ctx.createLinearGradient(frontX, cpuTop, frontX + cpuFrontW, cpuTop);
      frontGrad.addColorStop(0, '#f8fafc');
      frontGrad.addColorStop(0.2, '#e2e8f0');
      frontGrad.addColorStop(0.8, '#cbd5e1');
      frontGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = frontGrad;

      ctx.beginPath();
      ctx.roundRect(frontX, cpuTop, cpuFrontW, cpuH, [0, 12, 10, 0]);
      ctx.fill();

      // Outer bezel line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // 3C. Upper Drive Bay (5.25" Optical Drive Bay)
      const bayX = frontX + 16;
      const bayY = cpuTop + 24;
      const bayW = cpuFrontW - 32;
      const bayH = 65;

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(bayX, bayY, bayW, bayH, 6);
      ctx.fill();

      // CD/DVD Slot Cover
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(bayX + 6, bayY + 14, bayW - 12, 16, 3);
      ctx.fill();

      // Motorized Optical Tray Animation
      if (trayAnim > 0.01) {
        const trayExt = trayAnim * 48;
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.roundRect(bayX + 10, bayY + 14 + trayExt, bayW - 20, 14, 3);
        ctx.fill();

        // Tray center disc recess
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(bayX + bayW / 2, bayY + 21 + trayExt, 28, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // If CD is inserted, draw CD on tray
        if (discState.isInserted) {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.ellipse(bayX + bayW / 2, bayY + 21 + trayExt, 24, 4.5, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Eject Button & Green LED
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(bayX + bayW - 30, bayY + 42, 22, 10, 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⏏', bayX + bayW - 19, bayY + 50);

      // Drive status LED
      ctx.fillStyle = isPowered ? (isTrayEjected ? '#f59e0b' : '#22c55e') : '#334155';
      ctx.beginPath();
      ctx.arc(bayX + bayW - 38, bayY + 47, 2, 0, Math.PI * 2);
      ctx.fill();

      // 3D. Sculpted Central Contour & Circular Metallic Power Button
      const btnCX = frontX + cpuFrontW / 2;
      const btnCY = cpuTop + 140;

      // Outer chrome ring
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(btnCX, btnCY, 24, 0, Math.PI * 2);
      ctx.fill();

      // Radiant Blue Neon LED Halo
      if (isPowered) {
        const halo = ctx.createRadialGradient(btnCX, btnCY, 14, btnCX, btnCY, 28);
        halo.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
        halo.addColorStop(0.5, 'rgba(14, 165, 233, 0.6)');
        halo.addColorStop(1, 'rgba(2, 132, 199, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(btnCX, btnCY, 28, 0, Math.PI * 2);
        ctx.fill();
      }

      // Metallic Button Center
      const btnGrad = ctx.createRadialGradient(btnCX - 3, btnCY - 3, 2, btnCX, btnCY, 16);
      btnGrad.addColorStop(0, '#f8fafc');
      btnGrad.addColorStop(0.5, '#94a3b8');
      btnGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = btnGrad;
      ctx.beginPath();
      ctx.arc(btnCX, btnCY, 16, 0, Math.PI * 2);
      ctx.fill();

      // Illuminated Power Symbol
      ctx.strokeStyle = isPowered ? '#38bdf8' : '#64748b';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(btnCX, btnCY + 1, 8, -Math.PI * 0.7, Math.PI * 0.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(btnCX, btnCY - 8);
      ctx.lineTo(btnCX, btnCY);
      ctx.stroke();

      // Small Reset Button Below
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(btnCX, btnCY + 32, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // 3E. Front USB 3.0 Ports (Target for draggable USB drive)
      const usbPortX = frontX + 38;
      const usbPortY = cpuTop + 185;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(usbPortX, usbPortY, 18, 7);
      ctx.fillRect(usbPortX + 24, usbPortY, 18, 7);

      // Blue USB 3.0 internal connector tongue
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(usbPortX + 2, usbPortY + 2, 8, 3);
      ctx.fillRect(usbPortX + 26, usbPortY + 2, 8, 3);

      // Snap highlight hint when dragging USB near
      if (draggingItemRef.current === 'usb' && !usbState.isPlugged) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(usbPortX - 6, usbPortY - 6, 56, 19);
      }

      // If USB is plugged in, render it directly protruding from port
      if (usbState.isPlugged) {
        ctx.save();
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(usbPortX - 2, usbPortY - 4, 32, 15, 3);
        ctx.fill();
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(usbPortX + 22, usbPortY + 2, 4, 3);
        // Status LED
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(usbPortX + 8, usbPortY + 3.5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 3F. Lower Horizontal Cooling Slats
      const slatYStart = cpuTop + 215;
      const slatW = cpuFrontW - 54;
      const slatH = 4.5;
      for (let s = 0; s < 6; s++) {
        const sy = slatYStart + s * 9;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(frontX + 27, sy, slatW, slatH, 2);
        ctx.fill();
      }

      // Rubber Feet under Tower
      ctx.fillStyle = '#090d16';
      ctx.fillRect(frontX + 16, cpuTop + cpuH, 20, 8);
      ctx.fillRect(frontX + cpuFrontW - 36, cpuTop + cpuH, 20, 8);
      ctx.restore();

      // 4. WIDESCREEN LCD/LED MONITOR
      ctx.save();
      const monX = 75;
      const monY = 40;
      const monW = 450;
      const monH = 295;

      if (selectedId === 'monitor' || hoveredId === 'monitor') {
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 24;
      }

      // Stand brushed aluminum pillar
      const standFootCX = 280;
      const standFootCY = 368;
      const neckGrad = ctx.createLinearGradient(standFootCX - 18, 0, standFootCX + 18, 0);
      neckGrad.addColorStop(0, '#f8fafc');
      neckGrad.addColorStop(0.5, '#94a3b8');
      neckGrad.addColorStop(1, '#475569');
      ctx.fillStyle = neckGrad;

      ctx.beginPath();
      ctx.moveTo(standFootCX - 16, monY + monH - 10);
      ctx.lineTo(standFootCX + 16, monY + monH - 10);
      ctx.lineTo(standFootCX + 24, standFootCY);
      ctx.lineTo(standFootCX - 24, standFootCY);
      ctx.closePath();
      ctx.fill();

      // Stand base wedge
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(standFootCX - 90, standFootCY + 8);
      ctx.lineTo(standFootCX - 50, standFootCY - 8);
      ctx.lineTo(standFootCX + 50, standFootCY - 8);
      ctx.lineTo(standFootCX + 90, standFootCY + 8);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Monitor Outer Gunmetal Bezel
      const frameGrad = ctx.createLinearGradient(monX, monY, monX + monW, monY + monH);
      frameGrad.addColorStop(0, '#1e293b');
      frameGrad.addColorStop(0.5, '#0f172a');
      frameGrad.addColorStop(1, '#020617');
      ctx.fillStyle = frameGrad;

      ctx.beginPath();
      ctx.roundRect(monX, monY, monW, monH, 8);
      ctx.fill();

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Screen Interior
      const screenX = monX + 8;
      const screenY = monY + 8;
      const screenW = monW - 16;
      const screenH = monH - 24;

      ctx.save();
      ctx.beginPath();
      ctx.rect(screenX, screenY, screenW, screenH);
      ctx.clip();

      if (isPowered) {
        // Himalayan OS Desktop Wallpaper
        const wallGrad = ctx.createLinearGradient(screenX, screenY, screenX, screenY + screenH);
        wallGrad.addColorStop(0, '#0284c7');
        wallGrad.addColorStop(0.45, '#38bdf8');
        wallGrad.addColorStop(0.7, '#fef08a');
        wallGrad.addColorStop(1, '#059669');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(screenX, screenY, screenW, screenH);

        // Snow Mountain Peaks
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(screenX + 30, screenY + 180);
        ctx.lineTo(screenX + 110, screenY + 95);
        ctx.lineTo(screenX + 180, screenY + 180);
        ctx.lineTo(screenX + 250, screenY + 80);
        ctx.lineTo(screenX + 340, screenY + 180);
        ctx.lineTo(screenX + 410, screenY + 110);
        ctx.lineTo(screenX + screenW, screenY + 180);
        ctx.lineTo(screenX + screenW, screenY + screenH);
        ctx.lineTo(screenX, screenY + screenH);
        ctx.closePath();
        ctx.fill();

        // Nepal OS Taskbar
        const taskbarH = 22;
        const taskbarY = screenY + screenH - taskbarH;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(screenX, taskbarY, screenW, taskbarH);

        // Nepal Flag Icon
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(screenX + 6, taskbarY + 3, 22, 16, 4);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🇳🇵', screenX + 17, taskbarY + 14);

        // Live Clock
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('10:45 AM', screenX + screenW - 8, taskbarY + 14);

        // Live Notepad Window
        const winX = screenX + 45;
        const winY = screenY + 35;
        const winW = 280;
        const winH = 160;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
        ctx.beginPath();
        ctx.roundRect(winX + 4, winY + 4, winW, winH, 8);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(winX, winY, winW, winH, 8);
        ctx.fill();

        // Window Title Bar
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.roundRect(winX, winY, winW, 24, [8, 8, 0, 0]);
        ctx.fill();

        // Window dots
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(winX + winW - 32, winY + 12, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(winX + winW - 22, winY + 12, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(winX + winW - 12, winY + 12, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Nepal Digital WordPad — Live Typing', winX + 10, winY + 16);

        // Window Text Content
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 15px monospace';
        ctx.fillText(typedText + (Math.floor(time * 3) % 2 === 0 ? '|' : ''), winX + 16, winY + 60);

        ctx.fillStyle = '#64748b';
        ctx.font = '9px sans-serif';
        ctx.fillText('Type on the keyboard below to write text on screen', winX + 16, winY + 85);
        ctx.fillText(`Mouse Click Counter: ${mouseClickCount}`, winX + 16, winY + 102);

        // Live Peripheral Notification Badges on Screen
        if (usbState.isPlugged) {
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.roundRect(winX + 16, winY + 118, 245, 26, 6);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('💾 USB 3.0 Flash Drive Mounted (16 GB)', winX + 24, winY + 134);
        } else if (discState.isInserted) {
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.roundRect(winX + 16, winY + 118, 245, 26, 6);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('💿 DVD-ROM: Grade 4 Science Multimedia Lab', winX + 24, winY + 134);
        }

        // Diagonal Anti-Glare Glass Sheen
        const glassSheen = ctx.createLinearGradient(screenX, screenY, screenX + screenW, screenY + screenH);
        glassSheen.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
        glassSheen.addColorStop(0.3, 'rgba(255, 255, 255, 0.04)');
        glassSheen.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        glassSheen.addColorStop(0.8, 'rgba(255, 255, 255, 0.08)');
        glassSheen.addColorStop(1, 'rgba(255, 255, 255, 0.15)');
        ctx.fillStyle = glassSheen;
        ctx.fillRect(screenX, screenY, screenW, screenH);
      } else {
        // Powered Off Glass
        ctx.fillStyle = '#020617';
        ctx.fillRect(screenX, screenY, screenW, screenH);
      }
      ctx.restore();
      ctx.restore();

      // 5. MOVABLE ERGONOMIC KEYBOARD (Centered around kbPos)
      ctx.save();
      const kbW = 480;
      const kbH = 110;
      const kbX = kbPos.x - kbW / 2;
      const kbY = kbPos.y - kbH / 2;

      if (selectedId === 'keyboard' || hoveredId === 'keyboard' || draggingItemRef.current === 'keyboard') {
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 20;
      }

      // Sculpted Navy Wrist Rest
      const restGrad = ctx.createLinearGradient(kbX, kbY + 60, kbX, kbY + kbH);
      restGrad.addColorStop(0, '#1e293b');
      restGrad.addColorStop(0.2, '#1e3a5f');
      restGrad.addColorStop(0.8, '#0f172a');
      restGrad.addColorStop(1, '#020617');
      ctx.fillStyle = restGrad;

      ctx.beginPath();
      ctx.moveTo(kbX, kbY + 45);
      ctx.quadraticCurveTo(kbX + kbW * 0.45, kbY + 35, kbX + kbW, kbY + 45);
      ctx.lineTo(kbX + kbW - 4, kbY + kbH - 6);
      ctx.quadraticCurveTo(kbX + kbW * 0.6, kbY + kbH + 6, kbX + 4, kbY + kbH - 6);
      ctx.closePath();
      ctx.fill();

      // Silver Perimeter Bevel Frame
      const frameKbGrad = ctx.createLinearGradient(kbX + 15, kbY, kbX + kbW - 15, kbY);
      frameKbGrad.addColorStop(0, '#cbd5e1');
      frameKbGrad.addColorStop(0.5, '#f8fafc');
      frameKbGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = frameKbGrad;

      ctx.beginPath();
      ctx.roundRect(kbX + 16, kbY, kbW - 32, 65, 8);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Keyboard key well
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(kbX + 22, kbY + 6, kbW - 44, 53, 5);
      ctx.fill();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Keycaps Grid
      const rows = 4;
      const cols = 15;
      const keySpacingX = (kbW - 56) / cols;
      const keySpacingY = 11.5;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const kx = kbX + 26 + c * keySpacingX;
          const ky = kbY + 9 + r * keySpacingY;
          const kw = keySpacingX - 2.5;
          const kh = 8.5;

          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.roundRect(kx, ky, kw, kh, 1.5);
          ctx.fill();

          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(kx + 0.5, ky + 0.5, kw - 1, kh - 1, 1);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect(kx + kw * 0.35, ky + 2, kw * 0.3, 1.2);
        }
      }

      // Spacebar
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(kbX + 160, kbY + 45, 140, 8.5, 2);
      ctx.fill();

      // Status LEDs
      for (let led = 0; led < 3; led++) {
        ctx.fillStyle = isPowered ? '#22c55e' : '#334155';
        ctx.beginPath();
        ctx.arc(kbX + kbW - 45 + led * 8, kbY + 12, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 6. MOVABLE OPTICAL MOUSE (Centered around mousePos)
      ctx.save();
      const mCX = mousePos.x;
      const mCY = mousePos.y;
      const mW = 55;
      const mH = 78;

      if (selectedId === 'mouse' || hoveredId === 'mouse' || draggingItemRef.current === 'mouse') {
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 20;
      }

      // Midnight-Blue Lower Grip
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(mCX, mCY + 6, mW / 2 + 3, mH / 2 + 2, 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Silver Pearlescent Shell
      const mouseGrad = ctx.createRadialGradient(mCX - 8, mCY - 14, 4, mCX, mCY, mH / 2);
      mouseGrad.addColorStop(0, '#ffffff');
      mouseGrad.addColorStop(0.35, '#e2e8f0');
      mouseGrad.addColorStop(0.8, '#cbd5e1');
      mouseGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = mouseGrad;

      ctx.beginPath();
      ctx.ellipse(mCX, mCY, mW / 2, mH / 2, 0.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Click button seam line
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mCX, mCY - mH / 2 + 2);
      ctx.lineTo(mCX, mCY - 10);
      ctx.stroke();

      // Textured Rubber Scroll Wheel
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(mCX - 3, mCY - 24, 6, 16, 3);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();

      // 7. DRAGGABLE USB 3.0 FLASH DRIVE (When unplugged)
      if (!usbState.isPlugged) {
        ctx.save();
        const ux = usbState.x;
        const uy = usbState.y;

        // Lift shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.beginPath();
        ctx.ellipse(ux, uy + 14, 20, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Metallic USB-A Plug
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(ux - 18, uy - 5, 12, 10);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.strokeRect(ux - 18, uy - 5, 12, 10);
        // USB pin holes
        ctx.fillStyle = '#475569';
        ctx.fillRect(ux - 14, uy - 3, 3, 2);
        ctx.fillRect(ux - 14, uy + 1, 3, 2);

        // Body casing (brushed cobalt metal)
        const usbGrad = ctx.createLinearGradient(ux - 6, uy - 8, ux + 22, uy + 8);
        usbGrad.addColorStop(0, '#0284c7');
        usbGrad.addColorStop(0.5, '#0369a1');
        usbGrad.addColorStop(1, '#0c4a6e');
        ctx.fillStyle = usbGrad;
        ctx.beginPath();
        ctx.roundRect(ux - 6, uy - 8, 28, 16, 3);
        ctx.fill();

        // Status LED & label
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(ux + 14, uy, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('16GB', ux + 5, uy + 3);

        ctx.restore();
      }

      // 8. DRAGGABLE HOLOGRAPHIC CD/DVD DISC (When not inserted in drive)
      if (!discState.isInserted) {
        ctx.save();
        const dx = discState.x;
        const dy = discState.y;

        // Lift shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
        ctx.beginPath();
        ctx.ellipse(dx, dy + 18, 26, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Holographic disc body
        const discGrad = ctx.createRadialGradient(dx, dy, 6, dx, dy, 26);
        discGrad.addColorStop(0, '#ffffff');
        discGrad.addColorStop(0.2, '#bae6fd');
        discGrad.addColorStop(0.5, '#fde68a');
        discGrad.addColorStop(0.75, '#c084fc');
        discGrad.addColorStop(1, '#38bdf8');
        ctx.fillStyle = discGrad;

        ctx.beginPath();
        ctx.arc(dx, dy, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Inner clear ring
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(dx, dy, 8, 0, Math.PI * 2);
        ctx.fill();

        // Center spindle hole
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.arc(dx, dy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedId, hoveredId, isPowered, isTrayEjected, typedText, mouseClickCount, usbState, discState, kbPos, mousePos, lang]);

  return (
    <SimulationLayout
      titleEn="2D Computer Workstation Explorer"
      titleNe="कम्प्युटर कार्यस्थल 2डी अन्वेषक"
      subject="Science"
      grade={4}
      chapter={2}
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
            background: '#ffffff',
          }}
        >
          {/* Main 2D Canvas */}
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onMouseDown={handlePointerDown}
            onMouseMove={handleCanvasMouseMove}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
              cursor: 'grab',
            }}
          />

          {/* Top Quick Badges */}
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
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Cpu size={14} color="#38bdf8" />
              {lang === 'ne' ? 'कम्प्युटर हार्डवेयर प्रणाली' : 'Workstation Architecture'}
            </span>

            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
                fontSize: '11px',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Check size={14} color="#4ade80" />
              {lang === 'ne'
                ? `अन्वेषण: ${exploredList.length}/${Object.keys(COMPONENTS).length}`
                : `Explored: ${exploredList.length}/${Object.keys(COMPONENTS).length}`}
            </span>
          </div>

          {/* Top-Right Quick Tools */}
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
              onClick={handleToggleAudio}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: isMuted ? 'rgba(15, 23, 42, 0.8)' : 'rgba(56, 189, 248, 0.25)',
                color: isMuted ? '#94a3b8' : '#38bdf8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 700,
              }}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {isMuted ? (lang === 'ne' ? 'आवाज बन्द' : 'Muted') : (lang === 'ne' ? 'ध्वनि' : 'Audio')}
            </button>

            <button
              onClick={handleTogglePower}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                border: 'none',
                background: isPowered
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isPowered ? '0 2px 10px rgba(16, 185, 129, 0.4)' : '0 2px 10px rgba(239, 68, 68, 0.4)',
              }}
            >
              <Power size={14} />
              {isPowered ? (lang === 'ne' ? 'पावर बन्द' : 'Power Off') : (lang === 'ne' ? 'पावर चालु' : 'Power On')}
            </button>

            <button
              onClick={handleReset}
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                color: '#475569',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RotateCcw size={14} />
              {lang === 'ne' ? 'रिसेट' : 'Reset'}
            </button>
          </div>

          {/* Bottom Floating Status Dock */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              backdropFilter: 'blur(12px)',
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Cpu size={16} color="#38bdf8" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {lang === 'ne' ? currentComponent.nameNe : currentComponent.nameEn}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'ne' ? currentComponent.summaryNe : currentComponent.summaryEn}
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: '11px',
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8' }} />
              {lang === 'ne'
                ? '💡 सुझाव: पेनड्राइभ र सिडीलाई माउसले तानेर सीपीयूमा जोड्नुहोस्!'
                : '💡 Tip: Drag & drop the USB flash drive or CD disc into the CPU tower!'}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: DISCOVERY STATION & HARDWARE INSPECTOR (380px)
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
            color: '#fff',
          }}
        >
          {/* Discovery Station Header */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Cpu size={18} color="#38bdf8" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.3px' }}>
                {lang === 'ne' ? 'कम्प्युटर हार्डवेयर प्रयोगशाला' : 'Hardware Discovery Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.45 }}>
              {lang === 'ne'
                ? 'कम्प्युटरका सम्पूर्ण मुख्य हार्डवेयर यन्त्रहरू छान्नुहोस्, प्राविधिक विवरण जाँच्नुहोस् र प्रत्यक्ष अन्तरक्रिया गर्नुहोस्।'
                : 'Select core workstation components, inspect architectural specifications, and test live hardware actions.'}
            </div>
          </div>

          {/* Component Selection Grid (2 Columns) */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
              {lang === 'ne' ? 'हार्डवेयर यन्त्रहरू छान्नुहोस्' : 'Select Hardware Component'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {(
                [
                  { id: 'monitor', icon: Monitor, labelEn: 'Monitor', labelNe: 'मोनिटर' },
                  { id: 'cpu', icon: Cpu, labelEn: 'CPU Tower', labelNe: 'सीपीयू' },
                  { id: 'keyboard', icon: KeyboardIcon, labelEn: 'Keyboard', labelNe: 'किबोर्ड' },
                  { id: 'mouse', icon: MouseIcon, labelEn: 'Mouse', labelNe: 'माउस' },
                  { id: 'storage', icon: HardDrive, labelEn: 'Storage', labelNe: 'भण्डारण' },
                ] as const
              ).map((item) => {
                const active = selectedId === item.id;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectComponent(item.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: active ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: active ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: active ? '#38bdf8' : '#cbd5e1',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      textAlign: 'left',
                    }}
                  >
                    <IconComp size={14} color={active ? '#38bdf8' : '#94a3b8'} />
                    <span>{lang === 'ne' ? item.labelNe : item.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Technical Specifications */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                {lang === 'ne' ? 'प्राविधिक विवरण (Specs):' : 'Key Specifications:'}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                {lang === 'ne' ? currentComponent.categoryNe : currentComponent.categoryEn}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {currentComponent.specs.map((sp, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>
                    {lang === 'ne' ? sp.labelNe : sp.labelEn}
                  </span>
                  <span style={{ fontSize: '11px', color: '#0f172a', fontWeight: 700 }}>{sp.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Hardware Test Controls */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px', textTransform: 'uppercase' }}>
              {lang === 'ne' ? 'प्रत्यक्ष अन्तरक्रिया (Live Hardware Test):' : 'Interactive Hardware Test:'}
            </div>

            {selectedId === 'cpu' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={handleTogglePower}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Power size={14} />
                  {isPowered
                    ? (lang === 'ne' ? 'पावर बन्द गर्नुहोस् (Shut Down)' : 'Press Power Button (Turn Off)')
                    : (lang === 'ne' ? 'पावर चालु गर्नुहोस् (Power On)' : 'Press Power Button (Turn On)')}
                </button>
                <button
                  onClick={handleToggleTray}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#475569',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Disc size={14} color="#f59e0b" />
                  {isTrayEjected
                    ? (lang === 'ne' ? 'डिस्क ट्रे भित्र पठाउनुहोस्' : 'Close CD/DVD Tray')
                    : (lang === 'ne' ? 'डिस्क ट्रे बाहिर निकाल्नुहोस् (Eject)' : 'Eject CD/DVD Tray')}
                </button>
              </div>
            )}

            {selectedId === 'storage' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={handleToggleTray}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Disc size={14} />
                  {isTrayEjected
                    ? (lang === 'ne' ? 'डिस्क ट्रे बन्द गर्नुहोस्' : 'Close Disc Tray')
                    : (lang === 'ne' ? 'डिस्क ट्रे खोल्नुहोस् (Eject)' : 'Eject Optical Disc Tray')}
                </button>
                <button
                  onClick={() => {
                    setUsbState((prev) => ({
                      ...prev,
                      isPlugged: !prev.isPlugged,
                      x: prev.isPlugged ? 840 : 685,
                      y: prev.isPlugged ? 460 : 155,
                    }));
                    ScienceAudio.playSuccess();
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: '#475569',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <Usb size={14} color="#38bdf8" />
                  {usbState.isPlugged
                    ? (lang === 'ne' ? 'पेनड्राइभ झिक्नुहोस् (Unplug USB)' : 'Unplug USB Flash Drive')
                    : (lang === 'ne' ? 'पेनड्राइभ जोड्नुहोस् (Plug USB)' : 'Plug USB Flash Drive')}
                </button>
              </div>
            )}

            {selectedId === 'keyboard' && (
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                  {lang === 'ne' ? 'अक्षरहरू थिचेर स्क्रिनमा लेख्नुहोस्:' : 'Click letters below to type onto monitor:'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                  {['N', 'E', 'P', 'A', 'L', 'S', 'C', 'I', 'E', 'N', 'C', 'E'].map((letter, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTypeKey(letter)}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid #e2e8f0',
                        color: '#0f172a',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {letter}
                    </button>
                  ))}
                  <button
                    onClick={() => setTypedText('')}
                    style={{
                      padding: '0 8px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      fontSize: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Clear
                  </button>
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#38bdf8',
                    fontFamily: 'monospace',
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '6px 8px',
                    borderRadius: '6px',
                  }}
                >
                  Screen Buffer: "{typedText}"
                </div>
              </div>
            )}

            {selectedId === 'mouse' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                  <button
                    onClick={() => handleMouseClick('left')}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid #e2e8f0',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Left Click
                  </button>
                  <button
                    onClick={() => handleMouseClick('right')}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid #e2e8f0',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Right Click
                  </button>
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#4ade80',
                    background: 'rgba(34, 197, 94, 0.15)',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    textAlign: 'center',
                  }}
                >
                  Total Clicks Tested: {mouseClickCount}
                </div>
              </div>
            )}

            {selectedId === 'monitor' && (
              <button
                onClick={handleTogglePower}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Monitor size={14} />
                {isPowered
                  ? (lang === 'ne' ? 'स्क्रिन बन्द गर्नुहोस् (Power Off)' : 'Turn Off Screen')
                  : (lang === 'ne' ? 'स्क्रिन खोल्नुहोस् (Power On)' : 'Turn On Screen')}
              </button>
            )}
          </div>

          {/* Curriculum Key Takeaway Card */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '11px',
              color: '#475569',
              lineHeight: 1.45,
            }}
          >
            <div style={{ fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
              💡 {lang === 'ne' ? 'पाठ्यक्रम मुख्य निष्कर्ष:' : 'Curriculum Key Takeaway:'}
            </div>
            {lang === 'ne' ? currentComponent.funFactNe : currentComponent.funFactEn}
          </div>

          {/* Prominent Completion Button */}
          <button
            onClick={() => {
              setIsCompleted(true);
              setStars(3);
              ScienceAudio.playCelebration();
            }}
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Check size={16} />
            {lang === 'en' ? 'Complete Hardware Lab & Quiz' : 'हार्डवेयर प्रयोगशाला पूरा गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default ExploreComputerSim;
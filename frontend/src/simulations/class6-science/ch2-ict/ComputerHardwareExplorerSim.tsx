/**
 * ComputerHardwareExplorerSim.tsx
 * Simulation 3: 2D Computer Hardware Workstation Explorer
 * Grade 6 Science • Unit 2: Information & Communication Technology
 *
 * Full 2D Interactive Computer Workstation featuring:
 * 1. Monitor (Display unit - Output) with live active operating system screen
 * 2. System Unit / CPU Tower with cutaway inside view:
 *    - Motherboard & System Bus
 *    - Microprocessor / CPU (The Brain with spinning cooling fan)
 *    - RAM sticks (High-speed Volatile Memory)
 *    - Storage SSD/HDD (Persistent Secondary Storage)
 * 3. Input Devices: Keyboard & Optical Mouse
 * 4. Data Flow Animation: Data packets traveling Input -> CPU -> Memory -> Output
 */

import React, { useState, useEffect, useRef } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Monitor, Cpu, HardDrive, Keyboard, Mouse, Sparkles, CheckCircle2 } from 'lucide-react';

interface HardwarePart {
  id: string;
  nameEn: string;
  nameNe: string;
  categoryEn: 'Input' | 'Output' | 'Processing' | 'Storage';
  categoryNe: 'इनपुट' | 'आउटपुट' | 'प्रशोधन (CPU)' | 'भण्डारण (Storage)';
  descriptionEn: string;
  descriptionNe: string;
  color: string;
}

const PARTS: HardwarePart[] = [
  {
    id: 'cpu',
    nameEn: 'Microprocessor / CPU',
    nameNe: 'सीपीयू (CPU - Central Processing Unit)',
    categoryEn: 'Processing',
    categoryNe: 'प्रशोधन (CPU)',
    descriptionEn: 'The brain of the computer that executes software instructions, performs arithmetic calculations, and coordinates all components.',
    descriptionNe: 'कम्प्युटरको मस्तिष्क जसले सबै हिसाब-किताब, निर्देशनहरूको विश्लेषण र हार्डवेयरहरूलाई नियन्त्रण गर्दछ।',
    color: '#0284c7',
  },
  {
    id: 'ram',
    nameEn: 'RAM (Random Access Memory)',
    nameNe: 'र्याम (RAM - Random Access Memory)',
    categoryEn: 'Storage',
    categoryNe: 'भण्डारण (Storage)',
    descriptionEn: 'Ultra-fast temporary volatile working memory that holds active running programs and open files. Erases when power turns off.',
    descriptionNe: 'कम्प्युटर चालु हुँदा तत्काल चाहिने फाइल र प्रोग्रामहरू अस्थायी रूपमा राख्ने तीव्र गतिको मेमोरी।',
    color: '#10b981',
  },
  {
    id: 'ssd',
    nameEn: 'SSD / Hard Drive Storage',
    nameNe: 'हार्ड ड्राइभ / एसएसडी (SSD/HDD)',
    categoryEn: 'Storage',
    categoryNe: 'भण्डारण (Storage)',
    descriptionEn: 'Permanent secondary storage device that retains operating system files, apps, photos, and documents safely even after shutdown.',
    descriptionNe: 'कम्प्युटर बन्द हुँदा पनि अपरेटिङ सिस्टम, तस्बिर, भिडियो र फाइलहरू सुरक्षित राख्ने स्थायी भण्डारण।',
    color: '#f59e0b',
  },
  {
    id: 'monitor',
    nameEn: 'LED Monitor',
    nameNe: 'मनिटर (LED Monitor)',
    categoryEn: 'Output',
    categoryNe: 'आउटपुट',
    descriptionEn: 'Visual output display unit that projects processed graphics, text, videos, and user interfaces.',
    descriptionNe: 'कम्प्युटरले प्रशोधन गरेका नतिजा, अक्षर, चित्र र भिडियो पर्दामा देखाउने मुख्य आउटपुट उपकरण।',
    color: '#38bdf8',
  },
  {
    id: 'keyboard',
    nameEn: 'Keyboard',
    nameNe: 'किबोर्ड (Keyboard)',
    categoryEn: 'Input',
    categoryNe: 'इनपुट',
    descriptionEn: 'Primary alphanumeric text and command input device containing functional, numerical, and cursor keys.',
    descriptionNe: 'अक्षर, अङ्क, सङ्केत र निर्देशनहरू कम्प्युटरभित्र पठाउने प्राथमिक इनपुट उपकरण।',
    color: '#a855f7',
  },
  {
    id: 'mouse',
    nameEn: 'Optical Mouse',
    nameNe: 'माउस (Optical Mouse)',
    categoryEn: 'Input',
    categoryNe: 'इनपुट',
    descriptionEn: 'Handheld pointing device with left/right click buttons and scroll wheel for intuitive GUI navigation.',
    descriptionNe: 'कम्प्युटर स्क्रिनमा कर्सर चलाउन, क्लिक गर्न र फाइल खोल्न प्रयोग हुने पोइन्टिङ इनपुट उपकरण।',
    color: '#ec4899',
  },
];

export const ComputerHardwareExplorerSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [selectedPartId, setSelectedPartId] = useState<string>('cpu');
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);

  const currentPart = PARTS.find(p => p.id === selectedPartId) || PARTS[0];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // 2D Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      timeRef.current += 0.03;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Office desk backdrop
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#f8fafc');
      bg.addColorStop(0.7, '#f1f5f9');
      bg.addColorStop(1, '#ffffff');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Wooden Computer Desk
      const deskY = h - 100;
      ctx.fillStyle = '#334155';
      ctx.fillRect(20, deskY, w - 40, 20);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(20, deskY + 20, w - 40, 80);

      // 1. MONITOR (Center Left: cx = w * 0.35)
      const monX = w * 0.35;
      const monY = deskY - 200;
      const monW = 220;
      const monH = 140;

      // Monitor Stand
      ctx.fillStyle = '#475569';
      ctx.fillRect(monX - 15, deskY - 60, 30, 60);
      ctx.beginPath();
      ctx.ellipse(monX, deskY, 50, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Monitor Bezel Frame
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = selectedPartId === 'monitor' ? '#38bdf8' : '#475569';
      ctx.lineWidth = selectedPartId === 'monitor' ? 3 : 2;
      ctx.beginPath();
      ctx.roundRect(monX - monW / 2, monY, monW, monH, 8);
      ctx.fill();
      ctx.stroke();

      // Monitor Active Screen
      const scrX = monX - monW / 2 + 8;
      const scrY = monY + 8;
      const scrW = monW - 16;
      const scrH = monH - 24;

      const scrGrad = ctx.createLinearGradient(scrX, scrY, scrX, scrY + scrH);
      scrGrad.addColorStop(0, '#0369a1');
      scrGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = scrGrad;
      ctx.fillRect(scrX, scrY, scrW, scrH);

      // Window GUI inside screen
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('Nepal Digital Education OS', scrX + 12, scrY + 22);

      // Binary code stream on screen
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '9px monospace';
      ctx.fillText('01001110 01000101', scrX + 12, scrY + 45);
      ctx.fillText('01010000 01000001', scrX + 12, scrY + 60);
      ctx.fillText('01001100 00110001', scrX + 12, scrY + 75);

      // 2. KEYBOARD (Below Monitor on desk)
      const kbX = monX - 20;
      const kbY = deskY + 10;
      const kbW = 160;
      const kbH = 45;

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = selectedPartId === 'keyboard' ? '#a855f7' : '#475569';
      ctx.lineWidth = selectedPartId === 'keyboard' ? 3 : 1.5;
      ctx.beginPath();
      ctx.roundRect(kbX - kbW / 2, kbY, kbW, kbH, 4);
      ctx.fill();
      ctx.stroke();

      // Key rows
      ctx.fillStyle = '#334155';
      for (let r = 0; r < 3; r++) {
        for (let k = 0; k < 10; k++) {
          const kx = kbX - kbW / 2 + 8 + k * 14;
          const ky = kbY + 6 + r * 12;
          ctx.fillRect(kx, ky, 10, 8);
        }
      }

      // 3. OPTICAL MOUSE (Right of keyboard)
      const mouseX = kbX + kbW / 2 + 35;
      const mouseY = deskY + 25;
      const mouseW = 24;
      const mouseH = 36;

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = selectedPartId === 'mouse' ? '#ec4899' : '#475569';
      ctx.lineWidth = selectedPartId === 'mouse' ? 3 : 1.5;
      ctx.beginPath();
      ctx.ellipse(mouseX, mouseY, mouseW / 2, mouseH / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Mouse scroll wheel
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(mouseX - 2, mouseY - 12, 4, 10);

      // 4. SYSTEM UNIT / CPU TOWER CUTAWAY (Right: cx = w * 0.72)
      const towX = w * 0.72;
      const towY = deskY - 260;
      const towW = 150;
      const towH = 260;

      // Outer Case Chassis
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(towX - towW / 2, towY, towW, towH, 8);
      ctx.fill();
      ctx.stroke();

      // Internal Motherboard (Green Printed Circuit Board)
      const mbX = towX - towW / 2 + 10;
      const mbY = towY + 15;
      const mbW = towW - 20;
      const mbH = towH - 30;

      ctx.fillStyle = '#064e3b';
      ctx.fillRect(mbX, mbY, mbW, mbH);

      // Gold PCB circuit bus traces
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
      ctx.lineWidth = 1;
      for (let b = 1; b <= 5; b++) {
        ctx.beginPath();
        ctx.moveTo(mbX + 15, mbY + b * 40);
        ctx.lineTo(mbX + mbW - 15, mbY + b * 40);
        ctx.stroke();
      }

      // (A) CPU Microprocessor Socket & Spinning Fan
      const cpuX = towX - 20;
      const cpuY = towY + 80;
      const cpuSize = 46;

      ctx.fillStyle = '#334155';
      ctx.strokeStyle = selectedPartId === 'cpu' ? '#0284c7' : '#94a3b8';
      ctx.lineWidth = selectedPartId === 'cpu' ? 3 : 1.5;
      ctx.strokeRect(cpuX - cpuSize / 2, cpuY - cpuSize / 2, cpuSize, cpuSize);

      // Heat Sink & Fan
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(cpuX, cpuY, 18, 0, Math.PI * 2);
      ctx.fill();

      // Spinning Fan Blades
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      for (let b = 0; b < 4; b++) {
        const ang = t * 15 + (b * Math.PI) / 2;
        ctx.beginPath();
        ctx.moveTo(cpuX, cpuY);
        ctx.lineTo(cpuX + Math.cos(ang) * 16, cpuY + Math.sin(ang) * 16);
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('CPU', cpuX - 8, cpuY + 30);

      // (B) RAM Sticks (Green vertical slots next to CPU)
      const ramX = towX + 35;
      const ramY = cpuY - 30;
      const ramW = 8;
      const ramH = 65;

      ctx.fillStyle = selectedPartId === 'ram' ? '#10b981' : '#059669';
      ctx.strokeStyle = selectedPartId === 'ram' ? '#34d399' : '#0f172a';
      ctx.lineWidth = selectedPartId === 'ram' ? 2 : 1;
      ctx.fillRect(ramX, ramY, ramW, ramH);
      ctx.strokeRect(ramX, ramY, ramW, ramH);

      // Gold pins on RAM
      ctx.fillStyle = '#facc15';
      ctx.fillRect(ramX, ramY + ramH - 4, ramW, 4);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('RAM', ramX - 5, ramY + ramH + 12);

      // (C) SSD / Hard Drive Drive Bay (Bottom of Tower)
      const ssdX = towX;
      const ssdY = towY + towH - 55;
      const ssdW = 75;
      const ssdH = 26;

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = selectedPartId === 'ssd' ? '#f59e0b' : '#64748b';
      ctx.lineWidth = selectedPartId === 'ssd' ? 2.5 : 1;
      ctx.beginPath();
      ctx.roundRect(ssdX - ssdW / 2, ssdY, ssdW, ssdH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('SSD 512GB', ssdX - 25, ssdY + 16);

      // Flowing data bit packets (connecting Input -> CPU -> Screen)
      ctx.fillStyle = '#38bdf8';
      for (let p = 0; p < 8; p++) {
        const flowFrac = ((t * 0.4 + p / 8) % 1);
        const fx = monX + (towX - monX) * flowFrac;
        const fy = deskY - 30 + Math.sin(flowFrac * Math.PI) * 20;
        ctx.beginPath();
        ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Live metrics HUD
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(20, 20, 260, 95, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(lang === 'en' ? 'Inspected Hardware:' : 'परीक्षण गरिएको हार्डवेयर:', 32, 40);
      ctx.fillStyle = currentPart.color;
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(lang === 'en' ? currentPart.nameEn.split('(')[0] : currentPart.nameNe.split('(')[0], 32, 62);

      ctx.fillStyle = '#f59e0b';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Category: ${lang === 'en' ? currentPart.categoryEn : currentPart.categoryNe}`, 32, 82);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.fillText('Architecture: Von Neumann (CPU, Memory, I/O)', 32, 102);

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [selectedPartId, currentPart, lang]);

  const handleStageChange = (newStage: SimulationStage) => {
    setStage(newStage);
    ScienceAudio.playClick();
    if (newStage === 'challenge' && stars < 3) {
      setStars(3);
    }
  };

  return (
    <SimulationLayout
      titleEn="Computer Hardware Workstation Explorer"
      titleNe="कम्प्युटर हार्डवेयर अन्वेषण"
      learningAreaEn="ICT"
      learningAreaNe="सूचना तथा सञ्चार प्रविधि"
      currentStage={stage}
      onStageChange={handleStageChange}
      lang={lang}
      onLanguageToggle={() => {
        setLang(l => (l === 'en' ? 'ne' : 'en'));
        ScienceAudio.playClick();
      }}
      stars={stars}
      isCompleted={isCompleted}
      onBackToLibrary={onBackToLibrary}
    >
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 390px', gap: '16px', padding: '16px', height: '100%', overflow: 'hidden' }}>
        {/* 2D Canvas Viewport */}
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <canvas
            ref={canvasRef}
            width={720}
            height={520}
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
          />
        </div>

        {/* Sidebar Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', paddingRight: '4px' }}>
          {/* Hardware Parts Selector */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} />
              {lang === 'en' ? 'Computer Components' : 'कम्प्युटरका मुख्य अङ्गहरू'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
              {PARTS.map(part => (
                <button
                  key={part.id}
                  onClick={() => {
                    setSelectedPartId(part.id);
                    ScienceAudio.playClick();
                    if (!isCompleted) {
                      setIsCompleted(true);
                      setStars(3);
                    }
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: selectedPartId === part.id ? `2px solid ${part.color}` : '1px solid rgba(255,255,255,0.1)',
                    background: selectedPartId === part.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.5)',
                    color: selectedPartId === part.id ? '#ffffff' : '#94a3b8',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div>{lang === 'en' ? part.nameEn.split('(')[0] : part.nameNe.split('(')[0]}</div>
                  <div style={{ fontSize: '9px', color: part.color, marginTop: '2px' }}>
                    {lang === 'en' ? part.categoryEn : part.categoryNe}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Component Info Card */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: currentPart.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} />
              {lang === 'en' ? currentPart.nameEn : currentPart.nameNe}
            </h4>
            <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold', marginBottom: '4px' }}>
              {lang === 'en' ? 'Role & Function:' : 'कार्य तथा भूमिका:'}
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
              {lang === 'en' ? currentPart.descriptionEn : currentPart.descriptionNe}
            </p>
          </div>

          {/* Inquiry Stages */}
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#38bdf8' }}>
              {stage === 'discover' && (lang === 'en' ? '1. Discover: What is Hardware?' : '1. खोज: कम्प्युटर हार्डवेयर के हो?')}
              {stage === 'explore' && (lang === 'en' ? '2. Explore: Inside the CPU Tower' : '2. अन्वेषण: सीपीयू टावरको भित्री दृश्य')}
              {stage === 'observe' && (lang === 'en' ? '3. Observe: Input vs Output' : '3. अवलोकन: इनपुट र आउटपुट')}
              {stage === 'understand' && (lang === 'en' ? '4. Understand: RAM vs Storage' : '4. बुझाइ: र्याम र स्टोरेज भिन्नता')}
              {stage === 'challenge' && (lang === 'en' ? '5. Challenge: Hardware Quiz' : '5. चुनौती: हार्डवेयर प्रश्न')}
            </h4>

            {stage !== 'challenge' ? (
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                {stage === 'discover' && (lang === 'en'
                  ? 'Hardware refers to the physical, touchable parts of a computer system that execute software programs.'
                  : 'कम्प्युटरका छुन र देख्न सकिने भौतिक उपकरणहरूलाई हार्डवेयर भनिन्छ।')}
                {stage === 'explore' && (lang === 'en'
                  ? 'Look inside the cutaway CPU tower on the right: See the microprocessor with spinning fan, RAM memory sticks, and SSD drive!'
                  : 'दायाँतर्फको सीपीयू टावरभित्र हेर्नुहोस्: पंखा घुमिरहेको माइक्रोप्रोसेसर (CPU), र्याम (RAM) का स्लटहरू र स्टोरेज ड्राइभ देखिन्छन्!')}
                {stage === 'observe' && (lang === 'en'
                  ? 'Keyboard and mouse send raw data in (Input); monitor displays processed results out (Output).'
                  : 'किबोर्ड र माउसले डेटा भित्र पठाउँछन् (इनपुट); मनिटरले प्रशोधित नतिजा पर्दामा देखाउँछ (आउटपुट)।')}
                {stage === 'understand' && (lang === 'en'
                  ? 'RAM is volatile memory lost upon turning off the PC, whereas SSD/HDD provides permanent non-volatile storage.'
                  : 'र्याम (RAM) मा भएको डेटा बत्ती जाने बित्तिकै मेटिन्छ, तर एसएसडी/हार्डड्राइभ (Storage) मा डेटा सधैंका लागि सुरक्षित रहन्छ।')}
              </p>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e2e8f0' }}>
                  {lang === 'en'
                    ? 'Which component is known as the "Brain of the Computer" that processes all instructions?'
                    : 'कम्प्युटरका सबै निर्देशनहरू प्रशोधन गर्ने "कम्प्युटरको मस्तिष्क" भनेर कुन अङ्गलाई चिनिन्छ?'}
                </p>
                {[
                  { id: 1, en: 'CPU', ne: 'सीपीयू (CPU - Central Processing Unit)' },
                  { id: 2, en: 'Monitor', ne: 'मनिटर (Monitor)' },
                  { id: 3, en: 'Keyboard', ne: 'किबोर्ड (Keyboard)' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setQuizAnswer(opt.id);
                      if (opt.id === 1) {
                        ScienceAudio.playSuccess();
                        setStars(3);
                        setIsCompleted(true);
                      } else {
                        ScienceAudio.playWhoosh();
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      marginBottom: '6px',
                      borderRadius: '6px',
                      border: quizAnswer === opt.id
                        ? (opt.id === 1 ? '1px solid #22c55e' : '1px solid #ef4444')
                        : '1px solid rgba(255,255,255,0.1)',
                      background: quizAnswer === opt.id
                        ? (opt.id === 1 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)')
                        : 'rgba(15, 23, 42, 0.5)',
                      color: '#0f172a',
                      fontSize: '11px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    {lang === 'en' ? opt.en : opt.ne}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </SimulationLayout>
  );
};

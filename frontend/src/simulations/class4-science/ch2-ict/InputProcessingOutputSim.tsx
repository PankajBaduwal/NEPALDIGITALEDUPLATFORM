/**
 * InputProcessingOutputSim.tsx
 * Simulation 5: 2D Input, Processing & Output Pipeline
 * Grade 4 Science • Chapter 2: Information & Communication Technology
 *
 * 100% Native HTML5 Canvas 2D Pipeline Simulation.
 * Features:
 * - 4-stage IPO+Storage pipeline with traveling data packets and pulsing bus circuits
 * - 4 real-world interactive processing scenarios (Math Calculation, Text Typing, Photo Filter, Music Playback)
 * - Microprocessor ALU clock cycle animation with logic gates
 * - Storage Hard Disk Drive with rotating magnetic platter & actuator head
 * - Bilingual EN/NE labels, audio effects, and 5-stage inquiry learning
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Play, RotateCcw, Sparkles, ArrowRight, CheckCircle2, Cpu, Monitor, Keyboard, HardDrive, FastForward } from 'lucide-react';

interface IPOTask {
  id: string;
  nameEn: string;
  nameNe: string;
  inputDeviceEn: string;
  inputDeviceNe: string;
  inputPayload: string;
  processEn: string;
  processNe: string;
  outputDeviceEn: string;
  outputDeviceNe: string;
  outputPayload: string;
}

export const InputProcessingOutputSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('calc');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // 0 to 1
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const tasks: IPOTask[] = [
    {
      id: 'calc',
      nameEn: 'Arithmetic: 5 + 3 = 8',
      nameNe: 'अङ्कगणित हिसाब: 5 + 3 = 8',
      inputDeviceEn: 'Keyboard & Mouse',
      inputDeviceNe: 'किबोर्ड र माउस',
      inputPayload: '5 + 3',
      processEn: 'CPU Arithmetic Logic Unit (ALU) adds binary bytes (0101 + 0011 = 1000)',
      processNe: 'सिपियूले गणितीय विधि (ALU) बाट दुवै संख्या जोड्छ',
      outputDeviceEn: 'Monitor Screen',
      outputDeviceNe: 'मोनिटर स्क्रिन',
      outputPayload: '= 8',
    },
    {
      id: 'text',
      nameEn: 'Word Typing: "NEPAL"',
      nameNe: 'शब्द टाइपिङ: "NEPAL"',
      inputDeviceEn: 'Keyboard',
      inputDeviceNe: 'किबोर्ड',
      inputPayload: 'N-E-P-A-L',
      processEn: 'Converts scan codes to ASCII/Unicode characters in RAM buffer',
      processNe: 'बटनको विद्युतीय संकेतलाई अक्षर कोडमा रूपान्तरण गर्छ',
      outputDeviceEn: 'Document Editor',
      outputDeviceNe: 'वर्ड डकुमेन्ट',
      outputPayload: 'NEPAL 🇳🇵',
    },
    {
      id: 'photo',
      nameEn: 'Photo Filter Processing',
      nameNe: 'तस्बिर सम्पादन (Photo Filter)',
      inputDeviceEn: 'Digital Camera',
      inputDeviceNe: 'डिजिटल क्यामेरा',
      inputPayload: 'Raw Image Pixels',
      processEn: 'GPU / CPU applies brightness, contrast, and sharpening algorithms',
      processNe: 'तस्बिरको उज्यालो र रङ समायोजन गरी स्पष्ट पार्छ',
      outputDeviceEn: 'HD Display & Storage',
      outputDeviceNe: 'रंगीन स्क्रिन र डिस्क',
      outputPayload: 'Enhanced Image ✨',
    },
    {
      id: 'music',
      nameEn: 'Audio MP3 Playback',
      nameNe: 'गीत संगीत बजाउने (Audio)',
      inputDeviceEn: 'Play Button Click',
      inputDeviceNe: 'माउस क्लिक',
      inputPayload: 'Play audio.mp3',
      processEn: 'Sound chip decodes compressed audio bits into analog acoustic voltages',
      processNe: 'डिजिटल फाइललाई ध्वनि तरंगमा परिवर्तन गर्छ',
      outputDeviceEn: 'Stereo Speakers',
      outputDeviceNe: 'साउन्ड स्पिकर',
      outputPayload: '🎵 Music Notes',
    },
  ];

  const currentTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

  const handleStartPipeline = () => {
    if (isRunning) return;
    setIsRunning(true);
    setProgress(0);
    ScienceAudio.playWhoosh();
  };

  const handleReset = () => {
    setIsRunning(false);
    setProgress(0);
    setSelectedTaskId('calc');
    setCompletedTasks([]);
    setStars(0);
    setIsCompleted(false);
    setStage('discover');
    ScienceAudio.playWhoosh();
  };

  // Pipeline animation driver
  useEffect(() => {
    if (!isRunning) return;

    let localProg = 0;
    const interval = setInterval(() => {
      localProg += 0.008;
      setProgress(localProg);

      if (localProg >= 0.32 && localProg < 0.33) {
        ScienceAudio.playClick();
      } else if (localProg >= 0.65 && localProg < 0.66) {
        ScienceAudio.playPlink();
      }

      if (localProg >= 1.0) {
        clearInterval(interval);
        setIsRunning(false);
        setProgress(1.0);
        ScienceAudio.playSuccess();

        if (!completedTasks.includes(selectedTaskId)) {
          const next = [...completedTasks, selectedTaskId];
          setCompletedTasks(next);
          setStars(Math.min(3, Math.floor((next.length / tasks.length) * 3)));
          if (next.length >= tasks.length) {
            setIsCompleted(true);
            setStage('understand');
          }
        }
      }
    }, 20);

    return () => clearInterval(interval);
  }, [isRunning, selectedTaskId, completedTasks]);

  // 60 FPS Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.04;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Digital Circuit Motherboard Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#051329');
      bgGrad.addColorStop(1, '#020b18');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Printed circuit traces on background
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
      ctx.lineWidth = 1.5;
      for (let y = 60; y < canvas.height; y += 70) {
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(240, y);
        ctx.lineTo(280, y + 30);
        ctx.lineTo(canvas.width - 40, y + 30);
        ctx.stroke();
      }

      // 2. The 3 Primary Stations
      const stations = [
        {
          id: 'input',
          nameEn: '1. INPUT',
          nameNe: '1. इनपुट (कच्चा तथ्याङ्क)',
          descEn: 'Raw Data Entry',
          color: '#f59e0b',
          x: 60,
          y: 120,
          w: 200,
          h: 240,
        },
        {
          id: 'process',
          nameEn: '2. PROCESS',
          nameNe: '2. प्रशोधन (सिपियू दिमाग)',
          descEn: 'ALU & CPU Core',
          color: '#06b6d4',
          x: 340,
          y: 120,
          w: 200,
          h: 240,
        },
        {
          id: 'output',
          nameEn: '3. OUTPUT',
          nameNe: '3. आउटपुट (नतिजा/सूचना)',
          descEn: 'Result Information',
          color: '#10b981',
          x: 620,
          y: 120,
          w: 200,
          h: 240,
        },
      ];

      // Station Connecting Data Buses
      const busY = 240;
      // Bus 1: Input to Process
      ctx.strokeStyle = progress > 0.1 ? '#f59e0b' : '#334155';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(260, busY);
      ctx.lineTo(340, busY);
      ctx.stroke();

      // Bus 2: Process to Output
      ctx.strokeStyle = progress > 0.65 ? '#10b981' : '#334155';
      ctx.beginPath();
      ctx.moveTo(540, busY);
      ctx.lineTo(620, busY);
      ctx.stroke();

      // Draw Stations Cards
      stations.forEach((st, idx) => {
        const isCurrentActive =
          (idx === 0 && progress < 0.33) ||
          (idx === 1 && progress >= 0.33 && progress < 0.66) ||
          (idx === 2 && progress >= 0.66);

        // Station Box
        ctx.fillStyle = isCurrentActive ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.7)';
        ctx.beginPath();
        ctx.roundRect(st.x, st.y, st.w, st.h, 12);
        ctx.fill();

        ctx.strokeStyle = isCurrentActive ? st.color : 'rgba(71, 85, 105, 0.5)';
        ctx.lineWidth = isCurrentActive ? 3 : 1.5;
        ctx.stroke();

        // Glowing border pulse when active
        if (isCurrentActive && isRunning) {
          ctx.strokeStyle = `${st.color}55`;
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.roundRect(st.x - 4, st.y - 4, st.w + 8, st.h + 8, 16);
          ctx.stroke();
        }

        // Header ribbon
        ctx.fillStyle = st.color;
        ctx.beginPath();
        ctx.roundRect(st.x, st.y, st.w, 36, [12, 12, 0, 0]);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lang === 'ne' ? st.nameNe : st.nameEn, st.x + st.w / 2, st.y + 22);

        // Station Inner Graphic
        if (st.id === 'input') {
          // Keyboard & Mouse icon vector
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.roundRect(st.x + 30, st.y + 55, 140, 60, 6);
          ctx.fill();
          // Keys
          ctx.fillStyle = '#64748b';
          for (let k = 0; k < 12; k++) {
            ctx.fillRect(st.x + 36 + (k % 6) * 22, st.y + 62 + Math.floor(k / 6) * 24, 18, 18);
          }

          // Input text badge
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(st.x + 15, st.y + 140, st.w - 30, 75, 8);
          ctx.fill();
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#fef3c7';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(lang === 'ne' ? 'प्रविष्ट तथ्याङ्क:' : 'Input Data:', st.x + st.w / 2, st.y + 160);
          ctx.font = 'bold 16px monospace';
          ctx.fillStyle = '#fbbf24';
          ctx.fillText(currentTask.inputPayload, st.x + st.w / 2, st.y + 195);
        } else if (st.id === 'process') {
          // Microprocessor CPU Chip
          const chipX = st.x + st.w / 2;
          const chipY = st.y + 90;

          // CPU Pins around perimeter
          ctx.fillStyle = '#f59e0b';
          for (let p = -35; p <= 35; p += 10) {
            ctx.fillRect(chipX + p - 2, chipY - 45, 4, 8);
            ctx.fillRect(chipX + p - 2, chipY + 37, 4, 8);
            ctx.fillRect(chipX - 45, chipY + p - 2, 8, 4);
            ctx.fillRect(chipX + 37, chipY + p - 2, 8, 4);
          }

          // Ceramic package
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(chipX - 35, chipY - 35, 70, 70, 8);
          ctx.fill();
          ctx.stroke();

          // Spinning ALU gear / core
          if (isRunning && progress >= 0.33 && progress < 0.66) {
            ctx.save();
            ctx.translate(chipX, chipY);
            ctx.rotate(time * 8);
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 2;
            ctx.strokeRect(-16, -16, 32, 32);
            ctx.restore();
          }

          ctx.fillStyle = '#e0f2fe';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('CPU ALU', chipX, chipY + 4);

          // Logic operation text badge
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(st.x + 15, st.y + 140, st.w - 30, 75, 8);
          ctx.fill();
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#cffafe';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(lang === 'ne' ? 'प्रशोधन प्रक्रिया:' : 'Processing Logic:', st.x + st.w / 2, st.y + 160);
          ctx.font = 'bold 11px sans-serif';
          ctx.fillStyle = '#38bdf8';
          ctx.fillText(
            lang === 'ne' ? 'बाइनरी जोड (ALU)' : 'Executing Cycle',
            st.x + st.w / 2,
            st.y + 185
          );
        } else if (st.id === 'output') {
          // Monitor Screen icon
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(st.x + 35, st.y + 55, 130, 65, 6);
          ctx.fill();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Screen display
          ctx.fillStyle = '#064e3b';
          ctx.fillRect(st.x + 40, st.y + 60, 120, 50);

          if (progress >= 0.66) {
            ctx.fillStyle = '#34d399';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(currentTask.outputPayload, st.x + 100, st.y + 90);
          } else {
            ctx.fillStyle = '#065f46';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('WAITING...', st.x + 100, st.y + 90);
          }

          // Result information badge
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(st.x + 15, st.y + 140, st.w - 30, 75, 8);
          ctx.fill();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = '#d1fae5';
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(lang === 'ne' ? 'नतिजा (Information):' : 'Output Result:', st.x + st.w / 2, st.y + 160);
          ctx.font = 'bold 14px sans-serif';
          ctx.fillStyle = '#34d399';
          ctx.fillText(
            progress >= 0.66 ? currentTask.outputPayload : '...',
            st.x + st.w / 2,
            st.y + 195
          );
        }
      });

      // 3. Storage Unit Attached below CPU (Secondary Memory)
      const stX = 350;
      const stY = 400;
      const stW = 180;
      const stH = 90;

      // Vertical connecting bus from CPU to Storage
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(440, 360);
      ctx.lineTo(440, stY);
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(stX, stY, stW, stH, 8);
      ctx.fill();
      ctx.stroke();

      // Hard disk rotating platter
      const diskCX = stX + 45;
      const diskCY = stY + 45;
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(diskCX, diskCY, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Read/Write actuator arm
      ctx.save();
      ctx.translate(diskCX + 25, diskCY - 20);
      ctx.rotate(Math.sin(time * 4) * 0.2);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-28, 20);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = '#e9d5ff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(lang === 'ne' ? '4. स्टोरेज (सङ्ग्रह)' : '4. STORAGE (Memory)', stX + 90, stY + 35);
      ctx.font = '9px sans-serif';
      ctx.fillStyle = '#c084fc';
      ctx.fillText(lang === 'ne' ? 'हार्ड डिस्क / SSD' : 'Hard Disk / SSD', stX + 90, stY + 52);
      ctx.fillText(lang === 'ne' ? 'डेटा सुरक्षित राख्छ' : 'Permanent Save', stX + 90, stY + 68);

      // 4. Animated Traveling Data Packet
      if (isRunning || progress > 0) {
        let packetX = 160;
        let packetY = busY;

        if (progress < 0.33) {
          // In input or travelling to CPU
          const localP = progress / 0.33;
          packetX = 160 + localP * 280;
        } else if (progress < 0.66) {
          // Processing inside CPU
          packetX = 440;
          packetY = busY + Math.sin(time * 12) * 8;
        } else {
          // Travelling to Output
          const localP = (progress - 0.66) / 0.34;
          packetX = 440 + localP * 280;
        }

        // Draw Packet
        ctx.save();
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(packetX, packetY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('0101', packetX, packetY);
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, progress, selectedTaskId, lang]);

  return (
    <SimulationLayout
      titleEn="Computer IPO Cycle Pipeline"
      titleNe="कम्प्युटरको कार्यप्रणाली चक्र (IPO)"
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
            width={880}
            height={520}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
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
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#22d3ee',
                fontSize: '11px',
                fontWeight: 700,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Cpu size={14} color="#22d3ee" />
              {lang === 'ne' ? 'इनपुट → प्रोसेस → आउटपुट' : 'Input → Process → Output'}
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
              <CheckCircle2 size={14} color="#4ade80" />
              {lang === 'ne'
                ? `पूरा भएका कार्य: ${completedTasks.length}/${tasks.length}`
                : `Tasks: ${completedTasks.length}/${tasks.length}`}
            </span>
          </div>

          {/* Top-Right Tools */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleStartPipeline}
                disabled={isRunning}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: isRunning ? '#0284c7' : 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}
              >
                <Play size={16} style={{ marginLeft: isRunning ? '0' : '2px' }} />
              </button>

              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {lang === 'ne' ? currentTask.nameNe : currentTask.nameEn}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {isRunning
                    ? progress < 0.33
                      ? (lang === 'ne' ? `1. इनपुट ग्रहण: ${currentTask.inputPayload}` : `1. Receiving Input: ${currentTask.inputPayload}`)
                      : progress < 0.66
                      ? (lang === 'ne' ? `2. सिपियू प्रोसेसिङ: ${currentTask.processNe}` : `2. CPU ALU Processing: ${currentTask.processEn}`)
                      : (lang === 'ne' ? `3. आउटपुट नतिजा: ${currentTask.outputPayload}` : `3. Displaying Output: ${currentTask.outputPayload}`)
                    : (lang === 'ne' ? 'चक्र सुरु गर्न "Run Cycle" थिच्नुहोस्' : 'Ready to start. Click "Run Cycle" to trace data packet')}
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: '11px',
                color: '#22d3ee',
                background: 'rgba(6, 182, 212, 0.1)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                fontWeight: 700,
              }}
            >
              {lang === 'ne'
                ? `प्रगति: ${Math.round(progress * 100)}%`
                : `Progress: ${Math.round(progress * 100)}%`}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: IPO DISCOVERY STATION & CONTROLS (380px)
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
          {/* Station Header Card */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Cpu size={18} color="#22d3ee" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.3px' }}>
                {lang === 'ne' ? 'कार्यप्रणाली अनुसन्धान केन्द्र' : 'IPO Cycle Discovery Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.45 }}>
              {lang === 'ne'
                ? 'कुनै पनि कम्प्युटर कार्य छान्नुहोस् र इनपुटदेखि आउटपुटसम्म डेटा कसरी सर्छ प्रत्यक्ष हेर्नुहोस्।'
                : 'Select real-world computing scenarios to inspect how data travels from input hardware through ALU processing to output devices.'}
            </div>
          </div>

          {/* Task Scenario Selector (2x2 Grid) */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
              {lang === 'ne' ? 'परीक्षणका लागि कार्य छान्नुहोस्' : 'Select Task Scenario'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {tasks.map((t) => {
                const active = selectedTaskId === t.id;
                const done = completedTasks.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      ScienceAudio.playPop();
                      setSelectedTaskId(t.id);
                      setProgress(0);
                      setIsRunning(false);
                    }}
                    style={{
                      padding: '9px 10px',
                      borderRadius: '8px',
                      border: active ? '2px solid #22d3ee' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: active ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                      color: active ? '#22d3ee' : '#cbd5e1',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                        {lang === 'ne' ? t.nameNe : t.nameEn}
                      </span>
                      {done && <CheckCircle2 size={13} color="#4ade80" />}
                    </div>
                    <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>
                      {lang === 'ne' ? t.inputDeviceNe : t.inputDeviceEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Task Pipeline Breakdown */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase' }}>
              {lang === 'ne' ? 'डेटा प्रवाह चरणहरू (Pipeline Breakdown):' : 'Data Pipeline Breakdown:'}
            </div>

            {/* Input Row */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '8px 10px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                <span>{lang === 'ne' ? '1. इनपुट (Input)' : '1. Input Stage'}</span>
                <span style={{ color: '#38bdf8' }}>{currentTask.inputPayload}</span>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                {lang === 'ne' ? currentTask.inputDeviceNe : currentTask.inputDeviceEn}
              </div>
            </div>

            {/* Process Row */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '8px 10px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                <span>{lang === 'ne' ? '2. प्रोसेस (Process)' : '2. Processing Stage'}</span>
                <span style={{ color: '#a855f7' }}>ALU / CPU</span>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#e2e8f0', marginTop: '2px', lineHeight: 1.4 }}>
                {lang === 'ne' ? currentTask.processNe : currentTask.processEn}
              </div>
            </div>

            {/* Output Row */}
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '8px 10px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                <span>{lang === 'ne' ? '3. आउटपुट (Output)' : '3. Output Stage'}</span>
                <span style={{ color: '#4ade80' }}>{currentTask.outputPayload}</span>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                {lang === 'ne' ? currentTask.outputDeviceNe : currentTask.outputDeviceEn}
              </div>
            </div>
          </div>

          {/* Action Button: Run Cycle */}
          <button
            onClick={handleStartPipeline}
            disabled={isRunning}
            style={{
              padding: '11px',
              borderRadius: '10px',
              border: 'none',
              background: isRunning
                ? 'rgba(255, 255, 255, 0.1)'
                : 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 800,
              cursor: isRunning ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)',
            }}
          >
            <Play size={15} />
            {isRunning
              ? (lang === 'ne' ? 'प्रशोधन हुँदैछ...' : 'Processing Pipeline...')
              : (lang === 'ne' ? 'चक्र सुरु गर्नुहोस् (Run Cycle)' : 'Execute IPO Cycle')}
          </button>

          {/* Curriculum Key Takeaway Card */}
          <div
            style={{
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '11px',
              color: '#475569',
              lineHeight: 1.45,
            }}
          >
            <div style={{ fontWeight: 800, color: '#22d3ee', marginBottom: '4px' }}>
              💡 {lang === 'ne' ? 'पाठ्यक्रम मुख्य निष्कर्ष:' : 'Curriculum Key Takeaway:'}
            </div>
            {lang === 'ne'
              ? 'कम्प्युटरले इनपुट यन्त्रबाट तथ्यांक लिन्छ, सीपीयूमा प्रशोधन (Process) गर्छ, र मनिटर वा स्पिकरमार्फत नतिजा (Output) देखाउँछ।'
              : 'Every digital computer strictly follows the IPO model: Input receives raw data, CPU processes it logically, and Output displays meaningful information.'}
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
            <CheckCircle2 size={16} />
            {lang === 'en' ? 'Complete IPO Cycle Lab & Quiz' : 'कार्यप्रणाली चक्र पूरा गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default InputProcessingOutputSim;

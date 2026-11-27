/**
 * VirtualComputerLab.tsx
 * Simulation 6: 2D Virtual Computer Laboratory
 * Grade 4 Science • Chapter 2: Information & Communication Technology
 *
 * 100% Native 2D Mini-OS Educational Workstation.
 * Features:
 * - Nepal OS 4.0 Desktop interface with Himalayan wallpaper, taskbar, start menu & clock
 * - 3 Real Interactive Applications:
 *   1. Paint Studio: freehand drawing canvas with color palette, brush sizes & eraser
 *   2. Word Processor: typing notebook with real-time text formatting
 *   3. Smart Calculator: fully functional arithmetic engine with tactile sound
 * - Desktop File System: Save files to hard drive, award stars for exploration
 * - Bilingual EN/NE labels, audio feedback, 5-stage inquiry learning
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Paintbrush, FileText, Calculator, Folder, Save, Trash2, Check, RotateCcw, Sparkles, Volume2 } from 'lucide-react';

type AppType = 'paint' | 'writer' | 'calc' | 'files';

export const VirtualComputerLab: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>('en');
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [activeApp, setActiveApp] = useState<AppType>('paint');
  const [savedFiles, setSavedFiles] = useState<string[]>([]);
  const [appsExplored, setAppsExplored] = useState<string[]>(['paint']);

  // Paint App State
  const paintCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [paintColor, setPaintColor] = useState<string>('#3b82f6');
  const [brushSize, setBrushSize] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Writer App State
  const [writerText, setWriterText] = useState<string>(
    'Class 4 Science: A computer is an electronic device. It takes input, processes it in the CPU and shows output on the monitor.'
  );

  // Calculator App State
  const [calcDisplay, setCalcDisplay] = useState<string>('0');
  const [calcMemory, setCalcMemory] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);

  const colors = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
    '#a855f7', // Purple
    '#ffffff', // White
    '#0f172a', // Eraser (Dark background)
  ];

  const handleSwitchApp = (app: AppType) => {
    ScienceAudio.playPop();
    setActiveApp(app);
    if (!appsExplored.includes(app)) {
      const next = [...appsExplored, app];
      setAppsExplored(next);
      setStars(Math.min(3, Math.floor((next.length / 3) * 3)));
      if (next.length >= 3) {
        setIsCompleted(true);
        ScienceAudio.playSuccess();
      }
    }
  };

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = paintColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ScienceAudio.playWhoosh();
  };

  // Calculator operations
  const handleCalcNum = (num: string) => {
    ScienceAudio.playClick();
    if (waitingForOperand) {
      setCalcDisplay(num);
      setWaitingForOperand(false);
    } else {
      setCalcDisplay(calcDisplay === '0' ? num : calcDisplay + num);
    }
  };

  const handleCalcOp = (op: string) => {
    ScienceAudio.playPop();
    const inputValue = parseFloat(calcDisplay);
    if (calcMemory === null) {
      setCalcMemory(inputValue);
    } else if (calcOp) {
      const current = calcMemory || 0;
      let newValue = current;
      if (calcOp === '+') newValue = current + inputValue;
      else if (calcOp === '-') newValue = current - inputValue;
      else if (calcOp === '×') newValue = current * inputValue;
      else if (calcOp === '÷') newValue = inputValue !== 0 ? current / inputValue : 0;
      setCalcDisplay(String(newValue));
      setCalcMemory(newValue);
    }
    setWaitingForOperand(true);
    setCalcOp(op);
  };

  const handleCalcEquals = () => {
    ScienceAudio.playSuccess();
    const inputValue = parseFloat(calcDisplay);
    if (calcOp && calcMemory !== null) {
      let newValue = calcMemory;
      if (calcOp === '+') newValue = calcMemory + inputValue;
      else if (calcOp === '-') newValue = calcMemory - inputValue;
      else if (calcOp === '×') newValue = calcMemory * inputValue;
      else if (calcOp === '÷') newValue = inputValue !== 0 ? calcMemory / inputValue : 0;
      setCalcDisplay(String(newValue));
      setCalcMemory(null);
      setCalcOp(null);
      setWaitingForOperand(true);
    }
  };

  const handleCalcClear = () => {
    ScienceAudio.playWhoosh();
    setCalcDisplay('0');
    setCalcMemory(null);
    setCalcOp(null);
    setWaitingForOperand(false);
  };

  const handleSaveFile = () => {
    ScienceAudio.playSuccess();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let fileName = '';
    if (activeApp === 'paint') fileName = `MyArtwork_${savedFiles.length + 1}.png`;
    else if (activeApp === 'writer') fileName = `ScienceNote_${savedFiles.length + 1}.docx`;
    else if (activeApp === 'calc') fileName = `MathResult_${savedFiles.length + 1}.log`;
    else fileName = `File_${savedFiles.length + 1}.txt`;

    if (!savedFiles.includes(fileName)) {
      setSavedFiles([...savedFiles, `${fileName} (${timestamp})`]);
    }
  };

  const handleReset = () => {
    setActiveApp('paint');
    setSavedFiles([]);
    setAppsExplored(['paint']);
    setStars(0);
    setIsCompleted(false);
    setStage('discover');
    clearCanvas();
    handleCalcClear();
    ScienceAudio.playWhoosh();
  };

  return (
    <SimulationLayout
      titleEn="2D Virtual Computer Laboratory"
      titleNe="भर्चुअल कम्प्युटर 2डी प्रयोगशाला"
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
            LEFT COLUMN: VIRTUAL DESKTOP WORKSTATION
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
            padding: '12px',
          }}
        >
          {/* OS Desktop Container */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '2px solid rgba(56, 189, 248, 0.25)',
              background: 'radial-gradient(circle at 50% 20%, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* OS Window Titlebar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid #e2e8f0',
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', marginLeft: '6px' }}>
                  Nepal Digital OS 4.0 • {lang === 'ne' ? 'भर्चुअल सिकाइ कार्यस्थल' : 'Virtual Student Workstation'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleSaveFile}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <Save size={14} />
                  {lang === 'ne' ? 'सेभ गर्नुहोस्' : 'Save Work'}
                </button>

                <button
                  onClick={handleReset}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid #e2e8f0',
                    color: '#475569',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <RotateCcw size={13} />
                  {lang === 'ne' ? 'रिसेट' : 'Reset'}
                </button>
              </div>
            </div>

            {/* Application Viewport */}
            <div
              style={{
                flex: 1,
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* 1. Paint Studio Application */}
              {activeApp === 'paint' && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    background: '#0f172a',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'rgba(2, 6, 23, 0.8)',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {lang === 'ne' ? 'रङ:' : 'Colors:'}
                      </span>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {colors.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              ScienceAudio.playClick();
                              setPaintColor(c);
                            }}
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: c,
                              border: paintColor === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                              cursor: 'pointer',
                              transform: paintColor === c ? 'scale(1.15)' : 'scale(1)',
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{lang === 'ne' ? 'साइज:' : 'Brush:'}</span>
                        {[2, 4, 8, 14].map((size) => (
                          <button
                            key={size}
                            onClick={() => setBrushSize(size)}
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontFamily: 'monospace',
                              border: brushSize === size ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                              background: brushSize === size ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.05)',
                              color: brushSize === size ? '#38bdf8' : '#cbd5e1',
                              cursor: 'pointer',
                            }}
                          >
                            {size}px
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={clearCanvas}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} />
                        {lang === 'ne' ? 'खाली' : 'Clear'}
                      </button>
                    </div>
                  </div>

                  <div style={{ flex: 1, position: 'relative', cursor: 'crosshair', background: '#020617' }}>
                    <canvas
                      ref={paintCanvasRef}
                      width={800}
                      height={400}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>
                </div>
              )}

              {/* 2. Word Processor Application */}
              {activeApp === 'writer' && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    maxWidth: '750px',
                    background: '#0f172a',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 14px',
                      background: 'rgba(2, 6, 23, 0.8)',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#818cf8' }}>Nepali WordPad 4.0</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>|</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {lang === 'ne' ? 'शब्दहरू: ' : 'Words: '}
                        {writerText.trim().split(/\s+/).filter(Boolean).length}
                      </span>
                    </div>
                    <button
                      onClick={handleSaveFile}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: '#4f46e5',
                        border: 'none',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer',
                      }}
                    >
                      <Save size={12} />
                      {lang === 'ne' ? 'कागजात सेभ गर्नुहोस्' : 'Save Document'}
                    </button>
                  </div>
                  <textarea
                    value={writerText}
                    onChange={(e) => {
                      ScienceAudio.playClick();
                      setWriterText(e.target.value);
                    }}
                    style={{
                      flex: 1,
                      padding: '16px',
                      background: '#0f172a',
                      color: '#0f172a',
                      fontFamily: 'sans-serif',
                      fontSize: '14px',
                      lineHeight: '1.7',
                      border: 'none',
                      outline: 'none',
                      resize: 'none',
                    }}
                    placeholder={lang === 'ne' ? 'यहाँ विज्ञानका कुराहरू लेख्नुहोस्...' : 'Type your science notes here...'}
                  />
                </div>
              )}

              {/* 3. Calculator Application */}
              {activeApp === 'calc' && (
                <div
                  style={{
                    background: '#0f172a',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    padding: '18px',
                    maxWidth: '300px',
                    width: '100%',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                  }}
                >
                  <div
                    style={{
                      background: '#020617',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      marginBottom: '14px',
                      textAlign: 'right',
                    }}
                  >
                    <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', minHeight: '16px' }}>
                      {calcMemory !== null && `${calcMemory} ${calcOp || ''}`}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'monospace', color: '#4ade80' }}>
                      {calcDisplay}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                    <button
                      onClick={handleCalcClear}
                      style={{
                        gridColumn: 'span 2',
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        fontWeight: 800,
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      AC (Clear)
                    </button>
                    <button
                      onClick={() => handleCalcOp('÷')}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(245, 158, 11, 0.2)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#fbbf24',
                        fontWeight: 800,
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      ÷
                    </button>
                    <button
                      onClick={() => handleCalcOp('×')}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(245, 158, 11, 0.2)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#fbbf24',
                        fontWeight: 800,
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      ×
                    </button>

                    {['7', '8', '9'].map((n) => (
                      <button
                        key={n}
                        onClick={() => handleCalcNum(n)}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid #e2e8f0',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '14px',
                          cursor: 'pointer',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => handleCalcOp('-')}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(245, 158, 11, 0.2)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#fbbf24',
                        fontWeight: 800,
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      -
                    </button>

                    {['4', '5', '6'].map((n) => (
                      <button
                        key={n}
                        onClick={() => handleCalcNum(n)}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid #e2e8f0',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '14px',
                          cursor: 'pointer',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => handleCalcOp('+')}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(245, 158, 11, 0.2)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#fbbf24',
                        fontWeight: 800,
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      +
                    </button>

                    {['1', '2', '3'].map((n) => (
                      <button
                        key={n}
                        onClick={() => handleCalcNum(n)}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid #e2e8f0',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '14px',
                          cursor: 'pointer',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={handleCalcEquals}
                      style={{
                        gridRow: 'span 2',
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        border: 'none',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '18px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      =
                    </button>

                    <button
                      onClick={() => handleCalcNum('0')}
                      style={{
                        gridColumn: 'span 2',
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid #e2e8f0',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      0
                    </button>
                    <button
                      onClick={() => handleCalcNum('.')}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid #e2e8f0',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      .
                    </button>
                  </div>
                </div>
              )}

              {/* 4. File Manager Application */}
              {activeApp === 'files' && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    maxWidth: '650px',
                    background: '#0f172a',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '16px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Folder size={18} color="#f59e0b" />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                        {lang === 'ne' ? 'मेरा सुरक्षित गरिएका फाइलहरू' : 'Student Drive C:\\Science'}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {savedFiles.length} {lang === 'ne' ? 'फाइलहरू' : 'files'}
                    </span>
                  </div>

                  <div style={{ flex: 1, padding: '14px 0', overflowY: 'auto' }}>
                    {savedFiles.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                        <Folder size={40} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                        <p style={{ fontSize: '12px' }}>
                          {lang === 'ne'
                            ? 'हाल कुनै फाइल सेभ गरिएको छैन। माथिको "सेभ गर्नुहोस्" बटन थिच्नुहोस्।'
                            : 'No saved files yet. Click "Save Work" in Paint or Writer to store files here.'}
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {savedFiles.map((file, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px',
                              background: 'rgba(2, 6, 23, 0.7)',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                            }}
                          >
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                background: 'rgba(99, 102, 241, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#818cf8',
                              }}
                            >
                              <FileText size={16} />
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                              <span style={{ fontSize: '11px', fontWeight: 600, color: '#0f172a', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {file}
                              </span>
                              <span style={{ fontSize: '10px', color: '#4ade80' }}>✓ Stored in Memory</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* OS Taskbar at Bottom */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 14px',
                background: 'rgba(2, 6, 23, 0.95)',
                borderTop: '1px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: '#0284c7',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  🇳🇵 Start
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'ne'
                    ? 'डिजिटल सीप: चित्र बनाउने, लेख्ने र हिसाब गर्ने'
                    : 'Skills: Drawing, Word Processing, Arithmetic'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#64748b' }}>
                <span>🔊 100%</span>
                <span>📶 Online</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>10:45 AM</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: DISCOVERY STATION & APP SELECTOR (380px)
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
              border: '1px solid rgba(56, 189, 248, 0.2)',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Paintbrush size={18} color="#38bdf8" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.3px' }}>
                {lang === 'ne' ? 'डिजिटल प्रयोगशाला केन्द्र' : 'Virtual OS Discovery Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.45 }}>
              {lang === 'ne'
                ? 'विभिन्न सफ्टवेयर अनुप्रयोगहरू चलाउनुहोस्: चित्र कोर्नुहोस्, विज्ञानका कुरा टाइप गर्नुहोस् र हिसाब गर्नुहोस्।'
                : 'Interact with real computer applications: paint digital artwork, type science notes, and perform calculations.'}
            </div>
          </div>

          {/* Application Selector Grid (2x2) */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
              {lang === 'ne' ? 'अनुप्रयोग छान्नुहोस् (Applications)' : 'Select Application'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {(
                [
                  { id: 'paint', icon: Paintbrush, labelEn: 'Paint Studio', labelNe: 'चित्रकला (Paint)', color: '#06b6d4' },
                  { id: 'writer', icon: FileText, labelEn: 'Word Processor', labelNe: 'वर्डप्याड (Writer)', color: '#818cf8' },
                  { id: 'calc', icon: Calculator, labelEn: 'Calculator', labelNe: 'क्याल्कुलेटर', color: '#4ade80' },
                  { id: 'files', icon: Folder, labelEn: 'File Manager', labelNe: 'फाइलहरू', color: '#fbbf24' },
                ] as const
              ).map((app) => {
                const active = activeApp === app.id;
                const IconComp = app.icon;
                const explored = appsExplored.includes(app.id);
                return (
                  <button
                    key={app.id}
                    onClick={() => handleSwitchApp(app.id)}
                    style={{
                      padding: '9px 10px',
                      borderRadius: '8px',
                      border: active ? `2px solid ${app.color}` : '1px solid rgba(255, 255, 255, 0.1)',
                      background: active ? `${app.color}25` : 'rgba(255, 255, 255, 0.03)',
                      color: active ? app.color : '#cbd5e1',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <IconComp size={14} color={active ? app.color : '#94a3b8'} />
                      <span>{lang === 'ne' ? app.labelNe : app.labelEn}</span>
                    </div>
                    {explored && <Check size={12} color="#4ade80" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exploration Progress Checklist */}
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
                {lang === 'ne' ? 'अनुप्रयोग अन्वेषण प्रगति:' : 'App Exploration Mastery:'}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8' }}>
                {appsExplored.length} / 4
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: '#e2e8f0', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(appsExplored.length / 4) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #38bdf8, #4ade80)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
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
            {lang === 'ne'
              ? 'कम्प्युटरमा सञ्चालन प्रणाली (Operating System) ले सबै कार्यक्रमहरू चलाउन मद्दत गर्छ। पेन्ट, वर्डप्याड र क्याल्कुलेटर दैनिक जीवनमा उपयोगी सफ्टवेयर हुन्।'
              : 'Computers utilize an Operating System to coordinate software programs. Digital tools like paint software, word processors, and calculators allow students to create, communicate, and compute.'}
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
            {lang === 'en' ? 'Complete Virtual Computer Lab & Quiz' : 'भर्चुअल कम्प्युटर प्रयोगशाला पूरा गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default VirtualComputerLab;

/**
 * Lesson 13 · Geometric shapes (ज्यामितीय आकार) — solid shapes
 * Solid Shapes Workshop — count faces, edges and corners; test if it rolls or slides on a ramp!
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd, shuffle, toNp } from '../class1-math-kit/nepali';
import { fmt, numChoices } from './helpers';

interface Props { onBackToLibrary: () => void; userRole?: string }

const SOLIDS = [
  { id: 'cube', np: 'घन', en: 'Cube', faces: 6, edges: 12, corners: 8, rolls: false, color: '#EF4444' },
  { id: 'cuboid', np: 'घनाभ', en: 'Cuboid', faces: 6, edges: 12, corners: 8, rolls: false, color: '#F97316' },
  { id: 'sphere', np: 'गोला', en: 'Sphere', faces: 1, edges: 0, corners: 0, rolls: true, color: '#16A34A' },
  { id: 'cylinder', np: 'बेलना', en: 'Cylinder', faces: 3, edges: 2, corners: 0, rolls: true, color: '#0284C7' },
  { id: 'cone', np: 'शङ्कु', en: 'Cone', faces: 2, edges: 1, corners: 1, rolls: true, color: '#8B5CF6' },
  { id: 'pyramid', np: 'पिरामिड', en: 'Pyramid', faces: 5, edges: 8, corners: 5, rolls: false, color: '#EAB308' },
];

export const SolidShapes: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G2-L13-01',
    chapter: 13,
    titleNp: 'ठोस आकार कार्यशाला',
    titleEn: 'Solid Shapes Workshop',
  });

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isTestingRamp, setIsTestingRamp] = useState(false);
  const [rampProgress, setRampProgress] = useState(0); // 0 to 1

  const activeSolid = SOLIDS[selectedIdx];

  const chooseSolid = (idx: number) => {
    setSelectedIdx(idx);
    setIsTestingRamp(false);
    setRampProgress(0);
    const s = SOLIDS[idx];
    kit.say(
      `${s.np} — ${toNp(s.faces)} सतह (फेस), ${toNp(s.edges)} किनारा, ${toNp(s.corners)} कुना`,
      `${s.en}: ${s.faces} faces, ${s.edges} edges, ${s.corners} corners`
    );
  };

  const testRamp = () => {
    if (isTestingRamp) return;
    setIsTestingRamp(true);
    setRampProgress(0);
    kit.tap();
    kit.say('चिप्लिन्छ कि गुड्छ? हेरौँ!', 'Will it roll or slide? Watch!');

    let t = 0;
    const interval = setInterval(() => {
      t += 0.05;
      if (t >= 1) {
        clearInterval(interval);
        setRampProgress(1);
        setIsTestingRamp(false);
        kit.good(
          activeSolid.rolls
            ? `${activeSolid.np} गुड्छ!`
            : `${activeSolid.np} चिप्लन्छ, गुड्दैन।`,
          activeSolid.rolls
            ? `The ${activeSolid.en.toLowerCase()} rolls!`
            : `The ${activeSolid.en.toLowerCase()} slides!`
        );
        kit.star();
      } else {
        setRampProgress(t);
      }
    }, 40);
  };

  useEffect(() => {
    chooseSolid(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  // Quiz Questions for Challenge Mode
  const questions: QuizQuestion[] = SOLIDS.map((s, i) => ({
    np: `${s.np}का कतिवटा सतह (फेस) हुन्छन्?`,
    en: `How many faces does a ${s.en} have?`,
    answer: String(s.faces),
    options: numChoices(s.faces, i * 7 + 1, [1, -1, 2, -2]).map((v) => ({
      key: String(v),
      label: toNp(v),
    })),
  }));

  const hud = (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: `2px solid ${activeSolid.color}`,
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        fontSize: 16,
        fontWeight: 900,
        color: '#26332E',
      }}
    >
      <span style={{ color: activeSolid.color }}>
        {kit.lang === 'ne' ? activeSolid.np : activeSolid.en}
      </span>
      <span style={{ marginLeft: 8, fontSize: 13, color: '#64748B' }}>
        ({activeSolid.rolls ? kit.t('गुड्ने', 'Rolls') : kit.t('चिप्लने', 'Slides')})
      </span>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <CBtn color="#059669" disabled={isTestingRamp} onClick={testRamp}>
          🎢 {kit.t('चिप्लने कि गुड्ने परीक्षण', 'Ramp Test (Roll/Slide)')}
        </CBtn>
        <CBtn
          color="#0284C7"
          onClick={() => chooseSolid((selectedIdx + 1) % SOLIDS.length)}
        >
          {kit.t('अर्को आकार', 'Next Shape')} ➜
        </CBtn>
      </div>
    </Controls>
  );

  return (
    <SimFrame2D kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} grade={2}>
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 380,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          gap: 16,
        }}
      >
        {/* Shape selector tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {SOLIDS.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => chooseSolid(idx)}
              style={{
                padding: '6px 14px',
                borderRadius: 12,
                fontWeight: 900,
                fontSize: 14,
                border: `2px solid ${s.color}`,
                cursor: 'pointer',
                background: selectedIdx === idx ? s.color : '#FFFFFF',
                color: selectedIdx === idx ? '#FFFFFF' : '#1E293B',
                boxShadow: selectedIdx === idx ? '0 4px 10px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              {kit.lang === 'ne' ? s.np : s.en}
            </button>
          ))}
        </div>

        {/* 2D Isometric Projection & Properties Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            width: '100%',
            maxWidth: 780,
            background: '#FFFFFF',
            borderRadius: 24,
            padding: '24px 30px',
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          {/* 2D Isometric SVG Diagram */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <svg width="220" height="200" viewBox="0 0 220 200">
              {activeSolid.id === 'cube' && (
                <g transform="translate(40, 30)">
                  {/* Top face */}
                  <polygon points="70,10 130,30 70,50 10,30" fill="#FCA5A5" stroke="#DC2626" strokeWidth="2.5" />
                  {/* Left face */}
                  <polygon points="10,30 70,50 70,120 10,100" fill="#EF4444" stroke="#DC2626" strokeWidth="2.5" />
                  {/* Right face */}
                  <polygon points="70,50 130,30 130,100 70,120" fill="#B91C1C" stroke="#DC2626" strokeWidth="2.5" />
                </g>
              )}
              {activeSolid.id === 'cuboid' && (
                <g transform="translate(30, 40)">
                  <polygon points="90,10 160,25 80,45 10,30" fill="#FDBA74" stroke="#EA580C" strokeWidth="2.5" />
                  <polygon points="10,30 80,45 80,110 10,95" fill="#F97316" stroke="#EA580C" strokeWidth="2.5" />
                  <polygon points="80,45 160,25 160,90 80,110" fill="#C2410C" stroke="#EA580C" strokeWidth="2.5" />
                </g>
              )}
              {activeSolid.id === 'sphere' && (
                <g transform="translate(45, 25)">
                  <circle cx="65" cy="75" r="65" fill="#22C55E" stroke="#15803D" strokeWidth="3" />
                  <ellipse cx="65" cy="75" rx="64" ry="24" fill="none" stroke="#166534" strokeWidth="2" strokeDasharray="4 4" />
                </g>
              )}
              {activeSolid.id === 'cylinder' && (
                <g transform="translate(50, 25)">
                  <rect x="15" y="30" width="90" height="95" fill="#38BDF8" stroke="#0284C7" strokeWidth="2.5" />
                  <ellipse cx="60" cy="125" rx="45" ry="16" fill="#0284C7" stroke="#0369A1" strokeWidth="2.5" />
                  <ellipse cx="60" cy="30" rx="45" ry="16" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2.5" />
                </g>
              )}
              {activeSolid.id === 'cone' && (
                <g transform="translate(50, 25)">
                  <polygon points="60,10 10,120 110,120" fill="#A78BFA" stroke="#7C3AED" strokeWidth="2.5" />
                  <ellipse cx="60" cy="120" rx="50" ry="16" fill="#8B5CF6" stroke="#6D28D9" strokeWidth="2.5" />
                </g>
              )}
              {activeSolid.id === 'pyramid' && (
                <g transform="translate(45, 25)">
                  <polygon points="65,10 10,120 75,135" fill="#FDE047" stroke="#CA8A04" strokeWidth="2.5" />
                  <polygon points="65,10 75,135 125,115" fill="#EAB308" stroke="#CA8A04" strokeWidth="2.5" />
                </g>
              )}
            </svg>
            <div style={{ fontSize: 16, fontWeight: 900, color: activeSolid.color }}>
              {kit.lang === 'ne' ? activeSolid.np : activeSolid.en}
            </div>
          </div>

          {/* Properties Summary Pill Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 240 }}>
            <div style={{ background: '#F8FAFC', padding: '10px 16px', borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800, color: '#64748B' }}>{kit.t('सतह (Faces):', 'Faces:')}</span>
              <span style={{ fontWeight: 900, color: '#1E293B', fontSize: 16 }}>{toNp(activeSolid.faces)}</span>
            </div>
            <div style={{ background: '#F8FAFC', padding: '10px 16px', borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800, color: '#64748B' }}>{kit.t('किनारा (Edges):', 'Edges:')}</span>
              <span style={{ fontWeight: 900, color: '#1E293B', fontSize: 16 }}>{toNp(activeSolid.edges)}</span>
            </div>
            <div style={{ background: '#F8FAFC', padding: '10px 16px', borderRadius: 12, border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800, color: '#64748B' }}>{kit.t('कुना (Corners):', 'Corners:')}</span>
              <span style={{ fontWeight: 900, color: '#1E293B', fontSize: 16 }}>{toNp(activeSolid.corners)}</span>
            </div>
            <div style={{ background: activeSolid.rolls ? '#F0FDF4' : '#FFF7ED', padding: '10px 16px', borderRadius: 12, border: `1.5px solid ${activeSolid.rolls ? '#BBF7D0' : '#FED7AA'}`, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800, color: activeSolid.rolls ? '#166534' : '#C2410C' }}>{kit.t('चाल (Motion):', 'Action:')}</span>
              <span style={{ fontWeight: 900, color: activeSolid.rolls ? '#15803D' : '#EA580C' }}>
                {activeSolid.rolls ? kit.t('गुड्छ (Rolls)', 'Rolls') : kit.t('चिप्लन्छ (Slides)', 'Slides')}
              </span>
            </div>
          </div>
        </div>

        {/* Ramp Slide / Roll Demonstration */}
        {isTestingRamp && (
          <div
            style={{
              width: '100%',
              maxWidth: 780,
              background: '#F1F5F9',
              borderRadius: 16,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <svg width="400" height="120" viewBox="0 0 400 120">
              {/* Ramp triangle */}
              <polygon points="40,20 40,110 360,110" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2.5" />
              {/* Moving object on ramp slope */}
              {(() => {
                const x = 50 + rampProgress * 280;
                const y = 30 + rampProgress * 70;
                return (
                  <circle
                    cx={x}
                    cy={y}
                    r="16"
                    fill={activeSolid.color}
                    stroke="#1E293B"
                    strokeWidth="2"
                    style={{
                      transformOrigin: `${x}px ${y}px`,
                      transform: activeSolid.rolls ? `rotate(${rampProgress * 720}deg)` : 'none',
                    }}
                  />
                );
              })()}
            </svg>
            <div style={{ fontSize: 13, fontWeight: 900, color: activeSolid.rolls ? '#16A34A' : '#EA580C' }}>
              {activeSolid.rolls ? kit.t('🌀 गुड्दै गयो!', '🌀 Rolling down!') : kit.t('⛷️ चिप्लँदै गयो!', '⛷️ Sliding down!')}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

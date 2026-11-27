/**
 * Lesson 10 · Angles
 * Angle Lab — open and close two arms around a vertex; compare with a 90° right angle: acute, right or obtuse.
 * Pure 2D Implementation for Smart Boards & Desktops.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { Controls, CBtn, useSimKit, QuizPanel, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd, toNp } from '../class1-math-kit/nepali';
import { fmt } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }

const kindOf = (a: number) => (a === 90 ? 'right' : a < 90 ? 'small' : 'large');

const NAME = {
  right: ['समकोण (90°)', 'Right angle (90°)', '#16A34A'],
  small: ['समकोणभन्दा सानो कोण (न्यूनकोण)', 'Smaller than a right angle (Acute)', '#0284C7'],
  large: ['समकोणभन्दा ठूलो कोण (अधिककोण)', 'Larger than a right angle (Obtuse)', '#F97316'],
} as const;

export const AngleLab: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G3-L10-01',
    chapter: 10,
    titleNp: 'कोण प्रयोगशाला',
    titleEn: 'Angle Lab',
  });

  const [angle, setAngle] = useState(90);
  const [targetKind, setTargetKind] = useState<string | null>(null);

  const curKind = kindOf(angle);

  const updateAngle = (deg: number, speak = false) => {
    const d = Math.max(15, Math.min(165, deg));
    setAngle(d);
    if (speak) {
      const k = kindOf(d);
      kit.say(NAME[k][0], NAME[k][1]);
    }
  };

  const newTarget = () => {
    const t = ['right', 'small', 'large'][rnd(0, 2)];
    setTargetKind(t);
    updateAngle(rnd(0, 1) === 0 ? 30 : 150);
    kit.say(
      `यस्तो कोण बनाऔँ: ${NAME[t as 'right'][0]}`,
      `Make: ${NAME[t as 'right'][1]}`
    );
  };

  const checkAnswer = () => {
    if (kindOf(angle) === targetKind) {
      kit.good('स्याबास! सही कोण बनाउनुभयो!', 'Great job! Angle matched!');
      kit.star();
      setTimeout(newTarget, 1400);
    } else {
      kit.oops('90° को समकोणसँग तुलना गरौँ', 'Compare with the 90° right angle.');
    }
  };

  useEffect(() => {
    if (kit.mode === 'LEARN') {
      updateAngle(90, true);
    } else if (kit.mode === 'PLAY') {
      newTarget();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.mode]);

  // Quiz Questions for Challenge Mode
  const quizData = useMemo(() => Array.from({ length: 8 }, (_, i) => {
    const k = (['right', 'small', 'large'] as const)[i % 3];
    const deg = k === 'right' ? 90 : k === 'small' ? [30, 45, 60, 75][rnd(0, 3)] : [105, 120, 135, 150][rnd(0, 3)];
    return { deg, k };
  }), []);

  const questions: (QuizQuestion & { deg: number })[] = quizData.map((d) => ({
    deg: d.deg,
    np: `${toNp(d.deg)}° को कोण कस्तो कोण हो?`,
    en: `What kind of angle is ${d.deg}°?`,
    answer: d.k,
    options: (['right', 'small', 'large'] as const).map((k) => ({
      key: k,
      label: kit.t(NAME[k][0], NAME[k][1]),
    })),
  }));

  const hud = kit.mode === 'CHALLENGE' ? null : (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '8px 18px',
        border: `2px solid ${NAME[curKind][2]}`,
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 900, color: NAME[curKind][2] }}>
        {toNp(angle)}°
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#26332E' }}>
        {kit.t(NAME[curKind][0], NAME[curKind][1])}
      </div>
    </div>
  );

  const panel = kit.mode === 'CHALLENGE' ? (
    <QuizPanel kit={kit} questions={questions} onAsk={(q: any) => updateAngle(q.deg)} />
  ) : (
    <Controls>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <CBtn color="#0284C7" onClick={() => updateAngle(angle - 15, kit.mode === 'LEARN')}>
          ◀ {kit.t('बन्द (सानो)', 'Close (-15°)')}
        </CBtn>
        <CBtn color="#0284C7" onClick={() => updateAngle(angle + 15, kit.mode === 'LEARN')}>
          {kit.t('खोल (ठूलो)', 'Open (+15°)')} ▶
        </CBtn>

        {/* Angle Presets */}
        <div style={{ display: 'inline-flex', gap: 6 }}>
          {[
            [45, '45° (सानो)', '45° (Acute)'],
            [90, '90° (समकोण)', '90° (Right)'],
            [135, '135° (ठूलो)', '135° (Obtuse)'],
          ].map(([deg, np, en]) => (
            <button
              key={deg as number}
              type="button"
              onClick={() => updateAngle(deg as number, true)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 900,
                border: 'none',
                cursor: 'pointer',
                background: angle === deg ? '#187C68' : '#F1F5F9',
                color: angle === deg ? '#FFFFFF' : '#334155',
              }}
            >
              {kit.t(np as string, en as string)}
            </button>
          ))}
        </div>

        {kit.mode === 'PLAY' && (
          <CBtn color="#10B981" onClick={checkAnswer}>
            ✓ {kit.t('जाँचौँ', 'Check Answer')}
          </CBtn>
        )}
      </div>
    </Controls>
  );

  // SVG Coordinates for the two arms:
  // Vertex at (80, 180)
  // Arm 1 (fixed horizontal): extends to (320, 180)
  // Arm 2 (rotating): length 240 px, angle `angle` degrees counter-clockwise
  const rad = (angle * Math.PI) / 180;
  const armLen = 220;
  const x2 = 80 + armLen * Math.cos(rad);
  const y2 = 180 - armLen * Math.sin(rad);

  // Arc path for the angle indicator
  const arcR = 55;
  const arcX = 80 + arcR * Math.cos(rad);
  const arcY = 180 - arcR * Math.sin(rad);

  return (
    <SimFrame2D kit={kit} onBack={onBackToLibrary} hud={hud} panel={panel} grade={3}>
      <div
        style={{
          width: '100%',
          height: '100%',
          minHeight: 380,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 24,
            padding: 30,
            border: '2px solid #E2E8F0',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            maxWidth: 620,
            width: '100%',
          }}
        >
          {/* SVG 2D Angle Diagram */}
          <svg width="400" height="240" viewBox="0 0 400 240">
            {/* 90-degree ghost reference box */}
            <rect x="80" y="100" width="80" height="80" fill="#F0FDF4" stroke="#86EFAC" strokeWidth="2" strokeDasharray="4 4" />
            <text x="120" y="145" textAnchor="middle" fill="#16A34A" fontSize="12" fontWeight="800">
              90° {kit.t('समकोण', 'Right')}
            </text>

            {/* Angle shaded sector */}
            {angle === 90 ? (
              <rect x="80" y="150" width="30" height="30" fill="none" stroke="#16A34A" strokeWidth="3" />
            ) : (
              <path
                d={`M 80 180 L ${80 + arcR} 180 A ${arcR} ${arcR} 0 0 0 ${arcX} ${arcY} Z`}
                fill={NAME[curKind][2]}
                fillOpacity="0.25"
                stroke={NAME[curKind][2]}
                strokeWidth="2.5"
              />
            )}

            {/* Arm 1: Fixed Base Arm */}
            <line x1="80" y1="180" x2="340" y2="180" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
            <polygon points="345,180 335,174 335,186" fill="#1E293B" />

            {/* Arm 2: Rotating Upper Arm */}
            <line x1="80" y1="180" x2={x2} y2={y2} stroke="#DC2626" strokeWidth="6" strokeLinecap="round" />

            {/* Vertex Joint Knob */}
            <circle cx="80" cy="180" r="10" fill="#F59E0B" stroke="#B45309" strokeWidth="3" />
          </svg>

          <div style={{ fontSize: 14, fontWeight: 800, color: '#64748B' }}>
            {kit.t('बटन थिचेर कोण खोल्नुहोस् वा बन्द गर्नुहोस्', 'Use buttons to open or close the angle')}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

/**
 * Class 4 lessons 1–3 · Lines and angles, Plane figures, Solid objects
 * ProtractorLab — 2D Interactive Protractor measuring angles 0° to 180°.
 * ShapeBuilder — 2D Polygon Builder with triangles and quadrilaterals.
 * SolidExplorer — 2D Isometric solid shapes explorer (faces, edges, vertices).
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { rnd, shuffle } from '../class1-math-kit/nepali';
import { fmt, Props, mcq, numQ } from './h4';

/* ───────────── 1. Protractor Lab ───────────── */
const kindOf = (a: number) => (a === 180 ? 3 : a === 90 ? 1 : a < 90 ? 0 : 2);
const KIND = [
  { np: 'न्यून कोण', en: 'Acute angle', color: '#0EA5E9' },
  { np: 'समकोण', en: 'Right angle', color: '#10B981' },
  { np: 'अधिक कोण', en: 'Obtuse angle', color: '#F97316' },
  { np: 'सरल कोण', en: 'Straight angle', color: '#8B5CF6' },
];

export const ProtractorLab: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G4-L1-01',
    chapter: 1,
    titleNp: 'चाँद प्रयोगशाला (कोण मापन)',
    titleEn: 'Protractor Lab (Angle Measurement)',
  });

  const [angle, setAngle] = useState(60);

  const kIdx = kindOf(angle);
  const kObj = KIND[kIdx];

  const updateAngle = (deg: number, speak = false) => {
    const clamped = Math.max(0, Math.min(180, deg));
    setAngle(clamped);
    kit.tap();
    if (speak) {
      const k = KIND[kindOf(clamped)];
      kit.say(`${clamped}° — ${k.np}`, `${clamped}° — ${k.en}`);
    }
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const qdeg = [30, 45, 60, 90, 120, 135, 150, 180][i];
      const qkind = kindOf(qdeg);

      if (i % 2 === 0) {
        return {
          np: `${qdeg}° को कोण कस्तो कोण हो?`,
          en: `What kind of angle is ${qdeg}°?`,
          answer: String(qkind),
          options: shuffle(
            KIND.map((k, idx) => ({ key: String(idx), label: kit.t(k.np, k.en) })),
            i
          ),
        };
      } else {
        return numQ(
          `चाँदमा यो कोण कति डिग्री छ?`,
          `What does the protractor measure for this angle?`,
          qdeg,
          i,
          [10, -10, 5, -5, 20],
          (x) => `${fmt(kit.lang, x)}°`
        );
      }
    });
  }, [kit.lang]);

  // Protractor SVG Math
  const r = 120;
  const cx = 160;
  const cy = 150;
  const rad = (angle * Math.PI) / 180;
  const armX = cx + r * Math.cos(Math.PI - rad);
  const armY = cy - r * Math.sin(Math.PI - rad);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={kit.t(
        `कोण: ${angle}° — ${kObj.np}। ०° देखि १८०° सम्म हातले मिलाएर हेरौँ!`,
        `Angle: ${angle}° — ${kObj.en}. Drag or adjust to measure with the protractor!`
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[30, 60, 90, 120, 150, 180].map((d) => (
            <button
              key={d}
              onClick={() => updateAngle(d, true)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: angle === d ? `2px solid ${KIND[kindOf(d)].color}` : '1px solid #CBD5E1',
                background: angle === d ? '#FFFFFF' : '#F1F5F9',
                color: angle === d ? KIND[kindOf(d)].color : '#475569',
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {d}°
            </button>
          ))}
          <button
            onClick={() => updateAngle(angle - 10, true)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            −10°
          </button>
          <button
            onClick={() => updateAngle(angle + 10, true)}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 700 }}
          >
            +10°
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 640, gap: 16 }}>
        {/* Angle Indicator Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: `2px solid ${kObj.color}`,
            borderRadius: 16,
            padding: '12px 28px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: 32, fontWeight: 900, color: kObj.color }}>
            {fmt(kit.lang, angle)}°
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#334155', marginTop: 4 }}>
            {kit.t(kObj.np, kObj.en)}
          </div>
        </div>

        {/* 2D Protractor SVG Canvas */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '2px solid #E2E8F0',
            padding: '20px 24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <svg width="320" height="180" viewBox="0 0 320 180">
            {/* Protractor Semi-Circle Acrylic Body */}
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy} Z`}
              fill="#E0F2FE"
              fillOpacity="0.6"
              stroke="#0284C7"
              strokeWidth="2.5"
            />

            {/* Inner cut-out arc */}
            <path
              d={`M ${cx - 40} ${cy} A 40 40 0 0 1 ${cx + 40} ${cy} Z`}
              fill="#FFFFFF"
              stroke="#CBD5E1"
              strokeWidth="1.5"
            />

            {/* Protractor degree markings (every 10 degrees) */}
            {Array.from({ length: 19 }).map((_, idx) => {
              const deg = idx * 10;
              const theta = (deg * Math.PI) / 180;
              const x1 = cx + (r - 12) * Math.cos(Math.PI - theta);
              const y1 = cy - (r - 12) * Math.sin(Math.PI - theta);
              const x2 = cx + r * Math.cos(Math.PI - theta);
              const y2 = cy - r * Math.sin(Math.PI - theta);
              const isMajor = deg % 30 === 0;

              return (
                <g key={deg}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0369A1" strokeWidth={isMajor ? 2 : 1} />
                  {isMajor && (
                    <text
                      x={cx + (r - 24) * Math.cos(Math.PI - theta)}
                      y={cy - (r - 24) * Math.sin(Math.PI - theta) + 4}
                      textAnchor="middle"
                      fill="#0369A1"
                      fontSize="9"
                      fontWeight="900"
                    >
                      {deg}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Angle Shaded Sector */}
            {angle > 0 && (
              <path
                d={`M ${cx} ${cy} L ${cx + (r - 35)} ${cy} A ${r - 35} ${r - 35} 0 0 0 ${cx + (r - 35) * Math.cos(Math.PI - rad)} ${cy - (r - 35) * Math.sin(Math.PI - rad)} Z`}
                fill={kObj.color}
                fillOpacity="0.4"
              />
            )}

            {/* Base Line (0° arm) */}
            <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />

            {/* Rotatable Angle Arm */}
            <line x1={cx} y1={cy} x2={armX} y2={armY} stroke={kObj.color} strokeWidth="4" strokeLinecap="round" />

            {/* Center Vertex Pivot */}
            <circle cx={cx} cy={cy} r="6" fill="#EF4444" />
          </svg>
        </div>
      </div>
    </SimFrame2D>
  );
};

/* ───────────── 2. Shape Builder ───────────── */
interface Sh {
  np: string;
  en: string;
  sides: number;
  color: string;
  factNp: string;
  factEn: string;
  pts: string; // SVG polygon points
}

const SHAPES: Sh[] = [
  { np: 'समबाहु त्रिभुज', en: 'Equilateral Triangle', sides: 3, color: '#EF4444', factNp: 'तीनै भुजा बराबर (६०° कोण)', factEn: 'All 3 sides equal (60° angles)', pts: '150,30 60,180 240,180' },
  { np: 'समद्विबाहु त्रिभुज', en: 'Isosceles Triangle', sides: 3, color: '#F97316', factNp: '२ भुजा बराबर', factEn: '2 sides are equal', pts: '150,40 80,180 220,180' },
  { np: 'विषमबाहु त्रिभुज', en: 'Scalene Triangle', sides: 3, color: '#EAB308', factNp: 'कुनै भुजा बराबर छैन', factEn: 'No two sides equal', pts: '120,40 50,180 250,180' },
  { np: 'समकोणी त्रिभुज', en: 'Right Triangle', sides: 3, color: '#10B981', factNp: 'एउटा कोण ९०° (समकोण)', factEn: 'One angle is 90°', pts: '70,40 70,180 230,180' },
  { np: 'वर्ग', en: 'Square', sides: 4, color: '#0EA5E9', factNp: '४ बराबर भुजा र ४ समकोण', factEn: '4 equal sides and 4 right angles', pts: '80,50 220,50 220,190 80,190' },
  { np: 'आयत', en: 'Rectangle', sides: 4, color: '#8B5CF6', factNp: 'सम्मुख भुजा बराबर, ४ समकोण', factEn: 'Opposite sides equal, 4 right angles', pts: '50,65 250,65 250,175 50,175' },
  { np: 'समानान्तर चतुर्भुज', en: 'Parallelogram', sides: 4, color: '#EC4899', factNp: 'सम्मुख भुजा बराबर र समानान्तर', factEn: 'Opposite sides equal and parallel', pts: '90,65 260,65 210,175 40,175' },
  { np: 'समचतुर्भुज', en: 'Rhombus', sides: 4, color: '#14B8A6', factNp: '४ बराबर भुजा', factEn: '4 equal sides', pts: '150,35 235,120 150,205 65,120' },
];

export const ShapeBuilder: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G4-L2-01',
    chapter: 2,
    titleNp: 'आकृति निर्माता (समतल आकार)',
    titleEn: 'Shape Builder (Plane Figures)',
  });

  const [shapeIdx, setShapeIdx] = useState(0);

  const cur = SHAPES[shapeIdx];

  const choose = (idx: number) => {
    setShapeIdx(idx);
    kit.tap();
    kit.say(`${SHAPES[idx].np}: ${SHAPES[idx].factNp}`, `${SHAPES[idx].en}: ${SHAPES[idx].factEn}`);
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const s = SHAPES[i % SHAPES.length];
      const wrongs = SHAPES.filter((_, idx) => idx !== i % SHAPES.length).map((x) => x.en);
      const q = mcq('यो कुन ज्यामितीय आकृति हो?', 'Which geometric shape is this?', s.en, wrongs, i);
      return {
        ...q,
        options: q.options.map((o) => ({
          key: o.key,
          label: kit.lang === 'ne' ? SHAPES.find((x) => x.en === o.key)!.np : o.key,
        })),
      };
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={kit.t(
        `${cur.np}: ${cur.factNp} (${cur.sides} भुजा)`,
        `${cur.en}: ${cur.factEn} (${cur.sides} sides)`
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {SHAPES.map((s, idx) => (
            <button
              key={s.en}
              onClick={() => choose(idx)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: shapeIdx === idx ? `2px solid ${s.color}` : '1px solid #CBD5E1',
                background: shapeIdx === idx ? '#FFFFFF' : '#F1F5F9',
                color: shapeIdx === idx ? s.color : '#475569',
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {kit.t(s.np, s.en)}
            </button>
          ))}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 640, gap: 16 }}>
        {/* Shape Summary Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: `2px solid ${cur.color}`,
            borderRadius: 16,
            padding: '12px 28px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 900, color: cur.color }}>
            {kit.t(cur.np, cur.en)}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B', marginTop: 4 }}>
            {kit.t(cur.factNp, cur.factEn)}
          </div>
        </div>

        {/* 2D SVG Shape Canvas */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '2px solid #E2E8F0',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <svg width="300" height="230" viewBox="0 0 300 230">
            {/* Polygon Shape */}
            <polygon
              points={cur.pts}
              fill={cur.color}
              fillOpacity="0.25"
              stroke={cur.color}
              strokeWidth="3.5"
            />
            {/* Vertices */}
            {cur.pts.split(' ').map((ptStr, pIdx) => {
              const [vx, vy] = ptStr.split(',').map(Number);
              const label = String.fromCharCode(65 + pIdx); // A, B, C, D
              return (
                <g key={pIdx}>
                  <circle cx={vx} cy={vy} r="5" fill="#1E293B" />
                  <text x={vx} y={vy - 8} textAnchor="middle" fill="#1E293B" fontSize="12" fontWeight="900">
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </SimFrame2D>
  );
};

/* ───────────── 3. Solid Explorer ───────────── */
interface So {
  np: string;
  en: string;
  f: number;
  e: number;
  v: number;
  color: string;
  noteNp: string;
  noteEn: string;
}

const SOLIDS: So[] = [
  { np: 'घन', en: 'Cube', f: 6, e: 12, v: 8, color: '#EF4444', noteNp: '६ वटा वर्गाकार सतह', noteEn: '6 square faces' },
  { np: 'घनाभ', en: 'Cuboid', f: 6, e: 12, v: 8, color: '#F97316', noteNp: '६ वटा आयताकार सतह', noteEn: '6 rectangular faces' },
  { np: 'पिरामिड', en: 'Square Pyramid', f: 5, e: 8, v: 5, color: '#EAB308', noteNp: '१ वर्ग र ४ त्रिभुज', noteEn: '1 square and 4 triangles' },
  { np: 'त्रिभुजाकार प्रिज्म', en: 'Triangular Prism', f: 5, e: 9, v: 6, color: '#10B981', noteNp: '२ त्रिभुज र ३ आयत', noteEn: '2 triangles and 3 rectangles' },
  { np: 'बेलना', en: 'Cylinder', f: 3, e: 2, v: 0, color: '#0EA5E9', noteNp: '२ समतल र १ वक्र सतह', noteEn: '2 flat and 1 curved face' },
  { np: 'शङ्कु', en: 'Cone', f: 2, e: 1, v: 1, color: '#8B5CF6', noteNp: '१ समतल र १ वक्र सतह', noteEn: '1 flat and 1 curved face' },
  { np: 'गोला', en: 'Sphere', f: 1, e: 0, v: 0, color: '#EC4899', noteNp: '१ वक्र सतह मात्र', noteEn: '1 continuous curved surface' },
];

export const SolidExplorer: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G4-L3-01',
    chapter: 3,
    titleNp: 'ठोस वस्तु अन्वेषक (सतह, किनारा र शीर्ष)',
    titleEn: 'Solid Explorer (Faces, Edges, Vertices)',
  });

  const [solidIdx, setSolidIdx] = useState(0);

  const cur = SOLIDS[solidIdx];

  const choose = (idx: number) => {
    setSolidIdx(idx);
    kit.tap();
    kit.say(
      `${SOLIDS[idx].np}: ${SOLIDS[idx].f} सतह, ${SOLIDS[idx].e} किनारा, ${SOLIDS[idx].v} शीर्ष`,
      `${SOLIDS[idx].en}: ${SOLIDS[idx].f} faces, ${SOLIDS[idx].e} edges, ${SOLIDS[idx].v} vertices`
    );
  };

  const questions: QuizQuestion[] = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const s = SOLIDS[i % SOLIDS.length];
      return numQ(
        `${s.np}मा कति वटा सतह (Faces) हुन्छन्?`,
        `How many faces does a ${s.en.toLowerCase()} have?`,
        s.f,
        i,
        [1, -1, 2, -2],
        (x) => fmt(kit.lang, x),
        1
      );
    });
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={kit.t(
        `${cur.np}: ${cur.f} सतह (Faces), ${cur.e} किनारा (Edges), ${cur.v} शीर्ष (Vertices)`,
        `${cur.en}: ${cur.f} faces, ${cur.e} edges, ${cur.v} vertices`
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {SOLIDS.map((s, idx) => (
            <button
              key={s.en}
              onClick={() => choose(idx)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: solidIdx === idx ? `2px solid ${s.color}` : '1px solid #CBD5E1',
                background: solidIdx === idx ? '#FFFFFF' : '#F1F5F9',
                color: solidIdx === idx ? s.color : '#475569',
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {kit.t(s.np, s.en)}
            </button>
          ))}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 640, gap: 16 }}>
        {/* Metric Card */}
        <div
          style={{
            background: '#FFFFFF',
            border: `2px solid ${cur.color}`,
            borderRadius: 16,
            padding: '14px 28px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'space-around',
            width: '100%',
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: '#1E293B' }}>{kit.t(cur.np, cur.en)}</div>
            <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>{kit.t(cur.noteNp, cur.noteEn)}</div>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ background: '#F8FAFC', padding: '4px 10px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#0284C7' }}>{cur.f}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B' }}>{kit.t('सतह', 'Faces')}</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '4px 10px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#10B981' }}>{cur.e}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B' }}>{kit.t('किनारा', 'Edges')}</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '4px 10px', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#F59E0B' }}>{cur.v}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B' }}>{kit.t('शीर्ष', 'Vertices')}</div>
            </div>
          </div>
        </div>

        {/* 2D Isometric Projections */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: 20,
            border: '2px solid #E2E8F0',
            padding: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <svg width="260" height="200" viewBox="0 0 260 200">
            {cur.en === 'Cube' && (
              <g transform="translate(60, 30)">
                <polygon points="70,0 140,35 70,70 0,35" fill="#EF4444" stroke="#B91C1C" strokeWidth="2" />
                <polygon points="0,35 70,70 70,140 0,105" fill="#F87171" stroke="#DC2626" strokeWidth="2" />
                <polygon points="70,70 140,35 140,105 70,140" fill="#FCA5A5" stroke="#DC2626" strokeWidth="2" />
              </g>
            )}
            {cur.en === 'Cuboid' && (
              <g transform="translate(50, 30)">
                <polygon points="80,0 160,30 80,60 0,30" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
                <polygon points="0,30 80,60 80,120 0,90" fill="#FB923C" stroke="#EA580C" strokeWidth="2" />
                <polygon points="80,60 160,30 160,90 80,120" fill="#FDBA74" stroke="#EA580C" strokeWidth="2" />
              </g>
            )}
            {cur.en === 'Square Pyramid' && (
              <g transform="translate(70, 25)">
                <polygon points="60,10 0,120 60,140" fill="#EAB308" stroke="#CA8A04" strokeWidth="2" />
                <polygon points="60,10 60,140 120,120" fill="#FDE047" stroke="#EAB308" strokeWidth="2" />
                <circle cx="60" cy="10" r="5" fill="#EF4444" />
              </g>
            )}
            {cur.en === 'Triangular Prism' && (
              <g transform="translate(65, 30)">
                <polygon points="50,10 10,70 90,70" fill="#10B981" stroke="#047857" strokeWidth="2" />
                <polygon points="10,70 90,70 140,120 60,120" fill="#34D399" stroke="#059669" strokeWidth="2" />
                <polygon points="50,10 90,70 140,120 100,60" fill="#6EE7B7" stroke="#10B981" strokeWidth="2" />
              </g>
            )}
            {cur.en === 'Cylinder' && (
              <g transform="translate(80, 25)">
                <rect x="0" y="30" width="100" height="110" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
                <ellipse cx="50" cy="30" rx="50" ry="20" fill="#0EA5E9" stroke="#0369A1" strokeWidth="2" />
                <ellipse cx="50" cy="140" rx="50" ry="20" fill="#7DD3FC" stroke="#0284C7" strokeWidth="2" />
              </g>
            )}
            {cur.en === 'Cone' && (
              <g transform="translate(80, 30)">
                <ellipse cx="50" cy="130" rx="50" ry="18" fill="#A78BFA" stroke="#7C3AED" strokeWidth="2" />
                <path d="M 0 130 L 50 15 L 100 130 Z" fill="#8B5CF6" fillOpacity="0.8" stroke="#6D28D9" strokeWidth="2" />
                <circle cx="50" cy="15" r="5" fill="#EF4444" />
              </g>
            )}
            {cur.en === 'Sphere' && (
              <g transform="translate(80, 40)">
                <circle cx="50" cy="50" r="50" fill="radial-gradient(circle at 35% 35%, #F472B6, #DB2777)" stroke="#BE185D" strokeWidth="2" />
                <ellipse cx="50" cy="50" rx="50" ry="16" fill="none" stroke="#FCE7F3" strokeWidth="1.5" strokeDasharray="4 3" />
              </g>
            )}
          </svg>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default ProtractorLab;

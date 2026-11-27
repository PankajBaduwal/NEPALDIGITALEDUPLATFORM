/**
 * Lesson 11 · Geometrical shapes
 * Face Explorer — 2D Interactive Solid & Net Unfolder.
 * Explore Cube, Cuboid, Cylinder, Cone, and Pyramid with interactive 2D nets, faces, vertices, and edges.
 */
import React, { useMemo, useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { shuffle } from '../class1-math-kit/nepali';
import { fmt } from './h3';

interface Props { onBackToLibrary: () => void; userRole?: string }

interface NetPiece {
  id: string;
  nameNp: string;
  nameEn: string;
  shape: 'rect' | 'circle' | 'polygon';
  x: number;
  y: number;
  w?: number;
  h?: number;
  r?: number;
  pts?: string;
  color: string;
  label: string;
}

interface SolidDef {
  id: string;
  np: string;
  en: string;
  faces: number;
  edges: number;
  vertices: number;
  infoNp: string;
  infoEn: string;
  netShapes: string;
  netPieces: NetPiece[];
}

const SOLIDS: SolidDef[] = [
  {
    id: 'cube',
    np: 'घन',
    en: 'Cube',
    faces: 6,
    edges: 12,
    vertices: 8,
    infoNp: '6 वटा बराबर वर्गाकार सतहहरू',
    infoEn: '6 identical square faces',
    netShapes: '6 Squares',
    netPieces: [
      { id: 'top', nameNp: 'माथिल्लो सतह', nameEn: 'Top face', shape: 'rect', x: 190, y: 30, w: 70, h: 70, color: '#F87171', label: '1' },
      { id: 'left', nameNp: 'बायाँ सतह', nameEn: 'Left face', shape: 'rect', x: 120, y: 100, w: 70, h: 70, color: '#FB923C', label: '2' },
      { id: 'front', nameNp: 'अगाडिको सतह', nameEn: 'Front face', shape: 'rect', x: 190, y: 100, w: 70, h: 70, color: '#FBBF24', label: '3' },
      { id: 'right', nameNp: 'दायाँ सतह', nameEn: 'Right face', shape: 'rect', x: 260, y: 100, w: 70, h: 70, color: '#34D399', label: '4' },
      { id: 'back', nameNp: 'पछाडिको सतह', nameEn: 'Back face', shape: 'rect', x: 330, y: 100, w: 70, h: 70, color: '#60A5FA', label: '5' },
      { id: 'bottom', nameNp: 'तल्लो सतह', nameEn: 'Bottom face', shape: 'rect', x: 190, y: 170, w: 70, h: 70, color: '#A78BFA', label: '6' },
    ],
  },
  {
    id: 'cuboid',
    np: 'घनाभ',
    en: 'Cuboid',
    faces: 6,
    edges: 12,
    vertices: 8,
    infoNp: '6 वटा आयताकार सतहहरू (विपरीत सतह बराबर)',
    infoEn: '6 rectangular faces (opposite faces equal)',
    netShapes: '6 Rectangles',
    netPieces: [
      { id: 'top', nameNp: 'माथिल्लो', nameEn: 'Top', shape: 'rect', x: 180, y: 30, w: 90, h: 60, color: '#38BDF8', label: '1' },
      { id: 'left', nameNp: 'बायाँ', nameEn: 'Left', shape: 'rect', x: 120, y: 90, w: 60, h: 80, color: '#4ADE80', label: '2' },
      { id: 'front', nameNp: 'अगाडि', nameEn: 'Front', shape: 'rect', x: 180, y: 90, w: 90, h: 80, color: '#F472B6', label: '3' },
      { id: 'right', nameNp: 'दायाँ', nameEn: 'Right', shape: 'rect', x: 270, y: 90, w: 60, h: 80, color: '#818CF8', label: '4' },
      { id: 'back', nameNp: 'पछाडि', nameEn: 'Back', shape: 'rect', x: 330, y: 90, w: 90, h: 80, color: '#FCD34D', label: '5' },
      { id: 'bottom', nameNp: 'तल', nameEn: 'Bottom', shape: 'rect', x: 180, y: 170, w: 90, h: 60, color: '#FB923C', label: '6' },
    ],
  },
  {
    id: 'cylinder',
    np: 'बेलना',
    en: 'Cylinder',
    faces: 3,
    edges: 2,
    vertices: 0,
    infoNp: '2 वटा गोलो समतल र 1 वटा घुमाउरो (आयताकार) सतह',
    infoEn: '2 circular flat faces and 1 curved unrolled rectangular face',
    netShapes: '2 Circles + 1 Rectangle',
    netPieces: [
      { id: 'c1', nameNp: 'माथिल्लो वृत्त', nameEn: 'Top circle', shape: 'circle', x: 230, y: 55, r: 35, color: '#F87171', label: 'Circle 1' },
      { id: 'body', nameNp: 'घुमाउरो सतह (आयत)', nameEn: 'Unrolled body (rectangle)', shape: 'rect', x: 130, y: 95, w: 200, h: 90, color: '#38BDF8', label: 'Curved Wall' },
      { id: 'c2', nameNp: 'तल्लो वृत्त', nameEn: 'Bottom circle', shape: 'circle', x: 230, y: 220, r: 35, color: '#34D399', label: 'Circle 2' },
    ],
  },
  {
    id: 'cone',
    np: 'शङ्कु',
    en: 'Cone',
    faces: 2,
    edges: 1,
    vertices: 1,
    infoNp: '1 वटा गोलो पिँध र 1 वटा घुमाउरो सतह (वृत्तखण्ड)',
    infoEn: '1 circular base and 1 curved sector face with apex',
    netShapes: '1 Circle + 1 Sector',
    netPieces: [
      { id: 'sector', nameNp: 'घुमाउरो सतह (वृत्तखण्ड)', nameEn: 'Sector (curved surface)', shape: 'polygon', pts: '220,40 130,150 220,175 310,150', color: '#A78BFA', label: 'Sector Net', x: 220, y: 110 },
      { id: 'base', nameNp: 'पिँध (वृत्त)', nameEn: 'Base circle', shape: 'circle', x: 220, y: 215, r: 34, color: '#FBBF24', label: 'Circle Base' },
    ],
  },
  {
    id: 'pyramid',
    np: 'पिरामिड',
    en: 'Pyramid',
    faces: 5,
    edges: 8,
    vertices: 5,
    infoNp: '1 वटा वर्गाकार पिँध र 4 वटा त्रिभुजाकार सतहहरू',
    infoEn: '1 square base and 4 triangular faces meeting at the apex',
    netShapes: '1 Square + 4 Triangles',
    netPieces: [
      { id: 't1', nameNp: 'माथिल्लो त्रिभुज', nameEn: 'Top triangle', shape: 'polygon', pts: '225,40 185,110 265,110', color: '#F87171', label: 'Tri 1', x: 225, y: 75 },
      { id: 't2', nameNp: 'बायाँ त्रिभुज', nameEn: 'Left triangle', shape: 'polygon', pts: '115,150 185,110 185,190', color: '#FB923C', label: 'Tri 2', x: 150, y: 150 },
      { id: 'base', nameNp: 'वर्गाकार पिँध', nameEn: 'Square base', shape: 'rect', x: 185, y: 110, w: 80, h: 80, color: '#FBBF24', label: 'Base', pts: '' },
      { id: 't3', nameNp: 'दायाँ त्रिभुज', nameEn: 'Right triangle', shape: 'polygon', pts: '335,150 265,110 265,190', color: '#34D399', label: 'Tri 3', x: 300, y: 150 },
      { id: 't4', nameNp: 'तल्लो त्रिभुज', nameEn: 'Bottom triangle', shape: 'polygon', pts: '225,260 185,190 265,190', color: '#60A5FA', label: 'Tri 4', x: 225, y: 225 },
    ],
  },
];

export const FaceExplorer: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G3-L11-01',
    chapter: 11,
    titleNp: 'सतह अन्वेषक (ज्यामितीय आकार)',
    titleEn: 'Face Explorer (Geometrical Shapes)',
  });

  const [solidIdx, setSolidIdx] = useState(0);
  const [unfold, setUnfold] = useState(1); // 0 = folded 3D-iso, 1 = unrolled 2D net
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

  const solid = SOLIDS[solidIdx];

  const choose = (idx: number) => {
    setSolidIdx(idx);
    setSelectedPiece(null);
    kit.tap();
    kit.say(`${SOLIDS[idx].np} — ${SOLIDS[idx].infoNp}`, `${SOLIDS[idx].en} — ${SOLIDS[idx].infoEn}`);
  };

  const questions: QuizQuestion[] = useMemo(() => {
    const list: QuizQuestion[] = [];
    SOLIDS.forEach((s, idx) => {
      // Question 1: Number of faces
      list.push({
        np: `${s.np}मा कतिवटा सतह हुन्छन्?`,
        en: `How many faces does a ${s.en.toLowerCase()} have?`,
        answer: String(s.faces),
        options: shuffle(Array.from(new Set([s.faces, s.faces + 2, Math.max(1, s.faces - 1), 6])), idx).map((v) => ({
          key: String(v),
          label: fmt(kit.lang, v),
        })),
      });
      // Question 2: Edges or Vertices
      list.push({
        np: `${s.np}मा कतिवटा किनार (Edges) हुन्छन्?`,
        en: `How many edges does a ${s.en.toLowerCase()} have?`,
        answer: String(s.edges),
        options: shuffle(Array.from(new Set([s.edges, s.edges + 4, Math.max(0, s.edges - 2), 12])), idx + 5).map((v) => ({
          key: String(v),
          label: fmt(kit.lang, v),
        })),
      });
    });
    return list;
  }, [kit.lang]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      mascotGreeting={kit.t(
        'आकारहरू खोलेर तिनका समतल र घुमाउरो सतहहरू (Net) हेरौँ!',
        'Unfold 3D shapes to explore their 2D nets and flat faces!'
      )}
      questions={questions}
      onAskQuestion={(q) => {
        // Find matching solid for this quiz question
        const sIdx = SOLIDS.findIndex((s) => q.np.includes(s.np));
        if (sIdx !== -1) setSolidIdx(sIdx);
      }}
      controls={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          {/* Solid Switcher */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {SOLIDS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => choose(i)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 12,
                  border: i === solidIdx ? '2px solid #187C68' : '1px solid #CBD5E1',
                  background: i === solidIdx ? '#E6F3E9' : '#FFFFFF',
                  color: i === solidIdx ? '#187C68' : '#334155',
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: i === solidIdx ? '0 2px 8px rgba(24,124,104,0.15)' : 'none',
                }}
              >
                {kit.t(s.np, s.en)}
              </button>
            ))}
          </div>

          {/* Fold / Unfold Switcher */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
            <button
              onClick={() => {
                setUnfold(0);
                kit.tap();
                kit.say('बन्द अवस्था (3D आकार)', 'Folded 3D shape view');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                border: 'none',
                background: unfold === 0 ? '#187C68' : '#F1F5F9',
                color: unfold === 0 ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              📦 {kit.t('बन्द आकार (3D)', 'Folded Solid')}
            </button>
            <button
              onClick={() => {
                setUnfold(1);
                kit.tap();
                kit.say('खोलेको अवस्था (2D जाली / Net)', 'Unfolded 2D net view');
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                border: 'none',
                background: unfold === 1 ? '#187C68' : '#F1F5F9',
                color: unfold === 1 ? '#FFFFFF' : '#475569',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              📄 {kit.t('खोलेको जाली (2D Net)', 'Unfolded Net')}
            </button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 760, gap: 16 }}>
        {/* Solid Summary Card */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            width: '100%',
            background: '#FFFFFF',
            border: '2px solid #E2E8F0',
            borderRadius: 16,
            padding: '12px 20px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
          }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#187C68' }}>{kit.t(solid.np, solid.en)}</div>
            <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>{kit.t(solid.infoNp, solid.infoEn)}</div>
          </div>
          <div style={{ display: 'flex', gap: 16, textAlign: 'center' }}>
            <div style={{ background: '#F8FAFC', padding: '6px 12px', borderRadius: 10, border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#2563EB' }}>{fmt(kit.lang, solid.faces)}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>{kit.t('सतह (Faces)', 'Faces')}</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '6px 12px', borderRadius: 10, border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#10B981' }}>{fmt(kit.lang, solid.edges)}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>{kit.t('किनार (Edges)', 'Edges')}</div>
            </div>
            <div style={{ background: '#F8FAFC', padding: '6px 12px', borderRadius: 10, border: '1px solid #CBD5E1' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#F59E0B' }}>{fmt(kit.lang, solid.vertices)}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>{kit.t('शिरविन्दु (Vertices)', 'Vertices')}</div>
            </div>
          </div>
        </div>

        {/* 2D Canvas Area */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            minHeight: 320,
            background: '#FFFFFF',
            borderRadius: 20,
            border: '2px solid #E2E8F0',
            boxShadow: '0 6px 18px rgba(0,0,0,0.03)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {unfold === 1 ? (
            /* 2D Unfolded Net */
            <svg viewBox="0 0 460 300" style={{ width: '100%', maxHeight: 340, touchAction: 'manipulation' }}>
              {/* Background grid */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F1F5F9" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="460" height="300" fill="url(#grid)" />

              {/* Net Pieces */}
              {solid.netPieces.map((p) => {
                const isSel = selectedPiece === p.id;
                const stroke = isSel ? '#1E293B' : '#475569';
                const strokeWidth = isSel ? 3.5 : 1.5;

                const handleClick = () => {
                  setSelectedPiece(p.id);
                  kit.tap();
                  kit.say(p.nameNp, p.nameEn);
                };

                if (p.shape === 'rect') {
                  return (
                    <g key={p.id} onClick={handleClick} style={{ cursor: 'pointer' }}>
                      <rect
                        x={p.x}
                        y={p.y}
                        width={p.w}
                        height={p.h}
                        fill={p.color}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        rx="4"
                        style={{ filter: isSel ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none' }}
                      />
                      <text
                        x={(p.x ?? 0) + (p.w ?? 0) / 2}
                        y={(p.y ?? 0) + (p.h ?? 0) / 2 + 5}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontWeight="900"
                        fontSize="14"
                      >
                        {p.label}
                      </text>
                    </g>
                  );
                }
                if (p.shape === 'circle') {
                  return (
                    <g key={p.id} onClick={handleClick} style={{ cursor: 'pointer' }}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={p.r}
                        fill={p.color}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        style={{ filter: isSel ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none' }}
                      />
                      <text
                        x={p.x}
                        y={(p.y ?? 0) + 4}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontWeight="900"
                        fontSize="12"
                      >
                        {p.label}
                      </text>
                    </g>
                  );
                }
                if (p.shape === 'polygon') {
                  return (
                    <g key={p.id} onClick={handleClick} style={{ cursor: 'pointer' }}>
                      <polygon
                        points={p.pts}
                        fill={p.color}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        style={{ filter: isSel ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none' }}
                      />
                      <text
                        x={p.x}
                        y={(p.y ?? 0) + 4}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontWeight="900"
                        fontSize="12"
                      >
                        {p.label}
                      </text>
                    </g>
                  );
                }
                return null;
              })}

              <text x="20" y="285" fill="#94A3B8" fontSize="12" fontWeight="700">
                {kit.t('सतहमा ट्याप गरेर विवरण हेर्नुहोस्', 'Tap any face to inspect it')}
              </text>
            </svg>
          ) : (
            /* 2D Isometric Projections with shaded faces */
            <svg viewBox="0 0 400 280" style={{ width: '100%', maxHeight: 320 }}>
              {solid.id === 'cube' && (
                <g transform="translate(140, 60)">
                  {/* Top face */}
                  <polygon points="60,0 120,30 60,60 0,30" fill="#F87171" stroke="#B91C1C" strokeWidth="2" />
                  {/* Left face */}
                  <polygon points="0,30 60,60 60,130 0,100" fill="#FB923C" stroke="#C2410C" strokeWidth="2" />
                  {/* Right face */}
                  <polygon points="60,60 120,30 120,100 60,130" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
                  {/* Vertex labels */}
                  <circle cx="60" cy="0" r="4" fill="#1E293B" />
                  <circle cx="120" cy="30" r="4" fill="#1E293B" />
                  <circle cx="0" cy="30" r="4" fill="#1E293B" />
                  <circle cx="60" cy="60" r="4" fill="#1E293B" />
                  <circle cx="60" cy="130" r="4" fill="#1E293B" />
                  <circle cx="0" cy="100" r="4" fill="#1E293B" />
                  <circle cx="120" cy="100" r="4" fill="#1E293B" />
                  <text x="60" y="160" textAnchor="middle" fill="#334155" fontWeight="800" fontSize="16">
                    {kit.t('घन (Cube)', 'Cube')}
                  </text>
                </g>
              )}
              {solid.id === 'cuboid' && (
                <g transform="translate(130, 60)">
                  {/* Top face */}
                  <polygon points="70,0 150,30 80,60 0,30" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
                  {/* Left face */}
                  <polygon points="0,30 80,60 80,120 0,90" fill="#4ADE80" stroke="#16A34A" strokeWidth="2" />
                  {/* Right face */}
                  <polygon points="80,60 150,30 150,90 80,120" fill="#F472B6" stroke="#DB2777" strokeWidth="2" />
                  <text x="75" y="150" textAnchor="middle" fill="#334155" fontWeight="800" fontSize="16">
                    {kit.t('घनाभ (Cuboid)', 'Cuboid')}
                  </text>
                </g>
              )}
              {solid.id === 'cylinder' && (
                <g transform="translate(150, 40)">
                  {/* Curved body */}
                  <rect x="0" y="30" width="100" height="110" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
                  {/* Top ellipse */}
                  <ellipse cx="50" cy="30" rx="50" ry="20" fill="#F87171" stroke="#B91C1C" strokeWidth="2" />
                  {/* Bottom ellipse */}
                  <ellipse cx="50" cy="140" rx="50" ry="20" fill="#34D399" stroke="#059669" strokeWidth="2" />
                  <text x="50" y="185" textAnchor="middle" fill="#334155" fontWeight="800" fontSize="16">
                    {kit.t('बेलना (Cylinder)', 'Cylinder')}
                  </text>
                </g>
              )}
              {solid.id === 'cone' && (
                <g transform="translate(150, 45)">
                  {/* Base ellipse */}
                  <ellipse cx="50" cy="130" rx="50" ry="18" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
                  {/* Cone triangle */}
                  <path d="M 0 130 L 50 10 L 100 130 Z" fill="#A78BFA" fillOpacity="0.85" stroke="#7C3AED" strokeWidth="2" />
                  <circle cx="50" cy="10" r="5" fill="#EF4444" />
                  <text x="50" y="175" textAnchor="middle" fill="#334155" fontWeight="800" fontSize="16">
                    {kit.t('शङ्कु (Cone)', 'Cone')}
                  </text>
                </g>
              )}
              {solid.id === 'pyramid' && (
                <g transform="translate(140, 50)">
                  {/* Front-left triangle */}
                  <polygon points="60,10 0,110 60,130" fill="#FB923C" stroke="#EA580C" strokeWidth="2" />
                  {/* Front-right triangle */}
                  <polygon points="60,10 60,130 120,110" fill="#F87171" stroke="#DC2626" strokeWidth="2" />
                  <circle cx="60" cy="10" r="5" fill="#EF4444" />
                  <text x="60" y="160" textAnchor="middle" fill="#334155" fontWeight="800" fontSize="16">
                    {kit.t('पिरामिड (Pyramid)', 'Pyramid')}
                  </text>
                </g>
              )}
            </svg>
          )}
        </div>
      </div>
    </SimFrame2D>
  );
};
export default FaceExplorer;

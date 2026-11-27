/**
 * ShapeExplorer3D.tsx (Converted to 100% Pure 2D)
 * Simulation 01: Shape Explorer
 * Class 1 Mathematics - Chapter 3: Geometrical Shapes
 * Nepal CDC Curriculum Aligned
 * Covers: Circle, Triangle, Quadrilateral
 * 100% Pure 2D SVG & Vector Illustrations – Zero WebGL/Three.js.
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';

interface Props {
  onBackToLibrary: () => void;
  userRole?: string;
}

type ShapeType = 'circle' | 'triangle' | 'quadrilateral';

interface ShapeInfo {
  id: ShapeType;
  nameNp: string;
  nameEn: string;
  color: string;
  borderColor: string;
  bgColor: string;
  sidesNp: string;
  sidesEn: string;
  cornersNp: string;
  cornersEn: string;
  examplesNp: string[];
  examplesEn: string[];
}

const SHAPES: ShapeInfo[] = [
  {
    id: 'circle',
    nameNp: 'वृत्त (गोलो आकार)',
    nameEn: 'Circle (Round Shape)',
    color: '#0284c7',
    borderColor: '#0369a1',
    bgColor: '#e0f2fe',
    sidesNp: '0 वटा सिधा रेखा (घुमाउरो घेरा)',
    sidesEn: '0 straight sides (1 curved line)',
    cornersNp: '0 वटा कुना',
    cornersEn: '0 corners',
    examplesNp: ['सिक्का (Coin)', 'घडी (Clock)', 'थाल (Plate)', 'पाङ्ग्रा (Wheel)', 'रोटी (Roti)'],
    examplesEn: ['Coin', 'Wall Clock', 'Plate', 'Bicycle Wheel', 'Roti / Chapati'],
  },
  {
    id: 'triangle',
    nameNp: 'त्रिभुज (तीनकुने आकार)',
    nameEn: 'Triangle (3-Corner Shape)',
    color: '#16a34a',
    borderColor: '#15803d',
    bgColor: '#dcfce7',
    sidesNp: '3 वटा सिधा रेखाहरू',
    sidesEn: '3 straight sides',
    cornersNp: '3 वटा कुनाहरू',
    cornersEn: '3 corners',
    examplesNp: ['समोसा (Samosa)', 'ट्राफिक चिन्ह (Traffic Sign)', 'पहाडको टुप्पो (Mountain Peak)', 'झण्डा (Nepal Flag)'],
    examplesEn: ['Samosa', 'Traffic Yield Sign', 'Mountain Peak', 'Nepal Triangular Flag'],
  },
  {
    id: 'quadrilateral',
    nameNp: 'चतुर्भुज (चारकुने आकार)',
    nameEn: 'Quadrilateral (4-Corner Shape)',
    color: '#ea580c',
    borderColor: '#c2410c',
    bgColor: '#ffedd5',
    sidesNp: '4 वटा सिधा रेखाहरू',
    sidesEn: '4 straight sides',
    cornersNp: '4 वटा कुनाहरू',
    cornersEn: '4 corners',
    examplesNp: ['किताब (Book)', 'कालोपाटी (Chalkboard)', 'झ्याल (Window)', 'ढोका (Door)', 'मोबाइल (Phone)'],
    examplesEn: ['Book', 'Blackboard', 'Window Frame', 'Classroom Door', 'Mobile Phone'],
  },
];

export const ShapeExplorer3D: React.FC<Props> = ({ onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G1-CH3-01',
    chapter: 3,
    titleNp: 'आकारहरू चिनौँ (वृत्त, त्रिभुज र चतुर्भुज)',
    titleEn: 'Discover Shapes (Circle, Triangle, Quadrilateral)',
  });

  const [activeShapeId, setActiveShapeId] = useState<ShapeType>('circle');
  const [scaleFactor, setScaleFactor] = useState(1);

  const activeShape = SHAPES.find((s) => s.id === activeShapeId) || SHAPES[0];

  const questions: QuizQuestion[] = [
    {
      np: 'कुनै पनि कुना नभएको गोलो आकारलाई के भनिन्छ?',
      en: 'What shape is round with zero corners?',
      options: [
        { key: 'c', label: kit.t('वृत्त / गोलो (Circle)', 'Circle (Round)') },
        { key: 't', label: kit.t('त्रिभुज (Triangle)', 'Triangle') },
        { key: 'q', label: kit.t('चतुर्भुज (Quadrilateral)', 'Quadrilateral') },
      ],
      answer: 'c',
    },
    {
      np: '3 वटा सिधा किनारा र 3 वटा कुना भएको आकार कुन हो?',
      en: 'Which shape has 3 straight sides and 3 corners?',
      options: [
        { key: 't', label: kit.t('त्रिभुज (Triangle)', 'Triangle') },
        { key: 'c', label: kit.t('वृत्त (Circle)', 'Circle') },
        { key: 'q', label: kit.t('चतुर्भुज (Quadrilateral)', 'Quadrilateral') },
      ],
      answer: 't',
    },
    {
      np: 'किताब वा कालोपाटी (Blackboard) को आकार कस्तो हुन्छ?',
      en: 'What shape is a book or classroom blackboard?',
      options: [
        { key: 'q', label: kit.t('चतुर्भुज / चारकुने (Quadrilateral)', 'Quadrilateral') },
        { key: 'c', label: kit.t('वृत्त (Circle)', 'Circle') },
        { key: 't', label: kit.t('त्रिभुज (Triangle)', 'Triangle') },
      ],
      answer: 'q',
    },
    {
      np: 'स्वादिलो समोसा (Samosa) कस्तो आकारको हुन्छ?',
      en: 'What shape is a tasty samosa?',
      options: [
        { key: 't', label: kit.t('त्रिभुज (Triangle)', 'Triangle') },
        { key: 'c', label: kit.t('वृत्त (Circle)', 'Circle') },
        { key: 'q', label: kit.t('चतुर्भुज (Quadrilateral)', 'Quadrilateral') },
      ],
      answer: 't',
    },
    {
      np: 'नेपालको एक रुपैयाँको सिक्का (Coin) कस्तो हुन्छ?',
      en: 'What shape is a 1 Rupee Nepali coin?',
      options: [
        { key: 'c', label: kit.t('वृत्त / गोलो (Circle)', 'Circle') },
        { key: 'q', label: kit.t('चतुर्भुज (Quadrilateral)', 'Quadrilateral') },
        { key: 't', label: kit.t('त्रिभुज (Triangle)', 'Triangle') },
      ],
      answer: 'c',
    },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={onBackToLibrary}
      grade={1}
      mascotGreeting={kit.t(
        'आकारहरू छान्नुहोस् र तिनीहरूको कुना तथा किनारा गनौँ!',
        'Pick any shape to inspect its sides, corners, and daily examples!'
      )}
      questions={questions}
      controls={
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          {SHAPES.map((shape) => {
            const isSelected = shape.id === activeShapeId;
            return (
              <button
                key={shape.id}
                onClick={() => {
                  setActiveShapeId(shape.id);
                  kit.tap();
                  kit.say(
                    `यो ${shape.nameNp} हो। यसका ${shape.cornersNp} र ${shape.sidesNp} हुन्छन्।`,
                    `This is a ${shape.nameEn}. It has ${shape.cornersEn} and ${shape.sidesEn}.`
                  );
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: 14,
                  border: isSelected ? `3px solid ${shape.color}` : '2px solid #cbd5e1',
                  background: isSelected ? shape.bgColor : '#ffffff',
                  color: isSelected ? shape.color : '#334155',
                  fontWeight: 'bold',
                  fontSize: 15,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <span>{shape.id === 'circle' ? '⭕' : shape.id === 'triangle' ? '🔺' : '🟧'}</span>
                <span>{kit.t(shape.nameNp, shape.nameEn)}</span>
              </button>
            );
          })}

          <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
            <button
              onClick={() => {
                setScaleFactor((prev) => Math.min(prev + 0.15, 1.4));
                kit.tap();
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: 13,
              }}
              title="Enlarge"
            >
              ➕ {kit.t('ठूलो', 'Larger')}
            </button>
            <button
              onClick={() => {
                setScaleFactor((prev) => Math.max(prev - 0.15, 0.7));
                kit.tap();
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: 13,
              }}
              title="Shrink"
            >
              ➖ {kit.t('सानो', 'Smaller')}
            </button>
          </div>
        </div>
      }
    >
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 20px', boxSizing: 'border-box' }}>
        {/* Main 2D Shape Display Canvas */}
        <div
          style={{
            width: '100%',
            maxWidth: 720,
            background: '#ffffff',
            borderRadius: 20,
            border: '2px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Shape Title Badge */}
          <div
            style={{
              padding: '6px 18px',
              borderRadius: 20,
              background: activeShape.bgColor,
              border: `2px solid ${activeShape.borderColor}`,
              color: activeShape.color,
              fontSize: 16,
              fontWeight: 800,
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            {kit.t(activeShape.nameNp, activeShape.nameEn)}
          </div>

          {/* SVG Vector Shape Visualizer */}
          <div
            style={{
              width: 320,
              height: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8fafc',
              borderRadius: 16,
              border: '2px dashed #cbd5e1',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <svg
              width={260 * scaleFactor}
              height={180 * scaleFactor}
              viewBox="0 0 260 180"
              style={{ transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <defs>
                <linearGradient id={`grad-${activeShape.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={activeShape.bgColor} />
                  <stop offset="100%" stopColor={activeShape.color} stopOpacity="0.8" />
                </linearGradient>
                <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.25" />
                </filter>
              </defs>

              {activeShape.id === 'circle' && (
                <g filter="url(#shadow)">
                  <circle
                    cx="130"
                    cy="90"
                    r="75"
                    fill={`url(#grad-${activeShape.id})`}
                    stroke={activeShape.borderColor}
                    strokeWidth="5"
                  />
                  {/* Center Dot & Diameter Guide */}
                  <circle cx="130" cy="90" r="4" fill="#0f172a" />
                  <line x1="60" y1="90" x2="200" y2="90" stroke="#0f172a" strokeWidth="2" strokeDasharray="4 3" opacity="0.4" />
                </g>
              )}

              {activeShape.id === 'triangle' && (
                <g filter="url(#shadow)">
                  <polygon
                    points="130,20 35,160 225,160"
                    fill={`url(#grad-${activeShape.id})`}
                    stroke={activeShape.borderColor}
                    strokeWidth="5"
                    strokeLinejoin="round"
                  />
                  {/* Corner indicator dots */}
                  <circle cx="130" cy="20" r="5" fill="#dc2626" />
                  <circle cx="35" cy="160" r="5" fill="#dc2626" />
                  <circle cx="225" cy="160" r="5" fill="#dc2626" />
                </g>
              )}

              {activeShape.id === 'quadrilateral' && (
                <g filter="url(#shadow)">
                  <rect
                    x="35"
                    y="35"
                    width="190"
                    height="110"
                    rx="6"
                    fill={`url(#grad-${activeShape.id})`}
                    stroke={activeShape.borderColor}
                    strokeWidth="5"
                  />
                  {/* Corner indicator dots */}
                  <circle cx="35" cy="35" r="5" fill="#dc2626" />
                  <circle cx="225" cy="35" r="5" fill="#dc2626" />
                  <circle cx="35" cy="145" r="5" fill="#dc2626" />
                  <circle cx="225" cy="145" r="5" fill="#dc2626" />
                </g>
              )}
            </svg>
          </div>

          {/* Properties Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 540, marginTop: 16 }}>
            <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                {kit.t('सिधा किनारा (Sides)', 'Sides')}
              </span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                {kit.t(activeShape.sidesNp, activeShape.sidesEn)}
              </span>
            </div>

            <div style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>
                {kit.t('कुनाहरू (Corners)', 'Corners')}
              </span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                {kit.t(activeShape.cornersNp, activeShape.cornersEn)}
              </span>
            </div>
          </div>

          {/* Real World Examples in Nepal */}
          <div style={{ width: '100%', maxWidth: 540, marginTop: 14, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
              ✨ {kit.t('दैनिक जीवन र नेपालमा देखिने उदाहरणहरू (Real World Examples):', 'Examples in Everyday Life:')}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {activeShape.examplesNp.map((ex, idx) => (
                <span
                  key={idx}
                  style={{
                    background: activeShape.bgColor,
                    border: `1px solid ${activeShape.borderColor}`,
                    color: activeShape.color,
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {kit.t(ex, activeShape.examplesEn[idx])}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default ShapeExplorer3D;

/**
 * CoordinateGeometryBuilder.tsx
 * Grade 7 Mathematics – Lesson 17: COORDINATES (निर्देशाङ्कहरू)
 * Simulation 7: Coordinate Geometry and Shape Builder (निर्देशाङ्क ज्यामिति र आकृति निर्माण)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 252-258)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Shapes, Square, Ruler, Sparkles, Check, RotateCcw, PenTool, HelpCircle } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'बिन्दुहरू A(४,०), B(४,४), C(-२,४) र D(-२,०) लाई क्रमैसँग जोड्दा कुन ज्यामितीय आकृति बन्दछ?',
    en: 'When points A(4,0), B(4,4), C(-2,4), and D(-2,0) are joined in order, what shape is formed?',
    options: [
      { key: 'A', label: 'आयत (Rectangle - लम्बाइ ६ र चौडाइ ४ एकाइ)' },
      { key: 'B', label: 'वर्ग (Square)' },
      { key: 'C', label: 'समलम्ब चतुर्भुज (Trapezium)' },
      { key: 'D', label: 'त्रिभुज (Triangle)' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटै क्षितिज रेखामा रहेका दुई बिन्दुहरू P(२, ३) र Q(७, ३) बीचको दुरी ग्रिडका कोठा गन्दा कति हुन्छ?',
    en: 'What is the distance between points P(2, 3) and Q(7, 3) by counting grid squares along the horizontal line?',
    options: [
      { key: 'A', label: '५ एकाइ (७ - २ = ५ units)' },
      { key: 'B', label: '३ एकाइ' },
      { key: 'C', label: '१० एकाइ' },
      { key: 'D', label: '४ एकाइ' },
    ],
    answer: 'A',
  },
  {
    np: 'आयतका तीनवटा शीर्षबिन्दुहरू A(-२,३), B(२,३) र C(-२,४) भए चौथो शीर्षबिन्दु D को निर्देशाङ्क कति हुन्छ?',
    en: 'If three vertices of a rectangle are A(-2,3), B(2,3), and C(-2,4), what is the missing fourth vertex D?',
    options: [
      { key: 'A', label: 'D(२, ४)' },
      { key: 'B', label: 'D(-२, -४)' },
      { key: 'C', label: 'D(४, २)' },
      { key: 'D', label: 'D(०, ०)' },
    ],
    answer: 'A',
  },
  {
    np: 'वर्गका तीनवटा शीर्षबिन्दुहरू J(-४, ४), K(४, ४) र L(४, -४) भए चौथो शीर्षबिन्दु M कति हुन्छ?',
    en: 'If three vertices of a square are J(-4, 4), K(4, 4), and L(4, -4), what is the missing fourth vertex M?',
    options: [
      { key: 'A', label: 'M(-४, -४)' },
      { key: 'B', label: 'M(-४, ०)' },
      { key: 'C', label: 'M(०, -४)' },
      { key: 'D', label: 'M(-४, ४)' },
    ],
    answer: 'A',
  },
  {
    np: 'बिन्दुहरू R(२, ३), S(२, -२) र T(-१, २) लाई क्रमैसँग रेखाखण्डले जोड्दा कुन आकृति बन्दछ?',
    en: 'When points R(2, 3), S(2, -2), and T(-1, 2) are joined in order, which shape is formed?',
    options: [
      { key: 'A', label: 'त्रिभुज (Triangle - तीनवटा भुजाहरू भएको)' },
      { key: 'B', label: 'आयत (Rectangle)' },
      { key: 'C', label: 'वृत्त (Circle)' },
      { key: 'D', label: 'समान्तर चतुर्भुज' },
    ],
    answer: 'A',
  },
];

interface Point {
  name: string;
  x: number;
  y: number;
}

export const CoordinateGeometryBuilder: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L17-02',
    chapter: 17,
    titleNp: 'निर्देशाङ्क ज्यामिति र आकृति निर्माण',
    titleEn: 'Coordinate Geometry Builder',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'join_shapes' | 'grid_distance' | 'missing_rect' | 'missing_square' | 'free_draw'>('join_shapes');

  // Shape presets for Tab 1
  const [selectedShapePreset, setSelectedShapePreset] = useState<'rectangle' | 'triangle' | 'parallelogram'>('rectangle');

  // Tab 2: Distance measurement points
  const [distP1, setDistP1] = useState<Point>({ name: 'P', x: -3, y: 2 });
  const [distP2, setDistP2] = useState<Point>({ name: 'Q', x: 4, y: 2 });

  // Tab 3: Missing vertex rectangle
  const rectKnown: Point[] = [
    { name: 'A', x: -2, y: 3 },
    { name: 'B', x: 2, y: 3 },
    { name: 'C', x: -2, y: 5 },
  ];
  const [rectPlacedD, setRectPlacedD] = useState<Point | null>(null);
  const [rectFeedback, setRectFeedback] = useState<string | null>(null);

  // Tab 4: Missing vertex square
  const squareKnown: Point[] = [
    { name: 'J', x: -4, y: 4 },
    { name: 'K', x: 4, y: 4 },
    { name: 'L', x: 4, y: -4 },
  ];
  const [squarePlacedM, setSquarePlacedM] = useState<Point | null>(null);
  const [squareFeedback, setSquareFeedback] = useState<string | null>(null);

  // Tab 5: Free draw points
  const [freePoints, setFreePoints] = useState<Point[]>([
    { name: 'P1', x: -3, y: -2 },
    { name: 'P2', x: 2, y: -2 },
    { name: 'P3', x: 0, y: 3 },
  ]);

  // Grid SVG dimensions
  const gridSize = 440;
  const unitSize = 22; // 22px per unit => -9 to +9
  const origin = gridSize / 2; // 220

  const toSvgX = (gx: number) => origin + gx * unitSize;
  const toSvgY = (gy: number) => origin - gy * unitSize;

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const gx = Math.round((clickX - origin) / unitSize);
    const gy = Math.round((origin - clickY) / unitSize);

    if (Math.abs(gx) > 8 || Math.abs(gy) > 8) return;

    if (activeTab === 'missing_rect') {
      // Expected D is (2, 5)
      setRectPlacedD({ name: 'D', x: gx, y: gy });
      if (gx === 2 && gy === 5) {
        kit.good();
        setRectFeedback(L('स्याबास! D(२, ५) सही शीर्षबिन्दु हो। आयत पूरा भयो!', 'Correct! D(2, 5) completes the rectangle!'));
      } else {
        kit.oops();
        setRectFeedback(L(`तपाईंले (${toNp(gx)}, ${toNp(gy)}) छान्नुभयो। विपरित भुजा बराबर हुन D(२, ५) हुनुपर्छ।`, `You clicked (${gx}, ${gy}). Opposite sides must be equal. Try (2, 5)!`));
      }
    } else if (activeTab === 'missing_square') {
      // Expected M is (-4, -4)
      setSquarePlacedM({ name: 'M', x: gx, y: gy });
      if (gx === -4 && gy === -4) {
        kit.good();
        setSquareFeedback(L('स्याबास! M(-४, -४) सही शीर्षबिन्दु हो। वर्ग पूरा भयो!', 'Excellent! M(-4, -4) completes the square!'));
      } else {
        kit.oops();
        setSquareFeedback(L(`तपाईंले (${toNp(gx)}, ${toNp(gy)}) छान्नुभयो। वर्गका चारै भुजा ८ एकाइ हुन M(-४, -४) हुनुपर्छ।`, `You clicked (${gx}, ${gy}). All 4 sides must be 8 units. Try (-4, -4)!`));
      }
    } else if (activeTab === 'free_draw') {
      if (freePoints.length >= 8) return;
      const nextName = `P${freePoints.length + 1}`;
      setFreePoints([...freePoints, { name: nextName, x: gx, y: gy }]);
    }
  };

  const getShapePresetPoints = (): { points: Point[]; shapeNameNp: string; shapeNameEn: string; descNp: string; descEn: string } => {
    if (selectedShapePreset === 'rectangle') {
      return {
        points: [
          { name: 'A', x: 4, y: 0 },
          { name: 'B', x: 4, y: 4 },
          { name: 'C', x: -2, y: 4 },
          { name: 'D', x: -2, y: 0 },
        ],
        shapeNameNp: 'आयत (Rectangle ABCD)',
        shapeNameEn: 'Rectangle ABCD',
        descNp: 'लम्बाइ = |४ - (-२)| = ६ एकाइ, चौडाइ = |४ - ०| = ४ एकाइ। विपरित भुजाहरू बराबर र समानान्तर छन्।',
        descEn: 'Length = |4 - (-2)| = 6 units, Breadth = |4 - 0| = 4 units. Opposite sides are equal & parallel.',
      };
    } else if (selectedShapePreset === 'triangle') {
      return {
        points: [
          { name: 'R', x: 2, y: 3 },
          { name: 'S', x: 2, y: -2 },
          { name: 'T', x: -1, y: 2 },
        ],
        shapeNameNp: 'त्रिभुज (Triangle RST)',
        shapeNameEn: 'Triangle RST',
        descNp: 'तीनवटा शीर्षबिन्दुहरू R(२,३), S(२,-२) र T(-१,२) लाई क्रमैसँग रेखाखण्डले जोड्दा त्रिभुज बन्दछ। RS = ५ एकाइ।',
        descEn: 'Joining R(2,3), S(2,-2), and T(-1,2) forms a triangle. Side RS = 5 vertical grid units.',
      };
    } else {
      return {
        points: [
          { name: 'P', x: -4, y: -2 },
          { name: 'Q', x: 1, y: -2 },
          { name: 'R', x: 3, y: 3 },
          { name: 'S', x: -2, y: 3 },
        ],
        shapeNameNp: 'समानान्तर चतुर्भुज (Parallelogram PQRS)',
        shapeNameEn: 'Parallelogram PQRS',
        descNp: 'PQ र SR दुवै ५ एकाइ लामा र समानान्तर छन्।',
        descEn: 'Opposite horizontal sides PQ and SR are both 5 units long and parallel.',
      };
    }
  };

  // Render Grid
  const renderGrid = () => {
    const lines = [];
    for (let i = -9; i <= 9; i++) {
      const pos = origin + i * unitSize;
      lines.push(
        <line
          key={`v-${i}`}
          x1={pos}
          y1={10}
          x2={pos}
          y2={gridSize - 10}
          stroke={i === 0 ? '#1e293b' : '#e2e8f0'}
          strokeWidth={i === 0 ? 2.5 : 1}
        />
      );
      lines.push(
        <line
          key={`h-${i}`}
          x1={10}
          y1={pos}
          x2={gridSize - 10}
          y2={pos}
          stroke={i === 0 ? '#1e293b' : '#e2e8f0'}
          strokeWidth={i === 0 ? 2.5 : 1}
        />
      );
      if (i !== 0 && Math.abs(i) <= 8 && i % 2 === 0) {
        lines.push(
          <text
            key={`x-${i}`}
            x={origin + i * unitSize}
            y={origin + 14}
            fontSize="9"
            fill="#64748b"
            textAnchor="middle"
            fontWeight="bold"
          >
            {isNe ? toNp(i) : i}
          </text>
        );
        lines.push(
          <text
            key={`y-${i}`}
            x={origin - 8}
            y={origin - i * unitSize + 3}
            fontSize="9"
            fill="#64748b"
            textAnchor="end"
            fontWeight="bold"
          >
            {isNe ? toNp(i) : i}
          </text>
        );
      }
    }
    return lines;
  };

  const presetData = getShapePresetPoints();

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! बिन्दुहरू जोडेर आकृति बनाउन, ग्रिड कोठा गनेर दुरी नाप्न र हराएका शीर्षबिन्दु पत्ता लगाउन सिकौँ!',
        'Hello! Join coordinate points to form geometric shapes, measure grid distance, and solve missing vertices!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#f8fafc', padding: 8, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          {[
            { id: 'join_shapes', labelNp: '१. बिन्दु जोडेर आकृति बनाउने', labelEn: '1. Join Points to Shape', icon: Shapes },
            { id: 'grid_distance', labelNp: '२. ग्रिड कोठा गनेर दुरी', labelEn: '2. Count Grid Distance', icon: Ruler },
            { id: 'missing_rect', labelNp: '३. आयतको हराएको शीर्षबिन्दु', labelEn: '3. Missing Vertex (Rectangle)', icon: Square },
            { id: 'missing_square', labelNp: '४. वर्गको हराएको शीर्षबिन्दु', labelEn: '4. Missing Vertex (Square)', icon: Square },
            { id: 'free_draw', labelNp: '५. स्वतन्त्र आकृति स्टुडियो', labelEn: '5. Freeform Studio', icon: PenTool },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  border: 'none',
                  background: active ? '#16a34a' : '#ffffff',
                  color: active ? '#ffffff' : '#334155',
                  boxShadow: active ? '0 2px 4px rgba(22, 163, 74, 0.25)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />
                <span>{isNe ? tab.labelNp : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Main Stage */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 460px) 1fr', gap: 20, alignItems: 'start' }}>
          {/* Graph Canvas */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 12, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shapes size={16} />
              {activeTab === 'missing_rect' || activeTab === 'missing_square'
                ? L('हराएको बिन्दु राख्न ग्राफ पेपरमा क्लिक गर्नुहोस्', 'Click on the graph paper to place the missing vertex')
                : L('ग्राफ पेपरमा शीर्षबिन्दुहरू र रेखाहरू', 'Vertices & connecting segments on grid')}
            </div>

            <svg
              width={gridSize}
              height={gridSize}
              viewBox={`0 0 ${gridSize} ${gridSize}`}
              onClick={handleSvgClick}
              style={{ cursor: activeTab === 'missing_rect' || activeTab === 'missing_square' || activeTab === 'free_draw' ? 'crosshair' : 'default', userSelect: 'none', background: '#fafbfc', borderRadius: 8, border: '1px solid #cbd5e1' }}
            >
              {renderGrid()}

              {/* Axes labels */}
              <text x={gridSize - 16} y={origin - 6} fill="#0f172a" fontWeight="bold" fontSize="13">X</text>
              <text x={12} y={origin - 6} fill="#0f172a" fontWeight="bold" fontSize="13">X'</text>
              <text x={origin + 6} y={20} fill="#0f172a" fontWeight="bold" fontSize="13">Y</text>
              <text x={origin + 6} y={gridSize - 14} fill="#0f172a" fontWeight="bold" fontSize="13">Y'</text>
              <text x={origin - 12} y={origin + 14} fill="#dc2626" fontWeight="bold" fontSize="12">O</text>

              {/* Tab 1: Joined Shapes Preset */}
              {activeTab === 'join_shapes' && (
                <>
                  <polygon
                    points={presetData.points.map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' ')}
                    fill="#bbf7d0"
                    fillOpacity={0.35}
                    stroke="#16a34a"
                    strokeWidth={3}
                  />
                  {presetData.points.map((p) => (
                    <g key={p.name}>
                      <circle cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={6} fill="#15803d" stroke="#ffffff" strokeWidth={2} />
                      <text x={toSvgX(p.x) + 8} y={toSvgY(p.y) - 6} fill="#14532d" fontWeight="bold" fontSize="12">
                        {p.name}({isNe ? toNp(p.x) : p.x}, {isNe ? toNp(p.y) : p.y})
                      </text>
                    </g>
                  ))}
                </>
              )}

              {/* Tab 2: Grid Distance */}
              {activeTab === 'grid_distance' && (
                <>
                  {/* Highlight segment */}
                  <line
                    x1={toSvgX(distP1.x)}
                    y1={toSvgY(distP1.y)}
                    x2={toSvgX(distP2.x)}
                    y2={toSvgY(distP2.y)}
                    stroke="#2563eb"
                    strokeWidth={4}
                  />
                  {/* Stepper square markers */}
                  {Array.from({ length: Math.abs(distP2.x - distP1.x) }).map((_, idx) => {
                    const startX = Math.min(distP1.x, distP2.x);
                    const cx = toSvgX(startX + idx + 0.5);
                    const cy = toSvgY(distP1.y);
                    return (
                      <circle key={idx} cx={cx} cy={cy} r={3} fill="#1d4ed8" />
                    );
                  })}
                  {/* Points */}
                  <circle cx={toSvgX(distP1.x)} cy={toSvgY(distP1.y)} r={6} fill="#ea580c" stroke="#ffffff" strokeWidth={2} />
                  <text x={toSvgX(distP1.x) - 10} y={toSvgY(distP1.y) - 10} fill="#c2410c" fontWeight="bold" fontSize="12">
                    {distP1.name}({isNe ? toNp(distP1.x) : distP1.x}, {isNe ? toNp(distP1.y) : distP1.y})
                  </text>
                  <circle cx={toSvgX(distP2.x)} cy={toSvgY(distP2.y)} r={6} fill="#ea580c" stroke="#ffffff" strokeWidth={2} />
                  <text x={toSvgX(distP2.x) + 10} y={toSvgY(distP2.y) - 10} fill="#c2410c" fontWeight="bold" fontSize="12">
                    {distP2.name}({isNe ? toNp(distP2.x) : distP2.x}, {isNe ? toNp(distP2.y) : distP2.y})
                  </text>
                </>
              )}

              {/* Tab 3: Missing Rect */}
              {activeTab === 'missing_rect' && (
                <>
                  {/* Draw known sides */}
                  <line x1={toSvgX(rectKnown[0].x)} y1={toSvgY(rectKnown[0].y)} x2={toSvgX(rectKnown[1].x)} y2={toSvgY(rectKnown[1].y)} stroke="#0284c7" strokeWidth={3} />
                  <line x1={toSvgX(rectKnown[0].x)} y1={toSvgY(rectKnown[0].y)} x2={toSvgX(rectKnown[2].x)} y2={toSvgY(rectKnown[2].y)} stroke="#0284c7" strokeWidth={3} />

                  {rectPlacedD && (
                    <>
                      <polygon
                        points={`${toSvgX(rectKnown[0].x)},${toSvgY(rectKnown[0].y)} ${toSvgX(rectKnown[1].x)},${toSvgY(rectKnown[1].y)} ${toSvgX(rectPlacedD.x)},${toSvgY(rectPlacedD.y)} ${toSvgX(rectKnown[2].x)},${toSvgY(rectKnown[2].y)}`}
                        fill="#bae6fd"
                        fillOpacity={0.4}
                        stroke="#0284c7"
                        strokeWidth={2.5}
                        strokeDasharray={rectPlacedD.x === 2 && rectPlacedD.y === 5 ? 'none' : '4'}
                      />
                      <circle cx={toSvgX(rectPlacedD.x)} cy={toSvgY(rectPlacedD.y)} r={7} fill="#ef4444" stroke="#ffffff" strokeWidth={2} />
                      <text x={toSvgX(rectPlacedD.x) + 8} y={toSvgY(rectPlacedD.y) - 8} fill="#b91c1c" fontWeight="bold" fontSize="13">
                        D({isNe ? toNp(rectPlacedD.x) : rectPlacedD.x}, {isNe ? toNp(rectPlacedD.y) : rectPlacedD.y})
                      </text>
                    </>
                  )}

                  {rectKnown.map((p) => (
                    <g key={p.name}>
                      <circle cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={6} fill="#0369a1" stroke="#ffffff" strokeWidth={2} />
                      <text x={toSvgX(p.x) + 8} y={toSvgY(p.y) - 6} fill="#075985" fontWeight="bold" fontSize="12">
                        {p.name}({isNe ? toNp(p.x) : p.x}, {isNe ? toNp(p.y) : p.y})
                      </text>
                    </g>
                  ))}
                </>
              )}

              {/* Tab 4: Missing Square */}
              {activeTab === 'missing_square' && (
                <>
                  <line x1={toSvgX(squareKnown[0].x)} y1={toSvgY(squareKnown[0].y)} x2={toSvgX(squareKnown[1].x)} y2={toSvgY(squareKnown[1].y)} stroke="#7c3aed" strokeWidth={3} />
                  <line x1={toSvgX(squareKnown[1].x)} y1={toSvgY(squareKnown[1].y)} x2={toSvgX(squareKnown[2].x)} y2={toSvgY(squareKnown[2].y)} stroke="#7c3aed" strokeWidth={3} />

                  {squarePlacedM && (
                    <>
                      <polygon
                        points={`${toSvgX(squareKnown[0].x)},${toSvgY(squareKnown[0].y)} ${toSvgX(squareKnown[1].x)},${toSvgY(squareKnown[1].y)} ${toSvgX(squareKnown[2].x)},${toSvgY(squareKnown[2].y)} ${toSvgX(squarePlacedM.x)},${toSvgY(squarePlacedM.y)}`}
                        fill="#ddd6fe"
                        fillOpacity={0.4}
                        stroke="#7c3aed"
                        strokeWidth={2.5}
                        strokeDasharray={squarePlacedM.x === -4 && squarePlacedM.y === -4 ? 'none' : '4'}
                      />
                      <circle cx={toSvgX(squarePlacedM.x)} cy={toSvgY(squarePlacedM.y)} r={7} fill="#ef4444" stroke="#ffffff" strokeWidth={2} />
                      <text x={toSvgX(squarePlacedM.x) + 8} y={toSvgY(squarePlacedM.y) - 8} fill="#b91c1c" fontWeight="bold" fontSize="13">
                        M({isNe ? toNp(squarePlacedM.x) : squarePlacedM.x}, {isNe ? toNp(squarePlacedM.y) : squarePlacedM.y})
                      </text>
                    </>
                  )}

                  {squareKnown.map((p) => (
                    <g key={p.name}>
                      <circle cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={6} fill="#6d28d9" stroke="#ffffff" strokeWidth={2} />
                      <text x={toSvgX(p.x) + 8} y={toSvgY(p.y) - 6} fill="#5b21b6" fontWeight="bold" fontSize="12">
                        {p.name}({isNe ? toNp(p.x) : p.x}, {isNe ? toNp(p.y) : p.y})
                      </text>
                    </g>
                  ))}
                </>
              )}

              {/* Tab 5: Freeform Polygon */}
              {activeTab === 'free_draw' && (
                <>
                  {freePoints.length >= 3 && (
                    <polygon
                      points={freePoints.map((p) => `${toSvgX(p.x)},${toSvgY(p.y)}`).join(' ')}
                      fill="#fed7aa"
                      fillOpacity={0.4}
                      stroke="#ea580c"
                      strokeWidth={2.5}
                    />
                  )}
                  {freePoints.map((p) => (
                    <g key={p.name}>
                      <circle cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={6} fill="#c2410c" stroke="#ffffff" strokeWidth={2} />
                      <text x={toSvgX(p.x) + 8} y={toSvgY(p.y) - 6} fill="#9a3412" fontWeight="bold" fontSize="11">
                        {p.name}({isNe ? toNp(p.x) : p.x}, {isNe ? toNp(p.y) : p.y})
                      </text>
                    </g>
                  ))}
                </>
              )}
            </svg>
          </div>

          {/* Right Explanation Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Tab 1: Joined Shapes */}
            {activeTab === 'join_shapes' && (
              <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#16a34a', fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shapes size={20} />
                  {L('पाठ्यपुस्तकका आकृतिहरू (Shapes Formed by Points)', 'Textbook Shapes Formed by Points')}
                </h3>

                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  {[
                    { id: 'rectangle', labelNp: 'आयत (Rectangle ABCD)', labelEn: 'Rectangle' },
                    { id: 'triangle', labelNp: 'त्रिभुज (Triangle RST)', labelEn: 'Triangle' },
                    { id: 'parallelogram', labelNp: 'समानान्तर चतुर्भुज', labelEn: 'Parallelogram' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedShapePreset(p.id as any)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: 12,
                        cursor: 'pointer',
                        border: selectedShapePreset === p.id ? '2px solid #16a34a' : '1px solid #cbd5e1',
                        background: selectedShapePreset === p.id ? '#dcfce7' : '#ffffff',
                        color: selectedShapePreset === p.id ? '#166534' : '#334155',
                      }}
                    >
                      {isNe ? p.labelNp : p.labelEn}
                    </button>
                  ))}
                </div>

                <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#166534' }}>
                    {isNe ? presetData.shapeNameNp : presetData.shapeNameEn}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: '#334155' }}>
                    {isNe ? presetData.descNp : presetData.descEn}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', background: '#f1f5f9', padding: 8, borderRadius: 6 }}>
                    <strong>{L('शीर्षबिन्दुहरू (Vertices):', 'Vertices:')}</strong>{' '}
                    {presetData.points.map((pt) => `${pt.name}(${isNe ? toNp(pt.x) : pt.x}, ${isNe ? toNp(pt.y) : pt.y})`).join(', ')}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Grid Distance */}
            {activeTab === 'grid_distance' && (
              <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#2563eb', fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Ruler size={20} />
                  {L('ग्रिड कोठाहरू गनेर दुरी पत्ता लगाउने विधि', 'Counting Grid Units for Distance')}
                </h3>
                <p style={{ margin: '0 0 12px 0', fontSize: 13, color: '#475569' }}>
                  {L(
                    'यदि दुई बिन्दुहरू एउटै क्षितिज वा ठाडो रेखामा छन् भने जटिल सूत्र प्रयोग नगरी सिधै ग्रिडका कोठाहरू गनेर दुरी नापिन्छ:',
                    'When two points lie along the same horizontal or vertical grid line, distance is found by directly counting the grid units:'
                  )}
                </p>

                <div style={{ background: '#eff6ff', padding: 12, borderRadius: 10, border: '1.5px solid #bfdbfe', marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8' }}>
                    {L('दुई बिन्दु बीचको क्षितिज दुरी:', 'Horizontal Distance Between P & Q:')}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1e40af', marginTop: 4 }}>
                    PQ = {toNp(Math.abs(distP2.x - distP1.x))} {L('एक इकाइहरू (Units)', 'Units')}
                  </div>
                  <div style={{ fontSize: 12, color: '#1e3a8a', marginTop: 4 }}>
                    {L(
                      `गणना: |${toNp(distP2.x)} - (${toNp(distP1.x)})| = ${toNp(distP2.x - distP1.x)} कोठाहरू`,
                      `Calculation: |${distP2.x} - (${distP1.x})| = ${distP2.x - distP1.x} grid units`
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{L('बिन्दु Q सार्नुहोस्:', 'Adjust point Q:')}</span>
                  <button
                    onClick={() => setDistP2((p) => ({ ...p, x: Math.max(-8, p.x - 1) }))}
                    style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
                  >
                    ← X-
                  </button>
                  <button
                    onClick={() => setDistP2((p) => ({ ...p, x: Math.min(8, p.x + 1) }))}
                    style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
                  >
                    X+ →
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Missing Rect */}
            {activeTab === 'missing_rect' && (
              <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#0284c7', fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Square size={20} />
                  {L('पाठ्यपुस्तक अभ्यास: आयतको हराएको शीर्षबिन्दु D', 'Textbook: Missing Vertex D of Rectangle')}
                </h3>
                <p style={{ margin: '0 0 10px 0', fontSize: 13, color: '#475569' }}>
                  {L(
                    'दिइएका शीर्षबिन्दुहरू A(-२,३), B(२,३) र C(-२,५) हुन्। आयत पूरा गर्न ग्राफमा D बिन्दु कहाँ हुनुपर्छ? ग्राफमा क्लिक गर्नुहोस्:',
                    'Given A(-2,3), B(2,3), and C(-2,5). Find missing vertex D to complete the rectangle. Click on the graph:'
                  )}
                </p>

                <div style={{ background: '#ffffff', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, marginBottom: 12 }}>
                  <div>• {L('तल्लो भुजा AB को लम्बाइ = |२ - (-२)| = ४ एकाइ', 'Bottom side AB length = |2 - (-2)| = 4 units')}</div>
                  <div>• {L('बायाँ भुजा AC को लम्बाइ = |५ - ३| = २ एकाइ', 'Left side AC height = |5 - 3| = 2 units')}</div>
                  <div>• {L('विपरित भुजाहरू समानान्तर र बराबर हुन D(२, ५) हुनुपर्छ।', 'Opposite sides must match, giving D(2, 5).')}</div>
                </div>

                {rectFeedback && (
                  <div style={{ padding: 10, borderRadius: 8, background: rectFeedback.includes('स्याबास') || rectFeedback.includes('Correct') ? '#dcfce7' : '#fee2e2', color: rectFeedback.includes('स्याबास') || rectFeedback.includes('Correct') ? '#166534' : '#991b1b', fontSize: 13, fontWeight: 700 }}>
                    {rectFeedback}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Missing Square */}
            {activeTab === 'missing_square' && (
              <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#7c3aed', fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Square size={20} />
                  {L('पाठ्यपुस्तक अभ्यास: वर्गको हराएको शीर्षबिन्दु M', 'Textbook: Missing Vertex M of Square')}
                </h3>
                <p style={{ margin: '0 0 10px 0', fontSize: 13, color: '#475569' }}>
                  {L(
                    'दिइएका शीर्षबिन्दुहरू J(-४,४), K(४,४) र L(४,-४) हुन्। वर्ग पूरा गर्न चौथो शीर्षबिन्दु M कहाँ पर्छ? ग्राफमा क्लिक गर्नुहोस्:',
                    'Given J(-4,4), K(4,4), and L(4,-4). Find missing vertex M to complete the square. Click on the graph:'
                  )}
                </p>

                <div style={{ background: '#ffffff', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, marginBottom: 12 }}>
                  <div>• {L('माथिल्लो भुजा JK को लम्बाइ = |४ - (-४)| = ८ एकाइ', 'Top side JK = |4 - (-4)| = 8 units')}</div>
                  <div>• {L('दायाँ भुजा KL को लम्बाइ = |४ - (-४)| = ८ एकाइ', 'Right side KL = |4 - (-4)| = 8 units')}</div>
                  <div>• {L('वर्गका चारै भुजा बराबर (८ एकाइ) हुन M(-४, -४) हुनुपर्छ।', 'All 4 sides equal 8 units, so M(-4, -4).')}</div>
                </div>

                {squareFeedback && (
                  <div style={{ padding: 10, borderRadius: 8, background: squareFeedback.includes('स्याबास') || squareFeedback.includes('Excellent') ? '#dcfce7' : '#fee2e2', color: squareFeedback.includes('स्याबास') || squareFeedback.includes('Excellent') ? '#166534' : '#991b1b', fontSize: 13, fontWeight: 700 }}>
                    {squareFeedback}
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: Freeform Polygon */}
            {activeTab === 'free_draw' && (
              <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#ea580c', fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PenTool size={20} />
                  {L('स्वतन्त्र बहुभुज निर्माण स्टुडियो (Polygon Studio)', 'Freeform Polygon Studio')}
                </h3>
                <p style={{ margin: '0 0 10px 0', fontSize: 13, color: '#475569' }}>
                  {L(
                    'ग्राफमा क्लिक गरेर ८ वटासम्म शीर्षबिन्दुहरू थप्नुहोस्। शीर्षबिन्दुहरू आफैँ जोडिएर बहुभुज बन्नेछ:',
                    'Click on the graph grid to add up to 8 vertices. They will automatically connect to form a polygon:'
                  )}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {freePoints.map((p, idx) => (
                    <div
                      key={p.name}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 6,
                        background: '#ffedd5',
                        border: '1px solid #fdba74',
                        color: '#9a3412',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {p.name}({isNe ? toNp(p.x) : p.x}, {isNe ? toNp(p.y) : p.y})
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setFreePoints([])}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    color: '#475569',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <RotateCcw size={14} />
                  {L('सबै मेटाउनुहोस्', 'Clear Points')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default CoordinateGeometryBuilder;

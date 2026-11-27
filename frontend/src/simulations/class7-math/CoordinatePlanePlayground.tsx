/**
 * CoordinatePlanePlayground.tsx
 * Grade 7 Mathematics – Lesson 17: COORDINATES (निर्देशाङ्कहरू)
 * Simulation 6: Coordinate Plane and Point Plotting Playground (निर्देशाङ्क समतल र बिन्दु अङ्कन खेलमैदान)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 247-254)
 */
import React, { useState, useRef, useEffect } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Grid, Crosshair, HelpCircle, Check, Award, ArrowRight, RotateCcw, Target, Users } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'निर्देशाङ्क समतलमा क्षितिज रेखा (Horizontal Line) XOX\' लाई के भनिन्छ?',
    en: 'What is the horizontal line XOX\' on a coordinate plane called?',
    options: [
      { key: 'A', label: 'X-अक्ष (X-axis)' },
      { key: 'B', label: 'Y-अक्ष (Y-axis)' },
      { key: 'C', label: 'उद्गम बिन्दु (Origin)' },
      { key: 'D', label: 'चतुर्थांश (Quadrant)' },
    ],
    answer: 'A',
  },
  {
    np: 'X-अक्ष र Y-अक्ष काटिएको बिन्दु (उद्गम बिन्दु O) को निर्देशाङ्क कति हुन्छ?',
    en: 'What are the coordinates of the origin O where X-axis and Y-axis intersect?',
    options: [
      { key: 'A', label: '(०, ०) / (0, 0)' },
      { key: 'B', label: '(१, १) / (1, 1)' },
      { key: 'C', label: '(०, १) / (0, 1)' },
      { key: 'D', label: '(१, ०) / (1, 0)' },
    ],
    answer: 'A',
  },
  {
    np: 'कुनै बिन्दुको निर्देशाङ्क (-४, ३) छ भने यो कुन चतुर्थांश (Quadrant) मा पर्छ?',
    en: 'In which quadrant does the point (-4, 3) lie?',
    options: [
      { key: 'A', label: 'दोस्रो चतुर्थांश (Quadrant II: -, +)' },
      { key: 'B', label: 'पहिलो चतुर्थांश (Quadrant I: +, +)' },
      { key: 'C', label: 'तेस्रो चतुर्थांश (Quadrant III: -, -)' },
      { key: 'D', label: 'चौथो चतुर्थांश (Quadrant IV: +, -)' },
    ],
    answer: 'A',
  },
  {
    np: 'बिन्दु R(-२, ०) कहाँ अवस्थित हुन्छ?',
    en: 'Where is the point R(-2, 0) located?',
    options: [
      { key: 'A', label: 'ऋणात्मक X-अक्षमा (On negative X-axis)' },
      { key: 'B', label: 'Y-अक्षमा' },
      { key: 'C', label: 'तेस्रो चतुर्थांशमा' },
      { key: 'D', label: 'पहिलो चतुर्थांशमा' },
    ],
    answer: 'A',
  },
  {
    np: 'बिन्दु (x, y) अङ्कन गर्दा उद्गम बिन्दु (0,0) बाट पहिले कता हिँडिन्छ?',
    en: 'When plotting a point (x, y), in which direction do you move first from the origin (0,0)?',
    options: [
      { key: 'A', label: 'क्षितिज दिशामा (दायाँ वा बायाँ) X-मान अनुसार' },
      { key: 'B', label: 'ठाडो दिशामा (माथि वा तल) मात्र' },
      { key: 'C', label: 'सिधै छड्के' },
      { key: 'D', label: 'कुनै पनि दिशामा' },
    ],
    answer: 'A',
  },
];

const TEXTBOOK_POINTS = [
  { name: 'A', x: 6, y: 3, labelNp: 'A(६, ३)', labelEn: 'A(6, 3)' },
  { name: 'B', x: -3, y: 5, labelNp: 'B(-३, ५)', labelEn: 'B(-3, 5)' },
  { name: 'C', x: -4, y: -3, labelNp: 'C(-४, -३)', labelEn: 'C(-4, -3)' },
  { name: 'D', x: 4, y: -4, labelNp: 'D(४, -४)', labelEn: 'D(4, -4)' },
  { name: 'P', x: 2, y: 2, labelNp: 'P(२, २)', labelEn: 'P(2, 2)' },
  { name: 'Q', x: -3, y: 4, labelNp: 'Q(-३, ४)', labelEn: 'Q(-3, 4)' },
  { name: 'R', x: -2, y: 0, labelNp: 'R(-२, ०)', labelEn: 'R(-2, 0)' },
  { name: 'S', x: 5, y: -2, labelNp: 'S(५, -२)', labelEn: 'S(5, -2)' },
  { name: 'T', x: -5, y: -5, labelNp: 'T(-५, -५)', labelEn: 'T(-5, -5)' },
];

export const CoordinatePlanePlayground: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L17-01',
    chapter: 17,
    titleNp: 'निर्देशाङ्क समतल र बिन्दु अङ्कन खेलमैदान',
    titleEn: 'Coordinate Plane & Point Plotting Playground',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'axes' | 'pairs' | 'quadrants' | 'plotting' | 'game'>('axes');

  // Interactive Point for Explore & Pairs
  const [point, setPoint] = useState<{ x: number; y: number }>({ x: 3, y: 4 });

  // Plotting state
  const [targetPointIndex, setTargetPointIndex] = useState(0);
  const [plottedPoints, setPlottedPoints] = useState<{ name: string; x: number; y: number; correct: boolean }[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Game state
  const [gameScore, setGameScore] = useState(0);
  const [gameRound, setGameRound] = useState(1);
  const [gameTarget, setGameTarget] = useState<{ x: number; y: number }>({ x: 2, y: 3 });
  const [gameGuessedQuad, setGameGuessedQuad] = useState<string | null>(null);
  const [gameAnswered, setGameAnswered] = useState(false);

  // SVG grid settings
  const gridSize = 440;
  const unitSize = 24; // 24px per unit => -8 to +8
  const origin = gridSize / 2; // (220, 220)

  const toSvgX = (gridX: number) => origin + gridX * unitSize;
  const toSvgY = (gridY: number) => origin - gridY * unitSize;

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert to grid integer coordinates (-8 to 8)
    const rawX = (clickX - origin) / unitSize;
    const rawY = (origin - clickY) / unitSize;
    const gridX = Math.round(rawX);
    const gridY = Math.round(rawY);

    if (Math.abs(gridX) > 8 || Math.abs(gridY) > 8) return;

    if (activeTab === 'pairs' || activeTab === 'quadrants' || activeTab === 'axes') {
      setPoint({ x: gridX, y: gridY });
    } else if (activeTab === 'plotting') {
      const target = TEXTBOOK_POINTS[targetPointIndex];
      const isCorrect = gridX === target.x && gridY === target.y;

      if (isCorrect) {
        kit.good();
        setFeedback(L(`स्याबास! तपाईंले सही बिन्दु ${target.name}(${toNp(target.x)}, ${toNp(target.y)}) अङ्कन गर्नुभयो!`, `Correct! You accurately plotted ${target.name}(${target.x}, ${target.y})!`));
        setPlottedPoints((prev) => [
          ...prev.filter((p) => p.name !== target.name),
          { name: target.name, x: gridX, y: gridY, correct: true },
        ]);
        if (targetPointIndex < TEXTBOOK_POINTS.length - 1) {
          setTimeout(() => {
            setTargetPointIndex((i) => i + 1);
            setFeedback(null);
          }, 1400);
        }
      } else {
        kit.oops();
        setFeedback(L(`बिन्दु मिलेन! तपाईंले (${toNp(gridX)}, ${toNp(gridY)}) मा क्लिक गर्नुभयो। लक्ष्य बिन्दु ${target.name}(${toNp(target.x)}, ${toNp(target.y)}) हो।`, `Incorrect! You clicked (${gridX}, ${gridY}). Target is ${target.name}(${target.x}, ${target.y}). Try again!`));
      }
    }
  };

  const getQuadrant = (x: number, y: number) => {
    if (x === 0 && y === 0) return L('उद्गम बिन्दु O(०,०)', 'Origin O(0,0)');
    if (x === 0) return L('Y-अक्षमा (On Y-axis)', 'On Y-axis');
    if (y === 0) return L('X-अक्षमा (On X-axis)', 'On X-axis');
    if (x > 0 && y > 0) return L('पहिलो चतुर्थांश (Quadrant I: +, +)', 'Quadrant I (+, +)');
    if (x < 0 && y > 0) return L('दोस्रो चतुर्थांश (Quadrant II: -, +)', 'Quadrant II (-, +)');
    if (x < 0 && y < 0) return L('तेस्रो चतुर्थांश (Quadrant III: -, -)', 'Quadrant III (-, -)');
    return L('चौथो चतुर्थांश (Quadrant IV: +, -)', 'Quadrant IV (+, -)');
  };

  const nextGameQuestion = () => {
    const rx = Math.floor(Math.random() * 13) - 6; // -6 to 6
    const ry = Math.floor(Math.random() * 13) - 6;
    setGameTarget({ x: rx === 0 ? 3 : rx, y: ry === 0 ? -4 : ry });
    setGameGuessedQuad(null);
    setGameAnswered(false);
    setGameRound((r) => r + 1);
  };

  const handleQuadGuess = (q: 'I' | 'II' | 'III' | 'IV' | 'AXIS') => {
    if (gameAnswered) return;
    setGameGuessedQuad(q);
    setGameAnswered(true);

    let correct = false;
    const { x, y } = gameTarget;
    if (q === 'I' && x > 0 && y > 0) correct = true;
    else if (q === 'II' && x < 0 && y > 0) correct = true;
    else if (q === 'III' && x < 0 && y < 0) correct = true;
    else if (q === 'IV' && x > 0 && y < 0) correct = true;
    else if (q === 'AXIS' && (x === 0 || y === 0)) correct = true;

    if (correct) {
      kit.good();
      setGameScore((s) => s + 10);
    } else {
      kit.oops();
    }
  };

  // Render Grid Lines & Labels
  const renderGrid = () => {
    const lines = [];
    for (let i = -8; i <= 8; i++) {
      const pos = origin + i * unitSize;
      // Grid lines
      lines.push(
        <line
          key={`v-${i}`}
          x1={pos}
          y1={10}
          x2={pos}
          y2={gridSize - 10}
          stroke={i === 0 ? '#1e293b' : '#cbd5e1'}
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
          stroke={i === 0 ? '#1e293b' : '#cbd5e1'}
          strokeWidth={i === 0 ? 2.5 : 1}
        />
      );

      // Coordinate Numbers along axes
      if (i !== 0 && Math.abs(i) <= 8) {
        // Numbers on X-axis
        lines.push(
          <text
            key={`x-num-${i}`}
            x={origin + i * unitSize}
            y={origin + 16}
            fontSize="10"
            fill="#475569"
            textAnchor="middle"
            fontWeight="bold"
          >
            {isNe ? toNp(i) : i}
          </text>
        );
        // Numbers on Y-axis
        lines.push(
          <text
            key={`y-num-${i}`}
            x={origin - 10}
            y={origin - i * unitSize + 4}
            fontSize="10"
            fill="#475569"
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

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! XOX\' र YOY\' अक्षहरू तथा चार चतुर्थांशहरूमा बिन्दुहरू अङ्कन गर्न सिकौँ!',
        'Hello! Let us explore the axes, quadrants, and plot coordinates accurately on the grid!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, background: '#f8fafc', padding: 8, borderRadius: 12, border: '1px solid #e2e8f0' }}>
          {[
            { id: 'axes', labelNp: '१. अक्ष र उद्गम बिन्दु', labelEn: '1. Axes & Origin', icon: Grid },
            { id: 'pairs', labelNp: '२. क्रमित जोडा (x, y) चाल', labelEn: '2. Ordered Pairs (x,y)', icon: ArrowRight },
            { id: 'quadrants', labelNp: '३. चार चतुर्थांशहरू', labelEn: '3. 4 Quadrants', icon: Crosshair },
            { id: 'plotting', labelNp: '४. पाठ्यपुस्तकका बिन्दुहरू अङ्कन', labelEn: '4. Textbook Point Plotting', icon: Target },
            { id: 'game', labelNp: '५. निर्देशाङ्क खेल तथा चुनौती', labelEn: '5. Coordinate Challenge', icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setFeedback(null);
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
                  background: active ? '#0284c7' : '#ffffff',
                  color: active ? '#ffffff' : '#334155',
                  boxShadow: active ? '0 2px 4px rgba(2, 132, 199, 0.25)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />
                <span>{isNe ? tab.labelNp : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Main Interactive Stage */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 460px) 1fr', gap: 20, alignItems: 'start' }}>
          {/* Interactive Coordinate Grid Canvas */}
          <div style={{ background: '#ffffff', borderRadius: 16, padding: 12, border: '2px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0369a1', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Crosshair size={16} />
              {L('ग्राफ पेपरमा क्लिक गरेर बिन्दु छान्न सकिन्छ (-८ देखि +८ सम्म)', 'Click anywhere on the graph grid (-8 to +8) to test')}
            </div>

            <svg
              width={gridSize}
              height={gridSize}
              viewBox={`0 0 ${gridSize} ${gridSize}`}
              onClick={handleSvgClick}
              style={{ cursor: 'crosshair', userSelect: 'none', background: '#fafbfc', borderRadius: 8, border: '1px solid #cbd5e1' }}
            >
              {/* Quadrant Tinting if on quadrants tab */}
              {activeTab === 'quadrants' && (
                <>
                  <rect x={origin} y={10} width={origin - 10} height={origin - 10} fill="#f0fdf4" opacity={0.6} />
                  <text x={gridSize - 50} y={40} fill="#166534" fontWeight="bold" fontSize="13">Quadrant I (+, +)</text>

                  <rect x={10} y={10} width={origin - 10} height={origin - 10} fill="#eff6ff" opacity={0.6} />
                  <text x={30} y={40} fill="#1e40af" fontWeight="bold" fontSize="13">Quadrant II (-, +)</text>

                  <rect x={10} y={origin} width={origin - 10} height={origin - 10} fill="#fef2f2" opacity={0.6} />
                  <text x={30} y={gridSize - 30} fill="#991b1b" fontWeight="bold" fontSize="13">Quadrant III (-, -)</text>

                  <rect x={origin} y={origin} width={origin - 10} height={origin - 10} fill="#fffbeb" opacity={0.6} />
                  <text x={gridSize - 60} y={gridSize - 30} fill="#92400e" fontWeight="bold" fontSize="13">Quadrant IV (+, -)</text>
                </>
              )}

              {/* Grid Lines */}
              {renderGrid()}

              {/* Axis Labels */}
              <text x={gridSize - 18} y={origin - 8} fill="#0f172a" fontWeight="bold" fontSize="14">X</text>
              <text x={14} y={origin - 8} fill="#0f172a" fontWeight="bold" fontSize="14">X'</text>
              <text x={origin + 8} y={22} fill="#0f172a" fontWeight="bold" fontSize="14">Y</text>
              <text x={origin + 8} y={gridSize - 16} fill="#0f172a" fontWeight="bold" fontSize="14">Y'</text>
              <text x={origin - 14} y={origin + 16} fill="#dc2626" fontWeight="bold" fontSize="13">O</text>

              {/* Mode: Pairs step vectors */}
              {activeTab === 'pairs' && (
                <>
                  {/* Horizontal walk from Origin along X */}
                  <line
                    x1={origin}
                    y1={origin}
                    x2={toSvgX(point.x)}
                    y2={origin}
                    stroke="#ea580c"
                    strokeWidth={3.5}
                    strokeDasharray="4"
                  />
                  {/* Vertical walk to Y */}
                  <line
                    x1={toSvgX(point.x)}
                    y1={origin}
                    x2={toSvgX(point.x)}
                    y2={toSvgY(point.y)}
                    stroke="#2563eb"
                    strokeWidth={3.5}
                    strokeDasharray="4"
                  />
                </>
              )}

              {/* Interactive Selected Point */}
              {(activeTab === 'axes' || activeTab === 'pairs' || activeTab === 'quadrants') && (
                <g>
                  <circle
                    cx={toSvgX(point.x)}
                    cy={toSvgY(point.y)}
                    r={7}
                    fill="#dc2626"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                  <rect
                    x={toSvgX(point.x) + 8}
                    y={toSvgY(point.y) - 24}
                    width={76}
                    height={22}
                    rx={4}
                    fill="#1e293b"
                    opacity={0.88}
                  />
                  <text
                    x={toSvgX(point.x) + 46}
                    y={toSvgY(point.y) - 9}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    P({isNe ? toNp(point.x) : point.x}, {isNe ? toNp(point.y) : point.y})
                  </text>
                </g>
              )}

              {/* Plotting mode: already plotted points */}
              {activeTab === 'plotting' && (
                <>
                  {plottedPoints.map((p) => (
                    <g key={p.name}>
                      <circle
                        cx={toSvgX(p.x)}
                        cy={toSvgY(p.y)}
                        r={7}
                        fill="#16a34a"
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                      <text
                        x={toSvgX(p.x) + 10}
                        y={toSvgY(p.y) - 8}
                        fill="#15803d"
                        fontWeight="bold"
                        fontSize="12"
                      >
                        {p.name}({isNe ? toNp(p.x) : p.x}, {isNe ? toNp(p.y) : p.y})
                      </text>
                    </g>
                  ))}
                  {/* Guide ring around target to help learners */}
                  {TEXTBOOK_POINTS[targetPointIndex] && (
                    <circle
                      cx={toSvgX(TEXTBOOK_POINTS[targetPointIndex].x)}
                      cy={toSvgY(TEXTBOOK_POINTS[targetPointIndex].y)}
                      r={14}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth={2}
                      strokeDasharray="4"
                      opacity={0.7}
                    />
                  )}
                </>
              )}

              {/* Game mode: random target */}
              {activeTab === 'game' && (
                <g>
                  <circle
                    cx={toSvgX(gameTarget.x)}
                    cy={toSvgY(gameTarget.y)}
                    r={8}
                    fill="#7c3aed"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                  <text
                    x={toSvgX(gameTarget.x) + 10}
                    y={toSvgY(gameTarget.y) - 6}
                    fill="#6d28d9"
                    fontWeight="bold"
                    fontSize="13"
                  >
                    Target({isNe ? toNp(gameTarget.x) : gameTarget.x}, {isNe ? toNp(gameTarget.y) : gameTarget.y})
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Right Panel: Educational Explanation & Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Tab 1: Axes & Origin */}
            {activeTab === 'axes' && (
              <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Grid size={20} />
                  {L('निर्देशाङ्क अक्षहरू र उद्गम बिन्दु (Axes and Origin)', 'Coordinate Axes and Origin')}
                </h3>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: '#334155', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ background: '#ffffff', padding: 10, borderRadius: 8, borderLeft: '4px solid #0284c7' }}>
                    <strong>X-अक्ष (X-axis):</strong> {L('क्षितिज रेखा XOX\' लाई X-अक्ष भनिन्छ। दायाँतर्फ OX धनात्मक (+) र बायाँतर्फ OX\' ऋणात्मक (-) हुन्छ।', 'The horizontal line XOX\' is the X-axis. OX is positive (+) to the right and OX\' is negative (-) to the left.')}
                  </div>
                  <div style={{ background: '#ffffff', padding: 10, borderRadius: 8, borderLeft: '4px solid #10b981' }}>
                    <strong>Y-अक्ष (Y-axis):</strong> {L('ठाडो रेखा YOY\' लाई Y-अक्ष भनिन्छ। माथितर्फ OY धनात्मक (+) र तलतर्फ OY\' ऋणात्मक (-) हुन्छ।', 'The vertical line YOY\' is the Y-axis. OY is positive (+) upwards and OY\' is negative (-) downwards.')}
                  </div>
                  <div style={{ background: '#ffffff', padding: 10, borderRadius: 8, borderLeft: '4px solid #ef4444' }}>
                    <strong>उद्गम बिन्दु (Origin O):</strong> {L('दुवै अक्षहरू एकआपसमा लम्ब भएर काटिने बिन्दु O लाई उद्गम बिन्दु भनिन्छ। यसको निर्देशाङ्क (०, ०) हुन्छ।', 'The intersection point O of both axes is the origin. Its coordinates are (0, 0).')}
                  </div>
                </div>

                <div style={{ marginTop: 14, background: '#f0f9ff', padding: 12, borderRadius: 10, border: '1px solid #bae6fd' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0369a1' }}>
                    {L('छानिएको बिन्दु P को स्थिति:', 'Position of Selected Point P:')}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                    P({isNe ? toNp(point.x) : point.x}, {isNe ? toNp(point.y) : point.y})
                  </div>
                  <div style={{ fontSize: 13, color: '#0284c7', fontWeight: 600, marginTop: 2 }}>
                    {getQuadrant(point.x, point.y)}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Ordered Pairs */}
            {activeTab === 'pairs' && (
              <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#ea580c', fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ArrowRight size={20} />
                  {L('क्रमित जोडा (Ordered Pair) र चाल', 'Ordered Pair (x, y) & Movement')}
                </h3>
                <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#475569' }}>
                  {L(
                    'उद्गम बिन्दु O(०,०) बाट कुनै बिन्दु (x, y) सम्म पुग्न पहिले क्षितिज दिशा (X) र त्यसपछि ठाडो दिशा (Y) मा हिँड्नुपर्छ:',
                    'To locate any point (x, y), always start from Origin (0,0), move horizontally along X first, then vertically along Y second:'
                  )}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  <div style={{ background: '#fff7ed', border: '1.5px solid #fdba74', padding: 10, borderRadius: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#c2410c' }}>
                      {L('१. पहिलो सङ्ख्या (x-मान)', '1. First Number (x-coord)')}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#9a3412', marginTop: 2 }}>
                      x = {isNe ? toNp(point.x) : point.x}
                    </div>
                    <div style={{ fontSize: 12, color: '#7c2d12', marginTop: 4 }}>
                      {point.x >= 0
                        ? L(`दायाँतर्फ ${toNp(point.x)} एकाइ`, `${point.x} units Right`)
                        : L(`बायाँतर्फ ${toNp(Math.abs(point.x))} एकाइ`, `${Math.abs(point.x)} units Left`)}
                    </div>
                  </div>

                  <div style={{ background: '#eff6ff', border: '1.5px solid #93c5fd', padding: 10, borderRadius: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>
                      {L('२. दोस्रो सङ्ख्या (y-मान)', '2. Second Number (y-coord)')}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#1e40af', marginTop: 2 }}>
                      y = {isNe ? toNp(point.y) : point.y}
                    </div>
                    <div style={{ fontSize: 12, color: '#1e3a8a', marginTop: 4 }}>
                      {point.y >= 0
                        ? L(`माथितर्फ ${toNp(point.y)} एकाइ`, `${point.y} units Up`)
                        : L(`तलतर्फ ${toNp(Math.abs(point.y))} एकाइ`, `${Math.abs(point.y)} units Down`)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{L('बिन्दु सार्नुहोस्:', 'Adjust point:')}</span>
                  <button
                    onClick={() => setPoint((p) => ({ ...p, x: Math.max(-8, p.x - 1) }))}
                    style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
                  >
                    ← X-
                  </button>
                  <button
                    onClick={() => setPoint((p) => ({ ...p, x: Math.min(8, p.x + 1) }))}
                    style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
                  >
                    X+ →
                  </button>
                  <button
                    onClick={() => setPoint((p) => ({ ...p, y: Math.min(8, p.y + 1) }))}
                    style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
                  >
                    ↑ Y+
                  </button>
                  <button
                    onClick={() => setPoint((p) => ({ ...p, y: Math.max(-8, p.y - 1) }))}
                    style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
                  >
                    ↓ Y-
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Four Quadrants */}
            {activeTab === 'quadrants' && (
              <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#16a34a', fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Crosshair size={20} />
                  {L('चार चतुर्थांशहरूका चिन्ह नियमहरू (Quadrant Signs)', 'Four Quadrants and Sign Rules')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 8, borderRadius: 6 }}>
                    <strong style={{ color: '#166534' }}>पहिलो (I): (+, +)</strong>
                    <div style={{ color: '#15803d', fontSize: 12 }}>x &gt; ० र y &gt; ०</div>
                  </div>
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: 8, borderRadius: 6 }}>
                    <strong style={{ color: '#1e40af' }}>दोस्रो (II): (-, +)</strong>
                    <div style={{ color: '#1d4ed8', fontSize: 12 }}>x &lt; ० र y &gt; ०</div>
                  </div>
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 8, borderRadius: 6 }}>
                    <strong style={{ color: '#991b1b' }}>तेस्रो (III): (-, -)</strong>
                    <div style={{ color: '#b91c1c', fontSize: 12 }}>x &lt; ० र y &lt; ०</div>
                  </div>
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: 8, borderRadius: 6 }}>
                    <strong style={{ color: '#92400e' }}>चौथो (IV): (+, -)</strong>
                    <div style={{ color: '#b45309', fontSize: 12 }}>x &gt; ० र y &lt; ०</div>
                  </div>
                </div>

                <div style={{ marginTop: 14, padding: 10, background: '#ffffff', borderRadius: 8, border: '1px solid #cbd5e1' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>
                    {L('अक्षहरूमा पर्ने बिन्दुहरू:', 'Points on Axes:')}
                  </div>
                  <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: 12, color: '#334155' }}>
                    <li>{L('यदि y = ० भए बिन्दु X-अक्षमा पर्छ (जस्तै: (-२, ०))', 'If y = 0, point lies on X-axis (e.g. (-2, 0))')}</li>
                    <li>{L('यदि x = ० भए बिन्दु Y-अक्षमा पर्छ (जस्तै: (०, ४))', 'If x = 0, point lies on Y-axis (e.g. (0, 4))')}</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 4: Textbook Points Plotting */}
            {activeTab === 'plotting' && (
              <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#0284c7', fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Target size={20} />
                  {L('पाठ्यपुस्तकका बिन्दुहरू अङ्कन प्रयोगशाला', 'CDC Textbook Point Plotting Lab')}
                </h3>
                <p style={{ margin: '0 0 10px 0', fontSize: 13, color: '#475569' }}>
                  {L(
                    'पाठ्यपुस्तकका तल दिइएका बिन्दुहरूलाई पालैपालो ग्राफ पेपरमा क्लिक गरेर अङ्कन गर्नुहोस्:',
                    'Plot the CDC textbook points sequentially by clicking on their exact grid location:'
                  )}
                </p>

                <div style={{ background: '#e0f2fe', padding: 12, borderRadius: 10, border: '1.5px solid #7dd3fc', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0369a1' }}>
                    {L('अङ्कन गर्नुपर्ने लक्ष्य बिन्दु (Target Point):', 'Target Point to Plot:')}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#0284c7', marginTop: 4 }}>
                    {isNe
                      ? TEXTBOOK_POINTS[targetPointIndex].labelNp
                      : TEXTBOOK_POINTS[targetPointIndex].labelEn}
                  </div>
                  <div style={{ fontSize: 12, color: '#075985', marginTop: 4 }}>
                    {L(
                      `संकेत: उद्गम बिन्दुबाट X = ${toNp(TEXTBOOK_POINTS[targetPointIndex].x)} र Y = ${toNp(TEXTBOOK_POINTS[targetPointIndex].y)} खोज्नुहोस्।`,
                      `Hint: From Origin, move X = ${TEXTBOOK_POINTS[targetPointIndex].x} and Y = ${TEXTBOOK_POINTS[targetPointIndex].y}.`
                    )}
                  </div>
                </div>

                {feedback && (
                  <div style={{ padding: 10, borderRadius: 8, background: feedback.includes('स्याबास') || feedback.includes('Correct') ? '#dcfce7' : '#fee2e2', color: feedback.includes('स्याबास') || feedback.includes('Correct') ? '#166534' : '#991b1b', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                    {feedback}
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {TEXTBOOK_POINTS.map((pt, idx) => {
                    const isDone = plottedPoints.some((p) => p.name === pt.name);
                    const isCurrent = idx === targetPointIndex;
                    return (
                      <button
                        key={pt.name}
                        onClick={() => {
                          setTargetPointIndex(idx);
                          setFeedback(null);
                        }}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: isCurrent ? '2px solid #0284c7' : '1px solid #cbd5e1',
                          background: isDone ? '#dcfce7' : isCurrent ? '#f0f9ff' : '#ffffff',
                          color: isDone ? '#15803d' : '#334155',
                        }}
                      >
                        {isNe ? pt.labelNp : pt.labelEn} {isDone ? '✓' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 5: Game & Challenge */}
            {activeTab === 'game' && (
              <div style={{ background: '#f8fafc', padding: 18, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h3 style={{ margin: 0, color: '#7c3aed', fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Award size={20} />
                    {L('निर्देशाङ्क समूह चुनौती (Coordinate Challenge)', 'Coordinate Quiz Game')}
                  </h3>
                  <div style={{ background: '#f3e8ff', color: '#6d28d9', fontWeight: 800, padding: '4px 10px', borderRadius: 12, fontSize: 13 }}>
                    {L(`अङ्क: ${toNp(gameScore)}`, `Score: ${gameScore}`)}
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 14 }}>
                  <div style={{ fontSize: 13, color: '#64748b' }}>
                    {L(`प्रश्न ${toNp(gameRound)}: ग्राफमा देखाइएको बिन्दु कुन चतुर्थांशमा पर्छ?`, `Round ${gameRound}: In which quadrant does the shown point lie?`)}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#7c3aed', marginTop: 4 }}>
                    ({isNe ? toNp(gameTarget.x) : gameTarget.x}, {isNe ? toNp(gameTarget.y) : gameTarget.y})
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { key: 'I', labelNp: 'Quadrant I (+, +)', labelEn: 'Quadrant I (+, +)' },
                    { key: 'II', labelNp: 'Quadrant II (-, +)', labelEn: 'Quadrant II (-, +)' },
                    { key: 'III', labelNp: 'Quadrant III (-, -)', labelEn: 'Quadrant III (-, -)' },
                    { key: 'IV', labelNp: 'Quadrant IV (+, -)', labelEn: 'Quadrant IV (+, -)' },
                  ].map((btn) => (
                    <button
                      key={btn.key}
                      onClick={() => handleQuadGuess(btn.key as any)}
                      disabled={gameAnswered}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: gameAnswered ? 'default' : 'pointer',
                        border: '1.5px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#334155',
                      }}
                    >
                      {btn.labelNp}
                    </button>
                  ))}
                </div>

                {gameAnswered && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: gameGuessedQuad ? '#15803d' : '#b91c1c' }}>
                      {L(`सही चतुर्थांश: ${getQuadrant(gameTarget.x, gameTarget.y)}`, `Correct: ${getQuadrant(gameTarget.x, gameTarget.y)}`)}
                    </div>
                    <button
                      onClick={nextGameQuestion}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        background: '#7c3aed',
                        color: '#ffffff',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {L('अर्को प्रश्न →', 'Next Question →')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default CoordinatePlanePlayground;

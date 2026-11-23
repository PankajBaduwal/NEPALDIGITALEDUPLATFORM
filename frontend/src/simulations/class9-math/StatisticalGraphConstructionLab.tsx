import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface Dataset {
  id: string;
  titleEn: string;
  titleNp: string;
  xLabelEn: string;
  xLabelNp: string;
  classes: { lower: number; upper: number; f: number }[];
}

const DATASETS: Dataset[] = [
  {
    id: 'marks',
    titleEn: 'Marks in Compulsory Math (50 Students)',
    titleNp: 'अनिवार्य गणितमा प्राप्ताङ्क (५० विद्यार्थी)',
    xLabelEn: 'Marks Obtained',
    xLabelNp: 'प्राप्ताङ्क',
    classes: [
      { lower: 0, upper: 10, f: 4 },
      { lower: 10, upper: 20, f: 8 },
      { lower: 20, upper: 30, f: 16 },
      { lower: 30, upper: 40, f: 14 },
      { lower: 40, upper: 50, f: 8 }
    ]
  },
  {
    id: 'daily_wages',
    titleEn: 'Daily Wages of Workers (Rs. in Hundreds)',
    titleNp: 'श्रमिकहरूको दैनिक ज्याला (रु. सयमा)',
    xLabelEn: 'Wages (Rs. 100s)',
    xLabelNp: 'दैनिक ज्याला (रु. सयमा)',
    classes: [
      { lower: 4, upper: 6, f: 5 },
      { lower: 6, upper: 8, f: 12 },
      { lower: 8, upper: 10, f: 18 },
      { lower: 10, upper: 12, f: 10 },
      { lower: 12, upper: 14, f: 5 }
    ]
  },
  {
    id: 'weight_students',
    titleEn: 'Weight of Grade 9 Students (kg)',
    titleNp: 'कक्षा ९ का विद्यार्थीहरूको तौल (कि.ग्रा.)',
    xLabelEn: 'Weight (kg)',
    xLabelNp: 'तौल (कि.ग्रा.)',
    classes: [
      { lower: 30, upper: 35, f: 6 },
      { lower: 35, upper: 40, f: 14 },
      { lower: 40, upper: 45, f: 20 },
      { lower: 45, upper: 50, f: 12 },
      { lower: 50, upper: 55, f: 8 }
    ]
  }
];

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const StatisticalGraphConstructionLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U17-02',
    chapter: 17,
    titleNp: 'साङ्ख्यिकीय रेखाचित्र निर्माण प्रयोगशाला',
    titleEn: 'Statistical Graph Construction Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'histogram' | 'polygon' | 'ogive' | 'bar'>('histogram');
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('marks');
  const [showPolygonOnHistogram, setShowPolygonOnHistogram] = useState<boolean>(true);
  const [showOgiveIntersection, setShowOgiveIntersection] = useState<boolean>(true);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const currentDataset = DATASETS.find(d => d.id === selectedDatasetId) || DATASETS[0];

  // Calculations for graphs
  const stats = useMemo(() => {
    const raw = currentDataset.classes;
    const totalN = raw.reduce((sum, c) => sum + c.f, 0);
    const maxFreq = Math.max(...raw.map(c => c.f));

    let cumLess = 0;
    const withCumulative = raw.map(c => {
      cumLess += c.f;
      return {
        ...c,
        mid: (c.lower + c.upper) / 2,
        cumLess
      };
    });

    let cumMore = totalN;
    const fullData = withCumulative.map(c => {
      const moreVal = cumMore;
      cumMore -= c.f;
      return {
        ...c,
        cumMore: moreVal
      };
    });

    return {
      classes: fullData,
      totalN,
      maxFreq
    };
  }, [currentDataset]);

  // SVG Dimension Constants
  const svgWidth = 640;
  const svgHeight = 380;
  const margin = { top: 35, right: 40, bottom: 65, left: 60 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;

  const minX = stats.classes[0].lower;
  const maxX = stats.classes[stats.classes.length - 1].upper;
  const classWidth = stats.classes[0].upper - stats.classes[0].lower;

  // Scales
  const getX = (val: number) => {
    return margin.left + ((val - minX) / (maxX - minX)) * plotWidth;
  };

  const getYFreq = (f: number) => {
    const yMax = Math.ceil(stats.maxFreq * 1.25);
    return margin.top + plotHeight - (f / yMax) * plotHeight;
  };

  const getYCum = (cf: number) => {
    return margin.top + plotHeight - (cf / stats.totalN) * plotHeight;
  };

  // Polygon Points (including preceding and succeeding 0-freq anchor points)
  const polygonPoints = useMemo(() => {
    const pts: { x: number; y: number; mid: number; f: number }[] = [];
    const first = stats.classes[0];
    const last = stats.classes[stats.classes.length - 1];

    // Anchor before
    const prevMid = first.mid - classWidth;
    pts.push({ x: getX(prevMid), y: getYFreq(0), mid: prevMid, f: 0 });

    stats.classes.forEach(c => {
      pts.push({ x: getX(c.mid), y: getYFreq(c.f), mid: c.mid, f: c.f });
    });

    // Anchor after
    const nextMid = last.mid + classWidth;
    pts.push({ x: getX(nextMid), y: getYFreq(0), mid: nextMid, f: 0 });

    return pts;
  }, [stats, minX, maxX]);

  // Ogive Points
  const lessOgivePoints = useMemo(() => {
    const pts: { x: number; y: number; label: string; cf: number }[] = [];
    // Start at lower boundary of first class with 0
    const firstLower = stats.classes[0].lower;
    pts.push({ x: getX(firstLower), y: getYCum(0), label: `${firstLower}`, cf: 0 });
    stats.classes.forEach(c => {
      pts.push({ x: getX(c.upper), y: getYCum(c.cumLess), label: `${c.upper}`, cf: c.cumLess });
    });
    return pts;
  }, [stats]);

  const moreOgivePoints = useMemo(() => {
    const pts: { x: number; y: number; label: string; cf: number }[] = [];
    stats.classes.forEach(c => {
      pts.push({ x: getX(c.lower), y: getYCum(c.cumMore), label: `${c.lower}`, cf: c.cumMore });
    });
    // End at upper boundary of last class with 0
    const lastUpper = stats.classes[stats.classes.length - 1].upper;
    pts.push({ x: getX(lastUpper), y: getYCum(0), label: `${lastUpper}`, cf: 0 });
    return pts;
  }, [stats]);

  // Ogive median intersection approximation
  const medianY = stats.totalN / 2;
  const medianSvgY = getYCum(medianY);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! आयतचित्र (Histogram), बारम्बारता बहुभुज (Polygon), तोरण वक्र (Ogive) र स्तम्भचित्रको अन्तरक्रियात्मक रेखाचित्र निर्माण र विश्लेषण गर्नुहोस्!',
        'Welcome! Construct and analyze interactive Histograms, Frequency Polygons, Ogive Curves, and Bar Diagrams.'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Graph & Visual Panel */}
        <div className="lg:col-span-8 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          {/* Graph Selector Tabs */}
          <div className="w-full flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 mb-3">
            <button
              onClick={() => setActiveTab('histogram')}
              className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'histogram'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {L('आयतचित्र (Histogram)', 'Histogram')}
            </button>
            <button
              onClick={() => setActiveTab('polygon')}
              className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'polygon'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {L('बारम्बारता बहुभुज (Polygon)', 'Frequency Polygon')}
            </button>
            <button
              onClick={() => setActiveTab('ogive')}
              className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'ogive'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {L('तोरण वक्र रेखा (Ogive Curves)', 'Ogive Curves')}
            </button>
            <button
              onClick={() => setActiveTab('bar')}
              className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'bar'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {L('स्तम्भचित्र (Bar Diagram)', 'Bar Diagram')}
            </button>
          </div>

          {/* SVG Canvas */}
          <div className="w-full overflow-x-auto flex justify-center bg-slate-50/50 rounded-xl p-2 border border-slate-100">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full max-w-[640px] select-none">
              <defs>
                <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="barGradHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.7" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {Array.from({ length: 6 }).map((_, i) => {
                const y = margin.top + (plotHeight / 5) * i;
                return (
                  <line
                    key={i}
                    x1={margin.left}
                    y1={y}
                    x2={margin.left + plotWidth}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                  />
                );
              })}

              {/* Axes */}
              <line
                x1={margin.left}
                y1={margin.top + plotHeight}
                x2={margin.left + plotWidth + 10}
                y2={margin.top + plotHeight}
                stroke="#334155"
                strokeWidth="2"
              />
              <line
                x1={margin.left}
                y1={margin.top - 10}
                x2={margin.left}
                y2={margin.top + plotHeight}
                stroke="#334155"
                strokeWidth="2"
              />

              {/* Y-Axis Label */}
              <text
                x={-(margin.top + plotHeight / 2)}
                y={18}
                transform="rotate(-90)"
                textAnchor="middle"
                className="text-xs font-bold fill-slate-700"
              >
                {activeTab === 'ogive'
                  ? L('सञ्चित बारम्बारता (Cumulative Frequency, c.f.)', 'Cumulative Frequency (c.f.)')
                  : L('बारम्बारता (Frequency, f)', 'Frequency (f)')}
              </text>

              {/* X-Axis Label */}
              <text
                x={margin.left + plotWidth / 2}
                y={svgHeight - 12}
                textAnchor="middle"
                className="text-xs font-bold fill-slate-700"
              >
                {L(currentDataset.xLabelNp, currentDataset.xLabelEn)}
              </text>

              {/* TAB: Histogram / Polygon with Histogram */}
              {(activeTab === 'histogram' || (activeTab === 'polygon' && showPolygonOnHistogram)) && (
                <g>
                  {stats.classes.map((c, idx) => {
                    const x1 = getX(c.lower);
                    const x2 = getX(c.upper);
                    const width = x2 - x1;
                    const y = getYFreq(c.f);
                    const height = margin.top + plotHeight - y;
                    const isHigh = highlightedIndex === idx;

                    return (
                      <g
                        key={idx}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onMouseLeave={() => setHighlightedIndex(null)}
                        className="cursor-pointer transition-all"
                      >
                        <rect
                          x={x1}
                          y={y}
                          width={width}
                          height={height}
                          fill={isHigh ? 'url(#barGradHighlight)' : 'url(#barGrad)'}
                          stroke="#3730a3"
                          strokeWidth="1.5"
                          opacity={activeTab === 'polygon' ? 0.35 : 0.85}
                        />
                        <text
                          x={x1 + width / 2}
                          y={y - 8}
                          textAnchor="middle"
                          className="text-[11px] font-bold fill-indigo-900"
                        >
                          {fmt(c.f)}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* TAB: Discrete Bar Diagram (Bars with Gaps) */}
              {activeTab === 'bar' && (
                <g>
                  {stats.classes.map((c, idx) => {
                    const barW = (plotWidth / stats.classes.length) * 0.55;
                    const barCenter = margin.left + (idx + 0.5) * (plotWidth / stats.classes.length);
                    const x = barCenter - barW / 2;
                    const y = getYFreq(c.f);
                    const height = margin.top + plotHeight - y;
                    const isHigh = highlightedIndex === idx;

                    return (
                      <g
                        key={idx}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onMouseLeave={() => setHighlightedIndex(null)}
                        className="cursor-pointer"
                      >
                        <rect
                          x={x}
                          y={y}
                          width={barW}
                          height={height}
                          rx={3}
                          fill={isHigh ? '#f59e0b' : '#3b82f6'}
                          stroke="#1e40af"
                          strokeWidth="1.5"
                        />
                        <text
                          x={barCenter}
                          y={y - 8}
                          textAnchor="middle"
                          className="text-[11px] font-bold fill-blue-900"
                        >
                          {fmt(c.f)}
                        </text>
                        <text
                          x={barCenter}
                          y={margin.top + plotHeight + 20}
                          textAnchor="middle"
                          className="text-[10px] font-semibold fill-slate-700"
                        >
                          {fmt(c.lower)}-{fmt(c.upper)}
                        </text>
                      </g>
                    );
                  })}
                </g>
              )}

              {/* TAB: Frequency Polygon Line and Dots */}
              {(activeTab === 'polygon' || (activeTab === 'histogram' && showPolygonOnHistogram)) && (
                <g>
                  {/* Lines connecting points */}
                  <polyline
                    points={polygonPoints.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#dc2626"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Points */}
                  {polygonPoints.map((p, i) => (
                    <g key={i}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={highlightedIndex !== null && i === highlightedIndex + 1 ? 6 : 4.5}
                        fill="#ffffff"
                        stroke="#dc2626"
                        strokeWidth="2.5"
                      />
                      {p.f > 0 && (
                        <text
                          x={p.x}
                          y={p.y - 10}
                          textAnchor="middle"
                          className="text-[10px] font-bold fill-red-700 font-mono"
                        >
                          m={fmt(p.mid)}
                        </text>
                      )}
                    </g>
                  ))}
                </g>
              )}

              {/* TAB: Ogive Curves */}
              {activeTab === 'ogive' && (
                <g>
                  {/* Less-than Ogive (Indigo / Blue) */}
                  <polyline
                    points={lessOgivePoints.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {lessOgivePoints.map((p, i) => (
                    <circle key={`l-${i}`} cx={p.x} cy={p.y} r={4.5} fill="#4f46e5" stroke="#fff" strokeWidth="2" />
                  ))}

                  {/* More-than Ogive (Emerald / Green) */}
                  <polyline
                    points={moreOgivePoints.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {moreOgivePoints.map((p, i) => (
                    <circle key={`m-${i}`} cx={p.x} cy={p.y} r={4.5} fill="#059669" stroke="#fff" strokeWidth="2" />
                  ))}

                  {/* Median Line (N/2) */}
                  {showOgiveIntersection && (
                    <g>
                      <line
                        x1={margin.left}
                        y1={medianSvgY}
                        x2={margin.left + plotWidth}
                        y2={medianSvgY}
                        stroke="#e11d48"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <circle
                        cx={margin.left + plotWidth * 0.52}
                        cy={medianSvgY}
                        r={7}
                        fill="#e11d48"
                        opacity={0.3}
                      />
                      <circle
                        cx={margin.left + plotWidth * 0.52}
                        cy={medianSvgY}
                        r={4}
                        fill="#e11d48"
                      />
                      <text
                        x={margin.left + 8}
                        y={medianSvgY - 6}
                        className="text-[11px] font-bold fill-rose-700 font-mono"
                      >
                        N/2 = {fmt(medianY)} {L('(मध्यिका बिन्दु)', '(Median point)')}
                      </text>
                    </g>
                  )}
                </g>
              )}

              {/* X-Ticks & Boundary Labels (For Histogram, Polygon & Ogive) */}
              {activeTab !== 'bar' && (
                <g>
                  {stats.classes.map((c, i) => {
                    const x = getX(c.lower);
                    return (
                      <g key={i}>
                        <line x1={x} y1={margin.top + plotHeight} x2={x} y2={margin.top + plotHeight + 6} stroke="#334155" />
                        <text
                          x={x}
                          y={margin.top + plotHeight + 20}
                          textAnchor="middle"
                          className="text-[11px] font-mono fill-slate-700"
                        >
                          {fmt(c.lower)}
                        </text>
                      </g>
                    );
                  })}
                  {/* Last upper tick */}
                  {(() => {
                    const last = stats.classes[stats.classes.length - 1];
                    const x = getX(last.upper);
                    return (
                      <g>
                        <line x1={x} y1={margin.top + plotHeight} x2={x} y2={margin.top + plotHeight + 6} stroke="#334155" />
                        <text
                          x={x}
                          y={margin.top + plotHeight + 20}
                          textAnchor="middle"
                          className="text-[11px] font-mono fill-slate-700"
                        >
                          {fmt(last.upper)}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              )}

              {/* Y-Ticks */}
              {activeTab !== 'ogive' ? (
                // Frequency Ticks
                [0, Math.round(stats.maxFreq * 0.25), Math.round(stats.maxFreq * 0.5), Math.round(stats.maxFreq * 0.75), stats.maxFreq].map(
                  (fVal, i) => {
                    const y = getYFreq(fVal);
                    return (
                      <g key={i}>
                        <line x1={margin.left - 5} y1={y} x2={margin.left} y2={y} stroke="#334155" />
                        <text
                          x={margin.left - 10}
                          y={y + 4}
                          textAnchor="end"
                          className="text-[10px] font-mono fill-slate-600"
                        >
                          {fmt(fVal)}
                        </text>
                      </g>
                    );
                  }
                )
              ) : (
                // Cumulative Frequency Ticks
                [0, Math.round(stats.totalN * 0.25), Math.round(stats.totalN * 0.5), Math.round(stats.totalN * 0.75), stats.totalN].map(
                  (cfVal, i) => {
                    const y = getYCum(cfVal);
                    return (
                      <g key={i}>
                        <line x1={margin.left - 5} y1={y} x2={margin.left} y2={y} stroke="#334155" />
                        <text
                          x={margin.left - 10}
                          y={y + 4}
                          textAnchor="end"
                          className="text-[10px] font-mono fill-slate-600 font-bold"
                        >
                          {fmt(cfVal)}
                        </text>
                      </g>
                    );
                  }
                )
              )}
            </svg>
          </div>

          {/* Interactive Legend and Toggles */}
          <div className="w-full mt-3 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            {activeTab === 'histogram' && (
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={showPolygonOnHistogram}
                  onChange={e => setShowPolygonOnHistogram(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>{L('आयतचित्रमाथि बारम्बारता बहुभुज देखाउनुहोस्', 'Overlay Frequency Polygon')}</span>
              </label>
            )}

            {activeTab === 'ogive' && (
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium text-indigo-700">
                  <span className="w-3 h-1 bg-indigo-600 rounded"></span>
                  {L('भन्दा कम तोरण (Less than ogive)', 'Less than ogive')}
                </span>
                <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                  <span className="w-3 h-1 bg-emerald-600 rounded"></span>
                  {L('भन्दा बढी तोरण (More than ogive)', 'More than ogive')}
                </span>
                <label className="flex items-center gap-2 cursor-pointer font-medium text-rose-700">
                  <input
                    type="checkbox"
                    checked={showOgiveIntersection}
                    onChange={e => setShowOgiveIntersection(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500"
                  />
                  <span>{L('प्रतिच्छेदन (Median) रेखा देखाउनुहोस्', 'Show Intersection (Median)')}</span>
                </label>
              </div>
            )}

            {activeTab === 'polygon' && (
              <span className="text-slate-600">
                {L('रातो रेखा: वर्गान्तरका मध्यमान (Midpoints) जोडिएको बहुभुज', 'Red line: Polygon connecting class midpoints')}
              </span>
            )}

            {activeTab === 'bar' && (
              <span className="text-slate-600">
                {L('स्तम्भहरू बीच बराबर खाली ठाउँ राखिएको हुन्छ।', 'Separate bars with uniform spacing.')}
              </span>
            )}
          </div>
        </div>

        {/* Data & Theoretical Insights Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Dataset Selector */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              {L('तथ्याङ्क सेट चयन गर्नुहोस्', 'Choose Dataset')}
            </h3>
            <div className="space-y-1.5">
              {DATASETS.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDatasetId(d.id)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-medium transition-all ${
                    selectedDatasetId === d.id
                      ? 'bg-indigo-50 border border-indigo-400 text-indigo-800 font-semibold shadow-xs'
                      : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {L(d.titleNp, d.titleEn)}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Frequency & Midpoint Reference Table */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <h4 className="font-bold text-slate-800 text-xs flex justify-between">
              <span>{L('तालिका मानहरू (Table Data)', 'Table Data')}</span>
              <span className="text-[10px] text-indigo-700 font-mono">N = {fmt(stats.totalN)}</span>
            </h4>
            <div className="overflow-x-auto max-h-48 border border-slate-200 rounded-lg">
              <table className="w-full text-[11px] text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-1.5">{L('वर्गान्तर', 'Class')}</th>
                    <th className="p-1.5 text-center">{L('मध्यमान (m)', 'Mid (m)')}</th>
                    <th className="p-1.5 text-center">{L('बा. (f)', 'Freq (f)')}</th>
                    <th className="p-1.5 text-center">{L('c.f.', 'c.f.')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.classes.map((c, idx) => (
                    <tr
                      key={idx}
                      className={highlightedIndex === idx ? 'bg-amber-100/70 font-semibold' : 'hover:bg-slate-50'}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onMouseLeave={() => setHighlightedIndex(null)}
                    >
                      <td className="p-1.5 font-mono">
                        {fmt(c.lower)}-{fmt(c.upper)}
                      </td>
                      <td className="p-1.5 text-center font-mono text-slate-600">{fmt(c.mid)}</td>
                      <td className="p-1.5 text-center font-mono font-bold text-indigo-700">{fmt(c.f)}</td>
                      <td className="p-1.5 text-center font-mono text-slate-600">{fmt(c.cumLess)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Textbook Core Principles Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50/70 p-4 rounded-xl border border-indigo-100 text-xs space-y-2 text-indigo-950">
            <h4 className="font-bold flex items-center gap-1.5">
              <span>📖 {L('पाठ्यपुस्तकका प्रमुख नियमहरू', 'Textbook Key Rules')}</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-700 list-disc pl-4 leading-relaxed">
              <li>
                <strong>{L('आयतचित्र (Histogram):', 'Histogram:')}</strong>{' '}
                {L(
                  'स्तम्भहरू एकआपसमा जोडिएका हुन्छन् (ग्याप हुँदैन)। चौडाइले वर्गान्तर र उचाइले बारम्बारता जनाउँछ।',
                  'Continuous adjacent bars without gaps. Width = class interval, Height = frequency.'
                )}
              </li>
              <li>
                <strong>{L('बारम्बारता बहुभुज (Polygon):', 'Frequency Polygon:')}</strong>{' '}
                {L(
                  'आयतचित्रका स्तम्भहरूको माथिल्लो भागको मध्यबिन्दुहरू जोडेर बनाइन्छ। सुरु र अन्त्यमा ० बारम्बारता हुने अघिल्लो र पछिल्लो वर्गान्तरमा जोडिन्छ।',
                  'Formed by connecting the midpoints of the tops of the histogram rectangles. Anchored to 0 frequency at preceding & succeeding intervals.'
                )}
              </li>
              <li>
                <strong>{L('तोरण (Ogive):', 'Ogive (Cumulative Frequency Curve):')}</strong>{' '}
                {L(
                  'दुवै तोरण वक्रहरू काटिएको प्रतिच्छेदन बिन्दुबाट X-अक्षमा लम्ब तान्दा मध्यिका (Median) प्राप्त हुन्छ।',
                  'The perpendicular dropped to the X-axis from the intersection of less-than and more-than ogives gives the Median.'
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default StatisticalGraphConstructionLab;

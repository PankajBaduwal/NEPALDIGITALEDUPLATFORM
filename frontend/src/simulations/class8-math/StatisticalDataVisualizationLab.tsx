import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { BarChart3, PieChart, LineChart, Table2, Plus, Trash2 } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'वृत्तचित्र (Pie Chart) मा कुनै समूहको केन्द्रीय कोण (Central Sector Angle) निकाल्ने सूत्र कुन हो?',
    en: 'What is the formula to calculate the central sector angle in a pie chart?',
    options: [
      { key: 'A', label: '(समूहको मान ÷ जम्मा मान) × ३६०°' },
      { key: 'B', label: '(समूहको मान ÷ १००) × ३६०°' },
      { key: 'C', label: '(जम्मा मान ÷ समूहको मान) × १८०°' },
      { key: 'D', label: 'समूहको मान × ३६०°' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि जम्मा ४० जना विद्यार्थीमध्ये १० जनाले फुटबल मन पराउँछन् भने वृत्तचित्रमा फुटबलको कोण कति हुन्छ?',
    en: 'If 10 out of 40 students like football, what is the central angle for football in a pie chart?',
    options: [
      { key: 'A', label: '९०° — (१०/४०) × ३६०° = ९०°' },
      { key: 'B', label: '४५°' },
      { key: 'C', label: '१२०°' },
      { key: 'D', label: '६०°' },
    ],
    answer: 'A',
  },
  {
    np: 'कुनै स्तम्भ चित्र (Bar Graph) मा स्तम्भको उचाइले के जनाउँछ?',
    en: 'What does the height of a bar represent in a bar graph?',
    options: [
      { key: 'A', label: 'सम्बन्धित समूहको बारम्बारता वा मान (Frequency / Value)' },
      { key: 'B', label: 'स्तम्भको चौडाइ' },
      { key: 'C', label: 'जम्मा योगफल' },
      { key: 'D', label: 'केन्द्रीय कोण' },
    ],
    answer: 'A',
  },
  {
    np: 'समय अनुसार परिवर्तन हुने तथ्याङ्क देखाउन सबैभन्दा उपयुक्त चित्र कुन हो?',
    en: 'Which chart is best suited to display data changing over time?',
    options: [
      { key: 'A', label: 'रेखाचित्र (Line Graph)' },
      { key: 'B', label: 'वृत्तचित्र मात्र' },
      { key: 'C', label: 'स्तम्भ चित्र मात्र' },
      { key: 'D', label: 'कुनै पनि होइन' },
    ],
    answer: 'A',
  },
];

interface DataRow {
  id: string;
  categoryNp: string;
  categoryEn: string;
  value: number;
  color: string;
}

const PRESET_DATASETS: { nameNp: string; nameEn: string; data: DataRow[] }[] = [
  {
    nameNp: 'विद्यार्थीहरूको मनपर्ने खेल',
    nameEn: 'Favourite Games of Students',
    data: [
      { id: '1', categoryNp: 'फुटबल', categoryEn: 'Football', value: 20, color: '#3b82f6' },
      { id: '2', categoryNp: 'भलिबल', categoryEn: 'Volleyball', value: 15, color: '#10b981' },
      { id: '3', categoryNp: 'क्रिकेट', categoryEn: 'Cricket', value: 25, color: '#f59e0b' },
      { id: '4', categoryNp: 'ब्याडमिन्टन', categoryEn: 'Badminton', value: 10, color: '#8b5cf6' },
      { id: '5', categoryNp: 'बास्केटबल', categoryEn: 'Basketball', value: 10, color: '#ec4899' },
    ],
  },
  {
    nameNp: 'कक्षा अनुसार विद्यार्थी सङ्ख्या',
    nameEn: 'Students by Grade Level',
    data: [
      { id: '1', categoryNp: 'कक्षा ६', categoryEn: 'Grade 6', value: 45, color: '#3b82f6' },
      { id: '2', categoryNp: 'कक्षा ७', categoryEn: 'Grade 7', value: 50, color: '#10b981' },
      { id: '3', categoryNp: 'कक्षा ८', categoryEn: 'Grade 8', value: 40, color: '#f59e0b' },
      { id: '4', categoryNp: 'कक्षा ९', categoryEn: 'Grade 9', value: 35, color: '#8b5cf6' },
      { id: '5', categoryNp: 'कक्षा १०', categoryEn: 'Grade 10', value: 30, color: '#ec4899' },
    ],
  },
  {
    nameNp: 'परिवारको मासिक खर्च (हजारमा)',
    nameEn: 'Family Monthly Expenditure',
    data: [
      { id: '1', categoryNp: 'खाना (Food)', categoryEn: 'Food', value: 20, color: '#ef4444' },
      { id: '2', categoryNp: 'शिक्षा (Education)', categoryEn: 'Education', value: 15, color: '#3b82f6' },
      { id: '3', categoryNp: 'भाडा (Rent)', categoryEn: 'Rent', value: 12, color: '#10b981' },
      { id: '4', categoryNp: 'स्वास्थ्य (Health)', categoryEn: 'Health', value: 5, color: '#f59e0b' },
      { id: '5', categoryNp: 'यातायात (Transport)', categoryEn: 'Transport', value: 8, color: '#8b5cf6' },
    ],
  },
];

export const StatisticalDataVisualizationLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U21-01',
    chapter: 21,
    titleNp: 'तथ्याङ्किय तथ्याङ्क चित्र प्रयोगशाला',
    titleEn: 'Statistical Data Visualization Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'bar' | 'pie' | 'line' | 'table'>('bar');
  const [datasetIndex, setDatasetIndex] = useState<number>(0);
  const [dataRows, setDataRows] = useState<DataRow[]>(PRESET_DATASETS[0].data);

  // Total frequency N
  const totalN = dataRows.reduce((acc, row) => acc + (row.value || 0), 0);
  const maxVal = Math.max(...dataRows.map((r) => r.value || 0), 1);

  const handleSelectPreset = (idx: number) => {
    setDatasetIndex(idx);
    setDataRows([...PRESET_DATASETS[idx].data]);
  };

  const handleUpdateValue = (id: string, val: number) => {
    setDataRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, value: Math.max(0, val) } : r))
    );
  };

  const handleAddRow = () => {
    const newId = (dataRows.length + 1).toString();
    const colors = ['#06b6d4', '#84cc16', '#f97316', '#a855f7', '#14b8a6'];
    const chosenColor = colors[dataRows.length % colors.length];
    setDataRows([
      ...dataRows,
      {
        id: newId,
        categoryNp: `समूह ${newId}`,
        categoryEn: `Item ${newId}`,
        value: 10,
        color: chosenColor,
      },
    ]);
  };

  const handleDeleteRow = (id: string) => {
    if (dataRows.length <= 2) return;
    setDataRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! तथ्याङ्कलाई बारम्बारता तालिका, स्तम्भ चित्र (Bar Graph), वृत्तचित्र (Pie Chart) र रेखाचित्रमा रूपान्तरण गर्न सिकौं!',
        'Hello! Organize data into tables, bar graphs, pie charts, and line graphs with exact mathematical calculations!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('bar')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bar' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            📊 {L('१. स्तम्भ चित्र (Bar Graph)', '1. Bar Graph')}
          </button>
          <button
            onClick={() => setActiveTab('pie')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'pie' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            🥧 {L('२. वृत्तचित्र (Pie Chart)', '2. Pie Chart')}
          </button>
          <button
            onClick={() => setActiveTab('line')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'line' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            📈 {L('३. रेखाचित्र (Line Graph)', '3. Line Graph')}
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'table' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            📋 {L('४. तालिका सम्पादन (Data Table Editor)', '4. Data Table')}
          </button>
        </div>

        {/* Dataset Quick Selection Pills */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-2.5 rounded-xl border border-slate-300">
          <span className="text-xs font-bold text-slate-600">तथ्याङ्क नमुना (Dataset):</span>
          {PRESET_DATASETS.map((ds, idx) => (
            <button
              key={ds.nameNp}
              onClick={() => handleSelectPreset(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                datasetIndex === idx
                  ? 'bg-amber-600 text-white border-amber-600 shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border-slate-300'
              }`}
            >
              {ds.nameNp}
            </button>
          ))}
          <span className="ml-auto text-xs font-bold bg-indigo-100 text-indigo-900 px-2.5 py-1 rounded-lg">
            जम्मा योगफल (N): {totalN}
          </span>
        </div>

        {/* Tab 1: Bar Graph Visualizer */}
        {activeTab === 'bar' && (
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-slate-200">
            <h3 className="font-extrabold text-slate-800 text-sm mb-4 text-center">
              {PRESET_DATASETS[datasetIndex].nameNp} — स्तम्भ चित्र (Bar Graph)
            </h3>

            <div className="flex justify-center">
              <svg width={560} height={320} className="max-w-full bg-slate-50 rounded-xl border border-slate-200">
                {/* Horizontal reference grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const y = 260 - pct * 200;
                  const val = Math.round(pct * maxVal);
                  return (
                    <g key={i}>
                      <line x1={50} y1={y} x2={530} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                      <text x={42} y={y + 4} fontSize="10" fill="#64748b" textAnchor="end">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* X & Y Axis */}
                <line x1={50} y1={260} x2={530} y2={260} stroke="#475569" strokeWidth="2" />
                <line x1={50} y1={40} x2={50} y2={260} stroke="#475569" strokeWidth="2" />

                {/* Bars */}
                {dataRows.map((row, i) => {
                  const barWidth = Math.min(60, 420 / dataRows.length - 12);
                  const x = 75 + i * (450 / dataRows.length);
                  const barH = (row.value / maxVal) * 200;
                  const y = 260 - barH;

                  return (
                    <g key={row.id}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barH}
                        fill={row.color}
                        rx="4"
                        className="transition-all hover:opacity-80 cursor-pointer"
                      />
                      {/* Value label on top of bar */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        fontSize="11"
                        fontWeight="bold"
                        fill="#334155"
                        textAnchor="middle"
                      >
                        {row.value}
                      </text>
                      {/* Category label below X axis */}
                      <text
                        x={x + barWidth / 2}
                        y={280}
                        fontSize="10"
                        fontWeight="bold"
                        fill="#475569"
                        textAnchor="middle"
                      >
                        {row.categoryNp.length > 8 ? row.categoryNp.slice(0, 7) + '..' : row.categoryNp}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Tab 2: Pie Chart Visualizer */}
        {activeTab === 'pie' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* SVG Pie Chart */}
            <div className="lg:col-span-6 bg-white rounded-2xl shadow-lg p-5 border border-slate-200 flex flex-col items-center">
              <h3 className="font-extrabold text-slate-800 text-sm mb-3">
                {PRESET_DATASETS[datasetIndex].nameNp} — वृत्तचित्र (Pie Chart)
              </h3>

              <svg width={300} height={300} className="select-none">
                {(() => {
                  const cx = 150, cy = 150, r = 120;
                  let currentAngle = 0;

                  return dataRows.map((row) => {
                    const sliceAngle = totalN > 0 ? (row.value / totalN) * 360 : 0;
                    const startRad = (currentAngle * Math.PI) / 180;
                    const endRad = ((currentAngle + sliceAngle) * Math.PI) / 180;

                    const x1 = cx + r * Math.sin(startRad);
                    const y1 = cy - r * Math.cos(startRad);
                    const x2 = cx + r * Math.sin(endRad);
                    const y2 = cy - r * Math.cos(endRad);

                    const largeArc = sliceAngle > 180 ? 1 : 0;
                    const pathData =
                      sliceAngle >= 359.9
                        ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
                        : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    // Mid angle for percentage label
                    const midRad = ((currentAngle + sliceAngle / 2) * Math.PI) / 180;
                    const labelX = cx + (r * 0.65) * Math.sin(midRad);
                    const labelY = cy - (r * 0.65) * Math.cos(midRad);

                    currentAngle += sliceAngle;

                    return (
                      <g key={row.id}>
                        <path d={pathData} fill={row.color} stroke="#ffffff" strokeWidth="2" />
                        {sliceAngle > 15 && (
                          <text
                            x={labelX}
                            y={labelY + 4}
                            fontSize="11"
                            fontWeight="bold"
                            fill="#ffffff"
                            textAnchor="middle"
                          >
                            {Math.round((row.value / totalN) * 100)}%
                          </text>
                        )}
                      </g>
                    );
                  });
                })()}
              </svg>
            </div>

            {/* Central Angle Calculation Breakdown Table */}
            <div className="lg:col-span-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm">
              <h4 className="font-extrabold text-amber-950 text-xs uppercase tracking-wider mb-2">
                केन्द्रीय कोण गणना (Central Angle Formula: θ = (f ÷ N) × ३६०°)
              </h4>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {dataRows.map((row) => {
                  const deg = totalN > 0 ? ((row.value / totalN) * 360).toFixed(1) : '0';
                  const pct = totalN > 0 ? ((row.value / totalN) * 100).toFixed(1) : '0';

                  return (
                    <div
                      key={row.id}
                      className="bg-white rounded-xl p-2.5 border border-amber-100 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: row.color }} />
                        <span className="font-bold text-slate-800">{row.categoryNp}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-amber-700">{deg}°</span>
                        <span className="text-[10px] text-slate-500 block">
                          ({row.value}/{totalN}) × ३६०° = {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 p-2 bg-white rounded-lg border border-amber-200 text-center font-bold text-xs text-amber-900">
                कुल कोण योग = ३६०° (१००%)
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Line Graph Visualizer */}
        {activeTab === 'line' && (
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-slate-200">
            <h3 className="font-extrabold text-slate-800 text-sm mb-4 text-center">
              {PRESET_DATASETS[datasetIndex].nameNp} — बिन्दु रेखाचित्र (Line Graph)
            </h3>

            <div className="flex justify-center">
              <svg width={560} height={320} className="max-w-full bg-slate-50 rounded-xl border border-slate-200">
                {/* Horizontal reference lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                  const y = 260 - pct * 200;
                  const val = Math.round(pct * maxVal);
                  return (
                    <g key={i}>
                      <line x1={50} y1={y} x2={530} y2={y} stroke="#e2e8f0" strokeWidth="1" />
                      <text x={42} y={y + 4} fontSize="10" fill="#64748b" textAnchor="end">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Axes */}
                <line x1={50} y1={260} x2={530} y2={260} stroke="#475569" strokeWidth="2" />
                <line x1={50} y1={40} x2={50} y2={260} stroke="#475569" strokeWidth="2" />

                {/* Connecting Polyline */}
                {(() => {
                  const points = dataRows
                    .map((row, i) => {
                      const x = 75 + i * (450 / dataRows.length) + 20;
                      const y = 260 - (row.value / maxVal) * 200;
                      return `${x},${y}`;
                    })
                    .join(' ');
                  return <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="3" />;
                })()}

                {/* Points and labels */}
                {dataRows.map((row, i) => {
                  const x = 75 + i * (450 / dataRows.length) + 20;
                  const y = 260 - (row.value / maxVal) * 200;

                  return (
                    <g key={row.id}>
                      <circle cx={x} cy={y} r={6} fill="#1d4ed8" stroke="#ffffff" strokeWidth="2.5" />
                      <text x={x} y={y - 10} fontSize="11" fontWeight="bold" fill="#1d4ed8" textAnchor="middle">
                        {row.value}
                      </text>
                      <text x={x} y={280} fontSize="10" fontWeight="bold" fill="#475569" textAnchor="middle">
                        {row.categoryNp.length > 8 ? row.categoryNp.slice(0, 7) + '..' : row.categoryNp}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* Tab 4: Table Editor */}
        {activeTab === 'table' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-5 border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-800 text-sm">
                तथ्याङ्क तालिका सम्पादन (Data Table Editor)
              </h3>
              <button
                onClick={handleAddRow}
                className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                पङ्क्ति थप्नुहोस् (Add Row)
              </button>
            </div>

            <div className="space-y-2">
              {dataRows.map((row) => (
                <div
                  key={row.id}
                  className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                >
                  <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: row.color }} />
                  <input
                    type="text"
                    value={row.categoryNp}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDataRows((prev) =>
                        prev.map((r) => (r.id === row.id ? { ...r, categoryNp: val } : r))
                      );
                    }}
                    className="flex-1 p-1.5 bg-white border border-slate-300 rounded font-semibold text-slate-800"
                  />
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={row.value}
                    onChange={(e) => handleUpdateValue(row.id, parseInt(e.target.value) || 0)}
                    className="w-24 p-1.5 bg-white border border-slate-300 rounded font-mono font-bold text-center text-slate-800"
                  />
                  <button
                    onClick={() => handleDeleteRow(row.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex justify-between text-xs font-bold text-amber-900">
              <span>जम्मा बारम्बारता (Total Frequency N):</span>
              <span className="font-mono text-sm text-amber-700">{totalN}</span>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default StatisticalDataVisualizationLab;

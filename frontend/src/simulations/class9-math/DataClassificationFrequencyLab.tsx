import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface PresetData {
  id: string;
  nameEn: string;
  nameNp: string;
  values: number[];
  unitEn: string;
  unitNp: string;
  suggestedInterval: number;
}

const PRESETS: PresetData[] = [
  {
    id: 'exam_marks',
    nameEn: 'Math Exam Marks (out of 50)',
    nameNp: 'गणित परीक्षा प्राप्ताङ्क (पूर्णाङ्क ५०)',
    values: [12, 25, 34, 18, 42, 28, 35, 15, 22, 38, 45, 19, 27, 31, 40, 14, 23, 33, 48, 29, 36, 17, 24, 30, 44],
    unitEn: 'Marks',
    unitNp: 'अङ्क',
    suggestedInterval: 10
  },
  {
    id: 'student_weights',
    nameEn: 'Student Weights (in kg)',
    nameNp: 'विद्यार्थीहरूको तौल (कि.ग्रा.)',
    values: [32, 35, 38, 42, 45, 33, 36, 40, 44, 48, 34, 37, 41, 43, 46, 31, 39, 42, 45, 49, 35, 38, 41, 44, 47],
    unitEn: 'kg',
    unitNp: 'कि.ग्रा.',
    suggestedInterval: 5
  },
  {
    id: 'family_sizes',
    nameEn: 'Family Sizes (Members)',
    nameNp: 'परिवारका सदस्य सङ्ख्या',
    values: [3, 4, 5, 4, 6, 3, 5, 7, 4, 5, 3, 6, 4, 5, 8, 4, 3, 5, 6, 4, 5, 6, 7, 3, 4],
    unitEn: 'Members',
    unitNp: 'जना',
    suggestedInterval: 2
  }
];

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const DataClassificationFrequencyLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U17-01',
    chapter: 17,
    titleNp: 'तथ्याङ्कको वर्गीकरण तथा बारम्बारता प्रयोगशाला',
    titleEn: 'Data Classification and Frequency Distribution Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'raw' | 'discrete' | 'grouped' | 'cumulative'>('raw');
  const [selectedPreset, setSelectedPreset] = useState<string>('exam_marks');
  const [customInput, setCustomInput] = useState<string>('');
  const [dataValues, setDataValues] = useState<number[]>(PRESETS[0].values);
  const [sortOrder, setSortOrder] = useState<'original' | 'asc' | 'desc'>('original');
  const [classIntervalWidth, setClassIntervalWidth] = useState<number>(10);

  const preset = PRESETS.find(p => p.id === selectedPreset) || PRESETS[0];

  const handlePresetChange = (id: string) => {
    setSelectedPreset(id);
    const p = PRESETS.find(x => x.id === id);
    if (p) {
      setDataValues([...p.values]);
      setClassIntervalWidth(p.suggestedInterval);
      setSortOrder('original');
    }
  };

  const handleApplyCustom = () => {
    const parsed = customInput
      .split(/[\s,]+/)
      .map(x => parseFloat(x))
      .filter(x => !isNaN(x));
    if (parsed.length >= 5) {
      setDataValues(parsed);
      setSelectedPreset('custom');
      setSortOrder('original');
    }
  };

  const sortedValues = useMemo(() => {
    const arr = [...dataValues];
    if (sortOrder === 'asc') return arr.sort((a, b) => a - b);
    if (sortOrder === 'desc') return arr.sort((a, b) => b - a);
    return arr;
  }, [dataValues, sortOrder]);

  const minVal = Math.min(...dataValues);
  const maxVal = Math.max(...dataValues);
  const range = maxVal - minVal;
  const count = dataValues.length;

  // Discrete frequency map
  const discreteFreq = useMemo(() => {
    const map: { [key: number]: number } = {};
    dataValues.forEach(v => {
      map[v] = (map[v] || 0) + 1;
    });
    const unique = Object.keys(map).map(Number).sort((a, b) => a - b);
    return unique.map(x => ({
      val: x,
      freq: map[x]
    }));
  }, [dataValues]);

  // Grouped frequency table
  const groupedFreq = useMemo(() => {
    const h = classIntervalWidth;
    const start = Math.floor(minVal / h) * h;
    const intervals: { lower: number; upper: number; mid: number; count: number; items: number[] }[] = [];
    let cur = start;
    while (cur <= maxVal) {
      const lower = cur;
      const upper = cur + h;
      const items = dataValues.filter(x => (upper >= maxVal ? x >= lower && x <= upper : x >= lower && x < upper));
      intervals.push({
        lower,
        upper,
        mid: (lower + upper) / 2,
        count: items.length,
        items
      });
      cur += h;
    }
    return intervals;
  }, [dataValues, classIntervalWidth, minVal, maxVal]);

  // Cumulative Frequency (less than & more than)
  const cumulativeData = useMemo(() => {
    let cumLess = 0;
    const total = dataValues.length;
    let cumMore = total;

    return groupedFreq.map(g => {
      cumLess += g.count;
      const prevMore = cumMore;
      cumMore -= g.count;
      return {
        ...g,
        cumLess,
        cumMore: prevMore
      };
    });
  }, [groupedFreq, dataValues.length]);

  const renderTally = (num: number) => {
    const bundles = Math.floor(num / 5);
    const remainder = num % 5;
    return (
      <span className="font-mono text-base tracking-widest text-indigo-700">
        {Array.from({ length: bundles }).map((_, i) => (
          <span key={i} className="mr-2 inline-block border-b-2 border-indigo-600 px-1 font-bold">
            卌
          </span>
        ))}
        {Array.from({ length: remainder }).map((_, i) => (
          <span key={i} className="inline-block font-bold">
            |
          </span>
        ))}
      </span>
    );
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! कच्चा तथ्याङ्क वर्गीकरण, मिलान चिन्ह (Tally marks), खण्डित तथा वर्गीकृत बारम्बारता तालिका र सञ्चित बारम्बारता अन्वेषण गर्नुहोस्।',
        'Welcome! Explore data sorting, tally marks, discrete and grouped frequency distributions, and cumulative frequency.'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Data Selector */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              {L('तथ्याङ्क सेट चयन गर्नुहोस्', 'Select Dataset')}
            </h3>
            <div className="space-y-1.5">
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePresetChange(p.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    selectedPreset === p.id
                      ? 'bg-indigo-50 border border-indigo-400 text-indigo-800 font-semibold shadow-sm'
                      : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div>{L(p.nameNp, p.nameEn)}</div>
                  <div className="text-[10px] text-slate-500">
                    {L(`कुल सङ्ख्या (N) = ${p.values.length}`, `Total Count (N) = ${p.values.length}`)}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                {L('वा आफ्नै तथ्याङ्क राख्नुहोस् (कमा वा स्पेसद्वारा छुट्याउनुहोस्):', 'Or enter custom numbers (comma/space separated):')}
              </label>
              <textarea
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                placeholder="e.g. 15, 22, 35, 18, 42, 28, 30"
                rows={2}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
              <button
                onClick={handleApplyCustom}
                className="mt-1.5 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                {L('तथ्याङ्क लागू गर्नुहोस्', 'Apply Custom Data')}
              </button>
            </div>
          </div>

          {/* Data Summary Card */}
          <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 text-xs space-y-2">
            <h4 className="font-bold text-indigo-950 flex items-center justify-between">
              <span>{L('तथ्याङ्कको सारांश (Summary)', 'Dataset Summary')}</span>
              <span className="text-[10px] bg-indigo-200/70 text-indigo-900 px-2 py-0.5 rounded-full font-mono">
                N = {fmt(count)}
              </span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div className="bg-white p-2 rounded border border-indigo-100/80">
                <div className="text-[10px] text-slate-500">{L('न्यूनतम मान (Min)', 'Minimum')}</div>
                <div className="text-base font-bold text-indigo-700">{fmt(minVal)}</div>
              </div>
              <div className="bg-white p-2 rounded border border-indigo-100/80">
                <div className="text-[10px] text-slate-500">{L('अधिकतम मान (Max)', 'Maximum')}</div>
                <div className="text-base font-bold text-indigo-700">{fmt(maxVal)}</div>
              </div>
              <div className="bg-white p-2 rounded border border-indigo-100/80 col-span-2 flex justify-between items-center">
                <span className="text-slate-600">{L('तथ्याङ्कको विस्तार (Range = Max - Min):', 'Range = Max - Min:')}</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {fmt(maxVal)} - {fmt(minVal)} = {fmt(range)}
                </span>
              </div>
            </div>
          </div>

          {/* Grouping Width Control (for Grouped & Cumulative tabs) */}
          {(activeTab === 'grouped' || activeTab === 'cumulative') && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800">
                  {L('वर्गान्तरको लम्बाइ (Class Width, i):', 'Class Interval Width (i):')}
                </label>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {fmt(classIntervalWidth)}
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                value={classIntervalWidth}
                onChange={e => setClassIntervalWidth(parseInt(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>i = 2</span>
                <span>i = 10</span>
                <span>i = 20</span>
              </div>
            </div>
          )}
        </div>

        {/* Display / Workspace Column */}
        <div className="lg:col-span-8 space-y-4">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('raw')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'raw'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              1. {L('कच्चा तथ्याङ्क र क्रमबद्धता', 'Raw & Sorted Data')}
            </button>
            <button
              onClick={() => setActiveTab('discrete')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'discrete'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              2. {L('खण्डित श्रेणी (मिलान चिन्ह)', 'Discrete & Tally')}
            </button>
            <button
              onClick={() => setActiveTab('grouped')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'grouped'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              3. {L('वर्गीकृत बारम्बारता (Grouped)', 'Grouped Distribution')}
            </button>
            <button
              onClick={() => setActiveTab('cumulative')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'cumulative'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              4. {L('सञ्चित बारम्बारता (c.f.)', 'Cumulative Frequency')}
            </button>
          </div>

          {/* TAB 1: Raw & Sorted Data */}
          {activeTab === 'raw' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {L('अवर्गीकृत (कच्चा) तथ्याङ्क', 'Raw Unorganized Data')}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {L('क्रमबद्ध गर्दा तथ्याङ्क विश्लेषण गर्न सजिलो हुन्छ।', 'Sorting makes it easier to observe frequency and patterns.')}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
                  <span className="text-[11px] font-medium text-slate-600 px-2">{L('क्रमबद्ध:', 'Sort:')}</span>
                  <button
                    onClick={() => setSortOrder('original')}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${
                      sortOrder === 'original' ? 'bg-white font-bold text-indigo-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {L('साविक', 'Original')}
                  </button>
                  <button
                    onClick={() => setSortOrder('asc')}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${
                      sortOrder === 'asc' ? 'bg-white font-bold text-indigo-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {L('आरोही (सुरुबाट)', 'Ascending')}
                  </button>
                  <button
                    onClick={() => setSortOrder('desc')}
                    className={`px-2.5 py-1 rounded text-xs font-medium ${
                      sortOrder === 'desc' ? 'bg-white font-bold text-indigo-700 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    {L('अवरोही (ठूलोबाट)', 'Descending')}
                  </button>
                </div>
              </div>

              {/* Data Pills Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {sortedValues.map((v, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-slate-200 shadow-2xs hover:border-indigo-400 transition-colors"
                  >
                    <span className="text-[9px] text-slate-400 font-mono">#{fmt(idx + 1)}</span>
                    <span className="text-base font-bold text-slate-800">{fmt(v)}</span>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>{L('पाठ्यपुस्तक अवधारणा:', 'Textbook Note:')}</strong>{' '}
                {L(
                  'तथ्याङ्कलाई आरोही (सानादेखि ठूला) वा अवरोही (ठूलादेखि साना) क्रममा मिलाएर राख्दा बारम्बारता तालिका निर्माण गर्न सहज हुन्छ।',
                  'Arranging data in ascending or descending order facilitates easier counting and preparation of frequency tables.'
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Discrete Frequency Table with Tally Marks */}
          {activeTab === 'discrete' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {L('खण्डित बारम्बारता तालिका (Discrete Series)', 'Discrete Frequency Table')}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {L('प्रत्येक मान कति पटक दोहोरिएको छ भनी मिलान चिन्ह (Tally marks) प्रयोग गरी गणना गरिन्छ।', 'Each unique value counted using standard 5-bar tally marks.')}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto max-h-80 border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4">{L('मान (Value, X)', 'Value (X)')}</th>
                      <th className="py-2.5 px-4">{L('मिलान चिन्ह (Tally Marks)', 'Tally Marks')}</th>
                      <th className="py-2.5 px-4 text-center">{L('बारम्बारता (Frequency, f)', 'Frequency (f)')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {discreteFreq.map(d => (
                      <tr key={d.val} className="hover:bg-indigo-50/40 transition-colors">
                        <td className="py-2 px-4 font-bold text-slate-800">{fmt(d.val)}</td>
                        <td className="py-2 px-4">{renderTally(d.freq)}</td>
                        <td className="py-2 px-4 text-center font-bold text-indigo-700 font-mono text-sm">
                          {fmt(d.freq)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold text-slate-800 border-t-2 border-slate-300">
                    <tr>
                      <td colSpan={2} className="py-2.5 px-4 text-right">
                        {L('जम्मा बारम्बारता (Total Frequency, N = ∑f):', 'Total Frequency (N = ∑f):')}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono text-indigo-800 text-base">
                        {fmt(count)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Grouped (Continuous) Frequency Distribution */}
          {activeTab === 'grouped' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {L('अविच्छिन्न / वर्गीकृत बारम्बारता तालिका (Grouped Series)', 'Grouped Continuous Frequency Table')}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {L(
                      `वर्गान्तर (Class Interval) = ${classIntervalWidth} एकाइ। अपवर्जक पद्धति (Exclusive Method) मा तल्लो सीमा समावेश हुन्छ र माथिल्लो सीमा अर्को वर्गमा गनिन्छ।`,
                      `Class width = ${classIntervalWidth}. In exclusive method, lower limit is included and upper limit is excluded.`
                    )}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">{L('वर्गान्तर (Class Interval)', 'Class Interval')}</th>
                      <th className="py-2.5 px-3 text-center">{L('मध्यमान (Mid-value, m)', 'Mid-value (m)')}</th>
                      <th className="py-2.5 px-3">{L('मिलान चिन्ह (Tally Marks)', 'Tally Marks')}</th>
                      <th className="py-2.5 px-3 text-center">{L('बारम्बारता (f)', 'Frequency (f)')}</th>
                      <th className="py-2.5 px-3">{L('समावेश भएका मानहरू', 'Included Values')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupedFreq.map((g, idx) => (
                      <tr key={idx} className="hover:bg-indigo-50/40">
                        <td className="py-2.5 px-3 font-bold text-indigo-900 font-mono">
                          {fmt(g.lower)} – {fmt(g.upper)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-600">
                          {fmt(g.mid)}
                        </td>
                        <td className="py-2.5 px-3">{renderTally(g.count)}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-indigo-700 font-mono text-sm">
                          {fmt(g.count)}
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-slate-500 font-mono">
                          {g.items.length > 0 ? g.items.join(', ') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold text-slate-800 border-t-2 border-slate-300">
                    <tr>
                      <td colSpan={3} className="py-2.5 px-4 text-right">
                        {L('जम्मा (Total N = ∑f):', 'Total (N = ∑f):')}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono text-indigo-800 text-base">
                        {fmt(count)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Cumulative Frequency Table (Less Than & More Than) */}
          {activeTab === 'cumulative' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    {L('सञ्चित बारम्बारता तालिका (Cumulative Frequency Table)', 'Cumulative Frequency Distribution')}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {L(
                      'भन्दा कम (Less than c.f.) माथिल्लो सीमासँग र भन्दा बढी (More than c.f.) तल्लो सीमासँग सम्बन्धित हुन्छ।',
                      'Less-than c.f. pairs with upper class limits; more-than c.f. pairs with lower class limits.'
                    )}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">{L('वर्गान्तर (Class)', 'Class')}</th>
                      <th className="py-2.5 px-3 text-center">{L('बारम्बारता (f)', 'Frequency (f)')}</th>
                      <th className="py-2.5 px-3 text-indigo-700 bg-indigo-50/50">
                        {L('भन्दा कम (Less than)', 'Less Than Limit')}
                      </th>
                      <th className="py-2.5 px-3 text-center font-bold text-indigo-700 bg-indigo-50/50">
                        {L('सञ्चित बा. (Less c.f.)', 'Less than c.f.')}
                      </th>
                      <th className="py-2.5 px-3 text-emerald-700 bg-emerald-50/50">
                        {L('भन्दा बढी (More than)', 'More Than Limit')}
                      </th>
                      <th className="py-2.5 px-3 text-center font-bold text-emerald-700 bg-emerald-50/50">
                        {L('सञ्चित बा. (More c.f.)', 'More than c.f.')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cumulativeData.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800 font-mono">
                          {fmt(c.lower)} – {fmt(c.upper)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                          {fmt(c.count)}
                        </td>
                        <td className="py-2.5 px-3 text-indigo-900">
                          {fmt(c.upper)} {L('भन्दा कम', 'or less')}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-indigo-700 bg-indigo-50/40">
                          {fmt(c.cumLess)}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-900">
                          {fmt(c.lower)} {L('भन्दा बढी', 'or more')}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700 bg-emerald-50/40">
                          {fmt(c.cumMore)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <span className="font-bold text-blue-700">💡 {L('स्मरण गर्नुहोस्:', 'Important Note:')}</span>
                <span>
                  {L(
                    'अन्तिम वर्गान्तरको Less-than c.f. सधैं जम्मा सङ्ख्या N सँग बराबर हुन्छ। सुरुको वर्गान्तरको More-than c.f. पनि N बाट सुरु भई घट्दै जान्छ।',
                    'The less-than c.f. of the last class always equals total sample size N. The more-than c.f. starts at N and decrements downward.'
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </SimFrame2D>
  );
};

export default DataClassificationFrequencyLab;

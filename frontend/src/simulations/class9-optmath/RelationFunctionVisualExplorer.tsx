import React, { useState, useMemo } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const RelationFunctionVisualExplorer: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-OPTMATH-G9-U1-01',
    chapter: 1,
    titleNp: 'सम्बन्ध तथा फलन दृश्य अन्वेषक',
    titleEn: 'Relation and Function Visual Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'ordered_pair' | 'cartesian' | 'relation' | 'types' | 'function_test'>('ordered_pair');

  // Activity A: Ordered Pair
  const [pairX, setPairX] = useState<number>(2);
  const [pairY, setPairY] = useState<number>(4);
  const [showReversed, setShowReversed] = useState<boolean>(true);

  // Activity B: Cartesian Product
  const [setA, setSetA] = useState<number[]>([1, 2]);
  const [setB, setSetB] = useState<number[]>([3, 4, 5]);
  const [cartesianOrder, setCartesianOrder] = useState<'AxB' | 'BxA'>('AxB');
  const [cartesianView, setCartesianView] = useState<'pairs' | 'mapping' | 'table' | 'graph'>('mapping');

  const cartesianProduct = useMemo(() => {
    const first = cartesianOrder === 'AxB' ? setA : setB;
    const second = cartesianOrder === 'AxB' ? setB : setA;
    const pairs: [number, number][] = [];
    first.forEach(a => {
      second.forEach(b => {
        pairs.push([a, b]);
      });
    });
    return pairs;
  }, [setA, setB, cartesianOrder]);

  // Activity C & D: Relation Rules, Domain, Range, Codomain
  const [selectedRule, setSelectedRule] = useState<'less' | 'greater' | 'equal' | 'double' | 'factor'>('less');

  const ruleFilteredPairs = useMemo(() => {
    return cartesianProduct.filter(([x, y]) => {
      if (selectedRule === 'less') return x < y;
      if (selectedRule === 'greater') return x > y;
      if (selectedRule === 'equal') return x === y;
      if (selectedRule === 'double') return y === 2 * x;
      if (selectedRule === 'factor') return y % x === 0;
      return true;
    });
  }, [cartesianProduct, selectedRule]);

  const domainElements = useMemo(() => Array.from(new Set(ruleFilteredPairs.map(p => p[0]))).sort((a, b) => a - b), [ruleFilteredPairs]);
  const rangeElements = useMemo(() => Array.from(new Set(ruleFilteredPairs.map(p => p[1]))).sort((a, b) => a - b), [ruleFilteredPairs]);
  const codomainElements = cartesianOrder === 'AxB' ? setB : setA;

  // Activity E: Equivalence on Set S = {1, 2, 3}
  const setS = [1, 2, 3];
  const [activePairsS, setActivePairsS] = useState<[number, number][]>([
    [1, 1], [2, 2], [3, 3],
    [1, 2], [2, 1]
  ]);

  const togglePairInS = (a: number, b: number) => {
    const exists = activePairsS.some(([x, y]) => x === a && y === b);
    if (exists) {
      setActivePairsS(activePairsS.filter(([x, y]) => !(x === a && y === b)));
    } else {
      setActivePairsS([...activePairsS, [a, b]]);
    }
  };

  const isReflexive = setS.every(x => activePairsS.some(([a, b]) => a === x && b === x));
  const isSymmetric = activePairsS.every(([a, b]) => activePairsS.some(([x, y]) => x === b && y === a));
  const isTransitive = activePairsS.every(([a, b]) => {
    const matchingSecond = activePairsS.filter(([x]) => x === b);
    return matchingSecond.every(([, c]) => activePairsS.some(([x, y]) => x === a && y === c));
  });
  const isEquivalence = isReflexive && isSymmetric && isTransitive;

  // Activity G: Function Tester
  const [funcMappings, setFuncMappings] = useState<{ [key: number]: number[] }>({
    1: [3],
    2: [4],
  });

  const handleToggleFuncMapping = (a: number, b: number) => {
    const current = funcMappings[a] || [];
    if (current.includes(b)) {
      setFuncMappings({ ...funcMappings, [a]: current.filter(x => x !== b) });
    } else {
      setFuncMappings({ ...funcMappings, [a]: [...current, b] });
    }
  };

  const isFunction = useMemo(() => {
    return setA.every(a => (funcMappings[a] || []).length === 1);
  }, [setA, funcMappings]);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! ऐच्छिक गणितको सम्बन्ध तथा फलन (Relation and Function) दृश्य प्रयोगशालामा स्वागत छ। क्रमित जोडा, कार्तेसियन गुणन, डोमेन, रेञ्ज, सम्बन्धका प्रकार र फलन परीक्षण गर्नुहोस्!',
        'Welcome! Explore ordered pairs, Cartesian products, domain & range, types of relations (equivalence), and function tests visually!'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigation Tabs */}
        <div className="lg:col-span-12 flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('ordered_pair')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'ordered_pair'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. {L('क्रमित जोडा (Ordered Pair)', 'Ordered Pair')}
          </button>
          <button
            onClick={() => setActiveTab('cartesian')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'cartesian'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. {L('कार्तेसियन गुणन (A × B)', 'Cartesian Product')}
          </button>
          <button
            onClick={() => setActiveTab('relation')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'relation'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. {L('सम्बन्ध (Domain & Range)', 'Relation & Domain')}
          </button>
          <button
            onClick={() => setActiveTab('types')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'types'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. {L('सम्बन्धका प्रकार (Equivalence)', 'Types of Relations')}
          </button>
          <button
            onClick={() => setActiveTab('function_test')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'function_test'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5. {L('फलन परीक्षण (Function Tester)', 'Function Tester')}
          </button>
        </div>

        {/* TAB 1: ORDERED PAIR EXPLORER */}
        {activeTab === 'ordered_pair' && (
          <>
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">
                {L('क्रमित जोडा अन्वेषक (Ordered Pair Explorer)', 'Ordered Pair Coordinates')}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {L(
                  'क्रमित जोडामा अगाडिको सङ्ख्या x-निर्देशाङ्क र पछाडिको सङ्ख्या y-निर्देशाङ्क हुन्छ। क्रम उल्ट्याउँदा स्थान पूर्णतया परिवर्तन हुन्छ: (x, y) ≠ (y, x)।',
                  'In an ordered pair, the first value is the x-coordinate and second is the y-coordinate. Swapping them changes the point: (x, y) ≠ (y, x).'
                )}
              </p>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>{L('पहिलो घटक (x-coordinate):', 'First Element (x):')}</span>
                  <span className="font-mono text-indigo-700 text-sm">{fmt(pairX)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={pairX}
                  onChange={e => setPairX(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />

                <div className="flex justify-between items-center text-xs font-bold text-slate-700 pt-2">
                  <span>{L('दोस्रो घटक (y-coordinate):', 'Second Element (y):')}</span>
                  <span className="font-mono text-indigo-700 text-sm">{fmt(pairY)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={pairY}
                  onChange={e => setPairY(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showReversed}
                  onChange={e => setShowReversed(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span>{L(`उल्टो क्रमित जोडा (${fmt(pairY)}, ${fmt(pairX)}) पनि देखाउनुहोस्`, `Show reversed pair (${pairY}, ${pairX})`)}</span>
              </label>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-indigo-950 font-mono">
                  P = ({fmt(pairX)}, {fmt(pairY)})
                </div>
                {showReversed && (
                  <div className="font-bold text-rose-700 font-mono">
                    Q = ({fmt(pairY)}, {fmt(pairX)}) {pairX !== pairY ? '≠ P' : '= P'}
                  </div>
                )}
              </div>
            </div>

            {/* Coordinate Plane Visual */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
              <svg viewBox="0 0 340 340" className="w-full max-w-[320px] bg-slate-50 rounded-xl border border-slate-200 select-none">
                {/* Grid lines */}
                {Array.from({ length: 7 }).map((_, i) => {
                  const pos = 40 + i * 40;
                  return (
                    <g key={i}>
                      <line x1={pos} y1={20} x2={pos} y2={280} stroke="#e2e8f0" strokeDasharray="2 2" />
                      <line x1={40} y1={pos} x2={300} y2={pos} stroke="#e2e8f0" strokeDasharray="2 2" />
                      {/* X tick */}
                      <text x={pos} y={298} textAnchor="middle" className="text-[10px] fill-slate-500 font-mono">
                        {fmt(i)}
                      </text>
                      {/* Y tick */}
                      <text x={26} y={284 - i * 40} textAnchor="end" className="text-[10px] fill-slate-500 font-mono">
                        {fmt(i)}
                      </text>
                    </g>
                  );
                })}

                {/* Axes */}
                <line x1={40} y1={280} x2={310} y2={280} stroke="#334155" strokeWidth="2" />
                <line x1={40} y1={20} x2={40} y2={280} stroke="#334155" strokeWidth="2" />
                <text x={315} y={284} className="text-xs font-bold fill-slate-700">X</text>
                <text x={36} y={15} className="text-xs font-bold fill-slate-700">Y</text>

                {/* Point P(pairX, pairY) */}
                {(() => {
                  const px = 40 + pairX * 40;
                  const py = 280 - pairY * 40;
                  return (
                    <g>
                      <line x1={px} y1={280} x2={px} y2={py} stroke="#6366f1" strokeDasharray="3 3" />
                      <line x1={40} y1={py} x2={px} y2={py} stroke="#6366f1" strokeDasharray="3 3" />
                      <circle cx={px} cy={py} r={6} fill="#4f46e5" />
                      <text x={px + 8} y={py - 8} className="text-xs font-bold fill-indigo-900 font-mono">
                        P({fmt(pairX)}, {fmt(pairY)})
                      </text>
                    </g>
                  );
                })()}

                {/* Point Q(pairY, pairX) */}
                {showReversed && (() => {
                  const qx = 40 + pairY * 40;
                  const qy = 280 - pairX * 40;
                  return (
                    <g>
                      <circle cx={qx} cy={qy} r={6} fill="#e11d48" />
                      <text x={qx + 8} y={qy + 16} className="text-xs font-bold fill-rose-700 font-mono">
                        Q({fmt(pairY)}, {fmt(pairX)})
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>
          </>
        )}

        {/* TAB 2: CARTESIAN PRODUCT */}
        {activeTab === 'cartesian' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {L('कार्तेसियन गुणन (Cartesian Product)', 'Cartesian Product Builder')}
                </h4>
                <div className="text-xs text-slate-600 font-mono mt-0.5">
                  A = &#123; 1, 2 &#125;, B = &#123; 3, 4, 5 &#125; ⇒ n(A × B) = 2 × 3 = 6
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCartesianOrder('AxB')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    cartesianOrder === 'AxB' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  A × B
                </button>
                <button
                  onClick={() => setCartesianOrder('BxA')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    cartesianOrder === 'BxA' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  B × A
                </button>
              </div>
            </div>

            {/* View Selector */}
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => setCartesianView('mapping')}
                className={`px-3 py-1 rounded-lg border font-medium ${
                  cartesianView === 'mapping' ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold' : 'text-slate-600'
                }`}
              >
                {L('चित्र रेखा (Mapping Diagram)', 'Mapping Diagram')}
              </button>
              <button
                onClick={() => setCartesianView('pairs')}
                className={`px-3 py-1 rounded-lg border font-medium ${
                  cartesianView === 'pairs' ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold' : 'text-slate-600'
                }`}
              >
                {L('जोडा सूची (Set of Pairs)', 'Set of Pairs')}
              </button>
              <button
                onClick={() => setCartesianView('table')}
                className={`px-3 py-1 rounded-lg border font-medium ${
                  cartesianView === 'table' ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold' : 'text-slate-600'
                }`}
              >
                {L('तालिका रूप (Table Form)', 'Table Form')}
              </button>
            </div>

            {/* Visual Display */}
            {cartesianView === 'mapping' && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-center">
                <svg viewBox="0 0 380 200" className="w-full max-w-[360px] select-none">
                  {/* Ellipse A */}
                  <ellipse cx="70" cy="100" rx="45" ry="85" fill="#e0e7ff" stroke="#6366f1" strokeWidth="2" />
                  <text x="70" y="30" textAnchor="middle" className="text-xs font-bold fill-indigo-900 font-mono">
                    {cartesianOrder === 'AxB' ? 'A' : 'B'}
                  </text>

                  {/* Ellipse B */}
                  <ellipse cx="310" cy="100" rx="45" ry="85" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
                  <text x="310" y="30" textAnchor="middle" className="text-xs font-bold fill-amber-900 font-mono">
                    {cartesianOrder === 'AxB' ? 'B' : 'A'}
                  </text>

                  {/* Elements and Arrows */}
                  {(cartesianOrder === 'AxB' ? setA : setB).map((a, i, arrA) => {
                    const ay = 60 + i * (80 / (arrA.length - 1 || 1));
                    return (
                      <g key={a}>
                        <circle cx="70" cy={ay} r={4} fill="#4f46e5" />
                        <text x="50" y={ay + 4} textAnchor="end" className="text-xs font-bold font-mono fill-slate-800">
                          {fmt(a)}
                        </text>

                        {(cartesianOrder === 'AxB' ? setB : setA).map((b, j, arrB) => {
                          const by = 50 + j * (100 / (arrB.length - 1 || 1));
                          return (
                            <line
                              key={`${a}-${b}`}
                              x1="74"
                              y1={ay}
                              x2="306"
                              y2={by}
                              stroke="#818cf8"
                              strokeWidth="1.2"
                              strokeOpacity={0.6}
                            />
                          );
                        })}
                      </g>
                    );
                  })}

                  {(cartesianOrder === 'AxB' ? setB : setA).map((b, j, arrB) => {
                    const by = 50 + j * (100 / (arrB.length - 1 || 1));
                    return (
                      <g key={b}>
                        <circle cx="310" cy={by} r={4} fill="#d97706" />
                        <text x="325" y={by + 4} className="text-xs font-bold font-mono fill-slate-800">
                          {fmt(b)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}

            {cartesianView === 'pairs' && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-sm leading-loose">
                <span className="font-bold text-indigo-900">{cartesianOrder} = </span>
                &#123;{' '}
                {cartesianProduct.map(([x, y], idx) => (
                  <span key={idx} className="bg-white border border-slate-200 px-2 py-0.5 rounded mx-1 text-slate-800">
                    ({fmt(x)}, {fmt(y)}){idx < cartesianProduct.length - 1 ? ',' : ''}
                  </span>
                ))}{' '}
                &#125;
              </div>
            )}

            {cartesianView === 'table' && (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-center">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 font-mono">
                    <tr>
                      <th className="p-2 border-r border-slate-200">×</th>
                      {(cartesianOrder === 'AxB' ? setB : setA).map(b => (
                        <th key={b} className="p-2 border-r border-slate-200 font-bold text-amber-700">
                          {fmt(b)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {(cartesianOrder === 'AxB' ? setA : setB).map(a => (
                      <tr key={a} className="hover:bg-slate-50">
                        <td className="p-2 border-r border-slate-200 font-bold text-indigo-700 bg-slate-50">
                          {fmt(a)}
                        </td>
                        {(cartesianOrder === 'AxB' ? setB : setA).map(b => (
                          <td key={b} className="p-2 border-r border-slate-200">
                            ({fmt(a)}, {fmt(b)})
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RELATION, DOMAIN, RANGE, CODOMAIN */}
        {activeTab === 'relation' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {L('सम्बन्ध, डोमेन र रेञ्ज (Relation, Domain and Range)', 'Relation Builder')}
                </h4>
                <p className="text-xs text-slate-500">
                  {L('सम्बन्ध R सधैं कार्तेसियन गुणन A × B को उपसमूह हुन्छ: R ⊆ A × B।', 'A relation R is always a subset of Cartesian Product: R ⊆ A × B.')}
                </p>
              </div>

              {/* Rule Selector */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'less', label: 'x < y' },
                  { key: 'greater', label: 'x > y' },
                  { key: 'equal', label: 'x = y' },
                  { key: 'double', label: 'y = 2x' },
                  { key: 'factor', label: 'x factor of y' },
                ].map(r => (
                  <button
                    key={r.key}
                    onClick={() => setSelectedRule(r.key as any)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                      selectedRule === r.key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtered Pairs */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-800">
                {L('सम्बन्ध R का क्रमित जोडाहरू (Pairs satisfying condition):', 'Relation R Elements:')}
              </div>
              <div className="font-mono text-sm">
                R = &#123;{' '}
                {ruleFilteredPairs.length > 0 ? (
                  ruleFilteredPairs.map(([x, y], idx) => (
                    <span key={idx} className="bg-white border border-indigo-200 px-2 py-0.5 rounded mx-1 text-indigo-800 font-bold">
                      ({fmt(x)}, {fmt(y)}){idx < ruleFilteredPairs.length - 1 ? ',' : ''}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">∅ ({L('खाली सम्बन्ध', 'Empty relation')})</span>
                )}{' '}
                &#125;
              </div>
            </div>

            {/* Domain, Range, Codomain breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                <span className="font-bold text-indigo-950 block">{L('डोमेन (Domain):', 'Domain:')}</span>
                <span className="text-[11px] text-slate-500 block">{L('R का पहिलो घटकहरूको समूह', 'First elements of R')}</span>
                <span className="font-mono font-bold text-indigo-700 text-sm block">
                  Dom(R) = &#123; {domainElements.map(d => fmt(d)).join(', ')} &#125;
                </span>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <span className="font-bold text-emerald-950 block">{L('रेञ्ज (Range):', 'Range:')}</span>
                <span className="text-[11px] text-slate-500 block">{L('R का दोस्रो घटकहरूको समूह', 'Actual second elements')}</span>
                <span className="font-mono font-bold text-emerald-700 text-sm block">
                  Range(R) = &#123; {rangeElements.map(r => fmt(r)).join(', ')} &#125;
                </span>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="font-bold text-amber-950 block">{L('सह-डोमेन (Co-domain):', 'Co-domain:')}</span>
                <span className="text-[11px] text-slate-500 block">{L('पूर्ण दोस्रो समूह (Target Set)', 'Complete target set')}</span>
                <span className="font-mono font-bold text-amber-700 text-sm block">
                  Co-dom = &#123; {codomainElements.map(c => fmt(c)).join(', ')} &#125;
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TYPES OF RELATIONS (EQUIVALENCE) */}
        {activeTab === 'types' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                {L('सम्बन्धका प्रकार तथा समतुल्यता परीक्षण (Equivalence Relation on S = {1, 2, 3})', 'Equivalence Relation Tester')}
              </h4>
              <p className="text-xs text-slate-500">
                {L('कुनै सम्बन्ध स्वपरावर्तक, सममित र सङ्क्रामक भएमा त्यसलाई समतुल्यता सम्बन्ध (Equivalence Relation) भनिन्छ।', 'A relation is an Equivalence relation if and only if it is Reflexive, Symmetric, and Transitive.')}
              </p>
            </div>

            {/* Clickable 3x3 pair matrix on S */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">{L('R मा जोडा थप्न वा हटाउन थिच्नुहोस्:', 'Click to toggle pairs in R:')}</span>
              <div className="grid grid-cols-3 gap-2 max-w-sm">
                {setS.map(a =>
                  setS.map(b => {
                    const isSelected = activePairsS.some(([x, y]) => x === a && y === b);
                    return (
                      <button
                        key={`${a}-${b}`}
                        onClick={() => togglePairInS(a, b)}
                        className={`p-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                          isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        ({fmt(a)}, {fmt(b)})
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Evaluation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className={`p-3 rounded-xl border ${isReflexive ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'}`}>
                <div className="font-bold flex items-center justify-between">
                  <span>{L('१. स्वपरावर्तक (Reflexive)', 'Reflexive')}</span>
                  <span>{isReflexive ? '✓' : '✗'}</span>
                </div>
                <div className="text-[10px] text-slate-600 mt-1">
                  (a, a) ∈ R for all a ∈ S
                </div>
              </div>

              <div className={`p-3 rounded-xl border ${isSymmetric ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'}`}>
                <div className="font-bold flex items-center justify-between">
                  <span>{L('२. सममित (Symmetric)', 'Symmetric')}</span>
                  <span>{isSymmetric ? '✓' : '✗'}</span>
                </div>
                <div className="text-[10px] text-slate-600 mt-1">
                  (a, b) ∈ R ⇒ (b, a) ∈ R
                </div>
              </div>

              <div className={`p-3 rounded-xl border ${isTransitive ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'}`}>
                <div className="font-bold flex items-center justify-between">
                  <span>{L('३. सङ्क्रामक (Transitive)', 'Transitive')}</span>
                  <span>{isTransitive ? '✓' : '✗'}</span>
                </div>
                <div className="text-[10px] text-slate-600 mt-1">
                  (a, b), (b, c) ∈ R ⇒ (a, c) ∈ R
                </div>
              </div>

              <div className={`p-3 rounded-xl border font-bold ${isEquivalence ? 'bg-indigo-100 border-indigo-400 text-indigo-950' : 'bg-slate-100 border-slate-300 text-slate-500'}`}>
                <div className="text-xs">{L('समतुल्यता (Equivalence)', 'Equivalence')}</div>
                <div className="text-sm mt-1">{isEquivalence ? L('समतुल्यता सम्बन्ध हो! 🎉', 'Equivalence Relation! 🎉') : L('समतुल्यता होइन', 'Not Equivalence')}</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FUNCTION TESTER */}
        {activeTab === 'function_test' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">
                {L('फलन परीक्षण (Function Tester)', 'Function Definition & Verification')}
              </h4>
              <p className="text-xs text-slate-500">
                {L(
                  'फलन हुनका लागि पहिलो समूह A का प्रत्येक सदस्यको दोस्रो समूह B मा ठ्याक्कै एउटा मात्र प्रतिबिम्ब हुनुपर्छ।',
                  'For a relation to be a function, every element of set A must have exactly one unique image in set B.'
                )}
              </p>
            </div>

            {/* Interactive Arrow Mapping Setup */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700">{L('तीर जोड्न बटन थिच्नुहोस्:', 'Toggle mapping arrows from A to B:')}</span>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                {setA.map(a => (
                  <div key={a} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold font-mono text-indigo-700">A = {fmt(a)} connects to:</span>
                    <div className="flex gap-1.5">
                      {setB.map(b => {
                        const isConnected = (funcMappings[a] || []).includes(b);
                        return (
                          <button
                            key={b}
                            onClick={() => handleToggleFuncMapping(a, b)}
                            className={`flex-1 py-1 rounded text-xs font-mono font-bold border transition-all ${
                              isConnected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600'
                            }`}
                          >
                            {fmt(b)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Result Verdict */}
            <div className={`p-4 rounded-xl border text-xs font-bold flex justify-between items-center ${isFunction ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'}`}>
              <div>
                <span className="text-sm block">
                  {isFunction ? L('✅ यो सम्बन्ध एउटा फलन (Function) हो!', '✅ This relation is a FUNCTION!') : L('❌ यो सम्बन्ध फलन होइन (Not a function)', '❌ This relation is NOT a function.')}
                </span>
                <span className="text-[11px] font-normal text-slate-600">
                  {isFunction
                    ? L('समूह A का सबै सदस्यको ठ्याक्कै १ वटा प्रतिबिम्ब छ।', 'Every element in A has exactly one output.')
                    : L('समूह A को कुनै सदस्यको प्रतिबिम्ब छैन वा १ भन्दा बढी प्रतिबिम्ब छ।', 'Some element has 0 or >1 outputs.')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default RelationFunctionVisualExplorer;

import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const VennDiagramLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G10-U1-01',
    chapter: 1,
    titleNp: 'अन्तरक्रियात्मक भेन चित्र प्रयोगशाला',
    titleEn: 'Interactive Venn Diagram Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'twoSet' | 'threeSet' | 'surveys' | 'challenge'>('twoSet');

  // ── TWO-SET STATE ──────────────────────────────────────────────────────────
  const [uTotal2, setUTotal2] = useState<number>(100);
  const [nA2, setNA2] = useState<number>(60);
  const [nB2, setNB2] = useState<number>(50);
  const [nAB2, setNAB2] = useState<number>(25);

  // Derived 2-set regions
  const nOnlyA2 = nA2 - nAB2;
  const nOnlyB2 = nB2 - nAB2;
  const nUnion2 = nOnlyA2 + nOnlyB2 + nAB2;
  const nNeither2 = uTotal2 - nUnion2;

  const isInvalid2 = nOnlyA2 < 0 || nOnlyB2 < 0 || nNeither2 < 0;

  // Selected 2-set region for inspection
  const [selectedRegion2, setSelectedRegion2] = useState<string | null>('intersection');

  // ── THREE-SET STATE ────────────────────────────────────────────────────────
  const [uTotal3, setUTotal3] = useState<number>(120);
  const [nA3, setNA3] = useState<number>(50);
  const [nB3, setNB3] = useState<number>(45);
  const [nC3, setNC3] = useState<number>(55);
  const [nAB3, setNAB3] = useState<number>(18); // A ∩ B
  const [nBC3, setNBC3] = useState<number>(16); // B ∩ C
  const [nCA3, setNCA3] = useState<number>(20); // C ∩ A
  const [nABC3, setNABC3] = useState<number>(8); // A ∩ B ∩ C

  // 7 internal regions:
  // only intersection of 2:
  const nOnlyAB3 = nAB3 - nABC3;
  const nOnlyBC3 = nBC3 - nABC3;
  const nOnlyCA3 = nCA3 - nABC3;

  // only one set:
  const nOnlyA3 = nA3 - (nOnlyAB3 + nOnlyCA3 + nABC3);
  const nOnlyB3 = nB3 - (nOnlyAB3 + nOnlyBC3 + nABC3);
  const nOnlyC3 = nC3 - (nOnlyCA3 + nOnlyBC3 + nABC3);

  const nUnion3 = nOnlyA3 + nOnlyB3 + nOnlyC3 + nOnlyAB3 + nOnlyBC3 + nOnlyCA3 + nABC3;
  const nNeither3 = uTotal3 - nUnion3;

  const isInvalid3 =
    nOnlyA3 < 0 ||
    nOnlyB3 < 0 ||
    nOnlyC3 < 0 ||
    nOnlyAB3 < 0 ||
    nOnlyBC3 < 0 ||
    nOnlyCA3 < 0 ||
    nNeither3 < 0;

  // Selected 3-set region
  const [selectedRegion3, setSelectedRegion3] = useState<string | null>('center');

  // ── SURVEY EXAMPLES (Textbook Practical Scenarios) ─────────────────────────
  const [surveyType, setSurveyType] = useState<'cricket' | 'fruit'>('cricket');

  // ── CHALLENGE QUIZ ─────────────────────────────────────────────────────────
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);

  const quizQuestions = [
    {
      qNp: 'यदि n(U) = 150, n(A) = 80, n(B) = 70 र n(A ∩ B) = 30 भए, n(A ∪ B) को मान कति हुन्छ?',
      qEn: 'If n(U) = 150, n(A) = 80, n(B) = 70 and n(A ∩ B) = 30, what is n(A ∪ B)?',
      opts: ['120', '150', '110', '90'],
      correct: 0,
      expNp: 'n(A ∪ B) = n(A) + n(B) - n(A ∩ B) = 80 + 70 - 30 = 120',
      expEn: 'n(A ∪ B) = n(A) + n(B) - n(A ∩ B) = 80 + 70 - 30 = 120',
    },
    {
      qNp: 'दुई समूहको सर्वेक्षणमा, nₒ(A) = 45 र n(A ∩ B) = 20 भए, n(A) को मान कति हुन्छ?',
      qEn: 'In a survey of two sets, if nₒ(A) = 45 and n(A ∩ B) = 20, what is n(A)?',
      opts: ['25', '65', '45', '70'],
      correct: 1,
      expNp: 'n(A) = nₒ(A) + n(A ∩ B) = 45 + 20 = 65',
      expEn: 'n(A) = nₒ(A) + n(A ∩ B) = 45 + 20 = 65',
    },
    {
      qNp: 'तीनवटा समूहहरू A, B, C मा, केवल दुईवटा मात्र समूहमा पर्ने सदस्यहरूको संख्या कसरी निकालिन्छ?',
      qEn: 'In three sets A, B, C, how is the number of elements in exactly two sets found?',
      opts: [
        'nₒ(A ∩ B) + nₒ(B ∩ C) + nₒ(C ∩ A)',
        'n(A ∩ B) + n(B ∩ C) + n(C ∩ A)',
        'n(A ∪ B ∪ C) - n(A ∩ B ∩ C)',
        'nₒ(A) + nₒ(B) + nₒ(C)',
      ],
      correct: 0,
      expNp: 'केवल दुईवटा समूह = nₒ(A ∩ B) + nₒ(B ∩ C) + nₒ(C ∩ A) = [n(A ∩ B) - n(A ∩ B ∩ C)] + ...',
      expEn: 'Exactly two sets = nₒ(A ∩ B) + nₒ(B ∩ C) + nₒ(C ∩ A)',
    },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={10}
      mascotGreeting={L(
        'नमस्ते! कक्षा १० गणितको एकाइ १: समूह (Sets) भेन चित्र प्रयोगशालामा स्वागत छ! यहाँ दुई र तीन समूहका भेन चित्र, विभिन्न खण्डहरू, र सूत्रहरू प्रत्यक्ष रूपमा अन्वेषण गर्नुहोस्!',
        'Welcome to Grade 10 Unit 1: Sets Venn Diagram Laboratory! Explore 2-set and 3-set Venn diagrams, overlapping regions, and cardinality formulas interactively!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'twoSet', labelNp: 'क) दुई समूह भेन चित्र (Two Sets)', labelEn: 'A) Two-Set Venn Diagram' },
            { id: 'threeSet', labelNp: 'ख) तीन समूह भेन चित्र (Three Sets)', labelEn: 'B) Three-Set Venn Diagram' },
            { id: 'surveys', labelNp: 'ग) पाठ्यपुस्तकका व्यावहारिक सर्वेक्षणहरू', labelEn: 'C) Textbook Practical Surveys' },
            { id: 'challenge', labelNp: 'घ) अभ्यास चुनौती (Quiz)', labelEn: 'D) Practice Challenge' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                kit.tap();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-[#167C80] text-white shadow-md'
                  : 'bg-white hover:bg-slate-100 text-[#142D4E] border border-slate-200'
              }`}
            >
              {isNe ? tab.labelNp : tab.labelEn}
            </button>
          ))}
        </div>

        {/* ── TAB A: TWO-SET VENN DIAGRAM ────────────────────────────────────────── */}
        {activeTab === 'twoSet' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* SVG Visual Canvas */}
            <div className="md:col-span-7 bg-[#142D4E] p-4 rounded-2xl flex flex-col items-center justify-between text-white shadow-md">
              <div className="w-full flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>{L('सर्वव्यापक समूह U = ' + fmt(uTotal2), 'Universal Set U = ' + fmt(uTotal2))}</span>
                <span>{L('क्षेत्रमा क्लिक गरी अध्ययन गर्नुहोस्', 'Click any region to inspect')}</span>
              </div>

              <svg width="100%" height={260} viewBox="0 0 380 260" className="max-w-md">
                {/* Universal Set Rectangle */}
                <rect x={10} y={10} width={360} height={240} rx={12} fill="#1e3a5f" stroke="#38bdf8" strokeWidth={2} />
                <text x={26} y={34} fill="#38bdf8" fontSize="14" fontWeight="bold">U</text>

                {/* Outside region / Neither */}
                <rect
                  x={15}
                  y={15}
                  width={350}
                  height={230}
                  fill={selectedRegion2 === 'neither' ? '#f59e0b' : 'transparent'}
                  fillOpacity={selectedRegion2 === 'neither' ? 0.35 : 0}
                  onClick={() => setSelectedRegion2('neither')}
                  className="cursor-pointer"
                />
                <text x={330} y={40} fill="#f8fafc" fontSize="12" fontWeight="bold">
                  {fmt(nNeither2)}
                </text>

                {/* Circle A */}
                <circle
                  cx={145}
                  cy={130}
                  r={75}
                  fill={selectedRegion2 === 'onlyA' ? '#10b981' : '#38bdf8'}
                  fillOpacity={selectedRegion2 === 'onlyA' ? 0.45 : 0.25}
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  onClick={() => setSelectedRegion2('onlyA')}
                  className="cursor-pointer"
                />

                {/* Circle B */}
                <circle
                  cx={235}
                  cy={130}
                  r={75}
                  fill={selectedRegion2 === 'onlyB' ? '#10b981' : '#a78bfa'}
                  fillOpacity={selectedRegion2 === 'onlyB' ? 0.45 : 0.25}
                  stroke="#a78bfa"
                  strokeWidth={2.5}
                  onClick={() => setSelectedRegion2('onlyB')}
                  className="cursor-pointer"
                />

                {/* Intersection Overlap Click Zone */}
                <ellipse
                  cx={190}
                  cy={130}
                  rx={25}
                  ry={50}
                  fill={selectedRegion2 === 'intersection' ? '#f59e0b' : '#34d399'}
                  fillOpacity={selectedRegion2 === 'intersection' ? 0.6 : 0.3}
                  onClick={() => setSelectedRegion2('intersection')}
                  className="cursor-pointer"
                />

                {/* Labels & Counts */}
                <text x={115} y={75} fill="#38bdf8" fontSize="14" fontWeight="bold">A</text>
                <text x={255} y={75} fill="#a78bfa" fontSize="14" fontWeight="bold">B</text>

                {/* A only count */}
                <text x={115} y={135} fill="#ffffff" fontSize="15" fontWeight="bold" textAnchor="middle">
                  {fmt(nOnlyA2)}
                </text>
                {/* Intersection count */}
                <text x={190} y={135} fill="#fbbf24" fontSize="16" fontWeight="bold" textAnchor="middle">
                  {fmt(nAB2)}
                </text>
                {/* B only count */}
                <text x={265} y={135} fill="#ffffff" fontSize="15" fontWeight="bold" textAnchor="middle">
                  {fmt(nOnlyB2)}
                </text>
              </svg>

              {/* Validation alert */}
              {isInvalid2 && (
                <div className="w-full mt-2 p-2 bg-rose-500/20 border border-rose-400 rounded-lg text-rose-200 text-xs text-center font-bold">
                  {L('चेतावनी: दिइएको मानहरू असङ्गत छन् (ऋणात्मक संख्या हुन सक्दैन)!', 'Warning: Inconsistent inputs produce negative counts!')}
                </div>
              )}
            </div>

            {/* Controls and Region Inspector */}
            <div className="md:col-span-5 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-[#142D4E] text-base">
                {L('समूहका मानहरू परिवर्तन गर्नुहोस् (Controls):', 'Interactive Cardinality Controls:')}
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>n(U) [जम्मा]: {fmt(uTotal2)}</span>
                  </div>
                  <input type="range" min="50" max="200" value={uTotal2} onChange={(e) => setUTotal2(parseInt(e.target.value))} className="w-full accent-[#167C80]" />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-blue-700">
                    <span>n(A): {fmt(nA2)}</span>
                  </div>
                  <input type="range" min="10" max={uTotal2} value={nA2} onChange={(e) => setNA2(parseInt(e.target.value))} className="w-full accent-blue-600" />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-purple-700">
                    <span>n(B): {fmt(nB2)}</span>
                  </div>
                  <input type="range" min="10" max={uTotal2} value={nB2} onChange={(e) => setNB2(parseInt(e.target.value))} className="w-full accent-purple-600" />
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-amber-700">
                    <span>n(A ∩ B) [प्रतिच्छेदन]: {fmt(nAB2)}</span>
                  </div>
                  <input type="range" min="0" max={Math.min(nA2, nB2)} value={nAB2} onChange={(e) => setNAB2(parseInt(e.target.value))} className="w-full accent-amber-500" />
                </div>
              </div>

              {/* Selected Region Detailed Mathematical Card */}
              <div className="p-3 bg-slate-50 border rounded-xl text-xs space-y-1.5">
                <span className="font-bold text-[#167C80] uppercase tracking-wider block">
                  {L('छानिएको खण्डको व्याख्या (Region Details):', 'Selected Region Analysis:')}
                </span>

                {selectedRegion2 === 'onlyA' && (
                  <div>
                    <div className="font-bold text-blue-900 font-mono text-sm">A मात्र (A only) = nₒ(A)</div>
                    <div className="text-slate-600">सूत्र: nₒ(A) = n(A) - n(A ∩ B)</div>
                    <div className="font-bold text-slate-800 font-mono text-sm">{fmt(nA2)} - {fmt(nAB2)} = {fmt(nOnlyA2)}</div>
                  </div>
                )}
                {selectedRegion2 === 'onlyB' && (
                  <div>
                    <div className="font-bold text-purple-900 font-mono text-sm">B मात्र (B only) = nₒ(B)</div>
                    <div className="text-slate-600">सूत्र: nₒ(B) = n(B) - n(A ∩ B)</div>
                    <div className="font-bold text-slate-800 font-mono text-sm">{fmt(nB2)} - {fmt(nAB2)} = {fmt(nOnlyB2)}</div>
                  </div>
                )}
                {selectedRegion2 === 'intersection' && (
                  <div>
                    <div className="font-bold text-amber-800 font-mono text-sm">दुवैमा पर्ने (A ∩ B) = n(A ∩ B)</div>
                    <div className="text-slate-600">A र B दुवै समूहको साझा भाग</div>
                    <div className="font-bold text-slate-800 font-mono text-sm">n(A ∩ B) = {fmt(nAB2)}</div>
                  </div>
                )}
                {selectedRegion2 === 'neither' && (
                  <div>
                    <div className="font-bold text-slate-800 font-mono text-sm">कुनैमा पनि नपर्ने = n(A ∪ B)̅</div>
                    <div className="text-slate-600">सूत्र: n(U) - n(A ∪ B)</div>
                    <div className="font-bold text-slate-800 font-mono text-sm">{fmt(uTotal2)} - {fmt(nUnion2)} = {fmt(nNeither2)}</div>
                  </div>
                )}
              </div>

              {/* Total Cardinality Formula */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl font-mono text-xs text-teal-950 space-y-1">
                <div className="font-bold">n(A ∪ B) = n(A) + n(B) - n(A ∩ B)</div>
                <div>= {fmt(nA2)} + {fmt(nB2)} - {fmt(nAB2)} = <span className="font-bold text-sm text-[#167C80]">{fmt(nUnion2)}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB B: THREE-SET VENN DIAGRAM ──────────────────────────────────────── */}
        {activeTab === 'threeSet' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* SVG Visual Canvas for 3 sets */}
            <div className="md:col-span-7 bg-[#142D4E] p-4 rounded-2xl flex flex-col items-center justify-between text-white shadow-md">
              <div className="w-full flex justify-between text-xs font-bold text-slate-300 mb-2">
                <span>{L('सर्वव्यापक समूह U = ' + fmt(uTotal3), 'Universal Set U = ' + fmt(uTotal3))}</span>
                <span>{L('७ वटा खण्डहरूमा क्लिक गर्नुहोस्', 'Click any of the 7 regions')}</span>
              </div>

              <svg width="100%" height={290} viewBox="0 0 380 290" className="max-w-md">
                {/* U Rectangle */}
                <rect x={10} y={10} width={360} height={270} rx={12} fill="#1e3a5f" stroke="#38bdf8" strokeWidth={2} />
                <text x={26} y={34} fill="#38bdf8" fontSize="14" fontWeight="bold">U</text>

                {/* Outside Neither */}
                <text x={330} y={40} fill="#f8fafc" fontSize="12" fontWeight="bold">
                  {fmt(nNeither3)}
                </text>

                {/* Circle A (Top-Left) */}
                <circle cx={150} cy={110} r={65} fill="#38bdf8" fillOpacity={selectedRegion3 === 'onlyA' ? 0.45 : 0.2} stroke="#38bdf8" strokeWidth={2} onClick={() => setSelectedRegion3('onlyA')} className="cursor-pointer" />
                {/* Circle B (Top-Right) */}
                <circle cx={230} cy={110} r={65} fill="#a78bfa" fillOpacity={selectedRegion3 === 'onlyB' ? 0.45 : 0.2} stroke="#a78bfa" strokeWidth={2} onClick={() => setSelectedRegion3('onlyB')} className="cursor-pointer" />
                {/* Circle C (Bottom) */}
                <circle cx={190} cy={175} r={65} fill="#34d399" fillOpacity={selectedRegion3 === 'onlyC' ? 0.45 : 0.2} stroke="#34d399" strokeWidth={2} onClick={() => setSelectedRegion3('onlyC')} className="cursor-pointer" />

                {/* Set Labels */}
                <text x={105} y={60} fill="#38bdf8" fontSize="14" fontWeight="bold">A</text>
                <text x={275} y={60} fill="#a78bfa" fontSize="14" fontWeight="bold">B</text>
                <text x={190} y={260} fill="#34d399" fontSize="14" fontWeight="bold" textAnchor="middle">C</text>

                {/* Numbers on 7 regions */}
                {/* 1. Only A */}
                <text x={125} y={100} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle" onClick={() => setSelectedRegion3('onlyA')} className="cursor-pointer">{fmt(nOnlyA3)}</text>
                {/* 2. Only B */}
                <text x={255} y={100} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle" onClick={() => setSelectedRegion3('onlyB')} className="cursor-pointer">{fmt(nOnlyB3)}</text>
                {/* 3. Only C */}
                <text x={190} y={215} fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle" onClick={() => setSelectedRegion3('onlyC')} className="cursor-pointer">{fmt(nOnlyC3)}</text>

                {/* 4. Only A & B */}
                <text x={190} y={85} fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle" onClick={() => setSelectedRegion3('onlyAB')} className="cursor-pointer">{fmt(nOnlyAB3)}</text>
                {/* 5. Only B & C */}
                <text x={225} y={155} fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle" onClick={() => setSelectedRegion3('onlyBC')} className="cursor-pointer">{fmt(nOnlyBC3)}</text>
                {/* 6. Only C & A */}
                <text x={155} y={155} fill="#fbbf24" fontSize="12" fontWeight="bold" textAnchor="middle" onClick={() => setSelectedRegion3('onlyCA')} className="cursor-pointer">{fmt(nOnlyCA3)}</text>

                {/* 7. All three A ∩ B ∩ C */}
                <text x={190} y={135} fill="#f43f5e" fontSize="14" fontWeight="bold" textAnchor="middle" onClick={() => setSelectedRegion3('center')} className="cursor-pointer">{fmt(nABC3)}</text>
              </svg>

              {isInvalid3 && (
                <div className="w-full mt-2 p-2 bg-rose-500/20 border border-rose-400 rounded-lg text-rose-200 text-xs text-center font-bold">
                  {L('चेतावनी: मानहरू असङ्गत छन् (कुनै खण्डमा ऋणात्मक संख्या आयो)!', 'Warning: Input combination generates negative counts!')}
                </div>
              )}
            </div>

            {/* Three-Set Controls and Explorer */}
            <div className="md:col-span-5 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-[#142D4E] text-base">
                {L('३ समूहका मानहरू (Cardinalities):', 'Set Parameters:')}
              </h3>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="font-semibold text-blue-700">n(A):</span>
                  <input type="number" min="10" max="100" value={nA3} onChange={(e) => setNA3(parseInt(e.target.value) || 0)} className="w-full p-1 border rounded text-center font-bold" />
                </div>
                <div>
                  <span className="font-semibold text-purple-700">n(B):</span>
                  <input type="number" min="10" max="100" value={nB3} onChange={(e) => setNB3(parseInt(e.target.value) || 0)} className="w-full p-1 border rounded text-center font-bold" />
                </div>
                <div>
                  <span className="font-semibold text-emerald-700">n(C):</span>
                  <input type="number" min="10" max="100" value={nC3} onChange={(e) => setNC3(parseInt(e.target.value) || 0)} className="w-full p-1 border rounded text-center font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1 text-[11px]">
                <div>
                  <span className="text-slate-600 block">n(A ∩ B):</span>
                  <input type="number" min="0" max="50" value={nAB3} onChange={(e) => setNAB3(parseInt(e.target.value) || 0)} className="w-full p-1 border rounded text-center font-bold" />
                </div>
                <div>
                  <span className="text-slate-600 block">n(B ∩ C):</span>
                  <input type="number" min="0" max="50" value={nBC3} onChange={(e) => setNBC3(parseInt(e.target.value) || 0)} className="w-full p-1 border rounded text-center font-bold" />
                </div>
                <div>
                  <span className="text-slate-600 block">n(C ∩ A):</span>
                  <input type="number" min="0" max="50" value={nCA3} onChange={(e) => setNCA3(parseInt(e.target.value) || 0)} className="w-full p-1 border rounded text-center font-bold" />
                </div>
                <div>
                  <span className="text-rose-600 font-bold block">n(A∩B∩C):</span>
                  <input type="number" min="0" max="30" value={nABC3} onChange={(e) => setNABC3(parseInt(e.target.value) || 0)} className="w-full p-1 border rounded text-center font-bold text-rose-700" />
                </div>
              </div>

              {/* Step-by-Step 3-Set Formula */}
              <div className="p-3 bg-slate-50 border rounded-xl font-mono text-[11px] space-y-1">
                <div className="font-bold text-[#142D4E] text-xs">
                  {L('पाठ्यपुस्तक सूत्र (CDC Formula):', 'Cardinality of 3 Sets:')}
                </div>
                <div className="text-slate-600 leading-tight">
                  n(A ∪ B ∪ C) = n(A) + n(B) + n(C) - n(A∩B) - n(B∩C) - n(C∩A) + n(A∩B∩C)
                </div>
                <div className="text-[#167C80] font-bold">
                  = {fmt(nA3)} + {fmt(nB3)} + {fmt(nC3)} - {fmt(nAB3)} - {fmt(nBC3)} - {fmt(nCA3)} + {fmt(nABC3)} = <span className="text-sm">{fmt(nUnion3)}</span>
                </div>
                <div className="text-slate-500 pt-1 border-t">
                  n(कुनैमा नपर्ने) = n(U) - n(A ∪ B ∪ C) = {fmt(uTotal3)} - {fmt(nUnion3)} = {fmt(nNeither3)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB C: PRACTICAL TEXTBOOK SURVEYS ──────────────────────────────────── */}
        {activeTab === 'surveys' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSurveyType('cricket')}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  surveyType === 'cricket' ? 'bg-[#167C80] text-white border-[#167C80]' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {L('१) दुई समूह: क्रिकेट र फुटबल सर्वेक्षण (300 जना)', '1) Two Sets: Cricket & Football (300 People)')}
              </button>
              <button
                onClick={() => setSurveyType('fruit')}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  surveyType === 'fruit' ? 'bg-[#167C80] text-white border-[#167C80]' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {L('२) तीन समूह: फलफूल सर्वेक्षण (सुन्तला, आँप, केरा)', '2) Three Sets: Fruit Preferences Survey')}
              </button>
            </div>

            {surveyType === 'cricket' && (
              <div className="space-y-3">
                <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded text-sm text-blue-900">
                  <span className="font-bold">{L('पाठ्यपुस्तक उदाहरण १:', 'Textbook Example 1:')}</span>
                  <p className="mt-1">
                    {L(
                      '३०० जना मानिसहरूमा गरिएको सर्वेक्षणमा १७५ जनाले क्रिकेट (C) र १५० जनाले फुटबल (F) मन पराउँछन्। २५ जनाले कुनै पनि खेल मन पराउँदैनन्।',
                      'In a survey of 300 people, 175 like cricket (C), 150 like football (F), and 25 like neither.'
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 border rounded-xl font-mono text-xs space-y-1">
                    <div className="font-bold text-slate-700">दिइएको मानहरू (Given):</div>
                    <div>n(U) = 300</div>
                    <div>n(C) = 175</div>
                    <div>n(F) = 150</div>
                    <div>n(C ∪ F)̅ = 25</div>
                  </div>

                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl font-mono text-xs space-y-1">
                    <div className="font-bold text-[#167C80]">समाधान प्रक्रिया (Step-by-Step):</div>
                    <div>n(C ∪ F) = n(U) - n(C ∪ F)̅ = 300 - 25 = 275</div>
                    <div>n(C ∩ F) = n(C) + n(F) - n(C ∪ F) = 175 + 150 - 275 = <span className="font-bold text-amber-700">50 (दुवै मन पराउने)</span></div>
                    <div>nₒ(C) = 175 - 50 = <span className="font-bold">125 (क्रिकेट मात्र)</span></div>
                    <div>nₒ(F) = 150 - 50 = <span className="font-bold">100 (फुटबल मात्र)</span></div>
                    <div>ठ्याक्कै एउटा मात्र = 125 + 100 = <span className="font-bold text-indigo-700">225</span></div>
                  </div>
                </div>
              </div>
            )}

            {surveyType === 'fruit' && (
              <div className="space-y-3">
                <div className="bg-emerald-50 border-l-4 border-emerald-600 p-3 rounded text-sm text-emerald-900">
                  <span className="font-bold">{L('पाठ्यपुस्तक उदाहरण २ (फलफूल सर्वेक्षण):', 'Textbook Example 2 (Fruit Survey):')}</span>
                  <p className="mt-1">
                    {L(
                      '४० जनाले सुन्तला (O), ३५ जनाले आँप (M), ५० जनाले केरा (B) मन पराउँछन्। १५ जनाले सुन्तला र आँप, २० जनाले आँप र केरा, २५ जनाले सुन्तला र केरा, ५ जनाले तीनवटै फल मन पराउँछन् र ३० जनाले कुनै पनि मन पराउँदैनन्।',
                      '40 like orange, 35 like mango, 50 like banana; 15 like orange & mango, 20 like mango & banana, 25 like orange & banana, 5 like all three, and 30 like none.'
                    )}
                  </p>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-xl font-mono text-xs space-y-2">
                  <div className="text-amber-400 font-bold text-sm">
                    {L('भेन चित्रका ७ वटा खण्डहरूको गणना:', 'Calculation of all 7 internal regions:')}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                    <div>तीनैवटा मन पराउने n(O ∩ M ∩ B) = 5</div>
                    <div>सुन्तला र आँप मात्र = 15 - 5 = 10</div>
                    <div>आँप र केरा मात्र = 20 - 5 = 15</div>
                    <div>सुन्तला र केरा मात्र = 25 - 5 = 20</div>
                    <div>सुन्तला मात्र nₒ(O) = 40 - (10 + 20 + 5) = 5</div>
                    <div>आँप मात्र nₒ(M) = 35 - (10 + 15 + 5) = 5</div>
                    <div>केरा मात्र nₒ(B) = 50 - (20 + 15 + 5) = 10</div>
                    <div className="text-emerald-400 font-bold col-span-full">
                      जम्मा n(U) = 5 + 5 + 10 + 10 + 15 + 20 + 5 + 30 = 100 जना
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB D: PRACTICE CHALLENGE ────────────────────────────────────────── */}
        {activeTab === 'challenge' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-[#142D4E]">
                {L(`प्रश्न ${toNp(quizIdx + 1)} / ${toNp(quizQuestions.length)}`, `Question ${quizIdx + 1} of ${quizQuestions.length}`)}
              </span>
              <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-800 rounded">
                {L('कक्षा १० एसईई (SEE) स्तर', 'SEE Grade 10 Level')}
              </span>
            </div>

            <p className="font-medium text-slate-800 text-sm sm:text-base">
              {isNe ? quizQuestions[quizIdx].qNp : quizQuestions[quizIdx].qEn}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quizQuestions[quizIdx].opts.map((opt, i) => {
                const isSelected = selectedAns === i;
                const isCorrect = i === quizQuestions[quizIdx].correct;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setSelectedAns(i);
                      if (isCorrect) kit.good();
                      else kit.oops();
                    }}
                    className={`p-3 rounded-xl border text-left font-mono font-bold transition-all text-sm ${
                      selectedAns === null
                        ? 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                        : isCorrect
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                        : isSelected
                        ? 'bg-rose-100 border-rose-400 text-rose-950'
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {fmt(opt)}
                  </button>
                );
              })}
            </div>

            {selectedAns !== null && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="text-xs font-bold text-blue-900">{L('व्याख्या (Solution):', 'Explanation:')}</div>
                <div className="text-xs sm:text-sm font-mono text-blue-950">
                  {isNe ? quizQuestions[quizIdx].expNp : quizQuestions[quizIdx].expEn}
                </div>
                <button
                  onClick={() => {
                    setSelectedAns(null);
                    setQuizIdx((prev) => (prev + 1) % quizQuestions.length);
                  }}
                  className="px-4 py-1.5 bg-[#167C80] text-white rounded-lg text-xs font-bold"
                >
                  {L('अर्को प्रश्न →', 'Next Question →')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default VennDiagramLab;

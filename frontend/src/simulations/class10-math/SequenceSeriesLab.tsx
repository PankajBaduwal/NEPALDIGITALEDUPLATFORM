import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const SequenceSeriesLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G10-U6-01',
    chapter: 6,
    titleNp: 'अनुक्रम र श्रेणी नमुना प्रयोगशाला',
    titleEn: 'Sequence and Series Pattern Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<
    'arithmetic' | 'arithMeans' | 'arithSeries' | 'geometric' | 'geomMeans' | 'geomSeries' | 'challenge'
  >('arithmetic');

  // ── 1. ARITHMETIC PROGRESSION CONTROLS ─────────────────────────────────────
  const [apA, setApA] = useState<number>(4);
  const [apD, setApD] = useState<number>(3);
  const [apN, setApN] = useState<number>(8);

  const apTerms = Array.from({ length: apN }, (_, i) => apA + i * apD);
  const apNthTerm = apA + (apN - 1) * apD;

  // ── 2. ARITHMETIC MEANS CONTROLS ───────────────────────────────────────────
  const [amA, setAmA] = useState<number>(5);
  const [amB, setAmB] = useState<number>(29);
  const [amK, setAmK] = useState<number>(3); // number of means to insert

  const amD = (amB - amA) / (amK + 1);
  const amMeans = Array.from({ length: amK }, (_, i) => amA + (i + 1) * amD);

  // ── 3. ARITHMETIC SERIES CONTROLS ──────────────────────────────────────────
  const [asA, setAsA] = useState<number>(3);
  const [asD, setAsD] = useState<number>(4);
  const [asN, setAsN] = useState<number>(6);

  const asTerms = Array.from({ length: asN }, (_, i) => asA + i * asD);
  const asLastTerm = asA + (asN - 1) * asD;
  const asSum = (asN / 2) * (2 * asA + (asN - 1) * asD);

  // ── 4. GEOMETRIC PROGRESSION CONTROLS ──────────────────────────────────────
  const [gpA, setGpA] = useState<number>(2);
  const [gpR, setGpR] = useState<number>(2); // common ratio
  const [gpN, setGpN] = useState<number>(6);

  const gpTerms = Array.from({ length: gpN }, (_, i) => gpA * Math.pow(gpR, i));
  const gpNthTerm = gpA * Math.pow(gpR, gpN - 1);

  // ── 5. GEOMETRIC MEANS CONTROLS ────────────────────────────────────────────
  const [gmA, setGmA] = useState<number>(3);
  const [gmB, setGmB] = useState<number>(48);
  const [gmK, setGmK] = useState<number>(3); // number of GM

  // r = (b/a)^(1/(k+1))
  const gmRatio = Math.round(Math.pow(gmB / gmA, 1 / (gmK + 1)) * 1000) / 1000;
  const gmMeans = Array.from({ length: gmK }, (_, i) =>
    Math.round(gmA * Math.pow(gmRatio, i + 1) * 100) / 100
  );

  // ── 6. GEOMETRIC SERIES CONTROLS ───────────────────────────────────────────
  const [gsA, setGsA] = useState<number>(2);
  const [gsR, setGsR] = useState<number>(2);
  const [gsN, setGsN] = useState<number>(5);

  const gsTerms = Array.from({ length: gsN }, (_, i) => gsA * Math.pow(gsR, i));
  const gsSum = gsR === 1
    ? gsA * gsN
    : (gsA * (Math.pow(gsR, gsN) - 1)) / (gsR - 1);

  // ── 7. PRACTICE CHALLENGE ──────────────────────────────────────────────────
  const [score, setScore] = useState<number>(0);
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const quizQuestions = [
    {
      qEn: 'In an AP, the first term is a = 5 and common difference d = 4. What is the 10th term (t₁₀)?',
      qNp: 'एउटा समानान्तर श्रेणी (AP) मा पहिलो पद a = ५ र साझा अन्तर d = ४ छ। १० औँ पद (t₁₀) कति हुन्छ?',
      options: ['37', '41', '45', '50'],
      correct: 1, // 5 + 9*4 = 41
      hintEn: 'Formula: t_n = a + (n - 1)d = 5 + (10 - 1) × 4 = 5 + 36 = 41.',
      hintNp: 'सूत्र: t_n = a + (n - 1)d = ५ + (१० - १) × ४ = ५ + ३६ = ४१।',
    },
    {
      qEn: 'Insert 1 Arithmetic Mean (A.M.) between 12 and 28. What is the mean?',
      qNp: '१२ र २८ को बीचमा १ वटा समानान्तर मध्यक (A.M.) पत्ता लगाउनुहोस्।',
      options: ['18', '20', '22', '24'],
      correct: 1, // (12+28)/2 = 20
      hintEn: 'Formula: A = (a + b) / 2 = (12 + 28) / 2 = 20.',
      hintNp: 'सूत्र: A = (a + b) / २ = (१२ + २८) / २ = २०।',
    },
    {
      qEn: 'Find the sum of first 8 terms of the AP: 2, 5, 8, 11, ...',
      qNp: 'समानान्तर श्रेणी: २, ५, ८, ११, ... को पहिलो ८ पदहरूको योगफल (S₈) निकाल्नुहोस्।',
      options: ['96', '100', '104', '112'],
      correct: 1, // n/2 [2a + (n-1)d] = 4 * [4 + 7*3] = 4 * 25 = 100
      hintEn: 'S_n = (n/2)[2a + (n-1)d] = (8/2)[2(2) + 7(3)] = 4[4 + 21] = 4 × 25 = 100.',
      hintNp: 'S_n = (n/२)[२a + (n-१)d] = (८/२)[२(२) + ७(३)] = ४[४ + २१] = ४ × २५ = १००।',
    },
    {
      qEn: 'In a GP, the first term a = 3 and common ratio r = 2. What is the 5th term (t₅)?',
      qNp: 'एउटा गुणोत्तर श्रेणी (GP) मा पहिलो पद a = ३ र साझा अनुपात r = २ छ। ५ औँ पद (t₅) कति हुन्छ?',
      options: ['24', '36', '48', '96'],
      correct: 2, // 3 * 2^4 = 3 * 16 = 48
      hintEn: 'Formula: t_n = a * r^(n-1) = 3 * 2^(5-1) = 3 * 16 = 48.',
      hintNp: 'सूत्र: t_n = a * r^(n-१) = ३ * २⁴ = ३ * १६ = ४८।',
    },
  ];

  const handleSelectAnswer = (idx: number) => {
    setSelectedAns(idx);
    const q = quizQuestions[quizIdx];
    if (idx === q.correct) {
      kit.good();
      setScore((prev) => prev + 10);
      setQuizFeedback(isNe ? 'सटीक उत्तर! धेरै राम्रो।' : 'Correct! Excellent problem solving.');
    } else {
      kit.oops();
      setQuizFeedback(isNe ? 'गलत उत्तर। संकेत हेरी पुन: प्रयास गर्नुहोस्।' : 'Incorrect. Check the hint and formula.');
    }
  };

  const handleNextQuiz = () => {
    kit.tap();
    setSelectedAns(null);
    setQuizFeedback(null);
    setQuizIdx((prev) => (prev + 1) % quizQuestions.length);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={10}
      mascotGreeting={L(
        'नमस्ते! कक्षा १० गणितको एकाइ ६: अनुक्रम र श्रेणी (Sequence and Series) प्रयोगशालामा स्वागत छ! यहाँ समानान्तर र गुणोत्तर अनुक्रम, मध्यक र योगफल प्रत्यक्ष अन्वेषण गर्नुहोस्!',
        'Welcome to Grade 10 Unit 6: Sequence and Series Pattern Laboratory! Explore Arithmetic and Geometric progressions, means, and series formulas interactively!'
      )}
    >
      {/* ── TOP NAV TABS ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          marginBottom: 16,
          background: '#FFFFFF',
          padding: 8,
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      >
        {[
          { id: 'arithmetic', np: '१. समानान्तर अनुक्रम (AP)', en: '1. Arithmetic AP' },
          { id: 'arithMeans', np: '२. समानान्तर मध्यक (AM)', en: '2. Arithmetic Means' },
          { id: 'arithSeries', np: '३. समानान्तर श्रेणी (Sum)', en: '3. AP Series Sum' },
          { id: 'geometric', np: '४. गुणोत्तर अनुक्रम (GP)', en: '4. Geometric GP' },
          { id: 'geomMeans', np: '५. गुणोत्तर मध्यक (GM)', en: '5. Geometric Means' },
          { id: 'geomSeries', np: '६. गुणोत्तर श्रेणी (Sum)', en: '6. GP Series Sum' },
          { id: 'challenge', np: '७. अभ्यास परीक्षा', en: '7. Practice Quiz' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                kit.tap();
                setActiveTab(tab.id as any);
              }}
              style={{
                flex: '1 1 auto',
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                transition: 'all 0.15s ease',
                background: isActive ? '#142D4E' : '#F1F5F9',
                color: isActive ? '#FFFFFF' : '#334155',
              }}
            >
              {isNe ? tab.np : tab.en}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 1: ARITHMETIC PROGRESSION (AP)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'arithmetic' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 20 }}>
          {/* Controls */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#142D4E' }}>
              {L('समानान्तर अनुक्रम नियन्त्रक', 'Arithmetic Progression Controls')}
            </h3>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('पहिलो पद (a):', 'First Term (a):')}
                </span>
                <span style={{ fontWeight: 700, color: '#167C80' }}>{fmt(apA)}</span>
              </div>
              <input
                type="range"
                min="-10"
                max="30"
                value={apA}
                onChange={(e) => setApA(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#167C80' }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('साझा अन्तर (d):', 'Common Difference (d):')}
                </span>
                <span style={{ fontWeight: 700, color: '#D9A441' }}>{fmt(apD)}</span>
              </div>
              <input
                type="range"
                min="-5"
                max="10"
                value={apD}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setApD(val === 0 ? 1 : val);
                }}
                style={{ width: '100%', accentColor: '#D9A441' }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('पद संख्या (n):', 'Number of Terms (n):')}
                </span>
                <span style={{ fontWeight: 700, color: '#142D4E' }}>{fmt(apN)}</span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                value={apN}
                onChange={(e) => setApN(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#142D4E' }}
              />
            </div>

            <div
              style={{
                background: '#F8FAFC',
                padding: 14,
                borderRadius: 8,
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontWeight: 700, color: '#142D4E', marginBottom: 6, fontSize: 13 }}>
                {L('सामान्य पद सूत्र (General Term Formula):', 'General Term Formula:')}
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 15,
                  color: '#167C80',
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                t_n = a + (n - 1)d
              </div>
              <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                <div>
                  t_{fmt(apN)} = {fmt(apA)} + ({fmt(apN)} - {fmt(1)}) × ({fmt(apD)})
                </div>
                <div>
                  t_{fmt(apN)} = {fmt(apA)} + {fmt((apN - 1) * apD)} ={' '}
                  <strong style={{ color: '#0F766E' }}>{fmt(apNthTerm)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Staircase & Sequence Display */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#142D4E' }}>
              {L('समानान्तर सिँढी चित्र (Arithmetic Staircase Representation)', 'Arithmetic Staircase Representation')}
            </h3>

            {/* SVG Visual */}
            <div
              style={{
                width: '100%',
                height: 240,
                background: '#F8FAFC',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <svg width="100%" height="240" viewBox="0 0 540 240">
                {/* Baseline */}
                <line x1="40" y1="200" x2="500" y2="200" stroke="#CBD5E1" strokeWidth="2" />

                {apTerms.map((val, idx) => {
                  const barW = Math.max(18, 380 / apTerms.length - 8);
                  const x = 50 + idx * ((460 - 50) / apTerms.length);
                  // Scale height: let minVal and maxVal fit in 150px
                  const minV = Math.min(0, ...apTerms);
                  const maxV = Math.max(1, ...apTerms);
                  const range = maxV - minV || 1;
                  const barH = Math.max(12, ((val - minV) / range) * 150);
                  const y = 200 - barH;

                  return (
                    <g key={idx}>
                      {/* Bar */}
                      <rect
                        x={x}
                        y={y}
                        width={barW}
                        height={barH}
                        rx={4}
                        fill={idx === apN - 1 ? '#D9A441' : '#167C80'}
                        opacity={0.88}
                      />
                      {/* Term label */}
                      <text
                        x={x + barW / 2}
                        y={y - 8}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="700"
                        fill="#1E293B"
                      >
                        {fmt(val)}
                      </text>
                      {/* Subscript t_idx */}
                      <text
                        x={x + barW / 2}
                        y={216}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="600"
                        fill="#64748B"
                      >
                        t_{fmt(idx + 1)}
                      </text>
                      {/* Step difference connector */}
                      {idx > 0 && (
                        <path
                          d={`M ${x - ((460 - 50) / apTerms.length - barW) / 2} ${200 - barH / 2} L ${x} ${200 - barH / 2}`}
                          stroke="#94A3B8"
                          strokeDasharray="2,2"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Sequence Display Tiles */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                {L('अनुक्रम पदहरू (Sequence Terms):', 'Sequence Terms:')}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {apTerms.map((t, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: idx === apN - 1 ? '#FEF3C7' : '#F1F5F9',
                      border: idx === apN - 1 ? '1.5px solid #D9A441' : '1px solid #CBD5E1',
                      borderRadius: 8,
                      padding: '8px 12px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 10, color: '#64748B', fontWeight: 600 }}>
                      t_{fmt(idx + 1)}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: idx === apN - 1 ? '#B45309' : '#0F766E',
                      }}
                    >
                      {fmt(t)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 2: ARITHMETIC MEANS (AM)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'arithMeans' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 20 }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#142D4E' }}>
              {L('समानान्तर मध्यक नियन्त्रक', 'Arithmetic Means Controls')}
            </h3>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('पहिलो पद (a):', 'First Term (a):')}
                </span>
                <span style={{ fontWeight: 700, color: '#167C80' }}>{fmt(amA)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={amA}
                onChange={(e) => setAmA(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#167C80' }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('अन्तिम पद (b):', 'Last Term (b):')}
                </span>
                <span style={{ fontWeight: 700, color: '#142D4E' }}>{fmt(amB)}</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={amB}
                onChange={(e) => setAmB(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#142D4E' }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('मध्यकहरूको सङ्ख्या (k):', 'Number of Means (k):')}
                </span>
                <span style={{ fontWeight: 700, color: '#D9A441' }}>{fmt(amK)}</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                value={amK}
                onChange={(e) => setAmK(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#D9A441' }}
              />
            </div>

            {/* Formula box */}
            <div
              style={{
                background: '#F8FAFC',
                padding: 14,
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                lineHeight: 1.6,
              }}
            >
              <div style={{ fontWeight: 700, color: '#142D4E', marginBottom: 4, fontSize: 13 }}>
                {L('साझा अन्तर सूत्र (Step Difference Formula):', 'Step Difference Formula:')}
              </div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#167C80' }}>
                d = (b - a) / (k + 1)
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                d = ({fmt(amB)} - {fmt(amA)}) / ({fmt(amK)} + {fmt(1)}) ={' '}
                <strong style={{ color: '#0F766E' }}>{fmt(Math.round(amD * 100) / 100)}</strong>
              </div>
            </div>
          </div>

          {/* Visual Number Line */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#142D4E' }}>
              {L('संख्या रेखामा समानान्तर मध्यक', 'Arithmetic Means on Number Line')}
            </h3>

            <div
              style={{
                width: '100%',
                height: 200,
                background: '#F8FAFC',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="100%" height="160" viewBox="0 0 540 160">
                {/* Main line */}
                <line x1="50" y1="80" x2="490" y2="80" stroke="#475569" strokeWidth="3" />
                <polygon points="495,80 485,74 485,86" fill="#475569" />
                <polygon points="45,80 55,74 55,86" fill="#475569" />

                {/* Point a */}
                <circle cx="70" cy="80" r="8" fill="#167C80" />
                <text x="70" y="55" textAnchor="middle" fontSize="12" fontWeight="700" fill="#167C80">
                  a = {fmt(amA)}
                </text>

                {/* Means */}
                {amMeans.map((m, idx) => {
                  const cx = 70 + ((idx + 1) * (470 - 70)) / (amK + 1);
                  return (
                    <g key={idx}>
                      <circle cx={cx} cy="80" r="7" fill="#D9A441" />
                      <text x={cx} y="55" textAnchor="middle" fontSize="11" fontWeight="700" fill="#B45309">
                        m_{fmt(idx + 1)} = {fmt(Math.round(m * 100) / 100)}
                      </text>
                      {/* Arc to show d */}
                      <path
                        d={`M ${cx - (400 / (amK + 1))} 80 Q ${cx - 200 / (amK + 1)} 108 ${cx} 80`}
                        fill="none"
                        stroke="#94A3B8"
                        strokeDasharray="2,2"
                      />
                      <text
                        x={cx - 200 / (amK + 1)}
                        y="125"
                        textAnchor="middle"
                        fontSize="10"
                        fill="#64748B"
                      >
                        +{fmt(Math.round(amD * 10) / 10)}
                      </text>
                    </g>
                  );
                })}

                {/* Point b */}
                <circle cx="470" cy="80" r="8" fill="#142D4E" />
                <text x="470" y="55" textAnchor="middle" fontSize="12" fontWeight="700" fill="#142D4E">
                  b = {fmt(amB)}
                </text>
              </svg>
            </div>

            {/* List of Inserted Means */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                {L('पत्ता लागेका मध्यकहरू (Computed Means):', 'Computed Means:')}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {amMeans.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#FEF3C7',
                      border: '1px solid #F59E0B',
                      borderRadius: 8,
                      padding: '8px 14px',
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#B45309', fontWeight: 600 }}>
                      m_{fmt(idx + 1)} = a + {fmt(idx + 1)}d
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#92400E' }}>
                      {fmt(Math.round(m * 100) / 100)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 3: ARITHMETIC SERIES SUM (Sn)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'arithSeries' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 20 }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#142D4E' }}>
              {L('समानान्तर श्रेणी योगफल नियन्त्रक', 'Arithmetic Series Controls')}
            </h3>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('पहिलो पद (a):', 'First Term (a):')}
                </span>
                <span style={{ fontWeight: 700, color: '#167C80' }}>{fmt(asA)}</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={asA}
                onChange={(e) => setAsA(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#167C80' }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('साझा अन्तर (d):', 'Common Difference (d):')}
                </span>
                <span style={{ fontWeight: 700, color: '#D9A441' }}>{fmt(asD)}</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                value={asD}
                onChange={(e) => setAsD(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#D9A441' }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('पद संख्या (n):', 'Number of Terms (n):')}
                </span>
                <span style={{ fontWeight: 700, color: '#142D4E' }}>{fmt(asN)}</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                value={asN}
                onChange={(e) => setAsN(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#142D4E' }}
              />
            </div>

            {/* Sum Box */}
            <div
              style={{
                background: '#ECFDF5',
                padding: 16,
                borderRadius: 10,
                border: '1.5px solid #10B981',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
                {L('पहिलो n पदहरूको योगफल (Total Sum Sn)', 'Sum of First n Terms (Sn)')}
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#065F46', margin: '4px 0' }}>
                {fmt(asSum)}
              </div>
              <div style={{ fontSize: 11, color: '#047857' }}>
                S_{fmt(asN)} = ({fmt(asN)}/२) × [{fmt(asA)} + {fmt(asLastTerm)}] = {fmt(asSum)}
              </div>
            </div>
          </div>

          {/* Visual Pair-Up & Accumulation */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#142D4E' }}>
              {L('गौसको जोडी विधि र संचय (Gauss Pair Trick & Accumulation)', 'Gauss Pair Trick & Accumulation')}
            </h3>

            {/* Expression */}
            <div
              style={{
                background: '#F8FAFC',
                padding: 12,
                borderRadius: 8,
                fontSize: 14,
                color: '#334155',
                marginBottom: 16,
              }}
            >
              <strong>S_{fmt(asN)}</strong> = {asTerms.map((t) => fmt(t)).join(' + ')} ={' '}
              <strong style={{ color: '#059669' }}>{fmt(asSum)}</strong>
            </div>

            {/* Pair up visualization */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                {L('पहिलो र अन्तिम पदको जोडी (First + Last Pair):', 'First + Last Pair Concept:')}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: '#F1F5F9',
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                <div style={{ padding: '6px 12px', background: '#FFFFFF', borderRadius: 6, fontWeight: 700 }}>
                  t₁ = {fmt(asA)}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#94A3B8' }}>+</div>
                <div style={{ padding: '6px 12px', background: '#FFFFFF', borderRadius: 6, fontWeight: 700 }}>
                  t_{fmt(asN)} = {fmt(asLastTerm)}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#94A3B8' }}>=</div>
                <div
                  style={{
                    padding: '6px 12px',
                    background: '#FEF3C7',
                    borderRadius: 6,
                    fontWeight: 800,
                    color: '#B45309',
                  }}
                >
                  {fmt(asA + asLastTerm)}
                </div>
                <span style={{ fontSize: 12, color: '#64748B' }}>
                  ({fmt(asN / 2)} {L('वटा जोडीहरू', 'pairs')})
                </span>
              </div>
            </div>

            {/* Visual Bar Heights Sum */}
            <div
              style={{
                marginTop: 18,
                width: '100%',
                height: 140,
                background: '#F8FAFC',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '0 20px 20px',
                gap: 8,
              }}
            >
              {asTerms.map((t, i) => {
                const maxVal = asLastTerm || 1;
                const h = Math.max(16, (t / maxVal) * 95);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#0F766E', marginBottom: 2 }}>
                      {fmt(t)}
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: h,
                        background: '#0D9488',
                        borderRadius: 4,
                      }}
                    />
                    <div style={{ fontSize: 9, color: '#64748B', marginTop: 4 }}>
                      t_{fmt(i + 1)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 4: GEOMETRIC PROGRESSION (GP)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'geometric' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 20 }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#142D4E' }}>
              {L('गुणोत्तर अनुक्रम नियन्त्रक', 'Geometric Progression Controls')}
            </h3>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('पहिलो पद (a):', 'First Term (a):')}
                </span>
                <span style={{ fontWeight: 700, color: '#167C80' }}>{fmt(gpA)}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={gpA}
                onChange={(e) => setGpA(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#167C80' }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('साझा अनुपात (r):', 'Common Ratio (r):')}
                </span>
                <span style={{ fontWeight: 700, color: '#D9A441' }}>{fmt(gpR)}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[0.5, 2, 3].map((rVal) => (
                  <button
                    key={rVal}
                    onClick={() => setGpR(rVal)}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: 'none',
                      background: gpR === rVal ? '#D9A441' : '#F1F5F9',
                      color: gpR === rVal ? '#FFFFFF' : '#334155',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    r = {fmt(rVal)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('पद संख्या (n):', 'Number of Terms (n):')}
                </span>
                <span style={{ fontWeight: 700, color: '#142D4E' }}>{fmt(gpN)}</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                value={gpN}
                onChange={(e) => setGpN(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#142D4E' }}
              />
            </div>

            <div
              style={{
                background: '#F8FAFC',
                padding: 14,
                borderRadius: 8,
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontWeight: 700, color: '#142D4E', marginBottom: 6, fontSize: 13 }}>
                {L('सामान्य पद सूत्र (GP nth Term Formula):', 'GP nth Term Formula:')}
              </div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 15,
                  color: '#167C80',
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                t_n = a · r^(n - 1)
              </div>
              <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                <div>
                  t_{fmt(gpN)} = {fmt(gpA)} × ({fmt(gpR)})^{fmt(gpN - 1)}
                </div>
                <div>
                  t_{fmt(gpN)} ={' '}
                  <strong style={{ color: '#0F766E' }}>{fmt(Math.round(gpNthTerm * 100) / 100)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Exponential Curve */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#142D4E' }}>
              {L('घाताङ्कीय वृद्धि वक्र (Exponential Growth Curve)', 'Exponential Growth Curve')}
            </h3>

            <div
              style={{
                width: '100%',
                height: 220,
                background: '#F8FAFC',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="100%" height="220" viewBox="0 0 540 220">
                {/* Axes */}
                <line x1="50" y1="180" x2="500" y2="180" stroke="#CBD5E1" strokeWidth="2" />
                <line x1="50" y1="20" x2="50" y2="180" stroke="#CBD5E1" strokeWidth="2" />

                {/* Points and curve */}
                {gpTerms.map((t, idx) => {
                  const maxVal = Math.max(...gpTerms, 1);
                  const cx = 70 + (idx * 400) / (gpN - 1 || 1);
                  const cy = 180 - Math.min(150, (t / maxVal) * 150);

                  return (
                    <g key={idx}>
                      <circle cx={cx} cy={cy} r="6" fill="#D9A441" />
                      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill="#B45309">
                        {fmt(Math.round(t * 100) / 100)}
                      </text>
                      <text x={cx} y="196" textAnchor="middle" fontSize="10" fill="#64748B">
                        t_{fmt(idx + 1)}
                      </text>
                    </g>
                  );
                })}

                {/* Connecting Polyline */}
                <polyline
                  fill="none"
                  stroke="#D9A441"
                  strokeWidth="2.5"
                  strokeDasharray="4,2"
                  points={gpTerms
                    .map((t, idx) => {
                      const maxVal = Math.max(...gpTerms, 1);
                      const cx = 70 + (idx * 400) / (gpN - 1 || 1);
                      const cy = 180 - Math.min(150, (t / maxVal) * 150);
                      return `${cx},${cy}`;
                    })
                    .join(' ')}
                />
              </svg>
            </div>

            {/* Sequence Tiles */}
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                {L('गुणोत्तर पदहरू (Geometric Terms):', 'Geometric Terms:')}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {gpTerms.map((t, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      borderRadius: 8,
                      padding: '8px 12px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 10, color: '#3B82F6', fontWeight: 600 }}>
                      t_{fmt(idx + 1)}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#1D4ED8' }}>
                      {fmt(Math.round(t * 100) / 100)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 5: GEOMETRIC MEANS (GM)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'geomMeans' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 20 }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#142D4E' }}>
              {L('गुणोत्तर मध्यक नियन्त्रक', 'Geometric Means Controls')}
            </h3>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('पहिलो पद (a):', 'First Term (a):')}
                </span>
                <span style={{ fontWeight: 700, color: '#167C80' }}>{fmt(gmA)}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={gmA}
                onChange={(e) => setGmA(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#167C80' }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('अन्तिम पद (b):', 'Last Term (b):')}
                </span>
                <span style={{ fontWeight: 700, color: '#142D4E' }}>{fmt(gmB)}</span>
              </div>
              <input
                type="range"
                min="16"
                max="162"
                value={gmB}
                onChange={(e) => setGmB(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#142D4E' }}
              />
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('मध्यकहरूको सङ्ख्या (k):', 'Number of Means (k):')}
                </span>
                <span style={{ fontWeight: 700, color: '#D9A441' }}>{fmt(gmK)}</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                value={gmK}
                onChange={(e) => setGmK(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#D9A441' }}
              />
            </div>

            {/* Formula box */}
            <div
              style={{
                background: '#F8FAFC',
                padding: 14,
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                lineHeight: 1.6,
              }}
            >
              <div style={{ fontWeight: 700, color: '#142D4E', marginBottom: 4, fontSize: 13 }}>
                {L('साझा अनुपात सूत्र (Common Ratio Formula):', 'Common Ratio Formula:')}
              </div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#167C80' }}>
                r = (b / a)^(1 / (k + 1))
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                r = ({fmt(gmB)} / {fmt(gmA)})^(१ / {fmt(gmK + 1)}) ={' '}
                <strong style={{ color: '#0F766E' }}>{fmt(gmRatio)}</strong>
              </div>
            </div>
          </div>

          {/* Visual Display */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#142D4E' }}>
              {L('गुणोत्तर मध्यकहरूको अनुक्रम (Geometric Progression of Means)', 'Geometric Progression of Means')}
            </h3>

            <div
              style={{
                padding: 20,
                background: '#F8FAFC',
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>a</div>
                <div
                  style={{
                    padding: '10px 16px',
                    background: '#167C80',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {fmt(gmA)}
                </div>
              </div>

              {gmMeans.map((m, idx) => (
                <React.Fragment key={idx}>
                  <div style={{ fontSize: 18, color: '#94A3B8', fontWeight: 700 }}>×{fmt(gmRatio)} →</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: '#B45309', fontWeight: 600 }}>m_{fmt(idx + 1)}</div>
                    <div
                      style={{
                        padding: '10px 16px',
                        background: '#FEF3C7',
                        border: '1.5px solid #F59E0B',
                        color: '#92400E',
                        borderRadius: 8,
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {fmt(m)}
                    </div>
                  </div>
                </React.Fragment>
              ))}

              <div style={{ fontSize: 18, color: '#94A3B8', fontWeight: 700 }}>×{fmt(gmRatio)} →</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>b</div>
                <div
                  style={{
                    padding: '10px 16px',
                    background: '#142D4E',
                    color: '#FFFFFF',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 16,
                  }}
                >
                  {fmt(gmB)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 6: GEOMETRIC SERIES SUM (Sn)
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'geomSeries' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: 20 }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#142D4E' }}>
              {L('गुणोत्तर श्रेणी योगफल नियन्त्रक', 'Geometric Series Controls')}
            </h3>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('पहिलो पद (a):', 'First Term (a):')}
                </span>
                <span style={{ fontWeight: 700, color: '#167C80' }}>{fmt(gsA)}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={gsA}
                onChange={(e) => setGsA(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#167C80' }}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('साझा अनुपात (r):', 'Common Ratio (r):')}
                </span>
                <span style={{ fontWeight: 700, color: '#D9A441' }}>{fmt(gsR)}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[2, 3, 0.5].map((rVal) => (
                  <button
                    key={rVal}
                    onClick={() => setGsR(rVal)}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: 'none',
                      background: gsR === rVal ? '#D9A441' : '#F1F5F9',
                      color: gsR === rVal ? '#FFFFFF' : '#334155',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    r = {fmt(rVal)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {L('पद संख्या (n):', 'Number of Terms (n):')}
                </span>
                <span style={{ fontWeight: 700, color: '#142D4E' }}>{fmt(gsN)}</span>
              </div>
              <input
                type="range"
                min="2"
                max="8"
                value={gsN}
                onChange={(e) => setGsN(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#142D4E' }}
              />
            </div>

            {/* Sum Result */}
            <div
              style={{
                background: '#FEF3C7',
                padding: 16,
                borderRadius: 10,
                border: '1.5px solid #F59E0B',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>
                {L('गुणोत्तर श्रेणी योगफल (GP Series Sum)', 'GP Series Sum')}
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#92400E', margin: '4px 0' }}>
                {fmt(Math.round(gsSum * 100) / 100)}
              </div>
              <div style={{ fontSize: 11, color: '#B45309' }}>
                {gsR > 1 ? 'S_n = a(r^n - 1) / (r - 1)' : 'S_n = a(1 - r^n) / (1 - r)'}
              </div>
            </div>
          </div>

          {/* Cumulative Visual */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              padding: 18,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#142D4E' }}>
              {L('श्रेणी विस्तार तथा संचय (Series Expansion)', 'Series Expansion')}
            </h3>

            <div
              style={{
                background: '#F8FAFC',
                padding: 12,
                borderRadius: 8,
                fontSize: 14,
                color: '#334155',
                marginBottom: 16,
              }}
            >
              <strong>S_{fmt(gsN)}</strong> = {gsTerms.map((t) => fmt(Math.round(t * 100) / 100)).join(' + ')} ={' '}
              <strong style={{ color: '#D97706' }}>{fmt(Math.round(gsSum * 100) / 100)}</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {gsTerms.map((t, idx) => {
                const partialSum = gsTerms.slice(0, idx + 1).reduce((acc, curr) => acc + curr, 0);
                const percent = Math.min(100, (partialSum / gsSum) * 100);

                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 45, fontSize: 11, fontWeight: 700, color: '#64748B' }}>
                      S_{fmt(idx + 1)}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 22,
                        background: '#E2E8F0',
                        borderRadius: 6,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${percent}%`,
                          height: '100%',
                          background: '#F59E0B',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                    <div style={{ width: 70, textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#1E293B' }}>
                      {fmt(Math.round(partialSum * 100) / 100)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          TAB 7: PRACTICE CHALLENGE / QUIZ
      ══════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'challenge' && (
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 14,
              padding: 24,
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#167C80', textTransform: 'uppercase' }}>
                {L(`प्रश्न ${fmt(quizIdx + 1)} / ${fmt(quizQuestions.length)}`, `Question ${fmt(quizIdx + 1)} of ${fmt(quizQuestions.length)}`)}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#D9A441' }}>
                {L(`अङ्क: ${fmt(score)}`, `Score: ${fmt(score)}`)}
              </div>
            </div>

            <h3 style={{ margin: '0 0 18px', fontSize: 17, color: '#142D4E', lineHeight: 1.5 }}>
              {isNe ? quizQuestions[quizIdx].qNp : quizQuestions[quizIdx].qEn}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {quizQuestions[quizIdx].options.map((opt, oIdx) => {
                const isSelected = selectedAns === oIdx;
                const isCorrect = oIdx === quizQuestions[quizIdx].correct;
                let bg = '#F8FAFC';
                let border = '1px solid #CBD5E1';

                if (selectedAns !== null) {
                  if (isSelected && isCorrect) {
                    bg = '#ECFDF5';
                    border = '2px solid #10B981';
                  } else if (isSelected && !isCorrect) {
                    bg = '#FEF2F2';
                    border = '2px solid #EF4444';
                  } else if (isCorrect) {
                    bg = '#ECFDF5';
                    border = '2px solid #10B981';
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectAnswer(oIdx)}
                    disabled={selectedAns !== null}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 10,
                      background: bg,
                      border: border,
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#1E293B',
                      cursor: selectedAns === null ? 'pointer' : 'default',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {fmt(opt)}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Hint */}
            {quizFeedback && (
              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  marginBottom: 16,
                  background: selectedAns === quizQuestions[quizIdx].correct ? '#ECFDF5' : '#FEF2F2',
                  border:
                    selectedAns === quizQuestions[quizIdx].correct ? '1px solid #10B981' : '1px solid #EF4444',
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: selectedAns === quizQuestions[quizIdx].correct ? '#047857' : '#B91C1C',
                    marginBottom: 4,
                  }}
                >
                  {quizFeedback}
                </div>
                <div style={{ fontSize: 12, color: '#475569' }}>
                  {isNe ? quizQuestions[quizIdx].hintNp : quizQuestions[quizIdx].hintEn}
                </div>
              </div>
            )}

            {selectedAns !== null && (
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={handleNextQuiz}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#142D4E',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {L('अर्को प्रश्न →', 'Next Question →')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </SimFrame2D>
  );
};

export default SequenceSeriesLab;

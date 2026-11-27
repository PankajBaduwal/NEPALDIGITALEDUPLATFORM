import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

const QUIZ_QUESTIONS = [
  {
    np: 'दुई त्रिभुजहरू समरूप (Similar) हुनका लागि कुन सर्त पूरा हुनुपर्छ?',
    en: 'Which condition must be met for two triangles to be similar?',
    options: [
      { key: 'A', label: 'अनुरुप कोणहरू बराबर र अनुरुप भुजाहरू समानुपातिक हुनुपर्छ' },
      { key: 'B', label: 'भुजाहरूको नाप बराबर हुनुपर्छ' },
      { key: 'C', label: 'क्षेत्रफल बराबर हुनुपर्छ' },
      { key: 'D', label: 'कुनै सर्त आवश्यक छैन' },
    ],
    answer: 'A',
  },
  {
    np: 'आधारभूत समानुपातिकता साध्य (Basic Proportionality Theorem / Thales Theorem) अनुसार △ABC मा भुजा BC सँग समानान्तर रेखा EF खिच्दा के हुन्छ?',
    en: 'According to Basic Proportionality Theorem, in △ABC if EF is parallel to BC, what holds true?',
    options: [
      { key: 'A', label: 'AE / EB = AF / FC' },
      { key: 'B', label: 'AE + EB = AF + FC' },
      { key: 'C', label: 'AE = AF' },
      { key: 'D', label: 'EB = FC' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि २ मिटर अग्लो खम्बाको छायाँ ३ मिटर पर्छ भने, सोही समयमा १५ मिटर छायाँ पर्ने रुखको उचाइ कति होला?',
    en: "If a 2m high pole casts a 3m shadow, what is the height of a tree casting a 15m shadow at the same time?",
    options: [
      { key: 'A', label: '10 मिटर (10m)' },
      { key: 'B', label: '12 मिटर' },
      { key: 'C', label: '8 मिटर' },
      { key: 'D', label: '15 मिटर' },
    ],
    answer: 'A',
  },
];

export const SimilarTriangleLaboratory: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U13-02',
    chapter: 13,
    titleNp: 'समरूप त्रिभुज प्रयोगशाला',
    titleEn: 'Similar Triangle Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'similar_scale' | 'thales' | 'shadow_app'>('similar_scale');

  // Tab 1: Similar Triangle Scale Slider
  const [scaleK, setScaleK] = useState<number>(1.5);
  // Base triangle ABC
  const baseSides = { a: 4, b: 5, c: 6 }; // BC, CA, AB
  const scaledSides = {
    a: (baseSides.a * scaleK).toFixed(1),
    b: (baseSides.b * scaleK).toFixed(1),
    c: (baseSides.c * scaleK).toFixed(1),
  };

  // Tab 2: Thales / Basic Proportionality Theorem
  const [splitRatio, setSplitRatio] = useState<number>(0.6); // AE / AB
  const totalAB = 10;
  const totalAC = 8;
  const lenAE = (totalAB * splitRatio).toFixed(1);
  const lenEB = (totalAB * (1 - splitRatio)).toFixed(1);
  const lenAF = (totalAC * splitRatio).toFixed(1);
  const lenFC = (totalAC * (1 - splitRatio)).toFixed(1);
  const ratio1 = (Number(lenAE) / Number(lenEB)).toFixed(2);
  const ratio2 = (Number(lenAF) / Number(lenFC)).toFixed(2);

  // Tab 3: Shadow Tree Height Application
  const [poleHeight, setPoleHeight] = useState<number>(2); // meters
  const [poleShadow, setPoleShadow] = useState<number>(3); // meters
  const [treeShadow, setTreeShadow] = useState<number>(15); // meters
  const treeHeight = ((poleHeight * treeShadow) / poleShadow).toFixed(1);

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! समरूप त्रिभुजका अनुरुप कोणहरू र समानुपातिक भुजाहरू, आधारभूत समानुपातिकता साध्य (थाल्सको साध्य) र छायाँबाट रुखको उचाइ पत्ता लगाउने विधि यहाँ प्रत्यक्ष परीक्षण गर्नुहोस्!',
        'Welcome! Explore similar triangle properties, Thales theorem (parallel lines dividing sides proportionally), and real-life shadow height measurement!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('similar_scale')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: activeTab === 'similar_scale' ? '2px solid #2563EB' : '1px solid #CBD5E1',
              backgroundColor: activeTab === 'similar_scale' ? '#EFF6FF' : '#FFFFFF',
              color: activeTab === 'similar_scale' ? '#1D4ED8' : '#475569',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            🔺 {L('समरूप त्रिभुज र अनुपात (Scale & Sides)', 'Similar Triangles & Ratio')}
          </button>
          <button
            onClick={() => setActiveTab('thales')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: activeTab === 'thales' ? '2px solid #0D9488' : '1px solid #CBD5E1',
              backgroundColor: activeTab === 'thales' ? '#F0FDFA' : '#FFFFFF',
              color: activeTab === 'thales' ? '#0F766E' : '#475569',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            📏 {L('समानुपातिकता साध्य (Thales Theorem)', 'Basic Proportionality Theorem')}
          </button>
          <button
            onClick={() => setActiveTab('shadow_app')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: activeTab === 'shadow_app' ? '2px solid #D97706' : '1px solid #CBD5E1',
              backgroundColor: activeTab === 'shadow_app' ? '#FFFBEB' : '#FFFFFF',
              color: activeTab === 'shadow_app' ? '#B45309' : '#475569',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            🌳 {L('रुखको उचाइ पत्ता लगाउने (Shadow App)', 'Tree Height via Shadow')}
          </button>
        </div>

        {/* Tab 1: Similar Triangle Scale & Side Ratio */}
        {activeTab === 'similar_scale' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 13, color: '#1E293B' }}>
                  {L('स्केल फ्याक्टर (Scale Factor k) नियन्त्रण:', 'Scale Factor (k) Control:')}
                </strong>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#2563EB', fontFamily: 'monospace' }}>
                  k = {fmt(scaleK.toFixed(1))}
                </span>
              </div>
              <input
                type="range"
                min={0.8}
                max={2.5}
                step={0.1}
                value={scaleK}
                onChange={(e) => setScaleK(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#2563EB' }}
              />
            </div>

            {/* Visual Side-by-Side SVG Triangles */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #CBD5E1',
                padding: 16,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <svg width={480} height={200} style={{ backgroundColor: '#F8FAFC', borderRadius: 8 }}>
                {/* Triangle 1 (Base ABC) */}
                <g transform="translate(40, 20)">
                  <polygon points="60,20 20,130 130,130" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
                  <text x="60" y="14" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1E40AF">
                    A
                  </text>
                  <text x="10" y="142" fontSize="12" fontWeight="800" fill="#1E40AF">
                    B
                  </text>
                  <text x="135" y="142" fontSize="12" fontWeight="800" fill="#1E40AF">
                    C
                  </text>
                  <text x="75" y="145" fontSize="10" fill="#1E3A8A">
                    a = 4 cm
                  </text>
                  <text x="15" y="75" fontSize="10" fill="#1E3A8A">
                    c = 6 cm
                  </text>
                  <text x="105" y="75" fontSize="10" fill="#1E3A8A">
                    b = 5 cm
                  </text>
                  <text x="60" y="175" textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155">
                    △ABC
                  </text>
                </g>

                {/* Similarity Symbol */}
                <text x="220" y="100" fontSize="28" fontWeight="800" fill="#0D9488" textAnchor="middle">
                  ~
                </text>

                {/* Triangle 2 (Scaled DEF) */}
                <g transform={`translate(${270 - (scaleK - 1) * 20}, ${20 - (scaleK - 1) * 10})`}>
                  <polygon
                    points={`${60 * scaleK},${20 * scaleK} ${20 * scaleK},${130 * scaleK} ${130 * scaleK},${130 * scaleK}`}
                    fill="#CCFBF1"
                    stroke="#0F766E"
                    strokeWidth="2"
                  />
                  <text x={60 * scaleK} y={15 * scaleK} textAnchor="middle" fontSize="12" fontWeight="800" fill="#0F766E">
                    D
                  </text>
                  <text x={10 * scaleK} y={140 * scaleK} fontSize="12" fontWeight="800" fill="#0F766E">
                    E
                  </text>
                  <text x={135 * scaleK} y={140 * scaleK} fontSize="12" fontWeight="800" fill="#0F766E">
                    F
                  </text>
                  <text x={60 * scaleK} y={170 * scaleK} textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155">
                    △DEF
                  </text>
                </g>
              </svg>
            </div>

            {/* Proportionality Proof Box */}
            <div
              style={{
                backgroundColor: '#F0FDF4',
                borderRadius: 12,
                border: '1px solid #86EFAC',
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <strong style={{ fontSize: 13, color: '#065F46' }}>
                {L('अनुरुप भुजाहरूको समानुपातिकता (Side Proportionality):', 'Side Proportionality Ratio:')}
              </strong>
              <div style={{ fontFamily: 'monospace', fontSize: 15, color: '#065F46' }}>
                DE/AB = {fmt(scaledSides.c)}/६ = {fmt(scaleK.toFixed(1))} | EF/BC = {fmt(scaledSides.a)}/४ = {fmt(scaleK.toFixed(1))} | DF/AC = {fmt(scaledSides.b)}/५ = {fmt(scaleK.toFixed(1))}
              </div>
              <div style={{ fontSize: 12, color: '#166534', fontWeight: 700 }}>
                ✓ {L('सबै अनुरुप भुजाहरूको अनुपात बराबर छ (समानुपातिक): DE/AB = EF/BC = DF/AC = k', 'All corresponding sides are proportional: DE/AB = EF/BC = DF/AC = k')}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Basic Proportionality Theorem (Thales) */}
        {activeTab === 'thales' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 13, color: '#1E293B' }}>
                  {L('समानान्तर रेखा EF को स्थान (Slider):', 'Position of Parallel Line EF:')}
                </strong>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0D9488' }}>
                  AE/AB = {fmt((splitRatio * 100).toFixed(0))}%
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={0.8}
                step={0.05}
                value={splitRatio}
                onChange={(e) => setSplitRatio(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#0D9488' }}
              />
            </div>

            {/* Thales Theorem SVG */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #CBD5E1',
                padding: 16,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <svg width={420} height={220} style={{ backgroundColor: '#F8FAFC', borderRadius: 8 }}>
                {/* Big Triangle ABC */}
                <polygon points="210,30 90,190 330,190" fill="#F0FDFA" stroke="#0F766E" strokeWidth="2" />
                <text x="210" y="22" textAnchor="middle" fontSize="13" fontWeight="800" fill="#0F766E">
                  A
                </text>
                <text x="80" y="200" fontSize="13" fontWeight="800" fill="#0F766E">
                  B
                </text>
                <text x="335" y="200" fontSize="13" fontWeight="800" fill="#0F766E">
                  C
                </text>

                {/* Parallel line EF */}
                {(() => {
                  const yEF = 30 + (190 - 30) * splitRatio;
                  const xE = 210 + (90 - 210) * splitRatio;
                  const xF = 210 + (330 - 210) * splitRatio;
                  return (
                    <g>
                      <line x1={xE} y1={yEF} x2={xF} y2={yEF} stroke="#D97706" strokeWidth="2.5" />
                      <circle cx={xE} cy={yEF} r="4" fill="#D97706" />
                      <circle cx={xF} cy={yEF} r="4" fill="#D97706" />
                      <text x={xE - 14} y={yEF + 4} fontSize="12" fontWeight="800" fill="#B45309">
                        E
                      </text>
                      <text x={xF + 8} y={yEF + 4} fontSize="12" fontWeight="800" fill="#B45309">
                        F
                      </text>
                      <text x="210" y={yEF - 6} textAnchor="middle" fontSize="11" fill="#B45309" fontWeight="700">
                        EF // BC
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Thales Ratio Box */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 14,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <div style={{ backgroundColor: '#FFFFFF', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 12, color: '#64748B' }}>{L('बायाँ भागको अनुपात:', 'Left Side Ratio:')}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#0F766E', marginTop: 4 }}>
                  AE / EB = {fmt(lenAE)} / {fmt(lenEB)} = <strong>{fmt(ratio1)}</strong>
                </div>
              </div>
              <div style={{ backgroundColor: '#FFFFFF', padding: 10, borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 12, color: '#64748B' }}>{L('दायाँ भागको अनुपात:', 'Right Side Ratio:')}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#0F766E', marginTop: 4 }}>
                  AF / FC = {fmt(lenAF)} / {fmt(lenFC)} = <strong>{fmt(ratio2)}</strong>
                </div>
              </div>
            </div>

            <div style={{ padding: '8px 12px', backgroundColor: '#ECFDF5', borderRadius: 8, color: '#065F46', fontSize: 12, fontWeight: 700 }}>
              ✓ {L('प्रमाणित: AE / EB = AF / FC (थाल्सको साध्य अनुसार भुजालाई समान अनुपातमा विभाजन गर्दछ)।', 'Verified: AE / EB = AF / FC (Thales theorem proves line parallel to base divides other sides proportionally).')}
            </div>
          </div>
        )}

        {/* Tab 3: Shadow Height Application */}
        {activeTab === 'shadow_app' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 16,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 14,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569' }}>
                  <span>{L('खम्बाको उचाइ:', 'Pole Height:')}</span>
                  <strong>{fmt(poleHeight)} m</strong>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.5}
                  value={poleHeight}
                  onChange={(e) => setPoleHeight(Number(e.target.value))}
                  style={{ width: '100%', marginTop: 6, accentColor: '#D97706' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569' }}>
                  <span>{L('खम्बाको छायाँ:', 'Pole Shadow:')}</span>
                  <strong>{fmt(poleShadow)} m</strong>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={0.5}
                  value={poleShadow}
                  onChange={(e) => setPoleShadow(Number(e.target.value))}
                  style={{ width: '100%', marginTop: 6, accentColor: '#D97706' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569' }}>
                  <span>{L('रुखको छायाँ:', 'Tree Shadow:')}</span>
                  <strong>{fmt(treeShadow)} m</strong>
                </div>
                <input
                  type="range"
                  min={6}
                  max={25}
                  step={1}
                  value={treeShadow}
                  onChange={(e) => setTreeShadow(Number(e.target.value))}
                  style={{ width: '100%', marginTop: 6, accentColor: '#D97706' }}
                />
              </div>
            </div>

            {/* Tree vs Pole Visual SVG */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #CBD5E1',
                padding: 14,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <svg width={460} height={180} style={{ backgroundColor: '#F8FAFC', borderRadius: 8 }}>
                {/* Ground */}
                <line x1={20} y1={150} x2={440} y2={150} stroke="#475569" strokeWidth="2" />

                {/* Pole Group */}
                <g transform="translate(60, 0)">
                  {/* Pole */}
                  <line x1={0} y1={150} x2={0} y2={150 - poleHeight * 15} stroke="#3B82F6" strokeWidth="4" />
                  {/* Sun ray hypotenuse */}
                  <line x1={0} y1={150 - poleHeight * 15} x2={poleShadow * 15} y2={150} stroke="#F59E0B" strokeDasharray="3,3" />
                  {/* Shadow ground line */}
                  <line x1={0} y1={150} x2={poleShadow * 15} y2={150} stroke="#64748B" strokeWidth="3" />
                  <text x={-10} y={150 - (poleHeight * 15) / 2} fontSize="11" fill="#1D4ED8" textAnchor="end">
                    {fmt(poleHeight)}m
                  </text>
                  <text x={(poleShadow * 15) / 2} y={166} fontSize="11" fill="#475569" textAnchor="middle">
                    {fmt(poleShadow)}m
                  </text>
                  <text x={0} y={175} fontSize="11" fontWeight="700" fill="#1E293B">
                    {L('खम्बा (Pole)', 'Pole')}
                  </text>
                </g>

                {/* Tree Group */}
                <g transform="translate(220, 0)">
                  {/* Tree Trunk */}
                  <line x1={0} y1={150} x2={0} y2={Math.max(20, 150 - Number(treeHeight) * 10)} stroke="#15803D" strokeWidth="6" />
                  {/* Tree Crown */}
                  <circle cx={0} cy={Math.max(20, 150 - Number(treeHeight) * 10)} r="18" fill="#22C55E" />
                  {/* Sun ray */}
                  <line x1={0} y1={Math.max(20, 150 - Number(treeHeight) * 10)} x2={Math.min(200, treeShadow * 10)} y2={150} stroke="#F59E0B" strokeDasharray="3,3" />
                  {/* Shadow */}
                  <line x1={0} y1={150} x2={Math.min(200, treeShadow * 10)} y2={150} stroke="#64748B" strokeWidth="4" />
                  <text x={-12} y={80} fontSize="12" fontWeight="800" fill="#15803D" textAnchor="end">
                    H = ?
                  </text>
                  <text x={treeShadow * 5} y={166} fontSize="11" fill="#475569" textAnchor="middle">
                    {fmt(treeShadow)}m
                  </text>
                  <text x={0} y={175} fontSize="11" fontWeight="700" fill="#1E293B">
                    {L('रुख (Tree)', 'Tree')}
                  </text>
                </g>
              </svg>
            </div>

            {/* Height Calculation Result */}
            <div
              style={{
                backgroundColor: '#FFFBEB',
                borderRadius: 12,
                border: '2px solid #FCD34D',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>
                {L('समरूप त्रिभुजद्वारा रुखको उचाइ गणना:', 'Tree Height Calculation via Similar Triangles:')}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 16, color: '#B45309' }}>
                रुखको उचाइ (H) / खम्बाको उचाइ = रुखको छायाँ / खम्बाको छायाँ
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 800, color: '#B45309' }}>
                H = ({fmt(poleHeight)} × {fmt(treeShadow)}) ÷ {fmt(poleShadow)} ={' '}
                <span style={{ color: '#047857', fontSize: 22 }}>{fmt(treeHeight)} मिटर (m)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default SimilarTriangleLaboratory;

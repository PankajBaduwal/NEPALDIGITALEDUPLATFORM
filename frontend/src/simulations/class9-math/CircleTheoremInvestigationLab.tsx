import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface ProofStep {
  statement: string;
  reason: string;
  missing: boolean;
  options?: string[];
  correctAnswer?: string;
}

const THEOREM_1_STEPS: ProofStep[] = [
  {
    statement: 'Construction: join OA and OB.',
    reason: 'By construction',
    missing: false,
  },
  {
    statement: 'In right triangles △OMA and △OMB:',
    reason: 'Comparing (in right triangles △OMA and △OMB)',
    missing: false,
  },
  {
    statement: '(i) Hypotenuse OA = hypotenuse OB',
    reason: 'Radii of the same circle',
    missing: true,
    options: [
      'Radii of the same circle',
      'Common sides',
      'Diameters',
    ],
    correctAnswer: 'Radii of the same circle',
  },
  {
    statement: '(ii) OM = OM',
    reason: 'Common side',
    missing: false,
  },
  {
    statement: '(iii) ∠OMA = ∠OMB = 90°',
    reason: 'OM ⊥ AB given (perpendicular)',
    missing: false,
  },
  {
    statement: '△OMA ≅ △OMB',
    reason: 'क.भु.स. (R.H.S.) अनुरुपता सर्त अनुसार',
    missing: true,
    options: ['R.H.S. condition', 'S.S.S. condition', 'A.A.A. condition'],
    correctAnswer: 'R.H.S. condition',
  },
  {
    statement: 'Therefore AM = MB',
    reason: 'Corresponding sides of congruent triangles',
    missing: true,
    options: [
      'Corresponding sides of congruent triangles',
      'Vertically opposite sides',
      'As given',
    ],
    correctAnswer: 'Corresponding sides of congruent triangles',
  },
];

const QUIZ_QUESTIONS = [
  {
    np: 'वृत्तको केन्द्रबाट कुनै जीवामा खिचिएको लम्बले उक्त जीवालाई के गर्छ?',
    en: 'What does the perpendicular drawn from the centre of a circle to a chord do?',
    options: [
      { key: 'A', label: 'Bisects the chord into two equal parts' },
      { key: 'B', label: 'Doubles the chord' },
      { key: 'C', label: 'Does not cut the chord' },
      { key: 'D', label: 'None of these' },
    ],
    answer: 'A',
  },
  {
    np: 'एउटै वृत्तका बराबर लम्बाइ भएका दुई जीवाहरू केन्द्रबाट कस्तो दुरीमा रहन्छन्?',
    en: 'Equal chords of a circle are at what distance from the centre?',
    options: [
      { key: 'A', label: 'At equal distance (equidistant from the centre)' },
      { key: 'B', label: 'At different distances' },
      { key: 'C', label: 'Always at the centre' },
      { key: 'D', label: 'At infinite distance' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि केन्द्रबाट दुई जीवाहरूको लम्ब दुरी बराबर (OM = ON) छ भने जीवाहरूको लम्बाइ कस्तो हुन्छ?',
    en: 'If the perpendicular distances of two chords from the centre are equal (OM = ON), what is true of the chords?',
    options: [
      { key: 'A', label: 'Both chords are equal' },
      { key: 'B', label: 'One is double the other' },
      { key: 'C', label: 'Both are perpendicular' },
      { key: 'D', label: 'There is no relation' },
    ],
    answer: 'A',
  },
];

export const CircleTheoremInvestigationLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U16-02',
    chapter: 16,
    titleNp: 'वृत्तका साध्यहरूको अनुसन्धान प्रयोगशाला',
    titleEn: 'Circle Theorem Investigation Laboratory',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'bisection' | 'equidistant' | 'proof'>('bisection');

  // Circle Dimensions
  const cx = 230;
  const cy = 150;
  const r = 110; // radius in px (5cm approx)

  // Tab 1: Perpendicular Bisection Chord position slider
  const [distOM, setDistOM] = useState<number>(55); // perpendicular distance OM in px
  // Half chord length = sqrt(r^2 - distOM^2)
  const halfChordPx = Math.sqrt(Math.max(0, r * r - distOM * distOM));
  const chordLengthCm = ((2 * halfChordPx) / 22).toFixed(1);
  const distOMCm = (distOM / 22).toFixed(1);
  const halfCm = (halfChordPx / 22).toFixed(1);

  // Tab 2: Two Chords (Equal vs Unequal)
  const [chord1LenCm, setChord1LenCm] = useState<number>(8);
  const [chord2LenCm, setChord2LenCm] = useState<number>(8); // defaults equal to demonstrate theorem

  // Perpendicular distances for chords
  // half1 = chord1 * 22 / 2 = chord1 * 11
  const half1Px = (chord1LenCm * 22) / 2;
  const dist1Px = Math.sqrt(Math.max(0, r * r - half1Px * half1Px));
  const dist1Cm = (dist1Px / 22).toFixed(1);

  const half2Px = (chord2LenCm * 22) / 2;
  const dist2Px = Math.sqrt(Math.max(0, r * r - half2Px * half2Px));
  const dist2Cm = (dist2Px / 22).toFixed(1);

  // Proof state
  const [proofAnswers, setProofAnswers] = useState<Record<number, string>>({});
  const [proofVerified, setProofVerified] = useState<boolean>(false);

  const handleVerifyProof = () => {
    let allOk = true;
    THEOREM_1_STEPS.forEach((st, idx) => {
      if (st.missing && proofAnswers[idx] !== st.correctAnswer) {
        allOk = false;
      }
    });
    setProofVerified(allOk);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! वृत्तका दुई सर्वोत्कृष्ट साध्यहरू: 1) केन्द्रबाट जीवामा खिचिएको लम्बले जीवालाई समद्विभाजित गर्छ (AM = MB) र 2) बराबर जीवाहरू केन्द्रबाट बराबर दुरीमा हुन्छन् (AB = CD ⇔ OM = ON) लाई प्रत्यक्ष अन्वेषण गर्नुहोस्!',
        'Welcome! Explore the core circle theorems: perpendicular from center bisects chord (AM = MB) and equal chords are equidistant from center (AB = CD ⇔ OM = ON)!'
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('bisection')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: activeTab === 'bisection' ? '2px solid #0D9488' : '1px solid #CBD5E1',
              backgroundColor: activeTab === 'bisection' ? '#F0FDFA' : '#FFFFFF',
              color: activeTab === 'bisection' ? '#0F766E' : '#475569',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            📏 {L('साध्य 1: लम्ब र समद्विभाजन (Perpendicular Bisection)', 'Perpendicular Bisection')}
          </button>
          <button
            onClick={() => setActiveTab('equidistant')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: activeTab === 'equidistant' ? '2px solid #2563EB' : '1px solid #CBD5E1',
              backgroundColor: activeTab === 'equidistant' ? '#EFF6FF' : '#FFFFFF',
              color: activeTab === 'equidistant' ? '#1D4ED8' : '#475569',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            ⚖️ {L('साध्य 2: बराबर जीवा र समान दुरी (Equal Chords Equidistant)', 'Equal Chords Equidistant')}
          </button>
          <button
            onClick={() => setActiveTab('proof')}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: activeTab === 'proof' ? '2px solid #7C3AED' : '1px solid #CBD5E1',
              backgroundColor: activeTab === 'proof' ? '#F5F3FF' : '#FFFFFF',
              color: activeTab === 'proof' ? '#6D28D9' : '#475569',
              fontWeight: 800,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            📜 {L('साध्य 1 को सैद्धान्तिक प्रमाण (Proof)', 'Theorem 1 Formal Proof')}
          </button>
        </div>

        {/* Tab 1: Perpendicular Bisection */}
        {activeTab === 'bisection' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Slider Bar */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#334155' }}>
                  <span>{L('केन्द्रबाट लम्ब दुरी (Distance OM):', 'Perpendicular Distance OM:')}</span>
                  <strong style={{ color: '#0D9488' }}>{fmt(distOMCm)} cm</strong>
                </div>
                <input
                  type="range"
                  min={20}
                  max={95}
                  step={2}
                  value={distOM}
                  onChange={(e) => setDistOM(Number(e.target.value))}
                  style={{ width: '100%', marginTop: 6, accentColor: '#0D9488' }}
                />
              </div>
              <div style={{ fontSize: 12, color: '#64748B' }}>
                {L('जीवाको कुल लम्बाइ AB =', 'Total Chord AB =')} <strong>{fmt(chordLengthCm)} cm</strong>
              </div>
            </div>

            {/* SVG Visual */}
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
              <svg width={460} height={300} style={{ backgroundColor: '#F8FAFC', borderRadius: 8 }}>
                {/* Circle */}
                <circle cx={cx} cy={cy} r={r} fill="#F0FDFA" stroke="#0D9488" strokeWidth="2.5" />
                <circle cx={cx} cy={cy} r="4" fill="#0D9488" />
                <text x={cx - 14} y={cy - 6} fontSize="12" fontWeight="800" fill="#0D9488">
                  O
                </text>

                {/* Chord AB at y = cy + distOM */}
                {(() => {
                  const yChord = cy + distOM;
                  const xA = cx - halfChordPx;
                  const xB = cx + halfChordPx;
                  return (
                    <g>
                      {/* Triangle OMA and OMB radii */}
                      <line x1={cx} y1={cy} x2={xA} y2={yChord} stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3,3" />
                      <line x1={cx} y1={cy} x2={xB} y2={yChord} stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3,3" />

                      {/* Chord AB */}
                      <line x1={xA} y1={yChord} x2={xB} y2={yChord} stroke="#D97706" strokeWidth="3" />
                      <circle cx={xA} cy={yChord} r="5" fill="#D97706" />
                      <circle cx={xB} cy={yChord} r="5" fill="#D97706" />
                      <text x={xA - 16} y={yChord + 4} fontSize="12" fontWeight="800" fill="#B45309">
                        A
                      </text>
                      <text x={xB + 8} y={yChord + 4} fontSize="12" fontWeight="800" fill="#B45309">
                        B
                      </text>

                      {/* Perpendicular OM */}
                      <line x1={cx} y1={cy} x2={cx} y2={yChord} stroke="#DC2626" strokeWidth="2" />
                      <circle cx={cx} cy={yChord} r="4" fill="#DC2626" />
                      <text x={cx + 6} y={yChord + 16} fontSize="12" fontWeight="800" fill="#DC2626">
                        M
                      </text>

                      {/* Right angle symbol at M */}
                      <rect x={cx} y={yChord - 10} width="10" height="10" fill="none" stroke="#DC2626" strokeWidth="1.5" />

                      {/* Segment labels */}
                      <text x={(xA + cx) / 2} y={yChord - 6} fontSize="11" fill="#15803D" fontWeight="700" textAnchor="middle">
                        AM = {fmt(halfCm)} cm
                      </text>
                      <text x={(cx + xB) / 2} y={yChord - 6} fontSize="11" fill="#15803D" fontWeight="700" textAnchor="middle">
                        MB = {fmt(halfCm)} cm
                      </text>
                      <text x={cx + 8} y={(cy + yChord) / 2} fontSize="11" fill="#DC2626" fontWeight="700">
                        OM = {fmt(distOMCm)} cm
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Bisection Proof Box */}
            <div
              style={{
                backgroundColor: '#F0FDF4',
                borderRadius: 12,
                border: '1px solid #86EFAC',
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <strong style={{ fontSize: 13, color: '#065F46' }}>
                {L('साध्य 1 को निष्कर्ष (Theorem 1 Conclusion):', 'Theorem 1 Conclusion:')}
              </strong>
              <div style={{ fontFamily: 'monospace', fontSize: 15, color: '#065F46' }}>
                AM = {fmt(halfCm)} cm and MB = {fmt(halfCm)} cm ⇒ <strong>AM = MB</strong>
              </div>
              <div style={{ fontSize: 12, color: '#166534' }}>
                ✓ {L('प्रमाणित: वृत्तको केन्द्र O बाट जीवा AB मा खिचिएको लम्ब OM ले जीवालाई ठ्याक्कै दुई बराबर भागमा बाँड्दछ (AM = MB)।', 'Verified: Perpendicular OM from centre O bisects chord AB equally (AM = MB).')}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Equal Chords Equidistant */}
        {activeTab === 'equidistant' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Chord lengths controllers */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 14,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569' }}>
                  <span>{L('पहिलो जीवा (Chord 1 AB):', 'Chord 1 (AB):')}</span>
                  <strong>{fmt(chord1LenCm)} cm</strong>
                </div>
                <input
                  type="range"
                  min={5}
                  max={9.5}
                  step={0.5}
                  value={chord1LenCm}
                  onChange={(e) => setChord1LenCm(Number(e.target.value))}
                  style={{ width: '100%', marginTop: 6, accentColor: '#2563EB' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569' }}>
                  <span>{L('दोस्रो जीवा (Chord 2 CD):', 'Chord 2 (CD):')}</span>
                  <strong>{fmt(chord2LenCm)} cm</strong>
                </div>
                <input
                  type="range"
                  min={5}
                  max={9.5}
                  step={0.5}
                  value={chord2LenCm}
                  onChange={(e) => setChord2LenCm(Number(e.target.value))}
                  style={{ width: '100%', marginTop: 6, accentColor: '#2563EB' }}
                />
              </div>
            </div>

            {/* Quick equalize button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => setChord2LenCm(chord1LenCm)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: '1px solid #2563EB',
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                ⚖️ {L('दुवै जीवालाई बराबर बनाउनुहोस् (Set Equal: AB = CD)', 'Make Chords Equal (AB = CD)')}
              </button>
            </div>

            {/* Comparison Results Card */}
            <div
              style={{
                backgroundColor: chord1LenCm === chord2LenCm ? '#ECFDF5' : '#FFFBEB',
                borderRadius: 12,
                border: chord1LenCm === chord2LenCm ? '2px solid #86EFAC' : '1px solid #FCD34D',
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <strong style={{ fontSize: 14, color: chord1LenCm === chord2LenCm ? '#065F46' : '#92400E' }}>
                {chord1LenCm === chord2LenCm
                  ? L('साध्य 2 प्रमाणित: बराबर जीवाहरू केन्द्रबाट बराबर दुरीमा हुन्छन्!', 'Theorem 2 Verified: Equal chords are equidistant from centre!')
                  : L('जीवाहरूको लम्बाइ फरक हुँदा केन्द्रबाट दुरी पनि फरक हुन्छ:', 'Different chord lengths have different distances from centre:')}
              </strong>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, marginTop: 4 }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: 10, borderRadius: 8 }}>
                  <div>Chord AB = {fmt(chord1LenCm)} cm</div>
                  <div style={{ color: '#1D4ED8', fontWeight: 700, marginTop: 2 }}>
                    Distance from centre OM = {fmt(dist1Cm)} cm
                  </div>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: 10, borderRadius: 8 }}>
                  <div>Chord CD = {fmt(chord2LenCm)} cm</div>
                  <div style={{ color: '#1D4ED8', fontWeight: 700, marginTop: 2 }}>
                    Distance from centre ON = {fmt(dist2Cm)} cm
                  </div>
                </div>
              </div>

              {chord1LenCm === chord2LenCm && (
                <div style={{ color: '#166534', fontWeight: 700, fontSize: 12 }}>
                  ✓ AB = CD ({fmt(chord1LenCm)} cm), so both are at equal perpendicular distance from the centre: OM = ON = {fmt(dist1Cm)} cm!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Formal Proof Table */}
        {activeTab === 'proof' && (
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
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
              {L(
                'साध्य 1: वृत्तको केन्द्रबाट जीवामा खिचिएको लम्बले उक्त जीवालाई समद्विभाजित गर्छ।',
                'Theorem 1: The perpendicular drawn from the centre of a circle to a chord bisects the chord.'
              )}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC' }}>
                  <th style={{ width: '50%', padding: '8px 12px', textAlign: 'left', border: '1px solid #E2E8F0' }}>
                    {L('दाबी (Statements)', 'Statements')}
                  </th>
                  <th style={{ width: '50%', padding: '8px 12px', textAlign: 'left', border: '1px solid #E2E8F0' }}>
                    {L('कारण (Reasons)', 'Reasons')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {THEOREM_1_STEPS.map((st, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '8px 12px', border: '1px solid #E2E8F0' }}>
                      {idx + 1}. {st.statement}
                    </td>
                    <td style={{ padding: '8px 12px', border: '1px solid #E2E8F0' }}>
                      {st.missing ? (
                        <select
                          value={proofAnswers[idx] || ''}
                          onChange={(e) => setProofAnswers({ ...proofAnswers, [idx]: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            borderRadius: 6,
                            border: '1px solid #CBD5E1',
                            fontSize: 12,
                            backgroundColor: '#F0FDFA',
                            color: '#0F766E',
                            fontWeight: 600,
                          }}
                        >
                          <option value="">-- {L('कारण छान्नुहोस्', 'Select Reason')} --</option>
                          {st.options?.map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        `${idx + 1}. ${st.reason}`
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                onClick={handleVerifyProof}
                style={{
                  padding: '8px 18px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#0D9488',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {L('प्रमाण जाँच्नुहोस्', 'Verify Proof')}
              </button>
            </div>

            {proofVerified && (
              <div style={{ padding: 12, backgroundColor: '#ECFDF5', borderRadius: 8, border: '1px solid #6EE7B7', color: '#065F46', fontWeight: 700, fontSize: 13 }}>
                🎉 {L('सफल प्रमाणीकरण! केन्द्रबाट जीवामा खिचिएको लम्बले जीवालाई समद्विभाजित गर्छ (Q.E.D.)।', 'Verified! The perpendicular from centre bisects the chord (Q.E.D.).')}
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default CircleTheoremInvestigationLab;

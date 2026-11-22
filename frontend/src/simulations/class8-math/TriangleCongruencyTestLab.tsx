import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { CheckCircle, AlertTriangle, Layers, Award } from 'lucide-react';

type CongruencyRule = 'SAS' | 'RHS' | 'ASA' | 'SSS' | 'AAS';

interface RuleMeta {
  id: CongruencyRule;
  nameNp: string;
  nameEn: string;
  codeNp: string;
  descNp: string;
  descEn: string;
  conditionsNp: string[];
  conditionsEn: string[];
}

const RULES_DATA: Record<CongruencyRule, RuleMeta> = {
  SAS: {
    id: 'SAS',
    nameNp: 'भुजा-कोण-भुजा (Side-Angle-Side)',
    nameEn: 'Side-Angle-Side (SAS)',
    codeNp: 'भु.को.भु. तथ्य',
    descNp: 'दुई भुजा र तिनीहरू बीचको कोण बराबर भएमा दुई त्रिभुजहरू सर्वाङ्गसम हुन्छन्।',
    descEn: 'If two sides and the included angle of one triangle are equal to two sides and included angle of another, the triangles are congruent.',
    conditionsNp: ['१. भुजा AB = PQ', '२. बीचको कोण ∠B = ∠Q', '३. भुजा BC = QR'],
    conditionsEn: ['1. Side AB = PQ', '2. Included angle ∠B = ∠Q', '3. Side BC = QR']
  },
  RHS: {
    id: 'RHS',
    nameNp: 'समकोण-कर्ण-भुजा (Right angle - Hypotenuse - Side)',
    nameEn: 'Right angle-Hypotenuse-Side (RHS)',
    codeNp: 'स.क.भु. तथ्य',
    descNp: 'दुई समकोण त्रिभुजमा कर्ण र एउटा भुजा बराबर भएमा तिनीहरू सर्वाङ्गसम हुन्छन्।',
    descEn: 'If the hypotenuse and one side of a right-angled triangle are equal to the hypotenuse and one side of another right-angled triangle, they are congruent.',
    conditionsNp: ['१. समकोण ∠B = ∠Q = ९०°', '२. कर्ण AC = PR', '३. भुजा BC = QR'],
    conditionsEn: ['1. Right angle ∠B = ∠Q = 90°', '2. Hypotenuse AC = PR', '3. Side BC = QR']
  },
  ASA: {
    id: 'ASA',
    nameNp: 'कोण-भुजा-कोण (Angle-Side-Angle)',
    nameEn: 'Angle-Side-Angle (ASA)',
    codeNp: 'को.भु.को. तथ्य',
    descNp: 'दुई कोण र तिनीहरू बीचको भुजा बराबर भएमा दुई त्रिभुजहरू सर्वाङ्गसम हुन्छन्।',
    descEn: 'If two angles and the included side of one triangle are equal to two angles and included side of another, they are congruent.',
    conditionsNp: ['१. कोण ∠B = ∠Q', '२. बीचको भुजा BC = QR', '३. कोण ∠C = ∠R'],
    conditionsEn: ['1. Angle ∠B = ∠Q', '2. Included side BC = QR', '3. Angle ∠C = ∠R']
  },
  SSS: {
    id: 'SSS',
    nameNp: 'भुजा-भुजा-भुजा (Side-Side-Side)',
    nameEn: 'Side-Side-Side (SSS)',
    codeNp: 'भु.भु.भु. तथ्य',
    descNp: 'एउटा त्रिभुजका तीनवटै भुजाहरू अर्को त्रिभुजका तीन संगत भुजाहरूसँग बराबर भएमा तिनीहरू सर्वाङ्गसम हुन्छन्।',
    descEn: 'If three sides of one triangle are equal to the three corresponding sides of another triangle, the triangles are congruent.',
    conditionsNp: ['१. भुजा AB = PQ', '२. भुजा BC = QR', '३. भुजा CA = RP'],
    conditionsEn: ['1. Side AB = PQ', '2. Side BC = QR', '3. Side CA = RP']
  },
  AAS: {
    id: 'AAS',
    nameNp: 'कोण-कोण-भुजा (Angle-Angle-Side)',
    nameEn: 'Angle-Angle-Side (AAS)',
    codeNp: 'को.को.भु. तथ्य',
    descNp: 'दुई कोण र बीचमा नपर्ने एउटा संगत भुजा बराबर भएमा दुई त्रिभुजहरू सर्वाङ्गसम हुन्छन्।',
    descEn: 'If two angles and any non-included corresponding side of one triangle are equal to the corresponding parts of another, they are congruent.',
    conditionsNp: ['१. कोण ∠A = ∠P', '२. कोण ∠B = ∠Q', '३. भुजा BC = QR'],
    conditionsEn: ['1. Angle ∠A = ∠P', '2. Angle ∠B = ∠Q', '3. Side BC = QR']
  }
};

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'दुई त्रिभुजमा दुई भुजा र बीचको कोण बराबर भएमा कुन तथ्यले सर्वाङ्गसम हुन्छन्?',
    en: 'If two sides and the included angle of two triangles are equal, which condition proves congruency?',
    options: [
      { key: 'A', label: 'भु.को.भु. (SAS)' },
      { key: 'B', label: 'को.भु.को. (ASA)' },
      { key: 'C', label: 'स.क.भु. (RHS)' },
      { key: 'D', label: 'भु.भु.भु. (SSS)' },
    ],
    answer: 'A',
  },
  {
    np: 'समकोण त्रिभुजमा कर्ण (Hypotenuse) र एउटा भुजा बराबर भएमा कुन तथ्य लागु हुन्छ?',
    en: 'In right-angled triangles, which test applies when hypotenuse and one side are equal?',
    options: [
      { key: 'A', label: 'स.क.भु. (RHS)' },
      { key: 'B', label: 'भु.भु.भु. (SSS)' },
      { key: 'C', label: 'को.को.को. (AAA)' },
      { key: 'D', label: 'कुनै पनि होइन' },
    ],
    answer: 'A',
  },
  {
    np: 'के SSA (दुई भुजा र बीचमा नपर्ने कोण) ले सामान्य त्रिभुजमा सर्वाङ्गसमता प्रमाणित गर्छ?',
    en: 'Is SSA (two sides and a non-included angle) a valid general triangle congruency test?',
    options: [
      { key: 'A', label: 'होइन, SSA मान्य सर्वाङ्गसम तथ्य होइन (Invalid general test)' },
      { key: 'B', label: 'हो, सधैं मान्य हुन्छ' },
      { key: 'C', label: 'विषमबाहुमा मात्र मान्य' },
      { key: 'D', label: 'भन्न सकिँदैन' },
    ],
    answer: 'A',
  }
];

export const TriangleCongruencyTestLab: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U15-02',
    chapter: 15,
    titleNp: 'त्रिभुज सर्वाङ्गसमता परीक्षण प्रयोगशाला',
    titleEn: 'Triangle Congruency Test Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeRule, setActiveRule] = useState<CongruencyRule>('SAS');
  const [challengeQuestionIdx, setChallengeQuestionIdx] = useState<number>(0);

  const curRule = RULES_DATA[activeRule];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! पाठ्यपुस्तकका पाँचवटै सर्वाङ्गसमता तथ्यहरू (SAS, RHS, ASA, SSS, AAS) को विस्तृत अध्ययन र अभ्यास गरौं!',
        'Hello! Master and verify all 5 textbook triangle congruency conditions: SAS, RHS, ASA, SSS, and AAS!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Rule Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(Object.keys(RULES_DATA) as CongruencyRule[]).map((rule) => (
            <button
              key={rule}
              onClick={() => setActiveRule(rule)}
              className={`py-2 px-3 rounded-xl border text-center transition-all ${
                activeRule === rule
                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/30'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-mono font-bold text-sm">{rule}</div>
              <div className="text-[11px] opacity-90 mt-0.5">{RULES_DATA[rule].codeNp}</div>
            </button>
          ))}
        </div>

        {/* Rule Description Banner */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900/95 to-amber-950/30 rounded-2xl border border-amber-500/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📐</span>
            <div>
              <h3 className="font-bold text-amber-300 text-base">
                {isNe ? curRule.nameNp : curRule.nameEn} ({curRule.codeNp})
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {isNe ? curRule.descNp : curRule.descEn}
              </p>
            </div>
          </div>
        </div>

        {/* Side-by-Side SVG Geometric Comparison */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex justify-center">
          <svg viewBox="0 0 520 250" className="w-full max-w-2xl h-64 select-none">
            <defs>
              <pattern id="gridRule" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="520" height="250" fill="url(#gridRule)" />

            {/* Triangle 1: ABC */}
            <g transform="translate(60, 35)">
              <polygon points="0,160 170,160 60,30" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" strokeWidth="3" />
              <text x="-15" y="170" fill="#38bdf8" fontSize="13" fontWeight="bold">A</text>
              <text x="175" y="170" fill="#38bdf8" fontSize="13" fontWeight="bold">B</text>
              <text x="55" y="20" fill="#38bdf8" fontSize="13" fontWeight="bold">C</text>

              {/* Highlights based on rule */}
              {activeRule === 'SAS' && (
                <g>
                  <line x1="170" y1="160" x2="60" y2="30" stroke="#f59e0b" strokeWidth="4" />
                  <line x1="0" y1="160" x2="170" y2="160" stroke="#f59e0b" strokeWidth="4" />
                  <circle cx="170" cy="160" r="14" fill="none" stroke="#22c55e" strokeWidth="2.5" />
                  <text x="180" y="145" fill="#22c55e" fontSize="12" fontWeight="bold">∠B</text>
                </g>
              )}
              {activeRule === 'RHS' && (
                <g>
                  <rect x="150" y="140" width="20" height="20" fill="none" stroke="#22c55e" strokeWidth="2" />
                  <line x1="0" y1="160" x2="60" y2="30" stroke="#f59e0b" strokeWidth="4" />
                  <line x1="170" y1="160" x2="60" y2="30" stroke="#38bdf8" strokeWidth="4" />
                  <text x="15" y="90" fill="#f59e0b" fontSize="11" fontWeight="bold">कर्ण (Hyp)</text>
                </g>
              )}
              {activeRule === 'SSS' && (
                <g>
                  <line x1="0" y1="160" x2="170" y2="160" stroke="#f59e0b" strokeWidth="4" />
                  <line x1="170" y1="160" x2="60" y2="30" stroke="#38bdf8" strokeWidth="4" />
                  <line x1="60" y1="30" x2="0" y2="160" stroke="#a855f7" strokeWidth="4" />
                </g>
              )}
              <text x="75" y="195" fill="#38bdf8" fontSize="13" fontWeight="bold">△ABC</text>
            </g>

            {/* Triangle 2: PQR */}
            <g transform="translate(300, 35)">
              <polygon points="0,160 170,160 60,30" fill="rgba(168, 85, 247, 0.15)" stroke="#a855f7" strokeWidth="3" />
              <text x="-15" y="170" fill="#a855f7" fontSize="13" fontWeight="bold">P</text>
              <text x="175" y="170" fill="#a855f7" fontSize="13" fontWeight="bold">Q</text>
              <text x="55" y="20" fill="#a855f7" fontSize="13" fontWeight="bold">R</text>

              {/* Highlights based on rule */}
              {activeRule === 'SAS' && (
                <g>
                  <line x1="170" y1="160" x2="60" y2="30" stroke="#f59e0b" strokeWidth="4" />
                  <line x1="0" y1="160" x2="170" y2="160" stroke="#f59e0b" strokeWidth="4" />
                  <circle cx="170" cy="160" r="14" fill="none" stroke="#22c55e" strokeWidth="2.5" />
                  <text x="180" y="145" fill="#22c55e" fontSize="12" fontWeight="bold">∠Q</text>
                </g>
              )}
              {activeRule === 'RHS' && (
                <g>
                  <rect x="150" y="140" width="20" height="20" fill="none" stroke="#22c55e" strokeWidth="2" />
                  <line x1="0" y1="160" x2="60" y2="30" stroke="#f59e0b" strokeWidth="4" />
                  <line x1="170" y1="160" x2="60" y2="30" stroke="#38bdf8" strokeWidth="4" />
                  <text x="15" y="90" fill="#f59e0b" fontSize="11" fontWeight="bold">कर्ण (Hyp)</text>
                </g>
              )}
              {activeRule === 'SSS' && (
                <g>
                  <line x1="0" y1="160" x2="170" y2="160" stroke="#f59e0b" strokeWidth="4" />
                  <line x1="170" y1="160" x2="60" y2="30" stroke="#38bdf8" strokeWidth="4" />
                  <line x1="60" y1="30" x2="0" y2="160" stroke="#a855f7" strokeWidth="4" />
                </g>
              )}
              <text x="75" y="195" fill="#a855f7" fontSize="13" fontWeight="bold">△PQR</text>
            </g>
          </svg>
        </div>

        {/* Verification Conditions Card */}
        <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-700 space-y-2">
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            {L('सर्वाङ्गसम हुन चाहिने तीन सर्तहरू (3 Conditions):', 'Three Congruence Conditions:')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(isNe ? curRule.conditionsNp : curRule.conditionsEn).map((c, i) => (
              <div key={i} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs font-mono font-semibold text-emerald-300 flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                <span>{c}</span>
              </div>
            ))}
          </div>

          <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <span>
              💡 {L('अतः ' + curRule.codeNp + ' अनुसार: △ABC ≅ △PQR प्रमाणित हुन्छ।', 'Therefore by ' + curRule.nameEn + ': △ABC ≅ △PQR is proved.')}
            </span>
            <span className="font-mono text-emerald-400 font-bold">△ABC ≅ △PQR</span>
          </div>
        </div>

        {/* Caution Notice on SSA */}
        <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-300">
          <AlertTriangle size={16} className="text-rose-400 shrink-0" />
          <span>
            {L(
              '⚠️ महत्त्वपूर्ण: SSA (दुई भुजा र बीचमा नपर्ने कोण) सामान्य त्रिभुजका लागि मान्य सर्वाङ्गसमता तथ्य होइन!',
              '⚠️ Important: SSA (two sides and a non-included angle) is NOT a valid general triangle congruency test!'
            )}
          </span>
        </div>
      </div>
    </SimFrame2D>
  );
};
export default TriangleCongruencyTestLab;

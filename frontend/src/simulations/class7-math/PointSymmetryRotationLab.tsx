/**
 * PointSymmetryRotationLab.tsx
 * Grade 7 Mathematics – Lesson 18: SYMMETRY AND TESSELLATION (सममिति र टेसलेसन)
 * Simulation 2: Point Symmetry and 180° Rotation Lab (बिन्दु सममिति र १८०° परिक्रमण प्रयोगशाला)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 264-269)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { RotateCw, Check, CheckCircle2, RotateCcw, Shuffle, Sparkles } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'कुनै आकृतिलाई एउटा निश्चित बिन्दु वरिपरि कति डिग्री घुमाउँदा पहिलेकै अवस्थामा आइपुग्छ भने त्यसलाई बिन्दु सममिति (Point Symmetry) भनिन्छ?',
    en: 'When a figure rotated around a fixed point through what angle coincides with its original position, is it said to have point symmetry?',
    options: [
      { key: 'A', label: '१८०° (आधा चक्कर / Half turn)' },
      { key: 'B', label: '९०°' },
      { key: 'C', label: '३६०°' },
      { key: 'D', label: '४५°' },
    ],
    answer: 'A',
  },
  {
    np: 'अंग्रेजी वर्णमालाका कुन-कुन ठूला अक्षरहरूमा बिन्दु सममिति (Point Symmetry) हुन्छ?',
    en: 'Which English capital letters possess point symmetry?',
    options: [
      { key: 'A', label: 'H, I, N, O, S, X, Z' },
      { key: 'B', label: 'A, B, C, D, E' },
      { key: 'C', label: 'F, G, J, K, L' },
      { key: 'D', label: 'P, Q, R, T, U' },
    ],
    answer: 'A',
  },
  {
    np: 'समान्तर चतुर्भुज (Parallelogram) मा बिन्दु सममितिको केन्द्र कहाँ हुन्छ?',
    en: 'Where is the centre of point symmetry located in a parallelogram?',
    options: [
      { key: 'A', label: 'दुवै विकर्णहरू काटिएको बिन्दु (Intersection of diagonals)' },
      { key: 'B', label: 'शीर्षबिन्दुमा' },
      { key: 'C', label: 'कुनै एउटा भुजामा' },
      { key: 'D', label: 'चतुर्भुज बाहिर' },
    ],
    answer: 'A',
  },
  {
    np: 'के समबाहु त्रिभुज (Equilateral Triangle) मा बिन्दु सममिति हुन्छ?',
    en: 'Does an equilateral triangle have point symmetry when rotated 180°?',
    options: [
      { key: 'A', label: 'हुँदैन (१८०° घुमाउँदा शीर्ष तल फर्कन्छ र खप्टिँदैन)' },
      { key: 'B', label: 'हुन्छ' },
      { key: 'C', label: 'कहिलेकाहीँ हुन्छ' },
      { key: 'D', label: 'केन्द्रमा मात्र हुन्छ' },
    ],
    answer: 'A',
  },
];

type LabMode = 'rotation_studio' | 'alphabet_challenge' | 'figures_lab' | 'distance_midpoint';

export const PointSymmetryRotationLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L18-02',
    chapter: 18,
    titleNp: 'बिन्दु सममिति र १८०° परिक्रमण प्रयोगशाला (Point Symmetry Lab)',
    titleEn: 'Point Symmetry and 180° Rotation Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [mode, setMode] = useState<LabMode>('rotation_studio');

  // Rotation Studio States
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [studioShape, setStudioShape] = useState<'letter_S' | 'letter_N' | 'parallelogram' | 'rectangle' | 'letter_E' | 'triangle'>('letter_S');

  // Alphabet Tester State
  const [selectedLetter, setSelectedLetter] = useState<string>('H');
  const [letterRot, setLetterRot] = useState<number>(0);

  const ALPHABET_LIST = [
    { char: 'H', hasSym: true },
    { char: 'I', hasSym: true },
    { char: 'N', hasSym: true },
    { char: 'O', hasSym: true },
    { char: 'S', hasSym: true },
    { char: 'X', hasSym: true },
    { char: 'Z', hasSym: true },
    { char: 'A', hasSym: false },
    { char: 'B', hasSym: false },
    { char: 'C', hasSym: false },
    { char: 'E', hasSym: false },
    { char: 'F', hasSym: false },
    { char: 'M', hasSym: false },
  ];

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! केन्द्र O वरिपरि १८०° घुमाउँदा दुरुस्त आफ्नै आकारमा खप्टिने आकृतिलाई बिन्दु सममिति भनिन्छ। घुमाएर हेरौँ!',
        'Hello! When a figure rotated through 180° around center O looks identical to its original position, it has point symmetry!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 justify-center bg-indigo-50/80 p-2 rounded-2xl border border-indigo-200">
          {[
            { id: 'rotation_studio', np: '१. १८०° परिक्रमण स्टुडियो (Rotation Studio)', en: '1. 180° Rotation Studio' },
            { id: 'distance_midpoint', np: '२. केन्द्रबाट बराबर दूरी (Distance & Midpoint)', en: '2. Equal Distance from O' },
            { id: 'alphabet_challenge', np: '३. अंग्रेजी वर्णमाला परीक्षण (Alphabet Test)', en: '3. Alphabet Point Symmetry' },
            { id: 'figures_lab', np: '४. ज्यामितीय आकृति परीक्षण (Figures Lab)', en: '4. Geometric Figures Test' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setMode(item.id as LabMode);
                setRotationAngle(0);
              }}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm ${
                mode === item.id
                  ? 'bg-indigo-600 text-white shadow-indigo-200 ring-2 ring-indigo-400'
                  : 'bg-white text-slate-700 hover:bg-indigo-100'
              }`}
            >
              {isNe ? item.np : item.en}
            </button>
          ))}
        </div>

        {/* Tab 1: Rotation Studio */}
        {mode === 'rotation_studio' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-blue-950" style={{ fontFamily: FONT_NP }}>
                {L('बिन्दु सममिति (Point Symmetry) को पाठ्यपुस्तक परिभाषा:', 'CDC Textbook Definition of Point Symmetry:')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'यदि कुनै आकृतिलाई यसको केन्द्रबिन्दु O वरिपरि १८०° (आधा चक्कर) घुमाउँदा सो आकृति सुरुको अवस्थासँग दुरुस्त खप्टिन्छ भने त्यसलाई बिन्दु सममिति भएको आकृति र बिन्दु O लाई सममितिको केन्द्र (Centre of Symmetry) भनिन्छ।',
                  'If rotating a figure 180° around point O causes it to coincide exactly with its initial position, the figure has point symmetry, and point O is its centre of symmetry.'
                )}
              </p>
            </div>

            {/* Shape Buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                { id: 'letter_S', label: 'अक्षर S (बिन्दु सममिति)', sym: true },
                { id: 'letter_N', label: 'अक्षर N (बिन्दु सममिति)', sym: true },
                { id: 'parallelogram', label: 'समान्तर चतुर्भुज (बिन्दु सममिति)', sym: true },
                { id: 'rectangle', label: 'आयत (बिन्दु सममिति)', sym: true },
                { id: 'letter_E', label: 'अक्षर E (छैन)', sym: false },
                { id: 'triangle', label: 'त्रिभुज (छैन)', sym: false },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setStudioShape(s.id as any);
                    setRotationAngle(0);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    studioShape === s.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Rotation Visual and Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Canvas with dynamic transform */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center">
                <svg width="280" height="260" viewBox="0 0 280 260">
                  {/* Faint reference grid */}
                  <line x1="30" y1="130" x2="250" y2="130" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1="140" y1="20" x2="140" y2="240" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />

                  {/* Original Ghost Silhouette for comparison */}
                  <g opacity="0.25">
                    {studioShape === 'letter_S' && (
                      <text x="140" y="165" textAnchor="middle" fontSize="100" fontWeight="black" fill="#64748b" fontFamily="Arial">
                        S
                      </text>
                    )}
                    {studioShape === 'letter_N' && (
                      <text x="140" y="165" textAnchor="middle" fontSize="100" fontWeight="black" fill="#64748b" fontFamily="Arial">
                        N
                      </text>
                    )}
                    {studioShape === 'letter_E' && (
                      <text x="140" y="165" textAnchor="middle" fontSize="100" fontWeight="black" fill="#64748b" fontFamily="Arial">
                        E
                      </text>
                    )}
                    {studioShape === 'parallelogram' && (
                      <polygon points="80,80 220,80 180,180 40,180" fill="none" stroke="#64748b" strokeWidth="3" />
                    )}
                    {studioShape === 'rectangle' && (
                      <rect x="60" y="80" width="160" height="100" fill="none" stroke="#64748b" strokeWidth="3" />
                    )}
                    {studioShape === 'triangle' && (
                      <polygon points="140,60 60,190 220,190" fill="none" stroke="#64748b" strokeWidth="3" />
                    )}
                  </g>

                  {/* Rotatable Object around Center (140, 130) */}
                  <g transform={`rotate(${rotationAngle}, 140, 130)`}>
                    {studioShape === 'letter_S' && (
                      <text x="140" y="165" textAnchor="middle" fontSize="100" fontWeight="black" fill="#4f46e5" fontFamily="Arial">
                        S
                      </text>
                    )}
                    {studioShape === 'letter_N' && (
                      <text x="140" y="165" textAnchor="middle" fontSize="100" fontWeight="black" fill="#0284c7" fontFamily="Arial">
                        N
                      </text>
                    )}
                    {studioShape === 'letter_E' && (
                      <text x="140" y="165" textAnchor="middle" fontSize="100" fontWeight="black" fill="#e11d48" fontFamily="Arial">
                        E
                      </text>
                    )}
                    {studioShape === 'parallelogram' && (
                      <polygon points="80,80 220,80 180,180 40,180" fill="rgba(99, 102, 241, 0.3)" stroke="#4f46e5" strokeWidth="3" />
                    )}
                    {studioShape === 'rectangle' && (
                      <rect x="60" y="80" width="160" height="100" fill="rgba(16, 185, 129, 0.3)" stroke="#059669" strokeWidth="3" />
                    )}
                    {studioShape === 'triangle' && (
                      <polygon points="140,60 60,190 220,190" fill="rgba(245, 158, 11, 0.3)" stroke="#d97706" strokeWidth="3" />
                    )}
                  </g>

                  {/* Centre of Symmetry O */}
                  <circle cx="140" cy="130" r="5" fill="#ef4444" />
                  <text x="148" y="135" fontSize="12" fontWeight="bold" fill="#ef4444">O</text>
                </svg>

                <div className="text-xs text-slate-500 mt-2">
                  {L('खैरो धर्का = सुरुको अवस्था (Original) | रङ्गीन = घुमिरहेको अवस्था', 'Grey silhouette = original position | Colored = rotating position')}
                </div>
              </div>

              {/* Slider and Snap Buttons */}
              <div className="space-y-4">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-indigo-950">
                      {L(`परिक्रमण कोण (Rotation Angle): ${toNp(rotationAngle)}°`, `Rotation Angle: ${rotationAngle}°`)}
                    </label>
                    <span className="text-xs font-black text-indigo-700">{rotationAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={rotationAngle}
                    onChange={(e) => setRotationAngle(Number(e.target.value))}
                    className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                    <span>0°</span>
                    <span>90°</span>
                    <span className="font-bold text-indigo-700">180°</span>
                    <span>270°</span>
                    <span>360°</span>
                  </div>
                </div>

                {/* Preset quick jump buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setRotationAngle(0)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    0° {L('(सुरु)', '(Initial)')}
                  </button>
                  <button
                    onClick={() => setRotationAngle(90)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    90° {L('(चौथाइ)', '(Quarter)')}
                  </button>
                  <button
                    onClick={() => setRotationAngle(180)}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    180° {L('(आधा चक्कर)', '(Half Turn)')}
                  </button>
                </div>

                {/* Verification result at 180° */}
                <div
                  className={`p-4 rounded-2xl border ${
                    rotationAngle === 180
                      ? studioShape === 'letter_E' || studioShape === 'triangle'
                        ? 'bg-rose-50 border-rose-300'
                        : 'bg-emerald-50 border-emerald-300'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {rotationAngle === 180 ? (
                    studioShape === 'letter_E' || studioShape === 'triangle' ? (
                      <div className="text-xs text-rose-800">
                        <b>✕ {L('बिन्दु सममिति छैन:', 'No Point Symmetry:')}</b>{' '}
                        {L(
                          '१८०° मा घुमाउँदा आकृति उल्टो भई सुरुको अवस्थासँग खप्टिएन।',
                          'At 180°, the figure turns upside down and fails to overlap the initial shape.'
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-800">
                        <b>✓ {L('बिन्दु सममिति प्रमाणित भयो!', 'Point Symmetry Verified!')}</b>{' '}
                        {L(
                          '१८०° घुमाउँदा दुरुस्त सुरुको अवस्थामा खप्टियो। अतः यसमा बिन्दु सममिति छ!',
                          'At 180°, it coincides identically with its original outline!'
                        )}
                      </div>
                    )
                  ) : (
                    <div className="text-xs text-slate-500 text-center">
                      {L('बिन्दु सममिति जाँच्न कोणलाई १८०° मा लैजानुहोस्।', 'Slide the angle to 180° to test point symmetry.')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Equal Distance & Midpoint */}
        {mode === 'distance_midpoint' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r-2xl">
              <h3 className="text-base font-bold text-emerald-950" style={{ fontFamily: FONT_NP }}>
                {L('सममितिको केन्द्र O र बराबर दूरीको गुण:', 'Equal Distance from Centre of Symmetry:')}
              </h3>
              <p className="text-slate-700 text-xs md:text-sm mt-1">
                {L(
                  'बिन्दु सममिति भएका आकृतिमा केन्द्रबिन्दु O बाट विपरित दुवैतिरका अनुरूप बिन्दुहरूको दूरी बराबर (OA = OA\') हुन्छ र O रेखाखण्ड AA\' को मध्यबिन्दु (Midpoint) हुन्छ।',
                  'In any figure with point symmetry, corresponding opposite points lie on a straight line passing through O at equal distances (OA = OA\'), so O is the midpoint.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center">
                <svg width="300" height="240" viewBox="0 0 300 240">
                  {/* Parallelogram ABCD */}
                  {/* A(60, 60), B(240, 60), C(220, 180), D(40, 180) */}
                  {/* Center O at (140, 120) */}
                  <polygon points="60,60 240,60 220,180 40,180" fill="rgba(99, 102, 241, 0.15)" stroke="#4f46e5" strokeWidth="2.5" />

                  {/* Diagonal AC through O */}
                  <line x1="60" y1="60" x2="220" y2="180" stroke="#ef4444" strokeWidth="2.5" />
                  {/* Diagonal BD through O */}
                  <line x1="240" y1="60" x2="40" y2="180" stroke="#0ea5e9" strokeWidth="2.5" />

                  {/* Center O */}
                  <circle cx="140" cy="120" r="5" fill="#ef4444" />
                  <text x="145" y="115" fontSize="13" fontWeight="bold" fill="#ef4444">O</text>

                  {/* Vertices */}
                  <circle cx="60" cy="60" r="4" fill="#2563eb" />
                  <text x="45" y="55" fontSize="13" fontWeight="bold">A</text>

                  <circle cx="240" cy="60" r="4" fill="#2563eb" />
                  <text x="250" y="55" fontSize="13" fontWeight="bold">B</text>

                  <circle cx="220" cy="180" r="4" fill="#2563eb" />
                  <text x="230" y="195" fontSize="13" fontWeight="bold">C (A')</text>

                  <circle cx="40" cy="180" r="4" fill="#2563eb" />
                  <text x="25" y="195" fontSize="13" fontWeight="bold">D (B')</text>

                  {/* Distance labels */}
                  <text x="85" y="85" fontSize="11" fontWeight="bold" fill="#dc2626">OA</text>
                  <text x="180" y="155" fontSize="11" fontWeight="bold" fill="#dc2626">OC</text>
                </svg>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-sm font-bold text-slate-800">
                    {L('दूरी नाप र गणितीय प्रमाणीकरण:', 'Distance Measurements & Proof:')}
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{L('दूरी OA = दूरी OC (कर्ण बिन्दुहरूको दूरी बराबर)', 'Distance OA = Distance OC')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{L('दूरी OB = दूरी OD (दोस्रो विकर्णका बिन्दुहरू बराबर)', 'Distance OB = Distance OD')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{L('बिन्दु O रेखाखण्ड AC र BD दुवैको मध्यबिन्दु हो।', 'Point O is the midpoint of both diagonals AC and BD.')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Alphabet Challenge */}
        {mode === 'alphabet_challenge' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200">
              <h3 className="text-base font-bold text-indigo-950" style={{ fontFamily: FONT_NP }}>
                {L('अंग्रेजी वर्णमालाका अक्षरहरूको बिन्दु सममिति परीक्षण:', 'English Alphabet Point Symmetry Test:')}
              </h3>
              <p className="text-xs text-indigo-800 mt-1">
                {L('कुनै पनि अक्षर छान्नुहोस् र १८०° घुमाएर हेर्नुहोस्। कुन अक्षर दुरुस्त उस्तै देखिन्छ?', 'Select any letter and rotate it 180° to check if it looks identical.')}
              </p>
            </div>

            {/* Letter selection bar */}
            <div className="flex flex-wrap gap-2 justify-center">
              {ALPHABET_LIST.map((item) => (
                <button
                  key={item.char}
                  onClick={() => {
                    setSelectedLetter(item.char);
                    setLetterRot(0);
                  }}
                  className={`w-10 h-10 rounded-xl font-black text-base transition-all ${
                    selectedLetter === item.char
                      ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {item.char}
                </button>
              ))}
            </div>

            {/* Rotation Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col items-center">
                <svg width="220" height="220" viewBox="0 0 220 220">
                  <circle cx="110" cy="110" r="90" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4,4" />
                  <g transform={`rotate(${letterRot}, 110, 110)`}>
                    <text
                      x="110"
                      y="145"
                      textAnchor="middle"
                      fontSize="100"
                      fontWeight="black"
                      fill="#4338ca"
                      fontFamily="Arial"
                    >
                      {selectedLetter}
                    </text>
                  </g>
                  <circle cx="110" cy="110" r="4" fill="#ef4444" />
                </svg>
                <div className="text-xs font-bold text-slate-600 mt-2">
                  {L(`घुमाइएको कोण: ${toNp(letterRot)}°`, `Rotated: ${letterRot}°`)}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setLetterRot(letterRot === 180 ? 0 : 180)}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md text-sm"
                  >
                    <RotateCw className="w-4 h-4" />
                    {letterRot === 180 ? L('सुरुमा फर्काउनुहोस् (0°)', 'Reset to 0°') : L('१८०° घुमाउनुहोस् (Rotate 180°)', 'Rotate 180°')}
                  </button>
                </div>

                {letterRot === 180 && (
                  <div
                    className={`p-4 rounded-2xl border ${
                      ALPHABET_LIST.find((x) => x.char === selectedLetter)?.hasSym
                        ? 'bg-emerald-50 border-emerald-300'
                        : 'bg-rose-50 border-rose-300'
                    }`}
                  >
                    <div className="font-bold text-sm">
                      {ALPHABET_LIST.find((x) => x.char === selectedLetter)?.hasSym ? (
                        <span className="text-emerald-900">
                          ✓ {L(`अक्षर ${selectedLetter} मा बिन्दु सममिति छ!`, `Letter ${selectedLetter} has Point Symmetry!`)}
                        </span>
                      ) : (
                        <span className="text-rose-900">
                          ✕ {L(`अक्षर ${selectedLetter} मा बिन्दु सममिति छैन!`, `Letter ${selectedLetter} does NOT have Point Symmetry!`)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {ALPHABET_LIST.find((x) => x.char === selectedLetter)?.hasSym
                        ? L('१८०° घुमाउँदा पनि यो दुरुस्त उस्तै देखिन्छ।', 'It looks identical even when turned completely upside down (180°).')
                        : L('१८०° घुमाउँदा यो उल्टो भई फरक देखिन्छ।', 'It turns upside down and changes appearance at 180°.')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Geometric Figures Point Symmetry Lab */}
        {mode === 'figures_lab' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200">
              <h3 className="text-base font-bold text-purple-950" style={{ fontFamily: FONT_NP }}>
                {L('ज्यामितीय आकृतिहरूको बिन्दु सममिति तुलना तालिका:', 'Geometrical Figures Point Symmetry Summary:')}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
                <thead className="bg-slate-200 text-slate-800 font-bold">
                  <tr>
                    <th className="p-3 border-r border-slate-300">{L('ज्यामितीय आकृति (Figure)', 'Figure')}</th>
                    <th className="p-3 border-r border-slate-300">{L('बिन्दु सममिति (Point Symmetry)', 'Point Symmetry')}</th>
                    <th className="p-3 border-r border-slate-300">{L('सममितिको केन्द्र (Centre O)', 'Centre O')}</th>
                    <th className="p-3">{L('कारण / व्याख्या (Reason)', 'Reason')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-indigo-50/50">
                    <td className="p-3 font-bold border-r border-slate-200">{L('समान्तर चतुर्भुज (Parallelogram)', 'Parallelogram')}</td>
                    <td className="p-3 font-bold text-emerald-600 border-r border-slate-200">✓ {L('छ (Yes)', 'Yes')}</td>
                    <td className="p-3 border-r border-slate-200">{L('विकर्णहरू काटिएको बिन्दु', 'Diagonal intersection')}</td>
                    <td className="p-3 text-slate-600">{L('१८०° घुमाउँदा चारवटै शीर्ष दुरुस्त खप्टिन्छन्', 'Overlaps perfectly at 180°')}</td>
                  </tr>
                  <tr className="hover:bg-indigo-50/50">
                    <td className="p-3 font-bold border-r border-slate-200">{L('आयत (Rectangle)', 'Rectangle')}</td>
                    <td className="p-3 font-bold text-emerald-600 border-r border-slate-200">✓ {L('छ (Yes)', 'Yes')}</td>
                    <td className="p-3 border-r border-slate-200">{L('विकर्णहरूको कटान बिन्दु', 'Diagonal intersection')}</td>
                    <td className="p-3 text-slate-600">{L('१८०° मा आकार र कोण उस्तै रहन्छ', 'Matches position at 180°')}</td>
                  </tr>
                  <tr className="hover:bg-indigo-50/50">
                    <td className="p-3 font-bold border-r border-slate-200">{L('वर्ग (Square)', 'Square')}</td>
                    <td className="p-3 font-bold text-emerald-600 border-r border-slate-200">✓ {L('छ (Yes)', 'Yes')}</td>
                    <td className="p-3 border-r border-slate-200">{L('विकर्णहरूको केन्द्र', 'Centre of diagonals')}</td>
                    <td className="p-3 text-slate-600">{L('९०° र १८०° दुवैमा खप्टिन्छ', 'Matches at 90° and 180°')}</td>
                  </tr>
                  <tr className="hover:bg-indigo-50/50">
                    <td className="p-3 font-bold border-r border-slate-200">{L('वृत्त (Circle)', 'Circle')}</td>
                    <td className="p-3 font-bold text-emerald-600 border-r border-slate-200">✓ {L('छ (Yes)', 'Yes')}</td>
                    <td className="p-3 border-r border-slate-200">{L('वृत्तको केन्द्र (Centre)', 'Centre')}</td>
                    <td className="p-3 text-slate-600">{L('कुनै पनि कोणमा घुमाउँदा खप्टिन्छ', 'Invariant under rotation')}</td>
                  </tr>
                  <tr className="hover:bg-indigo-50/50">
                    <td className="p-3 font-bold border-r border-slate-200">{L('समबाहु त्रिभुज (Equilateral △)', 'Equilateral Triangle')}</td>
                    <td className="p-3 font-bold text-rose-600 border-r border-slate-200">✕ {L('छैन (No)', 'No')}</td>
                    <td className="p-3 border-r border-slate-200">-</td>
                    <td className="p-3 text-slate-600">{L('१८०° घुमाउँदा शीर्ष तल फर्कन्छ र खप्टिँदैन', 'Points downward at 180°')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default PointSymmetryRotationLab;

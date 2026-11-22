/**
 * CompassBearingDiscoveryLab.tsx
 * Grade 7 Mathematics – Lesson 20: BEARING AND SCALE DRAWING (दिगंश र मापन चित्र)
 * Simulation 1: Compass and Bearing Discovery Lab (दिशासूचक यन्त्र र दिगंश खोजी प्रयोगशाला)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 293-300)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Compass, Check, Shuffle, RotateCcw, Navigation } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'दिगंश (Bearing) सधैं कुन दिशालाई आधार मानेर घडीको सुई घुम्ने दिशा (Clockwise) मा नापिन्छ?',
    en: 'Bearing is always measured starting from which reference direction in a clockwise sense?',
    options: [
      { key: 'A', label: 'उत्तर दिशा (North - 000°)' },
      { key: 'B', label: 'पूर्व दिशा' },
      { key: 'C', label: 'दक्षिण दिशा' },
      { key: 'D', label: 'पश्चिम दिशा' },
    ],
    answer: 'A',
  },
  {
    np: 'दिगंशलाई सामान्यतया कति अङ्कमा (Digits) लेख्ने अन्तर्राष्ट्रिय नियम छ?',
    en: 'In three-figure bearing notation, bearings are always written with how many digits?',
    options: [
      { key: 'A', label: '३ अङ्क (Three digits, e.g. 045°, 090°)' },
      { key: 'B', label: '२ अङ्क' },
      { key: 'C', label: '४ अङ्क' },
      { key: 'D', label: '१ अङ्क' },
    ],
    answer: 'A',
  },
  {
    np: 'उत्तर-पूर्व (North-East - NE) दिशाको दिगंश कति हुन्छ?',
    en: 'What is the three-figure bearing of the North-East (NE) direction?',
    options: [
      { key: 'A', label: '०४५° (045°)' },
      { key: 'B', label: '०९०°' },
      { key: 'C', label: '१३५°' },
      { key: 'D', label: '२२५°' },
    ],
    answer: 'A',
  },
  {
    np: 'दक्षिण (South) दिशाको दिगंश कति हुन्छ?',
    en: 'What is the bearing of South (S)?',
    options: [
      { key: 'A', label: '१८०°' },
      { key: 'B', label: '०९०°' },
      { key: 'C', label: '२७०°' },
      { key: 'D', label: '३६०°' },
    ],
    answer: 'A',
  },
];

interface DirectionItem {
  code: string;
  nameNp: string;
  nameEn: string;
  angle: number;
  bearingStr: string;
}

const EIGHT_DIRECTIONS: DirectionItem[] = [
  { code: 'N', nameNp: 'उत्तर', nameEn: 'North', angle: 0, bearingStr: '000°' },
  { code: 'NE', nameNp: 'उत्तर-पूर्व', nameEn: 'North-East', angle: 45, bearingStr: '045°' },
  { code: 'E', nameNp: 'पूर्व', nameEn: 'East', angle: 90, bearingStr: '090°' },
  { code: 'SE', nameNp: 'दक्षिण-पूर्व', nameEn: 'South-East', angle: 135, bearingStr: '135°' },
  { code: 'S', nameNp: 'दक्षिण', nameEn: 'South', angle: 180, bearingStr: '180°' },
  { code: 'SW', nameNp: 'दक्षिण-पश्चिम', nameEn: 'South-West', angle: 225, bearingStr: '225°' },
  { code: 'W', nameNp: 'पश्चिम', nameEn: 'West', angle: 270, bearingStr: '270°' },
  { code: 'NW', nameNp: 'उत्तर-पश्चिम', nameEn: 'North-West', angle: 315, bearingStr: '315°' },
];

export const CompassBearingDiscoveryLab: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L20-01',
    chapter: 20,
    titleNp: 'दिशासूचक यन्त्र र दिगंश खोजी प्रयोगशाला (Compass & Bearing Lab)',
    titleEn: 'Compass and Bearing Discovery Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  // Needle angle slider (0° to 359°)
  const [currentAngle, setCurrentAngle] = useState<number>(45);

  // Challenge mode states
  const [challengeDir, setChallengeDir] = useState<DirectionItem>(EIGHT_DIRECTIONS[1]);
  const [userGuess, setUserGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const formatBearing = (deg: number) => {
    const d = Math.round(deg) % 360;
    if (d < 10) return `00${d}°`;
    if (d < 100) return `0${d}°`;
    return `${d}°`;
  };

  const handleSnapDirection = (dir: DirectionItem) => {
    setCurrentAngle(dir.angle);
  };

  const pickRandomChallenge = () => {
    const rand = EIGHT_DIRECTIONS[Math.floor(Math.random() * EIGHT_DIRECTIONS.length)];
    setChallengeDir(rand);
    setUserGuess('');
    setFeedback(null);
  };

  const checkChallenge = () => {
    const cleanGuess = userGuess.trim().replace('°', '');
    const expected = challengeDir.bearingStr.replace('°', '');
    if (cleanGuess === expected || parseInt(cleanGuess, 10) === challengeDir.angle) {
      setFeedback(L('उत्कृष्ट! बिल्कुल सही तीन-अङ्के दिगंश।', 'Excellent! Absolutely correct 3-figure bearing.'));
    } else {
      setFeedback(
        L(
          `प्रयास राम्रो! ${challengeDir.nameNp} दिशाको सही दिगंश ${challengeDir.bearingStr} हो।`,
          `Good try! The correct bearing for ${challengeDir.nameEn} is ${challengeDir.bearingStr}.`
        )
      );
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! उत्तर दिशा (North) लाई ०००° मानी घडीको सुईको दिशामा नापिएको कोण नै दिगंश (Bearing) हो। कम्पास घुमाएर हेरौँ!',
        'Hello! Measuring clockwise from North yields the bearing. Always written in 3 figures (e.g. 045°, 090°). Let us discover!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Definition banner */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-2xl">
          <h3 className="text-base font-bold text-blue-950" style={{ fontFamily: FONT_NP }}>
            {L('दिगंश (Bearing) को तीन मुख्य नियमहरू:', 'Three Golden Rules of Bearing:')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 text-xs md:text-sm text-slate-800">
            <div className="bg-white p-3 rounded-xl border border-blue-200">
              <span className="font-bold text-blue-700">१. उत्तर आधार (From North):</span>
              <p className="text-[11px] text-slate-600 mt-0.5">सधैं उत्तर दिशा (North = 000°) बाट सुरु गरिन्छ।</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-blue-200">
              <span className="font-bold text-blue-700">२. घडीको सुई घुम्ने दिशा (Clockwise):</span>
              <p className="text-[11px] text-slate-600 mt-0.5">कोण सधैं घडीको सुई अनुसार दायाँतिर नापिन्छ।</p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-blue-200">
              <span className="font-bold text-blue-700">३. तीन अङ्कको सङ्केत (3 Figures):</span>
              <p className="text-[11px] text-slate-600 mt-0.5">जस्तै 45° लाई 045°, 90° लाई 090° लेखिन्छ।</p>
            </div>
          </div>
        </div>

        {/* 8 Directions Quick Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {EIGHT_DIRECTIONS.map((dir) => (
            <button
              key={dir.code}
              onClick={() => handleSnapDirection(dir)}
              className={`p-2.5 rounded-xl text-center border transition-all ${
                Math.round(currentAngle) === dir.angle
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-black">{dir.code}</div>
              <div className="text-[10px] mt-0.5 opacity-90">{isNe ? dir.nameNp : dir.nameEn}</div>
              <div className="text-[10px] font-bold text-amber-400 mt-0.5">{dir.bearingStr}</div>
            </button>
          ))}
        </div>

        {/* Interactive Compass Dial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white rounded-3xl p-6 shadow-xl border border-indigo-100">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center shadow-2xl relative">
            <svg width="280" height="280" viewBox="0 0 280 280">
              {/* Outer dial ring */}
              <circle cx="140" cy="140" r="120" fill="#0f172a" stroke="#334155" strokeWidth="4" />
              <circle cx="140" cy="140" r="115" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />

              {/* Tick marks around dial */}
              {Array.from({ length: 36 }).map((_, i) => {
                const deg = i * 10;
                const rad = ((deg - 90) * Math.PI) / 180;
                const r1 = deg % 90 === 0 ? 100 : deg % 45 === 0 ? 105 : 110;
                const x1 = 140 + 115 * Math.cos(rad);
                const y1 = 140 + 115 * Math.sin(rad);
                const x2 = 140 + r1 * Math.cos(rad);
                const y2 = 140 + r1 * Math.sin(rad);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth={deg % 90 === 0 ? 2.5 : 1} />;
              })}

              {/* North Line (Reference) */}
              <line x1="140" y1="140" x2="140" y2="28" stroke="#ef4444" strokeWidth="2.5" />

              {/* Clockwise Angle Sweep Sector Arc */}
              {(() => {
                const startAngle = -90; // North
                const endAngle = -90 + currentAngle;
                const radStart = (startAngle * Math.PI) / 180;
                const radEnd = (endAngle * Math.PI) / 180;
                const xStart = 140 + 65 * Math.cos(radStart);
                const yStart = 140 + 65 * Math.sin(radStart);
                const xEnd = 140 + 65 * Math.cos(radEnd);
                const yEnd = 140 + 65 * Math.sin(radEnd);
                const largeArc = currentAngle > 180 ? 1 : 0;

                if (currentAngle > 0 && currentAngle < 360) {
                  return (
                    <path
                      d={`M 140 140 L ${xStart} ${yStart} A 65 65 0 ${largeArc} 1 ${xEnd} ${yEnd} Z`}
                      fill="rgba(245, 158, 11, 0.25)"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                    />
                  );
                }
                return null;
              })()}

              {/* Cardinal Letters */}
              <text x="140" y="24" textAnchor="middle" fill="#ef4444" fontSize="14" fontWeight="black">N (000°)</text>
              <text x="262" y="145" textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight="bold">E (090°)</text>
              <text x="140" y="272" textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight="bold">S (180°)</text>
              <text x="18" y="145" textAnchor="middle" fill="#e2e8f0" fontSize="13" fontWeight="bold">W (270°)</text>

              {/* Rotatable Compass Needle */}
              <g transform={`rotate(${currentAngle}, 140, 140)`}>
                {/* Red North-seeking pointer */}
                <polygon points="140,50 146,140 134,140" fill="#ef4444" />
                {/* Blue/White South pointer */}
                <polygon points="140,230 146,140 134,140" fill="#94a3b8" />
              </g>

              {/* Center pivot pin */}
              <circle cx="140" cy="140" r="7" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
            </svg>

            <div className="text-center mt-3">
              <div className="text-xs text-slate-400 font-semibold uppercase">{L('वर्तमान दिगंश (Current Bearing)', 'Current Bearing')}</div>
              <div className="text-3xl font-black text-amber-400 mt-0.5 tracking-wider">
                {formatBearing(currentAngle)}
              </div>
            </div>
          </div>

          {/* Controls & Angle Slider */}
          <div className="space-y-5">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-800">
                  {L('कम्पास सुई घुमाउनुहोस् (Rotate Needle):', 'Rotate Needle:')}
                </label>
                <span className="text-base font-black text-indigo-700">{Math.round(currentAngle)}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="359"
                value={currentAngle}
                onChange={(e) => setCurrentAngle(Number(e.target.value))}
                className="w-full h-3 bg-slate-300 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 font-semibold">
                <span>000° (N)</span>
                <span>090° (E)</span>
                <span>180° (S)</span>
                <span>270° (W)</span>
                <span>360°</span>
              </div>
            </div>

            {/* Bearing Challenge Card */}
            <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black text-indigo-900 uppercase">
                  {L('दिगंश पहिचान चुनौती (Challenge)', 'Bearing Challenge')}
                </div>
                <button
                  onClick={pickRandomChallenge}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  {L('नयाँ दिशा', 'New')}
                </button>
              </div>

              <div className="text-sm font-bold text-slate-800">
                {L(`प्रश्न: ${challengeDir.nameNp} (${challengeDir.nameEn} - ${challengeDir.code}) को तीन-अङ्के दिगंश कति हुन्छ?`, `Question: What is the 3-figure bearing for ${challengeDir.nameEn} (${challengeDir.code})?`)}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={userGuess}
                  onChange={(e) => setUserGuess(e.target.value)}
                  placeholder="e.g. 045°"
                  className="flex-1 px-4 py-2 border-2 border-indigo-200 rounded-xl font-bold text-base focus:border-indigo-600 focus:outline-none"
                />
                <button
                  onClick={checkChallenge}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md text-sm flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  {L('जाँच', 'Check')}
                </button>
              </div>

              {feedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    feedback.includes('उत्कृष्ट') || feedback.includes('Excellent')
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {feedback}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default CompassBearingDiscoveryLab;

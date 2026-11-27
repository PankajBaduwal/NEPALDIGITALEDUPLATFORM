/**
 * BearingScaleFieldProject.tsx
 * Grade 7 Mathematics – Lesson 20: BEARING AND SCALE DRAWING (दिगंश र मापन चित्र)
 * Simulation 4: Bearing and Scale Drawing Field Project (दिगंश र मापन चित्र परियोजना कार्य)
 * Strictly adheres to CDC Nepal Grade 7 Mathematics Curriculum (2079 B.S., Pages 315-320)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Compass, Ruler, MapPin, Check, Award, RotateCcw, Sparkles } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'परियोजना कार्यमा समुदाय वा विद्यालयको मापन चित्र तयार गर्दा सबैभन्दा महत्त्वपूर्ण पहिलो काम के हो?',
    en: 'In field planning and scale drawing, what is the most important initial step?',
    options: [
      { key: 'A', label: 'उपयुक्त स्केल (Scale) र उत्तर दिशा (North) निर्धारण गर्नु' },
      { key: 'B', label: 'चित्रमा रङ्ग भर्नु' },
      { key: 'C', label: 'सिधै घर बनाउनु' },
      { key: 'D', label: 'कागज च्यात्नु' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि १ सेमी = ५ मिटर स्केल प्रयोग गरिएको छ र नक्सामा विद्यालयदेखि खेलमैदानसम्मको दूरी ६ सेमी छ भने वास्तविक दूरी कति हुन्छ?',
    en: 'If scale 1 cm = 5 m is used and map distance is 6 cm, what is the actual ground distance?',
    options: [
      { key: 'A', label: '३० मिटर (६ × ५)' },
      { key: 'B', label: '११ मिटर' },
      { key: 'C', label: '१ मिटर' },
      { key: 'D', label: '६० मिटर' },
    ],
    answer: 'A',
  },
  {
    np: 'केन्द्रबिन्दुबाट ठीक दक्षिण-पूर्व (SE) दिशामा अवस्थित भवनको दिगंश कति हुन्छ?',
    en: 'What is the bearing of a building located exactly South-East (SE) from the center?',
    options: [
      { key: 'A', label: '१३५° (135°)' },
      { key: 'B', label: '०४५°' },
      { key: 'C', label: '२२५°' },
      { key: 'D', label: '३१५°' },
    ],
    answer: 'A',
  },
  {
    np: 'सामुदायिक बस्ती योजना बनाउँदा ५ वटा परिवारको घरहरू बीच के व्यवस्था हुनु अनिवार्य छ?',
    en: 'When planning a 5-family community settlement, what must be ensured?',
    options: [
      { key: 'A', label: 'बाटो, पानीको स्रोत र उपयुक्त दूरी (Road and access)' },
      { key: 'B', label: 'घरहरू खप्टिएको हुनुपर्छ' },
      { key: 'C', label: 'दिशाको कुनै अर्थ छैन' },
      { key: 'D', label: 'कुनै खाली ठाउँ नहुनु' },
    ],
    answer: 'A',
  },
];

interface PlannedFacility {
  id: string;
  nameNp: string;
  nameEn: string;
  gridX: number; // in cm
  gridY: number; // in cm
  color: string;
}

export const BearingScaleFieldProject: React.FC<{ onBackToLibrary?: () => void; onBack?: () => void }> = ({
  onBackToLibrary,
  onBack,
}) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G7-L20-04',
    chapter: 20,
    titleNp: 'दिगंश र मापन चित्र परियोजना कार्य (Field Project)',
    titleEn: 'Bearing and Scale Drawing Field Project',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  // Chosen scale: 1 cm represents scaleMeters meters
  const [scaleMeters, setScaleMeters] = useState<number>(5);

  // Reference Flag Pole at Center (140, 140)
  const centerPoint = { x: 140, y: 140 };

  // Planned Facilities
  const [facilities, setFacilities] = useState<PlannedFacility[]>([
    { id: 'school', nameNp: 'विद्यालय भवन', nameEn: 'School Block', gridX: 220, gridY: 60, color: '#2563eb' },
    { id: 'playground', nameNp: 'खेलमैदान', nameEn: 'Playground', gridX: 230, gridY: 210, color: '#16a34a' },
    { id: 'healthpost', nameNp: 'स्वास्थ्य चौकी', nameEn: 'Health Post', gridX: 60, gridY: 70, color: '#dc2626' },
    { id: 'well', nameNp: 'पानीको इनार', nameEn: 'Water Well', gridX: 60, gridY: 200, color: '#0891b2' },
  ]);

  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('school');
  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId) || facilities[0];

  // Calculate Map Distance in cm (scale: 20px = 1 cm)
  const pxPerCm = 20;
  const dxPx = selectedFacility.gridX - centerPoint.x;
  const dyPx = selectedFacility.gridY - centerPoint.y;
  const distPx = Math.sqrt(dxPx * dxPx + dyPx * dyPx);
  const mapDistCm = distPx / pxPerCm;
  const actualGroundMeters = mapDistCm * scaleMeters;

  // Bearing from Center clockwise from North
  let rad = Math.atan2(dxPx, -dyPx);
  let deg = (rad * 180) / Math.PI;
  if (deg < 0) deg += 360;
  const bearingDeg = Math.round(deg);

  const format3Digit = (d: number) => {
    if (d < 10) return `00${d}°`;
    if (d < 100) return `0${d}°`;
    return `${d}°`;
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={7}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'बधाई छ साथीहरू! पाठ्यपुस्तकको वृहत् परियोजना कार्य: विद्यालय तथा बस्ती योजनाको मापन चित्र तयार गरौँ र दिगंश हिसाब गरौँ!',
        'Congratulations friends! Complete the comprehensive textbook field project: plan scaled layouts and calculate bearings!'
      )}
    >
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Project Header Banner */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-800 rounded-3xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
              {L('पाठ्यपुस्तक परियोजना कार्य (CDC Field Project)', 'CDC Capstone Field Project')}
            </span>
            <h2 className="text-xl md:text-2xl font-black" style={{ fontFamily: FONT_NP }}>
              {L('विद्यालय तथा समुदाय योजना मापन चित्र', 'School & Community Layout Master Plan')}
            </h2>
            <p className="text-xs text-emerald-100 max-w-lg">
              {L('केन्द्रबिन्दु (झण्डा स्तम्भ) बाट विभिन्न पूर्वाधारहरूको दूरी र दिगंश नाप्नुहोस्।', 'Measure distances and bearings of facilities from the central flag pole.')}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
            <span className="text-xs font-semibold block text-emerald-200">{L('स्केल छनोट (Scale):', 'Chosen Scale:')}</span>
            <select
              value={scaleMeters}
              onChange={(e) => setScaleMeters(Number(e.target.value))}
              className="bg-transparent text-white font-black text-sm border-none focus:outline-none cursor-pointer mt-0.5"
            >
              <option value={2} className="text-slate-900">१ सेमी = २ मिटर</option>
              <option value={5} className="text-slate-900">१ सेमी = ५ मिटर</option>
              <option value={10} className="text-slate-900">१ सेमी = १० मिटर</option>
            </select>
          </div>
        </div>

        {/* Master Planning Grid & Dynamic Vector */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-indigo-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Field Map Grid (280x280) */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 flex flex-col items-center shadow-inner relative">
              <svg width="280" height="280" viewBox="0 0 280 280">
                {/* 1 cm (20px) Grid lines */}
                {Array.from({ length: 15 }).map((_, i) => (
                  <g key={i}>
                    <line x1={i * 20} y1="0" x2={i * 20} y2="280" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="0" y1={i * 20} x2="280" y2={i * 20} stroke="#f1f5f9" strokeWidth="1" />
                  </g>
                ))}

                {/* North Reference from Center Flag Pole */}
                <line
                  x1={centerPoint.x}
                  y1={centerPoint.y}
                  x2={centerPoint.x}
                  y2={centerPoint.y - 70}
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeDasharray="4,2"
                />
                <text x={centerPoint.x + 4} y={centerPoint.y - 72} fontSize="11" fontWeight="black" fill="#ef4444">
                  N (उत्तर)
                </text>

                {/* Connecting Bearing Vector */}
                <line
                  x1={centerPoint.x}
                  y1={centerPoint.y}
                  x2={selectedFacility.gridX}
                  y2={selectedFacility.gridY}
                  stroke="#f59e0b"
                  strokeWidth="3"
                />

                {/* Clockwise Angle Arc */}
                {(() => {
                  const r = 36;
                  const sweepRad = ((bearingDeg - 90) * Math.PI) / 180;
                  const xE = centerPoint.x + r * Math.cos(sweepRad);
                  const yE = centerPoint.y + r * Math.sin(sweepRad);
                  const large = bearingDeg > 180 ? 1 : 0;
                  return (
                    <path
                      d={`M ${centerPoint.x} ${centerPoint.y - r} A ${r} ${r} 0 ${large} 1 ${xE} ${yE}`}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                  );
                })()}

                {/* Center Flag Pole */}
                <circle cx={centerPoint.x} cy={centerPoint.y} r="8" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
                <text x={centerPoint.x} y={centerPoint.y + 18} textAnchor="middle" fontSize="10" fontWeight="black" fill="#b45309">
                  झण्डा स्तम्भ
                </text>

                {/* Facilities */}
                {facilities.map((fac) => {
                  const isSel = fac.id === selectedFacilityId;
                  return (
                    <g
                      key={fac.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedFacilityId(fac.id)}
                    >
                      <rect
                        x={fac.gridX - 16}
                        y={fac.gridY - 16}
                        width="32"
                        height="32"
                        rx="8"
                        fill={fac.color}
                        stroke={isSel ? '#fbbf24' : '#ffffff'}
                        strokeWidth={isSel ? 3.5 : 2}
                        className="transition-all"
                      />
                      <text
                        x={fac.gridX}
                        y={fac.gridY + 24}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="bold"
                        fill="#1e293b"
                      >
                        {isNe ? fac.nameNp : fac.nameEn}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="text-[11px] text-slate-500 mt-2 text-center">
                {L('नक्सामा कुनै पनि भवनमा क्लिक गरी दिगंश र दूरी हेर्नुहोस्।', 'Click any planned facility to inspect bearing and distance.')}
              </div>
            </div>

            {/* Calculations & Engineering Specs */}
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase">{L('योजना विश्लेषण (Field Analysis)', 'Field Analysis')}</div>
                <div className="text-base font-bold text-slate-900" style={{ fontFamily: FONT_NP }}>
                  {isNe
                    ? `झण्डा स्तम्भबाट ${selectedFacility.nameNp} को मापन:`
                    : `Measurement to ${selectedFacility.nameEn} from Central Pole:`}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-semibold">{L('दिगंश (Bearing)', 'Bearing')}</div>
                    <div className="text-2xl font-black text-amber-600 mt-1">
                      {format3Digit(bearingDeg)}
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-semibold">{L('वास्तविक दूरी (Ground)', 'Ground Distance')}</div>
                    <div className="text-2xl font-black text-emerald-600 mt-1">
                      {toNp(actualGroundMeters.toFixed(1))} मि
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 border-t border-slate-200 pt-2 space-y-1">
                  <div>नक्साको दूरी = <b>{mapDistCm.toFixed(1)} सेमी</b></div>
                  <div>स्केल = १ सेमी = {scaleMeters} मिटर</div>
                  <div>
                    वास्तविक दूरी = {mapDistCm.toFixed(1)} × {scaleMeters} = <b>{actualGroundMeters.toFixed(1)} मिटर</b>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Master Facility Summary Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse bg-slate-50 rounded-2xl overflow-hidden border border-slate-200">
              <thead className="bg-slate-200 text-slate-800 font-bold">
                <tr>
                  <th className="p-2.5 text-left border-r border-slate-300">{L('पूर्वाधार (Facility)', 'Facility')}</th>
                  <th className="p-2.5 border-r border-slate-300">{L('नक्साको दूरी (Map cm)', 'Map cm')}</th>
                  <th className="p-2.5 border-r border-slate-300">{L('वास्तविक दूरी (Actual m)', 'Actual m')}</th>
                  <th className="p-2.5">{L('दिगंश (Bearing from Center)', 'Bearing')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {facilities.map((fac) => {
                  const dX = fac.gridX - centerPoint.x;
                  const dY = fac.gridY - centerPoint.y;
                  const mDist = Math.sqrt(dX * dX + dY * dY) / pxPerCm;
                  const aDist = mDist * scaleMeters;
                  let rRad = Math.atan2(dX, -dY);
                  let rDeg = (rRad * 180) / Math.PI;
                  if (rDeg < 0) rDeg += 360;
                  const rBear = Math.round(rDeg);

                  return (
                    <tr
                      key={fac.id}
                      onClick={() => setSelectedFacilityId(fac.id)}
                      className={`cursor-pointer hover:bg-indigo-50/50 ${
                        fac.id === selectedFacilityId ? 'bg-indigo-50 font-bold' : ''
                      }`}
                    >
                      <td className="p-2.5 border-r border-slate-200 flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fac.color }} />
                        {isNe ? fac.nameNp : fac.nameEn}
                      </td>
                      <td className="p-2.5 text-center border-r border-slate-200">{toNp(mDist.toFixed(1))} सेमी</td>
                      <td className="p-2.5 text-center border-r border-slate-200 font-bold text-emerald-700">
                        {toNp(aDist.toFixed(1))} मिटर
                      </td>
                      <td className="p-2.5 text-center font-bold text-amber-600">{format3Digit(rBear)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SimFrame2D>
  );
};

export default BearingScaleFieldProject;

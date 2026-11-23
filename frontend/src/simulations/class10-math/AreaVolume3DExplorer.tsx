import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const AreaVolume3DExplorer: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G10-U5-01',
    chapter: 5,
    titleNp: '३डी ज्यामिति: क्षेत्रफल तथा आयतन अन्वेषक',
    titleEn: '3D Geometry: Area and Volume Explorer',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'pyramid' | 'cone' | 'combined' | 'costCalc'>('pyramid');

  // ── 1. PYRAMID CONTROLS ────────────────────────────────────────────────────
  const [pyrBaseA, setPyrBaseA] = useState<number>(12); // base edge a
  const [pyrHeightH, setPyrHeightH] = useState<number>(8); // vertical height h
  const [pyrUnfolded, setPyrUnfolded] = useState<boolean>(false);

  // Slant height l = sqrt(h^2 + (a/2)^2)
  const pyrSlantL = Math.sqrt(pyrHeightH ** 2 + (pyrBaseA / 2) ** 2);
  const pyrBaseArea = pyrBaseA ** 2;
  const pyrLSA = 2 * pyrBaseA * pyrSlantL; // 4 * (1/2 * a * l)
  const pyrTSA = pyrBaseArea + pyrLSA;
  const pyrVolume = (1 / 3) * pyrBaseArea * pyrHeightH;

  // ── 2. CONE CONTROLS ───────────────────────────────────────────────────────
  const [coneRadiusR, setConeRadiusR] = useState<number>(7);
  const [coneHeightH, setConeHeightH] = useState<number>(24);
  const [coneUnfolded, setConeUnfolded] = useState<boolean>(false);

  const coneSlantL = Math.sqrt(coneRadiusR ** 2 + coneHeightH ** 2);
  const coneBaseArea = Math.PI * coneRadiusR ** 2;
  const coneCSA = Math.PI * coneRadiusR * coneSlantL;
  const coneTSA = Math.PI * coneRadiusR * (coneRadiusR + coneSlantL);
  const coneVolume = (1 / 3) * Math.PI * coneRadiusR ** 2 * coneHeightH;

  // ── 3. COMBINED SOLIDS ─────────────────────────────────────────────────────
  const [combinedType, setCombinedType] = useState<'cyl_cone' | 'cone_hemi' | 'cyl_hemi'>('cyl_cone');
  const [combR, setCombR] = useState<number>(6); // common radius
  const [combH1, setCombH1] = useState<number>(10); // cylinder / base height
  const [combH2, setCombH2] = useState<number>(8); // cone height

  // Computations for combined:
  // Combination A: Cylinder + Cone (Tent / Temple)
  const combConeL = Math.sqrt(combR ** 2 + combH2 ** 2);
  const cylCSA = 2 * Math.PI * combR * combH1;
  const cylBase = Math.PI * combR ** 2;
  const coneExposedCSA = Math.PI * combR * combConeL;
  const cylVol = Math.PI * combR ** 2 * combH1;
  const coneVol = (1 / 3) * Math.PI * combR ** 2 * combH2;

  // Combination B: Cone + Hemisphere (Top Toy)
  const hemiCSA = 2 * Math.PI * combR ** 2;
  const hemiVol = (2 / 3) * Math.PI * combR ** 3;

  let totalExposedArea = 0;
  let totalCombVolume = 0;

  if (combinedType === 'cyl_cone') {
    // Tent: Base circle + Cylinder curved surface + Cone curved surface (No internal circle between cylinder and cone!)
    totalExposedArea = cylBase + cylCSA + coneExposedCSA;
    totalCombVolume = cylVol + coneVol;
  } else if (combinedType === 'cone_hemi') {
    // Top: Cone curved surface + Hemisphere curved surface (internal flat base is joined and hidden!)
    totalExposedArea = coneExposedCSA + hemiCSA;
    totalCombVolume = coneVol + hemiVol;
  } else {
    // Cylinder + Hemisphere (Silo): Base circle + Cylinder curved surface + Hemisphere curved surface
    totalExposedArea = cylBase + cylCSA + hemiCSA;
    totalCombVolume = cylVol + hemiVol;
  }

  // ── 4. COST & WATER TANK ESTIMATION ─────────────────────────────────────────
  const [costPerSqM, setCostPerSqM] = useState<number>(150);
  const [tankRadiusM, setTankRadiusM] = useState<number>(2); // metres
  const [tankHeightM, setTankHeightM] = useState<number>(3.5); // metres

  const tankVolM3 = Math.PI * tankRadiusM ** 2 * tankHeightM;
  const tankCapacityLitres = tankVolM3 * 1000;
  const tankPaintingArea = 2 * Math.PI * tankRadiusM * tankHeightM + Math.PI * tankRadiusM ** 2;
  const totalPaintingCost = tankPaintingArea * costPerSqM;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={10}
      mascotGreeting={L(
        'नमस्ते! कक्षा १० गणितको एकाइ ५: क्षेत्रफल र आयतन (Area and Volume) प्रयोगशालामा स्वागत छ! यहाँ पिरामिड र सोलीको ३डी मोडेल, जाली (Net) खोल्ने प्रक्रिया, र संयुक्त ठोस वस्तुहरूको आयतन तथा बाहिरी क्षेत्रफल अन्वेषण गर्नुहोस्!',
        'Welcome to Grade 10 3D Geometry Laboratory! Manipulate 3D pyramids and cones, unfold their nets, and calculate volumes and exposed surface areas of combined solids!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'pyramid', labelNp: 'क) वर्गाकार आधार भएको पिरामिड (Pyramid)', labelEn: 'A) Square Pyramid' },
            { id: 'cone', labelNp: 'ख) सोली (Right Circular Cone)', labelEn: 'B) Cone Explorer' },
            { id: 'combined', labelNp: 'ग) संयुक्त ठोस वस्तुहरू (Combined Solids)', labelEn: 'C) Combined Solids' },
            { id: 'costCalc', labelNp: 'घ) लागत तथा पानी ट्याङ्की क्षमता', labelEn: 'D) Cost & Capacity' },
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

        {/* ── TAB A: SQUARE-BASED PYRAMID ────────────────────────────────────────── */}
        {activeTab === 'pyramid' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* SVG Visual Canvas (3D vs Unfolded Net) */}
            <div className="md:col-span-6 bg-[#142D4E] p-4 rounded-2xl flex flex-col justify-between text-white shadow-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-cyan-300">
                  {pyrUnfolded ? L('पिरामिडको जाली (Unfolded Net)', 'Unfolded Net') : L('३डी पिरामिड (3D Pyramid)', '3D Pyramid')}
                </span>
                <button
                  onClick={() => {
                    setPyrUnfolded(!pyrUnfolded);
                    kit.tap();
                  }}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  {pyrUnfolded ? L('३डी मा पट्याउनुहोस् (Fold)', 'Fold into 3D') : L('जाली खोल्नुहोस् (Unfold Net)', 'Unfold Net')}
                </button>
              </div>

              <div className="flex justify-center items-center h-64 bg-slate-900/60 rounded-xl p-2">
                {!pyrUnfolded ? (
                  /* 3D Wireframe Pyramid */
                  <svg width={260} height={240} viewBox="0 0 260 240">
                    {/* Base vertices: A(60, 190), B(170, 200), C(210, 150), D(100, 140) */}
                    {/* Apex V(135, 40) */}
                    {/* Center of base: (135, 170) */}
                    <polygon points="60,190 170,200 210,150 100,140" fill="#38bdf8" fillOpacity="0.2" stroke="#64748b" strokeWidth={1.5} />
                    {/* Hidden back edges */}
                    <line x1={100} y1={140} x2={135} y2={40} stroke="#475569" strokeWidth={1.5} strokeDasharray="3" />
                    <line x1={60} y1={190} x2={100} y2={140} stroke="#475569" strokeWidth={1} strokeDasharray="3" />
                    <line x1={100} y1={140} x2={210} y2={150} stroke="#475569" strokeWidth={1} strokeDasharray="3" />

                    {/* Vertical height h */}
                    <line x1={135} y1={40} x2={135} y2={170} stroke="#f43f5e" strokeWidth={2} strokeDasharray="3" />
                    <text x={140} y={110} fill="#f43f5e" fontSize="12" fontWeight="bold">h = {fmt(pyrHeightH)}</text>

                    {/* Slant height l from V to midpoint of front edge AB(115, 195) */}
                    <line x1={135} y1={40} x2={115} y2={195} stroke="#fbbf24" strokeWidth={2.5} />
                    <text x={95} y={115} fill="#fbbf24" fontSize="12" fontWeight="bold">l = {fmt(pyrSlantL.toFixed(1))}</text>

                    {/* Visible edges to Apex */}
                    <line x1={60} y1={190} x2={135} y2={40} stroke="#38bdf8" strokeWidth={2.5} />
                    <line x1={170} y1={200} x2={135} y2={40} stroke="#38bdf8" strokeWidth={2.5} />
                    <line x1={210} y1={150} x2={135} y2={40} stroke="#38bdf8" strokeWidth={2.5} />

                    {/* Front base edges */}
                    <line x1={60} y1={190} x2={170} y2={200} stroke="#38bdf8" strokeWidth={2.5} />
                    <line x1={170} y1={200} x2={210} y2={150} stroke="#38bdf8" strokeWidth={2.5} />

                    {/* Base side label */}
                    <text x={115} y={218} fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
                      a = {fmt(pyrBaseA)}
                    </text>
                  </svg>
                ) : (
                  /* Unfolded 2D Net */
                  <svg width={260} height={240} viewBox="0 0 260 240">
                    {/* Central Square Base: 90 to 170 */}
                    <rect x={90} y={80} width={80} height={80} fill="#38bdf8" fillOpacity="0.3" stroke="#38bdf8" strokeWidth={2} />
                    <text x={130} y={125} fill="#38bdf8" fontSize="12" fontWeight="bold" textAnchor="middle">
                      Base a²
                    </text>

                    {/* 4 Triangular Faces Flapped Outward */}
                    {/* Top Triangle */}
                    <polygon points="90,80 170,80 130,15" fill="#fbbf24" fillOpacity="0.25" stroke="#fbbf24" strokeWidth={1.5} />
                    {/* Bottom Triangle */}
                    <polygon points="90,160 170,160 130,225" fill="#fbbf24" fillOpacity="0.25" stroke="#fbbf24" strokeWidth={1.5} />
                    {/* Left Triangle */}
                    <polygon points="90,80 90,160 25,120" fill="#fbbf24" fillOpacity="0.25" stroke="#fbbf24" strokeWidth={1.5} />
                    {/* Right Triangle */}
                    <polygon points="170,80 170,160 235,120" fill="#fbbf24" fillOpacity="0.25" stroke="#fbbf24" strokeWidth={1.5} />

                    <text x={130} y={55} fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="bold">½·a·l</text>
                    <text x={130} y={195} fill="#fbbf24" fontSize="10" textAnchor="middle" fontWeight="bold">½·a·l</text>
                  </svg>
                )}
              </div>

              <div className="flex justify-between text-xs font-mono text-slate-300 mt-2">
                <span>आधार भुजा a: {fmt(pyrBaseA)} cm</span>
                <span>उचाइ h: {fmt(pyrHeightH)} cm</span>
                <span>छड्के उचाइ l: {fmt(pyrSlantL.toFixed(2))} cm</span>
              </div>
            </div>

            {/* Calculations & Formulas */}
            <div className="md:col-span-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-[#142D4E] text-base">{L('नापहरू परिवर्तन गर्नुहोस् (Dimensions):', 'Adjust Dimensions:')}</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>आधारको भुजा (Base Edge a): {fmt(pyrBaseA)} cm</span>
                  </div>
                  <input type="range" min="6" max="24" step="2" value={pyrBaseA} onChange={(e) => setPyrBaseA(parseInt(e.target.value))} className="w-full accent-blue-600" />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>ठाडो उचाइ (Vertical Height h): {fmt(pyrHeightH)} cm</span>
                  </div>
                  <input type="range" min="4" max="20" step="1" value={pyrHeightH} onChange={(e) => setPyrHeightH(parseInt(e.target.value))} className="w-full accent-rose-600" />
                </div>
              </div>

              {/* Formula & Breakdown Cards */}
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-950">
                  <div className="font-bold">१) छड्के उचाइ (Slant Height l):</div>
                  <div>l² = h² + (a/2)² = {fmt(pyrHeightH)}² + ({fmt(pyrBaseA)}/2)² = {fmt(pyrHeightH ** 2)} + {fmt((pyrBaseA / 2) ** 2)}</div>
                  <div className="text-sm font-bold text-amber-900">➔ l = √{fmt(pyrHeightH ** 2 + (pyrBaseA / 2) ** 2)} = {fmt(pyrSlantL.toFixed(2))} cm</div>
                </div>

                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-blue-950">
                  <div className="font-bold">२) छड्के सतहको क्षेत्रफल (LSA) = 2al:</div>
                  <div>= 2 × {fmt(pyrBaseA)} × {fmt(pyrSlantL.toFixed(2))} = <span className="font-bold text-blue-900 text-sm">{fmt(pyrLSA.toFixed(1))} cm²</span></div>
                </div>

                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-950">
                  <div className="font-bold">३) पूरा सतहको क्षेत्रफल (TSA) = a² + 2al:</div>
                  <div>= {fmt(pyrBaseA)}² + {fmt(pyrLSA.toFixed(1))} = <span className="font-bold text-emerald-900 text-sm">{fmt(pyrTSA.toFixed(1))} cm²</span></div>
                </div>

                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1 text-purple-950">
                  <div className="font-bold">४) पिरामिडको आयतन (Volume V) = ⅓ a²h:</div>
                  <div>= ⅓ × {fmt(pyrBaseA)}² × {fmt(pyrHeightH)} = <span className="font-bold text-purple-900 text-sm">{fmt(pyrVolume.toFixed(1))} cm³</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB B: CONE EXPLORER ──────────────────────────────────────────────── */}
        {activeTab === 'cone' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-6 bg-[#142D4E] p-4 rounded-2xl flex flex-col justify-between text-white shadow-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-cyan-300">
                  {coneUnfolded ? L('सोलीको जाली (वृत्तांश Sector Net)', 'Cone Net (Sector)') : L('३डी सोली (3D Cone)', '3D Cone')}
                </span>
                <button
                  onClick={() => {
                    setConeUnfolded(!coneUnfolded);
                    kit.tap();
                  }}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg text-xs font-bold transition-all shadow-sm"
                >
                  {coneUnfolded ? L('३डी सोली बनाउनुहोस् (Fold)', 'Fold to Cone') : L('जाली खोल्नुहोस् (Unfold Net)', 'Unfold Net')}
                </button>
              </div>

              <div className="flex justify-center items-center h-64 bg-slate-900/60 rounded-xl p-2">
                {!coneUnfolded ? (
                  /* 3D Cone View */
                  <svg width={260} height={240} viewBox="0 0 260 240">
                    {/* Ellipse base: cx=130, cy=180, rx=70, ry=22 */}
                    <ellipse cx={130} cy={180} rx={70} ry={22} fill="#38bdf8" fillOpacity="0.25" stroke="#38bdf8" strokeWidth={2} />
                    {/* Apex V(130, 35) */}
                    {/* Slant lines */}
                    <line x1={60} y1={180} x2={130} y2={35} stroke="#38bdf8" strokeWidth={2.5} />
                    <line x1={200} y1={180} x2={130} y2={35} stroke="#38bdf8" strokeWidth={2.5} />

                    {/* Vertical height h */}
                    <line x1={130} y1={35} x2={130} y2={180} stroke="#f43f5e" strokeWidth={2} strokeDasharray="3" />
                    <text x={135} y={110} fill="#f43f5e" fontSize="12" fontWeight="bold">h = {fmt(coneHeightH)}</text>

                    {/* Radius r */}
                    <line x1={130} y1={180} x2={200} y2={180} stroke="#10b981" strokeWidth={2.5} />
                    <text x={165} y={172} fill="#10b981" fontSize="11" fontWeight="bold">r = {fmt(coneRadiusR)}</text>

                    {/* Slant height l label */}
                    <text x={80} y={105} fill="#fbbf24" fontSize="12" fontWeight="bold">l = {fmt(coneSlantL.toFixed(1))}</text>
                  </svg>
                ) : (
                  /* Unfolded Cone Net: Sector of radius l + Base Circle of radius r */
                  <svg width={260} height={240} viewBox="0 0 260 240">
                    {/* Sector: apex at (130, 30), arc below */}
                    <path d="M 130 30 L 40 130 A 110 110 0 0 0 220 130 Z" fill="#fbbf24" fillOpacity="0.25" stroke="#fbbf24" strokeWidth={2} />
                    <text x={130} y={90} fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">
                      वक्र सतह CSA = πrl
                    </text>
                    <text x={130} y={145} fill="#fbbf24" fontSize="10" textAnchor="middle">
                      चापको लम्बाइ = 2πr
                    </text>

                    {/* Base circle attached below */}
                    <circle cx={130} cy={185} r={32} fill="#38bdf8" fillOpacity="0.3" stroke="#38bdf8" strokeWidth={2} />
                    <text x={130} y={190} fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                      आधार πr²
                    </text>
                  </svg>
                )}
              </div>

              <div className="flex justify-between text-xs font-mono text-slate-300 mt-2">
                <span>अर्धव्याव्यास r: {fmt(coneRadiusR)} cm</span>
                <span>उचाइ h: {fmt(coneHeightH)} cm</span>
                <span>छड्के उचाइ l: {fmt(coneSlantL.toFixed(2))} cm</span>
              </div>
            </div>

            <div className="md:col-span-6 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-[#142D4E] text-base">{L('सोलीका नापहरू (Cone Controls):', 'Cone Parameters:')}</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-emerald-700 mb-1">
                    <span>आधार अर्धव्याव्यास (Radius r): {fmt(coneRadiusR)} cm</span>
                  </div>
                  <input type="range" min="3" max="14" step="1" value={coneRadiusR} onChange={(e) => setConeRadiusR(parseInt(e.target.value))} className="w-full accent-emerald-600" />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-rose-700 mb-1">
                    <span>ठाडो उचाइ (Height h): {fmt(coneHeightH)} cm</span>
                  </div>
                  <input type="range" min="6" max="30" step="1" value={coneHeightH} onChange={(e) => setConeHeightH(parseInt(e.target.value))} className="w-full accent-rose-600" />
                </div>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-950">
                  <div className="font-bold">१) छड्के उचाइ (Slant Height l) = √(r² + h²):</div>
                  <div className="text-sm font-bold text-amber-900">l = √({fmt(coneRadiusR)}² + {fmt(coneHeightH)}²) = {fmt(coneSlantL.toFixed(2))} cm</div>
                </div>

                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-blue-950">
                  <div className="font-bold">२) वक्र सतहको क्षेत्रफल (CSA) = πrl:</div>
                  <div>= (22/7) × {fmt(coneRadiusR)} × {fmt(coneSlantL.toFixed(2))} = <span className="font-bold text-blue-900 text-sm">{fmt(coneCSA.toFixed(1))} cm²</span></div>
                </div>

                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-950">
                  <div className="font-bold">३) पूरा सतहको क्षेत्रफल (TSA) = πr(r + l):</div>
                  <div>= <span className="font-bold text-emerald-900 text-sm">{fmt(coneTSA.toFixed(1))} cm²</span></div>
                </div>

                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl space-y-1 text-purple-950">
                  <div className="font-bold">४) सोलीको आयतन (Volume V) = ⅓ πr²h:</div>
                  <div>= <span className="font-bold text-purple-900 text-sm">{fmt(coneVolume.toFixed(1))} cm³</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB C: COMBINED SOLIDS LABORATORY ──────────────────────────────────── */}
        {activeTab === 'combined' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCombinedType('cyl_cone')}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  combinedType === 'cyl_cone' ? 'bg-[#167C80] text-white border-[#167C80]' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {L('१) बेलना + सोली (Cylinder + Cone: पाल/मन्दिर)', '1) Cylinder + Cone (Tent)')}
              </button>
              <button
                onClick={() => setCombinedType('cone_hemi')}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  combinedType === 'cone_hemi' ? 'bg-[#167C80] text-white border-[#167C80]' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {L('२) सोली + अर्धगोला (Cone + Hemisphere: लट्टू)', '2) Cone + Hemisphere (Top)')}
              </button>
              <button
                onClick={() => setCombinedType('cyl_hemi')}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  combinedType === 'cyl_hemi' ? 'bg-[#167C80] text-white border-[#167C80]' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {L('३) बेलना + अर्धगोला (Cylinder + Hemisphere: साइलो/ट्याङ्की)', '3) Cylinder + Hemisphere')}
              </button>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-600 p-3 rounded text-xs text-amber-950">
              <span className="font-bold">{L('पाठ्यपुस्तकको महत्वपूर्ण नियम (Exposed Surface Area Rule):', 'Crucial Rule:')}</span>
              <p className="mt-1">
                {L(
                  'संयुक्त ठोस वस्तुको पूरा सतहको क्षेत्रफल निकाल्दा दुई वस्तु जोडिएको भित्री साझा सतह (Joining Surface) लाई कहिल्यै पनि जोड्नु हुँदैन! केवल बाहिरी देखिने सतहहरूको मात्र क्षेत्रफल निकालिन्छ।',
                  'When calculating Total Surface Area of combined solids, NEVER include internal joining surfaces! Only exposed external surfaces count.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Wireframe Diagram of Combined Solid */}
              <div className="md:col-span-6 bg-slate-900 rounded-2xl p-4 flex justify-center text-white">
                <svg width={240} height={260} viewBox="0 0 240 260">
                  {combinedType === 'cyl_cone' && (
                    <>
                      {/* Cylinder Base */}
                      <ellipse cx={120} cy={220} rx={50} ry={16} fill="#38bdf8" fillOpacity="0.3" stroke="#38bdf8" strokeWidth={2} />
                      {/* Cylinder sides */}
                      <line x1={70} y1={130} x2={70} y2={220} stroke="#38bdf8" strokeWidth={2} />
                      <line x1={170} y1={130} x2={170} y2={220} stroke="#38bdf8" strokeWidth={2} />
                      {/* Joining internal boundary (Dashed) */}
                      <ellipse cx={120} cy={130} rx={50} ry={16} fill="none" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4" />
                      <text x={180} y={135} fill="#f43f5e" fontSize="10">भित्री सतह (Excluded)</text>

                      {/* Cone Apex V(120, 30) */}
                      <line x1={70} y1={130} x2={120} y2={30} stroke="#fbbf24" strokeWidth={2.5} />
                      <line x1={170} y1={130} x2={120} y2={30} stroke="#fbbf24" strokeWidth={2.5} />
                      <text x={120} y={20} fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">सोली (Cone)</text>
                      <text x={120} y={180} fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">बेलना (Cylinder)</text>
                    </>
                  )}

                  {combinedType === 'cone_hemi' && (
                    <>
                      {/* Hemisphere bottom */}
                      <path d="M 70 120 A 50 50 0 0 0 170 120 Z" fill="#34d399" fillOpacity="0.3" stroke="#34d399" strokeWidth={2} />
                      {/* Joining circle dashed */}
                      <ellipse cx={120} cy={120} rx={50} ry={16} fill="none" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4" />
                      {/* Cone top apex (120, 25) */}
                      <line x1={70} y1={120} x2={120} y2={25} stroke="#fbbf24" strokeWidth={2.5} />
                      <line x1={170} y1={120} x2={120} y2={25} stroke="#fbbf24" strokeWidth={2.5} />
                      <text x={120} y={75} fill="#fbbf24" fontSize="11" fontWeight="bold" textAnchor="middle">सोली</text>
                      <text x={120} y={160} fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle">अर्धगोला</text>
                    </>
                  )}

                  {combinedType === 'cyl_hemi' && (
                    <>
                      {/* Cylinder Base */}
                      <ellipse cx={120} cy={220} rx={50} ry={16} fill="#38bdf8" fillOpacity="0.3" stroke="#38bdf8" strokeWidth={2} />
                      <line x1={70} y1={120} x2={70} y2={220} stroke="#38bdf8" strokeWidth={2} />
                      <line x1={170} y1={120} x2={170} y2={220} stroke="#38bdf8" strokeWidth={2} />
                      {/* Joining dashed */}
                      <ellipse cx={120} cy={120} rx={50} ry={16} fill="none" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4" />
                      {/* Hemisphere dome top */}
                      <path d="M 70 120 A 50 50 0 0 1 170 120 Z" fill="#34d399" fillOpacity="0.3" stroke="#34d399" strokeWidth={2} />
                      <text x={120} y={90} fill="#34d399" fontSize="11" fontWeight="bold" textAnchor="middle">अर्धगोला डोम</text>
                      <text x={120} y={175} fill="#38bdf8" fontSize="11" fontWeight="bold" textAnchor="middle">बेलना</text>
                    </>
                  )}
                </svg>
              </div>

              {/* Formulas & Live Calculation */}
              <div className="md:col-span-6 space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-50 border rounded-xl space-y-1">
                  <div className="font-bold text-[#142D4E] text-sm">कुल बाहिरी सतहको क्षेत्रफल (Exposed Area):</div>
                  {combinedType === 'cyl_cone' && (
                    <>
                      <div className="text-slate-600">सूत्र: आधार (πr²) + बेलना वक्र (2πrh₁) + सोली वक्र (πrl)</div>
                      <div className="text-base font-bold text-emerald-700 pt-1">➔ TSA = {fmt(totalExposedArea.toFixed(1))} cm²</div>
                    </>
                  )}
                  {combinedType === 'cone_hemi' && (
                    <>
                      <div className="text-slate-600">सूत्र: सोली वक्र सतह (πrl) + अर्धगोला वक्र सतह (2πr²)</div>
                      <div className="text-base font-bold text-emerald-700 pt-1">➔ TSA = {fmt(totalExposedArea.toFixed(1))} cm²</div>
                    </>
                  )}
                  {combinedType === 'cyl_hemi' && (
                    <>
                      <div className="text-slate-600">सूत्र: आधार (πr²) + बेलना वक्र (2πrh₁) + अर्धगोला (2πr²)</div>
                      <div className="text-base font-bold text-emerald-700 pt-1">➔ TSA = {fmt(totalExposedArea.toFixed(1))} cm²</div>
                    </>
                  )}
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1">
                  <div className="font-bold text-purple-950 text-sm">कुल आयतन (Total Volume):</div>
                  <div className="text-slate-600">V_total = V₁ + V₂ (दुवै वस्तुको आयतनको जोड)</div>
                  <div className="text-base font-bold text-purple-900 pt-1">➔ V = {fmt(totalCombVolume.toFixed(1))} cm³</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB D: COST & WATER TANK CAPACITY ───────────────────────────────────── */}
        {activeTab === 'costCalc' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-[#142D4E] text-base">
              {L('बेलनाकार पानी ट्याङ्की: आयतन (लिटर) र रंग लगाउने लागत', 'Cylindrical Water Tank Capacity & Painting Cost')}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-1">अर्धव्याव्यास (Radius r मिटर):</span>
                <input type="number" step="0.5" value={tankRadiusM} onChange={(e) => setTankRadiusM(parseFloat(e.target.value) || 1)} className="w-full p-2 border rounded-xl font-mono font-bold" />
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-1">उचाइ (Height h मिटर):</span>
                <input type="number" step="0.5" value={tankHeightM} onChange={(e) => setTankHeightM(parseFloat(e.target.value) || 1)} className="w-full p-2 border rounded-xl font-mono font-bold" />
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-1">रंग लगाउने दर (प्रति वर्ग मि. रु.):</span>
                <input type="number" value={costPerSqM} onChange={(e) => setCostPerSqM(parseFloat(e.target.value) || 0)} className="w-full p-2 border rounded-xl font-mono font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl font-mono text-xs space-y-1.5">
                <span className="font-bold text-blue-900 text-sm block">१) ट्याङ्कीको पानी क्षमता (Water Capacity):</span>
                <div>आयतन V = πr²h = (22/7) × {fmt(tankRadiusM)}² × {fmt(tankHeightM)}</div>
                <div>= <span className="font-bold">{fmt(tankVolM3.toFixed(2))} घन मिटर (m³)</span></div>
                <div className="text-slate-600">नियम: १ घन मिटर = १,००० लिटर पानी</div>
                <div className="text-base font-bold text-blue-950 pt-1">
                  ➔ कुल क्षमता = {fmt(Math.round(tankCapacityLitres).toLocaleString())} लिटर पानी
                </div>
              </div>

              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl font-mono text-xs space-y-1.5">
                <span className="font-bold text-[#167C80] text-sm block">२) बाहिरी भाग रंग लगाउने लागत (Painting Cost):</span>
                <div>रंग लगाइने क्षेत्रफल (वक्र सतह + माथिल्लो ढक्कन)</div>
                <div>A = 2πrh + πr² = <span className="font-bold">{fmt(tankPaintingArea.toFixed(2))} m²</span></div>
                <div>लागत = क्षेत्रफल × दर = {fmt(tankPaintingArea.toFixed(2))} × रु. {fmt(costPerSqM)}</div>
                <div className="text-base font-bold text-emerald-800 pt-1">
                  ➔ कुल रंग लगाउने खर्च = रु. {fmt(Math.round(totalPaintingCost).toLocaleString())}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default AreaVolume3DExplorer;

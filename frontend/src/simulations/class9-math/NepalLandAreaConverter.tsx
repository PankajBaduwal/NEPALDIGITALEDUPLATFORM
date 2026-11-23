import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

// CDC Textbook Constants:
// Pahari (Ropani):
// 1 Ropani = 16 Aana = 64 Paisa = 256 Daam = 5476 sq ft = 508.74 sq m
// 1 Aana = 342.25 sq ft = 31.80 sq m
// 1 Paisa = 85.5625 sq ft
// 1 Daam = 21.390625 sq ft
const SQFT_PER_ROPANI = 5476;
const SQFT_PER_AANA = 342.25;
const SQFT_PER_PAISA = 85.5625;
const SQFT_PER_DAAM = 21.390625;
const SQM_TO_SQFT = 10.7639;

// Terai (Bigha):
// 1 Bigha = 20 Kattha = 400 Dhur = 72900 sq ft = 6772.63 sq m
// 1 Kattha = 3645 sq ft = 338.63 sq m
// 1 Dhur = 182.25 sq ft = 16.93 sq m
const SQFT_PER_BIGHA = 72900;
const SQFT_PER_KATTHA = 3645;
const SQFT_PER_DHUR = 182.25;

const QUIZ_QUESTIONS = [
  {
    np: 'नेपालको पहाडी भूभागमा १ रोपनी बराबर कति आना हुन्छ?',
    en: 'In Nepal\'s hilly region, how many Aana make 1 Ropani?',
    options: [
      { key: 'A', label: '४ आना' },
      { key: 'B', label: '१२ आना' },
      { key: 'C', label: '१६ आना (16 Aana)' },
      { key: 'D', label: '२० आना' },
    ],
    answer: 'C',
  },
  {
    np: 'तराई भूभागमा १ बिघा बराबर कति कट्ठा हुन्छ?',
    en: 'In the Terai region, how many Kattha make 1 Bigha?',
    options: [
      { key: 'A', label: '१० कट्ठा' },
      { key: 'B', label: '१६ कट्ठा' },
      { key: 'C', label: '२० कट्ठा (20 Kattha)' },
      { key: 'D', label: '४० कट्ठा' },
    ],
    answer: 'C',
  },
  {
    np: 'पाठ्यपुस्तक अनुसार १ रोपनीमा कति वर्ग फिट (sq. ft) क्षेत्रफल हुन्छ?',
    en: 'According to the CDC textbook, how many square feet are in 1 Ropani?',
    options: [
      { key: 'A', label: '५,४७६ वर्ग फिट (5,476 sq. ft)' },
      { key: 'B', label: '३,६४५ वर्ग फिट' },
      { key: 'C', label: '७,२९० वर्ग फिट' },
      { key: 'D', label: '१०,००० वर्ग फिट' },
    ],
    answer: 'A',
  },
  {
    np: '१ कट्ठा बराबर कति धुर हुन्छ?',
    en: 'How many Dhur make 1 Kattha?',
    options: [
      { key: 'A', label: '४ धुर' },
      { key: 'B', label: '१६ धुर' },
      { key: 'C', label: '२० धुर (20 Dhur)' },
      { key: 'D', label: '१०० धुर' },
    ],
    answer: 'C',
  },
];

export const NepalLandAreaConverter: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U5-03',
    chapter: 5,
    titleNp: 'नेपाल जग्गा नाप तथा क्षेत्रफल रूपान्तरण',
    titleEn: 'Nepal Land Measurement and Area Converter',
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'converter' | 'plot' | 'table'>('converter');

  // Direct Area Input in sq ft or sq m
  const [inputUnit, setInputUnit] = useState<'sqft' | 'sqm'>('sqft');
  const [inputValue, setInputValue] = useState<number>(10952); // default 2 Ropani

  const totalSqFt = inputUnit === 'sqft' ? inputValue : inputValue * SQM_TO_SQFT;
  const totalSqM = inputUnit === 'sqm' ? inputValue : inputValue / SQM_TO_SQFT;

  // Convert to Ropani - Aana - Paisa - Daam
  const ropani = Math.floor(totalSqFt / SQFT_PER_ROPANI);
  const remAfterRopani = totalSqFt % SQFT_PER_ROPANI;

  const aana = Math.floor(remAfterRopani / SQFT_PER_AANA);
  const remAfterAana = remAfterRopani % SQFT_PER_AANA;

  const paisa = Math.floor(remAfterAana / SQFT_PER_PAISA);
  const remAfterPaisa = remAfterAana % SQFT_PER_PAISA;

  const daam = Math.round((remAfterPaisa / SQFT_PER_DAAM) * 10) / 10;

  // Convert to Bigha - Kattha - Dhur
  const bigha = Math.floor(totalSqFt / SQFT_PER_BIGHA);
  const remAfterBigha = totalSqFt % SQFT_PER_BIGHA;

  const kattha = Math.floor(remAfterBigha / SQFT_PER_KATTHA);
  const remAfterKattha = remAfterBigha % SQFT_PER_KATTHA;

  const dhur = Math.round((remAfterKattha / SQFT_PER_DHUR) * 10) / 10;

  // Virtual Land Plot Workspace
  const [plotShape, setPlotShape] = useState<'rect' | 'triangle'>('rect');
  const [plotL, setPlotL] = useState<number>(40); // in meters
  const [plotB, setPlotB] = useState<number>(25); // in meters
  const [triA, setTriA] = useState<number>(30); // in meters
  const [triB, setTriB] = useState<number>(40); // in meters
  const [triC, setTriC] = useState<number>(50); // in meters

  let calculatedPlotSqM = 0;
  if (plotShape === 'rect') {
    calculatedPlotSqM = plotL * plotB;
  } else {
    const s = (triA + triB + triC) / 2;
    const prod = s * (s - triA) * (s - triB) * (s - triC);
    calculatedPlotSqM = prod > 0 ? Math.sqrt(prod) : 0;
  }
  const calculatedPlotSqFt = calculatedPlotSqM * SQM_TO_SQFT;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! नेपालको परम्परागत जग्गा नाप प्रणाली (रोपनी-आना-पैसा-दाम र बिघा-कट्ठा-धुर) तथा वर्ग मिटर/फिट रूपान्तरण सिकौं!',
        'Welcome! Explore traditional Nepal land measurement systems (Ropani & Bigha) and area unit conversions!'
      )}
    >
      <div className="space-y-6" style={{ fontFamily: isNe ? FONT_NP : 'inherit' }}>
        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl max-w-xl mx-auto shadow-inner">
          <button
            onClick={() => setActiveTab('converter')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'converter'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>🔄</span>
            <span>{L('१. जग्गा रूपान्तरण क्याल्कुलेटर', '1. Converter')}</span>
          </button>
          <button
            onClick={() => setActiveTab('plot')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'plot'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>📐</span>
            <span>{L('२. घडेरी नाप कार्यक्षेत्र', '2. Land Plot Studio')}</span>
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'table'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>📋</span>
            <span>{L('३. पाठ्यपुस्तक दर तालिका', '3. Unit Tables')}</span>
          </button>
        </div>

        {activeTab === 'converter' && (
          /* =========================================================================
             CONVERTER CALCULATOR
             ========================================================================= */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-200 mb-2 flex items-center gap-2">
                <span>🔄</span>
                <span>{L('नेपाल जग्गा एकाइ रूपान्तरण (R-A-P-D र B-K-D)', 'Nepal Land Unit Converter')}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'जग्गाको कुल क्षेत्रफल (वर्ग फिट वा वर्ग मिटर) प्रविष्ट गर्नुहोस् र सो क्षेत्रफल पहाडी प्रथा (रोपनी-आना-पैसा-दाम) तथा तराई प्रथा (बिघा-कट्ठा-धुर) मा स्वचालित रुपमा विभाजन गर्नुहोस्।',
                  'Enter total land area in sq. ft or sq. meters to convert into Pahari (Ropani-Aana-Paisa-Daam) and Terai (Bigha-Kattha-Dhur) units.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Input Panel */}
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
                  {L('क्षेत्रफल प्रविष्ट गर्नुहोस्', 'Input Land Area')}
                </h3>

                {/* Unit Switch */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setInputUnit('sqft')}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs border ${
                      inputUnit === 'sqft' ? 'bg-emerald-600 text-white' : 'bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    {L('वर्ग फिट (sq. ft)', 'Square Feet (sq ft)')}
                  </button>
                  <button
                    onClick={() => setInputUnit('sqm')}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs border ${
                      inputUnit === 'sqm' ? 'bg-emerald-600 text-white' : 'bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    {L('वर्ग मिटर (sq. m)', 'Square Meters (m²)')}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    {inputUnit === 'sqft' ? L('क्षेत्रफल (वर्ग फिटमा):', 'Area in sq. ft:') : L('क्षेत्रफल (वर्ग मिटरमा):', 'Area in m²:')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={inputValue}
                    onChange={(e) => setInputValue(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-500 font-mono text-xl font-bold dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">
                    {L('नमुना घडेरीहरू (Textbook Presets):', 'Sample Plots:')}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => { setInputUnit('sqft'); setInputValue(5476); }}
                      className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border hover:bg-gray-100 font-semibold text-left"
                    >
                      १ रोपनी (5,476 sq ft)
                    </button>
                    <button
                      onClick={() => { setInputUnit('sqft'); setInputValue(342.25); }}
                      className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border hover:bg-gray-100 font-semibold text-left"
                    >
                      १ आना (342.25 sq ft)
                    </button>
                    <button
                      onClick={() => { setInputUnit('sqft'); setInputValue(72900); }}
                      className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border hover:bg-gray-100 font-semibold text-left"
                    >
                      १ बिघा (72,900 sq ft)
                    </button>
                    <button
                      onClick={() => { setInputUnit('sqft'); setInputValue(3645); }}
                      className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border hover:bg-gray-100 font-semibold text-left"
                    >
                      १ कट्ठा (3,645 sq ft)
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                  <div><strong>{L('कुल क्षेत्रफल:', 'Equivalent Area:')}</strong></div>
                  <div>• {isNe ? toNp(totalSqFt.toFixed(2)) : totalSqFt.toFixed(2)} sq. ft</div>
                  <div>• {isNe ? toNp(totalSqM.toFixed(2)) : totalSqM.toFixed(2)} sq. m</div>
                </div>
              </div>

              {/* Conversion Outputs */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1. Pahari System (R-A-P-D) */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <span>🏔️</span>
                      <span>{L('पहाडी प्रथा: रोपनी - आना - पैसा - दाम', 'Hilly System: Ropani - Aana - Paisa - Daam')}</span>
                    </span>
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 px-2 py-1 rounded-full font-bold">
                      R-A-P-D
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                      <div className="text-xs text-gray-500">{L('रोपनी (Ropani)', 'Ropani')}</div>
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-1">
                        {isNe ? toNp(ropani) : ropani}
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                      <div className="text-xs text-gray-500">{L('आना (Aana)', 'Aana')}</div>
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-1">
                        {isNe ? toNp(aana) : aana}
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                      <div className="text-xs text-gray-500">{L('पैसा (Paisa)', 'Paisa')}</div>
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-1">
                        {isNe ? toNp(paisa) : paisa}
                      </div>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                      <div className="text-xs text-gray-500">{L('दाम (Daam)', 'Daam')}</div>
                      <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 font-mono mt-1">
                        {isNe ? toNp(daam) : daam}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-xs text-gray-600 dark:text-gray-300 font-mono">
                    {L(
                      `अर्थात्: ${toNp(ropani)} रोपनी - ${toNp(aana)} आना - ${toNp(paisa)} पैसा - ${toNp(daam)} दाम`,
                      `Standard format: ${ropani}-${aana}-${paisa}-${daam} (R-A-P-D)`
                    )}
                  </div>
                </div>

                {/* 2. Terai System (B-K-D) */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <span>🌾</span>
                      <span>{L('तराई प्रथा: बिघा - कट्ठा - धुर', 'Terai System: Bigha - Kattha - Dhur')}</span>
                    </span>
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-full font-bold">
                      B-K-D
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl">
                      <div className="text-xs text-gray-500">{L('बिघा (Bigha)', 'Bigha')}</div>
                      <div className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono mt-1">
                        {isNe ? toNp(bigha) : bigha}
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl">
                      <div className="text-xs text-gray-500">{L('कट्ठा (Kattha)', 'Kattha')}</div>
                      <div className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono mt-1">
                        {isNe ? toNp(kattha) : kattha}
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl">
                      <div className="text-xs text-gray-500">{L('धुर (Dhur)', 'Dhur')}</div>
                      <div className="text-2xl font-black text-amber-700 dark:text-amber-300 font-mono mt-1">
                        {isNe ? toNp(dhur) : dhur}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-xs text-gray-600 dark:text-gray-300 font-mono">
                    {L(
                      `अर्थात्: ${toNp(bigha)} बिघा - ${toNp(kattha)} कट्ठा - ${toNp(dhur)} धुर`,
                      `Standard format: ${bigha}-${kattha}-${dhur} (B-K-D)`
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plot' && (
          /* =========================================================================
             VIRTUAL LAND PLOT WORKSPACE
             ========================================================================= */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 p-5 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                <span>📐</span>
                <span>{L('घडेरी नापी तथा नाप रूपान्तरण कार्यक्षेत्र', 'Land Plot Studio & Conversion')}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'घडेरीको आकार (आयताकार वा त्रिकोणात्मक) छनोट गर्नुहोस् र भुजाहरू राखेर क्षेत्रफल पत्ता लगाई सरकारी नापी एकाइहरूमा रूपान्तरण गर्नुहोस्।',
                  'Select plot shape (rectangular or triangular) to calculate area and translate into official land units.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setPlotShape('rect')}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs border ${
                      plotShape === 'rect' ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    {L('आयताकार घडेरी (Rectangular)', 'Rectangular Plot')}
                  </button>
                  <button
                    onClick={() => setPlotShape('triangle')}
                    className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs border ${
                      plotShape === 'triangle' ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-700'
                    }`}
                  >
                    {L('त्रिकोणात्मक घडेरी (Triangular)', 'Triangular Plot')}
                  </button>
                </div>

                {plotShape === 'rect' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 font-semibold">{L('लम्बाइ l (मिटरमा):', 'Length (m):')}</label>
                      <input
                        type="number"
                        value={plotL}
                        onChange={(e) => setPlotL(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 rounded-lg border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 dark:text-gray-400 font-semibold">{L('चौडाइ b (मिटरमा):', 'Breadth (m):')}</label>
                      <input
                        type="number"
                        value={plotB}
                        onChange={(e) => setPlotB(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 rounded-lg border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 font-semibold">a (m):</label>
                        <input
                          type="number"
                          value={triA}
                          onChange={(e) => setTriA(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full px-2 py-1 rounded border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 font-semibold">b (m):</label>
                        <input
                          type="number"
                          value={triB}
                          onChange={(e) => setTriB(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full px-2 py-1 rounded border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 dark:text-gray-400 font-semibold">c (m):</label>
                        <input
                          type="number"
                          value={triC}
                          onChange={(e) => setTriC(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full px-2 py-1 rounded border font-mono font-bold dark:bg-gray-700 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setInputUnit('sqft');
                    setInputValue(Math.round(calculatedPlotSqFt * 10) / 10);
                    setActiveTab('converter');
                  }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow transition-all"
                >
                  {L('क्याल्कुलेटरमा रूपान्तरण हेर्नुहोस् →', 'View in Converter →')}
                </button>
              </div>

              <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
                <h4 className="font-bold text-gray-800 dark:text-gray-100 border-b pb-2">
                  {L('घडेरीको क्षेत्रफल नतिजा', 'Plot Area Result')}
                </h4>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-xl">
                    <div className="text-xs text-gray-500">{L('वर्ग मिटर (m²)', 'Square Meters')}</div>
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
                      {isNe ? toNp(calculatedPlotSqM.toFixed(2)) : calculatedPlotSqM.toFixed(2)} m²
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                    <div className="text-xs text-gray-500">{L('वर्ग फिट (sq. ft)', 'Square Feet')}</div>
                    <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                      {isNe ? toNp(calculatedPlotSqFt.toFixed(2)) : calculatedPlotSqFt.toFixed(2)} sq ft
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'table' && (
          /* =========================================================================
             OFFICIAL TEXTBOOK UNIT TABLES
             ========================================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3">
              <h3 className="font-bold text-emerald-800 dark:text-emerald-300 border-b pb-2 text-base flex items-center gap-2">
                <span>🏔️</span>
                <span>{L('पहाडी भेगको नाप तालिका (Pahari System)', 'Hilly Region Standard')}</span>
              </h3>
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  <tr className="py-2"><td className="font-bold py-1.5">१ रोपनी</td><td>१६ आना = ६४ पैसा = २५६ दाम</td></tr>
                  <tr className="py-2"><td className="font-bold py-1.5">१ आना</td><td>४ पैसा = १६ दाम</td></tr>
                  <tr className="py-2"><td className="font-bold py-1.5">१ पैसा</td><td>४ दाम</td></tr>
                  <tr className="py-2"><td className="font-bold py-1.5">१ रोपनी (वर्ग फिट)</td><td>५,४७६ वर्ग फिट (५०८.७४ m²)</td></tr>
                  <tr className="py-2"><td className="font-bold py-1.5">१ आना (वर्ग फिट)</td><td>३४२.२५ वर्ग फिट (३१.८० m²)</td></tr>
                  <tr className="py-2"><td className="font-bold py-1.5">१ पैसा (वर्ग फिट)</td><td>८५.५६ वर्ग फिट</td></tr>
                  <tr className="py-2"><td className="font-bold py-1.5">१ दाम (वर्ग फिट)</td><td>२१.३९ वर्ग फिट</td></tr>
                </tbody>
              </table>
            </div>

            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3">
              <h3 className="font-bold text-amber-800 dark:text-amber-300 border-b pb-2 text-base flex items-center gap-2">
                <span>🌾</span>
                <span>{L('तराई भेगको नाप तालिका (Terai System)', 'Terai Region Standard')}</span>
              </h3>
              <table className="w-full text-xs text-left">
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  <tr className="py-2"><td className="font-bold py-1.5">१ बिघा</td><td>२० कट्ठा = ४०० धुर</td></tr>
                  <tr className="py-2"><td className="font-bold py-1.5">१ कट्ठा</td><td>२० धुर</td></tr>
                  <tr className="py-2"><td className="font-bold py-1.5">१ बिघा (वर्ग फिट)</td><td>७२,९०० वर्ग फिट (६,७७२.६३ m²)</td></tr>
                  <tr className="py-2"><td className="font-bold py-1.5">१ कट्ठा (वर्ग फिट)</td><td>३,६४५ वर्ग फिट (३३८.६३ m²)</td></tr>
                  <tr className="py-2"><td className="font-bold py-1.5">१ धुर (वर्ग फिट)</td><td>१८२.२५ वर्ग फिट (१६.९३ m²)</td></tr>
                  <tr className="py-2"><td className="font-bold py-1.5">१ बिघा (रोपनीमा)</td><td>१३ रोपनी ४ आना ३.३ पैसा</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default NepalLandAreaConverter;

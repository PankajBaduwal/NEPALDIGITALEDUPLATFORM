import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface WaterTariff {
  pipeSize: string;
  pipeNameEn: string;
  pipeNameNp: string;
  minUnits: number; // in 1000 Liters (units)
  minCharge: number; // in Rs
  ratePerUnit: number; // per additional 1000 Liters
}

const WATER_TARIFFS: WaterTariff[] = [
  { pipeSize: '1/2"', pipeNameEn: '1/2 inch (Standard Domestic)', pipeNameNp: '१/२ इन्च (घरायसी सामान्य)', minUnits: 10, minCharge: 100, ratePerUnit: 32 },
  { pipeSize: '3/4"', pipeNameEn: '3/4 inch (Domestic / Commercial)', pipeNameNp: '३/४ इन्च (घरायसी / व्यापारिक)', minUnits: 27, minCharge: 1910, ratePerUnit: 71 },
  { pipeSize: '1"', pipeNameEn: '1 inch (Large Commercial)', pipeNameNp: '१ इन्च (ठूलो व्यावसायिक)', minUnits: 56, minCharge: 3960, ratePerUnit: 71 },
];

const PAYMENT_TIMELINES = [
  { id: 'early', nameEn: 'Within 1st to 22nd day (3% Rebate)', nameNp: 'पहिलो देखि २२ औँ दिनभित्र (३% छुट)', factor: -0.03, type: 'rebate' },
  { id: 'regular', nameEn: '23rd to 30th day (Regular Amount)', nameNp: '२३ औँ देखि ३० औँ दिनसम्म (बिल बराबर रकम)', factor: 0, type: 'regular' },
  { id: 'penalty1', nameEn: '31st to 45th day (5% Fine)', nameNp: '३१ औँ देखि ४५ औँ दिनसम्म (५% थप दस्तुर)', factor: 0.05, type: 'fine' },
  { id: 'penalty2', nameEn: '46th to 60th day (10% Fine)', nameNp: '४६ औँ देखि ६० औँ दिनसम्म (१०% थप दस्तुर)', factor: 0.10, type: 'fine' },
  { id: 'penalty3', nameEn: 'Beyond 60 days (25% Fine)', nameNp: '६० दिनभन्दा बढी (२५% थप दस्तुर)', factor: 0.25, type: 'fine' },
];

const QUIZ_QUESTIONS = [
  {
    np: 'काठमाडौँ उपत्यका खानेपानी लिमिटेडको १/२ इन्च पाइपको न्यूनतम खपत कति लिटर (वा युनिट) मानिन्छ?',
    en: 'What is the minimum water consumption unit (or volume) for a 1/2 inch pipe?',
    options: [
      { key: 'A', label: '५,००० लिटर (५ युनिट / 5,000 Liters)' },
      { key: 'B', label: '१०,००० लिटर (१० युनिट / 10,000 Liters)' },
      { key: 'C', label: '१५,००० लिटर (१५ युनिट / 15,000 Liters)' },
      { key: 'D', label: '२०,००० लिटर (२० युनिट / 20,000 Liters)' },
    ],
    answer: 'B',
  },
  {
    np: 'खानेपानी महसुलमा ढल निकास (Sewerage) सेवा शुल्क सामान्यतया पानीको महसुलको कति प्रतिशत लाग्दछ?',
    en: 'What percentage is normally charged as Sewerage fee on the water tariff?',
    options: [
      { key: 'A', label: '१०%' },
      { key: 'B', label: '२५%' },
      { key: 'C', label: '५०%' },
      { key: 'D', label: '१००%' },
    ],
    answer: 'C',
  },
  {
    np: 'नेपाल टेलिकमको ल्याण्डलाइन फोनमा १७५ कलसम्म न्यूनतम रु. २०० लाग्छ। यदि एक ग्राहकले २२५ कल गरे भने अतिरिक्त कल शुल्क (रु. १ प्रति कल) कति हुन्छ?',
    en: 'For landline PSTN, 175 calls are covered in Rs 200 minimum. If 225 calls are made, what is the charge for extra calls at Rs 1/call?',
    options: [
      { key: 'A', label: 'रु. २५' },
      { key: 'B', label: 'रु. ५०' },
      { key: 'C', label: 'रु. ७५' },
      { key: 'D', label: 'रु. १००' },
    ],
    answer: 'B',
  },
  {
    np: 'टेलिफोन बिलमा दूरसञ्चार सेवा दस्तुर (TSC १०%) र त्यसपछि १३% मूल्य अभिवृद्धि कर (VAT) जोड्दा कुन रकममा भ्याट गणना गरिन्छ?',
    en: 'In telephone billing, after adding 10% TSC, on which amount is the 13% VAT calculated?',
    options: [
      { key: 'A', label: 'कल शुल्कमा मात्र (Only call charge)' },
      { key: 'B', label: 'सेवा शुल्क (TSC) मा मात्र' },
      { key: 'C', label: 'कल शुल्क र TSC दुवैको जम्मा रकममा (Total of Call Charge + TSC)' },
      { key: 'D', label: 'रु. २०० मा मात्र' },
    ],
    answer: 'C',
  },
];

export const WaterTelephoneBillCalculator: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U4-02',
    chapter: 4,
    titleNp: 'खानेपानी तथा टेलिफोन महसुल क्याल्कुलेटर',
    titleEn: 'Water and Telephone Bill Calculator',
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeService, setActiveService] = useState<'water' | 'telephone'>('water');

  // --- Water state ---
  const [pipeIndex, setPipeIndex] = useState<number>(0);
  const [prevWaterMeter, setPrevWaterMeter] = useState<number>(1420);
  const [currWaterMeter, setCurrWaterMeter] = useState<number>(1445);
  const [hasSewerage, setHasSewerage] = useState<boolean>(true);
  const [timelineIndex, setTimelineIndex] = useState<number>(0);

  // Water calculations
  const selectedTariff = WATER_TARIFFS[pipeIndex];
  const waterUnits = Math.max(0, currWaterMeter - prevWaterMeter); // 1 unit = 1,000 Liters
  const waterVolumeLiters = waterUnits * 1000;

  const minCharge = selectedTariff.minCharge;
  const extraUnits = Math.max(0, waterUnits - selectedTariff.minUnits);
  const extraCharge = extraUnits * selectedTariff.ratePerUnit;
  const basicWaterFee = minCharge + extraCharge;
  const sewerageFee = hasSewerage ? Math.round(basicWaterFee * 0.5) : 0;
  const totalWaterBillBase = basicWaterFee + sewerageFee;

  const selectedTimeline = PAYMENT_TIMELINES[timelineIndex];
  const adjustmentAmount = Math.round(totalWaterBillBase * Math.abs(selectedTimeline.factor));
  const netWaterPayable = selectedTimeline.factor < 0
    ? totalWaterBillBase - adjustmentAmount
    : totalWaterBillBase + adjustmentAmount;

  // --- Telephone state ---
  const [phoneType, setPhoneType] = useState<'pstn' | 'mobile'>('pstn');
  const [callUnits, setCallUnits] = useState<number>(240); // total calls/units
  const [roamingOrAddon, setRoamingOrAddon] = useState<number>(0);

  // PSTN constants (from CDC Textbook)
  // 175 calls min = Rs 200, additional call = Rs 1
  const pstnMinCalls = 175;
  const pstnMinCharge = 200;
  const pstnRatePerCall = 1.0;

  // GSM Mobile Postpaid: Plan base Rs 300, includes 300 minutes, extra Rs 1.20/min
  const gsmBaseCharge = 300;
  const gsmIncludedCalls = 250;
  const gsmRatePerExtra = 1.20;

  let basePhoneCharge = 0;
  let extraCallsCount = 0;
  let extraPhoneCharge = 0;

  if (phoneType === 'pstn') {
    extraCallsCount = Math.max(0, callUnits - pstnMinCalls);
    extraPhoneCharge = extraCallsCount * pstnRatePerCall;
    basePhoneCharge = pstnMinCharge + extraPhoneCharge + roamingOrAddon;
  } else {
    extraCallsCount = Math.max(0, callUnits - gsmIncludedCalls);
    extraPhoneCharge = extraCallsCount * gsmRatePerExtra;
    basePhoneCharge = gsmBaseCharge + extraPhoneCharge + roamingOrAddon;
  }

  // TSC: 10% on telecommunication service
  const tscAmount = Math.round(basePhoneCharge * 0.10 * 100) / 100;
  const amountBeforeVat = basePhoneCharge + tscAmount;
  // VAT: 13% on total service
  const vatAmount = Math.round(amountBeforeVat * 0.13 * 100) / 100;
  const grandTotalPhoneBill = Math.round((amountBeforeVat + vatAmount) * 100) / 100;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'खानेपानी तथा टेलिफोन महसुल क्याल्कुलेटरमा स्वागत छ! KUKL को खानेपानी र NTC को टेलिफोन बिलिङ प्रणाली सिकौं।',
        'Welcome to Water and Telephone Bill Calculator! Learn KUKL water tariffs and NTC telephone billing.'
      )}
    >
      <div className="space-y-6" style={{ fontFamily: isNe ? FONT_NP : 'inherit' }}>
        {/* Service Switcher Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl max-w-xl mx-auto shadow-inner">
          <button
            onClick={() => setActiveService('water')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${
              activeService === 'water'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>💧</span>
            <span>{L('खानेपानी महसुल (Water Bill)', 'Water Bill (KUKL Tariff)')}</span>
          </button>
          <button
            onClick={() => setActiveService('telephone')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${
              activeService === 'telephone'
                ? 'bg-teal-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>☎️</span>
            <span>{L('टेलिफोन महसुल (Telephone Bill)', 'Telephone Bill (NTC Billing)')}</span>
          </button>
        </div>

        {activeService === 'water' ? (
          /* =========================================================================
             WATER BILL CALCULATOR (खानेपानी महसुल)
             ========================================================================= */
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/30 p-5 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                <span>🚰</span>
                <span>{L('खानेपानी महसुल निर्धारण प्रणाली (KUKL नियम)', 'Drinking Water Billing System (CDC Rules)')}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'खानेपानीको मिटर रिडिङमा १ युनिट बराबर १,००० लिटर हुन्छ। पाइपको आकार अनुसार न्यूनतम महसुल र न्यूनतम युनिट फरक हुन्छ। ढल निकास जडित भएमा ५०% ढल महसुल थप हुन्छ र बिल भुक्तानी मिति अनुसार छुट वा थप दस्तुर लाग्दछ।',
                  'In drinking water meter reading, 1 unit equals 1,000 liters. The minimum charge and included units depend on pipe diameter. Sewerage charge is 50%, with rebates/fines depending on payment timeline.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Controls */}
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-5">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
                  {L('मीटर तथा पाइप विवरण', 'Meter & Pipe Inputs')}
                </h3>

                {/* Pipe Size Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {L('पाइपको आकार (Pipe Diameter):', 'Pipe Diameter:')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {WATER_TARIFFS.map((tariff, idx) => (
                      <button
                        key={tariff.pipeSize}
                        onClick={() => setPipeIndex(idx)}
                        className={`p-2.5 rounded-xl text-center border transition-all ${
                          pipeIndex === idx
                            ? 'bg-blue-600 text-white border-blue-600 font-bold shadow'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-base font-extrabold">{tariff.pipeSize}</div>
                        <div className="text-[11px] opacity-90">{isNe ? tariff.pipeSize : tariff.pipeSize}</div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
                    {L(
                      `चयन गरिएको: ${selectedTariff.pipeNameNp} (न्यूनतम ${toNp(selectedTariff.minUnits)} युनिट = रु. ${toNp(selectedTariff.minCharge)}, अतिरिक्त रु. ${toNp(selectedTariff.ratePerUnit)}/युनिट)`,
                      `Selected: ${selectedTariff.pipeNameEn} (Min ${selectedTariff.minUnits} units = Rs ${selectedTariff.minCharge}, Extra Rs ${selectedTariff.ratePerUnit}/unit)`
                    )}
                  </div>
                </div>

                {/* Meter Readings */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      {L('अघिल्लो महिनाको मिटर रिडिङ (Previous Reading):', 'Previous Meter Reading (Units):')}
                    </label>
                    <input
                      type="number"
                      value={prevWaterMeter}
                      onChange={(e) => setPrevWaterMeter(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-base font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      {L('हालको मिटर रिडिङ (Current Reading):', 'Current Meter Reading (Units):')}
                    </label>
                    <input
                      type="number"
                      value={currWaterMeter}
                      min={prevWaterMeter}
                      onChange={(e) => setCurrWaterMeter(Math.max(prevWaterMeter, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-lg border border-blue-400 dark:border-blue-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-base font-bold"
                    />
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                      {L('खपत युनिट / लिटर:', 'Consumption Volume:')}
                    </span>
                    <span className="text-base font-black text-blue-800 dark:text-blue-300">
                      {isNe ? toNp(waterUnits) : waterUnits} {L('युनिट', 'units')} ({isNe ? toNp(waterVolumeLiters) : waterVolumeLiters.toLocaleString()} {L('लिटर', 'Liters')})
                    </span>
                  </div>
                </div>

                {/* Sewerage Toggle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div>
                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      {L('ढल निकास सुविधा (Sewerage Service):', 'Sewerage Connected (50%):')}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {L('खानेपानी महसुलको ५०% ढल महसुल थपिन्छ', 'Adds 50% of water fee as sewerage')}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasSewerage}
                    onChange={(e) => setHasSewerage(e.target.checked)}
                    className="w-6 h-6 text-blue-600 rounded cursor-pointer"
                  />
                </div>

                {/* Payment Timeline */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {L('बिल भुक्तानी गरेको समयावधि (Payment Timeline):', 'Payment Date & Fine/Rebate:')}
                  </label>
                  <select
                    value={timelineIndex}
                    onChange={(e) => setTimelineIndex(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm font-medium"
                  >
                    {PAYMENT_TIMELINES.map((tl, i) => (
                      <option key={tl.id} value={i}>
                        {isNe ? tl.nameNp : tl.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Bill Receipt Visual */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                  {/* Bill Header */}
                  <div className="text-center border-b-2 border-dashed border-gray-300 dark:border-gray-700 pb-4 mb-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                      {L('नेपाल खानेपानी व्यवस्थापन बोर्ड / KUKL', 'NEPAL WATER SUPPLY BOARD / KUKL')}
                    </div>
                    <div className="text-xl font-black text-gray-800 dark:text-gray-100 mt-1">
                      {L('खानेपानी तथा ढल महसुल बिल', 'Water & Sewerage Utility Invoice')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {L(`पाइप: ${selectedTariff.pipeNameNp}`, `Pipe: ${selectedTariff.pipeNameEn}`)}
                    </div>
                  </div>

                  {/* Meter Reading Summary Table */}
                  <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mb-4 text-center">
                    <div>
                      <div className="text-xs text-gray-500">{L('अघिल्लो रिडिङ', 'Prev Reading')}</div>
                      <div className="text-base font-bold text-gray-800 dark:text-gray-200">{isNe ? toNp(prevWaterMeter) : prevWaterMeter}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{L('हालको रिडिङ', 'Curr Reading')}</div>
                      <div className="text-base font-bold text-blue-600 dark:text-blue-400">{isNe ? toNp(currWaterMeter) : currWaterMeter}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{L('कुल खपत युनिट', 'Total Units')}</div>
                      <div className="text-base font-bold text-green-600 dark:text-green-400">{isNe ? toNp(waterUnits) : waterUnits}</div>
                    </div>
                  </div>

                  {/* Step-by-Step Calculation Breakdown */}
                  <div className="space-y-3 text-sm">
                    {/* Minimum Charge */}
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {L(`१. न्यूनतम महसुल (${selectedTariff.minUnits} युनिटसम्म)`, `1. Minimum Charge (Up to ${selectedTariff.minUnits} units)`)}
                        </span>
                        <div className="text-xs text-gray-500">
                          {L(`न्यूनतम तोकिएको स्थिर रकम`, `Fixed minimum charge for pipe`)}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-100">
                        रु. {isNe ? toNp(minCharge) : minCharge.toLocaleString()}
                      </span>
                    </div>

                    {/* Extra Units Charge */}
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {L(`२. अतिरिक्त युनिट महसुल (${extraUnits} युनिट)`, `2. Extra Units Charge (${extraUnits} units)`)}
                        </span>
                        <div className="text-xs text-gray-500">
                          {extraUnits > 0
                            ? L(`${toNp(extraUnits)} × रु. ${toNp(selectedTariff.ratePerUnit)}`, `${extraUnits} × Rs ${selectedTariff.ratePerUnit}`)
                            : L('न्यूनतम भन्दा बढी खपत नभएको', 'No extra units consumed')}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-100">
                        रु. {isNe ? toNp(extraCharge) : extraCharge.toLocaleString()}
                      </span>
                    </div>

                    {/* Basic Water Fee Subtotal */}
                    <div className="flex justify-between items-center py-1.5 bg-blue-50/60 dark:bg-blue-950/20 px-3 rounded-lg font-semibold text-blue-900 dark:text-blue-200">
                      <span>{L('जम्मा खानेपानी महसुल (Subtotal):', 'Total Water Fee (Subtotal):')}</span>
                      <span className="font-mono font-black">
                        रु. {isNe ? toNp(basicWaterFee) : basicWaterFee.toLocaleString()}
                      </span>
                    </div>

                    {/* Sewerage Fee */}
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {L('३. ढल निकास महसुल (५०%):', '3. Sewerage Fee (50%):')}
                        </span>
                        <div className="text-xs text-gray-500">
                          {hasSewerage
                            ? L(`रु. ${toNp(basicWaterFee)} को ५०%`, `50% of Rs ${basicWaterFee}`)
                            : L('ढल सुविधा नभएको (रु. ०)', 'No sewerage connection')}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-100">
                        रु. {isNe ? toNp(sewerageFee) : sewerageFee.toLocaleString()}
                      </span>
                    </div>

                    {/* Timeline Rebate or Fine */}
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {L('४. भुक्तानी समय समायोजन (छुट / थप दस्तुर):', '4. Payment Adjustment (Rebate/Fine):')}
                        </span>
                        <div className="text-xs text-gray-500">
                          {isNe ? selectedTimeline.nameNp : selectedTimeline.nameEn}
                        </div>
                      </div>
                      <span className={`font-mono font-bold ${
                        selectedTimeline.factor < 0
                          ? 'text-green-600 dark:text-green-400'
                          : selectedTimeline.factor > 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-600'
                      }`}>
                        {selectedTimeline.factor < 0 ? '-' : selectedTimeline.factor > 0 ? '+' : ''} रु. {isNe ? toNp(adjustmentAmount) : adjustmentAmount.toLocaleString()}
                      </span>
                    </div>

                    {/* Grand Total */}
                    <div className="mt-4 pt-4 border-t-2 border-gray-800 dark:border-gray-200 flex justify-between items-center">
                      <div>
                        <div className="text-lg font-black text-gray-900 dark:text-gray-50">
                          {L('खुद तिर्नुपर्ने जम्मा रकम:', 'Net Payable Amount:')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {L('सबै महसुल, ढल र जरिवाना/छुट सहित', 'Including all charges, sewerage and adjustment')}
                        </div>
                      </div>
                      <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                        रु. {isNe ? toNp(netWaterPayable) : netWaterPayable.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             TELEPHONE BILL CALCULATOR (टेलिफोन महसुल)
             ========================================================================= */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 p-5 rounded-2xl border border-teal-200 dark:border-teal-800">
              <h2 className="text-xl font-bold text-teal-900 dark:text-teal-200 mb-2 flex items-center gap-2">
                <span>📞</span>
                <span>{L('नेपाल दूरसञ्चार महसुल प्रणाली (NTC नियम)', 'Nepal Telecom Billing System (CDC Rules)')}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'नेपाल टेलिकमको पीएसटीएन (ल्याण्डलाइन) मा १७५ कलसम्म न्यूनतम रु. २०० लाग्छ र त्यसपछिको प्रत्येक कल रु. १ लाग्छ। कुल कल शुल्कमा १०% दूरसञ्चार सेवा शुल्क (TSC) र अन्त्यमा १३% मूल्य अभिवृद्धि कर (VAT) जोडेर कुल बिल निर्धारण गरिन्छ।',
                  'In NTC PSTN landline, minimum charge is Rs 200 for up to 175 calls, then Rs 1 per extra call. 10% Telecommunication Service Charge (TSC) and 13% VAT are applied to determine total bill.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls */}
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-5">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
                  {L('टेलिफोन सेवा तथा कल विवरण', 'Phone Service & Call Details')}
                </h3>

                {/* Service Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {L('सेवा प्रकार (Service Type):', 'Service Type:')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPhoneType('pstn')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        phoneType === 'pstn'
                          ? 'bg-teal-600 text-white border-teal-600 font-bold shadow'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-base font-bold">☎️ {L('ल्याण्डलाइन (PSTN)', 'PSTN Landline')}</div>
                      <div className="text-xs opacity-85 mt-1">{L('१७५ कल = रु. २००', '175 calls = Rs 200')}</div>
                    </button>
                    <button
                      onClick={() => setPhoneType('mobile')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        phoneType === 'mobile'
                          ? 'bg-teal-600 text-white border-teal-600 font-bold shadow'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-base font-bold">📱 {L('पोष्टपेड मोबाइल', 'Postpaid Mobile')}</div>
                      <div className="text-xs opacity-85 mt-1">{L('२५० कल = रु. ३००', '250 calls = Rs 300')}</div>
                    </button>
                  </div>
                </div>

                {/* Call units input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {L('महिनाभरी गरिएको कुल कल संख्या (Total Calls / Units):', 'Total Calls / Units in Month:')}
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="600"
                    step="5"
                    value={callUnits}
                    onChange={(e) => setCallUnits(parseInt(e.target.value) || 0)}
                    className="w-full accent-teal-600 mb-2 cursor-pointer"
                  />
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={callUnits}
                      min="0"
                      onChange={(e) => setCallUnits(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-32 px-3 py-1.5 rounded-lg border border-teal-500 font-mono text-base font-bold dark:bg-gray-700 dark:text-gray-100"
                    />
                    <span className="text-sm text-gray-500">
                      {L(`कलहरू (${phoneType === 'pstn' ? (callUnits > 175 ? `${toNp(callUnits - 175)} अतिरिक्त` : 'न्यूनतम भित्र') : (callUnits > 250 ? `${toNp(callUnits - 250)} अतिरिक्त` : 'न्यूनतम भित्र')})`, `calls`)}
                    </span>
                  </div>
                </div>

                {/* Optional STD/ISD/Addon */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    {L('अन्तर्राष्ट्रिय (ISD) वा डाटा शुल्क (वैकल्पिक):', 'ISD / Data Add-on Charge (Rs):')}
                  </label>
                  <input
                    type="number"
                    value={roamingOrAddon}
                    min="0"
                    step="50"
                    onChange={(e) => setRoamingOrAddon(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 font-mono text-sm dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                {/* Quick Info Badge */}
                <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-300 space-y-1">
                  <div><strong>{L('कर नियम (Tax Rules):', 'Tax Rules:')}</strong></div>
                  <div>• {L('दूरसञ्चार सेवा दस्तुर (TSC) = १०%', 'Telecommunication Service Charge (TSC) = 10%')}</div>
                  <div>• {L('मूल्य अभिवृद्धि कर (VAT) = १३% (कल शुल्क + TSC मा)', 'VAT = 13% (on Call Charge + TSC)')}</div>
                </div>
              </div>

              {/* Bill Output Visual */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                  {/* Bill Header */}
                  <div className="text-center border-b-2 border-dashed border-gray-300 dark:border-gray-700 pb-4 mb-4">
                    <div className="text-xs font-bold uppercase tracking-widest text-teal-600 dark:text-teal-400">
                      {L('नेपाल दूरसञ्चार कम्पनी लिमिटेड (नेपाल टेलिकम)', 'NEPAL TELECOMMUNICATIONS CO. LTD. (NTC)')}
                    </div>
                    <div className="text-xl font-black text-gray-800 dark:text-gray-100 mt-1">
                      {L('ग्राहक महसुल बिल (Customer Bill Receipt)', 'Telephone Bill Receipt')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {phoneType === 'pstn' ? L('सेवा: PSTN ल्याण्डलाइन', 'Service: PSTN Landline') : L('सेवा: पोष्टपेड मोबाइल (GSM)', 'Service: GSM Postpaid')}
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl mb-4 text-center">
                    <div>
                      <div className="text-xs text-gray-500">{L('कुल कल', 'Total Calls')}</div>
                      <div className="text-base font-bold text-gray-800 dark:text-gray-200">{isNe ? toNp(callUnits) : callUnits}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{L('न्यूनतम समावेश कल', 'Included Calls')}</div>
                      <div className="text-base font-bold text-teal-600 dark:text-teal-400">{isNe ? toNp(phoneType === 'pstn' ? pstnMinCalls : gsmIncludedCalls) : (phoneType === 'pstn' ? pstnMinCalls : gsmIncludedCalls)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">{L('अतिरिक्त कल', 'Extra Calls')}</div>
                      <div className="text-base font-bold text-amber-600 dark:text-amber-400">{isNe ? toNp(extraCallsCount) : extraCallsCount}</div>
                    </div>
                  </div>

                  {/* Step Breakdown */}
                  <div className="space-y-3 text-sm">
                    {/* Minimum Call Fee */}
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {L(`१. न्यूनतम महसुल (${phoneType === 'pstn' ? pstnMinCalls : gsmIncludedCalls} कलसम्म):`, `1. Minimum Call Tariff:`)}
                        </span>
                        <div className="text-xs text-gray-500">
                          {phoneType === 'pstn' ? L('पहिलो १७५ कलको न्यूनतम दर', 'Standard minimum rate') : L('पहिलो २५० कलको न्यूनतम दर', 'GSM Base tariff')}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-100">
                        रु. {isNe ? toNp(phoneType === 'pstn' ? pstnMinCharge : gsmBaseCharge) : (phoneType === 'pstn' ? pstnMinCharge : gsmBaseCharge)}
                      </span>
                    </div>

                    {/* Extra Calls Fee */}
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {L(`२. थप कल महसुल (${extraCallsCount} कल):`, `2. Additional Calls Charge (${extraCallsCount} calls):`)}
                        </span>
                        <div className="text-xs text-gray-500">
                          {extraCallsCount > 0
                            ? L(`${toNp(extraCallsCount)} × रु. ${toNp(phoneType === 'pstn' ? pstnRatePerCall : gsmRatePerExtra)}`, `${extraCallsCount} × Rs ${phoneType === 'pstn' ? pstnRatePerCall : gsmRatePerExtra}`)
                            : L('थप कल नभएको', 'No extra calls')}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-100">
                        रु. {isNe ? toNp(extraPhoneCharge) : extraPhoneCharge.toFixed(2)}
                      </span>
                    </div>

                    {roamingOrAddon > 0 && (
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{L('३. ISD / डाटा एड-अन:', '3. ISD / Data Add-on:')}</span>
                        <span className="font-mono font-bold text-gray-800 dark:text-gray-100">
                          रु. {isNe ? toNp(roamingOrAddon) : roamingOrAddon.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Subtotal before taxes */}
                    <div className="flex justify-between items-center py-1.5 bg-teal-50/60 dark:bg-teal-950/20 px-3 rounded-lg font-semibold text-teal-900 dark:text-teal-200">
                      <span>{L('जम्मा सेवा महसुल (Service Total):', 'Total Service Charge:')}</span>
                      <span className="font-mono font-black">
                        रु. {isNe ? toNp(basePhoneCharge) : basePhoneCharge.toFixed(2)}
                      </span>
                    </div>

                    {/* TSC (10%) */}
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {L('४. दूरसञ्चार सेवा दस्तुर (TSC १०%):', '4. Telecom Service Charge (TSC 10%):')}
                        </span>
                        <div className="text-xs text-gray-500">
                          {L(`रु. ${toNp(basePhoneCharge)} × १०%`, `Rs ${basePhoneCharge.toFixed(2)} × 10%`)}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-100">
                        रु. {isNe ? toNp(tscAmount) : tscAmount.toFixed(2)}
                      </span>
                    </div>

                    {/* Subtotal (Base + TSC) */}
                    <div className="flex justify-between items-center py-1 text-xs text-gray-600 dark:text-gray-400">
                      <span>{L('करयोग्य रकम (Base + TSC):', 'Taxable Amount (Base + TSC):')}</span>
                      <span className="font-mono font-bold">
                        रु. {isNe ? toNp(amountBeforeVat) : amountBeforeVat.toFixed(2)}
                      </span>
                    </div>

                    {/* VAT (13%) */}
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
                      <div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {L('५. मूल्य अभिवृद्धि कर (VAT १३%):', '5. Value Added Tax (VAT 13%):')}
                        </span>
                        <div className="text-xs text-gray-500">
                          {L(`रु. ${toNp(amountBeforeVat)} × १३%`, `Rs ${amountBeforeVat.toFixed(2)} × 13%`)}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-100">
                        रु. {isNe ? toNp(vatAmount) : vatAmount.toFixed(2)}
                      </span>
                    </div>

                    {/* Final Total */}
                    <div className="mt-4 pt-4 border-t-2 border-gray-800 dark:border-gray-200 flex justify-between items-center">
                      <div>
                        <div className="text-lg font-black text-gray-900 dark:text-gray-50">
                          {L('कुल भुक्तानी गर्नुपर्ने रकम:', 'Total Bill Payable:')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {L('TSC १०% र VAT १३% समावेश सहित', 'Includes 10% TSC and 13% VAT')}
                        </div>
                      </div>
                      <div className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono">
                        रु. {isNe ? toNp(grandTotalPhoneBill) : grandTotalPhoneBill.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default WaterTelephoneBillCalculator;

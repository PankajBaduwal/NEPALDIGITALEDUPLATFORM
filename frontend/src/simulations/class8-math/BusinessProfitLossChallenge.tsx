/**
 * BusinessProfitLossChallenge.tsx
 * Grade 8 Mathematics – Unit 5: PROFIT AND LOSS
 * Simulation 3: Business Profit and Loss Challenge
 * Strictly adheres to CDC Nepal Grade 8 Mathematics Curriculum (2023 edition, Unit 5)
 */
import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Briefcase, TrendingUp, TrendingDown, DollarSign, Award, ArrowRight, Store, CheckCircle, RefreshCw } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'एउटा वस्तुको क्रय मूल्य (CP) Rs. 2,000 छ। पसलेले 25% बढाएर अङ्कित मूल्य राख्यो र 10% छुट दियो भने बिक्री मूल्य (SP) कति हुन्छ?',
    en: 'An article costs Rs. 2,000. The seller marks it up by 25% and gives a 10% discount. What is the selling price (SP)?',
    options: [
      { key: 'A', label: 'Rs. 2,250 [ MP = 2500, Discount = 250 ⇒ SP = 2250 ]' },
      { key: 'B', label: 'Rs. 2,200' },
      { key: 'C', label: 'Rs. 2,300' },
      { key: 'D', label: 'Rs. 2,150' },
    ],
    answer: 'A',
  },
  {
    np: 'माथिको प्रश्नमा पसलेलाई कति प्रतिशत Profit भयो?',
    en: 'In the above question, what is the profit percentage earned by the seller?',
    options: [
      { key: 'A', label: '12.5% [ Profit 250 ÷ 2000 × 100% = 12.5% ]' },
      { key: 'B', label: '15%' },
      { key: 'C', label: '10%' },
      { key: 'D', label: '14.5%' },
    ],
    answer: 'A',
  },
  {
    np: 'पसल ‘क’ ले 30% बढाएर 20% छुट दिन्छ, Shop B ले 20% बढाएर 10% छुट दिन्छ। ग्राहकका लागि कुन पसल सस्तो?',
    en: 'Shop A marks up 30% and gives 20% discount. Shop B marks up 20% and gives 10% discount. Which shop is cheaper for the buyer?',
    options: [
      { key: 'A', label: 'Shop A [ SP = 104% of CP vs Shop B SP = 108% of CP ]' },
      { key: 'B', label: 'Shop B' },
      { key: 'C', label: 'Both equal' },
      { key: 'D', label: 'Cannot be said' },
    ],
    answer: 'A',
  },
  {
    np: 'अङ्कित मूल्य (MP) निर्धारण गर्ने सूत्र कुन हो?',
    en: 'Which is the correct formula to calculate Marked Price (MP) with markup percentage?',
    options: [
      { key: 'A', label: 'MP = CP + (CP × Markup % ÷ 100)' },
      { key: 'B', label: 'MP = SP + CP' },
      { key: 'C', label: 'MP = CP - discount' },
      { key: 'D', label: 'MP = SP × 100' },
    ],
    answer: 'A',
  },
  {
    np: '10% Profit गर्न 20% छुट दिँदा क्रय मूल्य Rs. 4,000 भएको सामानको अङ्कित मूल्य कति हुनुपर्छ?',
    en: 'To make a 10% profit after a 20% discount, what must be the marked price of an item costing Rs. 4,000?',
    options: [
      { key: 'A', label: 'Rs. 5,500 [ SP = 4400, MP = 4400 ÷ 0.8 = 5500 ]' },
      { key: 'B', label: 'Rs. 5,200' },
      { key: 'C', label: 'Rs. 5,000' },
      { key: 'D', label: 'Rs. 6,000' },
    ],
    answer: 'A',
  },
];

const PRESETS = [
  { nameNp: 'रेडियो (Radio)', nameEn: 'Radio', cp: 2000, markupPct: 25, discountPct: 10 },
  { nameNp: 'स्मार्टफोन (Smartphone)', nameEn: 'Smartphone', cp: 15000, markupPct: 30, discountPct: 15 },
  { nameNp: 'साइलक (Bicycle)', nameEn: 'Bicycle', cp: 8000, markupPct: 20, discountPct: 10 },
  { nameNp: 'ज्याकेट (Winter Jacket)', nameEn: 'Winter Jacket', cp: 2500, markupPct: 40, discountPct: 20 },
];

export const BusinessProfitLossChallenge: React.FC<{
  onBack?: () => void;
  onBackToLibrary?: () => void;
}> = ({ onBack, onBackToLibrary }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G8-U5-03',
    chapter: 5,
    titleNp: 'व्यापारिक Profit-नोक्सान चुनौती (Business Profit & Loss Challenge)',
    titleEn: 'Business Profit and Loss Challenge',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'cycle' | 'duel' | 'reverse' | 'challenges'>('cycle');

  // Cycle simulator state
  const [cp, setCp] = useState<number>(2000);
  const [markupPct, setMarkupPct] = useState<number>(25);
  const [discountPct, setDiscountPct] = useState<number>(10);

  // Calculations for Cycle
  const markupAmt = (cp * markupPct) / 100;
  const mp = cp + markupAmt;
  const discountAmt = (mp * discountPct) / 100;
  const sp = mp - discountAmt;
  const netDiff = sp - cp;
  const isProfit = netDiff >= 0;
  const profitLossAmt = Math.abs(netDiff);
  const profitLossPct = cp > 0 ? (profitLossAmt / cp) * 100 : 0;

  // Shop Comparison State
  const [shopBaseCp, setShopBaseCp] = useState<number>(1000);
  const [shopAMarkup, setShopAMarkup] = useState<number>(30);
  const [shopADiscount, setShopADiscount] = useState<number>(20);
  const [shopBMarkup, setShopBMarkup] = useState<number>(20);
  const [shopBDiscount, setShopBDiscount] = useState<number>(10);

  const shopAMP = shopBaseCp * (1 + shopAMarkup / 100);
  const shopASP = shopAMP * (1 - shopADiscount / 100);
  const shopAProfit = shopASP - shopBaseCp;
  const shopAProfitPct = (shopAProfit / shopBaseCp) * 100;

  const shopBMP = shopBaseCp * (1 + shopBMarkup / 100);
  const shopBSP = shopBMP * (1 - shopBDiscount / 100);
  const shopBProfit = shopBSP - shopBaseCp;
  const shopBProfitPct = (shopBProfit / shopBaseCp) * 100;

  // Reverse Solver: Want Target Profit % with Discount %
  const [revCp, setRevCp] = useState<number>(4000);
  const [targetProfitPct, setTargetProfitPct] = useState<number>(10);
  const [offerDiscountPct, setOfferDiscountPct] = useState<number>(20);
  const reqSp = revCp * (1 + targetProfitPct / 100);
  const reqMp = offerDiscountPct < 100 ? (reqSp * 100) / (100 - offerDiscountPct) : 0;

  // Interactive Challenges state
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [userSpInput, setUserSpInput] = useState<string>('');
  const [userProfitPctInput, setUserProfitPctInput] = useState<string>('');
  const [challengeFeedback, setChallengeFeedback] = useState<{ isCorrect: boolean; msg: string } | null>(null);

  const CHALLENGES = [
    {
      titleNp: 'चुनौती 1: टेलिभिजनको व्यापार (CDC पाठ्यपुस्तक उदाहरण)',
      titleEn: 'Challenge 1: Television Business (CDC Example)',
      descNp: 'एउटा टेलिभिजनको क्रय मूल्य Rs. 20,000 छ। व्यापारीले 25% मूल्य बढाएर अङ्कित मूल्य तोकी 10% छुट दिँदा बिक्री मूल्य (SP) र Profit प्रतिशत पत्ता लगाउनुहोस्।',
      descEn: 'A TV has CP = Rs. 20,000. The seller sets MP at 25% markup and gives a 10% discount. Find SP and Profit %.',
      cp: 2000,
      markup: 25,
      disc: 10,
      targetSp: 22500, // wait: 20000 * 1.25 = 25000, 25000 * 0.9 = 22500, profit = 2500 / 20000 = 12.5%
      targetProfitPct: 12.5,
    },
    {
      titleNp: 'चुनौती 2: कपडा पसलको हिसाब',
      titleEn: 'Challenge 2: Clothing Store Calculations',
      descNp: 'एउटा स्विटरको क्रय मूल्य Rs. 1,200 छ। पसलेले 50% बढाएर अङ्कित मूल्य राखी 20% छुट दिँदा बिक्री मूल्य र Profit प्रतिशत कति हुन्छ?',
      descEn: 'A sweater CP = Rs. 1,200. Shopkeeper marks up 50% and offers 20% discount. Find SP and Profit %.',
      cp: 1200,
      markup: 50,
      disc: 20,
      targetSp: 1440, // 1200 * 1.5 = 1800; 1800 * 0.8 = 1440; profit = 240 / 1200 = 20%
      targetProfitPct: 20,
    },
  ];

  const handleCheckChallenge = () => {
    const cur = CHALLENGES[challengeIdx];
    const spVal = parseFloat(userSpInput);
    const pVal = parseFloat(userProfitPctInput);

    if (Math.abs(spVal - cur.targetSp) < 1 && Math.abs(pVal - cur.targetProfitPct) < 0.2) {
      kit.good();
      setChallengeFeedback({
        isCorrect: true,
        msg: L(
          `उत्कृष्ट! बिक्री मूल्य Rs. ${toNp(cur.targetSp)} र Profit ${toNp(cur.targetProfitPct)}% सही छ!`,
          `Excellent! SP = Rs. ${cur.targetSp} and Profit = ${cur.targetProfitPct}% are correct!`
        ),
      });
    } else {
      kit.oops();
      setChallengeFeedback({
        isCorrect: false,
        msg: L(
          `प्रयास गर्नुहोस्! सूत्र: MP = CP + बढाएको %, SP = MP - छुट %, Profit % = (SP - CP)/CP × 100%`,
          `Keep trying! Formula: MP = CP + Markup %, SP = MP - Disc %, Profit % = (SP - CP)/CP × 100%`
        ),
      });
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={8}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! व्यापारमा क्रय मूल्य, अङ्कित मूल्य, छुट र वास्तविक Profit वा नोक्सानको चक्र बुझौं!',
        'Hello! Let us explore the complete business cycle of Cost Price, Markup, Marked Price, Discount and Net Profit!'
      )}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('cycle')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'cycle' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            {L('1. पूर्ण व्यापार चक्र (Business Cycle)', '1. Complete Business Cycle')}
          </button>
          <button
            onClick={() => setActiveTab('duel')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'duel' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Store className="w-4 h-4" />
            {L('2. पसल रणनीति तुलना (Shop Comparison)', '2. Shop Duel Comparison')}
          </button>
          <button
            onClick={() => setActiveTab('reverse')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'reverse' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            {L('3. मूल्य निर्धारण योजना (Target Pricing)', '3. Target Pricing Plan')}
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === 'challenges' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            {L('4. पाठ्यपुस्तक अभ्यास (CDC Practice)', '4. CDC Textbook Challenge')}
          </button>
        </div>

        {/* Tab 1: Complete Business Cycle */}
        {activeTab === 'cycle' && (
          <div className="space-y-6">
            {/* Quick Presets */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-slate-600">{L('पाठ्यपुस्तक उदाहरणहरू:', 'Textbook Presets:')}</span>
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCp(p.cp);
                    setMarkupPct(p.markupPct);
                    setDiscountPct(p.discountPct);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition border border-indigo-200"
                >
                  {isNe ? p.nameNp : p.nameEn}
                </button>
              ))}
            </div>

            {/* Interactive Flow Diagram */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg space-y-6">
              <div className="text-center font-bold text-lg text-amber-400">
                {L('व्यापारिक प्रवाह चार्ट (Business Cash Flow Cycle)', 'Business Value Chain Diagram')}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Step 1: CP */}
                <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700 text-center">
                  <div className="text-xs text-slate-400 font-bold uppercase">{L('1. क्रय मूल्य (Cost Price)', '1. Cost Price (CP)')}</div>
                  <div className="text-2xl font-black text-blue-400 my-2">Rs. {toNp(cp.toLocaleString())}</div>
                  <div className="text-xs text-slate-400">{L('थोक मूल्य / खरिद लागत', 'Wholesale Purchase Cost')}</div>
                </div>

                {/* Step 2: Markup to MP */}
                <div className="bg-slate-800/90 p-4 rounded-2xl border border-indigo-700 text-center relative">
                  <div className="text-xs text-indigo-400 font-bold uppercase">
                    {L('2. अङ्कित मूल्य (Marked Price)', '2. Marked Price (MP)')}
                  </div>
                  <div className="text-2xl font-black text-indigo-300 my-2">Rs. {toNp(mp.toLocaleString())}</div>
                  <div className="text-xs text-emerald-400">
                    +{toNp(markupPct)}% ({L('बढाएको', 'Markup')}: Rs. {toNp(markupAmt.toLocaleString())})
                  </div>
                </div>

                {/* Step 3: Discount to SP */}
                <div className="bg-slate-800/90 p-4 rounded-2xl border border-amber-700 text-center">
                  <div className="text-xs text-amber-400 font-bold uppercase">
                    {L('3. बिक्री मूल्य (Selling Price)', '3. Selling Price (SP)')}
                  </div>
                  <div className="text-2xl font-black text-amber-300 my-2">Rs. {toNp(sp.toLocaleString())}</div>
                  <div className="text-xs text-rose-400">
                    -{toNp(discountPct)}% ({L('छुट रकम', 'Discount')}: Rs. {toNp(discountAmt.toLocaleString())})
                  </div>
                </div>

                {/* Step 4: Net Result */}
                <div
                  className={`p-4 rounded-2xl border text-center ${
                    isProfit ? 'bg-emerald-950/70 border-emerald-500' : 'bg-rose-950/70 border-rose-500'
                  }`}
                >
                  <div className="text-xs font-bold uppercase flex items-center justify-center gap-1">
                    {isProfit ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
                    {isProfit ? L('Profit (Net Profit)', 'Net Profit') : L('नोक्सान (Net Loss)', 'Net Loss')}
                  </div>
                  <div className={`text-2xl font-black my-2 ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Rs. {toNp(profitLossAmt.toLocaleString())}
                  </div>
                  <div className="text-xs font-bold text-slate-300">
                    {isProfit ? L('Profit', 'Profit') : L('नोक्सान', 'Loss')}: {toNp(profitLossPct.toFixed(2))}%
                  </div>
                </div>
              </div>

              {/* Formula Strip */}
              <div className="bg-slate-800 p-4 rounded-2xl text-xs space-y-1 text-slate-300">
                <div className="font-semibold text-amber-300">{L('गणितीय कार्यविधि (Mathematical Steps):', 'Mathematical Steps:')}</div>
                <div>1. MP = CP + (CP × Markup % ÷ 100) = {toNp(cp)} + ({toNp(cp)} × {toNp(markupPct)} ÷ 100) = Rs. {toNp(mp)}</div>
                <div>2. Discount = MP × Discount % ÷ 100 = {toNp(mp)} × {toNp(discountPct)} ÷ 100 = Rs. {toNp(discountAmt)}</div>
                <div>3. SP = MP - Discount = {toNp(mp)} - {toNp(discountAmt)} = Rs. {toNp(sp)}</div>
                <div>
                  4. {isProfit ? 'Profit = SP - CP' : 'नोक्सान = CP - SP'} = Rs. {toNp(profitLossAmt)} | {isProfit ? 'Profit' : 'नोक्सान'} % = (
                  {toNp(profitLossAmt)} ÷ {toNp(cp)}) × 100% = {toNp(profitLossPct.toFixed(2))}%
                </div>
              </div>
            </div>

            {/* Sliders for exploration */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {L('क्रय मूल्य (Cost Price):', 'Cost Price (CP):')} Rs. {toNp(cp)}
                </label>
                <input
                  type="range"
                  min="500"
                  max="50000"
                  step="500"
                  value={cp}
                  onChange={(e) => setCp(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-indigo-700 mb-2">
                  {L('बढाएको दर (Markup %):', 'Markup Percentage:')} {toNp(markupPct)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={markupPct}
                  onChange={(e) => setMarkupPct(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-amber-700 mb-2">
                  {L('छुट दर (Discount %):', 'Discount Percentage:')} {toNp(discountPct)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Shop Strategy Duel */}
        {activeTab === 'duel' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-sm text-blue-900">
              <span className="font-bold">{L('पाठ्यपुस्तक विश्लेषणात्मक प्रश्न:', 'CDC Analytical Question:')}</span>{' '}
              {L(
                'एउटै सामान दुई फरक पसलले फरक रणनीति अपनाएर बेच्दा कुन पसल ग्राहकका लागि सस्तो र कुन पसलेका लागि बढी फाइदाजनक हुन्छ?',
                'When two shops use different markup and discount strategies for the same product, which is cheaper for the buyer and which gives higher profit?'
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Shop A */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-indigo-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-indigo-700 flex items-center gap-2">
                    <Store className="w-5 h-5" /> {L('पसल ‘क’ (Shop A)', 'Shop A')}
                  </h3>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold">
                    {toNp(shopAMarkup)}% {L('बढाएर', 'Markup')} | {toNp(shopADiscount)}% {L('छुट', 'Disc')}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">{L('बढाएको प्रतिशत (Markup %)', 'Markup %')}</label>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      step="5"
                      value={shopAMarkup}
                      onChange={(e) => setShopAMarkup(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">{L('छुट प्रतिशत (Discount %)', 'Discount %')}</label>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="5"
                      value={shopADiscount}
                      onChange={(e) => setShopADiscount(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>

                <div className="bg-indigo-50/70 p-4 rounded-2xl space-y-2 text-sm border border-indigo-100">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{L('अङ्कित मूल्य (MP):', 'Marked Price (MP):')}</span>
                    <span className="font-bold text-slate-900">Rs. {toNp(shopAMP.toFixed(0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{L('बिक्री मूल्य (SP):', 'Selling Price (SP):')}</span>
                    <span className="font-black text-indigo-700">Rs. {toNp(shopASP.toFixed(0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{L('पसलेको Profit %:', 'Shop Profit %:')}</span>
                    <span className={`font-black ${shopAProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {toNp(shopAProfitPct.toFixed(1))}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Shop B */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-emerald-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-emerald-700 flex items-center gap-2">
                    <Store className="w-5 h-5" /> {L('Shop B (Shop B)', 'Shop B')}
                  </h3>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                    {toNp(shopBMarkup)}% {L('बढाएर', 'Markup')} | {toNp(shopBDiscount)}% {L('छुट', 'Disc')}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500">{L('बढाएको प्रतिशत (Markup %)', 'Markup %')}</label>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      step="5"
                      value={shopBMarkup}
                      onChange={(e) => setShopBMarkup(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500">{L('छुट प्रतिशत (Discount %)', 'Discount %')}</label>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="5"
                      value={shopBDiscount}
                      onChange={(e) => setShopBDiscount(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                <div className="bg-emerald-50/70 p-4 rounded-2xl space-y-2 text-sm border border-emerald-100">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{L('अङ्कित मूल्य (MP):', 'Marked Price (MP):')}</span>
                    <span className="font-bold text-slate-900">Rs. {toNp(shopBMP.toFixed(0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{L('बिक्री मूल्य (SP):', 'Selling Price (SP):')}</span>
                    <span className="font-black text-emerald-700">Rs. {toNp(shopBSP.toFixed(0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{L('पसलेको Profit %:', 'Shop Profit %:')}</span>
                    <span className={`font-black ${shopBProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {toNp(shopBProfitPct.toFixed(1))}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Verdict */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-bold text-slate-800">
                  {L('निष्कर्ष (Conclusion):', 'Conclusion:')}{' '}
                  {shopASP < shopBSP
                    ? L('ग्राहकका लागि पसल ‘क’ सस्तो छ!', 'Shop A is cheaper for customers!')
                    : shopASP > shopBSP
                    ? L('ग्राहकका लागि Shop B सस्तो छ!', 'Shop B is cheaper for customers!')
                    : L('दुवै पसलको बिक्री मूल्य ठ्याक्कै बराबर छ!', 'Both shops offer the exact same selling price!')}
                </div>
                <div className="text-sm text-slate-600">
                  {shopAProfitPct > shopBProfitPct
                    ? L('पसलेका लागि पसल ‘क’ को रणनीतिले बढी Profit दिन्छ।', 'Shop A strategy yields higher profit for merchant.')
                    : shopAProfitPct < shopBProfitPct
                    ? L('पसलेका लागि Shop B को रणनीतिले बढी Profit दिन्छ।', 'Shop B strategy yields higher profit for merchant.')
                    : L('दुवै रणनीतिमा पसलेको Profit समान छ।', 'Both strategies yield identical profit for merchant.')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Target Pricing Plan (Reverse Solver) */}
        {activeTab === 'reverse' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800">
                  {L('उल्टो मूल्य निर्धारण: कति अङ्कित मूल्य तोक्ने?', 'Reverse Pricing: Finding Required Marked Price')}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {L(
                    'यदि पसलेले ग्राहकलाई छुट पनि दिन चाहन्छ र आफूलाई चाहेको Profit पनि सुरक्षित गर्न चाहन्छ भने अङ्कित मूल्य कति राख्नुपर्छ?',
                    'If a merchant wants to give a certain discount while ensuring a desired profit, what MP should be set?'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    {L('वस्तुको क्रय मूल्य (CP)', 'Cost Price (CP)')}
                  </label>
                  <input
                    type="number"
                    value={revCp}
                    onChange={(e) => setRevCp(Math.max(100, Number(e.target.value)))}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-indigo-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-600 mb-1">
                    {L('चाहिएको Profit प्रतिशत (Target Profit %)', 'Desired Profit %')}
                  </label>
                  <input
                    type="number"
                    value={targetProfitPct}
                    onChange={(e) => setTargetProfitPct(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-600 mb-1">
                    {L('ग्राहकलाई दिने छुट प्रतिशत (Offer Discount %)', 'Discount % to Offer')}
                  </label>
                  <input
                    type="number"
                    value={offerDiscountPct}
                    onChange={(e) => setOfferDiscountPct(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-amber-700"
                  />
                </div>
              </div>

              {/* Step by Step Breakdown */}
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 space-y-4">
                <div className="text-sm font-bold text-indigo-900">{L('गणना चरणहरू (Step-by-Step Solution):', 'Calculation Steps:')}</div>

                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                    <span>
                      {L('1. Profit सहितको बिक्री मूल्य (Required SP) = ', '1. Required Selling Price (SP) = ')}
                      <b>CP × (100 + P%) ÷ 100</b> = Rs. {toNp(revCp)} × {toNp(100 + targetProfitPct)} ÷ 100 ={' '}
                      <span className="font-bold text-indigo-800">Rs. {toNp(reqSp.toFixed(2))}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                    <span>
                      {L('2. अङ्कित मूल्य (Required MP) = ', '2. Required Marked Price (MP) = ')}
                      <b>SP × 100 ÷ (100 - Discount %)</b> = Rs. {toNp(reqSp.toFixed(2))} × 100 ÷ {toNp(100 - offerDiscountPct)} ={' '}
                      <span className="font-black text-2xl text-emerald-700">Rs. {toNp(reqMp.toFixed(2))}</span>
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-indigo-200 text-xs text-indigo-950 font-semibold">
                  {L(
                    `पसलेले Rs. ${toNp(reqMp.toFixed(0))} अङ्कित मूल्य टाँसेर ग्राहकलाई ${toNp(offerDiscountPct)}% छुट दिएमा ठ्याक्कै ${toNp(targetProfitPct)}% Profit प्राप्त हुन्छ!`,
                    `The merchant should mark the item at Rs. ${reqMp.toFixed(0)} and offer a ${offerDiscountPct}% discount to guarantee exactly ${targetProfitPct}% net profit!`
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: CDC Challenges */}
        {activeTab === 'challenges' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">
                  {isNe ? CHALLENGES[challengeIdx].titleNp : CHALLENGES[challengeIdx].titleEn}
                </h3>
                <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-bold">
                  {L(`समस्या ${toNp(challengeIdx + 1)} / ${toNp(CHALLENGES.length)}`, `Problem ${challengeIdx + 1} of ${CHALLENGES.length}`)}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl text-slate-700 text-sm leading-relaxed border border-slate-200">
                {isNe ? CHALLENGES[challengeIdx].descNp : CHALLENGES[challengeIdx].descEn}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    {L('तपाईंको बिक्री मूल्य (SP in Rs.):', 'Your Selling Price (SP in Rs.):')}
                  </label>
                  <input
                    type="number"
                    value={userSpInput}
                    onChange={(e) => setUserSpInput(e.target.value)}
                    placeholder={L('Rs. लेख्नुहोस्...', 'Enter Rs...')}
                    className="w-full px-4 py-2.5 border rounded-xl font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    {L('तपाईंको Profit प्रतिशत (Profit %):', 'Your Profit Percentage (%):')}
                  </label>
                  <input
                    type="number"
                    value={userProfitPctInput}
                    onChange={(e) => setUserProfitPctInput(e.target.value)}
                    placeholder={L('% लेख्नुहोस्...', 'Enter %...')}
                    className="w-full px-4 py-2.5 border rounded-xl font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCheckChallenge}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4" /> {L('उत्तर जाँच गर्नुहोस्', 'Check Answer')}
                </button>
                <button
                  onClick={() => {
                    setChallengeIdx((prev) => (prev + 1) % CHALLENGES.length);
                    setUserSpInput('');
                    setUserProfitPctInput('');
                    setChallengeFeedback(null);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition flex items-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" /> {L('अर्को समस्या', 'Next Problem')}
                </button>
              </div>

              {challengeFeedback && (
                <div
                  className={`p-4 rounded-2xl text-sm font-semibold ${
                    challengeFeedback.isCorrect ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {challengeFeedback.msg}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default BusinessProfitLossChallenge;

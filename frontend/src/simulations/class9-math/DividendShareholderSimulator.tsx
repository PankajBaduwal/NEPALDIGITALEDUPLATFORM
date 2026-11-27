import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit, QuizQuestion } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';
import { Coins, TrendingUp, PieChart, Users, CheckCircle2, ArrowRight } from 'lucide-react';

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    np: 'कम्पनीले सेयरधनीहरूलाई आफ्नो खुद नाफाबाट वितरण गर्ने प्रतिफललाई के भनिन्छ?',
    en: 'What is the return distributed by a company to shareholders from its net profit called?',
    options: [
      { key: 'A', label: 'लाभांश (Dividend)' },
      { key: 'B', label: 'कमिशन' },
      { key: 'C', label: 'कर' },
      { key: 'D', label: 'छुट' },
    ],
    answer: 'A',
  },
  {
    np: 'एक कम्पनीले प्रति सेयर रु २५ का दरले नगद लाभांश घोषणा गर्‍यो। ४०० कित्ता सेयर भएको व्यक्तिले कति लाभांश पाउँछन्?',
    en: 'A company declared Rs 25 dividend per share. How much does a person owning 400 shares receive?',
    options: [
      { key: 'A', label: 'रु १०,००० — (४०० × २५ = १०,०००)' },
      { key: 'B', label: 'रु २५,०००' },
      { key: 'C', label: 'रु ४,०००' },
      { key: 'D', label: 'रु १२,५००' },
    ],
    answer: 'A',
  },
  {
    np: 'नगदको सट्टा सेयरधनीहरूलाई थप नयाँ सेयर प्रदान गरिने लाभांशलाई के भनिन्छ?',
    en: 'What is the dividend given in the form of additional new shares called?',
    options: [
      { key: 'A', label: 'सेयर लाभांश वा बोनस सेयर (Stock / Share Dividend)' },
      { key: 'B', label: 'नगद लाभांश' },
      { key: 'C', label: 'कमिशन' },
      { key: 'D', label: 'ब्याज' },
    ],
    answer: 'A',
  },
  {
    np: 'यदि कुल रु २० लाख लाभांशलाई १ लाख कित्ता सेयरमा बाँड्दा प्रति सेयर लाभांश (DPS) कति हुन्छ?',
    en: 'If Rs 20 lakh dividend is distributed over 1 lakh shares, what is the dividend per share?',
    options: [
      { key: 'A', label: 'रु २० — (२०,००,००० ÷ १,००,००० = २०)' },
      { key: 'B', label: 'रु २' },
      { key: 'C', label: 'रु १००' },
      { key: 'D', label: 'रु ५०' },
    ],
    answer: 'A',
  },
];

export const DividendShareholderSimulator: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U3-03',
    chapter: 3,
    titleNp: 'लाभांश र सेयरधनी सिमुलेटर',
    titleEn: 'Dividend & Shareholder Simulator',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'cash' | 'stock' | 'challenge'>('cash');

  // Company State
  const [totalShares, setTotalShares] = useState<number>(100000); // 1 lakh shares
  const [netProfit, setNetProfit] = useState<number>(6000000); // 60 lakh
  const [dividendPct, setDividendPct] = useState<number>(20); // 20% of face value (100) or profit
  const [sharesOwned, setSharesOwned] = useState<number>(500);

  // Stock / Bonus Share State
  const [bonusSharePct, setBonusSharePct] = useState<number>(10); // 10% bonus share

  // Computed Cash Dividend
  // Face value per share is standard Rs 100 in Nepal
  const faceValue = 100;
  const paidUpCapital = totalShares * faceValue; // e.g. 1 crore
  const dividendPerShare = (faceValue * dividendPct) / 100; // Rs 20
  const totalDividendPool = totalShares * dividendPerShare; // Rs 20 lakh
  const myCashDividend = sharesOwned * dividendPerShare;

  // Computed Bonus Share
  const bonusSharesReceived = Math.floor((sharesOwned * bonusSharePct) / 100);
  const totalSharesAfterBonus = sharesOwned + bonusSharesReceived;

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'नमस्ते! सेयर, कम्पनीको नाफा, नगद लाभांश (Cash Dividend) र बोनस सेयर (Stock Dividend) को हिसाब सिमुलेटरमा स्वागत छ!',
        'Welcome! Simulate shares, net profit, cash dividends, and bonus stock shares for shareholders!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-800/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveTab('cash')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'cash' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            💰 {L('१. नगद लाभांश क्यालकुलेटर (Cash Dividend)', '1. Cash Dividend')}
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'stock' ? 'bg-amber-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            📈 {L('२. बोनस सेयर सिमुलेटर (Stock Dividend)', '2. Stock Dividend')}
          </button>
        </div>

        {/* Tab 1: Cash Dividend */}
        {activeTab === 'cash' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Controls */}
            <div className="lg:col-span-6 bg-white rounded-2xl shadow-lg p-5 border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-600" />
                कम्पनी तथा सेयर विवरण
              </h3>

              {/* Total Shares Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>कम्पनीको कुल सेयर कित्ता (Total Shares):</span>
                  <span className="font-mono text-indigo-700 text-sm">
                    {totalShares.toLocaleString()} कित्ता
                  </span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="500000"
                  step="10000"
                  value={totalShares}
                  onChange={(e) => setTotalShares(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              {/* Dividend % Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>लाभांश दर (Dividend Rate on Rs 100 Face Value):</span>
                  <span className="font-mono text-emerald-700 text-sm">{dividendPct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={dividendPct}
                  onChange={(e) => setDividendPct(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Shares Owned by Student */}
              <div className="space-y-1 pt-2 border-t">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>तपाईंसँग भएको सेयर (Shares Owned by You):</span>
                  <span className="font-mono text-amber-700 text-sm">{sharesOwned} कित्ता</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={sharesOwned}
                  onChange={(e) => setSharesOwned(parseInt(e.target.value))}
                  className="w-full accent-amber-600"
                />
              </div>
            </div>

            {/* Results Panel */}
            <div className="lg:col-span-6 space-y-4">
              {/* Highlight Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm text-center space-y-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wide block">
                  तपाईंले प्राप्त गर्ने कुल नगद लाभांश (Your Dividend)
                </span>
                <div className="text-4xl font-black text-amber-600 font-mono">
                  रु. {myCashDividend.toLocaleString()}
                </div>
                <span className="text-xs text-slate-600 font-semibold block">
                  {sharesOwned} कित्ता × रु. {dividendPerShare} प्रति सेयर
                </span>
              </div>

              {/* Breakdown Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">प्रति सेयर अङ्कित मूल्य (Face Value):</span>
                  <span className="font-mono font-bold text-slate-800">रु. {faceValue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">प्रति सेयर लाभांश (DPS):</span>
                  <span className="font-mono font-bold text-emerald-700">रु. {dividendPerShare}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">कम्पनीको कुल लाभांश खर्च:</span>
                  <span className="font-mono font-bold text-indigo-700">
                    रु. {totalDividendPool.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Textbook Explanation */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 font-semibold space-y-1">
                <div>• प्रति सेयर लाभांश = अङ्कित मूल्य (रु १००) × लाभांश%</div>
                <div>• सेयरधनीको लाभांश = आफ्नो सेयर सङ्ख्या × प्रति सेयर लाभांश</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bonus Share (Stock Dividend) */}
        {activeTab === 'stock' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-200 space-y-5">
            <h3 className="font-extrabold text-slate-800 text-sm text-center">
              बोनस सेयर (Stock Dividend) सिमुलेटर
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">तपाईंसँग भएको सेयर (त्ता):</label>
                <input
                  type="number"
                  value={sharesOwned}
                  onChange={(e) => setSharesOwned(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">घोषित बोनस सेयर (%):</label>
                <input
                  type="number"
                  value={bonusSharePct}
                  onChange={(e) => setBonusSharePct(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>
            </div>

            {/* Bonus Result Box */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-950">
              <div className="flex justify-between">
                <span>१. थप प्राप्त हुने बोनस सेयर:</span>
                <span className="font-mono font-black text-emerald-700 text-base">
                  +{bonusSharesReceived} कित्ता
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-emerald-200 font-black text-sm text-indigo-900">
                <span>२. अब कुल हुने सेयर कित्ता:</span>
                <span className="font-mono text-xl text-indigo-700">
                  {totalSharesAfterBonus} कित्ता
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                ({sharesOwned} + {bonusSharesReceived} = {totalSharesAfterBonus} कित्ता)
              </p>
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};
export default DividendShareholderSimulator;

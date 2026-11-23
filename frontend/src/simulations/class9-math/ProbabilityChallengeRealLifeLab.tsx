import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const ProbabilityChallengeRealLifeLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U19-02',
    chapter: 19,
    titleNp: 'सम्भाव्यता चुनौती तथा व्यावहारिक प्रयोगशाला',
    titleEn: 'Probability Challenge and Real-Life Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'cards10' | 'deck52' | 'real_life' | 'scale' | 'challenge'>('cards10');

  // Activity A: Number Cards 1..10
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'even' | 'odd' | 'square' | 'prime'>('all');

  const cardSets = {
    all: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    even: [2, 4, 6, 8, 10],
    odd: [1, 3, 5, 7, 9],
    square: [1, 4, 9],
    prime: [2, 3, 5, 7],
  };

  const handlePickRandomCard = () => {
    const r = Math.floor(Math.random() * 10) + 1;
    setSelectedCard(r);
  };

  // Activity B: Playing Card 52-deck
  const [deckEvent, setDeckEvent] = useState<'red' | 'spade' | 'face' | 'ace' | 'king'>('red');
  const deckConfig = {
    red: { nameNp: 'रातो तास (Red Card)', nameEn: 'Red Card', count: 26, total: 52, p: '26/52 = 1/2' },
    spade: { nameNp: 'हुकुम (Spade ♠)', nameEn: 'Spade (♠)', count: 13, total: 52, p: '13/52 = 1/4' },
    face: { nameNp: 'चित्र भएको तास (Face Cards: J, Q, K)', nameEn: 'Face Card (J, Q, K)', count: 12, total: 52, p: '12/52 = 3/13' },
    ace: { nameNp: 'इक्का (Ace A)', nameEn: 'Ace (A)', count: 4, total: 52, p: '4/52 = 1/13' },
    king: { nameNp: 'बास्सा (King K)', nameEn: 'King (K)', count: 4, total: 52, p: '4/52 = 1/13' },
  };

  // Activity C: Classroom Real-Life
  const [boysCount, setBoysCount] = useState<number>(24);
  const [girlsCount, setGirlsCount] = useState<number>(26);
  const totalStudents = boysCount + girlsCount;

  // Activity D: Scale Event Selector
  const [scalePosition, setScalePosition] = useState<number>(0.5);

  // Activity E / Challenge: Quiz questions
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [userSelectedOption, setUserSelectedOption] = useState<number | null>(null);
  const [challengeAnswered, setChallengeAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const QUIZ = [
    {
      qNp: '१ देखि १० सम्मका कार्डहरूबाट एउटा कार्ड थुत्दा पूर्ण वर्ग (Square number: १, ४, ९) पर्ने सम्भाव्यता कति हुन्छ?',
      qEn: 'What is the probability of drawing a square number (1, 4, 9) from cards numbered 1 to 10?',
      opts: ['१/१०', '३/१०', '२/५', '१/२'],
      correct: 1,
      expNp: 'अनुकूल सङ्ख्या n(E) = ३ (१, ४, ९), कुल सङ्ख्या n(S) = १०। अतः P(E) = ३/१०।',
      expEn: 'Favourable outcomes n(E) = 3 ({1, 4, 9}), total outcomes n(S) = 10. Thus P(E) = 3/10.',
    },
    {
      qNp: '५२ पत्तीको तासमा एउटा तास थुत्दा "हुकुम" (Spade) पर्ने सम्भाव्यता कति हुन्छ?',
      qEn: 'What is the probability of drawing a Spade from a well-shuffled pack of 52 cards?',
      opts: ['१/४', '१/२', '१/१३', '४/५२'],
      correct: 0,
      expNp: 'हुकुमको जम्मा सङ्ख्या १३ हुन्छ। अतः P(Spade) = १३/५२ = १/४।',
      expEn: 'Total spades = 13. Therefore P(Spade) = 13/52 = 1/4.',
    },
    {
      qNp: 'यदि कुनै घटना घट्ने सम्भाव्यता P(E) = ३/५ भए, नघट्ने सम्भाव्यता P(not E) कति हुन्छ?',
      qEn: 'If the probability of an event is P(E) = 3/5, what is the complementary probability P(not E)?',
      opts: ['२/५', '३/५', '१/५', '०'],
      correct: 0,
      expNp: 'पूरक सम्भाव्यता P(not E) = १ - P(E) = १ - ३/५ = २/५।',
      expEn: 'Complementary probability P(not E) = 1 - P(E) = 1 - 3/5 = 2/5.',
    },
    {
      qNp: 'एउटा पासा एकपटक दगुराउँदा "जोडी सङ्ख्या" र "विजोडी सङ्ख्या" एकैपटक आउन नसक्ने घटनालाई के भनिन्छ?',
      qEn: 'What are events called that cannot occur simultaneously (e.g. even and odd on a single die roll)?',
      opts: ['परस्पर निवारक घटना (Mutually Exclusive Events)', 'समसम्भाव्य घटना', 'निश्चित घटना', 'असम्भव घटना'],
      correct: 0,
      expNp: 'एकैपटक घट्न नसक्ने घटनाहरूलाई परस्पर निवारक घटना (Mutually Exclusive Events) भनिन्छ।',
      expEn: 'Events that cannot happen at the same time are called Mutually Exclusive Events.',
    },
  ];

  const handleSelectChallenge = (idx: number) => {
    if (challengeAnswered) return;
    setUserSelectedOption(idx);
    setChallengeAnswered(true);
    if (idx === QUIZ[challengeIdx].correct) {
      setScore(s => s + 25);
    }
  };

  const handleNextChallenge = () => {
    setUserSelectedOption(null);
    setChallengeAnswered(false);
    setChallengeIdx(c => (c + 1) % QUIZ.length);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      mascotGreeting={L(
        'नमस्ते! कार्डहरू, ५२ पत्तीको तास, कक्षा कोठाका विद्यार्थी छनोट, र ० देखि १ सम्मको सम्भाव्यता रेखा मार्फत व्यावहारिक सम्भाव्यता अन्वेषण गर्नुहोस्!',
        'Welcome! Explore practical probability with numbered cards, 52-card decks, real-life student selection, and the 0 to 1 probability scale!'
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigation Tabs */}
        <div className="lg:col-span-12 flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('cards10')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'cards10'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. {L('१–१० नम्बर कार्ड (Number Cards)', '1–10 Cards')}
          </button>
          <button
            onClick={() => setActiveTab('deck52')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'deck52'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. {L('५२ पत्ती तास (52-Card Deck)', '52-Card Deck')}
          </button>
          <button
            onClick={() => setActiveTab('real_life')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'real_life'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. {L('कक्षा छनोट (Student Selection)', 'Student Selection')}
          </button>
          <button
            onClick={() => setActiveTab('scale')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'scale'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. {L('सम्भाव्यता नाप (0 to 1 Scale)', 'Probability Scale')}
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'challenge'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5. {L('चुनौती प्रश्न (Challenge)', 'Challenge Quiz')}
          </button>
        </div>

        {/* TAB 1: Number Cards 1..10 */}
        {activeTab === 'cards10' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {L('१ देखि १० सम्मका सङ्ख्या कार्डहरू (Cards 1 to 10)', 'Numbered Cards 1 to 10')}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  S = &#123; 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 &#125;, n(S) = 10
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePickRandomCard}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  🎲 {L('एउटा कार्ड थुत्नुहोस् (Draw 1 Card)', 'Draw 1 Card')}
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="font-semibold text-slate-600 py-1">{L('घटना समूह हेर्नुहोस्:', 'Highlight Event:')}</span>
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg border font-medium ${
                  filterType === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {L('सबै कार्डहरू (n=१०)', 'All Cards (10)')}
              </button>
              <button
                onClick={() => setFilterType('even')}
                className={`px-3 py-1 rounded-lg border font-medium ${
                  filterType === 'even' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {L('जोडी सङ्ख्या (Even: ५)', 'Even (5)')}
              </button>
              <button
                onClick={() => setFilterType('odd')}
                className={`px-3 py-1 rounded-lg border font-medium ${
                  filterType === 'odd' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {L('विजोडी सङ्ख्या (Odd: ५)', 'Odd (5)')}
              </button>
              <button
                onClick={() => setFilterType('square')}
                className={`px-3 py-1 rounded-lg border font-medium ${
                  filterType === 'square' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {L('पूर्ण वर्ग (Square: ३)', 'Square (3)')}
              </button>
              <button
                onClick={() => setFilterType('prime')}
                className={`px-3 py-1 rounded-lg border font-medium ${
                  filterType === 'prime' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {L('रूढ सङ्ख्या (Prime: ४)', 'Prime (4)')}
              </button>
            </div>

            {/* Cards Display Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 p-4 bg-slate-50 rounded-xl border border-slate-200">
              {cardSets.all.map(num => {
                const isHighlighted = filterType === 'all' || cardSets[filterType].includes(num);
                const isDrawn = selectedCard === num;

                return (
                  <div
                    key={num}
                    onClick={() => setSelectedCard(num)}
                    className={`h-24 rounded-xl border-2 flex flex-col items-center justify-between p-2 cursor-pointer transition-all ${
                      isDrawn
                        ? 'bg-amber-100 border-amber-500 shadow-md scale-105'
                        : isHighlighted
                        ? 'bg-white border-indigo-400 shadow-2xs'
                        : 'bg-slate-100 border-slate-200 opacity-40'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-400">#{fmt(num)}</span>
                    <span className="text-xl font-bold font-mono text-slate-800">{fmt(num)}</span>
                    <span className="text-[8px] font-bold text-indigo-700">
                      {isDrawn ? 'DRAWN' : isHighlighted ? '✓' : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Probability Result */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs flex flex-col sm:flex-row justify-between items-center gap-2">
              <span className="font-bold text-indigo-950">
                {filterType === 'all'
                  ? L('सबै कार्डहरू आउने सम्भाव्यता P(S) = १०/१० = १', 'P(Any card) = 10/10 = 1')
                  : filterType === 'square'
                  ? L('पूर्ण वर्ग सङ्ख्या आउने सम्भाव्यता P(Square) = n(E)/n(S) = ३/१० = ०.३', 'P(Square) = 3/10 = 0.3')
                  : filterType === 'even'
                  ? L('जोडी सङ्ख्या आउने सम्भाव्यता P(Even) = ५/१० = १/२ = ०.५', 'P(Even) = 5/10 = 1/2 = 0.5')
                  : filterType === 'odd'
                  ? L('विजोडी सङ्ख्या आउने सम्भाव्यता P(Odd) = ५/१० = १/२ = ०.५', 'P(Odd) = 5/10 = 1/2 = 0.5')
                  : L('रूढ सङ्ख्या आउने सम्भाव्यता P(Prime) = ४/१० = २/५ = ०.४', 'P(Prime) = 4/10 = 2/5 = 0.4')}
              </span>
              {selectedCard !== null && (
                <span className="font-mono bg-white px-3 py-1 rounded border border-indigo-200 font-bold text-indigo-700">
                  {L(`थुतिएको कार्ड: ${fmt(selectedCard)}`, `Drawn: ${selectedCard}`)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Playing Card Deck (52 cards) */}
        {activeTab === 'deck52' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">
                  {L('५२ पत्तीको तास (Standard 52-Card Deck)', 'Standard 52-Card Pack')}
                </h4>
                <p className="text-xs text-slate-500">
                  {L('२६ रातो (मुटु र इँट) र २६ कालो (हुकुम र चिडी)', '26 Red (Hearts, Diamonds) and 26 Black (Spades, Clubs)')}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded">
                n(S) = ५२
              </span>
            </div>

            {/* Event Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(Object.keys(deckConfig) as (keyof typeof deckConfig)[]).map(k => (
                <button
                  key={k}
                  onClick={() => setDeckEvent(k)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                    deckEvent === k
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>{L(deckConfig[k].nameNp, deckConfig[k].nameEn)}</div>
                  <div className="text-[10px] text-indigo-600 font-mono mt-1">n(E) = {fmt(deckConfig[k].count)}</div>
                </button>
              ))}
            </div>

            {/* Visual Deck Classification */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-950">
                <div className="font-bold text-sm">♥️ {L('पान / मुटु (Hearts)', 'Hearts')}</div>
                <div className="mt-1 text-slate-600">{L('१३ पत्ती (रातो)', '13 cards (Red)')}</div>
                <div className="font-mono text-xs font-bold text-rose-700 mt-2">P = १३/५२ = १/४</div>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-950">
                <div className="font-bold text-sm">♦️ {L('इँट (Diamonds)', 'Diamonds')}</div>
                <div className="mt-1 text-slate-600">{L('१३ पत्ती (रातो)', '13 cards (Red)')}</div>
                <div className="font-mono text-xs font-bold text-rose-700 mt-2">P = १३/५२ = १/४</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-300 text-slate-900">
                <div className="font-bold text-sm">♠️ {L('हुकुम (Spades)', 'Spades')}</div>
                <div className="mt-1 text-slate-600">{L('१३ पत्ती (कालो)', '13 cards (Black)')}</div>
                <div className="font-mono text-xs font-bold text-slate-800 mt-2">P = १३/५२ = १/४</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-300 text-slate-900">
                <div className="font-bold text-sm">♣️ {L('चिडी (Clubs)', 'Clubs')}</div>
                <div className="mt-1 text-slate-600">{L('१३ पत्ती (कालो)', '13 cards (Black)')}</div>
                <div className="font-mono text-xs font-bold text-slate-800 mt-2">P = १३/५२ = १/४</div>
              </div>
            </div>

            {/* Selected Calculation Result */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-indigo-950">
                  {L('छानिएको घटनाको सम्भाव्यता:', 'Probability of selected event:')}{' '}
                </span>
                <span className="font-semibold text-slate-700">
                  {L(deckConfig[deckEvent].nameNp, deckConfig[deckEvent].nameEn)}
                </span>
              </div>
              <span className="font-mono text-base font-bold text-indigo-700">
                P(E) = {deckConfig[deckEvent].p}
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: Student Selection in Classroom */}
        {activeTab === 'real_life' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">
              {L('कक्षा कोठामा विद्यार्थी छनोट (Classroom Selection Problem)', 'Classroom Student Selection')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">
                    👦 {L('छात्रहरूको सङ्ख्या (Boys):', 'Number of Boys:')}
                  </label>
                  <span className="font-mono font-bold text-indigo-700">{fmt(boysCount)}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={boysCount}
                  onChange={e => setBoysCount(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700">
                    👧 {L('छात्राहरूको सङ्ख्या (Girls):', 'Number of Girls:')}
                  </label>
                  <span className="font-mono font-bold text-rose-700">{fmt(girlsCount)}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={girlsCount}
                  onChange={e => setGirlsCount(parseInt(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>
            </div>

            {/* Calculations Card */}
            <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 space-y-2 text-xs">
              <div className="font-bold text-indigo-950 flex justify-between">
                <span>{L(`कुल विद्यार्थी (Total Students, n(S)):`, 'Total Students (n(S)):')}</span>
                <span className="font-mono text-sm">{fmt(boysCount)} + {fmt(girlsCount)} = {fmt(totalStudents)}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white rounded-lg border border-indigo-100 flex justify-between items-center font-mono">
                  <span>P(Boy) = \frac&#123;{fmt(boysCount)}&#125;&#123;{fmt(totalStudents)}&#125;</span>
                  <span className="font-bold text-indigo-700 text-sm">
                    {((boysCount / totalStudents) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-indigo-100 flex justify-between items-center font-mono">
                  <span>P(Girl) = \frac&#123;{fmt(girlsCount)}&#125;&#123;{fmt(totalStudents)}&#125;</span>
                  <span className="font-bold text-rose-700 text-sm">
                    {((girlsCount / totalStudents) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-slate-600 pt-1">
                P(Boy) + P(Girl) = 1.00 {L('(दुवै परस्पर निवारक र सम्पूरक हुन्)', '(They are mutually exclusive and complementary)')}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Probability Scale (0 to 1) */}
        {activeTab === 'scale' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm">
                {L('सम्भाव्यता नाप (Probability Scale: 0 to 1)', 'Probability Scale (0 to 1)')}
              </h4>
              <p className="text-xs text-slate-500">
                {L('सम्भाव्यता सधैं ० र १ को बीचमा (वा ०% देखि १००% सम्म) मात्र हुन्छ।', 'Probability always lies strictly between 0 and 1 inclusive.')}
              </p>
            </div>

            {/* Horizontal Scale Slider */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span className="text-rose-600">0 ({L('असम्भव', 'Impossible')})</span>
                <span className="text-amber-600">0.5 ({L('बराबर सम्भाव्य', 'Even Chance')})</span>
                <span className="text-emerald-600">1 ({L('निश्चित', 'Certain')})</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={scalePosition}
                onChange={e => setScalePosition(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer h-3"
              />
              <div className="text-center font-mono text-base font-bold text-indigo-700">
                P = {fmt(scalePosition.toFixed(2))} ({fmt(Math.round(scalePosition * 100))}%)
              </div>
            </div>

            {/* Scale Real-life Categorization Examples */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 space-y-1">
                <div className="font-bold">❌ P = 0 ({L('असम्भव घटना', 'Impossible Event')})</div>
                <div className="text-[11px] text-slate-600">
                  {L('उदाहरण: साधारण पासा दगुराउँदा ७ आउने सम्भाव्यता।', 'Example: Rolling a 7 on a standard 6-sided die.')}
                </div>
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 space-y-1">
                <div className="font-bold">⚖️ P = 0.5 ({L('बराबर सम्भावना', 'Even Chance')})</div>
                <div className="text-[11px] text-slate-600">
                  {L('उदाहरण: निष्पक्ष सिक्का उफार्दा शीर्ष (Head) आउने।', 'Example: Getting a Head on an unbiased coin toss.')}
                </div>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
                <div className="font-bold">✅ P = 1 ({L('निश्चित घटना', 'Certain Event')})</div>
                <div className="text-[11px] text-slate-600">
                  {L('उदाहरण: पासा दगुराउँदा ७ भन्दा सानो सङ्ख्या आउने।', 'Example: Rolling a number less than 7 on a die.')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Challenge Quiz */}
        {activeTab === 'challenge' && (
          <div className="lg:col-span-12 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                {L(`प्रश्न ${challengeIdx + 1} / ${QUIZ.length}`, `Question ${challengeIdx + 1} of ${QUIZ.length}`)}
              </span>
              <span className="font-bold text-xs bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                ⭐ {L(`अङ्क: ${fmt(score)}`, `Score: ${score}`)}
              </span>
            </div>

            <h3 className="font-bold text-slate-800 text-sm">
              {L(QUIZ[challengeIdx].qNp, QUIZ[challengeIdx].qEn)}
            </h3>

            <div className="space-y-2">
              {QUIZ[challengeIdx].opts.map((opt, i) => {
                let style = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';
                if (challengeAnswered) {
                  if (i === QUIZ[challengeIdx].correct) {
                    style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                  } else if (userSelectedOption === i) {
                    style = 'bg-rose-50 border-rose-500 text-rose-900 font-bold';
                  } else {
                    style = 'opacity-50 border-slate-200 text-slate-400';
                  }
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleSelectChallenge(i)}
                    disabled={challengeAnswered}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${style}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {challengeAnswered && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div className="font-bold text-indigo-900">{L('स्पष्टीकरण:', 'Explanation:')}</div>
                <div className="text-slate-700">{L(QUIZ[challengeIdx].expNp, QUIZ[challengeIdx].expEn)}</div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              {challengeAnswered && (
                <button
                  onClick={handleNextChallenge}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {challengeIdx === QUIZ.length - 1
                    ? L('सुरुबाट फेरि गर्नुहोस्', 'Start Over')
                    : L('अर्को प्रश्न →', 'Next Question →')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default ProbabilityChallengeRealLifeLab;

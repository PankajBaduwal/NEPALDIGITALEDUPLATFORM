import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp } from '../class1-math-kit/nepali';

interface SimProps {
  onBackToLibrary?: () => void;
  onBack?: () => void;
}

export const ProbabilityTreeLab: React.FC<SimProps> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G10-U14-01',
    chapter: 14,
    titleNp: 'सम्भाव्यता तथा वृक्ष चित्र प्रयोगशाला',
    titleEn: 'Probability Experiment and Tree Diagram Lab',
  });
  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const fmt = (n: number | string) => (isNe ? toNp(n) : String(n));
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'sampleSpace' | 'mutuallyExclusive' | 'replacement' | 'treeDiagram' | 'trials' | 'challenge'>('sampleSpace');

  // ── 1. SAMPLE SPACE STATE ──────────────────────────────────────────────────
  const [experimentType, setExperimentType] = useState<'coin1' | 'coin2' | 'coin3' | 'die1' | 'balls'>('coin2');

  // ── 2. MUTUALLY EXCLUSIVE EVENTS STATE ──────────────────────────────────────
  const [eventScenario, setEventScenario] = useState<'die_even_odd' | 'cards_king_spade'>('die_even_odd');

  // ── 3. WITH VS WITHOUT REPLACEMENT STATE ───────────────────────────────────
  // Bag containing 5 Red (R) and 7 Green (G) balls (total = 12)
  const [isWithReplacement, setIsWithReplacement] = useState<boolean>(true);
  const [selectedPair, setSelectedPair] = useState<'RR' | 'RG' | 'GR' | 'GG'>('RR');

  const totalBalls = 12;
  const numR = 5;
  const numG = 7;

  // Probabilities calculation
  let pFirst = 0;
  let pSecond = 0;
  if (selectedPair === 'RR') {
    pFirst = numR / totalBalls; // 5/12
    pSecond = isWithReplacement ? numR / totalBalls : (numR - 1) / (totalBalls - 1); // 5/12 or 4/11
  } else if (selectedPair === 'RG') {
    pFirst = numR / totalBalls; // 5/12
    pSecond = isWithReplacement ? numG / totalBalls : numG / (totalBalls - 1); // 7/12 or 7/11
  } else if (selectedPair === 'GR') {
    pFirst = numG / totalBalls; // 7/12
    pSecond = isWithReplacement ? numR / totalBalls : numR / (totalBalls - 1); // 5/12 or 5/11
  } else {
    pFirst = numG / totalBalls; // 7/12
    pSecond = isWithReplacement ? numG / totalBalls : (numG - 1) / (totalBalls - 1); // 7/12 or 6/11
  }
  const combinedProb = pFirst * pSecond;

  // ── 4. EXPERIMENTAL SIMULATOR (TRIALS) ──────────────────────────────────────
  const [numTrials, setNumTrials] = useState<number>(100);
  const [headsCount, setHeadsCount] = useState<number>(51);
  const [hasRunSim, setHasRunSim] = useState<boolean>(false);

  const handleRunTrials = (count: number) => {
    kit.tap();
    setNumTrials(count);
    let heads = 0;
    for (let i = 0; i < count; i++) {
      if (Math.random() < 0.5) heads++;
    }
    setHeadsCount(heads);
    setHasRunSim(true);
  };

  // ── 5. PRACTICE CHALLENGE ──────────────────────────────────────────────────
  const [score, setScore] = useState<number>(0);
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const quizQuestions = [
    {
      qEn: 'If events A and B are mutually exclusive, what is P(A ∩ B) and the addition rule for P(A ∪ B)?',
      qNp: 'यदि घटनाहरू A र B पारस्परिक निषेधक (Mutually Exclusive) भए P(A ∩ B) को मान कति हुन्छ र P(A ∪ B) को सूत्र के हुन्छ?',
      options: [
        'P(A ∩ B) = 0, P(A ∪ B) = P(A) + P(B)',
        'P(A ∩ B) = 1, P(A ∪ B) = P(A) × P(B)',
        'P(A ∩ B) = P(A), P(A ∪ B) = P(A) - P(B)',
        'P(A ∩ B) = 0.5, P(A ∪ B) = 1',
      ],
      optionsNp: [
        'P(A ∩ B) = ०, P(A ∪ B) = P(A) + P(B)',
        'P(A ∩ B) = १, P(A ∪ B) = P(A) × P(B)',
        'P(A ∩ B) = P(A), P(A ∪ B) = P(A) - P(B)',
        'P(A ∩ B) = ०.५, P(A ∪ B) = १',
      ],
      correct: 0,
      hintEn: 'Mutually exclusive events cannot happen together (A ∩ B = ∅), so P(A ∩ B) = 0 and P(A ∪ B) = P(A) + P(B).',
      hintNp: 'पारस्परिक निषेधक घटनाहरू एकसाथ घट्न सक्दैनन् (A ∩ B = ∅), त्यसैले P(A ∩ B) = ० र P(A ∪ B) = P(A) + P(B) हुन्छ।',
    },
    {
      qEn: 'A bag has 4 Red and 6 Black balls. Two balls are drawn one after another without replacement. What is the probability that both are Red?',
      qNp: 'एउटा झोलामा ४ रातो र ६ कालो बलहरू छन्। पुन: नराखी (Without replacement) दुईवटा बल पालैपालो झिक्दा दुवै रातो पर्ने सम्भाव्यता कति हुन्छ?',
      options: ['(4/10) × (3/9) = 12/90 = 2/15', '(4/10) × (4/10) = 16/100', '4/10 + 3/9', '4/10'],
      optionsNp: ['(४/१०) × (३/९) = १२/९० = २/१५', '(४/१०) × (४/१०) = १६/१००', '४/१० + ३/९', '४/१०'],
      correct: 0,
      hintEn: 'First draw: P(R1) = 4/10. Second draw without replacement: P(R2|R1) = 3/9. P(R1 ∩ R2) = 4/10 × 3/9 = 2/15.',
      hintNp: 'पहिलो पटकमा P(R₁) = ४/१०। सट्टा नदिई दोस्रो पटकमा रातो ३ वटा र कुल ९ वटा बाँकी रहन्छन्: P(R₂|R₁) = ३/९। गुणन गर्दा २/१५।',
    },
    {
      qEn: 'In tossing three fair coins simultaneously, how many total possible outcomes exist in the sample space S?',
      qNp: 'तीनवटा सिक्का एकसाथ उफार्दा नमुना क्षेत्र S मा कुल कतिवटा सम्भावित परिणामहरू हुन्छन्?',
      options: ['8 outcomes (2³)', '6 outcomes', '4 outcomes', '9 outcomes'],
      optionsNp: ['८ वटा (२³)', '६ वटा', '४ वटा', '९ वटा'],
      correct: 0, // 2^3 = 8
      hintEn: 'Each coin has 2 outcomes. For 3 coins: 2 × 2 × 2 = 8 outcomes (HHH, HHT, HTH, HTT, THH, THT, TTH, TTT).',
      hintNp: 'प्रत्येक सिक्कामा २ परिणाम हुन्छन्। ३ वटा सिक्कामा: २ × २ × २ = ८ वटा परिणामहरू हुन्छन्।',
    },
    {
      qEn: 'From a standard deck of 52 cards, what is the probability of drawing a King OR a Spade (non-mutually exclusive)?',
      qNp: '५२ पत्तीको तासको गड्डीबाट एउटा तास थुत्दा राजा (King) वा सुरत (Spade) पर्ने सम्भाव्यता कति हुन्छ?',
      options: ['16/52 = 4/13', '17/52', '13/52', '4/52'],
      optionsNp: ['१६/५२ = ४/१३', '१७/५२', '१३/५२', '४/५२'],
      correct: 0, // P(King) + P(Spade) - P(King of Spades) = 4/52 + 13/52 - 1/52 = 16/52 = 4/13
      hintEn: 'P(K ∪ S) = P(K) + P(S) - P(K ∩ S) = 4/52 + 13/52 - 1/52 = 16/52 = 4/13.',
      hintNp: 'राजा ४ वटा, सुरत १३ वटा, र दुवै साझा (सुरतको राजा) १ वटा: P(K ∪ S) = ४/५२ + १३/५२ - १/५२ = १६/५२ = ४/१३।',
    },
  ];

  const handleSelectAnswer = (idx: number) => {
    setSelectedAns(idx);
    const q = quizQuestions[quizIdx];
    if (idx === q.correct) {
      kit.good();
      setScore((prev) => prev + 10);
      setQuizFeedback(isNe ? 'सटीक उत्तर! धेरै राम्रो।' : 'Correct! Excellent probability reasoning.');
    } else {
      kit.oops();
      setQuizFeedback(isNe ? 'गलत उत्तर। संकेत हेरी पुन: प्रयास गर्नुहोस्।' : 'Incorrect. Check the probability formula.');
    }
  };

  const handleNextQuiz = () => {
    kit.tap();
    setSelectedAns(null);
    setQuizFeedback(null);
    setQuizIdx((prev) => (prev + 1) % quizQuestions.length);
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={10}
      mascotGreeting={L(
        'नमस्ते! कक्षा १० गणितको एकाइ १४: सम्भाव्यता (Probability) प्रयोगशालामा स्वागत छ! यहाँ नमुना क्षेत्र, पारस्परिक निषेधक घटनाहरू, सट्टा दिएर/नदिएर गरिने परीक्षण र वृक्ष चित्र (Tree Diagram) प्रत्यक्ष अन्वेषण गर्नुहोस्!',
        'Welcome to Grade 10 Unit 14: Probability Experiment & Tree Diagram Lab! Explore sample spaces, mutually exclusive events, with/without replacement conditions, and interactive tree diagrams!'
      )}
    >
      <div className="space-y-4 max-w-5xl mx-auto">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b pb-2">
          {[
            { id: 'sampleSpace', labelNp: 'क) नमुना क्षेत्र (Sample Space)', labelEn: 'A) Sample Space' },
            { id: 'mutuallyExclusive', labelNp: 'ख) पारस्परिक निषेधक घटनाहरू', labelEn: 'B) Mutually Exclusive' },
            { id: 'replacement', labelNp: 'ग) सट्टा दिएर / नदिई (Replacement)', labelEn: 'C) With/Without Replacement' },
            { id: 'treeDiagram', labelNp: 'घ) वृक्ष चित्र (Tree Diagram)', labelEn: 'D) Tree Diagram' },
            { id: 'trials', labelNp: 'ङ) प्रयोगात्मक परीक्षण (Trials)', labelEn: 'E) Empirical Trials' },
            { id: 'challenge', labelNp: 'च) अभ्यास चुनौती (Quiz)', labelEn: 'F) Practice Challenge' },
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

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 1: SAMPLE SPACE EXPLORER
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'sampleSpace' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            {/* Experiment Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border rounded-xl">
              <span className="text-xs font-bold text-slate-700">
                {L('यादृच्छिक परीक्षण छान्नुहोस् (Select Experiment):', 'Select Random Experiment:')}
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'coin1', np: '१ सिक्का (1 Coin)', en: '1 Coin' },
                  { id: 'coin2', np: '२ सिक्का (2 Coins)', en: '2 Coins' },
                  { id: 'coin3', np: '३ सिक्का (3 Coins)', en: '3 Coins' },
                  { id: 'die1', np: '१ पासा (1 Die)', en: '1 Die' },
                ].map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => {
                      kit.tap();
                      setExperimentType(exp.id as any);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      experimentType === exp.id
                        ? 'bg-[#142D4E] text-white shadow-sm'
                        : 'bg-white border text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isNe ? exp.np : exp.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Display Outcomes */}
            <div className="p-5 bg-teal-50 border border-teal-200 rounded-xl space-y-3 font-mono">
              {experimentType === 'coin1' && (
                <div>
                  <div className="text-xs font-bold text-teal-800 font-sans mb-1">१ सिक्का उफार्दा नमुना क्षेत्र (S):</div>
                  <div className="text-xl font-bold text-[#142D4E]">S = {'{ H, T }'}, n(S) = २</div>
                  <div className="text-xs text-slate-600 font-sans mt-2">P(शीर्ष H) = १/२ = ०.५, P(पुच्छर T) = १/२ = ०.५</div>
                </div>
              )}
              {experimentType === 'coin2' && (
                <div>
                  <div className="text-xs font-bold text-teal-800 font-sans mb-1">२ सिक्का एकसाथ उफार्दा नमुना क्षेत्र (S):</div>
                  <div className="text-xl font-bold text-[#142D4E]">S = {'{ HH, HT, TH, TT }'}, n(S) = ४</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 font-sans text-xs">
                    <div className="p-2.5 bg-white rounded border text-center font-bold text-teal-700">HH (२ वटा H): P = १/४</div>
                    <div className="p-2.5 bg-white rounded border text-center font-bold text-teal-700">HT (१ H, १ T): P = १/४</div>
                    <div className="p-2.5 bg-white rounded border text-center font-bold text-teal-700">TH (१ T, १ H): P = १/४</div>
                    <div className="p-2.5 bg-white rounded border text-center font-bold text-teal-700">TT (२ वटा T): P = १/४</div>
                  </div>
                </div>
              )}
              {experimentType === 'coin3' && (
                <div>
                  <div className="text-xs font-bold text-teal-800 font-sans mb-1">३ सिक्का एकसाथ उफार्दा नमुना क्षेत्र (S = २³):</div>
                  <div className="text-base font-bold text-[#142D4E] break-words">
                    S = {'{ HHH, HHT, HTH, HTT, THH, THT, TTH, TTT }'}, n(S) = ८
                  </div>
                  <div className="p-3 bg-white rounded border font-sans text-xs text-slate-700 mt-2 space-y-1">
                    <div>• कम्तीमा २ वटा H आउने: {'{ HHH, HHT, HTH, THH }'} ⟹ P = ४/८ = १/२</div>
                    <div>• ठिक १ वटा T आउने: {'{ HHT, HTH, THH }'} ⟹ P = ३/८</div>
                  </div>
                </div>
              )}
              {experimentType === 'die1' && (
                <div>
                  <div className="text-xs font-bold text-teal-800 font-sans mb-1">१ पासा (Die) गुल्ट्याउँदा नमुना क्षेत्र:</div>
                  <div className="text-xl font-bold text-[#142D4E]">S = {'{ १, २, ३, ४, ५, ६ }'}, n(S) = ६</div>
                  <div className="p-3 bg-white rounded border font-sans text-xs text-slate-700 mt-2 space-y-1">
                    <div>• जोर संख्या आउने {'{ २, ४, ६ }'} ⟹ P = ३/६ = १/२</div>
                    <div>• बिजोर संख्या आउने {'{ १, ३, ५ }'} ⟹ P = ३/६ = १/२</div>
                    <div>• रूढ संख्या (Prime) आउने {'{ २, ३, ५ }'} ⟹ P = ३/६ = १/२</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 2: MUTUALLY EXCLUSIVE EVENTS
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'mutuallyExclusive' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            <div className="flex gap-2">
              <button
                onClick={() => setEventScenario('die_even_odd')}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  eventScenario === 'die_even_odd' ? 'bg-[#167C80] text-white border-[#167C80]' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {L('१) पासामा जोर र बिजोर (पारस्परिक निषेधक)', '1) Die: Even & Odd (Mutually Exclusive)')}
              </button>
              <button
                onClick={() => setEventScenario('cards_king_spade')}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  eventScenario === 'cards_king_spade' ? 'bg-[#167C80] text-white border-[#167C80]' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {L('२) तासको गड्डीमा राजा र सुरत (गैर-निषेधक)', '2) Cards: King & Spade (Non-Exclusive)')}
              </button>
            </div>

            {eventScenario === 'die_even_odd' ? (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-3 font-mono text-xs sm:text-sm">
                <span className="font-bold text-[#142D4E] font-sans block text-sm">
                  {L('पारस्परिक निषेधक घटनाहरू (Mutually Exclusive: A ∩ B = ∅):', 'Mutually Exclusive (A ∩ B = ∅):')}
                </span>
                <div>A = जोर संख्या आउने = {'{ २, ४, ६ }'} ⟹ n(A) = ३, P(A) = ३/६</div>
                <div>B = बिजोर संख्या आउने = {'{ १, ३, ५ }'} ⟹ n(B) = ३, P(B) = ३/६</div>
                <div className="p-2.5 bg-white rounded border text-teal-800 font-bold">
                  A ∩ B = ∅ (कुनै साझा सदस्य छैन) ⟹ P(A ∩ B) = ०
                </div>
                <div className="text-base font-bold text-teal-900 font-sans pt-1">
                  P(A ∪ B) = P(A) + P(B) = ३/६ + ३/६ = ६/६ = १ (निश्चित घटना)
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 font-mono text-xs sm:text-sm">
                <span className="font-bold text-amber-900 font-sans block text-sm">
                  {L('पारस्परिक गैर-निषेधक घटनाहरू (Non-Mutually Exclusive: A ∩ B ≠ ∅):', 'Non-Mutually Exclusive (A ∩ B ≠ ∅):')}
                </span>
                <div>A = राजा पर्ने (Kings) = ४ वटा ⟹ P(A) = ४/५२</div>
                <div>B = सुरत पर्ने (Spades) = १३ वटा ⟹ P(B) = १३/५२</div>
                <div className="p-2.5 bg-white rounded border text-amber-800 font-bold">
                  A ∩ B = {'{ सुरतको राजा }'} = १ वटा ⟹ P(A ∩ B) = १/५२ (साझा सदस्य छ!)
                </div>
                <div className="text-base font-bold text-amber-900 font-sans pt-1">
                  P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = ४/५२ + १३/५२ - १/५२ = १६/५२ = ४/१३
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 3: WITH VS WITHOUT REPLACEMENT
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'replacement' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-5">
            <div>
              <h4 className="font-bold text-sm text-[#142D4E] mb-1">
                {L('सट्टा दिएर (With Replacement) र सट्टा नदिई (Without Replacement) झिक्दा', 'With vs. Without Replacement')}
              </h4>
              <p className="text-xs text-slate-600">
                {L(
                  'झोलामा ५ रातो (R) र ७ हरियो (G) गरी कुल १२ वटा बलहरू छन्।',
                  'A bag contains 5 Red (R) and 7 Green (G) balls (Total = 12).'
                )}
              </p>
            </div>

            {/* Toggle Condition */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsWithReplacement(true)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  isWithReplacement ? 'bg-[#167C80] text-white border-[#167C80]' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {L('क) सट्टा दिएर (पुन: राखेर / With Replacement) - स्वतन्त्र घटना', 'With Replacement (Independent)')}
              </button>
              <button
                onClick={() => setIsWithReplacement(false)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  !isWithReplacement ? 'bg-[#167C80] text-white border-[#167C80]' : 'bg-slate-50 text-slate-700'
                }`}
              >
                {L('ख) सट्टा नदिई (पुन: नराखेर / Without Replacement) - आश्रित घटना', 'Without Replacement (Dependent)')}
              </button>
            </div>

            {/* Pair Selector */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'RR', label: 'दुवै रातो (RR)' },
                { id: 'RG', label: 'पहिलो रातो, दोस्रो हरियो (RG)' },
                { id: 'GR', label: 'पहिलो हरियो, दोस्रो रातो (GR)' },
                { id: 'GG', label: 'दुवै हरियो (GG)' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    kit.tap();
                    setSelectedPair(p.id as any);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                    selectedPair === p.id ? 'bg-[#142D4E] text-white shadow-sm' : 'bg-slate-50 border text-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Calculation Breakdown */}
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-3 font-mono text-xs sm:text-sm">
              <div className="flex justify-between items-center border-b border-teal-200 pb-2">
                <span className="font-bold text-[#142D4E] text-sm">
                  {L('घटना:', 'Event:')} {selectedPair}
                </span>
                <span className="text-xs bg-teal-200 text-teal-900 px-2.5 py-0.5 rounded-full font-bold">
                  {isWithReplacement ? L('स्वतन्त्र (Independent)', 'Independent') : L('आश्रित (Dependent)', 'Dependent')}
                </span>
              </div>

              <div>१) पहिलो बल झिक्दा सम्भाव्यता = {fmt(pFirst.toFixed(3))}</div>
              <div>२) दोस्रो बल झिक्दा सम्भाव्यता = {fmt(pSecond.toFixed(3))} {!isWithReplacement && '(कुल बल ११ मा घट्यो!)'}</div>
              <div className="text-base font-bold text-teal-900 pt-1">
                P({selectedPair}) = {fmt(pFirst.toFixed(3))} × {fmt(pSecond.toFixed(3))} ={' '}
                <strong className="text-emerald-700">{fmt(combinedProb.toFixed(4))}</strong>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 4: TREE DIAGRAM (वृक्ष चित्र)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'treeDiagram' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <h4 className="font-bold text-sm text-[#142D4E]">
              {L('२ सिक्का उफार्दा वृक्ष चित्र (Tree Diagram for 2 Coins):', 'Tree Diagram for 2 Coins:')}
            </h4>

            {/* SVG Tree Diagram */}
            <div className="w-full overflow-hidden flex justify-center bg-slate-900/90 rounded-2xl p-4 shadow-inner">
              <svg width={480} height={220} viewBox="0 0 480 220" className="max-w-full font-mono">
                {/* Root */}
                <circle cx={40} cy={110} r={6} fill="#FFFFFF" />
                <text x={35} y={130} fill="#94A3B8" fontSize="10">शुरु</text>

                {/* Level 1 Branches (First Toss) */}
                <line x1={40} y1={110} x2={160} y2={60} stroke="#2DD4BF" strokeWidth={2} />
                <text x={90} y={75} fill="#5EEAD4" fontSize="10">H (१/२)</text>

                <line x1={40} y1={110} x2={160} y2={160} stroke="#F59E0B" strokeWidth={2} />
                <text x={90} y={150} fill="#FDE68A" fontSize="10">T (१/२)</text>

                {/* Level 1 Nodes */}
                <circle cx={160} cy={60} r={5} fill="#2DD4BF" />
                <text x={160} y={48} textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">H</text>

                <circle cx={160} cy={160} r={5} fill="#F59E0B" />
                <text x={160} y={180} textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">T</text>

                {/* Level 2 Branches from H */}
                <line x1={160} y1={60} x2={300} y2={30} stroke="#2DD4BF" strokeWidth={1.5} />
                <text x={220} y={40} fill="#5EEAD4" fontSize="10">H (१/२)</text>

                <line x1={160} y1={60} x2={300} y2={90} stroke="#F59E0B" strokeWidth={1.5} />
                <text x={220} y={85} fill="#FDE68A" fontSize="10">T (१/२)</text>

                {/* Level 2 Branches from T */}
                <line x1={160} y1={160} x2={300} y2={130} stroke="#2DD4BF" strokeWidth={1.5} />
                <text x={220} y={140} fill="#5EEAD4" fontSize="10">H (१/२)</text>

                <line x1={160} y1={160} x2={300} y2={190} stroke="#F59E0B" strokeWidth={1.5} />
                <text x={220} y={185} fill="#FDE68A" fontSize="10">T (१/२)</text>

                {/* Outcomes & Probabilities */}
                <text x={340} y={34} fill="#FFFFFF" fontSize="11" fontWeight="bold">HH ⟹ P = १/४ (०.२५)</text>
                <text x={340} y={94} fill="#FFFFFF" fontSize="11" fontWeight="bold">HT ⟹ P = १/४ (०.२५)</text>
                <text x={340} y={134} fill="#FFFFFF" fontSize="11" fontWeight="bold">TH ⟹ P = १/४ (०.२५)</text>
                <text x={340} y={194} fill="#FFFFFF" fontSize="11" fontWeight="bold">TT ⟹ P = १/४ (०.२५)</text>
              </svg>
            </div>

            <p className="text-xs text-slate-600 font-sans">
              {L(
                'वृक्ष चित्रले क्रमिक रूपमा हुने परीक्षणका सबै सम्भावित शाखाहरू र तिनीहरूको संयुक्त सम्भाव्यता देखाउँछ। सबै शाखाहरूको कुल योगफल सधैँ १ (१/४ + १/४ + १/४ + १/४ = १) हुन्छ।',
                'The tree diagram visualizes all sequential outcome branches. The sum of all branch probabilities always equals 1.'
              )}
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 5: EMPIRICAL TRIALS (EXPERIMENTAL VS THEORETICAL)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'trials' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm text-[#142D4E]">
                {L('प्रयोगात्मक र सैद्धान्तिक सम्भाव्यता तुलना (Empirical vs. Theoretical)', 'Empirical vs. Theoretical')}
              </h4>
              <div className="flex gap-2">
                {[10, 50, 100, 500].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleRunTrials(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                      numTrials === t && hasRunSim ? 'bg-[#167C80] text-white' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    {fmt(t)} {L('पटक', 'trials')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 font-sans block">
                  सैद्धान्तिक सम्भाव्यता (Theoretical)
                </span>
                <div className="text-2xl font-black text-[#142D4E]">P(H) = ०.५०० (५०%)</div>
                <div className="text-xs text-slate-500 font-sans">गणितीय सूत्र n(H)/n(S) अनुसार ठिक १/२</div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 font-sans block">
                  प्रयोगात्मक सम्भाव्यता (Empirical: {fmt(numTrials)} परीक्षण)
                </span>
                <div className="text-2xl font-black text-amber-800">
                  {fmt((headsCount / numTrials).toFixed(3))} ({fmt(((headsCount / numTrials) * 100).toFixed(1))}%)
                </div>
                <div className="text-xs text-slate-500 font-sans">
                  {fmt(headsCount)} पटक H आयो (परीक्षण संख्या बढ्दा सैद्धान्तिक ०.५ को नजिक पुग्छ)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 6: PRACTICE CHALLENGE
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'challenge' && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#167C80]">
                {L(`प्रश्न ${fmt(quizIdx + 1)} / ${fmt(quizQuestions.length)}`, `Question ${fmt(quizIdx + 1)} of ${fmt(quizQuestions.length)}`)}
              </span>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                {L(`प्राप्ताङ्क: ${fmt(score)}`, `Score: ${fmt(score)}`)}
              </span>
            </div>

            <h3 className="text-base font-bold text-[#142D4E] mb-4">
              {isNe ? quizQuestions[quizIdx].qNp : quizQuestions[quizIdx].qEn}
            </h3>

            <div className="space-y-2.5 mb-5">
              {(isNe && quizQuestions[quizIdx].optionsNp ? quizQuestions[quizIdx].optionsNp : quizQuestions[quizIdx].options).map(
                (opt, oIdx) => {
                  const isSelected = selectedAns === oIdx;
                  const isCorrect = oIdx === quizQuestions[quizIdx].correct;
                  let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100';

                  if (selectedAns !== null) {
                    if (isSelected && isCorrect) btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold';
                    else if (isSelected && !isCorrect) btnStyle = 'bg-rose-100 border-rose-400 text-rose-900 font-bold';
                    else if (isCorrect) btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800';
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectAnswer(oIdx)}
                      disabled={selectedAns !== null}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                }
              )}
            </div>

            {quizFeedback && (
              <div
                className={`p-3.5 rounded-xl mb-4 text-xs ${
                  selectedAns === quizQuestions[quizIdx].correct
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                <div className="font-bold mb-1">{quizFeedback}</div>
                <div>{isNe ? quizQuestions[quizIdx].hintNp : quizQuestions[quizIdx].hintEn}</div>
              </div>
            )}

            {selectedAns !== null && (
              <div className="flex justify-end">
                <button
                  onClick={handleNextQuiz}
                  className="px-5 py-2.5 bg-[#142D4E] text-white rounded-xl text-xs sm:text-sm font-bold shadow hover:bg-slate-800 transition-all"
                >
                  {L('अर्को प्रश्न →', 'Next Question →')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default ProbabilityTreeLab;

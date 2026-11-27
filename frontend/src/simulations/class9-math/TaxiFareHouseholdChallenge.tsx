import React, { useState } from 'react';
import { SimFrame2D } from '../class-math-2d-kit/SimFrame2D';
import { useSimKit } from '../class1-math-kit/SimKit';
import { toNp, FONT_NP } from '../class1-math-kit/nepali';

interface BillComponent {
  nameNp: string;
  nameEn: string;
  icon: string;
  amount: number;
  color: string;
}

const QUIZ_QUESTIONS = [
  {
    np: 'नेपालमा ट्याक्सी मिटरको पहिलो २०० मिटरको सुरुवाती न्यूनतम भाडा (Flag drop) कति तोकिएको छ?',
    en: 'In Nepal taxi meter regulation, what is the initial minimum flag-drop fare for the first 200 meters?',
    options: [
      { key: 'A', label: 'रु. १०' },
      { key: 'B', label: 'रु. १४' },
      { key: 'C', label: 'रु. २५' },
      { key: 'D', label: 'रु. ५०' },
    ],
    answer: 'B',
  },
  {
    np: 'यदि प्रति २०० मिटरको भाडा रु. ७.२० हुन्छ भने १ किलोमिटर (१,००० मिटर) यात्रा गर्दा कति भाडा लाग्छ?',
    en: 'If the rate is Rs 7.20 per 200 meters, what is the distance charge for 1 kilometer (1,000 meters)?',
    options: [
      { key: 'A', label: 'रु. १४.४०' },
      { key: 'B', label: 'रु. २८.८०' },
      { key: 'C', label: 'रु. ३६.००' },
      { key: 'D', label: 'रु. ७२.००' },
    ],
    answer: 'C',
  },
  {
    np: 'राति ९ बजेदेखि बिहान ६ बजेसम्म ट्याक्सी चढ्दा सामान्य मिटर भाडामा कति प्रतिशत थप दस्तुर लाग्दछ?',
    en: 'What percentage surcharge is added for night taxi travel between 9 PM and 6 AM?',
    options: [
      { key: 'A', label: '१०%' },
      { key: 'B', label: '२५%' },
      { key: 'C', label: '५०%' },
      { key: 'D', label: '१००%' },
    ],
    answer: 'C',
  },
  {
    np: 'एउटा परिवारको १ महिनाको बिजुली रु. १,२००, पानी रु. ६००, टेलिफोन रु. ५०० र ट्याक्सी भाडा रु. ७०० खर्च भयो भने कुल घरायसी उपयोगिता खर्च कति हुन्छ?',
    en: 'A family spends Rs 1,200 on electricity, Rs 600 on water, Rs 500 on phone, and Rs 700 on taxi. What is their total monthly utility expenditure?',
    options: [
      { key: 'A', label: 'रु. २,५००' },
      { key: 'B', label: 'रु. २,८००' },
      { key: 'C', label: 'रु. ३,०००' },
      { key: 'D', label: 'रु. ३,२००' },
    ],
    answer: 'C',
  },
];

export const TaxiFareHouseholdChallenge: React.FC<{
  onBackToLibrary?: () => void;
  onBack?: () => void;
}> = ({ onBackToLibrary, onBack }) => {
  const kit = useSimKit({
    code: 'SIM-MATH-G9-U4-03',
    chapter: 4,
    titleNp: 'ट्याक्सी भाडा तथा घरायसी खर्च हिसाब',
    titleEn: 'Taxi Fare and Household Expense Challenge',
  });

  const isNe = kit.lang === 'ne';
  const L = (np: string, en: string) => (isNe ? np : en);
  const handleBack = onBackToLibrary || onBack || (() => window.history.back());

  const [activeTab, setActiveTab] = useState<'taxi' | 'household' | 'challenge'>('taxi');

  // --- Taxi Simulator State ---
  const [distanceKm, setDistanceKm] = useState<number>(5.4); // in km
  const [waitingMinutes, setWaitingMinutes] = useState<number>(10);
  const [isNightTime, setIsNightTime] = useState<boolean>(false);

  // Textbook Rates:
  // First 200 meters (0.2 km): Rs 14 (Flag drop)
  // Each additional 200 meters: Rs 7.20 (=> Rs 36 per km)
  // Waiting charge: Rs 7.20 per 2 minutes (=> Rs 3.60 per minute)
  // Night surcharge: 50% extra on total
  const flagDropDistanceKm = 0.2;
  const flagDropFare = 14;
  const ratePerKm = 36; // Rs 7.20 per 200m = Rs 36/km
  const waitingRatePerMin = 3.6; // Rs 7.20 per 2 min

  const extraDistanceKm = Math.max(0, distanceKm - flagDropDistanceKm);
  const distanceFare = flagDropFare + Math.round(extraDistanceKm * ratePerKm * 10) / 10;
  const waitingFare = Math.round(waitingMinutes * waitingRatePerMin * 10) / 10;
  const regularTaxiTotal = Math.round((distanceFare + waitingFare) * 10) / 10;
  const nightSurcharge = isNightTime ? Math.round(regularTaxiTotal * 0.5 * 10) / 10 : 0;
  const finalTaxiFare = Math.round((regularTaxiTotal + nightSurcharge) * 10) / 10;

  // --- Household Budget State ---
  const [electricityBill, setElectricityBill] = useState<number>(1450);
  const [waterBill, setWaterBill] = useState<number>(680);
  const [phoneInternetBill, setPhoneInternetBill] = useState<number>(1250);
  const [transportBill, setTransportBill] = useState<number>(1800);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(45000);

  const totalHouseholdExpense = electricityBill + waterBill + phoneInternetBill + transportBill;
  const savings = Math.max(0, monthlyIncome - totalHouseholdExpense);
  const expenseRatio = monthlyIncome > 0 ? Math.round((totalHouseholdExpense / monthlyIncome) * 100) : 0;

  const budgetItems: BillComponent[] = [
    { nameNp: 'विद्युत महसुल', nameEn: 'Electricity', icon: '⚡', amount: electricityBill, color: 'bg-amber-500' },
    { nameNp: 'खानेपानी महसुल', nameEn: 'Water & Sewerage', icon: '💧', amount: waterBill, color: 'bg-blue-500' },
    { nameNp: 'फोन र इन्टरनेट', nameEn: 'Phone & Internet', icon: '📶', amount: phoneInternetBill, color: 'bg-teal-500' },
    { nameNp: 'यातायात तथा ट्याक्सी', nameEn: 'Transport & Taxi', icon: '🚕', amount: transportBill, color: 'bg-yellow-500' },
  ];

  // --- Challenge Problem State ---
  const [challengeIdx, setChallengeIdx] = useState<number>(0);
  const [userGuess, setUserGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const challenges = [
    {
      titleNp: 'समस्या १: ट्याक्सी भाडा हिसाब',
      titleEn: 'Problem 1: Taxi Fare Calculation',
      descNp: 'एक व्यक्तिले दिउँसो ३.२ किलोमिटर ट्याक्सी यात्रा गरे र बाटोमा ४ मिनेट पर्खाइ भयो। (पहिलो २०० मिटरको रु. १४, त्यसपछि प्रति २०० मिटर रु. ७.२० र २ मिनेट पर्खाइको रु. ७.२०)। कुल भाडा कति हुन्छ?',
      descEn: 'A passenger travels 3.2 km during daytime with 4 mins waiting time. First 200m is Rs 14, then Rs 7.20 per 200m, and Rs 7.20 per 2 mins waiting. Calculate total fare.',
      // 0.2km = 14; remaining 3.0km = 15 x 7.20 = 108. Waiting 4 mins = 2 x 7.20 = 14.40. Total = 14 + 108 + 14.4 = 136.4 => round to 136 or 136.4
      correctAnswer: 136.4,
      stepsNp: 'पहिलो २०० मिटर = रु. १४। बाँकी ३००० मिटर (१५ वटा २०० मिटर) = १५ × ७.२० = रु. १०८। पर्खाइ (४ मिनेट = २ पटक) = २ × ७.२० = रु. १४.४०। जम्मा = १४ + १०८ + १४.४० = रु. १३६.४०।',
      stepsEn: 'First 200m = Rs 14. Remaining 3000m (15 × 200m) = 15 × 7.20 = Rs 108. Waiting (4 mins = 2 intervals) = 2 × 7.20 = Rs 14.40. Total = 14 + 108 + 14.40 = Rs 136.40.',
    },
    {
      titleNp: 'समस्या २: रात्रिकालीन ट्याक्सी भाडा',
      titleEn: 'Problem 2: Night Taxi Fare',
      descNp: 'राति १०:३० बजे त्रिभुवन विमानस्थलबाट ५.२ किलोमिटर ट्याक्सी चढ्दा मिटर भाडा रु. १९४ आयो। रात्रिकालीन ५०% थप दस्तुर जोड्दा यात्रुले कति भाडा तिर्नुपर्छ?',
      descEn: 'At 10:30 PM, the meter shows Rs 194 for a 5.2 km trip. Adding the 50% night surcharge, how much must the passenger pay?',
      // 194 + 50% of 194 = 194 + 97 = 291
      correctAnswer: 291,
      stepsNp: 'मिटर भाडा = रु. १९४। रात्रिकालीन ५०% थप दस्तुर = रु. १९४ × ०.५० = रु. ९७। कुल भाडा = १९४ + ९७ = रु. २९१।',
      stepsEn: 'Meter fare = Rs 194. 50% Night surcharge = Rs 194 × 0.50 = Rs 97. Total payable = 194 + 97 = Rs 291.',
    },
    {
      titleNp: 'समस्या ३: कुल घरायसी उपयोगिता खर्च',
      titleEn: 'Problem 3: Total Household Utility',
      descNp: 'शर्मा परिवारको बैशाख महिनामा विद्युत बिल रु. १,४००, पानी बिल रु. ५५० र टेलिफोन बिल रु. १,०५० आयो। ती तिनवटै उपयोगिताको कुल खर्च कति भयो?',
      descEn: 'The Sharma family received an electricity bill of Rs 1,400, water bill of Rs 550, and phone bill of Rs 1,050. What is their total utility bill for the month?',
      // 1400 + 550 + 1050 = 3000
      correctAnswer: 3000,
      stepsNp: 'कुल उपयोगिता खर्च = रु. १,४०० + रु. ५५० + रु. १,०५० = रु. ३,०००।',
      stepsEn: 'Total Utility Expenditure = Rs 1,400 + Rs 550 + Rs 1,050 = Rs 3,000.',
    },
  ];

  const currChallenge = challenges[challengeIdx];

  const handleCheckAnswer = () => {
    const val = parseFloat(userGuess.trim());
    if (isNaN(val)) return;

    if (Math.abs(val - currChallenge.correctAnswer) < 1) {
      kit.good();
      setFeedback('correct');
    } else {
      kit.oops();
      setFeedback('incorrect');
    }
  };

  return (
    <SimFrame2D
      kit={kit}
      onBack={handleBack}
      grade={9}
      questions={QUIZ_QUESTIONS}
      mascotGreeting={L(
        'ट्याक्सी भाडा तथा घरायसी बजेट हिसाबमा स्वागत छ! मिटर भाडा, रात्रिकालीन थप दस्तुर र मासिक उपयोगिता बजेट हिसाब सिकौं।',
        'Welcome to Taxi Fare and Household Expense Challenge! Learn meter fares, night surcharges, and utility budgets.'
      )}
    >
      <div className="space-y-6" style={{ fontFamily: isNe ? FONT_NP : 'inherit' }}>
        {/* Navigation Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl max-w-2xl mx-auto shadow-inner">
          <button
            onClick={() => setActiveTab('taxi')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'taxi'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>🚕</span>
            <span>{L('ट्याक्सी मिटर हिसाब', 'Taxi Meter Sim')}</span>
          </button>
          <button
            onClick={() => setActiveTab('household')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'household'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>📊</span>
            <span>{L('घरायसी बजेट विश्लेषण', 'Household Budget')}</span>
          </button>
          <button
            onClick={() => setActiveTab('challenge')}
            className={`flex-1 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'challenge'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <span>🎯</span>
            <span>{L('अभ्यास चुनौती', 'Practice Challenges')}</span>
          </button>
        </div>

        {activeTab === 'taxi' && (
          /* =========================================================================
             TAXI METER SIMULATOR
             ========================================================================= */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/30 p-5 rounded-2xl border border-amber-200 dark:border-amber-800">
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
                <span>🚕</span>
                <span>{L('ट्याक्सी मिटर प्रणाली (यातायात व्यवस्था विभाग नियम)', 'Taxi Meter Billing System')}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'ट्याक्सी मिटर सुरु गर्दा पहिलो २०० मिटरको न्यूनतम भाडा रु. १४ खस्दछ। त्यसपछिको प्रत्येक २०० मिटरमा रु. ७.२० (वा १ किमीमा रु. ३६) थप हुन्छ। रोकिराखेको अवस्थामा प्रति २ मिनेटको रु. ७.२० पर्खाइ शुल्क लाग्छ भने राति ९:०० बजेदेखि बिहान ६:०० बजेसम्म ५०% थप भाडा लाग्छ।',
                  'Flag drop initial fare is Rs 14 for the first 200m. Every additional 200m costs Rs 7.20 (Rs 36/km). Waiting fee is Rs 7.20 per 2 mins. A 50% surcharge applies between 9 PM and 6 AM.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls */}
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-5">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
                  {L('यात्रा विवरण', 'Journey Parameters')}
                </h3>

                {/* Distance Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {L('यात्रा गरेको दूरी (Distance):', 'Travel Distance (km):')}
                    </label>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {isNe ? toNp(distanceKm.toFixed(1)) : distanceKm.toFixed(1)} {L('कि.मी.', 'km')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="25"
                    step="0.2"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {L(`कुल मिटर: ${toNp(Math.round(distanceKm * 1000))} मिटर`, `Total: ${Math.round(distanceKm * 1000)} meters`)}
                  </div>
                </div>

                {/* Waiting Minutes */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {L('पर्खाइ समय (Waiting Time):', 'Waiting Time (Minutes):')}
                    </label>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {isNe ? toNp(waitingMinutes) : waitingMinutes} {L('मिनेट', 'mins')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="2"
                    value={waitingMinutes}
                    onChange={(e) => setWaitingMinutes(parseInt(e.target.value) || 0)}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {L(`प्रति २ मिनेट = रु. ७.२० (रु. ३.६०/मिनेट)`, `Rs 7.20 per 2 mins (Rs 3.60/min)`)}
                  </div>
                </div>

                {/* Night Travel Switch */}
                <div className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div>
                    <div className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <span>🌙</span>
                      <span>{L('रात्रिकालीन यात्रा (Night Tariff)', 'Night Travel (9 PM - 6 AM)')}</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {L('सामान्य भाडामा ५०% थप दस्तुर', 'Adds 50% surcharge to total fare')}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isNightTime}
                    onChange={(e) => setIsNightTime(e.target.checked)}
                    className="w-6 h-6 text-amber-600 rounded cursor-pointer"
                  />
                </div>

                {/* Rate Card Summary */}
                <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="font-bold">{L('पाठ्यपुस्तक दर तालिका:', 'Textbook Rate Standard:')}</div>
                  <div>• {L('पहिलो २०० मिटर = न्यूनतम रु. १४', 'First 200m = Rs 14')}</div>
                  <div>• {L('प्रति २०० मिटर = रु. ७.२० (रु. ३६/किमी)', 'Each 200m = Rs 7.20 (Rs 36/km)')}</div>
                  <div>• {L('पर्खाइ प्रति २ मिनेट = रु. ७.२०', 'Waiting per 2 mins = Rs 7.20')}</div>
                </div>
              </div>

              {/* Digital Meter & Receipt Visual */}
              <div className="lg:col-span-7 space-y-4">
                {/* Physical Meter UI Component */}
                <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-2xl border-4 border-gray-700 relative overflow-hidden">
                  <div className="absolute top-2 right-4 text-xs tracking-widest text-gray-500 font-mono">
                    DOTM TAXI-METER 2.0
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        {isNightTime ? L('रात्रिकालीन दर (NIGHT RATE 1.5x)', 'NIGHT RATE 1.5X') : L('दिउँसोको दर (DAY RATE 1.0x)', 'DAY RATE 1.0X')}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-gray-400">
                      HIRED / यात्रु सवार
                    </div>
                  </div>

                  {/* Main LED Display */}
                  <div className="bg-black/90 p-4 rounded-2xl border border-amber-500/40 text-center mb-4">
                    <div className="text-xs font-mono text-gray-400 mb-1">
                      {L('कुल भाडा रकम (FARE PAYABLE)', 'FARE PAYABLE')}
                    </div>
                    <div className="text-4xl sm:text-5xl font-black font-mono tracking-wider text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                      रु. {isNe ? toNp(finalTaxiFare.toFixed(1)) : finalTaxiFare.toFixed(1)}
                    </div>
                  </div>

                  {/* Meter Sub-Displays */}
                  <div className="grid grid-cols-2 gap-3 font-mono text-center">
                    <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700">
                      <div className="text-[11px] text-gray-400">{L('दूरी (KM)', 'DISTANCE (KM)')}</div>
                      <div className="text-xl font-bold text-green-400">
                        {isNe ? toNp(distanceKm.toFixed(1)) : distanceKm.toFixed(1)} km
                      </div>
                    </div>
                    <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700">
                      <div className="text-[11px] text-gray-400">{L('पर्खाइ (MIN)', 'WAITING (MIN)')}</div>
                      <div className="text-xl font-bold text-blue-400">
                        {isNe ? toNp(waitingMinutes) : waitingMinutes} min
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculation Receipt */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-3 text-sm">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 border-b pb-2">
                    {L('भाडा हिसाबको चरणबद्ध विवरण (Fare Breakdown)', 'Step-by-Step Fare Breakdown')}
                  </h4>

                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {L('१. सुरुको न्यूनतम भाडा (पहिलो २०० मिटर):', '1. Initial Flag Drop (First 200m):')}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-100">
                      रु. {isNe ? toNp(flagDropFare) : flagDropFare}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {L(`२. बाँकी दूरीको भाडा (${extraDistanceKm.toFixed(1)} किमी):`, `2. Additional Distance Fare (${extraDistanceKm.toFixed(1)} km):`)}
                      </span>
                      <div className="text-xs text-gray-500">
                        {extraDistanceKm > 0
                          ? L(`${toNp(extraDistanceKm.toFixed(1))} किमी × रु. ३६/किमी`, `${extraDistanceKm.toFixed(1)} km × Rs 36/km`)
                          : L('न्यूनतम दूरी भित्र', 'Covered by flag drop')}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-100">
                      रु. {isNe ? toNp(Math.round(extraDistanceKm * ratePerKm * 10) / 10) : (Math.round(extraDistanceKm * ratePerKm * 10) / 10).toFixed(1)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {L(`३. पर्खाइ शुल्क (${waitingMinutes} मिनेट):`, `3. Waiting Time Fare (${waitingMinutes} mins):`)}
                      </span>
                      <div className="text-xs text-gray-500">
                        {waitingMinutes > 0
                          ? L(`${toNp(waitingMinutes)} मिनेट × रु. ३.६०/मिनेट`, `${waitingMinutes} min × Rs 3.60/min`)
                          : L('पर्खाइ नभएको', 'No waiting time')}
                      </div>
                    </div>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-100">
                      रु. {isNe ? toNp(waitingFare) : waitingFare.toFixed(1)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 bg-gray-50 dark:bg-gray-700/50 px-3 rounded-lg font-semibold text-gray-800 dark:text-gray-200">
                    <span>{L('सामान्य दर उप-जम्मा (Regular Total):', 'Regular Subtotal:')}</span>
                    <span className="font-mono font-bold">
                      रु. {isNe ? toNp(regularTaxiTotal) : regularTaxiTotal.toFixed(1)}
                    </span>
                  </div>

                  {isNightTime && (
                    <div className="flex justify-between py-1 text-red-600 dark:text-red-400 border-b border-gray-100 dark:border-gray-700 font-semibold">
                      <span>{L('४. रात्रिकालीन ५०% थप दस्तुर:', '4. Night Surcharge (50%):')}</span>
                      <span className="font-mono">
                        + रु. {isNe ? toNp(nightSurcharge) : nightSurcharge.toFixed(1)}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 flex justify-between items-center text-base font-black text-amber-700 dark:text-amber-400">
                    <span>{L('तिर्नुपर्ने कुल भाडा:', 'Total Fare to Pay:')}</span>
                    <span className="text-xl font-mono">
                      रु. {isNe ? toNp(finalTaxiFare) : finalTaxiFare.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'household' && (
          /* =========================================================================
             HOUSEHOLD BUDGET & UTILITY EXPENSES
             ========================================================================= */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 p-5 rounded-2xl border border-blue-200 dark:border-blue-800">
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-2">
                <span>🏠</span>
                <span>{L('मासिक घरायसी उपयोगिता बजेट विश्लेषण', 'Monthly Household Utility Budget Analysis')}</span>
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {L(
                  'परिवारको मासिक आम्दानीबाट विद्युत, खानेपानी, टेलिफोन/इन्टरनेट र यातायातका विभिन्न महसुल तिरेपछि बचेको रकम बचत हुन्छ। उपयोगिता खर्च र बचतको अनुपात विश्लेषण गर्नुहोस्।',
                  'Compare monthly utility bills (electricity, water, telephone/internet, transport) against household income to evaluate monthly savings and financial health.'
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Inputs */}
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg border-b pb-2">
                  {L('मासिक आम्दानी र महसुल रकमहरू', 'Monthly Income & Utility Bills')}
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    {L('मासिक कुल आम्दानी (Monthly Household Income):', 'Monthly Household Income (Rs):')}
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2 rounded-lg border border-green-500 font-mono text-base font-bold dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      ⚡ {L('विद्युत महसुल (Electricity Bill):', 'Electricity Bill (Rs):')}
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={electricityBill}
                      onChange={(e) => setElectricityBill(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 font-mono dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      💧 {L('खानेपानी तथा ढल महसुल (Water Bill):', 'Water & Sewerage Bill (Rs):')}
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={waterBill}
                      onChange={(e) => setWaterBill(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 font-mono dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      📶 {L('टेलिफोन तथा इन्टरनेट (Phone & Net):', 'Phone & Internet Bill (Rs):')}
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={phoneInternetBill}
                      onChange={(e) => setPhoneInternetBill(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 font-mono dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      🚕 {L('ट्याक्सी तथा यातायात भाडा (Transport & Taxi):', 'Transport & Taxi (Rs):')}
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={transportBill}
                      onChange={(e) => setTransportBill(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 font-mono dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Visual Breakdown & Budget Health */}
              <div className="lg:col-span-7 space-y-4">
                {/* Visual Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {budgetItems.map((item) => (
                    <div key={item.nameEn} className="bg-white dark:bg-gray-800 p-3.5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 text-center">
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-xs text-gray-500 font-medium">{isNe ? item.nameNp : item.nameEn}</div>
                      <div className="text-base font-black text-gray-800 dark:text-gray-100 mt-1 font-mono">
                        रु. {isNe ? toNp(item.amount) : item.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Bar Stack */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 space-y-4">
                  <h4 className="font-bold text-gray-800 dark:text-gray-100">
                    {L('खर्चको अनुपात बार (Expenditure Proportion)', 'Expense Distribution Bar')}
                  </h4>

                  <div className="h-6 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex shadow-inner">
                    {budgetItems.map((item) => {
                      const pct = totalHouseholdExpense > 0 ? (item.amount / totalHouseholdExpense) * 100 : 0;
                      return (
                        <div
                          key={item.nameEn}
                          style={{ width: `${pct}%` }}
                          title={`${isNe ? item.nameNp : item.nameEn}: ${pct.toFixed(1)}%`}
                          className={`${item.color} h-full transition-all duration-300`}
                        />
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {budgetItems.map((item) => {
                      const pct = totalHouseholdExpense > 0 ? Math.round((item.amount / totalHouseholdExpense) * 100) : 0;
                      return (
                        <div key={item.nameEn} className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${item.color}`} />
                          <span className="text-gray-600 dark:text-gray-400">
                            {isNe ? item.nameNp : item.nameEn} ({isNe ? toNp(pct) : pct}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Overview */}
                  <div className="pt-4 border-t space-y-2 text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 dark:text-gray-400">{L('जम्मा घरायसी उपयोगिता खर्च:', 'Total Utility Expenses:')}</span>
                      <span className="font-black text-red-600 dark:text-red-400 font-mono text-base">
                        रु. {isNe ? toNp(totalHouseholdExpense) : totalHouseholdExpense.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 dark:text-gray-400">{L('मासिक आम्दानीको कति प्रतिशत खर्च भयो:', 'Expenditure of Income Ratio:')}</span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 font-mono">
                        {isNe ? toNp(expenseRatio) : expenseRatio}%
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-gray-600 dark:text-gray-400">{L('मासिक बचत रकम (Monthly Savings):', 'Estimated Monthly Savings:')}</span>
                      <span className="font-black text-green-600 dark:text-green-400 font-mono text-base">
                        रु. {isNe ? toNp(savings) : savings.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenge' && (
          /* =========================================================================
             PRACTICE CHALLENGES
             ========================================================================= */
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Challenge selector */}
            <div className="flex gap-2 justify-center">
              {challenges.map((c, i) => (
                <button
                  key={c.titleEn}
                  onClick={() => {
                    setChallengeIdx(i);
                    setUserGuess('');
                    setFeedback(null);
                  }}
                  className={`py-2 px-4 rounded-xl text-sm font-bold border transition-all ${
                    challengeIdx === i
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isNe ? toNp(i + 1) : i + 1}
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-purple-200 dark:border-purple-800 space-y-5">
              <div className="border-b pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  {L('अभ्यास समस्या', 'Practice Challenge')}
                </span>
                <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 mt-1">
                  {isNe ? currChallenge.titleNp : currChallenge.titleEn}
                </h3>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl text-gray-800 dark:text-gray-200 text-base leading-relaxed border border-purple-200 dark:border-purple-800">
                {isNe ? currChallenge.descNp : currChallenge.descEn}
              </div>

              {/* Answer input form */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {L('तपाईंको उत्तर (रु. मा):', 'Your Answer (in Rs):')}
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    step="any"
                    value={userGuess}
                    onChange={(e) => {
                      setUserGuess(e.target.value);
                      setFeedback(null);
                    }}
                    placeholder={L('उत्तर लेख्नुहोस्...', 'Enter amount...')}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 font-mono text-lg font-bold dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button
                    onClick={handleCheckAnswer}
                    disabled={!userGuess.trim()}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow disabled:opacity-50 transition-all"
                  >
                    {L('जाँच गर्नुहोस्', 'Check Answer')}
                  </button>
                </div>
              </div>

              {/* Feedback Alert */}
              {feedback === 'correct' && (
                <div className="p-4 bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-800 rounded-xl text-green-900 dark:text-green-200 space-y-2">
                  <div className="font-black flex items-center gap-2 text-base">
                    <span>🎉</span>
                    <span>{L('उत्कृष्ट! सही उत्तर।', 'Excellent! Correct Answer.')}</span>
                  </div>
                  <div className="text-sm">
                    <strong>{L('चरणबद्ध समाधान:', 'Step-by-Step Solution:')}</strong> {isNe ? currChallenge.stepsNp : currChallenge.stepsEn}
                  </div>
                </div>
              )}

              {feedback === 'incorrect' && (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-xl text-red-900 dark:text-red-200 space-y-2">
                  <div className="font-black flex items-center gap-2 text-base">
                    <span>❌</span>
                    <span>{L('उत्तर मिलेन। पुनः प्रयास गर्नुहोस्।', 'Incorrect. Try again!')}</span>
                  </div>
                  <div className="text-xs">
                    {L('सुझाव: दिइएको दर तालिका र पर्खाइ वा थप दस्तुरलाई ध्यान दिएर पुनः गणना गर्नुहोस्।', 'Hint: Review the rate table, waiting time, and any night surcharge.')}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SimFrame2D>
  );
};

export default TaxiFareHouseholdChallenge;

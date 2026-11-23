import React, { lazy, Suspense } from 'react';

const L = (fn: () => Promise<any>, exportName?: string) => {
  const Comp = lazy(async () => {
    const mod = await fn();
    return { default: exportName ? mod[exportName] : mod.default };
  });
  return (props: any) => (
    <Suspense
      fallback={
        <div style={{ padding: 40, textAlign: 'center', color: '#187C68', fontWeight: 800 }}>
          लोड हुँदैछ... (Loading Grade 9 simulation...)
        </div>
      }
    >
      <Comp {...props} />
    </Suspense>
  );
};

export const CLASS9_MATH = [
  // ── UNIT 1: SETS (समूह) ──────────────────────────────────────────────────
  {
    code: 'SIM-MATH-G9-U1-01',
    key: 'class9-math-u1-set-explorer-venn-lab',
    lesson: 1,
    unit: 1,
    grade: 9,
    titleEn: 'Set Explorer and Venn Diagram Laboratory',
    titleNp: 'समूह अन्वेषक र भेन चित्र प्रयोगशाला',
    Component: L(() => import('./SetExplorerVennLab'), 'SetExplorerVennLab'),
  },
  {
    code: 'SIM-MATH-G9-U1-02',
    key: 'class9-math-u1-set-operations-challenge',
    lesson: 1,
    unit: 1,
    grade: 9,
    titleEn: 'Set Operations Challenge',
    titleNp: 'समूहका क्रियाहरू र छायाङ्कन चुनौती',
    Component: L(() => import('./SetOperationsChallenge'), 'SetOperationsChallenge'),
  },
  {
    code: 'SIM-MATH-G9-U1-03',
    key: 'class9-math-u1-cardinality-problem-solver',
    lesson: 1,
    unit: 1,
    grade: 9,
    titleEn: 'Cardinality and Venn Diagram Problem Solver',
    titleNp: 'समूहको गणनात्मकता र समस्या समाधानकर्ता',
    Component: L(() => import('./CardinalityVennProblemSolver'), 'CardinalityVennProblemSolver'),
  },

  // ── UNIT 2: TAX (कर) ──────────────────────────────────────────────────────
  {
    code: 'SIM-MATH-G9-U2-01',
    key: 'class9-math-u2-income-tax-slab-explorer',
    lesson: 2,
    unit: 2,
    grade: 9,
    titleEn: 'Income Tax Calculator and Tax Slab Explorer',
    titleNp: 'आयकर क्याल्कुलेटर र कर स्ल्याब अन्वेषक',
    Component: L(() => import('./IncomeTaxSlabExplorer'), 'IncomeTaxSlabExplorer'),
  },
  {
    code: 'SIM-MATH-G9-U2-02',
    key: 'class9-math-u2-vat-discount-price-lab',
    lesson: 2,
    unit: 2,
    grade: 9,
    titleEn: 'VAT, Discount and Selling Price Laboratory',
    titleNp: 'भ्याट, छुट र मूल्य निर्धारण प्रयोगशाला',
    Component: L(() => import('./VatDiscountSellingPriceLab'), 'VatDiscountSellingPriceLab'),
  },
  {
    code: 'SIM-MATH-G9-U2-03',
    key: 'class9-math-u2-tax-problem-challenge',
    lesson: 2,
    unit: 2,
    grade: 9,
    titleEn: 'Tax Problem Solving Challenge',
    titleNp: 'कर तथा भ्याट समस्या समाधान चुनौती',
    Component: L(() => import('./TaxProblemSolvingChallenge'), 'TaxProblemSolvingChallenge'),
  },

  // ── UNIT 3: COMMISSION AND DIVIDEND (कमिशन र लाभांश) ─────────────────────
  {
    code: 'SIM-MATH-G9-U3-01',
    key: 'class9-math-u3-commission-agent-simulator',
    lesson: 3,
    unit: 3,
    grade: 9,
    titleEn: 'Commission and Sales Agent Simulator',
    titleNp: 'कमिशन र बिक्री प्रतिनिधि सिमुलेटर',
    Component: L(() => import('./CommissionSalesAgentSimulator'), 'CommissionSalesAgentSimulator'),
  },
  {
    code: 'SIM-MATH-G9-U3-02',
    key: 'class9-math-u3-profit-bonus-distribution',
    lesson: 3,
    unit: 3,
    grade: 9,
    titleEn: 'Company Profit and Bonus Distribution',
    titleNp: 'कम्पनीको नाफा र बोनस वितरण प्रयोगशाला',
    Component: L(() => import('./CompanyProfitBonusDistribution'), 'CompanyProfitBonusDistribution'),
  },
  {
    code: 'SIM-MATH-G9-U3-03',
    key: 'class9-math-u3-dividend-shareholder-simulator',
    lesson: 3,
    unit: 3,
    grade: 9,
    titleEn: 'Dividend and Shareholder Simulator',
    titleNp: 'लाभांश तथा शेयरधनी नाफा सिमुलेटर',
    Component: L(() => import('./DividendShareholderSimulator'), 'DividendShareholderSimulator'),
  },

  // ── UNIT 4: HOUSEHOLD ARITHMETIC (घरायसी अङ्कगणित) ────────────────────────
  {
    code: 'SIM-MATH-G9-U4-01',
    key: 'class9-math-u4-electricity-bill-calculator',
    lesson: 4,
    unit: 4,
    grade: 9,
    titleEn: 'Electricity Bill Calculator (NEA Tariff)',
    titleNp: 'विद्युत महसुल क्याल्कुलेटर (NEA महसुल दर)',
    Component: L(() => import('./ElectricityBillCalculator'), 'ElectricityBillCalculator'),
  },
  {
    code: 'SIM-MATH-G9-U4-02',
    key: 'class9-math-u4-water-telephone-bill-calculator',
    lesson: 4,
    unit: 4,
    grade: 9,
    titleEn: 'Water and Telephone Bill Calculator',
    titleNp: 'खानेपानी तथा टेलिफोन महसुल क्याल्कुलेटर',
    Component: L(() => import('./WaterTelephoneBillCalculator'), 'WaterTelephoneBillCalculator'),
  },
  {
    code: 'SIM-MATH-G9-U4-03',
    key: 'class9-math-u4-taxi-household-challenge',
    lesson: 4,
    unit: 4,
    grade: 9,
    titleEn: 'Taxi Fare and Household Expense Challenge',
    titleNp: 'ट्याक्सी भाडा तथा घरायसी खर्च हिसाब',
    Component: L(() => import('./TaxiFareHouseholdChallenge'), 'TaxiFareHouseholdChallenge'),
  },

  // ── UNIT 5: AREA (क्षेत्रफल) ──────────────────────────────────────────────
  {
    code: 'SIM-MATH-G9-U5-01',
    key: 'class9-math-u5-herons-formula-land-explorer',
    lesson: 5,
    unit: 5,
    grade: 9,
    titleEn: "Heron's Formula and Land Area Explorer",
    titleNp: 'हिरोनको सूत्र तथा जग्गा क्षेत्रफल अन्वेषक',
    Component: L(() => import('./HeronsFormulaLandExplorer'), 'HeronsFormulaLandExplorer'),
  },
  {
    code: 'SIM-MATH-G9-U5-02',
    key: 'class9-math-u5-room-area-painting-cost',
    lesson: 5,
    unit: 5,
    grade: 9,
    titleEn: 'Room Area and Painting Cost Simulator',
    titleNp: 'कोठाको क्षेत्रफल तथा रङरोगन खर्च सिमुलेटर',
    Component: L(() => import('./RoomAreaPaintingCostSimulator'), 'RoomAreaPaintingCostSimulator'),
  },
  {
    code: 'SIM-MATH-G9-U5-03',
    key: 'class9-math-u5-nepal-land-area-converter',
    lesson: 5,
    unit: 5,
    grade: 9,
    titleEn: 'Nepal Land Measurement and Area Converter',
    titleNp: 'नेपाल जग्गा नाप तथा क्षेत्रफल रूपान्तरण',
    Component: L(() => import('./NepalLandAreaConverter'), 'NepalLandAreaConverter'),
  },

  // ── UNIT 6: PRISM (प्रिज्म) ───────────────────────────────────────────────
  {
    code: 'SIM-MATH-G9-U6-01',
    key: 'class9-math-u6-explore-build-prism',
    lesson: 6,
    unit: 6,
    grade: 9,
    titleEn: 'Explore and Build a Prism',
    titleNp: 'प्रिज्मको अन्वेषण तथा निर्माण',
    Component: L(() => import('./ExploreBuildPrism'), 'ExploreBuildPrism'),
  },
  {
    code: 'SIM-MATH-G9-U6-02',
    key: 'class9-math-u6-surface-area-laboratory',
    lesson: 6,
    unit: 6,
    grade: 9,
    titleEn: 'Lateral and Total Surface Area Laboratory',
    titleNp: 'प्रिज्मको छड्के र कुल सतहको क्षेत्रफल प्रयोगशाला',
    Component: L(() => import('./PrismSurfaceAreaLaboratory'), 'PrismSurfaceAreaLaboratory'),
  },
  {
    code: 'SIM-MATH-G9-U6-03',
    key: 'class9-math-u6-prism-volume-water-tank',
    lesson: 6,
    unit: 6,
    grade: 9,
    titleEn: 'Prism Volume and Water Tank Designer',
    titleNp: 'प्रिज्मको आयतन तथा पानी ट्याङ्की डिजाइन',
    Component: L(() => import('./PrismVolumeWaterTankDesigner'), 'PrismVolumeWaterTankDesigner'),
  },
];

export const findClass9Sim = (componentKey?: string, code?: string) =>
  CLASS9_MATH.find((s) => (componentKey && s.key === componentKey) || (code && s.code === code));

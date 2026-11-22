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
          लोड हुँदैछ... (Loading simulation...)
        </div>
      }
    >
      <Comp {...props} />
    </Suspense>
  );
};

export const CLASS8_MATH = [
  // ── UNIT 2: WHOLE NUMBERS (पूर्ण सङ्ख्याहरू) ──────────────────────────
  {
    code: 'SIM-MATH-G8-U2-01',
    key: 'class8-math-u2-number-systems',
    lesson: 2,
    unit: 2,
    titleEn: 'Number System Discovery Playground',
    titleNp: 'सङ्ख्या पद्धति खोजी खेलमैदान',
    Component: L(() => import('./NumberSystemDiscoveryPlayground'), 'NumberSystemDiscoveryPlayground'),
  },
  {
    code: 'SIM-MATH-G8-U2-02',
    key: 'class8-math-u2-binary-quinary-conversion',
    lesson: 2,
    unit: 2,
    titleEn: 'Binary and Quinary Conversion Lab',
    titleNp: 'द्विआधार र पञ्चआधार रूपान्तरण प्रयोगशाला',
    Component: L(() => import('./BinaryQuinaryConversionLab'), 'BinaryQuinaryConversionLab'),
  },

  // ── UNIT 3: RATIONAL AND IRRATIONAL NUMBERS (परिमेय र अपरिमेय सङ्ख्याहरू) ──
  {
    code: 'SIM-MATH-G8-U3-01',
    key: 'class8-math-u3-number-classification',
    lesson: 3,
    unit: 3,
    titleEn: 'Rational and Irrational Classification Lab',
    titleNp: 'परिमेय र अपरिमेय सङ्ख्या वर्गीकरण प्रयोगशाला',
    Component: L(() => import('./NumberClassificationLab'), 'NumberClassificationLab'),
  },
  {
    code: 'SIM-MATH-G8-U3-02',
    key: 'class8-math-u3-irrational-number-line',
    lesson: 3,
    unit: 3,
    titleEn: 'Irrational Numbers on the Number Line Lab',
    titleNp: 'सङ्ख्या रेखामा अपरिमेय सङ्ख्या निर्माण प्रयोगशाला',
    Component: L(() => import('./IrrationalNumberLineLab'), 'IrrationalNumberLineLab'),
  },
  {
    code: 'SIM-MATH-G8-U3-03',
    key: 'class8-math-u3-recurring-decimal-fraction',
    lesson: 3,
    unit: 3,
    titleEn: 'Recurring Decimal to Fraction Studio',
    titleNp: 'दोहोरिने दशमलवलाई भिन्नमा रूपान्तरण स्टुडियो',
    Component: L(() => import('./RecurringDecimalFractionStudio'), 'RecurringDecimalFractionStudio'),
  },
  {
    code: 'SIM-MATH-G8-U3-04',
    key: 'class8-math-u3-scientific-notation-explorer',
    lesson: 3,
    unit: 3,
    titleEn: 'Scientific Notation Explorer',
    titleNp: 'वैज्ञानिक सङ्केतन अन्वेषक',
    Component: L(() => import('./ScientificNotationExplorer'), 'ScientificNotationExplorer'),
  },
  {
    code: 'SIM-MATH-G8-U3-05',
    key: 'class8-math-u3-scientific-notation-calc',
    lesson: 3,
    unit: 3,
    titleEn: 'Scientific Notation Calculation Lab',
    titleNp: 'वैज्ञानिक सङ्केतन गणना प्रयोगशाला',
    Component: L(() => import('./ScientificNotationCalcLab'), 'ScientificNotationCalcLab'),
  },

  // ── UNIT 4: RATIO AND PROPORTION (अनुपात र समानुपात) ──────────────────
  {
    code: 'SIM-MATH-G8-U4-01',
    key: 'class8-math-u4-ratio-discovery',
    lesson: 4,
    unit: 4,
    titleEn: 'Ratio Discovery and Comparison Playground',
    titleNp: 'अनुपात खोजी र तुलना खेलमैदान',
    Component: L(() => import('./RatioDiscoveryPlayground'), 'RatioDiscoveryPlayground'),
  },
  {
    code: 'SIM-MATH-G8-U4-02',
    key: 'class8-math-u4-ratio-sharing-solver',
    lesson: 4,
    unit: 4,
    titleEn: 'Ratio Sharing and Real-Life Problem Solver',
    titleNp: 'अनुपात बाँडफाँड र व्यावहारिक समस्या समाधान',
    Component: L(() => import('./RatioSharingSolver'), 'RatioSharingSolver'),
  },
  {
    code: 'SIM-MATH-G8-U4-03',
    key: 'class8-math-u4-proportion-unknown-value',
    lesson: 4,
    unit: 4,
    titleEn: 'Proportion and Unknown Value Lab',
    titleNp: 'समानुपात र अज्ञात मान प्रयोगशाला',
    Component: L(() => import('./ProportionUnknownValueLab'), 'ProportionUnknownValueLab'),
  },
];

export const findClass8Sim = (componentKey?: string, code?: string) =>
  CLASS8_MATH.find((s) => (componentKey && s.key === componentKey) || (code && s.code === code));

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

export const CLASS7_MATH = [
  {
    code: 'SIM-MATH-G7-L1-01',
    key: 'class7-math-ch1-set-builder',
    lesson: 1,
    titleEn: 'Set Builder and Classification Lab',
    titleNp: 'समूह निर्माण र वर्गीकरण प्रयोगशाला',
    Component: L(() => import('./SetBuilderClassificationLab'), 'SetBuilderClassificationLab'),
  },
  {
    code: 'SIM-MATH-G7-L1-02',
    key: 'class7-math-ch1-types-of-sets',
    lesson: 1,
    titleEn: 'Types of Sets – Discovery World',
    titleNp: 'समूहका प्रकारहरू खोजी संसार',
    Component: L(() => import('./TypesOfSetsDiscovery'), 'TypesOfSetsDiscovery'),
  },
  {
    code: 'SIM-MATH-G7-L1-03',
    key: 'class7-math-ch1-equal-equivalent',
    lesson: 1,
    titleEn: 'Equal and Equivalent Sets Explorer',
    titleNp: 'बराबर र समतुल्य समूह अन्वेषक',
    Component: L(() => import('./EqualEquivalentSetsExplorer'), 'EqualEquivalentSetsExplorer'),
  },
  {
    code: 'SIM-MATH-G7-L1-04',
    key: 'class7-math-ch1-universal-set',
    lesson: 1,
    titleEn: 'Universal Set Explorer',
    titleNp: 'सर्वव्यापक समूह अन्वेषक',
    Component: L(() => import('./UniversalSetExplorer'), 'UniversalSetExplorer'),
  },
  {
    code: 'SIM-MATH-G7-L1-05',
    key: 'class7-math-ch1-subsets',
    lesson: 1,
    titleEn: 'Subset and Subset Builder Lab',
    titleNp: 'उपसमूह र उपसमूह निर्माण प्रयोगशाला',
    Component: L(() => import('./SubsetBuilderLab'), 'SubsetBuilderLab'),
  },
  {
    code: 'SIM-MATH-G7-L1-06',
    key: 'class7-math-ch1-classroom-3d',
    lesson: 1,
    titleEn: 'My Classroom – Real-World Set Formation',
    titleNp: 'मेरो कक्षाकोठा – वास्तविक वस्तुबाट समूह निर्माण',
    Component: L(() => import('./ClassroomSetFormation3D'), 'ClassroomSetFormation3D'),
  },
  // ── LESSON 2: WHOLE NUMBER (पूर्ण सङ्ख्या) ──────────────────────────
  {
    code: 'SIM-MATH-G7-L2-01',
    key: 'class7-math-l2-square-root-discovery',
    lesson: 2,
    titleEn: 'Square and Square Root Discovery Lab',
    titleNp: 'वर्ग र वर्गमूल खोजी प्रयोगशाला',
    Component: L(() => import('./SquareRootDiscoveryLab'), 'SquareRootDiscoveryLab'),
  },
  {
    code: 'SIM-MATH-G7-L2-02',
    key: 'class7-math-l2-square-root-studio',
    lesson: 2,
    titleEn: 'Square Root Calculation Studio',
    titleNp: 'वर्गमूल गणना प्रयोगशाला',
    Component: L(() => import('./SquareRootCalculationStudio'), 'SquareRootCalculationStudio'),
  },
  {
    code: 'SIM-MATH-G7-L2-03',
    key: 'class7-math-l2-cube-root-explorer',
    lesson: 2,
    titleEn: 'Cube and Cube Root Explorer',
    titleNp: 'घन र घनमूल खोजी संसार',
    Component: L(() => import('./CubeRootExplorer'), 'CubeRootExplorer'),
  },
  {
    code: 'SIM-MATH-G7-L2-04',
    key: 'class7-math-l2-hcf-discovery',
    lesson: 2,
    titleEn: 'HCF Discovery & Problem-Solving Lab',
    titleNp: 'महत्तम समापवर्तक (म.स.) खोजी प्रयोगशाला',
    Component: L(() => import('./HcfDiscoveryLab'), 'HcfDiscoveryLab'),
  },
  {
    code: 'SIM-MATH-G7-L2-05',
    key: 'class7-math-l2-lcm-discovery',
    lesson: 2,
    titleEn: 'LCM Discovery and Real-Life Challenge',
    titleNp: 'लघुत्तम समापवर्त्य (ल.स.) खोजी प्रयोगशाला',
    Component: L(() => import('./LcmDiscoveryLab'), 'LcmDiscoveryLab'),
  },
  // ── LESSON 3: INTEGER (पूर्णाङ्क) ───────────────────────────────────
  {
    code: 'SIM-MATH-G7-L3-01',
    key: 'class7-math-l3-number-line',
    lesson: 3,
    titleEn: 'Integer Number Line Adventure',
    titleNp: 'पूर्णाङ्क सङ्ख्यारेखा यात्रा',
    Component: L(() => import('./IntegerNumberLineAdventure'), 'IntegerNumberLineAdventure'),
  },
  {
    code: 'SIM-MATH-G7-L3-02',
    key: 'class7-math-l3-add-sub',
    lesson: 3,
    titleEn: 'Integer Addition & Subtraction Lab',
    titleNp: 'पूर्णाङ्कको जोड र घटाउ प्रयोगशाला',
    Component: L(() => import('./IntegerAddSubLab'), 'IntegerAddSubLab'),
  },
  {
    code: 'SIM-MATH-G7-L3-03',
    key: 'class7-math-l3-mul-div',
    lesson: 3,
    titleEn: 'Integer Multiplication & Division Studio',
    titleNp: 'पूर्णाङ्कको गुणन र भाग प्रयोगशाला',
    Component: L(() => import('./IntegerMulDivStudio'), 'IntegerMulDivStudio'),
  },
  {
    code: 'SIM-MATH-G7-L3-04',
    key: 'class7-math-l3-applications',
    lesson: 3,
    titleEn: 'Integer Application & Simplification',
    titleNp: 'पूर्णाङ्कको व्यवहारिक प्रयोग र सरलीकरण',
    Component: L(() => import('./IntegerApplicationChallenge'), 'IntegerApplicationChallenge'),
  },
  // ── LESSON 4: RATIONAL NUMBER (परिमेय सङ्ख्या) ────────────────────────
  {
    code: 'SIM-MATH-G7-L4-01',
    key: 'class7-math-l4-discovery',
    lesson: 4,
    titleEn: 'Rational Number Discovery Lab',
    titleNp: 'परिमेय सङ्ख्या खोजी प्रयोगशाला',
    Component: L(() => import('./RationalNumberDiscoveryLab'), 'RationalNumberDiscoveryLab'),
  },
  {
    code: 'SIM-MATH-G7-L4-02',
    key: 'class7-math-l4-properties',
    lesson: 4,
    titleEn: 'Rational Number Properties Lab',
    titleNp: 'परिमेय सङ्ख्याका गुणहरू प्रयोगशाला',
    Component: L(() => import('./RationalNumberPropertiesLab'), 'RationalNumberPropertiesLab'),
  },
  {
    code: 'SIM-MATH-G7-L4-03',
    key: 'class7-math-l4-conversion',
    lesson: 4,
    titleEn: 'Fraction & Decimal Conversion Studio',
    titleNp: 'भिन्न र दशमलव रूपान्तरण प्रयोगशाला',
    Component: L(() => import('./FractionDecimalConversionStudio'), 'FractionDecimalConversionStudio'),
  },
  // ── LESSON 5: FRACTION AND DECIMAL (भिन्न र दशमलव) ──────────────────
  {
    code: 'SIM-MATH-G7-L5-01',
    key: 'class7-math-l5-fraction-vis',
    lesson: 5,
    titleEn: 'Fraction Visualization & Simplification',
    titleNp: 'भिन्नको दृश्यावलोकन र सरलीकरण प्रयोगशाला',
    Component: L(() => import('./FractionVisualizationLab'), 'FractionVisualizationLab'),
  },
  {
    code: 'SIM-MATH-G7-L5-02',
    key: 'class7-math-l5-word-problems',
    lesson: 5,
    titleEn: 'Fraction of a Quantity & Word Problems',
    titleNp: 'परिमाणको भिन्न र व्यवहारिक समस्या समाधान',
    Component: L(() => import('./FractionQuantitySolver'), 'FractionQuantitySolver'),
  },
  {
    code: 'SIM-MATH-G7-L5-03',
    key: 'class7-math-l5-decimal-calc',
    lesson: 5,
    titleEn: 'Decimal Calculation & Simplification',
    titleNp: 'दशमलव गणना र सरलीकरण प्रयोगशाला',
    Component: L(() => import('./DecimalCalculationStudio'), 'DecimalCalculationStudio'),
  },
  {
    code: 'SIM-MATH-G7-L5-04',
    key: 'class7-math-l5-geometry-lab',
    lesson: 5,
    titleEn: 'Decimal Measurement & Geometry Lab',
    titleNp: 'दशमलव नाप र ज्यामिति प्रयोगशाला',
    Component: L(() => import('./DecimalMeasurementGeometryLab'), 'DecimalMeasurementGeometryLab'),
  },
];

export const findClass7Sim = (componentKey?: string, code?: string) =>
  CLASS7_MATH.find((s) => (componentKey && s.key === componentKey) || (code && s.code === code));

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

  // ── UNIT 5: PROFIT AND LOSS (नाफा र नोक्सान) ──────────────────────────
  {
    code: 'SIM-MATH-G8-U5-01',
    key: 'class8-math-u5-profit-loss-marketplace',
    lesson: 5,
    unit: 5,
    titleEn: 'Profit and Loss Interactive Marketplace',
    titleNp: 'नाफा र नोक्सान अन्तरक्रियात्मक बजार',
    Component: L(() => import('./ProfitLossMarketplace'), 'ProfitLossMarketplace'),
  },
  {
    code: 'SIM-MATH-G8-U5-02',
    key: 'class8-math-u5-discount-smart-shopping',
    lesson: 5,
    unit: 5,
    titleEn: 'Discount and Smart Shopping Lab',
    titleNp: 'छुट र किनमेल प्रयोगशाला',
    Component: L(() => import('./DiscountSmartShoppingLab'), 'DiscountSmartShoppingLab'),
  },
  {
    code: 'SIM-MATH-G8-U5-03',
    key: 'class8-math-u5-business-profit-loss',
    lesson: 5,
    unit: 5,
    titleEn: 'Business Profit and Loss Challenge',
    titleNp: 'व्यापारिक नाफा-नोक्सान चुनौती',
    Component: L(() => import('./BusinessProfitLossChallenge'), 'BusinessProfitLossChallenge'),
  },

  // ── UNIT 6: UNITARY METHOD (एकाइ विधि) ────────────────────────────────
  {
    code: 'SIM-MATH-G8-U6-01',
    key: 'class8-math-u6-direct-variation-lab',
    lesson: 6,
    unit: 6,
    titleEn: 'Direct Variation Discovery Lab',
    titleNp: 'प्रत्यक्ष विचरण अन्वेषण प्रयोगशाला',
    Component: L(() => import('./DirectVariationDiscoveryLab'), 'DirectVariationDiscoveryLab'),
  },
  {
    code: 'SIM-MATH-G8-U6-02',
    key: 'class8-math-u6-indirect-variation-work-time',
    lesson: 6,
    unit: 6,
    titleEn: 'Indirect Variation and Work-Time Lab',
    titleNp: 'अप्रत्यक्ष विचरण र कार्य-समय प्रयोगशाला',
    Component: L(() => import('./IndirectVariationWorkTimeLab'), 'IndirectVariationWorkTimeLab'),
  },
  {
    code: 'SIM-MATH-G8-U6-03',
    key: 'class8-math-u6-unitary-real-life-solver',
    lesson: 6,
    unit: 6,
    titleEn: 'Real-Life Unitary Method Solver & Arrow Method',
    titleNp: 'व्यावहारिक एकाइ विधि र तीर विधि',
    Component: L(() => import('./UnitaryMethodRealLifeSolver'), 'UnitaryMethodRealLifeSolver'),
  },

  // ── UNIT 7: SIMPLE INTEREST (साधारण ब्याज) ────────────────────────────
  {
    code: 'SIM-MATH-G8-U7-01',
    key: 'class8-math-u7-simple-interest-banking',
    lesson: 7,
    unit: 7,
    titleEn: 'Simple Interest Banking Playground',
    titleNp: 'साधारण ब्याज र बैंकिङ खेलमैदान',
    Component: L(() => import('./SimpleInterestBankingPlayground'), 'SimpleInterestBankingPlayground'),
  },
  {
    code: 'SIM-MATH-G8-U7-02',
    key: 'class8-math-u7-simple-interest-formula-unknown',
    lesson: 7,
    unit: 7,
    titleEn: 'Simple Interest Formula & Unknown Variables Lab',
    titleNp: 'साधारण ब्याज सूत्र र अज्ञात मान प्रयोगशाला',
    Component: L(() => import('./SimpleInterestFormulaUnknownLab'), 'SimpleInterestFormulaUnknownLab'),
  },
  {
    code: 'SIM-MATH-G8-U7-03',
    key: 'class8-math-u7-amount-tax-banking',
    lesson: 7,
    unit: 7,
    titleEn: 'Total Amount, Interest Tax & Banking Challenge',
    titleNp: 'मिश्रधन, ब्याज कर र बैंकिङ चुनौती',
    Component: L(() => import('./AmountTaxBankingChallenge'), 'AmountTaxBankingChallenge'),
  },

  // ── UNIT 8: AREA AND VOLUME (क्षेत्रफल र आयतन) ────────────────────────
  {
    code: 'SIM-MATH-G8-U8-01',
    key: 'class8-math-u8-geometry-area-explorer',
    lesson: 8,
    unit: 8,
    titleEn: 'Geometry Area Explorer',
    titleNp: 'ज्यामितीय क्षेत्रफल अन्वेषक',
    Component: L(() => import('./GeometryAreaExplorer'), 'GeometryAreaExplorer'),
  },
  {
    code: 'SIM-MATH-G8-U8-02',
    key: 'class8-math-u8-circle-circumference-lab',
    lesson: 8,
    unit: 8,
    titleEn: 'Circle and Circumference Discovery Lab',
    titleNp: 'वृत्त, परिधि र क्षेत्रफल',
    Component: L(() => import('./CircleCircumferenceLab'), 'CircleCircumferenceLab'),
  },
  {
    code: 'SIM-MATH-G8-U8-03',
    key: 'class8-math-u8-composite-shaded-area-solver',
    lesson: 8,
    unit: 8,
    titleEn: 'Composite Shapes and Shaded Area Solver',
    titleNp: 'संयुक्त आकृति र छायाङ्कित क्षेत्रफल',
    Component: L(() => import('./CompositeShadedAreaSolver'), 'CompositeShadedAreaSolver'),
  },

  // ── UNIT 9: INDICES (घाताङ्क) ──────────────────────────────────────────
  {
    code: 'SIM-MATH-G8-U9-01',
    key: 'class8-math-u9-indices-exponent-playground',
    lesson: 9,
    unit: 9,
    titleEn: 'Indices Discovery and Exponent Playground',
    titleNp: 'घाताङ्क खोजी र गुणन खेलमैदान',
    Component: L(() => import('./IndicesExponentPlayground'), 'IndicesExponentPlayground'),
  },
  {
    code: 'SIM-MATH-G8-U9-02',
    key: 'class8-math-u9-laws-of-indices-lab',
    lesson: 9,
    unit: 9,
    titleEn: 'Laws of Indices Interactive Lab',
    titleNp: 'घाताङ्कका नियमहरू प्रयोगशाला',
    Component: L(() => import('./LawsOfIndicesLab'), 'LawsOfIndicesLab'),
  },
  {
    code: 'SIM-MATH-G8-U9-03',
    key: 'class8-math-u9-expression-indices-challenge',
    lesson: 9,
    unit: 9,
    titleEn: 'Expression Simplification and Indices Challenge',
    titleNp: 'व्यञ्जक सरलीकरण र घाताङ्क चुनौती',
    Component: L(() => import('./ExpressionSimplificationIndicesChallenge'), 'ExpressionSimplificationIndicesChallenge'),
  },

  // ── UNIT 10: ALGEBRAIC EXPRESSION (बीजगणितीय व्यञ्जक) ──────────────────
  {
    code: 'SIM-MATH-G8-U10-01',
    key: 'class8-math-u10-algebraic-tiles-factorization',
    lesson: 10,
    unit: 10,
    titleEn: 'Algebraic Tiles and Factorization Playground',
    titleNp: 'बीजगणितीय टायल र खण्डीकरण',
    Component: L(() => import('./AlgebraicTilesFactorizationPlayground'), 'AlgebraicTilesFactorizationPlayground'),
  },
  {
    code: 'SIM-MATH-G8-U10-02',
    key: 'class8-math-u10-quadratic-factorization-lab',
    lesson: 10,
    unit: 10,
    titleEn: 'Quadratic Expression and Factorization Lab',
    titleNp: 'वर्ग समीकरण र खण्डीकरण प्रयोगशाला',
    Component: L(() => import('./QuadraticFactorizationLab'), 'QuadraticFactorizationLab'),
  },
  {
    code: 'SIM-MATH-G8-U10-03',
    key: 'class8-math-u10-hcf-lcm-algebraic-expressions',
    lesson: 10,
    unit: 10,
    titleEn: 'HCF and LCM of Algebraic Expressions Lab',
    titleNp: 'बीजीय व्यञ्जकहरूको म.स. र ल.स.',
    Component: L(() => import('./HcfLcmAlgebraicExpressionsLab'), 'HcfLcmAlgebraicExpressionsLab'),
  },

  // ── UNIT 11: ALGEBRAIC FRACTION (बीजीय भिन्न) ──────────────────────────
  {
    code: 'SIM-MATH-G8-U11-01',
    key: 'class8-math-u11-algebraic-fraction-discovery',
    lesson: 11,
    unit: 11,
    titleEn: 'Algebraic Fraction Discovery and Simplification Lab',
    titleNp: 'बीजीय भिन्न खोजी र सरलीकरण प्रयोगशाला',
    Component: L(() => import('./AlgebraicFractionDiscoveryLab'), 'AlgebraicFractionDiscoveryLab'),
  },
  {
    code: 'SIM-MATH-G8-U11-02',
    key: 'class8-math-u11-algebraic-fraction-add-sub',
    lesson: 11,
    unit: 11,
    titleEn: 'Algebraic Fraction Addition and Subtraction Lab',
    titleNp: 'बीजीय भिन्नको जोड र घटाउ प्रयोगशाला',
    Component: L(() => import('./AlgebraicFractionAddSubLab'), 'AlgebraicFractionAddSubLab'),
  },
  {
    code: 'SIM-MATH-G8-U11-03',
    key: 'class8-math-u11-algebraic-fraction-mul-div',
    lesson: 11,
    unit: 11,
    titleEn: 'Algebraic Fraction Multiplication and Division Lab',
    titleNp: 'बीजीय भिन्नको गुणन र भाग प्रयोगशाला',
    Component: L(() => import('./AlgebraicFractionMulDivLab'), 'AlgebraicFractionMulDivLab'),
  },

  // ── UNIT 12: SIMULTANEOUS & QUADRATIC EQUATIONS (युगपत र द्विघात समीकरण) ──
  {
    code: 'SIM-MATH-G8-U12-01',
    key: 'class8-math-u12-simultaneous-equations-graph',
    lesson: 12,
    unit: 12,
    titleEn: 'Simultaneous Equations Graph and Table Studio',
    titleNp: 'युगपत समीकरण ग्राफ र तालिका स्टुडियो',
    Component: L(() => import('./SimultaneousEquationsGraphPlotter'), 'SimultaneousEquationsGraphPlotter'),
  },
  {
    code: 'SIM-MATH-G8-U12-02',
    key: 'class8-math-u12-quadratic-equation-factorization',
    lesson: 12,
    unit: 12,
    titleEn: 'Quadratic Equation Factorization Lab',
    titleNp: 'द्विघात समीकरण गुणनखण्ड प्रयोगशाला',
    Component: L(() => import('./QuadraticEquationFactorizationLab'), 'QuadraticEquationFactorizationLab'),
  },
  {
    code: 'SIM-MATH-G8-U12-03',
    key: 'class8-math-u12-equation-solver-challenge',
    lesson: 12,
    unit: 12,
    titleEn: 'Real-Life Equation Solver Challenge',
    titleNp: 'समीकरण व्यावहारिक समस्या समाधान',
    Component: L(() => import('./EquationSolverRealLifeChallenge'), 'EquationSolverRealLifeChallenge'),
  },

  // ── UNIT 13: LINES AND ANGLES (रेखाहरू र कोणहरू) ──────────────────────
  {
    code: 'SIM-MATH-G8-U13-01',
    key: 'class8-math-u13-lines-transversal-explorer',
    lesson: 13,
    unit: 13,
    titleEn: 'Lines and Angles Transversal Explorer',
    titleNp: 'समानान्तर रेखा र छेदक कोण अन्वेषक',
    Component: L(() => import('./LinesAnglesTransversalExplorer'), 'LinesAnglesTransversalExplorer'),
  },
  {
    code: 'SIM-MATH-G8-U13-02',
    key: 'class8-math-u13-parallel-lines-relationship',
    lesson: 13,
    unit: 13,
    titleEn: 'Parallel Lines Angle Relationship Lab',
    titleNp: 'समानान्तर रेखा र कोण सम्बन्ध प्रयोगशाला',
    Component: L(() => import('./ParallelLinesAngleRelationshipLab'), 'ParallelLinesAngleRelationshipLab'),
  },
  {
    code: 'SIM-MATH-G8-U13-03',
    key: 'class8-math-u13-unknown-angle-solver',
    lesson: 13,
    unit: 13,
    titleEn: 'Unknown Angle Solver Challenge',
    titleNp: 'अज्ञात कोण पत्ता लगाउने चुनौती',
    Component: L(() => import('./UnknownAngleSolverChallenge'), 'UnknownAngleSolverChallenge'),
  },

  // ── UNIT 14: PLANE FIGURES (समतलीय आकृतिहरू) ───────────────────────────
  {
    code: 'SIM-MATH-G8-U14-01',
    key: 'class8-math-u14-triangle-quadrilateral-discovery',
    lesson: 14,
    unit: 14,
    titleEn: 'Triangle and Quadrilateral Discovery Lab',
    titleNp: 'त्रिभुज र चतुर्भुज खोजी प्रयोगशाला',
    Component: L(() => import('./TriangleQuadrilateralDiscoveryLab'), 'TriangleQuadrilateralDiscoveryLab'),
  },
  {
    code: 'SIM-MATH-G8-U14-02',
    key: 'class8-math-u14-geometric-construction-studio',
    lesson: 14,
    unit: 14,
    titleEn: 'Geometric Construction Studio',
    titleNp: 'ज्यामितीय रचना स्टुडियो',
    Component: L(() => import('./GeometricConstructionStudio'), 'GeometricConstructionStudio'),
  },
  {
    code: 'SIM-MATH-G8-U14-03',
    key: 'class8-math-u14-polygon-explorer',
    lesson: 14,
    unit: 14,
    titleEn: 'Polygon Explorer and Angle Calculator',
    titleNp: 'बहुभुज अन्वेषक र कोण क्यालकुलेटर',
    Component: L(() => import('./PolygonExplorerAngleCalculator'), 'PolygonExplorerAngleCalculator'),
  },

  // ── UNIT 15: CONGRUENCY AND SIMILARITY (सर्वाङ्गसमता र समरूपता) ─────────
  {
    code: 'SIM-MATH-G8-U15-01',
    key: 'class8-math-u15-congruent-triangle-discovery',
    lesson: 15,
    unit: 15,
    titleEn: 'Congruent Triangle Discovery Lab',
    titleNp: 'सर्वाङ्गसम त्रिभुज खोजी प्रयोगशाला',
    Component: L(() => import('./CongruentTriangleDiscoveryLab'), 'CongruentTriangleDiscoveryLab'),
  },
  {
    code: 'SIM-MATH-G8-U15-02',
    key: 'class8-math-u15-triangle-congruency-test',
    lesson: 15,
    unit: 15,
    titleEn: 'Triangle Congruency Test Lab',
    titleNp: 'त्रिभुज सर्वाङ्गसमता परीक्षण प्रयोगशाला',
    Component: L(() => import('./TriangleCongruencyTestLab'), 'TriangleCongruencyTestLab'),
  },
  {
    code: 'SIM-MATH-G8-U15-03',
    key: 'class8-math-u15-similar-figures-lab',
    lesson: 15,
    unit: 15,
    titleEn: 'Similar Figures and Triangle Similarity Lab',
    titleNp: 'समरूप आकृति र त्रिभुज समरूपता प्रयोगशाला',
    Component: L(() => import('./SimilarFiguresSimilarityLab'), 'SimilarFiguresSimilarityLab'),
  },

  // ── UNIT 16: SOLID OBJECTS (ठोस वस्तुहरू) ─────────────────────────────
  {
    code: 'SIM-MATH-G8-U16-01',
    key: 'class8-math-u16-prism-pyramid-explorer',
    lesson: 16,
    unit: 16,
    titleEn: '3D Prism and Pyramid Explorer',
    titleNp: '३D प्रिज्म र पिरामिड अन्वेषक',
    Component: L(() => import('./SolidPrismPyramidExplorer3D'), 'SolidPrismPyramidExplorer3D'),
  },
  {
    code: 'SIM-MATH-G8-U16-02',
    key: 'class8-math-u16-net-builder-folding',
    lesson: 16,
    unit: 16,
    titleEn: '3D Solid Net Builder and Folding Lab',
    titleNp: '३D ठोस वस्तु जालो र पट्याउने प्रयोगशाला',
    Component: L(() => import('./SolidNetBuilderFoldingLab3D'), 'SolidNetBuilderFoldingLab3D'),
  },
  {
    code: 'SIM-MATH-G8-U16-03',
    key: 'class8-math-u16-solid-geometry-challenge',
    lesson: 16,
    unit: 16,
    titleEn: '3D Solid Geometry Challenge World',
    titleNp: '३D ठोस ज्यामिति चुनौती संसार',
    Component: L(() => import('./SolidGeometryChallengeWorld3D'), 'SolidGeometryChallengeWorld3D'),
  },

  // ── UNIT 17: COORDINATES (निर्देशाङ्कहरू) ───────────────────────────────
  {
    code: 'SIM-MATH-G8-U17-01',
    key: 'class8-math-u17-cartesian-coordinate-explorer',
    lesson: 17,
    unit: 17,
    titleEn: 'Cartesian Coordinate Plane Explorer',
    titleNp: 'कार्तीय निर्देशाङ्क समतल अन्वेषक',
    Component: L(() => import('./CartesianCoordinateExplorer'), 'CartesianCoordinateExplorer'),
  },
  {
    code: 'SIM-MATH-G8-U17-02',
    key: 'class8-math-u17-distance-points-lab',
    lesson: 17,
    unit: 17,
    titleEn: 'Distance Between Points Lab',
    titleNp: 'दुई बिन्दुहरू बीचको दूरी प्रयोगशाला',
    Component: L(() => import('./DistanceBetweenPointsLab'), 'DistanceBetweenPointsLab'),
  },
  {
    code: 'SIM-MATH-G8-U17-03',
    key: 'class8-math-u17-coordinate-challenge-world',
    lesson: 17,
    unit: 17,
    titleEn: 'Coordinate Geometry Challenge World',
    titleNp: 'निर्देशाङ्क ज्यामिति चुनौती संसार',
    Component: L(() => import('./CoordinateGeometryChallengeWorld'), 'CoordinateGeometryChallengeWorld'),
  },

  // ── UNIT 18: TESSELLATION (टेसेलेसन) ──────────────────────────────────
  {
    code: 'SIM-MATH-G8-U18-01',
    key: 'class8-math-u18-tessellation-discovery-studio',
    lesson: 18,
    unit: 18,
    titleEn: 'Tessellation Discovery Studio',
    titleNp: 'टेसेलेसन खोजी स्टुडियो',
    Component: L(() => import('./TessellationDiscoveryStudio'), 'TessellationDiscoveryStudio'),
  },
  {
    code: 'SIM-MATH-G8-U18-02',
    key: 'class8-math-u18-regular-semiregular-tessellation',
    lesson: 18,
    unit: 18,
    titleEn: 'Regular & Semi-Regular Tessellation Lab',
    titleNp: 'नियमित र अर्ध-नियमित टेसेलेसन प्रयोगशाला',
    Component: L(() => import('./RegularSemiRegularTessellationLab'), 'RegularSemiRegularTessellationLab'),
  },
  {
    code: 'SIM-MATH-G8-U18-03',
    key: 'class8-math-u18-tessellation-pattern-designer',
    lesson: 18,
    unit: 18,
    titleEn: 'Tessellation Pattern Designer',
    titleNp: 'टेसेलेसन ढाँचा डिजाइनर',
    Component: L(() => import('./TessellationPatternDesigner'), 'TessellationPatternDesigner'),
  },

  // ── UNIT 19: TRANSFORMATION (रूपान्तरण) ───────────────────────────────
  {
    code: 'SIM-MATH-G8-U19-01',
    key: 'class8-math-u19-reflection-explorer',
    lesson: 19,
    unit: 19,
    titleEn: 'Reflection Transformation Explorer',
    titleNp: 'परावर्तन रूपान्तरण अन्वेषक',
    Component: L(() => import('./ReflectionExplorer'), 'ReflectionExplorer'),
  },
  {
    code: 'SIM-MATH-G8-U19-02',
    key: 'class8-math-u19-translation-motion-lab',
    lesson: 19,
    unit: 19,
    titleEn: 'Translation Motion Lab',
    titleNp: 'विस्थापन गति प्रयोगशाला',
    Component: L(() => import('./TranslationMotionLab'), 'TranslationMotionLab'),
  },
  {
    code: 'SIM-MATH-G8-U19-03',
    key: 'class8-math-u19-rotation-transformation-challenge',
    lesson: 19,
    unit: 19,
    titleEn: 'Rotation & Transformation Challenge',
    titleNp: 'परिक्रमण र रूपान्तरण चुनौती',
    Component: L(() => import('./RotationTransformationChallenge'), 'RotationTransformationChallenge'),
  },
];

export const findClass8Sim = (componentKey?: string, code?: string) =>
  CLASS8_MATH.find((s) => (componentKey && s.key === componentKey) || (code && s.code === code));

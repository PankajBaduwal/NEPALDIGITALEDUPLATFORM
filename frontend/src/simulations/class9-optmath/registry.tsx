import React from 'react';
import { findClass10Sim } from '../class10-math/registry';

const L = (loader: () => Promise<any>, exportName?: string) =>
  React.lazy(async () => {
    const mod = await loader();
    return { default: exportName ? mod[exportName] : mod.default || mod };
  });

export interface Class9OptMathSimDef {
  code: string;
  key: string;
  lesson: number;
  unit: number;
  grade: number;
  titleEn: string;
  titleNp: string;
  Component: React.ComponentType<any>;
}

export const CLASS9_OPTMATH: Class9OptMathSimDef[] = [
  // ── UNIT 1: ALGEBRA (बीजगणित) ─────────────────────────────────────────────
  {
    code: 'SIM-OPTMATH-G9-U1-01',
    key: 'class9-optmath-u1-relation-function-explorer',
    lesson: 1,
    unit: 1,
    grade: 9,
    titleEn: 'Relation and Function Visual Explorer',
    titleNp: 'सम्बन्ध तथा फलन दृश्य अन्वेषक',
    Component: L(() => import('./RelationFunctionVisualExplorer'), 'RelationFunctionVisualExplorer'),
  },
  {
    code: 'SIM-OPTMATH-G9-U1-02',
    key: 'class9-optmath-u1-polynomial-root-graph-lab',
    lesson: 2,
    unit: 1,
    grade: 9,
    titleEn: 'Polynomial Root and Graph Laboratory',
    titleNp: 'बहुपदको शून्यमान तथा ग्राफ प्रयोगशाला',
    Component: L(() => import('./PolynomialRootGraphLab'), 'PolynomialRootGraphLab'),
  },
  {
    code: 'SIM-OPTMATH-G9-U1-03',
    key: 'class9-optmath-u1-linear-inequality-graphing-lab',
    lesson: 3,
    unit: 1,
    grade: 9,
    titleEn: 'Linear Inequality Graphing Laboratory',
    titleNp: 'रेखीय असमानता ग्राफ प्रयोगशाला',
    Component: L(() => import('./LinearInequalityGraphingLab'), 'LinearInequalityGraphingLab'),
  },

  // ── UNIT 2: TRIGONOMETRY (त्रिकोणमिति) ──────────────────────────────────
  {
    code: 'SIM-OPTMATH-G9-U2-01',
    key: 'class9-optmath-u2-angle-measurement-conversion-lab',
    lesson: 1,
    unit: 2,
    grade: 9,
    titleEn: 'Angle Measurement and Conversion Lab',
    titleNp: 'कोण मापन तथा रूपान्तरण प्रयोगशाला',
    Component: L(() => import('./AngleMeasurementConversionLab'), 'AngleMeasurementConversionLab'),
  },
  {
    code: 'SIM-OPTMATH-G9-U2-02',
    key: 'class9-optmath-u2-trig-ratio-identity-explorer',
    lesson: 2,
    unit: 2,
    grade: 9,
    titleEn: 'Trigonometric Ratio and Identity Explorer',
    titleNp: 'त्रिकोणमितीय अनुपात तथा सर्वसमिका अन्वेषक',
    Component: L(() => import('./TrigRatioIdentityExplorer'), 'TrigRatioIdentityExplorer'),
  },
  {
    code: 'SIM-OPTMATH-G9-U2-03',
    key: 'class9-optmath-u2-trig-ratio-conversion-lab',
    lesson: 3,
    unit: 2,
    grade: 9,
    titleEn: 'Trigonometric Ratio Conversion Lab',
    titleNp: 'त्रिकोणमितीय अनुपात रूपान्तरण प्रयोगशाला',
    Component: L(() => import('./TrigRatioConversionLab'), 'TrigRatioConversionLab'),
  },

  // ── UNIT 3: GEOMETRY (निर्देशाङ्क ज्यामिति) ──────────────────────────────
  {
    code: 'SIM-OPTMATH-G9-U3-01',
    key: 'class9-optmath-u3-locus-coordinate-geometry-lab',
    lesson: 1,
    unit: 3,
    grade: 9,
    titleEn: 'Locus and Coordinate Geometry Lab',
    titleNp: 'बिन्दुपथ तथा खण्ड-सूत्र प्रयोगशाला',
    Component: L(() => import('./LocusCoordinateGeometryLab'), 'LocusCoordinateGeometryLab'),
  },
  {
    code: 'SIM-OPTMATH-G9-U3-02',
    key: 'class9-optmath-u3-slope-straightline-graph-lab',
    lesson: 2,
    unit: 3,
    grade: 9,
    titleEn: 'Slope and Straight-Line Graph Laboratory',
    titleNp: 'झुकाव तथा सरलरेखा ग्राफ प्रयोगशाला',
    Component: L(() => import('./SlopeStraightLineGraphLab'), 'SlopeStraightLineGraphLab'),
  },
  {
    code: 'SIM-OPTMATH-G9-U3-03',
    key: 'class9-optmath-u3-geometric-transformation-lab',
    lesson: 3,
    unit: 3,
    grade: 9,
    titleEn: 'Geometric Transformation Laboratory',
    titleNp: 'ज्यामितीय विस्थापन तथा रूपान्तरण प्रयोगशाला',
    Component: L(() => import('./GeometricTransformationLab'), 'GeometricTransformationLab'),
  },

  // ── UNIT 4: VECTOR (भेक्टर) ───────────────────────────────────────────────
  {
    code: 'SIM-OPTMATH-G9-U4-01',
    key: 'class9-optmath-u4-scalar-vector-explorer',
    lesson: 1,
    unit: 4,
    grade: 9,
    titleEn: 'Scalar and Vector Visual Explorer',
    titleNp: 'स्केलर तथा भेक्टर दृश्य अन्वेषक',
    Component: L(() => import('./ScalarVectorVisualExplorer'), 'ScalarVectorVisualExplorer'),
  },
  {
    code: 'SIM-OPTMATH-G9-U4-02',
    key: 'class9-optmath-u4-vector-operations-lab',
    lesson: 2,
    unit: 4,
    grade: 9,
    titleEn: 'Vector Addition and Operations Laboratory',
    titleNp: 'भेक्टर जोड तथा कार्य सञ्चालन प्रयोगशाला',
    Component: L(() => import('./VectorOperationsLab'), 'VectorOperationsLab'),
  },
  {
    code: 'SIM-OPTMATH-G9-U4-03',
    key: 'class9-optmath-u4-magnitude-direction-unit-lab',
    lesson: 3,
    unit: 4,
    grade: 9,
    titleEn: 'Vector Magnitude, Direction and Unit Vector Lab',
    titleNp: 'भेक्टर परिमाण, दिशा तथा एकाइ भेक्टर प्रयोगशाला',
    Component: L(() => import('./VectorMagnitudeDirectionUnitLab'), 'VectorMagnitudeDirectionUnitLab'),
  },

  // ── UNIT 5: STATISTICS (तथ्याङ्कशास्त्र) ────────────────────────────────────
  {
    code: 'SIM-OPTMATH-G9-U5-01',
    key: 'class9-optmath-u5-quartile-percentile-explorer',
    lesson: 1,
    unit: 5,
    grade: 9,
    titleEn: 'Quartile and Percentile Explorer',
    titleNp: 'चतुर्थांश तथा शशांश अन्वेषक',
    Component: L(() => import('./QuartilePercentileExplorer'), 'QuartilePercentileExplorer'),
  },
  {
    code: 'SIM-OPTMATH-G9-U5-02',
    key: 'class9-optmath-u5-statistical-dispersion-lab',
    lesson: 2,
    unit: 5,
    grade: 9,
    titleEn: 'Statistical Dispersion Laboratory',
    titleNp: 'तथ्याङ्कीय विचलनशीलता प्रयोगशाला',
    Component: L(() => import('./StatisticalDispersionLab'), 'StatisticalDispersionLab'),
  },
  {
    code: 'SIM-OPTMATH-G9-U5-03',
    key: 'class9-optmath-u5-box-whisker-plot-builder',
    lesson: 3,
    unit: 5,
    grade: 9,
    titleEn: 'Box and Whisker Plot Builder',
    titleNp: 'बाकस र जुँगा रेखाचित्र निर्माणशाला',
    Component: L(() => import('./BoxWhiskerPlotBuilder'), 'BoxWhiskerPlotBuilder'),
  },

  // ── UNIT 6: LIMIT (सीमा) ──────────────────────────────────────────────────
  {
    code: 'SIM-OPTMATH-G9-U6-01',
    key: 'class9-optmath-u6-infinity-approaching-values-explorer',
    lesson: 1,
    unit: 6,
    grade: 9,
    titleEn: 'Infinity and Approaching Values Explorer',
    titleNp: 'अनन्त तथा नजिकिँदाको मान अन्वेषक',
    Component: L(() => import('./InfinityApproachingValuesExplorer'), 'InfinityApproachingValuesExplorer'),
  },
  {
    code: 'SIM-OPTMATH-G9-U6-02',
    key: 'class9-optmath-u6-limit-infinite-series-lab',
    lesson: 2,
    unit: 6,
    grade: 9,
    titleEn: 'Limit and Infinite Series Visual Lab',
    titleNp: 'सीमा तथा अनन्त श्रेणी दृश्य प्रयोगशाला',
    Component: L(() => import('./LimitInfiniteSeriesLab'), 'LimitInfiniteSeriesLab'),
  },
  {
    code: 'SIM-OPTMATH-G9-U6-03',
    key: 'class9-optmath-u6-function-limit-graph-lab',
    lesson: 3,
    unit: 6,
    grade: 9,
    titleEn: 'Function Limit and Graph Investigation Lab',
    titleNp: 'फलनको सीमा तथा ग्राफ अनुसन्धानशाला',
    Component: L(() => import('./FunctionLimitGraphLab'), 'FunctionLimitGraphLab'),
  },
];

export const findClass9OptMathSim = (componentKey?: string, code?: string) =>
  CLASS9_OPTMATH.find((s) => (componentKey && s.key === componentKey) || (code && s.code === code)) ||
  findClass10Sim(componentKey, code);

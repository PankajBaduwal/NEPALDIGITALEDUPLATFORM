import React from 'react';

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
];

export const findClass9OptMathSim = (componentKey?: string, code?: string) =>
  CLASS9_OPTMATH.find((s) => (componentKey && s.key === componentKey) || (code && s.code === code));

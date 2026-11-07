/**
 * PiyushDhara Eduverse — Concrete Technology (U25CE304)
 * Reference Mix Designs per IS 10262:2019 & IS 456:2000
 */

import type { ConcreteGrade, IMixProportion } from './types';

export const CONCRETE_MIX_PROPORTIONS: Record<ConcreteGrade, IMixProportion> = {
  M15: {
    grade: 'M15',
    targetStrength28DaysMpa: 20.77, // f'ck = fck + 1.65*s (s = 3.5 MPa per IS 456 Table 8)
    standardDeviationMpa: 3.5,
    cementType: 'OPC 43 Grade (IS 8112)',
    maxAggregateSizeMm: 20,
    nominalRatio: { cement: 1, fineAggregate: 2, coarseAggregate: 4 },
    waterCementRatio: 0.60,
    standardSlumpMm: 75,
    densityKgM3: 2380,
    standardReference: 'IS 456:2000 Plain Concrete / Non-structural levelling beds',
  },
  M20: {
    grade: 'M20',
    targetStrength28DaysMpa: 26.6, // s = 4.0 MPa per IS 456
    standardDeviationMpa: 4.0,
    cementType: 'OPC 43 / 53 Grade',
    maxAggregateSizeMm: 20,
    nominalRatio: { cement: 1, fineAggregate: 1.5, coarseAggregate: 3 },
    waterCementRatio: 0.50,
    standardSlumpMm: 80,
    densityKgM3: 2420,
    standardReference: 'IS 456:2000 Minimum grade for Reinforced Concrete',
  },
  M25: {
    grade: 'M25',
    targetStrength28DaysMpa: 31.6, // s = 4.0 MPa
    standardDeviationMpa: 4.0,
    cementType: 'OPC 53 Grade (IS 12269)',
    maxAggregateSizeMm: 20,
    nominalRatio: { cement: 1, fineAggregate: 1, coarseAggregate: 2 },
    waterCementRatio: 0.45,
    standardSlumpMm: 90,
    densityKgM3: 2450,
    standardReference: 'IS 10262:2019 Table 2 & IS 456 Table 5 for Severe exposure',
  },
  M30: {
    grade: 'M30',
    targetStrength28DaysMpa: 38.25, // s = 5.0 MPa per IS 456 Table 8
    standardDeviationMpa: 5.0,
    cementType: 'OPC 53 Grade',
    maxAggregateSizeMm: 20,
    nominalRatio: { cement: 1, fineAggregate: 1.2, coarseAggregate: 2.2 },
    waterCementRatio: 0.42,
    standardSlumpMm: 100,
    densityKgM3: 2480,
    standardReference: 'IS 10262:2019 Design Mix for Prestressed / Post-Tensioned Beams',
  },
  M35: {
    grade: 'M35',
    targetStrength28DaysMpa: 43.25,
    standardDeviationMpa: 5.0,
    cementType: 'OPC 53 Grade',
    maxAggregateSizeMm: 20,
    nominalRatio: { cement: 1, fineAggregate: 1.1, coarseAggregate: 2.0 },
    waterCementRatio: 0.38,
    standardSlumpMm: 100,
    densityKgM3: 2500,
    standardReference: 'IS 10262:2019 Highway bridge piers and multi-storey columns',
  },
  M40: {
    grade: 'M40',
    targetStrength28DaysMpa: 48.25,
    standardDeviationMpa: 5.0,
    cementType: 'OPC 53 Grade + Mineral Admixtures (Fly Ash/Silica Fume)',
    maxAggregateSizeMm: 20,
    nominalRatio: { cement: 1, fineAggregate: 0.95, coarseAggregate: 1.8 },
    waterCementRatio: 0.35,
    standardSlumpMm: 110,
    densityKgM3: 2520,
    standardReference: 'IS 10262:2019 High-strength concrete for major civil bridges',
  },
};

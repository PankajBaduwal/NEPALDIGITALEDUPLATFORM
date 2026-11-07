/**
 * Engineering Workpiece & Cutting Tool Materials Database
 * Calibrated against standard manufacturing handbooks (Machinery's Handbook, Kalpakjian & Schmid)
 */

import type { WorkpieceMaterial, WorkpieceMaterialId } from './types';

export const WORKPIECE_MATERIALS: Record<WorkpieceMaterialId, WorkpieceMaterial> = {
  'mild-steel': {
    id: 'mild-steel',
    name: 'Mild Steel (AISI 1020)',
    grade: 'Low Carbon Structural Steel (0.20% C)',
    densityKgM3: 7850,
    brinellHardnessHB: 126,
    specificCuttingEnergyKc: 1800, // N/mm²
    recommendedSpeedRange: { min: 25, max: 90 }, // m/min (HSS / Carbide)
    taylorN: 0.25, // HSS tool on carbon steel
    taylorC: 75,
    colorHex: 0x8a929a,
    specularHex: 0x444444,
    roughness: 0.35,
    metalness: 0.85,
  },
  'medium-carbon-steel': {
    id: 'medium-carbon-steel',
    name: 'Medium Carbon Steel (AISI 1045)',
    grade: 'Shafting & Machinery Steel (0.45% C)',
    densityKgM3: 7850,
    brinellHardnessHB: 170,
    specificCuttingEnergyKc: 2200, // N/mm²
    recommendedSpeedRange: { min: 20, max: 75 },
    taylorN: 0.22,
    taylorC: 60,
    colorHex: 0x717982,
    specularHex: 0x555555,
    roughness: 0.3,
    metalness: 0.9,
  },
  'aluminium-6061': {
    id: 'aluminium-6061',
    name: 'Aluminium Alloy 6061-T6',
    grade: 'Precipitation Hardened Al-Mg-Si Alloy',
    densityKgM3: 2700,
    brinellHardnessHB: 95,
    specificCuttingEnergyKc: 700, // N/mm²
    recommendedSpeedRange: { min: 60, max: 350 },
    taylorN: 0.35,
    taylorC: 220,
    colorHex: 0xd4d8dd,
    specularHex: 0x888888,
    roughness: 0.2,
    metalness: 0.8,
  },
  'brass-c360': {
    id: 'brass-c360',
    name: 'Free-Cutting Brass (UNS C36000)',
    grade: 'CuZn39Pb3 Machining Brass',
    densityKgM3: 8500,
    brinellHardnessHB: 130,
    specificCuttingEnergyKc: 950, // N/mm²
    recommendedSpeedRange: { min: 45, max: 200 },
    taylorN: 0.3,
    taylorC: 150,
    colorHex: 0xd9a84e,
    specularHex: 0x665522,
    roughness: 0.25,
    metalness: 0.75,
  },
  'cast-iron-g25': {
    id: 'cast-iron-g25',
    name: 'Grey Cast Iron (Grade 25)',
    grade: 'Flake Graphite Cast Iron (Pearlitic)',
    densityKgM3: 7200,
    brinellHardnessHB: 210,
    specificCuttingEnergyKc: 1400, // N/mm²
    recommendedSpeedRange: { min: 20, max: 70 },
    taylorN: 0.18,
    taylorC: 45,
    colorHex: 0x4f545a,
    specularHex: 0x222222,
    roughness: 0.5,
    metalness: 0.7,
  },
  'titanium-grade5': {
    id: 'titanium-grade5',
    name: 'Titanium Ti-6Al-4V (Grade 5)',
    grade: 'Alpha-Beta Aerospace Alloy',
    densityKgM3: 4430,
    brinellHardnessHB: 330,
    specificCuttingEnergyKc: 3200, // N/mm²
    recommendedSpeedRange: { min: 10, max: 40 },
    taylorN: 0.15,
    taylorC: 25,
    colorHex: 0x9fa4a6,
    specularHex: 0x333333,
    roughness: 0.4,
    metalness: 0.85,
  },
};

export const STANDARD_ASA_TOOL_SIGNATURES = {
  hssGeneralPurpose: {
    backRakeAngleDeg: 8,
    sideRakeAngleDeg: 14,
    endReliefAngleDeg: 6,
    sideReliefAngleDeg: 6,
    endCuttingEdgeAngleDeg: 10,
    sideCuttingEdgeAngleDeg: 15,
    noseRadiusMm: 0.8,
  },
  carbideSteelTurning: {
    backRakeAngleDeg: 0,
    sideRakeAngleDeg: 6,
    endReliefAngleDeg: 6,
    sideReliefAngleDeg: 6,
    endCuttingEdgeAngleDeg: 15,
    sideCuttingEdgeAngleDeg: 15,
    noseRadiusMm: 0.8,
  },
  carbideAluminiumFinishing: {
    backRakeAngleDeg: 12,
    sideRakeAngleDeg: 20,
    endReliefAngleDeg: 10,
    sideReliefAngleDeg: 10,
    endCuttingEdgeAngleDeg: 8,
    sideCuttingEdgeAngleDeg: 10,
    noseRadiusMm: 0.4,
  },
  castIronTurning: {
    backRakeAngleDeg: -4,
    sideRakeAngleDeg: 4,
    endReliefAngleDeg: 5,
    sideReliefAngleDeg: 5,
    endCuttingEdgeAngleDeg: 12,
    sideCuttingEdgeAngleDeg: 15,
    noseRadiusMm: 1.2,
  },
};

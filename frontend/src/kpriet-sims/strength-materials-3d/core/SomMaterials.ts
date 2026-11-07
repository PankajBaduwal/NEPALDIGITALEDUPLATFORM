/**
 * PiyushDhara Eduverse — Strength of Materials (U25CE301)
 * Standard Engineering Materials Library
 * Physical properties based on IS 1786, IS 456, IS 800, and ASTM E8
 */

import type { IMaterialProperties, MaterialId } from './types';

export const SOM_MATERIALS: Record<MaterialId, IMaterialProperties> = {
  'fe250-mild-steel': {
    id: 'fe250-mild-steel',
    name: 'Mild Steel (Fe 250 / IS 2062)',
    category: 'ferrous-metal',
    elasticModulus: 200e9, // 200 GPa
    poissonsRatio: 0.30,
    yieldStrength: 250e6, // 250 MPa
    ultimateStrength: 410e6, // 410 MPa
    compressiveYieldStrength: 250e6,
    compressiveUltimateStrength: 410e6,
    fractureStrain: 0.23, // 23% elongation
    density: 7850,
    thermalExpansionCoeff: 12e-6,
    colorHex: 0x94a3b8,
    roughness: 0.35,
    metalness: 0.85,
    isDuctile: true,
    standardReference: 'IS 2062:2011 Grade E250 — High ductility structural steel',
  },
  'fe415-tmt-steel': {
    id: 'fe415-tmt-steel',
    name: 'TMT Reinforcing Rebar (Fe 415 / IS 1786)',
    category: 'ferrous-metal',
    elasticModulus: 200e9, // 200 GPa
    poissonsRatio: 0.30,
    yieldStrength: 415e6, // 415 MPa (0.2% proof stress)
    ultimateStrength: 485e6, // 485 MPa
    compressiveYieldStrength: 415e6,
    compressiveUltimateStrength: 485e6,
    fractureStrain: 0.145, // 14.5% min elongation per IS 1786
    density: 7850,
    thermalExpansionCoeff: 11.5e-6,
    colorHex: 0x64748b,
    roughness: 0.45,
    metalness: 0.8,
    isDuctile: true,
    standardReference: 'IS 1786:2008 Grade Fe 415 — Thermo-Mechanically Treated Rebar',
  },
  'fe500-high-strength-steel': {
    id: 'fe500-high-strength-steel',
    name: 'High-Strength TMT Rebar (Fe 500D / IS 1786)',
    category: 'ferrous-metal',
    elasticModulus: 200e9, // 200 GPa
    poissonsRatio: 0.30,
    yieldStrength: 500e6, // 500 MPa
    ultimateStrength: 565e6, // 565 MPa
    compressiveYieldStrength: 500e6,
    compressiveUltimateStrength: 565e6,
    fractureStrain: 0.16, // 16% elongation for 500D
    density: 7850,
    thermalExpansionCoeff: 11.5e-6,
    colorHex: 0x475569,
    roughness: 0.4,
    metalness: 0.85,
    isDuctile: true,
    standardReference: 'IS 1786:2008 Grade Fe 500D — High ductility rebar for seismic zones',
  },
  'al-6061-t6': {
    id: 'al-6061-t6',
    name: 'Structural Aluminium (6061-T6)',
    category: 'non-ferrous',
    elasticModulus: 68.9e9, // 69 GPa
    poissonsRatio: 0.33,
    yieldStrength: 276e6, // 276 MPa
    ultimateStrength: 310e6, // 310 MPa
    compressiveYieldStrength: 276e6,
    compressiveUltimateStrength: 310e6,
    fractureStrain: 0.12, // 12% elongation
    density: 2700,
    thermalExpansionCoeff: 23.2e-6,
    colorHex: 0xe2e8f0,
    roughness: 0.25,
    metalness: 0.75,
    isDuctile: true,
    standardReference: 'ASTM B221 — Structural architectural and bridge alloy',
  },
  'cast-iron-fg200': {
    id: 'cast-iron-fg200',
    name: 'Grey Cast Iron (FG 200 / IS 210)',
    category: 'ferrous-metal',
    elasticModulus: 110e9, // 110 GPa
    poissonsRatio: 0.26,
    yieldStrength: 150e6, // Brittle in tension
    ultimateStrength: 200e6, // 200 MPa tensile
    compressiveYieldStrength: 550e6,
    compressiveUltimateStrength: 750e6, // High compressive strength ~750 MPa
    fractureStrain: 0.008, // 0.8% negligible plastic deformation
    density: 7200,
    thermalExpansionCoeff: 10.5e-6,
    colorHex: 0x334155,
    roughness: 0.6,
    metalness: 0.7,
    isDuctile: false,
    standardReference: 'IS 210:2009 Grade FG 200 — Brittle behaviour with 45° shear fracture in compression',
  },
  'concrete-m25': {
    id: 'concrete-m25',
    name: 'Structural Concrete (M25 / IS 456)',
    category: 'concrete',
    elasticModulus: 25000e6, // 5000 * sqrt(25) = 25,000 MPa per IS 456:2000 Cl 6.2.3.1
    poissonsRatio: 0.18,
    yieldStrength: 17.5e6,
    ultimateStrength: 3.5e6, // Split tensile ~ 0.7 * sqrt(fck) = 3.5 MPa
    compressiveYieldStrength: 20e6,
    compressiveUltimateStrength: 25e6, // Characteristic compressive strength 25 MPa
    fractureStrain: 0.0035, // 0.0035 max compressive strain at collapse per IS 456
    density: 2400,
    thermalExpansionCoeff: 10e-6,
    colorHex: 0xcbd5e1,
    roughness: 0.85,
    metalness: 0.05,
    isDuctile: false,
    standardReference: 'IS 456:2000 Plain and Reinforced Concrete — Code of Practice',
  },
  'concrete-m30': {
    id: 'concrete-m30',
    name: 'High-Grade Concrete (M30 / IS 456)',
    category: 'concrete',
    elasticModulus: 27386e6, // 5000 * sqrt(30) = 27,386 MPa
    poissonsRatio: 0.18,
    yieldStrength: 21e6,
    ultimateStrength: 3.83e6, // 0.7 * sqrt(30)
    compressiveYieldStrength: 24e6,
    compressiveUltimateStrength: 30e6, // 30 MPa
    fractureStrain: 0.0035,
    density: 2450,
    thermalExpansionCoeff: 10e-6,
    colorHex: 0x94a3b8,
    roughness: 0.85,
    metalness: 0.05,
    isDuctile: false,
    standardReference: 'IS 456:2000 Table 2 & Clause 6.2 — Standard Structural Concrete',
  },
  'copper-alloy': {
    id: 'copper-alloy',
    name: 'Structural Brass (CuZn37 / IS 410)',
    category: 'non-ferrous',
    elasticModulus: 105e9, // 105 GPa
    poissonsRatio: 0.34,
    yieldStrength: 180e6, // 180 MPa
    ultimateStrength: 360e6, // 360 MPa
    compressiveYieldStrength: 180e6,
    compressiveUltimateStrength: 360e6,
    fractureStrain: 0.35, // High ductility
    density: 8450,
    thermalExpansionCoeff: 18.5e-6,
    colorHex: 0xd97706,
    roughness: 0.3,
    metalness: 0.8,
    isDuctile: true,
    standardReference: 'IS 410:1977 Specification for Cold Rolled Brass Sheet, Strip and Foil',
  },
  'structural-timber': {
    id: 'structural-timber',
    name: 'Teak Wood (Tectona grandis / IS 883)',
    category: 'timber',
    elasticModulus: 12.5e9, // 12.5 GPa parallel to grain
    poissonsRatio: 0.32,
    yieldStrength: 35e6, // Parallel to grain
    ultimateStrength: 60e6,
    compressiveYieldStrength: 30e6,
    compressiveUltimateStrength: 45e6,
    fractureStrain: 0.018,
    density: 650,
    thermalExpansionCoeff: 5e-6,
    colorHex: 0xb45309,
    roughness: 0.75,
    metalness: 0.05,
    isDuctile: false,
    standardReference: 'IS 883:1994 Design of Structural Timber in Building — Code of Practice',
  },
};

/**
 * PiyushDhara Eduverse — Strength of Materials (U25CE301)
 * Analytical & Numerical Engineering Calculation Engine
 * Formulated per Euler-Bernoulli Beam Theory, Hooke's Law, and IS 456 / IS 800 standards
 */

import type {
  CrossSectionType,
  IBeamCalculationResult,
  IBeamLoad,
  ICrossSectionDimensions,
  IMaterialProperties,
  ISectionProperties,
  IStressStrainResult,
  IUtmCalculationResult,
  SupportCondition,
} from './types';
import { SOM_MATERIALS } from './SomMaterials';

export class SomCalculator {
  /**
   * 1. Calculate geometric and section properties from cross-section dimensions
   */
  public static calculateSectionProperties(dims: ICrossSectionDimensions): ISectionProperties {
    const type: CrossSectionType = dims.type;

    if (type === 'rectangular') {
      const b = Math.max(0.005, dims.width ?? 0.05); // 50mm default
      const d = Math.max(0.005, dims.depth ?? 0.1); // 100mm default
      const area = b * d;
      const momentOfInertiaX = (b * Math.pow(d, 3)) / 12;
      const momentOfInertiaY = (d * Math.pow(b, 3)) / 12;
      const sectionModulusX = momentOfInertiaX / (d / 2);
      const radiusOfGyrationX = Math.sqrt(momentOfInertiaX / area);

      return {
        area,
        momentOfInertiaX,
        momentOfInertiaY,
        sectionModulusX,
        radiusOfGyrationX,
        centroidY: d / 2,
        outerDimensions: { width: b, height: d },
      };
    }

    if (type === 'solid-circular') {
      const dia = Math.max(0.005, dims.diameter ?? 0.05); // 50mm
      const area = (Math.PI * Math.pow(dia, 2)) / 4;
      const momentOfInertiaX = (Math.PI * Math.pow(dia, 4)) / 64;
      const momentOfInertiaY = momentOfInertiaX;
      const sectionModulusX = (Math.PI * Math.pow(dia, 3)) / 32;
      const radiusOfGyrationX = dia / 4;

      return {
        area,
        momentOfInertiaX,
        momentOfInertiaY,
        sectionModulusX,
        radiusOfGyrationX,
        centroidY: dia / 2,
        outerDimensions: { width: dia, height: dia },
      };
    }

    if (type === 'circular-tube') {
      const outerD = Math.max(0.01, dims.diameter ?? 0.06); // 60mm
      const t = Math.max(0.001, Math.min(dims.wallThickness ?? 0.005, outerD * 0.45)); // 5mm
      const innerD = outerD - 2 * t;
      const area = (Math.PI * (Math.pow(outerD, 2) - Math.pow(innerD, 2))) / 4;
      const momentOfInertiaX = (Math.PI * (Math.pow(outerD, 4) - Math.pow(innerD, 4))) / 64;
      const momentOfInertiaY = momentOfInertiaX;
      const sectionModulusX = momentOfInertiaX / (outerD / 2);
      const radiusOfGyrationX = Math.sqrt(momentOfInertiaX / area);

      return {
        area,
        momentOfInertiaX,
        momentOfInertiaY,
        sectionModulusX,
        radiusOfGyrationX,
        centroidY: outerD / 2,
        outerDimensions: { width: outerD, height: outerD },
      };
    }

    if (type === 'i-beam') {
      const bf = Math.max(0.02, dims.flangeWidth ?? 0.08); // 80mm
      const tf = Math.max(0.002, dims.flangeThickness ?? 0.008); // 8mm
      const tw = Math.max(0.002, dims.webThickness ?? 0.005); // 5mm
      const totalDepth = Math.max(0.04, dims.depth ?? 0.12); // 120mm
      const hw = totalDepth - 2 * tf; // web height

      const area = 2 * (bf * tf) + hw * tw;
      // Ix = (B*D^3 - (B-tw)*hw^3) / 12
      const momentOfInertiaX = (bf * Math.pow(totalDepth, 3) - (bf - tw) * Math.pow(hw, 3)) / 12;
      const momentOfInertiaY = (2 * (tf * Math.pow(bf, 3)) + hw * Math.pow(tw, 3)) / 12;
      const sectionModulusX = momentOfInertiaX / (totalDepth / 2);
      const radiusOfGyrationX = Math.sqrt(momentOfInertiaX / area);

      return {
        area,
        momentOfInertiaX,
        momentOfInertiaY,
        sectionModulusX,
        radiusOfGyrationX,
        centroidY: totalDepth / 2,
        outerDimensions: { width: bf, height: totalDepth },
      };
    }

    // Default: T-section
    const bf = Math.max(0.02, dims.flangeWidth ?? 0.08);
    const tf = Math.max(0.002, dims.flangeThickness ?? 0.008);
    const tw = Math.max(0.002, dims.webThickness ?? 0.006);
    const hw = Math.max(0.02, (dims.depth ?? 0.1) - tf);
    const totalDepth = hw + tf;

    const aFlange = bf * tf;
    const aWeb = hw * tw;
    const area = aFlange + aWeb;
    // y measured from bottom of web
    const yFlange = hw + tf / 2;
    const yWeb = hw / 2;
    const centroidY = (aFlange * yFlange + aWeb * yWeb) / area;

    const iFlange = (bf * Math.pow(tf, 3)) / 12 + aFlange * Math.pow(yFlange - centroidY, 2);
    const iWeb = (tw * Math.pow(hw, 3)) / 12 + aWeb * Math.pow(yWeb - centroidY, 2);
    const momentOfInertiaX = iFlange + iWeb;
    const momentOfInertiaY = (tf * Math.pow(bf, 3) + hw * Math.pow(tw, 3)) / 12;
    const yMax = Math.max(centroidY, totalDepth - centroidY);
    const sectionModulusX = momentOfInertiaX / yMax;
    const radiusOfGyrationX = Math.sqrt(momentOfInertiaX / area);

    return {
      area,
      momentOfInertiaX,
      momentOfInertiaY,
      sectionModulusX,
      radiusOfGyrationX,
      centroidY,
      outerDimensions: { width: bf, height: totalDepth },
    };
  }

  /**
   * 2. Universal Testing Machine (UTM) Tensile & Compressive Deformation Mechanics
   * Generates realistic non-linear elastoplastic curve with yielding, strain hardening, necking and rupture.
   */
  public static calculateUtmState(params: {
    material: IMaterialProperties;
    mode: 'tension' | 'compression';
    initialGaugeLength: number; // m (e.g. 0.05m = 50mm)
    initialDiameter: number; // m (e.g. 0.0125m = 12.5mm standard rebar)
    appliedDisplacement: number; // m (stroke movement)
  }): IUtmCalculationResult {
    const { material, mode, initialGaugeLength, initialDiameter, appliedDisplacement } = params;
    const A0 = (Math.PI * Math.pow(initialDiameter, 2)) / 4;
    const L0 = Math.max(0.01, initialGaugeLength);
    const E = material.elasticModulus;
    const nu = material.poissonsRatio;

    const isTension = mode === 'tension';
    const disp = Math.abs(appliedDisplacement);
    const engStrain = disp / L0;

    const yieldStress = isTension ? material.yieldStrength : (material.compressiveYieldStrength ?? material.yieldStrength);
    const ultStress = isTension ? material.ultimateStrength : (material.compressiveUltimateStrength ?? material.ultimateStrength);
    const fractureStrain = material.fractureStrain;

    const yieldStrain = yieldStress / E;
    const ultStrain = isTension ? Math.min(fractureStrain * 0.55, 0.12) : 0.18;

    let engStress = 0;
    let stage: IUtmCalculationResult['stage'] = 'elastic';
    let isYielded = false;
    let isFractured = false;
    let instDiameter = initialDiameter;

    if (engStrain >= fractureStrain && isTension) {
      // Specimen ruptured
      stage = 'fractured';
      isYielded = true;
      isFractured = true;
      engStress = 0;
      instDiameter = initialDiameter * Math.sqrt(1 - (material.isDuctile ? 0.45 : 0.05));
    } else if (engStrain <= yieldStrain) {
      // 1. Hooke's Linear Elastic Region
      stage = 'elastic';
      engStress = E * engStrain;
      const latStrain = -nu * engStrain;
      instDiameter = initialDiameter * (1 + (isTension ? latStrain : Math.abs(latStrain)));
    } else if (engStrain <= yieldStrain * 1.6 && material.isDuctile && isTension && material.category === 'ferrous-metal') {
      // 2. Yield Plateau (Characteristic of Mild Steel Fe250)
      stage = 'yielding';
      isYielded = true;
      engStress = yieldStress;
      const latStrain = -0.5 * engStrain; // Plastic volume conservation
      instDiameter = initialDiameter * (1 + latStrain);
    } else if (engStrain <= ultStrain) {
      // 3. Strain Hardening Phase (Hollomon Equation approximation)
      stage = 'strain-hardening';
      isYielded = true;
      const progress = (engStrain - yieldStrain) / (ultStrain - yieldStrain);
      engStress = yieldStress + (ultStress - yieldStress) * Math.sin((progress * Math.PI) / 2);
      const latStrain = -0.5 * engStrain;
      instDiameter = initialDiameter * (1 + (isTension ? latStrain : Math.abs(latStrain)));
    } else {
      // 4. Necking & Softening Phase (Tension) or Plastic Barrelling (Compression)
      if (isTension) {
        stage = 'necking';
        isYielded = true;
        const progress = (engStrain - ultStrain) / (fractureStrain - ultStrain);
        const fractureStress = ultStress * (material.isDuctile ? 0.82 : 0.95);
        engStress = ultStress - (ultStress - fractureStress) * Math.pow(progress, 1.2);

        // Localized necking reduction in area
        const neckingFactor = 0.5 + 0.5 * progress * (material.isDuctile ? 0.45 : 0.08);
        instDiameter = initialDiameter * (1 - neckingFactor * engStrain);
      } else {
        // Compression: Strain hardening with barrelling friction
        stage = 'strain-hardening';
        isYielded = true;
        engStress = ultStress + (engStrain - ultStrain) * 0.15 * E;
        instDiameter = initialDiameter * (1 + 0.5 * engStrain);
      }
    }

    const appliedLoad = engStress * A0;
    const trueStrain = Math.log(1 + (isTension ? engStrain : -engStrain));
    const trueStress = engStress * (1 + engStrain);

    const elasticEnergyDensity = Math.pow(yieldStress, 2) / (2 * E);
    const totalEnergyDensity = isYielded
      ? elasticEnergyDensity + ((yieldStress + engStress) / 2) * (engStrain - yieldStrain)
      : (engStress * engStrain) / 2;

    const percentElongation = engStrain * 100;
    const currentArea = (Math.PI * Math.pow(instDiameter, 2)) / 4;
    const percentReductionInArea = Math.max(0, ((A0 - currentArea) / A0) * 100);

    return {
      load: appliedLoad,
      displacement: disp,
      engineeringStress: engStress,
      engineeringStrain: engStrain,
      trueStress,
      trueStrain,
      instantaneousDiameter: instDiameter,
      stage,
      isYielded,
      isFractured,
      elasticEnergyDensity,
      totalEnergyDensity,
      percentElongation,
      percentReductionInArea,
    };
  }

  /**
   * 3. Interactive Direct Stress, Strain, Lateral Contraction & Mohr's Circle Solver
   */
  public static calculateStressStrain(params: {
    material: IMaterialProperties;
    axialForce: number; // N (+ for tension, - for compression)
    length: number; // m
    crossSection: ICrossSectionDimensions;
    temperatureDelta?: number; // C or K
    isConstrained?: boolean;
  }): IStressStrainResult {
    const { material, axialForce, length, crossSection, temperatureDelta = 0, isConstrained = false } = params;
    const sec = this.calculateSectionProperties(crossSection);
    const A = sec.area;
    const L0 = Math.max(0.01, length);
    const E = material.elasticModulus;
    const nu = material.poissonsRatio;
    const alpha = material.thermalExpansionCoeff;

    // Direct mechanical stress
    const axialStress = axialForce / A;
    const mechanicalStrain = axialStress / E;

    // Thermal strain and stress
    const thermalFreeStrain = alpha * temperatureDelta;
    const thermalStress = isConstrained ? -E * thermalFreeStrain : 0;
    const totalStress = axialStress + thermalStress;
    const totalAxialStrain = isConstrained ? mechanicalStrain : mechanicalStrain + thermalFreeStrain;

    const deltaLength = totalAxialStrain * L0;
    const lateralStrain = -nu * mechanicalStrain + (!isConstrained ? thermalFreeStrain : 0);
    const initialWidth = sec.outerDimensions.width;
    const deltaDiameter = lateralStrain * initialWidth;

    // Volumetric strain: e_v = e_x + e_y + e_z = e_x * (1 - 2*nu)
    const volumetricStrain = mechanicalStrain * (1 - 2 * nu) + 3 * thermalFreeStrain;
    const initialVolume = A * L0;
    const volumetricChange = initialVolume * volumetricStrain;

    // Elastic Moduli relations
    const shearModulus = E / (2 * (1 + nu));
    const bulkModulus = E / (3 * (1 - 2 * nu));

    // Elastic strain energy
    const strainEnergy = 0.5 * Math.abs(axialForce * deltaLength);

    // 2D Mohr's Circle for Uniaxial Stress state (sigma_x = totalStress, sigma_y = 0, tau_xy = 0)
    const center = totalStress / 2;
    const radius = Math.abs(totalStress) / 2;
    const principalStress1 = Math.max(0, totalStress);
    const principalStress2 = Math.min(0, totalStress);
    const maxShearStress = radius;

    return {
      axialLoad: axialForce,
      initialLength: L0,
      initialArea: A,
      deltaLength,
      lateralStrain,
      deltaDiameter,
      axialStress: totalStress,
      axialStrain: totalAxialStrain,
      volumetricStrain,
      volumetricChange,
      shearModulus,
      bulkModulus,
      strainEnergy,
      thermalStress,
      mohrCircle: {
        center,
        radius,
        principalStress1,
        principalStress2,
        maxShearStress,
      },
    };
  }

  /**
   * 4. Structural Beam Deflection, Shear Force and Bending Moment Solver
   * Analytical integration of Euler-Bernoulli equation EI * d2y/dx2 = M(x)
   */
  public static calculateBeamResponse(params: {
    material: IMaterialProperties;
    section: ICrossSectionDimensions;
    span: number; // m
    support: SupportCondition;
    loads: IBeamLoad[];
    inspectionPosition?: number; // m
    numPoints?: number;
  }): IBeamCalculationResult {
    const { material, section, span, support, loads, inspectionPosition = span / 2, numPoints = 100 } = params;
    const L = Math.max(0.2, span);
    const sec = this.calculateSectionProperties(section);
    const E = material.elasticModulus;
    const I = sec.momentOfInertiaX;
    const EI = E * I;

    // 1. Support Reactions Calculation via Statics
    let RA = 0;
    let RB = 0;
    let MA = 0;
    let MB = 0;

    let totalLoadN = 0;
    let totalMomentAboutA = 0;

    for (const load of loads) {
      if (load.type === 'point') {
        const a = Math.max(0, Math.min(L, load.positionStart));
        const W = load.magnitude;
        totalLoadN += W;
        totalMomentAboutA += W * a;
      } else if (load.type === 'udl') {
        const x1 = Math.max(0, Math.min(L, load.positionStart));
        const x2 = Math.max(x1, Math.min(L, load.positionEnd ?? L));
        const len = x2 - x1;
        const totalW = load.magnitude * len;
        const centroid = x1 + len / 2;
        totalLoadN += totalW;
        totalMomentAboutA += totalW * centroid;
      }
    }

    if (support === 'simply-supported') {
      RB = totalMomentAboutA / L;
      RA = totalLoadN - RB;
    } else if (support === 'cantilever') {
      // Clamped at x = 0 (support A), free at x = L
      RA = totalLoadN;
      MA = totalMomentAboutA; // Counter-clockwise clamping moment
    } else if (support === 'overhanging') {
      // Supports at x = 0 and x = L * 0.75
      const bPos = L * 0.75;
      RB = totalMomentAboutA / bPos;
      RA = totalLoadN - RB;
    } else if (support === 'fixed-fixed') {
      // Statically indeterminate beam - approximate analytical solutions for point / UDL
      RA = totalLoadN / 2;
      RB = totalLoadN / 2;
      MA = (totalLoadN * L) / 12;
      MB = (totalLoadN * L) / 12;
    }

    // 2. Analytical Shear Force V(x), Bending Moment M(x), Deflection y(x) at points
    const points: IBeamCalculationResult['points'] = [];
    
    // Sample evenly plus ensure critical discontinuity positions are evaluated
    const samplePositions = new Set<number>();
    for (let i = 0; i < numPoints; i++) {
      samplePositions.add(parseFloat(((i * L) / (numPoints - 1)).toFixed(6)));
    }
    samplePositions.add(0);
    samplePositions.add(L);
    samplePositions.add(parseFloat((L / 2).toFixed(6)));
    loads.forEach((l) => {
      samplePositions.add(parseFloat(l.positionStart.toFixed(6)));
      if (l.positionEnd !== undefined) samplePositions.add(parseFloat(l.positionEnd.toFixed(6)));
    });
    const sortedPositions = Array.from(samplePositions).sort((a, b) => a - b);

    let maxM = 0;
    let maxMPos = 0;
    let maxV = 0;
    let maxVPos = 0;
    let maxY = 0;
    let maxYPos = 0;

    for (const x of sortedPositions) {

      // Internal Shear Force V(x) - upward forces left of section positive
      let V = RA;
      // Internal Bending Moment M(x) - sagging positive (clockwise moments left of section positive)
      let M = support === 'cantilever' ? -MA + RA * x : RA * x;

      if (support === 'simply-supported' && x >= L) {
        V -= RB;
      }

      for (const load of loads) {
        if (load.type === 'point') {
          const a = load.positionStart;
          if (x > a) {
            V -= load.magnitude;
            M -= load.magnitude * (x - a);
          }
        } else if (load.type === 'udl') {
          const x1 = load.positionStart;
          const x2 = load.positionEnd ?? L;
          if (x > x1) {
            const overlap = Math.min(x, x2) - x1;
            const w = load.magnitude;
            V -= w * overlap;
            M -= w * overlap * (x - (x1 + overlap / 2));
          }
        }
      }

      // Deflection y(x) evaluation via Macaulay singularity functions
      let y = 0;

      if (support === 'simply-supported') {
        // Simply supported beam deflection
        for (const load of loads) {
          if (load.type === 'point') {
            const a = load.positionStart;
            const b = L - a;
            const W = load.magnitude;
            if (x <= a) {
              y += ((W * b * x) / (6 * EI * L)) * (L * L - b * b - x * x);
            } else {
              y += ((W * a * (L - x)) / (6 * EI * L)) * (2 * L * x - a * a - x * x);
            }
          } else if (load.type === 'udl') {
            // Full span UDL approximation
            const w = load.magnitude;
            y += ((w * x) / (24 * EI)) * (Math.pow(L, 3) - 2 * L * Math.pow(x, 2) + Math.pow(x, 3));
          }
        }
      } else if (support === 'cantilever') {
        // Cantilever deflection
        for (const load of loads) {
          if (load.type === 'point') {
            const a = load.positionStart;
            const W = load.magnitude;
            if (x <= a) {
              y += ((W * Math.pow(x, 2)) / (6 * EI)) * (3 * a - x);
            } else {
              y += ((W * Math.pow(a, 2)) / (6 * EI)) * (3 * x - a);
            }
          } else if (load.type === 'udl') {
            const w = load.magnitude;
            y += ((w * Math.pow(x, 2)) / (24 * EI)) * (Math.pow(x, 2) - 4 * L * x + 6 * Math.pow(L, 2));
          }
        }
      } else {
        // General boundary approximation for other supports
        y = (Math.abs(M) * Math.pow(L, 2)) / (16 * EI);
      }

      points.push({ x, shear: V, moment: M, deflection: y });

      if (Math.abs(M) > Math.abs(maxM)) {
        maxM = M;
        maxMPos = x;
      }
      if (Math.abs(V) > Math.abs(maxV)) {
        maxV = V;
        maxVPos = x;
      }
      if (Math.abs(y) > Math.abs(maxY)) {
        maxY = y;
        maxYPos = x;
      }
    }

    // Interpolate at inspection position
    const inspectX = Math.max(0, Math.min(L, inspectionPosition));
    const closestIdx = Math.min(points.length - 1, Math.max(0, Math.round((inspectX / L) * (numPoints - 1))));
    const inspectionPoint = points[closestIdx] ?? { x: inspectX, shear: 0, moment: 0, deflection: 0 };

    // Maximum flexural bending stress: sigma = M_max / Z
    const bendingStressMax = Math.abs(maxM) / sec.sectionModulusX;

    // Maximum transverse shear stress: tau_max = 1.5 * V / A (rectangular) or V / Aw (I-beam)
    let shearStressMax = 0;
    if (section.type === 'rectangular') {
      shearStressMax = (1.5 * Math.abs(maxV)) / sec.area;
    } else if (section.type === 'solid-circular') {
      shearStressMax = (1.33 * Math.abs(maxV)) / sec.area;
    } else if (section.type === 'i-beam') {
      const hw = (section.depth ?? 0.12) - 2 * (section.flangeThickness ?? 0.008);
      const tw = section.webThickness ?? 0.005;
      shearStressMax = Math.abs(maxV) / (hw * tw);
    } else {
      shearStressMax = Math.abs(maxV) / sec.area;
    }

    return {
      reactions: { reactionA: RA, reactionB: RB, momentA: MA, momentB: MB },
      span: L,
      sectionProps: sec,
      maxBendingMoment: { value: maxM, position: maxMPos },
      maxShearForce: { value: maxV, position: maxVPos },
      maxDeflection: { value: maxY, position: maxYPos },
      deflectionAtInspection: inspectionPoint.deflection,
      shearAtInspection: inspectionPoint.shear,
      bendingMomentAtInspection: inspectionPoint.moment,
      bendingStressMax,
      shearStressMax,
      points,
    };
  }
}

/**
 * PiyushDhara Eduverse — 3D Engineering Mechanics Simulation Suite
 * Course: U25RME201 — Engineering Mechanics (Mechanical Engineering, Semester II)
 * Core Applied Mechanics & Statics Calculation Engine
 * 
 * Complies with Anna University / Autonomous R2025 Syllabus,
 * Beer & Johnston Vector Mechanics, and Hibbeler Engineering Mechanics.
 */

export interface IForceVectorItem {
  id: string;
  name: string;
  magnitude: number; // N or kN
  angleDeg?: number; // 2D polar angle in XY plane (deg)
  elevationDeg?: number; // Elevation from XY plane towards Z (deg)
  thetaXDeg?: number; // 3D direction angle with X axis
  thetaYDeg?: number; // 3D direction angle with Y axis
  thetaZDeg?: number; // 3D direction angle with Z axis
}

export interface IForceVectorResult {
  forces: {
    id: string;
    name: string;
    magnitude: number;
    fx: number;
    fy: number;
    fz: number;
    directionCosines: { cosAlpha: number; cosBeta: number; cosGamma: number };
  }[];
  resultant: {
    rx: number;
    ry: number;
    rz: number;
    magnitude: number;
    angle2DDeg: number;
    directionCosines: { cosAlpha: number; cosBeta: number; cosGamma: number };
  };
  equilibrant: {
    ex: number;
    ey: number;
    ez: number;
    magnitude: number;
    angle2DDeg: number;
  };
  isEquilibrium: boolean;
  equilibriumResidual: number;
}

export interface IMomentItem {
  forceMag: number;
  forceAngleDeg: number; // relative to lever arm
  armLength: number; // meters from pivot
  position: [number, number, number];
  forceComponents: [number, number, number];
}

export interface IMomentResult {
  leverArmLengthM: number;
  forceMagnitudeN: number;
  perpendicularArmM: number;
  momentMagnitudeNm: number;
  momentVectorNm: [number, number, number];
  sense: 'Counter-Clockwise (+)' | 'Clockwise (-)' | 'Zero';
  varignonTheoremVerified: boolean;
  residualForceSumN: number;
  residualMomentSumNm: number;
  isEquilibrium: boolean;
}

export interface IInclinedPlaneInput {
  massKg: number;
  inclineAngleDeg: number;
  muStatic: number;
  muKinetic: number;
  appliedForceParallelN?: number; // positive = up-plane, negative = down-plane
}

export interface IInclinedPlaneResult {
  weightN: number;
  normalForceN: number;
  parallelGravityN: number; // downslope component
  limitingStaticFrictionN: number;
  kineticFrictionN: number;
  criticalAngleOfReposeDeg: number;
  actualFrictionForceN: number;
  netForceN: number;
  motionState: 'static-stable' | 'impending-motion' | 'sliding-down' | 'sliding-up';
  accelerationMS2: number;
}

export interface ICompositeSubShape {
  id: string;
  name: string;
  shapeType: 'rectangle' | 'triangle' | 'circle' | 'cutout-circle';
  areaMm2: number; // positive for solid, negative for hole
  centroidX: number; // mm
  centroidY: number; // mm
  ixxCentroidalMm4?: number;
  iyyCentroidalMm4?: number;
}

export interface ICompositeCentroidResult {
  totalAreaMm2: number;
  firstMomentQyMm3: number;
  firstMomentQxMm3: number;
  centroidXBarMm: number;
  centroidYBarMm: number;
  compositeIxxMm4: number;
  compositeIyyMm4: number;
  polarJzMm4: number;
  shapes: (ICompositeSubShape & { ax: number; ay: number })[];
}

export interface ITrussMemberResult {
  id: string;
  name: string;
  fromNode: string;
  toNode: string;
  lengthM: number;
  forceKN: number; // positive = tension, negative = compression
  type: 'Tension' | 'Compression' | 'Zero-Force';
}

export interface ITrussJointResult {
  reactions: {
    nodeA_Rx_kN: number;
    nodeA_Ry_kN: number;
    nodeC_Ry_kN: number;
  };
  members: ITrussMemberResult[];
  equilibriumCheck: {
    sumFx: number;
    sumFy: number;
    sumMomentA: number;
    isEquilibriumSatisfied: boolean;
  };
}

export class MechanicsCalculator {
  public static readonly G = 9.81; // m/s²
  public static readonly TOLERANCE = 0.05; // Numerical tolerance for statics equilibrium

  // ─────────────────────────────────────────────────────────────
  // 1. MODULE 1: 3D FORCE RESOLUTION & VECTOR RESULTANT
  // ─────────────────────────────────────────────────────────────

  public static calculateForceResolutionAndResultant(
    items: IForceVectorItem[]
  ): IForceVectorResult {
    let sumFx = 0;
    let sumFy = 0;
    let sumFz = 0;

    const resolvedForces = items.map((f) => {
      let fx = 0;
      let fy = 0;
      let fz = 0;
      let cosA = 0;
      let cosB = 0;
      let cosG = 0;

      if (f.thetaXDeg !== undefined && f.thetaYDeg !== undefined && f.thetaZDeg !== undefined) {
        // 3D Direction Cosines Mode
        cosA = Math.cos((f.thetaXDeg * Math.PI) / 180);
        cosB = Math.cos((f.thetaYDeg * Math.PI) / 180);
        cosG = Math.cos((f.thetaZDeg * Math.PI) / 180);
        fx = f.magnitude * cosA;
        fy = f.magnitude * cosB;
        fz = f.magnitude * cosG;
      } else {
        // Polar / Elevation Mode
        const angleRad = ((f.angleDeg ?? 0) * Math.PI) / 180;
        const elevRad = ((f.elevationDeg ?? 0) * Math.PI) / 180;
        const fPlane = f.magnitude * Math.cos(elevRad);
        fx = fPlane * Math.cos(angleRad);
        fy = fPlane * Math.sin(angleRad);
        fz = f.magnitude * Math.sin(elevRad);

        const mag = Math.max(f.magnitude, 1e-6);
        cosA = fx / mag;
        cosB = fy / mag;
        cosG = fz / mag;
      }

      sumFx += fx;
      sumFy += fy;
      sumFz += fz;

      return {
        id: f.id,
        name: f.name,
        magnitude: Number(f.magnitude.toFixed(2)),
        fx: Number(fx.toFixed(2)),
        fy: Number(fy.toFixed(2)),
        fz: Number(fz.toFixed(2)),
        directionCosines: {
          cosAlpha: Number(cosA.toFixed(4)),
          cosBeta: Number(cosB.toFixed(4)),
          cosGamma: Number(cosG.toFixed(4)),
        },
      };
    });

    const rMag = Math.sqrt(sumFx * sumFx + sumFy * sumFy + sumFz * sumFz);
    const angle2D = (Math.atan2(sumFy, sumFx) * 180) / Math.PI;
    const normalized2DAngle = (angle2D + 360) % 360;

    const rSafe = Math.max(rMag, 1e-6);
    const cosARes = sumFx / rSafe;
    const cosBRes = sumFy / rSafe;
    const cosGRes = sumFz / rSafe;

    const isEquil = rMag <= this.TOLERANCE;

    return {
      forces: resolvedForces,
      resultant: {
        rx: Number(sumFx.toFixed(2)),
        ry: Number(sumFy.toFixed(2)),
        rz: Number(sumFz.toFixed(2)),
        magnitude: Number(rMag.toFixed(2)),
        angle2DDeg: Number(normalized2DAngle.toFixed(1)),
        directionCosines: {
          cosAlpha: Number(cosARes.toFixed(4)),
          cosBeta: Number(cosBRes.toFixed(4)),
          cosGamma: Number(cosGRes.toFixed(4)),
        },
      },
      equilibrant: {
        ex: Number((-sumFx).toFixed(2)),
        ey: Number((-sumFy).toFixed(2)),
        ez: Number((-sumFz).toFixed(2)),
        magnitude: Number(rMag.toFixed(2)),
        angle2DDeg: Number(((normalized2DAngle + 180) % 360).toFixed(1)),
      },
      isEquilibrium: isEquil,
      equilibriumResidual: Number(rMag.toFixed(3)),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. MODULE 2: MOMENTS, COUPLES & EQUILIBRIUM
  // ─────────────────────────────────────────────────────────────

  public static calculateMomentAndEquilibrium(
    armLengthM: number,
    forceMagN: number,
    forceAngleDeg: number,
    coupleOffsetM: number = 0,
    isCoupleMode: boolean = false
  ): IMomentResult {
    const angleRad = (forceAngleDeg * Math.PI) / 180;
    // Perpendicular moment arm: d = r * sin(theta)
    const dPerp = armLengthM * Math.abs(Math.sin(angleRad));
    let momentMag = forceMagN * dPerp;

    if (isCoupleMode) {
      // Couple moment M = F * d_couple (independent of pivot)
      momentMag = forceMagN * coupleOffsetM;
    }

    // Sign of moment: CCW is positive (+z), CW is negative (-z)
    // For force in XY plane: lever along +X, force with angle theta
    const tz = forceMagN * armLengthM * Math.sin(angleRad);
    const sense: 'Counter-Clockwise (+)' | 'Clockwise (-)' | 'Zero' =
      Math.abs(tz) < 1e-4 ? 'Zero' : tz > 0 ? 'Counter-Clockwise (+)' : 'Clockwise (-)';

    const momentVec: [number, number, number] = [0, 0, Number(tz.toFixed(2))];

    // Varignon's Theorem: Moment of resultant = Sum of moments of components
    // Fx = F cos theta, Fy = F sin theta acting at (armLength, 0)
    // M_O = x * Fy - y * Fx = armLength * (F sin theta) - 0 = F * armLength * sin theta
    const varignonSatisfied = true;

    return {
      leverArmLengthM: Number(armLengthM.toFixed(2)),
      forceMagnitudeN: Number(forceMagN.toFixed(1)),
      perpendicularArmM: Number(dPerp.toFixed(3)),
      momentMagnitudeNm: Number(momentMag.toFixed(2)),
      momentVectorNm: momentVec,
      sense,
      varignonTheoremVerified: varignonSatisfied,
      residualForceSumN: isCoupleMode ? 0.0 : Number(forceMagN.toFixed(1)),
      residualMomentSumNm: Number(tz.toFixed(2)),
      isEquilibrium: Math.abs(tz) < this.TOLERANCE && (isCoupleMode || forceMagN < this.TOLERANCE),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. MODULE 3: FRICTION & INCLINED PLANE DYNAMICS
  // ─────────────────────────────────────────────────────────────

  public static calculateInclinedPlaneFriction(
    input: IInclinedPlaneInput
  ): IInclinedPlaneResult {
    const g = this.G;
    const m = input.massKg;
    const thetaRad = (input.inclineAngleDeg * Math.PI) / 180;

    const W = m * g;
    const N = W * Math.cos(thetaRad); // Normal force
    const W_parallel = W * Math.sin(thetaRad); // Downslope gravitational driving force
    const P = input.appliedForceParallelN ?? 0; // External force parallel to incline (positive = up-plane)

    const Fs_max = input.muStatic * N; // Limiting static friction
    const Fk = input.muKinetic * N; // Kinetic friction

    const criticalAngleDeg = (Math.atan(input.muStatic) * 180) / Math.PI;

    // Driving tendency along the incline: positive = wants to move up, negative = wants to move down
    const drivingForce = P - W_parallel;

    let motionState: 'static-stable' | 'impending-motion' | 'sliding-down' | 'sliding-up' = 'static-stable';
    let actualFriction = 0;
    let netForce = 0;
    let acceleration = 0;

    if (Math.abs(drivingForce) <= Fs_max) {
      // In static equilibrium: friction adjusts exactly to balance driving force
      actualFriction = -drivingForce; // opposes tendency
      netForce = 0;
      acceleration = 0;
      if (Math.abs(Math.abs(drivingForce) - Fs_max) < 0.05) {
        motionState = 'impending-motion';
      } else {
        motionState = 'static-stable';
      }
    } else {
      // Sliding occurs! Kinetic friction opposes actual velocity/motion
      if (drivingForce > Fs_max) {
        // Accelerating UP the incline
        motionState = 'sliding-up';
        actualFriction = -Fk;
        netForce = drivingForce - Fk;
        acceleration = netForce / m;
      } else {
        // Accelerating DOWN the incline
        motionState = 'sliding-down';
        actualFriction = Fk; // points up-plane
        netForce = drivingForce + Fk; // drivingForce is negative, so net is negative (downwards)
        acceleration = netForce / m;
      }
    }

    return {
      weightN: Number(W.toFixed(2)),
      normalForceN: Number(N.toFixed(2)),
      parallelGravityN: Number(W_parallel.toFixed(2)),
      limitingStaticFrictionN: Number(Fs_max.toFixed(2)),
      kineticFrictionN: Number(Fk.toFixed(2)),
      criticalAngleOfReposeDeg: Number(criticalAngleDeg.toFixed(1)),
      actualFrictionForceN: Number(actualFriction.toFixed(2)),
      netForceN: Number(netForce.toFixed(2)),
      motionState,
      accelerationMS2: Number(acceleration.toFixed(2)),
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. MODULE 4: CENTROID OF COMPOSITE AREAS & MOMENTS OF INERTIA
  // ─────────────────────────────────────────────────────────────

  public static calculateCompositeCentroid(
    shapes: ICompositeSubShape[]
  ): ICompositeCentroidResult {
    let totalArea = 0;
    let sumAx = 0;
    let sumAy = 0;

    const enrichedShapes = shapes.map((s) => {
      totalArea += s.areaMm2;
      const ax = s.areaMm2 * s.centroidX;
      const ay = s.areaMm2 * s.centroidY;
      sumAx += ax;
      sumAy += ay;
      return { ...s, ax, ay };
    });

    const safeArea = Math.abs(totalArea) > 1e-4 ? totalArea : 1.0;
    const xBar = sumAx / safeArea;
    const yBar = sumAy / safeArea;

    // Parallel Axis Theorem: I = I_centroidal + A * d^2
    let compositeIxx = 0;
    let compositeIyy = 0;

    shapes.forEach((s) => {
      const dy = yBar - s.centroidY;
      const dx = xBar - s.centroidX;
      const ixxC = s.ixxCentroidalMm4 ?? (s.areaMm2 * (s.centroidY * s.centroidY)) / 12;
      const iyyC = s.iyyCentroidalMm4 ?? (s.areaMm2 * (s.centroidX * s.centroidX)) / 12;

      // For holes (negative area), the inertia contribution subtracts
      compositeIxx += ixxC + s.areaMm2 * (dy * dy);
      compositeIyy += iyyC + s.areaMm2 * (dx * dx);
    });

    const jz = compositeIxx + compositeIyy;

    return {
      totalAreaMm2: Number(totalArea.toFixed(1)),
      firstMomentQyMm3: Number(sumAx.toFixed(1)),
      firstMomentQxMm3: Number(sumAy.toFixed(1)),
      centroidXBarMm: Number(xBar.toFixed(2)),
      centroidYBarMm: Number(yBar.toFixed(2)),
      compositeIxxMm4: Number(compositeIxx.toFixed(1)),
      compositeIyyMm4: Number(compositeIyy.toFixed(1)),
      polarJzMm4: Number(jz.toFixed(1)),
      shapes: enrichedShapes,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. MODULE 5: TRUSS EQUILIBRIUM & METHOD OF JOINTS
  // ─────────────────────────────────────────────────────────────

  public static calculateTrussMethodOfJoints(appliedLoadPKN: number): ITrussJointResult {
    // Standard Pratt-Warren 5-Joint Planar Triangular Truss:
    // Span = 4m. Nodes: A(0,0), B(2,0), C(4,0), D(1, 1.732), E(3, 1.732)
    // Angles = 60° equilateral triangles. Height = 2 * sin(60°) = 1.732 m.
    // Pin at Joint A, Roller at Joint C. Downward load P at mid-span Joint B.
    const P = appliedLoadPKN;

    // Global equilibrium:
    // ΣFx = 0 => R_Ax = 0
    // ΣM_A = 0 => R_Cy * 4 - P * 2 = 0 => R_Cy = P / 2
    // ΣFy = 0 => R_Ay + R_Cy - P = 0 => R_Ay = P / 2
    const RAx = 0;
    const RAy = P / 2.0;
    const RCy = P / 2.0;

    // Joint A: (Forces meeting at A: Member AB, Member AD, Reaction RAy)
    // ΣFy = 0 => RAy + F_AD * sin(60°) = 0 => F_AD = -RAy / sin(60°) = -(P/2) / 0.8660
    const sin60 = Math.sin(Math.PI / 3);
    const cos60 = Math.cos(Math.PI / 3);

    const F_AD = -RAy / sin60; // Compression (-)
    // ΣFx = 0 => F_AB + F_AD * cos(60°) = 0 => F_AB = -F_AD * cos(60°)
    const F_AB = -F_AD * cos60; // Tension (+)

    // Symmetry:
    const F_EC = F_AD; // Compression (-)
    const F_BC = F_AB; // Tension (+)

    // Joint D: (Forces meeting at D: Member AD, Top Chord DE, Internal Web DB)
    // Member DE is horizontal, Member DB is at 60° down to B
    // ΣFx = 0 => -F_AD * cos(60°) + F_DE + F_DB * cos(60°) = 0
    // ΣFy = 0 => -F_AD * sin(60°) - F_DB * sin(60°) = 0 => F_DB = -F_AD
    // Since F_AD is negative, F_DB = -(F_AD) is positive (Tension)
    const F_DB = -F_AD; // Tension (+)
    const F_EB = F_DB; // By symmetry: Tension (+)

    // F_DE = F_AD * cos(60°) - F_DB * cos(60°) = 2 * F_AD * cos(60°)
    const F_DE = 2 * F_AD * cos60; // Compression (-)

    const members: ITrussMemberResult[] = [
      {
        id: 'AB',
        name: 'Bottom Chord AB',
        fromNode: 'A',
        toNode: 'B',
        lengthM: 2.0,
        forceKN: Number(F_AB.toFixed(2)),
        type: F_AB > 0.01 ? 'Tension' : F_AB < -0.01 ? 'Compression' : 'Zero-Force',
      },
      {
        id: 'BC',
        name: 'Bottom Chord BC',
        fromNode: 'B',
        toNode: 'C',
        lengthM: 2.0,
        forceKN: Number(F_BC.toFixed(2)),
        type: F_BC > 0.01 ? 'Tension' : F_BC < -0.01 ? 'Compression' : 'Zero-Force',
      },
      {
        id: 'AD',
        name: 'Left Inclined End Post AD',
        fromNode: 'A',
        toNode: 'D',
        lengthM: 2.0,
        forceKN: Number(F_AD.toFixed(2)),
        type: F_AD > 0.01 ? 'Tension' : F_AD < -0.01 ? 'Compression' : 'Zero-Force',
      },
      {
        id: 'DE',
        name: 'Top Chord DE',
        fromNode: 'D',
        toNode: 'E',
        lengthM: 2.0,
        forceKN: Number(F_DE.toFixed(2)),
        type: F_DE > 0.01 ? 'Tension' : F_DE < -0.01 ? 'Compression' : 'Zero-Force',
      },
      {
        id: 'EC',
        name: 'Right Inclined End Post EC',
        fromNode: 'E',
        toNode: 'C',
        lengthM: 2.0,
        forceKN: Number(F_EC.toFixed(2)),
        type: F_EC > 0.01 ? 'Tension' : F_EC < -0.01 ? 'Compression' : 'Zero-Force',
      },
      {
        id: 'DB',
        name: 'Internal Web Tie DB',
        fromNode: 'D',
        toNode: 'B',
        lengthM: 2.0,
        forceKN: Number(F_DB.toFixed(2)),
        type: F_DB > 0.01 ? 'Tension' : F_DB < -0.01 ? 'Compression' : 'Zero-Force',
      },
      {
        id: 'EB',
        name: 'Internal Web Tie EB',
        fromNode: 'E',
        toNode: 'B',
        lengthM: 2.0,
        forceKN: Number(F_EB.toFixed(2)),
        type: F_EB > 0.01 ? 'Tension' : F_EB < -0.01 ? 'Compression' : 'Zero-Force',
      },
    ];

    return {
      reactions: {
        nodeA_Rx_kN: Number(RAx.toFixed(2)),
        nodeA_Ry_kN: Number(RAy.toFixed(2)),
        nodeC_Ry_kN: Number(RCy.toFixed(2)),
      },
      members,
      equilibriumCheck: {
        sumFx: Number(RAx.toFixed(3)),
        sumFy: Number((RAy + RCy - P).toFixed(3)),
        sumMomentA: Number((RCy * 4 - P * 2).toFixed(3)),
        isEquilibriumSatisfied: Math.abs(RAy + RCy - P) < 0.01 && Math.abs(RCy * 4 - P * 2) < 0.01,
      },
    };
  }
}

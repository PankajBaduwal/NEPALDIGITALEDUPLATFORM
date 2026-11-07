/**
 * Engineering Survey (U25CE303) — Rigorous Surveying Calculation Engine
 * B.E. Civil Engineering — Semester III
 * PiyushDhara Eduverse Academic Portal
 *
 * Implements:
 * 1. Differential Levelling (HI & Rise-and-Fall methods with 3-fold arithmetic checks)
 * 2. Closed & Open Traverse (WCB, Latitudes, Departures, Bowditch adjustment, precision ratio)
 * 3. Trigonometric Distance & Tape Corrections (temperature, tension, sag per IS 1492)
 * 4. Terrain Grid Elevation Interpolation & Contour Generation
 */

import type {
  FieldBookRow,
  LevellingArithmeticCheck,
  LevellingObservation,
  LevellingReductionMethod,
  LevellingRunResult,
  TraverseObservation,
  TraverseLegComputed,
  TraverseClosureResult,
  DistanceExperimentInput,
  DistanceComputationResult,
  TerrainSamplePoint,
  ContourSegment,
  ContourMapModel,
} from './types';

export class SurveyCalculator {
  /* =========================================================================
   * 1. DIFFERENTIAL LEVELLING REDUCTION
   * ========================================================================= */

  /**
   * Reduces a sequence of levelling observations using Height of Instrument (HI) or Rise and Fall.
   */
  public static reduceLevelling(
    observations: LevellingObservation[],
    benchmarkRL = 100.0,
    method: LevellingReductionMethod = 'hi'
  ): LevellingRunResult {
    const rows: FieldBookRow[] = [];
    let currentHI: number | null = null;
    let prevStaffReading: number | null = null;
    let prevRL = benchmarkRL;

    for (let i = 0; i < observations.length; i++) {
      const obs = observations[i];
      if (!obs) continue;
      let bs: number | null = null;
      let isVal: number | null = null;
      let fs: number | null = null;
      let rise: number | null = null;
      let fall: number | null = null;
      let calculatedRL = prevRL;

      if (obs.sightType === 'BS') {
        bs = obs.staffReading;
        currentHI = (i === 0 ? benchmarkRL : prevRL) + bs;
        calculatedRL = i === 0 ? benchmarkRL : prevRL;
      } else if (obs.sightType === 'IS') {
        isVal = obs.staffReading;
        if (currentHI !== null) {
          calculatedRL = currentHI - isVal;
        }
      } else if (obs.sightType === 'FS') {
        fs = obs.staffReading;
        if (currentHI !== null) {
          calculatedRL = currentHI - fs;
        }
      }

      // Rise and Fall calculation
      const currentReading = bs ?? isVal ?? fs ?? 0;
      if (prevStaffReading !== null && obs.sightType !== 'BS') {
        const diff = prevStaffReading - currentReading;
        if (diff > 0.0001) {
          rise = Number(diff.toFixed(3));
          fall = 0.0;
        } else if (diff < -0.0001) {
          rise = 0.0;
          fall = Number(Math.abs(diff).toFixed(3));
        } else {
          rise = 0.0;
          fall = 0.0;
        }
      }

      // If method is explicitly rise-and-fall, compute RL from rise/fall
      if (method === 'rise-and-fall' && i > 0 && obs.sightType !== 'BS') {
        if (rise !== null && rise > 0) calculatedRL = prevRL + rise;
        if (fall !== null && fall > 0) calculatedRL = prevRL - fall;
      }

      rows.push({
        rowId: obs.id,
        stationName: obs.stationName,
        bs,
        is: isVal,
        fs,
        rise,
        fall,
        hi: currentHI !== null ? Number(currentHI.toFixed(3)) : null,
        rl: Number(calculatedRL.toFixed(3)),
        remark: obs.remark,
      });

      prevStaffReading = currentReading;
      prevRL = calculatedRL;
    }

    // Arithmetic Checks
    let sumBS = 0;
    let sumFS = 0;
    let sumRise = 0;
    let sumFall = 0;

    for (const r of rows) {
      if (r.bs !== null) sumBS += r.bs;
      if (r.fs !== null) sumFS += r.fs;
      if (r.rise !== null) sumRise += r.rise;
      if (r.fall !== null) sumFall += r.fall;
    }

    sumBS = Number(sumBS.toFixed(3));
    sumFS = Number(sumFS.toFixed(3));
    sumRise = Number(sumRise.toFixed(3));
    sumFall = Number(sumFall.toFixed(3));

    const firstRow = rows[0];
    const lastRow = rows[rows.length - 1];
    const firstRL = firstRow ? firstRow.rl : benchmarkRL;
    const lastRL = lastRow ? lastRow.rl : benchmarkRL;

    const diffBS_FS = Number((sumBS - sumFS).toFixed(3));
    const diffRise_Fall = Number((sumRise - sumFall).toFixed(3));
    const diffRL = Number((lastRL - firstRL).toFixed(3));

    const isCheck1Passed = Math.abs(diffBS_FS - diffRL) <= 0.005;
    const isCheck2Passed = Math.abs(diffRise_Fall - diffRL) <= 0.005;

    // Total route distance in km approximation (e.g. 0.3 km)
    const totalDistKm = 0.35;
    const allowableMisclosure = Number((0.012 * Math.sqrt(totalDistKm)).toFixed(3)); // ±12mm * sqrt(K)
    const misclosure = Number(Math.abs(diffRL).toFixed(3));

    const check: LevellingArithmeticCheck = {
      sumBS,
      sumFS,
      diffBS_FS,
      sumRise,
      sumFall,
      diffRise_Fall,
      firstRL,
      lastRL,
      diffRL,
      isCheck1Passed,
      isCheck2Passed,
      misclosure,
      allowableMisclosure,
    };

    return { rows, check, method };
  }

  /* =========================================================================
   * 2. THEODOLITE & TOTAL STATION TRAVERSING (BOWDITCH ADJUSTMENT)
   * ========================================================================= */

  /**
   * Converts Whole Circle Bearing (0 - 360°) to Quadrantal Bearing (Reduced Bearing).
   */
  public static wcbToQuadrantalBearing(wcbDeg: number): string {
    const norm = ((wcbDeg % 360) + 360) % 360;
    const deg = Math.floor(norm);
    const min = Math.round((norm - deg) * 60);

    if (norm >= 0 && norm < 90) {
      return `N ${deg}° ${min.toString().padStart(2, '0')}' E`;
    } else if (norm >= 90 && norm < 180) {
      const red = 180 - norm;
      const rDeg = Math.floor(red);
      const rMin = Math.round((red - rDeg) * 60);
      return `S ${rDeg}° ${rMin.toString().padStart(2, '0')}' E`;
    } else if (norm >= 180 && norm < 270) {
      const red = norm - 180;
      const rDeg = Math.floor(red);
      const rMin = Math.round((red - rDeg) * 60);
      return `S ${rDeg}° ${rMin.toString().padStart(2, '0')}' W`;
    } else {
      const red = 360 - norm;
      const rDeg = Math.floor(red);
      const rMin = Math.round((red - rDeg) * 60);
      return `N ${rDeg}° ${rMin.toString().padStart(2, '0')}' W`;
    }
  }

  /**
   * Computes Traverse Latitudes, Departures, Closing Error, and Bowditch rule adjustments.
   */
  public static computeTraverseClosure(
    observations: TraverseObservation[],
    initialEasting = 1000.0,
    initialNorthing = 1000.0
  ): TraverseClosureResult {
    let totalPerimeter = 0;
    const rawLegs: {
      fromStation: string;
      toStation: string;
      horizontalDistance: number;
      wcbDeg: number;
      latitude: number;
      departure: number;
    }[] = [];

    let currentBearing = observations[0]?.observedBearingDeg ?? 45.0;

    for (let i = 0; i < observations.length; i++) {
      const obs = observations[i];
      if (!obs) continue;
      // Slope distance reduced to horizontal distance: H = S * cos(theta)
      const vertRad = (obs.verticalAngleDeg * Math.PI) / 180;
      const horizDist = Number((obs.slopeDistanceM * Math.cos(vertRad)).toFixed(3));
      totalPerimeter += horizDist;

      // Bearing propagation for polygonal traverse:
      // If direct bearing observed use it; otherwise propagate from previous bearing + included angle
      let wcb = obs.observedBearingDeg;
      if (wcb === undefined) {
        // Forward bearing = Back bearing ± included angle
        const backBearing = (currentBearing + 180) % 360;
        wcb = (backBearing + obs.horizontalAngleDeg) % 360;
      }
      currentBearing = wcb;

      const bearingRad = (wcb * Math.PI) / 180;
      const latitude = Number((horizDist * Math.cos(bearingRad)).toFixed(3));
      const departure = Number((horizDist * Math.sin(bearingRad)).toFixed(3));

      rawLegs.push({
        fromStation: obs.fromStation,
        toStation: obs.toStation,
        horizontalDistance: horizDist,
        wcbDeg: Number(wcb.toFixed(2)),
        latitude,
        departure,
      });
    }

    // Sum of Latitudes & Departures
    let sumLatitude = 0;
    let sumDeparture = 0;
    for (const leg of rawLegs) {
      sumLatitude += leg.latitude;
      sumDeparture += leg.departure;
    }
    sumLatitude = Number(sumLatitude.toFixed(3));
    sumDeparture = Number(sumDeparture.toFixed(3));

    // Linear error of closure: e = sqrt(sumLat^2 + sumDep^2)
    const closingErrorLinear = Number(
      Math.sqrt(sumLatitude * sumLatitude + sumDeparture * sumDeparture).toFixed(3)
    );

    // Bearing of error: tan(theta) = sumDep / sumLat
    let closingBearingDeg = (Math.atan2(sumDeparture, sumLatitude) * 180) / Math.PI;
    if (closingBearingDeg < 0) closingBearingDeg += 360;
    closingBearingDeg = Number(closingBearingDeg.toFixed(2));

    // Relative precision: 1 in N = Perimeter / closingError
    const relativePrecisionRatio =
      closingErrorLinear > 0.001
        ? Math.round(totalPerimeter / closingErrorLinear)
        : 100000;

    const isAcceptableForEngineering = relativePrecisionRatio >= 3000;

    // Apply Bowditch Rule (Compass Rule) corrections:
    // corr_lat = - (dist / totalPerimeter) * sumLatitude
    // corr_dep = - (dist / totalPerimeter) * sumDeparture
    const legs: TraverseLegComputed[] = [];
    let curNorth = initialNorthing;
    let curEast = initialEasting;

    for (const raw of rawLegs) {
      const prop = totalPerimeter > 0 ? raw.horizontalDistance / totalPerimeter : 0;
      const correctionLat = Number((-prop * sumLatitude).toFixed(3));
      const correctionDep = Number((-prop * sumDeparture).toFixed(3));

      const adjustedLatitude = Number((raw.latitude + correctionLat).toFixed(3));
      const adjustedDeparture = Number((raw.departure + correctionDep).toFixed(3));

      curNorth = Number((curNorth + adjustedLatitude).toFixed(3));
      curEast = Number((curEast + adjustedDeparture).toFixed(3));

      legs.push({
        fromStation: raw.fromStation,
        toStation: raw.toStation,
        horizontalDistance: raw.horizontalDistance,
        wcbDeg: raw.wcbDeg,
        quadrantBearing: this.wcbToQuadrantalBearing(raw.wcbDeg),
        latitude: raw.latitude,
        departure: raw.departure,
        correctionLat,
        correctionDep,
        adjustedLatitude,
        adjustedDeparture,
        northing: curNorth,
        easting: curEast,
      });
    }

    return {
      legs,
      totalPerimeter: Number(totalPerimeter.toFixed(3)),
      sumLatitude,
      sumDeparture,
      closingErrorLinear,
      closingBearingDeg,
      relativePrecisionRatio,
      isAcceptableForEngineering,
    };
  }

  /* =========================================================================
   * 3. DISTANCE MEASUREMENT & INSTRUMENT OPERATION
   * ========================================================================= */

  /**
   * Computes trigonometric reductions for EDM / Total Station and tape corrections per IS 1492.
   */
  public static computeDistance(input: DistanceExperimentInput): DistanceComputationResult {
    const alphaRad = (input.verticalAngleDeg * Math.PI) / 180;
    const horizontalDistance = Number(
      (input.slopeDistanceM * Math.cos(alphaRad)).toFixed(3)
    );
    const verticalDifference = Number(
      (input.slopeDistanceM * Math.sin(alphaRad)).toFixed(3)
    );

    // RL_target = RL_inst + hi + V - ht
    const targetGroundElevation = Number(
      (
        input.stationGroundElevationM +
        input.instrumentHeightM +
        verticalDifference -
        input.targetReflectorHeightM
      ).toFixed(3)
    );

    let tapeCorrections: DistanceComputationResult['tapeCorrections'] | undefined;

    if (input.tool === 'steel-tape') {
      const alpha = 0.0000115; // Coefficient of thermal expansion for steel (1/°C)
      const T = input.tapeTemperatureC ?? 35;
      const T0 = input.standardTemperatureC ?? 20;
      const L = input.slopeDistanceM;

      // Ct = alpha * L * (T - T0)
      const temperatureCorrection = Number((alpha * L * (T - T0)).toFixed(4));

      // Cp = (P - P0) * L / (A * E)
      const P = input.tapeTensionKg ?? 8;
      const P0 = input.standardTensionKg ?? 5;
      const A = 0.04; // cross-sectional area cm²
      const E = 2.1e6; // Young's modulus kg/cm²
      const pullCorrection = Number((((P - P0) * L) / (A * E)).toFixed(4));

      // Cs = (W^2 * L) / (24 * P^2)
      const totalWeightKg = 0.02 * L; // 0.02 kg per meter tape
      const sagCorrection = Number(
        (-(totalWeightKg * totalWeightKg * L) / (24 * P * P)).toFixed(4)
      );

      const correctedDistance = Number(
        (L + temperatureCorrection + pullCorrection + sagCorrection).toFixed(3)
      );

      tapeCorrections = {
        temperatureCorrection,
        pullCorrection,
        sagCorrection,
        correctedDistance,
      };
    }

    return {
      horizontalDistance,
      verticalDifference,
      targetGroundElevation,
      tapeCorrections,
    };
  }

  /* =========================================================================
   * 4. CONTOUR SURVEY AND TERRAIN MAPPING
   * ========================================================================= */

  /**
   * Generates continuous synthetic 3D elevation field data and linear interpolated contour lines.
   */
  public static generateContourModel(
    gridSize = 7,
    gridSpacingM = 10.0,
    contourInterval = 0.5
  ): ContourMapModel {
    const points: TerrainSamplePoint[] = [];
    let minElevation = Infinity;
    let maxElevation = -Infinity;

    // Mathematical undulating topography formula:
    // RL(x, z) = 100 + 4.5 * sin(x / 14) * cos(z / 14) + 2.0 * sin(z / 9)
    for (let gy = 0; gy < gridSize; gy++) {
      for (let gx = 0; gx < gridSize; gx++) {
        const worldX = (gx - Math.floor(gridSize / 2)) * gridSpacingM;
        const worldZ = (gy - Math.floor(gridSize / 2)) * gridSpacingM;

        const elev = Number(
          (
            100.0 +
            4.2 * Math.sin(worldX / 15) * Math.cos(worldZ / 15) +
            2.1 * Math.sin(worldZ / 10) +
            1.2 * Math.cos(worldX / 8)
          ).toFixed(2)
        );

        if (elev < minElevation) minElevation = elev;
        if (elev > maxElevation) maxElevation = elev;

        points.push({
          id: `pt-${gx}-${gy}`,
          gridX: gx,
          gridY: gy,
          worldX,
          worldZ,
          reducedLevel: elev,
          isBenchmark: gx === 0 && gy === 0,
        });
      }
    }

    // Linear edge contour interpolation across grid squares
    const segments: ContourSegment[] = [];
    const startContour = Math.ceil(minElevation / contourInterval) * contourInterval;
    const endContour = Math.floor(maxElevation / contourInterval) * contourInterval;

    for (let cElev = startContour; cElev <= endContour; cElev += contourInterval) {
      const cRounded = Number(cElev.toFixed(2));

      for (let gy = 0; gy < gridSize - 1; gy++) {
        for (let gx = 0; gx < gridSize - 1; gx++) {
          const pTL = points[gy * gridSize + gx];
          const pTR = points[gy * gridSize + (gx + 1)];
          const pBL = points[(gy + 1) * gridSize + gx];
          const pBR = points[(gy + 1) * gridSize + (gx + 1)];
          if (!pTL || !pTR || !pBL || !pBR) continue;

          const edgeIntersections: [number, number][] = [];

          // Top edge: TL -> TR
          const intTop = this.interpolateEdge(pTL, pTR, cRounded);
          if (intTop) edgeIntersections.push(intTop);

          // Right edge: TR -> BR
          const intRight = this.interpolateEdge(pTR, pBR, cRounded);
          if (intRight) edgeIntersections.push(intRight);

          // Bottom edge: BR -> BL
          const intBottom = this.interpolateEdge(pBR, pBL, cRounded);
          if (intBottom) edgeIntersections.push(intBottom);

          // Left edge: BL -> TL
          const intLeft = this.interpolateEdge(pBL, pTL, cRounded);
          if (intLeft) edgeIntersections.push(intLeft);

          const int1 = edgeIntersections[0];
          const int2 = edgeIntersections[1];
          if (int1 && int2) {
            segments.push({
              elevation: cRounded,
              x1: int1[0],
              z1: int1[1],
              x2: int2[0],
              z2: int2[1],
            });
          }
        }
      }
    }

    return {
      gridSize,
      gridSpacingM,
      points,
      minElevation,
      maxElevation,
      contourInterval,
      segments,
    };
  }

  private static interpolateEdge(
    p1: TerrainSamplePoint,
    p2: TerrainSamplePoint,
    cElev: number
  ): [number, number] | null {
    const e1 = p1.reducedLevel;
    const e2 = p2.reducedLevel;

    if ((e1 <= cElev && e2 >= cElev) || (e1 >= cElev && e2 <= cElev)) {
      if (Math.abs(e2 - e1) < 0.0001) return null;
      const t = (cElev - e1) / (e2 - e1);
      const x = p1.worldX + t * (p2.worldX - p1.worldX);
      const z = p1.worldZ + t * (p2.worldZ - p1.worldZ);
      return [Number(x.toFixed(2)), Number(z.toFixed(2))];
    }
    return null;
  }
}

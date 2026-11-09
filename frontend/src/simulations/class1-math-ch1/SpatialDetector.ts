/**
 * SpatialDetector.ts
 * 3D Spatial Relationship Detection Engine for Class 1 Mathematics Chapter 1
 * Concepts: Inside (भित्र), Outside (बाहिर), Above (माथि), Below (तल)
 */
import * as THREE from 'three';

export type SpatialRelation = 'inside' | 'outside' | 'above' | 'below' | 'none';
export type SpatialTarget = 'house' | 'basket' | 'box' | 'table' | 'tree' | 'flower' | 'none';

export interface SpatialResult {
  relation: SpatialRelation;
  target: SpatialTarget;
  isClear: boolean;
  titleEn: string;
  titleNe: string;
  descriptionEn: string;
  descriptionNe: string;
}

export interface ZoneBounds {
  // House interior bounding box (in world coordinates)
  houseInterior: THREE.Box3;
  // House veranda bounding box
  houseVeranda: THREE.Box3;
  // Basket center and radius
  basketCenter: THREE.Vector3;
  basketRadius: number;
  basketRimY: number;
  // Toy box bounding box
  toyBoxInterior: THREE.Box3;
  // Table center and radius
  tableCenter: THREE.Vector3;
  tableRadius: number;
  tableTopY: number;
  tableBottomY: number;
  // Tree center and canopy bounds
  treeCenter: THREE.Vector3;
  treeRadius: number;
  treeCanopyBottomY: number;
  treeCanopyTopY: number;
  // Flower center
  flowerCenter: THREE.Vector3;
  flowerRadius: number;
  flowerY: number;
}

export const PLAYGROUND_ZONES: ZoneBounds = {
  // House center at (-7.5, 0, -3.5). Interior is roughly X: [-10.4, -4.6], Z: [-5.2, 0.8], Y: [0.1, 3.2]
  houseInterior: new THREE.Box3(
    new THREE.Vector3(-10.4, 0.05, -5.2),
    new THREE.Vector3(-4.6, 3.2, 0.8)
  ),
  // Veranda is outside in front of the house doorway
  houseVeranda: new THREE.Box3(
    new THREE.Vector3(-10.2, 0.05, 0.9),
    new THREE.Vector3(-4.8, 2.5, 2.7)
  ),
  // Woven Basket at (0.5, 0, 3.2)
  basketCenter: new THREE.Vector3(0.5, 0, 3.2),
  basketRadius: 0.95,
  basketRimY: 0.92,
  // Toy Box at (-2.2, 0, -0.8)
  toyBoxInterior: new THREE.Box3(
    new THREE.Vector3(-2.9, 0.05, -1.5),
    new THREE.Vector3(-1.5, 0.95, -0.1)
  ),
  // Table at (4.5, 0, 0.5)
  tableCenter: new THREE.Vector3(4.5, 0, 0.5),
  tableRadius: 1.65,
  tableTopY: 1.35,
  tableBottomY: 1.25,
  // Pine Tree at (7.5, 0, -3.5)
  treeCenter: new THREE.Vector3(7.5, 0, -3.5),
  treeRadius: 2.4,
  treeCanopyBottomY: 2.2,
  treeCanopyTopY: 5.6,
  // Large Garden Flower at (-1.5, 0, 2.2)
  flowerCenter: new THREE.Vector3(-1.5, 0, 2.2),
  flowerRadius: 1.3,
  flowerY: 0.75,
};

/**
 * Evaluates the 3D position of an object and determines its spatial relationship
 */
export function evaluateSpatialPosition(
  pos: THREE.Vector3,
  objectName: string = 'object',
  objectLabelEn: string = 'Object',
  objectLabelNe: string = 'वस्तु'
): SpatialResult {
  const z = PLAYGROUND_ZONES;

  // 1. Check Basket Containment (Inside vs Outside Basket)
  const distToBasketXZ = Math.hypot(pos.x - z.basketCenter.x, pos.z - z.basketCenter.z);
  if (distToBasketXZ <= z.basketRadius && pos.y <= z.basketRimY + 0.3) {
    return {
      relation: 'inside',
      target: 'basket',
      isClear: true,
      titleEn: 'Inside the Basket (भित्र)',
      titleNe: 'टोकरीभित्र (भित्र)',
      descriptionEn: `${objectLabelEn} is inside the woven basket.`,
      descriptionNe: `${objectLabelNe} बाँसको टोकरीभित्र छ।`,
    };
  }

  // 2. Check Toy Box Containment (Inside vs Outside Box)
  if (z.toyBoxInterior.containsPoint(pos)) {
    return {
      relation: 'inside',
      target: 'box',
      isClear: true,
      titleEn: 'Inside the Toy Box (भित्र)',
      titleNe: 'बाकसभित्र (भित्र)',
      descriptionEn: `${objectLabelEn} is inside the wooden toy box.`,
      descriptionNe: `${objectLabelNe} काठको बाकसभित्र छ।`,
    };
  }

  // 3. Check House Interior Containment (Inside vs Outside House)
  if (z.houseInterior.containsPoint(pos)) {
    return {
      relation: 'inside',
      target: 'house',
      isClear: true,
      titleEn: 'Inside the House (भित्र)',
      titleNe: 'घरभित्र (भित्र)',
      descriptionEn: `${objectLabelEn} is safely inside the village house.`,
      descriptionNe: `${objectLabelNe} परम्परागत घरभित्र छ।`,
    };
  }

  // 4. Check Table Spatial Relation (Above vs Below Table)
  const distToTableXZ = Math.hypot(pos.x - z.tableCenter.x, pos.z - z.tableCenter.z);
  if (distToTableXZ <= z.tableRadius) {
    if (pos.y >= z.tableTopY - 0.1) {
      return {
        relation: 'above',
        target: 'table',
        isClear: true,
        titleEn: 'Above the Table (माथि)',
        titleNe: 'टेबलमाथि (माथि)',
        descriptionEn: `${objectLabelEn} is placed above on top of the table.`,
        descriptionNe: `${objectLabelNe} काठको टेबलमाथि राखिएको छ।`,
      };
    } else if (pos.y <= z.tableBottomY) {
      return {
        relation: 'below',
        target: 'table',
        isClear: true,
        titleEn: 'Below the Table (तल)',
        titleNe: 'टेबलमुनि तल (तल)',
        descriptionEn: `${objectLabelEn} is placed below underneath the table.`,
        descriptionNe: `${objectLabelNe} टेबलको मुनि तल राखिएको छ।`,
      };
    }
  }

  // 5. Check Tree Spatial Relation (Above vs Below Tree)
  const distToTreeXZ = Math.hypot(pos.x - z.treeCenter.x, pos.z - z.treeCenter.z);
  if (distToTreeXZ <= z.treeRadius) {
    if (pos.y >= z.treeCanopyBottomY + 0.8) {
      return {
        relation: 'above',
        target: 'tree',
        isClear: true,
        titleEn: 'Above the Tree (माथि)',
        titleNe: 'रूखमाथि (माथि)',
        descriptionEn: `${objectLabelEn} is flying above the tree canopy.`,
        descriptionNe: `${objectLabelNe} हरियो रूखमाथि छ।`,
      };
    } else if (pos.y <= 1.2) {
      return {
        relation: 'below',
        target: 'tree',
        isClear: true,
        titleEn: 'Below the Tree (तल / मुनि)',
        titleNe: 'रूखमुनि तल (तल)',
        descriptionEn: `${objectLabelEn} is resting below the shade of the tree.`,
        descriptionNe: `${objectLabelNe} रूखको छहारीमुनि तल छ।`,
      };
    }
  }

  // 6. Check Garden Flower Spatial Relation (Above Flower)
  const distToFlowerXZ = Math.hypot(pos.x - z.flowerCenter.x, pos.z - z.flowerCenter.z);
  if (distToFlowerXZ <= z.flowerRadius && pos.y >= z.flowerY + 0.2) {
    return {
      relation: 'above',
      target: 'flower',
      isClear: true,
      titleEn: 'Above the Flower (माथि)',
      titleNe: 'फूलमाथि (माथि)',
      descriptionEn: `${objectLabelEn} is hovering above the colourful flower.`,
      descriptionNe: `${objectLabelNe} रङ्गीचङ्गी फूलमाथि छ।`,
    };
  }

  // 7. Check Veranda or Outside Lawn
  if (z.houseVeranda.containsPoint(pos)) {
    return {
      relation: 'outside',
      target: 'house',
      isClear: true,
      titleEn: 'Outside on the Veranda (बाहिर)',
      titleNe: 'घरबाहिर पिँढीमा (बाहिर)',
      descriptionEn: `${objectLabelEn} is outside the house on the veranda.`,
      descriptionNe: `${objectLabelNe} घरबाहिर पिँढीमा छ।`,
    };
  }

  // 8. General Outside in Garden
  return {
    relation: 'outside',
    target: 'house',
    isClear: true,
    titleEn: 'Outside in the Garden (बाहिर)',
    titleNe: 'घरबाहिर बगैँचामा (बाहिर)',
    descriptionEn: `${objectLabelEn} is outside in the open village garden.`,
    descriptionNe: `${objectLabelNe} घरबाहिर खुला बगैँचामा छ।`,
  };
}


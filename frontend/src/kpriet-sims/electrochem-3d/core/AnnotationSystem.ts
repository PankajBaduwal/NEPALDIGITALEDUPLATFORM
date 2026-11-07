/**
 * 3D-to-2D Projected Annotation & Leader Line System
 * Prevents label overlap with collision detection and leader line rendering.
 */

import * as THREE from 'three';
import type { ComponentInspectionData } from '../types';

export interface LabelItem {
  id: string;
  data: ComponentInspectionData;
  screenPos: { x: number; y: number; visible: boolean; depth: number };
  adjustedPos: { x: number; y: number };
  element: HTMLElement;
  lineElement: SVGLineElement;
  dotElement: SVGCircleElement;
}

export class AnnotationSystem {
  private container: HTMLElement;
  private camera: THREE.PerspectiveCamera;
  private items: Map<string, LabelItem> = new Map();
  private overlayElement: HTMLDivElement;
  private svgElement: SVGSVGElement;
  private isVisible: boolean = true;
  private onSelectCallback?: (item: ComponentInspectionData | null) => void;
  private selectedId: string | null = null;

  constructor(
    container: HTMLElement,
    camera: THREE.PerspectiveCamera,
    onSelect?: (item: ComponentInspectionData | null) => void
  ) {
    this.container = container;
    this.camera = camera;
    this.onSelectCallback = onSelect;

    // Overlay DOM container
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'electrochem-annotation-overlay';
    Object.assign(this.overlayElement.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: '15',
    });

    // SVG for leader lines
    this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svgElement.setAttribute('class', 'electrochem-leader-lines');
    Object.assign(this.svgElement.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'visible',
    });
    this.overlayElement.appendChild(this.svgElement);
    this.container.appendChild(this.overlayElement);
  }

  public registerComponent(data: ComponentInspectionData) {
    if (this.items.has(data.id)) return;

    // Create badge DOM element
    const badge = document.createElement('div');
    badge.className = 'electrochem-label-badge';
    badge.setAttribute('data-id', data.id);
    Object.assign(badge.style, {
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: '600',
      letterSpacing: '0.02em',
      color: '#e2e8f0',
      backgroundColor: 'rgba(15, 23, 42, 0.88)',
      border: '1px solid rgba(56, 189, 248, 0.4)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(6px)',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      pointerEvents: 'auto',
      transition: 'all 0.15s ease-out',
      userSelect: 'none',
    });
    badge.innerText = data.name;

    // Click handler for badge
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectComponent(data.id);
    });

    // Hover effects
    badge.addEventListener('mouseenter', () => {
      badge.style.borderColor = '#38bdf8';
      badge.style.backgroundColor = 'rgba(15, 23, 42, 0.98)';
      badge.style.transform = 'translate(-50%, -50%) scale(1.06)';
    });
    badge.addEventListener('mouseleave', () => {
      if (this.selectedId !== data.id) {
        badge.style.borderColor = 'rgba(56, 189, 248, 0.4)';
        badge.style.backgroundColor = 'rgba(15, 23, 42, 0.88)';
      }
      badge.style.transform = 'translate(-50%, -50%) scale(1.0)';
    });

    this.overlayElement.appendChild(badge);

    // Create SVG leader line and anchor circle
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', 'rgba(56, 189, 248, 0.6)');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-dasharray', '3,3');
    this.svgElement.appendChild(line);

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '3');
    dot.setAttribute('fill', '#38bdf8');
    dot.setAttribute('stroke', '#0f172a');
    dot.setAttribute('stroke-width', '1');
    this.svgElement.appendChild(dot);

    this.items.set(data.id, {
      id: data.id,
      data,
      screenPos: { x: 0, y: 0, visible: false, depth: 0 },
      adjustedPos: { x: 0, y: 0 },
      element: badge,
      lineElement: line,
      dotElement: dot,
    });
  }

  public selectComponent(id: string | null) {
    this.selectedId = id;
    this.items.forEach((item) => {
      if (item.id === id) {
        item.element.style.borderColor = '#fbbf24';
        item.element.style.color = '#fbbf24';
        item.element.style.boxShadow = '0 0 16px rgba(251, 191, 36, 0.5)';
        item.lineElement.setAttribute('stroke', '#fbbf24');
        item.lineElement.setAttribute('stroke-width', '2');
        item.dotElement.setAttribute('fill', '#fbbf24');
      } else {
        item.element.style.borderColor = 'rgba(56, 189, 248, 0.4)';
        item.element.style.color = '#e2e8f0';
        item.element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
        item.lineElement.setAttribute('stroke', 'rgba(56, 189, 248, 0.6)');
        item.lineElement.setAttribute('stroke-width', '1.5');
        item.dotElement.setAttribute('fill', '#38bdf8');
      }
    });

    const selectedData = id ? this.items.get(id)?.data || null : null;
    if (this.onSelectCallback) {
      this.onSelectCallback(selectedData);
    }
  }

  public setVisible(visible: boolean) {
    this.isVisible = visible;
    this.overlayElement.style.display = visible ? 'block' : 'none';
  }

  public update(width: number, height: number) {
    if (!this.isVisible || width <= 0 || height <= 0) return;

    const tempV = new THREE.Vector3();
    const activeList: LabelItem[] = [];

    // 1. Project 3D coordinates to 2D screen space
    this.items.forEach((item) => {
      // If component has a moving meshRef (e.g. during exploded view), use world position
      if (item.data.meshRef) {
        item.data.meshRef.getWorldPosition(tempV);
      } else {
        tempV.set(...item.data.anchorPosition);
      }

      // Check if behind camera
      const dir = tempV.clone().sub(this.camera.position).normalize();
      const dot = dir.dot(this.camera.getWorldDirection(new THREE.Vector3()));
      const isFacing = dot > 0.1;

      tempV.project(this.camera);

      // Check viewport bounds (-1 to 1)
      const inFrustum = isFacing && tempV.z < 1 && tempV.x >= -1.1 && tempV.x <= 1.1 && tempV.y >= -1.1 && tempV.y <= 1.1;

      if (inFrustum) {
        const sx = ((tempV.x + 1) / 2) * width;
        const sy = ((-tempV.y + 1) / 2) * height;
        item.screenPos = { x: sx, y: sy, visible: true, depth: tempV.z };
        item.adjustedPos = { x: sx, y: sy - 30 }; // default badge slightly above anchor
        activeList.push(item);
      } else {
        item.screenPos.visible = false;
        item.element.style.display = 'none';
        item.lineElement.style.display = 'none';
        item.dotElement.style.display = 'none';
      }
    });

    // 2. Anti-overlap relaxation pass
    // Sort active labels by Y coordinate
    activeList.sort((a, b) => a.adjustedPos.y - b.adjustedPos.y);

    const MIN_Y_GAP = 28;
    const MIN_X_GAP = 80;

    for (let i = 0; i < activeList.length; i++) {
      for (let j = i + 1; j < activeList.length; j++) {
        const a = activeList[i];
        const b = activeList[j];
        if (!a || !b) continue;
        const dx = Math.abs(a.adjustedPos.x - b.adjustedPos.x);
        const dy = Math.abs(a.adjustedPos.y - b.adjustedPos.y);

        if (dx < MIN_X_GAP && dy < MIN_Y_GAP) {
          // Push vertically to avoid overlap
          const overlap = MIN_Y_GAP - dy;
          b.adjustedPos.y += overlap;
        }
      }
    }

    // 3. Update DOM badges and SVG leader lines
    activeList.forEach((item) => {
      const ax = item.screenPos.x;
      const ay = item.screenPos.y;
      const bx = Math.max(50, Math.min(width - 50, item.adjustedPos.x));
      const by = Math.max(30, Math.min(height - 30, item.adjustedPos.y));

      item.element.style.display = 'block';
      item.element.style.left = `${bx}px`;
      item.element.style.top = `${by}px`;

      item.lineElement.style.display = 'block';
      item.lineElement.setAttribute('x1', `${ax}`);
      item.lineElement.setAttribute('y1', `${ay}`);
      item.lineElement.setAttribute('x2', `${bx}`);
      item.lineElement.setAttribute('y2', `${by + 10}`);

      item.dotElement.style.display = 'block';
      item.dotElement.setAttribute('cx', `${ax}`);
      item.dotElement.setAttribute('cy', `${ay}`);
    });
  }

  public dispose() {
    this.items.forEach((item) => {
      item.element.remove();
      item.lineElement.remove();
      item.dotElement.remove();
    });
    this.items.clear();
    this.svgElement.remove();
    this.overlayElement.remove();
  }
}

/**
 * KPRIET Engineering Mechanics Virtual Laboratory
 * Mechanics Annotation System
 *
 * Implements non-colliding lateral screen-space badge framing:
 * - Badges positioned on lateral margins leaving central 3D mechanical models unobstructed
 * - Pure white badge background (#ffffff), solid black bold text (#0f172a) in light mode
 * - Clean dashed SVG leader lines connecting badge edges to 3D anchor points
 * - Theme-aware (light/dark) with interactive selection and hover states
 */

import * as THREE from 'three';
import type { ComponentInspectionData } from './types';

interface LabelItem {
  id: string;
  data: ComponentInspectionData;
  screenPos: { x: number; y: number; visible: boolean; depth: number };
  adjustedPos: { x: number; y: number };
  element: HTMLDivElement;
  lineElement: SVGLineElement;
  dotElement: SVGCircleElement;
}

export class MechanicsAnnotationSystem {
  private container: HTMLElement;
  private domOverlay: HTMLDivElement;
  private svgElement: SVGSVGElement;
  private items = new Map<string, LabelItem>();
  private selectedId: string | null = null;
  private isVisible = true;
  private theme: 'light' | 'dark' = 'light';
  private onSelectCallback?: (id: string | null) => void;

  constructor(container: HTMLElement, onSelect?: (id: string | null) => void, theme: 'light' | 'dark' = 'light') {
    this.container = container;
    this.onSelectCallback = onSelect;
    this.theme = theme;

    // 1. Overlay container for HTML badges
    this.domOverlay = document.createElement('div');
    this.domOverlay.style.position = 'absolute';
    this.domOverlay.style.inset = '0';
    this.domOverlay.style.pointerEvents = 'none';
    this.domOverlay.style.zIndex = '15';
    this.domOverlay.style.overflow = 'hidden';
    this.container.appendChild(this.domOverlay);

    // 2. SVG container for connecting leader lines
    this.svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svgElement.style.position = 'absolute';
    this.svgElement.style.inset = '0';
    this.svgElement.style.width = '100%';
    this.svgElement.style.height = '100%';
    this.svgElement.style.pointerEvents = 'none';
    this.svgElement.style.zIndex = '14';
    this.container.appendChild(this.svgElement);
  }

  public setTheme(theme: 'light' | 'dark') {
    this.theme = theme;
    this.items.forEach((item) => this.applyBadgeStyle(item));
  }

  private applyBadgeStyle(item: LabelItem) {
    const isSelected = item.id === this.selectedId;
    const isLight = this.theme === 'light';

    if (isSelected) {
      item.element.style.borderColor = '#059669';
      item.element.style.color = '#059669';
      item.element.style.backgroundColor = isLight ? '#f0fdf4' : '#064e3b';
      item.element.style.boxShadow = '0 0 0 2px rgba(5, 150, 105, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)';
      item.element.style.fontWeight = '700';

      item.lineElement.setAttribute('stroke', '#059669');
      item.lineElement.setAttribute('stroke-width', '2');
      item.dotElement.setAttribute('fill', '#059669');
      item.dotElement.setAttribute('r', '4.5');
    } else {
      if (isLight) {
        item.element.style.borderColor = '#cbd5e1';
        item.element.style.color = '#0f172a';
        item.element.style.backgroundColor = '#ffffff';
        item.element.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.12)';
        item.element.style.fontWeight = '600';

        item.lineElement.setAttribute('stroke', '#64748b');
        item.lineElement.setAttribute('stroke-width', '1.5');
        item.dotElement.setAttribute('fill', '#059669');
        item.dotElement.setAttribute('stroke', '#ffffff');
        item.dotElement.setAttribute('r', '3.5');
      } else {
        item.element.style.borderColor = '#334155';
        item.element.style.color = '#f8fafc';
        item.element.style.backgroundColor = 'rgba(15, 23, 42, 0.92)';
        item.element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
        item.element.style.fontWeight = '500';

        item.lineElement.setAttribute('stroke', '#38bdf8');
        item.lineElement.setAttribute('stroke-width', '1.5');
        item.dotElement.setAttribute('fill', '#38bdf8');
        item.dotElement.setAttribute('stroke', '#0f172a');
        item.dotElement.setAttribute('r', '3.5');
      }
    }
  }

  public register(data: ComponentInspectionData) {
    if (this.items.has(data.id)) return;

    // Create badge DOM element
    const badge = document.createElement('div');
    badge.className = 'chem-annotation-badge';
    badge.style.position = 'absolute';
    badge.style.pointerEvents = 'auto';
    badge.style.cursor = 'pointer';
    badge.style.padding = '4px 9px';
    badge.style.borderRadius = '6px';
    badge.style.fontSize = '11px';
    badge.style.letterSpacing = '0.01em';
    badge.style.whiteSpace = 'nowrap';
    badge.style.border = '1px solid';
    badge.style.transition = 'transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease';
    badge.style.transform = 'translate(-50%, -50%)';
    badge.innerText = data.name;

    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectComponent(this.selectedId === data.id ? null : data.id);
    });

    badge.addEventListener('mouseenter', () => {
      if (this.selectedId !== data.id) {
        badge.style.borderColor = '#059669';
        badge.style.color = '#059669';
        badge.style.transform = 'translate(-50%, -50%) scale(1.05)';
        badge.style.boxShadow = '0 6px 18px rgba(5, 150, 105, 0.2), 0 2px 6px rgba(0, 0, 0, 0.08)';
      }
    });

    badge.addEventListener('mouseleave', () => {
      if (this.selectedId !== data.id) {
        this.applyBadgeStyle({
          id: data.id,
          data,
          screenPos: { x: 0, y: 0, visible: false, depth: 0 },
          adjustedPos: { x: 0, y: 0 },
          element: badge,
          lineElement: line,
          dotElement: dot,
        });
      }
      badge.style.transform = 'translate(-50%, -50%) scale(1.0)';
    });

    this.domOverlay.appendChild(badge);

    // Create SVG leader line and anchor circle
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-dasharray', '4,3');
    this.svgElement.appendChild(line);

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '3.5');
    dot.setAttribute('stroke-width', '1.5');
    this.svgElement.appendChild(dot);

    const item: LabelItem = {
      id: data.id,
      data,
      screenPos: { x: 0, y: 0, visible: false, depth: 0 },
      adjustedPos: { x: 0, y: 0 },
      element: badge,
      lineElement: line,
      dotElement: dot,
    };

    this.applyBadgeStyle(item);
    this.items.set(data.id, item);
  }

  public add(annotation: {
    id: string;
    title: string;
    text: string;
    worldPosition: THREE.Vector3;
    type?: 'info' | 'success' | 'warning' | 'danger';
    category?: string;
  }) {
    this.register({
      id: annotation.id,
      name: annotation.title,
      category: annotation.category || 'general',
      specifications: annotation.text,
      anchorPosition: [annotation.worldPosition.x, annotation.worldPosition.y, annotation.worldPosition.z],
    });
  }

  public selectComponent(id: string | null) {
    this.selectedId = id;
    this.items.forEach((item) => this.applyBadgeStyle(item));
    if (this.onSelectCallback) {
      this.onSelectCallback(id);
    }
  }

  public toggle(visible?: boolean) {
    this.isVisible = visible !== undefined ? visible : !this.isVisible;
    this.domOverlay.style.display = this.isVisible ? 'block' : 'none';
    this.svgElement.style.display = this.isVisible ? 'block' : 'none';
  }

  public clear() {
    this.items.forEach((item) => {
      item.element.remove();
      item.lineElement.remove();
      item.dotElement.remove();
    });
    this.items.clear();
    this.selectedId = null;
  }

  public update(camera: THREE.Camera) {
    if (!this.isVisible || this.items.size === 0) return;

    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;

    const tempV = new THREE.Vector3();
    const activeList: LabelItem[] = [];

    // 1. Project 3D coordinates to 2D screen space
    this.items.forEach((item) => {
      if (item.data.meshRef) {
        item.data.meshRef.getWorldPosition(tempV);
      } else if (item.data.anchorPosition) {
        tempV.set(item.data.anchorPosition[0], item.data.anchorPosition[1], item.data.anchorPosition[2]);
      } else {
        tempV.set(0, 0, 0);
      }

      tempV.project(camera);

      // Check if inside camera frustum and facing viewer
      if (tempV.z < 1 && tempV.x >= -1.1 && tempV.x <= 1.1 && tempV.y >= -1.1 && tempV.y <= 1.1) {
        const sx = ((tempV.x + 1) / 2) * w;
        const sy = ((-tempV.y + 1) / 2) * h;
        item.screenPos = { x: sx, y: sy, visible: true, depth: tempV.z };
        activeList.push(item);
      } else {
        item.screenPos.visible = false;
        item.element.style.display = 'none';
        item.lineElement.style.display = 'none';
        item.dotElement.style.display = 'none';
      }
    });

    if (activeList.length === 0) return;

    const centerX = w / 2;

    // 2. Lateral framing: Distribute labels to the left or right of the model
    activeList.sort((a, b) => a.screenPos.y - b.screenPos.y);

    const leftList: LabelItem[] = [];
    const rightList: LabelItem[] = [];

    activeList.forEach((item, index) => {
      const ax = item.screenPos.x;
      if (ax < centerX - 25) {
        leftList.push(item);
      } else if (ax > centerX + 25) {
        rightList.push(item);
      } else {
        if (index % 2 === 0) {
          leftList.push(item);
        } else {
          rightList.push(item);
        }
      }
    });

    const MIN_Y_GAP = 36;

    // Compute left side positions
    leftList.sort((a, b) => a.screenPos.y - b.screenPos.y);
    leftList.forEach((item, idx) => {
      const ax = item.screenPos.x;
      const ay = item.screenPos.y;
      const targetX = Math.max(90, Math.min(ax - 130, w * 0.35));
      let targetY = ay;

      if (idx > 0) {
        const prevY = leftList[idx - 1]!.adjustedPos.y;
        if (targetY - prevY < MIN_Y_GAP) {
          targetY = prevY + MIN_Y_GAP;
        }
      }
      item.adjustedPos = { x: targetX, y: Math.max(45, Math.min(h - 45, targetY)) };
    });

    // Compute right side positions
    rightList.sort((a, b) => a.screenPos.y - b.screenPos.y);
    rightList.forEach((item, idx) => {
      const ax = item.screenPos.x;
      const ay = item.screenPos.y;
      const targetX = Math.min(w - 90, Math.max(ax + 130, w * 0.65));
      let targetY = ay;

      if (idx > 0) {
        const prevY = rightList[idx - 1]!.adjustedPos.y;
        if (targetY - prevY < MIN_Y_GAP) {
          targetY = prevY + MIN_Y_GAP;
        }
      }
      item.adjustedPos = { x: targetX, y: Math.max(45, Math.min(h - 45, targetY)) };
    });

    // 3. Render badges, lines, and anchor dots
    activeList.forEach((item) => {
      const ax = item.screenPos.x;
      const ay = item.screenPos.y;
      const bx = item.adjustedPos.x;
      const by = item.adjustedPos.y;

      item.element.style.display = 'block';
      item.element.style.left = `${bx}px`;
      item.element.style.top = `${by}px`;

      const lineEndX = bx < ax ? bx + 45 : bx - 45;

      item.lineElement.style.display = 'block';
      item.lineElement.setAttribute('x1', `${ax}`);
      item.lineElement.setAttribute('y1', `${ay}`);
      item.lineElement.setAttribute('x2', `${lineEndX}`);
      item.lineElement.setAttribute('y2', `${by}`);

      item.dotElement.style.display = 'block';
      item.dotElement.setAttribute('cx', `${ax}`);
      item.dotElement.setAttribute('cy', `${ay}`);
    });
  }

  public dispose() {
    this.clear();
    this.domOverlay.remove();
    this.svgElement.remove();
  }
}

/**
 * 3D-to-2D Projected Annotation & Leader Line System
 * Prevents label overlap with smart lateral framing and high-contrast styling.
 */

import * as THREE from 'three';
import type { ComponentInspectionData } from './types';

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
  private theme: 'light' | 'dark' = 'light';

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
    this.overlayElement.className = 'chem-annotation-overlay';
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
    this.svgElement.setAttribute('class', 'chem-leader-lines');
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

  public setTheme(theme: 'light' | 'dark') {
    this.theme = theme;
    this.items.forEach((item) => {
      this.applyBadgeStyle(item);
    });
  }

  private applyBadgeStyle(item: LabelItem) {
    const isSelected = this.selectedId === item.id;
    const isLight = this.theme === 'light';

    if (isSelected) {
      Object.assign(item.element.style, {
        color: isLight ? '#047857' : '#34d399',
        backgroundColor: isLight ? '#ffffff' : '#064e3b',
        border: `2px solid ${isLight ? '#059669' : '#34d399'}`,
        boxShadow: isLight
          ? '0 0 0 3px rgba(16, 185, 129, 0.35), 0 6px 18px rgba(0, 0, 0, 0.16)'
          : '0 0 0 3px rgba(52, 211, 153, 0.35), 0 6px 18px rgba(0, 0, 0, 0.6)',
      });
      item.lineElement.setAttribute('stroke', isLight ? '#059669' : '#34d399');
      item.lineElement.setAttribute('stroke-width', '2');
      item.dotElement.setAttribute('fill', isLight ? '#059669' : '#34d399');
      item.dotElement.setAttribute('r', '4.5');
    } else {
      Object.assign(item.element.style, {
        color: isLight ? '#0f172a' : '#f8fafc',
        backgroundColor: isLight ? '#ffffff' : 'rgba(15, 23, 42, 0.92)',
        border: isLight ? '1.5px solid #cbd5e1' : '1px solid rgba(56, 189, 248, 0.4)',
        boxShadow: isLight
          ? '0 4px 12px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)'
          : '0 4px 12px rgba(0, 0, 0, 0.4)',
      });
      item.lineElement.setAttribute('stroke', isLight ? '#64748b' : 'rgba(56, 189, 248, 0.6)');
      item.lineElement.setAttribute('stroke-width', '1.5');
      item.dotElement.setAttribute('fill', isLight ? '#059669' : '#38bdf8');
      item.dotElement.setAttribute('r', '3.5');
    }
  }

  public register(data: ComponentInspectionData) {
    this.registerComponent(data);
  }

  public registerComponent(data: ComponentInspectionData) {
    if (this.items.has(data.id)) return;

    // Create badge DOM element
    const badge = document.createElement('div');
    badge.className = 'chem-label-badge';
    badge.setAttribute('data-id', data.id);
    Object.assign(badge.style, {
      position: 'absolute',
      transform: 'translate(-50%, -50%)',
      padding: '5px 12px',
      borderRadius: '8px',
      fontSize: '11px',
      fontWeight: '700',
      letterSpacing: '0.01em',
      color: '#0f172a', // Solid Black Text
      backgroundColor: '#ffffff', // Pure White Background
      border: '1.5px solid #cbd5e1',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      pointerEvents: 'auto',
      transition: 'transform 0.15s ease-out, box-shadow 0.15s ease-out, border-color 0.15s ease-out',
      userSelect: 'none',
      zIndex: '20',
    });
    badge.innerText = data.name;

    // Click handler for badge
    badge.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectComponent(data.id);
    });

    // Hover effects
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

    this.overlayElement.appendChild(badge);

    // Create SVG leader line and anchor circle
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', '#64748b');
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-dasharray', '4,3');
    this.svgElement.appendChild(line);

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '3.5');
    dot.setAttribute('fill', '#059669');
    dot.setAttribute('stroke', '#ffffff');
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

  public add(annotation: { id: string; text: string; position: THREE.Vector3; priority?: number }) {
    this.registerComponent({
      id: annotation.id,
      name: annotation.text,
      category: 'annotation',
      material: 'Scientific Annotation',
      scientificRole: annotation.text,
      specifications: '',
      anchorPosition: [annotation.position.x, annotation.position.y, annotation.position.z],
    });
  }

  public clear() {
    this.items.forEach((item) => {
      item.element.remove();
      item.lineElement.remove();
      item.dotElement.remove();
    });
    this.items.clear();
  }

  public selectItem(id: string | null) {
    this.selectComponent(id);
  }

  public selectComponent(id: string | null) {
    this.selectedId = id;
    this.items.forEach((item) => {
      this.applyBadgeStyle(item);
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

  public update(width?: number, height?: number) {
    const w = width ?? this.container.clientWidth;
    const h = height ?? this.container.clientHeight;
    if (!this.isVisible || w <= 0 || h <= 0) return;

    const tempV = new THREE.Vector3();
    const activeList: LabelItem[] = [];

    // 1. Project 3D coordinates to 2D screen space
    this.items.forEach((item) => {
      if (item.data.meshRef) {
        item.data.meshRef.getWorldPosition(tempV);
      } else {
        const [ax, ay, az] = item.data.anchorPosition;
        tempV.set(ax, ay, az);
      }

      // Check if behind camera
      const dir = tempV.clone().sub(this.camera.position).normalize();
      const dot = dir.dot(this.camera.getWorldDirection(new THREE.Vector3()));
      const isFacing = dot > 0.1;

      tempV.project(this.camera);

      // Check viewport bounds (-1 to 1)
      const inFrustum = isFacing && tempV.z < 1 && tempV.x >= -1.1 && tempV.x <= 1.1 && tempV.y >= -1.1 && tempV.y <= 1.1;

      if (inFrustum) {
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

    // 2. Lateral framing: Distribute labels to the left or right of the molecule
    // Sort items by vertical position first
    activeList.sort((a, b) => a.screenPos.y - b.screenPos.y);

    const leftList: LabelItem[] = [];
    const rightList: LabelItem[] = [];

    activeList.forEach((item, index) => {
      const ax = item.screenPos.x;
      // If distinctly on left or right, place accordingly; if centered, alternate
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

    // Compute left side positions
    const MIN_Y_GAP = 36;
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

      // Determine connect point on badge edge
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

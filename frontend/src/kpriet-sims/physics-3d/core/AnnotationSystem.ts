/**
 * KPRIET Engineering Physics Virtual Laboratory (U25RPH01)
 * 3D World-to-Screen Annotation Callout System
 */

import * as THREE from 'three';
import type { ComponentInspectionData } from './types';

export interface AnnotationItem {
  id: string;
  name: string;
  worldPosition: THREE.Vector3;
  element: HTMLDivElement;
  componentData?: ComponentInspectionData;
  visible: boolean;
}

export class AnnotationSystem {
  private container: HTMLElement;
  private camera: THREE.Camera;
  private annotationsLayer: HTMLDivElement;
  private annotations: Map<string, AnnotationItem> = new Map();
  private onSelectComponent?: (comp: ComponentInspectionData | null) => void;
  private isVisible: boolean = true;

  constructor(
    container: HTMLElement,
    camera: THREE.Camera,
    onSelectComponent?: (comp: ComponentInspectionData | null) => void
  ) {
    this.container = container;
    this.camera = camera;
    this.onSelectComponent = onSelectComponent;

    if (typeof document !== 'undefined') {
      this.annotationsLayer = document.createElement('div');
      this.annotationsLayer.className = 'physics-annotations-layer absolute inset-0 pointer-events-none overflow-hidden z-10';
      this.annotationsLayer.style.position = 'absolute';
      this.annotationsLayer.style.top = '0';
      this.annotationsLayer.style.left = '0';
      this.annotationsLayer.style.width = '100%';
      this.annotationsLayer.style.height = '100%';
      this.annotationsLayer.style.pointerEvents = 'none';

      if (this.container && typeof this.container.appendChild === 'function') {
        this.container.appendChild(this.annotationsLayer);
      }
    } else {
      this.annotationsLayer = { appendChild: () => {}, removeChild: () => {}, style: {} } as any;
    }
  }

  public register(
    id: string,
    name: string,
    pos: [number, number, number] | THREE.Vector3,
    componentData?: ComponentInspectionData
  ) {
    if (this.annotations.has(id)) {
      this.unregister(id);
    }

    const worldPos = pos instanceof THREE.Vector3 ? pos.clone() : new THREE.Vector3(...pos);

    const el = typeof document !== 'undefined'
      ? document.createElement('div')
      : ({
          addEventListener: () => {},
          removeEventListener: () => {},
          style: {},
          parentElement: null,
        } as any);

    el.className = 'physics-annotation-badge pointer-events-auto cursor-pointer transition-all duration-200 select-none';
    el.style.position = 'absolute';
    el.style.transform = 'translate(-50%, -100%)';
    el.style.display = this.isVisible ? 'flex' : 'none';
    el.style.alignItems = 'center';
    el.style.gap = '6px';
    el.style.padding = '4px 10px';
    el.style.borderRadius = '20px';
    el.style.fontSize = '11px';
    el.style.fontWeight = '600';
    el.style.fontFamily = 'Inter, system-ui, sans-serif';
    el.style.backgroundColor = 'rgba(15, 23, 42, 0.85)';
    el.style.backdropFilter = 'blur(6px)';
    el.style.color = '#38BDF8';
    el.style.border = '1px solid rgba(56, 189, 248, 0.4)';
    el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.35)';

    el.innerHTML = `
      <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#38BDF8;box-shadow:0 0 8px #38BDF8;"></span>
      <span>${name}</span>
    `;

    el.addEventListener('click', (e: any) => {
      e.stopPropagation?.();
      if (this.onSelectComponent && componentData) {
        this.onSelectComponent(componentData);
      }
    });

    el.addEventListener('mouseenter', () => {
      el.style.transform = 'translate(-50%, -105%) scale(1.08)';
      el.style.borderColor = '#059669';
      el.style.color = '#34D399';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(-50%, -100%) scale(1.0)';
      el.style.borderColor = 'rgba(56, 189, 248, 0.4)';
      el.style.color = '#38BDF8';
    });

    if (this.annotationsLayer && typeof this.annotationsLayer.appendChild === 'function') {
      this.annotationsLayer.appendChild(el);
    }

    this.annotations.set(id, {
      id,
      name,
      worldPosition: worldPos,
      element: el,
      componentData,
      visible: true,
    });
  }

  public setPosition(id: string, pos: [number, number, number] | THREE.Vector3) {
    const item = this.annotations.get(id);
    if (item) {
      if (pos instanceof THREE.Vector3) {
        item.worldPosition.copy(pos);
      } else {
        item.worldPosition.set(...pos);
      }
    }
  }

  public unregister(id: string) {
    const item = this.annotations.get(id);
    if (item) {
      if (item.element.parentElement) {
        item.element.parentElement.removeChild(item.element);
      }
      this.annotations.delete(id);
    }
  }

  public clear() {
    this.annotations.forEach((item) => {
      if (item.element.parentElement) {
        item.element.parentElement.removeChild(item.element);
      }
    });
    this.annotations.clear();
  }

  public setVisibility(visible: boolean) {
    this.isVisible = visible;
    this.annotations.forEach((item) => {
      item.element.style.display = visible ? 'flex' : 'none';
    });
  }

  public update() {
    if (!this.isVisible || this.annotations.size === 0) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    const tempV = new THREE.Vector3();

    this.annotations.forEach((item) => {
      tempV.copy(item.worldPosition);
      tempV.project(this.camera);

      // Behind the camera check
      if (tempV.z > 1.0) {
        item.element.style.display = 'none';
        return;
      }

      // Convert normalized device coords to screen pixels
      const x = (tempV.x * 0.5 + 0.5) * width;
      const y = (-(tempV.y * 0.5) + 0.5) * height;

      item.element.style.display = 'flex';
      item.element.style.left = `${x}px`;
      item.element.style.top = `${y}px`;
    });
  }

  public dispose() {
    this.clear();
    if (this.annotationsLayer.parentElement) {
      this.annotationsLayer.parentElement.removeChild(this.annotationsLayer);
    }
  }
}

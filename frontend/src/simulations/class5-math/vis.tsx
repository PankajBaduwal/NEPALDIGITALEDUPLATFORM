/**
 * Pure 2D Canvas & Vector Drawing Helpers for Class 5 & Class 6 Math Labs.
 * Replaces Three.js WebGL with high-performance, crisp 2D isometric and orthographic projection.
 */

export interface TextOpts {
  px?: number;
  w?: number;
  h?: number;
  bg?: string | null;
  border?: string;
  color?: string;
}

export interface DrawNode {
  type:
  | 'box'
  | 'tag'
  | 'rod'
  | 'disc'
  | 'sector'
  | 'poly'
  | 'outline'
  | 'cubeBlock'
  | 'tiles'
  | 'towers'
  | 'custom';
  data: any;
  zOrder: number;
}

export class Group2D {
  nodes: DrawNode[] = [];
  position = {
    x: 0,
    y: 0,
    z: 0,
    set(x: number, y: number, z: number) {
      this.x = x;
      this.y = y;
      this.z = z;
    },
    copy(p: { x: number; y: number; z: number }) {
      this.x = p.x;
      this.y = p.y;
      this.z = p.z;
    },
    clone() {
      return { ...this };
    },
    multiplyScalar(s: number) {
      this.x *= s;
      this.y *= s;
      this.z *= s;
      return this;
    },
  };
  rotation = {
    x: 0,
    y: 0,
    z: 0,
    copy(r: any) {
      this.x = r.x;
      this.y = r.y;
      this.z = r.z;
    },
  };
  children: any[] = [];

  clear() {
    this.nodes = [];
    this.children = [];
  }

  add(item: any) {
    this.children.push(item);
    if (item && item.__node) {
      this.nodes.push(item.__node);
    } else if (item && item.nodes) {
      this.nodes.push(...item.nodes);
    }
  }

  remove(item: any) {
    this.children = this.children.filter((c) => c !== item);
    this.nodes = this.nodes.filter((n) => n !== item?.__node);
  }
}

/** 3D-compatible Vector3 mock for scripts calling vector operations */
export class Vector3Mock {
  x: number;
  y: number;
  z: number;
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  add(v: Vector3Mock) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }
  divideScalar(s: number) {
    this.x /= s;
    this.y /= s;
    this.z /= s;
    return this;
  }
  multiplyScalar(s: number) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }
  distanceTo(v: Vector3Mock) {
    return Math.hypot(this.x - v.x, this.y - v.y, this.z - v.z);
  }
  clone() {
    return new Vector3Mock(this.x, this.y, this.z);
  }
  copy(v: Vector3Mock) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }
}

/** Drawing helpers for Class 5 & 6 */

export const PL9 = [
  '#ec4899',
  '#8b5cf6',
  '#3b82f6',
  '#0ea5e9',
  '#14b8a6',
  '#22c55e',
  '#eab308',
  '#f97316',
  '#ef4444',
];

export const box = (
  g: any,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  color: string,
  rough = 0.5,
  opacity = 1
) => {
  const node: DrawNode = {
    type: 'box',
    data: { w, h, d, x, y, z, color, opacity },
    zOrder: z,
  };
  const obj = {
    __node: node,
    position: { set(px: number, py: number, pz: number) { node.data.x = px; node.data.y = py; node.data.z = pz; } },
    userData: {},
  };
  g.add?.(obj);
  return obj;
};

export const tag = (
  g: any,
  text: string,
  x: number,
  y: number,
  z: number,
  scale = 2.2,
  o: TextOpts = {}
) => {
  const node: DrawNode = {
    type: 'tag',
    data: { text, x, y, z, scale, ...o },
    zOrder: z + 2,
  };
  const obj = {
    __node: node,
    position: { set(px: number, py: number, pz: number) { node.data.x = px; node.data.y = py; node.data.z = pz; } },
    userData: {},
  };
  g.add?.(obj);
  return obj;
};

export const rod = (
  g: any,
  a: [number, number, number],
  b: [number, number, number],
  color: string,
  th = 0.07
) => {
  const node: DrawNode = {
    type: 'rod',
    data: { a, b, color, th },
    zOrder: (a[2] + b[2]) / 2,
  };
  const obj = { __node: node, userData: {} };
  g.add?.(obj);
  return obj;
};

export const disc = (
  g: any,
  r: number,
  color: string,
  x = 0,
  y = 0.03,
  z = 0,
  opacity = 1
) => {
  const node: DrawNode = {
    type: 'disc',
    data: { r, color, x, y, z, opacity },
    zOrder: z - 1,
  };
  const obj = {
    __node: node,
    rotation: { x: 0 },
    position: { set(px: number, py: number, pz: number) { node.data.x = px; node.data.y = py; node.data.z = pz; } },
    userData: {},
  };
  g.add?.(obj);
  return obj;
};

export const sector = (
  g: any,
  r0: number,
  r1: number,
  a0: number,
  a1: number,
  color: string,
  x = 0,
  y = 0.05,
  z = 0,
  opacity = 0.9
) => {
  const node: DrawNode = {
    type: 'sector',
    data: { r0, r1, a0, a1, color, x, y, z, opacity },
    zOrder: z,
  };
  const obj = { __node: node, userData: {} };
  g.add?.(obj);
  return obj;
};

export const poly = (
  g: any,
  pts: [number, number][],
  color: string,
  y = 0.04,
  opacity = 1,
  thick = 0
) => {
  const node: DrawNode = {
    type: 'poly',
    data: { pts, color, y, opacity, thick },
    zOrder: 0,
  };
  const obj = { __node: node, userData: {} };
  g.add?.(obj);
  return obj;
};

export const outline = (
  g: any,
  pts: [number, number][],
  color: string,
  y = 0.12,
  th = 0.08
) => {
  const node: DrawNode = {
    type: 'outline',
    data: { pts, color, y, th },
    zOrder: 1,
  };
  const obj = { __node: node, userData: {} };
  g.add?.(obj);
  return obj;
};

export const cubeBlock = (
  g: any,
  l: number,
  b: number,
  h: number,
  color: string,
  u = 1,
  x = 0,
  z = 0,
  gap = 0.06
) => {
  const node: DrawNode = {
    type: 'cubeBlock',
    data: { l, b, h, color, u, x, z, gap },
    zOrder: z,
  };
  const obj = { __node: node, userData: {} };
  g.add?.(obj);
  return obj;
};

export const tiles = (
  g: any,
  cols: number,
  rows: number,
  color: string,
  u = 1,
  x = 0,
  z = 0,
  alt?: string
) => {
  const node: DrawNode = {
    type: 'tiles',
    data: { cols, rows, color, u, x, z, alt },
    zOrder: z - 2,
  };
  const obj = { __node: node, userData: {} };
  g.add?.(obj);
  return obj;
};

export const towers = (
  g: any,
  digits: number[],
  colors: string[],
  names: string[],
  u = 0.5
) => {
  const node: DrawNode = {
    type: 'towers',
    data: { digits, colors, names, u },
    zOrder: 0,
  };
  const obj = { __node: node, userData: {} };
  g.add?.(obj);
  return obj;
};

export const customDraw = (
  g: any,
  drawFn: (
    ctx: CanvasRenderingContext2D,
    toScreen: (x: number, y: number, z: number) => [number, number],
    scale: number
  ) => void,
  zOrder = 0
) => {
  const node: DrawNode = {
    type: 'custom',
    data: { draw: drawFn },
    zOrder,
  };
  const obj = { __node: node, userData: {} };
  g.add?.(obj);
  return obj;
};

/**
 * 2D Canvas Renderer for the above scene graph.
 * Projects world coordinates onto a crisp 2D canvas context.
 */
export function renderScene2D(ctx: CanvasRenderingContext2D, width: number, height: number, group: Group2D) {
  ctx.clearRect(0, 0, width, height);

  // Background subtle grid
  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 1;
  const gridSize = 30;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const cx = width / 2;
  const cy = height * 0.58;
  const scale = Math.min(width, height) / 18;

  // Project (x, y, z) into 2D isometric / orthographic
  const toScreen = (x: number, y: number, z: number) => {
    // Isometric angle: 30 degrees
    const sx = cx + (x - z * 0.45) * scale;
    const sy = cy - y * scale + z * 0.25 * scale;
    return [sx, sy];
  };

  // Sort nodes by depth (zOrder back to front)
  const sortedNodes = [...group.nodes].sort((a, b) => a.zOrder - b.zOrder);

  for (const node of sortedNodes) {
    const { type, data } = node;

    if (type === 'box') {
      const [sx, sy] = toScreen(data.x, data.y, data.z);
      const bw = data.w * scale;
      const bh = data.h * scale;
      ctx.fillStyle = data.color;
      ctx.globalAlpha = data.opacity ?? 1;
      ctx.fillRect(sx - bw / 2, sy - bh / 2, bw, bh);
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sx - bw / 2, sy - bh / 2, bw, bh);
      ctx.globalAlpha = 1;
    } else if (type === 'rod') {
      const [ax, ay] = toScreen(data.a[0], data.a[1], data.a[2]);
      const [bx, by] = toScreen(data.b[0], data.b[1], data.b[2]);
      ctx.strokeStyle = data.color;
      ctx.lineWidth = Math.max(2, data.th * scale);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    } else if (type === 'disc') {
      const [sx, sy] = toScreen(data.x, data.y, data.z);
      const rad = data.r * scale;
      ctx.fillStyle = data.color;
      ctx.globalAlpha = data.opacity ?? 1;
      ctx.beginPath();
      ctx.ellipse(sx, sy, rad, rad * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (type === 'sector') {
      const [sx, sy] = toScreen(data.x, data.y, data.z);
      const rad1 = data.r1 * scale;
      ctx.fillStyle = data.color;
      ctx.globalAlpha = data.opacity ?? 0.9;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.arc(sx, sy, rad1, -data.a1, -data.a0);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (type === 'poly') {
      ctx.fillStyle = data.color;
      ctx.globalAlpha = data.opacity ?? 1;
      ctx.beginPath();
      data.pts.forEach(([px, pz]: [number, number], idx: number) => {
        const [sx, sy] = toScreen(px, data.y, pz);
        if (idx === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (type === 'outline') {
      ctx.strokeStyle = data.color;
      ctx.lineWidth = Math.max(2, data.th * scale);
      ctx.beginPath();
      data.pts.forEach(([px, pz]: [number, number], idx: number) => {
        const [sx, sy] = toScreen(px, data.y, pz);
        if (idx === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.closePath();
      ctx.stroke();
    } else if (type === 'tiles') {
      const { cols, rows, color, u, x, z, alt } = data;
      const tw = u * scale;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const wx = x + (c - (cols - 1) / 2) * u;
          const wz = z + (r - (rows - 1) / 2) * u;
          const [sx, sy] = toScreen(wx, 0, wz);
          ctx.fillStyle = alt && (c + r) % 2 === 0 ? alt : color;
          ctx.fillRect(sx - tw / 2, sy - tw / 4, tw * 0.95, tw * 0.5);
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.strokeRect(sx - tw / 2, sy - tw / 4, tw * 0.95, tw * 0.5);
        }
      }
    } else if (type === 'cubeBlock') {
      const { l, b, h, color, u, x, z } = data;
      const [sx, sy] = toScreen(x, (h * u) / 2, z);
      const bw = l * u * scale;
      const bh = h * u * scale;
      ctx.fillStyle = color;
      ctx.fillRect(sx - bw / 2, sy - bh / 2, bw, bh);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx - bw / 2, sy - bh / 2, bw, bh);
    } else if (type === 'towers') {
      const { digits, colors, names, u } = data;
      const n = digits.length;
      const gap = u * 2.3 * scale;
      const startX = cx - ((n - 1) / 2) * gap;

      digits.forEach((d: number, cIdx: number) => {
        const tx = startX + cIdx * gap;
        const ty = cy + 40;
        const col = colors[cIdx % colors.length];

        // Pillar Base
        ctx.fillStyle = col;
        ctx.fillRect(tx - 18, ty, 36, 10);

        // Vertical Rod
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(tx - 3, ty - 120, 6, 120);

        // Stacked Beads
        for (let k = 0; k < d; k++) {
          const by = ty - 12 - k * 12;
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.roundRect(tx - 14, by, 28, 10, 4);
          ctx.fill();
        }

        // Top Digit Bubble
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(tx - 16, ty - 150, 32, 26, 6);
        ctx.fill();
        ctx.strokeStyle = col;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = col;
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(d), tx, ty - 132);

        // Bottom Place Name Label
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(names[cIdx] || '', tx, ty + 24);
      });
    } else if (type === 'tag') {
      const [sx, sy] = toScreen(data.x, data.y, data.z);
      const fontSize = Math.max(12, Math.min(22, (data.scale || 1.8) * 8.5));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'center';
      const textWidth = ctx.measureText(data.text).width;

      if (data.bg) {
        ctx.fillStyle = data.bg;
        ctx.beginPath();
        ctx.roundRect(sx - textWidth / 2 - 8, sy - fontSize, textWidth + 16, fontSize + 8, 6);
        ctx.fill();
        if (data.border) {
          ctx.strokeStyle = data.border;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      ctx.fillStyle = data.color || '#0F172A';
      ctx.fillText(data.text, sx, sy - 2);
    } else if (type === 'custom') {
      if (typeof data.draw === 'function') {
        data.draw(ctx, toScreen, scale);
      }
    }
  }
}

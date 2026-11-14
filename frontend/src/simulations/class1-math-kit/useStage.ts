import { RefObject, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * A ready-made 3D stage for the Class 1 simulations: bright sky, soft light, a round meadow, a gentle
 * orbit camera (drag to look around, pinch/scroll to zoom), tap picking and tiny tweens.
 */
export type FrameFn = (dt: number, t: number) => void;

export interface StageCtx {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  el: HTMLElement;
  /** Called every frame with the seconds since the last frame and the total time. */
  onFrame(fn: FrameFn): void;
  /** A tap or click (not a camera drag). `objs()` returns what can be hit; the callback gets the nearest hit or null. */
  onTap(objs: () => THREE.Object3D[], cb: (hit: THREE.Intersection | null, ev: PointerEvent) => void): void;
  /** Animate 0 → 1 over `ms`, calling `step(k)`; `done` runs at the end. */
  tween(ms: number, step: (k: number) => void, done?: () => void, ease?: (k: number) => number): void;
  /** Glide the camera. */
  moveCamera(pos: [number, number, number], target?: [number, number, number], ms?: number): void;
}

export const ease = {
  out: (k: number) => 1 - Math.pow(1 - k, 3),
  inOut: (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  back: (k: number) => 1 + 2.70158 * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2),
  bounce: (k: number) => {
    const n = 7.5625, d = 2.75;
    if (k < 1 / d) return n * k * k;
    if (k < 2 / d) return n * (k -= 1.5 / d) * k + 0.75;
    if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + 0.9375;
    return n * (k -= 2.625 / d) * k + 0.984375;
  },
};

export interface StageOptions {
  /** sky colour, default soft blue */
  sky?: number;
  ground?: number | null;
  camera?: [number, number, number];
  target?: [number, number, number];
  minDistance?: number;
  maxDistance?: number;
}

export function useStage(ref: RefObject<HTMLDivElement | null>, setup: (ctx: StageCtx) => void | (() => void), deps: any[] = [], opts: StageOptions = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(opts.sky ?? 0xbfe6ff);
    scene.fog = new THREE.Fog(opts.sky ?? 0xbfe6ff, 28, 70);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    const cam = opts.camera ?? [0, 7, 13];
    camera.position.set(...cam);
    const tgt = opts.target ?? [0, 1.2, 0];

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'none';
    el.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...tgt);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.maxPolarAngle = Math.PI / 2.08;
    controls.minDistance = opts.minDistance ?? 5;
    controls.maxDistance = opts.maxDistance ?? 26;
    controls.update();

    // light
    scene.add(new THREE.HemisphereLight(0xffffff, 0x9bd0a0, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 1.05);
    sun.position.set(6, 12, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    const sc = sun.shadow.camera as THREE.OrthographicCamera;
    sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 40;
    scene.add(sun);

    if (opts.ground !== null) {
      const meadow = new THREE.Mesh(
        new THREE.CircleGeometry(24, 64),
        new THREE.MeshStandardMaterial({ color: opts.ground ?? 0x9be38b, roughness: 1 })
      );
      meadow.rotation.x = -Math.PI / 2;
      meadow.receiveShadow = true;
      scene.add(meadow);
    }

    const frames: FrameFn[] = [];
    const tweens: { t0: number; ms: number; step: (k: number) => void; done?: () => void; ease: (k: number) => number }[] = [];
    const taps: { objs: () => THREE.Object3D[]; cb: (hit: THREE.Intersection | null, ev: PointerEvent) => void }[] = [];
    const clock = new THREE.Clock();
    let raf = 0;
    let alive = true;

    const resize = () => {
      const w = el.clientWidth || 800;
      const h = el.clientHeight || 500;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = w / h;
      // keep the scene in view on tall (phone) screens
      camera.fov = w / h < 1 ? 60 : 45;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let down: { x: number; y: number; t: number } | null = null;
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved > 6) return; // that was a camera drag
      const rect = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      for (let i = taps.length - 1; i >= 0; i--) {
        const hits = ray.intersectObjects(taps[i].objs(), true);
        taps[i].cb(hits[0] || null, e);
      }
    };
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);

    const now = () => performance.now();
    const ctx: StageCtx = {
      scene, camera, renderer, controls, el,
      onFrame: (fn) => { frames.push(fn); },
      onTap: (objs, cb) => { taps.push({ objs, cb }); },
      tween: (ms, step, done, easing = ease.out) => { tweens.push({ t0: now(), ms: Math.max(1, ms), step, done, ease: easing }); },
      moveCamera: (pos, target, ms = 700) => {
        const p0 = camera.position.clone();
        const t0 = controls.target.clone();
        const p1 = new THREE.Vector3(...pos);
        const t1 = target ? new THREE.Vector3(...target) : t0.clone();
        ctx.tween(ms, (k) => { camera.position.lerpVectors(p0, p1, k); controls.target.lerpVectors(t0, t1, k); controls.update(); }, undefined, ease.inOut);
      },
    };

    const cleanupUser = setup(ctx);

    const loop = () => {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      const tn = now();
      for (let i = tweens.length - 1; i >= 0; i--) {
        const tw = tweens[i];
        const k = Math.min(1, (tn - tw.t0) / tw.ms);
        tw.step(tw.ease(k));
        if (k >= 1) { tweens.splice(i, 1); tw.done?.(); }
      }
      for (const f of frames) f(dt, t);
      controls.update();
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointerup', onUp);
      if (typeof cleanupUser === 'function') cleanupUser();
      controls.dispose();
      scene.traverse((o: any) => {
        if (o.geometry) o.geometry.dispose?.();
        const m = o.material;
        if (m) (Array.isArray(m) ? m : [m]).forEach((x: any) => { x.map?.dispose?.(); x.dispose?.(); });
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

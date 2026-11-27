/**
 * ThreeContainer.tsx
 * High-performance, responsive React Three.js viewport container
 * with automated shadow mapping, soft lighting presets, smooth orbit controls,
 * and leak-free resource cleanup.
 */
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type LightingPreset = 'laboratory' | 'nature' | 'space' | 'underwater' | 'electronics' | 'matter';

export interface ThreeContainerState {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  container: HTMLDivElement;
  clock: THREE.Clock;
}

interface ThreeContainerProps {
  preset?: LightingPreset;
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  enableOrbit?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onSetup: (state: ThreeContainerState) => (() => void) | void;
  onAnimate?: (state: ThreeContainerState & { delta: number }) => void;
  onClick?: (event: MouseEvent, state: ThreeContainerState) => void;
}

export const ThreeContainer: React.FC<ThreeContainerProps> = ({
  preset = 'laboratory',
  cameraPosition = [0, 5, 12],
  cameraTarget = [0, 0, 0],
  enableOrbit = true,
  className = '',
  style = {},
  onSetup,
  onAnimate,
  onClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Keep references to animation & click handlers fresh across React re-renders
  const onAnimateRef = useRef(onAnimate);
  const onClickRef = useRef(onClick);
  useEffect(() => {
    onAnimateRef.current = onAnimate;
  }, [onAnimate]);
  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 500;

    // ── 1. RENDERER SETUP ──────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // ── 2. SCENE & CAMERA ──────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(...cameraPosition);
    camera.lookAt(new THREE.Vector3(...cameraTarget));

    // ── 3. ATMOSPHERIC LIGHTING & PRESETS ──────────────────────────────────
    const targetVec = new THREE.Vector3(...cameraTarget);

    if (preset === 'laboratory') {
      scene.background = new THREE.Color(0xf0fdf4); // Clean modern mint/ivory
      const ambLight = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight.position.set(8, 14, 10);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 1024;
      dirLight.shadow.mapSize.height = 1024;
      dirLight.shadow.bias = -0.0005;
      scene.add(dirLight);

      // Floor Shadow receiver
      const floorMat = new THREE.ShadowMaterial({ opacity: 0.12 });
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -0.02;
      floor.receiveShadow = true;
      scene.add(floor);
    } else if (preset === 'nature') {
      scene.background = new THREE.Color(0xecfdf5); // Fresh sky ambient
      scene.fog = new THREE.FogExp2(0xecfdf5, 0.015);

      const ambLight = new THREE.AmbientLight(0xdcfce7, 0.9);
      scene.add(ambLight);

      const sunLight = new THREE.DirectionalLight(0xfef08a, 1.4);
      sunLight.position.set(12, 18, 8);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      scene.add(sunLight);

      // Lush ground plane
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.05;
      ground.receiveShadow = true;
      scene.add(ground);
    } else if (preset === 'space') {
      scene.background = new THREE.Color(0x030712); // Deep cosmos

      const ambLight = new THREE.AmbientLight(0x1e293b, 0.4);
      scene.add(ambLight);

      const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
      sunLight.position.set(15, 6, 12);
      scene.add(sunLight);

      // Starfield particles
      const starGeo = new THREE.BufferGeometry();
      const starCoords = [];
      for (let i = 0; i < 400; i++) {
        starCoords.push((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80);
      }
      starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
      const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, transparent: true, opacity: 0.8 });
      const stars = new THREE.Points(starGeo, starMat);
      scene.add(stars);
    } else if (preset === 'electronics') {
      scene.background = new THREE.Color(0x0f172a); // Deep modern lab slate
      const ambLight = new THREE.AmbientLight(0x94a3b8, 0.7);
      scene.add(ambLight);

      const spotLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
      spotLight.position.set(5, 12, 8);
      spotLight.castShadow = true;
      scene.add(spotLight);

      // Workbench grid
      const grid = new THREE.GridHelper(30, 30, 0x0284c7, 0x1e293b);
      grid.position.y = 0;
      scene.add(grid);
    } else if (preset === 'matter') {
      scene.background = new THREE.Color(0x0b132b);
      const ambLight = new THREE.AmbientLight(0x48cae4, 0.6);
      scene.add(ambLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight.position.set(8, 10, 8);
      scene.add(dirLight);

      const grid = new THREE.GridHelper(20, 20, 0x0077b6, 0x1c2541);
      scene.add(grid);
    } else if (preset === 'underwater') {
      scene.background = new THREE.Color(0x0369a1);
      scene.fog = new THREE.FogExp2(0x0369a1, 0.04);

      const ambLight = new THREE.AmbientLight(0x38bdf8, 1.0);
      scene.add(ambLight);

      const dirLight = new THREE.DirectionalLight(0xbae6fd, 1.5);
      dirLight.position.set(0, 15, 0);
      scene.add(dirLight);
    }

    // ── 4. SMOOTH ORBIT CONTROLLER ─────────────────────────────────────────
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(targetVec));

    const onMouseDown = (e: MouseEvent) => {
      if (!enableOrbit) return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !enableOrbit) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      spherical.theta -= deltaX * 0.007;
      spherical.phi -= deltaY * 0.007;
      // Clamp elevation angle to avoid gimbal flip
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi));

      camera.position.setFromSpherical(spherical).add(targetVec);
      camera.lookAt(targetVec);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (!enableOrbit) return;
      e.preventDefault();
      spherical.radius += e.deltaY * 0.008;
      spherical.radius = Math.max(3, Math.min(45, spherical.radius));
      camera.position.setFromSpherical(spherical).add(targetVec);
      camera.lookAt(targetVec);
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // Click handler with raycasting coordinate support
    const handleElementClick = (e: MouseEvent) => {
      if (onClickRef.current) {
        onClickRef.current(e, { scene, camera, renderer, container, clock });
      }
    };
    domElement.addEventListener('click', handleElementClick);

    // ── 5. RESPONSIVE RESIZE OBSERVER ──────────────────────────────────────
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    // ── 6. ANIMATION LOOP & LIFECYCLE ──────────────────────────────────────
    const clock = new THREE.Clock();
    let animId: number;

    const state: ThreeContainerState = { scene, camera, renderer, container, clock };
    const customCleanup = onSetup(state);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (onAnimateRef.current) {
        onAnimateRef.current({ ...state, delta });
      }

      renderer.render(scene, camera);
    };
    animate();

    // ── 7. CLEANUP ON UNMOUNT ──────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElement.removeEventListener('wheel', onWheel);
      domElement.removeEventListener('click', handleElementClick);

      if (customCleanup && typeof customCleanup === 'function') {
        customCleanup();
      }

      // Recursive disposal of scene geometries and materials
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) {
          (obj as THREE.Mesh).geometry.dispose();
        }
        if ((obj as THREE.Mesh).material) {
          const mat = (obj as THREE.Mesh).material;
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else {
            mat.dispose();
          }
        }
      });

      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [preset]);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full min-h-[480px] overflow-hidden rounded-2xl select-none ${className}`}
      style={{ touchAction: 'none', ...style }}
    />
  );
};


/**
 * ThreeContainer.tsx
 * Three.js WebGL canvas wrapper with multi-preset environments for Grade 6 Science Simulations
 */
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface ThreeContainerState {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  clock: THREE.Clock;
}

interface ThreeContainerProps {
  preset?: 'laboratory' | 'nature' | 'space' | 'physics' | 'workshop';
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  fov?: number;
  onSetup?: (state: ThreeContainerState) => void;
  onAnimate?: (state: ThreeContainerState & { delta: number }) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ThreeContainer: React.FC<ThreeContainerProps> = ({
  preset = 'laboratory',
  cameraPosition = [0, 4, 10],
  cameraTarget = [0, 1.5, 0],
  fov = 45,
  onSetup,
  onAnimate,
  className = '',
  style = {},
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();

    // Environment Presets
    if (preset === 'laboratory') {
      scene.background = new THREE.Color(0x0f172a); // Deep slate lab
      const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
      dirLight.position.set(5, 12, 7);
      dirLight.castShadow = true;
      scene.add(dirLight);

      const softCyanLight = new THREE.PointLight(0x38bdf8, 0.8, 15);
      softCyanLight.position.set(-6, 5, 4);
      scene.add(softCyanLight);
    } else if (preset === 'nature') {
      scene.background = new THREE.Color(0x064e3b); // Natural emerald forest
      const ambLight = new THREE.AmbientLight(0xfef9c3, 0.9);
      scene.add(ambLight);

      const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
      sunLight.position.set(8, 14, 10);
      sunLight.castShadow = true;
      scene.add(sunLight);
    } else if (preset === 'space') {
      scene.background = new THREE.Color(0x030712); // Deep cosmic void
      const ambLight = new THREE.AmbientLight(0x38bdf8, 0.4);
      scene.add(ambLight);

      const sunLight = new THREE.PointLight(0xffffff, 2.5, 50);
      sunLight.position.set(0, 0, 0);
      scene.add(sunLight);
    } else if (preset === 'physics') {
      scene.background = new THREE.Color(0x0f172a);
      const ambLight = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambLight);

      const spotLight = new THREE.SpotLight(0x38bdf8, 2.0);
      spotLight.position.set(0, 14, 8);
      spotLight.angle = Math.PI / 4;
      scene.add(spotLight);
    } else {
      scene.background = new THREE.Color(0x18181b);
      const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
      scene.add(ambLight);

      const dirLight = new THREE.DirectionalLight(0xf59e0b, 1.6);
      dirLight.position.set(6, 10, 8);
      scene.add(dirLight);
    }

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 1000);
    camera.position.set(...cameraPosition);
    camera.lookAt(new THREE.Vector3(...cameraTarget));

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const clock = new THREE.Clock();
    const state: ThreeContainerState = { scene, camera, renderer, clock };

    // Setup callback
    if (onSetup) {
      onSetup(state);
    }

    // Mouse drag orbit interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = (e.clientX - prevMouseX) * 0.005;
      const deltaY = (e.clientY - prevMouseY) * 0.005;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      const offset = new THREE.Vector3().subVectors(camera.position, new THREE.Vector3(...cameraTarget));
      const radius = offset.length();
      let theta = Math.atan2(offset.x, offset.z);
      let phi = Math.acos(Math.max(-1, Math.min(1, offset.y / radius)));

      theta -= deltaX;
      phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi - deltaY));

      camera.position.x = cameraTarget[0] + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = cameraTarget[1] + radius * Math.cos(phi);
      camera.position.z = cameraTarget[2] + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(new THREE.Vector3(...cameraTarget));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY * 0.002;
      const dir = new THREE.Vector3().subVectors(camera.position, new THREE.Vector3(...cameraTarget));
      const newDist = Math.max(2, Math.min(45, dir.length() + zoomFactor));
      dir.normalize().multiplyScalar(newDist);
      camera.position.copy(new THREE.Vector3(...cameraTarget).add(dir));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Window Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation loop
    const animate = () => {
      const delta = clock.getDelta();
      if (onAnimate) {
        onAnimate({ ...state, delta });
      }
      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      if (container.contains(dom)) container.removeChild(dom);
      renderer.dispose();
    };
  }, [preset, fov]);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        ...style,
      }}
    />
  );
};

import React, { useState, useEffect, useRef } from 'react';
import type { IMakerspaceSimulationMetadata } from '../types';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Box, Layers, Play, RotateCcw, CheckCircle, Eye, Sliders } from 'lucide-react';

interface Props {
  meta: IMakerspaceSimulationMetadata;
  params: Record<string, any>;
  onParamChange: (key: string, value: any) => void;
  isDark: boolean;
}

export const DigitalDesignModuleView: React.FC<Props> = ({ meta, params, onParamChange, isDark }) => {
  const simId = meta.id;

  // ─────────────────────────────────────────────────────────────
  // 1. 3D COMPONENT MODELLER
  // ─────────────────────────────────────────────────────────────
  if (simId === 'u25rge01-sim04-3d-modeller') {
    const componentType = params.componentType ?? 'bracket';
    const dimLengthMm = params.dimLengthMm ?? 80;
    const dimWidthMm = params.dimWidthMm ?? 50;
    const dimHeightMm = params.dimHeightMm ?? 40;
    const holeDiameterMm = params.holeDiameterMm ?? 16;
    const viewMode = params.viewMode ?? 'shaded'; // 'shaded' | 'wireframe'

    const canvasContainerRef = useRef<HTMLDivElement>(null);

    // Calculated physical metrics
    const volumeCm3 = Math.round(((dimLengthMm * dimWidthMm * dimHeightMm * 0.45) / 1000) * 10) / 10;
    const steelMassGrams = Math.round(volumeCm3 * 7.85);

    useEffect(() => {
      const container = canvasContainerRef.current;
      if (!container) return;

      const width = container.clientWidth || 400;
      const height = container.clientHeight || 300;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(isDark ? 0x090d16 : 0xf1f5f9);

      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(120, 90, 140);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(80, 120, 80);
      scene.add(dirLight);

      // Grid
      const grid = new THREE.GridHelper(160, 16, isDark ? 0x334155 : 0x94a3b8, isDark ? 0x1e293b : 0xcbd5e1);
      grid.position.y = -20;
      scene.add(grid);

      // Geometry based on componentType
      const meshGroup = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({
        color: 0x3b82f6,
        roughness: 0.35,
        metalness: 0.25,
        wireframe: viewMode === 'wireframe',
      });

      if (componentType === 'bracket') {
        // Base plate
        const baseGeom = new THREE.BoxGeometry(dimLengthMm * 0.8, 10, dimWidthMm * 0.8);
        const baseMesh = new THREE.Mesh(baseGeom, mat);
        baseMesh.position.y = -15;
        meshGroup.add(baseMesh);

        // Vertical flange
        const flangeGeom = new THREE.BoxGeometry(12, dimHeightMm * 0.8, dimWidthMm * 0.8);
        const flangeMesh = new THREE.Mesh(flangeGeom, mat);
        flangeMesh.position.set(-dimLengthMm * 0.4 + 6, -15 + (dimHeightMm * 0.8) / 2, 0);
        meshGroup.add(flangeMesh);

        // Central cylinder representing hole / boss
        const holeGeom = new THREE.CylinderGeometry(holeDiameterMm * 0.4, holeDiameterMm * 0.4, 12, 24);
        const holeMat = new THREE.MeshBasicMaterial({ color: isDark ? 0x090d16 : 0xf1f5f9 });
        const holeMesh = new THREE.Mesh(holeGeom, holeMat);
        holeMesh.position.y = -15;
        meshGroup.add(holeMesh);
      } else if (componentType === 'stepped-shaft') {
        const step1 = new THREE.CylinderGeometry(24, 24, dimHeightMm * 0.6, 32);
        const m1 = new THREE.Mesh(step1, mat);
        m1.position.y = -10;
        meshGroup.add(m1);

        const step2 = new THREE.CylinderGeometry(15, 15, dimHeightMm * 0.8, 32);
        const m2 = new THREE.Mesh(step2, mat);
        m2.position.y = dimHeightMm * 0.5 - 10;
        meshGroup.add(m2);
      } else {
        // Flanged Cylinder Pipe
        const pipeGeom = new THREE.CylinderGeometry(dimWidthMm * 0.3, dimWidthMm * 0.3, dimHeightMm, 32);
        const pipeMesh = new THREE.Mesh(pipeGeom, mat);
        meshGroup.add(pipeMesh);

        const flangeGeom = new THREE.CylinderGeometry(dimWidthMm * 0.6, dimWidthMm * 0.6, 8, 32);
        const flangeMesh = new THREE.Mesh(flangeGeom, mat);
        flangeMesh.position.y = -dimHeightMm / 2 + 4;
        meshGroup.add(flangeMesh);
      }

      scene.add(meshGroup);

      let animId: number;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      const handleResize = () => {
        if (!container) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
        renderer.dispose();
      };
    }, [componentType, dimLengthMm, dimWidthMm, dimHeightMm, holeDiameterMm, viewMode, isDark]);

    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
        {/* Header */}
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold">3D CAD Modeling</span>
            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Interactive Parametric Engineering Solid Modeling (Orbit / Pan / Zoom in 3D)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onParamChange('viewMode', viewMode === 'shaded' ? 'wireframe' : 'shaded')}
              className={`px-3 py-1 rounded-lg border font-bold text-xs ${viewMode === 'wireframe' ? 'bg-indigo-600 text-white' : isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}
            >
              {viewMode === 'wireframe' ? 'Shaded View' : 'Wireframe'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Controls */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                1. Select Component Primitive
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'bracket', label: 'L-Bracket', desc: 'Structural mount' },
                  { id: 'stepped-shaft', label: 'Stepped Shaft', desc: 'Bearing journal' },
                  { id: 'flanged-pipe', label: 'Flanged Boss', desc: 'Pipe connector' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onParamChange('componentType', item.id)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      componentType === item.id
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-bold'
                        : isDark
                        ? 'border-slate-800 hover:bg-slate-800/50 text-slate-400'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    <div className="font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                2. Parametric Dimensions (mm)
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Base Length ($L$):</span>
                    <span className="font-bold text-indigo-500">{dimLengthMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min={40}
                    max={120}
                    value={dimLengthMm}
                    onChange={(e) => onParamChange('dimLengthMm', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Base Width ($W$):</span>
                    <span className="font-bold text-indigo-500">{dimWidthMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={80}
                    value={dimWidthMm}
                    onChange={(e) => onParamChange('dimWidthMm', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Flange Height ($H$):</span>
                    <span className="font-bold text-indigo-500">{dimHeightMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={70}
                    value={dimHeightMm}
                    onChange={(e) => onParamChange('dimHeightMm', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Clearance Hole ($\varnothing$):</span>
                    <span className="font-bold text-indigo-500">{holeDiameterMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={28}
                    value={holeDiameterMm}
                    onChange={(e) => onParamChange('holeDiameterMm', Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Physical Properties */}
            <div className={`p-4 rounded-xl border grid grid-cols-2 gap-3 text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Solid Volume</span>
                <span className="text-sm font-bold text-indigo-400">{volumeCm3} cm³</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Mass (Mild Steel)</span>
                <span className="text-sm font-bold text-emerald-400">{steelMassGrams} grams</span>
              </div>
            </div>
          </div>

          {/* 3D WebGL Canvas */}
          <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Box className="w-4 h-4 text-indigo-500" /> 3D WebGL Interactive Canvas
              </span>
              <span className="text-[11px] text-slate-500">Drag to Orbit • Scroll to Zoom</span>
            </div>

            <div
              ref={canvasContainerRef}
              className="flex-1 min-h-[320px] rounded-lg border overflow-hidden relative"
            />
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. 3D PRINTING PREPARATION SIMULATOR
  // ─────────────────────────────────────────────────────────────
  if (simId === 'u25rge01-sim05-3d-printing-prep') {
    const layerHeightMm = params.layerHeightMm ?? 0.20;
    const infillPercent = params.infillPercent ?? 25;
    const infillPattern = params.infillPattern ?? 'gyroid';
    const supportsEnabled = params.supportsEnabled ?? true;
    const activeSliceLayer = params.activeSliceLayer ?? 120;
    const totalLayers = Math.round(40 / layerHeightMm);

    // Trade-off calculations
    const estimatedTimeMin = Math.round((totalLayers * (10 + (infillPercent / 100) * 8)) / 60 * 10) / 10;
    const filamentGrams = Math.round(18 + (infillPercent / 100) * 35 + (supportsEnabled ? 8 : 0));

    return (
      <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
        {/* Info Header */}
        <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold">FDM Slicing & Build Prep</span>
            <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Layer-by-Layer Slicer Toolpath, Infill Optimization, and Print Estimates
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Slicing Controls */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
                1. Slicer Layer & Infill
              </span>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Layer Height:</span>
                    <span className="font-bold text-indigo-500">{layerHeightMm} mm ({totalLayers} Total Layers)</span>
                  </div>
                  <input
                    type="range"
                    min={0.12}
                    max={0.28}
                    step={0.04}
                    value={layerHeightMm}
                    onChange={(e) => onParamChange('layerHeightMm', Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>0.12 mm (Fine / Slow)</span>
                    <span>0.28 mm (Draft / Fast)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Infill Density:</span>
                    <span className="font-bold text-indigo-500">{infillPercent} %</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={infillPercent}
                    onChange={(e) => onParamChange('infillPercent', Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span>Infill Pattern:</span>
                  <select
                    value={infillPattern}
                    onChange={(e) => onParamChange('infillPattern', e.target.value)}
                    className={`text-xs px-2 py-1 rounded border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-300'}`}
                  >
                    <option value="gyroid">Gyroid (Isotropic Strength)</option>
                    <option value="grid">Grid (Fast Print)</option>
                    <option value="honeycomb">Honeycomb (High Rigidity)</option>
                  </select>
                </div>

                <label className="flex items-center justify-between cursor-pointer pt-1">
                  <span>Generate Support Structures (&gt; 45°):</span>
                  <input
                    type="checkbox"
                    checked={supportsEnabled}
                    onChange={(e) => onParamChange('supportsEnabled', e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                </label>
              </div>
            </div>

            {/* Estimates Card */}
            <div className={`p-4 rounded-xl border grid grid-cols-2 gap-3 text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Estimated Print Time</span>
                <span className="text-base font-bold text-amber-400">{estimatedTimeMin} Hours</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Filament Mass</span>
                <span className="text-base font-bold text-indigo-400">{filamentGrams} g (PLA)</span>
              </div>
            </div>
          </div>

          {/* Slicer Layer-by-Layer Visualizer */}
          <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Layer-by-Layer Slice Toolpath Preview
              </span>
              <span className="text-xs font-bold text-indigo-400">
                Layer {Math.min(activeSliceLayer, totalLayers)} / {totalLayers}
              </span>
            </div>

            {/* Layer Slider */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] text-slate-500">Base</span>
              <input
                type="range"
                min={1}
                max={totalLayers}
                value={Math.min(activeSliceLayer, totalLayers)}
                onChange={(e) => onParamChange('activeSliceLayer', Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-[11px] text-slate-500">Top</span>
            </div>

            {/* Slicer SVG */}
            <div className={`flex-1 min-h-[260px] rounded-lg border flex items-center justify-center relative p-4 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
              <svg viewBox="0 0 460 220" className="w-full h-full max-h-[280px]">
                {/* Build plate grid */}
                <rect x="30" y="20" width="400" height="180" fill="none" stroke={isDark ? '#1e293b' : '#e2e8f0'} strokeWidth="1" />

                {/* Outer perimeter lines */}
                <rect x="110" y="50" width="240" height="120" rx="4" fill="none" stroke="#22c55e" strokeWidth="3" />
                <rect x="114" y="54" width="232" height="112" rx="3" fill="none" stroke="#16a34a" strokeWidth="2" />

                {/* Internal Hole */}
                <circle cx="230" cy="110" r="30" fill={isDark ? '#090d16' : '#f1f5f9'} stroke="#22c55e" strokeWidth="2.5" />

                {/* Infill pattern visualization */}
                {infillPattern === 'grid' && (
                  <g opacity={Math.min(0.9, infillPercent / 50)}>
                    {[140, 170, 200, 260, 290, 320].map((x) => (
                      <line key={`v-${x}`} x1={x} y1="56" x2={x} y2="164" stroke="#f59e0b" strokeWidth="1.5" />
                    ))}
                    {[80, 110, 140].map((y) => (
                      <line key={`h-${y}`} x1="116" y1={y} x2="344" y2={y} stroke="#f59e0b" strokeWidth="1.5" />
                    ))}
                  </g>
                )}

                {infillPattern === 'gyroid' && (
                  <g opacity={Math.min(0.9, infillPercent / 50)}>
                    <path
                      d="M 120 70 Q 150 90 180 70 T 240 70 T 300 70 T 340 70 M 120 100 Q 150 80 180 100 T 240 100 T 300 100 T 340 100 M 120 130 Q 150 150 180 130 T 240 130 T 300 130 T 340 130"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      fill="none"
                    />
                  </g>
                )}

                {infillPattern === 'honeycomb' && (
                  <g opacity={Math.min(0.9, infillPercent / 50)}>
                    <polygon points="150,70 170,60 190,70 190,90 170,100 150,90" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                    <polygon points="270,70 290,60 310,70 310,90 290,100 270,90" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                  </g>
                )}

                {/* Supports if enabled */}
                {supportsEnabled && (
                  <g opacity="0.6">
                    <rect x="70" y="50" width="36" height="120" fill="none" stroke="#38bdf8" strokeDasharray="3 3" strokeWidth="1.5" />
                    <text x="88" y="115" fill="#38bdf8" fontSize="9" textAnchor="middle" fontWeight="bold">SUPPORT</text>
                  </g>
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. ASSEMBLY MODELLING CHALLENGE
  // ─────────────────────────────────────────────────────────────
  const explodedProgress = params.explodedProgress ?? 0;
  const partsInserted = params.partsInserted ?? ['shaft-a', 'flange-left', 'flange-right', 'pin'];
  const [completed, setCompleted] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4">
      {/* Header */}
      <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold">Mechanical Assembly Challenge</span>
          <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
            Mated Flanged Shaft Coupling with Concentric Alignment & Pin Retention
          </span>
        </div>
        <button
          onClick={() => {
            onParamChange('explodedProgress', 0);
            setCompleted(true);
          }}
          className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs cursor-pointer"
        >
          Verify Assembly
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* Assembly Steps */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-3">
              Exploded View Separation
            </span>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Exploded Distance:</span>
                  <span className="font-bold text-indigo-500">{explodedProgress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={explodedProgress}
                  onChange={(e) => onParamChange('explodedProgress', Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                  <span>Mated Assembly (0%)</span>
                  <span>Fully Exploded (100%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <span className="font-bold text-xs uppercase tracking-wider text-indigo-500 block mb-2">
              Assembly Constraint Checklist
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-500 font-bold">
                <CheckCircle className="w-4 h-4" /> Shaft A Axis Concentric with Flange Hub
              </div>
              <div className="flex items-center gap-2 text-emerald-500 font-bold">
                <CheckCircle className="w-4 h-4" /> Flange Mate Faces Coincident (0 mm Offset)
              </div>
              <div className="flex items-center gap-2 text-emerald-500 font-bold">
                <CheckCircle className="w-4 h-4" /> 4x High-Tensile Bolts Clamped on Pitch Circle
              </div>
              <div className="flex items-center gap-2 text-emerald-500 font-bold">
                <CheckCircle className="w-4 h-4" /> Output Shaft B Aligned with Keyway
              </div>
            </div>
          </div>
        </div>

        {/* Visual Assembly Diagram */}
        <div className={`lg:col-span-7 rounded-xl border flex flex-col p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Interactive Assembly Diagram (2D/3D Kinematic Mates)
            </span>
            <span className={`text-xs font-bold ${explodedProgress === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
              {explodedProgress === 0 ? 'Fully Mated & Constrained' : `Exploded View (${explodedProgress}%)`}
            </span>
          </div>

          <div className={`flex-1 min-h-[260px] rounded-lg border flex items-center justify-center p-4 relative ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
            <svg viewBox="0 0 500 220" className="w-full h-full max-h-[280px]">
              {/* Center Axis */}
              <line x1="20" y1="110" x2="480" y2="110" stroke="#475569" strokeDasharray="6 3" strokeWidth="1" />

              {/* Shaft A (moves left when exploded) */}
              <rect
                x={80 - explodedProgress * 0.5}
                y="95"
                width="80"
                height="30"
                fill="#64748b"
                stroke="#334155"
                strokeWidth="2"
                rx="2"
              />
              <text x={120 - explodedProgress * 0.5} y="115" fill="#f8fafc" fontSize="10" textAnchor="middle" fontWeight="bold">
                Shaft A
              </text>

              {/* Left Flange */}
              <polygon
                points={`${160 - explodedProgress * 0.25},60 ${190 - explodedProgress * 0.25},60 ${190 - explodedProgress * 0.25},160 ${160 - explodedProgress * 0.25},160`}
                fill="#3b82f6"
                stroke="#1d4ed8"
                strokeWidth="2"
              />

              {/* Right Flange */}
              <polygon
                points={`${195 + explodedProgress * 0.25},60 ${225 + explodedProgress * 0.25},60 ${225 + explodedProgress * 0.25},160 ${195 + explodedProgress * 0.25},160`}
                fill="#3b82f6"
                stroke="#1d4ed8"
                strokeWidth="2"
              />

              {/* Connecting Fastener Bolt (moves up when exploded) */}
              <rect
                x="180"
                y={35 - explodedProgress * 0.3}
                width="25"
                height="10"
                fill="#f59e0b"
                stroke="#b45309"
                strokeWidth="1.5"
                rx="2"
              />

              {/* Shaft B (moves right when exploded) */}
              <rect
                x={225 + explodedProgress * 0.5}
                y="95"
                width="80"
                height="30"
                fill="#64748b"
                stroke="#334155"
                strokeWidth="2"
                rx="2"
              />
              <text x={265 + explodedProgress * 0.5} y="115" fill="#f8fafc" fontSize="10" textAnchor="middle" fontWeight="bold">
                Shaft B
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

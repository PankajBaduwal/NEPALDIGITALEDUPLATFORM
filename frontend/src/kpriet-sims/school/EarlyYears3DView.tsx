import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Compass,
  Star,
} from 'lucide-react';
import { FoundationalAudio, FoundationalNarrator } from './foundational-kit';

export interface EarlyYears3DViewProps {
  simId: string;
  title: string;
  topic?: string;
  showHeader?: boolean;
  onClose?: () => void;
  onComplete?: () => void;
}

export const EarlyYears3DView: React.FC<EarlyYears3DViewProps> = ({
  simId,
  title,
  topic,
  showHeader = true,
  onClose,
  onComplete,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Audio & narration states
  const [isAudioMuted, setIsAudioMuted] = useState(() => FoundationalAudio.isMuted());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activePrompt, setActivePrompt] = useState<string>('');
  const [stars, setStars] = useState(1);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  // Interactive 3D simulation state
  const [simState, setSimState] = useState<any>({});
  const simStateRef = useRef<any>({});
  simStateRef.current = simState;

  // Three.js object references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Sound FX and Voice helper
  const speakText = useCallback((text: string) => {
    setActivePrompt(text);
    if (!isAudioMuted) {
      setIsSpeaking(true);
      FoundationalNarrator.speak(text, {
        lang: 'en-IN',
        pitch: 1.25,
        rate: 0.95,
      });
      setTimeout(() => setIsSpeaking(false), 3000);
    }
  }, [isAudioMuted]);

  const toggleAudio = useCallback(() => {
    const next = FoundationalAudio.toggleMute();
    setIsAudioMuted(next);
  }, []);

  const triggerCelebration = useCallback(() => {
    FoundationalAudio.playCelebrationFanfare();
    setStars((s) => Math.min(s + 1, 5));
    setShowCelebration(true);
    speakText("Hooray! You did it! You're a superstar! ⭐");
    if (onComplete) onComplete();
  }, [speakText, onComplete]);

  // Reset 3D camera to default child view
  const resetCamera = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 10, 15);
      controlsRef.current.target.set(0, 1.5, 0);
      controlsRef.current.update();
      FoundationalAudio.playPop();
    }
  }, []);

  /* ─────────────────────────────────────────────────────────────
     THREE.JS SETUP & 3D SIMULATION ENGINE
     ───────────────────────────────────────────────────────────── */
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xdbeafe); // Soft sky blue
    scene.fog = new THREE.FogExp2(0xdbeafe, 0.025);

    // 2. Camera
    const aspect = container.clientWidth / Math.max(container.clientHeight, 300);
    const camera = new THREE.PerspectiveCamera(48, aspect, 0.1, 100);
    camera.position.set(0, 10, 15);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Controls (Smooth child touch orbit)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05; // Prevent camera going under floor
    controls.minDistance = 6;
    controls.maxDistance = 26;
    controls.target.set(0, 1.5, 0);
    controlsRef.current = controls;

    // 5. Lighting (Warm, cartoonish, joyful)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x86efac, 1.2);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.4);
    dirLight.position.set(8, 16, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 40;
    dirLight.shadow.camera.left = -12;
    dirLight.shadow.camera.right = 12;
    dirLight.shadow.camera.top = 12;
    dirLight.shadow.camera.bottom = -12;
    scene.add(dirLight);

    // 6. Joyful 3D Ground Plinth (Soft green grass meadow with rounded edge)
    const groundGeo = new THREE.CylinderGeometry(14, 14.5, 0.6, 64);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x86efac, // Fresh cheerful grass green
      roughness: 0.7,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -0.3;
    ground.receiveShadow = true;
    scene.add(ground);

    // Decorative edge ring
    const ringGeo = new THREE.TorusGeometry(14, 0.25, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.02;
    scene.add(ring);

    // 7. BUILD 3D WORLD FOR SPECIFIC SIMULATION
    build3DSceneForSimulation(simId, scene, setSimState, speakText);

    // 8. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      controls.update();

      // Custom continuous animations (clouds, gentle bobbing, spinning items)
      scene.traverse((obj) => {
        if ((obj as any).userData?.customTick) {
          (obj as any).userData.customTick(dt, clock.getElapsedTime());
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / Math.max(h, 200);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (controlsRef.current) controlsRef.current.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, [simId, speakText]);

  return (
    <div className="relative flex flex-col h-full w-full overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 select-none">
      {/* ── Top Child-Friendly Navigation Bar (Conditional) ── */}
      {showHeader && (
        <header className="z-10 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-sky-200 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-amber-100 text-2xl shadow-xs animate-pulse">
              🎈
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
                  🎮 3D World
                </span>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-800">
                  {title}
                </h1>
              </div>
              {topic && (
                <p className="text-xs font-semibold text-slate-500 hidden sm:block">
                  {topic}
                </p>
              )}
            </div>
          </div>

          {/* Audio & Child Control Actions */}
          <div className="flex items-center gap-2">
            {/* Read to Me Button */}
            <button
              type="button"
              onClick={() => speakText(activePrompt || title)}
              className={`flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-black shadow-sm transition-transform active:scale-95 cursor-pointer border ${
                isSpeaking
                  ? 'bg-amber-400 text-amber-950 border-amber-500 animate-bounce'
                  : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
              }`}
              title="Listen to Instructions"
            >
              <Volume2 className="size-4.5" />
              <span className="hidden md:inline">Read Aloud 🔊</span>
            </button>

            {/* Sound FX Toggle */}
            <button
              type="button"
              onClick={toggleAudio}
              className={`p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isAudioMuted
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
              title={isAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isAudioMuted ? <VolumeX className="size-4" /> : <Sparkles className="size-4" />}
            </button>

            {/* Reset Camera View */}
            <button
              type="button"
              onClick={resetCamera}
              className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 cursor-pointer shadow-xs"
              title="Reset 3D Camera View"
            >
              <Compass className="size-4" />
            </button>

            {/* Star Counter */}
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold shadow-2xs">
              <Star className="size-4 fill-amber-400 text-amber-500" />
              <span>{stars} ⭐</span>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 min-h-[44px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 cursor-pointer"
              >
                Exit
              </button>
            )}
          </div>
        </header>
      )}

      {/* ── Active Prompt Speech Bubble (Child-friendly high-contrast card) ── */}
      <div className={`z-10 absolute left-1/2 -translate-x-1/2 w-[92%] sm:w-auto max-w-lg pointer-events-none ${showHeader ? 'top-18' : 'top-3 sm:top-4'}`}>
        {activePrompt && (
          <button
            type="button"
            onClick={() => speakText(activePrompt)}
            title="Tap to listen again!"
            className="w-full px-5 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-emerald-500 shadow-xl text-center pointer-events-auto flex items-center justify-center gap-2.5 hover:bg-emerald-50/50 transition-all cursor-pointer group"
          >
            <span className="text-xl group-hover:scale-115 transition-transform">🐱</span>
            <p className="text-xs sm:text-sm font-black leading-snug tracking-tight text-left flex-1" style={{ color: '#0F172A' }}>
              {activePrompt}
            </p>
            <span className="text-[11px] px-2.5 py-1 rounded-xl bg-amber-100 text-amber-950 font-black flex items-center gap-1 group-hover:bg-amber-200 shrink-0">
              🔊 Hear
            </span>
          </button>
        )}
      </div>

      {/* ── Main Three.js 3D Viewport ── */}
      <div ref={mountRef} className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing touch-none" />

      {/* ── Bottom Tactile Action Dock ── */}
      <div className="z-10 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-sky-200 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
          {renderSimulationDockButtons(
            simId,
            simState,
            setSimState,
            speakText,
            triggerCelebration,
            setActiveHint,
            sceneRef.current
          )}
        </div>
      </div>

      {/* ── Hint Modal / Toast ── */}
      {activeHint && (
        <div className="z-20 absolute inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-white p-6 shadow-2xl border-4 border-amber-300 text-center animate-scale-up">
            <span className="text-5xl block mb-2">💡</span>
            <h3 className="text-xl font-black text-slate-900 mb-2">Helpful Clue!</h3>
            <p className="text-base font-semibold text-slate-700 mb-5 leading-relaxed">
              {activeHint}
            </p>
            <button
              type="button"
              onClick={() => {
                FoundationalAudio.playPop();
                setActiveHint(null);
              }}
              className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-base font-black shadow-md cursor-pointer"
            >
              Got it, let's play! 🚀
            </button>
          </div>
        </div>
      )}

      {/* ── Celebration Modal ── */}
      {showCelebration && (
        <div className="z-30 absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-3xl bg-gradient-to-b from-amber-50 to-white p-8 shadow-2xl border-4 border-amber-400 text-center animate-bounce-short">
            <span className="text-6xl block mb-3 animate-spin">🎉</span>
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Outstanding Work! 🌟
            </h2>
            <p className="text-sm font-bold text-slate-600 mb-6">
              You explored this 3D challenge brilliantly! Keep discovering and playing!
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCelebration(false)}
                className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md cursor-pointer"
              >
                Play Again 🔄
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm cursor-pointer"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   3D SCENE BUILDERS FOR EVERY SIMULATION
   ───────────────────────────────────────────────────────────── */

function build3DSceneForSimulation(
  simId: string,
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  const normId = simId.toLowerCase();

  // 1. Finding the Furry Cat (Spatial Relationships)
  if (normId.includes('spatial-furry-cat')) {
    buildSpatialFurryCat3D(scene, setSimState, speakText);
  }
  // 2. Rolling vs Sliding Ramp Adventure
  else if (normId.includes('ramp-adventure') || normId.includes('rolling-sliding')) {
    buildRampAdventure3D(scene, setSimState, speakText);
  }
  // 3. Counting in the Enchanted Garden & Zero
  else if (normId.includes('counting-garden-zero') || normId === 'g18-class1-counting') {
    buildCountingGarden3D(scene, setSimState, speakText);
  }
  // 4. Animal Balancing Scale
  else if (normId.includes('measurement-balance')) {
    buildMeasurementBalance3D(scene, setSimState, speakText);
  }
  // 5. Addition & Subtraction Stories
  else if (normId.includes('addition-subtraction-stories') || normId === 'g18-class1-addition-objects') {
    buildAddSubtractStories3D(scene, setSimState, speakText);
  }
  // 6. The Rhythmic Pattern Train
  else if (normId.includes('pattern-train')) {
    buildPatternTrain3D(scene, setSimState, speakText);
  }
  // 7. Time: A Day in the Life of Chintu
  else if (normId.includes('time-chintu-day')) {
    buildChintuDayTime3D(scene, setSimState, speakText);
  }
  // 8. Currency & Toy Shop
  else if (normId.includes('currency-toy-shop')) {
    buildCurrencyToyShop3D(scene, setSimState, speakText);
  }
  // 9. Class 2 Number Village
  else if (normId.includes('number-village')) {
    buildNumberVillage3D(scene, setSimState, speakText);
  }
  // 10. Class 2 Tens and Ones Bundling
  else if (normId.includes('tens-and-ones') || normId === 'g18-class2-place-value') {
    buildTensAndOnes3D(scene, setSimState, speakText);
  }
  // 11. Class 2 Number Line Jump
  else if (normId.includes('add-subtract')) {
    buildNumberLineJump3D(scene, setSimState, speakText);
  }
  // 12. Class 2 Rupee Play Market
  else if (normId.includes('rupee-market')) {
    buildRupeeMarket3D(scene, setSimState, speakText);
  }
  // 13. Class 2 3D Shape Explorer
  else if (normId.includes('shape-explorer')) {
    buildShapeExplorer3D(scene, setSimState, speakText);
  }
  // 14. Class 2 Length Detective
  else if (normId.includes('length-detective')) {
    buildLengthDetective3D(scene, setSimState, speakText);
  }
  // 15. Class 2 Living vs Non-Living Sorter
  else if (normId.includes('living-sorter')) {
    buildLivingSorter3D(scene, setSimState, speakText);
  }
  // 16. Class 2 Plant Garden
  else if (normId.includes('plant-garden')) {
    buildPlantGarden3D(scene, setSimState, speakText);
  }
  // 17. Class 2 5 Senses Explorer
  else if (normId.includes('senses-explorer')) {
    buildSensesExplorer3D(scene, setSimState, speakText);
  }
  // 18. Class 2 Water Saver
  else if (normId.includes('water-saver')) {
    buildWaterSaver3D(scene, setSimState, speakText);
  }
  // 19. Class 2 Sink or Float Pool
  else if (normId.includes('sink-float')) {
    buildSinkFloat3D(scene, setSimState, speakText);
  }
  // 20. Class 2 Push and Pull Playground
  else if (normId.includes('push-pull')) {
    buildPushPull3D(scene, setSimState, speakText);
  }
  // Default joyful sandbox
  else {
    buildDefaultEarlyYears3D(scene, setSimState, speakText);
  }
}

/* ─────────────────────────────────────────────────────────────
   SCENE 1: SPATIAL FURRY CAT
   ───────────────────────────────────────────────────────────── */
function buildSpatialFurryCat3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // 1. Playful Striped Tent (Prism)
  const tentGroup = new THREE.Group();
  tentGroup.position.set(-3.5, 0, -2);
  const tentGeo = new THREE.ConeGeometry(2.5, 3.5, 4);
  const tentMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.6 });
  const tent = new THREE.Mesh(tentGeo, tentMat);
  tent.position.y = 1.75;
  tent.rotation.y = Math.PI / 4;
  tent.castShadow = true;
  tentGroup.add(tent);
  scene.add(tentGroup);

  // 2. Fluffy Cartoon Tree
  const treeGroup = new THREE.Group();
  treeGroup.position.set(3.8, 0, -2.5);
  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.5, 0.7, 3, 16);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.5;
  trunk.castShadow = true;
  treeGroup.add(trunk);
  // Canopy spheres
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.7 });
  const canopy1 = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 16), canopyMat);
  canopy1.position.y = 3.6;
  canopy1.castShadow = true;
  treeGroup.add(canopy1);
  const canopy2 = new THREE.Mesh(new THREE.SphereGeometry(1.3, 16, 16), canopyMat);
  canopy2.position.set(0.6, 4.2, 0.4);
  treeGroup.add(canopy2);
  scene.add(treeGroup);

  // 3. Shimmering Pond (Disc)
  const pondGeo = new THREE.CylinderGeometry(2.2, 2.2, 0.05, 32);
  const pondMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.3,
  });
  const pond = new THREE.Mesh(pondGeo, pondMat);
  pond.position.set(2.5, 0.02, 2.5);
  scene.add(pond);

  // 4. Woven Basket
  const basketGeo = new THREE.CylinderGeometry(1.2, 0.9, 0.9, 20);
  const basketMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
  const basket = new THREE.Mesh(basketGeo, basketMat);
  basket.position.set(-2.5, 0.45, 2.5);
  basket.castShadow = true;
  scene.add(basket);

  // 5. Cute 3D Kitten (Low-Poly Cartoon)
  const catGroup = new THREE.Group();
  catGroup.name = 'furryCat';
  // Body
  const catBody = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.5 })
  );
  catBody.position.y = 0.7;
  catBody.castShadow = true;
  catGroup.add(catBody);
  // Head
  const catHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.5 })
  );
  catHead.position.set(0, 1.3, 0.35);
  catHead.castShadow = true;
  catGroup.add(catHead);
  // Ears
  const earGeo = new THREE.ConeGeometry(0.2, 0.35, 4);
  const earMat = new THREE.MeshStandardMaterial({ color: 0xea580c });
  const earL = new THREE.Mesh(earGeo, earMat);
  earL.position.set(-0.25, 1.75, 0.35);
  earL.rotation.z = 0.2;
  const earR = new THREE.Mesh(earGeo, earMat);
  earR.position.set(0.25, 1.75, 0.35);
  earR.rotation.z = -0.2;
  catGroup.add(earL, earR);

  // Initial Cat Position (in front of tent)
  catGroup.position.set(-1, 0, 0);
  scene.add(catGroup);

  setSimState({ catPosition: 'front' });
  speakText("Where is the furry cat? Tap a place below to see where she jumps!");
}

/* ─────────────────────────────────────────────────────────────
   SCENE 2: RAMP ADVENTURE (ROLL VS SLIDE)
   ───────────────────────────────────────────────────────────── */
function buildRampAdventure3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // 1. Slanted Wooden Ramp
  const rampGroup = new THREE.Group();
  rampGroup.position.set(-2, 0, 0);

  const rampBase = new THREE.Mesh(
    new THREE.BoxGeometry(7, 0.3, 3.5),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.6 })
  );
  rampBase.position.set(0, 1.6, 0);
  rampBase.rotation.z = -0.38; // Tilted angle
  rampBase.castShadow = true;
  rampBase.receiveShadow = true;
  rampGroup.add(rampBase);

  // Support Pillar
  const pillar = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 3.0, 3.5),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 })
  );
  pillar.position.set(-2.8, 1.5, 0);
  pillar.castShadow = true;
  rampGroup.add(pillar);
  scene.add(rampGroup);

  // Active testing object holder
  const objectGroup = new THREE.Group();
  objectGroup.name = 'rampObject';
  scene.add(objectGroup);

  // Spawn initial Red Ball at top of ramp
  spawnRampObject('sphere', objectGroup);

  setSimState({ currentShape: 'sphere', isMoving: false });
  speakText("Test the red ball, blue cube, or green can on the ramp! Will it roll or slide?");
}

function spawnRampObject(type: 'sphere' | 'cube' | 'cylinder', group: THREE.Group) {
  // Clear existing
  while (group.children.length > 0) {
    const child = group.children[0];
    if (child) group.remove(child);
  }

  let mesh: THREE.Mesh;
  if (type === 'sphere') {
    mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
    );
  } else if (type === 'cube') {
    mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 1.1, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.5 })
    );
  } else {
    // Cylinder
    mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 1.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4 })
    );
    mesh.rotation.z = Math.PI / 2; // on its side for rolling
  }

  mesh.castShadow = true;
  mesh.position.set(-4.5, 3.6, 0);
  group.add(mesh);
}

/* ─────────────────────────────────────────────────────────────
   SCENE 3: COUNTING GARDEN & ZERO
   ───────────────────────────────────────────────────────────── */
function buildCountingGarden3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // Big Mango Tree
  const treeGroup = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 1.2, 4.5, 16),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 })
  );
  trunk.position.y = 2.25;
  trunk.castShadow = true;
  treeGroup.add(trunk);

  // Canopy
  const foliage = new THREE.Mesh(
    new THREE.DodecahedronGeometry(3.2, 1),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 })
  );
  foliage.position.y = 5.2;
  foliage.castShadow = true;
  treeGroup.add(foliage);
  scene.add(treeGroup);

  // Mangoes Hanging in 3D
  const mangoGroup = new THREE.Group();
  mangoGroup.name = 'treeMangoes';
  const mangoOffsets: [number, number, number][] = [
    [-1.2, 4.5, 1.5],
    [1.1, 4.8, 1.2],
    [-1.8, 5.0, -0.8],
    [1.5, 4.2, -1.2],
    [0.2, 5.5, 1.8],
  ];

  mangoOffsets.forEach(([x, y, z], idx) => {
    const mango = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4 })
    );
    mango.scale.set(0.9, 1.2, 0.9);
    mango.position.set(x, y, z);
    mango.castShadow = true;
    mango.name = `mango_${idx}`;
    mangoGroup.add(mango);
  });
  scene.add(mangoGroup);

  // Ten-Frame Basket on ground
  const basket = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.4, 2.0),
    new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 })
  );
  basket.position.set(0, 0.2, 3.5);
  basket.receiveShadow = true;
  scene.add(basket);

  setSimState({ mangoesInTree: 5, mangoesInBasket: 0 });
  speakText("Gather sweet golden mangoes into the basket! Tap Pick Mango!");
}

/* ─────────────────────────────────────────────────────────────
   SCENE 4: ANIMAL MEASUREMENT BALANCE
   ───────────────────────────────────────────────────────────── */
function buildMeasurementBalance3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // Fulcrum & Base
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2.5, 0.5, 32),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 })
  );
  base.position.y = 0.25;
  scene.add(base);

  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.45, 4.5, 16),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.6 })
  );
  pillar.position.y = 2.5;
  scene.add(pillar);

  // Pivoting Crossbeam
  const beamGroup = new THREE.Group();
  beamGroup.name = 'balanceBeam';
  beamGroup.position.set(0, 4.6, 0);

  const beamMesh = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.25, 0.4),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.5 })
  );
  beamMesh.castShadow = true;
  beamGroup.add(beamMesh);

  // Left Pan
  const panLeft = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.4, 0.2, 24),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.7 })
  );
  panLeft.position.set(-3.6, -1.8, 0);
  panLeft.castShadow = true;
  beamGroup.add(panLeft);

  // Right Pan
  const panRight = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.4, 0.2, 24),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.7 })
  );
  panRight.position.set(3.6, -1.8, 0);
  panRight.castShadow = true;
  beamGroup.add(panRight);

  scene.add(beamGroup);

  setSimState({ leftWeight: 0, rightWeight: 0, leftAnimal: 'None', rightAnimal: 'None' });
  speakText("Which is heavier? Place animals on the balance scale to see it tilt!");
}

/* ─────────────────────────────────────────────────────────────
   SCENE 5: ADDITION & SUBTRACTION STORIES
   ───────────────────────────────────────────────────────────── */
function buildAddSubtractStories3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // Lily Pond
  const pond = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 5, 0.1, 48),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.2 })
  );
  pond.position.set(0, 0.05, 0);
  scene.add(pond);

  // Floating Lily Pads
  const padGroup = new THREE.Group();
  padGroup.name = 'lilyPads';
  const padCoords: [number, number, number][] = [
    [-2, 0.1, -1],
    [0, 0.1, -1.8],
    [2, 0.1, -0.8],
    [-1.5, 0.1, 1.5],
    [1.5, 0.1, 1.2],
  ];

  padCoords.forEach(([x, y, z]) => {
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 0.06, 20),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 })
    );
    pad.position.set(x, y, z);
    padGroup.add(pad);
  });
  scene.add(padGroup);

  // Frogs Holder
  const frogsGroup = new THREE.Group();
  frogsGroup.name = 'frogsGroup';
  scene.add(frogsGroup);

  // Initial 2 Frogs
  const first = padCoords[0];
  const second = padCoords[1];
  if (first) spawnFrogAtPad(first, frogsGroup);
  if (second) spawnFrogAtPad(second, frogsGroup);

  setSimState({ frogCount: 2 });
  speakText("Two frogs are sitting on the lily pads. Tap Add Frog to watch another one hop in!");
}

function spawnFrogAtPad([x, y, z]: [number, number, number], group: THREE.Group) {
  const frog = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 })
  );
  body.position.set(x, y + 0.35, z);
  body.castShadow = true;
  frog.add(body);

  const eyes = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  eyes.position.set(x - 0.15, y + 0.65, z + 0.25);
  frog.add(eyes);

  const pupil = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x000000 })
  );
  pupil.position.set(x - 0.15, y + 0.67, z + 0.35);
  frog.add(pupil);

  group.add(frog);
}

/* ─────────────────────────────────────────────────────────────
   SCENE 6: THE RHYTHMIC PATTERN TRAIN
   ───────────────────────────────────────────────────────────── */
function buildPatternTrain3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // Wooden Railway Track
  const trackMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  for (let z = -6; z <= 6; z += 0.8) {
    const sleeper = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 0.3), trackMat);
    sleeper.position.set(0, 0.05, z);
    scene.add(sleeper);
  }

  // Steam Engine
  const trainGroup = new THREE.Group();
  trainGroup.name = 'patternTrain';
  trainGroup.position.set(0, 0.4, -3);

  const engineBody = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1.4, 2.5),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
  );
  engineBody.position.y = 0.7;
  trainGroup.add(engineBody);

  const stack = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.4, 0.8, 16),
    new THREE.MeshStandardMaterial({ color: 0x1e293b })
  );
  stack.position.set(0, 1.8, 0.6);
  trainGroup.add(stack);

  scene.add(trainGroup);

  // Carriage 1: Blue Cube
  const car1 = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.2, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6 })
  );
  car1.position.set(0, 1.0, 0);
  scene.add(car1);

  // Carriage 2: Yellow Sphere
  const car2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0xfacc15 })
  );
  car2.position.set(0, 1.0, 2);
  scene.add(car2);

  setSimState({ pattern: ['Cube', 'Sphere', 'Cube', '?'], nextChoice: null });
  speakText("Look at the pattern: Cube, Sphere, Cube... What comes next?");
}

/* ─────────────────────────────────────────────────────────────
   SCENE 7: TIME — CHINTU'S DAY
   ───────────────────────────────────────────────────────────── */
function buildChintuDayTime3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // Village House
  const houseGroup = new THREE.Group();
  const walls = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2.5, 3),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.7 })
  );
  walls.position.y = 1.25;
  houseGroup.add(walls);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(2.8, 1.6, 4),
    new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.6 })
  );
  roof.position.y = 3.3;
  roof.rotation.y = Math.PI / 4;
  houseGroup.add(roof);
  scene.add(houseGroup);

  // 3D Sun
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
  );
  sun.name = 'skySun';
  sun.position.set(0, 8, -6);
  scene.add(sun);

  setSimState({ timeOfDay: 'morning' });
  speakText("Good morning! Chintu wakes up as the bright sun rises!");
}

/* ─────────────────────────────────────────────────────────────
   SCENE 8: CURRENCY & VILLAGE TOY SHOP
   ───────────────────────────────────────────────────────────── */
function buildCurrencyToyShop3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // Wooden Shop Counter
  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(6, 1.6, 2.5),
    new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.7 })
  );
  counter.position.set(0, 0.8, -1);
  scene.add(counter);

  // Spinning Top Toy on Counter
  const topMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.6, 1.0, 16),
    new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3 })
  );
  topMesh.position.set(-1.8, 2.0, -1);
  topMesh.rotation.x = Math.PI;
  scene.add(topMesh);

  // Wooden Drum Toy
  const drum = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.7, 0.9, 20),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 })
  );
  drum.position.set(1.8, 2.0, -1);
  scene.add(drum);

  // 3D Shiny Coin Tray in Front
  const tray = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 0.2, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.3 })
  );
  tray.position.set(0, 0.1, 1.8);
  scene.add(tray);

  setSimState({ selectedToy: 'Top (₹5)', paidAmount: 0 });
  speakText("Welcome to the toy shop! Pick coins to buy the spinning top for 5 Rupees!");
}

/* ─────────────────────────────────────────────────────────────
   SCENES 9–20: CLASS 2 MATHEMATICS & ENVIRONMENTAL DISCOVERY
   ───────────────────────────────────────────────────────────── */
function buildNumberVillage3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // Houses = Tens, Flowers = Ones
  const villageGroup = new THREE.Group();
  villageGroup.name = 'villageGroup';
  scene.add(villageGroup);

  // Spawn 2 Houses (20) and 3 Flowers (3) = 23
  addTensHouse(villageGroup, -2.5, 0);
  addTensHouse(villageGroup, 0, 0);
  addOnesFlower(villageGroup, 2.5, 0);
  addOnesFlower(villageGroup, 3.5, 0);
  addOnesFlower(villageGroup, 4.5, 0);

  setSimState({ tens: 2, ones: 3, total: 23 });
  speakText("Each cozy house is 10 villagers. Each flower is 1 villager. 2 houses and 3 flowers make 23!");
}

function addTensHouse(group: THREE.Group, x: number, z: number) {
  const house = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.4, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6 })
  );
  house.position.set(x, 0.7, z);
  group.add(house);
}

function addOnesFlower(group: THREE.Group, x: number, z: number) {
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8),
    new THREE.MeshStandardMaterial({ color: 0x16a34a })
  );
  stem.position.set(x, 0.3, z);
  const bloom = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xec4899 })
  );
  bloom.position.set(x, 0.6, z);
  group.add(stem, bloom);
}

function buildTensAndOnes3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // Workbench mat
  const mat = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.1, 4),
    new THREE.MeshStandardMaterial({ color: 0x0284c7 })
  );
  mat.position.y = 0.05;
  scene.add(mat);

  setSimState({ looseSticks: 6, bundles: 1 });
  speakText("Tie 10 loose sticks together to make 1 bundle of ten! Let's count them.");
}

function buildNumberLineJump3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // Stepping stones
  for (let i = 0; i <= 5; i++) {
    const stone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.9, 0.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 })
    );
    stone.position.set((i - 2.5) * 1.8, 0.1, 0);
    scene.add(stone);
  }

  // Hopping bunny/frog marker
  const hopper = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x10b981 })
  );
  hopper.name = 'hopper';
  hopper.position.set(-2.5 * 1.8, 0.6, 0);
  scene.add(hopper);

  setSimState({ currentPosition: 0 });
  speakText("Hop forward by tens and ones along the stepping stones!");
}

function buildRupeeMarket3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // Market Fruit Crate
  const crate = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1.2, 2.5),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 })
  );
  crate.position.y = 0.6;
  scene.add(crate);

  // Watermelon
  const melon = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.3 })
  );
  melon.position.set(-0.9, 1.6, 0);
  scene.add(melon);

  setSimState({ marketItem: 'Watermelon (₹20)', currentPaid: 0 });
  speakText("Welcome to the market! Pay 20 Rupees using 10 Rupee coins or notes.");
}

function buildShapeExplorer3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // Rotating showcase platform
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3.2, 0.4, 32),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6 })
  );
  platform.position.y = 0.2;
  scene.add(platform);

  // Central 3D Shape
  const shape = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 2.2, 32),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 })
  );
  shape.name = 'displayShape';
  shape.position.set(0, 1.8, 0);
  (shape as any).userData.customTick = (_dt: number, time: number) => {
    shape.rotation.y = time * 0.8;
  };
  scene.add(shape);

  setSimState({ currentShape: 'cylinder' });
  speakText("This is a 3D Cylinder! It has round flat faces and a curved surface!");
}

function buildLengthDetective3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // Pencil to measure
  const pencil = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 5, 12),
    new THREE.MeshStandardMaterial({ color: 0xfacc15 })
  );
  pencil.rotation.z = Math.PI / 2;
  pencil.position.set(0, 0.4, 0);
  scene.add(pencil);

  setSimState({ unitCount: 5, unitType: 'Paper Clips' });
  speakText("Measure the yellow pencil using paper clips! How many clips long is it?");
}

function buildLivingSorter3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // Living green basket vs Non-living blue basket
  const livingBox = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 1.2, 2.5),
    new THREE.MeshStandardMaterial({ color: 0x22c55e })
  );
  livingBox.position.set(-2.5, 0.6, 0);
  scene.add(livingBox);

  const nonLivingBox = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 1.2, 2.5),
    new THREE.MeshStandardMaterial({ color: 0x64748b })
  );
  nonLivingBox.position.set(2.5, 0.6, 0);
  scene.add(nonLivingBox);

  setSimState({ currentObject: 'Puppy' });
  speakText("Does a puppy grow, breathe, and need food? Yes! It is LIVING!");
}

function buildPlantGarden3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // Clay Flowerpot
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.0, 1.8, 24),
    new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.8 })
  );
  pot.position.y = 0.9;
  scene.add(pot);

  // Sprouting Plant Stem
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.18, 2.0, 12),
    new THREE.MeshStandardMaterial({ color: 0x16a34a })
  );
  stem.position.set(0, 2.2, 0);
  scene.add(stem);

  // Blossom
  const flower = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xf43f5e })
  );
  flower.position.set(0, 3.2, 0);
  scene.add(flower);

  setSimState({ stage: 'bloom', waterLevel: 100 });
  speakText("Sunlight, soil, and water helped our seed grow into a bright flower!");
}

function buildSensesExplorer3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  const bell = new THREE.Mesh(
    new THREE.ConeGeometry(0.8, 1.2, 16),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7 })
  );
  bell.position.y = 1.2;
  scene.add(bell);

  setSimState({ sense: 'hearing' });
  speakText("Hear the golden bell ring! We use our EARS to hear!");
}

function buildWaterSaver3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // Faucet Tap
  const faucet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 1.8, 16),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
  );
  faucet.position.set(0, 2.2, 0);
  scene.add(faucet);

  // Water Bucket
  const bucket = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 0.9, 1.4, 20),
    new THREE.MeshStandardMaterial({ color: 0x0284c7 })
  );
  bucket.position.set(0, 0.7, 0);
  scene.add(bucket);

  setSimState({ isTapOpen: false, dropsSaved: 10 });
  speakText("Good job! The tap is closed tight to save clean water!");
}

function buildSinkFloat3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // Clear Water Tub
  const tub = new THREE.Mesh(
    new THREE.BoxGeometry(6, 2.5, 4),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
    })
  );
  tub.position.y = 1.25;
  scene.add(tub);

  // Floating Wooden Block
  const wood = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.6, 1.2),
    new THREE.MeshStandardMaterial({ color: 0xb45309 })
  );
  wood.position.set(-1.4, 2.0, 0); // Floats at water level
  scene.add(wood);

  // Sunk Heavy Key/Rock
  const stone = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.6),
    new THREE.MeshStandardMaterial({ color: 0x475569 })
  );
  stone.position.set(1.4, 0.5, 0); // Sunk to bottom
  scene.add(stone);

  setSimState({ floatingItem: 'Wood', sunkItem: 'Stone' });
  speakText("Wood is light and FLOATS on top! Heavy stone SINKS to the bottom!");
}

function buildPushPull3D(
  scene: THREE.Scene,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  // 3 Surface Lanes: Ice (smooth), Wood (medium), Grass (rough)
  const ice = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.1, 7),
    new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.05 })
  );
  ice.position.set(-2.5, 0.05, 0);

  const grass = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.1, 7),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 })
  );
  grass.position.set(2.5, 0.05, 0);

  scene.add(ice, grass);

  // Red Toy Wagon
  const wagon = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.8, 1.6),
    new THREE.MeshStandardMaterial({ color: 0xef4444 })
  );
  wagon.position.set(-2.5, 0.6, 2.5);
  scene.add(wagon);

  setSimState({ surface: 'ice', force: 'push' });
  speakText("Push the wagon on smooth ice — it glides easily without stopping!");
}

function buildDefaultEarlyYears3D(
  scene: THREE.Scene,
  _setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void
) {
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6 })
  );
  cube.position.y = 1.2;
  scene.add(cube);
  speakText("Explore this hands-on 3D learning world! Touch and rotate to discover.");
}

/* ─────────────────────────────────────────────────────────────
   DYNAMIC ACTION DOCK BUTTONS PER SIMULATION
   ───────────────────────────────────────────────────────────── */
function renderSimulationDockButtons(
  simId: string,
  simState: any,
  setSimState: React.Dispatch<React.SetStateAction<any>>,
  speakText: (text: string) => void,
  triggerCelebration: () => void,
  setActiveHint: React.Dispatch<React.SetStateAction<string | null>>,
  scene?: THREE.Scene | null
) {
  const normId = simId.toLowerCase();

  // Spatial Furry Cat
  if (normId.includes('spatial-furry-cat')) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            FoundationalAudio.playPop();
            setSimState({ catPosition: 'tent' });
            const cat = scene?.getObjectByName('furryCat');
            if (cat) cat.position.set(-3.5, 0.4, -1.8);
            speakText("Meow! I'm INSIDE the colorful tent! ⛺");
          }}
          className={`px-5 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm shadow-md cursor-pointer min-h-[50px] flex items-center gap-2 transition-all ${
            simState?.catPosition === 'tent' ? 'ring-4 ring-rose-300 scale-105 shadow-xl font-black' : 'opacity-90 hover:opacity-100'
          }`}
        >
          ⛺ Inside Tent
        </button>
        <button
          type="button"
          onClick={() => {
            FoundationalAudio.playPop();
            setSimState({ catPosition: 'tree' });
            const cat = scene?.getObjectByName('furryCat');
            if (cat) cat.position.set(3.8, 4.4, -2.2);
            speakText("Meow! I'm on TOP of the green tree! 🌳");
          }}
          className={`px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md cursor-pointer min-h-[50px] flex items-center gap-2 transition-all ${
            simState?.catPosition === 'tree' ? 'ring-4 ring-emerald-300 scale-105 shadow-xl font-black' : 'opacity-90 hover:opacity-100'
          }`}
        >
          🌳 Top of Tree
        </button>
        <button
          type="button"
          onClick={() => {
            FoundationalAudio.playPop();
            setSimState({ catPosition: 'pond' });
            const cat = scene?.getObjectByName('furryCat');
            if (cat) cat.position.set(2.2, 0.2, 1.2);
            speakText("Meow! I'm NEAR the blue water pond! 💧");
          }}
          className={`px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm shadow-md cursor-pointer min-h-[50px] flex items-center gap-2 transition-all ${
            simState?.catPosition === 'pond' ? 'ring-4 ring-sky-300 scale-105 shadow-xl font-black' : 'opacity-90 hover:opacity-100'
          }`}
        >
          💧 Near Pond
        </button>
        <button
          type="button"
          onClick={() => {
            FoundationalAudio.playPop();
            setSimState({ catPosition: 'basket' });
            const cat = scene?.getObjectByName('furryCat');
            if (cat) cat.position.set(-2.5, 0.9, 2.5);
            speakText("Meow! I'm IN the cozy woven basket! 🧺");
          }}
          className={`px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-md cursor-pointer min-h-[50px] flex items-center gap-2 transition-all ${
            simState?.catPosition === 'basket' ? 'ring-4 ring-amber-300 scale-105 shadow-xl font-black' : 'opacity-90 hover:opacity-100'
          }`}
        >
          🧺 In Basket
        </button>
        <button
          type="button"
          onClick={() => {
            triggerCelebration();
          }}
          className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm shadow-md cursor-pointer min-h-[50px] flex items-center gap-2 transition-transform active:scale-95"
        >
          ⭐ I Found Her!
        </button>
      </>
    );
  }

  // Ramp Adventure
  if (normId.includes('ramp-adventure') || normId.includes('rolling-sliding')) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            FoundationalAudio.playDrop();
            speakText("Rolling the ball! Round shapes roll smoothly all the way down!");
          }}
          className="px-5 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm shadow-md cursor-pointer min-h-[50px] flex items-center gap-2"
        >
          🔴 Roll Ball
        </button>
        <button
          type="button"
          onClick={() => {
            FoundationalAudio.playDrop();
            speakText("Sliding the block! Flat shapes slide and stop!");
          }}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md cursor-pointer min-h-[50px] flex items-center gap-2"
        >
          🟦 Slide Block
        </button>
        <button
          type="button"
          onClick={triggerCelebration}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md cursor-pointer min-h-[50px] flex items-center gap-2"
        >
          🎉 Check Result!
        </button>
      </>
    );
  }

  // Counting Garden
  if (normId.includes('counting-garden-zero') || normId === 'g18-class1-counting') {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            FoundationalAudio.playSuccessChime();
            setSimState((s: any) => ({
              mangoesInTree: Math.max((s.mangoesInTree || 5) - 1, 0),
              mangoesInBasket: (s.mangoesInBasket || 0) + 1,
            }));
            speakText(`Gathered a mango into the basket! Basket count is now ${ (simState.mangoesInBasket || 0) + 1 }!`);
          }}
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md cursor-pointer min-h-[50px] flex items-center gap-2"
        >
          🥭 Pick Mango (+1)
        </button>
        <button
          type="button"
          onClick={() => {
            FoundationalAudio.playPop();
            speakText("When all mangoes are picked, ZERO are left on the tree! 0 means none!");
          }}
          className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-md cursor-pointer min-h-[50px] flex items-center gap-2"
        >
          0️⃣ Show Zero
        </button>
        <button
          type="button"
          onClick={triggerCelebration}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md cursor-pointer min-h-[50px] flex items-center gap-2"
        >
          ⭐ Basket Full!
        </button>
      </>
    );
  }

  // Measurement Balance
  if (normId.includes('measurement-balance')) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            FoundationalAudio.playDrop();
            speakText("Elephant is heavy! The left pan tilts down!");
          }}
          className="px-5 py-3 rounded-2xl bg-slate-700 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md cursor-pointer min-h-[50px] flex items-center gap-2"
        >
          🐘 Heavy Elephant
        </button>
        <button
          type="button"
          onClick={() => {
            FoundationalAudio.playDrop();
            speakText("Puppy is light! The pan moves up!");
          }}
          className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-md cursor-pointer min-h-[50px] flex items-center gap-2"
        >
          🐶 Light Puppy
        </button>
        <button
          type="button"
          onClick={triggerCelebration}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md cursor-pointer min-h-[50px] flex items-center gap-2"
        >
          ⚖️ Compare Weights
        </button>
      </>
    );
  }

  // Default actions for other modules
  return (
    <>
      <button
        type="button"
        onClick={() => {
          FoundationalAudio.playPop();
          speakText("Great interaction! Try another action or rotate in 3D!");
        }}
        className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md cursor-pointer min-h-[50px] flex items-center gap-2"
      >
        ✨ Play Action
      </button>
      <button
        type="button"
        onClick={() => {
          FoundationalAudio.playPop();
          setActiveHint("Touch or drag with your finger to spin the 3D scene around!");
        }}
        className="px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm shadow-md cursor-pointer min-h-[50px] flex items-center gap-2"
      >
        💡 Show Hint
      </button>
      <button
        type="button"
        onClick={triggerCelebration}
        className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md cursor-pointer min-h-[50px] flex items-center gap-2"
      >
        ⭐ I Finished!
      </button>
    </>
  );
}

/**
 * PositionPlayground.tsx
 * Simulation 01: My 3D Position Playground – Inside, Outside, Above and Below
 * Grade 1 • Mathematics • Chapter 1 (आकारप्रकार र स्थान)
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Layers,
  Compass,
  Star,
  Trophy,
  ArrowLeft,
  Eye,
  Play,
} from 'lucide-react';
import { createVillageEnvironment, VillageElements } from './VillageEnvironment';
import { createCharactersAndAnimals, VillageCharacters } from './CharactersAndAnimals';
import {
  PLAYGROUND_LEVELS,
  SimulationLevel,
  LevelStep,
  ASSESSMENT_QUESTIONS,
  AssessmentQuestion,
} from './PlaygroundLevels';
import { AudioController } from '../audio/AudioController';
import { api } from '../../services/api';

interface PositionPlaygroundProps {
  onBackToLibrary: () => void;
  userRole?: string;
  initialLanguage?: 'ne' | 'en';
}

export const PositionPlayground: React.FC<PositionPlaygroundProps> = ({
  onBackToLibrary,
  initialLanguage = 'ne',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Simulation State
  const [lang, setLang] = useState<'ne' | 'en'>(initialLanguage);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [mode, setMode] = useState<'GUIDED' | 'FREE_PLAY' | 'ASSESSMENT'>('GUIDED');
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  // Interaction & Feedback
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isDemoPlaying, setIsDemoPlaying] = useState<boolean>(false);

  // Assessment State
  const [assessmentIndex, setAssessmentIndex] = useState<number>(0);
  const [assessmentScore, setAssessmentScore] = useState<number>(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, boolean>>({});
  const [isAssessmentFinished, setIsAssessmentFinished] = useState<boolean>(false);
  const [isSavingProgress, setIsSavingProgress] = useState<boolean>(false);

  // Three.js References
  const threeRefs = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    environment: VillageElements;
    characters: VillageCharacters;
    animFrameId: number;
    clock: THREE.Clock;
    isDoorOpen: boolean;
  } | null>(null);

  const currentLevel: SimulationLevel = PLAYGROUND_LEVELS[currentLevelIdx] || PLAYGROUND_LEVELS[0];
  const currentStep: LevelStep = currentLevel.steps[currentStepIdx] || currentLevel.steps[0];

  // ── INITIALIZE THREE.JS 3D SCENE ─────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Three-quarter isometric viewpoint
    camera.position.set(12, 11, 16);
    camera.lookAt(0, 1.2, 0);

    // Build Environment & Characters
    const environment = createVillageEnvironment(scene);
    const characters = createCharactersAndAnimals(scene);
    const clock = new THREE.Clock();

    let isDoorOpen = false;

    // Animation Loop
    function animate() {
      const delta = clock.getDelta();
      environment.update(delta);
      characters.update(delta);
      renderer.render(scene, camera);
      threeRefs.current!.animFrameId = requestAnimationFrame(animate);
    }
    const animFrameId = requestAnimationFrame(animate);

    threeRefs.current = {
      renderer,
      scene,
      camera,
      environment,
      characters,
      animFrameId,
      clock,
      isDoorOpen,
    };

    // Resize Handler
    const handleResize = () => {
      if (!container || !threeRefs.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (threeRefs.current) {
        cancelAnimationFrame(threeRefs.current.animFrameId);
        renderer.dispose();
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  // ── SOUND & SPEECH ON STEP CHANGE ────────────────────────────
  useEffect(() => {
    if (mode === 'GUIDED') {
      const text = lang === 'ne' ? currentStep.instructionNe : currentStep.instructionEn;
      AudioController.speak(text, lang);
    } else if (mode === 'ASSESSMENT') {
      const q = ASSESSMENT_QUESTIONS[assessmentIndex];
      if (q) {
        const text = lang === 'ne' ? q.questionNe : q.questionEn;
        AudioController.speak(text, lang);
      }
    }
  }, [currentLevelIdx, currentStepIdx, mode, assessmentIndex, lang]);

  // ── TOGGLE AUDIO MUTE ────────────────────────────────────────
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    AudioController.setMuted(nextMuted);
  };

  // ── REPLAY CURRENT NARRATION ─────────────────────────────────
  const replayAudio = () => {
    if (mode === 'GUIDED') {
      const text = lang === 'ne' ? currentStep.instructionNe : currentStep.instructionEn;
      AudioController.speak(text, lang);
    } else if (mode === 'ASSESSMENT') {
      const q = ASSESSMENT_QUESTIONS[assessmentIndex];
      if (q) {
        const text = lang === 'ne' ? q.questionNe : q.questionEn;
        AudioController.speak(text, lang);
      }
    }
  };

  // ── RESET CAMERA VIEW ────────────────────────────────────────
  const resetCamera = () => {
    if (!threeRefs.current) return;
    const { camera } = threeRefs.current;
    camera.position.set(12, 11, 16);
    camera.lookAt(0, 1.2, 0);
    AudioController.playClick();
  };

  // ── RUN STEP DEMO ANIMATION ──────────────────────────────────
  const playStepDemo = () => {
    if (!threeRefs.current || isDemoPlaying) return;
    const { environment, characters } = threeRefs.current;
    setIsDemoPlaying(true);
    AudioController.playPop();

    if (currentStep.demoAction === 'door_cat') {
      // 1. Open the house door
      environment.openDoor(true);
      threeRefs.current.isDoorOpen = true;

      // 2. Cat walks into the house
      setTimeout(() => {
        characters.moveCatTo(-7.5, 0.4, -2.5, 1.5); // Inside house
      }, 500);

      // 3. Close door partially
      setTimeout(() => {
        environment.openDoor(false);
        setIsDemoPlaying(false);
        setFeedback({
          type: 'success',
          message: lang === 'ne' ? 'बिरालो घरभित्र पस्यो (भित्र)। कुकुर पिँढीमा बाहिर बस्यो (बाहिर)।' : 'Cat is inside the house! Dog is outside on the veranda.',
        });
        AudioController.playSuccess();
      }, 2500);
    } else if (currentStep.demoAction === 'bird_tree') {
      // Fly bird above tree
      characters.moveBirdTo(7.5, 4.8, -3.5, 1.2);
      // Place ball below table
      setTimeout(() => {
        environment.ball.position.set(4.5, 0.28, 0.5);
        setIsDemoPlaying(false);
        setFeedback({
          type: 'success',
          message: lang === 'ne' ? 'चरा रूखमाथि छ (माथि)। बल टेबलमुनि छ (तल)।' : 'Bird is above the tree. Ball is below the table.',
        });
        AudioController.playSuccess();
      }, 1400);
    } else {
      setIsDemoPlaying(false);
    }
  };

  // ── INTERACTIVE ACTION DISPATCHER ────────────────────────────
  const handleObjectPlacement = (targetPos: string) => {
    if (!threeRefs.current) return;
    const { environment, characters } = threeRefs.current;

    AudioController.playPop();

    // Check if user choice matches target step
    if (targetPos === currentStep.targetPosition) {
      AudioController.playSuccess();

      // Animate 3D scene according to correct placement
      if (currentStep.targetObject === 'cat') {
        if (targetPos === 'inside_house') {
          environment.openDoor(true);
          characters.moveCatTo(-7.5, 0.4, -2.5, 1.2);
          setTimeout(() => environment.openDoor(false), 1400);
        } else {
          characters.moveCatTo(-5.5, 0, 1.5, 1.0);
        }
      } else if (currentStep.targetObject === 'dog') {
        if (targetPos === 'outside_house') {
          characters.moveDogTo(-4.5, 0, 0.5, 1.0);
        }
      } else if (currentStep.targetObject === 'ball') {
        if (targetPos === 'inside_basket') {
          environment.ball.position.set(0.5, 0.45, 3.2);
        } else if (targetPos === 'outside_basket') {
          environment.ball.position.set(1.8, 0.28, 3.8);
        } else if (targetPos === 'below_table') {
          environment.ball.position.set(4.5, 0.28, 0.5);
        }
      } else if (currentStep.targetObject === 'bird') {
        if (targetPos === 'above_tree') {
          characters.moveBirdTo(7.5, 4.6, -3.5, 1.0);
        }
      } else if (currentStep.targetObject === 'waterPot') {
        if (targetPos === 'above_table') {
          environment.waterPot.position.set(4.5, 1.42, 0.5);
        }
      } else if (currentStep.targetObject === 'bag') {
        if (targetPos === 'below_table') {
          environment.bag.position.set(4.5, 0.25, 0.5);
        }
      } else if (currentStep.targetObject === 'child') {
        if (targetPos === 'right') {
          characters.moveChildTo(3.2, 0, 4.0, 1.0);
        } else if (targetPos === 'left') {
          characters.moveChildTo(-3.2, 0, 4.0, 1.0);
        }
      }

      setFeedback({
        type: 'success',
        message: lang === 'ne' ? 'धेरै राम्रो! सही ठाउँमा राख्नुभयो!' : 'Very good! Placed in the correct position!',
      });

      // Auto-advance to next step
      setTimeout(() => {
        handleNextStep();
      }, 1600);
    } else {
      AudioController.playBoop();
      setFeedback({
        type: 'error',
        message: lang === 'ne' ? `फेरि प्रयास गर्नुहोस्! ${currentStep.hintNe}` : `Try again! ${currentStep.hintEn}`,
      });
    }
  };

  // ── MULTIPLE CHOICE OPTION SELECTION ─────────────────────────
  const handleSelectOption = (opt: { isCorrect: boolean; explanationEn: string; explanationNe: string }) => {
    if (opt.isCorrect) {
      AudioController.playSuccess();
      setFeedback({
        type: 'success',
        message: lang === 'ne' ? opt.explanationNe : opt.explanationEn,
      });
      setTimeout(() => {
        handleNextStep();
      }, 1600);
    } else {
      AudioController.playBoop();
      setFeedback({
        type: 'error',
        message: lang === 'ne' ? opt.explanationNe : opt.explanationEn,
      });
    }
  };

  // ── ADVANCE STEP OR LEVEL ────────────────────────────────────
  const handleNextStep = () => {
    setFeedback({ type: null, message: '' });
    if (currentStepIdx < currentLevel.steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      // Level Complete!
      AudioController.playCelebration();
      if (currentLevelIdx < PLAYGROUND_LEVELS.length - 1) {
        setCurrentLevelIdx(currentLevelIdx + 1);
        setCurrentStepIdx(0);
      } else {
        // All 5 levels completed! Switch to assessment or free play
        setMode('FREE_PLAY');
      }
    }
  };

  const handlePrevStep = () => {
    setFeedback({ type: null, message: '' });
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    } else if (currentLevelIdx > 0) {
      setCurrentLevelIdx(currentLevelIdx - 1);
      setCurrentStepIdx(PLAYGROUND_LEVELS[currentLevelIdx - 1].steps.length - 1);
    }
  };

  // ── FINAL ASSESSMENT ANSWER SELECTION ────────────────────────
  const handleAssessmentAnswer = (isCorrect: boolean) => {
    const q = ASSESSMENT_QUESTIONS[assessmentIndex];
    if (isCorrect) {
      AudioController.playSuccess();
      setAssessmentScore((prev) => prev + 1);
      setAssessmentAnswers((prev) => ({ ...prev, [q.id]: true }));
    } else {
      AudioController.playBoop();
      setAssessmentAnswers((prev) => ({ ...prev, [q.id]: false }));
    }

    if (assessmentIndex < ASSESSMENT_QUESTIONS.length - 1) {
      setAssessmentIndex((prev) => prev + 1);
    } else {
      // Finished all 12 questions!
      setIsAssessmentFinished(true);
      AudioController.playCelebration();
      saveAssessmentProgress();
    }
  };

  // ── SAVE PROGRESS TO BACKEND API ─────────────────────────────
  const saveAssessmentProgress = async () => {
    setIsSavingProgress(true);
    try {
      const totalQ = ASSESSMENT_QUESTIONS.length;
      const finalScore = assessmentScore;
      const pct = Math.round((finalScore / totalQ) * 100);

      // Collect concepts understood and to review
      const understood: string[] = [];
      const toReview: string[] = [];

      ASSESSMENT_QUESTIONS.forEach((q) => {
        if (assessmentAnswers[q.id]) {
          understood.push(q.concept);
        } else {
          toReview.push(q.concept);
        }
      });

      await api.post('/simulation-activity/simulations/SIM-MATH-G1-CH1-01/progress', {
        gradeLevel: 1,
        subjectCode: 'MATH',
        chapterNumber: 1,
        simulationTitle: 'My 3D Position Playground',
        completedLevels: [1, 2, 3, 4, 5],
        assessmentScore: finalScore,
        totalQuestions: totalQ,
        percentage: pct,
        timeSpentSeconds: 300,
        conceptsUnderstood: Array.from(new Set(understood)),
        conceptsToReview: Array.from(new Set(toReview)),
        isCompleted: pct >= 60,
      });
    } catch (e) {
      console.warn('Unable to save simulation progress to backend:', e);
    } finally {
      setIsSavingProgress(false);
    }
  };

  // ── FREE PLAY INTERACTION BUTTONS ────────────────────────────
  const handleFreePlayAction = (action: string) => {
    if (!threeRefs.current) return;
    const { environment, characters } = threeRefs.current;
    AudioController.playPop();

    switch (action) {
      case 'toggle_door':
        threeRefs.current.isDoorOpen = !threeRefs.current.isDoorOpen;
        environment.openDoor(threeRefs.current.isDoorOpen);
        break;
      case 'cat_inside':
        environment.openDoor(true);
        characters.moveCatTo(-7.5, 0.4, -2.5, 1.2);
        setTimeout(() => environment.openDoor(false), 1400);
        break;
      case 'cat_outside':
        characters.moveCatTo(-5.5, 0, 1.5, 1.0);
        break;
      case 'dog_veranda':
        characters.moveDogTo(-4.5, 0, 0.5, 1.0);
        break;
      case 'dog_garden':
        characters.moveDogTo(1.5, 0, 2.5, 1.0);
        break;
      case 'bird_tree':
        characters.moveBirdTo(7.5, 4.6, -3.5, 1.0);
        break;
      case 'bird_roof':
        characters.moveBirdTo(-7.5, 4.8, -3.0, 1.2);
        break;
      case 'ball_basket':
        environment.ball.position.set(0.5, 0.45, 3.2);
        break;
      case 'ball_table_below':
        environment.ball.position.set(4.5, 0.28, 0.5);
        break;
      case 'pot_table_above':
        environment.waterPot.position.set(4.5, 1.42, 0.5);
        break;
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0f172a',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
        position: 'relative',
        userSelect: 'none',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── TOP HEADER / CONTROLS ─────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #0e3e3b 0%, #117a6b 100%)',
          color: '#ffffff',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 10,
          borderBottom: '2px solid rgba(255,255,255,0.12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onBackToLibrary}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              border: 'none',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <ArrowLeft size={16} />
            <span>{lang === 'ne' ? 'लाइब्रेरी फर्कनुहोस्' : 'Return to Library'}</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>
                {lang === 'ne' ? 'मेरो ३डी स्थिति खेलमैदान' : 'My 3D Position Playground'}
              </h2>
              <span
                style={{
                  background: '#fef08a',
                  color: '#854d0e',
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                }}
              >
                Class 1 • Math • Ch 1
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#bbf7d0' }}>
              {lang === 'ne' ? 'आकारप्रकार र स्थान (भित्र, बाहिर, माथि, तल, अग्लो, होचो, लामो, छोटो)' : 'Shapes & Position (Inside, Outside, Above, Below, Tall, Short, Long)'}
            </p>
          </div>
        </div>

        {/* Mode & Navigation Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '3px' }}>
            <button
              onClick={() => {
                setMode('GUIDED');
                AudioController.playClick();
              }}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                background: mode === 'GUIDED' ? '#ffffff' : 'transparent',
                color: mode === 'GUIDED' ? '#117a6b' : '#ffffff',
              }}
            >
              {lang === 'ne' ? 'सिकाइ पाठ' : 'Lessons (1–5)'}
            </button>
            <button
              onClick={() => {
                setMode('FREE_PLAY');
                AudioController.playClick();
              }}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                background: mode === 'FREE_PLAY' ? '#ffffff' : 'transparent',
                color: mode === 'FREE_PLAY' ? '#117a6b' : '#ffffff',
              }}
            >
              {lang === 'ne' ? 'खुला अन्वेषण' : 'Free Explore'}
            </button>
            <button
              onClick={() => {
                setMode('ASSESSMENT');
                setAssessmentIndex(0);
                setAssessmentScore(0);
                setIsAssessmentFinished(false);
                AudioController.playClick();
              }}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                background: mode === 'ASSESSMENT' ? '#f59e0b' : 'transparent',
                color: mode === 'ASSESSMENT' ? '#000000' : '#ffffff',
              }}
            >
              {lang === 'ne' ? 'मूल्याङ्कन' : 'Assessment'}
            </button>
          </div>

          {/* Bilingual Toggle */}
          <button
            onClick={() => setLang(lang === 'ne' ? 'en' : 'ne')}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '800',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {lang === 'ne' ? 'English' : 'नेपाली'}
          </button>

          {/* Audio Mute */}
          <button
            onClick={toggleMute}
            style={{
              padding: '7px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Reset Camera */}
          <button
            onClick={resetCamera}
            style={{
              padding: '7px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Reset 3D View"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* ── 3D CANVAS VIEWPORT ────────────────────────────────────── */}
      <div
        ref={mountRef}
        style={{
          flex: 1,
          width: '100%',
          position: 'relative',
          cursor: 'grab',
        }}
      />

      {/* ── BOTTOM INTERACTIVE HUD BAR ───────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '920px',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(12px)',
          borderRadius: '18px',
          padding: '16px 20px',
          boxShadow: '0 10px 35px rgba(0,0,0,0.25)',
          border: '2px solid rgba(255,255,255,0.8)',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {/* ── 1. GUIDED LEARNING MODE HUD ─────────────────────────── */}
        {mode === 'GUIDED' && (
          <>
            {/* Level Title & Progress Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    background: '#117a6b',
                    color: '#ffffff',
                    padding: '2px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '800',
                  }}
                >
                  Level {currentLevel.levelNumber} / {PLAYGROUND_LEVELS.length}
                </span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                  {lang === 'ne' ? currentLevel.titleNe : currentLevel.titleEn}
                </span>
              </div>

              {/* Progress step dots */}
              <div style={{ display: 'flex', gap: '5px' }}>
                {currentLevel.steps.map((st, idx) => (
                  <div
                    key={st.id}
                    style={{
                      width: idx === currentStepIdx ? '22px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: idx === currentStepIdx ? '#117a6b' : idx < currentStepIdx ? '#10b981' : '#cbd5e1',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Instruction Card with Audio Speaker */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#f8fafc',
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
              }}
            >
              <button
                onClick={replayAudio}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
                }}
                title="Play Audio Instruction"
              >
                <Volume2 size={20} />
              </button>

              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', lineHeight: 1.3 }}>
                  {lang === 'ne' ? currentStep.instructionNe : currentStep.instructionEn}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  {lang === 'ne' ? currentStep.hintNe : currentStep.hintEn}
                </p>
              </div>

              {/* Watch Demo button if available for this step */}
              {currentStep.demoAction && (
                <button
                  onClick={playStepDemo}
                  disabled={isDemoPlaying}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: '#e0f2fe',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: isDemoPlaying ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Play size={14} fill="#0369a1" />
                  <span>{lang === 'ne' ? 'डेमो हेर्नुहोस्' : 'Watch Demo'}</span>
                </button>
              )}
            </div>

            {/* Multiple Choice Options or Target Buttons */}
            {currentStep.options ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {currentStep.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: '#ffffff',
                      border: '2px solid #cbd5e1',
                      color: '#0f172a',
                      fontSize: '13px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      textAlign: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#117a6b')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
                  >
                    {lang === 'ne' ? opt.labelNe : opt.labelEn}
                  </button>
                ))}
              </div>
            ) : (
              /* Direct Interactive Placement Target Buttons */
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {currentStep.targetPosition.includes('inside') || currentStep.targetPosition.includes('outside') ? (
                  <>
                    <button
                      onClick={() => handleObjectPlacement('inside_house')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: '#f0fdf4',
                        color: '#166534',
                        border: '2px solid #86efac',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'ne' ? 'घरभित्र राख्नुहोस् (Inside)' : 'Put Inside House'}
                    </button>
                    <button
                      onClick={() => handleObjectPlacement('outside_house')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: '#fef2f2',
                        color: '#991b1b',
                        border: '2px solid #fca5a5',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'ne' ? 'घरबाहिर राख्नुहोस् (Outside)' : 'Put Outside House'}
                    </button>
                    <button
                      onClick={() => handleObjectPlacement('inside_basket')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: '#eff6ff',
                        color: '#1e40af',
                        border: '2px solid #93c5fd',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'ne' ? 'टोकरीभित्र (Inside Basket)' : 'Put in Basket'}
                    </button>
                    <button
                      onClick={() => handleObjectPlacement('outside_basket')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: '#faf5ff',
                        color: '#6b21a8',
                        border: '2px solid #d8b4fe',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'ne' ? 'टोकरीबाहिर (Outside Basket)' : 'Put Outside Basket'}
                    </button>
                  </>
                ) : currentStep.targetPosition.includes('above') || currentStep.targetPosition.includes('below') ? (
                  <>
                    <button
                      onClick={() => handleObjectPlacement('above_tree')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: '#ecfdf5',
                        color: '#065f46',
                        border: '2px solid #6ee7b7',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'ne' ? 'रूखमाथि (Above Tree)' : 'Above Tree'}
                    </button>
                    <button
                      onClick={() => handleObjectPlacement('below_table')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: '#fef3c7',
                        color: '#92400e',
                        border: '2px solid #fcd34d',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'ne' ? 'टेबलमुनि तल (Below Table)' : 'Below Table'}
                    </button>
                    <button
                      onClick={() => handleObjectPlacement('above_table')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: '#e0f2fe',
                        color: '#075985',
                        border: '2px solid #7dd3fc',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'ne' ? 'टेबलमाथि (Above Table)' : 'Above Table'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleObjectPlacement('right')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: '#f0fdf4',
                        color: '#166534',
                        border: '2px solid #86efac',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'ne' ? 'दायाँ लैजानुहोस् (Right)' : 'Move to Right'}
                    </button>
                    <button
                      onClick={() => handleObjectPlacement('left')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        background: '#eff6ff',
                        color: '#1e40af',
                        border: '2px solid #93c5fd',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'ne' ? 'बायाँ लैजानुहोस् (Left)' : 'Move to Left'}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Feedback Alert Banner */}
            {feedback.message && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  background: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
                  color: feedback.type === 'success' ? '#166534' : '#991b1b',
                  border: `1px solid ${feedback.type === 'success' ? '#86efac' : '#fca5a5'}`,
                }}
              >
                {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* Navigation buttons: Prev / Next */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handlePrevStep}
                disabled={currentLevelIdx === 0 && currentStepIdx === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: currentLevelIdx === 0 && currentStepIdx === 0 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={14} /> {lang === 'ne' ? 'अघिल्लो' : 'Previous'}
              </button>

              <button
                onClick={handleNextStep}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  background: '#117a6b',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                <span>{lang === 'ne' ? 'पछिल्लो' : 'Next Step'}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </>
        )}

        {/* ── 2. FREE EXPLORATION MODE HUD ────────────────────────── */}
        {mode === 'FREE_PLAY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                  {lang === 'ne' ? 'खुला खेलमैदान अन्वेषण (Free Play)' : 'Free Sandbox Village Exploration'}
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                  {lang === 'ne' ? 'कुनै पनि जनावर वा वस्तुलाई थिचेर स्थान परिवर्तन गर्नुहोस् र रमाइलो गर्नुहोस्।' : 'Freely move animals and objects around the village playground.'}
                </p>
              </div>

              <button
                onClick={() => {
                  setMode('ASSESSMENT');
                  setAssessmentIndex(0);
                  setAssessmentScore(0);
                  setIsAssessmentFinished(false);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#f59e0b',
                  color: '#000000',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Trophy size={14} />
                <span>{lang === 'ne' ? 'मूल्याङ्कन सुरु गर्नुहोस्' : 'Start Final Assessment'}</span>
              </button>
            </div>

            {/* Quick action buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                onClick={() => handleFreePlayAction('toggle_door')}
                style={{ padding: '6px 12px', borderRadius: '6px', background: '#e2e8f0', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
              >
                🚪 {lang === 'ne' ? 'ढोका खोल्नुहोस् / बन्द गर्नुहोस्' : 'Toggle Door'}
              </button>
              <button
                onClick={() => handleFreePlayAction('cat_inside')}
                style={{ padding: '6px 12px', borderRadius: '6px', background: '#dcfce7', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#166534' }}
              >
                🐱 {lang === 'ne' ? 'बिरालो घरभित्र' : 'Cat Inside'}
              </button>
              <button
                onClick={() => handleFreePlayAction('cat_outside')}
                style={{ padding: '6px 12px', borderRadius: '6px', background: '#fee2e2', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#991b1b' }}
              >
                🐱 {lang === 'ne' ? 'बिरालो बाहिर' : 'Cat Outside'}
              </button>
              <button
                onClick={() => handleFreePlayAction('bird_tree')}
                style={{ padding: '6px 12px', borderRadius: '6px', background: '#e0f2fe', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#0369a1' }}
              >
                🐦 {lang === 'ne' ? 'चरा रूखमाथि' : 'Bird Above Tree'}
              </button>
              <button
                onClick={() => handleFreePlayAction('ball_table_below')}
                style={{ padding: '6px 12px', borderRadius: '6px', background: '#fef3c7', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#92400e' }}
              >
                ⚽ {lang === 'ne' ? 'बल टेबलमुनि तल' : 'Ball Below Table'}
              </button>
              <button
                onClick={() => handleFreePlayAction('ball_basket')}
                style={{ padding: '6px 12px', borderRadius: '6px', background: '#fae8ff', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#86198f' }}
              >
                🧺 {lang === 'ne' ? 'बल टोकरीभित्र' : 'Ball in Basket'}
              </button>
            </div>
          </div>
        )}

        {/* ── 3. ASSESSMENT MODE HUD ──────────────────────────────── */}
        {mode === 'ASSESSMENT' && (
          <div>
            {!isAssessmentFinished ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background: '#f59e0b',
                        color: '#000000',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '800',
                      }}
                    >
                      Question {assessmentIndex + 1} / {ASSESSMENT_QUESTIONS.length}
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                      {lang === 'ne' ? ASSESSMENT_QUESTIONS[assessmentIndex].conceptNe : ASSESSMENT_QUESTIONS[assessmentIndex].concept}
                    </span>
                  </div>

                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#16a34a' }}>
                    Score: {assessmentScore} / {assessmentIndex}
                  </span>
                </div>

                {/* Question Prompt */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: '#fffbeb',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #fef3c7',
                  }}
                >
                  <button
                    onClick={replayAudio}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#f59e0b',
                      color: '#000000',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <Volume2 size={16} />
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#78350f' }}>
                    {lang === 'ne' ? ASSESSMENT_QUESTIONS[assessmentIndex].questionNe : ASSESSMENT_QUESTIONS[assessmentIndex].questionEn}
                  </span>
                </div>

                {/* Multiple Choice Answers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                  {ASSESSMENT_QUESTIONS[assessmentIndex].options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleAssessmentAnswer(opt.isCorrect)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: '#ffffff',
                        border: '2px solid #cbd5e1',
                        color: '#0f172a',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#f59e0b')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
                    >
                      {lang === 'ne' ? opt.labelNe : opt.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Assessment Completion Screen */
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <Trophy size={42} color="#f59e0b" style={{ margin: '0 auto 8px auto' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                  {lang === 'ne' ? 'बधाई छ! मूल्याङ्कन पूरा भयो!' : 'Congratulations! Assessment Completed!'}
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 12px 0' }}>
                  {lang === 'ne' ? `तपाईंको नतिजा: ${assessmentScore} / ${ASSESSMENT_QUESTIONS.length} (${Math.round((assessmentScore / ASSESSMENT_QUESTIONS.length) * 100)}%)` : `Your Score: ${assessmentScore} / ${ASSESSMENT_QUESTIONS.length} (${Math.round((assessmentScore / ASSESSMENT_QUESTIONS.length) * 100)}%)`}
                </p>

                {/* Stars earned */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                  {[1, 2, 3].map((starIdx) => {
                    const earned = assessmentScore >= starIdx * 4;
                    return (
                      <Star
                        key={starIdx}
                        size={28}
                        fill={earned ? '#f59e0b' : '#e2e8f0'}
                        color={earned ? '#d97706' : '#cbd5e1'}
                      />
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button
                    onClick={() => {
                      setAssessmentIndex(0);
                      setAssessmentScore(0);
                      setIsAssessmentFinished(false);
                      AudioController.playClick();
                    }}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      background: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    {lang === 'ne' ? 'फेरि प्रयास गर्नुहोस्' : 'Try Again'}
                  </button>

                  <button
                    onClick={onBackToLibrary}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '8px',
                      background: '#117a6b',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                    }}
                  >
                    {lang === 'ne' ? 'लाइब्रेरी फर्कनुहोस्' : 'Return to Library'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


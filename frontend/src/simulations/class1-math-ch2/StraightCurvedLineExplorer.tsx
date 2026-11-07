/**
 * StraightCurvedLineExplorer.tsx
 * Simulation 01: Straight and Curved Line Explorer (सीधा र बाङ्गो रेखा चिनौँ)
 * Class 1 • Mathematics • Chapter 2: Lines (रेखाहरू)
 */
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Trophy,
  Star,
  CheckCircle2,
  XCircle,
  Layers,
  ChevronRight,
  ChevronLeft,
  Play,
  Eye,
} from 'lucide-react';
import { createLineEnvironment, LineElements } from './LineEnvironment';
import { AudioController } from '../audio/AudioController';
import { api } from '../../services/api';

interface StraightCurvedLineExplorerProps {
  onBackToLibrary: () => void;
  userRole?: string;
  initialLanguage?: 'ne' | 'en';
}

export const StraightCurvedLineExplorer: React.FC<StraightCurvedLineExplorerProps> = ({
  onBackToLibrary,
  initialLanguage = 'ne',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState<'ne' | 'en'>(initialLanguage);
  const [isMuted, setIsMuted] = useState(false);
  const [mode, setMode] = useState<'GUIDED' | 'FREE_PLAY' | 'ASSESSMENT'>('GUIDED');
  const [levelIdx, setLevelIdx] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [ropeIsStraight, setRopeIsStraight] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Assessment State
  const [assessmentIdx, setAssessmentIdx] = useState(0);
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [isAssessmentDone, setIsAssessmentDone] = useState(false);

  // Three.js References
  const threeRefs = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    environment: LineElements;
    animFrameId: number;
    clock: THREE.Clock;
  } | null>(null);

  // ── 4 GUIDED LEARNING LEVELS ─────────────────────────────────
  const levels = [
    {
      levelNumber: 1,
      titleEn: 'Introduction to Lines',
      titleNe: 'रेखाको परिचय',
      conceptEn: 'Straight vs Curved',
      conceptNe: 'सिधा र बाङ्गो रेखा',
      steps: [
        {
          instructionEn: 'A straight line goes straight without bending. A curved line bends or turns.',
          instructionNe: 'सिधा रेखा कतै पनि नबाङ्गिई सिधा जान्छ। बाङ्गो रेखा घुमेर वा बाङ्गिएर जान्छ।',
          action: 'intro_demo',
          hintEn: 'Look at the straight line and the curved line on screen.',
          hintNe: 'पर्दामा देखिएका सिधा र बाङ्गो रेखाहरू हेर्नुहोस्।',
        },
        {
          instructionEn: 'Tap "Straight Line (सिधा रेखा)" to see how a straight line is drawn.',
          instructionNe: '"सिधा रेखा" छानेर सिधा रेखा कसरी कोरिन्छ हेर्नुहोस्।',
          action: 'draw_straight',
          hintEn: 'A straight line does not bend anywhere.',
          hintNe: 'सिधा रेखा कतै पनि मोडिँदैन।',
        },
        {
          instructionEn: 'Tap "Curved Line (बाङ्गो रेखा)" to see how a curved line turns.',
          instructionNe: '"बाङ्गो रेखा" छानेर बाङ्गो रेखा कसरी घुम्छ हेर्नुहोस्।',
          action: 'draw_curved',
          hintEn: 'A curved line has bends and turns.',
          hintNe: 'बाङ्गो रेखामा घुम्ती र मोडहरू हुन्छन्।',
        },
      ],
    },
    {
      levelNumber: 2,
      titleEn: 'Identify Lines in 3D Village',
      titleNe: 'गाउँमा सिधा र बाङ्गो रेखा चिनौँ',
      conceptEn: 'Real-World Objects',
      conceptNe: 'दैनिक जीवनका वस्तुहरू',
      steps: [
        {
          instructionEn: 'Find and tap the STRAIGHT village road! (सिधा सडक)',
          instructionNe: 'गाउँको सिधा सडक पत्ता लगाउनुहोस्! (सिधा सडक)',
          targetObject: 'straight_road',
          isStraight: true,
          hintEn: 'The asphalt road with the white line goes straight.',
          hintNe: 'सेतो धर्का भएको सडक कतै नमोडिई सिधा गएको छ।',
        },
        {
          instructionEn: 'Find and tap the CURVED winding road! (बाङ्गो सडक)',
          instructionNe: 'गाउँको बाङ्गो सडक पत्ता लगाउनुहोस्! (बाङ्गो सडक)',
          targetObject: 'curved_road',
          isStraight: false,
          hintEn: 'The yellow-striped road has winding curves.',
          hintNe: 'पहेँलो धर्का भएको बाटो दायाँ-बायाँ घुमेको छ।',
        },
        {
          instructionEn: 'Find the STRAIGHT wooden stick on the grass! (सिधा लठ्ठी)',
          instructionNe: 'घाँसमा रहेको सिधा काठको लठ्ठी छान्नुहोस्! (सिधा लठ्ठी)',
          targetObject: 'straight_stick',
          isStraight: true,
          hintEn: 'The stick is rigid and straight.',
          hintNe: 'लठ्ठी कतै पनि नखुम्चिएको सिधा छ।',
        },
        {
          instructionEn: 'Find the CURVED flower garden boundary! (बाङ्गो बगैँचा)',
          instructionNe: 'फूलबारीको बाङ्गो घेरा पत्ता लगाउनुहोस्! (बाङ्गो घेरा)',
          targetObject: 'curved_garden',
          isStraight: false,
          hintEn: 'The terracotta bricks form a curved circle.',
          hintNe: 'इँटाहरू घुमाउरो पारेर गोलाकार राखिएका छन्।',
        },
        {
          instructionEn: 'Find the STRAIGHT bridge across the river! (सिधा पुल)',
          instructionNe: 'नदीमाथिको सिधा काठको पुल छान्नुहोस्! (सिधा पुल)',
          targetObject: 'straight_bridge',
          isStraight: true,
          hintEn: 'The wooden bridge deck goes straight across the river.',
          hintNe: 'काठको पुल सिधा नदी वारपार गर्छ।',
        },
      ],
    },
    {
      levelNumber: 3,
      titleEn: 'Straight Rope and Curved Rope',
      titleNe: 'सिधा डोरी र बाङ्गो डोरी',
      conceptEn: 'Tug-of-War Activity',
      conceptNe: 'डोरी तन्काउने अभ्यास',
      steps: [
        {
          instructionEn: 'Look at the rope on the lawn. Is it straight or curved right now?',
          instructionNe: 'घाँसमा रहेको डोरी हेर्नुहोस्। अहिले यो सिधा छ कि बाङ्गो?',
          action: 'rope_check',
          options: [
            { id: 'curved', labelEn: 'Curved Rope (बाङ्गो डोरी)', labelNe: 'बाङ्गो डोरी', isCorrect: true },
            { id: 'straight', labelEn: 'Straight Rope (सिधा डोरी)', labelNe: 'सिधा डोरी', isCorrect: false },
          ],
          hintEn: 'The rope is resting loosely with bends and waves.',
          hintNe: 'डोरी भुइँमा खुकुलो भएर बाङ्गो-टिङ्गो परेको छ।',
        },
        {
          instructionEn: 'Pull both ends of the rope to make it STRAIGHT! (सिधा बनाउनुहोस्)',
          instructionNe: 'डोरीका दुवै छेउ तानेर यसलाई सिधा बनाउनुहोस्!',
          action: 'pull_rope',
          hintEn: 'When you pull a rope tight, it turns into a straight line.',
          hintNe: 'दुवैतिरबाट कसेर तान्दा डोरी सिधा रेखा बन्छ।',
        },
      ],
    },
    {
      levelNumber: 4,
      titleEn: 'Compare and Classify Lines',
      titleNe: 'रेखाहरू छुट्याएर वर्गीकरण गरौँ',
      conceptEn: 'Classification (Blue & Red)',
      conceptNe: 'सिधा र बाङ्गो छुट्याउने',
      steps: [
        {
          instructionEn: 'Which line is a STRAIGHT LINE? (सिधा रेखा)',
          instructionNe: 'कुन रेखा सिधा रेखा हो? (सिधा रेखा)',
          options: [
            { id: 's1', labelEn: 'Straight Horizontal Line (—)', labelNe: 'सिधा तेर्सो रेखा', isCorrect: true },
            { id: 'c1', labelEn: 'Wavy Curved Line (~)', labelNe: 'बाङ्गो छाल परेको रेखा', isCorrect: false },
          ],
          hintEn: 'Straight lines do not have curves.',
          hintNe: 'सिधा रेखामा कुनै मोड हुँदैन।',
        },
        {
          instructionEn: 'Which line is a CURVED LINE? (बाङ्गो रेखा)',
          instructionNe: 'कुन रेखा बाङ्गो रेखा हो? (बाङ्गो रेखा)',
          options: [
            { id: 'c2', labelEn: 'Rainbow Curved Arc (⌒)', labelNe: 'इन्द्रेणी जस्तै बाङ्गो रेखा', isCorrect: true },
            { id: 's2', labelEn: 'Straight Vertical Pillar (|)', labelNe: 'सिधा ठाडो रेखा', isCorrect: false },
          ],
          hintEn: 'Curved lines bend like an arch or rainbow.',
          hintNe: 'बाङ्गो रेखा इन्द्रेणी जस्तै घुमेको हुन्छ।',
        },
      ],
    },
  ];

  const currentLevel = levels[levelIdx] || levels[0];
  const currentStep = currentLevel.steps[stepIdx] || currentLevel.steps[0];

  // ── 12 FINAL ASSESSMENT QUESTIONS ─────────────────────────────
  const assessmentQuestions = [
    {
      promptEn: 'Which line goes straight from one point to another without bending?',
      promptNe: 'कुनै पनि ठाउँमा नबाङ्गिई जाने रेखालाई के भनिन्छ?',
      options: [
        { id: 's', labelEn: 'Straight Line (सिधा रेखा)', labelNe: 'सिधा रेखा', isCorrect: true, expEn: 'Correct! A straight line does not bend.', expNe: 'सबास! सिधा रेखा कतै पनि मोडिँदैन।' },
        { id: 'c', labelEn: 'Curved Line (बाङ्गो रेखा)', labelNe: 'बाङ्गो रेखा', isCorrect: false, expEn: 'Curved lines bend and turn.', expNe: 'बाङ्गो रेखा घुम्ने गर्छ।' },
      ],
    },
    {
      promptEn: 'A railway track running through the Terai plains is an example of:',
      promptNe: 'तराईको समथर मैदानमा रहेको रेलको लिक केको उदाहरण हो?',
      options: [
        { id: 's', labelEn: 'Straight Line (सिधा रेखा)', labelNe: 'सिधा रेखा', isCorrect: true, expEn: 'Railway tracks in plains run in straight lines.', expNe: 'सबास! रेलको लिक सिधा जान्छ।' },
        { id: 'c', labelEn: 'Curved Line (बाङ्गो रेखा)', labelNe: 'बाङ्गो रेखा', isCorrect: false, expEn: 'It runs straight without turns.', expNe: 'यो नघुमीकन सिधा जान्छ।' },
      ],
    },
    {
      promptEn: 'A mountain river flowing through hills forms a:',
      promptNe: 'पहाडको खोँचबाट बग्ने नदीले कस्तो रेखा बनाउँछ?',
      options: [
        { id: 'c', labelEn: 'Curved Winding Line (बाङ्गो रेखा)', labelNe: 'बाङ्गो घुमाउरो रेखा', isCorrect: true, expEn: 'Rivers curve around hills and rocks.', expNe: 'सबास! नदी पहाडको वरिपरि घुम्दै बाङ्गो भएर बग्छ।' },
        { id: 's', labelEn: 'Straight Line (सिधा रेखा)', labelNe: 'सिधा रेखा', isCorrect: false, expEn: 'Rivers bend and curve.', expNe: 'नदी सिधा हुँदैन, घुम्छ।' },
      ],
    },
    {
      promptEn: 'When two teams pull a tug-of-war rope tightly, the rope becomes:',
      promptNe: 'डोरी तान्ने खेलमा दुवैतिरबाट कसेर तान्दा डोरी कस्तो बन्छ?',
      options: [
        { id: 's', labelEn: 'Straight (सिधा)', labelNe: 'सिधा', isCorrect: true, expEn: 'A tight rope is straight!', expNe: 'सबास! कसेर तन्काइएको डोरी सिधा हुन्छ।' },
        { id: 'c', labelEn: 'Curved (बाङ्गो)', labelNe: 'बाङ्गो', isCorrect: false, expEn: 'Tension pulls the rope straight.', expNe: 'तान्दा डोरी सिधा बन्छ।' },
      ],
    },
    {
      promptEn: 'A rainbow in the sky forms what kind of line?',
      promptNe: 'आकाशमा देखिने इन्द्रेणीले कस्तो रेखा बनाउँछ?',
      options: [
        { id: 'c', labelEn: 'Curved Line (बाङ्गो रेखा)', labelNe: 'बाङ्गो रेखा', isCorrect: true, expEn: 'A rainbow forms a curved arch in the sky.', expNe: 'सबास! इन्द्रेणी घुमाउरो बाङ्गो हुन्छ।' },
        { id: 's', labelEn: 'Straight Line (सिधा रेखा)', labelNe: 'सिधा रेखा', isCorrect: false, expEn: 'Rainbows are curved, not straight.', expNe: 'इन्द्रेणी सिधा हुँदैन।' },
      ],
    },
    {
      promptEn: 'According to our textbook, what colour do we use for STRAIGHT lines?',
      promptNe: 'हाम्रो गणित पुस्तक अनुसार सिधा रेखामा कुन रङ भरिन्छ?',
      options: [
        { id: 'b', labelEn: 'Blue (नीलो रङ)', labelNe: 'नीलो रङ', isCorrect: true, expEn: 'Correct! The textbook colours straight lines blue.', expNe: 'सबास! पाठ्यपुस्तकमा सिधा रेखामा नीलो रङ लगाइन्छ।' },
        { id: 'r', labelEn: 'Red (रातो रङ)', labelNe: 'रातो रङ', isCorrect: false, expEn: 'Red is used for curved lines.', expNe: 'रातो रङ बाङ्गो रेखामा प्रयोग गरिन्छ।' },
      ],
    },
    {
      promptEn: 'According to our textbook, what colour do we use for CURVED lines?',
      promptNe: 'हाम्रो गणित पुस्तक अनुसार बाङ्गो रेखामा कुन रङ भरिन्छ?',
      options: [
        { id: 'r', labelEn: 'Red (रातो रङ)', labelNe: 'रातो रङ', isCorrect: true, expEn: 'Curved lines are coloured red!', expNe: 'सबास! बाङ्गो रेखामा रातो रङ लगाइन्छ।' },
        { id: 'b', labelEn: 'Blue (नीलो रङ)', labelNe: 'नीलो रङ', isCorrect: false, expEn: 'Blue is for straight lines.', expNe: 'नीलो रङ सिधा रेखाको लागि हो।' },
      ],
    },
    {
      promptEn: 'If we join two dots with a taut ruler, what line do we make?',
      promptNe: 'दुई थोप्लालाई स्केल राखेर जोड्दा कस्तो रेखा बन्छ?',
      options: [
        { id: 's', labelEn: 'Straight Line (सिधा रेखा)', labelNe: 'सिधा रेखा', isCorrect: true, expEn: 'Joining two dots directly creates a straight line.', expNe: 'सबास! दुई थोप्ला सिधा जोड्दा सिधा रेखा बन्छ।' },
        { id: 'c', labelEn: 'Curved Line (बाङ्गो रेखा)', labelNe: 'बाङ्गो रेखा', isCorrect: false, expEn: 'A straight edge guides a straight line.', expNe: 'स्केलले सिधा रेखा बनाउँछ।' },
      ],
    },
    {
      promptEn: 'Which tool has a straight edge that helps us draw straight lines?',
      promptNe: 'सिधा रेखा कोर्न मद्दत गर्ने सिधा किनारा भएको साधन कुन हो?',
      options: [
        { id: 'ruler', labelEn: 'Wooden Ruler / Scale (काठको स्केल)', labelNe: 'काठको स्केल', isCorrect: true, expEn: 'A ruler has a perfectly straight edge.', expNe: 'सबास! स्केलको किनारा सिधा हुन्छ।' },
        { id: 'ball', labelEn: 'Round Football (गोलो फुटबल)', labelNe: 'गोलो फुटबल', isCorrect: false, expEn: 'A football is round and curved.', expNe: 'फुटबल गोलो हुन्छ।' },
      ],
    },
    {
      promptEn: 'The round rim of a tea cup is made of what kind of line?',
      promptNe: 'चिया खाने कपको गोलो किनारा कस्तो रेखाले बनेको हुन्छ?',
      options: [
        { id: 'c', labelEn: 'Curved Line (बाङ्गो रेखा)', labelNe: 'बाङ्गो रेखा', isCorrect: true, expEn: 'Circular rims are curved lines.', expNe: 'सबास! कपको गोलो मुख बाङ्गो रेखा हो।' },
        { id: 's', labelEn: 'Straight Line (सिधा रेखा)', labelNe: 'सिधा रेखा', isCorrect: false, expEn: 'Circles are curved.', expNe: 'गोलो घेरा बाङ्गो हुन्छ।' },
      ],
    },
    {
      promptEn: 'A snake slithering across the sand forms a:',
      promptNe: 'बालुवामा घस्रिँदै हिँडेको सर्पले कस्तो रेखा बनाउँछ?',
      options: [
        { id: 'c', labelEn: 'Curved Wavy Path (बाङ्गो रेखा)', labelNe: 'बाङ्गो घुमाउरो बाटो', isCorrect: true, expEn: 'Snakes move in smooth curves!', expNe: 'सबास! सर्प घुम्दै बाङ्गो भएर हिँड्छ।' },
        { id: 's', labelEn: 'Straight Line (सिधा रेखा)', labelNe: 'सिधा रेखा', isCorrect: false, expEn: 'Snakes bend as they slither.', expNe: 'सर्प सिधा हिँड्दैन।' },
      ],
    },
    {
      promptEn: 'The edge of your mathematics textbook is a:',
      promptNe: 'तपाईंको गणित किताबको किनारा कस्तो हुन्छ?',
      options: [
        { id: 's', labelEn: 'Straight Edge (सिधा किनारा)', labelNe: 'सिधा किनारा', isCorrect: true, expEn: 'Textbook pages have straight edges.', expNe: 'सबास! किताबका पानाका किनाराहरू सिधा हुन्छन्।' },
        { id: 'c', labelEn: 'Curved Edge (बाङ्गो किनारा)', labelNe: 'बाङ्गो किनारा', isCorrect: false, expEn: 'Book edges are straight.', expNe: 'किताबका किनारा सिधा हुन्छन्।' },
      ],
    },
  ];

  // ── INITIALIZE THREE.JS 3D SCENE ─────────────────────────────
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(10, 12, 18);
    camera.lookAt(0, 0.5, 0);

    const environment = createLineEnvironment(scene);
    const clock = new THREE.Clock();

    function animate() {
      const delta = clock.getDelta();
      environment.update(delta);
      renderer.render(scene, camera);
      threeRefs.current!.animFrameId = requestAnimationFrame(animate);
    }
    const animFrameId = requestAnimationFrame(animate);

    threeRefs.current = {
      renderer,
      scene,
      camera,
      environment,
      animFrameId,
      clock,
    };

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

  // ── AUDIO NARRATION ON STEP CHANGE ───────────────────────────
  useEffect(() => {
    if (mode === 'GUIDED') {
      const text = lang === 'ne' ? currentStep.instructionNe : currentStep.instructionEn;
      AudioController.speak(text, lang);
    } else if (mode === 'ASSESSMENT') {
      const q = assessmentQuestions[assessmentIdx];
      if (q) {
        const text = lang === 'ne' ? q.promptNe : q.promptEn;
        AudioController.speak(text, lang);
      }
    }
  }, [levelIdx, stepIdx, mode, assessmentIdx, lang]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    AudioController.setMuted(next);
  };

  const replayAudio = () => {
    if (mode === 'GUIDED') {
      const text = lang === 'ne' ? currentStep.instructionNe : currentStep.instructionEn;
      AudioController.speak(text, lang);
    } else if (mode === 'ASSESSMENT') {
      const q = assessmentQuestions[assessmentIdx];
      if (q) {
        const text = lang === 'ne' ? q.promptNe : q.promptEn;
        AudioController.speak(text, lang);
      }
    }
  };

  const resetCamera = () => {
    if (!threeRefs.current) return;
    const { camera } = threeRefs.current;
    camera.position.set(10, 12, 18);
    camera.lookAt(0, 0.5, 0);
    AudioController.playClick();
  };

  // ── INTERACTIVE STEP ACTIONS ─────────────────────────────────
  const handleSelectObject = (targetObjName: string, isStraight: boolean) => {
    if (!threeRefs.current) return;
    const { environment } = threeRefs.current;
    AudioController.playPop();

    environment.highlightObject(targetObjName, isStraight);

    if ((currentStep as any).targetObject === targetObjName) {
      AudioController.playSuccess();
      setFeedback({
        type: 'success',
        message: lang === 'ne' ? 'सबास! तपाईंले सही वस्तु पहिचान गर्नुभयो!' : 'Excellent! You identified the correct object!',
      });
      setTimeout(() => {
        setFeedback({ type: null, message: '' });
        handleNextStep();
      }, 1600);
    } else {
      AudioController.playBoop();
      setFeedback({
        type: 'error',
        message: lang === 'ne' ? 'फेरि प्रयास गर्नुहोस्! रेखाको आकार हेर्नुहोस्।' : 'Try again! Look closely at the shape of the line.',
      });
    }
  };

  const handlePullRope = (pullStraight: boolean) => {
    if (!threeRefs.current) return;
    const { environment } = threeRefs.current;
    AudioController.playPop();

    setRopeIsStraight(pullStraight);
    environment.setRopeState(pullStraight);

    if (pullStraight) {
      AudioController.playSuccess();
      setFeedback({
        type: 'success',
        message: lang === 'ne' ? 'डोरी कसेर तान्दा सिधा रेखा बन्यो!' : 'Pulling the rope tight made a straight line!',
      });
      setTimeout(() => {
        setFeedback({ type: null, message: '' });
        handleNextStep();
      }, 1600);
    }
  };

  const handleSelectOption = (opt: { isCorrect: boolean }) => {
    if (opt.isCorrect) {
      AudioController.playSuccess();
      setFeedback({
        type: 'success',
        message: lang === 'ne' ? 'सबास! सही जवाफ!' : 'Very good! Correct answer!',
      });
      setTimeout(() => {
        setFeedback({ type: null, message: '' });
        handleNextStep();
      }, 1600);
    } else {
      AudioController.playBoop();
      setFeedback({
        type: 'error',
        message: lang === 'ne' ? 'फेरि प्रयास गर्नुहोस्!' : 'Try again!',
      });
    }
  };

  const handleNextStep = () => {
    setFeedback({ type: null, message: '' });
    if (stepIdx < currentLevel.steps.length - 1) {
      setStepIdx(stepIdx + 1);
    } else if (levelIdx < levels.length - 1) {
      AudioController.playCelebration();
      setLevelIdx(levelIdx + 1);
      setStepIdx(0);
    } else {
      AudioController.playCelebration();
      setMode('FREE_PLAY');
    }
  };

  const handlePrevStep = () => {
    setFeedback({ type: null, message: '' });
    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1);
    } else if (levelIdx > 0) {
      setLevelIdx(levelIdx - 1);
      setStepIdx(levels[levelIdx - 1].steps.length - 1);
    }
  };

  // ── ASSESSMENT HANDLER ───────────────────────────────────────
  const handleAssessmentAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      AudioController.playSuccess();
      setAssessmentScore((s) => s + 1);
    } else {
      AudioController.playBoop();
    }

    if (assessmentIdx < assessmentQuestions.length - 1) {
      setAssessmentIdx((idx) => idx + 1);
    } else {
      setIsAssessmentDone(true);
      AudioController.playCelebration();
      api.post('/simulation-activity/simulations/SIM-MATH-G1-CH2-01/progress', {
        gradeLevel: 1,
        subjectCode: 'MATH',
        chapterNumber: 2,
        simulationTitle: 'Straight and Curved Line Explorer',
        assessmentScore: assessmentScore + (isCorrect ? 1 : 0),
        totalQuestions: assessmentQuestions.length,
        percentage: Math.round(((assessmentScore + (isCorrect ? 1 : 0)) / assessmentQuestions.length) * 100),
        isCompleted: true,
      }).catch(() => {});
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
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ── TOP HEADER ────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(90deg, #1e3a8a 0%, #0284c7 100%)',
          color: '#ffffff',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 10,
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
            }}
          >
            <ArrowLeft size={16} />
            <span>{lang === 'ne' ? 'लाइब्रेरी फर्कनुहोस्' : 'Return to Library'}</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>
                {lang === 'ne' ? 'सीधा र बाङ्गो रेखा चिनौँ' : 'Straight and Curved Line Explorer'}
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
                Class 1 • Math • Ch 2: Lines
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#bae6fd' }}>
              {lang === 'ne' ? 'सिधा रेखा र बाङ्गो रेखाको अन्तरक्रियात्मक ३डी अध्ययन' : 'Interactive 3D exploration of straight and curved lines'}
            </p>
          </div>
        </div>

        {/* Mode & Navigation Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.25)', borderRadius: '8px', padding: '3px' }}>
            <button
              onClick={() => { setMode('GUIDED'); AudioController.playClick(); }}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                background: mode === 'GUIDED' ? '#ffffff' : 'transparent',
                color: mode === 'GUIDED' ? '#0369a1' : '#ffffff',
              }}
            >
              {lang === 'ne' ? 'सिकाइ तह (१–४)' : 'Lessons (1–4)'}
            </button>
            <button
              onClick={() => { setMode('FREE_PLAY'); AudioController.playClick(); }}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                background: mode === 'FREE_PLAY' ? '#ffffff' : 'transparent',
                color: mode === 'FREE_PLAY' ? '#0369a1' : '#ffffff',
              }}
            >
              {lang === 'ne' ? 'खुला अन्वेषण' : 'Free Explore'}
            </button>
            <button
              onClick={() => {
                setMode('ASSESSMENT');
                setAssessmentIdx(0);
                setAssessmentScore(0);
                setIsAssessmentDone(false);
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

          <button
            onClick={() => setLang(lang === 'ne' ? 'en' : 'ne')}
            style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', color: '#ffffff', fontSize: '11px', fontWeight: '800', border: 'none', cursor: 'pointer' }}
          >
            {lang === 'ne' ? 'English' : 'नेपाली'}
          </button>

          <button
            onClick={toggleMute}
            style={{ padding: '7px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', color: '#ffffff', border: 'none', cursor: 'pointer' }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <button
            onClick={resetCamera}
            style={{ padding: '7px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', color: '#ffffff', border: 'none', cursor: 'pointer' }}
            title="Reset 3D View"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* ── 3D CANVAS VIEWPORT ────────────────────────────────────── */}
      <div ref={mountRef} style={{ flex: 1, width: '100%', position: 'relative', cursor: 'grab' }} />

      {/* ── BOTTOM HUD CONTROL ────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '920px',
          background: 'rgba(255, 255, 255, 0.95)',
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
        {/* ── 1. GUIDED LEARNING MODE ─────────────────────────────── */}
        {mode === 'GUIDED' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#0284c7', color: '#ffffff', padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
                  Level {currentLevel.levelNumber} / {levels.length}
                </span>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                  {lang === 'ne' ? currentLevel.titleNe : currentLevel.titleEn}
                </span>
              </div>

              {/* Progress Step Indicators */}
              <div style={{ display: 'flex', gap: '5px' }}>
                {currentLevel.steps.map((st, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: idx === stepIdx ? '22px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: idx === stepIdx ? '#0284c7' : idx < stepIdx ? '#10b981' : '#cbd5e1',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Instruction Card */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <button
                onClick={replayAudio}
                style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#0284c7', color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
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
            </div>

            {/* Level 1 Demonstration Cards */}
            {currentLevel.levelNumber === 1 && (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    AudioController.playSuccess();
                    if (threeRefs.current) threeRefs.current.environment.highlightObject('straight_road', true);
                    setFeedback({ type: 'success', message: lang === 'ne' ? 'सिधा रेखा: यो कतै पनि नमोडिई सिधा जान्छ (Straight Line)।' : 'Straight Line: Goes straight without bending!' });
                  }}
                  style={{ flex: 1, padding: '14px', background: '#eff6ff', border: '2px solid #3b82f6', borderRadius: '10px', color: '#1d4ed8', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}
                >
                  📏 {lang === 'ne' ? 'सिधा रेखा (Straight Line)' : 'Straight Line'}
                </button>
                <button
                  onClick={() => {
                    AudioController.playSuccess();
                    if (threeRefs.current) threeRefs.current.environment.highlightObject('curved_road', false);
                    setFeedback({ type: 'success', message: lang === 'ne' ? 'बाङ्गो रेखा: यसमा घुम्ती र मोडहरू हुन्छन् (Curved Line)।' : 'Curved Line: Bends and turns smoothly!' });
                  }}
                  style={{ flex: 1, padding: '14px', background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '10px', color: '#b91c1c', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}
                >
                  〰️ {lang === 'ne' ? 'बाङ्गो रेखा (Curved Line)' : 'Curved Line'}
                </button>
              </div>
            )}

            {/* Level 2 3D Selection Buttons */}
            {currentLevel.levelNumber === 2 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                <button
                  onClick={() => handleSelectObject('straight_road', true)}
                  style={{ padding: '10px', background: '#ffffff', border: '2px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                >
                  🛣️ {lang === 'ne' ? 'सिधा सडक' : 'Straight Road'}
                </button>
                <button
                  onClick={() => handleSelectObject('curved_road', false)}
                  style={{ padding: '10px', background: '#ffffff', border: '2px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                >
                  蜿 {lang === 'ne' ? 'बाङ्गो सडक' : 'Curved Road'}
                </button>
                <button
                  onClick={() => handleSelectObject('straight_stick', true)}
                  style={{ padding: '10px', background: '#ffffff', border: '2px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                >
                  🪵 {lang === 'ne' ? 'सिधा काठको लठ्ठी' : 'Straight Stick'}
                </button>
                <button
                  onClick={() => handleSelectObject('curved_garden', false)}
                  style={{ padding: '10px', background: '#ffffff', border: '2px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                >
                  🌷 {lang === 'ne' ? 'बाङ्गो फूलबारी घेरा' : 'Curved Garden Bed'}
                </button>
                <button
                  onClick={() => handleSelectObject('straight_bridge', true)}
                  style={{ padding: '10px', background: '#ffffff', border: '2px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                >
                  🌉 {lang === 'ne' ? 'सिधा काठको पुल' : 'Straight Bridge'}
                </button>
              </div>
            )}

            {/* Level 3 Tug-of-War Rope Pulling */}
            {currentLevel.levelNumber === 3 && (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => handlePullRope(true)}
                  style={{ flex: 1, padding: '12px 20px', background: '#ecfdf5', border: '2px solid #10b981', borderRadius: '10px', color: '#047857', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}
                >
                  🪢 {lang === 'ne' ? 'कसेर तन्काउनुहोस् (सिधा रेखा बनाउनुहोस्)' : 'Pull Tight (Make Straight Line)'}
                </button>
                <button
                  onClick={() => handlePullRope(false)}
                  style={{ flex: 1, padding: '12px 20px', background: '#fffbeb', border: '2px solid #f59e0b', borderRadius: '10px', color: '#b45309', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}
                >
                  〰️ {lang === 'ne' ? 'खुकुलो छोड्नुहोस् (बाङ्गो रेखा बनाउनुहोस्)' : 'Loosen (Make Curved Line)'}
                </button>
              </div>
            )}

            {/* Level 4 Multiple Choice */}
            {currentLevel.levelNumber === 4 && (currentStep as any).options && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {(currentStep as any).options.map((opt: any) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(opt)}
                    style={{ padding: '12px 16px', background: '#ffffff', border: '2px solid #cbd5e1', borderRadius: '10px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', textAlign: 'center' }}
                  >
                    {lang === 'ne' ? opt.labelNe : opt.labelEn}
                  </button>
                ))}
              </div>
            )}

            {/* Feedback Alert */}
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

            {/* Prev / Next controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={handlePrevStep}
                disabled={levelIdx === 0 && stepIdx === 0}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: '700', cursor: levelIdx === 0 && stepIdx === 0 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={14} /> {lang === 'ne' ? 'अघिल्लो' : 'Previous'}
              </button>

              <button
                onClick={handleNextStep}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 16px', borderRadius: '6px', background: '#0284c7', color: '#ffffff', border: 'none', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
              >
                <span>{lang === 'ne' ? 'पछिल्लो' : 'Next Step'}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </>
        )}

        {/* ── 2. FREE EXPLORATION MODE ────────────────────────────── */}
        {mode === 'FREE_PLAY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                  {lang === 'ne' ? 'खुला ३डी खेलमैदान अन्वेषण' : 'Free 3D Village Line Sandbox'}
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                  {lang === 'ne' ? 'गाउँका वस्तुहरू थिचेर सिधा र बाङ्गा रेखाहरूको रमाइलो अध्ययन गर्नुहोस्।' : 'Click objects to inspect and highlight straight and curved lines.'}
                </p>
              </div>

              <button
                onClick={() => {
                  setMode('ASSESSMENT');
                  setAssessmentIdx(0);
                  setAssessmentScore(0);
                  setIsAssessmentDone(false);
                }}
                style={{ padding: '8px 16px', borderRadius: '8px', background: '#f59e0b', color: '#000000', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trophy size={14} />
                <span>{lang === 'ne' ? 'मूल्याङ्कन सुरु गर्नुहोस्' : 'Start Assessment'}</span>
              </button>
            </div>

            {/* Quick Line Highlight Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                onClick={() => { AudioController.playPop(); threeRefs.current?.environment.highlightObject('straight_road', true); }}
                style={{ padding: '6px 12px', borderRadius: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '11px', fontWeight: '700', color: '#1d4ed8', cursor: 'pointer' }}
              >
                🛣️ {lang === 'ne' ? 'सिधा सडक (Straight)' : 'Straight Road'}
              </button>
              <button
                onClick={() => { AudioController.playPop(); threeRefs.current?.environment.highlightObject('curved_road', false); }}
                style={{ padding: '6px 12px', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fecaca', fontSize: '11px', fontWeight: '700', color: '#b91c1c', cursor: 'pointer' }}
              >
                蜿 {lang === 'ne' ? 'बाङ्गो सडक (Curved)' : 'Curved Road'}
              </button>
              <button
                onClick={() => { AudioController.playPop(); threeRefs.current?.environment.highlightObject('straight_fence', true); }}
                style={{ padding: '6px 12px', borderRadius: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '11px', fontWeight: '700', color: '#1d4ed8', cursor: 'pointer' }}
              >
                ⛩️ {lang === 'ne' ? 'सिधा बार (Straight Fence)' : 'Straight Fence'}
              </button>
              <button
                onClick={() => { AudioController.playPop(); threeRefs.current?.environment.highlightObject('curved_river', false); }}
                style={{ padding: '6px 12px', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fecaca', fontSize: '11px', fontWeight: '700', color: '#b91c1c', cursor: 'pointer' }}
              >
                🌊 {lang === 'ne' ? 'बाङ्गो नदी (Winding River)' : 'Winding River'}
              </button>
              <button
                onClick={() => { AudioController.playPop(); threeRefs.current?.environment.clearHighlights(); }}
                style={{ padding: '6px 12px', borderRadius: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
              >
                ✨ {lang === 'ne' ? 'सफा गर्नुहोस्' : 'Clear Highlights'}
              </button>
            </div>
          </div>
        )}

        {/* ── 3. ASSESSMENT MODE ──────────────────────────────────── */}
        {mode === 'ASSESSMENT' && (
          <div>
            {!isAssessmentDone ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ background: '#f59e0b', color: '#000000', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '800' }}>
                    Question {assessmentIdx + 1} / {assessmentQuestions.length}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#16a34a' }}>
                    Score: {assessmentScore} / {assessmentIdx}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fffbeb', padding: '10px 14px', borderRadius: '10px', border: '1px solid #fef3c7' }}>
                  <button onClick={replayAudio} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f59e0b', color: '#000000', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <Volume2 size={16} />
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#78350f' }}>
                    {lang === 'ne' ? assessmentQuestions[assessmentIdx].promptNe : assessmentQuestions[assessmentIdx].promptEn}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                  {assessmentQuestions[assessmentIdx].options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleAssessmentAnswer(opt.isCorrect)}
                      style={{ padding: '12px 16px', borderRadius: '10px', background: '#ffffff', border: '2px solid #cbd5e1', color: '#0f172a', fontSize: '13px', fontWeight: '800', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#f59e0b')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#cbd5e1')}
                    >
                      {lang === 'ne' ? opt.labelNe : opt.labelEn}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <Trophy size={42} color="#f59e0b" style={{ margin: '0 auto 8px auto' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>
                  {lang === 'ne' ? 'बधाई छ! रेखाहरूको मूल्याङ्कन पूरा भयो!' : 'Congratulations! Assessment Completed!'}
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 12px 0' }}>
                  {lang === 'ne' ? `तपाईंको नतिजा: ${assessmentScore} / ${assessmentQuestions.length}` : `Your Score: ${assessmentScore} / ${assessmentQuestions.length}`}
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                  {[1, 2, 3].map((starIdx) => {
                    const earned = assessmentScore >= starIdx * 4;
                    return <Star key={starIdx} size={28} fill={earned ? '#f59e0b' : '#e2e8f0'} color={earned ? '#d97706' : '#cbd5e1'} />;
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button
                    onClick={() => { setAssessmentIdx(0); setAssessmentScore(0); setIsAssessmentDone(false); AudioController.playClick(); }}
                    style={{ padding: '8px 18px', borderRadius: '8px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {lang === 'ne' ? 'फेरि प्रयास गर्नुहोस्' : 'Try Again'}
                  </button>
                  <button
                    onClick={onBackToLibrary}
                    style={{ padding: '8px 20px', borderRadius: '8px', background: '#0284c7', color: '#ffffff', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
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


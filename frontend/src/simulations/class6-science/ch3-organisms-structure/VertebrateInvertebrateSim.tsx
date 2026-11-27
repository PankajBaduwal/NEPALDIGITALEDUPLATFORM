/**
 * VertebrateInvertebrateSim.tsx
 * Simulation 7: 2D Vertebrate and Invertebrate Biological Explorer (ढाड भएका र नभएका जीवहरू)
 * Grade 6 Science • Unit 3: Organisms & Their Structure (जीवहरू र तिनीहरूको बनावट)
 *
 * 100% Native HTML5 Canvas 2D Anatomical X-Ray Simulator.
 * Features:
 * - 8 Real Animal Specimens spanning Vertebrate Classes and Invertebrate Phyla
 * - Real photographic imagery with smooth X-Ray bone illumination overlay
 * - Interactive X-Ray slider transitioning from realistic specimen view to internal skeleton
 * - Clear, organized anatomical callouts (Backbone, Skull, Ribs, Exoskeleton)
 * - Gold Standard Dark Educational Theme (#090d16, glowing sci-fi badges, 380px persistent sidebar)
 * - Bilingual EN/NE labels, scientific audio, and 5-stage inquiry learning
 */

import React, { useState, useRef, useEffect } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import { Scan, Check, RotateCcw, HelpCircle, Award, Sparkles, Eye, ShieldCheck, Info } from 'lucide-react';

interface AnimalSpecimen {
  id: string;
  nameEn: string;
  nameNe: string;
  classGroupEn: string;
  classGroupNe: string;
  type: 'vertebrate' | 'invertebrate';
  typeNe: 'ढाड भएको (Vertebrate)' | 'ढाड नभएको (Invertebrate)';
  characteristicsEn: string;
  characteristicsNe: string;
  skeletonTypeEn: string;
  skeletonTypeNe: string;
  imageUrl: string;
  fallbackUrl: string;
}

export const VertebrateInvertebrateSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [selectedId, setSelectedId] = useState<string>('fish');
  const [xrayOpacity, setXrayOpacity] = useState<number>(0.5); // 0 (natural skin) to 1 (full X-ray)
  const [inspectedIds, setInspectedIds] = useState<string[]>(['fish']);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});

  const specimens: AnimalSpecimen[] = [
    {
      id: 'fish',
      nameEn: 'Himalayan Trout (असला माछा)',
      nameNe: 'असला माछा (Himalayan Trout)',
      classGroupEn: 'Pisces (माछा वर्ग)',
      classGroupNe: 'माछा वर्ग (Pisces)',
      type: 'vertebrate',
      typeNe: 'ढाड भएको (Vertebrate)',
      characteristicsEn: 'Aquatic, streamlined body, breathes via gills, moves with fins, cold-blooded.',
      characteristicsNe: 'पानीमा बस्ने, फुलकाबाट सास फेर्ने, शरीरमा पखेटा र कत्ला हुने, चिसो रगत भएका जीव।',
      skeletonTypeEn: 'Internal Bony Backbone & Ribs (Endoskeleton)',
      skeletonTypeNe: 'भित्री ढाडको हाड र करङहरू (अन्तःकंकाल)',
      imageUrl: '/assets/simulations/animals/fish.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'amphibia',
      nameEn: 'Common Frog (भ्यागुतो)',
      nameNe: 'भ्यागुतो (Frog)',
      classGroupEn: 'Amphibia (उभयचर वर्ग)',
      classGroupNe: 'उभयचर वर्ग (Amphibia)',
      type: 'vertebrate',
      typeNe: 'ढाड भएको (Vertebrate)',
      characteristicsEn: 'Lives in water & land, moist skin respiration, undergoes complete metamorphosis.',
      characteristicsNe: 'पानी र जमिन दुवैमा बस्ने, ओसिलो छाला र फोक्सोले सास फेर्ने, फुल पार्ने जीव।',
      skeletonTypeEn: 'Vertebral column, urostyle & jumping limb bones',
      skeletonTypeNe: 'ढाडको हाड र खुट्टाका बलिया हाडहरू',
      imageUrl: '/assets/simulations/animals/frog.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'reptile',
      nameEn: 'Garden Lizard (छेपारो)',
      nameNe: 'छेपारो (Garden Lizard)',
      classGroupEn: 'Reptilia (घस्रने वर्ग)',
      classGroupNe: 'घस्रने वर्ग (Reptilia)',
      type: 'vertebrate',
      typeNe: 'ढाड भएको (Vertebrate)',
      characteristicsEn: 'Creeps on ground, dry scaly skin, breathes with lungs, lays leathery shelled eggs.',
      characteristicsNe: 'घस्रेर हिँड्ने, सुख्खा कडा कत्ला भएको छाला, फोक्सोले सास फेर्ने जीव।',
      skeletonTypeEn: 'Flexible vertebral column & long tail vertebrae',
      skeletonTypeNe: 'लचिलो मेरुदण्ड (ढाडको हाड) र करङहरू',
      imageUrl: '/assets/simulations/animals/lizard.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'bird',
      nameEn: 'Danfe Lophophorus (डाँफे चरा)',
      nameNe: 'डाँफे (National Bird)',
      classGroupEn: 'Aves (चरा वर्ग)',
      classGroupNe: 'चरा वर्ग (Aves)',
      type: 'vertebrate',
      typeNe: 'ढाड भएको (Vertebrate)',
      characteristicsEn: 'Feathers, beak without teeth, warm-blooded, forelimbs modified into wings.',
      characteristicsNe: 'प्वाँखले ढाकिएको, चुच्चो भएको, तातो रगत हुने, अगाडिका खुट्टा पखेटामा रूपान्तरण भएका।',
      skeletonTypeEn: 'Hollow pneumatic bones & wishbone keel',
      skeletonTypeNe: 'उड्न हलुका खोक्रा हाडहरू र मेरुदण्ड',
      imageUrl: '/assets/simulations/animals/bird.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'mammal',
      nameEn: 'Himalayan Musk Deer (कस्तुरी मृग)',
      nameNe: 'कस्तुरी मृग (Musk Deer)',
      classGroupEn: 'Mammalia (स्तनधारी वर्ग)',
      classGroupNe: 'स्तनधारी वर्ग (Mammalia)',
      type: 'vertebrate',
      typeNe: 'ढाड भएको (Vertebrate)',
      characteristicsEn: 'Gives live birth, nurses young with milk, hair on skin, warm-blooded.',
      characteristicsNe: 'सिधै बच्चा जन्माउने, स्तनपान गराउने, शरीरभरि रौं हुने तातो रगतका जीव।',
      skeletonTypeEn: 'Complete vertebral column, skull & ribcage',
      skeletonTypeNe: 'विकसित मेरुदण्ड, खप्पर र करङको पिँजडा',
      imageUrl: '/assets/simulations/animals/deer.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1484406566174-9da000fda645?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'arthropod',
      nameEn: 'Monarch Butterfly (पुतली)',
      nameNe: 'पुतली (Butterfly)',
      classGroupEn: 'Arthropoda (जोर्नीखुट्टे)',
      classGroupNe: 'जोर्नीखुट्टे (Arthropoda)',
      type: 'invertebrate',
      typeNe: 'ढाड नभएको (Invertebrate)',
      characteristicsEn: 'Jointed legs, 3 body segments (head, thorax, abdomen), compound eyes.',
      characteristicsNe: 'जोर्नी परेका खुट्टा, तीन भागको शरीर (टाउको, छाती, पेट), कडा बाहिरी खोल।',
      skeletonTypeEn: 'Chitinous Exoskeleton (NO Internal Bones)',
      skeletonTypeNe: 'काइटिनको बाहिरी कडा खोल (भित्री ढाड हुँदैन)',
      imageUrl: '/assets/simulations/animals/butterfly.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1551884170-09fb70a3a2ed?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'mollusc',
      nameEn: 'Garden Snail (शङ्खेकिरा)',
      nameNe: 'शङ्खेकिरा (Garden Snail)',
      classGroupEn: 'Mollusca (कमलो शरीर)',
      classGroupNe: 'कमलो शरीर (Mollusca)',
      type: 'invertebrate',
      typeNe: 'ढाड नभएको (Invertebrate)',
      characteristicsEn: 'Soft muscular body, protective calcium carbonate coiled shell, muscular foot.',
      characteristicsNe: 'कमलो शरीर, बाहिर क्याल्सियमको घुम्रिएको कडा शङ्ख, मांसपेशीयुक्त पैताला।',
      skeletonTypeEn: 'External Calcium Shell (NO Internal Bones)',
      skeletonTypeNe: 'बाहिरी कडा शङ्ख (भित्री हाड हुँदैन)',
      imageUrl: '/assets/simulations/animals/snail.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'annelid',
      nameEn: 'Earthworm (गड्यौला)',
      nameNe: 'गड्यौला (Earthworm)',
      classGroupEn: 'Annelida (खण्ड परेका)',
      classGroupNe: 'खण्ड परेका (Annelida)',
      type: 'invertebrate',
      typeNe: 'ढाड नभएको (Invertebrate)',
      characteristicsEn: 'Segmented cylindrical body, moist skin respiration, farmer’s friend.',
      characteristicsNe: 'रिङ जस्ता खण्डहरू मिलेर बनेको शरीर, ओसिलो छालाबाट सास फेर्ने, किसानको मित्र।',
      skeletonTypeEn: 'Hydrostatic Fluid Skeleton (NO Bones)',
      skeletonTypeNe: 'पानीको दबाबयुक्त कमलो शरीर (हाड हुँदैन)',
      imageUrl: '/assets/simulations/animals/worm.jpg',
      fallbackUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const currentSpecimen = specimens.find((s) => s.id === selectedId) || specimens[0];

  // Preload real specimen images
  useEffect(() => {
    specimens.forEach((sp) => {
      if (!imagesRef.current[sp.id]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = sp.imageUrl;
        img.onerror = () => {
          img.src = sp.fallbackUrl;
        };
        imagesRef.current[sp.id] = img;
      }
    });
  }, []);

  const handleSelect = (id: string) => {
    ScienceAudio.playPop();
    setSelectedId(id);
    setQuizFeedback(null);
    if (!inspectedIds.includes(id)) {
      const next = [...inspectedIds, id];
      setInspectedIds(next);
      setStars(Math.min(3, Math.floor((next.length / specimens.length) * 3)));
      if (next.length >= specimens.length) {
        setIsCompleted(true);
        ScienceAudio.playSuccess();
        setStage('understand');
      }
    }
  };

  const handleQuizAnswer = (userChoice: 'vertebrate' | 'invertebrate') => {
    if (userChoice === currentSpecimen.type) {
      ScienceAudio.playSuccess();
      setQuizScore((prev) => prev + 1);
      setQuizFeedback(
        lang === 'ne'
          ? `सबास! यो ${currentSpecimen.nameNe.split(' ')[0]} ${currentSpecimen.typeNe} हो।`
          : `Correct! ${currentSpecimen.nameEn.split(' ')[0]} is a ${currentSpecimen.type.toUpperCase()}.`
      );
    } else {
      ScienceAudio.playBoop();
      setQuizFeedback(
        lang === 'ne'
          ? `पुनः विचार गर्नुहोस्: के यसको भित्री ढाडको हाड देखिन्छ?`
          : `Try again: Examine the internal X-Ray scan closely!`
      );
    }
  };

  const handleReset = () => {
    setSelectedId('fish');
    setXrayOpacity(0.5);
    setInspectedIds(['fish']);
    setQuizScore(0);
    setQuizFeedback(null);
    setStars(0);
    setIsCompleted(false);
    setStage('discover');
    ScienceAudio.playWhoosh();
  };

  // 60 FPS Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep dark laboratory background with blueprint grid
      const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.5, '#0c1322');
      bgGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Illuminated Medical X-Ray Lightbox Frame
      const boxX = 60;
      const boxY = 40;
      const boxW = 580;
      const boxH = 400;

      // Soft drop shadow for lightbox
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;

      // Outer Bezel (Sleek dark chassis with cyan glow)
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(boxX - 8, boxY - 8, boxW + 16, boxH + 16, 20);
      ctx.fill();
      ctx.stroke();

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Lightbox Illuminated Screen (shifts from dark slate to glowing deep-cyan X-Ray)
      const lightGrad = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
      const xGlow = xrayOpacity;
      lightGrad.addColorStop(0, `rgba(8, 28, 48, ${0.45 + xGlow * 0.5})`);
      lightGrad.addColorStop(1, `rgba(15, 23, 42, ${0.7 + xGlow * 0.3})`);

      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 14);
      ctx.fill();

      // Radiographic Precision Grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;
      for (let gx = boxX; gx <= boxX + boxW; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, boxY);
        ctx.lineTo(gx, boxY + boxH);
        ctx.stroke();
      }
      for (let gy = boxY; gy <= boxY + boxH; gy += 40) {
        ctx.beginPath();
        ctx.moveTo(boxX, gy);
        ctx.lineTo(boxX + boxW, gy);
        ctx.stroke();
      }

      // Center coords for specimen
      const cx = boxX + boxW / 2;
      const cy = boxY + boxH / 2 - 10;

      // 2. REALISTIC SPECIMEN LAYER (Render real animal image)
      const fleshAlpha = Math.max(0.1, 1 - xrayOpacity * 0.85);
      const boneAlpha = Math.min(1.0, xrayOpacity * 1.3);

      const activeImg = imagesRef.current[selectedId];
      if (activeImg && activeImg.complete && activeImg.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = fleshAlpha;

        // Clip circular/rounded display window for the organism
        const imgSize = 270;
        ctx.beginPath();
        ctx.roundRect(cx - imgSize / 2, cy - imgSize / 2, imgSize, imgSize, 24);
        ctx.clip();

        // Draw image centered and styled
        ctx.drawImage(activeImg, cx - imgSize / 2, cy - imgSize / 2, imgSize, imgSize);
        ctx.restore();

        // Subtle frame around the organism
        ctx.save();
        ctx.strokeStyle = xGlow > 0.3 ? 'rgba(56, 189, 248, 0.4)' : 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(cx - 135, cy - 135, 270, 270, 24);
        ctx.stroke();
        ctx.restore();
      }

      // 3. ANATOMICAL X-RAY SKELETAL SYSTEM OVERLAY
      if (boneAlpha > 0.05) {
        ctx.save();
        ctx.translate(cx, cy);

        ctx.strokeStyle = `rgba(224, 242, 254, ${boneAlpha})`;
        ctx.fillStyle = `rgba(240, 249, 255, ${boneAlpha * 0.85})`;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12 * boneAlpha;

        switch (selectedId) {
          // --- 1. FISH (Pisces) ---
          case 'fish': {
            // Skull
            ctx.beginPath();
            ctx.ellipse(85, -5, 28, 22, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Main Vertebral Column (Backbone)
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(60, -5);
            ctx.lineTo(-115, 0);
            ctx.stroke();

            // Ribs radiating along backbone
            ctx.lineWidth = 2;
            for (let rx = 50; rx >= -100; rx -= 12) {
              const ribLen = 28 * Math.sin(((rx + 110) / 170) * Math.PI);
              ctx.beginPath();
              ctx.moveTo(rx, -5);
              ctx.lineTo(rx - 6, -5 - ribLen);
              ctx.moveTo(rx, -5);
              ctx.lineTo(rx - 5, -5 + ribLen);
              ctx.stroke();
            }

            // Fin rays
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-115, 0);
            ctx.lineTo(-145, -30);
            ctx.moveTo(-115, 0);
            ctx.lineTo(-145, 30);
            ctx.stroke();
            break;
          }

          // --- 2. AMPHIBIA (Frog) ---
          case 'amphibia': {
            // Frog Broad Flat Skull
            ctx.beginPath();
            ctx.ellipse(0, -65, 35, 24, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Central Vertebral Column & Urostyle
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(0, -42);
            ctx.lineTo(0, 50);
            ctx.stroke();

            // Transverse spinal processes
            ctx.lineWidth = 2.2;
            for (let sy = -30; sy <= 10; sy += 10) {
              ctx.beginPath();
              ctx.moveTo(-28, sy);
              ctx.lineTo(28, sy);
              ctx.stroke();
            }

            // Powerful Long Jumping Hindlimbs (Femur & Tibiofibula)
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(0, 45);
            ctx.lineTo(-70, 20);
            ctx.lineTo(-85, 75);
            ctx.moveTo(0, 45);
            ctx.lineTo(70, 20);
            ctx.lineTo(85, 75);
            ctx.stroke();
            break;
          }

          // --- 3. REPTILE (Lizard) ---
          case 'reptile': {
            // Triangular skull
            ctx.beginPath();
            ctx.moveTo(85, -8);
            ctx.lineTo(115, -4);
            ctx.lineTo(85, 4);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Long Undulating Vertebral Column
            ctx.lineWidth = 4.5;
            ctx.beginPath();
            ctx.moveTo(85, 0);
            ctx.quadraticCurveTo(0, -15, -60, 5);
            ctx.quadraticCurveTo(-100, 20, -140, 25);
            ctx.stroke();

            // Ribs along thoracic section
            ctx.lineWidth = 2;
            for (let lx = 60; lx >= -40; lx -= 14) {
              ctx.beginPath();
              ctx.moveTo(lx, -4);
              ctx.lineTo(lx - 4, -20);
              ctx.moveTo(lx, -4);
              ctx.lineTo(lx - 4, 14);
              ctx.stroke();
            }
            break;
          }

          // --- 4. BIRD (Danfe) ---
          case 'bird': {
            // Light Pneumatic Bird Skull & Beak
            ctx.beginPath();
            ctx.arc(60, -45, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Beak
            ctx.beginPath();
            ctx.moveTo(80, -45);
            ctx.lineTo(105, -42);
            ctx.lineTo(80, -38);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Cervical vertebrae S-curve
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(60, -25);
            ctx.bezierCurveTo(40, -10, 45, 10, 20, 20);
            ctx.stroke();

            // Large Sternum Keel (Flight muscle anchor)
            ctx.fillStyle = `rgba(224, 242, 254, ${boneAlpha * 0.9})`;
            ctx.beginPath();
            ctx.ellipse(10, 30, 25, 15, -Math.PI / 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Wing bones (Humerus, Radius, Ulna)
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(25, 15);
            ctx.lineTo(65, -15);
            ctx.lineTo(110, 5);
            ctx.stroke();
            break;
          }

          // --- 5. MAMMAL (Musk Deer) ---
          case 'mammal': {
            // Elongated mammalian skull
            ctx.beginPath();
            ctx.ellipse(75, -35, 30, 18, -Math.PI / 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Strong arched vertebral column
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(50, -30);
            ctx.quadraticCurveTo(0, -50, -75, -20);
            ctx.stroke();

            // Deep ribcage
            ctx.lineWidth = 2.2;
            for (let mx = 40; mx >= -30; mx -= 12) {
              ctx.beginPath();
              ctx.moveTo(mx, -42 + (mx * 0.15));
              ctx.lineTo(mx - 8, -5);
              ctx.stroke();
            }

            // Slender Running Forelimbs & Hindlimbs
            ctx.lineWidth = 3.5;
            ctx.beginPath();
            // Forelimb
            ctx.moveTo(30, -10);
            ctx.lineTo(25, 45);
            ctx.lineTo(30, 85);
            // Hindlimb
            ctx.moveTo(-60, -20);
            ctx.lineTo(-45, 35);
            ctx.lineTo(-55, 85);
            ctx.stroke();
            break;
          }

          // --- 6. ARTHROPOD (Butterfly - INVERTEBRATE) ---
          case 'arthropod': {
            // Chitinous Exoskeleton Rings (NO BONES)
            ctx.strokeStyle = `rgba(251, 191, 36, ${boneAlpha})`;
            ctx.shadowColor = '#fbbf24';

            // Head, Thorax, Abdomen ring segments
            ctx.lineWidth = 3;
            for (let ay = -40; ay <= 40; ay += 12) {
              ctx.beginPath();
              ctx.ellipse(0, ay, 12, 5, 0, 0, Math.PI * 2);
              ctx.stroke();
            }

            // 6 Jointed Exoskeleton Legs
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(-10, -20);
            ctx.lineTo(-45, -35);
            ctx.lineTo(-70, -20);
            ctx.moveTo(10, -20);
            ctx.lineTo(45, -35);
            ctx.lineTo(70, -20);

            ctx.moveTo(-10, 0);
            ctx.lineTo(-50, 0);
            ctx.lineTo(-75, 15);
            ctx.moveTo(10, 0);
            ctx.lineTo(50, 0);
            ctx.lineTo(75, 15);
            ctx.stroke();
            break;
          }

          // --- 7. MOLLUSC (Snail - INVERTEBRATE) ---
          case 'mollusc': {
            // Calcium Carbonate Spiral Shell Outline (NO INTERNAL BONES)
            ctx.strokeStyle = `rgba(251, 146, 60, ${boneAlpha})`;
            ctx.shadowColor = '#fb923c';

            ctx.lineWidth = 3.5;
            ctx.beginPath();
            for (let a = 0; a < Math.PI * 5; a += 0.15) {
              const r = 12 + a * 10;
              const sx = -20 + r * Math.cos(a);
              const sy = -20 + r * Math.sin(a);
              if (a === 0) ctx.moveTo(sx, sy);
              else ctx.lineTo(sx, sy);
            }
            ctx.stroke();
            break;
          }

          // --- 8. ANNELID (Earthworm - INVERTEBRATE) ---
          case 'annelid': {
            // Hydrostatic body segments (NO BONES)
            ctx.strokeStyle = `rgba(244, 63, 94, ${boneAlpha})`;
            ctx.shadowColor = '#f43f5e';

            ctx.lineWidth = 3;
            for (let i = -100; i <= 100; i += 12) {
              const wy = 25 * Math.sin((i / 40) + time);
              ctx.beginPath();
              ctx.ellipse(i, wy, 8, 16, Math.PI / 4, 0, Math.PI * 2);
              ctx.stroke();
            }
            break;
          }
        }

        ctx.restore();
      }

      // 4. SCIENTIFIC POINTER CALLOUT BADGE
      ctx.save();
      const badgeY = boxY + boxH - 45;
      ctx.fillStyle = currentSpecimen.type === 'vertebrate' ? 'rgba(5, 150, 105, 0.9)' : 'rgba(220, 38, 38, 0.9)';
      ctx.strokeStyle = currentSpecimen.type === 'vertebrate' ? '#10b981' : '#f87171';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(boxX + 20, badgeY, 260, 32, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      const typeText =
        lang === 'ne'
          ? (currentSpecimen.type === 'vertebrate' ? '✓ ढाड भएको जीव (Vertebrate)' : '✕ ढाड नभएको जीव (Invertebrate)')
          : (currentSpecimen.type === 'vertebrate' ? '✓ VERTEBRATE (Has Backbone)' : '✕ INVERTEBRATE (No Backbone)');
      ctx.fillText(typeText, boxX + 32, badgeY + 20);

      // X-Ray Mode Indicator at top right of lightbox
      ctx.fillStyle = xGlow > 0.3 ? '#38bdf8' : '#94a3b8';
      ctx.font = 'bold 11px sans-serif';
      const scanStatus =
        lang === 'ne'
          ? `स्क्यानर: ${Math.round(xrayOpacity * 100)}% (${xGlow > 0.5 ? 'कंकाल सक्रिय' : 'छाला दृश्य'})`
          : `Scanner: ${Math.round(xrayOpacity * 100)}% (${xGlow > 0.5 ? 'X-Ray Bones' : 'Natural View'})`;
      ctx.fillText(scanStatus, boxX + boxW - 170, boxY + 28);
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [selectedId, xrayOpacity, lang, currentSpecimen]);

  return (
    <SimulationLayout
      titleEn="2D Vertebrate & Invertebrate Explorer"
      titleNe="ढाड भएका र नभएका जीवहरू २डी अन्वेषक"
      subject="Science"
      grade={6}
      chapter={3}
      stage={stage}
      onStageChange={setStage}
      lang={lang}
      onLangChange={setLang}
      stars={stars}
      isCompleted={isCompleted}
      onReset={handleReset}
      onBackToLibrary={onBackToLibrary}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          height: '100%',
          overflow: 'hidden',
          background: '#ffffff',
          color: '#0f172a',
        }}
      >
        {/* ══════════════════════════════════════════════════════════════
            LEFT COLUMN: INTERACTIVE 2D CANVAS VIEWPORT
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
          }}
        >
          {/* Main 2D Canvas */}
          <canvas
            ref={canvasRef}
            width={700}
            height={480}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#ffffff',
            }}
          />

          {/* Top Floating Quick Badges */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 800,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Scan size={14} color="#38bdf8" />
              <span>{lang === 'ne' ? 'एक्स-रे कंकाल स्क्यानर' : 'X-Ray Skeleton Scanner'}</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                color: '#4ade80',
                fontSize: '11px',
                fontWeight: 800,
                backdropFilter: 'blur(8px)',
              }}
            >
              <Check size={14} color="#4ade80" />
              <span>
                {lang === 'ne'
                  ? `अध्ययन गरिएका: ${inspectedIds.length}/${specimens.length}`
                  : `Examined: ${inspectedIds.length}/${specimens.length}`}
              </span>
            </div>
          </div>

          {/* Bottom Floating Interactive X-Ray Slider Dock */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              backdropFilter: 'blur(12px)',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                }}
              >
                <Eye size={16} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  {lang === 'ne' ? currentSpecimen.nameNe : currentSpecimen.nameEn}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {lang === 'ne' ? currentSpecimen.classGroupNe : currentSpecimen.classGroupEn}
                </div>
              </div>
            </div>

            {/* Slider Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                {lang === 'ne' ? 'छाला (Natural)' : 'Skin'}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={xrayOpacity}
                onChange={(e) => setXrayOpacity(parseFloat(e.target.value))}
                style={{
                  width: '130px',
                  accentColor: '#38bdf8',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>
                {lang === 'ne' ? 'कंकाल (X-Ray)' : 'Bones'}
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: 380px PERSISTENT DISCOVERY STATION SIDEBAR
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            borderLeft: '1px solid #e2e8f0',
            background: '#ffffff',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            overflowY: 'auto',
          }}
        >
          {/* Header Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(3, 105, 161, 0.05) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#38bdf8" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8' }}>
                {lang === 'ne' ? 'ढाड भएका र नभएका जीव अनुसन्धान केन्द्र' : 'Vertebrate Anatomy Station'}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
              {lang === 'ne'
                ? 'एक्स-रे स्क्यानर चलाएर जीवको भित्री ढाडको हाड (Backbone) वा बाहिरी खोल अवलोकन गर्नुहोस्।'
                : 'Slide the X-Ray control to discover internal vertebral columns vs external exoskeletons.'}
            </div>
          </div>

          {/* Specimen Picker Deck */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '6px' }}>
              {lang === 'ne' ? 'जीव छान्नुहोस् (SELECT SPECIMEN)' : 'SELECT SPECIMEN TO SCAN'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {specimens.map((s) => {
                const isSelected = selectedId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(s.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      background: isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.03)',
                      color: isSelected ? '#38bdf8' : '#cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lang === 'ne' ? s.nameNe.split(' ')[0] : s.nameEn.split(' ')[0]}
                    </span>
                    {isSelected && <Check size={13} color="#38bdf8" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skeletal Architecture Diagnosis Box */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <ShieldCheck size={13} />
              <span>{lang === 'ne' ? 'कंकाल संरचना (Skeletal Structure)' : 'Skeletal Architecture'}</span>
            </div>
            <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5 }}>
              {lang === 'ne' ? currentSpecimen.skeletonTypeNe : currentSpecimen.skeletonTypeEn}
            </p>
          </div>

          {/* Biological Traits Box */}
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Sparkles size={13} />
              <span>{lang === 'ne' ? 'मुख्य विशेषताहरू' : 'Key Biological Traits'}</span>
            </div>
            <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5 }}>
              {lang === 'ne' ? currentSpecimen.characteristicsNe : currentSpecimen.characteristicsEn}
            </p>
          </div>

          {/* Interactive Student Diagnostic Quiz */}
          <div
            style={{
              background: 'rgba(245, 158, 11, 0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <HelpCircle size={13} />
              <span>{lang === 'ne' ? 'विद्यार्थी परीक्षण (Self-Check)' : 'Quick Check: Classify this Organism!'}</span>
            </div>
            <p style={{ fontSize: '11px', color: '#475569', marginBottom: '8px' }}>
              {lang === 'ne'
                ? `के यो जीवमा ढाडको हाड (Backbone) हुन्छ?`
                : `Does this organism possess an internal vertebral column?`}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                onClick={() => handleQuizAnswer('vertebrate')}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  background: 'rgba(34, 197, 94, 0.15)',
                  color: '#4ade80',
                }}
              >
                {lang === 'ne' ? 'ढाड भएको (Vertebrate)' : 'Vertebrate'}
              </button>
              <button
                onClick={() => handleQuizAnswer('invertebrate')}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                }}
              >
                {lang === 'ne' ? 'ढाड नभएको (Invertebrate)' : 'Invertebrate'}
              </button>
            </div>
            {quizFeedback && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '6px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.06)',
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#fbbf24',
                  textAlign: 'center',
                }}
              >
                {quizFeedback}
              </div>
            )}
          </div>

          {/* Curriculum Key Takeaway Box */}
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.08)',
              borderRadius: '12px',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              padding: '12px',
              fontSize: '11px',
              color: '#64748b',
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>
              <Info size={13} />
              <span>{lang === 'en' ? 'Curriculum Key Takeaway' : 'पाठ्यक्रमको मुख्य निष्कर्ष'}</span>
            </div>
            {lang === 'en'
              ? 'Vertebrates (Fish, Amphibians, Reptiles, Birds, Mammals) possess an internal bony vertebral column. Invertebrates (Insects, Snails, Worms) lack a backbone and rely on exoskeletons, shells, or fluid pressure.'
              : 'ढाड भएका जीवहरू (माछा, उभयचर, घस्रने, चरा, स्तनधारी) मा शरीरभित्र मेरुदण्ड हुन्छ। ढाड नभएका जीवहरू (कीरा, शङ्खेकिरा, गड्यौला) मा ढाडको हाड हुँदैन, बाहिरी खोल वा कमलो शरीर हुन्छ।'}
          </div>

          {/* Sticky Green Completion Button at Bottom of Sidebar */}
          <button
            onClick={() => {
              setIsCompleted(true);
              setStars(3);
              ScienceAudio.playSuccess();
            }}
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            }}
          >
            <Award size={16} />
            {lang === 'en' ? '✓ Complete Vertebrate Anatomy Lab' : '✓ ढाड भएका र नभएका जीव प्रयोगशाला पूरा भयो'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};

export default VertebrateInvertebrateSim;

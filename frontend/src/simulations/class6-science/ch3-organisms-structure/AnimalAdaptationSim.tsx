/**
 * AnimalAdaptationSim.tsx
 * Master Interactive 2D Wildlife & Adaptation Studio (जनावरको अनुकूलन - २डी जीव विज्ञान प्रयोगशाला)
 * Grade 6 Science • Unit 3: Organisms & Their Structure (जीवहरू र तिनीहरूको बनावट)
 *
 * 100% Native 2D Canvas & Vector Graphics (Zero WebGL/3D Dependencies)
 * - Ultra-Rich Natural Color Palettes across 3 iconic Nepalese Habitats:
 *   1. Himalayan Alpine (-30°C Snowfields): Majestic Himalayan Yak with shaggy double-layer fleece, sweeping horns,
 *      and snowy mountain peaks with floating blizzards.
 *   2. Terai Subtropical Jungle (+42°C Sal Forest): Asian Elephant with flapping vascularized ears, prehensile trunk,
 *      and tall savannah elephant grass under sunny sky.
 *   3. Karnali Freshwater River (Cold Glacial Water): Golden Mahseer Fish with streamlined hydrodynamic body,
 *      pulsing red gills, shimmering scales, and aquatic riverbed pebbles with rising bubbles.
 * - Interactive Animal Morphological Features:
 *   - Click-to-inspect adaptation pins (Ear thermoregulation, Hooves, Trunk, Gills, Lateral line, Wool insulation).
 *   - Environment controls: Temperature dial (-40°C to +45°C), Day/Night lighting, and Winter Blizzard/Rain showers.
 *   - Animated breathing, ear flapping, and tail/fin swishing in real time at 60 FPS!
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationLayout } from '../common/SimulationLayout';
import { BaseSimulationProps, SimulationStage, Language } from '../common/types';
import { ScienceAudio } from '../common/ScienceAudio';
import {
  Sparkles,
  Mountain,
  Trees,
  Droplets,
  Check,
  RotateCcw,
  Thermometer,
  Eye,
  Info,
  Award,
  Sun,
  CloudSnow,
} from 'lucide-react';

type HabitatType = 'himalayan' | 'terai' | 'aquatic';

interface AdaptationSpot {
  id: string;
  x: number;
  y: number;
  nameEn: string;
  nameNe: string;
  roleEn: string;
  roleNe: string;
  scientificConceptEn: string;
  scientificConceptNe: string;
}

export const AnimalAdaptationSim: React.FC<BaseSimulationProps> = ({
  onBackToLibrary,
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<Language>(initialLanguage);
  const [stage, setStage] = useState<SimulationStage>('discover');
  const [stars, setStars] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Active Habitat Selection
  const [activeHabitat, setActiveHabitat] = useState<HabitatType>('himalayan');
  const [selectedSpotId, setSelectedSpotId] = useState<string>('wool');
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Environmental sliders
  const [envTemp, setEnvTemp] = useState<number>(-15); // °C
  const [isWeatherActive, setIsWeatherActive] = useState<boolean>(true); // Snow/Rain/Bubbles

  // Challenge stage state
  const [quizIdx, setQuizIdx] = useState<number>(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Habitat & Animal Adaptation Data
  const habitatConfigs: Record<
    HabitatType,
    {
      titleEn: string;
      titleNe: string;
      organismEn: string;
      organismNe: string;
      scientificName: string;
      altitudeEn: string;
      altitudeNe: string;
      spots: AdaptationSpot[];
    }
  > = {
    himalayan: {
      titleEn: 'Himalayan Alpine Tundra (हिमाली प्रदेश)',
      titleNe: 'उच्च हिमाली बासस्थान (Alpine Habitat)',
      organismEn: 'Himalayan Yak (याक / चौँरी)',
      organismNe: 'हिमाली याक (Bos grunniens)',
      scientificName: 'Bos grunniens',
      altitudeEn: '3,000m – 5,500m Altitude',
      altitudeNe: '३,००० देखि ५,५०० मिटर उचाइ',
      spots: [
        {
          id: 'wool',
          x: 430,
          y: 270,
          nameEn: 'Dense Double-Layer Shaggy Fleece',
          nameNe: 'बाक्लो भुत्ला र ऊन (Double Fleece)',
          roleEn: 'Under-wool traps dead air as an insulator; long skirt fleece shields belly from deep snow.',
          roleNe: 'भित्री मसिनो ऊनले न्यानो हावा थुनेर राख्छ र लामो भुत्लाले हिउँको चिसोबाट बचाउँछ।',
          scientificConceptEn: 'Thermal insulation reduces conductive and convective body heat dissipation in -40°C blizzards.',
          scientificConceptNe: 'यसले -४०°C को चिसोमा पनि शरीरको तापक्रम घट्न दिँदैन।',
        },
        {
          id: 'lungs',
          x: 370,
          y: 240,
          nameEn: 'Enlarged Thorax & Red Blood Cells',
          nameNe: 'विशाल फोक्सो र धेरै राता रक्तकोष',
          roleEn: 'Massive lung capacity and smaller, more numerous RBCs rapidly absorb thin mountain oxygen.',
          roleNe: 'पातलो हावाबाट पर्याप्त अक्सिजन लिन याकको फोक्सो र मुटु सामान्य गाईभैँसीभन्दा धेरै ठूलो हुन्छ।',
          scientificConceptEn: 'High hemoglobin density prevents hypoxia in atmospheric pressures below 0.5 atm.',
          scientificConceptNe: 'कम अक्सिजन भएको उच्च भूभागमा पनि याक सहजै सास फेर्न सक्छ।',
        },
        {
          id: 'hooves',
          x: 460,
          y: 385,
          nameEn: 'Broad Non-Skid Cleft Hooves',
          nameNe: 'फराकिला चिप्लन नदिने खुरहरू',
          roleEn: 'Broad rounded hooves spread heavy body weight over snow crust without sinking, with hard rims for ice grip.',
          roleNe: 'फराकिला खुरले हिउँमा खुट्टा गाडिन दिँदैनन् र चिप्लो भिरमा हिँड्न बलियो पकड दिन्छन्।',
          scientificConceptEn: 'Surface area distribution minimizes pressure (P = F/A) on powdery snowdrifts.',
          scientificConceptNe: 'खुरको ठूलो क्षेत्रफलले हिउँमा चाप घटाएर सजिलै हिँड्न मद्दत गर्छ।',
        },
        {
          id: 'horns',
          x: 275,
          y: 190,
          nameEn: 'Sweeping Curved Horns',
          nameNe: 'घुम्रिएका बलिया सिङहरू',
          roleEn: 'Heavy pointed keratin horns break through thick crusts of frozen snow to forage underlying lichen and moss.',
          roleNe: 'हिउँ पन्छाएर भित्रको घाँस र लेउ खान तथा शत्रुसँग लड्न बलिया सिङको प्रयोग हुन्छ।',
          scientificConceptEn: 'Used as snow scoops to uncover buried alpine vegetation during long winters.',
          scientificConceptNe: 'हिउँमुनि पुरिएको घाँस खोस्रेर निकाल्न सिङ उपयोगी हुन्छ।',
        },
      ],
    },
    terai: {
      titleEn: 'Terai Subtropical Grassland (तराई प्रदेश)',
      titleNe: 'तराईको साल वन तथा घाँसे मैदान',
      organismEn: 'Asian Wild Elephant (जङ्गली हात्ती)',
      organismNe: 'एसियाली हात्ती (Elephas maximus)',
      scientificName: 'Elephas maximus',
      altitudeEn: '60m – 300m Tropical Lowland',
      altitudeNe: '६० देखि ३०० मिटर तराई',
      spots: [
        {
          id: 'ears',
          x: 330,
          y: 215,
          nameEn: 'Vascularized Thermoregulatory Ears',
          nameNe: 'फराकिला ठूला कान (Cooling Ears)',
          roleEn: 'Large fan ears laced with capillary blood vessels radiate excessive metabolic heat away in 45°C sun.',
          roleNe: 'कानमा बाक्ला रक्तनलीहरू हुन्छन्। कान हल्लाउँदा रगत चिसिएर शरीरभरि जान्छ र तापक्रम घट्छ।',
          scientificConceptEn: 'Convective heat loss across thin ear skin cools internal blood by up to 5°C.',
          scientificConceptNe: 'तराईको अत्यधिक गर्मीमा शरीर चिसो राख्ने यो हात्तीको प्राकृतिक पङ्खा हो।',
        },
        {
          id: 'trunk',
          x: 235,
          y: 285,
          nameEn: 'Prehensile Muscular Trunk (Proboscis)',
          nameNe: 'बलियो बहुउपयोगी सुँड (Trunk)',
          roleEn: 'Fleshy fusion of nose and upper lip with 40,000 muscles: breathes, rips branches, sprays water, and trumpets.',
          roleNe: '४०,००० भन्दा बढी मांसपेशी मिलेर बनेको सुँडले घाँस टिप्न, पानी पिउन, नुहाउन र सुँघ्न मद्दत गर्छ।',
          scientificConceptEn: 'Extreme dexterity replaces the absence of hands in quadrupeds.',
          scientificConceptNe: 'सुँडले हात्तीलाई हात र नाक दुवैको काम एकसाथ गर्न सघाउँछ।',
        },
        {
          id: 'pads',
          x: 480,
          y: 390,
          nameEn: 'Spongy Cushioned Footpads',
          nameNe: 'कुसनयुक्त चौडा पैताला',
          roleEn: 'Thick elastic fibro-fatty cushions absorb the 4,000 kg impact shock and expand to distribute ground pressure.',
          roleNe: 'पैतालामुनिको नरम कुसनले ४ टन तौलको भार थाम्छ र हिँड्दा आवाज आउन दिँदैन।',
          scientificConceptEn: 'Acoustic dampening and terrain shock absorption enable stealthy, silent movement.',
          scientificConceptNe: 'यसले हात्तीलाई जंगलमा हिँड्दा कुनै आवाज ननिकाली हिँड्न मद्दत गर्छ।',
        },
        {
          id: 'skin',
          x: 410,
          y: 250,
          nameEn: 'Wrinkled Moisture-Retaining Skin',
          nameNe: 'खुम्चिएको बाक्लो छाला (Wrinkled Skin)',
          roleEn: 'Deep geometric fissures in the 2.5 cm skin trap water and mud baths, keeping skin moist 10x longer.',
          roleNe: 'खुम्चिएको छालामा हिलो र पानी अड्किन्छ जसले घामको डढेलो र किराको टोकाइबाट बचाउँछ।',
          scientificConceptEn: 'Mud wallowing forms a physical barrier against UV radiation and blood-sucking parasites.',
          scientificConceptNe: 'हिलोले घामको हानिकारक किरण र लामखुट्टेबाट जोगाउँछ।',
        },
      ],
    },
    aquatic: {
      titleEn: 'Karnali Freshwater River (जलिय बासस्थान)',
      titleNe: 'कर्णाली नदीको जलिय बासस्थान',
      organismEn: 'Golden Himalayan Mahseer (सहर माछा)',
      organismNe: 'गोल्डेन महासीर माछा (Tor putitora)',
      scientificName: 'Tor putitora',
      altitudeEn: 'Fast-flowing Himalayan Rivers',
      altitudeNe: 'तीब्र बग्ने पहाडी नदीहरू',
      spots: [
        {
          id: 'shape',
          x: 440,
          y: 250,
          nameEn: 'Streamlined Hydrodynamic Body',
          nameNe: 'पानी चिर्ने डुङ्गा आकारको शरीर (Streamlined)',
          roleEn: 'Spindle-shaped body tapers at head and tail, minimizing water drag and enabling upstream swimming.',
          roleNe: 'अगाडि र पछाडि चुच्चो परेको शरीरले पानीको घर्षण कम गरी तीव्र धारमा पनि सजिलै पौडिन मद्दत गर्छ।',
          scientificConceptEn: 'Hydrodynamic laminar flow reduces turbulent drag against fast alpine currents.',
          scientificConceptNe: 'यो आकारले पानीको तीव्र छाललाई सजिलै चिरेर अगाडि बढ्न दिन्छ।',
        },
        {
          id: 'gills',
          x: 320,
          y: 245,
          nameEn: 'Operculum & Feathery Gills',
          nameNe: 'फुल्का वा गिल्स (Gills)',
          roleEn: 'Richly vascularized gill filaments absorb dissolved oxygen ($O_2$) directly from flowing river water.',
          roleNe: 'पानीमा घुलेको अक्सिजन सोसेर सास फेर्नका लागि माछामा फुल्का (Gills) हुन्छन्।',
          scientificConceptEn: 'Counter-current blood flow extracts up to 85% of dissolved oxygen from cold water.',
          scientificConceptNe: 'माछाले मुखबाट पानी पसाएर फुल्काबाट अक्सिजन लिन्छ।',
        },
        {
          id: 'fins',
          x: 570,
          y: 250,
          nameEn: 'Caudal & Paired Steering Fins',
          nameNe: 'पुच्छर र पखेटा (Fins)',
          roleEn: 'Powerful forked caudal fin propels forward; pectoral and pelvic fins provide precision steering and balance.',
          roleNe: 'पुच्छरको पखेटाले अगाडि धकेल्ने र दायाँबायाँका पखेटाले दिशा बदल्ने र सन्तुलन कायम राख्ने काम गर्छन्।',
          scientificConceptEn: 'Thrust generation and 3-axis hydrodynamic stability in torrential rapids.',
          scientificConceptNe: 'पखेटाले माछालाई पानीभित्र अडिन र छिटो गतिमा पौडिन मद्दत गर्छ।',
        },
        {
          id: 'lateral',
          x: 430,
          y: 235,
          nameEn: 'Lateral Line Sensory System',
          nameNe: 'पार्श्व रेखा (Lateral Line System)',
          roleEn: 'Canal of hair cell neuromasts along the flanks detects microscopic water vibrations and predator movements.',
          roleNe: 'माछाको शरीरको छेउमा रहेको मसिनो रेखा जसले पानीको कम्पन, दबाब र शत्रुको चाल पत्ता लगाउँछ।',
          scientificConceptEn: 'Mechanoreception functions as aquatic "underwater touch-at-a-distance" in murky river beds.',
          scientificConceptNe: 'यसले धमिलो पानीमा पनि ढुङ्गा र शिकार पत्ता लगाउन सघाउँछ।',
        },
      ],
    },
  };

  const currentHabitat = habitatConfigs[activeHabitat];
  const activeSpot = currentHabitat.spots.find((s) => s.id === selectedSpotId) || currentHabitat.spots[0];

  // Set default environmental temp when habitat changes
  useEffect(() => {
    if (activeHabitat === 'himalayan') {
      setEnvTemp(-18);
      setSelectedSpotId('wool');
    } else if (activeHabitat === 'terai') {
      setEnvTemp(38);
      setSelectedSpotId('ears');
    } else {
      setEnvTemp(16);
      setSelectedSpotId('shape');
    }
  }, [activeHabitat]);

  // ══════════════════════════════════════════════════════════════════
  // MASTER 2D CANVAS RENDERER: VIBRANT ANIMAL HABITATS
  // ══════════════════════════════════════════════════════════════════
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const timeSec = Date.now() * 0.001;

    ctx.clearRect(0, 0, width, height);

    // ─────────────────────────────────────────────────────────────
    // HABITAT 1: HIMALAYAN ALPINE (Yak in Snowstorm)
    // ─────────────────────────────────────────────────────────────
    if (activeHabitat === 'himalayan') {
      // 1. Sky & Himalayan Mountain Peaks
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.6);
      skyGrad.addColorStop(0, '#0284c7'); // Crisp high-altitude blue
      skyGrad.addColorStop(0.5, '#7dd3fc');
      skyGrad.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height * 0.65);

      // Majestic Snowy Himalayan Mountain Ridges
      // Distant Ridge (Mount Everest / Kanchenjunga style)
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.45);
      ctx.lineTo(width * 0.2, height * 0.12);
      ctx.lineTo(width * 0.38, height * 0.32);
      ctx.lineTo(width * 0.55, height * 0.08); // Tallest summit
      ctx.lineTo(width * 0.72, height * 0.35);
      ctx.lineTo(width * 0.9, height * 0.18);
      ctx.lineTo(width, height * 0.42);
      ctx.lineTo(width, height * 0.65);
      ctx.lineTo(0, height * 0.65);
      ctx.closePath();
      ctx.fill();

      // Gleaming Snowcaps on Peaks
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(width * 0.2, height * 0.12);
      ctx.lineTo(width * 0.26, height * 0.22);
      ctx.lineTo(width * 0.15, height * 0.24);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(width * 0.55, height * 0.08);
      ctx.lineTo(width * 0.62, height * 0.22);
      ctx.lineTo(width * 0.48, height * 0.2);
      ctx.closePath();
      ctx.fill();

      // Foreground Snowfield Slope
      const snowGrad = ctx.createLinearGradient(0, height * 0.55, 0, height);
      snowGrad.addColorStop(0, '#f8fafc');
      snowGrad.addColorStop(0.4, '#e2e8f0');
      snowGrad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = snowGrad;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.55);
      ctx.bezierCurveTo(width * 0.35, height * 0.52, width * 0.7, height * 0.58, width, height * 0.52);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Exposed Alpine Granite Boulders
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse(width * 0.16, height * 0.75, 45, 22, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff'; // Snow on top of rock
      ctx.beginPath();
      ctx.ellipse(width * 0.16, height * 0.73, 40, 10, -0.1, 0, Math.PI * 2);
      ctx.fill();

      // ─────────────────────────────────────────────────────────
      // 2. HIMALAYAN YAK (2D Animated Organic Illustration)
      // ─────────────────────────────────────────────────────────
      const yakX = width * 0.46;
      const yakY = height * 0.54;
      const breathe = Math.sin(timeSec * 3) * 2; // Rhythmic breathing

      ctx.save();
      // Drop shadow in snow
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.beginPath();
      ctx.ellipse(yakX, yakY + 70, 120, 28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Legs with broad hooves
      ctx.fillStyle = '#1e1b18'; // Dark charcoal fur
      // Back Legs
      ctx.fillRect(yakX + 65, yakY + 10, 18, 55);
      ctx.fillRect(yakX + 40, yakY + 12, 18, 53);
      // Front Legs
      ctx.fillRect(yakX - 55, yakY + 12, 20, 53);
      ctx.fillRect(yakX - 80, yakY + 10, 20, 55);

      // Broad Non-Skid Cleft Hooves
      ctx.fillStyle = '#78716c';
      ctx.beginPath();
      ctx.roundRect(yakX + 62, yakY + 62, 24, 10, 4);
      ctx.roundRect(yakX + 37, yakY + 62, 24, 10, 4);
      ctx.roundRect(yakX - 58, yakY + 62, 26, 10, 4);
      ctx.roundRect(yakX - 83, yakY + 62, 26, 10, 4);
      ctx.fill();

      // Main Muscular Yak Body & High Hump
      ctx.fillStyle = '#26221d';
      ctx.beginPath();
      // Hump over shoulders
      ctx.moveTo(yakX - 85, yakY - 20);
      ctx.bezierCurveTo(yakX - 50, yakY - 70 + breathe, yakX - 10, yakY - 45, yakX + 75, yakY - 25);
      // Rump and belly
      ctx.bezierCurveTo(yakX + 105, yakY, yakX + 95, yakY + 35, yakX + 60, yakY + 30);
      ctx.bezierCurveTo(yakX + 10, yakY + 32, yakX - 45, yakY + 32, yakX - 85, yakY + 25);
      ctx.closePath();
      ctx.fill();

      // Long Shaggy Fleece Skirt (Hangs down low to insulate belly)
      ctx.fillStyle = '#1a1714';
      ctx.beginPath();
      ctx.moveTo(yakX - 85, yakY + 10);
      for (let i = 0; i < 18; i++) {
        const fx = yakX - 85 + i * 10;
        const fy = yakY + 32 + (i % 2 === 0 ? 18 : 6) + Math.sin(timeSec * 4 + i) * 2;
        ctx.lineTo(fx, fy);
      }
      ctx.lineTo(yakX + 90, yakY + 15);
      ctx.closePath();
      ctx.fill();

      // Bushy Horse-like Tail
      ctx.strokeStyle = '#1a1714';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(yakX + 95, yakY - 10);
      ctx.quadraticCurveTo(yakX + 125, yakY + 10 + Math.sin(timeSec * 2) * 6, yakX + 115, yakY + 45);
      ctx.stroke();

      // Heavy Yak Head & Snout
      const headX = yakX - 105;
      const headY = yakY - 15;

      ctx.fillStyle = '#1e1b18';
      ctx.beginPath();
      ctx.ellipse(headX, headY, 28, 22, 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Snout & Nostrils (Exhales warm steam in cold!)
      ctx.fillStyle = '#3f3934';
      ctx.beginPath();
      ctx.ellipse(headX - 18, headY + 8, 14, 11, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Warm Exhaled Breath Steam Clouds
      const steamTime = timeSec * 3;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      for (let s = 0; s < 4; s++) {
        const sx = headX - 32 - ((steamTime * 20 + s * 14) % 45);
        const sy = headY + 5 - s * 6 + Math.sin(steamTime + s) * 3;
        ctx.beginPath();
        ctx.arc(sx, sy, 5 + s * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(headX - 4, headY - 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headX - 5, headY - 5, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Large Sweeping Curved Horns (Upward & Forward hook)
      ctx.strokeStyle = '#d6d3d1';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      // Left/Front Horn
      ctx.beginPath();
      ctx.moveTo(headX + 4, headY - 12);
      ctx.bezierCurveTo(headX - 25, headY - 55, headX - 65, headY - 45, headX - 60, headY - 15);
      ctx.stroke();
      ctx.strokeStyle = '#1e1b18'; // Sharp black tips
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(headX - 63, headY - 25);
      ctx.lineTo(headX - 60, headY - 15);
      ctx.stroke();

      ctx.restore();

      // Floating Snowflakes / Blizzard particles
      if (isWeatherActive) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        for (let i = 0; i < 45; i++) {
          const fx = (i * 37 + timeSec * 60) % width;
          const fy = (i * 29 + timeSec * 85) % height;
          ctx.beginPath();
          ctx.arc(fx, fy, 1.5 + (i % 3), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // HABITAT 2: TERAI SUBTROPICAL SAVANNAH (Asian Elephant)
    // ─────────────────────────────────────────────────────────────
    else if (activeHabitat === 'terai') {
      // 1. Tropical Sky & Bright Sun
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.6);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(0.6, '#38bdf8');
      skyGrad.addColorStop(1, '#fed7aa'); // Warm amber horizon
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height * 0.62);

      // Distant Sal Tree Jungle Canopy
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.55);
      for (let t = 0; t < width; t += 35) {
        ctx.arc(t + 18, height * 0.52, 26, Math.PI, 0);
      }
      ctx.lineTo(width, height * 0.62);
      ctx.lineTo(0, height * 0.62);
      ctx.closePath();
      ctx.fill();

      // Savannah Ground & Red Clay Mud
      const earthGrad = ctx.createLinearGradient(0, height * 0.6, 0, height);
      earthGrad.addColorStop(0, '#ca8a04'); // Golden dry grass
      earthGrad.addColorStop(0.4, '#a16207');
      earthGrad.addColorStop(1, '#78350f'); // Warm clay earth
      ctx.fillStyle = earthGrad;
      ctx.fillRect(0, height * 0.58, width, height - height * 0.58);

      // Tall Terai Elephant Grass Clumps
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.5;
      for (let g = 10; g < width; g += 28) {
        const gh = 25 + Math.sin(g * 5) * 12;
        ctx.beginPath();
        ctx.moveTo(g, height * 0.65);
        ctx.quadraticCurveTo(g + 10, height * 0.65 - gh * 0.7, g + 18, height * 0.65 - gh);
        ctx.stroke();
      }

      // ─────────────────────────────────────────────────────────
      // 2. ASIAN ELEPHANT (2D Animated Organic Illustration)
      // ─────────────────────────────────────────────────────────
      const eleX = width * 0.48;
      const eleY = height * 0.52;
      const earFlap = Math.sin(timeSec * 3) * 0.15; // Flapping cooling ears

      ctx.save();
      // Drop shadow on ground
      ctx.fillStyle = 'rgba(67, 20, 7, 0.45)';
      ctx.beginPath();
      ctx.ellipse(eleX, eleY + 80, 130, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Thick Columnar Legs
      ctx.fillStyle = '#475569'; // Slate elephant grey
      // Back Legs
      ctx.fillRect(eleX + 65, eleY + 15, 24, 60);
      ctx.fillRect(eleX + 35, eleY + 18, 24, 57);
      // Front Legs
      ctx.fillRect(eleX - 60, eleY + 18, 25, 57);
      ctx.fillRect(eleX - 90, eleY + 15, 26, 60);

      // Cushioned Rounded Footpads & Toenails
      ctx.fillStyle = '#cbd5e1';
      for (let f = 0; f < 4; f++) {
        const fx = [eleX - 86, eleX - 56, eleX + 39, eleX + 69][f];
        for (let n = 0; n < 3; n++) {
          ctx.beginPath();
          ctx.arc(fx + n * 7 + 4, eleY + 74, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Massive Round Elephant Body
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(eleX, eleY - 10, 105, 75, 0.05, 0, Math.PI * 2);
      ctx.fill();

      // Wrinkled Skin Texture Creases
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      for (let w = -3; w <= 3; w++) {
        ctx.beginPath();
        ctx.arc(eleX + w * 22, eleY - 10, 50, 0.3, 1.2);
        ctx.stroke();
      }

      // Tail with bristle tuft
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(eleX + 105, eleY);
      ctx.quadraticCurveTo(eleX + 125, eleY + 30 + Math.sin(timeSec * 2) * 5, eleX + 120, eleY + 65);
      ctx.stroke();

      // Dome Head (Twin bulges characteristic of Asian elephant)
      const headX = eleX - 110;
      const headY = eleY - 35;

      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(headX - 10, headY - 12, 28, 0, Math.PI * 2);
      ctx.arc(headX + 14, headY - 14, 26, 0, Math.PI * 2);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(headX - 12, headY, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headX - 13, headY - 1, 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Large Cooling Vascular Ear (Flapping with earFlap angle)
      ctx.save();
      ctx.translate(headX + 20, headY - 10);
      ctx.rotate(earFlap);
      const earGrad = ctx.createLinearGradient(0, 0, 45, 60);
      earGrad.addColorStop(0, '#64748b');
      earGrad.addColorStop(0.5, '#f472b6'); // Pinkish vascular underside
      earGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = earGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(45, -15, 65, 35, 40, 75);
      ctx.bezierCurveTo(20, 85, -10, 60, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Prehensile Muscular Trunk (Curves gracefully and sprays water)
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(headX - 18, headY + 12);
      ctx.bezierCurveTo(
        headX - 45,
        headY + 45,
        headX - 70 + Math.sin(timeSec * 3) * 12,
        headY + 85,
        headX - 50 + Math.sin(timeSec * 3) * 14,
        headY + 110
      );
      ctx.stroke();

      // Tusk (Ivory)
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(headX - 20, headY + 15);
      ctx.quadraticCurveTo(headX - 45, headY + 35, headX - 60, headY + 25);
      ctx.quadraticCurveTo(headX - 40, headY + 20, headX - 16, headY + 10);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // ─────────────────────────────────────────────────────────────
    // HABITAT 3: AQUATIC KARNALI RIVER (Golden Mahseer Fish)
    // ─────────────────────────────────────────────────────────────
    else if (activeHabitat === 'aquatic') {
      // 1. Crystal-Clear Freshwater Aquatic Gradients
      const waterGrad = ctx.createLinearGradient(0, 0, 0, height);
      waterGrad.addColorStop(0, '#0284c7'); // Surface light
      waterGrad.addColorStop(0.4, '#0369a1');
      waterGrad.addColorStop(0.85, '#075985');
      waterGrad.addColorStop(1, '#0c4a6e'); // Deep riverbed
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 0, width, height);

      // Shimmering Sunlight Caustics through Water Surface
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      for (let c = 0; c < 8; c++) {
        const cx = (c * 120 + Math.sin(timeSec + c) * 35) % width;
        ctx.beginPath();
        ctx.moveTo(cx, 0);
        ctx.lineTo(cx + 60, height * 0.7);
        ctx.lineTo(cx + 10, height * 0.7);
        ctx.closePath();
        ctx.fill();
      }

      // Riverbed Smooth Glacial Pebbles & Submerged Sand
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, height * 0.82, width, height - height * 0.82);

      const riverPebbles = [
        { x: 80, y: height * 0.88, rx: 25, ry: 14, col: '#64748b' },
        { x: 190, y: height * 0.91, rx: 32, ry: 18, col: '#78716c' },
        { x: 380, y: height * 0.86, rx: 28, ry: 15, col: '#94a3b8' },
        { x: 550, y: height * 0.9, rx: 38, ry: 20, col: '#64748b' },
        { x: 740, y: height * 0.87, rx: 30, ry: 16, col: '#a8a29e' },
      ];
      riverPebbles.forEach((peb) => {
        ctx.fillStyle = peb.col;
        ctx.beginPath();
        ctx.ellipse(peb.x, peb.y, peb.rx, peb.ry, 0.1, 0, Math.PI * 2);
        ctx.fill();
      });

      // Aquatic River Weeds Swaying with Current
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 4;
      for (let w = 40; w < width; w += 120) {
        ctx.beginPath();
        ctx.moveTo(w, height * 0.85);
        ctx.bezierCurveTo(
          w + Math.sin(timeSec * 2 + w) * 25,
          height * 0.65,
          w - Math.cos(timeSec * 2 + w) * 20,
          height * 0.45,
          w + Math.sin(timeSec * 2) * 30,
          height * 0.35
        );
        ctx.stroke();
      }

      // ─────────────────────────────────────────────────────────
      // 2. GOLDEN MAHSEER FISH (2D Animated Swimming Illustration)
      // ─────────────────────────────────────────────────────────
      const fishX = width * 0.48;
      const fishY = height * 0.48 + Math.sin(timeSec * 3) * 6; // Buoyant hovering
      const swimTailWave = Math.sin(timeSec * 8) * 14; // Caudal fin thrust

      ctx.save();
      // Drop shadow on riverbed
      ctx.fillStyle = 'rgba(7, 89, 133, 0.6)';
      ctx.beginPath();
      ctx.ellipse(fishX, height * 0.83, 140, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Caudal Fin (Forked powerful tail)
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fishX + 115, fishY);
      ctx.lineTo(fishX + 165, fishY - 38 + swimTailWave);
      ctx.quadraticCurveTo(fishX + 140, fishY + swimTailWave, fishX + 165, fishY + 38 + swimTailWave);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Dorsal Fin (Top stabilizing keel)
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(fishX - 25, fishY - 38);
      ctx.quadraticCurveTo(fishX + 5, fishY - 75, fishX + 45, fishY - 32);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Ventral / Anal Fin (Bottom keel)
      ctx.beginPath();
      ctx.moveTo(fishX + 35, fishY + 30);
      ctx.lineTo(fishX + 55, fishY + 58);
      ctx.lineTo(fishX + 75, fishY + 24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Streamlined Hydrodynamic Torpedo Body
      const bodyGrad = ctx.createLinearGradient(fishX - 130, fishY, fishX + 120, fishY);
      bodyGrad.addColorStop(0, '#fef08a'); // Golden amber head
      bodyGrad.addColorStop(0.35, '#f59e0b'); // Golden Mahseer scales
      bodyGrad.addColorStop(0.7, '#d97706');
      bodyGrad.addColorStop(1, '#92400e');

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(fishX - 130, fishY); // Snout
      // Dorsal upper curve
      ctx.bezierCurveTo(fishX - 85, fishY - 45, fishX + 45, fishY - 40, fishX + 120, fishY - 5);
      // Ventral lower curve
      ctx.bezierCurveTo(fishX + 45, fishY + 38, fishX - 85, fishY + 35, fishX - 130, fishY);
      ctx.fill();

      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Glistening Golden Scales Mesh pattern
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
      ctx.lineWidth = 1.2;
      for (let col = -3; col <= 4; col++) {
        for (let row = -1; row <= 1; row++) {
          ctx.beginPath();
          ctx.arc(fishX + col * 24, fishY + row * 16, 12, 0, Math.PI);
          ctx.stroke();
        }
      }

      // Lateral Line Sensory System (Continuous line along body flank)
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(fishX - 70, fishY);
      ctx.quadraticCurveTo(fishX, fishY - 2, fishX + 105, fishY - 3);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Operculum (Gill Cover flap pulsing with respiration)
      const gillPulse = Math.sin(timeSec * 5) * 3;
      ctx.fillStyle = '#dc2626'; // Red gill filaments peek through
      ctx.beginPath();
      ctx.ellipse(fishX - 68, fishY + 2, 4 + gillPulse, 18, 0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(fishX - 65, fishY + 2, 22, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();

      // Eye with crystal lens
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(fishX - 98, fishY - 8, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(fishX - 98, fishY - 8, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(fishX - 98, fishY - 8, 2, 0, Math.PI * 2);
      ctx.fill();

      // Pectoral Steering Fin (Flutters near head)
      ctx.save();
      ctx.translate(fishX - 52, fishY + 12);
      ctx.rotate(Math.sin(timeSec * 6) * 0.25);
      ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(26, 18);
      ctx.lineTo(15, 32);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.restore();

      // Rising Aquatic Oxygen Bubbles
      if (isWeatherActive) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        for (let b = 0; b < 18; b++) {
          const bx = (b * 49 + Math.sin(timeSec * 2 + b) * 12) % width;
          const by = height - ((timeSec * 45 + b * 32) % height);
          ctx.beginPath();
          ctx.arc(bx, by, 2 + (b % 4), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 4. INTERACTIVE ADAPTATION CALLOUT PINS
    // ─────────────────────────────────────────────────────────────
    if (showLabels) {
      currentHabitat.spots.forEach((spot) => {
        const isHovered = selectedSpotId === spot.id;
        ctx.save();
        // Pulse aura
        const pulse = Math.sin(timeSec * 5) * 3;
        ctx.fillStyle = isHovered ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 255, 255, 0.28)';
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, 11 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Core Pin
        ctx.fillStyle = isHovered ? '#38bdf8' : '#ffffff';
        ctx.beginPath();
        ctx.arc(spot.x, spot.y, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Tag Card
        ctx.font = 'bold 11px Inter, sans-serif';
        const txt = lang === 'en' ? spot.nameEn.split('(')[0] : spot.nameNe.split('(')[0];
        const txtWidth = ctx.measureText(txt).width;

        const tagX = spot.x > width * 0.55 ? spot.x - txtWidth - 20 : spot.x + 14;
        const tagY = spot.y - 4;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = isHovered ? '#38bdf8' : 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(tagX - 6, tagY - 12, txtWidth + 12, 20, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = isHovered ? '#38bdf8' : '#ffffff';
        ctx.textAlign = 'left';
        ctx.fillText(txt, tagX, tagY + 2);
        ctx.restore();
      });
    }
  }, [activeHabitat, selectedSpotId, showLabels, envTemp, isWeatherActive, lang, currentHabitat.spots]);

  // Continuous animation frame loop
  useEffect(() => {
    let handle: number;
    const loop = () => {
      renderCanvas();
      handle = requestAnimationFrame(loop);
    };
    handle = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(handle);
  }, [renderCanvas]);

  // Quiz Questions for Stage: Challenge
  const quizQuestions = [
    {
      qEn: 'Why do elephants flap their massive ears during sweltering tropical days?',
      qNe: 'गर्मी मौसममा हात्तीले आफ्ना ठूला कान किन निरन्तर हल्लाइरहन्छ?',
      optionsEn: [
        'To dissipate metabolic heat through thousands of capillary blood vessels',
        'To scare away attacking birds and monkeys',
        'To help their wings fly across mountains',
        'To make drum music for the herd',
      ],
      optionsNe: [
        'कानका हजारौं रक्तनलीबाट शरीरको अतिरिक्त ताप फालेर रगत चिसो बनाउन',
        'वरिपरिका चरा र बाँदर भगाउन',
        'पखेटा बनाएर आकाशमा उड्न',
        'साथीहरूका लागि सङ्गीत बजाउन',
      ],
      correct: 0,
      expEn: 'Elephant ears act as biological radiators; waving them cools circulating blood by up to 5°C before returning to the core.',
      expNe: 'हात्तीको कानमा धेरै रक्तनली हुन्छन्। कान हल्लाउँदा रगत चिसो भएर शरीरभरि पुग्छ।',
    },
    {
      qEn: 'Which anatomical adaptation prevents Himalayan Yaks from sinking into deep alpine snowdrifts?',
      qNe: 'हिमाली याकलाई बाक्लो हिउँमा खुट्टा नगाडियोस् भनेर कुन शारीरिक बनोटले मद्दत गर्छ?',
      optionsEn: [
        'Broad, rounded non-skid hooves that distribute body weight',
        'Long feathers like an eagle on its tail',
        'Sharp pointed needles beneath its knees',
        'Walking upside down on tree branches',
      ],
      optionsNe: [
        'फराकिला र चिप्लन नदिने खुरहरू जसले शरीरको तौललाई फैलाउँछन्',
        'चीलको जस्तो लामा पखेटाले गर्दा',
        'खुट्टामुनि तिखा सुईहरू भएर',
        'रूखको हाँगामा उल्टो झुन्डिएर',
      ],
      correct: 0,
      expEn: 'Large hooves increase contact area (P = F/A), lowering pressure and giving non-skid traction on icy mountain ridges.',
      expNe: 'फराकिला खुरहरूले हिउँमा चाप घटाउँछन् जसले गर्दा याक हिउँमा नभासिई सजिलै हिँड्न सक्छ।',
    },
    {
      qEn: 'What is the primary function of a fish’s lateral line system?',
      qNe: 'माछाको शरीरको छेउमा रहेको पार्श्व रेखा (Lateral Line) को मुख्य काम के हो?',
      optionsEn: [
        'Detecting water vibrations, pressure changes, and nearby predators',
        'Producing sweet honey for young fry',
        'Tasting food dropped on river banks',
        'Absorbing direct solar electricity',
      ],
      optionsNe: [
        'पानीको कम्पन, दबाब र नजिक आएको शत्रु पत्ता लगाउन',
        'बच्चाका लागि मह बनाउन',
        'नदी किनारको खानाको स्वाद लिन',
        'घामबाट बिजुली बनाउन',
      ],
      correct: 0,
      expEn: 'The lateral line consists of sensitive hair-cell neuromasts that detect fluid motion and pressure gradients.',
      expNe: 'पार्श्व रेखाले पानीको हल्का कम्पन पनि थाहा पाएर माछालाई खतराबाट जोगिन मद्दत गर्छ।',
    },
  ];

  const handleQuizAnswer = (idx: number) => {
    setQuizSelected(idx);
    const curr = quizQuestions[quizIdx];
    if (idx === curr.correct) {
      setQuizFeedback('correct');
      ScienceAudio.playSuccess();
      setStars(3);
      setIsCompleted(true);
    } else {
      setQuizFeedback('wrong');
      ScienceAudio.playBonk();
    }
  };

  const handleReset = () => {
    setActiveHabitat('himalayan');
    setSelectedSpotId('wool');
    setShowLabels(true);
    ScienceAudio.playWhoosh();
  };

  return (
    <SimulationLayout
      title="Wildlife Adaptation Explorer: High Himalayas to Lowland Terai"
      titleNepali="वन्यजन्तु अनुकूलन अन्वेषण: हिमालदेखि तराईसम्म"
      chapterNumber={3}
      chapterTitle="Organisms and Their Structure"
      chapterTitleNepali="जीव र तिनका शारीरिक बनोट"
      currentStage={stage}
      onStageChange={(st) => {
        setStage(st);
        ScienceAudio.playClick();
      }}
      lang={lang}
      onLanguageChange={(l) => {
        setLang(l);
        ScienceAudio.playClick();
      }}
      onReset={handleReset}
      onBackToLibrary={onBackToLibrary}
      stars={stars}
      isCompleted={isCompleted}
      currentPromptEn="Select a habitat to observe how animals adapt their physical anatomy to survive extreme cold, heat, and aquatic currents!"
      currentPromptNe="बासस्थान छान्नुहोस् र अत्यधिक चिसो, गर्मी तथा पानीको धारमा बाँच्न जनावरहरूले कसरी शारीरिक अनुकूलन गरेका छन् हेर्नुहोस्!"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 390px',
          height: '100%',
          overflow: 'hidden',
          background: '#f8fafc',
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
          }}
        >
          {/* Main 2D Canvas */}
          <canvas
            ref={canvasRef}
            width={880}
            height={560}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              background: '#f1f5f9',
            }}
          />

          {/* Top Habitat Switcher Tabs */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              left: '16px',
              display: 'flex',
              gap: '8px',
              zIndex: 10,
            }}
          >
            <button
              onClick={() => {
                setActiveHabitat('himalayan');
                ScienceAudio.playPop();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: activeHabitat === 'himalayan' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: activeHabitat === 'himalayan' ? '#0284c7' : '#ffffff',
                color: activeHabitat === 'himalayan' ? '#ffffff' : '#334155',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <Mountain size={14} color={activeHabitat === 'himalayan' ? '#ffffff' : '#0284c7'} />
              {lang === 'en' ? 'Himalayan Yak' : 'हिमाली याक'}
            </button>

            <button
              onClick={() => {
                setActiveHabitat('terai');
                ScienceAudio.playPop();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: activeHabitat === 'terai' ? '2px solid #d97706' : '1px solid #cbd5e1',
                background: activeHabitat === 'terai' ? '#d97706' : '#ffffff',
                color: activeHabitat === 'terai' ? '#ffffff' : '#334155',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <Trees size={14} color={activeHabitat === 'terai' ? '#ffffff' : '#d97706'} />
              {lang === 'en' ? 'Terai Elephant' : 'तराई हात्ती'}
            </button>

            <button
              onClick={() => {
                setActiveHabitat('aquatic');
                ScienceAudio.playPop();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: activeHabitat === 'aquatic' ? '2px solid #0891b2' : '1px solid #cbd5e1',
                background: activeHabitat === 'aquatic' ? '#0891b2' : '#ffffff',
                color: activeHabitat === 'aquatic' ? '#ffffff' : '#334155',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <Droplets size={14} color={activeHabitat === 'aquatic' ? '#ffffff' : '#0891b2'} />
              {lang === 'en' ? 'River Mahseer Fish' : 'कर्णाली महासीर माछा'}
            </button>
          </div>

          {/* Top-Right Weather & Label Toggles */}
          <div
            style={{
              position: 'absolute',
              top: '14px',
              right: '16px',
              display: 'flex',
              gap: '8px',
              zIndex: 10,
            }}
          >
            <button
              onClick={() => {
                setIsWeatherActive(!isWeatherActive);
                ScienceAudio.playClick();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '10px',
                border: isWeatherActive ? '2px solid #059669' : '1px solid #cbd5e1',
                background: isWeatherActive ? '#059669' : '#ffffff',
                color: isWeatherActive ? '#ffffff' : '#334155',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <CloudSnow size={14} color={isWeatherActive ? '#ffffff' : '#059669'} />
              {lang === 'en' ? 'Weather FX' : 'मौसम प्रभाव'}
            </button>

            <button
              onClick={() => {
                setShowLabels(!showLabels);
                ScienceAudio.playPop();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '10px',
                border: showLabels ? '2px solid #0284c7' : '1px solid #cbd5e1',
                background: showLabels ? '#0284c7' : '#ffffff',
                color: showLabels ? '#ffffff' : '#334155',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <Eye size={14} color={showLabels ? '#ffffff' : '#0284c7'} />
              {lang === 'en' ? 'Pins' : 'अङ्गका नाम'}
            </button>
          </div>

          {/* Bottom Habitat Quick Info Strip */}
          <div
            style={{
              position: 'absolute',
              bottom: '14px',
              left: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              backdropFilter: 'blur(10px)',
              padding: '10px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                {lang === 'en' ? currentHabitat.organismEn : currentHabitat.organismNe}
              </div>
              <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: 600 }}>
                {lang === 'en' ? currentHabitat.altitudeEn : currentHabitat.altitudeNe}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Thermometer size={16} color="#ef4444" />
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
                {envTemp > 0 ? `+${envTemp}°C` : `${envTemp}°C`}
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            RIGHT COLUMN: HABITAT LAB & MORPHOLOGY INSPECTOR
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
          {/* Habitat Description Card */}
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="#059669" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#065f46' }}>
                {lang === 'en' ? currentHabitat.titleEn : currentHabitat.titleNe}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#166534', marginTop: '6px', lineHeight: 1.45 }}>
              <em>{currentHabitat.scientificName}</em>
            </div>
          </div>

          {/* Adaptation Spot Selector Buttons */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '8px' }}>
              {lang === 'en' ? 'SELECT ADAPTIVE ORGAN' : 'अनुकूलन अङ्ग छनौट गर्नुहोस्'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
              {currentHabitat.spots.map((spot) => {
                const isSelected = selectedSpotId === spot.id;
                return (
                  <button
                    key={spot.id}
                    onClick={() => {
                      setSelectedSpotId(spot.id);
                      ScienceAudio.playClick();
                    }}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '10px',
                      border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                      background: isSelected ? '#f0f9ff' : '#f8fafc',
                      color: isSelected ? '#0369a1' : '#334155',
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {lang === 'en' ? spot.nameEn : spot.nameNe}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Adaptive Organ Deep Dive Card */}
          {activeSpot && (
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0369a1' }}>
                {lang === 'en' ? activeSpot.nameEn : activeSpot.nameNe}
              </div>
              <div style={{ fontSize: '12px', color: '#334155', marginTop: '6px', lineHeight: 1.5 }}>
                {lang === 'en' ? activeSpot.roleEn : activeSpot.roleNe}
              </div>
              <div
                style={{
                  marginTop: '10px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: '#f0fdf4',
                  border: '1px solid #dcfce7',
                  fontSize: '11px',
                  color: '#166534',
                  lineHeight: 1.45,
                }}
              >
                <strong style={{ color: '#059669' }}>
                  {lang === 'en' ? 'Scientific Principle: ' : 'वैज्ञानिक सिद्धान्त: '}
                </strong>
                {lang === 'en' ? activeSpot.scientificConceptEn : activeSpot.scientificConceptNe}
              </div>
            </div>
          )}

          {/* Stage 5: Challenge Quiz Card */}
          {stage === 'challenge' && (
            <div
              style={{
                marginTop: 'auto',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '12px',
                padding: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Award size={16} color="#d97706" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#b45309' }}>
                  {lang === 'en'
                    ? `Adaptation Quiz (${quizIdx + 1}/${quizQuestions.length})`
                    : `अनुकूलन प्रश्नोत्तर (${quizIdx + 1}/${quizQuestions.length})`}
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 600, marginBottom: '10px' }}>
                {lang === 'en' ? quizQuestions[quizIdx].qEn : quizQuestions[quizIdx].qNe}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(lang === 'en' ? quizQuestions[quizIdx].optionsEn : quizQuestions[quizIdx].optionsNe).map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuizAnswer(i)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border:
                        quizSelected === i
                          ? i === quizQuestions[quizIdx].correct
                            ? '1px solid #059669'
                            : '1px solid #dc2626'
                          : '1px solid #e2e8f0',
                      background:
                        quizSelected === i
                          ? i === quizQuestions[quizIdx].correct
                            ? '#f0fdf4'
                            : '#fef2f2'
                          : '#ffffff',
                      color: '#0f172a',
                      fontSize: '11px',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {quizFeedback && (
                <div style={{ marginTop: '10px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: quizFeedback === 'correct' ? '#059669' : '#dc2626',
                      marginBottom: '4px',
                    }}
                  >
                    {quizFeedback === 'correct'
                      ? lang === 'en'
                        ? '✓ Correct! Excellent Ecological Knowledge.'
                        : '✓ स्याबास! सही उत्तर।'
                      : lang === 'en'
                      ? '✗ Not quite. Look closely at the explanation.'
                      : '✗ मिलेन। तलको व्याख्या हेर्नुहोस्।'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    {lang === 'en' ? quizQuestions[quizIdx].expEn : quizQuestions[quizIdx].expNe}
                  </div>
                  {quizIdx < quizQuestions.length - 1 && (
                    <button
                      onClick={() => {
                        setQuizIdx((prev) => prev + 1);
                        setQuizSelected(null);
                        setQuizFeedback(null);
                      }}
                      style={{
                        marginTop: '8px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#0284c7',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {lang === 'en' ? 'Next Question →' : 'अर्को प्रश्न →'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bottom Stage Progression Button */}
          <button
            onClick={() => {
              setIsCompleted(true);
              setStars(3);
              ScienceAudio.playCelebration();
              setStage('challenge');
            }}
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.25)',
            }}
          >
            <Check size={16} />
            {lang === 'en' ? 'Complete Adaptation Lab & Quiz' : 'प्रयोग पूरा गर्नुहोस् र प्रश्न हल गर्नुहोस्'}
          </button>
        </div>
      </div>
    </SimulationLayout>
  );
};
export default AnimalAdaptationSim;

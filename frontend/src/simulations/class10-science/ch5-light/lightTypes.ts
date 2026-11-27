/**
 * lightTypes.ts
 * Type definitions, physical constants, and curriculum presets for
 * Class 10 Science Chapter 5: Phenomena of Light
 * Nepal CDC Alignment
 */

export type OpticalPhenomenon =
  | 'reflection'
  | 'refraction'
  | 'dispersion'
  | 'diffraction'
  | 'interference'
  | 'polarization'
  | 'tir'
  | 'photoelectric'
  | 'compton';

export type RefractionSubMode = 'meaning' | 'causes' | 'glass_slab';

export type MirrorType = 'plane' | 'concave' | 'convex' | 'diffuse';

export type MediumKey = 'vacuum' | 'air' | 'water' | 'crown_glass' | 'flint_glass' | 'diamond';

export interface OpticalMedium {
  key: MediumKey;
  nameEn: string;
  nameNe: string;
  refractiveIndex: number;
  speedOfLight: number; // in 10^8 m/s
  opticalDensity: 'Vacuum' | 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
  opticalDensityNe: string;
  tintColor: string;
}

export const OPTICAL_MEDIA: Record<MediumKey, OpticalMedium> = {
  vacuum: {
    key: 'vacuum',
    nameEn: 'Vacuum',
    nameNe: 'शून्य (Vacuum)',
    refractiveIndex: 1.000,
    speedOfLight: 3.00,
    opticalDensity: 'Vacuum',
    opticalDensityNe: 'शून्य',
    tintColor: 'rgba(248, 250, 252, 0)',
  },
  air: {
    key: 'air',
    nameEn: 'Air',
    nameNe: 'हावा (Air)',
    refractiveIndex: 1.0003,
    speedOfLight: 2.997,
    opticalDensity: 'Very Low',
    opticalDensityNe: 'अति कम',
    tintColor: 'rgba(240, 249, 255, 0.1)',
  },
  water: {
    key: 'water',
    nameEn: 'Water',
    nameNe: 'पानी (Water)',
    refractiveIndex: 1.333,
    speedOfLight: 2.25,
    opticalDensity: 'Low',
    opticalDensityNe: 'कम',
    tintColor: 'rgba(186, 230, 253, 0.45)',
  },
  crown_glass: {
    key: 'crown_glass',
    nameEn: 'Crown Glass',
    nameNe: 'काँच (Crown Glass)',
    refractiveIndex: 1.52,
    speedOfLight: 1.97,
    opticalDensity: 'Medium',
    opticalDensityNe: 'मध्यम',
    tintColor: 'rgba(224, 242, 254, 0.55)',
  },
  flint_glass: {
    key: 'flint_glass',
    nameEn: 'Flint Glass',
    nameNe: 'फ्लिन्ट काँच (Dense Glass)',
    refractiveIndex: 1.66,
    speedOfLight: 1.80,
    opticalDensity: 'High',
    opticalDensityNe: 'उच्च',
    tintColor: 'rgba(207, 250, 254, 0.65)',
  },
  diamond: {
    key: 'diamond',
    nameEn: 'Diamond',
    nameNe: 'हिरा (Diamond)',
    refractiveIndex: 2.42,
    speedOfLight: 1.24,
    opticalDensity: 'Very High',
    opticalDensityNe: 'अति उच्च',
    tintColor: 'rgba(254, 240, 138, 0.45)',
  },
};

export interface SafeLabelCallout {
  id: string;
  targetX: number;
  targetY: number;
  anchorX: number;
  anchorY: number;
  badgeX: number;
  badgeY: number;
  textEn: string;
  textNe: string;
  value?: string;
  color: string;
  tag?: string;
  align?: 'left' | 'right' | 'center';
}

export interface QuizQuestion {
  id: number;
  phenomenon: OpticalPhenomenon;
  questionEn: string;
  questionNe: string;
  optionsEn: string[];
  optionsNe: string[];
  correctIdx: number;
  explanationEn: string;
  explanationNe: string;
}

export const LIGHT_SIM_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    phenomenon: 'reflection',
    questionEn: 'According to the Law of Reflection, what is the relation between the angle of incidence (i) and the angle of reflection (r)?',
    questionNe: 'परावर्तनको नियम अनुसार आपतन कोण (i) र परावर्तन कोण (r) बीच के सम्बन्ध हुन्छ?',
    optionsEn: ['i = r', 'i > r', 'i < r', 'i + r = 90°'],
    optionsNe: ['i = r', 'i > r', 'i < r', 'i + r = 90°'],
    correctIdx: 0,
    explanationEn: 'The first law of reflection states that the angle of incidence equals the angle of reflection (∠i = ∠r).',
    explanationNe: 'परावर्तनको पहिलो नियम अनुसार आपतन कोण र परावर्तन कोण सधैं बराबर हुन्छन् (∠i = ∠r)।',
  },
  {
    id: 2,
    phenomenon: 'refraction',
    questionEn: 'What is the primary cause of refraction when light passes from air into a glass slab?',
    questionNe: 'प्रकाश हावाबाट काँचको पातामा प्रवेश गर्दा अपवर्तन हुनुको मुख्य कारण के हो?',
    optionsEn: [
      'Change in the speed of light',
      'Change in the frequency of light',
      'Absorption of light photons',
      'Gravitational attraction of glass',
    ],
    optionsNe: [
      'प्रकाशको गतिमा परिवर्तन हुनु',
      'प्रकाशको आवृत्ति परिवर्तन हुनु',
      'काँचले प्रकाश सोस्नु',
      'काँचको गुरुत्वाकर्षण आकर्षण',
    ],
    correctIdx: 0,
    explanationEn: 'Refraction occurs because light travels at different speeds in different optical media (v = c / n).',
    explanationNe: 'विभिन्न अप्टिकल माध्यममा प्रकाशको गति फरक फरक (v = c / n) हुने भएकाले अपवर्तन हुन्छ।',
  },
  {
    id: 3,
    phenomenon: 'refraction',
    questionEn: 'In refraction through a rectangular glass slab, what is the geometric relationship between the incident ray and the emergent ray?',
    questionNe: 'आयताकार काँचको पाताबाट अपवर्तन हुँदा आपतित किरण र निर्गत किरणबीच कस्तो ज्यामितीय सम्बन्ध हुन्छ?',
    optionsEn: [
      'They are parallel to each other with a lateral displacement',
      'They intersect at a 90° angle',
      'The emergent ray travels backwards',
      'They diverge permanently away from each other',
    ],
    optionsNe: [
      'तिनीहरू एकअर्कासँग समानान्तर हुन्छन् र पार्श्व विस्थापन हुन्छ',
      'तिनीहरू 90° को कोणमा काटिन्छन्',
      'निर्गत किरण उल्टो दिशामा फर्कन्छ',
      'तिनीहरू स्थायी रूपमा टाढा जान्छन्',
    ],
    correctIdx: 0,
    explanationEn: 'The emergent ray is parallel to the incident ray because opposite faces of the glass block are parallel, shifting sideways by lateral displacement (d).',
    explanationNe: 'काँचको पाताका दुई विपरीत सतहहरू समानान्तर हुने भएकाले निर्गत किरण आपतित किरणसँग समानान्तर हुन्छ र साइडमा पार्श्व विस्थापन (d) देखिन्छ।',
  },
  {
    id: 4,
    phenomenon: 'dispersion',
    questionEn: 'Which color in the visible spectrum bends the most when passing through a triangular glass prism?',
    questionNe: 'त्रिभुजाकार काँचको प्रिज्मबाट पार हुँदा दृश्य वर्णक्रमको कुन रङ सबैभन्दा बढी बाङ्गिन्छ?',
    optionsEn: ['Violet', 'Red', 'Green', 'Yellow'],
    optionsNe: ['बैजनी (Violet)', 'रातो (Red)', 'हरियो (Green)', 'पहेँलो (Yellow)'],
    correctIdx: 0,
    explanationEn: 'Violet light has the shortest wavelength and experiences the highest refractive index in glass, causing it to deviate the most.',
    explanationNe: 'बैजनी रङको तरङ्ग लम्बाइ सबैभन्दा छोटो हुने र काँचमा यसको अपवर्तनांक सबैभन्दा धेरै हुने भएकाले यो सबैभन्दा बढी बाङ्गिन्छ।',
  },
  {
    id: 5,
    phenomenon: 'tir',
    questionEn: 'What two conditions are strictly required for Total Internal Reflection (TIR) to occur?',
    questionNe: 'पूर्ण आन्तरिक परावर्तन (TIR) हुनका लागि कुन दुई सर्तहरू अनिवार्य छन्?',
    optionsEn: [
      'Light travels from denser to rarer medium, and angle of incidence > critical angle',
      'Light travels from rarer to denser medium, and angle of incidence < critical angle',
      'Light must be purely monochromatic red light',
      'The medium must be diamond at 0°C',
    ],
    optionsNe: [
      'प्रकाश सघनबाट विरल माध्यममा जानुपर्छ र आपतन कोण क्रान्तिक कोणभन्दा ठूलो हुनुपर्छ',
      'प्रकाश विरलबाट सघन माध्यममा जानुपर्छ र आपतन कोण सानो हुनुपर्छ',
      'प्रकाश केवल रातो रङको मात्र हुनुपर्छ',
      'माध्यम शून्य डिग्रीमा रहेको हिरा नै हुनुपर्छ',
    ],
    correctIdx: 0,
    explanationEn: 'TIR occurs only when light travels from an optically denser to rarer medium and the incident angle exceeds the critical angle (i > θc).',
    explanationNe: 'पूर्ण आन्तरिक परावर्तन हुन प्रकाश सघनबाट विरल माध्यममा जानुपर्छ र आपतन कोण क्रान्तिक कोणभन्दा ठूलो (i > θc) हुनुपर्छ।',
  },
  {
    id: 6,
    phenomenon: 'polarization',
    questionEn: 'According to Malus’s Law, what is the transmitted intensity when the analyzer is rotated to 90° relative to the polarizer?',
    questionNe: 'मालसको नियम अनुसार पोलराइजरको सापेक्षमा एनालाइजरलाई 90° मा घुमाउँदा प्रकाशको तीव्रता कति हुन्छ?',
    optionsEn: [
      'Zero (Complete extinction / Darkness)',
      'Equal to the initial intensity (I0)',
      'Double the initial intensity',
      '50% of the initial intensity',
    ],
    optionsNe: [
      'शून्य (पूर्ण अन्धकार / Complete extinction)',
      'सुरुको तीव्रता बराबर (I0)',
      'सुरुको भन्दा दोब्बर',
      '50 प्रतिशत मात्र',
    ],
    correctIdx: 0,
    explanationEn: 'Malus’s law states I = I1 · cos²(θ). When θ = 90°, cos(90°) = 0, so transmitted intensity becomes zero.',
    explanationNe: 'मालसको नियम I = I1 · cos²(θ) अनुसार θ = 90° हुँदा cos(90°) = 0 हुने भएकाले प्रकाशको तीव्रता शून्य हुन्छ।',
  },
  {
    id: 7,
    phenomenon: 'photoelectric',
    questionEn: 'In Einstein’s photoelectric effect, what happens if the incident light frequency is below the threshold frequency (f < f0)?',
    questionNe: 'आइन्स्टाइनको फोटोइलेक्ट्रिक प्रभावमा, यदि आपतित प्रकाशको आवृत्ति थ्रेसहोल्ड आवृत्तिभन्दा कम (f < f0) भएमा के हुन्छ?',
    optionsEn: [
      'No electrons are emitted, regardless of how intense the light is',
      'Electrons are emitted with very high kinetic energy',
      'Electrons take several minutes to slowly emerge',
      'The metal plate melts immediately',
    ],
    optionsNe: [
      'प्रकाश जतिसुकै चम्किलो भए तापनि कुनै पनि इलेक्ट्रोन निस्कँदैन',
      'इलेक्ट्रोनहरू अति उच्च गतिमा बाहिर निस्कन्छन्',
      'इलेक्ट्रोन निस्कन केही मिनेट समय लाग्छ',
      'धातुको पाता तुरुन्त पग्लिन्छ',
    ],
    correctIdx: 0,
    explanationEn: 'If photon energy (hf) is less than the work function Φ (f < f0), no electrons can be liberated regardless of light intensity.',
    explanationNe: 'यदि फोटोनको ऊर्जा धातुको कार्य फलनभन्दा कम (f < f0) भएमा प्रकाश जति नै शक्तिशाली भए पनि इलेक्ट्रोन निस्कँदैन।',
  },
  {
    id: 8,
    phenomenon: 'compton',
    questionEn: 'In the Compton Effect, how does the wavelength of the scattered X-ray photon compare to the incident photon wavelength?',
    questionNe: 'कम्प्टोन प्रभावमा छरिएको एक्स-रे फोटोनको तरङ्ग लम्बाइ आपतित फोटोनको भन्दा कस्तो हुन्छ?',
    optionsEn: [
      'The scattered wavelength is longer (λ\' > λ)',
      'The scattered wavelength is shorter (λ\' < λ)',
      'The wavelength remains strictly identical',
      'The photon turns into a proton',
    ],
    optionsNe: [
      'छरिएको फोटोनको तरङ्ग लम्बाइ लामो हुन्छ (λ\' > λ)',
      'छरिएको फोटोनको तरङ्ग लम्बाइ छोटो हुन्छ (λ\' < λ)',
      'तरङ्ग लम्बाइमा कुनै परिवर्तन हुँदैन',
      'फोटोन प्रोटोनमा परिणत हुन्छ',
    ],
    correctIdx: 0,
    explanationEn: 'The photon transfers part of its kinetic energy and momentum to the target electron, decreasing its frequency and increasing its wavelength (Δλ = (h/mc)(1 - cos θ)).',
    explanationNe: 'फोटोनले आफ्नो केही ऊर्जा र संवेग इलेक्ट्रोनलाई दिने हुँदा यसको आवृत्ति घट्छ र तरङ्ग लम्बाइ बढ्छ (λ\' > λ)।',
  },
];

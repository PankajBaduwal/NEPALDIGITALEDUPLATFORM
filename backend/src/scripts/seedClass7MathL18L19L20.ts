import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nepal_edu_ecosystem';

const SimulationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    titleNepali: String,
    description: { type: String, required: true },
    descriptionNepali: String,
    subjectCode: { type: String, required: true },
    subjectName: { type: String, required: true },
    gradeLevels: [{ type: Number, required: true }],
    chapterNumber: Number,
    chapterName: String,
    chapterNameNepali: String,
    simulationType: {
      type: String,
      enum: ['HTML5_CANVAS', 'PHASER', 'REACT_CANVAS', 'WEB_GL'],
      default: 'REACT_CANVAS',
    },
    componentKey: String,
    runtimeUrl: String,
    difficulty: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
      default: 'INTERMEDIATE',
    },
    estimatedDurationMinutes: { type: Number, default: 15 },
    learningObjectives: [String],
    learningObjectivesNepali: [String],
    isPublished: { type: Boolean, default: true },
    currentVersion: { type: String, default: '1.0.0' },
    tags: [String],
  },
  { timestamps: true }
);

const Simulation = mongoose.models.Simulation || mongoose.model('Simulation', SimulationSchema);

const CLASS7_L18_L19_L20_SIMS = [
  // ── LESSON 18: SYMMETRY AND TESSELLATION ─────────────────────────────
  {
    code: 'SIM-MATH-G7-L18-01',
    key: 'class7-math-l18-line-symmetry',
    chapterNumber: 18,
    chapterName: 'Symmetry and Tessellation',
    chapterNameNepali: 'सममिति र टेसलेसन',
    title: 'Line Symmetry and Mirror Playground',
    titleNepali: 'रेखीय सममिति र ऐना खेलमैदान',
    description: 'Explore line symmetry, count axes of symmetry in regular and irregular figures, fold paper to reveal mirror symmetry, and complete half-figures on a grid.',
    descriptionNepali: 'रेखीय सममिति बुझ्ने, विभिन्न ज्यामितीय आकृतिहरूका सममिति अक्षहरू गन्ने, कागज पट्याउने प्रयोग गर्ने र ग्रिडमा आधा आकृति पूरा गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Understand the geometric concept of line symmetry and axes of symmetry', 'Count and locate axes of symmetry for regular polygons and everyday objects', 'Complete half-figures using mirror line reflections'],
    learningObjectivesNepali: ['रेखीय सममिति र सममिति अक्षको अवधारणा बुझ्ने', 'ज्यामितीय आकृतिहरूका सममिति अक्षहरू पहिचान गर्ने र गन्ने', 'ऐना रेखाबाट आधा आकृति पूरा गर्ने'],
    tags: ['math', 'grade7', 'symmetry', 'line-symmetry', 'reflection', 'geometry'],
  },
  {
    code: 'SIM-MATH-G7-L18-02',
    key: 'class7-math-l18-point-symmetry',
    chapterNumber: 18,
    chapterName: 'Symmetry and Tessellation',
    chapterNameNepali: 'सममिति र टेसलेसन',
    title: 'Point Symmetry and 180° Rotation Lab',
    titleNepali: 'बिन्दु सममिति र १८०° परिक्रमण प्रयोगशाला',
    description: 'Discover point symmetry by rotating shapes through 180° around centre O, prove equal distance and midpoint properties, and test English capital letters.',
    descriptionNepali: 'केन्द्रबिन्दु O वरिपरि १८०° घुमाएर बिन्दु सममिति पत्ता लगाउने, केन्द्रबाट बराबर दूरी प्रमाणित गर्ने र अंग्रेजी वर्णमालाका अक्षरहरू परीक्षण गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Define point symmetry through 180° rotation around a central point', 'Verify that the centre of symmetry bisects segments connecting corresponding points', 'Identify English letters and polygons having point symmetry'],
    learningObjectivesNepali: ['१८०° परिक्रमणबाट बिन्दु सममिति परिभाषित गर्ने', 'केन्द्रबिन्दुबाट विपरीत बिन्दुहरूको दूरी बराबर भएको प्रमाणित गर्ने', 'बिन्दु सममिति भएका अक्षर र आकृतिहरू पहिचान गर्ने'],
    tags: ['math', 'grade7', 'symmetry', 'point-symmetry', 'rotation', 'geometry'],
  },
  {
    code: 'SIM-MATH-G7-L18-03',
    key: 'class7-math-l18-tessellation-studio',
    chapterNumber: 18,
    chapterName: 'Symmetry and Tessellation',
    chapterNameNepali: 'सममिति र टेसलेसन',
    title: 'Tessellation Design Studio',
    titleNepali: 'टेसलेसन डिजाइन स्टुडियो',
    description: 'Create seamless patterns using geometric tiles without gaps or overlaps, build triangular tessellations, validate tiling, and examine authentic Nepali crafts.',
    descriptionNepali: 'कुनै खाली ठाउँ नछोडी र नखप्टिई टायलिङ गरी टेसलेसन बनाउने, त्रिकोणीय टेसलेसन निर्माण गर्ने र परम्परागत नेपाली नाङ्लो/डोकोका ढाँचाहरू अध्ययन गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Define tessellation as plane covering without gaps or overlaps', 'Construct triangular tessellations with equilateral and right-angled triangles', 'Identify real-life tessellation in traditional Nepali handicrafts (Nanglo, Doko, Carpets)'],
    learningObjectivesNepali: ['खाली ठाउँ र खप्टिन नहुने टेसलेसनको नियम बुझ्ने', 'समबाहु र समकोणी त्रिभुजबाट टेसलेसन रचना गर्ने', 'नेपाली परम्परागत नाङ्लो, डोको र पर्खालका टेसलेसन पहिचान गर्ने'],
    tags: ['math', 'grade7', 'tessellation', 'tiling', 'geometry', 'patterns', 'nepali-crafts'],
  },

  // ── LESSON 19: TRANSFORMATION ────────────────────────────────────────
  {
    code: 'SIM-MATH-G7-L19-01',
    key: 'class7-math-l19-reflection-lab',
    chapterNumber: 19,
    chapterName: 'Transformation',
    chapterNameNepali: 'रूपान्तरण',
    title: 'Reflection and Mirror Transformation Lab',
    titleNepali: 'परावर्तन र ऐना रूपान्तरण प्रयोगशाला',
    description: 'Learn reflection geometry on Cartesian coordinates: X-axis reflection (x, y) → (x, −y), Y-axis reflection (x, y) → (−x, y), and reflect polygons.',
    descriptionNepali: 'निर्देशाङ्क समतलमा X-अक्ष परावर्तन (x, y) → (x, −y) र Y-अक्ष परावर्तन (x, y) → (−x, y) का नियमहरू सिक्ने र त्रिभुजहरू परावर्तन गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Apply X-axis reflection rule: (x, y) → (x, −y)', 'Apply Y-axis reflection rule: (x, y) → (−x, y)', 'Reflect polygons vertex-by-vertex and prove congruence of image'],
    learningObjectivesNepali: ['X-अक्ष परावर्तन सूत्र प्रयोग गर्ने', 'Y-अक्ष परावर्तन सूत्र प्रयोग गर्ने', 'बहुभुजका शीर्षबिन्दुहरू परावर्तन गरी प्रतिबिम्ब रचना गर्ने'],
    tags: ['math', 'grade7', 'transformation', 'reflection', 'cartesian-plane', 'geometry'],
  },
  {
    code: 'SIM-MATH-G7-L19-02',
    key: 'class7-math-l19-translation-playground',
    chapterNumber: 19,
    chapterName: 'Transformation',
    chapterNameNepali: 'रूपान्तरण',
    title: 'Translation and Movement Playground',
    titleNepali: 'स्थानान्तरण र गति खेलमैदान',
    description: 'Explore geometric translation using direction and magnitude, translate points, line segments, and triangles, and observe real-life slide motions.',
    descriptionNepali: 'निश्चित दिशा र परिमाणमा बिन्दु, रेखाखण्ड र त्रिभुजहरूलाई स्थानान्तरण गर्ने र दैनिक जीवनका सिधा गतिको स्थानान्तरण अवलोकन गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Understand translation as rigid motion preserving size, shape, and orientation', 'Translate line segments parallel to displacement vectors', 'Translate polygons on a coordinate plane using (x + a, y + b)'],
    learningObjectivesNepali: ['समान दिशा र परिमाणमा वस्तु सार्ने स्थानान्तरण बुझ्ने', 'समानान्तर क्टर अनुसार रेखाखण्ड स्थानान्तरण गर्ने', 'निर्देशाङ्क समतलमा त्रिभुज स्थानान्तरण गर्ने'],
    tags: ['math', 'grade7', 'transformation', 'translation', 'vector', 'geometry'],
  },

  // ── LESSON 20: BEARING AND SCALE DRAWING ─────────────────────────────
  {
    code: 'SIM-MATH-G7-L20-01',
    key: 'class7-math-l20-compass-bearing',
    chapterNumber: 20,
    chapterName: 'Bearing and Scale Drawing',
    chapterNameNepali: 'दिगंश र मापन चित्र',
    title: 'Compass and Bearing Discovery Lab',
    titleNepali: 'दिशासूचक यन्त्र र दिगंश खोजी प्रयोगशाला',
    description: 'Master the 8 compass directions, the golden rule of bearing (clockwise from North), and three-figure notation with an interactive compass dial.',
    descriptionNepali: 'कम्पासका ८ मुख्य दिशाहरू, उत्तर दिशाबाट घडीको सुई अनुसार दिगंश नाप्ने नियम र तीन-अङ्के दिगंश संकेत सिक्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Identify 8 cardinal and intercardinal compass directions', 'Measure bearings clockwise starting from North (000°)', 'Record bearings using standard three-figure notation (e.g. 045°, 090°)'],
    learningObjectivesNepali: ['कम्पासका ८ दिशाहरू पहिचान गर्ने', 'उत्तरबाट घडीको सुईको दिशामा दिगंश नाप्ने', 'तीन अङ्कको दिगंश ढाँचामा लेख्ने'],
    tags: ['math', 'grade7', 'bearing', 'compass', 'navigation', 'directions'],
  },
  {
    code: 'SIM-MATH-G7-L20-02',
    key: 'class7-math-l20-map-bearing',
    chapterNumber: 20,
    chapterName: 'Bearing and Scale Drawing',
    chapterNameNepali: 'दिगंश र मापन चित्र',
    title: 'Map Reading and Bearing Explorer',
    titleNepali: 'नक्सा अध्ययन र दिगंश अन्वेषक',
    description: 'Read municipal maps to find bearings from base locations to destinations, and solve authentic Nepal landmark bearing challenges.',
    descriptionNepali: 'गाउँपालिका नक्सामा कुनै स्थानबाट अर्को स्थानको दिगंश नाप्ने र काठमाडौं-मनाङ, पोखरा-नेपालगञ्ज जस्ता नेपाली भूगोलको दिगंश चुनौती हल गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Draw North reference lines at origin points on maps', 'Calculate angular bearings between any two map landmarks', 'Solve geographical bearing problems using real Nepali city alignments'],
    learningObjectivesNepali: ['नक्साको सुरुवाती स्थानमा उत्तर रेखा खिच्ने', 'स्थानहरू बीचको दिगंश कोण नाप्ने', 'नेपालका प्रमुख शहरहरू बीचको दिगंश हिसाब गर्ने'],
    tags: ['math', 'grade7', 'bearing', 'map-reading', 'nepal-map', 'geography'],
  },
  {
    code: 'SIM-MATH-G7-L20-03',
    key: 'class7-math-l20-scale-drawing',
    chapterNumber: 20,
    chapterName: 'Bearing and Scale Drawing',
    chapterNameNepali: 'दिगंश र मापन चित्र',
    title: 'Scale Drawing and Measurement Lab',
    titleNepali: 'मापन चित्र र नाप प्रयोगशाला',
    description: 'Understand map-to-actual scale ratios, convert units, explore the official CDC volleyball court, ground, and room scale drawings.',
    descriptionNepali: 'नक्साको नाप र जमिनको वास्तविक नापको अनुपात (स्केल) बुझ्ने, भलिबल कोर्ट (१:२००), खेलमैदान र कोठाको मापन चित्र अध्ययन गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Define scale as drawing measurement : actual measurement', 'Convert scaled drawing dimensions to actual ground distances and vice versa', 'Construct and analyze scale drawings of volleyball courts, grounds, and rooms'],
    learningObjectivesNepali: ['स्केलको परिभाषा र अनुपात बुझ्ने', 'मापन चित्रको नापबाट वास्तविक दूरी र वास्तविकबाट चित्रको नाप निकाल्ने', 'भलिबल कोर्ट, खेलमैदान र कोठाको मापन चित्र विश्लेषण गर्ने'],
    tags: ['math', 'grade7', 'scale-drawing', 'measurement', 'ratio', 'volleyball-court'],
  },
  {
    code: 'SIM-MATH-G7-L20-04',
    key: 'class7-math-l20-field-project',
    chapterNumber: 20,
    chapterName: 'Bearing and Scale Drawing',
    chapterNameNepali: 'दिगंश र मापन चित्र',
    title: 'Bearing and Scale Drawing Field Project',
    titleNepali: 'दिगंश र मापन चित्र परियोजना कार्य',
    description: 'Complete the comprehensive capstone project: plan a school and 5-family settlement master plan to scale, compute actual ground distances, and calculate bearings.',
    descriptionNepali: 'पाठ्यपुस्तकको वृहत् परियोजना कार्य: विद्यालय र ५ परिवारको बस्ती योजनाको मापन चित्र बनाउने, वास्तविक दूरी र दिगंश हिसाब गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Synthesize compass bearing and scale drawing in practical community planning', 'Compute actual ground distances using chosen grid scales (1 cm = 5 m, 10 m)', 'Calculate bearings from central references to all community infrastructure'],
    learningObjectivesNepali: ['दिगंश र मापन चित्रलाई व्यावहारिक बस्ती योजनामा प्रयोग गर्ने', 'स्केल प्रयोग गरी पूर्वाधारहरूको वास्तविक दूरी हिसाब गर्ने', 'केन्द्रबाट सबै भवनहरूको तीन-अङ्के दिगंश निकाल्ने'],
    tags: ['math', 'grade7', 'field-project', 'scale-drawing', 'bearing', 'planning', 'capstone'],
  },
];

async function seedClass7MathL18L19L20() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB.');

    for (const simData of CLASS7_L18_L19_L20_SIMS) {
      const doc = {
        code: simData.code,
        title: simData.title,
        titleNepali: simData.titleNepali,
        description: simData.description,
        descriptionNepali: simData.descriptionNepali,
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [7],
        chapterNumber: simData.chapterNumber,
        chapterName: simData.chapterName,
        chapterNameNepali: simData.chapterNameNepali,
        simulationType: simData.simulationType,
        componentKey: simData.key,
        runtimeUrl: `/simulations/class7-math/${simData.key}`,
        learningObjectives: simData.learningObjectives,
        learningObjectivesNepali: simData.learningObjectivesNepali,
        tags: simData.tags,
        isPublished: true,
        currentVersion: '1.0.0',
      };

      const res = await Simulation.findOneAndUpdate({ code: simData.code }, doc, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });

      console.log(`[SEED] Upserted simulation: ${res.code} - ${res.title}`);
    }

    console.log(`\nSuccessfully seeded all ${CLASS7_L18_L19_L20_SIMS.length} simulations for Lessons 18, 19, and 20.`);
  } catch (error) {
    console.error('Error seeding Class 7 Math Lessons 18, 19, 20:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

seedClass7MathL18L19L20();

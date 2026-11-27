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

const CLASS7_L12_L13_L14_SIMS = [
  // ── LESSON 12: EQUATION, INEQUALITY AND GRAPH ─────────────────────────
  {
    code: 'SIM-MATH-G7-L12-01',
    key: 'class7-math-l12-linear-equation',
    chapterNumber: 12,
    chapterName: 'Equation, Inequality and Graph',
    chapterNameNepali: 'समीकरण, असमानता र ग्राफ',
    title: 'Linear Equation & Balance Scale Playground',
    titleNepali: 'समीकरण र सन्तुलन तराजु प्रयोगशाला',
    description: 'Master linear equations in one and two variables using interactive balance scales, table of values, and algebraic solutions.',
    descriptionNepali: 'सन्तुलन तराजु, मान तालिका र बीजगणितीय विधिको सहायताले एक र दुई चलयुक्त समीकरणहरू सिक्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Understand variables and algebraic equality on a balance scale', 'Solve one-variable linear equations step-by-step', 'Create and test solutions for two-variable linear equations (x + y = c)'],
    learningObjectivesNepali: ['तराजुमा चल र बीजगणितीय समानता बुझ्ने', 'एक चलयुक्त समीकरण चरणबद्ध रूपमा हल गर्ने', 'दुई चलयुक्त समीकरणका मानहरूको तालिका बनाउने र प्रमाणित गर्ने'],
    tags: ['math', 'grade7', 'equation', 'linear-equation', 'algebra', 'balance-scale'],
  },
  {
    code: 'SIM-MATH-G7-L12-02',
    key: 'class7-math-l12-inequality-line',
    chapterNumber: 12,
    chapterName: 'Equation, Inequality and Graph',
    chapterNameNepali: 'समीकरण, असमानता र ग्राफ',
    title: 'Inequality Number Line Adventure',
    titleNepali: 'असमानता र संख्या रेखा साहसिक खोजी',
    description: 'Explore algebraic inequalities (>, <, ≥, ≤) and plot open and closed ray intervals dynamically on the number line.',
    descriptionNepali: 'बीजगणितीय असमानता संकेतहरू (>, <, ≥, ≤) बुझ्ने र संख्या रेखामा खुला तथा बन्द बिन्दुसहित किरण रेखाचित्र खिच्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Understand inequality symbols (<, >, ≤, ≥)', 'Differentiate between open circles (strict inequality) and closed circles (inclusive inequality)', 'Solve basic linear inequalities and graph their solution sets'],
    learningObjectivesNepali: ['असमानताका चारै संकेतहरू बुझ्ने', 'खुला बिन्दु (मसिना) र बन्द बिन्दु (गाढा) बीचको फरक जान्ने', 'असमानता हल गरी संख्या रेखामा देखाउने'],
    tags: ['math', 'grade7', 'inequality', 'number-line', 'algebra', 'graph'],
  },
  {
    code: 'SIM-MATH-G7-L12-03',
    key: 'class7-math-l12-coordinate-graph',
    chapterNumber: 12,
    chapterName: 'Equation, Inequality and Graph',
    chapterNameNepali: 'समीकरण, असमानता र ग्राफ',
    title: 'Cartesian Coordinate & Graph Builder',
    titleNepali: 'निर्देशाङ्क र ग्राफ निर्माणशाला',
    description: 'Explore the Cartesian plane, plot ordered pairs (x, y) across 4 quadrants, identify geometric shapes formed by points, and plot linear equation lines.',
    descriptionNepali: 'कार्टेसियन समतलका ४ वटा चतुर्थांशहरू अन्वेषण गर्ने, क्रमजोडा (x, y) बिन्दुहरू खिच्ने, ज्यामितीय आकृति बनाउने र समीकरणको रेखा कोर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Identify origin, X-axis, Y-axis, and 4 quadrants with coordinate signs', 'Plot ordered pairs accurately on a Cartesian grid', 'Form shapes by connecting plotted vertices and graph linear relations'],
    learningObjectivesNepali: ['उत्पत्ति बिन्दु, X र Y अक्ष तथा ४ वटा चतुर्थांश पहिचान गर्ने', 'क्रमजोडा (x, y) बिन्दुहरू ग्राफमा खिच्ने', 'बिन्दुहरू जोडेर ज्यामितीय आकृतिहरू बनाउने'],
    tags: ['math', 'grade7', 'coordinate', 'graph', 'cartesian-plane', 'geometry'],
  },

  // ── LESSON 13: LINES AND ANGLES ──────────────────────────────────────
  {
    code: 'SIM-MATH-G7-L13-01',
    key: 'class7-math-l13-angle-construction',
    chapterNumber: 13,
    chapterName: 'Lines and Angles',
    chapterNameNepali: 'रेखाहरू र कोणहरू',
    title: 'Angle Construction Compass & Protractor Lab',
    titleNepali: 'कोण रचना कम्पास र प्रोटेक्टर प्रयोगशाला',
    description: 'Interactive geometrical construction of angles (60°, 120°, 90°, 30°, 45°, 75°, 105°) using compass and ruler with step-by-step playback.',
    descriptionNepali: 'कम्पास र रुलरको सहायताले ६०°, १२०°, ९०°, ३०°, ४५°, ७५° र १०५° का कोणहरू चरणबद्ध रूपमा रचना गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Construct 60° and 120° using compass arcs from base line', 'Bisect angles to construct 30°, 45°, and 90°', 'Verify constructed angles with an on-screen protractor'],
    learningObjectivesNepali: ['कम्पासबाट ६०° र १२०° का कोण रचना गर्ने', 'कोण समद्विभाजन गरी ३०°, ४५° र ९०° बनाउने', 'प्रोटेक्टरद्वारा नापेर शुद्धता प्रमाणित गर्ने'],
    tags: ['math', 'grade7', 'geometry', 'angles', 'construction', 'compass', 'protractor'],
  },
  {
    code: 'SIM-MATH-G7-L13-02',
    key: 'class7-math-l13-equal-angle-copy',
    chapterNumber: 13,
    chapterName: 'Lines and Angles',
    chapterNameNepali: 'रेखाहरू र कोणहरू',
    title: 'Equal Angle Construction and Copying Studio',
    titleNepali: 'बराबर कोण रचना स्टुडियो',
    description: 'Copy and construct an angle equal to a given angle using compass and ruler without a protractor, following the official CDC textbook method.',
    descriptionNepali: 'पाठ्यपुस्तकको विधि अनुसार प्रोटेक्टर प्रयोग नगरी कम्पास र रुलरको सहायताले दिइएको कोणसँग बराबर हुने कोण रचना गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Understand the geometric principle of copying an angle using equal radius arcs', 'Execute step-by-step compass copying on a separate ray', 'Verify angle congruence with dynamic protractor verification'],
    learningObjectivesNepali: ['बराबर चाप खिचेर कोण प्रतिलिपि गर्ने ज्यामितीय सिद्धान्त बुझ्ने', 'कम्पासद्वारा चरणबद्ध रूपमा बराबर कोण रचना गर्ने', 'प्रोटेक्टरले नापेर दुवै कोण बराबर भएको सुनिश्चित गर्ने'],
    tags: ['math', 'grade7', 'geometry', 'angles', 'construction', 'equal-angles'],
  },
  {
    code: 'SIM-MATH-G7-L13-03',
    key: 'class7-math-l13-pairs-of-angles',
    chapterNumber: 13,
    chapterName: 'Lines and Angles',
    chapterNameNepali: 'रेखाहरू र कोणहरू',
    title: 'Pairs of Angles Explorer',
    titleNepali: 'सम्बन्धित कोणहरूको खोजी',
    description: 'Explore adjacent angles, vertically opposite angles, complementary angles (90°), and supplementary angles (180°) with live calculations.',
    descriptionNepali: 'सन्निकट कोण, शीर्षाभिमुख कोण, पूरक कोण (९०°) र परिपूरक कोण (१८०°) बीचको सम्बन्ध अन्वेषण गर्ने र अज्ञात कोण हल गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Define and recognize adjacent and vertically opposite angles', 'Calculate complements (90° - x) and supplements (180° - x)', 'Solve unknown angle challenges using geometric angle relationships'],
    learningObjectivesNepali: ['सन्निकट र शीर्षाभिमुख कोण पहिचान गर्ने', 'पूरक र परिपूरक कोणको नाप हिसाब गर्ने', 'ज्यामितीय नियमबाट अज्ञात कोण पत्ता लगाउने'],
    tags: ['math', 'grade7', 'geometry', 'pairs-of-angles', 'complementary', 'supplementary', 'vertically-opposite'],
  },
  {
    code: 'SIM-MATH-G7-L13-04',
    key: 'class7-math-l13-angle-experiment',
    chapterNumber: 13,
    chapterName: 'Lines and Angles',
    chapterNameNepali: 'रेखाहरू र कोणहरू',
    title: 'Angle Experiment Verification Lab',
    titleNepali: 'कोणको प्रयोगात्मक परीक्षण प्रयोगशाला',
    description: 'Conduct all 3 official CDC experimental verifications: vertically opposite angles equal, straight-line linear pair sum = 180°, and angles around a point sum = 360°.',
    descriptionNepali: 'पाठ्यपुस्तकका ३ वटै प्रयोगात्मक परीक्षणहरू: शीर्षाभिमुख कोण बराबर, ऋजु रेखामा सन्निकट कोण = १८०°, र बिन्दु वरिपरि = ३६०° तालिका भरी प्रमाणित गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Experimentally verify vertically opposite angles are equal', 'Verify adjacent angles on a straight line sum to 180°', 'Record observations in geometric verification tables and draw conclusions'],
    learningObjectivesNepali: ['शीर्षाभिमुख कोण बराबर हुने प्रयोगात्मक रूपमा प्रमाणित गर्ने', 'सीधा रेखाका कोणहरूको जोड १८०° हुने देखाउने', 'प्रयोगात्मक तालिका भरी निष्कर्ष निकाल्ने'],
    tags: ['math', 'grade7', 'geometry', 'experiments', 'verification', 'theorems'],
  },

  // ── LESSON 14: PLANE FIGURES ─────────────────────────────────────────
  {
    code: 'SIM-MATH-G7-L14-01',
    key: 'class7-math-l14-triangle-construction',
    chapterNumber: 14,
    chapterName: 'Plane Figures',
    chapterNameNepali: 'समतलीय आकृतिहरू',
    title: 'Triangle Construction Workshop',
    titleNepali: 'त्रिभुज रचना कार्यशाला',
    description: 'Step-by-step compass and ruler construction for all 4 CDC triangle cases: SAS (two sides & included angle), ASA, SSS (three sides), and AAS.',
    descriptionNepali: 'पाठ्यपुस्तकका ४ वटै त्रिभुज रचना विधिहरू (SAS, ASA, SSS, AAS) कम्पास र रुलरको सहायताले चरणबद्ध रूपमा अभ्यास गर्ने कार्यशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Construct triangles when two sides and included angle are given (SAS)', 'Construct triangles with three sides given (SSS) using intersecting arcs', 'Construct triangles given one side and two angles (ASA/AAS)'],
    learningObjectivesNepali: ['दुई भुजा र बीचको कोण दिँदा त्रिभुज रचना गर्ने', 'तीन भुजा दिँदा कम्पास चापबाट त्रिभुज बनाउने', 'एक भुजा र दुई कोण दिइएको अवस्थामा रचना गर्ने'],
    tags: ['math', 'grade7', 'geometry', 'triangles', 'construction', 'sas', 'sss', 'asa'],
  },
  {
    code: 'SIM-MATH-G7-L14-02',
    key: 'class7-math-l14-quad-properties',
    chapterNumber: 14,
    chapterName: 'Plane Figures',
    chapterNameNepali: 'समतलीय आकृतिहरू',
    title: 'Quadrilateral Properties Lab',
    titleNepali: 'चतुर्भुजका गुणहरूको प्रयोगशाला',
    description: 'Examine sides, angles, and diagonal behaviors of parallelograms, rectangles, squares, and rhombuses with interactive property comparisons.',
    descriptionNepali: 'समान्तर चतुर्भुज, आयत, वर्ग र समबाहु चतुर्भुजका भुजा, कोण र विकर्णका गुणहरू प्रत्यक्ष तुलना तथा परीक्षण गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Identify properties of opposite sides and angles in a parallelogram', 'Compare diagonal characteristics (equality, bisection, 90° intersection) across quadrilaterals', 'Differentiate between rectangle, square, and rhombus'],
    learningObjectivesNepali: ['समान्तर चतुर्भुजका सम्मुख भुजा र कोणका गुण जान्ने', 'विकर्णका गुणहरू (बराबर हुने, ९०° मा समद्विभाजन हुने) तुलना गर्ने', 'आयत, वर्ग र समबाहु चतुर्भुजको फरक बुझ्ने'],
    tags: ['math', 'grade7', 'geometry', 'quadrilaterals', 'parallelogram', 'rectangle', 'square', 'rhombus'],
  },
  {
    code: 'SIM-MATH-G7-L14-03',
    key: 'class7-math-l14-pythagoras-theorem',
    chapterNumber: 14,
    chapterName: 'Plane Figures',
    chapterNameNepali: 'समतलीय आकृतिहरू',
    title: 'Pythagoras Discovery Lab',
    titleNepali: 'पाइथागोरस साध्य प्रयोगशाला',
    description: 'Discover Pythagoras theorem (h² = p² + b²) through geometric 3-square area models, solve for unknown sides, and test Pythagorean triplets.',
    descriptionNepali: 'तीन वर्गहरूको क्षेत्रफल मोडेलबाट पाइथागोरस साध्य (h² = p² + b²) बुझ्ने, अज्ञात भुजा निकाल्ने र त्रिकहरू परीक्षण गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Understand the geometric meaning of h² = p² + b² using square area representations', 'Calculate unknown hypotenuse, perpendicular, or base in right triangles', 'Verify whether three numbers form a Pythagorean triplet'],
    learningObjectivesNepali: ['वर्गहरूको क्षेत्रफलबाट पाइथागोरस साध्य बुझ्ने', 'समकोणी त्रिभुजको अज्ञात भुजा हिसाब गर्ने', 'पाइथागोरस त्रिक परीक्षण गर्ने'],
    tags: ['math', 'grade7', 'geometry', 'pythagoras', 'right-triangle', 'triplets'],
  },
  {
    code: 'SIM-MATH-G7-L14-04',
    key: 'class7-math-l14-plane-figures-challenge',
    chapterNumber: 14,
    chapterName: 'Plane Figures',
    chapterNameNepali: 'समतलीय आकृतिहरू',
    title: 'Plane Figures Discovery Challenge',
    titleNepali: 'समतलीय आकृतिहरूको खोज तथा चुनौती',
    description: 'Comprehensive plane figures challenge covering triangle classification, quadrilateral angle sums, and real-life Nepali geometric shapes.',
    descriptionNepali: 'त्रिभुजको वर्गीकरण, चतुर्भुजको कोण योग (३६०°), र नेपाली व्यावहारिक वस्तुहरूको समतलीय आकृति पहिचान गर्ने बृहत् चुनौती।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Classify triangles by sides and angles', 'Apply quadrilateral and triangle angle sum theorems to solve puzzles', 'Identify real-world 2D geometric shapes in Nepali everyday contexts'],
    learningObjectivesNepali: ['त्रिभुजहरूको वर्गीकरण गर्ने', 'त्रिभुज (१८०°) र चतुर्भुज (३६०°) का कोण योग हिसाब गर्ने', 'दैनिक जीवनका वस्तुहरूको ज्यामितीय आकृति पहिचान गर्ने'],
    tags: ['math', 'grade7', 'geometry', 'plane-figures', 'challenge', 'real-life'],
  },
];

async function seedClass7MathL12L13L14() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB.');

    for (const simData of CLASS7_L12_L13_L14_SIMS) {
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

    console.log(`\nSuccessfully seeded all ${CLASS7_L12_L13_L14_SIMS.length} simulations for Lessons 12, 13, and 14.`);
  } catch (error) {
    console.error('Error seeding Class 7 Math Lessons 12, 13, 14:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
  }
}

seedClass7MathL12L13L14();

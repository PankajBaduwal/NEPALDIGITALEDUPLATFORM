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

const CLASS9_U13_U14_U15_SIMS = [
  // ── UNIT 13: TRIANGLE (त्रिभुज) ──────────────────────────────────────────
  {
    code: 'SIM-MATH-G9-U13-01',
    key: 'class9-math-u13-triangle-explorer-properties',
    chapterNumber: 13,
    chapterName: 'Triangle',
    chapterNameNepali: 'त्रिभुज',
    title: 'Triangle Explorer: Properties & Classification',
    titleNepali: 'त्रिभुज अन्वेषक: गुण र वर्गीकरण',
    description: 'Explore triangle classifications by sides (equilateral, isosceles, scalene) and angles (acute, right, obtuse) with movable vertices, angle sum 180°, exterior angle property, and triangle inequality.',
    descriptionNepali: 'शीर्षबिन्दुहरू तानेर भुजा र कोणका आधारमा त्रिभुजको वर्गीकरण, तीन भित्री कोणको योगफल १८०°, बाहिरी कोण सम्बन्ध र त्रिभुज असमानता नियमको प्रत्यक्ष अन्वेषण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Classify triangles dynamically based on side lengths and angle measures',
      'Verify the interior angle sum property (180°) and exterior angle theorem',
      'Test the triangle inequality theorem: sum of two sides exceeds the third',
    ],
    learningObjectivesNepali: [
      'भुजाको लम्बाइ र कोणको नापका आधारमा त्रिभुजहरूको गतिशील वर्गीकरण गर्ने',
      'भित्री कोणको योगफल १८०° र बाहिरी कोण साध्य प्रमाणित गर्ने',
      'त्रिभुज असमानता नियम: दुई भुजाको योग तेस्रो भन्दा ठूलो हुने गुण परीक्षण गर्ने',
    ],
    tags: ['Triangle', 'Geometry', 'Classification', 'Angles', 'Grade 9'],
  },
  {
    code: 'SIM-MATH-G9-U13-02',
    key: 'class9-math-u13-similar-triangle-lab',
    chapterNumber: 13,
    chapterName: 'Triangle',
    chapterNameNepali: 'त्रिभुज',
    title: 'Similar Triangle Laboratory',
    titleNepali: 'समरूप त्रिभुज प्रयोगशाला',
    description: 'Discover similarity of triangles, proportional corresponding sides, Thales basic proportionality theorem with parallel lines, and practical tree height shadow calculations.',
    descriptionNepali: 'समरूप त्रिभुज, अनुरुप भुजाहरूको समानुपातिकता, थाल्सको आधारभूत समानुपातिकता साध्य र छायाँबाट रुखको उचाइ निकाल्ने व्यावहारिक प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand similar triangles through equal angles and proportional sides',
      'Demonstrate Thales basic proportionality theorem using parallel transversal lines',
      'Apply similar triangle ratios to determine heights of trees and structures via shadows',
    ],
    learningObjectivesNepali: [
      'अनुरुप कोण बराबर र भुजाहरू समानुपातिक हुने समरूपताको नियम बुझ्ने',
      'समानान्तर रेखाले भुजाहरूलाई समान अनुपातमा बाँड्ने थाल्सको साध्य प्रदर्शन गर्ने',
      'छायाँ र समरूप त्रिभुजको प्रयोग गरी रुख तथा खम्बाको उचाइ गणना गर्ने',
    ],
    tags: ['Similar Triangles', 'Proportionality', 'Thales Theorem', 'Shadow Height', 'Grade 9'],
  },
  {
    code: 'SIM-MATH-G9-U13-03',
    key: 'class9-math-u13-triangle-theorems-solver',
    chapterNumber: 13,
    chapterName: 'Triangle',
    chapterNameNepali: 'त्रिभुज',
    title: 'Triangle Theorem and Problem-Solving Laboratory',
    titleNepali: 'त्रिभुज साध्य तथा समस्या समाधान प्रयोगशाला',
    description: 'Investigate key triangle theorems with interactive two-column proofs (base angles of isosceles triangles, side opposite greater angle) and solve numerical angle problems.',
    descriptionNepali: 'समद्विबाहु त्रिभुजका आधार कोणहरू र ठूलो कोणको सम्मुख भुजा सम्बन्धी साध्यहरूको दुई-स्तम्भीय प्रमाण र संख्यात्मक कोण समस्या समाधान प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Complete two-column formal geometric proofs using congruence conditions',
      'Understand the relationship between unequal angles and opposite sides',
      'Solve textbook numerical problems involving isosceles and exterior angles',
    ],
    learningObjectivesNepali: [
      'अनुरुपता सर्तहरू प्रयोग गरी दुई-स्तम्भीय औपचारिक ज्यामितीय प्रमाण पूरा गर्ने',
      'असमान कोण र तिनीहरूका सम्मुख भुजा बीचको सम्बन्ध बुझ्ने',
      'समद्विबाहु र बाहिरी कोण सम्बन्धी पाठ्यपुस्तकका संख्यात्मक समस्या हल गर्ने',
    ],
    tags: ['Theorems', 'Proof', 'Isosceles', 'Angle Calculations', 'Grade 9'],
  },

  // ── UNIT 14: QUADRILATERAL (चतुर्भुज) ────────────────────────────────────
  {
    code: 'SIM-MATH-G9-U14-01',
    key: 'class9-math-u14-quadrilateral-types-properties',
    chapterNumber: 14,
    chapterName: 'Quadrilateral',
    chapterNameNepali: 'चतुर्भुज',
    title: 'Quadrilateral Explorer: Types & Properties',
    titleNepali: 'चतुर्भुज अन्वेषक: प्रकार र विशेषताहरू',
    description: 'Explore the hierarchy of quadrilaterals (parallelogram, rectangle, rhombus, square, trapezium) with movable vertices, parallel side indicators, diagonal intersections, and angle sum 360°.',
    descriptionNepali: 'शीर्षबिन्दुहरू सारेर समानान्तर चतुर्भुज, आयत, रोम्बस, वर्ग र समलम्ब चतुर्भुजको स्वचालित पहिचान, विकर्णहरूको अन्तरक्रिया र कोण योगफल ३६०° को अन्वेषक।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Differentiate types of quadrilaterals by their defining side and angle properties',
      'Investigate diagonal lengths and intersections across rectangles, squares, and rhombuses',
      'Verify the interior angle sum property of all quadrilaterals (360°)',
    ],
    learningObjectivesNepali: [
      'भुजा र कोणका विशेषताका आधारमा विभिन्न प्रकारका चतुर्भुजहरू पहिचान गर्ने',
      'आयत, वर्ग र रोम्बसका विकर्णहरूको लम्बाइ र प्रतिच्छेदन सम्बन्ध जाँच्ने',
      'सबै चतुर्भुजका चार भित्री कोणहरूको योगफल ३६०° हुने तथ्य प्रमाणित गर्ने',
    ],
    tags: ['Quadrilateral', 'Parallelogram', 'Rectangle', 'Square', 'Rhombus', 'Trapezium', 'Grade 9'],
  },
  {
    code: 'SIM-MATH-G9-U14-02',
    key: 'class9-math-u14-parallelogram-verification-lab',
    chapterNumber: 14,
    chapterName: 'Quadrilateral',
    chapterNameNepali: 'चतुर्भुज',
    title: 'Parallelogram Properties Verification Laboratory',
    titleNepali: 'समानान्तर चतुर्भुजका गुणहरूको प्रमाणीकरण प्रयोगशाला',
    description: 'Rigorous interactive laboratory verifying the core theorems of parallelograms: opposite sides equal, opposite angles equal, adjacent angles supplementary, and diagonal bisection.',
    descriptionNepali: 'समानान्तर चतुर्भुजका प्रमुख साध्यहरू: सम्मुख भुजा बराबर, सम्मुख कोण बराबर, आसन्न कोण संपूरक र विकर्णहरूको परस्पर समद्विभाजनको अन्तरक्रियात्मक प्रमाणीकरण प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Verify that opposite sides and opposite angles of a parallelogram are equal',
      'Demonstrate that adjacent angles are supplementary (sum = 180°)',
      'Prove and verify numerically that diagonals bisect each other (AO = OC, BO = OD)',
    ],
    learningObjectivesNepali: [
      'समानान्तर चतुर्भुजका सम्मुख भुजाहरू र सम्मुख कोणहरू बराबर हुन्छन् भनी प्रमाणित गर्ने',
      'आसन्न कोणहरू संपूरक (योगफल १८०°) हुन्छन् भनी देखाउने',
      'विकर्णहरू परस्पर समद्विभाजित हुन्छन् (AO = OC, BO = OD) भनी साध्य र नापबाट पुष्टि गर्ने',
    ],
    tags: ['Parallelogram', 'Diagonals', 'Bisection', 'Opposite Angles', 'Grade 9'],
  },
  {
    code: 'SIM-MATH-G9-U14-03',
    key: 'class9-math-u14-quadrilateral-angle-challenge',
    chapterNumber: 14,
    chapterName: 'Quadrilateral',
    chapterNameNepali: 'चतुर्भुज',
    title: 'Quadrilateral Angle and Property Challenge',
    titleNepali: 'चतुर्भुज कोण तथा विशेषता चुनौती',
    description: 'Solve quadrilateral angle challenges across basic, intermediate, and challenge levels including four angles ratio, algebraic opposite angles, and consecutive interior angles.',
    descriptionNepali: 'आधारभूत, मध्यम र चुनौतीपूर्ण गरी ३ तहमा चतुर्भुजका कोण पत्ता लगाउने, बीजीय सम्मुख कोण र अनुपातमा आधारित समस्या समाधान चुनौती।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate missing angles in quadrilaterals using the 360° angle sum property',
      'Solve linear algebraic equations for opposite angles of parallelograms',
      'Determine angle values when given in ratio forms (e.g. 2:3:4:6)',
    ],
    learningObjectivesNepali: [
      '३६०° कोण योगफल नियम प्रयोग गरी चतुर्भुजका अज्ञात कोणहरू पत्ता लगाउने',
      'समानान्तर चतुर्भुजका सम्मुख कोणहरूका बीजीय समीकरण समाधान गर्ने',
      'अनुपातमा दिइएका कोणहरू (जस्तै २:३:४:६) को संख्यात्मक मान निकाल्ने',
    ],
    tags: ['Angle Challenge', 'Quadrilateral', 'Algebra', 'Ratios', 'Grade 9'],
  },

  // ── UNIT 15: CONSTRUCTION (रचना) ─────────────────────────────────────────
  {
    code: 'SIM-MATH-G9-U15-01',
    key: 'class9-math-u15-scalene-quadrilateral-construction-lab',
    chapterNumber: 15,
    chapterName: 'Construction',
    chapterNameNepali: 'रचना',
    title: 'Scalene Quadrilateral Construction Laboratory',
    titleNepali: 'विषमबाहु चतुर्भुज रचना प्रयोगशाला',
    description: 'Step-by-step virtual geometry board using ruler and compass to construct scalene quadrilaterals when 4 sides and 1 diagonal or 3 sides and 2 angles are given.',
    descriptionNepali: 'रुलर र कम्पासको सहायताले ४ भुजा र १ विकर्ण वा ३ भुजा र २ कोण दिइएको अवस्थामा विषमबाहु चतुर्भुजको चरणबद्ध ज्यामितीय रचना प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Construct base segments of precise lengths using a virtual ruler',
      'Draw compass arcs of required radii to locate diagonal and vertex intersections',
      'Assemble complete scalene quadrilaterals meeting all specified textbook criteria',
    ],
    learningObjectivesNepali: [
      'भर्चुअल रुलर प्रयोग गरी तोकिएको लम्बाइको आधार रेखाखण्ड खिच्ने',
      'विकर्ण र शीर्षबिन्दु पत्ता लगाउन निश्चित अर्धव्यासका कम्पास चापहरू खिच्ने',
      'पाठ्यपुस्तकका मापदण्ड अनुसार पूर्ण विषमबाहु चतुर्भुजको रचना सम्पन्न गर्ने',
    ],
    tags: ['Construction', 'Ruler', 'Compass', 'Arcs', 'Quadrilateral', 'Grade 9'],
  },
  {
    code: 'SIM-MATH-G9-U15-02',
    key: 'class9-math-u15-trapezium-construction-lab',
    chapterNumber: 15,
    chapterName: 'Construction',
    chapterNameNepali: 'रचना',
    title: 'Trapezium Construction Laboratory',
    titleNepali: 'समलम्ब चतुर्भुज रचना प्रयोगशाला',
    description: 'Master geometric construction of trapeziums with given sides, angles, and parallel conditions (e.g. AB = 8cm, BC = 6cm, CD = 4cm, ∠B = 60°, AB // CD) using ruler, protractor, and compass.',
    descriptionNepali: 'रुलर, कम्पास र प्रोटेक्टर प्रयोग गरी ३ भुजा, १ कोण र समानान्तर रेखा दिइएको अवस्थामा समलम्ब चतुर्भुजको शुद्ध ज्यामितीय रचना प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Construct specific angles (60°, 75°) using virtual compass and protractor',
      'Construct a line parallel to a base through a given vertex using alternate angles',
      'Verify completed trapezium dimensions against initial constraints',
    ],
    learningObjectivesNepali: [
      'भर्चुअल कम्पास र प्रोटेक्टरद्वारा निश्चित कोणहरू (६०°, ७५°) रचना गर्ने',
      'एकान्तर कोण विधिद्वारा दिएको बिन्दुबाट समानान्तर रेखा खिच्ने',
      'रचना सम्पन्न भएपछि समलम्ब चतुर्भुजका नाप र समानान्तरता प्रमाणीकरण गर्ने',
    ],
    tags: ['Trapezium', 'Construction', 'Parallel Lines', 'Protractor', 'Grade 9'],
  },
  {
    code: 'SIM-MATH-G9-U15-03',
    key: 'class9-math-u15-geometry-construction-challenge',
    chapterNumber: 15,
    chapterName: 'Construction',
    chapterNameNepali: 'रचना',
    title: 'Complete Geometrical Construction Challenge',
    titleNepali: 'पूर्ण ज्यामितीय रचना चुनौती',
    description: 'Solve comprehensive construction tasks independently with virtual instruments, progressive sequence validation, accuracy assessment, and interactive hint guidance.',
    descriptionNepali: 'भर्चुअल ज्यामितीय उपकरणहरू प्रयोग गरी पाठ्यपुस्तकका विभिन्न रचना चुनौतीहरू स्वतन्त्र रूपमा पूरा गर्ने र शुद्धता प्राप्ताङ्क प्राप्त गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Independently determine the correct sequence of steps for complex quadrilateral constructions',
      'Use virtual geometric tools (ruler, compass, pencil) with high spatial accuracy',
      'Verify satisfaction of all geometrical conditions and achieve 100% completion scores',
    ],
    learningObjectivesNepali: [
      'जटिल चतुर्भुज रचनाका लागि आवश्यक चरणहरूको सही क्रम आफैँ निर्धारण गर्ने',
      'भर्चुअल ज्यामितीय उपकरणहरू उच्च शुद्धताका साथ प्रयोग गर्ने',
      'सबै ज्यामितीय सर्तहरू पूरा गरी १००% शुद्धता प्राप्ताङ्क हासिल गर्ने',
    ],
    tags: ['Construction Challenge', 'Assessment', 'Geometric Tools', 'Grade 9'],
  },
];

async function seedClass9MathU13U14U15() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    for (const sim of CLASS9_U13_U14_U15_SIMS) {
      const doc = {
        code: sim.code,
        title: sim.title,
        titleNepali: sim.titleNepali,
        description: sim.description,
        descriptionNepali: sim.descriptionNepali,
        subjectCode: 'MATH-G9',
        subjectName: 'Compulsory Mathematics',
        gradeLevels: [9],
        chapterNumber: sim.chapterNumber,
        chapterName: sim.chapterName,
        chapterNameNepali: sim.chapterNameNepali,
        simulationType: sim.simulationType,
        componentKey: sim.key,
        runtimeUrl: `/simulations/class9-math/${sim.key}`,
        difficulty: 'INTERMEDIATE',
        estimatedDurationMinutes: 15,
        learningObjectives: sim.learningObjectives,
        learningObjectivesNepali: sim.learningObjectivesNepali,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: sim.tags,
      };

      await Simulation.findOneAndUpdate(
        { code: sim.code },
        { $set: doc },
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`Upserted simulation: [${sim.code}] ${sim.title} (${sim.key})`);
    }

    const totalCount = await Simulation.countDocuments({ subjectCode: 'MATH-G9' });
    console.log(`\nTotal Grade 9 Mathematics simulations now in DB: ${totalCount}`);

    await mongoose.disconnect();
    console.log('Database connection closed.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedClass9MathU13U14U15();

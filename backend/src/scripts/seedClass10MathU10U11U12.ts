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

const CLASS10_MATH_SIMS = [
  // ── UNIT 10: TRIANGLE AND QUADRILATERALS (त्रिभुज र चतुर्भुजहरू) ──────────
  {
    code: 'SIM-MATH-G10-U10-01',
    key: 'class10-math-u10-equal-area-geometry',
    chapterNumber: 10,
    chapterName: 'Triangle and Quadrilaterals',
    chapterNameNepali: 'त्रिभुज र चतुर्भुजहरू',
    title: 'Equal-Area Geometry Explorer',
    titleNepali: 'समान क्षेत्रफल ज्यामिति अन्वेषक',
    description: 'Explore equal-area geometric theorems dynamically: prove that parallelograms on the same base and between the same parallels are equal in area, verify that a triangle standing on the same base has half the area of the parallelogram, investigate equal-area triangles, median area division, and follow interactive step-by-step formal proofs with statements and reasons.',
    descriptionNepali: 'समान क्षेत्रफलका ज्यामितीय साध्यहरूको प्रत्यक्ष अन्वेषण: एउटै आधार र उही समानान्तर रेखाहरू बीचका समानान्तर चतुर्भुजहरूको क्षेत्रफल बराबर हुने, त्रिभुजको क्षेत्रफल स.च. को आधा हुने, समान त्रिभुजहरू, मध्यिकाले त्रिभुजलाई आधा गर्ने र तथ्य-कारण सहितको सैद्धान्तिक प्रमाण प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand the relationship between base, perpendicular height, and area of parallelograms and triangles',
      'Verify Theorem 1: Parallelograms on the same base and between the same parallels are equal in area (Area = b × h)',
      'Verify Theorem 2: The area of a triangle is half the area of a parallelogram on the same base and between the same parallels',
      'Verify Theorem 3: Triangles on the same base and between the same parallels are equal in area',
      'Demonstrate that a median bisects a triangle into two sub-triangles of equal area',
      'Follow and complete formal geometric proofs with statements (तथ्य) and reasons (कारण)',
    ],
    learningObjectivesNepali: [
      'समानान्तर चतुर्भुज र त्रिभुजको आधार, लम्ब उचाइ र क्षेत्रफल बीचको सम्बन्ध बुझ्न',
      'साध्य १: एउटै आधार र उही समानान्तर रेखाहरू बीचका समानान्तर चतुर्भुजहरूको क्षेत्रफल बराबर हुने तथ्य प्रमाणित गर्न',
      'साध्य २: एउटै आधार र उही समानान्तर रेखाहरू बीच बनेको त्रिभुजको क्षेत्रफल समानान्तर चतुर्भुजको क्षेत्रफलको आधा हुने प्रमाणित गर्न',
      'साध्य ३: एउटै आधार र उही समानान्तर रेखाहरू बीचका त्रिभुजहरू क्षेत्रफलमा बराबर हुने देखाउन',
      'त्रिभुजको मध्यिकाले त्रिभुजलाई दुई बराबर क्षेत्रफल भएका त्रिभुजहरूमा विभाजन गर्ने तथ्य बुझ्न',
      'पाठ्यपुस्तक ढाँचामा तथ्य र कारण सहितका सैद्धान्तिक प्रमाणहरू चरणबद्ध रूपमा अनुसरण गर्न',
    ],
    tags: ['math-g10', 'grade10', 'equal-area', 'parallelograms', 'triangles', 'theorems', 'formal-proof', 'median-division'],
  },

  // ── UNIT 11: CONSTRUCTION (रचना) ──────────────────────────────────────────
  {
    code: 'SIM-MATH-G10-U11-01',
    key: 'class10-math-u11-construction-studio',
    chapterNumber: 11,
    chapterName: 'Construction',
    chapterNameNepali: 'रचना',
    title: 'Interactive Geometric Construction Studio',
    titleNepali: 'अन्तरक्रियात्मक ज्यामितीय रचना स्टुडियो',
    description: 'Authentic geometric construction studio with virtual compass arcs and ruler line extensions: construct equal-area parallelograms with specified new angles (120°) or side lengths, construct equal-area triangles along parallel lines, and transform a given quadrilateral into an equal-area triangle using diagonal-parallel extensions.',
    descriptionNepali: 'कम्पासको चाप र स्केलको प्रयोग सहितको ज्यामितीय रचना स्टुडियो: तोकिएको नयाँ कोण (१२०°) वा भुजा अनुसार बराबर क्षेत्रफल हुने समानान्तर चतुर्भुज, समान क्षेत्रफलको त्रिभुज, र कर्ण-समानान्तर विधिबाट चतुर्भुज बराबर क्षेत्रफल हुने त्रिभुजको चरणबद्ध रचना।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Master compass and ruler operations: constructing 60° and 120° angles and transferring side lengths with arcs',
      'Construct a parallelogram equal in area to a given parallelogram under specified angle or side conditions',
      'Construct a triangle equal in area to a given triangle using parallel boundary line extensions',
      'Transform a quadrilateral ABCD into an equal-area triangle ADE by drawing a line through vertex C parallel to diagonal BD',
      'Understand the geometric area conservation theorem behind each construction step',
    ],
    learningObjectivesNepali: [
      'कम्पास र स्केलका आधारभूत सीपहरू: ६०° र १२०° कोण बनाउने र चापको सहायताले नाप स्थानान्तरण गर्न सिक्न',
      'तोकिएको नयाँ कोण वा भुजाको नाप अनुसार दिइएको स.च. सँग बराबर क्षेत्रफल हुने नयाँ स.च. रचना गर्न',
      'समानान्तर रेखा विस्तार गरी दिइएको त्रिभुजसँग बराबर क्षेत्रफल हुने अर्को त्रिभुज रचना गर्न',
      'कर्ण BD सँग समानान्तर हुने रेखा खिचेर चतुर्भुज ABCD सँग बराबर क्षेत्रफल हुने त्रिभुज ADE रचना गर्न',
      'प्रत्येक रचना चरण पछाडिको समान क्षेत्रफल साध्यको सिद्धान्त बुझ्न',
    ],
    tags: ['math-g10', 'grade10', 'construction', 'geometric-tools', 'compass', 'equal-area-parallelogram', 'equal-area-triangle', 'quad-to-triangle'],
  },

  // ── UNIT 12: CIRCLE (वृत्त) ────────────────────────────────────────────────
  {
    code: 'SIM-MATH-G10-U12-01',
    key: 'class10-math-u12-circle-theorems',
    chapterNumber: 12,
    chapterName: 'Circle',
    chapterNameNepali: 'वृत्त',
    title: 'Circle Theorem Explorer',
    titleNepali: 'वृत्तका साध्यहरू अन्तरक्रियात्मक अन्वेषक',
    description: 'Explore fundamental circle theorems by manipulating points along the circumference: verify that central angle is twice the inscribed angle standing on the same arc (∠AOB = 2∠ACB), prove that the angle in a semicircle is a right angle (90°), verify equal inscribed angles in the same segment, and confirm that opposite angles of a cyclic quadrilateral are supplementary (180°).',
    descriptionNepali: 'परिधिका बिन्दुहरू सारेर वृत्तका चारवटै मुख्य साध्यहरूको प्रत्यक्ष परीक्षण: एउटै चापमा आधारित केन्द्रीय कोण परिधि कोणको दोब्बर हुने (∠AOB = २∠ACB), अर्धवृत्तको परिधि कोण समकोण (९०°) हुने, एउटै वृत्तखण्डका कोणहरू बराबर हुने, र चक्रीय चतुर्भुजका सम्मुख कोणहरूको योग १८०° हुने साध्य प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Differentiate between central angles (at centre O) and inscribed angles (on circumference)',
      'Verify Theorem 1: Central angle is twice the inscribed angle standing on the same arc (∠AOB = 2∠ACB)',
      'Verify Theorem 2: The angle in a semicircle subtended by a diameter is always a right angle (90°)',
      'Verify Theorem 3: Inscribed angles standing on the same arc in the same segment are strictly equal',
      'Verify Theorem 4: Opposite angles of a cyclic quadrilateral are supplementary (sum = 180°)',
      'Solve circle geometry problems involving unknown interior and exterior angle calculations',
    ],
    learningObjectivesNepali: [
      'केन्द्र O मा बन्ने केन्द्रीय कोण र परिधिमा बन्ने परिधि कोणको फरक पहिचान गर्न',
      'साध्य १: एउटै चापमा आधारित केन्द्रीय कोण परिधि कोणको दोब्बर हुने (∠AOB = २∠ACB) प्रमाणित गर्न',
      'साध्य २: व्यासले अर्धवृत्तको परिधिमा बनाउने कोण सधैँ एक समकोण (९०°) हुने देखाउन',
      'साध्य ३: एउटै वृत्तखण्डमा बनेका परिधि कोणहरू आपसमा बराबर हुने तथ्य जाँच्न',
      'साध्य ४: चक्रीय चतुर्भुजका सम्मुख कोणहरू परिपूरक (योगफल १८०°) हुने प्रमाणित गर्न',
      'अज्ञात कोणहरू पत्ता लगाउने परीक्षा स्तरका वृत्त सम्बन्धी ज्यामितीय समस्याहरू समाधान गर्न',
    ],
    tags: ['math-g10', 'grade10', 'circle', 'circle-theorems', 'central-angle', 'inscribed-angle', 'semicircle', 'same-segment', 'cyclic-quadrilateral'],
  },
];

async function seed() {
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  for (const s of CLASS10_MATH_SIMS) {
    const doc = {
      code: s.code,
      title: s.title,
      titleNepali: s.titleNepali,
      description: s.description,
      descriptionNepali: s.descriptionNepali,
      subjectCode: 'MATH-G10',
      subjectName: 'Grade 10 Compulsory Mathematics',
      gradeLevels: [10],
      chapterNumber: s.chapterNumber,
      chapterName: s.chapterName,
      chapterNameNepali: s.chapterNameNepali,
      simulationType: s.simulationType,
      componentKey: s.key,
      runtimeUrl: `/simulations/class10-math/${s.key}`,
      difficulty: 'INTERMEDIATE',
      estimatedDurationMinutes: 15,
      learningObjectives: s.learningObjectives,
      learningObjectivesNepali: s.learningObjectivesNepali,
      isPublished: true,
      currentVersion: '1.0.0',
      tags: s.tags,
    };

    await Simulation.findOneAndUpdate({ code: s.code }, { $set: doc }, { upsert: true, returnDocument: 'after' });
    console.log(`Upserted simulation: [${s.code}] ${s.title} (${s.key})`);
  }

  const count = await Simulation.countDocuments({ subjectCode: 'MATH-G10' });
  console.log(`\nTotal Grade 10 Mathematics simulations now in DB: ${count}`);

  await mongoose.connection.close();
  console.log('Database connection closed.');
}

seed().catch((err) => {
  console.error('Error seeding Grade 10 Mathematics simulations (Units 10-12):', err);
  process.exit(1);
});

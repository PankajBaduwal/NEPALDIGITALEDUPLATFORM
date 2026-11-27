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

const CLASS8_U14_U15_U16_SIMS = [
  // ── UNIT 14: PLANE FIGURES (समतलीय आकृतिहरू) ───────────────────────────
  {
    code: 'SIM-MATH-G8-U14-01',
    key: 'class8-math-u14-triangle-quadrilateral-discovery',
    chapterNumber: 14,
    chapterName: 'Plane Figures',
    chapterNameNepali: 'समतलीय आकृतिहरू',
    title: 'Triangle and Quadrilateral Discovery Lab',
    titleNepali: 'त्रिभुज र चतुर्भुज खोजी प्रयोगशाला',
    description: 'Experimentally verify triangle angle sum theorem (180°), equilateral triangle 60° angles, isosceles triangle equal base angles, right isosceles 45° base angles, and properties of rhombus, kite, and trapezium.',
    descriptionNepali: 'त्रिभुजका तीन कोणको जोड १८०°, समबाहु त्रिभुजको ६०°, समद्विबाहुको आधार कोण बराबर तथा समचतुर्भुज, पतङ्ग र समलम्ब चतुर्भुजका ज्यामितीय गुणहरूको प्रयोगात्मक प्रमाणीकरण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Verify that the sum of interior angles of any triangle is 180° by moving vertices and assembling straight angle cutouts',
      'Demonstrate that equilateral triangle angles are 60° and isosceles base angles are equal',
      'Explore defining geometric properties of rhombus, kite, and trapezium',
    ],
    learningObjectivesNepali: [
      'त्रिभुजको आकार परिवर्तन गरी तीनवटै भित्री कोणको जोड १८०° हुन्छ भनी प्रमाणित गर्न',
      'समबाहु त्रिभुजको प्रत्येक कोण ६०° र समद्विबाहु त्रिभुजका आधार कोण बराबर हुन्छन् भनी देखाउन',
      'समचतुर्भुज, पतङ्ग र समलम्ब चतुर्भुजका विकर्ण तथा कोणका गुणहरू पत्ता लगाउन',
    ],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    tags: ['geometry', 'plane figures', 'triangles', 'quadrilaterals', 'rhombus', 'kite', 'trapezium'],
  },
  {
    code: 'SIM-MATH-G8-U14-02',
    key: 'class8-math-u14-geometric-construction-studio',
    chapterNumber: 14,
    chapterName: 'Plane Figures',
    chapterNameNepali: 'समतलीय आकृतिहरू',
    title: 'Geometric Construction Studio',
    titleNepali: 'ज्यामितीय रचना स्टुडियो',
    description: 'Step-by-step construction of rectangles, squares, and parallelograms using digital ruler, compass arcs, and protractor angle transfer according to textbook construction steps.',
    descriptionNepali: 'स्केल, कम्पासका चाप (arcs) र चाँदाको सहायताले आयत, वर्ग तथा समानान्तर चतुर्भुज (भुजा-कोण, भुजा-विकर्ण) को चरणबद्ध ज्यामितीय रचना।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Construct a rectangle when two adjacent side lengths are given',
      'Construct a square when one side length is given using 90° compass rays',
      'Construct parallelograms given two adjacent sides and included angle or given sides and diagonal',
    ],
    learningObjectivesNepali: [
      'दुई आसन्न भुजा दिएको अवस्थामा आयतको रचना गर्न',
      'एउटा भुजा दिएको अवस्थामा कम्पासको ९०° चाप प्रयोग गरी वर्ग बनाउन',
      'दुई भुजा र बीचको कोण वा विकर्ण दिइएको अवस्थामा समानान्तर चतुर्भुजको रचना गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['geometry', 'geometric construction', 'ruler and compass', 'rectangle', 'square', 'parallelogram'],
  },
  {
    code: 'SIM-MATH-G8-U14-03',
    key: 'class8-math-u14-polygon-explorer',
    chapterNumber: 14,
    chapterName: 'Plane Figures',
    chapterNameNepali: 'समतलीय आकृतिहरू',
    title: 'Polygon Explorer and Angle Calculator',
    titleNepali: 'बहुभुज अन्वेषक र कोण क्यालकुलेटर',
    description: 'Explore regular and irregular polygons, derive interior angle sum formula (n-2)×180° through diagonal triangulation, calculate regular interior angles, and verify exterior angles sum to 360°.',
    descriptionNepali: 'नियमित बहुभुज, त्रिभुजीकरणबाट भित्री कोणको जोड सूत्र (n-२)×१८०° प्रतिपादन, प्रत्येक भित्री कोण गणना र बाह्य कोणको जोड ३६०° रहने प्रमाण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Derive the interior angle formula (n-2)×180° by triangulating polygons from a single vertex',
      'Calculate each interior angle of regular polygons: [(n-2)×180°] / n',
      'Verify that the sum of exterior angles of any convex polygon is 360° and each regular exterior angle is 360°/n',
    ],
    learningObjectivesNepali: [
      'एउटा शीर्षबिन्दुबाट विकर्ण खिचेर (n-२) वटा त्रिभुज बन्ने आधारमा भित्री कोणको सूत्र प्रतिपादन गर्न',
      'नियमित बहुभुजको प्रत्येक भित्री कोण निकाल्ने सूत्र प्रयोग गर्न',
      'बाह्य कोणहरूको जोड ३६०° हुन्छ भनी प्रमाणित गरी प्रत्येक बाह्य कोण निकाल्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['geometry', 'polygons', 'interior angles', 'exterior angles', 'triangulation', 'regular polygons'],
  },

  // ── UNIT 15: CONGRUENCY AND SIMILARITY (सर्वाङ्गसमता र समरूपता) ─────────
  {
    code: 'SIM-MATH-G8-U15-01',
    key: 'class8-math-u15-congruent-triangle-discovery',
    chapterNumber: 15,
    chapterName: 'Congruency and Similarity',
    chapterNameNepali: 'सर्वाङ्गसमता र समरूपता',
    title: 'Congruent Triangle Discovery Lab',
    titleNepali: 'सर्वाङ्गसम त्रिभुज खोजी प्रयोगशाला',
    description: 'Discover the meaning of congruent triangles (same shape and same size) through interactive translation, rotation, and exact overlay matching. Match corresponding angles, corresponding sides, and practice correct vertex notation.',
    descriptionNepali: 'एउटा त्रिभुजलाई घुमाएर र सारेर अर्कोमाथि हुबहु खप्ट्याउँदै सर्वाङ्गसमता (उही आकार र नाप), संगत कोण, संगत भुजा र सही शीर्षबिन्दु क्रम (△ABC ≅ △PQR) सिक्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand congruency as exact shape and size equivalence verified by superposition',
      'Identify and match corresponding angles and corresponding sides of congruent triangles',
      'Write accurate vertex-ordered congruency statements (△ABC ≅ △PQR)',
    ],
    learningObjectivesNepali: [
      'खप्ट्याएर हेर्दा हुबहु मिल्ने त्रिभुजहरू सर्वाङ्गसम हुन्छन् भनी बुझ्न',
      'सर्वाङ्गसम त्रिभुजका संगत कोण र संगत भुजाहरू छुट्याउन',
      'शीर्षबिन्दुहरूको सही क्रम मिलाएर सर्वाङ्गसमता संकेत लेख्न',
    ],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    tags: ['geometry', 'congruency', 'congruent triangles', 'corresponding sides', 'superposition'],
  },
  {
    code: 'SIM-MATH-G8-U15-02',
    key: 'class8-math-u15-triangle-congruency-test',
    chapterNumber: 15,
    chapterName: 'Congruency and Similarity',
    chapterNameNepali: 'सर्वाङ्गसमता र समरूपता',
    title: 'Triangle Congruency Test Lab',
    titleNepali: 'त्रिभुज सर्वाङ्गसमता परीक्षण प्रयोगशाला',
    description: 'Master and experimentally verify all five textbook conditions for triangle congruency: SAS, RHS, ASA, SSS, and AAS. Clarify why SSA is invalid as a general test.',
    descriptionNepali: 'पाठ्यपुस्तकका पाँचवटै सर्वाङ्गसमता तथ्यहरू: भु.को.भु. (SAS), स.क.भु. (RHS), को.भु.को. (ASA), भु.भु.भु. (SSS) र को.को.भु. (AAS) को प्रयोगात्मक अध्ययन र SSA अमान्य हुने कारण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Differentiate and apply SAS, RHS, ASA, SSS, and AAS congruency theorems',
      'Verify that SSA is not a sufficient general congruency test',
      'Identify the correct congruency condition from geometric diagram markings',
    ],
    learningObjectivesNepali: [
      'पाँचवटै सर्वाङ्गसमता तथ्यहरू (भु.को.भु., स.क.भु., को.भु.को., भु.भु.भु., को.को.भु.) पहिचान र प्रयोग गर्न',
      'SSA किन सामान्य त्रिभुजमा सर्वाङ्गसमता तथ्य हुन सक्दैन भनी स्पष्ट हुन',
      'चित्रमा दिइएका बराबर अङ्गहरूबाट सही सर्वाङ्गसमता तथ्य छनोट गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['geometry', 'congruency tests', 'SAS', 'RHS', 'ASA', 'SSS', 'AAS'],
  },
  {
    code: 'SIM-MATH-G8-U15-03',
    key: 'class8-math-u15-similar-figures-lab',
    chapterNumber: 15,
    chapterName: 'Congruency and Similarity',
    chapterNameNepali: 'सर्वाङ्गसमता र समरूपता',
    title: 'Similar Figures and Triangle Similarity Lab',
    titleNepali: 'समरूप आकृति र त्रिभुज समरूपता प्रयोगशाला',
    description: 'Explore similar figures (same shape, scaled sizes k), distinguish congruency from similarity, examine equal corresponding angles and proportional sides (AB/PQ = BC/QR = AC/PR), and solve for unknown side lengths.',
    descriptionNepali: 'समरूप आकृतिहरू (उही आकार, स्केल अनुपात k), सर्वाङ्गसम र समरूप बीचको तुलना, संगत भुजाहरूको समानुपात र अज्ञात भुजा पत्ता लगाउने विधि।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Define similarity: figures with the same shape but possibly different sizes',
      'Calculate scale factors and corresponding side proportions in similar triangles',
      'Set up linear proportions to solve for unknown side lengths in similar figures',
    ],
    learningObjectivesNepali: [
      'समरूपताको परिभाषा र सर्वाङ्गसमतासँग यसको भिन्नता बुझ्न',
      'समरूप त्रिभुजका संगत भुजाहरूको अनुपात (scale factor k) पत्ता लगाउन',
      'समानुपात समीकरण बनाएर अज्ञात भुजाको लम्बाइ हल गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['geometry', 'similarity', 'similar triangles', 'proportions', 'scale factor', 'enlargement'],
  },

  // ── UNIT 16: SOLID OBJECTS (ठोस वस्तुहरू) ─────────────────────────────
  {
    code: 'SIM-MATH-G8-U16-01',
    key: 'class8-math-u16-prism-pyramid-explorer',
    chapterNumber: 16,
    chapterName: 'Solid Objects',
    chapterNameNepali: 'ठोस वस्तुहरू',
    title: '3D Prism and Pyramid Explorer',
    titleNepali: '३D प्रिज्म र पिरामिड अन्वेषक',
    description: 'Genuine interactive 3D WebGL solid models: triangular prism, triangular pyramid (tetrahedron), square-based pyramid, and hexagonal pyramid. Orbit rotate, count faces, edges, vertices, and verify Euler’s formula F + V - E = 2.',
    descriptionNepali: 'अन्तरक्रियात्मक ३D ठोस मोडेलहरू: त्रिभुजाकार प्रिज्म, चतुष्फलक, वर्गाकार पिरामिड र षट्भुजाकार पिरामिड। घुमाएर पृष्ठ (F), किनारा (E), शीर्षबिन्दु (V) र युलर सूत्र (F+V-E=२) परीक्षण।',
    simulationType: 'WEB_GL',
    learningObjectives: [
      'Inspect 3D triangular prisms with two parallel congruent bases and three rectangular lateral faces',
      'Differentiate pyramids classified by their base shape (triangular, square, hexagonal)',
      'Count faces, edges, and vertices and verify Euler’s formula: F + V - E = 2',
    ],
    learningObjectivesNepali: [
      '२ वटा समानान्तर त्रिभुज आधार र ३ वटा आयत मिलेर बन्ने त्रिभुजाकार प्रिज्म बुझ्न',
      'आधारको आकार अनुसार पिरामिडको नामाकरण (त्रिकोणीय, वर्गाकार, षट्भुजाकार) छुट्याउन',
      'पृष्ठ, किनारा र शीर्षबिन्दु गन्ती गरी युलरको सूत्र (F + V - E = २) प्रमाणित गर्न',
    ],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    tags: ['3D solids', 'geometry', 'prism', 'pyramid', 'faces edges vertices', 'Euler formula'],
  },
  {
    code: 'SIM-MATH-G8-U16-02',
    key: 'class8-math-u16-net-builder-folding',
    chapterNumber: 16,
    chapterName: 'Solid Objects',
    chapterNameNepali: 'ठोस वस्तुहरू',
    title: '3D Solid Net Builder and Folding Lab',
    titleNepali: '३D ठोस वस्तु जालो र पट्याउने प्रयोगशाला',
    description: 'Dynamic 3D folding and unfolding laboratory for nets of cube, cuboid, tetrahedron, cone, and cylinder. Observe how 2D flat planar nets wrap and fold into 3D closed geometric solids.',
    descriptionNepali: 'घन, घनाभ, चतुष्फलक, शङ्कु र बेलनका २D जालोलाई पट्याएर ३D ठोस बनाउने र खोल्ने अन्तरक्रियात्मक प्रयोगशाला।',
    simulationType: 'WEB_GL',
    learningObjectives: [
      'Visualize 2D nets folding into 3D solids: cube (6 squares), cuboid (6 rectangles), and tetrahedron (4 triangles)',
      'Understand circular sector and base folding into a cone, and rectangle wrapping into a cylinder',
      'Recognize valid geometric nets and understand face adjacency relationships',
    ],
    learningObjectivesNepali: [
      '२D जालो पट्याउँदा ३D ठोस बन्ने प्रक्रिया (घन, घनाभ र चतुष्फलक) हेर्न',
      'शङ्कुमा वृत्त र वृत्तखण्ड तथा बेलनामा आयत र दुई वृत्तको जालो बुझ्न',
      'मान्य जालो र पृष्ठहरूको जोडाइ पहिचान गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['3D solids', 'geometry', 'nets of solids', 'folding animation', 'cube net', 'cylinder net'],
  },
  {
    code: 'SIM-MATH-G8-U16-03',
    key: 'class8-math-u16-solid-geometry-challenge',
    chapterNumber: 16,
    chapterName: 'Solid Objects',
    chapterNameNepali: 'ठोस वस्तुहरू',
    title: '3D Solid Geometry Challenge World',
    titleNepali: '३D ठोस ज्यामिति चुनौती संसार',
    description: 'Comprehensive 3D solid geometry mastery challenge: identifying solids, interactive face/edge/vertex counting verification, matching solids to real-world objects, and net recognition.',
    descriptionNepali: '३D ठोस वस्तुहरूको पहिचान, पृष्ठ र किनारा गणना चुनौती, दैनिक जीवनका वस्तुहरू (टेन्ट, इँटा, क्यान, टोपी, पासा) सँग मिलान र जालो परीक्षण।',
    simulationType: 'WEB_GL',
    learningObjectives: [
      'Identify 3D solids from interactive rotational views',
      'Calculate and enter feature counts (Faces, Edges, Vertices) with instant validation',
      'Connect abstract 3D geometrical models to physical real-world objects in daily life',
    ],
    learningObjectivesNepali: [
      '३D मोडेललाई घुमाएर ठोस वस्तुको नाम पहिचान गर्न',
      'पृष्ठ, किनारा र शीर्षबिन्दु गणना गरी उत्तर जाँच्न',
      'दैनिक जीवनका ठोस वस्तुहरूलाई ज्यामितीय मोडेलसँग तुलना गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['3D solids', 'geometry', 'real world math', 'challenge', 'solid identification'],
  },
];

async function seed() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    for (const sim of CLASS8_U14_U15_U16_SIMS) {
      const doc = {
        code: sim.code,
        title: sim.title,
        titleNepali: sim.titleNepali,
        description: sim.description,
        descriptionNepali: sim.descriptionNepali,
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [8],
        chapterNumber: sim.chapterNumber,
        chapterName: sim.chapterName,
        chapterNameNepali: sim.chapterNameNepali,
        simulationType: sim.simulationType,
        componentKey: sim.key,
        runtimeUrl: `/simulations/class8/math/${sim.key}`,
        difficulty: sim.difficulty,
        estimatedDurationMinutes: sim.estimatedDurationMinutes,
        learningObjectives: sim.learningObjectives,
        learningObjectivesNepali: sim.learningObjectivesNepali,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: sim.tags,
      };

      const res = await Simulation.findOneAndUpdate({ code: sim.code }, doc, {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
      });

      console.log(`[UPSERTED] ${res.code} - ${res.title} (${res.chapterNameNepali})`);
    }

    console.log('\nAll 9 Grade 8 Math (Units 14, 15, 16) simulations seeded successfully!');
  } catch (err) {
    console.error('Error seeding Grade 8 Units 14, 15, 16 simulations:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

seed();

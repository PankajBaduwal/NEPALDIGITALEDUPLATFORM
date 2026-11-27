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

const CLASS7_L15_L16_L17_SIMS = [
  // ── LESSON 15: CONGRUENT FIGURES (अनुरूप आकृतिहरू) ───────────────────
  {
    code: 'SIM-MATH-G7-L15-01',
    key: 'class7-math-l15-congruent-discovery',
    chapterNumber: 15,
    chapterName: 'Congruent Figures',
    chapterNameNepali: 'अनुरूप आकृतिहरू',
    title: 'Congruent Figure Discovery Lab',
    titleNepali: 'अनुरूप आकृति खोजी प्रयोगशाला',
    description: 'Explore congruent figures through real-world examples, shape and size comparisons, virtual tracing paper, and direct overlapping verification.',
    descriptionNepali: 'समान आकार र समान नाप भएका अनुरूप आकृतिहरू बुझ्ने, भर्चुअल ट्रेसिङ पेपर प्रयोग गरेर खप्ट्याई जाँच्ने र दैनिक जीवनका उदाहरणहरू अन्वेषण गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand that figures having both same shape and same size are congruent',
      'Verify congruence by overlapping one figure exactly onto another',
      'Observe that position, rotation and reflection do not change congruence',
    ],
    learningObjectivesNepali: [
      'समान आकार र समान नाप भएका आकृतिहरू अनुरूप हुन्छन् भनी बुझ्ने',
      'एउटा आकृतिलाई अर्कोमाथि खप्ट्याएर अनुरूपता प्रत्यक्ष जाँच्ने',
      'स्थान वा अभिमुखीकरण परिवर्तन भए पनि अनुरूपता परिवर्तन हुँदैन भनी प्रमाणित गर्ने',
    ],
    tags: ['math', 'grade7', 'geometry', 'congruence', 'overlapping', 'shapes'],
  },
  {
    code: 'SIM-MATH-G7-L15-02',
    key: 'class7-math-l15-congruence-measurement',
    chapterNumber: 15,
    chapterName: 'Congruent Figures',
    chapterNameNepali: 'अनुरूप आकृतिहरू',
    title: 'Congruence Measurement Studio',
    titleNepali: 'अनुरूपता नाप तथा चुनौती स्टुडियो',
    description: 'Identify corresponding vertices, corresponding sides, and corresponding angles in congruent triangles, verify congruence through precise measurement and solve pair matching challenges.',
    descriptionNepali: 'अनुरूप त्रिभुजका संगत शीर्षबिन्दु, संगत भुजा र संगत कोणहरू पहिचान गर्ने, नापेर अनुरूपता प्रमाणित गर्ने र जोडा मिलाउने चुनौती पूरा गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Identify corresponding vertices, sides and angles in congruent polygons',
      'Verify that corresponding sides and corresponding angles of congruent figures are equal',
      'Apply congruence notation correctly (e.g., △ABC ≅ △PQR)',
    ],
    learningObjectivesNepali: [
      'अनुरूप बहुभुजहरूका संगत शीर्षबिन्दु, भुजाहरू र कोणहरू पहिचान गर्ने',
      'अनुरूप आकृतिहरूका संगत भागहरू बराबर हुन्छन् भनी नापेर पुष्टि गर्ने',
      'अनुरूपताको गणितीय संकेत (≅) सही रूपमा प्रयोग गर्ने',
    ],
    tags: ['math', 'grade7', 'geometry', 'congruence', 'triangles', 'corresponding-parts'],
  },

  // ── LESSON 16: SOLID OBJECTS (ठोस वस्तुहरू) ──────────────────────────
  {
    code: 'SIM-MATH-G7-L16-01',
    key: 'class7-math-l16-solid-objects-3d',
    chapterNumber: 16,
    chapterName: 'Solid Objects',
    chapterNameNepali: 'ठोस वस्तुहरू',
    title: '3D Solid Object Explorer',
    titleNepali: '३D ठोस वस्तु अन्वेषक',
    description: 'Inspect 3D solid objects including cubes, cuboids, prisms, pyramids, cylinders, cones, and spheres with full 360-degree rotation, wireframe views, face, edge, and vertex counting.',
    descriptionNepali: 'घन, षड्मुखा, प्रिज्म, पिरामिड, बेलना, सोली र गोला जस्ता ठोस वस्तुहरूलाई ३D मा घुमाएर सतह, किनारा र शीर्षबिन्दुहरू गन्ने र अवलोकन गर्ने।',
    simulationType: 'WEB_GL',
    learningObjectives: [
      'Identify 3D solid geometric objects and differentiate polyhedra from curved solids',
      'Count faces (F), vertices (V), and edges (E) on 3D geometric models',
      'Examine cross-sections and real-world representations of 3D solids',
    ],
    learningObjectivesNepali: [
      '३D ठोस ज्यामितीय वस्तुहरू पहिचान गर्ने र बहुफलक तथा वक्र सतह भएका ठोस छुट्याउने',
      '३D मोडेलहरूमा सतह (F), शीर्षबिन्दु (V) र किनारा (E) गन्ने',
      'ठोस वस्तुहरूको बनावट र दैनिक जीवनका उदाहरणहरू अन्वेषण गर्ने',
    ],
    tags: ['math', 'grade7', 'geometry', 'solid-objects', '3D', 'faces-edges-vertices'],
  },
  {
    code: 'SIM-MATH-G7-L16-02',
    key: 'class7-math-l16-polyhedra-euler-3d',
    chapterNumber: 16,
    chapterName: 'Solid Objects',
    chapterNameNepali: 'ठोस वस्तुहरू',
    title: "Polyhedra and Euler's Relation",
    titleNepali: 'बहुफलक र यूलरको सम्बन्ध प्रयोगशाला',
    description: "Explore regular and irregular polyhedra, build skeleton models with vertices and edges, discover and verify Euler's formula F + V - E = 2.",
    descriptionNepali: "विभिन्न बहुफलकहरू (Polyhedra) अन्वेषण गर्ने, कंकाल ढाँचा (Skeleton model) निर्माण गर्ने र यूलरको सम्बन्ध F + V - E = २ प्रत्यक्ष प्रमाणित गर्ने।",
    simulationType: 'WEB_GL',
    learningObjectives: [
      'Understand the definition and structural characteristics of polyhedra',
      'Analyze the relationship between faces, vertices, and edges',
      "Verify Euler's formula F + V - E = 2 across various prisms and pyramids",
    ],
    learningObjectivesNepali: [
      'बहुफलकको परिभाषा र ज्यामितीय गुणहरू बुझ्ने',
      'सतह, शीर्षबिन्दु र किनारा बीचको गणितीय सम्बन्ध विश्लेषण गर्ने',
      'प्रिज्म र पिरामिडहरूमा यूलरको सूत्र F + V - E = २ प्रमाणित गर्ने',
    ],
    tags: ['math', 'grade7', 'geometry', 'polyhedra', 'eulers-formula', '3D'],
  },
  {
    code: 'SIM-MATH-G7-L16-03',
    key: 'class7-math-l16-cone-cylinder-3d',
    chapterNumber: 16,
    chapterName: 'Solid Objects',
    chapterNameNepali: 'ठोस वस्तुहरू',
    title: 'Cone and Cylinder Discovery Lab',
    titleNepali: 'सोली र बेलना खोजी प्रयोगशाला',
    description: 'Explore circular cross-sections, curved surfaces, vertex and base properties of cones and cylinders in 3D, and unfold 3D solids into 2D nets.',
    descriptionNepali: 'सोली (Cone) र बेलना (Cylinder) का वृत्ताकार आधार, वक्र सतह, ठाडो उचाइ र छड्के उचाइ अन्वेषण गर्ने तथा ३D ठोसलाई २D नेटमा फिँजाएर हेर्ने।',
    simulationType: 'WEB_GL',
    learningObjectives: [
      'Understand the geometric properties of cones and cylinders',
      'Distinguish vertical height (h), slant height (l), and base radius (r)',
      'Inspect 2D nets of cylinders (rectangle + 2 circles) and cones (sector + circle)',
    ],
    learningObjectivesNepali: [
      'सोली र बेलनाका ज्यामितीय विशेषताहरू बुझ्ने',
      'ठाडो उचाइ (h), छड्के उचाइ (l) र आधारको अर्धव्यास (r) छुट्याउने',
      'बेलना र सोलीका २D नेटहरू (Nets) खोलेर हेर्ने र विश्लेषण गर्ने',
    ],
    tags: ['math', 'grade7', 'geometry', 'cone', 'cylinder', 'nets', '3D'],
  },

  // ── LESSON 17: COORDINATES (निर्देशाङ्कहरू) ───────────────────────────
  {
    code: 'SIM-MATH-G7-L17-01',
    key: 'class7-math-l17-coordinate-playground',
    chapterNumber: 17,
    chapterName: 'Coordinates',
    chapterNameNepali: 'निर्देशाङ्कहरू',
    title: 'Coordinate Plane Playground',
    titleNepali: 'निर्देशाङ्क समतल र बिन्दु अङ्कन खेलमैदान',
    description: 'Interactive coordinate plane featuring X-axis (XOX), Y-axis (YOY), origin (0,0), four quadrants with sign rules, ordered pairs (x,y) horizontal and vertical movement, and textbook point plotting.',
    descriptionNepali: 'X-अक्ष, Y-अक्ष, उद्गम बिन्दु (०,०), चार चतुर्थांशहरूका चिन्ह नियम, क्रमित जोडा (x,y) चाल र पाठ्यपुस्तकका बिन्दुहरू अङ्कन गर्ने खेलमैदान।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand the coordinate axes (XOX, YOY) and origin O(0,0)',
      'Interpret ordered pairs (x, y) as horizontal movement first and vertical movement second',
      'Identify the sign rules of the four quadrants and correctly plot coordinate points',
    ],
    learningObjectivesNepali: [
      'निर्देशाङ्क अक्षहरू (XOX, YOY) र उद्गम बिन्दु O(०,०) बुझ्ने',
      'क्रमित जोडा (x,y) मा पहिले क्षितिज र पछि ठाडो चाल हुन्छ भनी बुझ्ने',
      'चार चतुर्थांशहरूका चिन्ह नियम सिकेर ग्राफमा दिइएका बिन्दुहरू सही रूपमा अङ्कन गर्ने',
    ],
    tags: ['math', 'grade7', 'coordinates', 'cartesian-plane', 'quadrants', 'ordered-pairs'],
  },
  {
    code: 'SIM-MATH-G7-L17-02',
    key: 'class7-math-l17-coordinate-builder',
    chapterNumber: 17,
    chapterName: 'Coordinates',
    chapterNameNepali: 'निर्देशाङ्कहरू',
    title: 'Coordinate Geometry Builder',
    titleNepali: 'निर्देशाङ्क ज्यामिति र आकृति निर्माण',
    description: 'Join plotted coordinate points in sequence to construct rectangles, triangles, and parallelograms, measure distances by counting grid squares, and solve missing vertex problems.',
    descriptionNepali: 'बिन्दुहरू क्रमैसँग जोडेर आयत र त्रिभुज बनाउने, ग्रिडका कोठा गनेर दुरी नाप्ने तथा आयत र वर्गका हराएका शीर्षबिन्दुहरू पत्ता लगाउने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Join plotted points sequentially to construct and recognize plane geometric figures',
      'Measure horizontal and vertical line segment distances by counting grid squares',
      'Determine the coordinates of missing vertices of rectangles and squares',
    ],
    learningObjectivesNepali: [
      'बिन्दुहरू क्रमैसँग जोडेर आयत, त्रिभुज आदि ज्यामितीय आकृतिहरू पहिचान गर्ने',
      'ग्रिडका कोठाहरू गनेर भुजाहरूको लम्बाई र दुरी पत्ता लगाउने',
      'आयत र वर्गका हराएका शीर्षबिन्दुहरू तर्कसंगत रूपमा पत्ता लगाउने',
    ],
    tags: ['math', 'grade7', 'coordinates', 'geometry', 'missing-vertex', 'polygons'],
  },
];

async function seed() {
  console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected successfully.');

  let inserted = 0;
  let updated = 0;

  for (const s of CLASS7_L15_L16_L17_SIMS) {
    const doc = {
      code: s.code,
      title: s.title,
      titleNepali: s.titleNepali,
      description: s.description,
      descriptionNepali: s.descriptionNepali,
      subjectCode: 'MATH-G7',
      subjectName: 'Mathematics',
      gradeLevels: [7],
      chapterNumber: s.chapterNumber,
      chapterName: s.chapterName,
      chapterNameNepali: s.chapterNameNepali,
      simulationType: s.simulationType,
      componentKey: s.key,
      runtimeUrl: `/simulations/${s.key}`,
      difficulty: 'INTERMEDIATE',
      estimatedDurationMinutes: 15,
      learningObjectives: s.learningObjectives,
      learningObjectivesNepali: s.learningObjectivesNepali,
      isPublished: true,
      currentVersion: '1.0.0',
      tags: s.tags,
    };

    const res = await Simulation.findOneAndUpdate(
      { code: s.code },
      { $set: doc },
      { upsert: true, new: true, rawResult: true }
    );

    if (res.lastErrorObject?.updatedExisting) {
      console.log(`✓ Updated: [${s.code}] ${s.title}`);
      updated++;
    } else {
      console.log(`+ Created: [${s.code}] ${s.title}`);
      inserted++;
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Updated: ${updated}. Total: ${CLASS7_L15_L16_L17_SIMS.length}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

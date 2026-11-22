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

const CLASS8_U17_U18_U19_SIMS = [
  // ── UNIT 17: COORDINATES (निर्देशाङ्कहरू) ───────────────────────────────
  {
    code: 'SIM-MATH-G8-U17-01',
    key: 'class8-math-u17-cartesian-coordinate-explorer',
    chapterNumber: 17,
    chapterName: 'Coordinates',
    chapterNameNepali: 'निर्देशाङ्कहरू',
    title: 'Cartesian Coordinate Plane Explorer',
    titleNepali: 'कार्तीय निर्देशाङ्क समतल अन्वेषक',
    description: 'Explore the 2D Cartesian coordinate plane, axes X and Y, origin O(0,0), four quadrants with sign conventions, point plotting, and drawing geometric shapes.',
    descriptionNepali: 'दुई आयामिक कार्तीय निर्देशाङ्क प्रणाली, X र Y अक्ष, उद्गमबिन्दु O(0,0), चार चरणका चिन्हहरू, बिन्दु निर्धारण र बहुभुज आकृति निर्माणको अन्तरक्रियात्मक अन्वेषण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Identify X-axis, Y-axis, origin O(0, 0), and 4 quadrants with sign conventions (+, +), (-, +), (-, -), (+, -)',
      'Plot points P(x, y) accurately and read coordinate values',
      'Connect plotted vertices to construct geometric figures and observe real-world coordinate applications',
    ],
    learningObjectivesNepali: [
      'X-अक्ष, Y-अक्ष, उद्गमबिन्दु र चार चरणहरूका चिन्ह विशेषता पहिचान गर्न',
      'कार्तीय समतलमा दिइएको बिन्दु P(x, y) अङ्कन गर्न र स्थान पढ्न',
      'बिन्दुहरू जोडेर ज्यामितीय आकृति निर्माण गर्न र व्यवहारिक प्रयोग बुझ्न',
    ],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    tags: ['coordinates', 'cartesian plane', 'quadrants', 'x-axis', 'y-axis', 'plotting'],
  },
  {
    code: 'SIM-MATH-G8-U17-02',
    key: 'class8-math-u17-distance-points-lab',
    chapterNumber: 17,
    chapterName: 'Coordinates',
    chapterNameNepali: 'निर्देशाङ्कहरू',
    title: 'Distance Between Points Lab',
    titleNepali: 'दुई बिन्दुहरू बीचको दूरी प्रयोगशाला',
    description: 'Calculate distance between two points on horizontal lines (|x2 - x1|), vertical lines (|y2 - y1|), and oblique lines using the distance formula d = √((x2-x1)² + (y2-y1)²) derived from the Pythagorean theorem.',
    descriptionNepali: 'समानान्तर क्षितिज रेखा (|x2 - x1|), ठाडो रेखा (|y2 - y1|) र पाइथागोरस साध्यबाट व्युत्पन्न दूरी सूत्र d = √((x2-x1)² + (y2-y1)²) प्रयोग गरी बिन्दुहरू बीचको दूरी गणना प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate horizontal and vertical distance between parallel coordinate points',
      'Derive and visualize the coordinate distance formula using a right-angled triangle and Pythagorean theorem',
      'Solve practical distance and perimeter problems on coordinate grids',
    ],
    learningObjectivesNepali: [
      'तेर्सो र ठाडो रेखाखण्डका बिन्दुहरू बीचको दूरी सहजै गणना गर्न',
      'पाइथागोरस साध्यको आधारमा दूरी सूत्र d = √((x2-x1)² + (y2-y1)²) प्रमाणित र प्रयोग गर्न',
      'निर्देशाङ्क ग्रिडमा बहुभुजको परिमिति र दूरी समस्याहरू हल गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['coordinates', 'distance formula', 'pythagorean theorem', 'slope', 'grid distance'],
  },
  {
    code: 'SIM-MATH-G8-U17-03',
    key: 'class8-math-u17-coordinate-challenge-world',
    chapterNumber: 17,
    chapterName: 'Coordinates',
    chapterNameNepali: 'निर्देशाङ्कहरू',
    title: 'Coordinate Geometry Challenge World',
    titleNepali: 'निर्देशाङ्क ज्यामिति चुनौती संसार',
    description: 'Gamified coordinate missions: treasure hunt navigation, area of shapes on coordinate plane, finding missing vertices of rectangles and parallelograms, and flight path plotting.',
    descriptionNepali: 'निर्देशाङ्क ज्यामिति खेल चुनौती: खजाना खोजी, समतलमा त्रिभुज र आयतको क्षेत्रफल, छुटका शीर्षबिन्दु पत्ता लगाउने र हवाइ मार्ग निर्धारण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Locate hidden coordinates through quadrant and distance clues',
      'Find the coordinates of a 4th missing vertex for rectangles and parallelograms',
      'Calculate side lengths and area of coordinate-defined plane shapes',
    ],
    learningObjectivesNepali: [
      'चरण र दूरीका संकेतहरूको आधारमा सही निर्देशाङ्क पत्ता लगाउन',
      'समानान्तर चतुर्भुज वा आयतको चौथो शीर्षबिन्दु पत्ता लगाउन',
      'कार्तीय समतलमा आकृतिहरूको क्षेत्रफल र परिमिति गणना गर्न',
    ],
    difficulty: 'ADVANCED',
    estimatedDurationMinutes: 20,
    tags: ['coordinates', 'gamified', 'treasure hunt', 'missing vertex', 'area on grid'],
  },

  // ── UNIT 18: TESSELLATION (टेसेलेसन) ──────────────────────────────────
  {
    code: 'SIM-MATH-G8-U18-01',
    key: 'class8-math-u18-tessellation-discovery-studio',
    chapterNumber: 18,
    chapterName: 'Tessellation',
    chapterNameNepali: 'टेसेलेसन',
    title: 'Tessellation Discovery Studio',
    titleNepali: 'टेसेलेसन खोजी स्टुडियो',
    description: 'Discover plane tessellation principles: tiling without gaps or overlaps, 360° vertex angle sum condition, and why only equilateral triangles, squares, and regular hexagons can form regular tessellations.',
    descriptionNepali: 'टेसेलेसनको आधारभूत अवधारणा: कुनै खाली ठाउँ वा खप्टाइ बिना सतह ढाक्ने नियम, शीर्षबिन्दुमा ३६०° कोण योगको सर्त, र किन समबाहु त्रिभुज, वर्ग र नियमित षट्कोणले मात्र नियमित टेसेलेसन बनाउँछन् भनी पत्ता लगाउने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand tessellation definitions: tiling a plane with shapes without gaps or overlapping',
      'Analyze the vertex condition: the sum of angles meeting at any vertex must equal exactly 360°',
      'Prove why pentagons and octagons alone cannot tile a plane regularly',
    ],
    learningObjectivesNepali: [
      'टेसेलेसनको परिभाषा र विशेषता बुझ्न (कुनै खाली ठाउँ नछोडी र नखप्टाई सतह ढाक्ने)',
      'कुनै शीर्षबिन्दुमा जोडिने सबै कोणहरूको जोड ३६०° हुनुपर्छ भन्ने नियम बुझ्न',
      'नियमित पञ्चभुज वा अष्टभुजले किन नियमित टेसेलेसन बनाउन सक्दैनन् भनी प्रमाणित गर्न',
    ],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    tags: ['tessellation', 'tiling', 'vertex angle', 'regular polygon', 'gap-free'],
  },
  {
    code: 'SIM-MATH-G8-U18-02',
    key: 'class8-math-u18-regular-semiregular-tessellation',
    chapterNumber: 18,
    chapterName: 'Tessellation',
    chapterNameNepali: 'टेसेलेसन',
    title: 'Regular & Semi-Regular Tessellation Lab',
    titleNepali: 'नियमित र अर्ध-नियमित टेसेलेसन प्रयोगशाला',
    description: 'Systematic study of the 3 regular tessellations (3.3.3.3.3.3, 4.4.4.4, 6.6.6) and 8 semi-regular tessellations (e.g. 3.3.3.4.4, 3.6.3.6, 4.8.8) with vertex notation and dual patterns.',
    descriptionNepali: '३ नियमित टेसेलेसनहरू (३⁶, ४⁴, ६³) र ८ अर्ध-नियमित टेसेलेसनहरू (जस्तै ३.३.३.४.४, ३.६.३.६, ४.८.८) को शीर्षबिन्दु सङ्केत र कोण योगको प्रयोगात्मक विश्लेषण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Identify the three regular tessellations using regular triangles, squares, and hexagons',
      'Construct semi-regular tessellations combining two or more regular polygons with identical vertex arrangements',
      'Write and interpret vertex configuration notation (e.g., 3.6.3.6, 4.8.8)',
    ],
    learningObjectivesNepali: [
      '३ वटा मात्र सम्भव नियमित टेसेलेसनहरूको पहिचान र निर्माण गर्न',
      'दुई वा बढी नियमित बहुभुज मिलाएर अर्ध-नियमित टेसेलेसन रचना गर्न',
      'शीर्षबिन्दु संकेत (Vertex Notation) लेख्न र कोण जोड ३६०° प्रमाणित गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['tessellation', 'semi-regular', 'regular tiling', 'vertex notation', 'geometry'],
  },
  {
    code: 'SIM-MATH-G8-U18-03',
    key: 'class8-math-u18-tessellation-pattern-designer',
    chapterNumber: 18,
    chapterName: 'Tessellation',
    chapterNameNepali: 'टेसेलेसन',
    title: 'Tessellation Pattern Designer',
    titleNepali: 'टेसेलेसन ढाँचा डिजाइनर',
    description: 'Interactive tessellation studio for cultural floor tiles, Dhaka topi geometric weaving patterns, traditional Nepali architecture lattice (Aakhi Jhyal), and custom color styling.',
    descriptionNepali: 'ढाका टोपी, परम्परागत नेपाली आँखिझ्याल, मन्दिरका भुइँ र पर्खालका कलात्मक टेसेलेसन ढाँचा रचना तथा रङ भर्ने स्टुडियो।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Design artistic tessellations inspired by Nepali architecture and traditional textile patterns',
      'Apply color symmetry and repeating motifs across infinite tessellation grids',
      'Export and verify gap-free tile tessellation configurations',
    ],
    learningObjectivesNepali: [
      'नेपाली मौलिक कला, ढाका टोपी र आँखीझ्यालका टेसेलेसन ढाँचाहरू सिर्जना गर्न',
      'रङ सममिति र दोहोरिने ढाँचाहरू प्रयोग गरी सतह सजावट गर्न',
      'खाली ठाउँ नछोडिकन बन्ने टेसेलेसन टाइल निर्माण र प्रमाणीकरण गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['tessellation', 'pattern design', 'nepali art', 'dhaka topi', 'aakhi jhyal', 'creative'],
  },

  // ── UNIT 19: TRANSFORMATION (रूपान्तरण) ───────────────────────────────
  {
    code: 'SIM-MATH-G8-U19-01',
    key: 'class8-math-u19-reflection-explorer',
    chapterNumber: 19,
    chapterName: 'Transformation',
    chapterNameNepali: 'रूपान्तरण',
    title: 'Reflection Transformation Explorer',
    titleNepali: 'परावर्तन रूपान्तरण अन्वेषक',
    description: 'Explore geometric reflections across X-axis, Y-axis, y = x, and y = -x. Verify perpendicular bisector properties, orientation reversal, and coordinate mapping formulas.',
    descriptionNepali: 'X-अक्ष, Y-अक्ष, y = x, र y = -x ऐना रेखामा हुने परावर्तन, लम्ब समद्विभाजक गुण, अभिमुखिकरण उल्टिने नियम र निर्देशाङ्क सूत्रहरूको अन्तरक्रियात्मक अन्वेषण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand reflection as an isometry across an axis of reflection',
      'Apply reflection formulas: P(x, y) across X-axis -> (x, -y), across Y-axis -> (-x, y), across y=x -> (y, x), across y=-x -> (-y, -x)',
      'Observe that line segment connecting corresponding points is perpendicular bisector of the reflection line',
    ],
    learningObjectivesNepali: [
      'परावर्तन रेखालाई ऐना मानी प्रतिबिम्ब बन्ने नियम बुझ्न',
      'X-अक्ष, Y-अक्ष, y = x, र y = -x रेखामा परावर्तन हुँदा हुने निर्देशाङ्क सूत्र प्रयोग गर्न',
      'वस्तु र प्रतिबिम्ब जोड्ने रेखालाई परावर्तन रेखाले लम्ब समद्विभाजन गर्छ भनी देखाउन',
    ],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    tags: ['transformation', 'reflection', 'mirror line', 'x-axis', 'y-axis', 'isometry'],
  },
  {
    code: 'SIM-MATH-G8-U19-02',
    key: 'class8-math-u19-translation-motion-lab',
    chapterNumber: 19,
    chapterName: 'Transformation',
    chapterNameNepali: 'रूपान्तरण',
    title: 'Translation Motion Lab',
    titleNepali: 'विस्थापन गति प्रयोगशाला',
    description: 'Translate geometric shapes on coordinate grid using translation vector T = (a, b). Visualize horizontal and vertical displacement vectors, coordinate addition, and shape congruency.',
    descriptionNepali: 'विस्थापन भेक्टर T = (a, b) प्रयोग गरी समतलमा आकृतिहरू सार्ने, तेर्सो र ठाडो विस्थापनका भेक्टर वाणहरू, निर्देशाङ्क जोड सूत्र र सर्वाङ्गसमता अक्षुण्ण रहने नियमको अध्ययन।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Translate points and geometric figures using vector T = (a, b): P(x, y) -> P\'(x + a, y + b)',
      'Decompose diagonal translation into horizontal shift (delta x) and vertical shift (delta y)',
      'Confirm that translation preserves size, shape, side lengths, angles, and orientation',
    ],
    learningObjectivesNepali: [
      'विस्थापन भेक्टर T = (a, b) प्रयोग गरी बिन्दु र आकृतिलाई P(x+a, y+b) मा सार्न',
      'तेर्सो र ठाडो स्थानान्तरण गरी दुई-चरणे विस्थापन प्रक्रिया बुझ्न',
      'विस्थापनमा आकृतिको नाप, कोण र अभिमुखिकरण परिवर्तन हुँदैन भनी प्रमाणित गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['transformation', 'translation', 'vector', 'displacement', 'congruence'],
  },
  {
    code: 'SIM-MATH-G8-U19-03',
    key: 'class8-math-u19-rotation-transformation-challenge',
    chapterNumber: 19,
    chapterName: 'Transformation',
    chapterNameNepali: 'रूपान्तरण',
    title: 'Rotation & Transformation Challenge',
    titleNepali: 'परिक्रमण र रूपान्तरण चुनौती',
    description: 'Explore rotations about the origin O(0,0) by +90° (anticlockwise), -90° (clockwise), and 180°. Solve mystery transformation identification challenges comparing reflection, translation, and rotation.',
    descriptionNepali: 'उद्गमबिन्दु O(0,0) वरिपरि +९०° (घडीको उल्टो), -९०° (घडीको दिशा) र १८०° घुमाइको अध्ययन, निर्देशाङ्क रूपान्तरण सूत्रहरू, र परावर्तन, विस्थापन तथा परिक्रमण बीचको रहस्यमय चुनौती हल गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Apply rotation formulas about origin: +90° -> (-y, x), -90° -> (y, -x), 180° -> (-x, -y)',
      'Visualize rotational motion arcs and equidistant origin rays OP = OP\'',
      'Distinguish between Reflection, Translation, and Rotation when presented with object-image pairs',
    ],
    learningObjectivesNepali: [
      'उद्गमबिन्दु वरिपरि +९०°, -९०° र १८०° परिक्रमणका निर्देशाङ्क सूत्रहरू प्रयोग गर्न',
      'परिक्रमणमा केन्द्रबिन्दुबाट वस्तु र प्रतिबिम्बको दूरी बराबर हुन्छ भनी देखाउन',
      'वस्तु र प्रतिबिम्ब हेरेर परावर्तन, विस्थापन वा परिक्रमण पहिचान गर्ने क्षमता विकास गर्न',
    ],
    difficulty: 'ADVANCED',
    estimatedDurationMinutes: 20,
    tags: ['transformation', 'rotation', 'quarter turn', 'half turn', 'mystery challenge', 'isometry'],
  },
];

async function seedClass8MathU17U18U19() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    let insertedCount = 0;
    let updatedCount = 0;

    for (const sim of CLASS8_U17_U18_U19_SIMS) {
      const doc = {
        code: sim.code,
        title: sim.title,
        titleNepali: sim.titleNepali,
        description: sim.description,
        descriptionNepali: sim.descriptionNepali,
        subjectCode: 'MATH-G8',
        subjectName: 'Grade 8 Mathematics',
        gradeLevels: [8],
        chapterNumber: sim.chapterNumber,
        chapterName: sim.chapterName,
        chapterNameNepali: sim.chapterNameNepali,
        simulationType: sim.simulationType,
        componentKey: sim.key,
        difficulty: sim.difficulty,
        estimatedDurationMinutes: sim.estimatedDurationMinutes,
        learningObjectives: sim.learningObjectives,
        learningObjectivesNepali: sim.learningObjectivesNepali,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: sim.tags,
      };

      const result = await Simulation.updateOne(
        { code: sim.code },
        { $set: doc },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        insertedCount++;
        console.log(`[INSERTED] ${sim.code}: ${sim.title}`);
      } else {
        updatedCount++;
        console.log(`[UPDATED] ${sim.code}: ${sim.title}`);
      }
    }

    console.log('\n--- SEED SUMMARY ---');
    console.log(`Total processed: ${CLASS8_U17_U18_U19_SIMS.length}`);
    console.log(`Inserted: ${insertedCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log('Class 8 Math Units 17, 18, 19 seeded successfully!');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Class 8 Math Units 17, 18, 19:', error);
    process.exit(1);
  }
}

seedClass8MathU17U18U19();

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

const CLASS9_U7_U8_U9_SIMS = [
  // ── UNIT 7: CYLINDER AND SPHERE (बेलना र गोला) ───────────────────────────
  {
    code: 'SIM-MATH-G9-U7-01',
    key: 'class9-math-u7-interactive-cylinder-explorer',
    chapterNumber: 7,
    chapterName: 'Cylinder and Sphere',
    chapterNameNepali: 'बेलना र गोला',
    title: 'Interactive Cylinder Explorer',
    titleNepali: 'अन्तरक्रियात्मक बेलना अन्वेषक',
    description: 'Explore the 3D structure of a cylinder with radius and diameter controls, circular bases (πr²), curved surface unrolling into a rectangle (length = 2πr, breadth = h), Curved Surface Area (CSA = 2πrh), and Total Surface Area (TSA = 2πr(r + h)).',
    descriptionNepali: 'बेलनाको ३D संरचना, अर्धव्यास र व्यास नियन्त्रण, दुई वृत्ताकार आधार (πr²), वक्र सतहलाई आयतमा फुकाउने प्रक्रिया (लम्बाइ = २πr, चौडाइ = h), वक्र सतह (CSA = २πrh) र कुल सतह (TSA = २πr(r + h)) को अन्वेषक।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand cylinder components: two circular bases and one curved surface',
      'Demonstrate that unrolling the curved surface forms a rectangle of dimensions 2πr × h',
      'Calculate CSA = 2πrh and TSA = 2πr(r + h) using CDC textbook formulas',
    ],
    learningObjectivesNepali: [
      'बेलनाका दुई वृत्ताकार आधार र वक्र सतहको संरचना बुझ्न',
      'वक्र सतहलाई समतलमा फुकाउँदा २πr × h नापको आयत बन्ने सम्बन्ध प्रमाणित गर्न',
      'वक्र सतह (CSA = २πrh) र कुल सतह (TSA = २πr(r + h)) को हिसाब गर्न',
    ],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    tags: ['cylinder', 'curved surface area', 'total surface area', 'net unfolding', 'radius height', 'grade 9'],
  },
  {
    code: 'SIM-MATH-G9-U7-02',
    key: 'class9-math-u7-cylinder-volume-tank-lab',
    chapterNumber: 7,
    chapterName: 'Cylinder and Sphere',
    chapterNameNepali: 'बेलना र गोला',
    title: 'Cylinder Volume and Water Tank Laboratory',
    titleNepali: 'बेलनाको आयतन तथा पानी ट्याङ्की प्रयोगशाला',
    description: 'Calculate cylinder volume V = πr²h, design cylindrical water tanks, animate water level filling, convert volume to liters (1 m³ = 1,000 L), compare capacities between two containers, and solve reverse base area problems.',
    descriptionNepali: 'बेलनाको आयतन V = πr²h, बेलनाकार पानी ट्याङ्कीको डिजाइन, पानीको स्तर नियन्त्रण, लिटर क्षमता (१ m³ = १,००० लिटर), दुई भाँडाको क्षमता तुलना र उल्टो हिसाब प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate cylinder volume using V = Base Area × Height = πr²h',
      'Convert volume between cubic meters, cubic centimeters, and liters (1 m³ = 1000 L)',
      'Compare volumes of different cylinder proportions (doubling radius vs doubling height)',
    ],
    learningObjectivesNepali: [
      'बेलनाको आयतन V = आधारको क्षेत्रफल × उचाइ = πr²h सूत्रबाट निकाल्न',
      'घन मिटर र घन सेन्टिमिटरलाई लिटरमा रूपान्तरण गर्न (१ m³ = १००० लिटर)',
      'विभिन्न नापका बेलनाकार भाँडाहरूको क्षमता तुलना गर्न र उल्टो हिसाब समाधान गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['cylinder volume', 'water tank', 'liter capacity', 'container comparison', 'reverse solver'],
  },
  {
    code: 'SIM-MATH-G9-U7-03',
    key: 'class9-math-u7-sphere-hemisphere-lab',
    chapterNumber: 7,
    chapterName: 'Cylinder and Sphere',
    chapterNameNepali: 'बेलना र गोला',
    title: 'Sphere and Hemisphere 3D Laboratory',
    titleNepali: 'गोला तथा अर्धगोला ३D प्रयोगशाला',
    description: 'Explore 3D sphere and hemisphere with interactive central cutting plane, surface area of sphere (4πr²), hemisphere CSA (2πr²), flat face (πr²), hemisphere TSA (3πr²), sphere volume (4/3 πr³), hemisphere volume (2/3 πr³), and water displacement beaker demonstration.',
    descriptionNepali: 'गोला र अर्धगोलाको ३D स्वरूप, समतलले काटेर दुई अर्धगोलामा विभाजन गर्ने विधि, गोलाको क्षेत्रफल (४πr²), अर्धगोलाको वक्र (२πr²), कुल सतह (३πr²), आयतन (४/३ πr³ र २/३ πr³) र पानी विस्थापन प्रयोग।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate surface area (4πr²) and volume (4/3 πr³) of a sphere',
      'Calculate curved surface area (2πr²), flat base (πr²), and total surface area (3πr²) of a hemisphere',
      'Understand that a hemisphere has exactly half the volume of a sphere of identical radius',
    ],
    learningObjectivesNepali: [
      'गोलाको सतहको क्षेत्रफल (४πr²) र आयतन (४/३ πr³) हिसाब गर्न',
      'अर्धगोलाको वक्र सतह (२πr²), वृत्ताकार आधार (πr²) र कुल सतह (३πr²) गणना गर्न',
      'समान अर्धव्यास भएको अर्धगोलाको आयतन गोलाको आयतनको ठ्याक्कै आधा (२/३ πr³) हुने तथ्य बुझ्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['sphere', 'hemisphere', 'surface area', 'volume', 'cutting plane', 'water displacement'],
  },

  // ── UNIT 8: SEQUENCE AND SERIES (अनुक्रम र श्रेणी) ───────────────────────
  {
    code: 'SIM-MATH-G9-U8-01',
    key: 'class9-math-u8-sequence-pattern-explorer',
    chapterNumber: 8,
    chapterName: 'Sequence and Series',
    chapterNameNepali: 'अनुक्रम र श्रेणी',
    title: 'Sequence Pattern Explorer',
    titleNepali: 'अनुक्रम ढाँचा अन्वेषक',
    description: 'Explore number patterns, odd numbers, square numbers (n²), cubic numbers (n³), linear sequences (3n + 1), finite vs infinite sequences, missing terms, general term formula tₙ, and n-th term generator.',
    descriptionNepali: 'संख्याहरूको ढाँचा, बिजोर संख्या, वर्ग संख्या (n²), घन संख्या (n³), रैखिक अनुक्रम, सीमित र असीमित अनुक्रम, खाली पद भर्ने र सामान्य पद tₙ बाट कुनै पनि पद निकाल्ने अन्वेषक।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Recognize number patterns and differentiate between finite and infinite sequences',
      'Understand and use the general term formula tₙ to compute sequence terms',
      'Predict and determine missing terms in textbook pattern exercises',
    ],
    learningObjectivesNepali: [
      'संख्या ढाँचा पहिचान गर्न र सीमित तथा असीमित अनुक्रम छुट्याउन',
      'सामान्य पद tₙ को सूत्र प्रयोग गरी अनुक्रमका पदहरू निकाल्न',
      'खाली पदहरू पत्ता लगाउन र नयाँ अनुक्रम निर्माण गर्न',
    ],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    tags: ['sequence', 'patterns', 'general term', 'finite infinite', 'squares', 'cubes', 'grade 9'],
  },
  {
    code: 'SIM-MATH-G9-U8-02',
    key: 'class9-math-u8-arithmetic-geometric-lab',
    chapterNumber: 8,
    chapterName: 'Sequence and Series',
    chapterNameNepali: 'अनुक्रम र श्रेणी',
    title: 'Arithmetic and Geometric Sequence Laboratory',
    titleNepali: 'समान्तर र गुणोत्तर अनुक्रम प्रयोगशाला',
    description: 'Interactive lab exploring Arithmetic Progression (AP: tₙ = a + (n - 1)d) with common difference d and reverse term index solver, Geometric Progression (GP: tₙ = arⁿ⁻¹) with common ratio r, and side-by-side comparison.',
    descriptionNepali: 'समान्तर अनुक्रम (AP: tₙ = a + (n - १)d) को साझा अन्तर d र उल्टो हिसाब, गुणोत्तर अनुक्रम (GP: tₙ = arⁿ⁻¹) को साझा अनुपात r र दुवै अनुक्रम बीचको तुलनात्मक प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Find common difference d and compute n-th term of an Arithmetic Progression (AP)',
      'Find common ratio r and compute n-th term of a Geometric Progression (GP)',
      'Compare AP vs GP and solve for term index n given a term value',
    ],
    learningObjectivesNepali: [
      'समान्तर अनुक्रमको साझा अन्तर d निकाली n-औँ पद हिसाब गर्न',
      'गुणोत्तर अनुक्रमको साझा अनुपात r निकाली n-औँ पद गणना गर्न',
      'समान्तर र गुणोत्तर अनुक्रम बीच तुलना गरी पहिचान गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['arithmetic sequence', 'geometric sequence', 'common difference', 'common ratio', 'ap', 'gp'],
  },
  {
    code: 'SIM-MATH-G9-U8-03',
    key: 'class9-math-u8-series-sigma-notation',
    chapterNumber: 8,
    chapterName: 'Sequence and Series',
    chapterNameNepali: 'अनुक्रम र श्रेणी',
    title: 'Series and Sigma Notation Explorer',
    titleNepali: 'श्रेणी तथा सिग्मा सङ्केत अन्वेषक',
    description: 'Explore the transition from sequences to series, Greek Sigma notation (Σ), starting and ending indices, term expansion stream, finite summation, and conversion between expanded series and compact Sigma notation.',
    descriptionNepali: 'अनुक्रमबाट श्रेणीको निर्माण, ग्रीक सिग्मा सङ्केत (Σ) को प्रयोग, सुरु र अन्तिम सूचक, पदहरूको विस्तार र जोडफल हिसाब गर्ने अन्तरक्रियात्मक अन्वेषक।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand the difference between a sequence (comma-separated list) and a series (indicated sum)',
      'Interpret and evaluate Sigma notation with lower and upper limits',
      'Expand sigma expressions term by term and compute total finite sums',
    ],
    learningObjectivesNepali: [
      'अनुक्रम र श्रेणी बीचको भिन्नता स्पष्ट रूपमा बुझ्न',
      'सिग्मा सङ्केतको सुरु र अन्त्य सूचक अनुसार पदहरू विस्तार गर्न',
      'विस्तारित पदहरूको जोडफल निकाली श्रेणीको मान निकाल्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['series', 'sigma notation', 'summation', 'expansion', 'indices', 'general term'],
  },

  // ── UNIT 9: FACTORIZATION (खण्डीकरण) ─────────────────────────────────────
  {
    code: 'SIM-MATH-G9-U9-01',
    key: 'class9-math-u9-algebraic-cube-builder',
    chapterNumber: 9,
    chapterName: 'Factorization',
    chapterNameNepali: 'खण्डीकरण',
    title: 'Algebraic Cube Builder: (a + b)³ and (a - b)³',
    titleNepali: 'बीजीय घन निर्माण: (a + b)³ र (a - b)³',
    description: 'Geometric 3D cube model exploring (a + b)³ divided into 8 blocks: 1 a³ cube, 3 a²b cuboids, 3 ab² cuboids, and 1 b³ cube, verifying (a + b)³ = a³ + 3a²b + 3ab² + b³ and (a - b)³ expansions.',
    descriptionNepali: '(a + b)³ लाई ८ वटा साना ठोसहरू (१ वटा a³, ३ वटा a²b, ३ वटा ab², १ वटा b³) मा विभाजन गरी बीजीय विस्तार र आयतनको सम्बन्ध प्रमाणित गर्ने ३D प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Visualize algebraic expressions (a + b)³ and (a - b)³ as geometric 3D cubes',
      'Identify the 8 smaller components forming the complete cube volume',
      'Relate geometric component volumes to algebraic polynomial expansion terms',
    ],
    learningObjectivesNepali: [
      '(a + b)³ र (a - b)³ को ज्यामितीय ३D घन स्वरूप बुझ्न',
      'घनभित्र बन्ने ८ वटा साना ठोसहरू पहिचान गरी प्रत्येकको आयतन निकाल्न',
      'ठोसहरूको कुल आयतन र बीजीय विस्तार सूत्र बीचको समानता प्रमाणित गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['algebraic cube', 'expansion', 'factorization', '3d blocks', 'volume', 'geometry of algebra'],
  },
  {
    code: 'SIM-MATH-G9-U9-02',
    key: 'class9-math-u9-sum-diff-cubes-lab',
    chapterNumber: 9,
    chapterName: 'Factorization',
    chapterNameNepali: 'खण्डीकरण',
    title: 'Sum and Difference of Cubes Factorization Lab',
    titleNepali: 'घनाकार जोड र घटाउको खण्डीकरण',
    description: 'Step-by-step factorization lab for sum of cubes a³ + b³ = (a + b)(a² - ab + b²) and difference of cubes a³ - b³ = (a - b)(a² + ab + b²) with textbook examples (8x³ + y³, x³ - 8, 27a³ + 64b³) and expansion verification.',
    descriptionNepali: 'घनको जोड a³ + b³ = (a + b)(a² - ab + b²) र घनको घटाउ a³ - b³ = (a - b)(a² + ab + b²) को चरणबद्ध खण्डीकरण, पाठ्यपुस्तक उदाहरणहरू र गुणन प्रमाणीकरण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Identify expressions representing sums or differences of two cubes',
      'Extract cube roots to determine base values a and b',
      'Apply binomial and trinomial factor identities and verify by algebraic expansion',
    ],
    learningObjectivesNepali: [
      'दुई घनको जोड वा घटाउ भएका बीजीय अभिव्यक्तिहरू पहिचान गर्न',
      'घनमूल निकाली आधार a र b पत्ता लगाउन',
      'खण्डीकरण सूत्र लागू गरी गुणन गरेर नतिजा प्रमाणित गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['sum of cubes', 'difference of cubes', 'factorization', 'algebraic identities', 'verification'],
  },
  {
    code: 'SIM-MATH-G9-U9-03',
    key: 'class9-math-u9-fourth-degree-factor-lab',
    chapterNumber: 9,
    chapterName: 'Factorization',
    chapterNameNepali: 'खण्डीकरण',
    title: 'Fourth-Degree Expression Factorization Lab',
    titleNepali: 'चौथो घातका अभिव्यक्तिको खण्डीकरण प्रयोगशाला',
    description: 'Factorize fourth-degree expressions in the form a⁴ + a²b² + b⁴ by grouping square terms, completing the square into (a² + b²)² - (ab)², applying difference of two squares identity, and verifying by numerical substitution.',
    descriptionNepali: 'a⁴ + a²b² + b⁴ स्वरूपका चौथो घातका अभिव्यक्तिलाई पूर्ण वर्ग बनाई दुई वर्गको अन्तर (a² + b²)² - (ab)² मा रूपान्तरण गरी खण्डीकरण गर्ने विधि र संख्यात्मक जाँच।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Recognize fourth-degree expressions suitable for completing the square',
      'Transform expressions into difference of two squares: X² - Y² = (X + Y)(X - Y)',
      'Arrive at factors (a² + ab + b²)(a² - ab + b²) and verify by numerical substitution',
    ],
    learningObjectivesNepali: [
      'चौथो घातका अभिव्यक्तिहरूलाई पूर्ण वर्ग बनाउने विधि सिक्न',
      'अभिव्यक्तिलाई दुई वर्गको अन्तर (X² - Y²) मा रूपान्तरण गर्न',
      'अन्तिम खण्डीकरण निकाली संख्यात्मक मान राखेर सही भएको पुष्टि गर्न',
    ],
    difficulty: 'ADVANCED',
    estimatedDurationMinutes: 20,
    tags: ['fourth degree', 'factorization', 'completing square', 'difference of squares', 'algebraic proof'],
  },
];

async function seedClass9MathU7U8U9() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully.');

  for (const sim of CLASS9_U7_U8_U9_SIMS) {
    const doc = {
      code: sim.code,
      title: sim.title,
      titleNepali: sim.titleNepali,
      description: sim.description,
      descriptionNepali: sim.descriptionNepali,
      subjectCode: 'MATH-G9',
      subjectName: 'Mathematics',
      gradeLevels: [9],
      chapterNumber: sim.chapterNumber,
      chapterName: sim.chapterName,
      chapterNameNepali: sim.chapterNameNepali,
      simulationType: sim.simulationType,
      componentKey: sim.key,
      runtimeUrl: `/simulations/player/${sim.code}`,
      difficulty: sim.difficulty,
      estimatedDurationMinutes: sim.estimatedDurationMinutes,
      learningObjectives: sim.learningObjectives,
      learningObjectivesNepali: sim.learningObjectivesNepali,
      isPublished: true,
      currentVersion: '1.0.0',
      tags: sim.tags,
    };

    const res = await Simulation.findOneAndUpdate(
      { code: sim.code },
      { $set: doc },
      { upsert: true, returnDocument: 'after' }
    );
    console.log(`Upserted simulation: [${res.code}] ${res.title}`);
  }

  const totalCount = await Simulation.countDocuments({ gradeLevels: 9 });
  console.log(`Total Grade 9 simulations in database: ${totalCount}`);

  await mongoose.disconnect();
  console.log('MongoDB connection closed.');
}

seedClass9MathU7U8U9().catch((err) => {
  console.error('Error seeding Grade 9 Units 7, 8, 9 simulations:', err);
  process.exit(1);
});

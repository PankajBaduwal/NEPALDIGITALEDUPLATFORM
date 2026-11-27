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

const CLASS8_U11_U12_U13_SIMS = [
  // ── UNIT 11: ALGEBRAIC FRACTION (बीजीय भिन्न) ──────────────────────────
  {
    code: 'SIM-MATH-G8-U11-01',
    key: 'class8-math-u11-algebraic-fraction-discovery',
    chapterNumber: 11,
    chapterName: 'Algebraic Fraction',
    chapterNameNepali: 'बीजीय भिन्न',
    title: 'Algebraic Fraction Discovery and Simplification Lab',
    titleNepali: 'बीजीय भिन्न खोजी र सरलीकरण प्रयोगशाला',
    description: 'Explore numerator/denominator concepts, excluded values / domain restrictions where denominator equals zero, and step-by-step simplification of algebraic fractions using HCF and factor cancellation.',
    descriptionNepali: 'अंश र हरको अवधारणा, हर शून्य हुने निषेधित मानहरू (Domain Restrictions) र साझा गुणनखण्ड काटी बीजीय भिन्नलाई न्यूनतम रूपमा सरलीकरण गर्ने अभ्यास।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand numerator and denominator in algebraic fractions',
      'Identify excluded values (points where denominator = 0 causing undefined fraction)',
      'Factorize numerator and denominator and cancel common binomials or monomials to achieve lowest terms',
    ],
    learningObjectivesNepali: [
      'बीजीय भिन्नमा अंश र हर पहिचान गर्न',
      'हर शून्य बनाउने निषेधित मानहरू (x का मान) पत्ता लगाउन',
      'गुणनखण्ड गरी साझा पदहरू काट्न र न्यूनतम पदमा सरलीकरण गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['algebra', 'fractions', 'rational expressions', 'grade 8 math', 'factorization'],
  },
  {
    code: 'SIM-MATH-G8-U11-02',
    key: 'class8-math-u11-algebraic-fraction-add-sub',
    chapterNumber: 11,
    chapterName: 'Algebraic Fraction',
    chapterNameNepali: 'बीजीय भिन्न',
    title: 'Algebraic Fraction Addition and Subtraction Lab',
    titleNepali: 'बीजीय भिन्नको जोड र घटाउ प्रयोगशाला',
    description: 'Add and subtract algebraic fractions with like and unlike denominators using LCM (Least Common Multiple). Features sign change adjustments for binomial denominators.',
    descriptionNepali: 'समान र असमान हर भएका बीजीय भिन्नहरूको ल.स. निकालेर जोड र घटाउ गर्ने तथा विपरीत चिन्ह मिलाउने चरणबद्ध प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Add and subtract fractions with identical denominators',
      'Find algebraic LCM of different denominators and create common denominators',
      'Apply sign adjustment rule: (a - b) = -(b - a) when combining fractions',
    ],
    learningObjectivesNepali: [
      'समान हर भएका भिन्नहरू सजिलै जोड्न वा घटाउन',
      'असमान हरहरूको ल.स. निकाली समान हर बनाउन',
      'विपरीत चिन्ह (a - b) = -(b - a) रूपान्तरण गरी भिन्न सरलीकरण गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['algebra', 'fractions', 'addition', 'subtraction', 'LCM', 'grade 8 math'],
  },
  {
    code: 'SIM-MATH-G8-U11-03',
    key: 'class8-math-u11-algebraic-fraction-mul-div',
    chapterNumber: 11,
    chapterName: 'Algebraic Fraction',
    chapterNameNepali: 'बीजीय भिन्न',
    title: 'Algebraic Fraction Multiplication and Division Lab',
    titleNepali: 'बीजीय भिन्नको गुणन र भाग प्रयोगशाला',
    description: 'Multiply and divide algebraic fractions with reciprocal inversion, factor cancellation, and multi-term combined simplification challenges.',
    descriptionNepali: 'बीजीय भिन्नहरूको गुणन र भाग (उल्ट्याउने नियम / reciprocal), गुणनखण्ड काटेर सरलीकरण गर्ने र संयुक्त क्रिया हल गर्ने खेल।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Multiply numerators and denominators and reduce common factors',
      'Divide algebraic fractions by multiplying by the reciprocal (invert divisor fraction)',
      'Solve combined multi-step operations using order of operations',
    ],
    learningObjectivesNepali: [
      'भिन्नहरूको अंश-अंश र हर-हर गुणन गरी साझा पद काट्न',
      'भाजक भिन्नलाई उल्ट्याएर (reciprocal) भागलाई गुणनमा परिणत गर्न',
      'संयुक्त भिन्नहरूको चरणबद्ध समाधान गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['algebra', 'fractions', 'multiplication', 'division', 'reciprocal', 'grade 8 math'],
  },

  // ── UNIT 12: SIMULTANEOUS & QUADRATIC EQUATIONS (युगपत र द्विघात समीकरण) ──
  {
    code: 'SIM-MATH-G8-U12-01',
    key: 'class8-math-u12-simultaneous-equations-graph',
    chapterNumber: 12,
    chapterName: 'Simultaneous Equations and Quadratic Equations',
    chapterNameNepali: 'युगपत र द्विघात समीकरण',
    title: 'Simultaneous Equations Graph and Table Studio',
    titleNepali: 'युगपत समीकरण ग्राफ र तालिका स्टुडियो',
    description: 'Solve systems of two linear equations in two variables using dynamic coordinate graph plotting, table of values, substitution, and elimination methods.',
    descriptionNepali: 'दुई चल राशि भएका रेखीय समीकरणहरूको निर्देशांक तालिका र ग्राफमा प्रतिच्छेदन बिन्दु खोजेर तथा प्रतिस्थापन र हटाउने विधिबाट हल गर्ने स्टुडियो।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Generate coordinate tables (x, y) satisfying linear equations',
      'Plot straight lines on Cartesian axes and find the unique intersection point (x, y)',
      'Compare graphical solution with algebraic elimination and substitution methods',
    ],
    learningObjectivesNepali: [
      'समीकरण सन्तुष्ट गर्ने निर्देशांक बिन्दुहरूको तालिका तयार गर्न',
      'कार्तीय निर्देशांक प्रणालीमा रेखाहरू खिची प्रतिच्छेदन बिन्दु पत्ता लगाउन',
      'ग्राफ विधि, प्रतिस्थापन विधि र विलोपन विधिका चरणहरू तुलना गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['algebra', 'simultaneous equations', 'linear equations', 'graph plotting', 'elimination'],
  },
  {
    code: 'SIM-MATH-G8-U12-02',
    key: 'class8-math-u12-quadratic-equation-factorization',
    chapterNumber: 12,
    chapterName: 'Simultaneous Equations and Quadratic Equations',
    chapterNameNepali: 'युगपत र द्विघात समीकरण',
    title: 'Quadratic Equation Factorization Lab',
    titleNepali: 'द्विघात समीकरण गुणनखण्ड प्रयोगशाला',
    description: 'Master quadratic equations ax² + bx + c = 0, zero-product property, common factor method, splitting the middle term, difference of two squares, and forming equations from roots.',
    descriptionNepali: 'ax² + bx + c = ० रूपका द्विघात समीकरण, शून्य गुणन नियम, साझा पद निकाल्ने, मध्य पद विभाजन र वर्गहरूको भिन्नता विधिबाट मूलहरू (roots) निकाल्ने अभ्यास।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Distinguish linear from quadratic equations and identify standard form ax² + bx + c = 0',
      'Apply Zero-Product Property (if A × B = 0, then A = 0 or B = 0) to find distinct roots',
      'Plot roots on the number line and reconstruct quadratic equations from given roots',
    ],
    learningObjectivesNepali: [
      'रेखीय र द्विघात समीकरण छुट्याउन र प्रमाणिक रूप ax² + bx + c = ० बुझ्न',
      'शून्य गुणन नियम प्रयोग गरी दुई मूलहरू निकाल्न',
      'संख्या रेखामा मूलहरू देखाउन र दिएको मूलबाट पुनः समीकरण निर्माण गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['algebra', 'quadratic equations', 'factorization', 'roots', 'number line'],
  },
  {
    code: 'SIM-MATH-G8-U12-03',
    key: 'class8-math-u12-equation-solver-challenge',
    chapterNumber: 12,
    chapterName: 'Simultaneous Equations and Quadratic Equations',
    chapterNameNepali: 'युगपत र द्विघात समीकरण',
    title: 'Real-Life Equation Solver Challenge',
    titleNepali: 'समीकरण व्यावहारिक समस्या समाधान',
    description: 'Translate realistic word problems (sum and difference, stationery shopping, family age relationships, rectangular area dimensions) into equations and verify physical solutions.',
    descriptionNepali: 'दैनिक जीवनका व्यावहारिक समस्याहरू (संख्याको जोड-फरक, किनमेल, बुबा-छोराको उमेर र बगैँचाको क्षेत्रफल) लाई समीकरणमा ढालेर समाधान गर्ने चुनौती।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Translate word problem statements into simultaneous or quadratic equations',
      'Execute algebraic solving steps and verify solutions in the original problem statement',
      'Understand why negative roots are discarded for physical dimensions or ages',
    ],
    learningObjectivesNepali: [
      'शब्दमा दिइएका समस्यालाई बीजगणितीय समीकरणमा रूपान्तरण गर्न',
      'समीकरण हल गरी वास्तविक प्रश्नमा राखेर उत्तर जाँच्न',
      'लम्बाइ र उमेर जस्ता भौतिक नापमा ऋणात्मक मान किन मान्य हुँदैन भनी बुझ्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['algebra', 'word problems', 'real-life math', 'simultaneous equations', 'quadratic equations'],
  },

  // ── UNIT 13: LINES AND ANGLES (रेखाहरू र कोणहरू) ──────────────────────
  {
    code: 'SIM-MATH-G8-U13-01',
    key: 'class8-math-u13-lines-transversal-explorer',
    chapterNumber: 13,
    chapterName: 'Lines and Angles',
    chapterNameNepali: 'रेखाहरू र कोणहरू',
    title: 'Lines and Angles Transversal Explorer',
    titleNepali: 'समानान्तर रेखा र छेदक कोण अन्वेषक',
    description: 'Interactive geometry explorer for two parallel lines cut by a transversal. Visualize and highlight 8 angles: interior, exterior, alternate (Z-shape), corresponding (F-shape), and co-interior (C-shape).',
    descriptionNepali: 'दुई समानान्तर रेखालाई छेदकले काट्दा बन्ने ८ वटा कोणहरू, एकान्तर (Z-आकार), संगत (F-आकार) र क्रमागत भित्री कोण (C-आकार) पहिचान गर्ने अन्तरक्रियात्मक ज्यामिति।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Identify transversal lines and parallel lines in a geometric plane',
      'Recognize alternate angles (Z-pattern) and verify their equality',
      'Identify corresponding angles (F-pattern) and co-interior angles (C-pattern) summing to 180°',
    ],
    learningObjectivesNepali: [
      'समतलमा समानान्तर रेखा र छेदक रेखा पहिचान गर्न',
      'एकान्तर कोणहरू (Z-आकार) पहिचान गरी तिनीहरूको समानता जाँच्न',
      'संगत कोण (F-आकार) र क्रमागत भित्री कोण (C-आकार) को परिपूरक सम्बन्ध बुझ्न',
    ],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    tags: ['geometry', 'lines and angles', 'transversal', 'parallel lines', 'alternate angles'],
  },
  {
    code: 'SIM-MATH-G8-U13-02',
    key: 'class8-math-u13-parallel-lines-relationship',
    chapterNumber: 13,
    chapterName: 'Lines and Angles',
    chapterNameNepali: 'रेखाहरू र कोणहरू',
    title: 'Parallel Lines Angle Relationship Lab',
    titleNepali: 'समानान्तर रेखा र कोण सम्बन्ध प्रयोगशाला',
    description: 'Test whether lines are parallel using interactive tilt adjustments, dynamic protractor measurements, and verification of alternate, corresponding, and co-interior angle theorems.',
    descriptionNepali: 'रेखाको ढल्काइ परिवर्तन गरी चाँदा (protractor) ले कोण नाप्दै एकान्तर, संगत र क्रमागत भित्री कोणका नियमहरूबाट रेखाहरू समानान्तर छन् कि छैनन् परीक्षण गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Apply converse theorems to test if two lines are parallel',
      'Use interactive protractor overlay to accurately measure angles',
      'Verify that co-interior angles sum to exactly 180° for parallel lines',
    ],
    learningObjectivesNepali: [
      'कोणहरूको सम्बन्धबाट दुई रेखा समानान्तर हुन् वा होइनन् परीक्षण गर्न',
      'अन्तरक्रियात्मक चाँदा (protractor) प्रयोग गरी कोणहरू नाप्न',
      'समानान्तर रेखामा क्रमागत भित्री कोणको जोड ठीक १८०° हुन्छ भनी प्रमाणित गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['geometry', 'parallel lines', 'angle theorems', 'protractor', 'measurement'],
  },
  {
    code: 'SIM-MATH-G8-U13-03',
    key: 'class8-math-u13-unknown-angle-solver',
    chapterNumber: 13,
    chapterName: 'Lines and Angles',
    chapterNameNepali: 'रेखाहरू र कोणहरू',
    title: 'Unknown Angle Solver Challenge',
    titleNepali: 'अज्ञात कोण पत्ता लगाउने चुनौती',
    description: 'Solve algebraic equations for unknown angle variable x using alternate, co-interior, and corresponding angle relationships, including zigzag bridge trusses with auxiliary parallel lines.',
    descriptionNepali: 'एकान्तर, संगत, क्रमागत भित्री कोण र सहायक रेखा चाहिने बाङ्गा ट्रस कोणहरूमा अज्ञात कोण x को मान समीकरण बनाएर हल गर्ने चुनौती।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Set up linear algebraic equations based on parallel line angle theorems',
      'Solve for unknown variables x and find individual angle degrees',
      'Construct auxiliary parallel lines to solve complex zigzag angles in real-world trusses',
    ],
    learningObjectivesNepali: [
      'समानान्तर रेखाका कोण सम्बन्धबाट बीजगणितीय समीकरण बनाउन',
      'अज्ञात चल राशि x को मान निकाली प्रत्येक कोणको नाप पत्ता लगाउन',
      'ट्रस वा बाङ्गा कोणहरूमा सहायक समानान्तर रेखा खिचेर अज्ञात कोण निकाल्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['geometry', 'unknown angles', 'algebra in geometry', 'auxiliary lines', 'problem solving'],
  },
];

async function seed() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    for (const sim of CLASS8_U11_U12_U13_SIMS) {
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
        new: true,
        setDefaultsOnInsert: true,
      });

      console.log(`[UPSERTED] ${res.code} - ${res.title} (${res.chapterNameNepali})`);
    }

    console.log('\nAll 9 Grade 8 Math (Units 11, 12, 13) simulations seeded successfully!');
  } catch (err) {
    console.error('Error seeding Grade 8 Units 11, 12, 13 simulations:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

seed();

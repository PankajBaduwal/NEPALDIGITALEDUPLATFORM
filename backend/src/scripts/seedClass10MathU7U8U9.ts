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
  // ── UNIT 7: QUADRATIC EQUATION (वर्ग समीकरण) ──────────────────────────────
  {
    code: 'SIM-MATH-G10-U7-01',
    key: 'class10-math-u7-quadratic-explorer',
    chapterNumber: 7,
    chapterName: 'Quadratic Equation',
    chapterNameNepali: 'वर्ग समीकरण',
    title: 'Quadratic Equation and Parabola Explorer',
    titleNepali: 'वर्ग समीकरण तथा परबोला अन्वेषक',
    description: 'Explore the graph of quadratic equations on a 2D coordinate plane, manipulate coefficients a, b, and c, investigate Discriminant D and nature of roots, master the 3 textbook solving methods (Factorization, Completing the Square, and Quadratic Formula), and solve practical geometric/number word problems.',
    descriptionNepali: 'निर्देशाङ्क समतलमा वर्ग समीकरणको परबोला रेखाचित्र, गुणाङ्क a, b, c परिवर्तन गर्दा देखिने प्रभाव, विविक्तकर (D) र मूलहरूको प्रकृति, पाठ्यपुस्तकका ३ वटै समाधान विधिहरू (खण्डिकरण, पूर्ण वर्ग र सुत्र) तथा व्यावहारिक शाब्दिक समस्या प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand the general form ax² + bx + c = 0 (a ≠ 0) and its graphical parabolic representation',
      'Analyze the geometric impact of changing leading coefficient a (opens up/down, steepness), b, and c (y-intercept)',
      'Calculate the Discriminant D = b² - 4ac and classify roots: D > 0 (two distinct), D = 0 (equal), D < 0 (no real roots)',
      'Solve quadratic equations step by step using Factorization, Completing the Square, and Quadratic Formula',
      'Formulate and solve real-life quadratic word problems (dimensions of rectangle, consecutive numbers, right triangles)',
    ],
    learningObjectivesNepali: [
      'वर्ग समीकरणको प्रमाणिक रूप ax² + bx + c = ० (a ≠ ०) र यसको परबोला रेखाचित्रको सम्बन्ध बुझ्न',
      'गुणाङ्क a (माथितिर/तलतिर फर्केको), b, र c (y-अन्त:खण्ड) परिवर्तन गर्दा रेखाचित्रमा पर्ने असर प्रत्यक्ष हेर्न',
      'विविक्तकर D = b² - ४ac निकालेर मूलहरूको प्रकृति (D > ० मा फरक, D = ० मा बराबर, D < ० मा वास्तविक मूल नहुने) छुट्याउन',
      'खण्डिकरण, पूर्ण वर्ग बनाउने र सुत्र प्रयोग गरी तीनवटै विधिबाट चरणबद्ध समाधान गर्न',
      'आयातको नाप, लगातार संख्याको गुणनफल र समकोणी त्रिभुज जस्ता व्यावहारिक शाब्दिक समस्याहरू समाधान गर्न',
    ],
    tags: ['math-g10', 'grade10', 'quadratic-equation', 'parabola', 'roots', 'discriminant', 'factorization', 'completing-the-square', 'quadratic-formula'],
  },

  // ── UNIT 8: ALGEBRAIC FRACTION (बीजीय भिन्न) ──────────────────────────────
  {
    code: 'SIM-MATH-G10-U8-01',
    key: 'class10-math-u8-algebraic-fraction-lab',
    chapterNumber: 8,
    chapterName: 'Algebraic Fraction',
    chapterNameNepali: 'बीजीय भिन्न',
    title: 'Algebraic Fraction Visual Laboratory',
    titleNepali: 'बीजीय भिन्न दृश्य प्रयोगशाला',
    description: 'Interactive laboratory for algebraic fractions P(x)/Q(x): factorize numerators and denominators, click to cancel valid common multiplicative factors, discover excluded values where denominator equals zero, master addition, subtraction with LCM, multiplication, and reciprocal division.',
    descriptionNepali: 'बीजीय भिन्न P(x)/Q(x) को अन्तरक्रियात्मक प्रयोगशाला: अंश र हरको खण्डिकरण, साझा खण्ड काट्ने नियम, हर शून्य हुने अपरिभाषित मानहरू पत्ता लगाउने, ल.सा. निकालेर भिन्नको जोड र घटाउ, तथा गुणन र भागका चरणहरू।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Factorize polynomial numerators and denominators to reveal multiplicative common factors',
      'Correctly cancel common factors and understand why individual terms across addition/subtraction cannot be cancelled',
      'Identify excluded values of variables that cause the denominator to equal zero (domain restrictions)',
      'Perform addition and subtraction of algebraic fractions by determining the Lowest Common Multiple (LCM) of denominators',
      'Multiply and divide algebraic fractions by applying reciprocals and factor reduction',
      'Verify algebraic equivalence through numerical substitution while respecting domain boundaries',
    ],
    learningObjectivesNepali: [
      'बहुपदीय अंश र हरलाई खण्डिकरण गरी साझा गुणन खण्डहरू पत्ता लगाउन',
      'साझा खण्डहरू मात्र काट्न पाइने र जोड/घटाउका पदहरू छुट्टाछुट्टै काट्न नपाइने नियम बुझ्न',
      'भिन्नको हर शून्य भई अपरिभाषित हुने प्रतिबन्धित मानहरू (Excluded Values) पहिचान गर्न',
      'हरहरूको ल.सा. (LCM) निकालेर विजातीय बीजीय भिन्नहरूको जोड र घटाउ गर्न',
      'व्युत्क्रम भिन्नको प्रयोग गरी बीजीय भिन्नहरूको गुणन र भाग गर्न',
      'संख्यात्मक मान प्रतिस्थापन गरी मूल भिन्न र सरलीकृत भिन्न समान भएको पुष्टि गर्न',
    ],
    tags: ['math-g10', 'grade10', 'algebraic-fraction', 'simplification', 'cancelling-factors', 'excluded-values', 'operations', 'lcm-denominators'],
  },

  // ── UNIT 9: INDICES (घाताङ्क) ──────────────────────────────────────────────
  {
    code: 'SIM-MATH-G10-U9-01',
    key: 'class10-math-u9-indices-explorer',
    chapterNumber: 9,
    chapterName: 'Indices',
    chapterNameNepali: 'घाताङ्क',
    title: 'Laws of Indices Interactive Explorer',
    titleNepali: 'घाताङ्कका नियमहरू अन्तरक्रियात्मक अन्वेषक',
    description: 'Explore the fundamental laws of indices through repeated multiplication and interactive factor expansion: product law aᵐ · aⁿ = aᵐ⁺ⁿ, quotient law aᵐ ÷ aⁿ = aᵐ⁻ⁿ, descending ladder proving a⁰ = 1 and a⁻ⁿ = 1/aⁿ, fractional roots a^(m/n) = ⁿ√aᵐ, and solving exponential equations.',
    descriptionNepali: 'दोहोरिएको गुणन र अन्तरक्रियात्मक खण्ड विस्तारबाट घाताङ्कका मूलभूत नियमहरू अन्वेषण: गुणन नियम aᵐ · aⁿ = aᵐ⁺ⁿ, भाग नियम aᵐ ÷ aⁿ = aᵐ⁻ⁿ, a⁰ = १ र a⁻ⁿ = १/aⁿ प्रमाणित गर्ने घट्दो सिँढी, भिन्न घाताङ्क र घाताङ्कीय समीकरण समाधान प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand base a and exponent m as repeated multiplication of identical factors',
      'Apply and verify the Product Law: aᵐ × aⁿ = aᵐ⁺ⁿ and Quotient Law: aᵐ ÷ aⁿ = aᵐ⁻ⁿ for like bases',
      'Demonstrate why a⁰ = 1 and a⁻ⁿ = 1/aⁿ using descending pattern division ladders',
      'Relate fractional exponents to radical roots: a^(m/n) = ⁿ√(aᵐ) = (ⁿ√a)ᵐ',
      'Solve exponential equations by equating exponents when bases are equal (a^x = a^k ⟹ x = k)',
      'Reduce quadratic-type exponential equations (y + 1/y = c) to standard quadratic equations and solve for x',
    ],
    learningObjectivesNepali: [
      'आधार a र घाताङ्क m लाई समान खण्डहरूको दोहोरिएको गुणनको रूपमा बुझ्न',
      'समान आधार भएका घाताङ्कहरूको गुणन नियम aᵐ × aⁿ = aᵐ⁺ⁿ र भाग नियम aᵐ ÷ aⁿ = aᵐ⁻ⁿ प्रमाणित गर्न',
      'घट्दो सिँढी ढाँचाबाट a⁰ = १ र ऋणात्मक घाताङ्क a⁻ⁿ = १/aⁿ को नियम बुझ्न',
      'भिन्न घाताङ्कलाई करणी मूलमा रूपान्तरण गरी मान निकाल्न: a^(m/n) = ⁿ√(aᵐ)',
      'आधार समान बनाएर घाताङ्कहरू बराबर गरी घाताङ्कीय समीकरणहरू हल गर्न',
      'वर्ग समीकरणमा रूपान्तरण हुने घाताङ्कीय समीकरणहरू (y + १/y = c) लाई हल गर्न',
    ],
    tags: ['math-g10', 'grade10', 'indices', 'laws-of-indices', 'product-law', 'quotient-law', 'zero-exponent', 'negative-exponent', 'fractional-indices', 'exponential-equations'],
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
  console.error('Error seeding Grade 10 Mathematics simulations (Units 7-9):', err);
  process.exit(1);
});

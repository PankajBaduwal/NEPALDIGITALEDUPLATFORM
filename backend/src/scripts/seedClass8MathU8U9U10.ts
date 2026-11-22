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

const CLASS8_U8_U9_U10_SIMS = [
  // ── UNIT 8: AREA AND VOLUME (क्षेत्रफल र आयतन) ────────────────────────
  {
    code: 'SIM-MATH-G8-U8-01',
    key: 'class8-math-u8-geometry-area-explorer',
    chapterNumber: 8,
    chapterName: 'Area and Volume',
    chapterNameNepali: 'क्षेत्रफल र आयतन',
    title: 'Geometry Area Explorer',
    titleNepali: 'ज्यामितीय क्षेत्रफल अन्वेषक',
    description: 'Explore area formulas and derivations for right-angled, general, equilateral, and isosceles triangles, plus parallelograms, rhombuses, trapeziums, and general quadrilaterals. Includes vertex-shearing demonstration proving area is constant when base and perpendicular height remain fixed.',
    descriptionNepali: 'समकोण, साधारण, समबाहु र समद्विबाहु त्रिभुज तथा समानान्तर, समचतुर्भुज, समलम्ब र साधारण चतुर्भुजको क्षेत्रफल सूत्र प्रतिपादन र शीर्षबिन्दु सार्दा क्षेत्रफल स्थिर रहने प्रमाण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Derive and apply triangle area formulas: A = 1/2 bh, A = (√3/4)a², A = (b/4)√(4a² - b²)',
      'Calculate quadrilateral areas: Parallelogram (bh), Rhombus (1/2 d₁d₂), Trapezium (1/2 (a+b)h), and General (1/2 d(h₁+h₂))',
      'Understand the geometric principle that shifting a vertex along a parallel line leaves area invariant',
      'Solve CDC Grade 8 geometry area textbook problems with step-by-step working',
    ],
    learningObjectivesNepali: [
      'त्रिभुजको क्षेत्रफल सूत्रहरू प्रतिपादन गर्न र प्रयोग गर्न: A = 1/2 bh, A = (√3/4)a², A = (b/4)√(4a² - b²)',
      'चतुर्भुजहरूको क्षेत्रफल निकाल्न: समानान्तर (bh), समचतुर्भुज (1/2 d₁d₂), समलम्ब (1/2 (a+b)h), र साधारण (1/2 d(h₁+h₂))',
      'समानान्तर रेखामा शीर्षबिन्दु सार्दा आधार र लम्ब उचाइ नबदलिने हुनाले क्षेत्रफल स्थिर रहन्छ भन्ने ज्यामितीय नियम बुझ्न',
      'CDC कक्षा ८ पाठ्यपुस्तकका क्षेत्रफलसम्बन्धी समस्याहरू चरणबद्ध समाधान गर्न',
    ],
    tags: ['math', 'grade-8', 'unit-8', 'area', 'triangles', 'quadrilaterals', 'equilateral-triangle', 'trapezium', 'rhombus'],
  },
  {
    code: 'SIM-MATH-G8-U8-02',
    key: 'class8-math-u8-circle-circumference-lab',
    chapterNumber: 8,
    chapterName: 'Area and Volume',
    chapterNameNepali: 'क्षेत्रफल र आयतन',
    title: 'Circle and Circumference Discovery Lab',
    titleNepali: 'वृत्त, परिधि र क्षेत्रफल प्रयोगशाला',
    description: 'Discover radius, diameter, circumference (C = 2πr), the constant ratio π = C/d ≈ 22/7, and the CDC paper-cutting sector rearrangement activity proving circle area A = πr² (height = r, base = πr). Solve reverse problems such as finding radius when Area = 5,544 cm².',
    descriptionNepali: 'वृत्तको अर्धव्यास, व्यास, परिधि (C = २πr), अनुपात π = C/d ≈ २२/७, र १२ खण्डहरू काटेर समानान्तर चतुर्भुज बनाई A = πr² प्रतिपादन गर्ने र ५,५४४ वर्ग सेमीबाट अर्धव्यास पत्ता लगाउने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand relationship between radius and diameter (d = 2r) and circumference (C = 2πr = πd)',
      'Discover π as the constant ratio of circumference to diameter',
      'Derive the circle area formula A = πr² using sector cutting and rearrangement into a parallelogram',
      'Solve reverse problems: finding radius and circumference from given area (e.g. 5,544 cm²)',
    ],
    learningObjectivesNepali: [
      'अर्धव्यास, व्यास र परिधिबीचको सम्बन्ध बुझ्न (d = 2r, C = 2πr = πd)',
      'परिधि र व्यासको अनुपात सधैं अचर π हुन्छ भनी अन्वेषण गर्न',
      'वृत्तका खण्डहरू काटेर समानान्तर चतुर्भुज बनाई A = πr² सूत्र प्रतिपादन गर्न',
      'क्षेत्रफल दिइएको अवस्थामा अर्धव्यास र परिधि पत्ता लगाउने उल्टो समस्या समाधान गर्न (जस्तै ५,५४४ वर्ग सेमी)',
    ],
    tags: ['math', 'grade-8', 'unit-8', 'circle', 'circumference', 'radius', 'diameter', 'pi', 'circle-area'],
  },
  {
    code: 'SIM-MATH-G8-U8-03',
    key: 'class8-math-u8-composite-shaded-area-solver',
    chapterNumber: 8,
    chapterName: 'Area and Volume',
    chapterNameNepali: 'क्षेत्रफल र आयतन',
    title: 'Composite Shapes and Shaded Area Solver',
    titleNepali: 'संयुक्त आकृति र छायाङ्कित क्षेत्रफल',
    description: 'Solve real-world composite shapes and shaded regions: field excluding a square pond (CDC 240×180 ft field with 16 ft pond = 42,944 sq ft), square with circle removed, practical surface flooring/carpeting vs boundary fencing costing, and a village map area project.',
    descriptionNepali: 'संयुक्त आकृति र छायाङ्कित भाग: पोखरीबाहेकको जग्गा (२४०×१८० फिट जग्गामा १६ फिट पोखरी = ४२,९४४ वर्ग फिट), वर्गभित्र वृत्त हटाइएको भाग, कार्पेटिङ र तारबारको खर्च तथा गाउँको नक्सा परियोजना।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate area of composite figures formed by combining simpler shapes',
      'Calculate area of shaded regions by subtracting unshaded interior areas from total areas',
      'Solve the CDC textbook problem of a rectangular field excluding a square fish pond',
      'Distinguish area-based costs (carpeting, painting) from perimeter-based costs (fencing)',
    ],
    learningObjectivesNepali: [
      'सरल आकृतिहरू जोडेर बनेको संयुक्त आकृतिको क्षेत्रफल निकाल्न',
      'कुल क्षेत्रफलबाट भित्री भाग घटाएर छायाङ्कित भागको क्षेत्रफल निकाल्न',
      'पोखरीबाहेकको बाँकी जग्गाको क्षेत्रफलसम्बन्धी पाठ्यपुस्तक समस्या समाधान गर्न',
      'क्षेत्रफलमा आधारित लागत (कार्पेटिङ, टायल) र परिमितिमा आधारित लागत (काँडेतार) बीचको भिन्नता बुझ्न',
    ],
    tags: ['math', 'grade-8', 'unit-8', 'composite-shapes', 'shaded-area', 'field-pond', 'flooring-cost', 'fencing-cost'],
  },

  // ── UNIT 9: INDICES (घाताङ्क) ──────────────────────────────────────────
  {
    code: 'SIM-MATH-G8-U9-01',
    key: 'class8-math-u9-indices-exponent-playground',
    chapterNumber: 9,
    chapterName: 'Indices',
    chapterNameNepali: 'घाताङ्क',
    title: 'Indices Discovery and Exponent Playground',
    titleNepali: 'घाताङ्क खोजी र गुणन खेलमैदान',
    description: 'Explore repeated multiplication, base, and index notation (e.g. 5⁴ = 5×5×5×5). Includes the CDC bacteria doubling model every 20 minutes (2⁰ to 2⁶ = 64) and comparative power evaluations (comparing 2⁵ vs 5²).',
    descriptionNepali: 'दोहोरिएको गुणन, आधार र घाताङ्क सङ्केतन, प्रत्येक २० मिनेटमा दोब्बर हुने ब्याक्टेरिया जनसंख्या वृद्धि मोडेल (२⁰ देखि २⁶ = ६४) र घातहरूको तुलना (२⁵ र ५²)।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand repeated multiplication and represent it in index notation (aⁿ)',
      'Identify base and index/exponent accurately',
      'Model exponential doubling patterns using the CDC bacteria growth example',
      'Compare numerical values of exponential expressions with inverted base and exponent',
    ],
    learningObjectivesNepali: [
      'दोहोरिएको गुणनलाई घाताङ्कीय सङ्केत (aⁿ) मा लेख्न',
      'आधार र घाताङ्क सही रूपमा पहिचान गर्न',
      'ब्याक्टेरिया दोब्बर हुने घाताङ्कीय वृद्धि तालिका र मोडेल बुझ्न',
      'उल्टो आधार र घात भएका व्यञ्जकहरूको मान गणना गरी तुलना गर्न (जस्तै २⁵ र ५²)',
    ],
    tags: ['math', 'grade-8', 'unit-9', 'indices', 'exponents', 'powers', 'repeated-multiplication', 'bacteria-growth'],
  },
  {
    code: 'SIM-MATH-G8-U9-02',
    key: 'class8-math-u9-laws-of-indices-lab',
    chapterNumber: 9,
    chapterName: 'Indices',
    chapterNameNepali: 'घाताङ्क',
    title: 'Laws of Indices Interactive Lab',
    titleNepali: 'घाताङ्कका नियमहरू प्रयोगशाला',
    description: 'Visually verify all fundamental laws of indices: Product rule (xᵐ × xⁿ = xᵐ⁺ⁿ), Quotient rule (xᵐ ÷ xⁿ = xᵐ⁻ⁿ), Power of a power ((xᵐ)ⁿ = xᵐⁿ), Zero exponent (x⁰ = 1, x ≠ 0) via factor cancellation proof, and Negative exponent (x⁻ᵐ = 1/xᵐ).',
    descriptionNepali: 'घाताङ्कका आधारभूत नियमहरू: गुणन नियम (xᵐ × xⁿ = xᵐ⁺ⁿ), भाग नियम (xᵐ ÷ xⁿ = xᵐ⁻ⁿ), घातको घात ((xᵐ)ⁿ = xᵐⁿ), शून्य घाताङ्क (x⁰ = १) को प्रमाण र ऋणात्मक घाताङ्क (x⁻ᵐ = १/xᵐ)।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Demonstrate the product rule by expanding and combining like factors',
      'Demonstrate the quotient rule through common factor cancellations',
      'Understand power of a power and power of products/quotients',
      'Prove why any non-zero number to power zero equals 1 (x⁰ = 1)',
      'Convert negative exponents to positive reciprocal fraction form (x⁻ᵐ = 1/xᵐ)',
    ],
    learningObjectivesNepali: [
      'गुणन नियममा घाताङ्कहरू जोडिन्छन् भनी विस्तार गरी देखाउन',
      'भाग नियममा साझा गुणनखण्ड काटिएर घाताङ्क घट्छ भनी प्रमाणित गर्न',
      'घातको घातमा घाताङ्कहरू गुणन हुन्छन् भनी बुझ्न',
      'शून्य घाताङ्कको मान १ किन हुन्छ भनी दुई विधिबाट प्रमाणित गर्न',
      'ऋणात्मक घाताङ्कलाई धनात्मक भिन्न रूपमा रूपान्तरण गर्न',
    ],
    tags: ['math', 'grade-8', 'unit-9', 'laws-of-indices', 'product-rule', 'quotient-rule', 'zero-exponent', 'negative-exponent'],
  },
  {
    code: 'SIM-MATH-G8-U9-03',
    key: 'class8-math-u9-expression-indices-challenge',
    chapterNumber: 9,
    chapterName: 'Indices',
    chapterNameNepali: 'घाताङ्क',
    title: 'Expression Simplification and Indices Challenge',
    titleNepali: 'व्यञ्जक सरलीकरण र घाताङ्क चुनौती',
    description: 'Simplify complex algebraic expressions by handling numerical coefficients and variable exponents separately (e.g. (8x⁵) ÷ (2x²) = 4x³), simplifying powers with brackets, and solving missing exponent puzzles (x³ × xᐞ = x⁸ ⇒ ᐞ = 5).',
    descriptionNepali: 'संख्यात्मक गुणाङ्क र चलराशिका घाताङ्कलाई छुट्टाछुट्टै सरलीकरण गर्ने ((८x⁵) ÷ (२x²) = ४x³), कोष्ठक भएका व्यञ्जकहरू हल गर्ने र छुटेको घाताङ्क पत्ता लगाउने पहेली।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Separate numerical coefficients from variable powers during simplification',
      'Simplify negative and fractional exponent expressions step by step',
      'Solve missing exponent equations using algebraic inverse operations',
      'Apply combined laws of indices to simplify complex textbook expressions',
    ],
    learningObjectivesNepali: [
      'सरलीकरण गर्दा संख्यात्मक गुणाङ्क र चलराशिका घातलाई छुट्टाछुट्टै हिसाब गर्न',
      'ऋणात्मक घाताङ्क भएका बीजीय व्यञ्जकहरू चरणबद्ध सरल गर्न',
      'समीकरणमा छुटेको घाताङ्क पत्ता लगाउने गणितीय पहेली हल गर्न',
      'मिश्रित नियमहरू प्रयोग गरी CDC पाठ्यपुस्तकका जटिल व्यञ्जकहरू सरल गर्न',
    ],
    tags: ['math', 'grade-8', 'unit-9', 'simplification', 'coefficients', 'missing-exponent', 'indices-challenge'],
  },

  // ── UNIT 10: ALGEBRAIC EXPRESSION (बीजगणितीय व्यञ्जक) ──────────────────
  {
    code: 'SIM-MATH-G8-U10-01',
    key: 'class8-math-u10-algebraic-tiles-factorization',
    chapterNumber: 10,
    chapterName: 'Algebraic Expression',
    chapterNameNepali: 'बीजगणितीय व्यञ्जक',
    title: 'Algebraic Tiles and Factorization Playground',
    titleNepali: 'बीजगणितीय टायल र खण्डीकरण',
    description: 'Interactive algebra tile workspace showing how algebraic expressions correspond to rectangular areas (x² + 3x = x(x+3)). Master factorization by taking common factors (2x² + 4x = 2x(x+2)), grouping terms (ax+bx+ay+by = (a+b)(x+y)), difference of two squares (a²-b² = (a+b)(a-b)), and perfect squares.',
    descriptionNepali: 'बीजगणितीय टायलहरू मिलाएर आयत बनाउने (x² + ३x = x(x+३)), साझा लिने विधि, समूह मिलान (ax+bx+ay+by = (a+b)(x+y)), दुई वर्गको अन्तर (a²-b² = (a+b)(a-b)) र पूर्ण वर्ग खण्डीकरण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Connect algebraic factorization to rectangular geometric tile arrangements (Area = Length × Breadth)',
      'Extract greatest common monomial factors from algebraic expressions',
      'Factorize four-term polynomials using the grouping method: ax+bx+ay+by = (a+b)(x+y)',
      'Visualize and prove the difference of two squares identity: a² - b² = (a+b)(a-b)',
      'Represent perfect square trinomials as composite geometric squares',
    ],
    learningObjectivesNepali: [
      'बीजीय खण्डीकरणलाई टायलहरूबाट बन्ने आयतको क्षेत्रफलसँग जोड्न',
      'व्यञ्जकबाट साझा एकपदीय गुणनखण्ड बाहिर निकाल्न',
      'चार पद भएका व्यञ्जकलाई समूह मिलान विधिबाट खण्डीकरण गर्न',
      'दुई वर्गको अन्तर (a² - b² = (a+b)(a-b)) लाई ज्यामितीय रूपमा प्रमाणित गर्न',
      'पूर्ण वर्ग त्रिपदीय व्यञ्जकहरूलाई वर्गको रूपमा प्रदर्शन गर्न',
    ],
    tags: ['math', 'grade-8', 'unit-10', 'algebraic-tiles', 'factorization', 'grouping', 'difference-of-squares', 'perfect-square'],
  },
  {
    code: 'SIM-MATH-G8-U10-02',
    key: 'class8-math-u10-quadratic-factorization-lab',
    chapterNumber: 10,
    chapterName: 'Algebraic Expression',
    chapterNameNepali: 'बीजगणितीय व्यञ्जक',
    title: 'Quadratic Expression and Factorization Lab',
    titleNepali: 'वर्ग समीकरण र खण्डीकरण प्रयोगशाला',
    description: 'Master quadratic trinomial factorization ax² + bx + c using the product-and-sum/difference method. Step-by-step splitting of the middle term for positive constants (x²+5x+6), negative constants (x²+5x-6), leading coefficients a > 1 (3x²+11x+6), and interactive factor-pair table verification.',
    descriptionNepali: 'त्रिपदीय व्यञ्जक ax² + bx + c लाई गुणनफल र जोड विधिबाट मध्यपद टुक्र्याउने: धनात्मक अचर (x²+५x+६), ऋणात्मक अचर (x²+५x-६), र गुणाङ्क भएका (३x²+११x+६) समस्याहरूको चरणबद्ध खण्डीकरण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Factorize quadratic trinomials x² + bx + c by finding two numbers with product c and sum b',
      'Handle negative constant terms using factor pairs with opposite signs',
      'Factorize quadratic expressions with leading coefficient a > 1 (product = a × c, sum = b)',
      'Verify factorization by expanding the resulting binomial product',
    ],
    learningObjectivesNepali: [
      'गुणनफल c र जोड b हुने दुई सङ्ख्या पत्ता लगाई x² + bx + c लाई खण्डीकरण गर्न',
      'ऋणात्मक अचर पद भएका व्यञ्जकमा विपरित चिन्ह भएका गुणनखण्ड जोडी प्रयोग गर्न',
      'x² को गुणाङ्क a > 1 भएका व्यञ्जकहरू (३x² + ११x + ६) लाई मध्यपद टुक्र्याएर हल गर्न',
      'निकालेको खण्डीकृत द्विपदलाई गुणन गरी उत्तर रुजु गर्न',
    ],
    tags: ['math', 'grade-8', 'unit-10', 'quadratic-trinomial', 'splitting-middle-term', 'factor-pairs', 'product-and-sum'],
  },
  {
    code: 'SIM-MATH-G8-U10-03',
    key: 'class8-math-u10-hcf-lcm-algebraic-expressions',
    chapterNumber: 10,
    chapterName: 'Algebraic Expression',
    chapterNameNepali: 'बीजगणितीय व्यञ्जक',
    title: 'HCF and LCM of Algebraic Expressions Lab',
    titleNepali: 'बीजीय व्यञ्जकहरूको म.स. र ल.स.',
    description: 'Find Highest Common Factor (HCF) and Lowest Common Multiple (LCM) of algebraic monomials and polynomials through factorization. Covers CDC textbook cases: x²+2xy+y² and x²-y² (HCF = x+y, LCM = (x+y)²(x-y)), and three expressions (x²+6x+8, x²-4, x²+4x+4).',
    descriptionNepali: 'बीजीय एकपदीय र बहुपदीय व्यञ्जकहरूको खण्डीकरण गरी म.स. (साझा मात्र) र ल.स. (साझा × बाँकी) निकाल्ने CDC पाठ्यपुस्तकका उदाहरणहरू (x²+२xy+y² र x²-y² तथा ३ ओटा त्रिपदीय व्यञ्जक)।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Factorize given polynomials into linear factors before computing HCF and LCM',
      'Find HCF by selecting the product of all common factors',
      'Find LCM by multiplying common factors by all remaining unique factors',
      'Solve CDC textbook exam problems involving two and three quadratic expressions',
    ],
    learningObjectivesNepali: [
      'म.स. र ल.स. निकाल्नुअघि प्रत्येक व्यञ्जकलाई रेखीय गुणनखण्डहरूमा टुक्र्याउन',
      'सबै व्यञ्जकहरूमा रहेका साझा गुणनखण्डहरूको गुणनफलबाट म.स. निकाल्न',
      'साझा गुणनखण्ड र बाँकी रहेका सबै गुणनखण्डहरू गुणन गरी ल.स. निकाल्न',
      'दुई र तीन ओटा व्यञ्जक भएका CDC पाठ्यपुस्तकका परीक्षा प्रश्नहरू हल गर्न',
    ],
    tags: ['math', 'grade-8', 'unit-10', 'hcf', 'lcm', 'algebraic-hcf', 'algebraic-lcm', 'common-factors', 'remaining-factors'],
  },
];

async function seed() {
  console.log('Connecting to MongoDB:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully.');

  let inserted = 0;
  let updated = 0;

  for (const s of CLASS8_U8_U9_U10_SIMS) {
    const doc = {
      code: s.code,
      title: s.title,
      titleNepali: s.titleNepali,
      description: s.description,
      descriptionNepali: s.descriptionNepali,
      subjectCode: 'MATH',
      subjectName: 'Mathematics',
      gradeLevels: [8],
      chapterNumber: s.chapterNumber,
      chapterName: s.chapterName,
      chapterNameNepali: s.chapterNameNepali,
      simulationType: s.simulationType,
      componentKey: s.key,
      runtimeUrl: `/simulations/class8-math/${s.key}`,
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
      { upsert: true, returnDocument: 'after', rawResult: true }
    );

    if (res.lastErrorObject?.updatedExisting) {
      console.log(`✓ Updated: [${s.code}] ${s.title}`);
      updated++;
    } else {
      console.log(`+ Created: [${s.code}] ${s.title}`);
      inserted++;
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Updated: ${updated}. Total: ${CLASS8_U8_U9_U10_SIMS.length}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

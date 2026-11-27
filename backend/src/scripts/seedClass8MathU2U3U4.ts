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

const CLASS8_U2_U3_U4_SIMS = [
  // ── UNIT 2: WHOLE NUMBERS (पूर्ण सङ्ख्याहरू) ──────────────────────────
  {
    code: 'SIM-MATH-G8-U2-01',
    key: 'class8-math-u2-number-systems',
    chapterNumber: 2,
    chapterName: 'Whole Numbers',
    chapterNameNepali: 'पूर्ण सङ्ख्याहरू',
    title: 'Number System Discovery Playground',
    titleNepali: 'सङ्ख्या पद्धति खोजी खेलमैदान',
    description: 'Explore Decimal (Base 10), Binary (Base 2 with electrical switch ON/OFF), and Quinary (Base 5) systems with interactive place value tables, powers of bases, and comparative numbers.',
    descriptionNepali: 'दशमलव (आधार १०), द्विआधार (स्विच अन/अफ आधार २) र पञ्चआधार (आधार ५) सङ्ख्या पद्धतिहरू, स्थानीय मान तालिका र विस्तारित रूप अन्वेषण गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand the base, allowed digits, and place values of Decimal, Binary, and Quinary number systems',
      'Relate binary bits 0 and 1 to digital circuit switches (OFF and ON)',
      'Expand numbers into powers of their base and compare representations across all three systems',
    ],
    learningObjectivesNepali: [
      'दशमलव, द्विआधार र पञ्चआधार सङ्ख्या पद्धतिका आधार, अङ्क र स्थानीय मान बुझ्ने',
      'विद्युतीय सर्किटमा ० र १ लाई क्रमशः स्विच अफ र अनसँग सम्बन्धित गर्ने',
      'आधारको घातमा सङ्ख्याहरू विस्तार गर्ने र तीनवटै पद्धतिमा तुलना गर्ने',
    ],
    tags: ['math', 'grade8', 'whole-numbers', 'binary', 'quinary', 'decimal', 'number-systems'],
  },
  {
    code: 'SIM-MATH-G8-U2-02',
    key: 'class8-math-u2-binary-quinary-conversion',
    chapterNumber: 2,
    chapterName: 'Whole Numbers',
    chapterNameNepali: 'पूर्ण सङ्ख्याहरू',
    title: 'Binary and Quinary Conversion Lab',
    titleNepali: 'द्विआधार र पञ्चआधार रूपान्तरण प्रयोगशाला',
    description: 'Perform exact repeated division conversions from decimal to binary and quinary, expanded-form conversion back to decimal, and cross-base conversion using the decimal bridge.',
    descriptionNepali: '२ र ५ ले लगातार भाग विधि प्रयोग गरी दशमलवबाट द्विआधार र पञ्चआधारमा, विस्तारित रूपबाट दशमलवमा तथा दशमलव पुल प्रयोग गरी आपसमा रूपान्तरण गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Convert decimal numbers to binary using repeated division by 2 and reading remainders from bottom to top',
      'Convert decimal numbers to quinary using repeated division by 5',
      'Convert binary and quinary numbers to decimal using powers expansion',
      'Convert binary directly to quinary by using the decimal intermediate system',
    ],
    learningObjectivesNepali: [
      '२ ले लगातार भाग गरेर शेषहरू तलबाट माथि क्रममा लेख्दै द्विआधारमा रूपान्तरण गर्ने',
      '५ ले लगातार भाग गरेर पञ्चआधारमा रूपान्तरण गर्ने',
      'विस्तारित रूप प्रयोग गरेर द्विआधार र पञ्चआधारलाई दशमलवमा बदल्ने',
      'दशमलवलाई पुल बनाएर द्विआधारबाट पञ्चआधारमा रूपान्तरण गर्ने',
    ],
    tags: ['math', 'grade8', 'conversions', 'binary', 'quinary', 'repeated-division', 'expanded-form'],
  },

  // ── UNIT 3: RATIONAL AND IRRATIONAL NUMBERS (परिमेय र अपरिमेय सङ्ख्याहरू) ──
  {
    code: 'SIM-MATH-G8-U3-01',
    key: 'class8-math-u3-number-classification',
    chapterNumber: 3,
    chapterName: 'Rational and Irrational Numbers',
    chapterNameNepali: 'परिमेय र अपरिमेय सङ्ख्याहरू',
    title: 'Rational and Irrational Classification Lab',
    titleNepali: 'परिमेय र अपरिमेय सङ्ख्या वर्गीकरण प्रयोगशाला',
    description: 'Discover rational numbers (a/b), irrational numbers (surds), terminating, non-terminating recurring, and non-terminating non-recurring decimals with interactive Venn diagrams N ⊆ W ⊆ Z ⊆ Q ⊆ R.',
    descriptionNepali: 'परिमेय (a/b) र अपरिमेय (√२, √३) सङ्ख्याहरू, दशमलवका तीन प्रकारहरू र N ⊆ W ⊆ Z ⊆ Q ⊆ R भेनचित्र सम्बन्ध वर्गीकरण गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Define and identify rational numbers in the form a/b where b ≠ 0',
      'Distinguish terminating and recurring decimals (rational) from non-terminating non-recurring decimals (irrational)',
      'Analyze the nested subset hierarchy of number sets and disjoint properties of rational and irrational sets in real numbers',
    ],
    learningObjectivesNepali: [
      'दुई पूर्णाङ्कको अनुपात a/b (जहाँ b ≠ ०) का रूपमा परिमेय सङ्ख्या पहिचान गर्ने',
      'समाप्त हुने, दोहोरिने (परिमेय) र समाप्त नहुने नदोहोरिने (अपरिमेय) दशमलव छुट्याउने',
      'सङ्ख्या समूहहरूको उपसमूह सम्बन्ध N ⊆ W ⊆ Z ⊆ Q ⊆ R र भेनचित्र विश्लेषण गर्ने',
    ],
    tags: ['math', 'grade8', 'rational-numbers', 'irrational-numbers', 'real-numbers', 'classification'],
  },
  {
    code: 'SIM-MATH-G8-U3-02',
    key: 'class8-math-u3-irrational-number-line',
    chapterNumber: 3,
    chapterName: 'Rational and Irrational Numbers',
    chapterNameNepali: 'परिमेय र अपरिमेय सङ्ख्याहरू',
    title: 'Irrational Numbers on the Number Line Lab',
    titleNepali: 'सङ्ख्या रेखामा अपरिमेय सङ्ख्या निर्माण प्रयोगशाला',
    description: 'Construct exact geometric locations of √2, √3, and √5 on the number line using right-angled triangles, Pythagoras theorem, and compass arc transfers.',
    descriptionNepali: 'पाइथागोरस साध्यबाट समकोण त्रिभुजको कर्ण निकाली कम्पासको चापद्वारा सङ्ख्या रेखामा √२, √३ र √५ को स्थान निर्माण गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Construct √2, √3, and √5 geometrically on the number line using Pythagoras theorem',
      'Use a virtual compass to transfer hypotenuse length accurately to the horizontal axis',
      'Understand that decimal values (e.g. 1.4142...) are approximations, while points on the number line represent exact radicals',
    ],
    learningObjectivesNepali: [
      'पाइथागोरस साध्य प्रयोग गरी सङ्ख्या रेखामा √२, √३ र √५ को ज्यामितीय रचना गर्ने',
      'कम्पासको सहायताले कर्णको लम्बाइ सङ्ख्या रेखामा स्थानान्तरण गर्ने',
      'दशमलव मान निकटीकरण हो र सङ्ख्या रेखाको बिन्दु नै ठ्याक्कै मान हो भनी बुझ्ने',
    ],
    tags: ['math', 'grade8', 'number-line', 'pythagoras', 'irrational-numbers', 'compass-construction'],
  },
  {
    code: 'SIM-MATH-G8-U3-03',
    key: 'class8-math-u3-recurring-decimal-fraction',
    chapterNumber: 3,
    chapterName: 'Rational and Irrational Numbers',
    chapterNameNepali: 'परिमेय र अपरिमेय सङ्ख्याहरू',
    title: 'Recurring Decimal to Fraction Studio',
    titleNepali: 'दोहोरिने दशमलवलाई भिन्नमा रूपान्तरण स्टुडियो',
    description: 'Convert non-terminating recurring decimals (0.333..., 0.4141..., 0.666...) into rational fractions a/b algebraically using powers of 10 multiplication and equation subtraction.',
    descriptionNepali: 'दोहोरिने दशमलवहरूलाई १० को घातले गुणन गरी समीकरण घटाउने बीजगणितीय विधिबाट सरल भिन्न a/b मा रूपान्तरण गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Set up algebraic equations for recurring decimals with repeating blocks of 1, 2, or more digits',
      'Multiply equations by suitable powers of 10 (10, 100, 1000) and subtract to eliminate the recurring tail',
      'Simplify resulting rational fractions to lowest terms using GCD reduction',
    ],
    learningObjectivesNepali: [
      'दोहोरिने दशमलवका लागि बीजगणितीय समीकरण स्थापना गर्ने',
      '१० वा १०० ले गुणन गरी समीकरण घटाएर दोहोरिने भाग हटाउने',
      'म.स. ले भाग गरी भिन्नलाई न्यूनतम पदमा सरलीकरण गर्ने',
    ],
    tags: ['math', 'grade8', 'recurring-decimals', 'fractions', 'algebra', 'rational-numbers'],
  },
  {
    code: 'SIM-MATH-G8-U3-04',
    key: 'class8-math-u3-scientific-notation-explorer',
    chapterNumber: 3,
    chapterName: 'Rational and Irrational Numbers',
    chapterNameNepali: 'परिमेय र अपरिमेय सङ्ख्याहरू',
    title: 'Scientific Notation Explorer',
    titleNepali: 'वैज्ञानिक सङ्केतन अन्वेषक',
    description: 'Learn standard scientific notation a × 10ⁿ (1 ≤ |a| < 10) by moving decimal points, exploring CDC textbook planetary distances table, and inspecting tiny atomic quantities.',
    descriptionNepali: 'दशमलव बिन्दु सारेर सङ्ख्यालाई a × १०ⁿ रूपमा वैज्ञानिक सङ्केतन गर्ने, पाठ्यपुस्तकको ग्रहहरूको दुरी तालिका र अति साना परिमाणहरू अन्वेषण गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Express large and small numbers in standard normalized scientific notation a × 10ⁿ (1 ≤ |a| < 10)',
      'Relate moving decimal point left to positive powers and right to negative powers of 10',
      'Examine real-world planetary distances and atomic masses in scientific notation',
    ],
    learningObjectivesNepali: [
      'अति ठूला र साना सङ्ख्याहरूलाई a × १०ⁿ (१ ≤ |a| < १०) वैज्ञानिक सङ्केतनमा लेख्ने',
      'दशमलव बिन्दु बायाँ सार्दा धनात्मक र दायाँ सार्दा ऋणात्मक घात हुने नियम बुझ्ने',
      'पाठ्यपुस्तकका सौर्यमण्डलका ग्रहहरूको दुरी वैज्ञानिक सङ्केतनमा अध्ययन गर्ने',
    ],
    tags: ['math', 'grade8', 'scientific-notation', 'powers-of-10', 'planets', 'exponents'],
  },
  {
    code: 'SIM-MATH-G8-U3-05',
    key: 'class8-math-u3-scientific-notation-calc',
    chapterNumber: 3,
    chapterName: 'Rational and Irrational Numbers',
    chapterNameNepali: 'परिमेय र अपरिमेय सङ्ख्याहरू',
    title: 'Scientific Notation Calculation Lab',
    titleNepali: 'वैज्ञानिक सङ्केतन गणना प्रयोगशाला',
    description: 'Perform step-by-step addition, subtraction, multiplication, and division of numbers in scientific notation, ensuring normalized results and solving real-world word problems.',
    descriptionNepali: 'वैज्ञानिक सङ्केतनमा रहेका सङ्ख्याहरूको जोड, घटाउ, गुणन र भाग गर्ने नियमहरू सिक्ने र व्यावहारिक शाब्दिक समस्याहरू समाधान गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Add and subtract scientific notation terms by converting them to a common power of 10',
      'Multiply terms by multiplying coefficients and adding exponents (10ᵃ × 10ᵇ = 10ᵃ⁺ᵇ)',
      'Divide terms by dividing coefficients and subtracting exponents (10ᵃ ÷ 10ᵇ = 10ᵃ⁻ᵇ)',
      'Normalize the final result so the coefficient satisfies 1 ≤ |a| < 10',
    ],
    learningObjectivesNepali: [
      'समान घाताङ्कमा रूपान्तरण गरी वैज्ञानिक सङ्केतनका सङ्ख्याहरू जोड्ने र घटाउने',
      'गुणांक गुणन गरी १० का घातहरू जोड्ने (गुणन नियम)',
      'गुणांक भाग गरी १० का घातहरू घटाउने (भाग नियम)',
      'अन्तिम नतिजालाई प्रमाणित वैज्ञानिक स्वरूपमा सामान्यीकरण गर्ने',
    ],
    tags: ['math', 'grade8', 'scientific-notation', 'operations', 'exponents', 'word-problems'],
  },

  // ── UNIT 4: RATIO AND PROPORTION (अनुपात र समानुपात) ──────────────────
  {
    code: 'SIM-MATH-G8-U4-01',
    key: 'class8-math-u4-ratio-discovery',
    chapterNumber: 4,
    chapterName: 'Ratio and Proportion',
    chapterNameNepali: 'अनुपात र समानुपात',
    title: 'Ratio Discovery and Comparison Playground',
    titleNepali: 'अनुपात खोजी र तुलना खेलमैदान',
    description: 'Understand ratio as a comparison of quantities by division, observe the importance of order (a:b ≠ b:a), convert quantities to same units, and simplify ratios using HCF.',
    descriptionNepali: 'भागफलद्वारा परिमाणहरूको तुलना, अनुपातमा क्रमको महत्त्व, समान एकाइमा रूपान्तरण (ग्राम, समय, पैसा) र म.स. ले भाग गरी सरलीकरण गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand the mathematical concept and notation of ratio (a:b = a/b)',
      'Recognize that ratio order matters (a:b ≠ b:a)',
      'Convert different units (kg to g, hours to minutes, rupees to paisa) before forming ratios',
      'Simplify ratios by dividing terms by their Highest Common Factor',
    ],
    learningObjectivesNepali: [
      'अनुपातको गणितीय अवधारणा र संकेत (a:b) बुझ्ने',
      'अनुपातमा पदहरूको क्रमको महत्त्व बुझ्ने (a:b ≠ b:a)',
      'अनुपात निकाल्नुअघि परिमाणहरूलाई एउटै एकाइमा रूपान्तरण गर्ने',
      'म.स. ले भाग गरेर अनुपातलाई सरल रूपमा लैजाने',
    ],
    tags: ['math', 'grade8', 'ratio', 'unit-conversion', 'simplification', 'comparison'],
  },
  {
    code: 'SIM-MATH-G8-U4-02',
    key: 'class8-math-u4-ratio-sharing-solver',
    chapterNumber: 4,
    chapterName: 'Ratio and Proportion',
    chapterNameNepali: 'अनुपात र समानुपात',
    title: 'Ratio Sharing and Real-Life Problem Solver',
    titleNepali: 'अनुपात बाँडफाँड र व्यावहारिक समस्या समाधान',
    description: 'Solve textbook real-life problems including dividing money in a ratio, business investments, age progression equations, and three-part ratio sharing (3:4:5).',
    descriptionNepali: 'रकम बाँडफाँड, व्यापार लगानी (मोहम्मद र अब्दुल), उमेर सम्बन्धी समीकरण (बिशाल र धनियाँ) र तीन पदको अनुपातमा आम्दानी बाँडफाँड हल गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Divide a given quantity among parties according to a ratio by finding the value of one part',
      'Solve business partnership and investment problems using ratios',
      'Set up and solve algebraic linear equations for future age ratios',
      'Distribute quantities across three-part ratios (a:b:c) using sum of all parts',
    ],
    learningObjectivesNepali: [
      'जम्मा भाग निकालेर १ भागको मान पत्ता लगाई रकम बाँडफाँड गर्ने',
      'व्यापार लगानी र साझेदारीका समस्याहरू अनुपातबाट समाधान गर्ने',
      'उमेर सम्बन्धी शाब्दिक समस्याहरूलाई रैखिक समीकरण बनाएर हल गर्ने',
      'तीन पद भएको अनुपातमा परिमाण बाँड्ने विधि प्रयोग गर्ने',
    ],
    tags: ['math', 'grade8', 'ratio-sharing', 'investments', 'age-problems', 'three-part-ratio'],
  },
  {
    code: 'SIM-MATH-G8-U4-03',
    key: 'class8-math-u4-proportion-unknown-value',
    chapterNumber: 4,
    chapterName: 'Ratio and Proportion',
    chapterNameNepali: 'अनुपात र समानुपात',
    title: 'Proportion and Unknown Value Lab',
    titleNepali: 'समानुपात र अज्ञात मान प्रयोगशाला',
    description: 'Explore paper-folding ratio equivalence, master the property Product of Extremes = Product of Means (a × d = b × c), find unknown terms, and solve direct proportion word problems.',
    descriptionNepali: 'कागज पट्याएर समतुल्य अनुपात, अन्तिम पद र मध्य पद गुणनफल नियम (a × d = b × c), अज्ञात पद x पत्ता लगाउने र प्रत्यक्ष समानुपात समस्या हल गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand proportion as an equality between two ratios (a:b = c:d)',
      'Apply the property Product of Extremes = Product of Means (a × d = b × c)',
      'Solve for unknown terms in proportions using cross multiplication',
      'Determine numbers to be added or subtracted to achieve a desired ratio',
      'Solve direct proportion problems relating price and quantity',
    ],
    learningObjectivesNepali: [
      'दुईवटा बराबर अनुपातहरू मिलेर समानुपात बन्दछ भनी बुझ्ने',
      'अन्तिम पदहरूको गुणनफल = मध्य पदहरूको गुणनफल नियम प्रयोग गर्ने',
      'बज्र गुणन विधिद्वारा समानुपातमा अज्ञात पद पत्ता लगाउने',
      'इच्छित अनुपात प्राप्त गर्न जोड्नुपर्ने सङ्ख्या पत्ता लगाउने',
      'मूल्य र परिमाण सम्बन्धी प्रत्यक्ष समानुपातका समस्याहरू हल गर्ने',
    ],
    tags: ['math', 'grade8', 'proportion', 'means-and-extremes', 'cross-multiplication', 'direct-proportion'],
  },
];

async function seed() {
  console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected successfully.');

  let inserted = 0;
  let updated = 0;

  for (const s of CLASS8_U2_U3_U4_SIMS) {
    const doc = {
      code: s.code,
      title: s.title,
      titleNepali: s.titleNepali,
      description: s.description,
      descriptionNepali: s.descriptionNepali,
      subjectCode: 'MATH-G8',
      subjectName: 'Mathematics',
      gradeLevels: [8],
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

  console.log(`\nDone! Inserted: ${inserted}, Updated: ${updated}. Total: ${CLASS8_U2_U3_U4_SIMS.length}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

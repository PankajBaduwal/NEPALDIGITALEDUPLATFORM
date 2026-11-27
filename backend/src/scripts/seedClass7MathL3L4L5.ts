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

const CLASS7_L3_L4_L5_SIMS = [
  // ── LESSON 3: INTEGER ─────────────────────────────────────
  {
    code: 'SIM-MATH-G7-L3-01',
    key: 'class7-math-l3-number-line',
    chapterNumber: 3,
    chapterName: 'Integer',
    chapterNameNepali: 'पूर्णाङ्क',
    title: 'Integer Number Line Adventure',
    titleNepali: 'पूर्णाङ्क सङ्ख्यारेखा यात्रा',
    description: 'Explore positive and negative integers, origin zero, left and right movements, opposite integers, distance from zero, and absolute value on a 2D number line.',
    descriptionNepali: 'सङ्ख्या रेखामा धनात्मक र ऋणात्मक पूर्णाङ्क, विपरीत सङ्ख्या, शून्यबाट दुरी र निरपेक्ष मान बुझ्ने २D प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Understand positive and negative integers', 'Move left and right on number line', 'Find opposite integers and absolute value'],
    learningObjectivesNepali: ['धनात्मक र ऋणात्मक पूर्णाङ्क पहिचान गर्ने', 'सङ्ख्या रेखामा दायाँ-बायाँ चाल बुझ्ने', 'विपरीत पूर्णाङ्क र निरपेक्ष मान निकाल्ने'],
    tags: ['math', 'grade7', 'integer', 'number-line', 'absolute-value'],
  },
  {
    code: 'SIM-MATH-G7-L3-02',
    key: 'class7-math-l3-add-sub',
    chapterNumber: 3,
    chapterName: 'Integer',
    chapterNameNepali: 'पूर्णाङ्क',
    title: 'Integer Addition & Subtraction Lab',
    titleNepali: 'पूर्णाङ्कको जोड र घटाउ प्रयोगशाला',
    description: 'Master integer addition and subtraction using positive/negative counters cancellation model, number line displacement, and real-life East/West bus park displacement.',
    descriptionNepali: 'धनात्मक र ऋणात्मक कार्ड जोडी रद्द विधि, सङ्ख्यारेखा चाल र बसपार्क पूर्व/पश्चिम विस्थापनबाट जोड-घटाउ सिक्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Add and subtract integers using counter cancellation', 'Perform addition and subtraction on a number line', 'Understand closure, commutative, associative and additive inverse properties'],
    learningObjectivesNepali: ['कार्ड जोडी रद्द गरी पूर्णाङ्कको जोड-घटाउ गर्ने', 'सङ्ख्या रेखामा जोड-घटाउ देखाउने', 'जोडका संवृत, क्रमविनिमेय, साहचर्य र प्रतिलोम गुण बुझ्ने'],
    tags: ['math', 'grade7', 'integer', 'addition', 'subtraction', 'properties'],
  },
  {
    code: 'SIM-MATH-G7-L3-03',
    key: 'class7-math-l3-mul-div',
    chapterNumber: 3,
    chapterName: 'Integer',
    chapterNameNepali: 'पूर्णाङ्क',
    title: 'Integer Multiplication & Division Studio',
    titleNepali: 'पूर्णाङ्कको गुणन र भाग प्रयोगशाला',
    description: 'Discover multiplication and division sign rules (+ × + = +, - × - = +, + × - = -), repeated movement on number line, distributive property a(b+c), and fact families.',
    descriptionNepali: 'पूर्णाङ्कको गुणन र भागका चिन्ह नियमहरू, सङ्ख्या रेखामा दोहोरिएको चाल, वितरण नियम र तथ्य परिवार सिक्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Discover integer multiplication sign rules', 'Understand distributive property a(b+c) = ab + ac', 'Relate multiplication and division fact families'],
    learningObjectivesNepali: ['गुणन र भागका चिन्ह नियमहरू पत्ता लगाउने', 'वितरण नियम प्रयोग गर्ने', 'गुणन र भागको तथ्य सम्बन्ध बुझ्ने'],
    tags: ['math', 'grade7', 'integer', 'multiplication', 'division', 'distributive-property'],
  },
  {
    code: 'SIM-MATH-G7-L3-04',
    key: 'class7-math-l3-applications',
    chapterNumber: 3,
    chapterName: 'Integer',
    chapterNameNepali: 'पूर्णाङ्क',
    title: 'Integer Application & Simplification',
    titleNepali: 'पूर्णाङ्कको व्यवहारिक प्रयोग र सरलीकरण',
    description: 'Apply integers to solve real-life quiz contest scoring (+5 / -2), bank ledger transactions, water tank filling/draining, and BODMAS integer simplification.',
    descriptionNepali: 'हाजिरीजवाफ अंक गणना, बैंक मौज्दात, पानी ट्यांकीको प्रवाह र कोष्ठकयुक्त पूर्णाङ्कको सरलीकरण गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Calculate quiz scores with positive and negative marks', 'Track bank account balances with deposits and debits', 'Simplify multi-bracket integer expressions using BODMAS'],
    learningObjectivesNepali: ['धनात्मक र ऋणात्मक अंक भएको हाजिरीजवाफ हिसाब गर्ने', 'बैंक कारोबार हिसाब गर्ने', 'कोष्ठक र चिन्ह मिलाएर सरलीकरण गर्ने'],
    tags: ['math', 'grade7', 'integer', 'word-problems', 'bodmas', 'simplification'],
  },

  // ── LESSON 4: RATIONAL NUMBER ─────────────────────────────
  {
    code: 'SIM-MATH-G7-L4-01',
    key: 'class7-math-l4-discovery',
    chapterNumber: 4,
    chapterName: 'Rational Number',
    chapterNameNepali: 'परिमेय सङ्ख्या',
    title: 'Rational Number Discovery Lab',
    titleNepali: 'परिमेय सङ्ख्या खोजी प्रयोगशाला',
    description: 'Explore why rational numbers Q are needed (integer division closure failure), rational builder a/b (b ≠ 0), and nested number systems (N ⊂ W ⊂ Z ⊂ Q).',
    descriptionNepali: 'परिमेय सङ्ख्या किन चाहिन्छ, a/b रूपमा निर्माणशाला, र सङ्ख्या प्रणालीहरूको समावेशी सम्बन्ध (N ⊂ W ⊂ Z ⊂ Q) सिक्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Understand the definition of rational numbers a/b with b ≠ 0', 'Explain why denominator cannot be zero', 'Explore nested inclusion of number sets N ⊂ W ⊂ Z ⊂ Q'],
    learningObjectivesNepali: ['परिमेय सङ्ख्या a/b को अवधारणा बुझ्ने', 'हर शून्य हुन नसक्ने कारण व्याख्या गर्ने', 'सङ्ख्या प्रणालीहरूको सम्बन्ध बुझ्ने'],
    tags: ['math', 'grade7', 'rational-number', 'fractions', 'number-systems'],
  },
  {
    code: 'SIM-MATH-G7-L4-02',
    key: 'class7-math-l4-properties',
    chapterNumber: 4,
    chapterName: 'Rational Number',
    chapterNameNepali: 'परिमेय सङ्ख्या',
    title: 'Rational Number Properties Lab',
    titleNepali: 'परिमेय सङ्ख्याका गुणहरू प्रयोगशाला',
    description: 'Explore the 5 core properties of rational numbers: identity (0 and 1), inverses (+ and reciprocal), commutative, associative, and closure under operations.',
    descriptionNepali: 'परिमेय सङ्ख्याका ५ मुख्य गुणहरू: तत्समक, प्रतिलोम, क्रमविनिमेय, साहचर्य र संवृत गुण सिक्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Apply additive and multiplicative identity properties', 'Find additive and multiplicative inverses (reciprocals)', 'Verify commutative, associative, and closure properties'],
    learningObjectivesNepali: ['जोड र गुणनका तत्समक गुण प्रयोग गर्ने', 'जोड प्रतिलोम र गुणन प्रतिलोम पत्ता लगाउने', 'क्रमविनिमेय र साहचर्य गुण प्रमाणीकरण गर्ने'],
    tags: ['math', 'grade7', 'rational-number', 'properties', 'inverses'],
  },
  {
    code: 'SIM-MATH-G7-L4-03',
    key: 'class7-math-l4-conversion',
    chapterNumber: 4,
    chapterName: 'Rational Number',
    chapterNameNepali: 'परिमेय सङ्ख्या',
    title: 'Fraction & Decimal Conversion Studio',
    titleNepali: 'भिन्न र दशमलव रूपान्तरण प्रयोगशाला',
    description: 'Convert fractions to terminating or non-terminating recurring decimals, convert recurring decimals to fractions using 10x - x, and find intermediate rational numbers via average.',
    descriptionNepali: 'भिन्नलाई सान्त वा दोहोरिने दशमलवमा बदल्ने, १०x - x विधिबाट भिन्नमा रूपान्तरण गर्ने र बीचको परिमेय सङ्ख्या निकाल्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Classify terminating and non-terminating recurring decimals', 'Convert recurring decimals to fractions algebraically', 'Find rational numbers midway between two given numbers using average method'],
    learningObjectivesNepali: ['सान्त र दोहोरिने दशमलव वर्गीकरण गर्ने', 'दोहोरिने दशमलवलाई भिन्नमा बदल्ने', 'औसत विधिबाट दुई परिमेय सङ्ख्याको बीचको सङ्ख्या निकाल्ने'],
    tags: ['math', 'grade7', 'rational-number', 'recurring-decimal', 'terminating-decimal', 'average-method'],
  },

  // ── LESSON 5: FRACTION AND DECIMAL ────────────────────────
  {
    code: 'SIM-MATH-G7-L5-01',
    key: 'class7-math-l5-fraction-vis',
    chapterNumber: 5,
    chapterName: 'Fraction and Decimal',
    chapterNameNepali: 'भिन्न र दशमलव',
    title: 'Fraction Visualization & Simplification',
    titleNepali: 'भिन्नको दृश्यावलोकन र सरलीकरण प्रयोगशाला',
    description: 'Explore interactive fraction bars, equivalent fractions (1/2 = 2/4 = 3/6), simplification using HCF, common denominator conversion, and cake sharing portion comparison.',
    descriptionNepali: 'इन्टरएक्टिभ भिन्न पट्टी, तुल्य भिन्न, म.स. बाट सरलीकरण, समान हर बनाएर जोडघटाउ र केक बाँडफाँड तुलना गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Visualize fractions as parts of a whole', 'Identify equivalent fractions', 'Simplify fractions to lowest terms using HCF', 'Compare fractions using common denominators'],
    learningObjectivesNepali: ['सिङ्गो वस्तुको भागका रूपमा भिन्न बुझ्ने', 'तुल्य भिन्न पहिचान गर्ने', 'म.स. ले भाग गरी सरलतम रूपमा ल्याउने', 'समान हर बनाई भिन्न तुलना गर्ने'],
    tags: ['math', 'grade7', 'fraction', 'simplification', 'equivalent-fractions', 'cake-sharing'],
  },
  {
    code: 'SIM-MATH-G7-L5-02',
    key: 'class7-math-l5-word-problems',
    chapterNumber: 5,
    chapterName: 'Fraction and Decimal',
    chapterNameNepali: 'भिन्न र दशमलव',
    title: 'Fraction of a Quantity & Word Problems',
    titleNepali: 'परिमाणको भिन्न र व्यवहारिक समस्या समाधान',
    description: 'Solve textbook real-life problems: Sirjana Rs 24,000 monthly income and expenditure, classroom 48 students bar model (2/3 boys), remaining fractions, and school timetable time share.',
    descriptionNepali: 'सिर्जनाको आम्दानी र खर्च, कक्षाका ४८ विद्यार्थीको बार मोडल, बाँकीको भिन्न र विद्यालय समय परियोजना कार्य समाधान गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Calculate fraction of a given quantity', 'Use bar model drawing method to solve ratio problems', 'Distinguish between fraction of total vs fraction of remaining amount'],
    learningObjectivesNepali: ['दिइएको परिमाणको भिन्न हिसाब गर्ने', 'बार मोडलबाट छात्र-छात्रा समस्या समाधान गर्ने', 'सुरुको र बाँकीको भिन्न बीचको फरक बुझ्ने'],
    tags: ['math', 'grade7', 'fraction', 'word-problems', 'bar-model', 'income-expense'],
  },
  {
    code: 'SIM-MATH-G7-L5-03',
    key: 'class7-math-l5-decimal-calc',
    chapterNumber: 5,
    chapterName: 'Fraction and Decimal',
    chapterNameNepali: 'भिन्न र दशमलव',
    title: 'Decimal Calculation & Simplification',
    titleNepali: 'दशमलव गणना र सरलीकरण प्रयोगशाला',
    description: 'Master decimal alignment in vertical addition/subtraction, decimal multiplication place counting, divisor decimal shift in division, and multi-bracket BODMAS simplification.',
    descriptionNepali: 'दशमलव बिन्दु ठाडो संरेखण, गुणनमा स्थान गणना, भागमा भाजक सार्ने र सानो-मझौला कोष्ठकयुक्त सरलीकरण प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Align decimal points correctly in addition and subtraction', 'Multiply decimals and count total decimal places', 'Perform decimal division by shifting divisor decimal', 'Simplify nested bracket expressions in correct order'],
    learningObjectivesNepali: ['दशमलव बिन्दु मिलाएर जोड-घटाउ गर्ने', 'दशमलव गुणनमा स्थान गणना गर्ने', 'दशमलव भाग विधि सिक्ने', 'कोष्ठकको नियम अनुसार सरलीकरण गर्ने'],
    tags: ['math', 'grade7', 'decimal', 'multiplication', 'division', 'bracket-simplification'],
  },
  {
    code: 'SIM-MATH-G7-L5-04',
    key: 'class7-math-l5-geometry-lab',
    chapterNumber: 5,
    chapterName: 'Fraction and Decimal',
    chapterNameNepali: 'भिन्न र दशमलव',
    title: 'Decimal Measurement & Geometry Lab',
    titleNepali: 'दशमलव नाप र ज्यामिति प्रयोगशाला',
    description: 'Apply decimals to geometry and measurements: rectangular table perimeter, square table sides, 3D rectangular garden view, field area to breadth division, and foreign currency exchange spreads.',
    descriptionNepali: 'आयताकार र वर्गाकार टेबलको परिमिति, ३D बगैँचा दृश्य, खेतको क्षेत्रफलबाट चौडाइ र विदेशी मुद्रा सटही अन्तर हिसाब गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Calculate perimeter and area using decimal dimensions', 'Find missing side length from perimeter and area', 'Explore 3D geometry visualizations with decimal dimensions', 'Calculate foreign currency exchange spread and difference'],
    learningObjectivesNepali: ['दशमलव नाप प्रयोग गरी परिमिति र क्षेत्रफल निकाल्ने', 'क्षेत्रफलबाट चौडाइ निकाल्ने', '३D ज्यामितीय मोडल अन्वेषण गर्ने', 'विदेशी मुद्रा खरिद-बिक्री दरको अन्तर हिसाब गर्ने'],
    tags: ['math', 'grade7', 'decimal', 'measurement', 'geometry', 'perimeter', 'area', '3d', 'currency'],
  },
];

async function seedClass7MathL3L4L5() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected successfully!');

    for (const item of CLASS7_L3_L4_L5_SIMS) {
      const doc = {
        code: item.code,
        title: item.title,
        titleNepali: item.titleNepali,
        description: item.description,
        descriptionNepali: item.descriptionNepali,
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [7],
        chapterNumber: item.chapterNumber,
        chapterName: item.chapterName,
        chapterNameNepali: item.chapterNameNepali,
        simulationType: item.simulationType,
        componentKey: item.key,
        difficulty: 'INTERMEDIATE',
        estimatedDurationMinutes: 15,
        learningObjectives: item.learningObjectives,
        learningObjectivesNepali: item.learningObjectivesNepali,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: item.tags,
      };

      await Simulation.findOneAndUpdate({ code: item.code }, doc, { upsert: true, returnDocument: 'after' });
      console.log(`✓ Seeded Grade 7 Lesson ${item.chapterNumber} simulation: [${item.code}] ${item.title}`);
    }

    console.log('All 11 Grade 7 Lessons 3, 4, 5 simulations successfully registered in MongoDB!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Class 7 Lessons 3, 4, 5 simulations:', err);
    process.exit(1);
  }
}

seedClass7MathL3L4L5();

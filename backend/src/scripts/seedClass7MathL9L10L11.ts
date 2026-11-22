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

const CLASS7_L9_L10_L11_SIMS = [
  // ── LESSON 9: PERIMETER, AREA AND VOLUME ─────────────────────────
  {
    code: 'SIM-MATH-G7-L9-01',
    key: 'class7-math-l9-perimeter-triangle',
    chapterNumber: 9,
    chapterName: 'Perimeter, Area and Volume',
    chapterNameNepali: 'परिमिति, क्षेत्रफल र आयतन',
    title: 'Perimeter and Triangle Explorer',
    titleNepali: 'परिमिति र त्रिभुज अन्वेषक',
    description: 'Explore triangle perimeter (P = a + b + c), find unknown sides from total perimeter, and calculate multi-round fencing wire length and total cost.',
    descriptionNepali: 'त्रिभुजको परिमिति (P = a + b + c), अज्ञात भुजा पत्ता लगाउने र खेतको काँडेतार घेराबन्दी लम्बाइ तथा खर्च हिसाब गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Understand triangle perimeter as the sum of three sides', 'Find an unknown side from given perimeter', 'Calculate wire required for multiple fencing rounds and estimate total cost'],
    learningObjectivesNepali: ['तीन भुजाहरूको जोडबाट त्रिभुजको परिमिति निकाल्ने', 'परिमितिबाट अज्ञात भुजा पत्ता लगाउने', 'घेराबन्दीको तारको लम्बाइ र खर्च हिसाब गर्ने'],
    tags: ['math', 'grade7', 'perimeter', 'triangle', 'fencing', 'geometry'],
  },
  {
    code: 'SIM-MATH-G7-L9-02',
    key: 'class7-math-l9-surface-area',
    chapterNumber: 9,
    chapterName: 'Perimeter, Area and Volume',
    chapterNameNepali: 'परिमिति, क्षेत्रफल र आयतन',
    title: 'Cuboid and Cube Surface Area Lab',
    titleNepali: 'घनाभ र घनको पृष्ठीय क्षेत्रफल प्रयोगशाला',
    description: 'Derive total surface area of cuboid (TSA = 2(lb + bh + lh)) and cube (TSA = 6a²) through 3D isometric representation and 2D net unfolding.',
    descriptionNepali: 'घनाभको ६ आयताकार सतहहरू (TSA = २(lb + bh + lh)) र घनको ६ वर्गाकार सतहहरू (TSA = ६a²) २D जाली खोलेर बुझ्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Identify 6 faces of cuboids and cubes', 'Derive cuboid surface area formula TSA = 2(lb + bh + lh)', 'Calculate cube surface area TSA = 6a²', 'Unfold solids into 2D nets'],
    learningObjectivesNepali: ['घनाभ र घनका ६ वटा सतहहरू पहिचान गर्ने', 'घनाभको कुल पृष्ठीय क्षेत्रफल सुत्र बुझ्ने', 'घनको कुल पृष्ठीय क्षेत्रफल निकाल्ने', 'ठोस वस्तुको २D जाली खोलेर हेर्ने'],
    tags: ['math', 'grade7', 'surface-area', 'cuboid', 'cube', '3d-net', 'geometry'],
  },
  {
    code: 'SIM-MATH-G7-L9-03',
    key: 'class7-math-l9-volume-capacity',
    chapterNumber: 9,
    chapterName: 'Perimeter, Area and Volume',
    chapterNameNepali: 'परिमिति, क्षेत्रफल र आयतन',
    title: 'Volume and Capacity Explorer',
    titleNepali: 'आयतन र धारकता अन्वेषक',
    description: 'Explore cuboid volume (V = l*b*h) and cube volume (V = a³), convert between cm³ and litres (1000 cm³ = 1 L), and find missing tank dimensions.',
    descriptionNepali: 'घनाभको आयतन (l × b × h), घनको आयतन (a³), लिटर र घन सेमी रूपान्तरण (१००० cm³ = १ लिटर) र पानी ट्याङ्कीको नाप हिसाब गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Calculate cuboid volume V = l * b * h', 'Calculate cube volume V = a³', 'Convert between cubic centimetres and litres', 'Determine unknown container dimensions from capacity'],
    learningObjectivesNepali: ['घनाभ र घनको आयतन निकाल्ने', 'घन सेन्टिमिटर र लिटर बीच रूपान्तरण गर्ने', 'ट्याङ्कीको क्षमताबाट अज्ञात चौडाइ पत्ता लगाउने'],
    tags: ['math', 'grade7', 'volume', 'capacity', 'litres', 'tank', 'cuboid', 'cube'],
  },
  {
    code: 'SIM-MATH-G7-L9-04',
    key: 'class7-math-l9-circle-circumference',
    chapterNumber: 9,
    chapterName: 'Perimeter, Area and Volume',
    chapterNameNepali: 'परिमिति, क्षेत्रफल र आयतन',
    title: 'Circle Circumference & Wheel Adventure',
    titleNepali: 'वृत्तको परिधि र पाङ्ग्रा यात्रा',
    description: 'Discover π = 22/7 via thread wrapping, calculate circumference C = 2πr = πd, and solve bicycle wheel rotation distance and radius problems.',
    descriptionNepali: 'सिक्कामा धागो बेरेर π को खोजी, वृत्तको परिधि (C = २πr = πd) र साइकलको पाङ्ग्राको चक्करबाट दुरी तथा अर्धव्यास निकाल्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Understand ratio of circumference to diameter as π', 'Calculate circumference using C = 2πr', 'Solve wheel rotation and distance problems'],
    learningObjectivesNepali: ['परिधि र व्यासको अनुपात π (३.१४ वा २२/७) बुझ्ने', 'C = २πr सूत्रबाट परिधि निकाल्ने', 'साइकलको पाङ्ग्राको चक्करबाट दुरी र अर्धव्यास निकाल्ने'],
    tags: ['math', 'grade7', 'circle', 'circumference', 'pi', 'wheel-rotations', 'radius'],
  },

  // ── LESSON 10: INDICES ───────────────────────────────────────────
  {
    code: 'SIM-MATH-G7-L10-01',
    key: 'class7-math-l10-indices-discovery',
    chapterNumber: 10,
    chapterName: 'Indices',
    chapterNameNepali: 'घाताङ्क',
    title: 'Indices Discovery and Expansion Lab',
    titleNepali: 'घाताङ्क खोजी र विस्तार प्रयोगशाला',
    description: 'Explore repeated multiplication to index notation, identify base and exponent in numerical and algebraic terms, and evaluate negative base powers.',
    descriptionNepali: 'बारम्बार गुणनबाट घाताङ्क निर्माण, आधार र घात पहिचान, तथा ऋणात्मक आधारको जोड र बिजोर घातको मान हिसाब गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Understand index notation as repeated multiplication', 'Identify base and power in expressions', 'Expand indices and calculate numerical values with positive and negative bases'],
    learningObjectivesNepali: ['बारम्बार गुणनलाई घाताङ्क रूपमा लेख्ने', 'आधार र घात छुट्याउने', 'धनात्मक र ऋणात्मक आधारको घाताङ्क विस्तार गरी मान निकाल्ने'],
    tags: ['math', 'grade7', 'indices', 'base', 'power', 'expansion', 'exponents'],
  },
  {
    code: 'SIM-MATH-G7-L10-02',
    key: 'class7-math-l10-indices-laws',
    chapterNumber: 10,
    chapterName: 'Indices',
    chapterNameNepali: 'घाताङ्क',
    title: 'Laws of Indices & Simplification Studio',
    titleNepali: 'घाताङ्कका नियमहरू र सरलीकरण प्रयोगशाला',
    description: 'Master the 3 core laws of indices: multiplication aᵐ * aⁿ = aᵐ⁺ⁿ, division aᵐ / aⁿ = aᵐ⁻ⁿ, and zero power a⁰ = 1 with multi-variable simplification.',
    descriptionNepali: 'घाताङ्कका ३ मुख्य नियमहरू: गुणन नियम (aᵐ × aⁿ = aᵐ⁺ⁿ), भाग नियम (aᵐ ÷ aⁿ = aᵐ⁻ⁿ), र शून्य घात नियम (a⁰ = १) प्रयोग गरी सरलीकरण गर्ने कार्यशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Apply multiplication law of indices', 'Apply division law of indices for non-zero base', 'Understand and prove zero power law a⁰ = 1', 'Simplify multi-variable algebraic expressions involving indices'],
    learningObjectivesNepali: ['घाताङ्कको गुणन नियम प्रयोग गर्ने', 'घाताङ्कको भाग नियम प्रयोग गर्ने', 'शून्य घात नियम a⁰ = १ प्रमाणित गर्ने', 'बहु-चल भएका घाताङ्कीय पदहरू सरल गर्ने'],
    tags: ['math', 'grade7', 'indices-laws', 'multiplication-law', 'division-law', 'zero-power', 'simplification'],
  },

  // ── LESSON 11: ALGEBRAIC EXPRESSION ──────────────────────────────
  {
    code: 'SIM-MATH-G7-L11-01',
    key: 'class7-math-l11-expression-discovery',
    chapterNumber: 11,
    chapterName: 'Algebraic Expression',
    chapterNameNepali: 'बीजगणितीय व्यञ्जक',
    title: 'Algebraic Expression Discovery Lab',
    titleNepali: 'बीजगणितीय व्यञ्जक खोजी प्रयोगशाला',
    description: 'Deconstruct expressions (3x + 9) into coefficients, variables, constants, and terms; classify like vs unlike terms; add like terms using visual algebra tiles.',
    descriptionNepali: 'व्यञ्जकका अङ्गहरू (चल, अचर, गुणांक र पद), सजातीय र विजातीय पदहरूको वर्गीकरण, तथा अल्जेब्रा टायलद्वारा पदहरूको जोड बुझ्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Identify variables, constants, coefficients, and terms', 'Distinguish like terms from unlike terms', 'Combine like terms using visual algebra tile models'],
    learningObjectivesNepali: ['चल, अचर, गुणांक र पदहरू पहिचान गर्ने', 'सजातीय र विजातीय पद छुट्याउने', 'अल्जेब्रा टायलबाट सजातीय पदहरू जोड्ने'],
    tags: ['math', 'grade7', 'algebra', 'expression', 'variable', 'constant', 'coefficient', 'like-terms'],
  },
  {
    code: 'SIM-MATH-G7-L11-02',
    key: 'class7-math-l11-ops-studio',
    chapterNumber: 11,
    chapterName: 'Algebraic Expression',
    chapterNameNepali: 'बीजगणितीय व्यञ्जक',
    title: 'Algebraic Add, Sub & Mul Studio',
    titleNepali: 'बीजगणितीय जोड, घटाउ र गुणन प्रयोगशाला',
    description: 'Perform algebraic operations: addition of expressions, subtraction with sign change rules, monomial multiplication (3x * 2x = 6x²), and binomial expansion using rectangular area models.',
    descriptionNepali: 'व्यञ्जकहरूको जोड, घटाउ (ब्र्याकेट खोल्दा चिन्ह परिवर्तन), एकपदीय गुणन, र द्विपदी गुणन (x+२)(x+३) आयताकार क्षेत्रफल मोडलबाट सिक्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Add algebraic expressions by grouping like terms', 'Subtract algebraic expressions with bracket sign changes', 'Multiply monomials and apply distributive law to binomial products'],
    learningObjectivesNepali: ['सजातीय पद मिलाएर व्यञ्जक जोड्ने', 'घटाउँदा ब्र्याकेटभित्रको चिन्ह परिवर्तन गरी घटाउने', 'एकपदीय र द्विपदी पदहरूको गुणन गर्ने'],
    tags: ['math', 'grade7', 'algebra-ops', 'addition', 'subtraction', 'multiplication', 'area-model'],
  },
  {
    code: 'SIM-MATH-G7-L11-03',
    key: 'class7-math-l11-division-lab',
    chapterNumber: 11,
    chapterName: 'Algebraic Expression',
    chapterNameNepali: 'बीजगणितीय व्यञ्जक',
    title: 'Algebraic Division and Long Division Lab',
    titleNepali: 'बीजगणितीय भाग र लामो भाग प्रयोगशाला',
    description: 'Master polynomial long division (2x² - 3x + 7) ÷ (2x - 1) step-by-step, exact division, verify Dividend = Divisor * Quotient + Remainder, and calculate rectangle length.',
    descriptionNepali: 'बहुपद लामो भाग विधि, निःशेष भाग, भाज्य = भाजक × भागफल + शेषफल प्रमाणीकरण र क्षेत्रफलबाट आयतको लम्बाइ पत्ता लगाउने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Divide monomials and polynomials using long division', 'Identify quotient, divisor, dividend, and remainder', 'Verify polynomial division formula', 'Apply division to find geometric rectangle dimensions'],
    learningObjectivesNepali: ['लामो भाग विधिबाट बहुपदको भाग गर्ने', 'भागफल र शेषफल निकाल्ने', 'भाज्य = भाजक × भागफल + शेषफल प्रमाणित गर्ने', 'क्षेत्रफल र चौडाइबाट आयतको लम्बाइ निकाल्ने'],
    tags: ['math', 'grade7', 'algebra-division', 'long-division', 'quotient', 'remainder', 'verification'],
  },
  {
    code: 'SIM-MATH-G7-L11-04',
    key: 'class7-math-l11-identities-geom',
    chapterNumber: 11,
    chapterName: 'Algebraic Expression',
    chapterNameNepali: 'बीजगणितीय व्यञ्जक',
    title: 'Geometrical Identities – (a + b)² and (a - b)²',
    titleNepali: 'ज्यामितीय सर्वसमिका – (a + b)² र (a - b)²',
    description: 'Geometrical square dissection proof of (a + b)² = a² + 2ab + b² and (a - b)² = a² - 2ab + b², plus mental numerical squaring (12², 88², 98², 999²).',
    descriptionNepali: 'वर्गको टुक्राबाट (a + b)² = a² + २ab + b² र (a - b)² = a² - २ab + b² ज्यामितीय प्रमाणीकरण तथा १२², ९८² जस्ता सङ्ख्याको सजिलो वर्ग निकाल्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Geometrically derive (a + b)² and (a - b)² using square area dissection', 'Compare geometric area models with algebraic expansion', 'Calculate numerical squares using identities'],
    learningObjectivesNepali: ['वर्गको क्षेत्रफल टुक्र्याएर सर्वसमिका प्रमाणित गर्ने', 'ज्यामितीय मोडल र बीजगणित तुलना गर्ने', 'सर्वसमिकाबाट ठूला सङ्ख्याहरूको वर्ग छिटो निकाल्ने'],
    tags: ['math', 'grade7', 'identities', 'geometric-proof', 'square-identities', 'numerical-squares'],
  },
  {
    code: 'SIM-MATH-G7-L11-05',
    key: 'class7-math-l11-identities-challenge',
    chapterNumber: 11,
    chapterName: 'Algebraic Expression',
    chapterNameNepali: 'बीजगणितीय व्यञ्जक',
    title: 'Algebraic Identities & Simplification Challenge',
    titleNepali: 'सर्वसमिका प्रयोग र सरलीकरण चुनौती',
    description: 'Simplify complex expressions (2a+b)² - (2a-b)², find a² + b² from given sum and product, expand trinomials (a+b+c)², and solve reciprocal identity x² + 1/x².',
    descriptionNepali: 'सर्वसमिकाबाट जटिल सरलीकरण, योगफल र गुणनफलबाट a² + b² निकाल्ने, (a+b+c)² विस्तार गर्ने र व्युत्क्रम पद x² + १/x² को मान पत्ता लगाउने कार्यशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: ['Simplify compound expressions using identities', 'Find a² + b² given (a + b) and ab', 'Solve reciprocal variable identities x² + 1/x²', 'Expand trinomial squares (a + b + c)²'],
    learningObjectivesNepali: ['सर्वसमिका प्रयोग गरी सरलीकरण गर्ने', 'योगफल र गुणनफलबाट a² + b² पत्ता लगाउने', 'व्युत्क्रम चल x² + १/x² को मान निकाल्ने', 'त्रिपदीय वर्ग (a + b + c)² विस्तार गर्ने'],
    tags: ['math', 'grade7', 'identities-challenge', 'simplification', 'trinomial-square', 'reciprocal-identity'],
  },
];

async function seedClass7MathL9L10L11() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected successfully!');

    for (const item of CLASS7_L9_L10_L11_SIMS) {
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

    console.log('All 11 Grade 7 Lessons 9, 10, 11 simulations successfully registered in MongoDB!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Class 7 Lessons 9, 10, 11 simulations:', err);
    process.exit(1);
  }
}

seedClass7MathL9L10L11();

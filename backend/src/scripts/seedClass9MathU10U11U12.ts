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

const CLASS9_U10_U11_U12_SIMS = [
  // ── UNIT 10: HIGHEST COMMON FACTOR AND LOWEST COMMON MULTIPLE (महत्तम समापवर्तक र लघुत्तम समापवर्त्य) ──
  {
    code: 'SIM-MATH-G9-U10-01',
    key: 'class9-math-u10-algebraic-factorization-explorer',
    chapterNumber: 10,
    chapterName: 'Highest Common Factor and Lowest Common Multiple',
    chapterNameNepali: 'महत्तम समापवर्तक र लघुत्तम समापवर्त्य',
    title: 'Algebraic Factorization Explorer',
    titleNepali: 'बीजीय खण्डीकरण अन्वेषक',
    description: 'Explore algebraic factorization techniques including common terms, difference of two squares (a² - b²), sum and difference of cubes (a³ ± b³), trinomial middle-term splitting, and fourth-degree expressions with step-by-step verification.',
    descriptionNepali: 'साझा पद लिने, दुई वर्गको अन्तर (a² - b²), घनको जोड र घटाउ (a³ ± b³), त्रिपदीय मध्यपद विभाजन र चौथो घातका अभिव्यक्तिहरूको चरणबद्ध बीजीय खण्डीकरण अन्वेषक।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Master factorization of common terms, differences of squares, and sum/difference of cubes',
      'Understand trinomial middle-term splitting and fourth-degree algebraic forms',
      'Verify factorization by expanding factors back to original algebraic expressions',
    ],
    learningObjectivesNepali: [
      'साझा पद लिने, दुई वर्गको अन्तर र घनको जोड तथा घटाउको खण्डीकरणमा दक्षता हासिल गर्ने',
      'त्रिपदीय मध्यपद विभाजन र चौथो घातका बीजीय रूपहरू बुझ्ने',
      'खण्डहरूको गुणन गरी मूल अभिव्यक्ति प्राप्त हुने प्रक्रियाको प्रमाणीकरण गर्ने',
    ],
    tags: ['Algebra', 'Factorization', 'Grade 9', 'CDC Nepal', 'HCF', 'LCM'],
  },
  {
    code: 'SIM-MATH-G9-U10-02',
    key: 'class9-math-u10-hcf-lcm-visual-lab',
    chapterNumber: 10,
    chapterName: 'Highest Common Factor and Lowest Common Multiple',
    chapterNameNepali: 'महत्तम समापवर्तक र लघुत्तम समापवर्त्य',
    title: 'HCF and LCM Visual Laboratory',
    titleNepali: 'म.स. र ल.स. दृश्य प्रयोगशाला',
    description: 'Visually determine HCF and LCM of 2 and 3 algebraic expressions by isolating common factors and remaining terms with interactive grouping and Venn highlights.',
    descriptionNepali: 'दुई वा तीन बीजीय अभिव्यक्तिहरूको खण्डीकरण गरी साझा गुणनखण्डहरू र बाँकी गुणनखण्डहरूलाई छुट्याएर म.स. र ल.स. पत्ता लगाउने अन्तरक्रियात्मक दृश्य प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand HCF as the product of all common factors',
      'Understand LCM as common factors multiplied by remaining uncommon factors',
      'Apply HCF and LCM principles across 2 and 3 algebraic expressions',
    ],
    learningObjectivesNepali: [
      'म.स. लाई सबै अभिव्यक्तिहरूको साझा गुणनखण्डहरूको गुणनफलका रूपमा बुझ्ने',
      'ल.स. लाई साझा गुणनखण्ड र बाँकी गुणनखण्डहरूको गुणनफलका रूपमा बुझ्ने',
      'दुई तथा तीन बीजीय अभिव्यक्तिहरूमा म.स. र ल.स. नियमहरू लागू गर्ने',
    ],
    tags: ['HCF', 'LCM', 'Algebra', 'Common Factors', 'Grade 9'],
  },
  {
    code: 'SIM-MATH-G9-U10-03',
    key: 'class9-math-u10-hcf-lcm-problem-solver',
    chapterNumber: 10,
    chapterName: 'Highest Common Factor and Lowest Common Multiple',
    chapterNameNepali: 'महत्तम समापवर्तक र लघुत्तम समापवर्त्य',
    title: 'HCF and LCM Real-Life Problem Solver',
    titleNepali: 'म.स. र ल.स. व्यावहारिक समस्या समाधानकर्ता',
    description: 'Solve authentic real-world scenarios such as largest square floor tiling, synchronized school bell ringing, and maximum equal gift packing using HCF and LCM.',
    descriptionNepali: 'कोठामा सबैभन्दा ठूलो वर्गाकार टायल बिछ्याउने, घण्टी एकैसाथ बज्ने समय र फलफूल बराबर प्याकेटमा बाँड्ने जस्ता व्यावहारिक समस्याहरू म.स. र ल.स. द्वारा समाधान गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Identify when a real-life situation requires HCF vs LCM',
      'Calculate maximum dimensions, minimum recurring intervals, and equal partitions',
      'Apply prime factorization to solve contextual applied problems',
    ],
    learningObjectivesNepali: [
      'दैनिक जीवनका समस्यामा कहिले म.स. र कहिले ल.स. प्रयोग हुन्छ भनी पहिचान गर्ने',
      'अधिकतम नाप, न्यूनतम समयान्तर र समान विभाजन गणना गर्ने',
      'रूढ गुणनखण्ड विधिद्वारा व्यावहारिक समस्या समाधान गर्ने',
    ],
    tags: ['Real-Life', 'HCF', 'LCM', 'Tiling', 'Bells', 'Grade 9'],
  },

  // ── UNIT 11: LINEAR EQUATION (रैखिक समीकरण) ──────────────────────────────
  {
    code: 'SIM-MATH-G9-U11-01',
    key: 'class9-math-u11-linear-equation-graph-lab',
    chapterNumber: 11,
    chapterName: 'Linear Equation',
    chapterNameNepali: 'रैखिक समीकरण',
    title: 'Linear Equation Graph Laboratory',
    titleNepali: 'रैखिक समीकरण लेखाचित्र प्रयोगशाला',
    description: 'Graph simultaneous linear equations on an interactive Cartesian coordinate plane to locate intersection coordinates, identifying unique, parallel (no solution), and coincident (infinitely many solutions) systems.',
    descriptionNepali: 'निर्देशाङ्क समतलमा दुई चर भएका रैखिक समीकरणहरूको लेखाचित्र कोरेर प्रतिच्छेदन बिन्दुबाट समाधान (x, y) पत्ता लगाउने तथा समानान्तर र संपाती रेखाहरूको अन्वेषण गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Plot linear equations from tables of values onto a Cartesian grid',
      'Determine the graphical solution of simultaneous equations at the intersection point',
      'Distinguish intersecting, parallel (inconsistent), and coincident (dependent) linear systems',
    ],
    learningObjectivesNepali: [
      'मान तालिकाबाट निर्देशांक समतलमा रैखिक समीकरणहरू खिच्ने',
      'प्रतिच्छेदन बिन्दुबाट युगपत समीकरणको साझा समाधान (x, y) पत्ता लगाउने',
      'प्रतिच्छेदी, समानान्तर र संपाती रेखाहरूको अवस्था छुट्याउने',
    ],
    tags: ['Linear Equations', 'Graph', 'Cartesian Grid', 'Intersection', 'Grade 9'],
  },
  {
    code: 'SIM-MATH-G9-U11-02',
    key: 'class9-math-u11-substitution-elimination-lab',
    chapterNumber: 11,
    chapterName: 'Linear Equation',
    chapterNameNepali: 'रैखिक समीकरण',
    title: 'Substitution and Elimination Method Laboratory',
    titleNepali: 'प्रतिस्थापन र विलोपन विधि प्रयोगशाला',
    description: 'Compare Substitution and Elimination algebraic methods step-by-step for solving systems of linear equations with guided explanations and verification checks.',
    descriptionNepali: 'युगपत रैखिक समीकरणहरूलाई प्रतिस्थापन विधि र विलोपन (हटाउने) विधिद्वारा चरणबद्ध रूपमा समाधान गर्ने र तुलनात्मक अध्ययन गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Master the substitution method: isolating one variable and substituting into the other equation',
      'Master the elimination method: equalizing coefficients and adding/subtracting equations',
      'Verify solution pairs (x, y) in both original equations',
    ],
    learningObjectivesNepali: [
      'प्रतिस्थापन विधि: एउटा चरलाई एक्लो बनाई अर्को समीकरणमा मान राख्ने प्रक्रिया सिक्ने',
      'विलोपन विधि: गुणाङ्क बराबर बनाई समीकरण जोड्ने वा घटाउने प्रक्रिया सिक्ने',
      'मूल समीकरणहरूमा (x, y) को मान राखी उत्तरको प्रमाणीकरण गर्ने',
    ],
    tags: ['Simultaneous Equations', 'Substitution', 'Elimination', 'Algebra', 'Grade 9'],
  },
  {
    code: 'SIM-MATH-G9-U11-03',
    key: 'class9-math-u11-simultaneous-equation-challenge',
    chapterNumber: 11,
    chapterName: 'Linear Equation',
    chapterNameNepali: 'रैखिक समीकरण',
    title: 'Real-Life Simultaneous Equation Challenge',
    titleNepali: 'व्यावहारिक युगपत समीकरण चुनौती',
    description: 'Formulate and solve authentic textbook word problems involving ages, pricing of articles, two-digit numbers, and geometry with interactive equation builders and hint guidance.',
    descriptionNepali: 'उमेर, खरिद मूल्य, दुई अङ्कको संख्या र ज्यामितीय नाप सम्बन्धी शाब्दिक समस्याहरूलाई युगपत समीकरणमा ढालेर समाधान गर्ने अन्तरक्रियात्मक चुनौती।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Translate English and Nepali word problems into mathematical simultaneous equations',
      'Model two-digit numbers using 10x + y representation',
      'Solve and verify contextual solutions against real-world constraints',
    ],
    learningObjectivesNepali: [
      'शाब्दिक समस्यालाई दुई अज्ञात राशि भएका रैखिक समीकरणहरूमा रूपान्तरण गर्ने',
      'दुई अङ्कको संख्यालाई १०x + y को रूपमा बीजीय ढाँचा दिने',
      'निकालेको समाधानलाई व्यावहारिक परिवेशमा प्रमाणित गर्ने',
    ],
    tags: ['Word Problems', 'Age Problems', 'Number Problems', 'Equations', 'Grade 9'],
  },

  // ── UNIT 12: INDICES (घाताङ्क) ───────────────────────────────────────────
  {
    code: 'SIM-MATH-G9-U12-01',
    key: 'class9-math-u12-indices-laws-explorer',
    chapterNumber: 12,
    chapterName: 'Indices',
    chapterNameNepali: 'घाताङ्क',
    title: 'Introduction to Indices and Laws Explorer',
    titleNepali: 'घाताङ्कका नियमहरू अन्वेषक',
    description: 'Explore the fundamental laws of indices including product law (aᵐ × aⁿ = aᵐ⁺ⁿ), quotient law (aᵐ ÷ aⁿ = aᵐ⁻ⁿ), power of a power ((aᵐ)ⁿ = aᵐⁿ), and power of a product with expanded factor visual models.',
    descriptionNepali: 'घाताङ्कको गुणन नियम (aᵐ × aⁿ = aᵐ⁺ⁿ), भाग नियम (aᵐ ÷ aⁿ = aᵐ⁻ⁿ), घातको घात नियम ((aᵐ)ⁿ = aᵐⁿ) र गुणनफलको घात नियमको विस्तारित दृश्य अन्वेषक।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand the relationship between repeated multiplication, base, and index',
      'Apply product, quotient, and power laws to simplify exponential terms',
      'Observe numerical and algebraic equivalence of indices rules',
    ],
    learningObjectivesNepali: [
      'पुनरावृत्त गुणन, आधार र घाताङ्क बीचको सम्बन्ध बुझ्ने',
      'गुणन नियम, भाग नियम र घातको घात नियम प्रयोग गरी घाताङ्क सरलीकरण गर्ने',
      'नियमहरूको संख्यात्मक र बीजीय समानता प्रत्यक्ष अवलोकन गर्ने',
    ],
    tags: ['Indices', 'Exponents', 'Laws of Indices', 'Product Law', 'Grade 9'],
  },
  {
    code: 'SIM-MATH-G9-U12-02',
    key: 'class9-math-u12-negative-zero-root-indices-lab',
    chapterNumber: 12,
    chapterName: 'Indices',
    chapterNameNepali: 'घाताङ्क',
    title: 'Negative, Zero and Root Indices Laboratory',
    titleNepali: 'ऋणात्मक, शून्य र मूल घाताङ्क प्रयोगशाला',
    description: 'Demystify zero exponent (a⁰ = 1), negative exponents (a⁻ᵐ = 1/aᵐ), and rational root indices (aᵐ/ⁿ = ⁿ√aᵐ) through interactive descending patterns and guided evaluations.',
    descriptionNepali: 'शून्य घाताङ्क (a⁰ = १), ऋणात्मक घाताङ्क (a⁻ᵐ = १/aᵐ) र मूल घाताङ्क (aᵐ/ⁿ = ⁿ√aᵐ) लाई घट्दो क्रम ढाँचा र चरणबद्ध संख्यात्मक मूल्याङ्कनद्वारा बुझ्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand why any non-zero number to power zero equals 1 via pattern division',
      'Convert negative indices to positive fractional indices and vice versa',
      'Evaluate rational powers such as 64^(2/3) and 81^(-3/4) using prime bases',
    ],
    learningObjectivesNepali: [
      'कुनै पनि गैर-शून्य संख्याको शून्य घात किन १ हुन्छ भनी घट्दो विभाजन ढाँचाबाट बुझ्ने',
      'ऋणात्मक घाताङ्कलाई धनात्मक भिन्नमा रूपान्तरण गर्ने',
      'रूढ आधार प्रयोग गरी भिन्न घाताङ्क भएका अभिव्यक्तिहरूको मान निकाल्ने',
    ],
    tags: ['Zero Exponent', 'Negative Exponent', 'Fractional Exponents', 'Roots', 'Grade 9'],
  },
  {
    code: 'SIM-MATH-G9-U12-03',
    key: 'class9-math-u12-indices-simplification-challenge',
    chapterNumber: 12,
    chapterName: 'Indices',
    chapterNameNepali: 'घाताङ्क',
    title: 'Indices Simplification Challenge',
    titleNepali: 'घाताङ्क सरलीकरण चुनौती',
    description: 'Challenge yourself with multi-step algebraic indices simplification including common power factoring, cyclic symmetrical identities, and prime base reductions from Nepal CDC textbook.',
    descriptionNepali: 'कक्षा ९ को पाठ्यपुस्तकमा आधारित साझा पद लिने, चक्रीय घाताङ्क सर्वसमिका र रूढ आधार रूपान्तरण सम्बन्धी कठिन घाताङ्क सरलीकरण चुनौती।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Apply multiple laws of indices sequentially in complex algebraic expressions',
      'Factor out common exponential powers like 2^x and 5^n in fractional expressions',
      'Simplify cyclic symmetrical expressions to identity value 1',
    ],
    learningObjectivesNepali: [
      'जटिल बीजीय अभिव्यक्तिमा क्रमैसँग घाताङ्कका धेरै नियमहरू लागू गर्ने',
      'भिन्नका अभिव्यक्तिबाट साझा घाताङ्कीय पद (जस्तै २^x र ५^n) लिई सरलीकरण गर्ने',
      'चक्रीय सममित घाताङ्कीय अभिव्यक्तिको मान १ प्रमाणित गर्ने',
    ],
    tags: ['Simplification', 'Cyclic Powers', 'Indices', 'Challenge', 'Grade 9'],
  },
];

async function seedClass9MathU10U11U12() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    for (const sim of CLASS9_U10_U11_U12_SIMS) {
      const doc = {
        code: sim.code,
        title: sim.title,
        titleNepali: sim.titleNepali,
        description: sim.description,
        descriptionNepali: sim.descriptionNepali,
        subjectCode: 'MATH-G9',
        subjectName: 'Compulsory Mathematics',
        gradeLevels: [9],
        chapterNumber: sim.chapterNumber,
        chapterName: sim.chapterName,
        chapterNameNepali: sim.chapterNameNepali,
        simulationType: sim.simulationType,
        componentKey: sim.key,
        runtimeUrl: `/simulations/class9-math/${sim.key}`,
        difficulty: 'INTERMEDIATE',
        estimatedDurationMinutes: 15,
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
      console.log(`Upserted simulation: [${sim.code}] ${sim.title} (${sim.key})`);
    }

    const totalCount = await Simulation.countDocuments({ subjectCode: 'MATH-G9' });
    console.log(`\nTotal Grade 9 Mathematics simulations now in DB: ${totalCount}`);

    await mongoose.disconnect();
    console.log('Database connection closed.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedClass9MathU10U11U12();

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

const CLASS9_OPTMATH_SIMS = [
  // ── UNIT 1: ALGEBRA (बीजगणित) ─────────────────────────────────────────────
  {
    code: 'SIM-OPTMATH-G9-U1-01',
    key: 'class9-optmath-u1-relation-function-explorer',
    chapterNumber: 1,
    chapterName: 'Algebra - Relation and Function',
    chapterNameNepali: 'बीजगणित - सम्बन्ध तथा फलन',
    title: 'Relation and Function Visual Explorer',
    titleNepali: 'सम्बन्ध तथा फलन दृश्य अन्वेषक',
    description: 'Explore ordered pairs, Cartesian products (A × B), relations as subsets, domain, range, co-domain, types of relations (equivalence), and function verification.',
    descriptionNepali: 'क्रमित जोडा, कार्तेसियन गुणन (A × B), सम्बन्धका सर्तहरू, डोमेन र रेञ्ज, सम्बन्धका प्रकार (स्वपरावर्तक, सममित, सङ्क्रामक र समतुल्यता) तथा फलन परीक्षणको दृश्य अन्वेषक।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand ordered pairs and why order matters: (x, y) ≠ (y, x)',
      'Generate Cartesian products and represent relations via mapping diagrams, tables, and graphs',
      'Identify domain, range, and co-domain, and verify equivalence relations and function conditions',
    ],
    learningObjectivesNepali: [
      'क्रमित जोडाको अवधारणा र स्थान सम्बन्ध बुझ्न',
      'कार्तेसियन गुणन र सम्बन्धलाई चित्र रेखा, तालिका र जोडा सूचीमा प्रस्तुत गर्न',
      'डोमेन, रेञ्ज र सह-डोमेन छुट्याउन तथा समतुल्यता सम्बन्ध र फलनको परीक्षण गर्न',
    ],
    tags: ['optmath', 'grade-9', 'unit-1', 'algebra', 'relation', 'cartesian-product', 'function', 'domain-range'],
  },
  {
    code: 'SIM-OPTMATH-G9-U1-02',
    key: 'class9-optmath-u1-polynomial-root-graph-lab',
    chapterNumber: 1,
    chapterName: 'Algebra - Polynomials and Roots',
    chapterNameNepali: 'बीजगणित - बहुपद र शून्यमान',
    title: 'Polynomial Root and Graph Laboratory',
    titleNepali: 'बहुपदको शून्यमान तथा ग्राफ प्रयोगशाला',
    description: 'Explore polynomial degrees, quadratic curves, real roots as X-intercepts, discriminant b² - 4ac behavior, and step-by-step synthetic division.',
    descriptionNepali: 'बहुपदका पद तथा गुणाङ्क, X-अक्षका प्रतिच्छेदन बिन्दुबाट शून्यमान पहिचान, विवेचक (b² − 4ac) को प्रकृति र संश्लेषित भाग विधि (Synthetic Division) को अन्तरक्रियात्मक प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Identify terms, degree, and leading coefficients of polynomial functions',
      'Relate the geometrical X-intercepts of polynomial curves to their algebraic roots',
      'Perform step-by-step synthetic division to obtain quotients, remainders, and verify factor theorems',
    ],
    learningObjectivesNepali: [
      'बहुपदको डिग्री, पद र गुणाङ्क पहिचान गर्न',
      'ग्राफले X-अक्षमा काटेका बिन्दुहरू नै बहुपदका वास्तविक शून्यमान हुन् भनी बुझ्न',
      'संश्लेषित भाग विधिबाट भागफल, शेषफल र गुणनखण्ड साध्य प्रमाणित गर्न',
    ],
    tags: ['optmath', 'grade-9', 'unit-1', 'algebra', 'polynomial', 'roots', 'synthetic-division', 'factor-theorem'],
  },
  {
    code: 'SIM-OPTMATH-G9-U1-03',
    key: 'class9-optmath-u1-linear-inequality-graphing-lab',
    chapterNumber: 1,
    chapterName: 'Algebra - Equation and Inequality',
    chapterNameNepali: 'बीजगणित - समीकरण र असमानता',
    title: 'Linear Inequality Graphing Laboratory',
    titleNepali: 'रेखीय असमानता ग्राफ प्रयोगशाला',
    description: 'Graph one-variable inequalities on number lines and two-variable linear inequalities on Cartesian planes with solid/dashed boundary lines, test points, and chocolate budget problems.',
    descriptionNepali: 'सङ्ख्या रेखामा खुला/भरिएका बिन्दुसहित एक-चल असमानता, कार्तेसियन तलमा ठोस/विन्दुगत सिमा रेखा र छायाङ्कित क्षेत्र, परीक्षण बिन्दु विधि र चकलेट बजेट समस्या समाधान।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Graph inequalities on number lines with appropriate open or closed boundary endpoints',
      'Determine solution half-planes for two-variable linear inequalities using solid vs. dashed lines',
      'Verify whether arbitrary test points satisfy inequalities, and solve real-world budget constraints',
    ],
    learningObjectivesNepali: [
      'सङ्ख्या रेखामा असमानताको समाधान क्षेत्र देखाउन',
      'द्वि-चल असमानताको छायाङ्कित समाधान क्षेत्र र ठोस/विन्दुगत रेखा पहिचान गर्न',
      'परीक्षण बिन्दु प्रयोग गरी सत्यता जाँच्न र बजेट सम्बन्धी असमानता हल गर्न',
    ],
    tags: ['optmath', 'grade-9', 'unit-1', 'algebra', 'inequality', 'linear-inequality', 'number-line', 'test-point'],
  },

  // ── UNIT 2: TRIGONOMETRY (त्रिकोणमिति) ──────────────────────────────────
  {
    code: 'SIM-OPTMATH-G9-U2-01',
    key: 'class9-optmath-u2-angle-measurement-conversion-lab',
    chapterNumber: 2,
    chapterName: 'Trigonometry - Measurement of Angles',
    chapterNameNepali: 'त्रिकोणमिति - कोणको मापन',
    title: 'Angle Measurement and Conversion Lab',
    titleNepali: 'कोण मापन तथा रूपान्तरण प्रयोगशाला',
    description: 'Interactive circular dial converting between sexagesimal (degrees), centesimal (grades), and circular (radians) systems, and exploring arc length formula l = rθ.',
    descriptionNepali: 'कोण मापनका तीन प्रणालीहरू (डिग्री, ग्रेड र रेडियन) बीचको सम्बन्ध (D/180 = G/200 = θ/π), कोण चक्र र चापको लम्बाइ (l = rθ) को अन्तरक्रियात्मक प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Differentiate between Sexagesimal (Degrees), Centesimal (Grades), and Circular (Radians) angle systems',
      'Apply conversion formulas: D / 180 = G / 200 = θ / π with step-by-step arithmetic',
      'Calculate circle arc length using l = rθ where θ is strictly measured in radians',
    ],
    learningObjectivesNepali: [
      'षाष्टिक, शतिक र वृत्तीय माप प्रणालीको अवधारणा बुझ्न',
      'डिग्री, ग्रेड र रेडियन बीच रूपान्तरण सूत्र प्रयोग गर्न',
      'चापको लम्बाइ सूत्र l = rθ प्रयोग गरी समस्याहरू हल गर्न',
    ],
    tags: ['optmath', 'grade-9', 'unit-2', 'trigonometry', 'angle-measurement', 'degrees-grades-radians', 'arc-length'],
  },
  {
    code: 'SIM-OPTMATH-G9-U2-02',
    key: 'class9-optmath-u2-trig-ratio-identity-explorer',
    chapterNumber: 2,
    chapterName: 'Trigonometry - Identities of Ratios',
    chapterNameNepali: 'त्रिकोणमिति - अनुपातका सर्वसमिकाहरू',
    title: 'Trigonometric Ratio and Identity Explorer',
    titleNepali: 'त्रिकोणमितीय अनुपात तथा सर्वसमिका अन्वेषक',
    description: 'Explore all six ratios in right triangles, reciprocal relations, quotient formulas, and step-by-step proofs of Pythagorean identities.',
    descriptionNepali: 'समकोणी त्रिभुजबाट ६ वटै अनुपात (sin, cos, tan, cosec, sec, cot), पारस्परिक सम्बन्ध, भागफल सूत्र र पाइथागोरस सर्वसमिकाहरू (sin²θ + cos²θ = 1) को चरणबद्ध प्रमाण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Define and calculate primary and reciprocal trigonometric ratios with variable reference angle θ',
      'Numerically and geometrically verify reciprocal products and quotient relationships',
      'Construct formal algebraic step-by-step proofs for fundamental Pythagorean identities',
    ],
    learningObjectivesNepali: [
      'समकोणी त्रिभुजमा ६ वटै त्रिकोणमितीय अनुपातहरू निकाल्न',
      'पारस्परिक गुणन र भागफल सम्बन्ध प्रमाणित गर्न',
      'पाइथागोरस साध्यको आधारमा त्रिकोणमितीय सर्वसमिकाहरू प्रमाणित गर्न',
    ],
    tags: ['optmath', 'grade-9', 'unit-2', 'trigonometry', 'trig-identities', 'pythagorean-identities', 'ratio-explorer'],
  },
  {
    code: 'SIM-OPTMATH-G9-U2-03',
    key: 'class9-optmath-u2-trig-ratio-conversion-lab',
    chapterNumber: 2,
    chapterName: 'Trigonometry - Conversion of Ratios',
    chapterNameNepali: 'त्रिकोणमिति - अनुपातको रूपान्तरण',
    title: 'Trigonometric Ratio Conversion Lab',
    titleNepali: 'त्रिकोणमितीय अनुपात रूपान्तरण प्रयोगशाला',
    description: 'Express any trigonometric ratio in terms of any other ratio without altering the reference angle, with network conversion paths and identity quizzes.',
    descriptionNepali: 'सन्दर्भ कोण परिवर्तन नगरी कुनै पनि त्रिकोणमितीय अनुपातलाई अर्को अनुपातको पदमा रूपान्तरण गर्ने सूत्र तथा चरणबद्ध अभ्यास प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Express any trigonometric ratio in terms of any of the remaining five ratios',
      'Maintain constant reference angle while transforming algebraic expressions',
      'Apply identity substitution pathways to simplify complex trigonometric expressions',
    ],
    learningObjectivesNepali: [
      'एउटा त्रिकोणमितीय अनुपातलाई अन्य पाँचवटै अनुपातको पदमा व्यक्त गर्न',
      'सन्दर्भ कोण यथावत राखी सर्वसमिकाको सहायताले रूपान्तरण गर्न',
      'त्रिकोणमितीय व्यञ्जकहरूको सरलीकरण अभ्यास गर्न',
    ],
    tags: ['optmath', 'grade-9', 'unit-2', 'trigonometry', 'ratio-conversion', 'in-terms-of', 'identity-substitution'],
  },

  // ── UNIT 3: GEOMETRY (निर्देशाङ्क ज्यामिति) ──────────────────────────────
  {
    code: 'SIM-OPTMATH-G9-U3-01',
    key: 'class9-optmath-u3-locus-coordinate-geometry-lab',
    chapterNumber: 3,
    chapterName: 'Geometry - Concept of Locus',
    chapterNameNepali: 'ज्यामिति - बिन्दुपथको अवधारणा',
    title: 'Locus and Coordinate Geometry Lab',
    titleNepali: 'बिन्दुपथ तथा खण्ड-सूत्र प्रयोगशाला',
    description: 'Dynamic locus generation of circle paths (x - h)² + (y - k)² = r², moving points at constant distances, and internal section formula P(x, y).',
    descriptionNepali: 'निश्चित बिन्दुबाट अचर दुरीमा रहने बिन्दुको बिन्दुपथ (वृत्त), समीकरण निर्माण तथा दुई बिन्दुलाई m₁ : m₂ अनुपातमा विभाजन गर्ने आन्तरिक खण्ड-सूत्र प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand locus as a set of points satisfying specific geometric conditions',
      'Derive and visualize circular loci equations (x - h)² + (y - k)² = r²',
      'Apply the internal section formula to find coordinates dividing line segments in ratio m₁ : m₂',
    ],
    learningObjectivesNepali: [
      'बिन्दुपथको परिभाषा र निश्चित सर्तअनुसार बन्ने रेखाचित्र बुझ्न',
      'केन्द्र (h, k) र अर्धव्यास r भएको वृत्तको बिन्दुपथको समीकरण निकाल्न',
      'खण्ड-सूत्र प्रयोग गरी रेखाखण्डलाई m₁ : m₂ अनुपातमा विभाजन गर्ने बिन्दु पत्ता लगाउन',
    ],
    tags: ['optmath', 'grade-9', 'unit-3', 'geometry', 'locus', 'circle-locus', 'section-formula', 'internal-division'],
  },
  {
    code: 'SIM-OPTMATH-G9-U3-02',
    key: 'class9-optmath-u3-slope-straightline-graph-lab',
    chapterNumber: 3,
    chapterName: 'Geometry - Straight Line Equations',
    chapterNameNepali: 'ज्यामिति - सरलरेखाका समीकरणहरू',
    title: 'Slope and Straight-Line Graph Laboratory',
    titleNepali: 'झुकाव तथा सरलरेखा ग्राफ प्रयोगशाला',
    description: 'Explore slope m = tan θ with rise/run right-triangle guides, intercepts, and seamless conversion between slope-intercept, double-intercept, and general forms.',
    descriptionNepali: 'सरलरेखाको झुकाव (m = tan θ), उचाइ वृद्धि र तेर्सो वृद्धि (Rise/Run), X र Y अन्तःखण्डहरू तथा विभिन्न समीकरण रूपहरू (y = mx + c, x/a + y/b = 1, Ax + By + C = 0) को अन्वेषक।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate slope m = (y₂ - y₁) / (x₂ - x₁) = tan θ and observe geometric rise and run',
      'Determine X and Y intercepts and identify lines parallel to coordinate axes',
      'Convert between general form, slope-intercept form, and double-intercept form without altering the graph',
    ],
    learningObjectivesNepali: [
      'दुई बिन्दु बीचको झुकाव (m = tan θ) र कोण पत्ता लगाउन',
      'अन्तःखण्डहरू (a र b) पहिचान गर्न र अक्षसँग समानान्तर रेखाहरू बुझ्न',
      'समीकरणका विभिन्न रूपहरू (General, Slope-intercept, Intercept) बीच रूपान्तरण गर्न',
    ],
    tags: ['optmath', 'grade-9', 'unit-3', 'geometry', 'slope', 'straight-line', 'intercepts', 'equation-forms'],
  },
  {
    code: 'SIM-OPTMATH-G9-U3-03',
    key: 'class9-optmath-u3-geometric-transformation-lab',
    chapterNumber: 3,
    chapterName: 'Geometry - Transformation',
    chapterNameNepali: 'ज्यामिति - रूपान्तरण',
    title: 'Geometric Transformation Laboratory',
    titleNepali: 'ज्यामितीय विस्थापन तथा रूपान्तरण प्रयोगशाला',
    description: 'Manipulate triangles under reflection across axes and line y = x, rotation about origin, enlargement/reduction with scale factor k, and compare isometric vs non-isometric properties.',
    descriptionNepali: 'निर्देशाङ्क तलमा परावर्तन (अक्षहरू र y = x मा), परिक्रमण (±९०°, १८०°), विस्तारण/सङ्कुचन (नाप गुणक k), र समदूरीय (Isometric) तथा गैर-समदूरीय रूपान्तरणको तुलना प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Apply reflection rules across X-axis, Y-axis, origin, and the line y = x',
      'Execute rotations of +90°, -90°, and 180° about the origin',
      'Perform enlargement and reduction with scale factor k and differentiate isometric from non-isometric transformations',
    ],
    learningObjectivesNepali: [
      'विभिन्न अक्षहरूमा परावर्तनका सूत्रहरू प्रयोग गर्न',
      'मूलबिन्दु वरिपरि परिक्रमणका नियमहरू लागू गर्न',
      'नाप गुणक k द्वारा विस्तारण र सङ्कुचन गरी समदूरीय र गैर-समदूरीय रूपान्तरण छुट्याउन',
    ],
    tags: ['optmath', 'grade-9', 'unit-3', 'geometry', 'transformation', 'reflection', 'rotation', 'enlargement', 'isometric'],
  },
];

async function seedClass9OptMathU1U2U3() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    for (const sim of CLASS9_OPTMATH_SIMS) {
      const doc = {
        code: sim.code,
        title: sim.title,
        titleNepali: sim.titleNepali,
        description: sim.description,
        descriptionNepali: sim.descriptionNepali,
        subjectCode: 'OPTMATH-G9',
        subjectName: 'Grade 9 Optional Mathematics',
        gradeLevels: [9],
        chapterNumber: sim.chapterNumber,
        chapterName: sim.chapterName,
        chapterNameNepali: sim.chapterNameNepali,
        simulationType: sim.simulationType,
        componentKey: sim.key,
        runtimeUrl: `/simulations/class9-optmath/${sim.key}`,
        difficulty: 'INTERMEDIATE',
        estimatedDurationMinutes: 15,
        learningObjectives: sim.learningObjectives,
        learningObjectivesNepali: sim.learningObjectivesNepali,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: sim.tags,
      };

      await Simulation.findOneAndUpdate(
        { code: sim.code },
        { $set: doc },
        { upsert: true, returnDocument: 'after' }
      );
      console.log(`Upserted simulation: [${sim.code}] ${sim.title} (${sim.key})`);
    }

    const totalCount = await Simulation.countDocuments({ subjectCode: 'OPTMATH-G9' });
    console.log(`\nTotal Grade 9 Optional Mathematics simulations now in DB: ${totalCount}`);

    await mongoose.disconnect();
    console.log('Database connection closed.');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seedClass9OptMathU1U2U3();

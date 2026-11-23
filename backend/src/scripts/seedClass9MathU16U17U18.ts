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

const CLASS9_U16_U17_U18_SIMS = [
  // ── UNIT 16: CIRCLE (वृत्त) ──────────────────────────────────────────────
  {
    code: 'SIM-MATH-G9-U16-01',
    key: 'class9-math-u16-circle-parts-measurements',
    chapterNumber: 16,
    chapterName: 'Circle',
    chapterNameNepali: 'वृत्त',
    title: 'Interactive Circle Explorer – Parts & Measurements',
    titleNepali: 'अन्तरक्रियात्मक वृत्त अन्वेषक – अङ्गहरू तथा नापहरू',
    description: 'Explore the geometric parts of a circle including radius, diameter, chords, arcs, sectors, segments, and investigate chord distance relationships with dynamic measurements.',
    descriptionNepali: 'वृत्तका अङ्गहरू (अर्धव्यास, व्यास, जीवा, चाप, वृत्तखण्ड, वृत्तखण्डिका) र केन्द्रबाट जीवाको दूरीको अन्तरक्रियात्मक अन्वेषण तथा नाप परीक्षण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Identify and differentiate radius, diameter, chord, arc, segment, and sector of a circle',
      'Verify that the diameter is the longest chord of a circle (d = 2r)',
      'Observe the inverse relationship between chord length and its perpendicular distance from the center',
    ],
    learningObjectivesNepali: [
      'वृत्तका विभिन्न अङ्गहरू (अर्धव्यास, व्यास, जीवा, चाप, वृत्तखण्ड) पहिचान गर्न',
      'व्यास वृत्तको सबैभन्दा लामो जीवा हो भनी प्रमाणित गर्न (d = 2r)',
      'केन्द्रबाट जीवाको दूरी र जीवाको लम्बाइबीचको सम्बन्ध बुझ्न',
    ],
    tags: ['math', 'grade-9', 'unit-16', 'circle', 'geometry', 'chord', 'radius', 'diameter'],
  },
  {
    code: 'SIM-MATH-G9-U16-02',
    key: 'class9-math-u16-circle-theorem-investigation-lab',
    chapterNumber: 16,
    chapterName: 'Circle',
    chapterNameNepali: 'वृत्त',
    title: 'Circle Theorem Investigation Laboratory',
    titleNepali: 'वृत्तका साध्यहरूको अनुसन्धान प्रयोगशाला',
    description: 'Experimentally verify and mathematically prove Grade 9 circle theorems: perpendicular from center bisects the chord, and equal chords are equidistant from the center.',
    descriptionNepali: 'कक्षा ९ का वृत्त सम्बन्धी साध्यहरूको प्रयोगात्मक परीक्षण तथा सैद्धान्तिक प्रमाण: केन्द्रबाट जीवामा खिचिएको लम्बले जीवालाई आधा गर्दछ, र बराबर जीवाहरू केन्द्रबाट समदूरस्थ हुन्छन्।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Experimentally verify that a perpendicular from the center of a circle to a chord bisects the chord',
      'Verify that chords equidistant from the center are equal in length',
      'Explore formal geometric two-column proofs (statements and reasons) with congruent triangles',
    ],
    learningObjectivesNepali: [
      'वृत्तको केन्द्रबिन्दुबाट जीवामा खिचिएको लम्बले जीवालाई समद्विभाजन गर्छ भनी परीक्षण गर्न',
      'वृत्तको केन्द्रबाट बराबर दूरीमा रहेका जीवाहरू लम्बाइमा बराबर हुन्छन् भनी बुझ्न',
      'अनुरूप त्रिभुजहरूको आधारमा साध्यको सैद्धान्तिक प्रमाण बुझ्न',
    ],
    tags: ['math', 'grade-9', 'unit-16', 'circle-theorem', 'perpendicular-bisector', 'equidistant-chords', 'geometry-proof'],
  },
  {
    code: 'SIM-MATH-G9-U16-03',
    key: 'class9-math-u16-circle-problem-solving-lab',
    chapterNumber: 16,
    chapterName: 'Circle',
    chapterNameNepali: 'वृत्त',
    title: 'Circle Problem-Solving Laboratory',
    titleNepali: 'वृत्त समस्या समाधान प्रयोगशाला (पाइथागोरस साध्य)',
    description: 'Solve textbook Pythagorean calculation problems connecting radius (r), perpendicular distance (d), and half-chord length (c/2) with step-by-step visual working.',
    descriptionNepali: 'वृत्तको अर्धव्यास (r), केन्द्रबाट जीवाको लम्ब दूरी (d), र जीवाको आधा लम्बाइ (c/2) बीच पाइथागोरस साध्य (r² = d² + (c/2)²) प्रयोग गरी अज्ञात नाप पत्ता लगाउने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Apply the Pythagorean theorem in right-angled triangles formed by radius, perpendicular, and half-chord',
      'Calculate chord length when radius and perpendicular distance are given',
      'Calculate perpendicular distance or circle radius when chord dimensions are provided',
    ],
    learningObjectivesNepali: [
      'समकोणी त्रिभुजमा पाइथागोरस साध्य प्रयोग गरी वृत्तको अर्धव्यास, जीवा र लम्ब दूरी निकाल्न',
      'विभिन्न अज्ञात नापहरू पत्ता लगाउने गणितीय समस्याहरू चरणबद्ध रूपमा हल गर्न',
    ],
    tags: ['math', 'grade-9', 'unit-16', 'circle-problems', 'pythagoras', 'chord-length', 'radius-calculation'],
  },

  // ── UNIT 17: CLASSIFICATION AND PRESENTATION OF DATA ──────────────────────
  {
    code: 'SIM-MATH-G9-U17-01',
    key: 'class9-math-u17-data-classification-frequency-lab',
    chapterNumber: 17,
    chapterName: 'Classification and Presentation of Data',
    chapterNameNepali: 'तथ्याङ्कको वर्गीकरण र प्रस्तुतीकरण',
    title: 'Data Classification and Frequency Distribution Laboratory',
    titleNepali: 'तथ्याङ्कको वर्गीकरण तथा बारम्बारता प्रयोगशाला',
    description: 'Transform raw data into ordered series, discrete frequency tables using tally marks, and continuous grouped frequency distributions with customizable class intervals and cumulative frequencies.',
    descriptionNepali: 'कच्चा तथ्याङ्कलाई आरोही/अवरोही क्रममा मिलाउने, मिलान चिन्ह (Tally marks) प्रयोग गरी खण्डित बारम्बारता तालिका र वर्गान्तरसहित वर्गीकृत तथा सञ्चित बारम्बारता तालिका बनाउने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Sort and categorize raw numerical datasets into ascending and descending order',
      'Construct discrete frequency tables using standard 5-bundle tally marks',
      'Create grouped continuous distributions with specified class intervals and compute cumulative frequencies',
    ],
    learningObjectivesNepali: [
      'कच्चा तथ्याङ्कलाई क्रमबद्ध गरी विस्तार (Range) निकाल्न',
      'मिलान चिन्ह प्रयोग गरी खण्डित बारम्बारता तालिका निर्माण गर्न',
      'वर्गान्तरका आधारमा वर्गीकृत तालिका र सञ्चित बारम्बारता (c.f.) निर्माण गर्न',
    ],
    tags: ['math', 'grade-9', 'unit-17', 'statistics', 'tally-marks', 'frequency-distribution', 'grouped-data', 'cumulative-frequency'],
  },
  {
    code: 'SIM-MATH-G9-U17-02',
    key: 'class9-math-u17-statistical-graph-construction-lab',
    chapterNumber: 17,
    chapterName: 'Classification and Presentation of Data',
    chapterNameNepali: 'तथ्याङ्कको वर्गीकरण र प्रस्तुतीकरण',
    title: 'Statistical Graph Construction Laboratory',
    titleNepali: 'साङ्ख्यिकीय रेखाचित्र निर्माण प्रयोगशाला (आयतचित्र, बहुभुज र तोरण)',
    description: 'Construct and interact with Histograms, Frequency Polygons, Bar Diagrams, and Less-than/More-than Ogive curves to find median visually.',
    descriptionNepali: 'आयतचित्र (Histogram), बारम्बारता बहुभुज (Frequency Polygon), स्तम्भचित्र (Bar Diagram) र तोरण वक्र रेखा (Ogive curves) निर्माण तथा मध्यिका पत्ता लगाउने प्रयोगात्मक रेखाचित्र प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Construct histograms with continuous intervals on the X-axis and frequencies on the Y-axis',
      'Draw frequency polygons by connecting the midpoints of histogram bars and anchoring to zero',
      'Plot less-than and more-than ogive curves and locate the median at their point of intersection',
    ],
    learningObjectivesNepali: [
      'अविच्छिन्न वर्गान्तरका आधारमा आयतचित्र निर्माण गर्न',
      'मध्यमान बिन्दुहरू जोडेर बारम्बारता बहुभुज खिच्न',
      'तोरण वक्र रेखा (Ogive) खिची प्रतिच्छेदन बिन्दुबाट मध्यिका पत्ता लगाउन',
    ],
    tags: ['math', 'grade-9', 'unit-17', 'histogram', 'frequency-polygon', 'ogive', 'bar-diagram', 'statistical-graph'],
  },
  {
    code: 'SIM-MATH-G9-U17-03',
    key: 'class9-math-u17-statistical-data-interpretation-challenge',
    chapterNumber: 17,
    chapterName: 'Classification and Presentation of Data',
    chapterNameNepali: 'तथ्याङ्कको वर्गीकरण र प्रस्तुतीकरण',
    title: 'Statistical Data Interpretation Challenge',
    titleNepali: 'साङ्ख्यिकीय तथ्याङ्क विश्लेषण चुनौती',
    description: 'Interpret histograms, frequency polygons, and ogive curves across multiple difficulty levels to determine frequencies, modal classes, and cumulative counts.',
    descriptionNepali: 'साङ्ख्यिकीय रेखाचित्र र तालिकाहरूबाट रूत वर्ग (Modal class), कुल सङ्ख्या, वर्ग सीमा र सञ्चित बारम्बारता विश्लेषण गर्ने बहु-तह चुनौती।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Extract frequencies and class bounds directly from graphical statistical representations',
      'Identify the modal class (highest frequency) and compute total frequency N = ∑f',
      'Interpret cumulative frequency conditions (less than or more than a given limit)',
    ],
    learningObjectivesNepali: [
      'आयतचित्र तथा तोरण वक्रबाट तथ्याङ्कका मानहरू सही तरिकाले पढ्न',
      'रूत वर्ग र कुल बारम्बारता पहिचान गर्न',
      'सञ्चित बारम्बारता सम्बन्धी प्रश्नहरूको विश्लेषणात्मक उत्तर दिन',
    ],
    tags: ['math', 'grade-9', 'unit-17', 'data-interpretation', 'histogram-reading', 'ogive-interpretation', 'challenge'],
  },

  // ── UNIT 18: MEASURES OF CENTRAL TENDENCY ────────────────────────────────
  {
    code: 'SIM-MATH-G9-U18-01',
    key: 'class9-math-u18-arithmetic-mean-explorer',
    chapterNumber: 18,
    chapterName: 'Measures of Central Tendency',
    chapterNameNepali: 'केन्द्रीय प्रवृत्तिका नापहरु',
    title: 'Arithmetic Mean Explorer',
    titleNepali: 'अङ्कगणितीय मध्यक अन्वेषक',
    description: 'Explore the arithmetic mean for individual series (∑X/N) and discrete series (∑fX/∑f) with a physical balance beam metaphor and outlier sensitivity analysis.',
    descriptionNepali: 'व्यक्तिगत श्रेणी (∑X/N) र खण्डित श्रेणी (∑fX/∑f) को मध्यक निकाल्ने, सन्तुलन बिन्दु (Balance beam) हेर्ने र चरम मान (Outliers) ले मध्यकमा पार्ने प्रभाव अवलोकन गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate the arithmetic mean for individual series data using the formula X̄ = ∑X / N',
      'Calculate the mean for discrete series using frequency products X̄ = ∑fX / ∑f',
      'Understand the fulcrum/balance property of the mean and recognize its sensitivity to extreme outliers',
    ],
    learningObjectivesNepali: [
      'व्यक्तिगत श्रेणीमा अङ्कगणितीय मध्यक (X̄ = ∑X / N) निकाल्न',
      'खण्डित श्रेणीमा बारम्बारता तालिकाबाट मध्यक (X̄ = ∑fX / ∑f) गणना गर्न',
      'मध्यकलाई तथ्याङ्कको सन्तुलन बिन्दुको रूपमा बुझ्न र चरम मानको प्रभाव जाँच्न',
    ],
    tags: ['math', 'grade-9', 'unit-18', 'arithmetic-mean', 'central-tendency', 'balance-beam', 'outliers', 'discrete-mean'],
  },
  {
    code: 'SIM-MATH-G9-U18-02',
    key: 'class9-math-u18-median-middle-value-explorer',
    chapterNumber: 18,
    chapterName: 'Measures of Central Tendency',
    chapterNameNepali: 'केन्द्रीय प्रवृत्तिका नापहरु',
    title: 'Median Explorer – Finding the Middle Value',
    titleNepali: 'मध्यिका (मध्यमान पद) अन्वेषक',
    description: 'Determine the median of individual datasets for both odd and even sample sizes after sorting, and compute discrete medians using cumulative frequency tables.',
    descriptionNepali: 'तथ्याङ्कलाई आरोही क्रममा मिलाई विजोडी (Odd) र जोडी (Even) पद सङ्ख्यामा मध्यिका पत्ता लगाउने विधि तथा खण्डित श्रेणीमा सञ्चित बारम्बारता (c.f.) विधिबाट मध्यिका पत्ता लगाउने अन्वेषक।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand that sorting data in ascending order is an essential first step in determining median',
      'Apply position formulas: (N+1)/2 for odd sample sizes and average of N/2 and (N/2 + 1) for even sizes',
      'Find the median in discrete series using cumulative frequency (c.f. ≥ (N+1)/2)',
    ],
    learningObjectivesNepali: [
      'मध्यिका निकाल्न तथ्याङ्कलाई अनिवार्य रूपमा आरोही क्रममा मिलाउनुपर्छ भनी बुझ्न',
      'विजोडी र जोडी पद सङ्ख्यामा मध्यिकाको स्थान र मान निकाल्ने सूत्र प्रयोग गर्न',
      'खण्डित श्रेणीमा सञ्चित बारम्बारता (c.f.) तालिकाबाट मध्यिका पत्ता लगाउन',
    ],
    tags: ['math', 'grade-9', 'unit-18', 'median', 'middle-value', 'odd-even-median', 'cumulative-frequency-median'],
  },
  {
    code: 'SIM-MATH-G9-U18-03',
    key: 'class9-math-u18-mean-median-comparison-challenge',
    chapterNumber: 18,
    chapterName: 'Measures of Central Tendency',
    chapterNameNepali: 'केन्द्रीय प्रवृत्तिका नापहरु',
    title: 'Mean and Median – Statistical Comparison Challenge',
    titleNepali: 'मध्यक र मध्यिका तुलना तथा अज्ञात बारम्बारता चुनौती',
    description: 'Compare the stability of Mean and Median on symmetric and skewed distributions, and solve official CDC exam challenges to find missing frequency "p" when the mean is given.',
    descriptionNepali: 'सममित र दायाँ/बायाँ ढल्किएका तथ्याङ्कमा मध्यक र मध्यिकाको तुलना, र मध्यक दिइएको अवस्थामा तालिकाको अज्ञात बारम्बारता (p) पत्ता लगाउने पाठ्यपुस्तक मोडेल समस्या समाधान।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Compare mean and median behavior in symmetric distributions versus skewed distributions with outliers',
      'Formulate algebraic equations to solve for missing frequencies (p or k) given the arithmetic mean',
      'Select the most appropriate measure of central tendency based on dataset skewness',
    ],
    learningObjectivesNepali: [
      'सममित र विषम तथ्याङ्कमा मध्यक र मध्यिकाको भिन्नता तुलना गर्न',
      'मध्यक दिइएको अवस्थामा बीजगणितीय समीकरण बनाएर अज्ञात बारम्बारता (p) पत्ता लगाउन',
      'तथ्याङ्कको प्रकृतिका आधारमा कुन केन्द्रीय प्रवृत्ति उपयुक्त हुन्छ भनी पहिचान गर्न',
    ],
    tags: ['math', 'grade-9', 'unit-18', 'mean-vs-median', 'missing-frequency', 'central-tendency-challenge', 'cdc-math'],
  },
];

async function seedClass9MathU16U17U18() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    for (const sim of CLASS9_U16_U17_U18_SIMS) {
      const doc = {
        code: sim.code,
        title: sim.title,
        titleNepali: sim.titleNepali,
        description: sim.description,
        descriptionNepali: sim.descriptionNepali,
        subjectCode: 'MATH-G9',
        subjectName: 'Grade 9 Compulsory Mathematics',
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

      await Simulation.findOneAndUpdate(
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

seedClass9MathU16U17U18();

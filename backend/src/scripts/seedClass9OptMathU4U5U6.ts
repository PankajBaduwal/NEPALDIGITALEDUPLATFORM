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

const CLASS9_OPTMATH_SIMS_U4_U6 = [
  // ── UNIT 4: VECTOR (भेक्टर) ───────────────────────────────────────────────
  {
    code: 'SIM-OPTMATH-G9-U4-01',
    key: 'class9-optmath-u4-scalar-vector-explorer',
    chapterNumber: 4,
    chapterName: 'Vector - Scalar and Vector Quantities',
    chapterNameNepali: 'भेक्टर - स्केलर तथा भेक्टर राशिहरू',
    title: 'Scalar and Vector Visual Explorer',
    titleNepali: 'स्केलर तथा भेक्टर दृश्य अन्वेषक',
    description: 'Distinguish between scalar and vector physical quantities, explore column and row vector representations, and identify types of vectors (equal, negative, like, unlike, zero, position vectors).',
    descriptionNepali: 'स्केलर र भेक्टर भौतिक राशिहरू छुट्याउने, स्तम्भ र पङ्क्ति रूपमा भेक्टर प्रदर्शन गर्ने, र बराबर, विपरीत, समान, विपरित, शून्य र स्थिति भेक्टरहरू अन्वेषण गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Differentiate between scalar and vector physical quantities with real-life examples',
      'Represent vectors in row and column forms on a 2D coordinate plane',
      'Identify and compare equal, negative, like, unlike, zero, and position vectors',
      'Compute the vector between two points A(x1, y1) and B(x2, y2) as AB = (x2 - x1, y2 - y1)',
    ],
    learningObjectivesNepali: [
      'वास्तविक जीवनका उदाहरणहरूबाट स्केलर र भेक्टर राशिहरू छुट्याउन',
      'निर्देशाङ्क समतलमा स्तम्भ तथा पङ्क्ति ढाँचामा भेक्टर प्रस्तुत गर्न',
      'बराबर, ऋणात्मक, समान, विपरित, शून्य र स्थिति भेक्टरहरू पहिचान गर्न',
      'दुई बिन्दुहरू A र B बीचको भेक्टर AB = (x2 - x1, y2 - y1) गणना गर्न',
    ],
    tags: ['optmath', 'grade9', 'vector', 'scalar', 'column-vector', 'position-vector'],
  },
  {
    code: 'SIM-OPTMATH-G9-U4-02',
    key: 'class9-optmath-u4-vector-operations-lab',
    chapterNumber: 4,
    chapterName: 'Vector - Addition and Operations',
    chapterNameNepali: 'भेक्टर - जोड तथा कार्य सञ्चालन',
    title: 'Vector Addition and Operations Laboratory',
    titleNepali: 'भेक्टर जोड तथा कार्य सञ्चालन प्रयोगशाला',
    description: 'Explore the Triangle Law of vector addition (AB + BC = AC), Polygon Law, component-wise addition/subtraction, and scalar multiplication (ka).',
    descriptionNepali: 'भेक्टर जोडको त्रिभुज नियम (AB + BC = AC), बहुभुज नियम, कम्पोनेन्ट जोड-घटाउ, र स्केलर गुणन (ka) को अन्तरक्रियात्मक प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand and apply the Triangle Law of vector addition: AB + BC = AC',
      'Extend to the Polygon Law and understand closed polygons with resultant zero vector',
      'Perform component-wise addition and subtraction: a ± b = (x1 ± x2, y1 ± y2)',
      'Understand scalar multiplication: ka = (kx, ky) and direction reversal for negative k',
    ],
    learningObjectivesNepali: [
      'भेक्टर जोडको त्रिभुज नियम (AB + BC = AC) बुझ्न र प्रयोग गर्न',
      'बहुभुज नियम र बन्द बहुभुजमा नतिजामूलक भेक्टर शून्य (0) हुने तथ्य बुझ्न',
      'कम्पोनेन्ट अनुसार भेक्टर जोड र घटाउ (a ± b) गणना गर्न',
      'स्केलर गुणन ka = (kx, ky) र ऋणात्मक स्केलरले दिशा उल्ट्याउने तथ्य बुझ्न',
    ],
    tags: ['optmath', 'grade9', 'vector', 'triangle-law', 'polygon-law', 'addition', 'scalar-multiplication'],
  },
  {
    code: 'SIM-OPTMATH-G9-U4-03',
    key: 'class9-optmath-u4-magnitude-direction-unit-lab',
    chapterNumber: 4,
    chapterName: 'Vector - Magnitude, Direction and Unit Vector',
    chapterNameNepali: 'भेक्टर - परिमाण, दिशा तथा एकाइ भेक्टर',
    title: 'Vector Magnitude, Direction and Unit Vector Lab',
    titleNepali: 'भेक्टर परिमाण, दिशा तथा एकाइ भेक्टर प्रयोगशाला',
    description: 'Calculate vector magnitude |a| = √(x² + y²), find direction angle θ = tan⁻¹(y/x) across all four quadrants, and construct unit vectors â = a / |a|.',
    descriptionNepali: 'पाइथागोरस साध्यबाट भेक्टरको परिमाण |a| = √(x² + y²), चारै चरणमा दिशा θ = tan⁻¹(y/x), र एकाइ भेक्टर â = a / |a| गणना गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate vector magnitude using the Pythagorean theorem: |a| = √(x² + y²)',
      'Determine vector direction angle θ with the positive X-axis in all four quadrants',
      'Construct unit vectors â = a / |a| and verify |â| = 1',
      'Express vectors in terms of standard orthogonal unit vectors: a = xi + yj',
    ],
    learningObjectivesNepali: [
      'पाइथागोरस साध्य प्रयोग गरी भेक्टरको परिमाण |a| = √(x² + y²) निकाल्न',
      'धनात्मक X-अक्षसँग बनेको दिशा कोण θ चारै चरणमा निर्धारण गर्न',
      'एकाइ भेक्टर â = a / |a| पत्ता लगाउन र परिमाण १ हुने परीक्षण गर्न',
      'प्रमाणिक एकाइ भेक्टरहरू i र j को आधारमा a = xi + yj व्यक्त गर्न',
    ],
    tags: ['optmath', 'grade9', 'vector', 'magnitude', 'direction', 'unit-vector'],
  },

  // ── UNIT 5: STATISTICS (तथ्याङ्कशास्त्र) ────────────────────────────────────
  {
    code: 'SIM-OPTMATH-G9-U5-01',
    key: 'class9-optmath-u5-quartile-percentile-explorer',
    chapterNumber: 5,
    chapterName: 'Statistics - Quartiles and Percentiles',
    chapterNameNepali: 'तथ्याङ्कशास्त्र - चतुर्थांश तथा शशांश',
    title: 'Quartile and Percentile Explorer',
    titleNepali: 'चतुर्थांश तथा शशांश अन्वेषक',
    description: 'Compute first quartile (Q1), median (Q2), third quartile (Q3), and percentiles (Pk) for individual and discrete datasets using CDC textbook position formulas.',
    descriptionNepali: 'व्यक्तिगत र खण्डित श्रेणीका तथ्याङ्कहरूको पहिलो चतुर्थांश (Q1), मध्यिका (Q2), तेस्रो चतुर्थांश (Q3) र शशांशहरू (Pk) गणना तथा अन्वेषण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate Q1, Q2 (median), and Q3 for individual data using textbook position formulas',
      'Construct cumulative frequency (cf) tables for discrete data to locate quartiles',
      'Understand percentiles Pk as dividing sorted data into 100 equal parts',
      'Verify relationships between quartiles and percentiles: P25 = Q1, P50 = Q2, P75 = Q3',
    ],
    learningObjectivesNepali: [
      'व्यक्तिगत तथ्याङ्कमा Q1, Q2, Q3 को स्थान र मान पाठ्यपुस्तकको सूत्रबाट निकाल्न',
      'खण्डित श्रेणीमा सञ्चित बारम्बारता (cf) तालिका बनाएर चतुर्थांश पत्ता लगाउन',
      'शशांश Pk ले तथ्याङ्कलाई १०० बराबर भागमा बाँड्ने तथ्य बुझ्न',
      'P25 = Q1, P50 = Q2 (मध्यिका), र P75 = Q3 बीचको सम्बन्ध प्रमाणित गर्न',
    ],
    tags: ['optmath', 'grade9', 'statistics', 'quartile', 'percentile', 'median', 'discrete-data'],
  },
  {
    code: 'SIM-OPTMATH-G9-U5-02',
    key: 'class9-optmath-u5-statistical-dispersion-lab',
    chapterNumber: 5,
    chapterName: 'Statistics - Measures of Dispersion',
    chapterNameNepali: 'तथ्याङ्कशास्त्र - विचलनशीलताका नापहरू',
    title: 'Statistical Dispersion Laboratory',
    titleNepali: 'तथ्याङ्कीय विचलनशीलता प्रयोगशाला',
    description: 'Understand statistical spread, compute Interquartile Range (IQR), Quartile Deviation (QD), Mean Deviation (MD) from mean and median, and their respective coefficients.',
    descriptionNepali: 'तथ्याङ्कको फैलावट (Dispersion) बुझ्ने, अन्तर-चतुर्थांश विस्तार, चतुर्थांश विचलन (QD), मध्यक विचलन (MD) र तिनका गुणाङ्कहरू तुलना गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand why central tendency alone is insufficient without measures of dispersion',
      'Calculate Interquartile Range (Q3 - Q1) and Quartile Deviation: QD = (Q3 - Q1) / 2',
      'Compute Coefficient of Quartile Deviation: (Q3 - Q1) / (Q3 + Q1)',
      'Calculate Mean Deviation (MD) from mean and median with absolute deviations: MD = ∑|d| / N',
    ],
    learningObjectivesNepali: [
      'केन्द्रीय प्रवृत्तिका नाप मात्र पर्याप्त नहुने र विचलनशीलताको आवश्यकता बुझ्न',
      'अन्तर-चतुर्थांश विस्तार (Q3 - Q1) र चतुर्थांश विचलन QD = (Q3 - Q1)/2 निकाल्न',
      'चतुर्थांश विचलनको गुणाङ्क निकाल्न',
      'मध्यक वा मध्यिकाबाट निरपेक्ष विचलन निकाली मध्यक विचलन (MD = ∑|d|/N) गणना गर्न',
    ],
    tags: ['optmath', 'grade9', 'statistics', 'dispersion', 'quartile-deviation', 'mean-deviation'],
  },
  {
    code: 'SIM-OPTMATH-G9-U5-03',
    key: 'class9-optmath-u5-box-whisker-plot-builder',
    chapterNumber: 5,
    chapterName: 'Statistics - Box and Whisker Plot',
    chapterNameNepali: 'तथ्याङ्कशास्त्र - बाकस र जुँगा रेखाचित्र',
    title: 'Box and Whisker Plot Builder',
    titleNepali: 'बाकस र जुँगा रेखाचित्र निर्माणशाला',
    description: 'Construct interactive horizontal box and whisker plots from five-number summaries (Min, Q1, Median, Q3, Max) and compare distributions of two datasets.',
    descriptionNepali: 'पाँच-संख्यात्मक सारांश (Min, Q1, Median, Q3, Max) बाट बाकस र जुँगा रेखाचित्र निर्माण गर्ने र दुई समूहका नतिजा तुलना गर्ने।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Determine the Five-Number Summary: Min, Q1, Median, Q3, and Max from a dataset',
      'Construct a Box and Whisker Plot on a calibrated horizontal number line',
      'Interpret box width as middle 50% spread and whiskers as lower/upper 25% ranges',
      'Compare two box plots side-by-side to evaluate median performance and variability',
    ],
    learningObjectivesNepali: [
      'कुनै तथ्याङ्कबाट पाँच-संख्यात्मक सारांश (Min, Q1, Median, Q3, Max) पत्ता लगाउन',
      'संख्या रेखामा शुद्ध मापनसहित बाकस र जुँगा रेखाचित्र निर्माण गर्न',
      'बाकसले बीचको ५०% फैलावट र जुँगाले तल्लो तथा माथिल्लो २५% फैलावट जनाउने बुझ्न',
      'दुई समूहका रेखाचित्र तुलना गरी मध्यिका र भिन्नताको विश्लेषण गर्न',
    ],
    tags: ['optmath', 'grade9', 'statistics', 'box-plot', 'five-number-summary', 'whiskers'],
  },

  // ── UNIT 6: LIMIT (सीमा) ──────────────────────────────────────────────────
  {
    code: 'SIM-OPTMATH-G9-U6-01',
    key: 'class9-optmath-u6-infinity-approaching-values-explorer',
    chapterNumber: 6,
    chapterName: 'Limit - Infinity and Division by Zero',
    chapterNameNepali: 'सीमा - अनन्त तथा शून्यले भाग गर्दाको अवस्था',
    title: 'Infinity and Approaching Values Explorer',
    titleNepali: 'अनन्त तथा नजिकिँदाको मान अन्वेषक',
    description: 'Explore the concept of positive and negative infinity, observe why division by zero is undefined via dynamic limits (5/x as x → 0), and demystify 0/0 indeterminate forms.',
    descriptionNepali: 'धनात्मक तथा ऋणात्मक अनन्त (±∞) को अवधारणा, शून्यले भाग गर्दा किन अपरिभाषित हुन्छ (५/x जहाँ x → ०), र ०/० अनिर्धार्य रूप बुझ्ने अन्वेषक।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand infinity (∞) as an unbounded concept rather than a finite real number',
      'Observe dynamic quotients as denominators approach zero from left (x → 0⁻) and right (x → 0⁺)',
      'Explain why division by zero is undefined in real mathematics',
      'Understand indeterminate form 0/0 and why factorization reveals unique limiting values',
    ],
    learningObjectivesNepali: [
      'अनन्त (∞) संख्या नभई असीमित विस्तारको अवधारणा हो भन्ने बुझ्न',
      'हर शून्य नजिकिँदा भागफल कसरी अनन्ततर्फ जान्छ प्रत्यक्ष हेर्न',
      'गणितमा शून्यले भाग गर्दा किन अपरिभाषित हुन्छ भन्ने कारण स्पष्ट पार्न',
      '०/० अनिर्धार्य रूप र खण्डीकरणले निश्चित सीमा मान दिने तरिका सिक्न',
    ],
    tags: ['optmath', 'grade9', 'limit', 'infinity', 'division-by-zero', 'indeterminate-form'],
  },
  {
    code: 'SIM-OPTMATH-G9-U6-02',
    key: 'class9-optmath-u6-limit-infinite-series-lab',
    chapterNumber: 6,
    chapterName: 'Limit - Sequences and Infinite Series',
    chapterNameNepali: 'सीमा - अनुक्रम तथा अनन्त श्रेणीको योग',
    title: 'Limit and Infinite Series Visual Lab',
    titleNepali: 'सीमा तथा अनन्त श्रेणी दृश्य प्रयोगशाला',
    description: 'Visualize limits of sequences (1/n → 0 as n → ∞), geometric limits of inscribed regular polygons approaching circles, and partial sums of infinite series (1/2 + 1/4 + 1/8 + ... → 1).',
    descriptionNepali: 'अनुक्रमको सीमा (१/n → ० जहाँ n → ∞), वृत्तभित्रका बहुभुजको ज्यामितीय सीमा, र अनन्त श्रेणीका आंशिक योगहरू (१/२ + १/४ + १/८ + ... → १) को दृश्य प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Explore sequence limits: lim (n→∞) 1/n = 0 using numerical tables and scatter plots',
      'Visualize geometric limits: regular polygons approaching circle circumference and area as sides n → ∞',
      'Compute partial sums Sn of infinite geometric series: 1/2 + 1/4 + 1/8 + ...',
      'Understand that the sum of an infinite convergent series is the limit of its partial sums',
    ],
    learningObjectivesNepali: [
      'अनुक्रमको सीमा lim (n→∞) 1/n = 0 तालिका र ग्राफबाट अन्वेषण गर्न',
      'भुजाहरू बढ्दै जाँदा बहुभुजको क्षेत्रफल र परिमिति वृत्तको मानमा पुग्ने ज्यामितीय सीमा हेर्न',
      'अनन्त ज्यामितीय श्रेणी १/२ + १/४ + १/८ + ... का आंशिक योगहरू (Sn) निकाल्न',
      'अनन्त श्रेणीको योग भनेको आंशिक योगहरूको अनुक्रमको सीमा हो भन्ने बुझ्न',
    ],
    tags: ['optmath', 'grade9', 'limit', 'sequence', 'infinite-series', 'geometric-limit', 'partial-sums'],
  },
  {
    code: 'SIM-OPTMATH-G9-U6-03',
    key: 'class9-optmath-u6-function-limit-graph-lab',
    chapterNumber: 6,
    chapterName: 'Limit - Limits of Functions',
    chapterNameNepali: 'सीमा - फलनको सीमा तथा ग्राफ',
    title: 'Function Limit and Graph Investigation Lab',
    titleNepali: 'फलनको सीमा तथा ग्राफ अनुसन्धानशाला',
    description: 'Investigate function limits, Left-Hand Limits (x → a⁻), Right-Hand Limits (x → a⁺), removable discontinuities (holes), and the condition for limit existence (LHL = RHL = L).',
    descriptionNepali: 'फलनको सीमा, बायाँ सीमा (x → a⁻), दायाँ सीमा (x → a⁺), विच्छिन्नता (Holes), र सीमा अस्तित्वको सर्त (LHL = RHL = L) को अनुसन्धानशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Evaluate limits of linear and rational functions using tables of approaching values',
      'Distinguish between left-hand limit (x → a⁻) and right-hand limit (x → a⁺)',
      'Apply the existence criterion: lim f(x) exists if and only if LHL = RHL = L',
      'Differentiate between the function value f(a) and the limiting value lim(x→a) f(x)',
    ],
    learningObjectivesNepali: [
      'नजिकिँदो मानहरूको तालिका प्रयोग गरी रेखीय तथा परिमेय फलनहरूको सीमा निकाल्न',
      'बायाँ सीमा (x → a⁻) र दायाँ सीमा (x → a⁺) बीचको भिन्नता छुट्याउन',
      'सीमा अस्तित्वको सर्त (LHL = RHL = L) लागू गरी सीमा छ वा छैन निर्णय गर्न',
      'फलनको वास्तविक मान f(a) र सीमा मान lim f(x) बीचको भिन्नता बुझ्न',
    ],
    tags: ['optmath', 'grade9', 'limit', 'function-limit', 'lhl', 'rhl', 'graphical-limits'],
  },
];

async function seed() {
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}`);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  for (const s of CLASS9_OPTMATH_SIMS_U4_U6) {
    const doc = {
      code: s.code,
      title: s.title,
      titleNepali: s.titleNepali,
      description: s.description,
      descriptionNepali: s.descriptionNepali,
      subjectCode: 'OPTMATH-G9',
      subjectName: 'Grade 9 Optional Mathematics',
      gradeLevels: [9],
      chapterNumber: s.chapterNumber,
      chapterName: s.chapterName,
      chapterNameNepali: s.chapterNameNepali,
      simulationType: s.simulationType,
      componentKey: s.key,
      runtimeUrl: `/simulations/class9-optmath/${s.key}`,
      difficulty: 'INTERMEDIATE',
      estimatedDurationMinutes: 15,
      learningObjectives: s.learningObjectives,
      learningObjectivesNepali: s.learningObjectivesNepali,
      isPublished: true,
      currentVersion: '1.0.0',
      tags: s.tags,
    };

    await Simulation.findOneAndUpdate({ code: s.code }, { $set: doc }, { upsert: true, new: true });
    console.log(`Upserted simulation: [${s.code}] ${s.title} (${s.key})`);
  }

  const count = await Simulation.countDocuments({ subjectCode: 'OPTMATH-G9' });
  console.log(`\nTotal Grade 9 Optional Mathematics simulations now in DB: ${count}`);

  await mongoose.connection.close();
  console.log('Database connection closed.');
}

seed().catch((err) => {
  console.error('Error seeding Grade 9 Optional Mathematics simulations:', err);
  process.exit(1);
});

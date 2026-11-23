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
  // ── UNIT 4: CURRENCY AND EXCHANGE RATE (मुद्रा र विनिमय दर) ───────────────
  {
    code: 'SIM-MATH-G10-U4-01',
    key: 'class10-math-u4-currency-exchange-lab',
    chapterNumber: 4,
    chapterName: 'Currency and Exchange Rate',
    chapterNameNepali: 'मुद्रा र विनिमय दर',
    title: 'Currency Exchange and Conversion Laboratory',
    titleNepali: 'मुद्रा विनिमय तथा रूपान्तरण प्रयोगशाला',
    description: 'Explore Nepal Rastra Bank foreign currency rates, understand buying vs. selling rates from bank customer perspectives, master chain rule cross-currency conversion, calculate customs duty & travel currency devaluation, and solve real-life practice problems.',
    descriptionNepali: 'नेपाल राष्ट्र बैंकको विदेशी मुद्रा विनिमय दर, बैंक ग्राहक दृष्टिकोणबाट खरिद र बिक्री दरको अन्तर, चेन रुलबाट बहुमुद्रा रूपान्तरण, भन्सार महसुल तथा मुद्रा अवमूल्यन र व्यावहारिक समस्या समाधान।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Differentiate between bank buying rate and bank selling rate with customer transactions',
      'Convert foreign currencies into Nepalese Rupees (NPR) and vice versa using daily exchange rates',
      'Apply the Chain Rule: A = B, B = C, C = D => Product of LHS = Product of RHS for triangular/cross-currency arbitrage',
      'Calculate devaluation or revaluation effects, money exchange commission, and import customs duty',
      'Solve practical word problems aligned with Nepal CDC Grade 10 textbook exercises',
    ],
    learningObjectivesNepali: [
      'बैंकको खरिद दर र बिक्री दर बीचको भिन्नता ग्राहकको कारोबार अनुसार पहिचान गर्न',
      'दैनिक विनिमय दरका आधारमा विदेशी मुद्रालाई नेपाली रुपैयाँमा र नेपाली रुपैयाँलाई विदेशी मुद्रामा रूपान्तरण गर्न',
      'चेन रुल (Chain Rule) को प्रयोग गरी तेस्रो मुद्रा मार्फत क्रस-विनिमय दर पत्ता लगाउन',
      'मुद्रा अवमूल्यन (Devaluation), अधिमूल्यन, कमिसन तथा भन्सार महसुलका व्यावहारिक हिसाब गर्न',
      'नेपाल पाठ्यक्रम विकास केन्द्र कक्षा १० को पाठ्यपुस्तक आधारित शाब्दिक समस्याहरू समाधान गर्न',
    ],
    tags: ['math-g10', 'grade10', 'currency-exchange', 'nrb-rates', 'buying-rate', 'selling-rate', 'chain-rule', 'devaluation'],
  },

  // ── UNIT 5: AREA AND VOLUME (क्षेत्रफल र आयतन) ────────────────────────────
  {
    code: 'SIM-MATH-G10-U5-01',
    key: 'class10-math-u5-3d-geometry-explorer',
    chapterNumber: 5,
    chapterName: 'Area and Volume',
    chapterNameNepali: 'क्षेत्रफल र आयतन',
    title: '3D Geometry: Area and Volume Explorer',
    titleNepali: '३डी ज्यामिति: क्षेत्रफल तथा आयतन अन्वेषक',
    description: 'Explore square pyramids with interactive 2D net unfolding, right circular cones with sector relations, combined 3D solids (cylinder+cone, cone+hemisphere, cylinder+hemisphere) with strictly exposed surface areas, and cylinder/spherical water tank capacity & painting cost calculation.',
    descriptionNepali: 'वर्गाकार पिरामिड र २डी नेटको खोलिने/बन्द हुने रूप, सोली र वृत्तखण्डको सम्बन्ध, संयुक्त ठोस वस्तुहरू (बेलना+सोली, सोली+अर्धगोला, बेलना+अर्धगोला) को बाहिरी सतह क्षेत्रफल तथा पानी ट्यांकीको क्षमता र रङ लगाउने लागत अन्वेषण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand the geometric relationship between vertical height h, base edge a, and slant height l of a square pyramid: l = √(h² + (a/2)²)',
      'Unfold and inspect 2D nets of pyramids and cones to verify Total Surface Area (TSA) and Curved Surface Area (CSA)',
      'Compute strictly exposed surface area and composite volume of combined 3D solids without internal joining bases',
      'Differentiate when to apply CSA vs TSA for real-world structures like stupas, circus tents, and conical toys',
      'Calculate water tank storage capacity in liters and estimate construction and painting costs',
    ],
    learningObjectivesNepali: [
      'वर्गाकार पिरामिडको ठाडो उचाइ h, आधार किनारा a र छड्के उचाइ l बीचको सम्बन्ध l = √(h² + (a/२)²) बुझ्न',
      'पिरामिड र सोलीका २डी नेट (Net) खोलेर र जोडेर बाहिरी सतह तथा पुरा सतह क्षेत्रफल प्रमाणित गर्न',
      'संयुक्त ठोस वस्तुहरूको भित्री जोडिएका सतहहरू हटाई वास्तविक देखिने बाहिरी सतहको क्षेत्रफल र कुल आयतन निकाल्न',
      'स्तूप, सर्कसको पाल र खेलौना जस्ता वस्तुहरूमा वक्र सतह र पुरा सतहको व्यावहारिक प्रयोग छुट्याउन',
      'पानी ट्यांकीको लिटरमा क्षमता निकाल्न र रङ लगाउने तथा निर्माण खर्चको यथार्थपरक लागत अनुमान गर्न',
    ],
    tags: ['math-g10', 'grade10', '3d-geometry', 'pyramid', 'cone', 'combined-solids', 'exposed-surface-area', 'volume', 'tank-cost'],
  },

  // ── UNIT 6: SEQUENCE AND SERIES (अनुक्रम र श्रेणी) ─────────────────────────
  {
    code: 'SIM-MATH-G10-U6-01',
    key: 'class10-math-u6-sequence-series-lab',
    chapterNumber: 6,
    chapterName: 'Sequence and Series',
    chapterNameNepali: 'अनुक्रम र श्रेणी',
    title: 'Sequence and Series Pattern Laboratory',
    titleNepali: 'अनुक्रम र श्रेणी नमुना प्रयोगशाला',
    description: 'Investigate Arithmetic Progression (AP) with visual staircase bars, insert Arithmetic Means on a continuous number line, derive AP sum Sn using the Gauss pair trick, explore Geometric Progression (GP) with exponential growth curves, insert Geometric Means, and compute GP series sums.',
    descriptionNepali: 'सिँढी चित्र मार्फत समानान्तर अनुक्रम (AP) अन्वेषण, संख्या रेखामा समानान्तर मध्यक (AM) घुसाउने, गौसको जोडी विधिबाट समानान्तर श्रेणीको योगफल (Sn), घाताङ्कीय वक्रबाट गुणोत्तर अनुक्रम (GP), गुणोत्तर मध्यक (GM) र श्रेणी योगफलको प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Model Arithmetic Progressions (AP) using the general term formula: t_n = a + (n - 1)d',
      'Insert k Arithmetic Means between two numbers a and b with step difference d = (b - a) / (k + 1)',
      'Derive and visualize the sum of an AP series: S_n = (n/2)[2a + (n - 1)d] = (n/2)(a + l)',
      'Model Geometric Progressions (GP) with common ratio r and exponential term formula: t_n = a · r^(n - 1)',
      'Insert k Geometric Means between a and b using r = (b/a)^(1/(k + 1))',
      'Calculate the sum of finite geometric series S_n and compare linear AP vs exponential GP accumulation',
    ],
    learningObjectivesNepali: [
      'सामान्य पद सूत्र t_n = a + (n - १)d प्रयोग गरी समानान्तर अनुक्रम (AP) मोडेल गर्न',
      'दुई संख्या a र b बीच साझा अन्तर d = (b - a) / (k + १) निकालेर k वटा समानान्तर मध्यक (AM) पत्ता लगाउन',
      'समानान्तर श्रेणीको योगफल सूत्र S_n = (n/२)[२a + (n - १)d] = (n/२)(a + l) दृश्य रूपमा बुझ्न',
      'साझा अनुपात r र घाताङ्कीय पद सूत्र t_n = a · r^(n - १) प्रयोग गरी गुणोत्तर अनुक्रम (GP) मोडेल गर्न',
      'r = (b/a)^(१/(k + १)) सूत्रबाट दुई संख्या बीच k वटा गुणोत्तर मध्यक (GM) घुसाउन',
      'गुणोत्तर श्रेणीको योगफल S_n निकाल्न र रेखीय (AP) तथा घाताङ्कीय (GP) वृद्धिको भिन्नता तुलना गर्न',
    ],
    tags: ['math-g10', 'grade10', 'sequence-and-series', 'arithmetic-progression', 'arithmetic-means', 'ap-sum', 'geometric-progression', 'geometric-means', 'gp-sum'],
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
  console.error('Error seeding Grade 10 Mathematics simulations (Units 4-6):', err);
  process.exit(1);
});

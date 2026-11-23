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

const CLASS9_U5_U6_SIMS = [
  // ── UNIT 5: AREA (क्षेत्रफल) ──────────────────────────────────────────────
  {
    code: 'SIM-MATH-G9-U5-01',
    key: 'class9-math-u5-herons-formula-land-explorer',
    chapterNumber: 5,
    chapterName: 'Area',
    chapterNameNepali: 'क्षेत्रफल',
    title: "Heron's Formula and Land Area Explorer",
    titleNepali: 'हिरोनको सूत्र तथा जग्गा क्षेत्रफल अन्वेषक',
    description: "Explore the area of scalene triangles using Heron's formula (A = √[s(s - a)(s - b)(s - c)]), semi-perimeter calculation, triangle inequality verification, and quadrilateral land plot area calculation by diagonal division into two triangles.",
    descriptionNepali: 'हिरोनको सूत्र (A = √[s(s - a)(s - b)(s - c)]) प्रयोग गरी विषमबाहु त्रिभुजको क्षेत्रफल, अर्ध-परिमिति, त्रिभुज अस्तित्वको नियम र विकर्ण खिचेर चतुर्भुजलाई दुई त्रिभुजमा विभाजन गरी जग्गाको क्षेत्रफल निकाल्ने सिमुलेटर।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand the area of scalene triangles when height is unknown',
      'Calculate semi-perimeter s = (a + b + c)/2 and verify triangle inequality',
      "Apply Heron's formula step by step to solve triangular and quadrilateral land plot problems",
    ],
    learningObjectivesNepali: [
      'उचाइ थाहा नभएको अवस्थामा विषमबाहु त्रिभुजको क्षेत्रफल बुझ्न',
      'अर्ध-परिमिति s = (a + b + c)/२ निकाल्न र त्रिभुज सम्भाव्यता जाँच्न',
      'हिरोनको सूत्र चरणबद्ध रुपमा प्रयोग गरी त्रिभुज र चतुर्भुजाकार जग्गाको क्षेत्रफल निकाल्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ["heron's formula", 'scalene triangle', 'semi-perimeter', 'quadrilateral', 'land area', 'grade 9'],
  },
  {
    code: 'SIM-MATH-G9-U5-02',
    key: 'class9-math-u5-room-area-painting-cost',
    chapterNumber: 5,
    chapterName: 'Area',
    chapterNameNepali: 'क्षेत्रफल',
    title: 'Room Area and Painting Cost Simulator',
    titleNepali: 'कोठाको क्षेत्रफल तथा रङरोगन खर्च सिमुलेटर',
    description: 'Interactive 3D room simulator calculating floor area (l × b), ceiling area, four walls area (2h(l + b)), and subtracting doors and windows for net painting area, carpet flooring costs, and total renovation budget.',
    descriptionNepali: 'आयताकार तथा घनाकार कोठाको भुइँ (l × b), सिलिङ, चार भित्ता [२h(l + b)], ढोका र झ्यालको क्षेत्रफल घटाई खुद रङरोगन क्षेत्रफल र कार्पेट तथा रङरोगनको कुल लागत अनुमान सिमुलेटर।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate areas of floor, ceiling, and four walls of rectangular and cubical rooms',
      'Subtract custom door and window openings from total four-wall area to find net paintable surface',
      'Estimate plastering, painting, and carpeting costs using cost per square meter rates',
    ],
    learningObjectivesNepali: [
      'आयताकार र घनाकार कोठाको भुइँ, सिलिङ र चार भित्ताको क्षेत्रफल हिसाब गर्न',
      'चार भित्ताको क्षेत्रफलबाट ढोका र झ्यालको क्षेत्रफल घटाई खुद रङ लगाउने क्षेत्रफल निकाल्न',
      'प्रति वर्ग मिटर दरका आधारमा रङरोगन र कार्पेट बिछ्याउने कुल खर्च अनुमान गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['room area', 'four walls', 'floor area', 'painting cost', 'carpet cost', 'doors and windows'],
  },
  {
    code: 'SIM-MATH-G9-U5-03',
    key: 'class9-math-u5-nepal-land-area-converter',
    chapterNumber: 5,
    chapterName: 'Area',
    chapterNameNepali: 'क्षेत्रफल',
    title: 'Nepal Land Measurement and Area Converter',
    titleNepali: 'नेपाल जग्गा नाप तथा क्षेत्रफल रूपान्तरण',
    description: 'Authentic Nepal government land measurement system converting between Ropani, Aana, Paisa, Daam (Pahari system) and Bigha, Kattha, Dhur (Terai system), with square feet, square meters, and virtual plot designer.',
    descriptionNepali: 'नेपालको पहाडी प्रथा (रोपनी-आना-पैसा-दाम) र तराई प्रथा (बिघा-कट्ठा-धुर) बीच पारस्परिक रूपान्तरण, वर्ग फिट तथा वर्ग मिटर हिसाब र भर्चुअल घडेरी नाप कार्यक्षेत्र।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand the Ropani-Aana-Paisa-Daam system (1 Ropani = 16 Aana = 64 Paisa = 256 Daam = 5476 sq ft)',
      'Understand the Bigha-Kattha-Dhur system (1 Bigha = 20 Kattha = 400 Dhur = 72900 sq ft)',
      'Convert land areas between traditional Nepali units and metric / imperial standards',
    ],
    learningObjectivesNepali: [
      'रोपनी-आना-पैसा-दाम प्रणाली (१ रोपनी = १६ आना = ६४ पैसा = २५६ दाम = ५४७६ वर्ग फिट) बुझ्न',
      'बिघा-कट्ठा-धुर प्रणाली (१ बिघा = २० कट्ठा = ४०० धुर = ७२९०० वर्ग फिट) बुझ्न',
      'परम्परागत नेपाली जग्गा एकाइ र वर्ग मिटर/फिट बीच पारस्परिक रूपान्तरण गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['land measurement', 'ropani', 'aana', 'paisa', 'daam', 'bigha', 'kattha', 'dhur', 'conversions'],
  },

  // ── UNIT 6: PRISM (प्रिज्म) ───────────────────────────────────────────────
  {
    code: 'SIM-MATH-G9-U6-01',
    key: 'class9-math-u6-explore-build-prism',
    chapterNumber: 6,
    chapterName: 'Prism',
    chapterNameNepali: 'प्रिज्म',
    title: 'Explore and Build a Prism',
    titleNepali: 'प्रिज्मको अन्वेषण तथा निर्माण',
    description: "Explore 3D prisms (triangular, rectangular, cubical, trapezoidal) with rotation, congruent parallel bases, rectangular lateral faces, cross-section slicing planes, and Euler's formula verification (V - E + F = 2).",
    descriptionNepali: 'त्रिभुजाकार, आयताकार, घनाकार र समलम्बाकार प्रिज्मका ३D स्वरूप, सर्वसम आधार, छड्के सतह, अनुप्रस्थ काट र ओयलरको सूत्र (V - E + F = २) को अन्तरक्रियात्मक अन्वेषण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Identify prisms as 3D solids bounded by two congruent parallel bases and lateral faces',
      "Verify Euler's formula V - E + F = 2 for various prism types",
      'Understand that slicing planes parallel to the base produce identical uniform cross-sections',
    ],
    learningObjectivesNepali: [
      'प्रिज्मका दुई सर्वसम र समानान्तर आधार तथा छड्के सतहहरू पहिचान गर्न',
      'विभिन्न प्रिज्महरूमा ओयलरको सूत्र V - E + F = २ प्रमाणित गर्न',
      'आधारसँग समानान्तर हुने अनुप्रस्थ काट एकसमान र सर्वसम हुने तथ्य बुझ्न',
    ],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    tags: ['prism', '3d solids', 'congruent bases', 'cross section', "euler's formula", 'vertices edges faces'],
  },
  {
    code: 'SIM-MATH-G9-U6-02',
    key: 'class9-math-u6-surface-area-laboratory',
    chapterNumber: 6,
    chapterName: 'Prism',
    chapterNameNepali: 'प्रिज्म',
    title: 'Lateral and Total Surface Area Laboratory',
    titleNepali: 'प्रिज्मको छड्के र कुल सतहको क्षेत्रफल प्रयोगशाला',
    description: 'Calculate Lateral Surface Area (LSA = P × h) and Total Surface Area (TSA = 2A + P × h) with an interactive 2D net unfolding animation for triangular, rectangular, and cubical prisms.',
    descriptionNepali: 'त्रिभुजाकार, आयताकार र घनाकार प्रिज्मको २D नेट फुकाउने एनिमेसन, छड्के सतह (LSA = P × h) र कुल सतह (TSA = २A + P × h) को चरणबद्ध प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate base perimeter P, base area A, and height h of prisms',
      'Compute Lateral Surface Area (LSA = P × h) and Total Surface Area (TSA = 2A + P × h)',
      'Visualize 3D solid unfolding into a 2D net showing the relationship between net parts and surface area',
    ],
    learningObjectivesNepali: [
      'प्रिज्मको आधारको परिमिति P, आधारको क्षेत्रफल A र लम्बाइ h पत्ता लगाउन',
      'छड्के सतह (LSA = P × h) र कुल सतह (TSA = २A + P × h) को सूत्र प्रयोग गरी हिसाब गर्न',
      '३D ठोसलाई २D नेटमा फुकाई सतहहरूको योगफल र सूत्र बीचको सम्बन्ध अवलोकन गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['prism', 'lateral surface area', 'total surface area', 'net unfolding', 'lsa', 'tsa'],
  },
  {
    code: 'SIM-MATH-G9-U6-03',
    key: 'class9-math-u6-prism-volume-water-tank',
    chapterNumber: 6,
    chapterName: 'Prism',
    chapterNameNepali: 'प्रिज्म',
    title: 'Prism Volume and Water Tank Designer',
    titleNepali: 'प्रिज्मको आयतन तथा पानी ट्याङ्की डिजाइन',
    description: 'Calculate prism volume (V = A × h), design rectangular, cubical, and triangular water tanks, simulate water fill levels, and convert between cubic meters, liters (1 m³ = 1,000 L), and pumping time.',
    descriptionNepali: 'प्रिज्मको आयतन (V = A × h) बाट पानी ट्याङ्कीको डिजाइन, पानीको स्तर नियन्त्रण, घन मिटर र लिटर (१ m³ = १,००० लिटर) रूपान्तरण र पम्प प्रवाह दर सिमुलेटर।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate volume of rectangular, cubical, and triangular prisms using V = Base Area × Height',
      'Convert volume from cubic meters and cubic centimeters into liters (1 m³ = 1000 L, 1000 cm³ = 1 L)',
      'Apply water volume calculations to real-life household water tanks and pumping time problems',
    ],
    learningObjectivesNepali: [
      'प्रिज्मको आयतन V = आधारको क्षेत्रफल × उचाइ सूत्र प्रयोग गरी आयतन निकाल्न',
      'घन मिटर र घन सेन्टिमिटरलाई लिटरमा (१ m³ = १००० लि., १००० cm³ = १ लि.) रूपान्तरण गर्न',
      'घरायसी पानी ट्याङ्की, मोटर पम्पको समय र परिवारको पानी उपभोग अवधि हिसाब गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['volume', 'water tank', 'prism volume', 'liters conversion', 'cubic meters', 'flow rate'],
  },
];

async function seedClass9MathU5U6() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB successfully.');

  for (const sim of CLASS9_U5_U6_SIMS) {
    const doc = {
      code: sim.code,
      title: sim.title,
      titleNepali: sim.titleNepali,
      description: sim.description,
      descriptionNepali: sim.descriptionNepali,
      subjectCode: 'MATH-G9',
      subjectName: 'Mathematics',
      gradeLevels: [9],
      chapterNumber: sim.chapterNumber,
      chapterName: sim.chapterName,
      chapterNameNepali: sim.chapterNameNepali,
      simulationType: sim.simulationType,
      componentKey: sim.key,
      runtimeUrl: `/simulations/player/${sim.code}`,
      difficulty: sim.difficulty,
      estimatedDurationMinutes: sim.estimatedDurationMinutes,
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
    console.log(`Upserted simulation: [${res.code}] ${res.title}`);
  }

  const totalCount = await Simulation.countDocuments({ gradeLevels: 9 });
  console.log(`Total Grade 9 simulations in database: ${totalCount}`);

  await mongoose.disconnect();
  console.log('MongoDB connection closed.');
}

seedClass9MathU5U6().catch((err) => {
  console.error('Error seeding Grade 9 Units 5 and 6 simulations:', err);
  process.exit(1);
});

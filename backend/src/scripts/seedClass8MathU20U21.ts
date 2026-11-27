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

const CLASS8_U20_U21_SIMS = [
  // ── UNIT 20: BEARING AND SCALE DRAWING (दिगंश र मापन चित्र) ───────────
  {
    code: 'SIM-MATH-G8-U20-01',
    key: 'class8-math-u20-compass-bearing-explorer',
    chapterNumber: 20,
    chapterName: 'Bearing and Scale Drawing',
    chapterNameNepali: 'दिगंश र मापन चित्र',
    title: 'Interactive Compass and Bearing Explorer',
    titleNepali: 'कम्पास र दिगंश अन्वेषक',
    description: 'Explore 360° circular bearing compass, clockwise angle from North, three-digit bearing notation (e.g. 045°, 090°, 225°), and forward versus reverse bearing calculations.',
    descriptionNepali: '३६०° गोलाकार कम्पास, उत्तर दिशाबाट घडीको दिशामा ३-अङ्क दिगंश (जस्तै ०४५°, ०९०°, २२५°), दुई स्थान बीचको दिगंश र विपरित दिगंश हिसाबको अन्तरक्रियात्मक अन्वेषण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand bearing as the angle measured clockwise from North to an object direction',
      'Format and interpret three-digit bearings correctly (e.g. 030°, 090°, 270°)',
      'Calculate reverse or reciprocal bearings: add 180° if < 180°, subtract 180° if >= 180°',
    ],
    learningObjectivesNepali: [
      'उत्तर दिशाबाट घडीको दिशामा नापिने कोणलाई दिगंश भनिन्छ भनी बुझ्न',
      'सधैं ३ अङ्कमा दिगंश लेख्ने र पढ्ने तरिका सिक्न (जस्तै ०३०°, ०९०°)',
      'अगाडिको दिगंशबाट विपरित दिगंश (Reverse Bearing) हिसाब गर्न (+१८०° वा -१८०°)',
    ],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    tags: ['bearing', 'compass', 'three-digit bearing', 'reverse bearing', 'navigation', 'direction'],
  },
  {
    code: 'SIM-MATH-G8-U20-02',
    key: 'class8-math-u20-scale-drawing-studio',
    chapterNumber: 20,
    chapterName: 'Bearing and Scale Drawing',
    chapterNameNepali: 'दिगंश र मापन चित्र',
    title: 'Scale Drawing and Map Measurement Studio',
    titleNepali: 'मापन चित्र र नक्सा मापन स्टुडियो',
    description: 'Interactive map-drawing workspace with ruler grid, scale selector (1 cm = 10 m to 500 m), and real-time conversion between map distance and actual ground distance.',
    descriptionNepali: 'विद्यालय नक्सा कार्यक्षेत्र, मापन अनुपात (१ सेमी = १० मिटर देखि ५०० मिटर), स्केल रुलर र नक्साको दूरीबाट वास्तविक जमिनको दूरी गणना स्टुडियो।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand proportional scale drawing concepts and scale factors',
      'Calculate Actual Distance = Map Distance × Scale Factor and Map Distance = Actual Distance ÷ Scale Factor',
      'Measure and scale distances on school and landscape maps using realistic grids',
    ],
    learningObjectivesNepali: [
      'नक्साको मापन अनुपात र स्केल गुणकको अवधारणा बुझ्न',
      'वास्तविक दूरी = नक्साको दूरी × मापन अनुपात सूत्र प्रयोग गरी हिसाब गर्न',
      'विद्यालयको नक्सामा दुई स्थान बीचको दूरी मापन र वास्तविक दूरी गणना गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['scale drawing', 'map scale', 'actual distance', 'map distance', 'measurement', 'ruler'],
  },
  {
    code: 'SIM-MATH-G8-U20-03',
    key: 'class8-math-u20-navigation-challenge',
    chapterNumber: 20,
    chapterName: 'Bearing and Scale Drawing',
    chapterNameNepali: 'दिगंश र मापन चित्र',
    title: 'Bearing and Scale Navigation Challenge',
    titleNepali: 'दिगंश र मापन नेभिगेसन चुनौती',
    description: 'Combine bearing and scale drawing to solve multi-leg village navigation missions, route plotting from Home to School, Health Post, Temple, and return journey calculations.',
    descriptionNepali: 'दिगंश र मापन चित्र मिलाएर बहु-चरणे गाउँ नेभिगेसन मिसन हल गर्ने, घरबाट विद्यालय वा अस्पतालको बाटो रेखाङ्कन र सुरक्षित फिर्ती यात्रा दिगंश पत्ता लगाउने चुनौती।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Integrate bearing angles and scale distances to plot multi-stage journeys on a coordinate map',
      'Calculate reverse return bearings to navigate back to starting points',
      'Solve practical navigation challenges using realistic village and terrain scenarios',
    ],
    learningObjectivesNepali: [
      'दिगंश कोण र मापन दूरी दुवै प्रयोग गरी बहु-चरणे यात्रा मार्ग रेखाङ्कन गर्न',
      'गन्तव्यबाट सुरुवाती स्थान फर्कन चाहिने विपरित दिगंश हिसाब गर्न',
      'गाउँको नक्सामा व्यावहारिक यात्रा र नेभिगेसन समस्याहरू समाधान गर्न',
    ],
    difficulty: 'ADVANCED',
    estimatedDurationMinutes: 20,
    tags: ['bearing', 'scale drawing', 'navigation challenge', 'route plotting', 'multi-leg journey'],
  },

  // ── UNIT 21: STATISTICS (तथ्याङ्कशास्त्र) ──────────────────────────────
  {
    code: 'SIM-MATH-G8-U21-01',
    key: 'class8-math-u21-data-visualization-lab',
    chapterNumber: 21,
    chapterName: 'Statistics',
    chapterNameNepali: 'तथ्याङ्कशास्त्र',
    title: 'Statistical Data Visualization Lab',
    titleNepali: 'तथ्याङ्किय तथ्याङ्क चित्र प्रयोगशाला',
    description: 'Organize raw data into frequency distribution tables, bar graphs, line graphs, and pie charts with central angle calculations (theta = f/N * 360°).',
    descriptionNepali: 'कच्चा तथ्याङ्कलाई बारम्बारता तालिका, स्तम्भ चित्र, बिन्दु रेखाचित्र र केन्द्रीय कोण सूत्र ((f/N) × ३६०°) द्वारा वृत्तचित्रमा रूपान्तरण गर्ने प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Construct and interpret frequency distribution tables and totals',
      'Build vertical bar graphs and line graphs showing trends and category comparisons',
      'Calculate pie chart sector angles using Sector Angle = (Category Value / Total Value) × 360°',
    ],
    learningObjectivesNepali: [
      'बारम्बारता तालिका निर्माण गर्न र कुल बारम्बारता N निकाल्न',
      'स्तम्भ चित्र र रेखाचित्रबाट अधिकतम, न्यूनतम तथा तुलनात्मक मानहरू पढ्न',
      'वृत्तचित्र बनाउन प्रत्येक समूहको केन्द्रीय कोण सूत्र प्रयोग गरी गणना गर्न',
    ],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    tags: ['statistics', 'data visualization', 'bar graph', 'pie chart', 'line graph', 'frequency table'],
  },
  {
    code: 'SIM-MATH-G8-U21-02',
    key: 'class8-math-u21-mean-median-mode-lab',
    chapterNumber: 21,
    chapterName: 'Statistics',
    chapterNameNepali: 'तथ्याङ्कशास्त्र',
    title: 'Mean, Median and Mode Discovery Lab',
    titleNepali: 'औसत, मध्यिका र बहुलक प्रयोगशाला',
    description: 'Step-by-step central tendency for individual series: Arithmetic Mean (sum X / n), animated Median sorting for odd and even datasets, and Mode frequency tallying.',
    descriptionNepali: 'व्यक्तिगत श्रेणीको केन्द्रीय प्रवृत्तिको नाप: औसत (Mean = sum X / n), बिजोर र जोर सङ्ख्याका लागि क्रमबद्ध मध्यिका (Median), र बढी दोहोरिने बहुलक (Mode) को चरणबद्ध हिसाब।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Compute arithmetic mean by summing observations and dividing by count n',
      'Order data and find median: value of [(n + 1)/2]th item for odd n, average of middle two for even n',
      'Identify the mode as the most frequently occurring value in the dataset',
    ],
    learningObjectivesNepali: [
      'सबै मानहरू जोडेर पद सङ्ख्या n ले भाग गरी औसत (Mean) निकाल्न',
      'तथ्याङ्कलाई क्रमबद्ध मिलाएर बिजोर र जोर पदका लागि मध्यिका (Median) पत्ता लगाउन',
      'सबैभन्दा बढी पटक दोहोरिएको मानलाई बहुलक (Mode) का रूपमा पहिचान गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['statistics', 'mean', 'median', 'mode', 'individual series', 'central tendency'],
  },
  {
    code: 'SIM-MATH-G8-U21-03',
    key: 'class8-math-u21-statistics-challenge-world',
    chapterNumber: 21,
    chapterName: 'Statistics',
    chapterNameNepali: 'तथ्याङ्कशास्त्र',
    title: 'Real-Life Statistics Challenge World',
    titleNepali: 'व्यावहारिक तथ्याङ्क चुनौती संसार',
    description: 'Real-world applied statistics missions: family monthly expenditure pie charts, health post children weight median analysis, and exam score mean evaluation.',
    descriptionNepali: 'दैनिक जीवनमा तथ्याङ्कशास्त्रको प्रयोग: पारिवारिक मासिक खर्च वृत्तचित्र, स्वास्थ्य चौकीमा बाल तौलको मध्यिका, र विद्यालय परीक्षा प्राप्ताङ्कको औसत विश्लेषण चुनौती।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Apply central angle formulas to family budget allocation scenarios',
      'Calculate median and mean weights and scores in realistic public health and school datasets',
      'Interpret and compare statistical summaries to make practical conclusions',
    ],
    learningObjectivesNepali: [
      'पारिवारिक बजेट तथ्याङ्कबाट वृत्तचित्रको केन्द्रीय कोण हिसाब गर्न',
      'स्वास्थ्य चौकी र विद्यालयका वास्तविक तथ्याङ्कबाट औसत र मध्यिका निकाल्न',
      'तथ्याङ्किय नतिजाहरू तुलना गरी व्यावहारिक निष्कर्ष निकाल्न',
    ],
    difficulty: 'ADVANCED',
    estimatedDurationMinutes: 20,
    tags: ['statistics', 'real-world', 'budget', 'health post', 'exam marks', 'applied math'],
  },
];

async function seedClass8MathU20U21() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    let insertedCount = 0;
    let updatedCount = 0;

    for (const sim of CLASS8_U20_U21_SIMS) {
      const doc = {
        code: sim.code,
        title: sim.title,
        titleNepali: sim.titleNepali,
        description: sim.description,
        descriptionNepali: sim.descriptionNepali,
        subjectCode: 'MATH-G8',
        subjectName: 'Grade 8 Mathematics',
        gradeLevels: [8],
        chapterNumber: sim.chapterNumber,
        chapterName: sim.chapterName,
        chapterNameNepali: sim.chapterNameNepali,
        simulationType: sim.simulationType,
        componentKey: sim.key,
        difficulty: sim.difficulty,
        estimatedDurationMinutes: sim.estimatedDurationMinutes,
        learningObjectives: sim.learningObjectives,
        learningObjectivesNepali: sim.learningObjectivesNepali,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: sim.tags,
      };

      const result = await Simulation.updateOne(
        { code: sim.code },
        { $set: doc },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        insertedCount++;
        console.log(`[INSERTED] ${sim.code}: ${sim.title}`);
      } else {
        updatedCount++;
        console.log(`[UPDATED] ${sim.code}: ${sim.title}`);
      }
    }

    console.log('\n--- SEED SUMMARY ---');
    console.log(`Total processed: ${CLASS8_U20_U21_SIMS.length}`);
    console.log(`Inserted: ${insertedCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log('Class 8 Math Units 20, 21 seeded successfully!');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Class 8 Math Units 20, 21:', error);
    process.exit(1);
  }
}

seedClass8MathU20U21();

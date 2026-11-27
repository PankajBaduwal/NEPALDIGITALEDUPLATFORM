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
  // ── UNIT 13: STATISTICS (तथ्याङ्क शास्त्र) ──────────────────────────────────
  {
    code: 'SIM-MATH-G10-U13-01',
    key: 'class10-math-u13-statistics-lab',
    chapterNumber: 13,
    chapterName: 'Statistics',
    chapterNameNepali: 'तथ्याङ्क शास्त्र',
    title: 'Interactive Statistics Laboratory',
    titleNepali: 'अन्तरक्रियात्मक तथ्याङ्क शास्त्र प्रयोगशाला',
    description: 'Explore grouped continuous frequency distributions: compute Mean using direct (Σfm/N) and assumed mean methods (A + Σfd/N), calculate Median (Md = L + [(N/2 - cf)/f] × h), find lower and upper quartiles (Q1, Q3), determine Mode using empirical grouped formula, inspect cumulative frequency tables, and visualize dynamic histograms with vertical mean, median, and mode indicators.',
    descriptionNepali: 'अविच्छिन्न श्रेणीको तथ्याङ्क अन्वेषण: प्रत्यक्ष र कल्पित मध्यक विधिबाट मध्यक (Mean), मध्यिका (Median = L + [(N/2 - cf)/f] × h), चतुर्थांशहरू (Q1, Q3), र बहुलक (Mode = L + [(f1 - f0)/(2f1 - f0 - f2)] × h) को प्रत्यक्ष गणना, सञ्चित बारम्बारता तालिका र गतिशील हिस्टोग्राम ग्राफ प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate Mean of continuous grouped data using both direct and assumed mean methods',
      'Determine Median, First Quartile (Q1), and Third Quartile (Q3) with step-by-step interpolation formula',
      'Compute Mode from continuous frequency distribution identifying modal class and frequency intervals',
      'Understand cumulative frequency (cf) tables and graphical representation via interactive histograms',
    ],
    learningObjectivesNepali: [
      'अविच्छिन्न तथ्याङ्कको मध्यक प्रत्यक्ष र कल्पित मध्यक दुवै विधिबाट निकाल्न',
      'मध्यिका (Median), पहिलो चतुर्थांश (Q1) र तेस्रो चतुर्थांश (Q3) को सूत्र प्रयोग गरी मान पत्ता लगाउन',
      'बहुलक वर्ग पहिचान गरी सूत्रबाट बहुलक (Mode) को मान गणना गर्न',
      'सञ्चित बारम्बारता तालिका र हिस्टोग्राम ग्राफको प्रत्यक्ष सम्बन्ध बुझ्न',
    ],
    tags: ['Grade 10', 'Mathematics', 'Statistics', 'Mean', 'Median', 'Mode', 'Quartiles', 'Histogram'],
  },

  // ── UNIT 14: PROBABILITY (सम्भाव्यता) ─────────────────────────────────────────
  {
    code: 'SIM-MATH-G10-U14-01',
    key: 'class10-math-u14-probability-tree-lab',
    chapterNumber: 14,
    chapterName: 'Probability',
    chapterNameNepali: 'सम्भाव्यता',
    title: 'Probability Experiment and Tree Diagram Lab',
    titleNepali: 'सम्भाव्यता प्रयोग तथा वृक्ष चित्र प्रयोगशाला',
    description: 'Master experimental and theoretical probability: generate sample spaces for coin and dice tosses, verify mutually exclusive vs non-exclusive events using addition laws P(A ∪ B), perform dynamic colored-balls urn experiments with replacement (independent) and without replacement (dependent), interact with recursive Probability Tree Diagrams (वृक्ष चित्र) with branch probabilities, and run empirical Monte Carlo simulations.',
    descriptionNepali: 'प्रयोगात्मक तथा सैद्धान्तिक सम्भाव्यता प्रयोगशाला: सिक्का र पासाको नमुना क्षेत्र (Sample Space), परस्पर निषेधित र अनिषेधित घटनाहरूको जोड नियम P(A ∪ B), पुनः राख्दा (With Replacement) र पुनः नराख्दा (Without Replacement) को झोलाबाट बल झिक्ने प्रयोग, रूख चित्र (Tree Diagram) र बहु-परीक्षण सिमुलेटर।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Define sample spaces for simple and compound events including multiple coins and dice',
      'Distinguish mutually exclusive events P(A ∪ B) = P(A) + P(B) from non-exclusive events P(A) + P(B) - P(A ∩ B)',
      'Construct and interpret Probability Tree Diagrams showing branch and joint probabilities',
      'Compare independent events (with replacement) and dependent events (without replacement)',
    ],
    learningObjectivesNepali: [
      'सिक्का तथा पासा उफार्दा प्राप्त हुने नमुना क्षेत्र (Sample Space) बनाउन',
      'परस्पर निषेधित (Mutually Exclusive) र अनिषेधित घटनाहरूको सम्भाव्यताको जोड नियम प्रयोग गर्न',
      'वृक्ष चित्र (Tree Diagram) निर्माण गरी विभिन्न घटनाहरूको संयुक्त सम्भाव्यता पत्ता लगाउन',
      'पुनः राख्दा (स्वतन्त्र घटना) र पुनः नराख्दा (आश्रित घटना) को भिन्नता बुझ्न',
    ],
    tags: ['Grade 10', 'Mathematics', 'Probability', 'Tree Diagram', 'Sample Space', 'Independent Events', 'Urn Model'],
  },

  // ── UNIT 15: TRIGONOMETRY (त्रिकोणमिति) ───────────────────────────────────────
  {
    code: 'SIM-MATH-G10-U15-01',
    key: 'class10-math-u15-heights-distances',
    chapterNumber: 15,
    chapterName: 'Trigonometry',
    chapterNameNepali: 'त्रिकोणमिति',
    title: 'Heights and Distances Explorer',
    titleNepali: 'उचाइ र दूरी अन्वेषक प्रयोगशाला',
    description: 'Explore real-world heights and distances problems using trigonometry: calculate height of temples, towers, and trees using angle of elevation (tan θ = (h - e)/d), analyze angle of depression from clifftops and verify alternate interior angle relationships, experiment with a virtual protractor Clinometer (क्लाइनोमिटर), solve the classic broken tree wind storm problem H = x + y, and investigate circular pond central pillar heights.',
    descriptionNepali: 'त्रिकोणमितीय अनुपात प्रयोग गरी उचाइ र दूरीको वास्तविक अन्वेषण: उन्नतांश कोण (Angle of Elevation) बाट मन्दिर तथा धरहराको उचाइ (h = d tan θ + e), अवनति कोण (Angle of Depression) र एकान्तर कोण सम्बन्ध, भर्चुअल प्रोटेक्टर क्लाइनोमिटर यन्त्र, हावाले भाँचेको रुखको समस्या (H = x + y), र वृत्ताकार पोखरीको केन्द्रमा रहेको स्तम्भको उचाइ गणना प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Apply tangent ratio tan(θ) = perpendicular / base to find heights and distances',
      'Differentiate between angle of elevation (looking up) and angle of depression (looking down)',
      'Account for observer eye height e in total height calculation h = d × tan(θ) + e',
      'Solve two-part geometry problems including broken trees H = d(tan θ + sec θ) and circular ponds r = D/2',
    ],
    learningObjectivesNepali: [
      'समकोणी त्रिभुजमा tan(θ) = लम्ब / आधार प्रयोग गरी उचाइ र दूरी पत्ता लगाउन',
      'उन्नतांश कोण (Angle of Elevation) र अवनति कोण (Angle of Depression) को भिन्नता र एकान्तर कोण सम्बन्ध बुझ्न',
      'पर्यवेक्षकको आँखाको उचाइ जोडेर कुल उचाइ h = d × tan(θ) + e निकाल्न',
      'हावाले भाँचेको रुख तथा वृत्ताकार पोखरीको केन्द्रमा रहेको स्तम्भको उचाइ सम्बन्धी व्यावहारिक समस्या हल गर्न',
    ],
    tags: ['Grade 10', 'Mathematics', 'Trigonometry', 'Heights and Distances', 'Angle of Elevation', 'Angle of Depression', 'Clinometer', 'Broken Tree'],
  },
];

async function seed() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    for (const sim of CLASS10_MATH_SIMS) {
      const doc = {
        code: sim.code,
        title: sim.title,
        titleNepali: sim.titleNepali,
        description: sim.description,
        descriptionNepali: sim.descriptionNepali,
        subjectCode: 'MATH-G10',
        subjectName: 'Grade 10 Compulsory Mathematics',
        gradeLevels: [10],
        chapterNumber: sim.chapterNumber,
        chapterName: sim.chapterName,
        chapterNameNepali: sim.chapterNameNepali,
        simulationType: sim.simulationType,
        componentKey: sim.key,
        difficulty: 'INTERMEDIATE',
        estimatedDurationMinutes: 15,
        learningObjectives: sim.learningObjectives,
        learningObjectivesNepali: sim.learningObjectivesNepali,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: sim.tags,
      };

      const result = await Simulation.findOneAndUpdate({ code: sim.code }, { $set: doc }, { upsert: true, new: true });
      console.log(`✓ Seeded ${sim.code} (${sim.title}) -> DB ID: ${result._id}`);
    }

    const totalG10Math = await Simulation.countDocuments({ subjectCode: 'MATH-G10' });
    console.log(`\n🎉 Total Grade 10 Math simulations in database: ${totalG10Math}/15`);

    await mongoose.disconnect();
    console.log('MongoDB disconnected cleanly.');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding Grade 10 Math simulations:', err);
    process.exit(1);
  }
}

seed();

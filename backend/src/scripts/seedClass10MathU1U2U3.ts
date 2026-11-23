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
  // ── UNIT 1: SETS (समूह) ───────────────────────────────────────────────────
  {
    code: 'SIM-MATH-G10-U1-01',
    key: 'class10-math-u1-venn-diagram-lab',
    chapterNumber: 1,
    chapterName: 'Sets - Venn Diagrams & Cardinality',
    chapterNameNepali: 'समूह - भेन चित्र र गणनात्मकता',
    title: 'Interactive Venn Diagram Laboratory',
    titleNepali: 'अन्तरक्रियात्मक भेन चित्र प्रयोगशाला',
    description: 'Explore 2-set and 3-set Venn diagrams, dynamic cardinalities, all seven 3-set internal regions, validation of inputs, and real-life survey word problems.',
    descriptionNepali: 'दुई र तीन समूहका भेन चित्र, गतिशील गणनात्मकता, ३-समूहका ७ वटै आन्तरिक खण्डहरू, मानहरूको परीक्षण र व्यावहारिक सर्वेक्षणका शाब्दिक समस्याहरू अन्वेषण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand and manipulate 2-set and 3-set Venn diagrams with universal set U',
      'Distinguish all seven internal regions in a 3-set diagram: A only, B only, C only, pairwise intersections, and center',
      'Apply the cardinality formula: n(A ∪ B ∪ C) = n(A) + n(B) + n(C) - n(A∩B) - n(B∩C) - n(C∩A) + n(A∩B∩C)',
      'Solve practical survey problems involving sports, languages, and subject preferences',
    ],
    learningObjectivesNepali: [
      'सर्वव्यापक समूह U सहित २ र ३ समूहका भेन चित्रहरू प्रत्यक्ष परिवर्तन गरी बुझ्न',
      '३ समूहका सातवटै आन्तरिक खण्डहरू: A मात्र, B मात्र, C मात्र, दुई-दुईको प्रतिच्छेदन र साझा केन्द्र छुट्याउन',
      'गणना सूत्र n(A ∪ B ∪ C) को प्रयोग गरी अज्ञात मानहरू निकाल्न',
      'खेलकुद र व्यावहारिक सर्वेक्षणका शाब्दिक समस्याहरू समाधान गर्न',
    ],
    tags: ['math-g10', 'grade10', 'sets', 'venn-diagram', 'cardinality', 'three-sets'],
  },

  // ── UNIT 2: COMPOUND INTEREST (चक्रीय ब्याज) ──────────────────────────────
  {
    code: 'SIM-MATH-G10-U2-01',
    key: 'class10-math-u2-compound-interest-lab',
    chapterNumber: 2,
    chapterName: 'Compound Interest',
    chapterNameNepali: 'चक्रीय ब्याज',
    title: 'Compound Interest Visual Laboratory',
    titleNepali: 'चक्रीय ब्याज दृश्य प्रयोगशाला',
    description: 'Visualize interest on interest, year-by-year compounding growth, compare Simple Interest (SI) vs Compound Interest (CI), explore compounding frequencies (Annual, Half-yearly, Quarterly), and reverse calculate Principal.',
    descriptionNepali: 'ब्याजमाथि ब्याज कसरी थपिन्छ प्रत्यक्ष हेर्ने, साधारण ब्याज (SI) र चक्रीय ब्याज (CI) को तुलना, वार्षिक, अर्धवार्षिक र त्रैमासिक ब्याजदर, तथा उल्टो गणना प्रयोगशाला।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand how accrued interest becomes principal in subsequent compounding periods',
      'Calculate Annual Compound Amount CA = P(1 + R/100)ᵀ and Compound Interest CI = CA - P',
      'Compare growth rates and the expanding difference between Simple and Compound Interest',
      'Evaluate the impact of Semi-Annual and Quarterly compounding on investment yields',
      'Perform reverse calculations to find principal from given compound amount',
    ],
    learningObjectivesNepali: [
      'अघिल्लो वर्षको ब्याज पछिल्लो वर्षको सावाँमा थपिई ब्याजमाथि ब्याज लाग्ने तथ्य बुझ्न',
      'वार्षिक चक्रीय मिश्रधन CA = P(1 + R/100)ᵀ र चक्रीय ब्याज CI निकाल्न',
      'साधारण ब्याज र चक्रीय ब्याजको वृद्धिदर र अन्तरको विश्लेषण गर्न',
      'अर्धवार्षिक र त्रैमासिक ब्याज अवधिका सूत्रहरू प्रयोग गरी तुलना गर्न',
      'दिइएको मिश्रधनबाट प्रारम्भिक सावाँ पत्ता लगाउने उल्टो गणना गर्न',
    ],
    tags: ['math-g10', 'grade10', 'compound-interest', 'simple-interest', 'compounding-frequency', 'reverse-calculation'],
  },

  // ── UNIT 3: GROWTH AND DEPRECIATION (जनसङ्ख्या वृद्धि तथा ह्रास) ──────────
  {
    code: 'SIM-MATH-G10-U3-01',
    key: 'class10-math-u3-growth-depreciation-explorer',
    chapterNumber: 3,
    chapterName: 'Growth and Depreciation',
    chapterNameNepali: 'जनसङ्ख्या वृद्धि तथा ह्रास',
    title: 'Growth and Depreciation Explorer',
    titleNepali: 'जनसङ्ख्या वृद्धि तथा ह्रास अन्वेषक',
    description: 'Explore repeated percentage growth PT = P(1 + R/100)ᵀ, asset depreciation VT = V0(1 - R/100)ᵀ, population adjustments for in/out-migration and deaths, and profit/loss after depreciation.',
    descriptionNepali: 'चक्रीय वृद्धि PT = P(1 + R/100)ᵀ, सामानको ह्रास VT = V0(1 - R/100)ᵀ, बसाइँसराइ र मृत्युको क्रमबद्ध समायोजन, तथा ह्रासपछिको व्यावसायिक नाफा-नोक्सान अन्वेषण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Model population and value growth with repeated compound increase: PT = P(1 + R/100)ᵀ',
      'Model asset value reduction through compound depreciation: VT = V0(1 - R/100)ᵀ',
      'Apply multi-step population adjustments: natural growth, in-migration, out-migration, and deaths',
      'Understand the visual and algebraic difference between (+) growth and (-) depreciation',
      'Calculate net profit or loss after asset depreciation and business operation',
    ],
    learningObjectivesNepali: [
      'जनसङ्ख्या र मूल्यको चक्रीय वृद्धि PT = P(1 + R/100)ᵀ मोडेल गर्न',
      'सवारी साधन, कम्प्युटर आदिको चक्रीय मूल्य ह्रास VT = V0(1 - R/100)ᵀ गणना गर्न',
      'प्राकृतिक वृद्धि, भित्रिने/बाहिरिने बसाइँसराइ र मृत्यु संख्याको सही क्रममा समायोजन गर्न',
      'वृद्धि (+) र ह्रास (-) सूत्रहरू बीचको भिन्नता बुझ्न',
      'मेसिनको ह्रास र सञ्चालन आम्दानीबाट खुद नाफा वा नोक्सान निकाल्न',
    ],
    tags: ['math-g10', 'grade10', 'growth', 'depreciation', 'population-growth', 'migration-adjustment', 'profit-loss'],
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
  console.error('Error seeding Grade 10 Mathematics simulations:', err);
  process.exit(1);
});

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

const CLASS9_U1_SIMS = [
  {
    code: 'SIM-MATH-G9-U1-01',
    key: 'class9-math-u1-set-explorer-venn-lab',
    chapterNumber: 1,
    chapterName: 'Sets',
    chapterNameNepali: 'समूह',
    title: 'Set Explorer and Venn Diagram Laboratory',
    titleNepali: 'समूह अन्वेषक र भेन चित्र प्रयोगशाला',
    description: 'Explore set representations, listing and set-builder notation, union (A ∪ B), intersection (A ∩ B), difference (A - B), complement (A\'), subsets, disjoint sets, and 3-set Venn diagrams with interactive elements.',
    descriptionNepali: 'समूहको परिचय, सूचीकरण र समूह निर्माण विधि, संयोजन (A ∪ B), प्रतिच्छेदन (A ∩ B), अन्तर (A - B), पूरक समूह (A\'), उपसमूह र ३-समूह भेन चित्रको अन्तरक्रियात्मक अन्वेषण।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Understand set definitions, elements, listing, and set-builder notation',
      'Explore set operations: Union, Intersection, Difference, and Complement with dynamic region highlighting',
      'Analyze overlapping, disjoint, subset, and 3-set relationships in universal sets',
    ],
    learningObjectivesNepali: [
      'समूहका सदस्य, सूचीकरण र समूह निर्माण विधिको अवधारणा बुझ्न',
      'संयोजन, प्रतिच्छेदन, अन्तर र पूरक समूहको भेन चित्रमा प्रत्यक्ष प्रदर्शन गर्न',
      'खप्टिएका, अलगिएका, उपसमूह र तीन-समूह सम्बन्धहरूको विश्लेषण गर्न',
    ],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    tags: ['sets', 'venn diagram', 'union', 'intersection', 'difference', 'complement', 'subsets', 'grade 9'],
  },
  {
    code: 'SIM-MATH-G9-U1-02',
    key: 'class9-math-u1-set-operations-challenge',
    chapterNumber: 1,
    chapterName: 'Sets',
    chapterNameNepali: 'समूह',
    title: 'Set Operations Challenge',
    titleNepali: 'समूहका क्रियाहरू र छायाङ्कन चुनौती',
    description: 'Interactive Venn diagram region shading challenge using touch and stylus for A ∪ B, A ∩ B, A - B, B - A, (A ∪ B)\', (A ∩ B)\', and symmetric difference A △ B with step-by-step solutions.',
    descriptionNepali: 'भेन चित्रका खण्डहरू छोएर वा क्लिक गरेर A ∪ B, A ∩ B, A - B, B - A, पूरक समूह र सममितीय अन्तर A △ B छायाङ्कन गर्ने अन्तरक्रियात्मक चुनौती र चरणबद्ध समाधान।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Perform set operations and translate between algebraic set expressions and Venn diagram regions',
      'Understand and visualize symmetric difference A △ B = (A - B) ∪ (B - A)',
      'Directly shade Venn regions to solve practice and challenge exercises with immediate feedback',
    ],
    learningObjectivesNepali: [
      'समूहका क्रियाहरूलाई भेन चित्रको छायाङ्कनसँग सम्बन्धित गर्न',
      'सममितीय अन्तर A △ B = (A - B) ∪ (B - A) को अवधारणा बुझ्न र प्रदर्शन गर्न',
      'भेन चित्रका खण्डहरू छायाङ्कन गरी अभ्यास र चुनौतीहरू हल गर्न',
    ],
    difficulty: 'INTERMEDIATE',
    estimatedDurationMinutes: 15,
    tags: ['sets', 'venn shading', 'symmetric difference', 'complement', 'operations', 'touch-friendly'],
  },
  {
    code: 'SIM-MATH-G9-U1-03',
    key: 'class9-math-u1-cardinality-problem-solver',
    chapterNumber: 1,
    chapterName: 'Sets',
    chapterNameNepali: 'समूह',
    title: 'Cardinality and Venn Diagram Problem Solver',
    titleNepali: 'समूहको गणनात्मकता र समस्या समाधानकर्ता',
    description: 'Interactive cardinality visualizer and real-life word problem solver for 2-set and 3-set surveys (sports, exams, beverages) verifying n(A ∪ B) = n(A) + n(B) - n(A ∩ B).',
    descriptionNepali: 'समूहको गणनात्मकता n(A), n(B), n(A ∩ B) र n(A ∪ B) को सूत्र प्रमाणीकरण, खेलकुद तथा परीक्षा सर्वेक्षणका व्यावहारिक शाब्दिक समस्या समाधानकर्ता।',
    simulationType: 'REACT_CANVAS',
    learningObjectives: [
      'Calculate cardinality of sets: n(A), n(B), n₀(A), n₀(B), n(A ∩ B), and n(U)',
      'Apply formula n(A ∪ B) = n(A) + n(B) - n(A ∩ B) to solve practical word problems',
      'Understand the 3-set cardinality formula and solve multi-set problem situations',
    ],
    learningObjectivesNepali: [
      'समूहका सदस्य सङ्ख्या (गणना) n(A), n(B), n₀(A), n(A ∩ B) हिसाब गर्न',
      'n(A ∪ B) = n(A) + n(B) − n(A ∩ B) सूत्र प्रयोग गरी शाब्दिक समस्या हल गर्न',
      'तीन समूहको गणनात्मकता सूत्र बुझ्न र वास्तविक सर्वेक्षण समस्या समाधान गर्न',
    ],
    difficulty: 'ADVANCED',
    estimatedDurationMinutes: 20,
    tags: ['sets', 'cardinality', 'word problems', 'venn diagram', 'surveys', 'three-set formula'],
  },
];

async function seedClass9MathU1() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    let insertedCount = 0;
    let updatedCount = 0;

    for (const sim of CLASS9_U1_SIMS) {
      const doc = {
        code: sim.code,
        title: sim.title,
        titleNepali: sim.titleNepali,
        description: sim.description,
        descriptionNepali: sim.descriptionNepali,
        subjectCode: 'MATH-G9',
        subjectName: 'Grade 9 Mathematics',
        gradeLevels: [9],
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
    console.log(`Total processed: ${CLASS9_U1_SIMS.length}`);
    console.log(`Inserted: ${insertedCount}`);
    console.log(`Updated: ${updatedCount}`);
    console.log('Grade 9 Math Unit 1: Sets seeded successfully!');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Grade 9 Math Unit 1:', error);
    process.exit(1);
  }
}

seedClass9MathU1();

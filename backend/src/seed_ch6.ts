import mongoose from 'mongoose';

const CH6_SIMULATIONS = [
  {
    code: 'SIM-MATH-G1-CH6-01',
    title: 'Ten Object Adventure',
    titleNepali: 'दश वस्तुहरू गनौँ',
    description: 'Explore an interactive 3D village garden to count groups of objects individually until reaching exactly ten (१० / 10).',
    subjectCode: 'MATH',
    subjectName: 'Mathematics',
    gradeLevels: [1],
    chapterNumber: 6,
    chapterTitle: 'Ten',
    chapterTitleNepali: 'दश',
    simulationType: 'THREE_JS',
    componentKey: 'class1-math-ch6-ten-objects',
    runtimeUrl: '/simulations/class1-math/ch6/ten-objects',
    tags: ['Class 1', 'Mathematics', 'Chapter 6', 'Ten', 'Counting', '3D WebGL'],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    isPremium: false,
    isActive: true,
    isPublished: true,
    thumbnailUrl: '/assets/simulations/thumbnails/class1-math-ch6-01.png',
  },
  {
    code: 'SIM-MATH-G1-CH6-02',
    title: 'Number Ten Discovery World',
    titleNepali: '१० चिनौँ',
    description: 'Discover and recognize the numeral 10 in English and १० in Nepali, its number name Ten / दश, and associate it with ten objects.',
    subjectCode: 'MATH',
    subjectName: 'Mathematics',
    gradeLevels: [1],
    chapterNumber: 6,
    chapterTitle: 'Ten',
    chapterTitleNepali: 'दश',
    simulationType: 'HTML5_CANVAS',
    componentKey: 'class1-math-ch6-discovery',
    runtimeUrl: '/simulations/class1-math/ch6/discovery',
    tags: ['Class 1', 'Mathematics', 'Chapter 6', 'Ten', 'Numerals', 'Recognition'],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 12,
    isPremium: false,
    isActive: true,
    isPublished: true,
    thumbnailUrl: '/assets/simulations/thumbnails/class1-math-ch6-02.png',
  },
  {
    code: 'SIM-MATH-G1-CH6-03',
    title: 'Make Ten Challenge',
    titleNepali: 'दश बनाऔँ',
    description: 'Physically partition and combine two groups of objects (1+9, 2+8, 3+7, 4+6, 5+5) between two baskets to make ten.',
    subjectCode: 'MATH',
    subjectName: 'Mathematics',
    gradeLevels: [1],
    chapterNumber: 6,
    chapterTitle: 'Ten',
    chapterTitleNepali: 'दश',
    simulationType: 'HTML5_CANVAS',
    componentKey: 'class1-math-ch6-make-ten',
    runtimeUrl: '/simulations/class1-math/ch6/make-ten',
    tags: ['Class 1', 'Mathematics', 'Chapter 6', 'Make Ten', 'Number Pairs', 'Combinations'],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    isPremium: false,
    isActive: true,
    isPublished: true,
    thumbnailUrl: '/assets/simulations/thumbnails/class1-math-ch6-03.png',
  },
  {
    code: 'SIM-MATH-G1-CH6-04',
    title: 'Count and Match Ten',
    titleNepali: 'गनेर दशसँग मिलाऔँ',
    description: 'Count objects across village scenes (flowers, fish, pencils, apples) and match groups containing ten with the numeral १० and 10.',
    subjectCode: 'MATH',
    subjectName: 'Mathematics',
    gradeLevels: [1],
    chapterNumber: 6,
    chapterTitle: 'Ten',
    chapterTitleNepali: 'दश',
    simulationType: 'HTML5_CANVAS',
    componentKey: 'class1-math-ch6-count-match',
    runtimeUrl: '/simulations/class1-math/ch6/count-match',
    tags: ['Class 1', 'Mathematics', 'Chapter 6', 'Matching', 'Counting', 'Ten'],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 12,
    isPremium: false,
    isActive: true,
    isPublished: true,
    thumbnailUrl: '/assets/simulations/thumbnails/class1-math-ch6-04.png',
  },
  {
    code: 'SIM-MATH-G1-CH6-05',
    title: 'Number Ten Writing Studio',
    titleNepali: '१० लेख्न सिकौँ',
    description: 'Guided stroke handwriting studio for practicing the two-digit number 10 and Devanagari numeral १० with directional guides and evaluation.',
    subjectCode: 'MATH',
    subjectName: 'Mathematics',
    gradeLevels: [1],
    chapterNumber: 6,
    chapterTitle: 'Ten',
    chapterTitleNepali: 'दश',
    simulationType: 'HTML5_CANVAS',
    componentKey: 'class1-math-ch6-writing',
    runtimeUrl: '/simulations/class1-math/ch6/writing',
    tags: ['Class 1', 'Mathematics', 'Chapter 6', 'Writing', 'Tracing', 'Ten'],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    isPremium: false,
    isActive: true,
    isPublished: true,
    thumbnailUrl: '/assets/simulations/thumbnails/class1-math-ch6-05.png',
  },
];

async function seedChapter6() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect('mongodb://127.0.0.1:27017/nepal_edu_ecosystem');
  const db = mongoose.connection.db!;

  for (const sim of CH6_SIMULATIONS) {
    const res = await db.collection('simulations').updateOne(
      { code: sim.code },
      { $set: sim },
      { upsert: true }
    );
    console.log(`Registered/Updated: ${sim.code} - ${sim.title} (${res.upsertedCount > 0 ? 'Created' : 'Updated'})`);
  }

  const count = await db.collection('simulations').countDocuments({ chapterNumber: 6, gradeLevels: 1 });
  console.log(`\n✅ Total Grade 1 Chapter 6 simulations in MongoDB: ${count}`);
  await mongoose.disconnect();
}

seedChapter6().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});


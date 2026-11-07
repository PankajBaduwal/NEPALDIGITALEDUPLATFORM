import mongoose from 'mongoose';

const CH5_SIMULATIONS = [
  {
    code: 'SIM-MATH-G1-CH5-01',
    title: 'The Zero Discovery Playground',
    titleNepali: 'शून्य चिनौँ',
    description: 'Explore a 3D village playground to discover situations where no objects remain, understanding zero (०) as an empty group.',
    subjectCode: 'MATH',
    subjectName: 'Mathematics',
    gradeLevels: [1],
    chapterNumber: 5,
    chapterTitle: 'Zero',
    chapterTitleNepali: 'शून्य',
    simulationType: 'THREE_JS',
    componentKey: 'class1-math-ch5-playground',
    runtimeUrl: '/simulations/class1-math/ch5/playground',
    tags: ['class1', 'mathematics', 'zero', 'shunya', 'playground', 'threejs', '3d'],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    isPremium: false,
    isActive: true,
    isPublished: true,
    thumbnailUrl: '/assets/simulations/thumbnails/class1-math-ch5-01.png',
  },
  {
    code: 'SIM-MATH-G1-CH5-02',
    title: 'Empty Basket Adventure',
    titleNepali: 'खाली टोकरी चिनौँ',
    description: 'Explore village market containers, trays, pots, and boxes to count objects and identify empty collections with zero (०).',
    subjectCode: 'MATH',
    subjectName: 'Mathematics',
    gradeLevels: [1],
    chapterNumber: 5,
    chapterTitle: 'Zero',
    chapterTitleNepali: 'शून्य',
    simulationType: 'HTML5_CANVAS',
    componentKey: 'class1-math-ch5-empty-basket',
    runtimeUrl: '/simulations/class1-math/ch5/empty-basket',
    tags: ['class1', 'mathematics', 'zero', 'empty-basket', 'counting', 'containers'],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 12,
    isPremium: false,
    isActive: true,
    isPublished: true,
    thumbnailUrl: '/assets/simulations/thumbnails/class1-math-ch5-02.png',
  },
  {
    code: 'SIM-MATH-G1-CH5-03',
    title: 'Where Did Everything Go?',
    titleNepali: 'वस्तुहरू कहाँ गए?',
    description: 'Watch birds fly away from branches, ducks swim away, and fruits taken until nothing remains, seeing the count drop to zero (०).',
    subjectCode: 'MATH',
    subjectName: 'Mathematics',
    gradeLevels: [1],
    chapterNumber: 5,
    chapterTitle: 'Zero',
    chapterTitleNepali: 'शून्य',
    simulationType: 'HTML5_CANVAS',
    componentKey: 'class1-math-ch5-where-did-it-go',
    runtimeUrl: '/simulations/class1-math/ch5/where-did-it-go',
    tags: ['class1', 'mathematics', 'zero', 'removal', 'birds', 'animation'],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 12,
    isPremium: false,
    isActive: true,
    isPublished: true,
    thumbnailUrl: '/assets/simulations/thumbnails/class1-math-ch5-03.png',
  },
  {
    code: 'SIM-MATH-G1-CH5-04',
    title: 'Count the Village',
    titleNepali: 'गाउँमा गनौँ',
    description: 'Explore various locations in a Nepalese village to count people, animals, and objects, identifying places with zero objects.',
    subjectCode: 'MATH',
    subjectName: 'Mathematics',
    gradeLevels: [1],
    chapterNumber: 5,
    chapterTitle: 'Zero',
    chapterTitleNepali: 'शून्य',
    simulationType: 'HTML5_CANVAS',
    componentKey: 'class1-math-ch5-count-village',
    runtimeUrl: '/simulations/class1-math/ch5/count-village',
    tags: ['class1', 'mathematics', 'zero', 'village', 'exploration', 'scavenger-hunt'],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    isPremium: false,
    isActive: true,
    isPublished: true,
    thumbnailUrl: '/assets/simulations/thumbnails/class1-math-ch5-04.png',
  },
  {
    code: 'SIM-MATH-G1-CH5-05',
    title: 'Zero Challenge',
    titleNepali: 'शून्यको खेल',
    description: 'Master zero through interactive challenges comparing empty vs occupied groups, counting scenes, and removing objects.',
    subjectCode: 'MATH',
    subjectName: 'Mathematics',
    gradeLevels: [1],
    chapterNumber: 5,
    chapterTitle: 'Zero',
    chapterTitleNepali: 'शून्य',
    simulationType: 'HTML5_CANVAS',
    componentKey: 'class1-math-ch5-zero-challenge',
    runtimeUrl: '/simulations/class1-math/ch5/zero-challenge',
    tags: ['class1', 'mathematics', 'zero', 'challenge', 'quiz', 'mastery'],
    difficulty: 'BEGINNER',
    estimatedDurationMinutes: 15,
    isPremium: false,
    isActive: true,
    isPublished: true,
    thumbnailUrl: '/assets/simulations/thumbnails/class1-math-ch5-05.png',
  },
];

async function seedChapter5() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect('mongodb://127.0.0.1:27017/nepal_edu_ecosystem');
  const db = mongoose.connection.db!;

  for (const sim of CH5_SIMULATIONS) {
    const res = await db.collection('simulations').updateOne(
      { code: sim.code },
      { $set: sim },
      { upsert: true }
    );
    console.log(`Registered/Updated: ${sim.code} - ${sim.title} (${res.upsertedCount > 0 ? 'Created' : 'Updated'})`);
  }

  const count = await db.collection('simulations').countDocuments({ chapterNumber: 5, gradeLevels: 1 });
  console.log(`\n✅ Total Grade 1 Chapter 5 simulations in MongoDB: ${count}`);
  await mongoose.disconnect();
}

seedChapter5().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

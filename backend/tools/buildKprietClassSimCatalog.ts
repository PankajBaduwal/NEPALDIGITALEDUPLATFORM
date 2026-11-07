/**
 * Generates src/data/kprietClassSimulations.json from the simulations copied into frontend/src/kpriet-sims
 * (Class 1 and Class 2 entries, placed in our class → subject → chapter structure).
 *
 *   npx tsx tools/buildKprietClassSimCatalog.ts
 *
 * The simulation code itself lives in frontend/src/kpriet-sims (a copy of KPRIET's simulations); the database
 * only stores the catalogue entry (title, class, subject, chapter) and the component key that opens it.
 */
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { SCHOOL_AND_LAB_SIMULATIONS } from '../../frontend/src/kpriet-sims/school';

type Place = { chapter: number; title: string; titleNepali?: string };

/** simulation id -> chapter in OUR class syllabus (Class 1 maths follows the existing CDC chapter list). */
const PLACE: Record<string, Place> = {
  'g18-class1-spatial-furry-cat': { chapter: 1, title: 'Shapes and Position', titleNepali: 'आकारप्रकार र स्थान' },
  'g18-class1-measurement-balance': { chapter: 1, title: 'Shapes and Position', titleNepali: 'आकारप्रकार र स्थान' },
  'g18-class1-spatial-ramp-adventure': { chapter: 3, title: 'Geometrical Shapes', titleNepali: 'ज्यामितीय आकारहरू' },
  'g18-class1-pattern-train': { chapter: 3, title: 'Geometrical Shapes', titleNepali: 'ज्यामितीय आकारहरू' },
  'g18-class1-counting-garden-zero': { chapter: 5, title: 'Zero', titleNepali: 'शून्य' },
  'g18-class1-addition-subtraction-stories': { chapter: 7, title: 'Addition up to 10', titleNepali: 'योगफल १० सम्म आउने जोड' },
  'g18-class1-addition-objects': { chapter: 7, title: 'Addition up to 10', titleNepali: 'योगफल १० सम्म आउने जोड' },
  'g18-class1-counting': { chapter: 9, title: 'Numbers 11 to 20', titleNepali: '११ देखि २० सम्मका सङ्ख्याहरू' },
  'g18-class1-time-chintu-day': { chapter: 12, title: 'Money and Time', titleNepali: 'मुद्रा र समय' },
  'g18-class1-currency-toy-shop': { chapter: 12, title: 'Money and Time', titleNepali: 'मुद्रा र समय' },

  'g18-class2-number-village': { chapter: 1, title: 'Numbers and Place Value' },
  'g18-class2-tens-and-ones': { chapter: 1, title: 'Numbers and Place Value' },
  'g18-class2-place-value': { chapter: 1, title: 'Numbers and Place Value' },
  'g18-class2-add-subtract': { chapter: 2, title: 'Addition and Subtraction' },
  'g18-class2-rupee-market': { chapter: 3, title: 'Money' },
  'g18-class2-shape-explorer': { chapter: 4, title: 'Shapes' },
  'g18-class2-length-detective': { chapter: 5, title: 'Measurement' },

  'g18-class2-living-sorter': { chapter: 1, title: 'Living and Non-Living Things' },
  'g18-class2-plant-garden': { chapter: 2, title: 'Plants' },
  'g18-class2-senses-explorer': { chapter: 3, title: 'My Body and Five Senses' },
  'g18-class2-water-saver': { chapter: 4, title: 'Water' },
  'g18-class2-sink-float': { chapter: 4, title: 'Water' },
  'g18-class2-push-pull': { chapter: 5, title: 'Push, Pull and Movement' },
};

const out: any[] = [];
for (const s of SCHOOL_AND_LAB_SIMULATIONS as any[]) {
  const grade = s.level === 'class-1' ? 1 : s.level === 'class-2' ? 2 : 0;
  if (!grade) continue;
  const place = PLACE[s.id];
  if (!place) {
    console.warn('No chapter placement for', s.id, '- skipped');
    continue;
  }
  const isScience = s.subject === 'Science';
  out.push({
    code: `KP-${s.id}`,
    title: s.title,
    description: s.shortDescription || s.detailedDescription || s.title,
    learningObjectives: s.learningObjectives || [],
    gradeLevels: [grade],
    subjectCode: isScience ? 'SCI' : 'MATH',
    subjectName: isScience ? 'Environmental Studies' : 'Mathematics',
    chapterNumber: place.chapter,
    chapterTitle: place.title,
    chapterTitleNepali: place.titleNepali,
    topicName: s.topic,
    language: 'en',
    simulationType: '2D_CANVAS',
    runtimeUrl: `/sim.html?id=${s.id}`,
    componentKey: `kpriet:${s.id}`,
    difficulty: 'BEGINNER',
    estimatedMinutes: 15,
    status: 'AVAILABLE',
    isPublished: true,
    tags: ['kpriet', ...(s.tags || [])].slice(0, 12),
    config: { source: 'KPRIET', kprietId: s.id },
  });
}
const file = path.resolve(__dirname, '../src/data/kprietClassSimulations.json');
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, JSON.stringify(out, null, 2));
console.log('wrote', out.length, 'class simulations to', file);

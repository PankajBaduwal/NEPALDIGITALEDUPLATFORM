/**
 * Registers the Class 5 and Class 6 Mathematics simulations (labs, one to three per lesson).
 * Code: frontend/src/simulations/class5-math/ and class6-math/. The titles come from each registry file.
 * Safe to run again: it updates by `code`.
 *   npm run seed:class56-math
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nepal_edu_ecosystem';

const SimulationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, title: { type: String, required: true }, titleNepali: String,
    description: { type: String, required: true }, descriptionNepali: String, subjectCode: { type: String, required: true }, subjectName: { type: String, required: true },
    gradeLevels: [{ type: Number, required: true }], chapterNumber: Number, chapterName: String, chapterNameNepali: String,
    simulationType: { type: String, enum: ['HTML5_CANVAS', 'PHASER', 'REACT_CANVAS', 'HTML5_CANVAS', 'WEB_GL'], default: 'REACT_CANVAS' },
    componentKey: String, runtimeUrl: String, difficulty: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'BEGINNER' },
    estimatedDurationMinutes: { type: Number, default: 15 }, learningObjectives: [String], learningObjectivesNepali: [String],
    isPublished: { type: Boolean, default: true }, currentVersion: { type: String, default: '1.0.0' }, tags: [String],
  },
  { timestamps: true }
);
const Simulation = mongoose.models.Simulation || mongoose.model('Simulation', SimulationSchema);

export const LESSONS5: Record<number, [string, string]> = {
  1: ['Lines and Angles', 'रेखा र कोण'], 2: ['Solid Objects', 'ठोस वस्तुहरू'], 3: ['Number Sense', 'सङ्ख्याको ज्ञान'], 4: ['Simplification', 'सरलीकरण'], 5: ['Fraction', 'भिन्न'],
  6: ['Decimal', 'दशमलव'], 7: ['Percentage', 'प्रतिशत'], 8: ['Time', 'समय'], 9: ['Distance', 'दुरी'], 10: ['Capacity', 'क्षमता'], 11: ['Weight', 'तौल'],
  12: ['Perimeter, Area and Volume', 'परिमिति, क्षेत्रफल र आयतन'], 13: ['Bill and Budget', 'बिल र बजेट'], 14: ['Presentation of Data', 'तथ्याङ्कको प्रस्तुति'], 15: ['Algebraic Expressions', 'बीजीय अभिव्यक्ति'],
};
export const LESSONS6: Record<number, [string, string]> = {
  1: ['Set', 'समूह'], 2: ['Whole Number', 'पूर्ण सङ्ख्या'], 3: ['Integers', 'पूर्णाङ्क'], 4: ['Fraction', 'भिन्न'], 5: ['Decimal', 'दशमलव'], 6: ['Percentage', 'प्रतिशत'], 7: ['Profit and Loss', 'नाफा र नोक्सान'],
  8: ['Unitary Method', 'ऐकिक नियम'], 9: ['Distance', 'दुरी'], 10: ['Perimeter, Area and Volume', 'परिमिति, क्षेत्रफल र आयतन'], 11: ['Indices', 'घाताङ्क'], 12: ['Algebraic Expression', 'बीजीय अभिव्यक्ति'],
  13: ['Equation, Inequality and Graph', 'समीकरण, असमानता र ग्राफ'], 14: ['Lines and Angles', 'रेखा र कोण'], 15: ['Plane Shapes', 'समतलीय आकृति'], 16: ['Circle', 'वृत्त'], 17: ['Solid Objects', 'ठोस वस्तुहरू'],
  18: ['Co-ordinate Geometry', 'निर्देशाङ्क ज्यामिति'], 19: ['Symmetry and Tessellation', 'सममिति र टेस्सेलेसन'], 20: ['Statistics', 'तथ्याङ्कशास्त्र'],
};

const read = (rel: string) => fs.readFileSync(path.join(__dirname, '../../../frontend/src/simulations', rel, 'registry.tsx'), 'utf8');
const parse = (src: string) => [...src.matchAll(/code: '([^']+)', key: '([^']+)', lesson: (\d+), titleEn: '([^']+)', titleNp: '([^']+)'/g)].map((m) => ({ code: m[1], key: m[2], lesson: Number(m[3]), title: m[4], titleNp: m[5] }));

async function main() {
  await mongoose.connect(MONGODB_URI);
  let total = 0;
  for (const [grade, dir, names] of [[5, 'class5-math', LESSONS5], [6, 'class6-math', LESSONS6]] as const) {
    const sims = parse(read(dir)); if (!sims.length) throw new Error(`No simulations found in ${dir}/registry.tsx`);
    for (const s of sims) {
      const [chEn, chNp] = names[s.lesson];
      const doc = {
        code: s.code, title: s.title, titleNepali: s.titleNp,
        description: `an interactive lab for "${chEn}" (Class ${grade}): change the numbers and watch the scene, make a target in Play, then answer eight questions in Challenge.`,
        descriptionNepali: `कक्षा ${grade} को "${chNp}" का लागि ३डी प्रयोगशाला: सङ्ख्या बदलेर हेर्ने, खेलमा लक्ष्य बनाउने र चुनौतीमा आठ प्रश्न हल गर्ने।`,
        subjectCode: 'MATH', subjectName: 'Mathematics', gradeLevels: [grade], chapterNumber: s.lesson, chapterName: chEn, chapterNameNepali: chNp,
        simulationType: 'HTML5_CANVAS', componentKey: s.key, runtimeUrl: `/simulations/${dir}/l${s.lesson}/${s.key}`, difficulty: 'INTERMEDIATE', estimatedDurationMinutes: 15,
        learningObjectives: [`Explore ${chEn}`, 'Make a target in Play', 'Answer questions in Challenge'], learningObjectivesNepali: [`${chNp} अन्वेषण`, 'खेलमा लक्ष्य बनाउने', 'चुनौतीमा प्रश्न हल गर्ने'],
        isPublished: true, currentVersion: '1.0.0', tags: [`Class ${grade}`, 'Mathematics', `Lesson ${s.lesson}`, chEn, 'Learn · Play · Challenge'],
      };
      await Simulation.findOneAndUpdate({ code: s.code }, { $set: doc }, { upsert: true, returnDocument: 'after' });
      console.log(`[OK] ${s.code}  ${s.title}`);
      total++;
    }
  }
  console.log(`Done: ${total} simulations registered for Class 5 and Class 6 Mathematics.`);
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });

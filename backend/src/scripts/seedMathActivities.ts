/**
 * Registers auto-graded practice activities for Mathematics, Classes 1–6 — one activity per lesson, ten questions each.
 * They use the existing Activity system (MCQ, true/false, numerical, fill-in-the-blanks, ordering, matching, sorting), so students
 * find them under Activities and teachers can assign them to a class. Safe to run again: it replaces the questions of each
 * activity by `code`. Class 1 also keeps its older activities (codes ACT-C1-...).
 *   npm run seed:math-activities
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Activity, ActivityQuestion } from '../models/SimulationActivity';
import { G, Gen, build, Q } from './mathActivityKit';
import { H } from './mathActivityKit56';

dotenv.config({ path: path.join(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nepal_edu_ecosystem';

interface Lesson { cls: number; ch: number; en: string; np: string; gens: Gen[] }
const L = (cls: number, ch: number, en: string, np: string, ...gens: Gen[]): Lesson => ({ cls, ch, en, np, gens });

/* ─────── shared small banks ─────── */
const shapeSort = G.sortBank([['round', 'Rolls (गुड्छ)'], ['flat', 'Slides (चिप्लन्छ)']], [['Ball (बल)', 'round'], ['Tin (टिन)', 'round'], ['Orange (suntala)', 'round'], ['Box (बाकस)', 'flat'], ['Book (किताब)', 'flat'], ['Dice (पासा)', 'flat']], 'Which things roll and which slide?', 'कुन वस्तु गुड्छ र कुन चिप्लन्छ?', 6);
const shapeSides = G.bank([
  ['How many sides does a triangle have?', 'त्रिभुजमा कति भुजा हुन्छन्?', '3', ['2', '4', '5']], ['How many sides does a square have?', 'वर्गमा कति भुजा हुन्छन्?', '4', ['3', '5', '6']],
  ['How many corners does a rectangle have?', 'आयतमा कति कुना हुन्छन्?', '4', ['2', '3', '5']], ['A circle has how many corners?', 'वृत्तमा कति कुना हुन्छन्?', '0', ['1', '2', '4']],
  ['Which shape has 3 corners?', 'कुन आकृतिमा ३ कुना हुन्छन्?', 'Triangle', ['Square', 'Circle', 'Rectangle']], ['Which shape is perfectly round?', 'कुन आकृति पूरै गोलो हुन्छ?', 'Circle', ['Square', 'Triangle', 'Rectangle']],
]);

/* ─────── Class 1 ─────── */
const C1: Lesson[] = [
  L(1, 1, 'Direction and Distance', 'दिशा र दुरी', G.bank([['Which hand do you write with, mostly? The hand on the side of the heart is the…', 'मुटुतिरको हात कुन हो?', 'Left (देब्रे)', ['Right (दाहिने)', 'Up (माथि)', 'Down (तल)']], ['The sun rises in the…', 'सूर्य कता उदाउँछ?', 'East (पूर्व)', ['West (पश्चिम)', 'North (उत्तर)', 'South (दक्षिण)']], ['The school is 50 m away and the shop is 5 m away. Which is nearer?', 'विद्यालय ५० मिटर र पसल ५ मिटर टाढा छ। कुन नजिक छ?', 'Shop (पसल)', ['School (विद्यालय)', 'Same', 'Cannot say']], ['A bird flies…', 'चरा कता उड्छ?', 'Up (माथि)', ['Down (तल)', 'Under the ground', 'Inside water']]]), G.tfBank([['A near thing is close to us.', 'नजिकको वस्तु हामीसँग नजिक हुन्छ।', true], ['The moon is nearer than the school.', 'चन्द्रमा विद्यालयभन्दा नजिक छ।', false], ['Above means up.', 'माथि भनेको up हो।', true], ['Below means up.', 'तल भनेको up हो।', false]]), G.bank([['Which one is far from you when you are in class?', undefined, 'The mountain on the horizon', ['Your desk', 'Your pencil', 'Your bag']]])),
  L(1, 2, 'Long and Short, Tall and Short', 'लामो र छोटो', G.bank([['Which is longer: a train or a toy car?', 'कुन लामो हुन्छ: रेल कि खेलौना कार?', 'Train (रेल)', ['Toy car (खेलौना कार)', 'Same', 'Cannot say']], ['Which is shorter: a pencil or a rope?', 'कुन छोटो हुन्छ: पेन्सिल कि डोरी?', 'Pencil (पेन्सिल)', ['Rope (डोरी)', 'Same', 'Cannot say']], ['Which is taller: a tree or a flower?', 'कुन अग्लो हुन्छ: रुख कि फूल?', 'Tree (रुख)', ['Flower (फूल)', 'Same', 'Cannot say']], ['Which is heavier: an elephant or a cat?', 'कुन गह्रौँ छ: हात्ती कि बिरालो?', 'Elephant (हात्ती)', ['Cat (बिरालो)', 'Same', 'Cannot say']]]), G.sortBank([['long', 'Long (लामो)'], ['short', 'Short (छोटो)']], [['Snake (सर्प)', 'long'], ['Road (बाटो)', 'long'], ['River (नदी)', 'long'], ['Rubber (रबर)', 'short'], ['Button (बटन)', 'short'], ['Seed (बीउ)', 'short']], 'Is it usually long or short?', 'यो लामो हो कि छोटो?', 6), G.tfBank([['A giraffe is tall.', 'जिराफ अग्लो हुन्छ।', true], ['An ant is longer than a snake.', 'कमिला सर्पभन्दा लामो हुन्छ।', false], ['A mountain is taller than a house.', 'पहाड घरभन्दा अग्लो हुन्छ।', true]])),
  L(1, 3, 'Shapes', 'आकृतिहरू', shapeSides, shapeSort, G.matchBank([[['Ball', 'Sphere (गोला)'], ['Dice', 'Cube (घन)'], ['Tin', 'Cylinder (बेलना)'], ['Ice-cream cone', 'Cone (शङ्कु)']], [['Football', 'Sphere (गोला)'], ['Box', 'Cuboid (घनाभ)'], ['Drum', 'Cylinder (बेलना)'], ['Party hat', 'Cone (शङ्कु)']]], 'Match the thing with its shape', 'वस्तुलाई आकृतिसँग जोड')),
  L(1, 4, 'Numbers 1 to 5', 'सङ्ख्या १ देखि ५', G.count(5), G.countNum(5), G.cmpMore(5), G.order(5, 4, true), G.seq(1, 5, 0), G.numWord(5)),
  L(1, 5, 'Zero and Numbers up to 5', 'शून्य', G.bank([['How many apples are in an empty basket?', 'खाली डालोमा कति स्याउ हुन्छन्?', '0', ['1', '2', '5']], ['We write "nothing" as…', '"केही नहुनु" लाई कसरी लेखिन्छ?', '0', ['1', '5', '10']], ['3 birds fly away from 3 birds. How many are left?', '३ चरामध्ये ३ वटा उडे। कति बाँकी?', '0', ['1', '3', '6']]]), G.count(5), G.cmpLess(5, 0), G.tfBank([['Zero means none.', 'शून्य भनेको केही नहुनु हो।', true], ['0 is bigger than 3.', '० ले ३ भन्दा ठूलो हो।', false], ['0 comes before 1.', '० १ भन्दा पहिले आउँछ।', true]]), G.seq(1, 5, 0)),
  L(1, 6, 'Numbers 6 to 10', 'सङ्ख्या ६ देखि १०', G.count(10), G.countNum(10), G.cmpMore(10, 6), G.cmpSign(10, 6), G.order(10, 4, true, 6), G.numWordMcq(10), G.seq(1, 10, 5), G.devMatch(10)),
  L(1, 7, 'Addition up to 10', 'जोड (१० सम्म)', G.addN(10), G.addM(10), G.addWord(10), G.addMissing(10), G.addN(10)),
  L(1, 8, 'Subtraction up to 10', 'घटाउ (१० सम्म)', G.subN(10), G.subM(10), G.subWord(10), G.subMissing(10), G.subN(10)),
  L(1, 9, 'Numbers 11 to 20', 'सङ्ख्या ११ देखि २०', G.tensOnes(20, 11), G.cmpMore(20, 11), G.cmpSign(20, 11), G.order(20, 4, true, 11), G.seq(1, 20, 10), G.hundredBefore('after', 20), G.numWord(20)),
  L(1, 10, 'Addition up to 20', 'जोड (२० सम्म)', G.addN(20, 3), G.addM(20, 3), G.addWord(20), G.addMissing(20), G.addN(20, 5)),
  L(1, 11, 'Subtraction up to 20', 'घटाउ (२० सम्म)', G.subN(20, 3), G.subM(20, 3), G.subWord(20), G.subMissing(20), G.subN(20, 5)),
  L(1, 12, 'Odd and Even Numbers', 'जोर र बिजोर सङ्ख्या', G.oddEvenMcq(20), G.oddEvenSort(20), G.oddEvenMcq(20), G.tfBank([['2, 4, 6, 8 are even numbers.', '२, ४, ६, ८ जोर सङ्ख्या हुन्।', true], ['9 is an even number.', '९ जोर सङ्ख्या हो।', false], ['Even numbers end in 0, 2, 4, 6 or 8.', undefined, true]])),
  L(1, 13, 'Number Names', 'सङ्ख्याको नाम', G.numWord(20), G.numWordMcq(20), G.numWord(20), G.numWordMcq(20)),
  L(1, 14, 'Ordinal Numbers', 'क्रमसूचक सङ्ख्या', G.ordMcq(), G.ordMatch(), G.ordMcq(), G.bank([['In a race Ram came after the 2nd runner. He is…', 'दौडमा राम दोस्रो धावकपछि आयो। ऊ…', 'Third (तेस्रो)', ['Second (दोस्रो)', 'First (पहिलो)', 'Fourth (चौथो)']], ['The first month of the year is…', undefined, 'Baisakh/January', ['The last month', 'The third month', 'The fifth month']]])),
  L(1, 15, 'Numbers 21 to 100', 'सङ्ख्या २१ देखि १००', G.tensOnes(99, 21), G.cmpMore(100, 21), G.cmpSign(100, 21), G.order(100, 4, true, 21), G.seq(10, 100, 0), G.hundredBefore('between', 99), G.numWordMcq(99)),
  L(1, 16, 'Addition up to 100', 'जोड (१०० सम्म)', G.add2(false), G.add2(true), G.addWord(99), G.addMissing(50), G.add2(false)),
  L(1, 17, 'Subtraction of Two-digit Numbers', 'दुई अङ्कको घटाउ', G.sub2(false), G.sub2(true), G.subWord(99), G.subMissing(50), G.sub2(false)),
  L(1, 18, 'Devanagari Numerals up to 100', 'देवनागरी अङ्क (१०० सम्म)', G.devMatch(20), G.devMcq(100), G.devToArabic(100), G.devMatch(100), G.devMcq(50)),
  L(1, 19, 'Time', 'समय', G.bank([['How many days are in a week?', 'एक हप्तामा कति दिन हुन्छन्?', '7', ['5', '6', '10']], ['Which day comes after Sunday?', 'आइतबारपछि कुन बार आउँछ?', 'Monday (सोमबार)', ['Saturday (शनिबार)', 'Friday (शुक्रबार)', 'Tuesday (मङ्गलबार)']], ['Which day comes before Friday?', 'शुक्रबारभन्दा अघि कुन बार?', 'Thursday (बिहीबार)', ['Saturday (शनिबार)', 'Wednesday (बुधबार)', 'Sunday (आइतबार)']], ['The first day of the week in Nepal is…', undefined, 'Sunday (आइतबार)', ['Monday (सोमबार)', 'Saturday (शनिबार)', 'Friday (शुक्रबार)']]]), G.timeRead(true), G.timeRead(true), G.tfBank([['The short hand of the clock shows the hours.', undefined, true], ['A day has 7 hours.', undefined, false]])),
  L(1, 20, 'Coins and Notes', 'सिक्का र नोट', G.coinsTotal(), G.notesTotal(), G.moneyAdd(20), G.moneyChange(), G.bank([['Which is worth more: Rs 10 note or Rs 5 note?', 'कुन बढी मूल्यको छ: रु १० कि रु ५ को नोट?', 'Rs 10 note', ['Rs 5 note', 'Same', 'Cannot say']]])),
  L(1, 21, 'Length', 'लम्बाइ', G.bank([['We measure length with a…', 'लम्बाइ नाप्न के प्रयोग गर्छौँ?', 'Ruler (रुलर)', ['Clock (घडी)', 'Scale for weight', 'Jug']], ['A pencil is 10 cm long. Another is 8 cm. Which is longer?', 'एउटा पेन्सिल १० सेमी र अर्को ८ सेमी छ। कुन लामो?', '10 cm one', ['8 cm one', 'Same', 'Cannot say']], ['1 hand-span is a way to measure…', undefined, 'Length', ['Weight', 'Time', 'Money']]]), G.cmpMore(30, 5), G.addN(20, 3), G.tfBank([['We start measuring from 0 on the ruler.', undefined, true], ['A metre is shorter than a centimetre.', undefined, false]])),
  L(1, 22, 'Pictograph', 'चित्रचार्ट', G.pictoRead(), G.pictoRead(), G.graphMost(), G.graphTotal(), G.pictoHalf()),
];

/* ─────── Class 2 ─────── */
const C2: Lesson[] = [
  L(2, 1, 'Capacity', 'धारिता', G.bank([['Which holds more water: a bucket or a cup?', 'कुन बढी पानी अटाउँछ: बाल्टी कि कप?', 'Bucket (बाल्टी)', ['Cup (कप)', 'Same', 'Cannot say']], ['We measure liquids in…', 'तरल पदार्थ केमा नापिन्छ?', 'Litres (लिटर)', ['Metres', 'Kilograms', 'Hours']], ['1 litre bottle is poured into 2 equal jugs. This shows…', undefined, 'Half a litre in each', ['One litre in each', 'Two litres in each', 'Nothing in each']]]), G.units('L', 'half-litres', 2, 9, 'लिटर', 'आधा लिटर'), G.addN(20, 2), G.tfBank([['A jug holds more than a spoon.', undefined, true], ['A litre is a unit of length.', undefined, false]])),
  L(2, 2, 'Time: Calendar and Clock', 'समय: पात्रो र घडी', G.timeRead(false, true), G.timeRead(false, true), G.bank([['How many months are in a year?', 'एक वर्षमा कति महिना हुन्छन्?', '12', ['10', '7', '52']], ['How many days are in a week?', undefined, '7', ['5', '6', '30']], ['Which month comes after Baisakh?', 'बैशाखपछि कुन महिना?', 'Jestha (जेठ)', ['Chaitra (चैत)', 'Ashadh (असार)', 'Falgun (फागुन)']], ['How many hours are in a day?', 'एक दिनमा कति घण्टा हुन्छन्?', '24', ['12', '60', '7']]]), G.timeUnits(), G.tfBank([['A year has 12 months.', undefined, true], ['An hour has 100 minutes.', undefined, false]])),
  L(2, 3, 'Numbers up to 1000', 'सङ्ख्या १००० सम्म', G.placeVal(3), G.expand(3), G.cmpSign(999, 100), G.order(999, 4, true, 100), G.seq(100, 1000, 100), G.seq(10, 500, 100), G.hundredBefore('after', 999), G.numWordMcq(99)),
  L(2, 4, 'Comparison and Order', 'तुलना र क्रम', G.cmpMore(999, 100), G.cmpLess(999, 100), G.cmpSign(999, 100), G.order(999, 4, true, 100), G.order(999, 4, false, 100), G.tfCmp(999, 100)),
  L(2, 5, 'Odd and Even Numbers', 'जोर र बिजोर सङ्ख्या', G.oddEvenMcq(100), G.oddEvenSort(100), G.oddEvenMcq(100), G.bank([['Odd + odd = ?', undefined, 'Even (जोर)', ['Odd (बिजोर)', 'Zero', 'Cannot say']], ['Even + even = ?', undefined, 'Even (जोर)', ['Odd (बिजोर)', 'Zero', 'Cannot say']], ['Odd + even = ?', undefined, 'Odd (बिजोर)', ['Even (जोर)', 'Zero', 'Cannot say']]])),
  L(2, 6, 'Weight', 'तौल', G.bank([['We measure weight in…', 'तौल केमा नापिन्छ?', 'Kilograms (केजी)', ['Litres', 'Metres', 'Hours']], ['Which is heavier: a sack of rice or a feather?', 'कुन गह्रौँ: चामलको बोरा कि प्वाँख?', 'Sack of rice', ['Feather', 'Same', 'Cannot say']], ['Which is lighter: 1 kg or 2 kg?', undefined, '1 kg', ['2 kg', 'Same', 'Cannot say']]]), G.units('kg', 'half-kg packets', 2, 9), G.addN(30, 2), G.tfBank([['2 kg is heavier than 1 kg.', undefined, true], ['A kilogram measures length.', undefined, false]])),
  L(2, 7, 'Addition', 'जोड', G.add2(false, 999), G.addBig(3), G.addWord(500), G.addMissing(100), G.add2(true, 999)),
  L(2, 8, 'Subtraction', 'घटाउ', G.sub2(false), G.sub2(true), G.subBig(3), G.subWord(500), G.subMissing(100)),
  L(2, 9, 'Length', 'लम्बाइ', G.units('m', 'cm', 100, 9, 'मिटर', 'सेन्टिमिटर'), G.units('m', 'cm', 100, 9, 'मिटर', 'सेन्टिमिटर'), G.bank([['We measure the length of a room in…', undefined, 'Metres', ['Grams', 'Litres', 'Minutes']], ['A pencil is about 15…', undefined, 'cm', ['m', 'km', 'kg']]]), G.unitsMixed('m', 'cm', 100), G.addN(100, 5)),
  L(2, 10, 'Area', 'क्षेत्रफल', G.tileArea(), G.tileArea(), G.squareA(), G.area(), G.bank([['Area is the space…', undefined, 'Inside a shape', ['Around a shape', 'Above a shape', 'Under a shape']], ['Area is counted in…', undefined, 'Square units', ['Metres only', 'Litres', 'Kilograms']]])),
  L(2, 11, 'Multiplication 1', 'गुणन १', G.mulN(5, 5), G.mulM(5, 5), G.mulWord(), G.mulMissing(5), G.mulN(5, 10)),
  L(2, 12, 'Fraction', 'भिन्न', G.fracMcq(6), G.bank([['Half of 10 is…', '१० को आधा…', '5', ['2', '10', '20']], ['One quarter of 8 is…', '८ को एक चौथाइ…', '2', ['4', '1', '8']], ['1/2 means…', undefined, '1 out of 2 equal parts', ['2 out of 1 parts', '1 out of 3 parts', '2 out of 4 unequal parts']]]), G.fracOfSet(), G.equivFrac(), G.cmpFrac()),
  L(2, 13, 'Geometric Shapes', 'ज्यामितीय आकृतिहरू', shapeSides, G.bank([['A cube has how many faces?', 'घनमा कति सतह हुन्छन्?', '6', ['4', '8', '12']], ['Which solid has a circular flat face and a point at the top?', undefined, 'Cone', ['Cube', 'Sphere', 'Cuboid']], ['A tin looks like a…', 'टिन कस्तो आकारको हुन्छ?', 'Cylinder', ['Cube', 'Cone', 'Sphere']]]), G.matchBank([[['Ball', 'Sphere'], ['Dice', 'Cube'], ['Tin', 'Cylinder'], ['Ice-cream cone', 'Cone']]], 'Match the thing with its solid'), shapeSort),
  L(2, 14, 'Pictograph and Table', 'चित्रचार्ट र तालिका', G.pictoRead(), G.graphTotal(), G.graphMost(), G.graphDiff(), G.pictoHalf()),
  L(2, 15, 'Currency', 'मुद्रा', G.moneyAdd(200), G.moneyChange(), G.notesTotal(), G.fewestNotes(), G.bill()),
  L(2, 16, 'Multiplication 2', 'गुणन २', G.mulN(10, 10), G.mulM(10, 10), G.mulWord(), G.mulMissing(10), G.mulBig(30, 5)),
  L(2, 17, 'Division', 'भाग', G.divN(10, 5), G.divM(10, 5), G.divWord(), G.divN(10, 9), G.bank([['12 ÷ 3 is the same as asking: how many 3s are in…', undefined, '12', ['3', '9', '15']]])),
];

/* ─────── Class 3 ─────── */
const C3: Lesson[] = [
  L(3, 1, 'Time 1', 'समय १', G.timeRead(false, true), G.timeRead(false, true), G.timeUnits(), G.duration(), G.bank([['A quarter past 4 is…', undefined, '4:15', ['4:45', '3:45', '4:30']], ['A quarter to 5 is…', undefined, '4:45', ['5:15', '4:15', '5:45']]])),
  L(3, 2, 'Five-digit Numbers', 'पाँच अङ्कका सङ्ख्या', G.placeVal(5), G.expand(5), G.hundredBefore('after', 99998), G.order(99999, 4, true, 10000), G.tensOnes(9, 2)),
  L(3, 3, 'Comparison of Numbers', 'सङ्ख्याको तुलना', G.cmpSign(99999, 10000), G.cmpMore(99999, 10000), G.cmpLess(99999, 10000), G.tfCmp(99999, 10000), G.order(99999, 4, false, 10000)),
  L(3, 4, 'Number Patterns', 'सङ्ख्याको ढाँचा', G.seq(3, 60), G.seq(5, 100), G.seq(10, 500), G.seqDown(4, 80), G.seqDown(5, 100)),
  L(3, 5, 'Ascending and Descending Order', 'बढ्दो र घट्दो क्रम', G.order(99999, 5, true, 1000), G.order(99999, 5, false, 1000), G.order(9999, 4, true, 100), G.order(9999, 4, false, 100)),
  L(3, 6, 'Local Numerals up to 20', 'स्थानीय अङ्क (२० सम्म)', G.devMatch(20), G.devMcq(20), G.devToArabic(20), G.bank([['The Roman numeral for 5 is…', undefined, 'V', ['I', 'X', 'L']], ['The Roman numeral for 10 is…', undefined, 'X', ['V', 'I', 'C']], ['The Roman numeral for 4 is…', undefined, 'IV', ['VI', 'IIII', 'VII']], ['The Roman numeral for 9 is…', undefined, 'IX', ['XI', 'VIIII', 'VIX']]])),
  L(3, 7, 'Fraction', 'भिन्न', G.fracMcq(8), G.equivFrac(), G.cmpFrac(), G.fracOfSet(), G.addFrac()),
  L(3, 8, 'Length 1', 'लम्बाइ १', G.units('m', 'cm', 100, 9, 'मिटर', 'सेन्टिमिटर'), G.unitsMixed('m', 'cm', 100), G.units('m', 'cm', 100), G.addN(100, 10)),
  L(3, 9, 'Lines', 'रेखा', G.bank([['Lines that never meet are called…', 'कहिल्यै नभेटिने रेखा…', 'Parallel lines (समानान्तर)', ['Intersecting lines', 'Curved lines', 'Slanting lines']], ['Lines that cross each other are called…', undefined, 'Intersecting lines (काटिने)', ['Parallel lines', 'Straight edges', 'Horizontal lines']], ['A line that goes from left to right flat on the ground is…', undefined, 'Horizontal (तेर्सो)', ['Vertical (ठाडो)', 'Slanting', 'Curved']], ['A flag pole stands as a…', undefined, 'Vertical line (ठाडो)', ['Horizontal line', 'Curved line', 'Parallel line']]]), G.matchBank([[['Railway tracks', 'Parallel lines'], ['Crossing roads', 'Intersecting lines'], ['Flag pole', 'Vertical line'], ['Table top edge', 'Horizontal line']]], 'Match the thing with its line'), G.tfBank([['Parallel lines meet at a point.', undefined, false], ['A rainbow is a curved line.', undefined, true]])),
  L(3, 10, 'Angles', 'कोण', G.angleKind(), G.angleKind(), G.bank([['The corner of a book makes a…', 'किताबको कुनाले बनाउने कोण…', 'Right angle (समकोण)', ['Acute angle', 'Obtuse angle', 'Straight angle']], ['An angle smaller than a right angle is…', undefined, 'Acute', ['Obtuse', 'Straight', 'Reflex']]]), G.tfBank([['A right angle is 90°.', undefined, true], ['An obtuse angle is smaller than 90°.', undefined, false]])),
  L(3, 11, 'Geometrical Shapes', 'ज्यामितीय आकृति', G.bank([['A cube has how many faces?', undefined, '6', ['4', '8', '12']], ['A cylinder has how many flat faces?', 'बेलनामा कति समतल सतह छन्?', '2', ['1', '3', '0']], ['How many faces does a cone have?', undefined, '2', ['1', '3', '4']], ['A sphere has how many flat faces?', undefined, '0', ['1', '2', '6']], ['A cuboid has how many corners?', undefined, '8', ['6', '4', '12']]]), shapeSides, G.matchBank([[['Dice', 'Cube'], ['Brick', 'Cuboid'], ['Tin', 'Cylinder'], ['Football', 'Sphere']]], 'Match the thing with its solid')),
  L(3, 12, 'Addition', 'जोड', G.addBig(4), G.addBig(5), G.addWord(9999), G.addMissing(500), G.add2(true, 999)),
  L(3, 13, 'Subtraction', 'घटाउ', G.subBig(4), G.subBig(5), G.subWord(9999), G.subMissing(500), G.sub2(true)),
  L(3, 14, 'Multiplication', 'गुणन', G.mulBig(99, 9), G.mulN(10, 10), G.mulWord(), G.mulMissing(10), G.mulBig(50, 5)),
  L(3, 15, 'Division', 'भाग', G.divN(20, 9), G.divRem('q'), G.divRem('r'), G.divWord(), G.divM(15, 9)),
  L(3, 16, 'Time 2', 'समय २', G.timeUnits(), G.duration(), G.timeUnits(), G.bank([['How many seconds are in a minute?', undefined, '60', ['100', '30', '24']], ['How many minutes are in an hour?', undefined, '60', ['100', '30', '24']]])),
  L(3, 17, 'Money', 'मुद्रा', G.moneyAdd(500), G.moneyChange(), G.bill(), G.fewestNotes(), G.paisa()),
  L(3, 18, 'Capacity', 'धारिता', G.units('L', 'mL', 1000, 9, 'लिटर', 'मिलिलिटर'), G.unitsMixed('L', 'mL', 1000), G.units('L', 'mL', 1000), G.bank([['We measure small amounts of medicine in…', undefined, 'Millilitres', ['Litres', 'Kilograms', 'Metres']]])),
  L(3, 19, 'Length 2', 'लम्बाइ २', G.units('km', 'm', 1000, 9, 'किमी', 'मिटर'), G.units('m', 'cm', 100), G.unitsMixed('km', 'm', 1000), G.bank([['The distance between two towns is measured in…', undefined, 'Kilometres', ['Centimetres', 'Millimetres', 'Litres']]])),
  L(3, 20, 'Weight', 'तौल', G.units('kg', 'g', 1000, 9, 'केजी', 'ग्राम'), G.unitsMixed('kg', 'g', 1000), G.units('kg', 'g', 1000), G.bank([['We weigh a small gold ring in…', undefined, 'Grams', ['Kilograms', 'Litres', 'Metres']]])),
  L(3, 21, 'Pictograph', 'चित्रचार्ट', G.pictoRead(), G.pictoHalf(), G.graphMost(), G.graphTotal(), G.graphDiff()),
  L(3, 22, 'Area', 'क्षेत्रफल', G.area(), G.tileArea(), G.squareA(), G.perimeter(), G.area()),
];

/* ─────── Class 4 ─────── */
const solidBank = G.bank([['How many faces does a cube have?', undefined, '6', ['4', '8', '12']], ['How many edges does a cube have?', undefined, '12', ['6', '8', '4']], ['How many vertices does a cuboid have?', undefined, '8', ['6', '12', '4']], ['How many faces does a square pyramid have?', undefined, '5', ['4', '6', '8']], ['How many vertices does a square pyramid have?', undefined, '5', ['4', '6', '8']], ['How many edges does a triangular prism have?', undefined, '9', ['6', '8', '12']], ['A cone has how many vertices?', undefined, '1', ['0', '2', '4']], ['A sphere has how many edges?', undefined, '0', ['1', '2', '4']], ['A cylinder has how many curved faces?', undefined, '1', ['0', '2', '3']]]);
const C4: Lesson[] = [
  L(4, 1, 'Lines and Angles', 'रेखाहरू र कोणहरू', G.angleKind(), G.angleKind(), G.straightAngle(), G.bank([['A protractor is used to…', 'चाँद केका लागि प्रयोग हुन्छ?', 'Measure and draw angles', ['Measure length', 'Measure weight', 'Tell the time']], ['A protractor measures angles from…', undefined, '0° to 180°', ['0° to 90°', '0° to 360°', '0° to 100°']], ['An angle of exactly 180° is called…', undefined, 'A straight angle', ['A right angle', 'An acute angle', 'An obtuse angle']]]), G.tfBank([['An angle of 120° is obtuse.', undefined, true], ['An angle of 45° is obtuse.', undefined, false], ['The base line of a protractor shows 0°.', undefined, true]])),
  L(4, 2, 'Plane Figures', 'समतलीय आकृतिहरू', G.bank([['A triangle with all 3 sides equal is…', undefined, 'Equilateral', ['Isosceles', 'Scalene', 'Right-angled']], ['A triangle with exactly 2 equal sides is…', undefined, 'Isosceles', ['Equilateral', 'Scalene', 'Square']], ['A quadrilateral with 4 equal sides and 4 right angles is a…', undefined, 'Square', ['Rectangle', 'Rhombus', 'Trapezium']], ['A quadrilateral with only one pair of parallel sides is a…', undefined, 'Trapezium', ['Rhombus', 'Square', 'Rectangle']], ['A quadrilateral with 4 equal sides but no right angles is a…', undefined, 'Rhombus', ['Square', 'Rectangle', 'Trapezium']], ['How many sides does a quadrilateral have?', undefined, '4', ['3', '5', '6']]]), G.matchBank([[['Equilateral triangle', '3 equal sides'], ['Isosceles triangle', '2 equal sides'], ['Scalene triangle', 'No equal sides'], ['Square', '4 equal sides, 4 right angles']], [['Rectangle', 'Opposite sides equal, 4 right angles'], ['Rhombus', '4 equal sides'], ['Parallelogram', 'Opposite sides parallel'], ['Trapezium', 'One pair of parallel sides']]], 'Match the figure with its property'), G.tfBank([['A square is also a rectangle.', undefined, true], ['A scalene triangle has two equal sides.', undefined, false]])),
  L(4, 3, 'Solid Objects', 'ठोस वस्तुहरू', solidBank, solidBank, G.matchBank([[['Cube', '6 faces'], ['Cylinder', '2 flat faces and 1 curved face'], ['Cone', '1 vertex'], ['Sphere', 'No flat face']]], 'Match the solid with its property'), G.tfBank([['Euler: faces + vertices − edges = 2 for a cube.', undefined, true], ['A sphere has 6 faces.', undefined, false]]), shapeSides),
  L(4, 4, 'Number Sense', 'सङ्ख्याको ज्ञान', G.indian(), G.lakhDigit(), G.placeVal(5), G.round(10), G.round(100), G.round(1000), G.expand(5), G.order(9999999, 4, true, 1000000)),
  L(4, 5, 'Basic Operations', 'आधारभूत क्रियाहरू', G.addBig(6), G.subBig(6), G.mulBig(99, 25), G.divRem('q'), G.divRem('r'), G.mulBig(40, 20), G.addBig(5), G.divN(30, 9)),
  L(4, 6, 'Fraction, Decimal and Percentage', 'भिन्न, दशमलव र प्रतिशत', G.equivFrac(), G.cmpFrac(), G.addFrac(), G.decimal(), G.percent(), G.percentOf(), G.decTenth(), G.fracOfSet()),
  L(4, 7, 'Time', 'समय', G.time24(), G.time12to24(), G.duration(), G.timeUnits(), G.time24(), G.time12to24()),
  L(4, 8, 'Currency', 'मुद्रा', G.moneyAdd(1000), G.moneyChange(), G.fewestNotes(), G.paisa(), G.bill()),
  L(4, 9, 'Distance', 'दुरी', G.units('km', 'm', 1000, 9, 'किमी', 'मिटर'), G.units('m', 'cm', 100), G.units('cm', 'mm', 10, 9, 'सेमी', 'मिमी'), G.unitsMixed('km', 'm', 1000), G.unitsMixed('m', 'cm', 100)),
  L(4, 10, 'Capacity', 'क्षमता', G.units('L', 'mL', 1000, 9, 'लिटर', 'मिलिलिटर'), G.unitsMixed('L', 'mL', 1000), G.units('L', 'mL', 1000), G.addN(1000, 100), G.subN(1000, 100)),
  L(4, 11, 'Weight', 'तौल', G.units('kg', 'g', 1000, 9, 'केजी', 'ग्राम'), G.unitsMixed('kg', 'g', 1000), G.units('kg', 'g', 1000), G.addN(1000, 100), G.subN(1000, 100)),
  L(4, 12, 'Perimeter and Area', 'परिमिति र क्षेत्रफल', G.perimeter(), G.area(), G.squareP(), G.squareA(), G.missingSide(), G.tileArea()),
  L(4, 13, 'Bill and Budget', 'बिल र बजेट', G.bill(), G.budget(), G.moneyChange(), G.bill(), G.budget()),
  L(4, 14, 'Bar Diagram', 'स्तम्भ चित्र', G.graphScale(), G.graphMost(), G.graphDiff(), G.graphTotal(), G.graphScale()),
  L(4, 15, 'Algebra', 'बीजगणित', G.solveAdd(), G.solveSub(), G.solveMul(), G.evalExpr(), G.solveAdd(), G.evalExpr()),
];

/* ─────── Class 5 ─────── */
const solid5 = G.bank([['How many faces does a cube have?', undefined, '6', ['4', '8', '12']], ['How many edges does a cuboid have?', undefined, '12', ['6', '8', '10']], ['How many vertices does a square pyramid have?', undefined, '5', ['4', '6', '8']], ['A cylinder has how many flat faces?', undefined, '2', ['1', '3', '0']], ['A sphere has how many vertices?', undefined, '0', ['1', '2', '8']], ['Which solid has one vertex and one flat face?', undefined, 'Cone', ['Cylinder', 'Cube', 'Sphere']]]);
const unitBank5 = G.bank([['100 kg makes one…', undefined, 'Quintal', ['Tonne', 'Gram', 'Litre']], ['1000 kg makes one…', undefined, 'Tonne', ['Quintal', 'Gram', 'Litre']], ['1 km is equal to…', undefined, '1000 m', ['100 m', '10 m', '10000 m']], ['1 litre is equal to…', undefined, '1000 mL', ['100 mL', '10 mL', '10000 mL']]]);
const C5: Lesson[] = [
  L(5, 1, 'Lines and Angles', 'रेखा र कोण', H.angleOps(), H.angleKind56(), H.angleOps(), H.angleKind56(), G.straightAngle(), H.angleOps()),
  L(5, 2, 'Solid Objects', 'ठोस वस्तुहरू', solid5, solid5, H.polygonFaces(), H.euler(), G.tfBank([['A cube has 6 faces, 12 edges and 8 vertices.', undefined, true, 'Yes.'], ['A cone has 2 vertices.', undefined, false, 'A cone has 1 vertex.'], ['A cylinder has 2 flat faces.', undefined, true, 'Top and bottom.']])),
  L(5, 3, 'Number Sense', 'सङ्ख्याको ज्ञान', H.croreIndian(), H.croreDigit(), H.placeValue(), H.croreCount(), G.order(999999999, 4, true, 100000000), H.croreIndian(), H.placeValue()),
  L(5, 4, 'Simplification', 'सरलीकरण', H.bodmas(), H.bodmasMcq(), H.bodmas(), H.bodmas(), H.bodmasMcq(), H.bodmas()),
  L(5, 5, 'Fraction', 'भिन्न', H.fracAdd(), H.fracSub(), H.mixed(), H.fracAdd(), H.fracOfAmt(), H.mixed(), G.cmpFrac()),
  L(5, 6, 'Decimal', 'दशमलव', H.decAdd(), H.decSub(), H.decPlace(), H.decAdd(), H.decSub(), G.decimal(), G.decTenth()),
  L(5, 7, 'Percentage', 'प्रतिशत', H.pctOf(), H.fracToPct(), H.pctToDec(), H.pctOf(), G.percent(), H.fracToPct()),
  L(5, 8, 'Time', 'समय', G.time24(), G.time12to24(), G.duration(), G.timeUnits(), G.time24(), G.time12to24()),
  L(5, 9, 'Distance', 'दुरी', G.units('km', 'm', 1000, 9, 'किमी', 'मिटर'), G.units('m', 'cm', 100), G.units('cm', 'mm', 10, 9, 'सेमी', 'मिमी'), G.unitsMixed('km', 'm', 1000), G.unitsMixed('m', 'cm', 100), unitBank5),
  L(5, 10, 'Capacity', 'क्षमता', G.units('L', 'mL', 1000, 9, 'लिटर', 'मिलिलिटर'), G.unitsMixed('L', 'mL', 1000), G.units('L', 'mL', 1000), G.addN(2000, 100), G.subN(2000, 100), unitBank5),
  L(5, 11, 'Weight', 'तौल', G.units('kg', 'g', 1000, 9, 'केजी', 'ग्राम'), G.unitsMixed('kg', 'g', 1000), G.units('kg', 'g', 1000), G.addN(2000, 100), G.subN(2000, 100), unitBank5),
  L(5, 12, 'Perimeter, Area and Volume', 'परिमिति, क्षेत्रफल र आयतन', G.perimeter(), G.area(), G.squareP(), G.squareA(), G.missingSide(), H.volume(), H.volCube(), H.volMissing()),
  L(5, 13, 'Bill and Budget', 'बिल र बजेट', H.discBill(), H.discount(), H.vat(), G.bill(), H.budgetSave(), G.moneyChange()),
  L(5, 14, 'Presentation of Data', 'तथ्याङ्कको प्रस्तुति', H.tally(), G.graphScale(), G.graphMost(), G.graphDiff(), G.graphTotal(), H.barRead()),
  L(5, 15, 'Algebraic Expressions', 'बीजीय अभिव्यक्ति', G.evalExpr(), H.likeTerms(), H.exprWord(), G.evalExpr(), H.likeTerms(), G.solveAdd()),
];

/* ─────── Class 6 ─────── */
const solid6 = G.bank([['How many faces does a prism with a hexagonal base have?', undefined, '8', ['6', '7', '12']], ['A cube net has how many squares?', undefined, '6', ['4', '5', '8']], ['A cone has how many curved faces?', undefined, '1', ['2', '0', '3']], ['A triangular prism has how many vertices?', undefined, '6', ['5', '8', '9']], ['A square pyramid has how many edges?', undefined, '8', ['5', '6', '12']]]);
const plane6 = G.bank([['A quadrilateral with all sides equal and no right angles is a…', undefined, 'Rhombus', ['Square', 'Rectangle', 'Trapezium']], ['A quadrilateral with exactly one pair of parallel sides is a…', undefined, 'Trapezium', ['Rectangle', 'Rhombus', 'Square']], ['The angles of a quadrilateral add up to…', undefined, '360°', ['180°', '90°', '270°']], ['A triangle with all angles less than 90° is…', undefined, 'Acute-angled', ['Right-angled', 'Obtuse-angled', 'Straight']]]);
const C6: Lesson[] = [
  L(6, 1, 'Set', 'समूह', H.setOps(), H.setOps(), H.setCard(), H.setMember(), H.setOps(), H.setCard()),
  L(6, 2, 'Whole Number', 'पूर्ण सङ्ख्या', H.croreIndian(), H.factors(), H.primeTf(), H.hcf(), H.lcm(), H.divRule(), H.placeValue(), H.hcf(), H.lcm()),
  L(6, 3, 'Integers', 'पूर्णाङ्क', H.intAdd(), H.intSub(), H.intCmp(), H.intOrder(), H.intAbs(), H.intWord(), H.intAdd(), H.intSub()),
  L(6, 4, 'Fraction', 'भिन्न', H.fracAdd(true), H.fracSub(), H.fracMul(), H.fracDiv(), H.mixed(), H.fracMul(), H.fracDiv(), H.fracOfAmt()),
  L(6, 5, 'Decimal', 'दशमलव', H.decShift(), H.decMul(), H.decDivWhole(), H.decAdd(), H.decSub(), H.decMul(), H.decShift()),
  L(6, 6, 'Percentage', 'प्रतिशत', H.pctOf(), H.fracToPct(), H.pctToDec(), H.pctIncrease(), H.discount(), H.vat(), H.pctOf()),
  L(6, 7, 'Profit and Loss', 'नाफा र नोक्सान', H.profit(), H.loss(), H.profitPct(), H.profit(), H.loss(), H.profitPct()),
  L(6, 8, 'Unitary Method', 'ऐकिक नियम', H.unitary(), H.unitaryHow(), H.unitary(), H.unitaryHow(), H.unitary(), H.discBill()),
  L(6, 9, 'Distance', 'दुरी', G.units('km', 'm', 1000, 9, 'किमी', 'मिटर'), G.units('m', 'cm', 100), G.units('cm', 'mm', 10, 9, 'सेमी', 'मिमी'), G.units('hm', 'm', 100, 9), G.units('dam', 'm', 10, 9), G.unitsMixed('km', 'm', 1000), G.unitsMixed('m', 'cm', 100)),
  L(6, 10, 'Perimeter, Area and Volume', 'परिमिति, क्षेत्रफल र आयतन', H.triArea(), H.parArea(), H.trapArea(), H.volume(), H.volCube(), H.volMissing(), H.litres(), G.area()),
  L(6, 11, 'Indices', 'घाताङ्क', H.power(), H.indexLaw(), H.power(), H.indexLaw(), G.bank([['a⁰ = ?', undefined, '1', ['0', 'a', 'undefined']], ['10³ = ?', undefined, '1000', ['30', '100', '10000']]]), H.power()),
  L(6, 12, 'Algebraic Expression', 'बीजीय अभिव्यक्ति', H.expand(), H.likeTerms(), H.exprWord(), G.evalExpr(), H.expand(), H.likeTerms()),
  L(6, 13, 'Equation, Inequality and Graph', 'समीकरण, असमानता र ग्राफ', G.solveAdd(), G.solveSub(), G.solveMul(), H.twoStep(), H.ineqTf(), H.linearY(), H.twoStep(), H.ineqTf()),
  L(6, 14, 'Lines and Angles', 'रेखा र कोण', H.transversal(), H.transversal(), H.angleOps(), H.angleKind56(), H.transversal(), H.angleOps()),
  L(6, 15, 'Plane Shapes', 'समतलीय आकृतिहरू', H.triThird(), H.quadAngle(), plane6, H.triThird(), H.quadAngle(), plane6),
  L(6, 16, 'Circle', 'वृत्त', H.circleD(), H.circumference(), H.circleD(), H.circumference(), G.bank([['The longest chord of a circle is the…', undefined, 'Diameter', ['Radius', 'Arc', 'Sector']], ['A line from the centre to the circle is the…', undefined, 'Radius', ['Chord', 'Diameter', 'Arc']]])),
  L(6, 17, 'Solid Objects', 'ठोस वस्तुहरू', solid6, H.polygonFaces(), H.euler(), solid6, H.volume(), H.volCube()),
  L(6, 18, 'Co-ordinate Geometry', 'निर्देशाङ्क ज्यामिति', H.quadrant(), H.reflect(), H.quadrant(), H.reflect(), G.bank([['The coordinates of the origin are…', undefined, '(0, 0)', ['(1, 1)', '(0, 1)', '(1, 0)']], ['The point (3, −2) lies in…', undefined, 'Quadrant IV', ['Quadrant I', 'Quadrant II', 'Quadrant III']]])),
  L(6, 19, 'Symmetry and Tessellation', 'सममिति र टेस्सेलेसन', H.symLines(), H.tessel(), H.symLines(), H.tessel(), G.tfBank([['A circle has infinitely many lines of symmetry.', undefined, true, 'Yes.'], ['A scalene triangle has 3 lines of symmetry.', undefined, false, 'It has none.']])),
  L(6, 20, 'Statistics', 'तथ्याङ्कशास्त्र', H.mean(), H.median(), H.mode(), H.range(), H.mean(), H.median(), H.mode(), H.range()),
];

const ALL = [...C1, ...C2, ...C3, ...C4, ...C5, ...C6];
const toQuestion = (activityId: any, n: number, q: Q) => ({ activityId, questionNumber: n, type: q.type, prompt: q.prompt, promptNepali: q.promptNepali, points: 1, explanation: q.explanation || '', hint: q.hint, data: q.data });

async function main() {
  await mongoose.connect(MONGODB_URI);
  const base: any = await mongoose.connection.db!.collection('activities').findOne({ subjectCode: 'MTH', subjectId: { $exists: true } });
  const subjectId = base?.subjectId, createdBy = base?.createdBy;
  if (!subjectId) console.warn('No existing Mathematics activity found: activities will be saved without a subjectId.');
  let acts = 0, qs = 0;
  for (const l of ALL) {
    const code = `ACT-C${l.cls}-MTH-L${l.ch}`;
    const questions = build(l.gens, 10);
    const doc: any = {
      code, title: `Class ${l.cls} · Lesson ${l.ch}: ${l.en}`, titleNepali: `कक्षा ${l.cls} · पाठ ${l.ch}: ${l.np}`, description: `Practice questions for "${l.en}" — auto-graded, ten questions.`,
      type: questions[0].type, gradeLevels: [l.cls], subjectCode: 'MTH', chapterNumber: l.ch, topicName: l.en, learningObjectives: [`Practise ${l.en}`],
      totalMarks: questions.length, passingScore: Math.ceil(questions.length / 2), timeLimitMinutes: 15, isPublished: true, questionsCount: questions.length,
      ...(subjectId ? { subjectId } : {}), ...(createdBy ? { createdBy } : {}),
    };
    const a: any = await Activity.findOneAndUpdate({ code }, { $set: doc }, { upsert: true, returnDocument: 'after' });
    await ActivityQuestion.deleteMany({ activityId: a._id });
    await ActivityQuestion.insertMany(questions.map((q, i) => toQuestion(a._id, i + 1, q)));
    acts++; qs += questions.length;
    if (questions.length < 8) console.warn(`  ${code}: only ${questions.length} questions`);
  }
  console.log(`Done: ${acts} activities, ${qs} questions (Classes 1–6 Mathematics).`);
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });

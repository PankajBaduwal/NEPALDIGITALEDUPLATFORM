/**
 * Class 5 lessons 8 (time units), 9 (distance), 10 (capacity), 11 (weight) and Class 6 lesson 9 (distance).
 * Built on the shared unit-conversion engine from Class 3 (UnitLab).
 */
import { makeUnitSim } from '../class3-math/UnitLab';

export const TimeUnits5 = makeUnitSim({
  code: 'SIM-MATH-G5-L8-02', chapter: 8, titleNp: 'समयका एकाइ', titleEn: 'Units of Time',
  hintNp: '1 घण्टा = 60 मिनेट · 1 मिनेट = 60 सेकेन्ड', hintEn: '1 hour = 60 minutes · 1 minute = 60 seconds',
  pairs: [
    { bigNp: 'घण्टा', bigEn: 'hour', smallNp: 'मिनेट', smallEn: 'minutes', factor: 60, max: 8, step: 10, visual: 'hours', color: '#0ea5e9' },
    { bigNp: 'मिनेट', bigEn: 'minute', smallNp: 'सेकेन्ड', smallEn: 'seconds', factor: 60, max: 8, step: 10, visual: 'minutes', color: '#ec4899' },
  ],
});

export const DistanceLab5 = makeUnitSim({
  code: 'SIM-MATH-G5-L9-01', chapter: 9, titleNp: 'दुरी: नाप र रूपान्तरण', titleEn: 'Distance: measure and convert',
  hintNp: '1 किमी = 1000 मिटर · 1 मिटर = 100 सेमी · 1 सेमी = 10 मिमी', hintEn: '1 km = 1000 m · 1 m = 100 cm · 1 cm = 10 mm',
  pairs: [
    { bigNp: 'किमी', bigEn: 'km', smallNp: 'मिटर', smallEn: 'm', factor: 1000, max: 8, step: 100, visual: 'road', color: '#475569' },
    { bigNp: 'मिटर', bigEn: 'm', smallNp: 'सेमी', smallEn: 'cm', factor: 100, max: 8, step: 10, visual: 'ruler', color: '#f97316' },
    { bigNp: 'सेमी', bigEn: 'cm', smallNp: 'मिमी', smallEn: 'mm', factor: 10, max: 10, step: 1, visual: 'ruler', color: '#ec4899', bs: 'cm', ss: 'mm' },
  ],
});

export const CapacityLab5 = makeUnitSim({
  code: 'SIM-MATH-G5-L10-01', chapter: 10, titleNp: 'क्षमता: लिटर र मिलिलिटर', titleEn: 'Capacity: litre and millilitre',
  hintNp: '1 लिटर = 1000 मिलिलिटर। ट्याङ्की भरेर नापौँ र जोडघटाउ गरौँ।', hintEn: '1 litre = 1000 millilitres. Fill the tank, then add and subtract.',
  pairs: [{ bigNp: 'लिटर', bigEn: 'L', smallNp: 'मिलि', smallEn: 'mL', factor: 1000, max: 8, step: 100, visual: 'jug', color: '#0ea5e9' }],
});

export const WeightLab5 = makeUnitSim({
  code: 'SIM-MATH-G5-L11-01', chapter: 11, titleNp: 'तौल: केजी, ग्राम', titleEn: 'Weight: kilogram and gram',
  hintNp: '1 केजी = 1000 ग्राम · 100 केजी = 1 क्विन्टल · 1000 केजी = 1 टन', hintEn: '1 kg = 1000 g · 100 kg = 1 quintal · 1000 kg = 1 tonne',
  pairs: [
    { bigNp: 'केजी', bigEn: 'kg', smallNp: 'ग्राम', smallEn: 'g', factor: 1000, max: 8, step: 100, visual: 'scale', color: '#a16207' },
    { bigNp: 'क्विन्टल', bigEn: 'quintal', smallNp: 'केजी', smallEn: 'kg', factor: 100, max: 8, step: 10, visual: 'scale', color: '#7c3aed', bs: 'q', ss: 'kg' },
    { bigNp: 'टन', bigEn: 'tonne', smallNp: 'केजी', smallEn: 'kg', factor: 1000, max: 6, step: 100, visual: 'scale', color: '#0f766e', bs: 't', ss: 'kg' },
  ],
});

export const DistanceLab6 = makeUnitSim({
  code: 'SIM-MATH-G6-L9-01', chapter: 9, titleNp: 'दुरी: किमीदेखि मिमीसम्म', titleEn: 'Distance: km to mm',
  hintNp: 'किमी → हेक्टोमिटर → डेकामिटर → मिटर → सेमी → मिमी: प्रत्येक ठाउँमा 10 गुणा', hintEn: 'km → hm → dam → m → cm → mm: each step is 10 times',
  pairs: [
    { bigNp: 'किमी', bigEn: 'km', smallNp: 'मिटर', smallEn: 'm', factor: 1000, max: 8, step: 100, visual: 'road', color: '#475569' },
    { bigNp: 'हेक्टोमिटर', bigEn: 'hm', smallNp: 'मिटर', smallEn: 'm', factor: 100, max: 8, step: 10, visual: 'ruler', color: '#0ea5e9', bs: 'hm', ss: 'm' },
    { bigNp: 'डेकामिटर', bigEn: 'dam', smallNp: 'मिटर', smallEn: 'm', factor: 10, max: 10, step: 1, visual: 'ruler', color: '#22c55e', bs: 'dam', ss: 'm' },
    { bigNp: 'मिटर', bigEn: 'm', smallNp: 'सेमी', smallEn: 'cm', factor: 100, max: 8, step: 10, visual: 'ruler', color: '#f97316' },
    { bigNp: 'सेमी', bigEn: 'cm', smallNp: 'मिमी', smallEn: 'mm', factor: 10, max: 10, step: 1, visual: 'ruler', color: '#ec4899', bs: 'cm', ss: 'mm' },
  ],
});

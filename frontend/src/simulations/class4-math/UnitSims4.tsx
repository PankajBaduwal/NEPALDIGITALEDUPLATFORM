/**
 * Class 4 lessons 9, 10 and 11 · Distance, Capacity, Weight.
 * Built on the shared unit-conversion engine from Class 3 (UnitLab).
 */
import { makeUnitSim } from '../class3-math/UnitLab';

export const DistanceLab = makeUnitSim({
  code: 'SIM-MATH-G4-L9-01', chapter: 9, titleNp: 'दुरी: किमी, मिटर, सेमी, मिमी', titleEn: 'Distance: km, m, cm, mm',
  hintNp: '१ किमी = १००० मिटर · १ मिटर = १०० सेमी · १ सेमी = १० मिमी', hintEn: '1 km = 1000 m · 1 m = 100 cm · 1 cm = 10 mm',
  pairs: [
    { bigNp: 'किमी', bigEn: 'km', smallNp: 'मिटर', smallEn: 'm', factor: 1000, max: 6, step: 100, visual: 'road', color: '#475569' },
    { bigNp: 'मिटर', bigEn: 'm', smallNp: 'सेमी', smallEn: 'cm', factor: 100, max: 6, step: 10, visual: 'ruler', color: '#f97316' },
    { bigNp: 'सेमी', bigEn: 'cm', smallNp: 'मिमी', smallEn: 'mm', factor: 10, max: 10, step: 1, visual: 'ruler', color: '#ec4899', bs: 'cm', ss: 'mm' },
  ],
});

export const CapacityLab = makeUnitSim({
  code: 'SIM-MATH-G4-L10-01', chapter: 10, titleNp: 'क्षमता: लिटर र मिलिलिटर', titleEn: 'Capacity: litre and millilitre',
  hintNp: '१ लिटर = १००० मिलिलिटर। ट्याङ्की भर्दै नापौँ।', hintEn: '1 litre = 1000 millilitres. Fill the tank and measure.',
  pairs: [{ bigNp: 'लिटर', bigEn: 'L', smallNp: 'मिलि', smallEn: 'mL', factor: 1000, max: 8, step: 100, visual: 'jug', color: '#0ea5e9' }],
});

export const WeightLab = makeUnitSim({
  code: 'SIM-MATH-G4-L11-01', chapter: 11, titleNp: 'तौल: किलोग्राम र ग्राम', titleEn: 'Weight: kilogram and gram',
  hintNp: '१ केजी = १००० ग्राम। तराजुमा तौल थपेर हेरौँ।', hintEn: '1 kg = 1000 g. Add weights on the scale and watch.',
  pairs: [{ bigNp: 'केजी', bigEn: 'kg', smallNp: 'ग्राम', smallEn: 'g', factor: 1000, max: 6, step: 100, visual: 'scale', color: '#a16207' }],
});

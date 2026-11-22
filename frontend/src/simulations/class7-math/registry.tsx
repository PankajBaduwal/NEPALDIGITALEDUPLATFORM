import React, { lazy, Suspense } from 'react';

const L = (fn: () => Promise<any>, exportName?: string) => {
  const Comp = lazy(async () => {
    const mod = await fn();
    return { default: exportName ? mod[exportName] : mod.default };
  });
  return (props: any) => (
    <Suspense
      fallback={
        <div style={{ padding: 40, textAlign: 'center', color: '#187C68', fontWeight: 800 }}>
          लोड हुँदैछ... (Loading simulation...)
        </div>
      }
    >
      <Comp {...props} />
    </Suspense>
  );
};

export const CLASS7_MATH = [
  {
    code: 'SIM-MATH-G7-L1-01',
    key: 'class7-math-ch1-set-builder',
    lesson: 1,
    titleEn: 'Set Builder and Classification Lab',
    titleNp: 'समूह निर्माण र वर्गीकरण प्रयोगशाला',
    Component: L(() => import('./SetBuilderClassificationLab'), 'SetBuilderClassificationLab'),
  },
  {
    code: 'SIM-MATH-G7-L1-02',
    key: 'class7-math-ch1-types-of-sets',
    lesson: 1,
    titleEn: 'Types of Sets – Discovery World',
    titleNp: 'समूहका प्रकारहरू खोजी संसार',
    Component: L(() => import('./TypesOfSetsDiscovery'), 'TypesOfSetsDiscovery'),
  },
  {
    code: 'SIM-MATH-G7-L1-03',
    key: 'class7-math-ch1-equal-equivalent',
    lesson: 1,
    titleEn: 'Equal and Equivalent Sets Explorer',
    titleNp: 'बराबर र समतुल्य समूह अन्वेषक',
    Component: L(() => import('./EqualEquivalentSetsExplorer'), 'EqualEquivalentSetsExplorer'),
  },
  {
    code: 'SIM-MATH-G7-L1-04',
    key: 'class7-math-ch1-universal-set',
    lesson: 1,
    titleEn: 'Universal Set Explorer',
    titleNp: 'सर्वव्यापक समूह अन्वेषक',
    Component: L(() => import('./UniversalSetExplorer'), 'UniversalSetExplorer'),
  },
  {
    code: 'SIM-MATH-G7-L1-05',
    key: 'class7-math-ch1-subsets',
    lesson: 1,
    titleEn: 'Subset and Subset Builder Lab',
    titleNp: 'उपसमूह र उपसमूह निर्माण प्रयोगशाला',
    Component: L(() => import('./SubsetBuilderLab'), 'SubsetBuilderLab'),
  },
  {
    code: 'SIM-MATH-G7-L1-06',
    key: 'class7-math-ch1-classroom-3d',
    lesson: 1,
    titleEn: 'My Classroom – Real-World Set Formation',
    titleNp: 'मेरो कक्षाकोठा – वास्तविक वस्तुबाट समूह निर्माण',
    Component: L(() => import('./ClassroomSetFormation3D'), 'ClassroomSetFormation3D'),
  },
];

export const findClass7Sim = (componentKey?: string, code?: string) =>
  CLASS7_MATH.find((s) => (componentKey && s.key === componentKey) || (code && s.code === code));

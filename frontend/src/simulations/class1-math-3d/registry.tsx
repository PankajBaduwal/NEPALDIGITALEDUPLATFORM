import React, { lazy } from 'react';

/**
 * Class 1 Mathematics · chapters 1–10, rebuilt as real 3D simulations on the shared kit.
 * Keyed by the existing `componentKey`, so the database records and routing do not change.
 * The older 2D files stay in their chapter folders until the 3D versions are signed off.
 */
type Comp = React.ComponentType<{ onBackToLibrary: () => void; userRole?: string }>;
const L = (loader: () => Promise<any>, name: string): Comp => lazy(() => loader().then((m) => ({ default: m[name] })));

export const CLASS1_3D: Record<string, Comp> = {
  'class1-math-ch1-long-short': L(() => import('./Ch1'), 'LongShortExplorer3D'),
  'class1-math-ch1-direction-distance': L(() => import('./Ch1'), 'DirectionDistance3D'),
  'class1-math-ch2-colouring': L(() => import('./Ch2'), 'ColourTheLines3D'),
  'class1-math-ch2-dots': L(() => import('./Ch2'), 'ConnectTheDots3D'),
  'class1-math-ch2-objects': L(() => import('./Ch2'), 'DrawWithObjects3D'),
  'class1-math-ch2-drawing': L(() => import('./Ch2'), 'LineDrawingPlayground3D'),
  'class1-math-ch3-explorer': L(() => import('./Ch3'), 'ShapeExplorer3DNew'),
  'class1-math-ch3-matching': L(() => import('./Ch3'), 'MatchTheShape3D'),
  'class1-math-ch3-colouring': L(() => import('./Ch3'), 'ColourTheShapes3D'),
  'class1-math-ch3-detective': L(() => import('./Ch3'), 'ShapeDetective3D'),
  'class1-math-ch3-builder': L(() => import('./Ch3'), 'BuildWithShapes3D'),
  'class1-math-ch4-many-few': L(() => import('./Ch4'), 'ManyFew3D'),
  'class1-math-ch4-garden': L(() => import('./Ch4'), 'NumberGarden3D'),
  'class1-math-ch4-matching': L(() => import('./Ch4'), 'NumberMatching3D'),
  'class1-math-ch4-tracing': L(() => import('./Ch4'), 'NumberTracing3D'),
  'class1-math-ch4-sequence': L(() => import('./Ch4'), 'NumberSequence3D'),
  'class1-math-ch5-playground': L(() => import('./Ch5'), 'ZeroDiscovery3D'),
  'class1-math-ch5-empty-basket': L(() => import('./Ch5'), 'EmptyBasket3D'),
  'class1-math-ch5-where-did-it-go': L(() => import('./Ch5'), 'WhereDidItGo3D'),
  'class1-math-ch5-count-village': L(() => import('./Ch5'), 'CountTheVillage3D'),
  'class1-math-ch5-zero-challenge': L(() => import('./Ch5'), 'ZeroChallenge3D'),
  'class1-math-ch6-ten-objects': L(() => import('./Ch6'), 'TenObjects3D'),
  'class1-math-ch6-discovery': L(() => import('./Ch6'), 'TenDiscovery3D'),
  'class1-math-ch6-make-ten': L(() => import('./Ch6'), 'MakeTen3D'),
  'class1-math-ch6-count-match': L(() => import('./Ch6'), 'CountMatchTen3D'),
  'class1-math-ch6-writing': L(() => import('./Ch6'), 'TenWriting3D'),
  'class1-math-ch7-playground': L(() => import('./Ch7'), 'AdditionPlayground3D'),
  'class1-math-ch7-make-total': L(() => import('./Ch7'), 'MakeTheTotal3D'),
  'class1-math-ch7-number-houses': L(() => import('./Ch7'), 'NumberBondHouses3D'),
  'class1-math-ch7-count-on': L(() => import('./Ch7'), 'CountOn3D'),
  'class1-math-ch7-equation-studio': L(() => import('./Ch7'), 'AdditionEquationStudio3D'),
  'class1-math-ch8-playground': L(() => import('./Ch8'), 'SubtractionPlayground3D'),
  'class1-math-ch8-basket-adventure': L(() => import('./Ch8'), 'EmptyTheBasket3D'),
  'class1-math-ch8-equation-studio': L(() => import('./Ch8'), 'SubtractionEquationStudio3D'),
  'class1-math-ch8-difference-explorer': L(() => import('./Ch8'), 'DifferenceExplorer3D'),
  'class1-math-ch8-challenge-world': L(() => import('./Ch8'), 'SubtractionChallengeWorld3D'),
  'class1-math-ch9-garden': L(() => import('./Ch9'), 'NumberGarden11_3D'),
  'class1-math-ch9-group-ten': L(() => import('./Ch9'), 'GroupOfTen3D'),
  'class1-math-ch9-tens-ones': L(() => import('./Ch9'), 'TensOnes3D'),
  'class1-math-ch9-number-line': L(() => import('./Ch9'), 'NumberLine11_3D'),
  'class1-math-ch9-challenge-world': L(() => import('./Ch9'), 'NumberOrdering3D'),
  'class1-math-ch10-playground': L(() => import('./Ch10'), 'AdditionPlayground20_3D'),
  'class1-math-ch10-make-ten': L(() => import('./Ch10'), 'MakeTenAdventure3D'),
  'class1-math-ch10-equation-studio': L(() => import('./Ch10'), 'AdditionEquationStudio20_3D'),
  'class1-math-ch10-block-builder': L(() => import('./Ch10'), 'AdditionBlockBuilder3D'),
  'class1-math-ch10-challenge-world': L(() => import('./Ch10'), 'AdditionChallengeWorld3D'),
};

export const findClass1ThreeD = (componentKey?: string) => (componentKey ? CLASS1_3D[componentKey] : undefined);

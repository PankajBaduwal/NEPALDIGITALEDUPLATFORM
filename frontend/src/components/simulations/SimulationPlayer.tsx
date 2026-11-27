/**
 * SimulationPlayer.tsx
 * Dedicated Simulation Player Component for 3D Interactive & HTML Simulations
 */
import React, { Suspense, useState } from 'react';
import { ArrowLeft, Maximize2, Minimize2, ExternalLink, RefreshCw } from 'lucide-react';
import { KprietSimulationPlayer } from './KprietSimulationPlayer';
import { launchOnSmartBoard } from './smartBoardLaunch';
import { findClass1Sim } from '../../simulations/class1-math-ch11-22/registry';
import { findClass1ThreeD } from '../../simulations/class1-math-3d/registry';
import { PositionPlayground } from '../../simulations/class1-math-ch1/PositionPlayground';
import { BigSmallWorld } from '../../simulations/class1-math-ch1/BigSmallWorld';
import { TallShortAdventure } from '../../simulations/class1-math-ch1/TallShortAdventure';
import { LongShortExplorer } from '../../simulations/class1-math-ch1/LongShortExplorer';
import { DirectionDistanceAdventure } from '../../simulations/class1-math-ch1/DirectionDistanceAdventure';

// Class 1 Mathematics - Chapter 2: Lines (रेखाहरू)
import { StraightCurvedLineExplorer } from '../../simulations/class1-math-ch2/StraightCurvedLineExplorer';
import { LineColoringSimulation } from '../../simulations/class1-math-ch2/LineColoringSimulation';
import { ConnectTheDotsSimulation } from '../../simulations/class1-math-ch2/ConnectTheDotsSimulation';
import { DrawWithObjectsSimulation } from '../../simulations/class1-math-ch2/DrawWithObjectsSimulation';
import { LineDrawingPlayground } from '../../simulations/class1-math-ch2/LineDrawingPlayground';

// Class 1 Mathematics - Chapter 3: Geometrical Shapes (ज्यामितीय आकारहरू)
import { ShapeExplorer3D } from '../../simulations/class1-math-ch3/ShapeExplorer3D';
import { ShapeMatchingSimulation } from '../../simulations/class1-math-ch3/ShapeMatchingSimulation';
import { ShapeColoringSimulation } from '../../simulations/class1-math-ch3/ShapeColoringSimulation';
import { ShapeDetectiveSimulation } from '../../simulations/class1-math-ch3/ShapeDetectiveSimulation';
import { ShapeBuilderSimulation } from '../../simulations/class1-math-ch3/ShapeBuilderSimulation';

// Class 1 Mathematics - Chapter 4: Numbers up to 9 (९ सम्मका सङ्ख्याहरू)
import { ManyFewAdventure } from '../../simulations/class1-math-ch4/ManyFewAdventure';
import { NumberGardenSimulation } from '../../simulations/class1-math-ch4/NumberGardenSimulation';
import { NumberMatchingSimulation } from '../../simulations/class1-math-ch4/NumberMatchingSimulation';
import { NumberTracingSimulation } from '../../simulations/class1-math-ch4/NumberTracingSimulation';
import { NumberSequenceSimulation } from '../../simulations/class1-math-ch4/NumberSequenceSimulation';

// Class 1 Mathematics - Chapter 5: Zero (शून्य)
import { ZeroDiscoveryPlayground } from '../../simulations/class1-math-ch5/ZeroDiscoveryPlayground';
import { EmptyBasketAdventure } from '../../simulations/class1-math-ch5/EmptyBasketAdventure';
import { WhereDidEverythingGo } from '../../simulations/class1-math-ch5/WhereDidEverythingGo';
import { CountTheVillage } from '../../simulations/class1-math-ch5/CountTheVillage';
import { ZeroChallenge } from '../../simulations/class1-math-ch5/ZeroChallenge';

// Class 1 Mathematics - Chapter 6: Ten (दश)
import { TenObjectAdventure } from '../../simulations/class1-math-ch6/TenObjectAdventure';
import { NumberTenDiscovery } from '../../simulations/class1-math-ch6/NumberTenDiscovery';
import { MakeTenChallenge } from '../../simulations/class1-math-ch6/MakeTenChallenge';
import { CountAndMatchTen } from '../../simulations/class1-math-ch6/CountAndMatchTen';
import { NumberTenWritingStudio } from '../../simulations/class1-math-ch6/NumberTenWritingStudio';

// Class 1 Mathematics - Chapter 7: Addition up to 10 (योगफल १० सम्म आउने जोड)
import { AdditionPlayground } from '../../simulations/class1-math-ch7/AdditionPlayground';
import { MakeTheTotal } from '../../simulations/class1-math-ch7/MakeTheTotal';
import { NumberBondHouses } from '../../simulations/class1-math-ch7/NumberBondHouses';
import { CountOnAdventure } from '../../simulations/class1-math-ch7/CountOnAdventure';
import { AdditionEquationStudio } from '../../simulations/class1-math-ch7/AdditionEquationStudio';

// Class 1 Mathematics - Chapter 8: Subtraction up to 10 (१० सम्मका सङ्ख्याहरूको घटाउ)
import { SubtractionPlayground } from '../../simulations/class1-math-ch8/SubtractionPlayground';
import { EmptyTheBasketAdventure } from '../../simulations/class1-math-ch8/EmptyTheBasketAdventure';
import { SubtractionEquationStudio } from '../../simulations/class1-math-ch8/SubtractionEquationStudio';
import { DifferenceExplorer } from '../../simulations/class1-math-ch8/DifferenceExplorer';
import { SubtractionChallengeWorld } from '../../simulations/class1-math-ch8/SubtractionChallengeWorld';

// Class 1 Mathematics - Chapter 9: Numbers 11 to 20 (११ देखि २० सम्मका सङ्ख्याहरू)
import { NumberGarden } from '../../simulations/class1-math-ch9/NumberGarden';
import { MakeAGroupOfTen } from '../../simulations/class1-math-ch9/MakeAGroupOfTen';
import { TensAndOnesExplorer } from '../../simulations/class1-math-ch9/TensAndOnesExplorer';
import { NumberLineAdventure } from '../../simulations/class1-math-ch9/NumberLineAdventure';
import { NumberOrderingChallengeWorld } from '../../simulations/class1-math-ch9/NumberOrderingChallengeWorld';

// Class 1 Mathematics - Chapter 10: Addition up to 20 (योगफल २० सम्म आउने जोड)
import { AdditionPlayground as AdditionPlaygroundCh10 } from '../../simulations/class1-math-ch10/AdditionPlayground';
import { MakeTenAdventure } from '../../simulations/class1-math-ch10/MakeTenAdventure';
import { AdditionEquationStudio as AdditionEquationStudioCh10 } from '../../simulations/class1-math-ch10/AdditionEquationStudio';
import { AdditionBlockBuilder } from '../../simulations/class1-math-ch10/AdditionBlockBuilder';
import { AdditionChallengeWorld } from '../../simulations/class1-math-ch10/AdditionChallengeWorld';

// Class 1–5 Mathematics - Interactive Number Line & Counting Frog 3D Edition
import { NumberLineFrog3D } from '../../simulations/number-line-3d/NumberLineFrog3D';

// Class 4 Science & Technology - Chapter 1: Scientific Learning (वैज्ञानिक सिकाइ)
import { FloatingSinkingLab } from '../../simulations/class4-science/ch1-scientific-learning/FloatingSinkingLab';
import { DissolvingMaterialsLab } from '../../simulations/class4-science/ch1-scientific-learning/DissolvingMaterialsLab';
import { MeasurementLab } from '../../simulations/class4-science/ch1-scientific-learning/MeasurementLab';

// Class 4 Science & Technology - Chapter 2: ICT (सूचना तथा सञ्चार प्रविधि)
import { ExploreComputerSim } from '../../simulations/class4-science/ch2-ict/ExploreComputerSim';
import { InputProcessingOutputSim } from '../../simulations/class4-science/ch2-ict/InputProcessingOutputSim';
import { VirtualComputerLab } from '../../simulations/class4-science/ch2-ict/VirtualComputerLab';

// Class 4 Science & Technology - Chapter 3: Organisms and Environment (जीवहरू र वातावरण)
import { LivingEnvironmentSim } from '../../simulations/class4-science/ch3-organisms-environment/LivingEnvironmentSim';
import { EcosystemExplorerSim } from '../../simulations/class4-science/ch3-organisms-environment/EcosystemExplorerSim';
import { PollutionLabSim } from '../../simulations/class4-science/ch3-organisms-environment/PollutionLabSim';
import { DeforestationConservationSim } from '../../simulations/class4-science/ch3-organisms-environment/DeforestationConservationSim';

// Class 4 Science & Technology - Chapter 4: Classification of Living Beings (जीवहरूको वर्गीकरण)
import { AnimalClassificationSim } from '../../simulations/class4-science/ch4-classification/AnimalClassificationSim';
import { PlantGardenSim } from '../../simulations/class4-science/ch4-classification/PlantGardenSim';
import { AquaticTerrestrialSim } from '../../simulations/class4-science/ch4-classification/AquaticTerrestrialSim';
import { FloweringPlantsSim } from '../../simulations/class4-science/ch4-classification/FloweringPlantsSim';

// Class 4 Science & Technology - Chapter 5: Life Process (जीवन प्रक्रिया)
import { ButterflyLifeCycleSim } from '../../simulations/class4-science/ch5-life-process/ButterflyLifeCycleSim';
import { SeedGerminationSim } from '../../simulations/class4-science/ch5-life-process/SeedGerminationSim';
import { PlantGrowthSim } from '../../simulations/class4-science/ch5-life-process/PlantGrowthSim';
import { HumanGrowthSim } from '../../simulations/class4-science/ch5-life-process/HumanGrowthSim';
import { AnimalLifeCyclesSim } from '../../simulations/class4-science/ch5-life-process/AnimalLifeCyclesSim';

// Class 4 Science & Technology - Chapter 6: Matter (पदार्थ)
import { StatesOfMatterSim } from '../../simulations/class4-science/ch6-matter/StatesOfMatterSim';
import { MeltingFreezingSim } from '../../simulations/class4-science/ch6-matter/MeltingFreezingSim';
import { EvaporationCondensationSim } from '../../simulations/class4-science/ch6-matter/EvaporationCondensationSim';
import { WaterCycleSim } from '../../simulations/class4-science/ch6-matter/WaterCycleSim';
import { WaterSourcesSim } from '../../simulations/class4-science/ch6-matter/WaterSourcesSim';

// Class 4 Science & Technology - Chapter 7: Energy (शक्ति)
import { EnergyFormsSim } from '../../simulations/class4-science/ch7-energy/EnergyFormsSim';
import { VirtualElectricityLab } from '../../simulations/class4-science/ch7-energy/VirtualElectricityLab';
import { MagnetExplorerSim } from '../../simulations/class4-science/ch7-energy/MagnetExplorerSim';

// Class 4 Science & Technology - Chapter 8: The Earth and Space (पृथ्वी र अन्तरिक्ष)
import { PlanetEarthSim } from '../../simulations/class4-science/ch8-earth-space/PlanetEarthSim';
import { LandformsExplorerSim } from '../../simulations/class4-science/ch8-earth-space/LandformsExplorerSim';
import { WaterBodiesExplorerSim } from '../../simulations/class4-science/ch8-earth-space/WaterBodiesExplorerSim';
import { AtmosphereExplorerSim } from '../../simulations/class4-science/ch8-earth-space/AtmosphereExplorerSim';
import { WeatherSimulatorSim } from '../../simulations/class4-science/ch8-earth-space/WeatherSimulatorSim';
import { WeatherObservationLab } from '../../simulations/class4-science/ch8-earth-space/WeatherObservationLab';

// Class 6 Science & Technology (विज्ञान तथा प्रविधि) - Units 1 to 11
import {
  ScientificMethodLab,
  MeasurementLabSim,
  ComputerHardwareExplorerSim,
  VirtualOfficeLabSim,
  AnimalAdaptationSim,
  AnimalClassificationLabSim,
  VertebrateInvertebrateSim,
  FloweringNonFloweringSim,
  EcosystemSimulatorSim,
  FoodChainExplorerSim,
  WasteManagementLabSim,
  PhotosynthesisLabSim,
  HumanDigestiveSystemSim,
  ForceMotionPlaygroundSim,
  RestMotionExplorerSim,
  SpeedMotionLabSim,
  SpringBalanceLabSim,
  SimpleMachineWorkshopSim,
  PotentialKineticEnergySim,
  EnergyTransformationLabSim,
  HeatTransferLabSim,
  ThermalExpansionSim,
  LightShadowLabSim,
  PinholeCameraSim,
  SoundVibrationLabSim,
  MagneticFieldExplorerSim,
  MagnetMakingLabSim,
  ElectromagnetWorkshopSim,
  VirtualCircuitBuilderSim,
  SimpleCellLabSim,
  MixtureLabSim,
  SolutionExplorerSim,
  SeparationLabSim,
  DistillationSimulatorSim,
  PaperChromatographyLabSim,
  CentrifugationSimulatorSim,
  MetalsNonMetalsLabSim,
  EverydayChemicalsSim,
  MaterialEnvironmentalImpactSim,
  EarthInternalStructureSim,
  SeasonsRevolutionSim,
  SolarSystemExplorerSim,
  SoilFormationSim,
  SoilProfileExplorerSim,
  SoilConservationLabSim,
  SoilPollutionSimulatorSim,
} from '../../simulations/class6-science';

// Class 10 Science - Chapter 1: Force & Gravitation (बल र गुरुत्वाकर्षण)
import { UniversalGravitationSim } from '../../simulations/class10-science/ch1-force/UniversalGravitationSim';
import { TidesGravitationSim } from '../../simulations/class10-science/ch1-force/TidesGravitationSim';
import { CoinAndFeatherSim } from '../../simulations/class10-science/ch1-force/CoinAndFeatherSim';
import { PascalsLawSim } from '../../simulations/class10-science/ch2-pressure/PascalsLawSim';
import { ArchimedesPrincipleSim } from '../../simulations/class10-science/ch2-pressure/ArchimedesPrincipleSim';
import { PhenomenaOfLightSim } from '../../simulations/class10-science/ch5-light/PhenomenaOfLightSim';

export interface SimulationPlayerProps {
  simulation: {
    id: string;
    code: string;
    title: string;
    titleNepali?: string;
    description: string;
    gradeLevels: number[];
    subjectCode?: string;
    subjectName?: string;
    chapterNumber?: number;
    chapterTitle?: string;
    simulationType: string;
    componentKey?: string;
    runtimeUrl: string;
  };
  onClose: () => void;
  userRole?: string;
  /** Running inside a Smart Board partition: no Smart Board button. */
  embedded?: boolean;
}

const SimulationPlayerView: React.FC<SimulationPlayerProps> = ({
  simulation,
  onClose,
  userRole = 'TEACHER',
  embedded = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Simulations ported from KPRIET (Class 1–2 library entries): run in the isolated KPRIET host page
  if (simulation.componentKey?.startsWith('kpriet:')) {
    return <KprietSimulationPlayer simulationId={simulation.componentKey.slice('kpriet:'.length)} title={simulation.title} onClose={onClose} />;
  }

  // Class 1 Mathematics chapters 1–10: the 3D rebuilds take over from the older 2D pages (same componentKey)
  const threeD = findClass1ThreeD(simulation.componentKey);
  if (threeD) {
    const Sim3D = threeD;
    return (
      <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', fontWeight: 800, color: '#0f766e' }}>Loading…</div>}>
        <Sim3D onBackToLibrary={onClose} userRole={userRole} />
      </Suspense>
    );
  }

  // Render direct interactive React Three.js WebGL components
  if (
    simulation.componentKey === 'class1-math-ch1-playground' ||
    simulation.code === 'SIM-MATH-G1-CH1-01' ||
    simulation.code === 'SIM-MATH-G1-C1-01'
  ) {
    return <PositionPlayground onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (
    simulation.componentKey === 'class1-math-ch1-big-small' ||
    simulation.code === 'SIM-MATH-G1-CH1-02'
  ) {
    return <BigSmallWorld onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (
    simulation.componentKey === 'class1-math-ch1-tall-short' ||
    simulation.code === 'SIM-MATH-G1-CH1-03'
  ) {
    return <TallShortAdventure onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch1-long-short') {
    return <LongShortExplorer onBackToLibrary={onClose} />;
  }
  if (simulation.componentKey === 'class1-math-ch1-direction-distance') {
    return <DirectionDistanceAdventure onBackToLibrary={onClose} />;
  }

  // Class 1 Mathematics - Chapter 2: Lines (रेखाहरू)
  if (simulation.componentKey === 'class1-math-ch2-explorer') {
    return <StraightCurvedLineExplorer onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch2-colouring') {
    return <LineColoringSimulation onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch2-dots') {
    return <ConnectTheDotsSimulation onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch2-objects') {
    return <DrawWithObjectsSimulation onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch2-drawing') {
    return <LineDrawingPlayground onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Class 1 Mathematics - Chapter 3: Geometrical Shapes (ज्यामितीय आकारहरू)
  if (simulation.componentKey === 'class1-math-ch3-explorer') {
    return <ShapeExplorer3D onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch3-matching') {
    return <ShapeMatchingSimulation onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch3-colouring') {
    return <ShapeColoringSimulation onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch3-detective') {
    return <ShapeDetectiveSimulation onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch3-builder') {
    return <ShapeBuilderSimulation onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Class 1 Mathematics - Chapter 4: Numbers up to 9 (९ सम्मका सङ्ख्याहरू)
  if (simulation.componentKey === 'class1-math-ch4-many-few') {
    return <ManyFewAdventure onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch4-garden') {
    return <NumberGardenSimulation onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch4-matching') {
    return <NumberMatchingSimulation onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch4-tracing') {
    return <NumberTracingSimulation onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch4-sequence') {
    return <NumberSequenceSimulation onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Class 1 Mathematics - Chapter 5: Zero (शून्य)
  if (simulation.componentKey === 'class1-math-ch5-playground') {
    return <ZeroDiscoveryPlayground onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch5-empty-basket') {
    return <EmptyBasketAdventure onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch5-where-did-it-go') {
    return <WhereDidEverythingGo onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch5-count-village') {
    return <CountTheVillage onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch5-zero-challenge') {
    return <ZeroChallenge onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Class 1 Mathematics - Chapter 6: Ten (दश)
  if (simulation.componentKey === 'class1-math-ch6-ten-objects') {
    return <TenObjectAdventure onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch6-discovery') {
    return <NumberTenDiscovery onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch6-make-ten') {
    return <MakeTenChallenge onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch6-count-match') {
    return <CountAndMatchTen onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch6-writing') {
    return <NumberTenWritingStudio onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Class 1 Mathematics - Chapter 7: Addition up to 10 (योगफल १० सम्म आउने जोड)
  if (simulation.componentKey === 'class1-math-ch7-playground') {
    return <AdditionPlayground onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch7-make-total') {
    return <MakeTheTotal onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch7-number-houses') {
    return <NumberBondHouses onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch7-count-on') {
    return <CountOnAdventure onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch7-equation-studio') {
    return <AdditionEquationStudio onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Class 1 Mathematics - Chapter 8: Subtraction up to 10 (१० सम्मका सङ्ख्याहरूको घटाउ)
  if (simulation.componentKey === 'class1-math-ch8-playground') {
    return <SubtractionPlayground onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch8-basket-adventure') {
    return <EmptyTheBasketAdventure onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch8-equation-studio') {
    return <SubtractionEquationStudio onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch8-difference-explorer') {
    return <DifferenceExplorer onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch8-challenge-world') {
    return <SubtractionChallengeWorld onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Class 1 Mathematics - Chapter 9: Numbers 11 to 20 (११ देखि २० सम्मका सङ्ख्याहरू)
  if (simulation.componentKey === 'class1-math-ch9-garden') {
    return <NumberGarden onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch9-group-ten') {
    return <MakeAGroupOfTen onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch9-tens-ones') {
    return <TensAndOnesExplorer onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch9-number-line') {
    return <NumberLineAdventure onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch9-challenge-world') {
    return <NumberOrderingChallengeWorld onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Class 1 Mathematics - Chapter 10: Addition up to 20 (योगफल २० सम्म आउने जोड)
  if (simulation.componentKey === 'class1-math-ch10-playground') {
    return <AdditionPlaygroundCh10 onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch10-make-ten') {
    return <MakeTenAdventure onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch10-equation-studio') {
    return <AdditionEquationStudioCh10 onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch10-block-builder') {
    return <AdditionBlockBuilder onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class1-math-ch10-challenge-world') {
    return <AdditionChallengeWorld onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Class 1 Mathematics - Chapters 11–22 (3D, one shared kit)
  const ch1122 = findClass1Sim(simulation.componentKey, simulation.code);
  if (ch1122) {
    const Sim = ch1122.Component;
    return (
      <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', fontWeight: 800, color: '#0f766e' }}>Loading…</div>}>
        <Sim onBackToLibrary={onClose} userRole={userRole} />
      </Suspense>
    );
  }

  // Class 1–5 Mathematics - Interactive Number Line & Counting Frog 3D Edition
  if (
    simulation.componentKey === 'class1-math-number-line-frog' ||
    simulation.code === 'SIM-MATH-G1-NUMBERLINE' ||
    simulation.runtimeUrl?.includes('math-number-line')
  ) {
    return <NumberLineFrog3D onBackToLibrary={onClose} userRole={userRole} embedded={embedded} />;
  }

  // ── Class 4 Science & Technology (विज्ञान तथा प्रविधि - कक्षा ४) ────────
  // Chapter 1: Scientific Learning (वैज्ञानिक सिकाइ)
  if (simulation.componentKey === 'class4-sci-ch1-floating-sinking') {
    return <FloatingSinkingLab onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch1-dissolving') {
    return <DissolvingMaterialsLab onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch1-measurement') {
    return <MeasurementLab onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Chapter 2: Information & Communication Technology (सूचना तथा सञ्चार प्रविधि)
  if (simulation.componentKey === 'class4-sci-ch2-explore-computer') {
    return <ExploreComputerSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch2-ipo-cycle') {
    return <InputProcessingOutputSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch2-virtual-computer') {
    return <VirtualComputerLab onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Chapter 3: Organisms & Environment (जीवहरू र वातावरण)
  if (simulation.componentKey === 'class4-sci-ch3-living-environment') {
    return <LivingEnvironmentSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch3-ecosystem-explorer') {
    return <EcosystemExplorerSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch3-pollution-lab') {
    return <PollutionLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch3-deforestation') {
    return <DeforestationConservationSim onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Chapter 4: Classification of Living Beings (जीवहरूको वर्गीकरण)
  if (simulation.componentKey === 'class4-sci-ch4-animal-classification') {
    return <AnimalClassificationSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch4-plant-garden') {
    return <PlantGardenSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch4-aquatic-terrestrial') {
    return <AquaticTerrestrialSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch4-flowering-plants') {
    return <FloweringPlantsSim onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Chapter 5: Life Process (जीवन प्रक्रिया)
  if (simulation.componentKey === 'class4-sci-ch5-butterfly-cycle') {
    return <ButterflyLifeCycleSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch5-seed-germination') {
    return <SeedGerminationSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch5-plant-growth') {
    return <PlantGrowthSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch5-human-growth') {
    return <HumanGrowthSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch5-animal-lifecycles') {
    return <AnimalLifeCyclesSim onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Chapter 6: Matter (पदार्थ)
  if (simulation.componentKey === 'class4-sci-ch6-states-of-matter') {
    return <StatesOfMatterSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch6-melting-freezing') {
    return <MeltingFreezingSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch6-evaporation-condensation') {
    return <EvaporationCondensationSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch6-water-cycle') {
    return <WaterCycleSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch6-water-sources') {
    return <WaterSourcesSim onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Chapter 7: Energy (शक्ति)
  if (simulation.componentKey === 'class4-sci-ch7-energy-forms') {
    return <EnergyFormsSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch7-electricity-lab') {
    return <VirtualElectricityLab onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch7-magnet-explorer') {
    return <MagnetExplorerSim onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Chapter 8: The Earth and Space (पृथ्वी र अन्तरिक्ष)
  if (simulation.componentKey === 'class4-sci-ch8-planet-earth') {
    return <PlanetEarthSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch8-landforms') {
    return <LandformsExplorerSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch8-water-bodies') {
    return <WaterBodiesExplorerSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch8-atmosphere') {
    return <AtmosphereExplorerSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch8-weather-simulator') {
    return <WeatherSimulatorSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class4-sci-ch8-weather-observation') {
    return <WeatherObservationLab onBackToLibrary={onClose} userRole={userRole} />;
  }

  // ══════════════════════════════════════════════════════════════
  // CLASS 6 SCIENCE & TECHNOLOGY (कक्षा ६ विज्ञान तथा प्रविधि) - 46 SIMULATIONS
  // ══════════════════════════════════════════════════════════════

  // Unit 1: Scientific Learning (वैज्ञानिक सिकाइ)
  if (simulation.componentKey === 'class6-sci-ch1-scientific-method') {
    return <ScientificMethodLab onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch1-measurement-lab') {
    return <MeasurementLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Unit 2: Information and Communication Technology (सूचना तथा सञ्चार प्रविधि)
  if (simulation.componentKey === 'class6-sci-ch2-computer-hardware') {
    return <ComputerHardwareExplorerSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch2-virtual-office') {
    return <VirtualOfficeLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Unit 3: Organisms and Their Structure (जीव र तिनका शारीरिक बनोट)
  if (simulation.componentKey === 'class6-sci-ch3-animal-adaptation') {
    return <AnimalAdaptationSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch3-animal-classification') {
    return <AnimalClassificationLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch3-vertebrate-invertebrate') {
    return <VertebrateInvertebrateSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch3-flowering-plants') {
    return <FloweringNonFloweringSim onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Unit 4: Environment and Biodiversity (वातावरण र जैविक विविधता)
  if (simulation.componentKey === 'class6-sci-ch4-ecosystem-simulator') {
    return <EcosystemSimulatorSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch4-food-chain-explorer') {
    return <FoodChainExplorerSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch4-waste-management') {
    return <WasteManagementLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Unit 5: Life Process (जीवन प्रक्रिया)
  if (simulation.componentKey === 'class6-sci-ch5-photosynthesis-lab') {
    return <PhotosynthesisLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch5-human-digestive-system') {
    return <HumanDigestiveSystemSim onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Unit 6: Force and Motion (बल र चाल)
  if (simulation.componentKey === 'class6-sci-ch6-force-motion-playground') {
    return <ForceMotionPlaygroundSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch6-rest-motion-explorer') {
    return <RestMotionExplorerSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch6-speed-motion-lab') {
    return <SpeedMotionLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch6-spring-balance-lab') {
    return <SpringBalanceLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch6-simple-machine-workshop') {
    return <SimpleMachineWorkshopSim onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Unit 7: Energy in Daily Life (दैनिक जीवनमा शक्ति)
  if (simulation.componentKey === 'class6-sci-ch7-potential-kinetic-energy') {
    return <PotentialKineticEnergySim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch7-energy-transformation-lab') {
    return <EnergyTransformationLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch7-heat-transfer-lab') {
    return <HeatTransferLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch7-thermal-expansion') {
    return <ThermalExpansionSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch7-light-shadow-lab') {
    return <LightShadowLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch7-pinhole-camera') {
    return <PinholeCameraSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch7-sound-vibration-lab') {
    return <SoundVibrationLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Unit 8: Electricity and Magnetism (विद्युत् र चुम्बकत्व)
  if (simulation.componentKey === 'class6-sci-ch8-magnetic-field-explorer') {
    return <MagneticFieldExplorerSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch8-magnet-making-lab') {
    return <MagnetMakingLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch8-electromagnet-workshop') {
    return <ElectromagnetWorkshopSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch8-virtual-circuit-builder') {
    return <VirtualCircuitBuilderSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch8-simple-cell-lab') {
    return <SimpleCellLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Unit 9: Matter (पदार्थ)
  if (simulation.componentKey === 'class6-sci-ch9-mixture-lab') {
    return <MixtureLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch9-solution-explorer') {
    return <SolutionExplorerSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch9-separation-lab') {
    return <SeparationLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch9-distillation-simulator') {
    return <DistillationSimulatorSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch9-paper-chromatography-lab') {
    return <PaperChromatographyLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch9-centrifugation-simulator') {
    return <CentrifugationSimulatorSim onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Unit 10: Materials Used in Daily Life (दैनिक जीवनमा प्रयोग हुने वस्तुहरू)
  if (simulation.componentKey === 'class6-sci-ch10-metals-non-metals-lab') {
    return <MetalsNonMetalsLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch10-everyday-chemicals') {
    return <EverydayChemicalsSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch10-material-environmental-impact') {
    return <MaterialEnvironmentalImpactSim onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Unit 11: Earth and Space (पृथ्वी र अन्तरिक्ष)
  if (simulation.componentKey === 'class6-sci-ch11-earth-internal-structure') {
    return <EarthInternalStructureSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch11-seasons-revolution') {
    return <SeasonsRevolutionSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch11-solar-system-explorer') {
    return <SolarSystemExplorerSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch11-soil-formation') {
    return <SoilFormationSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch11-soil-profile-explorer') {
    return <SoilProfileExplorerSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch11-soil-conservation-lab') {
    return <SoilConservationLabSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (simulation.componentKey === 'class6-sci-ch11-soil-pollution-simulator') {
    return <SoilPollutionSimulatorSim onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Class 10 Science - Chapter 1: Force & Gravitation
  if (
    simulation.componentKey === 'class10-sci-ch1-universal-gravitation' ||
    simulation.componentKey === 'universal-gravitation'
  ) {
    return <UniversalGravitationSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (
    simulation.componentKey === 'class10-sci-ch1-tides-gravitation' ||
    simulation.componentKey === 'ocean-tides' ||
    simulation.componentKey === 'tides-gravitation'
  ) {
    return <TidesGravitationSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (
    simulation.componentKey === 'class10-sci-ch1-coin-and-feather' ||
    simulation.componentKey === 'coin-and-feather'
  ) {
    return <CoinAndFeatherSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (
    simulation.componentKey === 'class10-sci-ch2-pascals-law' ||
    simulation.componentKey === 'pascals-law'
  ) {
    return <PascalsLawSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (
    simulation.componentKey === 'class10-sci-ch2-archimedes-principle' ||
    simulation.componentKey === 'archimedes-principle'
  ) {
    return <ArchimedesPrincipleSim onBackToLibrary={onClose} userRole={userRole} />;
  }
  if (
    simulation.componentKey === 'class10-sci-ch5-phenomena-of-light' ||
    simulation.componentKey === 'phenomena-of-light'
  ) {
    return <PhenomenaOfLightSim onBackToLibrary={onClose} userRole={userRole} />;
  }

  // Fallback to iframe player for HTML simulations
  return (
    <div
      style={{
        width: '100%',
        height: isFullscreen ? '100vh' : '88vh',
        background: '#0f172a',
        borderRadius: isFullscreen ? '0' : '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
      }}
    >
      {/* Player Header */}
      <div
        style={{
          background: '#1e293b',
          color: '#ffffff',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #334155',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} /> Return to Library
          </button>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>
              {simulation.title} {simulation.titleNepali && `(${simulation.titleNepali})`}
            </h3>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              Class {simulation.gradeLevels?.join(', ')} • {simulation.subjectCode || 'General'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={toggleFullscreen}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#ffffff',
              border: 'none',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Simulation Iframe */}
      <iframe
        src={simulation.runtimeUrl}
        title={simulation.title}
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          background: '#ffffff',
        }}
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
};

/** The running simulation player */
export const SimulationPlayer: React.FC<SimulationPlayerProps> = (props) => {
  return <SimulationPlayerView {...props} />;
};

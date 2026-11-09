/**
 * SimulationPlayer.tsx
 * Dedicated Simulation Player Component for 3D Interactive & HTML Simulations
 */
import React, { useState } from 'react';
import { ArrowLeft, Maximize2, Minimize2, ExternalLink, RefreshCw } from 'lucide-react';
import { KprietSimulationPlayer } from './KprietSimulationPlayer';
import { launchOnSmartBoard } from './smartBoardLaunch';
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

  // Class 1–5 Mathematics - Interactive Number Line & Counting Frog 3D Edition
  if (
    simulation.componentKey === 'class1-math-number-line-frog' ||
    simulation.code === 'SIM-MATH-G1-NUMBERLINE' ||
    simulation.runtimeUrl?.includes('math-number-line')
  ) {
    return <NumberLineFrog3D onBackToLibrary={onClose} userRole={userRole} embedded={embedded} />;
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

/** The running simulation, with a "Launch on Smart Board" button over it (every simulation, every role). */
export const SimulationPlayer: React.FC<SimulationPlayerProps> = (props) => {
  const { simulation, embedded } = props;
  const ported = String(simulation.componentKey || '').startsWith('kpriet:'); // ported ones carry their own button
  return (
    <>
      <SimulationPlayerView {...props} />
      {!embedded && !ported && (
        <button
          type="button"
          onClick={() => launchOnSmartBoard(simulation.componentKey || simulation.code || simulation.id, simulation.title)}
          aria-label="Launch on Smart Board"
          style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 10030, height: 42, padding: '0 16px', borderRadius: 999, border: '1px solid rgba(255,255,255,.3)', background: '#0f4c4a', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: '0 8px 22px rgba(15,76,74,.4)' }}
        >
          🖥 Launch on Smart Board
        </button>
      )}
    </>
  );
};

/**
 * Master Workspace for Engineering Materials & Metallurgy (U25ME302 / ME3392)
 * B.E. Mechanical Engineering · Semester III · PiyushDhara Eduverse Design System
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type {
  MetallurgySimId,
  CrystalStructureType,
  AlloyCategoryId,
  HeatTreatmentProcessType,
  QuenchMedium,
  MetallographicSpecimenId,
  HardnessTestType,
  MetallurgyLabTrial,
} from '../core/types';
import {
  CRYSTAL_STRUCTURES_DATA,
  ENGINEERING_ALLOYS_DATABASE,
  METALLOGRAPHIC_SPECIMENS_DATA,
  INVARIANT_REACTIONS,
} from '../core/MetallurgyMaterials';
import { MetallurgyCalculator } from '../core/MetallurgyCalculator';
import { createMetallurgyScene, BaseMetallurgySimulation } from '../simulations';

export interface MetallurgyWorkspaceProps {
  simulationId?: MetallurgySimId | string;
  onBack?: () => void;
}

export const MetallurgyWorkspace: React.FC<MetallurgyWorkspaceProps> = ({
  simulationId = 'u25me302-crystal-structures',
  onBack,
}) => {
  // Active Tab
  const [activeTab, setActiveTab] = useState<MetallurgySimId>(() => {
    const norm = (simulationId || '').toLowerCase();
    if (norm.includes('stress') || norm.includes('strain') || norm.includes('tensile')) return 'u25me302-stress-strain';
    if (norm.includes('phase') || norm.includes('diagram') || norm.includes('lever')) return 'u25me302-phase-diagram';
    if (norm.includes('heat') || norm.includes('quench') || norm.includes('anneal')) return 'u25me302-heat-treatment';
    if (norm.includes('micro') || norm.includes('grain')) return 'u25me302-microstructure';
    if (norm.includes('testing') || norm.includes('hardness') || norm.includes('impact')) return 'u25me302-material-testing';
    if (norm.includes('lab') || norm.includes('report')) return 'u25me302-virtual-lab';
    return 'u25me302-crystal-structures';
  });

  // 3D Canvas Mount Ref & Simulation Controller
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const simInstanceRef = useRef<BaseMetallurgySimulation | null>(null);

  // Module 1 Parameters
  const [crystalStructure, setCrystalStructure] = useState<CrystalStructureType>('bcc');
  const [crystalViewMode, setCrystalViewMode] = useState<'ball-and-stick' | 'space-filling'>('ball-and-stick');
  const [showSlipPlane, setShowSlipPlane] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // Module 2 Parameters
  const [selectedAlloy, setSelectedAlloy] = useState<AlloyCategoryId>('mild-steel-1020');
  const [tensileLoadKN, setTensileLoadKN] = useState<number>(15);

  // Module 3 Parameters
  const [carbonPercent, setCarbonPercent] = useState<number>(0.45);
  const [phaseTempC, setPhaseTempC] = useState<number>(850);

  // Module 4 Parameters
  const [htProcess, setHtProcess] = useState<HeatTreatmentProcessType>('hardening-quench');
  const [quenchMedium, setQuenchMedium] = useState<QuenchMedium>('water');
  const [furnaceTempC, setFurnaceTempC] = useState<number>(860);

  // Module 5 Parameters
  const [microSpecimen, setMicroSpecimen] = useState<MetallographicSpecimenId>('low-carbon-steel-annealed');
  const [magnification, setMagnification] = useState<number>(250);
  const [focusPercent, setFocusPercent] = useState<number>(100);

  // Module 6 Parameters
  const [testMode, setTestMode] = useState<'hardness' | 'tensile' | 'impact'>('hardness');
  const [hardnessType, setHardnessType] = useState<HardnessTestType>('brinell');
  const [brinellLoadKgf, setBrinellLoadKgf] = useState<number>(3000);
  const [indentationSizeMm, setIndentationSizeMm] = useState<number>(4.2);

  // Modals & Logs
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [showTrialsModal, setShowTrialsModal] = useState<boolean>(false);
  const [showPrintReport, setShowPrintReport] = useState<boolean>(false);
  const [trials, setTrials] = useState<MetallurgyLabTrial[]>([
    {
      trialNumber: 1,
      timestamp: '10:15 AM',
      experimentName: 'Brinell Hardness Evaluation',
      sampleName: 'Mild Steel (AISI 1020)',
      testedParameter: 'F = 3000 kgf, d = 4.2 mm, D = 10 mm',
      calculatedResult: '206 HBW',
      status: 'VERIFIED',
    },
    {
      trialNumber: 2,
      timestamp: '10:40 AM',
      experimentName: 'Lever Rule Phase Fraction',
      sampleName: 'AISI 1045 (0.45% C Steel)',
      testedParameter: 'Room Temp Equilibrium (T < 727°C)',
      calculatedResult: '42.0% Proeutectoid Ferrite + 58.0% Pearlite',
      status: 'VERIFIED',
    },
  ]);

  // Quiz State
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Initialize and switch 3D scene when activeTab changes
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    if (simInstanceRef.current) {
      simInstanceRef.current.dispose();
      simInstanceRef.current = null;
    }

    const instance = createMetallurgyScene(activeTab, canvasContainerRef.current);
    simInstanceRef.current = instance;

    return () => {
      if (simInstanceRef.current) {
        simInstanceRef.current.dispose();
        simInstanceRef.current = null;
      }
    };
  }, [activeTab]);

  // Push parameter changes to current 3D scene
  useEffect(() => {
    if (!simInstanceRef.current) return;

    if (activeTab === 'u25me302-crystal-structures') {
      simInstanceRef.current.updateParameters({
        structure: crystalStructure,
        viewMode: crystalViewMode,
        showSlipPlane,
        autoRotate,
      });
    } else if (activeTab === 'u25me302-stress-strain') {
      simInstanceRef.current.updateParameters({
        alloyId: selectedAlloy,
        appliedLoadKN: tensileLoadKN,
      });
    } else if (activeTab === 'u25me302-phase-diagram') {
      simInstanceRef.current.updateParameters({
        carbonPercent,
        temperatureC: phaseTempC,
      });
    } else if (activeTab === 'u25me302-heat-treatment') {
      simInstanceRef.current.updateParameters({
        process: htProcess,
        quenchMedium,
        furnaceTempC,
      });
    } else if (activeTab === 'u25me302-microstructure') {
      simInstanceRef.current.updateParameters({
        specimenId: microSpecimen,
        magnification,
        focusPercent,
      });
    } else if (activeTab === 'u25me302-material-testing' || activeTab === 'u25me302-virtual-lab') {
      simInstanceRef.current.updateParameters({
        activeTest: testMode,
        hardnessType,
      });
    }
  }, [
    activeTab,
    crystalStructure,
    crystalViewMode,
    showSlipPlane,
    autoRotate,
    selectedAlloy,
    tensileLoadKN,
    carbonPercent,
    phaseTempC,
    htProcess,
    quenchMedium,
    furnaceTempC,
    microSpecimen,
    magnification,
    focusPercent,
    testMode,
    hardnessType,
  ]);

  // Derived Calculations
  const crystalProps = useMemo(() => {
    return CRYSTAL_STRUCTURES_DATA[crystalStructure];
  }, [crystalStructure]);

  const crystalGeometry = useMemo(() => {
    return MetallurgyCalculator.calculateLatticeParameter(crystalStructure, 0.125); // 0.125 nm typical iron radius
  }, [crystalStructure]);

  const activeAlloyData = useMemo(() => {
    return ENGINEERING_ALLOYS_DATABASE[selectedAlloy];
  }, [selectedAlloy]);

  const tensileCalculations = useMemo(() => {
    return MetallurgyCalculator.calculateTensileState({
      appliedLoadKN: tensileLoadKN,
      originalDiameterMm: 12.5,
      gaugeLengthMm: 50.0,
      youngsModulusGPa: activeAlloyData.youngsModulusGPa,
      yieldStrengthMPa: activeAlloyData.yieldStrengthMPa,
      ultimateTensileStrengthMPa: activeAlloyData.ultimateTensileStrengthMPa,
      fractureStrain: (activeAlloyData.percentElongation / 100) * 1.4,
    });
  }, [tensileLoadKN, activeAlloyData]);

  const phaseDiagramInfo = useMemo(() => {
    return MetallurgyCalculator.evaluateIronCarbonPoint(carbonPercent, phaseTempC);
  }, [carbonPercent, phaseTempC]);

  const heatTreatmentResult = useMemo(() => {
    return MetallurgyCalculator.calculateHeatTreatment({
      process: htProcess,
      carbonPercent: activeAlloyData.carbonContentPercent ?? 0.45,
      coolingMedium: quenchMedium,
      furnaceTempC,
    });
  }, [htProcess, activeAlloyData, quenchMedium, furnaceTempC]);

  const hardnessResult = useMemo(() => {
    return MetallurgyCalculator.calculateHardness({
      testType: hardnessType,
      appliedLoadKgf: brinellLoadKgf,
      indentationDimensionMm: indentationSizeMm,
      ballDiameterMm: 10,
    });
  }, [hardnessType, brinellLoadKgf, indentationSizeMm]);

  // Logging Helper
  const logCurrentTrial = () => {
    let exp = 'Material Analysis';
    let sample = activeAlloyData.name;
    let param = `Param: ${tensileLoadKN} kN`;
    let result = `${tensileCalculations.engineeringStressMPa} MPa`;

    if (activeTab === 'u25me302-phase-diagram') {
      exp = 'Iron-Carbon Phase Equilibrium';
      sample = `${carbonPercent}% C at ${phaseTempC}°C`;
      param = phaseDiagramInfo.primaryPhase;
      result = phaseDiagramInfo.microconstituents;
    } else if (activeTab === 'u25me302-heat-treatment') {
      exp = 'Heat Treatment Cycle';
      sample = `${activeAlloyData.name} - ${htProcess}`;
      param = `Quenched in ${quenchMedium} (${heatTreatmentResult.coolingRateCPerSec}°C/s)`;
      result = `Hardness: ${heatTreatmentResult.finalHardnessHRC} HRC (${heatTreatmentResult.resultingMicrostructure})`;
    } else if (activeTab === 'u25me302-material-testing') {
      exp = `${hardnessType.toUpperCase()} Hardness Test`;
      sample = activeAlloyData.name;
      param = `F = ${brinellLoadKgf} kgf, d = ${indentationSizeMm} mm`;
      result = hardnessResult.hardnessString;
    }

    const newTrial: MetallurgyLabTrial = {
      trialNumber: trials.length + 1,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      experimentName: exp,
      sampleName: sample,
      testedParameter: param,
      calculatedResult: result,
      status: 'VERIFIED',
    };

    setTrials([newTrial, ...trials]);
    setShowTrialsModal(true);
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* ── TOP APP HEADER ── */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 shadow-md z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Return to Subjects"
            >
              ←
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                U25ME302 · TwL
              </span>
              <span className="text-xs font-semibold text-slate-300">
                Mechanical Engineering · Sem III
              </span>
            </div>
            <h1 className="text-sm md:text-base font-bold text-white tracking-tight">
              Engineering Materials and Metallurgy Laboratory
            </h1>
          </div>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTrialsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            📋 <span>Trials ({trials.length})</span>
          </button>
          <button
            onClick={() => setShowQuizModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 transition cursor-pointer"
          >
            ❓ <span>Concept Quiz</span>
          </button>
          <button
            onClick={() => setShowPrintReport(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            🖨️ <span>Lab Record</span>
          </button>
        </div>
      </header>

      {/* ── SYLLABUS TOPIC TABS ── */}
      <nav className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-slate-900/95 border-b border-slate-800 overflow-x-auto z-10 scrollbar-none">
        {[
          { id: 'u25me302-crystal-structures', label: '1. Crystal Structures (BCC/FCC/HCP)', icon: '🧊' },
          { id: 'u25me302-stress-strain', label: '2. Stress-Strain & Mechanics', icon: '📈' },
          { id: 'u25me302-phase-diagram', label: '3. Fe-Fe3C Phase Diagram & Lever Rule', icon: '⚗️' },
          { id: 'u25me302-heat-treatment', label: '4. Heat Treatment & Furnace', icon: '🔥' },
          { id: 'u25me302-microstructure', label: '5. Microstructure Microscope', icon: '🔬' },
          { id: 'u25me302-material-testing', label: '6. Material Testing Lab', icon: '🔨' },
          { id: 'u25me302-virtual-lab', label: '7. Virtual Metallurgy Practical', icon: '🧪' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as MetallurgySimId)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* ── 3D VIEWPORT CONTAINER ── */}
        <div className="flex-1 flex flex-col relative bg-slate-950 overflow-hidden">
          {/* Top HUD Badges */}
          <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between pointer-events-none z-10 gap-2">
            <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
              {activeTab === 'u25me302-crystal-structures' && (
                <>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md shadow-lg text-xs">
                    <span className="text-slate-400 font-medium">Lattice: </span>
                    <span className="font-mono font-bold text-sky-400">{crystalProps.name}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md shadow-lg text-xs">
                    <span className="text-slate-400 font-medium">Atoms/Cell: </span>
                    <span className="font-mono font-bold text-emerald-400">{crystalProps.atomsPerUnitCell}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md shadow-lg text-xs">
                    <span className="text-slate-400 font-medium">APF: </span>
                    <span className="font-mono font-bold text-amber-400">{crystalProps.atomicPackingFactor}</span>
                  </div>
                </>
              )}

              {activeTab === 'u25me302-stress-strain' && (
                <>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md shadow-lg text-xs">
                    <span className="text-slate-400 font-medium">Alloy: </span>
                    <span className="font-bold text-sky-400">{activeAlloyData.name}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md shadow-lg text-xs">
                    <span className="text-slate-400 font-medium">Stress (σ): </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {tensileCalculations.engineeringStressMPa} MPa
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md shadow-lg text-xs">
                    <span className="text-slate-400 font-medium">State: </span>
                    <span
                      className={`font-bold ${
                        tensileCalculations.isFractured
                          ? 'text-red-400 animate-pulse'
                          : tensileCalculations.isNecking
                          ? 'text-amber-400'
                          : tensileCalculations.isYielded
                          ? 'text-yellow-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {tensileCalculations.isFractured
                        ? '💥 FRACTURED'
                        : tensileCalculations.isNecking
                        ? '⚠️ NECKING'
                        : tensileCalculations.isYielded
                        ? 'PLASTIC FLOW'
                        : 'ELASTIC'}
                    </span>
                  </div>
                </>
              )}

              {activeTab === 'u25me302-phase-diagram' && (
                <>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md shadow-lg text-xs">
                    <span className="text-slate-400 font-medium">Phase: </span>
                    <span className="font-mono font-bold text-emerald-400">{phaseDiagramInfo.primaryPhase}</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md shadow-lg text-xs">
                    <span className="text-slate-400 font-medium">Coord: </span>
                    <span className="font-mono font-bold text-amber-400">{carbonPercent}% C @ {phaseTempC}°C</span>
                  </div>
                </>
              )}
            </div>

            {/* Viewport Control Buttons */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={() => simInstanceRef.current?.resetCamera()}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 backdrop-blur-md transition cursor-pointer"
                title="Reset Camera View"
              >
                ⟲ Reset View
              </button>
            </div>
          </div>

          {/* 3D WebGL Canvas */}
          <div ref={canvasContainerRef} className="w-full h-full relative" />

          {/* Bottom Floating Status Bar */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg text-xs z-10 pointer-events-none">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {activeTab === 'u25me302-crystal-structures' && `Bravais Lattice Unit Cell · ${crystalProps.closePackedPlanes} close-packed planes`}
                {activeTab === 'u25me302-stress-strain' && `Tensile Specimen d₀ = 12.5 mm, L₀ = 50.0 mm · Elongation: ${tensileCalculations.elongationMm} mm`}
                {activeTab === 'u25me302-phase-diagram' && phaseDiagramInfo.microconstituents}
                {activeTab === 'u25me302-heat-treatment' && `${htProcess.toUpperCase()} · Cooling Rate: ${heatTreatmentResult.coolingRateCPerSec}°C/s in ${quenchMedium}`}
                {activeTab === 'u25me302-microstructure' && `${METALLOGRAPHIC_SPECIMENS_DATA[microSpecimen].title} · ${magnification}× Objective Lens`}
                {(activeTab === 'u25me302-material-testing' || activeTab === 'u25me302-virtual-lab') && `${hardnessType.toUpperCase()} Hardness Testing Rig · F = ${brinellLoadKgf} kgf`}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={logCurrentTrial}
                className="pointer-events-auto px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700 transition cursor-pointer"
              >
                + Log Trial
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT PARAMETERS & LEARNING SIDEBAR ── */}
        <aside className="w-full lg:w-96 xl:w-[26rem] bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col flex-shrink-0 overflow-y-auto z-10">
          <div className="p-4 space-y-5">
            {/* ── MODULE 1: CRYSTAL STRUCTURES CONTROLS ── */}
            {activeTab === 'u25me302-crystal-structures' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                    Crystal Structure Selection
                  </h3>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['bcc', 'fcc', 'hcp'] as const).map((struct) => (
                      <button
                        key={struct}
                        onClick={() => setCrystalStructure(struct)}
                        className={`py-2 px-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                          crystalStructure === struct
                            ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                        }`}
                      >
                        {struct.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Atomic Visualization Mode</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCrystalViewMode('ball-and-stick')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        crystalViewMode === 'ball-and-stick'
                          ? 'bg-sky-600/30 border-sky-500 text-sky-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      Ball &amp; Stick
                    </button>
                    <button
                      onClick={() => setCrystalViewMode('space-filling')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        crystalViewMode === 'space-filling'
                          ? 'bg-sky-600/30 border-sky-500 text-sky-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      Space Filling (APF)
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-medium text-slate-300">Highlight Slip Plane</span>
                  <input
                    type="checkbox"
                    checked={showSlipPlane}
                    onChange={(e) => setShowSlipPlane(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-800 border-slate-700 cursor-pointer"
                  />
                </div>

                {/* Mathematical Card */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
                  <div className="font-bold text-sky-400 flex items-center justify-between">
                    <span>Lattice Mathematics</span>
                    <span className="text-[10px] text-slate-400">r = 0.125 nm</span>
                  </div>
                  <div className="font-mono bg-slate-900 p-2.5 rounded-lg border border-slate-750 space-y-1 text-slate-300">
                    <div>Atoms/Cell: {crystalProps.atomsPerUnitCell}</div>
                    <div>Lattice Const: a = {crystalGeometry.aNm} nm</div>
                    {crystalGeometry.cNm && <div>Height: c = {crystalGeometry.cNm} nm (c/a = 1.633)</div>}
                    <div>Cell Vol: V = {crystalGeometry.cellVolumeNm3} nm³</div>
                    <div className="text-emerald-400 font-bold">APF: {crystalGeometry.atomicPackingFactor} ({crystalProps.atomicPackingFactor * 100}%)</div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <strong>Typical Metals:</strong> {crystalProps.exampleMetals.join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* ── MODULE 2: STRESS-STRAIN CONTROLS ── */}
            {activeTab === 'u25me302-stress-strain' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 block">
                    Engineering Material Alloy
                  </label>
                  <select
                    value={selectedAlloy}
                    onChange={(e) => setSelectedAlloy(e.target.value as AlloyCategoryId)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {Object.values(ENGINEERING_ALLOYS_DATABASE).map((alloy) => (
                      <option key={alloy.id} value={alloy.id}>
                        {alloy.name} ({alloy.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">Applied Tensile Load (F)</span>
                    <span className="font-mono font-bold text-emerald-400">{tensileLoadKN} kN</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="65"
                    step="1"
                    value={tensileLoadKN}
                    onChange={(e) => setTensileLoadKN(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0 kN</span>
                    <span>Yield ~ {Math.round((activeAlloyData.yieldStrengthMPa * 122.7) / 1000)} kN</span>
                    <span>UTS ~ {Math.round((activeAlloyData.ultimateTensileStrengthMPa * 122.7) / 1000)} kN</span>
                  </div>
                </div>

                {/* Mechanics Telemetry */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
                  <div className="font-bold text-emerald-400">Tensile Mechanics Telemetry</div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="bg-slate-900 p-2 rounded border border-slate-750">
                      <div className="text-slate-400 text-[10px]">ENG STRESS (σ)</div>
                      <div className="font-bold text-sky-400">{tensileCalculations.engineeringStressMPa} MPa</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-750">
                      <div className="text-slate-400 text-[10px]">ENG STRAIN (ε)</div>
                      <div className="font-bold text-amber-400">{(tensileCalculations.engineeringStrain * 100).toFixed(2)}%</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-750">
                      <div className="text-slate-400 text-[10px]">TRUE STRESS</div>
                      <div className="font-bold text-emerald-400">{tensileCalculations.trueStressMPa} MPa</div>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-750">
                      <div className="text-slate-400 text-[10px]">ELONGATION (ΔL)</div>
                      <div className="font-bold text-white">{tensileCalculations.elongationMm} mm</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <strong>Hooke’s Modulus:</strong> E = {activeAlloyData.youngsModulusGPa} GPa | <strong>Resilience:</strong> {MetallurgyCalculator.calculateModulusOfResilience(activeAlloyData.yieldStrengthMPa, activeAlloyData.youngsModulusGPa).toFixed(2)} MJ/m³
                  </div>
                </div>
              </div>
            )}

            {/* ── MODULE 3: PHASE DIAGRAM CONTROLS ── */}
            {activeTab === 'u25me302-phase-diagram' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">Carbon Composition (C wt%)</span>
                    <span className="font-mono font-bold text-emerald-400">{carbonPercent.toFixed(2)}% C</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="6.67"
                    step="0.05"
                    value={carbonPercent}
                    onChange={(e) => setCarbonPercent(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0% (Ferrite)</span>
                    <span>0.76% (Eutectoid)</span>
                    <span>4.3% (Eutectic)</span>
                    <span>6.67% (Fe3C)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">Temperature (T)</span>
                    <span className="font-mono font-bold text-amber-400">{phaseTempC}°C</span>
                  </div>
                  <input
                    type="range"
                    min="400"
                    max="1550"
                    step="25"
                    value={phaseTempC}
                    onChange={(e) => setPhaseTempC(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>400°C</span>
                    <span>727°C (A1)</span>
                    <span>1147°C (Eutectic)</span>
                    <span>1538°C (Melt)</span>
                  </div>
                </div>

                {/* Lever Rule Card */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
                  <div className="font-bold text-emerald-400 flex items-center justify-between">
                    <span>Lever Rule Phase Fractions</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {phaseDiagramInfo.isCastIron ? 'Cast Iron' : phaseDiagramInfo.isHypoeutectoid ? 'Hypoeutectoid Steel' : 'Hypereutectoid Steel'}
                    </span>
                  </div>
                  {phaseDiagramInfo.leverRuleApplicable ? (
                    <div className="space-y-2">
                      <div className="flex justify-between font-mono text-[11px] text-slate-300">
                        <span>{phaseDiagramInfo.phase1Name}:</span>
                        <span className="font-bold text-sky-400">{phaseDiagramInfo.phase1FractionPercent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden flex">
                        <div style={{ width: `${phaseDiagramInfo.phase1FractionPercent}%` }} className="bg-sky-500 h-full" />
                        <div style={{ width: `${phaseDiagramInfo.phase2FractionPercent}%` }} className="bg-amber-500 h-full" />
                      </div>
                      <div className="flex justify-between font-mono text-[11px] text-slate-300">
                        <span>{phaseDiagramInfo.phase2Name}:</span>
                        <span className="font-bold text-amber-400">{phaseDiagramInfo.phase2FractionPercent}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400">Single homogeneous phase region. Lever rule tie-line not required.</div>
                  )}

                  <div className="pt-2 border-t border-slate-700 text-[11px] text-slate-400">
                    <strong>Microconstituents:</strong> {phaseDiagramInfo.microconstituents}
                  </div>
                </div>
              </div>
            )}

            {/* ── MODULE 4: HEAT TREATMENT CONTROLS ── */}
            {activeTab === 'u25me302-heat-treatment' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 block">
                    Heat Treatment Process
                  </label>
                  <select
                    value={htProcess}
                    onChange={(e) => setHtProcess(e.target.value as HeatTreatmentProcessType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="full-annealing">Full Annealing (Furnace Cool)</option>
                    <option value="normalizing">Normalizing (Still Air Cool)</option>
                    <option value="hardening-quench">Hardening / Quench (Martensite)</option>
                    <option value="tempering">Tempering (Restore Toughness)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 block">
                    Quench / Cooling Medium
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['water', 'oil', 'air', 'brine', 'furnace'] as const).map((medium) => (
                      <button
                        key={medium}
                        onClick={() => setQuenchMedium(medium)}
                        className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                          quenchMedium === medium
                            ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                        }`}
                      >
                        {medium.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => simInstanceRef.current?.updateParameters({ startCycle: true })}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow cursor-pointer flex items-center justify-center gap-2"
                >
                  🔥 <span>Run Thermal Cycle Animation</span>
                </button>

                {/* Heat Treatment Output */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
                  <div className="font-bold text-emerald-400">Transformation Summary</div>
                  <div className="space-y-1 text-slate-300 text-[11px]">
                    <div><strong>Austenitizing Temp:</strong> {heatTreatmentResult.austenitizingTempC}°C</div>
                    <div><strong>Cooling Rate:</strong> ~{heatTreatmentResult.coolingRateCPerSec}°C/s</div>
                    <div><strong>Resulting Hardness:</strong> <span className="font-bold text-amber-400">{heatTreatmentResult.finalHardnessHRC} HRC</span></div>
                    <div><strong>Toughness:</strong> {heatTreatmentResult.toughnessQualitative}</div>
                    <div className="pt-1 text-slate-400 leading-relaxed">
                      <strong>Microstructure:</strong> {heatTreatmentResult.resultingMicrostructure}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── MODULE 5: MICROSTRUCTURE VIEWER CONTROLS ── */}
            {activeTab === 'u25me302-microstructure' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 block">
                    Metallographic Specimen
                  </label>
                  <select
                    value={microSpecimen}
                    onChange={(e) => setMicroSpecimen(e.target.value as MetallographicSpecimenId)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {Object.values(METALLOGRAPHIC_SPECIMENS_DATA).map((spec) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">Objective Magnification</span>
                    <span className="font-mono font-bold text-sky-400">{magnification}×</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[100, 250, 500, 1000].map((mag) => (
                      <button
                        key={mag}
                        onClick={() => setMagnification(mag)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                          magnification === mag
                            ? 'bg-sky-600/30 border-sky-500 text-sky-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {mag}×
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">Fine Optical Focus</span>
                    <span className="font-mono text-emerald-400">{focusPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={focusPercent}
                    onChange={(e) => setFocusPercent(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Metallographic Card */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
                  <div className="font-bold text-sky-400">
                    {METALLOGRAPHIC_SPECIMENS_DATA[microSpecimen].title}
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-300 leading-relaxed">
                    <div><strong>Etchant:</strong> {METALLOGRAPHIC_SPECIMENS_DATA[microSpecimen].etchantUsed}</div>
                    <div><strong>ASTM Grain Size:</strong> G = {METALLOGRAPHIC_SPECIMENS_DATA[microSpecimen].astmGrainSizeEstimate}</div>
                    <div><strong>Phases:</strong> {METALLOGRAPHIC_SPECIMENS_DATA[microSpecimen].visiblePhases.join('; ')}</div>
                    <div className="pt-1 text-slate-400">{METALLOGRAPHIC_SPECIMENS_DATA[microSpecimen].characteristicAppearance}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── MODULE 6 & 7: MATERIAL TESTING & LAB CONTROLS ── */}
            {(activeTab === 'u25me302-material-testing' || activeTab === 'u25me302-virtual-lab') && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 block">
                    Testing Method
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['hardness', 'tensile', 'impact'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setTestMode(m)}
                        className={`py-2 px-2 text-xs font-bold rounded-lg border transition cursor-pointer capitalize ${
                          testMode === m
                            ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {testMode === 'hardness' && (
                  <>
                    <div>
                      <label className="text-xs font-medium text-slate-300 mb-1 block">
                        Hardness Scale
                      </label>
                      <select
                        value={hardnessType}
                        onChange={(e) => setHardnessType(e.target.value as HardnessTestType)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white cursor-pointer"
                      >
                        <option value="brinell">Brinell Hardness (10 mm Ball, HBW)</option>
                        <option value="rockwell-c">Rockwell C (Diamond Cone 150 kgf, HRC)</option>
                        <option value="rockwell-b">Rockwell B (1/16" Ball 100 kgf, HRB)</option>
                        <option value="vickers">Vickers (Diamond Pyramid 136°, HV)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">Indentation Dimension (d / e)</span>
                        <span className="font-mono text-emerald-400">{indentationSizeMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min="2.0"
                        max="6.0"
                        step="0.1"
                        value={indentationSizeMm}
                        onChange={(e) => setIndentationSizeMm(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </>
                )}

                <button
                  onClick={() => simInstanceRef.current?.updateParameters({ triggerTest: true })}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow cursor-pointer flex items-center justify-center gap-2"
                >
                  ⚡ <span>Execute Simulated Test</span>
                </button>

                {/* Hardness / Test Output */}
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
                  <div className="font-bold text-amber-400">Measurement Result</div>
                  <div className="font-mono text-lg font-bold text-white">
                    {hardnessResult.hardnessString}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    <strong>Indenter:</strong> {hardnessResult.indenterType} | <strong>Load:</strong> {brinellLoadKgf} kgf
                  </div>
                  <p className="text-[10px] text-slate-500">{hardnessResult.validityNote}</p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── MODAL: CONCEPT MASTERY QUIZ ── */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <span>❓</span> <span>Metallurgy Assessment Quiz</span>
              </h3>
              <button
                onClick={() => {
                  setShowQuizModal(false);
                  setQuizSubmitted(false);
                  setQuizAnswer(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="font-semibold text-slate-200 leading-relaxed">
                In the Iron-Carbon (Fe-Fe3C) equilibrium system, what invariant reaction occurs at 727°C with 0.76% C, transforming homogeneous austenite into pearlite?
              </p>
              <div className="space-y-2">
                {[
                  'Eutectic Reaction (Liquid → Austenite + Cementite)',
                  'Eutectoid Reaction (Austenite → Ferrite + Cementite)',
                  'Peritectic Reaction (Liquid + Delta Ferrite → Austenite)',
                  'Martensitic Diffusionless Shear Transformation',
                ].map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuizAnswer(idx)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition cursor-pointer ${
                      quizAnswer === idx
                        ? 'bg-emerald-600/30 border-emerald-500 text-white font-bold'
                        : 'bg-slate-800/80 border-slate-750 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}. {opt}
                  </button>
                ))}
              </div>

              {quizSubmitted && (
                <div
                  className={`p-3 rounded-lg text-xs font-semibold ${
                    quizAnswer === 1
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {quizAnswer === 1
                    ? '✓ Correct! The Eutectoid solid-state reaction occurs at 727°C and 0.76% C producing 100% lamellar Pearlite (α-ferrite + Fe3C).'
                    : '✗ Incorrect. The correct answer is B: Eutectoid Reaction (γ ⇌ α + Fe3C).'}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={quizAnswer === null}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer"
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: OBSERVATION TRIALS LOG ── */}
      {showTrialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                <span>📋</span> <span>Laboratory Observation Table</span>
              </h3>
              <button onClick={() => setShowTrialsModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-750 text-slate-400 bg-slate-850">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Experiment</th>
                    <th className="py-2.5 px-3">Specimen</th>
                    <th className="py-2.5 px-3">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {trials.map((tr) => (
                    <tr key={tr.trialNumber} className="hover:bg-slate-800/50">
                      <td className="py-2 px-3 font-mono text-emerald-400">{tr.trialNumber}</td>
                      <td className="py-2 px-3 text-slate-400">{tr.timestamp}</td>
                      <td className="py-2 px-3 font-medium text-white">{tr.experimentName}</td>
                      <td className="py-2 px-3 text-slate-300">{tr.sampleName}</td>
                      <td className="py-2 px-3 font-mono font-bold text-amber-400">{tr.calculatedResult}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowTrialsModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: FORMAL PRINTABLE REPORT ── */}
      {showPrintReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl shadow-2xl p-8 space-y-6 my-auto print:m-0 print:p-0">
            {/* Institution Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4">
              <div className="text-xs uppercase font-bold tracking-widest text-slate-600">
                KPR Institute of Engineering and Technology
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-950 uppercase mt-1">
                Department of Mechanical Engineering
              </h2>
              <div className="text-sm font-bold text-slate-700 mt-1">
                U25ME302 — Engineering Materials and Metallurgy Laboratory
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
              <div>Course: B.E. Mechanical Engineering (Sem III)</div>
              <div>Date: {new Date().toLocaleDateString('en-IN')}</div>
              <div>Regulation: R2025 Revised CBCS</div>
              <div>Academic Session: 2026–2027</div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-950 uppercase border-b border-slate-300 pb-1">
                I. Laboratory Aim &amp; Objective
              </h4>
              <p className="text-slate-700 leading-relaxed">
                To examine crystallographic unit cells (BCC, FCC, HCP), evaluate mechanical stress-strain behavior, apply the Lever Rule to the Fe-Fe3C phase diagram, execute controlled thermal heat treatments, observe optical microstructures, and measure hardness/impact values.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-950 uppercase border-b border-slate-300 pb-1">
                II. Governing Equations
              </h4>
              <div className="font-mono text-[11px] bg-slate-100 p-3 rounded space-y-1 text-slate-800">
                <div>• Brinell Hardness: HBW = 2F / [π·D·(D - √(D² - d²))]</div>
                <div>• Lever Rule: f_α = (C_β - C₀) / (C_β - C_α)</div>
                <div>• Hooke's Elastic Law: σ = E·ε (E_steel ≈ 205 GPa)</div>
                <div>• Charpy Energy: E = m·g·R·(cos β - cos α)</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-950 uppercase border-b border-slate-300 pb-1">
                III. Observation Record
              </h4>
              <table className="w-full text-left text-[11px] border border-slate-300">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300">#</th>
                    <th className="p-2 border-r border-slate-300">Experiment</th>
                    <th className="p-2 border-r border-slate-300">Specimen / Condition</th>
                    <th className="p-2">Observed Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {trials.map((tr) => (
                    <tr key={tr.trialNumber}>
                      <td className="p-2 border-r border-slate-300 font-mono">{tr.trialNumber}</td>
                      <td className="p-2 border-r border-slate-300">{tr.experimentName}</td>
                      <td className="p-2 border-r border-slate-300">{tr.sampleName}</td>
                      <td className="p-2 font-mono font-bold">{tr.calculatedResult}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Blocks */}
            <div className="grid grid-cols-2 pt-8 text-xs font-bold text-slate-800">
              <div>Student Signature: __________________</div>
              <div className="text-right">Faculty In-Charge: __________________</div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-300 print:hidden">
              <button
                onClick={() => setShowPrintReport(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow cursor-pointer"
              >
                Print Official Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

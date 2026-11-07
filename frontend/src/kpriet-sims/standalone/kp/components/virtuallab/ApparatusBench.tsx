import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Droplet,
  Wind,
  Sparkles,
  AlertCircle,
  Eye,
  Flame,
  Scale,
  Filter,
  CheckCircle2,
  Thermometer,
  Layers,
  Box,
  Sliders,
} from 'lucide-react';
import type {
  VirtualLabSessionData,
  VirtualLabExperimentData,
} from '../../services/virtual-lab.service';
import { useTheme } from '../../context/ThemeContext';
import { VirtualLab3DCanvas } from './VirtualLab3DCanvas';
import { PhysicsApparatusBench } from './physics/PhysicsApparatusBench';

interface ApparatusBenchProps {
  session: VirtualLabSessionData;
  experiment?: VirtualLabExperimentData | null;
  onAction: (action: {
    actionType: string;
    sourceVesselId?: string;
    targetVesselId?: string;
    volumeMl?: number;
    reagentId?: string;
    massG?: number;
  }) => Promise<void>;
  onRecordTrial?: (trial: {
    trialNumber: number;
    initialReadingMl: number;
    finalReadingMl: number;
    volumeUsedMl: number;
    notes?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const ApparatusBench: React.FC<ApparatusBenchProps> = ({
  session,
  experiment,
  onAction,
  onRecordTrial,
  isLoading = false,
}) => {
  const { isDark } = useTheme();

  // Determine experiment archetype
  const expId = experiment?.experimentId || (session as any)?.experimentId || session?.experiment?.experimentId || '';
  const isPhysics =
    expId.startsWith('EXP-P') ||
    expId === 'vl-g10-ohms-law' ||
    experiment?.subject?.toLowerCase() === 'physics' ||
    experiment?.title?.toLowerCase().includes("ohm's law") ||
    experiment?.title?.toLowerCase().includes('resistance');

  if (isPhysics) {
    return (
      <PhysicsApparatusBench
        session={session}
        experiment={experiment}
        onRecordTrial={onRecordTrial}
        isLoading={isLoading}
      />
    );
  }

  const isSeparation =
    expId === 'EXP-C09-01' ||
    experiment?.title?.toLowerCase().includes('separation') ||
    experiment?.title?.toLowerCase().includes('ammonium chloride');

  // View Mode: '3d' is primary default, '2d' is diagrammatic alternate
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  // ─────────────────────────────────────────────────────────────────────────────
  // SEPARATION BENCH STATE (NCERT CLASS 9 EXP-C09-01)
  // ─────────────────────────────────────────────────────────────────────────────
  const currentStep = session?.currentStepIndex ?? 0;
  const [separationStage, setSeparationStage] = useState<
    'weigh' | 'sublime' | 'filter' | 'evaporate'
  >('weigh');

  // Update active stage based on step progress if user hasn't overridden
  useEffect(() => {
    if (isSeparation) {
      if (currentStep === 0) setSeparationStage('weigh');
      else if (currentStep === 1) setSeparationStage('sublime');
      else if (currentStep === 2) setSeparationStage('filter');
      else if (currentStep >= 3) setSeparationStage('evaporate');
    }
  }, [currentStep, isSeparation]);

  const [isTared, setIsTared] = useState(false);
  const [isWeighed, setIsWeighed] = useState(currentStep >= 1);
  const [isBurnerIgnited, setIsBurnerIgnited] = useState(false);
  const [isSublimationDone, setIsSublimationDone] = useState(currentStep >= 2);
  const [isWaterAdded, setIsWaterAdded] = useState(false);
  const [isFiltrationDone, setIsFiltrationDone] = useState(currentStep >= 3);
  const [isEvaporating, setIsEvaporating] = useState(false);
  const [isEvaporationDone, setIsEvaporationDone] = useState(currentStep >= 4);

  // Bench action handlers for Separation
  const handleTareBalance = async () => {
    setIsTared(true);
    await onAction({ actionType: 'TARE_BALANCE' });
  };

  const handleWeighSample = async () => {
    setIsWeighed(true);
    await onAction({
      actionType: 'TRANSFER_REAGENT',
      reagentId: 'reag_mixture',
      massG: 10.0,
    });
  };

  const handleSublime = async () => {
    setIsBurnerIgnited(true);
    setTimeout(() => {
      setIsSublimationDone(true);
      setIsBurnerIgnited(false);
    }, 2800);
    await onAction({ actionType: 'HEAT_VESSEL' });
  };

  const handleFilter = async () => {
    setIsWaterAdded(true);
    setTimeout(() => {
      setIsFiltrationDone(true);
    }, 2600);
    await onAction({ actionType: 'FILTER_MIXTURE' });
  };

  const handleEvaporate = async () => {
    setIsEvaporating(true);
    setTimeout(() => {
      setIsEvaporating(false);
      setIsEvaporationDone(true);
    }, 2800);
    await onAction({ actionType: 'RECORD_OBSERVATION' });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // TITRATION BENCH STATE (NCERT CLASS 11 EXP-C11-02 / DEFAULT)
  // ─────────────────────────────────────────────────────────────────────────────
  const [isContinuousFlow, setIsContinuousFlow] = useState(false);
  const [isSwirling, setIsSwirling] = useState(false);
  const [dropFalling, setDropFalling] = useState(false);
  const [showMeniscusZoom, setShowMeniscusZoom] = useState(true);
  const continuousTimerRef = useRef<number | null>(null);

  const bench = session?.benchState ?? {
    vessels: [],
    buretteReadingMl: 0,
    isEndpointReached: false,
    isOvershot: false,
    stirrerActive: false,
    activeColorHex: '#ffffff',
    analyticalBalanceTareG: 0,
    analyticalBalanceCurrentG: 0,
    ambientTemperatureC: 25,
  };
  const buretteLevel = bench?.buretteReadingMl ?? 0;
  const isEndpoint = bench?.isEndpointReached ?? false;
  const isOvershot = bench?.isOvershot ?? false;

  const conicalFlask = bench?.vessels?.find((v) => v.type === 'CONICAL_FLASK');
  const flaskVolume = conicalFlask?.currentVolumeMl || 0;
  const flaskPh = conicalFlask?.ph ?? 7.0;
  const hasIndicator = conicalFlask?.indicatorPresent;
  const hasAnalyte =
    flaskVolume > 0 && conicalFlask?.contentsDescription?.includes('Oxalic');

  const getSolutionColor = () => {
    if (flaskVolume <= 0) return 'transparent';
    if (isOvershot) return 'rgba(219, 39, 119, 0.85)';
    if (isEndpoint) return 'rgba(244, 114, 182, 0.65)';
    if (hasIndicator && flaskPh >= 8.2) return 'rgba(251, 207, 232, 0.5)';
    return 'rgba(224, 242, 254, 0.35)';
  };

  useEffect(() => {
    if (isContinuousFlow) {
      continuousTimerRef.current = window.setInterval(async () => {
        if (buretteLevel >= 50.0 || isOvershot) {
          setIsContinuousFlow(false);
          return;
        }
        triggerDropAnimation();
        await onAction({
          actionType: 'ADD_DROPWISE',
          volumeMl: 0.1,
        });
      }, 400);
    } else {
      if (continuousTimerRef.current) {
        clearInterval(continuousTimerRef.current);
        continuousTimerRef.current = null;
      }
    }
    return () => {
      if (continuousTimerRef.current) clearInterval(continuousTimerRef.current);
    };
  }, [isContinuousFlow, buretteLevel, isOvershot]);

  const triggerDropAnimation = () => {
    setDropFalling(true);
    setTimeout(() => setDropFalling(false), 280);
  };

  const handleSingleDrop = async () => {
    if (buretteLevel >= 50.0) return;
    triggerDropAnimation();
    await onAction({
      actionType: 'ADD_DROPWISE',
      volumeMl: 0.05,
    });
  };

  const handleQuickAdd = async (volume: number) => {
    if (buretteLevel + volume > 50.0) return;
    triggerDropAnimation();
    await onAction({
      actionType: 'ADD_DROPWISE',
      volumeMl: volume,
    });
  };

  const handleRefillBurette = async () => {
    await onAction({
      actionType: 'FILL_BURETTE',
      volumeMl: 50.0,
      reagentId: 'reag_naoh',
    });
  };

  const handlePipetteOxalic = async () => {
    await onAction({
      actionType: 'PIPETTE_TRANSFER',
      sourceVesselId: 'vessel_stock_oxalic',
      targetVesselId: 'vessel_conical_flask',
      volumeMl: 10.0,
    });
  };

  const handleAddIndicator = async () => {
    await onAction({
      actionType: 'ADD_INDICATOR',
      targetVesselId: 'vessel_conical_flask',
      reagentId: 'reag_phenolphthalein',
      volumeMl: 0.1,
    });
  };

  const toggleSwirl = async () => {
    setIsSwirling(!isSwirling);
    await onAction({
      actionType: 'SWIRL_FLASK',
      targetVesselId: 'vessel_conical_flask',
    });
  };

  const buretteInnerHeight = 330;
  const buretteLiquidHeight = Math.max(
    0,
    ((50 - buretteLevel) / 50) * buretteInnerHeight
  );
  const flaskLiquidHeight = Math.min(
    100,
    Math.max(0, (flaskVolume / 250) * 110)
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: TERNARY MIXTURE SEPARATION BENCH (EXP-C09-01)
  // ─────────────────────────────────────────────────────────────────────────────
  if (isSeparation) {
    return (
      <div className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-[#070E17] dark:text-slate-100 overflow-hidden relative shadow-xl transition-colors">
        {/* Top Bench Status Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50 dark:border-slate-800/80 dark:bg-[#0B1522] px-4 py-2.5 gap-2 transition-colors">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                NCERT Class 9 Separation Lab
              </span>
              <span className="rounded bg-cyan-100 dark:bg-slate-800 px-2 py-0.5 text-[0.6875rem] font-mono text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-slate-700">
                NCERT Practical 2.1
              </span>
            </div>
          </div>

          {/* 3D vs 2D Mode Switcher & Mass Balance Metrics */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
            {/* 3D / 2D Toggle Button */}
            <div className="flex items-center rounded-lg border border-cyan-500/40 bg-white dark:bg-slate-900 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[0.6875rem] font-bold transition-all cursor-pointer ${
                  viewMode === '3d'
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600'
                }`}
              >
                <Box className="h-3.5 w-3.5" />
                <span>3D Lab (Movable)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('2d')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[0.6875rem] font-medium transition-all cursor-pointer ${
                  viewMode === '2d'
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600'
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                <span>2D Diagram</span>
              </button>
            </div>

            {/* Mass balance badges */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 text-[0.6875rem]">
                Mixture:
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {isWeighed ? '10.00 g' : 'Unweighed'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 text-[0.6875rem]">
                NH₄Cl:
              </span>
              <span className="font-bold text-cyan-600 dark:text-cyan-300">
                {isSublimationDone ? '2.50 g' : '—'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 text-[0.6875rem]">
                Sand:
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-300">
                {isFiltrationDone ? '4.50 g' : '—'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
              <span className="text-slate-500 dark:text-slate-400 text-[0.6875rem]">
                NaCl:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-300">
                {isEvaporationDone ? '3.00 g' : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Stage Selector Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 bg-slate-100/70 dark:border-slate-800/60 dark:bg-slate-900/40 px-3 py-1.5 gap-1.5 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setSeparationStage('weigh')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer shrink-0 ${
              separationStage === 'weigh'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>1. Weigh Mixture</span>
            {isWeighed && <CheckCircle2 className="h-3 w-3 text-emerald-300" />}
          </button>

          <button
            type="button"
            onClick={() => setSeparationStage('sublime')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer shrink-0 ${
              separationStage === 'sublime'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>2. Sublime NH₄Cl</span>
            {isSublimationDone && (
              <CheckCircle2 className="h-3 w-3 text-emerald-300" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setSeparationStage('filter')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer shrink-0 ${
              separationStage === 'filter'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Filter className="h-3.5 w-3.5" />
            <span>3. Filter Sand</span>
            {isFiltrationDone && (
              <CheckCircle2 className="h-3 w-3 text-emerald-300" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setSeparationStage('evaporate')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer shrink-0 ${
              separationStage === 'evaporate'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>4. Evaporate Salt</span>
            {isEvaporationDone && (
              <CheckCircle2 className="h-3 w-3 text-emerald-300" />
            )}
          </button>
        </div>

        {/* ─── MAIN STAGE: 3D WEBGL LAB (DEFAULT) OR 2D SCHEMATIC ─── */}
        {viewMode === '3d' ? (
          <div className="relative flex-1 w-full h-full overflow-hidden">
            <VirtualLab3DCanvas
              currentStage={separationStage}
              isTared={isTared}
              isWeighed={isWeighed}
              isBurnerOn={isBurnerIgnited}
              isSublimationDone={isSublimationDone}
              isFiltrationDone={isFiltrationDone}
              isEvaporating={isEvaporating}
              isEvaporationDone={isEvaporationDone}
              onTare={handleTareBalance}
              onWeigh={handleWeighSample}
              onSublime={handleSublime}
              onFilter={handleFilter}
              onEvaporate={handleEvaporate}
              isDarkMode={isDark}
            />
          </div>
        ) : (
          /* 2D DIAGRAMMATIC BENCH */
          <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 dark:from-[#09121E] dark:via-[#060D17] dark:to-[#04080F] transition-colors">
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* STAGE 1: DIGITAL ANALYTICAL BALANCE */}
            {separationStage === 'weigh' && (
              <div className="relative flex flex-col items-center">
                <div className="w-80 h-72 rounded-2xl border-2 border-slate-300/80 dark:border-cyan-500/30 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-6 flex flex-col items-center justify-between shadow-2xl relative">
                  <div className="text-[0.6875rem] font-mono font-semibold text-slate-500 dark:text-cyan-400/80 uppercase tracking-widest">
                    Analytical Balance · Precision 0.01 g
                  </div>

                  <div className="relative flex flex-col items-center my-auto">
                    <div className="relative w-36 h-12 rounded-b-xl border border-slate-400 dark:border-slate-600 bg-gradient-to-b from-white/90 to-slate-200 dark:from-slate-700/80 dark:to-slate-800 shadow-md flex items-center justify-center overflow-hidden">
                      {isWeighed ? (
                        <div className="w-28 h-6 rounded-b-lg bg-gradient-to-r from-amber-700/60 via-slate-400 to-amber-600/70 flex items-center justify-center shadow-inner">
                          <span className="text-[0.6875rem] font-bold text-white tracking-wide">
                            10.00 g Ternary Mixture
                          </span>
                        </div>
                      ) : (
                        <span className="text-[0.6875rem] text-slate-400 italic">
                          {isTared ? 'Tared Weighing Boat' : 'Empty Weighing Boat'}
                        </span>
                      )}
                    </div>

                    <div className="w-4 h-5 bg-slate-400 dark:bg-slate-600 mx-auto" />
                    <div className="w-44 h-2.5 rounded-full bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 dark:from-slate-600 dark:via-slate-400 dark:to-slate-700 shadow-md" />
                  </div>

                  <div className="w-full flex items-center justify-between bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 shadow-inner">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[0.6875rem] font-mono text-emerald-400 uppercase tracking-wider">
                        {isTared ? 'TARED' : 'ZERO'}
                      </span>
                    </div>
                    <div className="font-mono text-xl sm:text-2xl font-bold text-cyan-300 tracking-wider">
                      {isWeighed ? '10.00' : isTared ? '0.00' : '2.15'}{' '}
                      <span className="text-xs text-cyan-400/80 font-normal">g</span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-slate-600 dark:text-slate-300 font-medium text-center">
                  Tare the weighing boat on the balance and measure exactly 10.00 g of the mixture.
                </p>
              </div>
            )}

            {/* STAGE 2: SUBLIMATION OF NH4Cl */}
            {separationStage === 'sublime' && (
              <div className="relative flex flex-col items-center">
                <div className="relative w-80 h-96 flex flex-col items-center justify-end">
                  <div className="absolute top-2 w-5 h-7 rounded-t-md bg-white border border-slate-300 dark:border-slate-600 shadow-sm z-20 flex items-center justify-center">
                    <span className="text-[0.5rem] font-bold text-slate-600">Cotton</span>
                  </div>

                  <div className="relative w-52 h-44 flex flex-col items-center z-10">
                    <div className="w-4 h-16 border-x border-cyan-400/50 bg-cyan-100/20 dark:bg-cyan-950/20" />
                    <div
                      className="relative w-52 h-28 border-t-2 border-x border-cyan-400/60 bg-gradient-to-b from-cyan-100/30 to-cyan-200/20 dark:from-cyan-900/30 dark:to-cyan-950/20 backdrop-blur-[1px] shadow-lg overflow-hidden"
                      style={{
                        clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
                      }}
                    >
                      {(isBurnerIgnited || isSublimationDone) && (
                        <div className="absolute top-2 left-6 right-6 h-12 bg-white/90 dark:bg-white/80 rounded-b-xl border border-cyan-200 shadow-inner flex items-center justify-center">
                          <span className="text-[0.6875rem] font-bold text-slate-800 font-mono">
                            NH₄Cl Sublimate Crust (2.50 g)
                          </span>
                        </div>
                      )}
                      {isBurnerIgnited && (
                        <div className="absolute inset-x-8 bottom-0 top-10 flex justify-around opacity-80 pointer-events-none">
                          <div className="w-3 h-full bg-white/70 blur-[3px] animate-pulse" />
                          <div className="w-4 h-full bg-white/80 blur-[2px] animate-pulse delay-75" />
                          <div className="w-3 h-full bg-white/70 blur-[3px] animate-pulse delay-150" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative w-56 h-10 -mt-2 rounded-b-3xl border-2 border-slate-300 dark:border-slate-500 bg-gradient-to-b from-white to-slate-200 dark:from-slate-100 dark:to-slate-300 shadow-xl z-10 flex items-center justify-center overflow-hidden">
                    <div className="w-44 h-4 rounded-b-xl bg-gradient-to-r from-amber-800/80 via-slate-600 to-amber-700/80 flex items-center justify-center">
                      <span className="text-[0.6875rem] font-bold text-white/90">
                        {isSublimationDone
                          ? 'Residual Sand + NaCl (7.50 g)'
                          : 'Ternary Mixture (10.00 g)'}
                      </span>
                    </div>
                  </div>

                  <div className="w-64 h-2 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-700 rounded-sm shadow-md my-0.5 border border-slate-500" />

                  <div className="relative w-64 h-24 flex justify-between px-3">
                    <div className="w-2.5 h-full bg-gradient-to-b from-slate-600 to-slate-900 rounded-b shadow-md -rotate-6" />
                    <div className="relative flex flex-col items-center my-auto">
                      {isBurnerIgnited && (
                        <div className="flex flex-col items-center -mb-1 animate-bounce">
                          <div className="w-5 h-8 rounded-full bg-gradient-to-t from-cyan-400 via-blue-500 to-amber-400 blur-[1px] shadow-lg shadow-cyan-400/50" />
                        </div>
                      )}
                      <div className="w-3.5 h-12 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 rounded-t shadow border-x border-slate-600" />
                      <div className="w-16 h-3 bg-slate-800 rounded shadow-md border border-slate-600" />
                    </div>
                    <div className="w-2.5 h-full bg-gradient-to-b from-slate-600 to-slate-900 rounded-b shadow-md rotate-6" />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
                  <Thermometer className="h-4 w-4 text-cyan-500" />
                  <span className="text-slate-600 dark:text-slate-300">
                    Temperature:{' '}
                    <strong className="text-cyan-600 dark:text-cyan-300">
                      {isBurnerIgnited ? '350 °C (Subliming)' : '25 °C (Ambient)'}
                    </strong>
                  </span>
                </div>
              </div>
            )}

            {/* STAGE 3: FILTRATION */}
            {separationStage === 'filter' && (
              <div className="relative flex flex-col items-center">
                <div className="relative w-80 h-96 flex flex-col items-center justify-end">
                  <div className="relative w-44 h-36 flex flex-col items-center z-10">
                    <div
                      className="relative w-44 h-24 border-t-2 border-x border-cyan-400/60 bg-cyan-100/30 dark:bg-cyan-950/20 backdrop-blur-[1px] shadow-md overflow-hidden"
                      style={{
                        clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
                      }}
                    >
                      <div className="absolute inset-x-4 top-2 bottom-0 bg-white/90 dark:bg-white/80 rounded-b-lg border border-slate-300 shadow-inner flex flex-col items-center justify-center p-1">
                        {isFiltrationDone && (
                          <div className="w-28 h-6 bg-amber-800/80 rounded-full shadow-inner flex items-center justify-center">
                            <span className="text-[0.6875rem] font-bold text-amber-100">
                              Sand Residue (4.50 g)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-3.5 h-14 border-x border-cyan-400/50 bg-cyan-100/20 dark:bg-cyan-950/20 -mt-0.5" />
                  </div>

                  <div className="relative w-40 h-36 -mt-3 flex flex-col items-center">
                    <div className="w-12 h-6 border-x border-cyan-400/50 bg-cyan-100/20 dark:bg-cyan-950/20" />
                    <div
                      className="relative w-40 h-28 border-2 border-cyan-400/60 bg-cyan-100/20 dark:bg-cyan-950/10 rounded-b-3xl shadow-xl flex items-end justify-center overflow-hidden"
                      style={{
                        clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
                      }}
                    >
                      {(isWaterAdded || isFiltrationDone) && (
                        <div className="w-full h-16 bg-gradient-to-t from-cyan-400/30 via-teal-300/20 to-transparent flex items-center justify-center border-t border-cyan-300/40">
                          <span className="text-[0.6875rem] font-bold text-teal-800 dark:text-teal-200 font-mono">
                            30 mL Clear NaCl Filtrate
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-64 h-3 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 rounded-sm shadow-xl border border-slate-500" />
                </div>

                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 font-medium text-center">
                  Insoluble sand is retained as residue (4.50 g). Soluble salt passes through as clear liquid.
                </p>
              </div>
            )}

            {/* STAGE 4: EVAPORATION */}
            {separationStage === 'evaporate' && (
              <div className="relative flex flex-col items-center">
                <div className="relative w-80 h-80 flex flex-col items-center justify-end">
                  <div className="relative w-56 h-14 rounded-b-3xl border-2 border-slate-300 dark:border-slate-500 bg-gradient-to-b from-white to-slate-200 dark:from-slate-100 dark:to-slate-300 shadow-xl z-10 flex items-center justify-center overflow-hidden">
                    {isEvaporationDone ? (
                      <div className="w-48 h-6 rounded-b-xl bg-white border border-slate-300 shadow-inner flex items-center justify-center">
                        <span className="text-[0.6875rem] font-bold text-slate-900 font-mono flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-amber-500" />
                          Dry NaCl Crystals Recovered (3.00 g)
                        </span>
                      </div>
                    ) : isEvaporating ? (
                      <div className="w-48 h-6 bg-cyan-200/50 rounded-b-xl flex items-center justify-center animate-pulse">
                        <span className="text-[0.6875rem] font-semibold text-cyan-900">
                          Boiling & Evaporating Water...
                        </span>
                      </div>
                    ) : (
                      <div className="w-48 h-6 bg-cyan-200/40 rounded-b-xl flex items-center justify-center">
                        <span className="text-[0.6875rem] font-medium text-cyan-900">
                          Clear NaCl Solution (30 mL)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="w-64 h-2 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-700 rounded-sm shadow-md my-0.5 border border-slate-500" />

                  <div className="relative w-64 h-24 flex justify-between px-3">
                    <div className="w-2.5 h-full bg-gradient-to-b from-slate-600 to-slate-900 rounded-b shadow-md -rotate-6" />
                    <div className="relative flex flex-col items-center my-auto">
                      {isEvaporating && (
                        <div className="flex flex-col items-center -mb-1 animate-bounce">
                          <div className="w-5 h-8 rounded-full bg-gradient-to-t from-cyan-400 via-blue-500 to-amber-400 blur-[1px] shadow-lg shadow-cyan-400/50" />
                        </div>
                      )}
                      <div className="w-3.5 h-12 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 rounded-t shadow border-x border-slate-600" />
                      <div className="w-16 h-3 bg-slate-800 rounded shadow-md border border-slate-600" />
                    </div>
                    <div className="w-2.5 h-full bg-gradient-to-b from-slate-600 to-slate-900 rounded-b shadow-md rotate-6" />
                  </div>
                </div>

                {isEvaporationDone && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/40 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>
                      100% Mass Balance Achieved: 2.50 g NH₄Cl + 4.50 g Sand + 3.00 g NaCl = 10.00 g!
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bench Interactive Control Bar (2D Schematic Mode Only) */}
        {viewMode === '2d' && (
          <div className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#0B1522] p-3 sm:p-4 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Stage Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {separationStage === 'weigh' && (
                  <>
                    <button
                      type="button"
                      disabled={isLoading || isTared}
                      onClick={handleTareBalance}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                        !isTared
                          ? 'border-cyan-500/60 bg-cyan-600 text-white shadow-md hover:bg-cyan-500 active:scale-95'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Scale className="h-4 w-4" />
                      <span>{isTared ? 'Balance Tared (0.00 g)' : 'Tare Balance (0.00 g)'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isLoading || !isTared || isWeighed}
                      onClick={handleWeighSample}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                        isTared && !isWeighed
                          ? 'border-teal-500/60 bg-teal-600 text-white shadow-md hover:bg-teal-500 active:scale-95'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Layers className="h-4 w-4" />
                      <span>{isWeighed ? 'Sample Weighed (10.00 g)' : 'Weigh 10.00 g Mixture'}</span>
                    </button>
                  </>
                )}

                {separationStage === 'sublime' && (
                  <button
                    type="button"
                    disabled={isLoading || isBurnerIgnited || isSublimationDone}
                    onClick={handleSublime}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                      !isSublimationDone
                        ? 'border-cyan-500/60 bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md hover:from-cyan-500 hover:to-teal-500 active:scale-95'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Flame className="h-4 w-4" />
                    <span>
                      {isBurnerIgnited
                        ? 'Subliming NH₄Cl...'
                        : isSublimationDone
                        ? 'Sublimation Complete (2.50 g)'
                        : 'Ignite Burner & Sublime NH₄Cl'}
                    </span>
                  </button>
                )}

                {separationStage === 'filter' && (
                  <button
                    type="button"
                    disabled={isLoading || isWaterAdded || isFiltrationDone}
                    onClick={handleFilter}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                      !isFiltrationDone
                        ? 'border-cyan-500/60 bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md hover:from-cyan-500 hover:to-teal-500 active:scale-95'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                    <span>
                      {isWaterAdded && !isFiltrationDone
                        ? 'Filtering Sand Residue...'
                        : isFiltrationDone
                        ? 'Filtration Complete (4.50 g Sand)'
                        : 'Add 30 mL Water & Filter Sand'}
                    </span>
                  </button>
                )}

                {separationStage === 'evaporate' && (
                  <button
                    type="button"
                    disabled={isLoading || isEvaporating || isEvaporationDone}
                    onClick={handleEvaporate}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                      !isEvaporationDone
                        ? 'border-cyan-500/60 bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md hover:from-cyan-500 hover:to-teal-500 active:scale-95'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>
                      {isEvaporating
                        ? 'Evaporating Water to Dryness...'
                        : isEvaporationDone
                        ? 'NaCl Crystals Recovered (3.00 g)'
                        : 'Evaporate Filtrate & Recover Salt'}
                    </span>
                  </button>
                )}
              </div>

              {/* Stage Progression Buttons */}
              <div className="flex items-center gap-2">
                {separationStage === 'weigh' && isWeighed && (
                  <button
                    type="button"
                    onClick={() => setSeparationStage('sublime')}
                    className="rounded-xl border border-cyan-400/50 bg-cyan-500/10 dark:bg-cyan-950/30 px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
                  >
                    Proceed to Sublimation →
                  </button>
                )}
                {separationStage === 'sublime' && isSublimationDone && (
                  <button
                    type="button"
                    onClick={() => setSeparationStage('filter')}
                    className="rounded-xl border border-cyan-400/50 bg-cyan-500/10 dark:bg-cyan-950/30 px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
                  >
                    Proceed to Filtration →
                  </button>
                )}
                {separationStage === 'filter' && isFiltrationDone && (
                  <button
                    type="button"
                    onClick={() => setSeparationStage('evaporate')}
                    className="rounded-xl border border-cyan-400/50 bg-cyan-500/10 dark:bg-cyan-950/30 px-3 py-1.5 text-xs font-semibold text-cyan-700 dark:text-cyan-300 hover:bg-cyan-500/20 transition-all cursor-pointer"
                  >
                    Proceed to Evaporation →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: VOLUMETRIC TITRATION BENCH (EXP-C11-02 & DEFAULT)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-[#070E17] dark:text-slate-100 overflow-hidden relative shadow-xl transition-colors">
      {/* Top Bench Status Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 bg-slate-50 dark:border-slate-800/80 dark:bg-[#0B1522] px-4 py-2.5 gap-2 transition-colors">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Volumetric Titration Bench
            </span>
            <span className="rounded bg-cyan-100 dark:bg-slate-800 px-2 py-0.5 text-[0.6875rem] font-mono text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-slate-700">
              NCERT Practical 6.2
            </span>
          </div>
        </div>

        {/* Live Bench Readouts */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 text-[0.6875rem]">
              Burette:
            </span>
            <span className="font-bold text-cyan-600 dark:text-cyan-300">
              {buretteLevel.toFixed(2)} mL
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 text-[0.6875rem]">
              Flask Vol:
            </span>
            <span className="font-bold text-teal-600 dark:text-teal-300">
              {flaskVolume.toFixed(2)} mL
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 text-[0.6875rem]">
              Solution pH:
            </span>
            <span
              className={`font-bold ${
                isOvershot
                  ? 'text-pink-600 dark:text-pink-400'
                  : isEndpoint
                  ? 'text-pink-500 dark:text-pink-300'
                  : 'text-emerald-600 dark:text-emerald-300'
              }`}
            >
              {flaskPh.toFixed(2)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowMeniscusZoom(!showMeniscusZoom)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[0.6875rem] transition-all cursor-pointer ${
              showMeniscusZoom
                ? 'border-cyan-500/50 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Meniscus Zoom</span>
          </button>
        </div>
      </div>

      {/* Main Bench Visual Stage */}
      <div className="relative flex-1 flex items-center justify-center p-6 overflow-hidden bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 dark:from-[#09121E] dark:via-[#060D17] dark:to-[#04080F] transition-colors">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Retort Stand, Burette & Flask Stage */}
        <div className="relative w-[500px] h-[520px] flex items-center justify-center">
          <div className="absolute bottom-6 left-16 w-80 h-4 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900 rounded-sm shadow-2xl border border-slate-500/40" />
          <div className="absolute bottom-5 left-18 w-76 h-1.5 bg-slate-950/40 blur-[1px]" />

          <div className="absolute bottom-10 left-24 w-3.5 h-[460px] bg-gradient-to-r from-slate-400 via-slate-200 to-slate-500 rounded-sm shadow-lg border-r border-slate-500" />

          <div className="absolute top-28 left-24 w-28 h-3.5 bg-gradient-to-r from-slate-700 to-slate-900 rounded border border-slate-500 flex items-center justify-end pr-1">
            <div className="w-4 h-5 rounded bg-slate-950 border border-slate-400" />
          </div>
          <div className="absolute top-64 left-24 w-28 h-3.5 bg-gradient-to-r from-slate-700 to-slate-900 rounded border border-slate-500 flex items-center justify-end pr-1">
            <div className="w-4 h-5 rounded bg-slate-950 border border-slate-400" />
          </div>

          <div className="absolute top-10 left-48 flex flex-col items-center">
            <div className="w-8 h-2.5 bg-slate-400/30 border-t border-x border-cyan-400/50 rounded-t-sm" />

            <div className="relative w-6 h-[340px] border-x border-cyan-400/40 bg-cyan-100/20 dark:bg-cyan-950/20 rounded-b-xs shadow-inner overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-cyan-400/30 to-cyan-500/40 transition-all duration-300"
                style={{ height: `${buretteLiquidHeight}px` }}
              >
                <div className="absolute -top-1.5 left-0 right-0 h-3 border-b-2 border-cyan-400/80 rounded-[50%] bg-cyan-300/10" />
              </div>

              <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map((mark) => (
                  <div
                    key={mark}
                    className="flex items-center justify-end w-full pr-0.5"
                  >
                    <span className="text-[0.4375rem] font-mono text-slate-500 dark:text-cyan-400/80 mr-0.5 select-none scale-75 origin-right">
                      {mark}
                    </span>
                    <div
                      className={`h-[1px] bg-cyan-500/60 ${
                        mark % 10 === 0 ? 'w-2.5' : 'w-1.5'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex flex-col items-center -mt-0.5">
              <div className="w-2.5 h-3 bg-cyan-400/40 border-x border-cyan-500/60" />
              <div
                className={`w-8 h-2.5 rounded bg-gradient-to-r from-teal-600 to-cyan-600 border border-teal-400 shadow-md cursor-pointer transition-transform ${
                  isContinuousFlow ? 'rotate-90' : 'rotate-0'
                }`}
                title="Burette Stopcock Tap"
                onClick={() => setIsContinuousFlow(!isContinuousFlow)}
              />
              <div className="w-1.5 h-5 bg-cyan-400/40 border-x border-b border-cyan-500/60 rounded-b-full" />
            </div>

            {dropFalling && (
              <div className="absolute top-[375px] left-[10px] w-2 h-3 bg-cyan-400 rounded-full animate-bounce shadow-md shadow-cyan-400/50" />
            )}
          </div>

          <div
            className={`absolute bottom-10 left-[182px] flex flex-col items-center transition-transform ${
              isSwirling ? 'animate-pulse scale-[1.02]' : ''
            }`}
          >
            <div className="w-7 h-10 border-x-2 border-cyan-400/40 bg-cyan-100/10 dark:bg-cyan-950/10 rounded-t-sm" />

            <div
              className="relative w-36 h-28 border-2 border-cyan-400/50 bg-gradient-to-b from-transparent to-cyan-100/10 dark:to-cyan-950/20 rounded-b-3xl shadow-xl flex items-end justify-center overflow-hidden"
              style={{
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
              }}
            >
              <div
                className="w-full transition-all duration-500 ease-out flex items-center justify-center relative shadow-inner"
                style={{
                  height: `${flaskLiquidHeight}px`,
                  backgroundColor: getSolutionColor(),
                }}
              >
                <div className="absolute top-0 inset-x-0 h-2 border-t border-cyan-300/40 rounded-[50%]" />

                {isSwirling && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-60">
                    <div className="w-16 h-4 border-2 border-dashed border-white/60 rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="w-44 h-2 rounded bg-white shadow-md border border-slate-300 dark:border-slate-500 -mt-0.5" />
          </div>

          {showMeniscusZoom && (
            <div className="absolute top-12 right-0 w-44 rounded-2xl border border-slate-300 dark:border-cyan-500/40 bg-white/95 dark:bg-slate-900/90 p-3 shadow-2xl backdrop-blur-md transition-colors">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-2">
                <span className="text-[0.6875rem] font-mono font-bold text-slate-800 dark:text-cyan-300 uppercase">
                  Meniscus Loupe
                </span>
                <span className="text-[0.6875rem] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                  {buretteLevel.toFixed(2)} mL
                </span>
              </div>

              <div className="relative h-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/80 p-2 flex flex-col justify-center overflow-hidden">
                <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-40">
                  <div className="flex justify-between text-[0.5rem] font-mono text-slate-500 px-1">
                    <span>-0.2</span>
                    <div className="w-4 h-[1px] bg-slate-400" />
                  </div>
                  <div className="flex justify-between text-[0.5rem] font-mono text-slate-500 px-1">
                    <span>-0.1</span>
                    <div className="w-4 h-[1px] bg-slate-400" />
                  </div>
                  <div className="flex justify-between text-[0.5rem] font-mono text-cyan-500 font-bold px-1">
                    <span>0.0</span>
                    <div className="w-8 h-[1px] bg-cyan-400" />
                  </div>
                  <div className="flex justify-between text-[0.5rem] font-mono text-slate-500 px-1">
                    <span>0.1</span>
                    <div className="w-4 h-[1px] bg-slate-400" />
                  </div>
                  <div className="flex justify-between text-[0.5rem] font-mono text-slate-500 px-1">
                    <span>0.2</span>
                    <div className="w-4 h-[1px] bg-slate-400" />
                  </div>
                </div>

                <div className="relative mx-auto w-24 h-5">
                  <div className="absolute inset-0 border-b-3 border-amber-400 rounded-[50%] bg-cyan-400/20" />
                </div>
              </div>
              <p className="mt-1.5 text-[0.6875rem] text-slate-500 dark:text-slate-400 text-center leading-tight">
                Align eye horizontally with the{' '}
                <span className="text-amber-500 font-bold">lower curve</span> of the liquid meniscus.
              </p>
            </div>
          )}
        </div>

        {isEndpoint && (
          <div className="absolute top-4 left-6 flex items-center gap-2.5 rounded-xl border border-pink-500/50 bg-pink-50 dark:bg-pink-950/80 px-4 py-2 text-pink-800 dark:text-pink-200 shadow-xl backdrop-blur-md">
            <Sparkles className="h-5 w-5 text-pink-500" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Equivalence Endpoint Reached!
              </p>
              <p className="text-[0.6875rem] text-pink-700 dark:text-pink-300">
                Faint permanent pink blush persists throughout solution (pH ≈ 8.6).
              </p>
            </div>
          </div>
        )}

        {isOvershot && (
          <div className="absolute top-4 left-6 flex items-center gap-2.5 rounded-xl border border-red-500/50 bg-red-50 dark:bg-red-950/80 px-4 py-2 text-red-800 dark:text-red-200 shadow-xl backdrop-blur-md">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Titration Overshot!
              </p>
              <p className="text-[0.6875rem] text-red-700 dark:text-red-300">
                Excess NaOH added. Solution turned intense magenta. Record final volume & repeat trial.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bench Interactive Control Center */}
      <div className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#0B1522] p-4 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isLoading || hasAnalyte}
              onClick={handlePipetteOxalic}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                !hasAnalyte
                  ? 'border-cyan-500/50 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Droplet className="h-3.5 w-3.5" />
              <span>Pipette 10 mL Oxalic Acid</span>
            </button>

            <button
              type="button"
              disabled={isLoading || !hasAnalyte || !!hasIndicator}
              onClick={handleAddIndicator}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                hasAnalyte && !hasIndicator
                  ? 'border-teal-500/50 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Add Phenolphthalein (2 drops)</span>
            </button>

            <button
              type="button"
              onClick={toggleSwirl}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                isSwirling
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Wind className="h-3.5 w-3.5" />
              <span>{isSwirling ? 'Stop Swirling' : 'Swirl Flask'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isLoading || buretteLevel >= 50.0}
              onClick={handleSingleDrop}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-400/60 bg-gradient-to-r from-cyan-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:from-cyan-500 hover:to-teal-500 active:scale-95 transition-all cursor-pointer"
            >
              <Droplet className="h-4 w-4" />
              <span>Dropwise (+0.05 mL)</span>
            </button>

            <button
              type="button"
              disabled={isLoading || buretteLevel >= 50.0}
              onClick={() => setIsContinuousFlow(!isContinuousFlow)}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                isContinuousFlow
                  ? 'border-red-500 bg-red-600 text-white shadow-lg animate-pulse'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {isContinuousFlow ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isContinuousFlow ? 'Stop Stream' : 'Continuous Stream'}</span>
            </button>

            <button
              type="button"
              disabled={isLoading || buretteLevel + 1.0 > 50.0}
              onClick={() => handleQuickAdd(1.0)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              +1.0 mL
            </button>

            <button
              type="button"
              disabled={isLoading || buretteLevel + 5.0 > 50.0}
              onClick={() => handleQuickAdd(5.0)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              +5.0 mL
            </button>

            <button
              type="button"
              title="Refill Burette to 0.00 mL"
              onClick={handleRefillBurette}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/80 p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

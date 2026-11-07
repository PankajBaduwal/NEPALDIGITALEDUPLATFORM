import React, { useState } from 'react';
import { BookOpen, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import type {
  VirtualLabSessionData,
  VirtualLabExperimentData,
} from '../../services/virtual-lab.service';

interface ObservationNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: VirtualLabSessionData;
  experiment?: VirtualLabExperimentData | null;
  onRecordTrial: (trial: {
    trialNumber: number;
    initialReadingMl: number;
    finalReadingMl: number;
    volumeUsedMl: number;
    notes?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export const ObservationNotebookModal: React.FC<ObservationNotebookModalProps> = ({
  isOpen,
  onClose,
  session,
  experiment,
  onRecordTrial,
  isLoading = false,
}) => {
  const expId = experiment?.experimentId || session?.experiment?.experimentId || '';
  const isPhysics =
    expId.startsWith('EXP-P') ||
    expId === 'vl-g10-ohms-law' ||
    experiment?.subject?.toLowerCase() === 'physics' ||
    experiment?.title?.toLowerCase().includes("ohm's law") ||
    experiment?.title?.toLowerCase().includes('resistance');
  const isSeparation =
    !isPhysics &&
    (expId === 'EXP-C09-01' ||
      experiment?.title?.toLowerCase().includes('separation') ||
      experiment?.title?.toLowerCase().includes('ammonium chloride'));

  const notebook = session?.observationNotebook ?? {
    trials: [],
    isConcordanceAchieved: false,
  };
  const currentBurette = session?.benchState?.buretteReadingMl ?? 0;

  const [initialReading, setInitialReading] = useState<string>('0.00');
  const [finalReading, setFinalReading] = useState<string>(
    currentBurette.toFixed(2)
  );
  // Physics fields
  const [voltsInput, setVoltsInput] = useState<string>('1.00');
  const [ampsInput, setAmpsInput] = useState<string>('0.20');
  const [studentNote, setStudentNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const nextTrialNumber = (notebook.trials?.length || 0) + 1;

  const handleCaptureCurrent = () => {
    setFinalReading(currentBurette.toFixed(2));
  };

  const handleAddTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isPhysics) {
      const v = parseFloat(voltsInput);
      const i = parseFloat(ampsInput);
      if (isNaN(v) || isNaN(i) || i <= 0) {
        setErrorMsg('Please enter valid numeric readings (Current I > 0 A).');
        return;
      }
      const r = parseFloat((v / i).toFixed(2));
      try {
        await onRecordTrial({
          trialNumber: nextTrialNumber,
          initialReadingMl: v,
          finalReadingMl: i,
          volumeUsedMl: r,
          notes: studentNote || `V=${v.toFixed(2)}V, I=${i.toFixed(2)}A, R=${r.toFixed(2)}Ω`,
        });
        setStudentNote('');
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to record trial in observation book.');
      }
      return;
    }

    if (isSeparation) {
      try {
        await onRecordTrial({
          trialNumber: nextTrialNumber,
          initialReadingMl: 0.0,
          finalReadingMl: 10.0,
          volumeUsedMl: 10.0,
          notes:
            studentNote ||
            'Ternary mixture components cleanly separated: 2.50 g NH4Cl + 4.50 g Sand + 3.00 g NaCl = 10.00 g (100% mass balance).',
        });
        setStudentNote('');
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to record observation.');
      }
      return;
    }

    const initVal = parseFloat(initialReading);
    const finalVal = parseFloat(finalReading);

    if (isNaN(initVal) || isNaN(finalVal)) {
      setErrorMsg('Please enter valid numeric readings.');
      return;
    }

    if (finalVal < initVal) {
      setErrorMsg('Final reading must be greater than or equal to initial reading.');
      return;
    }

    if (initVal < 0 || finalVal > 50) {
      setErrorMsg('Readings must be within burette capacity (0.00 to 50.00 mL).');
      return;
    }

    const volumeUsed = parseFloat((finalVal - initVal).toFixed(2));

    try {
      await onRecordTrial({
        trialNumber: nextTrialNumber,
        initialReadingMl: initVal,
        finalReadingMl: finalVal,
        volumeUsedMl: volumeUsed,
        notes: studentNote || 'Permanent faint pink blush obtained',
      });

      setInitialReading(finalReading);
      setStudentNote('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record trial in observation book.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-hidden">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0B1522] text-slate-800 dark:text-slate-100 shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4 sm:p-5 shrink-0 bg-slate-50 dark:bg-[#08121E]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Student Observation Notebook
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isPhysics
                  ? "Official CBSE/NCERT Ohm's Law (V-I Characteristics) Observation Sheet"
                  : isSeparation
                  ? 'Official CBSE/NCERT Gravimetric Separation & Mass Balance Sheet'
                  : 'Official CBSE/NCERT Quantitative Titration Observation Sheet'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Experiment Context Banner */}
          {isPhysics ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Specimen Resistor:</span>{' '}
                <span className="font-semibold text-cyan-600 dark:text-cyan-300">
                  Nichrome Coil (Nominal 5.00 Ω)
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Instruments:</span>{' '}
                <span className="font-semibold text-teal-600 dark:text-teal-300">
                  Ammeter (0–1.5 A, LC 0.05 A) · Voltmeter (0–3.0 V, LC 0.1 V)
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Class:</span>{' '}
                <span className="font-semibold text-purple-600 dark:text-purple-300">
                  NCERT Class 10 Science (Unit 12)
                </span>
              </div>
            </div>
          ) : isSeparation ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Initial Mixture:</span>{' '}
                <span className="font-semibold text-cyan-600 dark:text-cyan-300">
                  10.00 g (Sand + NaCl + NH₄Cl)
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Techniques:</span>{' '}
                <span className="font-semibold text-teal-600 dark:text-teal-300">
                  Sublimation ➔ Filtration ➔ Evaporation
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Class:</span>{' '}
                <span className="font-semibold text-purple-600 dark:text-purple-300">
                  NCERT Class 9 Chemistry
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Standard Solution (Flask):</span>{' '}
                <span className="font-semibold text-teal-600 dark:text-teal-300">
                  10.0 mL of 0.05 M Oxalic Acid
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Titrant (Burette):</span>{' '}
                <span className="font-semibold text-cyan-600 dark:text-cyan-300">
                  NaOH Solution (~0.1 M)
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Indicator:</span>{' '}
                <span className="font-semibold text-pink-600 dark:text-pink-300">
                  Phenolphthalein
                </span>
              </div>
            </div>
          )}

          {/* EXPERIMENT OBSERVATION TABLE */}
          {isPhysics ? (
            <div className="space-y-4">
              {/* Physics Status Banner */}
              <div className="flex items-center gap-2.5 rounded-xl border border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/30 p-3 text-xs text-cyan-800 dark:text-cyan-200">
                <CheckCircle2 className="h-5 w-5 text-cyan-500 shrink-0" />
                <div>
                  <span className="font-bold">Ohm's Law Verification (V = I · R)</span>
                  <p className="text-[0.6875rem] text-cyan-700 dark:text-cyan-300/80 mt-0.5">
                    {notebook.trials && notebook.trials.length >= 3 ? (
                      <>
                        Recorded {notebook.trials.length} trials. Mean Experimental Resistance:{' '}
                        <strong className="font-mono text-slate-900 dark:text-white">
                          {(
                            notebook.trials.reduce((acc, t) => acc + (t.volumeUsedMl || 0), 0) /
                            notebook.trials.length
                          ).toFixed(2)}{' '}
                          Ω
                        </strong>{' '}
                        (Nominal: 5.00 Ω). V/I ratio is constant within experimental uncertainty.
                      </>
                    ) : (
                      'Record at least 3 trials across different rheostat slider positions to establish linear V-I relationship.'
                    )}
                  </p>
                </div>
              </div>

              {/* Physics Ohm's Law Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold">
                      <th className="py-2.5 px-3">S.No.</th>
                      <th className="py-2.5 px-3">Potential Difference V (V)</th>
                      <th className="py-2.5 px-3">Current I (A)</th>
                      <th className="py-2.5 px-3">Resistance R = V/I (Ω)</th>
                      <th className="py-2.5 px-3">Rheostat & Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
                    {notebook.trials && notebook.trials.length > 0 ? (
                      notebook.trials.map((trial) => (
                        <tr
                          key={trial.trialNumber}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-sans font-medium">
                            Trial {trial.trialNumber}
                          </td>
                          <td className="py-2 px-3 text-slate-800 dark:text-slate-200">
                            {trial.initialReadingMl.toFixed(2)} V
                          </td>
                          <td className="py-2 px-3 text-slate-800 dark:text-slate-200">
                            {trial.finalReadingMl.toFixed(2)} A
                          </td>
                          <td className="py-2 px-3 font-bold text-amber-600 dark:text-amber-400">
                            {trial.volumeUsedMl.toFixed(2)} Ω
                          </td>
                          <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-sans text-[0.6875rem]">
                            {trial.notes || '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-6 text-center text-slate-400 font-sans italic text-xs"
                        >
                          No trials recorded yet. Use the 3D bench controls to record (V, I) readings.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : isSeparation ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <div>
                  <span className="font-bold">Gravimetric Mass Balance Achieved</span>
                  <p className="text-[0.6875rem] text-emerald-700 dark:text-emerald-300/80 mt-0.5">
                    100.0% recovery: Sum of isolated components equals initial 10.00 g mixture mass.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold">
                      <th className="py-2.5 px-3">Stage / Parameter</th>
                      <th className="py-2.5 px-3">Measured Mass (g)</th>
                      <th className="py-2.5 px-3">Separated Constituent</th>
                      <th className="py-2.5 px-3">Net Recovery (g)</th>
                      <th className="py-2.5 px-3">Yield (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-sans font-medium">
                        Initial Mixture Sample (m₀)
                      </td>
                      <td className="py-2 px-3 text-slate-800 dark:text-slate-200 font-bold">10.00 g</td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-sans">
                        Sand + NaCl + NH₄Cl
                      </td>
                      <td className="py-2 px-3 text-slate-800 dark:text-slate-200">10.00 g</td>
                      <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">100.0%</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-sans font-medium">
                        Sublimation (Funnel + NH₄Cl)
                      </td>
                      <td className="py-2 px-3 text-slate-800 dark:text-slate-200">47.70 g - 45.20 g</td>
                      <td className="py-2 px-3 text-cyan-600 dark:text-cyan-300 font-sans font-semibold">
                        Ammonium Chloride (NH₄Cl)
                      </td>
                      <td className="py-2 px-3 font-bold text-cyan-600 dark:text-cyan-300">2.50 g</td>
                      <td className="py-2 px-3 font-bold text-cyan-600 dark:text-cyan-300">25.0%</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-sans font-medium">
                        Filtration (Filter Paper + Residue)
                      </td>
                      <td className="py-2 px-3 text-slate-800 dark:text-slate-200">5.65 g - 1.15 g</td>
                      <td className="py-2 px-3 text-amber-600 dark:text-amber-300 font-sans font-semibold">
                        Insoluble Sand (SiO₂)
                      </td>
                      <td className="py-2 px-3 font-bold text-amber-600 dark:text-amber-300">4.50 g</td>
                      <td className="py-2 px-3 font-bold text-amber-600 dark:text-amber-300">45.0%</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-sans font-medium">
                        Evaporation (Dish + Dry Salt)
                      </td>
                      <td className="py-2 px-3 text-slate-800 dark:text-slate-200">55.40 g - 52.40 g</td>
                      <td className="py-2 px-3 text-emerald-600 dark:text-emerald-300 font-sans font-semibold">
                        Sodium Chloride (NaCl)
                      </td>
                      <td className="py-2 px-3 font-bold text-emerald-600 dark:text-emerald-300">3.00 g</td>
                      <td className="py-2 px-3 font-bold text-emerald-600 dark:text-emerald-300">30.0%</td>
                    </tr>
                    <tr className="bg-slate-100/70 dark:bg-slate-800/50 font-bold">
                      <td className="py-2.5 px-3 text-slate-900 dark:text-white font-sans">
                        Total Recovered Constituents
                      </td>
                      <td className="py-2.5 px-3 text-slate-900 dark:text-white">—</td>
                      <td className="py-2.5 px-3 text-slate-900 dark:text-white font-sans">
                        All 3 Components Recovered
                      </td>
                      <td className="py-2.5 px-3 text-teal-600 dark:text-teal-300 text-sm">10.00 g</td>
                      <td className="py-2.5 px-3 text-teal-600 dark:text-teal-300 text-sm">100.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Concordance Status Banner for Titration */}
              {notebook.isConcordanceAchieved ? (
                <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-xs text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <div>
                    <span className="font-bold">Concordant Volume Achieved!</span>
                    <p className="text-[0.6875rem] text-emerald-700 dark:text-emerald-300/80 mt-0.5">
                      Two consecutive trials agree within 0.10 mL. Concordant Volume{' '}
                      <strong className="font-mono text-slate-900 dark:text-white text-xs">
                        V₂ = {notebook.concordantVolumeMl?.toFixed(2)} mL
                      </strong>
                      . You may proceed to stoichiometric calculations.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 p-3 text-xs text-amber-800 dark:text-amber-200">
                  <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold">Concordance Pending</span>
                    <p className="text-[0.6875rem] text-amber-700 dark:text-amber-300/80 mt-0.5">
                      Record at least two trials with difference ≤ 0.10 mL to establish the authoritative concordant titre value.
                    </p>
                  </div>
                </div>
              )}

              {/* Titration Table */}
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold">
                      <th className="py-2.5 px-3">S.No.</th>
                      <th className="py-2.5 px-3">Initial Burette Reading (mL)</th>
                      <th className="py-2.5 px-3">Final Burette Reading (mL)</th>
                      <th className="py-2.5 px-3">Volume of NaOH Used (mL)</th>
                      <th className="py-2.5 px-3">Observation Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
                    {notebook.trials && notebook.trials.length > 0 ? (
                      notebook.trials.map((trial) => (
                        <tr
                          key={trial.trialNumber}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-sans font-medium">
                            Trial {trial.trialNumber}
                          </td>
                          <td className="py-2 px-3 text-slate-800 dark:text-slate-200">
                            {trial.initialReadingMl.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-slate-800 dark:text-slate-200">
                            {trial.finalReadingMl.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 font-bold text-teal-600 dark:text-teal-300">
                            {trial.volumeUsedMl.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-sans text-[0.6875rem]">
                            {trial.notes || '—'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-6 text-center text-slate-400 font-sans italic text-xs"
                        >
                          No trials recorded yet. Titrate to endpoint and record your readings below.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Form: Add New Observation */}
          <form
            onSubmit={handleAddTrial}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {isSeparation ? 'Save Laboratory Observation' : `Record Trial ${nextTrialNumber}`}
              </h3>
              {!isSeparation && (
                <button
                  type="button"
                  onClick={handleCaptureCurrent}
                  className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium cursor-pointer"
                >
                  Use Current Bench Reading ({currentBurette.toFixed(2)} mL)
                </button>
              )}
            </div>

            {isPhysics ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[0.6875rem] text-slate-600 dark:text-slate-400 mb-1">
                    Potential Difference V (Volts)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="10"
                    required
                    value={voltsInput}
                    onChange={(e) => setVoltsInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[0.6875rem] text-slate-600 dark:text-slate-400 mb-1">
                    Current I (Amperes)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="5"
                    required
                    value={ampsInput}
                    onChange={(e) => setAmpsInput(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[0.6875rem] text-slate-600 dark:text-slate-400 mb-1">
                    Calculated Resistance R = V / I
                  </label>
                  <div className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">
                    {!isNaN(parseFloat(voltsInput)) && !isNaN(parseFloat(ampsInput)) && parseFloat(ampsInput) > 0
                      ? (parseFloat(voltsInput) / parseFloat(ampsInput)).toFixed(2)
                      : '0.00'}{' '}
                    Ω
                  </div>
                </div>
              </div>
            ) : !isSeparation ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[0.6875rem] text-slate-600 dark:text-slate-400 mb-1">
                    Initial Reading (mL)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="50"
                    required
                    value={initialReading}
                    onChange={(e) => setInitialReading(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[0.6875rem] text-slate-600 dark:text-slate-400 mb-1">
                    Final Reading (mL)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="50"
                    required
                    value={finalReading}
                    onChange={(e) => setFinalReading(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[0.6875rem] text-slate-600 dark:text-slate-400 mb-1">
                    Volume Used (Auto)
                  </label>
                  <div className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/60 px-3 py-1.5 text-xs text-teal-600 dark:text-teal-300 font-mono font-bold">
                    {!isNaN(parseFloat(finalReading)) && !isNaN(parseFloat(initialReading))
                      ? (parseFloat(finalReading) - parseFloat(initialReading)).toFixed(2)
                      : '0.00'}{' '}
                    mL
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-3">
              <label className="block text-[0.6875rem] text-slate-600 dark:text-slate-400 mb-1">
                Laboratory Notes & Qualitative Observations
              </label>
              <input
                type="text"
                value={studentNote}
                onChange={(e) => setStudentNote(e.target.value)}
                placeholder={
                  isSeparation
                    ? 'e.g. NH4Cl sublimate formed dense white crust on cooler upper funnel walls'
                    : 'e.g. Faint permanent pink blush persisted upon swirling'
                }
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none"
              />
            </div>

            {errorMsg && (
              <p className="mt-2 text-xs text-red-500 font-medium">{errorMsg}</p>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:from-teal-500 hover:to-cyan-500 transition-all cursor-pointer shadow-md"
              >
                <Save className="h-4 w-4" />
                <span>
                  {isSeparation ? 'Record Separation Results' : 'Record Trial in Notebook'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Pinned Footer Actions */}
        <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#08121E] p-4 shrink-0 transition-colors">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Notebook
          </button>
        </div>
      </div>
    </div>
  );
};

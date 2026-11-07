import React from 'react';
import { Award, Printer, ShieldCheck } from 'lucide-react';
import type { VirtualLabReportData } from '../../services/virtual-lab.service';

interface LabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: VirtualLabReportData | null;
}

export const LabReportModal: React.FC<LabReportModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-hidden print:p-0 print:bg-white print:static print:inset-auto">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[94vh] rounded-2xl border border-slate-700 bg-white text-slate-900 shadow-2xl overflow-hidden print:border-none print:shadow-none print:m-0 print:p-6 print:max-h-none print:overflow-visible">
        {/* Actions Bar (Hidden during print) */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-5 shrink-0 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
              ✓ NCERT Standard Certified Record
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Code: {report.reportCode}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Scrollable Report Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 print:overflow-visible print:p-0">

        {/* Official Report Header */}
        <div className="border-b-2 border-slate-900 pb-5 text-center">
          <p className="text-xs font-bold tracking-widest text-slate-600 uppercase">
            PiyushDhara Virtual Laboratory System · CBSE / NCERT Practical Record
          </p>
          <h1 className="mt-1 text-2xl font-serif font-bold text-slate-950">
            DEPARTMENT OF {(report.experiment.subject || 'SCIENCE & PHYSICS').toUpperCase()} · PRACTICAL LABORATORY
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-700">
            {report.experiment.officialSourceReference.authority} ·{' '}
            {report.experiment.officialSourceReference.documentTitle} ({report.experiment.experimentId})
          </p>
        </div>

        {/* Student & Session Metadata Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs font-sans">
          <div>
            <span className="text-slate-500 block text-[0.6875rem] uppercase font-semibold">Student Name:</span>
            <span className="font-bold text-slate-900">{report.student.name}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[0.6875rem] uppercase font-semibold">Email / ID:</span>
            <span className="font-mono text-slate-800">{report.student.collegeEmail}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[0.6875rem] uppercase font-semibold">Date of Conduct:</span>
            <span className="text-slate-800">{new Date(report.generatedAt).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[0.6875rem] uppercase font-semibold">Academic Evaluation:</span>
            <span className="font-bold text-emerald-700">
              {report.academicScore.gradeAwarded} ({report.academicScore.totalScore} / 100)
            </span>
          </div>
        </div>

        {/* Section 1: Aim */}
        <div className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-1.5">
            1. Aim of the Experiment
          </h2>
          <p className="text-xs text-slate-900 leading-relaxed font-serif">
            {report.sections.aim}
          </p>
        </div>

        {/* Section 2: Principle & Chemical Equations */}
        <div className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-1.5">
            2. Principle & Stoichiometric Equations
          </h2>
          <p className="text-xs text-slate-800 leading-relaxed font-serif whitespace-pre-line mb-2">
            {report.sections.principle}
          </p>
          <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-300 font-mono text-xs text-slate-900 space-y-1">
            {report.sections.equations.map((eq, i) => (
              <p key={i} className="font-semibold">{eq}</p>
            ))}
          </div>
        </div>

        {/* Section 3: Apparatus & Chemicals */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-1.5">
              3. Apparatus Required
            </h2>
            <ul className="list-disc list-inside text-slate-800 space-y-0.5 text-[0.6875rem]">
              {report.sections.apparatusList.map((app, i) => (
                <li key={i}>{app}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-1.5">
              4. Chemicals & Reagents
            </h2>
            <ul className="list-disc list-inside text-slate-800 space-y-0.5 text-[0.6875rem]">
              {report.sections.reagentsList.map((reag, i) => (
                <li key={i}>{reag}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 4: Observation Table */}
        <div className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">
            5. Titration Observation Table
          </h2>
          <p className="text-[0.6875rem] text-slate-600 mb-1.5">
            Volume of standard 0.05 M oxalic acid pipetted out (V₁) = <strong>10.0 mL</strong> | Indicator: <strong>Phenolphthalein</strong>
          </p>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 font-semibold border-b border-slate-300">
              <tr>
                <th className="p-2 border-r border-slate-300">S.No.</th>
                <th className="p-2 border-r border-slate-300">Initial Burette Reading (mL)</th>
                <th className="p-2 border-r border-slate-300">Final Burette Reading (mL)</th>
                <th className="p-2">Volume of NaOH used (mL)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-[0.6875rem]">
              {report.sections.observationTable.map((row) => (
                <tr key={row.trialNumber}>
                  <td className="p-2 border-r border-slate-200 font-sans">Trial {row.trialNumber}</td>
                  <td className="p-2 border-r border-slate-200">{row.initialReadingMl.toFixed(2)}</td>
                  <td className="p-2 border-r border-slate-200">{row.finalReadingMl.toFixed(2)}</td>
                  <td className="p-2 font-bold text-slate-950">{row.volumeUsedMl.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs font-semibold text-slate-900">
            Concordant Volume of NaOH Solution Used (V₂) ={' '}
            <span className="font-mono text-teal-800 font-bold underline">
              {report.sections.concordantReadingMl.toFixed(2)} mL
            </span>
          </p>
        </div>

        {/* Section 5: Calculations */}
        <div className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-1.5">
            6. Calculations & Quantitative Derivation
          </h2>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-serif text-xs text-slate-800 space-y-1">
            <p className="font-semibold text-slate-900 font-sans">
              Formula: {report.sections.calculations.formulaUsed}
            </p>
            {report.sections.calculations.stepByStepText.map((step, i) => (
              <p key={i} className="text-[0.6875rem] leading-relaxed">{step}</p>
            ))}
          </div>
        </div>

        {/* Section 6: Certified Results */}
        <div className="mt-6 rounded-xl border-2 border-emerald-600 bg-emerald-50/70 p-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1 flex items-center gap-1.5">
            <Award className="h-4 w-4 text-emerald-700" />
            <span>7. Final Result & Certification</span>
          </h2>
          <p className="text-xs text-slate-900 leading-relaxed font-serif mt-1">
            {report.sections.resultSummary}
          </p>
        </div>

        {/* Section 7: Precautions */}
        <div className="mt-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-1.5">
            8. Precautions Observed
          </h2>
          <ul className="list-disc list-inside text-[0.6875rem] text-slate-700 space-y-0.5">
            {report.sections.precautionsNoted.map((prec, i) => (
              <li key={i}>{prec}</li>
            ))}
          </ul>
        </div>

        {/* Signatures Footer */}
        <div className="mt-8 pt-6 border-t border-slate-300 flex justify-between items-end text-xs text-slate-600">
          <div>
            <p className="font-semibold text-slate-800">Student Signature</p>
            <p className="text-[0.6875rem] font-mono mt-4 text-slate-500">
              Digitally Verified: {report.student.collegeEmail}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-slate-800">Teacher / Lab Examiner In-Charge</p>
            <div className="mt-4 flex items-center gap-1 text-emerald-700 font-semibold text-[0.6875rem]">
              <ShieldCheck className="h-4 w-4" />
              <span>Certified via PiyushDhara Virtual Labs</span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

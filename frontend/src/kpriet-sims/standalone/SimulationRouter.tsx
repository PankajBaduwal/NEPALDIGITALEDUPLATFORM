/**
 * Chooses the right workspace for a simulation id. This is KPRIET's own launch logic
 * (dashboard/frontend/src/pages/public/SimulationPlayerPage.tsx) with the sign-in / subscription checks removed —
 * the platform already requires a login before this page is ever opened.
 *
 *   Official virtual-lab experiments (EXP-…)  → VirtualLabWorkspace (own backend: /virtual-labs)
 *   Mechanics / Chemistry / Physics 3D labs   → their dedicated Three.js workspaces
 *   everything else                           → SimulationShell (parameters, metrics, canvas or studio)
 */
import React, { Suspense, lazy } from 'react';
import type { ISimulationDefinition } from '../types';
import { SimulationShell } from '../SimulationShell';
import { ChemistryVirtualLabWorkspace, type ChemSimId } from '../chemistry-3d';
import { MechanicsVirtualLabWorkspace, type MechanicsSimId } from '../mechanics-3d';
import { PhysicsVirtualLabWorkspace } from '../physics-3d/react/PhysicsVirtualLabWorkspace';
import { toPhysicsSimId } from '../u25rph01';
import { ALL_SIMULATIONS, findSimulation } from '../catalog';

const VirtualLabWorkspace = lazy(() => import('./kp/components/virtuallab/VirtualLabWorkspace').then((m) => ({ default: m.VirtualLabWorkspace })));

function resolveMechanicsSimId(cleanLower: string): MechanicsSimId {
  if (cleanLower.includes('cable')) return '02-cable-tensions';
  if (cleanLower.includes('fbd')) return '03-fbd-lab';
  if (cleanLower.includes('moment') || cleanLower.includes('varignon')) return '04-moments-couples';
  if (cleanLower.includes('support') || cleanLower.includes('reaction') || cleanLower.includes('beam')) return '05-support-reactions';
  if (cleanLower.includes('truss')) return '06-truss-analysis';
  if (cleanLower.includes('centroid')) return '07-composite-centroids';
  if (cleanLower.includes('inertia') || cleanLower.includes('gyration')) return '08-area-moments-inertia';
  if (cleanLower.includes('gravity') || cleanLower.includes('stability')) return '09-center-of-gravity';
  if (cleanLower.includes('incline') || cleanLower.includes('repose')) return '10-inclined-plane';
  if (cleanLower.includes('ladder')) return '11-ladder-friction';
  if (cleanLower.includes('wedge')) return '12-wedge-friction';
  if (cleanLower.includes('rolling') || cleanLower.includes('wheel')) return '13-rolling-resistance';
  if (cleanLower.includes('rectilinear')) return '14-rectilinear-motion';
  if (cleanLower.includes('projectile') || cleanLower.includes('curvilinear')) return '15-projectile-motion';
  if (cleanLower.includes('newton') || cleanLower.includes('atwood') || cleanLower.includes('connected')) return '16-newtons-second-law';
  if (cleanLower.includes('work-energy') || cleanLower.includes('spring')) return '17-work-energy';
  if (cleanLower.includes('impulse') || cleanLower.includes('restitution')) return '18-impulse-momentum';
  if (cleanLower.includes('rotation') || cleanLower.includes('flywheel')) return '19-rotational-dynamics';
  if (cleanLower.includes('impact') || cleanLower.includes('conservation')) return '20-impact-conservation';
  return '01-force-systems';
}

function resolveChemSimId(cleanLower: string): ChemSimId {
  let simType: ChemSimId = 'molecular-orbitals';
  if (cleanLower.includes('lead')) simType = 'lead-acid';
  else if (cleanLower.includes('fuel') || cleanLower.includes('pem')) simType = 'pem-fuel-cell';
  else if (cleanLower.includes('lithium')) simType = 'lithium-ion';
  else if (cleanLower.includes('stereo')) simType = 'stereochemistry';
  else if (cleanLower.includes('organic') || cleanLower.includes('sn1') || cleanLower.includes('sn2')) simType = 'organic-mechanisms';
  else if (cleanLower.includes('aromatic') || cleanLower.includes('benzene')) simType = 'aromatic-reactions';
  else if (cleanLower.includes('polymerization')) simType = 'polymerization';
  else if (cleanLower.includes('coordination') || cleanLower.includes('cft')) simType = 'coordination-chemistry';
  else if (cleanLower.includes('phase') || cleanLower.includes('triple')) simType = 'phase-transitions';
  else if (cleanLower.includes('adsorption') || cleanLower.includes('catalys')) simType = 'adsorption-catalysis';
  else if (cleanLower.includes('chromatograph') || cleanLower.includes('hplc') || cleanLower.includes('gc')) simType = 'chromatography';
  else if (cleanLower.includes('spectroscop') || cleanLower.includes('uv') || cleanLower.includes('nmr') || cleanLower.includes('ir')) simType = 'spectroscopy';
  else if (cleanLower.includes('orbital') || cleanLower.includes('hybrid')) simType = 'molecular-orbitals';
  return simType;
}

const has = (s: string, list: string[]) => list.some((x) => s.includes(x));

interface Props {
  id: string;
  onClose: () => void;
  onSelect: (id: string) => void;
}

export const SimulationRouter: React.FC<Props> = ({ id, onClose, onSelect }) => {
  const cleanId = id.trim();
  const upperId = cleanId.toUpperCase();
  const cleanLower = cleanId.toLowerCase();

  const isMechanics3DLab =
    cleanLower.startsWith('mech-') ||
    has(cleanLower, ['engineering-mechanics', 'mechanics-virtual-lab', 'force-system', 'cable-tension', 'fbd-lab', 'moment-couple', 'support-reaction', 'truss-analysis', 'composite-centroid', 'area-moment', 'center-of-gravity', 'inclined-plane', 'ladder-friction', 'wedge-friction', 'rolling-resistance', 'rectilinear-motion', 'projectile-motion', 'newtons-second-law', 'work-energy', 'impulse-momentum', 'rotational-dynamics', 'impact-conservation']);

  const isChem3DLab =
    ['chem-molecular-orbitals', 'chem-organic-mechanisms', 'chem-stereochemistry', 'chem-aromatic-reactions', 'chem-polymerization', 'chem-coordination-chemistry', 'chem-phase-transitions', 'chem-adsorption-catalysis', 'chem-chromatography', 'chem-spectroscopy', 'chem-lithium-ion-battery', 'chem-lead-acid-battery', 'chem-pem-fuel-cell'].includes(cleanLower) ||
    has(cleanLower, ['molecular-orbital', 'stereochem', 'organic-mech', 'aromatic', 'polymerization', 'coordination', 'phase-trans', 'adsorption', 'chromatograph', 'spectroscop', 'lithium-ion', 'lead-acid', 'pem-fuel-cell']);

  const isPhysics3DLab =
    cleanLower.startsWith('u25rph01') ||
    cleanLower.startsWith('ep-3d') ||
    has(cleanLower, ['material-testing', 'poisson-ratio', 'material-comparison', 'cantilever-beam', 'girders-mems', 'heat-transfer', 'thermal-expansion-lees-disc', 'lees-disc', 'surface-tension', 'poiseuille-viscosity', 'thermal-systems', 'ultrasonic-waves', 'piezo-magneto', 'ultrasonic-velocity', 'sonar-ranging', 'ndt-scanning', 'band-structure', 'carrier-concentration', 'carrier-transport-pn', 'zener-diode', 'semiconductor-devices', 'radiation-matter', 'laser-principles', 'co2-diode-laser', 'total-internal-reflection', 'fibre-endoscopy-sensors']);

  const isDedicatedVirtualLab = upperId.startsWith('EXP-') || cleanId === 'vl-g10-ohms-law' || cleanId === 'vl-eng-acid-base-titration';

  const fill = (node: React.ReactNode, cls = 'flex h-screen flex-col bg-white') => <div className={cls}>{node}</div>;

  if (isDedicatedVirtualLab) {
    const expId = upperId.startsWith('EXP-') ? upperId : cleanId === 'vl-g10-ohms-law' ? 'EXP-P10-01' : 'EXP-C11-02';
    return (
      <div className="h-full min-h-screen bg-[#07140D]">
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-slate-300">Opening virtual lab…</div>}>
          <VirtualLabWorkspace experimentId={expId} onExit={onClose} />
        </Suspense>
      </div>
    );
  }
  if (isMechanics3DLab) return fill(<MechanicsVirtualLabWorkspace initialSimId={resolveMechanicsSimId(cleanLower)} onBackToCourse={onClose} />);
  if (isChem3DLab) return fill(<ChemistryVirtualLabWorkspace initialSim={resolveChemSimId(cleanLower)} onExit={onClose} />);
  if (isPhysics3DLab) return fill(<PhysicsVirtualLabWorkspace initialSim={toPhysicsSimId(cleanLower)} onExit={onClose} />);

  const definition: ISimulationDefinition | undefined = findSimulation(cleanId) || ALL_SIMULATIONS.find((s) => s.id.toLowerCase() === cleanLower);
  if (!definition) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-4">
        <div role="alert" className="max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
          <p className="text-[1rem] font-semibold text-[#0B1220]">This item is not available in the player.</p>
          <button type="button" onClick={onClose} className="mt-4 text-[0.875rem] font-semibold text-[#047857] hover:underline">Back to simulations</button>
        </div>
      </div>
    );
  }

  // embed=1: shown inside a Smart Board partition (KPRIET behaviour) — full-bleed, no assistant, no board link, no close button
  const embedded = new URLSearchParams(window.location.search).get('embed') === '1';
  if (embedded) {
    return (
      <div className="flex h-screen flex-col bg-[#0F2419]">
        <SimulationShell definition={definition} hideAssistant hideSmartBoardLink embedded />
      </div>
    );
  }

  const d: any = definition;
  const siblings = ALL_SIMULATIONS.filter((s: any) => s.domain === d.domain && (s.category === d.category || (d.level && s.level === d.level)));
  return (
    <div className="flex h-screen flex-col bg-[#0F2419] p-2 sm:p-4">
      <div className="relative mx-auto flex h-full w-full max-w-[1600px] flex-col">
        <SimulationShell
          definition={definition}
          siblingSimulations={siblings}
          onSelectSimulation={(s) => onSelect(s.id)}
          onClose={onClose}
          hideAssistant
          hideSmartBoardLink
        />
      </div>
    </div>
  );
};

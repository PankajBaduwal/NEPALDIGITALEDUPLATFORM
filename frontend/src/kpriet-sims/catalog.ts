/**
 * Nepal Digital Education Platform ← simulations ported from the KPRIET project (copied, never linked).
 *
 * The code under this folder is a copy of KPRIET's `dashboard/frontend/src/simulations`. Only this file and the
 * two KPRIET-only screens (SimulationManager / SimulationAssignmentModal, which need KPRIET's own services)
 * differ. Everything else — engines, 3D labs, shell, parameters, formulas — runs exactly as it does in KPRIET.
 *
 * What this catalog exposes: every Physics, Mathematics and Chemistry simulation (college-level registry),
 * plus the school and Virtual Lab content (Classes 1–12).
 */
import type { ISimulationDefinition } from './types';
import { SIMULATION_REGISTRY, getSimulationById as registryById } from './registry';
import { SCHOOL_AND_LAB_SIMULATIONS } from './school';

export type SimSubject = 'PHYSICS' | 'CHEMISTRY' | 'MATHEMATICS';

const DOMAINS = new Set<string>(['PHYSICS', 'CHEMISTRY', 'MATHEMATICS']);

/** Registry simulations for the three subjects (superseded "legacy" entries are hidden, as in KPRIET). */
export const REGISTRY_SIMULATIONS: ISimulationDefinition[] = (() => {
  const seen = new Set<string>();
  return SIMULATION_REGISTRY.filter((s) => DOMAINS.has(s.domain) && !s.legacy && (seen.has(s.id) ? false : (seen.add(s.id), true)));
})();

/** School + Virtual Lab content (Classes 1–12 and the engineering-band labs). */
export const SCHOOL_SIMULATIONS = SCHOOL_AND_LAB_SIMULATIONS as unknown as Array<ISimulationDefinition & { level: string | null; subject: string; band: string; contentType: string }>;

export const ALL_SIMULATIONS: ISimulationDefinition[] = [...REGISTRY_SIMULATIONS, ...(SCHOOL_SIMULATIONS as ISimulationDefinition[])];

const byId = new Map<string, ISimulationDefinition>();
for (const s of ALL_SIMULATIONS) if (!byId.has(s.id)) byId.set(s.id, s);

export function findSimulation(id: string): ISimulationDefinition | undefined {
  return byId.get(id) || registryById(id);
}

/** Subject of a simulation for the "overall simulations" page. */
export function subjectOf(s: ISimulationDefinition & { subject?: string }): SimSubject | null {
  if (DOMAINS.has(s.domain as string)) return s.domain as SimSubject;
  const name = String(s.subject || '').toLowerCase();
  const id = String(s.id || '').toLowerCase();
  if (name.includes('chem') || /ph-indicators|acid-base|titration/.test(id)) return 'CHEMISTRY';
  if (name.includes('math')) return 'MATHEMATICS';
  if (name.includes('physic') || name.includes('science') || name.includes('electrical')) return 'PHYSICS';
  return null;
}

/** Class 1 and Class 2 simulations live inside their own class in the library, not in the overall subject pages. */
export const isEarlyClass = (s: any): boolean => s?.level === 'class-1' || s?.level === 'class-2';

/** Simulations for the overall Physics / Chemistry / Mathematics pages. */
export function overallSimulations(): ISimulationDefinition[] {
  return ALL_SIMULATIONS.filter((s) => !isEarlyClass(s) && subjectOf(s as any) !== null);
}

/** Human label of the class level (school) or "College level". */
export function levelLabelOf(s: any): string {
  const m = /^(class|grade)-(\d+)$/.exec(String(s?.level || ''));
  return m ? `Class ${m[2]}` : 'College level';
}

/**
 * Sends a simulation straight to the Smart Board, where it runs full-board with every sidebar tool usable over it.
 *
 *   /smartboard/index.html?simbg=/simulations/<id>/play?embed=1&title=…&id=<id>
 *
 * The simulation runs live behind the board's drawing layers (smartboard/components/sim-backdrop.js), so every sidebar
 * tool works over it. The board's older `embed` split-partition launch only supports pen, highlighter and eraser.
 *
 * The platform's sign-in token is also copied to `eduverse_token` (the key the board's guards read). The backend
 * answers the access check (/api/v1/simulations/:id/access) and serves /simulations/<id>/play, which hands over
 * to whatever runs the simulation.
 */
export const isKprietSimulation = (sim: { componentKey?: string } | null | undefined): boolean => Boolean(sim?.componentKey?.startsWith('kpriet:'));

export function launchOnSmartBoard(simulationId: string, title: string): void {
  try {
    const token = localStorage.getItem('nepal_edu_token');
    if (token) localStorage.setItem('eduverse_token', token);
  } catch {
    /* storage unavailable: the board will ask the user to sign in */
  }
  const qs = new URLSearchParams({
    simbg: `/simulations/${encodeURIComponent(simulationId)}/play?embed=1`,
    title: title.slice(0, 120),
    id: simulationId,
    returnUrl: window.location.pathname,
  });
  const w = window.open(`/smartboard/index.html?${qs.toString()}`, '_blank');
  if (!w) alert('The Smart Board could not open. Please allow pop-ups for this site and try again.');
}

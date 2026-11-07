/**
 * Sends a simulation ported from KPRIET straight to the Smart Board, in a split partition beside a whiteboard
 * (the Smart Board's own "embed" launch; the Smart Board app itself is unchanged).
 *
 *   /smartboard/index.html?embed=/simulations/<id>/play?embed=1&title=…&id=<id>
 *
 * The board's access guard reads the sign-in token under the key `eduverse_token`, so the platform's token is
 * copied there first (same browser, same site). The backend answers the guard (/api/v1/simulations/:id/access)
 * and serves /simulations/<id>/play, which hands over to the simulation page in embedded mode.
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
    embed: `/simulations/${encodeURIComponent(simulationId)}/play?embed=1`,
    title: title.slice(0, 120),
    id: simulationId,
    returnUrl: window.location.pathname,
  });
  const w = window.open(`/smartboard/index.html?${qs.toString()}`, '_blank');
  if (!w) alert('The Smart Board could not open. Please allow pop-ups for this site and try again.');
}

# Simulations ported from KPRIET

This folder is a **copy** of KPRIET's `dashboard/frontend/src/simulations` (KPRIET itself was only read, never changed).
Run on their own page (`/sim.html`, see `standalone/`) with KPRIET's own stylesheet, so they look and behave as in KPRIET.

## What differs from the originals
- `SimulationManager.tsx`, `SimulationAssignmentModal.tsx`, `index.ts` — not copied (KPRIET-only screens that need KPRIET services).
- `catalog.ts` — new: lists Physics / Chemistry / Mathematics simulations plus school content.
- `standalone/` — new: isolated host page, KPRIET's launch dispatcher (`SimulationRouter.tsx`), KPRIET's stylesheet copy,
  and `kp/` (copies of the Virtual Lab front-end and its helpers; `kp/lib/api/client.ts` talks to this platform's API).
- `simulation-ai-context.ts` — also looks for this platform's token key (`nepal_edu_token`).
- `SimulationShell.tsx` `isMechanics` — school catalogue simulations no longer open the college Mechanics studio just because
  their category contains the word "mechanics" (one guard line, marked `PORT NOTE`).
- `numerical-methods-pde`, `materials-metallurgy-3d`, `electrical-drives-3d` — the base class constructors called `initScene()`/`render()` before the
  subclass's own fields existed, so 12 simulations (U25MA402 sim-01..03, U25ME302 ×6, U25EE305 sim-02..04) could never start. Their factories now call a
  new `boot()` after construction (marked `PORT NOTE`).

## Backend counterpart
`backend/src/modules/virtual-lab` (+ models `VirtualLab*`), seeded by `src/scripts/seedVirtualLabExperiments.ts`;
Class 1–2 library entries seeded by `src/scripts/seedKprietClassSimulations.ts`.
Not ported: KPRIET's Mathematics Workspace (runs student code on the server) — see the project notes.

## Launch on Smart Board
Every simulation has a direct "Smart Board" button (Overall cards, player, library cards, preview window, student list).
`components/simulations/smartBoardLaunch.ts` opens `/smartboard/index.html?simbg=/simulations/<id>/play?embed=1&title=…&id=<id>`.

- `smartboard/components/sim-backdrop.js` (new, additive; one `<script>` line added to `smartboard/index.html`) runs the simulation live
  BEHIND the board's drawing layers, so every sidebar tool works over it (pen, highlighter, eraser, text, shapes and instruments,
  tables, undo/redo, pages). Select = click through to the simulation (or move your annotations after "Switch"); the pill closes it.
  It also swaps the default dark ink for a bright colour so writing shows on dark simulations.
  (The board's older `embed=` launch shows the simulation in a split partition, which only supports pen, highlighter and eraser.)
- Backend (`backend/src/modules/simulation-activity/simulation-launch.routes.ts`): `/simulations/<id>/play` redirects a library code,
  component key or ported id to whatever runs it (`/sim.html`, `/embed/simulation/<key>` for the platform's React simulations, or a
  static HTML page); `/api/v1/simulations/:id/access` is the access check. The platform sign-in token is copied to `eduverse_token`.

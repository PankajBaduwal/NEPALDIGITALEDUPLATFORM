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
Every ported simulation has a direct "Smart Board" button (Overall cards, player, Class 1–2 library cards, preview window, student list).
`components/simulations/smartBoardLaunch.ts` opens `/smartboard/index.html?embed=/simulations/<id>/play?embed=1&title=…&id=<id>` (the Smart Board app is
unchanged). The backend (`backend/src/modules/simulation-activity/simulation-launch.routes.ts`) serves `/simulations/<id>/play` (redirects to
`/sim.html?id=<id>&embed=1`, which runs the simulation full-bleed inside the board partition) and answers the board's access check
(`/api/v1/simulations/:id/access`, `/api/v1/simulations/entitlements`). The platform sign-in token is copied to `eduverse_token`, the key the board's guard reads.


# Platform regression test report

This work changes only frontend styling and one small shell script. No backend file, route, API, permission check or business rule was changed.

| Check | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | clean |
| Production build (`vite build`) | passes; main JS 119 KB gzipped, CSS 24 KB gzipped |
| Route list in `App.tsx` | unchanged |
| Role guards (`ProtectedRoute`) | unchanged |
| Demo login for Principal, School Admin, Teacher, Student, Super Admin and a class teacher | works; each lands on its dashboard |
| Every sidebar section opens (Principal 34, School Admin 16, Teacher 19, Student 13, Super Admin 13) | opens and renders at all tested widths |
| Class Teacher section and sub-tabs | open and render |
| Smart Board app | no file in `smartboard/` changed; it loads no platform CSS or script |
| Browser console on dashboards | no application errors; the only errors seen were 403s caused by my own test harness loading a role's page with a different role's token |

## Behaviour that is deliberately different

- Below 1024 px every dashboard sidebar is a drawer instead of a permanent column.
- On very large screens the interface is scaled up.
- On phones, grids stack and some wrapped controls take more lines.

## Not verified

- Create/edit/delete flows (forms were not submitted in this pass); backend behaviour is unchanged.
- The HOD dashboard and `/launchpad`, which were not swept (HOD functionality was not modified).
- Cross-browser behaviour: tested in the in-app Chromium browser only (not Safari or Firefox).
- Lighthouse scores.

# Route and device compatibility matrix

Method: real same-origin iframes at exact widths (and the browser pane at 360, 390, 768, 1366, 1920 and 3840). A cell is "pass" when the page's scroll width fits the viewport and no visible element is clipped past the right edge (elements inside a deliberate horizontal scroller and 3D-transformed decorations are excluded).

Widths for public pages: 360, 390, 430, 768, 1024, 1366, 1920, 2560, 3840, 5120. Widths for dashboards: 360, 768, 1024, 1366, 1920, 3840.

| Route | What was exercised | Result |
|---|---|---|
| `/` homepage | all sections, 10 widths | pass |
| `/login` | 10 widths | pass |
| `/super-admin-login` | 10 widths | pass |
| `/register` (and `/register-school`, `/register-institution`) | 10 widths | pass (after fix) |
| `/institution-registration-status` | 10 widths | pass |
| `/forgot-password` | 10 widths | pass |
| `/principal` | every sidebar section (34) at 6 widths | pass |
| `/school-admin` | every sidebar section (16) at 6 widths | pass (after fixes) |
| `/teacher` | every section incl. expanded groups (19) at 6 widths | pass |
| `/teacher` as a class teacher | Class Teacher section and its 4 sub-tabs at 4 widths | pass |
| `/student` | every section (13) at 6 widths | pass |
| `/super-admin` | every section (13) at 6 widths | pass |
| `/class-teacher`, `/hod`, `/launchpad`, `/reset-password` | not swept | not verified (shared layer applies; HOD functionality not modified) |
| `/smartboard/index.html` | out of scope | not touched |

## Not covered by the matrix

- Modals, drawers inside pages, dropdowns and validation-error states were checked only where a section opened them by default.
- Sections reached through in-page tabs deeper than the sidebar (other than the Class Teacher tabs) were not each opened.
- This checks horizontal fit, not every visual detail.

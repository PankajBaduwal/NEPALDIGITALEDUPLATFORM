# Desktop and laptop test report

Widths tested: 1024, 1180, 1280 (pane), 1366, 1440, 1920 (dashboards at 1024, 1366, 1920; School Admin extra at 1180 and 1440; public pages at 1024, 1366, 1920).

| Check | Result |
|---|---|
| Public pages (6 routes) | no overflow at any of these widths |
| Principal (34 sections) | no overflow at 1024, 1366, 1920 |
| School Admin (16 sections) | no overflow at 1024, 1180, 1366, 1440, 1920 (after two fixes below) |
| Teacher (19), Student (13), Super Admin (13) | no overflow at 1024, 1366, 1920 |
| Sidebar | stays visible from 1024 px; becomes a drawer below 1024 |
| Layout | content area uses the remaining width; stat-card rows grow to more columns from 1650 px |

## Defects found in this pass and fixed

1. School Admin sections (Institution Dashboard, Classes & Sections, Academic Curriculum & Subjects, Quiz Assessment, Feature Access Control) were wider than a 1024-1440 px screen. Cause: the content column could not shrink. Fixed for all widths.
2. The wide "Feature Access Control" matrix overflowed at 1366-1440 px. Fixed by making any table's container scroll sideways when needed.

## Not verified

- Operating-system scaling and browser zoom at 125%, 150% and 200% were not tested (the layout is viewport-based, so zoom changes the effective width; the 1024-1366 results are the closest proxy).
- Keyboard-only walkthrough of every page. The new drawer was tested for keyboard behaviour (Escape closes and returns focus).

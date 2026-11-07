# Platform responsiveness audit

Scope: every page of the React platform. The Smart Board teaching app (`/smartboard/index.html`, folder `smartboard/`) is out of scope and was not opened for editing.

## How the platform is built

- React 19 + TypeScript + Vite, React Router. Pages are very large files with inline styles (Principal 5.8k lines, Teacher 8.9k, School Admin 6.4k, Student 3.3k, Super Admin 3.2k), plus Tailwind utility classes in the Principal dashboard.
- Each dashboard builds its own sidebar (`<aside>`) and header. Only Super Admin already had a mobile drawer (`.sa-sidebar` + `superAdminResponsive.css`).
- There was no shared responsive layer. `index.css`, `theme.css` held 4 and 2 media queries.

## Baseline measured before any change (phone, 360 px wide)

"Forced width" is the layout width the page needed, i.e. how far it pushed past the screen.

| Page | Forced width | Cause |
|---|---|---|
| Principal | 612 px | fixed 260 px sidebar always open; 30 elements overflowing |
| School Admin | 1211 px | fixed sidebar and a content column that could not shrink |
| Student | 637 px | fixed sidebar, 19 overflowing elements |
| Teacher | 823 px | fixed sidebar, 67 overflowing elements |
| Super Admin | 437 px | drawer existed, but 54 elements still overflowed (tables, grids) |
| Class Teacher (inside the Teacher dashboard) | fits | no issue found |
| Large screens (1920 px and up) | n/a | content simply stretched; nothing used the extra space or scaled for distance |

## Root causes found

1. Sidebars were permanent, with no small-screen mode (4 of 5 dashboards).
2. The main content column was a flex item with `min-width: auto`, so one wide child forced the whole page wider (all dashboards).
3. Rigid flex rows, `white-space: nowrap` text and fixed-height headers in headers and banners.
4. Inline multi-column grids with no stacking behaviour; wide tables not in a scroll container (School Admin "Feature Access Control").
5. Registration page split layout (`1fr 2fr`) clipped by about 27 px at tablet width; decorative orb on the login page caused an 11 px sideways scroll on phones; homepage header text too wide at 360 px.
6. Nothing on large touch displays: no scaling, no fullscreen control, no larger touch targets.

## Findings that were not defects

- Homepage decorative 3D-rotated tiles report a bounding box wider than the screen; the page itself does not overflow.
- Recharts charts already use `ResponsiveContainer`.

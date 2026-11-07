# Existing layout component map

| Area | Where | Notes |
|---|---|---|
| App shell / routes | `frontend/src/App.tsx` | dashboards and registration pages are lazy-loaded (earlier change) |
| Principal dashboard | `pages/PrincipalDashboard.tsx` | `<header>` + `<aside>` (260 px) + `<main>`; Tailwind classes plus inline styles |
| School Admin dashboard | `pages/SchoolAdminDashboard.tsx` | `<aside>` 260 px, content column `flex: 1` |
| Teacher dashboard (also hosts the Class Teacher workspace) | `pages/TeacherDashboard.tsx` | collapsible `<aside>` (72/260 px); groups are clickable headers, not buttons |
| Student dashboard | `pages/StudentDashboard.tsx` | collapsible `<aside>` (72/250 px) |
| Super Admin dashboard | `pages/SuperAdminDashboard.tsx` + `pages/superAdminResponsive.css` | `.sa-sidebar` drawer already existed; `.sa-root` grid-collapse rules |
| Class Teacher route | `pages/ClassTeacherDashboard.tsx` | thin wrapper around `ClassTeacherSectionPanel` |
| Demo banner | `components/common/DemoBanner.tsx` | now has class `demo-banner` |
| Tables, charts | per page; charts use Recharts `ResponsiveContainer` | |
| Public homepage | `pages/public/PublicHomePage.tsx`, `pages/public/home/*`, `home.css` | own responsive CSS (scoped `.nh`) |
| Shared theme | `index.css`, `theme.css`, `tailwind.css` | palette and page background |
| Smart Board app | `smartboard/`, served at `/smartboard/index.html` | separate page; does not import any platform CSS; untouched |

## Added by this work

| File | Purpose |
|---|---|
| `frontend/src/responsive.css` | the shared responsive layer (drawer, stacking, tables, touch, large-display scale) |
| `frontend/src/utils/responsiveShell.ts` | adds the Menu button, overlay and fullscreen button; opens and closes the drawer |
| `frontend/src/main.tsx` | imports the CSS and starts the shell |
| `frontend/src/components/common/DemoBanner.tsx` | one class name added |
| `frontend/src/pages/public/home/home.css` | phone header fix |

# Homepage component mapping

## New files (`frontend/src/pages/public/home/`)

| File | Contents |
|---|---|
| `home.css` | Design tokens and all homepage styles, scoped under `.nh`. Reduced-motion rules at the bottom. |
| `hooks.tsx` | `useInView`, `Reveal`, `useCountUp`, `reducedMotion`, and `HomeCtx` (shared actions: demo, login, register, scroll, curriculum level). |
| `visuals.tsx` | Nepal map and pins, Himalayan peaks, Smart Board screen, floating hero cards, mini 3D visuals for feature cards. |
| `HomeHeader.tsx` | Sticky header, dropdowns, mobile drawer, active-section highlight. |
| `Hero.tsx` | Hero copy, CTAs, trust chips, 3D scene with pointer parallax. |
| `ProductPreview.tsx` | 5-tab preview (accessible tablist, arrow-key navigation). |
| `Features.tsx` | `Features` (6 cards) and `Studios` (4 cards). |
| `Roles.tsx` | 6 role cards with Launch Demo and Login. |
| `Curriculum.tsx` | Level, class, medium and subject explorer using live curriculum data. |
| `Showcase.tsx` | `SmartBoardShowcase`, `Stats` (live figures), `Connectivity`. |
| `Closing.tsx` | `Faq`, `FinalCta`, `HomeFooter`. |

`PublicHomePage.tsx` now composes these, owns the demo modal and tour modal, and lazy-loads everything below the preview.

## Old section to new section

| Old homepage | New |
|---|---|
| Navbar (flat links) | `HomeHeader` (Features, Platform Studios, Role Portals, CDC Curriculum dropdowns, FAQ) |
| Hero + hero image + "Dhambojhi Model Secondary School" card | `Hero` (the school card was dropped; it presented a demo school as a live session) |
| Platform Tour Video modal | Kept (`tour` action: "Watch the platform tour"), reworded |
| Features (5 cards) | `Features` (6 cards; "Academic Administration" etc. preserved, Attendance & Analytics added) |
| Interactive suite (5 tabs with photos) | `ProductPreview` (component mock-ups) plus `SmartBoardShowcase` |
| Role portals (6 cards) | `Roles` (same 6 roles) |
| Curriculum (hard-coded Class 9–10 subject list) | `Curriculum` (live from `/curriculum/subjects?grade=N`) |
| Stats (invented numbers) | `Stats` (live from `/public/overview`) |
| FAQ (6 questions) | `Faq` (8 questions) |
| CTA | `FinalCta` |
| Footer | `HomeFooter` |

## Where every button goes

| Action | Destination |
|---|---|
| Login | `/login` |
| MoEST Login | `/super-admin-login` |
| Register School / Register Your School | `/register` |
| Registration Status | `/institution-registration-status` |
| Demo Portals / Launch Interactive Demo | `DemoRoleModal` (existing) |
| Role card "Launch Demo" | `demoLogin(role)` then the role's route (`/principal`, `/school-admin`, `/teacher`, `/student`, `/super-admin`); on failure the demo modal opens |
| Smart Board buttons | `/smartboard/index.html` (new tab) |
| Studio buttons | Smart Board, or the teacher / student / school-admin demo |
| Curriculum "Read the textbooks" | Student demo |
| Header dropdown items, footer links | In-page anchors, or the actions above |

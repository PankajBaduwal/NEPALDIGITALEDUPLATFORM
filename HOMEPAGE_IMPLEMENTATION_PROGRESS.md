# Homepage implementation progress

| Phase | Status | Notes |
|---|---|---|
| 1. Audit | Done | Old page was a 2,700-line inline-styled file. Found unverifiable claims, fabricated statistics, a hard-coded curriculum list, dead legal links, and a broken student demo account. |
| 2. Design system | Done | `home.css`, scoped under `.nh`. |
| 3. Header and hero | Done | Four dropdowns, mobile drawer, CSS-3D Smart Board hero with parallax. |
| 4. Interactive product preview | Done | Five tabs, component-based previews with sample figures (labelled as illustrative). Real screenshots were not available. |
| 5. Features and studios | Done | 6 feature cards with 3D visuals; 4 studios with working buttons. |
| 6. Role portals | Done | Six cards; Launch Demo uses the existing demo login. |
| 7. Curriculum showcase | Done | Level to class to subject to textbook info, English/Nepali filter, live data. A textbook PDF is not opened from the homepage. |
| 8. Smart Board showcase | Done | Split layout; links to the existing Smart Board. |
| 9. Statistics and connectivity | Done | Live counts; connectivity claims limited to what the platform does. |
| 10. FAQ, CTA, footer | Done | Legal column deliberately omitted (no real documents). |
| 11. Motion and optimisation | Done | CSS-only 3D, lazy sections, reduced-motion support, route-level code splitting. |
| 12. Testing | Mostly done | See `HOMEPAGE_TEST_REPORT.md` for what was and was not verified. |

## Departures from the brief

- Three.js / React Three Fiber / Framer Motion not used: CSS 3D gives the requested look with no dependency and no GPU requirement.
- shadcn/ui is not part of this project, so it was not reused.
- "Real screenshots or faithful previews": previews are component-based with sample numbers, because the dashboards need a login to capture.
- Statistics are live counts, which are small (for example 9 institutions), instead of the old invented national figures.
- Legal footer column omitted until real documents exist.
- Screenshots were reviewed but not saved as files.

## Related fixes outside the homepage

- Student demo account (`dhambojhi_s_163` did not exist): fixed in `DemoRoleModal.tsx` and `auth.service.ts`; unknown demo names now return 404 instead of 500.
- `App.tsx`: dashboards and registration pages lazy-loaded.
- New backend route `GET /api/v1/public/overview`.

## Open items for you

1. Approve the removal of the claims listed in `HOMEPAGE_REDESIGN_PLAN.md`.
2. Provide Privacy Policy and Terms (or confirm they should be added later) for the footer.
3. Provide contact details and social links if they should appear in the footer.
4. Run Lighthouse on the production build.

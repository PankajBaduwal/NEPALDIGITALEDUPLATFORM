# Homepage test report

Tested in the in-app browser against the running dev servers (frontend 3000, backend 5000). Method: DOM checks and clicks through script, plus visual checks on screenshots. Screenshots were reviewed during testing but not saved as files.

## Passed

| Check | Result |
|---|---|
| TypeScript (`tsc --noEmit`) | Clean |
| Production build (`vite build`) | Passes |
| Header dropdown, CDC Curriculum, Basic | Switches level, shows Classes 6–8, loads 8 live subjects, scrolls to the section |
| Login button | `/login` |
| Register School button | `/register` |
| MoEST Login (Super Admin card) | `/super-admin-login` |
| Demo Portals | Opens the existing demo modal |
| Role card Launch Demo: Student, Principal, Teacher, School Admin | Landed on `/student`, `/principal`, `/teacher`, `/school-admin`; dashboards rendered |
| FAQ accordion | One item open at a time |
| Product preview tabs | Render; arrow-key navigation implemented |
| Live statistics | 9 institutions, 266 students, 41 teachers, 5 of 77 districts, 44 subjects, 129 textbooks; counters animate on entering view |
| Horizontal overflow at 375 px | None, checked in every section |
| Horizontal overflow at 1280 px and 1440 px | None (a 3 px header overflow at 1440 px was found and fixed) |
| Mobile drawer | Opens; 21 menu items plus Demo Portals, Login, Register School |
| Reduced-motion CSS rule | Present in the loaded stylesheet |
| Dashboards through lazy routes | Principal, Teacher and School Admin rendered |

## Bugs found and fixed during testing

1. **Student demo returned 500** (existing bug): the demo account `dhambojhi_s_163` does not exist. Modal and server now use `dhambojhi_s_002`; unknown names return 404.
2. Header overflowed by 3 px at 1440 px and nav labels wrapped: breakpoints and widths adjusted.
3. Nepal map was hidden behind the Smart Board in the hero: repositioned.
4. Curriculum "Try again" button did nothing: fixed with a retry counter.

## Not verified

- Real devices (phones, low-end laptops); the mobile and tablet checks used browser emulation.
- Tablet width (768 px) was not separately inspected.
- Actual `prefers-reduced-motion` behaviour: the rule exists, but the OS setting could not be toggled from this environment.
- Screen-reader testing and a Lighthouse run. See the performance report.
- The old "Smart Board" link target (`/smartboard/index.html`) was not opened in this test.
- Keyboard-only navigation was implemented (Escape closes menus, arrow keys on tabs, skip link, focus rings) but not exercised end to end.
- The browser console still lists three errors (one 500 from the old demo-login bug, two 502s while the backend restarted after edits); none reproduced on a fresh load.

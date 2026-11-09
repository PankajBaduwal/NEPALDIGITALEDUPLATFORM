# Homepage redesign plan

Scope: the public homepage at `/` (`frontend/src/pages/public/PublicHomePage.tsx` and `frontend/src/pages/public/home/`). Stack unchanged: React 19, TypeScript, Vite, React Router. The previous page is kept as `frontend/src/pages/public/PublicHomePage.previous.bak` for rollback.

## Technology choices (and one deviation from the brief)

- **No new dependencies.** 3D effects use CSS 3D transforms (`perspective`, `translateZ`, `rotateX/Y`) and CSS keyframes. Scroll reveals and counters use `IntersectionObserver` and `requestAnimationFrame`.
- **No Three.js, React Three Fiber, Framer Motion or Lottie.** The brief allowed "the smallest appropriate set". Every visual here is a tilted UI mock or a floating card, which CSS handles without a WebGL canvas, a 600 KB+ library or a GPU requirement on rural devices. If true 3D models are wanted later, add `@react-three/fiber` behind a dynamic import.
- **shadcn/ui is not installed** in this project (`components/ui` holds hand-written components). The homepage uses its own scoped stylesheet (`home.css`, every rule under `.nh`) so dashboard styles are untouched. Tailwind is present but the page does not need it.
- Fonts added in `index.html`: Manrope (English headings and body), Noto Sans Devanagari (Nepali). Inter stays as the fallback.

## Design system

Revised after review to match the supplied reference (a teal-and-mint EdTech dashboard): **deep teal and mint on soft white, with a serif display font.**

- Headings: Newsreader (serif), bold first clause and regular weight for the rest, in deep teal `#0f4c4a`. Body and UI: Manrope.
- Primary: deep teal `#0f4c4a` for buttons; mint `#1fb589` / `#2bcb97` for accents, the highlighted dashboard card and icons.
- Backgrounds: soft white `#f8fcfb`, alternating with pale mint `#e9f6f1`; dark sections and the footer use `#062b2a` / `#0b3f3d`.
- Chart accents (amber, red, purple) appear only inside the dashboard charts, as in the reference. Small Nepal-red touches remain in the logo pennant.
- Layout follows the reference: centred hero, then a large soft-mint frame holding a white dashboard (sidebar, greeting, donut and line charts, solid mint highlight card, recent-people list, floating ring card).
- Photos: the Smart Board section uses the supplied classroom photo (`public/assets/brand/smart_classroom.webp`); the final call to action sits on the supplied glowing-book image (`book_knowledge.webp`).
- The earlier saffron/charcoal palette was replaced at the user's request.

### Real map and real mountains

- **Nepal map:** the seven provinces are drawn from official boundary data (geoBoundaries gbOpen NPL ADM1, derived from the Survey Department of Nepal / OCHA, licence CC BY 3.0 IGO), converted to compact SVG paths in `home/nepalMap.ts`. Attribution is printed under the connectivity map.
- **Mountains:** the photo strip and traced ridge were tried and dropped as unattractive. Every section boundary is a soft, shallow curve with a feathered (blurred) edge, so there is no hard line and no gold outline; it leans left or right on alternate sections. The hero ends in the same kind of curve.
- **Section dividers:** each section draws its own background colour as a curved lip over the bottom of the section above (`.nh-sec::before` with an SVG mask in `home.css`). Neighbouring sections alternate between cream and a deeper peach, with maroon for the Smart Board section and footer, so the curves are visible.

## Section order

1. Sticky header with four dropdown menus, FAQ, flag chip, Demo Portals / Login / Register School, mobile drawer.
2. Hero with the CSS-3D Smart Board scene.
3. Interactive platform preview (5 tabs).
4. Features (6 cards), Platform Studios (4 cards).
5. Role portals (6 cards).
6. CDC curriculum explorer (live data).
7. Smart Board showcase.
8. Live platform figures, connectivity section.
9. FAQ (8 questions), final registration CTA, footer.

## Content decisions: claims removed or softened (needs your approval)

The old page made claims the platform cannot back up. They were reworded, not kept:

| Old wording | New wording | Reason |
|---|---|---|
| "CDC APPROVED" | "CDC CURRICULUM ALIGNED" | No documented approval. |
| "Yes, 100%… mandated by MoEST and the CDC" | Aligned to the framework; no official certification claimed | Unverifiable. |
| "Zero hallucination" / "Anti-Hallucination AI" | "Textbook-grounded AI with source references"; FAQ says AI can still make mistakes | No validation supports the claim. |
| "1,200+ schools, 2,50,000+ students, 15,000+ teachers, 77/77 districts" | Live counts from the database (`GET /api/v1/public/overview`), labelled "includes demonstration institutions" | Figures were invented. |
| "ISO 27001", "256-bit TLS", "Government of Nepal Standard", "National EMIS Compliant" | Removed | No evidence of certification. |
| "MoEST EMIS Integration: 1-click export" | Removed | Not implemented. |
| "Plagiarism detection" | Removed | Not found in the platform. |
| "Works reliably over 3G/4G in Himalayan municipalities" | Specific, true statements (byte-range PDF streaming, responsive layouts, no offline mode) | Unmeasured claim. |
| Footer address "Sanothimi, Bhaktapur & Singha Durbar" | Removed | Invented government affiliation. |

**Not included:** the "Legal" footer column (Privacy Policy, Terms, Academic Service Terms). The old links went nowhere and there are no real documents or routes. Add them when the documents exist. Contact details and social links are also omitted because none are configured.

## Backend changes (small)

- `GET /api/v1/public/overview`: anonymous, rate-limited, 5-minute cache, returns counts only.
- Demo login: the student demo account `dhambojhi_s_163` did not exist, so the existing student demo returned a 500. Fixed the modal and the server's candidate list to use `dhambojhi_s_002`, and an unknown demo name now returns 404 instead of trying to create a user with an invalid role.

## Other change

`App.tsx` now lazy-loads dashboards and registration pages. Routes and role guards are unchanged.

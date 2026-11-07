# Homepage performance report

No Lighthouse run was possible in this environment, so there are no Lighthouse scores. These are build measurements and design choices only.

## Bundle size (gzip)

| | Before | After |
|---|---|---|
| Main JS that every visitor downloads | 619.6 KB (one 2.66 MB bundle containing every dashboard) | 111.0 KB |
| Homepage below-the-fold chunks | none | Roles 1.6 KB, Curriculum 2.4 KB, Features 2.4 KB, Showcase 2.8 KB, Closing 3.1 KB |
| Dashboards | in main bundle | separate chunks, loaded on route: Student 27 KB, Principal 48 KB, School Admin 46 KB, Super Admin 50 KB, Teacher 81 KB, others smaller |

The big saving comes from lazy-loading dashboards in `App.tsx`, not from the redesign itself.

## Techniques used

- **No WebGL and no new libraries.** All 3D is CSS transforms; zero added JavaScript for the effects beyond small hooks.
- **Lazy sections.** Everything below the product preview mounts when it comes within 900 px of the viewport, with reserved height so the page does not jump. After first paint the browser's idle time pre-fetches the chunks, so scrolling stays smooth. Anchor links force-mount all sections and retry until the target exists.
- **Animation cost.** Only `transform` and `opacity` are animated. The hero parallax updates two CSS variables once per animation frame and only on large screens with a pointer (`hover: hover`). Below 1000 px the tilt is off and some floating cards are hidden. Below 640 px the floating cards and 3D perspective are removed.
- **Reduced motion.** Under `prefers-reduced-motion: reduce` all animation and transitions stop, scroll reveals show immediately, and smooth scrolling is off.
- **Live data is light.** `/public/overview` is cached on the server for 5 minutes and rate-limited. Curriculum subjects are fetched per class on demand and cached in memory.
- **Fonts.** Google Fonts with `display=swap`. Manrope and Noto Sans Devanagari are two extra families; self-hosting them would remove a third-party request.

## Known limits and next steps

- The hero includes a few `backdrop-filter` surfaces. They are fine on modern devices but are the first thing to drop on very low-end phones.
- The page still has no responsive image formats because it uses almost no raster images; the one photo (tour modal) is `loading="lazy"`. Convert it to WebP if it becomes prominent.
- `index-*.js` (111 KB gzip) still includes shared libraries (React Router, auth, API client, dialogs). `pdfjs` loads only with the PDF reader.
- To get real numbers, run Lighthouse on the production build (`npm run build && npm run preview`) in Chrome mobile mode.

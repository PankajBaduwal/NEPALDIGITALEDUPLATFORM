# Responsive implementation report

## Approach

One responsive platform, not separate sites. The dashboards are huge inline-styled files, so instead of rewriting each page I added a shared layer that every portal loads: `src/responsive.css` and `src/utils/responsiveShell.ts`, imported in `main.tsx`. Business logic, routes, APIs and permissions are untouched. The Smart Board app does not load this layer.

Profiles use the real viewport width and input type, not an assumed screen size (a 65-inch and 86-inch board can both be 1920 x 1080):

| Profile | Rule |
|---|---|
| Phone / large phone | below 760 px |
| Tablet | 760-1023 px |
| Laptop / desktop | 1024 px and up |
| 1080p board | touch pointer from 1500 px |
| Large display | 2400, 3000, 3600 and 4600 px steps |

## What the layer does

1. **Adaptive navigation (below 1024 px).** Every dashboard sidebar becomes a slide-in drawer, with a 44 x 44 px Menu button and a dimmed overlay. It closes on overlay click, Escape (focus returns to the button), choosing a section, or growing the window past 1024 px. It adds `aria-expanded` and labels. Super Admin keeps its own existing drawer.
2. **Content that shrinks.** Flex content columns can shrink below their widest child (the main cause of pages forced wider than the screen).
3. **Stacking on small screens.** Inline multi-column grids become auto-fitting columns; split layouts (`1fr 2fr`, `2fr 1fr`) stack below 1024 px; rigid flex rows wrap; `nowrap` text wraps; fixed-height headers grow; modals never exceed the screen (92% height, scrollable).
4. **Tables.** A table's container scrolls sideways when the table is wider than it; on phones and tablets tables scroll in place. No columns or data were removed.
5. **Forms.** Inputs are 16 px on phones (stops iOS zoom-on-focus); on touch screens inputs and selects are at least 44 px tall; sidebar rows are 48 px; header buttons 44 px.
6. **Large displays.** The whole interface scales in steps (1.12 on 1080p+ touch boards, 1.3 / 1.55 / 1.8 / 2.2 at 2400 / 3000 / 3600 / 4600 px). The layout width stays large, so wide tables and card rows use the space: card rows switch to auto-fit at 1650 px and two-up grids widen at 2200 px. A fullscreen button appears on large touch displays and 2400 px+ screens.
7. **Print.** Drawer controls hidden, scale reset.
8. **Reduced motion.** Drawer and overlay transitions stop.

## Page-specific fixes

- Homepage: header text fits 360 px; buttons wrap.
- Login: decorative orbs hidden on phones (they caused an 11 px sideways scroll).
- Registration: split layout stacks below 1024 px (it was clipped by ~27 px at tablet width).
- Demo banner: padded so it does not sit under the Menu button.

## Decisions to know about

- **CSS `zoom` for large displays.** Supported by Chrome, Edge, Safari and Firefox 126+. The step values are reasoned defaults, not tuned on real boards; they are single lines in `responsive.css` to adjust.
- **Attribute selectors on inline styles.** This is how the existing Super Admin layer already works. It is robust to the current code but means a page that changes its inline grid strings may need its rule revisited.
- **No per-page card layouts for tables on phones.** Tables scroll sideways in place instead.

## Size

`responsive.css` is 8 KB (about 2 KB gzipped); `responsiveShell.ts` 4 KB. The main JS bundle is 119 KB gzipped.

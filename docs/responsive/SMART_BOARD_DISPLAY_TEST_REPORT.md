# Large display (Smart Board class) test report

**Important:** this was tested with browser viewport emulation only. No physical Smart Board or interactive display was available. Viewport tests do not prove compatibility with every board's browser, touch driver or scaling.

## Widths tested

1920 x 1080, 2560, 3440 (ultra-wide), 3840 x 2160 and 5120 (public pages and all dashboards at 1920 and 3840; public pages also at 2560, 3440 and 5120).

## Results

| Check | Result |
|---|---|
| Horizontal overflow, public pages at 1920 / 2560 / 3440 / 3840 / 5120 | none |
| Horizontal overflow, all five dashboards at 1920 and 3840 (every sidebar section) | none |
| Interface scale at 3840 px | 1.8 (confirmed in the browser: `zoom: 1.8`), sidebar and content in good proportion |
| Interface scale at 5120 px | 2.2 (confirmed) |
| Content use of space at 3840 px | Principal showed six stat cards in a row and a wide chart row; no empty bands |
| Fullscreen button | appears at 2400 px and above (confirmed at 3840 px); toggles browser fullscreen |
| Sidebar on large displays | stays expanded, scaled with the page |
| Smart Board teaching app | untouched (no file in `smartboard/` changed) |

## Not verified

- Real touch behaviour: the browser pane cannot emulate `pointer: coarse`, so the larger touch-target rules (44-48 px) were checked in code and by element size on the Menu button (44 x 44), not on a touch screen.
- Hover-only interactions: there was no audit of every page for controls that appear only on hover; the shared rules do not remove hover effects.
- 98-, 100- and 105-inch boards at their real pixel counts and operating-system scaling (100-200%).
- Fullscreen on boards whose browsers block the Fullscreen API.
- 1080p touch boards get a 1.12 scale only if the browser reports a coarse pointer; a board that reports a mouse will show the normal desktop scale at 1920 px.

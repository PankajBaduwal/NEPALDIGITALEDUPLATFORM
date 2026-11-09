# Smart Board — desktop launcher

Two ways to open the Smart Board, both work on their own:

1. **On its own:** double-click **`Launch.vbs`** (in this folder), or the **Nepal Smart Board** shortcut it puts on your Desktop.
2. **From the dashboard:** the teacher dashboard has a **Desktop** button (top bar), **Smart Board on Desktop** (side menu) and **Desktop app** (inside the Launch Smart Board dialog). They open this same desktop app.

## First time only
Double-click `Launch.vbs` once. It sets up, for your Windows user only (no administrator needed):
- the `nepalsmartboard://` link that the dashboard's Desktop button uses, and
- a **Nepal Smart Board** shortcut on the Desktop.

The first time the dashboard button is used, Edge/Chrome asks whether to allow opening "wscript" — choose **Allow** (tick "Always allow" to stop it asking). If you move this folder, run `Launch.vbs` again once so the link points to the new place.

## What the desktop board is
- A plain Smart Board in its own window: no sign-in, no backend and no internet needed to draw, use shapes, text, the calculator, pages and History, or to save/export.
- Boards and History are kept on this PC in `%LOCALAPPDATA%\NepalSmartBoard\profile`, separate from the browser and from the board opened from the platform.
- Things that need the platform (textbooks, library simulations, cloud save, AI assistant, class sessions) only work in the board opened from the dashboard's **Launch Smart Board** (web) button.
- Needs Node.js and Microsoft Edge or Google Chrome.

## If something goes wrong
- Run `node launcher.js` in this folder to see messages, or read `%LOCALAPPDATA%\NepalSmartBoard\launcher.log`.
- `cscript Launch.vbs /dry` shows what would be set up without changing anything.

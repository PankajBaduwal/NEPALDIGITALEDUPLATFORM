/**
 * Opens the Smart Board desktop app on this computer.
 *
 * A website cannot start a program itself, so this uses the custom link `nepalsmartboard://open`. Windows hands that
 * link to the Smart Board launcher (smartboard/Launch.vbs), which registers the link the first time it is run.
 * If the desktop app has never been run on this computer nothing happens, so after a short wait the caller is
 * told how to set it up (onNotOpened).
 */
export function launchDesktopSmartBoard(onNotOpened?: () => void): void {
  let handedOver = false;
  const mark = () => { handedOver = true; };
  // when the browser passes the link to another program, the page loses focus / is hidden
  window.addEventListener('blur', mark, { once: true });
  const onVis = () => { if (document.visibilityState === 'hidden') handedOver = true; };
  document.addEventListener('visibilitychange', onVis, { once: true });

  const a = document.createElement('a');
  a.href = 'nepalsmartboard://open';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  window.setTimeout(() => {
    window.removeEventListener('blur', mark);
    document.removeEventListener('visibilitychange', onVis);
    if (!handedOver && onNotOpened) onNotOpened();
  }, 2500);
}

export const DESKTOP_SETUP_HINT =
  'Desktop Smart Board not set up yet: open the "smartboard" folder and double-click Launch.vbs once. After that this button opens it.';

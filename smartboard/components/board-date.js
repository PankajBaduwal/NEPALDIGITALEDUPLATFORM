/**
 * Today's date in the top-right corner of the board while it is in fullscreen:
 *   Sun, 8 Nov 2026
 *   22 Kartik 2083 BS
 * The Bikram Sambat line uses the nepali-date-converter build in assets/vendor (MIT); if it is unavailable the English
 * date still shows. It refreshes every minute so it changes at midnight without a reload. Additive: no other board code is touched.
 */
(function () {
  'use strict';

  function bsText(d) {
    try {
      var ND = window.NepaliDate && (window.NepaliDate.default || window.NepaliDate);
      if (!ND) return '';
      return new ND(d).format('DD MMMM YYYY') + ' BS';
    } catch (e) {
      return '';
    }
  }

  function adText(d) {
    try {
      return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).replace(/^(\w{3}) /, '$1, ');
    } catch (e) {
      return d.toDateString();
    }
  }

  var chip = null;

  function render() {
    if (!chip) return;
    var now = new Date();
    var bs = bsText(now);
    chip.innerHTML = '<span class="sbd-ad"></span>' + (bs ? '<span class="sbd-bs"></span>' : '');
    chip.querySelector('.sbd-ad').textContent = adText(now);
    if (bs) chip.querySelector('.sbd-bs').textContent = bs;
    chip.title = adText(now) + (bs ? ' · ' + bs : '');
  }

  function mount() {
    if (document.getElementById('sb-date-chip') || !document.body) return;
    var css = document.createElement('style');
    css.id = 'sb-date-css';
    css.textContent = [
      '#sb-date-chip{display:none;position:fixed;top:12px;right:64px;z-index:599;flex-direction:column;align-items:flex-end;gap:1px;',
      'padding:5px 12px;border-radius:12px;background:rgba(10,22,45,.9);backdrop-filter:blur(10px);border:1px solid rgba(125,230,200,.35);',
      'box-shadow:0 4px 14px rgba(0,0,0,.45);color:#e6fffa;font-family:"Plus Jakarta Sans","Inter",system-ui,sans-serif;pointer-events:none;user-select:none}',
      '#sb-date-chip .sbd-ad{font-size:12px;font-weight:800;letter-spacing:.01em}',
      '#sb-date-chip .sbd-bs{font-size:10.5px;font-weight:600;color:#7de6c8}',
      'body.board-fullscreen #sb-date-chip{display:flex}',
      /* when the controls are docked on the right the exit button moves to the left corner, so the date takes the corner */
      'body.controls-dock-right #sb-date-chip{right:14px}',
      '@media (max-width:560px){#sb-date-chip .sbd-bs{display:none}}'
    ].join('');
    document.head.appendChild(css);
    chip = document.createElement('div');
    chip.id = 'sb-date-chip';
    chip.setAttribute('aria-label', 'Today\'s date');
    document.body.appendChild(chip);
    render();
    setInterval(render, 60 * 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();

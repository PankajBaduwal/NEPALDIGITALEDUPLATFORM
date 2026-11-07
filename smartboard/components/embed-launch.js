/**
 * "Launch on Smart Board" (PiyushDhara catalogue):
 *   index.html?embed=/simulations/<id>/play%3Fembed%3D1&title=…
 * Opens the board with the simulation in a split partition (75%) beside a whiteboard. All Smart Board
 * sidebar tools work over the simulation: pen / highlighter / eraser draw on top of it, and the Select
 * tool hands the pointer back to the simulation. Additive: does nothing without the `embed` parameter.
 * The embedded page performs its own server-side access check.
 */
(function () {
  'use strict';
  var params;
  try { params = new URLSearchParams(window.location.search); } catch (e) { return; }
  var src = params.get('embed');
  var mathSim = params.get('mathsim');
  // Higher Mathematics (U25RMA101) modules are a Smart Board overlay: ?mathsim=u1_surf
  if (!src && mathSim && /^u[1-5]_[a-z0-9_]+$/i.test(mathSim)) {
    var openMath = function () {
      if (typeof MathSimulations === 'undefined' || typeof MathSimulations.show !== 'function') return false;
      var unit = 'unit' + mathSim.charAt(1);
      MathSimulations.show(unit, mathSim);
      return true;
    };
    var startMath = function () { setTimeout(function () { if (!openMath()) setTimeout(openMath, 1200); }, 500); };
    if (document.readyState === 'complete') startMath();
    else window.addEventListener('load', startMath);
    return;
  }
  if (!src) return;
  var title = (params.get('title') || 'Simulation').slice(0, 120);

  function apply() {
    if (window.__embedClosed) return false;
    if (typeof WorkspaceSplit === 'undefined' || typeof WorkspaceSplit.openEmbed !== 'function') return false;
    var ok = WorkspaceSplit.openEmbed(src, title);
    if (ok && window.App && typeof App.showToast === 'function') {
      App.showToast('🔬 ' + title + ' — use the pen to annotate, Select to interact');
    }
    return ok;
  }

  function start() {
    // after App.init; re-applied once in case a restored board session replaced the layout
    setTimeout(apply, 400);
    setTimeout(apply, 1800);
  }
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();

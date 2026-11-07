/**
 * PiyushDhara access guard for directly opened simulation pages (web deployment).
 *
 * The catalogue launch API is the real authorisation point. This guard stops a copied or typed
 * simulation URL from opening paid content: before the page is shown it asks the same server-side
 * access check, using the visitor's existing session (dashboard or simulations account), and shows a
 * "subscription required" screen when access is refused.
 *
 * Limits (by design): static files can still be fetched directly by someone determined; full protection
 * needs the simulation assets served behind authentication. When no API is reachable (offline Electron
 * Smart Board, file://) the guard does nothing, so classroom use without a server keeps working.
 *
 * Scope: every *-simulation.html page, and index.html only when opened as a catalogue chapter link
 * (?curriculum=…&subject=…&chapter=…). The plain Smart Board is a classroom tool and is not guarded.
 */
(function () {
  'use strict';
  if (location.protocol !== 'http:' && location.protocol !== 'https:') return;

  var params;
  try { params = new URLSearchParams(location.search); } catch (e) { return; }
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var isSimPage = /-simulation\.html$/.test(page);
  var isChapterLink = (page === 'index.html' || page === '') && params.get('chapter') && params.get('subject');
  var mathSimLink = (page === 'index.html' || page === '') && params.get('mathsim');
  var isEmbedLink = (page === 'index.html' || page === '') && params.get('embed');
  if (!isSimPage && !isChapterLink && !mathSimLink && !isEmbedLink) return;

  var simId = mathSimLink ? params.get('mathsim') : isChapterLink
    ? (params.get('id') || ((params.get('curriculum') || 'grade-10') + '-' + params.get('subject') + '-ch' + params.get('chapter')))
    : isEmbedLink
    ? (params.get('id') || '')
    : (params.get('sim') || params.get('simulationId') || '');
  var band = isChapterLink ? 'GRADES_9_12' : 'ENGINEERING';

  // Hide the page until the check finishes (prevents a flash of protected content)
  var style = document.createElement('style');
  style.id = 'pd-guard-style';
  style.textContent = 'html.pd-guard-pending body > *:not(#pd-guard){visibility:hidden!important}';
  document.head.appendChild(style);
  document.documentElement.classList.add('pd-guard-pending');
  var release = function () { document.documentElement.classList.remove('pd-guard-pending'); };
  // Never leave a page hidden forever
  var failSafe = setTimeout(release, 8000);

  function token() {
    try {
      var t = localStorage.getItem('eduverse_token') || '';
      return /^[\w-]+\.[\w-]+\.[\w-]+$/.test(t) ? t : '';
    } catch (e) { return ''; }
  }

  function call(path, tok) {
    var headers = { Accept: 'application/json' };
    if (tok) headers.Authorization = 'Bearer ' + tok;
    return fetch('/api/v1' + path, { headers: headers, credentials: 'include' });
  }

  function refresh() {
    return fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var t = j && j.data && j.data.accessToken;
        if (t) { try { localStorage.setItem('eduverse_token', t); } catch (e) {} }
        return t || '';
      })
      .catch(function () { return ''; });
  }

  /** Resolves to: 'ALLOW' | {status, code, message} | 'NO_API'. */
  function check(tok) {
    var path = simId ? '/simulations/' + encodeURIComponent(simId) + '/access' : '/simulations/entitlements';
    return call(path, tok).then(function (res) {
      if (res.status === 404 && simId) { simId = ''; return check(tok); } // not a catalogue id → band check
      var ct = res.headers.get('content-type') || '';
      if (ct.indexOf('application/json') === -1) return 'NO_API'; // static host without the API
      return res.json().then(function (body) {
        if (!simId && res.ok) {
          var bands = (body.data && body.data.bands) || [];
          return bands.indexOf(band) !== -1 ? 'ALLOW' : { status: body.data && body.data.authenticated ? 403 : 401, code: 'SUBSCRIPTION_REQUIRED', message: '' };
        }
        if (res.ok) return 'ALLOW';
        return { status: res.status, code: body.error && body.error.code, message: body.message || '' };
      });
    }).catch(function () { return 'NO_API'; });
  }

  function block(result) {
    clearTimeout(failSafe);
    var here = location.pathname + location.search;
    var detail = simId ? '/simulations/' + encodeURIComponent(simId) : '/simulations';
    var signedOut = result.status === 401;
    var title = signedOut ? 'Sign in to open this simulation' : result.code === 'ADDON_REQUIRED' ? 'Virtual Labs add-on required' : 'Subscription required';
    var text = signedOut
      ? 'This simulation is part of a PiyushDhara subscription. Sign in, or create an account to see the plans.'
      : (result.message || 'Your current plan does not include this simulation.');
    var box = document.createElement('div');
    box.id = 'pd-guard';
    box.setAttribute('role', 'alert');
    box.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:#F8FAFC;font-family:Inter,system-ui,sans-serif;padding:16px';
    box.innerHTML =
      '<div style="max-width:440px;background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:28px;box-shadow:0 24px 48px -32px rgba(11,59,90,.5)">' +
      '<h1 style="margin:0;font-size:20px;color:#0B1220"></h1><p style="margin:10px 0 0;font-size:14px;line-height:1.6;color:#475569"></p>' +
      '<div style="margin-top:20px;display:flex;flex-wrap:wrap;gap:8px"></div></div>';
    box.querySelector('h1').textContent = title;
    box.querySelector('p').textContent = text;
    var actions = box.querySelector('div > div:last-child');
    function btn(label, href, primary) {
      var a = document.createElement('a');
      a.href = href;
      a.textContent = label;
      a.style.cssText = 'text-decoration:none;font-size:14px;font-weight:600;border-radius:12px;padding:10px 16px;' + (primary ? 'background:#0B3B5A;color:#fff' : 'border:1px solid #CBD5E1;color:#0B1220');
      actions.appendChild(a);
    }
    if (signedOut) {
      btn('Sign in', '/signin?next=' + encodeURIComponent(here), true);
      btn('View plans', '/pricing', false);
    } else {
      btn('View plans', '/pricing', true);
    }
    btn('Simulation details', detail, false);
    document.body.appendChild(box);
    release();
  }

  function run() {
    var tok = token();
    if (!tok) {
      block({ status: 401, code: 'LOGIN_REQUIRED', message: 'Sign in to open this simulation.' });
      return;
    }
    check(tok).then(function (r) {
      if (r === 'ALLOW' || r === 'NO_API') { clearTimeout(failSafe); release(); return; }
      if (r.status === 401 && tok) {
        // expired dashboard session: refresh once and retry
        return refresh().then(function (t) { return t ? check(t) : r; }).then(function (r2) {
          if (r2 === 'ALLOW' || r2 === 'NO_API') { clearTimeout(failSafe); release(); } else block(r2);
        });
      }
      block(r);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();

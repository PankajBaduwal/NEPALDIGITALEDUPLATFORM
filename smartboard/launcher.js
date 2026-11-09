/**
 * Nepal Digital Education — Smart Board (local).
 *
 * Opens the Smart Board on this computer in its own app window: no browser tabs or address bar, no sign-in and no
 * internet needed for drawing, shapes, calculator, history and saving. Everything the board saves stays on this PC
 * (in the app's own profile folder), separate from your normal browser.
 *
 * How it works: a tiny built-in web server serves this smartboard folder on 127.0.0.1 (this computer only), and
 * Microsoft Edge (or Google Chrome) opens it in app mode. When the window is closed the server stops.
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const ROOT = __dirname; // this file lives inside the smartboard folder
const PORT = Number(process.env.SMARTBOARD_PORT || 5055);
const HOST = '127.0.0.1';
const DATA_DIR = process.platform === 'win32'
  ? path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'NepalSmartBoard')
  : process.platform === 'darwin'
    ? path.join(os.homedir(), 'Library', 'Application Support', 'NepalSmartBoard')
    : path.join(process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share'), 'NepalSmartBoard');
const LOG = path.join(DATA_DIR, 'launcher.log');
const MARK = 'nepal-smartboard-local';

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.mp4': 'video/mp4',
  '.pdf': 'application/pdf', '.txt': 'text/plain; charset=utf-8', '.map': 'application/json'
};

function log(msg) {
  try { fs.mkdirSync(DATA_DIR, { recursive: true }); fs.appendFileSync(LOG, new Date().toISOString() + '  ' + msg + '\n'); } catch (e) { /* ignore */ }
  console.log(msg);
}

function handler(req, res) {
  let urlPath;
  try { urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (e) { res.writeHead(400); return res.end('Bad request'); }
  if (urlPath === '/__ping') { res.writeHead(200, { 'Content-Type': 'text/plain' }); return res.end(MARK); }
  // the board links to itself as /smartboard/… when it runs inside the platform: serve those from the same folder
  if (urlPath.indexOf('/smartboard/') === 0) urlPath = urlPath.slice('/smartboard'.length);
  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';
  // the simulation pages moved into /simulations/: keep old links working
  const oldSim = /^\/([a-z0-9]+-simulation\.html)$/i.exec(urlPath);
  if (oldSim) { const q = req.url.indexOf('?'); res.writeHead(302, { Location: '/simulations/' + oldSim[1] + (q >= 0 ? req.url.slice(q) : '') }); return res.end(); }
  if (urlPath.indexOf('/api/') === 0) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not available in the local Smart Board'); }

  const file = path.normalize(path.join(ROOT, urlPath));
  if (file.indexOf(ROOT + path.sep) !== 0 && file !== ROOT) { res.writeHead(403); return res.end('Forbidden'); } // stay inside the board folder
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Cache-Control': 'no-cache' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}

function ping(port) {
  return new Promise((resolve) => {
    const r = http.get({ host: HOST, port: port, path: '/__ping', timeout: 800 }, (res) => {
      let body = '';
      res.on('data', (d) => { body += d; });
      res.on('end', () => resolve(body === MARK));
    });
    r.on('error', () => resolve(false));
    r.on('timeout', () => { r.destroy(); resolve(false); });
  });
}

function onPath(names) {
  const dirs = (process.env.PATH || '').split(path.delimiter);
  for (const n of names) for (const d of dirs) { const f = path.join(d, n); try { if (fs.statSync(f).isFile()) return f; } catch (e) { /* next */ } }
  return null;
}

/** Edge / Chrome / Chromium / Brave, on Windows, macOS or Linux. Returns null when none is installed. */
function findBrowser() {
  let candidates = [];
  if (process.platform === 'win32') {
    const pf = process.env['ProgramFiles'] || 'C:\Program Files';
    const pf86 = process.env['ProgramFiles(x86)'] || 'C:\Program Files (x86)';
    const local = process.env.LOCALAPPDATA || '';
    candidates = [
      path.join(pf86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      path.join(pf, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      path.join(pf, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(pf86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(local, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      path.join(pf, 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe')
    ];
  } else if (process.platform === 'darwin') {
    candidates = [
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
    ];
  } else {
    const viaPath = onPath(['microsoft-edge', 'microsoft-edge-stable', 'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'brave-browser']);
    if (viaPath) return viaPath;
  }
  return candidates.find((p) => { try { return fs.existsSync(p); } catch (e) { return false; } }) || null;
}

/** No app-mode browser available: open the board in the default browser instead (the server keeps running until Ctrl+C). */
function openDefaultBrowser(url) {
  const cmd = process.platform === 'win32' ? ['cmd', ['/c', 'start', '""', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  try { spawn(cmd[0], cmd[1], { stdio: 'ignore', detached: true }).unref(); } catch (e) { /* the address is printed below */ }
}

function openWindow(url) {
  const exe = findBrowser();
  if (!exe) {
    log('No Edge / Chrome / Chromium found — opening your default browser. Address: ' + url);
    openDefaultBrowser(url);
    return null;
  }
  const profile = path.join(DATA_DIR, 'profile');
  fs.mkdirSync(profile, { recursive: true });
  const child = spawn(exe, [
    '--app=' + url, '--user-data-dir=' + profile, '--start-maximized', '--no-first-run', '--no-default-browser-check',
    '--disable-features=Translate,msEdgeSignIn', '--disable-session-crashed-bubble', '--hide-crash-restore-bubble'
  ], { stdio: 'ignore', windowsHide: false });
  child.on('error', (e) => log('Could not start the browser: ' + e.message));
  return child;
}

function listen(server, port, triesLeft) {
  return new Promise((resolve, reject) => {
    const onErr = (e) => {
      server.removeListener('listening', onOk);
      if (e.code === 'EADDRINUSE' && triesLeft > 0) resolve(listen(server, port + 1, triesLeft - 1)); // another program has this port: use the next
      else reject(e);
    };
    const onOk = () => { server.removeListener('error', onErr); resolve(port); };
    server.once('error', onErr);
    server.once('listening', onOk);
    server.listen(port, HOST);
  });
}

async function main() {
  if (!fs.existsSync(path.join(ROOT, 'index.html'))) { log('Smart Board files not found at ' + ROOT); process.exit(1); }

  if (await ping(PORT)) { // the board is already running on this computer: just open another window
    log('Smart Board already running — opening a window');
    if (process.argv.includes('--no-open')) { console.log('Already running at http://' + HOST + ':' + PORT + '/index.html?local=1'); return; }
    openWindow('http://' + HOST + ':' + PORT + '/index.html?local=1');
    return;
  }

  const server = http.createServer(handler);
  let port;
  try { port = await listen(server, PORT, 20); } catch (e) { log('Could not start the local server: ' + e.message); process.exit(1); }
  const url = 'http://' + HOST + ':' + port + '/index.html?local=1';
  log('Smart Board serving ' + ROOT + ' on ' + url);
  if (process.argv.includes('--no-open')) { console.log('\nSmart Board is running at ' + url + '\nPress Ctrl+C to stop.'); return; }
  const child = openWindow(url);
  if (!child) { console.log('\nSmart Board is running at ' + url + '\nPress Ctrl+C to stop.'); return; }
  child.on('exit', () => {
    // closing the last window ends the browser process; give a quick relaunch a moment, then stop the server
    setTimeout(() => { log('Window closed — stopping'); server.close(); process.exit(0); }, 1500);
  });
}

main().catch((e) => { log('Failed: ' + (e && e.stack || e)); process.exit(1); });

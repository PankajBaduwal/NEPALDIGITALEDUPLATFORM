/**
 * Smart Board AI Teaching Assistant
 * Connects to the Nepal Educational RAG engine, grounded in the official CDC Class 1-12 textbooks.
 */
(function () {
  'use strict';

  // Read launcher context parameters
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || localStorage.getItem('nepal_edu_token') || localStorage.getItem('token') || '';
  const textbookId = params.get('textbookId') || '';
  const chapterNumber = parseInt(params.get('chapter') || '1', 10);

  let currentLang = 'auto';
  let busy = false;

  const ICON_BOT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="8" width="16" height="11" rx="3.5"/><path d="M12 8V4.5"/><circle cx="12" cy="3.5" r="1.2" fill="currentColor"/><circle cx="9" cy="13.2" r="1.2" fill="currentColor"/><circle cx="15" cy="13.2" r="1.2" fill="currentColor"/><path d="M9.5 16.2h5"/></svg>';
  const LOGO = '<img src="assets/brand/nepal-app-icon.svg" alt="Nepal Digital Education" draggable="false">';
  const ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/></svg>';
  const ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  const ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';

  function injectCss() {
    if (document.getElementById('sbai-css')) return;
    const s = document.createElement('style');
    s.id = 'sbai-css';
    s.textContent = `
      #smartboard-ai-btn{position:fixed;bottom:24px;right:24px;z-index:9999;width:56px;height:56px;border-radius:50%;border:2px solid rgba(125,230,200,.55);
        background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;
        box-shadow:0 6px 22px rgba(20,184,166,.45);transition:transform .15s,box-shadow .15s}
      #smartboard-ai-btn:hover{transform:scale(1.07);box-shadow:0 8px 28px rgba(20,184,166,.6)}
      #smartboard-ai-btn{background:#142D4E;border-color:#2dd4bf}
      #smartboard-ai-btn img{width:42px;height:42px;border-radius:12px;display:block;pointer-events:none}
      #smartboard-ai-btn.open{background:#0e2236;border-color:rgba(125,230,200,.4)}

      #smartboard-ai-modal{display:none;position:fixed;bottom:92px;right:24px;width:420px;max-width:calc(100vw - 24px);height:600px;max-height:calc(100vh - 110px);
        flex-direction:column;overflow:hidden;z-index:10000;color:#e8f1f6;border-radius:20px;
        background:linear-gradient(170deg,#0e2236 0%,#0a1727 100%);border:1px solid rgba(125,230,200,.28);
        box-shadow:0 24px 60px rgba(0,0,0,.55),0 0 0 1px rgba(0,0,0,.4);font-family:"Plus Jakarta Sans","Inter",system-ui,sans-serif}
      #smartboard-ai-modal.show{display:flex;animation:sbai-pop .16s ease-out}
      @keyframes sbai-pop{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}

      .sbai-head{display:flex;align-items:center;gap:11px;padding:13px 14px;background:rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.07)}
      .sbai-avatar{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;flex:none;color:#fff;background:linear-gradient(135deg,#0f766e,#14b8a6);box-shadow:0 3px 10px rgba(20,184,166,.35)}
      .sbai-avatar svg{width:22px;height:22px}
      .sbai-title{flex:1;min-width:0}
      .sbai-title b{display:block;font-size:14.5px;font-weight:800;color:#fff;letter-spacing:.005em}
      .sbai-title span{display:flex;align-items:center;gap:5px;font-size:11.5px;color:#8fb0c4;margin-top:1px}
      .sbai-title span i{width:7px;height:7px;border-radius:50%;background:#34d399;box-shadow:0 0 0 3px rgba(52,211,153,.18)}
      .sbai-hbtn{height:32px;min-width:32px;padding:0 9px;display:grid;place-items:center;border:0;border-radius:9px;background:rgba(255,255,255,.07);color:#cfe3ee;cursor:pointer;font:700 12px inherit;font-family:inherit}
      .sbai-hbtn:hover{background:rgba(255,255,255,.15);color:#fff}
      .sbai-hbtn svg{width:16px;height:16px}

      .sbai-chips{display:flex;gap:7px;padding:10px 12px;overflow-x:auto;scrollbar-width:none;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(0,0,0,.18)}
      .sbai-chip{flex:none;border:1px solid rgba(125,230,200,.3);background:rgba(20,184,166,.1);color:#9fe7d4;padding:6px 12px;border-radius:999px;font:700 12px inherit;font-family:inherit;cursor:pointer;white-space:nowrap;transition:background .12s}
      .sbai-chip:hover{background:rgba(20,184,166,.24);color:#fff}
      .sbai-chip:disabled{opacity:.5;cursor:default}

      #sb-ai-history{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:12px;font-size:13.5px;scrollbar-width:thin;scrollbar-color:#27465f transparent}
      .sbai-welcome{margin:auto 0;text-align:center;padding:6px 4px}
      .sbai-welcome .big{width:60px;height:60px;margin:0 auto 12px;border-radius:18px;display:grid;place-items:center;color:#fff;background:linear-gradient(135deg,#0f766e,#14b8a6);box-shadow:0 8px 24px rgba(20,184,166,.35)}
      .sbai-welcome .big svg{width:32px;height:32px}
      .sbai-welcome h3{margin:0 0 6px;font-size:17px;font-weight:800;color:#fff}
      .sbai-welcome p{margin:0 auto 14px;max-width:310px;font-size:12.5px;line-height:1.55;color:#9db6c6}
      .sbai-sugg{display:grid;gap:7px;text-align:left}
      .sbai-sugg button{border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.05);color:#dbe9f1;border-radius:12px;padding:10px 12px;font:600 12.5px inherit;font-family:inherit;cursor:pointer;text-align:left}
      .sbai-sugg button:hover{background:rgba(20,184,166,.16);border-color:rgba(125,230,200,.4)}

      .sbai-row{display:flex;gap:8px;align-items:flex-end}
      .sbai-row.user{justify-content:flex-end}
      .sbai-mini{width:26px;height:26px;border-radius:9px;display:grid;place-items:center;flex:none;color:#fff;background:linear-gradient(135deg,#0f766e,#14b8a6)}
      .sbai-mini svg{width:15px;height:15px}
      .sbai-bubble{max-width:84%;padding:10px 13px;line-height:1.55;word-break:break-word}
      .sbai-row.user .sbai-bubble{background:linear-gradient(135deg,#0f766e,#14b8a6);color:#fff;border-radius:16px 16px 4px 16px;font-weight:600}
      .sbai-row.bot .sbai-bubble{background:#162b40;border:1px solid rgba(255,255,255,.08);color:#e8f1f6;border-radius:16px 16px 16px 4px}
      .sbai-row.err .sbai-bubble{background:rgba(190,45,70,.18);border:1px solid rgba(251,113,133,.35);color:#fecdd3;border-radius:14px;font-size:12.5px}
      .sbai-bubble b,.sbai-bubble strong{color:#fff}
      .sbai-acts{display:flex;gap:6px;margin-top:9px;flex-wrap:wrap}
      .sbai-acts button{border:0;border-radius:8px;padding:5px 10px;font:700 11.5px inherit;font-family:inherit;cursor:pointer;background:rgba(20,184,166,.2);color:#9fe7d4}
      .sbai-acts button:hover{background:rgba(20,184,166,.38);color:#fff}
      .sbai-typing{display:inline-flex;gap:4px;align-items:center;padding:4px 2px}
      .sbai-typing i{width:7px;height:7px;border-radius:50%;background:#5eead4;animation:sbai-dot 1.1s infinite ease-in-out}
      .sbai-typing i:nth-child(2){animation-delay:.16s}.sbai-typing i:nth-child(3){animation-delay:.32s}
      @keyframes sbai-dot{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-4px)}}
      .sbai-status{font-size:11.5px;color:#8fb0c4;margin-left:6px}

      .sbai-input{display:flex;gap:8px;align-items:center;padding:11px 12px;background:rgba(0,0,0,.22);border-top:1px solid rgba(255,255,255,.07)}
      #sb-ai-input{flex:1;min-width:0;background:#0b1b2c;border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:11px 14px;color:#fff;font:500 13px inherit;font-family:inherit;outline:none}
      #sb-ai-input::placeholder{color:#6f8da0}
      #sb-ai-input:focus{border-color:#2dd4bf;box-shadow:0 0 0 3px rgba(45,212,191,.18)}
      #sb-ai-send{width:42px;height:42px;flex:none;display:grid;place-items:center;border:0;border-radius:12px;cursor:pointer;color:#fff;background:linear-gradient(135deg,#0f766e,#14b8a6);box-shadow:0 3px 10px rgba(20,184,166,.35)}
      #sb-ai-send:hover{filter:brightness(1.1)}#sb-ai-send:disabled{opacity:.5;cursor:default}
      #sb-ai-send svg{width:19px;height:19px}
      body.controls-dock-right #smartboard-ai-btn{right:auto;left:76px}
      body.controls-dock-right #smartboard-ai-modal{right:auto;left:76px}
      .sbai-avatar img,.sbai-welcome .big img,.sbai-mini img{width:100%;height:100%;display:block;border-radius:inherit;object-fit:cover}
      .sbai-avatar,.sbai-welcome .big,.sbai-mini{background:none !important}
      @media (max-width:520px){#smartboard-ai-modal{right:8px;left:8px;width:auto;bottom:86px}}
    `;
    document.head.appendChild(s);
  }

  function createAiButton() {
    if (document.getElementById('smartboard-ai-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'smartboard-ai-btn';
    btn.type = 'button';
    btn.innerHTML = LOGO;
    btn.setAttribute('aria-label', 'Nepal Digital Education AI');
    btn.title = 'Nepal Digital Education AI — curriculum assistant (नेपाल पाठ्यक्रम एआई)';
    btn.onclick = toggleAiModal;
    document.body.appendChild(btn);
  }

  function esc(t) {
    return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /** Escapes the reply, then restores simple formatting (**bold**, line breaks). */
  function formatReply(t) {
    return esc(t)
      .replace(/^#{1,4}\s*(.+)$/gm, '<strong style="color:#5eead4">$1</strong>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  }

  function toast(msg) {
    if (window.App && typeof window.App.showToast === 'function') window.App.showToast(msg);
  }

  const SUGGESTIONS = {
    en: [
      ['Explain this chapter', 'Explain the key learning objectives and concepts for this unit.', 'SMARTBOARD_EXPLAIN'],
      ['Give 3 quick questions', 'Generate 3 rapid check MCQs based on this chapter.', 'MCQ_GENERATOR'],
      ['List key formulas', 'List key formulas, SI units, and equations with derivations.', 'SMARTBOARD_EXPLAIN']
    ],
    ne: [
      ['यो पाठ सम्झाउनुहोस्', 'यस पाठको मुख्य सिकाइ उपलब्धि र अवधारणा संक्षेपमा सम्झाउनुहोस्', 'SMARTBOARD_EXPLAIN'],
      ['३ वटा छिटो प्रश्न', 'यस पाठबाट कक्षामा सोध्न सकिने ३ वटा बहुवैकल्पिक प्रश्नहरू निकाल्नुहोस्', 'MCQ_GENERATOR'],
      ['मुख्य सूत्रहरू', 'यस पाठमा प्रयोग हुने मुख्य गणितीय सुत्र, एकाइ र नियमहरू दिनुहोस्', 'SMARTBOARD_EXPLAIN']
    ]
  };

  function welcomeHtml() {
    return '<div class="sbai-welcome" id="sbai-welcome"><div class="big">' + LOGO + '</div>' +
      '<h3>Namaste! How can I help?</h3>' +
      '<p>Ask any question and I will explain it from the official Nepal CDC textbooks, with page numbers.</p>' +
      '<div class="sbai-sugg" id="sbai-sugg"></div></div>';
  }

  function fillSuggestions() {
    const box = document.getElementById('sbai-sugg');
    if (!box) return;
    box.innerHTML = '';
    (SUGGESTIONS[currentLang === 'ne' ? 'ne' : 'en']).forEach(function (s) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = s[0];
      b.onclick = function () { submitQuery(s[1], s[2]); };
      box.appendChild(b);
    });
  }

  function createAiModal() {
    if (document.getElementById('smartboard-ai-modal')) return;
    injectCss();

    const modal = document.createElement('div');
    modal.id = 'smartboard-ai-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-label', 'Nepal Digital Education AI Copilot');
    modal.innerHTML =
      '<div class="sbai-head">' +
        '<div class="sbai-avatar">' + LOGO + '</div>' +
        '<div class="sbai-title"><b>Nepal Digital Education</b><span><i></i>AI Copilot · official CDC textbooks</span></div>' +
        '<button type="button" class="sbai-hbtn" id="sb-ai-lang" title="Answer language">नेपाली</button>' +
        '<button type="button" class="sbai-hbtn" id="sb-ai-clear" title="Clear chat" aria-label="Clear chat">' + ICON_TRASH + '</button>' +
        '<button type="button" class="sbai-hbtn" id="sb-ai-close" title="Close" aria-label="Close">' + ICON_CLOSE + '</button>' +
      '</div>' +
      '<div class="sbai-chips">' +
        '<button type="button" class="sbai-chip" id="qa-explain">Explain chapter</button>' +
        '<button type="button" class="sbai-chip" id="qa-quiz">3 quick questions</button>' +
        '<button type="button" class="sbai-chip" id="qa-formula">Key formulas</button>' +
      '</div>' +
      '<div id="sb-ai-history">' + welcomeHtml() + '</div>' +
      '<div class="sbai-input">' +
        '<input id="sb-ai-input" type="text" autocomplete="off" placeholder="Ask in Nepali or English…" />' +
        '<button type="button" id="sb-ai-send" title="Send" aria-label="Send">' + ICON_SEND + '</button>' +
      '</div>';
    document.body.appendChild(modal);
    fillSuggestions();

    document.getElementById('sb-ai-close').onclick = toggleAiModal;
    document.getElementById('sb-ai-send').onclick = function () { submitQuery(); };
    document.getElementById('sb-ai-input').onkeydown = function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitQuery(); }
      if (e.key === 'Escape') toggleAiModal();
    };

    document.getElementById('sb-ai-lang').onclick = function () {
      currentLang = currentLang === 'ne' ? 'en' : 'ne';
      this.textContent = currentLang === 'ne' ? 'English' : 'नेपाली';
      fillSuggestions();
    };

    document.getElementById('sb-ai-clear').onclick = function () {
      if (busy) return;
      document.getElementById('sb-ai-history').innerHTML = welcomeHtml();
      fillSuggestions();
    };

    function quick(en, ne, mode) {
      const s = SUGGESTIONS;
      submitQuery(currentLang === 'ne' ? ne : en, mode);
    }
    document.getElementById('qa-explain').onclick = function () { quick(SUGGESTIONS.en[0][1], SUGGESTIONS.ne[0][1], 'SMARTBOARD_EXPLAIN'); };
    document.getElementById('qa-quiz').onclick = function () { quick(SUGGESTIONS.en[1][1], SUGGESTIONS.ne[1][1], 'MCQ_GENERATOR'); };
    document.getElementById('qa-formula').onclick = function () { quick(SUGGESTIONS.en[2][1], SUGGESTIONS.ne[2][1], 'SMARTBOARD_EXPLAIN'); };
  }

  function toggleAiModal() {
    const modal = document.getElementById('smartboard-ai-modal');
    const btn = document.getElementById('smartboard-ai-btn');
    if (!modal) return;
    const show = !modal.classList.contains('show');
    modal.classList.toggle('show', show);
    if (btn) btn.classList.toggle('open', show);
    if (show) document.getElementById('sb-ai-input').focus();
  }

  function setBusy(v) {
    busy = v;
    ['sb-ai-send', 'qa-explain', 'qa-quiz', 'qa-formula'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.disabled = v;
    });
  }

  function addRow(kind, html) {
    const history = document.getElementById('sb-ai-history');
    const w = document.getElementById('sbai-welcome');
    if (w) w.remove();
    const row = document.createElement('div');
    row.className = 'sbai-row ' + kind;
    row.innerHTML = (kind === 'user' ? '' : '<div class="sbai-mini">' + LOGO + '</div>') + '<div class="sbai-bubble"></div>';
    row.querySelector('.sbai-bubble').innerHTML = html;
    history.appendChild(row);
    history.scrollTop = history.scrollHeight;
    return row;
  }

  async function submitQuery(customText, customMode) {
    if (busy) return;
    const input = document.getElementById('sb-ai-input');
    const query = customText || input.value.trim();
    if (!query) return;
    if (!customText) input.value = '';

    addRow('user', esc(query));
    const loading = addRow('bot', '<span class="sbai-typing"><i></i><i></i><i></i></span><span class="sbai-status">Searching the CDC textbooks…</span>');
    setBusy(true);
    const history = document.getElementById('sb-ai-history');

    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}),
        body: JSON.stringify(Object.assign({ query, mode: customMode || 'SMARTBOARD_EXPLAIN', language: currentLang, chapterNumber }, textbookId ? { textbookId } : {}))
      });
      const data = await res.json();
      loading.remove();

      if (data.success && data.data) {
        const content = String(data.data.content || '');
        const row = addRow('bot', formatReply(content));
        const acts = document.createElement('div');
        acts.className = 'sbai-acts';
        const stamp = document.createElement('button');
        stamp.type = 'button';
        stamp.textContent = 'Stamp on board';
        stamp.onclick = function () {
          if (window.App && typeof window.App.addText === 'function') {
            window.App.addText(content);
            toast('Inserted onto the board');
          } else {
            try { navigator.clipboard.writeText(content); } catch (e) { /* ignore */ }
            toast('Copied — paste it onto the board');
          }
        };
        const copy = document.createElement('button');
        copy.type = 'button';
        copy.textContent = 'Copy';
        copy.onclick = function () {
          try { navigator.clipboard.writeText(content); copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy'; }, 1200); } catch (e) { /* ignore */ }
        };
        acts.appendChild(stamp);
        acts.appendChild(copy);
        row.querySelector('.sbai-bubble').appendChild(acts);
      } else {
        addRow('err', esc(data.error || 'Failed to retrieve an answer'));
      }
    } catch (e) {
      loading.remove();
      addRow('err', 'Connection error: ' + esc(e.message));
    }
    setBusy(false);
    history.scrollTop = history.scrollHeight;
  }

  function init() {
    injectCss();
    createAiButton();
    createAiModal();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/**
 * Smart Board AI Teaching Assistant (Phase 8)
 * Connects directly to Nepal Educational RAG Engine
 * Grounded in official CDC Class 1-12 Textbooks
 */
(function () {
  'use strict';

  // Read launcher context parameters
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || localStorage.getItem('nepal_edu_token') || localStorage.getItem('token') || '';
  const textbookId = params.get('textbookId') || '';
  const chapterNumber = parseInt(params.get('chapter') || '1', 10);
  const pageNumber = parseInt(params.get('page') || '1', 10);

  let currentLang = 'auto';

  // Create floating trigger button
  function createAiButton() {
    if (document.getElementById('smartboard-ai-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'smartboard-ai-btn';
    btn.innerHTML = '🤖 <strong>Smart Board AI</strong>';
    btn.title = 'AI Curriculum Copilot (नेपाल पाठ्यक्रम एआई)';
    btn.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      background: linear-gradient(135deg, #7c3aed, #6366f1);
      color: #ffffff;
      border: 2px solid #a78bfa;
      padding: 10px 18px;
      border-radius: 30px;
      font-size: 13px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(124, 58, 237, 0.45);
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    `;

    btn.onmouseover = () => { btn.style.transform = 'scale(1.05)'; };
    btn.onmouseout = () => { btn.style.transform = 'scale(1)'; };
    btn.onclick = toggleAiModal;

    document.body.appendChild(btn);
  }

  // Create AI Assistant Modal
  function createAiModal() {
    if (document.getElementById('smartboard-ai-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'smartboard-ai-modal';
    modal.style.cssText = `
      display: none;
      position: fixed;
      bottom: 80px;
      right: 24px;
      width: 440px;
      max-width: 90vw;
      height: 560px;
      max-height: 80vh;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #f8fafc;
      flex-direction: column;
      overflow: hidden;
    `;

    modal.innerHTML = `
      <div style="background:#1e293b; padding:12px 16px; border-bottom:1px solid #334155; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:16px;">🤖</span>
          <div>
            <div style="font-size:13px; font-weight:bold; color:#fff;">Nepal CDC AI Copilot</div>
            <div style="font-size:11px; color:#94a3b8;">Grounded in Official CDC Textbooks</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <button id="sb-ai-lang" style="background:#334155; color:#cbd5e1; border:1px solid #475569; padding:3px 8px; border-radius:6px; font-size:11px; cursor:pointer;">🇳🇵 नेपाली</button>
          <button id="sb-ai-close" style="background:transparent; border:none; color:#94a3b8; font-size:18px; cursor:pointer; padding:0 4px;">✕</button>
        </div>
      </div>

      <!-- Quick Action Pills -->
      <div style="background:#090d16; padding:8px 12px; border-bottom:1px solid #1e293b; display:flex; gap:6px; overflow-x:auto;">
        <button id="qa-explain" style="background:#1e293b; color:#38bdf8; border:1px solid #0284c7; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:600; white-space:nowrap; cursor:pointer;">📖 Explain Chapter</button>
        <button id="qa-quiz" style="background:#1e293b; color:#a855f7; border:1px solid #9333ea; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:600; white-space:nowrap; cursor:pointer;">❓ 3 Quick Questions</button>
        <button id="qa-formula" style="background:#1e293b; color:#22c55e; border:1px solid #16a34a; padding:4px 10px; border-radius:12px; font-size:11px; font-weight:600; white-space:nowrap; cursor:pointer;">⚡ Key Formulas</button>
      </div>

      <!-- Chat History -->
      <div id="sb-ai-history" style="flex:1; overflow-y:auto; padding:14px; display:flex; flex-direction:column; gap:10px; font-size:13px;">
        <div style="background:#1e293b; padding:10px 14px; border-radius:10px; border-left:3px solid #7c3aed; line-height:1.5;">
          Hello Teacher! I am your Smart Board AI assistant. Ask any question, and I will explain it using verified Nepal CDC curriculum textbooks with page numbers.
        </div>
      </div>

      <!-- Input Bar -->
      <div style="padding:10px 12px; background:#1e293b; border-top:1px solid #334155; display:flex; gap:8px;">
        <input id="sb-ai-input" type="text" placeholder="Ask curriculum question in Nepali or English..." style="flex:1; background:#0f172a; border:1px solid #475569; border-radius:8px; padding:8px 12px; color:#fff; font-size:12px; outline:none;" />
        <button id="sb-ai-send" style="background:#7c3aed; color:#fff; border:none; padding:8px 14px; border-radius:8px; font-weight:bold; font-size:12px; cursor:pointer;">Ask</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    document.getElementById('sb-ai-close').onclick = toggleAiModal;
    document.getElementById('sb-ai-send').onclick = () => submitQuery();
    document.getElementById('sb-ai-input').onkeydown = (e) => {
      if (e.key === 'Enter') submitQuery();
    };

    document.getElementById('sb-ai-lang').onclick = () => {
      currentLang = currentLang === 'ne' ? 'en' : 'ne';
      document.getElementById('sb-ai-lang').textContent = currentLang === 'ne' ? '🇬🇧 English' : '🇳🇵 नेपाली';
    };

    document.getElementById('qa-explain').onclick = () => {
      const q = currentLang === 'ne' ? 'यस पाठको मुख्य सिकाइ उपलब्धि र अवधारणा संक्षेपमा सम्झाउनुहोस्' : 'Explain the key learning objectives and concepts for this unit.';
      submitQuery(q, 'SMARTBOARD_EXPLAIN');
    };

    document.getElementById('qa-quiz').onclick = () => {
      const q = currentLang === 'ne' ? 'यस पाठबाट कक्षामा सोध्न सकिने ३ वटा बहुवैकल्पिक प्रश्नहरू निकाल्नुहोस्' : 'Generate 3 rapid check MCQs based on this chapter.';
      submitQuery(q, 'MCQ_GENERATOR');
    };

    document.getElementById('qa-formula').onclick = () => {
      const q = currentLang === 'ne' ? 'यस पाठमा प्रयोग हुने मुख्य गणितीय सुत्र, एकाइ र नियमहरू दिनुहोस्' : 'List key formulas, SI units, and equations with derivations.';
      submitQuery(q, 'SMARTBOARD_EXPLAIN');
    };
  }

  function toggleAiModal() {
    const modal = document.getElementById('smartboard-ai-modal');
    if (!modal) return;
    const isHidden = modal.style.display === 'none' || !modal.style.display;
    modal.style.display = isHidden ? 'flex' : 'none';
    if (isHidden) {
      document.getElementById('sb-ai-input').focus();
    }
  }

  async function submitQuery(customText, customMode) {
    const input = document.getElementById('sb-ai-input');
    const query = customText || input.value.trim();
    if (!query) return;

    if (!customText) input.value = '';

    const history = document.getElementById('sb-ai-history');

    // Add user message
    const userDiv = document.createElement('div');
    userDiv.style.cssText = 'background:#2563eb; color:#fff; padding:8px 12px; border-radius:10px 10px 0 10px; align-self:flex-end; max-width:85%;';
    userDiv.textContent = query;
    history.appendChild(userDiv);

    // Add loading indicator
    const loadDiv = document.createElement('div');
    loadDiv.style.cssText = 'background:#1e293b; color:#94a3b8; padding:8px 12px; border-radius:10px 10px 10px 0; align-self:flex-start; font-style:italic;';
    loadDiv.textContent = 'Searching Nepal CDC textbooks...';
    history.appendChild(loadDiv);
    history.scrollTop = history.scrollHeight;

    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
        body: JSON.stringify({
          query,
          mode: customMode || 'SMARTBOARD_EXPLAIN',
          language: currentLang,
          chapterNumber,
          textbookId,
        }),
      });

      const data = await res.json();
      history.removeChild(loadDiv);

      if (data.success && data.data) {
        const botDiv = document.createElement('div');
        botDiv.style.cssText = 'background:#1e293b; color:#f8fafc; padding:12px; border-radius:10px 10px 10px 0; align-self:flex-start; max-width:90%; border:1px solid #334155; line-height:1.5;';
        
        let formatted = data.data.content.replace(/\n/g, '<br/>');
        botDiv.innerHTML = formatted;

        // Stamp to Board Button
        const stampBtn = document.createElement('button');
        stampBtn.innerHTML = '✍️ Stamp on Board';
        stampBtn.style.cssText = 'margin-top:8px; background:#0284c7; color:#fff; border:none; padding:4px 8px; border-radius:4px; font-size:11px; font-weight:bold; cursor:pointer;';
        stampBtn.onclick = () => {
          if (window.App && typeof window.App.addText === 'function') {
            window.App.addText(data.data.content);
            alert('Inserted onto Smart Board canvas!');
          } else {
            navigator.clipboard.writeText(data.data.content);
            alert('Copied to clipboard! Paste onto canvas.');
          }
        };
        botDiv.appendChild(stampBtn);

        history.appendChild(botDiv);
      } else {
        const errDiv = document.createElement('div');
        errDiv.style.cssText = 'background:#7f1d1d; color:#fca5a5; padding:8px 12px; border-radius:10px; font-size:12px;';
        errDiv.textContent = data.error || 'Failed to retrieve answer';
        history.appendChild(errDiv);
      }
    } catch (e) {
      history.removeChild(loadDiv);
      const errDiv = document.createElement('div');
      errDiv.style.cssText = 'background:#7f1d1d; color:#fca5a5; padding:8px 12px; border-radius:10px; font-size:12px;';
      errDiv.textContent = 'Connection error: ' + e.message;
      history.appendChild(errDiv);
    }

    history.scrollTop = history.scrollHeight;
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      createAiButton();
      createAiModal();
    });
  } else {
    createAiButton();
    createAiModal();
  }
})();


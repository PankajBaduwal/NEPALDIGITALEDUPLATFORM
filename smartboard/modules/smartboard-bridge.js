/**
 * 🇳🇵 NEPAL DIGITAL EDUCATION ECOSYSTEM — SMART BOARD PLATFORM BRIDGE
 * Connects the existing Smart Board canvas with Central MERN APIs,
 * MongoDB Annotation Storage, CDC Textbook Streaming, and Classroom Session Tracking.
 */
(function () {
  'use strict';

  var params;
  try {
    params = new URLSearchParams(window.location.search);
  } catch (e) {
    return;
  }

  var sessionId = params.get('sessionId') || '';
  var token = params.get('token') || '';
  var textbookId = params.get('textbookId') || '';
  var pdfUrl = params.get('pdf') || '';
  var pageNumber = parseInt(params.get('page') || '1', 10);
  var sessionTitle = params.get('title') || 'Interactive Classroom';
  var chapterNum = params.get('chapter') || '';
  var simName = params.get('sim') || '';

  // 1. Sync Authentication Token
  if (token) {
    try {
      localStorage.setItem('nepal_edu_token', token);
      localStorage.setItem('eduverse_token', token);
    } catch (e) {}
  } else {
    try {
      token = localStorage.getItem('nepal_edu_token') || localStorage.getItem('eduverse_token') || '';
    } catch (e) {}
  }

  function getHeaders() {
    var h = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) {
      h['Authorization'] = 'Bearer ' + token;
    }
    return h;
  }

  // 2. Initialize Embedded Resource (Textbook PDF or Simulation)
  function initSessionResource() {
    if (pdfUrl && typeof WorkspaceSplit !== 'undefined' && typeof WorkspaceSplit.openEmbed === 'function') {
      var embedPdf = pdfUrl + '#page=' + pageNumber + '&zoom=100';
      WorkspaceSplit.openEmbed(embedPdf, sessionTitle + ' (Textbook PDF)');
      if (window.App && typeof App.showToast === 'function') {
        App.showToast('📖 CDC Textbook loaded — Use Pen to annotate over pages');
      }
    } else if (simName && typeof WorkspaceSplit !== 'undefined' && typeof WorkspaceSplit.openEmbed === 'function') {
      var simUrl = '/smartboard/' + simName;
      WorkspaceSplit.openEmbed(simUrl, sessionTitle + ' (Simulation)');
      if (window.App && typeof App.showToast === 'function') {
        App.showToast('🔬 Simulation active — Use Select tool to interact, Pen to annotate');
      }
    }
  }

  // 3. Cloud Annotation Storage (Save / Load)
  async function saveCloudAnnotations(isShared) {
    if (!window.App || typeof App.getBoardState !== 'function') {
      alert('Drawing engine not initialized');
      return;
    }

    var boardState = App.getBoardState();
    var payload = {
      sessionId: sessionId || undefined,
      textbookId: textbookId || undefined,
      pageNumber: pageNumber || (boardState.currentPage ? boardState.currentPage + 1 : 1),
      title: sessionTitle + ' - Annotations ' + new Date().toLocaleTimeString(),
      annotationData: {
        shapes: boardState.pages[boardState.currentPage || 0]?.shapes || [],
        pagesCount: boardState.pages?.length || 1,
      },
      drawDataUrl: boardState.pages[boardState.currentPage || 0]?.drawDataUrl || null,
      boardState: boardState,
      isSharedWithStudents: isShared !== undefined ? isShared : true,
    };

    try {
      if (!navigator.onLine) throw new Error('Offline');

      var res = await fetch('/api/v1/smartboard/annotations', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      var data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Server rejected annotation save');
      }

      if (window.App && typeof App.showToast === 'function') {
        App.showToast('☁️ Saved to School Cloud & shared with students!');
      } else {
        alert('Annotations saved to school cloud!');
      }
    } catch (err) {
      // Offline Resilience: Save to local fallback queue
      try {
        var queue = JSON.parse(localStorage.getItem('pending_cloud_annotations') || '[]');
        queue.push({ payload: payload, timestamp: Date.now() });
        localStorage.setItem('pending_cloud_annotations', JSON.stringify(queue));
      } catch (e) {}

      if (window.App && typeof App.showToast === 'function') {
        App.showToast('💾 Saved locally (offline). Will sync when online.');
      }
    }
  }

  // Load Saved Cloud Annotations Modal
  async function openCloudAnnotationsModal() {
    var modal = document.getElementById('pd-cloud-annotations-modal');
    if (!modal) {
      createAnnotationsModal();
      modal = document.getElementById('pd-cloud-annotations-modal');
    }

    var listEl = document.getElementById('pd-cloud-notes-list');
    if (listEl) {
      listEl.innerHTML = '<div style="padding:20px;text-align:center;color:#64748b;">Loading saved annotations…</div>';
    }
    modal.classList.remove('hidden');

    try {
      var query = textbookId ? '?textbookId=' + textbookId : '';
      var res = await fetch('/api/v1/smartboard/annotations' + query, {
        headers: getHeaders(),
      });
      var data = await res.json();
      var notes = data.data || [];

      if (!listEl) return;
      if (notes.length === 0) {
        listEl.innerHTML = '<div style="padding:30px;text-align:center;color:#64748b;">No cloud annotations found for this textbook or session.</div>';
        return;
      }

      var html = '';
      notes.forEach(function (n) {
        var timeStr = new Date(n.createdAt).toLocaleString();
        html += '<div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;background:#f8fafc;">';
        html += '<div>';
        html += '<div style="font-weight:700;font-size:13px;color:#0f172a;">' + (n.title || 'Untitled Note') + '</div>';
        html += '<div style="font-size:11px;color:#64748b;margin-top:2px;">Page ' + n.pageNumber + ' • ' + timeStr + '</div>';
        html += '</div>';
        html += '<button data-note-id="' + (n.id || n._id) + '" class="pd-load-note-btn" style="padding:6px 14px;background:#2563eb;color:#ffffff;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">Restore</button>';
        html += '</div>';
      });
      listEl.innerHTML = html;

      // Attach click handlers
      var buttons = listEl.querySelectorAll('.pd-load-note-btn');
      buttons.forEach(function (btn) {
        btn.addEventListener('click', async function () {
          var noteId = this.dataset.noteId;
          await loadNoteById(noteId);
          modal.classList.add('hidden');
        });
      });
    } catch (err) {
      if (listEl) {
        listEl.innerHTML = '<div style="padding:20px;text-align:center;color:#dc2626;">Error loading cloud notes: ' + err.message + '</div>';
      }
    }
  }

  async function loadNoteById(noteId) {
    try {
      var res = await fetch('/api/v1/smartboard/annotations/' + noteId, {
        headers: getHeaders(),
      });
      var data = await res.json();
      var note = data.data;
      if (note && note.boardState && window.App && typeof App.loadBoardState === 'function') {
        App.loadBoardState(note.boardState);
        if (typeof App.showToast === 'function') {
          App.showToast('✓ Restored cloud board state: ' + note.title);
        }
      }
    } catch (e) {
      alert('Failed to load note: ' + e.message);
    }
  }

  function createAnnotationsModal() {
    var div = document.createElement('div');
    div.id = 'pd-cloud-annotations-modal';
    div.className = 'hidden';
    div.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui,sans-serif;padding:16px;';
    div.innerHTML =
      '<div style="background:#ffffff;border-radius:16px;max-width:540px;width:100%;max-height:85vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 25px -5px rgba(0,0,0,0.2);">' +
      '<div style="padding:16px 20px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;">' +
      '<div><h3 style="margin:0;font-size:16px;font-weight:800;color:#0f172a;">☁️ School Cloud Annotations</h3><div style="font-size:11px;color:#64748b;">Restore saved drawings & lesson notes</div></div>' +
      '<button id="pd-close-cloud-modal" style="background:#f1f5f9;border:none;border-radius:6px;padding:4px 8px;font-weight:700;cursor:pointer;">✕</button>' +
      '</div>' +
      '<div id="pd-cloud-notes-list" style="padding:16px 20px;flex:1;overflow-y:auto;"></div>' +
      '<div style="padding:12px 20px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;">' +
      '<button id="pd-close-cloud-modal-btn" style="padding:6px 14px;background:#e2e8f0;color:#334155;border:none;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;">Close</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(div);

    document.getElementById('pd-close-cloud-modal')?.addEventListener('click', function () {
      div.classList.add('hidden');
    });
    document.getElementById('pd-close-cloud-modal-btn')?.addEventListener('click', function () {
      div.classList.add('hidden');
    });
  }

  // 4. End Classroom Session
  async function endClassroomSession() {
    if (!sessionId) {
      if (window.App && typeof App.showToast === 'function') {
        App.showToast('No active database session linked to this board window.');
      }
      return;
    }

    if (!confirm('End current classroom session and log teaching duration?')) return;

    try {
      var res = await fetch('/api/v1/smartboard/sessions/' + sessionId + '/end', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          lessonCoverage: 'Interactive whiteboard lesson completed',
        }),
      });
      var data = await res.json();
      if (res.ok && data.success) {
        if (window.App && typeof App.showToast === 'function') {
          App.showToast('✓ Classroom session successfully ended & logged in MERN platform!');
        } else {
          alert('Classroom session ended successfully!');
        }
      }
    } catch (e) {
      alert('Error ending session: ' + e.message);
    }
  }

  // 5. Mount Cloud Controls Floating Pill
  function mountCloudSyncBar() {
    var pill = document.createElement('div');
    pill.id = 'pd-cloud-sync-pill';
    pill.style.cssText =
      'position:fixed;top:12px;right:160px;z-index:9000;display:flex;align-items:center;gap:6px;background:rgba(15,23,42,0.92);backdrop-filter:blur(8px);border:1px solid #334155;border-radius:24px;padding:4px 8px;box-shadow:0 4px 12px rgba(0,0,0,0.25);font-family:Inter,system-ui,sans-serif;color:#ffffff;';

    var html = '';
    html += '<span style="font-size:11px;font-weight:700;color:#38bdf8;padding:0 6px;border-right:1px solid #334155;white-space:nowrap;">🇳🇵 ' + (sessionTitle.slice(0, 18) || 'Smart Board') + '</span>';
    html += '<button id="pd-btn-cloud-save" title="Save notes to school cloud and share with students" style="display:flex;align-items:center;gap:4px;background:#2563eb;color:#ffffff;border:none;border-radius:16px;padding:4px 10px;font-size:11px;font-weight:600;cursor:pointer;">☁️ Save</button>';
    html += '<button id="pd-btn-cloud-load" title="Load saved notes" style="display:flex;align-items:center;gap:4px;background:#1e293b;color:#cbd5e1;border:1px solid #475569;border-radius:16px;padding:4px 10px;font-size:11px;font-weight:600;cursor:pointer;">📂 Notes</button>';
    if (sessionId) {
      html += '<button id="pd-btn-end-session" title="End classroom teaching session" style="display:flex;align-items:center;gap:4px;background:#991b1b;color:#fecaca;border:none;border-radius:16px;padding:4px 10px;font-size:11px;font-weight:600;cursor:pointer;">⏹️ End</button>';
    }
    pill.innerHTML = html;
    document.body.appendChild(pill);

    document.getElementById('pd-btn-cloud-save')?.addEventListener('click', function () {
      saveCloudAnnotations(true);
    });
    document.getElementById('pd-btn-cloud-load')?.addEventListener('click', function () {
      openCloudAnnotationsModal();
    });
    document.getElementById('pd-btn-end-session')?.addEventListener('click', function () {
      endClassroomSession();
    });
  }

  // 6. Online Auto-Sync Handler for Pending Notes
  window.addEventListener('online', async function () {
    try {
      var queue = JSON.parse(localStorage.getItem('pending_cloud_annotations') || '[]');
      if (queue.length > 0) {
        for (var i = 0; i < queue.length; i++) {
          await fetch('/api/v1/smartboard/annotations', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(queue[i].payload),
          });
        }
        localStorage.removeItem('pending_cloud_annotations');
        if (window.App && typeof App.showToast === 'function') {
          App.showToast('✓ ' + queue.length + ' offline board notes synced to school cloud!');
        }
      }
    } catch (e) {}
  });

  // Initialization after DOM ready
  function start() {
    mountCloudSyncBar();
    setTimeout(initSessionResource, 500);
  }

  if (document.readyState === 'complete') {
    start();
  } else {
    window.addEventListener('load', start);
  }
})();


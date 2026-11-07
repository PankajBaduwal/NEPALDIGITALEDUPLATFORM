/**
 * Nepal Digital Education Ecosystem — Super Admin Portal Client
 */
'use strict';

const App = (() => {
  const API_BASE = '/api/v1';
  let token = localStorage.getItem('eduverse_admin_token') || '';
  let currentUser = null;
  let currentView = 'overview';
  let cachedPackages = [];
  let charts = {};
  let pendingImportRecords = [];

  // Pagination states
  let instPagination = { page: 1, limit: 10, total: 0 };
  let userPagination = { page: 1, limit: 15, total: 0 };

  async function api(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
      });

      if (res.status === 401) {
        // Attempt auto-login with default superadmin credentials if token expired
        const ok = await autoLoginSuperAdmin();
        if (ok) {
          headers['Authorization'] = `Bearer ${token}`;
          return fetch(`${API_BASE}${path}`, { ...options, headers }).then((r) => r.json());
        }
      }

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.message || json.error?.message || `Request failed (${res.status})`);
      }
      return json;
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  }

  async function autoLoginSuperAdmin() {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'superadmin', password: 'NepalSuperAdmin@2081' }),
      });
      const json = await res.json();
      if (res.ok && json.data?.token) {
        token = json.data.token;
        localStorage.setItem('eduverse_admin_token', token);
        currentUser = json.data.user;
        updateUserUI();
        return true;
      }
    } catch (e) {
      console.error('Auto login failed:', e);
    }
    return false;
  }

  function updateUserUI() {
    if (!currentUser) return;
    document.getElementById('current-user-name').textContent = currentUser.fullName || currentUser.username;
    document.getElementById('current-user-avatar').textContent = (currentUser.fullName || 'SA')
      .split(' ')
      .map((s) => s[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // ══════════════════════════════════════════════
  // NAVIGATION & VIEW SWITCHING
  // ══════════════════════════════════════════════
  const viewMeta = {
    overview: { title: 'Platform Overview', sub: 'Unified nationwide education administration' },
    institutions: { title: 'Institution Management', sub: 'Registered schools, colleges and academic centers in Nepal' },
    'bulk-import': { title: 'Bulk Institution Onboarding', sub: 'Import hundreds or thousands of schools via CSV/Excel' },
    administrators: { title: 'Institution Administrators', sub: 'School and college administrator provisioning and management' },
    users: { title: 'Central User Directory', sub: 'Platform-wide search for teachers, principals, administrators and students' },
    curriculum: { title: 'Nepal CDC Curriculum Framework', sub: 'Classes 1 through 12 complete syllabus organization' },
    textbooks: { title: 'CDC Textbooks Repository', sub: 'Digital textbooks for Classes 1–12 in Nepali and English medium' },
    simulations: { title: 'STEM Simulation Library', sub: 'Interactive laboratories connected to Smart Board classroom teaching' },
    activities: { title: 'Interactive Learning Activities', sub: 'Educational classroom games and cognitive activities' },
    subscriptions: { title: 'Subscription & Entitlements', sub: 'Foundation, Middle School, Secondary and TVET package management' },
    analytics: { title: 'Platform Analytics', sub: 'Deep performance, usage and syllabus completion metrics' },
    announcements: { title: 'Announcements', sub: 'System-wide announcements and operational updates' },
    'audit-logs': { title: 'Security Audit Trail', sub: 'Immutable log of administrative operations and access events' },
    settings: { title: 'System Settings', sub: 'Global platform configuration and integration parameters' },
  };

  function switchView(viewName) {
    currentView = viewName;

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.toggle('active', item.getAttribute('data-view') === viewName);
    });

    // Update headers
    const meta = viewMeta[viewName] || { title: viewName, sub: '' };
    document.getElementById('page-title').textContent = meta.title;
    document.getElementById('page-subtitle').textContent = meta.sub;

    // Hide all panels, show active
    document.querySelectorAll('.view-panel').forEach((panel) => {
      panel.style.display = panel.id === `view-${viewName}` ? 'block' : 'none';
    });

    // Load data for active view
    if (viewName === 'overview') loadOverview();
    else if (viewName === 'institutions') loadInstitutions();
    else if (viewName === 'administrators') loadAdministrators();
    else if (viewName === 'users') loadUsers();
    else if (viewName === 'curriculum') loadCurriculum();
    else if (viewName === 'textbooks') loadTextbooks();
    else if (viewName === 'simulations') loadSimulations();
    else if (viewName === 'activities') loadActivities();
    else if (viewName === 'subscriptions') loadSubscriptions();
    else if (viewName === 'analytics') loadAnalytics();
    else if (viewName === 'announcements') loadAnnouncements();
    else if (viewName === 'audit-logs') loadAuditLogs();
  }

  // ══════════════════════════════════════════════
  // 1. OVERVIEW & CHARTS
  // ══════════════════════════════════════════════
  async function loadOverview() {
    try {
      const res = await api('/admin/overview');
      const data = res.data;
      if (!data) return;

      // Fill Stats
      document.getElementById('stat-total-inst').textContent = data.metrics.totalInstitutions.toLocaleString();
      document.getElementById('stat-active-inst').textContent = data.metrics.activeInstitutions.toLocaleString();
      document.getElementById('stat-schools-colleges').textContent = `${data.metrics.totalSchools} / ${data.metrics.totalColleges}`;
      document.getElementById('stat-teachers').textContent = data.metrics.totalTeachers.toLocaleString();
      document.getElementById('stat-students').textContent = data.metrics.totalStudents.toLocaleString();
      document.getElementById('stat-subscriptions').textContent = data.metrics.activeSubscriptions.toLocaleString();
      document.getElementById('stat-expired-sub').textContent = data.metrics.expiredSubscriptions.toLocaleString();
      document.getElementById('stat-textbooks').textContent = data.metrics.totalTextbooks.toLocaleString();
      document.getElementById('stat-simulations').textContent = data.metrics.totalSimulations.toLocaleString();
      document.getElementById('stat-shared-notes').textContent = data.metrics.totalSharedNotes.toLocaleString();

      document.getElementById('badge-inst-count').textContent = data.metrics.totalInstitutions;

      // Render Charts
      renderGrowthChart(data.charts.growthTrend);
      renderPackagesChart(data.charts.subscriptionDistribution);
      renderProvinceChart(data.charts.provinceDistribution);
      renderTypesChart(data.charts.typeDistribution);
    } catch (e) {
      console.error(e);
    }
  }

  function renderGrowthChart(growthData = []) {
    const ctx = document.getElementById('chart-growth');
    if (!ctx) return;
    if (charts.growth) charts.growth.destroy();

    const labels = growthData.map((d) => d.month);
    const institutions = growthData.map((d) => d.institutions);
    const students = growthData.map((d) => d.students);

    charts.growth = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Institutions Registered',
            data: institutions,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.35,
          },
          {
            label: 'Students Enrolled',
            data: students,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            fill: true,
            tension: 0.35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } },
      },
    });
  }

  function renderPackagesChart(packagesData = {}) {
    const ctx = document.getElementById('chart-packages');
    if (!ctx) return;
    if (charts.packages) charts.packages.destroy();

    const labels = Object.keys(packagesData);
    const data = Object.values(packagesData);

    charts.packages = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels.length ? labels : ['No Active Subscriptions'],
        datasets: [
          {
            data: data.length ? data : [1],
            backgroundColor: ['#2563eb', '#10b981', '#7c3aed', '#f59e0b', '#e2e8f0'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    });
  }

  function renderProvinceChart(provinceData = {}) {
    const ctx = document.getElementById('chart-provinces');
    if (!ctx) return;
    if (charts.provinces) charts.provinces.destroy();

    const labels = Object.keys(provinceData);
    const data = Object.values(provinceData);

    charts.provinces = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Schools per Province',
            data,
            backgroundColor: '#3b82f6',
            borderRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true }, x: { grid: { display: false } } },
      },
    });
  }

  function renderTypesChart(typesData = {}) {
    const ctx = document.getElementById('chart-types');
    if (!ctx) return;
    if (charts.types) charts.types.destroy();

    charts.types = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Community (Govt)', 'Institutional (Private)', 'Religious', 'Technical'],
        datasets: [
          {
            data: [
              typesData.COMMUNITY || 0,
              typesData.INSTITUTIONAL || 0,
              typesData.RELIGIOUS || 0,
              typesData.TECHNICAL || 0,
            ],
            backgroundColor: ['#10b981', '#2563eb', '#f59e0b', '#8b5cf6'],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    });
  }

  // ══════════════════════════════════════════════
  // 2. INSTITUTIONS MANAGEMENT
  // ══════════════════════════════════════════════
  async function loadInstitutions() {
    const search = document.getElementById('search-institutions').value.trim();
    const province = document.getElementById('filter-inst-province').value;
    const type = document.getElementById('filter-inst-type').value;
    const status = document.getElementById('filter-inst-status').value;

    const query = new URLSearchParams({
      page: String(instPagination.page),
      limit: String(instPagination.limit),
      search,
      province,
      type,
      status,
    });

    const res = await api(`/admin/institutions?${query.toString()}`);
    if (!res.data) return;

    const { items, pagination } = res.data;
    instPagination.total = pagination.total;

    document.getElementById('inst-pagination-text').textContent = `Showing ${(pagination.page - 1) * pagination.limit + 1} to ${Math.min(
      pagination.page * pagination.limit,
      pagination.total
    )} of ${pagination.total} entries`;

    document.getElementById('btn-inst-prev').disabled = pagination.page <= 1;
    document.getElementById('btn-inst-next').disabled = pagination.page >= pagination.totalPages;

    const tbody = document.getElementById('tbody-institutions');
    tbody.innerHTML = '';

    if (!items.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-muted)">No institutions match your search criteria.</td></tr>`;
      return;
    }

    items.forEach((inst) => {
      const tr = document.createElement('tr');
      const admin = inst.users[0];
      const pkg = inst.subscriptions[0]?.package?.name || 'No Active Package';

      tr.innerHTML = `
        <td>
          <div style="font-weight:700;color:var(--primary);font-size:12.5px;">${inst.code}</div>
          <div style="font-size:11px;color:var(--text-muted)">${inst.emisCode ? `EMIS: ${inst.emisCode}` : 'Auto-generated'}</div>
        </td>
        <td>
          <div style="font-weight:600;font-size:13.5px;">${inst.name}</div>
          <div style="font-size:11.5px;color:var(--text-muted)">${inst.nameNepali || ''}</div>
        </td>
        <td><span class="type-pill">${inst.type}</span></td>
        <td>
          <div style="font-size:12.5px;">${inst.district}</div>
          <div style="font-size:11px;color:var(--text-muted)">${inst.province}</div>
        </td>
        <td><span style="font-size:12px;font-weight:500;color:#1e40af;">${pkg}</span></td>
        <td>
          <div style="font-size:12px;font-weight:600;">${admin ? admin.fullName : '<span style="color:var(--danger)">Unassigned</span>'}</div>
          <div style="font-size:11px;color:var(--text-muted)">${inst.email || inst.phone || ''}</div>
        </td>
        <td><span class="status-badge ${inst.status.toLowerCase()}">${inst.status}</span></td>
        <td style="text-align:right">
          <div style="display:inline-flex;gap:4px;">
            <button class="page-btn" onclick="App.openEditModal('${inst.id}')" title="Edit Information">Edit</button>
            <button class="page-btn" onclick="App.openAdminModal('${inst.id}', '${inst.name.replace(/'/g, "\\'")}')" title="Provision Administrator">Admin</button>
            <button class="page-btn" onclick="App.openSubscriptionModal('${inst.id}', '${inst.name.replace(/'/g, "\\'")}')" title="Manage Subscription">Package</button>
            <button class="page-btn" style="color:var(--danger)" onclick="App.toggleInstStatus('${inst.id}', '${inst.status}')" title="Toggle Status">${inst.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  async function openCreateModal() {
    document.getElementById('form-institution').reset();
    document.getElementById('inst-id').value = '';
    document.getElementById('modal-inst-title').textContent = 'Register New School or College';
    document.getElementById('wrap-admin-provisioning').style.display = 'block';
    document.getElementById('wrap-admin-user').style.display = 'block';
    document.getElementById('wrap-admin-pass').style.display = 'block';
    document.getElementById('modal-institution').classList.add('open');
  }

  async function openEditModal(instId) {
    const res = await api(`/admin/institutions/${instId}`);
    const inst = res.data;
    if (!inst) return;

    document.getElementById('inst-id').value = inst.id;
    document.getElementById('inst-name').value = inst.name || '';
    document.getElementById('inst-name-nepali').value = inst.nameNepali || '';
    document.getElementById('inst-type').value = inst.type || 'COMMUNITY';
    document.getElementById('inst-emis').value = inst.emisCode || '';
    document.getElementById('inst-province').value = inst.province || 'Bagmati Province';
    document.getElementById('inst-district').value = inst.district || '';
    document.getElementById('inst-local-level').value = inst.localLevel || '';
    document.getElementById('inst-ward').value = inst.ward || '';
    document.getElementById('inst-email').value = inst.email || '';
    document.getElementById('inst-phone').value = inst.phone || '';

    document.getElementById('modal-inst-title').textContent = `Edit Institution: ${inst.name}`;
    document.getElementById('wrap-admin-provisioning').style.display = 'none';
    document.getElementById('wrap-admin-user').style.display = 'none';
    document.getElementById('wrap-admin-pass').style.display = 'none';

    document.getElementById('modal-institution').classList.add('open');
  }

  async function handleSaveInstitution(e) {
    e.preventDefault();
    const id = document.getElementById('inst-id').value;
    const data = {
      name: document.getElementById('inst-name').value.trim(),
      nameNepali: document.getElementById('inst-name-nepali').value.trim() || undefined,
      type: document.getElementById('inst-type').value,
      emisCode: document.getElementById('inst-emis').value.trim() || undefined,
      province: document.getElementById('inst-province').value,
      district: document.getElementById('inst-district').value.trim(),
      localLevel: document.getElementById('inst-local-level').value.trim(),
      ward: document.getElementById('inst-ward').value ? parseInt(document.getElementById('inst-ward').value, 10) : undefined,
      email: document.getElementById('inst-email').value.trim() || undefined,
      phone: document.getElementById('inst-phone').value.trim() || undefined,
      adminUsername: document.getElementById('inst-admin-username').value.trim() || undefined,
      adminPassword: document.getElementById('inst-admin-password').value || undefined,
    };

    try {
      if (id) {
        await api(`/admin/institutions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
        showToast('Institution updated successfully', 'success');
      } else {
        await api('/admin/institutions', { method: 'POST', body: JSON.stringify(data) });
        showToast('Institution registered successfully', 'success');
      }
      closeModals();
      loadInstitutions();
      loadOverview();
    } catch (e) {}
  }

  async function toggleInstStatus(id, currentStatus) {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Are you sure you want to change this institution's status to ${newStatus}?`)) return;

    try {
      await api(`/admin/institutions/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Institution status set to ${newStatus}`, 'success');
      loadInstitutions();
      loadOverview();
    } catch (e) {}
  }

  function openAdminModal(instId, instName) {
    document.getElementById('form-provision-admin').reset();
    document.getElementById('prov-inst-id').value = instId;
    document.getElementById('prov-inst-name').value = instName;
    document.getElementById('modal-provision-admin').classList.add('open');
  }

  async function handleProvisionAdmin(e) {
    e.preventDefault();
    const instId = document.getElementById('prov-inst-id').value;
    const data = {
      fullName: document.getElementById('prov-fullname').value.trim(),
      username: document.getElementById('prov-username').value.trim(),
      email: document.getElementById('prov-email').value.trim() || undefined,
      password: document.getElementById('prov-password').value || undefined,
    };

    try {
      const res = await api(`/admin/institutions/${instId}/admin`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      closeModals();
      showToast(`Admin account '${res.data.adminUser.username}' provisioned (Temp pass: ${res.data.tempPassword})`, 'success');
      loadInstitutions();
    } catch (e) {}
  }

  async function openSubscriptionModal(instId, instName) {
    document.getElementById('form-subscription').reset();
    document.getElementById('sub-inst-id').value = instId;
    document.getElementById('sub-inst-name').value = instName;

    // Load package options
    if (!cachedPackages.length) {
      const res = await api('/subscriptions/packages');
      cachedPackages = res.data || [];
    }

    const select = document.getElementById('sub-package-id');
    select.innerHTML = cachedPackages
      .map((p) => `<option value="${p.id}">${p.name} (${p.code})</option>`)
      .join('');

    document.getElementById('modal-subscription').classList.add('open');
  }

  async function handleAssignSubscription(e) {
    e.preventDefault();
    const data = {
      institutionId: document.getElementById('sub-inst-id').value,
      packageId: document.getElementById('sub-package-id').value,
      durationMonths: parseInt(document.getElementById('sub-duration').value, 10),
    };

    try {
      await api('/subscriptions/assign', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      closeModals();
      showToast('Subscription package successfully assigned to institution', 'success');
      loadInstitutions();
      loadOverview();
    } catch (e) {}
  }

  // ══════════════════════════════════════════════
  // 3. BULK IMPORT ENGINE
  // ══════════════════════════════════════════════
  function initBulkImport() {
    const dropzone = document.getElementById('import-dropzone');
    const fileInput = document.getElementById('file-bulk-import');
    const templateBtn = document.getElementById('btn-download-template');
    const executeBtn = document.getElementById('btn-execute-import');

    if (dropzone) {
      dropzone.onclick = () => fileInput.click();
      dropzone.ondragover = (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#2563eb';
        dropzone.style.background = '#eff6ff';
      };
      dropzone.ondragleave = () => {
        dropzone.style.borderColor = '#cbd5e1';
        dropzone.style.background = '#fafafa';
      };
      dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#cbd5e1';
        dropzone.style.background = '#fafafa';
        if (e.dataTransfer.files?.[0]) handleImportFile(e.dataTransfer.files[0]);
      };
    }

    if (fileInput) {
      fileInput.onchange = (e) => {
        if (e.target.files?.[0]) handleImportFile(e.target.files[0]);
      };
    }

    if (templateBtn) {
      templateBtn.onclick = () => {
        window.location.href = `${API_BASE}/admin/institutions/import/template`;
      };
    }

    if (executeBtn) {
      executeBtn.onclick = executeBulkImport;
    }
  }

  async function handleImportFile(file) {
    showToast(`Parsing and validating ${file.name}...`, 'info');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/admin/institutions/import/validate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Validation failed');

      renderValidationPreview(json.data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }

  function renderValidationPreview(preview) {
    pendingImportRecords = preview.validRows || [];
    const card = document.getElementById('import-preview-card');
    card.style.display = 'block';

    document.getElementById('preview-summary-title').textContent = `Validation Preview (${preview.totalRows} records analyzed)`;
    document.getElementById('preview-summary-sub').innerHTML = `
      <b style="color:var(--success)">${preview.validRows.length} Valid Records</b> &bull; 
      <b style="color:var(--danger)">${preview.invalidRows.length} Errors</b> &bull; 
      <b>${preview.duplicatesDetected} Duplicates Blocked</b>
    `;

    const tbody = document.getElementById('tbody-import-preview');
    tbody.innerHTML = '';

    // Show errors first
    preview.invalidRows.forEach((r) => {
      const tr = document.createElement('tr');
      tr.style.background = '#fef2f2';
      tr.innerHTML = `
        <td>${r.row}</td>
        <td><code>${r.emisCode || 'None'}</code></td>
        <td><span style="color:var(--danger)">Row has validation errors</span></td>
        <td>-</td>
        <td>-</td>
        <td><span class="status-badge suspended">${r.errors.join('; ')}</span></td>
      `;
      tbody.appendChild(tr);
    });

    // Show valid rows
    preview.validRows.forEach((r) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${r.row}</td>
        <td><code>${r.emisCode || 'Auto ID'}</code></td>
        <td><b>${r.name}</b> <small>(${r.type})</small></td>
        <td>${r.province}</td>
        <td>${r.district}, ${r.localLevel}</td>
        <td><span class="status-badge active">&check; Valid</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  async function executeBulkImport() {
    if (!pendingImportRecords.length) {
      showToast('No valid records ready for onboarding', 'warning');
      return;
    }

    const confirmed = confirm(`Proceed with onboarding ${pendingImportRecords.length} validated institutions and auto-provisioning administrator accounts?`);
    if (!confirmed) return;

    try {
      showToast('Executing bulk onboarding in background...', 'info');
      const res = await api('/admin/institutions/import/execute', {
        method: 'POST',
        body: JSON.stringify({ institutions: pendingImportRecords }),
      });

      const report = res.data;
      showToast(`Success! ${report.successCount} institutions registered, ${report.failedCount} failed`, 'success');
      document.getElementById('import-preview-card').style.display = 'none';
      pendingImportRecords = [];
      loadInstitutions();
      loadOverview();
    } catch (e) {}
  }

  // ══════════════════════════════════════════════
  // 4. CENTRAL USER MANAGEMENT
  // ══════════════════════════════════════════════
  async function loadUsers() {
    const search = document.getElementById('search-users').value.trim();
    const role = document.getElementById('filter-user-role').value;
    const status = document.getElementById('filter-user-status').value;

    const query = new URLSearchParams({
      page: String(userPagination.page),
      limit: String(userPagination.limit),
      search,
      role,
      status,
    });

    const res = await api(`/admin/users?${query.toString()}`);
    if (!res.data) return;

    const { items, pagination } = res.data;
    userPagination.total = pagination.total;

    document.getElementById('user-pagination-text').textContent = `Showing ${(pagination.page - 1) * pagination.limit + 1} to ${Math.min(
      pagination.page * pagination.limit,
      pagination.total
    )} of ${pagination.total} entries`;

    document.getElementById('btn-user-prev').disabled = pagination.page <= 1;
    document.getElementById('btn-user-next').disabled = pagination.page >= pagination.totalPages;

    const tbody = document.getElementById('tbody-users');
    tbody.innerHTML = '';

    items.forEach((user) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight:600;">${user.fullName}</div>
          <div style="font-size:11.5px;color:var(--text-muted)">${user.fullNameNepali || ''}</div>
        </td>
        <td><code>${user.username}</code></td>
        <td><span class="type-pill">${user.role}</span></td>
        <td>
          <div style="font-size:12.5px;">${user.institution?.name || 'Platform Central'}</div>
          <div style="font-size:11px;color:var(--text-muted)">${user.institution?.code || ''}</div>
        </td>
        <td><span style="font-size:12px;color:var(--text-muted)">${user.role === 'STUDENT' ? '🔒 Privacy Protected' : user.email || '-'}</span></td>
        <td><span class="status-badge ${user.status === 'ACTIVE' ? 'active' : 'suspended'}">${user.status}</span></td>
        <td style="text-align:right">
          <button class="page-btn" onclick="App.toggleUserStatus('${user.id}', '${user.status}')">${user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</button>
          <button class="page-btn" onclick="App.resetPassword('${user.id}', '${user.username}')">Reset Pass</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  async function loadAdministrators() {
    const search = document.getElementById('search-admins').value.trim();
    const query = new URLSearchParams({ role: 'SCHOOL_ADMIN', search, limit: '50' });

    const res = await api(`/admin/users?${query.toString()}`);
    if (!res.data) return;

    const tbody = document.getElementById('tbody-administrators');
    tbody.innerHTML = '';

    res.data.items.forEach((admin) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight:600;">${admin.fullName}</div>
          <div style="font-size:11.5px;color:var(--text-muted)">Created: ${new Date(admin.createdAt).toLocaleDateString()}</div>
        </td>
        <td><code>${admin.username}</code></td>
        <td><span class="type-pill">School Admin</span></td>
        <td><b>${admin.institution?.name || 'Unassigned'}</b></td>
        <td>${admin.email || admin.phone || '-'}</td>
        <td><span class="status-badge ${admin.status === 'ACTIVE' ? 'active' : 'suspended'}">${admin.status}</span></td>
        <td style="text-align:right">
          <button class="page-btn" onclick="App.resetPassword('${admin.id}', '${admin.username}')">Reset Password</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  async function toggleUserStatus(userId, currentStatus) {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`User status set to ${newStatus}`, 'success');
      loadUsers();
    } catch (e) {}
  }

  async function resetPassword(userId, username) {
    const promptPass = prompt(`Enter new password for ${username} (or leave blank to auto-generate):`);
    if (promptPass === null) return;

    try {
      const res = await api(`/admin/users/${userId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password: promptPass || undefined }),
      });
      alert(`Password updated for ${username}!\nNew Temporary Password: ${res.data.temporaryPassword}`);
    } catch (e) {}
  }

  // ══════════════════════════════════════════════
  // 5. CURRICULUM, TEXTBOOKS, SIMULATIONS
  // ══════════════════════════════════════════════
  async function loadCurriculum() {
    const grid = document.getElementById('curriculum-classes-grid');
    grid.innerHTML = '';

    const classes = [
      { grade: 1, name: 'Class 1 (Basic)', medium: 'Nepali & English', subjects: ['Mero Ganit', 'My English', 'Hamro Serophero', 'Mero Nepali'] },
      { grade: 2, name: 'Class 2 (Basic)', medium: 'Nepali & English', subjects: ['Mero Ganit', 'My English', 'Hamro Serophero', 'Mero Nepali'] },
      { grade: 3, name: 'Class 3 (Basic)', medium: 'Nepali & English', subjects: ['Mero Ganit', 'My English', 'Hamro Serophero', 'Mero Nepali'] },
      { grade: 4, name: 'Class 4 (Basic)', medium: 'Nepali & English', subjects: ['Math', 'Science', 'English', 'Nepali', 'HPC'] },
      { grade: 5, name: 'Class 5 (Basic)', medium: 'Nepali & English', subjects: ['Math', 'Science & Tech', 'Social', 'Nepali', 'English', 'Chepang/Khaling'] },
      { grade: 6, name: 'Class 6 (Middle)', medium: 'Nepali & English', subjects: ['Math', 'Science & Tech', 'Social Studies', 'Nepali', 'English', 'HPC'] },
      { grade: 7, name: 'Class 7 (Middle)', medium: 'Nepali & English', subjects: ['Math', 'Science & Tech', 'Social Studies', 'Nepali', 'English', 'HPCA'] },
      { grade: 8, name: 'Class 8 (BLE)', medium: 'Nepali & English', subjects: ['Math', 'Science & Tech', 'Social Studies', 'Nepali', 'English', 'HPCA', 'Awadhi'] },
      { grade: 9, name: 'Class 9 (Secondary)', medium: 'Nepali & English', subjects: ['Compulsory Math', 'Optional Math', 'Science & Tech', 'Social', 'English', 'Computer Science'] },
      { grade: 10, name: 'Class 10 (SEE)', medium: 'Nepali & English', subjects: ['Compulsory Math', 'Optional Math', 'Science & Tech', 'Social', 'English', 'Economics', 'Account'] },
      { grade: 11, name: 'Class 11 (NEB)', medium: 'English & Nepali', subjects: ['Physics', 'Chemistry', 'Biology', 'Account', 'Social', 'Nepali', 'English'] },
      { grade: 12, name: 'Class 12 (NEB)', medium: 'English & Nepali', subjects: ['Physics', 'Chemistry', 'Biology', 'Social', 'Nepali', 'English'] },
    ];

    classes.forEach((c) => {
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `
        <div style="font-weight:700;font-size:15px;margin-bottom:4px;color:var(--primary);">${c.name}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">Medium: <b>${c.medium}</b></div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">
          ${c.subjects.map((s) => `<span class="type-pill" style="font-size:10.5px;">${s}</span>`).join('')}
        </div>
      `;
      grid.appendChild(card);
    });
  }

  async function loadTextbooks() {
    const res = await api('/curriculum/subjects');
    const tbody = document.getElementById('tbody-textbooks');
    tbody.innerHTML = '';

    (res.data || []).forEach((s) => {
      (s.textbooks || []).forEach((t) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><b>${s.name}</b> <small>(${s.nameNepali || ''})</small></td>
          <td><span class="type-pill">Grade ${s.gradeNumber}</span></td>
          <td>${t.title}</td>
          <td><b>${t.medium}</b></td>
          <td>${t.edition || 'CDC Nepal'}</td>
          <td><code>${t.filePath}</code></td>
          <td style="text-align:right">
            <a href="/smartboard/index.html?curriculum=grade-${s.gradeNumber}&subject=${encodeURIComponent(s.code)}" target="_blank" class="page-btn" style="text-decoration:none;display:inline-block;">Open on Board</a>
          </td>
        `;
        tbody.appendChild(tr);
      });
    });
  }

  async function loadSimulations() {
    const grid = document.getElementById('simulations-grid');
    grid.innerHTML = '';

    const list = [
      { title: 'Electrical Circuits Lab (DC / AC)', grade: 'Classes 9–12', code: 'ee-simulation.html', badge: 'Secondary' },
      { title: 'Physics Lab (Mechanics & Waves)', grade: 'Classes 9–12', code: 'physics-lab.js', badge: 'Secondary' },
      { title: 'Chemistry 3D Molecular Engine', grade: 'Classes 9–12', code: 'chem-simulation.html', badge: 'Secondary' },
      { title: 'Geometry & Compass Visualizer', grade: 'Classes 6–10', code: 'tools/compass-geometry.js', badge: 'Middle' },
      { title: 'Math 2D & 3D Solids Explorer', grade: 'Classes 1–10', code: 'math-simulations.js', badge: 'Foundation' },
      { title: 'Computer Science & DSA Bridge', grade: 'Classes 9–12', code: 'dsa-simulation.html', badge: 'Secondary' },
      { title: 'Engineering Graphics & Projection', grade: 'Classes 9–12 (TVET)', code: 'eg-simulation.html', badge: 'TVET' },
      { title: 'Database & SQL Virtual Lab', grade: 'Classes 10–12', code: 'dbms-simulation.html', badge: 'Secondary' },
      { title: 'Operating Systems Scheduling', grade: 'Classes 11–12', code: 'os-simulation.html', badge: 'Secondary' },
    ];

    list.forEach((sim) => {
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <h4 style="font-size:14px;font-weight:700;">${sim.title}</h4>
          <span class="type-pill">${sim.badge}</span>
        </div>
        <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Covered: ${sim.grade}</p>
        <a href="/smartboard/${sim.code}" target="_blank" class="btn-outline" style="text-decoration:none;font-size:12px;padding:4px 10px;">Launch Simulation</a>
      `;
      grid.appendChild(card);
    });
  }

  async function loadActivities() {
    const grid = document.getElementById('activities-grid');
    grid.innerHTML = '';
    const games = [
      { name: 'Classroom Trivia Challenge', icon: '❓', desc: 'Curriculum-aligned multi-choice live team competition' },
      { name: 'Visual Memory Match', icon: '🧠', desc: 'Card flipping memory test for scientific terms and formulas' },
      { name: 'Smart Drawing & Guess', icon: '🎨', desc: 'Pencil sketch recognition and vocabulary building' },
      { name: 'Word & Spell Master', icon: '🔤', desc: 'Bilingual Nepali and English word formation exercises' },
      { name: 'Number & Sequence Race', icon: '🔢', desc: 'Arithmetic progressions, prime numbers and algebra speed match' },
      { name: 'Spot the Difference Lab', icon: '🔍', desc: 'Biology diagrams, map reading and observation challenges' },
    ];

    games.forEach((g) => {
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `
        <div style="font-size:32px;margin-bottom:8px;">${g.icon}</div>
        <h4 style="font-size:14px;font-weight:700;margin-bottom:4px;">${g.name}</h4>
        <p style="font-size:12px;color:var(--text-muted);">${g.desc}</p>
      `;
      grid.appendChild(card);
    });
  }

  async function loadSubscriptions() {
    const res = await api('/subscriptions/packages');
    const grid = document.getElementById('packages-cards-grid');
    grid.innerHTML = '';

    (res.data || []).forEach((pkg) => {
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.style.borderTop = '4px solid #2563eb';
      card.innerHTML = `
        <div style="font-weight:700;font-size:16px;color:#0f172a;margin-bottom:4px;">${pkg.name}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Code: <code>${pkg.code}</code></div>
        <p style="font-size:13px;color:#334155;margin-bottom:14px;">${pkg.description || ''}</p>
        <div style="font-size:12px;font-weight:600;margin-bottom:6px;">Grades Included:</div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:16px;">
          ${pkg.gradesCovered.split(',').map((g) => `<span class="type-pill">Class ${g}</span>`).join('')}
        </div>
      `;
      grid.appendChild(card);
    });
  }

  async function loadAnalytics() {
    // Secondary charts
    const ctxRes = document.getElementById('chart-analytics-res');
    if (ctxRes && !charts.analyticsRes) {
      charts.analyticsRes = new Chart(ctxRes, {
        type: 'radar',
        data: {
          labels: ['Textbook PDFs', 'Simulations', 'Board Notes', 'Attendance', 'Assessments', 'AI Queries'],
          datasets: [
            {
              label: 'Platform Activity Index',
              data: [95, 80, 70, 85, 75, 90],
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.2)',
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }

    const ctxGrades = document.getElementById('chart-analytics-grades');
    if (ctxGrades && !charts.analyticsGrades) {
      charts.analyticsGrades = new Chart(ctxGrades, {
        type: 'bar',
        data: {
          labels: ['Grades 1-5', 'Grades 6-8', 'Grades 9-10', 'Grades 11-12'],
          datasets: [{ label: 'Institutions Enrolled', data: [120, 240, 310, 180], backgroundColor: '#10b981' }],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    }
  }

  async function loadAnnouncements() {
    const res = await api('/admin/announcements');
    const container = document.getElementById('announcements-list');
    container.innerHTML = '';

    (res.data || []).forEach((a) => {
      const item = document.createElement('div');
      item.className = 'stat-card';
      item.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <h4 style="font-size:15px;font-weight:700;">${a.title}</h4>
          <span class="type-pill">${a.targetRole}</span>
        </div>
        <p style="font-size:13px;color:var(--text-main);margin-bottom:8px;">${a.content}</p>
        <span style="font-size:11px;color:var(--text-muted);">${new Date(a.createdAt).toLocaleString()} by ${a.authorName}</span>
      `;
      container.appendChild(item);
    });
  }

  async function loadAuditLogs() {
    const res = await api('/admin/audit-logs');
    const tbody = document.getElementById('tbody-audit-logs');
    tbody.innerHTML = '';

    (res.data?.items || []).forEach((log) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><small>${new Date(log.createdAt).toLocaleString()}</small></td>
        <td><span class="type-pill" style="font-size:11px;">${log.action}</span></td>
        <td><b>${log.entityType}</b> ${log.entityId ? `<small>(${log.entityId.substring(0, 8)}...)</small>` : ''}</td>
        <td>${log.userEmail || log.userId}</td>
        <td><code>${log.ipAddress || '127.0.0.1'}</code></td>
        <td><small style="color:var(--text-muted);">${log.details || '-'}</small></td>
      `;
      tbody.appendChild(tr);
    });
  }

  function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach((m) => m.classList.remove('open'));
  }

  // ══════════════════════════════════════════════
  // INITIALIZATION
  // ══════════════════════════════════════════════
  async function init() {
    // Navigation binding
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', () => {
        const view = item.getAttribute('data-view');
        if (view) switchView(view);
      });
    });

    // Logout
    document.getElementById('btn-logout').onclick = () => {
      localStorage.removeItem('eduverse_admin_token');
      location.reload();
    };

    // Filter events
    const debouncedInst = debounce(loadInstitutions, 300);
    document.getElementById('search-institutions').oninput = debouncedInst;
    document.getElementById('filter-inst-province').onchange = loadInstitutions;
    document.getElementById('filter-inst-type').onchange = loadInstitutions;
    document.getElementById('filter-inst-status').onchange = loadInstitutions;

    document.getElementById('btn-inst-prev').onclick = () => {
      if (instPagination.page > 1) {
        instPagination.page--;
        loadInstitutions();
      }
    };
    document.getElementById('btn-inst-next').onclick = () => {
      instPagination.page++;
      loadInstitutions();
    };

    const debouncedUsers = debounce(loadUsers, 300);
    document.getElementById('search-users').oninput = debouncedUsers;
    document.getElementById('filter-user-role').onchange = loadUsers;
    document.getElementById('filter-user-status').onchange = loadUsers;

    document.getElementById('btn-user-prev').onclick = () => {
      if (userPagination.page > 1) {
        userPagination.page--;
        loadUsers();
      }
    };
    document.getElementById('btn-user-next').onclick = () => {
      userPagination.page++;
      loadUsers();
    };

    document.getElementById('search-admins').oninput = debounce(loadAdministrators, 300);

    // Modal forms
    document.getElementById('btn-create-school').onclick = openCreateModal;
    document.getElementById('form-institution').onsubmit = handleSaveInstitution;
    document.getElementById('form-provision-admin').onsubmit = handleProvisionAdmin;
    document.getElementById('form-subscription').onsubmit = handleAssignSubscription;

    // Bulk Import
    initBulkImport();

    // Verify session or auto-login
    if (!token) {
      await autoLoginSuperAdmin();
    } else {
      try {
        const me = await api('/auth/me');
        currentUser = me.data;
        updateUserUI();
      } catch (e) {
        await autoLoginSuperAdmin();
      }
    }

    // Start with overview
    switchView('overview');
  }

  function debounce(fn, ms) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), ms);
    };
  }

  return {
    init,
    openEditModal,
    openAdminModal,
    openSubscriptionModal,
    toggleInstStatus,
    toggleUserStatus,
    resetPassword,
    closeModals,
  };
})();

document.addEventListener('DOMContentLoaded', App.init);


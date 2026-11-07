/**
 * Nepal Digital Education Ecosystem — Institution Administration Client
 */
'use strict';

const App = (() => {
  const API_BASE = '/api/v1';
  let token = localStorage.getItem('eduverse_school_token') || '';
  let currentUser = null;
  let institution = null;
  let currentView = 'overview';
  let cachedStructure = null;
  let cachedTeachers = [];

  async function api(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
      });

      if (res.status === 401) {
        // Attempt auto-login with school admin credentials
        const ok = await autoLoginSchoolAdmin();
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

  async function autoLoginSchoolAdmin() {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin_kmss', password: 'Nepal@1234' }),
      });
      const json = await res.json();
      if (res.ok && json.data?.token) {
        token = json.data.token;
        localStorage.setItem('eduverse_school_token', token);
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
    document.getElementById('sidebar-inst-name').textContent = currentUser.institutionName || 'School Dashboard';
    document.getElementById('current-inst-code').textContent = currentUser.institutionCode || 'SCH-2081-XXXX';
    document.getElementById('current-user-avatar').textContent = (currentUser.fullName || 'AD')
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
  // NAVIGATION
  // ══════════════════════════════════════════════
  const viewMeta = {
    overview: { title: 'Institution Overview', sub: 'Real-time academic operations and monitoring' },
    teachers: { title: 'Faculty & Teacher Management', sub: 'Teacher profiles, subject assignments and class teacher duties' },
    students: { title: 'Student Management & Enrollment', sub: 'Admission numbers, section enrollment and guardian info' },
    classes: { title: 'Classes Configuration', sub: 'Class levels (1–12) and curriculum medium' },
    sections: { title: 'Sections Management', sub: 'Class sections and student capacity' },
    subjects: { title: 'Subject Offerings', sub: 'Curated curriculum subjects offered by the school' },
    allocations: { title: 'Subject Allocations', sub: 'Assign subjects and sections to teachers' },
    'class-teachers': { title: 'Class Teacher Supervision', sub: 'Primary class teacher assignments' },
    timetable: { title: 'Class Timetable Schedule', sub: 'Weekly schedule of periods and classrooms' },
    years: { title: 'Academic Years', sub: 'Calendar management (Bikram Sambat)' },
    announcements: { title: 'School Announcements', sub: 'Targeted communications for teachers, students or classes' },
    reports: { title: 'Institutional Reports', sub: 'Attendance, enrollments and academic summaries' },
    settings: { title: 'Institution Settings', sub: 'Profile, campus address and daily school timings' },
  };

  function switchView(viewName) {
    currentView = viewName;
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.toggle('active', item.getAttribute('data-view') === viewName);
    });

    const meta = viewMeta[viewName] || { title: viewName, sub: '' };
    document.getElementById('page-title').textContent = meta.title;
    document.getElementById('page-subtitle').textContent = meta.sub;

    document.querySelectorAll('.view-panel').forEach((panel) => {
      panel.style.display = panel.id === `view-${viewName}` ? 'block' : 'none';
    });

    if (viewName === 'overview') loadOverview();
    else if (viewName === 'teachers') loadTeachers();
    else if (viewName === 'students') loadStudents();
    else if (viewName === 'classes' || viewName === 'sections' || viewName === 'subjects') loadAcademicStructure();
    else if (viewName === 'allocations') loadAllocations();
    else if (viewName === 'class-teachers') loadClassTeachers();
    else if (viewName === 'timetable') loadTimetable();
    else if (viewName === 'years') loadYears();
    else if (viewName === 'announcements') loadAnnouncements();
    else if (viewName === 'settings') loadProfile();
  }

  // ══════════════════════════════════════════════
  // 1. OVERVIEW
  // ══════════════════════════════════════════════
  async function loadOverview() {
    try {
      const res = await api('/school-admin/overview');
      const data = res.data;
      if (!data) return;

      document.getElementById('stat-students').textContent = data.metrics.totalStudents.toLocaleString();
      document.getElementById('stat-teachers').textContent = data.metrics.totalTeachers.toLocaleString();
      document.getElementById('stat-classes-sections').textContent = `${data.metrics.totalClasses} / ${data.metrics.totalSections}`;
      document.getElementById('stat-subjects').textContent = data.metrics.totalSubjects.toLocaleString();
      document.getElementById('stat-attendance').textContent = data.metrics.averageAttendance;
      document.getElementById('stat-score').textContent = data.metrics.academicPerformance;

      document.getElementById('today-day-pill').textContent = data.todayDay;

      // Today's Timetable
      const tbodyTimetable = document.getElementById('tbody-today-timetable');
      tbodyTimetable.innerHTML = '';
      if (!data.todayTimetable.length) {
        tbodyTimetable.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-muted)">No classes scheduled for today (${data.todayDay}).</td></tr>`;
      } else {
        data.todayTimetable.forEach((slot) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><b>${slot.time}</b></td>
            <td>${slot.className}</td>
            <td><span class="type-pill">${slot.subject}</span></td>
            <td>${slot.teacher}</td>
            <td><code>${slot.room}</code></td>
          `;
          tbodyTimetable.appendChild(tr);
        });
      }

      // Action Items / Pending Tasks
      const pendingList = document.getElementById('pending-tasks-list');
      pendingList.innerHTML = '';
      if (!data.pendingTasks.length) {
        pendingList.innerHTML = `<span style="font-size:12.5px;color:var(--success);font-weight:600;">✓ All sections and subjects are properly allocated!</span>`;
      } else {
        data.pendingTasks.forEach((t) => {
          const d = document.createElement('div');
          d.style.padding = '10px 12px';
          d.style.background = t.type === 'WARNING' ? 'var(--warning-bg)' : '#eff6ff';
          d.style.borderLeft = `3px solid ${t.type === 'WARNING' ? 'var(--warning)' : '#3b82f6'}`;
          d.style.borderRadius = '4px';
          d.innerHTML = `
            <div style="font-size:12.5px;font-weight:700;">${t.title}</div>
            <div style="font-size:11.5px;color:var(--text-muted);">${t.message}</div>
          `;
          pendingList.appendChild(d);
        });
      }

      // Upcoming Exams
      const examsList = document.getElementById('upcoming-exams-list');
      examsList.innerHTML = '';
      if (!data.upcomingExaminations.length) {
        examsList.innerHTML = `<span style="font-size:12.5px;color:var(--text-muted);">No pending examinations scheduled.</span>`;
      } else {
        data.upcomingExaminations.forEach((e) => {
          const d = document.createElement('div');
          d.style.padding = '8px 10px';
          d.style.border = '1px solid var(--border)';
          d.style.borderRadius = '6px';
          d.innerHTML = `
            <div style="font-size:13px;font-weight:600;">${e.name}</div>
            <div style="font-size:11.5px;color:var(--text-muted);">${e.className} &bull; ${e.subject}</div>
          `;
          examsList.appendChild(d);
        });
      }
    } catch (e) {}
  }

  // ══════════════════════════════════════════════
  // 2. TEACHERS
  // ══════════════════════════════════════════════
  async function loadTeachers() {
    const res = await api('/school-admin/teachers');
    cachedTeachers = res.data || [];

    const tbody = document.getElementById('tbody-teachers');
    tbody.innerHTML = '';

    cachedTeachers.forEach((t) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight:600;">${t.fullName}</div>
          <div style="font-size:11.5px;color:var(--text-muted);">${t.fullNameNepali || ''}</div>
        </td>
        <td><code>${t.username}</code></td>
        <td><span class="type-pill">${t.assignedSubjectsCount} subjects</span></td>
        <td>${t.isClassTeacher ? `<span class="status-badge active">★ ${t.supervisedSections.join(', ')}</span>` : '<span style="color:var(--text-muted);font-size:12px;">None</span>'}</td>
        <td>
          <div style="font-size:12px;">${t.email || '-'}</div>
          <div style="font-size:11px;color:var(--text-muted);">${t.phone || ''}</div>
        </td>
        <td><span class="status-badge ${t.status.toLowerCase()}">${t.status}</span></td>
        <td style="text-align:right">
          <button class="page-btn" onclick="App.toggleTeacherStatus('${t.id}', '${t.status}')">${t.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  async function handleAddTeacher(e) {
    e.preventDefault();
    const data = {
      fullName: document.getElementById('teacher-fullname').value.trim(),
      fullNameNepali: document.getElementById('teacher-fullname-nepali').value.trim() || undefined,
      username: document.getElementById('teacher-username').value.trim(),
      email: document.getElementById('teacher-email').value.trim() || undefined,
      phone: document.getElementById('teacher-phone').value.trim() || undefined,
      password: document.getElementById('teacher-password').value || undefined,
    };

    try {
      const res = await api('/school-admin/teachers', { method: 'POST', body: JSON.stringify(data) });
      closeModals();
      showToast(`Teacher '${res.data.teacher.fullName}' registered successfully! (Password: ${res.data.tempPassword})`, 'success');
      loadTeachers();
    } catch (e) {}
  }

  async function toggleTeacherStatus(teacherId, currentStatus) {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api(`/school-admin/teachers/${teacherId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Teacher status set to ${newStatus}`, 'success');
      loadTeachers();
    } catch (e) {}
  }

  // ══════════════════════════════════════════════
  // 3. STUDENTS
  // ══════════════════════════════════════════════
  async function loadStudents() {
    const search = document.getElementById('search-students').value.trim();
    const classId = document.getElementById('filter-student-class').value;

    const query = new URLSearchParams({ search, classId });
    const res = await api(`/school-admin/students?${query.toString()}`);
    const tbody = document.getElementById('tbody-students');
    tbody.innerHTML = '';

    (res.data || []).forEach((e) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><b>#${e.rollNumber}</b></td>
        <td><code>${e.admissionNumber || 'ADM-N/A'}</code></td>
        <td>
          <div style="font-weight:600;">${e.student.fullName}</div>
          <div style="font-size:11px;color:var(--text-muted);">${e.student.fullNameNepali || ''} &bull; <code>${e.student.username}</code></div>
        </td>
        <td><b>${e.section.class.name}</b> (${e.section.name})</td>
        <td>
          <div style="font-size:12px;">${e.guardianName || 'Guardian'}</div>
          <div style="font-size:11px;color:var(--text-muted);">${e.guardianPhone || ''}</div>
        </td>
        <td><span class="status-badge active">${e.status}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  async function openRegisterStudentModal() {
    document.getElementById('form-student').reset();
    if (!cachedStructure) await loadAcademicStructure();

    const select = document.getElementById('std-section-id');
    select.innerHTML = '';

    cachedStructure.classes.forEach((c) => {
      c.sections.forEach((sec) => {
        select.innerHTML += `<option value="${sec.id}">${c.name} - ${sec.name}</option>`;
      });
    });

    document.getElementById('modal-student').classList.add('open');
  }

  async function handleRegisterStudent(e) {
    e.preventDefault();
    const sectionId = document.getElementById('std-section-id').value;
    const academicYearId = cachedStructure.academicYears[0]?.id;

    const data = {
      fullName: document.getElementById('std-fullname').value.trim(),
      fullNameNepali: document.getElementById('std-fullname-nepali').value.trim() || undefined,
      username: document.getElementById('std-username').value.trim(),
      admissionNumber: document.getElementById('std-admission').value.trim() || undefined,
      sectionId,
      academicYearId,
      rollNumber: parseInt(document.getElementById('std-roll').value, 10),
      guardianName: document.getElementById('std-guardian-name').value.trim() || undefined,
      guardianPhone: document.getElementById('std-guardian-phone').value.trim() || undefined,
    };

    try {
      const res = await api('/school-admin/students', { method: 'POST', body: JSON.stringify(data) });
      closeModals();
      showToast(`Student registered successfully! (Temp Password: ${res.data.tempPassword})`, 'success');
      loadStudents();
      loadOverview();
    } catch (e) {}
  }

  // ══════════════════════════════════════════════
  // 4. ACADEMIC STRUCTURE (CLASSES, SECTIONS, SUBJECTS)
  // ══════════════════════════════════════════════
  async function loadAcademicStructure() {
    const res = await api('/school-admin/structure');
    cachedStructure = res.data;
    if (!cachedStructure) return;

    // Render Classes Grid
    const classesGrid = document.getElementById('classes-cards-grid');
    if (classesGrid) {
      classesGrid.innerHTML = '';
      cachedStructure.classes.forEach((c) => {
        const div = document.createElement('div');
        div.className = 'stat-card';
        div.innerHTML = `
          <div style="font-weight:700;font-size:16px;color:var(--primary);margin-bottom:4px;">${c.name}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Standard: ${c.board}</div>
          <div style="font-size:13px;font-weight:600;margin-bottom:6px;">Sections (${c.sections.length}):</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${c.sections.map((s) => `<span class="type-pill">${s.name} (${s._count.enrollments} students)</span>`).join('')}
          </div>
        `;
        classesGrid.appendChild(div);
      });
    }

    // Render Sections Table
    const tbodySections = document.getElementById('tbody-sections');
    if (tbodySections) {
      tbodySections.innerHTML = '';
      cachedStructure.classes.forEach((c) => {
        c.sections.forEach((sec) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><b>${c.name}</b></td>
            <td><span class="type-pill">${sec.name}</span></td>
            <td>${sec.classTeacher ? `<span style="font-weight:600;">★ ${sec.classTeacher.fullName}</span>` : '<span style="color:var(--warning)">Unassigned</span>'}</td>
            <td>${sec._count.enrollments} enrolled</td>
            <td>${sec._count.subjectAllocations} allocated</td>
          `;
          tbodySections.appendChild(tr);
        });
      });
    }

    // Render Subjects Grid
    const subjectsGrid = document.getElementById('subjects-list-grid');
    if (subjectsGrid) {
      subjectsGrid.innerHTML = '';
      cachedStructure.subjects.forEach((s) => {
        const div = document.createElement('div');
        div.className = 'stat-card';
        div.innerHTML = `
          <div style="font-weight:700;font-size:14.5px;">${s.centralSubject.name}</div>
          <div style="font-size:12px;color:var(--text-muted);">${s.centralSubject.nameNepali || ''}</div>
          <div style="margin-top:10px;"><span class="type-pill">Grade ${s.centralSubject.gradeNumber}</span> <span class="type-pill">${s.centralSubject.medium}</span></div>
        `;
        subjectsGrid.appendChild(div);
      });
    }
  }

  // ══════════════════════════════════════════════
  // 5. SUBJECT ALLOCATIONS
  // ══════════════════════════════════════════════
  async function loadAllocations() {
    if (!cachedStructure) await loadAcademicStructure();
    const tbody = document.getElementById('tbody-allocations');
    tbody.innerHTML = '';

    const res = await api('/academic/my-allocations'); // or get all institution allocations
    // Populate table
    cachedStructure.classes.forEach((c) => {
      c.sections.forEach((sec) => {
        (sec.subjectAllocations || []).forEach((alloc) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><b>${c.name}</b> - ${sec.name}</td>
            <td>${alloc.institutionSubject?.centralSubject?.name || 'Subject'}</td>
            <td><b>${alloc.teacher?.fullName || 'Teacher'}</b></td>
            <td><span class="type-pill">Nepali & English</span></td>
          `;
          tbody.appendChild(tr);
        });
      });
    });

    if (!tbody.children.length) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--text-muted);">Use the '+ Allocate Subject to Teacher' button to map subjects to teachers.</td></tr>`;
    }
  }

  async function openAllocateModal() {
    if (!cachedStructure) await loadAcademicStructure();
    if (!cachedTeachers.length) await loadTeachers();

    const secSelect = document.getElementById('alloc-section-id');
    secSelect.innerHTML = '';
    cachedStructure.classes.forEach((c) => {
      c.sections.forEach((s) => {
        secSelect.innerHTML += `<option value="${s.id}">${c.name} - ${s.name}</option>`;
      });
    });

    const subSelect = document.getElementById('alloc-subject-id');
    subSelect.innerHTML = cachedStructure.availableCentralSubjects
      .map((s) => `<option value="${s.id}">Grade ${s.gradeNumber}: ${s.name}</option>`)
      .join('');

    const tchSelect = document.getElementById('alloc-teacher-id');
    tchSelect.innerHTML = cachedTeachers
      .map((t) => `<option value="${t.id}">${t.fullName} (${t.username})</option>`)
      .join('');

    document.getElementById('modal-allocate').classList.add('open');
  }

  async function handleAllocateSubject(e) {
    e.preventDefault();
    const data = {
      sectionId: document.getElementById('alloc-section-id').value,
      centralSubjectId: document.getElementById('alloc-subject-id').value,
      teacherId: document.getElementById('alloc-teacher-id').value,
    };

    try {
      await api('/school-admin/allocations', { method: 'POST', body: JSON.stringify(data) });
      closeModals();
      showToast('Subject successfully allocated to teacher!', 'success');
      loadAllocations();
      loadOverview();
    } catch (e) {}
  }

  // ══════════════════════════════════════════════
  // 6. CLASS TEACHERS
  // ══════════════════════════════════════════════
  async function loadClassTeachers() {
    if (!cachedStructure) await loadAcademicStructure();
    const tbody = document.getElementById('tbody-class-teachers');
    tbody.innerHTML = '';

    cachedStructure.classes.forEach((c) => {
      c.sections.forEach((sec) => {
        const tr = document.createElement('tr');
        const ct = sec.classTeacher;
        tr.innerHTML = `
          <td><b>${c.name}</b> (${sec.name})</td>
          <td>${ct ? `<b>★ ${ct.fullName}</b> <small>(${ct.username})</small>` : '<span style="color:var(--danger)">Unassigned</span>'}</td>
          <td>${ct ? 'Active Faculty' : '-'}</td>
          <td><small style="color:var(--text-muted)">Daily Attendance, Result Compilation, Student Pastoral Care</small></td>
          <td style="text-align:right">
            <button class="page-btn" onclick="App.openAssignClassTeacherModal('${sec.id}', '${c.name} - ${sec.name}')">Assign</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    });
  }

  async function openAssignClassTeacherModal(sectionId, sectionName) {
    if (!cachedTeachers.length) await loadTeachers();
    document.getElementById('ct-section-id').value = sectionId;
    document.getElementById('ct-section-name').value = sectionName;

    const select = document.getElementById('ct-teacher-id');
    select.innerHTML = cachedTeachers.map((t) => `<option value="${t.id}">${t.fullName} (${t.username})</option>`).join('');

    document.getElementById('modal-class-teacher').classList.add('open');
  }

  async function handleAssignClassTeacher(e) {
    e.preventDefault();
    const sectionId = document.getElementById('ct-section-id').value;
    const teacherId = document.getElementById('ct-teacher-id').value;

    try {
      await api(`/school-admin/sections/${sectionId}/class-teacher`, {
        method: 'POST',
        body: JSON.stringify({ teacherId }),
      });
      closeModals();
      showToast('Class teacher assigned successfully!', 'success');
      await loadAcademicStructure();
      loadClassTeachers();
      loadOverview();
    } catch (e) {}
  }

  // ══════════════════════════════════════════════
  // 7. TIMETABLE
  // ══════════════════════════════════════════════
  async function loadTimetable() {
    const res = await api('/school-admin/timetable');
    const tbody = document.getElementById('tbody-timetable-full');
    tbody.innerHTML = '';

    (res.data || []).forEach((slot) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="type-pill">${slot.dayOfWeek}</span></td>
        <td><b>${slot.startTime} - ${slot.endTime}</b></td>
        <td>${slot.section.class.name} - ${slot.section.name}</td>
        <td>${slot.subjectAllocation.institutionSubject.centralSubject.name}</td>
        <td>${slot.subjectAllocation.teacher.fullName}</td>
        <td><code>${slot.room || 'Classroom'}</code></td>
      `;
      tbody.appendChild(tr);
    });

    if (!tbody.children.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted)">No timetable periods configured yet.</td></tr>`;
    }
  }

  // ══════════════════════════════════════════════
  // 8. PROFILE & SETTINGS
  // ══════════════════════════════════════════════
  async function loadProfile() {
    const res = await api('/school-admin/profile');
    const data = res.data;
    if (!data) return;

    // Read only
    document.getElementById('ro-code').textContent = data.readOnly.code;
    document.getElementById('ro-emis').textContent = data.readOnly.emisCode || 'None';
    document.getElementById('ro-location').textContent = `${data.readOnly.district}, ${data.readOnly.province}`;
    document.getElementById('ro-type').textContent = data.readOnly.type;

    // Editable
    document.getElementById('prof-name').value = data.editable.name || '';
    document.getElementById('prof-name-nepali').value = data.editable.nameNepali || '';
    document.getElementById('prof-address').value = data.editable.address || '';
    document.getElementById('prof-email').value = data.editable.email || '';
    document.getElementById('prof-phone').value = data.editable.phone || '';
    document.getElementById('prof-working-days').value = data.editable.workingDays || 'Sunday - Friday';
    document.getElementById('prof-timings').value = data.editable.schoolTimings || '10:00 AM - 04:00 PM';
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    const data = {
      name: document.getElementById('prof-name').value.trim(),
      nameNepali: document.getElementById('prof-name-nepali').value.trim() || undefined,
      address: document.getElementById('prof-address').value.trim() || undefined,
      email: document.getElementById('prof-email').value.trim() || undefined,
      phone: document.getElementById('prof-phone').value.trim() || undefined,
      workingDays: document.getElementById('prof-working-days').value.trim(),
      schoolTimings: document.getElementById('prof-timings').value.trim(),
    };

    try {
      await api('/school-admin/profile', { method: 'PUT', body: JSON.stringify(data) });
      showToast('Institution profile and school timings updated!', 'success');
      loadProfile();
    } catch (e) {}
  }

  // ══════════════════════════════════════════════
  // 9. ANNOUNCEMENTS & YEARS
  // ══════════════════════════════════════════════
  async function loadAnnouncements() {
    const res = await api('/school-admin/announcements');
    const list = document.getElementById('school-announcements-list');
    list.innerHTML = '';

    (res.data || []).forEach((a) => {
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <h4 style="font-size:15px;font-weight:700;">${a.title}</h4>
          <span class="type-pill">Target: ${a.targetType}</span>
        </div>
        <p style="font-size:13px;color:var(--text-main);margin-bottom:8px;">${a.content}</p>
        <span style="font-size:11px;color:var(--text-muted);">${new Date(a.createdAt).toLocaleString()} by ${a.authorName}</span>
      `;
      list.appendChild(card);
    });
  }

  async function loadYears() {
    if (!cachedStructure) await loadAcademicStructure();
    const list = document.getElementById('years-list');
    list.innerHTML = '';

    cachedStructure.academicYears.forEach((y) => {
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h4 style="font-size:15px;font-weight:700;">${y.name}</h4>
          ${y.isCurrent ? '<span class="status-badge active">Current Active Year</span>' : '<span class="status-badge">Archived</span>'}
        </div>
      `;
      list.appendChild(card);
    });
  }

  function exportRoster() {
    window.location.href = `${API_BASE}/school-admin/students?export=csv`;
  }

  function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach((m) => m.classList.remove('open'));
  }

  // ══════════════════════════════════════════════
  // INITIALIZATION
  // ══════════════════════════════════════════════
  async function init() {
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', () => {
        const view = item.getAttribute('data-view');
        if (view) switchView(view);
      });
    });

    document.getElementById('btn-logout').onclick = () => {
      localStorage.removeItem('eduverse_school_token');
      location.reload();
    };

    // Modal triggers & form submit
    document.getElementById('btn-add-teacher').onclick = () => {
      document.getElementById('form-teacher').reset();
      document.getElementById('modal-teacher').classList.add('open');
    };
    document.getElementById('form-teacher').onsubmit = handleAddTeacher;

    document.getElementById('btn-register-student').onclick = openRegisterStudentModal;
    document.getElementById('form-student').onsubmit = handleRegisterStudent;

    document.getElementById('btn-allocate-subject').onclick = openAllocateModal;
    document.getElementById('form-allocate').onsubmit = handleAllocateSubject;

    document.getElementById('form-class-teacher').onsubmit = handleAssignClassTeacher;
    document.getElementById('form-school-profile').onsubmit = handleSaveProfile;

    // Filters
    document.getElementById('search-teachers').oninput = () => loadTeachers();
    document.getElementById('search-students').oninput = () => loadStudents();

    // Verify session or auto-login
    if (!token) {
      await autoLoginSchoolAdmin();
    } else {
      try {
        const me = await api('/auth/me');
        currentUser = me.data;
        updateUserUI();
      } catch (e) {
        await autoLoginSchoolAdmin();
      }
    }

    switchView('overview');
  }

  return {
    init,
    toggleTeacherStatus,
    openAssignClassTeacherModal,
    exportRoster,
    closeModals,
  };
})();

document.addEventListener('DOMContentLoaded', App.init);


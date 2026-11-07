import React, { useCallback, useEffect, useState } from 'react';
import { api } from '@/services/api';
import { AuditLogView } from './AuditLogView';

type UserRow = {
  id?: string;
  _id?: string;
  fullName: string;
  username: string;
  email?: string | null;
  role: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  institutionId?: string | null;
  institution?: { name?: string; emisCode?: string } | null;
};

type AuditRow = {
  _id?: string;
  id?: string;
  operatorRole?: string;
  action: string;
  targetEntity?: string;
  targetId?: string;
  createdAt?: string;
};

const ROLES = ['', 'SUPER_ADMIN', 'SCHOOL_ADMIN', 'COLLEGE_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT'];

const th: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: 11, color: '#5f736f', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid #dcebe6' };
const td: React.CSSProperties = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #ebf5f1', color: '#0e3e3b' };
const btn: React.CSSProperties = { padding: '6px 10px', borderRadius: 6, border: '1px solid #cfdcd8', background: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' };

export const UserManagementPanel: React.FC = () => {
  const [view, setView] = useState<'USERS' | 'AUDIT'>('USERS');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({ page: String(page), limit: '20' });
      if (search.trim()) q.set('search', search.trim());
      if (role) q.set('role', role);
      if (status) q.set('status', status);
      const res = await api.get(`/admin/users?${q.toString()}`);
      setUsers(res.items || []);
      setTotalPages(res.totalPages || 1);
    } catch (e: any) {
      setError(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, role, status]);

  const loadAudit = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/audit-logs?limit=100');
      setAudit(res.items || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === 'USERS') loadUsers();
  }, [view, loadUsers]);

  const uid = (u: UserRow) => String(u.id || u._id);

  const toggleStatus = async (u: UserRow) => {
    const next = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!window.confirm(`${next === 'SUSPENDED' ? 'Suspend' : 'Re-activate'} ${u.fullName} (${u.username})?`)) return;
    try {
      await api.patch(`/admin/users/${uid(u)}/status`, { status: next });
      await loadUsers();
    } catch (e: any) {
      alert(e.message || 'Could not change status');
    }
  };

  const resetPassword = async (u: UserRow) => {
    if (!window.confirm(`Generate a new temporary password for ${u.fullName} (${u.username})?`)) return;
    try {
      const res = await api.post(`/admin/users/${uid(u)}/reset-password`, {});
      window.prompt(`Temporary password for ${u.username} (copy it now, it is shown once):`, res.tempPassword);
    } catch (e: any) {
      alert(e.message || 'Could not reset password');
    }
  };

  const instName = (u: UserRow) => u.institution?.name || '—';

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['USERS', 'AUDIT'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{ ...btn, background: view === v ? '#e6f7f0' : '#fff', color: view === v ? '#117a6b' : '#2f4f4c', borderColor: view === v ? '#93c5fd' : '#cfdcd8' }}
          >
            {v === 'USERS' ? 'User Directory' : 'Audit Log'}
          </button>
        ))}
      </div>

      {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: 12, borderRadius: 8, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      {view === 'USERS' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <input
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              placeholder="Search name, username or email"
              style={{ padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: 8, minWidth: 260, fontSize: 13 }}
            />
            <select value={role} onChange={(e) => { setPage(1); setRole(e.target.value); }} style={{ padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: 8, fontSize: 13 }}>
              {ROLES.map((r) => <option key={r} value={r}>{r || 'All roles'}</option>)}
            </select>
            <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} style={{ padding: '8px 12px', border: '1px solid #cfdcd8', borderRadius: 8, fontSize: 13 }}>
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div style={{ background: '#fff', border: '1px solid #dcebe6', borderRadius: 12, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>Name</th><th style={th}>Username</th><th style={th}>Role</th>
                  <th style={th}>Institution</th><th style={th}>Status</th><th style={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td style={td} colSpan={6}>Loading…</td></tr>}
                {!loading && users.length === 0 && <tr><td style={td} colSpan={6}>No users match.</td></tr>}
                {!loading && users.map((u) => (
                  <tr key={uid(u)}>
                    <td style={td}>{u.fullName}</td>
                    <td style={td}>{u.username}</td>
                    <td style={td}>{u.role}</td>
                    <td style={td}>{instName(u)}</td>
                    <td style={{ ...td, fontWeight: 800, color: u.status === 'ACTIVE' ? '#117a6b' : '#dc2626' }}>{u.status}</td>
                    <td style={td}>
                      <button style={btn} onClick={() => toggleStatus(u)}>{u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</button>{' '}
                      <button style={btn} onClick={() => resetPassword(u)}>Reset password</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
            <button style={btn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
            <span style={{ fontSize: 12, color: '#5f736f' }}>Page {page} of {totalPages}</span>
            <button style={btn} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </>
      )}

      {view === 'AUDIT' && <AuditLogView />}
    </div>
  );
};

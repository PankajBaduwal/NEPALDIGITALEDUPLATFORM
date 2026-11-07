import React, { useState, useEffect } from 'react';
import { LogoUpload } from '../common/LogoUpload';
import { api } from '../../services/api';
import {
  Building2,
  Users,
  ShieldCheck,
  CreditCard,
  Edit,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  UserCheck,
  GraduationCap,
  Save,
  Search,
  Filter,
  Sparkles,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  Award
} from 'lucide-react';

interface InstitutionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionId: string | null;
  onUpdated?: () => void;
}

export const InstitutionManagementModal: React.FC<InstitutionManagementModalProps> = ({
  isOpen,
  onClose,
  institutionId,
  onUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'EDIT' | 'LEADERSHIP' | 'TEACHERS' | 'SUBSCRIPTION'>('OVERVIEW');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [instData, setInstData] = useState<any>(null);
  const [teacherSearch, setTeacherSearch] = useState('');

  // Edit Form State
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    nameNepali: '',
    emisCode: '',
    type: 'COMMUNITY',
    status: 'ACTIVE',
    province: '',
    district: '',
    localLevel: '',
    ward: '' as number | string,
    email: '',
    phone: '',
    website: '',
  });

  // Leadership Assignment State
  const [selectedTeacherForRole, setSelectedTeacherForRole] = useState<string>('');
  const [selectedTargetRole, setSelectedTargetRole] = useState<'SCHOOL_ADMIN' | 'PRINCIPAL'>('SCHOOL_ADMIN');
  const [isAssigningRole, setIsAssigningRole] = useState(false);

  useEffect(() => {
    if (isOpen && institutionId) {
      loadInstitutionDetails();
    }
  }, [isOpen, institutionId]);

  const loadInstitutionDetails = async () => {
    if (!institutionId) return;
    setLoading(true);
    try {
      const res = await api.get<any>(`/admin/institutions/${institutionId}`);
      const payload = (res && res.data) ? res.data : res;
      if (payload && (payload.institution || payload._id)) {
        setInstData(payload);
        const inst = payload.institution || payload;
        setLogoPreview(inst.logoUrl || null);
        setEditForm({
          name: inst.name || '',
          nameNepali: inst.nameNepali || '',
          emisCode: inst.emisCode || '',
          type: inst.type || 'COMMUNITY',
          status: inst.status || 'ACTIVE',
          province: inst.province || '',
          district: inst.district || '',
          localLevel: inst.localLevel || '',
          ward: inst.ward ?? '',
          email: inst.email || '',
          phone: inst.phone || '',
          website: inst.website || '',
        });
      }
    } catch (e) {
      console.error('Failed to load institution details', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionId) return;
    setSaving(true);
    try {
      await api.put(`/admin/institutions/${institutionId}`, editForm);
      alert('Institution information updated successfully!');
      loadInstitutionDetails();
      if (onUpdated) onUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to update institution');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignLeadership = async (userId: string, targetRole: 'SCHOOL_ADMIN' | 'PRINCIPAL' | 'TEACHER', userName?: string) => {
    if (!institutionId) return;
    const confirmMsg = targetRole === 'TEACHER'
      ? `Revert ${userName || 'this user'} back to Subject Teacher role?`
      : `Promote/Designate ${userName || 'this teacher'} as ${targetRole === 'PRINCIPAL' ? 'Principal (Academic Head)' : 'School Administrator'}?`;

    if (!window.confirm(confirmMsg)) return;

    setIsAssigningRole(true);
    try {
      await api.patch(`/admin/institutions/${institutionId}/assign-leadership`, {
        userId,
        targetRole,
      });
      alert(`Leadership role assigned successfully: User is now ${targetRole}!`);
      loadInstitutionDetails();
      if (onUpdated) onUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to assign leadership role');
    } finally {
      setIsAssigningRole(false);
    }
  };

  if (!isOpen) return null;

  const inst = instData?.institution;
  const admins = instData?.administrators || [];
  const principals = instData?.principals || [];
  const teachers = instData?.teachers || [];
  const subs = instData?.subscriptions || [];
  const stats = instData?.stats || {};

  const filteredTeachers = teachers.filter((t: any) => {
    if (!teacherSearch) return true;
    const q = teacherSearch.toLowerCase();
    return (
      (t.fullName || '').toLowerCase().includes(q) ||
      (t.username || '').toLowerCase().includes(q) ||
      (t.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(14, 62, 59, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '950px',
          maxWidth: '96vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          border: '1px solid #dcebe6',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #dcebe6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f4faf8',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #117a6b, #0f5f55)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '18px',
              }}
            >
              🏫
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#0e3e3b', margin: 0 }}>
                  {inst?.name || 'Institution Dossier & Leadership Control'}
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    background: inst?.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                    color: inst?.status === 'ACTIVE' ? '#15803d' : '#b91c1c',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {inst?.status || 'ACTIVE'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#5f736f', marginTop: '2px' }}>
                EMIS: <strong style={{ color: '#0e3e3b' }}>{inst?.emisCode}</strong> • {inst?.localLevel}, {inst?.district} ({inst?.province})
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              border: '1px solid #dcebe6',
              background: '#ffffff',
              color: '#5f736f',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '12px 24px',
            borderBottom: '1px solid #dcebe6',
            background: '#ffffff',
          }}
        >
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'OVERVIEW' ? '#e6f7f0' : 'transparent',
              color: activeTab === 'OVERVIEW' ? '#117a6b' : '#5f736f',
            }}
          >
            📊 School Overview
          </button>
          <button
            onClick={() => setActiveTab('EDIT')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'EDIT' ? '#e6f7f0' : 'transparent',
              color: activeTab === 'EDIT' ? '#117a6b' : '#5f736f',
            }}
          >
            ✏️ Edit Information
          </button>
          <button
            onClick={() => setActiveTab('LEADERSHIP')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'LEADERSHIP' ? '#e6f7f0' : 'transparent',
              color: activeTab === 'LEADERSHIP' ? '#117a6b' : '#5f736f',
            }}
          >
            👑 Assign Admin & Principal
          </button>
          <button
            onClick={() => setActiveTab('TEACHERS')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'TEACHERS' ? '#e6f7f0' : 'transparent',
              color: activeTab === 'TEACHERS' ? '#117a6b' : '#5f736f',
            }}
          >
            👩‍🏫 Faculty Roster ({teachers.length})
          </button>
          <button
            onClick={() => setActiveTab('SUBSCRIPTION')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'SUBSCRIPTION' ? '#e6f7f0' : 'transparent',
              color: activeTab === 'SUBSCRIPTION' ? '#117a6b' : '#5f736f',
            }}
          >
            📦 Subscriptions & What They Brought
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, background: '#f4faf8' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#5f736f', fontSize: '13px' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
              Loading institution dossier and faculty records...
            </div>
          ) : (
            <>
              {/* ════════════════════════════════════════════════════════════
                  TAB 1: OVERVIEW
                 ════════════════════════════════════════════════════════════ */}
              {activeTab === 'OVERVIEW' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Quick Stat Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                      <div style={{ fontSize: '11px', color: '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Active Faculty</div>
                      <div style={{ fontSize: '26px', fontWeight: '900', color: '#117a6b', margin: '4px 0 2px 0' }}>
                        {teachers.length} Teachers
                      </div>
                      <div style={{ fontSize: '11px', color: '#5f736f' }}>Assigned across classes</div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                      <div style={{ fontSize: '11px', color: '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Total Enrolled</div>
                      <div style={{ fontSize: '26px', fontWeight: '900', color: '#117a6b', margin: '4px 0 2px 0' }}>
                        {stats.totalStudents || 252} Students
                      </div>
                      <div style={{ fontSize: '11px', color: '#5f736f' }}>Digital EMIS Identity</div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                      <div style={{ fontSize: '11px', color: '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Classes & Sections</div>
                      <div style={{ fontSize: '26px', fontWeight: '900', color: '#7c3aed', margin: '4px 0 2px 0' }}>
                        {stats.totalClasses || 14} Classes
                      </div>
                      <div style={{ fontSize: '11px', color: '#5f736f' }}>28 Sections Aligned</div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '18px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
                      <div style={{ fontSize: '11px', color: '#5f736f', fontWeight: '700', textTransform: 'uppercase' }}>Active Package</div>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#6d5bd0', margin: '6px 0 2px 0' }}>
                        {subs[0]?.packageId?.name || 'K12_ALL'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700' }}>Active & Licensed</div>
                    </div>
                  </div>

                  {/* Current Designated Leadership Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* Principal Card */}
                    <div style={{ background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #dcebe6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <GraduationCap size={20} color="#7c3aed" />
                          <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>Designated Principal</h4>
                        </div>
                        <button
                          onClick={() => setActiveTab('LEADERSHIP')}
                          style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '700', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Change / Reassign →
                        </button>
                      </div>

                      {principals.length === 0 ? (
                        <p style={{ color: '#dc2626', fontSize: '13px', fontWeight: '600' }}>⚠️ No Principal designated. Promote a teacher to Principal.</p>
                      ) : (
                        principals.map((p: any) => (
                          <div key={p._id || p.id} style={{ background: '#f4faf8', padding: '12px 14px', borderRadius: '8px', border: '1px solid #dcebe6' }}>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0e3e3b' }}>{p.fullName}</div>
                            <div style={{ fontSize: '12px', color: '#5f736f', marginTop: '2px' }}>
                              Username: <strong>{p.username}</strong> • Email: {p.email}
                            </div>
                            <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '700', marginTop: '4px' }}>
                              Academic Oversight Authority
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* School Administrator Card */}
                    <div style={{ background: '#ffffff', padding: '20px', borderRadius: '14px', border: '1px solid #dcebe6' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <ShieldCheck size={20} color="#117a6b" />
                          <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>Designated School Administrator</h4>
                        </div>
                        <button
                          onClick={() => setActiveTab('LEADERSHIP')}
                          style={{ fontSize: '11px', color: '#117a6b', fontWeight: '700', background: '#e6f7f0', border: '1px solid #bfeede', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Change / Reassign →
                        </button>
                      </div>

                      {admins.length === 0 ? (
                        <p style={{ color: '#dc2626', fontSize: '13px', fontWeight: '600' }}>⚠️ No School Admin assigned. Promote a teacher to Admin.</p>
                      ) : (
                        admins.map((a: any) => (
                          <div key={a._id || a.id} style={{ background: '#f4faf8', padding: '12px 14px', borderRadius: '8px', border: '1px solid #dcebe6' }}>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0e3e3b' }}>{a.fullName}</div>
                            <div style={{ fontSize: '12px', color: '#5f736f', marginTop: '2px' }}>
                              Username: <strong>{a.username}</strong> • Email: {a.email}
                            </div>
                            <div style={{ fontSize: '11px', color: '#117a6b', fontWeight: '700', marginTop: '4px' }}>
                              Institution Management & Roster Access
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════
                  TAB 2: EDIT INSTITUTION INFORMATION
                 ════════════════════════════════════════════════════════════ */}
              {activeTab === 'EDIT' && (
                <form onSubmit={handleUpdateInstitution} style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #dcebe6' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Edit Institution Profile & Contact Details</h3>

                  <div style={{ marginBottom: '18px', paddingBottom: '18px', borderBottom: '1px solid #ebf5f1' }}>
                    <LogoUpload
                      value={logoPreview}
                      onChange={async (v) => {
                        if (!institutionId) return;
                        try {
                          await api.put(`/admin/institutions/${institutionId}/logo`, v ? { logoDataUrl: v } : { remove: true });
                          setLogoPreview(v);
                          if (onUpdated) onUpdated();
                          loadInstitutionDetails();
                        } catch (err: any) {
                          alert(err.message || 'Failed to update logo');
                        }
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Institution Name (English)</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Institution Name (नेपाली)</label>
                      <input
                        type="text"
                        value={editForm.nameNepali}
                        onChange={(e) => setEditForm({ ...editForm, nameNepali: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>EMIS Code</label>
                      <input
                        type="text"
                        value={editForm.emisCode}
                        onChange={(e) => setEditForm({ ...editForm, emisCode: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px', fontFamily: 'monospace' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Institution Type</label>
                      <select
                        value={editForm.type}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                      >
                        <option value="COMMUNITY">Community (सामुदायिक)</option>
                        <option value="INSTITUTIONAL">Institutional / Private (संस्थागत)</option>
                        <option value="COLLEGE">Higher Ed College (कलेज)</option>
                        <option value="MODEL_SCHOOL">Model School (नमुना विद्यालय)</option>
                        <option value="MADRASSA">Madrassa (मदरसा)</option>
                        <option value="GUMBA">Gumba (गुम्बा)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Province</label>
                      <input
                        type="text"
                        value={editForm.province}
                        onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>District</label>
                      <input
                        type="text"
                        value={editForm.district}
                        onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Municipality / Local Level</label>
                      <input
                        type="text"
                        value={editForm.localLevel}
                        onChange={(e) => setEditForm({ ...editForm, localLevel: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Official Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Phone Number</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Website</label>
                      <input
                        type="text"
                        value={editForm.website}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setActiveTab('OVERVIEW')}
                      style={{ padding: '9px 18px', background: '#ebf5f1', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        padding: '9px 24px',
                        background: '#117a6b',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Save size={15} /> {saving ? 'Saving Changes...' : 'Save & Update Institution Profile'}
                    </button>
                  </div>
                </form>
              )}

              {/* ════════════════════════════════════════════════════════════
                  TAB 3: ASSIGN ADMIN & PRINCIPAL FROM TEACHER ACCOUNT
                 ════════════════════════════════════════════════════════════ */}
              {activeTab === 'LEADERSHIP' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Designation Card */}
                  <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #dcebe6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Award size={20} color="#7c3aed" />
                      <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>
                        Designate Administrator or Principal from Teacher Faculty
                      </h3>
                    </div>
                    <p style={{ fontSize: '13px', color: '#5f736f', marginBottom: '20px' }}>
                      Select any existing teacher from this school and promote them to <strong>School Administrator</strong> or <strong>Principal</strong> with full dashboard authority.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr auto', gap: '14px', alignItems: 'flex-end' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Select Teacher</label>
                        <select
                          value={selectedTeacherForRole}
                          onChange={(e) => setSelectedTeacherForRole(e.target.value)}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                        >
                          <option value="">-- Choose teacher from faculty roster ({teachers.length} teachers) --</option>
                          {teachers.map((t: any) => (
                            <option key={t._id || t.id} value={t._id || t.id}>
                              {t.fullName} ({t.username}) - {t.email}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Target Leadership Role</label>
                        <select
                          value={selectedTargetRole}
                          onChange={(e) => setSelectedTargetRole(e.target.value as any)}
                          style={{ width: '100%', padding: '10px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '13px' }}
                        >
                          <option value="SCHOOL_ADMIN">School Administrator (Full Institution Admin)</option>
                          <option value="PRINCIPAL">Principal / Academic Head (Exam & Academic Lead)</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        disabled={!selectedTeacherForRole || isAssigningRole}
                        onClick={() => {
                          const chosen = teachers.find((t: any) => (t._id || t.id) === selectedTeacherForRole);
                          handleAssignLeadership(selectedTeacherForRole, selectedTargetRole, chosen?.fullName);
                        }}
                        style={{
                          padding: '10px 20px',
                          background: selectedTargetRole === 'PRINCIPAL' ? '#7c3aed' : '#117a6b',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '800',
                          cursor: selectedTeacherForRole ? 'pointer' : 'not-allowed',
                          opacity: selectedTeacherForRole ? 1 : 0.6,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isAssigningRole ? 'Assigning...' : `Designate as ${selectedTargetRole === 'PRINCIPAL' ? 'Principal' : 'Admin'} 👑`}
                      </button>
                    </div>
                  </div>

                  {/* Active Leadership Team Overview */}
                  <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #dcebe6' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '14px' }}>Current Leadership Personnel</h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Principals */}
                      {principals.map((p: any) => (
                        <div key={p._id || p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', background: '#7c3aed', color: '#ffffff', padding: '3px 8px', borderRadius: '4px' }}>
                              PRINCIPAL
                            </span>
                            <div>
                              <strong style={{ fontSize: '14px', color: '#0e3e3b' }}>{p.fullName}</strong>
                              <span style={{ fontSize: '12px', color: '#5f736f', marginLeft: '8px' }}>({p.username}) • {p.email}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAssignLeadership(p._id || p.id, 'TEACHER', p.fullName)}
                            style={{ fontSize: '12px', color: '#dc2626', background: '#fee2e2', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Revert to Teacher
                          </button>
                        </div>
                      ))}

                      {/* Admins */}
                      {admins.map((a: any) => (
                        <div key={a._id || a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#e6f7f0', border: '1px solid #bfeede', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', background: '#117a6b', color: '#ffffff', padding: '3px 8px', borderRadius: '4px' }}>
                              SCHOOL ADMIN
                            </span>
                            <div>
                              <strong style={{ fontSize: '14px', color: '#0e3e3b' }}>{a.fullName}</strong>
                              <span style={{ fontSize: '12px', color: '#5f736f', marginLeft: '8px' }}>({a.username}) • {a.email}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleAssignLeadership(a._id || a.id, 'TEACHER', a.fullName)}
                            style={{ fontSize: '12px', color: '#dc2626', background: '#fee2e2', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}
                          >
                            Revert to Teacher
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════
                  TAB 4: FACULTY ROSTER TABLE
                 ════════════════════════════════════════════════════════════ */}
              {activeTab === 'TEACHERS' && (
                <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #dcebe6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 4px 0' }}>School Faculty Roster</h3>
                      <p style={{ fontSize: '12px', color: '#5f736f', margin: 0 }}>
                        All {teachers.length} teaching staff members in this institution with instant role management.
                      </p>
                    </div>

                    <div style={{ width: '260px' }}>
                      <input
                        type="text"
                        placeholder="Search teachers by name or username..."
                        value={teacherSearch}
                        onChange={(e) => setTeacherSearch(e.target.value)}
                        style={{ width: '100%', padding: '7px 12px', border: '1px solid #cfdcd8', borderRadius: '8px', fontSize: '12px' }}
                      />
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #dcebe6', maxHeight: '420px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                      <thead style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6', position: 'sticky', top: 0 }}>
                        <tr>
                          <th style={{ padding: '10px 14px', fontWeight: '800' }}>Teacher Name</th>
                          <th style={{ padding: '10px 14px', fontWeight: '800' }}>Username</th>
                          <th style={{ padding: '10px 14px', fontWeight: '800' }}>Official Email</th>
                          <th style={{ padding: '10px 14px', fontWeight: '800', textAlign: 'center' }}>Current Role</th>
                          <th style={{ padding: '10px 14px', fontWeight: '800', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeachers.map((t: any) => (
                          <tr key={t._id || t.id} style={{ borderBottom: '1px solid #ebf5f1' }}>
                            <td style={{ padding: '10px 14px', fontWeight: '700', color: '#0e3e3b' }}>
                              {t.fullName}
                              {t.fullNameNepali && <span style={{ color: '#5f736f', marginLeft: '6px' }}>({t.fullNameNepali})</span>}
                            </td>
                            <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: '#2f4f4c' }}>
                              {t.username}
                            </td>
                            <td style={{ padding: '10px 14px', color: '#5f736f' }}>
                              {t.email || `${t.username}@school.edu.np`}
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                              <span style={{ fontSize: '10px', fontWeight: '800', background: '#e6f7f0', color: '#117a6b', padding: '2px 8px', borderRadius: '4px' }}>
                                TEACHER
                              </span>
                            </td>
                            <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleAssignLeadership(t._id || t.id, 'SCHOOL_ADMIN', t.fullName)}
                                  title="Promote this teacher to School Administrator"
                                  style={{ fontSize: '11px', fontWeight: '700', background: '#e6f7f0', color: '#117a6b', border: '1px solid #bfeede', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  Promote Admin 👑
                                </button>
                                <button
                                  onClick={() => handleAssignLeadership(t._id || t.id, 'PRINCIPAL', t.fullName)}
                                  title="Promote this teacher to Principal"
                                  style={{ fontSize: '11px', fontWeight: '700', background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe', padding: '3px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  Promote Principal 🎓
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ════════════════════════════════════════════════════════════
                  TAB 5: SUBSCRIPTIONS & WHAT THEY BROUGHT
                 ════════════════════════════════════════════════════════════ */}
              {activeTab === 'SUBSCRIPTION' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #dcebe6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CreditCard size={20} color="#117a6b" />
                        <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>
                          Commercial Package, Entitlements & Included Features
                        </h3>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: '#117a6b', background: '#e6f7f0', padding: '4px 10px', borderRadius: '6px' }}>
                        National Licensing Active
                      </span>
                    </div>

                    <div style={{ background: '#f4faf8', padding: '20px', borderRadius: '12px', border: '1px solid #dcebe6', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: '800', color: '#117a6b', textTransform: 'uppercase' }}>
                            Subscribed License Plan
                          </div>
                          <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#0e3e3b', margin: '4px 0 2px 0' }}>
                            {subs[0]?.packageId?.name || 'K-12 Full Digital Learning Ecosystem (Classes 1–12)'}
                          </h4>
                          <p style={{ fontSize: '12px', color: '#5f736f', margin: 0 }}>
                            {subs[0]?.packageId?.description || 'All 141 Nepal CDC digital textbooks, interactive Smart Board canvas, PhET virtual labs, continuous assessment, and AI copilot.'}
                          </p>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '6px' }}>
                            {subs[0]?.status || 'ACTIVE'}
                          </span>
                        </div>
                      </div>

                      {/* Included Features List */}
                      <div style={{ borderTop: '1px solid #dcebe6', paddingTop: '14px', marginTop: '14px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#2f4f4c', marginBottom: '8px' }}>
                          Purchased Modules & Included Capabilities:
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#117a6b' }}>
                            <CheckCircle2 size={14} /> Classes 1–12 CDC Digital Textbooks
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#117a6b' }}>
                            <CheckCircle2 size={14} /> Interactive Smart Board Classroom
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#117a6b' }}>
                            <CheckCircle2 size={14} /> PhET & CDC Virtual Lab Simulations
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#117a6b' }}>
                            <CheckCircle2 size={14} /> Continuous Assessment & Quizzes
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#117a6b' }}>
                            <CheckCircle2 size={14} /> Terminal Examination & CDC Marksheet
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#117a6b' }}>
                            <CheckCircle2 size={14} /> Bilingual AI Curriculum Copilot
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LogoUpload } from '../common/LogoUpload';
import {
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Building2,
  MapPin,
  User,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Loader2,
  Edit,
  Save,
  X,
  Sparkles,
  RefreshCw,
  Eye,
  Phone,
  Mail,
  Copy,
  Check,
  Calendar,
  Layers,
  CheckCheck,
} from 'lucide-react';
import { formatDate, formatDateAD, formatDateBS, formatDateTime, formatTime } from '../../utils/dates';

export interface PossibleDuplicate { kind: 'REQUEST' | 'INSTITUTION'; ref: string; name: string; emisCode?: string; status?: string; why: string }

export interface RegistrationRequestItem {
  possibleDuplicates?: PossibleDuplicate[];
  id: string;
  _id?: string;
  requestCode: string;
  institutionName: string;
  nameNepali?: string;
  shortName?: string;
  emisCode: string;
  registrationNumber?: string;
  institutionKind: 'SCHOOL' | 'COLLEGE';
  institutionType: string;
  province: string;
  district: string;
  localLevel: string;
  ward?: number;
  street?: string;
  contactPerson: string;
  designation?: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  requestedPackages: string[];
  estimatedStudents?: number;
  academicYear?: string;
  mediumOfInstruction?: string;
  status: string;
  rejectionReason?: string;
  moreInfoNotes?: string;
  notes?: string;
  adminDetails?: {
    fullName?: string;
    username?: string;
    email?: string;
    phone?: string;
  };
  createdAt: string;
  provisionedInstitutionId?: any;
}

export const RegistrationRequestsManager: React.FC = () => {
  const [requests, setRequests] = useState<RegistrationRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected for review modal
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequestItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Copied code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  // Edit Request State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Sub-action dialogs
  const [notesDialog, setNotesDialog] = useState(false);
  const [moreInfoText, setMoreInfoText] = useState('');
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const res = await api.get<{ requests: RegistrationRequestItem[] }>(
        `/admin/registration-requests?status=${statusFilter}&search=${encodeURIComponent(searchTerm)}`
      );
      setRequests(res.requests || []);
    } catch (err: any) {
      console.error('Failed to load registration requests:', err);
      setActionError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadRequests();
  };

  const handleOpenEdit = (req: RegistrationRequestItem) => {
    setEditingRequest({
      id: req.id || req._id,
      requestCode: req.requestCode,
      institutionName: req.institutionName,
      nameNepali: req.nameNepali || '',
      shortName: req.shortName || '',
      emisCode: req.emisCode,
      registrationNumber: req.registrationNumber || '',
      institutionKind: req.institutionKind || 'SCHOOL',
      institutionType: req.institutionType || 'COMMUNITY',
      province: req.province,
      district: req.district,
      localLevel: req.localLevel,
      ward: req.ward || 1,
      street: req.street || '',
      contactPerson: req.contactPerson,
      designation: req.designation || 'Principal',
      email: req.email,
      phone: req.phone,
      alternativePhone: req.alternativePhone || '',
      estimatedStudents: req.estimatedStudents || 300,
      academicYear: req.academicYear || '2081/2082',
      mediumOfInstruction: req.mediumOfInstruction || 'BOTH',
      notes: req.notes || '',
      adminFullName: req.adminDetails?.fullName || req.contactPerson,
      adminUsername: req.adminDetails?.username || `admin_${req.emisCode}`,
      adminEmail: req.adminDetails?.email || req.email,
      adminPhone: req.adminDetails?.phone || req.phone,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest) return;
    setEditLoading(true);
    setActionError(null);
    try {
      const targetId = editingRequest.id;
      const res = await api.put(`/admin/registration-requests/${targetId}`, editingRequest);
      setActionSuccess('Application data updated successfully!');
      setIsEditModalOpen(false);
      setEditingRequest(null);
      if (selectedRequest && (selectedRequest.id === targetId || (selectedRequest as any)._id === targetId)) {
        setSelectedRequest(res);
      }
      loadRequests();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update application data.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleApproveAndProvision = async (reqId: string) => {
    if (!window.confirm('Approve this institution request and execute 12-step atomic provisioning?')) {
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      await api.patch(`/admin/registration-requests/${reqId}/approve`, {});
      setActionSuccess('Institution successfully approved, provisioned, and activated with full academic infrastructure!');
      setSelectedRequest(null);
      loadRequests();
    } catch (err: any) {
      setActionError(err.message || 'Error executing provisioning for this application.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestMoreInfo = async () => {
    if (!moreInfoText.trim() || !selectedRequest) return;
    setActionLoading(true);
    try {
      const targetId = selectedRequest.id || (selectedRequest as any)._id;
      await api.patch(`/admin/registration-requests/${targetId}/request-info`, {
        notes: moreInfoText.trim(),
      });
      setActionSuccess('Clarification request sent to applicant.');
      setNotesDialog(false);
      setSelectedRequest(null);
      loadRequests();
    } catch (err: any) {
      setActionError(err.message || 'Failed to request clarification.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim() || !selectedRequest) return;
    setActionLoading(true);
    try {
      const targetId = selectedRequest.id || (selectedRequest as any)._id;
      await api.patch(`/admin/registration-requests/${targetId}/reject`, {
        reason: rejectReason.trim(),
      });
      setActionSuccess('Application rejected.');
      setRejectDialog(false);
      setSelectedRequest(null);
      loadRequests();
    } catch (err: any) {
      setActionError(err.message || 'Failed to reject application.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
        return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', dot: '#10b981', label: 'Approved & Active' };
      case 'PROVISIONING':
        return { bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe', dot: '#6366f1', label: 'Provisioning...' };
      case 'UNDER_VERIFICATION':
        return { bg: '#f0f9ff', color: '#0369a1', border: '#bae6fd', dot: '#0284c7', label: 'Under Verification' };
      case 'PENDING':
      case 'SUBMITTED':
        return { bg: '#fffbeb', color: '#b45309', border: '#fde68a', dot: '#f59e0b', label: 'Pending Review' };
      case 'MORE_INFO_REQUIRED':
        return { bg: '#faf5ff', color: '#7e22ce', border: '#e9d5ff', dot: '#9333ea', label: 'Clarification Needed' };
      case 'REJECTED':
        return { bg: '#fff1f2', color: '#be123c', border: '#fecdd3', dot: '#f43f5e', label: 'Rejected' };
      default:
        return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0', dot: '#94a3b8', label: status };
    }
  };

  const pendingCount = requests.filter(r => ['PENDING', 'SUBMITTED', 'UNDER_VERIFICATION'].includes(r.status)).length;
  const underVerificationCount = requests.filter(r => r.status === 'UNDER_VERIFICATION').length;
  const moreInfoCount = requests.filter(r => r.status === 'MORE_INFO_REQUIRED').length;
  const approvedCount = requests.filter(r => ['APPROVED', 'ACTIVE'].includes(r.status)).length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;

  return (
    <div>
      {/* Alert Banner if pending applications exist */}
      {pendingCount > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #fef3c7 100%)',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(16, 185, 129, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#0f766e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(15,118,110,0.25)' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '14px', color: '#0f172a' }}>
                {pendingCount} Institution Self-Registration{pendingCount > 1 ? 's' : ''} Awaiting Super Admin Review
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                Schools and colleges have submitted registration forms through the portal. Review information, edit records, or perform 1-click provisioning.
              </div>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('PENDING')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#0f766e',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 6px rgba(15,118,110,0.2)',
            }}
          >
            Filter Pending ({pendingCount})
          </button>
        </div>
      )}

      {actionSuccess && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '12px 16px', color: '#065f46', fontSize: '13px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#059669" />
            <span style={{ fontWeight: '600' }}>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {actionError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 16px', color: '#991b1b', fontSize: '13px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} color="#dc2626" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Top Controls & Status Pills */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '18px',
          gap: '14px',
          flexWrap: 'wrap',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '300px', maxWidth: '440px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by Institution, EMIS, Ref Code, Contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                background: '#ffffff',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              background: '#0f766e',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(15,118,110,0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', marginRight: '2px' }}>Status:</span>
          {[
            { key: 'ALL', label: 'All', count: requests.length },
            { key: 'PENDING', label: 'Pending Review', count: pendingCount, highlight: pendingCount > 0 },
            { key: 'UNDER_VERIFICATION', label: 'Under Verification', count: underVerificationCount },
            { key: 'MORE_INFO_REQUIRED', label: 'Clarification', count: moreInfoCount },
            { key: 'APPROVED', label: 'Approved', count: approvedCount },
            { key: 'REJECTED', label: 'Rejected', count: rejectedCount },
          ].map((st) => {
            const isActive = statusFilter === st.key;
            return (
              <button
                key={st.key}
                onClick={() => setStatusFilter(st.key)}
                style={{
                  padding: '7px 13px',
                  borderRadius: '8px',
                  border: isActive ? '1px solid #0f766e' : '1px solid #e2e8f0',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: isActive ? '#0f766e' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  boxShadow: isActive ? '0 2px 4px rgba(15,118,110,0.2)' : '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{st.label}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    background: isActive ? 'rgba(255,255,255,0.25)' : (st.highlight ? '#fef3c7' : '#f1f5f9'),
                    color: isActive ? '#ffffff' : (st.highlight ? '#b45309' : '#64748b'),
                    fontWeight: '800',
                  }}
                >
                  {st.count}
                </span>
              </button>
            );
          })}
          <button
            onClick={loadRequests}
            title="Refresh List"
            style={{
              padding: '7px 11px',
              borderRadius: '8px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              color: '#475569',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Requests Table Container with Horizontal Scroll */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
          <table
            style={{
              width: '100%',
              minWidth: '1260px',
              borderCollapse: 'separate',
              borderSpacing: 0,
              textAlign: 'left',
              fontSize: '13px',
            }}
          >
            <thead>
              <tr
                style={{
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  color: '#475569',
                  fontWeight: '700',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <th style={{ padding: '13px 18px', width: '180px', minWidth: '180px', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                  Tracking & EMIS
                </th>
                <th style={{ padding: '13px 18px', minWidth: '270px', borderBottom: '1px solid #e2e8f0' }}>
                  Institution & Classification
                </th>
                <th style={{ padding: '13px 18px', width: '210px', minWidth: '210px', borderBottom: '1px solid #e2e8f0' }}>
                  Province & District
                </th>
                <th style={{ padding: '13px 18px', width: '230px', minWidth: '220px', borderBottom: '1px solid #e2e8f0' }}>
                  Contact Person
                </th>
                <th style={{ padding: '13px 18px', width: '160px', minWidth: '155px', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                  Status
                </th>
                <th style={{ padding: '13px 18px', width: '150px', minWidth: '145px', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                  Submitted
                </th>
                <th style={{ padding: '13px 18px', width: '230px', minWidth: '220px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <Loader2 size={20} className="animate-spin" color="#0f766e" />
                      <span style={{ fontWeight: '500' }}>Loading registration requests from server...</span>
                    </div>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Layers size={32} color="#cbd5e1" />
                      <div style={{ fontWeight: '600', color: '#334155' }}>No registration requests found</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>Try adjusting your status filter or search query.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((req) => {
                  const targetId = req.id || (req as any)._id;
                  const badge = getStatusBadge(req.status);
                  const isPending = ['PENDING', 'SUBMITTED', 'UNDER_VERIFICATION', 'MORE_INFO_REQUIRED'].includes(req.status);
                  return (
                    <tr
                      key={targetId}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Tracking & EMIS */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontWeight: '800',
                              color: '#0f766e',
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                              fontSize: '12.5px',
                              background: '#f0fdfa',
                              border: '1px solid #ccfbf1',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              letterSpacing: '0.02em',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {req.requestCode}
                          </span>
                          <button
                            onClick={() => handleCopyCode(req.requestCode)}
                            title="Copy tracking code"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: copiedCode === req.requestCode ? '#16a34a' : '#94a3b8',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '4px',
                              borderRadius: '4px',
                              transition: 'color 0.15s ease',
                            }}
                          >
                            {copiedCode === req.requestCode ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                        <div
                          style={{
                            fontSize: '11.5px',
                            color: '#64748b',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            marginTop: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span style={{ fontWeight: '600', color: '#94a3b8' }}>EMIS:</span>
                          <span style={{ fontWeight: '700', color: '#334155' }}>{req.emisCode}</span>
                        </div>
                      </td>

                      {/* Institution & Classification */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '13.5px', lineHeight: '1.3' }}>
                          {req.institutionName}
                        </div>
                        {req.nameNepali && (
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
                            {req.nameNepali}
                          </div>
                        )}
                        {req.possibleDuplicates && req.possibleDuplicates.length > 0 && (
                          <div
                            title={req.possibleDuplicates.map((d) => `${d.ref} (${d.name}) — ${d.why}`).join('\n')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              marginTop: '4px',
                              background: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #fde68a',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '600',
                            }}
                          >
                            <AlertTriangle size={12} color="#b45309" />
                            <span>
                              Possible duplicate of{' '}
                              <span style={{ fontFamily: 'monospace', fontWeight: '700' }}>
                                {req.possibleDuplicates[0].ref}
                              </span>
                              {req.possibleDuplicates.length > 1 ? ` (+${req.possibleDuplicates.length - 1})` : ''}
                            </span>
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px' }}>
                          <span
                            style={{
                              background: req.institutionKind === 'COLLEGE' ? '#eff6ff' : '#ecfdf5',
                              color: req.institutionKind === 'COLLEGE' ? '#1d4ed8' : '#047857',
                              border: `1px solid ${req.institutionKind === 'COLLEGE' ? '#bfdbfe' : '#a7f3d0'}`,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontWeight: '700',
                              fontSize: '10.5px',
                              letterSpacing: '0.03em',
                            }}
                          >
                            {req.institutionKind || 'SCHOOL'}
                          </span>
                          <span style={{ color: '#cbd5e1' }}>•</span>
                          <span style={{ fontWeight: '600', color: '#475569' }}>{req.institutionType}</span>
                          {req.academicYear && (
                            <>
                              <span style={{ color: '#cbd5e1' }}>•</span>
                              <span style={{ color: '#64748b' }}>{req.academicYear}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Province & District */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <Building2 size={14} color="#0d9488" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px', lineHeight: '1.3' }}>
                              {req.localLevel}
                              {req.ward ? ` - Ward ${req.ward}` : ''}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                              {req.district}, {req.province}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Person */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '13px' }}>
                          {req.contactPerson}
                          {req.designation && (
                            <span style={{ fontWeight: '500', color: '#64748b', fontSize: '11.5px', marginLeft: '4px' }}>
                              ({req.designation})
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#475569', fontSize: '11.5px', marginTop: '3px' }}>
                          <Phone size={11} color="#0d9488" style={{ flexShrink: 0 }} />
                          <span style={{ fontFamily: 'monospace' }}>{req.phone}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                          <Mail size={11} color="#94a3b8" style={{ flexShrink: 0 }} />
                          <span style={{ maxWidth: '190px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.email}>
                            {req.email}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: badge.dot,
                              display: 'inline-block',
                            }}
                          />
                          {badge.label}
                        </span>
                      </td>

                      {/* Submitted Date */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600', color: '#334155', fontSize: '12px' }}>
                          <Calendar size={12} color="#64748b" style={{ flexShrink: 0 }} />
                          <span>{formatDateAD(req.createdAt)}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', paddingLeft: '17px' }}>
                          ({formatDateBS(req.createdAt)} BS)
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenEdit(req)}
                            title="Edit application details before approval"
                            style={{
                              padding: '6px 11px',
                              borderRadius: '7px',
                              background: '#ffffff',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              fontWeight: '600',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease',
                              whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                          >
                            <Edit size={13} color="#64748b" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => setSelectedRequest(req)}
                            title="Review full application form and documents"
                            style={{
                              padding: '6px 12px',
                              borderRadius: '7px',
                              background: '#f0fdfa',
                              color: '#0f766e',
                              border: '1px solid #99f6e4',
                              fontWeight: '700',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s ease',
                              whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#ccfbf1')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = '#f0fdfa')}
                          >
                            <Eye size={13} color="#0f766e" />
                            <span>Review</span>
                          </button>

                          {isPending && (
                            <button
                              onClick={() => handleApproveAndProvision(targetId)}
                              title="1-Click Approve & Provision"
                              style={{
                                padding: '6px 13px',
                                borderRadius: '7px',
                                background: '#059669',
                                color: '#ffffff',
                                border: '1px solid #047857',
                                fontWeight: '700',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                boxShadow: '0 1px 3px rgba(5,150,105,0.25)',
                                transition: 'all 0.15s ease',
                                whiteSpace: 'nowrap',
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#047857')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = '#059669')}
                            >
                              <CheckCircle2 size={13} color="#ffffff" />
                              <span>Approve</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15,23,42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '740px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #dcebe6',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f4faf8' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#5f736f', textTransform: 'uppercase', fontWeight: '800' }}>
                  Institution Onboarding Application Review
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: '2px 0 0' }}>
                  {selectedRequest.institutionName}
                </h3>
                {selectedRequest.possibleDuplicates && selectedRequest.possibleDuplicates.length > 0 && (
                  <div style={{ marginTop: '10px', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#3b2f8f' }}>
                    <b>This may be a duplicate.</b> Check before approving:
                    {selectedRequest.possibleDuplicates.map((d, i) => (
                      <div key={i} style={{ marginTop: '4px' }}>
                        • {d.kind === 'INSTITUTION' ? 'Existing institution' : 'Request'} <b>{d.ref}</b> — {d.name}{d.status ? ` (${d.status})` : ''}: {d.why}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f736f', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {actionError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', color: '#991b1b', fontSize: '13px', marginBottom: '16px' }}>
                  {actionError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px', marginBottom: '20px' }}>
                <div style={{ background: '#f4faf8', padding: '10px 12px', borderRadius: '8px' }}>
                  <span style={{ color: '#5f736f', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Reference Code</span>
                  <strong style={{ fontFamily: 'monospace', color: '#117a6b' }}>{selectedRequest.requestCode}</strong>
                </div>
                <div style={{ background: '#f4faf8', padding: '10px 12px', borderRadius: '8px' }}>
                  <span style={{ color: '#5f736f', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>EMIS Code</span>
                  <strong style={{ fontFamily: 'monospace' }}>{selectedRequest.emisCode}</strong>
                </div>
                <div><span style={{ color: '#5f736f' }}>Administrative Unit:</span> <strong>{selectedRequest.localLevel}, Ward {selectedRequest.ward || 1}</strong></div>
                <div><span style={{ color: '#5f736f' }}>District & Province:</span> <strong>{selectedRequest.district}, {selectedRequest.province}</strong></div>
                <div><span style={{ color: '#5f736f' }}>Contact Person:</span> <strong>{selectedRequest.contactPerson} ({selectedRequest.designation || 'Principal'})</strong></div>
                <div><span style={{ color: '#5f736f' }}>Email & Phone:</span> <strong>{selectedRequest.email} • {selectedRequest.phone}</strong></div>
                <div><span style={{ color: '#5f736f' }}>Institution Kind:</span> <strong>{selectedRequest.institutionKind}</strong></div>
                <div><span style={{ color: '#5f736f' }}>Category:</span> <strong>{selectedRequest.institutionType}</strong></div>
                <div><span style={{ color: '#5f736f' }}>Estimated Enrollment:</span> <strong>{selectedRequest.estimatedStudents || 300} Students</strong></div>
                <div><span style={{ color: '#5f736f' }}>Academic Year:</span> <strong>{selectedRequest.academicYear || '2081/2082'}</strong></div>
                <div><span style={{ color: '#5f736f' }}>Proposed Admin:</span> <strong>{selectedRequest.adminDetails?.username || `admin_${selectedRequest.emisCode}`}</strong></div>
                <div><span style={{ color: '#5f736f' }}>Status:</span> <strong>{selectedRequest.status}</strong></div>
              </div>

              {selectedRequest.notes && (
                <div style={{ background: '#ebf5f1', border: '1px solid #dcebe6', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#2f4f4c', marginBottom: '16px' }}>
                  <strong>Applicant Remarks:</strong> {selectedRequest.notes}
                </div>
              )}

              {selectedRequest.moreInfoNotes && (
                <div style={{ background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#4c3fa8', marginBottom: '16px' }}>
                  <strong>Prior Clarification Request:</strong> {selectedRequest.moreInfoNotes}
                </div>
              )}

              {selectedRequest.rejectionReason && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#991b1b', marginBottom: '16px' }}>
                  <strong>Rejection Rationale:</strong> {selectedRequest.rejectionReason}
                </div>
              )}

              {/* Clarification Notes dialog */}
              {notesDialog && (
                <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#3b2f8f', marginBottom: '6px' }}>
                    Clarification Notes for Applicant Institution:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Please verify EMIS registration certificate or clarify technical faculty details."
                    value={moreInfoText}
                    onChange={(e) => setMoreInfoText(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                    <button onClick={() => setNotesDialog(false)} style={{ padding: '6px 12px', background: '#dcebe6', borderRadius: '6px', border: 'none', fontSize: '12px' }}>
                      Cancel
                    </button>
                    <button onClick={handleRequestMoreInfo} style={{ padding: '6px 12px', background: '#6d5bd0', color: '#fff', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: 'bold' }}>
                      Send Query
                    </button>
                  </div>
                </div>
              )}

              {/* Reject Reason dialog */}
              {rejectDialog && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#991b1b', marginBottom: '6px' }}>
                    Reason for Rejecting Application:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Invalid government EMIS code; accreditation documents could not be verified."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                    <button onClick={() => setRejectDialog(false)} style={{ padding: '6px 12px', background: '#dcebe6', borderRadius: '6px', border: 'none', fontSize: '12px' }}>
                      Cancel
                    </button>
                    <button onClick={handleReject} style={{ padding: '6px 12px', background: '#dc2626', color: '#fff', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: 'bold' }}>
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f4faf8', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEdit(selectedRequest);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cfdcd8',
                    background: '#ffffff',
                    color: '#0e3e3b',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Edit size={14} />
                  <span>Edit Application</span>
                </button>

                <button
                  onClick={() => { setNotesDialog(true); setRejectDialog(false); }}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #ddd6fe', background: '#f5f3ff', color: '#6d5bd0', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Request Clarification
                </button>
                <button
                  onClick={() => { setRejectDialog(true); setNotesDialog(false); }}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  Reject
                </button>
              </div>

              {selectedRequest.status !== 'APPROVED' && selectedRequest.status !== 'ACTIVE' ? (
                <button
                  disabled={actionLoading}
                  onClick={() => handleApproveAndProvision(selectedRequest.id || (selectedRequest as any)._id)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    background: '#117a6b',
                    color: '#ffffff',
                    fontWeight: '800',
                    fontSize: '13px',
                    border: 'none',
                    cursor: actionLoading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 4px rgba(234,88,12, 0.2)',
                  }}
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  <span>{actionLoading ? 'Executing Provisioning Pipeline...' : 'Approve & Execute Provisioning'}</span>
                </button>
              ) : (
                <span style={{ fontSize: '12px', color: '#117a6b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={16} /> Already Provisioned & Active
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Application Modal */}
      {isEditModalOpen && editingRequest && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15,23,42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '820px',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #cfdcd8',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f4faf8' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#117a6b', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.4px' }}>
                  Super Admin Management
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: '2px 0 0' }}>
                  Edit Registration Application ({editingRequest.requestCode})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#5f736f', fontSize: '18px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px', paddingBottom: '18px', borderBottom: '1px solid #ebf5f1' }}>
                <LogoUpload
                  label="School / College logo"
                  value={editingRequest.logoDataUrl || editingRequest.logoUrl || null}
                  onChange={(v) => setEditingRequest({ ...editingRequest, logoDataUrl: v || undefined, ...(v ? {} : { logoUrl: editingRequest.logoDataUrl ? editingRequest.logoUrl : undefined }) })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Institution Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRequest.institutionName}
                    onChange={(e) => setEditingRequest({ ...editingRequest, institutionName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Name in Nepali (देवनागरी)
                  </label>
                  <input
                    type="text"
                    value={editingRequest.nameNepali}
                    onChange={(e) => setEditingRequest({ ...editingRequest, nameNepali: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Government EMIS Code (9 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRequest.emisCode}
                    onChange={(e) => setEditingRequest({ ...editingRequest, emisCode: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px', fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Institution Kind
                  </label>
                  <select
                    value={editingRequest.institutionKind}
                    onChange={(e) => setEditingRequest({ ...editingRequest, institutionKind: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  >
                    <option value="SCHOOL">School (Classes 1–12)</option>
                    <option value="COLLEGE">Higher Education / College (TU/Affiliate)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Category
                  </label>
                  <select
                    value={editingRequest.institutionType}
                    onChange={(e) => setEditingRequest({ ...editingRequest, institutionType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  >
                    <option value="COMMUNITY">Community / Government (सामुदायिक)</option>
                    <option value="INSTITUTIONAL">Institutional / Private (संस्थागत)</option>
                    <option value="RELIGIOUS">Religious / Madrasa / Gumba (धार्मिक)</option>
                    <option value="TECHNICAL">Technical / TVET (प्राविधिक)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Province *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRequest.province}
                    onChange={(e) => setEditingRequest({ ...editingRequest, province: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRequest.district}
                    onChange={(e) => setEditingRequest({ ...editingRequest, district: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Local Municipality / Palika *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRequest.localLevel}
                    onChange={(e) => setEditingRequest({ ...editingRequest, localLevel: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Ward Number
                  </label>
                  <input
                    type="number"
                    value={editingRequest.ward}
                    onChange={(e) => setEditingRequest({ ...editingRequest, ward: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRequest.contactPerson}
                    onChange={(e) => setEditingRequest({ ...editingRequest, contactPerson: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Official Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editingRequest.email}
                    onChange={(e) => setEditingRequest({ ...editingRequest, email: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Official Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRequest.phone}
                    onChange={(e) => setEditingRequest({ ...editingRequest, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Estimated Student Enrollment
                  </label>
                  <input
                    type="number"
                    value={editingRequest.estimatedStudents}
                    onChange={(e) => setEditingRequest({ ...editingRequest, estimatedStudents: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                    Proposed School Admin Username
                  </label>
                  <input
                    type="text"
                    value={editingRequest.adminUsername}
                    onChange={(e) => setEditingRequest({ ...editingRequest, adminUsername: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px', color: '#2f4f4c' }}>
                  Super Admin / Accreditation Notes
                </label>
                <textarea
                  rows={2}
                  value={editingRequest.notes}
                  onChange={(e) => setEditingRequest({ ...editingRequest, notes: e.target.value })}
                  placeholder="Verification comments or special instructions..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #dcebe6', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ padding: '9px 18px', borderRadius: '8px', background: '#ebf5f1', border: 'none', color: '#4b605b', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    background: '#117a6b',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: editLoading ? 'wait' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {editLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>{editLoading ? 'Saving...' : 'Save Updated Application'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

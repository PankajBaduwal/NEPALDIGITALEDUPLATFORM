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
} from 'lucide-react';
import { formatDate, formatDateTime, formatTime } from '../../utils/dates';

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
        return { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0', label: 'Approved & Active' };
      case 'PROVISIONING':
        return { bg: '#e0e7ff', color: '#4338ca', border: '#c7d2fe', label: 'Provisioning' };
      case 'UNDER_VERIFICATION':
        return { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd', label: 'Under Verification' };
      case 'PENDING':
      case 'SUBMITTED':
        return { bg: '#ede9fe', color: '#4c3fa8', border: '#ddd6fe', label: 'Pending Review' };
      case 'MORE_INFO_REQUIRED':
        return { bg: '#f5f3ff', color: '#4c3fa8', border: '#ede9fe', label: 'Clarification Needed' };
      case 'REJECTED':
        return { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', label: 'Rejected' };
      default:
        return { bg: '#ebf5f1', color: '#4b605b', border: '#dcebe6', label: status };
    }
  };

  const pendingCount = requests.filter(r => ['PENDING', 'SUBMITTED', 'UNDER_VERIFICATION'].includes(r.status)).length;
  const approvedCount = requests.filter(r => ['APPROVED', 'ACTIVE'].includes(r.status)).length;

  return (
    <div>
      {/* Alert Banner if pending applications exist */}
      {pendingCount > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
            border: '1.5px solid #ddd6fe',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(109,91,208, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#6d5bd0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '14px', color: '#3b2f8f' }}>
                {pendingCount} Institution Self-Registration{pendingCount > 1 ? 's' : ''} Awaiting Super Admin Review
              </div>
              <div style={{ fontSize: '12px', color: '#4c3fa8' }}>
                Schools and colleges have submitted registration forms through the public portal. You can review, edit details, or approve & provision immediately.
              </div>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('PENDING')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#4c3fa8',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Filter Pending ({pendingCount})
          </button>
        </div>
      )}

      {actionSuccess && (
        <div style={{ background: '#e6f7f0', border: '1px solid #bfeede', borderRadius: '10px', padding: '12px 16px', color: '#0f4c4a', fontSize: '13px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#117a6b" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f4c4a', fontWeight: 'bold' }}>✕</button>
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
          marginBottom: '20px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '280px', maxWidth: '420px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8da19d' }} />
            <input
              type="text"
              placeholder="Search by Institution, EMIS, Ref Code, Contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: '8px', border: '1px solid #cfdcd8', fontSize: '13px', outline: 'none' }}
            />
          </div>
          <button
            type="submit"
            style={{ padding: '8px 16px', borderRadius: '8px', background: '#117a6b', color: '#ffffff', fontWeight: '700', fontSize: '13px', border: 'none', cursor: 'pointer' }}
          >
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#5f736f', marginRight: '4px' }}>Filter:</span>
          {[
            { key: 'ALL', label: 'All' },
            { key: 'PENDING', label: `Pending (${pendingCount})` },
            { key: 'UNDER_VERIFICATION', label: 'Under Verification' },
            { key: 'MORE_INFO_REQUIRED', label: 'Clarification Needed' },
            { key: 'APPROVED', label: `Approved (${approvedCount})` },
            { key: 'REJECTED', label: 'Rejected' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setStatusFilter(st.key)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                background: statusFilter === st.key ? '#117a6b' : '#ebf5f1',
                color: statusFilter === st.key ? '#ffffff' : '#4b605b',
                transition: 'all 0.15s ease',
              }}
            >
              {st.label}
            </button>
          ))}
          <button
            onClick={loadRequests}
            title="Refresh List"
            style={{ padding: '6px 10px', borderRadius: '6px', background: '#f4faf8', border: '1px solid #dcebe6', cursor: 'pointer', color: '#4b605b' }}
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Main Requests Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #dcebe6',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6', color: '#4b605b', fontWeight: '700' }}>
              <th style={{ padding: '12px 16px' }}>Tracking & EMIS</th>
              <th style={{ padding: '12px 16px' }}>Institution & Type</th>
              <th style={{ padding: '12px 16px' }}>Province & District</th>
              <th style={{ padding: '12px 16px' }}>Contact Person</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Submitted</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#5f736f' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Loading registration requests from MongoDB...</span>
                  </div>
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#5f736f' }}>
                  No registration requests matching criteria found.
                </td>
              </tr>
            ) : (
              requests.map((req) => {
                const targetId = req.id || (req as any)._id;
                const badge = getStatusBadge(req.status);
                const isPending = ['PENDING', 'SUBMITTED', 'UNDER_VERIFICATION', 'MORE_INFO_REQUIRED'].includes(req.status);
                return (
                  <tr key={targetId} style={{ borderBottom: '1px solid #ebf5f1', transition: 'background 0.15s ease' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '800', color: '#117a6b', fontFamily: 'monospace' }}>
                        {req.requestCode}
                      </div>
                      <div style={{ fontSize: '11px', color: '#5f736f', fontFamily: 'monospace' }}>
                        EMIS: {req.emisCode}
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '700', color: '#0e3e3b' }}>{req.institutionName}</div>
                      {req.possibleDuplicates && req.possibleDuplicates.length > 0 && (
                        <div
                          title={req.possibleDuplicates.map((d) => `${d.ref} (${d.name}) — ${d.why}`).join('\n')}
                          style={{ display: 'inline-block', marginTop: '3px', background: '#ede9fe', color: '#3b2f8f', border: '1px solid #ddd6fe', padding: '1px 8px', borderRadius: '999px', fontSize: '10.5px', fontWeight: '800' }}
                        >
                          ⚠ Possible duplicate of {req.possibleDuplicates[0].ref}
                          {req.possibleDuplicates.length > 1 ? ` +${req.possibleDuplicates.length - 1}` : ''}
                        </div>
                      )}
                      <div style={{ fontSize: '11px', color: '#5f736f', display: 'flex', gap: '6px', marginTop: '2px' }}>
                        <span style={{ background: '#ebf5f1', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                          {req.institutionKind || 'SCHOOL'}
                        </span>
                        <span>•</span>
                        <span>{req.institutionType}</span>
                      </div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#2f4f4c' }}>{req.localLevel}</div>
                      <div style={{ fontSize: '11px', color: '#5f736f' }}>{req.district}, {req.province}</div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '600' }}>{req.contactPerson}</div>
                      <div style={{ fontSize: '11px', color: '#5f736f' }}>{req.phone} • {req.email}</div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#5f736f' }}>
                      {formatDate(req.createdAt)}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          onClick={() => handleOpenEdit(req)}
                          title="Edit application details before approval"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: '#f4faf8',
                            color: '#0e3e3b',
                            border: '1px solid #cfdcd8',
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Edit size={13} color="#4b605b" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setSelectedRequest(req)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: '#e6f7f0',
                            color: '#117a6b',
                            border: '1px solid #bfeede',
                            fontWeight: '700',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Eye size={13} />
                          <span>Review</span>
                        </button>

                        {isPending && (
                          <button
                            onClick={() => handleApproveAndProvision(targetId)}
                            title="1-Click Approve & Provision"
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              background: '#e6f7f0',
                              color: '#117a6b',
                              border: '1px solid #bfeede',
                              fontWeight: '700',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <CheckCircle2 size={13} />
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

      {/* Review Modal */}
      {selectedRequest && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(14, 62, 59, 0.65)',
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
                    boxShadow: '0 2px 4px rgba(17, 122, 107, 0.2)',
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
            background: 'rgba(14, 62, 59, 0.7)',
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

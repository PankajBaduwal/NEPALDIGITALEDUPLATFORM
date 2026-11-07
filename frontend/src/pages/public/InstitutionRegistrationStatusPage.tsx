import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Search,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  MapPin,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface ApplicationStatusData {
  requestCode: string;
  institutionName: string;
  nameNepali?: string;
  emisCode: string;
  institutionKind: 'SCHOOL' | 'COLLEGE';
  institutionType: string;
  province: string;
  district: string;
  localLevel: string;
  status:
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING'
  | 'UNDER_VERIFICATION'
  | 'MORE_INFO_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PROVISIONING'
  | 'ACTIVE';
  rejectionReason?: string;
  moreInfoNotes?: string;
  submittedAt: string;
  updatedAt: string;
  isProvisioned: boolean;
}

export const InstitutionRegistrationStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('code') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApplicationStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async (codeToSearch: string) => {
    if (!codeToSearch.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<ApplicationStatusData>(
        `/auth/institution-registration-status/${encodeURIComponent(codeToSearch.trim())}`
      );
      setResult(data);
    } catch (err: any) {
      setResult(null);
      setError(
        err.message ||
        'Application record not found. Please double check your Reference Code (e.g. REG-2081-XXXX) or EMIS code.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setSearchQuery(code);
      fetchStatus(code);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(searchQuery);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
        return {
          bg: '#dcfce7',
          color: '#16a34a',
          label: 'Application Approved & Provisioned',
          icon: <CheckCircle2 size={16} />,
          stepIdx: 4,
        };
      case 'PROVISIONING':
        return {
          bg: '#e0e7ff',
          color: '#4338ca',
          label: 'System Provisioning in Progress',
          icon: <Clock size={16} />,
          stepIdx: 3,
        };
      case 'UNDER_VERIFICATION':
      case 'PENDING':
        return {
          bg: '#ede9fe',
          color: '#6d5bd0',
          label: 'Under Ministry Review & Verification',
          icon: <Clock size={16} />,
          stepIdx: 2,
        };
      case 'MORE_INFO_REQUIRED':
        return {
          bg: '#f5f3ff',
          color: '#4c3fa8',
          label: 'Action Required: Clarification Needed',
          icon: <HelpCircle size={16} />,
          stepIdx: 2,
        };
      case 'REJECTED':
        return {
          bg: '#fee2e2',
          color: '#dc2626',
          label: 'Application Declined',
          icon: <XCircle size={16} />,
          stepIdx: 0,
        };
      default:
        return {
          bg: '#f1f5f9',
          color: '#475569',
          label: 'Application Submitted',
          icon: <Clock size={16} />,
          stepIdx: 1,
        };
    }
  };

  const statusConfig = result ? getStatusBadge(result.status) : null;

  const timelineSteps = [
    { title: 'Application Submitted', desc: 'Received in Central Registry' },
    { title: 'Verification Review', desc: 'EMIS & geographic check' },
    { title: 'Institutional Provisioning', desc: 'Generating academic structure' },
    { title: 'Active on Platform', desc: 'Admin account activated' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
            }}
          >
            🇳🇵
          </div>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Nepal Digital Education Ecosystem
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Institution Application Status Tracker
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/register-institution"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: '#eff6ff',
              color: '#2563eb',
              fontSize: '13px',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            New Registration
          </Link>
          <Link
            to="/login"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontSize: '13px',
              fontWeight: '600',
              background: '#ffffff',
              textDecoration: 'none',
            }}
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main style={{ flex: 1, padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '820px' }}>
          {/* Search Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '28px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}
          >
            <h1 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 6px', color: '#0f172a' }}>
              Check Institutional Application Progress
            </h1>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px' }}>
              Enter your Application Reference Code (e.g. <code>REG-2081-XXXX</code>) or 9-digit EMIS Code.
            </p>

            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                />
                <input
                  type="text"
                  placeholder="e.g. REG-2081-1234 or 570010001"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                style={{
                  padding: '11px 24px',
                  borderRadius: '10px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '14px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {loading ? 'Searching...' : 'Track Status'}
              </button>
            </form>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '16px',
                color: '#991b1b',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              <AlertCircle size={20} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', marginBottom: '2px' }}>Application Record Not Found</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Result Card */}
          {result && statusConfig && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '32px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              }}
            >
              {/* Header Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      background: statusConfig.bg,
                      color: statusConfig.color,
                      marginBottom: '10px',
                    }}
                  >
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>
                    {result.institutionName}
                  </h2>
                  {result.nameNepali && (
                    <div style={{ fontSize: '14px', color: '#64748b' }}>
                      {result.nameNepali}
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
                    Tracking Reference
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#2563eb', fontFamily: 'monospace' }}>
                    {result.requestCode}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    EMIS: {result.emisCode}
                  </div>
                </div>
              </div>

              {/* Visual Timeline (if not rejected) */}
              {result.status !== 'REJECTED' && (
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    {timelineSteps.map((step, idx) => {
                      const stepNum = idx + 1;
                      const isComplete = stepNum <= statusConfig.stepIdx;
                      const isCurrent = stepNum === statusConfig.stepIdx;
                      return (
                        <div
                          key={step.title}
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: '700',
                              background: isComplete ? '#2563eb' : '#e2e8f0',
                              color: isComplete ? '#ffffff' : '#94a3b8',
                              border: isCurrent ? '3px solid #bfdbfe' : 'none',
                            }}
                          >
                            {isComplete ? '✓' : stepNum}
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: isCurrent ? '700' : '500',
                              color: isComplete ? '#0f172a' : '#94a3b8',
                            }}
                          >
                            {step.title}
                          </span>
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                            {step.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Clarification Notes Notice (if MORE_INFO_REQUIRED) */}
              {result.status === 'MORE_INFO_REQUIRED' && result.moreInfoNotes && (
                <div
                  style={{
                    background: '#f5f3ff',
                    border: '1.5px solid #ede9fe',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4c3fa8', fontWeight: '800', marginBottom: '6px' }}>
                    <HelpCircle size={18} />
                    Super Admin Clarification Request
                  </div>
                  <p style={{ fontSize: '13px', color: '#3b2f8f', margin: '0 0 12px', lineHeight: 1.5 }}>
                    {result.moreInfoNotes}
                  </p>
                  <div style={{ fontSize: '12px', color: '#4c3fa8' }}>
                    Please contact the platform administrator at <strong>support@nepaledu.gov.np</strong> or reply to your registration notification email referencing <strong>{result.requestCode}</strong>.
                  </div>
                </div>
              )}

              {/* Rejection Notice (if REJECTED) */}
              {result.status === 'REJECTED' && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1.5px solid #fecaca',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', fontWeight: '800', marginBottom: '6px' }}>
                    <XCircle size={18} />
                    Application Verification Unsuccessful
                  </div>
                  <p style={{ fontSize: '13px', color: '#991b1b', margin: '0 0 10px', lineHeight: 1.5 }}>
                    {result.rejectionReason || 'The application did not fulfill government EMIS validation criteria or institutional verification guidelines.'}
                  </p>
                  <div style={{ fontSize: '12px', color: '#7f1d1d' }}>
                    Institutions may re-apply with corrected documentation or contact the Ministry Education Directorate.
                  </div>
                </div>
              )}

              {/* Active & Approved Action */}
              {(result.status === 'APPROVED' || result.status === 'ACTIVE') && (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1.5px solid #bbf7d0',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#166534', margin: '0 0 4px' }}>
                      Ready for School Administrator Login
                    </h4>
                    <p style={{ fontSize: '12px', color: '#15803d', margin: 0 }}>
                      The institutional database, curriculum courses, and default timetable have been fully generated.
                    </p>
                  </div>
                  <Link
                    to="/login"
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      background: '#16a34a',
                      color: '#ffffff',
                      fontWeight: '700',
                      fontSize: '13px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0,
                    }}
                  >
                    Launch School Portal
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              {/* Institutional Details Grid */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: '#64748b', marginBottom: '12px' }}>
                  Institutional Record
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Administrative Province:</span>{' '}
                    <strong>{result.province}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>District:</span>{' '}
                    <strong>{result.district}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Local Municipality:</span>{' '}
                    <strong>{result.localLevel}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Category:</span>{' '}
                    <strong>{result.institutionType}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Submitted Date:</span>{' '}
                    <strong>{new Date(result.submittedAt).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Last Updated:</span>{' '}
                    <strong>{new Date(result.updatedAt).toLocaleDateString()}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};


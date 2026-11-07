import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { formatDate, formatDateTime, formatTime } from '../../utils/dates';

interface ProvisioningJobItem {
  id: string;
  jobCode: string;
  institutionName: string;
  emisCode: string;
  jobType: string;
  status: string;
  steps: Array<{
    name: string;
    status: string;
    message?: string;
    timestamp?: string;
  }>;
  totalSteps: number;
  currentStepIndex: number;
  error?: string;
  performedBy?: {
    fullName: string;
    username: string;
  };
  createdAt: string;
}

export const ProvisioningHistoryManager: React.FC = () => {
  const [jobs, setJobs] = useState<ProvisioningJobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<ProvisioningJobItem | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.get<ProvisioningJobItem[]>('/admin/provisioning-history?limit=30');
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load provisioning history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
            Automated Provisioning Audit Trail
          </h3>
          <p style={{ fontSize: '12px', color: '#5f736f', margin: 0 }}>
            Audit log of all 12-step automated provisioning jobs executed across schools and colleges.
          </p>
        </div>
        <button
          onClick={loadHistory}
          style={{ padding: '6px 14px', borderRadius: '6px', background: '#ebf5f1', border: '1px solid #cfdcd8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
        >
          Refresh Logs
        </button>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #dcebe6', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f4faf8', borderBottom: '1px solid #dcebe6', color: '#5f736f', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 16px' }}>Job Code</th>
              <th style={{ padding: '12px 16px' }}>Institution</th>
              <th style={{ padding: '12px 16px' }}>Type</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>Performed By</th>
              <th style={{ padding: '12px 16px' }}>Timestamp</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Log Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#5f736f' }}>
                  Loading provisioning history...
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#5f736f' }}>
                  No automated provisioning jobs logged yet.
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
                const isSuccess = job.status === 'COMPLETED';
                return (
                  <tr key={job.id} style={{ borderBottom: '1px solid #ebf5f1' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '800', fontFamily: 'monospace', color: '#117a6b' }}>
                      {job.jobCode}
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '700', color: '#0e3e3b' }}>{job.institutionName}</div>
                      <div style={{ fontSize: '11px', color: '#5f736f', fontFamily: 'monospace' }}>EMIS: {job.emisCode}</div>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: '#ebf5f1', fontWeight: '600' }}>
                        {job.jobType === 'DIRECT_PROVISION' ? 'Direct Super Admin' : 'Public Request Approval'}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: isSuccess ? '#dcfce7' : '#fee2e2',
                          color: isSuccess ? '#16a34a' : '#dc2626',
                        }}
                      >
                        {isSuccess ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        {job.status}
                      </span>
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                      {job.performedBy?.fullName || 'System Automated'}
                    </td>

                    <td style={{ padding: '12px 16px', fontSize: '12px', color: '#5f736f' }}>
                      {formatDateTime(job.createdAt)}
                    </td>

                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedJob(job)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: '#f4faf8',
                          border: '1px solid #cfdcd8',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        View Steps ({job.steps?.length || 12})
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Steps Detail Modal */}
      {selectedJob && (
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
              maxWidth: '680px',
              maxHeight: '85vh',
              overflowY: 'auto',
              border: '1px solid #dcebe6',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#117a6b', fontFamily: 'monospace' }}>
                  {selectedJob.jobCode}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                  {selectedJob.institutionName}
                </h3>
              </div>
              <button onClick={() => setSelectedJob(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedJob.steps?.map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #ebf5f1',
                    background: '#f4faf8',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <span style={{ color: step.status === 'COMPLETED' ? '#16a34a' : step.status === 'FAILED' ? '#dc2626' : '#5f736f', fontWeight: 'bold' }}>
                    {step.status === 'COMPLETED' ? '✓' : step.status === 'FAILED' ? '✗' : '•'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: '#0e3e3b' }}>{step.name}</div>
                    {step.message && <div style={{ fontSize: '12px', color: '#5f736f', marginTop: '2px' }}>{step.message}</div>}
                  </div>
                  {step.timestamp && (
                    <span style={{ fontSize: '10px', color: '#8da19d' }}>
                      {formatTime(step.timestamp)}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setSelectedJob(null)}
                style={{ padding: '8px 18px', borderRadius: '8px', background: '#117a6b', color: '#ffffff', fontWeight: '700', border: 'none', cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


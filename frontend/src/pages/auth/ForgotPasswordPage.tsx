import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { KeyRound, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ message: string; resetToken?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setError('Please provide your account username or registered email.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ message: string; resetToken?: string }>('/auth/forgot-password', {
        identifier,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Unable to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fcfb', color: '#0f172a' }}>
      <header style={{ padding: '20px 40px', borderBottom: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#0f4c4a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
            🇳🇵
          </div>
          <span style={{ fontSize: '16px', fontWeight: '800' }}>Nepal Digital Education</span>
        </div>
        <Link to="/login" style={{ fontSize: '13px', color: '#0f4c4a', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '440px', background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '36px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e9f6f1', color: '#0f4c4a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <KeyRound size={24} />
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
            Forgot Password?
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, marginBottom: '24px' }}>
            Enter your registered username or email address and we'll generate your password reset authorization.
          </p>

          {error && (
            <div style={{ padding: '12px 14px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {result ? (
            <div>
              <div style={{ padding: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', color: '#166534', fontSize: '13px', marginBottom: '24px', lineHeight: 1.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '6px' }}>
                  <CheckCircle2 size={16} color="#16a34a" /> Reset Link Ready
                </div>
                {result.message}
              </div>

              {result.resetToken && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '700' }}>
                    Security Reset Token (Direct Sandbox Mode):
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={result.resetToken}
                    style={{ width: '100%', padding: '10px', background: '#f8fcfb', border: '1px solid #cbd5e1', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', color: '#334155' }}
                  />
                  <div style={{ marginTop: '16px' }}>
                    <Link
                      to={`/reset-password?token=${result.resetToken}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        width: '100%',
                        padding: '11px',
                        borderRadius: '8px',
                        background: '#0f4c4a',
                        color: '#ffffff',
                        fontWeight: '700',
                        fontSize: '13px',
                      }}
                    >
                      Proceed to Reset Password <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Username or Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. teacher_ramesh or ramesh@kmss.edu.np"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  background: '#0f4c4a',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Sending Request...' : 'Send Password Reset'}
              </button>
            </form>
          )}

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <Link to="/login" style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
              Remember your password? <span style={{ color: '#0f4c4a' }}>Sign In</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};


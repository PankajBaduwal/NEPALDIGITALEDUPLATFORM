import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NepalEduLogo } from '../../components/common/NepalEduLogo';
import {
  ShieldAlert,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Building,
  KeyRound,
  Sparkles,
} from 'lucide-react';

export const SuperAdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('NepalSuperAdmin@2081');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide both administrative username and security password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await login({ username, password });
      if (user.role === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else {
        setError('Unauthorized access. This portal is restricted to Central Ministry / Super Administrators.');
      }
    } catch (err: any) {
      setError(err.message || 'Administrative authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSuperAdmin = async () => {
    setDemoLoading(true);
    setError(null);
    try {
      await demoLogin('SUPER_ADMIN');
      navigate('/super-admin');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate Super Admin demo session.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(155deg, #0f4c4a 0%, #0b3f3d 55%, #062b2a 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px',
        color: '#FFFFFF',
        fontFamily: '"Inter", sans-serif',
      }}
    >
      {/* Top Logo Bar */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <NepalEduLogo size="lg" variant="white" onClick={() => navigate('/')} />
      </div>

      {/* Main Administrative Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#FFFFFF',
          color: '#0e3e3b',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Card Header */}
        <div
          style={{
            background: '#0f4c4a',
            color: '#FFFFFF',
            padding: '24px 28px',
            borderBottom: '3px solid #117a6b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34D399',
              }}
            >
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.3px', margin: 0 }}>
                Super Admin Portal
              </h2>
              <div style={{ fontSize: '11px', color: '#93C5FD' }}>
                Central MoEST Platform Oversight & System Governance
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: '28px' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '13px',
                marginBottom: '18px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Administrative Username / Email *
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. superadmin"
                  style={{
                    width: '100%',
                    padding: '11px 12px 11px 40px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '14px',
                    color: '#0e3e3b',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#0f4c4a')}
                  onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 40px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '14px',
                    color: '#0e3e3b',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#0f4c4a')}
                  onBlur={(e) => (e.target.style.borderColor = '#CBD5E1')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '6px',
                padding: '12px',
                borderRadius: '8px',
                background: '#0f4c4a',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 800,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(30, 58, 95, 0.3)',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#152943')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#0f4c4a')}
            >
              {loading ? 'Authenticating System Administrator...' : (
                <>
                  <span>Sign In as Super Admin</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '22px 0',
              color: '#94A3B8',
              fontSize: '12px',
            }}
          >
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            <span>OR INSTANT EVALUATION</span>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          </div>

          {/* 1-Click Super Admin Demo Button */}
          <button
            type="button"
            onClick={handleDemoSuperAdmin}
            disabled={demoLoading}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '8px',
              background: '#e9f6f1',
              color: '#0f4c4a',
              border: '1.5px solid #bfeede',
              fontSize: '13px',
              fontWeight: 800,
              cursor: demoLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#D1FAE5';
              e.currentTarget.style.borderColor = '#0f4c4a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#e9f6f1';
              e.currentTarget.style.borderColor = '#bfeede';
            }}
          >
            <Sparkles size={16} color="#0f4c4a" />
            <span>{demoLoading ? 'Launching Central Super Admin...' : '1-Click Demo Login as Super Admin'}</span>
          </button>


        </div>

        {/* Card Footer */}
        <div
          style={{
            background: '#f8fcfb',
            borderTop: '1px solid #E2E8F0',
            padding: '14px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12.5px',
          }}
        >
          <Link
            to="/login"
            style={{
              color: '#0f4c4a',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Building size={14} />
            <span>← Back to Institution Login</span>
          </Link>
          <span style={{ color: '#94A3B8' }}>MoEST Central Node</span>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLoginPage;


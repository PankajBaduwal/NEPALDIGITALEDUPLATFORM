import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DemoRoleModal } from '../components/common/DemoRoleModal';
import {
  ShieldAlert,
  School,
  GraduationCap,
  Users,
  Presentation,
  CheckCircle,
  LogIn,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const Launchpad: React.FC = () => {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();
  const [activeTab, setActiveTab] = useState<'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'COLLEGE_ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'CLASS_TEACHER' | 'STUDENT'>('SUPER_ADMIN');
  const [username, setUsername] = useState('superadmin');
  const [password, setPassword] = useState('NepalSuperAdmin@2081');
  const [emisCode, setEmisCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [instantLoading, setInstantLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const handleTabChange = (role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'COLLEGE_ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'CLASS_TEACHER' | 'STUDENT') => {
    setActiveTab(role);
    setError(null);
    if (role === 'SUPER_ADMIN') {
      setUsername('superadmin');
      setPassword('NepalSuperAdmin@2081');
      setEmisCode('');
    } else if (role === 'SCHOOL_ADMIN') {
      setUsername('dhambojhi_admin');
      setPassword('Nepal@1234');
      setEmisCode('570010001');
    } else if (role === 'COLLEGE_ADMIN') {
      setUsername('admin_570020002');
      setPassword('CollegeAdmin@2081');
      setEmisCode('570020002');
    } else if (role === 'PRINCIPAL') {
      setUsername('dhambojhi_principal');
      setPassword('Nepal@1234');
      setEmisCode('570010001');
    } else if (role === 'TEACHER') {
      setUsername('dhambojhi_t_29');
      setPassword('Nepal@1234');
      setEmisCode('570010001');
    } else if (role === 'CLASS_TEACHER') {
      setUsername('dhambojhi_t_01');
      setPassword('Nepal@1234');
      setEmisCode('570010001');
    } else {
      setUsername('dhambojhi_s_163');
      setPassword('Nepal@1234');
      setEmisCode('570010001');
    }
  };

  const getTargetRoute = (role: string) => {
    if (role === 'SUPER_ADMIN') return '/super-admin';
    if (role === 'PRINCIPAL') return '/principal';
    if (role === 'SCHOOL_ADMIN' || role === 'COLLEGE_ADMIN') return '/school-admin';
    if (role === 'TEACHER' || role === 'CLASS_TEACHER') return '/teacher';
    return '/student';
  };

  const handleInstantDemo = async () => {
    setInstantLoading(true);
    setError(null);
    try {
      const demoKey = activeTab === 'CLASS_TEACHER' ? 'CLASS_TEACHER' : (activeTab === 'TEACHER' ? 'dhambojhi_t_29' : activeTab);
      await demoLogin(demoKey);
      navigate(getTargetRoute(activeTab));
    } catch (err: any) {
      setError(err.message || 'Instant demo login failed');
    } finally {
      setInstantLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login({ username, password, emisCode: emisCode || undefined });
      if (user.role === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else if (user.role === 'PRINCIPAL') {
        navigate('/principal');
      } else if (user.role === 'SCHOOL_ADMIN' || user.role === 'COLLEGE_ADMIN') {
        navigate('/school-admin');
      } else if (user.role === 'TEACHER') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4faf8', color: '#0e3e3b', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <header style={{ padding: '16px 40px', background: '#ffffff', borderBottom: '1px solid #dcebe6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px', color: '#fff' }}>
            🇳🇵
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px', color: '#0e3e3b' }}>Nepal Digital Education Ecosystem</h2>
            <p style={{ fontSize: '12px', color: '#5f736f' }}>Classes 1–12 • MERN Architecture • CDC Integrated</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setDemoModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #bfdbfe',
              background: '#eff6ff',
              color: '#2563eb',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            <Sparkles size={15} /> 1-Click Role Demo
          </button>
          <a
            href="/smartboard/index.html"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: '#16a34a',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.2)'
            }}
          >
            <Presentation size={16} />
            Launch Smart Board
          </a>
        </div>
      </header>

      {/* Main Hero & Auth Section */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1080px', width: '100%', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '50px', alignItems: 'center' }}>
          
          {/* Left Column: Platform Features */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '20px', color: '#2563eb', fontSize: '12px', fontWeight: '700', marginBottom: '20px' }}>
              <Layers size={14} /> MERN STACK PLATFORM
            </div>
            <h1 style={{ fontSize: '40px', fontWeight: '800', lineHeight: '1.15', marginBottom: '18px', letterSpacing: '-1px', color: '#0e3e3b' }}>
              Transforming Education <br />
              <span style={{ color: '#2563eb' }}>Across All 7 Provinces</span>
            </h1>
            <p style={{ fontSize: '15px', color: '#5f736f', lineHeight: '1.6', marginBottom: '32px' }}>
              A multi-tenant, cloud-enabled education management system designed for Nepal's CDC curriculum, interactive smart boards, simulations, and real-time school administration.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #dcebe6', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', color: '#2563eb' }}>
                  <ShieldAlert size={18} />
                  <span style={{ fontWeight: '700', fontSize: '14px', color: '#0e3e3b' }}>Central Super Admin</span>
                </div>
                <p style={{ fontSize: '12px', color: '#5f736f' }}>Nationwide oversight, EMIS school onboarding, CDC book & simulation catalogs.</p>
              </div>

              <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #dcebe6', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', color: '#0f5f55' }}>
                  <School size={18} />
                  <span style={{ fontWeight: '700', fontSize: '14px', color: '#0e3e3b' }}>Institution Admin</span>
                </div>
                <p style={{ fontSize: '12px', color: '#5f736f' }}>Class 1–12 academic year, section allocations, teacher assignments, and timetables.</p>
              </div>

              <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #dcebe6', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', color: '#6d5bd0' }}>
                  <Users size={18} />
                  <span style={{ fontWeight: '700', fontSize: '14px', color: '#0e3e3b' }}>Teacher Portal</span>
                </div>
                <p style={{ fontSize: '12px', color: '#5f736f' }}>Smart board interactive sessions, digital notes, attendance, and exam grading.</p>
              </div>

              <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #dcebe6', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', color: '#7c3aed' }}>
                  <GraduationCap size={18} />
                  <span style={{ fontWeight: '700', fontSize: '14px', color: '#0e3e3b' }}>Student Portal</span>
                </div>
                <p style={{ fontSize: '12px', color: '#5f736f' }}>Bilingual CDC digital textbooks, interactive HTML5 simulations, and notes.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Portal Auth Card */}
          <div style={{ background: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid #dcebe6', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0e3e3b', marginBottom: '6px' }}>Select Portal to Sign In</h3>
            <p style={{ fontSize: '13px', color: '#5f736f', marginBottom: '20px' }}>Click a role tab to load demo credentials or sign in with your account.</p>

            {/* Role Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '6px', background: '#ebf5f1', padding: '5px', borderRadius: '10px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => handleTabChange('SUPER_ADMIN')}
                style={{
                  padding: '7px 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: activeTab === 'SUPER_ADMIN' ? '#ffffff' : '#5f736f',
                  background: activeTab === 'SUPER_ADMIN' ? '#2563eb' : 'transparent',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('SCHOOL_ADMIN')}
                style={{
                  padding: '7px 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: activeTab === 'SCHOOL_ADMIN' ? '#ffffff' : '#5f736f',
                  background: activeTab === 'SCHOOL_ADMIN' ? '#0f5f55' : 'transparent',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                School Admin
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('COLLEGE_ADMIN')}
                style={{
                  padding: '7px 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: activeTab === 'COLLEGE_ADMIN' ? '#ffffff' : '#5f736f',
                  background: activeTab === 'COLLEGE_ADMIN' ? '#4f46e5' : 'transparent',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                College Admin
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('PRINCIPAL')}
                style={{
                  padding: '7px 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: activeTab === 'PRINCIPAL' ? '#ffffff' : '#5f736f',
                  background: activeTab === 'PRINCIPAL' ? '#7c3aed' : 'transparent',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                Principal
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('TEACHER')}
                style={{
                  padding: '7px 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: activeTab === 'TEACHER' ? '#ffffff' : '#5f736f',
                  background: activeTab === 'TEACHER' ? '#6d5bd0' : 'transparent',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                Normal Teacher
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('CLASS_TEACHER')}
                style={{
                  padding: '7px 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: activeTab === 'CLASS_TEACHER' ? '#ffffff' : '#5f736f',
                  background: activeTab === 'CLASS_TEACHER' ? '#117a6b' : 'transparent',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                Class Teacher
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('STUDENT')}
                style={{
                  padding: '7px 4px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: activeTab === 'STUDENT' ? '#ffffff' : '#5f736f',
                  background: activeTab === 'STUDENT' ? '#e11d48' : 'transparent',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                Student
              </button>
            </div>

            {/* Instant 1-Click Launch Button for Selected Role */}
            <div style={{ marginBottom: '18px' }}>
              <button
                type="button"
                disabled={instantLoading || loading}
                onClick={handleInstantDemo}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #effaf6 100%)',
                  border: '1.5px solid #93c5fd',
                  color: '#1d4ed8',
                  fontWeight: '800',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: instantLoading ? 'wait' : 'pointer',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.08)',
                }}
              >
                <Sparkles size={16} color="#2563eb" />
                <span>
                  {instantLoading ? 'Entering Dashboard...' : `⚡ 1-Click Launch into ${activeTab.replace('_', ' ')}`}
                </span>
                <ArrowRight size={14} />
              </button>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '10px 14px', color: '#dc2626', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4b605b', marginBottom: '6px' }}>
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cfdcd8',
                    background: '#ffffff',
                    color: '#0e3e3b',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4b605b', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cfdcd8',
                    background: '#ffffff',
                    color: '#0e3e3b',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              {activeTab !== 'SUPER_ADMIN' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#4b605b', marginBottom: '6px' }}>
                    School EMIS Code (Dhambojhi Higher Sec. School: 570010001)
                  </label>
                  <input
                    type="text"
                    value={emisCode}
                    onChange={(e) => setEmisCode(e.target.value)}
                    placeholder="e.g. 570010001"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cfdcd8',
                      background: '#ffffff',
                      color: '#0e3e3b',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '8px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                <LogIn size={16} />
                {loading ? 'Authenticating...' : `Sign in as ${activeTab.replace('_', ' ')}`}
              </button>
            </form>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #dcebe6', textAlign: 'center' }}>
              <button
                onClick={() => setDemoModalOpen(true)}
                style={{
                  fontSize: '13px',
                  color: '#2563eb',
                  fontWeight: '700',
                  background: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Sparkles size={14} /> Open 1-Click Role Switcher Demo
              </button>
            </div>
          </div>
        </div>
      </main>

      <DemoRoleModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />
    </div>
  );
};

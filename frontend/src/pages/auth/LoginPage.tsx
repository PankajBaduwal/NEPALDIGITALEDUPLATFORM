import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NepalEduLogo } from '../../components/common/NepalEduLogo';
import { api } from '../../services/api';
import {
  GraduationCap,
  School,
  Users,
  UserCheck,
  BookOpen,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Building,
  ShieldAlert,
  Sparkles,
  Presentation,
  MapPin,
  Search,
} from 'lucide-react';

interface PublicInstitution {
  _id: string;
  emisCode: string;
  name: string;
  nameNepali?: string;
  district: string;
  province: string;
  localLevel?: string;
  type?: string;
  status?: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, demoLogin } = useAuth();

  // Login Stepper State: 1 = Select School, 2 = Select Role & Login
  const [step, setStep] = useState<1 | 2>(1);

  // Institution Selection State
  const [institutions, setInstitutions] = useState<PublicInstitution[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<PublicInstitution | null>(null);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);

  // Role Selection State
  const [selectedRole, setSelectedRole] = useState<{
    key: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
    defaultUserTag?: string;
    route: string;
  } | null>(null);

  // Credential Inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load public institutions list
  useEffect(() => {
    const fetchInstitutions = async () => {
      setLoadingInstitutions(true);
      try {
        const res = await api.get<{ data: PublicInstitution[] } | PublicInstitution[]>('/auth/institutions');
        const list = Array.isArray(res) ? res : (res as any).data || [];
        setInstitutions(list);

        // Auto-select Dhambojhi if present, or first institution
        const defaultSchool = list.find((i: PublicInstitution) => i.emisCode === '570010001') || list[0];
        if (defaultSchool) {
          setSelectedInstitution(defaultSchool);
        }
      } catch (err) {
        console.warn('Failed to load institutions list, using fallback defaults:', err);
        const fallback: PublicInstitution = {
          _id: 'dhambojhi_001',
          emisCode: '570010001',
          name: 'Dhambojhi Higher Secondary School',
          nameNepali: 'धम्बोज्ही उच्च माध्यमिक विद्यालय',
          district: 'Banke',
          province: 'Lumbini Province',
          localLevel: 'Nepalgunj Sub-Metropolitan City',
          type: 'COMMUNITY',
          status: 'ACTIVE',
        };
        setInstitutions([fallback]);
        setSelectedInstitution(fallback);
      } finally {
        setLoadingInstitutions(false);
      }
    };

    fetchInstitutions();
  }, []);

  // Filtered institutions
  const filteredInstitutions = institutions.filter((inst) => {
    const q = searchQuery.toLowerCase();
    return (
      inst.name.toLowerCase().includes(q) ||
      inst.emisCode.includes(q) ||
      inst.district.toLowerCase().includes(q)
    );
  });

  // Role Definitions matching screenshot
  const roleCards: Array<{
    key: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
    defaultUserTag?: string;
    route: string;
  }> = [
    {
      key: 'PRINCIPAL',
      title: 'Principal Login',
      subtitle: 'Academic leadership & institutional oversight',
      icon: GraduationCap,
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      defaultUserTag: 'dhambojhi_principal',
      route: '/principal',
    },
    {
      key: 'SCHOOL_ADMIN',
      title: 'Admin Login',
      subtitle: 'Manage users, classes, timetable & operations',
      icon: School,
      color: '#0f4c4a',
      bg: '#e9f6f1',
      border: '#bfeede',
      defaultUserTag: 'dhambojhi_admin',
      route: '/school-admin',
    },
    {
      key: 'CLASS_TEACHER',
      title: 'Class Teacher (Section Supervisor)',
      subtitle: 'Section supervision, daily attendance, roster & report cards',
      icon: UserCheck,
      color: '#136560',
      bg: '#ECFDF5',
      border: '#bfeede',
      defaultUserTag: 'dhambojhi_t_18',
      route: '/teacher',
    },
    {
      key: 'TEACHER',
      title: 'Subject Teacher (Faculty)',
      subtitle: 'Subject workspaces, marks, quizzes & assignments',
      icon: Users,
      color: '#6d5bd0',
      bg: '#f5f3ff',
      border: '#ddd6fe',
      defaultUserTag: 'dhambojhi_t_01',
      route: '/teacher',
    },
    {
      key: 'STUDENT',
      title: 'Student Login',
      subtitle: 'Access classes, assignments, quizzes & results (Classes 1–12)',
      icon: BookOpen,
      color: '#E11D48',
      bg: '#FFF1F2',
      border: '#FECDD3',
      defaultUserTag: 'dhambojhi_s_g10',
      route: '/student',
    },
  ];

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter your username/identifier and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await login({
        username,
        password,
        emisCode: selectedInstitution?.emisCode,
      });

      if (user.role === 'SUPER_ADMIN') {
        navigate('/super-admin');
      } else if (user.role === 'PRINCIPAL') {
        navigate('/principal');
      } else if (user.role === 'HOD') {
        navigate('/hod');
      } else if (user.role === 'SCHOOL_ADMIN' || user.role === 'COLLEGE_ADMIN') {
        navigate('/school-admin');
      } else if (user.role === 'TEACHER') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Demo Login for selected role
  const handleDemoLogin = async (roleKey: string, route: string) => {
    setDemoLoading(true);
    setError(null);
    try {
      await demoLogin(roleKey);
      navigate(route);
    } catch (err: any) {
      setError(err.message || 'Demo authentication failed.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: '#f8fcfb',
        color: '#0e3e3b',
        fontFamily: '"Inter", "Plus Jakarta Sans", sans-serif',
      }}
    >
      {/* LEFT COLUMN: BRAND IDENTITY & INSTITUTION SHOWCASE */}
      <div
        style={{
          flex: '1.05',
          background: 'linear-gradient(155deg, #0f4c4a 0%, #0b3f3d 55%, #062b2a 100%)',
          color: '#FFFFFF',
          padding: '60px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Supplied Green Pagoda Temple & Landscape Artwork */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(/assets/brand/nepal_green_temple_landscape.png)`,
            backgroundPosition: 'center bottom',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            opacity: 0.16,
            mixBlendMode: 'soft-light',
            pointerEvents: 'none',
          }}
        />
        {/* Soft floating light orbs */}
        <div className="ui-orb" style={{ top: '-120px', right: '-100px', width: '360px', height: '360px', background: 'rgba(255,255,255,0.20)' }} />
        <div className="ui-orb ui-orb--slow" style={{ bottom: '-140px', left: '30%', width: '420px', height: '420px', background: 'rgba(125,230,200,0.22)' }} />

        {/* Top Header Logo */}
        <div>
          <NepalEduLogo size="lg" variant="white" onClick={() => navigate('/')} />
        </div>

        {/* Middle Brand Value Proposition */}
        <div style={{ maxWidth: '480px', margin: '40px 0', position: 'relative', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              marginBottom: '20px',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Sparkles size={14} color="#D1FAE5" />
            <span>NEPAL CDC CURRICULUM INTEGRATED</span>
          </div>

          <h1 style={{ fontFamily: '"Newsreader", Georgia, serif', fontSize: '44px', fontWeight: 600, lineHeight: 1.2, marginBottom: '20px', letterSpacing: '-0.5px' }}>
            Empowering Modern Classrooms Across All 7 Provinces
          </h1>

          <p style={{ fontSize: '15px', color: '#E2E8F0', lineHeight: 1.6, marginBottom: '32px' }}>
            Sign in to access your institution's smart boards, official CDC textbooks, interactive simulations, and real-time academic assessment records.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '12px 16px',
                borderRadius: '12px',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Presentation size={20} color="#93C5FD" />
              <div style={{ fontSize: '13px' }}>
                <strong>Interactive Smart Board:</strong> Multi-touch stylus, PDF annotations & lesson delivery.
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '12px 16px',
                borderRadius: '12px',
                backdropFilter: 'blur(4px)',
              }}
            >
              <BookOpen size={20} color="#bfeede" />
              <div style={{ fontSize: '13px' }}>
                <strong>Official CDC Textbooks:</strong> Class 1–12 bilingual curriculum & syllabus tracking.
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '12px 16px',
                borderRadius: '12px',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Sparkles size={20} color="#FDE047" />
              <div style={{ fontSize: '13px' }}>
                <strong>AI Assignment & Quiz Studio:</strong> Anti-hallucination curriculum-grounded assessments.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Security Note */}
        <div style={{ fontSize: '12px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} color="#34D399" />
          <span>MoEST EMIS Standard • Secure 256-Bit TLS Encrypted Platform</span>
        </div>
      </div>

      {/* RIGHT COLUMN: TWO-STAGE LOGIN WORKFLOW */}
      <div
        style={{
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>

          {/* STEPPER HEADER (Matches reference screenshot 1. Select School -> 2. Select Role & Login) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Step 1 Circle */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: step === 1 ? '#0f4c4a' : '#117a6b',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                  boxShadow: '0 2px 6px rgba(15, 81, 50, 0.3)',
                }}
              >
                {step > 1 ? <Check size={14} strokeWidth={3} /> : '1'}
              </div>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: step === 1 ? '#0f4c4a' : '#117a6b' }}>
                Select School
              </span>
            </div>

            {/* Connecting Line */}
            <div
              style={{
                width: '60px',
                height: '2px',
                background: step === 2 ? '#0f4c4a' : '#E2E8F0',
                margin: '0 12px',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Step 2 Circle */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: step === 2 ? '#0f4c4a' : '#E2E8F0',
                  color: step === 2 ? '#FFFFFF' : '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                2
              </div>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: step === 2 ? '#0f4c4a' : '#94A3B8' }}>
                Select Role & Login
              </span>
            </div>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '13px',
                marginBottom: '20px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* ----------------- STAGE 1: SELECT SCHOOL ----------------- */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0e3e3b', letterSpacing: '-0.5px', marginBottom: '6px' }}>
                  Login to Your Institution
                </h2>
                <p style={{ fontSize: '14px', color: '#64748B' }}>
                  Search or select your registered school or college to access your institutional workspace.
                </p>
              </div>

              {/* School Select Dropdown */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Select Your School / College *
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={selectedInstitution?._id || ''}
                    onChange={(e) => {
                      const found = institutions.find((inst) => inst._id === e.target.value);
                      if (found) setSelectedInstitution(found);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      background: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#0e3e3b',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {institutions.map((inst) => (
                      <option key={inst._id} value={inst._id}>
                        {inst.name} ({inst.district}) — EMIS: {inst.emisCode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Institution Preview Card (Matches reference screenshot) */}
              {selectedInstitution && (
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1.5px solid #bfeede',
                    boxShadow: '0 4px 14px rgba(15, 81, 50, 0.08)',
                    padding: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '26px',
                  }}
                >
                  {/* School Thumbnail Image / Crest */}
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      background: '#FFFFFF',
                      border: '1.5px solid #bfeede',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      overflow: 'hidden',
                      padding: '4px',
                    }}
                  >
                    <img
                      src={(selectedInstitution as any).logoUrl || "/assets/brand/nepali_school_illustration_reference.png"}
                      alt={selectedInstitution.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0e3e3b', margin: 0 }}>
                        {selectedInstitution.name}
                      </h3>
                    </div>
                    {selectedInstitution.nameNepali && (
                      <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>
                        {selectedInstitution.nameNepali}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748B' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="#0f4c4a" />
                        {selectedInstitution.district}, Nepal
                      </span>
                      <span>•</span>
                      <span style={{ fontWeight: 700, color: '#0f4c4a' }}>
                        EMIS: {selectedInstitution.emisCode}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <button
                type="button"
                disabled={!selectedInstitution}
                onClick={() => setStep(2)}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '10px',
                  background: '#0f4c4a',
                  color: '#FFFFFF',
                  fontSize: '15px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: selectedInstitution ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(15, 81, 50, 0.25)',
                  transition: 'background 0.2s ease',
                  marginBottom: '20px',
                }}
                onMouseEnter={(e) => selectedInstitution && (e.currentTarget.style.background = '#065f46')}
                onMouseLeave={(e) => selectedInstitution && (e.currentTarget.style.background = '#0f4c4a')}
              >
                <span>Continue</span>
                <ArrowRight size={18} />
              </button>

              {/* Discrete Super Admin Link & Register School Link */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <Link
                  to="/super-admin-login"
                  style={{
                    color: '#0f4c4a',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ShieldAlert size={14} color="#0f4c4a" />
                  <span>Or login as Super Admin</span>
                </Link>

                <div style={{ color: '#64748B', marginTop: '6px' }}>
                  Don't see your school?{' '}
                  <Link to="/register" style={{ color: '#0f4c4a', fontWeight: 800, textDecoration: 'underline' }}>
                    Register Your School / College
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ----------------- STAGE 2: SELECT ROLE & LOGIN ----------------- */}
          {step === 2 && (
            <div>
              {/* Institution Header Badge with Back Button */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#e9f6f1',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '20px',
                  border: '1px solid #bfeede',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <School size={16} color="#0f4c4a" />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f4c4a' }}>
                    {selectedInstitution?.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setSelectedRole(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0f4c4a',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <ArrowLeft size={12} /> Change
                </button>
              </div>

              {/* If no role clicked yet: show the 5 role cards matching screenshot */}
              {!selectedRole ? (
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0e3e3b', letterSpacing: '-0.4px', marginBottom: '4px' }}>
                      Choose Your Role
                    </h2>
                    <p style={{ fontSize: '13.5px', color: '#64748B' }}>
                      Select your institutional capacity to sign in.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {roleCards.map((rc) => {
                      const IconComp = rc.icon;
                      return (
                        <div
                          key={rc.key}
                          onClick={() => {
                            setSelectedRole(rc);
                            setUsername(rc.defaultUserTag || '');
                            setPassword('DemoPass123!');
                            setError(null);
                          }}
                          style={{
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            border: '1.5px solid #E2E8F0',
                            padding: '14px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = rc.color;
                            e.currentTarget.style.transform = 'translateX(4px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#E2E8F0';
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '10px',
                                background: rc.bg,
                                border: `1px solid ${rc.border}`,
                                color: rc.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <IconComp size={20} />
                            </div>
                            <div>
                              <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0e3e3b' }}>
                                {rc.title}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>
                                {rc.subtitle}
                              </div>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '12.5px', fontWeight: 700, color: rc.color }}>Sign In</span>
                            <ChevronRight size={16} color={rc.color} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Role Credentials Form */
                <div>
                  {/* Selected Role Heading & Back Button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: selectedRole.bg,
                          color: selectedRole.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {React.createElement(selectedRole.icon, { size: 18 })}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0e3e3b', margin: 0 }}>
                          {selectedRole.title}
                        </h3>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>{selectedRole.subtitle}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedRole(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      ← Change Role
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Identifier */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                        Username / Staff ID / Email *
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
                          placeholder="Enter your username or staff ID"
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
                      {selectedRole?.key === 'STUDENT' ? (
                        <div style={{ marginTop: '10px', padding: '10px 12px', background: '#FFF1F2', borderRadius: '8px', border: '1px solid #FECDD3' }}>
                          <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#E11D48', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Select Class Demo Student (Classes 1–12):</span>
                            <span style={{ fontSize: '10.5px', color: '#9F1239', fontWeight: 600 }}>Click to auto-fill</span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {[
                              { label: 'Class 1', u: 'dhambojhi_s_g01' },
                              { label: 'Class 2', u: 'dhambojhi_s_g02' },
                              { label: 'Class 3', u: 'dhambojhi_s_g03' },
                              { label: 'Class 4', u: 'dhambojhi_s_g04' },
                              { label: 'Class 5', u: 'dhambojhi_s_g05' },
                              { label: 'Class 6', u: 'dhambojhi_s_g06' },
                              { label: 'Class 7', u: 'dhambojhi_s_g07' },
                              { label: 'Class 8', u: 'dhambojhi_s_g08' },
                              { label: 'Class 9', u: 'dhambojhi_s_g09' },
                              { label: 'Class 10', u: 'dhambojhi_s_g10' },
                              { label: '11 Sci', u: 'dhambojhi_s_g11s' },
                              { label: '11 Mgt', u: 'dhambojhi_s_g11m' },
                              { label: '12 Sci', u: 'dhambojhi_s_g12s' },
                              { label: '12 Mgt', u: 'dhambojhi_s_g12m' },
                            ].map((pill) => (
                              <button
                                key={pill.u}
                                type="button"
                                onClick={() => {
                                  setUsername(pill.u);
                                  setPassword('DemoPass123!');
                                }}
                                style={{
                                  padding: '3px 7px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: username === pill.u ? 800 : 600,
                                  background: username === pill.u ? '#E11D48' : '#FFFFFF',
                                  color: username === pill.u ? '#FFFFFF' : '#9F1239',
                                  border: `1px solid ${username === pill.u ? '#E11D48' : '#FECDD3'}`,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {pill.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : selectedRole?.defaultUserTag && (
                        <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>
                            Institutional ID:{' '}
                            <button
                              type="button"
                              onClick={() => {
                                setUsername(selectedRole.defaultUserTag || '');
                                setPassword('DemoPass123!');
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                color: selectedRole.color,
                                fontWeight: 700,
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                fontSize: '11.5px',
                              }}
                              title="Click to fill sample credential"
                            >
                              {selectedRole.defaultUserTag}
                            </button>
                          </span>
                          <span style={{ color: '#94A3B8', fontSize: '11px' }}>Click ID to fill</span>
                        </div>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Password *</label>
                        <Link to="/forgot-password" style={{ fontSize: '12px', color: '#0f4c4a', fontWeight: 600 }}>
                          Forgot Password?
                        </Link>
                      </div>
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

                    {/* Remember me checkbox */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{ accentColor: '#0f4c4a', cursor: 'pointer' }}
                      />
                      <label htmlFor="rememberMe" style={{ fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                        Remember my institution credentials
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: '#0f4c4a',
                        color: '#FFFFFF',
                        fontSize: '14.5px',
                        fontWeight: 800,
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(15, 81, 50, 0.25)',
                      }}
                    >
                      {loading ? 'Authenticating...' : (
                        <>
                          <span>Sign In as {selectedRole.title.replace(' Login', '')}</span>
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
                      margin: '20px 0',
                      color: '#94A3B8',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                    <span>OR 1-CLICK DEMO ACCESS</span>
                    <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
                  </div>

                  {/* 1-Click Demo Login Button for this specific role */}
                  <button
                    type="button"
                    disabled={demoLoading}
                    onClick={() => handleDemoLogin(selectedRole.key, selectedRole.route)}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '8px',
                      background: selectedRole.bg,
                      color: selectedRole.color,
                      border: `1.5px solid ${selectedRole.border}`,
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: demoLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <Sparkles size={16} />
                    <span>
                      {demoLoading ? 'Launching Demo...' : `Instant 1-Click Demo Entry (${selectedRole.title.replace(' Login', '')})`}
                    </span>
                  </button>

                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;

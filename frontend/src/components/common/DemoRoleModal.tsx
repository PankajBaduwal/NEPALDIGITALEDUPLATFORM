import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  School,
  GraduationCap,
  Users,
  UserCheck,
  BookOpen,
  ArrowRight,
  X,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface DemoRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Demo accounts the homepage role cards sign in with. Keep in step with the roles listed in DemoRoleModal below. */
export const DEMO_TARGETS = {
  SUPER_ADMIN: { login: 'superadmin', route: '/super-admin' },
  SCHOOL_ADMIN: { login: 'dhambojhi_admin', route: '/school-admin' },
  PRINCIPAL: { login: 'dhambojhi_principal', route: '/principal' },
  TEACHER: { login: 'dhambojhi_t_29', route: '/teacher' },
  CLASS_TEACHER: { login: 'dhambojhi_t_15', route: '/teacher' },
  STUDENT: { login: 'dhambojhi_s_002', route: '/student' },
} as const;

export const DemoRoleModal: React.FC<DemoRoleModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const roles = [
    {
      key: 'SUPER_ADMIN',
      title: 'Central Super Admin',
      nepaliTitle: 'केन्द्रीय प्रणाली प्रशासक',
      description: 'Ministry of Education & CDC level oversight. Manage 77 districts, approve textbooks, register schools, and configure packages.',
      icon: ShieldAlert,
      badge: 'Federal Central Authority',
      accentColor: '#2563eb',
      bgLight: '#eff6ff',
      targetRoute: '/super-admin',
      credentials: 'superadmin (Full Access)',
    },
    {
      key: 'SCHOOL_ADMIN',
      title: 'School Admin (K–12)',
      nepaliTitle: 'विद्यालय प्रशासक',
      description: 'Dhambojhi Higher Secondary School (Nepalgunj, Banke). Manage academic year 2083, 28 sections, student rosters, master timetable, and feature access.',
      icon: School,
      badge: 'Institution Admin (Dhambojhi HSS)',
      accentColor: '#0f766e',
      bgLight: '#f0fdfa',
      targetRoute: '/school-admin',
      credentials: 'dhambojhi_admin',
    },
    {
      key: 'COLLEGE_ADMIN',
      title: 'College / Higher Ed Admin',
      nepaliTitle: 'कलेज प्रशासक',
      description: 'Bheri Model Science College (TU affiliated). Manage semester faculties, departmental curricula, bachelor/master degree programs, and college provisioning.',
      icon: School,
      badge: 'Higher Ed Admin (Bheri Science College)',
      accentColor: '#4f46e5',
      bgLight: '#eef2ff',
      targetRoute: '/school-admin',
      credentials: 'admin_570020002',
    },
    {
      key: 'PRINCIPAL',
      title: 'Principal / Academic Head',
      nepaliTitle: 'प्रधानाध्यापक',
      description: 'Dr. Shailesh Kumar Verma. Institutional academic leadership. Monitor syllabus coverage, attendance trends, terminal exam performance, and teacher workloads.',
      icon: GraduationCap,
      badge: 'Academic Leadership',
      accentColor: '#7c3aed',
      bgLight: '#f5f3ff',
      targetRoute: '/principal',
      credentials: 'dhambojhi_principal',
    },
    {
      key: 'TEACHER',
      title: 'Normal Teacher (Subject Faculty)',
      nepaliTitle: 'विषय शिक्षक (नेपाली / सामाजिक)',
      description: 'Sarita Gautam. Subject Faculty across Classes 1–12. Access interactive Smart Board, subject workspaces, assignments & quizzes (No Class Teacher section).',
      icon: Users,
      badge: 'Subject Faculty',
      accentColor: '#6d5bd0',
      bgLight: '#f5f3ff',
      targetRoute: '/teacher',
      credentials: 'dhambojhi_t_29',
    },
    {
      key: 'CLASS_TEACHER',
      title: 'Class Teacher (Section Supervisor)',
      nepaliTitle: 'कक्षा शिक्षक (कक्षा १० ‘क’)',
      description: 'Bishnu Prasad Thapa. Class Teacher of Class 10 Section A. Exclusive section roster supervision, daily attendance roll call, terminal exam marks entry, and report cards.',
      icon: UserCheck,
      badge: 'Class Teacher (Sec A)',
      accentColor: '#059669',
      bgLight: '#ecfdf5',
      targetRoute: '/teacher',
      credentials: 'dhambojhi_t_15',
    },
    {
      key: 'STUDENT',
      title: 'Class 10 Student',
      nepaliTitle: 'विद्यार्थी (कक्षा १०)',
      description: 'Aarav Chaudhary (Roll 1). Access CDC Class 10 interactive textbooks, PhET physics simulations, and curriculum-grounded AI learning assistant.',
      icon: BookOpen,
      badge: 'Secondary Learner',
      accentColor: '#e11d48',
      bgLight: '#fff1f2',
      targetRoute: '/student',
      credentials: 'dhambojhi_s_002',
    },
  ];

  const handleSelectRole = async (role: typeof roles[0]) => {
    setLoadingRole(role.key);
    setError(null);
    try {
      const loginPayload = role.credentials ? role.credentials.split(' ')[0] : role.key;
      await demoLogin(loginPayload);
      onClose();
      navigate(role.targetRoute);
    } catch (err: any) {
      setError(err.message || 'Demo session could not be established. Please retry.');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '1020px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '24px 32px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                <Sparkles size={13} /> 1-Click Interactive Demo
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>• Classes 1–12 MERN Ecosystem</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Select a Role to Explore the Platform
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Experience the full ecosystem from any perspective without setting up credentials.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '10px',
              color: '#64748b',
              background: '#f1f5f9',
              transition: 'all 0.2s',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px 32px', background: '#fef2f2', borderBottom: '1px solid #fee2e2', color: '#dc2626', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* Roles Grid */}
        <div
          style={{
            padding: '24px 32px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: '16px',
            background: '#f8fafc',
          }}
        >
          {roles.map((role) => {
            const Icon = role.icon;
            const isLoading = loadingRole === role.key;

            return (
              <div
                key={role.key}
                onClick={() => !loadingRole && handleSelectRole(role)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: loadingRole ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = role.accentColor;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = `0 12px 24px -10px ${role.accentColor}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        backgroundColor: role.bgLight,
                        color: role.accentColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 9px',
                        borderRadius: '12px',
                        backgroundColor: role.bgLight,
                        color: role.accentColor,
                      }}
                    >
                      {role.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '2px' }}>
                    {role.title}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '10px' }}>
                    {role.nepaliTitle}
                  </div>
                  <p style={{ fontSize: '12px', color: '#475569', lineHeight: '1.5', marginBottom: '16px' }}>
                    {role.description}
                  </p>
                </div>

                <div
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                    {role.credentials}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: role.accentColor,
                    }}
                  >
                    {isLoading ? 'Connecting...' : 'Launch Role'}
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '16px 32px',
            borderTop: '1px solid #e2e8f0',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span>Simulated live environment. Actions are non-destructive and reset automatically.</span>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: '#f1f5f9',
              color: '#475569',
              fontWeight: '600',
              fontSize: '12px',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DemoRoleModal } from './DemoRoleModal';
import { Sparkles, ArrowRightLeft, LogOut } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  if (!user?.isDemo) return null;

  const handleExitDemo = () => {
    logout();
    navigate('/');
  };

  const getRoleLabel = () => {
    if (user.role === 'SUPER_ADMIN') return 'Central Super Admin';
    if (user.role === 'SCHOOL_ADMIN') return 'School Administrator';
    if (user.role === 'PRINCIPAL') return 'Principal / Academic Head';
    if (user.role === 'TEACHER') {
      return user.isClassTeacher ? 'Class Teacher (Class 10 Section A)' : 'Normal Teacher (Subject Faculty)';
    }
    if (user.role === 'STUDENT') return 'Student (Class 10)';
    return user.role;
  };

  return (
    <>
      <div
        className="demo-banner"
        style={{
          background: 'linear-gradient(90deg, #f0faf6 0%, #d9f3e8 50%, #f0faf6 100%)',
          borderBottom: '1px solid #bfeede',
          padding: '8px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          color: '#0f4c4a',
          position: 'sticky',
          top: 0,
          zIndex: 999,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              background: '#117a6b',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '11px',
              color: '#ffffff',
              border: '1px solid #0f4c4a',
            }}
          >
            <Sparkles size={12} /> DEMO MODE
          </span>
          <span>
            You are viewing the live ecosystem as <strong>{getRoleLabel()}</strong> ({user.fullName}).
          </span>
          <span style={{ color: '#117a6b', fontSize: '12px' }}>
            • Simulated institutional data is safe to explore.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '6px',
              background: '#ffffff',
              border: '1px solid #ddd6fe',
              color: '#0f4c4a',
              fontWeight: '600',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#d9f3e8')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
          >
            <ArrowRightLeft size={13} /> Switch Demo Role
          </button>

          <button
            onClick={handleExitDemo}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'transparent',
              color: '#0f4c4a',
              fontWeight: '600',
              fontSize: '12px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            <LogOut size={13} /> Exit Demo
          </button>
        </div>
      </div>

      <DemoRoleModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};


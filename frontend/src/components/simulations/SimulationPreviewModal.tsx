/**
 * SimulationPreviewModal.tsx
 * Rich detailed preview modal for registered curriculum simulations
 */
import React from 'react';
import { X, Play, Monitor, BookOpen, Clock, BarChart, Sparkles, CheckCircle, Globe } from 'lucide-react';

interface SimulationPreviewModalProps {
  simulation: any;
  onClose: () => void;
  onLaunch: (sim: any) => void;
  onLaunchSmartBoard?: (sim: any) => void;
  userRole?: string;
}

export const SimulationPreviewModal: React.FC<SimulationPreviewModalProps> = ({
  simulation,
  onClose,
  onLaunch,
  onLaunchSmartBoard,
  userRole = 'TEACHER',
}) => {
  if (!simulation) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '20px',
          maxWidth: '720px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Banner Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0e3e3b 0%, #117a6b 100%)',
            color: '#ffffff',
            padding: '24px 28px',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '800',
                textTransform: 'uppercase',
              }}
            >
              {simulation.simulationType?.replace('_', ' ') || '3D WEBGL'}
            </span>
            <span
              style={{
                background: '#ede9fe',
                color: '#4c3fa8',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: '800',
              }}
            >
              Class {simulation.gradeLevels?.join(', ') || '1'}
            </span>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0' }}>
            {simulation.title}
          </h2>
          {simulation.titleNepali && (
            <p style={{ margin: 0, fontSize: '14px', color: '#bbf7d0', fontWeight: '600' }}>
              {simulation.titleNepali}
            </p>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Metadata badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
              <BookOpen size={14} color="#0284c7" />
              <span>Chapter {simulation.chapterNumber || 1}: {simulation.chapterTitle || 'Shapes & Position'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
              <Clock size={14} color="#059669" />
              <span>{simulation.estimatedMinutes || 20} Minutes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
              <BarChart size={14} color="#6d5bd0" />
              <span>Difficulty: {simulation.difficulty || 'Beginner'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
              <Globe size={14} color="#6366f1" />
              <span>Language: {simulation.language === 'both' ? 'Bilingual (नेपाली / EN)' : simulation.language}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
              Description
            </h4>
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: 0 }}>
              {simulation.description}
            </p>
            {simulation.descriptionNepali && (
              <p style={{ fontSize: '13px', color: '#059669', lineHeight: 1.6, margin: '6px 0 0 0' }}>
                {simulation.descriptionNepali}
              </p>
            )}
          </div>

          {/* Learning Objectives */}
          {simulation.learningObjectives?.length > 0 && (
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
                Curriculum Learning Objectives
              </h4>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: 1.6 }}>
                {simulation.learningObjectives.map((obj: string, i: number) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <button
              onClick={() => onLaunch(simulation)}
              style={{
                flex: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: '#117a6b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(17, 122, 107, 0.25)',
              }}
            >
              <Play size={16} fill="#ffffff" />
              <span>Launch 3D Simulation</span>
            </button>

            {onLaunchSmartBoard && (
              <button
                onClick={() => onLaunchSmartBoard(simulation)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                }}
              >
                <Monitor size={16} />
                <span>Launch to Smart Board</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


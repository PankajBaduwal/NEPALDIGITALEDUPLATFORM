/**
 * SimulationLibrary.tsx
 * Centralized Simulation Library for Nepal Digital Education Platform
 * Mandatory Hierarchy:
 * All Classes -> Select Class -> Subjects -> Select Subject -> Chapters -> Simulations -> Launch Simulation
 */
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { SimulationPlayer } from './SimulationPlayer';
import { SimulationPreviewModal } from './SimulationPreviewModal';
import { OverallSimulations } from './OverallSimulations';
import { launchOnSmartBoard, isKprietSimulation } from './smartBoardLaunch';
import {
  Compass,
  Search,
  Filter,
  Play,
  Monitor,
  BookOpen,
  Eye,
  ChevronRight,
  Layers,
  Sparkles,
  ArrowLeft,
  Clock,
  BarChart,
  Globe,
  Award,
  GraduationCap,
  Calculator,
  Atom,
  Binary,
  Languages,
  CheckCircle2,
} from 'lucide-react';

interface SimulationLibraryProps {
  userRole?: string;
  defaultGrade?: number;
  classroomContext?: {
    classId: string;
    sectionId: string;
    subjectId: string;
  };
}

export const SimulationLibrary: React.FC<SimulationLibraryProps> = ({
  userRole = 'TEACHER',
  defaultGrade,
  classroomContext,
}) => {
  // Navigation Hierarchy State
  const [selectedClass, setSelectedClass] = useState<number | null>(defaultGrade || null);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<any | null>(null);

  // Overall Physics / Chemistry / Mathematics simulations (outside the class hierarchy)
  const [overallOpen, setOverallOpen] = useState<boolean>(false);
  // Active Running Simulation (Launch View)
  const [activeSimulation, setActiveSimulation] = useState<any | null>(null);
  // Preview Modal
  const [previewSimulation, setPreviewSimulation] = useState<any | null>(null);

  // Library Data State (Database-driven)
  const [hierarchyData, setHierarchyData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterLang, setFilterLang] = useState<string>('ALL');

  useEffect(() => {
    loadHierarchy();
  }, []);

  const loadHierarchy = async () => {
    setLoading(true);
    try {
      const res = await api.get('/simulation-activity/hierarchy');
      setHierarchyData(res);
      setError('');
    } catch (err: any) {
      console.error('Failed to load simulation library hierarchy:', err);
      setError(err?.message || 'Unable to load simulation hierarchy');
    } finally {
      setLoading(false);
    }
  };

  // ── SMART BOARD LAUNCH HANDLER ───────────────────────────────
  const handleLaunchSmartBoard = async (sim: any) => {
    if (userRole !== 'TEACHER' || !classroomContext?.classId || !classroomContext.sectionId || !classroomContext.subjectId) {
      alert('Select an assigned class and subject workspace before launching the Smart Board.');
      return;
    }

    const boardWindow = window.open('about:blank', '_blank');
    if (!boardWindow) {
      alert('The Smart Board could not open. Please allow pop-ups and try again.');
      return;
    }

    try {
      const resourceUrl = sim?.runtimeUrl || '';
      const result = await api.post<{ launcherUrl?: string }>('/smartboard/sessions', {
        ...classroomContext,
        lessonTitle: sim?.title || 'Interactive Classroom Session',
        initialResourceType: 'SIMULATION',
        initialResourceName: sim?.title || 'Simulation',
        initialResourceUrl: resourceUrl,
      });

      if (!result.launcherUrl) throw new Error('The Smart Board session was created without a launch URL.');
      const launchUrl = new URL(result.launcherUrl, window.location.origin);
      launchUrl.searchParams.set('mode', 'split');
      launchUrl.searchParams.set('sim', resourceUrl);
      launchUrl.searchParams.set('title', sim.title);
      boardWindow.location.href = launchUrl.toString();
    } catch (error) {
      boardWindow.close();
      console.error('Unable to launch Smart Board session:', error);
      alert(error instanceof Error ? error.message : 'Unable to launch Smart Board. Please try again.');
    }
  };

  // ── ACTIVE CLASS OBJECT ──────────────────────────────────────
  const currentClassObject = useMemo(() => {
    if (!hierarchyData || !selectedClass) return null;
    return hierarchyData.classes?.find((c: any) => c.grade === selectedClass) || null;
  }, [hierarchyData, selectedClass]);

  // ── ACTIVE SUBJECT OBJECT ────────────────────────────────────
  const currentSubjectObject = useMemo(() => {
    if (!currentClassObject || !selectedSubject) return null;
    return (
      currentClassObject.subjects?.find(
        (s: any) => s.code.toUpperCase() === (selectedSubject.code || selectedSubject).toUpperCase()
      ) || null
    );
  }, [currentClassObject, selectedSubject]);

  // ── BREADCRUMB NAVIGATION HANDLERS ───────────────────────────
  const goToAllClasses = () => {
    setSelectedClass(null);
    setSelectedSubject(null);
    setSelectedChapter(null);
  };

  const goToClass = (grade: number) => {
    setSelectedClass(grade);
    setSelectedSubject(null);
    setSelectedChapter(null);
  };

  const goToSubject = (sub: any) => {
    setSelectedSubject(sub);
    setSelectedChapter(null);
  };

  if (overallOpen) {
    return <OverallSimulations onBack={() => setOverallOpen(false)} />;
  }

  // ── IF SIMULATION IS ACTIVELY RUNNING, SHOW PLAYER ───────────
  if (activeSimulation) {
    return (
      <SimulationPlayer
        simulation={activeSimulation}
        onClose={() => setActiveSimulation(null)}
        userRole={userRole}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* ── CENTRALIZED BANNER ───────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0e3e3b 0%, #117a6b 50%, #0369a1 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(234,88,12, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Compass size={32} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>
                Interactive Simulation & Virtual Lab Library
              </h2>
              <span
                style={{
                  background: '#ede9fe',
                  color: '#4c3fa8',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '3px 10px',
                  borderRadius: '16px',
                  textTransform: 'uppercase',
                }}
              >
                Classes 1–12
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#FFEDD5' }}>
              Curriculum-aligned interactive simulations and virtual laboratories across Primary, Basic, Secondary & Higher Secondary levels.
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '800' }}>{hierarchyData?.totalSimulations || 0}</div>
            <div style={{ fontSize: '10px', color: '#ccfbf1', textTransform: 'uppercase', fontWeight: '700' }}>Active Simulations</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '800' }}>12</div>
            <div style={{ fontSize: '10px', color: '#ccfbf1', textTransform: 'uppercase', fontWeight: '700' }}>Grades (१–१२)</div>
          </div>
        </div>
      </div>

      {/* Overall Physics / Chemistry / Mathematics simulations */}
      <button
        type="button"
        onClick={() => setOverallOpen(true)}
        style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', background: 'linear-gradient(135deg,#f5f3ff,#e6f7f0)', border: '1.5px solid #bfeede', borderRadius: 16, padding: '18px 22px', cursor: 'pointer' }}
      >
        <span style={{ width: 52, height: 52, borderRadius: 14, background: '#0f4c4a', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 26 }}>⚛️</span>
        <span style={{ flex: '1 1 260px' }}>
          <span style={{ display: 'block', fontSize: 17, fontWeight: 800, color: '#0e3e3b' }}>Overall Simulations — Physics · Chemistry · Mathematics</span>
          <span style={{ display: 'block', fontSize: 13, color: '#4b605b', marginTop: 3 }}>Every interactive simulation and virtual lab for the three subjects, from school classes to college level, in one place.</span>
        </span>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#0f4c4a', background: '#fff', border: '1px solid #bfeede', borderRadius: 10, padding: '8px 14px' }}>Open →</span>
      </button>


      {/* ── BREADCRUMB TRAIL ─────────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px',
          border: '1px solid #dcebe6',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          fontWeight: '700',
          color: '#475569',
          flexWrap: 'wrap',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}
      >
        <button
          onClick={goToAllClasses}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: selectedClass ? '#117a6b' : '#0f172a',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Layers size={15} /> All Classes (सबै कक्षाहरू)
        </button>

        {selectedClass && (
          <>
            <ChevronRight size={14} color="#94a3b8" />
            <button
              onClick={() => goToClass(selectedClass)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: selectedSubject ? '#117a6b' : '#0f172a',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              {currentClassObject?.className || `Class ${selectedClass}`}{selectedClass && selectedClass > 10 ? ` (${currentClassObject?.classNameNepali || ''})` : ''}
            </button>
          </>
        )}

        {selectedSubject && (
          <>
            <ChevronRight size={14} color="#94a3b8" />
            <button
              onClick={() => goToSubject(selectedSubject)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: selectedChapter ? '#117a6b' : '#0f172a',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              {currentSubjectObject?.name || selectedSubject.name || selectedSubject.code}
            </button>
          </>
        )}

        {selectedChapter && (
          <>
            <ChevronRight size={14} color="#94a3b8" />
            <span style={{ color: '#0f172a', fontWeight: '800' }}>
              Chapter {selectedChapter.chapterNumber}: {selectedChapter.title}
            </span>
          </>
        )}
      </div>

      {/* ── SEARCH & FILTER CONTROLS ─────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '14px 20px',
          border: '1px solid #dcebe6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Class Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Class:</span>
            <select
              value={selectedClass || ''}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value, 10) : null;
                if (val) goToClass(val);
                else goToAllClasses();
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: '700',
                background: '#ffffff',
              }}
            >
              <option value="">All Classes (१–१२)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g}>Class {g}</option>
              ))}
            </select>
          </div>

          {/* Simulation Type Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: '700',
                background: '#ffffff',
              }}
            >
              <option value="ALL">All Types</option>
              <option value="3D_WEBGL">3D WebGL / Three.js</option>
              <option value="2D_CANVAS">Interactive 2D Canvas</option>
              <option value="HTML5_SIM">Virtual Laboratory</option>
            </select>
          </div>

          {/* Language Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Language:</span>
            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: '700',
                background: '#ffffff',
              }}
            >
              <option value="ALL">Bilingual / All</option>
              <option value="ne">नेपाली माध्यम</option>
              <option value="en">English Medium</option>
            </select>
          </div>
        </div>

        {/* Global Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
          <input
            type="text"
            placeholder="Search simulations by topic, title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px 8px 34px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
            }}
          />
        </div>
      </div>

      {/* ── LOADING & ERROR FEEDBACK ─────────────────────────────── */}
      {loading && !hierarchyData && (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
          <div
            style={{
              display: 'inline-block',
              width: '36px',
              height: '36px',
              border: '3px solid #cbd5e1',
              borderTopColor: '#117a6b',
              borderRadius: '50%',
            }}
          />
          <p style={{ marginTop: '12px', fontSize: '14px', fontWeight: '600' }}>
            Loading curriculum simulations library...
          </p>
        </div>
      )}

      {error && !hierarchyData && (
        <div
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <span style={{ color: '#991b1b', fontSize: '13px', fontWeight: '600' }}>{error}</span>
          <button
            onClick={loadHierarchy}
            style={{
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* VIEW 1: CENTRALIZED SIMULATION LIBRARY HOMEPAGE (ALL CLASSES) */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {!selectedClass && hierarchyData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Loop through each academic level */}
          {hierarchyData?.levels?.map((lvl: any) => {
            const levelClasses = hierarchyData.classes?.filter((c: any) =>
              lvl.grades.includes(c.grade)
            );

            return (
              <div key={lvl.id} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '4px', height: '18px', background: '#117a6b', borderRadius: '2px' }} />
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0e3e3b', margin: 0 }}>
                      {lvl.name} ({lvl.nameNepali})
                    </h3>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                      • {lvl.range}
                    </span>
                  </div>
                </div>

                {/* Class Cards Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {levelClasses?.map((cls: any) => (
                    <div
                      key={cls.grade}
                      onClick={() => goToClass(cls.grade)}
                      style={{
                        background: '#ffffff',
                        borderRadius: '14px',
                        border: '1px solid #dcebe6',
                        padding: '18px 20px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(234,88,12,0.12)';
                        e.currentTarget.style.borderColor = '#EA580C';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                        e.currentTarget.style.borderColor = '#dcebe6';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span
                            style={{
                              background: '#ecfdf5',
                              color: '#065f46',
                              fontSize: '11px',
                              fontWeight: '800',
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {cls.levelName}
                          </span>
                          <span
                            style={{
                              background: cls.simulationCount > 0 ? '#dbeafe' : '#f1f5f9',
                              color: cls.simulationCount > 0 ? '#1e40af' : '#64748b',
                              fontSize: '11px',
                              fontWeight: '800',
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {cls.simulationCount} Simulations
                          </span>
                        </div>

                        <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0' }}>
                          {cls.className}
                        </h4>
                        <div style={{ fontSize: '13px', color: '#117a6b', fontWeight: '700', marginBottom: '12px' }}>
                          {cls.grade > 10 ? cls.classNameNepali : ''}
                        </div>

                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px' }}>
                          Available Subjects: <strong>{cls.subjectCount}</strong>
                        </div>
                      </div>

                      <button
                        style={{
                          width: '100%',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          background: '#117a6b',
                          color: '#ffffff',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <span>Explore Class {cls.grade}</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* VIEW 2: CLASS SELECTION PAGE (SUBJECTS FOR SELECTED CLASS)    */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {selectedClass && !selectedSubject && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 4px 0' }}>
                {currentClassObject?.className}{selectedClass && selectedClass > 10 ? ` (${currentClassObject?.classNameNepali})` : ''} — Available Subjects
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Select a curriculum subject to explore chapter-wise interactive simulations.
              </p>
            </div>

            <button
              onClick={goToAllClasses}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={14} /> Back to All Classes
            </button>
          </div>

          {/* Subjects Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '18px',
            }}
          >
            {currentClassObject?.subjects?.map((sub: any) => (
              <div
                key={sub.code}
                onClick={() => goToSubject(sub)}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #dcebe6',
                  padding: '22px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(234,88,12,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: sub.code === 'MATH' ? '#ecfdf5' : '#e0f2fe',
                        color: sub.code === 'MATH' ? '#047857' : '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {sub.code === 'MATH' ? <Calculator size={22} /> : sub.code === 'SCI' ? <Atom size={22} /> : <BookOpen size={22} />}
                    </div>

                    <span
                      style={{
                        background: sub.simulationCount > 0 ? '#dcfce7' : '#f1f5f9',
                        color: sub.simulationCount > 0 ? '#166534' : '#64748b',
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {sub.simulationCount} Simulations
                    </span>
                  </div>

                  <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 2px 0' }}>
                    {sub.name}
                  </h4>
                  <div style={{ fontSize: '14px', color: '#117a6b', fontWeight: '700', marginBottom: '10px' }}>
                    {selectedClass && selectedClass > 10 ? sub.nameNepali : ''}
                  </div>

                  <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                    Nepal Curriculum Development Centre (CDC) authorized syllabus for Class {selectedClass}.
                  </p>
                </div>

                <button
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: '#117a6b',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                  }}
                >
                  <span>Explore Chapters ({sub.chapters?.length || 0})</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* VIEW 3 & 4: CHAPTER & SIMULATION LISTING                     */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {selectedClass && selectedSubject && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0e3e3b', margin: '0 0 4px 0' }}>
                Class {selectedClass} • {currentSubjectObject?.name || selectedSubject.name}{selectedClass && selectedClass > 10 ? ` (${currentSubjectObject?.nameNepali || ''})` : ''}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Browse chapter-wise simulations or launch directly into the interactive learning player.
              </p>
            </div>

            <button
              onClick={() => goToClass(selectedClass)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={14} /> Back to Subjects
            </button>
          </div>

          {/* Chapters List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {currentSubjectObject?.chapters?.map((ch: any) => (
              <div
                key={ch.chapterNumber}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #dcebe6',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                {/* Chapter Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: '#142D4E',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '800',
                        flexShrink: 0,
                      }}
                    >
                      {ch.chapterNumber}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '16.5px', fontWeight: '800', color: '#142D4E', margin: 0 }}>
                        {ch.title}
                      </h4>
                      <div style={{ fontSize: '13px', color: '#167C80', fontWeight: '700' }}>
                        {selectedClass && selectedClass > 10 ? ch.titleNepali : ''}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      background: ch.simulationCount > 0 ? '#E8F1F1' : '#f1f5f9',
                      color: ch.simulationCount > 0 ? '#167C80' : '#64748b',
                      border: ch.simulationCount > 0 ? '1px solid #CFE3E4' : '1px solid #e2e8f0',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      padding: '4px 11px',
                      borderRadius: '999px',
                    }}
                  >
                    {ch.simulationCount} {ch.simulationCount === 1 ? 'Simulation' : 'Simulations'}
                  </span>
                </div>

                {/* Simulation Cards for this Chapter */}
                {ch.simulations?.length > 0 ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                      gap: '16px',
                    }}
                  >
                    {ch.simulations.map((sim: any) => (
                      <div
                        key={sim.code}
                        style={{
                          background: '#ffffff',
                          borderRadius: '14px',
                          border: '1px solid #e2e8f0',
                          padding: '16px 18px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '12px',
                          boxShadow: '0 2px 6px rgba(15,23,42,0.03)',
                        }}
                      >
                        <div>
                          {/* Clean Badges */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span
                              style={{
                                background: '#F1F5F9',
                                color: '#475569',
                                border: '1px solid #E2E8F0',
                                fontSize: '10.5px',
                                fontWeight: '700',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.03em',
                              }}
                            >
                              {sim.simulationType?.replace('_', ' ') || '2D INTERACTIVE'}
                            </span>

                            <span
                              style={{
                                background: '#E8F1F1',
                                color: '#167C80',
                                fontSize: '10.5px',
                                fontWeight: '700',
                                padding: '2px 8px',
                                borderRadius: '6px',
                              }}
                            >
                              {sim.status || 'AVAILABLE'}
                            </span>
                          </div>

                          <h5 style={{ fontSize: '15.5px', fontWeight: '800', color: '#142D4E', margin: '0 0 3px 0', lineHeight: 1.3 }}>
                            {sim.title}
                          </h5>
                          {sim.titleNepali && !(sim.gradeLevels?.length && Math.max(...sim.gradeLevels) <= 10) && (
                            <div style={{ fontSize: '12.5px', color: '#167C80', fontWeight: '700', marginBottom: '8px' }}>
                              {sim.titleNepali}
                            </div>
                          )}

                          <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, margin: '0 0 10px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {sim.description}
                          </p>

                          {/* Learning objectives preview */}
                          {sim.learningObjectives?.length > 0 && (
                            <div style={{ background: '#F8FAFC', padding: '9px 12px', borderRadius: '9px', border: '1px solid #E2E8F0' }}>
                              <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.04em' }}>
                                Learning Objectives
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '11.5px', color: '#334155', lineHeight: 1.45 }}>
                                {sim.learningObjectives.slice(0, 2).map((obj: string, i: number) => (
                                  <li key={i}>{obj}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons: Primary is Launch Simulation (Real Interactive Lab UI), Secondary is Smart Board */}
                        <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                          <button
                            type="button"
                            onClick={() => setActiveSimulation(sim)}
                            style={{
                              flex: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '10px 16px',
                              background: '#167C80',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '9px',
                              fontSize: '13px',
                              fontWeight: '800',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(22, 124, 128, 0.25)',
                              transition: 'all 0.15s ease',
                              whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#12696D';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#167C80';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                            title="Launch Interactive Simulation Lab"
                          >
                            <Play size={15} fill="#ffffff" />
                            <span>Launch Simulation</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => launchOnSmartBoard(sim.componentKey || sim.code || sim.id, sim.title)}
                            style={{
                              flex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              padding: '10px 12px',
                              background: '#ffffff',
                              color: '#167C80',
                              border: '1.5px solid #167C80',
                              borderRadius: '9px',
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f0fdfa';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#ffffff';
                            }}
                            title="Open on Smart Board whiteboard"
                          >
                            <Monitor size={14} />
                            <span>Smart Board</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                      Simulations for this chapter are currently in development following the Nepal CDC curriculum roadmap.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SIMULATION PREVIEW MODAL ──────────────────────────────── */}
      {previewSimulation && (
        <SimulationPreviewModal
          simulation={previewSimulation}
          onClose={() => setPreviewSimulation(null)}
          onLaunch={(sim) => {
            setPreviewSimulation(null);
            setActiveSimulation(sim);
          }}
          onLaunchSmartBoard={() => launchOnSmartBoard(previewSimulation.componentKey || previewSimulation.code || previewSimulation.id, previewSimulation.title)}
          userRole={userRole}
        />
      )}
    </div>
  );
};


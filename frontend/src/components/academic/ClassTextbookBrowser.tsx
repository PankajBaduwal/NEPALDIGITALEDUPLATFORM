import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  SlidersHorizontal,
  Presentation,
  Folder,
  Layers,
  Sparkles,
  ExternalLink,
  BookCheck,
  CheckCircle2,
  FileText,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  Plus,
  RefreshCw,
  UploadCloud,
  X,
  Globe,
  Check,
  GraduationCap,
} from 'lucide-react';
import { api } from '../../services/api';
import { PdfReaderModal, TextbookData } from '../PdfReaderModal';

export interface ClassTextbookBrowserProps {
  title?: string;
  subtitle?: string;
  theme?: 'emerald' | 'blue';
  onOpenReader?: (textbook: any) => void;
  initialGrade?: string;
  onUpload?: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

/**
 * Sanitizes textbook titles extracted from cover pages that accidentally
 * captured student form fill blanks like "Name : Roll number : School :" or "My name : .... Roll".
 */
export const formatBookTitle = (tb: any): string => {
  const t = (tb?.title || '').trim();
  const lower = t.toLowerCase();
  const isGarbage =
    !t ||
    lower.includes('roll number') ||
    (lower.includes('roll') && lower.includes('name')) ||
    lower.startsWith('name :') ||
    lower.startsWith('name:') ||
    lower.startsWith('my name') ||
    t.includes('....') ||
    t.includes('????') ||
    t.length < 3;

  if (isGarbage) {
    if (tb.sourceRelativePath) {
      const baseName = tb.sourceRelativePath.split('/').pop()?.replace(/\.pdf$/i, '') || '';
      // Strip random hash suffix like _rxsqekn or _pypxs5t
      const cleanName = baseName.replace(/_[a-z0-9]{6,10}$/i, '').trim();
      if (cleanName) {
        return cleanName.replace(/-(\d{4})$/, ' ($1)');
      }
    }
    return `Class ${tb.gradeNumber || ''} ${tb.logicalKey || 'Textbook'}`;
  }
  return t;
};

export const ClassTextbookBrowser: React.FC<ClassTextbookBrowserProps> = ({
  title = 'Classes 1–12 Digital Textbook & Curriculum PDF Management',
  subtitle = 'Official Curriculum Development Centre (CDC) accredited textbooks across Classes 1–12 stored in the Nepal data/ folders with English and Nepali medium sorting.',
  theme = 'emerald',
  onOpenReader,
  initialGrade = 'ALL',
  onUpload,
  onSync,
  isSyncing = false,
}) => {
  const primaryColor = '#0f766e';
  const primaryBg = '#f0fdfa';
  const primaryBorder = '#ccfbf1';

  const [textbooks, setTextbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade);
  const [selectedMedium, setSelectedMedium] = useState<'ALL' | 'ENGLISH' | 'NEPALI'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'TITLE_ASC' | 'PAGES_DESC' | 'CHAPTERS_DESC'>('DEFAULT');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Modal State
  const [activeReaderTextbook, setActiveReaderTextbook] = useState<TextbookData | null>(null);

  // Fetch all CDC textbooks
  useEffect(() => {
    let isMounted = true;
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<any>('/curriculum/textbooks?limit=350');
        const raw = res?.data || res;
        const list = Array.isArray(raw) ? raw : raw?.textbooks || [];

        // Curriculum documents + teaching materials from Nepal data
        let materials: any[] = [];
        try {
          const mr = await api.get<any>('/curriculum/reference-materials');
          const mraw = mr?.data || mr;
          materials = (Array.isArray(mraw) ? mraw : []).map((m: any) => ({
            _id: m.id,
            id: m.id,
            title: m.title,
            isMaterial: true,
            materialKind: m.documentType === 'CURRICULUM' ? 'Curriculum' : 'Teaching Material',
            gradeFrom: m.gradeFrom || null,
            gradeTo: m.gradeTo || m.gradeFrom || null,
            gradeNumber: m.gradeFrom && m.gradeFrom === (m.gradeTo || m.gradeFrom) ? m.gradeFrom : undefined,
            medium: m.language === 'English' ? 'ENGLISH' : 'NEPALI',
            pageCount: m.pageCount,
            sourceRelativePath: m.sourceRelativePath,
            accessPath: `/curriculum/reference-materials/${m.id}/access`,
          }));
        } catch {
          // Staff-only endpoint
        }
        if (isMounted) {
          setTextbooks([...list, ...materials]);
        }
      } catch (err: any) {
        console.error('Failed to load textbooks in ClassTextbookBrowser:', err);
        if (isMounted) {
          setError(err?.message || 'Failed to fetch textbooks. Please try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBooks();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute textbook count per grade for badges
  const gradeCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: textbooks.length };
    for (let i = 1; i <= 12; i++) {
      counts[String(i)] = 0;
    }
    textbooks.forEach((tb) => {
      if (tb.isMaterial) {
        if (tb.gradeFrom) {
          for (let g = tb.gradeFrom; g <= (tb.gradeTo || tb.gradeFrom); g++) {
            if (counts[String(g)] !== undefined) counts[String(g)] += 1;
          }
        }
        return;
      }
      const g = tb.gradeNumber ? String(tb.gradeNumber) : null;
      if (g && counts[g] !== undefined) {
        counts[g] += 1;
      }
    });
    return counts;
  }, [textbooks]);

  // Medium breakdown counts
  const mediumCounts = useMemo(() => {
    let eng = 0;
    let nep = 0;
    let dual = 0;
    textbooks.forEach((tb) => {
      const med = tb.medium || 'NEPALI';
      if (med === 'ENGLISH') eng++;
      else if (med === 'NEPALI') nep++;
      else dual++;
    });
    return { eng, nep, dual };
  }, [textbooks]);

  // Filtered and Sorted Textbooks
  const filteredTextbooks = useMemo(() => {
    let result = textbooks.filter((tb) => {
      // Grade filter
      if (selectedGrade !== 'ALL') {
        if (tb.isMaterial) {
          const g = Number(selectedGrade);
          if (!tb.gradeFrom || g < tb.gradeFrom || g > (tb.gradeTo || tb.gradeFrom)) return false;
        } else if (String(tb.gradeNumber) !== selectedGrade) {
          return false;
        }
      }

      // Medium filter
      if (selectedMedium !== 'ALL') {
        const med = tb.medium || 'NEPALI';
        if (selectedMedium === 'ENGLISH' && med !== 'ENGLISH' && med !== 'BOTH') {
          return false;
        }
        if (selectedMedium === 'NEPALI' && med !== 'NEPALI' && med !== 'BOTH') {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const formattedTitle = formatBookTitle(tb).toLowerCase();
        const matchesTitle = tb.title?.toLowerCase().includes(q) || formattedTitle.includes(q);
        const matchesNp = tb.titleNepali?.toLowerCase().includes(q);
        const matchesPath = tb.sourceRelativePath?.toLowerCase().includes(q) || tb.pdfPath?.toLowerCase().includes(q);
        const matchesSubject =
          tb.subjectId?.name?.toLowerCase().includes(q) || tb.subjectId?.code?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesNp && !matchesPath && !matchesSubject) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'TITLE_ASC') {
        return formatBookTitle(a).localeCompare(formatBookTitle(b));
      }
      if (sortBy === 'PAGES_DESC') {
        return (b.pageCount || 0) - (a.pageCount || 0);
      }
      if (sortBy === 'CHAPTERS_DESC') {
        const aCh = Array.isArray(a.chapters) ? a.chapters.length : 0;
        const bCh = Array.isArray(b.chapters) ? b.chapters.length : 0;
        return bCh - aCh;
      }
      // DEFAULT: Grade ASC, then Title ASC
      const gA = a.gradeNumber || 99;
      const gB = b.gradeNumber || 99;
      if (gA !== gB) return gA - gB;
      return formatBookTitle(a).localeCompare(formatBookTitle(b));
    });

    return result;
  }, [textbooks, selectedGrade, selectedMedium, searchQuery, sortBy]);

  const handleOpenPdf = (tb: any) => {
    const formatted: TextbookData = {
      ...tb,
      id: tb.id || tb._id,
      title: formatBookTitle(tb),
    };
    setActiveReaderTextbook(formatted);
    if (onOpenReader) {
      onOpenReader(formatted);
    }
  };

  const isFiltered = selectedGrade !== 'ALL' || selectedMedium !== 'ALL' || searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setSelectedGrade('ALL');
    setSelectedMedium('ALL');
    setSearchQuery('');
    setSortBy('DEFAULT');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ── UNIFIED EXECUTIVE HEADER BANNER ─────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: '#0f766e',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(15, 118, 110, 0.25)',
              flexShrink: 0,
            }}
          >
            <BookCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#0f766e',
                  background: '#f0fdfa',
                  border: '1px solid #ccfbf1',
                  padding: '1px 8px',
                  borderRadius: '6px',
                }}
              >
                Government of Nepal • CDC
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '3px 0 0' }}>
              {title}
            </h2>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
              {subtitle}
            </p>
          </div>
        </div>

        {/* Action Controls & Quick Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Quick Metrics Cluster */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '6px 14px',
              borderRadius: '10px',
            }}
          >
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f766e', textAlign: 'center' }}>
                {textbooks.length}
              </div>
              <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>Total Books</div>
            </div>
            <div style={{ width: '1px', height: '22px', background: '#cbd5e1' }} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', textAlign: 'center' }}>
                12
              </div>
              <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>Classes (1–12)</div>
            </div>
            <div style={{ width: '1px', height: '22px', background: '#cbd5e1' }} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#6366f1', textAlign: 'center' }}>
                2
              </div>
              <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>Mediums (En/Np)</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href="/smartboard/index.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: '#ffffff',
                color: '#0f766e',
                border: '1px solid #99f6e4',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease',
              }}
              title="Launch Smart Board interactive presentation environment"
            >
              <Presentation size={15} color="#0f766e" />
              <span>Smart Board</span>
            </a>

            {onSync && (
              <button
                onClick={onSync}
                disabled={isSyncing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: '#f8fafc',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: isSyncing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Scan and ingest CDC textbooks from Nepal data/ folders"
              >
                <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} color="#64748b" />
                <span>{isSyncing ? 'Scanning...' : 'Re-sync Nepal data/'}</span>
              </button>
            )}

            {onUpload && (
              <button
                onClick={onUpload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#0f766e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(15,118,110,0.25)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Plus size={15} />
                <span>Upload PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── CLASS SEGMENTED NAVIGATION BAR (CLASSES 1 TO 12) ─────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '12px 16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Folder size={15} color="#0f766e" />
            <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#1e293b' }}>
              Select Class / Grade (Nepal data/ archives):
            </span>
          </div>
          {selectedGrade !== 'ALL' && (
            <button
              onClick={() => setSelectedGrade('ALL')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: '#0f766e',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '2px 4px',
              }}
            >
              <RotateCcw size={12} /> Show All Classes ({textbooks.length})
            </button>
          )}
        </div>

        {/* Clean Horizontal Tabs Scroll Container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '4px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <button
            onClick={() => setSelectedGrade('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: selectedGrade === 'ALL' ? 800 : 600,
              background: selectedGrade === 'ALL' ? '#0f766e' : '#f8fafc',
              color: selectedGrade === 'ALL' ? '#ffffff' : '#334155',
              border: `1px solid ${selectedGrade === 'ALL' ? '#0f766e' : '#e2e8f0'}`,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              boxShadow: selectedGrade === 'ALL' ? '0 2px 6px rgba(15,118,110,0.2)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>All Classes</span>
            <span
              style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '999px',
                background: selectedGrade === 'ALL' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: selectedGrade === 'ALL' ? '#ffffff' : '#64748b',
                fontWeight: 800,
              }}
            >
              {gradeCounts['ALL']}
            </span>
          </button>

          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => {
            const isSelected = selectedGrade === String(g);
            const count = gradeCounts[String(g)] || 0;
            return (
              <button
                key={g}
                onClick={() => setSelectedGrade(String(g))}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: isSelected ? 800 : 600,
                  background: isSelected ? '#0f766e' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  border: `1px solid ${isSelected ? '#0f766e' : '#e2e8f0'}`,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 2px 6px rgba(15,118,110,0.2)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>Class {g}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    background: isSelected ? 'rgba(255,255,255,0.25)' : count > 0 ? '#f0fdfa' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : count > 0 ? '#0f766e' : '#94a3b8',
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── TOOLBAR: SEARCH, MEDIUM FILTER, SORT & VIEW SWITCHER ───── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        {/* Real-time Search Box */}
        <div style={{ flex: '1 1 260px', minWidth: '220px', position: 'relative' }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}
          />
          <input
            type="text"
            placeholder="Search textbook by title, subject, chapter, or file..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 32px 8px 34px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              color: '#0f172a',
              outline: 'none',
              background: '#ffffff',
              boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Medium Segmented Control */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>
            Medium:
          </span>
          {[
            { key: 'ALL', label: 'All Mediums' },
            { key: 'ENGLISH', label: 'English Medium' },
            { key: 'NEPALI', label: 'Nepali (नेपाली)' },
          ].map((m) => {
            const isSel = selectedMedium === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setSelectedMedium(m.key as any)}
                style={{
                  padding: '6px 11px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: isSel ? 700 : 500,
                  background: isSel ? '#0f766e' : '#f8fafc',
                  color: isSel ? '#ffffff' : '#475569',
                  border: `1px solid ${isSel ? '#0f766e' : '#e2e8f0'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SlidersHorizontal size={14} color="#64748b" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '7px 10px',
              borderRadius: '7px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
              color: '#334155',
              background: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="DEFAULT">Sort: Class & Title</option>
            <option value="TITLE_ASC">Sort: Title (A–Z)</option>
            <option value="PAGES_DESC">Sort: Most Pages</option>
            <option value="CHAPTERS_DESC">Sort: Most Chapters</option>
          </select>
        </div>

        {/* View Mode Switcher (Grid / Table) */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '2px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <button
            onClick={() => setViewMode('GRID')}
            title="Grid Cards View"
            style={{
              padding: '5px 9px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'GRID' ? '#ffffff' : 'transparent',
              color: viewMode === 'GRID' ? '#0f766e' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: viewMode === 'GRID' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <LayoutGrid size={14} />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setViewMode('TABLE')}
            title="Compact Table View"
            style={{
              padding: '5px 9px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'TABLE' ? '#ffffff' : 'transparent',
              color: viewMode === 'TABLE' ? '#0f766e' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: viewMode === 'TABLE' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <TableIcon size={14} />
            <span>Table</span>
          </button>
        </div>

        {/* Results Counter Pill & Reset Button */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              padding: '6px 12px',
              background: '#f0fdfa',
              borderRadius: '7px',
              border: '1px solid #ccfbf1',
              fontSize: '12px',
              fontWeight: 800,
              color: '#0f766e',
              whiteSpace: 'nowrap',
            }}
          >
            {filteredTextbooks.length} Books
            {selectedGrade !== 'ALL' ? ` in Class ${selectedGrade}` : ''}
          </div>

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              title="Reset all search & medium filters"
              style={{
                padding: '5px 9px',
                borderRadius: '6px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#64748b',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <RotateCcw size={11} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* ── ACTIVE FILTER CONTEXT CHIP ──────────────────────────────── */}
      {selectedGrade !== 'ALL' && (
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12.5px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, color: '#334155' }}>Active Folder:</span>
            <code
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#0f766e',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
              }}
            >
              Nepal data/class{selectedGrade}/
            </code>
            <span style={{ color: '#64748b' }}>
              • {filteredTextbooks.length} textbooks cataloged
            </span>
          </div>
          <button
            onClick={() => setSelectedGrade('ALL')}
            style={{
              background: 'none',
              border: 'none',
              color: '#0f766e',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Show All Classes ✕
          </button>
        </div>
      )}

      {/* ── CONTENT PRESENTATION (GRID OR TABLE) ─────────────────────── */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            color: '#64748b',
          }}
        >
          <RefreshCw size={24} className="animate-spin" color="#0f766e" style={{ margin: '0 auto 10px' }} />
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
            Loading Nepal CDC Digital Textbooks...
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
            Connecting to official national curriculum repository.
          </div>
        </div>
      ) : error ? (
        <div
          style={{
            textAlign: 'center',
            padding: '30px',
            background: '#fef2f2',
            borderRadius: '12px',
            border: '1px solid #fecaca',
            color: '#b91c1c',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '14px' }}>{error}</div>
        </div>
      ) : filteredTextbooks.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
          }}
        >
          <BookOpen size={40} color="#cbd5e1" style={{ margin: '0 auto 10px' }} />
          <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
            No Textbooks Match Your Filters
          </h4>
          <p style={{ fontSize: '13px', color: '#64748b', maxWidth: '420px', margin: '0 auto 14px' }}>
            No books found for Class {selectedGrade} with the selected medium or query.
          </p>
          <button
            onClick={handleResetFilters}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#0f766e',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'GRID' ? (
        /* ── GRID CARD VIEW ─────────────────────────────────────────── */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredTextbooks.map((tb) => {
            const tbId = tb.id || tb._id;
            const chaptersCount = Array.isArray(tb.chapters) ? tb.chapters.length : 0;
            const isEng = tb.medium === 'ENGLISH';
            const isNep = tb.medium === 'NEPALI';
            const cleanTitle = formatBookTitle(tb);

            const folderName = tb.sourceRelativePath
              ? tb.sourceRelativePath.split('/')[0]
              : tb.gradeNumber
              ? `class${tb.gradeNumber}`
              : 'class';

            // Clean Edition Tag (Hide 'Not stated in source')
            const hasRealEdition =
              tb.edition &&
              tb.edition.trim().length > 0 &&
              !tb.edition.toLowerCase().includes('not stated');

            return (
              <div
                key={tbId}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0f766e';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(15,118,110,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                }}
              >
                <div>
                  {/* Top Badges Row */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        background: '#f0fdfa',
                        color: '#0f766e',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: '1px solid #ccfbf1',
                      }}
                    >
                      {tb.isMaterial
                        ? `${tb.materialKind} · ${
                            tb.gradeFrom
                              ? tb.gradeTo && tb.gradeTo !== tb.gradeFrom
                                ? `Class ${tb.gradeFrom}–${tb.gradeTo}`
                                : `Class ${tb.gradeFrom}`
                              : 'All Classes'
                          }`
                        : `Class ${tb.gradeNumber || '—'}`}
                    </span>

                    <div style={{ display: 'flex', gap: '5px' }}>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          background: isEng ? '#ecfdf5' : isNep ? '#f5f3ff' : '#f0fdf4',
                          color: isEng ? '#047857' : isNep ? '#6d28d9' : '#0f766e',
                          border: `1px solid ${isEng ? '#a7f3d0' : isNep ? '#ddd6fe' : '#bbf7d0'}`,
                          padding: '1px 7px',
                          borderRadius: '6px',
                        }}
                      >
                        {isEng ? 'English' : isNep ? 'नेपाली' : 'Dual Medium'}
                      </span>

                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 600,
                          background: '#f8fafc',
                          color: '#64748b',
                          border: '1px solid #e2e8f0',
                          padding: '1px 6px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontFamily: 'monospace',
                        }}
                        title={`Folder: Nepal data/${folderName}/`}
                      >
                        <Folder size={10} />
                        {folderName}
                      </span>
                    </div>
                  </div>

                  {/* Sanitized Book Title */}
                  <h4
                    style={{
                      fontSize: '14.5px',
                      fontWeight: 800,
                      color: '#0f172a',
                      margin: '0 0 3px',
                      lineHeight: '1.35',
                    }}
                    title={cleanTitle}
                  >
                    {cleanTitle}
                  </h4>

                  {tb.titleNepali && tb.titleNepali !== tb.title && (
                    <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600, marginBottom: '6px' }}>
                      {tb.titleNepali}
                    </div>
                  )}

                  {/* Metadata Indicators Row */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginTop: '8px',
                      fontSize: '11px',
                      color: '#64748b',
                      fontWeight: 600,
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '2px 6px',
                        borderRadius: '5px',
                      }}
                    >
                      📖 {chaptersCount > 0 ? `${chaptersCount} Chapters` : 'Curriculum PDF'}
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '2px 6px',
                        borderRadius: '5px',
                      }}
                    >
                      📄 {tb.pageCount || '—'} Pages
                    </span>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        padding: '2px 6px',
                        borderRadius: '5px',
                      }}
                    >
                      {hasRealEdition ? `🇳🇵 ${tb.edition}` : '🏛️ CDC Accredited'}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div
                  style={{
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '12px',
                    display: 'flex',
                    gap: '8px',
                  }}
                >
                  <button
                    onClick={() => handleOpenPdf(tb)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: '#0f766e',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '7px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      boxShadow: '0 1px 3px rgba(15,118,110,0.2)',
                      transition: 'background 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <BookOpen size={13} />
                    <span>Read PDF</span>
                  </button>

                  {!tb.isMaterial && (
                    <a
                      href={`/smartboard/index.html?pdf=${encodeURIComponent(
                        `/api/v1/curriculum/textbooks/${tbId}/pdf`
                      )}&title=${encodeURIComponent(cleanTitle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 12px',
                        background: '#f0fdfa',
                        color: '#0f766e',
                        border: '1px solid #99f6e4',
                        borderRadius: '7px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                      }}
                      title="Launch on Interactive Smart Board"
                    >
                      <Presentation size={13} />
                      <span>Smart Board</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── COMPACT TABLE VIEW ─────────────────────────────────────── */
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
            <table
              style={{
                width: '100%',
                minWidth: '1050px',
                borderCollapse: 'separate',
                borderSpacing: 0,
                textAlign: 'left',
                fontSize: '13px',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    color: '#475569',
                    fontWeight: '700',
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  <th style={{ padding: '12px 16px', width: '45px', borderBottom: '1px solid #e2e8f0' }}>#</th>
                  <th style={{ padding: '12px 16px', width: '100px', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>Class</th>
                  <th style={{ padding: '12px 16px', minWidth: '300px', borderBottom: '1px solid #e2e8f0' }}>Textbook Title</th>
                  <th style={{ padding: '12px 16px', width: '120px', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>Medium</th>
                  <th style={{ padding: '12px 16px', width: '110px', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>Pages</th>
                  <th style={{ padding: '12px 16px', width: '120px', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>Chapters</th>
                  <th style={{ padding: '12px 16px', width: '150px', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>Archive Folder</th>
                  <th style={{ padding: '12px 16px', width: '200px', textAlign: 'right', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTextbooks.map((tb, idx) => {
                  const tbId = tb.id || tb._id;
                  const chaptersCount = Array.isArray(tb.chapters) ? tb.chapters.length : 0;
                  const isEng = tb.medium === 'ENGLISH';
                  const isNep = tb.medium === 'NEPALI';
                  const cleanTitle = formatBookTitle(tb);
                  const folderName = tb.sourceRelativePath
                    ? tb.sourceRelativePath.split('/')[0]
                    : tb.gradeNumber
                    ? `class${tb.gradeNumber}`
                    : 'class';

                  return (
                    <tr
                      key={tbId}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '12px', borderBottom: '1px solid #f1f5f9' }}>
                        {idx + 1}
                      </td>

                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: '11.5px',
                            background: '#f0fdfa',
                            color: '#0f766e',
                            border: '1px solid #ccfbf1',
                            padding: '2px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          {tb.isMaterial
                            ? tb.gradeFrom
                              ? `Class ${tb.gradeFrom}`
                              : 'Curriculum'
                            : `Class ${tb.gradeNumber || '—'}`}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
                          {cleanTitle}
                        </div>
                        {tb.titleNepali && tb.titleNepali !== tb.title && (
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {tb.titleNepali}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            background: isEng ? '#ecfdf5' : isNep ? '#f5f3ff' : '#f0fdf4',
                            color: isEng ? '#047857' : isNep ? '#6d28d9' : '#0f766e',
                            border: `1px solid ${isEng ? '#a7f3d0' : isNep ? '#ddd6fe' : '#bbf7d0'}`,
                            padding: '2px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          {isEng ? 'English' : isNep ? 'नेपाली' : 'Dual'}
                        </span>
                      </td>

                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap', color: '#334155', fontWeight: 600, fontSize: '12px' }}>
                        {tb.pageCount ? `${tb.pageCount} pages` : '—'}
                      </td>

                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap', color: '#64748b', fontSize: '12px' }}>
                        {chaptersCount > 0 ? `${chaptersCount} chapters` : 'Full Doc'}
                      </td>

                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        <code
                          style={{
                            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                            fontSize: '11px',
                            background: '#f8fafc',
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {folderName}
                        </code>
                      </td>

                      <td style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            onClick={() => handleOpenPdf(tb)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              background: '#0f766e',
                              color: '#ffffff',
                              border: 'none',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <BookOpen size={12} />
                            <span>Read</span>
                          </button>

                          {!tb.isMaterial && (
                            <a
                              href={`/smartboard/index.html?pdf=${encodeURIComponent(
                                `/api/v1/curriculum/textbooks/${tbId}/pdf`
                              )}&title=${encodeURIComponent(cleanTitle)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                background: '#f0fdfa',
                                color: '#0f766e',
                                border: '1px solid #99f6e4',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Presentation size={12} />
                              <span>Smart Board</span>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── INTEGRATED PDF READER MODAL ─────────────────────────────── */}
      <PdfReaderModal
        isOpen={!!activeReaderTextbook}
        onClose={() => setActiveReaderTextbook(null)}
        textbook={activeReaderTextbook}
      />
    </div>
  );
};

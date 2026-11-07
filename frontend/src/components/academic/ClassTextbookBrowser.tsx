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
} from 'lucide-react';
import { api } from '../../services/api';
import { PdfReaderModal, TextbookData } from '../PdfReaderModal';

export interface ClassTextbookBrowserProps {
  title?: string;
  subtitle?: string;
  theme?: 'emerald' | 'blue';
  onOpenReader?: (textbook: any) => void;
  initialGrade?: string;
}

export const ClassTextbookBrowser: React.FC<ClassTextbookBrowserProps> = ({
  title = 'Classes 1–12 Digital Textbooks & PDF Library',
  subtitle = 'Official Curriculum Development Centre (CDC) accredited textbooks organized by Class (1–12) with dual-medium English and Nepali support.',
  theme = 'emerald',
  onOpenReader,
  initialGrade = 'ALL',
}) => {
  // Palette based on theme
  const isEmerald = theme === 'emerald';
  const primaryColor = isEmerald ? '#117a6b' : '#117a6b';
  const primaryBg = isEmerald ? '#e6f7f0' : '#e6f7f0';
  const primaryBorder = isEmerald ? '#bfeede' : '#bfeede';

  const [textbooks, setTextbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade);
  const [selectedMedium, setSelectedMedium] = useState<'ALL' | 'ENGLISH' | 'NEPALI'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'TITLE_ASC' | 'PAGES_DESC' | 'CHAPTERS_DESC'>('DEFAULT');

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

        // Curriculum documents + teaching materials from Nepal data (shown alongside the class books)
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
          // Staff-only endpoint: other roles simply see the class textbooks.
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
        if (tb.gradeFrom) for (let g = tb.gradeFrom; g <= (tb.gradeTo || tb.gradeFrom); g++) if (counts[String(g)] !== undefined) counts[String(g)] += 1;
        return;
      }
      const g = tb.gradeNumber ? String(tb.gradeNumber) : null;
      if (g && counts[g] !== undefined) {
        counts[g] += 1;
      }
    });
    return counts;
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

      // Search query (matches title, titleNepali, sourceRelativePath, or subject code)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = tb.title?.toLowerCase().includes(q);
        const matchesNp = tb.titleNepali?.toLowerCase().includes(q);
        const matchesPath = tb.sourceRelativePath?.toLowerCase().includes(q) || tb.pdfPath?.toLowerCase().includes(q);
        const matchesSubject = tb.subjectId?.name?.toLowerCase().includes(q) || tb.subjectId?.code?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesNp && !matchesPath && !matchesSubject) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'TITLE_ASC') {
        return (a.title || '').localeCompare(b.title || '');
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
      return (a.title || '').localeCompare(b.title || '');
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

  const formatBookTitle = (tb: any): string => {
    if (!tb.title || tb.title.toLowerCase().startsWith('name : roll number') || tb.title.includes('????')) {
      if (tb.sourceRelativePath) {
        const baseName = tb.sourceRelativePath.split('/').pop()?.replace(/\.pdf$/i, '') || '';
        const cleanName = baseName.replace(/_[a-z0-9]{6,10}$/i, '');
        if (cleanName) return cleanName;
      }
      return `Class ${tb.gradeNumber || ''} ${tb.logicalKey || 'Textbook'}`;
    }
    return tb.title;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── HEADER BANNER ─────────────────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #dcebe6',
          padding: '22px 26px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: primaryBg,
                color: primaryColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px solid ${primaryBorder}`,
              }}
            >
              <BookCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0e3e3b', margin: 0 }}>
                {title}
              </h3>
              <p style={{ fontSize: '13px', color: '#5f736f', margin: '2px 0 0 0' }}>
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right', display: 'flex', gap: '16px', background: '#f4faf8', padding: '10px 18px', borderRadius: '12px', border: '1px solid #dcebe6' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: primaryColor }}>
                {textbooks.length}
              </div>
              <div style={{ fontSize: '11px', color: '#5f736f', fontWeight: 600 }}>Total Books</div>
            </div>
            <div style={{ width: '1px', background: '#cfdcd8' }} />
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0e3e3b' }}>
                12
              </div>
              <div style={{ fontSize: '11px', color: '#5f736f', fontWeight: 600 }}>Classes (1–12)</div>
            </div>
            <div style={{ width: '1px', background: '#cfdcd8' }} />
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#6d5bd0' }}>
                2
              </div>
              <div style={{ fontSize: '11px', color: '#5f736f', fontWeight: 600 }}>Mediums (En/Np)</div>
            </div>
          </div>

          <a
            href="/smartboard/index.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              background: `linear-gradient(135deg, ${primaryColor}, #3b82f6)`,
              color: '#ffffff',
              borderRadius: '10px',
              fontSize: '12.5px',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 3px 8px rgba(37, 99, 235, 0.25)',
              transition: 'transform 0.15s ease',
            }}
          >
            <Presentation size={16} />
            <span>Launch Smart Board</span>
          </a>
        </div>
      </div>

      {/* ── CLASS BUTTON SELECTOR (CLASSES 1 TO 12) ────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #dcebe6',
          padding: '16px 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Folder size={16} color={primaryColor} />
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0e3e3b' }}>
              Select Class / Grade (Folders in Nepal data/):
            </span>
          </div>

          {selectedGrade !== 'ALL' && (
            <button
              onClick={() => setSelectedGrade('ALL')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: primaryColor,
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '2px 6px',
              }}
            >
              <RotateCcw size={13} /> View All Classes
            </button>
          )}
        </div>

        {/* Horizontal Class Pills List */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button
            onClick={() => setSelectedGrade('ALL')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: selectedGrade === 'ALL' ? 800 : 600,
              background: selectedGrade === 'ALL' ? primaryColor : '#f4faf8',
              color: selectedGrade === 'ALL' ? '#ffffff' : '#2f4f4c',
              border: `1.5px solid ${selectedGrade === 'ALL' ? primaryColor : '#dcebe6'}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
              boxShadow: selectedGrade === 'ALL' ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <span>All Classes</span>
            <span
              style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '999px',
                background: selectedGrade === 'ALL' ? 'rgba(255,255,255,0.25)' : '#dcebe6',
                color: selectedGrade === 'ALL' ? '#ffffff' : '#5f736f',
                fontWeight: 700,
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
                  padding: '8px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: isSelected ? 800 : 600,
                  background: isSelected ? primaryColor : '#ffffff',
                  color: isSelected ? '#ffffff' : '#2f4f4c',
                  border: `1.5px solid ${isSelected ? primaryColor : '#dcebe6'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.12)' : 'none',
                }}
              >
                <span>Class {g}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    background: isSelected ? 'rgba(255,255,255,0.25)' : count > 0 ? '#e6f7f0' : '#ebf5f1',
                    color: isSelected ? '#ffffff' : count > 0 ? '#117a6b' : '#8da19d',
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

      {/* ── FILTER & SORT CONTROLS BAR ──────────────────────────────── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #dcebe6',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        {/* Realtime Search Input */}
        <div style={{ flex: '1 1 200px', position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8da19d',
            }}
          />
          <input
            type="text"
            placeholder="Search textbook by title, subject, or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 36px',
              borderRadius: '8px',
              border: '1.5px solid #cfdcd8',
              fontSize: '13px',
              color: '#0e3e3b',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => (e.target.style.borderColor = primaryColor)}
            onBlur={(e) => (e.target.style.borderColor = '#cfdcd8')}
          />
        </div>

        {/* Grade Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0e3e3b' }}>
            Filter Textbooks:
          </span>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              border: '1.5px solid #cfdcd8',
              background: '#ffffff',
              color: '#0e3e3b',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="ALL">All Grades (1–12)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
              <option key={g} value={String(g)}>
                Grade {g}
              </option>
            ))}
          </select>
        </div>

        {/* Medium Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#4b605b' }}>
            Medium:
          </span>
          {[
            { key: 'ALL', label: 'All Mediums' },
            { key: 'ENGLISH', label: 'English Medium' },
            { key: 'NEPALI', label: 'Nepali Medium (नेपाली)' },
          ].map((m) => {
            const isSel = selectedMedium === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setSelectedMedium(m.key as any)}
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: isSel ? 800 : 600,
                  background: isSel ? (m.key === 'ENGLISH' ? '#117a6b' : m.key === 'NEPALI' ? '#6d5bd0' : primaryColor) : '#f4faf8',
                  color: isSel ? '#ffffff' : '#4b605b',
                  border: `1px solid ${isSel ? 'transparent' : '#cfdcd8'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Sort By Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={15} color="#5f736f" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1.5px solid #cfdcd8',
              fontSize: '12.5px',
              color: '#2f4f4c',
              background: '#ffffff',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="DEFAULT">Sort: Class & Title</option>
            <option value="TITLE_ASC">Sort: Title (A–Z)</option>
            <option value="PAGES_DESC">Sort: Most Pages</option>
            <option value="CHAPTERS_DESC">Sort: Most Chapters</option>
          </select>
        </div>

        {/* Result Counter Pill */}
        <div
          style={{
            marginLeft: 'auto',
            padding: '7px 14px',
            background: primaryBg,
            borderRadius: '8px',
            border: `1px solid ${primaryBorder}`,
            fontSize: '12.5px',
            fontWeight: 800,
            color: primaryColor,
          }}
        >
          {filteredTextbooks.length} Books Found
          {selectedGrade !== 'ALL' && ` in Class ${selectedGrade}`}
        </div>
      </div>

      {/* ── ACTIVE CLASS CONTEXT BANNER ─────────────────────────────── */}
      {selectedGrade !== 'ALL' && (
        <div
          style={{
            background: '#f4faf8',
            border: '1px solid #dcebe6',
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#0e3e3b' }}>
              Viewing Folder:
            </span>
            <code
              style={{
                background: '#ffffff',
                border: '1px solid #cfdcd8',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                color: primaryColor,
              }}
            >
              Nepal data/class{selectedGrade}/
            </code>
            <span style={{ fontSize: '12px', color: '#5f736f' }}>
              • {filteredTextbooks.length} official textbook PDFs extracted
            </span>
          </div>

          <div style={{ fontSize: '12px', color: '#5f736f' }}>
            Classes 1–12 Dual-Medium CDC Curriculum
          </div>
        </div>
      )}

      {/* ── TEXTBOOKS GRID ─────────────────────────────────────────── */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #dcebe6',
            color: '#5f736f',
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#0e3e3b', marginBottom: '6px' }}>
            Loading Nepal CDC Textbooks...
          </div>
          <div style={{ fontSize: '13px' }}>
            Connecting to official curriculum repository and streaming catalog.
          </div>
        </div>
      ) : error ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
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
            borderRadius: '16px',
            border: '1px solid #dcebe6',
          }}
        >
          <BookOpen size={44} color="#8da19d" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0e3e3b', margin: '0 0 6px' }}>
            No Textbooks Match Your Filters
          </h4>
          <p style={{ fontSize: '13px', color: '#5f736f', maxWidth: '440px', margin: '0 auto 16px' }}>
            No books found for Class {selectedGrade} with the selected medium filter. Try changing medium to "All Mediums" or clearing your search.
          </p>
          <button
            onClick={() => {
              setSelectedGrade('ALL');
              setSelectedMedium('ALL');
              setSearchQuery('');
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: primaryColor,
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '18px',
          }}
        >
          {filteredTextbooks.map((tb) => {
            const tbId = tb.id || tb._id;
            const chaptersCount = Array.isArray(tb.chapters) ? tb.chapters.length : 0;
            const isEng = tb.medium === 'ENGLISH';
            const isNep = tb.medium === 'NEPALI';
            const isBoth = tb.medium === 'BOTH';

            // Determine folder path
            const folderName = tb.sourceRelativePath
              ? tb.sourceRelativePath.split('/')[0]
              : tb.gradeNumber
                ? `class${tb.gradeNumber}`
                : 'class';

            return (
              <div
                key={tbId}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #dcebe6',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = primaryColor;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#dcebe6';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
                }}
              >
                <div>
                  {/* Top Badges */}
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
                        background: '#e6f7f0',
                        color: '#117a6b',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #bfeede',
                      }}
                    >
                      {tb.isMaterial
                        ? `${tb.materialKind} · ${tb.gradeFrom ? (tb.gradeTo && tb.gradeTo !== tb.gradeFrom ? `Class ${tb.gradeFrom}–${tb.gradeTo}` : `Class ${tb.gradeFrom}`) : 'All Classes'}`
                        : `Class ${tb.gradeNumber || '—'}`}
                    </span>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          background: isEng ? '#e6f7f0' : isNep ? '#f5f3ff' : '#f5f3ff',
                          color: isEng ? '#117a6b' : isNep ? '#6d5bd0' : '#7c3aed',
                          border: `1px solid ${isEng ? '#bfeede' : isNep ? '#ddd6fe' : '#ddd6fe'}`,
                          padding: '2px 7px',
                          borderRadius: '6px',
                        }}
                      >
                        {isEng ? 'English' : isNep ? 'नेपाली' : 'Dual Medium'}
                      </span>

                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          background: '#f4faf8',
                          color: '#5f736f',
                          border: '1px solid #dcebe6',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                        title={`Source folder: Nepal data/${folderName}/`}
                      >
                        <Folder size={10} />
                        {folderName}
                      </span>
                    </div>
                  </div>

                  {/* Book Title */}
                  <h4
                    style={{
                      fontSize: '15px',
                      fontWeight: 800,
                      color: '#0e3e3b',
                      margin: '0 0 4px',
                      lineHeight: '1.35',
                    }}
                  >
                    {formatBookTitle(tb)}
                  </h4>

                  {tb.titleNepali && tb.titleNepali !== tb.title && (
                    <div style={{ fontSize: '13px', color: '#5f736f', fontWeight: 600, marginBottom: '6px' }}>
                      {tb.titleNepali}
                    </div>
                  )}

                  {/* Metadata Indicators */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginTop: '10px',
                      fontSize: '11px',
                      color: '#5f736f',
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#f4faf8', padding: '2px 7px', borderRadius: '4px' }}>
                      📖 {chaptersCount > 0 ? `${chaptersCount} Chapters` : 'Curriculum PDF'}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#f4faf8', padding: '2px 7px', borderRadius: '4px' }}>
                      📄 {tb.pageCount || '—'} Pages
                    </span>
                    {tb.edition && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#f4faf8', padding: '2px 7px', borderRadius: '4px' }}>
                        🇳🇵 {tb.edition}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div
                  style={{
                    borderTop: '1px solid #ebf5f1',
                    paddingTop: '12px',
                    display: 'flex',
                    gap: '8px',
                  }}
                >
                  <button
                    onClick={() => handleOpenPdf(tb)}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      background: primaryColor,
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'background 0.15s ease',
                      boxShadow: '0 2px 6px rgba(17, 122, 107, 0.2)',
                    }}
                  >
                    <BookOpen size={14} />
                    <span>Read PDF</span>
                  </button>

                  {!tb.isMaterial && <a
                    href={`/smartboard/index.html?pdf=${encodeURIComponent(
                      `/api/v1/curriculum/textbooks/${tbId}/pdf`
                    )}&title=${encodeURIComponent(tb.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '9px 12px',
                      background: primaryBg,
                      color: primaryColor,
                      border: `1px solid ${primaryBorder}`,
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.15s ease',
                    }}
                    title="Launch on Interactive Smart Board"
                  >
                    <Presentation size={14} />
                    <span>Smart Board</span>
                  </a>}
                </div>
              </div>
            );
          })}
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

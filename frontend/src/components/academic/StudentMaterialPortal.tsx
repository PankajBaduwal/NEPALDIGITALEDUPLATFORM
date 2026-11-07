import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Folder,
  Download,
  FileText,
  Presentation,
  BookOpen,
  Filter,
  Search,
} from 'lucide-react';

interface StudentMaterialPortalProps {
  overview: any;
}

export const StudentMaterialPortal: React.FC<StudentMaterialPortalProps> = ({ overview }) => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadMaterials();
  }, [overview, selectedCategory]);

  const loadMaterials = async () => {
    const classId = overview?.studentProfile?.classId?.id || overview?.studentProfile?.classId?._id || overview?.academicInfo?.classId || overview?.subjects?.[0]?.classId;
    const sectionId = overview?.studentProfile?.sectionId?.id || overview?.studentProfile?.sectionId?._id || overview?.academicInfo?.sectionId || overview?.subjects?.[0]?.sectionId;

    if (!classId || !sectionId) {
      setMaterials([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      let url = `/academic-materials/student?classId=${classId}&sectionId=${sectionId}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;

      const materialsData = await api.get<any>(url);
      setMaterials(Array.isArray(materialsData) ? materialsData : []);
    } catch (e) {
      console.error('Failed to load study materials', e);
      setLoadError((e as any)?.message || 'Request failed');
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (m: any) => {
    try {
      await api.post(`/academic-materials/${m.id}/download`, {});
      await api.downloadBlob(m.fileUrl, m.originalFilename || m.title || 'learning-resource');
    } catch (error: any) {
      alert(error.message || 'Failed to download learning resource');
    }
  };

  const filtered = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3">
          Could not load this section: {loadError}
        </div>
      )}
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Folder className="text-emerald-600" size={22} />
            Shared Notes & Study Materials
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Access chapter notes, presentations, and worksheets uploaded by your subject teachers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-700"
          >
            <option value="">All Resource Categories</option>
            <option value="LECTURE_NOTE">Lecture Notes (PDF)</option>
            <option value="PRESENTATION">Slide Decks / Presentations</option>
            <option value="VIDEO">Videos</option>
            <option value="WORKSHEET">Worksheets & Practice</option>
            <option value="REFERENCE_MATERIAL">Reference Guides</option>
          </select>

          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search notes or topic…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 pl-8 text-slate-700 focus:outline-none focus:border-emerald-500"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-400">Loading resources…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <BookOpen className="mx-auto text-slate-300 mb-3" size={40} />
          <h3 className="text-sm font-bold text-slate-700">No Learning Materials Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {selectedCategory || searchQuery
              ? 'No materials matched your filter.'
              : 'Your teachers have not uploaded any digital study notes for your section yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {m.category?.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {(m.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{m.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{m.description || m.originalFilename}</p>

                <div className="mt-3 flex flex-wrap gap-1 text-[11px]">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    {m.subjectName}
                  </span>
                  {m.chapterNumber && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                      Ch. {m.chapterNumber}
                    </span>
                  )}
                  {m.topic && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {m.topic}
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Teacher: {m.uploadedByName}</span>
                  <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleDownload(m)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download size={14} /> Open & Download Resource
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

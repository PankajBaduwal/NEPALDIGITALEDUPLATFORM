import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Folder,
  Plus,
  Upload,
  Download,
  Trash2,
  FileText,
  FileCheck,
  Presentation,
  BookOpen,
  X,
} from 'lucide-react';

interface TeacherMaterialManagerProps {
  allocations: any[];
  defaultSectionId?: string;
  defaultSubjectId?: string;
}

export const TeacherMaterialManager: React.FC<TeacherMaterialManagerProps> = ({
  allocations,
  defaultSectionId,
  defaultSubjectId,
}) => {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<
    'LECTURE_NOTE' | 'PRESENTATION' | 'VIDEO' | 'WORKSHEET' | 'PRACTICE_QUESTION' | 'REFERENCE_MATERIAL'
  >('LECTURE_NOTE');
  const [medium, setMedium] = useState<'ENGLISH' | 'NEPALI' | 'BOTH'>('BOTH');
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [topic, setTopic] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [formAllocIndex, setFormAllocIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, [defaultSectionId, defaultSubjectId]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const materialsData = await api.get<any>('/academic-materials/teacher');
      setMaterials(Array.isArray(materialsData) ? materialsData : []);
    } catch (e) {
      console.error('Failed to load study materials', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a document file to upload.');
      return;
    }
    if (!title.trim()) {
      alert('Please provide a title for the study material.');
      return;
    }

    const alloc = allocations[formAllocIndex] || allocations[0];
    if (!alloc) {
      alert('Please select an allocated class & subject.');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('classId', alloc.classId?.id || alloc.classId?._id || alloc.classId);
    if (alloc.sectionId) {
      formData.append('sectionId', alloc.sectionId?.id || alloc.sectionId?._id || alloc.sectionId);
    }
    formData.append('centralSubjectId', alloc.centralSubjectId?.id || alloc.centralSubjectId?._id || alloc.centralSubjectId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('medium', medium);
    formData.append('chapterNumber', String(chapterNumber));
    formData.append('topic', topic);

    setIsSubmitting(true);
    try {
      await api.post('/academic-materials/upload', formData);
      alert('Study material uploaded and shared with students!');
      setIsUploadModalOpen(false);
      resetForm();
      loadMaterials();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this study material?')) return;
    try {
      await api.delete(`/academic-materials/${id}`);
      loadMaterials();
    } catch (err: any) {
      alert(err.message || 'Failed to delete material');
    }
  };

  const handleDownload = async (material: any) => {
    try {
      await api.downloadBlob(
        material.fileUrl,
        material.originalFilename || `${material.title || 'learning-resource'}`
      );
    } catch (err: any) {
      alert(err.message || 'Failed to download material');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('LECTURE_NOTE');
    setMedium('BOTH');
    setChapterNumber(1);
    setTopic('');
    setUploadFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Folder className="text-emerald-600" size={22} />
            Shared Notes & Study Materials
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Share chapter notes, slide presentations, worksheets, and reference guides with students.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsUploadModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
        >
          <Upload size={15} /> Upload & Share Resource
        </button>
      </div>

      {/* Materials List */}
      {loading ? (
        <div className="text-center py-12 text-sm text-slate-400">Loading resources…</div>
      ) : materials.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <BookOpen className="mx-auto text-slate-300 mb-3" size={40} />
          <h3 className="text-sm font-bold text-slate-700">No Learning Materials Shared Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            Upload PDF notes, worksheets, or presentations to make them immediately accessible to your classes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((m) => (
            <div
              key={m.id || m._id}
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
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {m.description || 'No description provided.'}
                </p>

                <div className="mt-3 flex flex-wrap gap-1 text-[11px] text-slate-600">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100">
                    Grade {m.classId?.gradeNumber} ({m.sectionId?.name || 'All Sections'})
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">
                    {m.centralSubjectId?.name}
                  </span>
                  {m.chapterNumber && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                      Ch. {m.chapterNumber}
                    </span>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Downloads: {m.downloadCount || 0}</span>
                  <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(m)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Download size={13} /> Download
                </button>
                <button
                  onClick={() => handleDelete(m.id || m._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                  title="Remove resource"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── UPLOAD MODAL ─────────────────────────────────────────── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 p-6 my-8 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Upload className="text-emerald-600" size={20} />
                Upload Learning Resource
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Class & Subject Allocation
                </label>
                <select
                  value={formAllocIndex}
                  onChange={(e) => setFormAllocIndex(parseInt(e.target.value, 10))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-slate-50 font-medium"
                >
                  {allocations.map((a, i) => (
                    <option key={i} value={i}>
                      Class {a.classId?.gradeNumber} Section {a.sectionId?.name || 'All'} •{' '}
                      {a.centralSubjectId?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 4: Photosynthesis Notes & Diagrams"
                  className="w-full text-xs p-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  >
                    <option value="LECTURE_NOTE">Lecture Notes (PDF)</option>
                    <option value="PRESENTATION">Slide Deck / Presentation</option>
                    <option value="VIDEO">Video</option>
                    <option value="WORKSHEET">Worksheet & Exercises</option>
                    <option value="PRACTICE_QUESTION">Practice Questions</option>
                    <option value="REFERENCE_MATERIAL">Reference Material</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Medium</label>
                  <select
                    value={medium}
                    onChange={(e) => setMedium(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  >
                    <option value="BOTH">Bilingual (English + Nepali)</option>
                    <option value="ENGLISH">English</option>
                    <option value="NEPALI">Nepali</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CDC Chapter Number
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(parseInt(e.target.value, 10) || 1)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Topic / Unit</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Light Reaction"
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select File (PDF, DOCX, PPTX, Images)
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full text-xs p-2 border border-dashed border-slate-300 rounded-lg bg-slate-50"
                />
                {uploadFile && (
                  <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                    Selected: {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm"
                >
                  {isSubmitting ? 'Uploading…' : 'Share with Students'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  FileText,
  Calendar,
  Clock,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Award,
  X,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface StudentAssignmentPortalProps {
  overview: any;
}

export const StudentAssignmentPortal: React.FC<StudentAssignmentPortalProps> = ({ overview }) => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Active submission modal
  const [activeAssignment, setActiveAssignment] = useState<any>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRubricDetails, setShowRubricDetails] = useState(true);

  useEffect(() => {
    loadStudentAssignments();
  }, [overview]);

  const loadStudentAssignments = async () => {
    const sectionId =
      overview?.studentProfile?.sectionId?.id ||
      overview?.studentProfile?.sectionId?._id ||
      overview?.academicInfo?.sectionId ||
      overview?.subjects?.[0]?.sectionId ||
      overview?.section?._id ||
      overview?.student?.sectionId;

    if (!sectionId) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const assignmentsData = await api.get<any>(`/assignments/student?sectionId=${sectionId}`);
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
    } catch (e) {
      console.error('Failed to load student assignments', e);
      setLoadError((e as any)?.message || 'Request failed');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmissionModal = (assignment: any) => {
    setActiveAssignment(assignment);
    setSubmissionContent(assignment.submission?.content || '');
    setSubmissionFiles([]);
    
    // Populate existing text answers if available
    const initAnswers: Record<string, string> = {};
    // The server stores structured answers as a JSON string
    let savedAnswers: any = assignment.submission?.textAnswers;
    if (typeof savedAnswers === 'string') {
      try { savedAnswers = JSON.parse(savedAnswers); } catch { savedAnswers = null; }
    }
    if (Array.isArray(savedAnswers)) {
      savedAnswers.forEach((a: any) => {
        if (a.questionId) initAnswers[a.questionId] = a.text;
      });
    }
    setTextAnswers(initAnswers);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setSubmissionFiles((prev) => [...prev, ...selected]);
    }
  };

  const handleDownloadAttachment = async (url: string, filename: string) => {
    try {
      await api.downloadBlob(url, filename);
    } catch (error: any) {
      alert(error.message || 'Download failed');
    }
  };

  const removeFile = (index: number) => {
    setSubmissionFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment) return;

    const hasTextAnswers = Object.values(textAnswers).some((t) => t.trim().length > 0);
    const hasFiles = submissionFiles.length > 0;
    const hasExistingFile = Boolean(activeAssignment.submission?.fileUrl);
    const hasContent = Boolean(submissionContent.trim());

    if (!hasContent && !hasFiles && !hasExistingFile && !hasTextAnswers) {
      alert('Please enter your written solution, question answers, or attach your assignment document.');
      return;
    }

    const formData = new FormData();
    if (submissionContent.trim()) {
      formData.append('content', submissionContent.trim());
    }
    if (submissionFiles.length > 0) {
      // The server accepts one attachment per submission (field name must be exactly "file")
      formData.append('file', submissionFiles[0]);
      if (submissionFiles.length > 1) {
        alert('Only one file can be attached per submission. Your first file will be submitted; combine the rest into a single PDF if needed.');
      }
    }

    // Attach structured question answers if present
    if (activeAssignment.questions && activeAssignment.questions.length > 0) {
      const answersPayload = activeAssignment.questions.map((q: any) => ({
        questionId: q.id || q._id,
        text: textAnswers[q.id || q._id] || '',
      }));
      formData.append('textAnswers', JSON.stringify(answersPayload));
    }

    setIsSubmitting(true);
    try {
      await api.post(`/assignments/${activeAssignment.id || activeAssignment._id}/submit`, formData);
      alert('Assignment submitted successfully!');
      setActiveAssignment(null);
      loadStudentAssignments();
    } catch (err: any) {
      alert(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {loadError && (/disabled by your school/i.test(loadError) ? (
        <div className="bg-violet-50 border border-violet-200 text-violet-900 text-sm rounded-xl p-4">
          <b>Assignments are switched off for your class.</b> Your school (principal or school admin) controls which modules each class can use. Ask them to turn this on if you need it.
        </div>
      ) : (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3">
          Could not load this section: {loadError}
        </div>
      ))}
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-blue-600" size={22} />
            Classroom Assignments & Studio Homework
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit coursework, track multi-criteria rubrics, OCR handwriting analysis, and teacher feedback.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            {assignments.filter((a) => a.submission).length} / {assignments.length} Submitted
          </span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-400">Loading assignments…</div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <FileText className="mx-auto text-slate-300 mb-3" size={40} />
          <h3 className="text-sm font-bold text-slate-700">No Assignments Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Your subject teachers have not published any assignments for your class section yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((a) => {
            const isGraded = a.submission?.status === 'GRADED';
            const isSubmitted = Boolean(a.submission);
            return (
              <div
                key={a.id || a._id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-blue-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {a.subjectName}
                    </span>
                    <span
                      className={`text-[11px] font-mono flex items-center gap-1 ${
                        a.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'
                      }`}
                    >
                      <Calendar size={12} /> Due {new Date(a.dueDate).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{a.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {a.description || a.detailedInstructions || 'Complete coursework assigned by faculty.'}
                  </p>

                  {/* Units / Chapters badge if available */}
                  {(a.curriculumUnits?.length > 0 || a.unitTitle) && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {a.unitTitle && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                          Unit: {a.unitTitle}
                        </span>
                      )}
                      {a.curriculumUnits?.map((u: string) => (
                        <span
                          key={u}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono"
                        >
                          {u}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Status Indicator */}
                  {isSubmitted ? (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-800 flex items-center gap-1">
                          <CheckCircle2 size={13} /> {isGraded ? 'Graded' : 'Submitted (Under Review)'}
                        </span>
                        {isGraded && (
                          <span className="font-mono font-bold text-emerald-700">
                            {a.submission.marksObtained} / {a.maxScore} marks
                          </span>
                        )}
                      </div>
                      {a.submission.feedback && (
                        <p className="text-[11px] text-slate-600 italic pt-1 border-t border-emerald-200/50">
                          Feedback: &quot;{a.submission.feedback}&quot;
                        </p>
                      )}
                    </div>
                  ) : a.isOverdue ? (
                    <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-1.5">
                      <AlertCircle size={14} /> Submission deadline passed
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-slate-500">
                      Maximum Score: <strong>{a.maxScore} marks</strong>
                      {a.questions?.length > 0 && <span> • {a.questions.length} Question(s)</span>}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenSubmissionModal(a)}
                    className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm ${
                      isSubmitted
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {isSubmitted ? (
                      <>
                        <FileText size={13} /> View Submission & Score
                      </>
                    ) : (
                      <>
                        <Upload size={13} /> Open Assignment & Submit
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── ADVANCED SUBMISSION MODAL ─────────────────────────────────────── */}
      {activeAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white text-slate-900 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-600/60 font-mono text-blue-200 uppercase">
                    {activeAssignment.subjectName}
                  </span>
                  <h3 className="font-bold text-base">{activeAssignment.title}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Due: {new Date(activeAssignment.dueDate).toLocaleString()} • Max Score: {activeAssignment.maxScore} marks
                </p>
              </div>
              <button
                onClick={() => setActiveAssignment(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Teacher Instructions & Deliverables */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
                <div>
                  <p className="font-bold text-slate-800 text-sm">Description & Objectives:</p>
                  <p className="text-slate-600 mt-0.5">
                    {activeAssignment.description || 'Follow all faculty guidelines and deliver on time.'}
                  </p>
                </div>

                {activeAssignment.detailedInstructions && (
                  <div>
                    <p className="font-bold text-slate-800">Detailed Instructions & Scope:</p>
                    <p className="text-slate-600 whitespace-pre-wrap font-mono mt-0.5 bg-white p-3 rounded-lg border border-slate-200">
                      {activeAssignment.detailedInstructions}
                    </p>
                  </div>
                )}

                {/* Attached Problem Sheets & Reference Materials */}
                {((activeAssignment.attachedDocuments && activeAssignment.attachedDocuments.length > 0) ||
                  (activeAssignment.attachments && activeAssignment.attachments.length > 0)) && (
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Paperclip size={14} className="text-blue-600" /> Attached Problem Sheets & Worksheets:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeAssignment.attachedDocuments?.map((doc: any, i: number) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleDownloadAttachment(doc.url || doc.fileUrl, doc.name || doc.title || `Problem Sheet ${i + 1}`)}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-900 transition"
                        >
                          <span className="truncate font-semibold">{doc.title || doc.name || `Problem Sheet ${i + 1}`}</span>
                          <Download size={14} className="text-blue-600 flex-shrink-0" />
                        </button>
                      ))}
                      {activeAssignment.attachments?.map((att: string, i: number) => (
                        <button
                          key={`legacy-${i}`}
                          type="button"
                          onClick={() => handleDownloadAttachment(att, `Reference Document ${i + 1}`)}
                          className="flex items-center justify-between p-2.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-900 transition"
                        >
                          <span className="truncate font-semibold">Reference Document #{i + 1}</span>
                          <Download size={14} className="text-blue-600 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Late Submission Policy Notice */}
                {activeAssignment.lateSubmissionPolicy && (
                  <div className="text-[11px] text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    <strong>Policy: </strong>
                    {activeAssignment.lateSubmissionPolicy === 'NOT_ALLOWED' && 'Late submissions are strictly rejected.'}
                    {activeAssignment.lateSubmissionPolicy === 'PENALTY_DEDUCTION' &&
                      `Submitting after due date incurs a ${activeAssignment.latePenaltyPercent || 10}% penalty deduction.`}
                    {activeAssignment.lateSubmissionPolicy === 'ACCEPT_WITHOUT_PENALTY' &&
                      'Late submissions accepted without academic penalty.'}
                  </div>
                )}
              </div>

              {/* Evaluation Card & Rubric Breakdown (if graded or evaluated) */}
              {activeAssignment.submission?.status === 'GRADED' && (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs space-y-3">
                  <div className="flex items-center justify-between font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5 text-sm">
                      <Award size={18} className="text-emerald-600" /> Graded Evaluation
                    </span>
                    <span className="font-mono text-base bg-emerald-600 text-white px-3 py-1 rounded-lg">
                      {activeAssignment.submission.marksObtained} / {activeAssignment.maxScore} marks
                    </span>
                  </div>

                  {activeAssignment.submission.feedback && (
                    <div className="text-emerald-800 bg-white p-3 rounded-lg border border-emerald-200">
                      <strong>Teacher Feedback:</strong> {activeAssignment.submission.feedback}
                    </div>
                  )}

                  {/* Rubric Score Breakdown Table */}
                  {activeAssignment.submission.rubricScores?.length > 0 && (
                    <div className="bg-white rounded-lg border border-emerald-200 overflow-hidden">
                      <div className="bg-emerald-100/60 px-3 py-1.5 font-bold text-emerald-900 text-xs flex justify-between items-center">
                        <span>Rubric Criteria Breakdown</span>
                        <button
                          type="button"
                          onClick={() => setShowRubricDetails(!showRubricDetails)}
                          className="text-[11px] text-emerald-800 underline flex items-center gap-0.5"
                        >
                          {showRubricDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {showRubricDetails ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      {showRubricDetails && (
                        <table className="w-full text-[11px] text-left">
                          <thead className="bg-slate-50 border-b border-emerald-100 text-slate-600">
                            <tr>
                              <th className="p-2">Criterion</th>
                              <th className="p-2 text-right">Awarded</th>
                              <th className="p-2">Teacher Note</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {activeAssignment.submission.rubricScores.map((r: any, idx: number) => (
                              <tr key={idx}>
                                <td className="p-2 font-semibold text-slate-700">{r.criterionName}</td>
                                <td className="p-2 text-right font-mono font-bold text-emerald-700">
                                  {r.awardedScore} / {r.maxScore}
                                </td>
                                <td className="p-2 text-slate-500 italic">{r.feedback || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* Assignment Questions (if configured) */}
              {activeAssignment.questions && activeAssignment.questions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <HelpCircle size={14} className="text-blue-600" /> Assignment Questions ({activeAssignment.questions.length})
                  </h4>
                  <div className="space-y-3">
                    {activeAssignment.questions.map((q: any, idx: number) => {
                      const qId = q.id || q._id;
                      return (
                        <div key={qId} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-800">
                              Question {idx + 1} ({q.marks || 1} mark{q.marks > 1 ? 's' : ''})
                            </span>
                            {q.bloomsLevel && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                                {q.bloomsLevel}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-700 font-medium">{q.questionText}</p>
                          <textarea
                            rows={3}
                            value={textAnswers[qId] || ''}
                            onChange={(e) => setTextAnswers({ ...textAnswers, [qId]: e.target.value })}
                            placeholder="Type your answer for this question…"
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-mono bg-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submission Form */}
              <form onSubmit={handleSubmitAssignment} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Written Solution / Notes (Optional if uploading document)
                  </label>
                  <textarea
                    rows={4}
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    placeholder="Type your general response, remarks, or answers here…"
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Attach Homework / PDF / Document (Supports PDF, DOCX, Images)
                  </label>
                  <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center hover:bg-slate-100 transition">
                    <input
                      type="file"
                      id="assignment-file-upload"
                      multiple
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="assignment-file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                    >
                      <Upload size={20} className="text-blue-600" />
                      <span className="text-xs font-bold text-slate-700">Click to Select Files</span>
                      <span className="text-[11px] text-slate-400">PDF, DOCX, ZIP, or high-res photos up to 25MB</span>
                    </label>
                  </div>

                  {/* Selected Files List */}
                  {submissionFiles.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-700">Selected for Upload:</p>
                      {submissionFiles.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900"
                        >
                          <span className="truncate font-mono">
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Previously Uploaded File */}
                  {activeAssignment.submission?.fileUrl && (
                    <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Paperclip size={14} className="text-emerald-600" /> Previously submitted:
                        <button
                          type="button"
                          onClick={() => handleDownloadAttachment(activeAssignment.submission.fileUrl, activeAssignment.submission.originalFilename || 'Document.pdf')}
                          className="underline font-bold"
                        >
                          {activeAssignment.submission.originalFilename || 'Document.pdf'}
                        </button>
                      </span>
                      <span className="text-[10px] text-emerald-600 font-mono">On Record</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setActiveAssignment(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm"
                  >
                    {isSubmitting
                      ? 'Submitting Work…'
                      : activeAssignment.submission
                      ? 'Update / Resubmit Work'
                      : 'Submit Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

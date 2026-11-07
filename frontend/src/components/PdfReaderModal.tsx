import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BookReader, BookReaderChapter } from './reader/BookReader';
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';

export interface DetailedTopic {
  id?: string;
  topicNumber: number;
  title: string;
  startPage?: number;
  learningObjectives?: string[];
}

export interface DetailedChapter {
  id?: string;
  chapterNumber: number;
  title: string;
  titleNepali?: string;
  startPage: number;
  endPage: number;
  topics?: DetailedTopic[];
}

export interface TextbookData {
  id: string;
  title: string;
  titleNepali?: string;
  gradeNumber?: number;
  medium: string;
  edition?: string;
  publicationYear?: number;
  pageCount?: number;
  /** Overrides the signed-URL endpoint (used for curriculum documents / teaching materials). */
  accessPath?: string;
  detailedChapters?: DetailedChapter[];
  chapters?: Array<{
    chapterNumber: number;
    name: string;
    nameNepali?: string;
    startPage: number;
    endPage: number;
    topics?: Array<{ title: string; startPage?: number }>;
  }>;
}

interface PdfReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  textbook: TextbookData | null;
  /** Launches the Smart Board through a classroom session (teachers). Without it the button is hidden. */
  onOpenSmartBoard?: (page: number) => void;
  /** Page to open first (used when jumping from an AI source reference). */
  initialPage?: number;
}

export const PdfReaderModal: React.FC<PdfReaderModalProps> = ({
  isOpen,
  onClose,
  textbook,
  onOpenSmartBoard,
  initialPage,
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const tbId = textbook?.id || (textbook as any)?._id;

  useEffect(() => {
    setSignedUrl(null);
    setAccessError(null);
    if (!isOpen || !tbId) return;

    setLoading(true);
    api
      .post<{ url: string }>(textbook?.accessPath || `/curriculum/textbooks/${tbId}/access`)
      .then((r) => {
        let fullUrl = r.url;
        if (fullUrl.startsWith('/')) {
          fullUrl = `${window.location.origin}${fullUrl}`;
        }
        setSignedUrl(fullUrl);
      })
      .catch((e) => {
        setAccessError(e.message || 'You do not have access to this textbook.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, tbId]);

  if (!isOpen || !textbook) return null;

  // Format chapters for BookReader
  const formattedChapters: BookReaderChapter[] = ((textbook.detailedChapters || []).length > 0
    ? (textbook.detailedChapters as DetailedChapter[])
    : (textbook.chapters || []).map((ch) => ({
        chapterNumber: ch.chapterNumber,
        title: ch.name,
        titleNepali: ch.nameNepali,
        startPage: ch.startPage,
        endPage: ch.endPage,
        topics: ch.topics || [],
      }))
  ).map((ch) => ({
    chapterNumber: ch.chapterNumber,
    title: ch.title,
    titleNepali: ch.titleNepali,
    startPage: ch.startPage,
    endPage: ch.endPage,
    topics: (ch.topics || []).map((t) => ({
      title: t.title,
      startPage: t.startPage,
    })),
  }));

  // Loading state modal
  if (loading || (!signedUrl && !accessError)) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-md">
        <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center max-w-sm w-full mx-4 shadow-2xl">
          <Loader2 className="animate-spin text-indigo-400 mx-auto mb-4" size={36} />
          <h3 className="text-base font-bold text-slate-900 mb-1">Authenticating Access</h3>
          <p className="text-xs text-slate-500 mb-4">Verifying institution entitlement & generating secure stream…</p>
          <div className="text-[11px] font-mono text-indigo-300 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 truncate">
            {textbook.title}
          </div>
        </div>
      </div>
    );
  }

  // Error state modal
  if (accessError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-md">
        <div className="p-8 rounded-2xl bg-white border border-rose-900/60 text-center max-w-md w-full mx-4 shadow-2xl">
          <AlertTriangle className="text-rose-600 mx-auto mb-4" size={40} />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Textbook Access Restricted</h3>
          <p className="text-sm text-slate-600 mb-6">{accessError}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-xs transition flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BookReader
      url={signedUrl!}
      title={textbook.title}
      titleNepali={textbook.titleNepali}
      gradeNumber={textbook.gradeNumber}
      medium={textbook.medium}
      docId={tbId || textbook.id}
      onClose={onClose}
      onOpenSmartBoard={onOpenSmartBoard}
      initialPage={initialPage}
      chapters={formattedChapters}
    />
  );
};

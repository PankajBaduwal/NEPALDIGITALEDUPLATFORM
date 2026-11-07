import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Megaphone, CalendarCheck, FileText, AlertTriangle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { api } from '@/services/api';
import { subscribe } from '@/services/realtime';

export interface INotificationItem {
  id: string;
  title: string;
  message: string;
  type?: 'ATTENDANCE' | 'EXAM' | 'ANNOUNCEMENT' | 'ACADEMIC' | 'SYSTEM';
  read?: boolean;
  createdAt: string;
  link?: string;
}

const READ_KEY = 'nepal_edu_read_extra';
const loadRead = (): Set<string> => { try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || '[]')); } catch { return new Set(); } };

/**
 * `extraItems` lets a dashboard add its own feed (e.g. school announcements) to the bell; they are marked read
 * on this device only. `onItemClick` lets the host screen jump to the matching page.
 */
export function NotificationCenter({ extraItems = [], onItemClick }: { extraItems?: INotificationItem[]; onItemClick?: (item: INotificationItem) => void }) {
  const [readExtra, setReadExtra] = useState<Set<string>>(loadRead);
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const [notifications, setNotifications] = useState<INotificationItem[]>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    api.get('/notifications')
      .then((res: any) => {
        const data = Array.isArray(res) ? res : (res?.items || res?.notifications);
        setNotifications(
          Array.isArray(data)
            ? data.map((n: any) => ({
                ...n,
                id: String(n.id || n._id),
                read: n.read ?? n.isRead ?? false,
                type: (
                  {
                    ATTENDANCE_WARNING: 'ATTENDANCE',
                    MARKS_PUBLISHED: 'EXAM',
                    ANNOUNCEMENT: 'ANNOUNCEMENT',
                    ASSIGNMENT_NEW: 'ACADEMIC',
                    ASSIGNMENT_DEADLINE: 'ACADEMIC',
                    TIMETABLE_PUBLISHED: 'ACADEMIC',
                  } as Record<string, INotificationItem['type']>
                )[n.type] || 'SYSTEM',
              }))
            : []
        );
      })
      .catch((error) => {
        console.error('Failed to load notifications', error);
        setNotifications([]);
      });
  }, []);

  // New notifications arrive live
  useEffect(() => {
    return subscribe(['notification:new'], (n: any) => {
      const item: INotificationItem = {
        ...n,
        id: String(n.id || n._id),
        read: false,
        type: ({ ATTENDANCE_WARNING: 'ATTENDANCE', MARKS_PUBLISHED: 'EXAM', ANNOUNCEMENT: 'ANNOUNCEMENT', ASSIGNMENT_NEW: 'ACADEMIC', ASSIGNMENT_DEADLINE: 'ACADEMIC', TIMETABLE_PUBLISHED: 'ACADEMIC' } as Record<string, INotificationItem['type']>)[n.type] || 'SYSTEM',
      };
      setNotifications((prev) => (prev.some((x) => x.id === item.id) ? prev : [item, ...prev]));
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const merged: INotificationItem[] = [
    ...notifications,
    ...extraItems.filter((e) => !notifications.some((n) => n.id === e.id)).map((e) => ({ ...e, read: readExtra.has(e.id) })),
  ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const unreadCount = merged.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    const all = new Set([...readExtra, ...extraItems.map((e) => e.id)]);
    setReadExtra(all);
    try { localStorage.setItem(READ_KEY, JSON.stringify([...all])); } catch { /* ignore */ }
    api.post('/notifications/mark-all-read', {}).catch(() => {});
  };

  const markOneRead = (id: string) => {
    if (extraItems.some((e) => e.id === id)) {
      const all = new Set([...readExtra, id]);
      setReadExtra(all);
      try { localStorage.setItem(READ_KEY, JSON.stringify([...all])); } catch { /* ignore */ }
      return;
    }
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    api.patch(`/notifications/${id}/read`, {}).catch(() => {});
  };

  const filtered = merged.filter((n) => (activeFilter === 'UNREAD' ? !n.read : true));

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
        aria-label="Open notifications"
      >
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex border-b border-slate-100 px-3 py-1.5 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter('ALL')}
              className={cn(
                'px-2.5 py-1 rounded-md font-semibold transition-colors',
                activeFilter === 'ALL' ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('UNREAD')}
              className={cn(
                'px-2.5 py-1 rounded-md font-semibold transition-colors',
                activeFilter === 'UNREAD' ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              Unread only
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No notifications to display</div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => { markOneRead(item.id); if (onItemClick) { onItemClick(item); setIsOpen(false); } }}
                  className={cn(
                    'p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start',
                    !item.read && 'bg-emerald-50/40'
                  )}
                >
                  <div
                    className={cn(
                      'size-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5',
                      item.type === 'EXAM' && 'bg-blue-50 text-blue-600 border-blue-200',
                      item.type === 'ATTENDANCE' && 'bg-amber-50 text-amber-600 border-amber-200',
                      item.type === 'ACADEMIC' && 'bg-emerald-50 text-emerald-600 border-emerald-200',
                      (!item.type || item.type === 'ANNOUNCEMENT' || item.type === 'SYSTEM') &&
                        'bg-slate-100 text-slate-600 border-slate-200'
                    )}
                  >
                    {item.type === 'EXAM' ? (
                      <FileText className="size-4" />
                    ) : item.type === 'ATTENDANCE' ? (
                      <CalendarCheck className="size-4" />
                    ) : item.type === 'ACADEMIC' ? (
                      <AlertTriangle className="size-4" />
                    ) : (
                      <Megaphone className="size-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('text-xs font-semibold text-slate-900 truncate', !item.read && 'font-bold')}>
                        {item.title}
                      </p>
                      {!item.read && <span className="size-2 rounded-full bg-emerald-600 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{item.message}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

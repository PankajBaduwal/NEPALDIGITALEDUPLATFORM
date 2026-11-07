import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface Status {
  totals: { books: number; indexed: number; pages: number; pagesWithText: number; pagesEmpty: number; chunks: number };
  statusCounts: Record<string, number>;
  byGrade: Array<{ label: string; grade: number; books: number; indexed: number; pages: number; chunks: number }>;
  needsAttention: Array<{ title: string; grade?: number; status: string; error?: string; scanned?: boolean }>;
  embeddingModel: string;
  geminiConfigured: boolean;
}

const card: React.CSSProperties = { background: '#fff', border: '1px solid #dcebe6', borderRadius: 12, padding: 16 };
const num = (n: number) => n.toLocaleString();

export const AIIndexStatusPanel: React.FC = () => {
  const [data, setData] = useState<Status | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await api.get<Status>('/ai/index-status'));
    } catch (e: any) {
      setError(e.message || 'Could not load the index status.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  if (loading && !data) return <div style={card}>Loading index status…</div>;
  if (error) return <div style={{ ...card, color: '#b91c1c' }}>{error}</div>;
  if (!data) return null;
  const t = data.totals;
  const pct = t.books ? Math.round((t.indexed / t.books) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
        {[
          ['Textbooks searchable', `${t.indexed} of ${t.books} (${pct}%)`],
          ['Pages', num(t.pages)],
          ['Pages with text', num(t.pagesWithText)],
          ['Searchable passages', num(t.chunks)],
        ].map(([k, v]) => (
          <div key={k} style={card}>
            <div style={{ fontSize: 12, color: '#5f736f', fontWeight: 700 }}>{k}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0e3e3b', marginTop: 4 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13, color: '#2f4f4c' }}>
        <span>
          Embedding model: <b>{data.embeddingModel}</b>
        </span>
        <span>
          Gemini key: <b style={{ color: data.geminiConfigured ? '#0f5f55' : '#b91c1c' }}>{data.geminiConfigured ? 'configured' : 'missing'}</b>
        </span>
        {Object.entries(data.statusCounts).map(([k, v]) => (
          <span key={k}>
            {k}: <b>{v}</b>
          </span>
        ))}
        <button onClick={load} style={{ marginLeft: 'auto', fontWeight: 700, color: '#117a6b' }}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      <div style={{ ...card, overflowX: 'auto' }}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>By class</div>
        <table style={{ width: '100%', fontSize: 13, textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ color: '#5f736f' }}>
              <th style={{ padding: 6 }}>Class</th>
              <th>Books</th>
              <th>Searchable</th>
              <th>Pages</th>
              <th>Passages</th>
            </tr>
          </thead>
          <tbody>
            {data.byGrade.map((g) => (
              <tr key={g.label} style={{ borderTop: '1px solid #ebf5f1' }}>
                <td style={{ padding: 6, fontWeight: 700 }}>{g.label}</td>
                <td>{g.books}</td>
                <td style={{ color: g.indexed === g.books ? '#0f5f55' : '#4c3fa8', fontWeight: 700 }}>
                  {g.indexed} / {g.books}
                </td>
                <td>{num(g.pages)}</td>
                <td>{num(g.chunks)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Needs attention ({data.needsAttention.length})</div>
        {data.needsAttention.length === 0 && <div style={{ fontSize: 13, color: '#0f5f55' }}>Every textbook is searchable.</div>}
        {data.needsAttention.map((d, i) => (
          <div key={i} style={{ padding: '8px 0', borderTop: i ? '1px solid #ebf5f1' : undefined, fontSize: 13 }}>
            <b>{d.title}</b> {d.grade ? `· Class ${d.grade}` : ''} · <span style={{ color: '#4c3fa8' }}>{d.status}</span>
            {d.scanned ? ' · scanned book' : ''}
            {d.error && <div style={{ color: '#5f736f', fontSize: 12 }}>{d.error}</div>}
          </div>
        ))}
        <div style={{ fontSize: 12, color: '#5f736f', marginTop: 10 }}>
          To process these, run <code>npm run rag:ingest -- retry</code> in the backend folder.
        </div>
      </div>
    </div>
  );
};

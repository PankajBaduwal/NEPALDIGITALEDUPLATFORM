/**
 * HTTP client for the code ported from KPRIET. KPRIET's own client used axios and cookie sessions; here the same
 * `api.get/post/put/patch/delete` surface talks to this platform's API (/api/v1) with the signed-in user's token.
 * Responses keep the same envelope ({ success, message, data }), so the ported services work unchanged.
 */
import { AppApiError } from './AppApiError';

const BASE = '/api/v1';

function token(): string {
  try {
    return localStorage.getItem('nepal_edu_token') || '';
  } catch {
    return '';
  }
}

interface Opts {
  params?: Record<string, unknown>;
  signal?: AbortSignal;
}

async function request<T>(method: string, url: string, body?: unknown, opts: Opts = {}): Promise<{ success: boolean; message?: string; data: T }> {
  let full = BASE + url;
  if (opts.params) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(opts.params)) if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    const s = qs.toString();
    if (s) full += (full.includes('?') ? '&' : '?') + s;
  }
  const headers: Record<string, string> = { Accept: 'application/json' };
  const t = token();
  if (t) headers.Authorization = `Bearer ${t}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    res = await fetch(full, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal: opts.signal });
  } catch {
    throw new AppApiError({ code: 'NETWORK_ERROR', message: "Can't reach the server. Check your connection and try again." });
  }
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || json?.success === false) {
    throw new AppApiError({
      status: res.status,
      code: json?.error?.code || (res.status === 401 ? 'UNAUTHORIZED' : 'REQUEST_FAILED'),
      message: json?.message || json?.error?.message || `Request failed (${res.status})`,
      details: json?.error?.details,
    });
  }
  return json;
}

export const api = {
  get: <T = any>(url: string, opts?: Opts) => request<T>('GET', url, undefined, opts),
  post: <T = any>(url: string, body?: unknown, opts?: Opts) => request<T>('POST', url, body ?? {}, opts),
  put: <T = any>(url: string, body?: unknown, opts?: Opts) => request<T>('PUT', url, body ?? {}, opts),
  patch: <T = any>(url: string, body?: unknown, opts?: Opts) => request<T>('PATCH', url, body ?? {}, opts),
  delete: <T = any>(url: string, opts?: Opts) => request<T>('DELETE', url, undefined, opts),
};

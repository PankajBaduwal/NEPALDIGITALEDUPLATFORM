const API_BASE = '/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('nepal_edu_token');
  }

  setToken(token: string) {
    localStorage.setItem('nepal_edu_token', token);
  }

  clearToken() {
    localStorage.removeItem('nepal_edu_token');
    localStorage.removeItem('nepal_edu_user');
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const assignmentUploadPrefix = '/uploads/assignments/';
    const downloadEndpoint = endpoint.startsWith(assignmentUploadPrefix)
      ? `/assignments/files/${encodeURIComponent(endpoint.slice(assignmentUploadPrefix.length))}`
      : endpoint;
    const response = await fetch(`${API_BASE}${downloadEndpoint}`, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> & { message?: string } = await response.json().catch(() => ({ success: false }) as any);

    if (!response.ok || !data.success) {
      // The backend puts the human-readable message at the top level and the code under `error`.
      const rawErr: any = data.error;
      const errorMsg = data.message || (typeof rawErr === 'string' ? rawErr : rawErr?.message) || response.statusText || 'Request failed';
      const error: any = new Error(errorMsg);
      error.code = (typeof rawErr === 'object' && rawErr?.code) || 'API_ERROR';
      error.details = typeof rawErr === 'object' ? rawErr?.details : undefined;
      throw error;
    }

    return data.data as T;
  }

  get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  }

  postFormData<T = any>(endpoint: string, formData: FormData) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  }

  put<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async downloadBlob(endpoint: string, filename: string): Promise<void> {
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const api = new ApiService();

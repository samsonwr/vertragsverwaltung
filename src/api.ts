const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

export const api = {
  // Verträge
  getVertraege: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/vertraege${qs}`);
  },
  getVertrag: (id: string) => request<any>(`/vertraege/${id}`),
  createVertrag: (data: any) => request<any>('/vertraege', { method: 'POST', body: JSON.stringify(data) }),
  updateVertrag: (id: string, data: any) => request<any>(`/vertraege/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVertrag: (id: string) => request<any>(`/vertraege/${id}`, { method: 'DELETE' }),

  // Ereignisse
  getEreignisse: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/ereignisse${qs}`);
  },
  getHandlungsbedarf: () => request<any[]>('/ereignisse/handlungsbedarf'),
  createEreignis: (data: any) => request<any>('/ereignisse', { method: 'POST', body: JSON.stringify(data) }),
  updateEreignis: (id: string, data: any) => request<any>(`/ereignisse/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEreignis: (id: string) => request<any>(`/ereignisse/${id}`, { method: 'DELETE' }),

  // Historie
  getHistorie: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any[]>(`/historie${qs}`);
  },

  // Dashboard
  getDashboardStats: () => request<any>('/dashboard/stats'),

  // Benutzer
  getBenutzer: () => request<any[]>('/benutzer'),
  getAktuellerBenutzer: () => request<any>('/benutzer/aktuell'),

  // Export/Import
  exportDb: async () => {
    const res = await fetch(`${BASE}/export`);
    if (!res.ok) throw new Error('Export fehlgeschlagen');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `vertragsverwaltung-export-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
  importDb: (data: any) => request<any>('/import', { method: 'POST', body: JSON.stringify(data) }),
};

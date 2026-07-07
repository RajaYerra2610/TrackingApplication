const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const userId = localStorage.getItem('userId');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      ...headers,
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const api = {
  // Auth
  auth: {
    login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Daily Tracker
  daily: {
    getAll: () => request<any[]>('/daily'),
    get: (id: string) => request<any>(`/daily/${id}`),
    create: (data: any) => request<any>('/daily', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/daily/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/daily/${id}`, { method: 'DELETE' }),
    search: (params: Record<string, string>) => {
      const query = new URLSearchParams(params).toString();
      return request<any[]>(`/daily/search/query?${query}`);
    },
  },

  // DSA Problems
  dsa: {
    getAll: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return request<any[]>(`/dsa${query}`);
    },
    get: (id: string) => request<any>(`/dsa/${id}`),
    create: (data: any) => request<any>('/dsa', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/dsa/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/dsa/${id}`, { method: 'DELETE' }),
    import: (problems: any[]) => request<any>('/dsa/import', { method: 'POST', body: JSON.stringify({ problems }) }),
    stats: () => request<any>('/dsa/stats/summary'),
  },

  // Concepts
  concepts: {
    getAll: (subject?: string) => {
      const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
      return request<any[]>(`/concepts${query}`);
    },
    create: (data: any) => request<any>('/concepts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/concepts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/concepts/${id}`, { method: 'DELETE' }),
    subjects: () => request<any[]>('/concepts/subjects/all'),
  },

  // Roadmaps
  roadmaps: {
    get: (name: string) => request<any[]>(`/roadmaps/${name}`),
    toggle: (id: string) => request<any>(`/roadmaps/${id}/toggle`, { method: 'PUT' }),
    update: (id: string, data: any) => request<any>(`/roadmaps/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    progress: () => request<any[]>('/roadmaps/progress/all'),
    create: (data: any) => request<any>('/roadmaps', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/roadmaps/${id}`, { method: 'DELETE' }),
  },

  // Revisions
  revisions: {
    getAll: (status?: string) => {
      const query = status ? `?status=${status}` : '';
      return request<any[]>(`/revisions${query}`);
    },
    upcoming: () => request<any[]>('/revisions/upcoming'),
    missed: () => request<any[]>('/revisions/missed'),
    complete: (id: string) => request<any>(`/revisions/${id}/complete`, { method: 'PUT' }),
    generate: (data: any) => request<any>('/revisions/generate', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/revisions/${id}`, { method: 'DELETE' }),
  },

  // Mock Interviews
  mockInterviews: {
    getAll: () => request<any[]>('/mock-interviews'),
    create: (data: any) => request<any>('/mock-interviews', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/mock-interviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/mock-interviews/${id}`, { method: 'DELETE' }),
  },

  // Job Applications
  jobs: {
    getAll: (status?: string) => {
      const query = status ? `?status=${status}` : '';
      return request<any[]>(`/jobs${query}`);
    },
    create: (data: any) => request<any>('/jobs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/jobs/${id}`, { method: 'DELETE' }),
    stats: () => request<any>('/jobs/stats/pipeline'),
  },

  // Resumes
  resumes: {
    getAll: () => request<any[]>('/resumes'),
    create: (data: any) => request<any>('/resumes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/resumes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/resumes/${id}`, { method: 'DELETE' }),
  },

  // GitHub Projects
  github: {
    getAll: () => request<any[]>('/github'),
    create: (data: any) => request<any>('/github', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/github/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/github/${id}`, { method: 'DELETE' }),
  },

  // Analytics
  analytics: {
    dashboard: () => request<any>('/analytics/dashboard'),
    weekly: () => request<any[]>('/analytics/weekly'),
    monthly: () => request<any[]>('/analytics/monthly'),
    heatmap: () => request<any[]>('/analytics/heatmap'),
    subjects: () => request<any[]>('/analytics/subjects'),
  },

  // Gamification
  gamification: {
    xp: () => request<any>('/gamification/xp'),
    addXP: (amount: number, reason: string) =>
      request<any>('/gamification/xp/add', { method: 'POST', body: JSON.stringify({ amount, reason }) }),
    achievements: () => request<any[]>('/gamification/achievements'),
  },

  // Settings
  settings: {
    get: () => request<any>('/settings'),
    update: (id: string, data: any) => request<any>(`/settings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  // Notifications
  notifications: {
    getAll: () => request<any[]>('/notifications'),
    unreadCount: () => request<{ count: number }>('/notifications/unread'),
    markRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => request<any>('/notifications/read-all', { method: 'PUT' }),
    create: (data: any) => request<any>('/notifications', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/notifications/${id}`, { method: 'DELETE' }),
  },

  // Export/Import
  export: {
    json: (table: string) => request<any>(`/export/json/${table}`),
    all: () => request<any>('/export/all'),
    excel: (table: string) => {
      window.open(`${API_BASE}/export/excel/${table}`, '_blank');
    },
    import: (data: any) => request<any>('/export/import', { method: 'POST', body: JSON.stringify(data) }),
  },
};

const API_BASE = 'http://localhost:8000/api';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  dashboard: {
    getStats: () => fetchAPI('/dashboard/stats'),
  },
  materials: {
    search: (query: string, limit?: number) =>
      fetchAPI(`/materials/search?query=${encodeURIComponent(query)}&limit=${limit || 5}`),
    upload: (title: string, content: string) =>
      fetchAPI('/materials', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      }),
  },
};

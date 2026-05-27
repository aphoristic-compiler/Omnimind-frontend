const API_BASE = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api` 
  : 'http://localhost:8000/api';

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
      upload: (formData: FormData) =>
      fetchAPI('/materials/upload', {
        method: 'POST',
        body: formData,
      }),
  },
};

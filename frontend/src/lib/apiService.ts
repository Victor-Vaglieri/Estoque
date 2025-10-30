// lib/apiService.ts
// TODO: Use Cookies HTTP Only em produção em vez de sessionStorage
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token'); 
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!token) {
    throw new Error('Usuário não autenticado.');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    window.location.href = '/login'; 
  }
  return res;
}
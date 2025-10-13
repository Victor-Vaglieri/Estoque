// lib/apiService.ts (Novo arquivo)

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  // 1. Pega o token salvo
  const token = localStorage.getItem('token'); // TODO: Use Cookies HTTP Only em produção
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!token) {
    throw new Error('Usuário não autenticado.');
  }

  // 2. Anexa o cabeçalho de Autorização
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 3. Faz a requisição
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // 4. Trata erros (se o token expirar, por exemplo)
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('token');
    window.location.href = '/login'; 
  }

  // ... restante da lógica
  return res;
}
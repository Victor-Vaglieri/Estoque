// lib/authService.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL; // Variável de Ambiente

export async function loginUser(login: string, senha: string): Promise<string> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ login, senha }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Credenciais inválidas.');
  }

  if (!data || typeof data.token !== 'string' || data.token.length === 0) {
    throw new Error('A resposta da autenticação não incluiu um token válido.');
  }
  return data.token;
}
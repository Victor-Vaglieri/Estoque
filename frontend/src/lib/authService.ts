// lib/authService.ts
const API_URL = "http://localhost:3001"; // Variável de Ambiente é melhor!

// lib/authService.ts

export async function loginUser(login: string, senha: string): Promise<string> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ login, senha }),
  });

  const data = await response.json();

  // Se a resposta da API não for 'ok' (status 2xx), lance o erro que veio da API
  if (!response.ok) {
    // A mensagem de erro pode vir em data.message, data.error, etc.
    throw new Error(data.message || 'Credenciais inválidas.');
  }

  // Se a resposta foi 'ok', mas por algum motivo não veio um token, lance um erro.
  // ISSO PREVINE O RETORNO DE 'UNDEFINED'!
  if (!data || typeof data.token !== 'string' || data.token.length === 0) {

    throw new Error('A resposta da autenticação não incluiu um token válido.');
  }

  // Se tudo deu certo, retorne o token
  return data.token;
}
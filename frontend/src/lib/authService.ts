// lib/authService.ts
const API_URL = "http://localhost:3001"; // Variável de Ambiente é melhor!

export async function loginUser(login: string, senha: string): Promise<string> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, senha }),
  });

  if (!res.ok) {
    // Lança um erro para ser capturado no handleSubmit
    throw new Error("Falha no login. Verifique as credenciais.");
  }

  const data = await res.json();
  return data.token as string;
}
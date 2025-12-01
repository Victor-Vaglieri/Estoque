const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function loginUser(login: string, senha: string): Promise<string> {
  // Debug: Ajuda a ver no console do navegador se a URL está certa
  console.log("URL de Login:", `${API_URL}/auth/login`);

  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ login, senha }),
  });

  // --- MUDANÇA CRUCIAL: Ler como texto primeiro ---
  // Isso evita o crash "Unexpected end of JSON input"
  const textData = await response.text();

  // Se a resposta não for OK (status 200-299)
  if (!response.ok) {
    let errorMessage = 'Credenciais inválidas.';
    try {
      // Tenta ler a mensagem de erro do JSON do backend
      const errorJson = JSON.parse(textData);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      // Se não for JSON (ex: HTML de erro do Vercel/Railway), mostra o código do erro
      console.error("Erro bruto do servidor:", textData);
      errorMessage = `Erro no servidor (Status ${response.status})`;
    }
    throw new Error(errorMessage);
  }

  // Se chegou aqui, é sucesso. Agora fazemos o parse seguro.
  let data;
  try {
    data = JSON.parse(textData);
  } catch {
    throw new Error("Servidor respondeu OK, mas enviou dados inválidos.");
  }

  if (!data || typeof data.token !== 'string' || data.token.length === 0) {
    throw new Error('A resposta da autenticação não incluiu um token válido.');
  }
  
  return data.token;
}
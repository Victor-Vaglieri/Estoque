// lib/jwt.ts

import { Funcao } from "./types"; // Crie este arquivo de tipos na seção 3!

// Função utilitária para decodificar o token JWT (apenas o payload, sem verificar a assinatura)
export function decodeToken(token: string): { userId: number, login: string, funcoes: Funcao[] } | null {
  try {
    // O payload é a segunda parte do token, separada por '.'
    const base64Url = token.split('.')[1];

    // Converte de base64url para string JSON
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);

    const funcoesArray = Array.isArray(payload.funcoes)
      ? payload.funcoes as Funcao[]
      : []; // Se não for um array, usa um array vazio para evitar erros

    // O NestJS geralmente inclui 'sub' (subject/id do usuário) e 'funcao'
    return {
      userId: payload.sub, // 'sub' é o padrão para o ID do usuário em JWT
      login: payload.login,
      funcoes: funcoesArray,
    };

  } catch (error) {
    // Se o token for inválido, malformado ou não puder ser decodificado
    console.error("Erro ao decodificar o token:", error);
    return null;
  }
}
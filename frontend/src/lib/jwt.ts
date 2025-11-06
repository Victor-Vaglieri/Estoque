// lib/jwt.ts 

import { UserData } from "./types";

export function decodeToken(token: string | null): UserData | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      throw new Error("Token JWT inválido: sem payload.");
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    if (!payload || typeof payload.sub !== 'number' || typeof payload.username !== 'string') {
      throw new Error("Payload do JWT não contém os campos necessários (sub, login).");
    }

    return {
      sub: payload.sub,
      login: payload.username,
      funcoes: Array.isArray(payload.funcoes) ? payload.funcoes : [],
    };

  } catch (error) {
    console.error("Erro ao decodificar o token:", error);
    return null;
  }
}
// app/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { decodeToken } from '@/lib/jwt';
import { UserData, AuthContextType } from '@/lib/types'; // Assumindo que seu tipo está correto


// 1. Criação do Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Componente Provedor (Provider)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  // RENOMEADO: de 'isLoading' para 'loading' para padronização
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedUser = decodeToken(token);
        if (decodedUser) {
          setUser(decodedUser);
        } else {
          // Se o token for inválido/expirado, limpe-o
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      // Em caso de qualquer erro, garanta que não há usuário
      setUser(null);
      console.error("Falha ao verificar o token de autenticação:", error);
    } finally {
      // Ao final de tudo (com ou sem token), o carregamento inicial termina
      setLoading(false);
    }
  }, []); // O array vazio [] garante que isso só rode uma vez

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decodedUser = decodeToken(token);
    console.log("Token recebido pelo AuthContext:", token);
    if (decodedUser) {
      setUser(decodedUser);
      router.push('/'); // Redireciona para a página inicial do dashboard
    } else {
      console.error("Token recebido no login é inválido.");
      localStorage.removeItem('token');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  // O valor agora provê a propriedade 'loading'
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Hook Customizado para Uso Simples
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
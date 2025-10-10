// app/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { decodeToken } from '@/lib/jwt';
import { UserData, AuthContextType, Funcao } from '@/lib/types';

// 1. Criação do Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Componente Provedor (Provider)
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- A. Lógica para Carregar/Verificar o Token (AO CARREGAR A APLICAÇÃO) ---
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedUser = decodeToken(token);
        if (decodedUser) {
          setUser(decodedUser);
        } else {
          localStorage.removeItem('token');
        }
      }
    } finally {
      setIsLoading(false); // <-- 2. Diz que o carregamento terminou, com ou sem token
    }
  }, []);

  // --- B. Função de Login (Chamada pelo seu page.tsx) ---
  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decodedUser = decodeToken(token);
    if (decodedUser) {
      setUser(decodedUser);
      router.push('/inicio'); // Redireciona após o login
    } else {
      console.error("Token recebido é inválido.");
      localStorage.removeItem('token');
    }
  };

  // --- C. Função de Logout ---
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login'); // Redireciona para a página de login
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Hook Customizado para Uso Simples
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
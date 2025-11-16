
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { decodeToken } from '@/lib/jwt';
import { UserData, AuthContextType } from '@/lib/types'; 

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  
  const [loading, setLoading] = useState(true); 

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
    } catch (error) {
      setUser(null);
      console.error("Falha ao verificar o token de autenticação:", error);
    } finally {
      setLoading(false);
    }
  }, []); 

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const decodedUser = decodeToken(token);
    console.log("Token recebido pelo AuthContext:", token);
    if (decodedUser) {
      setUser(decodedUser);
      router.push('/'); 
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

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
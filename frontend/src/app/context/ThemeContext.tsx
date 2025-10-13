// app/context/ThemeContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Definir o tipo para o valor do contexto
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// 2. Criar o Contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 3. Criar o Componente Provedor (Provider)
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // 'light' como padrão inicial

  // Este useEffect roda APENAS UMA VEZ no cliente para definir o tema inicial
  useEffect(() => {
    // Verifica se há um tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    
    // Se houver, usa ele. Se não, detecta o tema do sistema.
    const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light');
    
    setTheme(initialTheme);
  }, []);

  // Este useEffect roda SEMPRE que o 'theme' mudar
  useEffect(() => {
    // 1. Aplica o tema ao HTML
    document.documentElement.setAttribute('data-theme', theme);
    // 2. Salva a escolha no localStorage para persistir
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Função para alternar o tema
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = {
    theme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// 4. Hook customizado para facilitar o uso do contexto
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}
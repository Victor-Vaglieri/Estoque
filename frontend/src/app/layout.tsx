// app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/app/context/AuthContext'; // 1. Importe seu AuthProvider
import { ThemeProvider } from '@/app/context/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

const theme = 'light'

export const metadata: Metadata = {
  title: 'Sistema de Controle de Estoque',
  description: 'Sistema de Controle de Estoque',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html data-theme={theme} lang="pt-BR">
      <body className={inter.className}>
        {/* 2. Envolva tudo com o AuthProvider */}
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
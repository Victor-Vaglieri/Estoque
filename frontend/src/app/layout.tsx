// app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/app/context/AuthContext';
import { ThemeProvider } from '@/app/context/ThemeContext';
// --- 1. Importar o novo provider ---
import { SidebarProvider } from '@/app/context/SidebarContext';

const inter = Inter({ subsets: ['latin'] });

const theme = 'light' // O seu 'theme' estático está aqui

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
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>
                {children}
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

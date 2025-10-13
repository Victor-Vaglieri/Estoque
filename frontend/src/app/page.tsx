// app/page.tsx

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function HomePage() {
  const { user, loading } = useAuth(); // Pega o usuário e o estado de carregamento do contexto
  const router = useRouter();

  useEffect(() => {
    // Só executa a lógica depois que o contexto terminou de verificar a autenticação
    if (!loading) {
      if (user) {
        router.replace('/inicio'); // Se o usuário existe (logado), vai para o dashboard
      } else {
        router.replace('/login'); // Se não existe (deslogado), vai para a tela de login
      }
    }
  }, [user, loading, router]);

  // Enquanto a verificação acontece, mostramos uma tela de carregamento
  // para evitar um piscar de tela.
  return (
    <div className="flex h-screen items-center justify-center">
      <div>Carregando...</div>
    </div>
  );
}
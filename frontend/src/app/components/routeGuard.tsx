// app/components/RouteGuard.tsx
"use client";

import { useAuth } from '@/app/context/AuthContext';
import { Funcao } from '@/lib/types';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

// Define as propriedades que o componente receberá
interface RouteGuardProps {
    // A lista de Funcoes que TÊM permissão para acessar esta página
    allowedFunctions: Funcao[];
    children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ allowedFunctions, children }) => {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    // Estado para controlar se a verificação inicial foi concluída
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // A verificação só deve ocorrer no lado do cliente (browser)
        if (typeof window === 'undefined') return;

        // 1. Caso 1: Usuário não autenticado
        if (!isAuthenticated) {
            // Se não está logado, redireciona para a página inicial (login)
            router.push('/');
            return; // Interrompe a execução
        }

        // 2. Caso 2: Usuário autenticado, verifica a permissão
        if (user) {
            const hasPermission = user.funcoes.some(
                (userFunction) => allowedFunctions.includes(userFunction)
            );

            if (!hasPermission) {
                // Usuário logado, mas SEM a função necessária (Ex: Funcionário tentando acessar Cadastro)
                console.error(`Acesso negado. Funções do usuário: ${user.funcoes.join(', ')}.`);

                // Redireciona para uma página segura (como a home page logada)
                // Você pode criar uma tela 403 personalizada se preferir
                router.push('/inicio');
            }
        }

        // Independentemente do resultado, a verificação terminou
        setLoading(false);

        // Dependências do useEffect. Ele roda sempre que o status de autenticação ou o usuário mudar.
    }, [isAuthenticated, user, allowedFunctions, router]);


    // --- Renderização de Feedback ---

    // Enquanto estiver verificando ou se o usuário não estiver logado
    if (loading || !isAuthenticated) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem' }}>
                Verificando autenticação e permissões...
            </div>
        );
    }

    // Se o usuário estiver logado e a verificação de permissão falhar (caso 2), o useEffect já forçou o redirecionamento.
    // Se o código chegou aqui, significa que: isAuthenticated é TRUE e user tem permissão.
    return <>{children}</>;
};
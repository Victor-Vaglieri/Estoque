// app/components/RouteGuard.tsx
"use client";

import { useAuth } from '@/app/context/AuthContext';
import { Funcao } from '@/lib/types';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface RouteGuardProps {
    allowedFunctions: Funcao[];
    children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ allowedFunctions, children }) => {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (!isAuthenticated) {
            router.push('/');
            return; 
        }

        // 2. Caso 2: Usuário autenticado, verifica a permissão
        if (user) {
            const hasPermission = user.funcoes.some(
                (userFunction) => allowedFunctions.includes(userFunction)
            );

            if (!hasPermission) { // TODO verificar se esse redirecionamento está funcionando corretamente
                console.error(`Acesso negado. Funções do usuário: ${user.funcoes.join(', ')}.`);
                router.push('/inicio');
            }
        }

        setLoading(false);

    }, [isAuthenticated, user, allowedFunctions, router]);

    if (loading || !isAuthenticated) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem' }}>
                Verificando autenticação e permissões...
            </div>
        );
    }
    return <>{children}</>;
};
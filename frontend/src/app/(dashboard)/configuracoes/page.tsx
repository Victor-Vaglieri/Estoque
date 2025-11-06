"use client";

import { useState, useEffect } from 'react';
// Revertendo para o caminho de alias padrão do Next.js
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

// Importe o CSS específico para esta página
import './configuracoes.css';

export default function ConfiguracoesPage() {
    const router = useRouter();
    // Corrigido: Removida a função 'fetchUser' que não existia.
    const { user } = useAuth();

    // Estado para o formulário de login
    const [login, setLogin] = useState('');

    // Estados para o formulário de senha
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Estados de feedback
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Preenche o login do usuário quando o componente carrega
    useEffect(() => {
        // --- CORREÇÃO AQUI ---
        // Em vez de '(user as any)', definimos o tipo que esperamos.
        // Dizemos ao TS que 'user' é um objeto que PODE ter a chave 'login'.
        const typedUser = user as { login?: string };

        // Usamos o 'typedUser' com o 'optional chaining' (?.), 
        // que já verifica se 'typedUser' e 'typedUser.login' existem.
        if (typedUser?.login) {
            setLogin(typedUser.login);
        }
    }, [user]);

    // Limpa as mensagens de feedback
    const clearFeedback = () => {
        setError(null);
        setSuccess(null);
    };

    // Função para alterar o LOGIN
    const handleUpdateLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearFeedback();
        setIsSubmitting(true);

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/login`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ login: login }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao atualizar o login.');
            }

            setSuccess('Login atualizado com sucesso!');

            // router.refresh() força o Next.js a buscar novamente os dados do servidor.
            // Isso fará com que o AuthContext pegue o novo login de usuário
            // e atualize a UI (ex: na TopBar) sem um recarregamento completo da página.
            router.refresh();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Função para alterar a SENHA
    const handleUpdatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearFeedback();

        if (newPassword !== confirmPassword) {
            setError('As novas senhas não coincidem.');
            return;
        }

        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me/password`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: currentPassword,
                    newPassword: newPassword, // Removido o 'N' que estava causando o erro
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao atualizar a senha.');
            }

            setSuccess('Senha atualizada com sucesso!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="page-header-produtos">
                <h1 className="page-title-produtos">Configurações</h1>
            </div>

            {error && <p className="config-message config-error">{error}</p>}
            {success && <p className="config-message config-success">{success}</p>}

            <div className="config-grid">
                {/* Card 1: Alterar Login */}
                <div className="config-container">
                    <h2 className="config-title">Alterar Login</h2>
                    <form onSubmit={handleUpdateLogin} className="config-form">
                        <label>
                            Login
                            <input
                                name="login"
                                type="text"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                required
                            />
                        </label>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : 'Salvar Login'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Card 2: Alterar Senha */}
                <div className="config-container">
                    <h2 className="config-title">Alterar Senha</h2>
                    <form onSubmit={handleUpdatePassword} className="config-form">
                        <label>
                            Senha Atual
                            <input
                                name="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </label>
                        <label>
                            Nova Senha
                            <input
                                name="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </label>
                        <label>
                            Confirmar Nova Senha
                            <input
                                name="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </label>
                        <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : 'Alterar Senha'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
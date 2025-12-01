"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

// 1. Importação do CSS Module
import styles from './configuracoes.module.css';

export default function ConfiguracoesPage() {
    const router = useRouter();
    const { user } = useAuth(); 

    const [login, setLogin] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if ((user as any)?.login) {
            setLogin((user as any).login);
        }
    }, [user]);

    const clearFeedback = () => {
        setError(null);
        setSuccess(null);
    };

    const handleUpdateLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearFeedback();
        setIsSubmitting(true);

        const token = sessionStorage.getItem('token');
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
            router.refresh(); 

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        clearFeedback();

        if (newPassword !== confirmPassword) {
            setError('As novas senhas não coincidem.');
            return;
        }

        setIsSubmitting(true);
        const token = sessionStorage.getItem('token');
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
                    newPassword: newPassword,
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
        // 2. Wrapper principal para isolar o CSS
        <div className={styles['main-wrapper']}>
            <div className={styles['page-header-produtos']}> 
                <h1 className={styles['page-title-produtos']}>Configurações</h1>
            </div>
            
            {/* 3. Classes compostas para feedback */}
            {error && <p className={`${styles['config-message']} ${styles['config-error']}`}>{error}</p>}
            {success && <p className={`${styles['config-message']} ${styles['config-success']}`}>{success}</p>}

            <div className={styles['config-grid']}>
                {/* Card 1: Alterar Login */}
                <div className={styles['config-container']}>
                    <h2 className={styles['config-title']}>Alterar Login</h2>
                    <form onSubmit={handleUpdateLogin} className={styles['config-form']}>
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
                        <div className={styles['form-actions']}>
                            <button type="submit" className={styles['btn-primary']} disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : 'Salvar Login'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Card 2: Alterar Senha */}
                <div className={styles['config-container']}>
                    <h2 className={styles['config-title']}>Alterar Senha</h2>
                    <form onSubmit={handleUpdatePassword} className={styles['config-form']}>
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
                        <div className={styles['form-actions']}>
                            <button type="submit" className={styles['btn-primary']} disabled={isSubmitting}>
                                {isSubmitting ? 'Salvando...' : 'Alterar Senha'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
"use client";

import { useState, useEffect } from 'react';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

import "./recebimentos.css";



interface PendingReceipt {
    id: number;
    quantidade: number;
    precoTotal: number;
    data: string;
    confirmadoEntrada: 'PENDENTE' | 'FALTANTE';
    produto: {
        id: number;
        nome: string;
        unidade: string;
        marca: string | null;
    };

}


enum EstadoEntrada {
    PENDENTE = 'PENDENTE',
    CONFIRMADO = 'CONFIRMADO',
    FALTANTE = 'FALTANTE',
    CANCELADO = 'CANCELADO',
}


export default function RecebimentosPage() {
    const router = useRouter();
    const { user } = useAuth();


    const [pendingReceipts, setPendingReceipts] = useState<PendingReceipt[]>([]);

    const [confirmedPrices, setConfirmedPrices] = useState<Record<number, string>>({});


    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [isSubmittingMap, setIsSubmittingMap] = useState<Record<number, boolean>>({});

    const clearFeedback = () => {
        setError(null);
        setSuccess(null);
    };


    const fetchPendingReceipts = async () => {
        setIsLoading(true);
        clearFeedback();
        const token = sessionStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recebimentos/pendentes`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Falha ao carregar recebimentos pendentes.');
            }
            const data: PendingReceipt[] = await response.json();
            setPendingReceipts(data);


            const initialPrices: Record<number, string> = {};
            data.forEach(receipt => {
                initialPrices[receipt.id] = receipt.precoTotal.toFixed(2);
            });
            setConfirmedPrices(initialPrices);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        if (user) {
            if (!user.funcoes.some(f => f === 'RECEBIMENTO' || f === 'GESTOR')) {
                router.push('/inicio');
                return;
            }
        }
        fetchPendingReceipts();
    }, [user, router]);


    const handlePriceChange = (receiptId: number, value: string) => {
        setConfirmedPrices(prev => ({
            ...prev,
            [receiptId]: value
        }));
    };


    const handleUpdateReceipt = async (receiptId: number, newStatus: EstadoEntrada) => {
        clearFeedback();
        setIsSubmittingMap(prev => ({ ...prev, [receiptId]: true }));

        const token = sessionStorage.getItem('token');
        if (!token) {
            router.push('/login');
            setIsSubmittingMap(prev => ({ ...prev, [receiptId]: false }));
            return;
        }

        const confirmedPriceStr = confirmedPrices[receiptId];
        const confirmedPriceNum = parseFloat(confirmedPriceStr);


        if (isNaN(confirmedPriceNum) || confirmedPriceNum < 0) {
            setError(`[ID ${receiptId}] Preço confirmado inválido.`);
            setIsSubmittingMap(prev => ({ ...prev, [receiptId]: false }));
            return;
        }

        const updateData = {
            status: newStatus,
            precoConfirmado: confirmedPriceNum,
        };

        try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recebimentos/${receiptId}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `[ID ${receiptId}] Falha ao atualizar recebimento.`);
            }

            setSuccess(`[ID ${receiptId}] Recebimento atualizado para ${newStatus}!`);




            await fetchPendingReceipts();

        } catch (err) {
            setError(err instanceof Error ? err.message : `[ID ${receiptId}] Ocorreu um erro.`);
        } finally {
            setIsSubmittingMap(prev => ({ ...prev, [receiptId]: false }));
        }
    };

    return (
        <>
            <div className="page-header-recebimentos">
                <h1 className="page-title-recebimentos">Confirmar Recebimentos</h1>
            </div>

            {error && <p className="recebimentos-message recebimentos-error">{error}</p>}
            {success && <p className="recebimentos-message recebimentos-success">{success}</p>}

            {isLoading && <p>Carregando recebimentos pendentes...</p>}

            {!isLoading && pendingReceipts.length === 0 && (
                <div className="recebimentos-container">
                    <h2 className="recebimentos-title">Nenhum Recebimento Pendente</h2>
                    <p>Todas as compras registadas foram processadas.</p>
                </div>
            )}

            <div className="recebimentos-grid">
                {pendingReceipts.map((receipt) => {
                    const isSubmitting = isSubmittingMap[receipt.id] || false;
                    const currentConfirmedPrice = confirmedPrices[receipt.id] || '';

                    return (
                        <div key={receipt.id} className="recebimentos-container">
                            <h2 className="recebimentos-title">{receipt.produto.nome}</h2>
                            <span className={`status-badge status-${receipt.confirmadoEntrada.toLowerCase()}`}>
                                {receipt.confirmadoEntrada}
                            </span>
                            <div className="recebimentos-details">
                                <p><strong>ID Compra:</strong> {receipt.id}</p>
                                <p><strong>Marca:</strong> {receipt.produto.marca || 'N/A'}</p>
                                <p><strong>Quantidade Esperada:</strong> {receipt.quantidade} {receipt.produto.unidade}</p>
                                <p><strong>Preço Registado:</strong> R$ {receipt.precoTotal.toFixed(2)}</p>
                                <p><strong>Data da Compra:</strong> {new Date(receipt.data).toLocaleDateString()}</p>
                            </div>

                            <div className="recebimentos-actions">
                                { }
                                <label className="price-label">
                                    Preço Confirmado (NF):
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={currentConfirmedPrice}
                                        onChange={(e) => handlePriceChange(receipt.id, e.target.value)}
                                        placeholder="Ex: 15.50"
                                        required
                                        className="price-input"
                                        disabled={isSubmitting}
                                    />
                                </label>

                                { }
                                <div className="action-buttons">
                                    <button
                                        className="btn-danger"
                                        onClick={() => handleUpdateReceipt(receipt.id, EstadoEntrada.CANCELADO)}
                                        disabled={isSubmitting}
                                    >

                                        {isSubmitting ? '...' : 'Cancelar Compra'}
                                    </button>
                                    <button
                                        className="btn-warning"
                                        onClick={() => handleUpdateReceipt(receipt.id, EstadoEntrada.FALTANTE)}
                                        disabled={isSubmitting || receipt.confirmadoEntrada === 'FALTANTE'}
                                    >
                                        {isSubmitting ? '...' : 'Marcar Faltante'}
                                    </button>

                                    <button
                                        className="btn-success"
                                        onClick={() => handleUpdateReceipt(receipt.id, EstadoEntrada.CONFIRMADO)}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? '...' : 'Confirmar Entrada'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

"use client";

import { useState, useEffect } from 'react';
// Usando o caminho de alias padrão
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

import "./recebimentos.css";

// Interface para os dados recebidos do backend (GET /recebimentos/pendentes)
// Inclui dados do HistoricoCompra e do Produto associado
interface PendingReceipt {
    id: number; // ID do HistoricoCompra
    quantidade: number;
    precoTotal: number; // Preço registado na compra
    data: string; // Data da compra
    confirmadoEntrada: 'PENDENTE' | 'FALTANTE'; // Status atual
    produto: {
        id: number;
        nome: string;
        unidade: string;
        marca: string | null;
    };
    // Adicione mais campos se necessário (ex: fornecedor)
}

// Enum local para os possíveis status (deve corresponder ao backend)
enum EstadoEntrada {
    PENDENTE = 'PENDENTE',
    CONFIRMADO = 'CONFIRMADO',
    FALTANTE = 'FALTANTE',
    CANCELADO = 'CANCELADO',
}


export default function RecebimentosPage() {
    const router = useRouter();
    const { user } = useAuth();

    // Estado para a lista de recebimentos pendentes
    const [pendingReceipts, setPendingReceipts] = useState<PendingReceipt[]>([]);
    // Estado para guardar os preços confirmados (por ID do recebimento)
    const [confirmedPrices, setConfirmedPrices] = useState<Record<number, string>>({});

    // Estados de feedback
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    // Controla o estado de submissão para cada card individualmente
    const [isSubmittingMap, setIsSubmittingMap] = useState<Record<number, boolean>>({});

    const clearFeedback = () => {
        setError(null);
        setSuccess(null);
    };

    // 1. Busca a lista de recebimentos pendentes/faltantes
    const fetchPendingReceipts = async () => {
        setIsLoading(true);
        clearFeedback();
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            // --- NOVO ENDPOINT ---
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recebimentos/pendentes`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Falha ao carregar recebimentos pendentes.');
            }
            const data: PendingReceipt[] = await response.json();
            setPendingReceipts(data);

            // Inicializa os preços confirmados com os preços registados
            const initialPrices: Record<number, string> = {};
            data.forEach(receipt => {
                initialPrices[receipt.id] = receipt.precoTotal.toFixed(2); // Formata como string com 2 casas decimais
            });
            setConfirmedPrices(initialPrices);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
        } finally {
            setIsLoading(false);
        }
    };

    // Busca os dados ao carregar a página
    useEffect(() => {
        fetchPendingReceipts();
    }, [router]);

    // Função para lidar com a mudança no input de preço
    const handlePriceChange = (receiptId: number, value: string) => {
        setConfirmedPrices(prev => ({
            ...prev,
            [receiptId]: value // Guarda como string, validação no envio
        }));
    };

    // 2. Função para CONFIRMAR/ATUALIZAR um recebimento
    const handleUpdateReceipt = async (receiptId: number, newStatus: EstadoEntrada) => {
        clearFeedback();
        setIsSubmittingMap(prev => ({ ...prev, [receiptId]: true }));

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            setIsSubmittingMap(prev => ({ ...prev, [receiptId]: false }));
            return;
        }

        const confirmedPriceStr = confirmedPrices[receiptId];
        const confirmedPriceNum = parseFloat(confirmedPriceStr);

        // Validação do preço inserido
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
            // --- NOVO ENDPOINT ---
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recebimentos/${receiptId}`, {
                method: 'PATCH', // PATCH é mais adequado para atualizações parciais
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `[ID ${receiptId}] Falha ao atualizar recebimento.`);
            }

            setSuccess(`[ID ${receiptId}] Recebimento atualizado para ${newStatus}!`);

            // Atualiza a lista removendo o item processado
            // setPendingReceipts(prev => prev.filter(receipt => receipt.id !== receiptId));
            // OU recarrega a lista completa
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
                                {/* Input para Preço Confirmado */}
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

                                {/* Botões de Ação */}
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
                                        disabled={isSubmitting || receipt.confirmadoEntrada === 'FALTANTE'} // Desabilita se já for FALTANTE
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

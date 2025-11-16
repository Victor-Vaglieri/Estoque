"use client";

import { useState, useEffect, FormEvent, useMemo } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

import './compras.css';

// MUDANÇA: Interface atualizada para o novo schema e para incluir o fornecedor
interface ProductToBuy {
    nome: string;
    id: number;
    unidade: string;
    marca: string | null;
    quantidadeMin: number;
    quantidadeEst: number;
    quantidadeMax: number; // Renomeado (era quantidadeNec)
    quantidadePendenteFaltante: number;
    // Adicionado para que o backend possa nos dizer quem é o fornecedor
    fornecedor: {
        id: number;
        nome: string;
    };
}

// MUDANÇA: O estado agora é um objeto agrupado por nome de fornecedor
type GroupedProducts = Record<string, ProductToBuy[]>;

export default function ComprasPage() {
    const router = useRouter();
    const { user } = useAuth();

    // MUDANÇA: O estado agora espera um objeto (Record) e não um array
    const [productsToBuy, setProductsToBuy] = useState<GroupedProducts>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmittingMap, setIsSubmittingMap] = useState<Record<number, boolean>>({});

    const clearFeedback = () => {
        setError(null);
        setSuccess(null);
    };

    const fetchProductsToBuy = async () => {
        setIsLoading(true);
        clearFeedback();
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            // MUDANÇA: Endpoint ajustado (era /to_buy_products, agora /compras)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/compras/lista`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error('Falha ao carregar a lista de compras.');
            
            // MUDANÇA: Espera um objeto agrupado (GroupedProducts) do backend
            const data: GroupedProducts = await response.json();
            setProductsToBuy(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            // MUDANÇA: Permissão atualizada de 'COMPRAS' para 'LISTA' (do schema usuarios.db)
            if (!user.funcoes.some(f => f === 'LISTA' || f === 'GESTOR')) {
                router.push('/inicio');
                return;
            }
        }
        fetchProductsToBuy();
    }, [user, router]);

    const handleRegisterPurchase = async (event: React.FormEvent<HTMLFormElement>, productId: number, productName: string) => {
        event.preventDefault();
        const formElement = event.currentTarget;

        clearFeedback();
        setIsSubmittingMap(prev => ({ ...prev, [productId]: true }));

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            setIsSubmittingMap(prev => ({ ...prev, [productId]: false }));
            return;
        }

        const formData = new FormData(formElement);
        const purchaseData = {
            productId: productId,
            quantidade: parseFloat(formData.get('quantidade') as string),
            // MUDANÇA: O backend espera 'precoTotal', não 'preco'
            precoTotal: parseFloat(formData.get('preco') as string),
        };

        if (!purchaseData.quantidade || purchaseData.quantidade <= 0) {
            setError(`[${productName}] Quantidade inválida.`);
            setIsSubmittingMap(prev => ({ ...prev, [productId]: false }));
            return;
        }
        if (purchaseData.precoTotal === null || purchaseData.precoTotal < 0) {
            setError(`[${productName}] Preço inválido.`);
            setIsSubmittingMap(prev => ({ ...prev, [productId]: false }));
            return;
        }

        try {
            // MUDANÇA: Endpoint ajustado (era /to_buy_products, agora /compras/registrar)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/compras/registrar`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(purchaseData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `[${productName}] Falha ao registrar.`);
            }

            setSuccess(`[${productName}] Compra registrada!`);
            formElement.reset();
            await fetchProductsToBuy(); // Recarrega a lista

        } catch (err) {
            setError(err instanceof Error ? err.message : `[${productName}] Ocorreu um erro.`);
        } finally {
            setIsSubmittingMap(prev => ({ ...prev, [productId]: false }));
        }
    };
    
    // MUDANÇA: Verifica se o objeto de produtos está vazio
    const hasProductsToBuy = useMemo(() => Object.keys(productsToBuy).length > 0, [productsToBuy]);

    return (
        <>
            <div className="page-header-produtos">
                <h1 className="page-title-produtos">Lista de Compras</h1>
            </div>

            {error && <p className="compras-message compras-error">{error}</p>}
            {success && <p className="compras-message compras-success">{success}</p>}

            {isLoading && <p>Carregando lista...</p>}

            {!isLoading && !hasProductsToBuy && (
                <div className="compras-container">
                    <h2 className="compras-title">Estoque Completo!</h2>
                    <p>Nenhum produto precisa ser comprado no momento.</p>
                </div>
            )}

            {/* MUDANÇA: Renderização agora é agrupada por fornecedor */}
            {!isLoading && hasProductsToBuy && (
                <div className="fornecedor-sections-container">
                    {/* Mapeia o OBJETO de fornecedores */}
                    {Object.entries(productsToBuy).map(([fornecedorNome, products]) => (
                        <section key={fornecedorNome} className="fornecedor-section">
                            <h2 className="fornecedor-title">{fornecedorNome}</h2>
                            <div className="compras-grid">
                                {products.map((product) => {
                                    const isSubmitting = isSubmittingMap[product.id] || false;
                                    // MUDANÇA: Usa 'quantidadeMax'
                                    const neededQuantity = Math.max(0, product.quantidadeMax - product.quantidadeEst - product.quantidadePendenteFaltante);

                                    return (
                                        <div key={product.id} className="compras-container">
                                            <h2 className="compras-title">{product.nome}</h2>
                                            <div className="compras-details">
                                                <p><strong>Marca:</strong> {product.marca || 'N/A'}</p>
                                                <p><strong>Estoque Atual:</strong> {product.quantidadeEst} {product.unidade}</p>
                                                {/* MUDANÇA: Usa 'quantidadeMax' */}
                                                <p><strong>Estoque Máximo:</strong> {product.quantidadeMax} {product.unidade}</p>

                                                <div className="compras-pending-info">
                                                    {product.quantidadePendenteFaltante > 0 && (
                                                        <p style={{ color: '#eea811', fontWeight: 'bold' }}>
                                                            (Já comprado/Pendente: {product.quantidadePendenteFaltante} {product.unidade})
                                                        </p>
                                                    )}
                                                </div>

                                                <p className="compras-needed">
                                                    <strong>
                                                        Precisa Comprar:{' '}
                                                        {neededQuantity}{' '}
                                                        {product.unidade}
                                                    </strong>
                                                </p>
                                            </div>

                                            <div className="compras-action-area">
                                                {neededQuantity > 0 && (
                                                    <form onSubmit={(e) => handleRegisterPurchase(e, product.id, product.nome)} className="compras-form">
                                                        <label>
                                                            Quantidade Comprada
                                                            <input
                                                                name="quantidade"
                                                                type="number"
                                                                step="any"
                                                                placeholder={`Ex: ${neededQuantity}`}
                                                                required
                                                                min="0.01"
                                                            />
                                                        </label>
                                                        <label>
                                                            Preço Total Pago (R$)
                                                            <input
                                                                name="preco" // O DTO espera 'precoTotal', mas o form envia 'preco'. Corrigido no handleSubmit.
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="Ex: 15.50"
                                                                required
                                                                min="0.01"
                                                            />
                                                        </label>
                                                        <div className="form-actions">
                                                            <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                                                {isSubmitting ? 'Registrando...' : 'Registrar Compra'}
                                                            </button>
                                                        </div>
                                                    </form>
                                                )}
                                                {neededQuantity <= 0 && product.quantidadePendenteFaltante > 0 && (
                                                    <p className="compras-waiting-message">
                                                        Aguardando confirmação das compras pendentes.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </>
    );
}
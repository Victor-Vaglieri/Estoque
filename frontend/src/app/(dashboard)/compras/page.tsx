"use client";

import { useState, useEffect } from 'react';
// Caminho de importação corrigido para relativo (subindo um nível)
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

// Importe o CSS específico para esta página
import './compras.css';

// Interface do Produto (baseada na resposta do backend)
interface ProductToBuy { 
    nome: string;
    id: number;
    unidade: string;
    marca: string | null;
    quantidadeMin: number;
    quantidadeEst: number;
    quantidadeNec: number;
    quantidadePendenteFaltante: number; 
}

export default function ComprasPage() {
    const router = useRouter();
    const { user } = useAuth(); 

    const [productsToBuy, setProductsToBuy] = useState<ProductToBuy[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isSubmittingMap, setIsSubmittingMap] = useState<Record<number, boolean>>({}); // Controla o estado de envio por produto

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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/to_buy_products`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (!response.ok) throw new Error('Falha ao carregar a lista de compras.');
            const data: ProductToBuy[] = await response.json(); 
            setProductsToBuy(data); 
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProductsToBuy();
    }, [router]);

    const handleRegisterPurchase = async (event: React.FormEvent<HTMLFormElement>, productId: number, productName: string) => { // Adicionado productName para mensagens
        event.preventDefault();
        clearFeedback();
        setIsSubmittingMap(prev => ({ ...prev, [productId]: true })); // Inicia o loading para este produto

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            setIsSubmittingMap(prev => ({ ...prev, [productId]: false }));
            return;
        }

        const formData = new FormData(event.currentTarget);
        const purchaseData = {
            productId: productId,
            quantidade: parseFloat(formData.get('quantidade') as string), 
            preco: parseFloat(formData.get('preco') as string),
        };

        if (!purchaseData.quantidade || purchaseData.quantidade <= 0) {
            setError(`[${productName}] Quantidade inválida.`); // Mostrar nome do produto no erro
            setIsSubmittingMap(prev => ({ ...prev, [productId]: false }));
            return;
        }
        if (purchaseData.preco === null || purchaseData.preco < 0) {
            setError(`[${productName}] Preço inválido.`); // Mostrar nome do produto no erro
            setIsSubmittingMap(prev => ({ ...prev, [productId]: false }));
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/to_buy_products`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(purchaseData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `[${productName}] Falha ao registrar.`); // Mostrar nome
            }
            
            setSuccess(`[${productName}] Compra registrada!`); // Mostrar nome
            await fetchProductsToBuy(); 
             const formElement = event.currentTarget;
             formElement.reset(); 
        } catch (err) {
            setError(err instanceof Error ? err.message : `[${productName}] Ocorreu um erro.`); // Mostrar nome
        } finally {
            setIsSubmittingMap(prev => ({ ...prev, [productId]: false })); // Finaliza o loading
        }
    };

    return (
        <>
            <div className="page-header-produtos"> 
                <h1 className="page-title-produtos">Lista de Compras</h1>
            </div>
            
            {error && <p className="compras-message compras-error">{error}</p>}
            {success && <p className="compras-message compras-success">{success}</p>}

            {isLoading && <p>Carregando lista...</p>}

            {!isLoading && productsToBuy.length === 0 && (
                <div className="compras-container">
                    <h2 className="compras-title">Estoque Completo!</h2>
                    <p>Nenhum produto precisa ser comprado no momento.</p>
                </div>
            )}

            <div className="compras-grid">
                {productsToBuy.map((product) => {
                    const isSubmitting = isSubmittingMap[product.id] || false;
                    const neededQuantity = Math.max(0, product.quantidadeNec - product.quantidadeEst - product.quantidadePendenteFaltante);
                    
                    return (
                        <div key={product.id} className="compras-container">
                            <h2 className="compras-title">{product.nome}</h2>
                            <div className="compras-details">
                                <p><strong>Marca:</strong> {product.marca || 'N/A'}</p>
                                <p><strong>Estoque Atual:</strong> {product.quantidadeEst} {product.unidade}</p>
                                <p><strong>Estoque Necessário:</strong> {product.quantidadeNec} {product.unidade}</p>
                                
                                <div className="compras-pending-info"> 
                                    {product.quantidadePendenteFaltante > 0 && (
                                        <p style={{ color: 'orange', fontWeight: 'bold' }}>
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
                                                name="preco"
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
        </>
    );
}


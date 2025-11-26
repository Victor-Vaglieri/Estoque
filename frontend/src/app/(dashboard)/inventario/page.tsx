"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

import './inventario.css';

interface Product {
    id: number;
    nome: string;
    unidade: string;
    marca: string | null;
    codigo: string | null; 
    quantidadeEst: number; 
    quantidadeMin: number;
}

type SortConfig = {
    key: keyof Product | null; 
    direction: 'ascending' | 'descending'; 
} | null;

export default function InventarioPage() {
    const router = useRouter();
    const { user } = useAuth();

    const [products, setProducts] = useState<Product[]>([]);
    const [editedQuantities, setEditedQuantities] = useState<Record<number, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    const clearFeedback = () => {
        setError(null);
        setSuccess(null);
    }

    useEffect(() => {
        const loadData = async () => {
            if (user) {
                if (!Array.isArray(user?.funcoes) || !user.funcoes.some((f: string) => f === 'INVENTARIO' || f === 'GESTOR')) {
                    router.push('/inicio');
                    return;
                }
            } else {
                return;
            }
            
            setIsLoading(true);
            clearFeedback();
            setEditedQuantities({});

            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventario`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                });

                if (!response.ok) {
                    let errorMsg = 'Falha ao carregar o inventário.';
                    try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {  }
                    throw new Error(errorMsg);
                }
                const data: Product[] = await response.json();
                setProducts(data);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar o inventário.');
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, [user, router]); 

    const handleQuantityChange = (produtoId: number, value: string) => {
        const sanitizedValue = value.replace(/[^0-9.]/g, '');
        if ((sanitizedValue.match(/\./g) || []).length > 1) return;
        setEditedQuantities(prev => ({ ...prev, [produtoId]: sanitizedValue }));
        clearFeedback();
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        clearFeedback();
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            setIsSaving(false);
            return;
        }

        const updates = Object.entries(editedQuantities)
            .map(([produtoIdStr, quantityStr]) => {
                const produtoId = parseInt(produtoIdStr, 10);
                const newQuantity = quantityStr === '' || quantityStr === '.' ? NaN : parseFloat(quantityStr);
                const originalProduct = products.find(p => p.id === produtoId);

                if (!isNaN(newQuantity) && newQuantity >= 0 && originalProduct && newQuantity !== originalProduct.quantidadeEst) {
                    return { produtoId, newQuantity };
                }
                return null;
            })
            .filter(update => update !== null) as { produtoId: number, newQuantity: number }[];

        if (updates.length === 0) {
            setSuccess("Nenhuma alteração para salvar.");
            setIsSaving(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventario/ajuste`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates }),
            });

            if (!response.ok) {
                let errorMsg = 'Falha ao salvar o inventário.';
                try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) {  }
                throw new Error(errorMsg);
            }

            setSuccess("Inventário atualizado com sucesso!");
            
            setIsLoading(true);
            const refetchResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventario`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });
            if (refetchResponse.ok) {
                const data: Product[] = await refetchResponse.json();
                setProducts(data);
                setEditedQuantities({}); 
            } else {
                throw new Error("Sucesso ao salvar, mas falha ao recarregar dados.");
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro ao salvar.');
        } finally {
            setIsSaving(false);
            setIsLoading(false); 
        }
    };
    
    const sortedProducts = useMemo(() => {
        let sortableProducts = [...products];
        if (sortConfig !== null) {
            sortableProducts.sort((a, b) => {
                if (!sortConfig.key) return 0;
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue === null || aValue === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
                if (bValue === null || bValue === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableProducts;
    }, [products, sortConfig]);
    
    const requestSort = (key: keyof Product) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const getSortDirectionClass = (key: keyof Product) => {
        if (!sortConfig || sortConfig.key !== key) return '';
        return sortConfig.direction === 'ascending' ? 'sort-asc' : 'sort-desc';
    };

    return (
        <>
            <div className="page-header-inventario">
                <h1 className="page-title-inventario">Fazer Inventário</h1>
                {Object.keys(editedQuantities).length > 0 && (
                    <button
                        className="btn-primary btn-save-inventory"
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Salvando...' : 'Salvar Inventário'}
                    </button>
                )}
            </div>

            {error && !isLoading && <p className="inventario-message inventario-error">{error}</p>}
            {success && <p className="inventario-message inventario-success">{success}</p>}

            {isLoading && <p>Carregando inventário...</p>}

            {!isLoading && products.length === 0 && !error && (
                <div className="inventario-container">
                    <h2 className="inventario-title">Inventário Vazio</h2>
                    <p>Nenhum produto encontrado para inventariar.</p>
                </div>
            )}

            {!isLoading && products.length > 0 && (
                <div className="inventario-table-container">
                    <table className="inventario-table">
                        <thead>
                            <tr>
                                <th>
                                    <button type="button" onClick={() => requestSort('nome')} className={`sort-button ${getSortDirectionClass('nome')}`}>
                                        Nome
                                    </button>
                                </th>
                                <th>
                                    <button type="button" onClick={() => requestSort('marca')} className={`sort-button ${getSortDirectionClass('marca')}`}>
                                        Marca
                                    </button>
                                </th>
                                <th>
                                    <button type="button" onClick={() => requestSort('unidade')} className={`sort-button ${getSortDirectionClass('unidade')}`}>
                                        Unidade
                                    </button>
                                </th>
                                {/* --- MUDANÇA: Nova Coluna --- */}
                                <th>
                                    <button type="button" onClick={() => requestSort('quantidadeEst')} className={`sort-button ${getSortDirectionClass('quantidadeEst')}`}>
                                        Estoque Atual (Sistema)
                                    </button>
                                </th>
                                {/* -------------------------- */}
                                <th>
                                    <button type="button" onClick={() => requestSort('quantidadeMin')} className={`sort-button ${getSortDirectionClass('quantidadeMin')}`}>
                                        Mínimo
                                    </button>
                                </th>
                                <th>Quantidade Contada</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedProducts.map((product) => {
                                const currentQuantityValue = editedQuantities[product.id] ?? product.quantidadeEst.toString();
                                const isEdited = editedQuantities[product.id] !== undefined;

                                return (
                                    <tr key={product.id} className={isEdited ? 'edited-row' : ''}>
                                        <td data-label="Nome">{product.nome}</td>
                                        <td data-label="Marca">{product.marca || '-'}</td>
                                        <td data-label="Unidade">{product.unidade}</td>
                                        
                                        {/* --- MUDANÇA: Exibindo Estoque Atual --- */}
                                        <td data-label="Estoque Atual" style={{ fontWeight: 'bold' }}>
                                            {product.quantidadeEst}
                                        </td>
                                        {/* ------------------------------------- */}

                                        <td data-label="Estoque Mínimo">{product.quantidadeMin}</td>
                                        <td data-label="Qtd. Contada">
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={currentQuantityValue}
                                                onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                                className="quantity-input"
                                                placeholder={product.quantidadeEst.toString()}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
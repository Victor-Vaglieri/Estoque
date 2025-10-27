"use client";

import { useState, useEffect, ChangeEvent, useMemo } from 'react'; // Adicionado useMemo
// Usando caminho relativo
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

// Importe o CSS específico para esta página
import './inventario.css';

// Interface do Produto
interface Product {
    id: number;
    nome: string;
    unidade: string;
    marca: string | null;
    quantidadeEst: number; // Quantidade atual vinda do DB
    quantidadeMin: number; // Mantemos para referência, se necessário
}

// Tipo para definir a configuração de ordenação
type SortConfig = {
    key: keyof Product | null; // A chave do produto para ordenar (ou null)
    direction: 'ascending' | 'descending'; // Direção
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
    
    // --- NOVO: Estado para Ordenação ---
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    const clearFeedback = () => {
        setError(null);
        setSuccess(null);
    }

    const fetchProducts = async () => {
        setIsLoading(true); 
        clearFeedback(); 
        setEditedQuantities({}); 

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                 let errorMsg = 'Falha ao carregar o inventário.';
                try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) { /* Ignora */ }
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

    useEffect(() => {
        fetchProducts();
    }, [router]);

    const handleQuantityChange = (productId: number, value: string) => {
        const sanitizedValue = value.replace(/[^0-9.]/g, ''); 
        if ((sanitizedValue.match(/\./g) || []).length > 1) return;
        setEditedQuantities(prev => ({ ...prev, [productId]: sanitizedValue }));
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
            .map(([productIdStr, quantityStr]) => {
                const productId = parseInt(productIdStr, 10);
                const newQuantity = quantityStr === '' || quantityStr === '.' ? NaN : parseFloat(quantityStr); 
                const originalProduct = products.find(p => p.id === productId);

                if (!isNaN(newQuantity) && newQuantity >= 0 && originalProduct && newQuantity !== originalProduct.quantidadeEst) {
                    return { productId, newQuantity };
                }
                return null; 
            })
            .filter(update => update !== null) as { productId: number, newQuantity: number }[]; 

        if (updates.length === 0) {
            setSuccess("Nenhuma alteração para salvar.");
            setIsSaving(false);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inventario/update`, { 
                method: 'PATCH', 
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates }), 
            });

             if (!response.ok) {
                 let errorMsg = 'Falha ao salvar o inventário.';
                try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) { /* Ignora */ }
                throw new Error(errorMsg);
            }

            setSuccess("Inventário atualizado com sucesso!");
            await fetchProducts(); 

        } catch (err) {
             setError(err instanceof Error ? err.message : 'Ocorreu um erro ao salvar.');
        } finally {
            setIsSaving(false);
        }
    };

    // --- NOVO: Lógica de Ordenação ---
    const sortedProducts = useMemo(() => {
        let sortableProducts = [...products]; // Cria cópia para não modificar o estado original
        if (sortConfig !== null) {
            sortableProducts.sort((a, b) => {
                // Assegura que temos uma chave válida para ordenar
                if (!sortConfig.key) return 0;

                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                // Lógica de comparação (considera null/undefined e tipos)
                if (aValue === null || aValue === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
                if (bValue === null || bValue === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0; // São iguais
            });
        }
        return sortableProducts;
    }, [products, sortConfig]); // Recalcula quando os produtos ou a ordenação mudam

    // --- NOVO: Função para Solicitar Ordenação ---
    const requestSort = (key: keyof Product) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        // Se já está ordenando por esta chave, inverte a direção
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

     // --- NOVO: Função para obter a classe CSS do cabeçalho de ordenação ---
     const getSortDirectionClass = (key: keyof Product) => {
        if (!sortConfig || sortConfig.key !== key) {
            return ''; // Nenhuma classe se não for a coluna ordenada
        }
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
                                {/* --- MUDANÇA: Cabeçalhos com botão para ordenar --- */}
                                <th>
                                    <button 
                                        type="button" 
                                        onClick={() => requestSort('nome')}
                                        className={`sort-button ${getSortDirectionClass('nome')}`}
                                    >
                                        Nome
                                    </button>
                                </th>
                                <th>
                                     <button 
                                        type="button" 
                                        onClick={() => requestSort('marca')}
                                        className={`sort-button ${getSortDirectionClass('marca')}`}
                                    >
                                        Marca
                                    </button>
                                </th>
                                <th>
                                     <button 
                                        type="button" 
                                        onClick={() => requestSort('unidade')}
                                        className={`sort-button ${getSortDirectionClass('unidade')}`}
                                    >
                                        Unidade
                                    </button>
                                </th>
                                <th>
                                     <button 
                                        type="button" 
                                        onClick={() => requestSort('quantidadeMin')}
                                        className={`sort-button ${getSortDirectionClass('quantidadeMin')}`}
                                    >
                                        Estoque Mínimo
                                    </button>
                                </th> 
                                <th>Quantidade Contada</th> 
                            </tr>
                        </thead>
                        <tbody>
                            {/* --- MUDANÇA: Mapeia sobre 'sortedProducts' --- */}
                            {sortedProducts.map((product) => {
                                const currentQuantityValue = editedQuantities[product.id] ?? product.quantidadeEst.toString();
                                const isEdited = editedQuantities[product.id] !== undefined; 

                                return (
                                    <tr key={product.id} className={isEdited ? 'edited-row' : ''}> 
                                        <td>{product.nome}</td>
                                        <td>{product.marca || '-'}</td>
                                        <td>{product.unidade}</td>
                                        <td>{product.quantidadeMin}</td>
                                        <td>
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


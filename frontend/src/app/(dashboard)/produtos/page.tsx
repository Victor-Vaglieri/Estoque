//app/(dashboard)/produtos/page.tsx


// left - <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 48 48"><path fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M31 36L19 24L31 12"/></svg>

// down - <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 48 48"><path fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M31 36L19 24L31 12"/></svg>

"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

import './produtos.css';

type Product = {
    id: number;
    nome: string;
    unidade: string;
    marca: string;
    ultimoPreco: number;
    precoMedio: number;
    quantidadeMin: number;
    quantidadeEst: number;
    quantidadeNec: number;
    observacoes: string;
};

export default function DashboardHomePage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    useEffect(() => {
        const fetchProductsData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError("Usuário não autenticado.");
                setIsLoading(false);
                localStorage.removeItem('token');
                router.push('/login');
                return;
            }
            try {
                const responseListProducts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (!responseListProducts.ok) {
                    throw new Error(`Erro ao buscar produtos: ${responseListProducts.statusText}`);
                }

                // TODO confirmar essa entrada 
                const products = await responseListProducts.json();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchProductsData();
    }, []);

    const handleToggleEdit = (productId: number) => {
        setEditingProductId(prevId => (prevId === productId ? null : productId));
    };
    if (isLoading) return <p>Carregando produtos...</p>;
    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Produtos</h1>
            </div>

            <ul className="table-list">
                {/* Mapeia e renderiza cada produto existente */}
                {products.map((product) => (
                    <li key={product.id} className="table-container">
                        <div className="section-header">
                            <h2 className="section-title">{product.nome} ({product.unidade}) - {product.marca}</h2>
                            <button className="action-details" onClick={() => handleToggleEdit(product.id)}>
                                {editingProductId === product.id ? 'Fechar' : 'Editar'}
                            </button>
                        </div>
                        
                        <p><strong>Último Preço:</strong> {product.ultimoPreco} | <strong>Preço Médio:</strong> {product.precoMedio}</p>
                        <p><strong>Estoque:</strong> {product.quantidadeEst} | <strong>Mínimo:</strong> {product.quantidadeMin} | <strong>Necessário:</strong> {product.quantidadeNec}</p>
                        {product.observacoes && <p><strong>Observações:</strong> {product.observacoes}</p>}

                        {editingProductId === product.id && (
                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                                <h3 className="table-title">Editar Produto</h3>
                                <form>
                                    <label>Nome:<input type="text" defaultValue={product.nome} required /></label>
                                    <label>Unidade:<input type="text" defaultValue={product.unidade} required /></label>
                                    <label>Marca:<input type="text" defaultValue={product.marca} required /></label>
                                    <label>Min:<input type="number" defaultValue={product.quantidadeMin} required /></label>
                                    <label>Nec:<input type="number" defaultValue={product.quantidadeNec} required /></label>
                                    <label>Observações:<textarea defaultValue={product.observacoes}></textarea></label>
                                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                                        Salvar Alterações
                                    </button>
                                </form>
                            </div>
                        )}
                    </li>
                ))}

                {/* Card fixo no final da lista para adicionar um novo produto */}
                <li key="add-product-card" className="table-container">
                    <div className="section-header">
                        <h2 className="section-title">Adicionar Novo Produto</h2>
                    </div>
                    
                    {!showCreateForm && (
                        <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
                            Adicionar
                        </button>
                    )}

                    {showCreateForm && (
                        <form>
                            <label>Nome:<input type="text" required /></label>
                            <label>Unidade:<input type="text" required /></label>
                            <label>Marca:<input type="text" required /></label>
                            <label>Min:<input type="number" defaultValue={0} required /></label>
                            <label>Nec:<input type="number" required /></label>
                            <label>Observações:<textarea></textarea></label>
                            
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn-primary">Salvar Produto</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
                </li>
            </ul>
        </>
    );
}
//app/(dashboard)/produtos/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { IconDown } from '@/app/components/icons/IconDown';
import { IconLeft } from '@/app/components/icons/IconLeft';

import './produtos.css';

interface Product {
    nome: string;
    id: number;
    unidade: string;
    marca: string | null;
    ultimoPreco: number | null;
    precoMedio: number | null;
    quantidadeMin: number;
    quantidadeEst: number;
    quantidadeNec: number;
    observacoes: string | null;
}

export default function ProductsHomePage() {
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
                const data = await responseListProducts.json();
                setProducts(data);
                console.log(products)
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


    const handleUpdateProduct = async (event: React.FormEvent<HTMLFormElement>, productId: number) => {
        event.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Sua sessão expirou. Faça o login novamente.");
            return;
        }
        // --- 2. CAPTURAR OS DADOS DO FORMULÁRIO ---
        const formData = new FormData(event.currentTarget);
        const updatedData = {
            nome: formData.get('nome') as string,
            unidade: formData.get('unidade') as string,
            marca: formData.get('marca') as string,
            quantidadeMin: parseInt(formData.get('quantidadeMin') as string, 10),
            quantidadeNec: parseInt(formData.get('quantidadeNec') as string, 10),
            observacoes: formData.get('observacoes') as string,
        };
        console.log("Dados atualizados do formulário:", updatedData);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error("Falha ao atualizar o produto.");
            }

            const updatedProductFromServer = await response.json();

            // --- 4. ATUALIZAR A LISTA NA TELA ---
            setProducts(currentProducts =>
                currentProducts.map(p =>
                    p.id === productId ? updatedProductFromServer : p
                )
            );

            setEditingProductId(null); // Fecha o formulário de edição

        } catch (err) {
            setError(err instanceof Error ? err.message : "Ocorreu um erro ao atualizar.");
        }
    };
    if (isLoading) return <p>Carregando produtos...</p>;
    return (
        <>
            <div className="page-header-produtos">
                <h1 className="page-title-produtos">Produtos</h1>
            </div>

            <ul className="table-list-produtos">
                {/* Mapeia e renderiza cada produto existente */}
                {products.map((product) => (
                    <li key={product.id} className="table-container-produtos">
                        <div className="section-header-produtos">
                            <h2 className="section-title-produtos">{product.nome} ({product.unidade}) - {product.marca}</h2>
                            <button className="action-details" onClick={() => handleToggleEdit(product.id)}>
                                {editingProductId === product.id ? <IconDown className='arrow-icon' /> : <IconLeft className='arrow-icon' />}
                            </button>
                        </div>

                        <p><strong>Último Preço:</strong> {product.ultimoPreco?.toFixed(2)} | <strong>Preço Médio:</strong> {product.precoMedio?.toFixed(2)}</p>
                        <p><strong>Estoque:</strong> {product.quantidadeEst} | <strong>Mínimo:</strong> {product.quantidadeMin} | <strong>Necessário:</strong> {product.quantidadeNec}</p>
                        {product.observacoes && <p><strong>Observações:</strong> {product.observacoes}</p>}

                        {editingProductId === product.id && (
                            <div className="form-divider-produtos">
                                <h3 className="table-title-produtos">Editar Produto</h3>
                                <form onSubmit={(e) => handleUpdateProduct(e, product.id)}>
                                    <label>Nome:<input type="text" name="nome" defaultValue={product.nome} required /></label>
                                    <label>Unidade:<input type="text" name="unidade" defaultValue={product.unidade} required /></label>
                                    <label>Marca:<input type="text" name="marca" defaultValue={product.marca ?? ''} /></label>
                                    <label>Min:<input type="number" name="quantidadeMin" defaultValue={product.quantidadeMin} required /></label>
                                    <label>Nec:<input type="number"  name="quantidadeNec" defaultValue={product.quantidadeNec} required /></label>
                                    <label>Observações:<textarea name="observacoes" defaultValue={product.observacoes ?? ''}></textarea></label>
                                    <button type="submit" className="btn-primary">
                                        Salvar Alterações
                                    </button>
                                </form>
                            </div>
                        )}
                    </li>
                ))}

                <li key="add-product-card" className="table-container-produtos">
                    <div className="section-header-produtos">
                        <h2 className="section-title-produtos">Adicionar Novo Produto</h2>
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
                            <label>Min:<input type="number" required /></label>
                            <label>Nec:<input type="number" required /></label>
                            <label>Observações:<textarea></textarea></label>

                            <div className="form-actions">
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
"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { IconDown } from '@/app/components/icons/IconDown';
import { IconLeft } from '@/app/components/icons/IconLeft';

// 1. Importação do CSS Module
import styles from './produtos.module.css';

interface Fornecedor {
    id: number;
    nome: string;
}

interface Loja {
    id: number;
    nome: string;
}

interface Product {
    id: number;
    nome: string;
    unidade: string;
    marca: string | null;
    codigo: string | null;
    corredor: string | null;
    producao: boolean;
    quantidadeEst: number;
    quantidadeMin: number;
    quantidadeMax: number;
    fornecedorId: number;
    observacoes: string | null;
    ativo: boolean;
    fornecedor?: Fornecedor;
    lojaId?: number; 
}

export default function ProductsHomePage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    const [lojas, setLojas] = useState<Loja[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const [editingProductId, setEditingProductId] = useState<number | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const fetchProductsData = async () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            setError("Usuário não autenticado.");
            setIsLoading(false);
            sessionStorage.removeItem('token');
            router.push('/login');
            return;
        }
        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            const [resProducts, resFornecedores, resLojas] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/fornecedores`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/perfis/lojas`, { headers })
            ]);

            if (!resProducts.ok) throw new Error(`Erro ao buscar produtos.`);
            if (!resFornecedores.ok) throw new Error(`Erro ao buscar fornecedores.`);
            
            const productsData = await resProducts.json();
            const fornecedoresData = await resFornecedores.json();
            
            const mappedProducts = productsData.map((p: any) => ({
                ...p,
                lojaId: p.realLojaId || 1
            }));

            setProducts(mappedProducts);
            setFornecedores(fornecedoresData);
            
            if (resLojas.ok) {
                setLojas(await resLojas.json());
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (user) {
            if (!user.funcoes.some((f: string) => f === 'CADASTRO' || f === 'GESTOR')) {
                router.push('/inicio');
                return;
            }
        }
        fetchProductsData();
    }, [user, router]);

    const handleToggleEdit = (productId: number) => {
        setEditingProductId(prevId => (prevId === productId ? null : productId));
    };

    const handleUpdateProduct = async (event: React.FormEvent<HTMLFormElement>, productId: number) => {
        event.preventDefault();
        setError(null); 
        const token = sessionStorage.getItem('token');
        
        const formData = new FormData(event.currentTarget);
        const lojaIdValue = formData.get('lojaId');
        const lojaIdFinal = lojaIdValue ? parseInt(lojaIdValue as string, 10) : undefined;

        const updatedData = {
            nome: formData.get('nome') as string,
            unidade: formData.get('unidade') as string,
            marca: formData.get('marca') as string,
            codigo: formData.get('codigo') as string,
            corredor: formData.get('corredor') as string,
            producao: (event.currentTarget.elements.namedItem('producao') as HTMLInputElement).checked,
            fornecedorId: parseInt(formData.get('fornecedorId') as string, 10),
            quantidadeMin: parseInt(formData.get('quantidadeMin') as string, 10),
            quantidadeMax: parseInt(formData.get('quantidadeMax') as string, 10), 
            quantidadeEst: parseInt(formData.get('quantidadeEst') as string, 10), 
            observacoes: formData.get('observacoes') as string,
            ativo: (event.currentTarget.elements.namedItem('ativo') as HTMLInputElement).checked,
            lojaId: lojaIdFinal 
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
                method: 'PATCH', 
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            if (!response.ok) throw new Error("Falha ao atualizar.");
            await fetchProductsData(); 
            setEditingProductId(null);
        } catch (err) { setError(err instanceof Error ? err.message : "Erro."); }
    };

    const handleCreateProduct = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        const token = sessionStorage.getItem('token');
        const formData = new FormData(event.currentTarget);
        
        const lojaIdValue = formData.get('lojaId');
        const lojaIdFinal = lojaIdValue ? parseInt(lojaIdValue as string, 10) : 1;

        if (!lojaIdFinal) {
            setError("Selecione uma loja para cadastrar o produto.");
            return;
        }

        const createData = {
            nome: formData.get('nome') as string,
            unidade: formData.get('unidade') as string,
            marca: formData.get('marca') as string,
            codigo: formData.get('codigo') as string,
            corredor: formData.get('corredor') as string,
            producao: (event.currentTarget.elements.namedItem('producao') as HTMLInputElement).checked,
            fornecedorId: parseInt(formData.get('fornecedorId') as string, 10),
            quantidadeMin: parseInt(formData.get('quantidadeMin') as string, 10),
            quantidadeMax: parseInt(formData.get('quantidadeMax') as string, 10), 
            quantidadeEst: parseInt(formData.get('quantidadeEst') as string, 10), 
            observacoes: formData.get('observacoes') as string,
            ativo: (event.currentTarget.elements.namedItem('ativo') as HTMLInputElement).checked,
            lojaId: lojaIdFinal
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(createData),
            });

            if (!response.ok) throw new Error("Falha ao criar o produto.");
            await fetchProductsData(); 
            setShowCreateForm(false);

        } catch (err) {
            setError(err instanceof Error ? err.message : "Ocorreu um erro ao criar o produto.");
        }
    };

    if (isLoading) return <p>Carregando produtos...</p>;
    
    return (
        // 2. Wrapper principal para o CSS Module
        <div className={styles['main-wrapper']}>
            <div className={styles['page-header-produtos']}>
                <h1 className={styles['page-title-produtos']}>Produtos</h1>
            </div>
            {error && <p className={styles['error-message']}>{error}</p>}

            <ul className={styles['table-list-produtos']}>
                {products.map((product) => (
                    // 3. Classes condicionais
                    <li key={product.id} className={`${styles['table-container-produtos']} ${!product.ativo ? styles['produto-inativo'] : ''}`}>
                        <div className={styles['section-header-produtos']}>
                            <h2 className={styles['section-title-produtos']} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {product.codigo && <span style={{ color: 'var(--text-secondary)', fontSize: '0.9em' }}>({product.codigo})</span>}
                                <span>{product.nome}</span>
                                <span style={{ fontWeight: 'normal', color: 'var(--text-secondary)', fontSize: '0.9em' }}>
                                    ({product.unidade}) {product.marca ? `- ${product.marca}` : ''}
                                </span>
                                {product.producao && (
                                    <span className={styles['badge-producao']} title="Produção Própria">🏭 Produção</span>
                                )}
                            </h2>
                            <button className={styles['action-details']} onClick={() => handleToggleEdit(product.id)}>
                                {editingProductId === product.id ? 
                                    <IconDown className={styles['arrow-icon']} /> : 
                                    <IconLeft className={styles['arrow-icon']} />
                                }
                            </button>
                        </div>
                        <p><strong>Estoque (Loja):</strong> {product.quantidadeEst} | <strong>Mínimo:</strong> {product.quantidadeMin} | <strong>Máximo:</strong> {product.quantidadeMax}</p>
                        {product.observacoes && <p><strong>Observações:</strong> {product.observacoes}</p>}

                        {editingProductId === product.id && (
                            <div className={styles['form-divider-produtos']}>
                                <h3 className={styles['table-title-produtos']}>Editar Produto</h3>
                                <form onSubmit={(e) => handleUpdateProduct(e, product.id)}>
                                    
                                    <label>
                                        Loja:
                                        <select name="lojaId" defaultValue={product.lojaId || 1 || ""} required>
                                            {lojas.map(l => (
                                                <option key={l.id} value={l.id}>{l.nome}</option>
                                            ))}
                                        </select>
                                    </label>

                                    <label>Nome:<input type="text" name="nome" defaultValue={product.nome} required /></label>
                                    <label>Unidade:<input type="text" name="unidade" defaultValue={product.unidade} required /></label>
                                    <label>Marca:<input type="text" name="marca" defaultValue={product.marca ?? ''} /></label>
                                    <label>Código:<input type="text" name="codigo" defaultValue={product.codigo ?? ''} /></label>
                                    <label>Corredor:<input type="text" name="corredor" defaultValue={product.corredor ?? ''} /></label>
                                    <label>Fornecedor:
                                        <select name="fornecedorId" defaultValue={product.fornecedorId} required>
                                            {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                                        </select>
                                    </label>
                                    <label>Min:<input type="number" name="quantidadeMin" defaultValue={product.quantidadeMin} required /></label>
                                    <label>Max (Nec):<input type="number" name="quantidadeMax" defaultValue={product.quantidadeMax} required /></label>
                                    <label>Estoque (Loja):<input type="number" name="quantidadeEst" defaultValue={product.quantidadeEst} required /></label>
                                    <label>Observações:<textarea name="observacoes" defaultValue={product.observacoes ?? ''}></textarea></label>
                                    <label className={styles['checkbox-label']}>Produção:<input type="checkbox" name="producao" defaultChecked={product.producao} /></label>
                                    <label className={styles['checkbox-label']}>Ativo:<input type="checkbox" name="ativo" defaultChecked={product.ativo} /></label>
                                    
                                    <div className={styles['form-actions']}>
                                        <button type="submit" className={styles['btn-primary']}>Salvar Alterações</button>
                                        <button type="button" className={styles['btn-secondary']} onClick={() => setEditingProductId(null)}>Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </li>
                ))}

                <li key="add-product-card" className={styles['table-container-produtos']}>
                    <div className={styles['section-header-produtos']}>
                        <h2 className={styles['section-title-produtos']}>Adicionar Novo Produto</h2>
                        <button className={styles['action-details']} onClick={() => setShowCreateForm(!showCreateForm)}>
                            {showCreateForm ? 
                                <IconDown className={styles['arrow-icon']} /> : 
                                <IconLeft className={styles['arrow-icon']} />
                            }
                        </button>
                    </div>

                    {!showCreateForm && !error && (
                        <button className={styles['btn-primary']} onClick={() => setShowCreateForm(true)}>
                            Adicionar
                        </button>
                    )}

                    {showCreateForm && (
                        <form onSubmit={handleCreateProduct}>
                            <label>
                                Loja de Origem:
                                <select name="lojaId" defaultValue={1 || ""} required>
                                    <option value="" disabled>Selecione a Loja...</option>
                                    {lojas.map(l => (
                                        <option key={l.id} value={l.id}>{l.nome}</option>
                                    ))}
                                </select>
                            </label>

                            <label>Nome:<input type="text" name="nome" required /></label>
                            <label>Unidade:<input type="text" name="unidade" required /></label>
                            <label>Marca:<input type="text" name="marca" /></label>
                            <label>Código:<input type="text" name="codigo" /></label>
                            <label>Corredor:<input type="text" name="corredor" /></label>
                            <label>Fornecedor:
                                <select name="fornecedorId" defaultValue="" required>
                                    <option value="" disabled>Selecione...</option>
                                    {fornecedores.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
                                </select>
                            </label>
                            <label>Min:<input type="number" name="quantidadeMin" defaultValue={0} required /></label>
                            <label>Max (Nec):<input type="number" name="quantidadeMax" defaultValue={0} required /></label>
                            <label>Estoque (Inicial Loja):<input type="number" name="quantidadeEst" defaultValue={0} required /></label>
                            <label>Observações:<textarea name="observacoes"></textarea></label>
                            <label className={styles['checkbox-label']}>
                                Produção:
                                <input type="checkbox" name="producao" defaultChecked={false} />
                            </label>
                            <label className={styles['checkbox-label']}>
                                Ativo:
                                <input type="checkbox" name="ativo" defaultChecked={true} />
                            </label>

                            <div className={styles['form-actions']}>
                                <button type="submit" className={styles['btn-primary']}>Salvar Produto</button>
                                <button type="button" className={styles['btn-secondary']} onClick={() => setShowCreateForm(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}
                </li>
            </ul>
        </div>
    );
}
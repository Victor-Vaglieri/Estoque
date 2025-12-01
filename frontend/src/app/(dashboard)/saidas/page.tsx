"use client";

import React, { useState, useEffect } from 'react';
// 1. Importação como Objeto styles
import styles from './saidas.module.css';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { IconPlus } from '../../components/icons/IconPlus';
import { IconPencil } from '../../components/icons/IconPencil';

type Product = {
    id: number;
    nome: string;
    unidade: string;
    marca: string | null;
    codigo: string | null;
    quantidadeMin: number;
    quantidadeEst: number; 
    quantidadeMax: number;
    observacoes: string | null;
};

type Saida = {
    id: number;
    produtoId: number;
    produto?: Product;
    quantidade: number;
    data: string;
    responsavelId: number;
    motivo: string | null;
};

export default function SaidasEstoquePage() {
    const [saidas, setSaidas] = useState<Saida[]>([]);
    const [produtos, setProdutos] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSaida, setCurrentSaida] = useState<Partial<Saida>>({});
    
    const [originalQuantity, setOriginalQuantity] = useState(0);

    const { user } = useAuth();
    const router = useRouter();

    // --- CARREGAMENTO DE DADOS ---
    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        if (user) {
            if (!user.funcoes.some((f: string) => f === 'SAIDA' || f === 'GESTOR')) {
                router.push('/inicio');
                return;
            }
        }

        const loadData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                };

                const [resProducts, resSaidas] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { headers }),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/saidas`, { method: 'GET', headers })
                ]);

                if (!resProducts.ok) throw new Error("Falha ao carregar produtos.");
                if (!resSaidas.ok) throw new Error("Falha ao carregar saídas.");

                const productsData: Product[] = await resProducts.json();
                const saidasData = await resSaidas.json();

                setProdutos(productsData);
                setSaidas(saidasData);

            } catch (err) {
                setError((err as Error).message || "Erro desconhecido.");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user, router]);

    // --- HELPERS ---
    const getProductById = (id: number) => produtos.find(p => p.id === id);

    const getEstoqueNumerico = (produtoId: number | undefined): number => {
        if (!produtoId) return 0;
        const produto = getProductById(Number(produtoId));
        return produto ? produto.quantidadeEst : 0;
    }

    const getEstoqueAtualFormatado = (produtoId: number | undefined) => {
        if (!produtoId) return '0';
        const produto = getProductById(Number(produtoId));
        return produto ? `${produto.quantidadeEst} ${produto.unidade || ''}` : '0';
    }

    // --- LÓGICA DE FORMULÁRIO ---
    const resetForm = () => {
        setIsEditing(false);
        setOriginalQuantity(0);
        setCurrentSaida({
            data: new Date().toISOString().split('T')[0],
            quantidade: 1,
        });
        setError(null);
    };

    const handleToggleForm = () => {
        if (!isFormVisible) resetForm();
        setIsFormVisible(!isFormVisible);
    };

    const handleEditClick = (saida: Saida) => {
        setCurrentSaida({
            ...saida,
            data: new Date(saida.data).toISOString().split('T')[0],
            produtoId: Number(saida.produtoId), 
        });
        
        setOriginalQuantity(Number(saida.quantidade)); 
        
        setIsEditing(true);
        setIsFormVisible(true);
        setError(null);
        
        const estoqueAtual = getEstoqueNumerico(saida.produtoId);
        console.log(`EDITANDO: Estoque Banco=${estoqueAtual}, Original=${saida.quantidade}, Limite=${estoqueAtual + saida.quantidade}`);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let processedValue: any = value;

        if (type === 'number' || name === 'produtoId') {
            if (value === '') {
                processedValue = '';
            } else {
                const numValue = (name === 'produtoId') ? parseInt(value, 10) : parseFloat(value);
                processedValue = isNaN(numValue) ? '' : numValue;
            }
        }

        setCurrentSaida(prev => ({
            ...prev,
            [name]: processedValue,
        }));
    };

    // --- CÁLCULO DO LIMITE ---
    const estoqueAtual = getEstoqueNumerico(currentSaida.produtoId);
    
    const maxQuantityInput = isEditing 
        ? estoqueAtual + originalQuantity 
        : estoqueAtual;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!user) {
            setError("Sua sessão expirou. Faça login novamente.");
            return;
        }

        if (!currentSaida.produtoId || !currentSaida.quantidade) {
            setError("Produto e Quantidade são obrigatórios.");
            return;
        }

        if (currentSaida.quantidade > maxQuantityInput) {
            setError(`Quantidade indisponível. O máximo permitido é ${maxQuantityInput}.`);
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            const bodyParaApi = {
                ...currentSaida,
                data: new Date(currentSaida.data as string).toISOString(),
                produtoId: Number(currentSaida.produtoId),
                quantidade: Number(currentSaida.quantidade)
            };

            delete bodyParaApi.produto;
            // @ts-ignore
            delete bodyParaApi.responsavelId;

            if (isEditing) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/saidas/${currentSaida.id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify(bodyParaApi)
                });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || "Falha ao atualizar saída.");
                }
            } else {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/saidas`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(bodyParaApi)
                });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.message || "Falha ao registrar saída.");
                }
            }

            window.location.reload();

        } catch (err) {
            setError((err as Error).message || "Erro ao salvar.");
        }
    };

    return (
        // 2. Uso de Bracket Notation styles['class-name']
        <div className={styles['main-container-saidas']}>
            <header className={styles['page-header-saidas']}>
                <h1 className={styles['page-title-saidas']}>Gerenciar Saídas de Estoque</h1>
                <button className={styles['btn-primary']} onClick={handleToggleForm}>
                    <IconPlus />
                    {isFormVisible ? 'Fechar Formulário' : 'Registrar Nova Saída'}
                </button>
            </header>

            {error && <div className={styles['form-error-message']}>{error}</div>}

            {/* 3. Condicional com styles */}
            <div className={`${styles['saida-form-container']} ${isFormVisible ? styles['visible'] : ''}`}>
                <form className={styles['saida-form']} onSubmit={handleSubmit}>
                    <h2 className={styles['form-title']}>{isEditing ? 'Editar Saída' : 'Registrar Nova Saída'}</h2>

                    <div className={styles['form-group']}>
                        <label htmlFor="produtoId">Produto</label>
                        <select
                            id="produtoId"
                            name="produtoId"
                            value={currentSaida.produtoId || ''}
                            onChange={handleChange}
                            required
                            disabled={isEditing} 
                        >
                            <option value="" disabled>Selecione um produto...</option>
                            {produtos.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.codigo ? `(Cód: ${p.codigo}) ` : ''}{p.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles['form-group']}>
                        <label htmlFor="quantidade">
                            Quantidade
                            <span className={styles['stock-info']}>
                                (Disp: {getEstoqueAtualFormatado(currentSaida.produtoId)}
                                {isEditing && <span style={{ color: 'var(--primary)', marginLeft: '5px' }}>+ {originalQuantity} (retornável)</span>}
                                )
                            </span>
                        </label>
                        <input
                            type="number"
                            id="quantidade"
                            name="quantidade"
                            value={currentSaida.quantidade || ''}
                            onChange={handleChange}
                            min="1"
                            max={maxQuantityInput > 0 ? maxQuantityInput : undefined}
                            required
                        />
                        <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '2px', display: 'block' }}>
                            Máximo permitido: <strong>{maxQuantityInput}</strong>
                        </small>
                    </div>

                    <div className={styles['form-group']}>
                        <label htmlFor="data">Data da Saída</label>
                        <input
                            type="date"
                            id="data"
                            name="data"
                            value={currentSaida.data || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={`${styles['form-group']} ${styles['full-width']}`}>
                        <label htmlFor="motivo">Motivo / Observação</label>
                        <textarea
                            id="motivo"
                            name="motivo"
                            value={currentSaida.motivo || ''}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Ex: Manutenção, Produção..."
                        ></textarea>
                    </div>

                    <div className={`${styles['form-actions']} ${styles['full-width']}`}>
                        <button type="button" className={styles['btn-secondary']} onClick={handleToggleForm}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles['btn-primary']}>
                            {isEditing ? 'Salvar Alterações' : 'Registrar Saída'}
                        </button>
                    </div>
                </form>
            </div>

            <div className={styles['saida-list-container']}>
                <h2 className={styles['list-title']}>Histórico de Saídas Recentes</h2>
                {isLoading ? (
                    <p>Carregando...</p>
                ) : (
                    <div className={styles['saidas-table-wrapper']}>
                        <table className={styles['saidas-table']}>
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Qtd.</th>
                                    <th>Data</th>
                                    <th>Motivo</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {saidas.length > 0 ? (
                                    saidas.map(saida => (
                                        <tr key={saida.id}>
                                            <td data-label="Produto">
                                                {saida.produto?.nome || 'Produto não encontrado'}
                                            </td>
                                            <td className={styles['col-quantidade']} data-label="Qtd.">
                                                {saida.quantidade}
                                                <span className={styles['unidade-table']}>{saida.produto?.unidade}</span>
                                            </td>
                                            <td className={styles['col-data']} data-label="Data">
                                                {new Date(saida.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                            </td>
                                            <td className={styles['col-motivo']} data-label="Motivo">
                                                {saida.motivo}
                                            </td>
                                            <td className={styles['col-acoes']}>
                                                <button
                                                    className={`${styles['btn-aviso']} ${styles['btn-editar']}`}
                                                    title="Editar"
                                                    onClick={() => handleEditClick(saida)}
                                                >
                                                    <IconPencil />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className={styles['no-data-message']}>
                                            Nenhuma saída registrada ainda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
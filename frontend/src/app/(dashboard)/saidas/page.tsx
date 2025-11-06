"use client";

import React, { useState, useEffect } from 'react';
import './saidas.css';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { IconPlus } from '../../components/icons/IconPlus'
import { IconPencil } from '../../components/icons/IconPencil'

// --- Tipos (baseado no seu Prisma Schema e Interface) ---
type Product = {
    id: number;
    nome: string;
    unidade: string; // Garantido com base no schema
    marca: string | null;
    ultimoPreco: number | null;
    precoMedio: number | null;
    quantidadeMin: number;
    quantidadeEst: number;
    quantidadeNec: number;
    observacoes: string | null;
};

type Responsavel = {
    id: number;
    nome: string;
};

type Saida = {
    id: number;
    produtoId: number;
    produto?: Product; // Relação (opcional para o form) - ATUALIZADO
    quantidade: number;
    data: string;
    responsavelId: number;
    responsavel?: Responsavel; // Relação (opcional para o form)
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

    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        if (user){
            if (!user.funcoes.some(f => f === 'FUNCIONARIO' || f === 'GESTOR')) {
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

                const resProducts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/withStock`, { headers });
                const resSaidas = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/saidas`, { method: 'GET', headers });

                if (!resProducts.ok) {
                    throw new Error("Falha ao carregar dados dos produtos.");
                }
                const productsData: Product[] = await resProducts.json();
                setProdutos(productsData);

                console.log(resSaidas);
                if (!resSaidas.ok) {
                    throw new Error("Falha ao carregar dados das saidas registradas.");
                }
                console.log(resSaidas);
                const saidasData = await resSaidas.json();
                setSaidas(saidasData);

            } catch (err) {
                setError((err as Error).message || "Ocorreu um erro desconhecido.");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user,router]); // Adicionado router como dependência

    const getProductById = (id: number) => produtos.find(p => p.id === id); // ATUALIZADO

    const resetForm = () => {
        setIsEditing(false);
        setCurrentSaida({
            data: new Date().toISOString().split('T')[0],
            quantidade: 1,
        });
    };

    const handleToggleForm = () => {
        if (!isFormVisible) {
            resetForm();
        }
        setIsFormVisible(!isFormVisible);
    };

    const handleEditClick = (saida: Saida) => {
        setCurrentSaida({
            ...saida,
            data: new Date(saida.data).toISOString().split('T')[0],
        });
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let processedValue: string | number = value;
        if (type === 'number') {
            processedValue = parseFloat(value);
        }
        else if (name === 'produtoId') {
            processedValue = parseInt(value, 10);
        }


        // Permite limpar o campo de número (evita NaN)
        if ((type === 'number' || name === 'produtoId') && isNaN(processedValue as number)) {
            processedValue = ''; // Seta como string vazia se a conversão falhar (ex: campo vazio)
        }


        setCurrentSaida(prev => ({
            ...prev,
            [name]: processedValue,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!user) {
            setError("Sua sessão expirou. Faça login novamente.");
            return;
        }

        // Validação Simples
        if (!currentSaida.produtoId || !currentSaida.quantidade) {
            setError("Produto e Quantidade são obrigatórios.");
            return;
        }

        // --- Lógica de API (AGORA COM API) ---
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };

            const bodyParaApi = {
                ...currentSaida,
                data: new Date(currentSaida.data as string).toISOString(),
                produtoId: Number(currentSaida.produtoId), // Garante que é número
                quantidade: Number(currentSaida.quantidade) // Garante que é número
            };

            // Remove o 'produto' do body se ele existir (não deve ser enviado)
            delete bodyParaApi.produto;

            if (isEditing) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/saidas/${currentSaida.id}`, {
                    method: 'PATCH', // MUDANÇA: Usando PATCH como solicitado
                    headers: headers,
                    body: JSON.stringify(bodyParaApi)
                });

                if (!response.ok) throw new Error("Falha ao atualizar saída.");

                const updatedSaidaFromApi = await response.json();
                // Popula os dados de relação manualmente para UI (caso a API não retorne)
                const updatedSaida = {
                    ...updatedSaidaFromApi,
                    produto: getProductById(updatedSaidaFromApi.produtoId)
                };

                setSaidas(saidas.map(s => s.id === updatedSaida.id ? updatedSaida : s));

            } else {
                // --- Lógica de Create (POST) ---
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/saidas`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(bodyParaApi)
                });

                if (!response.ok) throw new Error("Falha ao registrar saída.");

                const newSaidaFromApi = await response.json();
                // Popula os dados de relação manualmente para UI
                const newSaida = {
                    ...newSaidaFromApi,
                    produto: getProductById(newSaidaFromApi.produtoId)
                };
                setSaidas([newSaida, ...saidas]);
            }

            setIsFormVisible(false);
            resetForm();

        } catch (err) {
            setError((err as Error).message || "Ocorreu um erro ao salvar.");
        }
    };

    const getEstoqueAtual = (produtoId: number | undefined) => {
        if (!produtoId) return 0;
        const produto = getProductById(produtoId);
        return produto ? `${produto.quantidadeEst} ${produto.unidade || ''}` : '0';
    }

    return (
        <div className="main-container-saidas">

            {/* --- Cabeçalho da Página --- */}
            <header className="page-header-saidas">
                <h1 className="page-title-saidas">Gerenciar Saídas de Estoque</h1>
                <button className="btn-primary" onClick={handleToggleForm}>
                    <IconPlus />
                    {isFormVisible ? 'Fechar Formulário' : 'Registrar Nova Saída'}
                </button>
            </header>

            {/* --- Mensagem de Erro --- */}
            {error && <div className="form-error-message">{error}</div>}

            {/* --- Formulário de Saída (Slide-down) --- */}
            <div className={`saida-form-container ${isFormVisible ? 'visible' : ''}`}>
                <form className="saida-form" onSubmit={handleSubmit}>
                    <h2 className="form-title">{isEditing ? 'Editar Saída' : 'Registrar Nova Saída'}</h2>

                    {/* --- Linha 1: Produto e Responsável --- */}
                    <div className="form-group">
                        <label htmlFor="produtoId">Produto</label>
                        <select
                            id="produtoId"
                            name="produtoId"
                            value={currentSaida.produtoId || ''}
                            onChange={handleChange}
                            required
                        >
                            <option value="" disabled>Selecione um produto...</option>
                            {produtos.map(p => (
                                <option key={p.id} value={p.id}>{p.nome}</option>
                            ))}
                        </select>
                    </div>

                    {/* --- Linha 2: Quantidade e Data --- */}
                    <div className="form-group">
                        <label htmlFor="quantidade">
                            Quantidade
                            <span className="stock-info">
                                (Estoque: {getEstoqueAtual(currentSaida.produtoId)})
                            </span>
                        </label>
                        <input
                            type="number"
                            id="quantidade"
                            name="quantidade"
                            value={currentSaida.quantidade || ''}
                            onChange={handleChange}
                            min="1"
                            max={getEstoqueAtual(currentSaida.produtoId)}
                            required
                        />
                    </div>

                    <div className="form-group">
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

                    {/* --- Linha 3: Motivo (Full-width) --- */}
                    <div className="form-group full-width">
                        <label htmlFor="motivo">Motivo / Observação</label>
                        <textarea
                            id="motivo"
                            name="motivo"
                            value={currentSaida.motivo || ''}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Ex: Manutenção da máquina X, Produção do lote Y..."
                        ></textarea>
                    </div>

                    {/* --- Ações do Formulário --- */}
                    <div className="form-actions full-width">
                        <button type="button" className="btn-secondary" onClick={handleToggleForm}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-primary">
                            {isEditing ? 'Salvar Alterações' : 'Registrar Saída'}
                        </button>
                    </div>
                </form>
            </div>

            {/* --- Lista de Saídas --- */}
            <div className="saida-list-container">
                <h2 className="list-title">Histórico de Saídas Recentes</h2>
                {isLoading ? (
                    <p>Carregando...</p>
                ) : (
                    <div className="saidas-table-wrapper">
                        <table className="saidas-table">
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
                                            {/* ADICIONADO: data-label="Produto" */}
                                            <td data-label="Produto">
                                                {saida.produto?.nome || 'Produto não encontrado'}
                                            </td>
                                            {/* ADICIONADO: data-label="Qtd." */}
                                            <td className="col-quantidade" data-label="Qtd.">
                                                {saida.quantidade}
                                                <span className="unidade-table">{saida.produto?.unidade}</span>
                                            </td>
                                            {/* ADICIONADO: data-label="Data" */}
                                            <td className="col-data" data-label="Data">
                                                {new Date(saida.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                            </td>
                                            {/* ADICIONADO: data-label="Motivo" */}
                                            <td className="col-motivo" data-label="Motivo">
                                                {saida.motivo}
                                            </td>
                                            {/* O 'col-acoes' não precisa de label */}
                                            <td className="col-acoes">
                                                <button
                                                    className="btn-aviso btn-editar"
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
                                        <td colSpan={5} className="no-data-message">
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


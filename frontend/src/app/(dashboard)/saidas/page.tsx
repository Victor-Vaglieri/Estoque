"use client";

import React, { useState, useEffect } from 'react';
import './saidas.css'; 
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
    ultimoPreco: number | null;
    precoMedio: number | null;
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

    
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login'); 
            return;
        }

        
        
        if (user){
            
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

                
                const resProducts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { headers });
                const resSaidas = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/saidas`, { method: 'GET', headers });

                if (!resProducts.ok) {
                    throw new Error("Falha ao carregar dados dos produtos.");
                }
                const productsData: Product[] = await resProducts.json();
                setProdutos(productsData);

                if (!resSaidas.ok) {
                    throw new Error("Falha ao carregar dados das saidas registradas.");
                }
                const saidasData = await resSaidas.json();
                setSaidas(saidasData); 

            } catch (err) {
                setError((err as Error).message || "Ocorreu um erro desconhecido.");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user,router]); 

    const getProductById = (id: number) => produtos.find(p => p.id === id); 

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

        
        try {
            const token = localStorage.getItem('token');
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
            delete (bodyParaApi as Partial<Saida>).responsavelId;

            if (isEditing) {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/saidas/${currentSaida.id}`, {
                    method: 'PATCH', 
                    headers: headers,
                    body: JSON.stringify(bodyParaApi)
                });
                if (!response.ok) throw new Error("Falha ao atualizar saída.");
                
                const updatedSaidaFromApi = await response.json();
                const updatedSaida = {
                    ...updatedSaidaFromApi,
                    produto: getProductById(updatedSaidaFromApi.produtoId)
                };
                setSaidas(saidas.map(s => s.id === updatedSaida.id ? updatedSaida : s));
            
            } else {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/saidas`, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(bodyParaApi)
                });
                if (!response.ok) throw new Error("Falha ao registrar saída.");
                
                const newSaidaFromApi = await response.json();
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

    
    const getEstoqueNumerico = (produtoId: number | undefined): number => {
        if (!produtoId) return 0;
        const produto = getProductById(produtoId);
        return produto ? produto.quantidadeEst : 0;
    }

    
    const getEstoqueAtualFormatado = (produtoId: number | undefined) => {
        if (!produtoId) return '0';
        const produto = getProductById(produtoId);
        return produto ? `${produto.quantidadeEst} ${produto.unidade || ''}` : '0';
    }

    return (
        <div className="main-container-saidas">
            {}

            {}
            <header className="page-header-saidas">
                <h1 className="page-title-saidas">Gerenciar Saídas de Estoque</h1>
                <button className="btn-primary" onClick={handleToggleForm}>
                    <IconPlus />
                    {isFormVisible ? 'Fechar Formulário' : 'Registrar Nova Saída'}
                </button>
            </header>

            {}
            {error && <div className="form-error-message">{error}</div>}

            {}
            <div className={`saida-form-container ${isFormVisible ? 'visible' : ''}`}>
                <form className="saida-form" onSubmit={handleSubmit}>
                    <h2 className="form-title">{isEditing ? 'Editar Saída' : 'Registrar Nova Saída'}</h2>

                    {}
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
                            {}
                            {produtos.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.codigo ? `(Cód: ${p.codigo}) ` : ''}{p.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {}
                    <div className="form-group">
                        <label htmlFor="quantidade">
                            Quantidade
                            <span className="stock-info">
                                {}
                                (Estoque: {getEstoqueAtualFormatado(currentSaida.produtoId)})
                            </span>
                        </label>
                        <input
                            type="number"
                            id="quantidade"
                            name="quantidade"
                            value={currentSaida.quantidade || ''}
                            onChange={handleChange}
                            min="1"
                            
                            max={getEstoqueNumerico(currentSaida.produtoId)}
                            required
                        />
                    </div>

                    {}
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

                    {}
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

                    {}
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

            {}
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
                                            <td data-label="Produto">
                                                {saida.produto?.nome || 'Produto não encontrado'}
                                            </td>
                                            <td className="col-quantidade" data-label="Qtd.">
                                                {saida.quantidade}
                                                <span className="unidade-table">{saida.produto?.unidade}</span>
                                            </td>
                                            <td className="col-data" data-label="Data">
                                                {new Date(saida.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                            </td>
                                            <td className="col-motivo" data-label="Motivo">
                                                {saida.motivo}
                                            </td>
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
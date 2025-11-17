"use client";

import { useState, useEffect } from 'react';
// Usando caminho de alias padrão
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
// MUDANÇA: Adicionado 'Cell' para o gráfico de barras
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

import "./relatorios.css";

// MUDANÇA: Interface para o gráfico de barras por Loja
interface StockValueByLoja {
    name: string; // Nome da Loja
    value: number; // Valor total (R$)
}
interface PurchaseHistory {
    month: string;
    totalSpent: number;
}

// Cores para gráficos de barra
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function RelatoriosPage() {
    const router = useRouter();
    const { user } = useAuth();

    // --- Estados para os dados dos gráficos e KPIs ---
    const [totalStockValue, setTotalStockValue] = useState<number | null>(null);
    const [totalItems, setTotalItems] = useState<number | null>(null);
    const [lowStockCount, setLowStockCount] = useState<number | null>(null);
    // MUDANÇA: Estado para o novo gráfico
    const [stockValueByLoja, setStockValueByLoja] = useState<StockValueByLoja[]>([]);
    const [purchaseHistoryData, setPurchaseHistoryData] = useState<PurchaseHistory[]>([]);

    // --- MUDANÇA: Estados para os filtros de data ---
    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);


    // Estados de feedback
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);


    // --- Funções para buscar dados dos relatórios ---
    const fetchReportData = async () => {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }


        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            // MUDANÇA: Endpoints atualizados
            const [overviewRes, stockValueRes, purchaseHistoryRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/relatorios/overview`, { headers }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/relatorios/stock-value-by-loja`, { headers }), // MUDANÇA
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/relatorios/purchase-history`, { headers })
            ]);

            // Verifica se todas as respostas foram bem-sucedidas
            if (!overviewRes.ok) throw new Error(`Erro ao buscar visão geral: ${overviewRes.statusText}`);
            if (!stockValueRes.ok) throw new Error(`Erro ao buscar valor de estoque: ${stockValueRes.statusText}`);
            if (!purchaseHistoryRes.ok) throw new Error(`Erro ao buscar histórico de compras: ${purchaseHistoryRes.statusText}`);


            const overviewData = await overviewRes.json();
            const stockValueChartData: StockValueByLoja[] = await stockValueRes.json(); // MUDANÇA
            const purchaseHistoryChartData: PurchaseHistory[] = await purchaseHistoryRes.json();

            // Atualiza os estados
            setTotalStockValue(overviewData.totalValue);
            setTotalItems(overviewData.totalItems);
            setLowStockCount(overviewData.lowStockCount);
            setStockValueByLoja(stockValueChartData); // MUDANÇA
            setPurchaseHistoryData(purchaseHistoryChartData);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar os relatórios.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            // Esta é uma página de GESTOR
            if (!user.funcoes.some(f => f === 'GESTOR')) {
                setError("Acesso negado. Você precisa ser um gestor para ver os relatórios.");
                setIsLoading(false);
                // setTimeout(() => router.push('/inicio')); // Comentado para permitir visualização
                return;
            }
            fetchReportData();
        } else {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
            }
        }
    }, [user, router]);


    // --- MUDANÇA: Função atualizada para lidar com os novos downloads ---
    const handleDownloadXLSX = async (reportType: 'controle' | 'fornecedores') => {
        setIsDownloading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            setIsDownloading(false);
            return;
        }

        let url = `${process.env.NEXT_PUBLIC_API_URL}/relatorios/export/${reportType}`;
        let fileName = `${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;

        // Adiciona parâmetros de data se for o relatório de 'controle'
        if (reportType === 'controle') {
            if (!startDate || !endDate) {
                setError("Por favor, selecione uma data de início e fim.");
                setIsDownloading(false);
                return;
            }
            url += `?startDate=${startDate}&endDate=${endDate}`;
            fileName = `controle_${startDate}_a_${endDate}.xlsx`;
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                let errorMsg = `Falha ao gerar o relatório ${reportType}.`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) {
                    errorMsg = `${errorMsg} (Status: ${response.status} ${response.statusText})`;
                }
                throw new Error(errorMsg);
            }

            const blob = await response.blob();
            if (blob.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                throw new Error(`O servidor não retornou um ficheiro XLSX válido para ${reportType}.`);
            }

            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;
            a.download = fileName; // Nome do arquivo dinâmico
            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(downloadUrl);
            a.remove();

        } catch (err) {
            setError(err instanceof Error ? err.message : `Erro ao baixar o relatório ${reportType}.`);
        } finally {
            setIsDownloading(false);
        }
    };


    return (
        <>
            <div className="page-header-relatorios">
                <h1 className="page-title-relatorios">Relatórios de Gestão</h1>
            </div>

            {error && !isLoading && <p className="relatorios-message relatorios-error">{error}</p>}
            {isLoading && <p>Carregando relatórios...</p>}

            {!isLoading && !error && (
                <div className="relatorios-container">

                    {/* --- 1. Secção Visão Geral (KPIs) --- */}
                    <section className="report-section">
                        <h2 className="section-title">Visão Geral (Todas as Lojas)</h2>
                        <div className="kpi-grid">
                            <div className="kpi-card">
                                <h3>Valor Total (R$)</h3>
                                <p>R$ {totalStockValue?.toFixed(2) ?? 'N/A'}</p>
                            </div>
                            <div className="kpi-card">
                                <h3>Itens Distintos</h3>
                                <p>{totalItems ?? 'N/A'}</p>
                            </div>
                            <div className={`kpi-card ${lowStockCount && lowStockCount > 0 ? 'kpi-warning' : ''}`}>
                                <h3>Itens Abaixo Mín.</h3>
                                <p>{lowStockCount ?? 'N/A'}</p>
                            </div>
                        </div>
                    </section>

                    {/* --- 3. MUDANÇA: Secção Downloads --- */}
                    <section className="report-section">
                        <h2 className="section-title">Downloads (XLSX)</h2>
                        
                        <div className="download-form">
                            <h3 className="download-subtitle">Relatório de Controle (Serviços)</h3>
                            <div className="date-filters">
                                <label>
                                    Data Início:
                                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </label>
                                <label>
                                    Data Fim:
                                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                </label>
                            </div>
                            <button
                                className="btn-secondary"
                                onClick={() => handleDownloadXLSX('controle')}
                                disabled={isDownloading}
                            >
                                {isDownloading ? 'Gerando...' : 'Baixar Relatório de Controle'}
                            </button>
                        </div>
                        
                        <div className="download-form">
                             <h3 className="download-subtitle">Relatório de Estoque por Fornecedor</h3>
                             <button
                                className="btn-secondary"
                                onClick={() => handleDownloadXLSX('fornecedores')}
                                disabled={isDownloading}
                            >
                                {isDownloading ? 'Gerando...' : 'Baixar Relatório de Fornecedores'}
                            </button>
                        </div>
                    </section>

                    {/* --- 2. Secção Gráficos --- */}
                    <section className="report-section">
                        <h2 className="section-title">Gráficos</h2>
                        <div className="charts-grid">


                            {/* --- MUDANÇA: Gráfico 1 (Pizza para Barras) --- */}
                            <div className="chart-container">
                                <h3>Valor do Estoque por Loja (R$)</h3>
                                {stockValueByLoja.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={stockValueByLoja} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                           <CartesianGrid strokeDasharray="3 3" />
                                           <XAxis dataKey="name" />
                                           <YAxis />
                                           <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                                           <Legend />
                                           <Bar dataKey="value" name="Valor (R$)" fill="#0088FE">
                                                {stockValueByLoja.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                           </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="no-data-message">Sem dados para exibir o gráfico de valor.</p>
                                )}
                            </div>



                            {/* Gráfico 2: Histórico de Compras (Sem mudança) */}
                            <div className="chart-container">
                                <h3>Valor Gasto em Compras (Mensal)</h3>
                                {purchaseHistoryData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={purchaseHistoryData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                                            <Legend />
                                            <Bar dataKey="totalSpent" name="Gasto Total (R$)" fill="#00ccffff" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="no-data-message">Sem dados para exibir o histórico de compras.</p>
                                )}
                            </div>

                        </div>
                    </section>

                </div>
            )}
        </>
    );
}
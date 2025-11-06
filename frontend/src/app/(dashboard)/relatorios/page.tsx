"use client";

import { useState, useEffect } from 'react';
// Usando caminho de alias padrão
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

import "./relatorios.css";

interface StockValue {
    name: string;
    value: number;
    [key: string]: any;
}
interface PurchaseHistory {
    month: string;
    totalSpent: number;
}

// Cores para gráficos de pizza/barra
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#83a6ed'];

export default function RelatoriosPage() {
    const router = useRouter();
    const { user } = useAuth();

    // --- Estados para os dados dos gráficos e KPIs ---
    const [totalStockValue, setTotalStockValue] = useState<number | null>(null);
    const [totalItems, setTotalItems] = useState<number | null>(null);
    const [lowStockCount, setLowStockCount] = useState<number | null>(null);
    const [stockValueData, setStockValueData] = useState<StockValue[]>([]);
    const [purchaseHistoryData, setPurchaseHistoryData] = useState<PurchaseHistory[]>([]);

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
            // Exemplo: Buscar múltiplos dados de relatórios em paralelo
            const [overviewRes, stockValueRes, purchaseHistoryRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/relatorios/overview`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/relatorios/stock-value`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/relatorios/purchase-history`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            // Verifica se todas as respostas foram bem-sucedidas
            if (!overviewRes.ok) throw new Error(`Erro ao buscar visão geral: ${overviewRes.statusText}`);
            if (!stockValueRes.ok) throw new Error(`Erro ao buscar valor de estoque: ${stockValueRes.statusText}`);
            if (!purchaseHistoryRes.ok) throw new Error(`Erro ao buscar histórico de compras: ${purchaseHistoryRes.statusText}`);


            const overviewData = await overviewRes.json();
            const stockValueChartData: StockValue[] = await stockValueRes.json();
            const purchaseHistoryChartData: PurchaseHistory[] = await purchaseHistoryRes.json();

            // Atualiza os estados
            setTotalStockValue(overviewData.totalValue);
            setTotalItems(overviewData.totalItems);
            setLowStockCount(overviewData.lowStockCount);
            setStockValueData(stockValueChartData);
            setPurchaseHistoryData(purchaseHistoryChartData);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro ao carregar os relatórios.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            if (!user.funcoes.some(f => f === 'GESTOR')) {
                setError("Acesso negado. Você precisa ser um gestor para ver os relatórios.");
                setIsLoading(false);

                setTimeout(() => router.push('/inicio'));
                return;
            }

            fetchReportData();

        } else {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
            }
        }

    }, [user, router,fetchReportData]);


    // --- Função para lidar com o download de XLSX ---
    const handleDownloadXLSX = async (reportType: 'inventario' | 'compras') => {
        setIsDownloading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            setIsDownloading(false); // Para o loading se não houver token
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/relatorios/${reportType}/xlsx`, {
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
                console.error('Tipo de conteúdo recebido inesperado:', blob.type);
                throw new Error(`O servidor não retornou um ficheiro XLSX válido para ${reportType}.`);
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none'; // Esconde o link
            a.href = url;
            a.download = `${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(url);
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
                <h1 className="page-title-relatorios">Relatórios de Estoque</h1>
            </div>

            {error && !isLoading && <p className="relatorios-message relatorios-error">{error}</p>}
            {isLoading && <p>Carregando relatórios...</p>}

            {!isLoading && !error && (
                <div className="relatorios-container">

                    {/* --- 1. Secção Visão Geral (KPIs) --- */}
                    <section className="report-section">
                        <h2 className="section-title">Visão Geral</h2>
                        <div className="kpi-grid">
                            <div className="kpi-card">
                                <h3>Valor Estimado</h3>
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

                    {/* --- 3. Secção Downloads --- */}
                    <section className="report-section">
                        <h2 className="section-title">Downloads (XLSX)</h2>
                        <div className="download-buttons">
                            <button
                                className="btn-secondary"
                                onClick={() => handleDownloadXLSX('inventario')}
                                disabled={isDownloading}
                            >
                                {isDownloading ? 'Gerando...' : 'Baixar Inventário Completo'}
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => handleDownloadXLSX('compras')}
                                disabled={isDownloading}
                            >
                                {isDownloading ? 'Gerando...' : 'Baixar Histórico de Compras'}
                            </button>
                        </div>
                    </section>

                    {/* --- 2. Secção Gráficos --- */}
                    <section className="report-section">
                        <h2 className="section-title">Gráficos</h2>
                        <div className="charts-grid">


                            {/* --- MUDANÇA: Gráfico 1 (Barras para Pizza) --- */}
                            <div className="chart-container">
                                <h3>Valor do Estoque por Produto (Top 10)</h3>
                                {stockValueData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <PieChart>
                                            <Pie
                                                data={stockValueData.slice(0, 10)} // Pega os 10 primeiros
                                                dataKey="value" // O valor numérico
                                                nameKey="name"  // O nome para a legenda/tooltip
                                                cx="50%" // Centro X
                                                cy="50%" // Centro Y
                                                outerRadius={120} // Raio do gráfico
                                                fill="#03e20eff" // Cor base (será sobrescrita por Cell)
                                            >
                                                {/* Mapeia os dados para criar uma fatia colorida para cada item */}
                                                {stockValueData.slice(0, 10).map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            {/* Tooltip que aparece ao passar o rato */}
                                            <Tooltip formatter={(value: number, name: string, props) => [`R$ ${value.toFixed(2)}`, props.payload.name]} />
                                            {/* Legenda (em baixo, para mobile) */}
                                            <Legend
                                                layout="horizontal"
                                                verticalAlign="bottom"
                                                align="center"
                                                wrapperStyle={{
                                                    paddingTop: '30px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'wrap',
                                                    lineHeight: '1.5rem'
                                                }}
                                                iconType="circle"
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="no-data-message">Sem dados para exibir o gráfico de valor.</p>
                                )}
                            </div>



                            {/* Gráfico 2: Histórico de Compras */}
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


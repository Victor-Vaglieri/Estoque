"use client";

import { useState, useEffect } from 'react';
// Usando caminho de alias padrão
import { useAuth } from '@/app/context/AuthContext'; 
import { useRouter } from 'next/navigation';
// Importa componentes de gráficos (exemplo com Recharts)
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';


// --- Interfaces para os dados dos relatórios (exemplos) ---
interface StockValue {
    name: string;
    value: number;
}

interface PurchaseHistory {
    month: string;
    totalSpent: number;
}

// Cores para gráficos de pizza/barra
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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
    const [isDownloading, setIsDownloading] = useState(false); // Para feedback de download


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

            if (!overviewRes.ok || !stockValueRes.ok || !purchaseHistoryRes.ok) {
                 throw new Error('Falha ao carregar dados dos relatórios.');
            }

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

    // Busca inicial
    useEffect(() => {
        fetchReportData();
    }, [router]);

    // --- Função para lidar com o download de XLSX ---
    const handleDownloadXLSX = async (reportType: 'inventario' | 'compras') => {
        setIsDownloading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/relatorios/${reportType}/xlsx`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                 let errorMsg = `Falha ao gerar o relatório ${reportType}.`;
                try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) { /* Ignora */ }
                throw new Error(errorMsg);
            }

            // Força o download do ficheiro XLSX
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`; // Nome do ficheiro ex: inventario_2025-10-28.xlsx
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url); // Libera memória

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

                    {/* --- 2. Secção Gráficos --- */}
                    <section className="report-section">
                         <h2 className="section-title">Gráficos</h2>
                         <div className="charts-grid">
                            
                            {/* Gráfico 1: Valor por Produto */}
                            <div className="chart-container">
                                <h3>Valor do Estoque por Produto (Top 10)</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={stockValueData.slice(0, 10)} /* Mostra Top 10 */ margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} interval={0}/>
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                                        <Legend />
                                        <Bar dataKey="value" name="Valor (R$)" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                             {/* Gráfico 2: Histórico de Compras */}
                            <div className="chart-container">
                                <h3>Valor Gasto em Compras (Mensal)</h3>
                                 <ResponsiveContainer width="100%" height={300}>
                                     <BarChart data={purchaseHistoryData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                                        <Legend />
                                        <Bar dataKey="totalSpent" name="Gasto Total (R$)" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
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

                </div>
            )}
        </>
    );
}

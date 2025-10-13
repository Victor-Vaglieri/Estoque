// app/(dashboard)/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';

// Importe seu novo arquivo CSS aqui
import './inicio.css';

// Componente para os cards de estatísticas
const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="stat-card">
    <h3 className="stat-card-title">{title}</h3>
    <p className="stat-card-value">{value}</p>
  </div>
);

interface DashboardStats {
  historico_compra_pendente: number;
  nome_ultimo_produto_chego: string;
  quantidade_itens_abaixo_min: number;
  quantidade_saida: number;
  // Adicione outras propriedades que sua API retorna
}


export default function DashboardHomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Obtenha o usuário (que contém o token)

  // 3. Use o useEffect para buscar os dados quando o componente for montado
  useEffect(() => {
    // Função assíncrona para buscar os dados
    const fetchDashboardData = async () => {
      // Garante que temos o token antes de fazer a chamada
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Usuário não autenticado.");
        setIsLoading(false);
        return;
      }

      try {
        // Substitua pela URL real da sua API
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
          method: 'GET',
          headers: {
            // Envie o token de autenticação no cabeçalho
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar os dados do dashboard.');
        }

        const data: DashboardStats = await response.json();
        setStats(data); // Salva o OBJETO no estado
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
      } finally {
        setIsLoading(false); // 5. Finaliza o estado de carregamento
      }
    };

    fetchDashboardData();
  }, []); // O array vazio [] garante que o useEffect rode apenas uma vez

  return (
    <>
      {/* Cabeçalho da Página */}
      <div className="page-header">
        <h2 className="page-title">Inventory Overview</h2>
      </div>

      {/* Grid de Estatísticas */}
      <div className="stats-grid">
        <StatCard title="Itens com Estoque Baixo" value={stats?.historico_compra_pendente.toString()|| 'NaN'} />
        <StatCard title="Saídas de Itens" value={stats?.quantidade_saida.toString() || 'NaN'} />
        <StatCard title="Compras Pendentes" value={stats?.quantidade_itens_abaixo_min.toString() || 'NaN'} />
        <StatCard title="Último Recebimento" value={stats?.nome_ultimo_produto_chego || 'ERRO'} />
      </div>

      {/* Tabela de Movimentações */}
      <div className="section-header">
        <h1 className="section-title">Alertas e Avisos</h1>
      </div>
      {/* TODO acessar a div table-list pra colocar os avisos*/}
      <ul className="table-list">
        <li className="table-container"><h3>⚠️ Produto "XYZ" está com estoque baixo.</h3></li>
        <li className="table-container"><h3>ℹ️ Novo fornecedor "ABC Supplies" adicionado.</h3></li>
        <li className="table-container"><h3>✅ Pedido #1234 concluído com sucesso.</h3></li>
      </ul>
    </>
  );
}
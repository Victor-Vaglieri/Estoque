"use client";

import { useState, useEffect } from 'react';
// Usando caminho relativo para corrigir o erro de importação
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

// Importe seu novo arquivo CSS aqui
import './inicio.css'; // Corrigido para corresponder ao nome do arquivo

// Componente para os cards de estatísticas
const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="stat-card">
    <h3 className="stat-card-title">{title}</h3>
    <p className="stat-card-value">{value}</p>
  </div>
);

interface DashboardStats {
  quantidade_itens_abaixo_min: number;
  quantidade_saida: number;
  historico_compra_pendente: number;
  nome_ultimo_produto_chego: string;
}

interface Alert {
  id: number;
  titulo: string;
  descricao: string;
  importancia: 'ALTA' | 'MEDIA' | 'BAIXA' | 'AVISO';
}


export default function DashboardHomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Usuário não autenticado.");
        setIsLoading(false);
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      try {
        const responseDashboards = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const responseAlerts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alerts`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!responseDashboards.ok) {
            throw new Error('Falha ao buscar os dados de estatísticas.');
        }
         if (!responseAlerts.ok) {
             throw new Error('Falha ao buscar os dados de alertas.');
         }

        const alertsData = await responseAlerts.json();
        
        const allAlerts: Alert[] = [];

        // Transforma os dados recebidos no formato que precisamos
        alertsData.alerta_alto.forEach((alert: any) => allAlerts.push({
          id: alert.id,
          titulo: `🚨 ${alert.titulo}`, // Adiciona um ícone ao título
          descricao: alert.descricao,
          importancia: 'ALTA'
        }));
        alertsData.alerta_medio.forEach((alert: any) => allAlerts.push({
          id: alert.id,
          titulo: `⚠️ ${alert.titulo}`,
          descricao: alert.descricao,
          importancia: 'MEDIA'
        }));
        alertsData.alerta_baixo.forEach((alert: any) => allAlerts.push({
          id: alert.id,
          titulo: `ℹ️ ${alert.titulo}`,
          descricao: alert.descricao,
          importancia: 'BAIXA'
        }));
        alertsData.aviso_ao_usuario.forEach((alert: any) => allAlerts.push({
          id: alert.id,
          titulo: `🔔 ${alert.titulo}`,
          descricao: alert.descricao,
          importancia: 'AVISO'
        }));

        setAlerts(allAlerts);
        const data: DashboardStats = await responseDashboards.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]); // Adicionado router como dependência

  return (
    <>
      {/* Cabeçalho da Página */}
      <div className="page-header">
        <h2 className="page-title">Visão do Estoque</h2>
      </div>

      {/* Grid de Estatísticas */}
      {isLoading && <p>Carregando estatísticas...</p>}
      {error && <p className="dash-message dash-error">{error}</p>}
      
      {!isLoading && stats && (
        <div className="stats-grid">
          <StatCard title="Itens com Estoque Baixo" value={stats?.quantidade_itens_abaixo_min.toString() || '0'} />
          <StatCard title="Saídas de Itens (Hoje)" value={stats?.quantidade_saida.toString() || '0'} />
          <StatCard title="Compras Pendentes" value={stats?.historico_compra_pendente.toString() || '0'} />
          <StatCard title="Último Recebimento" value={stats?.nome_ultimo_produto_chego || 'Nenhum'} />
        </div>
      )}


      {/* Secção de Alertas e Avisos */}
      <div className="section-header">
        <h1 className="section-title">Alertas e Avisos</h1>
      </div>
      
      {/* Lista de Alertas com novo estilo */}
      {!isLoading && alerts.length === 0 && !error && (
         <p className="no-alerts-message">Nenhum alerta no momento.</p>
      )}

      {/* --- MUDANÇA: Usando .table-list e .table-container --- */}
      {alerts.length > 0 && (
        <ul className="table-list">
          {alerts.map((alert) => (
            // Usa as classes do seu novo CSS, mais a classe de importância
            <li key={alert.id} className={`table-container importancia-${alert.importancia.toLowerCase()}`}>
              {/* O seu novo CSS já estiliza <h2> e <p> dentro de .table-container */}
              <h2>{alert.titulo}</h2>
              <p>{alert.descricao}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}


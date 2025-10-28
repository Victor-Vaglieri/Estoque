// app/(dashboard)/page.tsx
"use client";


// tem parada errada nos stats
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

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
  const { user } = useAuth();
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

        if (!responseDashboards.ok || !responseAlerts.ok) {
          throw new Error('Falha ao buscar os dados do dashboard.');
        }

        const alertsData = await responseAlerts.json();
        if (alertsData && Object.keys(alertsData).length > 0) {
          console.log("Alertas recebidos:", alertsData);
          setAlerts([]); // Limpa os alertas atuais antes de adicionar novos
        }
        // ... dentro do try/catch do useEffect
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
  }, []);

  return (
    <>
      {/* Cabeçalho da Página */}
      <div className="page-header">
        <h2 className="page-title">Visão do Estoque</h2>
      </div>

      {/* Grid de Estatísticas */}
      <div className="stats-grid">
        <StatCard title="Itens com Estoque Baixo" value={stats?.historico_compra_pendente.toString() || 'NaN'} />
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
        {alerts.map((alert) => (
          <li key={alert.id} className="table-container">
            <h2>{alert.titulo}</h2>
            <p>{alert.descricao}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
"use client";

import { useState, useEffect } from 'react';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';


import './inicio.css'; 


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
  importancia: 'ALTA' | 'MEDIA' | 'BAIXA'; 
  criadorNome: string; 
  createdAt: string; 
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

      setIsLoading(true); 
      try {
        
        const responseDashboards = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        
        const responseAlerts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/avisos`, {
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
        
        
        
        setAlerts(alertsData);

        const data: DashboardStats = await responseDashboards.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
      } finally {
        setIsLoading(false);
      }
    };

    
    if (user) {
      fetchDashboardData();
    }
    
  }, [user, router]); 

  return (
    <>
      
      <div className="page-header">
        <h2 className="page-title">Visão da Loja</h2>
      </div>

      
      {isLoading && <p>Carregando estatísticas...</p>}
      {error && <p className="dash-message dash-error">{error}</p>}
      
      {!isLoading && stats && (
        <div className="stats-grid">
          <StatCard title="Itens com Estoque Baixo" value={stats?.quantidade_itens_abaixo_min.toString() || '0'} />
          <StatCard title="Saídas de Itens (Hoje)" value={stats?.quantidade_saida.toString() || '0'} />
          <StatCard title="Recebimentos Pendentes" value={stats?.historico_compra_pendente.toString() || '0'} />
          <StatCard title="Último Recebimento" value={stats?.nome_ultimo_produto_chego || 'Nenhum'} />
        </div>
      )}


      
      <div className="section-header">
        <h1 className="section-title">Alertas e Avisos</h1>
      </div>
      
      
      {!isLoading && alerts.length === 0 && !error && (
         <p className="no-alerts-message">Nenhum alerta no momento.</p>
      )}

      
      {alerts.length > 0 && (
        <ul className="table-list">
          {alerts.map((alert) => (
            
            <li key={alert.id} className={`table-container importancia-${alert.importancia.toLowerCase()}`}>
              
              
              <h2>
                {alert.importancia === 'ALTA' ? '🚨' : (alert.importancia === 'MEDIA' ? '⚠️' : 'ℹ️')}
                {alert.titulo}
              </h2>
              <p>{alert.descricao}</p>
              <span className="alert-creator">
                Criado por: {alert.criadorNome} (Em: {new Date(alert.createdAt).toLocaleDateString()})
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
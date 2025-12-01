"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

// 1. Mudança na importação
import styles from './inicio.module.css'; 

// 2. StatCard usando styles
const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className={styles['stat-card']}>
    <h3 className={styles['stat-card-title']}>{title}</h3>
    <p className={styles['stat-card-value']}>{value}</p>
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
      const token = sessionStorage.getItem('token');
      if (!token) {
        setError("Usuário não autenticado.");
        setIsLoading(false);
        sessionStorage.removeItem('token');
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
      <div className={styles['page-header']}>
        <h2 className={styles['page-title']}>Visão da Loja</h2>
      </div>

      {isLoading && <p>Carregando estatísticas...</p>}
      
      {/* 3. Classes compostas (dash-message + dash-error) */}
      {error && <p className={`${styles['dash-message']} ${styles['dash-error']}`}>{error}</p>}
      
      {!isLoading && stats && (
        <div className={styles['stats-grid']}>
          <StatCard title="Itens com Estoque Baixo" value={stats?.quantidade_itens_abaixo_min.toString() || '0'} />
          <StatCard title="Saídas de Itens (Hoje)" value={stats?.quantidade_saida.toString() || '0'} />
          <StatCard title="Recebimentos Pendentes" value={stats?.historico_compra_pendente.toString() || '0'} />
          <StatCard title="Último Recebimento" value={stats?.nome_ultimo_produto_chego || 'Nenhum'} />
        </div>
      )}

      <div className={styles['section-header']}>
        <h1 className={styles['section-title']}>Alertas e Avisos</h1>
      </div>
      
      {!isLoading && alerts.length === 0 && !error && (
         <p className={styles['no-alerts-message']}>Nenhum alerta no momento.</p>
      )}

      {alerts.length > 0 && (
        <ul className={styles['table-list']}>
          {alerts.map((alert) => {
            // 4. Lógica para classe dinâmica baseada na importância
            // Ex: styles['importancia-alta']
            const importanceClass = styles[`importancia-${alert.importancia.toLowerCase()}`];

            return (
                <li key={alert.id} className={`${styles['table-container']} ${importanceClass}`}>
                  <h2>
                    {alert.importancia === 'ALTA' ? '🚨' : (alert.importancia === 'MEDIA' ? '⚠️' : 'ℹ️')}
                    {alert.titulo}
                  </h2>
                  <p>{alert.descricao}</p>
                  <span className={styles['alert-creator']}>
                    Criado por: {alert.criadorNome} (Em: {new Date(alert.createdAt).toLocaleDateString()})
                  </span>
                </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
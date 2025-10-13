// app/(dashboard)/page.tsx
"use client";

// Importe seu novo arquivo CSS aqui
import './inicio.css';

// Componente para os cards de estatísticas
const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="stat-card">
    <h3 className="stat-card-title">{title}</h3>
    <p className="stat-card-value">{value}</p>
  </div>
);

let pendentes_feitos = 12; // fazer fetch futuramente
let concluidos_feitos = 23; // fazer fetch futuramente
let pendentes_total = 58; // fazer fetch futuramente
let concluidos_total = 34; // fazer fetch futuramente

export default function DashboardHomePage() {
  return (
    <>
      {/* Cabeçalho da Página */}
      <div className="page-header">
        <h2 className="page-title">Inventory Overview</h2>
      </div>

      {/* Grid de Estatísticas */}
      <div className="stats-grid">
        <StatCard title="Meus Pedidos Pendentes" value={pendentes_feitos.toString()} />
        <StatCard title="Meus Pedidos Concluídos" value={concluidos_feitos.toString()} />
        <StatCard title="Total de Pedidos Pendentes" value={pendentes_total.toString()} />
        <StatCard title="Total de Pedidos Concluídos" value={concluidos_total.toString()} />
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
// app/(dashboard)/layout.tsx
import Sidebar from '@/app/components/Sidebar';
import TopBar from '@/app/components/TopBar';

// Importe seu novo arquivo de estilos
import './inicio.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      {/* 1. Nossa barra lateral, que será fixa */}
      <Sidebar />
      <div className="content-area">
        <TopBar />
        {/* 3. O container para o conteúdo principal */}
        <div className="main-content-wrapper">
          <main className="main-content">
            <div className="main-container">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
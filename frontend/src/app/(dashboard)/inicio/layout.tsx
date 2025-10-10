// app/(dashboard)/layout.tsx

import Sidebar from '@/app/components/Sidebar'; // Vamos criar/revisar este componente a seguir

// Este layout recebe 'children', que será a página atual (Início, Produtos, etc.)
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 1. Nossa barra lateral, que será fixa e não muda */}
      <Sidebar />

      {/* 2. O container para o conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Adicionamos um cabeçalho aqui se quisermos, ou deixamos para a página */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
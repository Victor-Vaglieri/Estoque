import React from 'react'
import Sidebar from '@/app/components/Sidebar'; // Componente da barra lateral
import TopBar from '@/app/components/TopBar'; // Componente da barra superior

import './configuracoes.css';


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Este layout envolve todas as páginas dentro de (dashboard),
    // como /produtos e /configuracoes
    return (
            <div className="configuracoes-layout">
                {/* 1. Barra Lateral (Sidebar) */}
                <Sidebar />
                {/* 2. Conteúdo Principal */}
                <div className="main-content-wrapper-configuracoes">
                    <TopBar />
                    <main className="main-content-configuracoes">
                        <div className="main-container-configuracoes">
                            {children} {/* Aqui é onde a sua página (page.tsx) será renderizada */}
                        </div>
                    </main>
                </div>
            </div>
    );
}

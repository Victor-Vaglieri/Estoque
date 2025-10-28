import React from 'react'
import Sidebar from '@/app/components/Sidebar'; // Componente da barra lateral
import TopBar from '@/app/components/TopBar'; // Componente da barra superior

import './avisos.css';


export default function RecebimentoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
            <div className="avisos-layout">
                {/* 1. Barra Lateral (Sidebar) */}
                <Sidebar />
                {/* 2. Conteúdo Principal */}
                <div className="main-content-wrapper-avisos">
                    <TopBar />
                    <main className="main-content-avisos">
                        <div className="main-container-avisos">
                            {children} 
                        </div>
                    </main>
                </div>
            </div>
    );
}

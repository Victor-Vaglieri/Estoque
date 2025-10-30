import React from 'react'
import Sidebar from '@/app/components/Sidebar'; // Componente da barra lateral
import TopBar from '@/app/components/TopBar'; // Componente da barra superior

import './perfis.css';


export default function RecebimentoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
            <div className="perfis-layout">
                {/* 1. Barra Lateral (Sidebar) */}
                <Sidebar />
                {/* 2. Conteúdo Principal */}
                <div className="main-content-wrapper-perfis">
                    <TopBar />
                    <main className="main-content-perfis">
                        <div className="main-container-perfis">
                            {children} 
                        </div>
                    </main>
                </div>
            </div>
    );
}

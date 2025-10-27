import React from 'react'
import Sidebar from '@/app/components/Sidebar'; // Componente da barra lateral
import TopBar from '@/app/components/TopBar'; // Componente da barra superior

import './recebimento.css';


export default function RecebimentoLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
            <div className="recebimento-layout">
                {/* 1. Barra Lateral (Sidebar) */}
                <Sidebar />
                {/* 2. Conteúdo Principal */}
                <div className="main-content-wrapper-recebimento">
                    <TopBar />
                    <main className="main-content-recebimento">
                        <div className="main-container-recebimento">
                            {children} 
                        </div>
                    </main>
                </div>
            </div>
    );
}

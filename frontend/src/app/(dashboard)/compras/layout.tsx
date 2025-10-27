import React from 'react'
import Sidebar from '@/app/components/Sidebar'; // Componente da barra lateral
import TopBar from '@/app/components/TopBar'; // Componente da barra superior

import './compras.css';


export default function ComprasLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
            <div className="compras-layout">
                {/* 1. Barra Lateral (Sidebar) */}
                <Sidebar />
                {/* 2. Conteúdo Principal */}
                <div className="main-content-wrapper-compras">
                    <TopBar />
                    <main className="main-content-compras">
                        <div className="main-container-compras">
                            {children} 
                        </div>
                    </main>
                </div>
            </div>
    );
}

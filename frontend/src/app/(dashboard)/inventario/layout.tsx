import React from 'react'
import Sidebar from '@/app/components/Sidebar'; // Componente da barra lateral
import TopBar from '@/app/components/TopBar'; // Componente da barra superior

import './inventario.css';


export default function InventarioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
            <div className="inventario-layout">
                {/* 1. Barra Lateral (Sidebar) */}
                <Sidebar />
                {/* 2. Conteúdo Principal */}
                <div className="main-content-wrapper-inventario">
                    <TopBar />
                    <main className="main-content-inventario">
                        <div className="main-container-inventario">
                            {children} 
                        </div>
                    </main>
                </div>
            </div>
    );
}

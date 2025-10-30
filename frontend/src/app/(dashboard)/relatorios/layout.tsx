import React from 'react'
import Sidebar from '@/app/components/Sidebar'; // Componente da barra lateral
import TopBar from '@/app/components/TopBar'; // Componente da barra superior

import './relatorios.css';


export default function RelatoriosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
            <div className="relatorios-layout">
                <Sidebar />
                <div className="main-content-wrapper-relatorios">
                    <TopBar />
                    <main className="main-content-relatorios">
                        <div className="main-container-relatorios">
                            {children} 
                        </div>
                    </main>
                </div>
            </div>
    );
}

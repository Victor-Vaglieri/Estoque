import React from 'react'
import Sidebar from '@/app/components/Sidebar'; // Componente da barra lateral
import TopBar from '@/app/components/TopBar'; // Componente da barra superior

import './avisos.css';


export default function AvisosLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
            <div className="avisos-layout">
                <Sidebar />
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

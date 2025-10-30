import React from 'react'
import Sidebar from '@/app/components/Sidebar'; // Componente da barra lateral
import TopBar from '@/app/components/TopBar'; // Componente da barra superior

import './configuracoes.css';


export default function ConfiguracoesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
            <div className="configuracoes-layout">
                <Sidebar />
                <div className="main-content-wrapper-configuracoes">
                    <TopBar />
                    <main className="main-content-configuracoes">
                        <div className="main-container-configuracoes">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
    );
}

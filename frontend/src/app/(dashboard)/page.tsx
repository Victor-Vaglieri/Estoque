"use client";

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

import './layout.css'; 

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Estado que controla se a sidebar está visível (em mobile)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // 2. Funções para controlar o estado
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        // A <AuthProvider> e <ThemeProvider> já vêm do seu app/layout.tsx raiz
        <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-mobile-open' : ''}`}>
            {/* Overlay que aparece em mobile para fechar o menu ao clicar fora */}
            <div className="sidebar-overlay" onClick={closeSidebar}></div>

            {/* Passa a função 'closeSidebar' para a sidebar */}
            <Sidebar closeSidebar={closeSidebar} />
            
            <div className="main-content-wrapper">
                {/* Passa a função 'toggleSidebar' para a topbar */}
                <TopBar toggleSidebar={toggleSidebar} />
                <main className="main-content">
                    <div className="main-container">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}


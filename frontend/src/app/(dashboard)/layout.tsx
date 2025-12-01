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
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        
        <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-mobile-open' : ''}`}>
            <div className="sidebar-overlay" onClick={closeSidebar}></div>

            <Sidebar closeSidebar={closeSidebar} />
            
            <div className="main-content-wrapper">
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


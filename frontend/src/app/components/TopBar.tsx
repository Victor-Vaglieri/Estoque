"use client";

import { useEffect } from "react";
// --- CORREÇÃO: Usando caminhos relativos ---
import { useAuth } from "../context/AuthContext";
import { IconSun } from './icons/IconSun';
import { IconMoon } from './icons/IconMoon';
import { IconExit } from './icons/IconExit';
import { IconBurberButton } from "./icons/IconBurberButton";
import { useTheme } from "../context/ThemeContext";


// --- 1. Aceita a função 'toggleSidebar' como prop ---
export default function TopBar({ toggleSidebar }: { toggleSidebar: () => void }) {
    const { logout } = useAuth();
    const {theme, toggleTheme} = useTheme()
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <div className="top-bar">

            {/* --- 2. Botão Burger (agora na esquerda) --- */}
            <button
                className="menu-toggle"
                aria-label="Abrir menu"
                title="Menu"
                onClick={toggleSidebar} // <-- MUDANÇA AQUI
            >
                <IconBurberButton className="tb-icon" />
            </button>

            {/* --- 3. Ações movidas para um container separado na direita --- */}
            <div className="top-bar-actions">
                <button
                    className="theme-toggle"
                    aria-label={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
                    title={theme === 'light' ? 'Tema escuro' : 'Tema claro'}
                    onClick={toggleTheme}
                >
                    {theme === 'light' ? <IconMoon className="tb-icon" /> : <IconSun className="tb-icon" />}
                </button>

                <button
                    className="disconect-toggle"
                    aria-label="Sair da conta"
                    title="Sair"
                    onClick={logout}
                >
                    <IconExit className="tb-icon" />
                </button>
            </div>
        </div>
    );
}


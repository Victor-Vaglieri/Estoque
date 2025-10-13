"use client";
// separar para components de top-bar

import { useState } from "react";
import { useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { IconSun } from '@/app/components/icons/IconSun';
import { IconMoon } from '@/app/components/icons/IconMoon';
import { IconExit } from '@/app/components/icons/IconExit';
import { IconBurberButton } from "./icons/IconBurberButton";
import { useTheme } from "@/app/context/ThemeContext";


export default function TopBar() {
    const { logout } = useAuth();
    const {theme, toggleTheme} = useTheme()
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <div className="top-bar">

            {/* Botão de Sair/Desconectar */}
            <button
                className="disconect-toggle"
                aria-label="Sair da conta"
                title="Sair"
                onClick={logout}
            >
                <IconExit className="tb-icon" />
            </button>

            {/* Botão de Tema (com textos dinâmicos) */}
            <button
                className="theme-toggle"
                aria-label={theme === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
                title={theme === 'light' ? 'Tema escuro' : 'Tema claro'}
                onClick={toggleTheme}
            >
                {theme === 'light' ? <IconMoon className="tb-icon" /> : <IconSun className="tb-icon" />}
            </button>

            {/* Botão de Menu */}
            <button
                className="menu-toggle"
                aria-label="Abrir menu"
                title="Menu"
            >
                <IconBurberButton className="tb-icon" />
            </button>

        </div>
    );
}

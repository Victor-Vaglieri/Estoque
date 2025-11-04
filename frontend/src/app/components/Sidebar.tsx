// src/components/Sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
// --- CORREÇÃO: Usando caminhos relativos ---
import { useAuth } from '../context/AuthContext'; 
import { IconAlert } from './icons/IconAlert';
import { IconBox } from './icons/IconBox';
import { IconCart } from './icons/IconCart';
import { IconConfig } from './icons/IconConfig';
import { IconGraph } from './icons/IconGraph';
import { IconHome } from './icons/IconHome';
import { IconModUsers } from './icons/IconModUsers';
import { IconOut } from './icons/IconOut';
import { IconRecive } from './icons/IconRecive';
import { IconTable } from './icons/IconTable';

const navLinks = [
  { name: 'Início', href: '/inicio', icon: <IconHome className="sidebar-icon" />, roles: ['GESTOR', 'CADASTRO', 'COMPRAS', 'RECEBIMENTO', 'FUNCIONARIO', 'EMPREGADA'] },
  { name: 'Cadastro de Itens', href: '/produtos', icon: <IconBox className="sidebar-icon" />, roles: ['GESTOR', 'CADASTRO'] },
  { name: 'Compras', href: '/compras', icon: <IconCart className="sidebar-icon" />, roles: ['GESTOR', 'COMPRAS'] },
  { name: 'Recebimento', href: '/recebimentos', icon: <IconRecive className="sidebar-icon" />, roles: ['RECEBIMENTO', 'GESTOR'] },
  { name: 'Saída', href: '/saidas', icon: <IconOut className="sidebar-icon" />, roles: ['FUNCIONARIO', 'GESTOR'] },
  { name: 'Fazer Inventário', href: '/inventario', icon: <IconTable className="sidebar-icon" />, roles: ['GESTOR', 'EMPREGADA'] },
  { name: 'Modificar Usuários', href: '/perfis', icon: <IconModUsers className="sidebar-icon" />, roles: ['GESTOR'] },
  { name: 'Modificar Avisos', href: '/avisos', icon: <IconAlert className="sidebar-icon" />, roles: ['GESTOR'] },
  { name: 'Relatórios', href: '/relatorios', icon: <IconGraph className="sidebar-icon" />, roles: ['GESTOR'] },
  { name: 'Configurações', href: '/configuracoes', icon: <IconConfig className="sidebar-icon" />, roles: ['GESTOR', 'CADASTRO', 'COMPRAS', 'RECEBIMENTO', 'FUNCIONARIO', 'EMPREGADA'] },
  { name: 'Controle', href: '/legacy', icon: <IconConfig className="sidebar-icon" />, roles: ['GESTOR', 'CADASTRO', 'COMPRAS', 'RECEBIMENTO', 'FUNCIONARIO', 'EMPREGADA'] },
];

// --- 1. Aceita a função 'closeSidebar' como prop ---
export default function Sidebar({ closeSidebar }: { closeSidebar: () => void }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (loading) {
    return <aside className="sidebar-skeleton"></aside>;
  }
  if (!user) {
    return null; // Não renderiza nada se não houver usuário
  }

  const allowedLinks = navLinks.filter(link =>
    // Garante que user.funcoes existe antes de chamar .some()
    user.funcoes && user.funcoes.some(role => link.roles.includes(role))
  );

  return (
    <aside className="sidebar">
      {/* --- 2. Adiciona um botão 'X' para fechar (visível em mobile) --- */}
      <button
        className="sidebar-close-button"
        onClick={closeSidebar}
        aria-label="Fechar menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <path fill="currentColor" d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"></path>
        </svg>
      </button>

      <h1 className="sidebar-title">Controle</h1>
      <nav className="sidebar-nav">
        <ul>
          {allowedLinks.map((link) => {
            const isActive = pathname === link.href;
            const linkClassName = `nav-link ${isActive ? 'active' : ''}`;
            return (
              <li key={link.name} className="nav-item">
                {/* --- 3. Adiciona onClick para fechar o menu ao navegar --- */}
                <Link href={link.href} className={linkClassName} onClick={closeSidebar}>
                  {link.icon}
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}


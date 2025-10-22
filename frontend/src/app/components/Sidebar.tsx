// src/components/Sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
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

// ... (navLinks continua o mesmo)
const navLinks = [
    { name: 'Início', href: '/inicio', icon: <IconHome className="sidebar-icon"/>, roles: ['GESTOR','CADASTRO','COMPRAS','RECEBIMENTO','FUNCIONARIO','EMPREGADA'] }, // feito
    { name: 'Cadastro de Itens', href: '/produtos', icon: <IconBox className="sidebar-icon"/>, roles: ['GESTOR', 'CADASTRO'] }, // feito
    { name: 'Compras', href: '/compras', icon: <IconCart className="sidebar-icon"/>, roles: ['GESTOR', 'COMPRAS'] },
    { name: 'Recebimento', href: '/recebimento', icon: <IconRecive className="sidebar-icon"/>, roles: ['RECEBIMENTO'] },
    { name: 'Saída', href: '/saidas', icon: <IconOut className="sidebar-icon"/> , roles: ['FUNCIONARIO'] },
    { name: 'Fazer Inventário', href: '/inventario', icon: <IconTable className="sidebar-icon"/>, roles: ['GESTOR', 'EMPREGADA'] },
    { name: 'Modificar Usuários', href: '/administracao/usuarios', icon: <IconModUsers className="sidebar-icon"/>, roles: ['GESTOR'] },
    { name: 'Modificar Avisos', href: '/administracao/avisos', icon: <IconAlert className="sidebar-icon"/>, roles: ['GESTOR'] },
    { name: 'Relatórios', href: '/relatorios', icon: <IconGraph className="sidebar-icon"/>, roles: ['GESTOR'] },
    { name: 'Configurações', href: '/configuracoes', icon: <IconConfig className="sidebar-icon"/>, roles: ['GESTOR','CADASTRO','COMPRAS','RECEBIMENTO','FUNCIONARIO','EMPREGADA'] }, // feito
  ];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  if (loading) {
    return <aside className="sidebar-skeleton"></aside>;

  }
  if (!user) {
    return <aside className="sidebar-skeleton"></aside>; 
  }

  const allowedLinks = navLinks.filter(link => 
    user.funcoes.some(role => link.roles.includes(role))
  );

  return (
    <aside className="sidebar">
      {/* ... o resto do seu componente ... */}
      <h1 className="sidebar-title">Stock Control</h1>
      <nav className="sidebar-nav">
        <ul>
          {allowedLinks.map((link) => {
            const isActive = pathname === link.href;
            const linkClassName = `nav-link ${isActive ? 'active' : ''}`;
            return (
              <li key={link.name} className="nav-item">
                <Link href={link.href} className={linkClassName}>
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
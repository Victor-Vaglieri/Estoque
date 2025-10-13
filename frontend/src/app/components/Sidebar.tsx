// src/components/Sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
// ... (navLinks continua o mesmo)
const navLinks = [
    { name: 'Início', href: '/', icon: '🏠', roles: ['GESTOR','CADASTRO','COMPRAS','RECEBIMENTO','FUNCIONARIO','EMPREGADA'] },
    { name: 'Cadastro de Itens', href: '/produtos', icon: '📦', roles: ['GESTOR', 'CADASTRO'] },
    { name: 'Compras', href: '/compras', icon: '🛒', roles: ['GESTOR', 'COMPRAS'] },
    { name: 'Recebimento', href: '/recebimento', icon: '🚚', roles: ['RECEBIMENTO'] },
    { name: 'Saída', href: '/saidas', icon: '📤', roles: ['FUNCIONARIO'] },
    { name: 'Fazer Inventário', href: '/inventario', icon: '📋', roles: ['GESTOR', 'EMPREGADA'] },
    { name: 'Modificar Usuários', href: '/administracao/usuarios', icon: '👥', roles: ['GESTOR'] },
    { name: 'Modificar Avisos', href: '/administracao/avisos', icon: '⚠️', roles: ['GESTOR'] },
    { name: 'Relatórios', href: '/relatorios', icon: '📊', roles: ['GESTOR'] },
    { name: 'Configurações', href: '/configuracoes', icon: '⚙️', roles: ['GESTOR','CADASTRO','COMPRAS','RECEBIMENTO','FUNCIONARIO','EMPREGADA'] },
    { name: 'Editar Perfil', href: '/perfil', icon: '👤', roles: ['GESTOR','CADASTRO','COMPRAS','RECEBIMENTO','FUNCIONARIO','EMPREGADA'] },
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
                  <span className="nav-link-icon">{link.icon}</span>
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
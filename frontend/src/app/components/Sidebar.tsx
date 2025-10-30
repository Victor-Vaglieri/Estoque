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

const navLinks = [
    { name: 'Início', href: '/inicio', icon: <IconHome className="sidebar-icon"/>, roles: ['GESTOR','CADASTRO','COMPRAS','RECEBIMENTO','FUNCIONARIO','EMPREGADA'] }, 
    // feito, arrumar alertas e infos, infos parecem erradas (provavelmente backend) e alertas estão feios
    { name: 'Cadastro de Itens', href: '/produtos', icon: <IconBox className="sidebar-icon"/>, roles: ['GESTOR', 'CADASTRO'] }, 
    // feito, falta jeito de remover itens
    { name: 'Compras', href: '/compras', icon: <IconCart className="sidebar-icon"/>, roles: ['GESTOR', 'COMPRAS'] }, 
    // feito
    { name: 'Recebimento', href: '/recebimento', icon: <IconRecive className="sidebar-icon"/>, roles: ['RECEBIMENTO', 'GESTOR'] }, 
    // + ou - feito, precisa repopular, e confirmar se está tudo certo
    { name: 'Saída', href: '/saidas', icon: <IconOut className="sidebar-icon"/> , roles: ['FUNCIONARIO','GESTOR'] }, 

    { name: 'Fazer Inventário', href: '/inventario', icon: <IconTable className="sidebar-icon"/>, roles: ['GESTOR', 'EMPREGADA'] }, 
    // + ou - feito, não tão agradavel e confirmar se precisa criar alertas de inventario 
    { name: 'Modificar Usuários', href: '/perfis', icon: <IconModUsers className="sidebar-icon"/>, roles: ['GESTOR'] },
    // feito, aparentemente tudo ok
    { name: 'Modificar Avisos', href: '/avisos', icon: <IconAlert className="sidebar-icon"/>, roles: ['GESTOR'] },
    // + ou - feito, falta mudar o ID para o nome do usuario 
    { name: 'Relatórios', href: '/relatorios', icon: <IconGraph className="sidebar-icon"/>, roles: ['GESTOR'] },
    // + ou - feito, falta melhorar e/ou adicionar os graficos e refazer os relatorios em xlsx
    { name: 'Configurações', href: '/configuracoes', icon: <IconConfig className="sidebar-icon"/>, roles: ['GESTOR','CADASTRO','COMPRAS','RECEBIMENTO','FUNCIONARIO','EMPREGADA'] }, 
    // feito, por enquanto só mudar senha e login
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
      <h1 className="sidebar-title">Controle</h1>
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
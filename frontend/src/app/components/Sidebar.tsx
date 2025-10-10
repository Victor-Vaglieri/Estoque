// src/components/Sidebar.tsx
"use client"; // Este componente precisa ser um Client Component para usar hooks

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext'; // Importe seu hook de autenticação

// Defina os ícones aqui (exemplo com emojis, mas idealmente seriam componentes SVG)
const navLinks = [
  { name: 'Início', href: '/', icon: '🏠', roles: ['TODOS'] },
  { name: 'Cadastro de Itens', href: '/produtos', icon: '📦', roles: ['Gestor', 'Cadastro'] },
  { name: 'Compras', href: '/compras', icon: '🛒', roles: ['Gestor', 'Compras'] },
  { name: 'Recebimento', href: '/recebimento', icon: '🚚', roles: ['Recebimento'] },
  { name: 'Saída', href: '/saidas', icon: '📤', roles: ['Funcionário'] },
  { name: 'Fazer Inventário', href: '/inventario', icon: '📋', roles: ['Gestor', 'Empregada'] },
  { name: 'Modificar Usuários', href: '/administracao/usuarios', icon: '👥', roles: ['Gestor'] },
  { name: 'Relatórios', href: '/relatorios', icon: '📊', roles: ['Gestor'] },
  { name: 'Configurações', href: '/configuracoes', icon: '⚙️', roles: ['TODOS'] },
  { name: 'Editar Perfil', href: '/perfil', icon: '👤', roles: ['TODOS'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth(); // Pegue o usuário do contexto

  // Se o usuário ainda não carregou, não mostre nada ou mostre um skeleton
  if (!user) {
    return <aside className="w-64 bg-gray-800"></aside>;
  }

  // Filtra os links que o usuário tem permissão para ver
  const allowedLinks = navLinks.filter(link => 
    link.roles.includes('TODOS') || user.funcoes.some(role => link.roles.includes(role))
  );

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-800 p-4 text-white">
      <h1 className="text-2xl font-bold mb-8">Stock Control</h1>
      <nav>
        <ul>
          {allowedLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name} className="mb-2">
                <Link
                  href={link.href}
                  className={`flex items-center rounded-md p-2 transition-colors ${
                    isActive ? 'bg-blue-600' : 'hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-3">{link.icon}</span>
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
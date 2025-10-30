# Estoque:
### Geral: mudar estilo, fazer mobile e testar criticos
### AVISOS:
1. lib/types.ts - função deve ser espelho ao backend
2. lib/authService.ts - usa NEXT_PUBLIC_API_URL
3. app/globals.css - verificar boas praticas
4. app/components/icons - mudar as cores de acordo com o tela e talvez muda-los
5. app/(dashboard)/configurações - por enquanto só login e senha
6. app/(dashboard)/compras - parece muito simples, possível grande ajuste
### TODO:
1. lib/apiService.ts,app/context/AuthContext.tsx - usar cookies ao invés de sessionStorage
2. app/components/TopBar.tsx - arrumar burger menu
3. app/components/Sidebar.tsx - fazer tela de saída, adicionar saída de terceiros (empresas)
4. app/components/routeGuard.tsx - verificar se acontece redirecionamento
5. app/(dashboard)/relatórios - rever os gráficos e downloads
6. app/(dashboard)/recebimento - repopular e confirmar se esta de acordo
7. app/(dashboard)/produtos - somente deixar os cards mais apresentáveis
8. app/(dashboard)/perfis - talvez deixar tabelas mais bonitas
9. app/(dashboard)/inventario - deixar tabela mais simples e/ou bonita possível erro em mobile
10. app/(dashboard)/inicio - avisos e infos incorretos; e deixar tudo mais apresentável
11. app/(dashboard)/avisos - mudar destinar ID para destinar nome


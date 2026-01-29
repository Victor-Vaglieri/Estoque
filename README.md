# Sistema de Gestão de Estoque e Logística (ERP)

Este repositório contém o código-fonte e a documentação de uma solução Full Stack desenvolvida para o controle de inventário, gestão de compras e rastreamento de serviços de terceiros.

## Visão Geral

O projeto foi concebido para centralizar processos logísticos complexos, unindo a gestão de produtos físicos ao acompanhamento de ordens de serviço externas em uma única plataforma.

### Objetivos do Projeto

+ **Eficiência Operacional**: Automatizar a identificação de necessidades de compra e o controle de recebimentos pendentes.
+ **Rastreabilidade**: Implementar um sistema de trackeamento para serviços de terceiros (Legacy), permitindo saber o status exato de pedidos de costura, tapetes e malas.
+ **Segurança Granula**r: Estabelecer um controle de acesso baseado em funções (Roles), garantindo que cada colaborador acesse apenas as funcionalidades pertinentes ao seu cargo.

## Ciclo de Desenvolvimento
O roteiro seguiu as etapas abaixo:

1. **Modelagem e Esquema**: Definição da estrutura de dados e criação de esquemas do banco utilizando Prisma ORM.
2. **Desenvolvimento do Back-end**: Construção da API utilizando NestJS, com foco em escalabilidade e segurança.
3. **Desenvolvimento do Front-end**: Implementação da interface administrativa com NextJS.
4. **Integridade e Testes**: Conexão entre os serviços e hospedagem em ambientes de teste (Render/Vercel).
5. **Refinamento**: Ajustes na lógica de permissões e otimização das consultas de relatórios.

## Funcionalidades Detalhadas

+ **Autenticação e Onboarding**:
  + **Login**: Tela de acesso ao sistema com validação de credenciais.
  + **Solicitação de Conta**: Fluxo para novos usuários solicitarem acesso preenchendo dados básicos (Nome, Login, Senha). O sistema bloqueia o login imediato e envia o pedido para uma fila de aprovação ("Solicitações Pendentes"), garantindo que apenas usuários autorizados por um gestor entrem na plataforma.
  <br>
  <details><summary><strong>Ver Tela autenticação</strong></summary><br><img width="1469" height="945" alt="localhost_3000_login" src="https://github.com/user-attachments/assets/98228e45-6640-470f-aa55-f8c416b64d25" /><br>
  <img width="1469" height="945" alt="localhost_3000_criar_usuario" src="https://github.com/user-attachments/assets/1e82692e-b840-4aee-a2e4-f561265bffad" /></details>

+ **Dashboard Inicial (Visão da Loja):** Central de monitoramento com cards de métricas para o dia a dia: **Itens com Estoque Baixo**, **Saídas do Dia**, **Recebimentos Pendentes** e **Último Recebimento**. Inclui também a visualização imediata de **Alertas e Avisos** recentes da equipe.

    <details><summary><strong>Ver Tela Inicial</strong></summary><br><img width="1469" height="945" alt="localhost_3000_inicio" src="https://github.com/user-attachments/assets/d5b29636-15d3-4a91-9111-4d56d3b8cbe6" /></details>

+ **Módulo de Terceiros (Legacy)**: Sistema de gestão de serviços externos com categorização por Costura, Tingimento, Tapete e Mala. Permite a criação de novos registros vinculados a um ROL, com seleção de cliente, meio de contato e definição de datas de recebimento e entrega. Inclui um controle de itens detalhado por ticket, peça, descrição do serviço, custo e valor cobrado, além de uma tabela para visualização de registros salvos.

    <details><summary><strong>Ver Módulo</strong></summary><br><img width="1305" height="1175" alt="localhost_3000_legacy" src="https://github.com/user-attachments/assets/b2998ba3-968c-413a-864f-921299f227d3" /></details>

+ **Gestão de Saídas de Estoque**: Interface dedicada ao gerenciamento de retiradas com um histórico de saídas recentes que detalha o produto, quantidade, data e motivo.

    <details><summary><strong>Ver Tela de saída</strong></summary><br><img width="1469" height="945" alt="localhost_3000_saida" src="https://github.com/user-attachments/assets/98647810-5858-44e5-bb9d-9b122c3e0a16" /><br>
    <img width="1454" height="994" alt="localhost_3000_saida (1)" src="https://github.com/user-attachments/assets/e39a6db3-faae-4849-81cc-d4a29e76f7d9" /></details>

+ **Confirmação de Recebimentos**: Sistema de conferência de mercadorias compradas com status de "Pendente". Exibe cards detalhados com ID da compra, marca, quantidade esperada e data do pedido. Permite ao usuário validar o preço final via Nota Fiscal (NF) e realizar ações como Confirmar Entrada, Marcar Faltante ou Cancelar Compra.

    <details><summary><strong>Ver Tela de recebimentos</strong></summary><br><img width="1469" height="945" alt="localhost_3000_recebimentos" src="https://github.com/user-attachments/assets/88b80c3a-c98e-4898-b6ad-962ae8d77d16" /></details>

+ **Auditoria de Inventário**: Tela dedicada para conciliação de estoque, exibindo o saldo atual do sistema e o estoque mínimo, com campo para inserção da Quantidade Contada manualmente para ajuste do banco de dados.

    <details><summary><strong>Ver Tela de inventário</strong></summary><br><img width="1469" height="945" alt="localhost_3000_invetariio" src="https://github.com/user-attachments/assets/35ead7b1-139b-4a50-91fd-2879788ec944" /></details>

+ **Quadro de Avisos**: Sistema de comunicação interna para criação de comunicados com título, descrição e níveis de importância. Permite a seleção de destinatários específicos ou envios globais, com funções para editar, remover ou concluir avisos visualizados em cards cronológicos.

    <details><summary><strong>Ver Tela de avisos</strong></summary><br><img width="1454" height="1298" alt="localhost_3000_avisos (1)" src="https://github.com/user-attachments/assets/96d8982f-6525-4217-b86a-a8ad5db1c909" /><br>
    <img width="1469" height="945" alt="localhost_3000_avisos" src="https://github.com/user-attachments/assets/c643e602-5167-4e41-bc84-bc3d0ec83441" /></details>

+ **Cadastro e Edição de Produtos**: Interface para gerenciamento completo do catálogo de itens. Permite configurar parâmetros técnicos como unidade de medida, marca, código de barras, localização (corredor), fornecedor e níveis críticos de estoque (mínimo e máximo).

    <details><summary><strong>Ver Tela de cadastro</strong></summary><br><img width="1454" height="1931" alt="localhost_3000_cadastro" src="https://github.com/user-attachments/assets/716b1fa3-a2c4-432d-baa9-29fa3c149fce" /></details>

+ **Inteligência de Compras (Lista Automática)**: Sistema que identifica automaticamente itens abaixo do estoque mínimo. A lista é organizada por fornecedor, exibindo o saldo atual, o saldo máximo desejado e calculando a quantidade exata a ser comprada para reposição total.

    <details><summary><strong>Ver Lista</strong></summary><br><img width="1454" height="1275" alt="localhost_3000_lista" src="https://github.com/user-attachments/assets/f7f1faad-e5c4-4c93-9c39-f3f23a52b381" /></details>

+ **Relatórios de Gestão**: Dashboard analítico que exibe KPIs (Valor Total em Estoque, Itens Distintos e Alertas de Baixo Estoque). Inclui gráficos comparativos de valor por loja e gastos mensais, além de permitir o download de relatórios detalhados em XLSX (Controle de Serviços com filtro de data e Estoque por Fornecedor).

    <details><summary><strong>Ver Tela Inicial</strong></summary><br><img width="1454" height="1582" alt="localhost_3000_relatorios" src="https://github.com/user-attachments/assets/48f12c54-e690-467a-8a58-84d3dbb58e3d" /></details>

+ **Configurações de Conta**: Módulo de segurança que permite ao usuário logado atualizar suas credenciais. Inclui painéis separados para Alterar Login e Alterar Senha (com exigência da senha atual para validação).

    <details><summary><strong>Ver configurações</strong></summary><br> <img width="1469" height="945" alt="localhost_3000_config" src="https://github.com/user-attachments/assets/42a7492b-f4d6-46f8-8f15-c5d94b163197" /> </details>

+ **Gestão de Perfis e Fornecedores**: Painel administrativo para controle total de acessos e parceiros.

  + **Usuários**: Visualização de colaboradores ativos com detalhes de função, loja associada e login. Inclui área para aprovação de solicitações de cadastro pendentes.

  + **Fornecedores**: CRUD (Criar, Editar, Remover) para gerenciamento da base de fornecedores, fundamental para o vínculo de produtos e geração de listas de compras.

  <details><summary><strong>Ver Tela de usuários</strong></summary><br> <img width="1454" height="1034" alt="localhost_3000_usuarios" src="https://github.com/user-attachments/assets/c9a34e56-d569-43eb-bd60-e28e92488a86" /> </details>

## Tecnologias e Hospedagem

Back-end: **NestJS** — Hospedado no **Render**

Front-end: **NextJS** — Hospedado na **Vercel**

Banco de Dados: **PostgreSQL** via **Prisma ORM** (Migrations e Schema) — Hospedado na **Neon Tech**.

## Estrutura

+ ```/backend```

  1. ```src/modules```: Módulos da aplicação (Auth, Produtos, Vendas, etc.) seguindo a arquitetura do NestJS.
  2. ```prisma/```: Schemas e migrações do banco de dados.

+ ```/frontend```
  1. ```src/pages```: Rotas e páginas da aplicação NextJS.
  2. ```src/components```: Componentes reutilizáveis (Cards, Tabelas, Modais).
  3. ```src/contexts```: Gerenciamento de estado global (AuthContext).



Aqui está o arquivo README.md completo. Basta clicar no botão de copiar no canto do bloco de código e colar no seu arquivo.

Markdown
# Sistema de Gestão de Estoque e Logística (ERP)

Este repositório contém o código-fonte e a documentação de uma solução Full Stack desenvolvida para o controle de inventário, gestão de compras e rastreamento de serviços de terceiros.

## Visão Geral

O projeto foi concebido para centralizar processos logísticos complexos, unindo a gestão de produtos físicos ao acompanhamento de ordens de serviço externas em uma única plataforma.

### Objetivos do Projeto

+ **Eficiência Operacional**: Automatizar a identificação de necessidades de compra e o controle de recebimentos pendentes.
+ **Rastreabilidade**: Implementar um sistema de trackeamento para serviços de terceiros (Legacy), permitindo saber o status exato de pedidos de costura, tapetes e malas.
+ **Segurança Granular**: Estabelecer um controle de acesso baseado em funções (Roles), garantindo que cada colaborador acesse apenas as funcionalidades pertinentes ao seu cargo.

## Ciclo de Desenvolvimento
O roteiro seguiu as etapas abaixo:

1. **Modelagem e Esquema**: Definição da estrutura de dados e criação de esquemas do banco utilizando Prisma ORM.
2. **Desenvolvimento do Back-end**: Construção da API utilizando NestJS, com foco em escalabilidade e segurança.
3. **Desenvolvimento do Front-end**: Implementação da interface administrativa com NextJS.
4. **Integridade e Testes**: Conexão entre os serviços e hospedagem em ambientes de teste (Render/Vercel).
5. **Refinamento**: Ajustes na lógica de permissões e otimização das consultas de relatórios.

## Funcionalidades Detalhadas

+ **Autenticação e Onboarding**:
  + **Login**: Tela de acesso ao sistema com validação de credenciais.
  + **Solicitação de Conta**: Fluxo para novos usuários solicitarem acesso preenchendo dados básicos (Nome, Login, Senha). O sistema bloqueia o login imediato e envia o pedido para uma fila de aprovação ("Solicitações Pendentes"), garantindo que apenas usuários autorizados por um gestor entrem na plataforma.
  <br>
  <details><summary><strong>Ver Tela autenticação</strong></summary><br><img width="1469" height="945" alt="localhost_3000_login" src="https://github.com/user-attachments/assets/98228e45-6640-470f-aa55-f8c416b64d25" /><br>
  <img width="1469" height="945" alt="localhost_3000_criar_usuario" src="https://github.com/user-attachments/assets/1e82692e-b840-4aee-a2e4-f561265bffad" /></details>

+ **Dashboard Inicial (Visão da Loja):** Central de monitoramento com cards de métricas para o dia a dia: **Itens com Estoque Baixo**, **Saídas do Dia**, **Recebimentos Pendentes** e **Último Recebimento**. Inclui também a visualização imediata de **Alertas e Avisos** recentes da equipe.

    <details><summary><strong>Ver Tela Inicial</strong></summary><br><img width="1469" height="945" alt="localhost_3000_inicio" src="https://github.com/user-attachments/assets/d5b29636-15d3-4a91-9111-4d56d3b8cbe6" /></details>

+ **Módulo de Terceiros (Legacy)**: Sistema de gestão de serviços externos com categorização por Costura, Tingimento, Tapete e Mala. Permite a criação de novos registros vinculados a um ROL, com seleção de cliente, meio de contato e definição de datas de recebimento e entrega. Inclui um controle de itens detalhado por ticket, peça, descrição do serviço, custo e valor cobrado, além de uma tabela para visualização de registros salvos.

    <details><summary><strong>Ver Módulo</strong></summary><br><img width="1305" height="1175" alt="localhost_3000_legacy" src="https://github.com/user-attachments/assets/b2998ba3-968c-413a-864f-921299f227d3" /></details>

+ **Gestão de Saídas de Estoque**: Interface dedicada ao gerenciamento de retiradas com um histórico de saídas recentes que detalha o produto, quantidade, data e motivo.

    <details><summary><strong>Ver Tela de saída</strong></summary><br><img width="1469" height="945" alt="localhost_3000_saida" src="https://github.com/user-attachments/assets/98647810-5858-44e5-bb9d-9b122c3e0a16" /><br>
    <img width="1454" height="994" alt="localhost_3000_saida (1)" src="https://github.com/user-attachments/assets/e39a6db3-faae-4849-81cc-d4a29e76f7d9" /></details>

+ **Confirmação de Recebimentos**: Sistema de conferência de mercadorias compradas com status de "Pendente". Exibe cards detalhados com ID da compra, marca, quantidade esperada e data do pedido. Permite ao usuário validar o preço final via Nota Fiscal (NF) e realizar ações como Confirmar Entrada, Marcar Faltante ou Cancelar Compra.

    <details><summary><strong>Ver Tela de recebimentos</strong></summary><br><img width="1469" height="945" alt="localhost_3000_recebimentos" src="https://github.com/user-attachments/assets/88b80c3a-c98e-4898-b6ad-962ae8d77d16" /></details>

+ **Auditoria de Inventário**: Tela dedicada para conciliação de estoque, exibindo o saldo atual do sistema e o estoque mínimo, com campo para inserção da Quantidade Contada manualmente para ajuste do banco de dados.

    <details><summary><strong>Ver Tela de inventário</strong></summary><br><img width="1469" height="945" alt="localhost_3000_invetariio" src="https://github.com/user-attachments/assets/35ead7b1-139b-4a50-91fd-2879788ec944" /></details>

+ **Quadro de Avisos**: Sistema de comunicação interna para criação de comunicados com título, descrição e níveis de importância. Permite a seleção de destinatários específicos ou envios globais, com funções para editar, remover ou concluir avisos visualizados em cards cronológicos.

    <details><summary><strong>Ver Tela de avisos</strong></summary><br><img width="1454" height="1298" alt="localhost_3000_avisos (1)" src="https://github.com/user-attachments/assets/96d8982f-6525-4217-b86a-a8ad5db1c909" /><br>
    <img width="1469" height="945" alt="localhost_3000_avisos" src="https://github.com/user-attachments/assets/c643e602-5167-4e41-bc84-bc3d0ec83441" /></details>

+ **Cadastro e Edição de Produtos**: Interface para gerenciamento completo do catálogo de itens. Permite configurar parâmetros técnicos como unidade de medida, marca, código de barras, localização (corredor), fornecedor e níveis críticos de estoque (mínimo e máximo).

    <details><summary><strong>Ver Tela de cadastro</strong></summary><br><img width="1454" height="1931" alt="localhost_3000_cadastro" src="https://github.com/user-attachments/assets/716b1fa3-a2c4-432d-baa9-29fa3c149fce" /></details>

+ **Inteligência de Compras (Lista Automática)**: Sistema que identifica automaticamente itens abaixo do estoque mínimo. A lista é organizada por fornecedor, exibindo o saldo atual, o saldo máximo desejado e calculando a quantidade exata a ser comprada para reposição total.

    <details><summary><strong>Ver Lista</strong></summary><br><img width="1454" height="1275" alt="localhost_3000_lista" src="https://github.com/user-attachments/assets/f7f1faad-e5c4-4c93-9c39-f3f23a52b381" /></details>

+ **Relatórios de Gestão**: Dashboard analítico que exibe KPIs (Valor Total em Estoque, Itens Distintos e Alertas de Baixo Estoque). Inclui gráficos comparativos de valor por loja e gastos mensais, além de permitir o download de relatórios detalhados em XLSX (Controle de Serviços com filtro de data e Estoque por Fornecedor).

    <details><summary><strong>Ver Tela Inicial</strong></summary><br><img width="1454" height="1582" alt="localhost_3000_relatorios" src="https://github.com/user-attachments/assets/48f12c54-e690-467a-8a58-84d3dbb58e3d" /></details>

+ **Configurações de Conta**: Módulo de segurança que permite ao usuário logado atualizar suas credenciais. Inclui painéis separados para Alterar Login e Alterar Senha (com exigência da senha atual para validação).

    <details><summary><strong>Ver configurações</strong></summary><br> <img width="1469" height="945" alt="localhost_3000_config" src="https://github.com/user-attachments/assets/42a7492b-f4d6-46f8-8f15-c5d94b163197" /> </details>

+ **Gestão de Perfis e Fornecedores**: Painel administrativo para controle total de acessos e parceiros.

  + **Usuários**: Visualização de colaboradores ativos com detalhes de função, loja associada e login. Inclui área para aprovação de solicitações de cadastro pendentes.

  + **Fornecedores**: CRUD (Criar, Editar, Remover) para gerenciamento da base de fornecedores, fundamental para o vínculo de produtos e geração de listas de compras.

  <details><summary><strong>Ver Tela de usuários</strong></summary><br> <img width="1454" height="1034" alt="localhost_3000_usuarios" src="https://github.com/user-attachments/assets/c9a34e56-d569-43eb-bd60-e28e92488a86" /> </details>

## Tecnologias e Hospedagem

* **Back-end**: NestJS — Hospedado no **Render**
* **Front-end**: NextJS — Hospedado na **Vercel**
* **Banco de Dados**: PostgreSQL via **Prisma ORM** (Migrations e Schema) — Hospedado na **Neon Tech**

## Como Rodar Localmente

### 1. Pré-requisitos
Certifique-se de ter instalado:
* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* [Git](https://git-scm.com/)

### 2. Configuração de Variáveis de Ambiente (.env)

**Backend:**
Crie um arquivo `.env` na pasta `/backend`. Como o projeto utiliza múltiplos schemas para organização, a configuração deve seguir este modelo:

```env
# Autenticação e Porta
JWT_SECRET="sua_chave_secreta_aqui"
PORT=3001

# Banco de Dados (Substitua pelos seus dados de conexão)
# Nota: Cada URL aponta para um schema específico (estoque, controle, alertas, etc.)
DATABASE_URL_ESTOQUE="postgresql://usuario:senha@host/banco?schema=estoque"
DATABASE_URL_CONTROLE="postgresql://usuario:senha@host/banco?schema=controle"
DATABASE_URL_ALERTAS="postgresql://usuario:senha@host/banco?schema=alertas"
DATABASE_URL_CADASTROS="postgresql://usuario:senha@host/banco?schema=cadastros"
DATABASE_URL_USUARIOS="postgresql://usuario:senha@host/banco?schema=usuarios"
```

**Frontend:**
Crie um arquivo `.env.local` na pasta `/frontend`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 3. Instalação e Execução
Abra o terminal e execute os comandos:

#### 3.1. Clone o repositório
```
git clone [https://github.com/Victor-Vaglieri/Estoque.git](https://github.com/Victor-Vaglieri/Estoque.git)
```
#### 3.2. Instale as dependências e inicie o Backend
```
cd Estoque/backend
npm install
npx prisma generate # Gera a tipagem do banco baseada nos schemas
npm run start:dev
```

#### 3.3. Em outro terminal, inicie o Frontend
```
cd ../frontend
npm install
npm run dev
```

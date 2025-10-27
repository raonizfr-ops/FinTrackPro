# FinTrackPro - Sistema de Gerenciamento de Finanças Pessoais

Um aplicativo web full-stack moderno e intuitivo para gerenciar suas finanças pessoais com inteligência. Construído com **Next.js**, **TypeScript**, **PostgreSQL** e **Tailwind CSS**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-%3E%3D5.0.0-blue)

## 🎯 Características Principais

### Gerenciamento Completo de Finanças
- **Contas Bancárias** - Crie e gerencie múltiplas contas (Corrente, Poupança, Investimento, Cartão de Crédito)
- **Transações** - Registre receitas e despesas com categorias, datas e descrições detalhadas
- **Categorias** - Organize suas transações com categorias customizáveis com ícones e cores
- **Orçamentos** - Defina limites de gastos por categoria com alertas inteligentes
- **Metas Financeiras** - Acompanhe objetivos de longo prazo (Viagem, Casa, Carro, etc.)

### Dashboard Intuitivo
- **Resumo Financeiro** - Visualize seu saldo total, orçamento do mês e utilização em tempo real
- **Transações Recentes** - Acompanhe suas últimas movimentações
- **Alertas de Orçamento** - Receba notificações quando se aproximar dos limites
- **Análises Visuais** - Gráficos e estatísticas para melhor compreensão dos gastos

### Notificações e Alertas
- **Notificações em Tempo Real** - Alertas de estouro de orçamento e metas atingidas
- **Sistema de Notificações** - Histórico completo de notificações com marcação de leitura
- **Alertas Inteligentes** - Configuração de limites de alerta por categoria

## 🚀 Stack Tecnológico

### Frontend
- **Next.js 14+** - Framework React moderno com App Router
- **TypeScript** - Tipagem estática para maior segurança
- **Tailwind CSS 4** - Estilização moderna e responsiva
- **shadcn/ui** - Componentes UI acessíveis e customizáveis
- **tRPC** - Type-safe RPC com end-to-end type safety
- **React Query** - Gerenciamento de estado e cache de dados
- **Wouter** - Roteamento leve e eficiente

### Backend
- **Node.js + Express** - Servidor HTTP robusto
- **tRPC** - Procedimentos type-safe para comunicação cliente-servidor
- **Drizzle ORM** - ORM moderno com type safety
- **PostgreSQL** - Banco de dados relacional confiável
- **NextAuth.js** - Autenticação OAuth integrada

### DevOps & Qualidade
- **TypeScript** - Tipagem em todo o projeto
- **Jest** - Framework de testes unitários
- **React Testing Library** - Testes de componentes
- **Playwright** - Testes E2E
- **GitHub Actions** - CI/CD automatizado

## 📋 Pré-requisitos

- **Node.js** >= 18.0.0
- **npm** ou **pnpm** >= 8.0.0
- **PostgreSQL** >= 12.0
- **Git**

## 🔧 Instalação e Configuração

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/FinTrackPro.git
cd FinTrackPro
```

### 2. Instalar Dependências

```bash
pnpm install
# ou
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Database
DATABASE_URL=postgresql://usuario:senha@localhost:5432/fintrakpro

# Autenticação
JWT_SECRET=sua-chave-secreta-aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Aplicação
VITE_APP_ID=seu-app-id
VITE_APP_TITLE=FinTrackPro
VITE_APP_LOGO=https://seu-logo.png

# Owner
OWNER_OPEN_ID=seu-open-id
OWNER_NAME=Seu Nome

# APIs Internas
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua-chave-api
```

### 4. Executar Migrations

```bash
pnpm db:push
```

### 5. Iniciar o Servidor de Desenvolvimento

```bash
pnpm dev
```

O aplicativo estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
FinTrackPro/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── contexts/         # React Contexts
│   │   ├── hooks/            # Custom Hooks
│   │   ├── lib/              # Utilitários e configurações
│   │   └── App.tsx           # Componente raiz
│   └── index.html
├── server/                    # Backend Node.js
│   ├── routers.ts            # Definição de procedures tRPC
│   ├── db.ts                 # Query helpers
│   └── _core/                # Configurações internas
├── drizzle/                   # Schema e migrations
│   ├── schema.ts             # Definição das tabelas
│   └── migrations/           # Arquivos de migração
├── shared/                    # Código compartilhado
└── package.json
```

## 🔌 API tRPC

A API é totalmente type-safe através do tRPC. Todos os endpoints estão definidos em `server/routers.ts`.

### Exemplos de Uso

```typescript
// Listar contas
const { data: accounts } = trpc.accounts.list.useQuery();

// Criar transação
const createMutation = trpc.transactions.create.useMutation({
  onSuccess: () => {
    // Atualizar UI
  },
});

createMutation.mutate({
  accountId: 1,
  categoryId: 2,
  amount: "100.00",
  type: "expense",
  description: "Almoço",
  date: new Date(),
});
```

### Routers Disponíveis

| Router | Procedures |
| :--- | :--- |
| `auth` | `me`, `logout` |
| `accounts` | `list`, `getById`, `create`, `update` |
| `categories` | `list`, `getById`, `create`, `update` |
| `transactions` | `list`, `getByDateRange`, `getById`, `create`, `update`, `delete` |
| `budgets` | `list`, `getByMonth`, `getById`, `create`, `update` |
| `notifications` | `list`, `getUnread`, `markAsRead` |
| `goals` | `list`, `getById`, `create`, `update` |
| `dashboard` | `summary` |

## 📊 Schema do Banco de Dados

### Tabelas Principais

#### Users
```sql
- id (PK)
- openId (UNIQUE)
- name
- email
- role (admin | user)
- createdAt, updatedAt, lastSignedIn
```

#### Accounts
```sql
- id (PK)
- userId (FK)
- name
- type (checking, savings, investment, credit_card, other)
- balance
- currency (default: BRL)
- isActive
- createdAt, updatedAt
```

#### Categories
```sql
- id (PK)
- userId (FK)
- name
- type (income | expense)
- color
- icon
- createdAt, updatedAt
```

#### Transactions
```sql
- id (PK)
- accountId (FK)
- categoryId (FK)
- userId (FK)
- amount
- type (income | expense)
- description
- date
- tags
- isRecurring
- recurringFrequency
- createdAt, updatedAt
```

#### Budgets
```sql
- id (PK)
- userId (FK)
- categoryId (FK)
- limit
- spent
- month (YYYY-MM)
- alertThreshold (%)
- createdAt, updatedAt
```

#### Notifications
```sql
- id (PK)
- userId (FK)
- title
- message
- type (budget_alert, transaction_created, goal_reached, info)
- isRead
- relatedId
- createdAt, updatedAt
```

#### Goals
```sql
- id (PK)
- userId (FK)
- name
- description
- targetAmount
- currentAmount
- deadline
- category
- isCompleted
- createdAt, updatedAt
```

## 🧪 Testes

### Executar Testes Unitários

```bash
pnpm test
```

### Executar Testes E2E

```bash
pnpm test:e2e
```

### Cobertura de Testes

```bash
pnpm test:coverage
```

## 📱 Funcionalidades por Página

### Dashboard
- Resumo financeiro com saldo total
- Orçamento do mês e utilização
- Transações recentes
- Quick actions para navegação rápida

### Transações
- Listagem de todas as transações
- Filtro por tipo (receita/despesa)
- Criar, editar e deletar transações
- Busca por descrição

### Contas
- Visualizar todas as contas
- Saldo total consolidado
- Criar novas contas
- Editar informações de contas
- Deletar contas

### Categorias
- Gerenciar categorias de receita e despesa
- Customizar ícones e cores
- Criar categorias personalizadas
- Editar e deletar categorias

### Orçamentos
- Definir limites de gastos por categoria
- Visualizar progresso do orçamento
- Alertas quando próximo do limite
- Alertas quando ultrapassa o limite

### Metas
- Criar metas financeiras com valores alvo
- Acompanhar progresso
- Definir prazos
- Marcar metas como concluídas

### Notificações
- Histórico completo de notificações
- Marcar notificações como lidas
- Filtrar por tipo
- Deletar notificações

## 🔐 Segurança

- **Autenticação OAuth** - Integração com Manus OAuth
- **Type Safety** - TypeScript em todo o projeto
- **SQL Injection Prevention** - Drizzle ORM com prepared statements
- **CORS** - Configurado para produção
- **Environment Variables** - Secrets seguros

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

## 📈 Roadmap Futuro

- [ ] Exportação de dados (PDF/CSV)
- [ ] Importação de transações (CSV/Excel)
- [ ] Gráficos avançados e relatórios
- [ ] Sincronização com bancos (Open Banking)
- [ ] App mobile (React Native)
- [ ] Análise de gastos com IA
- [ ] Recomendações de economia
- [ ] Multi-moeda
- [ ] Compartilhamento de orçamentos

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 💬 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através do email.

## 👨‍💻 Autor

Desenvolvido com ❤️ por [Seu Nome]

---

**Última atualização:** Outubro 2025


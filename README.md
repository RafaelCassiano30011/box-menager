# 📦 CashFlow Pro - Sistema de Gestão de Estoque e Vendas

Um sistema moderno de gerenciamento de inventário e vendas construído com React, Express e PostgreSQL.

## 🚀 Como subir o projeto

### Pré-requisitos
- Node.js 18+
- PostgreSQL (ou conta no Neon Database)
- npm ou yarn

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar banco de dados

#### Opção A: Supabase (Recomendado)
1. Criar conta em [supabase.com](https://supabase.com)
2. Criar novo projeto
3. Ir em **Settings** → **Database**
4. Copiar a **Connection string** na seção **Connection pooling**
5. Configurar `.env`:

```env
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
NODE_ENV="development"
```

#### Opção B: Banco local PostgreSQL
```bash
# Criar banco local
createdb cashflow_db

# Configurar .env
cp .env.example .env
```

Editar o arquivo `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/cashflow_db"
NODE_ENV="development"
```

#### Opção C: Neon Database
1. Criar conta em [neon.tech](https://neon.tech)
2. Criar novo projeto/banco
3. Copiar connection string
4. Configurar `.env`:

```env
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/cashflow_db?sslmode=require"
NODE_ENV="development"
```

### 3. Criar tabelas no banco
```bash
npm run db:push
```

### 4. Popular banco com dados de exemplo (opcional)
```bash
npm run db:seed
```

### 5. Executar em desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em: `http://localhost:5000`

## 📋 Scripts disponíveis

- `npm run dev` - Executa em desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Executa versão de produção
- `npm run check` - Verifica tipos TypeScript
- `npm run db:push` - Sincroniza schema do banco
- `npm run db:seed` - Popula banco com dados de exemplo
- `npm run db:studio` - Abre Drizzle Studio (interface visual)
- `npm run db:generate` - Gera migrations
- `npm run db:migrate` - Executa migrations

## 🛠️ Tecnologias utilizadas

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **TailwindCSS** para estilização
- **Radix UI** + **shadcn/ui** para componentes
- **TanStack Query** para gerenciamento de estado
- **Wouter** para roteamento

### Backend
- **Express.js** com TypeScript
- **Drizzle ORM** para banco de dados
- **PostgreSQL** como banco de dados
- **Zod** para validação

### Banco de dados
- **PostgreSQL** (local ou Neon Database)
- **Drizzle ORM** para queries type-safe
- **Migrations** automáticas

## 🏗️ Estrutura do projeto

```
├── client/          # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes UI
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilitários
├── server/          # Backend Express
│   ├── index.ts         # Servidor principal
│   ├── routes.ts        # Rotas da API
│   ├── storage.ts       # Interface de storage
│   ├── postgres-storage.ts  # Implementação PostgreSQL
│   ├── db.ts           # Configuração do banco
│   └── seed.ts         # Dados iniciais
├── shared/          # Código compartilhado
│   └── schema.ts        # Schema do banco e tipos
└── migrations/      # Migrations do banco
```

## 📊 Funcionalidades

### Dashboard
- Métricas de vendas em tempo real
- Produtos com estoque baixo
- Vendas recentes
- Gráficos de performance

### Gestão de Produtos
- CRUD completo de produtos
- Categorias
- Controle de estoque mínimo
- Histórico de movimentações

### Vendas
- Processamento de vendas
- Carrinho de compras
- Diferentes métodos de pagamento
- Desconto por item

### Estoque
- Movimentações de entrada/saída
- Histórico completo
- Rastreamento automático

### Relatórios
- Vendas por período
- Produtos mais vendidos
- Análise de performance

## 🔧 Desenvolvimento

### Visualizar banco de dados
```bash
npm run db:studio
```

### Resetar banco (cuidado!)
```bash
npm run db:push
npm run db:seed
```

### Debugging
- Logs detalhados no console
- Source maps habilitados
- Hot reload ativo

## 🚀 Deploy

### Build de produção
```bash
npm run build
npm start
```

### Variáveis de ambiente para produção
```env
DATABASE_URL="sua_connection_string_producao"
NODE_ENV="production"
PORT="5000"
```

## 📝 Notas importantes

1. **Backup**: Sempre faça backup antes de rodar migrations em produção
2. **Segurança**: Nunca commite arquivos `.env` com dados sensíveis
3. **Performance**: Use índices apropriados no banco para consultas pesadas
4. **Monitoramento**: Configure logs e métricas em produção

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Faça push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

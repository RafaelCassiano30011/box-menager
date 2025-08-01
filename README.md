# CashFlow Pro - Sistema de Gestão de Estoque e Vendas

Um sistema moderno de gerenciamento de inventário e vendas construído com React, Express e PostgreSQL.

## O que aprendi com este projeto

- Upload de imagens usando cloudinary

- Utilizar Alguns principíos do SOLID

  - Manutenibilidade: Mudanças isoladas em cada camada

  - Testabilidade: Fácil de mockar repositórios para testes unitários

  - Extensibilidade: Novas implementações sem quebrar código existente

  - Reutilização: Use Cases podem usar diferentes repositórios

  - Separação de responsabilidades: Cada classe tem um propósito específico

- Separação de Camada do banco de dados e Camada do servidor http

- Static Page usando Vite com Fastify

## Como subir o projeto

### Pré-requisitos

- Node.js 18+
- Banco SQL
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

## Tecnologias utilizadas

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

- **Drizzle ORM** para queries type-safe
- **Migrations** automáticas

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

## Desenvolvimento

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

## Deploy

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

# Shopee Video Downloader - Backend

Backend API para o sistema de download de vídeos da Shopee com controle de usuários e assinaturas.

## 🚀 Tecnologias

- **Node.js** 18+
- **TypeScript**
- **Express.js**
- **Prisma ORM**
- **PostgreSQL**
- **JWT** para autenticação
- **Bcrypt** para hash de senhas
- **Zod** para validação

## 📋 Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 14 ou superior
- npm ou yarn

## 🔧 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
- `DATABASE_URL`: URL de conexão com o PostgreSQL
- `JWT_SECRET`: Chave secreta para JWT
- `JWT_REFRESH_SECRET`: Chave secreta para refresh tokens
- `PORT`: Porta do servidor (padrão: 3001)

3. Execute as migrações do banco de dados:
```bash
npm run prisma:migrate
```

4. Gere o Prisma Client:
```bash
npm run prisma:generate
```

## 🏃 Executando

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📚 API Endpoints

### Autenticação
- `POST /api/auth/register` - Cadastro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout

### Usuário
- `GET /api/user/profile` - Obter perfil
- `PUT /api/user/profile` - Atualizar perfil
- `PUT /api/user/password` - Alterar senha
- `DELETE /api/user/account` - Deletar conta

### Downloads
- `POST /api/downloads` - Iniciar download
- `GET /api/downloads` - Listar downloads
- `GET /api/downloads/stats` - Estatísticas
- `GET /api/downloads/:id` - Detalhes do download
- `DELETE /api/downloads/:id` - Deletar download
- `GET /api/downloads/:id/file` - Baixar arquivo

### Assinaturas
- `GET /api/subscriptions` - Assinatura atual
- `GET /api/subscriptions/plans` - Listar planos
- `POST /api/subscriptions/upgrade` - Fazer upgrade
- `POST /api/subscriptions/cancel` - Cancelar assinatura
- `GET /api/subscriptions/history` - Histórico

### Pagamentos
- `POST /api/payments/create` - Criar pagamento
- `GET /api/payments` - Listar pagamentos
- `GET /api/payments/:id` - Detalhes do pagamento
- `POST /api/payments/webhook` - Webhook (público)

## 🗄️ Banco de Dados

O projeto usa Prisma ORM com PostgreSQL. Para visualizar o banco de dados:

```bash
npm run prisma:studio
```

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```
Authorization: Bearer <seu-token>
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor em modo desenvolvimento
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Inicia servidor em produção
- `npm run prisma:generate` - Gera Prisma Client
- `npm run prisma:migrate` - Executa migrações
- `npm run prisma:studio` - Abre Prisma Studio

## 🏗️ Estrutura do Projeto

```
backend/
├── prisma/
│   └── schema.prisma          # Schema do banco de dados
├── src/
│   ├── controllers/           # Controladores da API
│   ├── middleware/            # Middlewares (auth, errors, etc)
│   ├── routes/                # Rotas da API
│   ├── lib/                   # Bibliotecas (Prisma client)
│   ├── utils/                 # Utilitários (JWT, password)
│   └── server.ts              # Entrada da aplicação
├── .env.example               # Exemplo de variáveis de ambiente
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Segurança

- Senhas são hasheadas com bcrypt (12 salt rounds)
- JWT tokens com expiração configurável
- Rate limiting em rotas sensíveis
- Validação de inputs com Zod
- CORS configurado
- Proteção contra SQL Injection via Prisma

## 📊 Planos

### Free
- 5 downloads por dia
- Qualidade original
- Formato MP4

### Premium
- Downloads ilimitados
- Qualidade original
- Formato MP4
- Histórico completo
- R$ 29,90/mês ou R$ 299,00/ano

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT

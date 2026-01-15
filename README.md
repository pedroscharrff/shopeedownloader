# Shopee Video Downloader

Sistema completo para download de vídeos da Shopee com controle de usuários, assinaturas e gerenciamento de downloads.

## 📋 Visão Geral

Este projeto é uma plataforma web que permite aos usuários baixar vídeos da Shopee de forma simples e organizada. O sistema possui:

- **Autenticação completa** (registro, login, recuperação de senha)
- **Sistema de assinaturas** (planos Free e Premium)
- **Download de vídeos** em qualidade original (MP4)
- **Dashboard intuitivo** com histórico e estatísticas
- **Controle de limites** por plano de assinatura
- **API RESTful** completa e documentada

## 🏗️ Arquitetura

### Backend
- **Node.js** 18+ com **TypeScript**
- **Express.js** para API REST
- **Prisma ORM** com **PostgreSQL**
- **JWT** para autenticação
- **Bcrypt** para segurança de senhas
- **Zod** para validação de dados

### Frontend
- **React** 18+ com **TypeScript**
- **Vite** como build tool
- **TailwindCSS** para estilização
- **shadcn/ui** para componentes
- **React Query** para gerenciamento de estado
- **React Router** para navegação

## 📦 Estrutura do Projeto

```
shopee/
├── backend/                 # API Node.js + Express
│   ├── prisma/             # Schema e migrações do banco
│   ├── src/
│   │   ├── controllers/    # Controladores da API
│   │   ├── middleware/     # Middlewares (auth, errors, etc)
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Serviços (download, etc)
│   │   ├── lib/            # Bibliotecas (Prisma client)
│   │   ├── utils/          # Utilitários (JWT, password)
│   │   └── server.ts       # Entrada da aplicação
│   └── package.json
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Bibliotecas e configs
│   │   ├── services/       # Serviços de API
│   │   └── App.tsx         # Componente principal
│   └── package.json
├── ESPECIFICACAO_SISTEMA.md  # Documentação completa
└── README.md               # Este arquivo
```

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18 ou superior
- PostgreSQL 14 ou superior
- npm ou yarn

### 1. Clone o repositório

```bash
git clone <repository-url>
cd shopee
```

### 2. Configure o Backend

```bash
cd backend
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

Variáveis importantes no `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/shopee_downloader"
JWT_SECRET=your-super-secret-jwt-key
SHOPEE_API_TOKEN=b391b6331f9d2b3eeceb1223dcf1d69fdfde4a7e67bc0003a50bdbcda0b2cc0b
PORT=3001
```

### 3. Configure o Banco de Dados

```bash
# Execute as migrações
npm run prisma:migrate

# Gere o Prisma Client
npm run prisma:generate
```

### 4. Configure o Frontend

```bash
cd ../frontend
npm install
```

### 5. Inicie os Servidores

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

Acesse a aplicação em: `http://localhost:3000`

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

### Pagamentos
- `POST /api/payments/create` - Criar pagamento
- `GET /api/payments` - Listar pagamentos
- `GET /api/payments/:id` - Detalhes do pagamento

## 💎 Planos de Assinatura

### Free
- ✅ 5 downloads por dia
- ✅ Qualidade original
- ✅ Formato MP4
- ✅ Histórico de 10 downloads
- 💰 **Gratuito**

### Premium
- ✅ Downloads ilimitados
- ✅ Qualidade original
- ✅ Formato MP4
- ✅ Histórico completo
- ✅ Downloads simultâneos (até 3)
- ✅ Velocidade prioritária
- 💰 **R$ 29,90/mês** ou **R$ 299,00/ano** (economize 16%)

## 🔧 API de Download de Vídeos

O sistema utiliza a API externa do Shopee Video Downloader:

**Endpoint**: `https://www.shopeevideodownloader.com/api/v1/download`

**Exemplo de uso**:
```bash
curl --location 'https://www.shopeevideodownloader.com/api/v1/download' \
--header 'Authorization: Bearer TOKEN' \
--header 'Content-Type: application/json' \
--data '{"url": "https://sv.shopee.com.br/share-video/VIDEO_ID"}'
```

**Resposta**:
```json
{
  "success": true,
  "videoUrl": "https://down-tx-br.vod.susercontent.com/api/v4/.../video.mp4",
  "usage": {
    "current": 1,
    "limit": 0,
    "remaining": null
  }
}
```

## 🔒 Segurança

- Senhas hasheadas com **bcrypt** (12 salt rounds)
- Autenticação via **JWT** tokens
- **Rate limiting** em rotas sensíveis
- Validação de inputs com **Zod**
- **CORS** configurado
- Proteção contra **SQL Injection** via Prisma ORM

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📦 Build para Produção

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🗄️ Banco de Dados

Para visualizar e gerenciar o banco de dados:

```bash
cd backend
npm run prisma:studio
```

Acesse em: `http://localhost:5555`

## 📖 Documentação Completa

Para documentação técnica detalhada, consulte:
- `ESPECIFICACAO_SISTEMA.md` - Especificação completa do sistema
- `backend/README.md` - Documentação do backend
- `frontend/README.md` - Documentação do frontend (a ser criado)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- **Cascade AI** - Desenvolvimento inicial

## 🙏 Agradecimentos

- Shopee Video Downloader API
- Comunidade open source
- Todos os contribuidores

---

**Status do Projeto**: 🚧 Em Desenvolvimento

**Versão**: 1.0.0

**Última Atualização**: Janeiro 2026

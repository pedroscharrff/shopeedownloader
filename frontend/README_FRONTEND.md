# Frontend - Shopee Video Downloader

## 🚀 Funcionalidades Implementadas

### ✅ Sistema de Autenticação
- Login com email e senha
- Registro de novos usuários
- JWT Cookies Only (HttpOnly, Secure)
- Refresh token automático
- Proteção de rotas

### ✅ Dashboard Principal
- Estatísticas de uso (downloads hoje, restantes, total, concluídos)
- Formulário para baixar vídeos da Shopee
- Histórico completo de downloads
- Status em tempo real (Pendente, Processando, Concluído, Falhou)
- Download direto dos vídeos concluídos
- Exclusão de downloads

### ✅ Sistema de Planos
- Visualização de planos disponíveis (Free, Premium Mensal, Premium Anual)
- Comparação de recursos e limites
- Indicador de plano atual do usuário

### ✅ Sistema de Pagamento
- Integração com OpenPix (PIX)
- Formulário de dados do cliente
- Geração de QR Code PIX
- Código PIX Copia e Cola
- Link de pagamento direto
- Validação de CPF/CNPJ e telefone

### ✅ Interface Moderna
- Design responsivo com TailwindCSS
- Ícones Lucide React
- Gradientes e animações suaves
- Feedback visual de ações
- Mensagens de erro e sucesso

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework UI
- **TypeScript** - Tipagem estática
- **React Router DOM** - Roteamento
- **Axios** - Cliente HTTP
- **TailwindCSS** - Estilização
- **Lucide React** - Ícones
- **Vite** - Build tool

## 📁 Estrutura de Pastas

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Navbar.tsx      # Barra de navegação
│   └── ProtectedRoute.tsx  # HOC para proteção de rotas
├── contexts/           # Contextos React
│   └── AuthContext.tsx # Gerenciamento de autenticação
├── lib/               # Utilitários e configurações
│   ├── api.ts         # Cliente Axios configurado
│   └── utils.ts       # Funções auxiliares
├── pages/             # Páginas da aplicação
│   ├── Login.tsx      # Página de login
│   ├── Register.tsx   # Página de registro
│   ├── Dashboard.tsx  # Dashboard principal
│   ├── Plans.tsx      # Página de planos
│   └── Payment.tsx    # Página de pagamento
├── types/             # Definições TypeScript
│   └── index.ts       # Tipos e interfaces
├── App.tsx            # Componente raiz com rotas
├── main.tsx           # Ponto de entrada
└── index.css          # Estilos globais
```

## 🔐 Segurança

- **JWT Cookies Only**: Tokens armazenados em cookies HttpOnly
- **CSRF Protection**: SameSite cookies
- **Refresh Token**: Renovação automática de tokens expirados
- **Protected Routes**: Rotas protegidas por autenticação
- **Input Validation**: Validação de formulários

## 🎨 Páginas

### 1. Login (`/login`)
- Formulário de login
- Validação de email e senha
- Link para registro
- Mensagens de erro

### 2. Registro (`/register`)
- Formulário de cadastro
- Validação de dados
- Criação automática de conta
- Redirecionamento para dashboard

### 3. Dashboard (`/`)
- Cards de estatísticas
- Formulário de download
- Lista de downloads com status
- Ações: baixar arquivo, excluir
- Banner de upgrade (plano free)

### 4. Planos (`/plans`)
- 3 planos disponíveis
- Comparação de recursos
- Destaque para melhor plano
- Botão de assinatura

### 5. Pagamento (`/payment`)
- Formulário de dados do cliente
- Validação de CPF/CNPJ e telefone
- Geração de QR Code PIX
- Código Copia e Cola
- Link de pagamento

## 🔄 Fluxo de Autenticação

1. Usuário faz login/registro
2. Backend retorna cookies HttpOnly com tokens
3. Frontend armazena usuário no contexto
4. Requisições incluem cookies automaticamente
5. Interceptor renova token expirado
6. Logout limpa cookies e estado

## 📊 Integração com Backend

### Endpoints Utilizados

**Autenticação:**
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Fazer logout

**Downloads:**
- `GET /api/downloads` - Listar downloads
- `POST /api/downloads` - Criar download
- `GET /api/downloads/stats` - Estatísticas
- `DELETE /api/downloads/:id` - Excluir download

**Assinaturas:**
- `GET /api/subscriptions/plans` - Listar planos
- `GET /api/subscriptions/current` - Assinatura atual

**Pagamentos:**
- `POST /api/payments/create` - Criar pagamento PIX
- `GET /api/payments` - Listar pagamentos

## 🚀 Como Executar

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp .env.example .env
```

3. Editar `.env`:
```
VITE_API_URL=http://localhost:3001/api
```

4. Executar em desenvolvimento:
```bash
npm run dev
```

5. Build para produção:
```bash
npm run build
```

## 🎯 Próximos Passos (Opcional)

- [ ] Adicionar paginação no histórico de downloads
- [ ] Implementar filtros e busca
- [ ] Adicionar notificações em tempo real (WebSocket)
- [ ] Implementar tema escuro
- [ ] Adicionar testes unitários
- [ ] Implementar PWA
- [ ] Adicionar analytics

## 📝 Notas Importantes

- O frontend está configurado para funcionar com o backend na porta 3001
- Todos os tokens são gerenciados via cookies HttpOnly
- A aplicação é totalmente responsiva
- Suporta navegadores modernos (Chrome, Firefox, Safari, Edge)

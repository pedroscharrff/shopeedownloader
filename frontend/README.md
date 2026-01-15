# Shopee Video Downloader - Frontend

Frontend da aplicação de download de vídeos da Shopee, construído com React, TypeScript e TailwindCSS.

## 🚀 Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **TailwindCSS** - Framework CSS
- **shadcn/ui** - Componentes UI
- **React Router** - Roteamento
- **React Query** - Gerenciamento de estado servidor
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env
```

## 🛠️ Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📁 Estrutura de Pastas

```
src/
├── components/       # Componentes reutilizáveis
│   ├── ui/          # Componentes UI base (shadcn/ui)
│   └── layout/      # Componentes de layout
├── contexts/        # Contextos React
├── lib/            # Utilitários e configurações
├── pages/          # Páginas da aplicação
├── types/          # Tipos TypeScript
├── App.tsx         # Componente principal
└── main.tsx        # Entry point
```

## 🎨 Páginas

- **Landing** - Página inicial pública
- **Login** - Autenticação de usuário
- **Register** - Cadastro de novo usuário
- **Dashboard** - Painel principal (autenticado)
- **History** - Histórico de downloads
- **Profile** - Perfil do usuário
- **Subscription** - Gerenciamento de assinatura

## 🔐 Autenticação

O sistema utiliza JWT tokens armazenados no localStorage. O contexto `AuthContext` gerencia o estado de autenticação globalmente.

## 🎯 Funcionalidades

- ✅ Autenticação completa (login, registro, logout)
- ✅ Download de vídeos da Shopee
- ✅ Histórico de downloads
- ✅ Gerenciamento de perfil
- ✅ Sistema de planos (Free/Premium)
- ✅ Interface responsiva
- ✅ Tema claro/escuro (via TailwindCSS)

## 🌐 Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:3001
```

## 📝 Scripts

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build
- `npm run lint` - Executa linter

## 🤝 Integração com Backend

O frontend se comunica com o backend através da API REST. Todas as requisições são feitas através do arquivo `src/lib/api.ts` que configura o Axios com interceptors para autenticação.

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona em:
- 📱 Mobile (< 768px)
- 📱 Tablet (768px - 1024px)
- 💻 Desktop (> 1024px)

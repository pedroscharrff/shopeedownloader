# Sistema de Download de Vídeos da Shopee
## Documento de Especificação Técnica

---

## 1. VISÃO GERAL DO PROJETO

### 1.1 Objetivo
Desenvolver uma plataforma web completa para download de vídeos da Shopee com sistema de autenticação, controle de usuários e gerenciamento de assinaturas (planos Free e Premium).

### 1.2 Público-Alvo
- Vendedores da Shopee que desejam salvar vídeos de produtos
- Criadores de conteúdo que precisam de material de referência
- Usuários que desejam arquivar vídeos para uso pessoal

---

## 2. ARQUITETURA DO SISTEMA

### 2.1 Stack Tecnológica

#### **Frontend**
- **Framework**: React 18+ com TypeScript
- **Estilização**: TailwindCSS + shadcn/ui
- **Gerenciamento de Estado**: React Context API + React Query
- **Roteamento**: React Router v6
- **Ícones**: Lucide React
- **Formulários**: React Hook Form + Zod (validação)
- **HTTP Client**: Axios

#### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Linguagem**: TypeScript
- **Autenticação**: JWT (JSON Web Tokens)
- **Validação**: Zod
- **ORM**: Prisma
- **Download de Vídeos**: yt-dlp ou biblioteca customizada

#### **Banco de Dados**
- **Principal**: PostgreSQL 14+
- **Cache**: Redis (opcional para rate limiting)

#### **Infraestrutura**
- **Armazenamento**: Sistema de arquivos local ou S3-compatible
- **Processamento**: Queue system (Bull/BullMQ) para downloads assíncronos

---

## 3. FUNCIONALIDADES PRINCIPAIS

### 3.1 Sistema de Autenticação

#### **Cadastro de Usuário**
- Nome completo
- Email (único)
- Senha (mínimo 8 caracteres, hash com bcrypt)
- Data de criação
- Plano inicial: Free

#### **Login**
- Email + Senha
- Geração de JWT token
- Refresh token para renovação
- Sessão com expiração configurável

#### **Recuperação de Senha**
- Envio de email com token de recuperação
- Link temporário para redefinição
- Expiração do token em 1 hora

### 3.2 Sistema de Assinaturas

#### **Plano Free**
- **Limite**: 5 downloads por dia
- **Qualidade**: Original (mesma do vídeo fonte)
- **Formato**: MP4
- **Velocidade**: Normal
- **Histórico**: Últimos 10 downloads
- **Custo**: Gratuito

#### **Plano Premium**
- **Limite**: Downloads ilimitados
- **Qualidade**: Original (mesma do vídeo fonte)
- **Formato**: MP4
- **Velocidade**: Prioritária
- **Histórico**: Completo
- **Downloads simultâneos**: Até 3
- **Custo**: R$ 29,90/mês ou R$ 299,00/ano

#### **Gerenciamento de Assinatura**
- Upgrade de Free para Premium
- Downgrade de Premium para Free
- Cancelamento (mantém até o fim do período pago)
- Histórico de pagamentos
- Renovação automática

### 3.3 Funcionalidade de Download

#### **Processo de Download**
1. Usuário cola URL do vídeo da Shopee
2. Sistema valida a URL
3. Sistema verifica limite do plano do usuário
4. Sistema extrai informações do vídeo
5. Sistema processa e baixa o vídeo
6. Sistema disponibiliza link para download
7. Sistema registra no histórico

#### **Validações**
- URL deve ser válida da Shopee
- Vídeo deve estar disponível
- Usuário deve ter downloads disponíveis
- Tamanho do vídeo (limite máximo: 500MB)

#### **Informações Extraídas**
- Título do vídeo/produto
- Duração
- Resolução
- Tamanho do arquivo
- Thumbnail

### 3.4 Dashboard do Usuário

#### **Informações Exibidas**
- Plano atual
- Downloads restantes (se Free)
- Histórico de downloads
- Estatísticas de uso
- Gerenciamento de conta
- Gerenciamento de assinatura

---

## 4. ESTRUTURA DO BANCO DE DADOS

### 4.1 Tabelas Principais

#### **users**
```sql
- id: UUID (PK)
- name: VARCHAR(255)
- email: VARCHAR(255) UNIQUE
- password_hash: VARCHAR(255)
- plan_type: ENUM('free', 'premium')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- email_verified: BOOLEAN
- last_login: TIMESTAMP
```

#### **subscriptions**
```sql
- id: UUID (PK)
- user_id: UUID (FK -> users)
- plan_type: ENUM('free', 'premium')
- status: ENUM('active', 'cancelled', 'expired')
- started_at: TIMESTAMP
- expires_at: TIMESTAMP
- auto_renew: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### **downloads**
```sql
- id: UUID (PK)
- user_id: UUID (FK -> users)
- video_url: TEXT
- video_title: VARCHAR(500)
- video_duration: INTEGER (segundos)
- video_resolution: VARCHAR(20)
- file_size: BIGINT (bytes)
- file_path: TEXT
- status: ENUM('pending', 'processing', 'completed', 'failed')
- error_message: TEXT
- downloaded_at: TIMESTAMP
- created_at: TIMESTAMP
```

#### **payments**
```sql
- id: UUID (PK)
- user_id: UUID (FK -> users)
- subscription_id: UUID (FK -> subscriptions)
- amount: DECIMAL(10,2)
- currency: VARCHAR(3)
- status: ENUM('pending', 'completed', 'failed', 'refunded')
- payment_method: VARCHAR(50)
- transaction_id: VARCHAR(255)
- paid_at: TIMESTAMP
- created_at: TIMESTAMP
```

#### **daily_limits**
```sql
- id: UUID (PK)
- user_id: UUID (FK -> users)
- date: DATE
- downloads_count: INTEGER
- created_at: TIMESTAMP
```

---

## 5. API ENDPOINTS

### 5.1 Autenticação

```
POST   /api/auth/register          - Cadastro de usuário
POST   /api/auth/login             - Login
POST   /api/auth/refresh           - Renovar token
POST   /api/auth/logout            - Logout
POST   /api/auth/forgot-password   - Solicitar recuperação de senha
POST   /api/auth/reset-password    - Redefinir senha
GET    /api/auth/verify-email      - Verificar email
```

### 5.2 Usuário

```
GET    /api/user/profile           - Obter perfil
PUT    /api/user/profile           - Atualizar perfil
PUT    /api/user/password          - Alterar senha
DELETE /api/user/account           - Deletar conta
```

### 5.3 Downloads

```
POST   /api/downloads              - Iniciar download
GET    /api/downloads              - Listar downloads do usuário
GET    /api/downloads/:id          - Obter detalhes de um download
DELETE /api/downloads/:id          - Deletar download
GET    /api/downloads/:id/file     - Baixar arquivo
GET    /api/downloads/stats        - Estatísticas de uso
```

### 5.4 Assinaturas

```
GET    /api/subscriptions          - Obter assinatura atual
POST   /api/subscriptions/upgrade  - Fazer upgrade para Premium
POST   /api/subscriptions/cancel   - Cancelar assinatura
GET    /api/subscriptions/plans    - Listar planos disponíveis
GET    /api/subscriptions/history  - Histórico de assinaturas
```

### 5.5 Pagamentos

```
POST   /api/payments/create        - Criar pagamento
GET    /api/payments               - Listar pagamentos
GET    /api/payments/:id           - Obter detalhes de pagamento
POST   /api/payments/webhook       - Webhook do gateway de pagamento
```

---

## 6. INTERFACE DO USUÁRIO (UI/UX)

### 6.1 Páginas Principais

#### **Landing Page (Pública)**
- Hero section com campo de URL
- Explicação do serviço
- Comparação de planos
- FAQ
- Footer com links

#### **Página de Login**
- Formulário de login
- Link para cadastro
- Link para recuperação de senha
- Login social (opcional)

#### **Página de Cadastro**
- Formulário de registro
- Validação em tempo real
- Termos de uso
- Link para login

#### **Dashboard (Autenticado)**
- Campo para colar URL
- Informações do plano atual
- Contador de downloads (se Free)
- Botão de upgrade (se Free)
- Lista de downloads recentes

#### **Histórico de Downloads**
- Tabela com todos os downloads
- Filtros (data, status)
- Busca por título
- Ações (baixar novamente, deletar)

#### **Perfil do Usuário**
- Informações pessoais
- Alterar senha
- Configurações de notificação
- Deletar conta

#### **Gerenciamento de Assinatura**
- Plano atual
- Próxima cobrança
- Histórico de pagamentos
- Opções de upgrade/downgrade/cancelamento

---

## 7. SEGURANÇA

### 7.1 Medidas de Segurança

- **Senhas**: Hash com bcrypt (salt rounds: 12)
- **JWT**: Tokens assinados com secret forte
- **HTTPS**: Obrigatório em produção
- **Rate Limiting**: Proteção contra abuso de API
- **CORS**: Configuração restritiva
- **Validação**: Sanitização de inputs
- **SQL Injection**: Prevenção via Prisma ORM
- **XSS**: Sanitização de outputs
- **CSRF**: Tokens de proteção

### 7.2 Privacidade

- Não armazenar URLs de vídeo permanentemente (opcional)
- Criptografia de dados sensíveis
- Conformidade com LGPD
- Política de privacidade clara
- Opção de deletar dados

---

## 8. FLUXOS DE TRABALHO

### 8.1 Fluxo de Cadastro e Primeiro Download

```
1. Usuário acessa landing page
2. Clica em "Cadastrar"
3. Preenche formulário de cadastro
4. Recebe email de verificação (opcional)
5. Faz login
6. É redirecionado para dashboard
7. Cola URL do vídeo da Shopee
8. Clica em "Baixar"
9. Sistema processa o vídeo
10. Usuário recebe link para download
11. Download é registrado no histórico
```

### 8.2 Fluxo de Upgrade para Premium

```
1. Usuário logado acessa dashboard
2. Clica em "Upgrade para Premium"
3. Escolhe plano (mensal/anual)
4. É redirecionado para página de pagamento
5. Preenche dados de pagamento
6. Confirma pagamento
7. Sistema processa pagamento
8. Assinatura é ativada
9. Usuário recebe confirmação por email
10. Limites são atualizados imediatamente
```

### 8.3 Fluxo de Download de Vídeo

```
1. Usuário cola URL no campo
2. Sistema valida URL
3. Sistema verifica limite do usuário
4. Sistema extrai informações do vídeo
5. Sistema mostra preview (título, duração, tamanho)
6. Usuário confirma download
7. Sistema adiciona à fila de processamento
8. Sistema baixa o vídeo
9. Sistema converte para MP4 (se necessário)
10. Sistema disponibiliza para download
11. Usuário baixa o arquivo
12. Sistema atualiza contador de downloads
```

---

## 9. REQUISITOS NÃO FUNCIONAIS

### 9.1 Performance

- Tempo de resposta da API: < 200ms (exceto downloads)
- Processamento de vídeo: Depende do tamanho
- Suporte para 100 usuários simultâneos (inicial)
- Cache de requisições frequentes

### 9.2 Escalabilidade

- Arquitetura preparada para horizontal scaling
- Queue system para processamento assíncrono
- CDN para servir arquivos estáticos
- Load balancer para distribuição de carga

### 9.3 Disponibilidade

- Uptime: 99.5% (objetivo)
- Backup diário do banco de dados
- Monitoramento de erros
- Logs estruturados

### 9.4 Usabilidade

- Interface intuitiva e responsiva
- Suporte para mobile, tablet e desktop
- Feedback visual em todas as ações
- Mensagens de erro claras

---

## 10. CRONOGRAMA DE DESENVOLVIMENTO

### Fase 1: Setup e Infraestrutura (Dias 1-2)
- Configuração do projeto (frontend + backend)
- Setup do banco de dados
- Configuração de TypeScript e ESLint
- Estrutura de pastas

### Fase 2: Autenticação (Dias 3-4)
- Sistema de registro
- Sistema de login
- JWT tokens
- Middleware de autenticação

### Fase 3: Sistema de Assinaturas (Dias 5-6)
- Modelo de dados de assinaturas
- Lógica de planos
- Controle de limites
- API de assinaturas

### Fase 4: Download de Vídeos (Dias 7-9)
- Integração com API da Shopee
- Sistema de download
- Queue de processamento
- Armazenamento de arquivos

### Fase 5: Frontend - Páginas Públicas (Dias 10-11)
- Landing page
- Página de login
- Página de cadastro
- Responsividade

### Fase 6: Frontend - Dashboard (Dias 12-14)
- Dashboard principal
- Histórico de downloads
- Perfil do usuário
- Gerenciamento de assinatura

### Fase 7: Sistema de Pagamentos (Dias 15-16)
- Integração com gateway
- Webhooks
- Histórico de pagamentos

### Fase 8: Testes e Refinamentos (Dias 17-18)
- Testes de integração
- Testes de UI
- Correção de bugs
- Otimizações

### Fase 9: Deploy e Documentação (Dias 19-20)
- Configuração de produção
- Deploy
- Documentação de API
- README e guias

---

## 11. CONSIDERAÇÕES TÉCNICAS

### 11.1 Extração de Vídeos da Shopee

#### API de Download de Vídeos

O sistema utilizará a API externa do Shopee Video Downloader para processar os downloads:

**Endpoint**: `https://www.shopeevideodownloader.com/api/v1/download`

**Método**: POST

**Headers**:
```
Authorization: Bearer b391b6331f9d2b3eeceb1223dcf1d69fdfde4a7e67bc0003a50bdbcda0b2cc0b
Content-Type: application/json
```

**Request Body**:
```json
{
  "url": "https://sv.shopee.com.br/share-video/[VIDEO_ID]"
}
```

**Response de Sucesso**:
```json
{
  "success": true,
  "videoUrl": "https://down-tx-br.vod.susercontent.com/api/v4/11110124/mms/br-11110124-6v5dn-metfjeobv1fk5e.mp4",
  "usage": {
    "current": 1,
    "limit": 0,
    "remaining": null
  }
}
```

**Exemplo de Requisição**:
```bash
curl --location 'https://www.shopeevideodownloader.com/api/v1/download' \
--header 'Authorization: Bearer b391b6331f9d2b3eeceb1223dcf1d69fdfde4a7e67bc0003a50bdbcda0b2cc0b' \
--header 'Content-Type: application/json' \
--data '{"url": "https://sv.shopee.com.br/share-video/_COauUY1CADz2PgXAAAAAA=="}'
```

#### Fluxo de Processamento

1. **Validação da URL**: Verificar se a URL é válida da Shopee
2. **Chamada à API Externa**: Enviar requisição para a API de download
3. **Processamento da Resposta**: Extrair `videoUrl` do retorno
4. **Download do Vídeo**: Baixar o arquivo MP4 do `videoUrl` retornado
5. **Armazenamento**: Salvar o vídeo no storage configurado
6. **Atualização do Registro**: Marcar download como concluído no banco de dados

#### Tratamento de Erros

- **URL Inválida**: Retornar erro 400 com mensagem clara
- **Vídeo Não Encontrado**: Retornar erro 404
- **Limite de API Excedido**: Implementar retry com backoff exponencial
- **Timeout**: Configurar timeout de 60 segundos por requisição
- **Falha no Download**: Marcar como FAILED e permitir retry manual

### 11.2 Armazenamento de Vídeos

**Opção 1: Armazenamento Local**
- Vídeos salvos no servidor
- Limpeza automática após 7 dias
- Backup regular

**Opção 2: Cloud Storage (Recomendado)**
- S3 ou compatible (Backblaze B2, DigitalOcean Spaces)
- URLs pré-assinadas para download
- Lifecycle policies para limpeza automática

### 11.3 Processamento Assíncrono

- **Bull/BullMQ**: Queue system baseado em Redis
- **Workers**: Processos separados para downloads
- **Retry Logic**: Tentativas automáticas em caso de falha
- **Notificações**: Webhook ou email quando download completa

---

## 12. MELHORIAS FUTURAS

### Fase 2 (Pós-MVP)
- [ ] Login social (Google, Facebook)
- [ ] Download em lote (múltiplas URLs)
- [ ] Conversão para outros formatos (AVI, MOV)
- [ ] Edição básica de vídeo
- [ ] Compressão de vídeo
- [ ] API pública para desenvolvedores
- [ ] App mobile (React Native)
- [ ] Sistema de referência/afiliados
- [ ] Planos corporativos
- [ ] Analytics avançado

---

## 13. MÉTRICAS DE SUCESSO

### KPIs Principais
- Número de usuários cadastrados
- Taxa de conversão Free → Premium
- Número de downloads por dia
- Taxa de retenção de usuários
- Tempo médio de processamento
- Taxa de erro em downloads
- Receita mensal recorrente (MRR)

---

## 14. RISCOS E MITIGAÇÕES

### Risco 1: Bloqueio pela Shopee
**Mitigação**: 
- Rotação de IPs
- User agents variados
- Rate limiting conservador
- Proxy rotation

### Risco 2: Mudanças na estrutura do site da Shopee
**Mitigação**:
- Sistema de detecção de mudanças
- Múltiplos métodos de extração
- Notificação automática de falhas

### Risco 3: Carga de servidor alta
**Mitigação**:
- Queue system
- Limite de processamentos simultâneos
- Auto-scaling (se cloud)

### Risco 4: Questões legais de copyright
**Mitigação**:
- Termos de uso claros
- Disclaimer de uso pessoal
- Sistema de DMCA takedown
- Não armazenar vídeos permanentemente

---

## 15. CONCLUSÃO

Este documento serve como guia completo para o desenvolvimento do sistema de download de vídeos da Shopee. O projeto será desenvolvido de forma iterativa, com entregas incrementais e testes contínuos.

**Próximos Passos:**
1. Aprovação da especificação
2. Setup do ambiente de desenvolvimento
3. Início da Fase 1 do cronograma

---

**Versão**: 1.0  
**Data**: Janeiro 2026  
**Autor**: Cascade AI  
**Status**: Aguardando aprovação para início do desenvolvimento

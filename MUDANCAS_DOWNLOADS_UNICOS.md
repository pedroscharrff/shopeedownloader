# Mudanças: Sistema de Downloads Únicos

## Resumo das Alterações

O sistema foi modificado para que os **5 downloads gratuitos sejam únicos e vitalícios**, não mais 5 por dia. Além disso, foi implementado um **sistema de proteção** que impede que usuários que deletaram suas contas criem novas contas com o mesmo email para obter novos downloads gratuitos.

## Mudanças Implementadas

### 1. Schema do Banco de Dados (`schema.prisma`)

#### Adicionado ao modelo `User`:
- **`totalDownloads`**: Campo que rastreia o total de downloads realizados pelo usuário (inicializado em 0)

#### Nova tabela `BlockedEmail`:
- Armazena emails de contas deletadas
- Impede recriação de conta com o mesmo email
- Campos:
  - `id`: Identificador único
  - `email`: Email bloqueado (único)
  - `reason`: Motivo do bloqueio (padrão: "account_deleted")
  - `createdAt`: Data de criação do bloqueio

### 2. Controller de Autenticação (`auth.controller.ts`)

**Função `register`:**
- Verifica se o email está na lista de bloqueio antes de permitir registro
- Retorna erro 403 se o email estiver bloqueado
- Mensagem: "Este email não pode ser utilizado para criar uma nova conta"

### 3. Controller de Downloads (`download.controller.ts`)

**Função `createDownload`:**
- Removida lógica de `DailyLimit`
- Agora verifica `user.totalDownloads` contra o limite total
- Para plano FREE: 5 downloads únicos (vitalícios)
- Para plano PREMIUM: ilimitado
- Incrementa `totalDownloads` do usuário após cada download
- Mensagem de erro personalizada para plano FREE

**Função `getDownloadStats`:**
- Retorna estatísticas baseadas em downloads totais
- Campos retornados:
  - `totalLimit`: Limite total de downloads
  - `usedDownloads`: Downloads já utilizados
  - `remainingDownloads`: Downloads restantes
  - `totalDownloads`: Total de registros de download
  - `completedDownloads`: Downloads concluídos com sucesso

### 4. Controller de Usuário (`user.controller.ts`)

**Função `deleteAccount`:**
- Antes de deletar a conta, adiciona o email à tabela `BlockedEmail`
- Limpa os cookies de autenticação
- Garante que o email não possa ser reutilizado

### 5. Variáveis de Ambiente

**Alteração:**
- `FREE_PLAN_DAILY_LIMIT` → `FREE_PLAN_TOTAL_LIMIT`
- Valor padrão: 5 downloads únicos

## Como Aplicar as Mudanças

### Passo 1: Executar Migration

No diretório `backend`, execute:

```bash
npx prisma migrate dev --name add_total_downloads_and_blocked_emails
```

Isso irá:
- Adicionar o campo `totalDownloads` na tabela `users`
- Criar a nova tabela `blocked_emails`
- Atualizar o Prisma Client

### Passo 2: Atualizar Dados Existentes (Opcional)

Se você já tem usuários no banco de dados e quer migrar os dados do sistema antigo:

```sql
-- Atualizar totalDownloads baseado nos downloads já realizados
UPDATE users 
SET total_downloads = (
  SELECT COUNT(*) 
  FROM downloads 
  WHERE downloads.user_id = users.id
);
```

### Passo 3: Reiniciar o Backend

Após a migration, reinicie o servidor backend:

```bash
npm run dev
```

## Comportamento do Sistema

### Para Usuários FREE:
- ✅ Recebem 5 downloads gratuitos ao criar a conta
- ✅ Podem usar os 5 downloads a qualquer momento (não expiram)
- ✅ Após usar os 5 downloads, precisam fazer upgrade para Premium
- ❌ Não podem criar nova conta com o mesmo email após deletar

### Para Usuários PREMIUM:
- ✅ Downloads ilimitados
- ✅ Sem restrições de quantidade

### Proteção Contra Abuso:
- ❌ Email de conta deletada não pode ser reutilizado
- ❌ Tentativa de registro com email bloqueado retorna erro 403
- ✅ Sistema rastreia permanentemente emails de contas deletadas

## Mensagens de Erro

### Limite de Downloads Atingido (FREE):
```
Você já utilizou seus 5 downloads gratuitos. Faça upgrade para o plano Premium para downloads ilimitados.
```

### Email Bloqueado:
```
Este email não pode ser utilizado para criar uma nova conta
```

## Compatibilidade

- ✅ Mantém compatibilidade com sistema de assinaturas
- ✅ Mantém tabela `DailyLimit` para possível uso futuro
- ✅ Não afeta usuários Premium
- ✅ Frontend precisa ser atualizado para refletir mudanças na API de stats

## Próximos Passos Recomendados

1. **Atualizar Frontend**: Modificar componentes que exibem estatísticas de download
2. **Testar Fluxo Completo**:
   - Criar conta FREE
   - Fazer 5 downloads
   - Tentar 6º download (deve falhar)
   - Deletar conta
   - Tentar criar nova conta com mesmo email (deve falhar)
3. **Monitorar Logs**: Verificar se há erros relacionados ao novo campo `totalDownloads`

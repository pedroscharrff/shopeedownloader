# Integração de Pagamento OpenPix (Woovi)

## Visão Geral

Este documento descreve a integração completa de pagamento recorrente com a plataforma OpenPix (Woovi) implementada no sistema de download de vídeos da Shopee.

## Credenciais

- **APP ID**: `Q2xpZW50X0lkXzY3OTM1OWJkLTJlNjMtNGE3Yi1iNmM4LWZhZjQ1NDY3OGE2OTpDbGllbnRfU2VjcmV0X1VJblZrOG9iK3lPNnJaOHRSOFVvZ1NJZnRhZUJ0ZXBUbEhrVEkyZWNHTDg9`
- **Client ID**: `Client_Id_679359bd-2e63-4a7b-b6c8-faf454678a69`

## Arquitetura

### Backend

#### 1. Schema do Banco de Dados (Prisma)

**Tabela `subscriptions`** - Campos adicionados:
- `openpixSubscriptionId`: ID da assinatura na OpenPix
- `openpixGlobalId`: Global ID da assinatura
- `dayGenerateCharge`: Dia do mês para gerar cobrança (1-28)

**Tabela `payments`** - Campos adicionados:
- `paymentType`: Tipo de pagamento (CHARGE ou SUBSCRIPTION)
- `openpixChargeId`: ID da cobrança na OpenPix
- `openpixGlobalId`: Global ID da cobrança
- `correlationId`: ID de correlação único
- `brCode`: Código PIX Copia e Cola
- `qrCodeImage`: URL da imagem do QR Code
- `paymentLinkUrl`: URL do link de pagamento
- `expiresAt`: Data de expiração do pagamento

**Novos Enums**:
- `PaymentStatus`: Adicionado `ACTIVE` e `EXPIRED`
- `PaymentType`: `CHARGE` e `SUBSCRIPTION`

#### 2. Serviços

**`openpix.service.ts`**
- `createCharge()`: Cria cobrança única via PIX
- `createSubscription()`: Cria assinatura recorrente
- `getCharge()`: Busca informações de uma cobrança
- `getSubscription()`: Busca informações de uma assinatura
- `cancelSubscription()`: Cancela assinatura recorrente
- `validateWebhookPayload()`: Valida payload do webhook
- `createChargeForPlan()`: Helper para criar cobrança de plano
- `createRecurringSubscription()`: Helper para criar assinatura recorrente

**`payment.service.ts`**
- `createPayment()`: Cria pagamento único (mensal ou anual)
- `createRecurringSubscription()`: Cria assinatura recorrente mensal
- `handlePaymentWebhook()`: Processa webhook de pagamento confirmado
- `checkExpiredSubscriptions()`: Verifica e expira assinaturas vencidas
- `cancelSubscription()`: Cancela assinatura do usuário
- `getUserPayments()`: Lista pagamentos do usuário
- `getUserActiveSubscription()`: Busca assinatura ativa do usuário
- `getPaymentByCorrelationId()`: Busca pagamento por correlationID

#### 3. Controllers

**`payment.controller.ts`**
- `POST /api/payments/create`: Cria pagamento único
- `POST /api/payments/subscription/create`: Cria assinatura recorrente
- `POST /api/payments/subscription/cancel`: Cancela assinatura
- `GET /api/payments/subscription/active`: Busca assinatura ativa
- `GET /api/payments`: Lista todos os pagamentos
- `GET /api/payments/:id`: Busca pagamento específico
- `POST /api/payments/webhook`: Webhook da OpenPix (não autenticado)

#### 4. Middleware

**`checkSubscription.ts`**
- `checkActiveSubscription()`: Verifica se usuário tem assinatura ativa e não expirada
- `checkPremiumPlan()`: Verifica se usuário tem plano Premium

#### 5. Variáveis de Ambiente

```env
OPENPIX_APP_ID=Q2xpZW50X0lkXzY3OTM1OWJkLTJlNjMtNGE3Yi1iNmM4LWZhZjQ1NDY3OGE2OTpDbGllbnRfU2VjcmV0X1VJblZrOG9iK3lPNnJaOHRSOFVvZ1NJZnRhZUJ0ZXBUbEhrVEkyZWNHTDg9
OPENPIX_CLIENT_ID=Client_Id_679359bd-2e63-4a7b-b6c8-faf454678a69
```

### Frontend

#### 1. Serviços

**`payment.service.ts`**
- `createPayment()`: Cria pagamento único
- `createRecurringSubscription()`: Cria assinatura recorrente
- `cancelSubscription()`: Cancela assinatura
- `getActiveSubscription()`: Busca assinatura ativa
- `getPayments()`: Lista pagamentos
- `getPaymentById()`: Busca pagamento específico

#### 2. Componentes

**`PaymentModal.tsx`**
- Modal de pagamento com 2 etapas:
  1. Formulário de dados do cliente (nome, CPF/CNPJ, email, telefone)
  2. Exibição do QR Code PIX e código Copia e Cola
- Validação de CPF/CNPJ e telefone
- Formatação automática de campos
- Cópia do código PIX com feedback visual

**`Upgrade.tsx`**
- Página de upgrade para Premium
- Comparação de planos (Free vs Premium)
- Opções de plano mensal e anual
- FAQ sobre pagamentos
- Integração com PaymentModal

## Fluxos de Pagamento

### 1. Pagamento Único (Mensal ou Anual)

```
1. Usuário escolhe plano (mensal R$ 29,90 ou anual R$ 299,00)
2. Preenche dados pessoais (nome, CPF, email, telefone)
3. Backend cria cobrança na OpenPix
4. Frontend exibe QR Code PIX
5. Usuário paga via PIX
6. OpenPix envia webhook para backend
7. Backend ativa assinatura e atualiza plano do usuário
8. Assinatura válida por 1 mês (mensal) ou 1 ano (anual)
```

### 2. Assinatura Recorrente

```
1. Usuário escolhe assinatura recorrente
2. Preenche dados pessoais
3. Backend cria assinatura na OpenPix
4. OpenPix gera cobranças automaticamente todo dia 5 do mês
5. Usuário recebe notificação de nova cobrança
6. Paga via PIX
7. Webhook confirma pagamento
8. Assinatura renovada por mais 1 mês
```

### 3. Cancelamento de Assinatura

```
1. Usuário solicita cancelamento
2. Backend cancela assinatura na OpenPix
3. Assinatura marcada como CANCELLED
4. Usuário mantém acesso até data de expiração
5. Após expiração, plano volta para FREE
```

## Webhook da OpenPix

### Configuração

**URL do Webhook**: `https://seu-dominio.com/api/payments/webhook`

**Eventos Suportados**:
- `OPENPIX:CHARGE_COMPLETED`: Pagamento confirmado

### Payload do Webhook

```json
{
  "event": "OPENPIX:CHARGE_COMPLETED",
  "charge": {
    "status": "COMPLETED",
    "customer": {
      "name": "João da Silva",
      "taxID": "12345678900",
      "email": "[email protected]",
      "phone": "5511999999999"
    },
    "value": 2990,
    "correlationID": "user-id-PREMIUM-monthly-1234567890",
    "transactionID": "abc123...",
    "paidAt": "2026-01-11T19:00:00.000Z"
  }
}
```

### Processamento

1. Webhook recebe payload
2. Valida evento `OPENPIX:CHARGE_COMPLETED`
3. Busca pagamento por `correlationID`
4. Atualiza status do pagamento para `COMPLETED`
5. Ativa ou renova assinatura do usuário
6. Atualiza plano do usuário para `PREMIUM`
7. Retorna sucesso (200 OK)

## Segurança

### Backend

✅ **Validações implementadas**:
- Todos os valores são calculados no backend (nunca confia no frontend)
- CPF/CNPJ validado via regex
- Telefone formatado com código do país (55)
- Email validado
- Correlação única por pagamento
- Webhook sem autenticação (padrão OpenPix)

### Frontend

✅ **Boas práticas**:
- Dados sensíveis nunca armazenados localmente
- Validação de formulário antes de enviar
- Formatação automática de CPF e telefone
- Feedback visual claro para o usuário
- Tratamento de erros da API

## Verificação de Assinatura Expirada

### Cron Job Recomendado

Criar um cron job para executar diariamente:

```typescript
// Exemplo de cron job (usar node-cron ou similar)
import cron from 'node-cron';
import paymentService from './services/payment.service';

// Executa todo dia às 00:00
cron.schedule('0 0 * * *', async () => {
  console.log('Verificando assinaturas expiradas...');
  const expired = await paymentService.checkExpiredSubscriptions();
  console.log(`${expired.length} assinaturas expiradas`);
});
```

### Middleware de Proteção

Para proteger rotas que exigem assinatura ativa:

```typescript
import { checkActiveSubscription } from './middleware/checkSubscription';

// Exemplo de uso
router.post('/downloads', authenticate, checkActiveSubscription, createDownload);
```

## Planos e Preços

| Plano | Preço | Período | Economia |
|-------|-------|---------|----------|
| Mensal | R$ 29,90 | 1 mês | - |
| Anual | R$ 299,00 | 12 meses | 17% (2 meses grátis) |

## Recursos por Plano

| Recurso | Free | Premium |
|---------|------|---------|
| Downloads/dia | 5 | Ilimitado |
| Qualidade | Original | Original |
| Velocidade | Normal | Prioritária |
| Histórico | Últimos 10 | Completo |
| Downloads simultâneos | 1 | 3 |
| Suporte | Email | Prioritário |

## Testes

### Teste de Pagamento

1. Acesse `/upgrade`
2. Escolha um plano
3. Preencha dados de teste:
   - Nome: Teste da Silva
   - CPF: 12345678900
   - Email: [email protected]
   - Telefone: (11) 99999-9999
4. Gere QR Code
5. Use app de testes da OpenPix para pagar
6. Verifique ativação da assinatura

### Teste de Webhook

```bash
curl -X POST http://localhost:3001/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "OPENPIX:CHARGE_COMPLETED",
    "charge": {
      "status": "COMPLETED",
      "correlationID": "test-correlation-id",
      "paidAt": "2026-01-11T19:00:00.000Z"
    }
  }'
```

## Próximos Passos

1. ✅ Implementar integração OpenPix
2. ✅ Criar componentes de pagamento
3. ✅ Configurar webhook
4. ⏳ Testar em ambiente de desenvolvimento
5. ⏳ Configurar webhook na plataforma OpenPix
6. ⏳ Implementar cron job de verificação de assinaturas
7. ⏳ Testar fluxo completo de pagamento
8. ⏳ Deploy em produção

## Suporte

Para dúvidas sobre a API OpenPix:
- Documentação: https://developers.woovi.com
- Suporte: [email protected]

## Notas Importantes

⚠️ **Atenção**:
- O webhook da OpenPix não usa autenticação (é o padrão da plataforma)
- Sempre valide o `correlationID` para evitar fraudes
- Mantenha as credenciais em variáveis de ambiente
- Nunca exponha o APP ID no frontend
- Configure o webhook na plataforma OpenPix apontando para sua URL pública

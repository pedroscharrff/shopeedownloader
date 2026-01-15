# Guia de Teste - Integração de Pagamento OpenPix

## Pré-requisitos

### 1. Iniciar o Backend

```bash
cd backend
npm run dev
```

O backend deve estar rodando em `http://localhost:3001`

### 2. Iniciar o Frontend

```bash
cd frontend
npm run dev
```

O frontend deve estar rodando em `http://localhost:3000`

### 3. Verificar Banco de Dados

Certifique-se que o PostgreSQL está rodando na porta 5440:

```bash
docker-compose up -d
```

## Fluxo de Teste Completo

### Passo 1: Criar uma Conta

1. Acesse `http://localhost:3000`
2. Clique em "Cadastrar"
3. Preencha os dados:
   - Nome: Teste da Silva
   - Email: [email protected]
   - Senha: teste123456
4. Faça login

### Passo 2: Acessar Página de Assinatura

1. No menu, clique em "Assinatura" ou acesse `http://localhost:3000/subscription`
2. Você verá seu plano atual (FREE)
3. Verá dois cards com planos Premium:
   - **Mensal**: R$ 29,90/mês
   - **Anual**: R$ 299,00/ano

### Passo 3: Testar Criação de Pagamento

1. Clique no botão **"Assinar Mensal"** ou **"Assinar Anual"**
2. Um modal deve abrir com o formulário de pagamento
3. Preencha os dados:
   - **Nome Completo**: João da Silva
   - **CPF**: 12345678900 (será formatado automaticamente)
   - **Email**: [email protected]
   - **Telefone**: (11) 99999-9999

4. Clique em **"Gerar QR Code PIX"**

### Passo 4: Verificar QR Code Gerado

Se tudo estiver correto, você verá:
- ✅ Imagem do QR Code PIX
- ✅ Código PIX Copia e Cola
- ✅ Botão para copiar o código

### Passo 5: Simular Pagamento (Ambiente de Teste)

**Opção A: Usar App de Testes da OpenPix**
1. Baixe o app de testes da OpenPix
2. Escaneie o QR Code
3. Confirme o pagamento

**Opção B: Simular Webhook Manualmente**

Abra um terminal e execute:

```bash
curl -X POST http://localhost:3001/api/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "OPENPIX:CHARGE_COMPLETED",
    "charge": {
      "status": "COMPLETED",
      "correlationID": "SEU_CORRELATION_ID_AQUI",
      "customer": {
        "name": "João da Silva",
        "taxID": "12345678900",
        "email": "[email protected]",
        "phone": "5511999999999"
      },
      "value": 2990,
      "transactionID": "test-transaction-123",
      "paidAt": "2026-01-11T20:00:00.000Z"
    }
  }'
```

**IMPORTANTE**: Substitua `SEU_CORRELATION_ID_AQUI` pelo correlationID que foi gerado. Você pode encontrá-lo:
- No console do backend (logs)
- No banco de dados na tabela `payments`

### Passo 6: Verificar Ativação da Assinatura

1. Recarregue a página `/subscription`
2. Seu plano deve mudar de **FREE** para **PREMIUM**
3. Você verá informações da assinatura ativa:
   - Data de início
   - Data de expiração
   - Status: Ativo

## Verificação no Banco de Dados

### Ver Pagamentos Criados

```bash
cd backend
npx prisma studio
```

Ou conecte-se ao PostgreSQL:

```bash
docker exec -it shopee-postgres psql -U postgres -d shopee_downloader
```

```sql
-- Ver todos os pagamentos
SELECT id, user_id, amount, status, correlation_id, created_at 
FROM payments 
ORDER BY created_at DESC;

-- Ver assinaturas
SELECT id, user_id, plan_type, status, expires_at 
FROM subscriptions 
ORDER BY created_at DESC;

-- Ver usuários e seus planos
SELECT id, name, email, plan_type 
FROM users;
```

## Teste de Cancelamento

1. Com uma assinatura ativa, vá para `/subscription`
2. Clique em **"Cancelar Assinatura"**
3. Confirme o cancelamento
4. Verifique que:
   - Status da assinatura muda para CANCELLED
   - Você ainda tem acesso até a data de expiração
   - Após expiração, plano volta para FREE

## Problemas Comuns e Soluções

### ❌ Erro: "Cannot find module '@/components/PaymentModal'"

**Solução**: Verifique se o arquivo existe:
```bash
ls frontend/src/components/PaymentModal.tsx
```

### ❌ Erro: "OPENPIX_APP_ID não configurado"

**Solução**: Verifique o arquivo `.env` do backend:
```bash
cat backend/.env | grep OPENPIX
```

Deve conter:
```
OPENPIX_APP_ID=Q2xpZW50X0lkXzY3OTM1OWJkLTJlNjMtNGE3Yi1iNmM4LWZhZjQ1NDY3OGE2OTpDbGllbnRfU2VjcmV0X1VJblZrOG9iK3lPNnJaOHRSOFVvZ1NJZnRhZUJ0ZXBUbEhrVEkyZWNHTDg9
```

### ❌ Erro 404 ao chamar API

**Solução**: Verifique se o backend está rodando:
```bash
curl http://localhost:3001/api/payments/subscription/active
```

### ❌ Botão não faz nada

**Solução**: 
1. Abra o console do navegador (F12)
2. Veja se há erros JavaScript
3. Verifique se o PaymentModal foi importado corretamente

### ❌ QR Code não aparece

**Solução**:
1. Verifique logs do backend para ver se a requisição chegou
2. Verifique se há erro na resposta da API OpenPix
3. Confirme que as credenciais estão corretas

## Logs Úteis

### Backend
```bash
cd backend
npm run dev
# Observe os logs quando criar pagamento
```

### Frontend (Console do Navegador)
```javascript
// Ver estado da aplicação
console.log('User:', user)
console.log('Subscription:', subscription)
```

## Próximos Passos Após Teste Local

1. ✅ Testar fluxo completo localmente
2. ⏳ Configurar webhook na plataforma OpenPix
3. ⏳ Implementar cron job para verificar assinaturas expiradas
4. ⏳ Deploy em produção
5. ⏳ Testar com pagamento real

## Configurar Webhook na OpenPix (Produção)

1. Acesse https://app.woovi.com
2. Faça login com suas credenciais
3. Vá em **API/Plugins** → **Webhooks**
4. Clique em **Novo Webhook**
5. Configure:
   - **URL**: `https://seu-dominio.com/api/payments/webhook`
   - **Evento**: `OPENPIX:CHARGE_COMPLETED`
   - **Ativo**: Sim
6. Salve

## Teste de Carga (Opcional)

Para testar múltiplos pagamentos:

```bash
# Criar 10 pagamentos de teste
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/payments/create \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer SEU_TOKEN_JWT" \
    -d '{
      "planType": "PREMIUM",
      "billingPeriod": "monthly",
      "customerData": {
        "name": "Teste '$i'",
        "taxID": "12345678900",
        "email": "teste'$i'@example.com",
        "phone": "5511999999999"
      }
    }'
  sleep 1
done
```

## Suporte

Se encontrar problemas:
1. Verifique os logs do backend
2. Verifique o console do navegador
3. Consulte a documentação da OpenPix: https://developers.woovi.com
4. Verifique o arquivo `INTEGRACAO_OPENPIX.md` para detalhes técnicos

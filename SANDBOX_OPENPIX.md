# Configuração do Sandbox OpenPix

## ✅ Correção Aplicada

O sistema agora usa automaticamente:
- **Desenvolvimento** (`NODE_ENV=development`): `https://api.woovi-sandbox.com/api/v1`
- **Produção** (`NODE_ENV=production`): `https://api.openpix.com.br/api/v1`

## 🔧 Como Obter o AppID do Sandbox

### 1. Acessar o Sandbox

Acesse: **https://app.woovi-sandbox.com**

⚠️ **IMPORTANTE**: Use o sandbox, NÃO o app de produção!

### 2. Criar Conta ou Fazer Login

Se ainda não tem conta no sandbox:
1. Clique em "Criar conta"
2. Preencha os dados
3. Confirme o email

### 3. Criar Aplicativo/Integração

1. No menu lateral, procure **"API/Plugins"** ou **"Integrações"**
2. Clique em **"Novo Aplicativo"**
3. Dê um nome: "Sistema Shopee Downloader - DEV"
4. Selecione tipo: **API**

### 4. Gerar AppID

1. Após criar, clique em **"Gerar AppID"** ou **"Criar Chave"**
2. Pode solicitar autenticação 2FA
3. O AppID será exibido

### 5. Copiar o AppID

O AppID terá formato similar a:
```
Q2xpZW50X0lkX2FiYzEyMy1kZWY0LTU2NzgtOTAxMi1naGlqa2xtbm9wcXI6Q2xpZW50X1NlY3JldF94eXoxMjM0NTY3ODkw
```

**IMPORTANTE**: Copie exatamente como aparece, sem espaços.

### 6. Atualizar .env

```bash
# backend/.env
OPENPIX_APP_ID=SEU_APPID_DO_SANDBOX_AQUI
```

### 7. Reiniciar Backend

```bash
cd backend
# Ctrl+C para parar
npm run dev
```

Você verá no console:
```
🔧 OpenPix configurado para: https://api.woovi-sandbox.com/api/v1
```

## 🧪 Testar a Integração

### Teste 1: Verificar Endpoint

Quando o backend iniciar, você deve ver:
```
🔧 OpenPix configurado para: https://api.woovi-sandbox.com/api/v1
```

### Teste 2: Criar Pagamento

1. Acesse `http://localhost:3000/subscription`
2. Clique em "Assinar Mensal"
3. Preencha:
   - CPF: `12345678900`
   - Telefone: `65981716652`
4. Clique em "Gerar QR Code PIX"

### Teste 3: Verificar Logs

No terminal do backend, você deve ver:
```
✅ Cobrança criada com sucesso
```

**NÃO deve aparecer**:
```
❌ Erro ao criar cobrança OpenPix: { data: null, errors: [ { message: 'appID inválido' } ] }
```

## 🔍 Verificar se AppID Está Correto

### Teste Manual com cURL

```bash
curl --request GET \
  --url https://api.woovi-sandbox.com/api/v1/charge \
  --header 'Authorization: SEU_APPID_DO_SANDBOX'
```

**Resposta esperada**:
- ✅ Status 200: AppID válido
- ❌ Status 401: AppID inválido

## 📋 Diferenças: Sandbox vs Produção

| Aspecto | Sandbox | Produção |
|---------|---------|----------|
| URL App | https://app.woovi-sandbox.com | https://app.woovi.com |
| URL API | https://api.woovi-sandbox.com/api/v1 | https://api.openpix.com.br/api/v1 |
| Pagamentos | Simulados (não cobram de verdade) | Reais (cobram de verdade) |
| AppID | Diferente | Diferente |
| Testes | ✅ Recomendado | ❌ Evitar |

## 🎯 Fluxo de Teste no Sandbox

1. **Criar cobrança** → Gera QR Code
2. **Simular pagamento** → Use ferramentas do sandbox
3. **Webhook** → Recebe notificação
4. **Ativar assinatura** → Sistema processa

## 🔐 Segurança

⚠️ **NUNCA**:
- Use AppID de produção em desenvolvimento
- Use AppID de sandbox em produção
- Compartilhe AppIDs publicamente

✅ **SEMPRE**:
- Use AppID de sandbox para testes
- Use AppID de produção apenas em produção
- Mantenha AppIDs no arquivo `.env`

## ❓ Problemas Comuns

### Erro: "appID inválido" ainda aparece

**Soluções**:
1. Verifique se está usando AppID do **SANDBOX** (não de produção)
2. Copie o AppID novamente (sem espaços)
3. Reinicie o backend
4. Verifique se o console mostra: `🔧 OpenPix configurado para: https://api.woovi-sandbox.com/api/v1`

### Erro: Endpoint não encontrado

**Solução**: Verifique se o `NODE_ENV` está como `development`:
```bash
# backend/.env
NODE_ENV=development
```

### Pagamento não é processado

**Solução**: No sandbox, você precisa simular o pagamento manualmente:
1. Acesse https://app.woovi-sandbox.com
2. Vá em "Cobranças"
3. Encontre a cobrança criada
4. Clique em "Simular Pagamento"

## 📞 Suporte

- Documentação: https://developers.woovi.com
- Discord: https://discord.gg/openpix
- Email: [email protected]

## ✅ Checklist Final

- [ ] Acessei https://app.woovi-sandbox.com (SANDBOX, não produção)
- [ ] Criei conta no sandbox
- [ ] Criei novo aplicativo
- [ ] Gerei AppID do sandbox
- [ ] Copiei AppID completo
- [ ] Atualizei `backend/.env` com AppID do sandbox
- [ ] Verifiquei que `NODE_ENV=development`
- [ ] Reiniciei o backend
- [ ] Vi no console: `🔧 OpenPix configurado para: https://api.woovi-sandbox.com/api/v1`
- [ ] Testei criar pagamento
- [ ] Não há mais erro de "appID inválido"

---

**Próximo Passo**: Obtenha o AppID do sandbox e teste novamente!

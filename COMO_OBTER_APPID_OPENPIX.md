# Como Obter o AppID Correto da OpenPix

## ⚠️ Problema Atual

O erro `appID inválido` indica que o AppID fornecido não está no formato correto ou não é válido na plataforma OpenPix.

## 📋 Passo a Passo para Obter o AppID

### 1. Acessar a Plataforma OpenPix

1. Acesse: https://app.woovi.com
2. Faça login com suas credenciais

### 2. Navegar até API/Plugins

1. No menu lateral, procure por **"API/Plugins"** ou **"Integrações"**
2. Clique em **"Novo Aplicativo"** ou **"Nova Integração"**

### 3. Criar um Novo Aplicativo

1. **Nome da Integração**: Digite um nome (ex: "Sistema Shopee Downloader")
2. **Tipo**: Selecione "API" ou "Plugin"
3. Clique em **"Criar"**

### 4. Gerar o AppID

1. Após criar o aplicativo, você verá uma opção para **"Gerar AppID"** ou **"Criar Chave"**
2. Pode ser solicitado um fator de autenticação (2FA)
3. Após confirmar, o **AppID** será exibido

### 5. Copiar o AppID

O AppID terá um formato similar a:
```
Q2xpZW50X0lkXzY3OTM1OWJkLTJlNjMtNGE3Yi1iNmM4LWZhZjQ1NDY3OGE2OTpDbGllbnRfU2VjcmV0X1VJblZrOG9iK3lPNnJaOHRSOFVvZ1NJZnRhZUJ0ZXBUbEhrVEkyZWNHTDg9
```

**IMPORTANTE**: 
- Copie exatamente como aparece
- Não adicione espaços ou quebras de linha
- Não adicione prefixos como "Bearer" ou "Token"

### 6. Atualizar o .env

Abra o arquivo `backend/.env` e atualize:

```env
OPENPIX_APP_ID=SEU_APPID_AQUI
```

Substitua `SEU_APPID_AQUI` pelo AppID copiado.

### 7. Reiniciar o Backend

```bash
cd backend
# Pare o servidor (Ctrl+C)
npm run dev
```

## 🔍 Verificar se o AppID Está Correto

### Teste Manual com cURL

```bash
curl --request GET \
  --url https://api.openpix.com.br/api/v1/charge \
  --header 'Authorization: SEU_APPID_AQUI'
```

**Resposta Esperada**:
- ✅ Status 200: AppID válido
- ❌ Status 401 com `"appID inválido"`: AppID incorreto

## ❓ Possíveis Problemas

### 1. AppID Expirado
- Gere um novo AppID na plataforma
- Atualize o `.env`

### 2. AppID com Espaços ou Quebras de Linha
- Certifique-se que não há espaços antes ou depois
- Deve estar em uma única linha

### 3. AppID de Ambiente Errado
- Verifique se está usando o AppID de **produção** ou **sandbox**
- Para testes, use o AppID de sandbox

### 4. Conta OpenPix Não Ativada
- Verifique se sua conta está ativa
- Confirme o email se necessário

## 🧪 Testar a Integração

Após configurar o AppID correto:

1. Reinicie o backend
2. Tente criar um pagamento
3. Verifique os logs do backend
4. Se aparecer `Erro ao criar cobrança OpenPix`, verifique a mensagem de erro

## 📞 Suporte OpenPix

Se continuar com problemas:
- Email: [email protected]
- Documentação: https://developers.woovi.com
- Discord: https://discord.gg/openpix

## 🔐 Segurança

⚠️ **NUNCA**:
- Compartilhe seu AppID publicamente
- Commit o AppID no Git (use `.env` e `.gitignore`)
- Use o mesmo AppID em múltiplos ambientes

✅ **SEMPRE**:
- Mantenha o AppID no arquivo `.env`
- Use AppIDs diferentes para desenvolvimento e produção
- Desative AppIDs não utilizados na plataforma

## 📝 Formato Correto do .env

```env
# OpenPix (Woovi) - Integração de Pagamento
OPENPIX_APP_ID=Q2xpZW50X0lkXzY3OTM1OWJkLTJlNjMtNGE3Yi1iNmM4LWZhZjQ1NDY3OGE2OTpDbGllbnRfU2VjcmV0X1VJblZrOG9iK3lPNnJaOHRSOFVvZ1NJZnRhZUJ0ZXBUbEhrVEkyZWNHTDg9
OPENPIX_CLIENT_ID=Client_Id_679359bd-2e63-4a7b-b6c8-faf454678a69
```

## ✅ Checklist

- [ ] Acessei https://app.woovi.com
- [ ] Criei um novo aplicativo/integração
- [ ] Gerei o AppID
- [ ] Copiei o AppID completo
- [ ] Atualizei o arquivo `backend/.env`
- [ ] Reiniciei o backend
- [ ] Testei criar um pagamento
- [ ] Verificou que não há erro de "appID inválido"

---

**Próximo Passo**: Após configurar o AppID correto, teste novamente criando um pagamento na página `/subscription`.

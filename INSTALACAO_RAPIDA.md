# Instalação Rápida - VPS

Guia simplificado para colocar a aplicação online em uma VPS.

## 🚀 Instalação em 3 Passos

### 1️⃣ Preparar VPS (Primeira vez apenas)

Conecte-se à sua VPS via SSH e execute:

```bash
# Baixar script de setup
wget https://raw.githubusercontent.com/SEU_USUARIO/shopee/main/setup-vps.sh

# Executar setup inicial
sudo bash setup-vps.sh

# Fazer logout e login novamente
exit
```

### 2️⃣ Clonar Repositório

```bash
# Clonar projeto
git clone https://github.com/SEU_USUARIO/shopee.git
cd shopee
```

### 3️⃣ Instalar e Configurar

```bash
# Executar instalador interativo
bash install.sh
```

O instalador irá solicitar:

- **URL do Frontend**: `http://seu-dominio.com` ou `http://IP_DA_VPS`
- **OpenPix App ID**: (opcional, para pagamentos)
- **Shopee API Token**: (opcional)

As demais configurações (senhas, secrets) são geradas automaticamente.

## ✅ Pronto!

Acesse sua aplicação em: `http://seu-dominio.com` ou `http://IP_DA_VPS`

## 📋 Comandos Úteis

```bash
# Ver logs em tempo real
docker compose -f docker-compose.prod.yml logs -f

# Ver logs apenas do backend
docker compose -f docker-compose.prod.yml logs -f backend

# Parar aplicação
docker compose -f docker-compose.prod.yml down

# Reiniciar aplicação
docker compose -f docker-compose.prod.yml restart

# Atualizar aplicação após git pull
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## 🔒 Configurar SSL/HTTPS (Opcional)

Depois da instalação básica, você pode adicionar certificado SSL gratuito:

```bash
# Instalar Certbot
sudo apt-get install -y certbot

# Obter certificado (substitua seu-dominio.com)
sudo certbot certonly --standalone -d seu-dominio.com

# Certificados ficam em: /etc/letsencrypt/live/seu-dominio.com/
```

Depois, atualize a configuração do Nginx para usar HTTPS (consulte documentação completa).

## 🆘 Troubleshooting

### Containers não iniciam

```bash
# Ver logs detalhados
docker compose -f docker-compose.prod.yml logs

# Verificar status
docker compose -f docker-compose.prod.yml ps
```

### Resetar aplicação completamente

```bash
# CUIDADO: Isso apaga todos os dados!
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build
```

### Reconfigurar variáveis

```bash
# Editar .env manualmente
nano .env

# Ou executar instalador novamente
bash install.sh
```

## 📚 Documentação Completa

Para configurações avançadas, consulte: [`DEPLOY.md`](./DEPLOY.md)

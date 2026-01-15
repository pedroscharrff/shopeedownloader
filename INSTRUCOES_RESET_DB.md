# Instruções para Reset Completo do Banco de Dados

## 🔍 Problema Identificado

O erro de autenticação ocorria devido a:
1. **Conflito entre schema Prisma e script SQL antigo** (`init.sql` obsoleto)
2. **Configurações MD5 desnecessárias** no Docker Compose
3. **Volumes Docker com dados corrompidos** de tentativas anteriores

## ✅ Correções Aplicadas

1. ✅ Removido `init.sql` obsoleto (conflitava com schema Prisma)
2. ✅ Simplificado `docker-compose.yml` (removido MD5 auth)
3. ✅ Criado script de reset automático (`reset-database.ps1`)

## 🚀 Processo de Reset (Escolha uma opção)

### **Opção 1: Script Automático (Recomendado)**

```powershell
# Execute no diretório raiz do projeto
.\reset-database.ps1
```

### **Opção 2: Manual**

```powershell
# 1. Parar containers
docker-compose down

# 2. Remover volumes (DELETA TODOS OS DADOS!)
docker volume rm shopee_postgres_data
docker volume rm shopee_redis_data

# 3. Limpar containers órfãos
docker-compose rm -f

# 4. Recriar ambiente
docker-compose up -d

# 5. Aguardar PostgreSQL inicializar (10-15 segundos)
Start-Sleep -Seconds 15

# 6. Verificar status
docker-compose ps
```

## 📝 Após o Reset - Configurar Prisma

```powershell
# Navegar para o backend
cd backend

# 1. Gerar cliente Prisma
npm run prisma:generate

# 2. Executar migrations (cria as tabelas)
npm run prisma:migrate

# 3. (Opcional) Abrir Prisma Studio para verificar
npm run prisma:studio
```

## 🔧 Verificação de Conexão

Para testar se o PostgreSQL está acessível:

```powershell
# Testar conexão direta
docker exec -it shopee_postgres psql -U postgres -d shopee_downloader -c "\dt"
```

Deve retornar a lista de tabelas criadas pelo Prisma.

## 📋 Credenciais do Banco

Conforme configurado em `.env` e `docker-compose.yml`:

- **Host**: localhost
- **Porta**: 5432
- **Usuário**: postgres
- **Senha**: postgres
- **Database**: shopee_downloader

**Connection String**:
```
postgresql://postgres:postgres@localhost:5432/shopee_downloader?schema=public
```

## ⚠️ Troubleshooting

### Erro: "port 5432 already in use"
```powershell
# Verificar processos usando a porta
netstat -ano | findstr :5432

# Parar PostgreSQL local se estiver rodando
Stop-Service postgresql-x64-14
```

### Erro: "volume is in use"
```powershell
# Forçar remoção de todos os containers
docker rm -f $(docker ps -aq)

# Tentar remover volumes novamente
docker volume prune -f
```

### Erro: "Cannot connect to Docker daemon"
```powershell
# Iniciar Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Aguardar 30 segundos e tentar novamente
```

## 🎯 Próximos Passos Após Sucesso

1. ✅ Banco de dados limpo e funcionando
2. ✅ Migrations aplicadas
3. ✅ Tabelas criadas corretamente
4. 🔄 Iniciar desenvolvimento do backend
5. 🔄 Testar endpoints da API
6. 🔄 Popular banco com dados de teste (seed)

## 📚 Comandos Úteis

```powershell
# Ver logs do PostgreSQL
docker logs shopee_postgres

# Ver logs do Redis
docker logs shopee_redis

# Acessar shell do PostgreSQL
docker exec -it shopee_postgres psql -U postgres -d shopee_downloader

# Reiniciar apenas o PostgreSQL
docker-compose restart postgres

# Ver todas as migrations aplicadas
cd backend
npx prisma migrate status
```

---

**Última atualização**: Janeiro 2026  
**Status**: Pronto para uso

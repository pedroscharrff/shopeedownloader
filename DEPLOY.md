# Guia de Deploy - Shopee Video Downloader

Este guia descreve os passos para realizar o deploy da aplicação em uma VPS utilizando Docker e Docker Compose.

## Pré-requisitos na VPS

1. **Docker**: Instalado e rodando.
   - [Instalação no Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
2. **Docker Compose**: Instalado (geralmente incluído nas versões recentes do Docker plugin).
3. **Git**: Para clonar o repositório.

## Passo a Passo

### 1. Clonar o Repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd shopee
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no exemplo de produção:

```bash
cp .env.prod.example .env
```

Edite o arquivo `.env` com suas configurações reais:

```bash
nano .env
```

**Configurações Importantes**:
- **Banco de Dados**: Defina uma senha forte em `POSTGRES_PASSWORD`.
- **Segurança**: Atualize `JWT_SECRET` e `JWT_REFRESH_SECRET` com strings aleatórias longas.
- **Frontend**: Ajuste `FRONTEND_URL` para o domínio ou IP público da sua VPS.

### 3. Subir a Aplicação

Execute o comando para construir as imagens e iniciar os containers em modo destacável (background). 
Este processo pode levar alguns minutos na primeira vez, pois fará o build do Frontend e Backend.

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 4. Verificar Status

Verifique se todos os containers estão rodando corretamente:

```bash
docker compose -f docker-compose.prod.yml ps
```

Você deve ver os seguintes serviços rodando:
- `shopee_nginx`
- `shopee_frontend`
- `shopee_backend`
- `shopee_postgres`
- `shopee_redis`

Acesse sua aplicação pelo IP da VPS ou domínio configurado (porta 80).

### 5. Logs e Monitoramento

Para visualizar os logs da aplicação em tempo real:

```bash
# Todos os logs
docker compose -f docker-compose.prod.yml logs -f

# Logs específicos do backend (útil para debugar API)
docker compose -f docker-compose.prod.yml logs -f backend

# Logs do Nginx (acessos)
docker compose -f docker-compose.prod.yml logs -f nginx
```

## Estrutura da Infraestrutura

- **Nginx (Reverse Proxy)**: Escuta na porta 80.
  - Redireciona `/api/*` para o container do Backend.
  - Redireciona o restante `/` para o container do Frontend.
- **Frontend**: Servidor Nginx interno servindo a aplicação React buildada.
- **Backend**: API Node.js/Express.
- **Postgres**: Banco de dados relacional persistindo dados no volume `postgres_data`.
- **Redis**: Banco em memória para filas e cache.

## Manutenção

### Atualizar a Aplicação

Para atualizar a aplicação após mudanças no código (git pull):

```bash
# 1. Baixar novas alterações
git pull

# 2. Reconstruir e reiniciar os containers
docker compose -f docker-compose.prod.yml up -d --build
```

**Nota**: O flag `--build` é essencial para que as alterações no código do Frontend e Backend sejam recompiladas.

### Parar a Aplicação

```bash
docker compose -f docker-compose.prod.yml down
```

### Resetar Banco de Dados (Cuidado!)

Se precisar limpar completamente o banco de dados (isso apagará TODOS os dados!):

```bash
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
```

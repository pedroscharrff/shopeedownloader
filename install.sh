#!/bin/bash

set -e

echo "=========================================="
echo "  Instalador - Shopee Video Downloader"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para gerar string aleatória segura
generate_secret() {
    openssl rand -base64 48 | tr -d "=+/" | cut -c1-64
}

# Verificar pré-requisitos
echo "Verificando pré-requisitos..."
echo ""

if ! command_exists docker; then
    echo -e "${RED}❌ Docker não está instalado!${NC}"
    echo ""
    echo "Deseja instalar o Docker automaticamente? (s/n)"
    read -r install_docker
    if [[ "$install_docker" =~ ^[Ss]$ ]]; then
        echo "Instalando Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        echo -e "${GREEN}✓ Docker instalado${NC}"
        echo -e "${YELLOW}⚠ Faça logout e login novamente para aplicar as permissões${NC}"
        echo "Depois execute este script novamente."
        exit 0
    else
        echo "Instale o Docker manualmente: https://docs.docker.com/engine/install/"
        exit 1
    fi
fi

if ! command_exists git; then
    echo -e "${RED}❌ Git não está instalado!${NC}"
    echo "Instalando Git..."
    sudo apt-get update && sudo apt-get install -y git
fi

echo -e "${GREEN}✓ Docker instalado${NC}"
echo -e "${GREEN}✓ Git instalado${NC}"
echo ""

# Verificar se já existe .env
if [ -f .env ]; then
    echo -e "${YELLOW}⚠ Arquivo .env já existe!${NC}"
    echo "Deseja reconfigurá-lo? (s/n)"
    read -r reconfig
    if [[ ! "$reconfig" =~ ^[Ss]$ ]]; then
        echo "Usando configuração existente..."
        SKIP_CONFIG=true
    else
        rm .env
        SKIP_CONFIG=false
    fi
else
    SKIP_CONFIG=false
fi

# Configuração interativa
if [ "$SKIP_CONFIG" = false ]; then
    echo ""
    echo "=========================================="
    echo "  Configuração da Aplicação"
    echo "=========================================="
    echo ""
    
    # Banco de Dados
    echo -e "${BLUE}[1/6] Configuração do Banco de Dados${NC}"
    read -p "Usuário PostgreSQL [postgres]: " POSTGRES_USER
    POSTGRES_USER=${POSTGRES_USER:-postgres}
    
    read -sp "Senha PostgreSQL (deixe vazio para gerar automaticamente): " POSTGRES_PASSWORD
    echo ""
    if [ -z "$POSTGRES_PASSWORD" ]; then
        POSTGRES_PASSWORD=$(generate_secret)
        echo -e "${GREEN}✓ Senha gerada automaticamente${NC}"
    fi
    
    read -p "Nome do banco de dados [shopee_downloader]: " POSTGRES_DB
    POSTGRES_DB=${POSTGRES_DB:-shopee_downloader}
    echo ""
    
    # JWT Secrets
    echo -e "${BLUE}[2/6] Configuração de Segurança (JWT)${NC}"
    echo "Gerando secrets automaticamente..."
    JWT_SECRET=$(generate_secret)
    JWT_REFRESH_SECRET=$(generate_secret)
    echo -e "${GREEN}✓ Secrets gerados${NC}"
    echo ""
    
    # URLs
    echo -e "${BLUE}[3/6] Configuração de URLs${NC}"
    read -p "URL do Frontend (ex: http://seu-dominio.com ou http://IP_DA_VPS): " FRONTEND_URL
    while [ -z "$FRONTEND_URL" ]; do
        echo -e "${RED}URL do Frontend é obrigatória!${NC}"
        read -p "URL do Frontend: " FRONTEND_URL
    done
    
    read -p "URL da API para o Frontend [/api]: " VITE_API_URL
    VITE_API_URL=${VITE_API_URL:-/api}
    echo ""
    
    # OpenPix
    echo -e "${BLUE}[4/6] Integração de Pagamento (OpenPix)${NC}"
    read -p "OpenPix App ID (deixe vazio se não usar): " OPENPIX_APP_ID
    echo ""
    
    # Shopee API
    echo -e "${BLUE}[5/6] API Shopee${NC}"
    read -p "Shopee API Token (deixe vazio se não usar): " SHOPEE_API_TOKEN
    echo ""
    
    # Expiração de Tokens
    echo -e "${BLUE}[6/6] Configuração de Tokens${NC}"
    read -p "Tempo de expiração do JWT [1h]: " JWT_EXPIRES_IN
    JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-1h}
    
    read -p "Tempo de expiração do Refresh Token [7d]: " JWT_REFRESH_EXPIRES_IN
    JWT_REFRESH_EXPIRES_IN=${JWT_REFRESH_EXPIRES_IN:-7d}
    echo ""
    
    # Criar arquivo .env
    echo "Criando arquivo .env..."
    cat > .env << EOF
# Configurações do Banco de Dados
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=${POSTGRES_DB}

# Configurações do Backend
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=${JWT_EXPIRES_IN}
JWT_REFRESH_EXPIRES_IN=${JWT_REFRESH_EXPIRES_IN}

# Token da API Externa Shopee
SHOPEE_API_TOKEN=${SHOPEE_API_TOKEN}

# Integração de Pagamento (OpenPix)
OPENPIX_APP_ID=${OPENPIX_APP_ID}

# URL do Frontend
FRONTEND_URL=${FRONTEND_URL}

# URL da API para o Build do Frontend (Vite)
VITE_API_URL=${VITE_API_URL}
EOF
    
    echo -e "${GREEN}✓ Arquivo .env criado${NC}"
    echo ""
fi

echo "=========================================="
echo "  Iniciando Deploy"
echo "=========================================="
echo ""

# Parar containers existentes (se houver)
echo "Parando containers existentes..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
echo ""

# Construir e iniciar containers
echo "Construindo e iniciando containers..."
echo -e "${YELLOW}Este processo pode levar alguns minutos...${NC}"
echo ""

docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "Aguardando serviços iniciarem..."
sleep 15

# Verificar status dos containers
echo ""
echo "Status dos containers:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "=========================================="
echo -e "${GREEN}✓ Instalação Concluída com Sucesso!${NC}"
echo "=========================================="
echo ""
echo -e "Acesse a aplicação em: ${GREEN}${FRONTEND_URL}${NC}"
echo ""
echo "Comandos úteis:"
echo "  ${YELLOW}Ver logs:${NC}      docker compose -f docker-compose.prod.yml logs -f"
echo "  ${YELLOW}Ver logs backend:${NC} docker compose -f docker-compose.prod.yml logs -f backend"
echo "  ${YELLOW}Parar:${NC}         docker compose -f docker-compose.prod.yml down"
echo "  ${YELLOW}Reiniciar:${NC}     docker compose -f docker-compose.prod.yml restart"
echo "  ${YELLOW}Atualizar:${NC}     git pull && docker compose -f docker-compose.prod.yml up -d --build"
echo ""
echo -e "${BLUE}Credenciais salvas em: .env${NC}"
echo ""

#!/bin/bash

set -e

echo "=========================================="
echo "  Setup Inicial VPS - Shopee Downloader"
echo "=========================================="
echo ""
echo "Este script prepara uma VPS limpa para rodar a aplicação."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar se está rodando como root ou com sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Por favor, execute com sudo${NC}"
    echo "Exemplo: sudo bash setup-vps.sh"
    exit 1
fi

echo -e "${BLUE}[1/5] Atualizando sistema...${NC}"
apt-get update
apt-get upgrade -y
echo -e "${GREEN}✓ Sistema atualizado${NC}"
echo ""

echo -e "${BLUE}[2/5] Instalando dependências básicas...${NC}"
apt-get install -y \
    curl \
    wget \
    git \
    ufw \
    ca-certificates \
    gnupg \
    lsb-release
echo -e "${GREEN}✓ Dependências instaladas${NC}"
echo ""

echo -e "${BLUE}[3/5] Instalando Docker...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker já está instalado${NC}"
else
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "${GREEN}✓ Docker instalado${NC}"
fi
echo ""

echo -e "${BLUE}[4/5] Configurando Firewall (UFW)...${NC}"
ufw --force enable
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
echo -e "${GREEN}✓ Firewall configurado${NC}"
echo ""

echo -e "${BLUE}[5/5] Configurando permissões Docker...${NC}"
# Adicionar usuário atual ao grupo docker
if [ -n "$SUDO_USER" ]; then
    usermod -aG docker $SUDO_USER
    echo -e "${GREEN}✓ Usuário $SUDO_USER adicionado ao grupo docker${NC}"
else
    echo -e "${YELLOW}⚠ Execute 'sudo usermod -aG docker seu_usuario' manualmente${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}✓ Setup VPS Concluído!${NC}"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo ""
echo "1. ${YELLOW}Faça logout e login novamente${NC} para aplicar permissões do Docker"
echo ""
echo "2. Clone o repositório:"
echo "   git clone <URL_DO_REPOSITORIO>"
echo "   cd shopee"
echo ""
echo "3. Execute o instalador:"
echo "   bash install.sh"
echo ""
echo -e "${BLUE}Portas abertas no firewall:${NC}"
echo "  - 22 (SSH)"
echo "  - 80 (HTTP)"
echo "  - 443 (HTTPS)"
echo ""

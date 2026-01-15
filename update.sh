#!/bin/bash

set -e

echo "=========================================="
echo "Atualizador - Shopee Video Downloader"
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "Baixando atualizações do repositório..."
git pull

echo ""
echo "Reconstruindo e reiniciando containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "Aguardando serviços reiniciarem..."
sleep 10

echo ""
echo "Status dos containers:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo -e "${GREEN}✓ Atualização concluída!${NC}"
echo ""

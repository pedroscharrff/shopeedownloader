#!/bin/bash

set -e

echo "=========================================="
echo "Configurador SSL - Shopee Video Downloader"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar se certbot está instalado
if ! command -v certbot >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Certbot não está instalado. Instalando...${NC}"
    apt-get update
    apt-get install -y certbot
fi

# Solicitar domínio
read -p "Digite seu domínio (ex: exemplo.com): " DOMAIN
read -p "Digite seu email para notificações: " EMAIL

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo -e "${RED}❌ Domínio e email são obrigatórios!${NC}"
    exit 1
fi

echo ""
echo "Parando Nginx temporariamente..."
docker compose -f docker-compose.prod.yml stop nginx

echo ""
echo "Gerando certificado SSL..."
certbot certonly --standalone \
    -d "$DOMAIN" \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    --preferred-challenges http

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Certificado SSL gerado com sucesso!${NC}"
    
    # Criar configuração nginx com SSL
    cat > nginx/nginx-ssl.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:80;
    }

    upstream backend {
        server backend:3001;
    }

    # Redirecionar HTTP para HTTPS
    server {
        listen 80;
        server_name $DOMAIN;
        return 301 https://\$server_name\$request_uri;
    }

    # Servidor HTTPS
    server {
        listen 443 ssl http2;
        server_name $DOMAIN;

        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        client_max_body_size 100M;

        # Logs
        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;

        # Backend API
        location /api/ {
            proxy_pass http://backend/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # Frontend
        location / {
            proxy_pass http://frontend/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
    }
}
EOF

    echo ""
    echo -e "${YELLOW}Atualizando docker-compose.prod.yml para usar SSL...${NC}"
    
    # Backup do docker-compose atual
    cp docker-compose.prod.yml docker-compose.prod.yml.backup
    
    # Atualizar docker-compose para incluir volumes de certificados
    cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:14
    container_name: shopee_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: \${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: \${POSTGRES_DB:-shopee_downloader}
      POSTGRES_HOST_AUTH_METHOD: trust
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d shopee_downloader"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - shopee_network

  redis:
    image: redis:7-alpine
    container_name: shopee_redis
    restart: unless-stopped
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - shopee_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: shopee_backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgres://\${POSTGRES_USER:-postgres}:\${POSTGRES_PASSWORD:-postgres}@postgres:5432/\${POSTGRES_DB:-shopee_downloader}?schema=public
      JWT_SECRET: \${JWT_SECRET}
      JWT_REFRESH_SECRET: \${JWT_REFRESH_SECRET}
      JWT_EXPIRES_IN: \${JWT_EXPIRES_IN:-1h}
      JWT_REFRESH_EXPIRES_IN: \${JWT_REFRESH_EXPIRES_IN:-7d}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      STORAGE_TYPE: local
      STORAGE_PATH: ./uploads
      SHOPEE_API_TOKEN: \${SHOPEE_API_TOKEN}
      OPENPIX_APP_ID: \${OPENPIX_APP_ID}
      FRONTEND_URL: \${FRONTEND_URL:-https://$DOMAIN}
    volumes:
      - backend_uploads:/usr/src/app/uploads
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - shopee_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: \${VITE_API_URL:-/api}
    container_name: shopee_frontend
    restart: unless-stopped
    networks:
      - shopee_network

  nginx:
    image: nginx:alpine
    container_name: shopee_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx-ssl.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - frontend
      - backend
    networks:
      - shopee_network

volumes:
  postgres_data:
  redis_data:
  backend_uploads:

networks:
  shopee_network:
    driver: bridge
EOF

    echo ""
    echo "Reiniciando containers com SSL..."
    docker compose -f docker-compose.prod.yml up -d
    
    echo ""
    echo -e "${GREEN}=========================================="
    echo "✓ SSL configurado com sucesso!"
    echo "==========================================${NC}"
    echo ""
    echo "Sua aplicação agora está disponível em:"
    echo "  https://$DOMAIN"
    echo ""
    echo "Renovação automática:"
    echo "  Adicione ao crontab: 0 0 * * * certbot renew --quiet && docker compose -f $(pwd)/docker-compose.prod.yml restart nginx"
    echo ""
else
    echo -e "${RED}❌ Erro ao gerar certificado SSL${NC}"
    echo "Reiniciando Nginx sem SSL..."
    docker compose -f docker-compose.prod.yml start nginx
    exit 1
fi

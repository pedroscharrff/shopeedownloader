# Estágio de Build
FROM node:20-alpine AS builder

WORKDIR /app

# Aumentar limite de memória do Node.js para build
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências com configurações otimizadas
RUN npm ci --no-audit --no-fund

# Copiar código fonte
COPY . .

# Argumentos de build para variáveis de ambiente
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build da aplicação
RUN npm run build

# Estágio de Produção
FROM nginx:alpine

# Copiar build do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

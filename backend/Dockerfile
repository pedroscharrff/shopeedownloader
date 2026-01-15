FROM node:20-alpine

WORKDIR /usr/src/app

# Instalar dependências do sistema necessárias para compilar módulos nativos (bcrypt, prisma)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl \
    libc6-compat

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências com configurações otimizadas
RUN npm ci --only=production=false --no-audit --no-fund

# Gerar o cliente Prisma antes do build
RUN npx prisma generate

# Copiar código fonte
COPY . .

# Buildar a aplicação TypeScript
RUN npm run build

# Remover devDependencies para reduzir tamanho da imagem
RUN npm prune --production

EXPOSE 3001

# Executar migrations e iniciar aplicação
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

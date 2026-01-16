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

# Instalar todas as dependências (incluindo devDependencies para o build)
RUN npm ci --no-audit --no-fund

# Gerar o cliente Prisma antes do build
RUN npx prisma generate

# Copiar código fonte
COPY . .

# Buildar a aplicação TypeScript com logs detalhados
RUN npm run build || (echo "Build failed. Checking TypeScript errors:" && npx tsc --noEmit && exit 1)

# Remover devDependencies para reduzir tamanho da imagem
RUN npm prune --production

EXPOSE 3001

# Executar migrations e iniciar aplicação
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

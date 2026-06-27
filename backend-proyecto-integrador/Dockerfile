# ── Stage 1: Builder ──────────────────────────────────────────────────────────
# Instala todas las dependencias (incluidas dev), genera el cliente Prisma
# y compila TypeScript a dist/.
FROM node:22-bookworm-slim AS builder

# openssl es necesario para que prisma generate detecte la versión correcta
# de la librería y genere el binario adecuado (debian-openssl-3.0.x).
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
# Imagen final: solo dependencias de producción + dist/ + cliente Prisma generado.
# Corre como usuario no-root (node viene incluido en las imágenes oficiales de Node).
FROM node:22-bookworm-slim AS runtime

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# El cliente generado por prisma generate vive en node_modules/.prisma/client.
# npm ci --omit=dev instala el stub @prisma/client pero no genera el cliente;
# hay que copiarlo del builder.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]

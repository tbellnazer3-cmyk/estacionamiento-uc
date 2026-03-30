# ─── Etapa base ──────────────────────────────────────────────────────────────
FROM node:20-alpine

# better-sqlite3 necesita herramientas de compilación
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Instalar dependencias primero (capa cacheada)
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar código fuente
COPY src/ ./src/

# Directorio para la base de datos (montar como volumen en producción)
RUN mkdir -p /data
ENV DB_URL=/data/database.sqlite

EXPOSE 3000

CMD ["node", "src/server.js"]

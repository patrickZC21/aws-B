# Multi-stage Dockerfile para Brayamsac Backend
# Optimizado para producción en AWS con seguridad y performance

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Instalar dependencias del sistema necesarias para compilación
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Crear usuario no-root para build
RUN addgroup -g 1001 -S nodejs && \
    adduser -S brayamsac -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para build)
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY . .

# Cambiar ownership de archivos
RUN chown -R brayamsac:nodejs /app

# Stage 2: Production stage
FROM node:18-alpine AS production

# Instalar dependencias de runtime y herramientas de seguridad
RUN apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    tzdata && \
    # Configurar timezone
    cp /usr/share/zoneinfo/America/Lima /etc/localtime && \
    echo "America/Lima" > /etc/timezone

# Crear usuario no-root para producción
RUN addgroup -g 1001 -S nodejs && \
    adduser -S brayamsac -u 1001 -G nodejs

# Crear directorios necesarios
RUN mkdir -p /app/logs /app/uploads /app/temp && \
    chown -R brayamsac:nodejs /app

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos desde build stage
COPY --from=builder --chown=brayamsac:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=brayamsac:nodejs /app/package*.json ./
COPY --from=builder --chown=brayamsac:nodejs /app/src ./src
COPY --from=builder --chown=brayamsac:nodejs /app/scripts ./scripts
COPY --from=builder --chown=brayamsac:nodejs /app/ecosystem.config.js ./

# Copiar archivos de configuración
COPY --chown=brayamsac:nodejs .env.example ./
COPY --chown=brayamsac:nodejs .env.production.example ./

# Establecer permisos correctos
RUN chmod -R 755 /app && \
    chmod -R 777 /app/logs /app/uploads /app/temp && \
    chmod +x /app/scripts/*.js

# Cambiar a usuario no-root
USER brayamsac

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_LEVEL=info
ENV MYSQL_CONNECTION_LIMIT=10

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:$PORT/health/simple || exit 1

# Exponer puerto
EXPOSE $PORT

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Comando por defecto
CMD ["node", "src/index.js"]

# Metadata
LABEL maintainer="Brayamsac Team"
LABEL version="1.0.0"
LABEL description="Brayamsac Backend API - Sistema de Asistencias"
LABEL org.opencontainers.image.source="https://github.com/your-org/brayamsac-backend"
LABEL org.opencontainers.image.documentation="https://github.com/your-org/brayamsac-backend/blob/main/README.md"
LABEL org.opencontainers.image.licenses="MIT"
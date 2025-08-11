#!/bin/bash

# Script de deployment para AWS EC2
# Automatiza el proceso de despliegue del backend en AWS

set -e  # Exit on any error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    log_error "package.json no encontrado. Ejecuta este script desde el directorio raíz del proyecto."
    exit 1
fi

log "🚀 Iniciando deployment en AWS EC2..."

# 1. Verificar variables de entorno críticas
log "📋 Verificando variables de entorno..."
required_vars=("DB_HOST" "DB_USER" "DB_PASSWORD" "DB_NAME" "JWT_SECRET" "FRONTEND_URL")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        log_error "Variable de entorno $var no está definida"
        exit 1
    fi
done
log_success "Variables de entorno verificadas"

# 2. Actualizar el sistema
log "🔄 Actualizando sistema..."
sudo yum update -y

# 3. Instalar Node.js y npm si no están instalados
if ! command -v node &> /dev/null; then
    log "📦 Instalando Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
fi

# 4. Instalar PM2 globalmente si no está instalado
if ! command -v pm2 &> /dev/null; then
    log "📦 Instalando PM2..."
    sudo npm install -g pm2
fi

# 5. Crear directorio de logs si no existe
log "📁 Creando directorios necesarios..."
mkdir -p logs
mkdir -p uploads
sudo chown -R $USER:$USER logs uploads

# 6. Instalar dependencias
log "📦 Instalando dependencias..."
npm ci --only=production

# 7. Ejecutar migraciones de base de datos (si existen)
if [ -f "scripts/migrate.js" ]; then
    log "🗄️ Ejecutando migraciones de base de datos..."
    node scripts/migrate.js
fi

# 8. Verificar conexión a la base de datos
log "🔍 Verificando conexión a la base de datos..."
if [ -f "scripts/test-aws-rds-connection.js" ]; then
    node scripts/test-aws-rds-connection.js
    if [ $? -ne 0 ]; then
        log_error "No se pudo conectar a la base de datos"
        exit 1
    fi
    log_success "Conexión a la base de datos exitosa"
else
    log_warning "Script de prueba de conexión no encontrado"
fi

# 9. Configurar PM2 para inicio automático
log "⚙️ Configurando PM2..."
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# 10. Detener procesos PM2 existentes (si los hay)
log "🛑 Deteniendo procesos existentes..."
pm2 delete all 2>/dev/null || true

# 11. Iniciar la aplicación con PM2
log "🚀 Iniciando aplicación con PM2..."
pm2 start ecosystem.config.js --env production

# 12. Guardar configuración de PM2
pm2 save

# 13. Verificar que la aplicación esté corriendo
log "🔍 Verificando estado de la aplicación..."
sleep 5
pm2 status

# 14. Verificar health check
log "🏥 Verificando health check..."
max_attempts=10
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f http://localhost:${PORT:-80}/health/simple > /dev/null 2>&1; then
        log_success "Health check exitoso"
        break
    else
        log_warning "Health check falló (intento $attempt/$max_attempts)"
        if [ $attempt -eq $max_attempts ]; then
            log_error "Health check falló después de $max_attempts intentos"
            pm2 logs --lines 50
            exit 1
        fi
        sleep 10
        ((attempt++))
    fi
done

# 15. Configurar logrotate para los logs de PM2
log "📝 Configurando rotación de logs..."
sudo tee /etc/logrotate.d/pm2 > /dev/null <<EOF
$HOME/.pm2/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 0644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# 16. Configurar firewall (si está habilitado)
if systemctl is-active --quiet firewalld; then
    log "🔥 Configurando firewall..."
    sudo firewall-cmd --permanent --add-port=80/tcp
    sudo firewall-cmd --permanent --add-port=443/tcp
    sudo firewall-cmd --reload
fi

# 17. Mostrar información final
log_success "🎉 Deployment completado exitosamente!"
echo ""
echo "📊 Información del deployment:"
echo "   • Aplicación: $(pm2 list | grep brayamsac-backend | wc -l) instancia(s) corriendo"
echo "   • Puerto: ${PORT:-80}"
echo "   • Entorno: production"
echo "   • Base de datos: $DB_HOST"
echo "   • Health check: http://localhost:${PORT:-80}/health"
echo ""
echo "🔧 Comandos útiles:"
echo "   • Ver logs: pm2 logs"
echo "   • Reiniciar: pm2 restart brayamsac-backend"
echo "   • Estado: pm2 status"
echo "   • Monitoreo: pm2 monit"
echo ""
log_success "Deployment finalizado. La aplicación está lista para recibir tráfico."
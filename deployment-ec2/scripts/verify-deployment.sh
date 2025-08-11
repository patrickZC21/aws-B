#!/bin/bash

# Script de verificación post-despliegue
# Verifica que todos los servicios estén funcionando correctamente

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✅ SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[⚠️  WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[❌ ERROR]${NC} $1"
}

log_info() {
    echo -e "${BLUE}[ℹ️  INFO]${NC} $1"
}

# Función para verificar servicios
check_service() {
    local service=$1
    local name=$2
    
    if systemctl is-active --quiet $service; then
        log_success "$name está corriendo"
        return 0
    else
        log_error "$name NO está corriendo"
        return 1
    fi
}

# Función para verificar puertos
check_port() {
    local port=$1
    local name=$2
    
    if netstat -tuln | grep -q ":$port "; then
        log_success "Puerto $port ($name) está abierto"
        return 0
    else
        log_error "Puerto $port ($name) NO está abierto"
        return 1
    fi
}

# Función para verificar URLs
check_url() {
    local url=$1
    local name=$2
    local expected_code=${3:-200}
    
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$response_code" = "$expected_code" ]; then
        log_success "$name responde correctamente (HTTP $response_code)"
        return 0
    else
        log_error "$name NO responde correctamente (HTTP $response_code, esperado $expected_code)"
        return 1
    fi
}

echo "="*60
log "🔍 INICIANDO VERIFICACIÓN DE DESPLIEGUE"
echo "="*60
echo ""

# Contadores
PASSED=0
FAILED=0
WARNINGS=0

# 1. Verificar servicios del sistema
log "📋 1. VERIFICANDO SERVICIOS DEL SISTEMA"
echo "-------------------------------------------"

if check_service "nginx" "Nginx"; then
    ((PASSED++))
else
    ((FAILED++))
fi

echo ""

# 2. Verificar PM2
log "📋 2. VERIFICANDO PM2 Y APLICACIÓN"
echo "-------------------------------------------"

if pm2 list | grep -q "brayamsac-backend.*online"; then
    log_success "PM2 - Aplicación brayamsac-backend está online"
    ((PASSED++))
else
    log_error "PM2 - Aplicación brayamsac-backend NO está online"
    ((FAILED++))
fi

# Mostrar estado detallado de PM2
log_info "Estado detallado de PM2:"
pm2 list
echo ""

# 3. Verificar puertos
log "📋 3. VERIFICANDO PUERTOS"
echo "-------------------------------------------"

if check_port "80" "HTTP"; then
    ((PASSED++))
else
    ((FAILED++))
fi

if check_port "443" "HTTPS"; then
    ((PASSED++))
else
    ((FAILED++))
fi

if check_port "10000" "Backend"; then
    ((PASSED++))
else
    ((FAILED++))
fi

echo ""

# 4. Verificar conectividad de base de datos
log "📋 4. VERIFICANDO BASE DE DATOS"
echo "-------------------------------------------"

if [ -f ".env.production" ]; then
    source .env.production
    
    # Verificar variables de entorno críticas
    if [ -n "$DB_HOST" ] && [ -n "$DB_USER" ] && [ -n "$DB_NAME" ]; then
        log_success "Variables de entorno de DB configuradas"
        ((PASSED++))
        
        # Intentar conexión a la base de datos
        if command -v mysql &> /dev/null; then
            if mysql -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME; SELECT 1;" &>/dev/null; then
                log_success "Conexión a la base de datos exitosa"
                ((PASSED++))
            else
                log_error "No se puede conectar a la base de datos"
                ((FAILED++))
            fi
        else
            log_warning "Cliente MySQL no instalado, no se puede verificar conexión DB"
            ((WARNINGS++))
        fi
    else
        log_error "Variables de entorno de DB no configuradas correctamente"
        ((FAILED++))
    fi
else
    log_error "Archivo .env.production no encontrado"
    ((FAILED++))
fi

echo ""

# 5. Verificar endpoints de la aplicación
log "📋 5. VERIFICANDO ENDPOINTS DE LA APLICACIÓN"
echo "-------------------------------------------"

# Health check local
if check_url "http://localhost:10000/health" "Health Check Local"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Health check a través de Nginx (HTTP)
if check_url "http://localhost/health" "Health Check HTTP"; then
    ((PASSED++))
else
    ((FAILED++))
fi

# Health check a través de Nginx (HTTPS) - solo si SSL está configurado
if [ -d "/etc/letsencrypt/live" ] && [ "$(ls -A /etc/letsencrypt/live 2>/dev/null)" ]; then
    if check_url "https://localhost/health" "Health Check HTTPS" "200"; then
        ((PASSED++))
    else
        log_warning "HTTPS health check falló - verifica certificado SSL"
        ((WARNINGS++))
    fi
else
    log_warning "Certificados SSL no encontrados - HTTPS no configurado"
    ((WARNINGS++))
fi

echo ""

# 6. Verificar logs
log "📋 6. VERIFICANDO LOGS"
echo "-------------------------------------------"

if [ -d "logs" ] && [ "$(ls -A logs 2>/dev/null)" ]; then
    log_success "Directorio de logs existe y contiene archivos"
    ((PASSED++))
    
    # Mostrar últimas líneas de logs
    log_info "Últimas 5 líneas del log de errores:"
    tail -n 5 logs/error.log 2>/dev/null || log_warning "No hay logs de error"
else
    log_warning "Directorio de logs vacío o no existe"
    ((WARNINGS++))
fi

# Verificar logs de Nginx
if [ -f "/var/log/nginx/error.log" ]; then
    local nginx_errors=$(tail -n 10 /var/log/nginx/error.log | grep -c "error" || echo "0")
    if [ "$nginx_errors" -eq 0 ]; then
        log_success "No hay errores recientes en Nginx"
        ((PASSED++))
    else
        log_warning "Se encontraron $nginx_errors errores recientes en Nginx"
        ((WARNINGS++))
    fi
else
    log_warning "Log de errores de Nginx no encontrado"
    ((WARNINGS++))
fi

echo ""

# 7. Verificar recursos del sistema
log "📋 7. VERIFICANDO RECURSOS DEL SISTEMA"
echo "-------------------------------------------"

# Verificar uso de memoria
MEM_USAGE=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
if (( $(echo "$MEM_USAGE < 80" | bc -l) )); then
    log_success "Uso de memoria: ${MEM_USAGE}% (OK)"
    ((PASSED++))
else
    log_warning "Uso de memoria alto: ${MEM_USAGE}%"
    ((WARNINGS++))
fi

# Verificar uso de disco
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    log_success "Uso de disco: ${DISK_USAGE}% (OK)"
    ((PASSED++))
else
    log_warning "Uso de disco alto: ${DISK_USAGE}%"
    ((WARNINGS++))
fi

# Verificar carga del sistema
LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
log_info "Carga promedio del sistema: $LOAD_AVG"

echo ""
echo "="*60
log "📊 RESUMEN DE VERIFICACIÓN"
echo "="*60

echo -e "${GREEN}✅ Verificaciones exitosas: $PASSED${NC}"
echo -e "${YELLOW}⚠️  Advertencias: $WARNINGS${NC}"
echo -e "${RED}❌ Verificaciones fallidas: $FAILED${NC}"

echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        log_success "🎉 ¡DESPLIEGUE COMPLETAMENTE EXITOSO!"
        echo "   Todos los servicios están funcionando correctamente."
    else
        log_warning "✅ Despliegue exitoso con advertencias menores"
        echo "   La aplicación está funcionando, pero revisa las advertencias."
    fi
    exit 0
else
    log_error "❌ DESPLIEGUE CON PROBLEMAS"
    echo "   Se encontraron $FAILED problemas críticos que necesitan atención."
    echo ""
    echo "🔧 Comandos útiles para diagnóstico:"
    echo "   • Ver logs de PM2: pm2 logs"
    echo "   • Ver estado de PM2: pm2 status"
    echo "   • Ver logs de Nginx: sudo tail -f /var/log/nginx/error.log"
    echo "   • Reiniciar servicios: sudo systemctl restart nginx && pm2 restart all"
    exit 1
fi
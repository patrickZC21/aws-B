#!/bin/bash

# Script para configurar SSL automáticamente en EC2
# Uso: ./setup-ssl.sh tu-dominio.com

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
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que se proporcione el dominio
if [ -z "$1" ]; then
    log_error "Uso: $0 <dominio>"
    log_error "Ejemplo: $0 api.brayamsac.com"
    exit 1
fi

DOMAIN=$1

log "🔒 Configurando SSL para el dominio: $DOMAIN"

# 1. Instalar Certbot si no está instalado
if ! command -v certbot &> /dev/null; then
    log "📦 Instalando Certbot..."
    sudo yum install -y certbot python3-certbot-nginx
else
    log_success "Certbot ya está instalado"
fi

# 2. Verificar que Nginx esté instalado y corriendo
if ! systemctl is-active --quiet nginx; then
    log_error "Nginx no está corriendo. Por favor, instala y configura Nginx primero."
    exit 1
fi

# 3. Crear configuración temporal de Nginx para el dominio
log "⚙️ Creando configuración temporal de Nginx..."
sudo tee /etc/nginx/conf.d/temp-${DOMAIN}.conf > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN};
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}
EOF

# 4. Crear directorio para el challenge
sudo mkdir -p /var/www/html
sudo chown -R nginx:nginx /var/www/html

# 5. Probar configuración de Nginx
log "🔍 Verificando configuración de Nginx..."
sudo nginx -t
if [ $? -ne 0 ]; then
    log_error "Error en la configuración de Nginx"
    exit 1
fi

# 6. Recargar Nginx
sudo systemctl reload nginx

# 7. Obtener certificado SSL
log "🔐 Obteniendo certificado SSL de Let's Encrypt..."
sudo certbot certonly --webroot -w /var/www/html -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

if [ $? -ne 0 ]; then
    log_error "Error al obtener el certificado SSL"
    exit 1
fi

# 8. Eliminar configuración temporal
sudo rm /etc/nginx/conf.d/temp-${DOMAIN}.conf

# 9. Actualizar la configuración principal de Nginx con el dominio correcto
log "📝 Actualizando configuración de Nginx con SSL..."
sudo sed -i "s/server_name _;/server_name $DOMAIN;/g" /etc/nginx/conf.d/brayamsac-backend.conf
sudo sed -i "s|ssl_certificate /etc/letsencrypt/live/your-domain/fullchain.pem;|ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;|g" /etc/nginx/conf.d/brayamsac-backend.conf
sudo sed -i "s|ssl_certificate_key /etc/letsencrypt/live/your-domain/privkey.pem;|ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;|g" /etc/nginx/conf.d/brayamsac-backend.conf

# 10. Verificar configuración final
log "🔍 Verificando configuración final de Nginx..."
sudo nginx -t
if [ $? -ne 0 ]; then
    log_error "Error en la configuración final de Nginx"
    exit 1
fi

# 11. Recargar Nginx
sudo systemctl reload nginx

# 12. Configurar renovación automática
log "🔄 Configurando renovación automática..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --nginx") | crontab -

# 13. Verificar que el certificado funcione
log "🧪 Verificando certificado SSL..."
sleep 5
if curl -s -I https://$DOMAIN/health | grep -q "HTTP/2 200\|HTTP/1.1 200"; then
    log_success "✅ SSL configurado correctamente para $DOMAIN"
else
    log_warning "⚠️ SSL configurado, pero el health check no responde. Verifica la aplicación."
fi

# 14. Mostrar información del certificado
log "📋 Información del certificado:"
sudo certbot certificates -d $DOMAIN

log_success "🎉 Configuración SSL completada!"
echo ""
echo "📊 Información importante:"
echo "   • Dominio: $DOMAIN"
echo "   • Certificado: /etc/letsencrypt/live/$DOMAIN/"
echo "   • Renovación automática: Configurada (diaria a las 12:00)"
echo "   • URL de prueba: https://$DOMAIN/health"
echo ""
echo "🔧 Comandos útiles:"
echo "   • Verificar certificado: sudo certbot certificates"
echo "   • Renovar manualmente: sudo certbot renew"
echo "   • Ver logs de Nginx: sudo tail -f /var/log/nginx/error.log"
echo "   • Reiniciar Nginx: sudo systemctl restart nginx"
echo ""
log_success "¡Listo! Tu API ahora está disponible en https://$DOMAIN"
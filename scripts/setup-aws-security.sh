#!/bin/bash

# Script de configuración de seguridad para AWS EC2
# Configura firewall, usuarios, permisos y hardening básico

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

log "🔒 Iniciando configuración de seguridad para AWS EC2..."

# Verificar que se ejecuta como root o con sudo
if [[ $EUID -ne 0 ]]; then
   log_error "Este script debe ejecutarse como root o con sudo"
   exit 1
fi

# 1. Actualizar el sistema
log "🔄 Actualizando sistema..."
yum update -y

# 2. Instalar herramientas de seguridad
log "📦 Instalando herramientas de seguridad..."
yum install -y fail2ban firewalld logwatch aide rkhunter chkrootkit

# 3. Configurar firewall
log "🔥 Configurando firewall..."
systemctl enable firewalld
systemctl start firewalld

# Configurar zonas y puertos
firewall-cmd --set-default-zone=public
firewall-cmd --permanent --add-port=22/tcp    # SSH
firewall-cmd --permanent --add-port=80/tcp    # HTTP
firewall-cmd --permanent --add-port=443/tcp   # HTTPS
firewall-cmd --permanent --add-port=3000/tcp  # Node.js (solo para debugging, remover en producción)

# Configurar rate limiting para SSH
firewall-cmd --permanent --add-rich-rule="rule service name='ssh' accept limit value='3/m'"

# Bloquear pings (opcional)
# firewall-cmd --permanent --add-icmp-block=echo-request

firewall-cmd --reload
log_success "Firewall configurado"

# 4. Configurar Fail2Ban
log "🛡️ Configurando Fail2Ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
port = ssh
logpath = /var/log/secure
maxretry = 3
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
bantime = 600

[nginx-botsearch]
enabled = true
filter = nginx-botsearch
logpath = /var/log/nginx/access.log
maxretry = 2
bantime = 86400
EOF

systemctl enable fail2ban
systemctl start fail2ban
log_success "Fail2Ban configurado"

# 5. Configurar SSH hardening
log "🔐 Configurando SSH hardening..."
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Configuraciones de seguridad SSH
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sed -i 's/#AuthorizedKeysFile/AuthorizedKeysFile/' /etc/ssh/sshd_config
sed -i 's/#MaxAuthTries 6/MaxAuthTries 3/' /etc/ssh/sshd_config
sed -i 's/#ClientAliveInterval 0/ClientAliveInterval 300/' /etc/ssh/sshd_config
sed -i 's/#ClientAliveCountMax 3/ClientAliveCountMax 2/' /etc/ssh/sshd_config
sed -i 's/#Protocol 2/Protocol 2/' /etc/ssh/sshd_config

# Agregar configuraciones adicionales
echo "" >> /etc/ssh/sshd_config
echo "# Additional security configurations" >> /etc/ssh/sshd_config
echo "AllowUsers ec2-user" >> /etc/ssh/sshd_config
echo "DenyUsers root" >> /etc/ssh/sshd_config
echo "MaxStartups 2" >> /etc/ssh/sshd_config
echo "Banner /etc/ssh/banner" >> /etc/ssh/sshd_config

# Crear banner de SSH
cat > /etc/ssh/banner << EOF
***************************************************************************
                    AUTHORIZED ACCESS ONLY
                    
This system is for authorized users only. All activities are monitored
and logged. Unauthorized access is strictly prohibited and will be
prosecuted to the full extent of the law.
***************************************************************************
EOF

systemctl restart sshd
log_success "SSH hardening configurado"

# 6. Configurar usuario para la aplicación
log "👤 Configurando usuario de aplicación..."
if ! id "brayamsac" &>/dev/null; then
    useradd -r -s /bin/false -d /opt/brayamsac brayamsac
    log_success "Usuario brayamsac creado"
else
    log_warning "Usuario brayamsac ya existe"
fi

# 7. Configurar permisos de directorios
log "📁 Configurando permisos de directorios..."
mkdir -p /opt/brayamsac/{app,logs,uploads,backups}
chown -R brayamsac:brayamsac /opt/brayamsac
chmod 750 /opt/brayamsac
chmod 755 /opt/brayamsac/uploads
chmod 700 /opt/brayamsac/logs
chmod 700 /opt/brayamsac/backups

# 8. Configurar logrotate para logs de aplicación
log "📝 Configurando rotación de logs..."
cat > /etc/logrotate.d/brayamsac << EOF
/opt/brayamsac/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 brayamsac brayamsac
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
        pm2 reloadLogs > /dev/null 2>&1 || true
    endscript
}
EOF

# 9. Configurar límites del sistema
log "⚙️ Configurando límites del sistema..."
cat > /etc/security/limits.d/brayamsac.conf << EOF
brayamsac soft nofile 65536
brayamsac hard nofile 65536
brayamsac soft nproc 4096
brayamsac hard nproc 4096
EOF

# 10. Configurar kernel parameters para seguridad
log "🔧 Configurando parámetros del kernel..."
cat > /etc/sysctl.d/99-brayamsac-security.conf << EOF
# Network security
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.tcp_synack_retries = 2
net.ipv4.tcp_syn_retries = 5

# Memory protection
kernel.exec-shield = 1
kernel.randomize_va_space = 2

# Process restrictions
kernel.dmesg_restrict = 1
kernel.kptr_restrict = 2

# File system security
fs.suid_dumpable = 0
fs.protected_hardlinks = 1
fs.protected_symlinks = 1
EOF

sysctl -p /etc/sysctl.d/99-brayamsac-security.conf

# 11. Configurar auditd para logging de seguridad
log "📊 Configurando auditd..."
yum install -y audit
systemctl enable auditd
systemctl start auditd

# Agregar reglas de auditoría
cat >> /etc/audit/rules.d/audit.rules << EOF
# Monitor authentication
-w /etc/passwd -p wa -k identity
-w /etc/group -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/sudoers -p wa -k identity

# Monitor system calls
-a always,exit -F arch=b64 -S adjtimex -S settimeofday -k time-change
-a always,exit -F arch=b32 -S adjtimex -S settimeofday -S stime -k time-change

# Monitor network configuration
-a always,exit -F arch=b64 -S sethostname -S setdomainname -k system-locale
-a always,exit -F arch=b32 -S sethostname -S setdomainname -k system-locale

# Monitor login/logout
-w /var/log/lastlog -p wa -k logins
-w /var/run/faillock -p wa -k logins

# Monitor application files
-w /opt/brayamsac -p wa -k brayamsac-app
EOF

service auditd restart

# 12. Configurar monitoreo de integridad con AIDE
log "🔍 Configurando AIDE..."
aide --init
mv /var/lib/aide/aide.db.new.gz /var/lib/aide/aide.db.gz

# Crear cron job para AIDE
echo "0 2 * * * root /usr/sbin/aide --check | mail -s 'AIDE Report' root@localhost" >> /etc/crontab

# 13. Configurar automatic security updates
log "🔄 Configurando actualizaciones automáticas de seguridad..."
yum install -y yum-cron
sed -i 's/update_cmd = default/update_cmd = security/' /etc/yum/yum-cron.conf
sed -i 's/apply_updates = no/apply_updates = yes/' /etc/yum/yum-cron.conf
systemctl enable yum-cron
systemctl start yum-cron

# 14. Configurar backup automático de configuraciones
log "💾 Configurando backup de configuraciones..."
mkdir -p /opt/brayamsac/backups/configs
cat > /opt/brayamsac/backups/backup-configs.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/brayamsac/backups/configs"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio de backup con fecha
mkdir -p "$BACKUP_DIR/$DATE"

# Backup de configuraciones importantes
cp -r /etc/nginx "$BACKUP_DIR/$DATE/"
cp -r /etc/ssh "$BACKUP_DIR/$DATE/"
cp /etc/fail2ban/jail.local "$BACKUP_DIR/$DATE/"
cp /etc/sysctl.d/99-brayamsac-security.conf "$BACKUP_DIR/$DATE/"

# Comprimir backup
tar -czf "$BACKUP_DIR/config_backup_$DATE.tar.gz" -C "$BACKUP_DIR" "$DATE"
rm -rf "$BACKUP_DIR/$DATE"

# Mantener solo los últimos 7 backups
find "$BACKUP_DIR" -name "config_backup_*.tar.gz" -mtime +7 -delete
EOF

chmod +x /opt/brayamsac/backups/backup-configs.sh
echo "0 3 * * * root /opt/brayamsac/backups/backup-configs.sh" >> /etc/crontab

# 15. Configurar CloudWatch agent (opcional)
if command -v aws &> /dev/null; then
    log "☁️ Configurando CloudWatch agent..."
    wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
    rpm -U ./amazon-cloudwatch-agent.rpm
    rm -f ./amazon-cloudwatch-agent.rpm
    
    # Crear configuración básica de CloudWatch
    cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << EOF
{
    "metrics": {
        "namespace": "Brayamsac/EC2",
        "metrics_collected": {
            "cpu": {
                "measurement": [
                    "cpu_usage_idle",
                    "cpu_usage_iowait",
                    "cpu_usage_user",
                    "cpu_usage_system"
                ],
                "metrics_collection_interval": 60
            },
            "disk": {
                "measurement": [
                    "used_percent"
                ],
                "metrics_collection_interval": 60,
                "resources": [
                    "*"
                ]
            },
            "mem": {
                "measurement": [
                    "mem_used_percent"
                ],
                "metrics_collection_interval": 60
            }
        }
    },
    "logs": {
        "logs_collected": {
            "files": {
                "collect_list": [
                    {
                        "file_path": "/var/log/nginx/access.log",
                        "log_group_name": "brayamsac-nginx-access",
                        "log_stream_name": "{instance_id}"
                    },
                    {
                        "file_path": "/var/log/nginx/error.log",
                        "log_group_name": "brayamsac-nginx-error",
                        "log_stream_name": "{instance_id}"
                    },
                    {
                        "file_path": "/opt/brayamsac/logs/*.log",
                        "log_group_name": "brayamsac-app",
                        "log_stream_name": "{instance_id}"
                    }
                ]
            }
        }
    }
}
EOF
    
    log_success "CloudWatch agent configurado (requiere configuración de IAM)"
else
    log_warning "AWS CLI no encontrado, saltando configuración de CloudWatch"
fi

# 16. Crear script de verificación de seguridad
log "✅ Creando script de verificación de seguridad..."
cat > /opt/brayamsac/scripts/security-check.sh << 'EOF'
#!/bin/bash

echo "=== VERIFICACIÓN DE SEGURIDAD BRAYAMSAC ==="
echo "Fecha: $(date)"
echo ""

echo "1. Estado del Firewall:"
systemctl is-active firewalld
firewall-cmd --list-all
echo ""

echo "2. Estado de Fail2Ban:"
systemctl is-active fail2ban
fail2ban-client status
echo ""

echo "3. Conexiones de red activas:"
ss -tuln
echo ""

echo "4. Procesos de la aplicación:"
ps aux | grep -E "(node|pm2|nginx)" | grep -v grep
echo ""

echo "5. Uso de recursos:"
free -h
df -h
echo ""

echo "6. Últimos logins:"
lastlog | head -10
echo ""

echo "7. Intentos de login fallidos:"
journalctl -u sshd --since "1 hour ago" | grep "Failed password" | tail -5
echo ""

echo "8. Estado de servicios críticos:"
for service in sshd nginx fail2ban firewalld; do
    echo "$service: $(systemctl is-active $service)"
done
EOF

chmod +x /opt/brayamsac/scripts/security-check.sh

# 17. Configurar notificaciones por email (opcional)
log "📧 Configurando notificaciones básicas..."
yum install -y mailx

# Crear script de alerta
cat > /opt/brayamsac/scripts/security-alert.sh << 'EOF'
#!/bin/bash

SUBJECT="[BRAYAMSAC] Alerta de Seguridad - $(hostname)"
TO="admin@yourdomain.com"  # Cambiar por email real
BODY="Se ha detectado una actividad sospechosa en el servidor $(hostname) a las $(date).

Detalles:
$1

Por favor, revise los logs del sistema."

echo "$BODY" | mail -s "$SUBJECT" "$TO"
EOF

chmod +x /opt/brayamsac/scripts/security-alert.sh

# 18. Reiniciar servicios necesarios
log "🔄 Reiniciando servicios..."
systemctl restart firewalld
systemctl restart fail2ban
systemctl restart sshd

# 19. Mostrar resumen final
log_success "🎉 Configuración de seguridad completada!"
echo ""
echo "📋 RESUMEN DE CONFIGURACIÓN:"
echo "   ✅ Firewall configurado y activo"
echo "   ✅ Fail2Ban configurado para SSH y Nginx"
echo "   ✅ SSH hardening aplicado"
echo "   ✅ Usuario de aplicación creado (brayamsac)"
echo "   ✅ Permisos de directorios configurados"
echo "   ✅ Parámetros de kernel optimizados"
echo "   ✅ Auditoría del sistema configurada"
echo "   ✅ AIDE configurado para integridad"
echo "   ✅ Actualizaciones automáticas habilitadas"
echo "   ✅ Backup automático de configuraciones"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "   • Verificar seguridad: /opt/brayamsac/scripts/security-check.sh"
echo "   • Estado del firewall: firewall-cmd --list-all"
echo "   • Estado de Fail2Ban: fail2ban-client status"
echo "   • Logs de SSH: journalctl -u sshd -f"
echo "   • Verificar integridad: aide --check"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   • Cambie las contraseñas por defecto"
echo "   • Configure las claves SSH"
echo "   • Actualice el email de notificaciones"
echo "   • Revise los logs regularmente"
echo "   • Configure CloudWatch si usa AWS"
echo ""
log_success "Configuración de seguridad finalizada."
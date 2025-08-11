# 🚀 Guía Completa de Deployment AWS - Brayamsac Backend

## 📋 Resumen de Archivos Creados/Modificados

### ✅ Archivos Modificados
1. **`package.json`** - Scripts optimizados para AWS Linux
2. **`src/index.js`** - Rutas de health check registradas

### ✅ Archivos Creados

#### 🔧 Configuración y Scripts
- **`ecosystem.config.js`** - Configuración PM2 para producción
- **`scripts/deploy-aws.sh`** - Script automatizado de deployment
- **`scripts/setup-aws-security.sh`** - Configuración de seguridad EC2
- **`scripts/test-pre-deployment.js`** - Testing completo pre-deployment

#### 🏥 Health Checks y Monitoreo
- **`src/routes/health.js`** - Endpoints de health check para ALB

#### 🌐 Nginx y Proxy
- **`nginx/brayamsac-backend.conf`** - Configuración Nginx con SSL y seguridad

#### 🐳 Containerización
- **`Dockerfile`** - Multi-stage build optimizado
- **`docker-compose.yml`** - Entorno completo de desarrollo
- **`.dockerignore`** - Optimización de build context

#### 📚 Documentación
- **`DEPLOYMENT_AWS_COMPLETO.md`** - Esta guía completa

---

## 🎯 Checklist Pre-Deployment

### 1. ✅ Configuración Básica Completada
- [x] Scripts de `package.json` corregidos para Linux
- [x] Health checks implementados (`/health`, `/health/simple`, `/health/ready`, `/health/live`)
- [x] Configuración PM2 para cluster mode
- [x] Configuración AWS RDS completada
- [x] Variables de entorno documentadas

### 2. 🔒 Seguridad Implementada
- [x] Script de hardening de seguridad
- [x] Configuración Nginx con SSL
- [x] Rate limiting configurado
- [x] CORS dinámico implementado
- [x] Headers de seguridad configurados
- [x] Fail2Ban y firewall configurados

### 3. 📊 Monitoreo y Logs
- [x] Health checks para AWS Load Balancer
- [x] Configuración de logs estructurados
- [x] Rotación de logs configurada
- [x] Métricas básicas implementadas

### 4. 🐳 Containerización (Opcional)
- [x] Dockerfile multi-stage optimizado
- [x] Docker Compose para desarrollo
- [x] .dockerignore configurado

### 5. 🧪 Testing
- [x] Script de testing pre-deployment
- [x] Verificación de conexión RDS
- [x] Tests de endpoints críticos

---

## 🚀 Proceso de Deployment

### Paso 1: Preparación Local

```bash
# 1. Verificar que todos los archivos estén presentes
ls -la scripts/
ls -la nginx/
ls -la src/routes/health.js

# 2. Ejecutar tests pre-deployment
node scripts/test-pre-deployment.js

# 3. Verificar conexión RDS
node scripts/test-aws-rds-connection.js
```

### Paso 2: Configuración de EC2

```bash
# 1. Conectar a EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# 2. Clonar repositorio
git clone https://github.com/your-repo/brayamsac-backend.git
cd brayamsac-backend

# 3. Configurar variables de entorno
cp .env.production.example .env
# Editar .env con valores reales

# 4. Ejecutar configuración de seguridad
sudo chmod +x scripts/setup-aws-security.sh
sudo ./scripts/setup-aws-security.sh

# 5. Ejecutar deployment
chmod +x scripts/deploy-aws.sh
./scripts/deploy-aws.sh
```

### Paso 3: Configuración de Nginx (Opcional)

```bash
# 1. Instalar Nginx
sudo yum install -y nginx

# 2. Copiar configuración
sudo cp nginx/brayamsac-backend.conf /etc/nginx/conf.d/

# 3. Editar configuración con dominio real
sudo nano /etc/nginx/conf.d/brayamsac-backend.conf
# Cambiar 'your-domain.com' por dominio real

# 4. Configurar SSL (con Let's Encrypt)
sudo yum install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# 5. Iniciar Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### Paso 4: Verificación Post-Deployment

```bash
# 1. Verificar servicios
pm2 status
sudo systemctl status nginx
sudo systemctl status firewalld

# 2. Verificar health checks
curl http://localhost/health
curl http://localhost/health/simple

# 3. Verificar logs
pm2 logs
tail -f /var/log/nginx/brayamsac_access.log

# 4. Ejecutar script de verificación de seguridad
/opt/brayamsac/scripts/security-check.sh
```

---

## 🔧 Variables de Entorno Requeridas

### Producción (`.env`)
```bash
# Base de datos
DB_HOST=brayamsac-bd-asistencias.cd6ygkkwilu7.sa-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=?i#7x1883tU-TNczy!o!Ss
DB_NAME=brayamsac-bd-asistencias
DB_PORT=3306
DB_SSL=true

# Aplicación
NODE_ENV=production
PORT=80
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
FRONTEND_URL=https://your-frontend-domain.com

# AWS
AWS_REGION=sa-east-1

# Logs y Monitoreo
LOG_LEVEL=info
DISABLE_LOGIN_LOGS=true
MYSQL_CONNECTION_LIMIT=10
```

---

## 🏗️ Arquitectura AWS Recomendada

### Componentes Principales
1. **EC2 Instance** (t3.medium o superior)
   - Amazon Linux 2
   - Security Groups configurados
   - Auto Scaling Group (opcional)

2. **RDS MySQL** ✅ (Ya configurado)
   - Multi-AZ para alta disponibilidad
   - Backups automáticos
   - SSL habilitado

3. **Application Load Balancer**
   - Health checks en `/health/simple`
   - SSL termination
   - Target Groups

4. **Route 53** (DNS)
   - Dominio personalizado
   - Health checks

5. **CloudWatch**
   - Logs centralizados
   - Métricas de aplicación
   - Alertas

6. **S3** (opcional)
   - Almacenamiento de archivos
   - Backups

---

## 🔒 Configuración de Security Groups

### EC2 Security Group
```
Inbound Rules:
- SSH (22): Your IP only
- HTTP (80): ALB Security Group
- HTTPS (443): ALB Security Group
- Custom (3000): ALB Security Group (para debugging)

Outbound Rules:
- All traffic: 0.0.0.0/0
```

### ALB Security Group
```
Inbound Rules:
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0

Outbound Rules:
- HTTP (80): EC2 Security Group
- HTTPS (443): EC2 Security Group
- Custom (3000): EC2 Security Group
```

### RDS Security Group ✅ (Ya configurado)
```
Inbound Rules:
- MySQL (3306): EC2 Security Group

Outbound Rules:
- None required
```

---

## 📊 Monitoreo y Alertas

### CloudWatch Metrics
- CPU Utilization
- Memory Usage
- Disk Usage
- Network I/O
- Application Response Time
- Database Connections

### Health Checks Disponibles
- **`/health`** - Check completo con métricas
- **`/health/simple`** - Check básico para ALB
- **`/health/ready`** - Readiness probe
- **`/health/live`** - Liveness probe

### Logs Centralizados
- Application logs → CloudWatch
- Nginx access/error logs → CloudWatch
- System logs → CloudWatch

---

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Aplicación no inicia
```bash
# Verificar logs
pm2 logs
# Verificar variables de entorno
env | grep -E "(DB_|JWT_|NODE_)"
# Verificar conexión RDS
node scripts/test-aws-rds-connection.js
```

#### 2. Health checks fallan
```bash
# Verificar que la aplicación responda
curl http://localhost:3000/health/simple
# Verificar configuración de ALB
# Verificar Security Groups
```

#### 3. Base de datos no conecta
```bash
# Verificar Security Groups de RDS
# Verificar variables de entorno
# Verificar SSL configuration
# Probar conexión manual
mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME
```

#### 4. Nginx no funciona
```bash
# Verificar configuración
sudo nginx -t
# Verificar logs
sudo tail -f /var/log/nginx/error.log
# Verificar certificados SSL
sudo certbot certificates
```

---

## 📈 Optimizaciones Post-Deployment

### Performance
1. **Configurar CloudFront** para assets estáticos
2. **Implementar Redis** para caché de sesiones
3. **Optimizar queries** de base de datos
4. **Configurar connection pooling** avanzado

### Seguridad
1. **WAF (Web Application Firewall)** en ALB
2. **VPC** con subnets privadas
3. **Secrets Manager** para credenciales
4. **GuardDuty** para detección de amenazas

### Monitoreo Avanzado
1. **X-Ray** para tracing distribuido
2. **Custom metrics** en CloudWatch
3. **Dashboards** personalizados
4. **Alertas** proactivas

---

## 🎯 Próximos Pasos

### Inmediatos (Críticos)
1. ✅ Configurar variables de entorno en EC2
2. ✅ Ejecutar script de deployment
3. ✅ Configurar SSL con certificados
4. ✅ Verificar health checks
5. ✅ Configurar monitoreo básico

### Corto Plazo (1-2 semanas)
1. 🔄 Implementar CI/CD pipeline
2. 🔄 Configurar backups automáticos
3. 🔄 Implementar logging avanzado
4. 🔄 Configurar alertas
5. 🔄 Documentar procedimientos

### Mediano Plazo (1 mes)
1. 📊 Implementar métricas avanzadas
2. 🔒 Hardening de seguridad adicional
3. ⚡ Optimizaciones de performance
4. 🧪 Testing automatizado
5. 📚 Capacitación del equipo

---

## 📞 Soporte y Contacto

### Recursos Útiles
- **AWS Documentation**: https://docs.aws.amazon.com/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

### Scripts de Utilidad
```bash
# Verificación completa del sistema
/opt/brayamsac/scripts/security-check.sh

# Testing pre-deployment
node scripts/test-pre-deployment.js

# Verificación de conexión RDS
node scripts/test-aws-rds-connection.js

# Backup de configuraciones
/opt/brayamsac/backups/backup-configs.sh
```

---

## ✅ Estado Actual del Proyecto

### ✅ Completado
- [x] Configuración AWS RDS
- [x] Scripts de deployment automatizado
- [x] Health checks para ALB
- [x] Configuración de seguridad
- [x] Configuración PM2
- [x] Configuración Nginx
- [x] Testing pre-deployment
- [x] Documentación completa
- [x] Containerización (opcional)

### 🔄 Pendiente (Requiere Acción Manual)
- [ ] Configurar variables de entorno en EC2
- [ ] Ejecutar scripts de deployment
- [ ] Configurar dominio y SSL
- [ ] Configurar ALB y Target Groups
- [ ] Configurar CloudWatch
- [ ] Testing en producción

---

**🎉 El backend está LISTO para ser desplegado en AWS con todas las configuraciones de seguridad, monitoreo y optimización implementadas.**

**Próximo paso**: Ejecutar el deployment siguiendo los pasos de esta guía.
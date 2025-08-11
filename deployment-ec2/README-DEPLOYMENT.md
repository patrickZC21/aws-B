# Guía de Despliegue para AWS EC2

## Archivos Incluidos

Esta carpeta contiene todos los archivos necesarios para desplegar el backend de Brayamsac en AWS EC2:

### 📁 Estructura de Archivos

```
deployment-ec2/
├── nginx/
│   └── brayamsac-backend.conf    # Configuración de Nginx con HTTPS y puerto 10000
├── scripts/
│   └── deploy-aws.sh             # Script automatizado de despliegue
├── config/
│   └── ecosystem.config.js       # Configuración de PM2 actualizada
└── README-DEPLOYMENT.md          # Esta guía
```

## 🚀 Pasos de Despliegue en EC2

### 1. Preparar el Servidor EC2

```bash
# Conectarse al servidor EC2
ssh -i your-key.pem ec2-user@ec2-15-228-177-142.sa-east-1.compute.amazonaws.com

# Actualizar el sistema
sudo yum update -y

# Instalar Nginx
sudo yum install -y nginx

# Instalar Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2
```

### 2. Configurar Nginx

```bash
# Copiar la configuración de Nginx
sudo cp nginx/brayamsac-backend.conf /etc/nginx/conf.d/

# Instalar Certbot para SSL
sudo yum install -y certbot python3-certbot-nginx

# Obtener certificado SSL (reemplaza con tu dominio)
sudo certbot --nginx -d tu-dominio.com

# Verificar configuración de Nginx
sudo nginx -t

# Iniciar y habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 3. Desplegar el Backend

```bash
# Clonar el repositorio del backend
git clone https://github.com/tu-usuario/brayamsac-backend.git
cd brayamsac-backend

# Copiar la configuración de PM2 actualizada
cp ../deployment-ec2/config/ecosystem.config.js .

# Configurar variables de entorno
cp .env.production.example .env.production
# Editar .env.production con tus valores reales

# Ejecutar el script de despliegue
chmod +x ../deployment-ec2/scripts/deploy-aws.sh
../deployment-ec2/scripts/deploy-aws.sh
```

### 4. Verificar el Despliegue

```bash
# Verificar que PM2 esté corriendo
pm2 status

# Verificar logs
pm2 logs

# Verificar que Nginx esté corriendo
sudo systemctl status nginx

# Probar el health check
curl https://tu-dominio.com/health
```

## 🔧 Configuraciones Importantes

### Puerto del Backend
- **Puerto interno**: 10000 (configurado en ecosystem.config.js)
- **Puerto externo**: 443 (HTTPS) y 80 (HTTP redirect)
- **Nginx**: Actúa como proxy reverso desde HTTPS:443 → HTTP:10000

### Variables de Entorno Requeridas

Crea un archivo `.env.production` en el directorio del backend con:

```bash
NODE_ENV=production
PORT=10000
DB_HOST=tu-rds-endpoint.amazonaws.com
DB_USER=tu-usuario-db
DB_PASSWORD=tu-password-db
DB_NAME=brayamsac_db
DB_PORT=3306
JWT_SECRET=tu-jwt-secret-muy-seguro
FRONTEND_URL=https://tu-cloudfront-domain.cloudfront.net
AWS_REGION=sa-east-1
```

## 🔒 Configuración de Seguridad

### Firewall (Security Groups)
Asegúrate de que tu EC2 tenga los siguientes puertos abiertos:
- **22**: SSH (solo desde tu IP)
- **80**: HTTP (para redirect a HTTPS)
- **443**: HTTPS (público)
- **10000**: Backend (solo desde localhost/Nginx)

### SSL/TLS
- Certificado SSL configurado con Let's Encrypt
- HSTS habilitado
- Redirección automática HTTP → HTTPS

## 📊 Monitoreo

```bash
# Ver estado de la aplicación
pm2 monit

# Ver logs en tiempo real
pm2 logs --lines 100

# Reiniciar la aplicación
pm2 restart brayamsac-backend

# Ver métricas de Nginx
sudo tail -f /var/log/nginx/access.log
```

## 🆘 Solución de Problemas

### Si el backend no inicia:
```bash
# Verificar logs de PM2
pm2 logs brayamsac-backend

# Verificar variables de entorno
pm2 env 0

# Reiniciar con logs detallados
pm2 delete brayamsac-backend
pm2 start ecosystem.config.js --env production
```

### Si Nginx no funciona:
```bash
# Verificar configuración
sudo nginx -t

# Ver logs de error
sudo tail -f /var/log/nginx/error.log

# Reiniciar Nginx
sudo systemctl restart nginx
```

## ✅ Checklist Final

- [ ] EC2 actualizado y configurado
- [ ] Node.js 18 y PM2 instalados
- [ ] Nginx instalado y configurado
- [ ] Certificado SSL obtenido
- [ ] Backend clonado y configurado
- [ ] Variables de entorno configuradas
- [ ] PM2 corriendo la aplicación
- [ ] Health check funcionando
- [ ] Frontend desplegado y conectando correctamente

---

**Nota**: Recuerda actualizar el frontend en S3/CloudFront después de completar el despliegue del backend para asegurar que ambos estén sincronizados.
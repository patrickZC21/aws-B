#!/bin/bash

# Script para configurar S3 bucket para Brayamsac Asistencias
# Este script configura el bucket S3 sin CloudFront

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
BUCKET_NAME="brayamsac-asistencias"
REGION="sa-east-1"
POLICY_FILE="../config/s3-bucket-policy.json"

echo -e "${BLUE}=== Configuración de S3 Bucket para Brayamsac ===${NC}"
echo -e "${YELLOW}Bucket: $BUCKET_NAME${NC}"
echo -e "${YELLOW}Región: $REGION${NC}"
echo ""

# Verificar si AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI no está instalado${NC}"
    echo "Instala AWS CLI: https://aws.amazon.com/cli/"
    exit 1
fi

# Verificar credenciales AWS
echo -e "${BLUE}Verificando credenciales AWS...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}Error: Credenciales AWS no configuradas${NC}"
    echo "Ejecuta: aws configure"
    exit 1
fi

echo -e "${GREEN}✓ Credenciales AWS verificadas${NC}"

# Crear bucket S3
echo -e "${BLUE}Creando bucket S3...${NC}"
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    echo -e "${YELLOW}⚠ Bucket $BUCKET_NAME ya existe${NC}"
else
    if [ "$REGION" = "us-east-1" ]; then
        aws s3api create-bucket --bucket "$BUCKET_NAME"
    else
        aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION" --create-bucket-configuration LocationConstraint="$REGION"
    fi
    echo -e "${GREEN}✓ Bucket $BUCKET_NAME creado${NC}"
fi

# Configurar versionado
echo -e "${BLUE}Configurando versionado...${NC}"
aws s3api put-bucket-versioning --bucket "$BUCKET_NAME" --versioning-configuration Status=Enabled
echo -e "${GREEN}✓ Versionado habilitado${NC}"

# Configurar política del bucket
echo -e "${BLUE}Aplicando política del bucket...${NC}"
if [ -f "$POLICY_FILE" ]; then
    aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file://$POLICY_FILE
    echo -e "${GREEN}✓ Política del bucket aplicada${NC}"
else
    echo -e "${RED}Error: Archivo de política no encontrado: $POLICY_FILE${NC}"
    exit 1
fi

# Configurar CORS
echo -e "${BLUE}Configurando CORS...${NC}"
cat > /tmp/cors-config.json << EOF
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

aws s3api put-bucket-cors --bucket "$BUCKET_NAME" --cors-configuration file:///tmp/cors-config.json
echo -e "${GREEN}✓ CORS configurado${NC}"

# Configurar encriptación
echo -e "${BLUE}Configurando encriptación...${NC}"
aws s3api put-bucket-encryption --bucket "$BUCKET_NAME" --server-side-encryption-configuration '{
    "Rules": [
        {
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "AES256"
            }
        }
    ]
}'
echo -e "${GREEN}✓ Encriptación configurada${NC}"

# Crear estructura de carpetas
echo -e "${BLUE}Creando estructura de carpetas...${NC}"
aws s3api put-object --bucket "$BUCKET_NAME" --key "uploads/profiles/" --content-length 0
aws s3api put-object --bucket "$BUCKET_NAME" --key "uploads/documents/" --content-length 0
aws s3api put-object --bucket "$BUCKET_NAME" --key "uploads/reports/" --content-length 0
aws s3api put-object --bucket "$BUCKET_NAME" --key "uploads/temp/" --content-length 0
aws s3api put-object --bucket "$BUCKET_NAME" --key "backups/" --content-length 0
echo -e "${GREEN}✓ Estructura de carpetas creada${NC}"

# Mostrar información del bucket
echo ""
echo -e "${GREEN}=== Configuración completada ===${NC}"
echo -e "${BLUE}Bucket URL:${NC} https://$BUCKET_NAME.s3.$REGION.amazonaws.com"
echo -e "${BLUE}Región:${NC} $REGION"
echo -e "${BLUE}Acceso público:${NC} Habilitado para lectura"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. Actualiza las variables de entorno en .env.production"
echo "2. Configura las credenciales S3 en tu aplicación"
echo "3. Prueba la subida de archivos"
echo ""
echo -e "${BLUE}Variables de entorno sugeridas:${NC}"
echo "S3_BUCKET_NAME=$BUCKET_NAME"
echo "S3_REGION=$REGION"
echo "S3_PUBLIC_READ=true"

# Limpiar archivos temporales
rm -f /tmp/cors-config.json

echo -e "${GREEN}✓ Configuración de S3 completada exitosamente${NC}"
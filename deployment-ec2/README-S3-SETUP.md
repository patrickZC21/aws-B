# Configuración de S3 para Brayamsac Asistencias

## Problema Identificado

El error "Policy has invalid resource" en la consola de AWS S3 indica que la política del bucket tiene un ARN (Amazon Resource Name) incorrecto o mal formateado.

## Solución: Configuración S3 sin CloudFront

Ya que decidiste remover CloudFront, aquí está la configuración correcta para S3 con acceso directo:

### 1. Política de Bucket Correcta

Usa el archivo `config/s3-bucket-policy.json` que incluye:

```json
{
  "Version": "2012-10-17",
  "Id": "PolicyForBrayamsacAsistencias",
  "Statement": [
    {
      "Sid": "AllowPublicReadForGetBucketObjects",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::brayamsac-asistencias/*"
    },
    {
      "Sid": "AllowListBucket",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::brayamsac-asistencias"
    }
  ]
}
```

### 2. Configuración Automática

**Opción A: Script Automático (Recomendado)**
```bash
cd deployment-ec2/scripts
chmod +x setup-s3.sh
./setup-s3.sh
```

**Opción B: Configuración Manual**

1. **Crear el bucket:**
   ```bash
   aws s3api create-bucket --bucket brayamsac-asistencias --region sa-east-1 --create-bucket-configuration LocationConstraint=sa-east-1
   ```

2. **Aplicar la política:**
   ```bash
   aws s3api put-bucket-policy --bucket brayamsac-asistencias --policy file://config/s3-bucket-policy.json
   ```

3. **Configurar CORS:**
   ```bash
   aws s3api put-bucket-cors --bucket brayamsac-asistencias --cors-configuration '{
     "CORSRules": [
       {
         "AllowedHeaders": ["*"],
         "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
         "AllowedOrigins": ["*"],
         "ExposeHeaders": ["ETag"],
         "MaxAgeSeconds": 3000
       }
     ]
   }'
   ```

### 3. Variables de Entorno

Actualiza tu `.env.production` con:

```env
# AWS S3 CONFIGURACIÓN
S3_BUCKET_NAME=brayamsac-asistencias
S3_REGION=sa-east-1
S3_ACCESS_KEY_ID=tu-s3-access-key-id
S3_SECRET_ACCESS_KEY=tu-s3-secret-access-key
S3_PUBLIC_READ=true
```

### 4. Estructura de Carpetas en S3

El script creará automáticamente:
```
brayamsac-asistencias/
├── uploads/
│   ├── profiles/     # Fotos de perfil
│   ├── documents/    # Documentos PDF
│   ├── reports/      # Reportes generados
│   └── temp/         # Archivos temporales
└── backups/          # Respaldos de BD
```

### 5. URLs de Acceso

- **Bucket URL:** `https://brayamsac-asistencias.s3.sa-east-1.amazonaws.com`
- **Archivo ejemplo:** `https://brayamsac-asistencias.s3.sa-east-1.amazonaws.com/uploads/profiles/usuario123.jpg`

### 6. Integración en el Backend

Ejemplo de configuración en Node.js:

```javascript
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION
});

// Subir archivo
const uploadFile = async (file, key) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };
  
  return await s3.upload(params).promise();
};
```

### 7. Verificación

Para verificar que todo funciona:

1. **Listar buckets:**
   ```bash
   aws s3 ls
   ```

2. **Verificar política:**
   ```bash
   aws s3api get-bucket-policy --bucket brayamsac-asistencias
   ```

3. **Probar subida:**
   ```bash
   echo "test" > test.txt
   aws s3 cp test.txt s3://brayamsac-asistencias/test.txt
   ```

4. **Verificar acceso público:**
   ```bash
   curl https://brayamsac-asistencias.s3.sa-east-1.amazonaws.com/test.txt
   ```

### 8. Seguridad

- ✅ Encriptación AES256 habilitada
- ✅ Versionado habilitado
- ✅ Acceso público solo para lectura
- ✅ CORS configurado correctamente
- ⚠️ Considera usar IAM roles en lugar de access keys

### 9. Costos Estimados

- **Almacenamiento:** ~$0.023 por GB/mes
- **Transferencia:** Primeros 100GB gratis/mes
- **Requests:** GET: $0.0004 por 1000 requests

### 10. Troubleshooting

**Error: "Access Denied"**
- Verifica que la política esté aplicada correctamente
- Confirma que el ARN del bucket sea correcto

**Error: "CORS"**
- Verifica la configuración CORS
- Asegúrate de incluir los headers necesarios

**Error: "Invalid Resource"**
- El ARN debe ser: `arn:aws:s3:::brayamsac-asistencias/*`
- No incluir referencias a CloudFront

---

## Próximos Pasos

1. Ejecutar el script `setup-s3.sh`
2. Actualizar variables de entorno
3. Integrar S3 en el backend
4. Probar subida de archivos
5. Configurar backup automático (opcional)

¿Necesitas ayuda con algún paso específico?
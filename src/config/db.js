import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Para ES Modules, obtenemos la ruta actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde la ruta correcta (subimos 2 directorios)
const envPath = path.join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

// También cargar variables de optimización si estamos en producción
if (process.env.NODE_ENV === 'production') {
  const optimizationPath = path.join(__dirname, '..', '..', '.env.render');
  dotenv.config({ path: optimizationPath });
}

// ⚡ CONFIGURACIÓN OPTIMIZADA PARA PRODUCCIÓN
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: process.env.MYSQL_CONNECTION_LIMIT || (process.env.NODE_ENV === 'production' ? 10 : 5),
  queueLimit: 0,
  charset: 'utf8mb4'
  // Si tu proveedor de base de datos requiere SSL, descomenta y configura:
  // ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

// Test de conexión silencioso (solo errores)
if (process.env.NODE_ENV !== 'production') {
  pool.getConnection()
    .then(connection => {
      console.log('✅ BD conectada');
      connection.release();
    })
    .catch(err => {
      console.error('❌ Error BD:', err.message);
    });
}

export default pool;



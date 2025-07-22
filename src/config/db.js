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

// ⚡ CONFIGURACIÓN OPTIMIZADA PARA AWS RDS
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: process.env.NODE_ENV === 'production' ? 15 : 5,
  queueLimit: 0,
  charset: 'utf8mb4',
  // 🔒 SSL para RDS en producción
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false // Para RDS se puede usar false
  } : false,
  // ⏱️ Timeouts optimizados
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  // 🔄 Configuración para reconexión automática
  pool: {
    min: 2,
    max: process.env.NODE_ENV === 'production' ? 15 : 5,
    idleTimeoutMillis: 30000,
    createTimeoutMillis: 3000,
    acquireTimeoutMillis: 60000
  }
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



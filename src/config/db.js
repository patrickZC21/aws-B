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

// También cargar variables de producción si estamos en producción
if (process.env.NODE_ENV === 'production') {
  const productionPath = path.join(__dirname, '..', '..', '.env.production');
  dotenv.config({ path: productionPath });
  console.log('🔧 Cargando configuración de producción desde:', productionPath);
} else {
  console.log('🔧 Modo desarrollo - usando .env local');
}

// Debug de configuración de BD
console.log('🔍 Configuración BD:', {
  host: process.env.DB_HOST || 'No configurado',
  port: process.env.DB_PORT || '3306',
  user: process.env.DB_USER || 'No configurado',
  database: process.env.DB_NAME || 'No configurado',
  ssl: process.env.DB_SSL || 'false',
  nodeEnv: process.env.NODE_ENV || 'development'
});

// ⚡ CONFIGURACIÓN SIN LIMITACIONES - MÁXIMO RENDIMIENTO
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 100, // Límite muy alto de conexiones
  queueLimit: 0, // Sin límite en la cola
  charset: 'utf8mb4',
  acquireTimeout: 0, // Sin timeout para adquirir conexión
  timeout: 0, // Sin timeout para queries
  reconnect: true, // Reconexión automática
  idleTimeout: 0, // Sin timeout para conexiones idle
  
  // Habilitar SSL para conexiones remotas en producción (AWS RDS requiere SSL)
  ssl: process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false,
    ca: undefined
  } : undefined
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



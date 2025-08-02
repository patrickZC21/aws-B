import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

// Detectar si usar SQLite (desarrollo local) o MySQL (producción/remoto)
const useLocalSQLite = process.env.DB_HOST === 'localhost' && process.env.DB_NAME === 'asistencia_db';
const sqliteDbPath = path.join(process.cwd(), 'database', 'asistencia_local.db');
const sqliteExists = fs.existsSync(sqliteDbPath);

let pool;

if (useLocalSQLite && sqliteExists) {
  console.log('🔧 Usando base de datos SQLite local para desarrollo');
  // Importar dinámicamente el adaptador SQLite
  const { default: sqlitePool } = await import('./db-sqlite.js');
  pool = sqlitePool;
} else {
  console.log('🔧 Usando base de datos MySQL');
  // ⚡ CONFIGURACIÓN OPTIMIZADA PARA PRODUCCIÓN CON RECONEXIÓN AUTOMÁTICA
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: process.env.MYSQL_CONNECTION_LIMIT || (process.env.NODE_ENV === 'production' ? 10 : 5),
    queueLimit: 0,
    charset: 'utf8mb4',
    // Habilitar SSL para conexiones remotas en producción
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });

  // Test de conexión silencioso (solo errores)
  if (process.env.NODE_ENV !== 'production') {
    pool.getConnection()
      .then(connection => {
        console.log('✅ BD MySQL conectada');
        connection.release();
      })
      .catch(err => {
        console.error('❌ Error BD MySQL:', err.message);
        if (useLocalSQLite && !sqliteExists) {
          console.log('💡 Sugerencia: Ejecuta "node scripts/database/init-sqlite-local.js" para crear la base de datos local');
        }
      });
  }
}

export default pool;



import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

async function verificarPasswordCoordinador() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0
  });

  try {
    // Verificar la contraseña del coordinador
    const [rows] = await pool.execute(`
      SELECT u.nombre, u.correo, u.password, pa.password_original, r.nombre as rol 
      FROM usuarios u 
      LEFT JOIN passwords_admin pa ON u.id = pa.usuario_id
      JOIN roles r ON u.rol_id = r.id 
      WHERE u.correo = 'asdf@brayam.com'
    `);
    
    console.log('🔍 INFORMACIÓN DEL COORDINADOR:');
    console.log('==============================');
    if (rows.length > 0) {
      const user = rows[0];
      console.log(`👤 Nombre: ${user.nombre}`);
      console.log(`📧 Email: ${user.correo}`);
      console.log(`🏷️ Rol: ${user.rol}`);
      console.log(`🔐 Hash encriptado: ${user.password.substring(0, 30)}...`);
      console.log(`🔑 Password original: ${user.password_original || 'No disponible'}`);
    } else {
      console.log('❌ Usuario no encontrado');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

verificarPasswordCoordinador();

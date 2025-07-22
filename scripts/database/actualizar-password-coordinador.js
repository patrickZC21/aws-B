import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

async function actualizarPasswordCoordinador() {
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
    console.log('🔧 ACTUALIZANDO CONTRASEÑA DEL COORDINADOR');
    console.log('==========================================');
    
    // Encriptar nueva contraseña con saltRounds 10
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log(`🔑 Nueva contraseña: ${newPassword}`);
    console.log(`🔐 Nuevo hash: ${hashedPassword.substring(0, 30)}...`);
    
    // Actualizar en la base de datos
    const [result] = await pool.execute(
      'UPDATE usuarios SET password = ? WHERE correo = ?',
      [hashedPassword, 'asdf@brayam.com']
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ Contraseña actualizada exitosamente');
      
      // Actualizar también en passwords_admin
      await pool.execute(`
        INSERT INTO passwords_admin (usuario_id, password_original, created_at, updated_at)
        SELECT id, ?, NOW(), NOW() FROM usuarios WHERE correo = ?
        ON DUPLICATE KEY UPDATE 
        password_original = VALUES(password_original),
        updated_at = NOW()
      `, [newPassword, 'asdf@brayam.com']);
      
      console.log('✅ Password original guardada en passwords_admin');
      
      // Verificar que funcione
      const isValid = await bcrypt.compare(newPassword, hashedPassword);
      console.log(`🧪 Verificación: ${isValid ? '✅ VÁLIDA' : '❌ Inválida'}`);
      
    } else {
      console.log('❌ No se pudo actualizar la contraseña');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

actualizarPasswordCoordinador();

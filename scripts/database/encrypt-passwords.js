import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

// Cargar variables de entorno
dotenv.config({ path: '.env' });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function encriptarPasswordsExistentes() {
  try {
    console.log('🔒 Encriptando contraseñas existentes...');
    
    // Obtener todos los usuarios con contraseñas en texto plano
    const [users] = await pool.query('SELECT id, correo, password FROM usuarios');
    
    for (const user of users) {
      // Verificar si la contraseña ya está encriptada (los hashes bcrypt empiezan con $2b$)
      if (!user.password.startsWith('$2b$')) {
        console.log(`🔄 Encriptando contraseña para usuario ID ${user.id} (${user.correo})`);
        
        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(user.password, 12);
        
        // Actualizar en la base de datos
        await pool.query('UPDATE usuarios SET password = ? WHERE id = ?', [hashedPassword, user.id]);
        
        console.log(`✅ Contraseña encriptada para usuario ID ${user.id}`);
      } else {
        console.log(`⏭️ Usuario ID ${user.id} ya tiene contraseña encriptada`);
      }
    }
    
    console.log('🎉 Proceso completado. Todas las contraseñas están ahora encriptadas.');
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

encriptarPasswordsExistentes();

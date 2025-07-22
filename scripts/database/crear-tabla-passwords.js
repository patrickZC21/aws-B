import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

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

async function crearTablaPasswordsOriginales() {
  console.log('🔧 CREANDO TABLA PARA CONTRASEÑAS ORIGINALES');
  console.log('============================================\n');
  
  try {
    // Crear tabla para almacenar contraseñas originales (solo para admin)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS passwords_admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        password_original VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        UNIQUE KEY unique_usuario (usuario_id)
      )
    `);
    
    console.log('✅ Tabla passwords_admin creada exitosamente');
    
    // Insertar las contraseñas conocidas de los usuarios existentes
    const usuariosExistentes = [
      { id: 1, password: '123456' }, // Soledad Ramírez
      { id: 3, password: '123456' }, // Admin Central
      { id: 4, password: '123456' }, // Andrea Torres
      { id: 49, password: '123456' }, // Fernanda torres
      { id: 59, password: '123456' }, // Diego Bailon
      { id: 60, password: '123456' }, // Lidia Karla
      { id: 61, password: 'testPassword2025' } // Coordinador Test
    ];
    
    for (const user of usuariosExistentes) {
      try {
        await pool.query(
          'INSERT INTO passwords_admin (usuario_id, password_original) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_original = ?',
          [user.id, user.password, user.password]
        );
        console.log(`✅ Contraseña guardada para usuario ID ${user.id}: ${user.password}`);
      } catch (err) {
        console.log(`⚠️ Usuario ID ${user.id} ya existe o error:`, err.message);
      }
    }
    
    console.log('\n🎉 CONFIGURACIÓN COMPLETADA!');
    console.log('Ahora el sistema puede mostrar contraseñas originales a admin/rrhh');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

crearTablaPasswordsOriginales();

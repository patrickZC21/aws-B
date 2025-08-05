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

async function resetearSesiones() {
  console.log('🔄 RESETEANDO TODAS LAS SESIONES');
  console.log('================================\n');
  
  try {
    // Resetear todas las sesiones activas
    const [result] = await pool.query('UPDATE usuarios SET ya_ingreso = 0 WHERE ya_ingreso = 1');
    
    console.log(`✅ Se resetearon ${result.affectedRows} sesiones activas`);
    
    // Verificar el estado
    const [users] = await pool.query('SELECT id, nombre, correo, ya_ingreso FROM usuarios');
    
    console.log('\n📊 ESTADO ACTUAL DE SESIONES:');
    console.log('=============================');
    users.forEach(user => {
      const estado = user.ya_ingreso ? '🔴 Conectado' : '⚪ Desconectado';
      console.log(`• ${user.nombre}: ${estado}`);
    });
    
    console.log('\n✅ Ahora puedes hacer login con cualquier usuario');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

resetearSesiones();

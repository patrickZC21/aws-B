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

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...');
    
    // Consultar cantidad total de usuarios
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM usuarios');
    console.log('📊 Total de usuarios:', countResult[0].total);
    
    // Consultar usuarios con roles (sin mostrar datos sensibles)
    const [users] = await pool.query(`
      SELECT 
        u.id,
        LEFT(u.nombre, 3) as nombre_inicio,
        LEFT(u.correo, 5) as correo_inicio,
        r.nombre as rol_nombre,
        u.activo,
        u.ya_ingreso
      FROM usuarios u 
      JOIN roles r ON u.rol_id = r.id 
      ORDER BY u.id
    `);
    
    console.log('👥 Usuarios encontrados:');
    users.forEach(user => {
      console.log(`- ID: ${user.id} | Nombre: ${user.nombre_inicio}*** | Correo: ${user.correo_inicio}*** | Rol: ${user.rol_nombre} | Activo: ${user.activo} | Ingresado: ${user.ya_ingreso}`);
    });
    
    // Verificar si existe el correo específico que estamos probando
    const [adminCheck] = await pool.query('SELECT COUNT(*) as existe FROM usuarios WHERE correo = ?', ['admin@brayamsac.com']);
    console.log('🔍 ¿Existe admin@brayamsac.com?:', adminCheck[0].existe > 0 ? 'SÍ' : 'NO');
    
    await pool.end();
    console.log('✅ Consulta completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsers();

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

async function consultarUsuarios() {
  console.log('👥 USUARIOS REGISTRADOS EN EL SISTEMA');
  console.log('=====================================\n');
  
  try {
    // Obtener todos los usuarios con su rol
    const [users] = await pool.query(`
      SELECT u.id, u.nombre, u.correo, u.activo, u.ya_ingreso, r.nombre as rol
      FROM usuarios u 
      JOIN roles r ON u.rol_id = r.id 
      ORDER BY u.id
    `);
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios registrados');
      return;
    }
    
    console.log(`📊 Total de usuarios: ${users.length}\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 ${user.nombre}`);
      console.log(`   📧 Email: ${user.correo}`);
      console.log(`   👥 Rol: ${user.rol}`);
      console.log(`   📱 Estado: ${user.activo ? '✅ Activo' : '❌ Inactivo'}`);
      console.log(`   🔐 Sesión: ${user.ya_ingreso ? '🔴 Conectado' : '⚪ Desconectado'}`);
      console.log(`   ─────────────────────────────────────`);
    });
    
    console.log('\n📝 CONTRASEÑAS CONOCIDAS:');
    console.log('========================');
    console.log('🔑 Usuarios existentes (creados antes): 123456');
    console.log('🔑 Usuarios nuevos: La contraseña que asignes al crearlos');
    
    console.log('\n💡 PARA CREAR UN NUEVO USUARIO:');
    console.log('==============================');
    console.log('POST http://localhost:3000/api/usuarios');
    console.log('Body ejemplo:');
    console.log(JSON.stringify({
      nombre: "Nuevo Coordinador",
      correo: "coordinador@brayam.com", 
      password: "miPassword123",
      rol_id: 3, // 3 = COORDINADOR
      activo: 1,
      ya_ingreso: 0
    }, null, 2));
    
    console.log('\n📋 ROLES DISPONIBLES:');
    const [roles] = await pool.query('SELECT * FROM roles ORDER BY id');
    roles.forEach(rol => {
      console.log(`   ${rol.id} = ${rol.nombre}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

consultarUsuarios();

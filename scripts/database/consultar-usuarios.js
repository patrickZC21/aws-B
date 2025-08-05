import pool from './src/config/db.js';

async function consultarUsuarios() {
  try {
    console.log('🔍 Consultando usuarios en la base de datos...');
    const [rows] = await pool.query(`
      SELECT u.id, u.nombre, u.correo, u.rol_id, r.nombre as nombre_rol, u.activo
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      ORDER BY u.id
      LIMIT 10
    `);
    
    console.log(`✅ Usuarios encontrados: ${rows.length}`);
    rows.forEach(user => {
      console.log(`- ID: ${user.id} | Nombre: ${user.nombre} | Correo: ${user.correo} | Rol: ${user.nombre_rol} | Activo: ${user.activo}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

consultarUsuarios();

import mysql from 'mysql2/promise';

async function verificarCoordinadores() {
  const pool = mysql.createPool({
    host: 'mysql-brayamsacasistencia.alwaysdata.net',
    user: '417526_brayamsac',
    password: 'MZAE1vmKIBsq3elT7vUefwjL6cXKR6',
    database: 'brayamsacasistencia_control_asistencias',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0
  });

  try {
    const [rows] = await pool.execute(`
      SELECT u.nombre, u.correo, r.nombre as rol 
      FROM usuarios u 
      JOIN roles r ON u.rol_id = r.id 
      WHERE r.nombre = 'COORDINADOR'
    `);
    
    console.log('📋 COORDINADORES DISPONIBLES:');
    console.log('============================');
    rows.forEach((coord, index) => {
      console.log(`${index + 1}. ${coord.nombre} - ${coord.correo}`);
    });
    
    if (rows.length === 0) {
      console.log('❌ No hay usuarios con rol COORDINADOR');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

verificarCoordinadores();

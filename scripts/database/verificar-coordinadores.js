import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function verificarCoordinadores() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'brayamsac-bd-asistencias.cd6ygkkwilu7.sa-east-1.rds.amazonaws.com',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'brayamsac-bd-asistencias',
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : undefined
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

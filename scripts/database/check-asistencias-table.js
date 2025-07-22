import dotenv from 'dotenv';
import pool from './src/config/db.js';

dotenv.config();

async function checkAsistenciasTable() {
  try {
    console.log('🔍 Verificando estructura de tabla asistencias...');
    
    // Describir la estructura de la tabla
    const [columns] = await pool.query('DESCRIBE asistencias');
    console.log('📊 Columnas de la tabla asistencias:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });
    
    // Mostrar algunos registros de ejemplo
    console.log('\n📋 Registros de ejemplo:');
    const [rows] = await pool.query('SELECT * FROM asistencias LIMIT 3');
    console.log(rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkAsistenciasTable();

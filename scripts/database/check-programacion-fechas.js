import dotenv from 'dotenv';
import pool from './src/config/db.js';

dotenv.config();

async function checkProgramacionFechas() {
  try {
    console.log('🔍 Verificando tabla programacion_fechas...');
    
    // Describir la estructura de la tabla
    const [columns] = await pool.query('DESCRIBE programacion_fechas');
    console.log('📊 Columnas de programacion_fechas:');
    columns.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });
    
    // Mostrar algunos registros de ejemplo
    console.log('\n📋 Registros de ejemplo:');
    const [rows] = await pool.query('SELECT * FROM programacion_fechas LIMIT 5');
    console.log(rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkProgramacionFechas();

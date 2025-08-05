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

async function analyzeDatabase() {
  try {
    console.log('🔍 Analizando estructura de la base de datos...');
    
    // Verificar índices en tabla usuarios
    console.log('\n📊 Índices en tabla usuarios:');
    const [indexes] = await pool.query('SHOW INDEX FROM usuarios');
    indexes.forEach(index => {
      console.log(`- ${index.Key_name}: ${index.Column_name} (${index.Index_type})`);
    });
    
    // Verificar estructura de la tabla usuarios
    console.log('\n🏗️ Estructura de tabla usuarios:');
    const [structure] = await pool.query('DESCRIBE usuarios');
    structure.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Key ? `[${col.Key}]` : ''}`);
    });
    
    // Verificar cantidad de registros
    console.log('\n📈 Estadísticas de la tabla:');
    const [count] = await pool.query('SELECT COUNT(*) as total FROM usuarios');
    console.log(`Total de usuarios: ${count[0].total}`);
    
    // Verificar índices en tabla roles
    console.log('\n📊 Índices en tabla roles:');
    const [roleIndexes] = await pool.query('SHOW INDEX FROM roles');
    roleIndexes.forEach(index => {
      console.log(`- ${index.Key_name}: ${index.Column_name} (${index.Index_type})`);
    });
    
    // Analizar la consulta del login
    console.log('\n🔍 Analizando la consulta del login:');
    const [explain] = await pool.query(`
      EXPLAIN SELECT u.*, r.nombre as nombre_rol
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      WHERE u.correo = 'admin01@brayam.com'
    `);
    
    console.log('Plan de ejecución:');
    explain.forEach(row => {
      console.log(`- Tabla: ${row.table}, Tipo: ${row.type}, Key: ${row.key || 'NULL'}, Rows: ${row.rows}`);
    });
    
    // Verificar contraseñas no encriptadas
    console.log('\n🔐 Verificando estado de encriptación de contraseñas:');
    const [passwords] = await pool.query(`
      SELECT id, correo, 
             CASE 
               WHEN password LIKE '$2b$%' THEN 'ENCRIPTADA'
               ELSE 'TEXTO PLANO'
             END as estado_password
      FROM usuarios
    `);
    
    let encriptadas = 0;
    let textoPlano = 0;
    
    passwords.forEach(user => {
      console.log(`- ID ${user.id} (${user.correo}): ${user.estado_password}`);
      if (user.estado_password === 'ENCRIPTADA') {
        encriptadas++;
      } else {
        textoPlano++;
      }
    });
    
    console.log(`\n📊 Resumen de contraseñas:`);
    console.log(`✅ Encriptadas: ${encriptadas}`);
    console.log(`⚠️ Texto plano: ${textoPlano}`);
    
    if (textoPlano > 0) {
      console.log('\n⚠️ PROBLEMA DE SEGURIDAD: Hay contraseñas en texto plano');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

analyzeDatabase();

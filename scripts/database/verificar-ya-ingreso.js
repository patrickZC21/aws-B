import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

async function verificarEstadoYaIngreso() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0
  });

  try {
    console.log('🔍 VERIFICANDO ESTADO YA_INGRESO DE TODOS LOS USUARIOS');
    console.log('====================================================\n');
    
    const [rows] = await pool.execute(`
      SELECT id, nombre, correo, ya_ingreso, activo
      FROM usuarios 
      ORDER BY id
    `);
    
    console.log('📋 ESTADO ACTUAL DE USUARIOS:');
    console.log('==============================');
    rows.forEach((user, index) => {
      const estado = user.ya_ingreso === 1 ? '🟢 CONECTADO' : '⚪ DESCONECTADO';
      console.log(`${index + 1}. ${user.nombre}`);
      console.log(`   📧 ${user.correo}`);
      console.log(`   👁️ ya_ingreso: ${user.ya_ingreso} ${estado}`);
      console.log(`   ✅ activo: ${user.activo}`);
      console.log(`   ─────────────────────────────────`);
    });
    
    const conectados = rows.filter(u => u.ya_ingreso === 1).length;
    const desconectados = rows.filter(u => u.ya_ingreso === 0).length;
    
    console.log(`\n📊 RESUMEN:`);
    console.log(`🟢 Conectados: ${conectados}`);
    console.log(`⚪ Desconectados: ${desconectados}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verificarEstadoYaIngreso();

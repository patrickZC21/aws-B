/**
 * Script para resetear sesiones bloqueadas de usuarios coordinadores
 * Ejecutar cuando hay errores 409 (conflicto) en el login
 */

import pool from './src/config/db.js';

async function resetearSesionesBloqueadas() {
  try {
    console.log('🔄 Iniciando reseteo de sesiones bloqueadas...');
    
    // Resetear todas las sesiones activas
    const [result] = await pool.query(
      'UPDATE usuarios SET ya_ingreso = 0 WHERE ya_ingreso = 1'
    );
    
    console.log(`✅ Sesiones reseteadas: ${result.affectedRows} usuarios`);
    
    // Mostrar usuarios que tenían sesiones activas
    const [usuarios] = await pool.query(`
      SELECT u.id, u.nombre, u.correo, r.nombre as rol
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      WHERE u.activo = 1
      ORDER BY u.id
    `);
    
    console.log('\n📋 Usuarios en el sistema:');
    usuarios.forEach(user => {
      console.log(`- ${user.nombre} (${user.correo}) - Rol: ${user.rol}`);
    });
    
    console.log('\n✅ Todas las sesiones han sido liberadas. Los usuarios pueden hacer login normalmente.');
    
  } catch (error) {
    console.error('❌ Error al resetear sesiones:', error);
  } finally {
    await pool.end();
  }
}

// Función para resetear un usuario específico
async function resetearUsuarioEspecifico(correo) {
  try {
    console.log(`🔄 Reseteando sesión para: ${correo}`);
    
    const [result] = await pool.query(
      'UPDATE usuarios SET ya_ingreso = 0 WHERE correo = ? AND ya_ingreso = 1',
      [correo]
    );
    
    if (result.affectedRows > 0) {
      console.log(`✅ Sesión reseteada para ${correo}`);
    } else {
      console.log(`ℹ️  El usuario ${correo} no tenía sesión activa o no existe`);
    }
    
  } catch (error) {
    console.error('❌ Error al resetear usuario específico:', error);
  } finally {
    await pool.end();
  }
}

// Verificar argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length === 0) {
  // Resetear todas las sesiones
  resetearSesionesBloqueadas();
} else if (args[0] === '--usuario' && args[1]) {
  // Resetear usuario específico
  resetearUsuarioEspecifico(args[1]);
} else {
  console.log(`
Uso del script:

1. Resetear todas las sesiones:
   node resetear-sesiones-coordinadores.js

2. Resetear usuario específico:
   node resetear-sesiones-coordinadores.js --usuario correo@ejemplo.com

Ejemplos:
   node resetear-sesiones-coordinadores.js
   node resetear-sesiones-coordinadores.js --usuario coordinador@brayamsac.com
`);
}

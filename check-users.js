import pool from './src/config/db.js';

async function checkUsers() {
  try {
    console.log('📋 Verificando estructura de tabla usuarios...');
    
    const [structure] = await pool.query('DESCRIBE usuarios');
    console.log('\nEstructura de la tabla:');
    structure.forEach(row => {
      console.log(`- ${row.Field} (${row.Type})`);
    });
    
    console.log('\n👥 Usuarios en la base de datos:');
    const [users] = await pool.query('SELECT * FROM usuarios LIMIT 3');
    console.log('Total usuarios:', users.length);
    
    if (users.length > 0) {
      console.log('\nPrimer usuario de ejemplo:');
      console.log(users[0]);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUsers();
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de SQLite para desarrollo local
class SQLitePool {
  constructor() {
    this.dbPath = path.join(process.cwd(), 'database', 'asistencia_local.db');
    this.db = null;
  }

  async getConnection() {
    if (!this.db) {
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });
      
      // Habilitar foreign keys
      await this.db.exec('PRAGMA foreign_keys = ON');
    }
    return this.db;
  }

  async query(sql, params = []) {
    const db = await this.getConnection();
    
    // Convertir sintaxis MySQL a SQLite si es necesario
    let convertedSql = sql;
    
    // Convertir LIMIT con OFFSET
    convertedSql = convertedSql.replace(/LIMIT (\d+) OFFSET (\d+)/g, 'LIMIT $2, $1');
    
    // Convertir AUTO_INCREMENT a AUTOINCREMENT
    convertedSql = convertedSql.replace(/AUTO_INCREMENT/gi, 'AUTOINCREMENT');
    
    // Convertir DATETIME a CURRENT_TIMESTAMP para SQLite
    convertedSql = convertedSql.replace(/NOW\(\)/gi, "datetime('now')");
    convertedSql = convertedSql.replace(/CURRENT_TIMESTAMP/gi, "datetime('now')");
    
    try {
      // Determinar si es SELECT, INSERT, UPDATE, DELETE
      const sqlType = convertedSql.trim().split(' ')[0].toUpperCase();
      
      if (sqlType === 'SELECT') {
        const rows = await db.all(convertedSql, params);
        return [rows]; // Formato compatible con mysql2
      } else if (sqlType === 'INSERT') {
        const result = await db.run(convertedSql, params);
        return [{ insertId: result.lastID, affectedRows: result.changes }];
      } else if (sqlType === 'UPDATE' || sqlType === 'DELETE') {
        const result = await db.run(convertedSql, params);
        return [{ affectedRows: result.changes }];
      } else {
        // Para otros tipos de consultas (CREATE, DROP, etc.)
        const result = await db.run(convertedSql, params);
        return [result];
      }
    } catch (error) {
      console.error('Error en consulta SQLite:', error.message);
      console.error('SQL:', convertedSql);
      console.error('Params:', params);
      throw error;
    }
  }

  async execute(sql, params = []) {
    return this.query(sql, params);
  }

  async end() {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

// Crear instancia global del pool
const pool = new SQLitePool();

// Exportar con la misma interfaz que mysql2
export default pool;

// También exportar como named export para compatibilidad
export { pool };
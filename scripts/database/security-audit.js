#!/usr/bin/env node

/**
 * Script de auditoría de seguridad para el backend
 * Ejecutar con: node security-audit.js
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const securityChecklist = [
  {
    check: 'Variables de entorno',
    description: 'Verificar que exista archivo .env',
    test: () => fs.existsSync('.env'),
    critical: true
  },
  {
    check: 'JWT Secret',
    description: 'JWT_SECRET debe tener al menos 32 caracteres',
    test: () => {
      const secret = process.env.JWT_SECRET;
      return secret && secret.length >= 32;
    },
    critical: true
  },
  {
    check: 'Node Environment',
    description: 'NODE_ENV debe estar definido',
    test: () => process.env.NODE_ENV !== undefined,
    critical: false
  },
  {
    check: 'Dependencias de seguridad',
    description: 'Verificar que están instaladas helmet, express-rate-limit',
    test: () => {
      try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        return deps.helmet && deps['express-rate-limit'];
      } catch {
        return false;
      }
    },
    critical: true
  },
  {
    check: 'Archivo .gitignore',
    description: 'Verificar que .env esté en .gitignore',
    test: () => {
      try {
        const gitignore = fs.readFileSync('.gitignore', 'utf8');
        return gitignore.includes('.env');
      } catch {
        return false;
      }
    },
    critical: true
  }
];

console.log('🔒 AUDITORÍA DE SEGURIDAD - BACKEND\n');
console.log('='.repeat(50));

let passed = 0;
let failed = 0;
let criticalFailed = 0;

securityChecklist.forEach((item, index) => {
  const result = item.test();
  const status = result ? '✅ PASS' : '❌ FAIL';
  const priority = item.critical ? '[CRÍTICO]' : '[OPCIONAL]';
  
  console.log(`${index + 1}. ${item.check} ${priority}`);
  console.log(`   ${item.description}`);
  console.log(`   ${status}\n`);
  
  if (result) {
    passed++;
  } else {
    failed++;
    if (item.critical) {
      criticalFailed++;
    }
  }
});

console.log('='.repeat(50));
console.log(`RESUMEN: ${passed} pasaron, ${failed} fallaron`);
console.log(`CRÍTICOS FALLADOS: ${criticalFailed}`);

if (criticalFailed > 0) {
  console.log('\n🚨 ATENCIÓN: Hay problemas de seguridad críticos que deben resolverse');
  process.exit(1);
} else {
  console.log('\n🎉 Todas las verificaciones críticas pasaron');
  process.exit(0);
}

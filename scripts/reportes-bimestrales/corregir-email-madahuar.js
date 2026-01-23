#!/usr/bin/env node

/**
 * corregir-email-madahuar.js
 * Corrige el typo en el email de Roberto Madahuar en el Excel
 */

import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelPath = path.join(__dirname, '../../data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx');

console.log('\n🔧 CORRECCIÓN: Email de Roberto Madahuar\n');
console.log('='.repeat(90) + '\n');

// Leer Excel
const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

console.log('ANTES:');
console.log(`  Fila 103: ${data[102].EMAIL} - ${data[102]['NOMBRE SOCIO']}`);
console.log(`  Credencial: ${data[102]['No. CREDENCIAL']}\n`);

// Corregir el typo
let corregidos = 0;
data.forEach((fila, idx) => {
  if (fila['NOMBRE SOCIO'] === 'ROBERTO JOSE MADAHUAR BOEHM' && fila.EMAIL === 'madahuar@cotexsa.com.mx') {
    console.log(`✅ Corrigiendo fila ${idx + 2}...`);
    fila.EMAIL = 'rmadahuar@cotexsa.com.mx';
    corregidos++;
  }
});

console.log(`\nDESPUÉS:`);
console.log(`  Fila 103: ${data[102].EMAIL} - ${data[102]['NOMBRE SOCIO']}`);
console.log(`  Credencial: ${data[102]['No. CREDENCIAL']}\n`);

// Guardar Excel
const newWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWb, XLSX.utils.json_to_sheet(data), 'SOCIOS_ENERO_2026');
XLSX.writeFile(newWb, excelPath);

console.log('='.repeat(90));
console.log(`\n✅ ${corregidos} email(s) corregido(s) en Excel\n`);

process.exit(0);

#!/usr/bin/env node

/**
 * corregir-fechas-validas.js
 * Corrige FECHA DE ALTA a una fecha válida después de 2005
 */

import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelPath = path.join(__dirname, '../../data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx');

console.log('\n📅 CORRECCIÓN: FECHA DE ALTA a fecha válida (>2005)\n');
console.log('='.repeat(90) + '\n');

// Leer Excel
const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

console.log('ANTES:');
console.log(`Fila 1: ${data[0]['FECHA ALTA']}`);
console.log(`Fila 2: ${data[1]['FECHA ALTA']}\n`);

// Usar fecha estándar para club (2015-01-01)
const fechaValida = '2015-01-01';

// Corregir fechas inválidas
let corregidas = 0;
data.forEach((fila) => {
  const fecha = fila['FECHA ALTA'];
  // Si está vacía o es la fecha incorrecta
  if (!fecha || fecha === '1969-12-31' || fecha === '1970-01-01' || 
      (typeof fecha === 'number') || 
      (typeof fecha === 'string' && (fecha.startsWith('1969') || fecha.startsWith('1970')))) {
    fila['FECHA ALTA'] = fechaValida;
    corregidas++;
  }
});

console.log('DESPUÉS:');
console.log(`Fila 1: ${data[0]['FECHA ALTA']}`);
console.log(`Fila 2: ${data[1]['FECHA ALTA']}\n`);

// Guardar Excel
const newWb = XLSX.utils.book_new();
const newWs = XLSX.utils.json_to_sheet(data);

// Aplicar formato de fecha
const headers = Object.keys(data[0]);
const fechaColIndex = headers.indexOf('FECHA ALTA');

if (fechaColIndex >= 0) {
  const colLetter = XLSX.utils.encode_col(fechaColIndex);
  for (let i = 1; i <= data.length; i++) {
    const cellRef = colLetter + (i + 1);
    if (newWs[cellRef]) {
      newWs[cellRef].z = 'yyyy-mm-dd'; // Formato de fecha
    }
  }
}

XLSX.utils.book_append_sheet(newWb, newWs, 'SOCIOS_ENERO_2026');
XLSX.writeFile(newWb, excelPath);

console.log('='.repeat(90));
console.log(`\n✅ ${corregidas} fecha(s) corregida(s)`);
console.log(`   Fecha aplicada: ${fechaValida}\n`);

process.exit(0);

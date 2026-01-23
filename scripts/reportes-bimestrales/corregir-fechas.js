#!/usr/bin/env node

/**
 * corregir-fechas.js
 * Convierte FECHA DE ALTA de números seriales a formato de fecha real
 */

import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelPath = path.join(__dirname, '../../data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx');

console.log('\n📅 CORRECCIÓN: Formato de FECHA DE ALTA\n');
console.log('='.repeat(90) + '\n');

// Función para convertir número serial de Excel a fecha
function excelSerialToDate(serial) {
  // Excel comienza contando desde 1900-01-01
  // Pero los seriales son con decimales (incluyen hora)
  // El serial 1 = 1900-01-01
  const excelEpoch = new Date(1900, 0, 1); // 1 enero 1900
  // Restar 1 porque Excel cuenta desde 1, no desde 0
  // Sumar el serial como días
  const date = new Date(excelEpoch.getTime() + (serial - 1) * 24 * 60 * 60 * 1000);
  return date;
}

// Leer Excel
const wb = XLSX.readFile(excelPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws);

console.log('ANTES:');
console.log(`Fila 1: ${data[0]['FECHA ALTA']} (número serial)\n`);

// Convertir fechas
let convertidas = 0;
data.forEach((fila, idx) => {
  if (fila['FECHA ALTA'] && typeof fila['FECHA ALTA'] === 'number') {
    const date = excelSerialToDate(fila['FECHA ALTA']);
    // Formatear como YYYY-MM-DD
    const año = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const día = String(date.getDate()).padStart(2, '0');
    fila['FECHA ALTA'] = `${año}-${mes}-${día}`;
    convertidas++;
  }
});

console.log('DESPUÉS:');
console.log(`Fila 1: ${data[0]['FECHA ALTA']} (formato fecha)\n`);

// Guardar Excel con formato de fecha
const newWb = XLSX.utils.book_new();
const newWs = XLSX.utils.json_to_sheet(data);

// Aplicar formato de fecha a la columna
// Encontrar la columna de FECHA ALTA
const headers = Object.keys(data[0]);
const fechaColIndex = headers.indexOf('FECHA ALTA');

if (fechaColIndex >= 0) {
  // Aplicar formato de fecha a todas las celdas de la columna
  for (let i = 1; i <= data.length; i++) {
    const cellRef = XLSX.utils.encode_col(fechaColIndex) + (i + 1);
    if (newWs[cellRef]) {
      newWs[cellRef].z = 'yyyy-mm-dd'; // Formato de fecha
    }
  }
}

XLSX.utils.book_append_sheet(newWb, newWs, 'SOCIOS_ENERO_2026');
XLSX.writeFile(newWb, excelPath);

console.log('='.repeat(90));
console.log(`\n✅ ${convertidas} fecha(s) convertida(s) a formato correcto\n`);

process.exit(0);

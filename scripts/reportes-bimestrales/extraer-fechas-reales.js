#!/usr/bin/env node

/**
 * extraer-fechas-reales.js
 * Extrae fechas de ALTA de la hoja ANEXO A en archivos USB
 */

import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dicFile = path.join(__dirname, '../../data/referencias/2025-dic-usb-738/CLUB 738-31-DE-DICIEMBRE-2025_ANEXOS A, B Y C_CORREGIDO_FINAL.xlsx');

console.log('\n📅 EXTRAYENDO FECHAS de ANEXO A\n');
console.log('='.repeat(90) + '\n');

try {
  const wb = XLSX.readFile(dicFile);
  
  console.log('Hojas disponibles:', wb.SheetNames);
  
  // Buscar hoja "ANEXO A"
  const anexoASheet = wb.SheetNames.find(name => name.includes('ANEXO A') || name.includes('Anexo A'));
  
  if (!anexoASheet) {
    console.error('❌ No se encontró hoja "ANEXO A"');
    console.log('Hojas disponibles:', wb.SheetNames);
    process.exit(1);
  }
  
  console.log(`✅ Encontrada hoja: "${anexoASheet}"\n`);
  
  const ws = wb.Sheets[anexoASheet];
  const data = XLSX.utils.sheet_to_json(ws);
  
  console.log(`Total de registros en ANEXO A: ${data.length}\n`);
  
  // Ver primeros registros
  console.log('Primeros 5 registros:');
  data.slice(0, 5).forEach((row, i) => {
    const keys = Object.keys(row);
    console.log(`\nRegistro ${i + 1}:`);
    keys.slice(0, 5).forEach(key => {
      console.log(`  ${key}: ${row[key]}`);
    });
  });
  
  // Buscar columna con fechas
  console.log('\n' + '='.repeat(90));
  console.log('\nBuscando columna de fechas...\n');
  
  const firstRow = data[0];
  const keys = Object.keys(firstRow);
  
  console.log('Columnas disponibles:');
  keys.forEach(key => {
    const valor = firstRow[key];
    console.log(`  • ${key}: ${valor}`);
  });
  
  // Crear mapa de socios con sus fechas
  console.log('\n' + '='.repeat(90));
  console.log('\nMap de SOCIOS → FECHAS DE ALTA:\n');
  
  const sociosFechas = {};
  data.forEach(row => {
    // Buscar email o nombre de socio
    const keys = Object.keys(row);
    let email = null;
    let nombre = null;
    let fecha = null;
    
    keys.forEach(key => {
      const valor = row[key];
      if (key.toLowerCase().includes('email') || key.toLowerCase().includes('correo')) {
        email = valor;
      }
      if (key.toLowerCase().includes('nombre') || key.toLowerCase().includes('socio')) {
        nombre = valor;
      }
      if (key.toLowerCase().includes('fecha') || key.toLowerCase().includes('alta') || key.toLowerCase().includes('registro')) {
        fecha = valor;
      }
    });
    
    if (email || nombre) {
      const key = email || nombre;
      sociosFechas[key] = { nombre, fecha };
    }
  });
  
  // Mostrar algunos ejemplos
  const ejemplos = Object.entries(sociosFechas).slice(0, 5);
  ejemplos.forEach(([key, datos]) => {
    console.log(`  ${key}`);
    console.log(`    → Nombre: ${datos.nombre}`);
    console.log(`    → Fecha: ${datos.fecha}\n`);
  });
  
  console.log('='.repeat(90) + '\n');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

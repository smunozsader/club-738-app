#!/usr/bin/env node

/**
 * sincronizar-fechas-reales.js
 * Sincroniza fechas reales desde ANEXO A (diciembre 2025) hacia FUENTE_DE_VERDAD
 */

import XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const anexoFile = path.join(__dirname, '../../data/referencias/2025-dic-usb-738/CLUB 738-31-DE-DICIEMBRE-2025_ANEXOS A, B Y C.xlsx');
const fuenteFile = path.join(__dirname, '../../data/referencias/socios/FUENTE_DE_VERDAD_CLUB_738_ENERO_2026.xlsx');

console.log('\n📅 SINCRONIZAR FECHAS desde ANEXO A\n');
console.log('='.repeat(90) + '\n');

// Función para convertir serial de Excel a fecha
function excelSerialToDate(serial) {
  if (!serial || typeof serial !== 'number') return null;
  const excelEpoch = new Date(1900, 0, 1);
  const date = new Date(excelEpoch.getTime() + (serial - 1) * 24 * 60 * 60 * 1000);
  const año = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const día = String(date.getDate()).padStart(2, '0');
  return `${año}-${mes}-${día}`;
}

try {
  // Leer ANEXO A para extraer fechas
  console.log('Paso 1: Leyendo ANEXO A...\n');
  
  const wbAnexo = XLSX.readFile(anexoFile);
  const wsAnexo = wbAnexo.Sheets['Anexo A'];
  
  const sociosFechas = {};
  
  // Buscar donde empiezan los datos (buscamos la fila con headers)
  let startRow = 6;
  for (let row = 1; row <= 20; row++) {
    const cellA = wsAnexo['A' + row];
    if (cellA && cellA.v && cellA.v.includes('No. DE REGISTRO')) {
      startRow = row + 1;
      break;
    }
  }
  
  console.log(`Datos comienzan en fila ${startRow}\n`);
  
  // Leer datos
  let row = startRow;
  while (true) {
    const cellE = wsAnexo['E' + row]; // EMAIL en columna E
    const cellI = wsAnexo['I' + row]; // FECHA ALTA en columna I
    
    if (!cellE && !cellI) break; // Si no hay datos, terminamos
    
    const email = (cellE ? (cellE.v || cellE.w || '').toString().toLowerCase().trim() : null);
    const fechaSerial = cellI ? cellI.v : null;
    const fechaFormato = excelSerialToDate(fechaSerial);
    
    if (email && email.includes('@') && fechaFormato) {
      sociosFechas[email] = {
        fechaSerial,
        fechaFormato
      };
    }
    
    row++;
  }
  
  console.log(`✅ Extraídas ${Object.keys(sociosFechas).length} fechas de ANEXO A\n`);
  
  // Mostrar ejemplos
  console.log('Ejemplos de fechas extraídas:');
  Object.entries(sociosFechas).slice(0, 5).forEach(([email, datos]) => {
    console.log(`  ${email}`);
    console.log(`    → Fecha: ${datos.fechaFormato} (serial: ${datos.fechaSerial})\n`);
  });
  
  // Leer FUENTE DE VERDAD
  console.log('Paso 2: Leyendo FUENTE DE VERDAD...\n');
  
  const wbFuente = XLSX.readFile(fuenteFile);
  const wsFuente = wbFuente.Sheets[wbFuente.SheetNames[0]];
  const dataFuente = XLSX.utils.sheet_to_json(wsFuente);
  
  console.log(`✅ Leídos ${dataFuente.length} registros de FUENTE DE VERDAD\n`);
  
  // Sincronizar fechas
  console.log('Paso 3: Sincronizando fechas...\n');
  
  let actualizadas = 0;
  dataFuente.forEach(fila => {
    const email = (fila.EMAIL || '').toLowerCase().trim();
    if (email && sociosFechas[email]) {
      fila['FECHA ALTA'] = sociosFechas[email].fechaFormato;
      actualizadas++;
    }
  });
  
  console.log(`✅ Actualizadas ${actualizadas} fechas\n`);
  
  // Guardar FUENTE DE VERDAD
  console.log('Paso 4: Guardando FUENTE DE VERDAD actualizado...\n');
  
  const newWb = XLSX.utils.book_new();
  const newWs = XLSX.utils.json_to_sheet(dataFuente);
  XLSX.utils.book_append_sheet(newWb, newWs, 'SOCIOS_ENERO_2026');
  XLSX.writeFile(newWb, fuenteFile);
  
  console.log('='.repeat(90));
  console.log(`\n✅ SINCRONIZACIÓN COMPLETADA\n`);
  console.log(`   • Fechas extraídas: ${Object.keys(sociosFechas).length}`);
  console.log(`   • Fechas sincronizadas: ${actualizadas}\n`);
  
  process.exit(0);

} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}

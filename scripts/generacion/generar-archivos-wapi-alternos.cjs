/**
 * Crear Excel de PRUEBA (5 contactos) + archivo de números separados por coma
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '../emails-socios/whatsapp-difusion-portal.csv');
const EXCEL_PRUEBA_PATH = path.join(__dirname, '../emails-socios/wapi-prueba-5-socios.xlsx');
const NUMEROS_TXT_PATH = path.join(__dirname, '../emails-socios/numeros-whatsapp.txt');

console.log('🔄 Generando archivos alternativos...\n');

try {
  // Leer CSV
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = csvContent.trim().split('\n');
  
  // Parsear todas las líneas
  const allData = lines.map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  });
  
  // 1. EXCEL DE PRUEBA (header + 5 socios)
  const pruebaData = allData.slice(0, 6); // Header + 5 socios
  const wbPrueba = XLSX.utils.book_new();
  const wsPrueba = XLSX.utils.aoa_to_sheet(pruebaData);
  wsPrueba['!cols'] = [
    { wch: 15 }, { wch: 15 }, { wch: 40 }, 
    { wch: 35 }, { wch: 15 }, { wch: 10 }
  ];
  XLSX.utils.book_append_sheet(wbPrueba, wsPrueba, 'Socios');
  XLSX.writeFile(wbPrueba, EXCEL_PRUEBA_PATH);
  console.log(`✅ Excel de prueba: wapi-prueba-5-socios.xlsx (5 socios)`);
  
  // 2. NÚMEROS SEPARADOS POR COMA (sin header, solo números)
  const numeros = allData.slice(1).map(row => row[0]).join(',');
  fs.writeFileSync(NUMEROS_TXT_PATH, numeros, 'utf-8');
  console.log(`✅ Números separados por coma: numeros-whatsapp.txt (73 números)`);
  
  console.log('\n📋 CONTENIDO DEL ARCHIVO DE NÚMEROS:');
  console.log(numeros.substring(0, 150) + '...');
  
  console.log('\n🎯 Archivos listos:');
  console.log('   1. wapi-prueba-5-socios.xlsx (para probar)');
  console.log('   2. numeros-whatsapp.txt (copiar/pegar)');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

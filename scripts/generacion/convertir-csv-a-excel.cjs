/**
 * Convertir CSV a Excel para WAPI Sender
 * Input: whatsapp-difusion-portal.csv
 * Output: whatsapp-difusion-portal.xlsx
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '../emails-socios/whatsapp-difusion-portal.csv');
const EXCEL_PATH = path.join(__dirname, '../emails-socios/whatsapp-difusion-portal.xlsx');

console.log('🔄 Convirtiendo CSV a Excel para WAPI Sender...\n');

try {
  // Leer CSV
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  
  // Parsear CSV manualmente para preservar UTF-8
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  const data = lines.map(line => {
    // Parsear CSV respetando comillas
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
  
  console.log(`✅ CSV leído: ${data.length} líneas`);
  console.log(`   Columnas: ${headers.join(', ')}`);
  
  // Crear workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);
  
  // Ajustar anchos de columna
  ws['!cols'] = [
    { wch: 15 }, // phone
    { wch: 15 }, // First Name
    { wch: 40 }, // name
    { wch: 35 }, // email
    { wch: 15 }, // password
    { wch: 10 }  // credencial
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Socios');
  
  // Guardar Excel
  XLSX.writeFile(wb, EXCEL_PATH);
  
  console.log(`\n✅ Excel generado: ${EXCEL_PATH}`);
  console.log(`   ${data.length - 1} socios (+ 1 header)`);
  console.log('\n🎯 Listo para WAPI Sender!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

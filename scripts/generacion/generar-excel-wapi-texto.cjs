/**
 * Generar Excel con números como TEXTO para WAPI Sender
 * Previene que Excel elimine el signo +
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '../emails-socios/whatsapp-difusion-portal.csv');
const EXCEL_PATH = path.join(__dirname, '../emails-socios/WAPI-Sender-TEXTO.xlsx');

console.log('🔄 Generando Excel con formato TEXTO para números...\n');

try {
  // Leer CSV
  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const lines = csvContent.trim().split('\n');
  
  // Parsear CSV
  const parsedData = lines.map(line => {
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
  
  // Crear workbook vacío
  const wb = XLSX.utils.book_new();
  
  // Preparar datos
  const wapiData = [
    ['WhatsApp Number(with country code)', 'First Name', 'name', 'email', 'password', 'credencial']
  ];
  
  for (let i = 1; i < parsedData.length; i++) {
    const [phone, firstName, name, email, password, credencial] = parsedData[i];
    const phoneFormatted = '+' + phone;
    
    wapiData.push([
      phoneFormatted,
      firstName,
      name,
      email,
      password,
      credencial
    ]);
  }
  
  // Crear worksheet
  const ws = XLSX.utils.aoa_to_sheet(wapiData);
  
  // FORZAR FORMATO DE TEXTO para la columna de teléfonos
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const cellAddress = XLSX.utils.encode_cell({ r: R, c: 0 });
    if (!ws[cellAddress]) continue;
    
    // Forzar formato de texto con apóstrofe
    ws[cellAddress].t = 's'; // String
    ws[cellAddress].v = String(ws[cellAddress].v); // Convertir a string
  }
  
  // Ajustar anchos
  ws['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 40 },
    { wch: 35 },
    { wch: 15 },
    { wch: 10 }
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, EXCEL_PATH, { cellStyles: true });
  
  console.log(`✅ Excel generado: WAPI-Sender-TEXTO.xlsx`);
  console.log(`   ${wapiData.length - 1} socios con números como TEXTO`);
  console.log('\n🎯 Números preservados con formato de texto');
  console.log('\nPRIMEROS 3 NÚMEROS:');
  for (let i = 1; i <= 3; i++) {
    console.log(`   ${i}. ${wapiData[i][0]} - ${wapiData[i][1]}`);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

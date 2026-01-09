/**
 * Generar Excel compatible con WAPI Sender (formato oficial)
 * Basado en WAPlusSenderTemplate1.xlsx
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '../emails-socios/whatsapp-difusion-portal.csv');
const EXCEL_WAPI_PATH = path.join(__dirname, '../emails-socios/WAPI-Sender-Difusion-Portal.xlsx');

console.log('🔄 Generando Excel compatible con WAPI Sender...\n');

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
  
  // Convertir al formato WAPI Sender
  // Formato: WhatsApp Number(with country code), First Name, name, email, password, credencial
  const wapiData = [
    // Header según template oficial
    ['WhatsApp Number(with country code)', 'First Name', 'name', 'email', 'password', 'credencial']
  ];
  
  // Agregar socios (saltar header del CSV)
  for (let i = 1; i < parsedData.length; i++) {
    const [phone, firstName, name, email, password, credencial] = parsedData[i];
    
    // Convertir número: 529999490494 → +529999490494
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
  
  console.log(`✅ Datos procesados: ${wapiData.length - 1} socios`);
  console.log(`   Formato de número: ${wapiData[1][0]} (con +)`);
  
  // Crear workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wapiData);
  
  // Ajustar anchos de columna
  ws['!cols'] = [
    { wch: 25 }, // WhatsApp Number(with country code)
    { wch: 15 }, // First Name
    { wch: 40 }, // name
    { wch: 35 }, // email
    { wch: 15 }, // password
    { wch: 10 }  // credencial
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, EXCEL_WAPI_PATH);
  
  console.log(`\n✅ Excel generado: WAPI-Sender-Difusion-Portal.xlsx`);
  console.log(`   ${wapiData.length - 1} socios con formato WAPI oficial`);
  console.log('\n🎯 Listo para WAPI Sender!');
  console.log('\nPRIMEROS 3 SOCIOS:');
  for (let i = 1; i <= 3; i++) {
    console.log(`   ${i}. ${wapiData[i][0]} - ${wapiData[i][1]}`);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

/**
 * Generador de Checklist Completa de Envío
 * 
 * Genera una checklist imprimible con todos los socios
 * para llevar control manual del envío.
 */

const fs = require('fs');
const path = require('path');

// Leer el CSV de socios
const csvPath = path.join(__dirname, '../emails-socios/whatsapp-difusion-portal.csv');
const outputPath = path.join(__dirname, '../emails-socios/checklist-envio-whatsapp.txt');

console.log('📋 Generador de Checklist de Envío\n');

// Leer y parsear CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Saltar header y parsear
const socios = lines.slice(1).map(line => {
  const parts = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current.trim());
  
  return {
    phone: parts[0] || '',
    firstName: parts[1] || '',
    name: parts[2] || '',
    email: parts[3] || '',
    credencial: parts[5] || ''
  };
});

console.log(`✅ ${socios.length} socios cargados\n`);

// Generar checklist
let output = '';
output += '═══════════════════════════════════════════════════════════════════════════════\n';
output += '                    CHECKLIST DE ENVÍO - DIFUSIÓN PORTAL CLUB 738\n';
output += '═══════════════════════════════════════════════════════════════════════════════\n\n';
output += `Fecha inicio: _____/_____/2026          Hora: _____:_____\n`;
output += `Fecha fin:    _____/_____/2026          Hora: _____:_____\n\n`;
output += `Total socios: ${socios.length}\n`;
output += `Enviados:     _____ / ${socios.length}\n`;
output += `Pendientes:   _____ / ${socios.length}\n\n`;
output += '═══════════════════════════════════════════════════════════════════════════════\n\n';

// Tabla de socios
output += '┌────┬────────────────────────────────────────────────┬──────────────┬──────┬───────┐\n';
output += '│ #  │ NOMBRE                                         │ TELÉFONO     │ CRED │   ✓   │\n';
output += '├────┼────────────────────────────────────────────────┼──────────────┼──────┼───────┤\n';

socios.forEach((socio, index) => {
  const num = (index + 1).toString().padStart(2, '0');
  const nombre = socio.name.substring(0, 46).padEnd(46);
  const telefono = socio.phone.substring(0, 12).padEnd(12);
  const cred = socio.credencial.padStart(4);
  
  output += `│ ${num} │ ${nombre} │ ${telefono} │ ${cred} │  ☐    │\n`;
});

output += '└────┴────────────────────────────────────────────────┴──────────────┴──────┴───────┘\n\n';

output += '═══════════════════════════════════════════════════════════════════════════════\n';
output += '                                   NOTAS / ERRORES\n';
output += '═══════════════════════════════════════════════════════════════════════════════\n\n';

for (let i = 1; i <= 10; i++) {
  output += `${i}. _______________________________________________________________________\n\n`;
}

output += '═══════════════════════════════════════════════════════════════════════════════\n';
output += '                                  RESUMEN FINAL\n';
output += '═══════════════════════════════════════════════════════════════════════════════\n\n';
output += `Enviados exitosos:     _____ / ${socios.length}\n`;
output += `Errores/Rebotes:       _____ / ${socios.length}\n`;
output += `Sin WhatsApp:          _____ / ${socios.length}\n`;
output += `Pendientes:            _____ / ${socios.length}\n\n`;
output += `Responsable: _________________________________\n`;
output += `Firma:       _________________________________\n\n`;

// Guardar
fs.writeFileSync(outputPath, output, 'utf-8');

console.log('✅ Checklist generada exitosamente:');
console.log('   ' + outputPath);
console.log('\n📄 Puedes imprimirla o usarla en pantalla para llevar control.');

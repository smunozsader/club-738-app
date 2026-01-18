/**
 * Generador de Mensajes Individualizados para WhatsApp
 * 
 * Genera mensajes personalizados listos para copiar y pegar
 * manualmente en WhatsApp Web o App.
 * 
 * Uso:
 *   node scripts/generar-mensajes-individuales.cjs
 * 
 * Salida:
 *   emails-socios/mensajes-individuales-whatsapp.txt
 */

const fs = require('fs');
const path = require('path');

// Leer el CSV de socios
const csvPath = path.join(__dirname, '../emails-socios/whatsapp-difusion-portal.csv');
const outputPath = path.join(__dirname, '../emails-socios/mensajes-individuales-whatsapp.txt');

console.log('📱 Generador de Mensajes Individualizados para WhatsApp\n');

// Leer y parsear CSV
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Saltar header
const socios = lines.slice(1).map(line => {
  // Parsear CSV manualmente
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
  parts.push(current.trim()); // último campo
  
  return {
    phone: parts[0] || '',
    firstName: parts[1] || '',
    name: parts[2] || '',
    email: parts[3] || '',
    password: parts[4] || '',
    credencial: parts[5] || ''
  };
});

console.log(`✅ ${socios.length} socios cargados del CSV\n`);

// Generar mensajes
let output = '';
output += '═══════════════════════════════════════════════════════════════\n';
output += '  MENSAJES INDIVIDUALIZADOS - DIFUSIÓN PORTAL CLUB 738\n';
output += '  Generado: ' + new Date().toLocaleString('es-MX') + '\n';
output += '  Total: ' + socios.length + ' socios\n';
output += '═══════════════════════════════════════════════════════════════\n\n';

socios.forEach((socio, index) => {
  const mensaje = `Hola ${socio.firstName} 👋

El *Club de Caza, Tiro y Pesca de Yucatán, A.C.* estrena portal web:

🌐 *yucatanctp.org*

🔐 TUS CREDENCIALES:
• Usuario: ${socio.email}
• Contraseña: ${socio.password}
• Credencial: #${socio.credencial}

📋 DESDE EL PORTAL PUEDES:
✅ Generar tu expediente electrónico PETA
✅ Subir tus documentos digitales
✅ Solicitar trámites de transportación
✅ Consultar tus armas registradas
✅ Ver calendario de tiradas 2026

💰 *RENOVACIÓN 2026*: $6,000 MXN
Incluye: Tramitación de 1 PETA ante 32 ZM SEDENA

💳 *DERECHOS SEDENA (PAGO APARTE)*:
• Formato 045: $1,819 (hasta 3 armas)
• Formato 046: $604 (por cada arma adicional)
• Se pagan con hojas de ayuda E5cinco

📤 *COMPLETA TU EXPEDIENTE DIGITAL*:
Sube tus documentos para agilizar trámites

⚠️ *Cambia tu contraseña al entrar*
(Menú → Mi Perfil)

📞 Dudas o para renovar: Responde este mensaje

Saludos
MVZ Sergio Muñoz de Alba Medrano
Secretario del Club de Caza, Tiro y Pesca de Yucatán, A.C.`;

  output += `┌─────────────────────────────────────────────────────────────┐\n`;
  output += `│ ${(index + 1).toString().padStart(2, '0')}/73 - ${socio.name.substring(0, 45).padEnd(45)} │\n`;
  output += `│ 📱 ${socio.phone.padEnd(55)} │\n`;
  output += `└─────────────────────────────────────────────────────────────┘\n\n`;
  output += mensaje;
  output += '\n\n';
  output += '─────────────────────────────────────────────────────────────\n';
  output += '  [COPIAR TODO EL MENSAJE DE ARRIBA Y PEGAR EN WHATSAPP]\n';
  output += '─────────────────────────────────────────────────────────────\n\n\n';
});

output += '\n═══════════════════════════════════════════════════════════════\n';
output += '  FIN DE MENSAJES - ' + socios.length + ' mensajes generados\n';
output += '═══════════════════════════════════════════════════════════════\n';

// Guardar archivo
fs.writeFileSync(outputPath, output, 'utf-8');

console.log('✅ Archivo generado exitosamente:');
console.log('   ' + outputPath);
console.log('');
console.log('📋 Instrucciones de uso:');
console.log('   1. Abre el archivo mensajes-individuales-whatsapp.txt');
console.log('   2. Para cada socio:');
console.log('      • Copia el mensaje completo (desde "Hola" hasta firma)');
console.log('      • Abre WhatsApp Web o App');
console.log('      • Busca el contacto por teléfono o nombre');
console.log('      • Pega el mensaje');
console.log('      • Envía');
console.log('   3. Repite para los 73 socios');
console.log('');
console.log('💡 Tip: Puedes usar WhatsApp Web en computadora para');
console.log('   copiar y pegar más rápido.');
console.log('');

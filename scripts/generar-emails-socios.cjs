const fs = require('fs');
const path = require('path');

// Leer CSV de credenciales
const credencialesPath = path.join(__dirname, '../data/socios/credenciales_socios.csv');
const csvContent = fs.readFileSync(credencialesPath, 'utf-8');

// Parsear CSV
const lines = csvContent.split('\n').filter(line => line.trim());
const socios = [];

for (let i = 1; i < lines.length; i++) { // Saltar header
  const line = lines[i];
  const match = line.match(/^(\d+),(\d+),(.*?),(.*?),(.*)$/);
  
  if (match) {
    const [, no, credencial, nombre, email, password] = match;
    socios.push({
      no,
      credencial,
      nombre: nombre.trim(),
      email: email.trim(),
      password: password.trim()
    });
  }
}

console.log(`✅ ${socios.length} socios encontrados\n`);

// Template HTML del email
function generarEmailHTML(socio) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a YucatanCTP</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Club de Caza, Tiro y Pesca de Yucatán, A.C.</h1>
              <p style="color: #c8e6c9; margin: 10px 0 0 0; font-size: 14px;">SEDENA 738 • FEMETI YUC-05/2020</p>
            </td>
          </tr>
          
          <!-- Contenido -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1a472a; margin: 0 0 20px 0; font-size: 22px;">¡Bienvenido a nuestro nuevo portal web!</h2>
              
              <p style="color: #333333; line-height: 1.6; margin: 0 0 15px 0;">Estimado/a <strong>${socio.nombre}</strong>,</p>
              
              <p style="color: #333333; line-height: 1.6; margin: 0 0 15px 0;">
                Nos complace informarte que el Club 738 cuenta ahora con un nuevo portal web profesional en el dominio:
              </p>
              
              <div style="background-color: #e8f5e9; border-left: 4px solid #2d5a3d; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; text-align: center;">
                  <a href="https://yucatanctp.org" style="color: #1a472a; font-size: 24px; font-weight: bold; text-decoration: none;">yucatanctp.org</a>
                </p>
              </div>
              
              <h3 style="color: #1a472a; margin: 30px 0 15px 0; font-size: 18px;">🔐 Tus Credenciales de Acceso</h3>
              
              <table width="100%" cellpadding="12" cellspacing="0" border="0" style="background-color: #f9f9f9; border-radius: 4px; margin: 15px 0;">
                <tr>
                  <td style="color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;"><strong>Credencial:</strong></td>
                  <td style="color: #333333; font-size: 14px; border-bottom: 1px solid #e0e0e0;"><strong>${socio.credencial}</strong></td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px; border-bottom: 1px solid #e0e0e0;"><strong>Email:</strong></td>
                  <td style="color: #333333; font-size: 14px; border-bottom: 1px solid #e0e0e0;">${socio.email}</td>
                </tr>
                <tr>
                  <td style="color: #666666; font-size: 14px;"><strong>Contraseña:</strong></td>
                  <td style="color: #d32f2f; font-size: 16px; font-family: 'Courier New', monospace;"><strong>${socio.password}</strong></td>
                </tr>
              </table>
              
              <div style="background-color: #fff3e0; border-left: 4px solid #ff9800; padding: 12px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #e65100; font-size: 13px;">
                  ⚠️ <strong>Importante:</strong> Por tu seguridad, te recomendamos cambiar tu contraseña después de tu primer acceso.
                </p>
              </div>
              
              <h3 style="color: #1a472a; margin: 30px 0 15px 0; font-size: 18px;">📋 Funcionalidades del Portal</h3>
              
              <ul style="color: #333333; line-height: 1.8; padding-left: 20px;">
                <li><strong>Mi Expediente Digital:</strong> Gestiona todos tus documentos para trámites PETA</li>
                <li><strong>Mis Armas:</strong> Consulta tu registro de armas</li>
                <li><strong>Solicitar PETA:</strong> Tramita permisos de transportación de armas</li>
                <li><strong>Calendario de Tiradas:</strong> Consulta competencias 2026</li>
                <li><strong>Calculadora PCP:</strong> Calcula energía cinética de rifles de aire</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://yucatanctp.org" style="display: inline-block; background-color: #2d5a3d; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                  Acceder al Portal
                </a>
              </div>
              
              <p style="color: #666666; line-height: 1.6; margin: 30px 0 0 0; font-size: 13px;">
                Si tienes problemas para acceder o necesitas asistencia, contacta al secretario del club.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666666; margin: 0 0 10px 0; font-size: 13px;">
                <strong>Club de Caza, Tiro y Pesca de Yucatán, A.C.</strong>
              </p>
              <p style="color: #999999; margin: 0 0 5px 0; font-size: 12px;">
                Calle 50 No. 531-E x 69 y 71, Centro, 97000 Mérida, Yucatán
              </p>
              <p style="color: #999999; margin: 0 0 5px 0; font-size: 12px;">
                Tel: +52 56 6582 4667 • Email: tiropracticoyucatan@gmail.com
              </p>
              <p style="color: #999999; margin: 10px 0 0 0; font-size: 11px;">
                SEDENA 738 • FEMETI YUC-05/2020 • SEMARNAT-CLUB-CIN-005-YUC-05
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Template de texto plano (fallback)
function generarEmailTexto(socio) {
  return `CLUB DE CAZA, TIRO Y PESCA DE YUCATÁN, A.C.
SEDENA 738 • FEMETI YUC-05/2020

¡Bienvenido a nuestro nuevo portal web!

Estimado/a ${socio.nombre},

Nos complace informarte que el Club 738 cuenta ahora con un nuevo portal web profesional en:

🌐 https://yucatanctp.org

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 TUS CREDENCIALES DE ACCESO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Credencial:  ${socio.credencial}
Email:       ${socio.email}
Contraseña:  ${socio.password}

⚠️ IMPORTANTE: Por tu seguridad, te recomendamos cambiar tu contraseña después de tu primer acceso.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 FUNCIONALIDADES DEL PORTAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Mi Expediente Digital: Gestiona todos tus documentos para trámites PETA
• Mis Armas: Consulta tu registro de armas
• Solicitar PETA: Tramita permisos de transportación de armas
• Calendario de Tiradas: Consulta competencias 2026
• Calculadora PCP: Calcula energía cinética de rifles de aire

Accede ahora: https://yucatanctp.org

Si tienes problemas para acceder o necesitas asistencia, contacta al secretario del club.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Club de Caza, Tiro y Pesca de Yucatán, A.C.
Calle 50 No. 531-E x 69 y 71, Centro, 97000 Mérida, Yucatán
Tel: +52 56 6582 4667 • Email: tiropracticoyucatan@gmail.com
SEDENA 738 • FEMETI YUC-05/2020 • SEMARNAT-CLUB-CIN-005-YUC-05`;
}

// Crear carpeta de salida
const outputDir = path.join(__dirname, '../emails-socios');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generar archivos HTML para cada socio
socios.forEach(socio => {
  const htmlContent = generarEmailHTML(socio);
  const textoContent = generarEmailTexto(socio);
  
  const filenameHTML = `${socio.credencial.padStart(3, '0')}-${socio.nombre.replace(/\s+/g, '_')}.html`;
  const filenameTXT = `${socio.credencial.padStart(3, '0')}-${socio.nombre.replace(/\s+/g, '_')}.txt`;
  
  fs.writeFileSync(path.join(outputDir, filenameHTML), htmlContent);
  fs.writeFileSync(path.join(outputDir, filenameHTML.replace('.html', '.txt')), textoContent);
});

console.log(`✅ ${socios.length * 2} archivos generados en: emails-socios/`);
console.log(`   ${socios.length} archivos HTML`);
console.log(`   ${socios.length} archivos TXT`);

// Generar lista de emails para mail merge
const mailMergeData = socios.map(s => ({
  email: s.email,
  nombre: s.nombre,
  credencial: s.credencial,
  password: s.password
}));

fs.writeFileSync(
  path.join(outputDir, 'mail-merge-data.json'),
  JSON.stringify(mailMergeData, null, 2)
);

console.log(`\n✅ Archivo mail-merge-data.json generado`);

// Generar CSV para Gmail Mail Merge
const csvLines = ['Email,Nombre,Credencial,Password'];
socios.forEach(s => {
  csvLines.push(`${s.email},"${s.nombre}",${s.credencial},${s.password}`);
});

fs.writeFileSync(
  path.join(outputDir, 'mail-merge-data.csv'),
  csvLines.join('\n')
);

console.log(`✅ Archivo mail-merge-data.csv generado para Gmail\n`);

console.log('═══════════════════════════════════════════════════════════');
console.log('📧 INSTRUCCIONES PARA ENVIAR EMAILS:');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('OPCIÓN A: Gmail Mail Merge (Recomendado - Personalizado)');
console.log('1. Instala extensión "Yet Another Mail Merge" en Chrome');
console.log('2. Abre Gmail → Redactar nuevo mensaje');
console.log('3. Asunto: "Bienvenido al nuevo portal YucatanCTP - Tus credenciales"');
console.log('4. Cuerpo: Usa el template HTML o TXT de emails-socios/');
console.log('5. Variables: {{Email}}, {{Nombre}}, {{Credencial}}, {{Password}}');
console.log('6. Importa: emails-socios/mail-merge-data.csv');
console.log('7. Envía en lotes de 20-30 cada hora (evitar spam)\n');

console.log('OPCIÓN B: Envío Manual Individual');
console.log('1. Abre cada archivo HTML en emails-socios/');
console.log('2. Copia el contenido completo');
console.log('3. Pega en Gmail como email nuevo');
console.log('4. Envía a cada socio\n');

console.log('OPCIÓN C: Script Automático (Node.js + Nodemailer)');
console.log('1. Configura credenciales de Gmail SMTP');
console.log('2. Ejecuta script de envío masivo');
console.log('3. (Te puedo crear este script si lo necesitas)\n');

console.log('═══════════════════════════════════════════════════════════');

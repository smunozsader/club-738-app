/**
 * Generar mensajes WhatsApp SEGMENTADOS (General vs Morosos)
 * Basado en los mismos CSVs que el email campaign (datos correctos)
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

console.log('\n📱 GENERADOR DE MENSAJES WHATSAPP SEGMENTADOS');
console.log('═'.repeat(80));

async function generarWhatsAppSegmentado() {
  try {
    // 1. Leer CSVs de email campaign (datos correctos)
    const generalPath = path.join(__dirname, '../emails-socios/mail-merge-general.csv');
    const morososPath = path.join(__dirname, '../emails-socios/morosos-2025-mail-merge.csv');
    
    const generalLines = fs.readFileSync(generalPath, 'utf-8').split('\n').filter(line => line.trim());
    const morososLines = fs.readFileSync(morososPath, 'utf-8').split('\n').filter(line => line.trim());
    
    // Crear sets de emails
    const sociosGeneral = new Set();
    const sociosMorosos = new Set();
    
    // Parsear general (Email,Nombre,Credencial,Password)
    for (let i = 1; i < generalLines.length; i++) {
      const parts = generalLines[i].split(',');
      if (parts.length >= 2) {
        sociosGeneral.add(parts[0].trim().toLowerCase());
      }
    }
    
    // Parsear morosos (Nombre,Email,Credencial,Password)
    for (let i = 1; i < morososLines.length; i++) {
      const parts = morososLines[i].split(',');
      if (parts.length >= 2) {
        // Email es la segunda columna
        sociosMorosos.add(parts[1].trim().toLowerCase());
      }
    }
    
    console.log(`✓ Socios al corriente: ${sociosGeneral.size}`);
    console.log(`✓ Socios morosos 2025: ${sociosMorosos.size}`);
    
    // 2. Leer credenciales completas
    const credencialesPath = path.join(__dirname, '../data/socios/credenciales_socios.csv');
    const csvContent = fs.readFileSync(credencialesPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    const credenciales = {};
    for (let i = 1; i < lines.length; i++) {
      const match = lines[i].match(/^(\d+),(\d+),(.*?),(.*?),(.*)$/);
      if (match) {
        const [, no, credencial, nombre, email, password] = match;
        credenciales[email.trim().toLowerCase()] = {
          no,
          credencial,
          nombre: nombre.trim(),
          email: email.trim(),
          password: password.trim()
        };
      }
    }
    
    console.log(`✓ ${Object.keys(credenciales).length} credenciales cargadas`);
    
    // 3. Obtener teléfonos de Firestore
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.get();
    
    const generalConTelefono = [];
    const morososConTelefono = [];
    const sinTelefono = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const email = doc.id.toLowerCase();
      const credencial = credenciales[email];
      
      if (!credencial) {
        console.log(`  ⚠️  Email en Firestore pero no en credenciales: ${email}`);
        return;
      }
      
      const telefono = data.telefono?.replace(/\D/g, '');
      const nombreCorto = credencial.nombre.split(' ')[0];
      
      const socioData = {
        email,
        nombre: credencial.nombre,
        nombreCorto,
        credencial: credencial.credencial,
        password: credencial.password,
        telefono: telefono || ''
      };
      
      // Clasificar por segmento
      if (sociosMorosos.has(email)) {
        if (telefono && telefono.length === 10) {
          morososConTelefono.push(socioData);
        } else {
          sinTelefono.push({ ...socioData, segmento: 'moroso' });
        }
      } else if (sociosGeneral.has(email)) {
        if (telefono && telefono.length === 10) {
          generalConTelefono.push(socioData);
        } else {
          sinTelefono.push({ ...socioData, segmento: 'general' });
        }
      }
    });
    
    console.log(`\n📊 ESTADÍSTICAS POR SEGMENTO:`);
    console.log(`   General con teléfono:  ${generalConTelefono.length}`);
    console.log(`   Morosos con teléfono:  ${morososConTelefono.length}`);
    console.log(`   Sin teléfono:          ${sinTelefono.length}`);
    
    // 4. Generar CSV para WAPI Sender (GENERAL)
    const csvGeneral = ['phone,name,email,password,credencial'];
    generalConTelefono.forEach(socio => {
      const phoneFormatted = `52${socio.telefono}`;
      csvGeneral.push(`${phoneFormatted},"${socio.nombre}",${socio.email},${socio.password},${socio.credencial}`);
    });
    
    const csvGeneralPath = path.join(__dirname, '../emails-socios/whatsapp-general.csv');
    fs.writeFileSync(csvGeneralPath, csvGeneral.join('\n'), 'utf-8');
    console.log(`\n✅ CSV General: ${csvGeneralPath}`);
    console.log(`   ${generalConTelefono.length} socios`);
    
    // 5. Generar CSV para WAPI Sender (MOROSOS)
    const csvMorosos = ['phone,name,email,password,credencial'];
    morososConTelefono.forEach(socio => {
      const phoneFormatted = `52${socio.telefono}`;
      csvMorosos.push(`${phoneFormatted},"${socio.nombre}",${socio.email},${socio.password},${socio.credencial}`);
    });
    
    const csvMorososPath = path.join(__dirname, '../emails-socios/whatsapp-morosos.csv');
    fs.writeFileSync(csvMorososPath, csvMorosos.join('\n'), 'utf-8');
    console.log(`✅ CSV Morosos: ${csvMorososPath}`);
    console.log(`   ${morososConTelefono.length} socios`);
    
    // 6. Generar mensajes individuales .txt (GENERAL)
    const messagesGeneralDir = path.join(__dirname, '../emails-socios/mensajes-whatsapp-general');
    if (!fs.existsSync(messagesGeneralDir)) {
      fs.mkdirSync(messagesGeneralDir, { recursive: true });
    }
    
    generalConTelefono.forEach((socio, index) => {
      const mensaje = generarMensajeGeneral(socio);
      const filename = `${String(index + 1).padStart(3, '0')}-${socio.telefono}-${socio.nombreCorto}.txt`;
      const filepath = path.join(messagesGeneralDir, filename);
      fs.writeFileSync(filepath, mensaje, 'utf-8');
    });
    
    console.log(`✅ Mensajes .txt General: ${messagesGeneralDir}/`);
    console.log(`   ${generalConTelefono.length} archivos`);
    
    // 7. Generar mensajes individuales .txt (MOROSOS)
    const messagesMorososDir = path.join(__dirname, '../emails-socios/mensajes-whatsapp-morosos');
    if (!fs.existsSync(messagesMorososDir)) {
      fs.mkdirSync(messagesMorososDir, { recursive: true });
    }
    
    morososConTelefono.forEach((socio, index) => {
      const mensaje = generarMensajeMoroso(socio);
      const filename = `${String(index + 1).padStart(3, '0')}-${socio.telefono}-${socio.nombreCorto}.txt`;
      const filepath = path.join(messagesMorososDir, filename);
      fs.writeFileSync(filepath, mensaje, 'utf-8');
    });
    
    console.log(`✅ Mensajes .txt Morosos: ${messagesMorososDir}/`);
    console.log(`   ${morososConTelefono.length} archivos`);
    
    // 8. Generar templates WAPI Sender
    const templateGeneral = generarTemplateGeneral();
    const templateGeneralPath = path.join(__dirname, '../emails-socios/WAPI-Template-General.txt');
    fs.writeFileSync(templateGeneralPath, templateGeneral, 'utf-8');
    
    const templateMoroso = generarTemplateMoroso();
    const templateMorosoPath = path.join(__dirname, '../emails-socios/WAPI-Template-Morosos.txt');
    fs.writeFileSync(templateMorosoPath, templateMoroso, 'utf-8');
    
    console.log(`✅ Templates WAPI Sender generados`);
    
    // 9. Lista de socios sin teléfono
    if (sinTelefono.length > 0) {
      const sinTelefonoPath = path.join(__dirname, '../emails-socios/socios-sin-telefono.txt');
      const sinTelefonoContent = sinTelefono.map(s => 
        `${s.credencial.padStart(3, ' ')} - ${s.nombre} (${s.email}) - Segmento: ${s.segmento}`
      ).join('\n');
      
      fs.writeFileSync(sinTelefonoPath, 
        `SOCIOS SIN TELÉFONO (${sinTelefono.length})\n` +
        `═══════════════════════════════════════\n\n` +
        sinTelefonoContent,
        'utf-8'
      );
      
      console.log(`\n⚠️  Socios sin teléfono: ${sinTelefonoPath}`);
    }
    
    console.log(`\n${'═'.repeat(80)}`);
    console.log(`✅ ARCHIVOS LISTOS PARA ENVÍO SEGMENTADO`);
    console.log(`\n📧 GENERAL (${generalConTelefono.length} socios):`);
    console.log(`   - CSV: whatsapp-general.csv`);
    console.log(`   - Template: WAPI-Template-General.txt`);
    console.log(`   - Mensajes: mensajes-whatsapp-general/`);
    console.log(`\n🔴 MOROSOS 2025 (${morososConTelefono.length} socios):`);
    console.log(`   - CSV: whatsapp-morosos.csv`);
    console.log(`   - Template: WAPI-Template-Morosos.txt`);
    console.log(`   - Mensajes: mensajes-whatsapp-morosos/`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

function generarMensajeGeneral(socio) {
  return `Hola ${socio.nombreCorto} 👋

El *Club de Caza, Tiro y Pesca de Yucatán, A.C.* estrena portal web:

🌐 *yucatanctp.org*

🔐 TUS CREDENCIALES:
• Usuario: ${socio.email}
• Contraseña: ${socio.password}
• Credencial: #${socio.credencial}

📋 FUNCIONES:
✅ Expediente digital PETA
✅ Solicitar trámites
✅ Consultar tus armas
✅ Calendario tiradas 2026

⚠️ *Cambia tu contraseña al entrar*
(Menú → Mi Perfil)

📞 Dudas: Responde este mensaje

Saludos
MVZ Sergio Muñoz de Alba Medrano
Secretario del Club de Caza, Tiro y Pesca de Yucatán, A.C.`;
}

function generarMensajeMoroso(socio) {
  return `Hola ${socio.nombreCorto} 👋

Espero te encuentres bien.

📢 *IMPORTANTE - REGULARIZACIÓN 2026*

El Club implementa "Borrón y Cuenta Nueva":

✅ *Solo paga 2026* ($6,000 MXN)
✅ NO liquidar adeudos anteriores
✅ Acceso completo al portal web

🌐 *Portal: yucatanctp.org*

🔐 TUS CREDENCIALES:
• Usuario: ${socio.email}
• Contraseña: ${socio.password}
• Credencial: #${socio.credencial}

📋 BENEFICIOS DEL PORTAL:
✅ Expediente digital PETA
✅ Solicitar trámites
✅ Consultar tus armas
✅ Calendario tiradas 2026

💰 *CUOTA 2026*: $6,000 MXN
Incluye: 1 PETA gratis

📞 Para pagar o consultas: Responde este mensaje

Saludos
MVZ Sergio Muñoz de Alba Medrano
Secretario del Club de Caza, Tiro y Pesca de Yucatán, A.C.`;
}

function generarTemplateGeneral() {
  return `Hola {First Name} 👋

El *Club de Caza, Tiro y Pesca de Yucatán, A.C.* estrena portal web:

🌐 *yucatanctp.org*

🔐 TUS CREDENCIALES:
• Usuario: {Email}
• Contraseña: {Password}
• Credencial: #{Credencial}

📋 FUNCIONES:
✅ Expediente digital PETA
✅ Solicitar trámites
✅ Consultar tus armas
✅ Calendario tiradas 2026

⚠️ *Cambia tu contraseña al entrar*
(Menú → Mi Perfil)

📞 Dudas: Responde este mensaje

Saludos
MVZ Sergio Muñoz de Alba Medrano
Secretario del Club de Caza, Tiro y Pesca de Yucatán, A.C.`;
}

function generarTemplateMoroso() {
  return `Hola {First Name} 👋

Espero te encuentres bien.

📢 *IMPORTANTE - REGULARIZACIÓN 2026*

El Club implementa "Borrón y Cuenta Nueva":

✅ *Solo paga 2026* ($6,000 MXN)
✅ NO liquidar adeudos anteriores
✅ Acceso completo al portal web

🌐 *Portal: yucatanctp.org*

🔐 TUS CREDENCIALES:
• Usuario: {Email}
• Contraseña: {Password}
• Credencial: #{Credencial}

📋 BENEFICIOS DEL PORTAL:
✅ Expediente digital PETA
✅ Solicitar trámites
✅ Consultar tus armas
✅ Calendario tiradas 2026

💰 *CUOTA 2026*: $6,000 MXN
Incluye: 1 PETA gratis

📞 Para pagar o consultas: Responde este mensaje

Saludos
MVZ Sergio Muñoz de Alba Medrano
Secretario del Club de Caza, Tiro y Pesca de Yucatán, A.C.`;
}

// Ejecutar
generarWhatsAppSegmentado();

/**
 * Genera CSV para WhatsApp con credenciales
 * Extrae teléfonos desde Firestore
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

console.log('\n📱 GENERADOR DE MENSAJES WHATSAPP');
console.log('═'.repeat(80));

async function generarMensajesWhatsApp() {
  try {
    // 1. Leer credenciales CSV
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
    
    // 2. Obtener datos de Firestore (incluyendo teléfonos)
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.get();
    
    const sociosConTelefono = [];
    const sociosSinTelefono = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const email = doc.id;
      const credencial = credenciales[email];
      
      if (!credencial) {
        console.log(`  ⚠️  Email en Firestore pero no en credenciales: ${email}`);
        return;
      }
      
      const telefono = data.telefono?.replace(/\D/g, ''); // Solo dígitos
      
      const socioData = {
        email,
        nombre: credencial.nombre,
        credencial: credencial.credencial,
        password: credencial.password,
        telefono: telefono || '',
        nombreCorto: credencial.nombre.split(' ')[0] // Primer nombre
      };
      
      if (telefono && telefono.length === 10) {
        sociosConTelefono.push(socioData);
      } else {
        sociosSinTelefono.push(socioData);
      }
    });
    
    console.log(`\n📊 ESTADÍSTICAS:`);
    console.log(`   Con teléfono válido: ${sociosConTelefono.length}`);
    console.log(`   Sin teléfono: ${sociosSinTelefono.length}`);
    
    // 3. Generar CSV para WA Sender (Chrome Extension)
    const csvWA = ['phone,name,email,password,credencial'];
    
    sociosConTelefono.forEach(socio => {
      // Formato: 52 + 10 dígitos (código país México)
      const phoneFormatted = `52${socio.telefono}`;
      csvWA.push(`${phoneFormatted},"${socio.nombre}",${socio.email},${socio.password},${socio.credencial}`);
    });
    
    const csvWAPath = path.join(__dirname, '../emails-socios/whatsapp-socios.csv');
    fs.writeFileSync(csvWAPath, csvWA.join('\n'), 'utf-8');
    
    console.log(`\n✅ CSV para WA Sender: ${csvWAPath}`);
    console.log(`   ${sociosConTelefono.length} socios con teléfono`);
    
    // 4. Generar mensajes individuales .txt
    const messagesDir = path.join(__dirname, '../emails-socios/mensajes-whatsapp');
    if (!fs.existsSync(messagesDir)) {
      fs.mkdirSync(messagesDir, { recursive: true });
    }
    
    sociosConTelefono.forEach((socio, index) => {
      const mensaje = generarMensaje(socio);
      const filename = `${String(index + 1).padStart(3, '0')}-${socio.telefono}-${socio.nombreCorto}.txt`;
      const filepath = path.join(messagesDir, filename);
      fs.writeFileSync(filepath, mensaje, 'utf-8');
    });
    
    console.log(`✅ Mensajes .txt: ${messagesDir}/`);
    console.log(`   ${sociosConTelefono.length} archivos generados`);
    
    // 5. Lista de socios SIN teléfono (para enviar email)
    if (sociosSinTelefono.length > 0) {
      const sinTelefonoPath = path.join(__dirname, '../emails-socios/socios-sin-telefono.txt');
      const sinTelefonoContent = sociosSinTelefono.map(s => 
        `${s.credencial.padStart(3, ' ')} - ${s.nombre} (${s.email})`
      ).join('\n');
      
      fs.writeFileSync(sinTelefonoPath, 
        `SOCIOS SIN TELÉFONO (${sociosSinTelefono.length})\n` +
        `═══════════════════════════════════════\n\n` +
        sinTelefonoContent,
        'utf-8'
      );
      
      console.log(`\n⚠️  Socios sin teléfono: ${sinTelefonoPath}`);
      console.log(`   Estos recibirán solo email`);
    }
    
    // 6. Template de mensaje para Lista de Difusión (backup)
    const templateDifusion = generarTemplateDifusion();
    const templatePath = path.join(__dirname, '../emails-socios/mensaje-lista-difusion.txt');
    fs.writeFileSync(templatePath, templateDifusion, 'utf-8');
    console.log(`\n✅ Template Lista de Difusión: ${templatePath}`);
    
    console.log(`\n${'═'.repeat(80)}`);
    console.log(`✅ ARCHIVOS LISTOS PARA ENVÍO WHATSAPP`);
    console.log(`   1. CSV para WA Sender: whatsapp-socios.csv`);
    console.log(`   2. Mensajes .txt: mensajes-whatsapp/ (${sociosConTelefono.length} archivos)`);
    console.log(`   3. Template difusión: mensaje-lista-difusion.txt`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

function generarMensaje(socio) {
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

function generarTemplateDifusion() {
  return `Hola socios del Club de Caza, Tiro y Pesca de Yucatán, A.C. 👋

Les informamos que estrenamos portal web:

🌐 *yucatanctp.org*

📧 TUS CREDENCIALES:
• Usuario: Tu email registrado en el club
• Contraseña: Te la enviaremos por correo electrónico

📋 FUNCIONES DEL PORTAL:
✅ Expediente digital para trámites PETA
✅ Solicitar permisos de transportación
✅ Consultar tus armas registradas
✅ Calendario de tiradas 2026

⚠️ Si NO recibiste email con tu contraseña, responde este mensaje con tu nombre completo y te la enviaremos por WhatsApp.

📞 Para más información: +52 56 6582 4667

Saludos
MVZ Sergio Muñoz de Alba Medrano
Secretario del Club de Caza, Tiro y Pesca de Yucatán, A.C.`;
}

// Ejecutar
generarMensajesWhatsApp();

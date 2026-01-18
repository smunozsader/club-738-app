/**
 * Generar CSV y Template únicos para difusión masiva del lanzamiento del portal
 * UN SOLO MENSAJE para todos los socios (no segmentado)
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

console.log('\n📱 GENERADOR WHATSAPP - DIFUSIÓN LANZAMIENTO PORTAL');
console.log('═'.repeat(80));

async function generarWAPIDifusion() {
  try {
    // 1. Leer credenciales
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
    
    // 2. Obtener teléfonos de Firestore
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.get();
    
    const sociosConTelefono = [];
    const sociosSinTelefono = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const email = doc.id.toLowerCase();
      const credencial = credenciales[email];
      
      if (!credencial) {
        console.log(`  ⚠️  Email en Firestore pero no en credenciales: ${email}`);
        return;
      }
      
      // Excluir secretario
      if (email === 'smunozam@gmail.com') {
        console.log(`  ⊗ Excluido (secretario): ${email}`);
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
      
      if (telefono && telefono.length === 10) {
        sociosConTelefono.push(socioData);
      } else {
        sociosSinTelefono.push(socioData);
      }
    });
    
    console.log(`\n📊 ESTADÍSTICAS:`);
    console.log(`   Con teléfono válido: ${sociosConTelefono.length}`);
    console.log(`   Sin teléfono:        ${sociosSinTelefono.length}`);
    
    // 3. Generar CSV para WAPI Sender
    const csv = ['phone,First Name,name,email,password,credencial'];
    
    sociosConTelefono.forEach(socio => {
      const phoneFormatted = `52${socio.telefono}`;
      csv.push(`${phoneFormatted},${socio.nombreCorto},"${socio.nombre}",${socio.email},${socio.password},${socio.credencial}`);
    });
    
    const csvPath = path.join(__dirname, '../emails-socios/whatsapp-difusion-portal.csv');
    fs.writeFileSync(csvPath, csv.join('\n'), 'utf-8');
    
    console.log(`\n✅ CSV generado: ${csvPath}`);
    console.log(`   ${sociosConTelefono.length} socios incluidos`);
    
    // 4. Generar template de mensaje de difusión
    const template = `Hola {First Name} 👋

El *Club de Caza, Tiro y Pesca de Yucatán, A.C.* estrena portal web:

🌐 *yucatanctp.org*

🔐 TUS CREDENCIALES:
• Usuario: {Email}
• Contraseña: {Password}
• Credencial: #{Credencial}

📋 DESDE EL PORTAL PUEDES:
✅ Generar tu expediente electrónico PETA
✅ Subir tus documentos digitales
✅ Solicitar trámites de transportación
✅ Consultar tus armas registradas
✅ Ver calendario de tiradas 2026

💰 *RENOVACIÓN 2026*: $6,000 MXN
Incluye: 1 PETA gratis

📤 *COMPLETA TU EXPEDIENTE DIGITAL*:
Sube tus documentos para agilizar trámites

⚠️ *Cambia tu contraseña al entrar*
(Menú → Mi Perfil)

📞 Dudas o para renovar: Responde este mensaje

Saludos
MVZ Sergio Muñoz de Alba Medrano
Secretario del Club de Caza, Tiro y Pesca de Yucatán, A.C.`;

    const templatePath = path.join(__dirname, '../emails-socios/WAPI-Template-Difusion-Portal.txt');
    fs.writeFileSync(templatePath, template, 'utf-8');
    
    console.log(`✅ Template generado: ${templatePath}`);
    
    // 5. Lista de socios sin teléfono
    if (sociosSinTelefono.length > 0) {
      const sinTelefonoPath = path.join(__dirname, '../emails-socios/socios-sin-telefono-whatsapp.txt');
      const sinTelefonoContent = sociosSinTelefono.map(s => 
        `${s.credencial.padStart(3, ' ')} - ${s.nombre} (${s.email})`
      ).join('\n');
      
      fs.writeFileSync(sinTelefonoPath, 
        `SOCIOS SIN TELÉFONO (${sociosSinTelefono.length})\n` +
        `═══════════════════════════════════════\n\n` +
        sinTelefonoContent +
        `\n\n⚠️  Estos socios recibirán credenciales solo por EMAIL`,
        'utf-8'
      );
      
      console.log(`\n⚠️  Socios sin teléfono: ${sinTelefonoPath}`);
    }
    
    console.log(`\n${'═'.repeat(80)}`);
    console.log(`✅ ARCHIVOS LISTOS PARA DIFUSIÓN MASIVA`);
    console.log(`\n📱 ENVÍO ÚNICO (${sociosConTelefono.length} socios):`);
    console.log(`   - CSV: whatsapp-difusion-portal.csv`);
    console.log(`   - Template: WAPI-Template-Difusion-Portal.txt`);
    console.log(`\n⏱️  Tiempo estimado: ~${Math.ceil(sociosConTelefono.length * 11 / 60)} minutos`);
    console.log(`   (${sociosConTelefono.length} mensajes × 11 segundos)`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar
generarWAPIDifusion();

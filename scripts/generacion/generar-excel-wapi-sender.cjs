/**
 * Genera Excel para WAPI Sender con formato correcto
 */

const admin = require('firebase-admin');
const XLSX = require('xlsx');
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

console.log('\n📊 GENERADOR EXCEL PARA WAPI SENDER');
console.log('═'.repeat(80));

async function generarExcelWAPISender() {
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
    
    // 2. Obtener datos de Firestore (teléfonos)
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.get();
    
    const datos = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const email = doc.id;
      const credencial = credenciales[email];
      
      if (!credencial) return;
      
      const telefono = data.telefono?.replace(/\D/g, '');
      
      if (telefono && telefono.length === 10) {
        // Formato para WAPI Sender
        datos.push({
          'WhatsApp Number(with country code)': `+52${telefono}`,
          'First Name': credencial.nombre.split(' ')[0], // Primer nombre
          'Email': credencial.email,
          'Password': credencial.password,
          'Credencial': credencial.credencial
        });
      }
    });
    
    console.log(`✓ ${datos.length} socios con teléfono`);
    
    // 3. Crear Excel
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Socios');
    
    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 25 }, // WhatsApp Number
      { wch: 20 }, // First Name
      { wch: 35 }, // Email
      { wch: 20 }, // Password
      { wch: 12 }  // Credencial
    ];
    
    const excelPath = path.join(__dirname, '../emails-socios/WAPI-Sender-Socios.xlsx');
    XLSX.writeFile(wb, excelPath);
    
    console.log(`\n✅ Excel generado: ${excelPath}`);
    console.log(`   ${datos.length} socios incluidos`);
    
    // 4. Generar template de mensaje
    const templateMensaje = `Hola {First Name} 👋

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

    const templatePath = path.join(__dirname, '../emails-socios/WAPI-Sender-Template-Mensaje.txt');
    fs.writeFileSync(templatePath, templateMensaje, 'utf-8');
    
    console.log(`✅ Template mensaje: ${templatePath}`);
    
    console.log(`\n${'═'.repeat(80)}`);
    console.log(`📋 INSTRUCCIONES WAPI SENDER:`);
    console.log(`\n1. Abrir WhatsApp Web (web.whatsapp.com)`);
    console.log(`2. Click en extensión WAPI Sender`);
    console.log(`3. Click "Upload Excel"`);
    console.log(`4. Seleccionar: WAPI-Sender-Socios.xlsx`);
    console.log(`5. En "WhatsApp Messages", pegar el contenido de:`);
    console.log(`   WAPI-Sender-Template-Mensaje.txt`);
    console.log(`6. Configurar intervalo: 10-12 segundos`);
    console.log(`7. Click "Send now"`);
    console.log(`\n⏱️  Tiempo estimado: 15-20 minutos`);
    console.log(`📊 Mensajes a enviar: ${datos.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar
generarExcelWAPISender();

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Lista de emails de morosos 2025 (19 socios)
const emailsMorosos = [
  'jacintolizarraga@hotmail.com',
  'sysaventas@hotmail.com',
  'manuel.chaidez@valledelsur.com.mx',
  'humh4@hotmail.com',
  'josebadz@outlook.com',
  'david_xolz@hotmail.com',
  'josegilbertohernandezcarrillo@gmail.com',
  'galvani@hotmail.com',
  'agus_tin1_@hotmail.com',
  'marcotonyjr@hotmail.com',
  'tonysantacruz@hotmail.com',
  'd@azarcorp.mx',
  'armando.pard@gmail.com',
  'valenciarojasjjesus@gmail.com',
  'mjtzab@yahoo.com',
  'lolita@concepthaus.mx',
  'santiago100100@hotmail.com',
  'egpiccolo@gmail.com',
  'alejandro18sosa@gmail.com'
];

async function generarCSVMorosos() {
  try {
    console.log('🔍 Consultando datos de 19 socios morosos 2025...\n');
    
    const morosos = [];
    
    for (const email of emailsMorosos) {
      const socioRef = db.collection('socios').doc(email);
      const doc = await socioRef.get();
      
      if (doc.exists) {
        const socio = doc.data();
        morosos.push({
          credencial: socio.credencial || 'N/A',
          nombre: socio.nombre || 'Sin nombre',
          email: email,
          telefono: socio.telefono || 'N/A',
          ciudad: socio.domicilio?.ciudad || 'N/A',
          estado: 'MOROSO 2025'
        });
        console.log(`✅ ${socio.nombre}`);
      } else {
        console.log(`⚠️  No encontrado: ${email}`);
        morosos.push({
          credencial: 'N/A',
          nombre: 'NO ENCONTRADO',
          email: email,
          telefono: 'N/A',
          ciudad: 'N/A',
          estado: 'MOROSO 2025'
        });
      }
    }
    
    console.log(`\n✅ ${morosos.length} socios procesados\n`);
    
    // Generar CSV
    const csvLines = ['Credencial,Nombre,Email,Telefono,Ciudad,Estado'];
    morosos.forEach(socio => {
      csvLines.push(`${socio.credencial},"${socio.nombre}",${socio.email},${socio.telefono},${socio.ciudad},${socio.estado}`);
    });
    
    const outputPath = path.join(__dirname, '../emails-socios/morosos-2025-confirmados.csv');
    fs.writeFileSync(outputPath, csvLines.join('\n'));
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ CSV generado: emails-socios/morosos-2025-confirmados.csv');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📋 RESUMEN:');
    console.log(`Total morosos 2025: ${morosos.length}`);
    console.log(`Archivo listo para mail merge especial "Borrón y Cuenta Nueva"\n`);
    
    // También guardar JSON
    const jsonPath = path.join(__dirname, '../emails-socios/morosos-2025-confirmados.json');
    fs.writeFileSync(jsonPath, JSON.stringify(morosos, null, 2));
    
    console.log('✅ JSON generado: emails-socios/morosos-2025-confirmados.json\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ ERROR:', error);
    process.exit(1);
  }
}

generarCSVMorosos();

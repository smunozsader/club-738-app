const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function generarCSVsMorosos() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  Generar CSVs para Mail Merge - Morosos 2026                  ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Exentos (NO reciben email de morosidad, reciben solo el general)
  const exentos = [
    'gfq31@hotmail.com', // Gerardo Fernandez Quijano
    'ricardofq.abogado@gmail.com', // Ricardo Fernandez Quijano (hijo)
    'ricardofernandezperez@gmail.com', // Ricardo Fernandez Perez (padre)
    'joaquin.gardoni@gmail.com', // Joaquin Gardoni
    'guadalupearechiga@gmail.com', // Guadalupe Arechiga
    'smunozam@gmail.com', // Sergio (secretario)
    'aimeegomez615@gmail.com' // Aimee (pagó 4Q 2025)
  ];

  // Leer credenciales del CSV
  const credencialesPath = path.join(__dirname, '..', 'data', 'socios', 'credenciales_socios.csv');
  const csvContent = fs.readFileSync(credencialesPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());
  
  // Crear mapa de credenciales
  const credencialesMap = new Map();
  for (let i = 1; i < lines.length; i++) { // Saltar header
    const match = lines[i].match(/^(\d+),(\d+),([^,]+),([^,]+),(.+)$/);
    if (match) {
      const email = match[4].trim();
      credencialesMap.set(email, {
        numero: match[1],
        credencial: match[2],
        nombre: match[3],
        email: email,
        password: match[5].trim()
      });
    }
  }

  console.log(`📋 Total credenciales cargadas: ${credencialesMap.size}`);

  // Obtener morosos de Firestore
  const sociosRef = db.collection('socios');
  const snapshot = await sociosRef.get();
  
  let morososConArmas = [];
  let morososSinArmas = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const email = doc.id;
    
    // Excluir exentos
    if (exentos.includes(email)) {
      return;
    }
    
    // Solo morosos
    const estado = data.renovacion2026?.estado || 'pendiente';
    if (estado !== 'pendiente') {
      return;
    }
    
    // Verificar si tiene credenciales
    if (!credencialesMap.has(email)) {
      console.log(`⚠️  Socio ${email} sin credenciales en CSV`);
      return;
    }
    
    const creds = credencialesMap.get(email);
    const totalArmas = data.totalArmas || 0;
    
    if (totalArmas > 0) {
      morososConArmas.push(creds);
    } else {
      morososSinArmas.push(creds);
    }
  });

  console.log(`\n🔴 Morosos con armas: ${morososConArmas.length}`);
  console.log(`⚠️  Morosos sin armas: ${morososSinArmas.length}`);
  console.log(`📊 Total morosos: ${morososConArmas.length + morososSinArmas.length}`);

  // Generar CSV para morosos CON armas
  const csvConArmas = [
    'Nombre,Email,Credencial,Password',
    ...morososConArmas.map(s => 
      `"${s.nombre}",${s.email},${s.credencial},${s.password}`
    )
  ].join('\n');

  const fileConArmas = path.join(__dirname, '..', 'emails-socios', 'morosos-con-armas-mail-merge.csv');
  fs.writeFileSync(fileConArmas, csvConArmas, 'utf-8');
  console.log(`\n✅ Creado: ${fileConArmas}`);
  console.log(`   ${morososConArmas.length} socios`);

  // Generar CSV para morosos SIN armas
  const csvSinArmas = [
    'Nombre,Email,Credencial,Password',
    ...morososSinArmas.map(s => 
      `"${s.nombre}",${s.email},${s.credencial},${s.password}`
    )
  ].join('\n');

  const fileSinArmas = path.join(__dirname, '..', 'emails-socios', 'morosos-sin-armas-mail-merge.csv');
  fs.writeFileSync(fileSinArmas, csvSinArmas, 'utf-8');
  console.log(`✅ Creado: ${fileSinArmas}`);
  console.log(`   ${morososSinArmas.length} socios`);

  // Mostrar primeros 3 de cada grupo para verificar
  console.log('\n📋 PREVIEW - Morosos CON armas (primeros 3):');
  morososConArmas.slice(0, 3).forEach(s => {
    console.log(`   - ${s.nombre} (${s.email}) - Password: ${s.password}`);
  });

  console.log('\n📋 PREVIEW - Morosos SIN armas:');
  morososSinArmas.forEach(s => {
    console.log(`   - ${s.nombre} (${s.email}) - Password: ${s.password}`);
  });

  console.log('\n💡 ESTRATEGIA DE EMAILS:');
  console.log('   1. morosos-con-armas-mail-merge.csv (60) → TEMPLATE_MOROSOS_BORRON_Y_CUENTA_NUEVA.html');
  console.log('   2. morosos-sin-armas-mail-merge.csv (8)  → TEMPLATE_MOROSOS_SIN_ARMAS.html');
  console.log('   3. mail-merge-data.csv (76)               → TEMPLATE_MAIL_MERGE.html (incluye exentos)');

  process.exit(0);
}

generarCSVsMorosos().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

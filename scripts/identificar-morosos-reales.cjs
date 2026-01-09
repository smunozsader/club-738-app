const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function identificarMorososReales() {
  // Exentos según indicaciones del usuario (no pagan pero sí usan portal)
  const exentos = [
    'gfq31@hotmail.com', // Gerardo Fernandez Quijano (familiar presidente)
    'ricardofq.abogado@gmail.com', // Ricardo Fernandez Quijano hijo (familiar presidente)
    'ricardofernandezperez@gmail.com', // Ricardo Fernandez Perez padre (familiar presidente)
    'joaquin.gardoni@gmail.com', // Joaquin Gardoni (familiar presidente)
    'guadalupearechiga@gmail.com', // Guadalupe Arechiga (esposa tesorero)
    'smunozam@gmail.com', // Sergio Muñoz (secretario)
    'aimeegomez615@gmail.com' // Aimee (pagó 4Q 2025)
  ];

  const sociosRef = db.collection('socios');
  const snapshot = await sociosRef.get();
  
  let morososConArmas = [];
  let morososSinArmas = [];
  let alCorriente = [];
  let exentosEncontrados = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const email = doc.id;
    
    // Verificar si es exento
    if (exentos.includes(email)) {
      exentosEncontrados.push({
        email,
        nombre: data.nombre,
        armas: data.totalArmas || 0
      });
      return;
    }
    
    // Verificar estado de renovación
    const estado = data.renovacion2026?.estado || 'pendiente';
    const totalArmas = data.totalArmas || 0;
    
    if (estado === 'pendiente') {
      if (totalArmas > 0) {
        morososConArmas.push({
          email,
          nombre: data.nombre,
          armas: totalArmas
        });
      } else {
        morososSinArmas.push({
          email,
          nombre: data.nombre
        });
      }
    } else {
      alCorriente.push({
        email,
        nombre: data.nombre,
        armas: totalArmas
      });
    }
  });
  
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║  ANÁLISIS DE MOROSIDAD 2026 (excluyendo exentos)              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  console.log('📋 EXENTOS (No pagan pero SÍ usan portal):', exentosEncontrados.length);
  exentosEncontrados.forEach(s => {
    console.log(`  ✓ ${s.nombre} (${s.email}) - ${s.armas} armas`);
  });
  
  console.log('\n🔴 MOROSOS CON ARMAS:', morososConArmas.length);
  morososConArmas.forEach(s => {
    console.log(`  - ${s.nombre} (${s.email}) - ${s.armas} armas`);
  });
  
  console.log('\n⚠️  MOROSOS SIN ARMAS:', morososSinArmas.length);
  morososSinArmas.forEach(s => {
    console.log(`  - ${s.nombre} (${s.email})`);
  });
  
  console.log('\n✅ AL CORRIENTE:', alCorriente.length);
  console.log(`   (${alCorriente.filter(s => s.armas > 0).length} con armas, ${alCorriente.filter(s => s.armas === 0).length} sin armas)`);
  
  console.log('\n📊 RESUMEN:');
  console.log(`   Total socios en Firestore: ${snapshot.size}`);
  console.log(`   Exentos: ${exentosEncontrados.length}`);
  console.log(`   Al corriente: ${alCorriente.length}`);
  console.log(`   Morosos TOTAL: ${morososConArmas.length + morososSinArmas.length}`);
  console.log(`     └─ Con armas: ${morososConArmas.length}`);
  console.log(`     └─ Sin armas: ${morososSinArmas.length}`);
  
  console.log('\n💡 ESTRATEGIA DE EMAILS:');
  console.log(`   1. Email general (76 socios) → Anuncio portal + credenciales`);
  console.log(`   2. Morosos con armas (${morososConArmas.length}) → "Borrón y Cuenta Nueva"`);
  console.log(`   3. Morosos sin armas (${morososSinArmas.length}) → Renovar + Club como intermediario SEDENA`);
  
  process.exit(0);
}

identificarMorososReales().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

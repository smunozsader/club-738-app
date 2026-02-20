/**
 * Script para verificar PETAs en Firestore
 * Uso: node scripts/check_petas_firestore.js
 */
const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath)
});

const db = admin.firestore();

async function checkPETAs() {
  console.log('🔍 Buscando PETAs en Firestore...\n');
  
  const sociosSnap = await db.collection('socios').get();
  console.log(`📁 Total socios: ${sociosSnap.size}\n`);
  
  let totalPETAs = 0;
  
  for (const socioDoc of sociosSnap.docs) {
    const petasRef = db.collection('socios').doc(socioDoc.id).collection('petas');
    const petasSnap = await petasRef.get();
    
    if (petasSnap.size > 0) {
      console.log(`\n👤 ${socioDoc.id}`);
      console.log(`   PETAs: ${petasSnap.size}`);
      
      petasSnap.forEach(petaDoc => {
        const peta = petaDoc.data();
        totalPETAs++;
        console.log(`   📋 ID: ${petaDoc.id}`);
        console.log(`      Estado: ${peta.estado || 'sin estado'}`);
        console.log(`      Tipo: ${peta.tipo || peta.tipoPETA || 'sin tipo'}`);
        console.log(`      Fecha: ${peta.fechaSolicitud?.toDate?.() || peta.fechaSolicitud || 'sin fecha'}`);
        console.log(`      Armas: ${peta.armasIncluidas?.length || 0}`);
      });
    }
  }
  
  console.log(`\n✅ Total PETAs encontrados: ${totalPETAs}`);
  
  // Buscar específicamente los IDs mencionados
  console.log('\n🎯 Buscando IDs específicos...');
  const targetIds = ['PN4wgWoGzWQ3RWQ0YHW8', 'RxO4VUzEMKNeiGDehrEH'];
  
  for (const targetId of targetIds) {
    // Buscar en todos los socios
    for (const socioDoc of sociosSnap.docs) {
      const petaRef = db.collection('socios').doc(socioDoc.id).collection('petas').doc(targetId);
      const petaSnap = await petaRef.get();
      
      if (petaSnap.exists) {
        console.log(`\n✅ Encontrado: ${targetId}`);
        console.log(`   Socio: ${socioDoc.id}`);
        console.log(`   Datos:`, JSON.stringify(petaSnap.data(), null, 2).substring(0, 500));
      }
    }
  }
}

checkPETAs()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

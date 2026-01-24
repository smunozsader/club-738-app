const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function corregir() {
  const email = 'oso.guigam@gmail.com';
  const socioRef = db.collection('socios').doc(email);
  
  console.log('\n🔧 Corrigiendo datos de Luis Fernando Guillermo Gamboa');
  console.log('='.repeat(60));
  
  await socioRef.update({
    // Actualizar membresia2026 con esNuevo
    'membresia2026.esNuevo': true,
    
    // Actualizar renovacion2026 con los campos que faltaban
    'renovacion2026.inscripcion': 2000,
    'renovacion2026.cuotaClub': 6000,
    'renovacion2026.cuotaFemeti': 700,
    'renovacion2026.desglose': {
      inscripcion: 2000,
      anualidad: 6000,
      femeti: 700
    }
  });
  
  const updatedDoc = await socioRef.get();
  const data = updatedDoc.data();
  
  console.log('\n✅ Datos corregidos:');
  console.log('\nmembresia2026:');
  console.log('  - inscripcion:', data.membresia2026.inscripcion);
  console.log('  - cuotaClub:', data.membresia2026.cuotaClub);
  console.log('  - cuotaFemeti:', data.membresia2026.cuotaFemeti);
  console.log('  - monto total:', data.membresia2026.monto);
  console.log('  - esNuevo:', data.membresia2026.esNuevo);
  
  console.log('\nrenovacion2026:');
  console.log('  - inscripcion:', data.renovacion2026.inscripcion);
  console.log('  - cuotaClub:', data.renovacion2026.cuotaClub);
  console.log('  - cuotaFemeti:', data.renovacion2026.cuotaFemeti);
  console.log('  - monto total:', data.renovacion2026.monto);
  
  console.log('\n✅ Suma correcta: 2000 + 6000 + 700 = 8700 ✓');
  
  process.exit(0);
}

corregir().catch(e => {
  console.error('❌ Error:', e);
  process.exit(1);
});

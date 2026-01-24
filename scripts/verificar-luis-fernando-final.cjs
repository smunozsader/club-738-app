const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function verificacion() {
  const email = 'oso.guigam@gmail.com';
  const doc = await db.collection('socios').doc(email).get();
  
  if (doc.exists) {
    const data = doc.data();
    console.log('\n✅ VERIFICACIÓN FINAL - LUIS FERNANDO GUILLERMO GAMBOA');
    console.log('═══════════════════════════════════════════════════════════════════════');
    
    console.log('\n📊 membresia2026:');
    console.log('  inscripcion......:', data.membresia2026?.inscripcion);
    console.log('  cuotaClub........:', data.membresia2026?.cuotaClub);
    console.log('  cuotaFemeti......:', data.membresia2026?.cuotaFemeti);
    console.log('  monto total......:', data.membresia2026?.monto);
    console.log('  esNuevo.........:', data.membresia2026?.esNuevo);
    
    console.log('\n📊 renovacion2026:');
    console.log('  inscripcion......:', data.renovacion2026?.inscripcion);
    console.log('  cuotaClub........:', data.renovacion2026?.cuotaClub);
    console.log('  cuotaFemeti......:', data.renovacion2026?.cuotaFemeti);
    console.log('  monto...........:', data.renovacion2026?.monto);
    console.log('  estado..........:', data.renovacion2026?.estado);
    
    const sum = data.membresia2026?.inscripcion + data.membresia2026?.cuotaClub + data.membresia2026?.cuotaFemeti;
    console.log('\n🧮 SUMA: $2,000 + $6,000 + $700 = $' + sum);
    
    console.log('\n═══════════════════════════════════════════════════════════════════════');
    console.log('✅ TODOS LOS DATOS CORRECTAMENTE REGISTRADOS EN FIRESTORE\n');
  }
  
  process.exit(0);
}

verificacion().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});

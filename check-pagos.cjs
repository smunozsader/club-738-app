const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkPagos() {
  try {
    // Obtener Santiago
    const santiago = await db.collection('socios').doc('squintal158@gmail.com').get();
    console.log('\n=== SANTIAGO ALEJANDRO QUINTAL PAREDES ===');
    console.log(JSON.stringify(santiago.data(), null, 2));
    
    // Listar todos los socios con renovacion2026
    console.log('\n=== SOCIOS CON PAGOS (renovacion2026) ===');
    const snapshot = await db.collection('socios').get();
    let conPagos = 0;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.renovacion2026 && Object.keys(data.renovacion2026).length > 0) {
        conPagos++;
        console.log(`\n${conPagos}. ${data.nombre} (${doc.id})`);
        console.log('   renovacion2026:', JSON.stringify(data.renovacion2026, null, 2).substring(0, 300));
      }
    });
    console.log(`\nTotal socios con renovacion2026: ${conPagos}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPagos();

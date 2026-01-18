const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (admin.apps.length === 0) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function verificar() {
  const snapshot = await db.collection('socios').get();
  let conDomicilio = 0;
  let sinDomicilio = [];
  
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.domicilio && data.domicilio.calle) {
      conDomicilio++;
    } else {
      sinDomicilio.push(doc.id);
    }
  });
  
  console.log('=== RESUMEN DOMICILIOS EN FIRESTORE ===\n');
  console.log('Socios con domicilio:', conDomicilio);
  console.log('Socios sin domicilio:', sinDomicilio.length);
  
  if (sinDomicilio.length > 0) {
    console.log('\nSin domicilio:');
    sinDomicilio.forEach(email => console.log('  -', email));
  }
}

verificar().then(() => process.exit(0));

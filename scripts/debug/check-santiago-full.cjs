const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function check() {
  try {
    const santiago = await db.collection('socios').doc('squintal158@gmail.com').get();
    const data = santiago.data();
    
    console.log('\n=== SANTIAGO ACTUAL ===\n');
    console.log('membresia2026:', JSON.stringify(data.membresia2026, null, 2));
    console.log('\nrenovacion2026:', JSON.stringify(data.renovacion2026, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

check();

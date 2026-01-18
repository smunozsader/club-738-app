const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function check() {
  try {
    const luis = await db.collection('socios').doc('oso.guigam@gmail.com').get();
    console.log('\n=== LUIS FERNANDO GUILLERMO GAMBOA ===');
    console.log(JSON.stringify(luis.data().renovacion2026, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

check();

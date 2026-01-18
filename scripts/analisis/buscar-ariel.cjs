const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (admin.apps.length === 0) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function buscarSocio() {
  const snapshot = await db.collection('socios').get();
  
  console.log('=== BUSCANDO ARIEL PAREDES ===\n');
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const nombre = (data.nombre || '').toUpperCase();
    if (nombre.includes('ARIEL') || nombre.includes('PAREDES CETINA')) {
      console.log('Email (clave):', doc.id);
      console.log('Nombre:', data.nombre);
      console.log('No. Socio:', data.noSocio);
      console.log('Teléfono:', data.telefono);
      console.log('---');
    }
  });
}

buscarSocio().then(() => process.exit(0));

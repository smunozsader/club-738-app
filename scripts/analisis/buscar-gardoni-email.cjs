/**
 * Buscar email correcto de Gardoni
 */
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function buscarGardoni() {
  try {
    console.log('🔍 Buscando a Gardoni en todos los socios...\n');

    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.get();

    snapshot.forEach(doc => {
      const data = doc.data();
      const email = doc.id;
      const nombre = data.nombre || '';
      
      if (nombre.toLowerCase().includes('gardoni') || 
          nombre.toLowerCase().includes('joaquin') ||
          email.toLowerCase().includes('gardoni')) {
        console.log('✅ ENCONTRADO:');
        console.log('  Email:', email);
        console.log('  Nombre:', nombre);
        console.log('  CURP:', data.curp);
        console.log('  Total Armas:', data.totalArmas);
        console.log('---');
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

buscarGardoni();

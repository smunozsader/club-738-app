const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const db = admin.firestore();
const storage = admin.storage().bucket();

async function debugRutas() {
  const email = 'martinezasergio@hotmail.com';
  
  console.log('=== DEBUG RUTAS - SERGIO MARTINEZ ===\n');
  
  // Obtener armas de Firestore
  const armasSnapshot = await db.collection('socios').doc(email).collection('armas').get();
  
  console.log('ARMAS EN FIRESTORE:');
  armasSnapshot.forEach(doc => {
    const arma = doc.data();
    const matriculaNormalizada = arma.matricula.replace(/\s+/g, '_');
    console.log(`\nID: ${doc.id}`);
    console.log(`Matrícula: ${arma.matricula}`);
    console.log(`Matrícula normalizada: ${matriculaNormalizada}`);
    console.log(`Ruta que busca el código: documentos/${email}/armas/${matriculaNormalizada}/registro.pdf`);
    console.log(`documentoRegistro en Firestore: ${arma.documentoRegistro || 'NO CONFIGURADO'}`);
  });
  
  console.log('\n\nARCHIVOS REALES EN STORAGE:');
  const [armaFiles] = await storage.getFiles({ prefix: `documentos/${email}/armas/` });
  armaFiles.forEach(file => {
    console.log(`✅ ${file.name}`);
  });
  
  console.log('\n\nCONCLUSIÓN:');
  console.log('Los archivos están guardados con UUID pero el código busca por matrícula.');
  console.log('SOLUCIÓN: Usar el campo documentoRegistro de Firestore o buscar por ID.');
}

debugRutas()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

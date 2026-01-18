const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function verificarArmas() {
  const email = 'smunozam@gmail.com';
  
  console.log('=== ARMAS EN FIRESTORE ===\n');
  const armasSnapshot = await db.collection('socios').doc(email).collection('armas').get();
  
  const armasFirestore = [];
  armasSnapshot.forEach(doc => {
    const data = doc.data();
    armasFirestore.push({
      id: doc.id,
      matricula: data.matricula,
      marca: data.marca,
      modelo: data.modelo,
      documentoRegistro: data.documentoRegistro || 'NO TIENE'
    });
  });
  
  console.log(`Total armas en Firestore: ${armasFirestore.length}\n`);
  armasFirestore.forEach((arma, idx) => {
    console.log(`${idx + 1}. ID: ${arma.id}`);
    console.log(`   Matrícula: ${arma.matricula}`);
    console.log(`   Marca: ${arma.marca} ${arma.modelo}`);
    console.log(`   documentoRegistro: ${arma.documentoRegistro}`);
    console.log('');
  });
  
  console.log('\n=== ARCHIVOS EN STORAGE ===\n');
  const [files] = await bucket.getFiles({
    prefix: `documentos/${email}/armas/`
  });
  
  console.log(`Total archivos: ${files.length}\n`);
  files.forEach((file, idx) => {
    console.log(`${idx + 1}. ${file.name}`);
  });
  
  // Verificar mismatches
  console.log('\n=== VERIFICACIÓN DE MAPEO ===\n');
  
  const armasConDoc = armasFirestore.filter(a => a.documentoRegistro !== 'NO TIENE');
  const armasSinDoc = armasFirestore.filter(a => a.documentoRegistro === 'NO TIENE');
  
  console.log(`✅ Armas con documentoRegistro: ${armasConDoc.length}`);
  console.log(`❌ Armas SIN documentoRegistro: ${armasSinDoc.length}\n`);
  
  if (armasSinDoc.length > 0) {
    console.log('⚠️  ARMAS SIN CAMPO documentoRegistro:');
    armasSinDoc.forEach(arma => {
      console.log(`   - ${arma.matricula} (${arma.marca} ${arma.modelo})`);
    });
  }
  
  process.exit(0);
}

verificarArmas().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

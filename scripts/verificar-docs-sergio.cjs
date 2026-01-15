const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const db = admin.firestore();

async function verificarDocs() {
  const email = 'smunozam@gmail.com';
  
  const socioDoc = await db.collection('socios').doc(email).get();
  
  if (!socioDoc.exists) {
    console.log('❌ Socio no existe');
    process.exit(1);
  }
  
  const data = socioDoc.data();
  
  console.log('\n=== DATOS DEL SOCIO ===\n');
  console.log('Nombre:', data.nombre);
  console.log('CURP:', data.curp);
  console.log('Total armas:', data.totalArmas);
  
  console.log('\n=== DOCUMENTOS PETA ===\n');
  if (data.documentosPETA) {
    for (const [key, value] of Object.entries(data.documentosPETA)) {
      console.log(`${key}:`);
      console.log('  url:', value.url ? '✅' : '❌');
      console.log('  verificado:', value.verificado);
      console.log('  fechaSubida:', value.fechaSubida?.toDate());
      console.log('');
    }
  } else {
    console.log('❌ Campo documentosPETA NO EXISTE');
  }
  
  process.exit(0);
}

verificarDocs().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

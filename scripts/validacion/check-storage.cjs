const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'club-738-app.firebasestorage.app'
  });
}

const bucket = admin.storage().bucket();

async function checkFile() {
  const file = bucket.file('documentos/smunozam@gmail.com/curp.pdf');
  
  const [exists] = await file.exists();
  console.log('Archivo existe:', exists);
  
  if (exists) {
    const [metadata] = await file.getMetadata();
    console.log('ContentType:', metadata.contentType);
    console.log('Size:', metadata.size, 'bytes');
    
    // Generar URL firmada para probar
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000 // 1 hora
    });
    console.log('\n📎 URL de prueba (copia y pega en navegador):');
    console.log(url);
  }
}

checkFile().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

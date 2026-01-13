const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const storage = admin.storage();

async function buscarPDFsArmas() {
  console.log('🔍 Buscando PDFs de registro para todas las armas de Gardoni\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const armas = [
    { matricula: 'DP25246', id: '2aa851f3-a0e2-4000-8599-907b48c9ddd1' },
    { matricula: 'K078928', id: '0359addb-32bf-4541-b446-b53c86f94d21' },
    { matricula: 'DP25086', id: '714d3775-15f6-4e62-8ec6-ef4352747090' }
  ];

  const socioEmail = 'jrgardoni@gmail.com';

  for (const arma of armas) {
    console.log(`🔍 ${arma.matricula}:`);
    
    const rutaPDF = `documentos/${socioEmail}/armas/${arma.id}/registro.pdf`;
    
    try {
      const bucket = storage.bucket('club-738-app.firebasestorage.app');
      const file = bucket.file(rutaPDF);
      const [exists] = await file.exists();
      
      if (exists) {
        const metadata = await file.getMetadata();
        console.log(`   ✅ PDF EXISTE EN STORAGE`);
        console.log(`      Tamaño: ${(metadata[0].size / 1024).toFixed(2)} KB`);
        console.log(`      Cargado: ${metadata[0].timeCreated}`);
      } else {
        console.log(`   ❌ PDF NO EXISTE EN STORAGE`);
        console.log(`      Ruta esperada: ${rutaPDF}`);
      }
    } catch (error) {
      console.log(`   ⚠️ Error: ${error.message}`);
    }
    
    console.log('');
  }

  process.exit(0);
}

buscarPDFsArmas().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});

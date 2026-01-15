const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function regenerarURLs() {
  const email = 'smunozam@gmail.com';
  
  console.log('🔄 Regenerando URLs de documentos PETA\n');
  
  const socioRef = db.collection('socios').doc(email);
  const socioSnap = await socioRef.get();
  
  if (!socioSnap.exists) {
    console.log('❌ Socio no existe');
    process.exit(1);
  }
  
  const data = socioSnap.data();
  const documentosPETA = data.documentosPETA || {};
  
  let actualizados = 0;
  
  for (const [docType, docData] of Object.entries(documentosPETA)) {
    if (docData.url) {
      // Extraer ruta del archivo de la URL existente
      const urlObj = new URL(docData.url);
      const pathMatch = urlObj.pathname.match(/\/o\/(.+?)\?/);
      
      if (pathMatch) {
        const filePath = decodeURIComponent(pathMatch[1]);
        console.log(`Procesando: ${docType} → ${filePath}`);
        
        try {
          const file = bucket.file(filePath);
          const [exists] = await file.exists();
          
          if (exists) {
            // Generar nueva URL firmada
            const [newUrl] = await file.getSignedUrl({
              action: 'read',
              expires: '03-01-2500'
            });
            
            // Actualizar Firestore
            await socioRef.update({
              [`documentosPETA.${docType}.url`]: newUrl
            });
            
            console.log(`✅ ${docType} - URL actualizada\n`);
            actualizados++;
          } else {
            console.log(`⚠️  ${docType} - Archivo no existe en Storage\n`);
          }
        } catch (error) {
          console.error(`❌ Error: ${docType} - ${error.message}\n`);
        }
      }
    }
  }
  
  console.log(`\n📊 Total URLs actualizadas: ${actualizados}`);
  process.exit(0);
}

regenerarURLs().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

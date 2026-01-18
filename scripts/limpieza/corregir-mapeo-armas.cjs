const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function corregirMapeo() {
  const email = 'smunozam@gmail.com';
  
  console.log('🔧 CORRIGIENDO MAPEO DE ARMAS\n');
  
  // Obtener todas las armas de Firestore
  const armasSnapshot = await db.collection('socios').doc(email).collection('armas').get();
  
  let actualizadas = 0;
  let errores = 0;
  
  for (const doc of armasSnapshot.docs) {
    const arma = doc.data();
    const armaId = doc.id;
    const matricula = arma.matricula;
    
    // Normalizar matrícula para ruta (espacios → guion bajo)
    const matriculaNormalizada = matricula.replace(/\s+/g, '_');
    
    // Ruta correcta en Storage
    const rutaStorage = `documentos/${email}/armas/${matriculaNormalizada}/registro.pdf`;
    
    try {
      // Verificar que el archivo existe en Storage
      const file = bucket.file(rutaStorage);
      const [exists] = await file.exists();
      
      if (exists) {
        // Obtener URL pública firmada
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-01-2500' // Expira en año 2500
        });
        
        // Actualizar Firestore
        await doc.ref.update({
          documentoRegistro: url
        });
        
        console.log(`✅ ${matricula} → ${rutaStorage}`);
        actualizadas++;
      } else {
        console.log(`⚠️  ${matricula} → Archivo NO encontrado en Storage: ${rutaStorage}`);
        errores++;
      }
    } catch (error) {
      console.error(`❌ Error procesando ${matricula}:`, error.message);
      errores++;
    }
  }
  
  console.log(`\n📊 RESUMEN:`);
  console.log(`   ✅ Actualizadas: ${actualizadas}`);
  console.log(`   ❌ Errores: ${errores}`);
  console.log(`   📦 Total: ${armasSnapshot.size}`);
  
  process.exit(0);
}

corregirMapeo().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});

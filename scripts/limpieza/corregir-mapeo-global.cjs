const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function corregirTodosLosSocios() {
  console.log('🔧 CORRIGIENDO MAPEO DE ARMAS - TODOS LOS SOCIOS\n');
  
  // Obtener todos los socios
  const sociosSnapshot = await db.collection('socios').get();
  
  let totalSocios = 0;
  let totalArmas = 0;
  let totalActualizadas = 0;
  let totalErrores = 0;
  
  for (const socioDoc of sociosSnapshot.docs) {
    const email = socioDoc.id;
    totalSocios++;
    
    // Obtener armas del socio
    const armasSnapshot = await socioDoc.ref.collection('armas').get();
    
    if (armasSnapshot.empty) {
      continue; // Socio sin armas
    }
    
    console.log(`\n👤 ${email} (${armasSnapshot.size} armas)`);
    
    for (const armaDoc of armasSnapshot.docs) {
      const arma = armaDoc.data();
      const matricula = arma.matricula;
      totalArmas++;
      
      // Normalizar matrícula para ruta
      const matriculaNormalizada = matricula.replace(/\s+/g, '_');
      
      // Ruta correcta en Storage
      const rutaStorage = `documentos/${email}/armas/${matriculaNormalizada}/registro.pdf`;
      
      try {
        const file = bucket.file(rutaStorage);
        const [exists] = await file.exists();
        
        if (exists) {
          // Obtener URL
          const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-01-2500'
          });
          
          // Actualizar Firestore
          await armaDoc.ref.update({
            documentoRegistro: url
          });
          
          console.log(`   ✅ ${matricula}`);
          totalActualizadas++;
        } else {
          console.log(`   ⚠️  ${matricula} - Archivo no encontrado`);
        }
      } catch (error) {
        console.error(`   ❌ ${matricula} - Error: ${error.message}`);
        totalErrores++;
      }
    }
  }
  
  console.log(`\n\n📊 RESUMEN GLOBAL:`);
  console.log(`   👥 Socios procesados: ${totalSocios}`);
  console.log(`   🔫 Armas totales: ${totalArmas}`);
  console.log(`   ✅ Actualizadas: ${totalActualizadas}`);
  console.log(`   ❌ Errores: ${totalErrores}`);
  console.log(`   ⚠️  Sin archivo: ${totalArmas - totalActualizadas - totalErrores}`);
  
  process.exit(0);
}

corregirTodosLosSocios().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});

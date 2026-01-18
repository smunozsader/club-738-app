const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const db = admin.firestore();
const storage = admin.storage().bucket();

async function migrarRutasArmas() {
  console.log('🔄 MIGRACIÓN: Actualizar campo documentoRegistro en Firestore\n');
  console.log('Cambiando de matrícula a UUID en las rutas...\n');
  
  let totalSocios = 0;
  let totalArmas = 0;
  let armasActualizadas = 0;
  
  try {
    // Obtener todos los socios
    const sociosSnapshot = await db.collection('socios').get();
    totalSocios = sociosSnapshot.size;
    
    console.log(`📊 Total de socios: ${totalSocios}\n`);
    
    for (const socioDoc of sociosSnapshot.docs) {
      const email = socioDoc.id;
      console.log(`\n👤 Procesando: ${email}`);
      
      // Obtener armas del socio
      const armasSnapshot = await db.collection('socios').doc(email).collection('armas').get();
      
      if (armasSnapshot.empty) {
        console.log('   ℹ️  No tiene armas registradas');
        continue;
      }
      
      console.log(`   🔫 Armas encontradas: ${armasSnapshot.size}`);
      
      for (const armaDoc of armasSnapshot.docs) {
        totalArmas++;
        const armaId = armaDoc.id;
        const armaData = armaDoc.data();
        
        // Verificar si el archivo existe en Storage con UUID
        const rutaConUUID = `documentos/${email}/armas/${armaId}/registro.pdf`;
        
        try {
          const storageRef = storage.file(rutaConUUID);
          const [exists] = await storageRef.exists();
          
          if (exists) {
            // Obtener URL firmada
            const [url] = await storageRef.getSignedUrl({
              action: 'read',
              expires: '01-01-2100' // URL válida por muchos años
            });
            
            // Actualizar Firestore
            await db.collection('socios').doc(email).collection('armas').doc(armaId).update({
              documentoRegistro: url
            });
            
            armasActualizadas++;
            console.log(`   ✅ ${armaData.clase} ${armaData.marca} - URL actualizada`);
          } else {
            console.log(`   ⏭️  ${armaData.clase} ${armaData.marca} - Sin PDF en Storage`);
          }
        } catch (error) {
          console.log(`   ⚠️  ${armaData.clase} ${armaData.marca} - Error: ${error.message}`);
        }
      }
    }
    
    console.log('\n');
    console.log('═══════════════════════════════════════════════');
    console.log('📊 RESUMEN DE MIGRACIÓN');
    console.log('═══════════════════════════════════════════════');
    console.log(`Socios procesados: ${totalSocios}`);
    console.log(`Total de armas: ${totalArmas}`);
    console.log(`Armas con PDF actualizado: ${armasActualizadas}`);
    console.log(`Armas sin PDF: ${totalArmas - armasActualizadas}`);
    console.log('═══════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

migrarRutasArmas()
  .then(() => {
    console.log('✅ Migración completada exitosamente');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  });

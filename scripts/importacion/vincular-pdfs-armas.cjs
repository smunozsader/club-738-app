const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://club-738-app.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function vincularPDFsHuerfanos() {
  console.log('\n🔗 VINCULACIÓN AUTOMÁTICA DE PDFs HUÉRFANOS\n');
  console.log('='.repeat(80));
  
  try {
    const sociosSnapshot = await db.collection('socios').get();
    
    let totalSocios = 0;
    let totalArmasActualizadas = 0;
    let sociosActualizados = 0;
    
    for (const socioDoc of sociosSnapshot.docs) {
      const email = socioDoc.id;
      const socioData = socioDoc.data();
      
      // Obtener armas del socio
      const armasSnapshot = await db.collection('socios').doc(email).collection('armas').get();
      
      if (armasSnapshot.empty) continue;
      
      totalSocios++;
      let armasActualizadas = 0;
      
      for (const armaDoc of armasSnapshot.docs) {
        const armaId = armaDoc.id;
        const armaData = armaDoc.data();
        
        // Solo procesar si NO tiene documentoRegistro
        if (armaData.documentoRegistro) continue;
        
        // Verificar si existe PDF en Storage
        const pdfPath = `documentos/${email}/armas/${armaId}/registro.pdf`;
        
        try {
          const file = bucket.file(pdfPath);
          const [exists] = await file.exists();
          
          if (exists) {
            // Obtener URL pública
            const [metadata] = await file.getMetadata();
            const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(pdfPath)}?alt=media`;
            
            // Actualizar Firestore
            await db.collection('socios').doc(email).collection('armas').doc(armaId).update({
              documentoRegistro: publicUrl,
              ultimaModificacion: admin.firestore.Timestamp.now()
            });
            
            armasActualizadas++;
            totalArmasActualizadas++;
            
            console.log(`✅ Vinculado: ${socioData.nombre || email}`);
            console.log(`   ${armaData.clase} ${armaData.marca} ${armaData.modelo}`);
            console.log(`   Matrícula: ${armaData.matricula}`);
            console.log(`   PDF: ${pdfPath}`);
            console.log('');
          }
        } catch (error) {
          // PDF no existe, continuar
        }
      }
      
      if (armasActualizadas > 0) {
        sociosActualizados++;
      }
    }
    
    console.log('='.repeat(80));
    console.log('\n📊 RESUMEN:');
    console.log(`   Socios revisados: ${totalSocios}`);
    console.log(`   Socios actualizados: ${sociosActualizados}`);
    console.log(`   Armas vinculadas: ${totalArmasActualizadas}`);
    console.log('\n✅ Proceso completado\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

vincularPDFsHuerfanos();

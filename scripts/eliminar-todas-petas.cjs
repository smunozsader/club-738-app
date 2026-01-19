const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function eliminarTodasLasPETAs() {
  console.log('🗑️  ELIMINANDO TODAS LAS SOLICITUDES PETA');
  console.log('=========================================\n');
  
  try {
    // Obtener todos los socios
    const sociosSnapshot = await db.collection('socios').get();
    
    if (sociosSnapshot.empty) {
      console.log('❌ No hay socios en la base de datos');
      return;
    }
    
    console.log(`📋 Total de socios: ${sociosSnapshot.size}\n`);
    
    let totalPETAsEliminadas = 0;
    let sociosConPETAs = 0;
    
    // Iterar por cada socio
    for (const socioDoc of sociosSnapshot.docs) {
      const email = socioDoc.id;
      const socioData = socioDoc.data();
      const nombre = socioData.nombre || email;
      
      // Obtener todas las PETAs de este socio
      const petasSnapshot = await db
        .collection('socios')
        .doc(email)
        .collection('petas')
        .get();
      
      if (!petasSnapshot.empty) {
        sociosConPETAs++;
        console.log(`\n👤 ${nombre} (${email})`);
        console.log(`   PETAs encontradas: ${petasSnapshot.size}`);
        
        // Eliminar cada PETA
        for (const petaDoc of petasSnapshot.docs) {
          const petaData = petaDoc.data();
          const tipo = petaData.tipo || 'desconocido';
          const estado = petaData.estado || 'sin estado';
          const armas = petaData.armasIncluidas?.length || 0;
          const fecha = petaData.fechaSolicitud?.toDate()?.toLocaleDateString('es-MX') || 'N/A';
          
          console.log(`   🗑️  Eliminando: ${petaDoc.id}`);
          console.log(`      - Tipo: ${tipo}`);
          console.log(`      - Estado: ${estado}`);
          console.log(`      - Armas: ${armas}`);
          console.log(`      - Fecha: ${fecha}`);
          
          await petaDoc.ref.delete();
          totalPETAsEliminadas++;
        }
        
        console.log(`   ✅ ${petasSnapshot.size} PETA(s) eliminada(s)`);
      }
    }
    
    console.log('\n=========================================');
    console.log('📊 RESUMEN:');
    console.log(`   - Socios revisados: ${sociosSnapshot.size}`);
    console.log(`   - Socios con PETAs: ${sociosConPETAs}`);
    console.log(`   - Total PETAs eliminadas: ${totalPETAsEliminadas}`);
    console.log('=========================================\n');
    
    if (totalPETAsEliminadas === 0) {
      console.log('✅ No había solicitudes PETA para eliminar');
    } else {
      console.log('✅ TODAS LAS SOLICITUDES PETA HAN SIDO ELIMINADAS');
      console.log('   Las solicitudes se pueden regenerar desde el módulo admin');
    }
    
  } catch (error) {
    console.error('❌ Error al eliminar PETAs:', error);
    throw error;
  }
}

// Ejecutar
eliminarTodasLasPETAs()
  .then(() => {
    console.log('\n🎉 Proceso completado exitosamente');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 Error fatal:', err);
    process.exit(1);
  });

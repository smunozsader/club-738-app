/**
 * Verificar PETAs en Firestore
 * Muestra todos los socios que tienen solicitudes PETA
 */
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function verificarPETAs() {
  console.log('\n🔍 VERIFICACIÓN DE PETAs EN FIRESTORE\n');
  console.log('='.repeat(80));
  
  try {
    const sociosRef = db.collection('socios');
    const sociosSnap = await sociosRef.get();
    
    let totalSocios = 0;
    let sociosConPETAs = 0;
    let totalPETAs = 0;
    const petasPorEstado = {};
    
    for (const socioDoc of sociosSnap.docs) {
      totalSocios++;
      const socioEmail = socioDoc.id;
      const socioData = socioDoc.data();
      
      // Verificar subcolección petas
      const petasRef = db.collection('socios').doc(socioEmail).collection('petas');
      const petasSnap = await petasRef.get();
      
      if (!petasSnap.empty) {
        sociosConPETAs++;
        console.log(`\n📧 ${socioEmail} (${socioData.nombre || 'Sin nombre'})`);
        
        petasSnap.forEach(petaDoc => {
          totalPETAs++;
          const petaData = petaDoc.data();
          const estado = petaData.estado || 'sin_estado';
          
          petasPorEstado[estado] = (petasPorEstado[estado] || 0) + 1;
          
          console.log(`   └─ PETA ID: ${petaDoc.id}`);
          console.log(`      - Tipo: ${petaData.tipo || 'no especificado'}`);
          console.log(`      - Estado: ${estado}`);
          console.log(`      - Fecha solicitud: ${petaData.fechaSolicitud?.toDate().toLocaleDateString('es-MX') || 'sin fecha'}`);
          console.log(`      - Armas incluidas: ${petaData.armasIncluidas?.length || 0}`);
          console.log(`      - Renovación: ${petaData.esRenovacion ? 'Sí' : 'No'}`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 RESUMEN:');
    console.log(`   Total socios: ${totalSocios}`);
    console.log(`   Socios con PETAs: ${sociosConPETAs}`);
    console.log(`   Total PETAs: ${totalPETAs}`);
    console.log('\n📈 PETAs por estado:');
    Object.entries(petasPorEstado)
      .sort(([,a], [,b]) => b - a)
      .forEach(([estado, cantidad]) => {
        console.log(`   ${estado}: ${cantidad}`);
      });
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

verificarPETAs();

const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function verify() {
  try {
    const snapshot = await db.collection('socios').get();
    
    let nuevaEstructura = 0;
    let estructuraVieja = 0;
    let sinPagos = 0;
    let conPagos = 0;
    
    console.log('\n=== VERIFICACIÓN DE ESTRUCTURAS ===\n');
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const renovacion = data.renovacion2026;
      
      if (!renovacion) {
        sinPagos++;
        return;
      }
      
      if (renovacion.pagos && Array.isArray(renovacion.pagos)) {
        nuevaEstructura++;
        if (renovacion.pagos.length > 0) {
          conPagos++;
          console.log(`✅ ${data.nombre}`);
          console.log(`   Pagos: ${renovacion.pagos.map(p => `${p.concepto}($${p.monto})`).join(', ')}`);
        }
      } else if (renovacion.estado === 'pagado' || renovacion.montoPagado || renovacion.monto) {
        estructuraVieja++;
        console.log(`❌ ${data.nombre} - ESTRUCTURA VIEJA`);
        console.log(`   ${JSON.stringify(renovacion).substring(0, 100)}...`);
      }
    });
    
    console.log(`\n=== RESUMEN ===`);
    console.log(`✅ Nueva estructura (pagos[]): ${nuevaEstructura}`);
    console.log(`❌ Estructura vieja: ${estructuraVieja}`);
    console.log(`⏭️  Sin renovacion2026: ${sinPagos}`);
    console.log(`💰 Con pagos registrados: ${conPagos}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verify();

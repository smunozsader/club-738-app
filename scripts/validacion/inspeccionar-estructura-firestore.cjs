const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function inspeccionarEstructura() {
  try {
    console.log('🔍 Inspeccionando estructura de datos en Firestore...\n');
    
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.limit(5).get();
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 MUESTRA DE 5 SOCIOS (Estructura de datos)');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    snapshot.forEach((doc, index) => {
      const socio = doc.data();
      console.log(`${index + 1}. ${socio.nombre} (${doc.id})`);
      console.log(`   Credencial: ${socio.credencial || 'N/A'}`);
      console.log(`   Campos disponibles:`);
      console.log(`   - renovacion2026: ${JSON.stringify(socio.renovacion2026) || 'NO EXISTE'}`);
      console.log(`   - membresia2026: ${JSON.stringify(socio.membresia2026) || 'NO EXISTE'}`);
      console.log(`   - fechaAlta: ${socio.fechaAlta?.toDate() || 'N/A'}`);
      console.log('');
    });
    
    // Contar cuántos tienen cada campo
    const allSnapshot = await sociosRef.get();
    let conRenovacion = 0;
    let conMembresia = 0;
    let sinNada = 0;
    
    allSnapshot.forEach(doc => {
      const socio = doc.data();
      if (socio.renovacion2026) conRenovacion++;
      if (socio.membresia2026) conMembresia++;
      if (!socio.renovacion2026 && !socio.membresia2026) sinNada++;
    });
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 ESTADÍSTICAS DE CAMPOS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total socios: ${allSnapshot.size}`);
    console.log(`Con campo 'renovacion2026': ${conRenovacion}`);
    console.log(`Con campo 'membresia2026': ${conMembresia}`);
    console.log(`Sin ninguno de los dos: ${sinNada}`);
    console.log('');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ ERROR:', error);
    process.exit(1);
  }
}

inspeccionarEstructura();

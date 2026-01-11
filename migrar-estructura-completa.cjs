const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrar() {
  try {
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.get();
    
    let conPagos = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const renovacion = data.renovacion2026 || {};
      
      // CASO 1: Ya tiene pagos[]
      if (renovacion.pagos && Array.isArray(renovacion.pagos) && renovacion.pagos.length > 0) {
        return;
      }
      
      // CASO 2: Tiene membresia2026 (Santiago)
      if (data.membresia2026 && data.membresia2026.activa) {
        conPagos.push({
          nombre: data.nombre,
          email: doc.id,
          tipo: 'membresia2026',
          datos: data.membresia2026
        });
        return;
      }
      
      // CASO 3: Tiene array pagos en raíz
      if (data.pagos && Array.isArray(data.pagos) && data.pagos.length > 0) {
        conPagos.push({
          nombre: data.nombre,
          email: doc.id,
          tipo: 'pagos_array',
          datos: data.pagos
        });
        return;
      }
      
      // CASO 4: Tiene renovacion2026.estado = 'pagado' pero sin montoPagado
      if (renovacion.estado === 'pagado' && !renovacion.montoPagado) {
        conPagos.push({
          nombre: data.nombre,
          email: doc.id,
          tipo: 'renovacion_sin_monto',
          datos: renovacion
        });
      }
    });
    
    console.log(`\n=== SOCIOS CON PAGOS EN ESTRUCTURAS ALTERNATIVAS ===\n`);
    conPagos.forEach((s, i) => {
      console.log(`${i + 1}. ${s.nombre} (${s.email})`);
      console.log(`   Tipo: ${s.tipo}`);
      console.log(`   Datos: ${JSON.stringify(s.datos).substring(0, 150)}...`);
    });
    
    console.log(`\n✅ Total encontrados: ${conPagos.length}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

migrar();

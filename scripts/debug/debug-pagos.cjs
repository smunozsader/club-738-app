const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function debug() {
  try {
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.get();
    
    let pagados = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const renovacion = data.renovacion2026 || {};
      
      // ESTRUCTURA NUEVA: array de pagos individuales
      if (renovacion.pagos && Array.isArray(renovacion.pagos) && renovacion.pagos.length > 0) {
        const montoPagado = renovacion.pagos.reduce((sum, pago) => sum + (pago.monto || 0), 0);
        
        const conceptosPagados = renovacion.pagos.map(p => p.concepto);
        const tieneCuota = conceptosPagados.includes('cuota_anual');
        const tieneFemeti = conceptosPagados.includes('femeti_socio') || conceptosPagados.includes('femeti_nuevo');
        
        const pagoCopleto = tieneCuota && tieneFemeti;
        
        let estado = renovacion.exento ? 'exento' : (pagoCopleto ? 'pagado' : 'pendiente');
        
        if (renovacion.estado === 'pagado') {
          estado = 'pagado';
        }
        
        if (estado === 'pagado') {
          pagados.push({
            nombre: data.nombre,
            email: doc.id,
            montoPagado: montoPagado,
            conceptos: renovacion.pagos.map(p => `${p.concepto}($${p.monto})`).join(' + ')
          });
        }
      }
    });
    
    console.log('\n=== SOCIOS PAGADOS ===\n');
    let totalRecaudado = 0;
    pagados.forEach((s, i) => {
      console.log(`${i + 1}. ${s.nombre}`);
      console.log(`   Pagos: ${s.conceptos}`);
      console.log(`   Total: $${s.montoPagado}\n`);
      totalRecaudado += s.montoPagado;
    });
    
    console.log(`\n📊 RESUMEN`);
    console.log(`Total pagados: ${pagados.length}`);
    console.log(`Total recaudado: $${totalRecaudado}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debug();

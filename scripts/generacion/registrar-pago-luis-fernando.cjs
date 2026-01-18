const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function registrarPagoLuisFernando() {
  console.log('\n📝 Registrar pago de Luis Fernando Guillermo Gamboa');
  console.log('='.repeat(60));
  
  const email = 'oso.guigam@gmail.com';
  const socioRef = db.collection('socios').doc(email);
  
  try {
    // Verificar que existe
    const socioDoc = await socioRef.get();
    if (!socioDoc.exists) {
      console.log('❌ Socio no encontrado');
      process.exit(1);
    }
    
    console.log(`✅ Socio encontrado: ${socioDoc.data().nombre}`);
    
    // Actualizar con pago completo
    await socioRef.update({
      'renovacion2026.estado': 'pagado',
      'renovacion2026.monto': 6000,
      'renovacion2026.fecha': admin.firestore.Timestamp.fromDate(new Date('2026-01-08')),
      'renovacion2026.metodo': 'efectivo',
      'membresia2026.fechaPago': admin.firestore.Timestamp.fromDate(new Date('2026-01-08')),
      'membresia2026.monto': 8700, // Total: 2000 + 6000 + 700
      'membresia2026.desglose': {
        inscripcion: 2000,
        anualidad: 6000,
        femeti: 700
      },
      'membresia2026.metodoPago': 'efectivo',
      'membresia2026.registradoPor': 'smunozam@gmail.com',
      'membresia2026.notas': 'Socio nuevo #236 - Inscripción + Anualidad 2026 + FEMETI primer ingreso'
    });
    
    console.log('\n💰 Pago registrado:');
    console.log('   Fecha: 8 enero 2026');
    console.log('   Inscripción: $2,000 MXN');
    console.log('   Anualidad 2026: $6,000 MXN');
    console.log('   FEMETI nuevo: $700 MXN');
    console.log('   ─────────────────────');
    console.log('   Total: $8,700 MXN');
    console.log('\n✅ Estado actualizado a: PAGADO');
    
    // Verificar actualización
    const updatedDoc = await socioRef.get();
    const data = updatedDoc.data();
    console.log('\n📊 Datos actualizados:');
    console.log('   renovacion2026.estado:', data.renovacion2026?.estado);
    console.log('   membresia2026.monto:', data.membresia2026?.monto);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

registrarPagoLuisFernando();

const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * NUEVA ESTRUCTURA UNIFICADA:
 * renovacion2026: {
 *   estado: 'pagado' | 'pendiente' | 'exento',
 *   exento: boolean,
 *   motivoExencion: string | null,
 *   fechaLimite: timestamp,
 *   pagos: [{
 *     concepto: 'inscripcion' | 'cuota_anual' | 'femeti_socio' | 'femeti_nuevo',
 *     monto: number,
 *     metodoPago: string,
 *     fechaPago: timestamp,
 *     comprobante: string,
 *     notas: string,
 *     registradoPor: string,
 *     fechaRegistro: timestamp
 *   }]
 * }
 */

async function migrar() {
  try {
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.get();
    
    let migrados = 0;
    let conPagos = 0;
    let yaActualizado = 0;
    
    const updates = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const renovacion = data.renovacion2026;
      
      if (!renovacion) return; // Sin renovacion2026, saltar
      
      // CASO 1: Ya tiene estructura nueva (pagos array)
      if (renovacion.pagos && Array.isArray(renovacion.pagos)) {
        yaActualizado++;
        return;
      }
      
      let nuevoRenovacion = {
        exento: renovacion.exento || false,
        motivoExencion: renovacion.motivoExencion || null,
        fechaLimite: renovacion.fechaLimite || admin.firestore.Timestamp.fromDate(new Date('2026-02-28')),
        pagos: []
      };
      
      // CASO 2: Estructura vieja de Santiago (montoPagado, estado directo)
      if (renovacion.estado === 'pagado' && renovacion.montoPagado) {
        conPagos++;
        
        // Crear registro de pago consolidado
        const pago = {
          concepto: 'consolidado', // Pago anterior sin desglose
          monto: renovacion.montoPagado,
          metodoPago: renovacion.metodoPago || 'desconocido',
          fechaPago: renovacion.fechaPago || admin.firestore.Timestamp.now(),
          comprobante: renovacion.comprobante || '',
          notas: renovacion.notas || 'Pago anterior (migrado)',
          registradoPor: renovacion.registradoPor || 'sistema',
          fechaRegistro: renovacion.fechaPago || admin.firestore.Timestamp.now()
        };
        
        nuevoRenovacion.pagos.push(pago);
        nuevoRenovacion.estado = 'pagado';
      }
      
      // CASO 3: Estructura de Luis Fernando (monto, desglose, fecha)
      else if (renovacion.estado === 'pagado' && renovacion.monto) {
        conPagos++;
        
        // Si tiene desglose, crear pagos individuales
        if (renovacion.desglose) {
          if (renovacion.desglose.inscripcion) {
            nuevoRenovacion.pagos.push({
              concepto: 'inscripcion',
              monto: renovacion.desglose.inscripcion,
              metodoPago: renovacion.metodo || 'desconocido',
              fechaPago: renovacion.fecha ? admin.firestore.Timestamp.fromDate(new Date(renovacion.fecha._seconds * 1000)) : admin.firestore.Timestamp.now(),
              comprobante: '',
              notas: renovacion.notas || '',
              registradoPor: 'sistema',
              fechaRegistro: renovacion.fecha ? admin.firestore.Timestamp.fromDate(new Date(renovacion.fecha._seconds * 1000)) : admin.firestore.Timestamp.now()
            });
          }
          if (renovacion.desglose.anualidad) {
            nuevoRenovacion.pagos.push({
              concepto: 'cuota_anual',
              monto: renovacion.desglose.anualidad,
              metodoPago: renovacion.metodo || 'desconocido',
              fechaPago: renovacion.fecha ? admin.firestore.Timestamp.fromDate(new Date(renovacion.fecha._seconds * 1000)) : admin.firestore.Timestamp.now(),
              comprobante: '',
              notas: renovacion.notas || '',
              registradoPor: 'sistema',
              fechaRegistro: renovacion.fecha ? admin.firestore.Timestamp.fromDate(new Date(renovacion.fecha._seconds * 1000)) : admin.firestore.Timestamp.now()
            });
          }
          if (renovacion.desglose.femeti) {
            const concepto = renovacion.desglose.femeti === 700 ? 'femeti_nuevo' : 'femeti_socio';
            nuevoRenovacion.pagos.push({
              concepto: concepto,
              monto: renovacion.desglose.femeti,
              metodoPago: renovacion.metodo || 'desconocido',
              fechaPago: renovacion.fecha ? admin.firestore.Timestamp.fromDate(new Date(renovacion.fecha._seconds * 1000)) : admin.firestore.Timestamp.now(),
              comprobante: '',
              notas: renovacion.notas || '',
              registradoPor: 'sistema',
              fechaRegistro: renovacion.fecha ? admin.firestore.Timestamp.fromDate(new Date(renovacion.fecha._seconds * 1000)) : admin.firestore.Timestamp.now()
            });
          }
        } else {
          // Sin desglose, crear un pago consolidado
          nuevoRenovacion.pagos.push({
            concepto: 'consolidado',
            monto: renovacion.monto,
            metodoPago: renovacion.metodo || 'desconocido',
            fechaPago: renovacion.fecha ? admin.firestore.Timestamp.fromDate(new Date(renovacion.fecha._seconds * 1000)) : admin.firestore.Timestamp.now(),
            comprobante: '',
            notas: renovacion.notas || 'Pago anterior (migrado)',
            registradoPor: 'sistema',
            fechaRegistro: renovacion.fecha ? admin.firestore.Timestamp.fromDate(new Date(renovacion.fecha._seconds * 1000)) : admin.firestore.Timestamp.now()
          });
        }
        nuevoRenovacion.estado = 'pagado';
      }
      
      // CASO 4: Solo pendiente/exento sin pagos
      else if (renovacion.estado === 'exento' || renovacion.exento) {
        nuevoRenovacion.estado = 'exento';
      } else {
        nuevoRenovacion.estado = renovacion.estado || 'pendiente';
      }
      
      // Agregar a batch update
      if (nuevoRenovacion.pagos.length > 0 || renovacion.exento) {
        updates.push({
          ref: doc.ref,
          data: { renovacion2026: nuevoRenovacion },
          nombre: data.nombre,
          socios: data.email
        });
      }
    });
    
    console.log(`\n=== RESUMEN DE MIGRACIÓN ===`);
    console.log(`✅ Ya con estructura nueva: ${yaActualizado}`);
    console.log(`🔄 Con pagos para migrar: ${conPagos}`);
    console.log(`📝 Total a actualizar: ${updates.length}`);
    
    if (updates.length === 0) {
      console.log(`\nNo hay socios para migrar.`);
      process.exit(0);
    }
    
    console.log(`\n📋 Socios a migrar:`);
    updates.forEach((u, i) => {
      console.log(`${i + 1}. ${u.nombre} (${u.socios})`);
      console.log(`   Pagos: ${u.data.renovacion2026.pagos.length}`);
      u.data.renovacion2026.pagos.forEach(p => {
        console.log(`   - ${p.concepto}: $${p.monto}`);
      });
    });
    
    // Ejecutar updates
    console.log(`\n⏳ Actualizando Firebase...`);
    let batch = db.batch();
    let batchCount = 0;
    
    for (let i = 0; i < updates.length; i++) {
      batch.set(updates[i].ref, updates[i].data, { merge: true });
      batchCount++;
      
      if (batchCount === 100 || i === updates.length - 1) {
        await batch.commit();
        console.log(`✓ Batch actualizado (${Math.min(batchCount, updates.length - i)} documentos)`);
        batch = db.batch();
        batchCount = 0;
      }
    }
    
    console.log(`\n✅ Migración completada exitosamente!`);
    migrados = updates.length;
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

migrar();

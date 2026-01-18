const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * ESTRUCTURA UNIFICADA FINAL:
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
    
    const updates = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const renovacion = data.renovacion2026 || {};
      
      // SALTAR si ya tiene estructura correcta con pagos
      if (renovacion.pagos && Array.isArray(renovacion.pagos) && renovacion.pagos.length > 0) {
        return;
      }
      
      let nuevoRenovacion = null;
      
      // ========== CASO: membresia2026 (SANTIAGO) ==========
      if (data.membresia2026 && data.membresia2026.activa) {
        const m = data.membresia2026;
        
        // Inferir conceptos pagados basado en el monto
        let pagos = [];
        const monto = m.monto || 0;
        
        // Santiago pagó 6350: 6000 (anualidad) + 350 (FEMETI socio)
        // NO pagó inscripción (es socio antiguo)
        if (monto >= 6000) {
          pagos.push({
            concepto: 'cuota_anual',
            monto: 6000,
            metodoPago: m.metodoPago || 'desconocido',
            fechaPago: m.fechaPago ? admin.firestore.Timestamp.fromDate(new Date(m.fechaPago._seconds * 1000)) : admin.firestore.Timestamp.now(),
            comprobante: m.numeroRecibo || '',
            notas: '',
            registradoPor: 'sistema',
            fechaRegistro: m.fechaPago ? admin.firestore.Timestamp.fromDate(new Date(m.fechaPago._seconds * 1000)) : admin.firestore.Timestamp.now()
          });
        }
        
        const resto = monto - 6000;
        if (resto >= 350) {
          pagos.push({
            concepto: 'femeti_socio',
            monto: 350,
            metodoPago: m.metodoPago || 'desconocido',
            fechaPago: m.fechaPago ? admin.firestore.Timestamp.fromDate(new Date(m.fechaPago._seconds * 1000)) : admin.firestore.Timestamp.now(),
            comprobante: m.numeroRecibo || '',
            notas: '',
            registradoPor: 'sistema',
            fechaRegistro: m.fechaPago ? admin.firestore.Timestamp.fromDate(new Date(m.fechaPago._seconds * 1000)) : admin.firestore.Timestamp.now()
          });
        }
        
        nuevoRenovacion = {
          estado: 'pagado',
          exento: false,
          motivoExencion: null,
          fechaLimite: renovacion.fechaLimite || admin.firestore.Timestamp.fromDate(new Date('2026-02-28')),
          pagos: pagos
        };
      }
      
      // ========== CASO: renovacion2026.estado = 'pagado' sin pagos ==========
      else if (renovacion.estado === 'pagado' && !renovacion.pagos) {
        // Crear pago genérico con los datos disponibles
        let pagos = [];
        
        if (renovacion.montoPagado || renovacion.cuotaClub) {
          pagos.push({
            concepto: 'consolidado',
            monto: renovacion.montoPagado || renovacion.cuotaClub || 0,
            metodoPago: renovacion.metodoPago || 'desconocido',
            fechaPago: renovacion.fechaPago || admin.firestore.Timestamp.now(),
            comprobante: renovacion.comprobante || '',
            notas: renovacion.notas || 'Pago anterior (migrado)',
            registradoPor: renovacion.registradoPor || 'sistema',
            fechaRegistro: renovacion.fechaPago || admin.firestore.Timestamp.now()
          });
        }
        
        if (pagos.length > 0) {
          nuevoRenovacion = {
            estado: 'pagado',
            exento: false,
            motivoExencion: null,
            fechaLimite: renovacion.fechaLimite || admin.firestore.Timestamp.fromDate(new Date('2026-02-28')),
            pagos: pagos
          };
        }
      }
      
      if (nuevoRenovacion) {
        updates.push({
          email: data.nombre,
          ref: doc.ref,
          nuevoRenovacion: nuevoRenovacion
        });
      }
    });
    
    console.log(`\n=== RESUMEN DE MIGRACIÓN ===\n`);
    console.log(`📝 Total a actualizar: ${updates.length}`);
    
    updates.forEach((u, i) => {
      console.log(`\n${i + 1}. ${u.email}`);
      console.log(`   Pagos: ${u.nuevoRenovacion.pagos.map(p => `${p.concepto}($${p.monto})`).join(', ')}`);
    });
    
    if (updates.length > 0) {
      console.log(`\n⏳ Actualizando Firebase...`);
      
      let batch = db.batch();
      let batchCount = 0;
      
      for (let i = 0; i < updates.length; i++) {
        batch.set(updates[i].ref, { renovacion2026: updates[i].nuevoRenovacion }, { merge: true });
        batchCount++;
        
        if (batchCount === 100 || i === updates.length - 1) {
          await batch.commit();
          console.log(`✓ Batch actualizado`);
          batch = db.batch();
          batchCount = 0;
        }
      }
      
      console.log(`\n✅ Migración completada!`);
    } else {
      console.log(`\n✅ Todos los socios ya tienen la estructura correcta!`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

migrar();

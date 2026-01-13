/**
 * Script para enviar notificaciones masivas a todos los socios
 * 
 * Uso:
 * node scripts/enviar-notificacion-masiva.cjs
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function enviarNotificacionMasiva() {
  try {
    console.log('📢 Enviando notificación masiva a todos los socios...\n');

    // 1. Obtener todos los socios
    const sociosSnapshot = await db.collection('socios').get();
    
    if (sociosSnapshot.empty) {
      console.log('⚠️  No se encontraron socios en la base de datos.');
      process.exit(0);
    }

    console.log(`📊 Se enviarán notificaciones a ${sociosSnapshot.size} socios\n`);

    // 2. Plantilla de notificación (personalizar aquí)
    const plantillaNotificacion = {
      tipo: 'info', // info, warning, success, error
      titulo: 'Sistema actualizado - Nuevas funcionalidades',
      mensaje: 'El portal web del club ha sido actualizado. Ahora puedes gestionar tu arsenal, solicitar PETAs y agendar citas en línea. ¡Explora las nuevas funcionalidades!',
      leido: false,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      accionTexto: 'Explorar',
      accionUrl: '#dashboard'
    };

    // 3. Crear batch para escritura masiva (máximo 500 por batch)
    let batch = db.batch();
    let operaciones = 0;
    let totalEnviadas = 0;

    for (const socioDoc of sociosSnapshot.docs) {
      const socioEmail = socioDoc.id;

      // Crear referencia a nueva notificación
      const notifRef = db.collection('notificaciones').doc();

      // Agregar al batch
      batch.set(notifRef, {
        ...plantillaNotificacion,
        socioEmail: socioEmail
      });

      operaciones++;

      // Firebase permite máximo 500 operaciones por batch
      if (operaciones === 500) {
        await batch.commit();
        console.log(`✅ Batch de 500 notificaciones enviadas (Total: ${totalEnviadas + 500})`);
        totalEnviadas += 500;
        batch = db.batch(); // Crear nuevo batch
        operaciones = 0;
      }
    }

    // Commit del último batch (si quedan operaciones pendientes)
    if (operaciones > 0) {
      await batch.commit();
      totalEnviadas += operaciones;
      console.log(`✅ Batch final de ${operaciones} notificaciones enviadas`);
    }

    console.log(`\n🎉 Proceso completado. ${totalEnviadas} notificaciones enviadas exitosamente.\n`);
    console.log(`   Tipo: ${plantillaNotificacion.tipo}`);
    console.log(`   Título: ${plantillaNotificacion.titulo}`);
    console.log(`   Mensaje: ${plantillaNotificacion.mensaje}\n`);

  } catch (error) {
    console.error('❌ Error al enviar notificaciones masivas:', error);
  } finally {
    process.exit(0);
  }
}

// Confirmación antes de ejecutar
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('⚠️  ¿Estás seguro de enviar notificaciones a TODOS los socios? (s/n): ', (respuesta) => {
  readline.close();
  
  if (respuesta.toLowerCase() === 's') {
    enviarNotificacionMasiva();
  } else {
    console.log('❌ Operación cancelada.');
    process.exit(0);
  }
});

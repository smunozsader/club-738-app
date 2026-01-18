/**
 * Script para crear notificaciones de prueba en Firestore
 * 
 * Uso:
 * node scripts/crear-notificacion-prueba.cjs
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

async function crearNotificacionPrueba() {
  try {
    console.log('🔔 Creando notificación de prueba...\n');

    // Notificación de prueba para el admin (smunozam@gmail.com)
    const notificacion = {
      socioEmail: 'smunozam@gmail.com',
      tipo: 'info', // info, warning, success, error
      titulo: '¡Bienvenido al nuevo sistema!',
      mensaje: 'El portal ha sido actualizado con nuevas funcionalidades. Ahora puedes gestionar tu arsenal, solicitar PETAs y más.',
      leido: false,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      accionTexto: 'Ver novedades',
      accionUrl: '#dashboard'
    };

    const docRef = await db.collection('notificaciones').add(notificacion);
    
    console.log('✅ Notificación creada exitosamente');
    console.log(`   ID: ${docRef.id}`);
    console.log(`   Destinatario: ${notificacion.socioEmail}`);
    console.log(`   Tipo: ${notificacion.tipo}`);
    console.log(`   Título: ${notificacion.titulo}\n`);

    // Crear otra notificación de ejemplo (tipo warning)
    const notifWarning = {
      socioEmail: 'smunozam@gmail.com',
      tipo: 'warning',
      titulo: 'Documentos pendientes',
      mensaje: 'Tienes 3 documentos pendientes de subir para tu trámite PETA. Por favor completa tu expediente digital.',
      leido: false,
      fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
      accionTexto: 'Ver expediente',
      accionUrl: '#mi-expediente'
    };

    const docRef2 = await db.collection('notificaciones').add(notifWarning);
    
    console.log('✅ Segunda notificación creada');
    console.log(`   ID: ${docRef2.id}`);
    console.log(`   Tipo: ${notifWarning.tipo}`);
    console.log(`   Título: ${notifWarning.titulo}\n`);

    console.log('🎉 Proceso completado. Las notificaciones aparecerán en el dashboard.\n');

  } catch (error) {
    console.error('❌ Error al crear notificación:', error);
  } finally {
    process.exit(0);
  }
}

crearNotificacionPrueba();

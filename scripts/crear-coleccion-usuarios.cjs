/**
 * Script para crear colección 'usuarios' en Firestore
 * Define roles y permisos diferenciados para administradores y socios
 * 
 * Uso:
 *   node scripts/crear-coleccion-usuarios.cjs
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin (si no está ya inicializado)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// ============================================================================
// DATOS DE USUARIOS
// ============================================================================

const USUARIOS = [
  {
    email: 'admin@club738.com',
    role: 'administrator',
    nombre: 'Administrador del Sistema',
    emailNotificaciones: 'smunozam@gmail.com', // Emails de agenda van aquí
    permisos: {
      verTodosSocios: true,
      editarDatos: true,
      eliminarDocumentos: true,
      gestionarArmas: true,
      cobranza: true,
      verificarPETAs: true,
      generarPETAs: true,
      gestionarCitas: true
    },
    fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    email: 'smunozam@gmail.com',
    role: 'socio',
    nombre: 'Sergio Muñoz',
    esSocio: true,
    emailNotificaciones: 'smunozam@gmail.com',
    permisos: {
      verPropioDatos: true,
      subirDocumentos: true,
      solicitarPETA: true,
      verPropioArsenal: true,
      agendarCitas: true
    },
    fechaCreacion: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function crearColeccionUsuarios() {
  try {
    console.log('📋 Creando colección "usuarios" en Firestore...\n');
    
    for (const usuario of USUARIOS) {
      const userRef = db.collection('usuarios').doc(usuario.email);
      
      // Verificar si ya existe
      const doc = await userRef.get();
      if (doc.exists) {
        console.log(`⚠️  Usuario ${usuario.email} ya existe. Actualizando...`);
        await userRef.update({
          ...usuario,
          fechaActualizacion: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`   ✅ Actualizado: ${usuario.nombre} (${usuario.role})`);
      } else {
        await userRef.set(usuario);
        console.log(`✅ Creado: ${usuario.nombre} (${usuario.role})`);
      }
      
      console.log(`   Email: ${usuario.email}`);
      console.log(`   Rol: ${usuario.role}`);
      console.log(`   Notificaciones: ${usuario.emailNotificaciones}`);
      console.log('');
    }
    
    console.log('✅ Colección "usuarios" creada/actualizada exitosamente!\n');
    
    console.log('📊 Resumen de permisos:');
    console.log('\n🔐 ADMINISTRADOR (admin@club738.com):');
    console.log('   ✅ Ver todos los socios y expedientes');
    console.log('   ✅ Editar datos personales de socios');
    console.log('   ✅ Eliminar documentos (con log de auditoría)');
    console.log('   ✅ Gestionar armas (agregar, editar, eliminar)');
    console.log('   ✅ Gestión de cobranza');
    console.log('   ✅ Verificar y generar PETAs');
    console.log('   ✅ Gestionar citas');
    console.log('   📧 Notificaciones de agenda → smunozam@gmail.com');
    
    console.log('\n👤 SOCIO (smunozam@gmail.com y otros):');
    console.log('   ✅ Ver solo sus propios datos');
    console.log('   ✅ Subir documentos personales');
    console.log('   ✅ Solicitar PETAs');
    console.log('   ✅ Ver su propio arsenal');
    console.log('   ✅ Agendar citas');
    
    console.log('\n🔄 Siguiente paso:');
    console.log('   Actualizar firestore.rules con función isAdmin()');
    
  } catch (error) {
    console.error('❌ Error creando colección usuarios:', error);
    throw error;
  } finally {
    await admin.app().delete();
  }
}

// Ejecutar
crearColeccionUsuarios()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });

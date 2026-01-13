/**
 * Script para crear usuario administrador en Firebase Authentication
 * 
 * IMPORTANTE: Ejecutar solo UNA VEZ
 * 
 * Uso:
 *   node scripts/crear-usuario-admin.cjs
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// ============================================================================
// CREDENCIALES DEL ADMINISTRADOR
// ============================================================================
// ⚠️ GUARDAR ESTAS CREDENCIALES EN LUGAR SEGURO (1Password, LastPass, etc.)
// ⚠️ NO COMMITEAR ESTE ARCHIVO CON LAS CREDENCIALES REALES
const ADMIN_EMAIL = 'admin@club738.com';
const ADMIN_PASSWORD = 'Club738*Admin#2026!Seguro'; // Contraseña temporal - CAMBIAR en primer login

async function crearUsuarioAdmin() {
  try {
    console.log('🔐 Creando usuario administrador...\n');
    
    // Verificar si el usuario ya existe
    try {
      const existingUser = await admin.auth().getUserByEmail(ADMIN_EMAIL);
      console.log(`⚠️  El usuario ${ADMIN_EMAIL} ya existe.`);
      console.log(`   UID: ${existingUser.uid}`);
      console.log(`   Creado: ${existingUser.metadata.creationTime}`);
      console.log('\n✅ No es necesario crear el usuario nuevamente.');
      return;
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      // Usuario no existe, continuar con creación
    }
    
    // Crear usuario en Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: 'Administrador del Sistema',
      emailVerified: true // Marcar como verificado
    });
    
    console.log('✅ Usuario administrador creado exitosamente!\n');
    console.log('📋 Detalles de la cuenta:');
    console.log('   Email:', ADMIN_EMAIL);
    console.log('   Password:', ADMIN_PASSWORD);
    console.log('   UID:', userRecord.uid);
    console.log('   Creado:', userRecord.metadata.creationTime);
    
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   1. Guarda estas credenciales en un administrador de contraseñas');
    console.log('   2. Cambia la contraseña en el primer login');
    console.log('   3. NO compartas estas credenciales');
    console.log('   4. Los emails de agenda se enviarán a: smunozam@gmail.com');
    
    console.log('\n🔄 Siguiente paso:');
    console.log('   Ejecutar: node scripts/crear-coleccion-usuarios.cjs');
    
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
    throw error;
  } finally {
    // Cerrar conexión
    await admin.app().delete();
  }
}

// Ejecutar
crearUsuarioAdmin()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  });

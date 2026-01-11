/**
 * Script para crear usuario de Firebase para Iván Cabo
 * Genera credencial de acceso temporal que el socio puede cambiar
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

async function crearUsuarioIvanCabo() {
  const userData = {
    email: 'ivancabo@gmail.com',
    nombre: 'IVAN TSUIS CABO TORRES',
    credencial: '222',
    passwordTemporal: 'iVI979gie#'
  };

  try {
    console.log('\n🔍 Verificando si el usuario ya existe...');
    
    // Verificar si ya existe
    try {
      const existingUser = await auth.getUserByEmail(userData.email);
      console.log(`✅ Usuario ya existe: ${existingUser.email}`);
      console.log(`   UID: ${existingUser.uid}`);
      console.log(`   Creado: ${existingUser.metadata.creationTime}`);
      console.log('\n📋 Credenciales actuales:');
      console.log(`   Email: ${userData.email}`);
      console.log(`   Contraseña: (usar la que tiene actualmente o resetear)`);
      return;
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
      console.log('❌ Usuario no existe. Creando...\n');
    }

    // Crear el usuario en Firebase Auth
    console.log('📝 Creando usuario en Firebase Authentication...');
    const userRecord = await auth.createUser({
      email: userData.email,
      password: userData.passwordTemporal,
      emailVerified: false,
      disabled: false
    });

    console.log(`✅ Usuario creado exitosamente!`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Email: ${userRecord.email}\n`);

    // Crear documento en Firestore
    const db = admin.firestore();
    const socioRef = db.collection('socios').doc(userData.email.toLowerCase());
    
    console.log('📝 Creando documento en Firestore...');
    await socioRef.set({
      nombre: userData.nombre,
      email: userData.email.toLowerCase(),
      credencial: userData.credencial,
      totalArmas: 0,
      fechaAlta: admin.firestore.Timestamp.now(),
      bienvenidaVista: false,
      documentosPETA: {},
      renovacion2026: {
        estado: 'pendiente'
      }
    });

    console.log('✅ Documento de Firestore creado\n');

    // Mostrar credenciales
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📧 CREDENCIALES PARA IVAN TSUIS CABO TORRES');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   Portal: https://club-738-app.web.app`);
    console.log(`   Email: ${userData.email}`);
    console.log(`   Contraseña temporal: ${userData.passwordTemporal}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   1. Envía estas credenciales al socio de forma segura');
    console.log('   2. Indícale que cambie su contraseña inmediatamente');
    console.log('   3. La contraseña se puede cambiar desde "Mi Perfil"');
    console.log('   4. Si olvida su contraseña, puedes resetearla desde Firebase Console\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

crearUsuarioIvanCabo();

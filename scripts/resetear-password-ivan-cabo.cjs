/**
 * Script para resetear la contraseña de Iván Cabo
 * Genera nueva contraseña temporal
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

async function resetearPasswordIvanCabo() {
  const email = 'ivancabo@gmail.com';
  const uid = 'SNjdfLkiFIb9PnjWv63JuM7GGvC2';
  const nuevaPasswordTemporal = 'Club738-Cabo2026!';

  try {
    console.log('\n🔄 Reseteando contraseña para:', email);
    
    // Actualizar la contraseña usando UID
    await auth.updateUser(uid, {
      password: nuevaPasswordTemporal
    });

    console.log('✅ Contraseña actualizada exitosamente!\n');

    // Mostrar credenciales
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔑 NUEVAS CREDENCIALES PARA IVAN TSUIS CABO TORRES');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   Portal: https://club-738-app.web.app`);
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña temporal: ${nuevaPasswordTemporal}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n📱 INSTRUCCIONES PARA EL SOCIO:');
    console.log('   1. Ir a: https://club-738-app.web.app');
    console.log('   2. Iniciar sesión con estas credenciales');
    console.log('   3. Click en "⚙️ Mi Perfil" (arriba derecha)');
    console.log('   4. Cambiar a una contraseña personal');
    console.log('   5. Guardar cambios\n');
    
    console.log('⚠️  IMPORTANTE:');
    console.log('   - Envía estas credenciales por WhatsApp o email seguro');
    console.log('   - La contraseña es temporal y DEBE cambiarse');
    console.log('   - Si tiene problemas, puede usar "Olvidé mi contraseña"\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

resetearPasswordIvanCabo();

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

async function resetearPasswordEdgar() {
  const email = 'monfo87_@hotmail.com';
  const nuevaPassword = 'ClubEdgar738*'; // Password seguro y fácil de recordar
  
  console.log('\n🔐 Reseteando password de Edgar Monforte...\n');
  console.log(`📧 Email: ${email}`);
  console.log(`🆕 Nueva contraseña: ${nuevaPassword}`);
  console.log('\n⏳ Actualizando en Firebase Auth...');

  try {
    // Obtener usuario actual
    const userRecord = await auth.getUserByEmail(email);
    console.log(`✅ Usuario encontrado: ${userRecord.uid}`);
    
    // Actualizar password
    await auth.updateUser(userRecord.uid, {
      password: nuevaPassword
    });
    
    console.log('\n✅ ¡Password actualizado exitosamente!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 NUEVAS CREDENCIALES DE EDGAR MONFORTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${nuevaPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Enviar estas credenciales a Edgar Monforte por WhatsApp');
    console.log('🔗 Portal: https://club-738-app.web.app\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

resetearPasswordEdgar();

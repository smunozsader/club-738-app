const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();

async function verificarCredenciales() {
  console.log('\n🔍 Verificando credenciales de Paulino y Edgar Monforte...\n');

  const usuarios = [
    {
      nombre: 'Paulino Edilberto Monforte Trava',
      email: 'talleresmonforte@hotmail.com',
      passwordCSV: 'dLy922VcF#'
    },
    {
      nombre: 'Edgar Edilberto Monforte Escobedo',
      email: 'monfo87_@hotmail.com',
      passwordCSV: 'lZK969LWR$'
    }
  ];

  for (const usuario of usuarios) {
    console.log(`\n📧 ${usuario.nombre}`);
    console.log(`   Email: ${usuario.email}`);
    
    try {
      // Verificar si el usuario existe en Firebase Auth
      const userRecord = await auth.getUserByEmail(usuario.email);
      console.log(`   ✅ Usuario existe en Firebase Auth`);
      console.log(`   📅 Creado: ${new Date(userRecord.metadata.creationTime).toLocaleString('es-MX')}`);
      console.log(`   🔑 Último login: ${userRecord.metadata.lastSignInTime ? new Date(userRecord.metadata.lastSignInTime).toLocaleString('es-MX') : 'Nunca'}`);
      console.log(`   🆔 UID: ${userRecord.uid}`);
      
      // Intentar autenticar con la contraseña del CSV
      console.log(`   🔐 Password en CSV: ${usuario.passwordCSV}`);
      console.log(`   ⚠️  No se puede validar password directamente (Firebase Auth restricción)`);
      console.log(`   💡 Recomendación: Pedir al usuario que intente login o generar nuevo password`);
      
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log(`   ❌ Usuario NO existe en Firebase Auth`);
        console.log(`   💡 Recomendación: Crear usuario con script importar-usuarios-firebase.cjs`);
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  }

  console.log('\n✅ Verificación completada\n');
  process.exit(0);
}

verificarCredenciales().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

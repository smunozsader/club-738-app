const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = 'quiquis77@hotmail.com';
const newPassword = 'Club738Gaona2026!';

async function resetPassword() {
  try {
    // Buscar usuario por email
    const user = await admin.auth().getUserByEmail(email);
    console.log('Usuario encontrado:', user.uid);
    
    // Actualizar contraseña
    await admin.auth().updateUser(user.uid, {
      password: newPassword
    });
    
    console.log('✅ Contraseña actualizada exitosamente');
    console.log('');
    console.log('📧 Email:', email);
    console.log('🔑 Nueva contraseña:', newPassword);
    console.log('');
    console.log('Envía estos datos al socio por WhatsApp');
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('❌ Usuario no existe en Firebase Auth. Creando...');
      
      // Crear usuario nuevo
      const newUser = await admin.auth().createUser({
        email: email,
        password: newPassword,
        displayName: 'ENRIQUE GAONA CASTAÑEDA'
      });
      
      console.log('✅ Usuario creado:', newUser.uid);
      console.log('');
      console.log('📧 Email:', email);
      console.log('🔑 Contraseña:', newPassword);
    } else {
      console.error('Error:', error.message);
    }
  }
  
  process.exit(0);
}

resetPassword();

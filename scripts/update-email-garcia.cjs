const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const oldEmail = 'cudaosj@hotmail.com';
const newEmail = 'alveyc@hotmail.com';
const newPassword = 'Club738Garcia2026!';

async function updateEmail() {
  try {
    // Buscar usuario por email antiguo
    const user = await admin.auth().getUserByEmail(oldEmail);
    console.log('Usuario encontrado:', user.uid);
    console.log('Nombre:', user.displayName);
    
    // Actualizar email y contraseña
    await admin.auth().updateUser(user.uid, {
      email: newEmail,
      password: newPassword
    });
    
    console.log('');
    console.log('✅ Email y contraseña actualizados exitosamente');
    console.log('');
    console.log('📧 Nuevo email:', newEmail);
    console.log('🔑 Nueva contraseña:', newPassword);
    console.log('');
    console.log('Envía estos datos al socio por WhatsApp');
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log('❌ Usuario con email antiguo no existe. Creando con email nuevo...');
      
      const newUser = await admin.auth().createUser({
        email: newEmail,
        password: newPassword,
        displayName: 'ALEJANDRO JAVIER GARCÍA GAMBOA'
      });
      
      console.log('✅ Usuario creado:', newUser.uid);
      console.log('');
      console.log('📧 Email:', newEmail);
      console.log('🔑 Contraseña:', newPassword);
    } else {
      console.error('Error:', error.message);
    }
  }
  
  process.exit(0);
}

updateEmail();

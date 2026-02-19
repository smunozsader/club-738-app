const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = 'alveyc@hotmail.com';
const newPassword = 'Club738Garcia2026!';

async function updatePassword() {
  try {
    // Buscar usuario por email
    const user = await admin.auth().getUserByEmail(email);
    console.log('Usuario encontrado:', user.uid);
    console.log('Nombre actual:', user.displayName);
    
    // Actualizar contraseña y nombre
    await admin.auth().updateUser(user.uid, {
      password: newPassword,
      displayName: 'ALEJANDRO JAVIER GARCÍA GAMBOA'
    });
    
    console.log('');
    console.log('✅ Contraseña actualizada exitosamente');
    console.log('');
    console.log('📧 Email:', email);
    console.log('🔑 Nueva contraseña:', newPassword);
    console.log('');
    console.log('Envía estos datos al socio por WhatsApp (9999001272)');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

updatePassword();

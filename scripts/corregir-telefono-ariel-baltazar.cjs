const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function corregirTelefonoArielBaltazar() {
  console.log('\n📞 Corregir teléfono de Ariel Baltazar Córdoba Wilson');
  console.log('='.repeat(60));
  
  const email = 'atietzbabam@gmail.com';
  const telefonoCorrecto = '9992003314';
  
  const socioRef = db.collection('socios').doc(email);
  
  try {
    const doc = await socioRef.get();
    
    if (!doc.exists) {
      console.log('❌ Socio no encontrado');
      process.exit(1);
    }
    
    const data = doc.data();
    console.log(`\n✅ Socio: ${data.nombre}`);
    console.log(`   Teléfono anterior: ${data.telefono || data.celular || 'NO REGISTRADO'}`);
    console.log(`   Teléfono correcto: ${telefonoCorrecto} (+52 999 200 3314)`);
    
    // Actualizar teléfono
    await socioRef.update({
      telefono: telefonoCorrecto
    });
    
    console.log('\n✅ Teléfono actualizado correctamente');
    
    // Verificar
    const updatedDoc = await socioRef.get();
    const updatedData = updatedDoc.data();
    console.log(`\n📊 Verificación:`);
    console.log(`   Nuevo teléfono registrado: ${updatedData.telefono}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

corregirTelefonoArielBaltazar();

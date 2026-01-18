const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

if (admin.apps.length === 0) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function agregarSocioFaltante() {
  const email = 'richfer0304@gmail.com';
  
  const domicilio = {
    calle: 'C. 37-A # 311 X 24',
    colonia: 'FRACC. MONTEALBAN',
    municipio: 'MERIDA',
    estado: 'YUCATAN',
    cp: '97114'
  };
  
  const socioRef = db.collection('socios').doc(email);
  const docSnap = await socioRef.get();
  
  if (docSnap.exists) {
    // Ya existe, solo actualizar domicilio
    await socioRef.update({ domicilio });
    console.log('✅ Domicilio actualizado para:', email);
  } else {
    // No existe, crear documento completo
    await socioRef.set({
      nombre: '232. RICARDO DANIEL FERNÁNDEZ PÉREZ',
      email: email,
      noSocio: '232',
      consecutivo: 232,
      domicilio: domicilio,
      totalArmas: 0,
      documentosCompletos: false,
      ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Socio creado con domicilio:', email);
  }
  
  // Verificar
  const verificar = await socioRef.get();
  console.log('\nDatos guardados:');
  console.log(JSON.stringify(verificar.data().domicilio, null, 2));
}

agregarSocioFaltante()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

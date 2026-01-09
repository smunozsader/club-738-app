const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

// Datos del nuevo socio
const nuevoSocio = {
  credencial: 236,
  nombre: 'LUIS FERNANDO GUILLERMO GAMBOA',
  curp: 'GUGL750204HYNLMS04',
  email: 'oso.guigam@gmail.com',
  telefono: '9992420621',
  domicilio: {
    calle: 'Calle 32 x 9 Cedro, Tablaje 23222',
    colonia: 'Loc. Tixcuytun',
    municipio: 'Mérida',
    ciudad: 'Mérida',
    estado: 'YUCATÁN',
    cp: '97305'
  },
  fechaAlta: admin.firestore.Timestamp.fromDate(new Date('2026-01-08')),
  totalArmas: 0,
  bienvenidaVista: false
};

// Password temporal
const passwordTemporal = 'Club738-' + nuevoSocio.curp.substring(0, 6);

async function agregarSocio() {
  try {
    console.log('🔹 Agregando socio: ' + nuevoSocio.nombre);
    console.log('   Email: ' + nuevoSocio.email);
    console.log('   Password temporal: ' + passwordTemporal);
    
    // 1. Crear usuario en Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: nuevoSocio.email,
        password: passwordTemporal,
        displayName: nuevoSocio.nombre
      });
      console.log('✅ Usuario creado en Auth: ' + userRecord.uid);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('⚠️  Usuario ya existe en Auth, obteniendo UID...');
        userRecord = await auth.getUserByEmail(nuevoSocio.email);
        console.log('   UID: ' + userRecord.uid);
      } else {
        throw error;
      }
    }
    
    // 2. Crear documento en Firestore
    const socioRef = db.collection('socios').doc(nuevoSocio.email);
    await socioRef.set(nuevoSocio);
    console.log('✅ Documento creado en Firestore');
    
    console.log('\n✅ SOCIO AGREGADO EXITOSAMENTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Credencial: ' + nuevoSocio.credencial);
    console.log('Nombre: ' + nuevoSocio.nombre);
    console.log('Email: ' + nuevoSocio.email);
    console.log('Password temporal: ' + passwordTemporal);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ ERROR:', error);
    process.exit(1);
  }
}

agregarSocio();

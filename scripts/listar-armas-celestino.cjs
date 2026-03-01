const admin = require('firebase-admin');

// La ruta al archivo de clave de cuenta de servicio
const serviceAccount = require('./serviceAccountKey.json');

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    console.log('Admin App ya está inicializada.');
  } else {
    console.error('Error inicializando Admin App:', error);
    process.exit(1);
  }
}

const db = admin.firestore();
const email = 'tinosanchezf@yahoo.com.mx';

const listarArmas = async () => {
  console.log(`Buscando armas para el socio: ${email}`);
  
  const armasRef = db.collection('socios').doc(email).collection('armas');
  
  try {
    const snapshot = await armasRef.get();
    
    if (snapshot.empty) {
      console.log('No se encontraron armas para este socio.');
      return;
    }
    
    console.log('--- Armas encontradas en Firestore ---');
    snapshot.forEach(doc => {
      const arma = doc.data();
      console.log(`
  ID del Documento: ${doc.id}
  Marca:            ${arma.marca || 'N/A'}
  Modelo:           ${arma.modelo || 'N/A'}
  Calibre:          ${arma.calibre || 'N/A'}
  Matrícula:        ${arma.matricula || 'N/A'}
  Folio:            ${arma.folio || 'N/A'}
  Registro PDF:     ${arma.documentoRegistro ? 'Sí' : 'Pendiente'}
  ------------------------------------`);
    });

  } catch (error) {
    console.error('Error al obtener las armas:', error);
  }
};

listarArmas().then(() => {
  // Cierra la conexión de la base de datos para que el script termine
  // admin.app().delete();
}).catch(error => {
  console.error(error);
  // admin.app().delete();
});

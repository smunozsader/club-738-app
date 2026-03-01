const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// --- Configuración ---
const serviceAccount = require('./serviceAccountKey.json');
const bucketName = 'club-738-app.firebasestorage.app'; 
const email = 'tinosanchezf@yahoo.com.mx';

// Mapeo de archivos locales a IDs de documentos de armas en Firestore
const armasParaActualizar = [
  {
    armaId: 'cz_p07_d207727',
    pdfPath: './2026. celestino. armas nuevas/CZ P-07 CelestinoSánchez.pdf',
    modelo: 'CZ P-07'
  },
  {
    armaId: 'cz_p10c_cp18665',
    pdfPath: './2026. celestino. armas nuevas/CZ P-10 C. CelestinoSánchez.pdf',
    modelo: 'CZ P-10 C'
  },
  {
    armaId: 'sigsauer_p250',
    pdfPath: './2026. celestino. armas nuevas/Sigsauer P250 registro actual.pdf',
    modelo: 'SIG SAUER P250'
  },
  {
    armaId: 'winchester_9422',
    pdfPath: './2026. celestino. armas nuevas/rifle winchester 22 lr modelo 9422 .pdf',
    modelo: 'WINCHESTER 9422'
  }
];
// --- Fin de la Configuración ---

// Inicializar Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: bucketName
  });
} catch (error) {
  if (error.code !== 'app/duplicate-app') {
    console.error('Error inicializando Admin App:', error);
    process.exit(1);
  }
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

const subirYActualizar = async () => {
  console.log(`--- Iniciando proceso para ${email} ---`);

  for (const arma of armasParaActualizar) {
    console.log(`\nProcesando: ${arma.modelo} (ID: ${arma.armaId})`);

    // 1. Verificar que el archivo PDF exista localmente
    if (!fs.existsSync(arma.pdfPath)) {
      console.error(`  [ERROR] El archivo no existe en la ruta local: ${arma.pdfPath}`);
      continue; // Saltar al siguiente
    }

    // 2. Definir la ruta de destino en Firebase Storage
    const destinationPath = `documentos/${email}/armas/${arma.armaId}/registro.pdf`;
    
    try {
      // 3. Subir el archivo
      console.log(`  Subiendo ${path.basename(arma.pdfPath)} a Storage...`);
      await bucket.upload(arma.pdfPath, {
        destination: destinationPath,
        metadata: {
          contentType: 'application/pdf',
          cacheControl: 'public, max-age=31536000',
        },
      });
      console.log('  ✅ Archivo subido con éxito.');

      // 4. Actualizar el documento en Firestore
      console.log(`  Actualizando Firestore: poniendo 'documentoRegistro' en 'true'...`);
      const armaRef = db.collection('socios').doc(email).collection('armas').doc(arma.armaId);
      await armaRef.update({
        documentoRegistro: true,
        fechaRegistroSubido: admin.firestore.FieldValue.serverTimestamp() // Opcional: guardar fecha de subida
      });
      console.log('  ✅ Firestore actualizado.');

    } catch (error) {
      console.error(`  [ERROR] Falló el proceso para ${arma.modelo}:`, error.message);
    }
  }
  console.log(`\n--- Proceso completado ---`);
};

subirYActualizar().catch(console.error);

/**
 * Script para sincronizar CURPs desde Storage a Firestore
 */
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function sincronizarCurps() {
  try {
    console.log('🔄 Sincronizando CURPs desde Storage a Firestore...\n');

    // Obtener todos los socios
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.get();

    let sincronizados = 0;
    let yaExistian = 0;
    let noEncontrados = 0;

    for (const doc of snapshot.docs) {
      const email = doc.id;
      const socioData = doc.data();
      const nombre = socioData.nombre;

      // Verificar si ya tiene CURP en documentosPETA
      const tieneCurp = socioData.documentosPETA?.curp?.url;

      if (tieneCurp) {
        yaExistian++;
        continue;
      }

      // Buscar archivo de CURP en Storage
      const curpPath = `documentos/${email}/curp.pdf`;
      const [files] = await bucket.getFiles({ prefix: curpPath });

      if (files.length > 0) {
        const file = files[0];
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '03-01-2500' // Fecha muy lejana
        });

        // Obtener URL pública
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(file.name)}?alt=media`;

        // Actualizar Firestore
        await sociosRef.doc(email).update({
          'documentosPETA.curp': {
            url: publicUrl,
            verificado: false,
            fechaSubida: admin.firestore.FieldValue.serverTimestamp()
          }
        });

        console.log(`✅ ${nombre} - CURP sincronizado`);
        sincronizados++;
      } else {
        console.log(`⚠️  ${nombre} - No se encontró CURP en Storage`);
        noEncontrados++;
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`  ✅ CURPs sincronizados: ${sincronizados}`);
    console.log(`  ℹ️  Ya existían: ${yaExistian}`);
    console.log(`  ⚠️  No encontrados: ${noEncontrados}`);
    console.log(`  📝 Total de socios: ${snapshot.size}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

sincronizarCurps();

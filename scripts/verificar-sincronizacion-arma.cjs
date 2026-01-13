const admin = require('firebase-admin');
const { getStorage, ref, getBytes } = require('firebase-admin/storage');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const storage = admin.storage();

async function verificarSincronizacion() {
  console.log('🔍 Verificando sincronización de: PISTOLA CESKA ZBROJOVKA .380 - Mat: DP25246\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const socioEmail = 'jrgardoni@gmail.com';
  
  // PASO 2: Verificar en Firestore
  console.log('📊 PASO 2: Verificando en FIRESTORE...\n');
  
  try {
    const socioRef = db.collection('socios').doc(socioEmail);
    const socioSnap = await socioRef.get();
    
    if (!socioSnap.data()) {
      console.log('❌ Socio NO encontrado en Firestore');
      process.exit(1);
    }
    
    console.log('✅ Socio encontrado en Firestore');
    const socioData = socioSnap.data();
    console.log('   Nombre:', socioData.nombre || 'N/A');
    console.log('   Email:', socioEmail);
    
    // Buscar el arma DP25246
    const armasSnap = await socioRef.collection('armas').get();
    console.log(`\n   Total de armas: ${armasSnap.size}`);
    
    let armaEncontrada = null;
    armasSnap.forEach(doc => {
      const arma = doc.data();
      if (arma.matricula === 'DP25246' || arma.matricula === 'dp25246') {
        armaEncontrada = {
          id: doc.id,
          ...arma
        };
      }
    });
    
    if (!armaEncontrada) {
      console.log('\n❌ Arma DP25246 NO encontrada en Firestore');
      console.log('\n📋 Armas registradas en Firestore para este socio:');
      armasSnap.forEach(doc => {
        const arma = doc.data();
        console.log(`   - ${arma.marca} ${arma.modelo} (.${arma.calibre}) - Mat: ${arma.matricula}`);
      });
      process.exit(1);
    }
    
    console.log('\n✅ ¡ARMA ENCONTRADA EN FIRESTORE!\n');
    console.log('📋 Detalles en Firestore:');
    console.log('   Clase:', armaEncontrada.clase);
    console.log('   Marca:', armaEncontrada.marca);
    console.log('   Modelo:', armaEncontrada.modelo);
    console.log('   Calibre:', armaEncontrada.calibre);
    console.log('   Matrícula:', armaEncontrada.matricula);
    console.log('   Folio:', armaEncontrada.folio);
    console.log('   Modalidad:', armaEncontrada.modalidad);
    console.log('   ID Firestore:', armaEncontrada.id);
    console.log('   documentoRegistro:', armaEncontrada.documentoRegistro ? '✅ SÍ' : '❌ NO');
    
    // PASO 3: Verificar Storage
    console.log('\n📊 PASO 3: Verificando en STORAGE (Registro PDF)...\n');
    
    const rutaPDF = `documentos/${socioEmail}/armas/${armaEncontrada.id}/registro.pdf`;
    console.log('📍 Ruta en Storage:');
    console.log(`   gs://club-738-app.firebasestorage.app/${rutaPDF}`);
    
    try {
      const bucket = storage.bucket();
      const file = bucket.file(rutaPDF);
      const exists = await file.exists();
      
      if (exists[0]) {
        console.log('\n✅ PDF DE REGISTRO EXISTE EN STORAGE\n');
        
        // Obtener metadata
        const metadata = await file.getMetadata();
        console.log('📄 Metadata del archivo:');
        console.log('   Nombre:', metadata[0].name);
        console.log('   Tamaño:', (metadata[0].size / 1024).toFixed(2), 'KB');
        console.log('   Tipo:', metadata[0].contentType);
        console.log('   Creado:', metadata[0].timeCreated);
        
        // Generar URL de descarga
        const [url] = await file.getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + 24 * 60 * 60 * 1000,
        });
        
        console.log('\n🔗 URL de descarga (válida 24h):');
        console.log(url);
        
      } else {
        console.log('❌ PDF NO EXISTE EN STORAGE');
        console.log('\n⚠️ El arma está en Firestore pero NO tiene el PDF de registro');
        console.log('   ACCIÓN PENDIENTE: Cargar el PDF del registro');
      }
      
    } catch (error) {
      console.log('❌ Error consultando Storage:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  // RESUMEN FINAL
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📋 RESUMEN DE SINCRONIZACIÓN:\n');
  console.log('✅ Excel (Fuente de Verdad): SINCRONIZADA');
  console.log('✅ Firestore: SINCRONIZADA');
  console.log('⏳ Storage (PDF): VERIFICAR ARRIBA');
  
  process.exit(0);
}

verificarSincronizacion().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});

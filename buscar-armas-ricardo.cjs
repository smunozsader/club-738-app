const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const storage = admin.storage().bucket();

async function buscarArmasRicardo() {
  const email = 'ridesquens@yahoo.com.mx';
  
  console.log('=== BÚSQUEDA EXHAUSTIVA DE PDFs DE ARMAS ===');
  console.log('Socio: RICARDO ALBERTO DESQUENS BONILLA');
  console.log('Email:', email);
  console.log('');
  
  // Buscar TODOS los archivos del socio
  console.log('--- TODOS LOS ARCHIVOS EN STORAGE ---');
  const [allFiles] = await storage.getFiles({ 
    prefix: `documentos/${email}/`,
    autoPaginate: true 
  });
  
  console.log(`Total de archivos encontrados: ${allFiles.length}`);
  console.log('');
  
  allFiles.forEach((file, index) => {
    const fileName = file.name;
    const isArmaFile = fileName.includes('/armas/') || 
                       fileName.toLowerCase().includes('registro') ||
                       fileName.toLowerCase().includes('rfa');
    
    if (isArmaFile) {
      console.log(`🔫 [${index + 1}] ${fileName}`);
    } else {
      console.log(`📄 [${index + 1}] ${fileName}`);
    }
  });
  
  console.log('');
  console.log('--- BUSCAR ARCHIVOS CON TIMESTAMP RECIENTE ---');
  
  // Buscar archivos subidos en los últimos 30 días
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentFiles = allFiles.filter(file => {
    return file.metadata.timeCreated && 
           new Date(file.metadata.timeCreated) > thirtyDaysAgo;
  });
  
  if (recentFiles.length > 0) {
    console.log(`Archivos subidos en los últimos 30 días: ${recentFiles.length}`);
    recentFiles.forEach(file => {
      console.log(`  ✅ ${file.name}`);
      console.log(`     Fecha: ${file.metadata.timeCreated}`);
    });
  } else {
    console.log('❌ No hay archivos recientes (últimos 30 días)');
  }
  
  console.log('');
  console.log('--- VERIFICAR ESTRUCTURA ESPERADA ---');
  console.log('Ruta esperada para PDFs de armas:');
  console.log(`  documentos/${email}/armas/{armaId}/registro.pdf`);
  console.log('');
  
  // Buscar específicamente en carpeta armas
  const [armaFiles] = await storage.getFiles({ 
    prefix: `documentos/${email}/armas/` 
  });
  
  if (armaFiles.length === 0) {
    console.log('❌ CONFIRMADO: No hay archivos en documentos/{email}/armas/');
    console.log('');
    console.log('POSIBLES CAUSAS:');
    console.log('1. El socio NO completó la subida de PDFs desde el portal');
    console.log('2. Los PDFs están en otra ruta (revisar listado completo arriba)');
    console.log('3. Los PDFs fueron borrados accidentalmente');
  } else {
    console.log(`✅ Se encontraron ${armaFiles.length} archivos en carpeta armas/`);
    armaFiles.forEach(file => {
      console.log(`  ${file.name}`);
    });
  }
}

buscarArmasRicardo()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

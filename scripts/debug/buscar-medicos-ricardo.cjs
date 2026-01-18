const admin = require('firebase-admin');
const serviceAccount = require('./scripts/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const storage = admin.storage().bucket();

async function buscarMedicosHuerfanos() {
  console.log('=== BÚSQUEDA DE DOCUMENTOS MÉDICOS HUÉRFANOS ===');
  console.log('Buscando: Ricardo / Desquens / certificados médicos...\n');
  
  // Buscar en toda la raíz de documentos/
  const [allFiles] = await storage.getFiles({ prefix: 'documentos/' });
  
  console.log(`Total de archivos encontrados: ${allFiles.length}\n`);
  
  // Filtrar por criterios
  const criterios = [
    'ricardo',
    'desquens',
    'medico',
    'toxico',
    'psico',
    'certificado'
  ];
  
  console.log('--- ARCHIVOS SOSPECHOSOS (pueden estar huérfanos) ---\n');
  
  let encontrados = 0;
  
  allFiles.forEach(file => {
    const fileName = file.name.toLowerCase();
    const matchesCriterio = criterios.some(criterio => fileName.includes(criterio));
    
    if (matchesCriterio) {
      const ext = file.name.split('.').pop().toUpperCase();
      const size = (file.metadata.size / 1024).toFixed(2);
      const fecha = new Date(file.metadata.timeCreated).toLocaleString('es-MX');
      
      console.log(`📄 ${file.name}`);
      console.log(`   Formato: ${ext} | Tamaño: ${size} KB | Subido: ${fecha}`);
      console.log('');
      encontrados++;
    }
  });
  
  if (encontrados === 0) {
    console.log('❌ No se encontraron archivos médicos con esos criterios\n');
  } else {
    console.log(`✅ Total encontrado: ${encontrados} archivo(s)\n`);
  }
  
  // Buscar específicamente archivos subidos ayer (15 enero 2026)
  console.log('--- ARCHIVOS SUBIDOS AYER (15 ENE 2026) ---\n');
  const ayer = new Date('2026-01-15');
  const manana = new Date('2026-01-16');
  
  let subidosAyer = 0;
  
  allFiles.forEach(file => {
    const fechaSubida = new Date(file.metadata.timeCreated);
    
    if (fechaSubida >= ayer && fechaSubida < manana) {
      const ext = file.name.split('.').pop().toUpperCase();
      const size = (file.metadata.size / 1024).toFixed(2);
      const hora = fechaSubida.toLocaleTimeString('es-MX');
      
      console.log(`📤 ${file.name}`);
      console.log(`   ${ext} | ${size} KB | ${hora}`);
      console.log('');
      subidosAyer++;
    }
  });
  
  if (subidosAyer === 0) {
    console.log('❌ No se encontraron archivos subidos el 15 de enero\n');
  } else {
    console.log(`✅ Total subidos ayer: ${subidosAyer} archivo(s)\n`);
  }
}

buscarMedicosHuerfanos()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

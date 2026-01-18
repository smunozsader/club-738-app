const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const storage = admin.storage();

async function buscarPDF() {
  console.log('🔍 Buscando PDF de registro para: PISTOLA CESKA ZBROJOVKA .380 - Mat: DP25246\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const socioEmail = 'jrgardoni@gmail.com';
  const armaId = '2aa851f3-a0e2-4000-8599-907b48c9ddd1';
  const rutaPDF = `documentos/${socioEmail}/armas/${armaId}/registro.pdf`;

  // BÚSQUEDA 1: Storage (ruta esperada)
  console.log('📊 BÚSQUEDA 1: Storage - Ruta esperada\n');
  console.log('📍 Ruta:', rutaPDF);
  
  let pdfEnStorage = false;
  
  try {
    const bucket = storage.bucket('club-738-app.firebasestorage.app');
    const file = bucket.file(rutaPDF);
    const [exists] = await file.exists();
    
    if (exists) {
      pdfEnStorage = true;
      console.log('✅ ¡PDF ENCONTRADO EN STORAGE!\n');
      
      const metadata = await file.getMetadata();
      console.log('📄 Metadata:');
      console.log('   Tamaño:', (metadata[0].size / 1024).toFixed(2), 'KB');
      console.log('   Tipo:', metadata[0].contentType);
      console.log('   Creado:', metadata[0].timeCreated);
    } else {
      console.log('❌ PDF no encontrado en Storage\n');
    }
  } catch (error) {
    console.log('❌ Error verificando Storage:', error.message, '\n');
  }

  // BÚSQUEDA 2: Búsqueda local en carpetas del proyecto
  console.log('📊 BÚSQUEDA 2: Búsqueda local en carpetas del proyecto\n');
  
  const carpetasABuscar = [
    '/Applications/club-738-web/pdfs',
    '/Applications/club-738-web/documentos',
    '/Applications/club-738-web/registros',
    '/Applications/club-738-web/Base datos',
    '/Applications/club-738-web/scripts',
    path.join(process.env.HOME, 'Downloads'),
    path.join(process.env.HOME, 'Desktop')
  ];
  
  let pdfLocal = null;
  
  for (const carpeta of carpetasABuscar) {
    if (!fs.existsSync(carpeta)) continue;
    
    console.log(`🔎 Buscando en: ${carpeta}`);
    
    try {
      const buscarRecursivo = (dir, patron) => {
        const archivos = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const archivo of archivos) {
          const ruta = path.join(dir, archivo.name);
          
          if (archivo.isDirectory()) {
            if (archivo.name !== 'node_modules' && archivo.name !== '.git') {
              const resultado = buscarRecursivo(ruta, patron);
              if (resultado) return resultado;
            }
          } else if (archivo.name.toLowerCase().includes('dp25246') || 
                     archivo.name.toLowerCase().includes('registro')) {
            if (archivo.name.toLowerCase().endsWith('.pdf')) {
              return { ruta, nombre: archivo.name };
            }
          }
        }
        return null;
      };
      
      const resultado = buscarRecursivo(carpeta, 'DP25246');
      if (resultado) {
        pdfLocal = resultado;
        console.log(`   ✅ Encontrado: ${resultado.nombre}`);
        console.log(`      Ruta: ${resultado.ruta}\n`);
        break;
      } else {
        console.log('   ❌ No encontrado');
      }
    } catch (error) {
      console.log(`   ⚠️ Error: ${error.message}`);
    }
  }

  // RESUMEN Y DOCUMENTACIÓN
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📋 RESUMEN DE BÚSQUEDA:\n');
  
  if (pdfEnStorage) {
    console.log('✅ PDF ENCONTRADO EN STORAGE');
  } else if (pdfLocal) {
    console.log('⚠️ PDF ENCONTRADO LOCALMENTE (no en Storage)');
    console.log(`   Ubicación: ${pdfLocal.ruta}`);
    console.log('\n   ACCIÓN RECOMENDADA: Cargar este PDF a Storage');
  } else {
    console.log('❌ PDF NO ENCONTRADO EN NINGÚN LUGAR');
    console.log('\n   ESTADO: PENDIENTE - Requiere carga de documento');
  }

  // Documentar en archivo de seguimiento
  const archivoSeguimiento = '/Applications/club-738-web/docs/SEGUIMIENTO_DOCUMENTOS_PENDIENTES.md';
  
  const timestamp = new Date().toLocaleString('es-MX');
  let contenido = '';
  
  if (fs.existsSync(archivoSeguimiento)) {
    contenido = fs.readFileSync(archivoSeguimiento, 'utf8');
  } else {
    contenido = '# 📋 Seguimiento de Documentos Pendientes\n\n';
    contenido += '**Generado automáticamente por script de búsqueda**\n\n';
  }

  // Agregar entrada para esta arma si no existe
  if (!contenido.includes('DP25246')) {
    contenido += '\n## PISTOLA CESKA ZBROJOVKA .380 - Mat: DP25246\n\n';
    contenido += `- **Socio**: JOAQUIN RODOLFO GARDONI NUÑEZ (jrgardoni@gmail.com)\n`;
    contenido += `- **Credencial**: 199\n`;
    contenido += `- **ID Firestore**: 2aa851f3-a0e2-4000-8599-907b48c9ddd1\n`;
    contenido += `- **Folio**: A 3792515\n`;
    contenido += `- **Modalidad**: TIRO\n`;
    contenido += `- **Estado**: `;
    
    if (pdfEnStorage) {
      contenido += '✅ PDF EN STORAGE\n';
    } else if (pdfLocal) {
      contenido += `⚠️ PDF LOCAL (sin sincronizar)\n`;
      contenido += `  - Ubicación local: ${pdfLocal.ruta}\n`;
      contenido += `  - Acción: Cargar a Storage\n`;
    } else {
      contenido += '❌ PDF PENDIENTE\n';
      contenido += `  - Ruta esperada en Storage: documentos/jrgardoni@gmail.com/armas/2aa851f3-a0e2-4000-8599-907b48c9ddd1/registro.pdf\n`;
      contenido += `  - Acción: SOLICITAR REGISTRO A SOCIO\n`;
    }
    
    contenido += `- **Verificado**: ${timestamp}\n`;
    contenido += `- **Notas**: Búsqueda automática de PDF\n`;
  }

  fs.writeFileSync(archivoSeguimiento, contenido, 'utf8');
  
  console.log('\n✅ Documentado en:', archivoSeguimiento);
  process.exit(0);
}

buscarPDF().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});

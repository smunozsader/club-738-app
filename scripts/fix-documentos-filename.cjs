const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Mapeo de tipo de documento a nombre de archivo esperado
const TIPO_TO_FILENAME = {
  'curp': 'CURP.pdf',
  'constanciaAntecedentes': 'Constancia de Antecedentes Penales.pdf',
  'ine': 'INE.pdf',
  'cartillaMilitar': 'Cartilla Militar o Acta de Nacimiento.pdf',
  'comprobantedomicilio': 'Comprobante de Domicilio.pdf',
  'certificadomedico': 'Certificado Médico.pdf',
  'certificadopsicologico': 'Certificado Psicológico.pdf',
  'certificadotoxicologico': 'Certificado Toxicológico.pdf',
  'modohonesto': 'Carta Modo Honesto de Vivir.pdf',
  'licenciacaza': 'Licencia de Caza.pdf',
  'fotocredencial': 'Foto Credencial.jpg',
  'reciboe5cinco': 'Recibo e5cinco.pdf',
  'permisoanterior': 'Permiso Anterior.pdf'
};

async function fixDocumentosFileName() {
  console.log('\n🔧 REPARACIÓN: Agregar fileName a documentos con URL\n');
  console.log('='.repeat(80));
  
  try {
    const sociosSnapshot = await db.collection('socios').get();
    
    let totalSocios = 0;
    let totalDocsActualizados = 0;
    let sociosActualizados = 0;
    
    for (const socioDoc of sociosSnapshot.docs) {
      const email = socioDoc.id;
      const data = socioDoc.data();
      
      if (!data.documentosPETA) continue;
      
      totalSocios++;
      let docsActualizados = 0;
      const documentosPETA = { ...data.documentosPETA };
      let necesitaActualizacion = false;
      
      // Revisar cada tipo de documento
      for (const [tipo, nombreArchivo] of Object.entries(TIPO_TO_FILENAME)) {
        const doc = documentosPETA[tipo];
        
        // Si tiene URL pero NO tiene fileName, agregarlo
        if (doc && doc.url && !doc.fileName) {
          documentosPETA[tipo] = {
            ...doc,
            fileName: nombreArchivo,
            // Si no tiene uploadDate, usar uno genérico
            uploadDate: doc.uploadDate || admin.firestore.Timestamp.now()
          };
          
          docsActualizados++;
          necesitaActualizacion = true;
        }
      }
      
      if (necesitaActualizacion) {
        await db.collection('socios').doc(email).update({
          documentosPETA: documentosPETA
        });
        
        sociosActualizados++;
        totalDocsActualizados += docsActualizados;
        
        console.log(`✅ ${data.nombre || email}`);
        console.log(`   Email: ${email}`);
        console.log(`   Documentos actualizados: ${docsActualizados}`);
        console.log('');
      }
    }
    
    console.log('='.repeat(80));
    console.log('\n📊 RESUMEN:');
    console.log(`   Total socios revisados: ${totalSocios}`);
    console.log(`   Socios actualizados: ${sociosActualizados}`);
    console.log(`   Documentos actualizados: ${totalDocsActualizados}`);
    console.log('\n✅ Proceso completado exitosamente\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

fixDocumentosFileName();

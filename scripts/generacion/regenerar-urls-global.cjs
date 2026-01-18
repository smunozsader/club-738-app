const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function regenerarTodosSocios() {
  console.log('🔄 REGENERANDO TODAS LAS URLs CON NUEVOS TOKENS\n');
  
  // Mapeo de tipos de documento a posibles nombres de archivo
  const docMapping = {
    'curp': ['curp.pdf'],
    'constanciaAntecedentes': ['constancia_antecedentes.pdf', 'constancia.pdf', 'antecedentes.pdf'],
    'ine': ['ine.pdf', 'credencial.pdf'],
    'cartillaMilitar': ['cartilla_militar.pdf', 'cartilla.pdf', 'acta_nacimiento.pdf'],
    'comprobanteDomicilio': ['comprobante_domicilio.pdf', 'comprobante-domicilio.pdf', 'domicilio.pdf'],
    'certificadoMedico': ['certificado_medico.pdf', 'certificado-medico.pdf', 'medico.pdf'],
    'certificadoPsicologico': ['certificado_psicologico.pdf', 'certificado-psicologico.pdf', 'psicologico.pdf'],
    'certificadoToxicologico': ['certificado_toxicologico.pdf', 'certificado-toxicologico.pdf', 'toxicologico.pdf'],
    'cartaModoHonesto': ['carta_modo_honesto.pdf', 'modo_honesto.pdf'],
    'licenciaCaza': ['licencia_caza.pdf', 'licencia-caza.pdf', 'caza.pdf'],
    'fotoCredencial': ['foto.jpg', 'fotografia.jpg'],
    'reciboE5cinco': ['recibo_e5cinco.pdf', 'recibo-e5cinco.pdf', 'e5cinco.pdf'],
    'permisoAnterior': ['permiso_anterior.pdf', 'permiso-anterior.pdf']
  };
  
  const sociosSnapshot = await db.collection('socios').get();
  
  let totalActualizados = 0;
  
  for (const socioDoc of sociosSnapshot.docs) {
    const email = socioDoc.id;
    const data = socioDoc.data();
    
    if (!data.documentosPETA) continue;
    
    console.log(`\n👤 ${email}`);
    
    for (const [docType, docData] of Object.entries(data.documentosPETA)) {
      if (!docData.url) continue;
      
      const posiblesNombres = docMapping[docType] || [];
      
      for (const nombreArchivo of posiblesNombres) {
        const filePath = `documentos/${email}/${nombreArchivo}`;
        
        try {
          const file = bucket.file(filePath);
          const [exists] = await file.exists();
          
          if (exists) {
            const [newUrl] = await file.getSignedUrl({
              action: 'read',
              expires: '03-01-2500'
            });
            
            await socioDoc.ref.update({
              [`documentosPETA.${docType}.url`]: newUrl
            });
            
            console.log(`   ✅ ${docType} (${nombreArchivo})`);
            totalActualizados++;
            break;
          }
        } catch (error) {
          // Continuar con siguiente nombre
        }
      }
    }
  }
  
  console.log(`\n\n📊 Total URLs actualizadas: ${totalActualizados}`);
  process.exit(0);
}

regenerarTodosSocios().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

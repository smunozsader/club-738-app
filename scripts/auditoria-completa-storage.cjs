const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'club-738-app.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

async function auditoriaCompleta() {
  console.log('🔍 AUDITORÍA COMPLETA DE STORAGE\n');
  
  // Obtener TODOS los archivos en Storage bajo documentos/
  const [files] = await bucket.getFiles({ prefix: 'documentos/' });
  
  console.log(`📦 Total archivos en Storage: ${files.length}\n`);
  
  // Clasificar archivos por tipo
  const armasFiles = [];
  const documentosPETA = [];
  const otros = [];
  
  for (const file of files) {
    const path = file.name;
    
    if (path.includes('/armas/') && path.endsWith('/registro.pdf')) {
      armasFiles.push(file);
    } else if (path.match(/documentos\/[^\/]+\/[^\/]+\.pdf$/)) {
      documentosPETA.push(file);
    } else {
      otros.push(file);
    }
  }
  
  console.log(`🔫 Registros de armas: ${armasFiles.length}`);
  console.log(`📄 Documentos PETA: ${documentosPETA.length}`);
  console.log(`❓ Otros archivos: ${otros.length}\n`);
  
  // ========================================
  // PARTE 1: ARMAS
  // ========================================
  console.log('\n=== AUDITORÍA DE REGISTROS DE ARMAS ===\n');
  
  let armasActualizadas = 0;
  let armasYaMapeadas = 0;
  let armasNoEncontradas = 0;
  
  for (const file of armasFiles) {
    // Parsear la ruta: documentos/{email}/armas/{matricula}/registro.pdf
    const parts = file.name.split('/');
    const email = parts[1];
    const matricula = parts[3];
    
    try {
      // Buscar arma en Firestore por matrícula
      const armasSnapshot = await db.collection('socios').doc(email).collection('armas')
        .where('matricula', '==', matricula.replace(/_/g, ' '))
        .get();
      
      if (armasSnapshot.empty) {
        // Probar sin convertir guion bajo
        const armasSnapshot2 = await db.collection('socios').doc(email).collection('armas')
          .where('matricula', '==', matricula)
          .get();
        
        if (armasSnapshot2.empty) {
          console.log(`⚠️  NO ENCONTRADA: ${email} → ${matricula}`);
          armasNoEncontradas++;
          continue;
        }
      }
      
      const armaDoc = armasSnapshot.empty ? armasSnapshot2.docs[0] : armasSnapshot.docs[0];
      const armaData = armaDoc.data();
      
      // Verificar si ya tiene documentoRegistro
      if (armaData.documentoRegistro) {
        armasYaMapeadas++;
        continue;
      }
      
      // Obtener URL firmada
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
      });
      
      // Actualizar Firestore
      await armaDoc.ref.update({
        documentoRegistro: url
      });
      
      console.log(`✅ ${email} → ${matricula}`);
      armasActualizadas++;
      
    } catch (error) {
      console.error(`❌ Error: ${email} → ${matricula}:`, error.message);
    }
  }
  
  console.log(`\n📊 Resumen Armas:`);
  console.log(`   ✅ Actualizadas: ${armasActualizadas}`);
  console.log(`   ✓  Ya mapeadas: ${armasYaMapeadas}`);
  console.log(`   ⚠️  No encontradas en Firestore: ${armasNoEncontradas}`);
  
  // ========================================
  // PARTE 2: DOCUMENTOS PETA
  // ========================================
  console.log('\n\n=== AUDITORÍA DE DOCUMENTOS PETA ===\n');
  
  let petaActualizados = 0;
  let petaYaMapeados = 0;
  let petaErrores = 0;
  
  for (const file of documentosPETA) {
    // Parsear: documentos/{email}/{tipo}.pdf
    const parts = file.name.split('/');
    const email = parts[1];
    const nombreArchivo = parts[2];
    
    // Ignorar archivos en subcarpetas (ya procesados en armas)
    if (parts.length > 3) continue;
    
    // Extraer tipo de documento (eliminar timestamp si existe)
    const tipoDoc = nombreArchivo
      .replace('.pdf', '')
      .replace(/_\d{13}$/, ''); // Eliminar timestamp de 13 dígitos al final
    
    // Mapeo de nombres de archivo a campos de Firestore
    const mapeoNombres = {
      'curp': 'curp',
      'constancia': 'constanciaAntecedentes',
      'constancia_antecedentes': 'constanciaAntecedentes',
      'antecedentes': 'constanciaAntecedentes',
      'ine': 'ine',
      'credencial': 'ine',
      'comprobante_domicilio': 'comprobanteDomicilio',
      'comprobante-domicilio': 'comprobanteDomicilio',
      'domicilio': 'comprobanteDomicilio',
      'certificado_medico': 'certificadoMedico',
      'certificado-medico': 'certificadoMedico',
      'medico': 'certificadoMedico',
      'certificado_psicologico': 'certificadoPsicologico',
      'certificado-psicologico': 'certificadoPsicologico',
      'psicologico': 'certificadoPsicologico',
      'certificado_toxicologico': 'certificadoToxicologico',
      'certificado-toxicologico': 'certificadoToxicologico',
      'toxicologico': 'certificadoToxicologico',
      'cartilla': 'cartillaMilitar',
      'cartilla_militar': 'cartillaMilitar',
      'acta_nacimiento': 'cartillaMilitar',
      'carta_modo_honesto': 'cartaModoHonesto',
      'modo_honesto': 'cartaModoHonesto',
      'licencia_caza': 'licenciaCaza',
      'licencia-caza': 'licenciaCaza',
      'caza': 'licenciaCaza',
      'foto': 'fotoCredencial',
      'fotografia': 'fotoCredencial',
      'recibo_e5cinco': 'reciboE5cinco',
      'recibo-e5cinco': 'reciboE5cinco',
      'e5cinco': 'reciboE5cinco',
      'permiso_anterior': 'permisoAnterior',
      'permiso-anterior': 'permisoAnterior'
    };
    
    const campoFirestore = mapeoNombres[tipoDoc.toLowerCase()];
    
    if (!campoFirestore) {
      console.log(`⚠️  Tipo desconocido: ${email} → ${nombreArchivo}`);
      continue;
    }
    
    try {
      // Obtener documento del socio
      const socioRef = db.collection('socios').doc(email);
      const socioSnap = await socioRef.get();
      
      if (!socioSnap.exists) {
        console.log(`⚠️  Socio no existe: ${email}`);
        petaErrores++;
        continue;
      }
      
      const socioData = socioSnap.data();
      
      // Verificar si ya está mapeado
      if (socioData.documentosPETA && socioData.documentosPETA[campoFirestore]?.url) {
        petaYaMapeados++;
        continue;
      }
      
      // Obtener URL firmada
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
      });
      
      // Actualizar Firestore
      await socioRef.update({
        [`documentosPETA.${campoFirestore}`]: {
          url: url,
          fechaSubida: admin.firestore.Timestamp.now(),
          verificado: false
        }
      });
      
      console.log(`✅ ${email} → ${campoFirestore} (${nombreArchivo})`);
      petaActualizados++;
      
    } catch (error) {
      console.error(`❌ Error: ${email} → ${nombreArchivo}:`, error.message);
      petaErrores++;
    }
  }
  
  console.log(`\n📊 Resumen Documentos PETA:`);
  console.log(`   ✅ Actualizados: ${petaActualizados}`);
  console.log(`   ✓  Ya mapeados: ${petaYaMapeados}`);
  console.log(`   ❌ Errores: ${petaErrores}`);
  
  // ========================================
  // RESUMEN GLOBAL
  // ========================================
  console.log(`\n\n📊 RESUMEN GLOBAL:`);
  console.log(`   📦 Total archivos: ${files.length}`);
  console.log(`   ✅ Total actualizados: ${armasActualizadas + petaActualizados}`);
  console.log(`   ✓  Ya mapeados: ${armasYaMapeadas + petaYaMapeados}`);
  console.log(`   ⚠️  Pendientes/Errores: ${armasNoEncontradas + petaErrores}`);
  
  process.exit(0);
}

auditoriaCompleta().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});

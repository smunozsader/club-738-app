const XLSX = require('xlsx');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://club-738-app.firebaseio.com'
});

const db = admin.firestore();

async function buscarArma() {
  console.log('🔍 Buscando: PISTOLA CESKA ZBROJOVKA .380 - Mat: DP25246\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // PASO 1: Buscar en Excel maestro (FUENTE DE VERDAD)
  console.log('📊 PASO 1: Buscando en EXCEL MAESTRO (Fuente de Verdad)...\n');

  let socioDelExcel = null;
  
  try {
    const excelPath = path.join('/Applications/club-738-web/data/socios', 'Copy of 2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx');
    
    if (!fs.existsSync(excelPath)) {
      console.log('❌ Archivo Excel no encontrado en:', excelPath);
      console.log('   Verificando ruta alternativa...');
      const dir = path.dirname(excelPath);
      const files = fs.readdirSync(dir);
      console.log('   Archivos disponibles:', files);
      process.exit(1);
    }
    
    const workbook = XLSX.readFile(excelPath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    for (const row of data) {
      if (row['MATRÍCULA'] && row['MATRÍCULA'].toString().trim() === 'DP25246') {
        socioDelExcel = {
          credencial: row['No. CREDENCIAL'],
          socio: row['NOMBRE DEL SOCIO'],
          email: row['EMAIL'],
          clase: row['CLASE'],
          calibre: row['CALIBRE'],
          marca: row['MARCA'],
          modelo: row['MODELO'],
          matricula: row['MATRÍCULA'],
          folio: row['FOLIO']
        };
        break;
      }
    }
    
    if (socioDelExcel) {
      console.log('✅ ¡ENCONTRADA EN EXCEL!\n');
      console.log('📋 DATOS DEL EXCEL (Fuente de Verdad):');
      console.log('   Credencial:', socioDelExcel.credencial);
      console.log('   Socio:', socioDelExcel.socio);
      console.log('   Email:', socioDelExcel.email);
      console.log('   Clase:', socioDelExcel.clase);
      console.log('   Calibre:', socioDelExcel.calibre);
      console.log('   Marca:', socioDelExcel.marca);
      console.log('   Modelo:', socioDelExcel.modelo);
      console.log('   Matrícula:', socioDelExcel.matricula);
      console.log('   Folio:', socioDelExcel.folio);
      console.log('');
    } else {
      console.log('❌ NO ENCONTRADA EN EXCEL\n');
    }
    
  } catch (error) {
    console.error('❌ Error leyendo Excel:', error.message);
  }

  // PASO 2: Buscar en Firestore
  console.log('📊 PASO 2: Buscando en FIRESTORE...\n');
  
  let armaEnFirestore = null;
  
  try {
    const sociosSnap = await db.collection('socios').get();
    
    for (const socioDoc of sociosSnap.docs) {
      const socioEmail = socioDoc.id;
      const socioData = socioDoc.data();
      
      const armasSnap = await db.collection('socios').doc(socioEmail).collection('armas').get();
      
      for (const armaDoc of armasSnap.docs) {
        const arma = armaDoc.data();
        
        if (arma.matricula === 'DP25246' || arma.matricula === 'dp25246') {
          armaEnFirestore = {
            socioEmail,
            socioNombre: socioData.nombre,
            armaId: armaDoc.id,
            clase: arma.clase,
            marca: arma.marca,
            modelo: arma.modelo,
            calibre: arma.calibre,
            matricula: arma.matricula,
            folio: arma.folio,
            modalidad: arma.modalidad,
            documentoRegistro: arma.documentoRegistro
          };
          break;
        }
      }
      
      if (armaEnFirestore) break;
    }
    
    if (armaEnFirestore) {
      console.log('✅ ¡ENCONTRADA EN FIRESTORE!\n');
      console.log('📋 DATOS DE FIRESTORE:');
      console.log('   Socio:', armaEnFirestore.socioNombre || armaEnFirestore.socioEmail);
      console.log('   Email:', armaEnFirestore.socioEmail);
      console.log('   Clase:', armaEnFirestore.clase);
      console.log('   Calibre:', armaEnFirestore.calibre);
      console.log('   Marca:', armaEnFirestore.marca);
      console.log('   Modelo:', armaEnFirestore.modelo);
      console.log('   Matrícula:', armaEnFirestore.matricula);
      console.log('   Folio:', armaEnFirestore.folio);
      console.log('   Modalidad:', armaEnFirestore.modalidad);
      console.log('   Documento Registro URL:', armaEnFirestore.documentoRegistro ? '✅ SÍ' : '❌ NO');
      console.log('   ID Firestore:', armaEnFirestore.armaId);
      console.log('');
    } else {
      console.log('❌ NO ENCONTRADA EN FIRESTORE\n');
    }
    
  } catch (error) {
    console.error('❌ Error consultando Firestore:', error.message);
  }

  // PASO 3: Verificar Storage (PDF de registro)
  if (armaEnFirestore) {
    console.log('📊 PASO 3: Verificando STORAGE (Registro PDF)...\n');
    
    const rutaPDF = `documentos/${armaEnFirestore.socioEmail}/armas/${armaEnFirestore.armaId}/registro.pdf`;
    console.log('📍 Ruta esperada en Storage:');
    console.log(`   ${rutaPDF}`);
    console.log('');
    
    if (armaEnFirestore.documentoRegistro) {
      console.log('✅ Documento de registro registrado en Firestore');
      console.log('   URL:', armaEnFirestore.documentoRegistro);
    } else {
      console.log('⚠️ No hay registro de documento en Firestore');
      console.log('   El PDF podría existir en Storage pero no estar registrado');
    }
  }

  // RESUMEN
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📋 RESUMEN:\n');
  
  if (socioDelExcel && armaEnFirestore) {
    console.log('✅ Arma sincronizada correctamente entre Excel y Firestore');
    if (armaEnFirestore.documentoRegistro) {
      console.log('✅ Registro PDF cargado en Storage');
    } else {
      console.log('⚠️ Registro PDF no cargado aún - PENDIENTE');
    }
  } else if (socioDelExcel && !armaEnFirestore) {
    console.log('⚠️ Arma en Excel pero NO en Firestore - SINCRONIZACIÓN PENDIENTE');
  } else if (!socioDelExcel && armaEnFirestore) {
    console.log('⚠️ Arma en Firestore pero NO en Excel maestro - INCONSISTENCIA');
  } else {
    console.log('❌ Arma no encontrada en ninguna fuente');
  }

  process.exit(0);
}

buscarArma().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});

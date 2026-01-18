const admin = require('firebase-admin');
const XLSX = require('xlsx');
const path = require('path');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function verificarYActualizar() {
  console.log('🔍 Verificación integral de las 3 armas de Gardoni\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Armas a revisar
  const armasAVerificar = [
    { matricula: 'DP25246', nombre: 'PISTOLA CESKA ZBROJOVKA .380' },
    { matricula: 'K078928', nombre: 'PISTOLA GRAND POWER .22 L.R.' },
    { matricula: 'DP25086', nombre: 'PISTOLA CESKA ZBROJOVKA .380' }
  ];

  const socioEmail = 'jrgardoni@gmail.com';

  // PASO 1: Excel
  console.log('📊 PASO 1: Buscando en EXCEL MAESTRO\n');

  const excelPath = path.join('/Applications/club-738-web/data/socios', 'Copy of 2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx');
  const workbook = XLSX.readFile(excelPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const dataExcel = XLSX.utils.sheet_to_json(worksheet);

  const armasEnExcel = {};
  for (const row of dataExcel) {
    if (row['EMAIL'] === socioEmail) {
      armasEnExcel[row['MATRÍCULA']] = {
        clase: row['CLASE'],
        calibre: row['CALIBRE'],
        marca: row['MARCA'],
        modelo: row['MODELO'],
        folio: row['FOLIO']
      };
    }
  }

  console.log('✅ Armas de Gardoni en EXCEL:\n');
  for (const arma of armasAVerificar) {
    if (armasEnExcel[arma.matricula]) {
      console.log(`✅ ${arma.matricula} - ${arma.nombre}: ENCONTRADA EN EXCEL`);
    } else {
      console.log(`❌ ${arma.matricula} - ${arma.nombre}: NO ENCONTRADA EN EXCEL`);
    }
  }

  // PASO 2: Firestore
  console.log('\n📊 PASO 2: Verificando en FIRESTORE\n');

  const socioRef = db.collection('socios').doc(socioEmail);
  const armasSnap = await socioRef.collection('armas').get();

  const armasEnFirestore = {};
  armasSnap.forEach(doc => {
    const arma = doc.data();
    armasEnFirestore[arma.matricula] = {
      id: doc.id,
      ...arma
    };
  });

  console.log('Verificando cada arma en Firestore:\n');
  
  let actualizacionesNecesarias = [];

  for (const arma of armasAVerificar) {
    console.log(`🔍 ${arma.matricula}:`);
    
    if (armasEnFirestore[arma.matricula]) {
      const armaFS = armasEnFirestore[arma.matricula];
      console.log(`   ✅ Encontrada en Firestore`);
      console.log(`      ID: ${armaFS.id}`);
      console.log(`      documentoRegistro: ${armaFS.documentoRegistro ? '✅ SÍ' : '❌ NO'}`);
      
      // Para DP25246, actualizar si no tiene documentoRegistro
      if (arma.matricula === 'DP25246' && !armaFS.documentoRegistro) {
        console.log(`      ⚠️ NECESITA ACTUALIZACIÓN: Agregar URL del documento`);
        actualizacionesNecesarias.push({
          matricula: arma.matricula,
          id: armaFS.id,
          accion: 'actualizar-url'
        });
      }
    } else {
      console.log(`   ❌ NO encontrada en Firestore`);
      
      // Verificar si está en Excel
      if (armasEnExcel[arma.matricula]) {
        console.log(`      ⚠️ Está en Excel pero NO en Firestore`);
        console.log(`      ❌ NECESITA ALTA EN FIRESTORE VÍA OFICIO`);
        actualizacionesNecesarias.push({
          matricula: arma.matricula,
          accion: 'alta-firestore'
        });
      }
    }
    console.log('');
  }

  // PASO 3: Actualizar Firestore si es necesario
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📝 ACCIONES A REALIZAR:\n');

  if (actualizacionesNecesarias.length === 0) {
    console.log('✅ No hay actualizaciones necesarias');
  } else {
    for (const accion of actualizacionesNecesarias) {
      if (accion.accion === 'actualizar-url') {
        console.log(`🔄 ${accion.matricula}: Actualizando URL de documento...`);
        
        try {
          const armaRef = socioRef.collection('armas').doc(accion.id);
          
          // La URL del documento (descargable de Storage)
          const documentoURL = `https://firebasestorage.googleapis.com/v0/b/club-738-app.firebasestorage.app/o/documentos%2Fjrgardoni%40gmail.com%2Farmas%2F${accion.id}%2Fregistro.pdf?alt=media`;
          
          await armaRef.update({
            documentoRegistro: documentoURL
          });
          
          console.log(`   ✅ Actualizado correctamente`);
          console.log(`   URL: ${documentoURL}\n`);
        } catch (error) {
          console.log(`   ❌ Error: ${error.message}\n`);
        }
      } else if (accion.accion === 'alta-firestore') {
        console.log(`⚠️ ${accion.matricula}: REQUIERE OFICIO A 32 ZONA MILITAR`);
        console.log(`   - Arma registrada en Excel maestro`);
        console.log(`   - No está en Firestore`);
        console.log(`   - Necesita alta formal mediante 32 ZM\n`);
      }
    }
  }

  // Verificar solicitudes de alta de Gardoni
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('📋 VERIFICANDO SOLICITUDES DE ALTA DE GARDONI:\n');

  try {
    const solicitudesRef = db.collection('socios').doc(socioEmail).collection('solicitudesAlta');
    const solicitudesSnap = await solicitudesRef.get();

    if (solicitudesSnap.empty) {
      console.log('❌ No hay solicitudes de alta pendientes de Gardoni');
    } else {
      console.log(`✅ Encontradas ${solicitudesSnap.size} solicitud(es) de alta:\n`);
      
      solicitudesSnap.forEach(doc => {
        const solicitud = doc.data();
        console.log(`📌 Solicitud ID: ${doc.id}`);
        console.log(`   Estado: ${solicitud.estado}`);
        console.log(`   Arma: ${solicitud.clase} ${solicitud.marca} ${solicitud.modelo}`);
        console.log(`   Matrícula: ${solicitud.matricula}`);
        console.log(`   Fecha: ${solicitud.fechaSolicitud?.toDate?.() || 'N/A'}`);
        console.log('');
      });
    }
  } catch (error) {
    console.log(`⚠️ Error verificando solicitudes: ${error.message}\n`);
  }

  console.log('═══════════════════════════════════════════════════════════');
  process.exit(0);
}

verificarYActualizar().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});

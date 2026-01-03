/**
 * Script para importar armas a Firestore
 * Club de Caza, Tiro y Pesca de Yucatán A.C.
 * 
 * Estructura: socios/{email}/armas/{armaId}
 */

const admin = require('firebase-admin');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Cargar Excel
const excelPath = path.join(__dirname, '..', 'Base datos', 'CLUB 738-31-DE-DICIEMBRE-2025_RELACION_SOCIOS_ARMAS NORMALIZADA.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('\n🎯 Club 738 - Importador de Armas a Firestore');
console.log('='.repeat(50));

// Procesar datos
const armasPorSocio = {};
let totalArmas = 0;

for (let i = 1; i < data.length; i++) {
  const row = data[i];
  const email = row[7]; // EMAIL
  const clase = row[8]; // CLASE
  const matricula = row[12]; // MATRÍCULA
  const domicilio = row[5] || '';
  
  // Solo armas reales (tienen email, clase, matrícula y no son totales)
  if (email && clase && matricula && !domicilio.toString().includes('TOTAL')) {
    const emailNorm = email.toString().toLowerCase().trim();
    
    if (!armasPorSocio[emailNorm]) {
      armasPorSocio[emailNorm] = {
        nombre: row[2], // NOMBRE DEL SOCIO
        curp: row[3],
        consecutivo: row[4],
        domicilio: row[5],
        telefono: row[6],
        armas: []
      };
    }
    
    armasPorSocio[emailNorm].armas.push({
      clase: clase,
      calibre: row[9] || '',
      marca: row[10] || '',
      modelo: row[11] || '',
      matricula: matricula.toString(),
      folio: row[13] ? row[13].toString() : '',
      tipoArma: row[14] ? 'corta' : 'larga', // ARMAS CORTAS o LARGAS
      documentoRegistro: null, // URL del PDF cuando lo suban
      fechaRegistro: null,
      verificado: false
    });
    
    totalArmas++;
  }
}

console.log(`📊 Socios con armas: ${Object.keys(armasPorSocio).length}`);
console.log(`🔫 Total armas: ${totalArmas}`);
console.log('\n🚀 Iniciando importación a Firestore...\n');

async function importarTodo() {
  let sociosImportados = 0;
  let armasImportadas = 0;
  const errores = [];

  for (const [email, datos] of Object.entries(armasPorSocio)) {
    try {
      // Crear/actualizar documento del socio
      const socioRef = db.collection('socios').doc(email);
      await socioRef.set({
        nombre: datos.nombre,
        email: email,
        curp: datos.curp,
        consecutivo: datos.consecutivo,
        domicilio: datos.domicilio,
        telefono: datos.telefono,
        totalArmas: datos.armas.length,
        documentosCompletos: false,
        ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      // Importar cada arma
      for (const arma of datos.armas) {
        const armaId = `${arma.matricula}`.replace(/[\/\s]/g, '_');
        await socioRef.collection('armas').doc(armaId).set({
          ...arma,
          creadoEn: admin.firestore.FieldValue.serverTimestamp()
        });
        armasImportadas++;
      }

      sociosImportados++;
      console.log(`✅ ${sociosImportados}/${Object.keys(armasPorSocio).length} - ${email} (${datos.armas.length} armas)`);
      
    } catch (error) {
      console.error(`❌ Error con ${email}: ${error.message}`);
      errores.push({ email, error: error.message });
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE IMPORTACIÓN');
  console.log('='.repeat(50));
  console.log(`✅ Socios importados: ${sociosImportados}`);
  console.log(`🔫 Armas importadas: ${armasImportadas}`);
  console.log(`❌ Errores: ${errores.length}`);

  if (errores.length > 0) {
    console.log('\n❌ Errores:');
    errores.forEach(e => console.log(`   - ${e.email}: ${e.error}`));
  }

  console.log('\n✅ ¡Importación completada!');
  process.exit(0);
}

importarTodo().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});

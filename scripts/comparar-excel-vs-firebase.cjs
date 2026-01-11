const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const fs = require('fs');
const XLSX = require('xlsx');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function compararExcelVsFirebase() {
  console.log('\n📊 COMPARACIÓN: EXCEL vs FIREBASE\n');
  console.log('=' .repeat(100));
  
  try {
    // 1. LEER EXCEL
    const workbook = XLSX.readFile('data/socios/2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet);
    
    // Agrupar armas por email en Excel
    const excelPorSocio = {};
    excelData.forEach(row => {
      const email = row['EMAIL'];
      const matricula = row['MATRÍCULA'];
      
      if (!email || !matricula) return;
      
      if (!excelPorSocio[email]) {
        excelPorSocio[email] = {
          nombre: row['NOMBRE DEL SOCIO'],
          credencial: row['No. CREDENCIAL'],
          armas: []
        };
      }
      
      excelPorSocio[email].armas.push({
        clase: row['CLASE'],
        calibre: row['CALIBRE'],
        marca: row['MARCA'],
        modelo: row['MODELO'],
        matricula: matricula,
        folio: row['FOLIO']
      });
    });
    
    const sociosEnExcel = Object.keys(excelPorSocio).length;
    const armasEnExcel = excelData.length;
    
    console.log('📄 EXCEL (fuente de verdad - 31 Dic 2025):');
    console.log(`   Socios con armas: ${sociosEnExcel}`);
    console.log(`   Total de armas: ${armasEnExcel}`);
    console.log();
    
    // 2. LEER FIREBASE
    const sociosSnapshot = await db.collection('socios').get();
    
    const firebasePorSocio = {};
    let totalArmasFirebase = 0;
    
    for (const socioDoc of sociosSnapshot.docs) {
      const email = socioDoc.id;
      const socioData = socioDoc.data();
      
      const armasSnapshot = await db.collection(`socios/${email}/armas`).get();
      
      if (armasSnapshot.size > 0) {
        firebasePorSocio[email] = {
          nombre: socioData.nombre,
          armas: []
        };
        
        armasSnapshot.forEach(armaDoc => {
          const arma = armaDoc.data();
          firebasePorSocio[email].armas.push({
            id: armaDoc.id,
            clase: arma.clase,
            calibre: arma.calibre,
            marca: arma.marca,
            modelo: arma.modelo,
            matricula: arma.matricula,
            folio: arma.folio,
            modalidad: arma.modalidad
          });
          totalArmasFirebase++;
        });
      }
    }
    
    const sociosEnFirebase = Object.keys(firebasePorSocio).length;
    
    console.log('🔥 FIREBASE (estado actual - después de limpieza):');
    console.log(`   Socios con armas: ${sociosEnFirebase}`);
    console.log(`   Total de armas: ${totalArmasFirebase}`);
    console.log();
    
    // 3. COMPARACIÓN
    console.log('=' .repeat(100));
    console.log('🔍 ANÁLISIS DE DIFERENCIAS:\n');
    
    const diferenciaSocios = sociosEnFirebase - sociosEnExcel;
    const diferenciaArmas = totalArmasFirebase - armasEnExcel;
    
    console.log(`Diferencia de socios: ${diferenciaSocios > 0 ? '+' : ''}${diferenciaSocios}`);
    console.log(`Diferencia de armas: ${diferenciaArmas > 0 ? '+' : ''}${diferenciaArmas}`);
    console.log();
    
    // 4. SOCIOS QUE ESTÁN EN FIREBASE PERO NO EN EXCEL
    const sociosNuevos = [];
    for (const email in firebasePorSocio) {
      if (!excelPorSocio[email]) {
        sociosNuevos.push({
          email,
          nombre: firebasePorSocio[email].nombre,
          armas: firebasePorSocio[email].armas.length
        });
      }
    }
    
    if (sociosNuevos.length > 0) {
      console.log(`✅ SOCIOS NUEVOS EN FIREBASE (${sociosNuevos.length}):`);
      console.log('   (Agregados después del 31 Dic 2025)\n');
      sociosNuevos.forEach(s => {
        console.log(`   - ${s.nombre} (${s.email})`);
        console.log(`     Armas: ${s.armas}`);
      });
      console.log();
    }
    
    // 5. SOCIOS QUE ESTÁN EN EXCEL PERO NO EN FIREBASE
    const sociosFaltantes = [];
    for (const email in excelPorSocio) {
      if (!firebasePorSocio[email]) {
        sociosFaltantes.push({
          email,
          nombre: excelPorSocio[email].nombre,
          credencial: excelPorSocio[email].credencial,
          armas: excelPorSocio[email].armas.length
        });
      }
    }
    
    if (sociosFaltantes.length > 0) {
      console.log(`❌ SOCIOS QUE FALTAN EN FIREBASE (${sociosFaltantes.length}):`);
      console.log('   (Deben importarse)\n');
      sociosFaltantes.forEach(s => {
        console.log(`   - [${s.credencial}] ${s.nombre} (${s.email})`);
        console.log(`     Armas en Excel: ${s.armas}`);
      });
      console.log();
    }
    
    // 6. DIFERENCIAS EN CANTIDAD DE ARMAS POR SOCIO
    console.log('=' .repeat(100));
    console.log('📊 COMPARACIÓN DE ARMAS POR SOCIO:\n');
    
    const diferenciasArmas = [];
    
    for (const email in excelPorSocio) {
      const armasExcel = excelPorSocio[email].armas.length;
      const armasFirebase = firebasePorSocio[email] ? firebasePorSocio[email].armas.length : 0;
      
      if (armasExcel !== armasFirebase) {
        diferenciasArmas.push({
          email,
          nombre: excelPorSocio[email].nombre,
          credencial: excelPorSocio[email].credencial,
          excel: armasExcel,
          firebase: armasFirebase,
          diferencia: armasFirebase - armasExcel
        });
      }
    }
    
    if (diferenciasArmas.length > 0) {
      console.log(`⚠️  SOCIOS CON DIFERENCIAS EN CANTIDAD DE ARMAS (${diferenciasArmas.length}):\n`);
      diferenciasArmas.sort((a, b) => Math.abs(b.diferencia) - Math.abs(a.diferencia));
      
      diferenciasArmas.forEach(d => {
        const signo = d.diferencia > 0 ? '+' : '';
        console.log(`   [${d.credencial}] ${d.nombre}`);
        console.log(`   ${d.email}`);
        console.log(`   Excel: ${d.excel} armas | Firebase: ${d.firebase} armas | Diferencia: ${signo}${d.diferencia}`);
        console.log();
      });
    } else {
      console.log('✅ Todos los socios tienen la misma cantidad de armas en Excel y Firebase\n');
    }
    
    // 7. RESUMEN FINAL
    console.log('=' .repeat(100));
    console.log('📋 RESUMEN FINAL:\n');
    
    if (sociosNuevos.length === 0 && sociosFaltantes.length === 0 && diferenciasArmas.length === 0) {
      console.log('✅ PERFECTO: Firebase coincide exactamente con el Excel');
      console.log('   No hay diferencias detectadas.');
    } else {
      console.log('⚠️  Se detectaron las siguientes diferencias:\n');
      if (sociosNuevos.length > 0) {
        console.log(`   - ${sociosNuevos.length} socios nuevos en Firebase (agregados después del 31 Dic)`);
      }
      if (sociosFaltantes.length > 0) {
        console.log(`   - ${sociosFaltantes.length} socios faltantes en Firebase`);
      }
      if (diferenciasArmas.length > 0) {
        console.log(`   - ${diferenciasArmas.length} socios con diferencias en cantidad de armas`);
      }
      
      const armasExtra = diferenciasArmas.reduce((sum, d) => sum + (d.diferencia > 0 ? d.diferencia : 0), 0);
      const armasFaltantes = diferenciasArmas.reduce((sum, d) => sum + (d.diferencia < 0 ? Math.abs(d.diferencia) : 0), 0);
      
      if (armasExtra > 0) {
        console.log(`   - ${armasExtra} armas de más en Firebase`);
      }
      if (armasFaltantes > 0) {
        console.log(`   - ${armasFaltantes} armas faltantes en Firebase`);
      }
    }
    
    console.log();
    console.log('=' .repeat(100));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await admin.app().delete();
  }
}

compararExcelVsFirebase();

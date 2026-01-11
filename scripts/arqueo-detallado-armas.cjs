const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const XLSX = require('xlsx');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function arqueoDetallado() {
  console.log('\n🔍 ARQUEO DETALLADO: ARMA POR ARMA (Excel vs Firebase)\n');
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
    
    // 2. LEER FIREBASE
    const sociosSnapshot = await db.collection('socios').get();
    
    const firebasePorSocio = {};
    
    for (const socioDoc of sociosSnapshot.docs) {
      const email = socioDoc.id;
      const socioData = socioDoc.data();
      
      const armasSnapshot = await db.collection('socios').doc(email).collection('armas').get();
      
      if (armasSnapshot.size > 0) {
        firebasePorSocio[email] = {
          nombre: socioData.nombre,
          armas: []
        };
        
        armasSnapshot.forEach(armaDoc => {
          const arma = armaDoc.data();
          firebasePorSocio[email].armas.push({
            clase: arma.clase,
            calibre: arma.calibre,
            marca: arma.marca,
            modelo: arma.modelo,
            matricula: arma.matricula,
            folio: arma.folio
          });
        });
      }
    }
    
    // 3. COMPARAR ARMA POR ARMA
    console.log('\n📋 COMPARACIÓN DETALLADA POR SOCIO:\n');
    
    let totalDiferencias = 0;
    let sociosConDiferencias = 0;
    let armasSoloEnExcel = 0;
    let armasSoloEnFirebase = 0;
    
    // Obtener todos los emails únicos (Excel + Firebase)
    const todosEmails = new Set([
      ...Object.keys(excelPorSocio),
      ...Object.keys(firebasePorSocio)
    ]);
    
    for (const email of todosEmails) {
      const excelSocio = excelPorSocio[email];
      const firebaseSocio = firebasePorSocio[email];
      
      const armasExcel = excelSocio ? excelSocio.armas : [];
      const armasFirebase = firebaseSocio ? firebaseSocio.armas : [];
      
      // Si las cantidades son diferentes, investigar
      if (armasExcel.length !== armasFirebase.length) {
        sociosConDiferencias++;
        
        console.log(`\n[${ excelSocio?.credencial || '???'}] ${excelSocio?.nombre || firebaseSocio?.nombre}`);
        console.log(`📧 ${email}`);
        console.log(`   Excel: ${armasExcel.length} armas | Firebase: ${armasFirebase.length} armas\n`);
        
        // Crear sets de matrículas para comparar
        const matriculasExcel = new Set(armasExcel.map(a => a.matricula));
        const matriculasFirebase = new Set(armasFirebase.map(a => a.matricula));
        
        // Armas que están en Excel pero NO en Firebase
        const faltanEnFirebase = armasExcel.filter(a => !matriculasFirebase.has(a.matricula));
        if (faltanEnFirebase.length > 0) {
          console.log(`   ❌ FALTAN EN FIREBASE (${faltanEnFirebase.length}):`);
          faltanEnFirebase.forEach(arma => {
            console.log(`      - ${arma.clase} ${arma.calibre} ${arma.marca} (Mat: ${arma.matricula})`);
            armasSoloEnExcel++;
          });
          console.log();
        }
        
        // Armas que están en Firebase pero NO en Excel
        const sobranEnFirebase = armasFirebase.filter(a => !matriculasExcel.has(a.matricula));
        if (sobranEnFirebase.length > 0) {
          console.log(`   ➕ SOLO EN FIREBASE (${sobranEnFirebase.length}):`);
          sobranEnFirebase.forEach(arma => {
            console.log(`      - ${arma.clase} ${arma.calibre} ${arma.marca} (Mat: ${arma.matricula})`);
            armasSoloEnFirebase++;
          });
          console.log();
        }
        
        totalDiferencias += Math.abs(armasExcel.length - armasFirebase.length);
      }
    }
    
    // 4. RESUMEN
    console.log('=' .repeat(100));
    console.log('\n📊 RESUMEN DEL ARQUEO:\n');
    console.log(`   Socios con diferencias: ${sociosConDiferencias}`);
    console.log(`   Armas que FALTAN en Firebase (están en Excel): ${armasSoloEnExcel}`);
    console.log(`   Armas EXTRA en Firebase (NO están en Excel): ${armasSoloEnFirebase}`);
    console.log(`   Diferencia neta: ${armasSoloEnFirebase - armasSoloEnExcel} armas`);
    console.log();
    
    if (armasSoloEnExcel === 0 && armasSoloEnFirebase === 0) {
      console.log('✅ PERFECTO: Firebase coincide exactamente con el Excel');
    } else {
      console.log('⚠️  Firebase NO coincide con el Excel');
      console.log('   Acción recomendada: Sincronizar Firebase con el Excel');
    }
    
    console.log();
    console.log('=' .repeat(100));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await admin.app().delete();
  }
}

arqueoDetallado();

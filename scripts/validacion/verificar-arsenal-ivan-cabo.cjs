/**
 * Script para verificar arsenal de Iván Cabo
 * Detectar duplicados
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function verificarArsenalIvan() {
  const email = 'ivancabo@gmail.com';
  
  try {
    console.log('\n🔍 Verificando arsenal de:', email);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Obtener subcolección de armas
    const armasRef = db.collection('socios').doc(email).collection('armas');
    const armasSnapshot = await armasRef.get();
    
    console.log(`📊 Total de documentos en arsenal: ${armasSnapshot.size}\n`);
    
    if (armasSnapshot.empty) {
      console.log('❌ No se encontraron armas en el arsenal');
      return;
    }
    
    // Agrupar armas por matrícula para detectar duplicados
    const armasPorMatricula = {};
    const todasLasArmas = [];
    
    armasSnapshot.forEach((doc) => {
      const arma = doc.data();
      arma.id = doc.id;
      todasLasArmas.push(arma);
      
      const key = arma.matricula || 'SIN_MATRICULA';
      if (!armasPorMatricula[key]) {
        armasPorMatricula[key] = [];
      }
      armasPorMatricula[key].push(arma);
    });
    
    // Mostrar todas las armas
    console.log('📋 LISTADO COMPLETO DE ARMAS:\n');
    todasLasArmas.forEach((arma, index) => {
      console.log(`${index + 1}. ID: ${arma.id}`);
      console.log(`   Clase: ${arma.clase || 'N/A'}`);
      console.log(`   Calibre: ${arma.calibre || 'N/A'}`);
      console.log(`   Marca: ${arma.marca || 'N/A'}`);
      console.log(`   Modelo: ${arma.modelo || 'N/A'}`);
      console.log(`   Matrícula: ${arma.matricula || 'N/A'}`);
      console.log(`   Folio: ${arma.folio || 'N/A'}`);
      console.log(`   Modalidad: ${arma.modalidad || 'N/A'}`);
      console.log('');
    });
    
    // Detectar duplicados
    console.log('\n🔍 ANÁLISIS DE DUPLICADOS:\n');
    let duplicadosEncontrados = false;
    let totalDuplicados = 0;
    
    for (const [matricula, armas] of Object.entries(armasPorMatricula)) {
      if (armas.length > 1) {
        duplicadosEncontrados = true;
        totalDuplicados += (armas.length - 1);
        console.log(`⚠️  DUPLICADO DETECTADO - Matrícula: ${matricula}`);
        console.log(`   Encontradas ${armas.length} copias:\n`);
        
        armas.forEach((arma, index) => {
          console.log(`   Copia ${index + 1}:`);
          console.log(`   - ID Firestore: ${arma.id}`);
          console.log(`   - Clase: ${arma.clase}`);
          console.log(`   - Calibre: ${arma.calibre}`);
          console.log(`   - Marca: ${arma.marca}`);
          console.log(`   - Modelo: ${arma.modelo}`);
          console.log(`   - Modalidad: ${arma.modalidad || 'N/A'}`);
          console.log('');
        });
      }
    }
    
    if (!duplicadosEncontrados) {
      console.log('✅ No se encontraron duplicados\n');
    } else {
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('⚠️  RESUMEN:');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`Total de registros: ${armasSnapshot.size}`);
      console.log(`Duplicados encontrados: ${totalDuplicados}`);
      console.log(`Armas únicas: ${armasSnapshot.size - totalDuplicados}\n`);
      
      console.log('🐛 BUG CONFIRMADO: Las armas se duplican al solicitar PETA\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

verificarArsenalIvan();

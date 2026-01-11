/**
 * Script para verificar y corregir arsenal duplicado de Sergio Muñoz
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function verificarArsenalSergio() {
  const email = 'smunozam@gmail.com';
  
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
    
    for (const [matricula, armas] of Object.entries(armasPorMatricula)) {
      if (armas.length > 1) {
        duplicadosEncontrados = true;
        console.log(`⚠️  DUPLICADO DETECTADO - Matrícula: ${matricula}`);
        console.log(`   Encontradas ${armas.length} copias:\n`);
        
        armas.forEach((arma, index) => {
          console.log(`   Copia ${index + 1}:`);
          console.log(`   - ID Firestore: ${arma.id}`);
          console.log(`   - Clase: ${arma.clase}`);
          console.log(`   - Calibre: ${arma.calibre}`);
          console.log(`   - Marca: ${arma.marca}`);
          console.log(`   - Modelo: ${arma.modelo}`);
          console.log('');
        });
      }
    }
    
    if (!duplicadosEncontrados) {
      console.log('✅ No se encontraron duplicados\n');
    } else {
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('🛠️  SOLUCIÓN PROPUESTA:');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('\nPara eliminar duplicados:');
      console.log('1. Revisar cuál copia tiene datos más completos');
      console.log('2. Eliminar las copias restantes');
      console.log('3. Actualizar totalArmas en el documento del socio\n');
      
      console.log('¿Quieres que elimine automáticamente los duplicados?');
      console.log('(Conservaré solo 1 copia de cada arma)\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

verificarArsenalSergio();

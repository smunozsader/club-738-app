/**
 * Script para limpiar duplicados del arsenal de Iván Cabo
 * Y normalizar la matrícula del rifle MENDOZA
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function limpiarDuplicadosIvan() {
  const email = 'ivancabo@gmail.com';
  
  try {
    console.log('\n🧹 Limpiando duplicados de arsenal de Iván Cabo...\n');
    
    const armasRef = db.collection('socios').doc(email).collection('armas');
    const armasSnapshot = await armasRef.get();
    
    // IDs a eliminar (versiones sin modalidad)
    const idsAEliminar = [
      'DP23540',        // PISTOLA CZ P-10 C (sin modalidad)
      'US515YY19935',   // PISTOLA BROWNING BUCK (sin modalidad)
      '27_280'          // RIFLE MENDOZA PUMA (matrícula incorrecta con coma)
    ];
    
    // ID a actualizar (normalizar matrícula)
    const idRifleCorregir = 'f3e68f83-aad8-4bfa-9cc8-242fcc108d5f';
    
    const batch = db.batch();
    let armasEliminadas = 0;
    
    console.log('🗑️  Eliminando duplicados:\n');
    
    for (const id of idsAEliminar) {
      const docRef = armasRef.doc(id);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        const arma = docSnap.data();
        console.log(`   ❌ Eliminar: ${id}`);
        console.log(`      ${arma.clase} ${arma.marca} ${arma.modelo}`);
        console.log(`      Matrícula: ${arma.matricula}\n`);
        
        batch.delete(docRef);
        armasEliminadas++;
      }
    }
    
    // Normalizar matrícula del rifle MENDOZA (quitar coma)
    console.log('🔧 Normalizando matrícula del rifle MENDOZA:\n');
    console.log(`   ✏️  ID: ${idRifleCorregir}`);
    console.log(`      Matrícula: "27280" (sin coma)\n`);
    
    batch.update(armasRef.doc(idRifleCorregir), { 
      matricula: '27280'  // Sin coma
    });
    
    // Ejecutar cambios
    await batch.commit();
    
    console.log('✅ Cambios aplicados!\n');
    
    // Actualizar totalArmas
    const totalArmasRestantes = armasSnapshot.size - armasEliminadas;
    await db.collection('socios').doc(email).update({
      totalArmas: totalArmasRestantes
    });
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ ARSENAL DE IVÁN CABO LIMPIO');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`📊 Resumen:`);
    console.log(`   - Antes: ${armasSnapshot.size} registros`);
    console.log(`   - Eliminadas: ${armasEliminadas} duplicados`);
    console.log(`   - Ahora: ${totalArmasRestantes} armas únicas\n`);
    
    console.log('🔫 Arsenal final (3 armas):\n');
    console.log('   1. PISTOLA CZ P-10 C - .380"');
    console.log('      Matrícula: DP23540\n');
    console.log('   2. PISTOLA BROWNING BUCK - .22"');
    console.log('      Matrícula: US515YY19935\n');
    console.log('   3. RIFLE MENDOZA PUMA - .22 L.R.');
    console.log('      Matrícula: 27280 (normalizada)\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

limpiarDuplicadosIvan();

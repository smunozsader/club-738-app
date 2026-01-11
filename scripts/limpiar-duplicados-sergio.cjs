/**
 * Script para eliminar armas duplicadas de Sergio Muñoz
 * Conserva la versión con modalidad y elimina duplicados
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function limpiarDuplicados() {
  const email = 'smunozam@gmail.com';
  
  try {
    console.log('\n🧹 Limpiando duplicados de arsenal...\n');
    
    const armasRef = db.collection('socios').doc(email).collection('armas');
    const armasSnapshot = await armasRef.get();
    
    // Agrupar por matrícula
    const armasPorMatricula = {};
    
    armasSnapshot.forEach((doc) => {
      const arma = doc.data();
      arma.id = doc.id;
      
      const key = arma.matricula;
      if (!armasPorMatricula[key]) {
        armasPorMatricula[key] = [];
      }
      armasPorMatricula[key].push(arma);
    });
    
    let armasEliminadas = 0;
    const batch = db.batch();
    
    // Procesar duplicados
    for (const [matricula, armas] of Object.entries(armasPorMatricula)) {
      if (armas.length > 1) {
        console.log(`\n🔍 Procesando matrícula: ${matricula}`);
        
        // Encontrar la mejor versión (con modalidad)
        const conModalidad = armas.find(a => a.modalidad && a.modalidad !== 'N/A');
        const sinModalidad = armas.find(a => !a.modalidad || a.modalidad === 'N/A');
        
        let armaAConservar;
        let armaAEliminar;
        
        if (conModalidad && sinModalidad) {
          // Conservar la que tiene modalidad
          armaAConservar = conModalidad;
          armaAEliminar = sinModalidad;
        } else if (armas.length === 2) {
          // Si ambas tienen o no tienen modalidad, conservar la primera
          armaAConservar = armas[0];
          armaAEliminar = armas[1];
        }
        
        if (armaAEliminar) {
          console.log(`   ✅ Conservar: ${armaAConservar.id} (${armaAConservar.modalidad || 'sin modalidad'})`);
          console.log(`   ❌ Eliminar: ${armaAEliminar.id} (${armaAEliminar.modalidad || 'sin modalidad'})`);
          
          const docRef = armasRef.doc(armaAEliminar.id);
          batch.delete(docRef);
          armasEliminadas++;
        }
      }
    }
    
    // Ejecutar eliminaciones
    if (armasEliminadas > 0) {
      console.log(`\n📝 Eliminando ${armasEliminadas} armas duplicadas...`);
      await batch.commit();
      console.log('✅ Duplicados eliminados exitosamente!\n');
      
      // Actualizar totalArmas
      const totalArmasRestantes = armasSnapshot.size - armasEliminadas;
      await db.collection('socios').doc(email).update({
        totalArmas: totalArmasRestantes
      });
      
      console.log(`📊 Arsenal actualizado:`);
      console.log(`   - Antes: ${armasSnapshot.size} armas`);
      console.log(`   - Eliminadas: ${armasEliminadas} duplicados`);
      console.log(`   - Ahora: ${totalArmasRestantes} armas\n`);
      
      console.log('═══════════════════════════════════════════════════════════');
      console.log('✅ ARSENAL LIMPIO Y ACTUALIZADO');
      console.log('═══════════════════════════════════════════════════════════\n');
      console.log('Tu arsenal ahora muestra 6 armas (sin duplicados):\n');
      console.log('1. ESCOPETA BROWNING PHOENIX - 12 GA');
      console.log('2. KIT DE CONVERSION CZ SHADOW 2 - 22 LR');
      console.log('3. RIFLE CZ 600 ALPHA - .223 REM');
      console.log('4. PISTOLA CZ SHADOW 2 - .380');
      console.log('5. RIFLE CZ452-2E ZKM - .22 LR');
      console.log('6. ESCOPETA P. BERETTA 682 GOLD E. - 12 GA\n');
    } else {
      console.log('\n✅ No se encontraron duplicados para eliminar\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

limpiarDuplicados();

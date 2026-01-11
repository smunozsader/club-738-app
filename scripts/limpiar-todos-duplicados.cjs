const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function limpiarTodosDuplicados() {
  console.log('\n🧹 Iniciando limpieza masiva de arsenales duplicados...\n');
  
  try {
    const sociosSnapshot = await db.collection('socios').get();
    
    const stats = {
      sociosProcesados: 0,
      sociosConCambios: 0,
      sociosSinCambios: 0,
      totalDuplicadosEliminados: 0,
      errores: []
    };

    for (const socioDoc of sociosSnapshot.docs) {
      const socioEmail = socioDoc.id;
      const socioData = socioDoc.data();
      const socioNombre = socioData.nombre || socioEmail;
      
      stats.sociosProcesados++;
      
      // Obtener armas del socio
      const armasSnapshot = await db.collection(`socios/${socioEmail}/armas`).get();
      
      if (armasSnapshot.empty) {
        console.log(`  ⚪ ${socioNombre}: Sin armas`);
        stats.sociosSinCambios++;
        continue;
      }
      
      // Agrupar armas por matrícula
      const armasPorMatricula = {};
      armasSnapshot.forEach(doc => {
        const arma = doc.data();
        const matricula = arma.matricula;
        
        if (!armasPorMatricula[matricula]) {
          armasPorMatricula[matricula] = [];
        }
        
        armasPorMatricula[matricula].push({
          id: doc.id,
          ...arma
        });
      });
      
      // Identificar duplicados
      const duplicados = Object.entries(armasPorMatricula)
        .filter(([_, copies]) => copies.length > 1);
      
      if (duplicados.length === 0) {
        console.log(`  ✅ ${socioNombre}: ${armasSnapshot.size} armas (sin duplicados)`);
        stats.sociosSinCambios++;
        continue;
      }
      
      // Preparar batch para eliminar duplicados
      const batch = db.batch();
      const armasRef = db.collection(`socios/${socioEmail}/armas`);
      let eliminadosEsteSocio = 0;
      let armasFinales = armasSnapshot.size;
      
      duplicados.forEach(([matricula, copies]) => {
        // Estrategia de limpieza:
        // 1. Conservar versión con UUID (más reciente, tiene modalidad)
        // 2. Eliminar versión con ID = matrícula (antigua, sin modalidad)
        
        const versionConUUID = copies.find(c => c.id.includes('-')); // UUID tiene guiones
        const versionSinUUID = copies.find(c => !c.id.includes('-')); // ID = matrícula
        
        if (versionConUUID && versionSinUUID) {
          // Escenario normal: una con UUID, otra sin UUID
          console.log(`    🗑️  Eliminando duplicado: ${versionSinUUID.id} (${matricula})`);
          batch.delete(armasRef.doc(versionSinUUID.id));
          eliminadosEsteSocio++;
          armasFinales--;
        } else if (copies.length > 1) {
          // Escenario edge case: múltiples copias del mismo tipo
          // Conservar la primera, eliminar el resto
          const [conservar, ...eliminar] = copies;
          eliminar.forEach(arma => {
            console.log(`    🗑️  Eliminando duplicado extra: ${arma.id} (${matricula})`);
            batch.delete(armasRef.doc(arma.id));
            eliminadosEsteSocio++;
            armasFinales--;
          });
        }
      });
      
      // Actualizar totalArmas del socio
      batch.update(socioDoc.ref, { totalArmas: armasFinales });
      
      try {
        await batch.commit();
        
        console.log(`  🔄 ${socioNombre}:`);
        console.log(`     Armas antes: ${armasSnapshot.size}`);
        console.log(`     Duplicados eliminados: ${eliminadosEsteSocio}`);
        console.log(`     Armas después: ${armasFinales}`);
        
        stats.sociosConCambios++;
        stats.totalDuplicadosEliminados += eliminadosEsteSocio;
        
      } catch (error) {
        console.error(`  ❌ Error limpiando arsenal de ${socioNombre}:`, error.message);
        stats.errores.push({
          socio: socioNombre,
          email: socioEmail,
          error: error.message
        });
      }
    }
    
    // Reporte final
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 RESUMEN DE LIMPIEZA');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Socios procesados: ${stats.sociosProcesados}`);
    console.log(`Socios con cambios: ${stats.sociosConCambios}`);
    console.log(`Socios sin cambios: ${stats.sociosSinCambios}`);
    console.log(`Total duplicados eliminados: ${stats.totalDuplicadosEliminados}`);
    
    if (stats.errores.length > 0) {
      console.log('\n⚠️  ERRORES DURANTE LIMPIEZA:');
      stats.errores.forEach(err => {
        console.log(`  - ${err.socio} (${err.email}): ${err.error}`);
      });
    }
    
    console.log('\n✅ Limpieza masiva completada');
    console.log('📋 Ejecuta: node scripts/verificar-todos-arsenales.cjs para confirmar');
    
  } catch (error) {
    console.error('❌ Error en limpieza masiva:', error);
  } finally {
    await admin.app().delete();
  }
}

limpiarTodosDuplicados();

const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function verificarIntegridadDatos() {
  console.log('\n🔍 Verificando integridad de datos: CSV vs Firebase\n');
  console.log('═══════════════════════════════════════════════════════════');
  
  try {
    // 1. Leer CSV original
    console.log('\n📄 Leyendo CSV original...');
    const csvPath = './data/socios/2025.31.12_RELACION_SOCIOS_ARMAS_SEPARADO.csv';
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Parsear CSV (skip header)
    const armasPorSocioCSV = {};
    let totalArmasCSV = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      
      // CSV structure: Credencial,Nombre,Email,Clase,Calibre,Marca,Modelo,Matricula,Folio,Modalidad
      const parts = line.split(',');
      if (parts.length < 3) continue;
      
      const email = parts[2]?.trim().toLowerCase();
      if (!email || email === 'email') continue;
      
      if (!armasPorSocioCSV[email]) {
        armasPorSocioCSV[email] = [];
      }
      
      armasPorSocioCSV[email].push({
        clase: parts[3]?.trim(),
        calibre: parts[4]?.trim(),
        marca: parts[5]?.trim(),
        modelo: parts[6]?.trim(),
        matricula: parts[7]?.trim(),
        folio: parts[8]?.trim(),
        modalidad: parts[9]?.trim()
      });
      
      totalArmasCSV++;
    }
    
    console.log(`✅ CSV leído: ${Object.keys(armasPorSocioCSV).length} socios, ${totalArmasCSV} armas totales`);
    
    // 2. Leer datos de Firebase
    console.log('\n🔥 Leyendo datos de Firebase...');
    const sociosSnapshot = await db.collection('socios').get();
    
    const armasPorSocioFirebase = {};
    let totalArmasFirebase = 0;
    let sociosConArmasFirebase = 0;
    
    for (const socioDoc of sociosSnapshot.docs) {
      const email = socioDoc.id.toLowerCase();
      const armasSnapshot = await db.collection(`socios/${socioDoc.id}/armas`).get();
      
      if (!armasSnapshot.empty) {
        armasPorSocioFirebase[email] = [];
        sociosConArmasFirebase++;
        
        armasSnapshot.forEach(armaDoc => {
          const arma = armaDoc.data();
          armasPorSocioFirebase[email].push({
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
    
    console.log(`✅ Firebase leído: ${sociosConArmasFirebase} socios con armas, ${totalArmasFirebase} armas totales`);
    
    // 3. Comparar totales
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 COMPARACIÓN GENERAL');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total armas en CSV:      ${totalArmasCSV}`);
    console.log(`Total armas en Firebase: ${totalArmasFirebase}`);
    console.log(`Diferencia:              ${totalArmasCSV - totalArmasFirebase}`);
    
    if (totalArmasCSV === totalArmasFirebase) {
      console.log('\n✅ ¡LOS TOTALES COINCIDEN PERFECTAMENTE!');
    } else {
      console.log('\n⚠️  HAY DIFERENCIAS - Analizando...');
    }
    
    // 4. Comparar por socio
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📋 COMPARACIÓN POR SOCIO');
    console.log('═══════════════════════════════════════════════════════════');
    
    const todosLosEmails = new Set([
      ...Object.keys(armasPorSocioCSV),
      ...Object.keys(armasPorSocioFirebase)
    ]);
    
    const diferencias = [];
    const coincidencias = [];
    
    for (const email of todosLosEmails) {
      const armasCSV = armasPorSocioCSV[email] || [];
      const armasFirebase = armasPorSocioFirebase[email] || [];
      
      if (armasCSV.length !== armasFirebase.length) {
        diferencias.push({
          email,
          csv: armasCSV.length,
          firebase: armasFirebase.length,
          diferencia: armasCSV.length - armasFirebase.length
        });
      } else if (armasCSV.length > 0) {
        coincidencias.push({
          email,
          armas: armasCSV.length
        });
      }
    }
    
    if (diferencias.length > 0) {
      console.log('\n⚠️  SOCIOS CON DIFERENCIAS:');
      diferencias.forEach(d => {
        const signo = d.diferencia > 0 ? '+' : '';
        console.log(`  ${d.email}`);
        console.log(`    CSV: ${d.csv} armas | Firebase: ${d.firebase} armas | Diferencia: ${signo}${d.diferencia}`);
      });
      
      console.log(`\n📊 Total socios con diferencias: ${diferencias.length}`);
    } else {
      console.log('\n✅ Todos los socios tienen el mismo número de armas en CSV y Firebase');
    }
    
    console.log(`\n✅ Socios que coinciden: ${coincidencias.length}`);
    
    // 5. Casos especiales conocidos
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📌 CASOS ESPECIALES (cambios después del CSV)');
    console.log('═══════════════════════════════════════════════════════════');
    
    // Iván Cabo - se agregaron 2 armas nuevas después del CSV
    const ivanEmail = 'ivancabo@gmail.com';
    const ivanCSV = armasPorSocioCSV[ivanEmail]?.length || 0;
    const ivanFirebase = armasPorSocioFirebase[ivanEmail]?.length || 0;
    console.log(`\nIván Cabo (${ivanEmail}):`);
    console.log(`  CSV original: ${ivanCSV} armas`);
    console.log(`  Firebase actual: ${ivanFirebase} armas`);
    console.log(`  Esperado: 3 armas (1 del CSV + 2 agregadas después)`);
    
    // Gardoni - puede tener cambios de alta/baja
    const gardoniEmail = 'jrgardoni@gmail.com';
    const gardoniCSV = armasPorSocioCSV[gardoniEmail]?.length || 0;
    const gardoniFirebase = armasPorSocioFirebase[gardoniEmail]?.length || 0;
    console.log(`\nGardoni (${gardoniEmail}):`);
    console.log(`  CSV original: ${gardoniCSV} armas`);
    console.log(`  Firebase actual: ${gardoniFirebase} armas`);
    console.log(`  Nota: Puede tener solicitudes de alta/baja pendientes`);
    
    // 6. Resumen final
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ RESUMEN');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`CSV: ${totalArmasCSV} armas en ${Object.keys(armasPorSocioCSV).length} socios`);
    console.log(`Firebase: ${totalArmasFirebase} armas en ${sociosConArmasFirebase} socios`);
    console.log(`Coincidencias: ${coincidencias.length} socios`);
    console.log(`Diferencias: ${diferencias.length} socios`);
    
    if (Math.abs(totalArmasCSV - totalArmasFirebase) <= 3) {
      console.log('\n✅ Los datos están ÍNTEGROS (diferencias esperadas por cambios recientes)');
    } else {
      console.log('\n⚠️  Revisar diferencias - pueden indicar problemas');
    }
    
    // Guardar reporte
    const reporte = {
      fecha: new Date().toISOString(),
      totales: {
        csv: totalArmasCSV,
        firebase: totalArmasFirebase,
        diferencia: totalArmasCSV - totalArmasFirebase
      },
      sociosConDiferencias: diferencias,
      sociosCoinciden: coincidencias.length
    };
    
    fs.writeFileSync('./docs/reporte-integridad.json', JSON.stringify(reporte, null, 2));
    console.log('\n📄 Reporte guardado en: docs/reporte-integridad.json');
    
  } catch (error) {
    console.error('\n❌ Error al verificar integridad:', error);
  } finally {
    await admin.app().delete();
  }
}

verificarIntegridadDatos();

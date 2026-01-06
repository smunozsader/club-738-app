/**
 * Script para actualizar modalidad de armas en Firestore
 * Club de Caza, Tiro y Pesca de Yucatán A.C.
 * 
 * MODALIDADES:
 * - 'caza'  → PETA SEDENA-02-045 (Caza deportiva)
 * - 'tiro'  → PETA SEDENA-02-046 (Tiro deportivo/competencia)
 * - 'ambas' → Puede usarse para cualquier PETA
 * 
 * INFERENCIA INICIAL (puede ajustarse manualmente):
 * - Escopetas → generalmente 'caza' o 'ambas'
 * - Rifles de caza (.30-06, .308, .270, etc.) → 'caza'
 * - Pistolas/Revólveres → 'tiro'
 * - Rifles deportivos (.22 LR, etc.) → 'tiro'
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Inicializar Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Calibres típicos de caza
const CALIBRES_CAZA = [
  '.30-06', '30-06', '.308', '308', '.270', '270', '.243', '243',
  '.300', '300', '.375', '375', '7mm', '7MM', '.338', '338',
  '.223', '223', '5.56', '.30-30', '30-30', '.35', '35',
  '12', '16', '20', '410', // Escopetas
  '10', '28' // Más escopetas
];

// Calibres típicos de tiro
const CALIBRES_TIRO = [
  '.22', '22 LR', '.22LR', '22LR', '.22 L.R.', 
  '.38', '38', '.380', '380',
  '9mm', '9MM', '9 MM', '.9MM',
  '.45', '45', '.40', '40',
  '.357', '357',
  '.25', '25', '.32', '32',
  '.177', '177', '4.5', '4.5mm' // Aire comprimido
];

function inferirModalidad(arma) {
  const clase = String(arma.clase || '').toUpperCase();
  const calibre = String(arma.calibre || '').toUpperCase();
  
  // Escopetas generalmente para caza
  if (clase.includes('ESCOPETA')) {
    return 'ambas'; // Escopetas pueden usarse en ambas modalidades
  }
  
  // Pistolas y revólveres generalmente para tiro
  if (clase.includes('PISTOLA') || clase.includes('REVOLVER') || clase.includes('REVÓLVER')) {
    return 'tiro';
  }
  
  // Rifles - depende del calibre
  if (clase.includes('RIFLE') || clase.includes('CARABINA')) {
    // Verificar calibres de caza
    for (const cal of CALIBRES_CAZA) {
      if (calibre.includes(cal.toUpperCase())) {
        return 'caza';
      }
    }
    // Verificar calibres de tiro
    for (const cal of CALIBRES_TIRO) {
      if (calibre.includes(cal.toUpperCase())) {
        return 'tiro';
      }
    }
    // Por defecto rifles sin clasificar → caza
    return 'caza';
  }
  
  // Default: tiro
  return 'tiro';
}

async function actualizarModalidades(modoInteractivo = false) {
  console.log('\n🎯 Club 738 - Actualizador de Modalidad de Armas');
  console.log('='.repeat(55));
  console.log('MODALIDADES:');
  console.log('  • caza  → PETA SEDENA-02-045 (Caza deportiva)');
  console.log('  • tiro  → PETA SEDENA-02-046 (Tiro/Competencia)');
  console.log('  • ambas → Cualquier PETA');
  console.log('='.repeat(55));

  // Obtener todos los socios
  const sociosSnap = await db.collection('socios').get();
  console.log(`\n📊 Socios encontrados: ${sociosSnap.size}`);

  let totalArmas = 0;
  let armasActualizadas = 0;
  let armasSinModalidad = [];

  for (const socioDoc of sociosSnap.docs) {
    const email = socioDoc.id;
    const armasSnap = await db.collection('socios').doc(email).collection('armas').get();
    
    for (const armaDoc of armasSnap.docs) {
      totalArmas++;
      const arma = armaDoc.data();
      
      // Si ya tiene modalidad, saltar
      if (arma.modalidad) {
        continue;
      }
      
      // Inferir modalidad
      const modalidadInferida = inferirModalidad(arma);
      
      armasSinModalidad.push({
        email,
        armaId: armaDoc.id,
        clase: arma.clase,
        calibre: arma.calibre,
        marca: arma.marca,
        modelo: arma.modelo,
        matricula: arma.matricula,
        modalidadInferida
      });
    }
  }

  console.log(`\n🔫 Total armas: ${totalArmas}`);
  console.log(`⏳ Armas sin modalidad: ${armasSinModalidad.length}`);

  if (armasSinModalidad.length === 0) {
    console.log('\n✅ Todas las armas ya tienen modalidad asignada.');
    return;
  }

  // Mostrar resumen de inferencias
  const porModalidad = {
    caza: armasSinModalidad.filter(a => a.modalidadInferida === 'caza').length,
    tiro: armasSinModalidad.filter(a => a.modalidadInferida === 'tiro').length,
    ambas: armasSinModalidad.filter(a => a.modalidadInferida === 'ambas').length
  };

  console.log('\n📋 Inferencias:');
  console.log(`  • Caza:  ${porModalidad.caza} armas`);
  console.log(`  • Tiro:  ${porModalidad.tiro} armas`);
  console.log(`  • Ambas: ${porModalidad.ambas} armas`);

  if (modoInteractivo) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log('\n📝 Modo interactivo: Revisa cada arma y confirma/cambia modalidad');
    console.log('   (Enter = aceptar inferencia, c=caza, t=tiro, a=ambas, s=saltar)\n');

    for (const arma of armasSinModalidad) {
      console.log(`\n${arma.email}`);
      console.log(`  ${arma.marca} ${arma.modelo} - ${arma.clase} ${arma.calibre}`);
      console.log(`  Matrícula: ${arma.matricula}`);
      console.log(`  → Inferido: ${arma.modalidadInferida.toUpperCase()}`);
      
      const respuesta = await new Promise(resolve => {
        rl.question('  ¿Modalidad? [Enter/c/t/a/s]: ', resolve);
      });

      let modalidadFinal = arma.modalidadInferida;
      if (respuesta === 'c') modalidadFinal = 'caza';
      else if (respuesta === 't') modalidadFinal = 'tiro';
      else if (respuesta === 'a') modalidadFinal = 'ambas';
      else if (respuesta === 's') {
        console.log('  ⏭️  Saltada');
        continue;
      }

      // Actualizar en Firestore
      await db.collection('socios').doc(arma.email)
        .collection('armas').doc(arma.armaId)
        .update({ modalidad: modalidadFinal });
      
      console.log(`  ✅ Actualizada: ${modalidadFinal.toUpperCase()}`);
      armasActualizadas++;
    }

    rl.close();
  } else {
    // Modo batch: aplicar todas las inferencias
    console.log('\n🚀 Aplicando inferencias automáticas...\n');
    
    const batch = db.batch();
    let batchCount = 0;

    for (const arma of armasSinModalidad) {
      const armaRef = db.collection('socios').doc(arma.email)
        .collection('armas').doc(arma.armaId);
      
      batch.update(armaRef, { modalidad: arma.modalidadInferida });
      batchCount++;
      armasActualizadas++;

      // Firestore batch limit = 500
      if (batchCount >= 450) {
        await batch.commit();
        console.log(`  Batch de ${batchCount} armas actualizado`);
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
      console.log(`  Batch final de ${batchCount} armas actualizado`);
    }
  }

  console.log('\n' + '='.repeat(55));
  console.log(`✅ Armas actualizadas: ${armasActualizadas}`);
  console.log('='.repeat(55));
}

// Ejecutar
const modoInteractivo = process.argv.includes('--interactive') || process.argv.includes('-i');
actualizarModalidades(modoInteractivo)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

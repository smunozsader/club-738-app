/**
 * ARQUEO: Morosos 2025 vs Exentos vs Firestore
 * Verificar coherencia de lista de morosos proporcionada por secretario
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

console.log('\n📊 ARQUEO: Morosos 2025 vs Exentos vs Firestore');
console.log('═'.repeat(80));

// 1. Lista de morosos proporcionada por secretario (19 emails)
const morososListado = [
  'jacintolizarraga@hotmail.com',
  'sysaventas@hotmail.com',
  'manuel.chaidez@valledelsur.com.mx',
  'humh4@hotmail.com',
  'josebadz@outlook.com',
  'david_xolz@hotmail.com',
  'josegilbertohernandezcarrillo@gmail.com',
  'galvani@hotmail.com',
  'agus_tin1_@hotmail.com',  // Nota: email diferente al de credenciales
  'marcotonyjr@hotmail.com',
  'tonysantacruz@hotmail.com',
  'd@azarcorp.mx',
  'armando.pard@gmail.com',
  'valenciarojasjjesus@gmail.com',
  'mjtzab@yahoo.com',
  'lolita@concepthaus.mx',
  'santiago100100@hotmail.com',
  'egpiccolo@gmail.com',
  'alejandro18sosa@gmail.com'
];

// 2. Lista de EXENTOS (NO se les cobra)
const exentos = [
  // Mesa Directiva (según el usuario)
  'richfegas@icloud.com',      // Ricardo Fernández (¿Presidente?)
  'jrgardoni@gmail.com',       // Joaquín Gardoni
  'arechiga@jogarplastics.com', // María Fernanda Arechiga
  'gfernandez63@gmail.com',    // Gerardo Fernández
  
  // Recién ingresados 2024-H2
  'aimeegomez615@gmail.com',   // Aimee Gomez (nueva)
  'oso.guigam@gmail.com',      // Luis Fernando Guillermo (nuevo)
  
  // Secretario
  'smunozam@gmail.com'         // Sergio Muñoz (secretario)
];

// 3. Socios que recién pagaron (ya no morosos)
const recienPagaron = [
  'squintal158@gmail.com',     // Santiago Quintal
  'richfer0304@gmail.com',     // Ricardo Daniel
  'richfer1020@gmail.com'      // Ricardo Manuel
];

console.log(`\n📋 DATOS DE ENTRADA:`);
console.log(`   Morosos listado secretario: ${morososListado.length}`);
console.log(`   Exentos (no se cobra):      ${exentos.length}`);
console.log(`   Recién pagaron:             ${recienPagaron.length}`);

// 4. Verificar cruces
console.log(`\n🔍 VERIFICACIÓN DE CRUCES:`);
console.log('─'.repeat(80));

const morososeEnExentos = [];
const morososEnRecienPagaron = [];

morososListado.forEach(email => {
  if (exentos.includes(email.toLowerCase())) {
    morososeEnExentos.push(email);
  }
  if (recienPagaron.includes(email.toLowerCase())) {
    morososEnRecienPagaron.push(email);
  }
});

if (morososeEnExentos.length > 0) {
  console.log(`❌ ERROR: ${morososeEnExentos.length} morosos están en lista de EXENTOS:`);
  morososeEnExentos.forEach(email => console.log(`   - ${email}`));
} else {
  console.log(`✅ OK: Ningún moroso está en lista de exentos`);
}

if (morososEnRecienPagaron.length > 0) {
  console.log(`❌ ERROR: ${morososEnRecienPagaron.length} morosos están en lista de RECIÉN PAGARON:`);
  morososEnRecienPagaron.forEach(email => console.log(`   - ${email}`));
} else {
  console.log(`✅ OK: Ningún moroso está en lista de recién pagaron`);
}

// 5. Verificar contra Firestore
async function verificarFirestore() {
  console.log(`\n🔥 VERIFICACIÓN EN FIRESTORE:`);
  console.log('─'.repeat(80));
  
  const morososEnFirestore = [];
  const pagadosEnFirestore = [];
  const noEncontrados = [];
  const emailCorregido = new Map();
  
  for (const email of morososListado) {
    try {
      // Intentar con el email del listado
      let socioRef = db.collection('socios').doc(email.toLowerCase());
      let doc = await socioRef.get();
      
      // Si no existe, intentar con email corregido (caso agus_tin1_)
      if (!doc.exists && email === 'agus_tin1_@hotmail.com') {
        const emailAlt = 'agustin.moreno@email.com';
        socioRef = db.collection('socios').doc(emailAlt);
        doc = await socioRef.get();
        if (doc.exists) {
          emailCorregido.set(email, emailAlt);
        }
      }
      
      if (!doc.exists) {
        noEncontrados.push(email);
        console.log(`  ❌ NO ENCONTRADO: ${email}`);
        continue;
      }
      
      const data = doc.data();
      const nombre = data.nombre || 'SIN NOMBRE';
      const estado = data.renovacion2026?.estado || 'sin datos';
      const exento = data.renovacion2026?.exento || false;
      
      if (estado === 'pendiente' && !exento) {
        morososEnFirestore.push(email);
        console.log(`  ✓ MOROSO: ${nombre} (${emailCorregido.get(email) || email})`);
      } else if (estado === 'pagado') {
        pagadosEnFirestore.push(email);
        console.log(`  ⚠️  PAGADO: ${nombre} (${emailCorregido.get(email) || email})`);
      } else if (exento) {
        pagadosEnFirestore.push(email);
        console.log(`  ⚠️  EXENTO: ${nombre} (${emailCorregido.get(email) || email})`);
      }
      
    } catch (error) {
      console.log(`  ❌ ERROR al consultar ${email}: ${error.message}`);
    }
  }
  
  // 6. Resumen
  console.log(`\n📊 RESUMEN FIRESTORE:`);
  console.log('─'.repeat(80));
  console.log(`Morosos en Firestore:     ${morososEnFirestore.length}`);
  console.log(`Ya pagados/exentos:       ${pagadosEnFirestore.length}`);
  console.log(`No encontrados:           ${noEncontrados.length}`);
  
  if (emailCorregido.size > 0) {
    console.log(`\n📝 EMAILS CORREGIDOS:`);
    emailCorregido.forEach((correcto, original) => {
      console.log(`   ${original} → ${correcto}`);
    });
  }
  
  if (pagadosEnFirestore.length > 0) {
    console.log(`\n⚠️  SOCIOS QUE YA PAGARON (no enviar email de morosos):`);
    pagadosEnFirestore.forEach(email => console.log(`   - ${email}`));
  }
  
  // 7. Conclusión
  console.log(`\n${'═'.repeat(80)}`);
  if (noEncontrados.length > 0 || pagadosEnFirestore.length > 0 || morososeEnExentos.length > 0) {
    console.log(`❌ ARQUEO CON INCONSISTENCIAS - Revisar antes de enviar emails`);
    console.log(`\n📧 EMAILS A ENVIAR: ${morososEnFirestore.length} morosos confirmados`);
  } else {
    console.log(`✅ ARQUEO EXITOSO - Lista coherente`);
    console.log(`\n📧 EMAILS A ENVIAR: ${morososEnFirestore.length} morosos`);
  }
  
  process.exit(0);
}

verificarFirestore();

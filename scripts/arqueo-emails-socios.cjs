/**
 * ARQUEO: Verificar coherencia entre emails de campaña vs socios reales
 * Regla: NO PUEDE HABER MÁS EMAILS QUE SOCIOS
 */

const fs = require('fs');
const path = require('path');

console.log('\n📊 ARQUEO DE EMAILS vs SOCIOS');
console.log('═'.repeat(80));

// 1. Leer credenciales_socios.csv (FUENTE DE VERDAD)
const credencialesPath = path.join(__dirname, '../data/socios/credenciales_socios.csv');
const credencialesContent = fs.readFileSync(credencialesPath, 'utf-8');
const credencialesLines = credencialesContent.split('\n').filter(line => line.trim());
const totalSocios = credencialesLines.length - 1; // Excluir header

console.log(`\n✅ FUENTE DE VERDAD: credenciales_socios.csv`);
console.log(`   Total socios: ${totalSocios}`);

// Extraer emails de credenciales
const emailsSocios = new Set();
for (let i = 1; i < credencialesLines.length; i++) {
  const match = credencialesLines[i].match(/^\d+,\d+,(.*?),(.*?),(.*)$/);
  if (match) {
    const email = match[2].trim();
    emailsSocios.add(email);
  }
}

console.log(`   Emails únicos: ${emailsSocios.size}`);

// 2. Leer CSVs de mail merge
const emailsDir = path.join(__dirname, '../emails-socios');

const mailMergeFiles = [
  'mail-merge-data.csv',
  'morosos-con-armas-mail-merge.csv',
  'morosos-sin-armas-mail-merge.csv'
];

let totalEmailsCampana = 0;
const emailsCampana = new Set();
const emailsNoEncontrados = [];
const emailsDuplicados = [];

console.log(`\n📧 ARCHIVOS DE CAMPAÑA:`);

mailMergeFiles.forEach(file => {
  const filePath = path.join(emailsDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  ${file} - NO EXISTE`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const count = lines.length - 1; // Excluir header
  
  console.log(`   ✓ ${file} - ${count} emails`);
  totalEmailsCampana += count;

  // Verificar emails
  for (let i = 1; i < lines.length; i++) {
    // Soportar dos formatos:
    // Formato 1: Nombre,Email,Credencial,Password (morosos)
    // Formato 2: Email,Nombre,Credencial,Password (general)
    let email = null;
    
    const format1 = lines[i].match(/^(.*?),(.*?),(\d+),(.*)$/);
    if (format1) {
      // Detectar formato por contenido del campo 1 (si tiene @, es formato 2)
      if (format1[1].includes('@')) {
        email = format1[1].trim(); // Formato 2: Email,Nombre,Credencial,Password
      } else {
        email = format1[2].trim(); // Formato 1: Nombre,Email,Credencial,Password
      }
    }
    
    if (email) {
      
      // Verificar si existe en socios
      if (!emailsSocios.has(email)) {
        emailsNoEncontrados.push({ archivo: file, email });
      }
      
      // Verificar duplicados dentro de la campaña
      if (emailsCampana.has(email)) {
        emailsDuplicados.push({ archivo: file, email });
      }
      
      emailsCampana.add(email);
    }
  }
});

console.log(`\n   Total emails en campaña: ${totalEmailsCampana}`);
console.log(`   Emails únicos en campaña: ${emailsCampana.size}`);

// 3. VALIDACIÓN CRÍTICA
console.log(`\n🔍 VALIDACIÓN:`);
console.log('─'.repeat(80));

let erroresEncontrados = false;

// Regla 1: No puede haber más emails que socios
if (emailsCampana.size > emailsSocios.size) {
  console.log(`❌ ERROR: Hay más emails en campaña (${emailsCampana.size}) que socios (${emailsSocios.size})`);
  erroresEncontrados = true;
} else {
  console.log(`✅ OK: Emails en campaña (${emailsCampana.size}) ≤ Socios (${emailsSocios.size})`);
}

// Regla 2: No debe haber duplicados
if (emailsDuplicados.length > 0) {
  console.log(`❌ ERROR: ${emailsDuplicados.length} emails duplicados en campaña:`);
  emailsDuplicados.forEach(dup => {
    console.log(`   - ${dup.email} (${dup.archivo})`);
  });
  erroresEncontrados = true;
} else {
  console.log(`✅ OK: No hay emails duplicados en campaña`);
}

// Regla 3: Todos los emails deben existir en socios
if (emailsNoEncontrados.length > 0) {
  console.log(`❌ ERROR: ${emailsNoEncontrados.length} emails NO encontrados en credenciales_socios.csv:`);
  emailsNoEncontrados.forEach(item => {
    console.log(`   - ${item.email} (${item.archivo})`);
  });
  erroresEncontrados = true;
} else {
  console.log(`✅ OK: Todos los emails existen en credenciales_socios.csv`);
}

// 4. RESUMEN
console.log(`\n📋 RESUMEN:`);
console.log('─'.repeat(80));
console.log(`Total socios activos:        ${totalSocios}`);
console.log(`Total emails en campaña:     ${totalEmailsCampana}`);
console.log(`Emails únicos en campaña:    ${emailsCampana.size}`);
console.log(`Socios NO incluidos:         ${emailsSocios.size - emailsCampana.size}`);

// 5. Listar socios NO incluidos en campaña
const sociosNoIncluidos = [];
emailsSocios.forEach(email => {
  if (!emailsCampana.has(email)) {
    sociosNoIncluidos.push(email);
  }
});

if (sociosNoIncluidos.length > 0) {
  console.log(`\n⚠️  SOCIOS NO INCLUIDOS EN CAMPAÑA (${sociosNoIncluidos.length}):`);
  sociosNoIncluidos.forEach(email => {
    console.log(`   - ${email}`);
  });
}

// 6. CONCLUSIÓN
console.log(`\n${'═'.repeat(80)}`);
if (erroresEncontrados) {
  console.log(`❌ ARQUEO FALLIDO - Corregir errores antes de enviar emails`);
  process.exit(1);
} else {
  console.log(`✅ ARQUEO EXITOSO - Campaña coherente con base de socios`);
  console.log(`✓ ${totalEmailsCampana} emails listos para enviar`);
  process.exit(0);
}

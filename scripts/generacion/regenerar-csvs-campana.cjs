/**
 * Regenerar CSVs de campaña con distribución correcta:
 * - General: 57 socios (77 - 19 morosos - 1 Sergio)
 * - Morosos: 19 socios
 */

const fs = require('fs');
const path = require('path');

console.log('\n📧 REGENERAR CSVs DE CAMPAÑA');
console.log('═'.repeat(80));

// 1. Leer credenciales
const credencialesPath = path.join(__dirname, '../data/socios/credenciales_socios.csv');
const csvContent = fs.readFileSync(credencialesPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

const credenciales = {};
for (let i = 1; i < lines.length; i++) {
  const match = lines[i].match(/^(\d+),(\d+),(.*?),(.*?),(.*)$/);
  if (match) {
    const [, no, credencial, nombre, email, password] = match;
    credenciales[email.trim().toLowerCase()] = {
      no,
      credencial,
      nombre: nombre.trim(),
      email: email.trim(),
      password: password.trim()
    };
  }
}

console.log(`✓ ${Object.keys(credenciales).length} socios en credenciales`);

// 2. Lista de 19 morosos confirmados
const morososEmails = [
  'jacintolizarraga@hotmail.com',
  'sysaventas@hotmail.com',
  'manuel.chaidez@valledelsur.com.mx',
  'humh4@hotmail.com',
  'josebadz@outlook.com',
  'david_xolz@hotmail.com',
  'josegilbertohernandezcarrillo@gmail.com',
  'galvani@hotmail.com',
  'agustin.moreno@email.com',  // CORREGIDO del listado
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

const morososSet = new Set(morososEmails.map(e => e.toLowerCase()));

// 3. Generar CSV de MOROSOS (Nombre,Email,Credencial,Password)
console.log(`\n📋 Generando CSV de MOROSOS...`);
const morososRows = ['Nombre,Email,Credencial,Password'];

morososEmails.forEach(email => {
  const socio = credenciales[email.toLowerCase()];
  if (socio) {
    morososRows.push(`"${socio.nombre}",${socio.email},${socio.credencial},${socio.password}`);
  } else {
    console.log(`  ⚠️  No encontrado: ${email}`);
  }
});

const morososPath = path.join(__dirname, '../emails-socios/morosos-2025-mail-merge.csv');
fs.writeFileSync(morososPath, morososRows.join('\n'), 'utf-8');

console.log(`✅ morosos-2025-mail-merge.csv generado`);
console.log(`   Morosos: ${morososRows.length - 1}`);

// 4. Generar CSV GENERAL (Email,Nombre,Credencial,Password)
// Excluir: Sergio + 19 morosos
console.log(`\n📧 Generando CSV GENERAL...`);
const generalRows = ['Email,Nombre,Credencial,Password'];

Object.keys(credenciales).forEach(email => {
  // Excluir Sergio
  if (email === 'smunozam@gmail.com') {
    return;
  }
  
  // Excluir morosos
  if (morososSet.has(email)) {
    return;
  }
  
  const socio = credenciales[email];
  generalRows.push(`${socio.email},"${socio.nombre}",${socio.credencial},${socio.password}`);
});

const generalPath = path.join(__dirname, '../emails-socios/mail-merge-general.csv');
fs.writeFileSync(generalPath, generalRows.join('\n'), 'utf-8');

console.log(`✅ mail-merge-general.csv generado`);
console.log(`   Socios: ${generalRows.length - 1}`);

// 5. Resumen
console.log(`\n📊 DISTRIBUCIÓN FINAL:`);
console.log('─'.repeat(80));
console.log(`Email general:     ${generalRows.length - 1} socios`);
console.log(`Email morosos:     ${morososRows.length - 1} socios`);
console.log(`Sergio (excluido): 1 socio`);
console.log(`─────────────────────────────`);
console.log(`TOTAL:             77 socios`);

console.log(`\n✅ Archivos generados en emails-socios/:`);
console.log(`   - mail-merge-general.csv`);
console.log(`   - morosos-2025-mail-merge.csv`);

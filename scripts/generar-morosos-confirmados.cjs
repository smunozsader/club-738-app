/**
 * Generar CSV de MOROSOS REALES (no pagaron 2025)
 * Lista proporcionada por el secretario: 19 morosos confirmados
 */

const fs = require('fs');
const path = require('path');

console.log('\n📧 GENERAR CSV: Morosos Reales 2025 (con armas)');
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

// 2. Lista de morosos confirmados (del email del secretario)
const morososEmails = [
  'jacintolizarraga@hotmail.com',
  'sysaventas@hotmail.com',
  'manuel.chaidez@valledelsur.com.mx',
  'humh4@hotmail.com',
  'josebadz@outlook.com',
  'david_xolz@hotmail.com',
  'josegilbertohernandezcarrillo@gmail.com',
  'galvani@hotmail.com',
  'agustin.moreno@email.com',  // CORREGIDO: era agus_tin1_@hotmail.com
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

console.log(`\n📋 Lista de morosos confirmados: ${morososEmails.length} emails`);

// 3. Generar CSV (formato: Nombre,Email,Credencial,Password)
const outputRows = ['Nombre,Email,Credencial,Password'];
const noEncontrados = [];

morososEmails.forEach(email => {
  const emailLower = email.toLowerCase();
  const socio = credenciales[emailLower];
  
  if (socio) {
    outputRows.push(`"${socio.nombre}",${socio.email},${socio.credencial},${socio.password}`);
    console.log(`  ✓ ${socio.nombre} (${email})`);
  } else {
    noEncontrados.push(email);
    console.log(`  ❌ NO ENCONTRADO: ${email}`);
  }
});

// 4. Guardar archivo
const outputPath = path.join(__dirname, '../emails-socios/morosos-2025-confirmados.csv');
fs.writeFileSync(outputPath, outputRows.join('\n'), 'utf-8');

console.log(`\n✅ Archivo generado: morosos-2025-confirmados.csv`);
console.log(`   Morosos encontrados: ${outputRows.length - 1}`);
console.log(`   No encontrados: ${noEncontrados.length}`);

if (noEncontrados.length > 0) {
  console.log(`\n⚠️  EMAILS NO ENCONTRADOS EN CREDENCIALES:`);
  noEncontrados.forEach(email => console.log(`   - ${email}`));
}

// 5. Resumen
console.log(`\n📊 NUEVA DISTRIBUCIÓN DE EMAILS:`);
console.log(`   - Email general (bienvenida): ${77 - (outputRows.length - 1) - 1} socios`); // 77 - morosos - Sergio
console.log(`   - Morosos 2025:               ${outputRows.length - 1}`);
console.log(`   - Secretario (no enviar):     1`);
console.log(`   ─────────────────────────────────`);
console.log(`   TOTAL:                        77 socios`);

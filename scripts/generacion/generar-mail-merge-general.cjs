/**
 * Generar mail-merge-data.csv para email GENERAL (bienvenida al portal)
 * Destinatarios: Socios AL CORRIENTE + EXENTOS (NO Sergio, NO morosos)
 */

const fs = require('fs');
const path = require('path');

console.log('\n📧 GENERAR CSV: Email General (Bienvenida Portal)');
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
    credenciales[email.trim()] = {
      no,
      credencial,
      nombre: nombre.trim(),
      password: password.trim()
    };
  }
}

console.log(`✓ ${Object.keys(credenciales).length} socios en credenciales`);

// 2. Leer morosos de los dos archivos
const morosPath1 = path.join(__dirname, '../emails-socios/morosos-con-armas-mail-merge.csv');
const morosPath2 = path.join(__dirname, '../emails-socios/morosos-sin-armas-mail-merge.csv');

const morosos = new Set();

// Leer morosos con armas
const moros1 = fs.readFileSync(morosPath1, 'utf-8').split('\n').filter(line => line.trim());
for (let i = 1; i < moros1.length; i++) {
  const match = moros1[i].match(/^(.*?),(.*?),(\d+),(.*)$/);
  if (match) {
    morosos.add(match[2].trim());
  }
}

// Leer morosos sin armas
const moros2 = fs.readFileSync(morosPath2, 'utf-8').split('\n').filter(line => line.trim());
for (let i = 1; i < moros2.length; i++) {
  const match = moros2[i].match(/^(.*?),(.*?),(\d+),(.*)$/);
  if (match) {
    morosos.add(match[2].trim());
  }
}

console.log(`✓ ${morosos.size} morosos identificados (excluir de email general)`);

// 3. Generar CSV de email general (formato: Email,Nombre,Credencial,Password)
const outputRows = ['Email,Nombre,Credencial,Password'];

Object.keys(credenciales).forEach(email => {
  // Excluir: Sergio + Morosos
  if (email === 'smunozam@gmail.com') {
    console.log(`  ⊗ Excluido (secretario): ${email}`);
    return;
  }
  
  if (morosos.has(email)) {
    console.log(`  ⊗ Excluido (moroso): ${email}`);
    return;
  }
  
  const socio = credenciales[email];
  outputRows.push(`${email},"${socio.nombre}",${socio.credencial},${socio.password}`);
});

// 4. Guardar archivo
const outputPath = path.join(__dirname, '../emails-socios/mail-merge-data.csv');
fs.writeFileSync(outputPath, outputRows.join('\n'), 'utf-8');

console.log(`\n✅ Archivo generado: mail-merge-data.csv`);
console.log(`   Destinatarios: ${outputRows.length - 1} socios`);
console.log(`   Formato: Email,Nombre,Credencial,Password`);

// 5. Resumen
console.log(`\n📊 DISTRIBUCIÓN DE EMAILS:`);
console.log(`   - Email general (bienvenida): ${outputRows.length - 1}`);
console.log(`   - Morosos con armas:          ${morosos.size - 7}`);
console.log(`   - Morosos sin armas:          7`);
console.log(`   - Secretario (no enviar):     1`);
console.log(`   ─────────────────────────────────`);
console.log(`   TOTAL:                        77 socios`);

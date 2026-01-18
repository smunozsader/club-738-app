const fs = require('fs');
const path = require('path');

// Leer credenciales
const credencialesPath = path.join(__dirname, '../data/socios/credenciales_socios.csv');
const csvContent = fs.readFileSync(credencialesPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Crear mapa email -> password
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

console.log('📧 Generando CSVs para socios sin armas con oferta DN27...\n');

// Grupo 1: MOROSO sin armas (Jesus Alejandro) - Template "Borrón y Cuenta Nueva + DN27"
const morososSinArmas = ['alejandro18sosa@gmail.com'];

// Grupo 2: AL CORRIENTE sin armas (Gaddi, Santiago) - Template "Bienvenida + DN27"
const alCorrienteSinArmas = [
  'gocaamal@hotmail.com',        // GADDI OTHONIEL CAAMAL PUC
  'santiagorueda2@gmail.com'     // SANTIAGO RUEDA ESCOBEDO
];

console.log('═══════════════════════════════════════════════════════════');
console.log('GRUPO 1: Moroso sin armas (Borrón y Cuenta Nueva + DN27)');
console.log('═══════════════════════════════════════════════════════════\n');

const csvMorososLineas = ['Email,Nombre,Credencial,Password'];
morososSinArmas.forEach(email => {
  if (credenciales[email]) {
    const c = credenciales[email];
    csvMorososLineas.push(`${email},"${c.nombre}",${c.credencial},${c.password}`);
    console.log(`✅ ${c.nombre}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${c.password}\n`);
  }
});

const outputMorosos = path.join(__dirname, '../emails-socios/moroso-sin-armas-DN27-mail-merge.csv');
fs.writeFileSync(outputMorosos, csvMorososLineas.join('\n'));
console.log(`✅ CSV generado: emails-socios/moroso-sin-armas-DN27-mail-merge.csv\n`);

console.log('═══════════════════════════════════════════════════════════');
console.log('GRUPO 2: Al corriente sin armas (Bienvenida + DN27)');
console.log('═══════════════════════════════════════════════════════════\n');

const csvAlCorrienteLineas = ['Email,Nombre,Credencial,Password'];
alCorrienteSinArmas.forEach(email => {
  if (credenciales[email]) {
    const c = credenciales[email];
    csvAlCorrienteLineas.push(`${email},"${c.nombre}",${c.credencial},${c.password}`);
    console.log(`✅ ${c.nombre}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${c.password}\n`);
  } else {
    console.log(`⚠️  NO ENCONTRADO: ${email}\n`);
  }
});

const outputAlCorriente = path.join(__dirname, '../emails-socios/al-corriente-sin-armas-DN27-mail-merge.csv');
fs.writeFileSync(outputAlCorriente, csvAlCorrienteLineas.join('\n'));
console.log(`✅ CSV generado: emails-socios/al-corriente-sin-armas-DN27-mail-merge.csv\n`);

console.log('═══════════════════════════════════════════════════════════');
console.log('📊 RESUMEN');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Morosos sin armas: ${morososSinArmas.length} (Jesus Alejandro)`);
console.log(`Al corriente sin armas: ${alCorrienteSinArmas.length} (Gaddi, Santiago)`);
console.log(`\nTotal socios con oferta DN27: ${morososSinArmas.length + alCorrienteSinArmas.length}\n`);

console.log('📧 Templates a usar:');
console.log('  - Moroso: TEMPLATE_MOROSO_SIN_ARMAS_DN27.html');
console.log('  - Al corriente: TEMPLATE_AL_CORRIENTE_SIN_ARMAS_DN27.html (por crear)\n');

const fs = require('fs');
const path = require('path');

// Leer credenciales
const credencialesPath = path.join(__dirname, '../data/socios/credenciales_socios.csv');
const csvContent = fs.readFileSync(credencialesPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Crear mapa email -> password
const credenciales = {};
for (let i = 1; i < lines.length; i++) {
  const match = lines[i].match(/^\d+,(\d+),(.*?),(.*?),(.*)$/);
  if (match) {
    const [, credencial, nombre, email, password] = match;
    credenciales[email.trim()] = {
      credencial,
      nombre: nombre.trim(),
      password: password.trim()
    };
  }
}

// Lista de morosos confirmados
const morososEmails = [
  'jacintolizarraga@hotmail.com',
  'sysaventas@hotmail.com',
  'manuel.chaidez@valledelsur.com.mx',
  'humh4@hotmail.com',
  'josebadz@outlook.com',
  'david_xolz@hotmail.com',
  'josegilbertohernandezcarrillo@gmail.com',
  'galvani@hotmail.com',
  'agus_tin1_@hotmail.com', // Email INCORRECTO en credenciales (dice agustin.moreno@email.com)
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

// Generar CSV con credenciales
console.log('📧 Generando CSV con passwords para mail merge...\n');

const csvLines = ['Email,Nombre,Credencial,Password'];
const notFound = [];

morososEmails.forEach(email => {
  if (credenciales[email]) {
    const c = credenciales[email];
    csvLines.push(`${email},"${c.nombre}",${c.credencial},${c.password}`);
    console.log(`✅ ${c.nombre} - ${email}`);
  } else {
    notFound.push(email);
    console.log(`⚠️  NO ENCONTRADO: ${email}`);
  }
});

if (notFound.length > 0) {
  console.log(`\n⚠️  ${notFound.length} emails NO encontrados en credenciales_socios.csv:`);
  notFound.forEach(email => console.log(`   - ${email}`));
}

// Guardar CSV
const outputPath = path.join(__dirname, '../emails-socios/morosos-2025-mail-merge.csv');
fs.writeFileSync(outputPath, csvLines.join('\n'));

console.log(`\n✅ CSV generado: emails-socios/morosos-2025-mail-merge.csv`);
console.log(`📊 Total: ${csvLines.length - 1} socios morosos con credenciales\n`);

console.log('═══════════════════════════════════════════════════════════');
console.log('📧 LISTO PARA MAIL MERGE');
console.log('═══════════════════════════════════════════════════════════');
console.log('Archivo: emails-socios/morosos-2025-mail-merge.csv');
console.log('Template: emails-socios/TEMPLATE_MOROSOS_BORRON_Y_CUENTA_NUEVA.html');
console.log('Variables: {{Email}}, {{Nombre}}, {{Credencial}}, {{Password}}');
console.log('═══════════════════════════════════════════════════════════\n');

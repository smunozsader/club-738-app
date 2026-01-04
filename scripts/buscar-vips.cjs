const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function buscarVIPs() {
  // Lista de emails VIP conocidos
  const vipEmails = [
    "jrgardoni@gmail.com",
    "richfegas@icloud.com", 
    "ivancabo@gmail.com",
    "squintal158@gmail.com",
    "agm@galletasdonde.com"
  ];

  console.log("\n========== SOCIOS VIP PARA WEB LAUNCH ==========\n");

  for (const email of vipEmails) {
    const doc = await db.collection("socios").doc(email).get();
    
    if (doc.exists) {
      const data = doc.data();
      let nombre = data.nombre || email;
      nombre = nombre.replace(/^\d+\.\s*/, ""); // Limpiar prefijo
      
      console.log(`📧 ${email}`);
      console.log(`   Nombre: ${nombre}`);
      console.log(`   Teléfono: ${data.telefono || "NO REGISTRADO"}`);
      console.log(`   No. Socio: ${data.noSocio || "-"}`);
      console.log(`   CURP: ${data.curp ? "✅" : "❌"}`);
      console.log("");
    } else {
      console.log(`❌ ${email} - NO ENCONTRADO`);
    }
  }
}

buscarVIPs().then(() => process.exit(0));

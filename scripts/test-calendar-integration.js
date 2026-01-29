#!/usr/bin/env node

/**
 * Script de Prueba: Google Calendar Integration
 * 
 * Este script crea una cita de prueba en Firestore para verificar que
 * la integración con Google Calendar funciona correctamente.
 * 
 * Uso: node scripts/test-calendar-integration.js
 */

const admin = require("firebase-admin");
const path = require("path");

// Inicializar Firebase Admin
const serviceAccountKey = require(path.join(__dirname, "../scripts/serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  databaseURL: "https://club-738-app.firebaseio.com"
});

const db = admin.firestore();

/**
 * Crear cita de prueba
 */
async function crearCitaPrueba() {
  console.log("🎬 Iniciando prueba de Google Calendar Integration...\n");
  
  const citaId = `test_${Date.now()}`;
  const ahora = new Date();
  const fechaTest = new Date(ahora);
  fechaTest.setDate(fechaTest.getDate() + 1); // Mañana
  
  const fechaFormato = fechaTest.toISOString().split('T')[0]; // YYYY-MM-DD
  const horaFormato = "14:30";
  
  const citaData = {
    socioEmail: "smunozam@gmail.com", // Tu email para testing
    socioNombre: "🧪 TEST Usuario",
    fecha: fechaFormato,
    hora: horaFormato,
    proposito: "peta",
    notas: "Cita de prueba para verificar Google Calendar Integration",
    estado: "pendiente",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  
  try {
    console.log("📝 Creando cita de prueba en Firestore...");
    console.log(`   ID: ${citaId}`);
    console.log(`   Email: ${citaData.socioEmail}`);
    console.log(`   Nombre: ${citaData.socioNombre}`);
    console.log(`   Fecha: ${citaData.fecha} ${citaData.hora}`);
    console.log(`   Propósito: ${citaData.proposito}\n`);
    
    // Guardar en Firestore
    await db.collection("citas").doc(citaId).set(citaData);
    
    console.log("✅ Cita creada exitosamente en Firestore!\n");
    console.log("📊 Evento ID que se asignará por Cloud Function:");
    console.log("   Espera 5-10 segundos y verifica que aparezca en:");
    console.log("   📅 https://calendar.google.com/calendar");
    console.log("   📮 Revisa email: smunozam@gmail.com\n");
    
    // Esperar a que Cloud Function procese
    console.log("⏳ Esperando 5 segundos para que Cloud Function procese...\n");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Leer documento actualizado
    const docSnapshot = await db.collection("citas").doc(citaId).get();
    const dataActualizado = docSnapshot.data();
    
    console.log("📋 Documento actualizado después de Cloud Function:");
    console.log(`   Estado: ${dataActualizado.estado}`);
    
    if (dataActualizado.calendarEventId) {
      console.log(`   ✅ calendarEventId: ${dataActualizado.calendarEventId}`);
      console.log(`   ✅ calendarEventLink: ${dataActualizado.calendarEventLink}\n`);
      console.log("🎉 ¡ÉXITO! El evento fue creado en Google Calendar.\n");
    } else if (dataActualizado.calendarError) {
      console.log(`   ❌ Error: ${dataActualizado.calendarError}\n`);
      console.log("⚠️  Hubo un error al crear el evento. Revisa:\n");
      console.log("   1. Logs en Firebase Console → Cloud Functions");
      console.log("   2. Que calendar_service_account.json está en /functions/");
      console.log("   3. Que el calendario está compartido con el service account\n");
    } else {
      console.log("⏳ Aún no procesado... Espera más tiempo y verifica los logs.\n");
    }
    
    console.log("📍 ID de la cita para referencia:");
    console.log(`   ${citaId}\n`);
    
    console.log("📍 Puedes buscar en Firestore:");
    console.log(`   citas → ${citaId}\n`);
    
  } catch (error) {
    console.error("❌ Error al crear cita de prueba:");
    console.error(error);
  } finally {
    process.exit(0);
  }
}

crearCitaPrueba();

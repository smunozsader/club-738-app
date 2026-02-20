/**
 * Script para listar y eliminar eventos del Google Calendar de Club 738
 */
import { google } from 'googleapis';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Service account credentials
const credentials = require('./calendar_service_account.json');

const CALENDAR_ID = 'smunozam@gmail.com';

// Autenticación con service account
const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/calendar']
);

const calendar = google.calendar({ version: 'v3', auth });

async function listarYEliminarEventos() {
  try {
    console.log('=== EVENTOS EN GOOGLE CALENDAR ===');
    console.log('Calendario:', CALENDAR_ID);
    console.log('');
    
    // Listar eventos de los últimos 30 días y próximos 90 días
    const ahora = new Date();
    const hace30Dias = new Date(ahora);
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    const en90Dias = new Date(ahora);
    en90Dias.setDate(en90Dias.getDate() + 90);
    
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: hace30Dias.toISOString(),
      timeMax: en90Dias.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 100
    });
    
    const eventos = response.data.items || [];
    
    // Filtrar eventos que parecen ser de Club 738 (contienen "Club 738" o "PETA" o "Cita")
    const eventosClub738 = eventos.filter(e => {
      const titulo = (e.summary || '').toLowerCase();
      const descripcion = (e.description || '').toLowerCase();
      return titulo.includes('club 738') || 
             titulo.includes('peta') || 
             titulo.includes('cita') ||
             titulo.includes('entrega') ||
             titulo.includes('recepción') ||
             descripcion.includes('club 738') ||
             descripcion.includes('peta');
    });
    
    if (eventosClub738.length === 0) {
      console.log('✅ No se encontraron eventos de Club 738 en el calendario');
      return;
    }
    
    console.log(`Encontrados ${eventosClub738.length} eventos de Club 738:\n`);
    
    eventosClub738.forEach((evento, idx) => {
      const inicio = evento.start?.dateTime || evento.start?.date;
      console.log(`${idx + 1}. ${evento.summary}`);
      console.log(`   ID: ${evento.id}`);
      console.log(`   Fecha: ${inicio}`);
      console.log(`   Estado: ${evento.status}`);
      console.log('');
    });
    
    // Si se pasa --delete, eliminar eventos
    if (process.argv.includes('--delete')) {
      console.log('\n🗑️  ELIMINANDO EVENTOS...\n');
      
      for (const evento of eventosClub738) {
        try {
          await calendar.events.delete({
            calendarId: CALENDAR_ID,
            eventId: evento.id
          });
          console.log(`  ✓ Eliminado: ${evento.summary} (${evento.id})`);
        } catch (err) {
          console.log(`  ✗ Error eliminando ${evento.id}: ${err.message}`);
        }
      }
      
      console.log('\n✅ Limpieza de calendario completada');
    } else {
      console.log('Para eliminar estos eventos, ejecuta: node limpiar_calendario.js --delete');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.code === 403) {
      console.log('\n⚠️  El service account no tiene acceso al calendario.');
      console.log('Asegúrate de que el calendario esté compartido con:', credentials.client_email);
    }
  }
}

listarYEliminarEventos().then(() => process.exit(0));

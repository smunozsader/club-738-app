#!/usr/bin/env node
/**
 * Reporte COMPLETO de Estatus de Pagos 2026
 * Considera tanto el array "pagos" como el campo "membresia2026"
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const sa = JSON.parse(readFileSync(new URL('./serviceAccountKey.json', import.meta.url)));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}

const db = admin.firestore();

function formatDate(timestamp) {
  if (!timestamp) return 'Sin fecha';
  const d = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function generarReporteCompleto() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('     📊 REPORTE DE ESTATUS DE PAGOS 2026 - CLUB 738');
  console.log('     📅 Fecha: ' + new Date().toLocaleDateString('es-MX', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  }));
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  try {
    const sociosSnap = await db.collection('socios').get();
    
    const pagados = [];
    const pendientes = [];
    let totalRecaudado = 0;

    sociosSnap.forEach(doc => {
      const data = doc.data();
      const socio = {
        email: doc.id,
        nombre: data.nombre || doc.id,
        pagos: data.pagos || [],
        membresia2026: data.membresia2026 || null,
        totalArmas: data.totalArmas || 0
      };

      // Buscar pagos de 2026 en el array pagos
      const pagos2026 = socio.pagos.filter(p => {
        if (!p.fecha) return false;
        const fecha = p.fecha._seconds ? new Date(p.fecha._seconds * 1000) : new Date(p.fecha);
        return fecha.getFullYear() === 2026;
      });

      if (pagos2026.length > 0) {
        const ultimoPago = pagos2026[pagos2026.length - 1];
        const total = ultimoPago.total || ultimoPago.conceptos?.reduce((s, c) => s + (c.monto || 0), 0) || 0;
        totalRecaudado += total;
        
        pagados.push({
          ...socio,
          ultimoPago: ultimoPago,
          totalPagado: total,
          fechaPago: ultimoPago.fecha
        });
      } else {
        pendientes.push(socio);
      }
    });

    // Ordenar
    pagados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    pendientes.sort((a, b) => a.nombre.localeCompare(b.nombre));

    const totalSocios = pagados.length + pendientes.length;
    const porcentajePagados = ((pagados.length / totalSocios) * 100).toFixed(1);

    // Resumen Ejecutivo
    console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
    console.log('║                           📈 RESUMEN EJECUTIVO                            ║');
    console.log('╠═══════════════════════════════════════════════════════════════════════════╣');
    console.log(`║   Total de socios:           ${String(totalSocios).padStart(3)}                                       ║`);
    console.log(`║   ✅ Socios al corriente:    ${String(pagados.length).padStart(3)} (${porcentajePagados}%)                                ║`);
    console.log(`║   ❌ Socios pendientes:      ${String(pendientes.length).padStart(3)} (${(100 - parseFloat(porcentajePagados)).toFixed(1)}%)                                ║`);
    console.log(`║   💰 Total recaudado:        $${totalRecaudado.toLocaleString('es-MX').padEnd(10)} MXN                       ║`);
    console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

    // Barra de progreso visual
    const barraLlena = Math.round(parseFloat(porcentajePagados) / 5);
    const barraVacia = 20 - barraLlena;
    console.log('🎯 PROGRESO DE COBRANZA 2026');
    console.log(`   [${'█'.repeat(barraLlena)}${'░'.repeat(barraVacia)}] ${porcentajePagados}%`);
    console.log(`   Meta: 77 socios | Cobrados: ${pagados.length} | Faltan: ${pendientes.length}\n`);

    // Detalle de pagados
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('✅ SOCIOS CON MEMBRESÍA 2026 PAGADA (' + pagados.length + ')');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('No. | Nombre                                | Fecha Pago   | Monto');
    console.log('────┼───────────────────────────────────────┼──────────────┼────────────');
    
    pagados.forEach((s, idx) => {
      const fecha = formatDate(s.fechaPago);
      const monto = `$${s.totalPagado.toLocaleString('es-MX')}`;
      console.log(`${String(idx + 1).padStart(2)}  │ ${s.nombre.padEnd(37).substring(0,37)} │ ${fecha.padEnd(12)} │ ${monto}`);
    });
    console.log('');

    // Detalle de pendientes
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('❌ SOCIOS CON PAGO PENDIENTE (' + pendientes.length + ')');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('No. | Nombre                                | Armas  | Email');
    console.log('────┼───────────────────────────────────────┼────────┼─────────────────────────');
    
    pendientes.forEach((s, idx) => {
      const armas = s.totalArmas > 0 ? String(s.totalArmas).padStart(2) : ' 0';
      console.log(`${String(idx + 1).padStart(2)}  │ ${s.nombre.padEnd(37).substring(0,37)} │   ${armas}   │ ${s.email.substring(0,25)}`);
    });
    console.log('');

    // Análisis financiero
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('💵 ANÁLISIS FINANCIERO');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    
    // Cuota completa: 6,000 + 350 = 6,350 (renovación) o 8,700 (nuevo)
    const metaRenovacion = totalSocios * 6350;
    const porcentajeRecaudacion = ((totalRecaudado / metaRenovacion) * 100).toFixed(1);
    
    console.log(`   Cuota renovación: $6,350 (Anualidad $6,000 + FEMETI $350)`);
    console.log(`   Cuota nuevo socio: $8,700 (Inscripción $2,000 + Anualidad $6,000 + FEMETI $700)`);
    console.log('');
    console.log(`   💰 Recaudado:     $${totalRecaudado.toLocaleString('es-MX')} MXN`);
    console.log(`   🎯 Meta (renov):  $${metaRenovacion.toLocaleString('es-MX')} MXN`);
    console.log(`   📊 % de meta:     ${porcentajeRecaudacion}%`);
    console.log(`   📉 Faltante:      $${(metaRenovacion - totalRecaudado).toLocaleString('es-MX')} MXN`);
    console.log('');

    // Lista de pendientes prioritarios (con más armas)
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('🔥 PRIORIDAD DE COBRO (socios con más armas = más activos)');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    
    const prioridad = [...pendientes]
      .filter(s => s.totalArmas > 0)
      .sort((a, b) => b.totalArmas - a.totalArmas)
      .slice(0, 15);
    
    prioridad.forEach((s, idx) => {
      console.log(`${String(idx + 1).padStart(2)}. ${s.nombre.padEnd(40)} │ ${s.totalArmas} armas`);
    });
    console.log('');

    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('📌 FIN DEL REPORTE');
    console.log('═══════════════════════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await admin.app().delete();
  }
}

generarReporteCompleto();

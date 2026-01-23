#!/usr/bin/env node

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const serviceAccountRaw = readFileSync(new URL('../serviceAccountKey.json', import.meta.url));
const serviceAccount = JSON.parse(serviceAccountRaw);

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Inicializar Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function generarReporteContable() {
  console.log('📊 Generando reporte contable...\n');

  try {
    const sociosSnapshot = await db.collection('socios').get();
    
    const datos = {
      socios: [],
      resumen: {
        totalSocios: 0,
        socios_pagados: 0,
        socios_pendientes: 0,
        socios_parciales: 0,
        inscripciones: { cantidad: 0, monto: 0 },
        anuales: { cantidad: 0, monto: 0 },
        femeti: { cantidad: 0, monto: 0 },
        pagos_totales: 0,
      }
    };

    // Procesar cada socio
    for (const socioDoc of sociosSnapshot.docs) {
      const email = socioDoc.id;
      const socioData = socioDoc.data();
      
      let estado = 'pendiente';
      let detallesPago = { inscripcion: 0, anualidad: 0, femeti: 0, total: 0 };
      let fechaPago = null;

      // Usar renovacion2026 si existe
      if (socioData.renovacion2026) {
        const pago = socioData.renovacion2026;
        estado = pago.estado || 'pendiente';
        
        // Extraer montos del desglose si existe
        if (pago.desglose) {
          detallesPago.inscripcion = pago.desglose.inscripcion || 0;
          detallesPago.anualidad = pago.desglose.cuota_anual || 0;
          detallesPago.femeti = pago.desglose.femeti || 0;
          detallesPago.total = pago.montoTotal || pago.monto || 0;
        } else if (pago.monto && pago.monto > 0) {
          // Fallback si no hay desglose detallado
          detallesPago.total = pago.monto;
          if (pago.cuotaClub) detallesPago.anualidad = pago.cuotaClub;
          if (pago.cuotaFemeti) detallesPago.femeti = pago.cuotaFemeti;
        }
        
        fechaPago = pago.fechaPago ? new Date(pago.fechaPago.toDate()).toLocaleDateString('es-MX') : null;
      }

      const nombreCompleto = `${socioData.nombre || ''}`.trim();
      const credencial = socioData.numeroCredencial || socioData.credencial || socioData.numero_socio || 'N/A';
      const telefono = socioData.telefono || '';

      // Agregar a datos
      datos.socios.push({
        credencial,
        nombre: nombreCompleto,
        email,
        telefono,
        estado,
        detallesPago,
        fechaPago,
      });

      // Actualizar resumen
      datos.resumen.totalSocios++;
      if (estado === 'pagado') {
        datos.resumen.socios_pagados++;
      } else if (estado === 'pendiente') {
        datos.resumen.socios_pendientes++;
      } else if (estado === 'parcial') {
        datos.resumen.socios_parciales++;
      }

      // Sumar montos solo si estado es pagado
      if (estado === 'pagado') {
        if (detallesPago.inscripcion > 0) {
          datos.resumen.inscripciones.cantidad++;
          datos.resumen.inscripciones.monto += detallesPago.inscripcion;
        }
        if (detallesPago.anualidad > 0) {
          datos.resumen.anuales.cantidad++;
          datos.resumen.anuales.monto += detallesPago.anualidad;
        }
        if (detallesPago.femeti > 0) {
          datos.resumen.femeti.cantidad++;
          datos.resumen.femeti.monto += detallesPago.femeti;
        }

        datos.resumen.pagos_totales += detallesPago.total;
      }
    }

    // Ordenar socios pagados por fecha de pago (más antiguos primero)
    const sociosPagadosOrdenados = datos.socios.filter(s => s.estado === 'pagado').sort((a, b) => {
      if (!a.fechaPago || !b.fechaPago) return 0;
      const fechaA = new Date(a.fechaPago.split('/').reverse().join('-'));
      const fechaB = new Date(b.fechaPago.split('/').reverse().join('-'));
      return fechaA - fechaB;
    });
    
    // Ordenar socios pendientes por credencial
    const sociosPendientesOrdenados = datos.socios.filter(s => s.estado === 'pendiente').sort((a, b) => {
      const aNum = parseInt(a.credencial) || 999999;
      const bNum = parseInt(b.credencial) || 999999;
      return aNum - bNum;
    });
    
    // Combinar: pagados por fecha, luego pendientes por credencial
    datos.socios = [...sociosPagadosOrdenados, ...sociosPendientesOrdenados];

    // Generar markdown
    const markdown = generarMarkdown(datos);

    // Guardar archivo markdown
    const outputDir = path.join(__dirname, '../../data/reportes-bimestrales/2026/02');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const outputPath = path.join(outputDir, `REPORTE_CONTABLE_${timestamp}.md`);
    fs.writeFileSync(outputPath, markdown);

    console.log('✅ Reporte contable generado en:');
    console.log(`📄 ${outputPath}\n`);

    // Mostrar resumen en consola
    console.log('📋 RESUMEN RÁPIDO:');
    console.log(`├─ Total Socios: ${datos.resumen.totalSocios}`);
    console.log(`├─ Pagados: ${datos.resumen.socios_pagados}`);
    console.log(`├─ Pendientes: ${datos.resumen.socios_pendientes}`);
    console.log(`├─ Parciales: ${datos.resumen.socios_parciales}`);
    console.log(`├─ Total Ingresos: $${datos.resumen.pagos_totales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`);
    console.log(`└─ Recaudación: ${((datos.resumen.socios_pagados / datos.resumen.totalSocios) * 100).toFixed(1)}%\n`);

  } catch (error) {
    console.error('❌ Error generando reporte:', error.message);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

function generarMarkdown(datos) {
  const fecha = new Date().toLocaleDateString('es-MX', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const porcentajePagados = ((datos.resumen.socios_pagados / datos.resumen.totalSocios) * 100).toFixed(1);

  let md = `# REPORTE CONTABLE CLUB 738
## Enero - Febrero 2026

**Fecha de Corte:** ${fecha}

---

## 📊 RESUMEN EJECUTIVO

| Concepto | Cantidad | % |
|----------|----------|---|
| **Total Socios** | ${datos.resumen.totalSocios} | 100% |
| **Socios Pagados** | ${datos.resumen.socios_pagados} | ${porcentajePagados}% |
| **Socios Pendientes** | ${datos.resumen.socios_pendientes} | ${((datos.resumen.socios_pendientes / datos.resumen.totalSocios) * 100).toFixed(1)}% |
| **Socios Parciales** | ${datos.resumen.socios_parciales} | ${((datos.resumen.socios_parciales / datos.resumen.totalSocios) * 100).toFixed(1)}% |

---

## 💰 INGRESOS DEL CLUB

### ✅ Cuotas de Inscripción
- **Cantidad de Pagos:** ${datos.resumen.inscripciones.cantidad}
- **Total Recaudado:** **$${datos.resumen.inscripciones.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}**

### ✅ Cuotas Anuales 2026
- **Cantidad de Pagos:** ${datos.resumen.anuales.cantidad}
- **Total Recaudado:** **$${datos.resumen.anuales.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}**

---

## 📊 INGRESOS NETOS PARA EL CLUB

| Concepto | Monto |
|----------|-------|
| Inscripciones | $${datos.resumen.inscripciones.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })} |
| Cuotas Anuales 2026 | $${datos.resumen.anuales.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })} |
| **INGRESO NETO CLUB** | **$${(datos.resumen.inscripciones.monto + datos.resumen.anuales.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}** |

---

## 🇲🇽 PAGO A FEDERACIÓN MEXICANA DE TIRO (FEMETI)

⚠️ **NOTA IMPORTANTE:** El pago de FEMETI es un pase-through. El club recauda, pero remite directamente a la Federación Mexicana de Tiro. No es ingreso neto del club.

### Pago FEMETI a Federación
- **Cantidad de Pagos:** ${datos.resumen.femeti.cantidad}
- **Total a Remitir:** **$${datos.resumen.femeti.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}**

---

## 📋 DETALLE DE SOCIOS PAGADOS

`;

  // Socios pagados
  const sociosPagados = datos.socios.filter(s => s.estado === 'pagado');
  if (sociosPagados.length > 0) {
    md += `### Socios con Pago Completo (${sociosPagados.length})\n\n`;
    md += `| Cred. | Socio | Inscripción | Anual 2026 | FEMETI | Total | Fecha |
|-------|-------|-------------|-----------|--------|-------|-------|
`;
    sociosPagados.forEach(s => {
      const inscripcion = s.detallesPago.inscripcion > 0 ? `$${s.detallesPago.inscripcion.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—';
      const anual = s.detallesPago.anualidad > 0 ? `$${s.detallesPago.anualidad.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—';
      const femeti = s.detallesPago.femeti > 0 ? `$${s.detallesPago.femeti.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—';
      const total = s.detallesPago.total > 0 ? `$${s.detallesPago.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—';
      md += `| ${s.credencial} | ${s.nombre} | ${inscripcion} | ${anual} | ${femeti} | **${total}** | ${s.fechaPago || '—'} |
`;
    });
    md += '\n';
  }

  // Socios parciales
  const sociosParciales = datos.socios.filter(s => s.estado === 'parcial');
  if (sociosParciales.length > 0) {
    md += `### Socios con Pago Parcial (${sociosParciales.length})\n\n`;
    md += `| Cred. | Socio | Inscripción | Anual 2026 | FEMETI | Total | Fecha |
|-------|-------|-------------|-----------|--------|-------|-------|
`;
    sociosParciales.forEach(s => {
      const inscripcion = s.detallesPago.inscripcion > 0 ? `$${s.detallesPago.inscripcion.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—';
      const anual = s.detallesPago.anualidad > 0 ? `$${s.detallesPago.anualidad.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—';
      const femeti = s.detallesPago.femeti > 0 ? `$${s.detallesPago.femeti.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—';
      const total = s.detallesPago.total > 0 ? `$${s.detallesPago.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '—';
      md += `| ${s.credencial} | ${s.nombre} | ${inscripcion} | ${anual} | ${femeti} | **${total}** | ${s.fechaPago || '—'} |
`;
    });
    md += '\n';
  }



  md += `---

## 📝 NOTAS

- **Socios Pagados:** Membresía 2026 completamente pagada
- **Socios Parciales:** Membresía 2026 con pagos pendientes
- **Socios Pendientes:** Sin registro de pago en 2026
- **Cuota Inscripción:** $2,000 MXN (miembros nuevos)
- **Cuota Anual 2026:** $6,000 MXN
- **FEMETI Nuevos:** $700 MXN | **FEMETI Renovación:** $350 MXN

---

*Reporte generado automáticamente - Club 738*
*Dirección para consultas: admin@club738.com*
`;

  return md;
}

generarReporteContable();

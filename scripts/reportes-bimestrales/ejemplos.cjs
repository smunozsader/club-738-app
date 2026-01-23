#!/usr/bin/env node

/**
 * ejemplos.js
 * Ejemplos de uso de los generadores de reportes
 */

const fs = require('fs');
const path = require('path');

const ejemplos = `
📊 EJEMPLOS DE USO - Generador de Reportes Bimestrales
${'='.repeat(60)}

🔹 GENERAR RELACIÓN (Febrero 2026)
   node generar-reportes.js --mes 2 --año 2026 --tipo relacion
   
   Salida: data/reportes-bimestrales/2026/02/RELACION_2026_02.xlsx

🔹 GENERAR ANEXO A (Abril 2026)
   node generar-reportes.js --mes 4 --año 2026 --tipo anexoA
   
   Salida: data/reportes-bimestrales/2026/04/ANEXO_A_2026_04.xlsx

🔹 GENERAR TODOS LOS REPORTES DE UN BIMESTRE
   node generar-reportes.js --mes 6 --año 2026 --tipo todos
   
   Salida (4 archivos):
   - RELACION_2026_06.xlsx
   - ANEXO_A_2026_06.xlsx
   - ANEXO_B_2026_06.xlsx
   - ANEXO_C_2026_06.xlsx

🔹 GENERAR COMO PDF (experimental)
   node generar-reportes.js --mes 2 --año 2026 --tipo relacion --formato pdf
   
   Salida: RELACION_2026_02.pdf

${'='.repeat(60)}

📅 CALENDARIO DE REPORTES BIMESTRALES (Fechas límite SEDENA)

   Período                Mes Final    Fecha Límite
   ─────────────────────────────────────────────────
   Enero-Febrero              2        28 de Febrero
   Marzo-Abril                4        30 de Abril
   Mayo-Junio                 6        30 de Junio
   Julio-Agosto               8        31 de Agosto
   Septiembre-Octubre        10        31 de Octubre
   Noviembre-Diciembre       12        31 de Diciembre

${'='.repeat(60)}

📋 CONTENIDO DE CADA REPORTE

✅ RELACIÓN
   - Una fila por arma
   - Columnas: Socio, Nombre, Clase, Calibre, Marca, Modelo, Matrícula, Folio
   - Uso: Inventario detallado

✅ ANEXO A (Resumen por Socio)
   - Una fila por socio
   - Columnas: Nombre, Total Armas, Rifles, Escopetas, Pistolas, Modalidad
   - Uso: Análisis por miembro

✅ ANEXO B (Cédula de Totales)
   - Resumen con fórmulas
   - Totales por tipo de arma
   - Totales por modalidad
   - Uso: Validación de integridad

✅ ANEXO C (Información del Club)
   - Datos del club (RFC, dirección, directiva)
   - Totales de socios y armas
   - Estadísticas por tipo
   - Uso: Datos institucionales

${'='.repeat(60)}

🔧 INSTALACIÓN RÁPIDA

1. Navegar a la carpeta:
   cd /Applications/club-738-web

2. Instalar dependencias (si no están):
   npm install xlsx pdfkit

3. Ejecutar un ejemplo:
   node scripts/reportes-bimestrales/generar-reportes.js --mes 2 --año 2026 --tipo relacion

4. Revisar los archivos generados:
   open data/reportes-bimestrales/2026/02/

${'='.repeat(60)}

⚠️ NOTAS IMPORTANTES

• Los reportes se generan en EXCEL (.xlsx) por defecto
• Los archivos se guardan en: data/reportes-bimestrales/{año}/{mes}/
• Los emails en Firestore se normalizan a minúsculas
• Se valida Art. 50 SEDENA en calibres
• Ejecutar desde: /Applications/club-738-web

${'='.repeat(60)}

❓ SOLUCIÓN DE PROBLEMAS

❌ Error: "Cannot find module 'firebase-admin'"
   ✅ Asegúrate de estar en /Applications/club-738-web
   ✅ Ejecuta: npm install firebase-admin

❌ Error: "serviceAccountKey.json not found"
   ✅ Debe estar en scripts/serviceAccountKey.json
   ✅ No subir a GitHub (está en .gitignore)

❌ Error: "No hay socios registrados"
   ✅ Verifica que haya datos en Firestore
   ✅ Conectar a la base de datos correcta

${'='.repeat(60)}
`;

console.log(ejemplos);

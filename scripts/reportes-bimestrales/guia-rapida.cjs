#!/usr/bin/env node

/**
 * GUÍA RÁPIDA - Generador de Reportes Bimestrales
 * Ejecutar: node scripts/reportes-bimestrales/ejemplos.js
 */

const mensaje = `

╔═══════════════════════════════════════════════════════════════════╗
║                    📊 GENERADOR DE REPORTES BIMESTRALES SEDENA    ║
║                                                                   ║
║  Reemplaza al módulo "Generador de Oficios" de la web app       ║
║  Genera Excel y PDF desde VS Code (Node.js)                     ║
╚═══════════════════════════════════════════════════════════════════╝

🚀 INICIO RÁPIDO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. PRIMER PASO - Probar instalación:
   
   cd /Applications/club-738-web
   node scripts/reportes-bimestrales/test-generador.js

2. SI PASA LA PRUEBA - Generar RELACIÓN de Febrero 2026:

   node scripts/reportes-bimestrales/generar-reportes.js \\
     --mes 2 --año 2026 --tipo relacion

3. REVISAR RESULTADO:

   open data/reportes-bimestrales/2026/02/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 TIPOS DE REPORTES DISPONIBLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ RELACIÓN
   └─ Detalle por arma (una fila = una arma)
   └─ Columnas: Socio, Nombre, Clase, Calibre, Marca, Modelo, Matrícula
   └─ Archivo: RELACION_2026_02.xlsx

✅ ANEXO A
   └─ Resumen por socio (una fila = un socio)
   └─ Incluye conteos: Rifles, Escopetas, Pistolas, Revólveres
   └─ Archivo: ANEXO_A_2026_02.xlsx

✅ ANEXO B
   └─ Cédula de totales (resumen consolidado)
   └─ Totales por tipo de arma y modalidad
   └─ Archivo: ANEXO_B_2026_02.xlsx

✅ ANEXO C
   └─ Información del club (datos institucionales)
   └─ Directiva, domicilio, RFC
   └─ Archivo: ANEXO_C_2026_02.xlsx

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 COMANDOS PRINCIPALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Generar UN tipo de reporte
node scripts/reportes-bimestrales/generar-reportes.js \\
  --mes 2 --año 2026 --tipo relacion

# Generar TODOS los reportes de un bimestre
node scripts/reportes-bimestrales/generar-reportes.js \\
  --mes 2 --año 2026 --tipo todos

# Generar ANEXO A
node scripts/reportes-bimestrales/generar-reportes.js \\
  --mes 2 --año 2026 --tipo anexoA

# Generar como PDF (experimental)
node scripts/reportes-bimestrales/generar-reportes.js \\
  --mes 2 --año 2026 --tipo relacion --formato pdf

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📅 CALENDARIO DE REPORTES BIMESTRALES (Fechas SEDENA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bimestre              Mes    Fecha Límite    Comando
───────────────────────────────────────────────────────────────
Enero-Febrero          2      28 Febrero    --mes 2
Marzo-Abril            4      30 Abril      --mes 4
Mayo-Junio             6      30 Junio      --mes 6
Julio-Agosto           8      31 Agosto     --mes 8
Septiembre-Octubre    10      31 Octubre    --mes 10
Noviembre-Diciembre   12      31 Diciembre  --mes 12

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 ESTRUCTURA DE ARCHIVOS GENERADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

data/reportes-bimestrales/
└── 2026/
    ├── 02/  (Febrero)
    │   ├── RELACION_2026_02.xlsx
    │   ├── ANEXO_A_2026_02.xlsx
    │   ├── ANEXO_B_2026_02.xlsx
    │   └── ANEXO_C_2026_02.xlsx
    ├── 04/  (Abril)
    ├── 06/  (Junio)
    └── ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚙️ DETALLES TÉCNICOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Firebase Admin SDK
   └─ Lee directamente de Firestore
   └─ Requiere: scripts/serviceAccountKey.json

✅ XLSX (Excel)
   └─ Genera archivos .xlsx optimizados
   └─ Soporte para hojas múltiples

✅ Validación Art. 50 SEDENA
   └─ Verifica calibres permitidos
   └─ Calibres permitidos: .22 LR, 9mm, .38 SPL, .357, .223

✅ Normalización de datos
   └─ Emails convertidos a minúsculas
   └─ Fechas en formato local español

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ SOLUCIÓN DE PROBLEMAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problema: "Cannot find module 'firebase-admin'"
Solución:
  npm install firebase-admin
  npm install xlsx

Problema: "Error: no serviceAccountKey.json"
Solución:
  - Verificar que exista: scripts/serviceAccountKey.json
  - Archivo NO debe subirse a GitHub (.gitignore)
  - Obtenlo de Firebase Console → Project Settings → Service Account

Problema: "No hay socios registrados"
Solución:
  - Verificar que Firestore tenga datos
  - Ejecutar script desde la rama correcta
  - Conectar a la base de datos PRODUCCIÓN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 CASOS DE USO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📌 Generar reportes antes de entregar a SEDENA:
   node scripts/reportes-bimestrales/generar-reportes.js \\
     --mes 2 --año 2026 --tipo todos

📌 Auditar armas de un bimestre:
   node scripts/reportes-bimestrales/generar-reportes.js \\
     --mes 2 --año 2026 --tipo relacion

📌 Verificar integridad de datos:
   node scripts/reportes-bimestrales/generar-reportes.js \\
     --mes 2 --año 2026 --tipo anexoB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 ARCHIVOS PRINCIPALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

scripts/reportes-bimestrales/
├── generar-reportes.js          ← Script principal
├── generadores/
│   ├── relacion.js              ← RELACIÓN (detalle por arma)
│   ├── anexoA.js                ← ANEXO A (resumen socio)
│   ├── anexoB.js                ← ANEXO B (cédula totales)
│   └── anexoC.js                ← ANEXO C (info club)
├── utils/
│   ├── validaciones.js          ← Validación Art. 50
│   └── pdf-generator.js         ← PDF utilities
├── test-generador.js            ← Prueba de instalación
├── ejemplos.js                  ← Ejemplos detallados
└── README.md                    ← Documentación

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 SOPORTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ver ejemplos:
  node scripts/reportes-bimestrales/ejemplos.js

Ver esta guía:
  node scripts/reportes-bimestrales/guia-rapida.js

Tests:
  node scripts/reportes-bimestrales/test-generador.js

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Listo para generar reportes bimestrales desde VS Code

`;

console.log(mensaje);

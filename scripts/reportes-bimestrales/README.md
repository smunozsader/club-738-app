# Generador de Reportes Bimestrales SEDENA

## Descripción
Scripts para generar reportes bimestrales en Excel y PDF desde VS Code, sin usar la web app.

## Estructura
```
reportes-bimestrales/
├── generar-reportes.js       # Script principal
├── generadores/
│   ├── relacion.js          # RELACIÓN (detalle por arma)
│   ├── anexoA.js            # ANEXO A (resumen por socio)
│   ├── anexoB.js            # ANEXO B (cédula de totales)
│   └── anexoC.js            # ANEXO C (info club + totales)
└── utils/
    ├── firebaseInit.js      # Inicializar Firebase Admin
    ├── validaciones.js      # Validaciones de datos
    └── pdf-generator.js     # Generación de PDFs
```

## Uso

### 1. Generar un reporte específico
```bash
node generar-reportes.js --mes 2 --año 2026 --tipo relacion
# Genera: RELACIÓN - Febrero 2026
```

### 2. Generar todos los reportes de un bimestre
```bash
node generar-reportes.js --mes 2 --año 2026 --tipo todos
# Genera: RELACIÓN, ANEXO A, B, C - Febrero 2026
```

### 3. Generar como PDF
```bash
node generar-reportes.js --mes 2 --año 2026 --tipo relacion --formato pdf
```

## Reportes Bimestrales (SEDENA Art. 50)

### Calendario
- **Febrero 28**: Enero-Febrero
- **Abril 30**: Marzo-Abril
- **Junio 30**: Mayo-Junio
- **Agosto 31**: Julio-Agosto
- **Octubre 31**: Septiembre-Octubre
- **Diciembre 31**: Noviembre-Diciembre

### Contenido de Reportes

#### 📋 RELACIÓN
- **Formato**: Excel con una fila por arma
- **Columnas**: Socio, Nombre, Clase, Calibre, Marca, Modelo, Matrícula, Folio RFA
- **Validación**: Art. 50 SEDENA (.22 LR, 9mm, etc.)

#### 📊 ANEXO A
- **Formato**: Excel con resumen por socio
- **Datos**: Socio, Nombre, # Armas, Modalidad (Caza/Tiro/Ambas)

#### 📈 ANEXO B
- **Formato**: Excel con cédula de totales
- **Fórmulas**: Total Socios, Total Armas, Total por Tipo, Total por Calibre

#### 🏢 ANEXO C
- **Formato**: Excel con info del club
- **Datos**: Nombre club, RFC, Domicilio, Presidente, Secretario, Total Socios, Total Armas

## Notas Importantes

1. **Normalización de Emails**: Todos los emails se convierten a minúsculas en Firestore
2. **Validación de Calibres**: Se valida Art. 50 SEDENA durante generación
3. **Rutas de Almacenamiento**: Los archivos se guardan en `/data/reportes-bimestrales/{año}/{mes}/`
4. **Backup Automático**: Se guarda copia en Google Drive (si está configurado)

## Instalación de Dependencias

```bash
cd /Applications/club-738-web
npm install xlsx jspdf
```

Las siguientes ya están en package.json:
- `firebase-admin` (para acceso a Firestore desde Node)
- `dotenv` (para variables de entorno)

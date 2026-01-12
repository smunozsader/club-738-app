# Formato Actual del Oficio PETA (Generado por GeneradorPETA.jsx)

## ESTRUCTURA DEL PDF

```
================================================================================
                    SECRETARIA DE LA DEFENSA NACIONAL
   DIRECCIÓN GENERAL DEL REGISTRO FEDERAL DE ARMAS DE FUEGO Y CONTROL DE EXPLOSIVOS.
     SOLICITUD DE PERMISO EXTRAORDINARIO PARA LA PRÁCTICA DE CAZA, TIRO Y/O COMPETENCIA.
================================================================================

DATOS DEL CLUB.

NOMBRE DEL CLUB: CLUB DE CAZA, TIRO Y PESCA DE YUCATÁN, A.C.
                                                    No.REG.ANTE S.D.N.: 738

--------------------------------------------------------------------------------

DATOS DEL SOLICITANTE.

N.P.S.: [Campo manual]             No.P. E.T.A. ANTERIOR: [Si es renovación]
                                                    (ÚNICAMENTE PARA RENOVACIONES)

NOMBRE: [NOMBRE DEL SOCIO EN MAYÚSCULAS]

CALLE: [Calle]                                    COLONIA: [Colonia]

C.P.: [97000]                  CIUDAD Y ESTADO: [MÉRIDA, YUCATÁN]

--------------------------------------------------------------------------------

TIPO DE ACTIVIDAD.

CAZA(    )          TIRO( X )          COMPETENCIA NACIONAL(    )

--------------------------------------------------------------------------------

PERIODO (MÍNIMO A PARTIR DE 15 DÍAS DE LA FECHA DE LA SOLICITUD):

01ENE2026  AL  31DIC2026
         DIA  MES  AÑO        DIA  MES  AÑO

--------------------------------------------------------------------------------

DATOS DE LAS ARMAS QUE EMPLEARÁ

ORD  CLASE                CALIBRE    MARCA              MATRÍCULA         CARTUCHOS
================================================================================
1    PISTOLA               .22 LR     RUGER              ABC123            200
2    ESCOPETA              12 GA      REMINGTON          XYZ789            200
3    RIFLE                 .308 WIN   WINCHESTER         DEF456            200
4    
5    
6    
7    
8    
9    
10   

--------------------------------------------------------------------------------

[DESTINO - Varía según tipo de PETA]

TIRO:
  PARA EL CAMPO DE TIRO DEL CLUB DE CAZA TIRO Y PESCA DE YUCATÁN AC, 
  SITO EN EL KM 7.5 DE LA CARRETERA FEDERAL 281, TRAMO HUNUCMÁ - SISAL, 
  MUNICIPIO HUNUCMÁ, YUCATÁN.

COMPETENCIA:
  POR SER DE PETA DE COMPETENCIA NACIONAL SE SOLICITAN LOS SIGUIENTES ESTADOS (MÁXIMO 10)
  Yucatán
  Quintana Roo
  Campeche
  ...

CAZA:
  SI LA ACTIVIDAD ES DE CACERÍA ESPECIFIQUE LOS ESTADOS DONDE LA PRACTICARÁ (MÁXIMO 10)
  Yucatán
  Campeche
  ...

--------------------------------------------------------------------------------

LUGAR Y FECHA DE LA SOLICITUD      Mérida, Yucatán a [DÍA] de [MES] de [AÑO]




ATENTAMENTE.
SUFRAGIO EFECTIVO, NO REELECCIÓN




LIC. RICARDO J. FERNÁNDEZ Y GASQUE
PRESIDENTE DEL CLUB.

================================================================================
```

## CAMPOS EDITABLES EN EL FORMULARIO

### 1. Selección de Socio
- Búsqueda por nombre/email/número
- Datos prellenados: nombre, domicilio (desde Firestore)

### 2. Tipo de PETA
- ☐ Tiro (solo campo del club)
- ☐ Competencia Nacional (hasta 10 estados)
- ☐ Caza (hasta 10 estados)

### 3. Datos Administrativos
- **N.P.S.** (Número de Parte de Seguridad) - manual
- **PETA Anterior** - solo si es renovación
- **☐ Es renovación** (checkbox)

### 4. Domicilio del Solicitante (6 campos)
- Calle
- Colonia
- Ciudad
- C.P.
- Municipio
- Estado

### 5. Periodo de Vigencia
- **Fecha Inicio** (mínimo 15 días después de hoy)
- **Fecha Fin** (máximo 1 año)

### 6. Armas (máximo 10)
- Selección de armas registradas del socio
- Clase, Calibre, Marca, Matrícula (auto-llenado desde Firestore)
- Cantidad de cartuchos por arma (editable, default: 200)

### 7. Estados Destino (solo Competencia/Caza)
- Checkboxes de 32 estados
- Máximo 10 seleccionados
- Para Tiro: campo fijo del club

## ARCHIVO DE SALIDA

Nombre: `PETA_[TIPO]_[NOMBRE_SOCIO]_2026.pdf`

Ejemplos:
- `PETA_TIRO_LUIS_FERNANDO_GARRIDO_2026.pdf`
- `PETA_COMPETENCIA_SANTIAGO_QUINTAL_2026.pdf`
- `PETA_CAZA_JOSE_MANUEL_LOPEZ_2026.pdf`

## FORMATO DE FECHAS

- **Periodo**: `01ENE2026` (DíaMesAño compacto)
- **Fecha solicitud**: `10 de ENERO de 2026` (formato largo)

## DATOS FIJOS DEL CLUB

- **Nombre Oficial**: Club de Caza, Tiro y Pesca de Yucatán, A.C.
- **Registro SEDENA**: 738
- **Presidente**: Lic. Ricardo J. Fernández y Gasque
- **Campo de Tiro**: Km 7.5 Carretera Federal 281, Hunucmá-Sisal, Yucatán

## VALIDACIONES

✅ Socio seleccionado
✅ Al menos 1 arma (máximo 10)
✅ Fechas de inicio y fin válidas
✅ Al menos 1 estado si es Competencia/Caza
✅ Fecha inicio mínimo 15 días después de solicitud

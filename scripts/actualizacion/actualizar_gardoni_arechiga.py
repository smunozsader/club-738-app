#!/usr/bin/env python3
"""
Actualizar Base de Verdad - Correcciones Gardoni y Arechiga
17 Enero 2026

CAMBIOS A APLICAR:
1. JOAQUIN GARDONI - Agregar Shadow 2 DP25087 faltante
2. MARIA FERNANDA ARECHIGA - Agregar CZ P07 C647155 y Grand Power LP380 K078999
3. MARIA FERNANDA ARECHIGA - REASIGNAR Grand Power LP380 K084328 de Gardoni a Arechiga
"""

import pandas as pd
import shutil
from datetime import datetime

# Archivo maestro
archivo_maestro = 'data/socios/Copy of 2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx'

print("=" * 80)
print("ACTUALIZACIÓN GARDONI Y ARECHIGA - 17 Enero 2026")
print("=" * 80)

# Cargar Excel
df = pd.read_excel(archivo_maestro)
print(f"\n📊 Total registros ANTES: {len(df)}")

# BACKUP AUTOMÁTICO
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup_file = archivo_maestro.replace('.xlsx', f'_backup_{timestamp}.xlsx')
shutil.copy(archivo_maestro, backup_file)
print(f"✓ Backup creado: {backup_file}")

print("\n" + "=" * 80)
print("1️⃣  JOAQUIN GARDONI - Agregar Shadow 2 DP25087")
print("=" * 80)

# Buscar datos de Gardoni
gardoni_rows = df[df['EMAIL'] == 'jrgardoni@gmail.com']
if not gardoni_rows.empty:
    # Tomar la primera fila para obtener datos del socio
    gardoni_base = gardoni_rows.iloc[0]
    
    # Verificar si DP25087 ya existe
    dp25087_existe = df[df['MATRÍCULA'] == 'DP25087']
    
    if dp25087_existe.empty:
        print(f"📝 Agregando Shadow 2 DP25087 a {gardoni_base['NOMBRE DEL SOCIO']}")
        
        nueva_arma_gardoni = {
            'No. REGISTRO DEL CLUB': gardoni_base.get('No. REGISTRO DEL CLUB', ''),
            'DOMICILIO DEL CLUB': gardoni_base.get('DOMICILIO DEL CLUB', ''),
            'No. CREDENCIAL': gardoni_base['No. CREDENCIAL'],
            'NOMBRE DEL SOCIO': gardoni_base['NOMBRE DEL SOCIO'],
            'CURP': gardoni_base['CURP'],
            'No. CONSEC. DE SOCIO': gardoni_base.get('No. CONSEC. DE SOCIO', ''),
            'CALLE': gardoni_base.get('CALLE', ''),
            'COLONIA': gardoni_base.get('COLONIA', ''),
            'CIUDAD': gardoni_base.get('CIUDAD', ''),
            'MUNICIPIO': gardoni_base.get('MUNICIPIO', ''),
            'ESTADO': gardoni_base.get('ESTADO', ''),
            'CODIGO POSTAL': gardoni_base.get('CODIGO POSTAL', ''),
            'TELEFONO': gardoni_base.get('TELEFONO', ''),
            'EMAIL': 'jrgardoni@gmail.com',
            'CLASE': 'PISTOLA',
            'CALIBRE': '.380"',
            'MARCA': 'CESKA ZBROJOVKA',
            'MODELO': 'CZ SHADOW 2',
            'MATRÍCULA': 'DP25087',
            'FOLIO': gardoni_base.get('FOLIO', ''),
            'ARMAS CORTAS': gardoni_base.get('ARMAS CORTAS', ''),
            'ARMAS LARGAS': gardoni_base.get('ARMAS LARGAS', ''),
            'fecha_de ingreso': gardoni_base.get('fecha_de ingreso', '')
        }
        
        # Agregar la nueva fila
        df = pd.concat([df, pd.DataFrame([nueva_arma_gardoni])], ignore_index=True)
        print("✅ Shadow 2 DP25087 agregada a GARDONI")
    else:
        print("⚠️  Shadow 2 DP25087 ya existe en el Excel")
else:
    print("❌ No se encontró email de Gardoni")

print("\n" + "=" * 80)
print("2️⃣  MARIA FERNANDA ARECHIGA - Agregar armas faltantes")
print("=" * 80)

# Buscar datos de Arechiga
arechiga_rows = df[df['EMAIL'] == 'arechiga@jogarplastics.com']
if not arechiga_rows.empty:
    arechiga_base = arechiga_rows.iloc[0]
    print(f"📝 Socio: {arechiga_base['NOMBRE DEL SOCIO']}")
    print(f"📧 Email: {arechiga_base['EMAIL']}")
    print(f"📞 Tel: {arechiga_base.get('TELEFONO', 'N/A')}")
    
    # Arma 1: CZ P07 C647155
    c647155_existe = df[df['MATRÍCULA'] == 'C647155']
    if c647155_existe.empty:
        print("\n➕ Agregando: Pistola CZ P07 C647155")
        nueva_arma_1 = {
            'No. REGISTRO DEL CLUB': arechiga_base.get('No. REGISTRO DEL CLUB', ''),
            'DOMICILIO DEL CLUB': arechiga_base.get('DOMICILIO DEL CLUB', ''),
            'No. CREDENCIAL': arechiga_base['No. CREDENCIAL'],
            'NOMBRE DEL SOCIO': arechiga_base['NOMBRE DEL SOCIO'],
            'CURP': arechiga_base['CURP'],
            'No. CONSEC. DE SOCIO': arechiga_base.get('No. CONSEC. DE SOCIO', ''),
            'CALLE': arechiga_base.get('CALLE', ''),
            'COLONIA': arechiga_base.get('COLONIA', ''),
            'CIUDAD': arechiga_base.get('CIUDAD', ''),
            'MUNICIPIO': arechiga_base.get('MUNICIPIO', ''),
            'ESTADO': arechiga_base.get('ESTADO', ''),
            'CODIGO POSTAL': arechiga_base.get('CODIGO POSTAL', ''),
            'TELEFONO': arechiga_base.get('TELEFONO', ''),
            'EMAIL': 'arechiga@jogarplastics.com',
            'CLASE': 'PISTOLA',
            'CALIBRE': '.380"',
            'MARCA': 'CESKA ZBROJOVKA',
            'MODELO': 'CZ P07',
            'MATRÍCULA': 'C647155',
            'FOLIO': '',  # PENDIENTE - usuario lo dará después
            'ARMAS CORTAS': arechiga_base.get('ARMAS CORTAS', ''),
            'ARMAS LARGAS': arechiga_base.get('ARMAS LARGAS', ''),
            'fecha_de ingreso': arechiga_base.get('fecha_de ingreso', '')
        }
            'EMAIL': 'arechiga@jogarplastics.com',
            'CLASE': 'PISTOLA',
            'CALIBRE': '.380" AUTO',
            'MARCA': 'GRAND POWER',
            'MODELO': 'LP380',
            'MATRÍCULA': 'K078999',
            'FOLIO': arechiga_base.get('FOLIO', ''),
            'ARMAS CORTAS': arechiga_base.get('ARMAS CORTAS', ''),
            'ARMAS LARGAS': arechiga_base.get('ARMAS LARGAS', ''),
            'fecha_de ingreso': arechiga_base.get('fecha_de ingresoNo. CREDENCIAL'],
            'NOMBRE DEL SOCIO': arechiga_base['NOMBRE DEL SOCIO'],
            'CURP': arechiga_base['CURP'],
            'No. CONSEC.': arechiga_base['No. CONSEC.'],
            'EMAIL': 'arechiga@jogarplastics.com',
            'TELEFONO': arechiga_base.get('TELEFONO', ''),
            'CLASE': 'PISTOLA',
            'CALIBRE': '.380" AUTO',
            'MARCA': 'GRAND POWER',
            'MODELO': 'LP380',
            'MATRÍCULA': 'K078999',
            'FOLIO': arechiga_base.get('FOLIO', '')
        }
        df = pd.concat([df, pd.DataFrame([nueva_arma_2])], ignore_index=True)
        print("✅ Grand Power LP380 K078999 agregada")
    else:
        print("⚠️  K078999 ya existe - verificando propietario...")
        propietario_actual = k078999_existe.iloc[0]['EMAIL']
        print(f"   Propietario actual: {propietario_actual}")

else:
    print("❌ No se encontró email de Arechiga")

print("\n" + "=" * 80)
print("3️⃣  REASIGNAR K084328 de Gardoni a Arechiga")
print("=" * 80)

# Buscar K084328
k084328_rows = df[df['MATRÍCULA'] == 'K084328']
if not k084328_rows.empty:
    propietario_actual = k084328_rows.iloc[0]['EMAIL']
    print(f"📍 K084328 encontrada") DE SOCIO'] = arechiga_base.get('No. CONSEC. DE SOCIO', '')
        df.loc[df['MATRÍCULA'] == 'K084328', 'TELEFONO'] = arechiga_base.get('TELEFONO', '')
        df.loc[df['MATRÍCULA'] == 'K084328', 'CALLE'] = arechiga_base.get('CALLE', '')
        df.loc[df['MATRÍCULA'] == 'K084328', 'COLONIA'] = arechiga_base.get('COLONIA', '')
        df.loc[df['MATRÍCULA'] == 'K084328', 'CIUDAD'] = arechiga_base.get('CIUDAD', '')
        df.loc[df['MATRÍCULA'] == 'K084328', 'MUNICIPIO'] = arechiga_base.get('MUNICIPIO', '')
        df.loc[df['MATRÍCULA'] == 'K084328', 'ESTADO'] = arechiga_base.get('ESTADO', '')
        df.loc[df['MATRÍCULA'] == 'K084328', 'CODIGO POSTAL'] = arechiga_base.get('CODIGO POSTAL
    
    if propietario_actual == 'jrgardoni@gmail.com':
        print("🔄 REASIGNANDO de Gardoni a Arechiga...")
        
        # Actualizar el email y datos del socio
        df.loc[df['MATRÍCULA'] == 'K084328', 'EMAIL'] = 'arechiga@jogarplastics.com'
        df.loc[df['MATRÍCULA'] == 'K084328', 'NOMBRE DEL SOCIO'] = arechiga_base['NOMBRE DEL SOCIO']
        df.loc[df['MATRÍCULA'] == 'K084328', 'CURP'] = arechiga_base['CURP']
        df.loc[df['MATRÍCULA'] == 'K084328', 'No. CREDENCIAL'] = arechiga_base['No. CREDENCIAL']
        df.loc[df['MATRÍCULA'] == 'K084328', 'No. CONSEC.'] = arechiga_base['No. CONSEC.']
        df.loc[df['MATRÍCULA'] == 'K084328', 'TELEFONO'] = arechiga_base.get('TELEFONO', '')
        
        print("✅ K084328 reasignada exitosamente a ARECHIGA")
    elif propietario_actual == 'arechiga@jogarplastics.com':
        print("✅ K084328 ya está asignada a ARECHIGA (correcto)")
    else:
        print(f"⚠️  ADVERTENCIA: K084328 pertenece a {propietario_actual}")
else:
    print("❌ K084328 NO encontrada en el Excel")

# GUARDAR CAMBIOS
print("\n" + "=" * 80)
print("💾 GUARDANDO CAMBIOS")
print("=" * 80)

df.to_excel(archivo_maestro, index=False)
print(f"✅ Archivo maestro actualizado: {archivo_maestro}")
print(f"📊 Total registros DESPUÉS: {len(df)}")

# VERIFICACIÓN FINAL
print("\n" + "=" * 80)
print("🔍 VERIFICACIÓN FINAL")
print("=" * 80)

print("\n✅ JOAQUIN GARDONI (jrgardoni@gmail.com):")
gardoni_final = df[df['EMAIL'] == 'jrgardoni@gmail.com']
print(f"   Total armas: {len(gardoni_final)}")
for idx, arma in gardoni_final.iterrows():
    print(f"   • {arma['CLASE']:20} {arma.get('CALIBRE', 'N/A'):12} {arma['MARCA']:20} MAT: {arma['MATRÍCULA']}")

print("\n✅ MARIA FERNANDA ARECHIGA (arechiga@jogarplastics.com):")
arechiga_final = df[df['EMAIL'] == 'arechiga@jogarplastics.com']
print(f"   Total armas: {len(arechiga_final)}")
for idx, arma in arechiga_final.iterrows():
    print(f"   • {arma['CLASE']:20} {arma.get('CALIBRE', 'N/A'):12} {arma['MARCA']:20} MAT: {arma['MATRÍCULA']}")

print("\n" + "=" * 80)
print("✅ ACTUALIZACIÓN COMPLETADA")
print("=" * 80)
print(f"📦 Backup: {backup_file}")
print(f"📄 Archivo maestro: {archivo_maestro}")
print(f"📊 Registros totales: {len(df)}")
print("=" * 80)

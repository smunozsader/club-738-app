#!/usr/bin/env python3
"""
Reasignar K078999 de Gardoni a Arechiga en Excel
17 Enero 2026
"""

import pandas as pd
import shutil
from datetime import datetime

archivo_maestro = 'data/socios/Copy of 2026.31.01_RELACION_SOCIOS_ARMAS_SEPARADO_verified.xlsx'

print("=" * 80)
print("REASIGNAR K078999 DE GARDONI A ARECHIGA EN EXCEL")
print("17 Enero 2026")
print("=" * 80)

# Cargar Excel
df = pd.read_excel(archivo_maestro)
print(f"\n📊 Total registros: {len(df)}")

# BACKUP
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup_file = archivo_maestro.replace('.xlsx', f'_backup_{timestamp}.xlsx')
shutil.copy(archivo_maestro, backup_file)
print(f"✓ Backup: {backup_file}")

# Buscar K078999
k078999_rows = df[df['MATRÍCULA'] == 'K078999']

if not k078999_rows.empty:
    propietario_actual = k078999_rows.iloc[0]['EMAIL']
    print(f"\n📍 K078999 encontrada")
    print(f"   Propietario actual: {propietario_actual}")
    
    if propietario_actual == 'jrgardoni@gmail.com':
        print("\n🔄 REASIGNANDO de Gardoni a Arechiga...")
        
        # Buscar datos de Arechiga
        arechiga_rows = df[df['EMAIL'] == 'arechiga@jogarplastics.com']
        if not arechiga_rows.empty:
            arechiga_base = arechiga_rows.iloc[0]
            
            # Actualizar todos los datos del socio
            df.loc[df['MATRÍCULA'] == 'K078999', 'EMAIL'] = 'arechiga@jogarplastics.com'
            df.loc[df['MATRÍCULA'] == 'K078999', 'NOMBRE DEL SOCIO'] = arechiga_base['NOMBRE DEL SOCIO']
            df.loc[df['MATRÍCULA'] == 'K078999', 'CURP'] = arechiga_base['CURP']
            df.loc[df['MATRÍCULA'] == 'K078999', 'No. CREDENCIAL'] = arechiga_base['No. CREDENCIAL']
            df.loc[df['MATRÍCULA'] == 'K078999', 'No. CONSEC. DE SOCIO'] = arechiga_base.get('No. CONSEC. DE SOCIO', '')
            df.loc[df['MATRÍCULA'] == 'K078999', 'TELEFONO'] = arechiga_base.get('TELEFONO', '')
            df.loc[df['MATRÍCULA'] == 'K078999', 'CALLE'] = arechiga_base.get('CALLE', '')
            df.loc[df['MATRÍCULA'] == 'K078999', 'COLONIA'] = arechiga_base.get('COLONIA', '')
            df.loc[df['MATRÍCULA'] == 'K078999', 'CIUDAD'] = arechiga_base.get('CIUDAD', '')
            df.loc[df['MATRÍCULA'] == 'K078999', 'MUNICIPIO'] = arechiga_base.get('MUNICIPIO', '')
            df.loc[df['MATRÍCULA'] == 'K078999', 'ESTADO'] = arechiga_base.get('ESTADO', '')
            df.loc[df['MATRÍCULA'] == 'K078999', 'CODIGO POSTAL'] = arechiga_base.get('CODIGO POSTAL', '')
            
            print("✅ K078999 reasignada exitosamente a ARECHIGA")
    elif propietario_actual == 'arechiga@jogarplastics.com':
        print("✅ K078999 ya está asignada a ARECHIGA (correcto)")
    else:
        print(f"⚠️  ADVERTENCIA: K078999 pertenece a {propietario_actual}")
else:
    print("❌ K078999 NO encontrada en el Excel")

# Guardar
df.to_excel(archivo_maestro, index=False)
print(f"\n💾 Archivo guardado: {archivo_maestro}")

# Verificación
print("\n" + "=" * 80)
print("🔍 VERIFICACIÓN FINAL")
print("=" * 80)

print("\n✅ JOAQUIN GARDONI:")
gardoni_final = df[df['EMAIL'] == 'jrgardoni@gmail.com']
print(f"   Total armas: {len(gardoni_final)}")

print("\n✅ MARIA FERNANDA ARECHIGA:")
arechiga_final = df[df['EMAIL'] == 'arechiga@jogarplastics.com']
print(f"   Total armas: {len(arechiga_final)}")
for idx, arma in arechiga_final.iterrows():
    print(f"   • {arma['CLASE']:20} {arma.get('CALIBRE', 'N/A'):12} {arma['MARCA']:20} MAT: {arma['MATRÍCULA']}")

print("\n" + "=" * 80)
print("✅ REASIGNACIÓN COMPLETADA")
print("=" * 80)

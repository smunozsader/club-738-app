#!/usr/bin/env python3
"""
Genera archivo JS con datos FEMETI limpios para todas las modalidades.
Limpia nombres de clubes y elimina duplicados.
"""
import pandas as pd
import re
import json

# Leer CSV
df = pd.read_csv('docs/MATRIZ_FEMETI_2026.csv')

def limpiar_nombre_club(nombre):
    """Limpia nombre de club removiendo texto adicional"""
    if pd.isna(nombre):
        return ''
    nombre = str(nombre).strip()
    # Remover texto después de múltiples espacios o saltos de línea
    nombre = re.split(r'\s{3,}|\n', nombre)[0].strip()
    # Remover textos como "Campeonato Nacional...", "Competencia abierta", etc.
    nombre = re.sub(r'\s+(Campeonato|Competencia|competencia|Estatal|XIV|III).*$', '', nombre, flags=re.IGNORECASE)
    return nombre.strip()

def normalizar_estado(estado):
    """Normaliza nombre de estado - el CSV ya viene normalizado"""
    # El CSV ya viene normalizado, solo limpiar espacios
    return estado.strip()

def estado_display(estado):
    """Formato de display con acentos - ya vienen del CSV"""
    display_map = {
        'ESTADO DE MÉXICO': 'Estado de México',
        'NUEVO LEÓN': 'Nuevo León',
        'QUERÉTARO': 'Querétaro',
        'MICHOACÁN': 'Michoacán',
        'YUCATÁN': 'Yucatán',
        'SAN LUIS POTOSÍ': 'San Luis Potosí',
        'CIUDAD DE MEXICO': 'Ciudad de México',
        'AGUASCALIENTES': 'Aguascalientes',
        'BAJA CALIFORNIA': 'Baja California',
        'BAJA CALIFORNIA SUR': 'Baja California Sur',
        'CAMPECHE': 'Campeche',
        'CHIAPAS': 'Chiapas',
        'CHIHUAHUA': 'Chihuahua',
        'COAHUILA': 'Coahuila',
        'COLIMA': 'Colima',
        'DURANGO': 'Durango',
        'GUANAJUATO': 'Guanajuato',
        'GUERRERO': 'Guerrero',
        'HIDALGO': 'Hidalgo',
        'JALISCO': 'Jalisco',
        'MORELOS': 'Morelos',
        'NAYARIT': 'Nayarit',
        'OAXACA': 'Oaxaca',
        'PUEBLA': 'Puebla',
        'QUINTANA ROO': 'Quintana Roo',
        'SINALOA': 'Sinaloa',
        'SONORA': 'Sonora',
        'TABASCO': 'Tabasco',
        'TAMAULIPAS': 'Tamaulipas',
        'TLAXCALA': 'Tlaxcala',
        'VERACRUZ': 'Veracruz',
        'ZACATECAS': 'Zacatecas',
    }
    return display_map.get(estado, estado.title())

# Procesar datos
modalidades_data = {}

for modalidad in df['MODALIDAD'].unique():
    df_mod = df[df['MODALIDAD'] == modalidad].copy()
    
    # Obtener tipo de arma y calibres
    tipo_arma = str(df_mod['TIPO_ARMA'].iloc[0]) if 'TIPO_ARMA' in df_mod.columns else ''
    calibres = str(df_mod['CALIBRES'].iloc[0]) if 'CALIBRES' in df_mod.columns else ''
    
    estados = {}
    
    for estado_raw in df_mod['ESTADO'].unique():
        estado_norm = normalizar_estado(estado_raw)
        df_estado = df_mod[df_mod['ESTADO'] == estado_raw]
        
        # Obtener clubes únicos con domicilio
        clubes_dict = {}  # usar dict para deduplicar
        
        for _, row in df_estado.iterrows():
            club_limpio = limpiar_nombre_club(row['CLUB'])
            if club_limpio and club_limpio not in clubes_dict:
                clubes_dict[club_limpio] = str(row['LUGAR']).strip() if pd.notna(row['LUGAR']) else ''
        
        if clubes_dict:
            estados[estado_norm] = {
                'display': estado_display(estado_norm),
                'clubes': [{'club': k, 'domicilio': v} for k, v in clubes_dict.items()],
                'totalEventos': len(df_estado)
            }
    
    modalidades_data[modalidad] = {
        'tipoArma': tipo_arma,
        'calibres': calibres,
        'estados': estados,
        'totalEstados': len(estados),
        'totalEventos': len(df_mod)
    }

# Generar archivo JS
js_content = '''/**
 * Datos FEMETI 2026 - Todas las modalidades con clubes por estado
 * Generado automáticamente desde MATRIZ_FEMETI_2026.csv
 * 
 * Uso: Al seleccionar modalidad + estado(s), el sistema auto-incluye
 * TODOS los clubes del estado que ofrecen esa modalidad.
 */

// Meses en español para temporalidad
const MESES_ES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

/**
 * Calcula la temporalidad del PETA:
 * Desde fecha solicitud + 15 días hasta 31 DIC del año
 */
export const calcularTemporalidad = (fechaSolicitud) => {
  const fecha = new Date(fechaSolicitud);
  fecha.setDate(fecha.getDate() + 15);
  
  const dia = fecha.getDate();
  const mes = MESES_ES[fecha.getMonth()];
  const año = fecha.getFullYear();
  
  return {
    inicio: `${dia} DE ${mes} ${año}`,
    fin: `31 DE DICIEMBRE ${año}`,
    textoCompleto: `${dia} DE ${mes} - 31 DE DICIEMBRE ${año}`
  };
};

/**
 * Datos de todas las modalidades FEMETI 2026
 */
export const MODALIDADES_FEMETI_2026 = '''

js_content += json.dumps(modalidades_data, ensure_ascii=False, indent=2)

js_content += ''';

/**
 * Obtiene los estados disponibles para una modalidad
 */
export const getEstadosPorModalidad = (modalidad) => {
  const data = MODALIDADES_FEMETI_2026[modalidad];
  if (!data) return [];
  return Object.keys(data.estados).sort();
};

/**
 * Obtiene todos los clubes de un estado para una modalidad específica
 */
export const getClubesPorEstadoYModalidad = (modalidad, estado) => {
  const data = MODALIDADES_FEMETI_2026[modalidad];
  if (!data || !data.estados[estado]) return [];
  return data.estados[estado].clubes;
};

/**
 * Genera la matriz de clubes para el PDF siguiendo formato RFA-LC-017
 * @param {string} modalidad - Modalidad seleccionada
 * @param {string[]} estadosSeleccionados - Array de estados
 * @param {string} fechaSolicitud - Fecha de solicitud del PETA
 * @returns {Object} Datos para generar la tabla en el PDF
 */
export const generarMatrizClubesPDF = (modalidad, estadosSeleccionados, fechaSolicitud) => {
  const temporalidad = calcularTemporalidad(fechaSolicitud);
  const data = MODALIDADES_FEMETI_2026[modalidad];
  
  if (!data) return null;
  
  const filas = [];
  let contador = 1;
  
  for (const estado of estadosSeleccionados) {
    const estadoData = data.estados[estado];
    if (!estadoData) continue;
    
    for (const clubInfo of estadoData.clubes) {
      filas.push({
        numero: contador++,
        estado: estadoData.display,
        club: clubInfo.club,
        temporalidad: temporalidad.textoCompleto,
        domicilio: clubInfo.domicilio
      });
    }
  }
  
  return {
    modalidad,
    tipoArma: data.tipoArma,
    calibres: data.calibres,
    temporalidad,
    filas,
    totalClubes: filas.length
  };
};

/**
 * Lista de modalidades disponibles con iconos
 */
export const LISTA_MODALIDADES = [
  { key: 'TIRO PRACTICO', nombre: 'Tiro Práctico', icono: '⚡', arma: 'Pistola/Rifle/Escopeta' },
  { key: 'RECORRIDOS DE CAZA', nombre: 'Recorridos de Caza', icono: '🎯', arma: 'Escopeta' },
  { key: 'TIRO OLIMPICO', nombre: 'Tiro Olímpico', icono: '🏅', arma: 'Escopeta' },
  { key: 'BLANCOS EN MOVIMIENTO', nombre: 'Blancos en Movimiento', icono: '🕊️', arma: 'Escopeta' },
  { key: 'SILUETAS METALICAS', nombre: 'Siluetas Metálicas', icono: '🔫', arma: 'Rifle/Pistola' },
  { key: 'TIRO NEUMATICO', nombre: 'Tiro Neumático', icono: '💨', arma: 'Aire' }
];

export default MODALIDADES_FEMETI_2026;
'''

# Guardar archivo JS
with open('src/data/modalidadesFEMETI2026.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("✅ Archivo generado: src/data/modalidadesFEMETI2026.js")
print(f"\n📊 Resumen:")
for mod, info in modalidades_data.items():
    print(f"  {mod}: {info['totalEstados']} estados, {info['totalEventos']} eventos")
    total_clubes = sum(len(e['clubes']) for e in info['estados'].values())
    print(f"    → {total_clubes} clubes únicos")

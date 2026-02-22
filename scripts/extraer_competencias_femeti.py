#!/usr/bin/env python3
"""
Extrae índice FEMETI 2026: ESTADOS → MODALIDADES → CLUBES
Solo lo necesario para el selector de clubes en PETA.
"""

import pandas as pd
import json
import re

def normalizar_estado(estado):
    """Normaliza nombres de estados a formato MAYUSCULAS sin abreviaturas"""
    if pd.isna(estado):
        return None
    estado = str(estado).strip().upper()
    
    # Quitar tildes para normalizar
    estado = estado.replace('Á', 'A').replace('É', 'E').replace('Í', 'I').replace('Ó', 'O').replace('Ú', 'U')
    estado = estado.replace('Ñ', 'N')
    
    mapeo = {
        # Aguascalientes
        'AGS': 'AGUASCALIENTES', 'AGS.': 'AGUASCALIENTES', 'AGUASCALIENTES': 'AGUASCALIENTES',
        # Baja California
        'BC': 'BAJA CALIFORNIA', 'B.C.': 'BAJA CALIFORNIA', 'B.C': 'BAJA CALIFORNIA', 
        'BAJA CALIFORNIA': 'BAJA CALIFORNIA',
        # Baja California Sur
        'BCS': 'BAJA CALIFORNIA SUR', 'B.C.S.': 'BAJA CALIFORNIA SUR', 
        'BAJA CALIFORNIA SUR': 'BAJA CALIFORNIA SUR',
        # Campeche
        'CAMP': 'CAMPECHE', 'CAMP.': 'CAMPECHE', 'CAMPECHE': 'CAMPECHE',
        # Chiapas
        'CHIS': 'CHIAPAS', 'CHIS.': 'CHIAPAS', 'CHIAPAS': 'CHIAPAS',
        # Chihuahua
        'CHIH': 'CHIHUAHUA', 'CHIH.': 'CHIHUAHUA', 'CHIHUAHUA': 'CHIHUAHUA',
        # Ciudad de México
        'CDMX': 'CIUDAD DE MEXICO', 'CD. DE MEXICO': 'CIUDAD DE MEXICO', 
        'CIUDAD DE MEXICO': 'CIUDAD DE MEXICO', 'DF': 'CIUDAD DE MEXICO',
        'D.F.': 'CIUDAD DE MEXICO',
        # Coahuila
        'COAH': 'COAHUILA', 'COAH.': 'COAHUILA', 'COAHUILA': 'COAHUILA',
        # Colima
        'COL': 'COLIMA', 'COL.': 'COLIMA', 'COLIMA': 'COLIMA',
        # Durango
        'DGO': 'DURANGO', 'DGO.': 'DURANGO', 'DURANGO': 'DURANGO',
        # Guanajuato
        'GTO': 'GUANAJUATO', 'GTO.': 'GUANAJUATO', 'GUANAJUATO': 'GUANAJUATO',
        # Guerrero
        'GRO': 'GUERRERO', 'GRO.': 'GUERRERO', 'GUERRERO': 'GUERRERO',
        # Hidalgo
        'HGO': 'HIDALGO', 'HGO.': 'HIDALGO', 'HIDALGO': 'HIDALGO',
        # Jalisco
        'JAL': 'JALISCO', 'JAL.': 'JALISCO', 'JALISCO': 'JALISCO',
        # Estado de México
        'MEX': 'ESTADO DE MEXICO', 'MEX.': 'ESTADO DE MEXICO', 
        'EDO. MEX': 'ESTADO DE MEXICO', 'EDO. DE MEXICO': 'ESTADO DE MEXICO',
        'MEXICO': 'ESTADO DE MEXICO', 'ESTADO DE MEXICO': 'ESTADO DE MEXICO',
        'EDO. MEX.': 'ESTADO DE MEXICO', 'EDOMEX': 'ESTADO DE MEXICO',
        # Michoacán
        'MICH': 'MICHOACAN', 'MICH.': 'MICHOACAN', 'MICHOACAN': 'MICHOACAN',
        # Morelos
        'MOR': 'MORELOS', 'MOR.': 'MORELOS', 'MORELOS': 'MORELOS',
        # Nayarit
        'NAY': 'NAYARIT', 'NAY.': 'NAYARIT', 'NAYARIT': 'NAYARIT',
        # Nuevo León
        'NL': 'NUEVO LEON', 'N.L.': 'NUEVO LEON', 'NUEVO LEON': 'NUEVO LEON',
        # Oaxaca
        'OAX': 'OAXACA', 'OAX.': 'OAXACA', 'OAXACA': 'OAXACA',
        # Puebla
        'PUE': 'PUEBLA', 'PUE.': 'PUEBLA', 'PUEBLA': 'PUEBLA',
        # Querétaro
        'QRO': 'QUERETARO', 'QRO.': 'QUERETARO', 'QUERETARO': 'QUERETARO',
        # Quintana Roo
        'QROO': 'QUINTANA ROO', 'Q.ROO': 'QUINTANA ROO', 'Q ROO': 'QUINTANA ROO',
        'QUINTANA ROO': 'QUINTANA ROO',
        # San Luis Potosí
        'SLP': 'SAN LUIS POTOSI', 'S.L.P.': 'SAN LUIS POTOSI', 
        'SAN LUIS POTOSI': 'SAN LUIS POTOSI',
        # Sinaloa
        'SIN': 'SINALOA', 'SIN.': 'SINALOA', 'SINALOA': 'SINALOA',
        # Sonora
        'SON': 'SONORA', 'SON.': 'SONORA', 'SONORA': 'SONORA',
        # Tabasco
        'TAB': 'TABASCO', 'TAB.': 'TABASCO', 'TABASCO': 'TABASCO',
        # Tamaulipas
        'TAMPS': 'TAMAULIPAS', 'TAMPS.': 'TAMAULIPAS', 'TAMAULIPAS': 'TAMAULIPAS',
        # Tlaxcala
        'TLAX': 'TLAXCALA', 'TLAX.': 'TLAXCALA', 'TLAXCALA': 'TLAXCALA',
        # Veracruz
        'VER': 'VERACRUZ', 'VER.': 'VERACRUZ', 'VERACRUZ': 'VERACRUZ',
        # Yucatán
        'YUC': 'YUCATAN', 'YUC.': 'YUCATAN', 'YUCATAN': 'YUCATAN',
        # Zacatecas
        'ZAC': 'ZACATECAS', 'ZAC.': 'ZACATECAS', 'ZACATECAS': 'ZACATECAS',
    }
    
    resultado = mapeo.get(estado)
    
    # Si no está en el mapeo, ignorar valores inválidos
    if not resultado:
        # Ignorar valores como "DEFINIR", "POR DEFINIR", etc.
        if 'DEFINIR' in estado or len(estado) < 3:
            return None
        # Retornar el original si parece válido (más de 3 chars)
        return estado if len(estado) > 3 else None
    
    return resultado

def normalizar_club(nombre):
    """
    Normaliza nombre de club eliminando variantes y eventos concatenados.
    Formato Excel: "Club Tal, A.C. Evento Tal" → extraer solo "Club Tal"
    """
    if not nombre:
        return None
    
    # 1. Solo primera línea
    nombre = nombre.split('\n')[0].strip()
    
    # 1b. NORMALIZAR COMILLAS CURVAS A RECTAS (crítico para diccionario)
    nombre = nombre.replace('"', '"').replace('"', '"')
    nombre = nombre.replace(''', "'").replace(''', "'")
    
    # 2. CLAVE: Cortar después del PRIMER "A.C." si hay más texto
    # "Club Cinegético Jalisciense, A.C. ISSF World Cup" → "Club Cinegético Jalisciense"
    # Buscar patrón: texto + A.C. + más texto después
    patrones_ac = [
        r'^(.+?),\s*A\.C\.\s+\w',      # "Club X, A.C. evento"
        r'^(.+?)\s+A\.C\.\s+\w',       # "Club X A.C. evento"  
        r'^(.+?),\s*A\s*C\s+\w',       # "Club X, AC evento"
    ]
    for patron in patrones_ac:
        match = re.search(patron, nombre, re.IGNORECASE)
        if match:
            nombre = match.group(1).strip()
            break
    
    # 3. Filtrar nombres que NO son clubes (eventos sueltos sin "Club")
    nombre_upper = nombre.upper()
    if not any(x in nombre_upper for x in ['CLUB', 'ASOCIACIÓN', 'ASOC']):
        return None
    
    # 4. Corregir typos comunes
    typos = {
        'Compeyencia': 'Competencia',
        'Pezca': 'Pesca',
        'Caaza': 'Caza',
        'Dptva.': 'Deportiva',
        'Dptva': 'Deportiva',
        'Club Club': 'Club',
        'Asociación.': 'Asociación',
        'Deportivo.': 'Deportivo',
        'deTiro': 'de Tiro',
        'deC.': 'de C.',
        'TIro': 'Tiro',
        # Tildes incorrectas
        'Hálcones': 'Halcones',
        'Leónes': 'Leones',
        'Olímpiada': 'Olimpiada',
        'Cinégetico': 'Cinegético',
        # Typos de nombres
        'Jalpence': 'Jalpense',
        'Mexco': 'México',
        # Mayúsculas en nombres propios
        '"josé': '"José',
        '"águilas': '"Águilas',
        '"aguilas': '"Águilas',
        # Formatos
        'S.o.p': 'S.O.P.',
        'D.f': 'D.F.',
        'CD.': 'Cd.',
    }
    for mal, bien in typos.items():
        nombre = nombre.replace(mal, bien)
    
    # Normalizar variantes de "La Jauría" - unificar a formato estándar
    nombre = re.sub(r'"\s*la Jauría\s*"\s*A\.?C\.?\s*"?', '"La Jauría"', nombre, flags=re.IGNORECASE)
    nombre = re.sub(r'"\s*La Jauría\s*"\s*A\.?C\.?\s*"?', '"La Jauría"', nombre, flags=re.IGNORECASE)
    nombre = re.sub(r'"\s*la Jauría\s*"', '"La Jauría"', nombre, flags=re.IGNORECASE)
    
    # Normalizar "Francisco I. Madero" - quitar variantes con MAYO
    nombre = re.sub(r'"Francisco I\. Madero\s*A\.?C\.?\s*"MAYO"', '"Francisco I. Madero"', nombre)
    nombre = re.sub(r'"Francisco I\. Madero\s*A\.?C\.?', '"Francisco I. Madero"', nombre)
    
    # 5. Cortar antes de eventos (por si quedó algo)
    palabras_corte = [
        ' Competencia', ' Tirada', ' Copa', ' Campeonato', ' Practica', ' Práctica',
        ' Aniversario', ' FEMETI', ' Circuito', ' Serie', ' Selectivo', ' Estatal',
        ' Nacional', ' Mundial', ' Borrego', ' Venado', ' Navideña', ' Nocturna',
        ' Alto Poder', ' Gong', ' Juniors', ' Rifle', ' Escopeta', ' Blancos en',
        ' Juegos', ' ISSF', ' World', ' Olimpiada', ' Precision', ' Festejo',
        ' Gran Premio',
        ' I,', ' II,', ' III,', ' IV,', ' V,', ' VI,', ' VII,', ' VIII,', ' IX,', ' X,',
        ' 1a', ' 2a', ' 3a', ' 4a', ' 5a', ' 6a', ' 7a', ' 1er', ' 2do', ' 3ro',
        ' Xiv', ' Xlv', ' Iii', ' *',
    ]
    nombre_lower = nombre.lower()
    for palabra in palabras_corte:
        idx = nombre_lower.find(palabra.lower())
        if idx > 0:
            nombre = nombre[:idx].strip()
            nombre_lower = nombre.lower()
    
    # 6. Limpiar espacios y puntuación
    nombre = re.sub(r'\s+', ' ', nombre).strip()
    nombre = re.sub(r'" "', '"', nombre)  # Quitar comillas dobles separadas
    nombre = re.sub(r'\s*"\s*$', '"', nombre)  # Comilla al final sin espacios
    nombre = re.sub(r'[,\s]+$', '', nombre)
    nombre = re.sub(r',(\w)', r', \1', nombre)  # Espacio después de comas
    
    # 7. Normalizar abreviaturas C. T. y P.
    nombre = re.sub(r'C\.?\s*T\.?\s*[,\s]*y\s*P\.?', 'C. T. y P.', nombre, flags=re.IGNORECASE)
    nombre = re.sub(r'T\.?\s*C\.?\s*[,\s]*y\s*P\.?', 'C. T. y P.', nombre, flags=re.IGNORECASE)
    nombre = re.sub(r'C\.?\s+y\s*T\.?(?!\s*y)', 'C. y T.', nombre, flags=re.IGNORECASE)
    nombre = re.sub(r'\bDptvo\.?\s+', 'Deportivo ', nombre, flags=re.IGNORECASE)
    # Solo reemplazar "Asoc." cuando no está seguido de letras (no tocar Asociación)
    nombre = re.sub(r'\bAsoc\.\s+', 'Asociación ', nombre, flags=re.IGNORECASE)
    nombre = nombre.replace('Asociación.', 'Asociación')
    nombre = nombre.replace('Deportivo.', 'Deportivo')
    
    # 8. Quitar TODAS las variantes de A.C. al final
    for _ in range(3):
        nombre = re.sub(r'[,\s]*A\s*\.?\s*C\s*\.?\s*$', '', nombre, flags=re.IGNORECASE)
        nombre = re.sub(r'[,\s]*S\s*\.?\s*C\s*\.?\s*$', '', nombre, flags=re.IGNORECASE)
    nombre = nombre.strip(' ,.')
    
    # 9. Quitar artículos/palabras sueltas al final
    nombre = re.sub(r'\s+(de|del|el|la|y|e|A|a)\s*$', '', nombre, flags=re.IGNORECASE)
    
    # 10. NORMALIZAR CAPITALIZACIÓN (Title Case con excepciones)
    def title_case_club(s):
        minusculas = {'de', 'del', 'la', 'el', 'los', 'las', 'y', 'e', 'en', 'a'}
        especiales = {'C.', 'T.', 'P.', 'D.F.', 'S.O.P.', 'CD.', 'I.', 'II', 'III'}
        # Comillas: rectas (0x22, 0x27) y curvas (0x201c, 0x201d, 0x2018, 0x2019)
        comillas = {'"', "'", '\u201c', '\u201d', '\u2018', '\u2019'}
        
        palabras = s.split()
        resultado = []
        for i, palabra in enumerate(palabras):
            # Si empieza con comilla, capitalizar la letra después de la comilla
            if palabra and palabra[0] in comillas:
                if len(palabra) > 1:
                    # Comilla + capitalizar resto correctamente
                    resultado.append(palabra[0] + palabra[1:].capitalize())
                else:
                    resultado.append(palabra)
            # Mantener especiales (abreviaturas)
            elif any(esp in palabra.upper() for esp in especiales):
                resultado.append(palabra)
            # Minúsculas para artículos (no primera palabra)
            elif palabra.lower() in minusculas and i > 0:
                resultado.append(palabra.lower())
            # Convertir a Title Case
            else:
                resultado.append(palabra.capitalize())
        return ' '.join(resultado)
    
    nombre = title_case_club(nombre)
    
    # 11. Validar longitud mínima
    if len(nombre) < 10:
        return None
    
    # 12. Corregir tildes comunes (aplicar después de capitalizar)
    tildes = {
        'Cinegetico': 'Cinegético', 'Mexico': 'México', 'León': 'León',
        'Yucatan': 'Yucatán', 'Queretaro': 'Querétaro', 'Olimpico': 'Olímpico',
        'Acuna': 'Acuña', 'Nicolas': 'Nicolás', 'Cristobal': 'Cristóbal',
        'Tepatitlan': 'Tepatitlán', 'Mazatlan': 'Mazatlán', 'Tomas': 'Tomás',
        'Leónes': 'Leones', 'Sanchez': 'Sánchez', 'Aleman': 'Alemán',
        'Jaribú': 'Jaribú', 'Jabali': 'Jabalí', 'Anahuac': 'Anáhuac',
        'Anahu': 'Anáhuac', 'Prisciliano': 'Prisciliano',
    }
    for mal, bien in tildes.items():
        nombre = nombre.replace(mal, bien)
    
    # 12b. Corregir capitalización de abreviaturas y nombres propios
    capitalizacion = {
        'D.f': 'D.F.', 'D.f.': 'D.F.',
        'S.o.p': 'S.O.P.', 'S.o.p.': 'S.O.P.',
        '"josé': '"José', '"águilas': '"Águilas',
        ' josé ': ' José ', ' águilas ': ' Águilas ',
    }
    for mal, bien in capitalizacion.items():
        nombre = nombre.replace(mal, bien)
    
    # 12c. Normalizar comillas curvas a rectas
    nombre = nombre.replace('"', '"').replace('"', '"')
    nombre = nombre.replace(''', "'").replace(''', "'")
    
    # 13. Limpiar problemas de formato al final
    nombre = re.sub(r'\s+', ' ', nombre).strip()
    nombre = re.sub(r',\s*,', ',', nombre)
    nombre = re.sub(r'\s*"\s*$', '"', nombre)
    
    # 14. Agregar ", A.C." estándar
    nombre_final = nombre + ', A.C.'
    
    # 15. DICCIONARIO OFICIAL FEMETI - Nombres EXPANDIDOS (sin abreviaturas)
    # Fuente: docs/femeti_clubes.pdf - pero expandiendo Dptvo→Deportivo, Cineg→Cinegético, etc.
    unificacion = {
        # === NOMBRES QUE NO SON CLUBES (eliminar) ===
        'Club Deportivo de C. T. y P., A.C.': None,
        
        # === BAJA CALIFORNIA ===
        'Club C. T. y P. Berrendo, A.C.': 'Club de Tiro, Caza y Pesca Berrendo, A.C.',
        'Club C. T. y P. Condor de Tijuana, A.C.': 'Club de Tiro, Caza y Pesca Cóndor de Tijuana, A.C.',
        
        # === BAJA CALIFORNIA SUR ===
        'Club de C. T. y P. Choyeros, A.C.': 'Club de Caza, Tiro y Pesca Los Choyeros, A.C.',
        
        # === CHIHUAHUA ===
        'Club 30-06 Cazadores de Chihuahua "José Seijas Caro", A.C.': 'Club 30-06 Cazadores de Chihuahua "José Seijas Caro", A.C.',
        'Club 30-06 Cazadores de Chihuahua "josé Seijas Caro", A.C.': 'Club 30-06 Cazadores de Chihuahua "José Seijas Caro", A.C.',
        'Club Deportivo de C. T. y P. Cuauhtémoc, A.C.': 'Club Deportivo de C.T. y P. Cuauhtémoc, A.C.',
        'Club de C. T. y P. del Noroeste, A.C.': 'Club de Caza, Tiro y Pesca del Noroeste, A.C.',
        'Club Cinegético de C. T. y P. de Riva Palacio, A.C.': 'Club Cinegético de C.T. y P. de Riva Palacio, A.C.',
        'Club de Caza y Tiro el Indio, A.C.': 'Club de Caza y Tiro El Indio, A.C.',
        'Club de C. T. y P. Lobina Negra, A.C.': 'Club de Caza, Tiro y Pesca Lobina Negra, A.C.',
        'Club de Caza, Tiro y Pesca el Crustáceo, A.C.': 'Club de Caza, Tiro y Pesca El Crustáceo, A.C.',
        'Club de Tiradores y Cazadores Cruz Blanca, A.C.': 'Club de Tiradores y Cazadores Cruz Blanca, A.C.',
        
        # === COAHUILA ===
        'Club Cinegético el Ganso, A.C.': 'Club Cinegético El Ganso, A.C.',
        'Club Cinegético del Valle de Saltillo, A.C.': 'Club Cinegético del Valle de Saltillo, A.C.',
        'Club Cinegético el Sable, A.C.': 'Club Cinegético El Sable, A.C.',
        'Club Campestre de C. T. y P. de Cd. Acuña, A.C.': 'Club Campestre de Caza, Tiro y Pesca de Cd. Acuña, A.C.',
        'Club Campestre de Caza Tiro y Pesca de Acuña, A.C.': 'Club Campestre de Caza, Tiro y Pesca de Cd. Acuña, A.C.',
        'Club Deportivo de Cazadores "Francisco I. Madero, A.C.': 'Club Deportivo de Cazadores de Fco. I. Madero, A.C.',
        'Club Deportivo de Cazadores "Francisco I. Madero A.C. "MAYO", A.C.': 'Club Deportivo de Cazadores de Fco. I. Madero, A.C.',
        
        # === CDMX / ESTADO DE MEXICO ===
        'Club Asociación de Caza y Pesca del D.F., A.C.': 'Club Asociación de Caza y Pesca del D.F., A.C.',
        'Club Caza Deportiva el Aguila, A.C.': 'Club Caza Deportiva El Águila, A.C.',
        'Club Caza Deportiva El Águila, A.C.': 'Club Caza Deportiva El Águila, A.C.',
        'Club de Caza, Tiro, Arqueria y Pesca, "Aguilas de Atlacomulco, A.C.': 'Club de Caza, Tiro, Arquería y Pesca Águilas de Atlacomulco, A.C.',
        'Club de Caza, Tiro y Cinegético de Toluca, A.C.': 'Club Cinegético Toluca, A.C.',
        'Club de Tiro y Cinegético de Toluca, A.C.': 'Club Cinegético Toluca, A.C.',
        'Club México de Perros de Muestra, A.C.': 'Club México de Perros de Muestra, A.C.',
        
        # === GUANAJUATO ===
        'Club Cinegético Leones, A.C.': 'Club Cinegético Leones, A.C.',
        'Club Cinegético Penjamense "Halcones", A.C.': 'Club Cinegético Penjamense Halcones, A.C.',
        'Club Cinegético General Tomás Moreno, A.C.': 'Club Cinegético General Tomás Moreno, A.C.',
        'Club de Caza, Tiro y Pesca General Tomás Moreno, A.C.': 'Club Cinegético General Tomás Moreno, A.C.',
        
        # === GUERRERO ===
        'Club de C. T. y P. de Acapulco, A.C.': 'Club de Caza, Tiro y Pesca de Acapulco, A.C.',
        'Club Acapulco de C. T. y P, A.C.': 'Club de Caza, Tiro y Pesca de Acapulco, A.C.',
        'Club de Caza y Tiro "El Huixteco", A.C.': 'Club de Caza, Tiro y Pesca Huixteco, A.C.',
        'Club de C. T. y P. Cazadores del Pacifico, A.C.': 'Club de Caza, Tiro y Pesca Cazadores del Pacífico, A.C.',
        'Club Cinegético Yoguala de C. T. y P, A.C.': 'Club Cinegético Yoguala de Caza, Tiro y Pesca, A.C.',
        'Club de C. T. y P. Chilpancingo, A.C.': 'Club de Caza, Tiro y Pesca Chilpancingo, A.C.',
        'Club de Caza, Tiro y Pesca Chilpancingo, A.C.': 'Club de Caza, Tiro y Pesca Chilpancingo, A.C.',
        'Club de C. T. y P. Gacels de Guerrero, A.C.': 'Club de Caza, Tiro y Pesca Gacelas de Guerrero, A.C.',
        
        # === HIDALGO ===
        'Club de Caza y Pesca Sidena, A.C.': 'Club de Caza, Tiro y Pesca Sidena, A.C.',
        
        # === JALISCO ===
        'Club Cinegético Halcones de Mascota, A.C.': 'Club Cinegético Halcones de Mascota, A.C.',
        'Club Cinegético Gavilanes de Mascota, A.C.': 'Club Cinegético Gavilanes de Mascota, A.C.',
        'Club Cinegético Nestle, A.C.': 'Club Cinegético Nestlé Lagos, A.C.',
        
        # === MICHOACAN ===
        'Club Asociación Cinegética Deportiva Michoacana, A.C.': 'Club Asociación Cinegética Deportiva Michoacana, A.C.',
        'Club Cinegético Halcones de Jacona, A.C.': 'Club Cinegético Halcones de Jacona, A.C.',
        
        # === NUEVO LEON ===
        'Club Asociación Regiomontana de Caza y Tiro, A.C.': 'Club Asociación Regiomontana de Caza y Tiro (ARCYT), A.C.',
        'Club Deportivo Cazadores Monterrey, A.C.': 'Club Deportivo Cazadores Monterrey, A.C.',
        'Club de Caza Tiro y Pesca San Nicolás de los Garza, A.C.': 'Club de Caza, Tiro y Pesca San Nicolás, A.C.',
        
        # === OAXACA ===
        'Club de C. T. y P. Flechador del Sol, A.C.': 'Club Cinegético Flechador del Sol, A.C.',
        
        # === QUERETARO ===
        'Club de Caza y Tiro Cristóbal Colón, A.C.': 'Club de Caza y Tiro Cristóbal Colón, A.C.',
        'Club de Caza, Tiro y Pesca los Gamitos, A.C.': 'Club de Caza, Tiro y Pesca Los Gamitos, A.C.',
        
        # === QUINTANA ROO ===
        'Club 78 C. T. y P, A.C.': 'Club 78 de Tiro, Caza y Pesca, A.C.',
        
        # === SAN LUIS POTOSI ===
        'Club Cinegético los Condores Potosinos, A.C.': 'Club Cinegético Los Cóndores Potosinos, A.C.',
        'Club de Caza Tiro y Pesca Jaguares de Rioverde, A.C.': 'Club Deportivo de Tiro, Caza y Pesca Jaguares, A.C.',
        
        # === SONORA ===
        'Club Deportivo Hermosillense de C. y T, A.C.': 'Club Deportivo Hermosillense de Caza y Tiro, A.C.',
        'Club Deportivo Hermosillense de Caza y Tiro, A.C.': 'Club Deportivo Hermosillense de Caza y Tiro, A.C.',
        'Club Norteño de C. T. y P, A.C.': 'Club Norteño de Caza, Tiro y Pesca, A.C.',
        'Club de Tiro, Caza y Tiro Agua Prieta, A.C.': 'Club de Tiro, Caza y Pesca de Agua Prieta, A.C.',
        
        # === TABASCO ===
        'Club Cinegético de Caza, Tiro y Pesca el Tigre, A.C.': 'Club Cinegético de Caza, Tiro y Pesca El Tigre, A.C.',
        'Club de Caza, Tiro y Pesca el Tigre, A.C.': 'Club Cinegético de Caza, Tiro y Pesca El Tigre, A.C.',
        
        # === TAMAULIPAS ===
        'Club Deportivo Reynosa, A.C.': 'Club Deportivo Corona Reynosa de Caza, Tiro y Pesca, A.C.',
        
        # === VERACRUZ ===
        'Club de Caza, Tiro y Pesca " la Jauría ", A.C.': 'Club de Caza, Tiro y Pesca La Jauría, A.C.',
        'Club de Caza, Tiro y Pesca "La Jauría", A.C.': 'Club de Caza, Tiro y Pesca La Jauría, A.C.',
        'Club de Caza, Tiro y Pesca "La Jauría"A.C.", A.C.': 'Club de Caza, Tiro y Pesca La Jauría, A.C.',
        
        # === YUCATAN ===
        'Club de Caza, Tiro y Pesca de Yucatán, A.C.': 'Club de Caza, Tiro y Pesca de Yucatán, A.C.',
        'Club los Conejos de Caza y Tiro, A.C.': 'Club Los Conejos de Caza y Tiro, A.C.',
        
        # === ZACATECAS ===
        'Club Cinegético Regional Jerezano, A.C. "PUMAS", A.C.': 'Club Cinegético Regional Jerezano, A.C.',
        'Club de C. T. y P. Rio Grande, A.C.': 'Club Venados de Río Grande, A.C.',
        'Club de Tiradores y Cazadores Zacatecanos, A.C.': 'Club de Tiradores y Cazadores Zacatecanos, A.C.',
        
        # === OTROS - Correcciones de capitalización y formato ===
        'Club Cinegético y de Tiro "águilas del Fraile", A.C.': 'Club Cinegético y de Tiro Águilas del Fraile, A.C.',
        'Club Deportivo Zafari de el Sauzal, A.C.': 'Club Deportivo Safari de El Sauzal, A.C.',
        'Club Tiro y Caza Panteras, A.C.': 'Club de Tiro y Caza Panteras, A.C.',
        'Club Union de Cazadores del Sur, A.C.': 'Club Unión de Cazadores del Sur, A.C.',
        'Club de Tiro, Caza y Pesca Lic. Miguel Aleman, A.C.': 'Club de Tiro, Caza y Pesca Lic. Miguel Alemán, A.C.',
        'Club de Tiro y Cinegético Esparta, A.C.': 'Club de Tiro y Cinegético Esparta, A.C.',
        'Club de Tiro, Caza y Pesca, Jaguar, A.C.': 'Club Deportivo de Tiro, Caza y Pesca Jaguares, A.C.',
        'Club de C. T. y P. Halcones, A.C.': 'Club de Tiro, Caza y Pesca Halcones, A.C.',
        'Club de Tiro, Caza y Pesca Halcones, A.C.': 'Club de Tiro, Caza y Pesca Halcones, A.C.',
        'Club C. T. y P. Cimarrones, A.C.': 'Club de Tiro, Caza y Pesca Cimarrones, A.C.',
        'Club Cinegético Anáhuac, A.C.': 'Club Cinegético Anáhuac, A.C.',
        'Club Cinegético Prisciliano Sánchez, A.C.': 'Club Cinegético Prisciliano Sánchez, A.C.',
        'Club C. T. y P. Faisanes, A.C.': 'Club de Tiro, Caza y Pesca Faisanes, A.C.',
        'Club C. T. y P. Guadalupe Victoria, A.C.': 'Club de Caza, Tiro y Pesca Guadalupe Victoria, A.C.',
        'Club C. y T. Noroeste, A.C.': 'Club de Caza, Tiro y Pesca del Noroeste, A.C.',
        'Club de C. T. y P. S.O.P., A.C.': 'Club de Caza, Tiro y Pesca S.O.P., A.C.',
        'Club de Caza Tiro y Pesca del Valle de Santo Domingo, A.C.': 'Club de Caza, Tiro y Pesca del Valle de Santo Domingo, A.C.',
        'Club de Caza y Pesca Colonia Industrial, A.C.': 'Club de Caza y Pesca Colonia Industrial, A.C.',
        'Club de Caza y Pesca Tiradores del Desierto, A.C.': 'Club de Caza y Pesca Tiradores del Desierto, A.C.',
        'Club de Caza, Pesca y Tiro Jabatos, A.C.': 'Club de Caza, Pesca y Tiro Jabatos, A.C.',
        
        # === CORRECCIONES DE CAPITALIZACIÓN POST-PROCESO ===
        'Club 30-06 Cazadores de Chihuahua "josé Seijas Caro", A.C.': 'Club 30-06 Cazadores de Chihuahua "José Seijas Caro", A.C.',
        'Club Asociación de Caza y Pesca del D.f, A.C.': 'Club Asociación de Caza y Pesca del D.F., A.C.',
        'Club de C. T. y P. S.o.p, A.C.': 'Club de Caza, Tiro y Pesca S.O.P., A.C.',
        'Club Cinegético y de Tiro "águilas del Fraile", A.C.': 'Club Cinegético y de Tiro Águilas del Fraile, A.C.',
    }
    
    if nombre_final in unificacion:
        return unificacion[nombre_final]
    
    # 16. CORRECCIONES FINALES de capitalización (regex) - incluye comillas curvas y rectas
    nombre_final = re.sub(r'["""]josé ', '"José ', nombre_final)
    nombre_final = re.sub(r'["""]águilas ', '"Águilas ', nombre_final, flags=re.IGNORECASE)
    
    return nombre_final

def extraer_club(texto):
    """Extrae y normaliza nombre del club del texto"""
    if pd.isna(texto):
        return None
    texto = str(texto).strip()
    
    # Tomar primera línea y normalizar
    lineas = texto.split('\n')
    nombre_raw = lineas[0].strip() if lineas else texto
    
    return normalizar_club(nombre_raw)

# Las 6 modalidades FEMETI
MODALIDADES = [
    'BLANCOS EN MOVIMIENTO',
    'RECORRIDOS DE CAZA', 
    'TIRO OLIMPICO',
    'SILUETAS METALICAS',
    'TIRO PRACTICO',
    'TIRO NEUMATICO'
]

def main():
    """
    Extrae índice jerárquico: MODALIDAD → ESTADO → CLUBES
    Output simplificado para el selector de clubes PETA.
    """
    xlsx = pd.ExcelFile('data/referencias/femeti_tiradas_2026/PA 26 BLOQUEADO femeti.xlsx')
    
    resultado = {}
    todos_estados = set()
    todos_clubes = set()
    
    for mod in MODALIDADES:
        print(f"📋 {mod}")
        df = pd.read_excel(xlsx, sheet_name=mod, header=None)
        
        # Encontrar fila de encabezados
        header_row = None
        for i, row in df.iterrows():
            if 'DIA' in str(row.values):
                header_row = i
                break
        
        if header_row is None:
            print(f"  ⚠️ Sin encabezado")
            continue
        
        df = pd.read_excel(xlsx, sheet_name=mod, header=header_row)
        df.columns = ['DIA', 'MES', 'FECHA', 'CLUB', 'CALIBRE', 'LUGAR1', 'LUGAR2', 'ESTADO'] + list(df.columns[8:])
        
        # Acumular clubes únicos por estado
        clubes_por_estado = {}
        
        for _, row in df.iterrows():
            if pd.isna(row['ESTADO']) or str(row['ESTADO']).upper() == 'ESTADO':
                continue
            
            estado = normalizar_estado(row['ESTADO'])
            club = extraer_club(row['CLUB'])
            
            if not estado or not club:
                continue
            
            todos_estados.add(estado)
            todos_clubes.add(club)
            
            if estado not in clubes_por_estado:
                clubes_por_estado[estado] = set()
            clubes_por_estado[estado].add(club)
        
        # Convertir sets a listas ordenadas
        estados_dict = {}
        for estado in sorted(clubes_por_estado.keys()):
            clubes_ordenados = sorted(list(clubes_por_estado[estado]))
            estados_dict[estado] = clubes_ordenados
        
        resultado[mod] = {
            'estados': estados_dict,
            'total_estados': len(estados_dict),
            'total_clubes': sum(len(c) for c in estados_dict.values())
        }
        
        print(f"   {len(estados_dict)} estados, {resultado[mod]['total_clubes']} clubes")
    
    # Guardar JSON
    output_path = 'data/referencias/femeti_tiradas_2026/competencias_femeti_2026.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(resultado, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Guardado: {output_path}")
    print(f"\n📊 RESUMEN FEMETI 2026:")
    print(f"   Estados únicos: {len(todos_estados)}")
    print(f"   Clubes únicos:  {len(todos_clubes)}")
    
    # Verificación: mostrar lista de estados
    print(f"\n🗺️  ESTADOS ({len(todos_estados)}):")
    for e in sorted(todos_estados):
        print(f"   • {e}")

if __name__ == '__main__':
    main()

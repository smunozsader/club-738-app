/**
 * Clubes y sedes de TIRO PRACTICO para PETA de Competencia Nacional
 * Formato requerido por RFA-LC-017 (DEFENSA-02-045)
 * 
 * Datos extraídos de: /docs/MATRIZ_FEMETI_2026.csv
 * Total: 18 estados, 615 eventos
 * 
 * Estructura por estado:
 * - club: Nombre del club sede
 * - domicilio: Ubicación del club (ciudad)
 * - temporalidad: Se calcula dinámicamente (15 días después de fecha solicitud hasta Dic 2026)
 */

export const CLUBES_TIRO_PRACTICO_2026 = {
  'BAJA CALIFORNIA': {
    estado: 'Baja California',
    clubes: [
      { club: 'Club C. T. y P. Berrendo, A.C.', domicilio: 'Tijuana, B.C.' },
      { club: 'Club C. T, y P. Condor de Tijuana, A.C.', domicilio: 'Tijuana, B.C.' },
      { club: 'Club Cinegético Jabalí, A.C.', domicilio: 'Mexicali, B.C.' },
      { club: 'Club Dptvo. Zafari de el Sauzal, A.C.', domicilio: 'Ensenada, B.C.' }
    ],
    totalEventos: 25
  },
  'CHIAPAS': {
    estado: 'Chiapas',
    clubes: [
      { club: 'Club de Tiro, Caza y Pesca, Jaguar, A.C.', domicilio: 'Ocozocoautla de Espinosa, Chis.' },
      { club: 'Club de C. T. y P. Hálcones, A.C.', domicilio: 'Tuxtla Gutiérrez, Chis.' },
      { club: 'Club de Tiro Olimpico Chiapaneco A.C.', domicilio: 'Berriozábal, Chis.' }
    ],
    totalEventos: 45
  },
  'COAHUILA': {
    estado: 'Coahuila',
    clubes: [
      { club: 'Club Cinegético Saltillo Safari AC', domicilio: 'Saltillo, Coah.' },
      { club: 'Club Campestre de C.T. y P. de Cd. Acuña, A.C.', domicilio: 'Cd. Acuña, Coah.' }
    ],
    totalEventos: 63
  },
  'GUANAJUATO': {
    estado: 'Guanajuato',
    clubes: [
      { club: 'Club Cinegético Penjamense "Halcones", A.C.', domicilio: 'Pénjamo, Gto.' }
    ],
    totalEventos: 1
  },
  'GUERRERO': {
    estado: 'Guerrero',
    clubes: [
      { club: 'Club de C. T. y P. Chilpancingo, A.C.', domicilio: 'Chilpancingo, Gro.' },
      { club: 'Club de C. T. y P. de Acapulco, A.C.', domicilio: 'Acapulco, Gro.' },
      { club: 'Club de Caza y Tiro "El Huixteco", A.C.', domicilio: 'Taxco, Gro.' },
      { club: 'Club de C. T. y P. Gacels de Guerrero, A.C.', domicilio: 'Acapulco, Gro.' }
    ],
    totalEventos: 63
  },
  'HIDALGO': {
    estado: 'Hidalgo',
    clubes: [
      { club: 'Club de Caza y Pesca Sidena, A.C.', domicilio: 'Cd. Sahagún, Hgo.' }
    ],
    totalEventos: 24
  },
  'JALISCO': {
    estado: 'Jalisco',
    clubes: [
      { club: 'Club Cinegético Jalisciense, A.C.', domicilio: 'Zapopan, Jal.' },
      { club: 'Club Alianza de Cazadores Diana A.C.', domicilio: 'Zapopan, Jal.' }
    ],
    totalEventos: 208
  },
  'MEXICO': {
    estado: 'Estado de México',
    clubes: [
      { club: 'Club Cinegético Jaribú, A.C.', domicilio: 'Jilotzingo, Méx.' },
      { club: 'Club Cinegético El Sable, A.C.', domicilio: 'Capulhuac, Méx.' },
      { club: 'Club de Tiro y Caza la Cañada, A.C.', domicilio: 'Jilotzingo, Méx.' }
    ],
    totalEventos: 32
  },
  'MICHOACAN': {
    estado: 'Michoacán',
    clubes: [
      { club: 'Club Cinegético Halcones de Jacona, A.C.', domicilio: 'Jacona, Mich.' },
      { club: 'Club Cinegético Morelia, A.C.', domicilio: 'Capula, Mich.' }
    ],
    totalEventos: 14
  },
  'MORELOS': {
    estado: 'Morelos',
    clubes: [
      { club: 'Club Mexco de Perros de Muestra, A.C.', domicilio: 'Huitzilac, Mor.' }
    ],
    totalEventos: 50
  },
  'NAYARIT': {
    estado: 'Nayarit',
    clubes: [
      { club: 'Club Cinegético de Tepic, A.C.', domicilio: 'Santa María del Oro, Nay.' }
    ],
    totalEventos: 1
  },
  'NUEVO LEON': {
    estado: 'Nuevo León',
    clubes: [
      { club: 'Club Rifle y Caña de Nuevo León, A.C.D.', domicilio: 'García, N.L.' },
      { club: 'Club Asoc. Regiomontana de Caza y Tiro, A.C.', domicilio: 'Santa Catarina, N.L.' },
      { club: 'Club de Caza Tiro y Pesca San Nicolás de los Garza, A.C.', domicilio: 'Escobedo, N.L.' }
    ],
    totalEventos: 15
  },
  'SAN LUIS POTOSI': {
    estado: 'San Luis Potosí',
    clubes: [
      { club: 'Club Cinegético y de Tiro Halcones, A.C.', domicilio: 'El Tepetate, S.L.P.' }
    ],
    totalEventos: 10
  },
  'SINALOA': {
    estado: 'Sinaloa',
    clubes: [
      { club: 'Club de Caza y Pesca de Sinaloa, A.C.', domicilio: 'Culiacán, Sin.' },
      { club: 'Club de Tiro, Caza y Pesca Lic. Miguel Alemán, A.C.', domicilio: 'Culiacán, Sin.' }
    ],
    totalEventos: 16
  },
  'TABASCO': {
    estado: 'Tabasco',
    clubes: [
      { club: 'Club de Caza, Tiro y Pesca El Tigre, A.C.', domicilio: 'Villahermosa, Tab.' }
    ],
    totalEventos: 12
  },
  'TAMAULIPAS': {
    estado: 'Tamaulipas',
    clubes: [
      { club: 'Club Dptvo. Reynosa, A.C.', domicilio: 'Cd. Reynosa, Tamps.' },
      { club: 'Club Cinegético Nuevo Laredo A.C.', domicilio: 'Nuevo Laredo, Tamps.' }
    ],
    totalEventos: 5
  },
  'VERACRUZ': {
    estado: 'Veracruz',
    clubes: [
      { club: 'Club de Caza, Pesca y Tiro Jabatos A.C.', domicilio: 'Las Chopas, Ver.' }
    ],
    totalEventos: 24
  },
  'YUCATAN': {
    estado: 'Yucatán',
    clubes: [
      { club: 'Club de Caza, Tiro y Pesca de Yucatán A.C.', domicilio: 'Mérida, Yuc.' }
    ],
    totalEventos: 7
  }
};

// 18 estados únicos para TIRO PRACTICO (priorizando Yucatán y estados cercanos)
export const ESTADOS_TIRO_PRACTICO = [
  'YUCATAN',         // Base del club
  'TABASCO',         // Región Sureste
  'CHIAPAS',         // Región Sureste
  'VERACRUZ',        // Región Sureste
  'JALISCO',         // Mayor cantidad de eventos (208)
  'COAHUILA',        // Muchos eventos (63)
  'GUERRERO',        // Muchos eventos (63)
  'MORELOS',         // Eventos medios (50)
  'MEXICO',          // Eventos medios (32)
  'BAJA CALIFORNIA', // Eventos medios (25)
  'HIDALGO',         // Eventos medios (24)
  'SINALOA',         // Eventos medios (16)
  'NUEVO LEON',      // Eventos medios (15)
  'MICHOACAN',       // Eventos medios (14)
  'SAN LUIS POTOSI', // Pocos eventos (10)
  'TAMAULIPAS',      // Pocos eventos (5)
  'GUANAJUATO',      // Un evento (1)
  'NAYARIT'          // Un evento (1)
];

// 10 estados sugeridos para selección rápida (máximo permitido por SEDENA)
export const ESTADOS_SUGERIDOS_TIRO_PRACTICO = [
  'YUCATAN',       // Base del club
  'TABASCO',       // Región Sureste
  'CHIAPAS',       // Región Sureste
  'VERACRUZ',      // Región Sureste
  'JALISCO',       // Mayor cantidad (208 eventos)
  'COAHUILA',      // Muchos eventos (63)
  'GUERRERO',      // Muchos eventos (63)
  'MORELOS',       // Eventos medios (50)
  'MEXICO',        // Campeonato Nacional FEMETI
  'NUEVO LEON'     // Eventos medios (15)
];

// Meses en español para temporalidad
const MESES_ES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

/**
 * Calcula la temporalidad basada en la fecha de solicitud
 * Formato: "15 días después de solicitud - DIC 2026"
 * @param {Date|string} fechaSolicitud - Fecha de emisión de la solicitud
 * @returns {string} Temporalidad formateada (ej: "05 MAR - DIC 2026")
 */
export function calcularTemporalidad(fechaSolicitud) {
  const fecha = fechaSolicitud instanceof Date ? fechaSolicitud : new Date(fechaSolicitud);
  
  // Agregar 15 días a la fecha de solicitud
  const fechaInicio = new Date(fecha);
  fechaInicio.setDate(fechaInicio.getDate() + 15);
  
  const dia = String(fechaInicio.getDate()).padStart(2, '0');
  const mes = MESES_ES[fechaInicio.getMonth()];
  const año = fechaInicio.getFullYear();
  
  // El PETA de competencia siempre termina el 31 de diciembre del mismo año
  return `${dia} ${mes} - DIC ${año}`;
}

/**
 * Genera la matriz de clubes para el PDF de PETA
 * Formato RFA-LC-017: Estado | Club | Temporalidad | Domicilio
 * @param {string[]} estadosSeleccionados - Lista de estados a incluir
 * @param {Date|string} fechaSolicitud - Fecha de emisión para calcular temporalidad
 * @returns {Object[]} Array de filas para la matriz del PDF
 */
export function generarMatrizClubesPDF(estadosSeleccionados, fechaSolicitud = new Date()) {
  const matriz = [];
  const temporalidad = calcularTemporalidad(fechaSolicitud);
  
  estadosSeleccionados.forEach((estadoKey) => {
    // Normalizar la clave del estado (quitar acentos, mayúsculas)
    const estadoNormalizado = estadoKey
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace('Á', 'A')
      .replace('É', 'E')
      .replace('Í', 'I')
      .replace('Ó', 'O')
      .replace('Ú', 'U');
    
    const data = CLUBES_TIRO_PRACTICO_2026[estadoNormalizado];
    
    if (data) {
      // Agregar el primer club de cada estado
      const clubPrincipal = data.clubes[0];
      matriz.push({
        estado: data.estado,
        club: clubPrincipal.club,
        temporalidad: temporalidad,
        domicilio: clubPrincipal.domicilio
      });
    }
  });
  
  return matriz;
}

/**
 * Obtiene todos los clubes disponibles para un estado
 * @param {string} estadoKey - Clave del estado
 * @returns {Object[]} Array de clubes del estado
 */
export function obtenerClubesEstado(estadoKey) {
  const estadoNormalizado = estadoKey
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const data = CLUBES_TIRO_PRACTICO_2026[estadoNormalizado];
  return data ? data.clubes : [];
}

/**
 * Obtiene información de un estado específico
 * @param {string} estadoKey - Clave del estado
 * @returns {Object|null} Datos del estado o null si no existe
 */
export function obtenerDatosEstado(estadoKey) {
  const estadoNormalizado = estadoKey
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return CLUBES_TIRO_PRACTICO_2026[estadoNormalizado] || null;
}

export default {
  CLUBES_TIRO_PRACTICO_2026,
  ESTADOS_TIRO_PRACTICO,
  ESTADOS_SUGERIDOS_TIRO_PRACTICO,
  calcularTemporalidad,
  generarMatrizClubesPDF,
  obtenerClubesEstado,
  obtenerDatosEstado
};

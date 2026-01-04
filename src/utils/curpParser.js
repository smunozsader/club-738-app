/**
 * Parser de CURP - Extrae datos personales del código CURP
 * 
 * Estructura CURP (18 caracteres):
 * Pos 1-4:   Letras del nombre (Apellido1 + Apellido2 + Nombre)
 * Pos 5-10:  Fecha nacimiento (AAMMDD)
 * Pos 11:    Sexo (H=Hombre, M=Mujer)
 * Pos 12-13: Estado de nacimiento (clave 2 letras)
 * Pos 14-16: Consonantes internas
 * Pos 17-18: Dígito verificador RENAPO
 */

// Claves de estados de México
const ESTADOS_MEXICO = {
  'AS': { nombre: 'Aguascalientes', abrev: 'AGS' },
  'BC': { nombre: 'Baja California', abrev: 'BC' },
  'BS': { nombre: 'Baja California Sur', abrev: 'BCS' },
  'CC': { nombre: 'Campeche', abrev: 'CAM' },
  'CL': { nombre: 'Coahuila', abrev: 'COAH' },
  'CM': { nombre: 'Colima', abrev: 'COL' },
  'CS': { nombre: 'Chiapas', abrev: 'CHIS' },
  'CH': { nombre: 'Chihuahua', abrev: 'CHIH' },
  'DF': { nombre: 'Ciudad de México', abrev: 'CDMX' },
  'DG': { nombre: 'Durango', abrev: 'DGO' },
  'GT': { nombre: 'Guanajuato', abrev: 'GTO' },
  'GR': { nombre: 'Guerrero', abrev: 'GRO' },
  'HG': { nombre: 'Hidalgo', abrev: 'HGO' },
  'JC': { nombre: 'Jalisco', abrev: 'JAL' },
  'MC': { nombre: 'Estado de México', abrev: 'MEX' },
  'MN': { nombre: 'Michoacán', abrev: 'MICH' },
  'MS': { nombre: 'Morelos', abrev: 'MOR' },
  'NT': { nombre: 'Nayarit', abrev: 'NAY' },
  'NL': { nombre: 'Nuevo León', abrev: 'NL' },
  'OC': { nombre: 'Oaxaca', abrev: 'OAX' },
  'PL': { nombre: 'Puebla', abrev: 'PUE' },
  'QT': { nombre: 'Querétaro', abrev: 'QRO' },
  'QR': { nombre: 'Quintana Roo', abrev: 'QROO' },
  'SP': { nombre: 'San Luis Potosí', abrev: 'SLP' },
  'SL': { nombre: 'Sinaloa', abrev: 'SIN' },
  'SR': { nombre: 'Sonora', abrev: 'SON' },
  'TC': { nombre: 'Tabasco', abrev: 'TAB' },
  'TS': { nombre: 'Tamaulipas', abrev: 'TAMPS' },
  'TL': { nombre: 'Tlaxcala', abrev: 'TLAX' },
  'VZ': { nombre: 'Veracruz', abrev: 'VER' },
  'YN': { nombre: 'Yucatán', abrev: 'YUC' },
  'ZS': { nombre: 'Zacatecas', abrev: 'ZAC' },
  'NE': { nombre: 'Nacido en el Extranjero', abrev: 'EXT' }
};

/**
 * Parsea una CURP y extrae sus componentes
 * @param {string} curp - CURP de 18 caracteres
 * @returns {object} Datos extraídos o null si es inválida
 */
export function parseCURP(curp) {
  if (!curp || typeof curp !== 'string') return null;
  
  // Limpiar y normalizar
  curp = curp.toUpperCase().trim().replace(/\s/g, '');
  
  // Validar longitud
  if (curp.length !== 18) return null;
  
  // Extraer componentes
  const letrasNombre = curp.substring(0, 4);
  const fechaStr = curp.substring(4, 10);
  const sexo = curp.substring(10, 11);
  const estadoClave = curp.substring(11, 13);
  const consonantes = curp.substring(13, 16);
  const verificador = curp.substring(16, 18);
  
  // Parsear fecha de nacimiento
  let anio = parseInt(fechaStr.substring(0, 2));
  const mes = parseInt(fechaStr.substring(2, 4));
  const dia = parseInt(fechaStr.substring(4, 6));
  
  // Determinar siglo (si año <= 25 es 2000s, sino 1900s)
  // Para 2026, alguien nacido en "26" tendría 0 años, así que <= 26
  anio = anio <= 30 ? 2000 + anio : 1900 + anio;
  
  // Validar fecha
  const fechaNacimiento = new Date(anio, mes - 1, dia);
  if (isNaN(fechaNacimiento.getTime())) return null;
  
  // Calcular edad
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const diaActual = hoy.getDate();
  if (mesActual < mes - 1 || (mesActual === mes - 1 && diaActual < dia)) {
    edad--;
  }
  
  // Obtener estado
  const estado = ESTADOS_MEXICO[estadoClave] || { nombre: 'Desconocido', abrev: estadoClave };
  
  // Próximo cumpleaños
  let proximoCumple = new Date(hoy.getFullYear(), mes - 1, dia);
  if (proximoCumple < hoy) {
    proximoCumple = new Date(hoy.getFullYear() + 1, mes - 1, dia);
  }
  const diasParaCumple = Math.ceil((proximoCumple - hoy) / (1000 * 60 * 60 * 24));
  
  return {
    curp,
    letrasNombre,
    fechaNacimiento,
    fechaNacimientoStr: `${dia}/${mes}/${anio}`,
    dia,
    mes,
    anio,
    sexo: sexo === 'H' ? 'Masculino' : sexo === 'M' ? 'Femenino' : 'Desconocido',
    sexoCodigo: sexo,
    estadoClave,
    estadoNombre: estado.nombre,
    estadoAbrev: estado.abrev,
    edad,
    proximoCumple,
    diasParaCumple,
    esProximoCumple: diasParaCumple <= 30,
    esCumpleHoy: diasParaCumple === 0 || (diasParaCumple === 365 || diasParaCumple === 366),
    consonantes,
    verificador
  };
}

/**
 * Obtiene el signo zodiacal según la fecha
 */
export function getSignoZodiacal(mes, dia) {
  const signos = [
    { nombre: 'Capricornio', emoji: '♑', desde: [12, 22], hasta: [1, 19] },
    { nombre: 'Acuario', emoji: '♒', desde: [1, 20], hasta: [2, 18] },
    { nombre: 'Piscis', emoji: '♓', desde: [2, 19], hasta: [3, 20] },
    { nombre: 'Aries', emoji: '♈', desde: [3, 21], hasta: [4, 19] },
    { nombre: 'Tauro', emoji: '♉', desde: [4, 20], hasta: [5, 20] },
    { nombre: 'Géminis', emoji: '♊', desde: [5, 21], hasta: [6, 20] },
    { nombre: 'Cáncer', emoji: '♋', desde: [6, 21], hasta: [7, 22] },
    { nombre: 'Leo', emoji: '♌', desde: [7, 23], hasta: [8, 22] },
    { nombre: 'Virgo', emoji: '♍', desde: [8, 23], hasta: [9, 22] },
    { nombre: 'Libra', emoji: '♎', desde: [9, 23], hasta: [10, 22] },
    { nombre: 'Escorpio', emoji: '♏', desde: [10, 23], hasta: [11, 21] },
    { nombre: 'Sagitario', emoji: '♐', desde: [11, 22], hasta: [12, 21] },
  ];
  
  for (const signo of signos) {
    const [mesDesde, diaDesde] = signo.desde;
    const [mesHasta, diaHasta] = signo.hasta;
    
    if (mesDesde === 12 && mesHasta === 1) {
      // Capricornio cruza el año
      if ((mes === 12 && dia >= diaDesde) || (mes === 1 && dia <= diaHasta)) {
        return signo;
      }
    } else if (
      (mes === mesDesde && dia >= diaDesde) ||
      (mes === mesHasta && dia <= diaHasta) ||
      (mes > mesDesde && mes < mesHasta)
    ) {
      return signo;
    }
  }
  return { nombre: 'Desconocido', emoji: '❓' };
}

/**
 * Obtiene el nombre del mes en español
 */
export function getNombreMes(mes) {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return meses[mes - 1] || 'Desconocido';
}

/**
 * Agrupa datos de cumpleaños por mes
 */
export function agruparPorMes(sociosConCurp) {
  const porMes = {};
  
  for (let i = 1; i <= 12; i++) {
    porMes[i] = {
      mes: i,
      nombre: getNombreMes(i),
      socios: []
    };
  }
  
  sociosConCurp.forEach(socio => {
    if (socio.curpData && socio.curpData.mes) {
      porMes[socio.curpData.mes].socios.push(socio);
    }
  });
  
  // Ordenar socios por día dentro de cada mes
  Object.values(porMes).forEach(mesData => {
    mesData.socios.sort((a, b) => a.curpData.dia - b.curpData.dia);
  });
  
  return porMes;
}

/**
 * Obtiene próximos cumpleaños (próximos N días)
 */
export function getProximosCumples(sociosConCurp, dias = 30) {
  return sociosConCurp
    .filter(s => s.curpData && s.curpData.diasParaCumple <= dias)
    .sort((a, b) => a.curpData.diasParaCumple - b.curpData.diasParaCumple);
}

/**
 * Genera estadísticas demográficas
 */
export function getEstadisticasDemograficas(sociosConCurp) {
  const stats = {
    totalConCurp: sociosConCurp.length,
    porEstado: {},
    porDecada: {},
    porSexo: { Masculino: 0, Femenino: 0 },
    edadPromedio: 0,
    edadMinima: 999,
    edadMaxima: 0,
    socioMasJoven: null,
    socioMayor: null
  };
  
  let sumaEdades = 0;
  
  sociosConCurp.forEach(socio => {
    const data = socio.curpData;
    if (!data) return;
    
    // Por estado
    const estado = data.estadoNombre;
    stats.porEstado[estado] = (stats.porEstado[estado] || 0) + 1;
    
    // Por década
    const decada = Math.floor(data.anio / 10) * 10;
    stats.porDecada[decada] = (stats.porDecada[decada] || 0) + 1;
    
    // Por sexo
    if (data.sexo === 'Masculino' || data.sexo === 'Femenino') {
      stats.porSexo[data.sexo]++;
    }
    
    // Edades
    sumaEdades += data.edad;
    if (data.edad < stats.edadMinima) {
      stats.edadMinima = data.edad;
      stats.socioMasJoven = socio;
    }
    if (data.edad > stats.edadMaxima) {
      stats.edadMaxima = data.edad;
      stats.socioMayor = socio;
    }
  });
  
  stats.edadPromedio = sociosConCurp.length > 0 
    ? Math.round(sumaEdades / sociosConCurp.length) 
    : 0;
  
  // Ordenar estados por cantidad
  stats.estadosOrdenados = Object.entries(stats.porEstado)
    .sort((a, b) => b[1] - a[1])
    .map(([estado, cantidad]) => ({ estado, cantidad }));
  
  // Ordenar décadas
  stats.decadasOrdenadas = Object.entries(stats.porDecada)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([decada, cantidad]) => ({ decada: `${decada}s`, cantidad }));
  
  return stats;
}

export { ESTADOS_MEXICO };

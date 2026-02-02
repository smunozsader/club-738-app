/**
 * Límites legales de cartuchos según Artículo 50 de la 
 * Ley Federal de Armas de Fuego y Explosivos (LFAFE)
 * 
 * Reforma DOF 29-05-2025 - Incisos a) y b) reformados
 * 
 * Artículo 50.- La Secretaría, así como las personas físicas y morales 
 * con permiso general vigente, pueden vender únicamente en total por persona:
 * 
 * a) Hasta 500 cartuchos calibre .22", con excepción de Magnum, Hornet y TCM.
 *    NOTA: Las excepciones (.22 Magnum, .22 Hornet, .22 TCM) quedaron PROHIBIDAS
 *    en esta última reforma. Límite de 200 para esos calibres.
 * b) Hasta 1,000 cartuchos para escopeta de las permitidas por esta Ley.
 * c) Se deroga.
 * d) Hasta 200 cartuchos como máximo, para las otras armas permitidas.
 *    NOTA: Incluye rifles de alto poder (.223, .22-250, .222, 5.56 NATO, etc.)
 *    NO confundir calibre .223 con .22 LR.
 * 
 * Los periodos para comercialización de las cantidades de municiones son:
 * a) Anualmente, para la protección de domicilio y parcela;
 * b) Trimestralmente, para actividades cinegéticas (caza), y
 * c) Mensualmente, para tiro deportivo.
 * 
 * NOTA: Para PETAs se aplican los límites de compra trimestral (caza) 
 * o mensual (tiro deportivo), según la modalidad.
 */

/**
 * Tabla de límites máximos legales por tipo de arma/calibre
 */
export const LIMITES_LEGALES_CARTUCHOS = {
  '.22': {
    max: 500,
    default: 500,
    min: 50,
    step: 50,
    nota: 'Calibre .22" (excepto Magnum, Hornet, TCM)',
    articulo: 'Art. 50-a LFAFE'
  },
  'ESCOPETA': {
    max: 1000,
    default: 1000,
    min: 100,
    step: 100,
    nota: 'Escopetas permitidas (calibres 12, 16, 20, 28, .410)',
    articulo: 'Art. 50-b LFAFE'
  },
  'OTROS': {
    max: 200,
    default: 200,
    min: 50,
    step: 50,
    nota: 'Otras armas permitidas (pistolas, rifles)',
    articulo: 'Art. 50-d LFAFE'
  }
};

/**
 * Detecta el tipo de arma/calibre y retorna los límites aplicables
 * @param {string} calibre - Calibre del arma (ej: ".22 LR", "9mm", "12 GA")
 * @param {string} clase - Clase del arma (ej: "PISTOLA", "ESCOPETA", "RIFLE")
 * @returns {Object} { min, max, step, default, nota, articulo }
 */
export function getLimitesCartuchos(calibre, clase) {
  const c = (calibre || '').toString().toUpperCase().trim();
  const cl = (clase || '').toString().toUpperCase().trim();
  
  // 1. ESCOPETAS (prioridad: clase o calibre)
  // Detectar por clase
  if (cl.includes('ESCOPETA')) {
    return LIMITES_LEGALES_CARTUCHOS.ESCOPETA;
  }
  
  // Detectar por calibre (12, 16, 20, 28, .410)
  if (
    c.includes('12') || c.includes('16') || c.includes('20') || 
    c.includes('28') || c.includes('.410') || c.includes('GA') ||
    c.includes('GAUGE')
  ) {
    return LIMITES_LEGALES_CARTUCHOS.ESCOPETA;
  }
  
  // 2. CALIBRE .22 LR ÚNICAMENTE (excepto Magnum, Hornet, TCM y rifles de alto poder)
  // IMPORTANTE: Excluir calibres que CONTIENEN ".22" pero NO son .22 LR:
  // - .223 Remington (rifle alto poder)
  // - .22-250 (rifle alto poder)  
  // - .222 Remington (rifle alto poder)
  // Estos rifles tienen límite de 200 cartuchos (Art. 50-d)
  const es22LR = (
    (c.includes('.22') || c.includes('22 L') || c.includes('22LR')) &&
    !c.includes('MAGNUM') && 
    !c.includes('HORNET') && 
    !c.includes('TCM') &&
    !c.includes('.223') &&      // .223 Remington - rifle alto poder
    !c.includes('223') &&       // 223 REM sin punto
    !c.includes('.22-250') &&   // .22-250 - rifle alto poder
    !c.includes('22-250') &&    // 22-250 sin punto
    !c.includes('.222') &&      // .222 Remington - rifle alto poder
    !c.includes('5.56')         // 5.56 NATO (equivalente a .223)
  );
  
  if (es22LR) {
    return LIMITES_LEGALES_CARTUCHOS['.22'];
  }
  
  // 3. TODOS LOS DEMÁS (pistolas, rifles de alto poder, .22 Magnum, etc.)
  return LIMITES_LEGALES_CARTUCHOS.OTROS;
}

/**
 * Ajusta un valor de cartuchos al rango legal y múltiplo válido
 * @param {number} valor - Cantidad solicitada de cartuchos
 * @param {string} calibre - Calibre del arma
 * @param {string} clase - Clase del arma
 * @returns {number} Valor ajustado a límites legales
 */
export function ajustarCartuchos(valor, calibre, clase) {
  const limites = getLimitesCartuchos(calibre, clase);
  
  let v = Number(valor);
  if (!Number.isFinite(v) || v <= 0) {
    v = limites.default;
  }
  
  // Ajustar al múltiplo de step más cercano
  const rounded = Math.round(v / limites.step) * limites.step;
  
  // Asegurar que esté dentro de los límites
  return Math.min(limites.max, Math.max(limites.min, rounded));
}

/**
 * Calcula cartuchos por defecto según tipo de PETA
 * @param {string} calibre - Calibre del arma
 * @param {string} clase - Clase del arma
 * @param {string} tipoPETA - 'tiro', 'competencia', o 'caza'
 * @returns {number} Cantidad de cartuchos por defecto
 */
export function getCartuchosPorDefecto(calibre, clase, tipoPETA = 'tiro') {
  const limites = getLimitesCartuchos(calibre, clase);
  
  // Para tiro/competencia: usar el máximo permitido
  // Para caza: usar un valor intermedio razonable
  if (tipoPETA === 'caza') {
    // Caza típicamente usa menos cartuchos
    const esEscopeta = limites.max === 1000;
    return esEscopeta ? 200 : limites.default / 2;
  }
  
  // Tiro/competencia: máximo legal
  return limites.default;
}

/**
 * Valida si una cantidad de cartuchos es legal
 * @param {number} cartuchos - Cantidad a validar
 * @param {string} calibre - Calibre del arma
 * @param {string} clase - Clase del arma
 * @returns {Object} { valido: boolean, mensaje: string }
 */
export function validarCartuchos(cartuchos, calibre, clase) {
  const limites = getLimitesCartuchos(calibre, clase);
  
  if (cartuchos < limites.min) {
    return {
      valido: false,
      mensaje: `Mínimo legal: ${limites.min} cartuchos`
    };
  }
  
  if (cartuchos > limites.max) {
    return {
      valido: false,
      mensaje: `Máximo legal: ${limites.max} cartuchos (${limites.articulo})`
    };
  }
  
  if (cartuchos % limites.step !== 0) {
    return {
      valido: false,
      mensaje: `Debe ser múltiplo de ${limites.step}`
    };
  }
  
  return { valido: true, mensaje: 'OK' };
}

/**
 * Obtiene descripción legible de los límites para un arma
 * @param {string} calibre - Calibre del arma
 * @param {string} clase - Clase del arma
 * @returns {string} Descripción de límites
 */
export function getDescripcionLimites(calibre, clase) {
  const limites = getLimitesCartuchos(calibre, clase);
  return `${limites.min}-${limites.max} cartuchos (${limites.nota})`;
}

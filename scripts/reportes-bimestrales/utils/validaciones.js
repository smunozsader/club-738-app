/**
 * utils/validaciones.js
 * Funciones de validación para reportes bimestrales
 */

/**
 * Art. 50 LFAFE - Calibres permitidos
 */
const CALIBRES_PERMITIDOS = [
  '.22',
  '.22 LR',
  '.380',
  '.380 ACP',
  '9MM',
  '9mm',
  '.38',
  '.38 SPL',
  '38 SPL',
  '.357',
  '.357 MAG',
  '.223',
  '.223 REM',
];

/**
 * Validar si un calibre es permitido por Art. 50 SEDENA
 * @param {String} calibre - Calibre a validar
 * @returns {Boolean} true si está permitido
 */
function esCaliblePermitido(calibre) {
  if (!calibre) return false;

  const cal = calibre.trim().toUpperCase();
  return CALIBRES_PERMITIDOS.some(c => cal === c.toUpperCase());
}

/**
 * Validar formato de email
 * @param {String} email - Email a validar
 * @returns {Boolean} true si es válido
 */
function esEmailValido(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Normalizar email (convertir a minúsculas)
 * @param {String} email - Email a normalizar
 * @returns {String} Email normalizado
 */
function normalizarEmail(email) {
  return email.toLowerCase().trim();
}

/**
 * Validar mes bimestral
 * @param {Number} mes - Mes (1-12)
 * @returns {Boolean} true si es mes de reporte bimestral
 */
function esMesBimestral(mes) {
  const MESES_BIMESTRALES = [2, 4, 6, 8, 10, 12];
  return MESES_BIMESTRALES.includes(parseInt(mes));
}

/**
 * Obtener nombre de bimestre
 * @param {Number} mes - Mes (2,4,6,8,10,12)
 * @returns {String} Nombre del bimestre
 */
function obtenerNombreBimestre(mes) {
  const nombres = {
    2: 'Enero-Febrero',
    4: 'Marzo-Abril',
    6: 'Mayo-Junio',
    8: 'Julio-Agosto',
    10: 'Septiembre-Octubre',
    12: 'Noviembre-Diciembre',
  };
  return nombres[mes] || `Bimestre ${mes}`;
}

/**
 * Validar que una arma tenga datos mínimos requeridos
 * @param {Object} arma - Objeto arma
 * @returns {Object} { valida: Boolean, errores: Array }
 */
function validarArma(arma) {
  const errores = [];

  if (!arma.clase) errores.push('Falta clase de arma');
  if (!arma.calibre) errores.push('Falta calibre');
  if (!esCaliblePermitido(arma.calibre)) {
    errores.push(`Calibre ${arma.calibre} NO permitido por Art. 50 SEDENA`);
  }
  if (!arma.marca) errores.push('Falta marca');
  if (!arma.modelo) errores.push('Falta modelo');

  return {
    valida: errores.length === 0,
    errores,
  };
}

module.exports = {
  esCaliblePermitido,
  esEmailValido,
  normalizarEmail,
  esMesBimestral,
  obtenerNombreBimestre,
  validarArma,
  CALIBRES_PERMITIDOS,
};

/**
 * Utilidades para cálculo y validación de pagos e5cinco (SEDENA)
 * 
 * Fuente oficial: https://www.gob.mx/defensa/acciones-y-programas/formatos-de-pagos-e5-del-2023
 * Formato SEDENA: DEFENSA-02-045 (caza) / DEFENSA-02-046 (tiro/competencia)
 * 
 * Actualizado: Enero 2026
 */

// Clave de referencia oficial SEDENA (fija para todos los trámites PETA)
export const CLAVE_REFERENCIA_SEDENA = '034001132';

// Tabla oficial de montos según número de armas
export const TABLA_MONTOS_E5CINCO = {
  1: { monto: 1819, cadena: '00276660000000', descripcion: '1 a 3 armas' },
  2: { monto: 1819, cadena: '00276660000000', descripcion: '1 a 3 armas' },
  3: { monto: 1819, cadena: '00276660000000', descripcion: '1 a 3 armas' },
  4: { monto: 2423, cadena: '00276670000000', descripcion: '4 armas' },
  5: { monto: 3027, cadena: '00276670000000', descripcion: '5 armas' },
  6: { monto: 3631, cadena: '00276670000000', descripcion: '6 armas' },
  7: { monto: 4235, cadena: '00276670000000', descripcion: '7 armas' },
  8: { monto: 4839, cadena: '00276670000000', descripcion: '8 armas' },
  9: { monto: 5443, cadena: '00276670000000', descripcion: '9 armas' },
  10: { monto: 6047, cadena: '00276670000000', descripcion: '10 armas' }
};

/**
 * Calcula el monto de derecho e5cinco según número de armas
 * @param {number} numArmas - Número de armas en la solicitud PETA (1-10)
 * @returns {Object} { monto, cadena, claveReferencia, montoFormateado }
 */
export function calcularMontoE5cinco(numArmas) {
  if (!numArmas || numArmas < 1 || numArmas > 10) {
    throw new Error('El número de armas debe estar entre 1 y 10');
  }

  const info = TABLA_MONTOS_E5CINCO[numArmas];
  
  return {
    monto: info.monto,
    montoFormateado: `$${info.monto.toLocaleString('es-MX')}.00`,
    cadena: info.cadena,
    claveReferencia: CLAVE_REFERENCIA_SEDENA,
    descripcion: info.descripcion,
    numArmas
  };
}

/**
 * Valida si un monto pagado coincide con el esperado
 * @param {number} montoPagado - Monto que aparece en el recibo e5cinco
 * @param {number} numArmas - Número de armas en la PETA
 * @returns {boolean} true si coincide, false si no
 */
export function validarMontoPagado(montoPagado, numArmas) {
  const esperado = calcularMontoE5cinco(numArmas);
  return montoPagado === esperado.monto;
}

/**
 * Valida si una cadena de dependencia es correcta según número de armas
 * @param {string} cadena - Cadena de dependencia del recibo
 * @param {number} numArmas - Número de armas en la PETA
 * @returns {boolean} true si es correcta, false si no
 */
export function validarCadenaDependencia(cadena, numArmas) {
  const esperada = calcularMontoE5cinco(numArmas);
  return cadena === esperada.cadena;
}

/**
 * Obtiene mensaje de ayuda para el socio sobre el pago
 * @param {number} numArmas - Número de armas
 * @returns {string} Mensaje con instrucciones de pago
 */
export function obtenerMensajePago(numArmas) {
  const info = calcularMontoE5cinco(numArmas);
  
  return `Para ${numArmas} arma${numArmas > 1 ? 's' : ''}, el monto del derecho es de ${info.montoFormateado}

📋 Datos para pago e5cinco:
• Clave de referencia: ${info.claveReferencia}
• Cadena de dependencia: ${info.cadena}
• Monto: ${info.montoFormateado}

⚠️ IMPORTANTE: El recibo e5cinco debe mostrar exactamente este monto y esta cadena de dependencia.`;
}

/**
 * Genera objeto con toda la información de pago
 * @param {number} numArmas - Número de armas
 * @returns {Object} Objeto completo con info de pago
 */
export function obtenerInfoPagoCompleta(numArmas) {
  const base = calcularMontoE5cinco(numArmas);
  
  return {
    ...base,
    urlOficial: 'https://www.gob.mx/defensa/acciones-y-programas/formatos-de-pagos-e5-del-2023',
    formatoSEDENA: 'DEFENSA-02-045',
    vigencia: '2026',
    notas: [
      'El pago debe realizarse ANTES de presentar la solicitud',
      'El recibo e5cinco es un documento OBLIGATORIO',
      'Verificar que la cadena de dependencia sea correcta según número de armas',
      'El monto debe coincidir exactamente con la tabla oficial'
    ]
  };
}

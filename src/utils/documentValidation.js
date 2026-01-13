/**
 * Validación estricta de formatos de documentos para trámites PETA
 * 
 * Reglas de negocio:
 * - INE: Solo JPG/JPEG (ambas caras ampliadas 200%)
 * - RFA (Registros de armas): Solo PDF
 * - Documentos oficiales: Solo PDF
 * - Fotos: Solo JPG/JPEG (fondo blanco, tamaño infantil)
 * 
 * @module utils/documentValidation
 */

// ============================================================================
// CONSTANTES DE VALIDACIÓN
// ============================================================================

/**
 * Tamaño máximo de archivos en bytes
 */
const TAMANIOS_MAX = {
  INE: 5 * 1024 * 1024,           // 5MB (JPG comprimido)
  RFA: 10 * 1024 * 1024,          // 10MB (PDF puede ser escaneo)
  DOCUMENTO_PDF: 5 * 1024 * 1024, // 5MB (PDF estándar)
  FOTO: 2 * 1024 * 1024           // 2MB (JPG de foto infantil)
};

/**
 * Definición completa de reglas de validación por tipo de documento
 */
export const REGLAS_DOCUMENTOS = {
  // Identificación oficial
  ine: {
    formatos: ['jpg', 'jpeg'],
    tamañoMax: TAMANIOS_MAX.INE,
    requiereAmbasCaras: true,
    descripcion: 'INE (Credencial para Votar)',
    instrucciones: 'Sube ambas caras de tu INE en formato JPG. Foto ampliada al 200% de tamaño original.',
    mensaje: 'INE debe ser JPG o JPEG, máximo 5MB. Se requieren ambas caras ampliadas al 200%.'
  },
  
  // Registros de armas (SEDENA)
  rfa: {
    formatos: ['pdf'],
    tamañoMax: TAMANIOS_MAX.RFA,
    descripcion: 'Registro Federal de Armas (RFA)',
    instrucciones: 'Sube el PDF del RFA emitido por SEDENA. Máximo 10MB.',
    mensaje: 'Registro de Armas debe ser PDF, máximo 10MB.'
  },
  
  // Documentos oficiales en PDF
  curp: {
    formatos: ['pdf'],
    tamañoMax: TAMANIOS_MAX.DOCUMENTO_PDF,
    descripcion: 'CURP (Clave Única de Registro de Población)',
    instrucciones: 'Descarga tu CURP en formato PDF desde la página oficial de RENAPO.',
    mensaje: 'CURP debe ser PDF, máximo 5MB.'
  },
  
  constanciaAntecedentes: {
    formatos: ['pdf'],
    tamañoMax: TAMANIOS_MAX.DOCUMENTO_PDF,
    descripcion: 'Constancia de Antecedentes Penales',
    instrucciones: 'Descarga la constancia en PDF desde la plataforma oficial de OADPRS.',
    mensaje: 'Constancia de Antecedentes debe ser PDF, máximo 5MB.'
  },
  
  cartillaMilitar: {
    formatos: ['pdf'],
    tamañoMax: TAMANIOS_MAX.DOCUMENTO_PDF,
    descripcion: 'Cartilla del Servicio Militar Nacional',
    instrucciones: 'Escanea tu cartilla militar liberada y guárdala en PDF.',
    mensaje: 'Cartilla Militar debe ser PDF, máximo 5MB.'
  },
  
  actaNacimiento: {
    formatos: ['pdf'],
    tamañoMax: TAMANIOS_MAX.DOCUMENTO_PDF,
    descripcion: 'Acta de Nacimiento',
    instrucciones: 'Escanea tu acta de nacimiento y guárdala en PDF.',
    mensaje: 'Acta de Nacimiento debe ser PDF, máximo 5MB.'
  },
  
  comprobanteDomicilio: {
    formatos: ['pdf'],
    tamañoMax: TAMANIOS_MAX.DOCUMENTO_PDF,
    descripcion: 'Comprobante de Domicilio',
    instrucciones: 'Escanea tu comprobante de domicilio (luz, agua, teléfono) no mayor a 3 meses y guárdalo en PDF.',
    mensaje: 'Comprobante de Domicilio debe ser PDF, máximo 5MB.'
  },
  
  certificadoMedico: {
    formatos: ['pdf'],
    tamañoMax: TAMANIOS_MAX.DOCUMENTO_PDF,
    descripcion: 'Certificado Médico',
    instrucciones: 'Certificado médico original escaneado en PDF.',
    mensaje: 'Certificado Médico debe ser PDF, máximo 5MB.'
  },
  
  certificadoPsicologico: {
    formatos: ['pdf'],
    tamañoMax: TAMANIOS_MAX.DOCUMENTO_PDF,
    descripcion: 'Certificado Psicológico',
    instrucciones: 'Certificado psicológico original escaneado en PDF.',
    mensaje: 'Certificado Psicológico debe ser PDF, máximo 5MB.'
  },
  
  certificadoToxicologico: {
    formatos: ['pdf'],
    tamañoMax: TAMANIOS_MAX.DOCUMENTO_PDF,
    descripcion: 'Certificado Toxicológico',
    instrucciones: 'Certificado toxicológico original escaneado en PDF.',
    mensaje: 'Certificado Toxicológico debe ser PDF, máximo 5MB.'
  },
  
  modoHonesto: {
    formatos: ['pdf'],
    tamañoMax: TAMANIOS_MAX.DOCUMENTO_PDF,
    descripcion: 'Carta de Modo Honesto de Vivir',
    instrucciones: 'Carta original escaneada en PDF. El club proporciona el formato.',
    mensaje: 'Carta de Modo Honesto debe ser PDF, máximo 5MB.'
  },
  
  licenciaCaza: {
    formatos: ['pdf'],
    tamañoMax: TAMANIOS_MAX.DOCUMENTO_PDF,
    descripcion: 'Licencia de Caza SEMARNAT',
    instrucciones: 'Licencia de caza vigente escaneada en PDF (solo para modalidad CAZA).',
    mensaje: 'Licencia de Caza debe ser PDF, máximo 5MB.'
  },
  
  reciboE5cinco: {
    formatos: ['pdf'],
    tamañoMax: TAMANIOS_MAX.DOCUMENTO_PDF,
    descripcion: 'Recibo de Pago e5cinco',
    instrucciones: 'Comprobante de pago de derechos SEDENA en PDF.',
    mensaje: 'Recibo e5cinco debe ser PDF, máximo 5MB.'
  },
  
  permisoAnterior: {
    formatos: ['pdf'],
    tamañoMax: TAMANIOS_MAX.DOCUMENTO_PDF,
    descripcion: 'Permiso PETA Anterior',
    instrucciones: 'PETA anterior en PDF (solo para renovaciones).',
    mensaje: 'Permiso Anterior debe ser PDF, máximo 5MB.'
  },
  
  // Fotografías
  fotoCredencial: {
    formatos: ['jpg', 'jpeg'],
    tamañoMax: TAMANIOS_MAX.FOTO,
    descripcion: 'Fotografía para Credencial',
    instrucciones: 'Foto tamaño infantil, fondo blanco, en JPG. 4 fotos físicas + 1 digital.',
    mensaje: 'Fotografía debe ser JPG o JPEG, máximo 2MB, fondo blanco.'
  },
  
  // Registros de armas individuales (usado en ArmasRegistroUploader)
  registroArma: {
    formatos: ['pdf'],
    tamañoMax: TAMANIOS_MAX.RFA,
    descripcion: 'Registro Federal de Armas (Individual)',
    instrucciones: 'Sube el PDF del RFA para esta arma específica.',
    mensaje: 'Registro de Arma debe ser PDF, máximo 10MB.'
  }
};

// ============================================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================================

/**
 * Formatea bytes a unidad legible (KB, MB)
 * @param {number} bytes - Tamaño en bytes
 * @returns {string} Tamaño formateado
 */
function formatearTamaño(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Obtiene la extensión de un archivo
 * @param {string} filename - Nombre del archivo
 * @returns {string} Extensión en minúsculas
 */
function obtenerExtension(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

/**
 * Valida un archivo contra las reglas definidas para su tipo
 * 
 * @param {string} tipoDocumento - Tipo de documento (ej: 'ine', 'rfa', 'curp')
 * @param {File} archivo - Objeto File del navegador
 * @returns {Object} Resultado de validación
 * @returns {boolean} returns.valido - true si pasa todas las validaciones
 * @returns {string} [returns.error] - Mensaje de error si no es válido
 * @returns {string} [returns.advertencia] - Mensaje de advertencia (opcional)
 * 
 * @example
 * const resultado = validarDocumento('ine', archivo);
 * if (!resultado.valido) {
 *   alert(resultado.error);
 *   return;
 * }
 */
export function validarDocumento(tipoDocumento, archivo) {
  // Verificar que existe el archivo
  if (!archivo) {
    return {
      valido: false,
      error: 'No se seleccionó ningún archivo.'
    };
  }
  
  // Obtener reglas para este tipo de documento
  const regla = REGLAS_DOCUMENTOS[tipoDocumento];
  
  // Si no hay reglas definidas, permitir cualquier archivo (retrocompatibilidad)
  if (!regla) {
    console.warn(`⚠️ No hay reglas de validación definidas para: ${tipoDocumento}`);
    return { valido: true };
  }
  
  // Obtener extensión del archivo
  const extension = obtenerExtension(archivo.name);
  
  // VALIDACIÓN 1: Formato de archivo
  if (!regla.formatos.includes(extension)) {
    const formatosPermitidos = regla.formatos.map(f => f.toUpperCase()).join(' o ');
    return {
      valido: false,
      error: `❌ Formato incorrecto\n\n` +
             `El archivo "${archivo.name}" tiene formato .${extension.toUpperCase()}\n\n` +
             `${regla.descripcion} debe ser ${formatosPermitidos}.\n\n` +
             `${regla.mensaje}`
    };
  }
  
  // VALIDACIÓN 2: Tamaño de archivo
  if (archivo.size > regla.tamañoMax) {
    const tamañoArchivo = formatearTamaño(archivo.size);
    const tamañoMax = formatearTamaño(regla.tamañoMax);
    return {
      valido: false,
      error: `❌ Archivo muy grande\n\n` +
             `El archivo "${archivo.name}" pesa ${tamañoArchivo}\n\n` +
             `El tamaño máximo permitido es ${tamañoMax}.\n\n` +
             `Por favor comprime el archivo o escanea con menor resolución.`
    };
  }
  
  // VALIDACIÓN 3: Advertencias específicas por tipo
  let advertencia = null;
  
  if (tipoDocumento === 'ine') {
    advertencia = '⚠️ Recuerda subir AMBAS caras de tu INE ampliadas al 200%.';
  } else if (tipoDocumento === 'fotoCredencial') {
    advertencia = '⚠️ Verifica que la foto tenga fondo blanco y sea tamaño infantil.';
  } else if (tipoDocumento === 'comprobanteDomicilio') {
    advertencia = '⚠️ El comprobante de domicilio no debe ser mayor a 3 meses.';
  }
  
  // Validación exitosa
  return {
    valido: true,
    advertencia
  };
}

/**
 * Valida múltiples archivos de un mismo tipo
 * Útil para cuando se suben varias fotos o documentos a la vez
 * 
 * @param {string} tipoDocumento - Tipo de documento
 * @param {FileList|Array<File>} archivos - Lista de archivos
 * @returns {Object} Resultado de validación
 * @returns {boolean} returns.valido - true si TODOS pasan validación
 * @returns {Array<Object>} returns.resultados - Array con resultado individual por archivo
 * @returns {string} [returns.errorGeneral] - Mensaje de error general si alguno falla
 */
export function validarMultiplesArchivos(tipoDocumento, archivos) {
  const resultados = [];
  let todoValido = true;
  let primerError = null;
  
  for (let i = 0; i < archivos.length; i++) {
    const resultado = validarDocumento(tipoDocumento, archivos[i]);
    resultados.push({
      archivo: archivos[i].name,
      ...resultado
    });
    
    if (!resultado.valido) {
      todoValido = false;
      if (!primerError) {
        primerError = resultado.error;
      }
    }
  }
  
  return {
    valido: todoValido,
    resultados,
    errorGeneral: primerError
  };
}

/**
 * Obtiene las instrucciones de subida para un tipo de documento
 * @param {string} tipoDocumento - Tipo de documento
 * @returns {string} Instrucciones formateadas
 */
export function obtenerInstrucciones(tipoDocumento) {
  const regla = REGLAS_DOCUMENTOS[tipoDocumento];
  if (!regla) return '';
  
  return `${regla.descripcion}\n${regla.instrucciones}`;
}

/**
 * Verifica si un tipo de documento requiere formato específico
 * @param {string} tipoDocumento - Tipo de documento
 * @param {string} formato - Formato a verificar ('pdf', 'jpg', 'jpeg')
 * @returns {boolean} true si el formato es permitido
 */
export function formatoPermitido(tipoDocumento, formato) {
  const regla = REGLAS_DOCUMENTOS[tipoDocumento];
  if (!regla) return true; // Si no hay regla, permitir
  
  return regla.formatos.includes(formato.toLowerCase());
}

/**
 * Lista de tipos de documentos que SOLO aceptan PDF
 */
export const DOCUMENTOS_SOLO_PDF = [
  'rfa',
  'registroArma',
  'curp',
  'constanciaAntecedentes',
  'cartillaMilitar',
  'actaNacimiento',
  'comprobanteDomicilio',
  'certificadoMedico',
  'certificadoPsicologico',
  'certificadoToxicologico',
  'modoHonesto',
  'licenciaCaza',
  'reciboE5cinco',
  'permisoAnterior'
];

/**
 * Lista de tipos de documentos que SOLO aceptan JPG/JPEG
 */
export const DOCUMENTOS_SOLO_JPG = [
  'ine',
  'fotoCredencial'
];

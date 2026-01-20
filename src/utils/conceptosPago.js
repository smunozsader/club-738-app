/**
 * Configuración de conceptos de pago y montos para 2026
 * Este archivo centraliza todos los valores que pueden cambiar anualmente
 * o según políticas del club
 */

export const CONCEPTOS_PAGO_2026 = {
  cuota_anual: {
    nombre: 'Cuota Anual 2026',
    monto: 6500,  // Actualizado: antes 6000, ahora 6500
    descripcion: 'Membresía anual del club'
  },
  
  femeti: {
    nombre: 'FEMETI Socio (Renovación)',
    monto: 350,
    descripcion: 'Federación Mexicana de Tiro y Caza - Renovación'
  },
  
  inscripcion: {
    nombre: 'Inscripción (Solo Nuevos)',
    monto: 2000,
    descripcion: 'Cuota de inscripción para nuevos miembros'
  },
  
  femeti_nuevo: {
    nombre: 'FEMETI Nuevo Ingreso',
    monto: 700,
    descripcion: 'Federación Mexicana de Tiro y Caza - Primer ingreso'
  }
};

/**
 * Métodos de pago disponibles
 */
export const METODOS_PAGO = [
  { id: 'efectivo', nombre: 'Efectivo' },
  { id: 'transferencia', nombre: 'Transferencia Bancaria' },
  { id: 'tarjeta', nombre: 'Tarjeta' },
  { id: 'cheque', nombre: 'Cheque' }
];

/**
 * Función para obtener el monto total de conceptos seleccionados
 * @param {Object} conceptosSeleccionados - Objeto con boolean para cada concepto
 * @returns {number} Monto total
 */
export function calcularTotalPago(conceptosSeleccionados) {
  let total = 0;
  Object.keys(conceptosSeleccionados).forEach(concepto => {
    if (conceptosSeleccionados[concepto] && CONCEPTOS_PAGO_2026[concepto]) {
      total += CONCEPTOS_PAGO_2026[concepto].monto;
    }
  });
  return total;
}

/**
 * Combos predefinidos para facilitar registro rápido
 */
export const COMBOS_PAGO = {
  socio_nuevo: {
    nombre: 'Socio Nuevo',
    descripcion: 'Inscripción + Cuota Anual + FEMETI',
    conceptos: {
      inscripcion: true,
      cuota_anual: true,
      femeti_nuevo: true,
      femeti: false
    }
  },
  
  socio_existente_full: {
    nombre: 'Socio Existente (Completo)',
    descripcion: 'Cuota Anual + FEMETI',
    conceptos: {
      inscripcion: false,
      cuota_anual: true,
      femeti: true,
      femeti_nuevo: false
    }
  },
  
  socio_existente_sin_femeti: {
    nombre: 'Socio Existente (Sin FEMETI)',
    descripcion: 'Solo Cuota Anual',
    conceptos: {
      inscripcion: false,
      cuota_anual: true,
      femeti: false,
      femeti_nuevo: false
    }
  }
};

/**
 * Historial de cambios de montos
 * Para auditoría y referencia histórica
 */
export const HISTORIAL_MONTOS = {
  '2025': {
    cuota_anual: 6000,
    femeti: 350,
    inscripcion: 2000,
    femeti_nuevo: 700
  },
  '2026': {
    cuota_anual: 6500,  // Cambio: 6000 → 6500
    femeti: 350,
    inscripcion: 2000,
    femeti_nuevo: 700
  }
};

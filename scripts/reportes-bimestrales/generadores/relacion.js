/**
 * generadores/relacion.js
 * Genera RELACIÓN: detalle por arma (una fila por arma)
 */

import XLSX from 'xlsx';

/**
 * Generar RELACIÓN - detalle completo de armas
 * @param {Object} db - Firestore instance
 * @param {Number} mes - Mes del bimestre (2,4,6,8,10,12)
 * @param {Number} año - Año
 * @returns {Object} Workbook XLSX
 */
async function generarRelacion(db, mes, año) {
  try {
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.get();

    if (snapshot.empty) {
      throw new Error('No hay socios registrados');
    }

    // Headers de la RELACIÓN
    const headers = [
      'Socio (Email)',
      'Nombre',
      'Clase Arma',
      'Calibre',
      'Marca',
      'Modelo',
      'Matrícula',
      'Folio RFA',
      'Modalidad',
      'Estado',
    ];

    const rows = [];
    let totalArmas = 0;

    // Iterar socios
    for (const docSnap of snapshot.docs) {
      const socio = docSnap.data();
      const email = docSnap.id;
      const nombre = socio.nombre || 'N/A';

      // Obtener armas del socio
      const armasRef = db.collection('socios').doc(email).collection('armas');
      const armasSnapshot = await armasRef.get();

      if (armasSnapshot.empty) {
        // Si no tiene armas, agregar fila vacía
        rows.push([
          email,
          nombre,
          '-',
          '-',
          '-',
          '-',
          '-',
          '-',
          '-',
          'SIN ARMAS',
        ]);
      } else {
        // Agregar una fila por arma
        for (const armaSnap of armasSnapshot.docs) {
          const arma = armaSnap.data();
          rows.push([
            email,
            nombre,
            arma.clase || 'N/A',
            arma.calibre || 'N/A',
            arma.marca || 'N/A',
            arma.modelo || 'N/A',
            arma.matricula || 'N/A',
            arma.folio || 'N/A',
            arma.modalidad || 'N/A',
            'REGISTRADA',
          ]);
          totalArmas++;
        }
      }
    }

    // Crear worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Configurar ancho de columnas
    ws['!cols'] = [
      { wch: 20 }, // Socio
      { wch: 25 }, // Nombre
      { wch: 25 }, // Clase
      { wch: 12 }, // Calibre
      { wch: 15 }, // Marca
      { wch: 15 }, // Modelo
      { wch: 15 }, // Matrícula
      { wch: 15 }, // Folio
      { wch: 15 }, // Modalidad
      { wch: 15 }, // Estado
    ];

    // Crear workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RELACIÓN');

    // Agregar hoja de resumen
    const resumenRows = [
      ['RESUMEN DE RELACIÓN'],
      [],
      ['Total Socios:', snapshot.size],
      ['Total Armas:', totalArmas],
      ['Fecha Generación:', new Date().toLocaleString('es-MX')],
      ['Período:', `Bimestre ${mes.toString().padStart(2, '0')}/${año}`],
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenRows);
    wsResumen['!cols'] = [{ wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    return wb;
  } catch (error) {
    console.error('❌ Error en generarRelacion:', error.message);
    throw error;
  }
}

export default generarRelacion;

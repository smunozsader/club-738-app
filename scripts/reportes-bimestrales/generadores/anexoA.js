/**
 * generadores/anexoA.js
 * Genera ANEXO A: resumen por socio con conteos
 */

import XLSX from 'xlsx';

/**
 * Generar ANEXO A - resumen por socio
 * @param {Object} db - Firestore instance
 * @param {Number} mes - Mes del bimestre
 * @param {Number} año - Año
 * @returns {Object} Workbook XLSX
 */
async function generarAnexoA(db, mes, año) {
  try {
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.get();

    if (snapshot.empty) {
      throw new Error('No hay socios registrados');
    }

    const headers = [
      'Credencial',
      'Socio (Email)',
      'Nombre Completo',
      'Teléfono',
      'Total Armas',
      'Rifles',
      'Escopetas',
      'Pistolas',
      'Revólveres',
      'Modalidad Principal',
      'Estado Membresía',
    ];

    const rows = [];
    let totalSocios = 0;
    let totalArmas = 0;

    for (const docSnap of snapshot.docs) {
      const socio = docSnap.data();
      const email = docSnap.id;
      const credencial = socio.credencial || socio.numero_socio || 'N/A';
      const telefono = socio.telefono || 'N/A';

      // Contar armas por tipo
      const armasRef = db.collection('socios').doc(email).collection('armas');
      const armasSnapshot = await armasRef.get();

      let contadores = {
        total: armasSnapshot.size,
        rifles: 0,
        escopetas: 0,
        pistolas: 0,
        revolveres: 0,
      };

      // Contar por tipo
      for (const armaSnap of armasSnapshot.docs) {
        const arma = armaSnap.data();
        const tipo = (arma.type_group || arma.clase || '').toUpperCase();

        if (tipo.includes('RIFLE')) contadores.rifles++;
        else if (tipo.includes('ESCOPETA')) contadores.escopetas++;
        else if (tipo.includes('PISTOLA')) contadores.pistolas++;
        else if (tipo.includes('REVOLVER')) contadores.revolveres++;
      }

      rows.push([
        credencial,
        email,
        socio.nombre || 'N/A',
        telefono,
        contadores.total,
        contadores.rifles,
        contadores.escopetas,
        contadores.pistolas,
        contadores.revolveres,
        socio.modalidad || 'N/A',
        socio.estado_membresia || 'Activo',
      ]);

      totalSocios++;
      totalArmas += contadores.total;
    }

    // Ordenar por credencial (columna 0) en forma ascendente
    rows.sort((a, b) => {
      const credA = String(a[0]).toLowerCase();
      const credB = String(b[0]).toLowerCase();
      return credA.localeCompare(credB);
    });

    // Crear worksheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    ws['!cols'] = [
      { wch: 12 }, // Credencial
      { wch: 20 }, // Email
      { wch: 25 }, // Nombre
      { wch: 15 }, // Teléfono
      { wch: 12 }, // Total
      { wch: 10 }, // Rifles
      { wch: 12 }, // Escopetas
      { wch: 12 }, // Pistolas
      { wch: 12 }, // Revólveres
      { wch: 18 }, // Modalidad
      { wch: 15 }, // Estado
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ANEXO A');

    // Hoja de resumen
    const resumenRows = [
      ['RESUMEN ANEXO A - Por Socio'],
      [],
      ['Total Socios:', totalSocios],
      ['Total Armas:', totalArmas],
      ['Promedio Armas/Socio:', (totalArmas / totalSocios || 0).toFixed(2)],
      [],
      ['Distribución por Tipo:'],
      ['Rifles:', rows.reduce((sum, r) => sum + r[3], 0)],
      ['Escopetas:', rows.reduce((sum, r) => sum + r[4], 0)],
      ['Pistolas:', rows.reduce((sum, r) => sum + r[5], 0)],
      ['Revólveres:', rows.reduce((sum, r) => sum + r[6], 0)],
      [],
      ['Fecha Generación:', new Date().toLocaleString('es-MX')],
      ['Período:', `Bimestre ${mes.toString().padStart(2, '0')}/${año}`],
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenRows);
    wsResumen['!cols'] = [{ wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

    return wb;
  } catch (error) {
    console.error('❌ Error en generarAnexoA:', error.message);
    throw error;
  }
}

export default generarAnexoA;

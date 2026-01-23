/**
 * generadores/anexoB.js
 * Genera ANEXO B: cédula de totales con fórmulas
 */

import XLSX from 'xlsx';

/**
 * Generar ANEXO B - cédula de totales
 * @param {Object} db - Firestore instance
 * @param {Number} mes - Mes del bimestre
 * @param {Number} año - Año
 * @returns {Object} Workbook XLSX
 */
async function generarAnexoB(db, mes, año) {
  try {
    const sociosRef = db.collection('socios');
    const snapshot = await sociosRef.get();

    if (snapshot.empty) {
      throw new Error('No hay socios registrados');
    }

    // Contar totales
    let totalSocios = snapshot.size;
    let totalArmas = 0;
    let contadores = {
      rifles: 0,
      escopetas: 0,
      pistolas: 0,
      revolveres: 0,
      otros: 0,
      cazadores: 0,
      tiradores: 0,
      ambas_modalidades: 0,
    };

    for (const docSnap of snapshot.docs) {
      const socio = docSnap.data();
      const email = docSnap.id;

      // Contar modalidades
      const modalidad = (socio.modalidad || '').toLowerCase();
      if (modalidad.includes('caza')) contadores.cazadores++;
      if (modalidad.includes('tiro')) contadores.tiradores++;
      if (modalidad.includes('ambas') || (modalidad.includes('caza') && modalidad.includes('tiro'))) {
        contadores.ambas_modalidades++;
      }

      // Contar armas
      const armasRef = db.collection('socios').doc(email).collection('armas');
      const armasSnapshot = await armasRef.get();

      for (const armaSnap of armasSnapshot.docs) {
        const arma = armaSnap.data();
        const tipo = (arma.type_group || arma.clase || '').toUpperCase();

        totalArmas++;

        if (tipo.includes('RIFLE')) contadores.rifles++;
        else if (tipo.includes('ESCOPETA')) contadores.escopetas++;
        else if (tipo.includes('PISTOLA')) contadores.pistolas++;
        else if (tipo.includes('REVOLVER')) contadores.revolveres++;
        else contadores.otros++;
      }
    }

    // Construir cédula
    const cedula = [
      ['CÉDULA DE TOTALES - REPORTE BIMESTRAL SEDENA'],
      [],
      ['I. INFORMACIÓN GENERAL'],
      ['Total de Socios Registrados:', totalSocios],
      ['Total de Armas Registradas:', totalArmas],
      ['Promedio Armas/Socio:', (totalArmas / totalSocios || 0).toFixed(2)],
      [],
      ['II. DISTRIBUCIÓN DE ARMAS POR TIPO'],
      ['Rifles:', contadores.rifles],
      ['Escopetas:', contadores.escopetas],
      ['Pistolas:', contadores.pistolas],
      ['Revólveres:', contadores.revolveres],
      ['Otros:', contadores.otros],
      [],
      ['III. DISTRIBUCIÓN POR MODALIDAD'],
      ['Solo Cazadores:', contadores.cazadores],
      ['Solo Tiradores:', contadores.tiradores],
      ['Ambas Modalidades:', contadores.ambas_modalidades],
      [],
      ['IV. INFORMACIÓN DEL REPORTE'],
      ['Período:', `Bimestre ${mes.toString().padStart(2, '0')}/${año}`],
      ['Fecha de Generación:', new Date().toLocaleString('es-MX')],
      ['Generado por:', 'Sistema Automatizado'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(cedula);
    ws['!cols'] = [{ wch: 40 }, { wch: 20 }];

    // Aplicar estilos (negrita en headers)
    ws['A1'].s = { font: { bold: true, size: 14 } };
    ws['A3'].s = { font: { bold: true } };
    ws['A8'].s = { font: { bold: true } };
    ws['A15'].s = { font: { bold: true } };
    ws['A20'].s = { font: { bold: true } };

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ANEXO B');

    // Hoja de cálculos (con fórmulas si es necesario)
    const calcRows = [
      ['TABLA DE CÁLCULOS DINÁMICOS'],
      [],
      ['Concepto', 'Valor', 'Fórmula'],
      ['Total Socios', totalSocios, `=B3`],
      ['Total Armas', totalArmas, `=B4`],
      ['Prom Armas/Socio', (totalArmas / totalSocios || 0).toFixed(2), `=B4/B3`],
    ];

    const wsCalc = XLSX.utils.aoa_to_sheet(calcRows);
    wsCalc['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsCalc, 'Cálculos');

    return wb;
  } catch (error) {
    console.error('❌ Error en generarAnexoB:', error.message);
    throw error;
  }
}

export default generarAnexoB;

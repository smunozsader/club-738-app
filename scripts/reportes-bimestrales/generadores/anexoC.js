/**
 * generadores/anexoC.js
 * Genera ANEXO C: información del club + totales dinámicos
 */

import XLSX from 'xlsx';

/**
 * Generar ANEXO C - info del club
 * @param {Object} db - Firestore instance
 * @param {Number} mes - Mes del bimestre
 * @param {Number} año - Año
 * @returns {Object} Workbook XLSX
 */
async function generarAnexoC(db, mes, año) {
  try {
    // Obtener información del club
    const configRef = db.collection('config').doc('club_info');
    const configSnap = await configRef.get();
    const clubInfo = configSnap.exists ? configSnap.data() : {};

    // Contar socios y armas
    const sociosRef = db.collection('socios');
    const sociosSnapshot = await sociosRef.get();

    let totalSocios = sociosSnapshot.size;
    let totalArmas = 0;
    let socios_activos = 0;
    let socios_pagados = 0;

    const contadoresPorTipo = {
      'RIFLE': 0,
      'ESCOPETA': 0,
      'PISTOLA': 0,
      'REVOLVER': 0,
      'OTROS': 0,
    };

    for (const docSnap of sociosSnapshot.docs) {
      const socio = docSnap.data();
      const email = docSnap.id;

      // Contar estado
      if (socio.estado === 'activo' || socio.estado === 'Activo') socios_activos++;
      if (socio.membresia2026?.estado === 'pagado') socios_pagados++;

      // Contar armas
      const armasRef = db.collection('socios').doc(email).collection('armas');
      const armasSnapshot = await armasRef.get();

      for (const armaSnap of armasSnapshot.docs) {
        const arma = armaSnap.data();
        const tipo = (arma.type_group || arma.clase || '').toUpperCase();

        totalArmas++;

        if (tipo.includes('RIFLE')) contadoresPorTipo['RIFLE']++;
        else if (tipo.includes('ESCOPETA')) contadoresPorTipo['ESCOPETA']++;
        else if (tipo.includes('PISTOLA')) contadoresPorTipo['PISTOLA']++;
        else if (tipo.includes('REVOLVER')) contadoresPorTipo['REVOLVER']++;
        else contadoresPorTipo['OTROS']++;
      }
    }

    // Construir reporte
    const infoClub = [
      ['INFORMACIÓN DEL CLUB 738'],
      [],
      ['DATOS GENERALES'],
      ['Nombre:', clubInfo.nombre || 'CLUB 738 - YUCATÁN'],
      ['RFC:', clubInfo.rfc || 'N/A'],
      ['Domicilio:', clubInfo.domicilio || 'N/A'],
      ['Teléfono:', clubInfo.telefono || 'N/A'],
      ['Email:', clubInfo.email || 'admin@club738.com'],
      [],
      ['DIRECTIVA'],
      ['Presidente:', clubInfo.presidente || 'N/A'],
      ['Secretario:', clubInfo.secretario || 'N/A'],
      ['Tesorero:', clubInfo.tesorero || 'N/A'],
      [],
      ['ESTADÍSTICAS DE SOCIOS'],
      ['Total Socios:', totalSocios],
      ['Socios Activos:', socios_activos],
      ['Socios con Pago 2026:', socios_pagados],
      [],
      ['ESTADÍSTICAS DE ARMAS'],
      ['Total Armas Registradas:', totalArmas],
      ['Rifles:', contadoresPorTipo['RIFLE']],
      ['Escopetas:', contadoresPorTipo['ESCOPETA']],
      ['Pistolas:', contadoresPorTipo['PISTOLA']],
      ['Revólveres:', contadoresPorTipo['REVOLVER']],
      ['Otros:', contadoresPorTipo['OTROS']],
      [],
      ['INFORMACIÓN DEL REPORTE'],
      ['Período:', `Bimestre ${mes.toString().padStart(2, '0')}/${año}`],
      ['Fecha de Generación:', new Date().toLocaleString('es-MX')],
      ['Autoridad SEDENA:', '32 Zona Militar (Valladolid)'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(infoClub);
    ws['!cols'] = [{ wch: 35 }, { wch: 30 }];

    // Aplicar estilos
    const boldStyle = { font: { bold: true, size: 12 } };
    ws['A1'].s = { font: { bold: true, size: 14 } };
    ws['A3'].s = boldStyle;
    ws['A10'].s = boldStyle;
    ws['A15'].s = boldStyle;
    ws['A21'].s = boldStyle;
    ws['A28'].s = boldStyle;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ANEXO C');

    // Hoja de resumen ejecutivo
    const resumenEjec = [
      ['RESUMEN EJECUTIVO'],
      [],
      ['Indicador', 'Valor', 'Cambio vs. anterior'],
      ['Total Socios', totalSocios, ''],
      ['Total Armas', totalArmas, ''],
      ['Socios Pagados', socios_pagados, ''],
      ['% Cobranza', ((socios_pagados / totalSocios) * 100).toFixed(1) + '%', ''],
    ];

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenEjec);
    wsResumen['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Ejecutivo');

    return wb;
  } catch (error) {
    console.error('❌ Error en generarAnexoC:', error.message);
    throw error;
  }
}

export default generarAnexoC;

/**
 * utils/pdf-generator.js
 * Utilidades para generar PDFs desde Excel
 * (Convertir hojas Excel a PDF con formato)
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Convertir archivo Excel a PDF
 * @param {String} inputPath - Ruta archivo Excel
 * @param {String} outputPath - Ruta archivo PDF destino
 * @param {Object} options - Opciones (titulo, etc.)
 */
async function excelAPDF(inputPath, outputPath, options = {}) {
  try {
    const XLSX = require('xlsx');

    // Leer Excel
    const workbook = XLSX.readFile(inputPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Crear PDF
    const doc = new PDFDocument({
      margin: 40,
      size: 'LETTER',
    });

    // Escribir al archivo
    doc.pipe(fs.createWriteStream(outputPath));

    // Titulo
    if (options.titulo) {
      doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(options.titulo, { align: 'center' })
        .moveDown();
    }

    // Fecha
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Generado: ${new Date().toLocaleString('es-MX')}`, { align: 'right' })
      .moveDown();

    // Tabla de datos
    const pageWidth = doc.page.width - 80;
    const colWidth = pageWidth / data[0].length;

    // Headers
    doc.font('Helvetica-Bold').fontSize(9);
    const headerRow = data[0];
    headerRow.forEach((cell, i) => {
      doc.text(String(cell || ''), 40 + i * colWidth, doc.y, {
        width: colWidth - 2,
        height: 20,
        valign: 'top',
        align: 'left',
      });
    });

    doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
    doc.moveDown();

    // Datos
    doc.font('Helvetica').fontSize(8);
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      let maxHeight = 15;

      // Calcular altura de la fila
      row.forEach((cell, colIndex) => {
        const textHeight = doc.heightOfString(String(cell || ''), {
          width: colWidth - 4,
        });
        if (textHeight > maxHeight) maxHeight = textHeight;
      });

      // Verificar si cabe en la página
      if (doc.y + maxHeight > doc.page.height - 40) {
        doc.addPage();
      }

      // Dibujar celdas
      const y = doc.y;
      row.forEach((cell, j) => {
        doc.text(String(cell || ''), 40 + j * colWidth, y, {
          width: colWidth - 2,
          height: maxHeight,
          valign: 'top',
          align: 'left',
        });
      });

      doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke();
      doc.moveDown(2);
    }

    // Pie de página
    doc
      .fontSize(8)
      .font('Helvetica-Oblique')
      .text('Reporte generado automaticamente por SEDENA Sistema', 40, doc.page.height - 40, {
        align: 'center',
      });

    // Finalizar
    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('finish', () => resolve(outputPath));
      doc.on('error', reject);
    });
  } catch (error) {
    console.error('❌ Error generando PDF:', error.message);
    throw error;
  }
}

module.exports = {
  excelAPDF,
};

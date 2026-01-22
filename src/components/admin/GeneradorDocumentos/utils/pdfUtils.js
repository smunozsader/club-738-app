import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Genera un PDF a partir de un elemento HTML
 * @param {HTMLElement} element - Elemento a convertir
 * @param {String} filename - Nombre del archivo
 * @returns {Promise<void>}
 */
export const generarPDFDesdeHTML = async (element, filename) => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Agregar imagen a las páginas necesarias
    pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error('Error generando PDF: ' + error.message);
  }
};

/**
 * Genera un marcador de agua en un elemento
 * @param {String} texto - Texto del marcador
 */
export const agregarMarcaDeAgua = (elemento, texto = 'CONFIDENCIAL') => {
  const watermark = document.createElement('div');
  watermark.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 80px;
    opacity: 0.1;
    color: #999;
    pointer-events: none;
    z-index: -1;
    font-weight: bold;
    white-space: nowrap;
  `;
  watermark.textContent = texto;
  elemento.appendChild(watermark);
};

/**
 * Descarga un archivo
 * @param {String} url - URL del archivo
 * @param {String} filename - Nombre del archivo
 */
export const descargarArchivo = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

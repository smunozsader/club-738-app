/**
 * OCR Validation Utility
 * Valida que un PDF de registro de arma contenga la matrícula correcta
 * 
 * Las bibliotecas pesadas (pdfjs-dist, tesseract.js) se cargan dinámicamente
 * solo cuando se necesitan, para no afectar el tiempo de carga inicial.
 */

// Lazy loading de bibliotecas pesadas
let pdfjsLib = null;
let Tesseract = null;

async function loadPdfJs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  return pdfjsLib;
}

async function loadTesseract() {
  if (!Tesseract) {
    const module = await import('tesseract.js');
    Tesseract = module.default;
  }
  return Tesseract;
}

/**
 * Extrae texto de un PDF usando la capa de texto nativa
 * @param {File} file - Archivo PDF
 * @returns {Promise<string>} - Texto extraído
 */
async function extractTextFromPDF(file) {
  try {
    const pdfjs = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extraer texto de las primeras 2 páginas (suficiente para RFA)
    const pagesToCheck = Math.min(pdf.numPages, 2);
    
    for (let i = 1; i <= pagesToCheck; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + ' ';
    }
    
    return fullText.trim();
  } catch (error) {
    console.warn('⚠️ No se pudo extraer texto nativo del PDF:', error.message);
    return '';
  }
}

/**
 * Convierte la primera página del PDF a imagen y aplica OCR
 * @param {File} file - Archivo PDF
 * @param {function} onProgress - Callback de progreso
 * @returns {Promise<string>} - Texto extraído por OCR
 */
async function extractTextWithOCR(file, onProgress) {
  try {
    const pdfjs = await loadPdfJs();
    const TesseractLib = await loadTesseract();
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    
    // Renderizar a canvas con buena resolución para OCR
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    // Aplicar OCR con Tesseract
    onProgress?.({ status: 'ocr', message: 'Analizando documento...' });
    
    const result = await TesseractLib.recognize(canvas, 'spa', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          onProgress?.({ 
            status: 'ocr', 
            progress: m.progress,
            message: `Analizando: ${Math.round(m.progress * 100)}%`
          });
        }
      }
    });
    
    return result.data.text;
  } catch (error) {
    console.error('❌ Error en OCR:', error);
    return '';
  }
}

/**
 * Normaliza una matrícula para comparación
 * Elimina espacios, guiones y convierte a mayúsculas
 */
function normalizeMatricula(matricula) {
  if (!matricula) return '';
  return matricula
    .toUpperCase()
    .replace(/[\s\-\.]/g, '')  // Eliminar espacios, guiones, puntos
    .trim();
}

/**
 * Busca una matrícula en el texto extraído
 * @param {string} text - Texto donde buscar
 * @param {string} matricula - Matrícula a encontrar
 * @returns {boolean} - true si se encontró
 */
function findMatriculaInText(text, matricula) {
  const normalizedText = normalizeMatricula(text);
  const normalizedMatricula = normalizeMatricula(matricula);
  
  if (!normalizedMatricula) return false;
  
  // Buscar matrícula exacta
  if (normalizedText.includes(normalizedMatricula)) {
    return true;
  }
  
  // OCR puede confundir algunos caracteres, intentar variaciones comunes
  const variations = [
    normalizedMatricula,
    normalizedMatricula.replace(/0/g, 'O'),  // 0 → O
    normalizedMatricula.replace(/O/g, '0'),  // O → 0
    normalizedMatricula.replace(/1/g, 'I'),  // 1 → I
    normalizedMatricula.replace(/I/g, '1'),  // I → 1
    normalizedMatricula.replace(/1/g, 'L'),  // 1 → L
    normalizedMatricula.replace(/5/g, 'S'),  // 5 → S
    normalizedMatricula.replace(/S/g, '5'),  // S → 5
  ];
  
  return variations.some(v => normalizedText.includes(v));
}

/**
 * Valida que un PDF contenga la matrícula de un arma
 * @param {File} file - Archivo PDF a validar
 * @param {Object} arma - Datos del arma (matricula, folio)
 * @param {function} onProgress - Callback de progreso
 * @returns {Promise<{valid: boolean, message: string, method: string}>}
 */
export async function validateArmaRegistro(file, arma, onProgress) {
  if (!file || !arma?.matricula) {
    return {
      valid: false,
      message: 'Datos incompletos para validación',
      method: 'none'
    };
  }
  
  onProgress?.({ status: 'starting', message: 'Verificando documento...' });
  
  // Paso 1: Intentar extraer texto nativo del PDF
  onProgress?.({ status: 'extracting', message: 'Leyendo PDF...' });
  let extractedText = await extractTextFromPDF(file);
  
  if (extractedText && extractedText.length > 50) {
    // Hay texto nativo, buscar matrícula
    const found = findMatriculaInText(extractedText, arma.matricula);
    
    if (found) {
      return {
        valid: true,
        message: `✅ Matrícula ${arma.matricula} verificada`,
        method: 'text'
      };
    }
    
    // También buscar el folio como respaldo
    if (arma.folio && findMatriculaInText(extractedText, arma.folio)) {
      return {
        valid: true,
        message: `✅ Folio ${arma.folio} verificado`,
        method: 'text'
      };
    }
  }
  
  // Paso 2: Si no hay texto o no se encontró, intentar OCR
  onProgress?.({ status: 'ocr', message: 'Aplicando reconocimiento óptico...' });
  const ocrText = await extractTextWithOCR(file, onProgress);
  
  if (ocrText && ocrText.length > 20) {
    const foundByOCR = findMatriculaInText(ocrText, arma.matricula);
    
    if (foundByOCR) {
      return {
        valid: true,
        message: `✅ Matrícula ${arma.matricula} verificada (OCR)`,
        method: 'ocr'
      };
    }
    
    // Buscar folio como respaldo
    if (arma.folio && findMatriculaInText(ocrText, arma.folio)) {
      return {
        valid: true,
        message: `✅ Folio ${arma.folio} verificado (OCR)`,
        method: 'ocr'
      };
    }
  }
  
  // No se encontró la matrícula
  return {
    valid: false,
    message: `⚠️ No se encontró la matrícula "${arma.matricula}" en el documento.\n\nVerifica que estás subiendo el registro correcto para esta arma.`,
    method: ocrText.length > 20 ? 'ocr' : 'text'
  };
}

/**
 * Modo rápido: solo extrae texto nativo (sin OCR)
 * Útil para validación ligera
 */
export async function quickValidateArmaRegistro(file, arma) {
  if (!file || !arma?.matricula) {
    return { valid: false, message: 'Datos incompletos' };
  }
  
  const text = await extractTextFromPDF(file);
  
  if (!text || text.length < 50) {
    // PDF escaneado, no podemos validar sin OCR completo
    return { 
      valid: null, // null = no se pudo determinar
      message: 'PDF escaneado - se requiere validación OCR',
      requiresOCR: true
    };
  }
  
  const found = findMatriculaInText(text, arma.matricula) || 
                (arma.folio && findMatriculaInText(text, arma.folio));
  
  return {
    valid: found,
    message: found 
      ? `✅ Documento verificado` 
      : `⚠️ No coincide con arma ${arma.matricula}`,
    requiresOCR: false
  };
}

export default { validateArmaRegistro, quickValidateArmaRegistro };

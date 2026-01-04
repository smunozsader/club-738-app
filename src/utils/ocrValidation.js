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
    // Usar unpkg que tiene todas las versiones, incluyendo las más nuevas
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
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
  
  console.log('🔍 Buscando matrícula:', normalizedMatricula);
  console.log('📄 Texto extraído (primeros 1000 chars):', normalizedText.substring(0, 1000));
  
  // Buscar matrícula exacta
  if (normalizedText.includes(normalizedMatricula)) {
    console.log('✅ Encontrada exacta');
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
    normalizedMatricula.replace(/L/g, '1'),  // L → 1
    normalizedMatricula.replace(/5/g, 'S'),  // 5 → S
    normalizedMatricula.replace(/S/g, '5'),  // S → 5
    normalizedMatricula.replace(/8/g, 'B'),  // 8 → B
    normalizedMatricula.replace(/B/g, '8'),  // B → 8
    normalizedMatricula.replace(/6/g, 'G'),  // 6 → G
    normalizedMatricula.replace(/G/g, '6'),  // G → 6
    // Combinaciones múltiples
    normalizedMatricula.replace(/0/g, 'O').replace(/1/g, 'I'),
    normalizedMatricula.replace(/O/g, '0').replace(/I/g, '1'),
  ];
  
  // Eliminar duplicados
  const uniqueVariations = [...new Set(variations)];
  
  for (const v of uniqueVariations) {
    if (normalizedText.includes(v)) {
      console.log('✅ Encontrada con variación:', v);
      return true;
    }
  }
  
  // Búsqueda parcial: si la matrícula tiene 6+ caracteres, buscar subcadenas
  // Esto ayuda cuando el OCR pierde 1-2 caracteres
  if (normalizedMatricula.length >= 6) {
    // Buscar los primeros N-1 caracteres
    const prefix = normalizedMatricula.substring(0, normalizedMatricula.length - 1);
    // Buscar los últimos N-1 caracteres
    const suffix = normalizedMatricula.substring(1);
    // Buscar el núcleo (sin primer y último caracter)
    const core = normalizedMatricula.substring(1, normalizedMatricula.length - 1);
    
    if (normalizedText.includes(prefix)) {
      console.log('✅ Encontrada parcial (prefix):', prefix);
      return true;
    }
    if (normalizedText.includes(suffix)) {
      console.log('✅ Encontrada parcial (suffix):', suffix);
      return true;
    }
    if (core.length >= 5 && normalizedText.includes(core)) {
      console.log('✅ Encontrada parcial (core):', core);
      return true;
    }
  }
  
  // Búsqueda por números significativos (para folios largos tipo A3892690)
  // Extraer solo dígitos y buscar secuencia de 5+ dígitos consecutivos
  const onlyDigits = normalizedMatricula.replace(/[^0-9]/g, '');
  if (onlyDigits.length >= 5) {
    // Buscar en el texto una secuencia similar (permitiendo variaciones)
    const digitPrefix = onlyDigits.substring(0, onlyDigits.length - 2); // ej: de 3892690 → 38926
    if (digitPrefix.length >= 4 && normalizedText.includes(digitPrefix)) {
      console.log('✅ Encontrada por dígitos:', digitPrefix);
      return true;
    }
    // Buscar los últimos 5-6 dígitos (útil cuando hay ruido al inicio)
    const digitSuffix = onlyDigits.slice(-Math.min(6, onlyDigits.length));
    if (digitSuffix.length >= 5 && normalizedText.includes(digitSuffix)) {
      console.log('✅ Encontrada por dígitos finales:', digitSuffix);
      return true;
    }
    // Buscar dígitos centrales
    if (onlyDigits.length >= 7) {
      const digitCore = onlyDigits.substring(1, onlyDigits.length - 1);
      if (normalizedText.includes(digitCore)) {
        console.log('✅ Encontrada por dígitos centrales:', digitCore);
        return true;
      }
    }
  }
  
  // Búsqueda específica para matrículas con letras y números mezclados (ej: U17049B)
  // OCR puede añadir/perder caracteres, buscar patrones númericos significativos
  const lettersThenNumbers = normalizedMatricula.match(/^([A-Z]+)(\d+)([A-Z]*)$/);
  if (lettersThenNumbers) {
    const [, prefix, numbers, suffix] = lettersThenNumbers;
    // Buscar solo los números si son suficientemente únicos
    if (numbers.length >= 4) {
      if (normalizedText.includes(numbers)) {
        console.log('✅ Encontrada números de matrícula:', numbers);
        return true;
      }
    }
  }
  
  console.log('❌ No encontrada ninguna variación');
  return false;
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
  
  console.log('🔎 Validando registro de arma:');
  console.log('   Matrícula:', arma.matricula);
  console.log('   Folio:', arma.folio || '(no disponible)');
  console.log('   Marca:', arma.marca || '(no disponible)');
  console.log('   Modelo:', arma.modelo || '(no disponible)');
  console.log('   Calibre:', arma.calibre || '(no disponible)');
  
  onProgress?.({ status: 'starting', message: 'Verificando documento...' });
  
  // Función para buscar todos los campos y contar coincidencias
  const buscarCoincidencias = (texto) => {
    const coincidencias = [];
    
    if (findMatriculaInText(texto, arma.matricula)) {
      coincidencias.push({ campo: 'Matrícula', valor: arma.matricula });
    }
    if (arma.folio && findMatriculaInText(texto, arma.folio)) {
      coincidencias.push({ campo: 'Folio', valor: arma.folio });
    }
    if (arma.marca && findMatriculaInText(texto, arma.marca)) {
      coincidencias.push({ campo: 'Marca', valor: arma.marca });
    }
    if (arma.modelo && findMatriculaInText(texto, arma.modelo)) {
      coincidencias.push({ campo: 'Modelo', valor: arma.modelo });
    }
    if (arma.calibre && findMatriculaInText(texto, arma.calibre)) {
      coincidencias.push({ campo: 'Calibre', valor: arma.calibre });
    }
    
    return coincidencias;
  };
  
  // Paso 1: Intentar extraer texto nativo del PDF
  onProgress?.({ status: 'extracting', message: 'Leyendo PDF...' });
  let extractedText = await extractTextFromPDF(file);
  
  if (extractedText && extractedText.length > 50) {
    const coincidencias = buscarCoincidencias(extractedText);
    console.log(`📊 Coincidencias encontradas (texto): ${coincidencias.length}`, coincidencias);
    
    // Requiere al menos 2 coincidencias
    if (coincidencias.length >= 2) {
      const campos = coincidencias.map(c => c.campo).join(' + ');
      return {
        valid: true,
        message: `✅ Verificado: ${campos}`,
        method: 'text'
      };
    }
  }
  
  // Paso 2: Si no hay texto o no se encontró suficiente, intentar OCR
  onProgress?.({ status: 'ocr', message: 'Aplicando reconocimiento óptico...' });
  const ocrText = await extractTextWithOCR(file, onProgress);
  
  if (ocrText && ocrText.length > 20) {
    const coincidencias = buscarCoincidencias(ocrText);
    console.log(`📊 Coincidencias encontradas (OCR): ${coincidencias.length}`, coincidencias);
    
    // Requiere al menos 2 coincidencias
    if (coincidencias.length >= 2) {
      const campos = coincidencias.map(c => c.campo).join(' + ');
      return {
        valid: true,
        message: `✅ Verificado (OCR): ${campos}`,
        method: 'ocr'
      };
    }
    
    // Si solo encontró 1, informar pero también ofrecer opción
    if (coincidencias.length === 1) {
      console.log(`⚠️ Solo 1 coincidencia: ${coincidencias[0].campo} = ${coincidencias[0].valor}`);
      return {
        valid: false,
        message: `⚠️ Se encontró solo 1 coincidencia: ${coincidencias[0].campo}\n\nSe requieren al menos 2 de: matrícula, folio, marca, modelo, calibre.\n\nSi estás seguro de que es el documento correcto, puedes forzar la subida.`,
        method: 'ocr',
        partialMatch: coincidencias
      };
    }
  }
  
  // No se encontró ninguno de los identificadores
  const searched = [
    `matrícula "${arma.matricula}"`,
    arma.folio ? `folio "${arma.folio}"` : null,
    arma.marca ? `marca "${arma.marca}"` : null,
    arma.modelo ? `modelo "${arma.modelo}"` : null,
    arma.calibre ? `calibre "${arma.calibre}"` : null,
  ].filter(Boolean).join(', ');
  
  return {
    valid: false,
    message: `⚠️ No se pudo verificar el documento\n\nSe buscó: ${searched}\n\nEsto puede ocurrir si el PDF está escaneado con baja calidad. Si estás seguro de que es el registro correcto, puedes forzar la subida.`,
    method: ocrText && ocrText.length > 20 ? 'ocr' : 'text'
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

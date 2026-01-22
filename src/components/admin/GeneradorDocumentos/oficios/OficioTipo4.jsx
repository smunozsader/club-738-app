import React, { useState, useRef } from 'react';

const OficioTipo4 = () => {
  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [adjuntos, setAdjuntos] = useState({
    relacion: false,
    anexoA: false,
    anexoB: false,
    anexoC: false
  });
  const editorRef = useRef(null);

  // Aplicar formato de texto
  const aplicarFormato = (comando, valor = null) => {
    document.execCommand(comando, false, valor);
    editorRef.current?.focus();
  };

  // Cambiar tamaño del texto
  const cambiarTamano = (tamano) => {
    // Tamaños: 1=8px, 3=16px, 5=24px, 6=32px
    document.execCommand('fontSize', false, tamano);
    editorRef.current?.focus();
  };

  // Obtener contenido HTML del editor
  const obtenerHTML = () => {
    return editorRef.current?.innerHTML || '';
  };

  // Limpiar formato
  const limpiarFormato = () => {
    document.execCommand('removeFormat', false);
    editorRef.current?.focus();
  };

  // Sincronizar cuerpo cuando cambia el editor
  const handleEditorInput = () => {
    const html = obtenerHTML();
    setCuerpo(html);
  };

  // Manejar checkboxes de adjuntos
  const handleAdjuntoChange = (tipo) => {
    setAdjuntos(prev => ({
      ...prev,
      [tipo]: !prev[tipo]
    }));
  };

  return (
    <div className="oficio-tipo4">
      <div className="form-group">
        <label>ASUNTO</label>
        <input 
          type="text"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Ej: Solicitud de revisión de expediente"
          maxLength="200"
        />
      </div>

      <div className="form-group">
        <label>CUERPO DEL OFICIO</label>
        
        {/* Barra de herramientas de formato */}
        <div className="editor-toolbar">
          <div className="toolbar-group">
            <button 
              type="button"
              className="toolbar-btn"
              title="Negrita (Ctrl+B)"
              onClick={() => aplicarFormato('bold')}
            >
              <strong>N</strong>
            </button>
            <button 
              type="button"
              className="toolbar-btn"
              title="Itálica (Ctrl+I)"
              onClick={() => aplicarFormato('italic')}
            >
              <em>I</em>
            </button>
            <button 
              type="button"
              className="toolbar-btn"
              title="Subrayado (Ctrl+U)"
              onClick={() => aplicarFormato('underline')}
            >
              <u>S</u>
            </button>
          </div>

          <div className="toolbar-group">
            <select 
              className="toolbar-select"
              defaultValue=""
              onChange={(e) => cambiarTamano(e.target.value)}
              title="Tamaño del texto"
            >
              <option value="">Tamaño</option>
              <option value="3">Normal</option>
              <option value="4">Grande</option>
              <option value="5">Muy grande</option>
            </select>
          </div>

          <div className="toolbar-group">
            <button 
              type="button"
              className="toolbar-btn"
              title="Alinear izquierda"
              onClick={() => aplicarFormato('justifyLeft')}
            >
              ⬅
            </button>
            <button 
              type="button"
              className="toolbar-btn"
              title="Alinear centro"
              onClick={() => aplicarFormato('justifyCenter')}
            >
              ↔
            </button>
            <button 
              type="button"
              className="toolbar-btn"
              title="Alinear derecha"
              onClick={() => aplicarFormato('justifyRight')}
            >
              ➡
            </button>
          </div>

          <div className="toolbar-group">
            <button 
              type="button"
              className="toolbar-btn btn-danger"
              title="Limpiar formato"
              onClick={limpiarFormato}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Editor contentEditable */}
        <div 
          ref={editorRef}
          className="text-editor"
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorInput}
          placeholder="Redacta el contenido del oficio aquí..."
        />
      </div>

      <div className="form-group">
        <label>Documentos Adjuntos (opcional)</label>
        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={adjuntos.relacion}
              onChange={() => handleAdjuntoChange('relacion')}
            /> 
            RELACIÓN
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={adjuntos.anexoA}
              onChange={() => handleAdjuntoChange('anexoA')}
            /> 
            ANEXO A
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={adjuntos.anexoB}
              onChange={() => handleAdjuntoChange('anexoB')}
            /> 
            ANEXO B
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={adjuntos.anexoC}
              onChange={() => handleAdjuntoChange('anexoC')}
            /> 
            ANEXO C
          </label>
        </div>
      </div>
    </div>
  );
};

export default OficioTipo4;

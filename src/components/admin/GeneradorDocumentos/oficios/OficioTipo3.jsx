import React, { useState, useRef } from 'react';

const OficioTipo3 = () => {
  const [asunto, setAsunto] = useState('');
  const editorRef = useRef(null);

  const aplicarFormato = (comando, valor = null) => {
    document.execCommand(comando, false, valor);
    editorRef.current?.focus();
  };

  const cambiarTamano = (tamano) => {
    document.execCommand('fontSize', false, tamano);
    editorRef.current?.focus();
  };

  const limpiarFormato = () => {
    document.execCommand('removeFormat', false);
    editorRef.current?.focus();
  };

  return (
    <div className="oficio-tipo3">
      <div className="form-group">
        <label>ASUNTO (Opcional)</label>
        <input 
          type="text"
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Ej: Se remite DN27 con Anexos A, B, C..."
          maxLength="200"
        />
      </div>

      <div className="form-group">
        <label>Observaciones (Opcional)</label>
        
        <div className="editor-toolbar">
          <div className="toolbar-group">
            <button type="button" className="toolbar-btn" title="Negrita" onClick={() => aplicarFormato('bold')}><strong>N</strong></button>
            <button type="button" className="toolbar-btn" title="Itálica" onClick={() => aplicarFormato('italic')}><em>I</em></button>
            <button type="button" className="toolbar-btn" title="Subrayado" onClick={() => aplicarFormato('underline')}><u>S</u></button>
          </div>
          <div className="toolbar-group">
            <select className="toolbar-select" defaultValue="" onChange={(e) => cambiarTamano(e.target.value)}>
              <option value="">Tamaño</option>
              <option value="3">Normal</option>
              <option value="4">Grande</option>
              <option value="5">Muy grande</option>
            </select>
          </div>
          <div className="toolbar-group">
            <button type="button" className="toolbar-btn btn-danger" title="Limpiar" onClick={limpiarFormato}>✕</button>
          </div>
        </div>
        
        <div ref={editorRef} className="text-editor" contentEditable suppressContentEditableWarning />
      </div>

      <div className="info-bloque">
        <h4>Remite Anexos A, B, C (DN27)</h4>
        <p><strong>Tipo de información:</strong> Anexos conforme a DN27</p>
        <p className="note">
          Se incluyen:<br/>
          • Anexo A: Relación de Socios<br/>
          • Anexo B: Cédula de Totales<br/>
          • Anexo C: Información del Club con Totales
        </p>
      </div>
    </div>
  );
};

export default OficioTipo3;

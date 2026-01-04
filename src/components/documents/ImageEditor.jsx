import React, { useState, useRef, useEffect, useCallback } from 'react';
import './ImageEditor.css';

/**
 * ImageEditor - Componente para crop y zoom de imágenes
 * Especialmente diseñado para documentos oficiales (INE al 200%)
 */
export default function ImageEditor({ 
  imageFile, 
  onSave, 
  onCancel,
  defaultZoom = 100,
  documentType = ''
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(defaultZoom);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const [cropArea, setCropArea] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropStart, setCropStart] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Cargar imagen
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImageNaturalSize({ width: img.width, height: img.height });
          setImageSrc(e.target.result);
          
          // Si es INE, sugerir zoom 200%
          if (documentType.toLowerCase().includes('ine')) {
            setZoom(200);
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile, documentType]);

  // Manejar zoom con slider
  const handleZoomChange = (e) => {
    setZoom(parseInt(e.target.value));
  };

  // Zoom presets
  const setZoomPreset = (value) => {
    setZoom(value);
  };

  // Iniciar arrastre para mover imagen
  const handleMouseDown = (e) => {
    if (isCropping) {
      // Iniciar selección de crop
      const rect = containerRef.current.getBoundingClientRect();
      setCropStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setCropArea(null);
    } else {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isCropping && cropStart) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      
      setCropArea({
        x: Math.min(cropStart.x, currentX),
        y: Math.min(cropStart.y, currentY),
        width: Math.abs(currentX - cropStart.x),
        height: Math.abs(currentY - cropStart.y)
      });
    } else if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setCropStart(null);
  };

  // Touch events para móvil
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    if (isCropping) {
      const rect = containerRef.current.getBoundingClientRect();
      setCropStart({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
      setCropArea(null);
    } else {
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (isCropping && cropStart) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = touch.clientX - rect.left;
      const currentY = touch.clientY - rect.top;
      
      setCropArea({
        x: Math.min(cropStart.x, currentX),
        y: Math.min(cropStart.y, currentY),
        width: Math.abs(currentX - cropStart.x),
        height: Math.abs(currentY - cropStart.y)
      });
    } else if (isDragging) {
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setCropStart(null);
  };

  // Aplicar crop
  const applyCrop = () => {
    if (!cropArea || cropArea.width < 20 || cropArea.height < 20) {
      alert('Selecciona un área más grande para recortar');
      return;
    }
    
    setProcessing(true);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calcular el área real de la imagen a recortar
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      const displayedWidth = (img.width * zoom) / 100;
      const displayedHeight = (img.height * zoom) / 100;
      
      // Calcular offset de la imagen en el contenedor
      const imgOffsetX = (containerWidth - displayedWidth) / 2 + position.x;
      const imgOffsetY = (containerHeight - displayedHeight) / 2 + position.y;
      
      // Convertir coordenadas del crop al espacio de la imagen original
      const scaleX = img.width / displayedWidth;
      const scaleY = img.height / displayedHeight;
      
      const sourceX = Math.max(0, (cropArea.x - imgOffsetX) * scaleX);
      const sourceY = Math.max(0, (cropArea.y - imgOffsetY) * scaleY);
      const sourceWidth = cropArea.width * scaleX;
      const sourceHeight = cropArea.height * scaleY;
      
      // Aplicar zoom al resultado
      canvas.width = sourceWidth * (zoom / 100);
      canvas.height = sourceHeight * (zoom / 100);
      
      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, canvas.width, canvas.height
      );
      
      canvas.toBlob((blob) => {
        const croppedFile = new File([blob], imageFile.name, { type: 'image/jpeg' });
        setImageSrc(canvas.toDataURL('image/jpeg', 0.92));
        setImageNaturalSize({ width: canvas.width, height: canvas.height });
        setCropArea(null);
        setIsCropping(false);
        setPosition({ x: 0, y: 0 });
        setZoom(100);
        setProcessing(false);
      }, 'image/jpeg', 0.92);
    };
    img.src = imageSrc;
  };

  // Cancelar crop
  const cancelCrop = () => {
    setIsCropping(false);
    setCropArea(null);
    setCropStart(null);
  };

  // Guardar imagen final
  const handleSave = () => {
    setProcessing(true);
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Aplicar zoom final
      canvas.width = img.width * (zoom / 100);
      canvas.height = img.height * (zoom / 100);
      
      // Usar interpolación de alta calidad
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const finalFile = new File([blob], `${imageFile.name.split('.')[0]}_edited.jpg`, { 
          type: 'image/jpeg' 
        });
        setProcessing(false);
        onSave(finalFile);
      }, 'image/jpeg', 0.92);
    };
    img.src = imageSrc;
  };

  // Reset
  const handleReset = () => {
    setZoom(documentType.toLowerCase().includes('ine') ? 200 : 100);
    setPosition({ x: 0, y: 0 });
    setCropArea(null);
    setIsCropping(false);
    
    // Recargar imagen original
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImageNaturalSize({ width: img.width, height: img.height });
        setImageSrc(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
  };

  if (!imageSrc) {
    return (
      <div className="image-editor-loading">
        <div className="spinner"></div>
        <p>Cargando imagen...</p>
      </div>
    );
  }

  return (
    <div className="image-editor">
      <div className="editor-header">
        <h3>✂️ Editar Imagen</h3>
        {documentType.toLowerCase().includes('ine') && (
          <span className="ine-notice">📋 INE requiere ampliación al 200%</span>
        )}
      </div>

      <div className="editor-toolbar">
        <div className="zoom-controls">
          <label>🔍 Zoom: {zoom}%</label>
          <input
            type="range"
            min="50"
            max="300"
            value={zoom}
            onChange={handleZoomChange}
            className="zoom-slider"
          />
          <div className="zoom-presets">
            <button 
              onClick={() => setZoomPreset(100)} 
              className={zoom === 100 ? 'active' : ''}
            >
              100%
            </button>
            <button 
              onClick={() => setZoomPreset(150)} 
              className={zoom === 150 ? 'active' : ''}
            >
              150%
            </button>
            <button 
              onClick={() => setZoomPreset(200)} 
              className={zoom === 200 ? 'active' : ''}
            >
              200%
            </button>
          </div>
        </div>

        <div className="crop-controls">
          {!isCropping ? (
            <button onClick={() => setIsCropping(true)} className="btn-crop">
              ✂️ Recortar
            </button>
          ) : (
            <>
              <button onClick={applyCrop} className="btn-apply-crop" disabled={!cropArea}>
                ✓ Aplicar Recorte
              </button>
              <button onClick={cancelCrop} className="btn-cancel-crop">
                ✕ Cancelar
              </button>
            </>
          )}
          <button onClick={handleReset} className="btn-reset">
            ↺ Reiniciar
          </button>
        </div>
      </div>

      {isCropping && (
        <p className="crop-instructions">
          👆 Arrastra para seleccionar el área a recortar
        </p>
      )}

      <div 
        className={`editor-canvas-container ${isCropping ? 'cropping' : ''}`}
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={imageSrc}
          alt="Preview"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom / 100})`,
            cursor: isCropping ? 'crosshair' : (isDragging ? 'grabbing' : 'grab')
          }}
          draggable={false}
        />
        
        {cropArea && (
          <div 
            className="crop-selection"
            style={{
              left: cropArea.x,
              top: cropArea.y,
              width: cropArea.width,
              height: cropArea.height
            }}
          />
        )}

        {processing && (
          <div className="processing-overlay">
            <div className="spinner"></div>
            <p>Procesando...</p>
          </div>
        )}
      </div>

      <div className="editor-info">
        <span>📐 Original: {imageNaturalSize.width} × {imageNaturalSize.height} px</span>
        <span>📄 Resultado: {Math.round(imageNaturalSize.width * zoom / 100)} × {Math.round(imageNaturalSize.height * zoom / 100)} px</span>
      </div>

      <div className="editor-actions">
        <button onClick={onCancel} className="btn-cancel">
          Cancelar
        </button>
        <button onClick={handleSave} className="btn-save" disabled={processing}>
          ✓ Guardar y Continuar
        </button>
      </div>
    </div>
  );
}

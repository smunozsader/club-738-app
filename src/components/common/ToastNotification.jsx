import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './ToastNotification.css';

const TOAST_TYPES = {
  success: { icon: '✅', color: '#4caf50' },
  error: { icon: '❌', color: '#f44336' },
  warning: { icon: '⚠️', color: '#ff9800' },
  info: { icon: 'ℹ️', color: '#2196f3' }
};

export default function ToastNotification({ 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose 
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const { icon, color } = TOAST_TYPES[type];

  return ReactDOM.createPortal(
    <div className={`toast-notification toast-${type}`}>
      <div className="toast-icon" style={{ color }}>
        {icon}
      </div>
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>
      <button 
        className="toast-close" 
        onClick={onClose}
        aria-label="Cerrar"
      >
        ✕
      </button>
    </div>,
    document.body
  );
}

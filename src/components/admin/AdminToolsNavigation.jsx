/**
 * AdminToolsNavigation - Grid de tarjetas accionables para herramientas admin
 * 
 * Reemplaza el sidebar tradicional por un layout de tarjetas responsivo
 * Funciona bien en mobile, tablet y desktop
 */
import React from 'react';
import './AdminToolsNavigation.css';

export default function AdminToolsNavigation({ 
  onSelectTool,
  activeSection 
}) {
  // Definición de grupos de herramientas
  const toolGroups = [
    {
      id: 'socios',
      title: '👥 Gestión de Socios',
      color: 'purple',
      tools: [
        { 
          id: 'gestion-socios', 
          label: 'Ver Expedientes', 
          icon: '📋',
          description: 'Consulta tabla de socios y expedientes',
          onClick: () => onSelectTool('admin-dashboard')
        },
        { 
          id: 'reportador-expedientes', 
          label: 'Generar Reportes', 
          icon: '📊',
          description: 'Genera reportes SEDENA por período',
          onClick: () => onSelectTool('reportador-expedientes')
        }
      ]
    },
    {
      id: 'peta',
      title: '🎯 Módulo PETA',
      color: 'blue',
      tools: [
        { 
          id: 'verificador-peta', 
          label: 'Verificador PETA', 
          icon: '✅',
          description: 'Verifica documentos de PETAs solicitadas',
          onClick: () => onSelectTool('verificador-peta')
        },
        { 
          id: 'generador-peta', 
          label: 'Generar PETA', 
          icon: '📄',
          description: 'Genera oficios PETA en PDF',
          onClick: () => onSelectTool('generador-peta')
        },
        { 
          id: 'expediente-impresor', 
          label: 'Imprimir Expediente', 
          icon: '🖨️',
          description: 'Prepara expedientes para impresión',
          onClick: () => onSelectTool('expediente-impresor')
        }
      ]
    },
    {
      id: 'cobranza',
      title: '💰 Módulo Cobranza',
      color: 'green',
      tools: [
        { 
          id: 'registro-pagos', 
          label: 'Registro de Pagos', 
          icon: '💳',
          description: 'Registra pagos de membresías',
          onClick: () => onSelectTool('registro-pagos')
        },
        { 
          id: 'reporte-caja', 
          label: 'Reporte de Caja', 
          icon: '📈',
          description: 'Reporte de caja y corte',
          onClick: () => onSelectTool('reporte-caja')
        },
        { 
          id: 'cobranza-unificada', 
          label: 'Panel Cobranza', 
          icon: '💵',
          description: 'Panel de cobranza unificado',
          onClick: () => onSelectTool('cobranza-unificada')
        },
        { 
          id: 'renovaciones-2026', 
          label: 'Renovaciones 2026', 
          icon: '🔄',
          description: 'Dashboard de renovaciones 2026',
          onClick: () => onSelectTool('renovaciones-2026')
        },
        { 
          id: 'cumpleanos', 
          label: 'Cumpleaños', 
          icon: '🎂',
          description: 'Cumpleaños y demografía de socios',
          onClick: () => onSelectTool('cumpleanos')
        }
      ]
    },
    {
      id: 'arsenal',
      title: '🔫 Gestión de Arsenal',
      color: 'orange',
      tools: [
        { 
          id: 'altas-arsenal', 
          label: 'Altas de Arsenal', 
          icon: '➕',
          description: 'Administra solicitudes de alta',
          onClick: () => onSelectTool('altas-arsenal')
        },
        { 
          id: 'bajas-arsenal', 
          label: 'Bajas de Arsenal', 
          icon: '➖',
          description: 'Administra solicitudes de baja',
          onClick: () => onSelectTool('bajas-arsenal')
        }
      ]
    },
    {
      id: 'agenda',
      title: '📅 Agenda & Citas',
      color: 'pink',
      tools: [
        { 
          id: 'mi-agenda', 
          label: 'Mi Agenda', 
          icon: '📅',
          description: 'Gestiona citas de socios',
          onClick: () => onSelectTool('mi-agenda')
        }
      ]
    }
  ];

  // Solo mostrar si activeSection es 'admin-dashboard'
  if (activeSection !== 'admin-dashboard') {
    return null;
  }

  return (
    <section className="admin-tools-grid-container">
      <div className="admin-tools-grid-header">
        <h2>🛠️ Herramientas Administrativas</h2>
        <p className="subtitle">Selecciona una herramienta para comenzar</p>
      </div>

      {toolGroups.map(group => (
        <div key={group.id} className="tools-group">
          <h3 className="tools-group-title">{group.title}</h3>
          <div className="tools-grid">
            {group.tools.map(tool => (
              <button
                key={tool.id}
                className={`tool-card ${group.color}`}
                onClick={tool.onClick}
                title={tool.description}
              >
                <div className="tool-icon">{tool.icon}</div>
                <div className="tool-label">{tool.label}</div>
                <div className="tool-description">{tool.description}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

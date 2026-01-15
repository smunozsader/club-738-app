import { useEffect } from 'react';
import { trackEvent, trackPageView } from '../firebaseConfig';

/**
 * Hook para tracking de eventos personalizados en Analytics
 */
export const useAnalytics = () => {
  // Track de eventos comunes
  const events = {
    // Documentos
    documentUploaded: (documentType) => {
      trackEvent('document_uploaded', {
        document_type: documentType,
        timestamp: new Date().toISOString()
      });
    },
    
    documentVerified: (documentType) => {
      trackEvent('document_verified', {
        document_type: documentType,
        timestamp: new Date().toISOString()
      });
    },
    
    documentDeleted: (documentType) => {
      trackEvent('document_deleted', {
        document_type: documentType,
        timestamp: new Date().toISOString()
      });
    },
    
    // PETA
    petaRequested: (petaType, armasCount) => {
      trackEvent('peta_requested', {
        peta_type: petaType,
        armas_count: armasCount,
        timestamp: new Date().toISOString()
      });
    },
    
    petaCompleted: (petaId) => {
      trackEvent('peta_completed', {
        peta_id: petaId,
        timestamp: new Date().toISOString()
      });
    },
    
    // Arsenal
    armaAdded: (armaClase) => {
      trackEvent('arma_added', {
        arma_clase: armaClase,
        timestamp: new Date().toISOString()
      });
    },
    
    armaEdited: (armaId) => {
      trackEvent('arma_edited', {
        arma_id: armaId,
        timestamp: new Date().toISOString()
      });
    },
    
    // Pagos
    paymentRegistered: (amount, concept) => {
      trackEvent('payment_registered', {
        amount: amount,
        concept: concept,
        currency: 'MXN',
        timestamp: new Date().toISOString()
      });
    },
    
    // Exports
    excelExported: (rowCount) => {
      trackEvent('excel_exported', {
        row_count: rowCount,
        timestamp: new Date().toISOString()
      });
    },
    
    // Auth
    userLogin: (email) => {
      trackEvent('login', {
        method: 'email',
        timestamp: new Date().toISOString()
      });
    },
    
    userLogout: () => {
      trackEvent('logout', {
        timestamp: new Date().toISOString()
      });
    },
    
    // Errors
    errorOccurred: (errorType, errorMessage) => {
      trackEvent('error_occurred', {
        error_type: errorType,
        error_message: errorMessage,
        timestamp: new Date().toISOString()
      });
    },
    
    // Calculadora PCP
    pcpCalculated: (caliber, weight, velocity, energy) => {
      trackEvent('pcp_calculated', {
        caliber: caliber,
        weight: weight,
        velocity: velocity,
        energy: energy,
        timestamp: new Date().toISOString()
      });
    },
    
    // Dark Mode
    themeChanged: (theme) => {
      trackEvent('theme_changed', {
        theme: theme,
        timestamp: new Date().toISOString()
      });
    }
  };
  
  return events;
};

/**
 * Hook para tracking automático de page views
 */
export const usePageTracking = (pageName) => {
  useEffect(() => {
    if (pageName) {
      trackPageView(pageName);
    }
  }, [pageName]);
};

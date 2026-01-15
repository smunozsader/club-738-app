import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, logEvent, setUserProperties } from "firebase/analytics";

// Tu web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAme_wf_G5tAHDnhXMLvPDrxnxs8Meq1ik",
  authDomain: "club-738-app.firebaseapp.com",
  projectId: "club-738-app",
  storageBucket: "club-738-app.firebasestorage.app",
  messagingSenderId: "353925230980",
  appId: "1:353925230980:web:63bc3c7b63b953027e6dd1",
  measurementId: "G-73Y38RXJHT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Initialize Firebase Analytics
let analytics = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  try {
    analytics = getAnalytics(app);
    if (firebaseConfig.measurementId === undefined) {
      console.warn('[Analytics] measurementId no definido');
    }
  } catch (e) {
    console.warn('[Analytics] No se pudo inicializar:', e?.message || e);
  }
}

// Helper functions para analytics
export const trackEvent = (eventName, params = {}) => {
  if (analytics) {
    logEvent(analytics, eventName, params);
  }
};

export const trackPageView = (pageName) => {
  if (analytics) {
    logEvent(analytics, 'page_view', {
      page_title: pageName,
      page_location: window.location.href,
      page_path: window.location.pathname
    });
  }
};

export const trackUserProperty = (propertyName, value) => {
  if (analytics) {
    setUserProperties(analytics, { [propertyName]: value });
  }
};

export { analytics };

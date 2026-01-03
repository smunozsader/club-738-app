import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Tu web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAme_wf_G5tAHDnhXMLvPDrxnxs8Meq1ik",
  authDomain: "club-738-app.firebaseapp.com",
  projectId: "club-738-app",
  storageBucket: "club-738-app.firebasestorage.app",
  messagingSenderId: "353925230980",
  appId: "1:353925230980:web:63bc3c7b63b953027e6dd1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

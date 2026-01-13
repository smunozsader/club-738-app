/**
 * useRole - Hook para detectar el rol del usuario autenticado
 * 
 * Lee de Firestore usuarios/{email} el campo 'role' y lo retorna.
 * Permite diferenciar entre 'administrator', 'socio', etc.
 * 
 * @returns {Object} { role, loading, error }
 */
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function useRole() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        // No hay usuario autenticado
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // Buscar documento en usuarios/{email}
        const userRef = doc(db, 'usuarios', user.email);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setRole(userData.role || 'socio'); // Default: socio
        } else {
          // Si no existe en usuarios, asumir socio
          // (para retrocompatibilidad con usuarios antiguos)
          console.warn(`Usuario ${user.email} no encontrado en collection usuarios. Asumiendo role: socio`);
          setRole('socio');
        }
      } catch (err) {
        console.error('Error obteniendo role:', err);
        setError(err.message);
        setRole('socio'); // Fallback seguro
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { role, loading, error };
}

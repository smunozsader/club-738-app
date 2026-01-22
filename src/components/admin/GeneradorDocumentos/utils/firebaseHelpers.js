import { db } from '../../../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

/**
 * Obtiene todos los socios activos de Firebase
 * @returns {Promise<Array>}
 */
export const obtenerSociosActivos = async () => {
  try {
    const q = query(collection(db, 'socios'), where('estado', '==', 'activo'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      email: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo socios:', error);
    throw error;
  }
};

/**
 * Obtiene las armas de un socio específico
 * @param {String} socioEmail
 * @returns {Promise<Array>}
 */
export const obtenerArmasDelSocio = async (socioEmail) => {
  try {
    const snapshot = await getDocs(
      collection(db, 'socios', socioEmail.toLowerCase(), 'armas')
    );
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo armas:', error);
    throw error;
  }
};

/**
 * Cuenta armas por tipo (cortas vs largas)
 * @param {Array} armas
 * @returns {Object} { cortas: number, largas: number, total: number }
 */
export const contarArmasPorTipo = (armas) => {
  const cortas = armas.filter(a => a.tipo === 'PISTOLA').length;
  const largas = armas.filter(a => ['RIFLE', 'ESCOPETA', 'CARABINA'].includes(a.tipo)).length;
  
  return {
    cortas,
    largas,
    total: armas.length
  };
};

/**
 * Genera el próximo folio para un oficio
 * @param {Number} ano - Año
 * @returns {Promise<String>} formato: "001/26", "002/26", etc
 */
export const generarProximoFolio = async (ano) => {
  // TODO: Implementar contador en Firestore
  // Por ahora retorna un placeholder
  return `001/${ano.toString().slice(-2)}`;
};

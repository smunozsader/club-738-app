/**
 * Cloud Function para Backup Automático de Firestore
 * 
 * Esta función se ejecuta diariamente a las 3:00 AM (timezone America/Merida)
 * y crea un backup completo de Firestore en Cloud Storage
 * 
 * Deploy: firebase deploy --only functions:scheduledFirestoreBackup
 */

const functions = require('firebase-functions');
const { firestore } = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const admin = require('firebase-admin');

// Initialize admin si no está inicializado
if (!admin.apps.length) {
  admin.initializeApp();
}

const storage = new Storage();
const client = new firestore.v1.FirestoreAdminClient();

// Configuración del backup
const BUCKET_NAME = 'club-738-app-backups'; // Crear bucket manualmente
const RETENTION_DAYS = 30; // Mantener backups por 30 días

/**
 * Función programada para backup diario
 * Cron: Todos los días a las 3:00 AM (America/Merida)
 */
exports.scheduledFirestoreBackup = functions
  .region('us-central1')
  .pubsub.schedule('0 3 * * *')
  .timeZone('America/Merida')
  .onRun(async (context) => {
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName = client.databasePath(projectId, '(default)');
    
    // Fecha para el nombre del backup
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const outputUriPrefix = `gs://${BUCKET_NAME}/firestore-backups/${timestamp}`;
    
    try {
      console.log(`🔄 Iniciando backup de Firestore...`);
      console.log(`📦 Database: ${databaseName}`);
      console.log(`📍 Output: ${outputUriPrefix}`);
      
      // Ejecutar backup
      const [operation] = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix: outputUriPrefix,
        // Opcional: especificar colecciones específicas
        // collectionIds: ['socios', 'petas', 'notificaciones']
      });
      
      console.log(`✅ Backup iniciado. Operation: ${operation.name}`);
      
      // Limpiar backups antiguos
      await deleteOldBackups();
      
      return { success: true, operation: operation.name };
    } catch (error) {
      console.error('❌ Error al crear backup:', error);
      throw new functions.https.HttpsError('internal', 'Backup failed', error);
    }
  });

/**
 * Función HTTP para backup manual (requiere auth)
 */
exports.manualFirestoreBackup = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    
    // Verificar que sea admin
    const adminEmail = 'admin@club738.com';
    if (context.auth.token.email !== adminEmail) {
      throw new functions.https.HttpsError('permission-denied', 'Only admin can trigger manual backup');
    }
    
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName = client.databasePath(projectId, '(default)');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputUriPrefix = `gs://${BUCKET_NAME}/firestore-backups/manual-${timestamp}`;
    
    try {
      const [operation] = await client.exportDocuments({
        name: databaseName,
        outputUriPrefix: outputUriPrefix
      });
      
      console.log(`✅ Backup manual iniciado por ${context.auth.token.email}`);
      
      return { 
        success: true, 
        message: 'Backup iniciado correctamente',
        operation: operation.name 
      };
    } catch (error) {
      console.error('❌ Error en backup manual:', error);
      throw new functions.https.HttpsError('internal', 'Manual backup failed', error);
    }
  });

/**
 * Función para eliminar backups antiguos (retention policy)
 */
async function deleteOldBackups() {
  try {
    const bucket = storage.bucket(BUCKET_NAME);
    const [files] = await bucket.getFiles({ prefix: 'firestore-backups/' });
    
    const now = Date.now();
    const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;
    
    let deletedCount = 0;
    
    for (const file of files) {
      const [metadata] = await file.getMetadata();
      const createdTime = new Date(metadata.timeCreated).getTime();
      const age = now - createdTime;
      
      if (age > retentionMs) {
        await file.delete();
        deletedCount++;
        console.log(`🗑️ Backup antiguo eliminado: ${file.name}`);
      }
    }
    
    console.log(`✅ Limpieza completada. ${deletedCount} backups eliminados.`);
  } catch (error) {
    console.error('⚠️ Error al limpiar backups antiguos:', error);
    // No lanzar error, solo loguear
  }
}

/**
 * Función HTTP para restaurar un backup (requiere admin)
 * 
 * IMPORTANTE: Restaurar sobrescribe todos los datos actuales
 * Usar con extrema precaución
 */
exports.restoreFirestoreBackup = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    // Verificar autenticación y admin
    if (!context.auth || context.auth.token.email !== 'admin@club738.com') {
      throw new functions.https.HttpsError('permission-denied', 'Only admin can restore backups');
    }
    
    const { backupPath } = data;
    
    if (!backupPath) {
      throw new functions.https.HttpsError('invalid-argument', 'backupPath is required');
    }
    
    const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
    const databaseName = client.databasePath(projectId, '(default)');
    
    try {
      console.log(`⚠️ RESTAURANDO BACKUP: ${backupPath}`);
      console.log(`⚠️ Iniciado por: ${context.auth.token.email}`);
      
      const [operation] = await client.importDocuments({
        name: databaseName,
        inputUriPrefix: `gs://${BUCKET_NAME}/${backupPath}`
      });
      
      console.log(`✅ Restauración iniciada. Operation: ${operation.name}`);
      
      return {
        success: true,
        message: 'Restauración iniciada. Los datos se sobrescribirán.',
        operation: operation.name,
        warning: 'TODOS LOS DATOS ACTUALES SERÁN REEMPLAZADOS'
      };
    } catch (error) {
      console.error('❌ Error al restaurar backup:', error);
      throw new functions.https.HttpsError('internal', 'Restore failed', error);
    }
  });

/**
 * Función para listar backups disponibles
 */
exports.listFirestoreBackups = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    // Verificar autenticación
    if (!context.auth || context.auth.token.email !== 'admin@club738.com') {
      throw new functions.https.HttpsError('permission-denied', 'Only admin can list backups');
    }
    
    try {
      const bucket = storage.bucket(BUCKET_NAME);
      const [files] = await bucket.getFiles({ prefix: 'firestore-backups/' });
      
      // Agrupar por fecha/carpeta
      const backups = {};
      
      for (const file of files) {
        const [metadata] = await file.getMetadata();
        const pathParts = file.name.split('/');
        
        if (pathParts.length >= 2) {
          const backupDate = pathParts[1];
          
          if (!backups[backupDate]) {
            backups[backupDate] = {
              date: backupDate,
              created: metadata.timeCreated,
              size: 0,
              files: []
            };
          }
          
          backups[backupDate].size += parseInt(metadata.size);
          backups[backupDate].files.push({
            name: file.name,
            size: metadata.size
          });
        }
      }
      
      // Convertir a array y ordenar por fecha (más reciente primero)
      const backupList = Object.values(backups).sort((a, b) => 
        new Date(b.created) - new Date(a.created)
      );
      
      return {
        success: true,
        backups: backupList,
        totalBackups: backupList.length
      };
    } catch (error) {
      console.error('❌ Error al listar backups:', error);
      throw new functions.https.HttpsError('internal', 'Failed to list backups', error);
    }
  });

import { deleteExpiredGenerations } from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Nettoie les fichiers ZIP expirés et les entrées en base de données
 */
export function cleanupExpiredFiles() {
  try {
    // Supprimer les entrées expirées de la base de données
    const result = deleteExpiredGenerations();
    console.log(`✅ ${result.changes || 0} générations expirées supprimées de la base de données`);

    // Sur Vercel, utiliser /tmp pour les fichiers temporaires
    // En local, utiliser le dossier downloads
    const isVercel = process.env.VERCEL === '1';
    const downloadsDir = isVercel 
      ? '/tmp/downloads'  // Vercel Serverless Functions
      : path.join(__dirname, '../downloads'); // Local
    
    if (!fs.existsSync(downloadsDir)) {
      return;
    }

    const files = fs.readdirSync(downloadsDir);
    let deletedCount = 0;

    files.forEach(file => {
      const filePath = path.join(downloadsDir, file);
      const stats = fs.statSync(filePath);
      
      // Supprimer les fichiers de plus de 24h
      const age = Date.now() - stats.mtimeMs;
      const oneDay = 24 * 60 * 60 * 1000;
      
      if (age > oneDay) {
        try {
          fs.unlinkSync(filePath);
          deletedCount++;
        } catch (err) {
          console.error(`Erreur suppression fichier ${file}:`, err);
        }
      }
    });

    if (deletedCount > 0) {
      console.log(`✅ ${deletedCount} fichiers ZIP expirés supprimés`);
    }
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
  }
}

// Exécuter le nettoyage toutes les heures
export function startCleanupScheduler() {
  // Exécuter immédiatement
  cleanupExpiredFiles();

  // Puis toutes les heures
  setInterval(cleanupExpiredFiles, 60 * 60 * 1000);
  
  console.log('🧹 Nettoyage automatique activé (toutes les heures)');
}


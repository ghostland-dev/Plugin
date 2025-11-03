// Fichier pour Vercel Serverless Functions
// Ce fichier adapte l'application Express pour Vercel
// Toutes les routes API sont gérées ici via Vercel rewrites
// Configuration: maxDuration 60s (via vercel.json)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import generateRoutes from '../backend/routes/generate.js';
import paymentRoutes from '../backend/routes/payment.js';
import adminRoutes from '../backend/routes/admin.js';
import seoRoutes from '../backend/routes/seo.js';
import { initDatabase } from '../backend/utils/database.js';
import { startCleanupScheduler } from '../backend/utils/cleanup.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Détecter si on est sur Vercel
const isVercel = process.env.VERCEL === '1';

// Variable pour suivre l'initialisation de la base de données
let dbInitialized = false;

// Obtenir l'URL du frontend dynamiquement
const getFrontendUrl = () => {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL;
  }
  if (isVercel && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return '*';
};

// Middleware CORS adaptatif
app.use(cors({
  origin: getFrontendUrl(),
  credentials: true
}));

// Middleware pour parser JSON et URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware pour initialiser la base de données si nécessaire
app.use(async (req, res, next) => {
  try {
    // Initialiser la base de données si ce n'est pas déjà fait
    // Sur Vercel, chaque invocation peut être une nouvelle instance
    if (!dbInitialized) {
      initDatabase();
      dbInitialized = true;
      console.log('✅ Base de données initialisée');
    }
  } catch (error) {
    console.error('❌ Erreur initialisation base de données:', error);
    // Ne pas bloquer la requête, mais logger l'erreur
  }
  next();
});

// Middleware pour logger les requêtes (en développement)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path}`);
    next();
  });
}

// Rate limiting
const generationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 heures
  max: 3,
  message: 'Limite de 3 générations par jour atteinte.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes API - Les chemins sont préservés par Vercel rewrites
app.use('/api/generate', generationLimiter, generateRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    platform: isVercel ? 'vercel' : 'local',
    vercel: isVercel,
    env: process.env.NODE_ENV || 'development'
  });
});

// Routes SEO (sitemap.xml, robots.txt) - servies à la racine
app.use('/', seoRoutes);

// Servir les fichiers statiques pour le téléchargement (seulement en local)
if (!isVercel) {
  const downloadsPath = path.join(__dirname, '../backend/downloads');
  app.use('/downloads', express.static(downloadsPath));
}

// Gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err);
  console.error('   Stack:', err.stack);
  console.error('   URL:', req.url);
  console.error('   Method:', req.method);
  
  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV !== 'production' && { 
      stack: err.stack,
      details: err.toString()
    })
  });
});

// Initialiser la base de données au démarrage (pour éviter les problèmes au premier appel)
try {
  initDatabase();
  dbInitialized = true;
  console.log('✅ Base de données initialisée au démarrage');
  
  // Démarrer le nettoyage seulement en local (pas sur Vercel serverless)
  if (!isVercel) {
    startCleanupScheduler();
  }
} catch (error) {
  console.error('❌ Erreur initialisation base de données au démarrage:', error);
  // On laisse dbInitialized à false pour réessayer dans le middleware
}

// Export pour Vercel Serverless Functions
// Vercel utilise ce export comme handler pour toutes les requêtes /api/*
export default app;

// Pour le développement local
if (!isVercel && process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  });
}


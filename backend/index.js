import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import generateRoutes from './routes/generate.js';
import paymentRoutes from './routes/payment.js';
import adminRoutes from './routes/admin.js';
import seoRoutes from './routes/seo.js';
import { initDatabase } from './utils/database.js';
import { startCleanupScheduler } from './utils/cleanup.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting: 3 générations par IP/jour
const generationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 heures
  max: 3,
  message: 'Limite de 3 générations par jour atteinte.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes
app.use('/api/generate', generationLimiter, generateRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/', seoRoutes); // Routes SEO (sitemap.xml, robots.txt)

// Servir les fichiers statiques pour le téléchargement
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialisation de la base de données
initDatabase();

// Démarrage du nettoyage automatique
startCleanupScheduler();

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend démarré sur le port ${PORT}`);
});

export default app;


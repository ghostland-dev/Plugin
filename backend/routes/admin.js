import express from 'express';
import { getAllGenerations } from '../utils/database.js';

const router = express.Router();

// Route pour obtenir les statistiques admin
router.get('/stats', (req, res) => {
  try {
    const generations = getAllGenerations(100);
    
    // Calculer les statistiques
    const total = generations.length;
    const byServerType = {};
    let revenue = 0;

    generations.forEach(gen => {
      // Compter par type de serveur
      if (!byServerType[gen.server_type]) {
        byServerType[gen.server_type] = 0;
      }
      byServerType[gen.server_type]++;
      
      // Calculer le revenu (5€ par génération payée)
      if (gen.payment_intent_id) {
        revenue += 5;
      }
    });

    res.json({
      total,
      revenue,
      byServerType,
      generations: generations.slice(0, 20) // Les 20 dernières
    });
  } catch (error) {
    console.error('Erreur stats admin:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

export default router;


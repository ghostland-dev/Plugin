import express from 'express';
import { body, validationResult } from 'express-validator';
import { createZipFile } from '../utils/zipCreator.js';
import { getGenerationBySessionId, updateGeneration } from '../utils/database.js';

const router = express.Router();

// Validation des entrées
const generateValidation = [
  body('session_id').notEmpty().withMessage('session_id requis'),
  body('server_type').isIn([
    'apache', 'nginx', 'nodejs', 'nextjs', 
    'tomcat', 'caddy', 'iis', 'lighttpd'
  ]).withMessage('Type de serveur invalide'),
  body('domain').optional().isString(),
  body('include_legal').optional().isBoolean()
];

router.post('/', generateValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { session_id, server_type, domain, include_legal } = req.body;

    // Vérifier si la génération existe déjà
    const existingGeneration = getGenerationBySessionId(session_id);
    if (!existingGeneration) {
      return res.status(404).json({ error: 'Session non trouvée. Paiement requis.' });
    }

    // Vérifier si le paiement a été confirmé
    if (!existingGeneration.payment_intent_id) {
      return res.status(402).json({ error: 'Paiement non confirmé' });
    }

    // Créer le fichier ZIP
    const zipPath = await createZipFile(session_id, server_type, domain || null, include_legal || false);

    // Mettre à jour la génération avec le chemin du ZIP
    updateGeneration(session_id, { zip_path: zipPath });

    res.json({
      success: true,
      message: 'Pack généré avec succès',
      download_url: `/api/payment/download/${session_id}`,
      session_id
    });
  } catch (error) {
    console.error('Erreur génération:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du pack', details: error.message });
  }
});

export default router;


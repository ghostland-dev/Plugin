import express from 'express';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import {
  createGeneration,
  getGenerationBySessionId,
  updateGeneration
} from '../utils/database.js';
import { createZipFile } from '../utils/zipCreator.js';
import { sendDownloadEmail } from '../utils/emailSender.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const router = express.Router();

// Validation pour la création de session
const paymentValidation = [
  body('server_type').isIn([
    'apache', 'nginx', 'nodejs', 'nextjs', 
    'tomcat', 'caddy', 'iis', 'lighttpd'
  ]).withMessage('Type de serveur invalide'),
  body('domain').optional().isString(),
  body('include_legal').optional().isBoolean(),
  body('email').optional().isEmail().withMessage('Email invalide')
];

// Créer une session de paiement Stripe
router.post('/create-session', paymentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY non configuré');
      console.error('   Variables d\'environnement disponibles:', Object.keys(process.env).filter(k => k.includes('STRIPE')));
      return res.status(500).json({ 
        error: 'Stripe non configuré',
        details: 'La variable d\'environnement STRIPE_SECRET_KEY n\'est pas définie. Vérifiez la configuration dans Vercel Dashboard > Settings > Environment Variables.'
      });
    }

    const { server_type, domain, include_legal, email } = req.body;
    const sessionId = uuidv4();

    // Créer l'entrée en base de données
    try {
      createGeneration({
        session_id: sessionId,
        domain: domain || null,
        server_type,
        include_legal: include_legal || false,
        email: email || null
      });
      console.log(`✅ Génération créée en base pour session: ${sessionId}`);
    } catch (dbError) {
      console.error('❌ Erreur création génération en base:', dbError);
      // Ne pas bloquer, mais logger l'erreur
    }

    // Créer la session Stripe Checkout avec le prix existant
    const stripePriceId = process.env.STRIPE_PRICE_ID || 'price_1SPAL9EDWgz2TvU16QPlkmg5';
    
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: stripePriceId, // Utiliser le prix ID Stripe existant
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success?session_id=${sessionId}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancel`,
        client_reference_id: sessionId,
        customer_email: email || undefined, // Fournir l'email pour Stripe Checkout si disponible
        metadata: {
          server_type,
          domain: domain || '',
          include_legal: include_legal ? 'true' : 'false'
        }
      });

      res.json({
        sessionId: session.id,
        clientSessionId: sessionId,
        url: session.url
      });
    } catch (stripeError) {
      // Gestion spécifique des erreurs Stripe
      console.error('Erreur Stripe API:', stripeError);
      
      if (stripeError.type === 'StripeInvalidRequestError') {
        if (stripeError.message.includes('price')) {
          return res.status(400).json({ 
            error: 'Price ID invalide',
            details: `Le Price ID "${stripePriceId}" n'existe pas ou n'est pas accessible avec vos clés Stripe. Vérifiez STRIPE_PRICE_ID dans votre .env`,
            stripeError: stripeError.message
          });
        }
      }
      
      throw stripeError; // Relancer pour être géré par le catch principal
    }
  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    
    // Messages d'erreur plus détaillés
    let errorMessage = 'Erreur lors de la création de la session de paiement';
    let errorDetails = error.message;
    
    if (error.type === 'StripeAuthenticationError') {
      errorMessage = 'Clés Stripe invalides';
      errorDetails = 'Vérifiez que STRIPE_SECRET_KEY dans backend/.env est correcte (commence par sk_test_ ou sk_live_)';
    } else if (error.type === 'StripeInvalidRequestError' && error.message.includes('price')) {
      errorMessage = 'Price ID Stripe invalide';
      errorDetails = `Le Price ID "${process.env.STRIPE_PRICE_ID || 'price_1SPAL9EDWgz2TvU16QPlkmg5'}" n'existe pas ou n'est pas accessible. Vérifiez dans Stripe Dashboard.`;
    }
    
    res.status(500).json({ 
      error: errorMessage, 
      details: errorDetails,
      type: error.type || 'UnknownError'
    });
  }
});

// Webhook Stripe pour confirmer le paiement
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn('⚠️ STRIPE_WEBHOOK_SECRET non configuré');
      return res.status(400).send('Webhook secret manquant');
    }

    if (!sig) {
      console.error('⚠️ Signature Stripe manquante dans les headers');
      return res.status(400).send('Stripe signature manquante');
    }

    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log(`✅ Webhook reçu: ${event.type} [${event.id}]`);
  } catch (err) {
    console.error('❌ Erreur webhook:', err.message);
    console.error('   Secret utilisé:', process.env.STRIPE_WEBHOOK_SECRET ? `${process.env.STRIPE_WEBHOOK_SECRET.substring(0, 10)}...` : 'non défini');
    console.error('   Signature reçue:', sig ? `${sig.substring(0, 50)}...` : 'manquante');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer l'événement checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const sessionId = session.client_reference_id;

    console.log(`📦 Traitement checkout.session.completed pour session: ${sessionId || 'MANQUANT'}`);

    if (!sessionId) {
      console.warn('⚠️ Session ID manquant dans le webhook (peut être un événement de test)');
      console.log('   Détails session:', {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_email,
        metadata: session.metadata
      });
      
      // Pour les événements de test sans client_reference_id, on ignore silencieusement
      if (event.livemode === false && !sessionId) {
        console.log('   ℹ️ Événement de test ignoré (pas de client_reference_id)');
        return res.json({ received: true, ignored: 'test event without session_id' });
      }
      
      return res.status(400).send('Session ID manquant');
    }

    try {
      // Récupérer la génération
      const generation = getGenerationBySessionId(sessionId);
      if (!generation) {
        console.error(`❌ Génération non trouvée pour session: ${sessionId}`);
        return res.status(404).send('Génération non trouvée');
      }
      
      console.log(`✅ Génération trouvée pour session: ${sessionId}`);

      // Mettre à jour avec le payment_intent_id
      updateGeneration(sessionId, {
        payment_intent_id: session.payment_intent,
        email: session.customer_email || generation.email
      });

      // Générer le pack
      const zipPath = await createZipFile(
        sessionId,
        generation.server_type,
        generation.domain || null,
        generation.include_legal === 1
      );

      // Mettre à jour avec le chemin du ZIP
      updateGeneration(sessionId, { zip_path: zipPath });

      // Envoyer l'email si fourni
      const email = session.customer_email || generation.email;
      if (email) {
        console.log(`📧 Envoi email de confirmation et pack à: ${email}`);
        const emailResult = await sendDownloadEmail(email, sessionId, generation.domain, generation.server_type);
        if (emailResult.success) {
          console.log(`✅ Email envoyé avec succès à ${email}`);
        } else {
          console.error(`❌ Erreur envoi email: ${emailResult.error}`);
        }
      } else {
        console.log('⚠️ Pas d\'email fourni, email non envoyé');
      }

      console.log(`✅ Pack généré avec succès pour session: ${sessionId}`);
    } catch (error) {
      console.error('Erreur lors du traitement du webhook:', error);
    }
  }

  res.json({ received: true });
});

// Confirmer manuellement le paiement (fallback)
router.post('/confirm', async (req, res) => {
  try {
    const { session_id, payment_intent_id } = req.body;

    console.log(`🔍 Confirmation paiement pour session: ${session_id}`);

    if (!session_id) {
      return res.status(400).json({ error: 'session_id requis' });
    }

    const generation = getGenerationBySessionId(session_id);
    if (!generation) {
      console.error(`❌ Génération non trouvée pour session: ${session_id}`);
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    console.log(`✅ Génération trouvée: ${generation.id} - payment_intent_id: ${generation.payment_intent_id || 'MANQUANT'}`);

    // Si le pack est déjà généré
    if (generation.zip_path) {
      console.log(`✅ Pack déjà généré pour session: ${session_id}`);
      return res.json({
        success: true,
        message: 'Pack déjà généré',
        download_url: `/api/payment/download/${session_id}`
      });
    }

    // Si le paiement a déjà été confirmé mais le pack n'est pas encore généré
    if (generation.payment_intent_id) {
      console.log(`💰 Paiement déjà confirmé, génération du pack...`);
      
      // Générer le pack
      const zipPath = await createZipFile(
        session_id,
        generation.server_type,
        generation.domain || null,
        generation.include_legal === 1
      );
      
      updateGeneration(session_id, { zip_path: zipPath });

      // Envoyer l'email si fourni
      if (generation.email) {
        console.log(`📧 Envoi email de confirmation et pack à: ${generation.email}`);
        const emailResult = await sendDownloadEmail(generation.email, session_id, generation.domain, generation.server_type);
        if (emailResult.success) {
          console.log(`✅ Email envoyé avec succès à ${generation.email}`);
        } else {
          console.error(`❌ Erreur envoi email: ${emailResult.error}`);
        }
      }

      return res.json({
        success: true,
        message: 'Pack généré avec succès',
        download_url: `/api/payment/download/${session_id}`
      });
    }

    // Si le paiement n'est pas encore confirmé, essayer de vérifier avec Stripe Checkout Session
    if (!generation.payment_intent_id) {
      console.log(`🔍 Vérification du paiement via Stripe...`);
      
      try {
        // Récupérer toutes les sessions de checkout récentes et trouver celle qui correspond
        // Ou utiliser payment_intent_id si fourni
        let paymentIntent = null;
        
        if (payment_intent_id) {
          paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
        } else {
          // Essayer de trouver la session via client_reference_id
          // Note: Stripe ne permet pas de chercher par client_reference_id directement
          // On doit chercher les sessions récentes
          const sessions = await stripe.checkout.sessions.list({
            limit: 10,
          });
          
          const matchingSession = sessions.data.find(
            s => s.client_reference_id === session_id && s.payment_status === 'paid'
          );
          
          if (matchingSession && matchingSession.payment_intent) {
            paymentIntent = await stripe.paymentIntents.retrieve(matchingSession.payment_intent);
          }
        }
        
        if (paymentIntent && paymentIntent.status === 'succeeded') {
          console.log(`✅ Paiement confirmé via Stripe: ${paymentIntent.id}`);
          
          // Mettre à jour la génération
          updateGeneration(session_id, { 
            payment_intent_id: paymentIntent.id 
          });
          
          // Générer le pack
          const zipPath = await createZipFile(
            session_id,
            generation.server_type,
            generation.domain || null,
            generation.include_legal === 1
          );
          
          updateGeneration(session_id, { zip_path: zipPath });

          // Envoyer l'email si fourni
          if (generation.email) {
            await sendDownloadEmail(generation.email, session_id, generation.domain);
          }

          return res.json({
            success: true,
            message: 'Paiement confirmé et pack généré',
            download_url: `/api/payment/download/${session_id}`
          });
        }
      } catch (error) {
        console.error('❌ Erreur vérification paiement:', error.message);
        // Continue pour essayer autre chose
      }
    }

    // Si on arrive ici, le paiement n'est pas confirmé
    console.warn(`⚠️ Paiement non confirmé pour session: ${session_id}`);
    console.warn(`   Le webhook peut mettre quelques secondes à arriver.`);
    
    res.status(402).json({ 
      error: 'Paiement non encore confirmé',
      message: 'Le paiement peut mettre quelques secondes à être confirmé. Veuillez réessayer dans quelques instants ou vérifier votre email.',
      retry: true
    });
  } catch (error) {
    console.error('❌ Erreur confirmation paiement:', error);
    res.status(500).json({ error: 'Erreur lors de la confirmation', details: error.message });
  }
});

// Télécharger le fichier ZIP
router.get('/download/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const generation = getGenerationBySessionId(sessionId);

    if (!generation) {
      return res.status(404).json({ error: 'Session non trouvée' });
    }

    if (!generation.zip_path) {
      return res.status(404).json({ error: 'Pack non encore généré' });
    }

    // Vérifier si le fichier existe
    const fs = await import('fs');
    const pathModule = await import('path');
    
    // Sur Vercel, les fichiers peuvent être dans /tmp
    const zipPath = generation.zip_path;
    if (!fs.existsSync(zipPath)) {
      // Essayer aussi /tmp si sur Vercel
      const isVercel = process.env.VERCEL === '1';
      if (isVercel) {
        const tmpPath = pathModule.join('/tmp/downloads', pathModule.basename(zipPath));
        if (fs.existsSync(tmpPath)) {
          return res.download(tmpPath, `ai-shield-${sessionId}.zip`);
        }
      }
      return res.status(404).json({ error: 'Fichier ZIP introuvable' });
    }

    // Vérifier l'expiration
    const expiresAt = new Date(generation.expires_at);
    if (expiresAt < new Date()) {
      return res.status(410).json({ error: 'Le lien de téléchargement a expiré' });
    }

    // Envoyer le fichier
    res.download(generation.zip_path, `ai-shield-${sessionId}.zip`, (err) => {
      if (err) {
        console.error('Erreur téléchargement:', err);
        res.status(500).json({ error: 'Erreur lors du téléchargement' });
      }
    });
  } catch (error) {
    console.error('Erreur téléchargement:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement', details: error.message });
  }
});

export default router;


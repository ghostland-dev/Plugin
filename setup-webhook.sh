#!/bin/bash

# Script pour configurer et tester le webhook Stripe en local

echo "🔄 Configuration du webhook Stripe en local"
echo ""

# Vérifier que Stripe CLI est installé
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI n'est pas installé."
    echo "📥 Installez-le avec :"
    echo "   brew install stripe/stripe-cli/stripe"
    echo "   ou téléchargez depuis : https://stripe.com/docs/stripe-cli"
    exit 1
fi

# Vérifier que le backend est en cours d'exécution
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo "⚠️  Le backend n'est pas démarré sur le port 3001"
    echo "📝 Démarrez-le d'abord avec :"
    echo "   cd backend && npm run dev"
    exit 1
fi

echo "✅ Backend détecté sur http://localhost:3001"
echo ""
echo "🚀 Démarrage de Stripe CLI pour écouter les webhooks..."
echo ""
echo "📋 Instructions :"
echo "   1. Un secret webhook sera affiché (commence par whsec_...)"
echo "   2. Copiez ce secret"
echo "   3. Ajoutez-le dans backend/.env comme :"
echo "      STRIPE_WEBHOOK_SECRET=whsec_..."
echo "   4. Redémarrez le backend"
echo ""
echo "🔗 Webhook sera transféré vers : http://localhost:3001/api/payment/webhook"
echo ""
echo "Press Ctrl+C pour arrêter"
echo ""

# Lancer Stripe CLI
stripe listen --forward-to http://localhost:3001/api/payment/webhook


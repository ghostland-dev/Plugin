#!/bin/bash

# Script pour tester le webhook Stripe localement

echo "🧪 Test du webhook Stripe"
echo ""

# Vérifier que le backend tourne
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo "❌ Le backend n'est pas démarré sur le port 3001"
    echo "   Démarrez-le avec : npm run dev"
    exit 1
fi

echo "✅ Backend détecté"
echo ""

# Vérifier que Stripe CLI est installé
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI n'est pas installé"
    exit 1
fi

echo "📡 Déclenchement d'un événement de test..."
echo ""

# Déclencher un événement de test
stripe trigger checkout.session.completed

echo ""
echo "✅ Événement déclenché"
echo ""
echo "📋 Vérifiez les logs du backend pour voir si le webhook a été reçu :"
echo "   - Si vous voyez : ✅ Webhook reçu: checkout.session.completed"
echo "   - C'est que ça fonctionne !"
echo ""
echo "   Si vous voyez une erreur 400, vérifiez :"
echo "   - Que STRIPE_WEBHOOK_SECRET est configuré dans backend/.env"
echo "   - Que le backend a été redémarré après ajout du secret"
echo ""


# Configuration Webhook Stripe - Guide Complet

## 🔧 Configuration pour le Développement Local

### Méthode 1 : Utiliser Stripe CLI (Recommandé)

1. **Installer Stripe CLI**
   ```bash
   # Linux/macOS
   brew install stripe/stripe-cli/stripe
   
   # Ou télécharger depuis : https://stripe.com/docs/stripe-cli
   ```

2. **Se connecter à Stripe**
   ```bash
   stripe login
   ```
   Cela ouvrira votre navigateur pour vous authentifier.

3. **Écouter les événements webhook et les transférer vers votre backend**
   ```bash
   stripe listen --forward-to http://localhost:3001/api/payment/webhook
   ```
   
   Stripe CLI va :
   - Écouter les événements depuis votre compte Stripe
   - Les transférer automatiquement vers `http://localhost:3001/api/payment/webhook`
   - Afficher un secret webhook (commence par `whsec_...`)

4. **Copier le secret webhook**
   ```
   > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
   ```
   
   Copiez ce secret et ajoutez-le dans `backend/.env` :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

5. **Redémarrer le backend**
   ```bash
   # Le backend doit être en cours d'exécution
   # Le webhook sera automatiquement reçu
   ```

### Méthode 2 : Tester sans Stripe CLI (Fallback)

Si Stripe CLI ne fonctionne pas, vous pouvez utiliser la route `/api/payment/confirm` manuellement :

1. Après un paiement réussi sur Stripe Checkout, vous serez redirigé vers `/success?session_id=xxx`
2. La page `SuccessPage.jsx` appellera automatiquement `/api/payment/confirm`
3. Cette route vérifiera le paiement et génèrera le pack

**Note :** Cette méthode fonctionne mais le webhook automatique est plus fiable.

---

## 🌐 Configuration pour la Production

### Étape 1 : Configurer le Webhook dans Stripe Dashboard

1. **Accéder à Stripe Dashboard**
   - https://dashboard.stripe.com/webhooks
   - Ou : Dashboard > Developers > Webhooks

2. **Ajouter un endpoint**
   - Cliquez sur "Add endpoint"
   - URL de l'endpoint : `https://votre-domaine.com/api/payment/webhook`
   - Description : "AI-Shield Generator - Webhook de paiement"

3. **Sélectionner les événements**
   - Sélectionnez : `checkout.session.completed`
   - (Optionnel) : `payment_intent.succeeded`

4. **Récupérer le secret webhook**
   - Après création, cliquez sur le webhook
   - Dans "Signing secret", révélez la clé
   - Copiez le secret (commence par `whsec_...`)

5. **Ajouter dans votre `.env` de production**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

6. **Redémarrer votre backend**

---

## 🔍 Vérifier que le Webhook Fonctionne

### Test en Local avec Stripe CLI

1. **Démarrer Stripe CLI**
   ```bash
   stripe listen --forward-to http://localhost:3001/api/payment/webhook
   ```

2. **Créer un événement de test**
   ```bash
   stripe trigger checkout.session.completed
   ```

3. **Vérifier les logs du backend**
   - Vous devriez voir : `✅ Pack généré pour session: xxx`

### Test en Production

1. **Utiliser Stripe Dashboard > Webhooks > Tester**
   - Sélectionnez votre webhook
   - Cliquez sur "Send test webhook"
   - Sélectionnez l'événement : `checkout.session.completed`

2. **Vérifier les logs de votre serveur**
   - Vérifiez que le webhook est reçu
   - Vérifiez que le pack est généré

---

## ❌ Résolution des Problèmes

### Erreur : "Failed to POST: Post "http://localhost:4242/webhooks": dial tcp 127.0.0.1:4242: connect: connection refused"

**Cause :** Stripe CLI essaie d'envoyer vers un port qui n'est pas en écoute.

**Solution :**
1. Vérifiez que votre backend est démarré sur le port 3001
2. Utilisez la commande correcte :
   ```bash
   stripe listen --forward-to http://localhost:3001/api/payment/webhook
   ```
   (Pas `--forward-to http://localhost:4242`)

### Erreur : "Webhook Error: No signatures found matching the expected signature"

**Cause :** Le secret webhook dans `.env` ne correspond pas.

**Solution :**
1. Vérifiez que `STRIPE_WEBHOOK_SECRET` dans `backend/.env` correspond au secret affiché par Stripe CLI
2. Pour la production, utilisez le secret du Dashboard Stripe

### Le webhook n'est pas reçu

**Vérifications :**
1. ✅ Backend est démarré et accessible
2. ✅ Route `/api/payment/webhook` est correctement configurée
3. ✅ `STRIPE_WEBHOOK_SECRET` est défini dans `.env`
4. ✅ Stripe CLI est en cours d'exécution (en local)
5. ✅ URL du webhook est correcte dans Stripe Dashboard (en production)

### Tester sans webhook (temporaire)

Si vous voulez tester sans webhook, utilisez la route `/api/payment/confirm` :

```bash
curl -X POST http://localhost:3001/api/payment/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "votre-session-id",
    "payment_intent_id": "pi_xxxxx"
  }'
```

---

## 📝 Structure du Webhook

Votre endpoint webhook (`/api/payment/webhook`) :

1. **Reçoit l'événement** de Stripe
2. **Vérifie la signature** avec `STRIPE_WEBHOOK_SECRET`
3. **Gère l'événement** `checkout.session.completed`
4. **Génère le pack** automatiquement
5. **Envoie l'email** si fourni

---

## 🔐 Sécurité

- ✅ **Toujours vérifier la signature** du webhook
- ✅ **Utiliser HTTPS** en production
- ✅ **Ne jamais exposer** `STRIPE_WEBHOOK_SECRET` dans le code
- ✅ **Limiter les IPs** si possible (optionnel)

---

## 📚 Ressources

- [Documentation Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Webhook Testing Guide](https://stripe.com/docs/webhooks/test)


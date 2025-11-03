# 🚀 Guide de Démarrage Rapide - AI-Shield Generator

## Installation en 5 minutes

### 1. Prérequis

```bash
# Vérifier Node.js (18+)
node --version

# Installer les dépendances
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configuration Backend

Créez `backend/.env` :

```env
PORT=3001
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@example.com
FRONTEND_URL=http://localhost:5173
```

### 3. Configuration Frontend

Créez `frontend/.env` :

```env
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Démarrer l'application

```bash
# Depuis la racine du projet
npm run dev
```

Ou séparément :

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Accéder à l'application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/api/health

## 🧪 Test Local

### Sans Stripe (pour tester l'interface)

Vous pouvez tester l'interface sans Stripe en commentant temporairement la redirection Stripe dans `PaymentForm.jsx`.

### Avec Stripe (recommandé)

1. **Créer un compte Stripe**
   - https://stripe.com
   - Utilisez les clés de **test** pour le développement

2. **Configurer le webhook localement**
   
   **⚠️ Important :** Assurez-vous que votre backend est démarré sur le port 3001 !
   
   ```bash
   # Vérifier que le backend tourne
   curl http://localhost:3001/api/health
   
   # Lancer Stripe CLI pour écouter les webhooks
   stripe listen --forward-to http://localhost:3001/api/payment/webhook
   ```
   
   - Stripe CLI va afficher un secret webhook (commence par `whsec_...`)
   - Copiez ce secret et ajoutez-le dans `backend/.env` comme `STRIPE_WEBHOOK_SECRET`
   
   **📝 Note :** Le port doit être `3001` (votre backend), pas `4242` !

3. **Tester un paiement**
   - Utilisez la carte de test : `4242 4242 4242 4242`
   - Date d'expiration : n'importe quelle date future
   - CVC : n'importe quel 3 chiffres

## 📦 Structure du Projet

```
ai-shield-generator/
├── backend/          # API Express + SQLite
├── frontend/         # React + Vite + TailwindCSS
├── docs/            # Documentation
└── README.md        # Documentation complète
```

## 🔧 Problèmes Courants

### Erreur "Stripe non configuré"
- Vérifiez que `VITE_STRIPE_PUBLISHABLE_KEY` est dans `frontend/.env`
- Vérifiez que la clé commence par `pk_test_` ou `pk_live_`

### Erreur "RESEND_API_KEY non configuré"
- L'email ne sera pas envoyé, mais le pack sera généré
- Pour tester l'email, créez un compte sur https://resend.com

### Erreur "Base de données"
- La base SQLite sera créée automatiquement au premier lancement
- Vérifiez les permissions du dossier `backend/`

### Le webhook Stripe ne fonctionne pas
- Utilisez `stripe listen` pour tester localement
- En production, configurez le webhook dans Stripe Dashboard

## ✅ Checklist de Développement

- [ ] Node.js 18+ installé
- [ ] Dépendances installées (`npm install` dans chaque dossier)
- [ ] Fichiers `.env` créés avec les clés
- [ ] Stripe configuré (au moins les clés de test)
- [ ] Backend démarre sans erreur
- [ ] Frontend démarre sans erreur
- [ ] Health check répond OK
- [ ] Test de génération d'un pack

## 📚 Documentation Complète

- **README.md** : Documentation complète du projet
- **docs/API_endpoints.md** : Documentation de l'API
- **DEPLOYMENT.md** : Guide de déploiement en production

## 🎯 Prochaines Étapes

1. **Tester localement** avec Stripe en mode test
2. **Personnaliser** les fichiers générés si besoin
3. **Déployer** en production (voir DEPLOYMENT.md)
4. **Configurer** les domaines et HTTPS
5. **Activer** Stripe en mode Live

## 🆘 Support

En cas de problème :
1. Vérifiez les logs du backend et du frontend
2. Vérifiez que tous les fichiers `.env` sont correctement configurés
3. Consultez la documentation dans `docs/`
4. Ouvrez une issue sur GitHub


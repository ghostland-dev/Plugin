# Guide de Déploiement sur Vercel

Ce guide explique comment déployer automatiquement l'application AI-Shield Generator sur Vercel.

## 📋 Prérequis

1. Un compte [Vercel](https://vercel.com)
2. Un compte [Stripe](https://stripe.com) avec des clés API
3. Un compte [Resend](https://resend.com) pour l'envoi d'emails
4. Le code source du projet dans un dépôt Git (GitHub, GitLab, ou Bitbucket)

---

## 🚀 Déploiement Rapide

### Étape 1 : Préparer le projet

1. **Assurez-vous que tous les fichiers sont commités :**
   ```bash
   git add .
   git commit -m "Preparation pour déploiement Vercel"
   git push origin main
   ```

2. **Vérifiez que les fichiers suivants existent :**
   - ✅ `vercel.json` à la racine du projet
   - ✅ `api/index.js` pour les Serverless Functions
   - ✅ `package.json` avec le script `vercel-build`
   - ✅ Tous les fichiers sont à jour

### Étape 2 : Connecter le projet à Vercel

1. **Allez sur [vercel.com](https://vercel.com) et connectez-vous**

2. **Cliquez sur "Add New Project"**

3. **Importez votre dépôt Git :**
   - Sélectionnez votre dépôt (GitHub, GitLab, ou Bitbucket)
   - Vercel détectera automatiquement la configuration

4. **Configurez les paramètres du projet :**
   - **Framework Preset**: Vite
   - **Root Directory**: `/` (racine du projet)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`

### Étape 3 : Configurer les Variables d'Environnement

Dans les paramètres du projet Vercel, allez dans **Settings > Environment Variables** et ajoutez :

#### Variables Frontend

```
VITE_API_URL=https://votre-projet.vercel.app/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_publique_stripe
```

#### Variables Backend (pour les Serverless Functions)

```
NODE_ENV=production
PORT=3001

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_votre_cle_secrete_stripe
STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_publique_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook_stripe
STRIPE_PRICE_ID=price_votre_price_id_stripe

# Resend (Email Service)
RESEND_API_KEY=re_votre_cle_api_resend
RESEND_FROM_EMAIL=noreply@votredomaine.com

# URLs
FRONTEND_URL=https://votre-projet.vercel.app
BACKEND_URL=https://votre-projet.vercel.app/api
```

### Étape 4 : Configurer Stripe Webhooks

1. **Dans votre dashboard Stripe**, allez dans **Developers > Webhooks**

2. **Ajoutez un nouveau webhook endpoint :**
   - **URL**: `https://votre-projet.vercel.app/api/payment/webhook`
   - **Événements à écouter**: `checkout.session.completed`

3. **Copiez le Webhook Signing Secret** et ajoutez-le dans les variables d'environnement Vercel comme `STRIPE_WEBHOOK_SECRET`

### Étape 5 : Déployer

1. **Vercel déploiera automatiquement** dès que vous poussez sur votre branche principale

2. **Ou déployez manuellement :**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

3. **Pour les déploiements de production :**
   ```bash
   vercel --prod
   ```

---

## 📁 Structure des Fichiers pour Vercel

```
.
├── vercel.json              # Configuration Vercel
├── api/
│   └── index.js            # Serverless Function pour le backend
├── frontend/                # Application React
│   ├── dist/                # Build output (généré)
│   ├── src/
│   └── package.json
├── backend/                 # API Express
│   ├── routes/
│   ├── utils/
│   └── package.json
└── .vercelignore           # Fichiers à ignorer
```

---

## 🔧 Configuration Avancée

### Variables d'Environnement par Environnement

Dans Vercel, vous pouvez définir des variables différentes pour :
- **Production** : Variables pour la production
- **Preview** : Variables pour les preview deployments
- **Development** : Variables pour le développement local

### Base de Données SQLite sur Vercel

⚠️ **Important** : SQLite avec `better-sqlite3` peut avoir des problèmes sur Vercel Serverless Functions car :
- Les fonctions serverless sont stateless
- Le système de fichiers est read-only sauf `/tmp`
- Chaque invocation peut être sur une nouvelle instance

**Solution actuelle :**
- La base de données est stockée dans `/tmp/db.sqlite` sur Vercel
- ⚠️ **Les données sont temporaires** et peuvent être perdues entre les invocations
- Pour la production, **migrez vers une base de données cloud** (voir ci-dessous)

**Solutions recommandées pour la production :**

1. **Utiliser une base de données cloud** (recommandé) :
   - [Supabase](https://supabase.com) (PostgreSQL) - Gratuit jusqu'à 500MB
   - [PlanetScale](https://planetscale.com) (MySQL) - Gratuit jusqu'à 5GB
   - [Turso](https://turso.tech) (SQLite cloud) - Gratuit jusqu'à 500MB
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) - Intégration native

2. **Migration recommandée :**
   - Modifier `backend/utils/database.js` pour utiliser une base de données cloud
   - Utiliser un client ORM comme Prisma ou Drizzle pour faciliter la migration

### Fichiers de Téléchargement

Pour les fichiers ZIP générés :
- **Solution actuelle** : Stockage dans `/tmp/downloads` sur Vercel (temporaire)
- ⚠️ **Les fichiers sont perdus** après chaque invocation serverless
- ✅ **L'email avec le lien de téléchargement** permet de récupérer le fichier

**Solutions recommandées pour la production :**

1. **Utiliser un service de stockage cloud** :
   - [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob) - Gratuit jusqu'à 1GB
   - [AWS S3](https://aws.amazon.com/s3/) - Pay-as-you-go
   - [Cloudflare R2](https://www.cloudflare.com/products/r2/) - Gratuit jusqu'à 10GB/mois
   - [Supabase Storage](https://supabase.com/storage) - Gratuit jusqu'à 1GB

2. **Migration recommandée :**
   - Modifier `backend/utils/zipCreator.js` pour uploader vers le stockage cloud
   - Générer une URL signée pour le téléchargement
   - Les fichiers sont persistants et accessibles via URL

---

## 🧪 Test Local avec Vercel CLI

1. **Installer Vercel CLI :**
   ```bash
   npm i -g vercel
   ```

2. **Se connecter :**
   ```bash
   vercel login
   ```

3. **Lier le projet :**
   ```bash
   vercel link
   ```

4. **Tester localement :**
   ```bash
   vercel dev
   ```
   Cela démarre un serveur local qui simule Vercel avec les rewrites et les Serverless Functions.

5. **Déployer en preview :**
   ```bash
   vercel
   ```
   Cela crée un déploiement preview sur Vercel.

6. **Déployer en production :**
   ```bash
   vercel --prod
   ```

## ✅ Test du Déploiement

Après avoir déployé sur Vercel, vous pouvez tester votre application :

1. **Utiliser le script de test :**
   ```bash
   ./vercel-test.sh https://votre-projet.vercel.app
   ```

2. **Ou tester manuellement :**
   - Frontend : `https://votre-projet.vercel.app/`
   - API Health : `https://votre-projet.vercel.app/api/health`
   - Sitemap : `https://votre-projet.vercel.app/sitemap.xml`
   - Robots.txt : `https://votre-projet.vercel.app/robots.txt`

---

## 🔍 Vérification du Déploiement

### Vérifier que le Frontend fonctionne

1. Visitez `https://votre-projet.vercel.app`
2. Vérifiez que la page se charge correctement
3. Testez le dark mode toggle

### Vérifier que l'API fonctionne

1. Testez le health check :
   ```bash
   curl https://votre-projet.vercel.app/api/health
   ```

2. Testez une route API :
   ```bash
   curl https://votre-projet.vercel.app/api/admin/stats
   ```

### Vérifier les Fichiers Statiques

1. Testez le sitemap :
   ```bash
   curl https://votre-projet.vercel.app/sitemap.xml
   ```

2. Testez robots.txt :
   ```bash
   curl https://votre-projet.vercel.app/robots.txt
   ```

---

## 🐛 Dépannage

### Erreur : "Module not found"

- Vérifiez que tous les `node_modules` sont installés
- Vérifiez que les paths d'import sont corrects
- Utilisez des imports relatifs plutôt qu'absolus

### Erreur : "Database locked" ou "SQLite"

- SQLite ne fonctionne pas bien sur Vercel Serverless
- Migrez vers une base de données cloud (Supabase, PlanetScale)

### Erreur : "File not found" pour les téléchargements

- Les fichiers dans `/tmp` sont temporaires
- Utilisez un service de stockage cloud (S3, Vercel Blob)

### Erreur : "Function timeout"

- Augmentez `maxDuration` dans `vercel.json`
- Optimisez le code pour réduire le temps d'exécution

### Variables d'environnement non chargées

- Vérifiez que les variables sont définies dans Vercel Dashboard
- Utilisez le préfixe `VITE_` pour les variables frontend
- Redéployez après avoir ajouté des variables

---

## 📊 Monitoring

Vercel fournit automatiquement :
- **Analytics** : Trafic et performances
- **Logs** : Logs des Serverless Functions
- **Real-time** : Déploiements en temps réel

Accédez aux logs :
```bash
vercel logs
```

---

## 🔄 Déploiement Automatique

Vercel déploie automatiquement :
- **Sur push vers `main`** : Production
- **Sur pull requests** : Preview deployments
- **Sur autres branches** : Preview deployments

Pour désactiver :
- Allez dans **Project Settings > Git**
- Désactivez les déploiements automatiques

---

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Variables d'environnement Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel CLI](https://vercel.com/docs/cli)

---

## ✅ Checklist de Déploiement

- [ ] Code commité et poussé sur Git
- [ ] Variables d'environnement configurées dans Vercel
- [ ] Stripe webhook configuré avec l'URL Vercel
- [ ] Test de déploiement en preview réussi
- [ ] Health check API fonctionne
- [ ] Test d'un paiement complet
- [ ] Vérification de l'envoi d'email
- [ ] Monitoring activé

---

## 🎉 C'est prêt !

Une fois déployé, votre application sera accessible sur :
- **Production** : `https://votre-projet.vercel.app`
- **Preview** : `https://votre-projet-git-branche.vercel.app`

Vercel gère automatiquement :
- ✅ HTTPS
- ✅ CDN
- ✅ Scaling
- ✅ Analytics
- ✅ Monitoring


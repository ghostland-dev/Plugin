# Guide de Déploiement - AI-Shield Generator

Ce guide vous explique comment déployer AI-Shield Generator en production.

## 🚀 Déploiement Backend (Render / Railway / VPS)

### Option 1: Render

1. **Créer un nouveau service Web**
   - Connectez-vous à [Render](https://render.com)
   - Cliquez sur "New +" > "Web Service"
   - Connectez votre repository GitHub

2. **Configuration**
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Root Directory:** `/backend`

3. **Variables d'environnement**
   ```
   PORT=10000
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=noreply@votredomaine.com
   FRONTEND_URL=https://votredomaine.com
   ```

4. **Webhook Stripe**
   - Dans Stripe Dashboard > Webhooks
   - URL: `https://votre-service.render.com/api/payment/webhook`
   - Événements: `checkout.session.completed`

### Option 2: Railway

1. **Créer un nouveau projet**
   - Connectez votre repository GitHub
   - Railway détecte automatiquement Node.js

2. **Configuration**
   - Définissez le dossier racine: `backend`
   - Ajoutez les variables d'environnement (voir ci-dessus)

3. **Webhook Stripe**
   - URL: `https://votre-projet.railway.app/api/payment/webhook`

### Option 3: VPS (Ubuntu/Debian)

```bash
# Installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cloner le projet
git clone <repository-url>
cd ai-shield-generator/backend

# Installer les dépendances
npm install --production

# Créer le fichier .env
nano .env
# (Copiez les variables d'environnement)

# Installer PM2
sudo npm install -g pm2

# Démarrer l'application
pm2 start index.js --name ai-shield-backend

# Sauvegarder la configuration PM2
pm2 save
pm2 startup
```

**Nginx Reverse Proxy:**
```nginx
server {
    listen 80;
    server_name api.votredomaine.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🎨 Déploiement Frontend (Vercel / Netlify)

### Option 1: Vercel

1. **Importer le projet**
   - Allez sur [Vercel](https://vercel.com)
   - "Add New Project" > Importez votre repository

2. **Configuration**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

3. **Variables d'environnement**
   ```
   VITE_API_URL=https://api.votredomaine.com
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```

### Option 2: Netlify

1. **Importer le projet**
   - Allez sur [Netlify](https://netlify.com)
   - "Add new site" > Importez votre repository

2. **Configuration**
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`

3. **Variables d'environnement** (dans Netlify Dashboard)
   - Mêmes variables que Vercel

## 🔐 Configuration Stripe

1. **Clés API**
   - Dashboard Stripe > Developers > API keys
   - Utilisez les clés **Live** en production
   - Copiez la clé secrète et la clé publique

2. **Webhook**
   - Dashboard > Webhooks > Add endpoint
   - URL: `https://votre-backend.com/api/payment/webhook`
   - Événements à écouter: `checkout.session.completed`
   - Copiez le Webhook Secret (commence par `whsec_`)

## 📧 Configuration Resend (Email)

1. **Créer un compte**
   - Allez sur [Resend](https://resend.com)
   - Créez un compte gratuit

2. **Obtenir la clé API**
   - Dashboard > API Keys > Create API Key
   - Copiez la clé (commence par `re_`)

3. **Vérifier le domaine (optionnel mais recommandé)**
   - Ajoutez votre domaine dans Resend
   - Configurez les enregistrements DNS

## 🔒 Sécurité

### HTTPS
- **Obligatoire** en production
- Vercel/Netlify le gère automatiquement
- Pour votre VPS, utilisez Let's Encrypt avec Certbot

### Variables d'environnement
- **Ne jamais commiter** les fichiers `.env`
- Utilisez les secrets de votre plateforme d'hébergement

### Rate Limiting
- Déjà configuré : 3 générations/IP/jour
- Peut être ajusté dans `backend/index.js`

## 📊 Monitoring

### Health Check
```bash
curl https://votre-backend.com/api/health
```

### Logs
- **Render:** Dashboard > Logs
- **Railway:** Dashboard > Deployments > View Logs
- **PM2:** `pm2 logs ai-shield-backend`

## 🧹 Maintenance

### Nettoyage automatique
- Les fichiers expirés sont nettoyés automatiquement toutes les heures
- Vérifiez les logs pour confirmer

### Sauvegarde de la base de données
```bash
# Backend SQLite
cp backend/db.sqlite backups/db-$(date +%Y%m%d).sqlite
```

## 🐛 Dépannage

### Le webhook Stripe ne fonctionne pas
- Vérifiez l'URL du webhook dans Stripe Dashboard
- Vérifiez le secret webhook dans `.env`
- Testez avec Stripe CLI: `stripe listen --forward-to localhost:3001/api/payment/webhook`

### Les emails ne sont pas envoyés
- Vérifiez `RESEND_API_KEY` dans `.env`
- Vérifiez les logs pour les erreurs Resend
- Si vous utilisez un domaine, vérifiez qu'il est vérifié dans Resend

### Erreur de téléchargement
- Vérifiez que le dossier `downloads/` existe
- Vérifiez les permissions du dossier
- Vérifiez que le fichier ZIP n'a pas expiré (24h)

## ✅ Checklist de déploiement

- [ ] Backend déployé avec toutes les variables d'environnement
- [ ] Frontend déployé avec les variables d'environnement
- [ ] Stripe configuré (clés Live + Webhook)
- [ ] Resend configuré avec clé API
- [ ] HTTPS activé partout
- [ ] Webhook Stripe testé
- [ ] Email de test envoyé
- [ ] Base de données créée et fonctionnelle
- [ ] Health check répond OK
- [ ] Téléchargement d'un pack testé

## 📞 Support

Pour toute question de déploiement, consultez:
- [Documentation Stripe](https://stripe.com/docs)
- [Documentation Resend](https://resend.com/docs)
- [Documentation Render](https://render.com/docs)
- [Documentation Vercel](https://vercel.com/docs)


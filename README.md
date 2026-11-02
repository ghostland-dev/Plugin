# AI-Shield Generator

Micro-SaaS permettant de générer automatiquement des fichiers de protection contre les bots d'intelligence artificielle et les scrapers pour les sites web.

## 🎯 Fonctionnalités

- ✅ Génération automatique de `robots.txt` bloquant tous les bots IA
- ✅ **8 types de serveurs supportés** :
  - Apache (.htaccess)
  - Nginx (nginx.conf)
  - Node.js / Express (middleware)
  - Next.js (next.config.js / middleware.js)
  - **Tomcat** (Filter Java + web.xml) 🆕
  - **Caddy** (Caddyfile) 🆕
  - **IIS** (web.config) 🆕
  - **Lighttpd** (lighttpd.conf) 🆕
- ✅ Instructions détaillées pour chaque serveur
- ✅ Clause légale optionnelle
- ✅ Paiement sécurisé via Stripe (5 €)
- ✅ Envoi automatique du pack par email
- ✅ Interface admin pour suivre les générations

## 🚀 Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Stripe (pour les paiements)
- Compte Resend (pour l'envoi d'emails)

### Configuration

1. **Cloner le projet**

```bash
git clone <repository-url>
cd ai-shield-generator
```

2. **Installer les dépendances**

```bash
# Installer les dépendances du projet
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Configurer les variables d'environnement**

Créez un fichier `.env` dans le dossier `backend/` :

```env
# Port du serveur
PORT=3001

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (Email)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@votredomaine.com

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

Créez un fichier `.env` dans le dossier `frontend/` :

```env
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Démarrage

**Développement (avec hot-reload):**

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

**Production:**

```bash
# Build du frontend
npm run build:frontend

# Démarrer le backend
npm start
```

## 📁 Structure du projet

```
ai-shield-generator/
├── backend/              # API Express
│   ├── routes/          # Routes API
│   ├── utils/          # Utilitaires (génération, ZIP, email, DB)
│   ├── downloads/      # Fichiers ZIP générés (temporaires)
│   └── db.sqlite       # Base de données SQLite
├── frontend/            # Application React
│   ├── src/
│   │   ├── components/  # Composants React
│   │   ├── pages/       # Pages React
│   │   └── utils/       # Utilitaires frontend
│   └── public/          # Fichiers statiques
└── docs/                # Documentation
```

## 🔧 API Endpoints

### POST `/api/payment/create-session`

Crée une session de paiement Stripe.

**Body:**
```json
{
  "server_type": "apache|nginx|nodejs|nextjs",
  "domain": "exemple.com",
  "include_legal": true,
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "clientSessionId": "uuid",
  "url": "https://checkout.stripe.com/..."
}
```

### POST `/api/payment/webhook`

Webhook Stripe pour confirmer les paiements (à configurer dans Stripe Dashboard).

### POST `/api/generate`

Génère le pack de fichiers (après paiement confirmé).

**Body:**
```json
{
  "session_id": "uuid",
  "server_type": "apache",
  "domain": "exemple.com",
  "include_legal": true
}
```

### GET `/api/payment/download/:sessionId`

Télécharge le fichier ZIP du pack généré.

### GET `/api/admin/stats`

Obtient les statistiques admin (total générations, revenus, etc.).

## 🛡️ Fichiers générés

Chaque pack contient :

- **robots.txt** : Liste complète des bots IA bloqués
- **.htaccess** ou **nginx.conf** ou **headers.js** : Selon le type de serveur
- **legal.txt** : Clause légale (si demandée)
- **README.md** : Instructions d'installation

## 🔐 Sécurité

- Rate limiting : 3 générations par IP/jour
- Validation des entrées côté serveur
- Vérification du paiement avant génération
- Suppression automatique des fichiers ZIP après 24h
- HTTPS recommandé en production

## 📦 Déploiement

### Vercel / Netlify (Frontend)

1. Build du frontend : `npm run build:frontend`
2. Déployer le dossier `frontend/dist`
3. Configurer les variables d'environnement

### Render / Railway (Backend)

1. Déployer le dossier `backend/`
2. Configurer les variables d'environnement
3. Installer les dépendances : `npm install`
4. Démarrer : `npm start`

## 📝 Licence

MIT

## 🤝 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

## Author

**Ismail.M**, Software Engineer & DevOps

- GitHub: [@ghostland-dev](https://github.com/ghostland-dev)
- Website: [ismail-mouyahada.com](https://www.ismail-mouyahada.com)

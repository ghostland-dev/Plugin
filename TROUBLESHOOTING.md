# Guide de Dépannage - AI-Shield Generator

## 🔴 Problèmes Courants

### 1. Erreur "ERR_BLOCKED_BY_ADBLOCKER" ou "Failed to fetch" avec Stripe

**Symptôme :**
```
POST https://r.stripe.com/b net::ERR_BLOCKED_BY_ADBLOCKER
Uncaught (in promise) FetchError: Error fetching https://r.stripe.com/b: Failed to fetch
```

**Cause :**
Un bloqueur de publicité (AdBlocker) bloque les requêtes vers Stripe.

**Solutions :**

1. **Désactiver l'AdBlocker pour ce site** (recommandé)
   - Cliquez sur l'icône de votre bloqueur de publicité dans la barre d'outils
   - Ajoutez `localhost:5173` ou votre domaine à la liste blanche
   - Rechargez la page

2. **Utiliser une fenêtre de navigation privée**
   - Ouvre Chrome/Firefox en mode navigation privée
   - Les extensions sont souvent désactivées en mode privé

3. **Désactiver temporairement l'AdBlocker**
   - Désactivez votre bloqueur de publicité
   - Testez le paiement
   - Réactivez-le après

4. **Pour les développeurs** : Utiliser Stripe CLI en mode local
   ```bash
   stripe listen --forward-to localhost:3001/api/payment/webhook
   ```

---

### 2. Erreur "Stripe non configuré"

**Symptôme :**
```
Stripe non configuré. Vérifiez votre clé publique Stripe.
```

**Solution :**
1. Vérifiez que `VITE_STRIPE_PUBLISHABLE_KEY` est définie dans `frontend/.env`
2. Vérifiez que la clé commence par `pk_test_` (test) ou `pk_live_` (production)
3. Redémarrez le serveur frontend après modification du `.env`

---

### 3. Erreur de connexion au backend

**Symptôme :**
```
Failed to fetch
Network Error
```

**Solutions :**
1. Vérifiez que le backend est démarré : `curl http://localhost:3001/api/health`
2. Vérifiez que `VITE_API_URL` dans `frontend/.env` pointe vers le bon backend
3. Vérifiez les CORS dans `backend/index.js`

---

### 4. Le webhook Stripe ne fonctionne pas

**Symptôme :**
Le paiement réussit mais le pack n'est pas généré.

**Solutions :**

1. **En local :** Utiliser Stripe CLI
   ```bash
   stripe listen --forward-to localhost:3001/api/payment/webhook
   ```
   Copiez le `whsec_...` dans votre `backend/.env` comme `STRIPE_WEBHOOK_SECRET`

2. **En production :** Configurer le webhook dans Stripe Dashboard
   - Allez dans Stripe Dashboard > Webhooks
   - Ajoutez l'endpoint : `https://votre-domaine.com/api/payment/webhook`
   - Sélectionnez l'événement : `checkout.session.completed`
   - Copiez le secret webhook dans votre `.env`

---

### 5. Base de données SQLite verrouillée

**Symptôme :**
```
SQLITE_BUSY: database is locked
```

**Solution :**
- Fermez tous les processus qui utilisent la base de données
- Vérifiez qu'un seul serveur backend tourne à la fois
- Redémarrez le backend

---

### 6. Port déjà utilisé

**Symptôme :**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution :**
```bash
# Trouver le processus utilisant le port
lsof -ti:3001

# Ou pour le port 5173
lsof -ti:5173

# Arrêter le processus
kill -9 <PID>
```

---

## 🟡 Avertissements (Non critiques)

### Warnings React Router

Ces warnings sont normaux et n'affectent pas le fonctionnement :
```
⚠️ React Router Future Flag Warning
```

**Solution :** Peut être ignoré, ou ajouter les flags dans `App.jsx` :
```javascript
<Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```

---

### Avertissement Stripe HTTP

```
You may test your Stripe.js integration over HTTP
```

**Explication :** Normal en développement local. En production, utilisez HTTPS.

**Solution :** Pas d'action nécessaire en local. En production, déployez avec HTTPS.

---

### Erreurs d'extension Chrome

```
Request was blocked by DevTools: "chrome-extension://..."
```

**Explication :** Certaines extensions Chrome peuvent interférer.

**Solution :** Désactivez temporairement les extensions, ou ignorez ces erreurs.

---

## ✅ Checklist de Débogage

- [ ] Backend démarré et répond : `curl http://localhost:3001/api/health`
- [ ] Frontend démarré : `curl http://localhost:5173`
- [ ] Variables d'environnement configurées (`.env` dans backend et frontend)
- [ ] Stripe clés configurées (test ou live)
- [ ] Webhook configuré (local ou production)
- [ ] AdBlocker désactivé ou site en liste blanche
- [ ] Console navigateur sans erreurs critiques

---

## 📞 Obtenir de l'aide

Si le problème persiste :
1. Vérifiez les logs du backend dans le terminal
2. Ouvrez la console du navigateur (F12) pour voir les erreurs
3. Vérifiez que toutes les dépendances sont installées : `npm install`
4. Consultez la documentation Stripe : https://stripe.com/docs


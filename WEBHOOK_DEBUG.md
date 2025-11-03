# Debug Webhook Stripe - Erreur 400

## 🔴 Problème

Le webhook Stripe retourne une erreur 400 :
```
<--  [400] POST http://localhost:3001/api/payment/webhook [evt_xxx]
```

## ✅ Solutions

### 1. Vérifier que le secret webhook est correct

Le secret webhook affiché par Stripe CLI doit être dans `backend/.env` :

```bash
# Dans le terminal Stripe CLI, vous voyez :
Your webhook signing secret is whsec_aa2df80998c245715cdb18499f35c0ba6f87b20845f5b191fa913affdb5fd7bb

# Vérifiez que c'est le même dans backend/.env :
STRIPE_WEBHOOK_SECRET=whsec_aa2df80998c245715cdb18499f35c0ba6f87b20845f5b191fa913affdb5fd7bb
```

### 2. Redémarrer le backend

**IMPORTANT :** Après avoir ajouté ou modifié `STRIPE_WEBHOOK_SECRET`, vous devez **redémarrer le backend** pour qu'il charge la nouvelle valeur.

```bash
# Arrêter le backend
pkill -f "nodemon.*index.js"

# Redémarrer
cd backend && npm run dev
# ou depuis la racine :
npm run dev
```

### 3. Vérifier les logs du backend

Avec les nouveaux logs améliorés, vous devriez voir :

**Si ça fonctionne :**
```
✅ Webhook reçu: checkout.session.completed [evt_xxx]
✅ Pack généré pour session: xxx
```

**Si ça ne fonctionne pas :**
```
❌ Erreur webhook: No signatures found matching the expected signature
   Secret utilisé: whsec_aa2df...
   Signature reçue: t=...,v1=...
```

### 4. Causes possibles d'erreur 400

#### A. Secret webhook incorrect ou manquant

**Solution :**
1. Copiez le secret affiché par Stripe CLI (commence par `whsec_`)
2. Ajoutez-le dans `backend/.env` :
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   ```
3. Redémarrez le backend

#### B. Le backend n'a pas été redémarré

**Solution :**
```bash
# Arrêter et redémarrer
pkill -f nodemon
npm run dev
```

#### C. Problème avec la signature

Si la signature ne correspond pas, c'est généralement parce que :
- Le secret webhook dans `.env` ne correspond pas à celui de Stripe CLI
- Le backend utilise une ancienne valeur en cache (non redémarré)

**Solution :**
- Vérifiez que le secret dans `.env` correspond exactement à celui affiché par Stripe CLI
- Redémarrez le backend

### 5. Vérifier que Stripe CLI utilise le bon endpoint

Assurez-vous que Stripe CLI transfère vers le bon port :

```bash
# Vérifiez la commande Stripe CLI :
stripe listen --forward-to http://localhost:3001/api/payment/webhook
```

**⚠️ IMPORTANT :** Le port doit être `3001` (votre backend), pas `4242` !

### 6. Tester manuellement

Vous pouvez tester si le webhook fonctionne en déclenchant un événement de test :

```bash
# Dans un autre terminal, pendant que Stripe CLI écoute :
stripe trigger checkout.session.completed
```

Vous devriez voir dans les logs du backend :
```
✅ Webhook reçu: checkout.session.completed [evt_test_xxx]
✅ Pack généré pour session: xxx
```

## 📝 Checklist de Résolution

- [ ] Secret webhook copié depuis Stripe CLI
- [ ] `STRIPE_WEBHOOK_SECRET` ajouté dans `backend/.env`
- [ ] Backend redémarré après modification
- [ ] Stripe CLI lancé avec le bon port : `stripe listen --forward-to http://localhost:3001/api/payment/webhook`
- [ ] Logs du backend affichent les détails de l'erreur (avec les nouveaux logs)
- [ ] Le secret dans `.env` correspond exactement à celui de Stripe CLI

## 🔍 Vérification

Après redémarrage du backend, regardez les logs quand un webhook arrive :

```bash
# Si vous voyez :
✅ Webhook reçu: checkout.session.completed [evt_xxx]
✅ Pack généré pour session: xxx

# C'est que ça fonctionne ! 🎉
```

Si vous voyez encore une erreur 400, les logs vous indiqueront exactement quel est le problème.


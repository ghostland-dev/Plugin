# Résolution du problème "Something went wrong" sur Stripe Checkout

## 🔴 Problème

Lors de l'accès à Stripe Checkout, vous voyez :
```
Something went wrong
You might be having a network connection problem, the link might be expired, 
or the payment provider cannot be reached at the moment.
```

## ✅ Solutions

### 1. Vérifier le Price ID Stripe

Le Price ID utilisé doit exister dans votre compte Stripe et correspondre à vos clés.

**Vérification :**

1. **Dans Stripe Dashboard :**
   - Allez dans Products > Prices
   - Vérifiez que le Price ID `price_1SPAL9EDWgz2TvU16QPlkmg5` existe
   - Vérifiez qu'il est **actif** (Status: Active)

2. **Correspondance Test/Live :**
   - Si vous utilisez des clés **test** (`sk_test_...`), le Price ID doit être un Price ID de **test**
   - Si vous utilisez des clés **live** (`sk_live_...`), le Price ID doit être un Price ID de **production**

**Solution :**

```bash
# Vérifier votre Price ID dans backend/.env
STRIPE_PRICE_ID=price_1SPAL9EDWgz2TvU16QPlkmg5

# Si le Price ID n'existe pas, créez-en un nouveau dans Stripe Dashboard :
# Products > Add Product > Set Price > Copy Price ID
```

---

### 2. Vérifier les Clés Stripe

Les clés Stripe (secrète et publique) doivent correspondre au même compte et au même mode (test/live).

**Vérification :**

```bash
# Backend (.env)
STRIPE_SECRET_KEY=sk_test_...  # Doit commencer par sk_test_ ou sk_live_

# Frontend (.env)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Doit correspondre au mode de STRIPE_SECRET_KEY
```

**Solution :**

1. **Récupérer les clés dans Stripe Dashboard :**
   - https://dashboard.stripe.com/apikeys
   - Copiez la clé secrète (commence par `sk_test_...`)
   - Copiez la clé publique (commence par `pk_test_...`)

2. **Mettre à jour vos fichiers .env :**
   ```env
   # backend/.env
   STRIPE_SECRET_KEY=sk_test_votre_cle_secrete
   
   # frontend/.env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique
   ```

3. **Redémarrer les serveurs** après modification

---

### 3. Vérifier que le Price ID est associé au bon compte

Si vous avez plusieurs comptes Stripe (test, production, différents comptes), assurez-vous que :
- Le Price ID existe dans le même compte que vos clés API
- Le Price ID est actif (Status: Active)
- Le Price ID n'a pas été supprimé

**Solution :**

1. Dans Stripe Dashboard, vérifiez que le Price ID existe et est actif
2. Si nécessaire, créez un nouveau produit et prix
3. Copiez le nouveau Price ID dans `backend/.env`

---

### 4. Le lien a expiré

Les liens Stripe Checkout expirent après 24 heures. Si vous essayez d'accéder à un ancien lien, il ne fonctionnera plus.

**Solution :**

1. Créez une nouvelle session de paiement depuis l'application
2. Utilisez le nouveau lien généré

---

### 5. Problème réseau / AdBlocker

Comme mentionné précédemment, les AdBlockers peuvent bloquer Stripe.

**Solution :**

- Désactivez l'AdBlocker pour `localhost:5173` ou votre domaine
- Utilisez une fenêtre de navigation privée

---

## 🔍 Debugging

### Vérifier les logs du backend

Quand vous créez une session, regardez les logs du backend :

```bash
# Vous devriez voir :
✅ Session créée: cs_test_...

# Ou une erreur comme :
❌ Erreur Stripe API: Invalid price ID
```

### Tester la création de session manuellement

```bash
curl -X POST http://localhost:3001/api/payment/create-session \
  -H "Content-Type: application/json" \
  -d '{
    "server_type": "apache",
    "domain": "test.com",
    "include_legal": true
  }'
```

**Réponse attendue :**
```json
{
  "sessionId": "cs_test_...",
  "clientSessionId": "...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Si erreur :**
```json
{
  "error": "Price ID invalide",
  "details": "..."
}
```

---

## 📝 Checklist de Résolution

- [ ] Price ID existe dans Stripe Dashboard et est actif
- [ ] Price ID correspond au mode (test/live) de vos clés Stripe
- [ ] Clés Stripe sont correctes et correspondent au même compte
- [ ] `STRIPE_PRICE_ID` est défini dans `backend/.env`
- [ ] Backend redémarré après modification du `.env`
- [ ] AdBlocker désactivé ou site en liste blanche
- [ ] Réseau fonctionne (pas de problème de connexion)

---

## 🆘 Si le problème persiste

1. **Créer un nouveau Price ID dans Stripe :**
   - Products > Add Product
   - Nom : "AI-Shield Generator Pack"
   - Prix : 5.00 EUR
   - Copiez le Price ID (commence par `price_...`)
   - Mettez à jour `STRIPE_PRICE_ID` dans `backend/.env`

2. **Vérifier les logs Stripe Dashboard :**
   - https://dashboard.stripe.com/logs
   - Recherchez les erreurs liées à votre Price ID

3. **Contacter le support Stripe** si nécessaire avec :
   - Le Price ID utilisé
   - L'erreur exacte
   - Les logs du backend


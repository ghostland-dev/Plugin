# Documentation API - AI-Shield Generator

## Base URL

```
http://localhost:3001/api
```

## Authentification

Aucune authentification requise pour les endpoints publics. Le paiement via Stripe assure la validation.

---

## Endpoints

### 1. Créer une session de paiement

**POST** `/payment/create-session`

Crée une session Stripe Checkout et enregistre la génération en base de données.

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
  "clientSessionId": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://checkout.stripe.com/..."
}
```

---

### 2. Webhook Stripe

**POST** `/payment/webhook`

Endpoint webhook pour recevoir les événements Stripe. À configurer dans le dashboard Stripe.

**Headers:**
```
stripe-signature: t=...,v1=...
```

**Body:** (Raw JSON from Stripe)

Gère automatiquement :
- Génération du pack après paiement
- Envoi de l'email
- Mise à jour de la base de données

---

### 3. Confirmer manuellement un paiement

**POST** `/payment/confirm`

Fallback si le webhook n'a pas fonctionné.

**Body:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_intent_id": "pi_..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Paiement confirmé et pack généré",
  "download_url": "/api/download/550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 4. Générer le pack

**POST** `/generate`

Génère le pack de fichiers (nécessite un paiement confirmé).

**Body:**
```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "server_type": "apache",
  "domain": "exemple.com",
  "include_legal": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pack généré avec succès",
  "download_url": "/api/download/550e8400-e29b-41d4-a716-446655440000",
  "session_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### 5. Télécharger le pack

**GET** `/payment/download/:sessionId`

Télécharge le fichier ZIP du pack généré.

**Response:**
- Type: `application/zip`
- Headers: `Content-Disposition: attachment; filename="ai-shield-{sessionId}.zip"`

**Erreurs possibles:**
- `404`: Session ou fichier non trouvé
- `410`: Lien expiré (24h)

---

### 6. Statistiques admin

**GET** `/admin/stats`

Obtient les statistiques des générations.

**Response:**
```json
{
  "total": 42,
  "revenue": 210,
  "byServerType": {
    "apache": 15,
    "nginx": 12,
    "nodejs": 10,
    "nextjs": 5
  },
  "generations": [
    {
      "id": 1,
      "session_id": "...",
      "domain": "exemple.com",
      "server_type": "apache",
      "include_legal": 1,
      "email": "user@example.com",
      "created_at": "2024-01-15 10:30:00"
    }
  ]
}
```

---

### 7. Health check

**GET** `/health`

Vérifie l'état du serveur.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Codes d'erreur

| Code | Signification |
|------|---------------|
| 400 | Requête invalide (validation échouée) |
| 402 | Paiement requis ou non confirmé |
| 404 | Ressource non trouvée |
| 410 | Lien expiré (téléchargement) |
| 429 | Rate limit dépassé (3/jour) |
| 500 | Erreur serveur |

---

## Rate Limiting

- **3 générations par IP par jour** pour l'endpoint `/generate`
- Window: 24 heures
- Headers de réponse: `X-RateLimit-*`

---

## Types de serveurs supportés

- `apache` : Génère `.htaccess`
- `nginx` : Génère `nginx-ai-shield.conf`
- `nodejs` : Génère `headers.js` (Express.js)
- `nextjs` : Génère `next.config.js`


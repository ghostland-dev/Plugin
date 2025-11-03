import axios from 'axios';

// Détecter automatiquement l'URL de l'API
// Sur Vercel, utiliser l'URL actuelle pour les API routes (même domaine)
// En local, utiliser l'URL du backend
const getApiUrl = () => {
  // Si une URL est explicitement définie dans les variables d'environnement
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim();
    // Si l'URL se termine par /api, la retirer car on l'ajoute dans les routes
    return url.endsWith('/api') ? url.slice(0, -4) : url;
  }
  
  // Si on est sur Vercel (même domaine), utiliser le chemin relatif
  // Les routes API sont au même domaine que le frontend
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('vercel.app') || hostname.includes('vercel.com') || hostname.includes('vercel.sh')) {
      return window.location.origin;
    }
  }
  
  // En développement local, utiliser le backend sur le port 3001
  return 'http://localhost:3001';
};

const API_URL = getApiUrl();

console.log('🔗 API URL configurée:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 secondes pour les requêtes longues (génération de ZIP)
});

// Intercepteur de requêtes pour logging (en développement)
if (import.meta.env.DEV) {
  api.interceptors.request.use((config) => {
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  });
  
  api.interceptors.response.use(
    (response) => {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
      return response;
    },
    (error) => {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.status || error.message);
      return Promise.reject(error);
    }
  );
}

export const createPaymentSession = async (data) => {
  const response = await api.post('/api/payment/create-session', data);
  return response.data;
};

export const confirmPayment = async (sessionId, paymentIntentId) => {
  const response = await api.post('/api/payment/confirm', { 
    session_id: sessionId,
    payment_intent_id: paymentIntentId 
  });
  return response.data;
};

export const downloadPack = async (sessionId) => {
  const response = await api.get(`/api/payment/download/${sessionId}`, {
    responseType: 'blob'
  });
  return response.data;
};

export default api;

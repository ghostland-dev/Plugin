import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentSession } from '../utils/api';
import ServerIcon from './ServerIcon';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export default function PaymentForm({ onSuccess }) {
  const [serverType, setServerType] = useState('');
  const [domain, setDomain] = useState('');
  const [includeLegal, setIncludeLegal] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adBlockerDetected, setAdBlockerDetected] = useState(false);

  // Détecter l'adblocker au chargement du composant
  useEffect(() => {
    let timeoutId;
    
    if (typeof window !== 'undefined') {
      // Attendre un peu pour voir si Stripe se charge
      timeoutId = setTimeout(async () => {
        try {
          const stripe = await stripePromise;
          if (!stripe) {
            setAdBlockerDetected(true);
          }
        } catch (err) {
          // Si on ne peut pas charger Stripe, c'est probablement un adblocker
          if (err.message && (
            err.message.includes('Failed to fetch') ||
            err.message.includes('ERR_BLOCKED') ||
            err.message.includes('network')
          )) {
            setAdBlockerDetected(true);
          }
        }
      }, 2000);
    }

    // Nettoyer le timeout si le composant est démonté
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!serverType) {
      setError('Veuillez sélectionner un type de serveur');
      setLoading(false);
      return;
    }

    try {
      // Créer la session de paiement
      const response = await createPaymentSession({
        server_type: serverType,
        domain: domain || undefined,
        include_legal: includeLegal,
        email: email || undefined,
      });

      // Rediriger vers Stripe Checkout
      try {
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Stripe non configuré. Vérifiez votre clé publique Stripe.');
        }

        const { error: stripeError } = await stripe.redirectToCheckout({
          sessionId: response.sessionId,
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }
      } catch (stripeErr) {
        // Détecter si Stripe est bloqué par un AdBlocker
        const isAdBlockerError = stripeErr.message && (
          stripeErr.message.includes('Failed to fetch') ||
          stripeErr.message.includes('ERR_BLOCKED_BY_ADBLOCKER') ||
          stripeErr.message.includes('ERR_BLOCKED') ||
          stripeErr.message.includes('network') ||
          stripeErr.message.includes('blocked') ||
          stripeErr.message.includes('CORS') ||
          stripeErr.name === 'TypeError' && stripeErr.message.includes('fetch')
        );

        if (isAdBlockerError) {
          setAdBlockerDetected(true);
          throw new Error('Stripe semble être bloqué par un bloqueur de publicité. Veuillez désactiver votre bloqueur de publicité pour ce site pour effectuer le paiement.');
        }
        throw stripeErr;
      }
    } catch (err) {
      console.error('Erreur paiement:', err);
      setError(err.message || 'Une erreur est survenue');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avertissement AdBlocker */}
      {adBlockerDetected && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg animate-slide-down">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="font-bold text-yellow-800 dark:text-yellow-300 mb-2">
                Bloqueur de publicité détecté
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
                Votre bloqueur de publicité bloque les scripts de paiement Stripe. Pour effectuer un paiement, vous devez désactiver temporairement votre bloqueur de publicité.
              </p>
              <div className="bg-yellow-100 dark:bg-yellow-900/40 p-3 rounded text-xs text-yellow-800 dark:text-yellow-300">
                <strong className="block mb-1">Instructions :</strong>
                <ul className="list-disc list-inside space-y-1">
                  <li>Cliquez sur l'icône de votre bloqueur de publicité dans la barre d'adresse</li>
                  <li>Désactivez-le temporairement pour ce site</li>
                  <li>Rafraîchissez la page et réessayez</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <span className="text-base font-semibold">Type de serveur *</span>
          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">Sélectionnez le type de serveur web que vous utilisez</span>
          {error === 'Veuillez sélectionner un type de serveur' && (
            <span className="block text-xs text-red-600 dark:text-red-400 mt-2 animate-pulse">
              ⚠️ Ce champ est obligatoire
            </span>
          )}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'apache', label: 'Apache', color: 'from-red-500 to-orange-500' },
            { value: 'nginx', label: 'Nginx', color: 'from-green-500 to-emerald-500' },
            { value: 'nodejs', label: 'Node.js', color: 'from-green-600 to-green-400' },
            { value: 'nextjs', label: 'Next.js', color: 'from-black to-gray-800' },
            { value: 'tomcat', label: 'Tomcat', color: 'from-yellow-500 to-orange-500' },
            { value: 'caddy', label: 'Caddy', color: 'from-blue-500 to-indigo-500' },
            { value: 'iis', label: 'IIS', color: 'from-blue-600 to-cyan-500' },
            { value: 'lighttpd', label: 'Lighttpd', color: 'from-yellow-400 to-amber-500' },
          ].map((server) => (
            <button
              key={server.value}
              type="button"
              onClick={() => {
                setServerType(server.value);
                // Effacer l'erreur si elle existe
                if (error === 'Veuillez sélectionner un type de serveur') {
                  setError('');
                }
              }}
              className={`
                p-4 border-2 rounded-xl transition-all transform hover:scale-105 flex flex-col items-center justify-center
                ${serverType === server.value
                  ? `border-primary-600 dark:border-primary-500 bg-gradient-to-br ${server.color} text-white shadow-lg dark:shadow-primary-500/30`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800 hover:shadow-md dark:hover:shadow-gray-900/50'
                }
                ${error === 'Veuillez sélectionner un type de serveur' ? 'ring-2 ring-red-500 dark:ring-red-400' : ''}
              `}
            >
              <div className="mb-2 flex items-center justify-center">
                <ServerIcon 
                  serverType={server.value} 
                  format="png" 
                  size="w-12 h-12"
                  className={serverType === server.value ? 'brightness-0 invert' : ''}
                />
              </div>
              <div className={`font-semibold text-sm ${serverType === server.value ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {server.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="domain" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nom de domaine (optionnel)
        </label>
        <input
          type="text"
          id="domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="exemple.com"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email (optionnel, pour recevoir le pack)
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="votre@email.com"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-500 dark:focus:border-primary-400 transition-colors"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="includeLegal"
          checked={includeLegal}
          onChange={(e) => setIncludeLegal(e.target.checked)}
          className="w-4 h-4 text-primary-600 dark:text-primary-400 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:focus:ring-primary-400 bg-white dark:bg-gray-700"
        />
        <label htmlFor="includeLegal" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
          Inclure la clause légale
        </label>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 animate-slide-down">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <strong className="block mb-1">Erreur :</strong>
              <p className="text-sm">{error}</p>
              {error.includes('bloqué') && (
                <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/40 rounded text-xs text-red-800 dark:text-red-300">
                  <strong className="block mb-2">Comment résoudre :</strong>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Cliquez sur l'icône de votre bloqueur de publicité (AdBlock, uBlock Origin, etc.) dans la barre d'outils du navigateur</li>
                    <li>Désactivez-le temporairement pour ce site ou ajoutez ce site à la liste blanche</li>
                    <li>Rafraîchissez la page</li>
                    <li>Réessayez le paiement</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !serverType}
        className="w-full bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-500 dark:to-purple-500 text-white py-4 px-6 rounded-xl font-bold hover:from-primary-700 hover:to-purple-700 dark:hover:from-primary-600 dark:hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl dark:shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Redirection vers le paiement...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <ServerIcon serverType="apache" format="svg" size="w-5 h-5 mr-2" className="brightness-0 invert" />
            Protéger mon site maintenant - 5 €
          </span>
        )}
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Paiement sécurisé par Stripe • Paiement unique de 5 €
      </p>
    </form>
  );
}

